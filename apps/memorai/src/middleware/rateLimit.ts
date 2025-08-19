/**
 * 🛡️ Rate Limiting Middleware for MemorAI Production
 * 
 * Implements intelligent rate limiting to protect against DoS attacks
 * and ensure fair resource usage across all API endpoints.
 */

import { NextRequest, NextResponse } from 'next/server';

interface RateLimitEntry {
    count: number;
    firstRequest: number;
    lastRequest: number;
}

interface RateLimitConfig {
    windowMs: number;    // Time window in milliseconds
    max: number;         // Maximum requests per window
    message: string;     // Error message when limit exceeded
}

// Rate limiting configurations for different endpoint types
export const RATE_LIMIT_CONFIGS = {
    // General API endpoints
    GENERAL: {
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 100,                  // 100 requests per 15 minutes
        message: 'Too many requests. Please try again later.'
    },

    // Sensitive endpoints (memories, analytics)
    SENSITIVE: {
        windowMs: 1 * 60 * 1000,   // 1 minute
        max: 10,                    // 10 requests per minute
        message: 'Rate limit exceeded for sensitive operations. Please slow down.'
    },

    // Search endpoints
    SEARCH: {
        windowMs: 1 * 60 * 1000,   // 1 minute
        max: 20,                    // 20 searches per minute
        message: 'Search rate limit exceeded. Please wait before searching again.'
    },

    // Creation endpoints
    CREATE: {
        windowMs: 1 * 60 * 1000,   // 1 minute
        max: 5,                     // 5 creations per minute
        message: 'Creation rate limit exceeded. Please wait before creating more content.'
    }
} as const;

// In-memory rate limit store (in production, use Redis or similar)
const rateLimitStore = new Map<string, RateLimitEntry>();

/**
 * Clean up expired entries from rate limit store
 */
function cleanupExpiredEntries(): void {
    const now = Date.now();
    const maxAge = Math.max(...Object.values(RATE_LIMIT_CONFIGS).map(config => config.windowMs));

    for (const [key, entry] of rateLimitStore.entries()) {
        if (now - entry.lastRequest > maxAge) {
            rateLimitStore.delete(key);
        }
    }
}

/**
 * Get client identifier for rate limiting
 */
function getClientId(request: NextRequest): string {
    // Try to get API key first for authenticated requests
    const apiKey = request.headers.get('x-api-key') || request.headers.get('authorization');
    if (apiKey) {
        const cleanApiKey = apiKey.replace(/^Bearer\s+/i, '').trim();
        return `api_key:${cleanApiKey.slice(-8)}`; // Use last 8 chars for privacy
    }

    // Fall back to IP address
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0].trim() :
        request.headers.get('x-real-ip') ||
        'unknown';

    return `ip:${ip}`;
}

/**
 * Check if client has exceeded rate limit
 */
function checkRateLimit(clientId: string, config: RateLimitConfig): {
    allowed: boolean;
    remaining: number;
    resetTime: number;
} {
    const now = Date.now();
    const windowStart = now - config.windowMs;

    // Clean up expired entries periodically
    if (Math.random() < 0.01) { // 1% chance to trigger cleanup
        cleanupExpiredEntries();
    }

    const entry = rateLimitStore.get(clientId);

    if (!entry) {
        // First request from this client
        rateLimitStore.set(clientId, {
            count: 1,
            firstRequest: now,
            lastRequest: now
        });

        return {
            allowed: true,
            remaining: config.max - 1,
            resetTime: now + config.windowMs
        };
    }

    // Check if window has expired
    if (entry.firstRequest < windowStart) {
        // Reset the window
        rateLimitStore.set(clientId, {
            count: 1,
            firstRequest: now,
            lastRequest: now
        });

        return {
            allowed: true,
            remaining: config.max - 1,
            resetTime: now + config.windowMs
        };
    }

    // Increment counter
    entry.count++;
    entry.lastRequest = now;
    rateLimitStore.set(clientId, entry);

    const allowed = entry.count <= config.max;
    const remaining = Math.max(0, config.max - entry.count);
    const resetTime = entry.firstRequest + config.windowMs;

    return { allowed, remaining, resetTime };
}

/**
 * Create rate limiting middleware for specific configuration
 */
export function createRateLimiter(config: RateLimitConfig) {
    return function rateLimitMiddleware(request: NextRequest): NextResponse | null {
        const clientId = getClientId(request);
        const result = checkRateLimit(clientId, config);

        // Add rate limit headers to response
        const headers = {
            'X-RateLimit-Limit': config.max.toString(),
            'X-RateLimit-Remaining': result.remaining.toString(),
            'X-RateLimit-Reset': Math.ceil(result.resetTime / 1000).toString(),
            'X-RateLimit-Window': (config.windowMs / 1000).toString()
        };

        if (!result.allowed) {
            const retryAfter = Math.ceil((result.resetTime - Date.now()) / 1000);

            return NextResponse.json({
                success: false,
                error: {
                    code: 'RATE_LIMIT_EXCEEDED',
                    message: config.message,
                    retryAfter: retryAfter,
                    limit: config.max,
                    window: config.windowMs / 1000,
                    documentation: 'https://docs.memorai.com/rate-limits'
                }
            }, {
                status: 429,
                headers: {
                    ...headers,
                    'Retry-After': retryAfter.toString()
                }
            });
        }

        return null; // Allow request to continue
    };
}

// Pre-configured rate limiters for different endpoint types
export const generalRateLimit = createRateLimiter(RATE_LIMIT_CONFIGS.GENERAL);
export const sensitiveRateLimit = createRateLimiter(RATE_LIMIT_CONFIGS.SENSITIVE);
export const searchRateLimit = createRateLimiter(RATE_LIMIT_CONFIGS.SEARCH);
export const createRateLimit = createRateLimiter(RATE_LIMIT_CONFIGS.CREATE);

/**
 * Adaptive rate limiting based on endpoint type
 */
export function adaptiveRateLimit(request: NextRequest): NextResponse | null {
    const { pathname } = new URL(request.url);

    // Determine rate limit type based on endpoint
    if (pathname.includes('/search')) {
        return searchRateLimit(request);
    }

    if (pathname.includes('/memories') || pathname.includes('/analytics')) {
        if (request.method === 'POST') {
            return createRateLimit(request);
        }
        return sensitiveRateLimit(request);
    }

    // Default general rate limiting
    return generalRateLimit(request);
}

/**
 * Get current rate limit status for a client
 */
export function getRateLimitStatus(request: NextRequest, config: RateLimitConfig) {
    const clientId = getClientId(request);
    const result = checkRateLimit(clientId, config);

    return {
        clientId: clientId.replace(/^(ip|api_key):/, ''), // Remove prefix for display
        limit: config.max,
        remaining: result.remaining,
        resetTime: result.resetTime,
        window: config.windowMs / 1000
    };
}
