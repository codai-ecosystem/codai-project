import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface ThemeState {
  theme: 'light' | 'dark' | 'system';
  effectiveTheme: 'light' | 'dark';
  
  // Actions
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  toggleTheme: () => void;
  setEffectiveTheme: (theme: 'light' | 'dark') => void;
}

export const useThemeStore = create(
  persist(
    (set, get) => ({
      theme: 'system',
      effectiveTheme: 'light',
      
      setTheme: (theme) => {
        set({ theme });
        
        if (theme === 'system') {
          const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
          get().setEffectiveTheme(systemTheme);
        } else {
          get().setEffectiveTheme(theme);
        }
      },
      
      toggleTheme: () => {
        const current = get().theme;
        if (current === 'light') {
          get().setTheme('dark');
        } else {
          get().setTheme('light');
        }
      },
      
      setEffectiveTheme: (effectiveTheme) => {
        set({ effectiveTheme });
        
        if (typeof document !== 'undefined') {
          document.documentElement.classList.remove('light', 'dark');
          document.documentElement.classList.add(effectiveTheme);
        }
      },
    }),
    {
      name: 'theme-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
