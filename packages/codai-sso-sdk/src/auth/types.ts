import { z } from 'zod';

/**
 * User authentication status and profile information
 */
export interface CodaiUser {
  id: string;
  email: string;
  name: string;
  roles: string[];
  permissions: string[];
  avatar?: string;
  emailVerified: boolean;
  mfaEnabled: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Session information with security context
 */
export interface CodaiSession {
  user: CodaiUser;
  accessToken: string;
  refreshToken?: string;
  expiresAt: Date;
  deviceId: string;
  deviceFingerprint: string;
  riskScore: number;
  isTrusted: boolean;
  lastActivity: Date;
}

/**
 * Authentication configuration for applications
 */
export interface SSOConfig {
  keycloakUrl: string;
  realm: string;
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  postLogoutRedirectUri: string;
  scopes: string[];
  enableZeroTrust: boolean;
  enableAuditLogging: boolean;
  sessionTimeout: number;
  refreshTokenRotation: boolean;
}

/**
 * Role-based access control configuration
 */
export interface RBACConfig {
  roles: RoleDefinition[];
  permissions: PermissionDefinition[];
  defaultRole: string;
  hierarchical: boolean;
}

export interface RoleDefinition {
  name: string;
  description: string;
  permissions: string[];
  inheritsFrom?: string[];
}

export interface PermissionDefinition {
  name: string;
  description: string;
  resource: string;
  action: string;
}

/**
 * Zero Trust security configuration
 */
export interface ZeroTrustConfig {
  enableDeviceFingerprinting: boolean;
  enableLocationTracking: boolean;
  enableBehavioralAnalysis: boolean;
  riskThresholds: {
    low: number;
    medium: number;
    high: number;
  };
  challengeOnRisk: boolean;
  trustedDeviceExpiry: number;
}

/**
 * Authentication event types for logging and monitoring
 */
export enum AuthEventType {
  LOGIN_ATTEMPT = 'login_attempt',
  LOGIN_SUCCESS = 'login_success',
  LOGIN_FAILED = 'login_failed',
  LOGOUT = 'logout',
  TOKEN_REFRESH = 'token_refresh',
  TOKEN_EXPIRED = 'token_expired',
  MFA_CHALLENGE = 'mfa_challenge',
  MFA_SUCCESS = 'mfa_success',
  MFA_FAILED = 'mfa_failed',
  DEVICE_REGISTERED = 'device_registered',
  DEVICE_BLOCKED = 'device_blocked',
  RISK_DETECTED = 'risk_detected',
  SESSION_EXPIRED = 'session_expired',
  UNAUTHORIZED_ACCESS = 'unauthorized_access'
}

/**
 * Authentication event data structure
 */
export interface AuthEvent {
  type: AuthEventType;
  userId?: string;
  sessionId?: string;
  deviceId?: string;
  ipAddress?: string;
  userAgent?: string;
  location?: {
    country?: string;
    city?: string;
    latitude?: number;
    longitude?: number;
  };
  riskScore?: number;
  success: boolean;
  errorMessage?: string;
  metadata?: Record<string, any>;
  timestamp: Date;
}

/**
 * Authentication error types
 */
export enum AuthErrorType {
  INVALID_CREDENTIALS = 'invalid_credentials',
  TOKEN_EXPIRED = 'token_expired',
  TOKEN_INVALID = 'token_invalid',
  ACCESS_DENIED = 'access_denied',
  MFA_REQUIRED = 'mfa_required',
  DEVICE_NOT_TRUSTED = 'device_not_trusted',
  RISK_TOO_HIGH = 'risk_too_high',
  SESSION_EXPIRED = 'session_expired',
  NETWORK_ERROR = 'network_error',
  CONFIGURATION_ERROR = 'configuration_error'
}

/**
 * Custom authentication error class
 */
export class AuthError extends Error {
  constructor(
    public type: AuthErrorType,
    message: string,
    public metadata?: Record<string, any>
  ) {
    super(message);
    this.name = 'AuthError';
  }
}

/**
 * Device information for Zero Trust validation
 */
export interface DeviceInfo {
  id: string;
  fingerprint: string;
  userAgent: string;
  platform: string;
  browser: string;
  ipAddress: string;
  location?: {
    country?: string;
    city?: string;
  };
  isTrusted: boolean;
  lastSeen: Date;
  registeredAt: Date;
}

/**
 * Risk assessment result
 */
export interface RiskAssessment {
  score: number;
  level: 'low' | 'medium' | 'high' | 'critical';
  factors: RiskFactor[];
  recommendations: string[];
  challengeRequired: boolean;
}

export interface RiskFactor {
  type: string;
  description: string;
  weight: number;
  value: any;
}

/**
 * Validation schemas using Zod
 */
export const SSOConfigSchema = z.object({
  keycloakUrl: z.string().url(),
  realm: z.string().min(1),
  clientId: z.string().min(1),
  clientSecret: z.string().min(1),
  redirectUri: z.string().url(),
  postLogoutRedirectUri: z.string().url(),
  scopes: z.array(z.string()),
  enableZeroTrust: z.boolean().default(true),
  enableAuditLogging: z.boolean().default(true),
  sessionTimeout: z.number().min(300).default(3600),
  refreshTokenRotation: z.boolean().default(true)
});

export const ZeroTrustConfigSchema = z.object({
  enableDeviceFingerprinting: z.boolean().default(true),
  enableLocationTracking: z.boolean().default(true),
  enableBehavioralAnalysis: z.boolean().default(true),
  riskThresholds: z.object({
    low: z.number().min(0).max(1).default(0.3),
    medium: z.number().min(0).max(1).default(0.6),
    high: z.number().min(0).max(1).default(0.8)
  }),
  challengeOnRisk: z.boolean().default(true),
  trustedDeviceExpiry: z.number().min(86400).default(2592000) // 30 days
});

export type ValidatedSSOConfig = z.infer<typeof SSOConfigSchema>;
export type ValidatedZeroTrustConfig = z.infer<typeof ZeroTrustConfigSchema>;
