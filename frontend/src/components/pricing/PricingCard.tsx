'use client';

import { Plan } from '../../types/index';

interface PricingCardProps {
  plan: Plan;
  isCurrentPlan?: boolean;
  onSelect: (plan: Plan) => void;
}

export default function PricingCard({ plan, isCurrentPlan, onSelect }: PricingCardProps) {
  return (
    <div className={`border rounded-lg p-6 text-center ${isCurrentPlan ? 'border-secondary bg-blue-50' : 'border-gray-300'}`}>
      <h3 className="text-2xl font-bold mb-2 capitalize">{plan.name}</h3>
      <div className="text-4xl font-bold text-secondary mb-2">
        {plan.price === 0 ? 'Free' : `₹${plan.price}`}
      </div>
      {plan.price > 0 && <p className="text-gray-600 mb-4">/month</p>}

      <div className="bg-secondary text-white py-3 rounded mb-6 font-bold text-lg">
        {plan.tokens} Tokens
      </div>

      <ul className="text-left mb-6 space-y-2">
        {plan.features.map((feature, idx) => (
          <li key={idx} className="flex items-center">
            <span className="text-secondary mr-2">✓</span>
            {feature}
          </li>
        ))}
      </ul>

      <button
        onClick={() => onSelect(plan)}
        disabled={isCurrentPlan}
        className={`w-full py-2 rounded font-medium transition ${
          isCurrentPlan
            ? 'bg-gray-400 text-white cursor-not-allowed'
            : 'bg-secondary text-white hover:bg-blue-600'
        }`}
      >
        {isCurrentPlan ? 'Current Plan' : 'Select Plan'}
      </button>
    </div>
  );
}
