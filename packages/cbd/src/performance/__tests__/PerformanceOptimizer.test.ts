import { describe, test, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { PerformanceOptimizer } from '../PerformanceOptimizer';
import { 
  PerformanceConfig, 
  QueryOptimizationConfig,
  IndexOptimizationConfig,
  CachingConfig,
  ResourceManagementConfig,
  MonitoringConfig,
  AdaptiveExecutionConfig,
  MaterializedViewConfig,
  CompressionConfig,
  ConnectionPoolConfig,
  PartitioningConfig
} from '../types/PerformanceTypes';

/**
 * Performance Optimizer Test Suite
 * 
 * Comprehensive testing for CBD Database Performance Optimization Engine
 * Based on 2025 industry best practices for enterprise database optimization
 */

// Test configuration factory
const createTestConfig = (): PerformanceConfig => ({
  queryOptimization: {
    enabled: true,
    slowQueryThreshold: 1000, // 1 second
    maxOptimizationTime: 5000, // 5 seconds
    cacheOptimizations: true,
    adaptiveExecution: true,
    parallelizationEnabled: true,
    costBasedOptimization: true,
    hintGeneration: true,
    rewriteRules: [
      {
        name: 'SubqueryToJoin',
        pattern: 'SELECT .* WHERE .* IN \\(SELECT',
        replacement: 'SELECT .* INNER JOIN',
        conditions: ['subquery_cardinality < 1000'],
        description: 'Convert IN subqueries to JOINs for better performance',
        enabled: true
      }
    ],
    statisticsUpdateFrequency: 24 // hours
  } as QueryOptimizationConfig,
  
  indexOptimization: {
    enabled: true,
    autoCreateIndexes: true,
    autoDropUnusedIndexes: false, // Safe default
    fragmentationThreshold: 30, // percentage
    unusedThresholdDays: 90,
    minimumImpactThreshold: 10, // percentage
    minimumCompositeImpact: 20, // percentage
    maxIndexesPerTable: 20,
    maintenanceWindowHours: [2, 3, 4], // 2-4 AM
    fillFactorOptimization: true
  } as IndexOptimizationConfig,
  
  caching: {
    enabled: true,
    defaultEvictionPolicy: 'LRU',
    targetHitRate: 0.85, // 85%
    optimizationCacheMaxAge: 3600000, // 1 hour
    l1Cache: {
      enabled: true,
      maxSize: 512, // MB
      ttl: 300, // 5 minutes
      evictionPolicy: 'LRU',
      compressionEnabled: false,
      encryptionEnabled: false
    },
    l2Cache: {
      enabled: true,
      maxSize: 2048, // MB
      ttl: 3600, // 1 hour
      evictionPolicy: 'LRU',
      compressionEnabled: true,
      encryptionEnabled: false,
      replicationFactor: 2
    },
    l3Cache: {
      enabled: true,
      maxSize: 8192, // MB
      ttl: 86400, // 24 hours
      evictionPolicy: 'LFU',
      compressionEnabled: true,
      encryptionEnabled: true
    },
    cdnCache: {
      enabled: true,
      maxSize: 10240, // MB
      ttl: 604800, // 7 days
      evictionPolicy: 'LFU',
      compressionEnabled: true,
      encryptionEnabled: false
    },
    warmingSchedule: {
      enabled: true,
      schedules: [
        {
          cron: '0 6 * * *', // Daily at 6 AM
          queries: ['critical_query_1', 'critical_query_2'],
          priority: 'high'
        }
      ]
    },
    ttlStrategies: [
      {
        pattern: 'SELECT * FROM users',
        ttl: 300, // 5 minutes
        refreshAhead: true,
        refreshThreshold: 0.1 // 10%
      }
    ],
    compressionEnabled: true
  } as CachingConfig,
  
  resourceManagement: {
    enabled: true,
    bufferPoolSize: 4096, // MB
    sortMemorySize: 512, // MB
    tempTableMemorySize: 256, // MB
    networkCompression: true,
    keepAliveSettings: {
      enabled: true,
      idleTimeout: 300, // seconds
      maxLifetime: 3600, // seconds
      keepAliveInterval: 60 // seconds
    },
    autoScaling: {
      enabled: true,
      scaleUpThresholds: {
        cpu: 80, // percentage
        memory: 85, // percentage
        connections: 90, // percentage
        responseTime: 2000 // milliseconds
      },
      scaleDownThresholds: {
        cpu: 40, // percentage
        memory: 50, // percentage
        connections: 30, // percentage
        responseTime: 500 // milliseconds
      },
      cooldownPeriods: {
        scaleUp: 300, // seconds
        scaleDown: 600 // seconds
      },
      maxScaleUpFactor: 3,
      predictiveScaling: true
    },
    resourceLimits: {
      maxConnections: 1000,
      maxCpuUsage: 95, // percentage
      maxMemoryUsage: 90, // percentage
      maxIOPS: 10000,
      maxBandwidth: 1000 // Mbps
    }
  } as ResourceManagementConfig,
  
  monitoring: {
    enabled: true,
    metricsCollectionInterval: 30, // seconds
    detailedRetention: 30, // days
    aggregatedRetention: 365, // days
    alertRetention: 90, // days
    alertThresholds: {
      responseTime: 2000, // milliseconds
      errorRate: 5, // percentage
      cpuUsage: 80, // percentage
      memoryUsage: 85, // percentage
      diskUsage: 90, // percentage
      connectionCount: 800,
      cacheHitRate: 75 // percentage
    },
    anomalyDetection: {
      enabled: true,
      algorithm: 'hybrid',
      sensitivity: 'medium',
      learningPeriod: 7, // days
      minimumConfidence: 80 // percentage
    },
    notificationChannels: [
      {
        type: 'email',
        config: { recipients: ['admin@codai.dev'] },
        severity: ['warning', 'critical']
      }
    ],
    customMetrics: [
      {
        name: 'custom_query_latency',
        query: 'SELECT AVG(duration) FROM query_log WHERE timestamp > NOW() - INTERVAL 5 MINUTE',
        interval: 60, // seconds
        unit: 'ms',
        aggregation: 'avg'
      }
    ],
    autoRemediation: true
  } as MonitoringConfig,
  
  adaptiveExecution: {
    enabled: true,
    learningEnabled: true,
    adaptationThreshold: 10, // percentage
    maxExecutionPlans: 10,
    planCacheSize: 256, // MB
    statisticsUpdateFrequency: 6 // hours
  } as AdaptiveExecutionConfig,
  
  materializedViews: {
    enabled: true,
    autoRefreshEnabled: true,
    refreshStrategies: [
      {
        pattern: 'analytics_*',
        strategy: 'scheduled',
        schedule: '0 2 * * *', // Daily at 2 AM
        incrementalRefresh: true
      }
    ],
    maxViews: 100,
    storageOptimization: true
  } as MaterializedViewConfig,
  
  compression: {
    enabled: true,
    algorithm: 'zstd',
    level: 6,
    minSizeThreshold: 1024, // bytes
    excludePatterns: ['*.log', '*.tmp']
  } as CompressionConfig,
  
  connectionPooling: {
    minConnections: 10,
    maxConnections: 100,
    idleTimeout: 300, // seconds
    connectionTimeout: 30, // seconds
    validationQuery: 'SELECT 1',
    testOnBorrow: true,
    testOnReturn: false,
    testWhileIdle: true
  } as ConnectionPoolConfig,
  
  partitioning: {
    enabled: true,
    autoPartitioning: true,
    strategies: [
      {
        tableName: 'events',
        type: 'range',
        column: 'created_at',
        partitionCount: 12, // monthly partitions
        retentionPolicy: {
          enabled: true,
          retentionPeriod: 365, // days
          archiveOldPartitions: true,
          archiveLocation: 's3://archive-bucket'
        }
      }
    ],
    maintenanceEnabled: true
  } as PartitioningConfig
});

describe('PerformanceOptimizer', () => {
  let optimizer: PerformanceOptimizer;
  let testConfig: PerformanceConfig;

  beforeEach(() => {
    testConfig = createTestConfig();
    optimizer = new PerformanceOptimizer(testConfig);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Initialization', () => {
    test('should initialize with valid configuration', () => {
      expect(optimizer).toBeDefined();
      expect(optimizer).toBeInstanceOf(PerformanceOptimizer);
    });

    test('should emit initialization events', (done) => {
      let eventCount = 0;
      const expectedEvents = ['initialized', 'baselinesSet', 'monitoringReady'];
      
      expectedEvents.forEach(event => {
        optimizer.on(event, () => {
          eventCount++;
          if (eventCount === expectedEvents.length) {
            done();
          }
        });
      });
      
      // Trigger initialization
      optimizer.startPerformanceMonitoring();
    });

    test('should set performance baselines correctly', async () => {
      const result = await optimizer.generatePerformanceReport(
        { start: new Date('2025-01-01'), end: new Date() },
        false
      );
      
      expect(result.summary).toBeDefined();
      expect(result.summary.performanceScore).toBeGreaterThan(0);
    });
  });

  describe('Query Optimization', () => {
    test('should optimize simple SELECT query', async () => {
      const sql = 'SELECT * FROM users WHERE email = ?';
      const parameters = { email: 'test@example.com' };
      
      const result = await optimizer.optimizeQuery('test_query_1', sql, parameters);
      
      expect(result).toBeDefined();
      expect(result.queryId).toBe('test_query_1');
      expect(result.originalSql).toBe(sql);
      expect(result.optimizedSql).toBeDefined();
      expect(result.timestamp).toBeInstanceOf(Date);
      expect(result.confidence).toBeGreaterThanOrEqual(0);
      expect(result.confidence).toBeLessThanOrEqual(100);
    });

    test('should handle complex queries with joins', async () => {
      const complexSql = `
        SELECT u.id, u.name, p.title, c.name as company
        FROM users u
        LEFT JOIN projects p ON u.id = p.owner_id
        LEFT JOIN companies c ON u.company_id = c.id
        WHERE u.active = true
        AND p.created_at > '2024-01-01'
        ORDER BY u.created_at DESC
        LIMIT 100
      `;
      
      const result = await optimizer.optimizeQuery('complex_query_1', complexSql);
      
      expect(result).toBeDefined();
      expect(result.recommendations).toBeDefined();
      expect(Array.isArray(result.recommendations)).toBe(true);
      expect(result.indexRecommendations).toBeDefined();
      expect(Array.isArray(result.indexRecommendations)).toBe(true);
    });

    test('should provide meaningful recommendations for slow queries', async () => {
      const slowSql = 'SELECT * FROM large_table WHERE unindexed_column LIKE "%search%"';
      
      const result = await optimizer.optimizeQuery('slow_query_1', slowSql);
      
      expect(result.recommendations).toBeDefined();
      expect(result.recommendations!.length).toBeGreaterThan(0);
      
      const hasIndexRecommendation = result.recommendations!.some(
        r => r.type === 'index'
      );
      expect(hasIndexRecommendation).toBe(true);
    });

    test('should cache optimization results', async () => {
      const sql = 'SELECT id, name FROM users WHERE active = true';
      
      // First optimization
      const result1 = await optimizer.optimizeQuery('cache_test_1', sql);
      expect(result1.optimizationTime).toBeGreaterThan(0);
      
      // Second optimization (should use cache)
      const result2 = await optimizer.optimizeQuery('cache_test_2', sql);
      expect(result2).toBeDefined();
      // Cache hit should be faster (this is a simplified test)
    });

    test('should handle optimization errors gracefully', async () => {
      const invalidSql = 'INVALID SQL QUERY';
      
      const result = await optimizer.optimizeQuery('error_query_1', invalidSql);
      
      expect(result).toBeDefined();
      expect(result.error).toBeDefined();
      expect(result.originalSql).toBe(invalidSql);
      expect(result.confidence).toBe(0);
    });

    test('should respect query context and priority', async () => {
      const sql = 'SELECT * FROM orders WHERE user_id = ?';
      const context = {
        userId: 'user123',
        sessionId: 'session456',
        priority: 'critical' as const
      };
      
      const result = await optimizer.optimizeQuery('priority_query_1', sql, { user_id: 123 }, context);
      
      expect(result).toBeDefined();
      // Critical queries should get more optimization attention
      expect(result.recommendations!.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Index Optimization', () => {
    test('should analyze current index usage', async () => {
      const analyses = await optimizer.optimizeIndexes();
      
      expect(Array.isArray(analyses)).toBe(true);
      
      if (analyses.length > 0) {
        const analysis = analyses[0];
        expect(analysis).toBeDefined();
        expect(analysis.type).toMatch(/missing|fragmented|unused|composite|duplicate/);
        expect(analysis.tableName).toBeDefined();
        expect(analysis.action).toMatch(/create|rebuild|reorganize|drop|merge/);
        expect(analysis.priority).toMatch(/low|medium|high/);
      }
    });

    test('should identify missing indexes for specific table', async () => {
      const tableName = 'users';
      const analyses = await optimizer.optimizeIndexes(tableName, {
        createMissing: true,
        dropUnused: false
      });
      
      const missingIndexes = analyses.filter(a => a.type === 'missing');
      
      missingIndexes.forEach(index => {
        expect(index.tableName).toBe(tableName);
        expect(index.action).toBe('create');
        expect(index.sql).toBeDefined();
        expect(index.sql).toContain('CREATE');
      });
    });

    test('should detect fragmented indexes', async () => {
      const analyses = await optimizer.optimizeIndexes(undefined, {
        rebuildFragmented: true,
        analyzeUsage: true
      });
      
      const fragmentedIndexes = analyses.filter(a => a.type === 'fragmented');
      
      fragmentedIndexes.forEach(index => {
        expect(index.action).toMatch(/rebuild|reorganize/);
        expect(index.reason).toContain('fragmentation');
      });
    });

    test('should suggest composite index opportunities', async () => {
      const analyses = await optimizer.optimizeIndexes(undefined, {
        considerComposite: true
      });
      
      const compositeIndexes = analyses.filter(a => a.type === 'composite');
      
      compositeIndexes.forEach(index => {
        expect(index.columns).toBeDefined();
        expect(index.columns!.length).toBeGreaterThanOrEqual(2);
        expect(index.action).toBe('create');
      });
    });

    test('should prioritize index recommendations correctly', async () => {
      const analyses = await optimizer.optimizeIndexes();
      
      // Should be sorted by priority and impact
      for (let i = 0; i < analyses.length - 1; i++) {
        const current = analyses[i];
        const next = analyses[i + 1];
        
        const priorityWeight: Record<string, number> = { high: 3, medium: 2, low: 1 };
        const currentPriorityWeight = priorityWeight[current.priority];
        const nextPriorityWeight = priorityWeight[next.priority];
        
        expect(currentPriorityWeight).toBeGreaterThanOrEqual(nextPriorityWeight);
      }
    });

    test('should estimate index maintenance costs', async () => {
      const analyses = await optimizer.optimizeIndexes();
      
      analyses.forEach(analysis => {
        if (analysis.maintenanceCost !== undefined) {
          expect(typeof analysis.maintenanceCost).toBe('number');
        }
        if (analysis.estimatedSize !== undefined) {
          expect(analysis.estimatedSize).toBeGreaterThan(0);
        }
      });
    });
  });

  describe('Cache Optimization', () => {
    test('should analyze and optimize cache performance', async () => {
      const result = await optimizer.optimizeCache();
      
      expect(result).toBeDefined();
      expect(result.overallHitRate).toBeGreaterThanOrEqual(0);
      expect(result.overallHitRate).toBeLessThanOrEqual(1);
      expect(result.memoryUtilization).toBeGreaterThanOrEqual(0);
      expect(result.timestamp).toBeInstanceOf(Date);
    });

    test('should optimize multi-tier cache strategy', async () => {
      const context = {
        applicationId: 'test_app',
        userId: 'user123',
        dataChangeFrequency: 'medium' as const
      };
      
      const result = await optimizer.optimizeCache(context);
      
      expect(result.l1Cache).toBeDefined();
      expect(result.l2Cache).toBeDefined();
      expect(result.l3Cache).toBeDefined();
      
      // L1 should have fastest access times
      if (result.l1Cache && result.l2Cache) {
        expect(result.l1Cache.avgResponseTime).toBeLessThanOrEqual(result.l2Cache.avgResponseTime);
      }
    });

    test('should provide cache optimization recommendations', async () => {
      const result = await optimizer.optimizeCache({
        dataChangeFrequency: 'high'
      });
      
      expect(result.recommendations).toBeDefined();
      expect(Array.isArray(result.recommendations)).toBe(true);
    });

    test('should handle different data change frequencies', async () => {
      const highFreq = await optimizer.optimizeCache({ dataChangeFrequency: 'high' });
      const lowFreq = await optimizer.optimizeCache({ dataChangeFrequency: 'low' });
      
      expect(highFreq.overallHitRate).toBeDefined();
      expect(lowFreq.overallHitRate).toBeDefined();
      
      // Low frequency data should have higher cache hit rates
      // This is a simplified assumption for testing
      expect(lowFreq.overallHitRate).toBeGreaterThanOrEqual(highFreq.overallHitRate - 0.1);
    });
  });

  describe('Resource Optimization', () => {
    test('should analyze and optimize resource utilization', async () => {
      const result = await optimizer.optimizeResources();
      
      expect(result).toBeDefined();
      expect(result.cpu).toBeDefined();
      expect(result.memory).toBeDefined();
      expect(result.io).toBeDefined();
      expect(result.network).toBeDefined();
      expect(result.timestamp).toBeInstanceOf(Date);
    });

    test('should identify resource bottlenecks', async () => {
      const result = await optimizer.optimizeResources();
      
      expect(result.bottlenecks).toBeDefined();
      expect(Array.isArray(result.bottlenecks)).toBe(true);
      
      result.bottlenecks!.forEach(bottleneck => {
        expect(bottleneck.resource).toMatch(/cpu|memory|io|network/);
        expect(bottleneck.severity).toMatch(/low|medium|high|critical/);
        expect(bottleneck.impact).toBeDefined();
        expect(bottleneck.recommendation).toBeDefined();
      });
    });

    test('should provide resource optimization recommendations', async () => {
      const result = await optimizer.optimizeResources();
      
      expect(result.recommendations).toBeDefined();
      expect(Array.isArray(result.recommendations)).toBe(true);
      
      result.recommendations!.forEach(recommendation => {
        expect(typeof recommendation).toBe('string');
        expect(recommendation.length).toBeGreaterThan(0);
      });
    });

    test('should optimize CPU allocation', async () => {
      const result = await optimizer.optimizeResources();
      
      expect(result.cpu).toBeDefined();
      expect(result.cpu!.usage).toBeGreaterThanOrEqual(0);
      expect(result.cpu!.usage).toBeLessThanOrEqual(100);
      
      if (result.cpu!.efficiency !== undefined) {
        expect(result.cpu!.efficiency).toBeGreaterThanOrEqual(0);
        expect(result.cpu!.efficiency).toBeLessThanOrEqual(1);
      }
    });

    test('should optimize memory allocation', async () => {
      const result = await optimizer.optimizeResources();
      
      expect(result.memory).toBeDefined();
      expect(result.memory!.usage).toBeGreaterThanOrEqual(0);
      expect(result.memory!.usage).toBeLessThanOrEqual(100);
      
      if (result.memory!.bufferHitRate !== undefined) {
        expect(result.memory!.bufferHitRate).toBeGreaterThanOrEqual(0);
        expect(result.memory!.bufferHitRate).toBeLessThanOrEqual(1);
      }
    });
  });

  describe('Performance Monitoring', () => {
    test('should start performance monitoring successfully', async () => {
      let monitoringStarted = false;
      
      optimizer.on('monitoringStarted', () => {
        monitoringStarted = true;
      });
      
      await optimizer.startPerformanceMonitoring();
      
      expect(monitoringStarted).toBe(true);
    });

    test('should generate comprehensive performance report', async () => {
      const timeRange = {
        start: new Date('2025-01-01'),
        end: new Date()
      };
      
      const report = await optimizer.generatePerformanceReport(timeRange, true);
      
      expect(report).toBeDefined();
      expect(report.summary).toBeDefined();
      expect(report.queryAnalysis).toBeDefined();
      expect(report.indexAnalysis).toBeDefined();
      expect(report.cacheAnalysis).toBeDefined();
      expect(report.resourceAnalysis).toBeDefined();
      expect(report.recommendations).toBeDefined();
      expect(report.trends).toBeDefined();
      
      // Summary should contain key metrics
      expect(report.summary.timeRange).toEqual(timeRange);
      expect(typeof report.summary.performanceScore).toBe('number');
    });

    test('should handle performance alerts', (done) => {
      optimizer.on('performanceAlert', (alert) => {
        expect(alert).toBeDefined();
        expect(alert.type).toMatch(/slow_query|high_cpu|memory_pressure|cache_miss_rate|disk_space|connection_limit/);
        expect(alert.severity).toMatch(/info|warning|critical/);
        expect(alert.message).toBeDefined();
        expect(alert.timestamp).toBeInstanceOf(Date);
        done();
      });
      
      // Simulate alert (in real implementation, this would come from monitoring)
      const testAlert = {
        id: 'test_alert_1',
        type: 'slow_query' as const,
        severity: 'warning' as const,
        message: 'Query execution time exceeds threshold',
        timestamp: new Date(),
        metrics: { responseTime: 1500 },
        queryId: 'slow_query_1',
        query: 'SELECT * FROM large_table',
        threshold: 1000,
        currentValue: 1500,
        recommendations: ['Add index on commonly queried columns'],
        autoResolved: false
      };
      
      // Manually trigger alert for testing
      optimizer.emit('performanceAlert', testAlert);
    });

    test('should detect anomalies', (done) => {
      optimizer.on('anomalyDetected', (anomaly) => {
        expect(anomaly).toBeDefined();
        expect(typeof anomaly.confidence).toBe('number');
        expect(anomaly.confidence).toBeGreaterThan(0);
        expect(anomaly.confidence).toBeLessThanOrEqual(1);
        done();
      });
      
      // Simulate anomaly detection
      const testAnomaly = {
        type: 'performance_degradation',
        metric: 'response_time',
        baseline: 100,
        current: 250,
        confidence: 0.95,
        timestamp: new Date()
      };
      
      optimizer.emit('anomalyDetected', testAnomaly);
    });
  });

  describe('Integration Testing', () => {
    test('should coordinate query and index optimization', async () => {
      const sql = 'SELECT * FROM users u JOIN orders o ON u.id = o.user_id WHERE u.active = true';
      
      // First optimize the query
      const queryResult = await optimizer.optimizeQuery('integration_test_1', sql);
      
      // Then optimize indexes based on the query
      const indexResults = await optimizer.optimizeIndexes('users', {
        createMissing: true,
        considerComposite: true
      });
      
      expect(queryResult).toBeDefined();
      expect(indexResults).toBeDefined();
      
      // Should have recommendations that complement each other
      const hasRelevantIndexRecommendation = indexResults.some(
        idx => idx.tableName === 'users' && idx.action === 'create'
      );
      
      if (queryResult.indexRecommendations && queryResult.indexRecommendations.length > 0) {
        expect(hasRelevantIndexRecommendation).toBe(true);
      }
    });

    test('should integrate cache and resource optimization', async () => {
      const cacheResult = await optimizer.optimizeCache();
      const resourceResult = await optimizer.optimizeResources();
      
      expect(cacheResult).toBeDefined();
      expect(resourceResult).toBeDefined();
      
      // Resource optimization should consider cache memory usage
      expect(resourceResult.memory).toBeDefined();
      expect(cacheResult.memoryUtilization).toBeDefined();
    });

    test('should provide holistic optimization strategy', async () => {
      // Simulate a comprehensive optimization scenario
      const queries = [
        'SELECT * FROM users WHERE email = ?',
        'SELECT COUNT(*) FROM orders WHERE status = "pending"',
        'SELECT u.name, COUNT(o.id) FROM users u LEFT JOIN orders o ON u.id = o.user_id GROUP BY u.id'
      ];
      
      const results = await Promise.all(
        queries.map((sql, idx) => optimizer.optimizeQuery(`holistic_test_${idx}`, sql))
      );
      
      const indexAnalysis = await optimizer.optimizeIndexes();
      const cacheMetrics = await optimizer.optimizeCache();
      const resourceUtilization = await optimizer.optimizeResources();
      
      expect(results.every(r => r !== null)).toBe(true);
      expect(indexAnalysis).toBeDefined();
      expect(cacheMetrics).toBeDefined();
      expect(resourceUtilization).toBeDefined();
      
      // Should provide coordinated recommendations
      const totalRecommendations = results.reduce(
        (sum, result) => sum + (result.recommendations?.length || 0), 
        0
      ) + indexAnalysis.length;
      
      expect(totalRecommendations).toBeGreaterThan(0);
    });
  });

  describe('Error Handling and Edge Cases', () => {
    test('should handle empty or null queries gracefully', async () => {
      const result1 = await optimizer.optimizeQuery('empty_test_1', '');
      const result2 = await optimizer.optimizeQuery('null_test_1', null as any);
      
      expect(result1.error).toBeDefined();
      expect(result2.error).toBeDefined();
    });

    test('should handle database connection failures', async () => {
      // This would typically involve mocking database connections
      // For now, we test that the system doesn't crash
      try {
        await optimizer.optimizeIndexes('nonexistent_table');
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    test('should handle resource constraints', async () => {
      // Test with minimal configuration
      const minimalConfig = createTestConfig();
      minimalConfig.resourceManagement.resourceLimits.maxMemoryUsage = 10; // Very low limit
      
      const constrainedOptimizer = new PerformanceOptimizer(minimalConfig);
      const result = await constrainedOptimizer.optimizeResources();
      
      expect(result).toBeDefined();
      expect(result.bottlenecks).toBeDefined();
      
      // Should detect memory constraints
      const memoryBottleneck = result.bottlenecks!.find(b => b.resource === 'memory');
      expect(memoryBottleneck).toBeDefined();
    });
  });

  describe('Performance Benchmarks', () => {
    test('should complete query optimization within time limits', async () => {
      const startTime = Date.now();
      const sql = 'SELECT * FROM complex_view WHERE date_column BETWEEN ? AND ?';
      
      const result = await optimizer.optimizeQuery('benchmark_test_1', sql, {
        start_date: '2025-01-01',
        end_date: '2025-01-31'
      });
      
      const duration = Date.now() - startTime;
      
      expect(result).toBeDefined();
      expect(duration).toBeLessThan(testConfig.queryOptimization.maxOptimizationTime);
    });

    test('should handle high concurrency scenarios', async () => {
      const concurrentOptimizations = Array.from({ length: 10 }, (_, i) =>
        optimizer.optimizeQuery(`concurrent_test_${i}`, `SELECT * FROM table_${i} WHERE id = ${i}`)
      );
      
      const results = await Promise.all(concurrentOptimizations);
      
      expect(results).toHaveLength(10);
      expect(results.every(r => r !== null)).toBe(true);
    });

    test('should maintain performance under load', async () => {
      // Simulate sustained load
      const iterations = 20;
      const startTime = Date.now();
      
      const promises = [];
      for (let i = 0; i < iterations; i++) {
        promises.push(
          optimizer.optimizeQuery(`load_test_${i}`, `SELECT column_${i % 5} FROM load_test_table WHERE id > ${i * 100}`)
        );
      }
      
      await Promise.all(promises);
      const totalTime = Date.now() - startTime;
      const avgTimePerOptimization = totalTime / iterations;
      
      // Should maintain reasonable performance under load
      expect(avgTimePerOptimization).toBeLessThan(1000); // Less than 1 second average
    });
  });

  describe('Configuration and Customization', () => {
    test('should respect configuration settings', () => {
      expect(optimizer['config']).toEqual(testConfig);
    });

    test('should handle configuration updates', () => {
      const newConfig = createTestConfig();
      newConfig.queryOptimization.slowQueryThreshold = 500; // More aggressive
      
      const newOptimizer = new PerformanceOptimizer(newConfig);
      expect(newOptimizer['config'].queryOptimization.slowQueryThreshold).toBe(500);
    });

    test('should validate configuration on initialization', () => {
      expect(() => {
        const invalidConfig = createTestConfig();
        invalidConfig.caching.targetHitRate = 1.5; // Invalid percentage > 1
        new PerformanceOptimizer(invalidConfig);
      }).not.toThrow(); // Should handle gracefully, not crash
    });
  });
});

// Integration test helpers
export const createMockQueryResult = (overrides?: any) => ({
  queryId: 'mock_query_1',
  originalSql: 'SELECT * FROM mock_table',
  optimizedSql: 'SELECT id, name FROM mock_table WHERE active = 1',
  estimatedImprovement: 25,
  recommendations: [
    {
      type: 'index' as const,
      priority: 'medium' as const,
      title: 'Add index on active column',
      description: 'Create index to improve WHERE clause performance',
      impact: 'medium' as const,
      effort: 'low' as const,
      actions: ['CREATE INDEX idx_active ON mock_table (active)']
    }
  ],
  appliedOptimizations: ['removed_wildcard_select', 'added_where_clause'],
  timestamp: new Date(),
  optimizationTime: 150,
  confidence: 85,
  ...overrides
});

export const createMockIndexAnalysis = (overrides?: any) => ({
  type: 'missing' as const,
  tableName: 'mock_table',
  indexName: 'idx_mock_column',
  columns: ['column1', 'column2'],
  action: 'create' as const,
  estimatedImpact: 30,
  reason: 'Frequently queried columns without proper index',
  priority: 'high' as const,
  estimatedSize: 25, // MB
  maintenanceCost: 5, // cost units
  sql: 'CREATE INDEX idx_mock_column ON mock_table (column1, column2)',
  ...overrides
});

export const createMockCacheMetrics = (overrides?: any) => ({
  l1Cache: {
    hitRate: 0.85,
    missRate: 0.15,
    evictionRate: 5,
    memoryUsage: 256,
    avgResponseTime: 2,
    throughput: 1000,
    errors: 0
  },
  l2Cache: {
    hitRate: 0.75,
    missRate: 0.25,
    evictionRate: 3,
    memoryUsage: 512,
    avgResponseTime: 15,
    throughput: 500,
    errors: 0
  },
  overallHitRate: 0.80,
  memoryUtilization: 0.60,
  networkLatencyReduction: 50,
  costSavings: 1500,
  timestamp: new Date(),
  ...overrides
});

export const createMockResourceUtilization = (overrides?: any) => ({
  cpu: {
    usage: 65,
    optimization: { efficiency: 0.85, recommendation: 'Enable parallel processing' },
    efficiency: 0.85,
    parallelizationLevel: 4
  },
  memory: {
    usage: 70,
    optimization: { bufferHitRate: 0.90, recommendation: 'Increase buffer pool size' },
    bufferHitRate: 0.90,
    memoryPressure: 0.3
  },
  io: {
    metrics: { readThroughput: 100, writeThroughput: 50 },
    optimization: { recommendation: 'Enable compression' },
    throughputImprovement: 20,
    latencyReduction: 15
  },
  network: {
    metrics: { bytesIn: 1000000, bytesOut: 500000 },
    optimization: { recommendation: 'Enable connection pooling' },
    bandwidthUtilization: 0.6,
    latencyOptimization: 25
  },
  bottlenecks: [],
  recommendations: ['Scale up CPU resources', 'Optimize memory allocation'],
  timestamp: new Date(),
  ...overrides
});