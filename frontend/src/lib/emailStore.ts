import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Generation } from '../types/index';

interface EmailStore {
  generations: Generation[];
  currentGeneration: Generation | null;
  isLoading: boolean;
  setGenerations: (generations: Generation[]) => void;
  setCurrentGeneration: (generation: Generation | null) => void;
  setIsLoading: (loading: boolean) => void;
  addGeneration: (generation: Generation) => void;
  clearStore: () => void;
}

export const useEmailStore = create<EmailStore>()(
  persist(
    (set) => ({
      generations: [],
      currentGeneration: null,
      isLoading: false,

      setGenerations: (generations) => set({ generations }),
      setCurrentGeneration: (generation) => set({ currentGeneration: generation }),
      setIsLoading: (loading) => set({ isLoading: loading }),

      addGeneration: (generation) =>
        set((state) => ({
          generations: [generation, ...state.generations],
        })),

      clearStore: () => set({ generations: [], currentGeneration: null }),
    }),
    {
      name: 'email-store',
      // Do NOT persist generations — they are user-specific and fetched from the API.
      // Persisting them would expose one user's emails to the next user on the same browser.
      partialize: () => ({}),
    }
  )
);
