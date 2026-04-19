import { EmailGenerationInput, Email, SequenceEmail, ApiResponse } from '../types/index';
import { EmailGenerationModel } from '../models/EmailGeneration';
import { tokenService } from './authService';
import { EMAIL_TOKENS } from '../utils/constants';
import { config } from '../config/env';
import { AIProviderFactory } from './aiProviderFactory';

// Initialize AI provider based on configuration
const aiProvider = AIProviderFactory.createProvider(config.aiProvider);

export const emailGenerationService = {
  async generateEmails(userId: string, input: EmailGenerationInput): Promise<ApiResponse<any>> {
    try {
      // Check token balance
      const tokenCheckResult = await tokenService.getUserTokens(userId);
      if (!tokenCheckResult.success || !tokenCheckResult.data) {
        return {
          success: false,
          message: 'Failed to check token balance',
        };
      }

      const tokensRequired = input.generateSequence
        ? EMAIL_TOKENS.sequence
        : EMAIL_TOKENS.single;

      if (tokenCheckResult.data < tokensRequired) {
        return {
          success: false,
          message: 'Insufficient tokens',
          error: `This operation requires ${tokensRequired} tokens but you only have ${tokenCheckResult.data}`,
        };
      }

      // Deduct tokens
      await tokenService.deductTokens(userId, tokensRequired);

      // Generate emails with AI provider
      const emails = await aiProvider.generateEmails(input);

      // Generate sequence if requested
      let sequence: SequenceEmail[] | undefined;
      if (input.generateSequence) {
        sequence = await aiProvider.generateSequence(input);
      }

      // Save to database
      const emailGeneration = new EmailGenerationModel({
        userId,
        inputParams: input,
        generatedOutput: {
          emails,
          sequence,
        },
        tokensUsed: tokensRequired,
        provider: aiProvider.name,
      });

      await emailGeneration.save();

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
      return {
        success: false,
        message: 'Email generation failed',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  },

  async getGenerationHistory(userId: string, limit: number = 10): Promise<ApiResponse<any>> {
    try {
      const generations = await EmailGenerationModel.find({ userId })
        .sort({ createdAt: -1 })
        .limit(limit);

      return {
        success: true,
        message: 'Generation history retrieved',
        data: generations,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to fetch history',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  },

  async getGenerationById(userId: string, generationId: string): Promise<ApiResponse<any>> {
    try {
      const generation = await EmailGenerationModel.findOne({
        _id: generationId,
        userId,
      });

      if (!generation) {
        return {
          success: false,
          message: 'Generation not found',
        };
      }

      return {
        success: true,
        message: 'Generation retrieved',
        data: generation,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to fetch generation',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  },
};
