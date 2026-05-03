'use client';

import Link from 'next/link';

export default function RefundPage() {
  return (
    <div className="max-w-3xl mx-auto py-16 px-4">
      <div className="mb-10">
        <h1 className="text-4xl font-bold text-primary mb-3">Refund & Cancellation Policy</h1>
        <p className="text-gray-500 text-sm">Last updated: May 3, 2026</p>
      </div>

      <div className="space-y-10 text-gray-700 leading-relaxed">
        <section>
          <h2 className="text-xl font-semibold text-primary mb-3">1. Overview</h2>
          <p>
            At PitchPerfect, we want you to be completely satisfied with your purchase. This policy
            outlines the conditions under which refunds and cancellations are processed for our
            subscription plans and token purchases.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-primary mb-3">2. Subscription Cancellation</h2>
          <p className="mb-3">
            You may cancel your subscription at any time from your account settings or by contacting
            our support team. Upon cancellation:
          </p>
          <ul className="list-disc list-inside space-y-2 pl-2">
            <li>Your subscription remains active until the end of the current billing period.</li>
            <li>You will not be charged for subsequent billing cycles.</li>
            <li>Access to paid features continues until the subscription expires.</li>
            <li>Unused tokens allocated for the current period are not carried over after expiry.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-primary mb-3">3. Refund Eligibility</h2>
          <p className="mb-3">Refunds may be issued under the following circumstances:</p>
          <ul className="list-disc list-inside space-y-2 pl-2">
            <li>
              <span className="font-medium">7-Day Money-Back Guarantee:</span> If you are not
              satisfied with your first-time subscription purchase, you may request a full refund
              within 7 days of the initial charge, provided you have used fewer than 10 tokens.
            </li>
            <li>
              <span className="font-medium">Duplicate Charges:</span> If you were charged more than
              once for the same transaction due to a technical error, a full refund will be issued
              for the duplicate charge.
            </li>
            <li>
              <span className="font-medium">Service Unavailability:</span> If PitchPerfect
              experiences an outage lasting more than 24 consecutive hours within your billing
              period, you may be eligible for a prorated refund for the affected days.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-primary mb-3">4. Non-Refundable Situations</h2>
          <p className="mb-3">Refunds will not be issued in the following cases:</p>
          <ul className="list-disc list-inside space-y-2 pl-2">
            <li>Renewal charges after a subscription has already been active for more than 7 days.</li>
            <li>Partial use of a billing period after cancellation.</li>
            <li>Token packages that have been fully or partially consumed.</li>
            <li>Downgrading from a higher plan to a lower plan mid-cycle.</li>
            <li>Accounts suspended or terminated due to violations of our Terms of Service.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-primary mb-3">5. How to Request a Refund</h2>
          <p className="mb-3">To request a refund, please follow these steps:</p>
          <ol className="list-decimal list-inside space-y-2 pl-2">
            <li>
              <Link href="/contact" className="text-secondary hover:underline">
                Contact our support team
              </Link>{' '}
              within the eligible refund period.
            </li>
            <li>Provide your registered email address and the reason for the refund request.</li>
            <li>Our team will review your request and respond within 3–5 business days.</li>
            <li>
              Approved refunds are processed back to the original payment method within 7–10
              business days, depending on your bank or payment provider.
            </li>
          </ol>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-primary mb-3">6. Payment Gateway</h2>
          <p>
            Payments on PitchPerfect are processed securely via Payment Gateway Provider. Refunds are initiated through
            integrated Payment gateway and credited back to your original payment method. PitchPerfect is not responsible
            for delays caused by your bank or card network after the refund has been initiated.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-primary mb-3">7. Plan Downgrades & Upgrades</h2>
          <p>
            You may upgrade your plan at any time; the new plan takes effect immediately and you
            will be charged the prorated difference. Downgrades take effect at the start of the
            next billing cycle. No refund is issued for the unused portion of a higher-tier plan
            when downgrading.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-primary mb-3">8. Changes to This Policy</h2>
          <p>
            We reserve the right to modify this Refund & Cancellation Policy at any time. Changes
            will be posted on this page with an updated date. Continued use of PitchPerfect after
            any changes constitutes your acceptance of the revised policy.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-primary mb-3">9. Contact Us</h2>
          <p>
            For any questions or concerns regarding refunds or cancellations, please{' '}
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
