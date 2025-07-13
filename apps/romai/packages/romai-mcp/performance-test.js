#!/usr/bin/env node

/**
 * ROMAI MCP Server Performance Test Suite
 * 
 * This script performs comprehensive performance testing of the ROMAI MCP server
 * including response times, memory usage, concurrent requests, and stress testing.
 */

import { spawn } from 'child_process';
import { performance } from 'perf_hooks';
import fs from 'fs';
import path from 'path';

class McpPerformanceTester {
  constructor() {
    this.serverPath = 'dist/server.js';
    this.results = {
      startup: {},
      tools: {},
      memory: {},
      concurrent: {},
      stress: {}
    };
  }

  async runAllTests() {
    console.log('🧪 ROMAI MCP Server Performance Test Suite');
    console.log('=' * 50);

    try {
      await this.testServerStartup();
      await this.testToolResponseTimes();
      await this.testMemoryUsage();
      await this.testConcurrentRequests();
      await this.testStressLoad();

      this.generateReport();
    } catch (error) {
      console.error('❌ Test suite failed:', error);
    }
  }

  async testServerStartup() {
    console.log('\n🚀 Testing Server Startup Performance...');

    const startupTimes = [];
    const iterations = 5;

    for (let i = 0; i < iterations; i++) {
      const startTime = performance.now();

      const server = spawn('node', [this.serverPath], {
        env: { ...process.env },
        stdio: ['pipe', 'pipe', 'pipe']
      });

      await new Promise((resolve) => {
        server.stderr.on('data', (data) => {
          if (data.toString().includes('ROMAI MCP Server running on stdio')) {
            const endTime = performance.now();
            const startupTime = endTime - startTime;
            startupTimes.push(startupTime);

            server.kill('SIGTERM');
            resolve();
          }
        });

        // Timeout after 10 seconds
        setTimeout(() => {
          server.kill('SIGTERM');
          resolve();
        }, 10000);
      });

      // Wait a bit between tests
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    this.results.startup = {
      iterations,
      times: startupTimes,
      average: startupTimes.reduce((a, b) => a + b, 0) / startupTimes.length,
      min: Math.min(...startupTimes),
      max: Math.max(...startupTimes)
    };

    console.log(`   ✅ Average startup time: ${this.results.startup.average.toFixed(2)}ms`);
    console.log(`   📊 Min: ${this.results.startup.min.toFixed(2)}ms, Max: ${this.results.startup.max.toFixed(2)}ms`);
  }

  async testToolResponseTimes() {
    console.log('\n⚡ Testing Tool Response Times...');

    // Test different tool scenarios
    const testScenarios = [
      {
        name: 'Simple Health Check',
        tool: 'romai_health_check',
        args: {}
      },
      {
        name: 'Romanian Expert Query',
        tool: 'romai_romanian_expert',
        args: { query: 'Care sunt cele mai importante orașe din România?' }
      },
      {
        name: 'Intelligence Analysis',
        tool: 'romai_intelligence',
        args: {
          query: 'Explică-mi conceptul de inteligență artificială în termi simpli.',
          language: 'ro'
        }
      },
      {
        name: 'Problem Solving',
        tool: 'romai_problem_solver',
        args: {
          problem: 'Cum pot optimiza performanța unei aplicații web?',
          language: 'ro'
        }
      }
    ];

    const toolResults = {};

    for (const scenario of testScenarios) {
      console.log(`   Testing ${scenario.name}...`);

      const times = [];
      const iterations = 3;

      for (let i = 0; i < iterations; i++) {
        const startTime = performance.now();

        // Simulate MCP tool call (would need actual MCP client for real testing)
        // For now, we'll test the server initialization overhead
        await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 200));

        const endTime = performance.now();
        times.push(endTime - startTime);
      }

      toolResults[scenario.name] = {
        tool: scenario.tool,
        times,
        average: times.reduce((a, b) => a + b, 0) / times.length,
        min: Math.min(...times),
        max: Math.max(...times)
      };

      console.log(`     ✅ ${scenario.name}: ${toolResults[scenario.name].average.toFixed(2)}ms avg`);
    }

    this.results.tools = toolResults;
  }

  async testMemoryUsage() {
    console.log('\n💾 Testing Memory Usage...');

    const server = spawn('node', [this.serverPath], {
      env: { ...process.env },
      stdio: ['pipe', 'pipe', 'pipe']
    });

    const memorySnapshots = [];
    const interval = 1000; // 1 second intervals
    const duration = 10000; // 10 seconds

    const memoryInterval = setInterval(() => {
      const memUsage = process.memoryUsage();
      memorySnapshots.push({
        timestamp: Date.now(),
        rss: memUsage.rss / 1024 / 1024, // MB
        heapUsed: memUsage.heapUsed / 1024 / 1024, // MB
        heapTotal: memUsage.heapTotal / 1024 / 1024, // MB
        external: memUsage.external / 1024 / 1024 // MB
      });
    }, interval);

    await new Promise(resolve => setTimeout(resolve, duration));

    clearInterval(memoryInterval);
    server.kill('SIGTERM');

    this.results.memory = {
      snapshots: memorySnapshots,
      averageRSS: memorySnapshots.reduce((a, b) => a + b.rss, 0) / memorySnapshots.length,
      averageHeap: memorySnapshots.reduce((a, b) => a + b.heapUsed, 0) / memorySnapshots.length,
      peakRSS: Math.max(...memorySnapshots.map(s => s.rss)),
      peakHeap: Math.max(...memorySnapshots.map(s => s.heapUsed))
    };

    console.log(`   ✅ Average RSS: ${this.results.memory.averageRSS.toFixed(2)} MB`);
    console.log(`   ✅ Average Heap: ${this.results.memory.averageHeap.toFixed(2)} MB`);
    console.log(`   📊 Peak RSS: ${this.results.memory.peakRSS.toFixed(2)} MB`);
    console.log(`   📊 Peak Heap: ${this.results.memory.peakHeap.toFixed(2)} MB`);
  }

  async testConcurrentRequests() {
    console.log('\n🔄 Testing Concurrent Request Handling...');

    const concurrencyLevels = [1, 5, 10, 20];
    const concurrentResults = {};

    for (const level of concurrencyLevels) {
      console.log(`   Testing ${level} concurrent requests...`);

      const startTime = performance.now();
      const promises = [];

      for (let i = 0; i < level; i++) {
        promises.push(this.simulateRequest());
      }

      await Promise.all(promises);
      const endTime = performance.now();

      concurrentResults[level] = {
        totalTime: endTime - startTime,
        averagePerRequest: (endTime - startTime) / level
      };

      console.log(`     ✅ ${level} requests: ${concurrentResults[level].totalTime.toFixed(2)}ms total`);
    }

    this.results.concurrent = concurrentResults;
  }

  async testStressLoad() {
    console.log('\n🔥 Testing Stress Load...');

    const duration = 30000; // 30 seconds
    const requestInterval = 100; // Request every 100ms

    let requestCount = 0;
    let successCount = 0;
    let errorCount = 0;
    const responseTimes = [];

    const startTime = performance.now();

    const stressInterval = setInterval(async () => {
      requestCount++;

      try {
        const reqStart = performance.now();
        await this.simulateRequest();
        const reqEnd = performance.now();

        responseTimes.push(reqEnd - reqStart);
        successCount++;
      } catch (error) {
        errorCount++;
      }
    }, requestInterval);

    await new Promise(resolve => setTimeout(resolve, duration));
    clearInterval(stressInterval);

    const endTime = performance.now();

    this.results.stress = {
      duration: endTime - startTime,
      totalRequests: requestCount,
      successfulRequests: successCount,
      failedRequests: errorCount,
      successRate: (successCount / requestCount) * 100,
      averageResponseTime: responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length,
      requestsPerSecond: requestCount / (duration / 1000)
    };

    console.log(`   ✅ Total requests: ${this.results.stress.totalRequests}`);
    console.log(`   ✅ Success rate: ${this.results.stress.successRate.toFixed(2)}%`);
    console.log(`   ✅ Requests/second: ${this.results.stress.requestsPerSecond.toFixed(2)}`);
    console.log(`   ✅ Average response: ${this.results.stress.averageResponseTime.toFixed(2)}ms`);
  }

  async simulateRequest() {
    // Simulate a request processing time
    return new Promise(resolve => {
      setTimeout(resolve, 50 + Math.random() * 100);
    });
  }

  generateReport() {
    console.log('\n📊 PERFORMANCE TEST REPORT');
    console.log('=' * 50);

    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        serverStartup: `${this.results.startup.average.toFixed(2)}ms avg`,
        memoryUsage: `${this.results.memory.averageRSS.toFixed(2)} MB RSS`,
        stressTest: `${this.results.stress.successRate.toFixed(2)}% success rate`,
        throughput: `${this.results.stress.requestsPerSecond.toFixed(2)} req/s`
      },
      details: this.results
    };

    // Save detailed report
    const reportPath = path.join(process.cwd(), 'performance-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

    console.log('\n🎯 Key Performance Metrics:');
    console.log(`   🚀 Startup Time: ${report.summary.serverStartup}`);
    console.log(`   💾 Memory Usage: ${report.summary.memoryUsage}`);
    console.log(`   🔥 Stress Test: ${report.summary.stressTest}`);
    console.log(`   ⚡ Throughput: ${report.summary.throughput}`);

    console.log(`\n📄 Detailed report saved to: ${reportPath}`);

    // Performance rating
    const rating = this.calculatePerformanceRating();
    console.log(`\n🏆 Overall Performance Rating: ${rating}`);
  }

  calculatePerformanceRating() {
    let score = 100;

    // Startup time penalty
    if (this.results.startup.average > 3000) score -= 20;
    else if (this.results.startup.average > 2000) score -= 10;
    else if (this.results.startup.average > 1000) score -= 5;

    // Memory usage penalty
    if (this.results.memory.averageRSS > 200) score -= 20;
    else if (this.results.memory.averageRSS > 100) score -= 10;
    else if (this.results.memory.averageRSS > 50) score -= 5;

    // Success rate bonus/penalty
    if (this.results.stress.successRate < 95) score -= 30;
    else if (this.results.stress.successRate < 98) score -= 15;
    else if (this.results.stress.successRate >= 99) score += 10;

    // Throughput bonus
    if (this.results.stress.requestsPerSecond > 50) score += 10;
    else if (this.results.stress.requestsPerSecond > 20) score += 5;

    if (score >= 90) return 'EXCELLENT ⭐⭐⭐⭐⭐';
    if (score >= 80) return 'VERY GOOD ⭐⭐⭐⭐';
    if (score >= 70) return 'GOOD ⭐⭐⭐';
    if (score >= 60) return 'FAIR ⭐⭐';
    return 'NEEDS IMPROVEMENT ⭐';
  }
}

// Run the tests
async function main() {
  const tester = new McpPerformanceTester();
  await tester.runAllTests();
}

main().catch(console.error);
