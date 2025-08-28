/**
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
            allowed: allowed,
            limit: (this as any).options.maxRequests,
            remaining: Math.max(0, (this as any).options.maxRequests - record.requests.length),
            resetTime: now + (this as any).options.windowMs,
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
    override checkLimit(identifier: string): RateLimitResult {
        const key = (this as any).options.keyGenerator(identifier);
        const now = Date.now();
        const windowStart = now - (this as any).options.windowMs;

        let record = (this as any).store.get(key);
        
        if (!record) {
            record = { count: 0, resetTime: 0, requests: [] };
            (this as any).store.set(key, record);
        }

        // Remove old requests
        record.requests = record.requests.filter((time: number) => time > windowStart);
        
        const allowed = record.requests.length < (this as any).options.maxRequests;
        
        if (allowed) {
            record.requests.push(now);
        }

        return {
            allowed,
            limit: (this as any).options.maxRequests,
            remaining: Math.max(0, (this as any).options.maxRequests - record.requests.length),
            resetTime: now + (this as any).options.windowMs,
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
            const identifier = (this as any).getClientIdentifier ? (this as any).getClientIdentifier() : 'default';
            const result = limiter.checkLimit(identifier);
            
            if (!result.allowed) {
                throw new Error(`Rate limit exceeded. Try again in ${result.retryAfter} seconds.`);
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
}