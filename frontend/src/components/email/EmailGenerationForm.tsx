'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { EmailGenerationInput } from '../../types/index';
import { useEmailGeneration } from '../../hooks/useEmailGeneration';
import { INDUSTRIES, TARGET_ROLES, COMPANY_SIZES, TONE_OPTIONS, LENGTH_OPTIONS, EMAIL_TYPE_OPTIONS, CTA_TYPE_OPTIONS } from '../../utils/constants';

export default function EmailGenerationForm() {
  const { register, handleSubmit, watch, formState: { errors } } = useForm<EmailGenerationInput>({
    defaultValues: {
      variations: 1,
      generateSequence: false,
    },
  });
  const { generateEmails, loading, error } = useEmailGeneration();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const onSubmit = async (data: EmailGenerationInput) => {
    setSuccessMessage(null);

    try {
      await generateEmails(data);
      setSuccessMessage('Emails generated successfully!');
    } catch (err) {
      // Error is handled in the hook
    }
  };

  const painPointsValue = watch('painPoints');

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-lg">
      <h1 className="text-3xl font-bold mb-8">Generate Cold Emails</h1>

      {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}
      {successMessage && <div className="bg-green-100 text-green-700 p-3 rounded mb-4">{successMessage}</div>}

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
          {...register('painPoints', { required: 'At least one pain point is required' })}
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
            {...register('variations', { min: 1, max: 5 })}
            type="number"
            min="1"
            max="5"
            className="w-full border rounded px-3 py-2"
          />
        </div>

        <div className="flex items-end">
          <label className="flex items-center">
            <input {...register('generateSequence')} type="checkbox" className="mr-2" />
            <span>Generate Email Sequence</span>
          </label>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-secondary text-white py-3 rounded font-medium hover:bg-blue-600 disabled:opacity-50"
      >
        {loading ? 'Generating...' : 'Generate Emails'}
      </button>
    </form>
  );
}
