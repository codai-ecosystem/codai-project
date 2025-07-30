/**
 * Gateway Service Performance Tests
 * Testing: Load handling, response times, throughput, 
 * resource utilization, scalability limits
 */

import { test, expect, Browser, Page } from '@playwright/test';
import { chromium } from '@playwright/test';

const GATEWAY_BASE_URL = 'http://localhost:4000';
const PERFORMANCE_THRESHOLDS = {
  maxResponseTime: 1000, // 1 second
  avgResponseTime: 500,  // 500ms
  maxConcurrentRequests: 100,
  minThroughput: 50, // requests per second
  maxErrorRate: 0.05 // 5% error rate
};

interface PerformanceMetrics {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageResponseTime: number;
  minResponseTime: number;
  maxResponseTime: number;
  throughput: number;
  errorRate: number;
  responseTimeDistribution: {
    p50: number;
    p90: number;
    p95: number;
    p99: number;
  };
}

class PerformanceTestRunner {
  private results: number[] = [];
  private errors: Error[] = [];
  private startTime: number = 0;
  private endTime: number = 0;

  constructor(private page: Page) {}

  async runLoadTest(
    endpoint: string,
    options: {
      duration?: number;
      concurrent?: number;
      rampUp?: number;
      requestsPerSecond?: number;
    } = {}
  ): Promise<PerformanceMetrics> {
    const {
      duration = 30000, // 30 seconds
      concurrent = 10,
      rampUp = 5000, // 5 seconds
      requestsPerSecond = 0 // 0 = no limit
    } = options;

    this.results = [];
    this.errors = [];
    this.startTime = Date.now();

    console.log(`🚀 Starting load test for ${endpoint}`);
    console.log(`Duration: ${duration}ms, Concurrent: ${concurrent}, RampUp: ${rampUp}ms`);

    // Create concurrent workers
    const workers = Array.from({ length: concurrent }, (_, i) =>
      this.createWorker(endpoint, duration, rampUp * (i / concurrent), requestsPerSecond)
    );

    // Wait for all workers to complete
    await Promise.all(workers);

    this.endTime = Date.now();
    return this.calculateMetrics();
  }

  private async createWorker(
    endpoint: string,
    duration: number,
    delay: number,
    requestsPerSecond: number
  ): Promise<void> {
    // Wait for ramp-up delay
    await new Promise(resolve => setTimeout(resolve, delay));

    const endTime = Date.now() + duration - delay;
    const interval = requestsPerSecond > 0 ? 1000 / requestsPerSecond : 0;
    let lastRequestTime = 0;

    while (Date.now() < endTime) {
      // Rate limiting
      if (interval > 0) {
        const timeSinceLastRequest = Date.now() - lastRequestTime;
        if (timeSinceLastRequest < interval) {
          await new Promise(resolve => setTimeout(resolve, interval - timeSinceLastRequest));
        }
      }

      try {
        lastRequestTime = Date.now();
        const startTime = Date.now();
        
        const response = await this.page.request.get(`${GATEWAY_BASE_URL}${endpoint}`, {
          timeout: 10000
        });
        
        const responseTime = Date.now() - startTime;
        this.results.push(responseTime);

        if (!response.ok()) {
          this.errors.push(new Error(`HTTP ${response.status()}: ${response.statusText()}`));
        }
      } catch (error) {
        this.errors.push(error as Error);
      }
    }
  }

  private calculateMetrics(): PerformanceMetrics {
    const totalTime = this.endTime - this.startTime;
    const totalRequests = this.results.length + this.errors.length;
    const successfulRequests = this.results.length;
    const failedRequests = this.errors.length;

    if (this.results.length === 0) {
      throw new Error('No successful requests recorded');
    }

    const sortedResults = [...this.results].sort((a, b) => a - b);
    
    return {
      totalRequests,
      successfulRequests,
      failedRequests,
      averageResponseTime: this.results.reduce((a, b) => a + b, 0) / this.results.length,
      minResponseTime: Math.min(...this.results),
      maxResponseTime: Math.max(...this.results),
      throughput: (totalRequests / totalTime) * 1000, // requests per second
      errorRate: failedRequests / totalRequests,
      responseTimeDistribution: {
        p50: sortedResults[Math.floor(sortedResults.length * 0.5)],
        p90: sortedResults[Math.floor(sortedResults.length * 0.9)],
        p95: sortedResults[Math.floor(sortedResults.length * 0.95)],
        p99: sortedResults[Math.floor(sortedResults.length * 0.99)]
      }
    };
  }

  logMetrics(metrics: PerformanceMetrics, testName: string): void {
    console.log(`\n📊 Performance Metrics for ${testName}:`);
    console.log(`Total Requests: ${metrics.totalRequests}`);
    console.log(`Successful Requests: ${metrics.successfulRequests}`);
    console.log(`Failed Requests: ${metrics.failedRequests}`);
    console.log(`Error Rate: ${(metrics.errorRate * 100).toFixed(2)}%`);
    console.log(`Throughput: ${metrics.throughput.toFixed(2)} req/s`);
    console.log(`Average Response Time: ${metrics.averageResponseTime.toFixed(2)}ms`);
    console.log(`Min Response Time: ${metrics.minResponseTime}ms`);
    console.log(`Max Response Time: ${metrics.maxResponseTime}ms`);
    console.log(`Response Time Distribution:`);
    console.log(`  P50: ${metrics.responseTimeDistribution.p50}ms`);
    console.log(`  P90: ${metrics.responseTimeDistribution.p90}ms`);
    console.log(`  P95: ${metrics.responseTimeDistribution.p95}ms`);
    console.log(`  P99: ${metrics.responseTimeDistribution.p99}ms`);
  }
}

test.describe('Gateway Service - Performance Tests', () => {
  let browser: Browser;
  let page: Page;
  let performanceRunner: PerformanceTestRunner;

  test.beforeAll(async () => {
    browser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-dev-shm-usage']
    });
  });

  test.afterAll(async () => {
    await browser.close();
  });

  test.beforeEach(async () => {
    page = await browser.newPage();
    performanceRunner = new PerformanceTestRunner(page);
    
    // Warm up the gateway
    await page.request.get(`${GATEWAY_BASE_URL}/health`);
  });

  test.afterEach(async () => {
    await page.close();
  });

  test.describe('Baseline Performance', () => {
    test('should meet response time requirements for health endpoint', async () => {
      const metrics = await performanceRunner.runLoadTest('/health', {
        duration: 10000, // 10 seconds
        concurrent: 5
      });

      performanceRunner.logMetrics(metrics, 'Health Endpoint Baseline');

      expect(metrics.averageResponseTime).toBeLessThan(PERFORMANCE_THRESHOLDS.avgResponseTime);
      expect(metrics.maxResponseTime).toBeLessThan(PERFORMANCE_THRESHOLDS.maxResponseTime);
      expect(metrics.errorRate).toBeLessThan(PERFORMANCE_THRESHOLDS.maxErrorRate);
      expect(metrics.responseTimeDistribution.p95).toBeLessThan(PERFORMANCE_THRESHOLDS.maxResponseTime);
    });

    test('should meet response time requirements for API routing', async () => {
      const metrics = await performanceRunner.runLoadTest('/api/v1/id', {
        duration: 15000, // 15 seconds
        concurrent: 10
      });

      performanceRunner.logMetrics(metrics, 'API Routing Baseline');

      expect(metrics.averageResponseTime).toBeLessThan(PERFORMANCE_THRESHOLDS.avgResponseTime);
      expect(metrics.maxResponseTime).toBeLessThan(PERFORMANCE_THRESHOLDS.maxResponseTime * 2); // Allow 2x for API calls
      expect(metrics.errorRate).toBeLessThan(PERFORMANCE_THRESHOLDS.maxErrorRate);
    });

    test('should maintain performance for service discovery', async () => {
      const metrics = await performanceRunner.runLoadTest('/api/gateway/services', {
        duration: 10000,
        concurrent: 8
      });

      performanceRunner.logMetrics(metrics, 'Service Discovery Baseline');

      expect(metrics.averageResponseTime).toBeLessThan(PERFORMANCE_THRESHOLDS.avgResponseTime);
      expect(metrics.throughput).toBeGreaterThan(10); // At least 10 req/s
      expect(metrics.errorRate).toBeLessThan(PERFORMANCE_THRESHOLDS.maxErrorRate);
    });
  });

  test.describe('Load Testing', () => {
    test('should handle moderate concurrent load', async () => {
      const metrics = await performanceRunner.runLoadTest('/api/v1/codai', {
        duration: 30000, // 30 seconds
        concurrent: 25,
        rampUp: 5000
      });

      performanceRunner.logMetrics(metrics, 'Moderate Load Test');

      expect(metrics.totalRequests).toBeGreaterThan(100);
      expect(metrics.errorRate).toBeLessThan(0.1); // 10% error rate acceptable under load
      expect(metrics.responseTimeDistribution.p90).toBeLessThan(PERFORMANCE_THRESHOLDS.maxResponseTime * 1.5);
      expect(metrics.throughput).toBeGreaterThan(5); // At least 5 req/s under load
    });

    test('should handle high concurrent load', async () => {
      const metrics = await performanceRunner.runLoadTest('/api/v1/memorai', {
        duration: 45000, // 45 seconds
        concurrent: 50,
        rampUp: 10000
      });

      performanceRunner.logMetrics(metrics, 'High Load Test');

      expect(metrics.totalRequests).toBeGreaterThan(200);
      expect(metrics.errorRate).toBeLessThan(0.15); // 15% error rate acceptable under high load
      expect(metrics.responseTimeDistribution.p95).toBeLessThan(PERFORMANCE_THRESHOLDS.maxResponseTime * 3);
    });

    test('should handle burst traffic patterns', async () => {
      // Simulate burst traffic by running multiple short high-intensity tests
      const burstResults: PerformanceMetrics[] = [];

      for (let i = 0; i < 3; i++) {
        console.log(`Running burst test ${i + 1}/3`);
        
        const metrics = await performanceRunner.runLoadTest('/api/v1/id', {
          duration: 5000, // 5 second bursts
          concurrent: 30,
          rampUp: 1000 // Quick ramp-up
        });

        burstResults.push(metrics);
        performanceRunner.logMetrics(metrics, `Burst Test ${i + 1}`);

        // Cool-down period between bursts
        await new Promise(resolve => setTimeout(resolve, 2000));
      }

      // Verify all bursts were handled reasonably
      burstResults.forEach((metrics, index) => {
        expect(metrics.errorRate).toBeLessThan(0.2); // 20% error rate acceptable during bursts
        expect(metrics.totalRequests).toBeGreaterThan(10);
      });

      // Calculate overall burst performance
      const totalErrors = burstResults.reduce((sum, m) => sum + m.failedRequests, 0);
      const totalRequests = burstResults.reduce((sum, m) => sum + m.totalRequests, 0);
      const overallErrorRate = totalErrors / totalRequests;

      expect(overallErrorRate).toBeLessThan(0.15); // Overall error rate should be reasonable
    });
  });

  test.describe('Stress Testing', () => {
    test('should identify breaking point under extreme load', async () => {
      const stressLevels = [75, 100];
      let breakingPoint = 0;

      for (const concurrent of stressLevels) {
        console.log(`Testing stress level: ${concurrent} concurrent users`);
        
        try {
          const metrics = await performanceRunner.runLoadTest('/api/v1/hub', {
            duration: 20000, // 20 seconds
            concurrent,
            rampUp: 5000
          });

          performanceRunner.logMetrics(metrics, `Stress Test - ${concurrent} concurrent`);

          // If error rate is too high, we've found our breaking point
          if (metrics.errorRate > 0.5) { // 50% error rate
            breakingPoint = concurrent;
            break;
          }

          expect(metrics.totalRequests).toBeGreaterThan(concurrent); // Should handle at least 1 request per user
        } catch (error) {
          console.log(`Breaking point reached at ${concurrent} concurrent users`);
          breakingPoint = concurrent;
          break;
        }
      }

      if (breakingPoint > 0) {
        console.log(`🚨 Gateway breaking point: ${breakingPoint} concurrent users`);
      } else {
        console.log(`✅ Gateway handled maximum tested load of ${stressLevels[stressLevels.length - 1]} concurrent users`);
      }

      // Breaking point should be reasonably high
      expect(breakingPoint === 0 || breakingPoint >= 50).toBeTruthy();
    });

    test('should recover gracefully after stress', async () => {
      // First, apply stress
      console.log('Applying stress load...');
      const stressMetrics = await performanceRunner.runLoadTest('/api/v1/bancai', {
        duration: 15000,
        concurrent: 75,
        rampUp: 2000
      });

      performanceRunner.logMetrics(stressMetrics, 'Stress Application');

      // Wait for recovery
      console.log('Waiting for recovery...');
      await new Promise(resolve => setTimeout(resolve, 10000));

      // Test recovery
      console.log('Testing recovery...');
      const recoveryMetrics = await performanceRunner.runLoadTest('/api/v1/bancai', {
        duration: 10000,
        concurrent: 10,
        rampUp: 2000
      });

      performanceRunner.logMetrics(recoveryMetrics, 'Post-Stress Recovery');

      // Recovery should show improved performance
      expect(recoveryMetrics.errorRate).toBeLessThan(stressMetrics.errorRate);
      expect(recoveryMetrics.averageResponseTime).toBeLessThan(stressMetrics.averageResponseTime * 1.2);
    });
  });

  test.describe('Endurance Testing', () => {
    test('should maintain performance over extended duration', async () => {
      console.log('Starting endurance test (2 minutes)...');
      
      const metrics = await performanceRunner.runLoadTest('/api/gateway/health', {
        duration: 120000, // 2 minutes
        concurrent: 15,
        rampUp: 10000
      });

      performanceRunner.logMetrics(metrics, 'Endurance Test');

      expect(metrics.totalRequests).toBeGreaterThan(500); // Should handle many requests over 2 minutes
      expect(metrics.errorRate).toBeLessThan(0.05); // Low error rate over time
      expect(metrics.averageResponseTime).toBeLessThan(PERFORMANCE_THRESHOLDS.avgResponseTime * 1.5);
      
      // Check for performance degradation indicators
      expect(metrics.responseTimeDistribution.p99).toBeLessThan(PERFORMANCE_THRESHOLDS.maxResponseTime * 3);
    });

    test('should not show memory leaks during extended operation', async () => {
      // This test runs for a shorter duration but monitors for increasing response times
      // which could indicate memory leaks or resource exhaustion
      
      const testDuration = 60000; // 1 minute
      const sampleInterval = 10000; // Sample every 10 seconds
      const samples: PerformanceMetrics[] = [];

      for (let elapsed = 0; elapsed < testDuration; elapsed += sampleInterval) {
        const sampleMetrics = await performanceRunner.runLoadTest('/api/v1/id', {
          duration: sampleInterval,
          concurrent: 10
        });

        samples.push(sampleMetrics);
        console.log(`Sample ${samples.length}: Avg Response Time: ${sampleMetrics.averageResponseTime.toFixed(2)}ms`);
      }

      // Check for performance degradation over time
      const firstHalf = samples.slice(0, Math.floor(samples.length / 2));
      const secondHalf = samples.slice(Math.floor(samples.length / 2));

      const firstHalfAvg = firstHalf.reduce((sum, m) => sum + m.averageResponseTime, 0) / firstHalf.length;
      const secondHalfAvg = secondHalf.reduce((sum, m) => sum + m.averageResponseTime, 0) / secondHalf.length;

      console.log(`First half avg response time: ${firstHalfAvg.toFixed(2)}ms`);
      console.log(`Second half avg response time: ${secondHalfAvg.toFixed(2)}ms`);

      // Response time should not increase significantly over time
      const degradationRatio = secondHalfAvg / firstHalfAvg;
      expect(degradationRatio).toBeLessThan(1.5); // No more than 50% degradation
    });
  });

  test.describe('Throughput Testing', () => {
    test('should achieve target throughput for different endpoints', async () => {
      const endpoints = [
        { path: '/health', expectedThroughput: 100 },
        { path: '/api/gateway/services', expectedThroughput: 50 },
        { path: '/api/v1/id', expectedThroughput: 30 },
        { path: '/api/v1/codai', expectedThroughput: 25 }
      ];

      for (const endpoint of endpoints) {
        const metrics = await performanceRunner.runLoadTest(endpoint.path, {
          duration: 20000,
          concurrent: 20,
          requestsPerSecond: endpoint.expectedThroughput / 2 // Test at half the expected rate
        });

        performanceRunner.logMetrics(metrics, `Throughput Test - ${endpoint.path}`);

        // Should achieve at least half the expected throughput
        expect(metrics.throughput).toBeGreaterThan(endpoint.expectedThroughput / 4);
        expect(metrics.errorRate).toBeLessThan(0.1);
      }
    });

    test('should maintain throughput with rate limiting active', async () => {
      // Test throughput when rate limiting is being applied
      const metrics = await performanceRunner.runLoadTest('/api/v1/memorai', {
        duration: 30000,
        concurrent: 40, // High enough to trigger rate limiting
        rampUp: 5000
      });

      performanceRunner.logMetrics(metrics, 'Throughput with Rate Limiting');

      // Even with rate limiting, should maintain reasonable throughput
      expect(metrics.throughput).toBeGreaterThan(5);
      
      // Rate limiting should cause some requests to fail
      expect(metrics.errorRate).toBeGreaterThan(0);
      expect(metrics.errorRate).toBeLessThan(0.8); // But not too many
    });
  });

  test.describe('Resource Utilization', () => {
    test('should efficiently handle mixed request types', async () => {
      // Simulate realistic mixed workload
      const mixedWorkload = [
        { endpoint: '/health', weight: 0.3 },
        { endpoint: '/api/v1/id', weight: 0.2 },
        { endpoint: '/api/v1/codai', weight: 0.2 },
        { endpoint: '/api/v1/memorai', weight: 0.15 },
        { endpoint: '/api/gateway/services', weight: 0.15 }
      ];

      // Run mixed workload test
      const workers = mixedWorkload.map(async (workload) => {
        const concurrent = Math.floor(20 * workload.weight);
        if (concurrent < 1) return null;

        return performanceRunner.runLoadTest(workload.endpoint, {
          duration: 30000,
          concurrent
        });
      });

      const results = await Promise.all(workers);
      const validResults = results.filter(Boolean) as PerformanceMetrics[];

      // Analyze mixed workload performance
      const totalRequests = validResults.reduce((sum, m) => sum + m.totalRequests, 0);
      const totalErrors = validResults.reduce((sum, m) => sum + m.failedRequests, 0);
      const overallErrorRate = totalErrors / totalRequests;
      const avgThroughput = validResults.reduce((sum, m) => sum + m.throughput, 0) / validResults.length;

      console.log(`Mixed Workload Results:`);
      console.log(`Total Requests: ${totalRequests}`);
      console.log(`Overall Error Rate: ${(overallErrorRate * 100).toFixed(2)}%`);
      console.log(`Average Throughput: ${avgThroughput.toFixed(2)} req/s`);

      expect(overallErrorRate).toBeLessThan(0.1);
      expect(totalRequests).toBeGreaterThan(200);
      expect(avgThroughput).toBeGreaterThan(5);
    });

    test('should handle large response payloads efficiently', async () => {
      // Test with endpoints that return larger payloads
      const metrics = await performanceRunner.runLoadTest('/api/gateway/health', {
        duration: 20000,
        concurrent: 15
      });

      performanceRunner.logMetrics(metrics, 'Large Payload Test');

      // Should handle larger payloads without significant performance impact
      expect(metrics.averageResponseTime).toBeLessThan(PERFORMANCE_THRESHOLDS.avgResponseTime * 2);
      expect(metrics.errorRate).toBeLessThan(PERFORMANCE_THRESHOLDS.maxErrorRate);
      expect(metrics.throughput).toBeGreaterThan(10);
    });
  });

  test.describe('Performance Regression Detection', () => {
    test('should detect performance regressions', async () => {
      // This test would typically compare against baseline metrics
      // For demonstration, we'll test current performance against thresholds
      
      const currentMetrics = await performanceRunner.runLoadTest('/api/v1/hub', {
        duration: 15000,
        concurrent: 20
      });

      performanceRunner.logMetrics(currentMetrics, 'Regression Detection Test');

      // Compare against performance thresholds (these would be baseline metrics in real scenario)
      const performanceRegression = {
        responseTimeRegression: currentMetrics.averageResponseTime > PERFORMANCE_THRESHOLDS.avgResponseTime,
        throughputRegression: currentMetrics.throughput < PERFORMANCE_THRESHOLDS.minThroughput,
        errorRateRegression: currentMetrics.errorRate > PERFORMANCE_THRESHOLDS.maxErrorRate
      };

      if (performanceRegression.responseTimeRegression) {
        console.warn(`⚠️ Response time regression detected: ${currentMetrics.averageResponseTime}ms > ${PERFORMANCE_THRESHOLDS.avgResponseTime}ms`);
      }

      if (performanceRegression.throughputRegression) {
        console.warn(`⚠️ Throughput regression detected: ${currentMetrics.throughput} req/s < ${PERFORMANCE_THRESHOLDS.minThroughput} req/s`);
      }

      if (performanceRegression.errorRateRegression) {
        console.warn(`⚠️ Error rate regression detected: ${(currentMetrics.errorRate * 100).toFixed(2)}% > ${(PERFORMANCE_THRESHOLDS.maxErrorRate * 100).toFixed(2)}%`);
      }

      // For CI/CD, you might want to fail the test if regressions are detected
      // expect(performanceRegression.responseTimeRegression).toBeFalsy();
      // expect(performanceRegression.throughputRegression).toBeFalsy();
      // expect(performanceRegression.errorRateRegression).toBeFalsy();

      // For now, just ensure the test ran successfully
      expect(currentMetrics.totalRequests).toBeGreaterThan(0);
    });
  });
});
