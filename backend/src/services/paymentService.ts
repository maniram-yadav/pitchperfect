import { ApiResponse } from '../types/index';
import { TransactionModel } from '../models/Transaction';
import { UserModel } from '../models/User';
import { PLAN_TOKENS } from '../utils/constants';

interface RazorpayPayment {
  id: string;
  amount: number;
  status: string;
  notes?: Record<string, string>;
}

export const paymentService = {
  async initiatePayment(
    userId: string,
    plan: 'starter' | 'pro',
    amount: number
  ): Promise<ApiResponse<any>> {
    try {
      // TODO: Integrate with Razorpay API
      // For now, return mock response
      const paymentId = `pay_${Date.now()}`;

      const transaction = new TransactionModel({
        userId,
        amount,
        tokensAdded: PLAN_TOKENS[plan],
        plan,
        paymentId,
        status: 'pending',
      });

      await transaction.save();

      return {
        success: true,
        message: 'Payment initiated',
        data: {
          transactionId: transaction._id,
          paymentId,
          amount,
          orderId: `order_${Date.now()}`,
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

  async handlePaymentSuccess(
    paymentId: string,
    transactionId: string
  ): Promise<ApiResponse<any>> {
    try {
      const transaction = await TransactionModel.findById(transactionId);

      if (!transaction) {
        return {
          success: false,
          message: 'Transaction not found',
        };
      }

      // Update transaction status
      transaction.status = 'success';
      await transaction.save();

      // Add tokens to user
      const user = await UserModel.findById(transaction.userId);
      if (!user) {
        return {
          success: false,
          message: 'User not found',
        };
      }

      user.tokens += transaction.tokensAdded;
      user.plan = transaction.plan;
      await user.save();

      return {
        success: true,
        message: 'Payment successful and tokens added',
        data: {
          newTokenBalance: user.tokens,
          plan: user.plan,
        },
      };
    } catch (error) {
      return {
        success: false,
        message: 'Payment processing failed',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  },

  async handlePaymentFailure(transactionId: string): Promise<ApiResponse<any>> {
    try {
      const transaction = await TransactionModel.findById(transactionId);

      if (!transaction) {
        return {
          success: false,
          message: 'Transaction not found',
        };
      }

      transaction.status = 'failed';
      await transaction.save();

      return {
        success: true,
        message: 'Payment failure recorded',
        data: transaction,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to process payment failure',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  },

  async getTransactionHistory(userId: string): Promise<ApiResponse<any>> {
    try {
      const transactions = await TransactionModel.find({ userId })
        .sort({ createdAt: -1 });

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
};
