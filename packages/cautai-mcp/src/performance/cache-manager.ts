import { LRUCache } from 'lru-cache';
import { createHash } from 'crypto';
import type { SearchResult, SearchOptions, PerformanceMetrics } from '../types';

// Simple logger until @codai/logger is available
const logger = {
  debug: (msg: string, meta?: any) => console.debug(`[Cache] ${msg}`, meta || ''),
  info: (msg: string, meta?: any) => console.info(`[Cache] ${msg}`, meta || ''),
  warn: (msg: string, meta?: any) => console.warn(`[Cache] ${msg}`, meta || ''),
  error: (msg: string, meta?: any) => console.error(`[Cache] ${msg}`, meta || '')
};

export interface CacheConfig {
  maxSize: number;
  ttl: number; // milliseconds
  maxAge: number; // milliseconds
  updateAgeOnGet: boolean;
  allowStale: boolean;
  staleWhileRevalidate: boolean;
}

export interface CacheStats {
  hits: number;
  misses: number;
  hitRate: number;
  size: number;
  maxSize: number;
  evictions: number;
  staleFetches: number;
  revalidations: number;
}

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
  revalidating?: boolean;
  metadata?: Record<string, any>;
}

/**
 * Advanced multi-tier cache manager with:
 * - LRU eviction policy
 * - TTL-based expiration
 * - Stale-while-revalidate pattern
 * - Performance metrics
 * - Memory pressure handling
 * - Background cleanup
 */
export class AdvancedCacheManager {
  private readonly searchCache: LRUCache<string, CacheEntry<SearchResult[]>>;
  private readonly metadataCache: LRUCache<string, CacheEntry<any>>;
  private readonly performanceCache: LRUCache<string, CacheEntry<PerformanceMetrics>>;
  private readonly logger = logger;
  
  private stats: CacheStats = {
    hits: 0,
    misses: 0,
    hitRate: 0,
    size: 0,
    maxSize: 0,
    evictions: 0,
    staleFetches: 0,
    revalidations: 0
  };

  private cleanupTimer?: NodeJS.Timeout;
  private metricsTimer?: NodeJS.Timeout;

  constructor(private readonly config: CacheConfig) {
    // Search results cache - main cache
    this.searchCache = new LRUCache({
      max: config.maxSize,
      ttl: config.ttl,
      updateAgeOnGet: config.updateAgeOnGet,
      allowStale: config.allowStale,
      dispose: (value, key) => {
        this.stats.evictions++;
        logger.debug('Cache entry evicted', { key, size: this.searchCache.size });
      }
    });

    // Metadata cache - smaller, longer TTL
    this.metadataCache = new LRUCache({
      max: Math.floor(config.maxSize / 4),
      ttl: config.ttl * 2,
      updateAgeOnGet: config.updateAgeOnGet
    });

    // Performance metrics cache - small, short TTL
    this.performanceCache = new LRUCache({
      max: Math.floor(config.maxSize / 8),
      ttl: Math.floor(config.ttl / 2),
      updateAgeOnGet: true
    });

    this.stats.maxSize = config.maxSize;
    this.startBackgroundTasks();
  }

  /**
   * Generate cache key from search query and options
   */
  private generateCacheKey(query: string, options: SearchOptions): string {
    const normalizedQuery = query.toLowerCase().trim();
    const optionsHash = createHash('sha256')
      .update(JSON.stringify(options))
      .digest('hex')
      .substring(0, 16);
    
    return `search:${normalizedQuery}:${optionsHash}`;
  }

  /**
   * Get cached search results with stale-while-revalidate support
   */
  async getCachedResults(
    query: string, 
    options: SearchOptions,
    revalidateFn?: () => Promise<SearchResult[]>
  ): Promise<{ results: SearchResult[] | null; isStale: boolean; shouldRevalidate: boolean }> {
    const key = this.generateCacheKey(query, options);
    const entry = this.searchCache.get(key);

    if (!entry) {
      this.stats.misses++;
      this.updateHitRate();
      logger.debug('Cache miss', { query, key });
      return { results: null, isStale: false, shouldRevalidate: true };
    }

    this.stats.hits++;
    this.updateHitRate();

    const now = Date.now();
    const isStale = now - entry.timestamp > this.config.ttl;
    const shouldRevalidate = isStale && !entry.revalidating && revalidateFn;

    // Start background revalidation if needed
    if (shouldRevalidate) {
      this.startBackgroundRevalidation(key, revalidateFn, entry);
    }

    if (isStale && this.config.staleWhileRevalidate) {
      this.stats.staleFetches++;
    }

    logger.debug('Cache hit', { 
      query, 
      key, 
      isStale, 
      shouldRevalidate,
      age: now - entry.timestamp 
    });

    return { results: entry.data, isStale, shouldRevalidate: false };
  }

  /**
   * Cache search results with metadata
   */
  setCachedResults(
    query: string, 
    options: SearchOptions, 
    results: SearchResult[],
    metadata?: Record<string, any>
  ): void {
    const key = this.generateCacheKey(query, options);
    const entry: CacheEntry<SearchResult[]> = {
      data: results,
      timestamp: Date.now(),
      ttl: this.config.ttl,
      metadata
    };

    this.searchCache.set(key, entry);
    this.stats.size = this.searchCache.size;
    
    this.logger.debug('Cached search results', { 
      query, 
      key, 
      resultCount: results.length,
      cacheSize: this.stats.size 
    });
  }

  /**
   * Cache metadata (e.g., search suggestions, trending queries)
   */
  setCachedMetadata(key: string, data: any, ttl?: number): void {
    const entry: CacheEntry<any> = {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.config.ttl * 2
    };

    this.metadataCache.set(key, entry);
  }

  /**
   * Get cached metadata
   */
  getCachedMetadata<T = any>(key: string): T | null {
    const entry = this.metadataCache.get(key);
    return entry ? entry.data : null;
  }

  /**
   * Cache performance metrics
   */
  setCachedPerformance(key: string, metrics: PerformanceMetrics): void {
    const entry: CacheEntry<PerformanceMetrics> = {
      data: metrics,
      timestamp: Date.now(),
      ttl: Math.floor(this.config.ttl / 2)
    };

    this.performanceCache.set(key, entry);
  }

  /**
   * Get cached performance metrics
   */
  getCachedPerformance(key: string): PerformanceMetrics | null {
    const entry = this.performanceCache.get(key);
    return entry ? entry.data : null;
  }

  /**
   * Invalidate cache entries by pattern
   */
  invalidate(pattern: string | RegExp): number {
    let invalidated = 0;
    
    // Handle string patterns
    if (typeof pattern === 'string') {
      const regex = new RegExp(pattern.replace(/\*/g, '.*'), 'i');
      
      for (const key of this.searchCache.keys()) {
        if (regex.test(key)) {
          this.searchCache.delete(key);
          invalidated++;
        }
      }
      
      for (const key of this.metadataCache.keys()) {
        if (regex.test(key)) {
          this.metadataCache.delete(key);
          invalidated++;
        }
      }
    } else {
      // Handle RegExp patterns
      for (const key of this.searchCache.keys()) {
        if (pattern.test(key)) {
          this.searchCache.delete(key);
          invalidated++;
        }
      }
      
      for (const key of this.metadataCache.keys()) {
        if (pattern.test(key)) {
          this.metadataCache.delete(key);
          invalidated++;
        }
      }
    }

    this.stats.size = this.searchCache.size;
    this.logger.info('Cache invalidation completed', { pattern: pattern.toString(), invalidated });
    
    return invalidated;
  }

  /**
   * Preload cache with popular queries
   */
  async preloadCache(
    queries: Array<{ query: string; options: SearchOptions }>,
    fetchFn: (query: string, options: SearchOptions) => Promise<SearchResult[]>
  ): Promise<void> {
    const startTime = Date.now();
    let preloaded = 0;

    this.logger.info('Starting cache preload', { queryCount: queries.length });

    const preloadPromises = queries.map(async ({ query, options }) => {
      try {
        const key = this.generateCacheKey(query, options);
        if (!this.searchCache.has(key)) {
          const results = await fetchFn(query, options);
          this.setCachedResults(query, options, results, { preloaded: true });
          preloaded++;
        }
      } catch (error) {
        this.logger.warn('Cache preload failed for query', { query, error });
      }
    });

    await Promise.allSettled(preloadPromises);

    const duration = Date.now() - startTime;
    this.logger.info('Cache preload completed', { 
      preloaded, 
      total: queries.length, 
      duration: `${duration}ms` 
    });
  }

  /**
   * Get comprehensive cache statistics
   */
  getStats(): CacheStats & {
    memoryUsage: NodeJS.MemoryUsage;
    cacheBreakdown: {
      search: { size: number; maxSize: number };
      metadata: { size: number; maxSize: number };
      performance: { size: number; maxSize: number };
    };
  } {
    return {
      ...this.stats,
      size: this.searchCache.size,
      memoryUsage: process.memoryUsage(),
      cacheBreakdown: {
        search: { size: this.searchCache.size, maxSize: this.searchCache.max },
        metadata: { size: this.metadataCache.size, maxSize: this.metadataCache.max },
        performance: { size: this.performanceCache.size, maxSize: this.performanceCache.max }
      }
    };
  }

  /**
   * Clear all caches
   */
  clear(): void {
    this.searchCache.clear();
    this.metadataCache.clear();
    this.performanceCache.clear();
    this.resetStats();
    this.logger.info('All caches cleared');
  }

  /**
   * Graceful shutdown
   */
  destroy(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
    }
    if (this.metricsTimer) {
      clearInterval(this.metricsTimer);
    }
    this.clear();
    this.logger.info('Cache manager destroyed');
  }

  /**
   * Start background revalidation
   */
  private async startBackgroundRevalidation(
    key: string,
    revalidateFn: () => Promise<SearchResult[]>,
    currentEntry: CacheEntry<SearchResult[]>
  ): Promise<void> {
    if (currentEntry.revalidating) {
      return;
    }

    currentEntry.revalidating = true;
    this.stats.revalidations++;

    try {
      const freshResults = await revalidateFn();
      const [query, options] = this.parseKeyBack(key);
      if (query && options) {
        this.setCachedResults(query, options, freshResults, { 
          ...currentEntry.metadata, 
          revalidated: true 
        });
      }
      this.logger.debug('Background revalidation completed', { key });
    } catch (error) {
      this.logger.warn('Background revalidation failed', { key, error });
    } finally {
      currentEntry.revalidating = false;
    }
  }

  /**
   * Parse cache key back to query and options (simplified)
   */
  private parseKeyBack(key: string): [string | null, SearchOptions | null] {
    try {
      const parts = key.split(':');
      if (parts.length >= 3 && parts[0] === 'search') {
        const query = parts[1];
        // Note: Full options reconstruction would require storing them
        const basicOptions: SearchOptions = { 
          query,
          limit: 10 
        };
        return [query, basicOptions];
      }
    } catch (error) {
      logger.warn('Failed to parse cache key', { key, error });
    }
    return [null, null];
  }

  /**
   * Update hit rate statistics
   */
  private updateHitRate(): void {
    const total = this.stats.hits + this.stats.misses;
    this.stats.hitRate = total > 0 ? this.stats.hits / total : 0;
  }

  /**
   * Reset statistics
   */
  private resetStats(): void {
    this.stats = {
      hits: 0,
      misses: 0,
      hitRate: 0,
      size: 0,
      maxSize: this.config.maxSize,
      evictions: 0,
      staleFetches: 0,
      revalidations: 0
    };
  }

  /**
   * Start background maintenance tasks
   */
  private startBackgroundTasks(): void {
    // Cleanup expired entries every 5 minutes
    this.cleanupTimer = setInterval(() => {
      const beforeSize = this.searchCache.size;
      this.searchCache.purgeStale();
      this.metadataCache.purgeStale();
      this.performanceCache.purgeStale();
      
      const afterSize = this.searchCache.size;
      if (beforeSize !== afterSize) {
        logger.debug('Cache cleanup completed', { 
          before: beforeSize, 
          after: afterSize, 
          purged: beforeSize - afterSize 
        });
      }
    }, 5 * 60 * 1000);

    // Log metrics every 10 minutes
    this.metricsTimer = setInterval(() => {
      const stats = this.getStats();
      logger.info('Cache performance metrics', {
        hitRate: `${(stats.hitRate * 100).toFixed(2)}%`,
        size: stats.size,
        maxSize: stats.maxSize,
        memoryMB: `${(stats.memoryUsage.heapUsed / 1024 / 1024).toFixed(2)}MB`
      });
    }, 10 * 60 * 1000);
  }
}

// Export default configuration
export const DEFAULT_CACHE_CONFIG: CacheConfig = {
  maxSize: 10000,
  ttl: 1000 * 60 * 15, // 15 minutes
  maxAge: 1000 * 60 * 60, // 1 hour
  updateAgeOnGet: true,
  allowStale: true,
  staleWhileRevalidate: true
};