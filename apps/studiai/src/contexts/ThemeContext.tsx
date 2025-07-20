'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
    theme: Theme;
    setTheme: (theme: Theme) => void;
    resolvedTheme: 'light' | 'dark';
    isLoading: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
    children: ReactNode;
    defaultTheme?: Theme;
    storageKey?: string;
}

export function ThemeProvider({
    children,
    defaultTheme = 'system',
    storageKey = 'studiai-theme'
}: ThemeProviderProps) {
    const [theme, setTheme] = useState<Theme>(defaultTheme);
    const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light');
    const [isLoading, setIsLoading] = useState(true);

    const updateTheme = (newTheme: Theme) => {
        setTheme(newTheme);

        if (typeof window !== 'undefined') {
            localStorage.setItem(storageKey, newTheme);
        }
    };

    const getSystemTheme = (): 'light' | 'dark' => {
        if (typeof window === 'undefined') return 'light';
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    };

    const updateResolvedTheme = (currentTheme: Theme) => {
        const resolved = currentTheme === 'system' ? getSystemTheme() : currentTheme;
        setResolvedTheme(resolved);

        // Update document class
        if (typeof document !== 'undefined') {
            document.documentElement.classList.remove('light', 'dark');
            document.documentElement.classList.add(resolved);
            document.documentElement.setAttribute('data-theme', resolved);
        }
    };

    // Initialize theme on mount
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const savedTheme = localStorage.getItem(storageKey) as Theme;
            const initialTheme = savedTheme || defaultTheme;
            setTheme(initialTheme);
            updateResolvedTheme(initialTheme);
        }
        setIsLoading(false);
    }, [defaultTheme, storageKey]);

    // Listen for system theme changes
    useEffect(() => {
        if (typeof window === 'undefined') return;

        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleChange = () => {
            if (theme === 'system') {
                updateResolvedTheme('system');
            }
        };

        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, [theme]);

    // Update resolved theme when theme changes
    useEffect(() => {
        updateResolvedTheme(theme);
    }, [theme]);

    const value: ThemeContextType = {
        theme,
        setTheme: updateTheme,
        resolvedTheme,
        isLoading
    };

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme(): ThemeContextType {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
}
