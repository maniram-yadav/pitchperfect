import { Router, Request, Response } from 'express';
import { paymentService } from '../services/paymentService';
import { tokenService } from '../services/authService';
import { logger } from '../utils/logger';

const router = Router();

// POST /api/payment/initiate
router.post('/initiate', async (req: Request, res: Response): Promise<void> => {
  const userId = req.user?.userId;
  logger.info('POST /api/payment/initiate', { userId, plan: req.body.plan });
  try {
    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const { plan, amount } = req.body;

    if (!plan || !amount) {
      logger.warn('Payment initiate failed — missing plan or amount', { userId });
      res.status(400).json({ success: false, message: 'Plan and amount are required' });
      return;
    }

    if (!['starter', 'pro'].includes(plan)) {
      logger.warn('Payment initiate failed — invalid plan', { userId, plan });
      res.status(400).json({ success: false, message: 'Invalid plan' });
      return;
    }

    const result = await paymentService.initiatePayment(userId, plan, amount);
    logger.info('Payment initiate result', { userId, plan, success: result.success });
    res.status(result.success ? 200 : 400).json(result);
  } catch (error) {
    logger.error('Payment initiate error', { userId, error });
    res.status(500).json({ success: false, message: 'Server error', error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// POST /api/payment/success
router.post('/success', async (req: Request, res: Response): Promise<void> => {
  const userId = req.user?.userId;
  logger.info('POST /api/payment/success', { userId, paymentId: req.body.paymentId });
  try {
    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const { paymentId, transactionId } = req.body;

    if (!paymentId || !transactionId) {
      logger.warn('Payment success failed — missing IDs', { userId });
      res.status(400).json({ success: false, message: 'Payment ID and transaction ID are required' });
      return;
    }

    const result = await paymentService.handlePaymentSuccess(paymentId, transactionId);
    logger.info('Payment success result', { userId, paymentId, success: result.success });
    res.status(result.success ? 200 : 400).json(result);
  } catch (error) {
    logger.error('Payment success error', { userId, error });
    res.status(500).json({ success: false, message: 'Server error', error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// POST /api/payment/failure
router.post('/failure', async (req: Request, res: Response): Promise<void> => {
  logger.info('POST /api/payment/failure', { transactionId: req.body.transactionId });
  try {
    const { transactionId } = req.body;

    if (!transactionId) {
      logger.warn('Payment failure handler — missing transactionId');
      res.status(400).json({ success: false, message: 'Transaction ID is required' });
      return;
    }

    const result = await paymentService.handlePaymentFailure(transactionId);
    logger.info('Payment failure result', { transactionId, success: result.success });
    res.status(result.success ? 200 : 400).json(result);
  } catch (error) {
    logger.error('Payment failure error', { error });
    res.status(500).json({ success: false, message: 'Server error', error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// GET /api/payment/history
router.get('/history', async (req: Request, res: Response): Promise<void> => {
  const userId = req.user?.userId;
  logger.info('GET /api/payment/history', { userId });
  try {
    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const result = await paymentService.getTransactionHistory(userId);
    logger.debug('Payment history result', { userId, success: result.success });
    res.status(result.success ? 200 : 400).json(result);
  } catch (error) {
    logger.error('Payment history error', { userId, error });
    res.status(500).json({ success: false, message: 'Server error', error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// GET /api/tokens/balance
router.get('/tokens/balance', async (req: Request, res: Response): Promise<void> => {
  const userId = req.user?.userId;
  logger.info('GET /api/tokens/balance', { userId });
  try {
    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const result = await tokenService.getUserTokens(userId);
    logger.debug('Token balance result', { userId, tokens: result.data });
    res.status(result.success ? 200 : 400).json(result);
  } catch (error) {
    logger.error('Token balance error', { userId, error });
    res.status(500).json({ success: false, message: 'Server error', error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

export default router;
