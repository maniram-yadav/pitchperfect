import { Router, Request, Response } from 'express';
import { emailGenerationService } from '../services/emailService';
import { generateEmailLimiter } from '../middleware/rateLimiter';
import { EmailGenerationInput } from '../types/index';

const router = Router();

// POST /api/email/generate
router.post(
  '/generate',
  generateEmailLimiter,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Unauthorized',
        });
        return;
      }

      const input: EmailGenerationInput = req.body;

      // Validation
      const requiredFields = [
        'senderName',
        'senderRole',
        'senderCompany',
        'targetIndustry',
        'targetRole',
        'painPoints',
        'tone',
        'length',
        'emailType',
        'ctaType',
        'variations',
      ];

      const missingFields = requiredFields.filter((field) => !(field in input));

      if (missingFields.length > 0) {
        res.status(400).json({
          success: false,
          message: `Missing required fields: ${missingFields.join(', ')}`,
        });
        return;
      }

      if (!Array.isArray(input.painPoints) || input.painPoints.length === 0) {
        res.status(400).json({
          success: false,
          message: 'At least one pain point is required',
        });
        return;
      }

      const result = await emailGenerationService.generateEmails(userId, input);
      res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Server error',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
);

// GET /api/email/history
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

    const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
    const result = await emailGenerationService.getGenerationHistory(userId, limit);
    res.status(result.success ? 200 : 400).json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// GET /api/email/:generationId
router.get('/:generationId', async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { generationId } = req.params;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
      return;
    }

    const result = await emailGenerationService.getGenerationById(userId, generationId);
    res.status(result.success ? 200 : 404).json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;
