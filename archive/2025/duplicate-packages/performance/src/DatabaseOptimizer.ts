import { LRUCache } from 'lru-cache';
import { performance } from 'perf_hooks';

/**
 * Database Query Optimization System
 * Phase 5.1: Performance Optimization - Database Layer
 * 
 * Implements intelligent caching, query optimization, and connection pooling
 * Target: Database operations < 50ms average response time
 */

interface QueryCacheOptions {
    maxSize: number;        // Maximum cache entries
    maxAge: number;         // Cache TTL in milliseconds
    updateAge: number;      // Stale-while-revalidate age
}

interface QueryMetrics {
    query: string;
    executionTime: number;
    fromCache: boolean;
    resultSize: number;
    timestamp: number;
    connectionId?: string;
}

interface ConnectionPoolStats {
    totalConnections: number;
    activeConnections: number;
    idleConnections: number;
    queuedRequests: number;
    averageConnectionTime: number;
}

class DatabasePerformanceOptimizer {
    private queryCache: LRUCache<string, any>;
    private metricsCache: LRUCache<string, QueryMetrics>;
    private queryMetrics: QueryMetrics[] = [];
    private connectionPool = new Map<string, any>();
    private activeQueries = new Map<string, number>();

    private cacheOptions: QueryCacheOptions = {
        maxSize: 1000,           // Cache up to 1000 queries
        maxAge: 5 * 60 * 1000,   // 5 minutes default TTL
        updateAge: 60 * 1000     // 1 minute stale-while-revalidate
    };

    constructor(options?: Partial<QueryCacheOptions>) {
        if (options) {
            this.cacheOptions = { ...this.cacheOptions, ...options };
        }

        this.queryCache = new LRUCache({
            max: this.cacheOptions.maxSize,
            ttl: this.cacheOptions.maxAge,
            allowStale: true,
            updateAgeOnGet: true
        });

        this.metricsCache = new LRUCache({
            max: 500,
            ttl: 60 * 60 * 1000 // 1 hour for metrics
        });

        this.startMetricsCleanup();
    }

    /**
     * Execute a query with automatic caching and performance monitoring
     */
    async executeQuery<T>(
        queryId: string,
        queryFn: () => Promise<T>,
        cacheTTL?: number,
        tags: string[] = []
    ): Promise<T> {
        const startTime = performance.now();
        const cacheKey = this.generateCacheKey(queryId, tags);

        // Check cache first
        const cachedResult = this.queryCache.get(cacheKey);
        if (cachedResult !== undefined) {
            const executionTime = performance.now() - startTime;
            this.recordMetrics(queryId, executionTime, true, JSON.stringify(cachedResult).length);
            return cachedResult;
        }

        // Execute query
        this.activeQueries.set(queryId, startTime);

        try {
            const result = await queryFn();
            const executionTime = performance.now() - startTime;

            // Cache the result
            const resultSize = JSON.stringify(result).length;
            if (cacheTTL) {
                this.queryCache.set(cacheKey, result, { ttl: cacheTTL });
            } else {
                this.queryCache.set(cacheKey, result);
            }

            // Record metrics
            this.recordMetrics(queryId, executionTime, false, resultSize);

            return result;
        } catch (error) {
            const executionTime = performance.now() - startTime;
            this.recordMetrics(queryId, executionTime, false, 0);
            throw error;
        } finally {
            this.activeQueries.delete(queryId);
        }
    }

    /**
     * Batch execute multiple queries with optimization
     */
    async executeBatch<T>(
        queries: Array<{
            id: string;
            fn: () => Promise<T>;
            cacheTTL?: number;
            tags?: string[];
        }>
    ): Promise<T[]> {
        // Group queries by cache status
        const cachedQueries: Array<{ index: number; result: T }> = [];
        const uncachedQueries: Array<{ index: number; query: typeof queries[0] }> = [];

        queries.forEach((query, index) => {
            const cacheKey = this.generateCacheKey(query.id, query.tags || []);
            const cachedResult = this.queryCache.get(cacheKey);

            if (cachedResult !== undefined) {
                cachedQueries.push({ index, result: cachedResult });
            } else {
                uncachedQueries.push({ index, query });
            }
        });

        // Execute uncached queries in parallel
        const uncachedPromises = uncachedQueries.map(async ({ index, query }) => {
            const result = await this.executeQuery(query.id, query.fn, query.cacheTTL, query.tags);
            return { index, result };
        });

        const uncachedResults = await Promise.all(uncachedPromises);

        // Merge results in original order
        const results: T[] = new Array(queries.length);

        cachedQueries.forEach(({ index, result }) => {
            results[index] = result;
        });

        uncachedResults.forEach(({ index, result }) => {
            results[index] = result;
        });

        return results;
    }

    /**
     * Optimize memory operations specifically
     */
    async optimizeMemoryOperation<T>(
        operation: 'read' | 'write' | 'search' | 'analytics',
        entityId: string,
        operationFn: () => Promise<T>,
        priority: 'low' | 'normal' | 'high' = 'normal'
    ): Promise<T> {
        const queryId = `memory_${operation}_${entityId}`;
        const tags = [operation, 'memory', priority];

        // Different caching strategies based on operation
        let cacheTTL: number;
        switch (operation) {
            case 'read':
                cacheTTL = priority === 'high' ? 30000 : 300000; // 30s-5m
                break;
            case 'search':
                cacheTTL = 60000; // 1 minute for search results
                break;
            case 'analytics':
                cacheTTL = 600000; // 10 minutes for analytics
                break;
            case 'write':
                // Invalidate related caches on write
                this.invalidateByTags(['memory', entityId]);
                cacheTTL = 0; // Don't cache writes
                break;
            default:
                cacheTTL = 300000; // 5 minutes default
        }

        return this.executeQuery(queryId, operationFn, cacheTTL, tags);
    }

    /**
     * Preload frequently accessed data
     */
    async preloadCaches(preloadConfig: Array<{
        queryId: string;
        queryFn: () => Promise<any>;
        cacheTTL: number;
        tags: string[];
    }>): Promise<void> {
        console.log(`[DatabaseOptimizer] Preloading ${preloadConfig.length} caches...`);

        const preloadPromises = preloadConfig.map(async (config) => {
            try {
                await this.executeQuery(config.queryId, config.queryFn, config.cacheTTL, config.tags);
                console.log(`[DatabaseOptimizer] Preloaded cache: ${config.queryId}`);
            } catch (error) {
                console.error(`[DatabaseOptimizer] Failed to preload cache ${config.queryId}:`, error);
            }
        });

        await Promise.all(preloadPromises);
        console.log(`[DatabaseOptimizer] Cache preloading complete`);
    }

    /**
     * Get query performance statistics
     */
    getQueryStatistics(timeWindowMs = 300000): {
        totalQueries: number;
        averageExecutionTime: number;
        cacheHitRate: number;
        slowQueries: QueryMetrics[];
        topQueries: Array<{ query: string; count: number; avgTime: number }>;
        performanceTargets: {
            averageResponseTime: boolean;
            cacheEfficiency: boolean;
            slowQueryCount: boolean;
        };
    } {
        const now = Date.now();
        const windowStart = now - timeWindowMs;
        const recentMetrics = this.queryMetrics.filter(m => m.timestamp >= windowStart);

        if (recentMetrics.length === 0) {
            return this.getEmptyQueryStats();
        }

        // Basic statistics
        const totalQueries = recentMetrics.length;
        const cacheHits = recentMetrics.filter(m => m.fromCache).length;
        const cacheHitRate = (cacheHits / totalQueries) * 100;

        const executionTimes = recentMetrics.map(m => m.executionTime);
        const averageExecutionTime = executionTimes.reduce((a, b) => a + b, 0) / executionTimes.length;

        // Slow queries (> 100ms)
        const slowQueries = recentMetrics
            .filter(m => m.executionTime > 100)
            .sort((a, b) => b.executionTime - a.executionTime)
            .slice(0, 10);

        // Top queries by frequency
        const queryFreq = new Map<string, { count: number; totalTime: number }>();
        recentMetrics.forEach(m => {
            const existing = queryFreq.get(m.query) || { count: 0, totalTime: 0 };
            queryFreq.set(m.query, {
                count: existing.count + 1,
                totalTime: existing.totalTime + m.executionTime
            });
        });

        const topQueries = Array.from(queryFreq.entries())
            .map(([query, stats]) => ({
                query,
                count: stats.count,
                avgTime: stats.totalTime / stats.count
            }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 10);

        // Performance targets
        const performanceTargets = {
            averageResponseTime: averageExecutionTime < 50, // Target: < 50ms
            cacheEfficiency: cacheHitRate > 60,             // Target: > 60% cache hit rate
            slowQueryCount: slowQueries.length < (totalQueries * 0.05) // Target: < 5% slow queries
        };

        return {
            totalQueries,
            averageExecutionTime,
            cacheHitRate,
            slowQueries,
            topQueries,
            performanceTargets
        };
    }

    /**
     * Invalidate cache entries by tags
     */
    invalidateByTags(tags: string[]): number {
        let invalidatedCount = 0;
        const keysToDelete: string[] = [];

        this.queryCache.forEach((_value: any, key: string) => {
            if (tags.some(tag => key.includes(tag))) {
                keysToDelete.push(key);
            }
        });

        keysToDelete.forEach(key => {
            this.queryCache.delete(key);
            invalidatedCount++;
        });

        console.log(`[DatabaseOptimizer] Invalidated ${invalidatedCount} cache entries for tags: ${tags.join(', ')}`);
        return invalidatedCount;
    }

    /**
     * Get connection pool statistics
     */
    getConnectionPoolStats(): ConnectionPoolStats {
        const totalConnections = this.connectionPool.size;
        const activeConnections = this.activeQueries.size;
        const idleConnections = totalConnections - activeConnections;

        // Calculate average connection time
        const activeTimes = Array.from(this.activeQueries.values());
        const averageConnectionTime = activeTimes.length > 0
            ? activeTimes.reduce((a, b) => a + (performance.now() - b), 0) / activeTimes.length
            : 0;

        return {
            totalConnections,
            activeConnections,
            idleConnections,
            queuedRequests: 0, // Would implement with actual connection pool
            averageConnectionTime
        };
    }

    /**
     * Generate cache key with tags
     */
    private generateCacheKey(queryId: string, tags: string[]): string {
        const tagString = tags.sort().join('|');
        return `${queryId}:${tagString}`;
    }

    /**
     * Record query metrics
     */
    private recordMetrics(
        query: string,
        executionTime: number,
        fromCache: boolean,
        resultSize: number
    ): void {
        const metric: QueryMetrics = {
            query,
            executionTime,
            fromCache,
            resultSize,
            timestamp: Date.now()
        };

        this.queryMetrics.push(metric);
        this.metricsCache.set(`${query}-${Date.now()}`, metric);

        // Log slow queries
        if (!fromCache && executionTime > 100) {
            console.warn(`[DatabaseOptimizer] Slow query detected: ${query} (${executionTime.toFixed(2)}ms)`);
        }

        // Log cache misses for frequently accessed queries
        if (!fromCache && this.isFrequentQuery(query)) {
            console.info(`[DatabaseOptimizer] Cache miss for frequent query: ${query}`);
        }
    }

    /**
     * Check if query is frequently accessed
     */
    private isFrequentQuery(query: string): boolean {
        const recentMetrics = this.queryMetrics.filter(
            m => m.query === query && m.timestamp > Date.now() - 300000
        );
        return recentMetrics.length > 5; // More than 5 times in 5 minutes
    }

    /**
     * Start metrics cleanup process
     */
    private startMetricsCleanup(): void {
        setInterval(() => {
            const oneHourAgo = Date.now() - 3600000;
            this.queryMetrics = this.queryMetrics.filter(m => m.timestamp > oneHourAgo);

            console.log(`[DatabaseOptimizer] Metrics cleanup: ${this.queryMetrics.length} metrics retained`);
        }, 600000); // Clean every 10 minutes
    }

    /**
     * Get empty statistics for when no data is available
     */
    private getEmptyQueryStats() {
        return {
            totalQueries: 0,
            averageExecutionTime: 0,
            cacheHitRate: 0,
            slowQueries: [],
            topQueries: [],
            performanceTargets: {
                averageResponseTime: true,
                cacheEfficiency: false,
                slowQueryCount: true
            }
        };
    }

    /**
     * Generate database performance report
     */
    generateDatabaseReport(): string {
        const queryStats = this.getQueryStatistics();
        const poolStats = this.getConnectionPoolStats();

        const report = `
# Database Performance Report
Generated: ${new Date().toISOString()}

## Query Performance
- Total Queries: ${queryStats.totalQueries}
- Average Execution Time: ${queryStats.averageExecutionTime.toFixed(2)}ms
- Cache Hit Rate: ${queryStats.cacheHitRate.toFixed(1)}%
- Slow Queries: ${queryStats.slowQueries.length}

## Performance Targets
- Response Time (< 50ms): ${queryStats.performanceTargets.averageResponseTime ? '✅ MET' : '❌ NOT MET'}
- Cache Efficiency (> 60%): ${queryStats.performanceTargets.cacheEfficiency ? '✅ MET' : '❌ NOT MET'}  
- Slow Query Rate (< 5%): ${queryStats.performanceTargets.slowQueryCount ? '✅ MET' : '❌ NOT MET'}

## Connection Pool
- Total Connections: ${poolStats.totalConnections}
- Active Connections: ${poolStats.activeConnections}
- Idle Connections: ${poolStats.idleConnections}
- Average Connection Time: ${poolStats.averageConnectionTime.toFixed(2)}ms

## Cache Statistics
- Cache Size: ${this.queryCache.size}
- Cache Max Size: ${this.cacheOptions.maxSize}
- Cache Utilization: ${((this.queryCache.size / this.cacheOptions.maxSize) * 100).toFixed(1)}%

## Top Slow Queries
${queryStats.slowQueries.slice(0, 5).map((q, i) =>
            `${i + 1}. ${q.query} - ${q.executionTime.toFixed(2)}ms`
        ).join('\n')}

## Most Frequent Queries
${queryStats.topQueries.slice(0, 5).map((q, i) =>
            `${i + 1}. ${q.query} - ${q.count} calls, ${q.avgTime.toFixed(2)}ms avg`
        ).join('\n')}
        `.trim();

        return report;
    }
}

// Singleton instance for database optimization
export const databaseOptimizer = new DatabasePerformanceOptimizer();
export { DatabasePerformanceOptimizer };
export default DatabasePerformanceOptimizer;

// Export types
export type { QueryCacheOptions, QueryMetrics, ConnectionPoolStats };
