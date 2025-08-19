// Rate limiting middleware for MemorAI API
import rateLimit from 'express-rate-limit';

// Global rate limiting for all API endpoints
export const globalRateLimit = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per 15 minutes
    message: {
        success: false,
        error: {
            code: 'RATE_LIMIT_EXCEEDED',
            message: 'Too many requests from this IP. Please try again in 15 minutes.',
            retryAfter: '15 minutes',
            timestamp: new Date().toISOString()
        }
    },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    skip: (req) => {
        // Skip rate limiting for health checks
        return req.path === '/health' || req.path === '/api/health';
    }
});

// Strict rate limiting for sensitive operations
export const strictRateLimit = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 10, // Limit to 10 requests per minute for sensitive operations
    message: {
        success: false,
        error: {
            code: 'RATE_LIMIT_EXCEEDED',
            message: 'Rate limit exceeded for sensitive operations. Please try again in 1 minute.',
            retryAfter: '1 minute',
            timestamp: new Date().toISOString()
        }
    },
    standardHeaders: true,
    legacyHeaders: false
});

// Very strict rate limiting for search operations
export const searchRateLimit = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 5, // Limit to 5 search requests per minute
    message: {
        success: false,
        error: {
            code: 'SEARCH_RATE_LIMIT_EXCEEDED',
            message: 'Search rate limit exceeded. Please try again in 1 minute.',
            retryAfter: '1 minute',
            timestamp: new Date().toISOString()
        }
    },
    standardHeaders: true,
    legacyHeaders: false
});

// Rate limiting for authentication attempts
export const authRateLimit = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit to 5 auth attempts per 15 minutes
    message: {
        success: false,
        error: {
            code: 'AUTH_RATE_LIMIT_EXCEEDED',
            message: 'Too many authentication attempts. Please try again in 15 minutes.',
            retryAfter: '15 minutes',
            timestamp: new Date().toISOString()
        }
    },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true // Don't count successful requests
});

// Custom rate limiting based on API key
export const createAPIKeyRateLimit = (maxRequests = 1000, windowMs = 60 * 60 * 1000) => {
    return rateLimit({
        windowMs, // Default: 1 hour
        max: maxRequests, // Default: 1000 requests per hour
        keyGenerator: (req) => {
            // Use API key for rate limiting instead of IP
            return req.headers['x-api-key'] ||
                req.headers['authorization'] ||
                req.ip;
        },
        message: {
            success: false,
            error: {
                code: 'API_KEY_RATE_LIMIT_EXCEEDED',
                message: `API key rate limit exceeded. Maximum ${maxRequests} requests per hour.`,
                timestamp: new Date().toISOString()
            }
        },
        standardHeaders: true,
        legacyHeaders: false
    });
};

// Progressive rate limiting - gets stricter with repeated violations
export const progressiveRateLimit = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: (req) => {
        // Check if this IP has been rate limited before
        const violations = req.rateLimitViolations || 0;

        if (violations === 0) return 100; // First time: 100 requests
        if (violations === 1) return 50;  // Second time: 50 requests
        if (violations === 2) return 25;  // Third time: 25 requests
        return 10; // After 3 violations: 10 requests
    },
    message: (req) => {
        const violations = req.rateLimitViolations || 0;
        return {
            success: false,
            error: {
                code: 'PROGRESSIVE_RATE_LIMIT_EXCEEDED',
                message: `Rate limit exceeded. Your limit has been reduced due to ${violations} previous violations.`,
                violations,
                timestamp: new Date().toISOString()
            }
        };
    },
    standardHeaders: true,
    legacyHeaders: false,
    onLimitReached: (req) => {
        // Track violations for progressive limiting
        req.rateLimitViolations = (req.rateLimitViolations || 0) + 1;
    }
});

export default {
    globalRateLimit,
    strictRateLimit,
    searchRateLimit,
    authRateLimit,
    createAPIKeyRateLimit,
    progressiveRateLimit
};
