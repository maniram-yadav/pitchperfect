import { create } from 'zustand';
import { Generation } from '../types/index';

interface EmailStore {
  generations: Generation[];
  currentGeneration: Generation | null;
  isLoading: boolean;
  setGenerations: (generations: Generation[]) => void;
  setCurrentGeneration: (generation: Generation | null) => void;
  setIsLoading: (loading: boolean) => void;
  addGeneration: (generation: Generation) => void;
}

export const useEmailStore = create<EmailStore>((set) => ({
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
}));
