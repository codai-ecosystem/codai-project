'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Theme types
type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
    theme: Theme;
    resolvedTheme: 'light' | 'dark';
    toggleTheme: () => void;
    setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Custom hook to use theme
export const useTheme = () => {
    const context = useContext(ThemeContext);
    
    // During SSR or before ThemeProvider is mounted, return default theme
    if (context === undefined) {
        if (typeof window === 'undefined') {
            return {
                theme: 'dark' as Theme,
                resolvedTheme: 'dark' as const,
                toggleTheme: () => { },
                setTheme: () => { }
            };
        }
        
        // In development, warn about missing provider
        if (process.env.NODE_ENV === 'development') {
            console.warn('useTheme must be used within a ThemeProvider. Falling back to default theme.');
        }
        
        // Return fallback theme for production
        return {
            theme: 'dark' as Theme,
            resolvedTheme: 'dark' as const,
            toggleTheme: () => { },
            setTheme: () => { }
        };
    }
    
    return context;
};

// System theme detection
const getSystemTheme = (): 'light' | 'dark' => {
    if (typeof window === 'undefined') return 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

// Get stored theme
const getStoredTheme = (storageKey: string): Theme | null => {
    if (typeof window === 'undefined') return null;
    try {
        return localStorage.getItem(storageKey) as Theme;
    } catch {
        return null;
    }
};

// Store theme
const setStoredTheme = (theme: Theme, storageKey: string): void => {
    if (typeof window === 'undefined') return;
    try {
        localStorage.setItem(storageKey, theme);
    } catch {
        // Silently fail if localStorage is not available
    }
};

// Theme provider component
interface ThemeProviderProps {
    children: ReactNode;
    defaultTheme?: Theme;
    storageKey?: string;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ 
    children,
    defaultTheme = 'system',
    storageKey = 'codai-theme'
}) => {
    // Initialize with server-safe defaults to prevent hydration mismatch
    const [theme, setThemeState] = useState<Theme>('dark');
    const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('dark');
    const [mounted, setMounted] = useState(false);

    // Initialize theme on mount (client-side only)
    useEffect(() => {
        const stored = getStoredTheme(storageKey);
        const initialTheme = stored || defaultTheme;
        const initialResolvedTheme = initialTheme === 'system' ? getSystemTheme() : initialTheme;
        
        setThemeState(initialTheme);
        setResolvedTheme(initialResolvedTheme);
        setMounted(true);
        
        // Update document immediately on first mount
        document.documentElement.setAttribute('data-theme', initialResolvedTheme);
        document.documentElement.classList.remove('light', 'dark');
        document.documentElement.classList.add(initialResolvedTheme);
        
        // Update meta theme-color
        const metaThemeColor = document.querySelector('meta[name="theme-color"]');
        if (metaThemeColor) {
            metaThemeColor.setAttribute(
                'content',
                initialResolvedTheme === 'dark' ? '#0f172a' : '#ffffff'
            );
        }
    }, [defaultTheme, storageKey]);

    // Update resolved theme when theme changes
    useEffect(() => {
        if (!mounted) return;

        const updateResolvedTheme = () => {
            const resolved = theme === 'system' ? getSystemTheme() : theme;
            setResolvedTheme(resolved);

            // Update document class
            document.documentElement.setAttribute('data-theme', resolved);
            document.documentElement.classList.remove('light', 'dark');
            document.documentElement.classList.add(resolved);

            // Update meta theme-color for mobile browsers
            const metaThemeColor = document.querySelector('meta[name="theme-color"]');
            if (metaThemeColor) {
                metaThemeColor.setAttribute(
                    'content',
                    resolved === 'dark' ? '#0f172a' : '#ffffff'
                );
            }
        };

        updateResolvedTheme();
    }, [theme, mounted]);

    // Listen for system theme changes
    useEffect(() => {
        if (!mounted) return;

        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleChange = () => {
            if (theme === 'system') {
                const newResolvedTheme = mediaQuery.matches ? 'dark' : 'light';
                setResolvedTheme(newResolvedTheme);
                
                // Update document class
                document.documentElement.setAttribute('data-theme', newResolvedTheme);
                document.documentElement.classList.remove('light', 'dark');
                document.documentElement.classList.add(newResolvedTheme);
            }
        };

        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, [theme, mounted]);

    // Set theme function
    const setTheme = (newTheme: Theme) => {
        setThemeState(newTheme);
        setStoredTheme(newTheme, storageKey);
    };

    // Toggle theme function
    const toggleTheme = () => {
        if (theme === 'system') {
            const systemTheme = getSystemTheme();
            setTheme(systemTheme === 'dark' ? 'light' : 'dark');
        } else {
            setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
        }
    };

    // Prevent hydration mismatch by rendering children with default theme during SSR
    if (!mounted) {
        return (
            <div className="theme-transition dark">
                {children}
            </div>
        );
    }

    const value: ThemeContextType = {
        theme,
        resolvedTheme,
        toggleTheme,
        setTheme,
    };

    return (
        <ThemeContext.Provider value={value}>
            <motion.div 
                className={`theme-transition ${resolvedTheme}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
            >
                {children}
            </motion.div>
        </ThemeContext.Provider>
    );
};

// Theme toggle component
interface ThemeToggleProps {
    className?: string;
    size?: 'sm' | 'md' | 'lg';
    variant?: 'icon' | 'button' | 'switch';
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({
    className = '',
    size = 'md',
    variant = 'icon',
}) => {
    const { resolvedTheme, toggleTheme } = useTheme();

    const sizeClasses = {
        sm: 'w-8 h-8',
        md: 'w-10 h-10',
        lg: 'w-12 h-12',
    };

    const iconSizes = {
        sm: 'w-4 h-4',
        md: 'w-5 h-5',
        lg: 'w-6 h-6',
    };

    if (variant === 'switch') {
        return (
            <motion.button
                onClick={toggleTheme}
                className={`relative inline-flex items-center h-6 w-11 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                    resolvedTheme === 'dark' ? 'bg-blue-600' : 'bg-gray-200'
                } ${className}`}
                whileTap={{ scale: 0.95 }}
                aria-label="Toggle theme"
            >
                <motion.span
                    className={`inline-block w-4 h-4 transform rounded-full bg-white shadow-lg transition-transform ${
                        resolvedTheme === 'dark' ? 'translate-x-6' : 'translate-x-1'
                    }`}
                    layout
                    transition={{ type: 'spring', stiffness: 700, damping: 30 }}
                />
            </motion.button>
        );
    }

    if (variant === 'button') {
        return (
            <motion.button
                onClick={toggleTheme}
                className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors ${className}`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                aria-label="Toggle theme"
            >
                <motion.div
                    key={resolvedTheme}
                    initial={{ opacity: 0, rotate: -180 }}
                    animate={{ opacity: 1, rotate: 0 }}
                    exit={{ opacity: 0, rotate: 180 }}
                    transition={{ duration: 0.2 }}
                >
                    {resolvedTheme === 'dark' ? (
                        <SunIcon className={iconSizes[size]} />
                    ) : (
                        <MoonIcon className={iconSizes[size]} />
                    )}
                </motion.div>
                <span className="text-sm font-medium">
                    {resolvedTheme === 'dark' ? 'Light' : 'Dark'}
                </span>
            </motion.button>
        );
    }

    return (
        <motion.button
            onClick={toggleTheme}
            className={`${sizeClasses[size]} rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${className}`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            aria-label="Toggle theme"
        >
            <AnimatePresence mode="wait" initial={false}>
                <motion.div
                    key={resolvedTheme}
                    initial={{ opacity: 0, rotate: -90, scale: 0.8 }}
                    animate={{ opacity: 1, rotate: 0, scale: 1 }}
                    exit={{ opacity: 0, rotate: 90, scale: 0.8 }}
                    transition={{ duration: 0.2, ease: 'easeInOut' }}
                >
                    {resolvedTheme === 'dark' ? (
                        <SunIcon className={iconSizes[size]} />
                    ) : (
                        <MoonIcon className={iconSizes[size]} />
                    )}
                </motion.div>
            </AnimatePresence>
        </motion.button>
    );
};

// Theme selector dropdown
export const ThemeSelector: React.FC<{ className?: string }> = ({
    className = '',
}) => {
    const { theme, setTheme } = useTheme();
    const [isOpen, setIsOpen] = useState(false);

    const themes: Array<{ value: Theme; label: string; icon: React.ReactNode }> = [
        { value: 'light', label: 'Light', icon: <SunIcon className="w-4 h-4" /> },
        { value: 'dark', label: 'Dark', icon: <MoonIcon className="w-4 h-4" /> },
        { value: 'system', label: 'System', icon: <ComputerIcon className="w-4 h-4" /> },
    ];

    return (
        <div className={`relative ${className}`}>
            <motion.button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                aria-label="Select theme"
                aria-expanded={isOpen}
            >
                {themes.find(t => t.value === theme)?.icon}
                <span className="text-sm font-medium">
                    {themes.find(t => t.value === theme)?.label}
                </span>
                <ChevronDownIcon className="w-4 h-4" />
            </motion.button>

            <AnimatePresence>
                {isOpen && (
                    <>
                        <motion.div
                            className="fixed inset-0 z-10"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsOpen(false)}
                        />
                        <motion.div
                            className="absolute top-full left-0 mt-2 w-40 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-20 overflow-hidden"
                            initial={{ opacity: 0, y: -10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -10, scale: 0.95 }}
                            transition={{ duration: 0.2, ease: 'easeOut' }}
                        >
                            {themes.map((themeOption) => (
                                <motion.button
                                    key={themeOption.value}
                                    onClick={() => {
                                        setTheme(themeOption.value);
                                        setIsOpen(false);
                                    }}
                                    className={`w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                                        theme === themeOption.value ? 'bg-blue-50 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'
                                    }`}
                                    whileHover={{ backgroundColor: theme === themeOption.value ? undefined : 'rgba(0,0,0,0.05)' }}
                                >
                                    {themeOption.icon}
                                    <span className="text-sm font-medium">{themeOption.label}</span>
                                    {theme === themeOption.value && (
                                        <CheckIcon className="w-4 h-4 ml-auto" />
                                    )}
                                </motion.button>
                            ))}
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};

// Icons components
const SunIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
);

const MoonIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
    </svg>
);

const ComputerIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
);

const ChevronDownIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
);

const CheckIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
);