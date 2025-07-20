import type { DefaultSession } from "next-auth";

// Auth-related types
export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  avatar?: string;
  image?: string;
  displayName?: string;
  photoURL?: string;
  emailVerified?: boolean;
  preferences?: UserPreferences;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
}

export interface AuthCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  name: string;
  displayName?: string;
  confirmPassword?: string;
}

export interface AuthResponse {
  success: boolean;
  user?: User;
  error?: string | null;
  message?: string;
  token?: string;
  refreshToken?: string;
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (credentials: AuthCredentials) => Promise<AuthResponse>;
  signUp: (credentials: RegisterCredentials) => Promise<AuthResponse>;
  signOut: () => Promise<void>;
  signInWithGoogle: () => Promise<AuthResponse>;
  sendPasswordReset: (email: string) => Promise<AuthResponse>;
  updateProfile: (updates: Partial<User>) => Promise<AuthResponse>;
  updatePreferences: (preferences: Partial<UserPreferences>) => Promise<AuthResponse>;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  language: string;
  timezone?: string;
  emailNotifications: boolean;
  pushNotifications: boolean;
  notifications?: {
    email: boolean;
    push: boolean;
    inApp: boolean;
    marketing: boolean;
  };
  aiProvider?: string;
  aiModel?: string;
  aiTemperature?: number;
  sidebarCollapsed?: boolean;
  compactMode?: boolean;
}

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
    } & DefaultSession["user"];
  }

  interface User {
    role: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: string;
  }
}
