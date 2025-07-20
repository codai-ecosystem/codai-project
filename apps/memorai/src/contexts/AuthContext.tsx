'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { EnhancedCentralizedAuthService } from '@codai/auth';
import { AuthUser, LoginCredentials, RegisterCredentials } from '@codai/auth';

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  login: (credentials: LoginCredentials) => Promise<{ success: boolean; error?: string }>;
  register: (credentials: RegisterCredentials) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<AuthUser>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuthContext = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

// Initialize enhanced centralized auth service
const authService = new EnhancedCentralizedAuthService({
  authUrl: 'https://id.codai.ro',
  apiUrl: 'https://id.codai.ro',
  appId: 'memorai',
  tokenStorageKey: 'codai_auth_token',
  refreshTokenKey: 'codai_refresh_token',
  sessionStorageKey: 'codai_session',
  accessTokenExpiry: 15 * 60 * 1000, // 15 minutes
  refreshTokenExpiry: 7 * 24 * 60 * 60 * 1000, // 7 days
  rememberMeExpiry: 30 * 24 * 60 * 60 * 1000, // 30 days
  maxSessions: 5,
  enableSocialAuth: true,
  enableBiometric: false,
  requireEmailVerification: true,
  enableTwoFactor: true,
  passwordPolicy: {
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: true,
    preventCommonPasswords: true,
    preventReuse: 5
  },
  rateLimiting: {
    loginAttempts: 5,
    loginWindow: 15,
    passwordResetAttempts: 3,
    passwordResetWindow: 60
  }
});

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initialize auth state with enhanced centralized service
    const initAuth = async () => {
      try {
        const currentUser = authService.getCurrentUser();
        if (currentUser) {
          setUser(currentUser);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (credentials: LoginCredentials) => {
    try {
      setLoading(true);
      const resultUser = await authService.login(credentials);

      setUser(resultUser);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Login failed',
      };
    } finally {
      setLoading(false);
    }
  };

  const register = async (credentials: RegisterCredentials) => {
    try {
      setLoading(true);
      await authService.register(credentials);

      // After successful registration, attempt to login
      const loginResult = await authService.login({
        email: credentials.email,
        password: credentials.password
      });

      setUser(loginResult);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Registration failed',
      };
    } finally {
      setLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await authService.logout();
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
      // Still clear user on error
      setUser(null);
    }
  };

  const updateProfile = async (data: Partial<AuthUser>): Promise<void> => {
    try {
      // Note: Profile updates should go through ID app endpoints
      const response = await fetch('https://id.codai.ro/api/auth/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authService.getAuthToken()}`
        },
        body: JSON.stringify(data),
        credentials: 'include'
      });

      if (response.ok) {
        const updatedUser = await response.json();
        setUser(prev => prev ? { ...prev, ...updatedUser } : null);
      } else {
        throw new Error('Failed to update profile');
      }
    } catch (error) {
      console.error('Profile update error:', error);
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    login,
    register,
    logout,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
