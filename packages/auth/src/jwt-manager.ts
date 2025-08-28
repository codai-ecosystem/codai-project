import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { User, UserRole, TokenPair } from './auth.types';
import { AuthConfig } from './auth.config';

export class JWTManager {
  private config: AuthConfig;

  constructor(config: AuthConfig) {
    this.config = config;
  }

  /**
   * Generate JWT access and refresh token pair
   */
  generateTokenPair(user: User): TokenPair {
    const payload = {
      userId: user.id,
      email: user.email,
      roles: user.roles,
      permissions: user.permissions,
      isEmailVerified: user.isEmailVerified,
      isMfaEnabled: user.isMfaEnabled,
    };

    const accessToken = jwt.sign(payload, this.config.jwt.accessTokenSecret, {
      expiresIn: this.config.jwt.accessTokenExpiry,
      issuer: this.config.jwt.issuer,
      audience: this.config.jwt.audience,
    });

    const refreshToken = jwt.sign(
      { userId: user.id, tokenVersion: user.tokenVersion },
      this.config.jwt.refreshTokenSecret,
      {
        expiresIn: this.config.jwt.refreshTokenExpiry,
        issuer: this.config.jwt.issuer,
        audience: this.config.jwt.audience,
      }
    );

    return {
      accessToken,
      refreshToken,
      expiresIn: this.config.jwt.accessTokenExpiry,
      tokenType: 'Bearer',
    };
  }

  /**
   * Verify and decode JWT token
   */
  verifyAccessToken(token: string): any {
    try {
      return jwt.verify(token, this.config.jwt.accessTokenSecret, {
        issuer: this.config.jwt.issuer,
        audience: this.config.jwt.audience,
      });
    } catch (error: any) {
      throw new Error(`Invalid access token: ${error?.message || 'Unknown error'}`);
    }
  }

  /**
   * Verify refresh token
   */
  verifyRefreshToken(token: string): any {
    try {
      return jwt.verify(token, this.config.jwt.refreshTokenSecret, {
        issuer: this.config.jwt.issuer,
        audience: this.config.jwt.audience,
      });
    } catch (error) {
      throw new Error(`Invalid refresh token: ${error.message}`);
    }
  }

  /**
   * Generate secure random token for email verification, password reset, etc.
   */
  generateSecureToken(length: number = 32): string {
    return crypto.randomBytes(length).toString('hex');
  }

  /**
   * Hash password using bcrypt
   */
  async hashPassword(password: string): Promise<string> {
    const saltRounds = this.config.security.bcryptRounds;
    return bcrypt.hash(password, saltRounds);
  }

  /**
   * Verify password against hash
   */
  async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  /**
   * Generate password reset token
   */
  generatePasswordResetToken(userId: string): string {
    const payload = {
      userId,
      type: 'password_reset',
      timestamp: Date.now(),
    };

    return jwt.sign(payload, this.config.jwt.passwordResetSecret, {
      expiresIn: '1h',
      issuer: this.config.jwt.issuer,
    });
  }

  /**
   * Verify password reset token
   */
  verifyPasswordResetToken(token: string): any {
    try {
      return jwt.verify(token, this.config.jwt.passwordResetSecret, {
        issuer: this.config.jwt.issuer,
      });
    } catch (error) {
      throw new Error(`Invalid password reset token: ${error.message}`);
    }
  }

  /**
   * Generate email verification token
   */
  generateEmailVerificationToken(userId: string, email: string): string {
    const payload = {
      userId,
      email,
      type: 'email_verification',
      timestamp: Date.now(),
    };

    return jwt.sign(payload, this.config.jwt.emailVerificationSecret, {
      expiresIn: '24h',
      issuer: this.config.jwt.issuer,
    });
  }

  /**
   * Verify email verification token
   */
  verifyEmailVerificationToken(token: string): any {
    try {
      return jwt.verify(token, this.config.jwt.emailVerificationSecret, {
        issuer: this.config.jwt.issuer,
      });
    } catch (error) {
      throw new Error(`Invalid email verification token: ${error.message}`);
    }
  }

  /**
   * Extract token from Authorization header
   */
  extractTokenFromHeader(authorization?: string): string | null {
    if (!authorization || !authorization.startsWith('Bearer ')) {
      return null;
    }
    return authorization.substring(7);
  }

  /**
   * Create session data for storage
   */
  createSessionData(user: User, ipAddress: string, userAgent: string) {
    return {
      userId: user.id,
      ipAddress,
      userAgent,
      createdAt: new Date(),
      lastAccessedAt: new Date(),
      isActive: true,
    };
  }
}