export const PLAN_NAMES = ['free','basic test', 'starter', 'pro'] as const;
export const PAID_PLAN_NAMES = ['starter','basic test', 'pro'] as const;

export const PLAN_TOKENS = {
  free: 50,
  'basic test': 10,
  starter: 250,
  pro: 900,
};

export const PLAN_PRICES = {
  free: 0,
  'basic test': 10, // INR
  starter: 199, // INR
  pro: 499, // INR
};

export const EMAIL_TOKENS = {
  single: 10,   // tokens per email
  sequence: 30, // tokens for a 3-email sequence
};

export const TONE_OPTIONS = ['professional', 'casual', 'persuasive', 'friendly'] as const;

export const LENGTH_OPTIONS = ['short', 'medium', 'long'] as const;

export const EMAIL_TYPE_OPTIONS = [
  'cold_outreach',
  'follow_up',
  'sales_pitch',
  'partnership',
  'job_inquiry',
] as const;

export const CTA_TYPE_OPTIONS = ['book_call', 'reply', 'demo_request', 'other'] as const;

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

export const COMPANY_SIZES = ['Startup', 'Small (50-200)', 'Medium (200-1000)', 'Enterprise (1000+)'];
