/**
 * Enhanced Service Health Monitor with Performance Integration
 * Combines health checking with advanced performance monitoring
 */

import ServicePerformanceMonitor from './libs/service-monitor/index.js';
import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// CODAI Ecosystem Service Configuration
const SERVICES = {
  gateway: {
    name: 'Gateway Service',
    url: 'http://localhost:4000/health',
    port: 4000,
    critical: true
  },
  codai: {
    name: 'CODAI Core Service',
    url: 'http://localhost:4001/api/health',
    port: 4001,
    critical: true
  },
  admin: {
    name: 'Admin Service',
    url: 'http://localhost:4002/api/admin/health',
    port: 4002,
    critical: false
  },
  hub: {
    name: 'Hub Service',
    url: 'http://localhost:4003/api/hub/status',
    port: 4003,
    critical: true
  },
  id: {
    name: 'ID Service',
    url: 'http://localhost:4004/api/auth/health',
    port: 4004,
    critical: true
  },
  bancai: {
    name: 'BancAI Service',
    url: 'http://localhost:4005/api/bancai/health',
    port: 4005,
    critical: false
  },
  memorai: {
    name: 'MemorAI Service',
    url: 'http://localhost:4006/api/memory/health',
    port: 4006,
    critical: true
  },
  cbd: {
    name: 'CBD Engine Service',
    url: 'http://localhost:4007/api/cbd/status',
    port: 4007,
    critical: true
  },
  metu_backend: {
    name: 'METU Backend',
    url: 'http://localhost:4010/api/health',
    port: 4010,
    critical: false
  },
  metu_web: {
    name: 'METU Web App',
    url: 'http://localhost:3000',
    port: 3000,
    critical: false
  },
  metu_electron: {
    name: 'METU Electron',
    url: 'http://localhost:3001',
    port: 3001,
    critical: false
  }
};

class EnhancedServiceMonitor {
  constructor() {
    this.performanceMonitor = new ServicePerformanceMonitor();
    this.results = {
      timestamp: Date.now(),
      testDuration: 0,
      services: {},
      summary: {},
      performance: {},
      recommendations: []
    };
  }

  /**
   * Run comprehensive service health and performance check
   */
  async runHealthCheck() {
    console.log('🔍 Starting Enhanced CODAI Service Health Check...\n');
    const startTime = Date.now();

    // Start system monitoring
    await this.performanceMonitor.collectSystemMetrics();

    // Check each service
    for (const [key, service] of Object.entries(SERVICES)) {
      console.log(`\n🔄 Checking ${service.name} (${service.url})...`);

      try {
        // Health check with performance monitoring
        const healthResult = await this.checkServiceHealth(service);
        const performanceResult = await this.performanceMonitor.monitorService(key, service.url);

        this.results.services[key] = {
          ...service,
          health: healthResult,
          performance: performanceResult,
          timestamp: Date.now()
        };

        this.logServiceResult(key, healthResult, performanceResult);

      } catch (error) {
        this.results.services[key] = {
          ...service,
          health: { status: 'error', error: error.message },
          performance: { success: false, error: error.message },
          timestamp: Date.now()
        };

        console.log(`❌ ${service.name}: ERROR - ${error.message}`);
      }
    }

    // Calculate results
    const endTime = Date.now();
    this.results.testDuration = endTime - startTime;
    this.results.summary = this.calculateSummary();
    this.results.performance = this.performanceMonitor.generateReport();
    this.results.recommendations = this.generateRecommendations();

    // Display results
    this.displayResults();

    // Save detailed report
    await this.saveReport();

    return this.results;
  }

  /**
   * Check individual service health
   */
  async checkServiceHealth(service) {
    const startTime = Date.now();

    try {
      // First check if port is open
      const portCheck = await this.checkPort(service.port);
      if (!portCheck.open) {
        return {
          status: 'down',
          port: service.port,
          portOpen: false,
          responseTime: Date.now() - startTime,
          message: 'Service port is not accessible'
        };
      }

      // HTTP health check
      const response = await this.makeHealthRequest(service.url);
      const responseTime = Date.now() - startTime;

      return {
        status: response.statusCode >= 200 && response.statusCode < 300 ? 'healthy' : 'unhealthy',
        statusCode: response.statusCode,
        responseTime,
        port: service.port,
        portOpen: true,
        contentLength: response.data ? response.data.length : 0,
        headers: response.headers,
        data: this.parseResponseData(response.data)
      };

    } catch (error) {
      return {
        status: 'error',
        error: error.message,
        responseTime: Date.now() - startTime,
        port: service.port,
        portOpen: false
      };
    }
  }

  /**
   * Check if port is open
   */
  async checkPort(port) {
    const { createConnection } = await import('net');

    return new Promise((resolve) => {
      const socket = createConnection({ port, host: 'localhost' });
      const timeout = 3000;

      socket.setTimeout(timeout);

      socket.on('connect', () => {
        socket.destroy();
        resolve({ open: true, port });
      });

      socket.on('timeout', () => {
        socket.destroy();
        resolve({ open: false, port, reason: 'timeout' });
      });

      socket.on('error', (error) => {
        socket.destroy();
        resolve({ open: false, port, reason: error.code });
      });
    });
  }

  /**
   * Make health request
   */
  async makeHealthRequest(url) {
    const { default: http } = await import('http');
    const { default: https } = await import('https');

    return new Promise((resolve, reject) => {
      const urlObj = new URL(url);
      const client = urlObj.protocol === 'https:' ? https : http;

      const options = {
        hostname: urlObj.hostname,
        port: urlObj.port,
        path: urlObj.pathname,
        method: 'GET',
        timeout: 5000,
        headers: {
          'User-Agent': 'CODAI-HealthMonitor/1.0',
          'Accept': 'application/json, text/plain, */*'
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
        reject(new Error('Request timeout (5s)'));
      });

      req.on('error', reject);
      req.end();
    });
  }

  /**
   * Parse response data safely
   */
  parseResponseData(data) {
    if (!data) return null;

    try {
      return JSON.parse(data);
    } catch {
      return { raw: data.substring(0, 200) };
    }
  }

  /**
   * Log service result
   */
  logServiceResult(key, health, performance) {
    const service = SERVICES[key];
    const statusIcon = health.status === 'healthy' ? '✅' :
      health.status === 'down' ? '🔴' : '⚠️';

    console.log(`${statusIcon} ${service.name}:`);
    console.log(`   Status: ${health.status.toUpperCase()}`);
    console.log(`   Response Time: ${Math.round(performance.responseTime || health.responseTime)}ms`);

    if (health.statusCode) {
      console.log(`   HTTP Status: ${health.statusCode}`);
    }

    if (health.port) {
      console.log(`   Port: ${health.port} (${health.portOpen ? 'Open' : 'Closed'})`);
    }

    if (performance.success === false && performance.error) {
      console.log(`   Performance Issue: ${performance.error}`);
    }
  }

  /**
   * Calculate summary statistics
   */
  calculateSummary() {
    const services = Object.values(this.results.services);
    const total = services.length;
    const healthy = services.filter(s => s.health.status === 'healthy').length;
    const down = services.filter(s => s.health.status === 'down').length;
    const errors = services.filter(s => s.health.status === 'error').length;
    const critical = services.filter(s => s.critical && s.health.status !== 'healthy').length;

    const avgResponseTime = services
      .filter(s => s.performance.responseTime)
      .reduce((sum, s) => sum + s.performance.responseTime, 0) / services.length;

    return {
      total,
      healthy,
      down,
      errors,
      unhealthy: down + errors,
      healthPercentage: Math.round((healthy / total) * 100),
      criticalIssues: critical,
      averageResponseTime: Math.round(avgResponseTime),
      systemHealth: this.performanceMonitor.calculateSystemHealth(),
      overallScore: this.calculateOverallHealthScore()
    };
  }

  /**
   * Calculate overall health score
   */
  calculateOverallHealthScore() {
    const summary = this.results.summary || this.calculateSummary();
    const performanceScore = this.performanceMonitor.calculateOverallScore();

    // Weight: 60% service health, 40% performance
    const serviceWeight = 0.6;
    const performanceWeight = 0.4;

    const score = (summary.healthPercentage * serviceWeight) +
      (performanceScore * performanceWeight);

    return Math.round(score);
  }

  /**
   * Generate optimization recommendations
   */
  generateRecommendations() {
    const recommendations = [];
    const services = Object.values(this.results.services);

    // Service-specific recommendations
    services.forEach(service => {
      if (service.health.status === 'down' && service.critical) {
        recommendations.push({
          type: 'critical',
          service: service.name,
          issue: 'Critical service is down',
          recommendation: `Immediately restart ${service.name} service on port ${service.port}`
        });
      }

      if (service.performance.responseTime > 2000) {
        recommendations.push({
          type: 'performance',
          service: service.name,
          issue: `Slow response time: ${Math.round(service.performance.responseTime)}ms`,
          recommendation: 'Investigate performance bottlenecks and optimize service'
        });
      }
    });

    // System recommendations
    const systemMetrics = this.performanceMonitor.metrics.system;
    if (systemMetrics.cpu && systemMetrics.cpu.usage > 80) {
      recommendations.push({
        type: 'system',
        issue: `High CPU usage: ${Math.round(systemMetrics.cpu.usage)}%`,
        recommendation: 'Consider scaling resources or optimizing CPU-intensive processes'
      });
    }

    if (systemMetrics.memory && systemMetrics.memory.usage > 85) {
      recommendations.push({
        type: 'system',
        issue: `High memory usage: ${Math.round(systemMetrics.memory.usage)}%`,
        recommendation: 'Investigate memory leaks and consider increasing available memory'
      });
    }

    return recommendations;
  }

  /**
   * Display comprehensive results
   */
  displayResults() {
    const summary = this.results.summary;

    console.log('\n' + '='.repeat(60));
    console.log('📊 CODAI ECOSYSTEM HEALTH REPORT');
    console.log('='.repeat(60));

    console.log(`\n🕐 Test Duration: ${this.results.testDuration}ms`);
    console.log(`📈 Overall Health Score: ${summary.overallScore}/100`);

    console.log(`\n📋 SERVICE SUMMARY:`);
    console.log(`   Total Services: ${summary.total}`);
    console.log(`   Healthy: ${summary.healthy} (${summary.healthPercentage}%)`);
    console.log(`   Down: ${summary.down}`);
    console.log(`   Errors: ${summary.errors}`);
    console.log(`   Critical Issues: ${summary.criticalIssues}`);
    console.log(`   Average Response Time: ${summary.averageResponseTime}ms`);

    // Performance summary
    const perfSummary = this.results.performance.summary;
    console.log(`\n⚡ PERFORMANCE SUMMARY:`);
    console.log(`   System Health: ${perfSummary.systemHealth}%`);
    console.log(`   Service Health: ${Math.round(perfSummary.serviceHealthPercentage)}%`);
    console.log(`   Critical Alerts: ${perfSummary.criticalAlerts}`);

    // Recommendations
    if (this.results.recommendations.length > 0) {
      console.log(`\n💡 RECOMMENDATIONS:`);
      this.results.recommendations.forEach((rec, index) => {
        const icon = rec.type === 'critical' ? '🚨' :
          rec.type === 'performance' ? '⚡' : '🔧';
        console.log(`   ${index + 1}. ${icon} ${rec.issue}`);
        console.log(`      → ${rec.recommendation}`);
      });
    }

    console.log('\n' + '='.repeat(60));

    // Status indicator
    if (summary.overallScore >= 90) {
      console.log('🟢 ECOSYSTEM STATUS: EXCELLENT');
    } else if (summary.overallScore >= 75) {
      console.log('🟡 ECOSYSTEM STATUS: GOOD');
    } else if (summary.overallScore >= 50) {
      console.log('🟠 ECOSYSTEM STATUS: NEEDS ATTENTION');
    } else {
      console.log('🔴 ECOSYSTEM STATUS: CRITICAL');
    }
  }

  /**
   * Save comprehensive report
   */
  async saveReport() {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const reportPath = path.join(process.cwd(), 'logs', `health-report-${timestamp}.json`);

      // Ensure logs directory exists
      await fs.mkdir(path.dirname(reportPath), { recursive: true });

      // Save main report
      await fs.writeFile(reportPath, JSON.stringify(this.results, null, 2));

      // Save performance metrics
      await this.performanceMonitor.saveMetrics(`performance-${timestamp}.json`);

      console.log(`\n📁 Reports saved:`);
      console.log(`   Health: ${reportPath}`);
      console.log(`   Performance: logs/performance-${timestamp}.json`);

      return reportPath;
    } catch (error) {
      console.error('❌ Failed to save report:', error.message);
      throw error;
    }
  }

  /**
   * Start continuous monitoring
   */
  startContinuousMonitoring(interval = 60000) {
    console.log(`🔄 Starting continuous health monitoring (${interval / 1000}s interval)`);

    this.monitoringInterval = setInterval(async () => {
      console.log('\n' + '─'.repeat(40));
      console.log(`🔄 Continuous Health Check - ${new Date().toLocaleTimeString()}`);
      console.log('─'.repeat(40));

      await this.runHealthCheck();
    }, interval);

    // Also start performance monitoring
    this.performanceMonitor.startMonitoring(30000);

    return this.monitoringInterval;
  }

  /**
   * Stop monitoring
   */
  stopMonitoring() {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }

    this.performanceMonitor.stopMonitoring();
    console.log('⏹️  Continuous monitoring stopped');
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const monitor = new EnhancedServiceMonitor();

  // Handle command line arguments
  const args = process.argv.slice(2);

  if (args.includes('--continuous') || args.includes('-c')) {
    const interval = parseInt(args[args.indexOf('--interval') + 1]) || 60000;
    monitor.startContinuousMonitoring(interval);

    // Handle graceful shutdown
    process.on('SIGINT', () => {
      console.log('\n🛑 Shutting down monitoring...');
      monitor.stopMonitoring();
      process.exit(0);
    });

  } else {
    monitor.runHealthCheck()
      .then(results => {
        const exitCode = results.summary.criticalIssues > 0 ? 1 : 0;
        process.exit(exitCode);
      })
      .catch(error => {
        console.error('❌ Health check failed:', error.message);
        process.exit(1);
      });
  }
}

export default EnhancedServiceMonitor;
