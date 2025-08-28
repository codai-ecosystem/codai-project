'use client';

import { ReactNode } from 'react';
import { ThemeProvider } from './theme/ThemeProvider';
import { ToastProvider } from '@/lib/providers/toast.provider';

interface ProvidersProps {
    children: ReactNode;
}

export default function Providers({ children }: ProvidersProps) {
    return (
        <ThemeProvider defaultTheme="system" storageKey="memorai-theme">
            <ToastProvider>
                {children}
            </ToastProvider>
        </ThemeProvider>
    );
}
