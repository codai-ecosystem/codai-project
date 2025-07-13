/**
 * Enterprise Performance Test Suite
 * Comprehensive performance testing for enterprise-grade requirements
 */

import { describe, test, expect, beforeAll, afterAll } from '@jest/globals';
import { RomaiUltimateMcpServer } from '../../src/ultimate-server';

describe('Enterprise Performance Tests', () => {
  let server: RomaiUltimateMcpServer;

  beforeAll(async () => {
    process.env['NODE_ENV'] = 'performance_test';
    process.env['ROMAI_SERVER_MODE'] = 'performance';

    server = new RomaiUltimateMcpServer();
    await server.initialize();
  }, 30000);

  afterAll(async () => {
    // Cleanup resources
  });

  describe('Initialization Performance', () => {
    test('should initialize within enterprise SLA (< 10 seconds)', async () => {
      const startTime = performance.now();
      const testServer = new RomaiUltimateMcpServer();
      await testServer.initialize();
      const endTime = performance.now();

      const initTime = endTime - startTime;
      expect(initTime).toBeLessThan(10000); // Less than 10 seconds

      console.log(`Server initialization time: ${Math.round(initTime)}ms`);
    }, 15000);

    test('should register all tools efficiently', async () => {
      const startTime = performance.now();
      const tools = await server.listTools();
      const endTime = performance.now();

      const listTime = endTime - startTime;
      expect(listTime).toBeLessThan(1000); // Less than 1 second
      expect(tools.tools.length).toBeGreaterThanOrEqual(33);

      console.log(`Tool listing time: ${Math.round(listTime)}ms for ${tools.tools.length} tools`);
    });
  });

  describe('Response Time Performance', () => {
    test('should meet sub-second response times for health checks', async () => {
      const iterations = 10;
      const responseTimes: number[] = [];

      for (let i = 0; i < iterations; i++) {
        const startTime = performance.now();
        await server.callTool('romai_health_check', {});
        const endTime = performance.now();

        responseTimes.push(endTime - startTime);
      }

      const avgResponseTime = responseTimes.reduce((a, b) => a + b, 0) / iterations;
      const maxResponseTime = Math.max(...responseTimes);

      expect(avgResponseTime).toBeLessThan(1000); // Average < 1 second
      expect(maxResponseTime).toBeLessThan(3000); // Max < 3 seconds

      console.log(`Health check - Avg: ${Math.round(avgResponseTime)}ms, Max: ${Math.round(maxResponseTime)}ms`);
    }, 30000);

    test('should maintain performance for intelligence queries', async () => {
      const iterations = 5;
      const responseTimes: number[] = [];

      for (let i = 0; i < iterations; i++) {
        const startTime = performance.now();
        await server.callTool('romai_intelligence', {
          query: `Performance test query ${i + 1}`,
          domain: 'technology',
          language: 'en'
        });
        const endTime = performance.now();

        responseTimes.push(endTime - startTime);
      }

      const avgResponseTime = responseTimes.reduce((a, b) => a + b, 0) / iterations;
      const maxResponseTime = Math.max(...responseTimes);

      expect(avgResponseTime).toBeLessThan(5000); // Average < 5 seconds
      expect(maxResponseTime).toBeLessThan(10000); // Max < 10 seconds

      console.log(`Intelligence queries - Avg: ${Math.round(avgResponseTime)}ms, Max: ${Math.round(maxResponseTime)}ms`);
    }, 60000);
  });

  describe('Concurrent Load Performance', () => {
    test('should handle 10 concurrent requests efficiently', async () => {
      const concurrency = 10;
      const startTime = performance.now();

      const promises = Array.from({ length: concurrency }, (_, i) =>
        server.callTool('romai_health_check', {})
      );

      const results = await Promise.all(promises);
      const endTime = performance.now();

      const totalTime = endTime - startTime;
      const avgTimePerRequest = totalTime / concurrency;

      expect(results).toHaveLength(concurrency);
      expect(avgTimePerRequest).toBeLessThan(2000); // Less than 2 seconds average

      console.log(`Concurrent load (${concurrency}) - Total: ${Math.round(totalTime)}ms, Avg per request: ${Math.round(avgTimePerRequest)}ms`);
    }, 30000);

    test('should scale to 25 concurrent intelligence requests', async () => {
      const concurrency = 25;
      const startTime = performance.now();

      const promises = Array.from({ length: concurrency }, (_, i) =>
        server.callTool('romai_intelligence', {
          query: `Concurrent test ${i + 1}`,
          domain: 'technology',
          language: 'en'
        })
      );

      const results = await Promise.allSettled(promises);
      const endTime = performance.now();

      const successfulResults = results.filter(r => r.status === 'fulfilled');
      const totalTime = endTime - startTime;

      expect(successfulResults.length).toBeGreaterThanOrEqual(20); // At least 80% success rate
      expect(totalTime).toBeLessThan(60000); // Complete within 60 seconds

      console.log(`High concurrency test - ${successfulResults.length}/${concurrency} successful in ${Math.round(totalTime)}ms`);
    }, 90000);
  });

  describe('Memory Performance', () => {
    test('should maintain stable memory usage', async () => {
      const initialMemory = process.memoryUsage();

      // Perform 20 operations
      for (let i = 0; i < 20; i++) {
        await server.callTool('romai_health_check', {});
      }

      const midMemory = process.memoryUsage();

      // Perform 20 more operations
      for (let i = 0; i < 20; i++) {
        await server.callTool('romai_intelligence', {
          query: `Memory test ${i}`,
          domain: 'general',
          language: 'en'
        });
      }

      const finalMemory = process.memoryUsage();

      const initialToMidGrowth = midMemory.heapUsed - initialMemory.heapUsed;
      const midToFinalGrowth = finalMemory.heapUsed - midMemory.heapUsed;

      // Memory growth should be reasonable and not exponential
      expect(initialToMidGrowth).toBeLessThan(50 * 1024 * 1024); // Less than 50MB
      expect(midToFinalGrowth).toBeLessThan(100 * 1024 * 1024); // Less than 100MB

      console.log(`Memory usage - Initial: ${Math.round(initialMemory.heapUsed / 1024 / 1024)}MB, Final: ${Math.round(finalMemory.heapUsed / 1024 / 1024)}MB`);
    }, 120000);

    test('should handle garbage collection efficiently', async () => {
      const initialMemory = process.memoryUsage();

      // Create memory pressure
      const largeTasks = Array.from({ length: 15 }, (_, i) =>
        server.callTool('romai_intelligence', {
          query: `Large analysis task ${i} - comprehensive market research with detailed competitive analysis and strategic recommendations`,
          domain: 'business',
          language: 'en'
        })
      );

      await Promise.all(largeTasks);

      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }

      // Wait for GC
      await new Promise(resolve => setTimeout(resolve, 2000));

      const finalMemory = process.memoryUsage();
      const memoryGrowth = finalMemory.heapUsed - initialMemory.heapUsed;

      // After GC, memory growth should be reasonable
      expect(memoryGrowth).toBeLessThan(200 * 1024 * 1024); // Less than 200MB growth

      console.log(`Post-GC memory growth: ${Math.round(memoryGrowth / 1024 / 1024)}MB`);
    }, 180000);
  });

  describe('Throughput Performance', () => {
    test('should achieve target throughput for health checks', async () => {
      const duration = 10000; // 10 seconds
      const startTime = performance.now();
      let completedRequests = 0;

      const runTests = async () => {
        while (performance.now() - startTime < duration) {
          try {
            await server.callTool('romai_health_check', {});
            completedRequests++;
          } catch (error) {
            // Count failed requests but continue
          }
        }
      };

      // Run 3 concurrent test streams
      await Promise.all([runTests(), runTests(), runTests()]);

      const actualDuration = performance.now() - startTime;
      const requestsPerSecond = (completedRequests / actualDuration) * 1000;

      expect(requestsPerSecond).toBeGreaterThan(1); // At least 1 request per second

      console.log(`Throughput: ${Math.round(requestsPerSecond * 10) / 10} requests/second (${completedRequests} total in ${Math.round(actualDuration)}ms)`);
    }, 15000);

    test('should maintain throughput under mixed workload', async () => {
      const duration = 15000; // 15 seconds
      const startTime = performance.now();
      let healthCheckCount = 0;
      let intelligenceCount = 0;

      const healthCheckStream = async () => {
        while (performance.now() - startTime < duration) {
          try {
            await server.callTool('romai_health_check', {});
            healthCheckCount++;
          } catch (error) {
            // Continue on error
          }
        }
      };

      const intelligenceStream = async () => {
        while (performance.now() - startTime < duration) {
          try {
            await server.callTool('romai_intelligence', {
              query: 'Mixed workload test',
              domain: 'technology',
              language: 'en'
            });
            intelligenceCount++;
          } catch (error) {
            // Continue on error
          }
        }
      };

      await Promise.all([
        healthCheckStream(),
        healthCheckStream(),
        intelligenceStream()
      ]);

      const actualDuration = performance.now() - startTime;
      const totalRequests = healthCheckCount + intelligenceCount;
      const requestsPerSecond = (totalRequests / actualDuration) * 1000;

      expect(totalRequests).toBeGreaterThan(10); // Minimum viable throughput

      console.log(`Mixed workload - Health: ${healthCheckCount}, Intelligence: ${intelligenceCount}, Rate: ${Math.round(requestsPerSecond * 10) / 10} req/sec`);
    }, 20000);
  });

  describe('Resource Utilization', () => {
    test('should efficiently utilize system resources', async () => {
      const initialCpuUsage = process.cpuUsage();
      const startTime = performance.now();

      // CPU-intensive workload
      const cpuTasks = Array.from({ length: 10 }, (_, i) =>
        server.callTool('romai_intelligence', {
          query: `CPU test ${i} - complex analysis requiring significant processing`,
          domain: 'technology',
          language: 'en'
        })
      );

      await Promise.all(cpuTasks);

      const finalCpuUsage = process.cpuUsage(initialCpuUsage);
      const duration = performance.now() - startTime;

      // CPU efficiency metrics
      const cpuEfficiency = (finalCpuUsage.user + finalCpuUsage.system) / (duration * 1000);

      expect(cpuEfficiency).toBeLessThan(2); // Reasonable CPU utilization

      console.log(`CPU utilization - User: ${Math.round(finalCpuUsage.user / 1000)}ms, System: ${Math.round(finalCpuUsage.system / 1000)}ms over ${Math.round(duration)}ms`);
    }, 60000);
  });

  describe('Enterprise SLA Compliance', () => {
    test('should meet 99% availability target', async () => {
      const totalRequests = 100;
      let successfulRequests = 0;

      for (let i = 0; i < totalRequests; i++) {
        try {
          await server.callTool('romai_health_check', {});
          successfulRequests++;
        } catch (error) {
          // Count as failure
        }
      }

      const availability = (successfulRequests / totalRequests) * 100;
      expect(availability).toBeGreaterThanOrEqual(99);

      console.log(`Availability: ${availability}% (${successfulRequests}/${totalRequests})`);
    }, 120000);

    test('should maintain response time SLA under load', async () => {
      const slaTarget = 5000; // 5 seconds
      const testRequests = 50;
      const responseTimes: number[] = [];

      for (let i = 0; i < testRequests; i++) {
        const startTime = performance.now();
        try {
          await server.callTool('romai_intelligence', {
            query: `SLA test ${i}`,
            domain: 'general',
            language: 'en'
          });
        } catch (error) {
          // Include failed requests in timing
        }
        const endTime = performance.now();
        responseTimes.push(endTime - startTime);
      }

      const p95ResponseTime = responseTimes.sort((a, b) => a - b)[Math.floor(testRequests * 0.95)];
      const slaViolations = responseTimes.filter(time => time > slaTarget).length;
      const slaCompliance = ((testRequests - slaViolations) / testRequests) * 100;

      expect(slaCompliance).toBeGreaterThanOrEqual(95); // 95% of requests within SLA

      console.log(`SLA Compliance: ${slaCompliance}%, P95 Response Time: ${Math.round(p95ResponseTime)}ms`);
    }, 300000);
  });
});
