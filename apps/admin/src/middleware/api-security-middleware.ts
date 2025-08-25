/**
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
}