import type { PlanName } from './transaction';
export type { PlanName, PaidPlanName } from './transaction';

export interface User {
  _id?: string;
  name: string;
  email: string;
  passwordHash: string;
  tokens: number;
  plan: PlanName;
  profile?: {
    role?: string;
    company?: string;
    website?: string;
    productDescription?: string;
    valueProposition?: string;
    usp?: string;
  };
  createdAt?: Date;
  updatedAt?: Date;
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
  recipientRole?: string;
  yearsOfExperience?: string;
  skills?: string;
  targetCompany?: string;
  jobTitle?: string;
}

export interface EmailGeneration {
  _id?: string;
  userId: string;
  inputParams: EmailGenerationInput;
  generatedOutput: {
    emails: Email[];
    sequence?: SequenceEmail[];
  };
  tokensUsed: number;
  provider: string;
  createdAt?: Date;
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

export interface Transaction {
  _id?: string;
  userId: string;
  amount: number;
  tokensAdded: number;
  plan: PlanName;
  paymentId: string;
  status: 'pending' | 'success' | 'failed';
  createdAt?: Date;
}

export interface JWTPayload {
  userId: string;
  email: string;
  iat?: number;
  exp?: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

// Re-export AI provider types for convenience
export type { AIProvider, AIProviderConfig, AIGenerationResult } from './aiProvider';
