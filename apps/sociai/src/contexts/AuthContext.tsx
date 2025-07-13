'use client';

import React, { createContext, useContext } from 'react';

// Import the proper AuthContextType from the auth types
import type { AuthContextType } from '@/types/auth';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const value: AuthContextType = {
    user: null,
    isLoading: false,
    isAuthenticated: false,
    signIn: async () => ({ user: null, error: 'Authentication not configured' }),
    signUp: async () => ({ user: null, error: 'Authentication not configured' }),
    signInWithGoogle: async () => ({ user: null, error: 'Authentication not configured' }),
    signOut: async () => { },
    updateProfile: async () => { },
    updatePreferences: async () => { },
    sendPasswordReset: async () => { },
    sendEmailVerification: async () => { },
    createRecaptchaVerifier: () => null,
    sendPhoneVerification: async () => ({ confirmationResult: null, error: 'Authentication not configured' }),
    verifyPhoneCode: async () => ({ user: null, error: 'Authentication not configured' }),
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}
