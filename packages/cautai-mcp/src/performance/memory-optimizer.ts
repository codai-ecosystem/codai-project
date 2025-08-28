import type { SearchResult, SearchOptions } from '../types';

// Simple logger until @codai/logger is available
const logger = {
  debug: (msg: string, meta?: any) => console.debug(`[MemoryOptimizer] ${msg}`, meta || ''),
  info: (msg: string, meta?: any) => console.info(`[MemoryOptimizer] ${msg}`, meta || ''),
  warn: (msg: string, meta?: any) => console.warn(`[MemoryOptimizer] ${msg}`, meta || ''),
  error: (msg: string, meta?: any) => console.error(`[MemoryOptimizer] ${msg}`, meta || '')
};

export interface MemoryUsageMetrics {
  heapUsed: number;           // Currently used heap memory (bytes)
  heapTotal: number;          // Total heap memory (bytes)
  external: number;           // External memory usage (bytes)
  arrayBuffers: number;       // ArrayBuffer memory usage (bytes)
  rss: number;               // Resident Set Size (bytes)
  gcCollections: number;      // Garbage collection count
  gcDuration: number;         // Total GC time (ms)
  memoryLeaks: MemoryLeak[];  // Detected memory leaks
  timestamp: number;
}

export interface MemoryLeak {
  type: 'object' | 'closure' | 'listener' | 'timer' | 'stream';
  count: number;
  size: number;
  location: string;
  stackTrace?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface MemoryOptimizationConfig {
  maxHeapUsage: number;           // Max heap usage before cleanup (bytes)
  maxMemoryGrowthRate: number;    // Max memory growth rate (bytes/second)
  gcThreshold: number;            // Trigger GC when heap usage exceeds (percentage)
  leakDetectionInterval: number;  // Memory leak detection interval (ms)
  enableAutomaticCleanup: boolean; // Enable automatic memory cleanup
  enableGCOptimization: boolean;   // Enable garbage collection optimization
  enableMemoryProfiling: boolean;  // Enable detailed memory profiling
  retentionWindow: number;        // Memory metrics retention window (ms)
}

export interface ObjectPool<T> {
  acquire(): T;
  release(obj: T): void;
  size(): number;
  clear(): void;
}

export interface MemorySnapshot {
  heapSnapshot: any;
  objectCounts: Record<string, number>;
  memoryLeaks: MemoryLeak[];
  recommendations: string[];
  timestamp: number;
}

/**
 * Advanced memory usage optimizer with:
 * - Memory leak detection
 * - Garbage collection optimization
 * - Object pooling
 * - Memory profiling
 * - Automatic cleanup strategies
 * - Memory pressure monitoring
 * - Resource lifecycle management
 */
export class MemoryUsageOptimizer {
  private readonly memoryMetrics: MemoryUsageMetrics[] = [];
  private readonly objectPools = new Map<string, ObjectPool<any>>();
  private readonly weakRefs = new Set<WeakRef<any>>();
  private readonly resourceRegistry = new Map<string, { cleanup: () => void; timestamp: number }>();
  
  private monitoringTimer?: NodeJS.Timeout;
  private cleanupTimer?: NodeJS.Timeout;
  private leakDetectionTimer?: NodeJS.Timeout;
  private gcTimer?: NodeJS.Timeout;
  
  private lastMemorySnapshot?: MemoryUsageMetrics;
  private leakDetectionBaseline?: MemoryUsageMetrics;

  constructor(private readonly config: MemoryOptimizationConfig) {
    this.startMemoryMonitoring();
    this.initializeObjectPools();
    
    // Enable automatic cleanup if configured
    if (config.enableAutomaticCleanup) {
      this.startAutomaticCleanup();
    }
    
    // Enable leak detection if configured
    if (config.leakDetectionInterval > 0) {
      this.startLeakDetection();
    }
    
    // Enable GC optimization if configured
    if (config.enableGCOptimization) {
      this.enableGCOptimization();
    }
  }

  /**
   * Get current memory usage metrics with leak detection
   */
  async getCurrentMemoryMetrics(): Promise<MemoryUsageMetrics> {
    const memUsage = process.memoryUsage();
    const gcStats = this.getGCStats();
    const leaks = await this.detectMemoryLeaks();
    
    const metrics: MemoryUsageMetrics = {
      heapUsed: memUsage.heapUsed,
      heapTotal: memUsage.heapTotal,
      external: memUsage.external,
      arrayBuffers: memUsage.arrayBuffers,
      rss: memUsage.rss,
      gcCollections: gcStats.collections,
      gcDuration: gcStats.duration,
      memoryLeaks: leaks,
      timestamp: Date.now()
    };

    // Store metrics
    this.memoryMetrics.push(metrics);
    
    // Keep only recent metrics
    const retentionTime = Date.now() - this.config.retentionWindow;
    while (this.memoryMetrics.length > 0 && this.memoryMetrics[0].timestamp < retentionTime) {
      this.memoryMetrics.shift();
    }

    return metrics;
  }

  /**
   * Create optimized object pool for frequently created objects
   */
  createObjectPool<T>(
    name: string,
    factory: () => T,
    reset: (obj: T) => void,
    maxSize: number = 100
  ): ObjectPool<T> {
    const pool: T[] = [];
    let created = 0;

    const objectPool: ObjectPool<T> = {
      acquire(): T {
        if (pool.length > 0) {
          return pool.pop()!;
        }
        
        if (created < maxSize) {
          created++;
          return factory();
        }
        
        // Pool exhausted, create temporary object
        logger.warn('Object pool exhausted, creating temporary object', { poolName: name });
        return factory();
      },

      release(obj: T): void {
        if (pool.length < maxSize) {
          reset(obj);
          pool.push(obj);
        }
        // If pool is full, let object be garbage collected
      },

      size(): number {
        return pool.length;
      },

      clear(): void {
        pool.length = 0;
        created = 0;
      }
    };

    this.objectPools.set(name, objectPool);
    logger.info('Object pool created', { name, maxSize });
    
    return objectPool;
  }

  /**
   * Optimize search result memory usage
   */
  optimizeSearchResults(results: SearchResult[]): SearchResult[] {
    const pool = this.objectPools.get('searchResult') as ObjectPool<SearchResult>;
    
    return results.map(result => {
      // Use object pool for result objects
      const optimized = pool?.acquire() || { ...result };
      
      // Optimize string memory usage
      optimized.title = this.internString(result.title);
      optimized.url = this.internString(result.url);
      optimized.snippet = this.truncateString(result.snippet, 300);
      
      // Remove unnecessary properties
      delete (optimized as any).rawContent;
      delete (optimized as any).debugInfo;
      
      return optimized;
    });
  }

  /**
   * Register resource for automatic cleanup
   */
  registerResource(id: string, cleanup: () => void): void {
    this.resourceRegistry.set(id, {
      cleanup,
      timestamp: Date.now()
    });
    
    logger.debug('Resource registered for cleanup', { id });
  }

  /**
   * Unregister resource (called when manually cleaned up)
   */
  unregisterResource(id: string): void {
    const resource = this.resourceRegistry.get(id);
    if (resource) {
      this.resourceRegistry.delete(id);
      logger.debug('Resource unregistered', { id });
    }
  }

  /**
   * Force garbage collection (if available)
   */
  forceGarbageCollection(): boolean {
    if (global.gc) {
      const beforeGC = process.memoryUsage();
      global.gc();
      const afterGC = process.memoryUsage();
      
      const freed = beforeGC.heapUsed - afterGC.heapUsed;
      logger.info('Forced garbage collection', {
        freedMemory: `${(freed / 1024 / 1024).toFixed(2)} MB`,
        heapBefore: `${(beforeGC.heapUsed / 1024 / 1024).toFixed(2)} MB`,
        heapAfter: `${(afterGC.heapUsed / 1024 / 1024).toFixed(2)} MB`
      });
      
      return true;
    }
    
    logger.warn('Garbage collection not available (use --expose-gc flag)');
    return false;
  }

  /**
   * Create memory snapshot for analysis
   */
  async createMemorySnapshot(): Promise<MemorySnapshot> {
    const metrics = await this.getCurrentMemoryMetrics();
    const objectCounts = this.getObjectCounts();
    const recommendations = this.generateMemoryRecommendations(metrics);

    const snapshot: MemorySnapshot = {
      heapSnapshot: null, // Would use v8.getHeapSnapshot() in production
      objectCounts,
      memoryLeaks: metrics.memoryLeaks,
      recommendations,
      timestamp: Date.now()
    };

    logger.info('Memory snapshot created', {
      heapUsed: `${(metrics.heapUsed / 1024 / 1024).toFixed(2)} MB`,
      leaksDetected: metrics.memoryLeaks.length,
      recommendationsCount: recommendations.length
    });

    return snapshot;
  }

  /**
   * Optimize memory usage with various strategies
   */
  async optimizeMemory(): Promise<{
    beforeOptimization: MemoryUsageMetrics;
    afterOptimization: MemoryUsageMetrics;
    optimizationsApplied: string[];
  }> {
    const before = await this.getCurrentMemoryMetrics();
    const optimizations: string[] = [];

    // Clear expired weak references
    this.cleanupWeakReferences();
    optimizations.push('Cleaned up weak references');

    // Clear object pools
    for (const [name, pool] of this.objectPools.entries()) {
      if (pool.size() > 50) { // Clear if pool is large
        pool.clear();
        optimizations.push(`Cleared object pool: ${name}`);
      }
    }

    // Force garbage collection if memory usage is high
    if (before.heapUsed > this.config.maxHeapUsage * 0.8) {
      if (this.forceGarbageCollection()) {
        optimizations.push('Forced garbage collection');
      }
    }

    // Clean up expired resources
    const expiredResources = this.cleanupExpiredResources();
    if (expiredResources > 0) {
      optimizations.push(`Cleaned up ${expiredResources} expired resources`);
    }

    // Clear old metrics
    this.clearOldMetrics();
    optimizations.push('Cleared old metrics');

    const after = await this.getCurrentMemoryMetrics();
    
    const freedMemory = before.heapUsed - after.heapUsed;
    logger.info('Memory optimization completed', {
      freedMemory: `${(freedMemory / 1024 / 1024).toFixed(2)} MB`,
      optimizations: optimizations.length
    });

    return {
      beforeOptimization: before,
      afterOptimization: after,
      optimizationsApplied: optimizations
    };
  }

  /**
   * Get memory usage statistics and trends
   */
  getMemoryStatistics(): {
    current: MemoryUsageMetrics;
    trends: {
      memoryGrowthRate: number;    // bytes/second
      avgGCFrequency: number;      // collections/minute
      leakTrend: 'improving' | 'stable' | 'worsening';
      recommendations: string[];
    };
    objectPoolStats: Record<string, { size: number; efficiency: number }>;
  } {
    const current = this.memoryMetrics[this.memoryMetrics.length - 1];
    const objectPoolStats: Record<string, { size: number; efficiency: number }> = {};
    
    // Calculate object pool statistics
    for (const [name, pool] of this.objectPools.entries()) {
      objectPoolStats[name] = {
        size: pool.size(),
        efficiency: pool.size() > 0 ? 0.8 : 0.5 // Simplified efficiency calculation
      };
    }

    // Calculate trends
    const trends = this.calculateMemoryTrends();

    return {
      current,
      trends,
      objectPoolStats
    };
  }

  /**
   * Enable memory pressure monitoring
   */
  enableMemoryPressureMonitoring(callback: (pressure: 'low' | 'medium' | 'high' | 'critical') => void): void {
    const monitorPressure = async () => {
      const metrics = await this.getCurrentMemoryMetrics();
      const heapUsagePercent = (metrics.heapUsed / metrics.heapTotal) * 100;
      
      let pressure: 'low' | 'medium' | 'high' | 'critical' = 'low';
      
      if (heapUsagePercent > 90) {
        pressure = 'critical';
      } else if (heapUsagePercent > 75) {
        pressure = 'high';
      } else if (heapUsagePercent > 50) {
        pressure = 'medium';
      }
      
      callback(pressure);
      
      // Auto-optimize on high pressure
      if (pressure === 'high' || pressure === 'critical') {
        await this.optimizeMemory();
      }
    };

    // Monitor every 30 seconds
    setInterval(monitorPressure, 30000);
    logger.info('Memory pressure monitoring enabled');
  }

  /**
   * Clean up and stop all monitoring
   */
  destroy(): void {
    if (this.monitoringTimer) clearInterval(this.monitoringTimer);
    if (this.cleanupTimer) clearInterval(this.cleanupTimer);
    if (this.leakDetectionTimer) clearInterval(this.leakDetectionTimer);
    if (this.gcTimer) clearInterval(this.gcTimer);
    
    // Cleanup all resources
    for (const [id, resource] of this.resourceRegistry.entries()) {
      try {
        resource.cleanup();
      } catch (error) {
        logger.warn('Error cleaning up resource', { id, error });
      }
    }
    
    // Clear object pools
    for (const pool of this.objectPools.values()) {
      pool.clear();
    }
    
    this.memoryMetrics.length = 0;
    this.objectPools.clear();
    this.weakRefs.clear();
    this.resourceRegistry.clear();
    
    logger.info('Memory usage optimizer destroyed');
  }

  /**
   * Initialize common object pools
   */
  private initializeObjectPools(): void {
    // Search result object pool
    this.createObjectPool<SearchResult>(
      'searchResult',
      () => ({
        id: '',
        title: '',
        url: '',
        snippet: '',
        language: 'en',
        relevanceScore: 0,
        domain: ''
      }),
      (obj) => {
        obj.id = '';
        obj.title = '';
        obj.url = '';
        obj.snippet = '';
        obj.language = 'en';
        obj.relevanceScore = 0;
        obj.domain = '';
      },
      200
    );

    // Buffer object pool for large data processing
    this.createObjectPool<Buffer>(
      'buffer',
      () => Buffer.allocUnsafe(8192),
      (buf) => buf.fill(0),
      50
    );

    // Array object pool for collections
    this.createObjectPool<any[]>(
      'array',
      () => [],
      (arr) => { arr.length = 0; },
      100
    );
  }

  /**
   * Intern strings to reduce memory usage
   */
  private readonly stringInternMap = new Map<string, string>();
  
  private internString(str: string): string {
    if (str.length < 100) { // Only intern short strings
      const interned = this.stringInternMap.get(str);
      if (interned) {
        return interned;
      }
      this.stringInternMap.set(str, str);
    }
    return str;
  }

  /**
   * Truncate string to reduce memory usage
   */
  private truncateString(str: string, maxLength: number): string {
    if (str.length <= maxLength) {
      return str;
    }
    return str.substring(0, maxLength - 3) + '...';
  }

  /**
   * Start memory monitoring
   */
  private startMemoryMonitoring(): void {
    this.monitoringTimer = setInterval(async () => {
      const metrics = await this.getCurrentMemoryMetrics();
      
      // Check for memory pressure
      if (metrics.heapUsed > this.config.maxHeapUsage) {
        logger.warn('Memory usage exceeds threshold', {
          current: `${(metrics.heapUsed / 1024 / 1024).toFixed(2)} MB`,
          threshold: `${(this.config.maxHeapUsage / 1024 / 1024).toFixed(2)} MB`
        });
        
        if (this.config.enableAutomaticCleanup) {
          await this.optimizeMemory();
        }
      }
    }, 10000); // Every 10 seconds
  }

  /**
   * Start automatic cleanup
   */
  private startAutomaticCleanup(): void {
    this.cleanupTimer = setInterval(() => {
      this.cleanupWeakReferences();
      this.cleanupExpiredResources();
      this.clearOldMetrics();
    }, 60000); // Every minute
  }

  /**
   * Start memory leak detection
   */
  private startLeakDetection(): void {
    this.leakDetectionTimer = setInterval(async () => {
      const metrics = await this.getCurrentMemoryMetrics();
      
      if (metrics.memoryLeaks.length > 0) {
        logger.warn('Memory leaks detected', {
          leakCount: metrics.memoryLeaks.length,
          criticalLeaks: metrics.memoryLeaks.filter(l => l.severity === 'critical').length
        });
      }
    }, this.config.leakDetectionInterval);
  }

  /**
   * Enable GC optimization
   */
  private enableGCOptimization(): void {
    this.gcTimer = setInterval(() => {
      const metrics = this.memoryMetrics[this.memoryMetrics.length - 1];
      if (metrics && metrics.heapUsed > this.config.gcThreshold * this.config.maxHeapUsage) {
        this.forceGarbageCollection();
      }
    }, 30000); // Every 30 seconds
  }

  /**
   * Detect memory leaks (simplified detection)
   */
  private async detectMemoryLeaks(): Promise<MemoryLeak[]> {
    const leaks: MemoryLeak[] = [];
    
    // Check for rapid memory growth
    if (this.memoryMetrics.length > 2) {
      const recent = this.memoryMetrics[this.memoryMetrics.length - 1];
      const previous = this.memoryMetrics[this.memoryMetrics.length - 2];
      const growthRate = (recent.heapUsed - previous.heapUsed) / (recent.timestamp - previous.timestamp) * 1000; // bytes/sec
      
      if (growthRate > this.config.maxMemoryGrowthRate) {
        leaks.push({
          type: 'object',
          count: 1,
          size: recent.heapUsed - previous.heapUsed,
          location: 'unknown',
          severity: growthRate > this.config.maxMemoryGrowthRate * 2 ? 'critical' : 'high'
        });
      }
    }
    
    // Check string intern map size
    if (this.stringInternMap.size > 10000) {
      leaks.push({
        type: 'object',
        count: this.stringInternMap.size,
        size: this.stringInternMap.size * 64, // Rough estimate
        location: 'stringInternMap',
        severity: 'medium'
      });
    }
    
    return leaks;
  }

  /**
   * Get garbage collection statistics
   */
  private getGCStats(): { collections: number; duration: number } {
    // Simplified - would use process.getActiveResourcesInfo() or similar
    return { collections: 0, duration: 0 };
  }

  /**
   * Get object counts for analysis
   */
  private getObjectCounts(): Record<string, number> {
    return {
      objectPools: this.objectPools.size,
      weakRefs: this.weakRefs.size,
      resources: this.resourceRegistry.size,
      metrics: this.memoryMetrics.length,
      internedStrings: this.stringInternMap.size
    };
  }

  /**
   * Generate memory optimization recommendations
   */
  private generateMemoryRecommendations(metrics: MemoryUsageMetrics): string[] {
    const recommendations: string[] = [];
    
    if (metrics.heapUsed > this.config.maxHeapUsage * 0.8) {
      recommendations.push('High memory usage detected - consider enabling automatic cleanup');
    }
    
    if (metrics.memoryLeaks.length > 0) {
      recommendations.push(`${metrics.memoryLeaks.length} memory leaks detected - investigate and fix`);
    }
    
    if (metrics.gcDuration > 100) {
      recommendations.push('High GC duration - consider optimizing object creation patterns');
    }
    
    return recommendations;
  }

  /**
   * Calculate memory trends
   */
  private calculateMemoryTrends(): {
    memoryGrowthRate: number;
    avgGCFrequency: number;
    leakTrend: 'improving' | 'stable' | 'worsening';
    recommendations: string[];
  } {
    if (this.memoryMetrics.length < 2) {
      return {
        memoryGrowthRate: 0,
        avgGCFrequency: 0,
        leakTrend: 'stable',
        recommendations: []
      };
    }
    
    const recent = this.memoryMetrics[this.memoryMetrics.length - 1];
    const older = this.memoryMetrics[0];
    const timeSpan = recent.timestamp - older.timestamp;
    
    const memoryGrowthRate = (recent.heapUsed - older.heapUsed) / (timeSpan / 1000); // bytes/second
    const avgGCFrequency = (recent.gcCollections - older.gcCollections) / (timeSpan / 60000); // collections/minute
    
    // Determine leak trend
    const recentLeakCount = recent.memoryLeaks.length;
    const olderLeakCount = older.memoryLeaks.length;
    let leakTrend: 'improving' | 'stable' | 'worsening' = 'stable';
    
    if (recentLeakCount > olderLeakCount) {
      leakTrend = 'worsening';
    } else if (recentLeakCount < olderLeakCount) {
      leakTrend = 'improving';
    }
    
    const recommendations: string[] = [];
    if (memoryGrowthRate > this.config.maxMemoryGrowthRate) {
      recommendations.push('High memory growth rate - investigate memory leaks');
    }
    if (avgGCFrequency > 10) {
      recommendations.push('High GC frequency - optimize object allocation');
    }
    
    return {
      memoryGrowthRate,
      avgGCFrequency,
      leakTrend,
      recommendations
    };
  }

  /**
   * Clean up weak references
   */
  private cleanupWeakReferences(): void {
    let cleaned = 0;
    for (const ref of this.weakRefs) {
      if (ref.deref() === undefined) {
        this.weakRefs.delete(ref);
        cleaned++;
      }
    }
    
    if (cleaned > 0) {
      logger.debug('Cleaned up weak references', { count: cleaned });
    }
  }

  /**
   * Clean up expired resources
   */
  private cleanupExpiredResources(): number {
    const now = Date.now();
    const expiredThreshold = now - (24 * 60 * 60 * 1000); // 24 hours
    let cleaned = 0;
    
    for (const [id, resource] of this.resourceRegistry.entries()) {
      if (resource.timestamp < expiredThreshold) {
        try {
          resource.cleanup();
          this.resourceRegistry.delete(id);
          cleaned++;
        } catch (error) {
          logger.warn('Error cleaning up expired resource', { id, error });
        }
      }
    }
    
    return cleaned;
  }

  /**
   * Clear old metrics
   */
  private clearOldMetrics(): void {
    const cutoff = Date.now() - this.config.retentionWindow;
    let removed = 0;
    
    while (this.memoryMetrics.length > 0 && this.memoryMetrics[0].timestamp < cutoff) {
      this.memoryMetrics.shift();
      removed++;
    }
    
    if (removed > 0) {
      logger.debug('Cleared old memory metrics', { count: removed });
    }
  }
}

// Export default configuration
export const DEFAULT_MEMORY_CONFIG: MemoryOptimizationConfig = {
  maxHeapUsage: 512 * 1024 * 1024,      // 512 MB
  maxMemoryGrowthRate: 1024 * 1024,     // 1 MB/second
  gcThreshold: 0.75,                    // 75% of max heap
  leakDetectionInterval: 60000,         // 1 minute
  enableAutomaticCleanup: true,
  enableGCOptimization: true,
  enableMemoryProfiling: false,         // Disable for production
  retentionWindow: 60 * 60 * 1000       // 1 hour
};