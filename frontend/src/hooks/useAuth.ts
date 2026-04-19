import { useAuthStore } from '../lib/authStore';
import { useEffect } from 'react';
import { useRouter } from 'next/router';

export const useAuth = () => {
  const { user, token, isAuthenticated, hasLoaded, setUser, setToken, logout, loadFromStorage } = useAuthStore();

  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);

  return {
    user,
    token,
    isAuthenticated,
    hasLoaded,
    setUser,
    setToken,
    logout,
  };
};

export const useRequireAuth = () => {
  const { isAuthenticated, hasLoaded } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (hasLoaded && !isAuthenticated) {
      router.push('/login');
    }
  }, [hasLoaded, isAuthenticated, router]);

  return { isAuthenticated, hasLoaded };
};
