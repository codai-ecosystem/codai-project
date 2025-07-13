import type { User as FirebaseUser } from 'firebase/auth';
import {
  ApplicationVerifier,
  ConfirmationResult,
  createUserWithEmailAndPassword,
  deleteUser,
  GoogleAuthProvider,
  RecaptchaVerifier,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  // Add phone authentication imports
  signInWithPhoneNumber,
  signInWithPopup,
  signOut,
  updatePassword,
  updateProfile,
} from 'firebase/auth';
import { deleteDoc, doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';

import { auth, db } from '@/lib/firebase';
import type {
  AuthCredentials,
  AuthResponse,
  RegisterCredentials,
  User,
  UserPreferences,
} from '@/types/auth';

export class AuthService {
  /**
   * Check if Firebase is initialized
   */
  private static isFirebaseInitialized(): boolean {
    return auth !== null && db !== null;
  }

  /**
   * Sign in with email and password
   */
  static async signInWithEmail(
    credentials: AuthCredentials
  ): Promise<AuthResponse> {
    if (!this.isFirebaseInitialized() || !auth) {
      return {
        user: null,
        error: 'Firebase not initialized',
      };
    }

    try {
      const result = await signInWithEmailAndPassword(
        auth,
        credentials.email,
        credentials.password
      );
      return { user: result.user, error: null };
    } catch (error: unknown) {
      return {
        user: null,
        error: this.getErrorMessage(error),
      };
    }
  }

  /**
   * Create account with email and password
   */
  static async signUpWithEmail(
    credentials: RegisterCredentials
  ): Promise<AuthResponse> {
    if (!this.isFirebaseInitialized() || !auth) {
      return {
        user: null,
        error: 'Firebase not initialized',
      };
    }

    try {
      const result = await createUserWithEmailAndPassword(
        auth,
        credentials.email,
        credentials.password
      );

      // Update display name
      await updateProfile(result.user, {
        displayName: credentials.displayName,
      });

      // Create user document in Firestore
      await this.createUserDocument(result.user, {
        displayName: credentials.displayName,
      });

      return { user: result.user, error: null };
    } catch (error: unknown) {
      return {
        user: null,
        error: this.getErrorMessage(error),
      };
    }
  }

  /**
   * Sign in with Google
   */
  static async signInWithGoogle(): Promise<AuthResponse> {
    if (!this.isFirebaseInitialized() || !auth) {
      return {
        user: null,
        error: 'Firebase not initialized',
      };
    }

    try {
      const provider = new GoogleAuthProvider();
      provider.addScope('email');
      provider.addScope('profile');

      const result = await signInWithPopup(auth, provider);

      // Create or update user document
      await this.createUserDocument(result.user);

      return { user: result.user, error: null };
    } catch (error: unknown) {
      return {
        user: null,
        error: this.getErrorMessage(error),
      };
    }
  }

  /**
   * Sign out current user
   */
  static async signOut(): Promise<void> {
    if (!this.isFirebaseInitialized() || !auth) {
      throw new Error('Firebase not initialized');
    }

    try {
      await signOut(auth);
    } catch (error: unknown) {
      console.error('Sign out error:', error);
      throw new Error('Failed to sign out');
    }
  }

  /**
   * Send password reset email
   */
  static async sendPasswordResetEmail(email: string): Promise<void> {
    if (!this.isFirebaseInitialized() || !auth) {
      throw new Error('Firebase not initialized');
    }

    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error: unknown) {
      throw new Error(this.getErrorMessage(error));
    }
  }
  /**
   * Send email verification
   */
  static async sendEmailVerification(): Promise<void> {
    if (!this.isFirebaseInitialized() || !auth) {
      throw new Error('Firebase not initialized');
    }

    const authInstance = auth;
    if (!authInstance.currentUser) {
      throw new Error('No user is currently signed in');
    }

    try {
      await sendEmailVerification(authInstance.currentUser);
    } catch (error: unknown) {
      throw new Error(this.getErrorMessage(error));
    }
  }

  /**
   * Initialize phone authentication recaptcha verifier
   */
  static createRecaptchaVerifier(
    containerId: string
  ): ApplicationVerifier | null {
    if (!this.isFirebaseInitialized() || !auth) {
      console.warn('Firebase not initialized for recaptcha verifier');
      return null;
    }

    try {
      return new RecaptchaVerifier(auth, containerId, {
        size: 'normal',
        callback: () => {
          // Recaptcha verified successfully
        },
        'expired-callback': () => {
          // Recaptcha expired - user needs to refresh
        },
      });
    } catch (error: unknown) {
      console.error('Failed to create recaptcha verifier:', error);
      return null;
    }
  }

  /**
   * Send phone verification code
   */
  static async sendPhoneVerification(
    phoneNumber: string,
    recaptchaVerifier: ApplicationVerifier
  ): Promise<{
    confirmationResult: ConfirmationResult | null;
    error: string | null;
  }> {
    if (!this.isFirebaseInitialized() || !auth) {
      return {
        confirmationResult: null,
        error: 'Firebase not initialized',
      };
    }

    try {
      const confirmationResult = await signInWithPhoneNumber(
        auth,
        phoneNumber,
        recaptchaVerifier
      );
      return {
        confirmationResult,
        error: null,
      };
    } catch (error: unknown) {
      return {
        confirmationResult: null,
        error: this.getErrorMessage(error),
      };
    }
  }

  /**
   * Verify phone number with verification code
   * Note: This method should be called with a real ConfirmationResult from sendPhoneVerification
   */
  static async verifyPhoneCode(
    confirmationResult: ConfirmationResult,
    verificationCode: string
  ): Promise<AuthResponse> {
    if (!this.isFirebaseInitialized() || !auth) {
      return {
        user: null,
        error: 'Firebase not initialized',
      };
    }

    try {
      const result = await confirmationResult.confirm(verificationCode);

      // Create or update user document
      if (result.user) {
        await this.createUserDocument(result.user);
      }

      return { user: result.user, error: null };
    } catch (error: unknown) {
      return {
        user: null,
        error: this.getErrorMessage(error),
      };
    }
  }

  /**
   * Update user profile
   */
  static async updateUserProfile(data: Partial<User>): Promise<void> {
    if (!this.isFirebaseInitialized() || !auth || !db) {
      throw new Error('Firebase not initialized');
    }

    const authInstance = auth;
    const dbInstance = db;
    if (!authInstance.currentUser) {
      throw new Error('No user is currently signed in');
    }

    try {
      // Update Firebase Auth profile
      if (data.displayName !== undefined || data.photoURL !== undefined) {
        await updateProfile(authInstance.currentUser, {
          ...(data.displayName !== undefined && {
            displayName: data.displayName,
          }),
          ...(data.photoURL !== undefined && { photoURL: data.photoURL }),
        });
      }

      // Update Firestore document
      const userRef = doc(dbInstance, 'users', authInstance.currentUser.uid);
      await updateDoc(userRef, {
        ...data,
        updatedAt: new Date(),
      });
    } catch (error: unknown) {
      throw new Error(this.getErrorMessage(error));
    }
  }
  /**
   * Update user preferences
   */
  static async updateUserPreferences(
    preferences: Partial<UserPreferences>
  ): Promise<void> {
    if (!this.isFirebaseInitialized() || !auth || !db) {
      throw new Error('Firebase not initialized');
    }

    const authInstance = auth;
    const dbInstance = db;
    if (!authInstance.currentUser) {
      throw new Error('No user is currently signed in');
    }

    try {
      const userRef = doc(dbInstance, 'users', authInstance.currentUser.uid);
      await updateDoc(userRef, {
        preferences: {
          ...preferences,
        },
        updatedAt: new Date(),
      });
    } catch (error: unknown) {
      throw new Error(this.getErrorMessage(error));
    }
  }

  /**
   * Update user password
   */
  static async updatePassword(newPassword: string): Promise<void> {
    if (!this.isFirebaseInitialized() || !auth) {
      throw new Error('Firebase not initialized');
    }

    const authInstance = auth;
    if (!authInstance.currentUser) {
      throw new Error('No user is currently signed in');
    }

    try {
      await updatePassword(authInstance.currentUser, newPassword);
    } catch (error: unknown) {
      throw new Error(this.getErrorMessage(error));
    }
  }

  /**
   * Delete user account
   */
  static async deleteAccount(): Promise<void> {
    if (!this.isFirebaseInitialized() || !auth || !db) {
      throw new Error('Firebase not initialized');
    }

    const authInstance = auth;
    const dbInstance = db;
    if (!authInstance.currentUser) {
      throw new Error('No user is currently signed in');
    }

    try {
      const userId = authInstance.currentUser.uid;

      // Delete user document from Firestore
      await deleteDoc(doc(dbInstance, 'users', userId));

      // Delete Firebase Auth account
      await deleteUser(authInstance.currentUser);
    } catch (error: unknown) {
      throw new Error(this.getErrorMessage(error));
    }
  }
  /**
   * Get user document from Firestore
   */
  static async getUserDocument(uid: string): Promise<User | null> {
    if (!this.isFirebaseInitialized() || !db) {
      console.warn('Firebase not initialized');
      return null;
    }

    const dbInstance = db;
    try {
      const userRef = doc(dbInstance, 'users', uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const data = userSnap.data();
        return {
          id: uid,
          email: data['email'] as string,
          displayName: data['displayName'] as string | null,
          photoURL: data['photoURL'] as string | undefined,
          emailVerified: data['emailVerified'] as boolean,
          createdAt:
            (
              data['createdAt'] as { toDate: () => Date } | undefined
            )?.toDate() ?? new Date(),
          lastLoginAt:
            (
              data['lastLoginAt'] as { toDate: () => Date } | undefined
            )?.toDate() ?? new Date(),
          preferences: (data['preferences'] as UserPreferences | undefined) ?? {
            theme: 'system',
            language: 'en',
            notifications: {
              email: true,
              push: true,
              marketing: false,
            },
          },
        };
      }

      return null;
    } catch (error: unknown) {
      console.error('Error getting user document:', error);
      return null;
    }
  }

  /**
   * Create user document in Firestore
   */
  private static async createUserDocument(
    firebaseUser: FirebaseUser,
    additionalData?: Record<string, unknown>
  ): Promise<void> {
    if (!this.isFirebaseInitialized() || !db) {
      console.warn('Firebase not initialized, skipping user document creation');
      return;
    }

    const dbInstance = db;
    const userRef = doc(dbInstance, 'users', firebaseUser.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      const defaultPreferences: UserPreferences = {
        theme: 'system',
        language: 'en',
        notifications: {
          email: true,
          push: true,
          marketing: false,
        },
      };

      const userData = {
        email: firebaseUser.email,
        displayName:
          firebaseUser.displayName ??
          (additionalData &&
          typeof additionalData === 'object' &&
          'displayName' in additionalData
            ? String(additionalData['displayName'])
            : ''),
        photoURL: firebaseUser.photoURL ?? '',
        emailVerified: firebaseUser.emailVerified,
        preferences: defaultPreferences,
        createdAt: new Date(),
        lastLoginAt: new Date(),
        ...additionalData,
      };

      await setDoc(userRef, userData);
    } else {
      // Update last login time
      await updateDoc(userRef, {
        lastLoginAt: new Date(),
      });
    }
  }

  /**
   * Get user-friendly error message
   */
  private static getErrorMessage(error: unknown): string {
    if (error instanceof Error) {
      // Firebase auth errors have a 'code' property, check both code and message
      const firebaseError = error as { code?: string };
      const errorCode = firebaseError.code || error.message;

      switch (errorCode) {
        case 'auth/user-not-found':
          return 'No account found with this email address.';
        case 'auth/wrong-password':
          return 'Incorrect password.';
        case 'auth/email-already-in-use':
          return 'An account with this email already exists.';
        case 'auth/weak-password':
          return 'Password should be at least 6 characters.';
        case 'auth/invalid-email':
          return 'Please enter a valid email address.';
        case 'auth/user-disabled':
          return 'This account has been disabled.';
        case 'auth/too-many-requests':
          return 'Too many failed attempts. Please try again later.';
        case 'auth/popup-closed-by-user':
          return 'Sign-in was cancelled.';
        case 'auth/popup-blocked':
          return 'Sign-in popup was blocked by the browser.';
        case 'auth/cancelled-popup-request':
          return 'auth/cancelled-popup-request';
        case 'auth/network-request-failed':
          return 'auth/network-request-failed';
        case 'auth/operation-not-allowed':
          return 'auth/operation-not-allowed';
        default:
          return error.message;
      }
    }
    return 'An unexpected error occurred.';
  }
}
