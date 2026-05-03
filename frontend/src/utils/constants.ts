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
  // C-Suite
  'CEO',
  'CTO',
  'CFO',
  'COO',
  'CMO',
  'CPO',
  'CIO',
  'CISO',
  // Founders
  'Founder / Co-Founder',
  // VP Level
  'VP of Engineering',
  'VP of Sales',
  'VP of Marketing',
  'VP of Product',
  'VP of Operations',
  'VP of Business Development',
  'VP of Customer Success',
  'VP of Finance',
  // Director Level
  'Director of Engineering',
  'Director of IT',
  'Director of Marketing',
  'Director of Sales',
  'Director of Product',
  'Director of Operations',
  // Head of
  'Head of Growth',
  'Head of Business Development',
  'Head of Technology',
  'Head of Data & Analytics',
  'Head of HR',
  // Manager Level
  'Engineering Manager',
  'IT Manager',
  'Marketing Manager',
  'Sales Manager',
  'Product Manager',
  'Operations Manager',
  'Procurement Manager',
  // Other
  'HR Manager',
  'HR Recruiter',
  'Sales Lead',
  'Marketing Head',
  'Decision Maker',
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

export const JOB_SEEKER_PROFILES = [
  { value: 'fresher', label: 'Fresher / Recent Graduate', description: 'Entry-level, little or no professional experience' },
  { value: 'software_engineer', label: 'Software Engineer', description: 'Experienced developer / SDE' },
  { value: 'architect', label: 'Software Architect', description: 'Senior technical leader, system design expert' },
  { value: 'manager', label: 'Engineering Manager', description: 'Team lead / people manager' },
  { value: 'professional', label: 'IT Professional', description: 'Other experienced tech professional' },
] as const;

export const JOB_RECIPIENT_ROLES = [
  { value: 'hr_manager',          label: 'HR Manager',              description: 'Human Resources Manager' },
  { value: 'hr_recruiter',        label: 'HR Recruiter',            description: 'Internal Talent Acquisition' },
  { value: 'recruiter',           label: 'Recruiter (Agency)',      description: 'External / Agency Recruiter' },
  { value: 'talent_acquisition',  label: 'Talent Acquisition Lead', description: 'Head of Sourcing / TA' },
  { value: 'hiring_manager',      label: 'Hiring Manager',          description: 'Direct manager for the role' },
  { value: 'engineering_manager', label: 'Engineering Manager',     description: 'Dev / Engineering Team Manager' },
  { value: 'director_engineering',label: 'Director of Engineering', description: 'Engineering Director' },
  { value: 'vp_engineering',      label: 'VP of Engineering',       description: 'Vice President, Engineering' },
  { value: 'head_technology',     label: 'Head of Technology',      description: 'Technical Head / CTO-level' },
  { value: 'technical_lead',      label: 'Technical Lead',          description: 'Senior Tech Lead / Architect' },
  { value: 'cto',                 label: 'CTO',                     description: 'Chief Technology Officer' },
  { value: 'cpo',                 label: 'CPO',                     description: 'Chief Product Officer' },
  { value: 'vp_product',          label: 'VP of Product',           description: 'Vice President, Product' },
  { value: 'product_manager',     label: 'Product Manager',         description: 'Product / Program Manager' },
  { value: 'ceo',                 label: 'CEO',                     description: 'Chief Executive Officer' },
  { value: 'coo',                 label: 'COO',                     description: 'Chief Operating Officer' },
  { value: 'cfo',                 label: 'CFO',                     description: 'Chief Financial Officer' },
  { value: 'founder',             label: 'Founder / Co-Founder',    description: 'Company Founder' },
  { value: 'managing_director',   label: 'Managing Director',       description: 'MD / Regional Director' },
  { value: 'general_manager',     label: 'General Manager',         description: 'General / Business Manager' },
  { value: 'department_head',     label: 'Department Head',         description: 'Head of a department' },
] as const;

export const EMAIL_PURPOSE_OPTIONS = [
  { value: 'business', label: 'Business Outreach', icon: '📈' },
  { value: 'job_seeking', label: 'Get Hired', icon: '💼' },
] as const;

export const PLAN_DATA: import('../types/index').Plan[] = [
  {
    name: 'free',
    tokens: 10,
    price: 0,
    features: ['10 tokens/month', 'Single email generation', 'Email history', 'Basic support'],
  },
  {
    name: 'basic test',
    tokens: 10,
    price: 10,
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
