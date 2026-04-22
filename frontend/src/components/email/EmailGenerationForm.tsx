'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { EmailGenerationInput } from '../../types/index';
import { useEmailGeneration } from '../../hooks/useEmailGeneration';
import { useEmailStore } from '../../lib/emailStore';
import { useAuth } from '../../hooks/useAuth';
import { useUserProfile } from '../../hooks/useUserProfile';
import { INDUSTRIES, TARGET_ROLES, COMPANY_SIZES, TONE_OPTIONS, LENGTH_OPTIONS, EMAIL_TYPE_OPTIONS, CTA_TYPE_OPTIONS } from '../../utils/constants';
import GeneratedEmailsDisplay from './GeneratedEmailsDisplay';
import GenerationHistory from './GenerationHistory';
import TemplateManager from './TemplateManager';
import { useTemplateStore } from '../../lib/templateStore';
import { emailAPI } from '../../lib/api';

export default function EmailGenerationForm() {
  const [inputMode, setInputMode] = useState<'structured' | 'custom'>('structured');
  const { user } = useAuth();
  const { profile } = useUserProfile();
  const { lastUsedTemplateId, getTemplate } = useTemplateStore();

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
    },
  });

  // Auto-load last used template on mount (before profile fills in)
  useEffect(() => {
    if (lastUsedTemplateId) {
      const template = getTemplate(lastUsedTemplateId);
      if (template) reset(template.values as any);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Pre-populate sender fields from profile once loaded (skipped if template was loaded)
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
  const { generations, setGenerations } = useEmailStore();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    emailAPI.getHistory(20).then((result) => {
      if (result.success && Array.isArray(result.data)) {
        setGenerations(result.data);
      }
    }).catch(() => {});
  }, [setGenerations]);
  const [emailType, setEmailType] = useState<string>('cold_outreach');

  const onSubmit = async (data: any) => {
    setSuccessMessage(null);

    try {
      let processedData: EmailGenerationInput;

      if (inputMode === 'custom') {
        // For custom input mode, only use essential fields
        processedData = {
          variations: data.variations || 1,
          generateSequence: data.generateSequence || false,
          customPrompt: data.customPrompt,
          useCustomInput: true,
        };
        setEmailType('custom_prompt');
      } else {
        // Structured input mode — always use structured fields; customPrompt is extra user instruction
        const painPointsArray = typeof data.painPoints === 'string'
          ? data.painPoints.split(',').map((point: string) => point.trim()).filter((point: string) => point.length > 0)
          : Array.isArray(data.painPoints) ? data.painPoints : [];

        processedData = {
          ...data,
          painPoints: painPointsArray,
          customPrompt: data.customPrompt?.trim() || undefined,
          useCustomInput: false,
        };
        setEmailType(processedData.emailType || 'cold_outreach');
      }

      await generateEmails(processedData);
      setSuccessMessage('Emails generated successfully!');
    } catch (err) {
      // Error is handled in the hook
    }
  };

  const painPointsValue = watch('painPoints');
  const variationsValue = watch('variations') || 1;
  const estimatedTokens = variationsValue;

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-lg">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-6">Generate Cold Emails</h1>

          <TemplateManager
            onSave={() => getValues()}
            onLoad={(values) => reset(values as any)}
          />

          {/* Input Mode Toggle */}
          <div className="flex gap-4 mb-8">
            <button
              type="button"
              onClick={() => setInputMode('structured')}
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
                inputMode === 'structured'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              📋 Structured Form
            </button>
            <button
              type="button"
              onClick={() => setInputMode('custom')}
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
                inputMode === 'custom'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              ✏️ Custom Prompt
            </button>
          </div>
        </div>

        {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}
        {successMessage && <div className="bg-green-100 text-green-700 p-3 rounded mb-4">{successMessage}</div>}

        {inputMode === 'custom' ? (
          // Custom Input Mode
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">✨ Custom Email Generation Prompt</label>
              <p className="text-sm text-gray-600 mb-3">
                Write any instructions or context for generating emails. Be as specific as possible about tone, content, style, and goals.
              </p>
              <textarea
                {...register('customPrompt', { 
                  required: 'Custom prompt is required',
                  minLength: { value: 20, message: 'Prompt must be at least 20 characters' }
                })}
                className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:border-blue-500 focus:outline-none text-base"
                placeholder="e.g., Generate professional cold emails for B2B SaaS leads that emphasize cost savings. Include a sense of urgency but remain respectful. Target CTOs of mid-sized tech companies..."
                rows={6}
              />
              {errors.customPrompt && <span className="text-red-600 text-sm block mt-1">{errors.customPrompt.message}</span>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Number of Variations</label>
                <input
                  {...register('variations', { required: true, min: 1, max: 3, valueAsNumber: true })}
                  type="number"
                  min="1"
                  max="3"
                  className="w-full border rounded px-3 py-2"
                />
                <p className="text-xs text-blue-600 mt-1">
                  This will consume <strong>{estimatedTokens}</strong> token{estimatedTokens > 1 ? 's' : ''} from your balance ({variationsValue} variation{variationsValue > 1 ? 's' : ''})
                </p>
              </div>

              <div className="flex items-end">
                <label className="flex items-center cursor-pointer">
                  <input {...register('generateSequence')} type="checkbox" className="mr-3 w-4 h-4" />
                  <span className="text-sm font-medium">Generate Email Sequence</span>
                </label>
              </div>
            </div>
          </div>
        ) : (
          // Structured Input Mode
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
                    <option key={ind} value={ind}>
                      {ind}
                    </option>
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
                    <option key={role} value={role}>
                      {role}
                    </option>
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
                    <option key={size} value={size}>
                      {size}
                    </option>
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
                  }
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
                <span>✨ User Instruction (Optional)</span>
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">Extra guidance</span>
              </label>
              <p className="text-xs text-gray-600 mb-2">
                Additional instructions applied on top of the structured fields above (e.g. tone nuances, specific angles, things to avoid).
              </p>
              <textarea
                {...register('customPrompt')}
                className="w-full border border-blue-300 rounded px-3 py-2 bg-white focus:outline-none focus:border-blue-500"
                placeholder="e.g., Emphasize ROI and quick implementation. Use data-driven language. Avoid mentioning competitors directly."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-4 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium mb-1">Tone</label>
                <select
                  {...register('tone', { required: true })}
                  className="w-full border rounded px-3 py-2"
                >
                  {TONE_OPTIONS.map((tone) => (
                    <option key={tone} value={tone}>
                      {tone.charAt(0).toUpperCase() + tone.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Length</label>
                <select
                  {...register('length', { required: true })}
                  className="w-full border rounded px-3 py-2"
                >
                  {LENGTH_OPTIONS.map((len) => (
                    <option key={len} value={len}>
                      {len.charAt(0).toUpperCase() + len.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Email Type</label>
                <select
                  {...register('emailType', { required: true })}
                  className="w-full border rounded px-3 py-2"
                >
                  {EMAIL_TYPE_OPTIONS.map((type) => (
                    <option key={type} value={type}>
                      {type.replace('_', ' ')}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">CTA Type</label>
                <select
                  {...register('ctaType', { required: true })}
                  className="w-full border rounded px-3 py-2"
                >
                  {CTA_TYPE_OPTIONS.map((cta) => (
                    <option key={cta} value={cta}>
                      {cta.replace('_', ' ')}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium mb-1">Number of Variations</label>
                <input
                  {...register('variations', { required: true, min: 1, max: 3, valueAsNumber: true })}
                  type="number"
                  min="1"
                  max="3"
                  className="w-full border rounded px-3 py-2"
                />
                <p className="text-xs text-blue-600 mt-1">
                  This will consume <strong>{estimatedTokens}</strong> token{estimatedTokens > 1 ? 's' : ''} from your balance ({variationsValue} variation{variationsValue > 1 ? 's' : ''})
                </p>
              </div>

              {/* <div className="flex items-end">
                <label className="flex items-center">
                  <input {...register('generateSequence')} type="checkbox" className="mr-2" />
                  <span>Generate Email Sequence</span>
                </label>
              </div> */}
            </div>
          </>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-secondary text-white py-3 rounded font-medium hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? 'Generating...' : 'Generate Emails'}
        </button>
      </form>

      <div className="max-w-4xl mx-auto py-8">
        {/* Display Generated Emails */}
        {generatedEmails && generatedEmails.emails.length > 0 && (
          <GeneratedEmailsDisplay 
            emails={generatedEmails.emails}
            emailType={emailType}
          />
        )}

        {/* Display Generation History */}
        <GenerationHistory generations={generations} />
      </div>
    </>
  );
}
