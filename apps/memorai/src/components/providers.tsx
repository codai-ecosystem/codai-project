'use client';

import { ReactNode } from 'react';
import { ThemeProvider } from './theme/ThemeProvider';

interface ProvidersProps {
    children: ReactNode;
}

export default function Providers({ children }: ProvidersProps) {
    return (
        <ThemeProvider defaultTheme="system" storageKey="memorai-theme">
            {children}
        </ThemeProvider>
    );
}
