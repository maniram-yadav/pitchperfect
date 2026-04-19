import { Router, Request, Response } from 'express';
import { paymentService } from '../services/paymentService';
import { tokenService } from '../services/authService';

const router = Router();

// POST /api/payment/initiate
router.post('/initiate', async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
      return;
    }

    const { plan, amount } = req.body;

    if (!plan || !amount) {
      res.status(400).json({
        success: false,
        message: 'Plan and amount are required',
      });
      return;
    }

    if (!['starter', 'pro'].includes(plan)) {
      res.status(400).json({
        success: false,
        message: 'Invalid plan',
      });
      return;
    }

    const result = await paymentService.initiatePayment(userId, plan, amount);
    res.status(result.success ? 200 : 400).json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// POST /api/payment/success
router.post('/success', async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
      return;
    }

    const { paymentId, transactionId } = req.body;

    if (!paymentId || !transactionId) {
      res.status(400).json({
        success: false,
        message: 'Payment ID and transaction ID are required',
      });
      return;
    }

    const result = await paymentService.handlePaymentSuccess(paymentId, transactionId);
    res.status(result.success ? 200 : 400).json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// POST /api/payment/failure
router.post('/failure', async (req: Request, res: Response): Promise<void> => {
  try {
    const { transactionId } = req.body;

    if (!transactionId) {
      res.status(400).json({
        success: false,
        message: 'Transaction ID is required',
      });
      return;
    }

    const result = await paymentService.handlePaymentFailure(transactionId);
    res.status(result.success ? 200 : 400).json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// GET /api/payment/history
router.get('/history', async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
      return;
    }

    const result = await paymentService.getTransactionHistory(userId);
    res.status(result.success ? 200 : 400).json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// GET /api/tokens/balance
router.get('/tokens/balance', async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
      return;
    }

    const result = await tokenService.getUserTokens(userId);
    res.status(result.success ? 200 : 400).json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;
