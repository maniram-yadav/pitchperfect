'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useAuth } from '../hooks/useAuth';
import { paymentAPI } from '../lib/api';

export default function PaymentSuccessPage() {
  const router = useRouter();
  const { user, setUser } = useAuth();
  const [tokenBalance, setTokenBalance] = useState<number | null>(null);

  const txnid = router.query.txnid as string | undefined;
  const mihpayid = router.query.mihpayid as string | undefined;

  // Refresh token balance so the user sees updated tokens immediately
  useEffect(() => {
    const refreshBalance = async () => {
      try {
        const result = await paymentAPI.getTokenBalance();
        if (result.success && result.data !== undefined) {
          setTokenBalance(result.data);
          // Sync the auth store so Navbar / Dashboard reflect the new balance
          if (user) {
            const stored = localStorage.getItem('user');
            if (stored) {
              const parsed = JSON.parse(stored);
              parsed.tokens = result.data;
              localStorage.setItem('user', JSON.stringify(parsed));
              setUser(parsed);
            }
          }
        }
      } catch {
        // Non-critical — the webhook already updated the DB
      }
    };

    if (router.isReady) {
      refreshBalance();
    }
  }, [router.isReady]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-green-50 px-4">
      <div className="bg-white rounded-2xl shadow-xl p-10 max-w-md w-full text-center">
        {/* Success icon */}
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg
            className="w-10 h-10 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Successful!</h1>
        <p className="text-gray-500 mb-6">
          Your tokens have been added to your account.
        </p>

        {tokenBalance !== null && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg px-6 py-4 mb-6">
            <p className="text-sm text-blue-600 font-medium">Current Token Balance</p>
            <p className="text-4xl font-bold text-blue-700 mt-1">{tokenBalance}</p>
          </div>
        )}

        {(txnid || mihpayid) && (
          <div className="text-xs text-gray-400 mb-6 space-y-1 text-left bg-gray-50 rounded-lg p-4">
            {txnid && (
              <p>
                <span className="font-medium text-gray-500">Transaction ID:</span>{' '}
                <span className="font-mono">{txnid}</span>
              </p>
            )}
            {mihpayid && (
              <p>
                <span className="font-medium text-gray-500">PayU Payment ID:</span>{' '}
                <span className="font-mono">{mihpayid}</span>
              </p>
            )}
          </div>
        )}

        <div className="flex flex-col gap-3">
          <Link
            href="/generate"
            className="block w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            Start Generating Emails
          </Link>
          <Link
            href="/dashboard"
            className="block w-full border border-gray-300 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-50 transition"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
