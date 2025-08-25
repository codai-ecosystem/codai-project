/**
 * @fileoverview CSP Headers Creator
 * @description Creates Content Security Policy headers and middleware
 */

import fs from 'fs';
import path from 'path';

export default function createCSPHeaders(dirs, appName) {
    createCSPMiddleware(dirs.middlewareDir, appName);
    createNextJSSecurityConfig(dirs.appDir, appName);
    createSecurityUtils(dirs.utilsDir, appName);
    console.log(`🔐 CSP headers and security policies created for ${appName}`);
}

function createCSPMiddleware(middlewareDir, appName) {
    const cspMiddlewareContent = `/**
 * @fileoverview Content Security Policy Middleware
 * @description Implements comprehensive CSP headers for ${appName}
 */

import { NextRequest, NextResponse } from 'next/server';

export interface CSPDirectives {
    'default-src': string[];
    'script-src': string[];
    'style-src': string[];
    'img-src': string[];
    'font-src': string[];
    'connect-src': string[];
    'frame-src': string[];
    'object-src': string[];
    'media-src': string[];
    'worker-src': string[];
    'child-src': string[];
    'frame-ancestors': string[];
    'base-uri': string[];
    'form-action': string[];
}

const CSP_DIRECTIVES: CSPDirectives = {
    'default-src': ["'self'"],
    'script-src': [
        "'self'",
        "'unsafe-inline'", // Consider removing in production
        "'unsafe-eval'", // Required for development, remove in production
        'https://cdn.jsdelivr.net',
        'https://unpkg.com',
        'https://cdnjs.cloudflare.com'
    ],
    'style-src': [
        "'self'",
        "'unsafe-inline'",
        'https://fonts.googleapis.com',
        'https://cdn.jsdelivr.net'
    ],
    'img-src': [
        "'self'",
        'data:',
        'blob:',
        'https:',
        'https://*.codai.dev'
    ],
    'font-src': [
        "'self'",
        'https://fonts.gstatic.com',
        'https://cdn.jsdelivr.net'
    ],
    'connect-src': [
        "'self'",
        'https://api.codai.dev',
        'https://*.codai.dev',
        'wss://*.codai.dev',
        'ws://localhost:*',
        'http://localhost:*'
    ],
    'frame-src': ["'none'"],
    'object-src': ["'none'"],
    'media-src': ["'self'", 'https:'],
    'worker-src': ["'self'", 'blob:'],
    'child-src': ["'self'"],
    'frame-ancestors': ["'none'"],
    'base-uri': ["'self'"],
    'form-action': ["'self'"]
};

export function buildCSPHeader(directives: CSPDirectives = CSP_DIRECTIVES): string {
    return Object.entries(directives)
        .map(([directive, values]) => \`\${directive} \${values.join(' ')}\`)
        .join('; ');
}

export function cspMiddleware(request: NextRequest) {
    const response = NextResponse.next();
    
    // Build CSP header
    const cspHeader = buildCSPHeader();
    
    // Set security headers
    const securityHeaders = {
        'Content-Security-Policy': cspHeader,
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'X-XSS-Protection': '1; mode=block',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
        'Permissions-Policy': [
            'geolocation=()',
            'microphone=()',
            'camera=()',
            'fullscreen=(self)',
            'payment=()'
        ].join(', '),
    };

    // Add HTTPS-only headers in production
    if (process.env.NODE_ENV === 'production') {
        securityHeaders['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains; preload';
        securityHeaders['Cross-Origin-Embedder-Policy'] = 'require-corp';
        securityHeaders['Cross-Origin-Opener-Policy'] = 'same-origin';
        securityHeaders['Cross-Origin-Resource-Policy'] = 'same-origin';
    }

    // Apply headers
    Object.entries(securityHeaders).forEach(([key, value]) => {
        response.headers.set(key, value);
    });

    return response;
}

export function createNonce(): string {
    const crypto = require('crypto');
    return crypto.randomBytes(16).toString('base64');
}

export function addNonceToCSP(nonce: string): string {
    const directivesWithNonce = {
        ...CSP_DIRECTIVES,
        'script-src': [...CSP_DIRECTIVES['script-src'], \`'nonce-\${nonce}'\`],
        'style-src': [...CSP_DIRECTIVES['style-src'], \`'nonce-\${nonce}'\`]
    };
    
    return buildCSPHeader(directivesWithNonce);
}`;

    fs.writeFileSync(path.join(middlewareDir, 'csp-middleware.ts'), cspMiddlewareContent);
}

function createNextJSSecurityConfig(appDir, appName) {
    const middlewareContent = `import { NextRequest, NextResponse } from 'next/server';
import { cspMiddleware } from './src/middleware/csp-middleware';

export function middleware(request: NextRequest) {
    // Apply security middleware
    const response = cspMiddleware(request);
    
    // Add additional security measures
    const pathname = request.nextUrl.pathname;
    
    // Protect admin routes
    if (pathname.startsWith('/admin') || pathname.startsWith('/api/admin')) {
        const token = request.headers.get('authorization');
        if (!token || !isValidAdminToken(token)) {
            return NextResponse.redirect(new URL('/auth/login', request.url));
        }
    }
    
    // Rate limiting check
    if (pathname.startsWith('/api/')) {
        const rateLimitResult = checkRateLimit(request);
        if (!rateLimitResult.allowed) {
            return NextResponse.json(
                { error: 'Rate limit exceeded' },
                { status: 429 }
            );
        }
    }
    
    return response;
}

function isValidAdminToken(token: string): boolean {
    // Implement your token validation logic
    return token.startsWith('Bearer ') && token.length > 50;
}

function checkRateLimit(request: NextRequest): { allowed: boolean; remaining: number } {
    // Implement rate limiting logic
    // This is a simplified version - use Redis or memory store in production
    return { allowed: true, remaining: 100 };
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!_next/static|_next/image|favicon.ico).*)',
    ],
};`;

    const middlewarePath = path.join(appDir, 'middleware.ts');
    if (!fs.existsSync(middlewarePath)) {
        fs.writeFileSync(middlewarePath, middlewareContent);
    }

    // Create next.config.js security headers
    const nextConfigPath = path.join(appDir, 'next.config.js');
    const nextConfigContent = `/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'geolocation=(), microphone=(), camera=(), fullscreen=(self)'
          }
        ]
      }
    ];
  },
  
  async redirects() {
    return [
      // Redirect HTTP to HTTPS in production
      ...(process.env.NODE_ENV === 'production' ? [
        {
          source: '/:path*',
          has: [
            {
              type: 'header',
              key: 'x-forwarded-proto',
              value: 'http',
            },
          ],
          destination: 'https://${appName}.codai.dev/:path*',
          permanent: true,
        }
      ] : [])
    ];
  }
};

module.exports = nextConfig;`;

    if (!fs.existsSync(nextConfigPath)) {
        fs.writeFileSync(nextConfigPath, nextConfigContent);
    }
}

function createSecurityUtils(utilsDir, appName) {
    const securityUtilsContent = `/**
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
        return jwt.sign(payload, secret, { expiresIn });
    }
}`;

    fs.writeFileSync(path.join(utilsDir, 'security-utils.ts'), securityUtilsContent);
}