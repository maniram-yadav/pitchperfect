import { AIProvider } from '../../types/aiProvider';
import { EmailGenerationInput, Email, SequenceEmail } from '../../types/index';

export class OpenAIProvider implements AIProvider {
  name = 'openai';
  private apiKey: string;
  private model: string;
  private temperature: number;

  constructor(apiKey: string, model: string = 'gpt-4', temperature: number = 0.7) {
    this.apiKey = apiKey;
    this.model = model;
    this.temperature = temperature;
  }

  async generateEmails(input: EmailGenerationInput): Promise<Email[]> {
    try {
      const prompt = this.buildEmailPrompt(input);
      
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
              content: 'You are an expert cold email copywriter. Generate compelling, personalized cold emails that convert.',
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          temperature: this.temperature,
          max_tokens: 2000,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.statusText}`);
      }

      const data = (await response.json()) as any;
      const content = data.choices[0].message.content;

      return this.parseEmailsFromResponse(content, input.variations);
    } catch (error) {
      console.error('OpenAI API error:', error);
      throw error;
    }
  }

  async generateSequence(input: EmailGenerationInput): Promise<SequenceEmail[]> {
    try {
      const prompt = this.buildSequencePrompt(input);

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
              content: 'You are an expert email sequence strategist. Create a compelling email sequence that maximizes engagement and conversions.',
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          temperature: this.temperature,
          max_tokens: 3000,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.statusText}`);
      }

      const data = (await response.json()) as any;
      const content = data.choices[0].message.content;

      return this.parseSequenceFromResponse(content);
    } catch (error) {
      console.error('OpenAI API error:', error);
      throw error;
    }
  }

  private buildEmailPrompt(input: EmailGenerationInput): string {
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

Email Tone: ${input.tone || 'professional yet friendly'}

Requirements:
- Each email should be unique and compelling
- Keep subjects under 60 characters
- Keep bodies concise (50-100 words)
- Include a clear call-to-action
- Personalize when possible
- Format as JSON array with {subject, body} objects

Return ONLY valid JSON array, no other text.`;
  }

  private buildSequencePrompt(input: EmailGenerationInput): string {
    return `Create a 4-email cold outreach sequence for:

Sender: ${input.senderName} from ${input.senderCompany} (${input.senderRole})
Target: ${input.targetRole} in ${input.targetIndustry} industry
Pain Points: ${input.painPoints?.join(', ') || 'Various challenges'}
Value Prop: ${input.valueProposition}

Sequence should:
- Day 1: Initial value-driven outreach
- Day 3: Provide additional value/social proof
- Day 7: Different angle, raise urgency
- Day 14: Final attempt with new angle

Format as JSON array with {day, subject, body} objects.
Return ONLY valid JSON array, no other text.`;
  }

  private parseEmailsFromResponse(content: string, variations: number): Email[] {
    try {
      // Extract JSON from response
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        throw new Error('No JSON array found in response');
      }

      const parsed = JSON.parse(jsonMatch[0]);
      return parsed.slice(0, variations).map((email: any, index: number) => ({
        subject: email.subject || email.Subject || '',
        body: email.body || email.Body || '',
        variation: index + 1,
      }));
    } catch (error) {
      console.error('Failed to parse OpenAI response:', error);
      throw new Error('Failed to parse email generation response');
    }
  }

  private parseSequenceFromResponse(content: string): SequenceEmail[] {
    try {
      // Extract JSON from response
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        throw new Error('No JSON array found in response');
      }

      const parsed = JSON.parse(jsonMatch[0]);
      return parsed.map((email: any) => ({
        day: email.day || email.Day || 1,
        subject: email.subject || email.Subject || '',
        body: email.body || email.Body || '',
      }));
    } catch (error) {
      console.error('Failed to parse OpenAI response:', error);
      throw new Error('Failed to parse sequence generation response');
    }
  }
}
