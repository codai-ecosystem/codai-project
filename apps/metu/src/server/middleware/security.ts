// 🔐 Security Middleware for METU

import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

export interface SecurityConfig {
  enableCSRF: boolean;
  enableXSS: boolean;
  enableRateLimit: boolean;
  trustedDomains: string[];
  maxRequestSize: string;
  allowedMethods: string[];
}

const defaultConfig: SecurityConfig = {
  enableCSRF: true,
  enableXSS: true,
  enableRateLimit: true,
  trustedDomains: ['localhost', '127.0.0.1'],
  maxRequestSize: '10mb',
  allowedMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
};

// CSRF Token Management
class CSRFTokenManager {
  private tokens = new Map<string, { token: string; expires: number }>();
  private readonly tokenExpiry = 60 * 60 * 1000; // 1 hour

  generateToken(sessionId: string): string {
    const token = crypto.randomBytes(32).toString('hex');
    this.tokens.set(sessionId, {
      token,
      expires: Date.now() + this.tokenExpiry
    });
    return token;
  }

  validateToken(sessionId: string, token: string): boolean {
    const stored = this.tokens.get(sessionId);
    if (!stored) return false;

    if (Date.now() > stored.expires) {
      this.tokens.delete(sessionId);
      return false;
    }

    return stored.token === token;
  }

  cleanup() {
    const now = Date.now();
    for (const [sessionId, data] of this.tokens) {
      if (now > data.expires) {
        this.tokens.delete(sessionId);
      }
    }
  }
}

const csrfManager = new CSRFTokenManager();

// Cleanup expired tokens every 15 minutes
setInterval(() => csrfManager.cleanup(), 15 * 60 * 1000);

// XSS Protection
export function xssProtection(req: Request, res: Response, next: NextFunction) {
  // Set XSS protection headers
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Sanitize user input (basic implementation)
  if (req.body && typeof req.body === 'object') {
    req.body = sanitizeObject(req.body);
  }

  if (req.query && typeof req.query === 'object') {
    req.query = sanitizeObject(req.query);
  }

  next();
}

function sanitizeObject(obj: any): any {
  if (typeof obj !== 'object' || obj === null) {
    return typeof obj === 'string' ? sanitizeString(obj) : obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item));
  }

  const sanitized: any = {};
  for (const [key, value] of Object.entries(obj)) {
    sanitized[sanitizeString(key)] = sanitizeObject(value);
  }

  return sanitized;
}

function sanitizeString(str: string): string {
  return str
    .replace(/[<>]/g, '') // Remove < and >
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .replace(/script/gi, 'scr1pt') // Neutralize script tags
    .trim();
}

// CSRF Protection
export function csrfProtection(req: Request, res: Response, next: NextFunction) {
  // Skip CSRF for GET requests and API calls that don't modify data
  if (req.method === 'GET' || req.path.startsWith('/api/health') || req.path.startsWith('/api/metrics')) {
    return next();
  }

  const sessionId = (req as any).sessionID || req.ip;

  // Generate CSRF token for new sessions
  if (req.method === 'GET' || !req.headers['x-csrf-token']) {
    const token = csrfManager.generateToken(sessionId);
    res.setHeader('X-CSRF-Token', token);

    if (req.method !== 'GET') {
      return res.status(403).json({
        error: 'CSRF token required',
        csrfToken: token
      });
    }

    return next();
  }

  // Validate CSRF token for state-changing requests
  const token = req.headers['x-csrf-token'] as string;
  if (!csrfManager.validateToken(sessionId, token)) {
    return res.status(403).json({
      error: 'Invalid CSRF token'
    });
  }

  next();
}

// Input Validation
export function validateInput(req: Request, res: Response, next: NextFunction) {
  // Validate content type for POST/PUT requests
  if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
    const contentType = req.headers['content-type'];
    if (!contentType || (!contentType.includes('application/json') && !contentType.includes('multipart/form-data'))) {
      return res.status(400).json({
        error: 'Invalid content type. Expected application/json or multipart/form-data'
      });
    }
  }

  // Validate request size
  const contentLength = req.headers['content-length'];
  if (contentLength && parseInt(contentLength) > 10 * 1024 * 1024) { // 10MB limit
    return res.status(413).json({
      error: 'Request too large. Maximum size is 10MB'
    });
  }

  // Validate HTTP method
  const allowedMethods = ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'HEAD'];
  if (!allowedMethods.includes(req.method)) {
    return res.status(405).json({
      error: 'Method not allowed'
    });
  }

  next();
}

// Request Origin Validation
export function validateOrigin(req: Request, res: Response, next: NextFunction) {
  const origin = req.headers.origin;
  const host = req.headers.host;

  // Allow requests without origin (e.g., from Postman, curl)
  if (!origin) {
    return next();
  }

  // Parse origin
  let originHost: string;
  try {
    const url = new URL(origin);
    originHost = url.hostname;
  } catch {
    return res.status(400).json({
      error: 'Invalid origin header'
    });
  }

  // Check against trusted domains
  const trustedDomains = process.env.TRUSTED_DOMAINS
    ? process.env.TRUSTED_DOMAINS.split(',')
    : ['localhost', '127.0.0.1'];

  const isLocal = originHost === 'localhost' || originHost === '127.0.0.1' || originHost === host;
  const isTrusted = trustedDomains.includes(originHost);

  if (!isLocal && !isTrusted) {
    return res.status(403).json({
      error: 'Origin not allowed',
      origin: originHost
    });
  }

  next();
}

// Request ID Generation
export function requestId(req: Request, res: Response, next: NextFunction) {
  const id = crypto.randomUUID();
  req.headers['x-request-id'] = id;
  res.setHeader('X-Request-ID', id);
  next();
}

// Security Headers
export function securityHeaders(req: Request, res: Response, next: NextFunction) {
  // HSTS (HTTP Strict Transport Security)
  if (process.env.NODE_ENV === 'production') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }

  // Content Security Policy
  res.setHeader('Content-Security-Policy',
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
    "style-src 'self' 'unsafe-inline'; " +
    "connect-src 'self' ws: wss: https:; " +
    "img-src 'self' data: https:; " +
    "media-src 'self' blob: data:; " +
    "font-src 'self' https: data:; " +
    "object-src 'none'; " +
    "base-uri 'self'; " +
    "form-action 'self';"
  );

  // Additional security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

  next();
}

// Combined security middleware
export function securityMiddleware(config: Partial<SecurityConfig> = {}) {
  const finalConfig = { ...defaultConfig, ...config };

  return (req: Request, res: Response, next: NextFunction) => {
    // Apply all security measures
    requestId(req, res, () => {
      securityHeaders(req, res, () => {
        validateInput(req, res, () => {
          validateOrigin(req, res, () => {
            if (finalConfig.enableXSS) {
              xssProtection(req, res, () => {
                if (finalConfig.enableCSRF) {
                  csrfProtection(req, res, next);
                } else {
                  next();
                }
              });
            } else if (finalConfig.enableCSRF) {
              csrfProtection(req, res, next);
            } else {
              next();
            }
          });
        });
      });
    });
  };
}
