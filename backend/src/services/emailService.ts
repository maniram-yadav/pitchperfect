import { EmailGenerationInput, SequenceEmail, ApiResponse } from '../types/index';
import { EmailGenerationModel } from '../models/EmailGeneration';
import { tokenService } from './authService';
import { EMAIL_TOKENS } from '../utils/constants';
import { config } from '../config/env';
import { AIProviderFactory } from './aiProviderFactory';
import { logger } from '../utils/logger';

const aiProvider = AIProviderFactory.createProvider(config.aiProvider);

export const emailGenerationService = {
  async generateEmails(userId: string, input: EmailGenerationInput): Promise<ApiResponse<any>> {
    logger.info('emailService.generateEmails start', { userId, useCustomInput: input.useCustomInput });
    try {
      const tokenCheckResult = await tokenService.getUserTokens(userId);
      if (!tokenCheckResult.success || tokenCheckResult.data === undefined || tokenCheckResult.data === null) {
        logger.warn('generateEmails — failed to check token balance', { userId });
        return { success: false, message: 'Failed to check token balance' };
      }

      const variations = Math.min(Math.max(input.variations || 1, 1), 3);
      const tokensRequired = input.generateSequence ? EMAIL_TOKENS.sequence : variations * EMAIL_TOKENS.single;
      logger.debug('generateEmails — token check', { userId, balance: tokenCheckResult.data, required: tokensRequired, variations });

      if (tokenCheckResult.data < tokensRequired) {
        logger.warn('generateEmails — insufficient tokens', { userId, balance: tokenCheckResult.data, required: tokensRequired });
        return {
          success: false,
          message: 'Insufficient tokens, Recharge your account to generate emails',
          error: `This operation requires ${tokensRequired} tokens but you only have ${tokenCheckResult.data}`,
        };
      }

      await tokenService.deductTokens(userId, tokensRequired);

      logger.debug('generateEmails — calling AI provider', { userId, provider: aiProvider.name });
      const emails = await aiProvider.generateEmails(input);
      logger.info('generateEmails — emails generated', { userId, count: emails.length });

      let sequence: SequenceEmail[] | undefined;
      if (input.generateSequence) {
        logger.debug('generateEmails — generating sequence', { userId });
        sequence = await aiProvider.generateSequence(input);
        logger.info('generateEmails — sequence generated', { userId, steps: sequence.length });
      }

      const emailGeneration = new EmailGenerationModel({
        userId,
        inputParams: input,
        generatedOutput: { emails, sequence },
        tokensUsed: tokensRequired,
        provider: aiProvider.name,
      });

      await emailGeneration.save();
      logger.info('generateEmails — saved to DB', { userId, generationId: emailGeneration._id });

      return {
        success: true,
        message: 'Emails generated successfully',
        data: {
          generationId: emailGeneration._id,
          emails,
          sequence,
          tokensUsed: tokensRequired,
          provider: aiProvider.name,
        },
      };
    } catch (error) {
      logger.error('emailService.generateEmails error', { userId, error });
      return { success: false, message: 'Email generation failed', error: error instanceof Error ? error.message : 'Unknown error' };
    }
  },

  async getGenerationHistory(userId: string, limit: number = 10): Promise<ApiResponse<any>> {
    logger.debug('emailService.getGenerationHistory', { userId, limit });
    try {
      const generations = await EmailGenerationModel.find({ userId })
        .sort({ createdAt: -1 })
        .limit(limit);

      logger.debug('getGenerationHistory — result', { userId, count: generations.length });
      return { success: true, message: 'Generation history retrieved', data: generations };
    } catch (error) {
      logger.error('emailService.getGenerationHistory error', { userId, error });
      return { success: false, message: 'Failed to fetch history', error: error instanceof Error ? error.message : 'Unknown error' };
    }
  },

  async getGenerationById(userId: string, generationId: string): Promise<ApiResponse<any>> {
    logger.debug('emailService.getGenerationById', { userId, generationId });
    try {
      const generation = await EmailGenerationModel.findOne({ _id: generationId, userId });

      if (!generation) {
        logger.warn('getGenerationById — not found', { userId, generationId });
        return { success: false, message: 'Generation not found' };
      }

      logger.debug('getGenerationById — found', { userId, generationId });
      return { success: true, message: 'Generation retrieved', data: generation };
    } catch (error) {
      logger.error('emailService.getGenerationById error', { userId, generationId, error });
      return { success: false, message: 'Failed to fetch generation', error: error instanceof Error ? error.message : 'Unknown error' };
    }
  },
};
