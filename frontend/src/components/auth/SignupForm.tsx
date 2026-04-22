'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { authAPI } from '../../lib/api';

interface SignupFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export default function SignupForm() {
  const { register, handleSubmit, watch, formState: { errors } } = useForm<SignupFormData>();
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const password = watch('password');

  const onSubmit = async (data: SignupFormData) => {
    setIsLoading(true);
    setApiError(null);
    setSuccessMessage(null);

    try {
      const result = await authAPI.signup(data.name, data.email, data.password, data.confirmPassword);

      if (!result.success) {
        setApiError(result.error || result.message);
        return;
      }

      setSuccessMessage(result.message || 'Account created! Please check your email and click the verification link.');
    } catch (error: any) {
      const backendMessage = error?.response?.data?.message || error?.response?.data?.error;
      setApiError(backendMessage || (error instanceof Error ? error.message : 'Signup failed'));
    } finally {
      setIsLoading(false);
    }
  };

  if (successMessage) {
    return (
      <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-lg text-center">
        <div className="text-5xl mb-4">📧</div>
        <h1 className="text-2xl font-bold mb-2 text-green-700">Check your inbox!</h1>
        <p className="text-gray-600 mb-6">{successMessage}</p>
        <a
          href="/login"
          className="inline-block w-full bg-secondary text-white py-2 rounded font-medium hover:bg-blue-600 text-center"
        >
          Go to Login
        </a>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-lg">
      <h1 className="text-2xl font-bold mb-6">Join PitchPerfect</h1>

      {apiError && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{apiError}</div>}

      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Full Name</label>
        <input
          {...register('name', { required: 'Name is required' })}
          type="text"
          className="w-full border rounded px-3 py-2"
          placeholder="John Doe"
        />
        {errors.name && <span className="text-red-600 text-sm">{errors.name.message}</span>}
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Email</label>
        <input
          {...register('email', { required: 'Email is required' })}
          type="email"
          className="w-full border rounded px-3 py-2"
          placeholder="your@email.com"
        />
        {errors.email && <span className="text-red-600 text-sm">{errors.email.message}</span>}
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Password</label>
        <input
          {...register('password', {
            required: 'Password is required',
            minLength: { value: 8, message: 'Password must be at least 8 characters' },
          })}
          type="password"
          className="w-full border rounded px-3 py-2"
          placeholder="••••••••"
        />
        {errors.password && <span className="text-red-600 text-sm">{errors.password.message}</span>}
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium mb-1">Confirm Password</label>
        <input
          {...register('confirmPassword', {
            required: 'Please confirm your password',
            validate: (value) => value === password || 'Passwords do not match',
          })}
          type="password"
          className="w-full border rounded px-3 py-2"
          placeholder="••••••••"
        />
        {errors.confirmPassword && <span className="text-red-600 text-sm">{errors.confirmPassword.message}</span>}
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-secondary text-white py-2 rounded font-medium hover:bg-blue-600 disabled:opacity-50"
      >
        {isLoading ? 'Creating account...' : 'Sign Up'}
      </button>

      <p className="text-center mt-4 text-sm">
        Already have an account?{' '}
        <a href="/login" className="text-secondary hover:underline">
          Login
        </a>
      </p>
    </form>
  );
}
