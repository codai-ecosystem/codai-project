import type { DefaultSession } from "next-auth";

// Base User interface for authentication
// User preference interface
export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  language: string;
  notifications: {
    email: boolean;
    push: boolean;
    marketing: boolean;
  };
}

// Enhanced User interface with preferences
export interface User {
  id: string;
  email: string;
  displayName?: string;
  photoURL?: string | null;
  emailVerified: boolean;
  role?: string;
  createdAt: Date;
  lastLoginAt: Date;
  preferences: UserPreferences;
}

// Authentication credentials for login
export interface AuthCredentials {
  email: string;
  password: string;
}

// Registration credentials for signup
export interface RegisterCredentials {
  email: string;
  password: string;
  displayName?: string;
  confirmPassword?: string;
}

// Authentication response structure
export interface AuthResponse {
  user: User | null;
  success: boolean;
  error?: string;
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
