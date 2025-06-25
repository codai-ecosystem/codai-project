/**
 * Authentication Hook
 * React hook for managing authentication state with LogAI
 */

'use client';

import {
  useState,
  useEffect,
  useContext,
  createContext,
  ReactNode,
} from 'react';
import { AuthUser } from '@/lib/services';

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string) => Promise<boolean>;
  logout: () => void;
  refreshToken: () => Promise<boolean>;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isAuthenticated = !!user;

  // Initialize auth state on mount
  useEffect(() => {
    const initAuth = async () => {
      const savedToken = localStorage.getItem('fabricai_token');
      if (savedToken) {
        await validateStoredToken(savedToken);
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const validateStoredToken = async (token: string): Promise<void> => {
    try {
      const response = await fetch('/api/auth/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      });

      const data = await response.json();

      if (data.success && data.user) {
        setUser(data.user);
        setError(null);
        // Update token if refreshed
        if (data.token) {
          localStorage.setItem('fabricai_token', data.token);
        }
      } else {
        // Token invalid, clear storage
        localStorage.removeItem('fabricai_token');
        localStorage.removeItem('fabricai_refresh_token');
        setError(data.error || 'Authentication failed');
      }
    } catch (err) {
      console.error('Token validation error:', err);
      setError('Authentication service unavailable');
      localStorage.removeItem('fabricai_token');
      localStorage.removeItem('fabricai_refresh_token');
    }
  };

  const login = async (token: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      });

      const data = await response.json();

      if (data.success && data.user) {
        setUser(data.user);
        localStorage.setItem('fabricai_token', data.token || token);
        setIsLoading(false);
        return true;
      } else {
        setError(data.error || 'Login failed');
        setIsLoading(false);
        return false;
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Authentication service unavailable');
      setIsLoading(false);
      return false;
    }
  };

  const logout = (): void => {
    setUser(null);
    setError(null);
    localStorage.removeItem('fabricai_token');
    localStorage.removeItem('fabricai_refresh_token');
  };

  const refreshToken = async (): Promise<boolean> => {
    const savedRefreshToken = localStorage.getItem('fabricai_refresh_token');
    if (!savedRefreshToken) {
      logout();
      return false;
    }

    try {
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken: savedRefreshToken }),
      });

      const data = await response.json();

      if (data.success && data.user && data.token) {
        setUser(data.user);
        localStorage.setItem('fabricai_token', data.token);
        setError(null);
        return true;
      } else {
        logout();
        return false;
      }
    } catch (err) {
      console.error('Token refresh error:', err);
      logout();
      return false;
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    refreshToken,
    error,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
