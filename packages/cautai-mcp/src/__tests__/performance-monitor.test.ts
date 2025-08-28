import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { PerformanceMonitor } from '../performance/monitor';
import type { PerformanceMetrics } from '../types';

describe('PerformanceMonitor', () => {
  let monitor: PerformanceMonitor;

  const createTestConfig = () => ({
    retention: {
      metrics: 60000,
      operations: 30000,
      alerts: 120000
    },
    sampling: {
      metricsInterval: 100,
      cleanupInterval: 1000
    },
    alerting: {
      enabled: true,
      channels: ['console'] as Array<'console' | 'webhook' | 'email'>,
      thresholds: {
        queryTime: 5000,
        searchTime: 3000,
        totalTime: 10000,
        memoryUsage: 512,
        cacheHitRate: 0.7,
        errorRate: 0.05
      },
      cooldownMs: 300000
    }
  });

  beforeEach(() => {
    vi.clearAllMocks();
    monitor = new PerformanceMonitor(createTestConfig());
  });

  afterEach(() => {
    monitor.destroy();
  });

  describe('Operation Tracking', () => {
    it('should start and track operations', () => {
      const operationId = monitor.startOperation('search', { query: 'test' });
      expect(operationId).toMatch(/^search_\d+_\d+$/);
    });

    it('should end operations and generate metrics', async () => {
      const operationId = monitor.startOperation('search');
      await new Promise(resolve => setTimeout(resolve, 10));
      
      const metrics = monitor.endOperation(operationId, true);
      
      expect(metrics).toBeDefined();
      expect(metrics!.queryTime).toBeGreaterThan(0);
      expect(metrics!.totalTime).toBeGreaterThan(0);
      expect(metrics!.timestamp).toBeGreaterThan(0);
    });

    it('should handle operation failures', () => {
      const operationId = monitor.startOperation('search');
      const error = new Error('Search failed');
      
      const metrics = monitor.endOperation(operationId, false, error);
      
      expect(metrics).toBeDefined();
      expect(metrics!.queryTime).toBeGreaterThan(0);
    });

    it('should return null for invalid operation IDs', () => {
      const metrics = monitor.endOperation('invalid-id', true);
      expect(metrics).toBeNull();
    });
  });

  describe('Metrics Collection', () => {
    it('should add metrics manually', () => {
      const testMetrics: PerformanceMetrics = {
        queryTime: 100,
        searchTime: 80,
        processingTime: 20,
        totalTime: 120,
        cacheHit: true,
        resultCount: 10,
        memoryUsage: 50,
        timestamp: Date.now()
      };
      
      monitor.addMetrics(testMetrics);
      
      const stats = monitor.getStats();
      expect(stats.count).toBe(1);
      expect(stats.averages.queryTime).toBe(100);
    });

    it('should emit metrics events', () => {
      return new Promise<void>((resolve) => {
        const testMetrics: PerformanceMetrics = {
          queryTime: 100,
          searchTime: 80,
          processingTime: 20,
          totalTime: 120,
          cacheHit: false,
          resultCount: 5,
          timestamp: Date.now()
        };
        
        monitor.on('metrics', (metrics) => {
          expect(metrics).toEqual(testMetrics);
          resolve();
        });
        
        monitor.addMetrics(testMetrics);
      });
    });
  });

  describe('Performance Statistics', () => {
    beforeEach(() => {
      const baseTime = Date.now();
      const sampleMetrics: PerformanceMetrics[] = [
        { queryTime: 100, searchTime: 80, processingTime: 20, totalTime: 120, cacheHit: true, resultCount: 10, timestamp: baseTime },
        { queryTime: 200, searchTime: 160, processingTime: 40, totalTime: 240, cacheHit: false, resultCount: 15, timestamp: baseTime + 1000 },
        { queryTime: 150, searchTime: 120, processingTime: 30, totalTime: 180, cacheHit: true, resultCount: 12, timestamp: baseTime + 2000 }
      ];
      
      sampleMetrics.forEach(metrics => monitor.addMetrics(metrics));
    });

    it('should calculate correct averages', () => {
      const stats = monitor.getStats();
      
      expect(stats.count).toBe(3);
      expect(stats.averages.queryTime).toBe(150); // (100+200+150)/3
      expect(stats.cacheHitRate).toBeCloseTo(0.67, 1); // 2/3 cache hits
    });

    it('should calculate percentiles correctly', () => {
      const stats = monitor.getStats();
      
      expect(stats.percentiles.p50).toBe(180); // Median of [120, 180, 240]
      expect(stats.percentiles.p90).toBeGreaterThan(stats.percentiles.p50);
    });

    it('should handle empty metrics gracefully', () => {
      const emptyMonitor = new PerformanceMonitor(createTestConfig());
      const stats = emptyMonitor.getStats();
      
      expect(stats.count).toBe(0);
      expect(stats.averages.queryTime).toBe(0);
      expect(stats.cacheHitRate).toBe(0);
      
      emptyMonitor.destroy();
    });
  });

  describe('System Metrics', () => {
    it('should collect current system metrics', () => {
      const systemMetrics = monitor.getCurrentSystemMetrics();
      
      expect(systemMetrics).toBeDefined();
      expect(systemMetrics.timestamp).toBeGreaterThan(0);
      expect(systemMetrics.memory.heapUsed).toBeGreaterThan(0);
      expect(systemMetrics.memory.heapTotal).toBeGreaterThan(0);
    });
  });

  describe('Health Score', () => {
    it('should return high score for good performance', () => {
      // Add metrics that meet all thresholds
      const goodMetrics: PerformanceMetrics = {
        queryTime: 100,    // Below threshold
        searchTime: 80,    // Below threshold
        processingTime: 20,
        totalTime: 120,    // Below threshold
        cacheHit: true,    // Good cache hit
        resultCount: 10,
        memoryUsage: 32,   // Below threshold
        timestamp: Date.now()
      };
      
      monitor.addMetrics(goodMetrics);
      
      const healthScore = monitor.getHealthScore();
      expect(healthScore).toBeGreaterThan(80);
    });

    it('should penalize poor performance', () => {
      const badMetrics: PerformanceMetrics = {
        queryTime: 6000, // Exceeds threshold
        searchTime: 4000,
        processingTime: 1000,
        totalTime: 12000,
        cacheHit: false,
        resultCount: 1,
        timestamp: Date.now()
      };
      
      monitor.addMetrics(badMetrics);
      
      const healthScore = monitor.getHealthScore();
      expect(healthScore).toBeLessThan(100);
    });
  });

  describe('Data Export', () => {
    beforeEach(() => {
      const metrics: PerformanceMetrics = {
        queryTime: 150,
        searchTime: 120,
        processingTime: 30,
        totalTime: 180,
        cacheHit: true,
        resultCount: 10,
        memoryUsage: 64,
        timestamp: Date.now()
      };
      monitor.addMetrics(metrics);
    });

    it('should export metrics in JSON format', () => {
      const exported = monitor.exportMetrics('json');
      const data = JSON.parse(exported);
      
      expect(data.timestamp).toBeDefined();
      expect(data.performance).toBeDefined();
      expect(data.system).toBeDefined();
      expect(data.health_score).toBeDefined();
    });

    it('should export metrics in Prometheus format', () => {
      const exported = monitor.exportMetrics('prometheus');
      
      expect(exported).toContain('# HELP');
      expect(exported).toContain('cautai_request_duration_seconds');
      expect(exported).toContain('cautai_cache_hit_rate');
    });

    it('should export metrics in CSV format', () => {
      const exported = monitor.exportMetrics('csv');
      const lines = exported.split('\n');
      
      expect(lines[0]).toContain('timestamp,query_time');
      expect(lines.length).toBeGreaterThan(1);
    });
  });

  describe('Edge Cases', () => {
    it('should handle concurrent operations', async () => {
      const operations = [];
      
      for (let i = 0; i < 5; i++) {
        operations.push(monitor.startOperation(`test-${i}`));
      }
      
      await new Promise(resolve => setTimeout(resolve, 10));
      
      const results = operations.map(id => monitor.endOperation(id, true));
      
      expect(results.every(r => r !== null)).toBe(true);
      expect(results.length).toBe(5);
    });

    it('should handle invalid values gracefully', () => {
      const weirdMetrics: PerformanceMetrics = {
        queryTime: 0,
        searchTime: -1,
        processingTime: 0,
        totalTime: 0,
        cacheHit: false,
        resultCount: 0,
        timestamp: Date.now()
      };
      
      expect(() => monitor.addMetrics(weirdMetrics)).not.toThrow();
      
      const stats = monitor.getStats();
      expect(stats.count).toBe(1);
    });
  });

  describe('Resource Management', () => {
    it('should clean up resources on destroy', () => {
      monitor.addMetrics({
        queryTime: 100,
        searchTime: 80,
        processingTime: 20,
        totalTime: 120,
        cacheHit: true,
        resultCount: 10,
        timestamp: Date.now()
      });
      
      monitor.destroy();
      
      const stats = monitor.getStats();
      expect(stats.count).toBe(0);
    });
  });
});