'use client'

import React from 'react';

import { SessionProvider } from 'next-auth/react';

/**
 * Authentication Provider Wrapper
 * Wraps the app with NextAuth SessionProvider
 */
interface AuthProviderProps {
    children: React.ReactNode;
    session?: any;
}

export function AuthProvider({ children, session }: AuthProviderProps) {
    return (
        <SessionProvider session={session} refetchInterval={5 * 60} refetchOnWindowFocus={true}>
            {children}
        </SessionProvider>
    );
}

