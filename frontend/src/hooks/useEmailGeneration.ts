import { useState } from 'react';
import { emailAPI } from '../lib/api';
import { EmailGenerationInput } from '../types/index';
import { useEmailStore } from '../lib/emailStore';

export const useEmailGeneration = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { addGeneration } = useEmailStore();

  const generateEmails = async (input: EmailGenerationInput) => {
    setLoading(true);
    setError(null);

    try {
      const result = await emailAPI.generateEmails(input);

      if (!result.success) {
        throw new Error(result.message || 'Failed to generate emails');
      }

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

      return result.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
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
  };
};
