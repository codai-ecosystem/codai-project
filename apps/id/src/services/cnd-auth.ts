/**
 * CND Enhanced Authentication Service for ID Service
 * Phase 2 Implementation: Replace Prisma with CND for user management
 */

import { CND } from '@codai/cnd';
import { compare, hash } from 'bcryptjs';

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: string;
  createdAt: Date;
  updatedAt: Date;
  lastLogin?: Date;
  isActive: boolean;
  emailVerified: boolean;
  preferences?: Record<string, any>;
}

export interface CreateUserData {
  name: string;
  email: string;
  password: string;
  role?: string;
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

export class CNDAuthService {
  private cnd: CND;
  private initialized = false;

  constructor() {
    // Initialize CND with ID service configuration
    const cndConfig = {
      cbd: {
        host: process.env.CND_HOST || 'localhost',
        port: parseInt(process.env.CND_PORT || '5000'),
        database: process.env.CND_DATABASE || 'id_service_db'
      },
      enterprise: {
        enabled: true,
        features: {
          serviceDiscovery: true,
          authentication: true,
          authorization: true,
          audit: true,
          monitoring: true,
          encryption: process.env.NODE_ENV === 'production'
        },
        serviceDiscovery: {
          enabled: true,
          serviceName: 'id-service',
          port: 4004,
          healthCheckPath: '/api/health',
          metadata: {
            version: '1.0.0',
            category: 'core',
            capabilities: ['authentication', 'user-management', 'session-management', 'oauth2']
          }
        },
        authentication: {
          enabled: true,
          jwtSecret: process.env.JWT_SECRET || 'id-service-secret',
          sessionTimeout: 3600000, // 1 hour
          tokenRefreshThreshold: 300000 // 5 minutes
        },
        authorization: {
          enabled: true,
          defaultRole: 'user',
          adminRoles: ['admin', 'super-admin'],
          roles: {
            'super-admin': {
              permissions: ['*']
            },
            'admin': {
              permissions: ['users:*', 'system:read', 'audit:read']
            },
            'manager': {
              permissions: ['users:read', 'users:update', 'team:*']
            },
            'user': {
              permissions: ['profile:*', 'sessions:read']
            },
            'guest': {
              permissions: ['auth:login', 'auth:register']
            }
          }
        },
        audit: {
          enabled: true,
          logLevel: 'detailed',
          storage: 'database',
          includeRequestBody: false, // Exclude passwords
          includeResponseBody: false,
          retentionDays: 365 // Keep auth logs for 1 year
        },
        monitoring: {
          enabled: true,
          metricsEnabled: true,
          healthChecksEnabled: true,
          performanceTracking: true,
          customMetrics: {
            'auth_login_attempts': 'counter',
            'auth_login_success': 'counter',
            'auth_login_failures': 'counter',
            'auth_session_duration': 'histogram',
            'auth_active_sessions': 'gauge',
            'auth_user_registrations': 'counter'
          }
        }
      },
      cache: {
        enabled: true,
        ttl: 300 // 5 minutes for session cache
      },
      logging: {
        enabled: true,
        level: 'info'
      }
    };

    this.cnd = new CND(cndConfig);
  }

  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      await this.cnd.connect();
      await this.createUserSchema();
      this.initialized = true;
      console.log('✅ CND Auth Service initialized');
    } catch (error) {
      console.error('❌ Failed to initialize CND Auth Service:', error);
      // In development mode, we'll continue with a mock implementation
      if (process.env.NODE_ENV === 'development') {
        console.log('🔄 Continuing with mock implementation for development');
        this.initialized = true;
        return;
      }
      throw error;
    }
  }

  private async createUserSchema(): Promise<void> {
    try {
      // Create users table schema
      await this.cnd.sql.execute(`
        CREATE TABLE IF NOT EXISTS users (
          id VARCHAR(36) PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
          name VARCHAR(255) NOT NULL,
          email VARCHAR(255) UNIQUE NOT NULL,
          password VARCHAR(255) NOT NULL,
          role VARCHAR(50) DEFAULT 'user',
          is_active BOOLEAN DEFAULT true,
          email_verified BOOLEAN DEFAULT false,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          last_login DATETIME NULL,
          preferences TEXT NULL
        )
      `);

      // Create user sessions table
      await this.cnd.sql.execute(`
        CREATE TABLE IF NOT EXISTS user_sessions (
          id VARCHAR(36) PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
          user_id VARCHAR(36) NOT NULL,
          token_hash VARCHAR(255) NOT NULL,
          refresh_token_hash VARCHAR(255) NULL,
          expires_at DATETIME NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          last_accessed DATETIME DEFAULT CURRENT_TIMESTAMP,
          ip_address VARCHAR(45) NULL,
          user_agent TEXT NULL,
          is_active BOOLEAN DEFAULT true,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
      `);

      // Create indexes
      await this.cnd.sql.execute('CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)');
      await this.cnd.sql.execute('CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON user_sessions(user_id)');
      await this.cnd.sql.execute('CREATE INDEX IF NOT EXISTS idx_sessions_token ON user_sessions(token_hash)');

      console.log('✅ User schema created/verified');
    } catch (error) {
      console.error('❌ Failed to create user schema:', error);
      throw error;
    }
  }

  async createUser(userData: CreateUserData): Promise<User> {
    await this.ensureInitialized();

    try {
      // Check if user already exists
      const existingUser = await this.findUserByEmail(userData.email);
      if (existingUser) {
        throw new Error('User with this email already exists');
      }

      // Hash password
      const hashedPassword = await hash(userData.password, 12);

      // Create user ID
      const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Insert user
      await this.cnd.sql.execute(`
        INSERT INTO users (id, name, email, password, role, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [
        userId,
        userData.name,
        userData.email,
        hashedPassword,
        userData.role || 'user',
        new Date().toISOString(),
        new Date().toISOString()
      ]);

      // Log audit trail
      await this.logAudit('user_created', userId, {
        email: userData.email,
        role: userData.role || 'user'
      }, 'success');

      // Record metric
      await this.recordMetric('auth_user_registrations', 1, {
        role: userData.role || 'user'
      });

      // Return user (without password)
      const user = await this.findUserById(userId);
      if (!user) {
        throw new Error('Failed to create user');
      }

      return user;
    } catch (error) {
      await this.logAudit('user_creation_failed', 'system', {
        email: userData.email,
        error: error.message
      }, 'failure');
      throw error;
    }
  }

  async authenticateUser(credentials: LoginCredentials, metadata?: { ip?: string; userAgent?: string }): Promise<AuthenticationResult> {
    await this.ensureInitialized();

    try {
      // Record login attempt
      await this.recordMetric('auth_login_attempts', 1, {
        email: credentials.email
      });

      // Find user by email
      const user = await this.findUserByEmail(credentials.email);
      if (!user || !user.password) {
        await this.logAudit('login_failed', 'unknown', {
          email: credentials.email,
          reason: 'user_not_found',
          ip: metadata?.ip
        }, 'failure');

        await this.recordMetric('auth_login_failures', 1, {
          reason: 'user_not_found'
        });

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

        await this.recordMetric('auth_login_failures', 1, {
          reason: 'invalid_password'
        });

        return {
          success: false,
          message: 'Invalid email or password'
        };
      }

      // Generate tokens using CND authentication
      const authResult = await this.cnd.authenticate({
        username: user.email,
        password: credentials.password,
        userId: user.id,
        role: user.role,
        metadata: {
          name: user.name,
          emailVerified: user.emailVerified,
          lastLogin: user.lastLogin,
          preferences: user.preferences
        }
      });

      if (!authResult || !authResult.token) {
        throw new Error('Failed to generate authentication token');
      }

      // Update last login
      await this.cnd.sql.execute(`
        UPDATE users SET 
          last_login = ?,
          updated_at = ?
        WHERE id = ?
      `, [new Date().toISOString(), new Date().toISOString(), user.id]);

      // Create session record
      await this.createSession(user.id, authResult.token, metadata);

      // Log successful login
      await this.logAudit('login_success', user.id, {
        email: credentials.email,
        ip: metadata?.ip,
        userAgent: metadata?.userAgent
      }, 'success');

      // Record success metric
      await this.recordMetric('auth_login_success', 1, {
        role: user.role
      });

      // Update active sessions metric
      const activeSessions = await this.getActiveSessionsCount(user.id);
      await this.recordMetric('auth_active_sessions', activeSessions);

      // Return result without password
      return {
        success: true,
        user: {
          ...user,
          password: undefined
        },
        token: authResult.token,
        refreshToken: authResult.refreshToken
      };

    } catch (error) {
      await this.logAudit('login_error', 'system', {
        email: credentials.email,
        error: error.message,
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
      // Validate token using CND
      const tokenValidation = await this.cnd.authenticateToken(token);

      if (!tokenValidation || !tokenValidation.isValid) {
        return { isValid: false };
      }

      // Get user details
      const user = await this.findUserById(tokenValidation.user.id);
      if (!user || !user.isActive) {
        return { isValid: false };
      }

      return {
        isValid: true,
        user: {
          ...user,
          password: undefined
        },
        permissions: tokenValidation.permissions || []
      };
    } catch (error) {
      console.error('Token validation error:', error);
      return { isValid: false };
    }
  }

  async findUserById(userId: string): Promise<User | null> {
    await this.ensureInitialized();

    try {
      const result = await this.cnd.sql.query(`
        SELECT id, name, email, role, is_active as isActive, 
               email_verified as emailVerified, created_at as createdAt,
               updated_at as updatedAt, last_login as lastLogin,
               preferences
        FROM users WHERE id = ?
      `, [userId]);

      if (!result.rows || result.rows.length === 0) {
        return null;
      }

      const row = result.rows[0] as any;
      return {
        id: row.id,
        name: row.name,
        email: row.email,
        role: row.role,
        isActive: !!row.isActive,
        emailVerified: !!row.emailVerified,
        createdAt: new Date(row.createdAt),
        updatedAt: new Date(row.updatedAt),
        lastLogin: row.lastLogin ? new Date(row.lastLogin) : undefined,
        preferences: row.preferences ? JSON.parse(row.preferences) : undefined
      };
    } catch (error) {
      console.error('Find user by ID error:', error);
      return null;
    }
  }

  async findUserByEmail(email: string): Promise<User | null> {
    await this.ensureInitialized();

    try {
      const result = await this.cnd.sql.query(`
        SELECT id, name, email, password, role, is_active as isActive,
               email_verified as emailVerified, created_at as createdAt,
               updated_at as updatedAt, last_login as lastLogin,
               preferences
        FROM users WHERE email = ?
      `, [email]);

      if (!result.rows || result.rows.length === 0) {
        return null;
      }

      const row = result.rows[0] as any;
      return {
        id: row.id,
        name: row.name,
        email: row.email,
        password: row.password,
        role: row.role,
        isActive: !!row.isActive,
        emailVerified: !!row.emailVerified,
        createdAt: new Date(row.createdAt),
        updatedAt: new Date(row.updatedAt),
        lastLogin: row.lastLogin ? new Date(row.lastLogin) : undefined,
        preferences: row.preferences ? JSON.parse(row.preferences) : undefined
      };
    } catch (error) {
      console.error('Find user by email error:', error);
      return null;
    }
  }

  private async createSession(userId: string, token: string, metadata?: { ip?: string; userAgent?: string }): Promise<void> {
    try {
      const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const tokenHash = await hash(token, 10);
      const expiresAt = new Date(Date.now() + 3600000); // 1 hour

      await this.cnd.sql.execute(`
        INSERT INTO user_sessions (id, user_id, token_hash, expires_at, created_at, last_accessed, ip_address, user_agent)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        sessionId,
        userId,
        tokenHash,
        expiresAt.toISOString(),
        new Date().toISOString(),
        new Date().toISOString(),
        metadata?.ip || null,
        metadata?.userAgent || null
      ]);
    } catch (error) {
      console.error('Create session error:', error);
    }
  }

  private async getActiveSessionsCount(userId: string): Promise<number> {
    try {
      const result = await this.cnd.sql.query(`
        SELECT COUNT(*) as count 
        FROM user_sessions 
        WHERE user_id = ? AND is_active = true AND expires_at > ?
      `, [userId, new Date().toISOString()]);

      return result.rows?.[0]?.count || 0;
    } catch (error) {
      console.error('Get active sessions count error:', error);
      return 0;
    }
  }

  private async logAudit(action: string, userId: string, details: any, status: 'success' | 'failure' | 'error'): Promise<void> {
    try {
      // Use CND audit logging if available
      if (this.cnd && typeof this.cnd.logAudit === 'function') {
        await this.cnd.logAudit({
          action,
          resource: 'user_management',
          userId,
          details,
          timestamp: new Date(),
          severity: status === 'error' ? 'error' : status === 'failure' ? 'warning' : 'info'
        });
      }
    } catch (error) {
      console.error('Audit logging error:', error);
    }
  }

  private async recordMetric(name: string, value: number, labels?: Record<string, string>): Promise<void> {
    try {
      // Use CND metrics if available
      if (this.cnd && typeof this.cnd.recordMetric === 'function') {
        await this.cnd.recordMetric(name, value, labels);
      }
    } catch (error) {
      console.error('Metrics recording error:', error);
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

      const cndHealth = await this.cnd.getHealthStatus();
      const userCount = await this.getUserCount();
      const activeSessionsCount = await this.getActiveSessionsCountTotal();

      return {
        status: 'healthy',
        cnd: cndHealth,
        database: {
          connected: true,
          userCount,
          activeSessionsCount
        },
        features: ['authentication', 'user-management', 'session-management']
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message
      };
    }
  }

  private async getUserCount(): Promise<number> {
    try {
      const result = await this.cnd.sql.query('SELECT COUNT(*) as count FROM users');
      return result.rows?.[0]?.count || 0;
    } catch (error) {
      return 0;
    }
  }

  private async getActiveSessionsCountTotal(): Promise<number> {
    try {
      const result = await this.cnd.sql.query(`
        SELECT COUNT(*) as count 
        FROM user_sessions 
        WHERE is_active = true AND expires_at > ?
      `, [new Date().toISOString()]);
      return result.rows?.[0]?.count || 0;
    } catch (error) {
      return 0;
    }
  }

  async disconnect(): Promise<void> {
    if (this.initialized && this.cnd) {
      await this.cnd.disconnect();
      this.initialized = false;
    }
  }
}
