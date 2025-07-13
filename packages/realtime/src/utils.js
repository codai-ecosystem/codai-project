import crypto from 'crypto';
// Utility functions for real-time operations
export function generateId() {
    return crypto.randomUUID();
}
export function createTimestamp() {
    return Date.now();
}
export function calculateChecksum(data) {
    const str = JSON.stringify(data);
    return crypto.createHash('md5').update(str).digest('hex').slice(0, 8);
}
export function isValidMessage(message) {
    return (message &&
        typeof message === 'object' &&
        typeof message.id === 'string' &&
        typeof message.type === 'string' &&
        typeof message.timestamp === 'number' &&
        typeof message.sender === 'string');
}
export function sanitizeMessage(message) {
    // Remove sensitive fields and sanitize data
    const sanitized = { ...message };
    // Remove sensitive fields
    delete sanitized.password;
    delete sanitized.token;
    delete sanitized.secret;
    delete sanitized.apiKey;
    // Limit payload size
    if (sanitized.payload && typeof sanitized.payload === 'string' && sanitized.payload.length > 10000) {
        sanitized.payload = sanitized.payload.slice(0, 10000) + '... (truncated)';
    }
    return sanitized;
}
export function validateChannel(channel) {
    // Channel validation rules
    return (typeof channel === 'string' &&
        channel.length > 0 &&
        channel.length <= 100 &&
        /^[a-zA-Z0-9_-]+$/.test(channel));
}
export function validateUserId(userId) {
    return (typeof userId === 'string' &&
        userId.length > 0 &&
        userId.length <= 50 &&
        /^[a-zA-Z0-9_-]+$/.test(userId));
}
export function rateLimitKey(userId, action) {
    return `ratelimit:${userId}:${action}`;
}
export function parseAuthToken(token) {
    try {
        // Basic JWT parsing without verification (verification should be done server-side)
        const [, payload] = token.split('.');
        if (!payload)
            return { error: 'Invalid token format' };
        const decoded = JSON.parse(atob(payload));
        return {
            userId: decoded.sub || decoded.userId,
            roles: decoded.roles || [],
        };
    }
    catch (error) {
        return { error: 'Failed to parse token' };
    }
}
export function createAuthToken(userId, roles = [], expiresIn = 24 * 60 * 60 * 1000) {
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const payload = btoa(JSON.stringify({
        sub: userId,
        roles,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor((Date.now() + expiresIn) / 1000),
    }));
    // Note: This is a simplified version. In production, use proper JWT signing
    return `${header}.${payload}.signature`;
}
export function debounce(func, wait) {
    let timeout;
    return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    };
}
export function throttle(func, limit) {
    let inThrottle;
    return (...args) => {
        if (!inThrottle) {
            func(...args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}
export function retry(operation, maxAttempts = 3, delay = 1000) {
    return new Promise((resolve, reject) => {
        let attempts = 0;
        const attempt = async () => {
            try {
                const result = await operation();
                resolve(result);
            }
            catch (error) {
                attempts++;
                if (attempts >= maxAttempts) {
                    reject(error);
                }
                else {
                    setTimeout(attempt, delay * attempts);
                }
            }
        };
        attempt();
    });
}
export function formatLatency(ms) {
    if (ms < 1)
        return `${(ms * 1000).toFixed(0)}μs`;
    if (ms < 1000)
        return `${ms.toFixed(1)}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
}
export function formatBytes(bytes) {
    const sizes = ['B', 'KB', 'MB', 'GB'];
    if (bytes === 0)
        return '0 B';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
}
export function getNetworkLatency() {
    return new Promise((resolve) => {
        const start = performance.now();
        // Use a small fetch request to measure network latency
        fetch('/api/ping', { method: 'HEAD' })
            .then(() => {
            const latency = performance.now() - start;
            resolve(latency);
        })
            .catch(() => {
            // Fallback latency estimate
            resolve(100);
        });
    });
}
export class CircularBuffer {
    constructor(size) {
        this.index = 0;
        this.count = 0;
        this.size = size;
        this.buffer = new Array(size);
    }
    push(item) {
        this.buffer[this.index] = item;
        this.index = (this.index + 1) % this.size;
        this.count = Math.min(this.count + 1, this.size);
    }
    getAll() {
        if (this.count < this.size) {
            return this.buffer.slice(0, this.count);
        }
        return [
            ...this.buffer.slice(this.index),
            ...this.buffer.slice(0, this.index)
        ];
    }
    clear() {
        this.count = 0;
        this.index = 0;
    }
    isFull() {
        return this.count === this.size;
    }
    getSize() {
        return this.count;
    }
}
export class RateLimiter {
    constructor(maxRequests, windowSizeMs) {
        this.requests = new Map();
        this.maxRequests = maxRequests;
        this.windowSize = windowSizeMs;
    }
    isAllowed(key) {
        const now = Date.now();
        const requests = this.requests.get(key) || [];
        // Remove old requests outside the window
        const validRequests = requests.filter(time => now - time < this.windowSize);
        if (validRequests.length >= this.maxRequests) {
            this.requests.set(key, validRequests);
            return false;
        }
        validRequests.push(now);
        this.requests.set(key, validRequests);
        return true;
    }
    getRemainingRequests(key) {
        const now = Date.now();
        const requests = this.requests.get(key) || [];
        const validRequests = requests.filter(time => now - time < this.windowSize);
        return Math.max(0, this.maxRequests - validRequests.length);
    }
    getResetTime(key) {
        const requests = this.requests.get(key) || [];
        if (requests.length === 0)
            return 0;
        const oldestRequest = Math.min(...requests);
        return oldestRequest + this.windowSize;
    }
    clear(key) {
        if (key) {
            this.requests.delete(key);
        }
        else {
            this.requests.clear();
        }
    }
}
