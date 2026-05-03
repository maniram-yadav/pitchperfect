import { Router, Request, Response } from 'express';
import { emailGenerationService } from '../services/emailService';
import { generateEmailLimiter } from '../middleware/rateLimiter';
import { EmailGenerationInput } from '../types/index';
import { logger } from '../utils/logger';

const router = Router();

// POST /api/email/generate
router.post(
  '/generate',
  generateEmailLimiter,
  async (req: Request, res: Response): Promise<void> => {
    const userId = req.user?.userId;
    logger.info('POST /api/email/generate', { userId });
    try {
      if (!userId) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      const input: EmailGenerationInput = req.body;
      logger.debug('Email generation input', { userId, useCustomInput: input.useCustomInput, emailType: input.emailType });

      if (input.useCustomInput) {
        if (!input.customPrompt || input.customPrompt.trim().length < 20) {
          logger.warn('Email generation failed — custom prompt too short', { userId });
          res.status(400).json({ success: false, message: 'Custom prompt must be at least 20 characters' });
          return;
        }
      } else if (input.emailPurpose === 'job_seeking') {
        const requiredFields = ['senderName', 'jobSeekerProfile', 'skills', 'jobTitle', 'tone', 'length', 'variations'];

        const missingFields = requiredFields.filter(
          (field) => !(field in input) || (input as any)[field] === '' || (input as any)[field] === undefined
        );

        if (missingFields.length > 0) {
          logger.warn('Email generation failed — missing job-seeking fields', { userId, missingFields });
          res.status(400).json({ success: false, message: `Missing required fields: ${missingFields.join(', ')}` });
          return;
        }
      } else {
        const requiredFields = [
          'senderName', 'senderRole', 'senderCompany',
          'targetIndustry', 'targetRole', 'painPoints',
          'tone', 'length', 'emailType', 'ctaType', 'variations',
        ];

        const missingFields = requiredFields.filter(
          (field) => !(field in input) || (input as any)[field] === '' || (input as any)[field] === undefined
        );

        if (missingFields.length > 0) {
          logger.warn('Email generation failed — missing fields', { userId, missingFields });
          res.status(400).json({ success: false, message: `Missing required fields: ${missingFields.join(', ')}` });
          return;
        }

        if (!Array.isArray(input.painPoints) || input.painPoints.length === 0) {
          logger.warn('Email generation failed — no pain points', { userId });
          res.status(400).json({ success: false, message: 'At least one pain point is required' });
          return;
        }
      }

      const result = await emailGenerationService.generateEmails(userId, input);
      logger.info('Email generation result', { userId, success: result.success });
      res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      logger.error('Email generation error', { userId, error });
      res.status(500).json({ success: false, message: 'Server error', error: error instanceof Error ? error.message : 'Unknown error' });
    }
  }
);

// GET /api/email/history
router.get('/history', async (req: Request, res: Response): Promise<void> => {
  const userId = req.user?.userId;
  logger.info('GET /api/email/history', { userId });
  try {
    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
    const result = await emailGenerationService.getGenerationHistory(userId, limit);
    logger.debug('History result', { userId, count: Array.isArray(result.data) ? result.data.length : 0 });
    res.status(result.success ? 200 : 400).json(result);
  } catch (error) {
    logger.error('Get history error', { userId, error });
    res.status(500).json({ success: false, message: 'Server error', error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// GET /api/email/:generationId
router.get('/:generationId', async (req: Request, res: Response): Promise<void> => {
  const userId = req.user?.userId;
  const { generationId } = req.params;
  logger.info('GET /api/email/:generationId', { userId, generationId });
  try {
    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const result = await emailGenerationService.getGenerationById(userId, generationId);
    logger.debug('Get generation result', { userId, generationId, success: result.success });
    res.status(result.success ? 200 : 404).json(result);
  } catch (error) {
    logger.error('Get generation error', { userId, generationId, error });
    res.status(500).json({ success: false, message: 'Server error', error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

export default router;
