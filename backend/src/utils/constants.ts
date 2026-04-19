export const PLAN_TOKENS = {
  free: 10,
  starter: 100,
  pro: 500,
};

export const PLAN_PRICES = {
  free: 0,
  starter: 199, // INR
  pro: 499, // INR
};

export const EMAIL_TOKENS = {
  single: 1,
  sequence: 3, // 3-email sequence
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
