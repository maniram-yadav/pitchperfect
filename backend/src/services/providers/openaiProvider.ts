import { AIProvider } from '../../types/aiProvider';
import { EmailGenerationInput, Email, SequenceEmail } from '../../types/index';
import { logger } from '../../utils/logger';
import {
  buildEmailPrompt,
  buildSequencePrompt,
  buildCustomEmailPrompt,
  buildCustomSequencePrompt,
  SYSTEM_PROMPT_EMAIL,
  SYSTEM_PROMPT_SEQUENCE,
} from './emailPrompts';

export class OpenAIProvider implements AIProvider {
  name = 'openai';
  private apiKey: string;
  private model: string;
  private temperature: number;

  constructor(apiKey: string, model: string = 'gpt-4o', temperature: number = 0.7) {
    this.apiKey = apiKey;
    this.model = model;
    this.temperature = temperature;
  }

  async generateEmails(input: EmailGenerationInput): Promise<Email[]> {
    const prompt = input.useCustomInput && input.customPrompt
      ? buildCustomEmailPrompt(input)
      : buildEmailPrompt(input);

    const variations = Math.min(Math.max(input.variations || 1, 1), 3);
    const maxTokens = variations * 1500;

    logger.debug('OpenAI generateEmails request', { model: this.model, variations, maxTokens });
    logger.debug('OpenAI generateEmails input', prompt);

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            {
              role: 'system',
              content: SYSTEM_PROMPT_EMAIL,
            },
            { role: 'user', content: prompt },
          ],
          temperature: this.temperature,
          max_tokens: maxTokens,
          response_format: { type: 'json_object' },
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        logger.error('OpenAI API HTTP error', { status: response.status, body: errorText });
        throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
      }

      const data = (await response.json()) as any;
      const content = data.choices[0].message.content;
      logger.debug('OpenAI raw response received', { contentLength: content.length });

      return this.parseEmailsFromResponse(content, input.variations);
    } catch (error) {
      logger.error('OpenAI generateEmails failed', { error });
      throw error;
    }
  }

  async generateSequence(input: EmailGenerationInput): Promise<SequenceEmail[]> {
    const prompt = input.useCustomInput && input.customPrompt
      ? buildCustomSequencePrompt(input)
      : buildSequencePrompt(input);

    logger.debug('OpenAI generateSequence request', { model: this.model });

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            {
              role: 'system',
              content: SYSTEM_PROMPT_SEQUENCE,
            },
            { role: 'user', content: prompt },
          ],
          temperature: this.temperature,
          max_tokens: 4000,
          response_format: { type: 'json_object' },
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        logger.error('OpenAI API HTTP error', { status: response.status, body: errorText });
        throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
      }

      const data = (await response.json()) as any;
      const content = data.choices[0].message.content;
      logger.debug('OpenAI sequence raw response received', { contentLength: content.length });

      return this.parseSequenceFromResponse(content);
    } catch (error) {
      logger.error('OpenAI generateSequence failed', { error });
      throw error;
    }
  }

  private sanitizeJson(raw: string): string {
    // Strip markdown code fences if present
    const stripped = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/i, '').trim();
    return stripped.replace(
      /"((?:[^"\\]|\\.)*)"/gs,
      (_match, inner) => {
        const fixed = inner
          .replace(/\n/g, '\\n')
          .replace(/\r/g, '\\r')
          .replace(/\t/g, '\\t');
        return `"${fixed}"`;
      }
    );
  }

  private parseEmailsFromResponse(content: string, variations: number): Email[] {
    try {
      const sanitized = this.sanitizeJson(content);
      const parsed = JSON.parse(sanitized);

      const emails: any[] = parsed.emails ?? parsed;
      if (!Array.isArray(emails)) {
        throw new Error('Expected emails array in response');
      }

      logger.debug('Parsed emails', { count: emails.length });
      return emails.slice(0, variations).map((email: any, index: number) => ({
        subject: email.subject || email.Subject || '',
        body: email.body || email.Body || '',
        variation: index + 1,
      }));
    } catch (error) {
      logger.error('Failed to parse OpenAI email response', { error, content });
      throw new Error('Failed to parse email generation response');
    }
  }

  private parseSequenceFromResponse(content: string): SequenceEmail[] {
    try {
      const sanitized = this.sanitizeJson(content);
      const parsed = JSON.parse(sanitized);

      const sequence: any[] = parsed.sequence ?? parsed;
      if (!Array.isArray(sequence)) {
        throw new Error('Expected sequence array in response');
      }

      logger.debug('Parsed sequence', { steps: sequence.length });
      return sequence.map((email: any) => ({
        day: email.day || email.Day || 1,
        subject: email.subject || email.Subject || '',
        body: email.body || email.Body || '',
      }));
    } catch (error) {
      logger.error('Failed to parse OpenAI sequence response', { error, content });
      throw new Error('Failed to parse sequence generation response');
    }
  }
}
