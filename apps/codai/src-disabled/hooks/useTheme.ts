import { useCallback, useEffect } from 'react';

import { useThemeStore } from '@/stores/theme';

interface UseThemeReturn {
  theme: 'light' | 'dark' | 'system';
  effectiveTheme: 'light' | 'dark';
  setTheme: (newTheme: 'light' | 'dark' | 'system') => void;
  toggleTheme: () => void;
  isDark: boolean;
  isLight: boolean;
  isSystem: boolean;
}

export function useTheme(): UseThemeReturn {
  const { theme, effectiveTheme, setTheme, toggleTheme, setEffectiveTheme } =
    useThemeStore();
  // Listen for system theme changes
  useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

      const handleChange = (e: MediaQueryListEvent) => {
        setEffectiveTheme(e.matches ? 'dark' : 'light');
      };

      // Set initial theme
      setEffectiveTheme(mediaQuery.matches ? 'dark' : 'light');

      // Listen for changes
      mediaQuery.addEventListener('change', handleChange);

      return () => {
        mediaQuery.removeEventListener('change', handleChange);
      };
    } else {
      setEffectiveTheme(theme);
      return undefined;
    }
  }, [theme, setEffectiveTheme]);
  // Apply theme to document
  useEffect(() => {
    if (typeof window === 'undefined') return;

    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(effectiveTheme);
  }, [effectiveTheme]);
  const setThemeWithTransition = useCallback(
    (newTheme: 'light' | 'dark' | 'system') => {
      if (typeof window === 'undefined') return;

      // Add transition class
      document.documentElement.classList.add('theme-transition');

      setTheme(newTheme);

      // Remove transition class after animation
      setTimeout(() => {
        document.documentElement.classList.remove('theme-transition');
      }, 300);
    },
    [setTheme]
  );

  return {
    theme,
    effectiveTheme,
    setTheme: setThemeWithTransition,
    toggleTheme,
    isDark: effectiveTheme === 'dark',
    isLight: effectiveTheme === 'light',
    isSystem: theme === 'system',
  };
}
