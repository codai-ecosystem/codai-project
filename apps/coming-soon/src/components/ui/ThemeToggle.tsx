'use client';

import React from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { Sun, Moon } from 'lucide-react';

export const ThemeToggle: React.FC = () => {
    const { theme, toggleTheme } = useTheme();

    return (
        <button
            onClick={toggleTheme}
            className="fixed top-6 right-6 z-50 p-3 rounded-full bg-white/10 dark:bg-black/10 backdrop-blur-md border border-white/20 dark:border-white/10 hover:bg-white/20 dark:hover:bg-black/20 transition-all duration-300 group hover:scale-105 active:scale-95"
        >
            <div
                className="relative w-6 h-6"
                style={{
                    transform: theme === 'dark' ? 'rotate(0deg)' : 'rotate(180deg)',
                    transition: 'transform 0.3s ease'
                }}
            >
                <Sun
                    className={`absolute inset-0 w-6 h-6 text-yellow-500 transition-opacity duration-300 ${theme === 'dark' ? 'opacity-0' : 'opacity-100'
                        }`}
                />
                <Moon
                    className={`absolute inset-0 w-6 h-6 text-blue-400 transition-opacity duration-300 ${theme === 'dark' ? 'opacity-100' : 'opacity-0'
                        }`}
                />
            </div>
        </button>
    );
};