import { useState, useEffect } from 'react';
import { authAPI } from '../lib/api';
import { UserProfile } from '../types/index';
import { useAuthStore } from '../lib/authStore';

export const useUserProfile = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user, setUser } = useAuthStore();

  // Load user profile on mount
  useEffect(() => {
    const loadProfile = async () => {
      if (!user) return;
      
      setLoading(true);
      try {
        const response = await authAPI.getUserProfile();
        if (response.success) {
          setProfile(response.data.profile || {});
        }
      } catch (err) {
        console.error('Failed to load profile:', err);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [user]);

  const updateProfile = async (newProfile: UserProfile): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const response = await authAPI.updateProfile(newProfile);
      
      if (!response.success) {
        throw new Error(response.message || 'Failed to update profile');
      }

      setProfile(newProfile);
      
      // Update user in auth store with new profile
      if (user) {
        setUser({ ...user, profile: newProfile });
      }

      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update profile';
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    profile,
    loading,
    error,
    updateProfile,
  };
};
