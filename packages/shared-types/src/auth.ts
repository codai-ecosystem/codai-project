// Authentication and Authorization Types
export interface AuthUser {
  id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  roles: UserRole[];
  permissions: Permission[];
  preferences: UserPreferences;
  profile: UserProfile;
  security: SecuritySettings;
  twoFactorAuth: TwoFactorAuth;
  sessions: UserSession[];
  devices: TrustedDevice[];
  createdAt: Date;
  lastLoginAt: Date;
  emailVerified: boolean;
  phoneVerified: boolean;
  kycStatus: 'pending' | 'verified' | 'rejected';
}

export interface UserProfile {
  dateOfBirth?: Date;
  phoneNumber?: string;
  address?: Address;
  occupation?: string;
  employer?: string;
  annualIncome?: number;
  maritalStatus?: 'single' | 'married' | 'divorced' | 'widowed';
  dependents?: number;
  citizenship?: string;
  idDocuments?: IdentityDocument[];
}

export interface IdentityDocument {
  id: string;
  type: 'drivers_license' | 'passport' | 'ssn' | 'tax_id';
  number: string; // masked
  expiryDate?: Date;
  issuingCountry: string;
  verified: boolean;
  verifiedAt?: Date;
}

export interface SecuritySettings {
  loginNotifications: boolean;
  transactionNotifications: boolean;
  securityQuestions: SecurityQuestion[];
  loginAttempts: LoginAttempt[];
  passwordHistory: PasswordEntry[];
  deviceFingerprinting: boolean;
  biometricEnabled: boolean;
}

export interface SecurityQuestion {
  id: string;
  question: string;
  answerHash: string;
  createdAt: Date;
}

export interface LoginAttempt {
  id: string;
  success: boolean;
  ipAddress: string;
  userAgent: string;
  location?: string;
  timestamp: Date;
  failureReason?: string;
}

export interface PasswordEntry {
  passwordHash: string;
  createdAt: Date;
  expiresAt?: Date;
}

export interface TwoFactorAuth {
  enabled: boolean;
  method: 'sms' | 'email' | 'authenticator' | 'hardware_key';
  backupCodes: string[];
  lastUsed?: Date;
  phoneNumber?: string;
  authenticatorSecret?: string;
  hardwareKeys: HardwareKey[];
}

export interface HardwareKey {
  id: string;
  name: string;
  credentialId: string;
  publicKey: string;
  counter: number;
  registeredAt: Date;
  lastUsed?: Date;
}

export interface UserSession {
  id: string;
  userId: string;
  deviceId: string;
  ipAddress: string;
  userAgent: string;
  location?: string;
  createdAt: Date;
  lastActiveAt: Date;
  expiresAt: Date;
  isActive: boolean;
  revokedAt?: Date;
}

export interface TrustedDevice {
  id: string;
  userId: string;
  name: string;
  type: 'mobile' | 'desktop' | 'tablet';
  fingerprint: string;
  ipAddress: string;
  userAgent: string;
  trustedAt: Date;
  lastUsed: Date;
  isActive: boolean;
}

export interface AuthToken {
  accessToken: string;
  refreshToken: string;
  tokenType: 'Bearer';
  expiresIn: number;
  scope: string[];
  issuedAt: Date;
  expiresAt: Date;
}

export interface AuthRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
  twoFactorCode?: string;
  deviceFingerprint?: string;
}

export interface AuthResponse {
  success: boolean;
  user?: AuthUser;
  token?: AuthToken;
  requires2FA?: boolean;
  requiresEmailVerification?: boolean;
  error?: string;
  message?: string;
}

// Role-Based Access Control
export interface Role {
  id: string;
  name: string;
  displayName: string;
  description: string;
  hierarchy: number;
  permissions: Permission[];
  isSystemRole: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Permission {
  id: string;
  resource: string;
  action: 'create' | 'read' | 'update' | 'delete' | 'admin' | 'approve';
  conditions?: PermissionCondition[];
  scope?: 'self' | 'team' | 'organization' | 'global';
}

export interface PermissionCondition {
  field: string;
  operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains';
  value: any;
}

// Audit and Compliance
export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  resource: string;
  resourceId?: string;
  oldValues?: Record<string, any>;
  newValues?: Record<string, any>;
  ipAddress: string;
  userAgent: string;
  timestamp: Date;
  success: boolean;
  errorMessage?: string;
}

export interface ComplianceCheck {
  id: string;
  userId: string;
  type: 'kyc' | 'aml' | 'sanctions' | 'pep' | 'address';
  status: 'pending' | 'passed' | 'failed' | 'manual_review';
  score?: number;
  result?: Record<string, any>;
  reviewedBy?: string;
  reviewedAt?: Date;
  createdAt: Date;
}

// OAuth and Third-Party Integration
export interface OAuthProvider {
  id: string;
  name: string;
  clientId: string;
  clientSecret: string;
  authorizeUrl: string;
  tokenUrl: string;
  userInfoUrl: string;
  scopes: string[];
  enabled: boolean;
}

export interface OAuthConnection {
  id: string;
  userId: string;
  providerId: string;
  providerUserId: string;
  accessToken: string;
  refreshToken?: string;
  expiresAt?: Date;
  scopes: string[];
  metadata?: Record<string, any>;
  connectedAt: Date;
  lastUsed?: Date;
  isActive: boolean;
}
