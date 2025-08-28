/**
 * Tests for Performance Optimization & Caching System
 * 
 * Comprehensive test suite covering Redis integration, query optimization,
 * connection pooling, lazy loading, and performance monitoring.
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { PerformanceCache, ConnectionPoolManager, LazyLoadManager, CacheConfig, PerformanceConfig } from '../performance-optimization-cache.js';

// Mock Redis
const mockRedis = {
  get: vi.fn(),
  set: vi.fn(),
  setex: vi.fn(),
  del: vi.fn(),
  keys: vi.fn(),
  ping: vi.fn(),
  quit: vi.fn(),
  pipeline: vi.fn(() => ({
    get: vi.fn().mockReturnThis(),
    setex: vi.fn().mockReturnThis(),
    exec: vi.fn().mockResolvedValue([])
  })),
  on: vi.fn()
};

// Mock ioredis
vi.mock('ioredis', () => ({
  Redis: vi.fn(() => mockRedis),
  Cluster: vi.fn(() => mockRedis)
}));

describe('PerformanceCache', () => {
  let cache: PerformanceCache;
  let config: CacheConfig;

  beforeEach(() => {
    vi.clearAllMocks();

    config = {
      redis: {
        host: 'localhost',
        port: 6379,
        keyPrefix: 'test:',
        lazyConnect: true
      },
      defaultTTL: 300,
      maxCacheSize: 10,
      enableCompression: true,
      compressionThreshold: 100,
      enableMetrics: true
    };

    cache = new PerformanceCache(config);
  });

  afterEach(async () => {
    await cache.dispose();
  });

  describe('Basic Cache Operations', () => {
    it('should set and get values from cache', async () => {
      const testData = { id: 1, name: 'test', data: 'some data' };

      mockRedis.setex.mockResolvedValue('OK');
      mockRedis.get.mockResolvedValue(JSON.stringify({
        key: 'test:key',
        value: testData,
        ttl: 300,
        createdAt: Date.now(),
        lastAccessed: Date.now(),
        hitCount: 0,
        size: 100,
        compressed: false
      }));

      await cache.set('test:key', testData);
      const result = await cache.get<typeof testData>('test:key');

      expect(mockRedis.setex).toHaveBeenCalled();
      expect(result).toEqual(testData);
    });

    it('should handle cache misses gracefully', async () => {
      mockRedis.get.mockResolvedValue(null);

      const result = await cache.get('nonexistent:key');

      expect(result).toBeNull();
      expect(mockRedis.get).toHaveBeenCalledWith('nonexistent:key');
    });

    it('should delete values from cache', async () => {
      mockRedis.del.mockResolvedValue(1);

      const result = await cache.delete('test:key');

      expect(result).toBe(true);
      expect(mockRedis.del).toHaveBeenCalledWith('test:key');
    });

    it('should handle Redis errors gracefully', async () => {
      mockRedis.get.mockRejectedValue(new Error('Redis connection error'));

      const result = await cache.get('error:key');

      expect(result).toBeNull();
    });
  });

  describe('Batch Operations', () => {
    it('should perform batch get operations', async () => {
      const keys = ['key1', 'key2', 'key3'];
      const mockResults = [
        [null, JSON.stringify({ key: 'key1', value: 'value1', ttl: 300, createdAt: Date.now(), lastAccessed: Date.now(), hitCount: 0, size: 10, compressed: false })],
        [null, null], // cache miss
        [null, JSON.stringify({ key: 'key3', value: 'value3', ttl: 300, createdAt: Date.now(), lastAccessed: Date.now(), hitCount: 0, size: 10, compressed: false })]
      ];

      mockRedis.pipeline.mockReturnValue({
        get: vi.fn().mockReturnThis(),
        exec: vi.fn().mockResolvedValue(mockResults)
      });

      const results = await cache.mget<string>(keys);

      expect(results.get('key1')).toBe('value1');
      expect(results.get('key2')).toBeNull();
      expect(results.get('key3')).toBe('value3');
      expect(results.size).toBe(3);
    });

    it('should perform batch set operations', async () => {
      const entries = [
        { key: 'key1', value: 'value1', ttl: 300 },
        { key: 'key2', value: 'value2', ttl: 600 }
      ];

      mockRedis.pipeline.mockReturnValue({
        setex: vi.fn().mockReturnThis(),
        exec: vi.fn().mockResolvedValue([['OK'], ['OK']])
      });

      await cache.mset(entries);

      expect(mockRedis.pipeline).toHaveBeenCalled();
    });

    it('should handle empty batch operations', async () => {
      const results = await cache.mget([]);
      expect(results.size).toBe(0);

      await expect(cache.mset([])).resolves.toBeUndefined();
    });
  });

  describe('Compression', () => {
    it('should compress large values', async () => {
      const largeData = { data: 'x'.repeat(1000) }; // Larger than compression threshold

      mockRedis.setex.mockResolvedValue('OK');

      await cache.set('large:key', largeData);

      expect(mockRedis.setex).toHaveBeenCalled();

      // Check that the stored data includes compression metadata
      const storedCall = mockRedis.setex.mock.calls[0];
      const storedEntry = JSON.parse(storedCall[2]);
      expect(storedEntry.compressed).toBe(true);
      expect(storedEntry.metadata.originalSize).toBeGreaterThan(100);
    });

    it('should not compress small values', async () => {
      const smallData = { data: 'small' };

      mockRedis.setex.mockResolvedValue('OK');

      await cache.set('small:key', smallData);

      const storedCall = mockRedis.setex.mock.calls[0];
      const storedEntry = JSON.parse(storedCall[2]);
      expect(storedEntry.compressed).toBe(false);
    });
  });

  describe('Cache Warming', () => {
    it('should warm cache with recent data strategy', async () => {
      const testData = Array.from({ length: 150 }, (_, i) => ({ id: i, name: `item${i}` }));

      mockRedis.setex.mockResolvedValue('OK');

      await cache.warmCache('recent', testData);

      // Should cache only the first 100 items for recent strategy
      expect(mockRedis.setex).toHaveBeenCalledTimes(100);
    });

    it('should warm cache with popular data strategy', async () => {
      const testData = [
        { id: 1, name: 'item1', accessCount: 100 },
        { id: 2, name: 'item2', accessCount: 50 },
        { id: 3, name: 'item3', accessCount: 200 }
      ];

      mockRedis.setex.mockResolvedValue('OK');

      await cache.warmCache('popular', testData);

      expect(mockRedis.setex).toHaveBeenCalledTimes(3);
    });

    it('should warm cache with critical data strategy', async () => {
      const testData = [
        { id: 1, name: 'item1', importance: 5 },
        { id: 2, name: 'item2', importance: 9 },
        { id: 3, name: 'item3', importance: 8 }
      ];

      mockRedis.setex.mockResolvedValue('OK');

      await cache.warmCache('critical', testData);

      // Should cache items with importance >= 8
      expect(mockRedis.setex).toHaveBeenCalledTimes(2);
    });

    it('should handle unknown warming strategy', async () => {
      // Should not throw error for unknown strategy
      await expect(cache.warmCache('unknown', [])).resolves.toBeUndefined();
    });
  });

  describe('Metrics and Monitoring', () => {
    it('should track cache metrics', async () => {
      mockRedis.get.mockResolvedValueOnce(null); // miss
      mockRedis.get.mockResolvedValueOnce(JSON.stringify({
        key: 'test:key',
        value: 'test',
        ttl: 300,
        createdAt: Date.now(),
        lastAccessed: Date.now(),
        hitCount: 0,
        size: 10,
        compressed: false
      })); // hit

      await cache.get('miss:key');
      await cache.get('hit:key');

      const metrics = cache.getMetrics();

      expect(metrics.cache.hits).toBeGreaterThan(0);
      expect(metrics.cache.misses).toBeGreaterThan(0);
      expect(metrics.cache.hitRatio).toBeGreaterThan(0);
    });

    it('should provide accurate cache statistics', async () => {
      const metrics = cache.getMetrics();

      expect(metrics).toHaveProperty('cache');
      expect(metrics).toHaveProperty('memory');
      expect(metrics).toHaveProperty('connections');
      expect(metrics).toHaveProperty('queries');
      expect(metrics).toHaveProperty('operations');

      expect(typeof metrics.cache.hitRatio).toBe('number');
      expect(typeof metrics.cache.totalSize).toBe('number');
      expect(typeof metrics.cache.entryCount).toBe('number');
    });
  });

  describe('Health Check', () => {
    it('should perform health check successfully', async () => {
      mockRedis.ping.mockResolvedValue('PONG');

      const health = await cache.healthCheck();

      expect(health.redis).toBe(true);
      expect(health.localCache).toBe(true);
      expect(health.metrics).toBeDefined();
    });

    it('should handle Redis health check failure', async () => {
      mockRedis.ping.mockRejectedValue(new Error('Connection failed'));

      const health = await cache.healthCheck();

      expect(health.redis).toBe(false);
      expect(health.localCache).toBe(true);
    });
  });

  describe('Cache Clearing', () => {
    it('should clear all cache entries', async () => {
      mockRedis.keys.mockResolvedValue(['test:key1', 'test:key2']);
      mockRedis.del.mockResolvedValue(2);

      await cache.clear();

      expect(mockRedis.keys).toHaveBeenCalledWith('test:*');
      expect(mockRedis.del).toHaveBeenCalledWith('test:key1', 'test:key2');
    });

    it('should handle empty cache clearing', async () => {
      mockRedis.keys.mockResolvedValue([]);

      await cache.clear();

      expect(mockRedis.keys).toHaveBeenCalledWith('test:*');
      expect(mockRedis.del).not.toHaveBeenCalled();
    });
  });

  describe('Local Cache Management', () => {
    it('should fall back to local cache when Redis is unavailable', async () => {
      // Create cache without Redis
      const localCache = new PerformanceCache({
        redis: undefined,
        enableMetrics: true
      });

      const testData = { id: 1, name: 'test' };

      await localCache.set('local:key', testData);
      const result = await localCache.get('local:key');

      expect(result).toEqual(testData);

      await localCache.dispose();
    });

    it('should evict old entries from local cache', async () => {
      const localCache = new PerformanceCache({
        redis: undefined,
        maxCacheSize: 0.001, // Very small cache (1KB)
        enableMetrics: true
      });

      // Fill cache beyond capacity
      const largeData = { data: 'x'.repeat(500) };

      await localCache.set('key1', largeData);
      await localCache.set('key2', largeData);
      await localCache.set('key3', largeData);

      const metrics = localCache.getMetrics();
      expect(metrics.cache.evictions).toBeGreaterThan(0);

      await localCache.dispose();
    });
  });

  describe('Error Handling', () => {
    it('should handle Redis connection errors', async () => {
      mockRedis.setex.mockRejectedValue(new Error('Connection lost'));

      await expect(cache.set('error:key', 'value')).rejects.toThrow('Connection lost');
    });

    it('should handle malformed cache entries', async () => {
      mockRedis.get.mockResolvedValue('invalid json');

      const result = await cache.get('malformed:key');
      expect(result).toBeNull();
    });

    it('should handle disposal errors gracefully', async () => {
      mockRedis.quit.mockRejectedValue(new Error('Quit failed'));

      // Should not throw
      await expect(cache.dispose()).resolves.toBeUndefined();
    });
  });
});

describe('ConnectionPoolManager', () => {
  let poolManager: ConnectionPoolManager;
  let config: PerformanceConfig;

  beforeEach(() => {
    config = {
      connectionPooling: {
        maxConnections: 5,
        minConnections: 1,
        acquireTimeoutMillis: 5000,
        idleTimeoutMillis: 60000
      }
    };

    poolManager = new ConnectionPoolManager(config);
  });

  describe('Pool Management', () => {
    it('should create a connection pool', () => {
      const mockFactory = { create: vi.fn(), destroy: vi.fn() };

      poolManager.createPool('test-pool', mockFactory);

      // Should not throw
      expect(() => poolManager.createPool('test-pool', mockFactory)).not.toThrow();
    });

    it('should acquire and release connections', async () => {
      const mockFactory = { create: vi.fn(), destroy: vi.fn() };
      poolManager.createPool('test-pool', mockFactory);

      const connection = await poolManager.acquire('test-pool');
      expect(connection).toBeDefined();

      const metricsBefore = poolManager.getMetrics();
      await poolManager.release('test-pool', connection);
      const metricsAfter = poolManager.getMetrics();

      expect(metricsAfter.active).toBeLessThan(metricsBefore.active + 1);
    });

    it('should throw error for non-existent pool', async () => {
      await expect(poolManager.acquire('non-existent')).rejects.toThrow('Pool non-existent not found');
    });

    it('should provide connection metrics', () => {
      const metrics = poolManager.getMetrics();

      expect(metrics).toHaveProperty('active');
      expect(metrics).toHaveProperty('idle');
      expect(metrics).toHaveProperty('waiting');
      expect(metrics).toHaveProperty('total');

      expect(typeof metrics.active).toBe('number');
      expect(typeof metrics.idle).toBe('number');
    });
  });
});

describe('LazyLoadManager', () => {
  let lazyLoader: LazyLoadManager;
  let mockCache: PerformanceCache;
  let config: PerformanceConfig['lazyLoading'];

  beforeEach(() => {
    config = {
      enabled: true,
      batchSize: 10,
      prefetchThreshold: 0.8,
      maxConcurrentLoads: 2
    };

    mockCache = new PerformanceCache({ enableMetrics: false });
    lazyLoader = new LazyLoadManager(config, mockCache);
  });

  afterEach(async () => {
    await mockCache.dispose();
  });

  describe('Lazy Loading', () => {
    it('should load data lazily with correct batch size', async () => {
      const mockData = Array.from({ length: 25 }, (_, i) => ({ id: i, name: `item${i}` }));
      const mockLoader = vi.fn().mockResolvedValue(mockData);

      const result = await lazyLoader.lazyLoad('test-data', mockLoader);

      expect(result.data).toHaveLength(10); // batch size
      expect(result.hasMore).toBe(true);
      expect(result.totalCount).toBe(25);
      expect(result.fromCache).toBe(false);
      expect(result.loadTime).toBeGreaterThan(0);
      expect(mockLoader).toHaveBeenCalledOnce();
    });

    it('should return cached data on subsequent calls', async () => {
      const mockData = Array.from({ length: 5 }, (_, i) => ({ id: i, name: `item${i}` }));
      const mockLoader = vi.fn().mockResolvedValue(mockData);

      // First call - loads data
      const result1 = await lazyLoader.lazyLoad('cached-data', mockLoader);
      expect(result1.fromCache).toBe(false);

      // Second call - should return cached data
      const result2 = await lazyLoader.lazyLoad('cached-data', mockLoader);
      expect(result2.fromCache).toBe(true);
      expect(mockLoader).toHaveBeenCalledOnce(); // Only called once
    });

    it('should handle loading errors gracefully', async () => {
      const mockLoader = vi.fn().mockRejectedValue(new Error('Loading failed'));

      await expect(lazyLoader.lazyLoad('error-data', mockLoader)).rejects.toThrow('Loading failed');
    });

    it('should handle concurrent loading requests', async () => {
      const mockData = Array.from({ length: 5 }, (_, i) => ({ id: i, name: `item${i}` }));
      const mockLoader = vi.fn().mockImplementation(() =>
        new Promise(resolve => setTimeout(() => resolve(mockData), 50))
      );

      // Start multiple concurrent loads for the same key
      const promises = [
        lazyLoader.lazyLoad('concurrent-data', mockLoader),
        lazyLoader.lazyLoad('concurrent-data', mockLoader),
        lazyLoader.lazyLoad('concurrent-data', mockLoader)
      ];

      const results = await Promise.all(promises);

      // All should return the same data
      expect(results[0].data).toEqual(results[1].data);
      expect(results[0].data).toEqual(results[2].data);

      // Loader should only be called once due to deduplication
      expect(mockLoader).toHaveBeenCalledOnce();
    });

    it('should apply offset and limit options', async () => {
      const mockData = Array.from({ length: 50 }, (_, i) => ({ id: i, name: `item${i}` }));
      const mockLoader = vi.fn().mockResolvedValue(mockData);

      const result = await lazyLoader.lazyLoad('paginated-data', mockLoader, {
        offset: 10,
        limit: 5
      });

      // Should return 5 items starting from index 10
      expect(result.data).toHaveLength(5);
      expect(result.data[0].id).toBe(10);
      expect(result.data[4].id).toBe(14);
    });

    it('should handle small datasets correctly', async () => {
      const mockData = [{ id: 1, name: 'single-item' }];
      const mockLoader = vi.fn().mockResolvedValue(mockData);

      const result = await lazyLoader.lazyLoad('small-data', mockLoader);

      expect(result.data).toHaveLength(1);
      expect(result.hasMore).toBe(false);
      expect(result.totalCount).toBe(1);
    });
  });
});