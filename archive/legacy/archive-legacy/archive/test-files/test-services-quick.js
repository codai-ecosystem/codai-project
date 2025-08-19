/**
 * CODAI Service Health Monitor - Quick Service Testing
 * Phase 1.3 Service Stability Implementation
 */

const http = require('http');
const https = require('https');
const { performance } = require('perf_hooks');

// CODAI Service Configuration
const SERVICES = {
  gateway: { port: 4000, path: '/health', protocol: 'http' },
  codai: { port: 4001, path: '/api/health', protocol: 'http' },
  admin: { port: 4002, path: '/health', protocol: 'http' },
  hub: { port: 4003, path: '/api/status', protocol: 'http' },
  id: { port: 4004, path: '/health', protocol: 'http' },
  bancai: { port: 4005, path: '/api/health', protocol: 'http' },
  memorai: { port: 4006, path: '/api/status', protocol: 'http' },
  cbd: { port: 4007, path: '/health', protocol: 'http' },

  // METU Services
  metu_backend: { port: 4010, path: '/api/health', protocol: 'http' },
  metu_web: { port: 3000, path: '/', protocol: 'http' },
  metu_electron: { port: 3001, path: '/health', protocol: 'http' }
};

// Service Health Check Results
const results = {
  timestamp: new Date().toISOString(),
  services: {},
  summary: {
    total: 0,
    healthy: 0,
    unhealthy: 0,
    unavailable: 0
  },
  performance: {}
};

/**
 * Check individual service health
 */
async function checkService(name, config) {
  const startTime = performance.now();

  try {
    const response = await makeRequest(config);
    const endTime = performance.now();
    const responseTime = Math.round(endTime - startTime);

    const result = {
      name,
      status: 'healthy',
      url: `${config.protocol}://localhost:${config.port}${config.path}`,
      responseTime: `${responseTime}ms`,
      statusCode: response.statusCode,
      timestamp: new Date().toISOString()
    };

    if (response.statusCode >= 200 && response.statusCode < 300) {
      result.status = 'healthy';
      results.summary.healthy++;
    } else if (response.statusCode >= 400) {
      result.status = 'unhealthy';
      result.error = `HTTP ${response.statusCode}`;
      results.summary.unhealthy++;
    }

    return result;
  } catch (error) {
    const endTime = performance.now();
    const responseTime = Math.round(endTime - startTime);

    results.summary.unavailable++;
    return {
      name,
      status: 'unavailable',
      url: `${config.protocol}://localhost:${config.port}${config.path}`,
      responseTime: `${responseTime}ms`,
      error: error.code || error.message,
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * Make HTTP/HTTPS request with timeout
 */
function makeRequest(config) {
  return new Promise((resolve, reject) => {
    const client = config.protocol === 'https' ? https : http;
    const options = {
      hostname: 'localhost',
      port: config.port,
      path: config.path,
      method: 'GET',
      timeout: 5000,
      headers: {
        'User-Agent': 'CODAI-HealthCheck/1.0',
        'Accept': 'application/json,text/plain,*/*'
      }
    };

    const req = client.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          data: data
        });
      });
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.end();
  });
}

/**
 * Generate detailed health report
 */
function generateReport() {
  console.log('\n🏥 CODAI Service Health Check Report');
  console.log('='.repeat(50));
  console.log(`⏰ Timestamp: ${results.timestamp}`);
  console.log(`📊 Total Services: ${results.summary.total}`);
  console.log(`✅ Healthy: ${results.summary.healthy}`);
  console.log(`⚠️  Unhealthy: ${results.summary.unhealthy}`);
  console.log(`❌ Unavailable: ${results.summary.unavailable}`);
  console.log('');

  // Service Details
  console.log('🔍 Service Details:');
  console.log('-'.repeat(50));

  for (const [serviceName, result] of Object.entries(results.services)) {
    const statusIcon = getStatusIcon(result.status);
    const nameFormatted = serviceName.padEnd(15);
    const statusFormatted = result.status.padEnd(12);
    const timeFormatted = result.responseTime.padEnd(8);

    console.log(`${statusIcon} ${nameFormatted} ${statusFormatted} ${timeFormatted} ${result.url}`);

    if (result.error) {
      console.log(`   ↳ Error: ${result.error}`);
    }
  }

  console.log('');

  // Performance Summary
  const healthyServices = Object.values(results.services).filter(s => s.status === 'healthy');
  if (healthyServices.length > 0) {
    const responseTimes = healthyServices.map(s => parseInt(s.responseTime));
    const avgResponseTime = Math.round(responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length);
    const maxResponseTime = Math.max(...responseTimes);
    const minResponseTime = Math.min(...responseTimes);

    console.log('⚡ Performance Metrics:');
    console.log('-'.repeat(30));
    console.log(`Average Response Time: ${avgResponseTime}ms`);
    console.log(`Fastest Response: ${minResponseTime}ms`);
    console.log(`Slowest Response: ${maxResponseTime}ms`);
    console.log('');
  }

  // Health Status
  const healthPercentage = Math.round((results.summary.healthy / results.summary.total) * 100);
  console.log(`🎯 Overall Health: ${healthPercentage}%`);

  if (healthPercentage >= 90) {
    console.log('🟢 System Status: EXCELLENT');
  } else if (healthPercentage >= 75) {
    console.log('🟡 System Status: GOOD');
  } else if (healthPercentage >= 50) {
    console.log('🟠 System Status: DEGRADED');
  } else {
    console.log('🔴 System Status: CRITICAL');
  }

  console.log('');
}

/**
 * Get status icon for display
 */
function getStatusIcon(status) {
  switch (status) {
    case 'healthy': return '✅';
    case 'unhealthy': return '⚠️';
    case 'unavailable': return '❌';
    default: return '❓';
  }
}

/**
 * Main execution function
 */
async function main() {
  console.log('🚀 Starting CODAI Service Health Check...');
  console.log(`📅 ${new Date().toLocaleString()}`);
  console.log('');

  const startTime = performance.now();

  // Check all services
  const checks = Object.entries(SERVICES).map(([name, config]) =>
    checkService(name, config)
  );

  const serviceResults = await Promise.allSettled(checks);

  // Process results
  results.summary.total = serviceResults.length;

  serviceResults.forEach((result, index) => {
    const serviceName = Object.keys(SERVICES)[index];
    if (result.status === 'fulfilled') {
      results.services[serviceName] = result.value;
    } else {
      results.services[serviceName] = {
        name: serviceName,
        status: 'error',
        error: result.reason.message,
        timestamp: new Date().toISOString()
      };
      results.summary.unavailable++;
    }
  });

  const endTime = performance.now();
  results.performance.totalTime = Math.round(endTime - startTime);

  // Generate and display report
  generateReport();

  // Exit with appropriate code
  const exitCode = results.summary.healthy === results.summary.total ? 0 : 1;

  console.log(`⏱️  Health check completed in ${results.performance.totalTime}ms`);
  console.log(`🚪 Exit code: ${exitCode}`);

  process.exit(exitCode);
}

// Handle unhandled errors
process.on('unhandledRejection', (error) => {
  console.error('❌ Unhandled rejection:', error);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught exception:', error);
  process.exit(1);
});

// Run the health check
if (require.main === module) {
  main().catch(error => {
    console.error('❌ Health check failed:', error);
    process.exit(1);
  });
}

module.exports = {
  checkService,
  SERVICES,
  results
};
