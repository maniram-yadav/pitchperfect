export const INDUSTRIES = [
  'SaaS',
  'Healthcare',
  'E-commerce',
  'Finance',
  'Education',
  'Real Estate',
  'Manufacturing',
  'Consulting',
];

export const TARGET_ROLES = [
  'CEO',
  'CTO',
  'HR',
  'Marketing Head',
  'Sales Lead',
  'Founder',
  'VP of Operations',
  'Product Manager',
];

export const COMPANY_SIZES = [
  'Startup',
  'Small (50-200)',
  'Medium (200-1000)',
  'Enterprise (1000+)',
];

export const TONE_OPTIONS = [
  'professional',
  'casual',
  'persuasive',
  'friendly',
] as const;

export const LENGTH_OPTIONS = [
  'short',
  'medium',
  'long',
] as const;

export const EMAIL_TYPE_OPTIONS = [
  'cold_outreach',
  'follow_up',
  'sales_pitch',
  'partnership',
  'job_inquiry',
] as const;

export const CTA_TYPE_OPTIONS = [
  'book_call',
  'reply',
  'demo_request',
  'other',
] as const;

export const PLAN_DATA = [
  {
    name: 'free',
    tokens: 10,
    price: 0,
    features: ['10 tokens/month', 'Single email generation', 'Email history', 'Basic support'],
  },
  {
    name: 'starter',
    tokens: 100,
    price: 199,
    features: ['100 tokens/month', 'Email sequences', 'Personalization tokens', 'Priority support'],
  },
  {
    name: 'pro',
    tokens: 500,
    price: 499,
    features: ['500 tokens/month', 'Unlimited sequences', 'Advanced analytics', '24/7 support'],
  },
];
