'use client';

import React, { type ReactNode } from 'react';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { MotionProvider } from '@/contexts/MotionContext';
import { LanguageProvider } from '@/contexts/LanguageContext';

interface ProvidersProps {
    children: ReactNode;
}

/**
 * Combined providers wrapper for all context providers
 * This component wraps the entire app with all necessary context providers
 */
export function Providers({ children }: ProvidersProps) {
    return (
        <LanguageProvider>
            <ThemeProvider>
                <MotionProvider>
                    {children}
                </MotionProvider>
            </ThemeProvider>
        </LanguageProvider>
    );
}