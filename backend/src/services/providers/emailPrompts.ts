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
Genberated email should of 100 to 500 words in length depending on the user request. 
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

// ── Job-Seeking Prompts ────────────────────────────────────────────────

const JOB_PROFILE_CONTEXT: Record<string, string> = {
  fresher: `The sender is a fresher / recent graduate with little or no professional experience.
- Emphasize academic projects, internships, certifications, or coursework
- Highlight eagerness to learn and strong foundational skills
- Show enthusiasm and cultural fit; do not oversell experience that doesn't exist
- Keep tone genuine and humble yet confident`,

  software_engineer: `The sender is an experienced software engineer / developer.
- Highlight hands-on technical expertise and specific technologies listed
- Reference relevant projects or measurable achievements (performance gains, features shipped)
- Show alignment between their skills and the target role's requirements
- Be direct and confident`,

  architect: `The sender is a software / solutions architect with senior-level expertise.
- Emphasize system design, scalability, cloud architecture, or enterprise integration experience
- Highlight leadership in technical decision-making and cross-team collaboration
- Showcase how their architecture work drove business outcomes
- Convey strategic thinking alongside technical depth`,

  manager: `The sender is an engineering manager / tech lead.
- Focus on team leadership, hiring, and project delivery at scale
- Reference how they built high-performing teams, reduced churn, or improved processes
- Connect their management philosophy to the company's engineering culture
- Balance technical credibility with people/operational leadership`,

  professional: `The sender is an experienced IT/tech professional.
- Highlight their years of experience and broad domain expertise
- Connect their background to the specific role and company
- Demonstrate continuous learning and adaptability
- Keep tone polished and confident`,
};

export const SYSTEM_PROMPT_JOB_EMAIL = `You are an expert career coach and job-application email writer. Your task is to generate personalized, compelling cold emails that help tech professionals get noticed by hiring managers and recruiters.
## CORE OBJECTIVES
- Write emails that feel genuine, relevant, and tailored to the specific role and company
- Avoid generic phrases like "I am writing to express my interest"
- Open with something specific that shows research about the company
- Highlight the applicant's strongest, most relevant qualifications
- End with a clear, low-friction call-to-action
## REQUIREMENTS
- Subjects under 60 characters — intriguing, not clickbait
- Body: short (60-100 words), medium (120-180 words), long (200-280 words)
- Personalize to the company and role provided
- Always return valid JSON`;

export function buildJobEmailPrompt(input: EmailGenerationInput): string {
  const profileCtx = JOB_PROFILE_CONTEXT[input.jobSeekerProfile || 'professional'] || JOB_PROFILE_CONTEXT['professional'];
  const experience = input.yearsOfExperience && input.jobSeekerProfile !== 'fresher'
    ? `\n- Years of Experience: ${input.yearsOfExperience}`
    : '';
  const company = input.senderCompany ? `\n- Current/Previous Company: ${input.senderCompany}` : '';
  const targetCompany = input.targetCompany ? `\n- Target Company: ${input.targetCompany}` : '';
  const userInstruction = input.customPrompt?.trim()
    ? `\nAdditional Instructions:\n${input.customPrompt.trim()}\n`
    : '';

  return `Generate ${input.variations} unique cold email variation${input.variations > 1 ? 's' : ''} for a job application.

## Applicant Profile
- Profile Type: ${input.jobSeekerProfile || 'professional'}
- Name: ${input.senderName || 'the applicant'}
- Current Role: ${input.senderRole || 'N/A'}${company}
- Key Skills / Technologies: ${input.skills || 'N/A'}${experience}

## Target
- Job Title Applying For: ${input.jobTitle || input.targetRole || 'N/A'}${targetCompany}
- Industry: ${input.targetIndustry || 'Tech'}

## Profile Guidance
${profileCtx}

## Email Settings
- Tone: ${input.tone || 'professional'}
- Length: ${input.length || 'medium'}
${userInstruction}
Requirements:
- Each variation must be unique in angle or opening
- Subject line under 60 characters
- Body length matches the length setting above
- End with a specific, low-friction CTA (e.g., "Would you be open to a 15-minute call?")

Return a JSON object in this exact format:
{"emails": [{"subject": "...", "body": "..."}, ...]}`;
}
