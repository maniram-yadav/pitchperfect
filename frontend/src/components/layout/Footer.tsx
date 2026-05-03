'use client';

import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-primary text-white py-8 mt-16">
      <div className="max-w-7xl mx-auto px-4 text-center">
        <p className="mb-2">&copy; 2024 PitchPerfect. All rights reserved.</p>
        <div className="flex gap-4 justify-center text-sm">
          <Link href="/privacy" className="hover:text-secondary transition-colors">
            Privacy
          </Link>
          <Link href="/terms" className="hover:text-secondary transition-colors">
            Terms
          </Link>
          <Link href="/refund" className="hover:text-secondary transition-colors">
            Refund & Cancellation
          </Link>
          <Link href="/contact" className="hover:text-secondary transition-colors">
            Contact
          </Link>
        </div>
      </div>
    </footer>
  );
}
