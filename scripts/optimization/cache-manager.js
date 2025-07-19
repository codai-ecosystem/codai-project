// Cache Manager Implementation
import Redis from 'ioredis';
import NodeCache from 'node-cache';

class CacheManager {
  constructor() {
    // Redis for distributed caching
    this.redis = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: process.env.REDIS_PORT || 6379,
      retryDelayOnFailover: 100,
      enableReadyCheck: false,
      maxRetriesPerRequest: null
    });
    
    // Node cache for local caching
    this.localCache = new NodeCache({
      stdTTL: 600, // 10 minutes default
      checkperiod: 120,
      useClones: false
    });
  }
  
  async get(key, useLocal = false) {
    try {
      if (useLocal) {
        return this.localCache.get(key);
      }
      const result = await this.redis.get(key);
      return result ? JSON.parse(result) : null;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }
  
  async set(key, value, ttl = 600, useLocal = false) {
    try {
      if (useLocal) {
        return this.localCache.set(key, value, ttl);
      }
      return await this.redis.setex(key, ttl, JSON.stringify(value));
    } catch (error) {
      console.error('Cache set error:', error);
      return false;
    }
  }
}

export default CacheManager;
