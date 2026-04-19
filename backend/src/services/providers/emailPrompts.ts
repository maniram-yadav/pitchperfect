import { EmailGenerationInput } from '../../types/index';

// export const SYSTEM_PROMPT_EMAIL =
//   'You are an expert cold email copywriter. Generate compelling, personalized cold emails. Always respond with valid JSON.';
// export const SYSTEM_PROMPT_SEQUENCE =
//   'You are an expert email sequence strategist. Create compelling email sequences. Always respond with valid JSON.';

  export const SYSTEM_PROMPT_EMAIL = `Your task is to generate highly personalized, non-spammy, conversion-focused cold emails based strictly on the provided input parameters.
        ## CORE OBJECTIVES
        - Write emails that feel human, relevant, and tailored
        - Avoid generic or templated language
        - Focus on the recipient’s pain points, not the sender
        - Maximize reply rate (not just readability)
        ## INPUT PARAMETERS
        - Sender Name, Role, Company
        - Target Industry, Role, Pain Points
        - Value Proposition, USP, Product Description
        - Desired Tone (professional, casual, persuasive, friendly)
        - Email Length (short: <50 words, medium: 100-150 words, long: 100-250 words)
        ## REQUIREMENTS
        - Generate the exact number of variations requested
        - Each email must be unique and compelling
        Generate the email as per the input paramater provided.
        genearted email should fit the tone and length specified in the input parameters.
        generated email should address the pain points and value proposition provided in the input parameters.
        generated email should be personalized based on the sender and target information provided in the input parameters.
        generated email should have a clear call-to-action that aligns with the ctaType specified in the input parameters.
        Subjects should be under 60 characters. Bodies should be concise (50-100 words).
        Always return a JSON object.
        --- `;
export const SYSTEM_PROMPT_SEQUENCE =
  `Your task is to generate highly personalized, non-spammy, conversion-focused cold emails based strictly on the provided input parameters.
        ## CORE OBJECTIVES
        - Write emails that feel human, relevant, and tailored
        - Avoid generic or templated language
        - Focus on the recipient’s pain points, not the sender
        - Maximize reply rate (not just readability)
        ## INPUT PARAMETERS
        - Sender Name, Role, Company
        - Target Industry, Role, Pain Points
        - Value Proposition, USP, Product Description
        - Desired Tone (professional, casual, persuasive, friendly)
        - Email Length (short: <50 words, medium: 100-200 words, long: 200-350 words)
        ## REQUIREMENTS
        - Generate the exact number of variations requested
        - Each email must be unique and compelling
        Generate the email as per the input paramater provided.
        genearted email should fit the tone and length specified in the input parameters.
        generated email should address the pain points and value proposition provided in the input parameters.
        generated email should be personalized based on the sender and target information provided in the input parameters.
        generated email should have a clear call-to-action that aligns with the ctaType specified in the input parameters.
        genearte email should match the word count specified in the length parameter provided in the input parameters.
        also prioritize the content of the email to be relevant to the pain points and value proposition provided in the input parameters.
        Subjects should be under 60 characters. Bodies should be concise (50-100 words).
        strictly follow the email body length guidelines based on the length parameter (short: <70 words, medium: 100-200 words, long: 200-350 words).
  Create compelling email sequences. Always respond with valid JSON.`;

export function buildEmailPrompt(input: EmailGenerationInput): string {
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
Email Length: ${input.length || 'medium'}
Email Type: ${input.emailType || 'cold_outreach'}
CTA Type: ${input.ctaType || 'reply'}

${userInstruction}
Requirements:
- Each email must be unique and compelling
- Subjects under 60 characters
- Body concise (50-300 words) depending on 
- Clear call-to-action based on ctaType (${input.ctaType})

Return a JSON object in this exact format:
{"emails": [{"subject": "...", "body": "..."}, ...]}`;
}

export function buildSequencePrompt(input: EmailGenerationInput): string {
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

export function buildCustomEmailPrompt(input: EmailGenerationInput): string {
  return `${input.customPrompt}

Generate exactly ${input.variations} unique email variation${input.variations > 1 ? 's' : ''}.
Generate the email as per the input paramater provided.
Genberated email should of 100 to 400 words in length depending on the user request. 
Return a JSON object in this exact format:
{"emails": [{"subject": "...", "body": "..."}, ...]}`;
}

export function buildCustomSequencePrompt(input: EmailGenerationInput): string {
  return `${input.customPrompt}

Create a 4-email sequence based on the above requirements.
Days should be: 1, 3, 7, 14.

Return a JSON object in this exact format:
{"sequence": [{"day": 1, "subject": "...", "body": "..."}, ...]}`;
}
