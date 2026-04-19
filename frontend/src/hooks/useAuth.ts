import { useAuthStore } from '../lib/authStore';
import { useEffect } from 'react';

export const useAuth = () => {
  const { user, token, isAuthenticated, setUser, setToken, logout, loadFromStorage } = useAuthStore();

  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);

  return {
    user,
    token,
    isAuthenticated,
    setUser,
    setToken,
    logout,
  };
};

export const useRequireAuth = () => {
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) {
      // Redirect to login
      window.location.href = '/login';
    }
  }, [isAuthenticated]);

  return isAuthenticated;
};
