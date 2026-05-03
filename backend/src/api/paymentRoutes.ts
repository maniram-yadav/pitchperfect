import { Router, Request, Response } from 'express';
import { paymentService } from '../services/paymentService';
import { tokenService } from '../services/authService';
import { logger } from '../utils/logger';
import { PAID_PLAN_NAMES } from '../utils/constants';

const router = Router();

// POST /api/payment/initiate
// Body: { plan, amount, idempotencyKey? }
// Creates a transaction in advance with an idempotency key.
// Re-sending the same idempotencyKey returns the existing transaction (safe retry).
router.post('/initiate', async (req: Request, res: Response): Promise<void> => {
  const userId = req.user?.userId;
  logger.info('POST /api/payment/initiate', { userId, plan: req.body.plan });
  try {
    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const { plan, amount, idempotencyKey } = req.body;

    if (!plan || !amount) {
      res.status(400).json({ success: false, message: 'plan and amount are required' });
      return;
    }

    if (!(PAID_PLAN_NAMES as readonly string[]).includes(plan)) {
      res.status(400).json({ success: false, message: `Invalid plan. Must be one of: ${PAID_PLAN_NAMES.join(', ')}` });
      return;
    }

    if (typeof amount !== 'number' || amount <= 0) {
      res.status(400).json({ success: false, message: 'amount must be a positive number' });
      return;
    }

    const result = await paymentService.initiatePayment(userId, plan, amount, idempotencyKey);
    logger.info('Payment initiation result', { userId, plan, success: result.success });
    res.status(result.success ? 200 : 400).json(result);
  } catch (error) {
    logger.error('Payment initiate error', { userId, error });
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/payment/history
// Returns all transactions for the authenticated user (newest first).
router.get('/history', async (req: Request, res: Response): Promise<void> => {
  const userId = req.user?.userId;
  logger.info('GET /api/payment/history', { userId });
  try {
    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const result = await paymentService.getTransactionHistory(userId);
    res.status(result.success ? 200 : 400).json(result);
  } catch (error) {
    logger.error('Payment history error', { userId, error });
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/payment/:id
// Returns a single transaction (must belong to the authenticated user).
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  const userId = req.user?.userId;
  const { id } = req.params;
  logger.info('GET /api/payment/:id', { userId, id });
  try {
    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const result = await paymentService.getTransactionById(id, userId);
    res.status(result.success ? 200 : result.message === 'Unauthorized' ? 403 : 404).json(result);
  } catch (error) {
    logger.error('Get transaction error', { userId, id, error });
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/payment/tokens/balance
router.get('/tokens/balance', async (req: Request, res: Response): Promise<void> => {
  const userId = req.user?.userId;
  logger.info('GET /api/payment/tokens/balance', { userId });
  try {
    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const result = await tokenService.getUserTokens(userId);
    res.status(result.success ? 200 : 400).json(result);
  } catch (error) {
    logger.error('Token balance error', { userId, error });
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

export default router;
