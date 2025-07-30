/**
 * CODAI Application - Session Provider Component
 * Integrates NextAuth.js session with CODAI SSO SDK
 */

'use client';

import { SessionProvider } from 'next-auth/react';
import { ReactNode } from 'react';

interface CodaiSessionProviderProps {
  children: ReactNode;
  session?: any;
}

export default function CodaiSessionProvider({ children, session }: CodaiSessionProviderProps) {
  return (
    <SessionProvider session={session} refetchInterval={300} refetchOnWindowFocus={true}>
      {children}
    </SessionProvider>
  );
}
