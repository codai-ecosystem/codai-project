/**
 * Simple Authentication Service for ID Service
 * Real implementation using in-memory storage for development
 * Production would use proper database
 */

import { compare, hash } from 'bcryptjs';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import { rateLimiter } from '../lib/rate-limiter';

// Security constants
const MAX_LOGIN_ATTEMPTS = 5;
const ACCOUNT_LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes
const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes
const PASSWORD_MIN_LENGTH = 8;

export interface User {
  id: string;
  username: string;
  email: string;
  password?: string;
  role?: string;
  profile: {
    name?: string;
    avatar?: string;
  };
  createdAt: Date;
  updatedAt: Date;
  lastLogin?: Date;
  isActive: boolean;
  emailVerified: boolean;
  // Security fields
  failedLoginAttempts?: number;
  accountLockedUntil?: Date;
  passwordHistory?: string[];
  lastPasswordChange?: Date;
  suspiciousActivityDetected?: boolean;
  ipAddresses?: string[];
}

export interface CreateUserData {
  username: string;
  email: string;
  password: string;
  profile?: {
    name?: string;
    avatar?: string;
  };
}

export interface LoginCredentials {
  email: string;
  password: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface AuthenticationResult {
  success: boolean;
  user?: User;
  token?: string;
  refreshToken?: string;
  message?: string;
  securityWarning?: string;
}

export interface UserSession {
  id: string;
  userId: string;
  tokenHash: string;
  refreshTokenHash?: string;
  expiresAt: Date;
  createdAt: Date;
  lastAccessed: Date;
  ipAddress?: string;
  userAgent?: string;
  isActive: boolean;
}

interface StorageData {
  users: User[];
  sessions: UserSession[];
  metrics: {
    loginAttempts: number;
    loginSuccess: number;
    loginFailures: number;
    userRegistrations: number;
  };
  auditLogs: any[];
}

export class SimpleAuthService {
  private initialized = false;
  private isInitializing = false;
  private storagePath: string;
  private data: StorageData;

  constructor() {
    this.storagePath = join(process.cwd(), 'data', 'auth-storage.json');
    this.data = {
      users: [],
      sessions: [],
      metrics: {
        loginAttempts: 0,
        loginSuccess: 0,
        loginFailures: 0,
        userRegistrations: 0
      },
      auditLogs: []
    };
  }

  async initialize(): Promise<void> {
    if (this.initialized) return;

    this.isInitializing = true;
    try {
      // Ensure data directory exists
      const dataDir = join(process.cwd(), 'data');
      if (!existsSync(dataDir)) {
        require('fs').mkdirSync(dataDir, { recursive: true });
      }

      // Load existing data
      if (existsSync(this.storagePath)) {
        const rawData = readFileSync(this.storagePath, 'utf-8');
        this.data = JSON.parse(rawData);

        // Convert date strings back to Date objects
        this.data.users = this.data.users.map(user => ({
          ...user,
          createdAt: new Date(user.createdAt),
          updatedAt: new Date(user.updatedAt),
          lastLogin: user.lastLogin ? new Date(user.lastLogin) : undefined
        }));

        this.data.sessions = this.data.sessions.map(session => ({
          ...session,
          expiresAt: new Date(session.expiresAt),
          createdAt: new Date(session.createdAt),
          lastAccessed: new Date(session.lastAccessed)
        }));
      }

      // Create default admin user if no users exist
      if (this.data.users.length === 0) {
        await this.createDefaultUsers();
      }

      this.initialized = true;
      console.log('✅ Simple Auth Service initialized with real data storage');
      console.log(`📁 Storage path: ${this.storagePath}`);
      console.log(`👥 Users: ${this.data.users.length}, Sessions: ${this.data.sessions.length}`);
    } catch (error) {
      console.error('❌ Failed to initialize Simple Auth Service:', error);
      throw error;
    } finally {
      this.isInitializing = false;
    }
  }

  private async createDefaultUsers(): Promise<void> {
    // Only create users if they don't exist to avoid duplicates
    const adminExists = this.data.users.some(u => u.email === 'admin@codai.ro');
    const testExists = this.data.users.some(u => u.email === 'test@codai.ro');

    if (!adminExists) {
      // Hash password synchronously during initialization to avoid circular calls
      const adminHashedPassword = await hash('admin123', 12);
      const adminUserId = `admin_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      this.data.users.push({
        id: adminUserId,
        username: 'admin',
        email: 'admin@codai.ro',
        password: adminHashedPassword,
        profile: { name: 'Admin User' },
        role: 'admin',
        isActive: true,
        emailVerified: true,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }

    if (!testExists) {
      // Hash password synchronously during initialization to avoid circular calls  
      const testHashedPassword = await hash('test123', 12);
      const testUserId = `test_${Date.now() + 1}_${Math.random().toString(36).substr(2, 9)}`;

      this.data.users.push({
        id: testUserId,
        username: 'testuser',
        email: 'test@codai.ro',
        password: testHashedPassword,
        profile: { name: 'Test User' },
        role: 'user',
        isActive: true,
        emailVerified: true,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }

    console.log('✅ Created default users:', {
      admin: 'admin@codai.ro',
      test: 'test@codai.ro',
      total: this.data.users.length
    });
  }

  private saveData(): void {
    try {
      writeFileSync(this.storagePath, JSON.stringify(this.data, null, 2));
    } catch (error) {
      console.error('Failed to save data:', error);
    }
  }

  async createUser(userData: CreateUserData): Promise<User> {
    // Skip ensureInitialized when called during initialization to avoid circular dependency
    if (!this.initialized && !this.isInitializing) {
      if (!this.initialized && !this.isInitializing) { await this.initialize(); }
    }

    try {
      // 1. INPUT SANITIZATION
      const sanitizedEmail = this.sanitizeInput(userData.email.toLowerCase().trim());
      const sanitizedUsername = this.sanitizeInput(userData.username.trim());

      if (!this.validateEmail(sanitizedEmail)) {
        throw new Error('Invalid email format');
      }

      // 2. PASSWORD STRENGTH VALIDATION
      const passwordValidation = this.validatePasswordStrength(userData.password);
      if (!passwordValidation.isValid) {
        throw new Error(`Password requirements not met: ${passwordValidation.errors.join(', ')}`);
      }

      // 3. CHECK FOR EXISTING USER
      let existingUser: User | null = null;
      if (this.isInitializing) {
        existingUser = this._findUserByEmailSync(sanitizedEmail);
      } else {
        existingUser = await this.findUserByEmail(sanitizedEmail);
      }

      if (existingUser) {
        throw new Error('User with this email already exists');
      }

      // 4. HASH PASSWORD
      const hashedPassword = await hash(userData.password, 12);

      // Create user ID
      const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      const newUser: User = {
        id: userId,
        username: sanitizedUsername,
        email: sanitizedEmail,
        password: hashedPassword,
        profile: userData.profile || { name: sanitizedUsername },
        isActive: true,
        emailVerified: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        // Initialize security fields
        failedLoginAttempts: 0,
        passwordHistory: [hashedPassword], // Start password history
        lastPasswordChange: new Date(),
        ipAddresses: [],
        suspiciousActivityDetected: false
      };

      this.data.users.push(newUser);
      this.data.metrics.userRegistrations++;

      // Log audit trail
      await this.logAudit('user_created', userId, {
        email: sanitizedEmail,
        username: sanitizedUsername,
        passwordStrengthMet: true
      }, 'success');

      this.saveData();

      // Return user without password
      const { password, ...userWithoutPassword } = newUser;
      return userWithoutPassword;
    } catch (error) {
      await this.logAudit('user_creation_failed', 'system', {
        email: userData.email,
        error: error instanceof Error ? error.message : 'Unknown error'
      }, 'failure');
      throw error;
    }
  }

  async authenticateUser(credentials: LoginCredentials, metadata?: { ip?: string; userAgent?: string }): Promise<AuthenticationResult> {
    if (!this.initialized && !this.isInitializing) { await this.initialize(); }

    try {
      // 1. RATE LIMITING CHECK
      const rateLimitResult = await rateLimiter.checkLogin(credentials.email);
      if (!rateLimitResult.allowed) {
        await this.logAudit('login_rate_limited', 'unknown', {
          email: credentials.email,
          ip: metadata?.ip,
          resetTime: rateLimitResult.resetTime
        }, 'warning');

        return {
          success: false,
          message: `Too many login attempts. Try again in ${Math.ceil((rateLimitResult.resetTime - Date.now()) / 60000)} minutes.`,
          securityWarning: 'Rate limit exceeded'
        };
      }

      // 2. INPUT SANITIZATION
      const sanitizedEmail = this.sanitizeInput(credentials.email.toLowerCase().trim());
      if (!this.validateEmail(sanitizedEmail)) {
        return {
          success: false,
          message: 'Invalid email format'
        };
      }

      // Record login attempt
      this.data.metrics.loginAttempts++;

      // 3. FIND USER
      const user = await this.findUserByEmail(sanitizedEmail);
      if (!user || !user.password) {
        await this.logAudit('login_failed', 'unknown', {
          email: sanitizedEmail,
          reason: 'user_not_found',
          ip: metadata?.ip
        }, 'failure');

        this.data.metrics.loginFailures++;
        this.saveData();

        return {
          success: false,
          message: 'Invalid email or password'
        };
      }

      // 4. ACCOUNT LOCKOUT CHECK
      if (this.isAccountLocked(user)) {
        await this.logAudit('login_failed', user.id, {
          email: sanitizedEmail,
          reason: 'account_locked',
          ip: metadata?.ip,
          lockoutUntil: user.accountLockedUntil
        }, 'warning');

        return {
          success: false,
          message: 'Account is temporarily locked due to too many failed attempts. Please try again later.',
          securityWarning: 'Account locked'
        };
      }

      // 5. ACCOUNT STATUS CHECK
      if (!user.isActive) {
        await this.logAudit('login_failed', user.id, {
          email: sanitizedEmail,
          reason: 'account_inactive',
          ip: metadata?.ip
        }, 'failure');

        return {
          success: false,
          message: 'Account is inactive'
        };
      }

      // 6. SUSPICIOUS ACTIVITY DETECTION
      const isSuspicious = await this.detectSuspiciousActivity(sanitizedEmail, metadata?.ip, metadata?.userAgent);
      if (isSuspicious) {
        await this.logAudit('suspicious_login_detected', user.id, {
          email: sanitizedEmail,
          ip: metadata?.ip,
          userAgent: metadata?.userAgent
        }, 'warning');

        console.error(`Suspicious login pattern detected for user ${sanitizedEmail}`);
      }

      // 7. PASSWORD VERIFICATION
      const isPasswordValid = await compare(credentials.password, user.password);
      if (!isPasswordValid) {
        await this.handleFailedLogin(sanitizedEmail, metadata?.ip);

        await this.logAudit('login_failed', user.id, {
          email: sanitizedEmail,
          reason: 'invalid_password',
          ip: metadata?.ip,
          failedAttempts: (user.failedLoginAttempts || 0) + 1
        }, 'failure');

        this.data.metrics.loginFailures++;
        this.saveData();

        return {
          success: false,
          message: 'Invalid email or password',
          securityWarning: isSuspicious ? 'Suspicious activity detected' : undefined
        };
      }

      // 8. SUCCESSFUL LOGIN - RESET SECURITY COUNTERS
      await this.resetFailedAttempts(user.id, metadata?.ip);

      // Generate simple JWT-like token
      const token = this.generateUserToken(user);
      const refreshToken = this.generateRefreshToken(user);

      // Update last login
      const userIndex = this.data.users.findIndex(u => u.id === user.id);
      if (userIndex !== -1) {
        this.data.users[userIndex].lastLogin = new Date();
        this.data.users[userIndex].updatedAt = new Date();
      }

      // Create session record
      await this.createSession(user.id, token, refreshToken, metadata);

      // Log successful login
      await this.logAudit('login_success', user.id, {
        email: sanitizedEmail,
        ip: metadata?.ip,
        userAgent: metadata?.userAgent,
        suspiciousActivity: isSuspicious
      }, 'success');

      // Record success metric
      this.data.metrics.loginSuccess++;
      this.saveData();

      // Return result without password
      const { password, ...userWithoutPassword } = user;
      return {
        success: true,
        user: userWithoutPassword,
        token,
        refreshToken
      };

    } catch (error) {
      await this.logAudit('login_error', 'system', {
        email: credentials.email,
        error: error instanceof Error ? error.message : 'Unknown error',
        ip: metadata?.ip
      }, 'error');

      console.error('Authentication error:', error);
      return {
        success: false,
        message: 'Authentication service error'
      };
    }
  }

  async validateToken(token: string): Promise<{ success: boolean; payload?: any; message?: string; isValid?: boolean; user?: User; permissions?: string[] }> {
    if (!this.initialized && !this.isInitializing) {
      await this.initialize();
    }

    try {
      // Simple token validation (in production, use proper JWT)
      const payload = this.decodeToken(token);
      if (!payload) {
        return { success: false, isValid: false, message: 'Invalid token format' };
      }

      // Check if token is expired
      if (payload.exp < Date.now()) {
        return { success: false, isValid: false, message: 'Token expired' };
      }

      // Get user details
      const user = await this.findUserById(payload.userId);
      if (!user || !user.isActive) {
        return { success: false, isValid: false, message: 'User not found or inactive' };
      }

      // Check if session exists and is active
      const session = this.data.sessions.find(s =>
        s.userId === user.id &&
        s.isActive &&
        s.expiresAt > new Date()
      );

      if (!session) {
        return { success: false, isValid: false, message: 'Session not found or expired' };
      }

      // Generate permissions based on role
      const permissions = this.generatePermissions(user.role || 'user');

      return {
        success: true,
        isValid: true,
        payload: {
          userId: user.id,
          email: user.email,
          role: user.role
        },
        user: { ...user, password: undefined },
        permissions
      };
    } catch (error) {
      console.error('Token validation error:', error);
      return { success: false, isValid: false, message: 'Token validation error' };
    }
  }

  // Private method that doesn't trigger initialization
  private _findUserByEmailSync(email: string): User | null {
    // Guard against undefined email
    if (!email) {
      return null;
    }

    return this.data.users.find(u => u.email && u.email.toLowerCase() === email.toLowerCase()) || null;
  }

  async findUserByEmail(email: string): Promise<User | null> {
    if (!this.initialized && !this.isInitializing) {
      if (!this.initialized && !this.isInitializing) { await this.initialize(); }
    }

    return this._findUserByEmailSync(email);
  }

  private async createSession(userId: string, token: string, refreshToken: string, metadata?: { ip?: string; userAgent?: string }): Promise<void> {
    try {
      const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const tokenHash = await hash(token, 10);
      const refreshTokenHash = await hash(refreshToken, 10);
      const expiresAt = new Date(Date.now() + 3600000); // 1 hour

      const session: UserSession = {
        id: sessionId,
        userId,
        tokenHash,
        refreshTokenHash,
        expiresAt,
        createdAt: new Date(),
        lastAccessed: new Date(),
        ipAddress: metadata?.ip,
        userAgent: metadata?.userAgent,
        isActive: true
      };

      this.data.sessions.push(session);
    } catch (error) {
      console.error('Create session error:', error);
    }
  }

  async generateToken(userId: string): Promise<{ success: boolean; token?: string; refreshToken?: string; message?: string }> {
    if (!this.initialized && !this.isInitializing) { await this.initialize(); }

    try {
      const user = this.data.users.find(u => u.id === userId);
      if (!user) {
        return {
          success: false,
          message: 'User not found'
        };
      }

      const token = this.generateUserToken(user);
      const refreshToken = this.generateRefreshToken(user);

      return {
        success: true,
        token,
        refreshToken
      };
    } catch (error) {
      console.error('Generate token error:', error);
      return {
        success: false,
        message: 'Failed to generate token'
      };
    }
  }

  private generateUserToken(user: User): string {
    // Simple token generation (in production, use proper JWT)
    const payload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      iat: Date.now(),
      exp: Date.now() + 3600000 // 1 hour
    };

    return Buffer.from(JSON.stringify(payload)).toString('base64');
  }

  private generateRefreshToken(user: User): string {
    const payload = {
      userId: user.id,
      type: 'refresh',
      iat: Date.now(),
      exp: Date.now() + 2592000000 // 30 days
    };

    return Buffer.from(JSON.stringify(payload)).toString('base64');
  }

  private decodeToken(token: string): any {
    try {
      const payload = JSON.parse(Buffer.from(token, 'base64').toString());
      return payload;
    } catch (error) {
      return null;
    }
  }

  private generatePermissions(role: string): string[] {
    const rolePermissions: Record<string, string[]> = {
      'super-admin': ['*'],
      'admin': ['users:*', 'system:read', 'audit:read'],
      'manager': ['users:read', 'users:update', 'team:*'],
      'user': ['profile:*', 'sessions:read'],
      'guest': ['auth:login', 'auth:register']
    };

    return rolePermissions[role] || rolePermissions['guest'];
  }

  private async logAudit(action: string, userId: string, details: any, status: 'success' | 'failure' | 'error'): Promise<void> {
    try {
      const auditEntry = {
        id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        action,
        resource: 'user_management',
        userId,
        details,
        timestamp: new Date(),
        severity: status === 'error' ? 'error' : status === 'failure' ? 'warning' : 'info',
        status
      };

      this.data.auditLogs.push(auditEntry);

      // Keep only last 1000 audit logs
      if (this.data.auditLogs.length > 1000) {
        this.data.auditLogs = this.data.auditLogs.slice(-1000);
      }
    } catch (error) {
      console.error('Audit logging error:', error);
    }
  }

  async getHealthStatus(): Promise<any> {
    try {
      if (!this.initialized) {
        return { status: 'not_initialized' };
      }

      const userCount = this.data.users.length;
      const activeSessionsCount = this.data.sessions.filter(s =>
        s.isActive && s.expiresAt > new Date()
      ).length;

      return {
        status: 'healthy',
        database: {
          connected: true,
          userCount,
          activeSessionsCount,
          storageType: 'file-based',
          storagePath: this.storagePath
        },
        metrics: this.data.metrics,
        features: ['authentication', 'user-management', 'session-management', 'audit-logging']
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Additional utility methods
  async getAllUsers(): Promise<User[]> {
    if (!this.initialized && !this.isInitializing) { await this.initialize(); }
    return this.data.users.map(user => ({ ...user, password: undefined }));
  }

  async getActiveSessions(userId?: string): Promise<UserSession[]> {
    if (!this.initialized && !this.isInitializing) { await this.initialize(); }

    const sessions = this.data.sessions.filter(s =>
      s.isActive &&
      s.expiresAt > new Date() &&
      (userId ? s.userId === userId : true)
    );

    return sessions;
  }

  async getMetrics(): Promise<any> {
    if (!this.initialized && !this.isInitializing) { await this.initialize(); }
    return {
      ...this.data.metrics,
      totalUsers: this.data.users.length,
      activeUsers: this.data.users.filter(u => u.isActive).length,
      totalSessions: this.data.sessions.length,
      activeSessions: this.data.sessions.filter(s => s.isActive && s.expiresAt > new Date()).length
    };
  }

  async getAuditLogs(limit: number = 100): Promise<any[]> {
    if (!this.initialized && !this.isInitializing) { await this.initialize(); }
    return this.data.auditLogs.slice(-limit);
  }

  async findUserById(userId: string): Promise<User | null> {
    if (!this.initialized && !this.isInitializing) { await this.initialize(); }

    const user = this.data.users.find(user => user.id === userId);
    if (!user) {
      return null;
    }

    // Return user without password
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async updateUserProfile(userId: string, updateData: { username?: string; profile?: { name?: string; avatar?: string } }): Promise<{ success: boolean; user?: User; message?: string }> {
    if (!this.initialized && !this.isInitializing) { await this.initialize(); }

    try {
      const userIndex = this.data.users.findIndex(u => u.id === userId);
      if (userIndex === -1) {
        return {
          success: false,
          message: 'User not found'
        };
      }

      // Update user data
      if (updateData.username) {
        this.data.users[userIndex].username = updateData.username;
      }

      if (updateData.profile) {
        this.data.users[userIndex].profile = {
          ...this.data.users[userIndex].profile,
          ...updateData.profile
        };
      }

      this.data.users[userIndex].updatedAt = new Date();

      // Log audit trail
      await this.logAudit('user_updated', userId, {
        updatedFields: Object.keys(updateData)
      }, 'success');

      this.saveData();

      // Return updated user without password
      const { password, ...userWithoutPassword } = this.data.users[userIndex];
      return {
        success: true,
        user: userWithoutPassword
      };
    } catch (error) {
      console.error('Update user profile error:', error);
      return {
        success: false,
        message: 'Failed to update user profile'
      };
    }
  }

  // === SECURITY METHODS ===

  /**
   * Validate password complexity requirements
   */
  validatePasswordStrength(password: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!password || password.length < PASSWORD_MIN_LENGTH) {
      errors.push(`Password must be at least ${PASSWORD_MIN_LENGTH} characters long`);
    }

    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }

    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }

    if (!/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }

    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }

    if (/(.)\1{2,}/.test(password)) {
      errors.push('Password cannot contain more than 2 consecutive identical characters');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Check for suspicious login patterns
   */
  async detectSuspiciousActivity(email: string, ipAddress?: string, userAgent?: string): Promise<boolean> {
    if (!this.initialized && !this.isInitializing) { await this.initialize(); }

    const user = this.data.users.find(u => u.email === email);
    if (!user) return false;

    // Check for rapid login attempts from different IPs
    const recentAttempts = this.data.auditLogs.filter(log =>
      log.userId === user.id &&
      log.action === 'login_attempt' &&
      new Date(log.timestamp).getTime() > Date.now() - (5 * 60 * 1000) // Last 5 minutes
    );

    if (recentAttempts.length > 10) {
      return true;
    }

    // Check for login from new IP address
    if (ipAddress && user.ipAddresses && !user.ipAddresses.includes(ipAddress)) {
      const recentIPs = this.data.auditLogs
        .filter(log => log.userId === user.id && log.metadata?.ipAddress)
        .slice(-5) // Last 5 logins
        .map(log => log.metadata?.ipAddress);

      if (recentIPs.length > 0 && !recentIPs.includes(ipAddress)) {
        // New IP detected
        await this.logAudit('suspicious_login_ip', user.id, {
          newIP: ipAddress,
          recentIPs
        }, 'warning');
        return true;
      }
    }

    return false;
  }

  /**
   * Check if account is locked due to failed attempts
   */
  isAccountLocked(user: User): boolean {
    if (!user.accountLockedUntil) return false;

    if (new Date() > user.accountLockedUntil) {
      // Lock has expired, reset failed attempts
      user.failedLoginAttempts = 0;
      user.accountLockedUntil = undefined;
      this.saveData();
      return false;
    }

    return true;
  }

  /**
   * Increment failed login attempts and lock account if necessary
   */
  async handleFailedLogin(email: string, ipAddress?: string): Promise<void> {
    if (!this.initialized && !this.isInitializing) { await this.initialize(); }

    const userIndex = this.data.users.findIndex(u => u.email === email);
    if (userIndex === -1) return;

    const user = this.data.users[userIndex];
    user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;

    if (user.failedLoginAttempts >= MAX_LOGIN_ATTEMPTS) {
      user.accountLockedUntil = new Date(Date.now() + ACCOUNT_LOCKOUT_DURATION);

      await this.logAudit('account_locked', user.id, {
        failedAttempts: user.failedLoginAttempts,
        lockoutDuration: ACCOUNT_LOCKOUT_DURATION,
        ipAddress
      }, 'warning');

      console.error(`Account locked for user ${email} due to ${user.failedLoginAttempts} failed attempts`);
    }

    this.saveData();
  }

  /**
   * Reset failed login attempts on successful login
   */
  async resetFailedAttempts(userId: string, ipAddress?: string): Promise<void> {
    if (!this.initialized && !this.isInitializing) { await this.initialize(); }

    const userIndex = this.data.users.findIndex(u => u.id === userId);
    if (userIndex === -1) return;

    const user = this.data.users[userIndex];
    user.failedLoginAttempts = 0;
    user.accountLockedUntil = undefined;
    user.lastLogin = new Date();

    // Track IP addresses for suspicious activity detection
    if (ipAddress) {
      if (!user.ipAddresses) user.ipAddresses = [];
      if (!user.ipAddresses.includes(ipAddress)) {
        user.ipAddresses.push(ipAddress);
        // Keep only last 10 IP addresses
        if (user.ipAddresses.length > 10) {
          user.ipAddresses = user.ipAddresses.slice(-10);
        }
      }
    }

    this.saveData();
  }

  /**
   * Sanitize user input to prevent XSS
   */
  sanitizeInput(input: string): string {
    if (typeof input !== 'string') return '';

    return input
      .replace(/[<>]/g, '') // Remove < and >
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\w+=/gi, '') // Remove event handlers like onclick=
      .replace(/script/gi, '') // Remove script tags
      .trim();
  }

  /**
   * Validate email format
   */
  validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) && !email.includes('<') && !email.includes('>');
  }

  /**
   * Check password against history to prevent reuse
   */
  async checkPasswordHistory(userId: string, newPassword: string): Promise<boolean> {
    if (!this.initialized && !this.isInitializing) { await this.initialize(); }

    const user = this.data.users.find(u => u.id === userId);
    if (!user || !user.passwordHistory) return true; // Allow if no history

    // Check against last 5 passwords
    for (const oldPasswordHash of user.passwordHistory.slice(-5)) {
      if (await compare(newPassword, oldPasswordHash)) {
        return false; // Password was used before
      }
    }

    return true;
  }

  /**
   * Add password to history
   */
  async addPasswordToHistory(userId: string, passwordHash: string): Promise<void> {
    if (!this.initialized && !this.isInitializing) { await this.initialize(); }

    const userIndex = this.data.users.findIndex(u => u.id === userId);
    if (userIndex === -1) return;

    const user = this.data.users[userIndex];
    if (!user.passwordHistory) user.passwordHistory = [];

    user.passwordHistory.push(passwordHash);

    // Keep only last 10 passwords
    if (user.passwordHistory.length > 10) {
      user.passwordHistory = user.passwordHistory.slice(-10);
    }

    user.lastPasswordChange = new Date();
    this.saveData();
  }

  async disconnect(): Promise<void> {
    if (this.initialized) {
      this.saveData();
      this.initialized = false;
      console.log('✅ Simple Auth Service disconnected');
    }
  }

  // Test utility method to clear all data
  async clearAllData(): Promise<void> {
    this.data = {
      users: [],
      sessions: [],
      auditLogs: [],
      metrics: {
        loginAttempts: 0,
        loginSuccess: 0,
        loginFailures: 0,
        userRegistrations: 0
      }
    };
    this.saveData();
  }
}
