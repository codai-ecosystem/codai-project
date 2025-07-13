import { spawn } from 'child_process';
import { performance } from 'perf_hooks';
import os from 'os';
import fs from 'fs';

/**
 * Simple MCP Performance Test
 */

console.log('🧪 ROMAI MCP Server Performance Test');
console.log('===================================\n');

console.log('🖥️  System Information:');
console.log(`   OS: ${os.type()} ${os.release()}`);
console.log(`   CPU: ${os.cpus()[0].model}`);
console.log(`   Cores: ${os.cpus().length}`);
console.log(`   Memory: ${(os.totalmem() / 1024 / 1024 / 1024).toFixed(2)} GB\n`);

async function testServerStartup() {
  console.log('⏱️  Testing Server Startup Performance...');

  const results = [];
  const iterations = 5;

  for (let i = 0; i < iterations; i++) {
    console.log(`   Test ${i + 1}/${iterations}...`);

    const startTime = performance.now();

    const server = spawn('node', ['./dist/server.js'], {
      env: {
        ...process.env,
        AZURE_OPENAI_API_KEY: process.env.AZURE_OPENAI_API_KEY || 'your-azure-openai-api-key',
        AZURE_OPENAI_ENDPOINT: process.env.AZURE_OPENAI_ENDPOINT || 'https://your-endpoint.openai.azure.com/',
        AZURE_OPENAI_DEPLOYMENT_NAME: process.env.AZURE_OPENAI_DEPLOYMENT_NAME || 'gpt-4o',
        NODE_ENV: 'production'
      },
      stdio: ['pipe', 'pipe', 'pipe']
    });

    let startupTime = null;

    await new Promise((resolve) => {
      const timeout = setTimeout(() => {
        console.log(`     ⚠️  Timeout (server did not start within 10s)`);
        server.kill('SIGTERM');
        results.push({ success: false, time: 10000, error: 'timeout' });
        resolve();
      }, 10000);

      server.stderr.on('data', (data) => {
        const output = data.toString();
        if (output.includes('ROMAI MCP Server running on stdio')) {
          const endTime = performance.now();
          startupTime = endTime - startTime;
          results.push({ success: true, time: startupTime });

          console.log(`     ✅ Started in ${startupTime.toFixed(2)}ms`);

          clearTimeout(timeout);
          server.kill('SIGTERM');
          resolve();
        }
      });

      server.on('error', (error) => {
        console.log(`     ❌ Failed: ${error.message}`);
        clearTimeout(timeout);
        results.push({ success: false, time: null, error: error.message });
        resolve();
      });
    });

    // Wait between iterations
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  const successfulTests = results.filter(r => r.success);
  const times = successfulTests.map(r => r.time);

  console.log('\n📊 Startup Results:');
  console.log(`   Successful starts: ${successfulTests.length}/${iterations}`);

  if (times.length > 0) {
    const average = times.reduce((a, b) => a + b, 0) / times.length;
    const min = Math.min(...times);
    const max = Math.max(...times);

    console.log(`   Average time: ${average.toFixed(2)}ms`);
    console.log(`   Range: ${min.toFixed(2)}ms - ${max.toFixed(2)}ms`);

    return { average, min, max, successRate: successfulTests.length / iterations * 100 };
  } else {
    console.log(`   ❌ No successful starts`);
    return { average: 0, min: 0, max: 0, successRate: 0 };
  }
}

async function testServerStability() {
  console.log('\n🔒 Testing Server Stability (30 second test)...');

  const server = spawn('node', ['./dist/server.js'], {
    env: {
      ...process.env,
      AZURE_OPENAI_API_KEY: process.env.AZURE_OPENAI_API_KEY || 'your-azure-openai-api-key',
      AZURE_OPENAI_ENDPOINT: process.env.AZURE_OPENAI_ENDPOINT || 'https://your-endpoint.openai.azure.com/',
      AZURE_OPENAI_DEPLOYMENT_NAME: process.env.AZURE_OPENAI_DEPLOYMENT_NAME || 'gpt-4o',
      NODE_ENV: 'production'
    },
    stdio: ['pipe', 'pipe', 'pipe']
  });

  let serverStarted = false;
  let errors = 0;
  let uptime = 0;
  const testDuration = 30000; // 30 seconds

  server.stderr.on('data', (data) => {
    const output = data.toString();
    if (output.includes('ROMAI MCP Server running on stdio')) {
      serverStarted = true;
      console.log('   ✅ Server started, monitoring for 30 seconds...');
    }
    if (output.includes('error') || output.includes('Error')) {
      errors++;
    }
  });

  server.on('error', () => {
    errors++;
  });

  let isRunning = true;
  server.on('exit', () => {
    isRunning = false;
  });

  const startTime = Date.now();

  // Monitor progress
  const progressInterval = setInterval(() => {
    if (isRunning && serverStarted) {
      uptime = Date.now() - startTime;
      const progress = Math.floor((uptime / testDuration) * 10);
      const progressBar = '█'.repeat(progress) + '░'.repeat(10 - progress);
      process.stdout.write(`\r   ${progressBar} ${Math.floor(uptime / 1000)}s / 30s`);
    }
  }, 1000);

  await new Promise(resolve => setTimeout(resolve, testDuration));
  clearInterval(progressInterval);

  if (isRunning) {
    server.kill('SIGTERM');
    uptime = testDuration;
  }

  console.log('\n');
  console.log(`📊 Stability Results:`);
  console.log(`   Server started: ${serverStarted ? 'Yes' : 'No'}`);
  console.log(`   Uptime: ${uptime}ms (${(uptime / testDuration * 100).toFixed(2)}%)`);
  console.log(`   Errors detected: ${errors}`);

  return {
    started: serverStarted,
    uptime: uptime / testDuration * 100,
    errors
  };
}

async function testMemoryUsage() {
  console.log('\n💾 Testing Memory Usage...');

  const initialMemory = process.memoryUsage();
  console.log(`   Initial memory: ${(initialMemory.rss / 1024 / 1024).toFixed(2)} MB RSS`);

  const server = spawn('node', ['./dist/server.js'], {
    env: {
      ...process.env,
      AZURE_OPENAI_API_KEY: process.env.AZURE_OPENAI_API_KEY || 'your-azure-openai-api-key',
      AZURE_OPENAI_ENDPOINT: process.env.AZURE_OPENAI_ENDPOINT || 'https://your-endpoint.openai.azure.com/',
      AZURE_OPENAI_DEPLOYMENT_NAME: process.env.AZURE_OPENAI_DEPLOYMENT_NAME || 'gpt-4o',
      NODE_ENV: 'production'
    },
    stdio: ['pipe', 'pipe', 'pipe']
  });

  let serverStarted = false;
  const memorySnapshots = [];

  server.stderr.on('data', (data) => {
    if (data.toString().includes('ROMAI MCP Server running on stdio')) {
      serverStarted = true;
      console.log('   ✅ Server started, monitoring memory for 15 seconds...');
    }
  });

  // Take memory snapshots
  const memoryInterval = setInterval(() => {
    if (serverStarted) {
      const mem = process.memoryUsage();
      memorySnapshots.push({
        time: Date.now(),
        rss: mem.rss / 1024 / 1024,
        heapUsed: mem.heapUsed / 1024 / 1024,
        heapTotal: mem.heapTotal / 1024 / 1024
      });
    }
  }, 1000);

  await new Promise(resolve => setTimeout(resolve, 15000));
  clearInterval(memoryInterval);

  server.kill('SIGTERM');

  if (memorySnapshots.length > 0) {
    const avgRSS = memorySnapshots.reduce((a, b) => a + b.rss, 0) / memorySnapshots.length;
    const maxRSS = Math.max(...memorySnapshots.map(s => s.rss));
    const minRSS = Math.min(...memorySnapshots.map(s => s.rss));

    console.log(`📊 Memory Results:`);
    console.log(`   Average RSS: ${avgRSS.toFixed(2)} MB`);
    console.log(`   Range: ${minRSS.toFixed(2)} MB - ${maxRSS.toFixed(2)} MB`);
    console.log(`   Memory growth: ${(maxRSS - minRSS).toFixed(2)} MB`);

    return { avgRSS, maxRSS, minRSS, growth: maxRSS - minRSS };
  } else {
    console.log(`   ❌ No memory data collected`);
    return { avgRSS: 0, maxRSS: 0, minRSS: 0, growth: 0 };
  }
}

// Run all tests
async function runAllTests() {
  try {
    const startupResults = await testServerStartup();
    const stabilityResults = await testServerStability();
    const memoryResults = await testMemoryUsage();

    // Generate final report
    console.log('\n🏆 FINAL PERFORMANCE REPORT');
    console.log('===========================');

    let score = 100;

    // Startup score
    if (startupResults.successRate < 100) score -= 20;
    if (startupResults.average > 5000) score -= 15;
    else if (startupResults.average > 3000) score -= 10;
    else if (startupResults.average > 2000) score -= 5;
    else if (startupResults.average < 1000) score += 5;

    // Stability score
    if (stabilityResults.uptime < 95) score -= 25;
    else if (stabilityResults.uptime < 98) score -= 10;
    else if (stabilityResults.uptime >= 99) score += 5;

    if (stabilityResults.errors > 0) score -= 10;

    // Memory score
    if (memoryResults.growth > 50) score -= 15;
    else if (memoryResults.growth > 20) score -= 10;
    else if (memoryResults.growth < 5) score += 5;

    console.log(`🎯 Performance Metrics:`);
    console.log(`   Startup: ${startupResults.average.toFixed(2)}ms avg (${startupResults.successRate.toFixed(0)}% success)`);
    console.log(`   Stability: ${stabilityResults.uptime.toFixed(2)}% uptime (${stabilityResults.errors} errors)`);
    console.log(`   Memory: ${memoryResults.avgRSS.toFixed(2)} MB avg (${memoryResults.growth.toFixed(2)} MB growth)`);

    let rating;
    if (score >= 90) rating = 'EXCELLENT ⭐⭐⭐⭐⭐';
    else if (score >= 80) rating = 'VERY GOOD ⭐⭐⭐⭐';
    else if (score >= 70) rating = 'GOOD ⭐⭐⭐';
    else if (score >= 60) rating = 'FAIR ⭐⭐';
    else rating = 'NEEDS IMPROVEMENT ⭐';

    console.log(`\n🏆 Overall Score: ${score}/100`);
    console.log(`🎖️  Rating: ${rating}`);

    // Save results
    const report = {
      timestamp: new Date().toISOString(),
      system: {
        os: `${os.type()} ${os.release()}`,
        cpu: os.cpus()[0].model,
        cores: os.cpus().length,
        memory: `${(os.totalmem() / 1024 / 1024 / 1024).toFixed(2)} GB`
      },
      results: {
        startup: startupResults,
        stability: stabilityResults,
        memory: memoryResults
      },
      score,
      rating
    };

    fs.writeFileSync('performance-report.json', JSON.stringify(report, null, 2));
    console.log('\n📄 Detailed report saved to: performance-report.json');

  } catch (error) {
    console.error('❌ Test suite failed:', error.message);
  }
}

runAllTests();
