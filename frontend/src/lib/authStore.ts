import { create } from 'zustand';
import { User } from '../types/index';
import { useEmailStore } from './emailStore';

interface AuthStore {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  hasLoaded: boolean;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  logout: () => void;
  loadFromStorage: () => void;
  deductTokens: (amount: number) => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  hasLoaded: false,
  
  setUser: (user) => {
    set({ user, isAuthenticated: !!user });
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  },
  
  setToken: (token) => {
    set({ token });
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  },
  
  logout: () => {
    set({ user: null, token: null, isAuthenticated: false });
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    useEmailStore.getState().clearStore();
  },
  
  loadFromStorage: () => {
    const user = localStorage.getItem('user');
    const token = localStorage.getItem('token');

    if (user && token) {
      set({ user: JSON.parse(user), token, isAuthenticated: true, hasLoaded: true });
    } else {
      set({ hasLoaded: true });
    }
  },

  deductTokens: (amount: number) => {
    set((state) => {
      if (!state.user) return state;
      const updated = { ...state.user, tokens: Math.max(0, state.user.tokens - amount) };
      localStorage.setItem('user', JSON.stringify(updated));
      return { user: updated };
    });
  },
}));
