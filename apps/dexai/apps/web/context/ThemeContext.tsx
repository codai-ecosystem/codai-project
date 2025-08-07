'use client'

import React from 'react';

import { createContext, useContext, useEffect, useState } from 'react';

interface ThemeContextType {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  theme: 'light' | 'dark';
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [mounted, setMounted] = useState<boolean>(false);

  // Handle hydration and local storage
  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (saved) {
      setIsDarkMode(saved === 'dark');
    } else {
      setIsDarkMode(prefersDark);
    }
  }, []);

  // Update document class and local storage when theme changes
  useEffect(() => {
    if (!mounted) return;
    
    const root = document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode, mounted]);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  // Prevent flash of unstyled content during hydration
  if (!mounted) {
    return (
      <div className="opacity-0">
        {children}
      </div>
    );
  }

  return (
    <ThemeContext.Provider 
      value={{ 
        isDarkMode, 
        toggleDarkMode, 
        theme: isDarkMode ? 'dark' : 'light'
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

