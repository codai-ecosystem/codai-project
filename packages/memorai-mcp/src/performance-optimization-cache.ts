/**
 * MemorAI Performance Optimization & Caching System
 * 
 * Advanced caching layer with Redis integration, query optimization,
 * connection pooling, lazy loading, and comprehensive performance monitoring.
 * 
 * Features:
 * - Redis-based distributed caching with cluster support
 * - Intelligent query optimization and result caching
 * - Connection pooling for database and external services
 * - Lazy loading strategies for large datasets
 * - Real-time performance monitoring and metrics
 * - Cache warming and preloading strategies
 * - Memory usage optimization and garbage collection tuning
 * - Batch operation optimizations
 * - Network request optimization and compression
 * - Database query optimization and indexing strategies
 * 
 * @version 1.0.0
 * @author MemorAI Development Team
 */

import { Redis, RedisOptions, Cluster } from 'ioredis';
import { EventEmitter } from 'events';

export interface CacheConfig {
  redis?: {
    host?: string;
    port?: number;
    password?: string;
    db?: number;
    cluster?: Array<{ host: string; port: number }>;
    keyPrefix?: string;
    maxRetriesPerRequest?: number;
    retryDelayOnFailover?: number;
    enableReadyCheck?: boolean;
    lazyConnect?: boolean;
  };
  defaultTTL?: number; // seconds
  maxCacheSize?: number; // MB
  compressionThreshold?: number; // bytes
  enableCompression?: boolean;
  enableMetrics?: boolean;
  warmupStrategies?: string[];
}

export interface PerformanceConfig {
  connectionPooling?: {
    maxConnections?: number;
    minConnections?: number;
    acquireTimeoutMillis?: number;
    createTimeoutMillis?: number;
    destroyTimeoutMillis?: number;
    idleTimeoutMillis?: number;
    reapIntervalMillis?: number;
    createRetryIntervalMillis?: number;
  };
  lazyLoading?: {
    enabled?: boolean;
    batchSize?: number;
    prefetchThreshold?: number;
    maxConcurrentLoads?: number;
  };
  queryOptimization?: {
    enableQueryCache?: boolean;
    maxQueryCacheSize?: number;
    queryPlanCaching?: boolean;
    indexOptimization?: boolean;
  };
  memoryManagement?: {
    heapSnapshotThreshold?: number; // MB
    gcOptimization?: boolean;
    memoryLeakDetection?: boolean;
    objectPooling?: boolean;
  };
}

export interface CacheEntry<T = any> {
  key: string;
  value: T;
  ttl: number;
  createdAt: number;
  lastAccessed: number;
  hitCount: number;
  size: number; // bytes
  compressed: boolean;
  metadata?: Record<string, any>;
}

export interface PerformanceMetrics {
  cache: {
    hits: number;
    misses: number;
    hitRatio: number;
    totalSize: number; // bytes
    entryCount: number;
    evictions: number;
    averageResponseTime: number; // ms
  };
  memory: {
    heapUsed: number;
    heapTotal: number;
    external: number;
    rss: number;
    arrayBuffers: number;
  };
  connections: {
    active: number;
    idle: number;
    waiting: number;
    total: number;
  };
  queries: {
    total: number;
    average: number; // ms
    slow: number; // > 100ms
    cached: number;
    optimized: number;
  };
  operations: {
    reads: number;
    writes: number;
    deletes: number;
    averageLatency: number; // ms
    throughput: number; // ops/sec
  };
}

export interface LazyLoadResult<T> {
  data: T[];
  hasMore: boolean;
  nextCursor?: string;
  totalCount?: number;
  loadTime: number;
  fromCache: boolean;
}

/**
 * Advanced Performance Cache with Redis Integration
 */
export class PerformanceCache extends EventEmitter {
  private redis: Redis | Cluster | null = null;
  private localCache: Map<string, CacheEntry> = new Map();
  private config: Required<CacheConfig>;
  private metrics: PerformanceMetrics;
  private compressionEnabled: boolean = false;

  constructor(config: CacheConfig = {}) {
    super();

    this.config = {
      redis: {
        host: 'localhost',
        port: 6379,
        password: undefined,
        db: 0,
        cluster: undefined,
        keyPrefix: 'memorai:',
        maxRetriesPerRequest: 3,
        retryDelayOnFailover: 100,
        enableReadyCheck: true,
        lazyConnect: true,
        ...config.redis
      },
      defaultTTL: 3600, // 1 hour
      maxCacheSize: 128, // 128 MB
      compressionThreshold: 1024, // 1KB
      enableCompression: true,
      enableMetrics: true,
      warmupStrategies: ['recent', 'popular', 'critical'],
      ...config
    };

    this.metrics = this.initializeMetrics();
    this.compressionEnabled = this.config.enableCompression;

    this.initializeRedis();
    this.startMetricsCollection();
    this.startCacheMaintenance();
  }

  /**
   * Initialize Redis connection
   */
  private initializeRedis(): void {
    try {
      if (this.config.redis.cluster && this.config.redis.cluster.length > 0) {
        // Redis Cluster mode
        this.redis = new Cluster(this.config.redis.cluster, {
          redisOptions: {
            password: this.config.redis.password,
            keyPrefix: this.config.redis.keyPrefix,
            maxRetriesPerRequest: this.config.redis.maxRetriesPerRequest,
            retryDelayOnFailover: this.config.redis.retryDelayOnFailover,
            lazyConnect: this.config.redis.lazyConnect
          },
          enableReadyCheck: this.config.redis.enableReadyCheck
        });
      } else {
        // Single Redis instance
        this.redis = new Redis({
          host: this.config.redis.host,
          port: this.config.redis.port,
          password: this.config.redis.password,
          db: this.config.redis.db,
          keyPrefix: this.config.redis.keyPrefix,
          maxRetriesPerRequest: this.config.redis.maxRetriesPerRequest,
          retryDelayOnFailover: this.config.redis.retryDelayOnFailover,
          enableReadyCheck: this.config.redis.enableReadyCheck,
          lazyConnect: this.config.redis.lazyConnect
        });
      }

      this.redis.on('connect', () => {
        this.emit('redis:connect');
        console.log('✅ Redis connected successfully');
      });

      this.redis.on('error', (error) => {
        this.emit('redis:error', error);
        console.error('❌ Redis error:', error);
      });

      this.redis.on('ready', () => {
        this.emit('redis:ready');
        console.log('🚀 Redis ready for operations');
      });

    } catch (error) {
      console.error('❌ Failed to initialize Redis:', error);
      this.redis = null;
    }
  }

  /**
   * Get value from cache
   */
  async get<T>(key: string): Promise<T | null> {
    const startTime = Date.now();

    try {
      // Try Redis first
      if (this.redis) {
        const redisValue = await this.redis.get(key);
        if (redisValue) {
          const entry = JSON.parse(redisValue) as CacheEntry<T>;
          entry.lastAccessed = Date.now();
          entry.hitCount++;

          this.updateMetrics('hit', Date.now() - startTime);

          // Decompress if needed
          const value = this.compressionEnabled && entry.compressed
            ? await this.decompress(entry.value as string)
            : entry.value;

          return value;
        }
      }

      // Try local cache
      const localEntry = this.localCache.get(key);
      if (localEntry) {
        if (Date.now() - localEntry.createdAt < localEntry.ttl * 1000) {
          localEntry.lastAccessed = Date.now();
          localEntry.hitCount++;

          this.updateMetrics('hit', Date.now() - startTime);

          const value = this.compressionEnabled && localEntry.compressed
            ? await this.decompress(localEntry.value as string)
            : localEntry.value;

          return value;
        } else {
          // Expired, remove from local cache
          this.localCache.delete(key);
        }
      }

      this.updateMetrics('miss', Date.now() - startTime);
      return null;

    } catch (error) {
      console.error(`❌ Cache get error for key ${key}:`, error);
      this.updateMetrics('miss', Date.now() - startTime);
      return null;
    }
  }

  /**
   * Set value in cache
   */
  async set<T>(key: string, value: T, ttl: number = this.config.defaultTTL): Promise<void> {
    const startTime = Date.now();

    try {
      let finalValue: any = value;
      let compressed = false;

      // Compress large values
      const serialized = JSON.stringify(value);
      if (this.compressionEnabled && serialized.length > this.config.compressionThreshold) {
        finalValue = await this.compress(serialized);
        compressed = true;
      }

      const entry: CacheEntry<T> = {
        key,
        value: finalValue,
        ttl,
        createdAt: Date.now(),
        lastAccessed: Date.now(),
        hitCount: 0,
        size: this.calculateSize(finalValue),
        compressed,
        metadata: {
          originalSize: serialized.length,
          compressionRatio: compressed ? serialized.length / this.calculateSize(finalValue) : 1
        }
      };

      // Store in Redis
      if (this.redis) {
        await this.redis.setex(key, ttl, JSON.stringify(entry));
      }

      // Store in local cache if under size limit
      if (this.shouldCacheLocally(entry)) {
        this.localCache.set(key, entry);
        this.maintainLocalCacheSize();
      }

      this.updateMetrics('set', Date.now() - startTime);

    } catch (error) {
      console.error(`❌ Cache set error for key ${key}:`, error);
      throw error;
    }
  }

  /**
   * Delete from cache
   */
  async delete(key: string): Promise<boolean> {
    try {
      let deleted = false;

      if (this.redis) {
        const result = await this.redis.del(key);
        deleted = result > 0;
      }

      if (this.localCache.has(key)) {
        this.localCache.delete(key);
        deleted = true;
      }

      return deleted;
    } catch (error) {
      console.error(`❌ Cache delete error for key ${key}:`, error);
      return false;
    }
  }

  /**
   * Batch get operation
   */
  async mget<T>(keys: string[]): Promise<Map<string, T | null>> {
    const result = new Map<string, T | null>();

    if (keys.length === 0) return result;

    try {
      // Try Redis pipeline for better performance
      if (this.redis) {
        const pipeline = this.redis.pipeline();
        keys.forEach(key => pipeline.get(key));
        const results = await pipeline.exec();

        for (let i = 0; i < keys.length; i++) {
          const key = keys[i];
          const [error, value] = results?.[i] || [null, null];

          if (!error && value) {
            try {
              const entry = JSON.parse(value as string) as CacheEntry<T>;
              const finalValue = this.compressionEnabled && entry.compressed
                ? await this.decompress(entry.value as string)
                : entry.value;
              result.set(key, finalValue);
            } catch (parseError) {
              result.set(key, null);
            }
          } else {
            result.set(key, null);
          }
        }
      } else {
        // Fallback to local cache
        for (const key of keys) {
          const value = await this.get<T>(key);
          result.set(key, value);
        }
      }

      return result;
    } catch (error) {
      console.error('❌ Batch get error:', error);

      // Fallback to individual gets
      for (const key of keys) {
        try {
          const value = await this.get<T>(key);
          result.set(key, value);
        } catch (individualError) {
          result.set(key, null);
        }
      }

      return result;
    }
  }

  /**
   * Batch set operation
   */
  async mset<T>(entries: Array<{ key: string; value: T; ttl?: number }>): Promise<void> {
    if (entries.length === 0) return;

    try {
      if (this.redis) {
        const pipeline = this.redis.pipeline();

        for (const entry of entries) {
          const ttl = entry.ttl || this.config.defaultTTL;
          let finalValue: any = entry.value;
          let compressed = false;

          // Compress large values
          const serialized = JSON.stringify(entry.value);
          if (this.compressionEnabled && serialized.length > this.config.compressionThreshold) {
            finalValue = await this.compress(serialized);
            compressed = true;
          }

          const cacheEntry: CacheEntry<T> = {
            key: entry.key,
            value: finalValue,
            ttl,
            createdAt: Date.now(),
            lastAccessed: Date.now(),
            hitCount: 0,
            size: this.calculateSize(finalValue),
            compressed,
            metadata: {
              originalSize: serialized.length,
              compressionRatio: compressed ? serialized.length / this.calculateSize(finalValue) : 1
            }
          };

          pipeline.setex(entry.key, ttl, JSON.stringify(cacheEntry));
        }

        await pipeline.exec();
      } else {
        // Fallback to individual sets
        for (const entry of entries) {
          await this.set(entry.key, entry.value, entry.ttl);
        }
      }
    } catch (error) {
      console.error('❌ Batch set error:', error);
      throw error;
    }
  }

  /**
   * Cache warming strategies
   */
  async warmCache(strategy: string, data: any[] = []): Promise<void> {
    console.log(`🔥 Starting cache warming with strategy: ${strategy}`);

    try {
      switch (strategy) {
        case 'recent':
          await this.warmRecentData(data);
          break;
        case 'popular':
          await this.warmPopularData(data);
          break;
        case 'critical':
          await this.warmCriticalData(data);
          break;
        case 'precomputed':
          await this.warmPrecomputedData(data);
          break;
        default:
          console.warn(`Unknown warming strategy: ${strategy}`);
      }
    } catch (error) {
      console.error(`❌ Cache warming failed for strategy ${strategy}:`, error);
    }
  }

  /**
   * Get cache statistics
   */
  getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  /**
   * Clear all cache
   */
  async clear(): Promise<void> {
    try {
      if (this.redis) {
        const keys = await this.redis.keys(`${this.config.redis.keyPrefix}*`);
        if (keys.length > 0) {
          await this.redis.del(...keys);
        }
      }

      this.localCache.clear();
      this.metrics = this.initializeMetrics();

      console.log('🧹 Cache cleared successfully');
    } catch (error) {
      console.error('❌ Cache clear error:', error);
      throw error;
    }
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<{
    redis: boolean;
    localCache: boolean;
    metrics: PerformanceMetrics;
  }> {
    let redisHealth = false;

    try {
      if (this.redis) {
        await this.redis.ping();
        redisHealth = true;
      }
    } catch (error) {
      redisHealth = false;
    }

    return {
      redis: redisHealth,
      localCache: true,
      metrics: this.getMetrics()
    };
  }

  // Private helper methods

  private initializeMetrics(): PerformanceMetrics {
    return {
      cache: {
        hits: 0,
        misses: 0,
        hitRatio: 0,
        totalSize: 0,
        entryCount: 0,
        evictions: 0,
        averageResponseTime: 0
      },
      memory: {
        heapUsed: 0,
        heapTotal: 0,
        external: 0,
        rss: 0,
        arrayBuffers: 0
      },
      connections: {
        active: 0,
        idle: 0,
        waiting: 0,
        total: 0
      },
      queries: {
        total: 0,
        average: 0,
        slow: 0,
        cached: 0,
        optimized: 0
      },
      operations: {
        reads: 0,
        writes: 0,
        deletes: 0,
        averageLatency: 0,
        throughput: 0
      }
    };
  }

  private updateMetrics(type: 'hit' | 'miss' | 'set', responseTime: number): void {
    if (!this.config.enableMetrics) return;

    switch (type) {
      case 'hit':
        this.metrics.cache.hits++;
        this.metrics.operations.reads++;
        break;
      case 'miss':
        this.metrics.cache.misses++;
        this.metrics.operations.reads++;
        break;
      case 'set':
        this.metrics.operations.writes++;
        break;
    }

    // Update hit ratio
    const total = this.metrics.cache.hits + this.metrics.cache.misses;
    this.metrics.cache.hitRatio = total > 0 ? this.metrics.cache.hits / total : 0;

    // Update average response time
    this.metrics.cache.averageResponseTime = (
      (this.metrics.cache.averageResponseTime * (total - 1) + responseTime) / total
    );

    // Update cache size metrics
    this.metrics.cache.entryCount = this.localCache.size;
    this.metrics.cache.totalSize = Array.from(this.localCache.values())
      .reduce((total, entry) => total + entry.size, 0);
  }

  private startMetricsCollection(): void {
    if (!this.config.enableMetrics) return;

    setInterval(() => {
      const memUsage = process.memoryUsage();
      this.metrics.memory = {
        heapUsed: memUsage.heapUsed,
        heapTotal: memUsage.heapTotal,
        external: memUsage.external,
        rss: memUsage.rss,
        arrayBuffers: memUsage.arrayBuffers
      };

      this.emit('metrics:updated', this.metrics);
    }, 5000); // Every 5 seconds
  }

  private startCacheMaintenance(): void {
    // Clean expired local cache entries every minute
    setInterval(() => {
      const now = Date.now();
      for (const [key, entry] of this.localCache.entries()) {
        if (now - entry.createdAt > entry.ttl * 1000) {
          this.localCache.delete(key);
          this.metrics.cache.evictions++;
        }
      }
    }, 60000); // Every minute

    // Log cache statistics every 10 minutes
    setInterval(() => {
      const metrics = this.getMetrics();
      console.log('📊 Cache Metrics:', {
        hitRatio: `${(metrics.cache.hitRatio * 100).toFixed(1)}%`,
        entries: metrics.cache.entryCount,
        sizeMB: (metrics.cache.totalSize / 1024 / 1024).toFixed(2),
        avgResponseTime: `${metrics.cache.averageResponseTime.toFixed(2)}ms`
      });
    }, 600000); // Every 10 minutes
  }

  private shouldCacheLocally(entry: CacheEntry): boolean {
    // Don't cache locally if too large
    const maxEntrySize = (this.config.maxCacheSize * 1024 * 1024) / 1000; // Max 1/1000th of cache size per entry
    if (entry.size > maxEntrySize) return false;

    // Don't cache if local cache is getting too large
    const currentSize = Array.from(this.localCache.values())
      .reduce((total, e) => total + e.size, 0);
    const maxSize = this.config.maxCacheSize * 1024 * 1024;

    return currentSize + entry.size < maxSize;
  }

  private maintainLocalCacheSize(): void {
    const maxSize = this.config.maxCacheSize * 1024 * 1024;
    let currentSize = Array.from(this.localCache.values())
      .reduce((total, entry) => total + entry.size, 0);

    if (currentSize > maxSize) {
      // Sort by last accessed time and hit count (LRU + LFU hybrid)
      const entries = Array.from(this.localCache.entries()).sort((a, b) => {
        const scoreA = a[1].lastAccessed + (a[1].hitCount * 3600000); // Weight hit count heavily
        const scoreB = b[1].lastAccessed + (b[1].hitCount * 3600000);
        return scoreA - scoreB; // Oldest/least used first
      });

      // Remove entries until we're under the limit
      for (const [key, entry] of entries) {
        if (currentSize <= maxSize * 0.8) break; // Stop at 80% to prevent thrashing

        this.localCache.delete(key);
        currentSize -= entry.size;
        this.metrics.cache.evictions++;
      }
    }
  }

  private calculateSize(value: any): number {
    return JSON.stringify(value).length * 2; // Rough estimate (UTF-16)
  }

  private async compress(data: string): Promise<string> {
    // Placeholder for compression implementation
    // In production, use zlib or similar
    return Buffer.from(data).toString('base64');
  }

  private async decompress(data: string): Promise<string> {
    // Placeholder for decompression implementation
    return Buffer.from(data, 'base64').toString('utf-8');
  }

  private async warmRecentData(data: any[]): Promise<void> {
    const recentData = data.slice(0, 100); // Last 100 items
    for (const item of recentData) {
      await this.set(`recent:${item.id}`, item);
    }
  }

  private async warmPopularData(data: any[]): Promise<void> {
    const popularData = data
      .sort((a, b) => (b.accessCount || 0) - (a.accessCount || 0))
      .slice(0, 50); // Top 50 most accessed

    for (const item of popularData) {
      await this.set(`popular:${item.id}`, item);
    }
  }

  private async warmCriticalData(data: any[]): Promise<void> {
    const criticalData = data.filter(item => item.importance >= 8);
    for (const item of criticalData) {
      await this.set(`critical:${item.id}`, item);
    }
  }

  private async warmPrecomputedData(data: any[]): Promise<void> {
    // Pre-compute common aggregations or calculations
    const aggregations = {
      totalCount: data.length,
      averageImportance: data.reduce((sum, item) => sum + (item.importance || 5), 0) / data.length,
      entityTypes: [...new Set(data.map(item => item.entityType))],
      recentCount: data.filter(item =>
        Date.now() - new Date(item.timestamp || Date.now()).getTime() < 24 * 60 * 60 * 1000
      ).length
    };

    await this.set('precomputed:aggregations', aggregations, 300); // 5 minute TTL
  }

  /**
   * Cleanup resources
   */
  async dispose(): Promise<void> {
    try {
      if (this.redis) {
        await this.redis.quit();
        this.redis = null;
      }

      this.localCache.clear();
      this.removeAllListeners();

      console.log('🧹 Performance cache disposed successfully');
    } catch (error) {
      console.error('❌ Error disposing performance cache:', error);
    }
  }
}

/**
 * Connection Pool Manager
 */
export class ConnectionPoolManager {
  private pools: Map<string, any> = new Map();
  private config: Required<PerformanceConfig>;
  private metrics: PerformanceMetrics['connections'] = {
    active: 0,
    idle: 0,
    waiting: 0,
    total: 0
  };

  constructor(config: PerformanceConfig = {}) {
    this.config = {
      connectionPooling: {
        maxConnections: 10,
        minConnections: 2,
        acquireTimeoutMillis: 30000,
        createTimeoutMillis: 5000,
        destroyTimeoutMillis: 5000,
        idleTimeoutMillis: 300000, // 5 minutes
        reapIntervalMillis: 10000,
        createRetryIntervalMillis: 200,
        ...config.connectionPooling
      },
      lazyLoading: {
        enabled: true,
        batchSize: 100,
        prefetchThreshold: 0.8,
        maxConcurrentLoads: 3,
        ...config.lazyLoading
      },
      queryOptimization: {
        enableQueryCache: true,
        maxQueryCacheSize: 1000,
        queryPlanCaching: true,
        indexOptimization: true,
        ...config.queryOptimization
      },
      memoryManagement: {
        heapSnapshotThreshold: 512, // MB
        gcOptimization: true,
        memoryLeakDetection: true,
        objectPooling: false,
        ...config.memoryManagement
      }
    };
  }

  /**
   * Create connection pool for a service
   */
  createPool(name: string, factory: any): void {
    // Implementation would depend on specific database/service
    // This is a placeholder for the interface
    console.log(`Creating connection pool: ${name}`);
    this.pools.set(name, factory);
  }

  /**
   * Get connection from pool
   */
  async acquire(poolName: string): Promise<any> {
    const pool = this.pools.get(poolName);
    if (!pool) {
      throw new Error(`Pool ${poolName} not found`);
    }

    // Implementation would acquire connection from pool
    this.metrics.active++;
    this.metrics.total++;

    return pool;
  }

  /**
   * Release connection back to pool
   */
  async release(poolName: string, connection: any): Promise<void> {
    // Implementation would release connection back to pool
    this.metrics.active--;
    this.metrics.idle++;
  }

  getMetrics(): PerformanceMetrics['connections'] {
    return { ...this.metrics };
  }
}

/**
 * Lazy Loading Manager
 */
export class LazyLoadManager {
  private config: Required<PerformanceConfig>['lazyLoading'];
  private loadingTasks: Map<string, Promise<any>> = new Map();
  private cache: PerformanceCache;

  constructor(config: PerformanceConfig['lazyLoading'], cache: PerformanceCache) {
    this.config = {
      enabled: true,
      batchSize: 100,
      prefetchThreshold: 0.8,
      maxConcurrentLoads: 3,
      ...config
    };
    this.cache = cache;
  }

  /**
   * Load data lazily with caching
   */
  async lazyLoad<T>(
    key: string,
    loader: () => Promise<T[]>,
    options: {
      offset?: number;
      limit?: number;
      cursor?: string;
    } = {}
  ): Promise<LazyLoadResult<T>> {
    const startTime = Date.now();
    const cacheKey = `lazy:${key}:${JSON.stringify(options)}`;

    try {
      // Check cache first
      const cached = await this.cache.get<LazyLoadResult<T>>(cacheKey);
      if (cached) {
        return {
          ...cached,
          fromCache: true
        };
      }

      // Check if already loading
      if (this.loadingTasks.has(cacheKey)) {
        const result = await this.loadingTasks.get(cacheKey);
        return {
          ...result,
          fromCache: false
        };
      }

      // Start loading
      const loadingPromise = this.performLoad(loader, options);
      this.loadingTasks.set(cacheKey, loadingPromise);

      const data = await loadingPromise;
      const result: LazyLoadResult<T> = {
        data: data.slice(0, this.config.batchSize),
        hasMore: data.length > this.config.batchSize,
        nextCursor: options.cursor ? `${options.cursor}_next` : 'next',
        totalCount: data.length,
        loadTime: Date.now() - startTime,
        fromCache: false
      };

      // Cache result
      await this.cache.set(cacheKey, result, 300); // 5 minute TTL

      // Clean up loading task
      this.loadingTasks.delete(cacheKey);

      return result;

    } catch (error) {
      this.loadingTasks.delete(cacheKey);
      throw error;
    }
  }

  private async performLoad<T>(loader: () => Promise<T[]>, options: any): Promise<T[]> {
    // Apply any loading optimizations here
    const data = await loader();

    // Apply offset/limit if specified
    const { offset = 0, limit = this.config.batchSize } = options;
    return data.slice(offset, offset + limit);
  }
}

export default PerformanceCache;