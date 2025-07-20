/**
 * Rate Limiting for CODAI APIs
 * Advanced rate limiting with different tiers and strategies
 */

import rateLimit from 'express-rate-limit';
import { Request, Response, NextFunction } from 'express';
import { CodaiApiResponse } from './standards';

export interface RateLimitConfig {
    windowMs: number;
    max: number;
    message?: string;
    keyGenerator?: (req: Request) => string;
    skip?: (req: Request) => boolean;
}

/**
 * Create standard rate limiter for CODAI services
 */
export const createCodaiRateLimit = (config: RateLimitConfig) => {
    return rateLimit({
        windowMs: config.windowMs,
        max: config.max,
        keyGenerator: config.keyGenerator || ((req: Request) => req.user?.id || req.ip || 'anonymous'),
        skip: config.skip || ((req: Request) => {
            // Skip health checks and ready checks
            return req.path === '/health' || req.path === '/ready';
        }),
        handler: (req: Request, res: Response) => {
            const response: CodaiApiResponse = {
                success: false,
                error: {
                    code: 'RATE_LIMIT_EXCEEDED',
                    message: config.message || 'Too many requests from this client',
                    details: {
                        limit: config.max,
                        windowMs: config.windowMs,
                        retryAfter: Math.ceil(config.windowMs / 1000),
                    },
                },
                meta: {
                    version: 'v1',
                    service: req.responseBuilder?.serviceName || 'unknown',
                    requestId: req.requestId || 'unknown',
                },
                timestamp: new Date().toISOString(),
            };

            res.status(429).json(response);
        },
        standardHeaders: true,
        legacyHeaders: false,
    });
};

// Predefined rate limit configurations for different use cases
export const RateLimitPresets = {
    // Basic rate limits
    strict: createCodaiRateLimit({
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 100, // 100 requests per 15 minutes
        message: 'Too many requests, please try again later',
    }),

    moderate: createCodaiRateLimit({
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 500, // 500 requests per 15 minutes
    }),

    lenient: createCodaiRateLimit({
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 1000, // 1000 requests per 15 minutes
    }),

    // API-specific limits
    auth: createCodaiRateLimit({
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 10, // 10 login attempts per 15 minutes
        message: 'Too many authentication attempts, please try again later',
    }),

    registration: createCodaiRateLimit({
        windowMs: 60 * 60 * 1000, // 1 hour
        max: 5, // 5 registrations per hour per IP
        message: 'Too many registration attempts, please try again later',
    }),

    upload: createCodaiRateLimit({
        windowMs: 60 * 60 * 1000, // 1 hour
        max: 100, // 100 uploads per hour
        message: 'Upload limit exceeded, please try again later',
    }),

    // High-frequency endpoints
    search: createCodaiRateLimit({
        windowMs: 1 * 60 * 1000, // 1 minute
        max: 60, // 60 searches per minute
        message: 'Search rate limit exceeded, please slow down',
    }),

    ai: createCodaiRateLimit({
        windowMs: 1 * 60 * 1000, // 1 minute
        max: 20, // 20 AI requests per minute
        message: 'AI service rate limit exceeded, please wait before making more requests',
    }),
};

/**
 * User tier based rate limiting
 */
export const createTieredRateLimit = (config: {
    free: RateLimitConfig;
    premium: RateLimitConfig;
    enterprise: RateLimitConfig;
}) => {
    return (req: Request, res: Response, next: NextFunction) => {
        // Determine user tier
        const userTier = req.user?.roles?.includes('enterprise') ? 'enterprise' :
            req.user?.roles?.includes('premium') ? 'premium' : 'free';

        // Apply appropriate rate limit
        const rateLimitConfig = config[userTier];
        const rateLimit = createCodaiRateLimit(rateLimitConfig);

        return rateLimit(req, res, next);
    };
};
