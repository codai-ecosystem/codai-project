/**
 * Simple Authentication Service for ID Service
 * Real implementation using in-memory storage for development
 * Production would use proper database
 */

import { compare, hash } from 'bcryptjs';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

export interface User {
  id: string;
  username: string;
  email: string;
  password?: string;
  profile: {
    name?: string;
    avatar?: string;
  };
  createdAt: Date;
  updatedAt: Date;
  lastLogin?: Date;
  isActive: boolean;
  emailVerified: boolean;
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
}

export interface AuthenticationResult {
  success: boolean;
  user?: User;
  token?: string;
  refreshToken?: string;
  message?: string;
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
        isActive: true,
        isVerified: true,
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
        isActive: true,
        isVerified: true,
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
      await this.ensureInitialized();
    }

    try {
      // Check if user already exists - use sync version during initialization
      let existingUser: User | null = null;
      if (this.isInitializing) {
        existingUser = this._findUserByEmailSync(userData.email);
      } else {
        existingUser = await this.findUserByEmail(userData.email);
      }

      if (existingUser) {
        throw new Error('User with this email already exists');
      }

      // Hash password
      const hashedPassword = await hash(userData.password, 12);

      // Create user ID
      const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      const newUser: User = {
        id: userId,
        username: userData.username,
        email: userData.email,
        password: hashedPassword,
        profile: userData.profile || { name: userData.username },
        isActive: true,
        emailVerified: false,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      this.data.users.push(newUser);
      this.data.metrics.userRegistrations++;
      
      // Log audit trail
      await this.logAudit('user_created', userId, {
        email: userData.email,
        username: userData.username
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
    await this.ensureInitialized();

    try {
      // Record login attempt
      this.data.metrics.loginAttempts++;

      // Find user by email
      const user = await this.findUserByEmail(credentials.email);
      if (!user || !user.password) {
        await this.logAudit('login_failed', 'unknown', {
          email: credentials.email,
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

      // Check if user is active
      if (!user.isActive) {
        await this.logAudit('login_failed', user.id, {
          email: credentials.email,
          reason: 'account_inactive',
          ip: metadata?.ip
        }, 'failure');

        return {
          success: false,
          message: 'Account is inactive'
        };
      }

      // Verify password
      const isPasswordValid = await compare(credentials.password, user.password);
      if (!isPasswordValid) {
        await this.logAudit('login_failed', user.id, {
          email: credentials.email,
          reason: 'invalid_password',
          ip: metadata?.ip
        }, 'failure');

        this.data.metrics.loginFailures++;
        this.saveData();

        return {
          success: false,
          message: 'Invalid email or password'
        };
      }

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
        email: credentials.email,
        ip: metadata?.ip,
        userAgent: metadata?.userAgent
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

  async validateToken(token: string): Promise<{ isValid: boolean; user?: User; permissions?: string[] }> {
    await this.ensureInitialized();

    try {
      // Simple token validation (in production, use proper JWT)
      const payload = this.decodeToken(token);
      if (!payload) {
        return { isValid: false };
      }

      // Check if token is expired
      if (payload.exp < Date.now()) {
        return { isValid: false };
      }

      // Get user details
      const user = await this.findUserById(payload.userId);
      if (!user || !user.isActive) {
        return { isValid: false };
      }

      // Check if session exists and is active
      const session = this.data.sessions.find(s => 
        s.userId === user.id && 
        s.isActive && 
        s.expiresAt > new Date()
      );

      if (!session) {
        return { isValid: false };
      }

      // Generate permissions based on role
      const permissions = this.generatePermissions(user.role);

      return {
        isValid: true,
        user: { ...user, password: undefined },
        permissions
      };
    } catch (error) {
      console.error('Token validation error:', error);
      return { isValid: false };
    }
  }

  async validateToken(token: string): Promise<{ success: boolean; payload?: any; message?: string }> {
    await this.ensureInitialized();

    try {
      const payload = this.decodeToken(token);
      if (!payload) {
        return {
          success: false,
          message: 'Invalid token format'
        };
      }

      // Check if token is expired
      if (payload.exp < Date.now()) {
        return {
          success: false,
          message: 'Token expired'
        };
      }

      // Check if user still exists and is active
      const user = this.data.users.find(u => u.id === payload.userId);
      if (!user || !user.isActive) {
        return {
          success: false,
          message: 'User not found or inactive'
        };
      }

      return {
        success: true,
        payload
      };
    } catch (error) {
      console.error('Validate token error:', error);
      return {
        success: false,
        message: 'Token validation failed'
      };
    }
  }

  async findUserById(userId: string): Promise<User | null> {
    if (!this.initialized && !this.isInitializing) {
      await this.ensureInitialized();
    }

    const user = this.data.users.find(u => u.id === userId);
    return user || null;
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
      await this.ensureInitialized();
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
    await this.ensureInitialized();

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

  private async ensureInitialized(): Promise<void> {
    if (!this.initialized) {
      await this.initialize();
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
    await this.ensureInitialized();
    return this.data.users.map(user => ({ ...user, password: undefined }));
  }

  async getActiveSessions(userId?: string): Promise<UserSession[]> {
    await this.ensureInitialized();
    
    const sessions = this.data.sessions.filter(s => 
      s.isActive && 
      s.expiresAt > new Date() &&
      (userId ? s.userId === userId : true)
    );

    return sessions;
  }

  async getMetrics(): Promise<any> {
    await this.ensureInitialized();
    return {
      ...this.data.metrics,
      totalUsers: this.data.users.length,
      activeUsers: this.data.users.filter(u => u.isActive).length,
      totalSessions: this.data.sessions.length,
      activeSessions: this.data.sessions.filter(s => s.isActive && s.expiresAt > new Date()).length
    };
  }

  async getAuditLogs(limit: number = 100): Promise<any[]> {
    await this.ensureInitialized();
    return this.data.auditLogs.slice(-limit);
  }

  async findUserById(userId: string): Promise<User | null> {
    await this.ensureInitialized();
    
    const user = this.data.users.find(user => user.id === userId);
    if (!user) {
      return null;
    }

    // Return user without password
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async updateUserProfile(userId: string, updateData: { username?: string; profile?: { name?: string; avatar?: string } }): Promise<{ success: boolean; user?: User; message?: string }> {
    await this.ensureInitialized();

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

  async disconnect(): Promise<void> {
    if (this.initialized) {
      this.saveData();
      this.initialized = false;
      console.log('✅ Simple Auth Service disconnected');
    }
  }
}
