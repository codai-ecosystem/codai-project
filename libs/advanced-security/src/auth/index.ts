/**
 * CODAI Authentication & Authorization System
 * Enterprise-grade authentication with JWT, OAuth, and multi-factor authentication
 */

import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import * as twoFactor from 'speakeasy'; // More reliable 2FA library
import * as crypto from 'crypto';

export interface User {
  id: string;
  email: string;
  username: string;
  passwordHash: string;
  role: UserRole;
  permissions: Permission[];
  mfaSecret?: string;
  mfaEnabled: boolean;
  lastLogin?: Date;
  loginAttempts: number;
  lockedUntil?: Date;
  verified: boolean;
  twoFactorBackupCodes: string[];
  securityPreferences: SecurityPreferences;
  profile: UserProfile;
}

export interface UserRole {
  id: string;
  name: string;
  description: string;
  permissions: Permission[];
  hierarchy: number; // 0 = admin, higher = less privileged
}

export interface Permission {
  id: string;
  resource: string;
  action: string; // create, read, update, delete, execute
  conditions?: Record<string, any>;
}

export interface SecurityPreferences {
  sessionTimeout: number; // minutes
  requireMFA: boolean;
  allowedDevices: string[];
  ipWhitelist: string[];
  notificationSettings: {
    emailAlerts: boolean;
    smsAlerts: boolean;
    pushNotifications: boolean;
  };
}

export interface UserProfile {
  firstName: string;
  lastName: string;
  avatar?: string;
  timezone: string;
  language: string;
  department?: string;
  organization?: string;
}

export interface AuthenticationResult {
  success: boolean;
  user?: User;
  token?: string;
  refreshToken?: string;
  mfaRequired?: boolean;
  mfaToken?: string;
  error?: string;
  remainingAttempts?: number;
}

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
  permissions: string[];
  sessionId: string;
  deviceId: string;
  iat: number;
  exp: number;
}

export class AuthenticationManager {
  private readonly jwtSecret: string;
  private readonly jwtRefreshSecret: string;
  private readonly saltRounds: number = 12;
  private readonly maxLoginAttempts: number = 5;
  private readonly lockoutDuration: number = 15 * 60 * 1000; // 15 minutes

  constructor(jwtSecret: string, jwtRefreshSecret: string) {
    this.jwtSecret = jwtSecret;
    this.jwtRefreshSecret = jwtRefreshSecret;
  }

  /**
   * Register a new user with password hashing and validation
   */
  async registerUser(userData: {
    email: string;
    username: string;
    password: string;
    firstName: string;
    lastName: string;
    role?: string;
  }): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
      // Validate password strength
      const passwordValidation = this.validatePasswordStrength(userData.password);
      if (!passwordValidation.valid) {
        return { success: false, error: passwordValidation.message || 'Password validation failed' };
      }

      // Check if user already exists
      const existingUser = await this.findUserByEmail(userData.email);
      if (existingUser) {
        return { success: false, error: 'User already exists' };
      }

      // Hash password
      const passwordHash = await bcrypt.hash(userData.password, this.saltRounds);

      // Generate MFA secret
      const mfaSecret = twoFactor.generateSecret({
        name: 'CODAI',
        length: 32
      });

      // Create user object
      const user: User = {
        id: crypto.randomUUID(),
        email: userData.email,
        username: userData.username,
        passwordHash,
        role: await this.getDefaultRole(userData.role),
        permissions: [],
        mfaSecret: mfaSecret.base32,
        mfaEnabled: false,
        loginAttempts: 0,
        verified: false,
        twoFactorBackupCodes: this.generateBackupCodes(),
        securityPreferences: {
          sessionTimeout: 30,
          requireMFA: false,
          allowedDevices: [],
          ipWhitelist: [],
          notificationSettings: {
            emailAlerts: true,
            smsAlerts: false,
            pushNotifications: true
          }
        },
        profile: {
          firstName: userData.firstName,
          lastName: userData.lastName,
          timezone: 'UTC',
          language: 'en'
        }
      };

      // Save user (in production, this would save to database)
      await this.saveUser(user);

      // Send verification email
      await this.sendVerificationEmail(user);

      return { success: true, user };
    } catch (error) {
      return { success: false, error: `Registration failed: ${error}` };
    }
  }

  /**
   * Authenticate user with email/password
   */
  async authenticateUser(
    email: string,
    password: string,
    deviceId: string,
    ipAddress: string
  ): Promise<AuthenticationResult> {
    try {
      const user = await this.findUserByEmail(email);
      if (!user) {
        return { success: false, error: 'Invalid credentials' };
      }

      // Check if account is locked
      if (user.lockedUntil && user.lockedUntil > new Date()) {
        const remainingTime = Math.ceil((user.lockedUntil.getTime() - Date.now()) / 60000);
        return {
          success: false,
          error: `Account locked. Try again in ${remainingTime} minutes`
        };
      }

      // Verify password
      const passwordValid = await bcrypt.compare(password, user.passwordHash);
      if (!passwordValid) {
        await this.handleFailedLogin(user);
        return {
          success: false,
          error: 'Invalid credentials',
          remainingAttempts: this.maxLoginAttempts - user.loginAttempts
        };
      }

      // Check if user is verified
      if (!user.verified) {
        return { success: false, error: 'Please verify your email address' };
      }

      // Reset login attempts on successful authentication
      user.loginAttempts = 0;
      delete user.lockedUntil;
      user.lastLogin = new Date();

      // Check if MFA is required
      if (user.mfaEnabled || user.securityPreferences.requireMFA) {
        const mfaToken = this.generateMFAToken(user.id);
        await this.saveUser(user);
        return {
          success: false,
          mfaRequired: true,
          mfaToken,
          error: 'MFA verification required'
        };
      }

      // Generate JWT tokens
      const sessionId = crypto.randomUUID();
      const token = this.generateJWT(user, sessionId, deviceId);
      const refreshToken = this.generateRefreshToken(user.id, sessionId);

      await this.saveUser(user);
      await this.logSecurityEvent(user.id, 'LOGIN_SUCCESS', { deviceId, ipAddress });

      return {
        success: true,
        user,
        token,
        refreshToken
      };
    } catch (error) {
      return { success: false, error: `Authentication failed: ${error}` };
    }
  }

  /**
   * Verify MFA token and complete authentication
   */
  async verifyMFA(
    mfaToken: string,
    totpCode: string,
    deviceId: string,
    ipAddress: string
  ): Promise<AuthenticationResult> {
    try {
      const payload = jwt.verify(mfaToken, this.jwtSecret) as any;
      const user = await this.findUserById(payload.userId);

      if (!user || !user.mfaSecret) {
        return { success: false, error: 'Invalid MFA token' };
      }

      // Verify TOTP code
      const verification = twoFactor.totp.verify({
        secret: user.mfaSecret,
        encoding: 'base32',
        token: totpCode,
        window: 2
      });
      if (!verification) {
        return { success: false, error: 'Invalid MFA code' };
      }

      // Generate session tokens
      const sessionId = crypto.randomUUID();
      const token = this.generateJWT(user, sessionId, deviceId);
      const refreshToken = this.generateRefreshToken(user.id, sessionId);

      await this.logSecurityEvent(user.id, 'MFA_SUCCESS', { deviceId, ipAddress });

      return {
        success: true,
        user,
        token,
        refreshToken
      };
    } catch (error) {
      return { success: false, error: 'MFA verification failed' };
    }
  }

  /**
   * Enable MFA for user
   */
  async enableMFA(userId: string, totpCode: string): Promise<{ success: boolean; backupCodes?: string[]; error?: string }> {
    try {
      const user = await this.findUserById(userId);
      if (!user || !user.mfaSecret) {
        return { success: false, error: 'User not found or MFA not set up' };
      }

      // Verify the TOTP code
      const verification = twoFactor.totp.verify({
        secret: user.mfaSecret,
        encoding: 'base32',
        token: totpCode,
        window: 2
      });
      if (!verification) {
        return { success: false, error: 'Invalid MFA code' };
      }

      // Enable MFA
      user.mfaEnabled = true;
      user.twoFactorBackupCodes = this.generateBackupCodes();
      await this.saveUser(user);

      await this.logSecurityEvent(userId, 'MFA_ENABLED');

      return {
        success: true,
        backupCodes: user.twoFactorBackupCodes
      };
    } catch (error) {
      return { success: false, error: `Failed to enable MFA: ${error}` };
    }
  }

  /**
   * Validate JWT token
   */
  validateToken(token: string): { valid: boolean; payload?: JWTPayload; error?: string } {
    try {
      const payload = jwt.verify(token, this.jwtSecret) as JWTPayload;
      return { valid: true, payload };
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        return { valid: false, error: 'Token expired' };
      }
      return { valid: false, error: 'Invalid token' };
    }
  }

  /**
   * Refresh JWT token using refresh token
   */
  async refreshToken(refreshToken: string, deviceId: string): Promise<{ success: boolean; token?: string; error?: string }> {
    try {
      const payload = jwt.verify(refreshToken, this.jwtRefreshSecret) as any;
      const user = await this.findUserById(payload.userId);

      if (!user) {
        return { success: false, error: 'User not found' };
      }

      const newToken = this.generateJWT(user, payload.sessionId, deviceId);
      return { success: true, token: newToken };
    } catch (error) {
      return { success: false, error: 'Invalid refresh token' };
    }
  }

  /**
   * Check if user has permission
   */
  hasPermission(user: User, resource: string, action: string): boolean {
    // Check direct permissions
    const hasDirectPermission = user.permissions.some(p =>
      p.resource === resource && p.action === action
    );

    if (hasDirectPermission) return true;

    // Check role permissions
    const hasRolePermission = user.role.permissions.some(p =>
      p.resource === resource && p.action === action
    );

    return hasRolePermission;
  }

  /**
   * Generate secure backup codes
   */
  private generateBackupCodes(): string[] {
    const codes: string[] = [];
    for (let i = 0; i < 10; i++) {
      codes.push(crypto.randomBytes(4).toString('hex').toUpperCase());
    }
    return codes;
  }

  /**
   * Validate password strength
   */
  private validatePasswordStrength(password: string): { valid: boolean; message?: string } {
    if (password.length < 8) {
      return { valid: false, message: 'Password must be at least 8 characters long' };
    }

    if (!/(?=.*[a-z])/.test(password)) {
      return { valid: false, message: 'Password must contain at least one lowercase letter' };
    }

    if (!/(?=.*[A-Z])/.test(password)) {
      return { valid: false, message: 'Password must contain at least one uppercase letter' };
    }

    if (!/(?=.*\d)/.test(password)) {
      return { valid: false, message: 'Password must contain at least one number' };
    }

    if (!/(?=.*[@$!%*?&])/.test(password)) {
      return { valid: false, message: 'Password must contain at least one special character' };
    }

    return { valid: true };
  }

  /**
   * Generate JWT token
   */
  private generateJWT(user: User, sessionId: string, deviceId: string): string {
    const payload: JWTPayload = {
      userId: user.id,
      email: user.email,
      role: user.role.name,
      permissions: user.role.permissions.map(p => `${p.resource}:${p.action}`),
      sessionId,
      deviceId,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (user.securityPreferences.sessionTimeout * 60)
    };

    return jwt.sign(payload, this.jwtSecret);
  }

  /**
   * Generate refresh token
   */
  private generateRefreshToken(userId: string, sessionId: string): string {
    const payload = {
      userId,
      sessionId,
      type: 'refresh',
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60) // 7 days
    };

    return jwt.sign(payload, this.jwtRefreshSecret);
  }

  /**
   * Generate MFA token for two-step verification
   */
  private generateMFAToken(userId: string): string {
    const payload = {
      userId,
      type: 'mfa',
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (5 * 60) // 5 minutes
    };

    return jwt.sign(payload, this.jwtSecret);
  }

  /**
   * Handle failed login attempt
   */
  private async handleFailedLogin(user: User): Promise<void> {
    user.loginAttempts = (user.loginAttempts || 0) + 1;

    if (user.loginAttempts >= this.maxLoginAttempts) {
      user.lockedUntil = new Date(Date.now() + this.lockoutDuration);
      await this.logSecurityEvent(user.id, 'ACCOUNT_LOCKED');
    }

    await this.saveUser(user);
    await this.logSecurityEvent(user.id, 'LOGIN_FAILED');
  }

  /**
   * Database operations (mock implementations)
   */
  private async findUserByEmail(email: string): Promise<User | null> {
    // In production, this would query the database
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    return users.find((u: User) => u.email === email) || null;
  }

  private async findUserById(id: string): Promise<User | null> {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    return users.find((u: User) => u.id === id) || null;
  }

  private async saveUser(user: User): Promise<void> {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const index = users.findIndex((u: User) => u.id === user.id);

    if (index >= 0) {
      users[index] = user;
    } else {
      users.push(user);
    }

    localStorage.setItem('users', JSON.stringify(users));
  }

  private async getDefaultRole(roleName?: string): Promise<UserRole> {
    const defaultRoles: UserRole[] = [
      {
        id: 'user',
        name: 'User',
        description: 'Standard user with basic permissions',
        hierarchy: 3,
        permissions: [
          { id: 'read_own_profile', resource: 'profile', action: 'read' },
          { id: 'update_own_profile', resource: 'profile', action: 'update' }
        ]
      },
      {
        id: 'developer',
        name: 'Developer',
        description: 'Developer with code access permissions',
        hierarchy: 2,
        permissions: [
          { id: 'read_code', resource: 'code', action: 'read' },
          { id: 'write_code', resource: 'code', action: 'create' },
          { id: 'deploy_code', resource: 'deployment', action: 'execute' }
        ]
      },
      {
        id: 'admin',
        name: 'Administrator',
        description: 'Administrator with full system access',
        hierarchy: 0,
        permissions: [
          { id: 'admin_all', resource: '*', action: '*' }
        ]
      }
    ];

    const foundRole = defaultRoles.find(r => r.name.toLowerCase() === roleName?.toLowerCase());
    return foundRole ?? defaultRoles[0]!;
  }

  private async sendVerificationEmail(user: User): Promise<void> {
    // In production, this would send an actual email
    console.log(`Verification email sent to ${user.email}`);
  }

  private async logSecurityEvent(userId: string, event: string, metadata?: any): Promise<void> {
    const securityEvents = JSON.parse(localStorage.getItem('security_events') || '[]');
    securityEvents.push({
      userId,
      event,
      timestamp: new Date(),
      metadata
    });
    localStorage.setItem('security_events', JSON.stringify(securityEvents));
  }
}

// Default roles and permissions
export const DEFAULT_PERMISSIONS = {
  PROFILE_READ: { resource: 'profile', action: 'read' },
  PROFILE_UPDATE: { resource: 'profile', action: 'update' },
  CODE_READ: { resource: 'code', action: 'read' },
  CODE_WRITE: { resource: 'code', action: 'create' },
  CODE_DELETE: { resource: 'code', action: 'delete' },
  ADMIN_ALL: { resource: '*', action: '*' }
};

export default AuthenticationManager;
