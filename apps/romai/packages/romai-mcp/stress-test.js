#!/usr/bin/env node

/**
 * ROMAI MCP Server Stress Test
 * Tests actual server process performance
 */

import { spawn } from 'child_process';
import { performance } from 'perf_hooks';
import os from 'os';

class McpStressTester {
  constructor() {
    this.serverPath = './dist/server.js';
    this.results = {};
  }

  async runStressTests() {
    console.log('🔥 ROMAI MCP Server Stress Tests');
    console.log('===============================\n');

    console.log('🖥️  System Info:');
    console.log(`   OS: ${os.type()} ${os.release()}`);
    console.log(`   CPU: ${os.cpus()[0].model} (${os.cpus().length} cores)`);
    console.log(`   Memory: ${(os.totalmem() / 1024 / 1024 / 1024).toFixed(2)} GB total\n`);

    await this.testServerStartupTime();
    await this.testServerStability();
    await this.testResourceUsage();

    this.generateStressReport();
  }

  async testServerStartupTime() {
    console.log('⏱️  Testing Server Startup Time...');

    const iterations = 10;
    const startupTimes = [];
    const memoryUsages = [];

    for (let i = 0; i < iterations; i++) {
      console.log(`   Starting server instance ${i + 1}/${iterations}...`);

      const startTime = performance.now();
      const startMemory = process.memoryUsage().rss;

      const server = spawn('node', [this.serverPath], {
        env: {
          ...process.env,
          AZURE_OPENAI_API_KEY: 'test-key',
          AZURE_OPENAI_ENDPOINT: 'https://test.openai.azure.com/',
          NODE_ENV: 'test'
        },
        stdio: ['pipe', 'pipe', 'pipe']
      });

      let serverReady = false;
      let startupTime = 0;

      await new Promise((resolve) => {
        const timeout = setTimeout(() => {
          console.log(`     ⚠️  Timeout after 15 seconds`);
          server.kill('SIGTERM');
          startupTimes.push(15000); // 15 second timeout
          resolve();
        }, 15000);

        server.stderr.on('data', (data) => {
          const output = data.toString();
          if (output.includes('ROMAI MCP Server running on stdio') && !serverReady) {
            serverReady = true;
            const endTime = performance.now();
            startupTime = endTime - startTime;
            startupTimes.push(startupTime);

            const endMemory = process.memoryUsage().rss;
            memoryUsages.push((endMemory - startMemory) / 1024 / 1024); // MB

            console.log(`     ✅ Started in ${startupTime.toFixed(2)}ms`);

            clearTimeout(timeout);
            server.kill('SIGTERM');
            resolve();
          }
        });

        server.on('error', (error) => {
          console.log(`     ❌ Failed to start: ${error.message}`);
          clearTimeout(timeout);
          resolve();
        });
      });

      // Wait between iterations
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    this.results.startup = {
      iterations,
      times: startupTimes,
      average: startupTimes.reduce((a, b) => a + b, 0) / startupTimes.length,
      min: Math.min(...startupTimes),
      max: Math.max(...startupTimes),
      memoryUsages,
      avgMemory: memoryUsages.reduce((a, b) => a + b, 0) / memoryUsages.length
    };

    console.log(`   📊 Startup Results:`);
    console.log(`      Average: ${this.results.startup.average.toFixed(2)}ms`);
    console.log(`      Range: ${this.results.startup.min.toFixed(2)}ms - ${this.results.startup.max.toFixed(2)}ms`);
    console.log(`      Memory: ${this.results.startup.avgMemory.toFixed(2)} MB average\n`);
  }

  async testServerStability() {
    console.log('🔒 Testing Server Stability (60 second run)...');

    const server = spawn('node', [this.serverPath], {
      env: {
        ...process.env,
        AZURE_OPENAI_API_KEY: 'test-key',
        AZURE_OPENAI_ENDPOINT: 'https://test.openai.azure.com/',
        NODE_ENV: 'test'
      },
      stdio: ['pipe', 'pipe', 'pipe']
    });

    let isRunning = true;
    let uptime = 0;
    const memorySnapshots = [];
    const errors = [];

    server.on('error', (error) => {
      errors.push({ time: Date.now(), error: error.message });
      console.log(`   ❌ Server error: ${error.message}`);
    });

    server.on('exit', (code) => {
      isRunning = false;
      console.log(`   ⚠️  Server exited with code: ${code}`);
    });

    server.stderr.on('data', (data) => {
      const output = data.toString();
      if (output.includes('error') || output.includes('Error')) {
        errors.push({ time: Date.now(), error: output.trim() });
      }
    });

    // Monitor for 60 seconds
    const monitoringDuration = 60000;
    const startTime = Date.now();
    const monitorInterval = setInterval(() => {
      if (isRunning) {
        uptime = Date.now() - startTime;
        const memUsage = process.memoryUsage();
        memorySnapshots.push({
          time: uptime,
          rss: memUsage.rss / 1024 / 1024,
          heapUsed: memUsage.heapUsed / 1024 / 1024
        });

        // Progress indicator
        const progress = Math.floor((uptime / monitoringDuration) * 10);
        const progressBar = '█'.repeat(progress) + '░'.repeat(10 - progress);
        process.stdout.write(`\r   ${progressBar} ${Math.floor(uptime / 1000)}s / 60s`);
      }
    }, 1000);

    await new Promise(resolve => setTimeout(resolve, monitoringDuration));
    clearInterval(monitorInterval);

    if (isRunning) {
      server.kill('SIGTERM');
    }

    console.log('\n');

    this.results.stability = {
      duration: uptime,
      targetDuration: monitoringDuration,
      uptime: uptime / monitoringDuration * 100,
      errors: errors.length,
      errorDetails: errors,
      memorySnapshots,
      avgMemory: memorySnapshots.reduce((a, b) => a + b.rss, 0) / memorySnapshots.length,
      memoryGrowth: memorySnapshots.length > 0 ?
        memorySnapshots[memorySnapshots.length - 1].rss - memorySnapshots[0].rss : 0
    };

    console.log(`   📊 Stability Results:`);
    console.log(`      Uptime: ${this.results.stability.uptime.toFixed(2)}%`);
    console.log(`      Errors: ${this.results.stability.errors}`);
    console.log(`      Memory Growth: ${this.results.stability.memoryGrowth.toFixed(2)} MB`);
    console.log(`      Average Memory: ${this.results.stability.avgMemory.toFixed(2)} MB\n`);
  }

  async testResourceUsage() {
    console.log('📈 Testing Resource Usage Under Load...');

    // Start server
    const server = spawn('node', [this.serverPath], {
      env: {
        ...process.env,
        AZURE_OPENAI_API_KEY: 'test-key',
        AZURE_OPENAI_ENDPOINT: 'https://test.openai.azure.com/',
        NODE_ENV: 'test'
      },
      stdio: ['pipe', 'pipe', 'pipe']
    });

    // Wait for server to start
    await new Promise((resolve) => {
      server.stderr.on('data', (data) => {
        if (data.toString().includes('ROMAI MCP Server running on stdio')) {
          resolve();
        }
      });
    });

    console.log('   📊 Monitoring resource usage for 30 seconds...');

    const resourceSnapshots = [];
    const loadDuration = 30000;
    const snapshotInterval = 1000;

    const resourceInterval = setInterval(() => {
      const memUsage = process.memoryUsage();
      const cpuUsage = process.cpuUsage();

      resourceSnapshots.push({
        timestamp: Date.now(),
        memory: {
          rss: memUsage.rss / 1024 / 1024,
          heapUsed: memUsage.heapUsed / 1024 / 1024,
          heapTotal: memUsage.heapTotal / 1024 / 1024,
          external: memUsage.external / 1024 / 1024
        },
        cpu: {
          user: cpuUsage.user,
          system: cpuUsage.system
        }
      });

      const elapsed = resourceSnapshots.length;
      process.stdout.write(`\r   Snapshot ${elapsed}/30...`);
    }, snapshotInterval);

    await new Promise(resolve => setTimeout(resolve, loadDuration));
    clearInterval(resourceInterval);

    server.kill('SIGTERM');
    console.log('\n');

    this.results.resources = {
      duration: loadDuration,
      snapshots: resourceSnapshots,
      peakMemory: Math.max(...resourceSnapshots.map(s => s.memory.rss)),
      avgMemory: resourceSnapshots.reduce((a, b) => a + b.memory.rss, 0) / resourceSnapshots.length,
      memoryStability: this.calculateMemoryStability(resourceSnapshots)
    };

    console.log(`   📊 Resource Results:`);
    console.log(`      Peak Memory: ${this.results.resources.peakMemory.toFixed(2)} MB`);
    console.log(`      Average Memory: ${this.results.resources.avgMemory.toFixed(2)} MB`);
    console.log(`      Memory Stability: ${this.results.resources.memoryStability.toFixed(2)}%\n`);
  }

  calculateMemoryStability(snapshots) {
    if (snapshots.length < 2) return 100;

    const memoryValues = snapshots.map(s => s.memory.rss);
    const mean = memoryValues.reduce((a, b) => a + b, 0) / memoryValues.length;
    const variance = memoryValues.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / memoryValues.length;
    const stdDev = Math.sqrt(variance);

    // Stability percentage (lower standard deviation = higher stability)
    const stabilityRatio = 1 - (stdDev / mean);
    return Math.max(0, Math.min(100, stabilityRatio * 100));
  }

  generateStressReport() {
    console.log('🏆 STRESS TEST SUMMARY');
    console.log('=====================');

    // Overall performance score
    let score = 100;

    if (this.results.startup) {
      console.log(`🚀 Startup Performance:`);
      console.log(`   Average: ${this.results.startup.average.toFixed(2)}ms`);
      console.log(`   Memory: ${this.results.startup.avgMemory.toFixed(2)} MB`);

      if (this.results.startup.average > 5000) score -= 30;
      else if (this.results.startup.average > 3000) score -= 20;
      else if (this.results.startup.average > 2000) score -= 10;
      else if (this.results.startup.average < 1000) score += 10;
    }

    if (this.results.stability) {
      console.log(`\n🔒 Stability:`);
      console.log(`   Uptime: ${this.results.stability.uptime.toFixed(2)}%`);
      console.log(`   Errors: ${this.results.stability.errors}`);
      console.log(`   Memory Growth: ${this.results.stability.memoryGrowth.toFixed(2)} MB`);

      if (this.results.stability.uptime < 95) score -= 40;
      else if (this.results.stability.uptime < 98) score -= 20;
      else if (this.results.stability.uptime >= 99.5) score += 15;

      if (this.results.stability.errors > 5) score -= 25;
      else if (this.results.stability.errors > 2) score -= 10;
      else if (this.results.stability.errors === 0) score += 10;
    }

    if (this.results.resources) {
      console.log(`\n📈 Resource Usage:`);
      console.log(`   Peak Memory: ${this.results.resources.peakMemory.toFixed(2)} MB`);
      console.log(`   Memory Stability: ${this.results.resources.memoryStability.toFixed(2)}%`);

      if (this.results.resources.peakMemory > 500) score -= 20;
      else if (this.results.resources.peakMemory > 200) score -= 10;
      else if (this.results.resources.peakMemory < 100) score += 10;
    }

    // Final rating
    let rating;
    if (score >= 90) rating = 'EXCELLENT ⭐⭐⭐⭐⭐';
    else if (score >= 80) rating = 'VERY GOOD ⭐⭐⭐⭐';
    else if (score >= 70) rating = 'GOOD ⭐⭐⭐';
    else if (score >= 60) rating = 'FAIR ⭐⭐';
    else rating = 'NEEDS IMPROVEMENT ⭐';

    console.log(`\n🏆 Overall Performance Score: ${score}/100`);
    console.log(`🎯 Rating: ${rating}`);

    // Save detailed results
    const fs = await import('fs');
    const reportData = {
      timestamp: new Date().toISOString(),
      systemInfo: {
        os: `${os.type()} ${os.release()}`,
        cpu: os.cpus()[0].model,
        cores: os.cpus().length,
        totalMemory: (os.totalmem() / 1024 / 1024 / 1024).toFixed(2) + ' GB'
      },
      score,
      rating,
      results: this.results
    };

    fs.default.writeFileSync('mcp-stress-test-results.json', JSON.stringify(reportData, null, 2));
    console.log('\n📄 Detailed results saved to: mcp-stress-test-results.json');
  }
}

// Run the stress tests
async function main() {
  const tester = new McpStressTester();
  await tester.runStressTests();
}

main().catch(console.error);
