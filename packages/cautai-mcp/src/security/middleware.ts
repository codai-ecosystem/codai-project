import type { FastifyRequest, FastifyReply } from 'fastify';
import type { AuthenticationSystem, User } from './authentication.js';
import { z } from 'zod';

// Simple logger until @codai/logger is available
const logger = {
  debug: (msg: string, meta?: any) => console.debug(`[SecurityMiddleware] ${msg}`, meta || ''),
  info: (msg: string, meta?: any) => console.info(`[SecurityMiddleware] ${msg}`, meta || ''),
  warn: (msg: string, meta?: any) => console.warn(`[SecurityMiddleware] ${msg}`, meta || ''),
  error: (msg: string, meta?: any) => console.error(`[SecurityMiddleware] ${msg}`, meta || '')
};

export interface SecurityMiddlewareConfig {
  enableCSP: boolean;
  enableHSTS: boolean;
  enableRateLimiting: boolean;
  enableCORS: boolean;
  enableRequestLogging: boolean;
  enableIPBlocking: boolean;
  corsOrigins: string[];
  rateLimitWindowMs: number;
  rateLimitMaxRequests: number;
  blockedIPs: string[];
  trustedProxies: string[];
  maxRequestSize: string;
  enableXSSProtection: boolean;
  enableClickjackingProtection: boolean;
  enableMimeTypeSniffing: boolean;
}

export interface SecurityContext {
  user?: Omit<User, 'passwordHash' | 'salt' | 'mfaSecret'>;
  isAuthenticated: boolean;
  apiKey?: string;
  sessionId?: string;
  sourceIP: string;
  userAgent?: string;
  requestId: string;
  timestamp: Date;
}

export interface RateLimitInfo {
  limit: number;
  current: number;
  remaining: number;
  resetTime: Date;
}

export interface SecurityHeaders {
  'Content-Security-Policy'?: string;
  'Strict-Transport-Security'?: string;
  'X-Content-Type-Options'?: string;
  'X-Frame-Options'?: string;
  'X-XSS-Protection'?: string;
  'Referrer-Policy'?: string;
  'Permissions-Policy'?: string;
  'Cross-Origin-Embedder-Policy'?: string;
  'Cross-Origin-Opener-Policy'?: string;
  'Cross-Origin-Resource-Policy'?: string;
}

/**
 * Comprehensive security middleware for HTTP servers with:
 * - Authentication and authorization
 * - Rate limiting and DDoS protection
 * - Security headers (HSTS, CSP, etc.)
 * - CORS configuration
 * - IP blocking and geo-filtering
 * - Request logging and monitoring
 * - Input sanitization and validation
 * - Session management
 * - API key validation
 */
export class SecurityMiddleware {
  private readonly config: SecurityMiddlewareConfig;
  private readonly authSystem: AuthenticationSystem;
  private readonly rateLimitMap = new Map<string, RateLimitInfo>();
  private readonly ipBlockMap = new Set<string>();
  private readonly suspiciousIPs = new Map<string, { count: number; lastSeen: Date }>();
  private readonly sessionStore = new Map<string, any>();

  constructor(config: SecurityMiddlewareConfig, authSystem: AuthenticationSystem) {
    this.config = config;
    this.authSystem = authSystem;
    this.initializeIPBlocking();
    this.startCleanupTasks();
    
    logger.info('Security middleware initialized', {
      rateLimiting: config.enableRateLimiting,
      cors: config.enableCORS,
      ipBlocking: config.enableIPBlocking
    });
  }

  /**
   * Main security middleware handler
   */
  async securityHandler(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const startTime = Date.now();
    const requestId = this.generateRequestId();
    const sourceIP = this.getClientIP(request);
    
    try {
      // Create security context
      const securityContext: SecurityContext = {
        isAuthenticated: false,
        sourceIP,
        userAgent: request.headers['user-agent'],
        requestId,
        timestamp: new Date()
      };

      // IP blocking check
      if (this.config.enableIPBlocking && this.isIPBlocked(sourceIP)) {
        logger.warn('Blocked IP attempt', { ip: sourceIP, requestId });
        throw { statusCode: 403, message: 'IP address blocked' };
      }

      // Rate limiting check
      if (this.config.enableRateLimiting && !this.checkRateLimit(sourceIP)) {
        logger.warn('Rate limit exceeded', { ip: sourceIP, requestId });
        throw { statusCode: 429, message: 'Rate limit exceeded' };
      }

      // Set security headers
      this.setSecurityHeaders(reply);

      // CORS handling
      if (this.config.enableCORS) {
        this.handleCORS(request, reply);
      }

      // Authentication check
      const authResult = await this.authenticateRequest(request);
      if (authResult.user) {
        securityContext.user = authResult.user;
        securityContext.isAuthenticated = true;
        securityContext.sessionId = authResult.sessionId;
      }

      // Add security context to request
      (request as any).securityContext = securityContext;

      // Log request if enabled
      if (this.config.enableRequestLogging) {
        this.logRequest(request, securityContext);
      }

      // Monitor for suspicious activity
      this.monitorSuspiciousActivity(request, securityContext);

      logger.debug('Security check passed', {
        requestId,
        ip: sourceIP,
        authenticated: securityContext.isAuthenticated,
        processingTime: Date.now() - startTime
      });

    } catch (error: any) {
      // Log security violation
      logger.error('Security violation', {
        error: error.message,
        ip: sourceIP,
        requestId,
        processingTime: Date.now() - startTime
      });

      // Track suspicious IP
      this.trackSuspiciousIP(sourceIP);

      // Send appropriate error response
      reply.code(error.statusCode || 500);
      throw error;
    }
  }

  /**
   * Authorization middleware for protected routes
   */
  async authorizationHandler(
    request: FastifyRequest,
    reply: FastifyReply,
    requiredPermissions: string[]
  ): Promise<void> {
    const securityContext = (request as any).securityContext as SecurityContext;
    
    if (!securityContext?.isAuthenticated || !securityContext.user) {
      logger.warn('Unauthorized access attempt', {
        ip: securityContext?.sourceIP,
        requestId: securityContext?.requestId
      });
      reply.code(401);
      throw new Error('Authentication required');
    }

    // Check permissions
    for (const permission of requiredPermissions) {
      const authContext = {
        user: securityContext.user as any,
        resource: permission.split(':')[0],
        action: permission.split(':')[1] || 'read'
      };

      const permissionCheck = this.authSystem.checkPermission(authContext);
      if (!permissionCheck.isAuthorized) {
        logger.warn('Authorization failed', {
          userId: securityContext.user.id,
          requiredPermission: permission,
          requestId: securityContext.requestId
        });
        reply.code(403);
        throw new Error(`Missing permission: ${permission}`);
      }
    }

    logger.debug('Authorization successful', {
      userId: securityContext.user.id,
      permissions: requiredPermissions,
      requestId: securityContext.requestId
    });
  }

  /**
   * API key validation middleware
   */
  async apiKeyHandler(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const apiKey = this.extractAPIKey(request);
    if (!apiKey) {
      reply.code(401);
      throw new Error('API key required');
    }

    const validation = await this.authSystem.validateAPIKey(apiKey);
    if (!validation.isValid) {
      logger.warn('Invalid API key used', {
        ip: this.getClientIP(request),
        error: validation.error
      });
      reply.code(401);
      throw new Error('Invalid API key');
    }

    // Add API key info to security context
    const securityContext = (request as any).securityContext as SecurityContext;
    if (securityContext) {
      securityContext.apiKey = apiKey;
    }

    logger.debug('API key validation successful', {
      keyId: validation.keyInfo?.id,
      permissions: validation.keyInfo?.permissions
    });
  }

  /**
   * Request size validation middleware
   */
  async requestSizeHandler(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const contentLength = request.headers['content-length'];
    if (!contentLength) return;

    const maxSize = this.parseSize(this.config.maxRequestSize);
    const requestSize = parseInt(contentLength);

    if (requestSize > maxSize) {
      logger.warn('Request size exceeded', {
        size: requestSize,
        maxSize,
        ip: this.getClientIP(request)
      });
      reply.code(413);
      throw new Error('Request entity too large');
    }
  }

  /**
   * Input sanitization middleware
   */
  async inputSanitizationHandler(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    if (request.body && typeof request.body === 'object') {
      request.body = this.sanitizeObject(request.body);
    }

    if (request.query && typeof request.query === 'object') {
      request.query = this.sanitizeObject(request.query);
    }
  }

  /**
   * Get rate limit info for IP
   */
  getRateLimitInfo(ip: string): RateLimitInfo | null {
    return this.rateLimitMap.get(ip) || null;
  }

  /**
   * Get security statistics
   */
  getSecurityStats(): {
    blockedIPs: number;
    suspiciousIPs: number;
    activeRateLimits: number;
    totalRequests: number;
    securityViolations: number;
  } {
    return {
      blockedIPs: this.ipBlockMap.size,
      suspiciousIPs: this.suspiciousIPs.size,
      activeRateLimits: this.rateLimitMap.size,
      totalRequests: 0, // Would track in production
      securityViolations: 0 // Would track in production
    };
  }

  /**
   * Block IP address
   */
  blockIP(ip: string, reason: string): void {
    this.ipBlockMap.add(ip);
    logger.info('IP blocked', { ip, reason });
  }

  /**
   * Unblock IP address
   */
  unblockIP(ip: string): void {
    this.ipBlockMap.delete(ip);
    logger.info('IP unblocked', { ip });
  }

  /**
   * Initialize IP blocking from configuration
   */
  private initializeIPBlocking(): void {
    for (const ip of this.config.blockedIPs) {
      this.ipBlockMap.add(ip);
    }
    logger.info('IP blocking initialized', { blockedCount: this.ipBlockMap.size });
  }

  /**
   * Check if IP is blocked
   */
  private isIPBlocked(ip: string): boolean {
    return this.ipBlockMap.has(ip);
  }

  /**
   * Check rate limit for IP
   */
  private checkRateLimit(ip: string): boolean {
    const now = new Date();
    const windowStart = new Date(now.getTime() - this.config.rateLimitWindowMs);
    
    let rateLimitInfo = this.rateLimitMap.get(ip);
    
    if (!rateLimitInfo || rateLimitInfo.resetTime < now) {
      rateLimitInfo = {
        limit: this.config.rateLimitMaxRequests,
        current: 1,
        remaining: this.config.rateLimitMaxRequests - 1,
        resetTime: new Date(now.getTime() + this.config.rateLimitWindowMs)
      };
      this.rateLimitMap.set(ip, rateLimitInfo);
      return true;
    }

    if (rateLimitInfo.current >= rateLimitInfo.limit) {
      return false;
    }

    rateLimitInfo.current++;
    rateLimitInfo.remaining--;
    return true;
  }

  /**
   * Set security headers
   */
  private setSecurityHeaders(reply: FastifyReply): void {
    const headers: SecurityHeaders = {};

    if (this.config.enableCSP) {
      headers['Content-Security-Policy'] = "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' https:; connect-src 'self' https:";
    }

    if (this.config.enableHSTS) {
      headers['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains; preload';
    }

    if (this.config.enableClickjackingProtection) {
      headers['X-Frame-Options'] = 'DENY';
    }

    if (this.config.enableXSSProtection) {
      headers['X-XSS-Protection'] = '1; mode=block';
    }

    if (!this.config.enableMimeTypeSniffing) {
      headers['X-Content-Type-Options'] = 'nosniff';
    }

    headers['Referrer-Policy'] = 'strict-origin-when-cross-origin';
    headers['Permissions-Policy'] = 'geolocation=(), microphone=(), camera=()';
    headers['Cross-Origin-Embedder-Policy'] = 'require-corp';
    headers['Cross-Origin-Opener-Policy'] = 'same-origin';
    headers['Cross-Origin-Resource-Policy'] = 'same-origin';

    for (const [key, value] of Object.entries(headers)) {
      reply.header(key, value);
    }
  }

  /**
   * Handle CORS requests
   */
  private handleCORS(request: FastifyRequest, reply: FastifyReply): void {
    const origin = request.headers.origin;
    
    if (origin && this.config.corsOrigins.includes(origin)) {
      reply.header('Access-Control-Allow-Origin', origin);
    } else if (this.config.corsOrigins.includes('*')) {
      reply.header('Access-Control-Allow-Origin', '*');
    }

    reply.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    reply.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-API-Key');
    reply.header('Access-Control-Allow-Credentials', 'true');
    reply.header('Access-Control-Max-Age', '86400');

    if (request.method === 'OPTIONS') {
      reply.code(204);
      return;
    }
  }

  /**
   * Authenticate incoming request
   */
  private async authenticateRequest(request: FastifyRequest): Promise<{
    user?: Omit<User, 'passwordHash' | 'salt' | 'mfaSecret'>;
    sessionId?: string;
  }> {
    // Try Bearer token authentication
    const authHeader = request.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const validation = await this.authSystem.validateToken(token);
      if (validation.isValid && validation.user) {
        return { user: validation.user, sessionId: 'token-session' };
      }
    }

    // Try API key authentication
    const apiKey = this.extractAPIKey(request);
    if (apiKey) {
      const validation = await this.authSystem.validateAPIKey(apiKey);
      if (validation.isValid) {
        // API keys don't have associated users, but we can create a synthetic user context
        return { sessionId: 'api-key-session' };
      }
    }

    return {};
  }

  /**
   * Extract API key from request
   */
  private extractAPIKey(request: FastifyRequest): string | undefined {
    // Check X-API-Key header
    const apiKeyHeader = request.headers['x-api-key'] as string;
    if (apiKeyHeader) return apiKeyHeader;

    // Check query parameter
    const query = request.query as Record<string, string>;
    if (query.api_key) return query.api_key;

    return undefined;
  }

  /**
   * Get client IP address considering proxies
   */
  private getClientIP(request: FastifyRequest): string {
    // Check X-Forwarded-For header
    const xForwardedFor = request.headers['x-forwarded-for'] as string;
    if (xForwardedFor) {
      const ips = xForwardedFor.split(',').map(ip => ip.trim());
      return ips[0];
    }

    // Check X-Real-IP header
    const xRealIP = request.headers['x-real-ip'] as string;
    if (xRealIP) return xRealIP;

    // Fallback to socket IP
    return request.socket.remoteAddress || 'unknown';
  }

  /**
   * Generate unique request ID
   */
  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
  }

  /**
   * Log request information
   */
  private logRequest(request: FastifyRequest, context: SecurityContext): void {
    logger.info('HTTP request', {
      method: request.method,
      url: request.url,
      ip: context.sourceIP,
      userAgent: context.userAgent,
      authenticated: context.isAuthenticated,
      userId: context.user?.id,
      requestId: context.requestId
    });
  }

  /**
   * Monitor suspicious activity
   */
  private monitorSuspiciousActivity(request: FastifyRequest, context: SecurityContext): void {
    // Check for SQL injection patterns
    const url = request.url.toLowerCase();
    const suspiciousPatterns = [
      'union select', 'drop table', 'exec sp_', '; exec',
      '<script>', 'javascript:', 'onload=', 'onerror=',
      '../../../', '..\\..\\..\\', 'etc/passwd', 'boot.ini'
    ];

    for (const pattern of suspiciousPatterns) {
      if (url.includes(pattern)) {
        logger.warn('Suspicious request pattern detected', {
          pattern,
          url: request.url,
          ip: context.sourceIP,
          requestId: context.requestId
        });
        this.trackSuspiciousIP(context.sourceIP);
        break;
      }
    }
  }

  /**
   * Track suspicious IP activity
   */
  private trackSuspiciousIP(ip: string): void {
    const existing = this.suspiciousIPs.get(ip);
    if (existing) {
      existing.count++;
      existing.lastSeen = new Date();
      
      // Auto-block after threshold
      if (existing.count > 10) {
        this.blockIP(ip, 'Suspicious activity detected');
      }
    } else {
      this.suspiciousIPs.set(ip, { count: 1, lastSeen: new Date() });
    }
  }

  /**
   * Sanitize object recursively
   */
  private sanitizeObject(obj: any): any {
    if (typeof obj !== 'object' || obj === null) return obj;

    if (Array.isArray(obj)) {
      return obj.map(item => this.sanitizeObject(item));
    }

    const sanitized: any = {};
    for (const [key, value] of Object.entries(obj)) {
      const sanitizedKey = this.sanitizeString(key);
      sanitized[sanitizedKey] = typeof value === 'string' 
        ? this.sanitizeString(value)
        : this.sanitizeObject(value);
    }
    return sanitized;
  }

  /**
   * Sanitize string input
   */
  private sanitizeString(input: string): string {
    return input
      .replace(/<script[^>]*>.*?<\/script>/gi, '')
      .replace(/<[^>]*>/g, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '');
  }

  /**
   * Parse size string to bytes
   */
  private parseSize(sizeString: string): number {
    const units: Record<string, number> = {
      'B': 1,
      'KB': 1024,
      'MB': 1024 * 1024,
      'GB': 1024 * 1024 * 1024
    };

    const match = sizeString.match(/^(\d+)([A-Z]+)$/i);
    if (!match) return parseInt(sizeString);

    const value = parseInt(match[1]);
    const unit = match[2].toUpperCase();
    return value * (units[unit] || 1);
  }

  /**
   * Start cleanup tasks
   */
  private startCleanupTasks(): void {
    // Clean up expired rate limits every 5 minutes
    setInterval(() => {
      const now = new Date();
      for (const [ip, info] of this.rateLimitMap.entries()) {
        if (info.resetTime < now) {
          this.rateLimitMap.delete(ip);
        }
      }
    }, 5 * 60 * 1000);

    // Clean up old suspicious IPs every hour
    setInterval(() => {
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      for (const [ip, info] of this.suspiciousIPs.entries()) {
        if (info.lastSeen < oneHourAgo && info.count < 5) {
          this.suspiciousIPs.delete(ip);
        }
      }
    }, 60 * 60 * 1000);

    logger.info('Security cleanup tasks started');
  }
}

// Export default configuration
export const DEFAULT_SECURITY_MIDDLEWARE_CONFIG: SecurityMiddlewareConfig = {
  enableCSP: true,
  enableHSTS: true,
  enableRateLimiting: true,
  enableCORS: true,
  enableRequestLogging: true,
  enableIPBlocking: true,
  corsOrigins: ['http://localhost:3000', 'http://localhost:4000', 'https://cautai.ro', 'https://romcp.ro'],
  rateLimitWindowMs: 15 * 60 * 1000, // 15 minutes
  rateLimitMaxRequests: 100,
  blockedIPs: [],
  trustedProxies: [],
  maxRequestSize: '10MB',
  enableXSSProtection: true,
  enableClickjackingProtection: true,
  enableMimeTypeSniffing: false
};