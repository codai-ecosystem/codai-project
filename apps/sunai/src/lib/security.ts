/**
 * Security utilities for METU Template
 */

import type { NextRequest } from 'next/server';
import { z } from 'zod';

/**
 * Input sanitization utilities
 */
export const sanitization = {
  /**
   * Remove potentially dangerous HTML tags and attributes
   */
  sanitizeHtml: (input: string): string => {
    if (typeof window !== 'undefined') {
      // Client-side sanitization
      const div = document.createElement('div');
      div.textContent = input;
      return div.innerHTML;
    }

    // Server-side sanitization - basic HTML entity encoding
    return input
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  },

  /**
   * Remove SQL injection patterns
   */
  sanitizeForDatabase: (input: string): string => {
    return input.replace(/["';\\]/g, '');
  },

  /**
   * Sanitize user input for safe display
   */
  sanitizeUserInput: (input: string): string => {
    return sanitization.sanitizeHtml(input).trim();
  },
};

/**
 * CSRF protection utilities
 */
export const csrfProtection = {
  /**
   * Generate CSRF token
   */
  generateToken(): string {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }

    // Fallback for older browsers
    return (
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15)
    );
  },

  /**
   * Validate CSRF token from request
   */
  validateToken(request: NextRequest, expectedToken: string): boolean {
    const token =
      request.headers.get('x-csrf-token') ||
      request.nextUrl.searchParams.get('csrf_token');

    return token === expectedToken;
  },

  /**
   * Get CSRF token from cookies or generate new one
   */
  getOrCreateToken(request: NextRequest): string {
    const existingToken = request.cookies.get('csrf_token')?.value;

    if (existingToken != null && existingToken.length > 10) {
      return existingToken;
    }

    return this.generateToken();
  },
};

/**
 * Rate limiting utilities
 */
export class RateLimiter {
  private readonly attempts: Map<string, { count: number; resetTime: number }> =
    new Map();

  constructor(
    private readonly maxAttempts: number = 5,
    private readonly windowMs: number = 15 * 60 * 1000 // 15 minutes
  ) {}

  /**
   * Check if request should be rate limited
   */
  isRateLimited(identifier: string): boolean {
    const now = Date.now();
    const record = this.attempts.get(identifier);

    if (!record || now > record.resetTime) {
      // Reset or create new record
      this.attempts.set(identifier, {
        count: 1,
        resetTime: now + this.windowMs,
      });
      return false;
    }

    if (record.count >= this.maxAttempts) {
      return true;
    }

    // Increment count
    record.count++;
    this.attempts.set(identifier, record);
    return false;
  }

  /**
   * Get remaining attempts
   */
  getRemainingAttempts(identifier: string): number {
    const record = this.attempts.get(identifier);
    if (!record || Date.now() > record.resetTime) {
      return this.maxAttempts;
    }
    return Math.max(0, this.maxAttempts - record.count);
  }

  /**
   * Reset attempts for identifier
   */
  reset(identifier: string): void {
    this.attempts.delete(identifier);
  }
}

/**
 * Input validation schemas
 */
export const validationSchemas = {
  email: z.string().email('Invalid email format').max(254),

  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password must be less than 128 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain at least one lowercase letter, one uppercase letter, and one number'
    ),

  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username must be less than 30 characters')
    .regex(
      /^[\w-]+$/,
      'Username can only contain letters, numbers, underscores, and hyphens'
    ),

  displayName: z
    .string()
    .min(1, 'Display name is required')
    .max(100, 'Display name must be less than 100 characters')
    .regex(/^[\d\s.A-Za-z-]+$/, 'Display name contains invalid characters'),

  url: z.string().url('Invalid URL format').max(2048),

  phoneNumber: z
    .string()
    .regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format'),

  sanitizedText: z
    .string()
    .max(1000, 'Text must be less than 1000 characters')
    .transform(val => sanitization.sanitizeUserInput(val)),
};

/**
 * Content Security Policy configuration
 */
export const cspConfig = {
  'default-src': ["'self'"],
  'script-src': [
    "'self'",
    "'unsafe-eval'", // Required for Next.js development
    "'unsafe-inline'", // Required for inline scripts
    'https://www.googletagmanager.com',
    'https://www.google-analytics.com',
  ],
  'style-src': [
    "'self'",
    "'unsafe-inline'", // Required for styled-components and CSS-in-JS
    'https://fonts.googleapis.com',
  ],
  'img-src': [
    "'self'",
    'data:',
    'blob:',
    'https:',
    'https://www.google-analytics.com',
  ],
  'font-src': ["'self'", 'https://fonts.gstatic.com'],
  'connect-src': [
    "'self'",
    'https://www.google-analytics.com',
    'https://vitals.vercel-analytics.com',
  ],
  'frame-src': ["'none'"],
  'object-src': ["'none'"],
  'base-uri': ["'self'"],
  'form-action': ["'self'"],
  'frame-ancestors': ["'none'"],
  'upgrade-insecure-requests': [],
};

/**
 * Generate CSP header string
 */
export function generateCSPHeader(): string {
  return Object.entries(cspConfig)
    .map(([directive, sources]) => {
      if (sources.length === 0) {
        return directive;
      }
      return `${directive} ${sources.join(' ')}`;
    })
    .join('; ');
}

/**
 * Security headers configuration
 */
export const securityHeaders = {
  'Content-Security-Policy': generateCSPHeader(),
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'X-XSS-Protection': '1; mode=block',
};

/**
 * Validate file upload security
 */
export const fileUploadValidation = {
  /**
   * Allowed file types for different upload contexts
   */
  allowedTypes: {
    images: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
    documents: ['application/pdf', 'text/plain', 'application/msword'],
    avatars: ['image/jpeg', 'image/png', 'image/webp'],
  },

  /**
   * Maximum file sizes (in bytes)
   */
  maxSizes: {
    avatar: 5 * 1024 * 1024, // 5MB
    document: 10 * 1024 * 1024, // 10MB
    image: 8 * 1024 * 1024, // 8MB
  },

  /**
   * Validate file type and size
   */
  validateFile(
    file: File,
    context: 'images' | 'documents' | 'avatars' = 'images'
  ): { valid: boolean; error?: string } {
    // Check file type
    if (!this.allowedTypes[context].includes(file.type)) {
      return {
        valid: false,
        error: `File type ${file.type} is not allowed for ${context}`,
      };
    }

    // Check file size
    const maxSize =
      context === 'avatars'
        ? this.maxSizes.avatar
        : context === 'documents'
          ? this.maxSizes.document
          : this.maxSizes.image;

    if (file.size > maxSize) {
      return {
        valid: false,
        error: `File size exceeds maximum allowed size of ${maxSize / (1024 * 1024)}MB`,
      };
    }

    return { valid: true };
  },
};

/**
 * Environment variable validation
 */
export function validateEnvironmentVariables(): void {
  const requiredVars = [
    'NEXTAUTH_SECRET',
    'NEXTAUTH_URL',
    'NEXT_PUBLIC_FIREBASE_API_KEY',
    'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
    'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
  ];

  const missing = requiredVars.filter(varName => !process.env[varName]);

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}`
    );
  }
}

/**
 * Generate secure random string
 */
export function generateSecureRandomString(length: number = 32): string {
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join(
      ''
    );
  }

  // Fallback for older environments
  return Array.from({ length }, () =>
    Math.floor(Math.random() * 16).toString(16)
  ).join('');
}
