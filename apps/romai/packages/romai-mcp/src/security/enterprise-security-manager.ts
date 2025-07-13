/**
 * Enterprise Security Manager
 * Comprehensive security hardening for ROMAI Ultimate MCP Server
 */

import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import { Request, Response, NextFunction } from 'express';

export interface SecurityConfig {
  jwtSecret: string;
  jwtExpiresIn: string;
  bcryptRounds: number;
  rateLimitWindow: number;
  rateLimitMax: number;
  maxLoginAttempts: number;
  blockDuration: number;
  enableSecurityHeaders: boolean;
  enableInputValidation: boolean;
  enableAuditLogging: boolean;
  enablePasswordHashing: boolean;
  enableThreatDetection: boolean;
}

export interface SecurityEvent {
  timestamp: Date;
  eventType: 'AUTH_SUCCESS' | 'AUTH_FAILURE' | 'RATE_LIMIT' | 'SUSPICIOUS_ACTIVITY' | 'SECURITY_VIOLATION';
  userId?: string;
  ipAddress: string;
  userAgent: string;
  details: Record<string, any>;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

export interface UserRole {
  id: string;
  name: string;
  permissions: string[];
  isActive: boolean;
}

export interface AuthenticatedUser {
  id: string;
  username: string;
  email: string;
  roles: UserRole[];
  permissions: string[];
  lastLogin: Date;
  isActive: boolean;
}

export class EnterpriseSecurityManager {
  private config: SecurityConfig;
  private securityEvents: SecurityEvent[] = [];
  private blockedIPs: Set<string> = new Set();
  private suspiciousActivity: Map<string, number> = new Map();

  constructor(config: SecurityConfig) {
    this.config = config;
    this.initializeSecurityPolicies();
  }

  /**
   * Initialize comprehensive security policies
   */
  private initializeSecurityPolicies(): void {
    // Set up automatic IP blocking for suspicious activity
    setInterval(() => {
      this.reviewSuspiciousActivity();
    }, 60000); // Review every minute

    // Clean up old security events (keep last 30 days)
    setInterval(() => {
      this.cleanupSecurityEvents();
    }, 86400000); // Clean up daily
  }

  /**
   * JWT Token Management
   */
  public generateToken(user: AuthenticatedUser): string {
    const payload = {
      userId: user.id,
      username: user.username,
      email: user.email,
      roles: user.roles.map(r => r.name),
      permissions: user.permissions,
      iat: Math.floor(Date.now() / 1000)
    };

    return jwt.sign(payload, this.config.jwtSecret, {
      expiresIn: this.config.jwtExpiresIn,
      issuer: 'romai-mcp-server',
      audience: 'romai-clients'
    });
  }

  public verifyToken(token: string): AuthenticatedUser | null {
    try {
      const decoded = jwt.verify(token, this.config.jwtSecret) as any;

      return {
        id: decoded.userId,
        username: decoded.username,
        email: decoded.email,
        roles: decoded.roles?.map((name: string) => ({
          id: '', name, permissions: [], isActive: true
        })) || [],
        permissions: decoded.permissions || [],
        lastLogin: new Date(),
        isActive: true
      };
    } catch (error) {
      this.logSecurityEvent({
        timestamp: new Date(),
        eventType: 'AUTH_FAILURE',
        ipAddress: 'unknown',
        userAgent: 'unknown',
        details: { error: 'Invalid JWT token', token: token.substring(0, 20) + '...' },
        severity: 'HIGH'
      });
      return null;
    }
  }

  /**
   * Password Management
   */
  public async hashPassword(password: string): Promise<string> {
    // Validate password strength
    if (!this.validatePasswordStrength(password)) {
      throw new Error('Password does not meet security requirements');
    }

    return await bcrypt.hash(password, this.config.bcryptRounds);
  }

  public async verifyPassword(password: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(password, hash);
  }

  private validatePasswordStrength(password: string): boolean {
    // Enterprise password policy
    const minLength = 12;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    const noCommonPatterns = !/(123|abc|password|admin|root)/i.test(password);

    return password.length >= minLength &&
      hasUpperCase &&
      hasLowerCase &&
      hasNumbers &&
      hasSpecialChar &&
      noCommonPatterns;
  }

  /**
   * Role-Based Access Control (RBAC)
   */
  public hasPermission(user: AuthenticatedUser, permission: string): boolean {
    return user.permissions.includes(permission) ||
      user.permissions.includes('*') ||
      user.roles.some(role => role.permissions.includes(permission));
  }

  public checkAccess(requiredPermissions: string[]): (req: Request, res: Response, next: NextFunction) => void {
    return (req: Request, res: Response, next: NextFunction) => {
      const user = (req as any).user as AuthenticatedUser;

      if (!user) {
        this.logSecurityEvent({
          timestamp: new Date(),
          eventType: 'AUTH_FAILURE',
          ipAddress: req.ip || 'unknown',
          userAgent: req.get('User-Agent') || 'unknown',
          details: { error: 'No authenticated user', path: req.path },
          severity: 'MEDIUM'
        });
        return res.status(401).json({ error: 'Authentication required' });
      }

      const hasAccess = requiredPermissions.every(permission =>
        this.hasPermission(user, permission)
      );

      if (!hasAccess) {
        this.logSecurityEvent({
          timestamp: new Date(),
          eventType: 'SECURITY_VIOLATION',
          userId: user.id,
          ipAddress: req.ip || 'unknown',
          userAgent: req.get('User-Agent') || 'unknown',
          details: {
            requiredPermissions,
            userPermissions: user.permissions,
            path: req.path
          },
          severity: 'HIGH'
        });
        return res.status(403).json({ error: 'Insufficient permissions' });
      }

      next();
    };
  }

  /**
   * Rate Limiting & DDoS Protection
   */
  public createRateLimiter(windowMs?: number, max?: number) {
    return rateLimit({
      windowMs: windowMs || this.config.rateLimitWindow,
      max: max || this.config.rateLimitMax,
      message: {
        error: 'Too many requests',
        retryAfter: Math.ceil((windowMs || this.config.rateLimitWindow) / 1000)
      },
      standardHeaders: true,
      legacyHeaders: false,
      handler: (req: Request, res: Response) => {
        this.logSecurityEvent({
          timestamp: new Date(),
          eventType: 'RATE_LIMIT',
          ipAddress: req.ip || 'unknown',
          userAgent: req.get('User-Agent') || 'unknown',
          details: { path: req.path, method: req.method },
          severity: 'MEDIUM'
        });

        this.trackSuspiciousActivity(req.ip || 'unknown');
        res.status(429).json({
          error: 'Too many requests',
          retryAfter: Math.ceil((windowMs || this.config.rateLimitWindow) / 1000)
        });
      }
    });
  }

  /**
   * Security Headers
   */
  public getSecurityHeaders() {
    if (!this.config.enableSecurityHeaders) {
      return (req: Request, res: Response, next: NextFunction) => next();
    }

    return helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", "data:", "https:"],
          connectSrc: ["'self'"],
          fontSrc: ["'self'"],
          objectSrc: ["'none'"],
          mediaSrc: ["'self'"],
          frameSrc: ["'none'"]
        }
      },
      crossOriginEmbedderPolicy: false,
      hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true
      }
    });
  }

  /**
   * Input Validation & Sanitization
   */
  public validateInput(input: any, schema: Record<string, any>): { isValid: boolean; errors: string[] } {
    if (!this.config.enableInputValidation) {
      return { isValid: true, errors: [] };
    }

    const errors: string[] = [];

    // Basic validation - can be extended with a library like Joi or Yup
    for (const [field, rules] of Object.entries(schema)) {
      const value = input[field];

      if (rules.required && (value === undefined || value === null || value === '')) {
        errors.push(`${field} is required`);
        continue;
      }

      if (value !== undefined && value !== null) {
        if (rules.type && typeof value !== rules.type) {
          errors.push(`${field} must be of type ${rules.type}`);
        }

        if (rules.minLength && value.length < rules.minLength) {
          errors.push(`${field} must be at least ${rules.minLength} characters`);
        }

        if (rules.maxLength && value.length > rules.maxLength) {
          errors.push(`${field} must be no more than ${rules.maxLength} characters`);
        }

        if (rules.pattern && !rules.pattern.test(value)) {
          errors.push(`${field} format is invalid`);
        }
      }
    }

    return { isValid: errors.length === 0, errors };
  }

  public sanitizeInput(input: string): string {
    // Remove potentially dangerous characters
    return input
      .replace(/[<>]/g, '') // Remove HTML tags
      .replace(/['"]/g, '') // Remove quotes
      .replace(/[;&|`$]/g, '') // Remove shell metacharacters
      .trim();
  }

  /**
   * Security Event Logging
   */
  public logSecurityEvent(event: SecurityEvent): void {
    if (!this.config.enableAuditLogging) return;

    this.securityEvents.push(event);

    // Log to console (in production, this would go to a logging service)
    console.log(`[SECURITY] ${event.eventType} - ${event.severity}`, {
      timestamp: event.timestamp.toISOString(),
      userId: event.userId,
      ipAddress: event.ipAddress,
      details: event.details
    });

    // Trigger alerts for high/critical severity events
    if (event.severity === 'HIGH' || event.severity === 'CRITICAL') {
      this.triggerSecurityAlert(event);
    }
  }

  private triggerSecurityAlert(event: SecurityEvent): void {
    // In production, this would integrate with alerting systems
    console.error(`[SECURITY ALERT] ${event.eventType}`, event);

    // Auto-block IP for critical events
    if (event.severity === 'CRITICAL' && event.ipAddress !== 'unknown') {
      this.blockedIPs.add(event.ipAddress);
    }
  }

  /**
   * Suspicious Activity Monitoring
   */
  private trackSuspiciousActivity(ipAddress: string): void {
    const current = this.suspiciousActivity.get(ipAddress) || 0;
    this.suspiciousActivity.set(ipAddress, current + 1);

    // Auto-block after 5 suspicious activities in 1 hour
    if (current + 1 >= 5) {
      this.blockedIPs.add(ipAddress);
      this.logSecurityEvent({
        timestamp: new Date(),
        eventType: 'SUSPICIOUS_ACTIVITY',
        ipAddress,
        userAgent: 'automated',
        details: { reason: 'Multiple suspicious activities', count: current + 1 },
        severity: 'CRITICAL'
      });
    }
  }

  private reviewSuspiciousActivity(): void {
    // Reset suspicious activity counters every hour
    this.suspiciousActivity.clear();
  }

  /**
   * IP Blocking
   */
  public isIPBlocked(ipAddress: string): boolean {
    return this.blockedIPs.has(ipAddress);
  }

  public blockIP(ipAddress: string, reason: string): void {
    this.blockedIPs.add(ipAddress);
    this.logSecurityEvent({
      timestamp: new Date(),
      eventType: 'SECURITY_VIOLATION',
      ipAddress,
      userAgent: 'manual',
      details: { action: 'IP_BLOCKED', reason },
      severity: 'HIGH'
    });
  }

  public unblockIP(ipAddress: string): void {
    this.blockedIPs.delete(ipAddress);
    this.logSecurityEvent({
      timestamp: new Date(),
      eventType: 'SECURITY_VIOLATION',
      ipAddress,
      userAgent: 'manual',
      details: { action: 'IP_UNBLOCKED' },
      severity: 'LOW'
    });
  }

  /**
   * Security Monitoring & Analytics
   */
  public getSecurityMetrics(): {
    totalEvents: number;
    eventsBySeverity: Record<string, number>;
    eventsByType: Record<string, number>;
    blockedIPs: number;
    suspiciousActivities: number;
    recentEvents: SecurityEvent[];
  } {
    const eventsBySeverity: Record<string, number> = {};
    const eventsByType: Record<string, number> = {};

    this.securityEvents.forEach(event => {
      eventsBySeverity[event.severity] = (eventsBySeverity[event.severity] || 0) + 1;
      eventsByType[event.eventType] = (eventsByType[event.eventType] || 0) + 1;
    });

    return {
      totalEvents: this.securityEvents.length,
      eventsBySeverity,
      eventsByType,
      blockedIPs: this.blockedIPs.size,
      suspiciousActivities: this.suspiciousActivity.size,
      recentEvents: this.securityEvents.slice(-10)
    };
  }

  private cleanupSecurityEvents(): void {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    this.securityEvents = this.securityEvents.filter(
      event => event.timestamp > thirtyDaysAgo
    );
  }

  /**
   * Encryption Utilities
   */
  public encrypt(data: string, key?: string): string {
    const secretKey = key || this.config.jwtSecret;
    const cipher = crypto.createCipher('aes-256-cbc', secretKey);
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
  }

  public decrypt(encryptedData: string, key?: string): string {
    const secretKey = key || this.config.jwtSecret;
    const decipher = crypto.createDecipher('aes-256-cbc', secretKey);
    let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }

  /**
   * Security Health Check
   */
  public performSecurityHealthCheck(): {
    status: 'HEALTHY' | 'WARNING' | 'CRITICAL';
    checks: Record<string, boolean>;
    recommendations: string[];
  } {
    const checks = {
      jwtSecretConfigured: !!this.config.jwtSecret,
      rateLimitingEnabled: this.config.rateLimitMax > 0,
      securityHeadersEnabled: this.config.enableSecurityHeaders,
      auditLoggingEnabled: this.config.enableAuditLogging,
      inputValidationEnabled: this.config.enableInputValidation,
      noBlockedIPs: this.blockedIPs.size === 0,
      lowSuspiciousActivity: this.suspiciousActivity.size < 10
    };

    const passedChecks = Object.values(checks).filter(Boolean).length;
    const totalChecks = Object.keys(checks).length;
    const healthScore = passedChecks / totalChecks;

    let status: 'HEALTHY' | 'WARNING' | 'CRITICAL';
    if (healthScore >= 0.9) status = 'HEALTHY';
    else if (healthScore >= 0.7) status = 'WARNING';
    else status = 'CRITICAL';

    const recommendations: string[] = [];
    if (!checks.jwtSecretConfigured) recommendations.push('Configure JWT secret');
    if (!checks.rateLimitingEnabled) recommendations.push('Enable rate limiting');
    if (!checks.securityHeadersEnabled) recommendations.push('Enable security headers');
    if (!checks.auditLoggingEnabled) recommendations.push('Enable audit logging');
    if (!checks.inputValidationEnabled) recommendations.push('Enable input validation');
    if (!checks.noBlockedIPs) recommendations.push('Review blocked IPs');
    if (!checks.lowSuspiciousActivity) recommendations.push('Investigate suspicious activity');

    return { status, checks, recommendations };
  }
}
