import { Router, Request, Response } from 'express';
import { authService, passwordResetService } from '../services/authService';
import { validateEmail, validatePassword } from '../utils/security';
import { authLimiter } from '../middleware/rateLimiter';
import { verifyToken } from '../middleware/auth';
import { logger } from '../utils/logger';

const router = Router();

// POST /api/auth/signup
router.post('/signup', authLimiter, async (req: Request, res: Response): Promise<void> => {
  logger.info('POST /api/auth/signup', { email: req.body.email });
  try {
    const { name, email, password, confirmPassword } = req.body;

    if (!name || !email || !password) {
      logger.warn('Signup failed — missing fields', { email });
      res.status(400).json({ success: false, message: 'All fields are required' });
      return;
    }

    if (!validateEmail(email)) {
      logger.warn('Signup failed — invalid email', { email });
      res.status(400).json({ success: false, message: 'Invalid email format' });
      return;
    }

    if (!validatePassword(password)) {
      logger.warn('Signup failed — weak password', { email });
      res.status(400).json({ success: false, message: 'Password must be at least 8 characters with uppercase, lowercase, and number' });
      return;
    }

    if (password !== confirmPassword) {
      logger.warn('Signup failed — passwords do not match', { email });
      res.status(400).json({ success: false, message: 'Passwords do not match' });
      return;
    }

    const result = await authService.signup(name, email, password);
    logger.info('Signup result', { email, success: result.success });
    res.status(result.success ? 201 : 400).json(result);
  } catch (error) {
    logger.error('Signup error', { error });
    res.status(500).json({ success: false, message: 'Server error', error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// POST /api/auth/login
router.post('/login', authLimiter, async (req: Request, res: Response): Promise<void> => {
  logger.info('POST /api/auth/login', { email: req.body.email });
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      logger.warn('Login failed — missing credentials');
      res.status(400).json({ success: false, message: 'Email and password are required' });
      return;
    }

    const result = await authService.login(email, password);
    logger.info('Login result', { email, success: result.success });
    res.status(result.success ? 200 : 401).json(result);
  } catch (error) {
    logger.error('Login error', { error });
    res.status(500).json({ success: false, message: 'Server error', error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// GET /api/auth/profile
router.get('/profile', verifyToken, async (req: Request, res: Response): Promise<void> => {
  const userId = req.user?.userId;
  logger.info('GET /api/auth/profile', { userId });
  try {
    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const result = await authService.getUserProfile(userId);
    logger.debug('Get profile result', { userId, success: result.success });
    res.status(result.success ? 200 : 404).json(result);
  } catch (error) {
    logger.error('Get profile error', { userId, error });
    res.status(500).json({ success: false, message: 'Server error', error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// PUT /api/auth/profile
router.put('/profile', verifyToken, async (req: Request, res: Response): Promise<void> => {
  const userId = req.user?.userId;
  logger.info('PUT /api/auth/profile', { userId });
  try {
    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const { profile } = req.body;

    if (!profile || typeof profile !== 'object') {
      logger.warn('Update profile failed — invalid payload', { userId });
      res.status(400).json({ success: false, message: 'Profile data is required' });
      return;
    }

    const result = await authService.updateProfile(userId, profile);
    logger.info('Update profile result', { userId, success: result.success });
    res.status(result.success ? 200 : 400).json(result);
  } catch (error) {
    logger.error('Update profile error', { userId, error });
    res.status(500).json({ success: false, message: 'Server error', error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// POST /api/auth/forgot-password
router.post('/forgot-password', authLimiter, async (req: Request, res: Response): Promise<void> => {
  logger.info('POST /api/auth/forgot-password', { email: req.body.email });
  try {
    const { email } = req.body;

    if (!email || !validateEmail(email)) {
      res.status(400).json({ success: false, message: 'Valid email is required' });
      return;
    }

    const result = await passwordResetService.requestReset(email);
    res.status(200).json(result);
  } catch (error) {
    logger.error('Forgot password error', { error });
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// POST /api/auth/reset-password
router.post('/reset-password', authLimiter, async (req: Request, res: Response): Promise<void> => {
  logger.info('POST /api/auth/reset-password', { email: req.body.email });
  try {
    const { email, otp, newPassword, confirmPassword } = req.body;

    if (!email || !otp || !newPassword) {
      res.status(400).json({ success: false, message: 'Email, OTP, and new password are required' });
      return;
    }

    if (!validateEmail(email)) {
      res.status(400).json({ success: false, message: 'Invalid email format' });
      return;
    }

    if (!validatePassword(newPassword)) {
      res.status(400).json({ success: false, message: 'Password must be at least 8 characters with uppercase, lowercase, and number' });
      return;
    }

    if (newPassword !== confirmPassword) {
      res.status(400).json({ success: false, message: 'Passwords do not match' });
      return;
    }

    const result = await passwordResetService.resetPassword(email, otp, newPassword);
    res.status(result.success ? 200 : 400).json(result);
  } catch (error) {
    logger.error('Reset password error', { error });
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

export default router;
