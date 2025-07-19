// Enhanced Authentication Types for CODAI Ecosystem

// Core User Types
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  displayName: string;
  avatar?: string;
  role: UserRole;
  permissions: Permission[];
  preferences: UserPreferences;
  profile: UserProfile;
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
  emailVerified: boolean;
  isActive: boolean;
}

export interface UserProfile {
  bio?: string;
  timezone?: string;
  language?: string;
  country?: string;
  organization?: string;
  title?: string;
  linkedAccounts: SocialAccount[];
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  language: 'en' | 'ro';
  notifications: NotificationPreferences;
  privacy: PrivacySettings;
}

export interface NotificationPreferences {
  email: boolean;
  push: boolean;
  inApp: boolean;
  marketing: boolean;
  security: boolean;
}

export interface PrivacySettings {
  profileVisibility: 'public' | 'private';
  showActivity: boolean;
  allowAnalytics: boolean;
}

export interface SocialAccount {
  provider: 'google' | 'github' | 'microsoft' | 'linkedin';
  providerId: string;
  email: string;
  isVerified: boolean;
  connectedAt: Date;
}

// Role and Permission System
export type UserRole =
  | 'admin'           // Full system access
  | 'user'            // Standard user
  | 'premium'         // Premium features
  | 'enterprise'      // Enterprise features
  | 'developer'       // API access
  | 'moderator'       // Content moderation
  | 'analyst'         // Analytics access
  | 'support'         // Support access

export interface Permission {
  id: string;
  name: string;
  resource: string;
  action: 'create' | 'read' | 'update' | 'delete' | 'execute';
  conditions?: Record<string, any>;
}

// Session Management
export interface Session {
  id: string;
  userId: string;
  deviceId: string;
  deviceInfo: DeviceInfo;
  ipAddress: string;
  userAgent: string;
  location?: SessionLocation;
  createdAt: Date;
  expiresAt: Date;
  lastActiveAt: Date;
  isActive: boolean;
  metadata: Record<string, any>;
}

export interface DeviceInfo {
  type: 'desktop' | 'mobile' | 'tablet';
  os: string;
  browser: string;
  isKnownDevice: boolean;
}

export interface SessionLocation {
  country?: string;
  region?: string;
  city?: string;
  timezone?: string;
}

// Authentication State
export interface AuthState {
  user: User | null;
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  error: AuthError | null;
  permissions: Set<string>;
  apps: ConnectedApp[];
}

export interface ConnectedApp {
  id: string;
  name: string;
  lastUsed: Date;
  permissions: string[];
  isActive: boolean;
}

// Authentication Credentials
export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
  deviceId?: string;
  captchaToken?: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  agreeToTerms: boolean;
  marketingConsent?: boolean;
  inviteCode?: string;
}

export interface SocialLoginCredentials {
  provider: 'google' | 'github' | 'microsoft' | 'linkedin';
  code: string;
  state?: string;
  redirectUri: string;
}

export interface ResetPasswordCredentials {
  email: string;
  captchaToken?: string;
}

export interface ChangePasswordCredentials {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

// Token Management
export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: 'Bearer';
}

export interface TokenPayload {
  sub: string;          // User ID
  email: string;
  role: UserRole;
  permissions: string[];
  sessionId: string;
  iat: number;          // Issued at
  exp: number;          // Expires at
  aud: string;          // Audience (app)
  iss: string;          // Issuer
}

export interface RefreshTokenPayload {
  sub: string;
  sessionId: string;
  deviceId: string;
  iat: number;
  exp: number;
}

// Configuration
export interface AuthConfig {
  apiUrl: string;
  appId: string;
  tokenStorageKey: string;
  refreshTokenKey: string;
  sessionStorageKey: string;
  accessTokenExpiry: number;    // 15 minutes
  refreshTokenExpiry: number;   // 7 days
  rememberMeExpiry: number;     // 30 days
  maxSessions: number;          // 5 active sessions
  enableSocialAuth: boolean;
  enableBiometric: boolean;
  requireEmailVerification: boolean;
  enableTwoFactor: boolean;
  passwordPolicy: PasswordPolicy;
  rateLimiting: RateLimitConfig;
}

export interface PasswordPolicy {
  minLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumbers: boolean;
  requireSpecialChars: boolean;
  preventCommonPasswords: boolean;
  preventReuse: number;
}

export interface RateLimitConfig {
  loginAttempts: number;
  loginWindow: number;          // in minutes
  passwordResetAttempts: number;
  passwordResetWindow: number;
}

// Error Handling
export interface AuthError {
  code: AuthErrorCode;
  message: string;
  details?: Record<string, any>;
  timestamp: Date;
  retry?: boolean;
}

export type AuthErrorCode =
  | 'INVALID_CREDENTIALS'
  | 'USER_NOT_FOUND'
  | 'USER_DISABLED'
  | 'EMAIL_NOT_VERIFIED'
  | 'PASSWORD_EXPIRED'
  | 'ACCOUNT_LOCKED'
  | 'SESSION_EXPIRED'
  | 'TOKEN_INVALID'
  | 'TOKEN_EXPIRED'
  | 'REFRESH_TOKEN_INVALID'
  | 'TWO_FACTOR_REQUIRED'
  | 'DEVICE_NOT_TRUSTED'
  | 'RATE_LIMITED'
  | 'NETWORK_ERROR'
  | 'SERVER_ERROR'
  | 'VALIDATION_ERROR'
  | 'PERMISSION_DENIED'
  | 'SOCIAL_AUTH_ERROR'
  | 'BIOMETRIC_ERROR'

// API Response Types
export interface AuthResponse<T = any> {
  success: boolean;
  data?: T;
  error?: AuthError;
  meta?: {
    requestId: string;
    timestamp: Date;
    version: string;
  };
}

export interface LoginResponse {
  user: User;
  tokens: TokenPair;
  session: Session;
  requiresTwoFactor?: boolean;
  trustDevice?: boolean;
}

export interface RegisterResponse {
  user: User;
  tokens: TokenPair;
  session: Session;
  emailVerificationRequired: boolean;
}

// Auth Context Interface
export interface AuthContextType extends AuthState {
  // Authentication methods
  login: (credentials: LoginCredentials) => Promise<LoginResponse>;
  register: (credentials: RegisterCredentials) => Promise<RegisterResponse>;
  loginWithSocial: (credentials: SocialLoginCredentials) => Promise<LoginResponse>;
  logout: (everywhere?: boolean) => Promise<void>;

  // Token management
  refreshAccessToken: () => Promise<TokenPair>;
  revokeSession: (sessionId: string) => Promise<void>;
  revokeMeAllSessions: () => Promise<void>;

  // User management
  updateUser: (updates: Partial<User>) => Promise<User>;
  updatePreferences: (preferences: Partial<UserPreferences>) => Promise<void>;
  changePassword: (credentials: ChangePasswordCredentials) => Promise<void>;
  deleteAccount: (password: string) => Promise<void>;

  // Account verification
  sendEmailVerification: () => Promise<void>;
  verifyEmail: (token: string) => Promise<void>;
  resetPassword: (credentials: ResetPasswordCredentials) => Promise<void>;
  confirmPasswordReset: (token: string, newPassword: string) => Promise<void>;

  // Two-factor authentication
  enableTwoFactor: () => Promise<{ qrCode: string; backupCodes: string[] }>;
  disableTwoFactor: (code: string) => Promise<void>;
  verifyTwoFactor: (code: string) => Promise<void>;

  // Social accounts
  connectSocialAccount: (provider: string, code: string) => Promise<void>;
  disconnectSocialAccount: (provider: string) => Promise<void>;

  // Permission checking
  hasPermission: (permission: string) => boolean;
  hasRole: (role: UserRole) => boolean;
  canAccess: (resource: string, action: string) => boolean;

  // Session management
  getSessions: () => Promise<Session[]>;
  getActiveSession: () => Session | null;

  // Utility methods
  isTokenExpired: (token: string) => boolean;
  getTokenPayload: (token: string) => TokenPayload | null;
  clearAuth: () => void;
}
