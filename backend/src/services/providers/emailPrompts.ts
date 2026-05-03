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

// ── Business Outreach — Target Role Context ────────────────────────────

const TARGET_ROLE_CONTEXT: Record<string, string> = {
  'CEO': `You are writing to a CEO who thinks at the company level — growth, competitive advantage, and P&L.
- Lead with the single biggest business outcome your product delivers
- Connect to their company's mission or known growth stage
- Be extremely concise; CEOs value directness above all
- Avoid feature lists — speak in results and strategic impact`,

  'CTO': `You are writing to a CTO focused on technical excellence, scalability, and engineering velocity.
- Speak their language: architecture, reliability, developer productivity, tech debt
- Reference how your solution integrates with or improves their tech stack
- Lead with a technical problem you solve, not a product pitch
- Show you understand engineering trade-offs`,

  'CFO': `You are writing to a CFO who evaluates every decision through cost, ROI, and financial risk.
- Lead with cost reduction, efficiency gains, or measurable ROI
- Quantify the value wherever possible (e.g. "reduces overhead by 30%")
- Address risk mitigation and compliance if relevant
- Avoid vague claims — be specific and financial in framing`,

  'COO': `You are writing to a COO who owns operational efficiency, process, and delivery at scale.
- Focus on how your product streamlines operations, reduces friction, or improves throughput
- Highlight reliability, scalability, and ease of adoption
- Reference operational metrics: uptime, processing speed, error rates, SLAs
- Show you understand execution, not just strategy`,

  'CMO': `You are writing to a CMO who cares about brand, demand generation, and marketing ROI.
- Focus on customer acquisition, conversion improvement, or brand amplification
- Reference marketing metrics: CPL, ROAS, pipeline contribution, conversion rate
- Show how your product helps them do more with their budget
- Speak the language of campaigns, audiences, and attribution`,

  'CPO': `You are writing to a CPO who owns product strategy, user experience, and roadmap velocity.
- Focus on how your product accelerates feature delivery, improves user insights, or reduces churn
- Reference product metrics: NPS, time-to-value, activation rate, retention
- Show awareness of their product's market position or known challenges
- Speak in outcomes for users, not features of your tool`,

  'CIO': `You are writing to a CIO overseeing IT infrastructure, digital transformation, and enterprise systems.
- Focus on system integration, uptime, digital modernization, and IT cost efficiency
- Highlight enterprise-grade reliability, support, and compliance
- Reference how your solution reduces IT burden or accelerates transformation
- Address security and governance considerations proactively`,

  'CISO': `You are writing to a CISO who owns cybersecurity strategy, risk management, and compliance.
- Lead with security outcomes: threat reduction, compliance adherence, zero-trust support
- Reference specific frameworks or regulations relevant to their industry (SOC2, ISO 27001, GDPR)
- Be precise — vague security claims are an immediate red flag
- Show how your solution reduces risk surface, not just adds a layer`,

  'Founder / Co-Founder': `You are writing to a Founder who is deeply invested in their company's mission and speed of execution.
- Show genuine alignment with what they are building — reference specific company details
- Lead with immediate, tangible value — founders care about ROI at their stage
- Highlight ownership, speed, and the ability to operate lean
- Be authentic; founders can spot a templated pitch in seconds`,

  'VP of Engineering': `You are writing to a VP of Engineering who manages team performance, system reliability, and technical roadmap.
- Focus on engineering velocity, developer experience, and system scalability
- Highlight how your product reduces toil, improves incident response, or accelerates delivery
- Reference metrics that matter: deploy frequency, MTTR, test coverage, on-call burden
- Speak peer-level; they are technical and will notice shallow pitches`,

  'VP of Sales': `You are writing to a VP of Sales who lives by quota, pipeline, and win rate.
- Lead with how your product directly improves sales rep productivity or pipeline conversion
- Reference sales metrics: win rate, average deal size, time-to-close, CRM adoption
- Show you understand the full sales cycle and where friction exists
- Be outcome-focused — they don't have time for theoretical value`,

  'VP of Marketing': `You are writing to a VP of Marketing responsible for brand, demand, and revenue pipeline.
- Focus on lead quality, campaign efficiency, or marketing-to-revenue attribution
- Reference marketing performance metrics: MQLs, CPL, ROAS, pipeline influenced
- Show how your product makes their team faster or more effective
- Align to the pressure they face from sales to deliver pipeline`,

  'VP of Product': `You are writing to a VP of Product who bridges customer needs, business goals, and engineering execution.
- Focus on roadmap clarity, user insights, cross-functional alignment, or time-to-market
- Reference product health metrics: feature adoption, user retention, NPS
- Show how your product helps them ship the right things faster
- Be concise and outcome-driven`,

  'VP of Operations': `You are writing to a VP of Operations who owns process efficiency, supply chain, and operational scaling.
- Focus on reducing operational overhead, standardizing processes, or improving throughput
- Reference operational KPIs: cost per unit, cycle time, error rate, capacity utilization
- Show reliability and scalability as core features
- Speak in systems and process improvements`,

  'VP of Business Development': `You are writing to a VP of Business Development focused on partnerships, new revenue channels, and market expansion.
- Focus on revenue growth, strategic partnerships, or market access
- Show how your product opens new channels or accelerates deal flow
- Reference partnership models, co-selling, or revenue share if applicable
- Be direct about mutual value and speed to impact`,

  'VP of Customer Success': `You are writing to a VP of Customer Success who owns retention, expansion, and customer health.
- Focus on churn reduction, NPS improvement, or customer health scoring
- Reference CS metrics: GRR, NRR, CSAT, time-to-value, escalation rate
- Show how your product helps CSMs scale their book of business
- Demonstrate you understand the post-sale journey`,

  'VP of Finance': `You are writing to a VP of Finance who manages financial planning, reporting, and cost governance.
- Focus on financial visibility, cost control, and reporting accuracy
- Reference finance KPIs: budget variance, forecast accuracy, close cycle time
- Quantify efficiency gains in dollar terms wherever possible
- Show compliance and audit readiness as strengths`,

  'Director of Engineering': `You are writing to a Director of Engineering responsible for team delivery and technical standards.
- Focus on delivery velocity, code quality, and reducing engineering bottlenecks
- Highlight how your product reduces on-call burden, tech debt, or build times
- Speak technically but focus on team-level impact
- Reference specific engineering challenges they likely face at their scale`,

  'Director of IT': `You are writing to a Director of IT managing infrastructure, helpdesk, and system reliability.
- Focus on reducing IT tickets, improving uptime, and simplifying vendor management
- Highlight ease of deployment, integration with existing systems, and support SLAs
- Address total cost of ownership and IT team bandwidth
- Show enterprise-grade security and compliance out of the box`,

  'Director of Marketing': `You are writing to a Director of Marketing running campaigns and owning channel performance.
- Focus on improving campaign output, creative velocity, or attribution clarity
- Reference channel-specific metrics relevant to their work
- Show how your product saves time or improves conversion
- Be specific about the marketing use case you solve`,

  'Director of Sales': `You are writing to a Director of Sales managing a team's quota and pipeline.
- Focus on rep ramp time, pipeline health, and deal conversion
- Highlight sales enablement, CRM efficiency, or outreach effectiveness
- Reference team-level metrics: quota attainment, average deal cycle
- Show you understand the day-to-day of a sales manager`,

  'Director of Product': `You are writing to a Director of Product overseeing product delivery and stakeholder alignment.
- Focus on roadmap execution, user research, and cross-functional coordination
- Reference product velocity and how your tool reduces prioritization friction
- Show how your product improves the signal-to-noise for product decisions
- Be concise and outcome-focused`,

  'Director of Operations': `You are writing to a Director of Operations managing process efficiency and day-to-day execution.
- Focus on operational consistency, cost efficiency, and process automation
- Reference operational KPIs relevant to their vertical
- Show how your product reduces manual work and error rates
- Highlight reliability and ease of integration`,

  'Head of Growth': `You are writing to a Head of Growth who runs experiments, optimizes funnels, and drives acquisition.
- Focus on conversion rate improvement, CAC reduction, or activation uplift
- Reference growth metrics: DAU/MAU, activation rate, referral rate, A/B test velocity
- Show how your product enables faster experimentation or better data
- Speak the language of growth loops and compounding effects`,

  'Head of Business Development': `You are writing to a Head of Business Development seeking strategic partnerships and revenue expansion.
- Focus on partnership leverage, new market access, or channel revenue
- Be direct about mutual value creation and speed to impact
- Reference deal structures or co-selling opportunities if applicable
- Show that you understand their growth model`,

  'Head of Technology': `You are writing to a Head of Technology overseeing the full technology stack and team.
- Lead with how your product improves system reliability, developer productivity, or platform modernization
- Speak technically about integration, architecture fit, and operational impact
- Highlight enterprise support, SLAs, and scalability
- Balance depth with brevity`,

  'Head of Data & Analytics': `You are writing to a Head of Data & Analytics who owns the company's data infrastructure and insights function.
- Focus on data quality, pipeline reliability, insights velocity, or reporting accuracy
- Reference data stack components: warehouses, BI tools, ingestion pipelines
- Show how your product reduces time-to-insight or improves data trust
- Speak analytically; they respond to precision and data-backed claims`,

  'Head of HR': `You are writing to a Head of HR focused on talent acquisition, retention, and employee experience.
- Focus on reducing time-to-hire, improving retention, or automating HR workflows
- Reference HR metrics: offer acceptance rate, attrition, eNPS, cost-per-hire
- Show how your product makes the HR team more effective or reduces admin burden
- Speak empathetically — HR leaders value culture and people outcomes`,

  'Engineering Manager': `You are writing to an Engineering Manager responsible for team productivity and delivery.
- Focus on sprint velocity, reducing blockers, and improving developer experience
- Highlight how your product helps their team deliver more reliably
- Reference team-level metrics: deploy frequency, PR cycle time, incident rate
- Speak at the team level, not just the org level`,

  'IT Manager': `You are writing to an IT Manager handling day-to-day IT operations and support.
- Focus on reducing ticket volume, improving system uptime, or simplifying vendor management
- Highlight ease of setup, compatibility with their existing tools, and helpdesk efficiency
- Show fast time-to-value and minimal IT overhead to maintain
- Address security and access control`,

  'Marketing Manager': `You are writing to a Marketing Manager executing campaigns and managing channels.
- Focus on saving time, improving campaign performance, or automating repetitive tasks
- Reference specific marketing tools or workflows they likely use
- Be very specific about the pain you solve — generic pitches don't land here
- Show quick wins and ease of adoption`,

  'Sales Manager': `You are writing to a Sales Manager running a team and accountable for monthly quota.
- Focus on rep efficiency, pipeline visibility, and closing rate improvement
- Reference CRM hygiene, call recording, or sales coaching tools if relevant
- Show how your product helps their reps hit quota faster
- Keep it brief — sales managers respect efficiency`,

  'Product Manager': `You are writing to a Product Manager who prioritizes features and coordinates between engineering and business.
- Focus on better user research, roadmap prioritization, or stakeholder alignment
- Reference tools like Jira, Figma, or analytics platforms they likely use
- Show how your product reduces their coordination overhead
- Be concise; PMs are usually overwhelmed with requests`,

  'Operations Manager': `You are writing to an Operations Manager who runs day-to-day workflows and coordinates teams.
- Focus on process automation, error reduction, and operational consistency
- Highlight integrations with tools they already use
- Reference specific operational pain points common to their industry
- Show ease of rollout and low disruption to existing processes`,

  'Procurement Manager': `You are writing to a Procurement Manager who evaluates vendors on cost, reliability, and contract terms.
- Lead with total cost of ownership and ease of procurement
- Highlight compliance, security certifications, and SLA guarantees
- Reference standard procurement criteria: pricing model, support tier, renewal terms
- Be factual and structured — procurement teams respond to specifics`,

  'HR Manager': `You are writing to an HR Manager who handles recruiting, onboarding, and employee relations.
- Focus on reducing administrative HR overhead or improving hiring efficiency
- Reference HR tools they likely use (ATS, HRIS, LMS)
- Show how your product helps them spend more time on people, less on paperwork
- Lead with time savings or improved employee experience metrics`,

  'HR Recruiter': `You are writing to an HR Recruiter focused on sourcing, screening, and closing candidates.
- Focus on reducing time-to-fill, improving candidate quality, or automating sourcing
- Reference recruiter pain points: high volume, poor signal-to-noise, slow processes
- Show how your product makes them more efficient and effective
- Be concise — recruiters value their time`,

  'Sales Lead': `You are writing to a Sales Lead who is measured on the team's revenue output.
- Focus on deal acceleration, conversion rate improvement, or outreach effectiveness
- Reference the sales process and where your product creates leverage
- Show fast ROI and low ramp time
- Speak in quota, pipeline, and win rate`,

  'Marketing Head': `You are writing to a Marketing Head responsible for brand awareness and lead generation.
- Focus on improving lead quality, reducing CPL, or scaling content/campaign output
- Reference the full funnel from awareness to MQL
- Show how your product creates compounding marketing value
- Be results-oriented and channel-specific`,

  'Decision Maker': `You are writing to a general decision-maker or budget owner.
- Lead with the clearest possible ROI statement
- Address both the business outcome and the risk of not acting
- Keep it short and non-technical — assume they are evaluating multiple solutions
- End with a low-friction next step that doesn't require heavy commitment`,
};

export function buildEmailPrompt(input: EmailGenerationInput): string {
  const roleCtx = input.targetRole ? (TARGET_ROLE_CONTEXT[input.targetRole] || '') : '';
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
${roleCtx ? `\n## Target Role Guidance\n${roleCtx}\n` : ''}
${userInstruction}
Requirements:
- Each email must be unique and compelling
- Subjects under 60 characters
- Body length matches the length setting (short: <70 words, medium: 100-200 words, long: 200-350 words)
- Write the email specifically for the target role — their priorities, language, and what they care about
- Clear call-to-action based on ctaType (${input.ctaType}) suited to the target role

Return a JSON object in this exact format:
{"emails": [{"subject": "...", "body": "..."}, ...]}`;
}

export function buildSequencePrompt(input: EmailGenerationInput): string {
  const roleCtx = input.targetRole ? (TARGET_ROLE_CONTEXT[input.targetRole] || '') : '';
  const userInstruction = input.customPrompt?.trim()
    ? `\nUser Instructions (apply these on top of the above):\n${input.customPrompt.trim()}\n`
    : '';

  return `Create a 4-email cold outreach sequence for:

Sender: ${input.senderName} from ${input.senderCompany} (${input.senderRole})
Target: ${input.targetRole} in ${input.targetIndustry} industry
Pain Points: ${input.painPoints?.join(', ') || 'Various challenges'}
Value Prop: ${input.valueProposition}
${roleCtx ? `\n## Target Role Guidance\n${roleCtx}\n` : ''}
${userInstruction}
Sequence:
- Day 1: Initial value-driven outreach
- Day 3: Additional value / social proof
- Day 7: Different angle, raise urgency
- Day 14: Final attempt with a new angle

Each email must be tailored to the target role's priorities and language as described in the guidance above.

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

const RECIPIENT_ROLE_CONTEXT: Record<string, string> = {
  hr_manager: `You are writing to an HR Manager who evaluates candidates for skills alignment, culture fit, and process compliance.
- Focus on skills match and qualifications relevant to the role
- Mention adaptability, teamwork, and culture alignment
- Professional tone; HR managers review many applications — stand out early`,

  hr_recruiter: `You are writing to an internal HR Recruiter who screens for basic qualifications and forwards strong profiles.
- Lead with the job title and key matching skills
- Make it easy for them to justify passing your profile to the hiring team
- Be concise — recruiters skim hundreds of applications`,

  recruiter: `You are writing to an external/agency recruiter who places candidates with multiple clients.
- Clearly state the role type you're targeting and your most marketable skills
- Highlight availability and motivation to move quickly
- Express openness to exploring opportunities they may have`,

  talent_acquisition: `You are writing to a Talent Acquisition Lead focused on sourcing quality pipelines.
- Emphasize unique value and why you're a standout candidate in the market
- Mention specific role alignment and proactive outreach intent
- Show initiative — TA leads appreciate candidates who do their research`,

  hiring_manager: `You are writing to the direct hiring manager for this role — the person you'd report to.
- Focus on impact: what you can deliver for their specific team from day one
- Reference the team's likely challenges or goals based on the role
- Show deep understanding of the role requirements`,

  engineering_manager: `You are writing to an Engineering Manager who cares about technical skills and team productivity.
- Highlight specific technical expertise and past contributions to team velocity
- Mention ability to work collaboratively, own deliverables, and unblock others
- Reference relevant tech stack experience the team uses`,

  director_engineering: `You are writing to a Director of Engineering who values strategic technical contributions.
- Showcase breadth of engineering experience and cross-team impact
- Highlight mentoring, architectural decisions, or org-wide improvements
- Connect your work to engineering-wide business outcomes`,

  vp_engineering: `You are writing to a VP of Engineering who thinks about team scalability and technical excellence.
- Lead with measurable technical and organizational impact at scale
- Highlight experience with high-scale systems, reliability, or technical transformation
- Show strategic thinking alongside hands-on technical depth`,

  head_technology: `You are writing to a Head of Technology with broad oversight of the entire tech organization.
- Emphasize end-to-end technical ownership and leadership in complex environments
- Highlight how your work created tangible business value
- Be direct — they value results and decisiveness`,

  cto: `You are writing to the CTO who cares about technical vision, engineering talent density, and excellence.
- Lead with your most impressive technical achievement or system you built/scaled
- Align your expertise with the company's known technical challenges or stack
- Show that you think in systems, not just individual tasks`,

  cpo: `You are writing to the Chief Product Officer who values product thinking and technical execution together.
- Show product awareness — how your work shipped real user value
- Highlight cross-functional collaboration with product, design, and engineering
- Demonstrate user-centric thinking alongside technical skills`,

  vp_product: `You are writing to the VP of Product who bridges business strategy and technology delivery.
- Highlight contributions at the intersection of product and engineering
- Show impact on product outcomes and user metrics, not just code shipped
- Be concise and outcome-focused`,

  product_manager: `You are writing to a Product Manager who directly collaborates with engineering.
- Show ability to understand product requirements and execute with speed
- Highlight communication skills and low-friction collaboration
- Demonstrate that you are proactive and a reliable partner`,

  ceo: `You are writing to the CEO who has a high-level view of the business and its direction.
- Lead with the single biggest impact you've had — ideally with numbers or scale
- Connect your skills directly to their company's mission or growth challenges
- Be extremely brief and direct; CEOs value their time above all else`,

  coo: `You are writing to the COO who focuses on operational excellence and delivery.
- Highlight your ability to deliver reliably, efficiently, and at scale
- Mention experience with process improvement or cross-functional coordination
- Show operational and execution maturity`,

  cfo: `You are writing to the CFO who values ROI, cost-efficiency, and financial impact.
- Quantify your contributions where possible (cost savings, efficiency gains, revenue impact)
- Highlight financial awareness in any technical or business decisions you've made
- Be precise and concise — finance leaders appreciate exactness`,

  founder: `You are writing to a Founder who is deeply invested in the company's mission and culture.
- Show genuine alignment with their mission or product vision — reference specifics
- Highlight ownership mentality and ability to thrive in ambiguity
- Be authentic and direct — founders see through generic, templated language immediately`,

  managing_director: `You are writing to a Managing Director overseeing a region or major business unit.
- Focus on business impact, stakeholder management, and strategic delivery
- Highlight experience with enterprise-scale or high-visibility projects
- Show cross-functional leadership and executive communication skills`,

  general_manager: `You are writing to a General Manager responsible for overall operations and P&L.
- Lead with operational impact and your track record of reliable delivery
- Highlight versatility and cross-functional experience across teams
- Connect your skills clearly to their business goals and priorities`,

  technical_lead: `You are writing to a Technical Lead or Senior Architect who will evaluate your technical depth.
- Go deep on relevant technical skills, problem-solving, and system design
- Highlight experience with the specific stack, patterns, or architecture they use
- Show peer-level technical credibility — tech leads respond to depth, not buzzwords`,

  department_head: `You are writing to a Department Head with hiring authority for their team.
- Focus on your direct contribution to their team's goals and KPIs
- Show role-specific expertise and alignment with the department's work
- Be direct about your value — they care about their team's outcomes`,
};

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
  const recipientCtx = input.recipientRole ? (RECIPIENT_ROLE_CONTEXT[input.recipientRole] || '') : '';
  const experience = input.yearsOfExperience && input.jobSeekerProfile !== 'fresher'
    ? `\n- Years of Experience: ${input.yearsOfExperience}`
    : '';
  const company = input.senderCompany ? `\n- Current/Previous Company: ${input.senderCompany}` : '';
  const targetCompany = input.targetCompany ? `\n- Target Company: ${input.targetCompany}` : '';
  const recipientRoleLabel = input.recipientRole
    ? `\n- Recipient Role: ${input.recipientRole.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}`
    : '';
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
- Industry: ${input.targetIndustry || 'Tech'}${recipientRoleLabel}

## Applicant Profile Guidance
${profileCtx}
${recipientCtx ? `## Recipient Context\n${recipientCtx}\n` : ''}
## Email Settings
- Tone: ${input.tone || 'professional'}
- Length: ${input.length || 'medium'}
${userInstruction}
Requirements:
- Each variation must be unique in angle or opening
- Subject line under 60 characters
- Body length matches the length setting above
- Write the email specifically for the recipient's role — their priorities, language, and what they care about
- End with a low-friction CTA suited to the recipient (e.g. "Would you be open to a quick call?" for tech leads; "Could you forward this to the hiring team?" for recruiters)

Return a JSON object in this exact format:
{"emails": [{"subject": "...", "body": "..."}, ...]}`;
}
