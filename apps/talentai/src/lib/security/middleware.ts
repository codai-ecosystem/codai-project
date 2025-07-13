import { NextRequest, NextResponse } from 'next/server';

import {
  detectSecurityThreats,
  RateLimiter,
  sanitizeInput,
  securityHeaders,
} from './sanitization';

/**
 * Security Middleware for Next.js API Routes
 *
 * Provides comprehensive security features including rate limiting,
 * input validation, CSRF protection, and security headers.
 */

/**
 * Rate limiting based on IP address
 */

export interface SecurityConfig {
  enableRateLimit?: boolean;
  enableCsrf?: boolean;
  enableInputSanitization?: boolean;
  enableSecurityHeaders?: boolean;
  customRateLimit?: {
    requests: number;
    windowMs: number;
  };
}

/**
 * Apply security headers to response
 */
export function applySecurityHeaders(response: NextResponse): NextResponse {
  for (const [key, value] of Object.entries(securityHeaders)) {
    response.headers.set(key, value);
  }

  return response;
}

/**
 * CSRF Token generation and validation
 */
export class CSRFProtection {
  private static readonly SECRET =
    process.env['CSRF_SECRET'] ?? 'default-csrf-secret-change-in-production';

  /**
   * Generate CSRF token
   */
  static generateToken(): string {
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substring(2);
    return Buffer.from(`${timestamp}:${random}:${this.SECRET}`).toString(
      'base64'
    );
  }
  /**
   * Validate CSRF token
   */
  static validateToken(token: string): boolean {
    try {
      const decoded = Buffer.from(token, 'base64').toString();
      const parts = decoded.split(':');

      if (parts.length !== 3) {
        return false;
      }

      const [timestamp, , secret] = parts;

      // Check if secret matches
      if (secret !== this.SECRET) {
        return false;
      }

      // Check if token is not older than 1 hour
      const tokenTime = parseInt(timestamp || '0');
      const now = Date.now();
      const oneHour = 60 * 60 * 1000;

      return now - tokenTime < oneHour;
    } catch {
      return false;
    }
  }
}

/**
 * Input validation and sanitization middleware
 */
export function validateAndSanitizeInput(data: Record<string, unknown>): {
  isValid: boolean;
  sanitizedData: Record<string, unknown>;
  errors: string[];
} {
  const errors: string[] = [];
  const sanitizedData: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(data)) {
    if (typeof value === 'string') {
      // Check for security threats
      const threatCheck = detectSecurityThreats(value);
      if (threatCheck.hasThreats) {
        errors.push(
          `${key}: Contains potential security threats: ${threatCheck.threats.join(', ')}`
        );
        continue;
      }

      // Sanitize based on field name patterns
      let sanitizedValue = value;
      if (key.toLowerCase().includes('email')) {
        sanitizedValue = sanitizeInput(value, 'email');
      } else if (
        key.toLowerCase().includes('url') ||
        key.toLowerCase().includes('link')
      ) {
        sanitizedValue = sanitizeInput(value, 'url');
      } else if (key.toLowerCase().includes('phone')) {
        sanitizedValue = sanitizeInput(value, 'phone');
      } else if (
        key.toLowerCase().includes('html') ||
        key.toLowerCase().includes('content')
      ) {
        sanitizedValue = sanitizeInput(value, 'html');
      } else {
        sanitizedValue = sanitizeInput(value, 'text');
      }

      sanitizedData[key] = sanitizedValue;
    } else {
      sanitizedData[key] = value;
    }
  }

  return {
    isValid: errors.length === 0,
    sanitizedData,
    errors,
  };
}

/**
 * Get client IP address from request
 */
export function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const real = request.headers.get('x-real-ip');
  const cloudfrontViewer = request.headers.get('cloudfront-viewer-ip');

  if (forwarded != null) {
    return forwarded.split(',')[0]?.trim() || 'unknown';
  }
  if (real != null) {
    return real;
  }
  if (cloudfrontViewer != null) {
    return cloudfrontViewer;
  }

  return 'unknown';
}

const ipRateLimiters = new Map<string, RateLimiter>();

export function checkRateLimit(
  ip: string,
  type: 'login' | 'api' | 'passwordReset' | 'fileUpload' = 'api'
): boolean {
  const key = `${ip}:${type}`;

  if (!ipRateLimiters.has(key)) {
    // Create a new rate limiter for this IP/type combination
    let limiter: RateLimiter;
    switch (type) {
      case 'login':
        limiter = new RateLimiter(5, 5 / 60); // 5 attempts per minute
        break;
      case 'passwordReset':
        limiter = new RateLimiter(3, 3 / 3600); // 3 attempts per hour
        break;
      case 'fileUpload':
        limiter = new RateLimiter(10, 10 / 60); // 10 uploads per minute
        break;
      case 'api':
      default:
        limiter = new RateLimiter(100, 100 / 60); // 100 requests per minute
        break;
    }
    ipRateLimiters.set(key, limiter);
  }

  const limiter = ipRateLimiters.get(key)!;
  return limiter.isAllowed();
}

/**
 * Main security middleware function
 */
export function withSecurity(config: SecurityConfig = {}) {
  const {
    enableRateLimit = true,
    enableCsrf = true,
    enableInputSanitization = true,
    enableSecurityHeaders = true,
  } = config;

  return async function securityMiddleware(
    request: NextRequest,
    handler: (req: NextRequest) => Promise<NextResponse> | NextResponse
  ): Promise<NextResponse> {
    try {
      // Apply security headers
      let response: NextResponse;

      // Rate limiting
      if (enableRateLimit != null) {
        const ip = getClientIP(request);
        const isAllowed = checkRateLimit(ip, 'api');

        if (isAllowed == null) {
          response = NextResponse.json(
            { error: 'Rate limit exceeded. Please try again later.' },
            { status: 429 }
          );

          if (enableSecurityHeaders != null) {
            return applySecurityHeaders(response);
          }
          return response;
        }
      }

      // CSRF protection for state-changing methods
      if (
        enableCsrf &&
        ['POST', 'PUT', 'DELETE', 'PATCH'].includes(request.method)
      ) {
        const csrfToken = request.headers.get('x-csrf-token');

        if (!csrfToken || !CSRFProtection.validateToken(csrfToken)) {
          response = NextResponse.json(
            { error: 'Invalid or missing CSRF token' },
            { status: 403 }
          );

          if (enableSecurityHeaders != null) {
            return applySecurityHeaders(response);
          }
          return response;
        }
      }

      // Input sanitization
      if (enableInputSanitization != null && request.body) {
        try {
          const body: unknown = await request.json();
          if (body && typeof body === 'object' && !Array.isArray(body)) {
            const validation = validateAndSanitizeInput(
              body as Record<string, unknown>
            );

            if (!validation.isValid) {
              response = NextResponse.json(
                {
                  error: 'Invalid input data',
                  details: validation.errors,
                },
                { status: 400 }
              );

              if (enableSecurityHeaders != null) {
                return applySecurityHeaders(response);
              }
              return response;
            }

            // Replace request body with sanitized data
            const sanitizedRequest = new NextRequest(request.url, {
              method: request.method,
              headers: request.headers,
              body: JSON.stringify(validation.sanitizedData),
            });

            response = await handler(sanitizedRequest);
          } else {
            // If body is not a valid object, continue with original request
            response = await handler(request);
          }
        } catch {
          // If body parsing fails, continue with original request
          response = await handler(request);
        }
      } else {
        response = await handler(request);
      }

      // Apply security headers
      if (enableSecurityHeaders != null) {
        return applySecurityHeaders(response);
      }

      return response;
    } catch (error: unknown) {
      console.error('Security middleware error:', error);

      const errorResponse = NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );

      if (enableSecurityHeaders != null) {
        return applySecurityHeaders(errorResponse);
      }

      return errorResponse;
    }
  };
}

/**
 * Simple security middleware for API routes
 */
export function apiSecurity(config: SecurityConfig = {}) {
  return withSecurity({
    enableRateLimit: true,
    enableCsrf: true,
    enableInputSanitization: true,
    enableSecurityHeaders: true,
    ...config,
  });
}

/**
 * Auth-specific security middleware
 */
export function authSecurity() {
  return withSecurity({
    enableRateLimit: true,
    enableCsrf: true,
    enableInputSanitization: true,
    enableSecurityHeaders: true,
  });
}

/**
 * File upload security middleware
 */
export function fileUploadSecurity() {
  return withSecurity({
    enableRateLimit: true,
    enableCsrf: true,
    enableInputSanitization: false, // File uploads need special handling
    enableSecurityHeaders: true,
  });
}

/**
 * Validate file upload security
 */
export function validateFileUpload(file: File): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  const maxSize = 10 * 1024 * 1024; // 10MB

  const allowedTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
    'text/plain',
    'application/json',
  ];

  const allowedExtensions = [
    '.jpg',
    '.jpeg',
    '.png',
    '.gif',
    '.webp',
    '.pdf',
    '.txt',
    '.json',
  ];

  // Check file size
  if (file.size > maxSize) {
    errors.push('File size exceeds maximum allowed size (10MB)');
  }

  // Check file type
  if (!allowedTypes.includes(file.type)) {
    errors.push(`File type ${file.type} is not allowed`);
  }

  // Check file extension
  const extension = `.${file.name.split('.').pop()?.toLowerCase()}`;
  if (!allowedExtensions.includes(extension)) {
    errors.push(`File extension ${extension} is not allowed`);
  }

  // Check for suspicious file names
  const suspiciousPatterns = [
    /\.php$/i,
    /\.jsp$/i,
    /\.asp$/i,
    /\.js$/i,
    /\.html$/i,
    /\.htm$/i,
    /script/i,
    /executable/i,
  ];

  if (suspiciousPatterns.some(pattern => pattern.test(file.name))) {
    errors.push('Suspicious file name detected');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Generate secure headers for responses
 */
export function generateSecureHeaders(): Record<string, string> {
  return {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
    'Content-Security-Policy': securityHeaders['Content-Security-Policy'],
  };
}
