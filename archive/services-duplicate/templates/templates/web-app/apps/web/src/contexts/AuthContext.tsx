'use client';

import type { JSX } from 'react';
import { createContext, useContext, type ReactNode } from 'react';

import { useAuth } from '@/hooks/useAuth';
import type { AuthContextType } from '@/types/auth';

// Export the AuthContextType for test usage
export type { AuthContextType } from '@/types/auth';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuthContext(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps): JSX.Element {
  const auth = useAuth();

  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
}

// Export alias for test compatibility
export { AuthProvider as AuthContextProvider };
