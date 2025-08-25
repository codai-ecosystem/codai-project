'use client';

import { SessionProvider } from 'next-auth/react';
import { ReactNode } from 'react';
import { NotificationProvider } from './notifications';
import { AuthProvider } from '../lib/auth';
import { PerformanceProvider } from '../lib/performance/PerformanceProvider';

interface ProvidersProps {
    children: ReactNode;
}

export default function Providers({ children }: ProvidersProps) {
    return (
        <SessionProvider>
            <AuthProvider>
                <PerformanceProvider>
                    <NotificationProvider>
                        {children}
                    </NotificationProvider>
                </PerformanceProvider>
            </AuthProvider>
        </SessionProvider>
    );
}
