'use client';

import Link from 'next/link';

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto py-16 px-4">
      <div className="mb-10">
        <h1 className="text-4xl font-bold text-primary mb-3">Privacy Policy</h1>
        <p className="text-gray-500 text-sm">Last updated: April 23, 2026</p>
      </div>

      <div className="space-y-10 text-gray-700 leading-relaxed">
        <section>
          <h2 className="text-xl font-semibold text-primary mb-3">1. Information We Collect</h2>
          <p>
            We collect information you provide directly to us, such as when you create an account,
            use our email generation features, or contact us for support. This includes your name,
            email address, and usage data related to the emails you generate.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-primary mb-3">2. How We Use Your Information</h2>
          <p className="mb-3">We use the information we collect to:</p>
          <ul className="list-disc list-inside space-y-2 pl-2">
            <li>Provide, maintain, and improve our services</li>
            <li>Process transactions and send related information</li>
            <li>Send technical notices and support messages</li>
            <li>Respond to comments and questions</li>
            <li>Monitor and analyze usage patterns to improve user experience</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-primary mb-3">3. Data Storage and Security</h2>
          <p>
            Your data is stored securely on our servers. We implement industry-standard security
            measures including encryption in transit (TLS) and at rest. We retain your data for as
            long as your account is active or as needed to provide services.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-primary mb-3">4. Sharing of Information</h2>
          <p>
            We do not sell, trade, or rent your personal information to third parties. We may share
            aggregated, anonymized data for analytical purposes. We may disclose information if
            required by law or to protect the rights and safety of our users.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-primary mb-3">5. Cookies</h2>
          <p>
            We use cookies and similar tracking technologies to maintain your session and remember
            your preferences. You can instruct your browser to refuse all cookies, though some parts
            of the service may not function properly as a result.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-primary mb-3">6. Your Rights</h2>
          <p className="mb-3">You have the right to:</p>
          <ul className="list-disc list-inside space-y-2 pl-2">
            <li>Access the personal data we hold about you</li>
            <li>Request correction of inaccurate data</li>
            <li>Request deletion of your account and associated data</li>
            <li>Opt out of non-essential communications</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-primary mb-3">7. Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. We will notify you of significant
            changes by email or a prominent notice on our website. Your continued use of PitchPerfect
            after such changes constitutes acceptance of the updated policy.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-primary mb-3">8. Contact Us</h2>
          <p>
            If you have questions about this Privacy Policy, please{' '}
            <Link href="/contact" className="text-secondary hover:underline">
              contact us
            </Link>
            .
          </p>
        </section>
      </div>
    </div>
  );
}
