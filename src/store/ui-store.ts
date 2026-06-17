import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UIState {
  theme: 'light' | 'dark';
  selectedNodeId: string | null;
  isPanelOpen: boolean;
  isPresentationMode: boolean;
  toasts: { id: string; message: string; type: 'success' | 'error' | 'info' }[];

  toggleTheme: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
  selectNode: (id: string | null) => void;
  setPanelOpen: (open: boolean) => void;
  startPresentation: () => void;
  stopPresentation: () => void;
  addToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  removeToast: (id: string) => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set, get) => ({
      theme: 'light',
      selectedNodeId: null,
      isPanelOpen: false,
      isPresentationMode: false,
      toasts: [],

      toggleTheme: () => {
        const next = get().theme === 'light' ? 'dark' : 'light';
        document.documentElement.classList.toggle('dark', next === 'dark');
        set({ theme: next });
      },

      setTheme: (theme) => {
        document.documentElement.classList.toggle('dark', theme === 'dark');
        set({ theme });
      },

      selectNode: (id) => set({ selectedNodeId: id, isPanelOpen: id !== null }),
      setPanelOpen: (open) => set({ isPanelOpen: open, selectedNodeId: open ? get().selectedNodeId : null }),

      startPresentation: () => set({
        isPresentationMode: true,
        selectedNodeId: null,
        isPanelOpen: false,
      }),
      stopPresentation: () => set({ isPresentationMode: false }),

      addToast: (message, type = 'info') => {
        const id = Math.random().toString(36).slice(2);
        set(state => ({ toasts: [...state.toasts, { id, message, type }] }));
        setTimeout(() => get().removeToast(id), 4000);
      },

      removeToast: (id) => set(state => ({ toasts: state.toasts.filter(t => t.id !== id) })),
    }),
    {
      name: 'ui-storage',
      partialize: (state) => ({ theme: state.theme }),
    }
  )
);
