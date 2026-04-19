import { EmailGenerationInput, Email, SequenceEmail, ApiResponse } from '../types/index';
import { EmailGenerationModel } from '../models/EmailGeneration';
import { tokenService } from './authService';
import { EMAIL_TOKENS } from '../utils/constants';

// Mock AI response - Replace with actual OpenAI API call
const generateEmailsWithAI = async (input: EmailGenerationInput): Promise<Email[]> => {
  // TODO: Integrate with OpenAI API
  // For now, returning mock data
  const emails: Email[] = [];

  const mockSubjects = [
    `Quick question about ${input.targetIndustry}`,
    `${input.senderCompany} + ${input.targetIndustry} = 🚀`,
    `Worth a 15 min call?`,
    `Helping ${input.targetRole}s reduce ${input.painPoints[0] || 'complexity'}`,
  ];

  const mockBodies = [
    `Hi, I noticed you're in ${input.targetIndustry}. We help companies like yours with ${input.valueProposition}. Would love to chat about ${input.usp}. Free?`,
    `Quick thought - we've helped similar companies reduce time by 40%. Curious if you're open to a brief conversation?`,
    `${input.senderName} here from ${input.senderCompany}. Saw your profile and thought ${input.productDescription} might interest you.`,
    `Hey! Noticed you're focused on ${input.targetIndustry}. We solve this exact problem - ${input.valueProposition}. Chat?`,
  ];

  for (let i = 0; i < input.variations; i++) {
    emails.push({
      subject: mockSubjects[i % mockSubjects.length],
      body: mockBodies[i % mockBodies.length],
      variation: i + 1,
    });
  }

  return emails;
};

const generateSequence = (): SequenceEmail[] => {
  // TODO: Generate proper sequences based on input
  return [
    {
      day: 1,
      subject: 'Initial outreach',
      body: 'First email in sequence',
    },
    {
      day: 3,
      subject: 'Follow-up: Checking in',
      body: 'Second email with additional value prop',
    },
    {
      day: 7,
      subject: 'Final: Worth a quick call?',
      body: 'Last email with clear CTA',
    },
  ];
};

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

      // Generate emails with AI
      const emails = await generateEmailsWithAI(input);

      // Generate sequence if requested
      const sequence = input.generateSequence ? generateSequence() : undefined;

      // Save to database
      const emailGeneration = new EmailGenerationModel({
        userId,
        inputParams: input,
        generatedOutput: {
          emails,
          sequence,
        },
        tokensUsed: tokensRequired,
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
