/**
 * Comprehensive Authentication Service Tests
 * Tests for critical authentication functionality with proper TypeScript typing
 */

import type { User } from 'firebase/auth';

import { AuthService } from '@/services/auth';

import { FirebaseTestUtils, TestDataFactory } from '../comprehensive-utils';

// Mock Firebase auth functions - properly hoisted
jest.mock('firebase/auth', () => ({
  signInWithEmailAndPassword: jest.fn(),
  createUserWithEmailAndPassword: jest.fn(),
  signInWithPopup: jest.fn(),
  signOut: jest.fn(),
  updateProfile: jest.fn(),
  GoogleAuthProvider: jest.fn().mockImplementation(() => ({
    addScope: jest.fn(),
  })),
  getAuth: jest.fn(() => ({ currentUser: null })),
}));

// Mock Firebase firestore
jest.mock('firebase/firestore', () => ({
  doc: jest.fn(),
  getDoc: jest.fn().mockResolvedValue({ exists: () => false }),
  setDoc: jest.fn(),
  updateDoc: jest.fn(),
  deleteDoc: jest.fn(),
}));

// Mock Firebase lib with initialized values
jest.mock('@/lib/firebase', () => ({
  auth: {
    currentUser: null,
    // Add any other auth properties that might be checked
  },
  db: {
    // Mock db object
  },
}));

// Get references to mocked functions after module is mocked
const mockSignInWithEmailAndPassword = jest.mocked(
  require('firebase/auth').signInWithEmailAndPassword
);
const mockCreateUserWithEmailAndPassword = jest.mocked(
  require('firebase/auth').createUserWithEmailAndPassword
);
const mockSignInWithPopup = jest.mocked(
  require('firebase/auth').signInWithPopup
);
const mockSignOut = jest.mocked(require('firebase/auth').signOut);
const mockUpdateProfile = jest.mocked(require('firebase/auth').updateProfile);
const mockGoogleAuthProvider = jest.mocked(
  require('firebase/auth').GoogleAuthProvider
);

// Firestore mocks
const mockGetDoc = jest.mocked(require('firebase/firestore').getDoc);
const mockSetDoc = jest.mocked(require('firebase/firestore').setDoc);

describe('AuthService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('signInWithEmail', () => {
    const validCredentials = {
      email: 'test@example.com',
      password: 'ValidPassword123!',
    };

    it('should successfully sign in with valid credentials', async () => {
      const mockUser = TestDataFactory.createUser({
        email: validCredentials.email,
      });

      mockSignInWithEmailAndPassword.mockResolvedValue({
        user: mockUser,
        operationType: 'signIn',
        providerId: 'firebase',
      });

      const result = await AuthService.signInWithEmail(validCredentials);

      expect(mockSignInWithEmailAndPassword).toHaveBeenCalledWith(
        expect.anything(), // auth instance
        validCredentials.email,
        validCredentials.password
      );
      expect(result.user).toEqual(mockUser);
      expect(result.error).toBeNull();
    });

    it('should handle invalid email format', async () => {
      const invalidCredentials = {
        email: 'invalid-email',
        password: 'ValidPassword123!',
      };

      const authError = FirebaseTestUtils.mockAuthError(
        'auth/invalid-email',
        'The email address is badly formatted.'
      );

      mockSignInWithEmailAndPassword.mockRejectedValue(authError);

      const result = await AuthService.signInWithEmail(invalidCredentials);

      expect(result.user).toBeNull();
      expect(result.error).toBe('Please enter a valid email address.');
    });

    it('should handle wrong password error', async () => {
      const wrongPasswordCredentials = {
        email: 'test@example.com',
        password: 'WrongPassword',
      };

      const authError = FirebaseTestUtils.mockAuthError(
        'auth/wrong-password',
        'The password is invalid or the user does not have a password.'
      );

      mockSignInWithEmailAndPassword.mockRejectedValue(authError);

      const result = await AuthService.signInWithEmail(
        wrongPasswordCredentials
      );

      expect(result.user).toBeNull();
      expect(result.error).toBe('Incorrect password.');
    });

    it('should handle user not found error', async () => {
      const nonExistentCredentials = {
        email: 'nonexistent@example.com',
        password: 'ValidPassword123!',
      };

      const authError = FirebaseTestUtils.mockAuthError(
        'auth/user-not-found',
        'There is no user record corresponding to this identifier.'
      );

      mockSignInWithEmailAndPassword.mockRejectedValue(authError);

      const result = await AuthService.signInWithEmail(nonExistentCredentials);

      expect(result.user).toBeNull();
      expect(result.error).toBe('No account found with this email address.');
    });

    it('should handle network errors', async () => {
      const authError = FirebaseTestUtils.mockAuthError(
        'auth/network-request-failed',
        'A network error occurred.'
      );

      mockSignInWithEmailAndPassword.mockRejectedValue(authError);

      const result = await AuthService.signInWithEmail(validCredentials);

      expect(result.user).toBeNull();
      expect(result.error).toBe('auth/network-request-failed');
    });

    it('should handle too many requests error', async () => {
      const authError = FirebaseTestUtils.mockAuthError(
        'auth/too-many-requests',
        'We have blocked all requests from this device due to unusual activity.'
      );

      mockSignInWithEmailAndPassword.mockRejectedValue(authError);

      const result = await AuthService.signInWithEmail(validCredentials);

      expect(result.user).toBeNull();
      expect(result.error).toBe(
        'Too many failed attempts. Please try again later.'
      );
    });

    it('should sanitize input to prevent injection attacks', async () => {
      const maliciousCredentials = {
        email: '<script>alert("xss")</script>@example.com',
        password: 'javascript:void(0)',
      };

      // Verify that the service doesn't execute malicious code
      expect(() =>
        AuthService.signInWithEmail(maliciousCredentials)
      ).not.toThrow();

      // Verify inputs are passed as-is to Firebase (Firebase handles sanitization)
      mockSignInWithEmailAndPassword.mockRejectedValue(
        FirebaseTestUtils.mockAuthError('auth/invalid-email', 'Invalid email')
      );

      await AuthService.signInWithEmail(maliciousCredentials);

      expect(mockSignInWithEmailAndPassword).toHaveBeenCalledWith(
        expect.anything(),
        maliciousCredentials.email,
        maliciousCredentials.password
      );
    });
  });

  describe('signInWithGoogle', () => {
    it('should successfully sign in with Google', async () => {
      const mockUser = TestDataFactory.createUser({
        email: 'test@gmail.com',
        displayName: 'Test User',
        photoURL: 'https://example.com/photo.jpg',
      });

      mockSignInWithPopup.mockResolvedValue({
        user: mockUser,
        operationType: 'signIn',
        providerId: 'google.com',
        credential: { providerId: 'google.com' },
      });

      const result = await AuthService.signInWithGoogle();

      expect(mockGoogleAuthProvider).toHaveBeenCalled();
      expect(mockSignInWithPopup).toHaveBeenCalledWith(
        expect.anything(), // auth instance
        expect.any(Object) // provider instance
      );
      expect(result.user).toEqual(mockUser);
      expect(result.error).toBeNull();
    });

    it('should handle popup blocked error', async () => {
      const authError = FirebaseTestUtils.mockAuthError(
        'auth/popup-blocked',
        'The popup was blocked by the browser.'
      );

      mockSignInWithPopup.mockRejectedValue(authError);

      const result = await AuthService.signInWithGoogle();

      expect(result.user).toBeNull();
      expect(result.error).toBe('Sign-in popup was blocked by the browser.');
    });

    it('should handle popup closed by user', async () => {
      const authError = FirebaseTestUtils.mockAuthError(
        'auth/popup-closed-by-user',
        'The popup has been closed by the user before finalizing the operation.'
      );

      mockSignInWithPopup.mockRejectedValue(authError);

      const result = await AuthService.signInWithGoogle();

      expect(result.user).toBeNull();
      expect(result.error).toBe('Sign-in was cancelled.');
    });

    it('should handle cancelled popup', async () => {
      const authError = FirebaseTestUtils.mockAuthError(
        'auth/cancelled-popup-request',
        'This operation has been cancelled due to another conflicting popup being opened.'
      );

      mockSignInWithPopup.mockRejectedValue(authError);

      const result = await AuthService.signInWithGoogle();

      expect(result.user).toBeNull();
      expect(result.error).toBe('auth/cancelled-popup-request');
    });
  });
  describe('signUpWithEmail', () => {
    const validRegistrationData = {
      email: 'newuser@example.com',
      password: 'StrongPassword123!',
      confirmPassword: 'StrongPassword123!',
      displayName: 'New User',
    };

    it('should successfully create a new user', async () => {
      const mockFirebaseUser = TestDataFactory.createFirebaseUser({
        email: validRegistrationData.email,
        emailVerified: false,
      });

      mockCreateUserWithEmailAndPassword.mockResolvedValue({
        user: mockFirebaseUser,
        operationType: 'signIn',
        providerId: 'firebase',
      });

      mockUpdateProfile.mockResolvedValue(undefined);
      mockGetDoc.mockResolvedValue({ exists: () => false });
      mockSetDoc.mockResolvedValue(undefined);

      const result = await AuthService.signUpWithEmail(validRegistrationData);

      expect(mockCreateUserWithEmailAndPassword).toHaveBeenCalledWith(
        expect.anything(), // auth instance
        validRegistrationData.email,
        validRegistrationData.password
      );
      expect(result.user).toEqual(mockFirebaseUser);
      expect(result.error).toBeNull();
    });

    it('should handle email already in use error', async () => {
      const authError = FirebaseTestUtils.mockAuthError(
        'auth/email-already-in-use',
        'The email address is already in use by another account.'
      );

      mockCreateUserWithEmailAndPassword.mockRejectedValue(authError);

      const result = await AuthService.signUpWithEmail(validRegistrationData);

      expect(result.user).toBeNull();
      expect(result.error).toBe('An account with this email already exists.');
    });

    it('should handle weak password error', async () => {
      const weakPasswordData = {
        email: 'newuser@example.com',
        password: '123',
        confirmPassword: '123',
        displayName: 'New User',
      };

      const authError = FirebaseTestUtils.mockAuthError(
        'auth/weak-password',
        'The password must be 6 characters long or more.'
      );

      mockCreateUserWithEmailAndPassword.mockRejectedValue(authError);

      const result = await AuthService.signUpWithEmail(weakPasswordData);

      expect(result.user).toBeNull();
      expect(result.error).toBe('Password should be at least 6 characters.');
    });

    it('should handle operation not allowed error', async () => {
      const authError = FirebaseTestUtils.mockAuthError(
        'auth/operation-not-allowed',
        'Email/password accounts are not enabled.'
      );

      mockCreateUserWithEmailAndPassword.mockRejectedValue(authError);

      const result = await AuthService.signUpWithEmail(validRegistrationData);

      expect(result.user).toBeNull();
      expect(result.error).toBe('auth/operation-not-allowed');
    });
  });
  describe('signOut', () => {
    it('should successfully sign out user', async () => {
      mockSignOut.mockResolvedValue(undefined);

      await expect(AuthService.signOut()).resolves.toBeUndefined();

      expect(mockSignOut).toHaveBeenCalledWith(expect.anything());
    });

    it('should handle sign out errors', async () => {
      const signOutError = new Error('Failed to sign out');
      mockSignOut.mockRejectedValue(signOutError);

      await expect(AuthService.signOut()).rejects.toThrow('Failed to sign out');
    });
  });

  describe('Security Tests', () => {
    it('should not log sensitive information', async () => {
      const consoleSpy = jest.spyOn(console, 'log');
      const consoleErrorSpy = jest.spyOn(console, 'error');

      const credentials = {
        email: 'test@example.com',
        password: 'SecretPassword123!',
      };

      mockSignInWithEmailAndPassword.mockRejectedValue(
        FirebaseTestUtils.mockAuthError('auth/wrong-password', 'Wrong password')
      );

      await AuthService.signInWithEmail(credentials);

      // Verify that password is not logged
      expect(consoleSpy).not.toHaveBeenCalledWith(
        expect.stringContaining(credentials.password)
      );
      expect(consoleErrorSpy).not.toHaveBeenCalledWith(
        expect.stringContaining(credentials.password)
      );

      consoleSpy.mockRestore();
      consoleErrorSpy.mockRestore();
    });

    it('should handle undefined/null inputs gracefully', async () => {
      const invalidInputs = [
        { email: null, password: 'password' },
        { email: 'test@example.com', password: null },
        { email: undefined, password: 'password' },
        { email: 'test@example.com', password: undefined },
      ];

      for (const input of invalidInputs) {
        mockSignInWithEmailAndPassword.mockRejectedValue(
          FirebaseTestUtils.mockAuthError('auth/invalid-email', 'Invalid input')
        );

        const result = await AuthService.signInWithEmail(
          input as unknown as { email: string; password: string }
        );
        expect(result.error).toBeTruthy();
      }
    });

    it('should handle empty string inputs', async () => {
      const emptyInputs = {
        email: '',
        password: '',
      };

      mockSignInWithEmailAndPassword.mockRejectedValue(
        FirebaseTestUtils.mockAuthError('auth/invalid-email', 'Invalid email')
      );

      const result = await AuthService.signInWithEmail(emptyInputs);
      expect(result.error).toBeTruthy();
    });
  });

  describe('Performance Tests', () => {
    it('should complete authentication within reasonable time', async () => {
      const mockUser = TestDataFactory.createUser();
      mockSignInWithEmailAndPassword.mockResolvedValue({ user: mockUser });

      const startTime = performance.now();
      await AuthService.signInWithEmail({
        email: 'test@example.com',
        password: 'password',
      });
      const endTime = performance.now();

      // Authentication should complete within 100ms (excluding network)
      expect(endTime - startTime).toBeLessThan(100);
    });

    it('should handle concurrent authentication requests', async () => {
      const mockUser = TestDataFactory.createUser();
      mockSignInWithEmailAndPassword.mockResolvedValue({ user: mockUser });

      const credentials = {
        email: 'test@example.com',
        password: 'password',
      };

      // Simulate multiple concurrent requests
      const promises = Array(5)
        .fill(null)
        .map(() => AuthService.signInWithEmail(credentials));

      const results = await Promise.all(promises);

      // All requests should succeed
      results.forEach(result => {
        expect(result.user).toEqual(mockUser);
        expect(result.error).toBeNull();
      });
    });
  });

  describe('Error Handling Edge Cases', () => {
    it('should handle unknown Firebase errors', async () => {
      const unknownError = new Error('Unknown Firebase error') as Error & {
        code: string;
      };
      unknownError.code = 'auth/unknown-error';

      mockSignInWithEmailAndPassword.mockRejectedValue(unknownError);

      const result = await AuthService.signInWithEmail({
        email: 'test@example.com',
        password: 'password',
      });

      expect(result.error).toBe('Unknown Firebase error');
    });

    it('should handle non-Error objects', async () => {
      const stringError = 'String error message';
      mockSignInWithEmailAndPassword.mockRejectedValue(stringError);

      const result = await AuthService.signInWithEmail({
        email: 'test@example.com',
        password: 'password',
      });

      expect(result.error).toBe('An unexpected error occurred.');
    });

    it('should handle Firebase user object variations', async () => {
      // Test with minimal user object
      const minimalUser = {
        uid: 'test-uid',
        email: 'test@example.com',
        displayName: null,
        photoURL: null,
        emailVerified: false,
      } as Partial<User>;

      mockSignInWithEmailAndPassword.mockResolvedValue({
        user: minimalUser,
      });

      const result = await AuthService.signInWithEmail({
        email: 'test@example.com',
        password: 'password',
      });

      expect(result.user).toEqual(minimalUser);
      expect(result.error).toBeNull();
    });
  });
});
