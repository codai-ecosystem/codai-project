import { type User as FirebaseUser } from 'firebase/auth';

export interface User {
  id: string;
  email: string;
  displayName: string | null;
  photoURL?: string | undefined; // Explicitly add undefined for exactOptionalPropertyTypes
  emailVerified: boolean;
  createdAt: Date;
  lastLoginAt: Date;
  preferences?: UserPreferences;
}

export interface UserPreferences {
  theme?: 'light' | 'dark' | 'system';
  language?: 'en' | 'ro';
  notifications?: {
    email: boolean;
    push: boolean;
    marketing: boolean;
  };
}

export interface AuthCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials extends AuthCredentials {
  displayName: string;
  confirmPassword: string;
}

export interface AuthResponse {
  user: FirebaseUser | null;
  error: string | null;
}

export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
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

export interface AuthError {
  code: string;
  message: string;
  field?: string;
}

// Phone authentication types
export interface PhoneAuthCredentials {
  phoneNumber: string;
  recaptchaToken?: string;
}

export interface PhoneVerificationResult {
  confirmationResult: import('firebase/auth').ConfirmationResult | null;
  error: string | null;
}

export interface PhoneConfirmationCredentials {
  confirmationResult: import('firebase/auth').ConfirmationResult;
  verificationCode: string;
}
