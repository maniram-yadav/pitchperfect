'use client';

import Link from 'next/link';
import { useAuth } from '../hooks/useAuth';
import { useEffect, useRef, useState } from 'react';

const TYPING_PHRASES = [
  'Cold Emails That Convert',
  'Personalized Outreach at Scale',
  'Job Emails That Get Interviews',
  'Emails Tailored to Every Role',
  'Sales Pitches in Seconds',
];

function useTypewriter(phrases: string[], speed = 80, pause = 1800) {
  const [displayed, setDisplayed] = useState('');
  const [phraseIdx, setPhraseIdx] = useState(0);
  const [charIdx, setCharIdx] = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const current = phrases[phraseIdx];
    let timeout: ReturnType<typeof setTimeout>;

    if (!deleting && charIdx <= current.length) {
      timeout = setTimeout(() => { setDisplayed(current.slice(0, charIdx)); setCharIdx((i) => i + 1); }, speed);
    } else if (!deleting && charIdx > current.length) {
      timeout = setTimeout(() => setDeleting(true), pause);
    } else if (deleting && charIdx >= 0) {
      timeout = setTimeout(() => { setDisplayed(current.slice(0, charIdx)); setCharIdx((i) => i - 1); }, speed / 2);
    } else {
      setDeleting(false);
      setPhraseIdx((i) => (i + 1) % phrases.length);
    }
    return () => clearTimeout(timeout);
  }, [charIdx, deleting, phraseIdx, phrases, speed, pause]);

  return displayed;
}

function useScrollReveal() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.12 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return { ref, visible };
}

function RevealSection({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const { ref, visible } = useScrollReveal();
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(32px)',
        transition: `opacity 0.7s ease ${delay}ms, transform 0.7s ease ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

const FEATURES = [
  { icon: '🎯', title: 'Role-Intelligent AI', desc: 'Every email is crafted knowing exactly what your target persona cares about — a CFO reads differently than a CTO. Our AI adapts content, language, and CTA per role.' },
  { icon: '💼', title: 'Business + Job Seeking', desc: 'Two complete modes in one tool: generate cold outreach for business deals, or craft job application emails tailored to the person you\'re writing to.' },
  { icon: '📋', title: '38 Business Target Roles', desc: 'From CEO to Procurement Manager — every major decision-maker role has dedicated AI guidance so your pitch lands with precision.' },
  { icon: '👤', title: '21 Job Recipient Roles', desc: 'Writing to an HR Recruiter vs a CTO vs a Founder? Our AI switches strategy completely — language, focus, and CTA all adapt to who\'s reading.' },
  { icon: '📊', title: 'Multi-Step Sequences', desc: 'Generate complete 4-email follow-up sequences (Day 1, 3, 7, 14) — not just one-off emails. Keep your pipeline warm automatically.' },
  { icon: '⚡', title: 'Up to 3 Variations', desc: 'Get multiple unique email angles per generation so you can A/B test what works best for your audience.' },
];

const STEPS = [
  { label: 'Choose Your Mode', desc: 'Select Business Outreach to reach decision-makers, or Job Seeking to land your next role.' },
  { label: 'Select the Recipient Role', desc: 'Pick who you\'re writing to — CEO, CTO, HR Recruiter, VP of Engineering, and 35+ more roles.' },
  { label: 'Fill in Your Details', desc: 'Tell us about your product, skills, target company, and the outcome you want from this email.' },
  { label: 'Get Role-Targeted Emails', desc: 'Our AI generates emails tailored specifically to your recipient\'s priorities, language, and what makes them take action.' },
];

const BUSINESS_ROLES_PREVIEW = [
  { role: 'CEO', focus: 'Strategic impact, competitive edge, and revenue outcomes — in under 100 words.' },
  { role: 'CTO', focus: 'Technical depth, scalability, and engineering velocity. No fluff, only signal.' },
  { role: 'CFO', focus: 'ROI, cost reduction, and measurable financial efficiency. Numbers-first framing.' },
  { role: 'CMO', focus: 'Lead generation, conversion uplift, and campaign ROI. Funnel-aware language.' },
  { role: 'VP of Sales', focus: 'Pipeline velocity, win rate, and rep productivity. Quota-centric framing.' },
  { role: 'Head of Growth', focus: 'Funnel metrics, experimentation speed, and compounding acquisition.' },
  { role: 'CISO', focus: 'Risk reduction, compliance, zero-trust architecture. Precision over hype.' },
  { role: 'Procurement Manager', focus: 'TCO, contract terms, SLAs, and vendor risk. Structured and factual.' },
];

const JOB_ROLES_PREVIEW = [
  { role: 'HR Recruiter', focus: 'Skills keywords, quick qualification, easy to forward to hiring team.' },
  { role: 'Hiring Manager', focus: 'Day-one impact, team fit, and deep role alignment.' },
  { role: 'CTO', focus: 'Technical systems, architecture thinking, and engineering culture fit.' },
  { role: 'VP of Engineering', focus: 'Scale, reliability, team contribution, and delivery track record.' },
  { role: 'CEO / Founder', focus: 'Mission alignment, ownership mindset, ability to thrive in ambiguity.' },
  { role: 'Engineering Manager', focus: 'Sprint velocity, collaboration, and hands-on technical contributions.' },
];

const FAQS = [
  {
    q: 'What makes PitchPerfect different from other email generators?',
    a: 'PitchPerfect is the only email generator with role-specific AI intelligence. Instead of generic templates, our AI knows what a CFO cares about vs a CTO, or what an HR Recruiter looks for vs a Founder. Every email is crafted for the exact person reading it — their priorities, language, and what makes them respond.',
  },
  {
    q: 'How does role-targeted email generation work?',
    a: 'When you select a target role (e.g. VP of Engineering or HR Recruiter), our AI applies a deep knowledge profile for that persona — their KPIs, what language resonates, what pain points to lead with, and what CTA works best. The result is an email that feels written by someone who understands the recipient, not a mass-blast template.',
  },
  {
    q: 'Can I generate emails for job applications too?',
    a: 'Yes. PitchPerfect has a dedicated Job Seeking mode. Select who you\'re writing to (HR Manager, CTO, Hiring Manager, etc.), fill in your experience and the role you want, and our AI crafts a cold outreach email perfectly angled for that recipient. A different email for HR than for the CTO — automatically.',
  },
  {
    q: 'How many target roles are supported?',
    a: 'For business outreach we support 38 decision-maker roles — from CEO, CTO, CFO and CMO through VP, Director, and Head-of levels, to Procurement Manager and IT Manager. For job seeking, we support 21 recipient roles including HR Recruiter, Hiring Manager, Engineering Manager, CTO, Founder, and more.',
  },
  {
    q: 'Do I need a credit card to get started?',
    a: 'No. Sign up for free and get tokens immediately — no credit card required. You can explore all core features before deciding to upgrade.',
  },
  {
    q: 'How many emails can I generate per token?',
    a: 'Each generation request costs 1 token and produces up to 3 unique email variations with different subject lines and angles, so you get maximum value per token.',
  },
  {
    q: 'Can I generate follow-up email sequences?',
    a: 'Yes. For business outreach, PitchPerfect generates complete 4-email sequences (Day 1, 3, 7, 14) — each email in the sequence continues the role-targeted strategy so your follow-ups stay relevant, not generic.',
  },
  {
    q: 'Are my emails and business data kept private?',
    a: 'Yes. All data is encrypted in transit and at rest. We never share or sell your information, and your generated emails are only visible to you.',
  },
];

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-6 py-5 text-left bg-white hover:bg-gray-50 transition-colors"
      >
        <span className="font-semibold text-gray-900 text-base pr-4">{q}</span>
        <span
          className="text-2xl text-indigo-500 flex-shrink-0 transition-transform duration-300"
          style={{ transform: open ? 'rotate(45deg)' : 'rotate(0deg)' }}
        >+</span>
      </button>
      <div style={{ maxHeight: open ? '400px' : '0', opacity: open ? 1 : 0, transition: 'max-height 0.4s ease, opacity 0.3s ease', overflow: 'hidden' }}>
        <p className="px-6 pb-5 text-gray-600 leading-relaxed">{a}</p>
      </div>
    </div>
  );
}

function RoleShowcase({ roles, accentColor }: { roles: { role: string; focus: string }[]; accentColor: string }) {
  const [active, setActive] = useState(0);
  return (
    <div className="flex flex-col md:flex-row gap-4">
      {/* Role list */}
      <div className="flex flex-col gap-2 md:w-52 shrink-0">
        {roles.map((r, i) => (
          <button
            key={r.role}
            onClick={() => setActive(i)}
            className={`text-left px-4 py-2.5 rounded-lg text-sm font-semibold transition-all border ${
              active === i
                ? `${accentColor} text-white border-transparent shadow-md`
                : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-300'
            }`}
          >
            {r.role}
          </button>
        ))}
      </div>
      {/* Focus area */}
      <div className="flex-1 bg-white border border-gray-100 rounded-2xl p-6 shadow-sm flex flex-col justify-center min-h-[120px]">
        <div className="text-xs font-semibold uppercase tracking-widest text-indigo-400 mb-2">AI Focus for {roles[active].role}</div>
        <p className="text-gray-800 text-base leading-relaxed font-medium">{roles[active].focus}</p>
        <div className="mt-4 flex items-center gap-2 text-xs text-gray-400">
          <span className="w-2 h-2 rounded-full bg-green-400 inline-block" />
          Content, tone, and CTA all adapt automatically
        </div>
      </div>
    </div>
  );
}

export default function HomePage() {
  const { isAuthenticated } = useAuth();
  const typewritten = useTypewriter(TYPING_PHRASES);
  const [activeMode, setActiveMode] = useState<'business' | 'job'>('business');

  return (
    <div className="overflow-x-hidden">
      <style>{`
        @keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-12px); } }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes gradientShift { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
        .animate-float { animation: float 4s ease-in-out infinite; }
        .animate-fade-in-up { animation: fadeInUp 0.8s ease forwards; }
        .gradient-animated {
          background: linear-gradient(135deg, #1e1b4b, #312e81, #4338ca, #7c3aed, #312e81);
          background-size: 300% 300%;
          animation: gradientShift 8s ease infinite;
        }
        .hero-glow { position: absolute; border-radius: 50%; filter: blur(80px); opacity: 0.3; }
        .card-hover { transition: transform 0.3s ease, box-shadow 0.3s ease; }
        .card-hover:hover { transform: translateY(-6px); box-shadow: 0 20px 40px rgba(99, 102, 241, 0.15); }
        .role-tag { display: inline-flex; align-items: center; background: rgba(255,255,255,0.12); border: 1px solid rgba(255,255,255,0.2); border-radius: 9999px; padding: 4px 12px; font-size: 12px; font-weight: 600; margin: 3px; backdrop-filter: blur(8px); }
      `}</style>

      {/* ── Hero ── */}
      <section className="gradient-animated text-white pt-28 pb-32 px-4 relative overflow-hidden min-h-screen flex items-center">
        <div className="hero-glow bg-purple-400 w-96 h-96 top-10 -left-20" />
        <div className="hero-glow bg-indigo-400 w-80 h-80 bottom-10 right-10" />
        <div className="hero-glow bg-blue-400 w-64 h-64 top-1/2 left-1/2 -translate-x-1/2" />

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-5 py-2 text-sm font-medium mb-8" style={{ animation: 'fadeInUp 0.6s ease forwards' }}>
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse inline-block" />
            Role-Targeted AI Email Generator — Business &amp; Job Seeking
          </div>

          <h1 className="text-6xl md:text-7xl font-extrabold mb-6 leading-tight tracking-tight" style={{ animation: 'fadeInUp 0.7s ease 0.1s both' }}>
            Write{' '}
            <span className="relative">
              <span className="text-yellow-300">{typewritten}</span>
              <span className="animate-pulse text-yellow-300">|</span>
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-indigo-200 mb-6 max-w-2xl mx-auto leading-relaxed" style={{ animation: 'fadeInUp 0.7s ease 0.2s both' }}>
            The only email generator that knows what a <span className="text-yellow-200 font-bold">CFO</span> cares about vs a <span className="text-yellow-200 font-bold">CTO</span> — and writes accordingly. For business outreach <em>and</em> job applications.
          </p>

          {/* Role tags preview */}
          <div className="mb-8 flex flex-wrap justify-center max-w-2xl mx-auto" style={{ animation: 'fadeInUp 0.7s ease 0.25s both' }}>
            {['CEO', 'CTO', 'CFO', 'CMO', 'VP of Sales', 'Hiring Manager', 'HR Recruiter', 'CISO', 'Founder', 'Head of Growth'].map((r) => (
              <span key={r} className="role-tag">{r}</span>
            ))}
            <span className="role-tag text-yellow-200">+29 more roles</span>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center" style={{ animation: 'fadeInUp 0.7s ease 0.35s both' }}>
            {isAuthenticated ? (
              <Link href="/generate" className="inline-flex items-center gap-2 bg-white text-indigo-700 px-8 py-4 rounded-xl font-bold text-lg hover:bg-indigo-50 transition-all shadow-lg hover:shadow-xl">
                Start Generating <span className="text-xl">→</span>
              </Link>
            ) : (
              <>
                <Link href="/signup" className="inline-flex items-center gap-2 bg-white text-indigo-700 px-8 py-4 rounded-xl font-bold text-lg hover:bg-indigo-50 transition-all shadow-lg hover:shadow-xl">
                  Get Started Free <span className="text-xl">→</span>
                </Link>
                <Link href="/login" className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/30 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-white/20 transition-all">
                  Sign In
                </Link>
              </>
            )}
          </div>

          <p className="mt-6 text-indigo-300 text-sm" style={{ animation: 'fadeInUp 0.7s ease 0.45s both' }}>
            Free to start — no credit card required
          </p>

          <div className="mt-14 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-2xl mx-auto" style={{ animation: 'fadeInUp 0.7s ease 0.55s both' }}>
            {[
              { value: '38', label: 'Business Roles' },
              { value: '21', label: 'Job Recipient Roles' },
              { value: '3+', label: 'Email Variations' },
              { value: '2', label: 'Complete Modes' },
            ].map((stat) => (
              <div key={stat.label} className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                <div className="text-3xl font-extrabold text-yellow-300">{stat.value}</div>
                <div className="text-indigo-300 text-xs mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Dual Mode Section ── */}
      <section className="py-24 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <RevealSection className="text-center mb-14">
            <span className="text-indigo-600 font-semibold text-sm uppercase tracking-widest">Two Complete Modes</span>
            <h2 className="text-4xl font-extrabold text-gray-900 mt-3 mb-4">Built for Sales Teams and Job Seekers</h2>
            <p className="text-gray-500 text-lg max-w-xl mx-auto">One platform. Two powerful email engines. Each one role-intelligent from the ground up.</p>
          </RevealSection>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Business Outreach */}
            <RevealSection delay={0}>
              <div className="rounded-2xl border-2 border-indigo-100 bg-gradient-to-br from-indigo-50 to-white p-8 h-full card-hover">
                <div className="inline-flex items-center gap-2 bg-indigo-600 text-white text-xs font-bold px-3 py-1.5 rounded-full mb-5">
                  📈 Business Outreach
                </div>
                <h3 className="text-2xl font-extrabold text-gray-900 mb-3">Close More Deals</h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Generate cold outreach emails for any business goal. Our AI knows how a <strong>CFO evaluates ROI</strong>, how a <strong>CISO assesses risk</strong>, and how a <strong>VP of Sales thinks about pipeline</strong> — and writes accordingly.
                </p>
                <ul className="space-y-2.5 text-sm text-gray-700 mb-8">
                  {[
                    '38 decision-maker roles supported',
                    'Role-specific content, language & CTA',
                    '4-email follow-up sequences',
                    'Up to 3 unique variations per generation',
                    'Industry, company size & pain-point targeting',
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <span className="text-indigo-500 mt-0.5 shrink-0">✓</span>
                      {item}
                    </li>
                  ))}
                </ul>
                <Link href={isAuthenticated ? '/generate' : '/signup'} className="inline-flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-indigo-700 transition-all">
                  Start Outreach <span>→</span>
                </Link>
              </div>
            </RevealSection>

            {/* Job Seeking */}
            <RevealSection delay={100}>
              <div className="rounded-2xl border-2 border-purple-100 bg-gradient-to-br from-purple-50 to-white p-8 h-full card-hover">
                <div className="inline-flex items-center gap-2 bg-purple-600 text-white text-xs font-bold px-3 py-1.5 rounded-full mb-5">
                  💼 Job Seeking
                </div>
                <h3 className="text-2xl font-extrabold text-gray-900 mb-3">Land Your Next Role</h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Write job application emails that actually get read. Tell us who you're emailing — <strong>HR Recruiter, CTO, Hiring Manager, or Founder</strong> — and the AI crafts a completely different email for each.
                </p>
                <ul className="space-y-2.5 text-sm text-gray-700 mb-8">
                  {[
                    '21 recipient roles (HR, CTO, CEO, Founder & more)',
                    'Email angle adapts to who is reading it',
                    'Tailored CTA per recipient role',
                    'Fresher to Senior to Manager profiles',
                    'Custom instructions on top of structured form',
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <span className="text-purple-500 mt-0.5 shrink-0">✓</span>
                      {item}
                    </li>
                  ))}
                </ul>
                <Link href={isAuthenticated ? '/generate' : '/signup'} className="inline-flex items-center gap-2 bg-purple-600 text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-purple-700 transition-all">
                  Get Hired <span>→</span>
                </Link>
              </div>
            </RevealSection>
          </div>
        </div>
      </section>

      {/* ── Role Intelligence Section ── */}
      <section className="py-24 px-4 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <RevealSection className="text-center mb-4">
            <span className="text-indigo-600 font-semibold text-sm uppercase tracking-widest">The Core Advantage</span>
            <h2 className="text-4xl font-extrabold text-gray-900 mt-3 mb-4">
              Role Intelligence — Not Templates
            </h2>
            <p className="text-gray-500 text-lg max-w-2xl mx-auto">
              Every recipient role has a dedicated AI strategy. Click any role below to see exactly what our AI focuses on when writing to them.
            </p>
          </RevealSection>

          {/* Mode toggle */}
          <RevealSection className="flex justify-center gap-3 mb-10 mt-8">
            <button
              onClick={() => setActiveMode('business')}
              className={`px-5 py-2.5 rounded-full font-semibold text-sm transition-all border-2 ${activeMode === 'business' ? 'bg-indigo-600 text-white border-indigo-600 shadow-md' : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-300'}`}
            >
              📈 Business Outreach Roles
            </button>
            <button
              onClick={() => setActiveMode('job')}
              className={`px-5 py-2.5 rounded-full font-semibold text-sm transition-all border-2 ${activeMode === 'job' ? 'bg-purple-600 text-white border-purple-600 shadow-md' : 'bg-white text-gray-600 border-gray-200 hover:border-purple-300'}`}
            >
              💼 Job Recipient Roles
            </button>
          </RevealSection>

          <RevealSection delay={100}>
            {activeMode === 'business' ? (
              <RoleShowcase roles={BUSINESS_ROLES_PREVIEW} accentColor="bg-indigo-600" />
            ) : (
              <RoleShowcase roles={JOB_ROLES_PREVIEW} accentColor="bg-purple-600" />
            )}
          </RevealSection>

          <RevealSection delay={200} className="mt-8 text-center">
            <p className="text-gray-500 text-sm">
              {activeMode === 'business'
                ? 'Showing 8 of 38 supported business roles'
                : 'Showing 6 of 21 supported job recipient roles'}
              {' '}—{' '}
              <Link href={isAuthenticated ? '/generate' : '/signup'} className="text-indigo-600 font-semibold hover:underline">
                try all roles free
              </Link>
            </p>
          </RevealSection>
        </div>
      </section>

      {/* ── Features Grid ── */}
      <section className="py-24 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <RevealSection className="text-center mb-16">
            <span className="text-indigo-600 font-semibold text-sm uppercase tracking-widest">Why PitchPerfect</span>
            <h2 className="text-4xl font-extrabold text-gray-900 mt-3 mb-4">Everything Built Around the Recipient</h2>
            <p className="text-gray-500 text-lg max-w-xl mx-auto">Not a template engine. A role-aware AI that understands who is reading your email.</p>
          </RevealSection>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((f, i) => (
              <RevealSection key={f.title} delay={i * 80}>
                <div className="bg-gray-50 p-7 rounded-2xl border border-gray-100 card-hover h-full">
                  <div className="text-4xl mb-4 animate-float" style={{ animationDelay: `${i * 0.3}s` }}>{f.icon}</div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{f.title}</h3>
                  <p className="text-gray-500 leading-relaxed text-sm">{f.desc}</p>
                </div>
              </RevealSection>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="py-24 px-4 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <RevealSection className="text-center mb-16">
            <span className="text-indigo-600 font-semibold text-sm uppercase tracking-widest">Simple Process</span>
            <h2 className="text-4xl font-extrabold text-gray-900 mt-3 mb-4">From Zero to Role-Targeted Email in 60 Seconds</h2>
            <p className="text-gray-500 text-lg">Four steps. That's all it takes.</p>
          </RevealSection>

          <div className="relative">
            <div className="absolute left-6 top-8 bottom-8 w-0.5 bg-gradient-to-b from-indigo-500 to-purple-500 hidden md:block" />
            <div className="space-y-8">
              {STEPS.map((step, i) => (
                <RevealSection key={step.label} delay={i * 120}>
                  <div className="flex gap-6 items-start group">
                    <div className="relative flex-shrink-0">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center font-bold text-lg shadow-lg group-hover:scale-110 transition-transform z-10 relative">
                        {i + 1}
                      </div>
                    </div>
                    <div className="bg-white rounded-2xl p-6 flex-1 border border-gray-100 group-hover:border-indigo-200 transition-colors">
                      <h3 className="text-lg font-bold text-gray-900 mb-1">{step.label}</h3>
                      <p className="text-gray-500 text-sm leading-relaxed">{step.desc}</p>
                    </div>
                  </div>
                </RevealSection>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Mid-page CTA ── */}
      <section className="py-20 px-4 bg-gradient-to-r from-indigo-600 to-purple-700 text-white relative overflow-hidden">
        <div className="hero-glow bg-white w-80 h-80 top-0 right-0 opacity-10" />
        <RevealSection className="max-w-3xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-white/15 border border-white/25 rounded-full px-4 py-1.5 text-xs font-semibold mb-6">
            59 recipient roles across both modes
          </div>
          <h2 className="text-4xl font-extrabold mb-4">Every Email Written for the Person Reading It</h2>
          <p className="text-indigo-200 text-lg mb-8 max-w-xl mx-auto">
            Stop sending the same pitch to everyone. Start writing emails that speak directly to what each decision-maker or hiring manager actually cares about.
          </p>
          {!isAuthenticated && (
            <Link href="/signup" className="inline-flex items-center gap-2 bg-white text-indigo-700 px-10 py-4 rounded-xl font-bold text-lg hover:bg-indigo-50 transition-all shadow-xl">
              Try It Free — No Card Needed <span className="text-xl">→</span>
            </Link>
          )}
          {isAuthenticated && (
            <Link href="/generate" className="inline-flex items-center gap-2 bg-white text-indigo-700 px-10 py-4 rounded-xl font-bold text-lg hover:bg-indigo-50 transition-all shadow-xl">
              Generate a Role-Targeted Email <span className="text-xl">→</span>
            </Link>
          )}
        </RevealSection>
      </section>

      {/* ── FAQ ── */}
      <section className="py-24 px-4 bg-gray-50">
        <div className="max-w-3xl mx-auto">
          <RevealSection className="text-center mb-14">
            <span className="text-indigo-600 font-semibold text-sm uppercase tracking-widest">FAQ</span>
            <h2 className="text-4xl font-extrabold text-gray-900 mt-3 mb-4">Frequently Asked Questions</h2>
            <p className="text-gray-500 text-lg">Everything you need to know about PitchPerfect.</p>
          </RevealSection>

          <div className="space-y-3">
            {FAQS.map((faq, i) => (
              <RevealSection key={faq.q} delay={i * 60}>
                <FAQItem q={faq.q} a={faq.a} />
              </RevealSection>
            ))}
          </div>

          <RevealSection delay={200} className="text-center mt-12">
            <p className="text-gray-500">
              Still have questions?{' '}
              <Link href="/contact" className="text-indigo-600 font-semibold hover:underline">Contact us</Link>
            </p>
          </RevealSection>
        </div>
      </section>
    </div>
  );
}
