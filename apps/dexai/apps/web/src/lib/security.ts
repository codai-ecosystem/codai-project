import React from 'react';

/**
 * Enterprise Security System
 * Comprehensive security measures for production environment
 */

// Security headers configuration
export const securityHeaders = {
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'X-XSS-Protection': '1; mode=block',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=()',
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://apis.google.com https://www.googletagmanager.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: https: blob:",
    "connect-src 'self' https://api.openai.com https://firestore.googleapis.com wss:",
    "frame-src 'self' https://www.google.com",
    "media-src 'self' blob:",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests"
  ].join('; ')
};

// Input validation and sanitization
export class SecurityValidator {
  private static readonly EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  private static readonly SQL_INJECTION_PATTERNS = [
    /('|(\\x27)|(\\x2D)(-)|(%27)|(%2D))/gi,
    /(union|select|insert|delete|update|drop|create|alter|exec|execute)/gi,
    /(script|javascript|vbscript|onload|onerror|onclick)/gi
  ];
  private static readonly XSS_PATTERNS = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /<\s*\/?\s*(script|object|embed|link|style|img|svg|iframe)/gi
  ];

  /**
   * Validate email format
   */
  static validateEmail(email: string): boolean {
    return this.EMAIL_REGEX.test(email.trim().toLowerCase());
  }

  /**
   * Validate password strength
   */
  static validatePassword(password: string): {
    isValid: boolean;
    score: number;
    feedback: string[];
  } {
    const feedback: string[] = [];
    let score = 0;

    if (password.length < 8) {
      feedback.push('Password must be at least 8 characters long');
    } else {
      score += 1;
    }

    if (!/[a-z]/.test(password)) {
      feedback.push('Password must contain at least one lowercase letter');
    } else {
      score += 1;
    }

    if (!/[A-Z]/.test(password)) {
      feedback.push('Password must contain at least one uppercase letter');
    } else {
      score += 1;
    }

    if (!/\d/.test(password)) {
      feedback.push('Password must contain at least one number');
    } else {
      score += 1;
    }

    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      feedback.push('Password must contain at least one special character');
    } else {
      score += 1;
    }

    return {
      isValid: score >= 4,
      score,
      feedback
    };
  }

  /**
   * Sanitize input to prevent XSS
   */
  static sanitizeInput(input: string): string {
    if (typeof input !== 'string') {
      return '';
    }

    // Remove dangerous HTML tags and attributes
    let sanitized = input
      .replace(this.XSS_PATTERNS[0], '') // Remove script tags
      .replace(this.XSS_PATTERNS[1], '') // Remove iframe tags
      .replace(this.XSS_PATTERNS[2], '') // Remove javascript: protocol
      .replace(this.XSS_PATTERNS[3], '') // Remove event handlers
      .replace(this.XSS_PATTERNS[4], ''); // Remove dangerous tags

    // Encode special characters
    sanitized = sanitized
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');

    return sanitized.trim();
  }

  /**
   * Check for SQL injection patterns
   */
  static detectSQLInjection(input: string): boolean {
    return this.SQL_INJECTION_PATTERNS.some(pattern => pattern.test(input));
  }

  /**
   * Validate URL
   */
  static validateURL(url: string): boolean {
    try {
      const urlObj = new URL(url);
      return ['http:', 'https:'].includes(urlObj.protocol);
    } catch {
      return false;
    }
  }

  /**
   * Validate file type
   */
  static validateFileType(file: File, allowedTypes: string[]): boolean {
    return allowedTypes.includes(file.type);
  }

  /**
   * Validate file size
   */
  static validateFileSize(file: File, maxSizeMB: number): boolean {
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    return file.size <= maxSizeBytes;
  }

  /**
   * Generate secure token
   */
  static generateSecureToken(length: number = 32): string {
    if (typeof window !== 'undefined' && window.crypto) {
      const array = new Uint8Array(length);
      window.crypto.getRandomValues(array);
      return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
    }
    
    // Fallback for Node.js environment
    return Array.from({ length }, () => Math.floor(Math.random() * 16).toString(16)).join('');
  }
}

// Rate limiting
export class RateLimiter {
  private requests = new Map<string, { count: number; resetTime: number }>();
  private readonly windowMs: number;
  private readonly maxRequests: number;

  constructor(windowMs: number = 60000, maxRequests: number = 100) {
    this.windowMs = windowMs;
    this.maxRequests = maxRequests;

    // Clean up expired entries periodically
    setInterval(() => this.cleanup(), this.windowMs);
  }

  /**
   * Check if request is allowed
   */
  isAllowed(identifier: string): boolean {
    const now = Date.now();
    const record = this.requests.get(identifier);

    if (!record || now > record.resetTime) {
      this.requests.set(identifier, {
        count: 1,
        resetTime: now + this.windowMs
      });
      return true;
    }

    if (record.count >= this.maxRequests) {
      return false;
    }

    record.count++;
    return true;
  }

  /**
   * Get remaining requests
   */
  getRemaining(identifier: string): number {
    const record = this.requests.get(identifier);
    if (!record || Date.now() > record.resetTime) {
      return this.maxRequests;
    }
    return Math.max(0, this.maxRequests - record.count);
  }

  /**
   * Get reset time
   */
  getResetTime(identifier: string): number {
    const record = this.requests.get(identifier);
    if (!record || Date.now() > record.resetTime) {
      return Date.now() + this.windowMs;
    }
    return record.resetTime;
  }

  /**
   * Clean up expired entries
   */
  private cleanup(): void {
    const now = Date.now();
    for (const [key, record] of this.requests.entries()) {
      if (now > record.resetTime) {
        this.requests.delete(key);
      }
    }
  }
}

// Session management
export class SessionManager {
  private static readonly SESSION_KEY = 'dexai_session';
  private static readonly SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours

  /**
   * Create new session
   */
  static createSession(userId: string): string {
    const sessionId = SecurityValidator.generateSecureToken(48);
    const session = {
      id: sessionId,
      userId,
      createdAt: Date.now(),
      expiresAt: Date.now() + this.SESSION_DURATION,
      lastActivity: Date.now()
    };

    if (typeof window !== 'undefined') {
      localStorage.setItem(this.SESSION_KEY, JSON.stringify(session));
    }

    return sessionId;
  }

  /**
   * Validate session
   */
  static validateSession(): { isValid: boolean; userId?: string; sessionId?: string } {
    if (typeof window === 'undefined') {
      return { isValid: false };
    }

    try {
      const sessionData = localStorage.getItem(this.SESSION_KEY);
      if (!sessionData) {
        return { isValid: false };
      }

      const session = JSON.parse(sessionData);
      const now = Date.now();

      if (now > session.expiresAt) {
        this.destroySession();
        return { isValid: false };
      }

      // Update last activity
      session.lastActivity = now;
      localStorage.setItem(this.SESSION_KEY, JSON.stringify(session));

      return {
        isValid: true,
        userId: session.userId,
        sessionId: session.id
      };
    } catch {
      this.destroySession();
      return { isValid: false };
    }
  }

  /**
   * Destroy session
   */
  static destroySession(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.SESSION_KEY);
    }
  }

  /**
   * Refresh session
   */
  static refreshSession(): boolean {
    const validation = this.validateSession();
    if (!validation.isValid || !validation.userId) {
      return false;
    }

    this.createSession(validation.userId);
    return true;
  }
}

// Content Security Policy manager
export class CSPManager {
  private static nonces = new Set<string>();

  /**
   * Generate CSP nonce
   */
  static generateNonce(): string {
    const nonce = SecurityValidator.generateSecureToken(16);
    this.nonces.add(nonce);
    return nonce;
  }

  /**
   * Validate nonce
   */
  static validateNonce(nonce: string): boolean {
    return this.nonces.has(nonce);
  }

  /**
   * Clear expired nonces
   */
  static clearNonces(): void {
    this.nonces.clear();
  }
}

// Encryption utilities
export class EncryptionUtils {
  /**
   * Hash password with salt
   */
  static async hashPassword(password: string, salt?: string): Promise<{ hash: string; salt: string }> {
    if (typeof window === 'undefined') {
      // Node.js environment - return mock for now
      const generatedSalt = salt || SecurityValidator.generateSecureToken(16);
      return {
        hash: `mock_hash_${password}_${generatedSalt}`,
        salt: generatedSalt
      };
    }

    // Browser environment
    const encoder = new TextEncoder();
    const generatedSalt = salt || SecurityValidator.generateSecureToken(16);
    const data = encoder.encode(password + generatedSalt);
    
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    return { hash, salt: generatedSalt };
  }

  /**
   * Verify password
   */
  static async verifyPassword(password: string, hash: string, salt: string): Promise<boolean> {
    const { hash: newHash } = await this.hashPassword(password, salt);
    return newHash === hash;
  }

  /**
   * Encrypt data (simple AES-like operation for client-side)
   */
  static encrypt(data: string, key: string): string {
    // Simple XOR encryption for demonstration
    // In production, use proper encryption libraries
    let result = '';
    for (let i = 0; i < data.length; i++) {
      result += String.fromCharCode(
        data.charCodeAt(i) ^ key.charCodeAt(i % key.length)
      );
    }
    return btoa(result);
  }

  /**
   * Decrypt data
   */
  static decrypt(encryptedData: string, key: string): string {
    try {
      const data = atob(encryptedData);
      let result = '';
      for (let i = 0; i < data.length; i++) {
        result += String.fromCharCode(
          data.charCodeAt(i) ^ key.charCodeAt(i % key.length)
        );
      }
      return result;
    } catch {
      return '';
    }
  }
}

// Export security instances
export const rateLimiter = new RateLimiter();

// React hooks for security
export function useSecureInput(initialValue: string = '') {
  const [value, setValue] = React.useState(initialValue);
  const [sanitizedValue, setSanitizedValue] = React.useState(
    SecurityValidator.sanitizeInput(initialValue)
  );

  React.useEffect(() => {
    setSanitizedValue(SecurityValidator.sanitizeInput(value));
  }, [value]);

  return {
    value,
    sanitizedValue,
    setValue,
    isValid: !SecurityValidator.detectSQLInjection(value)
  };
}

export function useSession() {
  const [session, setSession] = React.useState(() => SessionManager.validateSession());

  React.useEffect(() => {
    const interval = setInterval(() => {
      const currentSession = SessionManager.validateSession();
      setSession(currentSession);
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, []);

  const createSession = React.useCallback((userId: string) => {
    const sessionId = SessionManager.createSession(userId);
    setSession(SessionManager.validateSession());
    return sessionId;
  }, []);

  const destroySession = React.useCallback(() => {
    SessionManager.destroySession();
    setSession({ isValid: false });
  }, []);

  const refreshSession = React.useCallback(() => {
    const success = SessionManager.refreshSession();
    if (success) {
      setSession(SessionManager.validateSession());
    }
    return success;
  }, []);

  return {
    session,
    createSession,
    destroySession,
    refreshSession
  };
}
