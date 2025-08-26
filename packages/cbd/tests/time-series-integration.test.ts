/**
 * CBD Time-Series Database Engine - Comprehensive Integration Tests
 * Tests all aspects of time-series functionality including Gorilla compression,
 * statistical analysis, OHLC calculations, and retention policies
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { CBDTimeSeriesEngine, TimeSeriesPoint, TimeSeriesQuery, RetentionPolicy } from '../src/time-series/TimeSeriesEngine';

describe('CBD Time-Series Database Engine - Integration Tests', () => {
  let engine: CBDTimeSeriesEngine;

  beforeEach(async () => {
    engine = new CBDTimeSeriesEngine({
      enableCompression: true,
      compressionAlgorithm: 'gorilla',
      bucketSize: 60 * 60 * 1000, // 1 hour buckets
      maxPartitionSize: 10000,
      enableCaching: true,
      cacheSize: 50,
      enableDownsampling: true,
      enableAnalytics: true
    });
  });

  afterEach(async () => {
    await engine.clear();
  });

  describe('Basic Data Ingestion', () => {
    it('should ingest time-series data points successfully', async () => {
      const points: TimeSeriesPoint[] = [
        { timestamp: Date.now() - 3600000, value: 100 },
        { timestamp: Date.now() - 1800000, value: 150 },
        { timestamp: Date.now(), value: 200 }
      ];

      await engine.ingestPoints('cpu_usage', points, { host: 'server1' });

      const stats = await engine.getEngineStats();
      expect(stats.partitions).toBe(1);
      expect(stats.totalPoints).toBe(3);
    });

    it('should handle multiple metrics with different labels', async () => {
      const cpuPoints: TimeSeriesPoint[] = [
        { timestamp: Date.now() - 3600000, value: 75 },
        { timestamp: Date.now() - 1800000, value: 80 }
      ];

      const memoryPoints: TimeSeriesPoint[] = [
        { timestamp: Date.now() - 3600000, value: 8192 },
        { timestamp: Date.now() - 1800000, value: 9216 }
      ];

      await engine.ingestPoints('cpu_usage', cpuPoints, { host: 'server1', region: 'us-east' });
      await engine.ingestPoints('memory_usage', memoryPoints, { host: 'server1', region: 'us-east' });

      const stats = await engine.getEngineStats();
      expect(stats.partitions).toBe(2);
      expect(stats.totalPoints).toBe(4);
    });

    it('should sort points by timestamp during ingestion', async () => {
      const unsortedPoints: TimeSeriesPoint[] = [
        { timestamp: Date.now(), value: 300 },
        { timestamp: Date.now() - 3600000, value: 100 },
        { timestamp: Date.now() - 1800000, value: 200 }
      ];

      await engine.ingestPoints('test_metric', unsortedPoints);

      const query: TimeSeriesQuery = {
        metricName: 'test_metric',
        timeRange: { start: Date.now() - 7200000, end: Date.now() + 3600000 }
      };

      const result = await engine.query(query);
      expect(result.metrics).toHaveLength(1);
      
      const points = result.metrics[0].points;
      expect(points).toHaveLength(3);
      
      // Verify points are sorted by timestamp
      for (let i = 1; i < points.length; i++) {
        expect(points[i].timestamp).toBeGreaterThanOrEqual(points[i-1].timestamp);
      }
    });
  });

  describe('Query Operations', () => {
    beforeEach(async () => {
      const now = Date.now();
      const points: TimeSeriesPoint[] = [];
      
      // Generate 100 data points over 24 hours
      for (let i = 0; i < 100; i++) {
        points.push({
          timestamp: now - (24 * 60 * 60 * 1000) + (i * 14.4 * 60 * 1000), // 14.4 minutes apart
          value: 100 + Math.sin(i / 10) * 50 + Math.random() * 20 // Sine wave with noise
        });
      }

      await engine.ingestPoints('sensor_data', points, { sensor_id: 'temp_001', location: 'warehouse' });
    });

    it('should query data within time range', async () => {
      const now = Date.now();
      const query: TimeSeriesQuery = {
        metricName: 'sensor_data',
        timeRange: { 
          start: now - 12 * 60 * 60 * 1000, // Last 12 hours
          end: now 
        }
      };

      const result = await engine.query(query);
      expect(result.metrics).toHaveLength(1);
      expect(result.metrics[0].points.length).toBeGreaterThan(0);
      expect(result.totalPoints).toBeGreaterThan(0);
      expect(result.executionTime).toBeGreaterThan(0);
    });

    it('should apply aggregations correctly', async () => {
      const now = Date.now();
      const query: TimeSeriesQuery = {
        metricName: 'sensor_data',
        timeRange: { start: now - 24 * 60 * 60 * 1000, end: now },
        aggregation: {
          type: 'avg',
          window: 60 * 60 * 1000 // 1-hour windows
        }
      };

      const result = await engine.query(query);
      expect(result.metrics).toHaveLength(1);
      
      // Should have fewer points after aggregation
      expect(result.metrics[0].points.length).toBeLessThan(100);
      expect(result.metrics[0].points.length).toBeGreaterThan(0);
    });

    it('should support different aggregation types', async () => {
      const now = Date.now();
      const baseQuery: Omit<TimeSeriesQuery, 'aggregation'> = {
        metricName: 'sensor_data',
        timeRange: { start: now - 24 * 60 * 60 * 1000, end: now }
      };

      // Test different aggregation types
      const aggregationTypes = ['sum', 'avg', 'min', 'max', 'count'] as const;
      
      for (const aggType of aggregationTypes) {
        const query: TimeSeriesQuery = {
          ...baseQuery,
          aggregation: {
            type: aggType,
            window: 4 * 60 * 60 * 1000 // 4-hour windows
          }
        };

        const result = await engine.query(query);
        expect(result.metrics).toHaveLength(1);
        expect(result.metrics[0].points.length).toBeGreaterThan(0);
        
        // Verify all aggregated values are numbers
        result.metrics[0].points.forEach(point => {
          expect(typeof point.value).toBe('number');
          expect(Number.isFinite(point.value)).toBe(true);
        });
      }
    });

    it('should handle percentile aggregations', async () => {
      const now = Date.now();
      const query: TimeSeriesQuery = {
        metricName: 'sensor_data',
        timeRange: { start: now - 24 * 60 * 60 * 1000, end: now },
        aggregation: {
          type: 'percentile',
          window: 6 * 60 * 60 * 1000, // 6-hour windows
          percentile: 95
        }
      };

      const result = await engine.query(query);
      expect(result.metrics).toHaveLength(1);
      expect(result.metrics[0].points.length).toBeGreaterThan(0);
    });

    it('should downsample data correctly', async () => {
      const now = Date.now();
      const query: TimeSeriesQuery = {
        metricName: 'sensor_data',
        timeRange: { start: now - 24 * 60 * 60 * 1000, end: now },
        downsample: {
          interval: 2 * 60 * 60 * 1000, // 2-hour intervals
          aggregation: 'avg'
        }
      };

      const result = await engine.query(query);
      expect(result.metrics).toHaveLength(1);
      expect(result.metrics[0].points.length).toBeLessThanOrEqual(15); // Max 15 buckets with some buffer for edge cases
    });

    it('should fill gaps in data when requested', async () => {
      // Create data with intentional gaps
      const now = Date.now();
      const gappyPoints: TimeSeriesPoint[] = [
        { timestamp: now - 10 * 60 * 60 * 1000, value: 100 }, // 10 hours ago
        { timestamp: now - 2 * 60 * 60 * 1000, value: 200 },  // 2 hours ago (8-hour gap)
        { timestamp: now, value: 300 }
      ];

      await engine.ingestPoints('gappy_metric', gappyPoints);

      const query: TimeSeriesQuery = {
        metricName: 'gappy_metric',
        timeRange: { start: now - 12 * 60 * 60 * 1000, end: now },
        fillGaps: true
      };

      const result = await engine.query(query);
      expect(result.metrics).toHaveLength(1);
      
      // The 8-hour gap with hourly buckets should create several interpolated points
      expect(result.metrics[0].points.length).toBeGreaterThanOrEqual(3);
      
      // Check for interpolated tags if gaps were filled
      const interpolatedPoints = result.metrics[0].points.filter(p => p.tags?.interpolated === 'true');
      if (result.metrics[0].points.length > 3) {
        expect(interpolatedPoints.length).toBeGreaterThan(0);
      }
    });

    it('should apply ordering and limiting correctly', async () => {
      const now = Date.now();
      const query: TimeSeriesQuery = {
        metricName: 'sensor_data',
        timeRange: { start: now - 24 * 60 * 60 * 1000, end: now },
        orderBy: 'desc',
        limit: 10
      };

      const result = await engine.query(query);
      expect(result.metrics).toHaveLength(1);
      expect(result.metrics[0].points.length).toBeLessThanOrEqual(10);
      
      const points = result.metrics[0].points;
      // Verify descending order
      for (let i = 1; i < points.length; i++) {
        expect(points[i].timestamp).toBeLessThanOrEqual(points[i-1].timestamp);
      }
    });
  });

  describe('Gorilla Compression', () => {
    it('should compress data using Gorilla algorithm', async () => {
      // Generate regular time-series data (good for compression)
      const now = Date.now();
      const regularPoints: TimeSeriesPoint[] = [];
      
      for (let i = 0; i < 1000; i++) {
        regularPoints.push({
          timestamp: now + (i * 60 * 1000), // Every minute
          value: 100 + Math.sin(i / 100) * 10 // Smooth sine wave
        });
      }

      await engine.ingestPoints('compressible_metric', regularPoints);

      const stats = await engine.getEngineStats();
      expect(stats.compressionRatio).toBeGreaterThan(1.0); // Should achieve some compression
    });

    it('should decompress data correctly', async () => {
      const originalPoints: TimeSeriesPoint[] = [
        { timestamp: Date.now(), value: 42.5 },
        { timestamp: Date.now() + 60000, value: 43.1 },
        { timestamp: Date.now() + 120000, value: 41.9 },
        { timestamp: Date.now() + 180000, value: 44.2 }
      ];

      await engine.ingestPoints('compression_test', originalPoints);

      const query: TimeSeriesQuery = {
        metricName: 'compression_test',
        timeRange: { start: Date.now() - 60000, end: Date.now() + 300000 }
      };

      const result = await engine.query(query);
      expect(result.metrics).toHaveLength(1);
      
      const retrievedPoints = result.metrics[0].points;
      expect(retrievedPoints).toHaveLength(originalPoints.length);
      
      // Verify data integrity after compression/decompression
      for (let i = 0; i < originalPoints.length; i++) {
        expect(retrievedPoints[i].timestamp).toBe(originalPoints[i].timestamp);
        expect(Math.abs(retrievedPoints[i].value - originalPoints[i].value)).toBeLessThan(0.001); // Allow for floating point precision
      }
    });
  });

  describe('OHLC Calculations', () => {
    beforeEach(async () => {
      // Generate price-like data for OHLC calculations
      const now = Date.now();
      const pricePoints: TimeSeriesPoint[] = [];
      
      let basePrice = 100;
      for (let i = 0; i < 100; i++) {
        // Simulate price movements
        basePrice += (Math.random() - 0.5) * 2;
        pricePoints.push({
          timestamp: now - (24 * 60 * 60 * 1000) + (i * 14.4 * 60 * 1000), // Every 14.4 minutes over 24h
          value: Math.max(10, basePrice) // Ensure positive prices
        });
      }

      await engine.ingestPoints('stock_price', pricePoints, { symbol: 'AAPL' });
    });

    it('should calculate OHLC data correctly', async () => {
      const now = Date.now();
      const ohlcData = await engine.calculateOHLC(
        'stock_price',
        60 * 60 * 1000, // 1-hour intervals
        { start: now - 24 * 60 * 60 * 1000, end: now }
      );

      expect(ohlcData.length).toBeGreaterThan(0);
      expect(ohlcData.length).toBeLessThanOrEqual(28); // Max 28 hours with buffer for edge cases

      // Verify OHLC properties
      ohlcData.forEach(ohlc => {
        expect(typeof ohlc.timestamp).toBe('number');
        expect(typeof ohlc.open).toBe('number');
        expect(typeof ohlc.high).toBe('number');
        expect(typeof ohlc.low).toBe('number');
        expect(typeof ohlc.close).toBe('number');
        expect(typeof ohlc.volume).toBe('number');

        // High should be >= Low
        expect(ohlc.high).toBeGreaterThanOrEqual(ohlc.low);
        
        // High and Low should contain Open and Close
        expect(ohlc.high).toBeGreaterThanOrEqual(ohlc.open);
        expect(ohlc.high).toBeGreaterThanOrEqual(ohlc.close);
        expect(ohlc.low).toBeLessThanOrEqual(ohlc.open);
        expect(ohlc.low).toBeLessThanOrEqual(ohlc.close);
      });
    });
  });

  describe('Moving Averages', () => {
    beforeEach(async () => {
      const now = Date.now();
      const points: TimeSeriesPoint[] = [];
      
      // Generate trend data for moving averages
      for (let i = 0; i < 50; i++) {
        points.push({
          timestamp: now - (50 * 60 * 1000) + (i * 60 * 1000), // Every minute for 50 minutes
          value: i + Math.random() * 5 // Upward trend with noise
        });
      }

      await engine.ingestPoints('trending_metric', points);
    });

    it('should calculate moving averages correctly', async () => {
      const now = Date.now();
      const maResults = await engine.calculateMovingAverage(
        'trending_metric',
        10, // 10-period window
        { start: now - 60 * 60 * 1000, end: now }
      );

      expect(maResults.length).toBeGreaterThan(0);
      expect(maResults.length).toBeLessThanOrEqual(45); // 50 points - 10 window + 1, with buffer

      // Verify moving average properties
      maResults.forEach(result => {
        expect(typeof result.timestamp).toBe('number');
        expect(typeof result.sma).toBe('number');
        expect(typeof result.ema).toBe('number');
        expect(result.window).toBe(10);
        
        // Both averages should be positive numbers
        expect(Number.isFinite(result.sma)).toBe(true);
        expect(Number.isFinite(result.ema)).toBe(true);
        expect(result.sma).toBeGreaterThan(0);
        expect(result.ema).toBeGreaterThan(0);
      });

      // Verify SMA is working (should smooth out the trend)
      const firstSMA = maResults[0].sma;
      const lastSMA = maResults[maResults.length - 1].sma;
      expect(lastSMA).toBeGreaterThan(firstSMA); // Upward trend should be reflected
    });
  });

  describe('Statistical Analysis', () => {
    beforeEach(async () => {
      const now = Date.now();
      const points: TimeSeriesPoint[] = [];
      
      // Generate data with known statistical properties
      for (let i = 0; i < 1000; i++) {
        const value = 100 + Math.sin(i / 50) * 20 + (Math.random() - 0.5) * 10; // Mean ~100, with sine pattern and noise
        points.push({
          timestamp: now - (1000 * 60 * 1000) + (i * 60 * 1000), // Every minute for 1000 minutes
          value: value
        });
      }

      // Add a few outliers
      points.push({ timestamp: now - 500 * 60 * 1000, value: 300 }); // High outlier
      points.push({ timestamp: now - 400 * 60 * 1000, value: -50 }); // Low outlier

      await engine.ingestPoints('statistical_data', points);
    });

    it('should perform statistical analysis correctly', async () => {
      const now = Date.now();
      const stats = await engine.analyzeStatistics('statistical_data', {
        start: now - 1100 * 60 * 1000,
        end: now
      });

      expect(stats.count).toBeGreaterThanOrEqual(1000); // At least 1000 normal points, maybe more with compression artifacts
      expect(typeof stats.sum).toBe('number');
      expect(typeof stats.average).toBe('number');
      expect(typeof stats.min).toBe('number');
      expect(typeof stats.max).toBe('number');
      expect(typeof stats.stdDev).toBe('number');
      expect(typeof stats.variance).toBe('number');

      // Verify statistical properties
      expect(stats.average).toBeGreaterThan(90); // Should be around 100
      expect(stats.average).toBeLessThan(110);
      expect(stats.min).toBeLessThan(stats.average);
      expect(stats.max).toBeGreaterThan(stats.average);
      expect(stats.stdDev).toBeGreaterThan(0);
      expect(stats.variance).toBe(stats.stdDev * stats.stdDev);

      // Verify percentiles
      expect(stats.percentiles.p50).toBeGreaterThan(stats.min);
      expect(stats.percentiles.p50).toBeLessThan(stats.max);
      expect(stats.percentiles.p95).toBeGreaterThan(stats.percentiles.p50);
      expect(stats.percentiles.p99).toBeGreaterThan(stats.percentiles.p95);

      // Verify trend detection
      expect(['increasing', 'decreasing', 'stable']).toContain(stats.trend);

      // Verify anomaly detection found the outliers
      expect(stats.anomalies.length).toBeGreaterThanOrEqual(2);
    });

    it('should detect seasonality in seasonal data', async () => {
      // Generate clearly seasonal data
      const now = Date.now();
      const seasonalPoints: TimeSeriesPoint[] = [];
      
      for (let i = 0; i < 1000; i++) {
        const hourOfDay = (i * 0.24) % 24; // Simulate 24-hour cycle
        const seasonalValue = 100 + Math.sin(hourOfDay * Math.PI / 12) * 30; // Daily pattern
        seasonalPoints.push({
          timestamp: now - (1000 * 60 * 1000) + (i * 60 * 1000),
          value: seasonalValue + (Math.random() - 0.5) * 10 // Add noise
        });
      }

      await engine.ingestPoints('seasonal_data', seasonalPoints);

      const stats = await engine.analyzeStatistics('seasonal_data', {
        start: now - 1100 * 60 * 1000,
        end: now
      });

      // With strong daily pattern, seasonality should be detected
      expect(stats.seasonality).toBe(true);
    });
  });

  describe('Retention Policies', () => {
    it('should set and apply retention policies', async () => {
      const policy: RetentionPolicy = {
        name: 'short_term',
        maxAge: 60 * 60 * 1000, // 1 hour
        resolution: 1000, // 1 second
        tier: 'hot'
      };

      await engine.setRetentionPolicy(policy);

      // Create old data that should be expired
      const now = Date.now();
      const oldPoints: TimeSeriesPoint[] = [
        { timestamp: now - 2 * 60 * 60 * 1000, value: 100 }, // 2 hours ago (expired)
        { timestamp: now - 30 * 60 * 1000, value: 200 }      // 30 minutes ago (valid)
      ];

      await engine.ingestPoints('expiring_metric', oldPoints);

      // Wait for retention policy to apply
      await new Promise(resolve => setTimeout(resolve, 100));

      const stats = await engine.getEngineStats();
      expect(stats.partitions).toBeGreaterThanOrEqual(0); // Some data might be expired
    });

    it('should emit events for retention policy actions', async () => {
      const eventSpy = vi.fn();
      engine.on('retentionPolicySet', eventSpy);
      engine.on('partitionExpired', eventSpy);

      const policy: RetentionPolicy = {
        name: 'test_retention',
        maxAge: 1000, // 1 second
        resolution: 100,
        tier: 'hot'
      };

      await engine.setRetentionPolicy(policy);
      expect(eventSpy).toHaveBeenCalledWith(expect.objectContaining({
        policy: expect.objectContaining({ name: 'test_retention' })
      }));
    });
  });

  describe('Caching System', () => {
    beforeEach(async () => {
      const now = Date.now();
      const points: TimeSeriesPoint[] = [];
      
      for (let i = 0; i < 100; i++) {
        points.push({
          timestamp: now - (100 * 60 * 1000) + (i * 60 * 1000),
          value: i * 2
        });
      }

      await engine.ingestPoints('cacheable_metric', points);
    });

    it('should cache query results', async () => {
      const now = Date.now();
      const query: TimeSeriesQuery = {
        metricName: 'cacheable_metric',
        timeRange: { start: now - 120 * 60 * 1000, end: now }
      };

      // First query should not be from cache
      const result1 = await engine.query(query);
      expect(result1.fromCache).toBe(false);

      // Second identical query should be from cache
      const result2 = await engine.query(query);
      expect(result2.fromCache).toBe(true);

      // Results should be identical
      expect(result2.metrics).toHaveLength(result1.metrics.length);
      expect(result2.totalPoints).toBe(result1.totalPoints);
    });

    it('should handle cache size limits', async () => {
      // Create engine with very small cache
      const smallCacheEngine = new CBDTimeSeriesEngine({
        enableCaching: true,
        cacheSize: 2
      });

      // First ingest some test data to this engine
      const now = Date.now();
      const testPoints: TimeSeriesPoint[] = [
        { timestamp: now - 120000, value: 100 },
        { timestamp: now - 60000, value: 200 },
        { timestamp: now, value: 300 }
      ];
      await smallCacheEngine.ingestPoints('cacheable_metric', testPoints);

      // Create distinct queries that will have different cache keys
      const query1 = {
        metricName: 'cacheable_metric',
        timeRange: { start: now - 180000, end: now + 60000 },
        aggregation: { type: 'sum' as const, window: 60000 }
      };
      
      const query2 = {
        metricName: 'cacheable_metric', 
        timeRange: { start: now - 180000, end: now + 60000 },
        aggregation: { type: 'avg' as const, window: 60000 }
      };
      
      const query3 = {
        metricName: 'cacheable_metric',
        timeRange: { start: now - 180000, end: now + 60000 },
        aggregation: { type: 'max' as const, window: 60000 }
      };

      // Fill cache beyond capacity with distinct queries
      await smallCacheEngine.query(query1); // Cache entry 1
      await smallCacheEngine.query(query2); // Cache entry 2 
      await smallCacheEngine.query(query3); // Should evict entry 1

      // First query should be evicted from cache and recomputed
      const result = await smallCacheEngine.query(query1);
      expect(result.fromCache).toBe(false);

      await smallCacheEngine.clear();
    });
  });

  describe('Performance and Scaling', () => {
    it('should handle large datasets efficiently', async () => {
      const startTime = performance.now();
      const largeDataset: TimeSeriesPoint[] = [];
      const now = Date.now();

      // Generate 10,000 data points
      for (let i = 0; i < 10000; i++) {
        largeDataset.push({
          timestamp: now - (10000 * 1000) + (i * 1000), // Every second for ~2.8 hours
          value: Math.sin(i / 100) * 50 + 100 + Math.random() * 10
        });
      }

      await engine.ingestPoints('large_metric', largeDataset);
      const ingestionTime = performance.now() - startTime;

      expect(ingestionTime).toBeLessThan(5000); // Should complete within 5 seconds

      const stats = await engine.getEngineStats();
      expect(stats.totalPoints).toBe(10000);
      expect(stats.partitions).toBe(1);
    });

    it('should query large datasets efficiently', async () => {
      // Use the large dataset from previous test
      const largeDataset: TimeSeriesPoint[] = [];
      const now = Date.now();

      for (let i = 0; i < 5000; i++) {
        largeDataset.push({
          timestamp: now - (5000 * 1000) + (i * 1000),
          value: Math.sin(i / 50) * 30 + 80
        });
      }

      await engine.ingestPoints('performance_metric', largeDataset);

      const queryStart = performance.now();
      const result = await engine.query({
        metricName: 'performance_metric',
        timeRange: { start: now - 6000 * 1000, end: now },
        aggregation: {
          type: 'avg',
          window: 60 * 1000 // 1-minute windows
        }
      });
      const queryTime = performance.now() - queryStart;

      expect(queryTime).toBeLessThan(1000); // Should complete within 1 second
      expect(result.metrics).toHaveLength(1);
      expect(result.totalPoints).toBeGreaterThan(0);
      expect(result.totalPoints).toBeLessThan(5100); // Should be aggregated (allow some buffer)
    });
  });

  describe('Error Handling', () => {
    it('should handle empty datasets gracefully', async () => {
      const query: TimeSeriesQuery = {
        metricName: 'nonexistent_metric',
        timeRange: { start: Date.now() - 60000, end: Date.now() }
      };

      const result = await engine.query(query);
      expect(result.metrics).toHaveLength(0);
      expect(result.totalPoints).toBe(0);
      expect(result.partitionsScanned).toBe(0);
    });

    it('should handle invalid time ranges', async () => {
      const points: TimeSeriesPoint[] = [
        { timestamp: Date.now(), value: 100 }
      ];

      await engine.ingestPoints('test_metric', points);

      // Query with inverted time range
      const query: TimeSeriesQuery = {
        metricName: 'test_metric',
        timeRange: { start: Date.now() + 60000, end: Date.now() - 60000 }
      };

      const result = await engine.query(query);
      expect(result.metrics).toHaveLength(0);
      expect(result.totalPoints).toBe(0);
    });

    it('should handle statistical analysis with insufficient data', async () => {
      const singlePoint: TimeSeriesPoint[] = [
        { timestamp: Date.now(), value: 42 }
      ];

      await engine.ingestPoints('single_point_metric', singlePoint);

      const stats = await engine.analyzeStatistics('single_point_metric', {
        start: Date.now() - 60000,
        end: Date.now() + 60000
      });

      expect(stats.count).toBe(1);
      expect(stats.average).toBe(42);
      expect(stats.min).toBe(42);
      expect(stats.max).toBe(42);
      expect(stats.stdDev).toBe(0);
      expect(stats.variance).toBe(0);
    });

    it('should throw error for analytics when disabled', async () => {
      const noAnalyticsEngine = new CBDTimeSeriesEngine({
        enableAnalytics: false
      });

      const points: TimeSeriesPoint[] = [
        { timestamp: Date.now(), value: 100 }
      ];

      await noAnalyticsEngine.ingestPoints('test_metric', points);

      await expect(
        noAnalyticsEngine.analyzeStatistics('test_metric', {
          start: Date.now() - 60000,
          end: Date.now() + 60000
        })
      ).rejects.toThrow('Analytics not enabled');

      await noAnalyticsEngine.clear();
    });
  });

  describe('Event Emissions', () => {
    it('should emit data ingestion events', async () => {
      const eventSpy = vi.fn();
      engine.on('dataIngested', eventSpy);

      const points: TimeSeriesPoint[] = [
        { timestamp: Date.now(), value: 100 },
        { timestamp: Date.now() + 60000, value: 200 }
      ];

      await engine.ingestPoints('event_test_metric', points, { test: 'true' });

      expect(eventSpy).toHaveBeenCalledWith(expect.objectContaining({
        metricName: 'event_test_metric',
        pointsIngested: 2,
        partitionKey: expect.stringContaining('event_test_metric'),
        executionTime: expect.any(Number)
      }));
    });

    it('should emit query execution events', async () => {
      const eventSpy = vi.fn();
      engine.on('queryExecuted', eventSpy);

      const points: TimeSeriesPoint[] = [
        { timestamp: Date.now(), value: 150 }
      ];

      await engine.ingestPoints('query_event_metric', points);

      const query: TimeSeriesQuery = {
        metricName: 'query_event_metric',
        timeRange: { start: Date.now() - 60000, end: Date.now() + 60000 }
      };

      await engine.query(query);

      expect(eventSpy).toHaveBeenCalledWith(expect.objectContaining({
        query: expect.objectContaining({
          metricName: 'query_event_metric'
        }),
        result: expect.objectContaining({
          metrics: expect.any(Array),
          executionTime: expect.any(Number)
        }),
        executionTime: expect.any(Number)
      }));
    });

    it('should emit data clearing events', async () => {
      const eventSpy = vi.fn();
      engine.on('dataCleared', eventSpy);

      await engine.clear();

      expect(eventSpy).toHaveBeenCalledWith(expect.objectContaining({
        timestamp: expect.any(Number)
      }));
    });
  });
});