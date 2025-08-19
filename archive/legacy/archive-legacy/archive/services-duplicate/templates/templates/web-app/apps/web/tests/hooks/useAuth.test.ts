/**
 * Comprehensive useAuth Hook Tests
 * Tests for custom authentication hook with proper state management
 */

import { act, renderHook, waitFor } from '@testing-library/react';

import { useAuth } from '@/hooks/useAuth';
import type { User } from '@/types/auth';

import { TestDataFactory } from '../comprehensive-utils';

// Mock react-firebase-hooks/auth
const mockUseAuthState = jest.fn();
jest.mock('react-firebase-hooks/auth', () => ({
  useAuthState: jest.fn(),
}));

// Mock Firebase auth
jest.mock('firebase/auth', () => ({
  signOut: jest.fn(),
  getAuth: jest.fn(() => ({ currentUser: null })),
}));

jest.mock('@/lib/firebase', () => ({
  auth: { currentUser: null },
}));

// Mock isFirebaseEnabled to return true for tests
jest.mock('@/lib/env', () => ({
  isFirebaseEnabled: jest.fn(() => true),
}));

// Mock AuthService
jest.mock('@/services/auth', () => ({
  AuthService: {
    signInWithEmail: jest.fn(),
    signUpWithEmail: jest.fn(),
    signInWithGoogle: jest.fn(),
    signOut: jest.fn(),
    updateUserProfile: jest.fn(),
    updateUserPreferences: jest.fn(),
    sendPasswordResetEmail: jest.fn(),
    sendEmailVerification: jest.fn(),
    getUserDocument: jest.fn(),
  },
}));

// Get reference to mocked AuthService
const mockAuthService = require('@/services/auth').AuthService;

// Mock the auth store
const mockAuthStore = {
  user: null as User | null,
  isAuthenticated: false,
  setUser: jest.fn(),
  setLoading: jest.fn(),
  clearAuth: jest.fn(),
  updateUserData: jest.fn(),
};

jest.mock('@/stores/auth', () => ({
  useAuthStore: jest.fn(() => mockAuthStore),
}));

describe('useAuth Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset mock store state
    mockAuthStore.user = null;
    mockAuthStore.isAuthenticated = false;

    // Default mock implementation for useAuthState
    (mockUseAuthState as jest.Mock).mockReturnValue([null, false, null]);
    (require('react-firebase-hooks/auth').useAuthState as jest.Mock) =
      mockUseAuthState;

    // Default mock implementation for getUserDocument
    mockAuthService.getUserDocument.mockResolvedValue(null);
  });

  describe('Initial State', () => {
    it('should return null user and false authentication initially', () => {
      const { result } = renderHook(() => useAuth());

      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.isLoading).toBe(false); // Not loading initially with mocked state
    });

    it('should handle loading state from firebase hook', () => {
      // Mock loading state
      (mockUseAuthState as jest.Mock).mockReturnValue([null, true, null]);

      const { result } = renderHook(() => useAuth());

      expect(result.current.isLoading).toBe(true);
    });
  });

  describe('Authentication State Changes', () => {
    it('should update state when user signs in', async () => {
      const mockFirebaseUser = {
        uid: 'test-uid',
        email: 'test@example.com',
        displayName: 'Test User',
        photoURL: null,
        emailVerified: true,
        metadata: {
          creationTime: new Date().toISOString(),
          lastSignInTime: new Date().toISOString(),
        },
      };

      const mockUser = TestDataFactory.createUser({
        id: 'test-uid',
        email: 'test@example.com',
        displayName: 'Test User',
      });

      // Mock successful user document fetch
      mockAuthService.getUserDocument.mockResolvedValue(mockUser);

      // Mock firebase user state
      (mockUseAuthState as jest.Mock).mockReturnValue([
        mockFirebaseUser,
        false,
        null,
      ]);

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(mockAuthService.getUserDocument).toHaveBeenCalledWith(
          'test-uid'
        );
      });

      await waitFor(() => {
        expect(mockAuthStore.setUser).toHaveBeenCalledWith(mockUser);
      });

      // The isAuthenticated should come from the store which reflects the actual user state
      expect(result.current.isAuthenticated).toBe(
        mockAuthStore.isAuthenticated
      );
    });

    it('should handle fallback user creation when no document exists', async () => {
      const mockFirebaseUser = {
        uid: 'test-uid',
        email: 'test@example.com',
        displayName: 'Test User',
        photoURL: null,
        emailVerified: true,
        metadata: {
          creationTime: new Date().toISOString(),
          lastSignInTime: new Date().toISOString(),
        },
      };

      // Mock no user document found
      mockAuthService.getUserDocument.mockResolvedValue(null);

      // Mock firebase user state
      (mockUseAuthState as jest.Mock).mockReturnValue([
        mockFirebaseUser,
        false,
        null,
      ]);

      renderHook(() => useAuth());

      await waitFor(() => {
        expect(mockAuthStore.setUser).toHaveBeenCalled();
      });

      // Check that a fallback user was created
      const setUserCall = mockAuthStore.setUser.mock.calls[0][0];
      expect(setUserCall.id).toBe('test-uid');
      expect(setUserCall.email).toBe('test@example.com');
      expect(setUserCall.displayName).toBe('Test User');
    });

    it('should clear auth when user signs out', async () => {
      // Start with a user, then sign out
      (mockUseAuthState as jest.Mock).mockReturnValue([null, false, null]);

      renderHook(() => useAuth());

      await waitFor(() => {
        expect(mockAuthStore.clearAuth).toHaveBeenCalled();
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle Firebase errors gracefully', () => {
      const firebaseError = new Error('Firebase connection failed');
      (mockUseAuthState as jest.Mock).mockReturnValue([
        null,
        false,
        firebaseError,
      ]);

      const { result } = renderHook(() => useAuth());

      expect(result.current.error).toBe('Firebase connection failed');
      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
    });
  });

  describe('Sign Out Functionality', () => {
    it('should sign out user successfully', async () => {
      mockAuthService.signOut.mockResolvedValue(undefined);

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.signOut();
      });

      expect(mockAuthService.signOut).toHaveBeenCalled();
      expect(mockAuthStore.clearAuth).toHaveBeenCalled();
    });

    it('should handle sign out errors', async () => {
      const signOutError = new Error('Failed to sign out');
      mockAuthService.signOut.mockRejectedValue(signOutError);

      const { result } = renderHook(() => useAuth());

      await expect(result.current.signOut()).rejects.toThrow(
        'Failed to sign out'
      );
    });
  });

  describe('Authentication Methods', () => {
    it('should provide sign in functionality', async () => {
      const credentials = { email: 'test@example.com', password: 'password' };
      const mockResponse = { user: TestDataFactory.createUser(), error: null };

      mockAuthService.signInWithEmail.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useAuth());

      const response = await result.current.signIn(credentials);

      expect(mockAuthService.signInWithEmail).toHaveBeenCalledWith(credentials);
      expect(response).toEqual(mockResponse);
    });

    it('should provide sign up functionality', async () => {
      const credentials = {
        email: 'test@example.com',
        password: 'password',
        confirmPassword: 'password',
        displayName: 'Test User',
      };
      const mockResponse = { user: TestDataFactory.createUser(), error: null };

      mockAuthService.signUpWithEmail.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useAuth());

      const response = await result.current.signUp(credentials);

      expect(mockAuthService.signUpWithEmail).toHaveBeenCalledWith(credentials);
      expect(response).toEqual(mockResponse);
    });

    it('should provide Google sign in functionality', async () => {
      const mockResponse = { user: TestDataFactory.createUser(), error: null };

      mockAuthService.signInWithGoogle.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useAuth());

      const response = await result.current.signInWithGoogle();

      expect(mockAuthService.signInWithGoogle).toHaveBeenCalled();
      expect(response).toEqual(mockResponse);
    });
  });

  describe('Profile Management', () => {
    it('should update user profile', async () => {
      const profileData = { displayName: 'Updated Name' };
      mockAuthService.updateUserProfile.mockResolvedValue(undefined);

      const { result } = renderHook(() => useAuth());

      await result.current.updateProfile(profileData);

      expect(mockAuthService.updateUserProfile).toHaveBeenCalledWith(
        profileData
      );
      expect(mockAuthStore.updateUserData).toHaveBeenCalledWith(profileData);
    });

    it('should update user preferences', async () => {
      const preferences = { theme: 'dark' as const };
      mockAuthStore.user = TestDataFactory.createUser();
      mockAuthService.updateUserPreferences.mockResolvedValue(undefined);

      const { result } = renderHook(() => useAuth());

      await result.current.updatePreferences(preferences);

      expect(mockAuthService.updateUserPreferences).toHaveBeenCalledWith(
        preferences
      );
      expect(mockAuthStore.updateUserData).toHaveBeenCalledWith({
        preferences: { ...mockAuthStore.user.preferences, ...preferences },
      });
    });
  });

  describe('Password Reset and Email Verification', () => {
    it('should send password reset email', async () => {
      const email = 'test@example.com';
      mockAuthService.sendPasswordResetEmail.mockResolvedValue(undefined);

      const { result } = renderHook(() => useAuth());

      await result.current.sendPasswordReset(email);

      expect(mockAuthService.sendPasswordResetEmail).toHaveBeenCalledWith(
        email
      );
    });

    it('should send email verification', async () => {
      mockAuthService.sendEmailVerification.mockResolvedValue(undefined);

      const { result } = renderHook(() => useAuth());

      await result.current.sendEmailVerification();

      expect(mockAuthService.sendEmailVerification).toHaveBeenCalled();
    });
  });

  describe('Store Integration', () => {
    it('should reflect store state in hook return values', () => {
      const mockUser = TestDataFactory.createUser();
      mockAuthStore.user = mockUser;
      mockAuthStore.isAuthenticated = true;

      const { result } = renderHook(() => useAuth());

      expect(result.current.user).toEqual(mockUser);
      expect(result.current.isAuthenticated).toBe(true);
    });
  });

  describe('Loading State Management', () => {
    it('should call setLoading when firebase is loading', () => {
      (mockUseAuthState as jest.Mock).mockReturnValue([null, true, null]);

      renderHook(() => useAuth());

      expect(mockAuthStore.setLoading).toHaveBeenCalledWith(true);
    });
  });
});
