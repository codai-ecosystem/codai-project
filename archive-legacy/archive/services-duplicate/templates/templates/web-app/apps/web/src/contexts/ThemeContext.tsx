'use client';

import type { JSX } from 'react';
import { createContext, useContext, type ReactNode } from 'react';

import { useTheme } from '@/hooks/useTheme';
import type { ThemeContextType } from '@/types/common';

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function useThemeContext(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useThemeContext must be used within a ThemeProvider');
  }
  return context;
}

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps): JSX.Element {
  const theme = useTheme();

  return (
    <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>
  );
}
