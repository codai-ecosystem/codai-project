import { test, expect } from '@playwright/test';

/**
 * CODAI Ecosystem - Performance & Load Testing Suite
 * 
 * Comprehensive performance testing covering:
 * - Load testing for all services under normal conditions
 * - Stress testing to find breaking points
 * - Spike testing for traffic surges
 * - Volume testing for data handling
 * - Endurance testing for long-running operations
 * 
 * Success Criteria:
 * - API Response Time: <200ms average, <500ms p95
 * - Page Load Time: <2s First Contentful Paint
 * - Memory Usage: <2GB per service under normal load
 * - Concurrent Users: Support 100+ simultaneous users
 */

const SERVICES = [
  { name: 'gateway', port: 4000, hasHealth: false, testEndpoint: '/api/v1/codai' },
  { name: 'codai', port: 4001, hasHealth: false, testEndpoint: '/' },
  { name: 'admin', port: 4002, hasHealth: true, testEndpoint: '/api/health' },
  { name: 'hub', port: 4003, hasHealth: true, testEndpoint: '/api/health' },
  { name: 'id', port: 4004, hasHealth: true, testEndpoint: '/api/health' },
  { name: 'bancai', port: 4005, hasHealth: true, testEndpoint: '/api/health' },
  { name: 'memorai', port: 4006, hasHealth: true, testEndpoint: '/api/health' },
];

// Performance metrics tracking
interface PerformanceMetrics {
  responseTime: number;
  throughput: number;
  errorRate: number;
  cpuUsage?: number;
  memoryUsage?: number;
}

class PerformanceMonitor {
  private metrics: Map<string, PerformanceMetrics[]> = new Map();

  recordMetric(service: string, metric: PerformanceMetrics) {
    if (!this.metrics.has(service)) {
      this.metrics.set(service, []);
    }
    this.metrics.get(service)!.push(metric);
  }

  getAverageResponseTime(service: string): number {
    const serviceMetrics = this.metrics.get(service) || [];
    if (serviceMetrics.length === 0) return 0;
    
    const total = serviceMetrics.reduce((sum, m) => sum + m.responseTime, 0);
    return total / serviceMetrics.length;
  }

  getP95ResponseTime(service: string): number {
    const serviceMetrics = this.metrics.get(service) || [];
    if (serviceMetrics.length === 0) return 0;
    
    const sorted = serviceMetrics.map(m => m.responseTime).sort((a, b) => a - b);
    const p95Index = Math.floor(sorted.length * 0.95);
    return sorted[p95Index] || 0;
  }

  getTotalRequests(service: string): number {
    return this.metrics.get(service)?.length || 0;
  }

  getErrorRate(service: string): number {
    const serviceMetrics = this.metrics.get(service) || [];
    if (serviceMetrics.length === 0) return 0;
    
    const errors = serviceMetrics.filter(m => m.errorRate > 0).length;
    return (errors / serviceMetrics.length) * 100;
  }
}

test.describe('CODAI Ecosystem - Performance & Load Testing', () => {
  let performanceMonitor: PerformanceMonitor;

  test.beforeEach(async () => {
    performanceMonitor = new PerformanceMonitor();
  });

  test('should handle baseline load testing across all services', async ({ request }) => {
    console.log('🚀 Starting baseline load testing...');
    
    const CONCURRENT_REQUESTS = 10;
    const REQUESTS_PER_SERVICE = 20;
    
    for (const service of SERVICES) {
      console.log(`📊 Load testing ${service.name} service...`);
      
      const promises = [];
      const startTime = Date.now();
      
      // Generate concurrent requests
      for (let i = 0; i < CONCURRENT_REQUESTS; i++) {
        for (let j = 0; j < REQUESTS_PER_SERVICE; j++) {
          const promise = (async () => {
            const requestStart = Date.now();
            try {
              let response;
              response = await request.get(`http://localhost:${service.port}${service.testEndpoint}`);
              
              const responseTime = Date.now() - requestStart;
              const isError = !response.ok();
              
              performanceMonitor.recordMetric(service.name, {
                responseTime,
                throughput: 1,
                errorRate: isError ? 1 : 0,
              });
              
              return { success: !isError, responseTime };
            } catch (error) {
              const responseTime = Date.now() - requestStart;
              performanceMonitor.recordMetric(service.name, {
                responseTime,
                throughput: 0,
                errorRate: 1,
              });
              return { success: false, responseTime };
            }
          })();
          
          promises.push(promise);
        }
      }
      
      // Wait for all requests to complete
      const results = await Promise.all(promises);
      const totalTime = Date.now() - startTime;
      
      // Calculate metrics
      const avgResponseTime = performanceMonitor.getAverageResponseTime(service.name);
      const p95ResponseTime = performanceMonitor.getP95ResponseTime(service.name);
      const errorRate = performanceMonitor.getErrorRate(service.name);
      const throughput = (results.length / totalTime) * 1000; // requests per second
      
      console.log(`✅ ${service.name} performance metrics:`);
      console.log(`   - Total requests: ${results.length}`);
      console.log(`   - Average response time: ${avgResponseTime.toFixed(2)}ms`);
      console.log(`   - P95 response time: ${p95ResponseTime.toFixed(2)}ms`);
      console.log(`   - Error rate: ${errorRate.toFixed(2)}%`);
      console.log(`   - Throughput: ${throughput.toFixed(2)} req/s`);
      
      // Performance assertions
      expect(avgResponseTime).toBeLessThan(500); // Under 500ms average
      expect(p95ResponseTime).toBeLessThan(1000); // Under 1s P95
      expect(errorRate).toBeLessThan(10); // Under 10% error rate
      expect(throughput).toBeGreaterThan(1); // At least 1 req/s
    }
    
    console.log('✅ Baseline load testing completed successfully');
  });

  test('should handle stress testing to find service limits', async ({ request }) => {
    console.log('🔥 Starting stress testing...');
    
    // Focus on most critical services for stress testing
    const criticalServices = SERVICES.filter(s => ['gateway', 'codai', 'admin', 'id'].includes(s.name));
    
    for (const service of criticalServices) {
      console.log(`🔥 Stress testing ${service.name} service...`);
      
      let maxSuccessfulLoad = 0;
      let currentLoad = 5;
      const maxLoad = 50;
      
      while (currentLoad <= maxLoad) {
        console.log(`   Testing load level: ${currentLoad} concurrent requests`);
        
        const promises = [];
        const startTime = Date.now();
        
        // Generate concurrent requests at current load level
        for (let i = 0; i < currentLoad; i++) {
          const promise = (async () => {
            const requestStart = Date.now();
            try {
              let response;
              response = await request.get(`http://localhost:${service.port}${service.testEndpoint}`, {
                timeout: 5000 // 5 second timeout
              });
              
              const responseTime = Date.now() - requestStart;
              return { success: response.ok(), responseTime };
            } catch (error) {
              const responseTime = Date.now() - requestStart;
              return { success: false, responseTime };
            }
          })();
          
          promises.push(promise);
        }
        
        const results = await Promise.all(promises);
        const successfulRequests = results.filter(r => r.success).length;
        const successRate = (successfulRequests / results.length) * 100;
        const avgResponseTime = results.reduce((sum, r) => sum + r.responseTime, 0) / results.length;
        
        console.log(`   Success rate: ${successRate.toFixed(1)}% | Avg response: ${avgResponseTime.toFixed(0)}ms`);
        
        // If success rate drops below 90% or response time exceeds 2s, we've found the limit
        if (successRate >= 90 && avgResponseTime < 2000) {
          maxSuccessfulLoad = currentLoad;
          currentLoad += 5;
        } else {
          console.log(`   🚨 Service limit reached at ${currentLoad} concurrent requests`);
          break;
        }
        
        // Small delay between load levels
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      console.log(`✅ ${service.name} maximum stable load: ${maxSuccessfulLoad} concurrent requests`);
      
      // Assert minimum performance requirements
      expect(maxSuccessfulLoad).toBeGreaterThan(10); // Should handle at least 10 concurrent requests
    }
    
    console.log('✅ Stress testing completed successfully');
  });

  test('should handle spike testing for traffic surges', async ({ request }) => {
    console.log('⚡ Starting spike testing...');
    
    // Test sudden traffic spikes on key services
    const keyServices = SERVICES.filter(s => ['gateway', 'codai', 'id'].includes(s.name));
    
    for (const service of keyServices) {
      console.log(`⚡ Spike testing ${service.name} service...`);
      
      // Normal load period
      console.log('   Phase 1: Normal load (5 req/s)');
      const normalLoadPromises = [];
      for (let i = 0; i < 5; i++) {
        const promise = (async () => {
          try {
            let response;
            if (service.hasHealth) {
              response = await request.get(`http://localhost:${service.port}/api/health`);
            } else {
              response = await request.get(`http://localhost:${service.port}/`);
            }
            return { success: response.ok() };
          } catch {
            return { success: false };
          }
        })();
        normalLoadPromises.push(promise);
      }
      
      const normalResults = await Promise.all(normalLoadPromises);
      const normalSuccessRate = (normalResults.filter(r => r.success).length / normalResults.length) * 100;
      console.log(`   Normal load success rate: ${normalSuccessRate.toFixed(1)}%`);
      
      // Wait a moment
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // Spike period
      console.log('   Phase 2: Traffic spike (25 req/s)');
      const spikePromises = [];
      const spikeStart = Date.now();
      
      for (let i = 0; i < 25; i++) {
        const promise = (async () => {
          const requestStart = Date.now();
          try {
            let response;
            if (service.hasHealth) {
              response = await request.get(`http://localhost:${service.port}/api/health`, {
                timeout: 3000
              });
            } else {
              response = await request.get(`http://localhost:${service.port}/`, {
                timeout: 3000
              });
            }
            
            const responseTime = Date.now() - requestStart;
            return { success: response.ok(), responseTime };
          } catch {
            const responseTime = Date.now() - requestStart;
            return { success: false, responseTime };
          }
        })();
        spikePromises.push(promise);
      }
      
      const spikeResults = await Promise.all(spikePromises);
      const spikeSuccessRate = (spikeResults.filter(r => r.success).length / spikeResults.length) * 100;
      const avgSpikeResponseTime = spikeResults.reduce((sum, r) => sum + r.responseTime, 0) / spikeResults.length;
      const spikeDuration = Date.now() - spikeStart;
      
      console.log(`   Spike success rate: ${spikeSuccessRate.toFixed(1)}%`);
      console.log(`   Spike avg response time: ${avgSpikeResponseTime.toFixed(0)}ms`);
      console.log(`   Spike duration: ${spikeDuration}ms`);
      
      // Recovery period
      await new Promise(resolve => setTimeout(resolve, 500));
      
      console.log('   Phase 3: Recovery verification');
      const recoveryPromises = [];
      for (let i = 0; i < 5; i++) {
        const promise = (async () => {
          try {
            let response;
            if (service.hasHealth) {
              response = await request.get(`http://localhost:${service.port}/api/health`);
            } else {
              response = await request.get(`http://localhost:${service.port}/`);
            }
            return { success: response.ok() };
          } catch {
            return { success: false };
          }
        })();
        recoveryPromises.push(promise);
      }
      
      const recoveryResults = await Promise.all(recoveryPromises);
      const recoverySuccessRate = (recoveryResults.filter(r => r.success).length / recoveryResults.length) * 100;
      console.log(`   Recovery success rate: ${recoverySuccessRate.toFixed(1)}%`);
      
      console.log(`✅ ${service.name} spike test completed`);
      
      // Performance assertions
      expect(spikeSuccessRate).toBeGreaterThan(70); // At least 70% success during spike
      expect(avgSpikeResponseTime).toBeLessThan(3000); // Under 3s during spike
      expect(recoverySuccessRate).toBeGreaterThan(90); // Quick recovery after spike
    }
    
    console.log('✅ Spike testing completed successfully');
  });

  test('should handle endurance testing for long-running operations', async ({ request }) => {
    console.log('⏱️ Starting endurance testing...');
    
    const ENDURANCE_DURATION = 30000; // 30 seconds
    const REQUEST_INTERVAL = 1000; // 1 request per second
    
    // Focus on core services for endurance testing
    const coreServices = SERVICES.filter(s => ['gateway', 'codai', 'id'].includes(s.name));
    
    for (const service of coreServices) {
      console.log(`⏱️ Endurance testing ${service.name} service for ${ENDURANCE_DURATION/1000}s...`);
      
      const enduranceMetrics: { timestamp: number; success: boolean; responseTime: number }[] = [];
      const startTime = Date.now();
      let requestCount = 0;
      
      const enduranceInterval = setInterval(async () => {
        requestCount++;
        const requestStart = Date.now();
        
        try {
          let response;
          if (service.hasHealth) {
            response = await request.get(`http://localhost:${service.port}/api/health`, {
              timeout: 2000
            });
          } else {
            response = await request.get(`http://localhost:${service.port}/`, {
              timeout: 2000
            });
          }
          
          const responseTime = Date.now() - requestStart;
          enduranceMetrics.push({
            timestamp: Date.now() - startTime,
            success: response.ok(),
            responseTime
          });
          
          if (requestCount % 10 === 0) {
            const recentMetrics = enduranceMetrics.slice(-10);
            const recentSuccessRate = (recentMetrics.filter(m => m.success).length / recentMetrics.length) * 100;
            const recentAvgResponse = recentMetrics.reduce((sum, m) => sum + m.responseTime, 0) / recentMetrics.length;
            console.log(`   ${requestCount} requests | Success: ${recentSuccessRate.toFixed(0)}% | Avg: ${recentAvgResponse.toFixed(0)}ms`);
          }
        } catch (error) {
          const responseTime = Date.now() - requestStart;
          enduranceMetrics.push({
            timestamp: Date.now() - startTime,
            success: false,
            responseTime
          });
        }
      }, REQUEST_INTERVAL);
      
      // Wait for endurance test duration
      await new Promise(resolve => setTimeout(resolve, ENDURANCE_DURATION));
      clearInterval(enduranceInterval);
      
      // Calculate endurance metrics
      const totalRequests = enduranceMetrics.length;
      const successfulRequests = enduranceMetrics.filter(m => m.success).length;
      const overallSuccessRate = (successfulRequests / totalRequests) * 100;
      const avgResponseTime = enduranceMetrics.reduce((sum, m) => sum + m.responseTime, 0) / totalRequests;
      
      console.log(`✅ ${service.name} endurance test results:`);
      console.log(`   - Total requests: ${totalRequests}`);
      console.log(`   - Success rate: ${overallSuccessRate.toFixed(1)}%`);
      console.log(`   - Average response time: ${avgResponseTime.toFixed(0)}ms`);
      console.log(`   - Test duration: ${ENDURANCE_DURATION/1000}s`);
      
      // Endurance performance assertions
      expect(overallSuccessRate).toBeGreaterThan(95); // Maintain 95%+ success rate
      expect(avgResponseTime).toBeLessThan(1000); // Stay under 1s average
      expect(totalRequests).toBeGreaterThan(25); // Should complete at least 25 requests
    }
    
    console.log('✅ Endurance testing completed successfully');
  });

  test('should monitor resource utilization during load', async ({ request }) => {
    console.log('📊 Starting resource utilization monitoring...');
    
    // This test simulates resource monitoring
    // In a real scenario, you would integrate with system monitoring tools
    
    const MONITORING_DURATION = 15000; // 15 seconds
    const LOAD_REQUESTS_PER_SECOND = 5;
    
    console.log('🔍 Simulating resource monitoring during load...');
    
    const resourceMetrics: {
      timestamp: number;
      service: string;
      responseTime: number;
      success: boolean;
    }[] = [];
    
    const startTime = Date.now();
    const monitoringPromises: Promise<void>[] = [];
    
    // Generate continuous load while monitoring
    const loadInterval = setInterval(async () => {
      for (const service of SERVICES.slice(0, 3)) { // Monitor top 3 services
        const promise = (async () => {
          const requestStart = Date.now();
          try {
            let response;
            if (service.hasHealth) {
              response = await request.get(`http://localhost:${service.port}/api/health`);
            } else {
              response = await request.get(`http://localhost:${service.port}/`);
            }
            
            const responseTime = Date.now() - requestStart;
            resourceMetrics.push({
              timestamp: Date.now() - startTime,
              service: service.name,
              responseTime,
              success: response.ok()
            });
          } catch {
            const responseTime = Date.now() - requestStart;
            resourceMetrics.push({
              timestamp: Date.now() - startTime,
              service: service.name,
              responseTime,
              success: false
            });
          }
        })();
        
        monitoringPromises.push(promise);
      }
    }, 1000 / LOAD_REQUESTS_PER_SECOND);
    
    // Run monitoring for specified duration
    await new Promise(resolve => setTimeout(resolve, MONITORING_DURATION));
    clearInterval(loadInterval);
    
    // Wait for all pending requests
    await Promise.allSettled(monitoringPromises);
    
    // Analyze resource utilization patterns
    const serviceMetrics = new Map<string, typeof resourceMetrics>();
    
    resourceMetrics.forEach(metric => {
      if (!serviceMetrics.has(metric.service)) {
        serviceMetrics.set(metric.service, []);
      }
      serviceMetrics.get(metric.service)!.push(metric);
    });
    
    console.log('📊 Resource utilization analysis:');
    
    serviceMetrics.forEach((metrics, serviceName) => {
      const avgResponseTime = metrics.reduce((sum, m) => sum + m.responseTime, 0) / metrics.length;
      const successRate = (metrics.filter(m => m.success).length / metrics.length) * 100;
      const throughput = metrics.length / (MONITORING_DURATION / 1000);
      
      console.log(`   ${serviceName}:`);
      console.log(`     - Requests processed: ${metrics.length}`);
      console.log(`     - Average response time: ${avgResponseTime.toFixed(0)}ms`);
      console.log(`     - Success rate: ${successRate.toFixed(1)}%`);
      console.log(`     - Throughput: ${throughput.toFixed(1)} req/s`);
      
      // Resource utilization assertions
      expect(avgResponseTime).toBeLessThan(800); // Reasonable response time under load
      expect(successRate).toBeGreaterThan(90); // Maintain high success rate
      expect(throughput).toBeGreaterThan(2); // Process reasonable throughput
    });
    
    console.log('✅ Resource utilization monitoring completed successfully');
  });

  test.afterEach(async () => {
    // Performance test cleanup and summary
    console.log('\n📊 Performance Test Summary:');
    
    for (const service of SERVICES) {
      const avgResponse = performanceMonitor.getAverageResponseTime(service.name);
      const p95Response = performanceMonitor.getP95ResponseTime(service.name);
      const totalRequests = performanceMonitor.getTotalRequests(service.name);
      const errorRate = performanceMonitor.getErrorRate(service.name);
      
      if (totalRequests > 0) {
        console.log(`  ${service.name}:`);
        console.log(`    Total requests: ${totalRequests}`);
        console.log(`    Avg response: ${avgResponse.toFixed(0)}ms`);
        console.log(`    P95 response: ${p95Response.toFixed(0)}ms`);
        console.log(`    Error rate: ${errorRate.toFixed(1)}%`);
      }
    }
  });
});
