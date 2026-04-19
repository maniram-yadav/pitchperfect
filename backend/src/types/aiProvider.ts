import { EmailGenerationInput, Email, SequenceEmail } from './index';

export interface AIProviderConfig {
  provider: 'openai' | 'mock';
  apiKey?: string;
  model?: string;
  temperature?: number;
}

export interface AIGenerationResult {
  emails: Email[];
  sequence?: SequenceEmail[];
  provider: string;
}

export interface AIProvider {
  name: string;
  generateEmails(input: EmailGenerationInput): Promise<Email[]>;
  generateSequence(input: EmailGenerationInput): Promise<SequenceEmail[]>;
}
