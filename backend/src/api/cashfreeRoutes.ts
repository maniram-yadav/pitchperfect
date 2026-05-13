import { Router, Request, Response } from 'express';
import { verifyToken } from '../middleware/auth';
import { paymentService } from '../services/paymentService';
import { UserModel } from '../models/User';
import { config } from '../config/env';
import { logger } from '../utils/logger';
import { PLAN_TOKENS, PAID_PLAN_NAMES } from '../utils/constants';
import { createCashfreeOrder } from '../utils/cashfreeClient';
import { pgTransactionRepo } from '../models/PgTransaction';

const router = Router();

/**
 * POST /api/cashfree/initiate  (protected — requires JWT)
 *
 * Creates a Postgres transaction and a Cashfree order server-side.
 * Returns the payment_session_id for the frontend SDK to open checkout.
 *
 * Body: { plan, amount, phone, idempotencyKey? }
 *
 * Response:
 *   {
 *     sessionId: "payment_session_id",   ← passed to Cashfree SDK
 *     orderId:   "transaction-uuid",     ← our internal UUID used as CF order_id
 *     transactionId: "transaction-uuid",
 *     mode: "sandbox" | "production"
 *   }
 *
 * The frontend loads the Cashfree JS SDK and calls:
 *   cashfree.checkout({ paymentSessionId: sessionId, redirectTarget: "_self" })
 */
router.post('/initiate', verifyToken, async (req: Request, res: Response): Promise<void> => {
  const userId = req.user?.userId;
  logger.info('POST /api/cashfree/initiate', { userId, plan: req.body.plan });

  try {
    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const { plan, amount, phone, idempotencyKey } = req.body;

    if (!plan || !amount || !phone) {
      res.status(400).json({ success: false, message: 'plan, amount, and phone are required' });
      return;
    }

    if (!(PAID_PLAN_NAMES as readonly string[]).includes(plan)) {
      res.status(400).json({
        success: false,
        message: `Invalid plan. Must be one of: ${PAID_PLAN_NAMES.join(', ')}`,
      });
      return;
    }

    if (!config.cashfree.appId || !config.cashfree.secretKey) {
      logger.error('Cashfree credentials not configured');
      res.status(500).json({ success: false, message: 'Payment gateway not configured' });
      return;
    }
    logger.debug('Cashfree initiate config check passed', {
      appIdSet: config.cashfree.appId.substring(0, 6),
      secretKeySet: config.cashfree.secretKey.substring(0, 15),
    });
    const user = await UserModel.findById(userId);
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }
    logger.debug('Cashfree initiate user found', { userId, email: user.email });

    // Create or retrieve the internal transaction (idempotent)
    const txnResult = await paymentService.initiatePayment(userId, plan, amount, idempotencyKey);
    if (!txnResult.success || !txnResult.data) {
      res.status(400).json(txnResult);
      return;
    }
    logger.debug('Cashfree initiate txnResult=%j', txnResult.data);
    const transactionId: string = txnResult.data.transactionId;
    const amountNum = parseFloat(amount.toString());

    const planKey = plan as keyof typeof PLAN_TOKENS;
    const orderNote = `PitchPerfect ${plan.charAt(0).toUpperCase() + plan.slice(1)} Plan - ${PLAN_TOKENS[planKey]} Tokens`;

    // Cashfree replaces {order_id} at redirect time; we also pass txn for safe lookup
    const returnUrl =
      `${config.backendUrl}/api/cashfree/callback` +
      `?txn=${encodeURIComponent(transactionId)}&order_id={order_id}`;
      

    const notifyUrl = `${config.backendUrl}/api/webhook/cashfree`;
    logger.debug('Cashfree initiate returnUrl=%s notifyUrl=%s', returnUrl, notifyUrl);

    // We use our transaction UUID as the Cashfree order_id (36 chars, valid format)
    const cfOrder = await createCashfreeOrder({
      order_id: transactionId,
      order_amount: amountNum,
      order_currency: 'INR',
      customer_details: {
        customer_id: userId,
        customer_name: user.name,
        customer_email: user.email,
        customer_phone: String(phone),
      },
      order_meta: {
        return_url: returnUrl,
        notify_url: notifyUrl,
      },
      order_note: orderNote,
    });

    // Stamp gateway = 'cashfree' so the poller can identify this transaction
    await pgTransactionRepo.updateStatus(transactionId, 'pending', { gateway: 'cashfree' });

    logger.info('Cashfree order created', {
      userId,
      transactionId,
      plan,
      cfOrderId: cfOrder.cf_order_id,
    });

    res.status(200).json({
      success: true,
      message: 'Cashfree payment initiated',
      data: {
        sessionId: cfOrder.payment_session_id,
        orderId: cfOrder.order_id,
        transactionId,
        mode: config.cashfree.sandboxMode ? 'sandbox' : 'production',
      },
    });
  } catch (error) {
    logger.error('Cashfree initiate error', { userId, error });
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

/**
 * GET /api/cashfree/callback  (public — set as return_url in Cashfree order)
 *
 * Cashfree redirects the user's browser here after payment (success or failure).
 * We verify the actual order status via Cashfree API — never trust browser params.
 *
 * Query: { txn: transactionId, order_id: cashfreeOrderId }
 */
router.get('/callback', async (req: Request, res: Response): Promise<void> => {
  const query = req.query as Record<string, string>;
  const order_id = query.order_id;
  // txn is a legacy fallback; since order_id === our transaction UUID, it works as both
  const transactionId = query.txn || order_id;
  const frontendBase = config.frontendUrl;

  logger.info('Cashfree callback', { transactionId, order_id });

  try {
    if (!order_id) {
      res.redirect(`${frontendBase}/payment-failure?error=missing_params`);
      return;
    }

    const result = await paymentService.processCashfreeCallback(
      transactionId,
      order_id,
      req.ip
    );

    if (!result.success) {
      logger.warn('Cashfree callback processing failed', {
        transactionId,
        reason: result.message,
      });
      res.redirect(
        `${frontendBase}/payment-failure` +
        `?txnid=${encodeURIComponent(transactionId)}` +
        `&error=${encodeURIComponent(result.message)}`
      );
      return;
    }

    const { status } = result.data as { status: string };

    if (status === 'success') {
      res.redirect(
        `${frontendBase}/payment-success` +
        `?txnid=${encodeURIComponent(transactionId)}&status=success`
      );
    } else {
      res.redirect(
        `${frontendBase}/payment-failure` +
        `?txnid=${encodeURIComponent(transactionId)}&error=payment_${status}`
      );
    }
  } catch (error) {
    logger.error('Cashfree callback error', { transactionId, error });
    res.redirect(`${frontendBase}/payment-failure?error=server_error`);
  }
});

export default router;
