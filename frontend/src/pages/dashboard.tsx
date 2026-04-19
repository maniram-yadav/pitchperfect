'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../hooks/useAuth';

export default function DashboardPage() {
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated || !user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-4xl font-bold">Welcome, {user.name}!</h1>
        <p className="text-gray-600 mt-2">Your AI-powered cold email generator</p>
      </div>

      <div className="grid grid-cols-3 gap-6 mb-8">
        <div className="bg-secondary text-white p-6 rounded-lg shadow-lg">
          <h3 className="text-lg font-semibold mb-2">Tokens</h3>
          <div className="text-4xl font-bold">{user.tokens}</div>
          <p className="text-sm mt-2">Available tokens</p>
        </div>

        <div className="bg-accent text-white p-6 rounded-lg shadow-lg">
          <h3 className="text-lg font-semibold mb-2">Plan</h3>
          <div className="text-3xl font-bold capitalize">{user.plan}</div>
          <p className="text-sm mt-2">Current plan</p>
        </div>

        <div className="bg-green-600 text-white p-6 rounded-lg shadow-lg">
          <h3 className="text-lg font-semibold mb-2">Quick Action</h3>
          <a href="/generate" className="inline-block bg-white text-green-600 px-4 py-2 rounded font-semibold hover:bg-gray-100">
            Generate Email
          </a>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold mb-4">Getting Started</h2>
          <ul className="space-y-3">
            <li className="flex items-start">
              <span className="text-secondary font-bold mr-3">1</span>
              <span>Go to Generate page and fill in your details</span>
            </li>
            <li className="flex items-start">
              <span className="text-secondary font-bold mr-3">2</span>
              <span>Customize tone, length, and email type</span>
            </li>
            <li className="flex items-start">
              <span className="text-secondary font-bold mr-3">3</span>
              <span>Get multiple variations instantly</span>
            </li>
            <li className="flex items-start">
              <span className="text-secondary font-bold mr-3">4</span>
              <span>Copy and send your emails</span>
            </li>
          </ul>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold mb-4">Need More Tokens?</h2>
          <p className="text-gray-700 mb-4">Upgrade your plan to get more tokens and unlock advanced features.</p>
          <a href="/billing" className="inline-block bg-secondary text-white px-6 py-2 rounded font-semibold hover:bg-blue-600">
            View Plans
          </a>
        </div>
      </div>
    </div>
  );
}
