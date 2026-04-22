import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { authAPI } from '../lib/api';

type Status = 'verifying' | 'success' | 'error';

export default function VerifyEmailPage() {
  const router = useRouter();
  const [status, setStatus] = useState<Status>('verifying');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const { token } = router.query;
    if (!router.isReady) return;

    if (!token || typeof token !== 'string') {
      setStatus('error');
      setMessage('Invalid verification link. Please check your email and try again.');
      return;
    }

    authAPI.verifyEmail(token)
      .then((result) => {
        if (result.success) {
          setStatus('success');
          setMessage(result.message || 'Email verified! You can now log in.');
        } else {
          setStatus('error');
          setMessage(result.message || 'Verification failed. The link may have expired.');
        }
      })
      .catch(() => {
        setStatus('error');
        setMessage('Something went wrong. Please try again or contact support.');
      });
  }, [router.isReady, router.query]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        {status === 'verifying' && (
          <>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
            <h1 className="text-xl font-semibold text-gray-700">Verifying your email...</h1>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="text-5xl mb-4">✓</div>
            <h1 className="text-2xl font-bold text-green-600 mb-2">Email Verified!</h1>
            <p className="text-gray-600 mb-6">{message}</p>
            <a
              href="/login"
              className="inline-block bg-blue-600 text-white px-6 py-2 rounded font-medium hover:bg-blue-700"
            >
              Go to Login
            </a>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="text-5xl mb-4">✗</div>
            <h1 className="text-2xl font-bold text-red-600 mb-2">Verification Failed</h1>
            <p className="text-gray-600 mb-6">{message}</p>
            <a
              href="/signup"
              className="inline-block bg-gray-600 text-white px-6 py-2 rounded font-medium hover:bg-gray-700"
            >
              Back to Sign Up
            </a>
          </>
        )}
      </div>
    </div>
  );
}
