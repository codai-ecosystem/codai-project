'use client';

import React, { createContext, useContext, type ReactNode } from 'react';

interface AuthContextType {
  user: null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  forgotPassword: (email: string) => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
  signIn: (data: any) => Promise<{ error: string | null }>;
  signUp: (data: any) => Promise<{ error: string | null }>;
  signInWithGoogle: () => Promise<{ error: string | null }>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const authValue: AuthContextType = {
    user: null,
    login: async (email: string, password: string) => {
      // Mock login implementation
      console.log('Login attempt:', email);
    },
    logout: () => {
      // Mock logout implementation
      console.log('Logout');
    },
    forgotPassword: async (email: string) => {
      // Mock forgot password implementation
      console.log('Forgot password for:', email);
    },
    sendPasswordReset: async (email: string) => {
      // Mock send password reset implementation
      console.log('Send password reset for:', email);
    },
    signIn: async (data: any) => {
      // Mock sign in implementation
      console.log('Sign in attempt:', data.email);
      return { error: null };
    },
    signUp: async (data: any) => {
      // Mock sign up implementation
      console.log('Sign up attempt:', data.email);
      return { error: null };
    },
    signInWithGoogle: async () => {
      // Mock Google sign in implementation
      console.log('Google sign in attempt');
      return { error: null };
    },
    isLoading: false,
  };

  return (
    <AuthContext.Provider value={authValue}>
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
