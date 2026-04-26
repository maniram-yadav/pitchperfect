export type PlanName = 'free' | 'basic test' | 'starter' | 'pro';

export interface UserProfile {
  role?: string;
  company?: string;
  website?: string;
  productDescription?: string;
  valueProposition?: string;
  usp?: string;
}

export interface User {
  userId: string;
  email: string;
  name: string;
  tokens: number;
  plan: PlanName;
  profile?: UserProfile;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data?: {
    userId: string;
    email: string;
    name: string;
    tokens: number;
    plan: string;
    token: string;
    refreshToken: string;
  };
  error?: string;
}

export type EmailPurpose = 'business' | 'job_seeking';
export type JobSeekerProfile = 'fresher' | 'software_engineer' | 'architect' | 'manager' | 'professional';

export interface EmailGenerationInput {
  // Shared fields
  senderName?: string;
  senderRole?: string;
  senderCompany?: string;
  senderWebsite?: string;
  tone?: 'professional' | 'casual' | 'persuasive' | 'friendly';
  length?: 'short' | 'medium' | 'long';
  variations: number;
  generateSequence: boolean;
  customPrompt?: string;
  useCustomInput?: boolean;
  emailPurpose?: EmailPurpose;

  // Business outreach fields
  productDescription?: string;
  targetIndustry?: string;
  targetRole?: string;
  companySize?: string;
  geography?: string;
  painPoints?: string[];
  valueProposition?: string;
  usp?: string;
  emailType?: 'cold_outreach' | 'follow_up' | 'sales_pitch' | 'partnership' | 'job_inquiry';
  ctaType?: 'book_call' | 'reply' | 'demo_request' | 'other';

  // Job-seeking fields
  jobSeekerProfile?: JobSeekerProfile;
  yearsOfExperience?: string;
  skills?: string;
  targetCompany?: string;
  jobTitle?: string;
}

export interface Email {
  subject: string;
  body: string;
  variation: number;
}

export interface SequenceEmail {
  day: number;
  subject: string;
  body: string;
}

export interface GeneratedEmailResponse {
  success: boolean;
  message: string;
  data?: {
    generationId: string;
    emails: Email[];
    sequence?: SequenceEmail[];
    tokensUsed: number;
    provider: string;
  };
  error?: string;
}

export interface Generation {
  _id: string;
  userId: string;
  inputParams: EmailGenerationInput;
  generatedOutput: {
    emails: Email[];
    sequence?: SequenceEmail[];
  };
  tokensUsed: number;
  createdAt: string;
}

export interface Plan {
  name: PlanName;
  tokens: number;
  price: number;
  features: string[];
}
