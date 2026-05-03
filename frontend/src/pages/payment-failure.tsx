'use client';

import { useRouter } from 'next/router';
import Link from 'next/link';

export default function PaymentFailurePage() {
  const router = useRouter();

  const txnid = router.query.txnid as string | undefined;
  const error = router.query.error as string | undefined;

  const displayError =
    error && error !== 'server_error' && error !== 'hash_mismatch'
      ? decodeURIComponent(error)
      : 'Your payment could not be processed. No amount has been charged.';

  return (
    <div className="min-h-screen flex items-center justify-center bg-red-50 px-4">
      <div className="bg-white rounded-2xl shadow-xl p-10 max-w-md w-full text-center">
        {/* Failure icon */}
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg
            className="w-10 h-10 text-red-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Failed</h1>
        <p className="text-gray-500 mb-6">{displayError}</p>

        {txnid && (
          <div className="text-xs text-gray-400 mb-6 text-left bg-gray-50 rounded-lg p-4">
            <p>
              <span className="font-medium text-gray-500">Transaction ID:</span>{' '}
              <span className="font-mono">{txnid}</span>
            </p>
          </div>
        )}

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-5 py-4 mb-6 text-sm text-yellow-800 text-left">
          <p className="font-semibold mb-1">What to do next:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Check that your card / UPI details are correct</li>
            <li>Ensure sufficient balance in your account</li>
            <li>Try a different payment method</li>
            <li>Contact your bank if the issue persists</li>
          </ul>
        </div>

        <div className="flex flex-col gap-3">
          <Link
            href="/billing"
            className="block w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            Try Again
          </Link>
          <Link
            href="/dashboard"
            className="block w-full border border-gray-300 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-50 transition"
          >
            Go to Dashboard
          </Link>
        </div>

        <p className="text-xs text-gray-400 mt-5">
          Need help?{' '}
          <Link href="/contact" className="underline hover:text-gray-600">
            Contact support
          </Link>
        </p>
      </div>
    </div>
  );
}
