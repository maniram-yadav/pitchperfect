import { AIProvider } from '../../types/aiProvider';
import { EmailGenerationInput, Email, SequenceEmail } from '../../types/index';
import { logger } from '../../utils/logger';

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
      ? this.buildCustomEmailPrompt(input)
      : this.buildEmailPrompt(input);

    
    logger.debug('OpenAI generateEmails request', { model: this.model, variations: input.variations });
    logger.debug('OpenAI generateEmails input', prompt );
    
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
              content: 'You are an expert cold email copywriter. Generate compelling, personalized cold emails. Always respond with valid JSON.',
            },
            { role: 'user', content: prompt },
          ],
          temperature: this.temperature,
          max_tokens: 2000,
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
      ? this.buildCustomSequencePrompt(input)
      : this.buildSequencePrompt(input);

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
              content: 'You are an expert email sequence strategist. Create compelling email sequences. Always respond with valid JSON.',
            },
            { role: 'user', content: prompt },
          ],
          temperature: this.temperature,
          max_tokens: 3000,
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

  private buildCustomEmailPrompt(input: EmailGenerationInput): string {
    return `${input.customPrompt}

Generate exactly ${input.variations} unique email variation${input.variations > 1 ? 's' : ''}.

Return a JSON object in this exact format:
{"emails": [{"subject": "...", "body": "..."}, ...]}`;
  }

  private buildCustomSequencePrompt(input: EmailGenerationInput): string {
    return `${input.customPrompt}

Create a 4-email sequence based on the above requirements.
Days should be: 1, 3, 7, 14.

Return a JSON object in this exact format:
{"sequence": [{"day": 1, "subject": "...", "body": "..."}, ...]}`;
  }

  private buildEmailPrompt(input: EmailGenerationInput): string {
    const userInstruction = input.customPrompt?.trim()
      ? `\nUser Instructions (apply these on top of the above):\n${input.customPrompt.trim()}\n`
      : '';

    return `Generate ${input.variations} unique, compelling cold email variations based on:

Sender Information:
- Name: ${input.senderName}
- Title: ${input.senderRole}
- Company: ${input.senderCompany}

Target Information:
- Industry: ${input.targetIndustry}
- Role: ${input.targetRole}
- Pain Points: ${input.painPoints?.join(', ') || 'N/A'}

Value Proposition:
- USP: ${input.usp}
- Value Proposition: ${input.valueProposition}
- Product Description: ${input.productDescription}

Email Tone: ${input.tone || 'professional'}
${userInstruction}
Requirements:
- Each email must be unique and compelling
- Subjects under 60 characters
- Body concise (50-100 words)
- Clear call-to-action

Return a JSON object in this exact format:
{"emails": [{"subject": "...", "body": "..."}, ...]}`;
  }

  private buildSequencePrompt(input: EmailGenerationInput): string {
    const userInstruction = input.customPrompt?.trim()
      ? `\nUser Instructions (apply these on top of the above):\n${input.customPrompt.trim()}\n`
      : '';

    return `Create a 4-email cold outreach sequence for:

Sender: ${input.senderName} from ${input.senderCompany} (${input.senderRole})
Target: ${input.targetRole} in ${input.targetIndustry} industry
Pain Points: ${input.painPoints?.join(', ') || 'Various challenges'}
Value Prop: ${input.valueProposition}
${userInstruction}
Sequence:
- Day 1: Initial value-driven outreach
- Day 3: Additional value/social proof
- Day 7: Different angle, raise urgency
- Day 14: Final attempt with new angle

Return a JSON object in this exact format:
{"sequence": [{"day": 1, "subject": "...", "body": "..."}, ...]}`;
  }

  private sanitizeJson(raw: string): string {
    // Escape unescaped control characters inside JSON string values
    return raw.replace(
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
