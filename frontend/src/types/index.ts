export interface User {
  userId: string;
  email: string;
  name: string;
  tokens: number;
  plan: 'free' | 'starter' | 'pro';
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

export interface EmailGenerationInput {
  senderName: string;
  senderRole: string;
  senderCompany: string;
  senderWebsite: string;
  productDescription: string;
  targetIndustry: string;
  targetRole: string;
  companySize: string;
  geography: string;
  painPoints: string[];
  valueProposition: string;
  usp: string;
  tone: 'professional' | 'casual' | 'persuasive' | 'friendly';
  length: 'short' | 'medium' | 'long';
  emailType: 'cold_outreach' | 'follow_up' | 'sales_pitch' | 'partnership' | 'job_inquiry';
  ctaType: 'book_call' | 'reply' | 'demo_request' | 'other';
  variations: number;
  generateSequence: boolean;
}

export interface Email {
  subject: string;
  body: string;
  variation: number;
}

export interface GeneratedEmailResponse {
  success: boolean;
  message: string;
  data?: {
    generationId: string;
    emails: Email[];
    sequence?: any[];
    tokensUsed: number;
  };
  error?: string;
}

export interface Generation {
  _id: string;
  userId: string;
  inputParams: EmailGenerationInput;
  generatedOutput: {
    emails: Email[];
    sequence?: any[];
  };
  tokensUsed: number;
  createdAt: string;
}

export interface Plan {
  name: 'free' | 'starter' | 'pro';
  tokens: number;
  price: number;
  features: string[];
}
