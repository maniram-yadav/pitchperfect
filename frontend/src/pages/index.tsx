'use client';

import Link from 'next/link';
import { useAuth } from '../hooks/useAuth';

export default function HomePage() {
  const { isAuthenticated } = useAuth();

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary to-secondary text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold mb-6">🎯 PitchPerfect</h1>
          <p className="text-2xl mb-8">AI-Powered Cold Email Generator</p>
          <p className="text-lg mb-8 text-gray-200">
            Generate personalized, high-converting cold emails in seconds. Not hours.
          </p>

          {isAuthenticated ? (
            <Link
              href="/generate"
              className="inline-block bg-accent text-white px-8 py-3 rounded-lg font-semibold hover:bg-purple-700 transition"
            >
              Start Generating
            </Link>
          ) : (
            <Link
              href="/signup"
              className="inline-block bg-accent text-white px-8 py-3 rounded-lg font-semibold hover:bg-purple-700 transition"
            >
              Get Started Free
            </Link>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Key Features</h2>

          <div className="grid grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <div className="text-4xl mb-4">🤖</div>
              <h3 className="text-xl font-bold mb-2">AI-Powered</h3>
              <p>Advanced AI generates personalized emails tailored to your target audience.</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-lg">
              <div className="text-4xl mb-4">⚡</div>
              <h3 className="text-xl font-bold mb-2">Lightning Fast</h3>
              <p>Get multiple email variations in seconds, not hours.</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-lg">
              <div className="text-4xl mb-4">💰</div>
              <h3 className="text-xl font-bold mb-2">Token-Based</h3>
              <p>Pay only for what you use with our flexible token system.</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-lg">
              <div className="text-4xl mb-4">📧</div>
              <h3 className="text-xl font-bold mb-2">Personalization</h3>
              <p>Customize tone, length, and target audience for perfect fit.</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-lg">
              <div className="text-4xl mb-4">📊</div>
              <h3 className="text-xl font-bold mb-2">Sequences</h3>
              <p>Generate entire email sequences for follow-ups.</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-lg">
              <div className="text-4xl mb-4">🔐</div>
              <h3 className="text-xl font-bold mb-2">Secure</h3>
              <p>Your data is encrypted and secure. Privacy guaranteed.</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>

          <div className="space-y-8">
            <div className="flex gap-6">
              <div className="bg-secondary text-white rounded-full w-12 h-12 flex items-center justify-center flex-shrink-0 font-bold">
                1
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">Sign Up</h3>
                <p>Create a free account and get 10 tokens to start.</p>
              </div>
            </div>

            <div className="flex gap-6">
              <div className="bg-secondary text-white rounded-full w-12 h-12 flex items-center justify-center flex-shrink-0 font-bold">
                2
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">Fill in Details</h3>
                <p>Provide your company info, target audience, and preferences.</p>
              </div>
            </div>

            <div className="flex gap-6">
              <div className="bg-secondary text-white rounded-full w-12 h-12 flex items-center justify-center flex-shrink-0 font-bold">
                3
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">Get Emails</h3>
                <p>AI generates multiple personalized email variations.</p>
              </div>
            </div>

            <div className="flex gap-6">
              <div className="bg-secondary text-white rounded-full w-12 h-12 flex items-center justify-center flex-shrink-0 font-bold">
                4
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">Send & Succeed</h3>
                <p>Copy and send your emails. Track results in your dashboard.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Preview */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Simple Pricing</h2>
          <p className="text-gray-600 mb-8">Start free, upgrade when you need to</p>

          <div className="grid grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <h3 className="text-xl font-bold mb-2">Free</h3>
              <p className="text-3xl font-bold text-secondary mb-4">10 Tokens</p>
              <p className="text-sm text-gray-600">Perfect to get started</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-lg border-2 border-secondary">
              <h3 className="text-xl font-bold mb-2">Starter</h3>
              <p className="text-3xl font-bold text-secondary mb-2">₹199/mo</p>
              <p className="text-sm text-gray-600 mb-4">100 Tokens</p>
              <p className="text-xs text-gray-500">Most popular</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-lg">
              <h3 className="text-xl font-bold mb-2">Pro</h3>
              <p className="text-3xl font-bold text-secondary mb-2">₹499/mo</p>
              <p className="text-sm text-gray-600">500 Tokens</p>
            </div>
          </div>

          <Link
            href={isAuthenticated ? '/billing' : '/signup'}
            className="inline-block bg-secondary text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-600 transition"
          >
            View All Plans
          </Link>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-primary text-white">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Generate Better Emails?</h2>
          <p className="text-lg mb-8">Join hundreds of sales professionals and agencies using PitchPerfect.</p>

          {!isAuthenticated && (
            <Link
              href="/signup"
              className="inline-block bg-secondary text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-600 transition"
            >
              Start Free Today
            </Link>
          )}
        </div>
      </section>
    </div>
  );
}
