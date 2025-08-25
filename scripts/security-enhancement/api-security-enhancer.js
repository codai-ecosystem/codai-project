/**
 * @fileoverview API Security Enhancer
 * @description Creates comprehensive API security middleware and protection
 */

import fs from 'fs';
import path from 'path';

export default function createAPISecurityEnhancer(dirs, appName) {
    createAPISecurityMiddleware(dirs.middlewareDir, appName);
    createRateLimitingSystem(dirs.utilsDir, appName);
    createAPIAuthenticationUtils(dirs.utilsDir, appName);
    createSecureAPIRoutes(dirs.srcDir, appName);
    console.log(`🛡️ API security system created for ${appName}`);
}

function createAPISecurityMiddleware(middlewareDir, appName) {
    const apiSecurityContent = `/**
 * @fileoverview API Security Middleware
 * @description Comprehensive API protection middleware
 */

import { NextRequest, NextResponse } from 'next/server';
import { RateLimiter } from '../utils/rate-limiter';
import { SecurityUtils } from '../utils/security-utils';

export interface APISecurityConfig {
    rateLimit?: {
        windowMs: number;
        maxRequests: number;
    };
    requireAuth?: boolean;
    allowedOrigins?: string[];
    validateContentType?: boolean;
    maxBodySize?: number;
    enableCSRFProtection?: boolean;
}

const defaultConfig: APISecurityConfig = {
    rateLimit: {
        windowMs: 15 * 60 * 1000, // 15 minutes
        maxRequests: 100
    },
    requireAuth: true,
    allowedOrigins: process.env.NODE_ENV === 'production' 
        ? ['https://codai.dev', 'https://app.codai.dev']
        : ['http://localhost:3000', 'http://localhost:4006'],
    validateContentType: true,
    maxBodySize: 10 * 1024 * 1024, // 10MB
    enableCSRFProtection: true
};

export class APISecurityMiddleware {
    private rateLimiter: RateLimiter;
    private config: APISecurityConfig;

    constructor(config: Partial<APISecurityConfig> = {}) {
        this.config = { ...defaultConfig, ...config };
        this.rateLimiter = new RateLimiter(
            this.config.rateLimit?.maxRequests || 100,
            this.config.rateLimit?.windowMs || 15 * 60 * 1000
        );
    }

    async protect(request: NextRequest): Promise<NextResponse | null> {
        try {
            // 1. CORS validation
            const corsResult = this.validateCORS(request);
            if (corsResult) return corsResult;

            // 2. Rate limiting
            const rateLimitResult = await this.checkRateLimit(request);
            if (rateLimitResult) return rateLimitResult;

            // 3. Content type validation
            const contentTypeResult = this.validateContentType(request);
            if (contentTypeResult) return contentTypeResult;

            // 4. Body size validation
            const bodySizeResult = await this.validateBodySize(request);
            if (bodySizeResult) return bodySizeResult;

            // 5. Authentication check
            const authResult = await this.validateAuthentication(request);
            if (authResult) return authResult;

            // 6. CSRF protection
            const csrfResult = this.validateCSRF(request);
            if (csrfResult) return csrfResult;

            return null; // All checks passed
        } catch (error) {
            console.error('API Security Middleware Error:', error);
            return this.errorResponse('Internal server error', 500);
        }
    }

    private validateCORS(request: NextRequest): NextResponse | null {
        const origin = request.headers.get('origin');
        
        if (origin && this.config.allowedOrigins) {
            if (!this.config.allowedOrigins.includes(origin)) {
                return this.errorResponse('CORS policy violation', 403);
            }
        }

        return null;
    }

    private async checkRateLimit(request: NextRequest): Promise<NextResponse | null> {
        const clientIP = this.getClientIP(request);
        const rateLimitResult = this.rateLimiter.checkLimit(clientIP);

        if (!rateLimitResult.allowed) {
            const response = this.errorResponse('Rate limit exceeded', 429);
            response.headers.set('X-RateLimit-Limit', rateLimitResult.limit.toString());
            response.headers.set('X-RateLimit-Remaining', rateLimitResult.remaining.toString());
            response.headers.set('X-RateLimit-Reset', rateLimitResult.resetTime.toString());
            return response;
        }

        return null;
    }

    private validateContentType(request: NextRequest): NextResponse | null {
        if (!this.config.validateContentType) return null;

        const method = request.method;
        if (['POST', 'PUT', 'PATCH'].includes(method)) {
            const contentType = request.headers.get('content-type');
            
            if (!contentType) {
                return this.errorResponse('Content-Type header required', 400);
            }

            const allowedTypes = [
                'application/json',
                'application/x-www-form-urlencoded',
                'multipart/form-data',
                'text/plain'
            ];

            if (!allowedTypes.some(type => contentType.includes(type))) {
                return this.errorResponse('Unsupported Content-Type', 415);
            }
        }

        return null;
    }

    private async validateBodySize(request: NextRequest): Promise<NextResponse | null> {
        if (!this.config.maxBodySize) return null;

        const contentLength = request.headers.get('content-length');
        if (contentLength) {
            const size = parseInt(contentLength, 10);
            if (size > this.config.maxBodySize) {
                return this.errorResponse('Payload too large', 413);
            }
        }

        return null;
    }

    private async validateAuthentication(request: NextRequest): Promise<NextResponse | null> {
        if (!this.config.requireAuth) return null;

        const authHeader = request.headers.get('authorization');
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return this.errorResponse('Authentication required', 401);
        }

        const token = authHeader.substring(7);
        
        try {
            const isValid = await this.validateToken(token);
            if (!isValid) {
                return this.errorResponse('Invalid token', 401);
            }
        } catch (error) {
            return this.errorResponse('Token validation failed', 401);
        }

        return null;
    }

    private validateCSRF(request: NextRequest): NextResponse | null {
        if (!this.config.enableCSRFProtection) return null;

        const method = request.method;
        if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(method)) {
            const csrfToken = request.headers.get('x-csrf-token');
            const sessionCsrfToken = request.cookies.get('csrf-token')?.value;

            if (!csrfToken || !sessionCsrfToken || csrfToken !== sessionCsrfToken) {
                return this.errorResponse('CSRF token validation failed', 403);
            }
        }

        return null;
    }

    private async validateToken(token: string): Promise<boolean> {
        try {
            const secret = process.env.JWT_SECRET || 'default-secret';
            await SecurityUtils.validateJWT(token, secret);
            return true;
        } catch {
            return false;
        }
    }

    private getClientIP(request: NextRequest): string {
        const forwarded = request.headers.get('x-forwarded-for');
        const real = request.headers.get('x-real-ip');
        
        if (forwarded) {
            return forwarded.split(',')[0].trim();
        }
        
        if (real) {
            return real;
        }
        
        return 'unknown';
    }

    private errorResponse(message: string, status: number): NextResponse {
        return NextResponse.json(
            { 
                error: message, 
                timestamp: new Date().toISOString(),
                status 
            },
            { status }
        );
    }
}

// Factory function for different API security levels
export function createAPISecurityMiddleware(level: 'basic' | 'standard' | 'high' = 'standard') {
    const configs = {
        basic: {
            requireAuth: false,
            enableCSRFProtection: false,
            rateLimit: { windowMs: 15 * 60 * 1000, maxRequests: 1000 }
        },
        standard: {
            requireAuth: true,
            enableCSRFProtection: true,
            rateLimit: { windowMs: 15 * 60 * 1000, maxRequests: 100 }
        },
        high: {
            requireAuth: true,
            enableCSRFProtection: true,
            validateContentType: true,
            maxBodySize: 1 * 1024 * 1024, // 1MB
            rateLimit: { windowMs: 15 * 60 * 1000, maxRequests: 50 }
        }
    };

    return new APISecurityMiddleware(configs[level]);
}

// Middleware wrapper for Next.js API routes
export function withAPIProtection(
    handler: (req: NextRequest) => Promise<NextResponse>,
    config?: Partial<APISecurityConfig>
) {
    const security = new APISecurityMiddleware(config);

    return async (request: NextRequest): Promise<NextResponse> => {
        const securityResult = await security.protect(request);
        
        if (securityResult) {
            return securityResult;
        }

        return handler(request);
    };
}`;

    fs.writeFileSync(path.join(middlewareDir, 'api-security-middleware.ts'), apiSecurityContent);
}

function createRateLimitingSystem(utilsDir, appName) {
    const rateLimiterContent = `/**
 * @fileoverview Rate Limiting System
 * @description Advanced rate limiting with multiple strategies
 */

export interface RateLimitOptions {
    windowMs: number;
    maxRequests: number;
    keyGenerator?: (identifier: string) => string;
    onLimitReached?: (identifier: string) => void;
    skipSuccessfulRequests?: boolean;
    skipFailedRequests?: boolean;
}

export interface RateLimitResult {
    allowed: boolean;
    limit: number;
    remaining: number;
    resetTime: number;
    retryAfter?: number;
}

export class RateLimiter {
    private store = new Map<string, { count: number; resetTime: number; requests: number[] }>();
    private options: Required<RateLimitOptions>;

    constructor(maxRequests: number = 100, windowMs: number = 15 * 60 * 1000, options: Partial<RateLimitOptions> = {}) {
        this.options = {
            windowMs,
            maxRequests,
            keyGenerator: (id: string) => id,
            onLimitReached: () => {},
            skipSuccessfulRequests: false,
            skipFailedRequests: false,
            ...options
        };
        
        // Clean up expired entries every minute
        setInterval(() => this.cleanup(), 60 * 1000);
    }

    checkLimit(identifier: string): RateLimitResult {
        const key = this.options.keyGenerator(identifier);
        const now = Date.now();
        const windowStart = now - this.options.windowMs;

        let record = this.store.get(key);
        
        // Initialize or reset if window expired
        if (!record || record.resetTime <= now) {
            record = {
                count: 0,
                resetTime: now + this.options.windowMs,
                requests: []
            };
            this.store.set(key, record);
        }

        // Filter out requests outside the current window
        record.requests = record.requests.filter(time => time > windowStart);
        record.count = record.requests.length;

        const allowed = record.count < this.options.maxRequests;
        
        if (allowed) {
            record.requests.push(now);
            record.count++;
        } else {
            this.options.onLimitReached(identifier);
        }

        return {
            allowed,
            limit: this.options.maxRequests,
            remaining: Math.max(0, this.options.maxRequests - record.count),
            resetTime: record.resetTime,
            retryAfter: allowed ? undefined : Math.ceil((record.resetTime - now) / 1000)
        };
    }

    reset(identifier: string): void {
        const key = this.options.keyGenerator(identifier);
        this.store.delete(key);
    }

    private cleanup(): void {
        const now = Date.now();
        for (const [key, record] of this.store.entries()) {
            if (record.resetTime <= now) {
                this.store.delete(key);
            }
        }
    }

    getStats(): { totalKeys: number; memoryUsage: number } {
        return {
            totalKeys: this.store.size,
            memoryUsage: JSON.stringify([...this.store.entries()]).length
        };
    }
}

// Specialized rate limiters for different use cases
export class SlidingWindowRateLimiter extends RateLimiter {
    checkLimit(identifier: string): RateLimitResult {
        const key = this.options.keyGenerator(identifier);
        const now = Date.now();
        const windowStart = now - this.options.windowMs;

        let record = this.store.get(key);
        
        if (!record) {
            record = { count: 0, resetTime: 0, requests: [] };
            this.store.set(key, record);
        }

        // Remove old requests
        record.requests = record.requests.filter(time => time > windowStart);
        
        const allowed = record.requests.length < this.options.maxRequests;
        
        if (allowed) {
            record.requests.push(now);
        }

        return {
            allowed,
            limit: this.options.maxRequests,
            remaining: Math.max(0, this.options.maxRequests - record.requests.length),
            resetTime: now + this.options.windowMs,
            retryAfter: allowed ? undefined : 1
        };
    }
}

export class TokenBucketRateLimiter {
    private buckets = new Map<string, { tokens: number; lastRefill: number }>();
    private maxTokens: number;
    private refillRate: number; // tokens per second

    constructor(maxTokens: number = 100, refillRate: number = 10) {
        this.maxTokens = maxTokens;
        this.refillRate = refillRate;
        
        setInterval(() => this.refillBuckets(), 1000);
    }

    checkLimit(identifier: string): RateLimitResult {
        const now = Date.now();
        let bucket = this.buckets.get(identifier);
        
        if (!bucket) {
            bucket = { tokens: this.maxTokens, lastRefill: now };
            this.buckets.set(identifier, bucket);
        }

        // Refill tokens based on time passed
        const timePassed = (now - bucket.lastRefill) / 1000;
        const tokensToAdd = Math.floor(timePassed * this.refillRate);
        
        if (tokensToAdd > 0) {
            bucket.tokens = Math.min(this.maxTokens, bucket.tokens + tokensToAdd);
            bucket.lastRefill = now;
        }

        const allowed = bucket.tokens > 0;
        
        if (allowed) {
            bucket.tokens--;
        }

        return {
            allowed,
            limit: this.maxTokens,
            remaining: bucket.tokens,
            resetTime: now + ((this.maxTokens - bucket.tokens) / this.refillRate) * 1000,
            retryAfter: allowed ? undefined : Math.ceil((1 - bucket.tokens) / this.refillRate)
        };
    }

    private refillBuckets(): void {
        const now = Date.now();
        
        for (const [key, bucket] of this.buckets.entries()) {
            const timePassed = (now - bucket.lastRefill) / 1000;
            const tokensToAdd = Math.floor(timePassed * this.refillRate);
            
            if (tokensToAdd > 0) {
                bucket.tokens = Math.min(this.maxTokens, bucket.tokens + tokensToAdd);
                bucket.lastRefill = now;
            }
        }
    }
}

// Rate limiting decorators and utilities
export function rateLimited(
    maxRequests: number = 100,
    windowMs: number = 15 * 60 * 1000
) {
    const limiter = new RateLimiter(maxRequests, windowMs);
    
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        const originalMethod = descriptor.value;
        
        descriptor.value = async function (...args: any[]) {
            const identifier = this.getClientIdentifier ? this.getClientIdentifier() : 'default';
            const result = limiter.checkLimit(identifier);
            
            if (!result.allowed) {
                throw new Error(\`Rate limit exceeded. Try again in \${result.retryAfter} seconds.\`);
            }
            
            return originalMethod.apply(this, args);
        };
    };
}

export function createRateLimitMiddleware(
    limiter: RateLimiter,
    keyGenerator?: (req: any) => string
) {
    return (req: any, res: any, next: any) => {
        const identifier = keyGenerator ? keyGenerator(req) : req.ip || 'unknown';
        const result = limiter.checkLimit(identifier);
        
        res.set({
            'X-RateLimit-Limit': result.limit.toString(),
            'X-RateLimit-Remaining': result.remaining.toString(),
            'X-RateLimit-Reset': result.resetTime.toString()
        });
        
        if (!result.allowed) {
            return res.status(429).json({
                error: 'Rate limit exceeded',
                retryAfter: result.retryAfter
            });
        }
        
        next();
    };
}`;

    fs.writeFileSync(path.join(utilsDir, 'rate-limiter.ts'), rateLimiterContent);
}

function createAPIAuthenticationUtils(utilsDir, appName) {
    const authUtilsContent = `/**
 * @fileoverview API Authentication Utilities
 * @description JWT, API key management, and authentication helpers
 */

import crypto from 'crypto';

export interface User {
    id: string;
    email: string;
    role: string;
    permissions: string[];
    lastLogin?: Date;
    isActive: boolean;
}

export interface JWTPayload {
    sub: string; // subject (user ID)
    email: string;
    role: string;
    permissions: string[];
    iat: number; // issued at
    exp: number; // expiration
    jti: string; // JWT ID for revocation
}

export interface APIKey {
    id: string;
    key: string;
    name: string;
    userId: string;
    permissions: string[];
    expiresAt?: Date;
    lastUsed?: Date;
    isActive: boolean;
    rateLimit?: {
        maxRequests: number;
        windowMs: number;
    };
}

export class AuthenticationService {
    private jwtSecret: string;
    private jwtExpiration: string;
    private refreshTokenExpiration: string;
    private revokedTokens = new Set<string>();

    constructor(
        jwtSecret: string = process.env.JWT_SECRET || 'default-secret',
        jwtExpiration: string = '24h',
        refreshTokenExpiration: string = '7d'
    ) {
        this.jwtSecret = jwtSecret;
        this.jwtExpiration = jwtExpiration;
        this.refreshTokenExpiration = refreshTokenExpiration;
    }

    /**
     * Generate JWT token for user
     */
    async generateToken(user: User): Promise<{ accessToken: string; refreshToken: string }> {
        const jwt = await import('jsonwebtoken');
        const jti = crypto.randomUUID();
        
        const payload: JWTPayload = {
            sub: user.id,
            email: user.email,
            role: user.role,
            permissions: user.permissions,
            iat: Math.floor(Date.now() / 1000),
            exp: Math.floor(Date.now() / 1000) + this.parseExpiration(this.jwtExpiration),
            jti
        };

        const accessToken = jwt.sign(payload, this.jwtSecret, {
            expiresIn: this.jwtExpiration,
            issuer: '${appName}',
            audience: '${appName}-api'
        });

        const refreshPayload = {
            sub: user.id,
            type: 'refresh',
            jti: crypto.randomUUID()
        };

        const refreshToken = jwt.sign(refreshPayload, this.jwtSecret, {
            expiresIn: this.refreshTokenExpiration,
            issuer: '${appName}',
            audience: '${appName}-api'
        });

        return { accessToken, refreshToken };
    }

    /**
     * Verify and decode JWT token
     */
    async verifyToken(token: string): Promise<JWTPayload> {
        const jwt = await import('jsonwebtoken');
        
        try {
            const decoded = jwt.verify(token, this.jwtSecret, {
                issuer: '${appName}',
                audience: '${appName}-api'
            }) as JWTPayload;

            // Check if token is revoked
            if (this.revokedTokens.has(decoded.jti)) {
                throw new Error('Token has been revoked');
            }

            return decoded;
        } catch (error) {
            if (error instanceof jwt.TokenExpiredError) {
                throw new Error('Token has expired');
            } else if (error instanceof jwt.JsonWebTokenError) {
                throw new Error('Invalid token');
            }
            throw error;
        }
    }

    /**
     * Revoke a JWT token
     */
    revokeToken(jti: string): void {
        this.revokedTokens.add(jti);
        
        // Clean up old revoked tokens periodically
        if (this.revokedTokens.size > 10000) {
            this.cleanupRevokedTokens();
        }
    }

    /**
     * Generate API key
     */
    generateAPIKey(userId: string, name: string, permissions: string[]): APIKey {
        const key = \`\${appName}_\${crypto.randomBytes(32).toString('hex')}\`;
        
        return {
            id: crypto.randomUUID(),
            key,
            name,
            userId,
            permissions,
            isActive: true,
            rateLimit: {
                maxRequests: 1000,
                windowMs: 60 * 60 * 1000 // 1 hour
            }
        };
    }

    /**
     * Validate API key
     */
    async validateAPIKey(key: string): Promise<APIKey | null> {
        // This would typically query a database
        // For now, returning null as placeholder
        return null;
    }

    /**
     * Hash API key for storage
     */
    hashAPIKey(key: string): string {
        return crypto.createHash('sha256').update(key).digest('hex');
    }

    /**
     * Check permissions
     */
    hasPermission(userPermissions: string[], requiredPermission: string): boolean {
        return userPermissions.includes('*') || userPermissions.includes(requiredPermission);
    }

    /**
     * Check role-based access
     */
    hasRole(userRole: string, allowedRoles: string[]): boolean {
        return allowedRoles.includes(userRole) || userRole === 'admin';
    }

    /**
     * Generate secure password reset token
     */
    generatePasswordResetToken(userId: string): { token: string; expiresAt: Date } {
        const token = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
        
        return { token, expiresAt };
    }

    /**
     * Generate email verification token
     */
    generateEmailVerificationToken(email: string): { token: string; expiresAt: Date } {
        const token = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
        
        return { token, expiresAt };
    }

    private parseExpiration(expiration: string): number {
        const unit = expiration.slice(-1);
        const value = parseInt(expiration.slice(0, -1));
        
        switch (unit) {
            case 's': return value;
            case 'm': return value * 60;
            case 'h': return value * 60 * 60;
            case 'd': return value * 24 * 60 * 60;
            default: return 24 * 60 * 60; // default 24 hours
        }
    }

    private cleanupRevokedTokens(): void {
        // Keep only recent tokens (this is simplified - in production use Redis with TTL)
        this.revokedTokens.clear();
    }
}

// Authentication middleware factory
export function requireAuth(permissions: string[] = []) {
    return async (req: any, res: any, next: any) => {
        try {
            const authHeader = req.headers.authorization;
            
            if (!authHeader || !authHeader.startsWith('Bearer ')) {
                return res.status(401).json({ error: 'Authentication required' });
            }

            const token = authHeader.substring(7);
            const auth = new AuthenticationService();
            const decoded = await auth.verifyToken(token);

            // Check permissions if specified
            if (permissions.length > 0) {
                const hasPermission = permissions.some(permission => 
                    auth.hasPermission(decoded.permissions, permission)
                );
                
                if (!hasPermission) {
                    return res.status(403).json({ error: 'Insufficient permissions' });
                }
            }

            // Attach user info to request
            req.user = decoded;
            next();
        } catch (error) {
            return res.status(401).json({ error: error.message });
        }
    };
}

// API key authentication middleware
export function requireAPIKey(permissions: string[] = []) {
    return async (req: any, res: any, next: any) => {
        try {
            const apiKey = req.headers['x-api-key'];
            
            if (!apiKey) {
                return res.status(401).json({ error: 'API key required' });
            }

            const auth = new AuthenticationService();
            const keyData = await auth.validateAPIKey(apiKey);

            if (!keyData || !keyData.isActive) {
                return res.status(401).json({ error: 'Invalid API key' });
            }

            // Check permissions
            if (permissions.length > 0) {
                const hasPermission = permissions.some(permission => 
                    auth.hasPermission(keyData.permissions, permission)
                );
                
                if (!hasPermission) {
                    return res.status(403).json({ error: 'Insufficient permissions' });
                }
            }

            req.apiKey = keyData;
            next();
        } catch (error) {
            return res.status(401).json({ error: error.message });
        }
    };
}`;

    fs.writeFileSync(path.join(utilsDir, 'auth-utils.ts'), authUtilsContent);
}

function createSecureAPIRoutes(srcDir, appName) {
    const apiDir = path.join(srcDir, 'pages', 'api');
    if (!fs.existsSync(apiDir)) {
        fs.mkdirSync(apiDir, { recursive: true });
    }

    const secureAPIExampleContent = `/**
 * @fileoverview Secure API Route Example
 * @description Example of a secure API route with comprehensive protection
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { withAPIProtection } from '../../middleware/api-security-middleware';
import { requireAuth } from '../../utils/auth-utils';
import { validateInput, userRegistrationSchema } from '../../utils/validation-schemas';
import { InputSanitizer } from '../../middleware/sanitization-middleware';

// Example protected API route
async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        switch (req.method) {
            case 'GET':
                return handleGet(req, res);
            case 'POST':
                return handlePost(req, res);
            case 'PUT':
                return handlePut(req, res);
            case 'DELETE':
                return handleDelete(req, res);
            default:
                return res.status(405).json({ error: 'Method not allowed' });
        }
    } catch (error) {
        console.error('API Error:', error);
        return res.status(500).json({ 
            error: 'Internal server error',
            requestId: req.headers['x-request-id'] || 'unknown'
        });
    }
}

async function handleGet(req: NextApiRequest, res: NextApiResponse) {
    // Example: Get user data with authentication
    const { user } = req as any;
    
    return res.status(200).json({
        success: true,
        data: {
            id: user.sub,
            email: user.email,
            role: user.role
        }
    });
}

async function handlePost(req: NextApiRequest, res: NextApiResponse) {
    // Example: Create new resource with validation and sanitization
    try {
        // Sanitize input
        const sanitizedBody = InputSanitizer.sanitizeObject(req.body);
        
        // Validate input
        const validatedData = validateInput(userRegistrationSchema, sanitizedBody);
        
        // Process the validated and sanitized data
        const result = await processSecurelyData(validatedData);
        
        return res.status(201).json({
            success: true,
            data: result
        });
    } catch (error) {
        if (error.name === 'ValidationError') {
            return res.status(400).json({
                error: 'Validation failed',
                details: error.errors
            });
        }
        throw error;
    }
}

async function handlePut(req: NextApiRequest, res: NextApiResponse) {
    // Example: Update resource with authorization check
    const { user } = req as any;
    const { id } = req.query;
    
    // Check if user can update this resource
    if (!canUserUpdateResource(user, id as string)) {
        return res.status(403).json({ error: 'Insufficient permissions' });
    }
    
    // Sanitize and validate input
    const sanitizedBody = InputSanitizer.sanitizeObject(req.body);
    const validatedData = validateInput(profileUpdateSchema, sanitizedBody);
    
    const result = await updateResourceSecurely(id as string, validatedData);
    
    return res.status(200).json({
        success: true,
        data: result
    });
}

async function handleDelete(req: NextApiRequest, res: NextApiResponse) {
    // Example: Delete resource with strict authorization
    const { user } = req as any;
    const { id } = req.query;
    
    // Only admins or resource owners can delete
    if (user.role !== 'admin' && !isResourceOwner(user.sub, id as string)) {
        return res.status(403).json({ error: 'Insufficient permissions' });
    }
    
    await deleteResourceSecurely(id as string);
    
    return res.status(204).end();
}

// Helper functions (implement according to your business logic)
async function processSecurelyData(data: any) {
    // Implement secure data processing
    return { id: 'new-id', ...data };
}

async function updateResourceSecurely(id: string, data: any) {
    // Implement secure resource update
    return { id, ...data };
}

async function deleteResourceSecurely(id: string) {
    // Implement secure resource deletion
}

function canUserUpdateResource(user: any, resourceId: string): boolean {
    // Implement authorization logic
    return user.role === 'admin' || isResourceOwner(user.sub, resourceId);
}

function isResourceOwner(userId: string, resourceId: string): boolean {
    // Implement ownership check
    return true; // Placeholder
}

// Apply security middleware
export default withAPIProtection(
    requireAuth(['read', 'write'])(handler),
    {
        rateLimit: {
            windowMs: 15 * 60 * 1000,
            maxRequests: 100
        },
        requireAuth: true,
        enableCSRFProtection: true,
        maxBodySize: 1024 * 1024 // 1MB
    }
);`;

    fs.writeFileSync(path.join(apiDir, 'secure-example.ts'), secureAPIExampleContent);
}