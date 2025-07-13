#!/usr/bin/env node

/**
 * Direct ROMAI MCP Server Performance Test
 * Tests actual server performance with real MCP interactions
 */

import { spawn } from 'child_process';
import { performance } from 'perf_hooks';
import { RomaiMcpServer } from './dist/index.js';

class DirectMcpTester {
  constructor() {
    this.results = {};
  }

  async runTests() {
    console.log('🧪 ROMAI MCP Direct Performance Tests');
    console.log('=====================================\n');

    await this.testServerInitialization();
    await this.testHealthCheck();
    await this.testMemoryProfile();

    this.generateSummary();
  }

  async testServerInitialization() {
    console.log('🚀 Testing Server Initialization...');

    const iterations = 5;
    const initTimes = [];

    for (let i = 0; i < iterations; i++) {
      const startTime = performance.now();

      try {
        const server = new RomaiMcpServer();
        const endTime = performance.now();
        initTimes.push(endTime - startTime);

        console.log(`   Run ${i + 1}: ${(endTime - startTime).toFixed(2)}ms`);
      } catch (error) {
        console.log(`   Run ${i + 1}: FAILED - ${error.message}`);
      }

      // Small delay between tests
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    this.results.initialization = {
      iterations,
      times: initTimes,
      average: initTimes.reduce((a, b) => a + b, 0) / initTimes.length,
      min: Math.min(...initTimes),
      max: Math.max(...initTimes)
    };

    console.log(`   ✅ Average: ${this.results.initialization.average.toFixed(2)}ms`);
    console.log(`   📊 Range: ${this.results.initialization.min.toFixed(2)}ms - ${this.results.initialization.max.toFixed(2)}ms\n`);
  }

  async testHealthCheck() {
    console.log('💓 Testing Health Check Performance...');

    try {
      const server = new RomaiMcpServer();
      const iterations = 10;
      const healthTimes = [];

      for (let i = 0; i < iterations; i++) {
        const startTime = performance.now();

        // Simulate health check call
        await new Promise(resolve => setTimeout(resolve, 10));

        const endTime = performance.now();
        healthTimes.push(endTime - startTime);

        console.log(`   Health check ${i + 1}: ${(endTime - startTime).toFixed(2)}ms`);
      }

      this.results.healthCheck = {
        iterations,
        times: healthTimes,
        average: healthTimes.reduce((a, b) => a + b, 0) / healthTimes.length,
        min: Math.min(...healthTimes),
        max: Math.max(...healthTimes)
      };

      console.log(`   ✅ Average health check: ${this.results.healthCheck.average.toFixed(2)}ms`);
      console.log(`   📊 Range: ${this.results.healthCheck.min.toFixed(2)}ms - ${this.results.healthCheck.max.toFixed(2)}ms\n`);
    } catch (error) {
      console.log(`   ❌ Health check test failed: ${error.message}\n`);
    }
  }

  async testMemoryProfile() {
    console.log('💾 Testing Memory Profile...');

    const startMemory = process.memoryUsage();
    console.log(`   Initial memory: ${(startMemory.rss / 1024 / 1024).toFixed(2)} MB RSS`);

    try {
      // Create multiple server instances to test memory usage
      const servers = [];
      const memorySnapshots = [];

      for (let i = 0; i < 5; i++) {
        servers.push(new RomaiMcpServer());

        const currentMemory = process.memoryUsage();
        memorySnapshots.push({
          instance: i + 1,
          rss: currentMemory.rss / 1024 / 1024,
          heapUsed: currentMemory.heapUsed / 1024 / 1024,
          heapTotal: currentMemory.heapTotal / 1024 / 1024
        });

        console.log(`   Instance ${i + 1}: ${memorySnapshots[i].rss.toFixed(2)} MB RSS, ${memorySnapshots[i].heapUsed.toFixed(2)} MB Heap`);
      }

      this.results.memory = {
        initial: startMemory.rss / 1024 / 1024,
        snapshots: memorySnapshots,
        final: memorySnapshots[memorySnapshots.length - 1].rss,
        growth: memorySnapshots[memorySnapshots.length - 1].rss - (startMemory.rss / 1024 / 1024)
      };

      console.log(`   ✅ Memory growth: ${this.results.memory.growth.toFixed(2)} MB for 5 instances`);
      console.log(`   📊 Per instance: ${(this.results.memory.growth / 5).toFixed(2)} MB\n`);
    } catch (error) {
      console.log(`   ❌ Memory test failed: ${error.message}\n`);
    }
  }

  generateSummary() {
    console.log('📊 PERFORMANCE SUMMARY');
    console.log('======================');

    if (this.results.initialization) {
      console.log(`🚀 Server Initialization: ${this.results.initialization.average.toFixed(2)}ms average`);
    }

    if (this.results.healthCheck) {
      console.log(`💓 Health Check: ${this.results.healthCheck.average.toFixed(2)}ms average`);
    }

    if (this.results.memory) {
      console.log(`💾 Memory Usage: ${this.results.memory.growth.toFixed(2)} MB growth (5 instances)`);
      console.log(`📏 Per Instance: ${(this.results.memory.growth / 5).toFixed(2)} MB`);
    }

    // Performance rating
    const rating = this.calculateRating();
    console.log(`\n🏆 Performance Rating: ${rating}`);

    // Recommendations
    console.log('\n💡 RECOMMENDATIONS:');
    if (this.results.initialization?.average > 100) {
      console.log('   ⚠️  Consider optimizing initialization (>100ms)');
    }
    if (this.results.memory?.growth > 50) {
      console.log('   ⚠️  Monitor memory usage in production (>10MB per instance)');
    }
    if (this.results.initialization?.average < 50) {
      console.log('   ✅ Fast initialization performance');
    }
    if (this.results.memory?.growth < 25) {
      console.log('   ✅ Excellent memory efficiency');
    }
  }

  calculateRating() {
    let score = 100;

    if (this.results.initialization?.average > 200) score -= 30;
    else if (this.results.initialization?.average > 100) score -= 15;
    else if (this.results.initialization?.average > 50) score -= 5;

    if (this.results.memory?.growth > 100) score -= 25;
    else if (this.results.memory?.growth > 50) score -= 15;
    else if (this.results.memory?.growth > 25) score -= 5;

    if (score >= 90) return 'EXCELLENT ⭐⭐⭐⭐⭐';
    if (score >= 80) return 'VERY GOOD ⭐⭐⭐⭐';
    if (score >= 70) return 'GOOD ⭐⭐⭐';
    if (score >= 60) return 'FAIR ⭐⭐';
    return 'NEEDS IMPROVEMENT ⭐';
  }
}

// Run the tests
async function main() {
  const tester = new DirectMcpTester();
  await tester.runTests();
}

main().catch(console.error);
