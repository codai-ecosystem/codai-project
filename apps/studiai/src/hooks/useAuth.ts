import type { Auth } from 'firebase/auth';
import { useCallback, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';

import { isFirebaseEnabled } from '@/lib/env';
import { auth } from '@/lib/firebase';
import { AuthService } from '@/services/auth';
import { useAuthStore } from '@/stores/auth';
import type {
  AuthCredentials,
  AuthResponse,
  RegisterCredentials,
  User,
  UserPreferences,
} from '@/types/auth';

// Create a dummy auth object for SSR scenarios
const dummyAuth = {
  currentUser: null,
  onAuthStateChanged: () => () => { }, // Add minimal mock implementation
  signOut: async () => Promise.resolve(),
} as unknown as Auth;

interface UseAuthReturn {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  signIn: (credentials: AuthCredentials) => Promise<AuthResponse>;
  signUp: (credentials: RegisterCredentials) => Promise<AuthResponse>;
  signInWithGoogle: () => Promise<AuthResponse>;
  signOut: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  updatePreferences: (preferences: Partial<UserPreferences>) => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
  sendEmailVerification: () => Promise<void>;
  // Phone authentication methods
  createRecaptchaVerifier: (
    containerId: string
  ) => import('firebase/auth').ApplicationVerifier | null;
  sendPhoneVerification: (
    phoneNumber: string,
    recaptchaVerifier: import('firebase/auth').ApplicationVerifier
  ) => Promise<{
    confirmationResult: import('firebase/auth').ConfirmationResult | null;
    error: string | null;
  }>;
  verifyPhoneCode: (
    confirmationResult: import('firebase/auth').ConfirmationResult,
    verificationCode: string
  ) => Promise<AuthResponse>;
}

export function useAuth(): UseAuthReturn {
  // Check if Firebase is enabled
  const firebaseEnabled = isFirebaseEnabled();

  // Only use Firebase hooks if Firebase is enabled
  const [firebaseUser, loading, error] = useAuthState(
    firebaseEnabled && typeof window !== 'undefined' && auth != null
      ? auth
      : dummyAuth
  );
  const { user, setUser, setLoading, clearAuth, updateUserData } =
    useAuthStore();

  // Sync Firebase user with Zustand store
  useEffect(() => {
    if (!firebaseEnabled) {
      // If Firebase is disabled, clear loading state and keep user as null
      setLoading(false);
      return;
    }

    if (loading) {
      setLoading(true);
      return;
    }
    if (firebaseUser) {
      // Fetch user document from Firestore
      AuthService.getUserDocument(firebaseUser.uid).then(
        (userData: User | null) => {
          if (userData) {
            setUser(userData);
          } else {
            // Fallback to Firebase user data if no Firestore document
            const fallbackUser: User = {
              id: firebaseUser.uid,
              email: firebaseUser.email ?? '',
              name: firebaseUser.displayName ?? firebaseUser.email ?? '',
              role: 'user',
              displayName: firebaseUser.displayName ?? '',
              ...(firebaseUser.photoURL != null &&
                firebaseUser.photoURL.length > 0 && {
                photoURL: firebaseUser.photoURL,
              }),
              emailVerified: firebaseUser.emailVerified,
              createdAt: new Date(
                firebaseUser.metadata.creationTime ?? Date.now()
              ),
              updatedAt: new Date(),
              lastLoginAt: new Date(
                firebaseUser.metadata.lastSignInTime ?? Date.now()
              ),
              preferences: {
                theme: 'system',
                language: 'en',
                emailNotifications: true,
                pushNotifications: true,
                notifications: {
                  email: true,
                  push: true,
                  inApp: true,
                  marketing: false,
                },
              },
            };
            setUser(fallbackUser);
          }
        }
      );
    } else {
      clearAuth();
    }
  }, [firebaseEnabled, firebaseUser, loading, setUser, setLoading, clearAuth]);

  const signIn = useCallback(
    async (credentials: AuthCredentials): Promise<AuthResponse> => {
      return AuthService.signInWithEmail(credentials);
    },
    []
  );

  const signUp = useCallback(
    async (credentials: RegisterCredentials): Promise<AuthResponse> => {
      return AuthService.signUpWithEmail(credentials);
    },
    []
  );

  const signInWithGoogle = useCallback(async (): Promise<AuthResponse> => {
    return AuthService.signInWithGoogle();
  }, []);

  const signOut = useCallback(async (): Promise<void> => {
    await AuthService.signOut();
    clearAuth();
  }, [clearAuth]);

  const updateProfile = useCallback(
    async (data: Partial<User>): Promise<void> => {
      await AuthService.updateUserProfile(data);
      updateUserData(data);
    },
    [updateUserData]
  );

  const updatePreferences = useCallback(
    async (preferences: Partial<UserPreferences>): Promise<void> => {
      await AuthService.updateUserPreferences(preferences);
      if (user && user.preferences) {
        const updatedPreferences: UserPreferences = {
          ...user.preferences,
          ...preferences,
          // Ensure required properties are never undefined
          theme: preferences.theme ?? user.preferences.theme,
          language: preferences.language ?? user.preferences.language,
          emailNotifications: preferences.emailNotifications ?? user.preferences.emailNotifications,
          pushNotifications: preferences.pushNotifications ?? user.preferences.pushNotifications,
        };
        updateUserData({
          preferences: updatedPreferences,
        });
      }
    },
    [user, updateUserData]
  );

  const sendPasswordReset = useCallback(
    async (email: string): Promise<void> => {
      return AuthService.sendPasswordResetEmail(email);
    },
    []
  );

  const sendEmailVerification = useCallback(async (): Promise<void> => {
    return AuthService.sendEmailVerification();
  }, []);

  // Phone authentication methods
  const createRecaptchaVerifier = useCallback(
    (
      containerId: string
    ): import('firebase/auth').ApplicationVerifier | null => {
      return AuthService.createRecaptchaVerifier(containerId);
    },
    []
  );

  const sendPhoneVerification = useCallback(
    async (
      phoneNumber: string,
      recaptchaVerifier: import('firebase/auth').ApplicationVerifier
    ): Promise<{
      confirmationResult: import('firebase/auth').ConfirmationResult | null;
      error: string | null;
    }> => {
      return AuthService.sendPhoneVerification(phoneNumber, recaptchaVerifier);
    },
    []
  );

  const verifyPhoneCode = useCallback(
    async (
      confirmationResult: import('firebase/auth').ConfirmationResult,
      verificationCode: string
    ): Promise<AuthResponse> => {
      return AuthService.verifyPhoneCode(confirmationResult, verificationCode);
    },
    []
  );

  return {
    user,
    isLoading: firebaseEnabled ? loading : false,
    isAuthenticated: Boolean(user),
    error: firebaseEnabled ? (error?.message ?? null) : null,
    signIn,
    signUp,
    signInWithGoogle,
    signOut,
    updateProfile,
    updatePreferences,
    sendPasswordReset,
    sendEmailVerification,
    createRecaptchaVerifier,
    sendPhoneVerification,
    verifyPhoneCode,
  };
}
