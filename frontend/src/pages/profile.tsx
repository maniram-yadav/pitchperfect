'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../hooks/useAuth';
import UserProfileForm from '../components/profile/UserProfileForm';

export default function ProfilePage() {
  const { isAuthenticated, hasLoaded } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (hasLoaded && !isAuthenticated) {
      router.push('/login');
    }
  }, [hasLoaded, isAuthenticated, router]);

  if (!hasLoaded) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      <UserProfileForm />
    </div>
  );
}
