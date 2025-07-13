import crypto from 'crypto';

// Utility functions for real-time operations

export function generateId(): string {
  return crypto.randomUUID();
}

export function createTimestamp(): number {
  return Date.now();
}

export function calculateChecksum(data: any): string {
  const str = JSON.stringify(data);
  return crypto.createHash('md5').update(str).digest('hex').slice(0, 8);
}

export function isValidMessage(message: any): boolean {
  return (
    message &&
    typeof message === 'object' &&
    typeof message.id === 'string' &&
    typeof message.type === 'string' &&
    typeof message.timestamp === 'number' &&
    typeof message.sender === 'string'
  );
}

export function sanitizeMessage(message: any): any {
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

export function validateChannel(channel: string): boolean {
  // Channel validation rules
  return (
    typeof channel === 'string' &&
    channel.length > 0 &&
    channel.length <= 100 &&
    /^[a-zA-Z0-9_-]+$/.test(channel)
  );
}

export function validateUserId(userId: string): boolean {
  return (
    typeof userId === 'string' &&
    userId.length > 0 &&
    userId.length <= 50 &&
    /^[a-zA-Z0-9_-]+$/.test(userId)
  );
}

export function rateLimitKey(userId: string, action: string): string {
  return `ratelimit:${userId}:${action}`;
}

export function parseAuthToken(token: string): { userId?: string; roles?: string[]; error?: string } {
  try {
    // Basic JWT parsing without verification (verification should be done server-side)
    const [, payload] = token.split('.');
    if (!payload) return { error: 'Invalid token format' };
    
    const decoded = JSON.parse(atob(payload));
    return {
      userId: decoded.sub || decoded.userId,
      roles: decoded.roles || [],
    };
  } catch (error) {
    return { error: 'Failed to parse token' };
  }
}

export function createAuthToken(userId: string, roles: string[] = [], expiresIn: number = 24 * 60 * 60 * 1000): string {
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

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

export function retry<T>(
  operation: () => Promise<T>,
  maxAttempts: number = 3,
  delay: number = 1000
): Promise<T> {
  return new Promise((resolve, reject) => {
    let attempts = 0;
    
    const attempt = async () => {
      try {
        const result = await operation();
        resolve(result);
      } catch (error) {
        attempts++;
        if (attempts >= maxAttempts) {
          reject(error);
        } else {
          setTimeout(attempt, delay * attempts);
        }
      }
    };
    
    attempt();
  });
}

export function formatLatency(ms: number): string {
  if (ms < 1) return `${(ms * 1000).toFixed(0)}μs`;
  if (ms < 1000) return `${ms.toFixed(1)}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
}

export function formatBytes(bytes: number): string {
  const sizes = ['B', 'KB', 'MB', 'GB'];
  if (bytes === 0) return '0 B';
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
}

export function getNetworkLatency(): Promise<number> {
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

export class CircularBuffer<T> {
  private buffer: T[];
  private size: number;
  private index: number = 0;
  private count: number = 0;

  constructor(size: number) {
    this.size = size;
    this.buffer = new Array(size);
  }

  push(item: T): void {
    this.buffer[this.index] = item;
    this.index = (this.index + 1) % this.size;
    this.count = Math.min(this.count + 1, this.size);
  }

  getAll(): T[] {
    if (this.count < this.size) {
      return this.buffer.slice(0, this.count);
    }
    
    return [
      ...this.buffer.slice(this.index),
      ...this.buffer.slice(0, this.index)
    ];
  }

  clear(): void {
    this.count = 0;
    this.index = 0;
  }

  isFull(): boolean {
    return this.count === this.size;
  }

  getSize(): number {
    return this.count;
  }
}

export class RateLimiter {
  private requests: Map<string, number[]> = new Map();
  private readonly windowSize: number;
  private readonly maxRequests: number;

  constructor(maxRequests: number, windowSizeMs: number) {
    this.maxRequests = maxRequests;
    this.windowSize = windowSizeMs;
  }

  isAllowed(key: string): boolean {
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

  getRemainingRequests(key: string): number {
    const now = Date.now();
    const requests = this.requests.get(key) || [];
    const validRequests = requests.filter(time => now - time < this.windowSize);
    return Math.max(0, this.maxRequests - validRequests.length);
  }

  getResetTime(key: string): number {
    const requests = this.requests.get(key) || [];
    if (requests.length === 0) return 0;
    
    const oldestRequest = Math.min(...requests);
    return oldestRequest + this.windowSize;
  }

  clear(key?: string): void {
    if (key) {
      this.requests.delete(key);
    } else {
      this.requests.clear();
    }
  }
}
