'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { EmailGenerationInput, EmailPurpose } from '../../types/index';
import { useEmailGeneration } from '../../hooks/useEmailGeneration';
import { useEmailStore } from '../../lib/emailStore';
import { useAuth } from '../../hooks/useAuth';
import { useUserProfile } from '../../hooks/useUserProfile';
import {
  INDUSTRIES, TARGET_ROLES, COMPANY_SIZES, TONE_OPTIONS, LENGTH_OPTIONS,
  EMAIL_TYPE_OPTIONS, CTA_TYPE_OPTIONS, EMAIL_PURPOSE_OPTIONS, JOB_RECIPIENT_ROLES,
} from '../../utils/constants';
import GeneratedEmailsDisplay from './GeneratedEmailsDisplay';
import TemplateManager from './TemplateManager';
import { useTemplateStore } from '../../lib/templateStore';
import { emailAPI } from '../../lib/api';

export default function EmailGenerationForm() {
  const [inputMode] = useState<'structured' | 'custom'>('structured');
  const [emailPurpose, setEmailPurpose] = useState<EmailPurpose>('business');
  const { user } = useAuth();
  const { profile } = useUserProfile();
  const { lastUsedTemplateId, getTemplate, saveTemplate, setLastUsed } = useTemplateStore();

  const { register, handleSubmit, watch, getValues, formState: { errors }, reset } = useForm<EmailGenerationInput>({
    defaultValues: {
      senderName: user?.name || '',
      senderRole: '',
      senderCompany: '',
      senderWebsite: '',
      productDescription: '',
      valueProposition: '',
      usp: '',
      targetIndustry: '',
      targetRole: '',
      companySize: '',
      geography: '',
      painPoints: [],
      tone: 'professional',
      length: 'medium',
      emailType: 'cold_outreach',
      ctaType: 'book_call',
      variations: 1,
      generateSequence: false,
      useCustomInput: false,
      emailPurpose: 'business',
      // job-seeking defaults
      jobSeekerProfile: 'software_engineer',
      recipientRole: 'hr_recruiter',
      yearsOfExperience: '',
      skills: '',
      targetCompany: '',
      jobTitle: '',
    },
  });

  useEffect(() => {
    if (lastUsedTemplateId) {
      const template = getTemplate(lastUsedTemplateId);
      if (template) reset(template.values as any);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (profile && !lastUsedTemplateId) {
      reset((prev) => ({
        ...prev,
        senderName: user?.name || prev.senderName || '',
        senderRole: profile.role || '',
        senderCompany: profile.company || '',
        senderWebsite: profile.website || '',
        productDescription: profile.productDescription || '',
        valueProposition: profile.valueProposition || '',
        usp: profile.usp || '',
      }));
    }
  }, [profile, user, reset, lastUsedTemplateId]);

  const { generateEmails, loading, error, generatedEmails } = useEmailGeneration();
  const { setGenerations } = useEmailStore();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [emailType, setEmailType] = useState<string>('cold_outreach');
  const [showBottomSaveInput, setShowBottomSaveInput] = useState(false);
  const [bottomTemplateName, setBottomTemplateName] = useState('');
  const [bottomSaveSuccess, setBottomSaveSuccess] = useState(false);
  const handleBottomSave = () => {
    const name = bottomTemplateName.trim();
    if (!name) return;
    const saved = saveTemplate(name, getValues());
    setLastUsed(saved.id);
    setBottomTemplateName('');
    setShowBottomSaveInput(false);
    setBottomSaveSuccess(true);
    setTimeout(() => setBottomSaveSuccess(false), 2000);
  };

  useEffect(() => {
    emailAPI.getHistory(20).then((result) => {
      if (result.success && Array.isArray(result.data)) {
        setGenerations(result.data);
      }
    }).catch(() => {});
  }, [setGenerations]);

  const onSubmit = async (data: any) => {
    setSuccessMessage(null);
    try {
      let processedData: EmailGenerationInput;

      if (inputMode === 'custom') {
        processedData = {
          variations: data.variations || 1,
          generateSequence: data.generateSequence || false,
          customPrompt: data.customPrompt,
          useCustomInput: true,
          emailPurpose,
        };
        setEmailType('custom_prompt');
      } else if (emailPurpose === 'job_seeking') {
        processedData = {
          ...data,
          emailPurpose: 'job_seeking',
          useCustomInput: false,
          customPrompt: data.customPrompt?.trim() || undefined,
        };
        setEmailType('job_inquiry');
      } else {
        const painPointsArray = typeof data.painPoints === 'string'
          ? data.painPoints.split(',').map((p: string) => p.trim()).filter((p: string) => p.length > 0)
          : Array.isArray(data.painPoints) ? data.painPoints : [];

        processedData = {
          ...data,
          painPoints: painPointsArray,
          emailPurpose: 'business',
          customPrompt: data.customPrompt?.trim() || undefined,
          useCustomInput: false,
        };
        setEmailType(processedData.emailType || 'cold_outreach');
      }

      await generateEmails(processedData);
      setSuccessMessage('Emails generated successfully!');
    } catch (_err) {
      // Error handled in hook
    }
  };

  const variationsValue = watch('variations') || 1;
  const estimatedTokens = variationsValue;
  const selectedJobProfile = watch('jobSeekerProfile');

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-lg">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-6">Generate Cold Emails</h1>

          <TemplateManager
            onSave={() => getValues()}
            onLoad={(values) => reset(values as any)}
          />

          {/* Purpose Toggle */}
          <div className="mb-6">
            <p className="text-sm font-medium text-gray-600 mb-2">What are you generating emails for?</p>
            <div className="flex gap-3">
              {EMAIL_PURPOSE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setEmailPurpose(opt.value as EmailPurpose)}
                  className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all flex items-center justify-center gap-2 border-2 ${
                    emailPurpose === opt.value
                      ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                      : 'bg-white text-gray-700 border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                  }`}
                >
                  <span>{opt.icon}</span>
                  <span>{opt.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Input Mode Toggle — kept for future use, currently only structured */}
          {/* <div className="flex gap-4 mb-8">
            <div className="flex-1 py-3 px-4 rounded-lg font-medium bg-blue-600 text-white shadow-md text-center">
              Structured Form
            </div>
          </div> */}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded mb-4 flex items-start gap-2">
            <span className="mt-0.5 shrink-0">&#9888;</span>
            <span>{error}</span>
          </div>
        )}
        {successMessage && <div className="bg-green-100 text-green-700 p-3 rounded mb-4">{successMessage}</div>}

        {/* ── JOB-SEEKING FORM ── */}
        {emailPurpose === 'job_seeking' ? (
          <>
            {/* Job Seeker Profile Selector — UI hidden; field kept for prompt context via default value */}
            <input type="hidden" {...register('jobSeekerProfile')} />

            {/* Applicant Info */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium mb-1">Your Full Name</label>
                <input
                  {...register('senderName', { required: 'Name is required' })}
                  type="text"
                  className="w-full border rounded px-3 py-2"
                  placeholder="Priya Sharma"
                />
                {errors.senderName && <span className="text-red-600 text-sm">{errors.senderName.message}</span>}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  {selectedJobProfile === 'fresher' ? 'Degree / Field of Study' : 'Current / Last Role'}
                </label>
                <input
                  {...register('senderRole')}
                  type="text"
                  className="w-full border rounded px-3 py-2"
                  placeholder={selectedJobProfile === 'fresher' ? 'B.Tech Computer Science' : 'Senior Software Engineer'}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium mb-1">
                  {selectedJobProfile === 'fresher' ? 'College / University (optional)' : 'Current / Previous Company'}
                </label>
                <input
                  {...register('senderCompany')}
                  type="text"
                  className="w-full border rounded px-3 py-2"
                  placeholder={selectedJobProfile === 'fresher' ? 'IIT Delhi' : 'Infosys / TCS / Startup'}
                />
              </div>

              {selectedJobProfile !== 'fresher' && (
                <div>
                  <label className="block text-sm font-medium mb-1">Years of Experience</label>
                  <input
                    {...register('yearsOfExperience')}
                    type="text"
                    className="w-full border rounded px-3 py-2"
                    placeholder="e.g. 5 years"
                  />
                </div>
              )}
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium mb-1">Key Skills / Technologies</label>
              <input
                {...register('skills', { required: 'Please list at least one skill' })}
                type="text"
                className="w-full border rounded px-3 py-2"
                placeholder="e.g. React, Node.js, AWS, Python, System Design"
              />
              {errors.skills && <span className="text-red-600 text-sm">{errors.skills.message}</span>}
            </div>

            {/* Target Info */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium mb-1">Job Title Applying For</label>
                <input
                  {...register('jobTitle', { required: 'Job title is required' })}
                  type="text"
                  className="w-full border rounded px-3 py-2"
                  placeholder="e.g. Senior Backend Engineer"
                />
                {errors.jobTitle && <span className="text-red-600 text-sm">{errors.jobTitle.message}</span>}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Target Company (optional)</label>
                <input
                  {...register('targetCompany')}
                  type="text"
                  className="w-full border rounded px-3 py-2"
                  placeholder="e.g. Google, Flipkart, any startup"
                />
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium mb-1">Who are you writing to?</label>
              <select
                {...register('recipientRole', { required: 'Select who you are writing this email to' })}
                className="w-full border rounded px-3 py-2"
              >
                <option value="">Select recipient role</option>
                {JOB_RECIPIENT_ROLES.map((r) => (
                  <option key={r.value} value={r.value}>{r.label} — {r.description}</option>
                ))}
              </select>
              {errors.recipientRole && <span className="text-red-600 text-sm">{errors.recipientRole.message}</span>}
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium mb-1">Target Industry</label>
              <select
                {...register('targetIndustry')}
                className="w-full border rounded px-3 py-2"
              >
                <option value="">Select industry (optional)</option>
                {INDUSTRIES.map((ind) => (
                  <option key={ind} value={ind}>{ind}</option>
                ))}
              </select>
            </div>

            {/* Optional user instruction */}
            <div className="mb-6 p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
              <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                <span>Additional Instructions (Optional)</span>
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">Extra guidance</span>
              </label>
              <textarea
                {...register('customPrompt')}
                className="w-full border border-blue-300 rounded px-3 py-2 bg-white focus:outline-none focus:border-blue-500"
                placeholder="e.g. Mention my open-source contributions. Emphasize remote work preference. Reference their recent product launch."
                rows={3}
              />
            </div>

            {/* Email Settings */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium mb-1">Tone</label>
                <select {...register('tone', { required: true })} className="w-full border rounded px-3 py-2">
                  {TONE_OPTIONS.map((tone) => (
                    <option key={tone} value={tone}>{tone.charAt(0).toUpperCase() + tone.slice(1)}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Length</label>
                <select {...register('length', { required: true })} className="w-full border rounded px-3 py-2">
                  {LENGTH_OPTIONS.map((len) => (
                    <option key={len} value={len}>{len.charAt(0).toUpperCase() + len.slice(1)}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Variations</label>
                <input
                  {...register('variations', { required: true, min: 1, max: 3, valueAsNumber: true })}
                  type="number"
                  min="1"
                  max="3"
                  className="w-full border rounded px-3 py-2"
                />
                <p className="text-xs text-blue-600 mt-1">
                  Uses <strong>{estimatedTokens}</strong> token{estimatedTokens > 1 ? 's' : ''}
                </p>
              </div>
            </div>
          </>
        ) : (
          /* ── BUSINESS OUTREACH FORM ── */
          <>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium mb-1">Your Name</label>
                <input
                  {...register('senderName', { required: 'Name is required' })}
                  type="text"
                  className="w-full border rounded px-3 py-2"
                  placeholder="John Smith"
                />
                {errors.senderName && <span className="text-red-600 text-sm">{errors.senderName.message}</span>}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Your Role</label>
                <input
                  {...register('senderRole', { required: 'Role is required' })}
                  type="text"
                  className="w-full border rounded px-3 py-2"
                  placeholder="Sales Executive"
                />
                {errors.senderRole && <span className="text-red-600 text-sm">{errors.senderRole.message}</span>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium mb-1">Your Company</label>
                <input
                  {...register('senderCompany', { required: 'Company is required' })}
                  type="text"
                  className="w-full border rounded px-3 py-2"
                  placeholder="Tech Solutions Inc"
                />
                {errors.senderCompany && <span className="text-red-600 text-sm">{errors.senderCompany.message}</span>}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Website</label>
                <input
                  {...register('senderWebsite')}
                  type="url"
                  className="w-full border rounded px-3 py-2"
                  placeholder="https://techsolutions.com"
                />
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium mb-1">Product/Service Description</label>
              <textarea
                {...register('productDescription', { required: 'Description is required' })}
                className="w-full border rounded px-3 py-2"
                placeholder="What do you offer?"
                rows={3}
              />
              {errors.productDescription && <span className="text-red-600 text-sm">{errors.productDescription.message}</span>}
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium mb-1">Target Industry</label>
                <select
                  {...register('targetIndustry', { required: 'Industry is required' })}
                  className="w-full border rounded px-3 py-2"
                >
                  <option value="">Select industry</option>
                  {INDUSTRIES.map((ind) => (
                    <option key={ind} value={ind}>{ind}</option>
                  ))}
                </select>
                {errors.targetIndustry && <span className="text-red-600 text-sm">{errors.targetIndustry.message}</span>}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Target Role</label>
                <select
                  {...register('targetRole', { required: 'Role is required' })}
                  className="w-full border rounded px-3 py-2"
                >
                  <option value="">Select role</option>
                  {TARGET_ROLES.map((role) => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </select>
                {errors.targetRole && <span className="text-red-600 text-sm">{errors.targetRole.message}</span>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium mb-1">Company Size</label>
                <select
                  {...register('companySize', { required: 'Size is required' })}
                  className="w-full border rounded px-3 py-2"
                >
                  <option value="">Select size</option>
                  {COMPANY_SIZES.map((size) => (
                    <option key={size} value={size}>{size}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Geography</label>
                <input
                  {...register('geography')}
                  type="text"
                  className="w-full border rounded px-3 py-2"
                  placeholder="US, Europe, etc"
                />
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Pain Points</label>
              <input
                {...register('painPoints', {
                  required: 'At least one pain point is required',
                  validate: (value) => {
                    const raw = value as unknown as string | string[];
                    if (typeof raw === 'string') {
                      const points = raw.split(',').map(p => p.trim()).filter(p => p.length > 0);
                      return points.length > 0 || 'Enter at least one pain point (separate with commas)';
                    }
                    return Array.isArray(raw) && raw.length > 0 || 'At least one pain point is required';
                  },
                })}
                type="text"
                className="w-full border rounded px-3 py-2"
                placeholder="Separate with commas: slow processes, high costs, etc"
              />
              {errors.painPoints && <span className="text-red-600 text-sm">{errors.painPoints.message}</span>}
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium mb-1">Value Proposition</label>
              <textarea
                {...register('valueProposition', { required: 'Value proposition is required' })}
                className="w-full border rounded px-3 py-2"
                placeholder="How do you solve their problem?"
                rows={2}
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium mb-1">Unique Selling Proposition (USP)</label>
              <textarea
                {...register('usp')}
                className="w-full border rounded px-3 py-2"
                placeholder="What makes you different?"
                rows={2}
              />
            </div>

            <div className="mb-6 p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
              <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                <span>User Instruction (Optional)</span>
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">Extra guidance</span>
              </label>
              <p className="text-xs text-gray-600 mb-2">
                Additional instructions applied on top of the structured fields above.
              </p>
              <textarea
                {...register('customPrompt')}
                className="w-full border border-blue-300 rounded px-3 py-2 bg-white focus:outline-none focus:border-blue-500"
                placeholder="e.g., Emphasize ROI and quick implementation. Use data-driven language."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-4 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium mb-1">Tone</label>
                <select {...register('tone', { required: true })} className="w-full border rounded px-3 py-2">
                  {TONE_OPTIONS.map((tone) => (
                    <option key={tone} value={tone}>{tone.charAt(0).toUpperCase() + tone.slice(1)}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Length</label>
                <select {...register('length', { required: true })} className="w-full border rounded px-3 py-2">
                  {LENGTH_OPTIONS.map((len) => (
                    <option key={len} value={len}>{len.charAt(0).toUpperCase() + len.slice(1)}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Email Type</label>
                <select {...register('emailType', { required: true })} className="w-full border rounded px-3 py-2">
                  {EMAIL_TYPE_OPTIONS.map((type) => (
                    <option key={type} value={type}>{type.replace(/_/g, ' ')}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">CTA Type</label>
                <select {...register('ctaType', { required: true })} className="w-full border rounded px-3 py-2">
                  {CTA_TYPE_OPTIONS.map((cta) => (
                    <option key={cta} value={cta}>{cta.replace(/_/g, ' ')}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium mb-1">Number of Variations</label>
              <input
                {...register('variations', { required: true, min: 1, max: 3, valueAsNumber: true })}
                type="number"
                min="1"
                max="3"
                className="w-full border rounded px-3 py-2 max-w-xs"
              />
              <p className="text-xs text-blue-600 mt-1">
                This will consume <strong>{estimatedTokens}</strong> token{estimatedTokens > 1 ? 's' : ''} ({variationsValue} variation{variationsValue > 1 ? 's' : ''})
              </p>
            </div>
          </>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-secondary text-white py-3 rounded font-medium hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? 'Generating...' : emailPurpose === 'job_seeking' ? 'Generate Job Application Email' : 'Generate Emails'}
        </button>

        <div className="flex items-center justify-end gap-2 mt-3">
          <span className="text-xs text-gray-700">Save current form as template:</span>
          {showBottomSaveInput ? (
            <>
              <input
                type="text"
                value={bottomTemplateName}
                onChange={(e) => setBottomTemplateName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleBottomSave()}
                placeholder="Template name…"
                autoFocus
                className="text-xs border border-amber-300 rounded px-2 py-1.5 w-36 focus:outline-none focus:border-amber-500"
              />
              <button
                type="button"
                onClick={handleBottomSave}
                disabled={!bottomTemplateName.trim()}
                className="text-xs px-3 py-1.5 bg-amber-600 text-white rounded hover:bg-amber-700 disabled:opacity-50 transition-colors"
              >
                Save
              </button>
              <button
                type="button"
                onClick={() => { setShowBottomSaveInput(false); setBottomTemplateName(''); }}
                className="text-xs px-2 py-1.5 text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => setShowBottomSaveInput(true)}
              className={`text-xs px-3 py-1.5 rounded-md  border  border-2 transition-colors whitespace-nowrap ${
                bottomSaveSuccess
                  ? 'bg-green-100 text-green-700 border-green-300'
                  : 'bg-amber-100 text-amber-900 border-blue-500 hover:bg-amber-200'
              }`}
            >
              {bottomSaveSuccess ? '✓ Saved!' : '+ Save as Template'}
            </button>
          )}
        </div>
      </form>

      <div className="max-w-4xl mx-auto py-8">
        {generatedEmails && generatedEmails.emails.length > 0 && (
          <GeneratedEmailsDisplay
            emails={generatedEmails.emails}
            emailType={emailType}
          />
        )}
      </div>
    </>
  );
}
