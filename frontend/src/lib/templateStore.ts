import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface FormTemplate {
  id: string;
  name: string;
  createdAt: string;
  values: Record<string, any>;
}

interface TemplateStore {
  templates: FormTemplate[];
  lastUsedTemplateId: string | null;
  saveTemplate: (name: string, values: Record<string, any>) => FormTemplate;
  deleteTemplate: (id: string) => void;
  setLastUsed: (id: string) => void;
  getTemplate: (id: string) => FormTemplate | undefined;
}

export const useTemplateStore = create<TemplateStore>()(
  persist(
    (set, get) => ({
      templates: [],
      lastUsedTemplateId: null,

      saveTemplate: (name, values) => {
        const template: FormTemplate = {
          id: crypto.randomUUID(),
          name,
          createdAt: new Date().toISOString(),
          values,
        };
        set((state) => ({ templates: [template, ...state.templates] }));
        return template;
      },

      deleteTemplate: (id) =>
        set((state) => ({
          templates: state.templates.filter((t) => t.id !== id),
          lastUsedTemplateId: state.lastUsedTemplateId === id ? null : state.lastUsedTemplateId,
        })),

      setLastUsed: (id) => set({ lastUsedTemplateId: id }),

      getTemplate: (id) => get().templates.find((t) => t.id === id),
    }),
    { name: 'email-templates' }
  )
);
