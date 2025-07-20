import type { User as FirebaseUser, ConfirmationResult, ApplicationVerifier } from 'firebase/auth';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  sendPasswordResetEmail,
  sendEmailVerification,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  updateProfile,
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import type {
  AuthCredentials,
  AuthResponse,
  RegisterCredentials,
  User,
  UserPreferences,
} from '@/types/auth';

export class AuthService {
  /**
   * Convert Firebase User to our User type
   */
  private static convertFirebaseUser(firebaseUser: FirebaseUser): User {
    return {
      id: firebaseUser.uid,
      email: firebaseUser.email || '',
      name: firebaseUser.displayName || firebaseUser.email || '',
      role: 'user',
      avatar: firebaseUser.photoURL || undefined,
      image: firebaseUser.photoURL || undefined,
      displayName: firebaseUser.displayName || undefined,
      photoURL: firebaseUser.photoURL || undefined,
      emailVerified: firebaseUser.emailVerified,
      preferences: {
        theme: 'system' as const,
        language: 'en',
        emailNotifications: true,
        pushNotifications: true,
        notifications: {
          email: true,
          push: true,
          inApp: true,
          marketing: false,
        }
      },
      createdAt: new Date(),
      updatedAt: new Date(),
      lastLoginAt: new Date(),
    };
  }

  static async signInWithEmail(credentials: AuthCredentials): Promise<AuthResponse> {
    if (!auth) {
      return {
        success: false,
        user: undefined,
        error: 'Firebase auth not initialized',
      };
    }

    try {
      const result = await signInWithEmailAndPassword(
        auth,
        credentials.email,
        credentials.password
      );
      const user = this.convertFirebaseUser(result.user);
      return { success: true, user, error: null };
    } catch (error: unknown) {
      return {
        success: false,
        user: undefined,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  static async signUpWithEmail(credentials: RegisterCredentials): Promise<AuthResponse> {
    if (!auth) {
      return {
        success: false,
        user: undefined,
        error: 'Firebase auth not initialized',
      };
    }

    try {
      const result = await createUserWithEmailAndPassword(
        auth,
        credentials.email,
        credentials.password
      );
      const user = this.convertFirebaseUser(result.user);
      return { success: true, user, error: null };
    } catch (error: unknown) {
      return {
        success: false,
        user: undefined,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  static async signInWithGoogle(): Promise<AuthResponse> {
    if (!auth) {
      return {
        success: false,
        user: undefined,
        error: 'Firebase auth not initialized',
      };
    }

    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = this.convertFirebaseUser(result.user);
      return { success: true, user, error: null };
    } catch (error: unknown) {
      return {
        success: false,
        user: undefined,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  static async sendPasswordReset(email: string): Promise<AuthResponse> {
    if (!auth) {
      return {
        success: false,
        error: 'Firebase auth not initialized',
      };
    }

    try {
      await sendPasswordResetEmail(auth, email);
      return { success: true, message: 'Password reset email sent' };
    } catch (error: unknown) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  static async signOut(): Promise<void> {
    if (auth) {
      await signOut(auth);
    }
  }

  // User document methods
  static async getUserDocument(uid: string): Promise<User | null> {
    // In a real implementation, this would fetch from Firestore
    // For now, return null to fallback to Firebase user data
    return null;
  }

  static async updateUserProfile(data: Partial<User>): Promise<void> {
    if (!auth?.currentUser) {
      throw new Error('No authenticated user');
    }

    try {
      // Update Firebase profile
      if (data.displayName || data.photoURL) {
        await updateProfile(auth.currentUser, {
          displayName: data.displayName || undefined,
          photoURL: data.photoURL || undefined,
        });
      }

      // In a real implementation, also update Firestore document
      // await updateDoc(doc(db, 'users', auth.currentUser.uid), data);
    } catch (error) {
      throw new Error(
        error instanceof Error ? error.message : 'Failed to update profile'
      );
    }
  }

  static async updateUserPreferences(preferences: Partial<UserPreferences>): Promise<void> {
    if (!auth?.currentUser) {
      throw new Error('No authenticated user');
    }

    // In a real implementation, update user preferences in Firestore
    // For now, just validate the preferences object
    console.log('Updating user preferences:', preferences);
  }

  // Email verification
  static async sendPasswordResetEmail(email: string): Promise<void> {
    const result = await this.sendPasswordReset(email);
    if (!result.success && result.error) {
      throw new Error(result.error);
    }
  }

  static async sendEmailVerification(): Promise<void> {
    if (!auth?.currentUser) {
      throw new Error('No authenticated user');
    }

    try {
      await sendEmailVerification(auth.currentUser);
    } catch (error) {
      throw new Error(
        error instanceof Error ? error.message : 'Failed to send email verification'
      );
    }
  }

  // Phone authentication methods
  static createRecaptchaVerifier(containerId: string): ApplicationVerifier | null {
    if (!auth) {
      return null;
    }

    try {
      return new RecaptchaVerifier(auth, containerId, {
        size: 'invisible',
        callback: () => {
          // reCAPTCHA solved
        },
      });
    } catch (error) {
      console.error('Failed to create reCAPTCHA verifier:', error);
      return null;
    }
  }

  static async sendPhoneVerification(
    phoneNumber: string,
    recaptchaVerifier: ApplicationVerifier
  ): Promise<{
    confirmationResult: ConfirmationResult | null;
    error: string | null;
  }> {
    if (!auth) {
      return {
        confirmationResult: null,
        error: 'Firebase auth not initialized',
      };
    }

    try {
      const confirmationResult = await signInWithPhoneNumber(
        auth,
        phoneNumber,
        recaptchaVerifier
      );
      return { confirmationResult, error: null };
    } catch (error) {
      return {
        confirmationResult: null,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  static async verifyPhoneCode(
    confirmationResult: ConfirmationResult,
    verificationCode: string
  ): Promise<AuthResponse> {
    try {
      const result = await confirmationResult.confirm(verificationCode);
      const user = this.convertFirebaseUser(result.user);
      return { success: true, user, error: null };
    } catch (error) {
      return {
        success: false,
        user: undefined,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}

export const authService = AuthService;
