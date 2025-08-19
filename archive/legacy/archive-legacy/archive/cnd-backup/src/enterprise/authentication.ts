// Enterprise Authentication Manager
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { AuthenticationContext, CNDConfig } from '../types.js';

export class AuthenticationManager {
  private config: CNDConfig['auth'];
  private activeSessions = new Map<string, AuthenticationContext>();

  constructor(config: CNDConfig['auth']) {
    this.config = config;
  }

  /**
   * Authenticate user with credentials
   */
  async authenticate(username: string, password: string): Promise<AuthenticationContext | null> {
    if (!this.config?.enabled) {
      throw new Error('Authentication is not enabled');
    }

    try {
      // Validate credentials based on provider
      const user = await this.validateCredentials(username, password);
      if (!user) {
        return null;
      }

      // Create session
      const sessionId = this.generateSessionId();
      const context: AuthenticationContext = {
        userId: user.id,
        sessionId,
        permissions: user.permissions || [],
        roles: user.roles || [],
        tenant: user.tenant,
        expiresAt: new Date(Date.now() + (24 * 60 * 60 * 1000)), // 24 hours
        metadata: {
          loginTime: new Date(),
          provider: this.config.provider,
          ipAddress: user.ipAddress
        }
      };

      this.activeSessions.set(sessionId, context);
      return context;
    } catch (error) {
      console.error('Authentication failed:', error);
      return null;
    }
  }

  /**
   * Authenticate with JWT token
   */
  async authenticateToken(token: string): Promise<AuthenticationContext | null> {
    if (!this.config?.enabled || this.config.provider !== 'jwt') {
      throw new Error('JWT authentication is not configured');
    }

    try {
      const decoded = jwt.verify(token, this.config.config.secret!) as any;

      const context: AuthenticationContext = {
        userId: decoded.sub,
        sessionId: decoded.jti || this.generateSessionId(),
        permissions: decoded.permissions || [],
        roles: decoded.roles || [],
        tenant: decoded.tenant,
        expiresAt: new Date(decoded.exp * 1000),
        metadata: {
          tokenType: 'jwt',
          issuer: decoded.iss,
          audience: decoded.aud
        }
      };

      return context;
    } catch (error) {
      console.error('JWT authentication failed:', error);
      return null;
    }
  }

  /**
   * Validate session
   */
  async validateSession(sessionId: string): Promise<AuthenticationContext | null> {
    const context = this.activeSessions.get(sessionId);
    if (!context) {
      return null;
    }

    if (context.expiresAt < new Date()) {
      this.activeSessions.delete(sessionId);
      return null;
    }

    return context;
  }

  /**
   * Check if user has permission
   */
  hasPermission(context: AuthenticationContext, permission: string): boolean {
    return context.permissions.includes(permission) || context.permissions.includes('*');
  }

  /**
   * Check if user has role
   */
  hasRole(context: AuthenticationContext, role: string): boolean {
    return context.roles.includes(role) || context.roles.includes('admin');
  }

  /**
   * Logout user
   */
  async logout(sessionId: string): Promise<boolean> {
    return this.activeSessions.delete(sessionId);
  }

  /**
   * Get active sessions count
   */
  getActiveSessionsCount(): number {
    return this.activeSessions.size;
  }

  /**
   * Cleanup expired sessions
   */
  async cleanupExpiredSessions(): Promise<void> {
    const now = new Date();
    for (const [sessionId, context] of this.activeSessions.entries()) {
      if (context.expiresAt < now) {
        this.activeSessions.delete(sessionId);
      }
    }
  }

  private async validateCredentials(username: string, password: string): Promise<any> {
    // This would integrate with your actual user store
    // For now, return a mock user for demonstration
    if (username === 'admin' && password === 'admin123') {
      return {
        id: 'admin',
        username: 'admin',
        permissions: ['*'],
        roles: ['admin'],
        tenant: 'default'
      };
    }
    return null;
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generate JWT token
   */
  generateJWT(userId: string, permissions: string[], roles: string[], tenant?: string): string {
    if (!this.config?.enabled || this.config.provider !== 'jwt') {
      throw new Error('JWT authentication is not configured');
    }

    const payload = {
      sub: userId,
      permissions,
      roles,
      tenant,
      iss: this.config.config.issuer,
      aud: this.config.config.audience,
      jti: this.generateSessionId()
    };

    return jwt.sign(payload, this.config.config.secret!, {
      expiresIn: '24h',
      algorithm: this.config.config.algorithms?.[0] as any || 'HS256'
    });
  }
}
