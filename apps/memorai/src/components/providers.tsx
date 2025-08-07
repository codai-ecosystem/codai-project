'use client';

import { SessionProvider } from 'next-auth/react';
import { ReactNode } from 'react';
import { NotificationProvider } from './notifications';
import { AuthProvider } from '../lib/auth';

interface ProvidersProps {
    children: ReactNode;
}

export default function Providers({ children }: ProvidersProps) {
    return (
        <SessionProvider>
            <AuthProvider>
                <NotificationProvider>
                    {children}
                </NotificationProvider>
            </AuthProvider>
        </SessionProvider>
    );
}
