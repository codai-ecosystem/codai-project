/**
 * Enterprise Security Framework
 * Input validation, rate limiting, and security utilities
 */

import React from 'react';

// Security validation utilities
export class SecurityValidator {
  static sanitizeInput(input: string): string {
    if (!input) return '';
    
    return input
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;')
      .trim();
  }

  static validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  static validatePassword(password: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }
    
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    
    if (!/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }
    
    return { valid: errors.length === 0, errors };
  }

  static validateXSS(input: string): boolean {
    const xssPatterns = [
      /<script[^>]*>.*?<\/script>/gi,
      /<iframe[^>]*>.*?<\/iframe>/gi,
      /javascript:/gi,
      /on\w+\s*=/gi
    ];
    
    return !xssPatterns.some(pattern => pattern.test(input));
  }
}

// Rate limiting utility
export class RateLimiter {
  private attempts: Map<string, { count: number; resetTime: number }> = new Map();
  private maxAttempts: number;
  private windowMs: number;

  constructor(maxAttempts = 10, windowMs = 15 * 60 * 1000) {
    this.maxAttempts = maxAttempts;
    this.windowMs = windowMs;
  }

  isAllowed(identifier: string): boolean {
    const now = Date.now();
    const attempt = this.attempts.get(identifier);

    if (!attempt) {
      this.attempts.set(identifier, { count: 1, resetTime: now + this.windowMs });
      return true;
    }

    if (now > attempt.resetTime) {
      this.attempts.set(identifier, { count: 1, resetTime: now + this.windowMs });
      return true;
    }

    if (attempt.count >= this.maxAttempts) {
      return false;
    }

    attempt.count++;
    return true;
  }

  getRemainingAttempts(identifier: string): number {
    const attempt = this.attempts.get(identifier);
    if (!attempt) return this.maxAttempts;
    
    const now = Date.now();
    if (now > attempt.resetTime) return this.maxAttempts;
    
    return Math.max(0, this.maxAttempts - attempt.count);
  }
}

// Session management
export class SessionManager {
  private sessionKey = 'dexai_session';
  
  createSession(userId: string, userData: any): string {
    const sessionId = this.generateSessionId();
    const sessionData = {
      userId,
      userData,
      createdAt: Date.now(),
      expiresAt: Date.now() + (24 * 60 * 60 * 1000), // 24 hours
    };
    
    if (typeof window !== 'undefined') {
      localStorage.setItem(`${this.sessionKey}_${sessionId}`, JSON.stringify(sessionData));
    }
    
    return sessionId;
  }

  validateSession(sessionId: string): boolean {
    if (typeof window === 'undefined') return false;
    
    const sessionData = localStorage.getItem(`${this.sessionKey}_${sessionId}`);
    if (!sessionData) return false;
    
    try {
      const parsed = JSON.parse(sessionData);
      return Date.now() < parsed.expiresAt;
    } catch {
      return false;
    }
  }

  destroySession(sessionId: string): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(`${this.sessionKey}_${sessionId}`);
    }
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substring(2)}`;
  }
}

// Encryption utilities (basic implementation)
export class EncryptionUtils {
  static async hashPassword(password: string): Promise<string> {
    if (typeof crypto === 'undefined') {
      // Fallback for environments without crypto
      return btoa(password + 'salt_' + Date.now());
    }
    
    const encoder = new TextEncoder();
    const data = encoder.encode(password + 'dexai_salt');
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  static generateToken(): string {
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
      const array = new Uint8Array(32);
      crypto.getRandomValues(array);
      return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
    }
    
    // Fallback
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }
}

// React hooks for security
export function useSecureInput(initialValue = '') {
  const [value, setValue] = React.useState(initialValue);
  const [sanitized, setSanitized] = React.useState(initialValue);

  React.useEffect(() => {
    setSanitized(SecurityValidator.sanitizeInput(value));
  }, [value]);

  const handleChange = React.useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setValue(event.target.value);
  }, []);

  return {
    value: sanitized,
    rawValue: value,
    onChange: handleChange,
    isValid: SecurityValidator.validateXSS(value)
  };
}

export function useRateLimit(identifier: string, maxAttempts = 10, windowMs = 15 * 60 * 1000) {
  const [rateLimiter] = React.useState(() => new RateLimiter(maxAttempts, windowMs));
  const [isAllowed, setIsAllowed] = React.useState(true);
  const [remainingAttempts, setRemainingAttempts] = React.useState(maxAttempts);

  const attempt = React.useCallback(() => {
    const allowed = rateLimiter.isAllowed(identifier);
    const remaining = rateLimiter.getRemainingAttempts(identifier);
    
    setIsAllowed(allowed);
    setRemainingAttempts(remaining);
    
    return allowed;
  }, [identifier, rateLimiter]);

  return { isAllowed, remainingAttempts, attempt };
}

// Global security instances
export const globalRateLimiter = new RateLimiter();
export const sessionManager = new SessionManager();

export default {
  SecurityValidator,
  RateLimiter,
  SessionManager,
  EncryptionUtils,
  useSecureInput,
  useRateLimit
};
