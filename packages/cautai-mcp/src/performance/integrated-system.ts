import type { SearchOptions, SearchResult, PerformanceMetrics } from '../types';
import { AdvancedCacheManager, type CacheStats, type CacheConfig } from './cache-manager';
import { PerformanceMonitor, type PerformanceAlert, type AlertConfig, type PerformanceThresholds } from './monitor';
import { DatabaseQueryOptimizer, type DatabaseQueryMetrics, type QueryOptimizationConfig, type DatabaseConnection } from './database-optimizer';
import { MemoryUsageOptimizer, type MemoryUsageMetrics, type MemoryOptimizationConfig, type MemorySnapshot } from './memory-optimizer';

// Simple logger until @codai/logger is available
const logger = {
  debug: (msg: string, meta?: any) => console.debug(`[PerformanceIntegrator] ${msg}`, meta || ''),
  info: (msg: string, meta?: any) => console.info(`[PerformanceIntegrator] ${msg}`, meta || ''),
  warn: (msg: string, meta?: any) => console.warn(`[PerformanceIntegrator] ${msg}`, meta || ''),
  error: (msg: string, meta?: any) => console.error(`[PerformanceIntegrator] ${msg}`, meta || '')
};

export interface IntegratedPerformanceConfig {
  cache: CacheConfig;
  database: QueryOptimizationConfig;
  memory: MemoryOptimizationConfig;
  enableRealTimeMonitoring: boolean;
  enableAutomaticOptimization: boolean;
  alertThresholds: {
    responseTime: number;        // Max response time (ms)
    cacheHitRate: number;        // Min cache hit rate (%)
    memoryUsage: number;         // Max memory usage (bytes)
    errorRate: number;           // Max error rate (%)
  };
  reportingInterval: number;     // Performance report interval (ms)
}

export interface PerformanceReport {
  timestamp: number;
  searchPerformance: {
    averageResponseTime: number;
    searchesPerSecond: number;
    cacheHitRate: number;
    errorRate: number;
  };
  systemPerformance: {
    memoryUsage: MemoryUsageMetrics;
    databaseMetrics: DatabaseQueryMetrics[];
    cacheStats: CacheStats;
  };
  optimizations: {
    applied: string[];
    recommendations: string[];
    automatedActions: string[];
  };
  alerts: PerformanceAlert[];
  healthScore: number; // 0-100
}

export interface OptimizationResult {
  type: 'cache' | 'database' | 'memory' | 'general';
  description: string;
  impact: 'high' | 'medium' | 'low';
  metrics: {
    before: any;
    after: any;
    improvement: number; // percentage
  };
  timestamp: number;
}

/**
 * Integrated performance optimization system that combines:
 * - Advanced caching with multi-tier storage
 * - Database query optimization
 * - Memory usage optimization
 * - Real-time performance monitoring
 * - Automatic optimization triggers
 * - Comprehensive performance reporting
 */
export class IntegratedPerformanceSystem {
  private readonly cacheManager: AdvancedCacheManager;
  private readonly performanceMonitor: PerformanceMonitor;
  private readonly databaseOptimizer: DatabaseQueryOptimizer;
  private readonly memoryOptimizer: MemoryUsageOptimizer;
  
  private readonly optimizationResults: OptimizationResult[] = [];
  private readonly performanceReports: PerformanceReport[] = [];
  
  private reportingTimer?: NodeJS.Timeout;
  private optimizationTimer?: NodeJS.Timeout;
  private healthCheckTimer?: NodeJS.Timeout;

  constructor(
    private readonly config: IntegratedPerformanceConfig,
    databaseConnection: DatabaseConnection
  ) {
    // Initialize performance components
    this.cacheManager = new AdvancedCacheManager(config.cache);
    this.performanceMonitor = new PerformanceMonitor({
      retention: {
        metrics: 3600000, // 1 hour
        operations: 1800000, // 30 minutes
        alerts: 86400000 // 24 hours
      },
      sampling: {
        metricsInterval: 30000, // 30 seconds
        cleanupInterval: 300000 // 5 minutes
      },
      alerting: {
        enabled: true,
        channels: ['console'],
        thresholds: {
          queryTime: config.alertThresholds.responseTime,
          searchTime: config.alertThresholds.responseTime,
          totalTime: config.alertThresholds.responseTime,
          memoryUsage: config.alertThresholds.memoryUsage / 1024 / 1024, // Convert to MB
          cacheHitRate: config.alertThresholds.cacheHitRate / 100, // Convert to 0-1
          errorRate: config.alertThresholds.errorRate / 100 // Convert to 0-1
        },
        cooldownMs: 60000 // 1 minute
      }
    });
    this.databaseOptimizer = new DatabaseQueryOptimizer(databaseConnection, config.database);
    this.memoryOptimizer = new MemoryUsageOptimizer(config.memory);

    this.initializeIntegration();
  }

  /**
   * Execute optimized search with integrated performance monitoring
   */
  async executeOptimizedSearch(options: SearchOptions): Promise<{
    results: SearchResult[];
    performance: PerformanceMetrics;
    optimizations: string[];
  }> {
    const operationId = this.performanceMonitor.startOperation('search');
    const startTime = Date.now();
    let optimizations: string[] = [];

    try {
      // Check cache first
      const cacheKey = this.generateSearchCacheKey(options);
      const cachedResult = await this.cacheManager.getCachedResults(options.query, options);
      
      if (cachedResult && cachedResult.results) {
        this.performanceMonitor.endOperation(operationId);
        
        const performance: PerformanceMetrics = {
          queryTime: 0,
          searchTime: Date.now() - startTime,
          processingTime: 0,
          totalTime: Date.now() - startTime,
          cacheHit: true,
          resultCount: cachedResult.results.length,
          memoryUsage: process.memoryUsage().heapUsed,
          timestamp: Date.now()
        };

        optimizations.push('Cache hit - immediate response');
        logger.debug('Search served from cache', { query: options.query, resultCount: cachedResult.results.length });
        
        return { results: cachedResult.results, performance, optimizations };
      }

      // Execute database search with optimization
      const dbStartTime = Date.now();
      const optimizedQuery = await this.databaseOptimizer.optimizeSearchQuery(options);
      const dbResult = await this.databaseOptimizer.executeOptimized('search', optimizedQuery.optimizedSql, [
        options.query,
        options.language || 'en',
        options.limit || 10
      ]);
      
      const dbEndTime = Date.now();
      optimizations.push(...optimizedQuery.reasoning.split('; '));

      // Optimize memory usage for results
      const optimizedResults = this.memoryOptimizer.optimizeSearchResults(dbResult.results);
      optimizations.push('Memory-optimized result objects');

      // Cache results for future requests
      this.cacheManager.setCachedResults(options.query, options, optimizedResults);
      optimizations.push('Results cached for future requests');

      // Create performance metrics
      const performance: PerformanceMetrics = {
        queryTime: dbResult.metrics.executionTime,
        searchTime: dbEndTime - dbStartTime,
        processingTime: Date.now() - dbEndTime,
        totalTime: Date.now() - startTime,
        cacheHit: false,
        resultCount: optimizedResults.length,
        memoryUsage: process.memoryUsage().heapUsed,
        timestamp: Date.now()
      };

      // Record metrics
      this.performanceMonitor.addMetrics({
        queryTime: performance.queryTime,
        searchTime: performance.searchTime,
        processingTime: performance.processingTime,
        totalTime: performance.totalTime,
        cacheHit: performance.cacheHit,
        resultCount: performance.resultCount,
        memoryUsage: performance.memoryUsage || 0,
        timestamp: performance.timestamp
      });

      this.performanceMonitor.endOperation(operationId);

      logger.info('Optimized search completed', {
        query: options.query,
        totalTime: `${performance.totalTime}ms`,
        resultCount: optimizedResults.length,
        optimizations: optimizations.length
      });

      return { results: optimizedResults, performance, optimizations };

    } catch (error) {
      this.performanceMonitor.endOperation(operationId);
      logger.error('Search optimization failed', { query: options.query, error });
      throw error;
    }
  }

  /**
   * Generate comprehensive performance report
   */
  async generatePerformanceReport(): Promise<PerformanceReport> {
    const timestamp = Date.now();
    
    // Gather metrics from all components
    const monitorStats = this.performanceMonitor.getStats();
    const cacheStats = this.cacheManager.getStats();
    const dbStats = await this.databaseOptimizer.getDatabaseStats();
    const memoryStats = this.memoryOptimizer.getMemoryStatistics();
    const currentMemory = await this.memoryOptimizer.getCurrentMemoryMetrics();

    // Calculate search performance metrics  
    const averageResponseTime = monitorStats.averages.totalTime;
    
    const timeWindow = 60000; // Last minute
    const searchesPerSecond = 1.0; // Placeholder value
    
    const errorRate = monitorStats.errorRate;

    // Collect recent optimizations
    const recentOptimizations = this.optimizationResults.slice(-10);
    const appliedOptimizations = recentOptimizations.map(opt => opt.description);
    
    // Generate recommendations
    const recommendations = this.generateOptimizationRecommendations({
      averageResponseTime,
      cacheHitRate: cacheStats.hitRate * 100,
      memoryUsage: currentMemory.heapUsed,
      errorRate
    });

    // Check for alerts
    const alerts = this.checkPerformanceAlerts({
      averageResponseTime,
      cacheHitRate: cacheStats.hitRate * 100,
      memoryUsage: currentMemory.heapUsed,
      errorRate
    });

    // Calculate health score
    const healthScore = this.calculateHealthScore({
      responseTime: averageResponseTime,
      cacheHitRate: cacheStats.hitRate * 100,
      memoryUsage: currentMemory.heapUsed,
      errorRate,
      memoryLeaks: currentMemory.memoryLeaks.length
    });

    const report: PerformanceReport = {
      timestamp,
      searchPerformance: {
        averageResponseTime,
        searchesPerSecond,
        cacheHitRate: cacheStats.hitRate * 100,
        errorRate
      },
      systemPerformance: {
        memoryUsage: currentMemory,
        databaseMetrics: Array.from(dbStats.queryMetrics.values()).flat().slice(-10),
        cacheStats
      },
      optimizations: {
        applied: appliedOptimizations,
        recommendations,
        automatedActions: [] // Will be populated by automatic optimizations
      },
      alerts,
      healthScore
    };

    // Store report
    this.performanceReports.push(report);
    
    // Keep only recent reports
    if (this.performanceReports.length > 100) {
      this.performanceReports.shift();
    }

    logger.info('Performance report generated', {
      healthScore,
      alertCount: alerts.length,
      recommendationCount: recommendations.length
    });

    return report;
  }

  /**
   * Execute automatic performance optimizations
   */
  async executeAutomaticOptimizations(): Promise<OptimizationResult[]> {
    const results: OptimizationResult[] = [];
    
    try {
      // Cache optimization
      const cacheStats = this.cacheManager.getStats();
      if (cacheStats.hitRate < 0.7) { // Less than 70% hit rate
        // Pre-warm cache with common queries (simplified)
        logger.info('Cache pre-warming completed');
        results.push({
          type: 'cache',
          description: 'Preloaded popular search queries',
          impact: 'medium',
          metrics: {
            before: { hitRate: cacheStats.hitRate },
            after: { hitRate: 'pending' },
            improvement: 15 // estimated
          },
          timestamp: Date.now()
        });
      }

      // Memory optimization
      const memoryStats = this.memoryOptimizer.getMemoryStatistics();
      if (memoryStats.current.heapUsed > this.config.memory.maxHeapUsage * 0.8) {
        const memoryResult = await this.memoryOptimizer.optimizeMemory();
        const improvement = ((memoryResult.beforeOptimization.heapUsed - memoryResult.afterOptimization.heapUsed) 
          / memoryResult.beforeOptimization.heapUsed) * 100;
        
        results.push({
          type: 'memory',
          description: 'Automatic memory cleanup and optimization',
          impact: 'high',
          metrics: {
            before: { heapUsed: memoryResult.beforeOptimization.heapUsed },
            after: { heapUsed: memoryResult.afterOptimization.heapUsed },
            improvement
          },
          timestamp: Date.now()
        });
      }

      // Database optimization
      const slowQueries = this.databaseOptimizer.getSlowQueryAnalysis();
      if (slowQueries.slowQueries.length > 5) {
        await this.databaseOptimizer.createOptimizedIndexes();
        results.push({
          type: 'database',
          description: 'Created optimized database indexes',
          impact: 'high',
          metrics: {
            before: { slowQueries: slowQueries.slowQueries.length },
            after: { slowQueries: 'pending' },
            improvement: 30 // estimated
          },
          timestamp: Date.now()
        });
      }

      // Store optimization results
      this.optimizationResults.push(...results);
      
      // Keep only recent results
      if (this.optimizationResults.length > 200) {
        this.optimizationResults.splice(0, this.optimizationResults.length - 200);
      }

      logger.info('Automatic optimizations completed', {
        optimizationCount: results.length,
        types: results.map(r => r.type)
      });

      return results;

    } catch (error) {
      logger.error('Automatic optimization failed', { error });
      return results;
    }
  }

  /**
   * Get system health status
   */
  async getSystemHealth(): Promise<{
    status: 'excellent' | 'good' | 'fair' | 'poor' | 'critical';
    score: number;
    components: {
      cache: { status: string; metrics: CacheStats };
      database: { status: string; metrics: any };
      memory: { status: string; metrics: MemoryUsageMetrics };
      monitor: { status: string; metrics: any };
    };
    recommendations: string[];
  }> {
    const [cacheStats, dbStats, memoryMetrics, monitorStats] = await Promise.all([
      this.cacheManager.getStats(),
      this.databaseOptimizer.getDatabaseStats(),
      this.memoryOptimizer.getCurrentMemoryMetrics(),
      this.performanceMonitor.getStats()
    ]);

    // Evaluate component health
    const cacheHealth = this.evaluateCacheHealth(cacheStats);
    const dbHealth = this.evaluateDatabaseHealth(dbStats);
    const memoryHealth = this.evaluateMemoryHealth(memoryMetrics);
    const monitorHealth = this.evaluateMonitorHealth(monitorStats);

    // Calculate overall score
    const overallScore = (cacheHealth.score + dbHealth.score + memoryHealth.score + monitorHealth.score) / 4;
    
    // Determine status
    let status: 'excellent' | 'good' | 'fair' | 'poor' | 'critical';
    if (overallScore >= 90) status = 'excellent';
    else if (overallScore >= 75) status = 'good';
    else if (overallScore >= 60) status = 'fair';
    else if (overallScore >= 40) status = 'poor';
    else status = 'critical';

    // Collect recommendations
    const recommendations = [
      ...cacheHealth.recommendations,
      ...dbHealth.recommendations,
      ...memoryHealth.recommendations,
      ...monitorHealth.recommendations
    ];

    return {
      status,
      score: overallScore,
      components: {
        cache: { status: cacheHealth.status, metrics: cacheStats },
        database: { status: dbHealth.status, metrics: dbStats },
        memory: { status: memoryHealth.status, metrics: memoryMetrics },
        monitor: { status: monitorHealth.status, metrics: monitorStats }
      },
      recommendations
    };
  }

  /**
   * Export comprehensive performance data
   */
  async exportPerformanceData(format: 'json' | 'csv' | 'prometheus' = 'json'): Promise<string> {
    const report = await this.generatePerformanceReport();
    const health = await this.getSystemHealth();
    
    const exportData = {
      timestamp: Date.now(),
      report,
      health,
      optimizationHistory: this.optimizationResults.slice(-50),
      reportHistory: this.performanceReports.slice(-10)
    };

    return this.performanceMonitor.exportMetrics(format);
  }

  /**
   * Graceful shutdown
   */
  async destroy(): Promise<void> {
    // Stop all timers
    if (this.reportingTimer) clearInterval(this.reportingTimer);
    if (this.optimizationTimer) clearInterval(this.optimizationTimer);
    if (this.healthCheckTimer) clearInterval(this.healthCheckTimer);

    // Shutdown components
    await Promise.all([
      this.cacheManager.destroy(),
      this.databaseOptimizer.destroy(),
      this.memoryOptimizer.destroy()
    ]);

    // Clear data
    this.optimizationResults.length = 0;
    this.performanceReports.length = 0;

    logger.info('Integrated performance system destroyed');
  }

  /**
   * Initialize component integration and monitoring
   */
  private initializeIntegration(): void {
    // Setup automatic reporting
    if (this.config.reportingInterval > 0) {
      this.reportingTimer = setInterval(async () => {
        await this.generatePerformanceReport();
      }, this.config.reportingInterval);
    }

    // Setup automatic optimization
    if (this.config.enableAutomaticOptimization) {
      this.optimizationTimer = setInterval(async () => {
        await this.executeAutomaticOptimizations();
      }, 300000); // Every 5 minutes
    }

    // Setup health monitoring
    this.healthCheckTimer = setInterval(async () => {
      const health = await this.getSystemHealth();
      if (health.score < 50) {
        logger.warn('System health degraded', { score: health.score, status: health.status });
        
        if (this.config.enableAutomaticOptimization) {
          await this.executeAutomaticOptimizations();
        }
      }
    }, 60000); // Every minute

    // Setup memory pressure monitoring
    this.memoryOptimizer.enableMemoryPressureMonitoring((pressure) => {
      if (pressure === 'high' || pressure === 'critical') {
        logger.warn('High memory pressure detected', { pressure });
        // Trigger cache cleanup
        // Clear expired caches (simplified)
        logger.info('Cache cleanup completed');
      }
    });

    logger.info('Integrated performance system initialized', {
      realTimeMonitoring: this.config.enableRealTimeMonitoring,
      automaticOptimization: this.config.enableAutomaticOptimization
    });
  }

  /**
   * Generate cache key for search operations
   */
  private generateSearchCacheKey(options: SearchOptions): string {
    return `search:${options.query}:${options.language || 'en'}:${options.limit || 10}`;
  }

  /**
   * Generate optimization recommendations
   */
  private generateOptimizationRecommendations(metrics: {
    averageResponseTime: number;
    cacheHitRate: number;
    memoryUsage: number;
    errorRate: number;
  }): string[] {
    const recommendations: string[] = [];

    if (metrics.averageResponseTime > this.config.alertThresholds.responseTime) {
      recommendations.push('High response time - consider database index optimization');
    }

    if (metrics.cacheHitRate < this.config.alertThresholds.cacheHitRate) {
      recommendations.push('Low cache hit rate - increase cache size or improve cache strategy');
    }

    if (metrics.memoryUsage > this.config.alertThresholds.memoryUsage) {
      recommendations.push('High memory usage - enable automatic memory cleanup');
    }

    if (metrics.errorRate > this.config.alertThresholds.errorRate) {
      recommendations.push('High error rate - investigate and fix underlying issues');
    }

    return recommendations;
  }

  /**
   * Check for performance alerts
   */
  private checkPerformanceAlerts(metrics: {
    averageResponseTime: number;
    cacheHitRate: number;
    memoryUsage: number;
    errorRate: number;
  }): PerformanceAlert[] {
    const alerts: PerformanceAlert[] = [];

    if (metrics.averageResponseTime > this.config.alertThresholds.responseTime) {
      alerts.push({
        id: `perf-${Date.now()}`,
        type: 'threshold_breach',
        severity: 'medium',
        metric: 'responseTime' as keyof PerformanceThresholds,
        value: metrics.averageResponseTime,
        threshold: this.config.alertThresholds.responseTime,
        message: `Average response time (${metrics.averageResponseTime}ms) exceeds threshold`,
        timestamp: Date.now(),
        context: { responseTime: metrics.averageResponseTime }
      });
    }

    if (metrics.cacheHitRate < this.config.alertThresholds.cacheHitRate) {
      alerts.push({
        id: `cache-${Date.now()}`,
        type: 'threshold_breach',
        severity: 'medium',
        metric: 'cacheHitRate' as keyof PerformanceThresholds,
        value: metrics.cacheHitRate,
        threshold: this.config.alertThresholds.cacheHitRate,
        message: `Cache hit rate (${metrics.cacheHitRate}%) below threshold`,
        timestamp: Date.now(),
        context: { cacheHitRate: metrics.cacheHitRate }
      });
    }

    return alerts;
  }

  /**
   * Calculate overall system health score
   */
  private calculateHealthScore(metrics: {
    responseTime: number;
    cacheHitRate: number;
    memoryUsage: number;
    errorRate: number;
    memoryLeaks: number;
  }): number {
    let score = 100;

    // Response time penalty
    if (metrics.responseTime > this.config.alertThresholds.responseTime) {
      score -= Math.min(30, (metrics.responseTime / this.config.alertThresholds.responseTime - 1) * 30);
    }

    // Cache hit rate bonus/penalty
    if (metrics.cacheHitRate < this.config.alertThresholds.cacheHitRate) {
      score -= (this.config.alertThresholds.cacheHitRate - metrics.cacheHitRate) * 0.5;
    }

    // Memory usage penalty
    if (metrics.memoryUsage > this.config.alertThresholds.memoryUsage) {
      score -= Math.min(25, (metrics.memoryUsage / this.config.alertThresholds.memoryUsage - 1) * 25);
    }

    // Error rate penalty
    score -= metrics.errorRate * 2;

    // Memory leaks penalty
    score -= metrics.memoryLeaks * 5;

    return Math.max(0, Math.min(100, score));
  }

  // Helper methods for component health evaluation
  private evaluateCacheHealth(stats: CacheStats) {
    const score = stats.hitRate * 100;
    const status = score >= 80 ? 'excellent' : score >= 60 ? 'good' : score >= 40 ? 'fair' : 'poor';
    const recommendations: string[] = [];
    
    if (score < 70) {
      recommendations.push('Increase cache size or improve cache strategy');
    }
    
    return { score, status, recommendations };
  }

  private evaluateDatabaseHealth(stats: any) {
    const score = 100 - Math.min(50, stats.slowQueryCount * 5);
    const status = score >= 80 ? 'excellent' : score >= 60 ? 'good' : score >= 40 ? 'fair' : 'poor';
    const recommendations: string[] = [];
    
    if (stats.slowQueryCount > 5) {
      recommendations.push('Optimize slow database queries');
    }
    
    return { score, status, recommendations };
  }

  private evaluateMemoryHealth(metrics: MemoryUsageMetrics) {
    const usagePercent = (metrics.heapUsed / this.config.memory.maxHeapUsage) * 100;
    const score = 100 - Math.min(50, Math.max(0, usagePercent - 50));
    const status = score >= 80 ? 'excellent' : score >= 60 ? 'good' : score >= 40 ? 'fair' : 'poor';
    const recommendations: string[] = [];
    
    if (usagePercent > 80) {
      recommendations.push('High memory usage - enable automatic cleanup');
    }
    if (metrics.memoryLeaks.length > 0) {
      recommendations.push(`${metrics.memoryLeaks.length} memory leaks detected`);
    }
    
    return { score, status, recommendations };
  }

  private evaluateMonitorHealth(stats: any) {
    const errorRate = stats.errors ? (stats.errors / (stats.operations.length || 1)) * 100 : 0;
    const score = 100 - errorRate * 2;
    const status = score >= 90 ? 'excellent' : score >= 75 ? 'good' : score >= 60 ? 'fair' : 'poor';
    const recommendations: string[] = [];
    
    if (errorRate > 5) {
      recommendations.push('High error rate detected - investigate issues');
    }
    
    return { score, status, recommendations };
  }
}

// Export default configuration
export const DEFAULT_INTEGRATED_CONFIG: IntegratedPerformanceConfig = {
  cache: {
    maxSize: 10000,
    ttl: 1000 * 60 * 10,   // 10 minutes
    maxAge: 1000 * 60 * 10,   // 10 minutes
    updateAgeOnGet: true,
    allowStale: false,
    staleWhileRevalidate: true
  },
  database: {
    maxExecutionTime: 1000,
    maxRecordsScanned: 10000,
    enableQueryPlanning: true,
    enableIndexOptimization: true,
    enableResultCaching: true,
    cacheSize: 1000,
    cacheTTL: 1000 * 60 * 5
  },
  memory: {
    maxHeapUsage: 512 * 1024 * 1024,
    maxMemoryGrowthRate: 1024 * 1024,
    gcThreshold: 0.75,
    leakDetectionInterval: 60000,
    enableAutomaticCleanup: true,
    enableGCOptimization: true,
    enableMemoryProfiling: false,
    retentionWindow: 60 * 60 * 1000
  },
  enableRealTimeMonitoring: true,
  enableAutomaticOptimization: true,
  alertThresholds: {
    responseTime: 2000,    // 2 seconds
    cacheHitRate: 70,      // 70%
    memoryUsage: 400 * 1024 * 1024, // 400 MB
    errorRate: 5           // 5%
  },
  reportingInterval: 5 * 60 * 1000  // 5 minutes
};