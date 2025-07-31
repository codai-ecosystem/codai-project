import { useEffect, useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';

import { auth as firebaseAuth } from '@/lib/firebase';
import { logger } from '@/lib/logger';
import {
  BackendAuthService,
  LoginCredentials,
  RegisterCredentials,
} from '@/services/backend-auth';

interface UseBackendAuthReturn {
  isLoading: boolean;
  isAuthenticated: boolean;
  loginWithEmailPassword: (credentials: LoginCredentials) => Promise<boolean>;
  registerWithEmailPassword: (
    credentials: RegisterCredentials
  ) => Promise<boolean>;
  logout: () => Promise<boolean>;
  error: string | null;
}

/**
 * Hook for backend authentication synchronized with Firebase auth
 */
export function useBackendAuth(): UseBackendAuthReturn {
  const [firebaseUser, firebaseLoading] = useAuthState(firebaseAuth!);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Verify token when Firebase user changes
  useEffect(() => {
    const verifyBackendAuth = async () => {
      if (firebaseUser) {
        try {
          // Get Firebase ID token
          // Get Firebase ID token for verification
          await firebaseUser.getIdToken();

          // Use the token to verify with backend
          // This would typically store the token in a cookie or use it
          // in an Authorization header
          const isValid = await BackendAuthService.verifyToken();
          setIsAuthenticated(isValid);

          if (!isValid) {
            logger.warn('Backend token validation failed');
          }
        } catch (err) {
          const errorMsg =
            err instanceof Error ? err.message : 'Unknown error verifying auth';
          setError(errorMsg);
          setIsAuthenticated(false);
        }
      } else {
        setIsAuthenticated(false);
      }
    };

    if (!firebaseLoading) {
      verifyBackendAuth();
    }
  }, [firebaseUser, firebaseLoading]);

  /**
   * Login with email and password
   */
  const loginWithEmailPassword = async (
    credentials: LoginCredentials
  ): Promise<boolean> => {
    setError(null);
    try {
      const result = await BackendAuthService.login(credentials);
      setIsAuthenticated(!!result);
      return !!result;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Login failed';
      setError(errorMsg);
      return false;
    }
  };

  /**
   * Register with email and password
   */
  const registerWithEmailPassword = async (
    credentials: RegisterCredentials
  ): Promise<boolean> => {
    setError(null);
    try {
      const result = await BackendAuthService.register(credentials);
      setIsAuthenticated(!!result);
      return !!result;
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : 'Registration failed';
      setError(errorMsg);
      return false;
    }
  };

  /**
   * Logout from both Firebase and backend
   */
  const logout = async (): Promise<boolean> => {
    setError(null);
    try {
      // Logout from backend first
      await BackendAuthService.logout();

      // Then logout from Firebase
      await firebaseAuth?.signOut();

      setIsAuthenticated(false);
      return true;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Logout failed';
      setError(errorMsg);
      return false;
    }
  };

  return {
    isLoading: firebaseLoading,
    isAuthenticated,
    loginWithEmailPassword,
    registerWithEmailPassword,
    logout,
    error,
  };
}
