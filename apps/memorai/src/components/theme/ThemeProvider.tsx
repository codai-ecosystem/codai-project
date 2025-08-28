/**
 * @fileoverview Theme Provider for MemorAI
 * @description Manages theme state and provides theme switching functionality
 */

'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

export type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolvedTheme: 'light' | 'dark';
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
}

export function ThemeProvider({
  children,
  defaultTheme = 'system',
  storageKey = 'memorai-theme',
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(defaultTheme);
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light');
  const [mounted, setMounted] = useState(false);

  // Initialize theme from localStorage or system preference
  useEffect(() => {
    const stored = localStorage.getItem(storageKey) as Theme;
    if (stored && ['light', 'dark', 'system'].includes(stored)) {
      setThemeState(stored);
    }
    setMounted(true);
  }, [storageKey]);

  // Update resolved theme when theme changes or system preference changes
  useEffect(() => {
    const updateResolvedTheme = () => {
      let resolved: 'light' | 'dark' = 'light';

      if (theme === 'system') {
        resolved = window.matchMedia('(prefers-color-scheme: dark)').matches
          ? 'dark'
          : 'light';
      } else {
        resolved = theme;
      }

      setResolvedTheme(resolved);

      // Apply theme to document
      const root = window.document.documentElement;
      root.classList.remove('light', 'dark');
      root.classList.add(resolved);

      // Update meta theme-color for mobile browsers
      const metaThemeColor = document.querySelector('meta[name="theme-color"]');
      if (metaThemeColor) {
        metaThemeColor.setAttribute(
          'content',
          resolved === 'dark' ? '#09090b' : '#ffffff'
        );
      }

      // Store in localStorage
      localStorage.setItem(storageKey, theme);
    };

    if (!mounted) {
      return;
    }

    updateResolvedTheme();

    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (theme === 'system') {
        updateResolvedTheme();
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme, mounted, storageKey]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return null;
  }

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
        resolvedTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);

  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }

  return context;
}

// Theme transition utility
export function enableThemeTransitions() {
  const css = document.createElement('style');
  css.type = 'text/css';
  css.appendChild(
    document.createTextNode(
      `* {
        transition: background-color 0.3s ease, 
                    border-color 0.3s ease, 
                    color 0.3s ease !important;
      }`
    )
  );
  document.head.appendChild(css);

  return () => {
    document.head.removeChild(css);
  };
}

// Theme colors utility
export function getThemeColors(theme: 'light' | 'dark') {
  const colors = {
    light: {
      background: 'rgb(255, 255, 255)',
      foreground: 'rgb(15, 15, 15)',
      primary: 'rgb(59, 130, 246)',
      secondary: 'rgb(71, 85, 105)',
      muted: 'rgb(248, 250, 252)',
      border: 'rgb(226, 232, 240)',
      card: 'rgb(255, 255, 255)',
    },
    dark: {
      background: 'rgb(9, 9, 11)',
      foreground: 'rgb(250, 250, 250)',
      primary: 'rgb(96, 165, 250)',
      secondary: 'rgb(39, 39, 42)',
      muted: 'rgb(39, 39, 42)',
      border: 'rgb(39, 39, 42)',
      card: 'rgb(24, 24, 27)',
    },
  };

  return colors[theme];
}