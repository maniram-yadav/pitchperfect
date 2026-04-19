'use client';

import Link from 'next/link';
import { useAuth } from '../../hooks/useAuth';

export default function Navbar() {
  const { isAuthenticated, logout } = useAuth();

  return (
    <nav className="bg-primary text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold">
          🎯 PitchPerfect
        </Link>

        <div className="flex gap-6 items-center">
          {isAuthenticated ? (
            <>
              <Link href="/dashboard" className="hover:text-secondary transition">
                Dashboard
              </Link>
              <Link href="/generate" className="hover:text-secondary transition">
                Generate
              </Link>
              <Link href="/billing" className="hover:text-secondary transition">
                Billing
              </Link>
              <button
                onClick={logout}
                className="bg-red-600 px-4 py-2 rounded hover:bg-red-700 transition"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="hover:text-secondary transition">
                Login
              </Link>
              <Link
                href="/signup"
                className="bg-secondary px-4 py-2 rounded hover:bg-blue-600 transition"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
