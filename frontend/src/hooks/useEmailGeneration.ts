import { useState } from 'react';
import { emailAPI } from '../lib/api';
import { EmailGenerationInput, Email, SequenceEmail } from '../types/index';
import { useEmailStore } from '../lib/emailStore';
import { useAuthStore } from '../lib/authStore';

export interface GeneratedEmailsResponse {
  emails: Email[];
  sequence?: SequenceEmail[];
  tokensUsed: number;
  provider: string;
}

export const useEmailGeneration = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedEmails, setGeneratedEmails] = useState<GeneratedEmailsResponse | null>(null);
  const { addGeneration } = useEmailStore();
  const { deductTokens } = useAuthStore();

  const generateEmails = async (input: EmailGenerationInput): Promise<GeneratedEmailsResponse> => {
    setLoading(true);
    setError(null);
    setGeneratedEmails(null);

    try {
      const result = await emailAPI.generateEmails(input);

      if (!result.success) {
        throw new Error(result.message || 'Failed to generate emails');
      }

      const generatedData: GeneratedEmailsResponse = {
        emails: result.data.emails,
        sequence: result.data.sequence,
        tokensUsed: result.data.tokensUsed,
        provider: result.data.provider || 'openai',
      };

      setGeneratedEmails(generatedData);
      deductTokens(result.data.tokensUsed);

      addGeneration({
        _id: result.data.generationId,
        userId: '',
        inputParams: input,
        generatedOutput: {
          emails: result.data.emails,
          sequence: result.data.sequence,
        },
        tokensUsed: result.data.tokensUsed,
        createdAt: new Date().toISOString(),
      });

      return generatedData;
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        (err instanceof Error ? err.message : 'Unknown error');
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    generateEmails,
    loading,
    error,
    generatedEmails,
  };
};
