import crypto from 'crypto';
import { ApiResponse } from '../types/index';
import { pgTransactionRepo } from '../models/PgTransaction';
import { UserModel } from '../models/User';
import { PLAN_TOKENS } from '../utils/constants';
import { TransactionStatus, WebhookPayload, PaidPlanName } from '../types/transaction';
import { verifyPayuResponseHash, txnidToUuid } from '../utils/payuHash';
import { config } from '../config/env';

const TERMINAL_STATUSES: TransactionStatus[] = ['success', 'refunded', 'cancelled'];

export const paymentService = {
  async initiatePayment(
    userId: string,
    plan: PaidPlanName,
    amount: number,
    idempotencyKey?: string
  ): Promise<ApiResponse<any>> {
    try {
      // Use caller-supplied key or generate a collision-resistant one
      const key = idempotencyKey ?? `${userId}_${plan}_${crypto.randomUUID()}`;

      // Check for an existing transaction with this idempotency key
      const existing = await pgTransactionRepo.findByIdempotencyKey(key);
      if (existing) {
        return {
          success: true,
          message: 'Payment already initiated',
          data: {
            transactionId: existing.id,
            idempotencyKey: existing.idempotency_key,
            gatewayOrderId: existing.gateway_order_id,
            amount: existing.amount,
            currency: existing.currency,
            plan: existing.plan,
            status: existing.status,
          },
        };
      }

      const transaction = await pgTransactionRepo.create({
        idempotency_key: key,
        user_id: userId,
        plan,
        amount,
        tokens_added: PLAN_TOKENS[plan],
        metadata: { initiated_at: new Date().toISOString() },
      });

      return {
        success: true,
        message: 'Payment initiated',
        data: {
          transactionId: transaction.id,
          idempotencyKey: transaction.idempotency_key,
          gatewayOrderId: transaction.gateway_order_id,
          amount: transaction.amount,
          currency: transaction.currency,
          plan: transaction.plan,
          status: transaction.status,
        },
      };
    } catch (error) {
      return {
        success: false,
        message: 'Payment initiation failed',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  },

  async processWebhook(payload: WebhookPayload, sourceIp?: string): Promise<ApiResponse<any>> {
    try {
      // Locate the transaction by idempotency key or gateway order ID
      let transaction =
        payload.idempotency_key
          ? await pgTransactionRepo.findByIdempotencyKey(payload.idempotency_key)
          : null;

      if (!transaction && payload.gateway_order_id) {
        transaction = await pgTransactionRepo.findByGatewayOrderId(payload.gateway_order_id);
      }

      if (!transaction) {
        return { success: false, message: 'Transaction not found' };
      }

      // Record every incoming webhook event for auditability
      await pgTransactionRepo.appendWebhookEvent(transaction.id, {
        event: payload.event ?? `status.${payload.status}`,
        payload: payload as unknown as Record<string, unknown>,
        received_at: new Date().toISOString(),
        source_ip: sourceIp,
      });

      // Do not re-process terminal states
      if (TERMINAL_STATUSES.includes(transaction.status)) {
        return {
          success: true,
          message: `Transaction already in terminal state: ${transaction.status}`,
          data: { transactionId: transaction.id, status: transaction.status },
        };
      }

      const updated = await pgTransactionRepo.updateStatus(transaction.id, payload.status, {
        gateway_payment_id: payload.gateway_payment_id,
        gateway_signature: payload.gateway_signature,
        failure_reason: payload.failure_reason,
      });

      // Grant tokens to user only on a successful payment
      if (payload.status === 'success' && updated) {
        const user = await UserModel.findById(transaction.user_id);
        if (user) {
          user.tokens += transaction.tokens_added;
          user.plan = transaction.plan;
          await user.save();
        }
      }

      return {
        success: true,
        message: `Transaction status updated to ${payload.status}`,
        data: { transactionId: transaction.id, status: payload.status },
      };
    } catch (error) {
      return {
        success: false,
        message: 'Webhook processing failed',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  },

  async getTransactionHistory(userId: string): Promise<ApiResponse<any>> {
    try {
      const transactions = await pgTransactionRepo.findByUserId(userId);
      return {
        success: true,
        message: 'Transaction history retrieved',
        data: transactions,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to fetch transactions',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  },

  /**
   * Process a PayU callback or IPN response.
   * Verifies the reverse hash, finds the transaction via udf1 (our UUID),
   * updates its status, and grants tokens on success.
   * Called by both the browser-redirect callbacks and the server-to-server IPN routes.
   */
  async processPayuResponse(
    body: Record<string, string>,
    sourceIp?: string
  ): Promise<ApiResponse<any>> {
    try {
      const {
        key, txnid, amount, productinfo, firstname, email,
        udf1 = '', udf2 = '', udf3 = '', udf4 = '', udf5 = '',
        status, hash: receivedHash,
        mihpayid, error: errorCode, error_Message: errorMessage,
      } = body;

      if (!receivedHash) {
        return { success: false, message: 'Missing hash in PayU response' };
      }

      // Verify the response hash before trusting the status
      const isValid = verifyPayuResponseHash(
        {
          key: key ?? config.payu.merchantKey,
          txnid, amount, productinfo, firstname, email,
          udf1, udf2, udf3, udf4, udf5,
          status,
          salt: config.payu.merchantSalt,
        },
        receivedHash
      );

      if (!isValid) {
        return { success: false, message: 'PayU response hash verification failed' };
      }

      // Locate transaction: udf1 holds our internal UUID; fall back to txnid reconstruction
      const transactionId = udf1 || txnidToUuid(txnid);
      const transaction = await pgTransactionRepo.findById(transactionId);

      if (!transaction) {
        return { success: false, message: 'Transaction not found' };
      }

      // Record the event for the audit trail
      await pgTransactionRepo.appendWebhookEvent(transaction.id, {
        event: `payu.${status}`,
        payload: body as unknown as Record<string, unknown>,
        received_at: new Date().toISOString(),
        source_ip: sourceIp,
      });

      // Skip re-processing if already terminal
      if (TERMINAL_STATUSES.includes(transaction.status)) {
        return {
          success: true,
          message: `Transaction already in terminal state: ${transaction.status}`,
          data: { transactionId: transaction.id, status: transaction.status },
        };
      }

      const newStatus: TransactionStatus = status === 'success' ? 'success' : 'failed';

      await pgTransactionRepo.updateStatus(transaction.id, newStatus, {
        gateway_payment_id: mihpayid,
        failure_reason: errorMessage || errorCode || undefined,
      });

      if (newStatus === 'success') {
        const user = await UserModel.findById(transaction.user_id);
        if (user) {
          user.tokens += transaction.tokens_added;
          user.plan = transaction.plan;
          await user.save();
        }
      }

      return {
        success: true,
        message: `PayU payment ${status}`,
        data: { transactionId: transaction.id, status: newStatus, mihpayid },
      };
    } catch (error) {
      return {
        success: false,
        message: 'PayU response processing failed',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  },

  async getTransactionById(transactionId: string, userId: string): Promise<ApiResponse<any>> {
    try {
      const transaction = await pgTransactionRepo.findById(transactionId);

      if (!transaction) {
        return { success: false, message: 'Transaction not found' };
      }
      if (transaction.user_id !== userId) {
        return { success: false, message: 'Unauthorized' };
      }

      return { success: true, message: 'Transaction retrieved', data: transaction };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to fetch transaction',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  },
};
