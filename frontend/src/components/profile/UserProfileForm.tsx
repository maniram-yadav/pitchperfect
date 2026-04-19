'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { UserProfile } from '../../types/index';
import { useUserProfile } from '../../hooks/useUserProfile';

export default function UserProfileForm() {
  const { profile, loading, updateProfile } = useUserProfile();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors }, reset } = useForm<UserProfile>({
    defaultValues: {
      role: '',
      company: '',
      website: '',
      productDescription: '',
      valueProposition: '',
      usp: '',
    },
  });

  // Populate form once profile loads from API
  useEffect(() => {
    if (profile) {
      reset({
        role: profile.role || '',
        company: profile.company || '',
        website: profile.website || '',
        productDescription: profile.productDescription || '',
        valueProposition: profile.valueProposition || '',
        usp: profile.usp || '',
      });
    }
  }, [profile, reset]);

  const onSubmit = async (data: UserProfile) => {
    setSuccessMessage(null);
    const success = await updateProfile(data);
    if (success) {
      setSuccessMessage('Profile updated successfully!');
      setTimeout(() => setSuccessMessage(null), 3000);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-3xl mx-auto bg-white p-8 rounded-lg shadow-lg">
      <h1 className="text-3xl font-bold mb-2">Your Profile</h1>
      <p className="text-gray-600 mb-6">
        Update your profile details. These will be automatically filled in when generating emails.
      </p>

      {successMessage && (
        <div className="bg-green-100 text-green-700 p-4 rounded-lg mb-6">{successMessage}</div>
      )}

      {loading && !profile && (
        <div className="text-gray-500 text-sm mb-4">Loading profile...</div>
      )}

      <div className="grid grid-cols-2 gap-6 mb-6">
        <div>
          <label className="block text-sm font-medium mb-2">Your Role</label>
          <input
            {...register('role')}
            type="text"
            className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
            placeholder="e.g., Sales Director, CEO"
          />
          {errors.role && <span className="text-red-600 text-sm">{errors.role.message}</span>}
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Your Company</label>
          <input
            {...register('company')}
            type="text"
            className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
            placeholder="e.g., Tech Solutions Inc"
          />
          {errors.company && <span className="text-red-600 text-sm">{errors.company.message}</span>}
        </div>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">Company Website</label>
        <input
          {...register('website')}
          type="url"
          className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
          placeholder="https://example.com"
        />
        {errors.website && <span className="text-red-600 text-sm">{errors.website.message}</span>}
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">Product/Service Description</label>
        <textarea
          {...register('productDescription')}
          className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
          placeholder="What do you offer? Describe your main product or service."
          rows={3}
        />
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">Value Proposition</label>
        <textarea
          {...register('valueProposition')}
          className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
          placeholder="How do you solve customer problems?"
          rows={3}
        />
      </div>

      <div className="mb-8">
        <label className="block text-sm font-medium mb-2">Unique Selling Proposition (USP)</label>
        <textarea
          {...register('usp')}
          className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
          placeholder="What makes you unique? What's your competitive advantage?"
          rows={3}
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
      >
        {loading ? 'Saving...' : 'Save Profile'}
      </button>

      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-gray-700">
          <strong>Tip:</strong> Once you save your profile, these details will be automatically filled in when you use the email generator form.
        </p>
      </div>
    </form>
  );
}
