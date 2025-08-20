/**
 * Key-Value Storage Engine - Redis-compatible key-value store
 * Part of CBD Universal Database Phase 3
 */

import { EventEmitter } from 'events';

export interface KeyValuePair {
    key: string;
    value: any;
    type: 'string' | 'number' | 'boolean' | 'object' | 'array';
    ttl?: number; // Time to live in milliseconds
    createdAt: Date;
    updatedAt: Date;
    expiresAt?: Date;
}

export interface KeyValueOptions {
    ttl?: number;
    nx?: boolean; // Only set if key doesn't exist
    xx?: boolean; // Only set if key exists
}

export interface KeyValueStats {
    totalKeys: number;
    memoryUsage: number;
    hitRate: number;
    missRate: number;
    expiredKeys: number;
    keyTypes: Map<string, number>;
    averageKeySize: number;
    averageValueSize: number;
}

export interface ScanResult {
    cursor: number;
    keys: string[];
}

export class KeyValueStorageEngine extends EventEmitter {
    private store: Map<string, KeyValuePair> = new Map();
    private expirationIndex: Map<number, Set<string>> = new Map(); // timestamp -> keys
    private stats = {
        hits: 0,
        misses: 0,
        expiredKeys: 0
    };

    constructor() {
        super();
        this.startExpirationCleanup();
    }

    async initialize(): Promise<void> {
        // Initialize the key-value storage engine
        this.emit('engine:initialized', { type: 'keyvalue' });
    }

    /**
     * Set a key-value pair
     */
    async set(key: string, value: any, options: KeyValueOptions = {}): Promise<boolean> {
        try {
            const { ttl, nx, xx } = options;

            const exists = this.store.has(key);

            // Check conditions
            if (nx && exists) {
                return false; // Key exists, but NX specified
            }

            if (xx && !exists) {
                return false; // Key doesn't exist, but XX specified
            }

            // Remove old expiration if exists
            if (exists) {
                const oldPair = this.store.get(key)!;
                if (oldPair.expiresAt) {
                    this.removeFromExpirationIndex(oldPair.expiresAt.getTime(), key);
                }
            }

            const now = new Date();
            const pair: KeyValuePair = {
                key,
                value,
                type: this.getValueType(value),
                createdAt: exists ? this.store.get(key)!.createdAt : now,
                updatedAt: now
            };

            if (ttl) {
                pair.ttl = ttl;
                pair.expiresAt = new Date(now.getTime() + ttl);
            }

            this.store.set(key, pair);

            // Add to expiration index if TTL is set
            if (pair.expiresAt) {
                this.addToExpirationIndex(pair.expiresAt.getTime(), key);
            }

            this.emit('key:set', { key, type: pair.type, ttl });
            return true;

        } catch (error) {
            this.emit('keyvalue:error', { operation: 'set', key, error });
            throw error;
        }
    }

    /**
     * Get a value by key
     */
    async get(key: string): Promise<any> {
        try {
            const pair = this.store.get(key);

            if (!pair) {
                this.stats.misses++;
                return null;
            }

            // Check if expired
            if (pair.expiresAt && pair.expiresAt <= new Date()) {
                await this.delete(key);
                this.stats.misses++;
                this.stats.expiredKeys++;
                return null;
            }

            this.stats.hits++;
            this.emit('key:accessed', { key, type: pair.type });
            return pair.value;

        } catch (error) {
            this.emit('keyvalue:error', { operation: 'get', key, error });
            throw error;
        }
    }

    /**
     * Delete a key
     */
    async delete(key: string): Promise<boolean> {
        try {
            const pair = this.store.get(key);
            if (!pair) {
                return false;
            }

            // Remove from expiration index
            if (pair.expiresAt) {
                this.removeFromExpirationIndex(pair.expiresAt.getTime(), key);
            }

            const deleted = this.store.delete(key);

            if (deleted) {
                this.emit('key:deleted', { key });
            }

            return deleted;

        } catch (error) {
            this.emit('keyvalue:error', { operation: 'delete', key, error });
            throw error;
        }
    }

    /**
     * Check if key exists
     */
    async exists(key: string): Promise<boolean> {
        const pair = this.store.get(key);

        if (!pair) {
            return false;
        }

        // Check if expired
        if (pair.expiresAt && pair.expiresAt <= new Date()) {
            await this.delete(key);
            return false;
        }

        return true;
    }

    /**
     * Set TTL for a key
     */
    async expire(key: string, ttl: number): Promise<boolean> {
        try {
            const pair = this.store.get(key);
            if (!pair) {
                return false;
            }

            // Remove old expiration
            if (pair.expiresAt) {
                this.removeFromExpirationIndex(pair.expiresAt.getTime(), key);
            }

            // Set new expiration
            const expiresAt = new Date(Date.now() + ttl);
            pair.expiresAt = expiresAt;
            pair.ttl = ttl;
            pair.updatedAt = new Date();

            this.addToExpirationIndex(expiresAt.getTime(), key);

            this.emit('key:expired', { key, ttl });
            return true;

        } catch (error) {
            this.emit('keyvalue:error', { operation: 'expire', key, error });
            throw error;
        }
    }

    /**
     * Get TTL for a key
     */
    async ttl(key: string): Promise<number> {
        const pair = this.store.get(key);

        if (!pair) {
            return -2; // Key doesn't exist
        }

        if (!pair.expiresAt) {
            return -1; // Key exists but has no TTL
        }

        const remaining = pair.expiresAt.getTime() - Date.now();
        return remaining > 0 ? Math.ceil(remaining / 1000) : -2; // Return seconds
    }

    /**
     * Get multiple keys
     */
    async mget(keys: string[]): Promise<(any | null)[]> {
        const results: (any | null)[] = [];

        for (const key of keys) {
            results.push(await this.get(key));
        }

        return results;
    }

    /**
     * Set multiple key-value pairs
     */
    async mset(pairs: Array<{ key: string, value: any, options?: KeyValueOptions }>): Promise<boolean> {
        try {
            for (const { key, value, options = {} } of pairs) {
                await this.set(key, value, options);
            }

            this.emit('keys:mset', { count: pairs.length });
            return true;

        } catch (error) {
            this.emit('keyvalue:error', { operation: 'mset', pairs, error });
            throw error;
        }
    }

    /**
     * Increment a numeric value
     */
    async incr(key: string, by: number = 1): Promise<number> {
        try {
            const current = await this.get(key);

            if (current === null) {
                await this.set(key, by);
                return by;
            }

            if (typeof current !== 'number') {
                throw new Error(`Value at key ${key} is not a number`);
            }

            const newValue = current + by;
            await this.set(key, newValue);

            this.emit('key:incremented', { key, by, newValue });
            return newValue;

        } catch (error) {
            this.emit('keyvalue:error', { operation: 'incr', key, error });
            throw error;
        }
    }

    /**
     * Decrement a numeric value
     */
    async decr(key: string, by: number = 1): Promise<number> {
        return this.incr(key, -by);
    }

    /**
     * Scan keys with pattern matching
     */
    async scan(cursor: number = 0, pattern?: string, count: number = 10): Promise<ScanResult> {
        const keys = Array.from(this.store.keys());
        const start = cursor;
        const end = Math.min(start + count, keys.length);

        let matchingKeys = keys.slice(start, end);

        // Apply pattern filter
        if (pattern) {
            const regex = this.patternToRegex(pattern);
            matchingKeys = matchingKeys.filter(key => regex.test(key));
        }

        const nextCursor = end >= keys.length ? 0 : end;

        return {
            cursor: nextCursor,
            keys: matchingKeys
        };
    }

    /**
     * Get all keys matching a pattern
     */
    async keys(pattern: string = '*'): Promise<string[]> {
        const regex = this.patternToRegex(pattern);
        return Array.from(this.store.keys()).filter(key => regex.test(key));
    }

    /**
     * Get random key
     */
    async randomKey(): Promise<string | null> {
        const keys = Array.from(this.store.keys());
        if (keys.length === 0) {
            return null;
        }

        const randomIndex = Math.floor(Math.random() * keys.length);
        return keys[randomIndex] || null;
    }

    /**
     * Rename a key
     */
    async rename(oldKey: string, newKey: string): Promise<boolean> {
        try {
            const pair = this.store.get(oldKey);
            if (!pair) {
                return false;
            }

            // Copy to new key  
            const remainingTTL = this.getRemainingTTL(pair);
            const setOptions: KeyValueOptions = {};
            if (remainingTTL) {
                setOptions.ttl = remainingTTL;
            }
            await this.set(newKey, pair.value, setOptions);

            // Delete old key
            await this.delete(oldKey);

            this.emit('key:renamed', { oldKey, newKey });
            return true;

        } catch (error) {
            this.emit('keyvalue:error', { operation: 'rename', oldKey, newKey, error });
            throw error;
        }
    }

    /**
     * Get type of value at key
     */
    async type(key: string): Promise<string | null> {
        const pair = this.store.get(key);
        return pair ? pair.type : null;
    }

    /**
     * Flush all keys
     */
    async flushAll(): Promise<void> {
        const keyCount = this.store.size;
        this.store.clear();
        this.expirationIndex.clear();

        this.emit('database:flushed', { deletedKeys: keyCount });
    }

    /**
     * Get database statistics
     */
    async getKeyValueStats(): Promise<KeyValueStats> {
        const keyTypes = new Map<string, number>();
        let totalKeySize = 0;
        let totalValueSize = 0;

        for (const [key, pair] of this.store) {
            // Count types
            keyTypes.set(pair.type, (keyTypes.get(pair.type) || 0) + 1);

            // Estimate sizes
            totalKeySize += key.length * 2; // UTF-16
            totalValueSize += this.estimateValueSize(pair.value);
        }

        return {
            totalKeys: this.store.size,
            memoryUsage: totalKeySize + totalValueSize,
            hitRate: this.stats.hits / (this.stats.hits + this.stats.misses) || 0,
            missRate: this.stats.misses / (this.stats.hits + this.stats.misses) || 0,
            expiredKeys: this.stats.expiredKeys,
            keyTypes,
            averageKeySize: this.store.size > 0 ? totalKeySize / this.store.size : 0,
            averageValueSize: this.store.size > 0 ? totalValueSize / this.store.size : 0
        };
    }

    /**
     * Get all keys (use with caution on large datasets)
     */
    async getAllKeys(): Promise<string[]> {
        return Array.from(this.store.keys());
    }

    /**
     * Get key-value pair info
     */
    async info(key: string): Promise<KeyValuePair | null> {
        return this.store.get(key) || null;
    }

    // Private helper methods
    private getValueType(value: any): 'string' | 'number' | 'boolean' | 'object' | 'array' {
        if (Array.isArray(value)) return 'array';
        return typeof value as 'string' | 'number' | 'boolean' | 'object';
    }

    private addToExpirationIndex(timestamp: number, key: string): void {
        if (!this.expirationIndex.has(timestamp)) {
            this.expirationIndex.set(timestamp, new Set());
        }
        this.expirationIndex.get(timestamp)!.add(key);
    }

    private removeFromExpirationIndex(timestamp: number, key: string): void {
        const keySet = this.expirationIndex.get(timestamp);
        if (keySet) {
            keySet.delete(key);
            if (keySet.size === 0) {
                this.expirationIndex.delete(timestamp);
            }
        }
    }

    private getRemainingTTL(pair: KeyValuePair): number | undefined {
        if (!pair.expiresAt) {
            return undefined;
        }

        const remaining = pair.expiresAt.getTime() - Date.now();
        return remaining > 0 ? remaining : undefined;
    }

    private patternToRegex(pattern: string): RegExp {
        // Convert Redis-style patterns to regex
        const regexPattern = pattern
            .replace(/\*/g, '.*')  // * matches any number of characters  
            .replace(/\?/g, '.')   // ? matches single character
            .replace(/\[([^\]]+)\]/g, '[$1]'); // [abc] character class

        return new RegExp(`^${regexPattern}$`);
    }

    private estimateValueSize(value: any): number {
        if (typeof value === 'string') {
            return value.length * 2; // UTF-16
        } else if (typeof value === 'number') {
            return 8; // 64-bit number
        } else if (typeof value === 'boolean') {
            return 1;
        } else {
            return JSON.stringify(value).length * 2; // Rough estimate
        }
    }

    private startExpirationCleanup(): void {
        // Clean up expired keys every 10 seconds
        setInterval(() => {
            this.cleanupExpiredKeys();
        }, 10000);
    }

    private cleanupExpiredKeys(): void {
        const now = Date.now();
        const expiredTimestamps: number[] = [];

        for (const [timestamp, keys] of this.expirationIndex) {
            if (timestamp <= now) {
                for (const key of keys) {
                    this.store.delete(key);
                    this.stats.expiredKeys++;
                }
                expiredTimestamps.push(timestamp);
            }
        }

        // Clean up expiration index
        for (const timestamp of expiredTimestamps) {
            this.expirationIndex.delete(timestamp);
        }

        if (expiredTimestamps.length > 0) {
            this.emit('keys:expired', { count: expiredTimestamps.length });
        }
    }
}
