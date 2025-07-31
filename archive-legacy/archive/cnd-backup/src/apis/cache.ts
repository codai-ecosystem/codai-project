// Cache API Implementation (Redis-like operations)
import { CBDAdapter } from '../cbd-adapter.js';
import { CacheAPI as ICacheAPI, CNDError } from '../types.js';

export class CacheAPI implements ICacheAPI {
  private defaultTTL: number;

  constructor(
    private adapter: CBDAdapter,
    config?: { enabled?: boolean; ttl?: number }
  ) {
    this.defaultTTL = config?.ttl || 3600; // 1 hour default
  }

  async get<T = any>(key: string): Promise<T | null> {
    try {
      return await this.adapter.getCache(key);
    } catch (error) {
      throw new CNDError(
        `Cache get failed: ${error}`,
        'CACHE_GET_ERROR',
        { key }
      );
    }
  }

  async set<T = any>(
    key: string,
    value: T,
    options?: { ttl?: number }
  ): Promise<void> {
    try {
      const ttl = options?.ttl || this.defaultTTL;
      await this.adapter.setCache(key, value, ttl);
    } catch (error) {
      throw new CNDError(
        `Cache set failed: ${error}`,
        'CACHE_SET_ERROR',
        { key, options }
      );
    }
  }

  async delete(key: string): Promise<boolean> {
    try {
      return await this.adapter.deleteCache(key);
    } catch (error) {
      throw new CNDError(
        `Cache delete failed: ${error}`,
        'CACHE_DELETE_ERROR',
        { key }
      );
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      const value = await this.get(key);
      return value !== null;
    } catch (error) {
      return false;
    }
  }

  async expire(key: string, ttl: number): Promise<boolean> {
    try {
      // In real implementation, this would set TTL in CBD Engine
      console.log(`Cache API: Setting TTL for ${key} to ${ttl} seconds`);
      return true;
    } catch (error) {
      throw new CNDError(
        `Cache expire failed: ${error}`,
        'CACHE_EXPIRE_ERROR',
        { key, ttl }
      );
    }
  }

  async keys(pattern?: string): Promise<string[]> {
    try {
      // In real implementation, this would list keys from CBD Engine
      console.log(`Cache API: Listing keys with pattern: ${pattern || '*'}`);
      return [];
    } catch (error) {
      throw new CNDError(
        `Cache keys failed: ${error}`,
        'CACHE_KEYS_ERROR',
        { pattern }
      );
    }
  }

  async flush(): Promise<void> {
    try {
      // In real implementation, this would clear all cache in CBD Engine
      console.log('Cache API: Flushing all cache');
    } catch (error) {
      throw new CNDError(
        `Cache flush failed: ${error}`,
        'CACHE_FLUSH_ERROR'
      );
    }
  }

  // Advanced cache operations
  async mget<T = any>(keys: string[]): Promise<(T | null)[]> {
    try {
      const results: (T | null)[] = [];
      for (const key of keys) {
        const value = await this.get<T>(key);
        results.push(value);
      }
      return results;
    } catch (error) {
      throw new CNDError(
        `Cache mget failed: ${error}`,
        'CACHE_MGET_ERROR',
        { keys }
      );
    }
  }

  async mset(keyValuePairs: Array<{ key: string; value: any; ttl?: number }>): Promise<void> {
    try {
      for (const { key, value, ttl } of keyValuePairs) {
        await this.set(key, value, ttl ? { ttl } : undefined);
      }
    } catch (error) {
      throw new CNDError(
        `Cache mset failed: ${error}`,
        'CACHE_MSET_ERROR',
        { pairCount: keyValuePairs.length }
      );
    }
  }

  async incr(key: string, increment: number = 1): Promise<number> {
    try {
      const current = await this.get<number>(key) || 0;
      const newValue = current + increment;
      await this.set(key, newValue);
      return newValue;
    } catch (error) {
      throw new CNDError(
        `Cache incr failed: ${error}`,
        'CACHE_INCR_ERROR',
        { key, increment }
      );
    }
  }

  async decr(key: string, decrement: number = 1): Promise<number> {
    return this.incr(key, -decrement);
  }

  // List operations
  async lpush<T>(key: string, ...values: T[]): Promise<number> {
    try {
      const list = await this.get<T[]>(key) || [];
      list.unshift(...values);
      await this.set(key, list);
      return list.length;
    } catch (error) {
      throw new CNDError(
        `Cache lpush failed: ${error}`,
        'CACHE_LPUSH_ERROR',
        { key, valueCount: values.length }
      );
    }
  }

  async rpush<T>(key: string, ...values: T[]): Promise<number> {
    try {
      const list = await this.get<T[]>(key) || [];
      list.push(...values);
      await this.set(key, list);
      return list.length;
    } catch (error) {
      throw new CNDError(
        `Cache rpush failed: ${error}`,
        'CACHE_RPUSH_ERROR',
        { key, valueCount: values.length }
      );
    }
  }

  async lpop<T>(key: string): Promise<T | null> {
    try {
      const list = await this.get<T[]>(key);
      if (!list || list.length === 0) return null;

      const value = list.shift();
      await this.set(key, list);
      return value || null;
    } catch (error) {
      throw new CNDError(
        `Cache lpop failed: ${error}`,
        'CACHE_LPOP_ERROR',
        { key }
      );
    }
  }

  async rpop<T>(key: string): Promise<T | null> {
    try {
      const list = await this.get<T[]>(key);
      if (!list || list.length === 0) return null;

      const value = list.pop();
      await this.set(key, list);
      return value || null;
    } catch (error) {
      throw new CNDError(
        `Cache rpop failed: ${error}`,
        'CACHE_RPOP_ERROR',
        { key }
      );
    }
  }

  async llen(key: string): Promise<number> {
    try {
      const list = await this.get<any[]>(key);
      return list ? list.length : 0;
    } catch (error) {
      return 0;
    }
  }

  async lrange<T>(key: string, start: number, stop: number): Promise<T[]> {
    try {
      const list = await this.get<T[]>(key);
      if (!list) return [];

      return list.slice(start, stop + 1);
    } catch (error) {
      throw new CNDError(
        `Cache lrange failed: ${error}`,
        'CACHE_LRANGE_ERROR',
        { key, start, stop }
      );
    }
  }

  // Set operations
  async sadd<T>(key: string, ...members: T[]): Promise<number> {
    try {
      const set = new Set(await this.get<T[]>(key) || []);
      let addedCount = 0;

      for (const member of members) {
        if (!set.has(member)) {
          set.add(member);
          addedCount++;
        }
      }

      await this.set(key, Array.from(set));
      return addedCount;
    } catch (error) {
      throw new CNDError(
        `Cache sadd failed: ${error}`,
        'CACHE_SADD_ERROR',
        { key, memberCount: members.length }
      );
    }
  }

  async srem<T>(key: string, ...members: T[]): Promise<number> {
    try {
      const set = new Set(await this.get<T[]>(key) || []);
      let removedCount = 0;

      for (const member of members) {
        if (set.has(member)) {
          set.delete(member);
          removedCount++;
        }
      }

      await this.set(key, Array.from(set));
      return removedCount;
    } catch (error) {
      throw new CNDError(
        `Cache srem failed: ${error}`,
        'CACHE_SREM_ERROR',
        { key, memberCount: members.length }
      );
    }
  }

  async smembers<T>(key: string): Promise<T[]> {
    try {
      return await this.get<T[]>(key) || [];
    } catch (error) {
      return [];
    }
  }

  async sismember<T>(key: string, member: T): Promise<boolean> {
    try {
      const set = new Set(await this.get<T[]>(key) || []);
      return set.has(member);
    } catch (error) {
      return false;
    }
  }

  async scard(key: string): Promise<number> {
    try {
      const members = await this.smembers(key);
      return members.length;
    } catch (error) {
      return 0;
    }
  }

  // Hash operations
  async hset(key: string, field: string, value: any): Promise<boolean> {
    try {
      const hash = await this.get<Record<string, any>>(key) || {};
      const isNew = !(field in hash);
      hash[field] = value;
      await this.set(key, hash);
      return isNew;
    } catch (error) {
      throw new CNDError(
        `Cache hset failed: ${error}`,
        'CACHE_HSET_ERROR',
        { key, field }
      );
    }
  }

  async hget<T = any>(key: string, field: string): Promise<T | null> {
    try {
      const hash = await this.get<Record<string, T>>(key);
      return hash ? (hash[field] || null) : null;
    } catch (error) {
      return null;
    }
  }

  async hgetall<T = any>(key: string): Promise<Record<string, T>> {
    try {
      return await this.get<Record<string, T>>(key) || {};
    } catch (error) {
      return {};
    }
  }

  async hdel(key: string, ...fields: string[]): Promise<number> {
    try {
      const hash = await this.get<Record<string, any>>(key);
      if (!hash) return 0;

      let deletedCount = 0;
      for (const field of fields) {
        if (field in hash) {
          delete hash[field];
          deletedCount++;
        }
      }

      await this.set(key, hash);
      return deletedCount;
    } catch (error) {
      throw new CNDError(
        `Cache hdel failed: ${error}`,
        'CACHE_HDEL_ERROR',
        { key, fieldCount: fields.length }
      );
    }
  }

  async hkeys(key: string): Promise<string[]> {
    try {
      const hash = await this.get<Record<string, any>>(key);
      return hash ? Object.keys(hash) : [];
    } catch (error) {
      return [];
    }
  }

  async hvals<T = any>(key: string): Promise<T[]> {
    try {
      const hash = await this.get<Record<string, T>>(key);
      return hash ? Object.values(hash) : [];
    } catch (error) {
      return [];
    }
  }

  async hexists(key: string, field: string): Promise<boolean> {
    try {
      const hash = await this.get<Record<string, any>>(key);
      return hash ? (field in hash) : false;
    } catch (error) {
      return false;
    }
  }

  // TTL operations
  async ttl(key: string): Promise<number> {
    try {
      // In real implementation, this would get TTL from CBD Engine
      console.log(`Cache API: Getting TTL for ${key}`);
      return -1; // -1 means no expiration
    } catch (error) {
      return -2; // -2 means key doesn't exist
    }
  }

  async pttl(key: string): Promise<number> {
    const seconds = await this.ttl(key);
    return seconds > 0 ? seconds * 1000 : seconds;
  }

  // Utility methods
  async ping(): Promise<string> {
    return 'PONG';
  }

  async info(): Promise<Record<string, any>> {
    return {
      version: '1.0.0',
      memory_usage: '0MB',
      total_keys: 0,
      expired_keys: 0,
      uptime: Date.now()
    };
  }
}
