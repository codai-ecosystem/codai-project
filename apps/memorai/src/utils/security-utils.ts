/**
 * @fileoverview Security Utilities
 * @description Common security functions and validation utilities
 */

import crypto from 'crypto';
import validator from 'validator';

export class SecurityUtils {
    /**
     * Generate a cryptographically secure random token
     */
    static generateSecureToken(length: number = 32): string {
        return crypto.randomBytes(length).toString('hex');
    }
    
    /**
     * Generate a secure nonce for CSP
     */
    static generateNonce(): string {
        return crypto.randomBytes(16).toString('base64');
    }
    
    /**
     * Hash a password with salt
     */
    static async hashPassword(password: string): Promise<string> {
        const bcrypt = await import('bcrypt');
        const saltRounds = 12;
        return bcrypt.hash(password, saltRounds);
    }
    
    /**
     * Verify a password against its hash
     */
    static async verifyPassword(password: string, hash: string): Promise<boolean> {
        const bcrypt = await import('bcrypt');
        return bcrypt.compare(password, hash);
    }
    
    /**
     * Sanitize HTML to prevent XSS
     */
    static sanitizeHTML(html: string): string {
        return validator.escape(html);
    }
    
    /**
     * Validate and sanitize email
     */
    static validateEmail(email: string): { valid: boolean; sanitized: string } {
        const sanitized = validator.normalizeEmail(email) || '';
        return {
            valid: validator.isEmail(sanitized),
            sanitized
        };
    }
    
    /**
     * Validate password strength
     */
    static validatePasswordStrength(password: string): {
        valid: boolean;
        score: number;
        feedback: string[];
    } {
        const feedback: string[] = [];
        let score = 0;
        
        if (password.length < 12) {
            feedback.push('Password must be at least 12 characters long');
        } else {
            score += 2;
        }
        
        if (!/[a-z]/.test(password)) {
            feedback.push('Password must contain lowercase letters');
        } else {
            score += 1;
        }
        
        if (!/[A-Z]/.test(password)) {
            feedback.push('Password must contain uppercase letters');
        } else {
            score += 1;
        }
        
        if (!/[0-9]/.test(password)) {
            feedback.push('Password must contain numbers');
        } else {
            score += 1;
        }
        
        if (!/[^a-zA-Z0-9]/.test(password)) {
            feedback.push('Password must contain special characters');
        } else {
            score += 1;
        }
        
        return {
            valid: score >= 5,
            score,
            feedback
        };
    }
    
    /**
     * Rate limiting with in-memory store
     */
    private static rateLimitStore = new Map<string, { count: number; resetTime: number }>();
    
    static checkRateLimit(
        key: string, 
        maxRequests: number = 100, 
        windowMs: number = 15 * 60 * 1000
    ): { allowed: boolean; remaining: number; resetTime: number } {
        const now = Date.now();
        const windowStart = now - windowMs;
        
        // Clean old entries
        for (const [k, v] of this.rateLimitStore.entries()) {
            if (v.resetTime < now) {
                this.rateLimitStore.delete(k);
            }
        }
        
        const current = this.rateLimitStore.get(key);
        
        if (!current || current.resetTime < now) {
            this.rateLimitStore.set(key, {
                count: 1,
                resetTime: now + windowMs
            });
            return { allowed: true, remaining: maxRequests - 1, resetTime: now + windowMs };
        }
        
        if (current.count >= maxRequests) {
            return { allowed: false, remaining: 0, resetTime: current.resetTime };
        }
        
        current.count++;
        return { 
            allowed: true, 
            remaining: maxRequests - current.count, 
            resetTime: current.resetTime 
        };
    }
    
    /**
     * Validate JWT token
     */
    static async validateJWT(token: string, secret: string): Promise<any> {
        try {
            const jwt = await import('jsonwebtoken');
            return jwt.verify(token, secret);
        } catch (error) {
            throw new Error('Invalid token');
        }
    }
    
    /**
     * Generate JWT token
     */
    static async generateJWT(payload: any, secret: string, expiresIn: string = '24h'): Promise<string> {
        const jwt = await import('jsonwebtoken');
        return new Promise((resolve, reject) => {
            jwt.sign(payload, secret, { expiresIn: expiresIn as any }, (err: any, token: any) => {
                if (err) reject(err);
                else resolve(token);
            });
        });
    }
}