// Security headers middleware for all CODAI applications
import { NextRequest, NextResponse } from 'next/server';

export interface SecurityConfig {
  enableCSP?: boolean;
  enableHSTS?: boolean;
  enableXFrameOptions?: boolean;
  enableContentTypeOptions?: boolean;
  enableReferrerPolicy?: boolean;
  enablePermissionsPolicy?: boolean;
  cspPolicy?: string;
}

export class SecurityHeadersMiddleware {
  private config: SecurityConfig;

  constructor(config: SecurityConfig = {}) {
    this.config = {
      enableCSP: true,
      enableHSTS: true,
      enableXFrameOptions: true,
      enableContentTypeOptions: true,
      enableReferrerPolicy: true,
      enablePermissionsPolicy: true,
      cspPolicy: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https://api.codai.ro https://gateway.codai.ro; frame-ancestors 'none';",
      ...config
    };
  }

  public applySecurityHeaders(response: NextResponse): NextResponse {
    // Content Security Policy
    if (this.config.enableCSP && this.config.cspPolicy) {
      response.headers.set('Content-Security-Policy', this.config.cspPolicy);
    }

    // HTTP Strict Transport Security
    if (this.config.enableHSTS) {
      response.headers.set(
        'Strict-Transport-Security',
        'max-age=31536000; includeSubDomains; preload'
      );
    }

    // X-Frame-Options
    if (this.config.enableXFrameOptions) {
      response.headers.set('X-Frame-Options', 'DENY');
    }

    // X-Content-Type-Options
    if (this.config.enableContentTypeOptions) {
      response.headers.set('X-Content-Type-Options', 'nosniff');
    }

    // Referrer Policy
    if (this.config.enableReferrerPolicy) {
      response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    }

    // Permissions Policy
    if (this.config.enablePermissionsPolicy) {
      response.headers.set(
        'Permissions-Policy',
        'camera=(), microphone=(), geolocation=(), payment=(), usb=(), screen-wake-lock=()'
      );
    }

    // Additional security headers
    response.headers.set('X-DNS-Prefetch-Control', 'off');
    response.headers.set('X-Download-Options', 'noopen');
    response.headers.set('X-Permitted-Cross-Domain-Policies', 'none');
    response.headers.set('Cross-Origin-Embedder-Policy', 'require-corp');
    response.headers.set('Cross-Origin-Opener-Policy', 'same-origin');
    response.headers.set('Cross-Origin-Resource-Policy', 'same-origin');
    
    // Remove potentially sensitive headers
    response.headers.delete('Server');
    response.headers.delete('X-Powered-By');

    return response;
  }

  public createMiddleware() {
    return (request: NextRequest) => {
      const response = NextResponse.next();
      return this.applySecurityHeaders(response);
    };
  }
}

// Rate limiting configuration
export interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  message?: string;
  standardHeaders?: boolean;
  legacyHeaders?: boolean;
}

export class RateLimiter {
  private requests: Map<string, number[]> = new Map();
  private config: RateLimitConfig;

  constructor(config: RateLimitConfig) {
    this.config = {
      message: 'Too many requests from this IP, please try again later.',
      standardHeaders: true,
      legacyHeaders: false,
      ...config
    };
  }

  public isRateLimited(clientId: string): boolean {
    const now = Date.now();
    const windowStart = now - this.config.windowMs;
    
    // Get existing requests for this client
    let clientRequests = this.requests.get(clientId) || [];
    
    // Filter out old requests
    clientRequests = clientRequests.filter(timestamp => timestamp > windowStart);
    
    // Check if limit exceeded
    if (clientRequests.length >= this.config.maxRequests) {
      return true;
    }
    
    // Add current request
    clientRequests.push(now);
    this.requests.set(clientId, clientRequests);
    
    return false;
  }

  public getRateLimitHeaders(clientId: string) {
    const now = Date.now();
    const windowStart = now - this.config.windowMs;
    const clientRequests = (this.requests.get(clientId) || [])
      .filter(timestamp => timestamp > windowStart);
    
    const remaining = Math.max(0, this.config.maxRequests - clientRequests.length);
    const resetTime = Math.ceil((windowStart + this.config.windowMs) / 1000);
    
    return {
      'X-RateLimit-Limit': this.config.maxRequests.toString(),
      'X-RateLimit-Remaining': remaining.toString(),
      'X-RateLimit-Reset': resetTime.toString(),
    };
  }
}

// Input validation utilities
export class InputValidator {
  // XSS prevention
  public static sanitizeHTML(input: string): string {
    return input
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  }

  // SQL injection prevention (for display purposes)
  public static sanitizeSQL(input: string): string {
    const sqlKeywords = /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|ALTER|CREATE|EXEC|EXECUTE)\b)/gi;
    return input.replace(sqlKeywords, '[FILTERED]');
  }

  // Email validation
  public static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) && email.length <= 254;
  }

  // URL validation
  public static isValidURL(url: string): boolean {
    try {
      const urlObj = new URL(url);
      return ['http:', 'https:'].includes(urlObj.protocol);
    } catch {
      return false;
    }
  }

  // Input length validation
  public static validateLength(input: string, min: number, max: number): boolean {
    return input.length >= min && input.length <= max;
  }

  // Alphanumeric validation
  public static isAlphanumeric(input: string): boolean {
    return /^[a-zA-Z0-9]+$/.test(input);
  }

  // Password strength validation
  public static validatePasswordStrength(password: string): {
    isValid: boolean;
    score: number;
    requirements: string[];
  } {
    const requirements = [];
    let score = 0;

    if (password.length >= 8) {
      score += 1;
    } else {
      requirements.push('At least 8 characters');
    }

    if (/[a-z]/.test(password)) {
      score += 1;
    } else {
      requirements.push('At least one lowercase letter');
    }

    if (/[A-Z]/.test(password)) {
      score += 1;
    } else {
      requirements.push('At least one uppercase letter');
    }

    if (/\d/.test(password)) {
      score += 1;
    } else {
      requirements.push('At least one number');
    }

    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      score += 1;
    } else {
      requirements.push('At least one special character');
    }

    return {
      isValid: score >= 4,
      score,
      requirements
    };
  }
}

// CSRF protection
export class CSRFProtection {
  private static tokens: Map<string, { token: string; expires: number }> = new Map();

  public static generateToken(sessionId: string): string {
    const token = this.randomBytes(32);
    const expires = Date.now() + (60 * 60 * 1000); // 1 hour

    this.tokens.set(sessionId, { token, expires });
    
    // Cleanup expired tokens
    this.cleanupExpiredTokens();
    
    return token;
  }

  public static validateToken(sessionId: string, token: string): boolean {
    const stored = this.tokens.get(sessionId);
    
    if (!stored || stored.expires < Date.now()) {
      this.tokens.delete(sessionId);
      return false;
    }
    
    return stored.token === token;
  }

  private static randomBytes(length: number): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    return result;
  }

  private static cleanupExpiredTokens(): void {
    const now = Date.now();
    
    for (const [sessionId, { expires }] of this.tokens.entries()) {
      if (expires < now) {
        this.tokens.delete(sessionId);
      }
    }
  }
}

export default {
  SecurityHeadersMiddleware,
  RateLimiter,
  InputValidator,
  CSRFProtection
};
