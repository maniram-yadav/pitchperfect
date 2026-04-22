'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { authAPI } from '../../lib/api';
import { useAuthStore } from '../../lib/authStore';
import { useRouter } from 'next/navigation';

interface LoginFormData {
  email: string;
  password: string;
}

export default function LoginForm() {
  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>();
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [emailNotVerified, setEmailNotVerified] = useState(false);
  const [unverifiedEmail, setUnverifiedEmail] = useState('');
  const [resendStatus, setResendStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const { setUser, setToken } = useAuthStore();
  const router = useRouter();

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setApiError(null);
    setEmailNotVerified(false);

    try {
      const result = await authAPI.login(data.email, data.password);

      if (!result.success) {
        if (result.error === 'EMAIL_NOT_VERIFIED') {
          setEmailNotVerified(true);
          setUnverifiedEmail(data.email);
          setResendStatus('idle');
        } else {
          setApiError(result.error || result.message);
        }
        return;
      }

      // Save auth data
      setUser({
        userId: result.data!.userId,
        email: result.data!.email,
        name: result.data!.name,
        tokens: result.data!.tokens,
        plan: result.data!.plan as any,
      });
      setToken(result.data!.token);

      // Redirect to dashboard
      router.push('/dashboard');
    } catch (error: any) {
      const backendMessage = error?.response?.data?.message || error?.response?.data?.error;
      setApiError(backendMessage || (error instanceof Error ? error.message : 'Login failed'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    setResendStatus('sending');
    try {
      await authAPI.resendVerification(unverifiedEmail);
      setResendStatus('sent');
    } catch {
      setResendStatus('error');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-lg">
      <h1 className="text-2xl font-bold mb-6">Login to PitchPerfect</h1>

      {apiError && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{apiError}</div>}
      {emailNotVerified && (
        <div className="bg-yellow-50 border border-yellow-300 text-yellow-800 p-4 rounded mb-4 text-sm">
          <p className="font-medium">Email have not verified. Visit your mail box and click on the verification link received in email.</p>
          <p>Please check your inbox and click the verification link we sent you before logging in.</p>
        </div>
      )}

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

      <div className="mb-6">
        <div className="flex justify-between items-center mb-1">
          <label className="block text-sm font-medium">Password</label>
          <a href="/forgot-password" className="text-xs text-secondary hover:underline">
            Forgot password?
          </a>
        </div>
        <input
          {...register('password', { required: 'Password is required' })}
          type="password"
          className="w-full border rounded px-3 py-2"
          placeholder="••••••••"
        />
        {errors.password && <span className="text-red-600 text-sm">{errors.password.message}</span>}
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-secondary text-white py-2 rounded font-medium hover:bg-blue-600 disabled:opacity-50"
      >
        {isLoading ? 'Logging in...' : 'Login'}
      </button>

      <p className="text-center mt-4 text-sm">
        Don't have an account?{' '}
        <a href="/signup" className="text-secondary hover:underline">
          Sign up
        </a>
      </p>
    </form>
  );
}
