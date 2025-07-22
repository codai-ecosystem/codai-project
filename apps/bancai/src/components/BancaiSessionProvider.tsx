'use client';

import { SessionProvider } from 'next-auth/react';
import { ReactNode } from 'react';

interface BancaiSessionProviderProps {
    children: ReactNode;
}

export default function BancaiSessionProvider({ children }: BancaiSessionProviderProps) {
    return (
        <SessionProvider refetchInterval={30 * 60}> {/* Refresh every 30 minutes for banking security */}
            {children}
        </SessionProvider>
    );
}
