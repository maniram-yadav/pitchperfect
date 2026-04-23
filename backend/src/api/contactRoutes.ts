import { Router, Request, Response } from 'express';
import { notificationService } from '../services/notificationService';
import { validateEmail } from '../utils/security';
import { contactFormLimiter } from '../middleware/rateLimiter';
import { logger } from '../utils/logger';

const router = Router();

const VALID_SUBJECTS = ['general', 'billing', 'technical', 'feature', 'other'];

// POST /api/contact
router.post('/', contactFormLimiter, async (req: Request, res: Response): Promise<void> => {
  logger.info('POST /api/contact', { email: req.body.email });
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      res.status(400).json({ success: false, message: 'All fields are required' });
      return;
    }

    if (!validateEmail(email)) {
      res.status(400).json({ success: false, message: 'Invalid email format' });
      return;
    }

    if (!VALID_SUBJECTS.includes(subject)) {
      res.status(400).json({ success: false, message: 'Invalid subject' });
      return;
    }

    if (message.length > 2000) {
      res.status(400).json({ success: false, message: 'Message must be under 2000 characters' });
      return;
    }

    await notificationService.sendContactFormEmail(name.trim(), email.trim(), subject, message.trim());

    res.status(200).json({ success: true, message: 'Message sent successfully' });
  } catch (error) {
    logger.error('Contact form error', { error });
    res.status(500).json({
      success: false,
      message: 'Failed to send message. Please try again later.',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;
