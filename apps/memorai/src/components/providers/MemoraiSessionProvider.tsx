/**
 * MEMORAI Application - Session Provider Component
 * Integrates NextAuth.js session with CODAI SSO SDK for memory management features
 */

'use client';

import { SessionProvider } from 'next-auth/react';
import { ReactNode } from 'react';

interface MemoraiSessionProviderProps {
    children: ReactNode;
    session?: any;
}

export default function MemoraiSessionProvider({ children, session }: MemoraiSessionProviderProps) {
    return (
        <SessionProvider
            session={session}
            refetchInterval={600} // 10 minutes - longer for knowledge work
            refetchOnWindowFocus={true}
            refetchWhenOffline={false}
        >
            {children}
        </SessionProvider>
    );
}
