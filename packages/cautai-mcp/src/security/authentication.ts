import { z } from 'zod';
import * as crypto from 'crypto';
import validator from 'validator';

// JWT and password hashing will be implemented with external libraries
// For now, using simplified implementations
interface JWTPayload {
  userId: string;
  email: string;
  roles: string[];
  permissions: string[];
  sessionId: string;
  exp?: number;
  iat?: number;
}

// Simple JWT implementation for development (replace with jsonwebtoken in production)
class SimpleJWT {
  static sign(payload: any, secret: string, options: { expiresIn: string }): string {
    const header = { alg: 'HS256', typ: 'JWT' };
    const exp = Math.floor(Date.now() / 1000) + this.parseExpiry(options.expiresIn);
    const fullPayload = { ...payload, exp, iat: Math.floor(Date.now() / 1000) };
    
    const encodedHeader = Buffer.from(JSON.stringify(header)).toString('base64url');
    const encodedPayload = Buffer.from(JSON.stringify(fullPayload)).toString('base64url');
    const signature = crypto.createHmac('sha256', secret).update(`${encodedHeader}.${encodedPayload}`).digest('base64url');
    
    return `${encodedHeader}.${encodedPayload}.${signature}`;
  }

  static verify(token: string, secret: string): any {
    const parts = token.split('.');
    if (parts.length !== 3) throw new Error('Invalid token format');
    
    const [encodedHeader, encodedPayload, signature] = parts;
    const expectedSignature = crypto.createHmac('sha256', secret).update(`${encodedHeader}.${encodedPayload}`).digest('base64url');
    
    if (signature !== expectedSignature) throw new Error('Invalid signature');
    
    const payload = JSON.parse(Buffer.from(encodedPayload, 'base64url').toString());
    
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      const error = new Error('Token expired');
      (error as any).name = 'TokenExpiredError';
      throw error;
    }
    
    return payload;
  }

  private static parseExpiry(expiresIn: string): number {
    // Handle milliseconds - ensure 1ms minimum expiry time
    if (expiresIn.endsWith('ms')) {
      const ms = parseInt(expiresIn.slice(0, -2));
      return Math.max(1, Math.floor(ms / 1000)); // Convert to seconds, minimum 1 second
    }
    
    const value = parseInt(expiresIn.slice(0, -1));
    const unit = expiresIn.slice(-1);
    const multipliers: Record<string, number> = { s: 1, m: 60, h: 3600, d: 86400 };
    return value * (multipliers[unit] || 3600);
  }
}

// Simple bcrypt implementation for development (replace with bcrypt in production)
class SimpleBcrypt {
  static async hash(data: string, rounds: number): Promise<string> {
    return crypto.createHash('sha256').update(data + rounds).digest('hex');
  }

  static async compare(data: string, hash: string): Promise<boolean> {
    const testHash = crypto.createHash('sha256').update(data + 12).digest('hex');
    return testHash === hash;
  }
}

class TokenExpiredError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TokenExpiredError';
  }
}

// Simple logger until @codai/logger is available
const logger = {
  debug: (msg: string, meta?: any) => console.debug(`[AuthSystem] ${msg}`, meta || ''),
  info: (msg: string, meta?: any) => console.info(`[AuthSystem] ${msg}`, meta || ''),
  warn: (msg: string, meta?: any) => console.warn(`[AuthSystem] ${msg}`, meta || ''),
  error: (msg: string, meta?: any) => console.error(`[AuthSystem] ${msg}`, meta || '')
};

export interface AuthenticationConfig {
  jwtSecret: string;
  jwtExpiryTime: string;           // JWT token expiry (e.g., '1h', '7d')
  refreshTokenExpiryTime: string;  // Refresh token expiry (e.g., '30d')
  passwordMinLength: number;       // Minimum password length
  passwordRequireNumbers: boolean; // Require numbers in password
  passwordRequireSymbols: boolean; // Require symbols in password
  passwordRequireUppercase: boolean; // Require uppercase letters
  passwordRequireLowercase: boolean; // Require lowercase letters
  maxLoginAttempts: number;        // Max failed login attempts
  lockoutDurationMs: number;       // Account lockout duration (ms)
  enableMFA: boolean;              // Enable multi-factor authentication
  mfaSecretLength: number;         // TOTP secret length
}

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  salt: string;
  roles: Role[];
  permissions: string[];
  isActive: boolean;
  isEmailVerified: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  loginAttempts: number;
  lockedUntil?: Date;
  mfaSecret?: string;
  mfaEnabled: boolean;
  refreshTokens: RefreshToken[];
}

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  isActive: boolean;
}

export interface RefreshToken {
  id: string;
  token: string;
  userId: string;
  expiresAt: Date;
  isRevoked: boolean;
  createdAt: Date;
}

export interface AuthToken {
  accessToken: string;
  refreshToken: string;
  tokenType: 'Bearer';
  expiresIn: number;
  scope: string[];
}

export interface AuthenticationResult {
  success: boolean;
  user?: Omit<User, 'passwordHash' | 'salt' | 'mfaSecret'>;
  token?: AuthToken;
  error?: string;
  requiresMFA?: boolean;
  mfaToken?: string;
}

export interface AuthorizationContext {
  user: User | Omit<User, 'passwordHash' | 'salt' | 'mfaSecret'>;
  resource: string;
  action: string;
  metadata?: Record<string, any>;
}

export interface PermissionCheck {
  isAuthorized: boolean;
  missingPermissions?: string[];
  reason?: string;
}

export interface APIKeyValidation {
  isValid: boolean;
  keyInfo?: {
    id: string;
    name: string;
    permissions: string[];
    rateLimit: number;
    expiresAt?: Date;
  };
  error?: string;
}

export interface SecurityAuditEvent {
  id: string;
  timestamp: Date;
  userId?: string;
  sessionId?: string;
  eventType: 'login' | 'logout' | 'failed_login' | 'permission_denied' | 'suspicious_activity' | 'api_key_usage';
  resource?: string;
  action?: string;
  metadata: Record<string, any>;
  riskScore: number; // 0-100
  sourceIP?: string;
  userAgent?: string;
}

/**
 * Comprehensive authentication and authorization system with:
 * - JWT-based authentication with refresh tokens
 * - Role-based access control (RBAC)
 * - Multi-factor authentication (MFA) support
 * - API key management and validation
 * - Account lockout and security policies
 * - Security audit logging
 * - Password strength validation
 * - Session management
 */
export class AuthenticationSystem {
  private readonly config: AuthenticationConfig;
  private readonly users = new Map<string, User>();
  private readonly roles = new Map<string, Role>();
  private readonly apiKeys = new Map<string, any>();
  private readonly auditEvents: SecurityAuditEvent[] = [];
  private readonly activeSessions = new Map<string, any>();

  constructor(config: AuthenticationConfig) {
    this.config = config;
    this.initializeDefaultRoles();
    
    logger.info('Authentication system initialized', {
      jwtExpiryTime: config.jwtExpiryTime,
      mfaEnabled: config.enableMFA,
      maxLoginAttempts: config.maxLoginAttempts
    });
  }

  /**
   * Register a new user with email and password
   */
  async registerUser(email: string, password: string, roles: string[] = ['user']): Promise<AuthenticationResult> {
    try {
      // Normalize email first
      const normalizedEmail = email.toLowerCase().trim();
      console.log(`[AuthSystem] Email normalization: "${email}" -> "${normalizedEmail}"`);
      
      // Validate normalized email
      if (!validator.isEmail(normalizedEmail)) {
        console.log(`[AuthSystem] Email validation failed for: "${normalizedEmail}"`);
        return { success: false, error: 'Invalid email format' };
      }

      // Check if user already exists
      if (this.findUserByEmail(normalizedEmail)) {
        return { success: false, error: 'User already exists' };
      }

      // Validate password strength
      const passwordValidation = this.validatePasswordStrength(password);
      if (!passwordValidation.isValid) {
        return { success: false, error: passwordValidation.error };
      }

      // Hash password
      const salt = crypto.randomBytes(32).toString('hex');
      const passwordHash = await SimpleBcrypt.hash(password + salt, 12);

      // Create user
      const user: User = {
        id: crypto.randomUUID(),
        email: normalizedEmail,
        passwordHash,
        salt,
        roles: roles.map(roleName => this.roles.get(roleName)).filter(Boolean) as Role[],
        permissions: this.calculateUserPermissions(roles),
        isActive: true,
        isEmailVerified: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        loginAttempts: 0,
        mfaEnabled: false,
        refreshTokens: []
      };

      this.users.set(user.id, user);

      // Generate auth tokens
      const token = await this.generateAuthToken(user);

      // Log audit event
      this.logAuditEvent({
        id: crypto.randomUUID(),
        timestamp: new Date(),
        userId: user.id,
        eventType: 'login',
        metadata: { type: 'registration' },
        riskScore: 10
      });

      logger.info('User registered successfully', { userId: user.id, email });

      return {
        success: true,
        user: this.sanitizeUser(user),
        token
      };

    } catch (error) {
      logger.error('User registration failed', { email, error });
      return { success: false, error: 'Registration failed' };
    }
  }

  /**
   * Authenticate user with email and password
   */
  async authenticateUser(email: string, password: string, sourceIP?: string, userAgent?: string): Promise<AuthenticationResult> {
    try {
      const user = this.findUserByEmail(email);
      if (!user) {
        this.logAuditEvent({
          id: crypto.randomUUID(),
          timestamp: new Date(),
          eventType: 'failed_login',
          metadata: { email, reason: 'user_not_found' },
          riskScore: 30,
          sourceIP,
          userAgent
        });
        return { success: false, error: 'Invalid credentials' };
      }

      // Check if account is locked
      if (user.lockedUntil && user.lockedUntil > new Date()) {
        this.logAuditEvent({
          id: crypto.randomUUID(),
          timestamp: new Date(),
          userId: user.id,
          eventType: 'failed_login',
          metadata: { reason: 'account_locked' },
          riskScore: 50,
          sourceIP,
          userAgent
        });
        return { success: false, error: 'Account is locked' };
      }

      // Check if account is active
      if (!user.isActive) {
        return { success: false, error: 'Account is disabled' };
      }

      // Verify password
      const isValidPassword = await SimpleBcrypt.compare(password + user.salt, user.passwordHash);
      if (!isValidPassword) {
        // Increment login attempts
        user.loginAttempts++;
        user.updatedAt = new Date();

        // Lock account if max attempts reached
        if (user.loginAttempts >= this.config.maxLoginAttempts) {
          user.lockedUntil = new Date(Date.now() + this.config.lockoutDurationMs);
          logger.warn('Account locked due to failed login attempts', { userId: user.id });
        }

        this.logAuditEvent({
          id: crypto.randomUUID(),
          timestamp: new Date(),
          userId: user.id,
          eventType: 'failed_login',
          metadata: { reason: 'invalid_password', attempts: user.loginAttempts },
          riskScore: 40,
          sourceIP,
          userAgent
        });

        return { success: false, error: 'Invalid credentials' };
      }

      // Reset login attempts on successful authentication
      user.loginAttempts = 0;
      user.lockedUntil = undefined;
      user.lastLoginAt = new Date();
      user.updatedAt = new Date();

      // Check if MFA is required
      if (user.mfaEnabled && this.config.enableMFA) {
        const mfaToken = this.generateMFAToken(user.id);
        return {
          success: false,
          requiresMFA: true,
          mfaToken,
          error: 'MFA verification required'
        };
      }

      // Generate auth tokens
      const token = await this.generateAuthToken(user);

      this.logAuditEvent({
        id: crypto.randomUUID(),
        timestamp: new Date(),
        userId: user.id,
        eventType: 'login',
        metadata: { type: 'password_auth' },
        riskScore: 5,
        sourceIP,
        userAgent
      });

      logger.info('User authenticated successfully', { userId: user.id });

      return {
        success: true,
        user: this.sanitizeUser(user),
        token
      };

    } catch (error) {
      logger.error('Authentication failed', { email, error });
      return { success: false, error: 'Authentication failed' };
    }
  }

  /**
   * Verify MFA code
   */
  async verifyMFA(mfaToken: string, code: string): Promise<AuthenticationResult> {
    try {
      // Decode MFA token to get user ID
      const payload = SimpleJWT.verify(mfaToken, this.config.jwtSecret + '_mfa') as any;
      const user = this.users.get(payload.userId);

      if (!user || !user.mfaSecret) {
        return { success: false, error: 'Invalid MFA token' };
      }

      // Verify TOTP code (simplified - would use actual TOTP library)
      const isValidCode = this.verifyTOTPCode(user.mfaSecret, code);
      if (!isValidCode) {
        this.logAuditEvent({
          id: crypto.randomUUID(),
          timestamp: new Date(),
          userId: user.id,
          eventType: 'failed_login',
          metadata: { reason: 'invalid_mfa_code' },
          riskScore: 60
        });
        return { success: false, error: 'Invalid MFA code' };
      }

      // Update user login info
      user.lastLoginAt = new Date();
      user.updatedAt = new Date();

      // Generate auth tokens
      const token = await this.generateAuthToken(user);

      this.logAuditEvent({
        id: crypto.randomUUID(),
        timestamp: new Date(),
        userId: user.id,
        eventType: 'login',
        metadata: { type: 'mfa_auth' },
        riskScore: 5
      });

      return {
        success: true,
        user: this.sanitizeUser(user),
        token
      };

    } catch (error) {
      logger.error('MFA verification failed', { error });
      return { success: false, error: 'MFA verification failed' };
    }
  }

  /**
   * Validate JWT token and return user context
   */
  async validateToken(token: string): Promise<{ isValid: boolean; user?: Omit<User, 'passwordHash' | 'salt' | 'mfaSecret'>; error?: string }> {
    try {
      const payload = SimpleJWT.verify(token, this.config.jwtSecret) as any;
      const user = this.users.get(payload.userId);

      if (!user || !user.isActive) {
        return { isValid: false, error: 'User not found or inactive' };
      }

      // Check if token is in revoked list (would check database in production)
      const session = this.activeSessions.get(payload.sessionId);
      if (!session || session.isRevoked) {
        return { isValid: false, error: 'Token revoked' };
      }

      return { isValid: true, user: this.sanitizeUser(user) };

    } catch (error: any) {
      if (error.name === 'TokenExpiredError' || error.message.includes('expired')) {
        return { isValid: false, error: 'Token expired' };
      }
      return { isValid: false, error: 'Invalid token' };
    }
  }

  /**
   * Validate API key and return key information
   */
  async validateAPIKey(apiKey: string): Promise<APIKeyValidation> {
    try {
      // Hash the API key for lookup (keys should be stored hashed)
      const keyHash = crypto.createHash('sha256').update(apiKey).digest('hex');
      const keyInfo = this.apiKeys.get(keyHash);

      if (!keyInfo) {
        this.logAuditEvent({
          id: crypto.randomUUID(),
          timestamp: new Date(),
          eventType: 'api_key_usage',
          metadata: { result: 'invalid_key' },
          riskScore: 40
        });
        return { isValid: false, error: 'Invalid API key' };
      }

      // Check if key is expired
      if (keyInfo.expiresAt && keyInfo.expiresAt < new Date()) {
        return { isValid: false, error: 'API key expired' };
      }

      // Check if key is active
      if (!keyInfo.isActive) {
        return { isValid: false, error: 'API key disabled' };
      }

      this.logAuditEvent({
        id: crypto.randomUUID(),
        timestamp: new Date(),
        eventType: 'api_key_usage',
        metadata: { keyId: keyInfo.id, result: 'success' },
        riskScore: 5
      });

      return {
        isValid: true,
        keyInfo: {
          id: keyInfo.id,
          name: keyInfo.name,
          permissions: keyInfo.permissions,
          rateLimit: keyInfo.rateLimit,
          expiresAt: keyInfo.expiresAt
        }
      };

    } catch (error) {
      logger.error('API key validation failed', { error });
      return { isValid: false, error: 'API key validation failed' };
    }
  }

  /**
   * Check if user has permission for specific action on resource
   */
  checkPermission(context: AuthorizationContext): PermissionCheck {
    const requiredPermission = `${context.resource}:${context.action}`;
    
    let userPermissions: string[];
    let userRoles: Role[];
    
    // Check if user has permissions property (might be sanitized)
    if ('permissions' in context.user && context.user.permissions) {
      userPermissions = context.user.permissions;
      userRoles = context.user.roles || [];
    } else {
      // If it's a sanitized user, we need to look up the full user
      const fullUser = this.users.get(context.user.id);
      if (!fullUser) {
        return { 
          isAuthorized: false, 
          missingPermissions: [requiredPermission],
          reason: 'User not found' 
        };
      }
      userPermissions = fullUser.permissions;
      userRoles = fullUser.roles;
    }
    
    // Check direct permissions
    if (userPermissions.includes(requiredPermission) || 
        userPermissions.includes(`${context.resource}:*`) ||
        userPermissions.includes('*:*')) {
      return { isAuthorized: true };
    }

    // Check role-based permissions
    for (const role of userRoles) {
      if (role.permissions.includes(requiredPermission) || 
          role.permissions.includes(`${context.resource}:*`) ||
          role.permissions.includes('*:*')) {
        return { isAuthorized: true };
      }
    }

    // Log permission denied
    this.logAuditEvent({
      id: crypto.randomUUID(),
      timestamp: new Date(),
      userId: context.user.id,
      eventType: 'permission_denied',
      resource: context.resource,
      action: context.action,
      metadata: { requiredPermission },
      riskScore: 20
    });

    return {
      isAuthorized: false,
      missingPermissions: [requiredPermission],
      reason: `Missing permission: ${requiredPermission}`
    };
  }

  /**
   * Generate API key for user
   */
  async generateAPIKey(userId: string, name: string, permissions: string[], expiryDays?: number): Promise<string> {
    const user = this.users.get(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const apiKey = crypto.randomBytes(32).toString('hex');
    const keyHash = crypto.createHash('sha256').update(apiKey).digest('hex');
    
    const keyInfo = {
      id: crypto.randomUUID(),
      name,
      userId,
      permissions,
      rateLimit: 1000, // requests per hour
      isActive: true,
      createdAt: new Date(),
      expiresAt: expiryDays ? new Date(Date.now() + expiryDays * 24 * 60 * 60 * 1000) : undefined
    };

    this.apiKeys.set(keyHash, keyInfo);

    logger.info('API key generated', { userId, keyId: keyInfo.id, name });

    return apiKey;
  }

  /**
   * Get security audit events
   */
  getAuditEvents(limit = 100): SecurityAuditEvent[] {
    return this.auditEvents.slice(-limit);
  }

  /**
   * Get security statistics
   */
  getSecurityStats(): {
    totalUsers: number;
    activeUsers: number;
    lockedUsers: number;
    totalRoles: number;
    totalAPIKeys: number;
    totalEvents: number;
    recentFailedLogins: number;
    highRiskEvents: number;
  } {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

    const lockedUsers = Array.from(this.users.values()).filter(u => u.lockedUntil && u.lockedUntil > now);
    const activeUsers = Array.from(this.users.values()).filter(u => u.isActive);
    const recentFailedLogins = this.auditEvents.filter(e => 
      e.eventType === 'failed_login' && e.timestamp > oneHourAgo
    );
    const highRiskEvents = this.auditEvents.filter(e => e.riskScore > 50);

    return {
      totalUsers: this.users.size,
      activeUsers: activeUsers.length,
      lockedUsers: lockedUsers.length,
      totalRoles: this.roles.size,
      totalAPIKeys: this.apiKeys.size,
      totalEvents: this.auditEvents.length,
      recentFailedLogins: recentFailedLogins.length,
      highRiskEvents: highRiskEvents.length
    };
  }

  /**
   * Initialize default roles and permissions
   */
  private initializeDefaultRoles(): void {
    // Admin role - full access
    this.roles.set('admin', {
      id: 'admin',
      name: 'admin',
      description: 'Full system access',
      permissions: ['*:*'],
      isActive: true
    });

    // User role - basic search access
    this.roles.set('user', {
      id: 'user',
      name: 'user',
      description: 'Basic user access',
      permissions: ['search:read', 'profile:read', 'profile:update'],
      isActive: true
    });

    // API role - programmatic access
    this.roles.set('api', {
      id: 'api',
      name: 'api',
      description: 'API access only',
      permissions: ['search:read', 'search:write'],
      isActive: true
    });

    logger.info('Default roles initialized', { roleCount: this.roles.size });
  }

  /**
   * Calculate user permissions from roles
   */
  private calculateUserPermissions(roleNames: string[]): string[] {
    const permissions = new Set<string>();
    
    for (const roleName of roleNames) {
      const role = this.roles.get(roleName);
      if (role && role.isActive) {
        role.permissions.forEach(permission => permissions.add(permission));
      }
    }
    
    return Array.from(permissions);
  }

  /**
   * Generate authentication tokens
   */
  private async generateAuthToken(user: User): Promise<AuthToken> {
    const sessionId = crypto.randomUUID();
    
    const accessTokenPayload = {
      userId: user.id,
      email: user.email,
      roles: user.roles.map(r => r.name),
      permissions: user.permissions,
      sessionId
    };

    const accessToken = SimpleJWT.sign(accessTokenPayload, this.config.jwtSecret, {
      expiresIn: this.config.jwtExpiryTime
    });

    const refreshToken = crypto.randomBytes(32).toString('hex');
    
    // Store refresh token
    const refreshTokenInfo: RefreshToken = {
      id: crypto.randomUUID(),
      token: refreshToken,
      userId: user.id,
      expiresAt: new Date(Date.now() + this.parseTimeToMs(this.config.refreshTokenExpiryTime)),
      isRevoked: false,
      createdAt: new Date()
    };

    user.refreshTokens.push(refreshTokenInfo);

    // Store session
    this.activeSessions.set(sessionId, {
      userId: user.id,
      createdAt: new Date(),
      isRevoked: false
    });

    return {
      accessToken,
      refreshToken,
      tokenType: 'Bearer',
      expiresIn: this.parseTimeToMs(this.config.jwtExpiryTime) / 1000,
      scope: user.permissions
    };
  }

  /**
   * Generate MFA token for pending verification
   */
  private generateMFAToken(userId: string): string {
    return SimpleJWT.sign({ userId, type: 'mfa' }, this.config.jwtSecret + '_mfa', {
      expiresIn: '5m' // MFA tokens expire in 5 minutes
    });
  }

  /**
   * Verify TOTP code (simplified implementation)
   */
  private verifyTOTPCode(secret: string, code: string): boolean {
    // Simplified TOTP verification - would use proper TOTP library in production
    const timeWindow = Math.floor(Date.now() / 30000);
    const expectedCode = crypto.createHash('sha1').update(secret + timeWindow).digest('hex').substring(0, 6);
    return code === expectedCode;
  }

  /**
   * Validate password strength
   */
  private validatePasswordStrength(password: string): { isValid: boolean; error?: string } {
    console.log(`[AuthSystem] Password validation - password: "${password}", config:`, {
      minLength: this.config.passwordMinLength,
      requireUppercase: this.config.passwordRequireUppercase,
      requireLowercase: this.config.passwordRequireLowercase,
      requireNumbers: this.config.passwordRequireNumbers,
      requireSymbols: this.config.passwordRequireSymbols
    });

    if (password.length < this.config.passwordMinLength) {
      return { isValid: false, error: `Password must be at least ${this.config.passwordMinLength} characters long` };
    }

    if (this.config.passwordRequireUppercase && !/[A-Z]/.test(password)) {
      console.log(`[AuthSystem] Rejecting password - no uppercase: "${password}"`);
      return { isValid: false, error: 'Password must contain at least one uppercase letter' };
    }

    if (this.config.passwordRequireLowercase && !/[a-z]/.test(password)) {
      console.log(`[AuthSystem] Rejecting password - no lowercase: "${password}"`);
      return { isValid: false, error: 'Password must contain at least one lowercase letter' };
    }

    if (this.config.passwordRequireNumbers && !/\d/.test(password)) {
      console.log(`[AuthSystem] Rejecting password - no numbers: "${password}"`);
      return { isValid: false, error: 'Password must contain at least one number' };
    }

    if (this.config.passwordRequireSymbols && !/[^a-zA-Z0-9]/.test(password)) {
      console.log(`[AuthSystem] Rejecting password - no symbols: "${password}"`);
      return { isValid: false, error: 'Password must contain at least one special character' };
    }

    console.log(`[AuthSystem] Password validation passed: "${password}"`);
    return { isValid: true };
  }

  /**
   * Find user by email address
   */
  private findUserByEmail(email: string): User | undefined {
    return Array.from(this.users.values()).find(user => user.email === email.toLowerCase().trim());
  }

  /**
   * Remove sensitive information from user object
   */
  private sanitizeUser(user: User): Omit<User, 'passwordHash' | 'salt' | 'mfaSecret'> {
    const { passwordHash, salt, mfaSecret, ...sanitizedUser } = user;
    return sanitizedUser;
  }

  /**
   * Log security audit event
   */
  private logAuditEvent(event: SecurityAuditEvent): void {
    this.auditEvents.push(event);
    
    // Keep only recent events
    if (this.auditEvents.length > 10000) {
      this.auditEvents.splice(0, this.auditEvents.length - 10000);
    }

    if (event.riskScore > 30) {
      logger.warn('Security event logged', {
        eventType: event.eventType,
        riskScore: event.riskScore,
        userId: event.userId
      });
    }
  }

  /**
   * Parse time string to milliseconds
   */
  private parseTimeToMs(timeString: string): number {
    const timeValue = parseInt(timeString.slice(0, -1));
    const timeUnit = timeString.slice(-1);
    
    const multipliers: Record<string, number> = {
      's': 1000,
      'm': 60 * 1000,
      'h': 60 * 60 * 1000,
      'd': 24 * 60 * 60 * 1000
    };
    
    return timeValue * (multipliers[timeUnit] || 1000);
  }
}

// Export default configuration
export const DEFAULT_AUTH_CONFIG: AuthenticationConfig = {
  jwtSecret: process.env.JWT_SECRET || 'cautai-dev-secret-change-in-production',
  jwtExpiryTime: '1h',
  refreshTokenExpiryTime: '7d',
  passwordMinLength: 8,
  passwordRequireNumbers: true,
  passwordRequireSymbols: true,
  passwordRequireUppercase: true,
  passwordRequireLowercase: true,
  maxLoginAttempts: 5,
  lockoutDurationMs: 15 * 60 * 1000, // 15 minutes
  enableMFA: false, // Disabled by default for development
  mfaSecretLength: 32
};