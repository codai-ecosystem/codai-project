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

      setTheme: theme => {
        set({ theme });

        // Update effective theme based on system preference if needed
        if (theme === 'system') {
          try {
            const systemTheme = window.matchMedia(
              '(prefers-color-scheme: dark)'
            ).matches
              ? 'dark'
              : 'light';
            get().setEffectiveTheme(systemTheme);
          } catch (error) {
            // Fallback to light theme if matchMedia is not supported
            get().setEffectiveTheme('light');
          }
        } else {
          get().setEffectiveTheme(theme);
        }
      },

      toggleTheme: () => {
        const currentTheme = get().theme;
        if (currentTheme === 'system') {
          set({ theme: 'light' });
          get().setEffectiveTheme('light');
        } else if (currentTheme === 'light') {
          set({ theme: 'dark' });
          get().setEffectiveTheme('dark');
        } else {
          set({ theme: 'light' });
          get().setEffectiveTheme('light');
        }
      },

      setEffectiveTheme: effectiveTheme => {
        set({ effectiveTheme });

        // Update document class
        if (typeof document !== 'undefined') {
          document.documentElement.classList.remove('light', 'dark');
          document.documentElement.classList.add(effectiveTheme);
        }
      },
    }),
    {
      name: 'theme-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: state => ({
        theme: state.theme,
      }),
    }
  )
);
