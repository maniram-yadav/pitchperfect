'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { authAPI } from '../../lib/api';
import Link from 'next/link';

interface EmailStepData {
  email: string;
}

interface ResetStepData {
  otp: string;
  newPassword: string;
  confirmPassword: string;
}

export default function ForgotPasswordForm() {
  const [step, setStep] = useState<'request' | 'reset' | 'done'>('request');
  const [submittedEmail, setSubmittedEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const emailForm = useForm<EmailStepData>();
  const resetForm = useForm<ResetStepData>();
  const newPassword = resetForm.watch('newPassword');

  const onRequestOtp = async (data: EmailStepData) => {
    setIsLoading(true);
    setApiError(null);
    try {
      const result = await authAPI.forgotPassword(data.email);
      if (!result.success) {
        setApiError(result.message);
        return;
      }
      setSubmittedEmail(data.email);
      setStep('reset');
    } catch {
      setApiError('Failed to send OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const onResetPassword = async (data: ResetStepData) => {
    setIsLoading(true);
    setApiError(null);
    try {
      const result = await authAPI.resetPassword(
        submittedEmail,
        data.otp.trim(),
        data.newPassword,
        data.confirmPassword
      );
      if (!result.success) {
        setApiError(result.message);
        return;
      }
      setStep('done');
    } catch {
      setApiError('Password reset failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-lg">
      {step === 'request' && (
        <>
          <h1 className="text-2xl font-bold mb-2">Forgot Password</h1>
          <p className="text-gray-500 text-sm mb-6">
            Enter your email and we'll send you a 6-digit OTP.
          </p>

          {apiError && (
            <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{apiError}</div>
          )}

          <form onSubmit={emailForm.handleSubmit(onRequestOtp)}>
            <div className="mb-6">
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                {...emailForm.register('email', { required: 'Email is required' })}
                type="email"
                className="w-full border rounded px-3 py-2"
                placeholder="your@email.com"
              />
              {emailForm.formState.errors.email && (
                <span className="text-red-600 text-sm">
                  {emailForm.formState.errors.email.message}
                </span>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-secondary text-white py-2 rounded font-medium hover:bg-blue-600 disabled:opacity-50"
            >
              {isLoading ? 'Sending OTP...' : 'Send OTP'}
            </button>
          </form>
        </>
      )}

      {step === 'reset' && (
        <>
          <h1 className="text-2xl font-bold mb-2">Enter OTP</h1>
          <p className="text-gray-500 text-sm mb-6">
            We sent a 6-digit code to <span className="font-medium text-gray-700">{submittedEmail}</span>.
            It expires in 10 minutes.
          </p>

          {apiError && (
            <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{apiError}</div>
          )}

          <form onSubmit={resetForm.handleSubmit(onResetPassword)}>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">OTP Code</label>
              <input
                {...resetForm.register('otp', {
                  required: 'OTP is required',
                  pattern: { value: /^\d{6}$/, message: 'Enter the 6-digit code' },
                })}
                type="text"
                inputMode="numeric"
                maxLength={6}
                className="w-full border rounded px-3 py-2 tracking-widest text-center text-xl font-mono"
                placeholder="000000"
              />
              {resetForm.formState.errors.otp && (
                <span className="text-red-600 text-sm">
                  {resetForm.formState.errors.otp.message}
                </span>
              )}
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">New Password</label>
              <input
                {...resetForm.register('newPassword', {
                  required: 'New password is required',
                  minLength: { value: 8, message: 'At least 8 characters' },
                  pattern: {
                    value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/,
                    message: 'Must include uppercase, lowercase, and a number',
                  },
                })}
                type="password"
                className="w-full border rounded px-3 py-2"
                placeholder="••••••••"
              />
              {resetForm.formState.errors.newPassword && (
                <span className="text-red-600 text-sm">
                  {resetForm.formState.errors.newPassword.message}
                </span>
              )}
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium mb-1">Confirm Password</label>
              <input
                {...resetForm.register('confirmPassword', {
                  required: 'Please confirm your password',
                  validate: (v) => v === newPassword || 'Passwords do not match',
                })}
                type="password"
                className="w-full border rounded px-3 py-2"
                placeholder="••••••••"
              />
              {resetForm.formState.errors.confirmPassword && (
                <span className="text-red-600 text-sm">
                  {resetForm.formState.errors.confirmPassword.message}
                </span>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-secondary text-white py-2 rounded font-medium hover:bg-blue-600 disabled:opacity-50"
            >
              {isLoading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>

          <button
            onClick={() => { setStep('request'); setApiError(null); }}
            className="w-full mt-3 text-sm text-secondary hover:underline text-center"
          >
            Resend OTP
          </button>
        </>
      )}

      {step === 'done' && (
        <div className="text-center">
          <div className="text-5xl mb-4">✓</div>
          <h1 className="text-2xl font-bold mb-2">Password Reset!</h1>
          <p className="text-gray-500 text-sm mb-6">
            Your password has been updated. You can now log in with your new password.
          </p>
          <Link
            href="/login"
            className="w-full block bg-secondary text-white py-2 rounded font-medium hover:bg-blue-600 text-center"
          >
            Go to Login
          </Link>
        </div>
      )}

      {step !== 'done' && (
        <p className="text-center mt-4 text-sm">
          Remember your password?{' '}
          <Link href="/login" className="text-secondary hover:underline">
            Login
          </Link>
        </p>
      )}
    </div>
  );
}
