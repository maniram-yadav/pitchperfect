'use client';

import { useRequireAuth } from '../hooks/useAuth';
import PricingCard from '../components/pricing/PricingCard';
import { PLAN_DATA } from '../utils/constants';
import { useAuth } from '../hooks/useAuth';
import { paymentAPI } from '../lib/api';

export default function BillingPage() {
  // useRequireAuth();
  const { user } = useAuth();

  const handleSelectPlan = async (plan: any) => {
    if (plan.name === 'free') {
      alert('You are already on a plan');
      return;
    }

    try {
      const result = await paymentAPI.initiatePayment(plan.name, plan.price);
      if (result.success) {
        alert('Payment initiated! (Mock: implement Razorpay integration)');
        // TODO: Integrate with Razorpay payment gateway
      }
    } catch (error) {
      alert('Failed to initiate payment');
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-12 px-4">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Simple, Transparent Pricing</h1>
        <p className="text-xl text-gray-600">Choose the plan that fits your needs</p>
      </div>

      <div className="grid grid-cols-3 gap-8 mb-8">
        {PLAN_DATA.map((plan) => (
          <PricingCard
            key={plan.name}
            plan={plan}
            isCurrentPlan={user?.plan === plan.name}
            onSelect={handleSelectPlan}
          />
        ))}
      </div>

      <div className="bg-white rounded-lg p-8 shadow-lg mt-12">
        <h2 className="text-2xl font-bold mb-6">How it Works</h2>
        <div className="grid grid-cols-3 gap-8">
          <div>
            <div className="bg-secondary text-white rounded-full w-12 h-12 flex items-center justify-center font-bold mb-4">
              1
            </div>
            <h3 className="font-semibold mb-2">Choose a Plan</h3>
            <p>Select the perfect plan for your email generation needs.</p>
          </div>
          <div>
            <div className="bg-secondary text-white rounded-full w-12 h-12 flex items-center justify-center font-bold mb-4">
              2
            </div>
            <h3 className="font-semibold mb-2">Generate Emails</h3>
            <p>Use your tokens to generate personalized cold emails with AI.</p>
          </div>
          <div>
            <div className="bg-secondary text-white rounded-full w-12 h-12 flex items-center justify-center font-bold mb-4">
              3
            </div>
            <h3 className="font-semibold mb-2">Send & Track</h3>
            <p>Copy emails and track your outreach results.</p>
          </div>
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
