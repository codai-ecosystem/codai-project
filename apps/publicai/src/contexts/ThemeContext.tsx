'use client';

import React, { createContext, useContext, useState, useEffect, type ReactNode, type JSX } from 'react';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
    theme: Theme;
    actualTheme: 'light' | 'dark';
    setTheme: (theme: Theme) => void;
    toggleTheme: () => void;
    isLoading: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
    children: ReactNode;
}

function getSystemTheme(): 'light' | 'dark' {
    if (typeof window === 'undefined') return 'light';
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function ThemeProvider({ children }: ThemeProviderProps): JSX.Element {
    const [theme, setThemeState] = useState<Theme>('system');
    const [actualTheme, setActualTheme] = useState<'light' | 'dark'>('light');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Initialize theme from localStorage
        const savedTheme = localStorage.getItem('theme') as Theme;
        if (savedTheme && ['light', 'dark', 'system'].includes(savedTheme)) {
            setThemeState(savedTheme);
        }
        setIsLoading(false);
    }, []);

    useEffect(() => {
        // Update actual theme based on theme setting
        const updateActualTheme = () => {
            const newActualTheme = theme === 'system' ? getSystemTheme() : theme;
            setActualTheme(newActualTheme);

            // Update DOM
            const root = document.documentElement;
            root.classList.remove('light', 'dark');
            root.classList.add(newActualTheme);
            root.setAttribute('data-theme', newActualTheme);
        };

        updateActualTheme();

        // Listen for system theme changes
        if (theme === 'system') {
            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
            const handleChange = () => updateActualTheme();

            mediaQuery.addEventListener('change', handleChange);
            return () => mediaQuery.removeEventListener('change', handleChange);
        }
    }, [theme]);

    const setTheme = (newTheme: Theme) => {
        try {
            localStorage.setItem('theme', newTheme);
            setThemeState(newTheme);
        } catch (error) {
            console.error('Failed to set theme:', error);
        }
    };

    const toggleTheme = () => {
        const newTheme = actualTheme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
    };

    const value: ThemeContextType = {
        theme,
        actualTheme,
        setTheme,
        toggleTheme,
        isLoading,
    };

    return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextType {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
}
