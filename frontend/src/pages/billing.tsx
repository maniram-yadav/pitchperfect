'use client';

import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import PricingCard from '../components/pricing/PricingCard';
import { PLAN_DATA } from '../utils/constants';
import { payuAPI } from '../lib/api';
import { Plan } from '../types/index';

interface ModalState {
  plan: Plan | null;
  phone: string;
  loading: boolean;
  error: string | null;
}

export default function BillingPage() {
  const { user } = useAuth();
  const [modal, setModal] = useState<ModalState>({
    plan: null,
    phone: '',
    loading: false,
    error: null,
  });

  const openModal = (plan: Plan) => {
    if (plan.name === 'free') return;
    setModal({ plan, phone: '', loading: false, error: null });
  };

  const closeModal = () =>
    setModal({ plan: null, phone: '', loading: false, error: null });

  const handlePay = async () => {
    const { plan, phone } = modal;
    if (!plan) return;

    if (!phone.trim()) {
      setModal((m) => ({ ...m, error: 'Phone number is required' }));
      return;
    }

    if (!/^\+?[0-9]{7,15}$/.test(phone.trim())) {
      setModal((m) => ({ ...m, error: 'Enter a valid phone number (7–15 digits)' }));
      return;
    }

    setModal((m) => ({ ...m, loading: true, error: null }));

    try {
      const result = await payuAPI.initiatePayment(plan.name, plan.price, phone.trim());

      if (!result.success || !result.data) {
        setModal((m) => ({
          ...m,
          loading: false,
          error: result.message || 'Failed to initiate payment',
        }));
        return;
      }

      const { payuUrl, formFields } = result.data as {
        payuUrl: string;
        formFields: Record<string, string>;
      };

      // Build a hidden form and POST it directly to PayU's hosted checkout.
      // The SHA-512 hash was generated server-side; do not alter any field here.
      const form = document.createElement('form');
      form.method = 'POST';
      form.action = payuUrl;

      Object.entries(formFields).forEach(([name, value]) => {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = name;
        input.value = String(value ?? '');
        form.appendChild(input);
      });

      document.body.appendChild(form);
      form.submit();
      // Browser navigates away — loading spinner stays until redirect completes
    } catch {
      setModal((m) => ({
        ...m,
        loading: false,
        error: 'Something went wrong. Please try again.',
      }));
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-12 px-4">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Simple, Transparent Pricing</h1>
        <p className="text-xl text-gray-600">Choose the plan that fits your needs</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
        {PLAN_DATA.map((plan) => (
          <PricingCard
            key={plan.name}
            plan={plan}
            isCurrentPlan={user?.plan === plan.name}
            onSelect={openModal}
          />
        ))}
      </div>

      {/* ── PayU phone-number modal ── */}
      {modal.plan && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
            <h2 className="text-2xl font-bold mb-1">Complete Payment</h2>
            <p className="text-gray-500 mb-6 text-sm">
              Purchasing the{' '}
              <span className="font-semibold capitalize text-blue-600">
                {modal.plan.name}
              </span>{' '}
              plan for{' '}
              <span className="font-semibold">₹{modal.plan.price}</span> · {modal.plan.tokens} tokens
            </p>

            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              placeholder="+91 98765 43210"
              value={modal.phone}
              onChange={(e) =>
                setModal((m) => ({ ...m, phone: e.target.value, error: null }))
              }
              onKeyDown={(e) => e.key === 'Enter' && handlePay()}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 mb-1"
              disabled={modal.loading}
              autoFocus
            />

            {modal.error && (
              <p className="text-red-500 text-xs mb-3 mt-1">{modal.error}</p>
            )}

            <p className="text-xs text-gray-400 mb-6 mt-2">
              Required by PayU. Not stored by PitchPerfect.
            </p>

            <div className="flex gap-3">
              <button
                onClick={closeModal}
                disabled={modal.loading}
                className="flex-1 border border-gray-300 text-gray-700 py-2.5 rounded-lg font-medium hover:bg-gray-50 transition disabled:opacity-40"
              >
                Cancel
              </button>
              <button
                onClick={handlePay}
                disabled={modal.loading || !modal.phone.trim()}
                className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {modal.loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    Redirecting…
                  </>
                ) : (
                  `Pay ₹${modal.plan.price}`
                )}
              </button>
            </div>

            <p className="text-xs text-center text-gray-400 mt-5">
              Secured by{' '}
              <span className="font-semibold text-gray-500">PayU</span> · SHA-512 encrypted
            </p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg p-8 shadow-lg mt-12">
        <h2 className="text-2xl font-bold mb-6">How it Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { step: 1, title: 'Choose a Plan', desc: 'Select the plan that fits your email generation needs.' },
            { step: 2, title: 'Secure Payment', desc: "Pay safely via PayU — India's trusted payment gateway." },
            { step: 3, title: 'Start Generating', desc: 'Tokens are added instantly after successful payment.' },
          ].map(({ step, title, desc }) => (
            <div key={step}>
              <div className="bg-secondary text-white rounded-full w-12 h-12 flex items-center justify-center font-bold mb-4">
                {step}
              </div>
              <h3 className="font-semibold mb-2">{title}</h3>
              <p className="text-gray-600 text-sm">{desc}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-blue-50 border border-secondary rounded-lg p-8 mt-8">
        <h3 className="text-xl font-bold mb-3">Coming Soon</h3>
        <ul className="space-y-2 text-gray-700">
          <li>✓ LinkedIn Profile Scraper</li>
          <li>✓ Company Website Analyzer</li>
          <li>✓ Email Personalization Tags</li>
          <li>✓ A/B Testing</li>
          <li>✓ CRM Integration</li>
          <li>✓ Chrome Extension</li>
        </ul>
      </div>
    </div>
  );
}
