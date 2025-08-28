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

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: 'system',
      effectiveTheme: 'light',
      
      setTheme: (theme: 'light' | 'dark' | 'system') => {
        set({ theme });
        
        if (theme === 'system') {
          const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
          (get() as ThemeState).setEffectiveTheme(systemTheme);
        } else {
          (get() as ThemeState).setEffectiveTheme(theme);
        }
      },
      
      toggleTheme: () => {
        const current = (get() as ThemeState).theme;
        if (current === 'light') {
          (get() as ThemeState).setTheme('dark');
        } else {
          (get() as ThemeState).setTheme('light');
        }
      },
      
      setEffectiveTheme: (effectiveTheme: 'light' | 'dark') => {
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
