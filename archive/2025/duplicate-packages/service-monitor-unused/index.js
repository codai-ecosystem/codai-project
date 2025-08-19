/**
 * CODAI Service Performance Monitor - Phase 1.3 Implementation
 * Advanced performance monitoring and optimization tools
 */

import { performance, PerformanceObserver } from 'perf_hooks';
import os from 'os';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class ServicePerformanceMonitor {
  constructor() {
    this.metrics = {
      system: {},
      services: {},
      performance: {},
      alerts: [],
      history: []
    };

    this.thresholds = {
      cpu: 80, // CPU usage percentage
      memory: 85, // Memory usage percentage
      responseTime: 2000, // Response time in ms
      errorRate: 5 // Error rate percentage
    };

    this.startTime = Date.now();
    this.setupPerformanceObserver();
  }

  /**
   * Setup performance observer for detailed metrics
   */
  setupPerformanceObserver() {
    const obs = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        this.recordPerformanceEntry(entry);
      }
    });

    obs.observe({ entryTypes: ['measure', 'navigation', 'resource'] });
  }

  /**
   * Record performance entry
   */
  recordPerformanceEntry(entry) {
    if (!this.metrics.performance[entry.name]) {
      this.metrics.performance[entry.name] = [];
    }

    this.metrics.performance[entry.name].push({
      timestamp: Date.now(),
      duration: entry.duration,
      startTime: entry.startTime
    });

    // Keep only last 100 entries per metric
    if (this.metrics.performance[entry.name].length > 100) {
      this.metrics.performance[entry.name] = this.metrics.performance[entry.name].slice(-100);
    }
  }

  /**
   * Collect system metrics
   */
  async collectSystemMetrics() {
    const metrics = {
      timestamp: Date.now(),
      uptime: process.uptime(),
      cpu: {
        usage: await this.getCPUUsage(),
        loadAverage: os.loadavg(),
        cores: os.cpus().length
      },
      memory: {
        total: os.totalmem(),
        free: os.freemem(),
        used: os.totalmem() - os.freemem(),
        usage: ((os.totalmem() - os.freemem()) / os.totalmem()) * 100,
        heapUsed: process.memoryUsage().heapUsed,
        heapTotal: process.memoryUsage().heapTotal,
        external: process.memoryUsage().external
      },
      network: await this.getNetworkStats(),
      disk: await this.getDiskStats()
    };

    this.metrics.system = metrics;
    this.checkThresholds(metrics);

    return metrics;
  }

  /**
   * Get CPU usage percentage
   */
  async getCPUUsage() {
    return new Promise((resolve) => {
      const startUsage = process.cpuUsage();
      const startTime = process.hrtime();

      setTimeout(() => {
        const endUsage = process.cpuUsage(startUsage);
        const endTime = process.hrtime(startTime);

        const userUsage = endUsage.user / 1000000; // Convert to seconds
        const systemUsage = endUsage.system / 1000000;
        const totalTime = endTime[0] + endTime[1] / 1000000000;

        const cpuPercent = ((userUsage + systemUsage) / totalTime) * 100;
        resolve(Math.min(100, Math.max(0, cpuPercent)));
      }, 100);
    });
  }

  /**
   * Get network statistics
   */
  async getNetworkStats() {
    try {
      const interfaces = os.networkInterfaces();
      const stats = {
        interfaces: Object.keys(interfaces).length,
        active: 0,
        addresses: []
      };

      for (const [name, addresses] of Object.entries(interfaces)) {
        if (addresses && addresses.length > 0) {
          stats.active++;
          addresses.forEach(addr => {
            if (!addr.internal) {
              stats.addresses.push({
                interface: name,
                address: addr.address,
                family: addr.family
              });
            }
          });
        }
      }

      return stats;
    } catch (error) {
      return { error: error.message };
    }
  }

  /**
   * Get disk statistics
   */
  async getDiskStats() {
    try {
      const stats = await fs.stat(process.cwd());
      return {
        workingDirectory: process.cwd(),
        accessible: true,
        lastModified: stats.mtime
      };
    } catch (error) {
      return {
        workingDirectory: process.cwd(),
        accessible: false,
        error: error.message
      };
    }
  }

  /**
   * Monitor service performance
   */
  async monitorService(serviceName, url, options = {}) {
    const startTime = performance.now();
    performance.mark(`${serviceName}-start`);

    try {
      const response = await this.makeServiceRequest(url, options);
      const endTime = performance.now();

      performance.mark(`${serviceName}-end`);
      performance.measure(`${serviceName}-request`, `${serviceName}-start`, `${serviceName}-end`);

      const metrics = {
        serviceName,
        url,
        timestamp: Date.now(),
        responseTime: endTime - startTime,
        statusCode: response.statusCode,
        success: response.statusCode >= 200 && response.statusCode < 300,
        contentLength: response.contentLength || 0,
        headers: response.headers
      };

      if (!this.metrics.services[serviceName]) {
        this.metrics.services[serviceName] = {
          requests: [],
          stats: {
            totalRequests: 0,
            successfulRequests: 0,
            failedRequests: 0,
            averageResponseTime: 0,
            minResponseTime: Infinity,
            maxResponseTime: 0
          }
        };
      }

      this.updateServiceStats(serviceName, metrics);
      return metrics;

    } catch (error) {
      const endTime = performance.now();

      const errorMetrics = {
        serviceName,
        url,
        timestamp: Date.now(),
        responseTime: endTime - startTime,
        success: false,
        error: error.message
      };

      this.updateServiceStats(serviceName, errorMetrics);
      return errorMetrics;
    }
  }

  /**
   * Make service request with performance tracking
   */
  async makeServiceRequest(url, options = {}) {
    const { default: http } = await import('http');
    const { default: https } = await import('https');

    return new Promise((resolve, reject) => {
      const urlObj = new URL(url);
      const client = urlObj.protocol === 'https:' ? https : http;

      const requestOptions = {
        hostname: urlObj.hostname,
        port: urlObj.port,
        path: urlObj.pathname + urlObj.search,
        method: options.method || 'GET',
        timeout: options.timeout || 5000,
        headers: {
          'User-Agent': 'CODAI-PerformanceMonitor/1.0',
          ...options.headers
        }
      };

      const req = client.request(requestOptions, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            data: data,
            contentLength: data.length
          });
        });
      });

      req.on('timeout', () => {
        req.destroy();
        reject(new Error('Request timeout'));
      });

      req.on('error', reject);
      req.end();
    });
  }

  /**
   * Update service statistics
   */
  updateServiceStats(serviceName, metrics) {
    const service = this.metrics.services[serviceName];

    // Add to requests history
    service.requests.push(metrics);
    if (service.requests.length > 100) {
      service.requests = service.requests.slice(-100);
    }

    // Update statistics
    service.stats.totalRequests++;

    if (metrics.success) {
      service.stats.successfulRequests++;
    } else {
      service.stats.failedRequests++;
    }

    if (metrics.responseTime) {
      const responseTimes = service.requests
        .filter(r => r.responseTime)
        .map(r => r.responseTime);

      service.stats.averageResponseTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
      service.stats.minResponseTime = Math.min(...responseTimes);
      service.stats.maxResponseTime = Math.max(...responseTimes);
    }

    // Check for performance issues
    if (metrics.responseTime > this.thresholds.responseTime) {
      this.addAlert('performance', `${serviceName} slow response: ${Math.round(metrics.responseTime)}ms`);
    }

    const errorRate = (service.stats.failedRequests / service.stats.totalRequests) * 100;
    if (errorRate > this.thresholds.errorRate) {
      this.addAlert('reliability', `${serviceName} high error rate: ${Math.round(errorRate)}%`);
    }
  }

  /**
   * Check system thresholds and generate alerts
   */
  checkThresholds(metrics) {
    if (metrics.cpu.usage > this.thresholds.cpu) {
      this.addAlert('system', `High CPU usage: ${Math.round(metrics.cpu.usage)}%`);
    }

    if (metrics.memory.usage > this.thresholds.memory) {
      this.addAlert('system', `High memory usage: ${Math.round(metrics.memory.usage)}%`);
    }
  }

  /**
   * Add performance alert
   */
  addAlert(type, message) {
    const alert = {
      id: Date.now().toString(),
      type,
      message,
      timestamp: Date.now(),
      severity: this.calculateSeverity(type, message)
    };

    this.metrics.alerts.unshift(alert);

    // Keep only last 50 alerts
    if (this.metrics.alerts.length > 50) {
      this.metrics.alerts = this.metrics.alerts.slice(0, 50);
    }

    console.warn(`🚨 ALERT [${type.toUpperCase()}]: ${message}`);
  }

  /**
   * Calculate alert severity
   */
  calculateSeverity(type, message) {
    if (type === 'system') {
      if (message.includes('High CPU') || message.includes('High memory')) {
        return 'high';
      }
    }
    if (type === 'performance') {
      return 'medium';
    }
    if (type === 'reliability') {
      return 'high';
    }
    return 'low';
  }

  /**
   * Generate performance report
   */
  generateReport() {
    const report = {
      timestamp: Date.now(),
      uptime: Date.now() - this.startTime,
      system: this.metrics.system,
      services: {},
      alerts: this.metrics.alerts.slice(0, 10), // Last 10 alerts
      summary: this.generateSummary()
    };

    // Service summaries
    for (const [serviceName, serviceData] of Object.entries(this.metrics.services)) {
      report.services[serviceName] = {
        stats: serviceData.stats,
        recentRequests: serviceData.requests.slice(-5),
        healthScore: this.calculateHealthScore(serviceData.stats)
      };
    }

    return report;
  }

  /**
   * Calculate service health score
   */
  calculateHealthScore(stats) {
    if (stats.totalRequests === 0) return 0;

    const successRate = (stats.successfulRequests / stats.totalRequests) * 100;
    const responseScore = Math.max(0, 100 - (stats.averageResponseTime / 20)); // 20ms = 1 point

    return Math.round((successRate * 0.7) + (responseScore * 0.3));
  }

  /**
   * Generate performance summary
   */
  generateSummary() {
    const totalServices = Object.keys(this.metrics.services).length;
    const healthyServices = Object.values(this.metrics.services)
      .filter(service => this.calculateHealthScore(service.stats) > 80).length;

    const criticalAlerts = this.metrics.alerts.filter(alert => alert.severity === 'high').length;

    return {
      totalServices,
      healthyServices,
      serviceHealthPercentage: totalServices > 0 ? (healthyServices / totalServices) * 100 : 0,
      criticalAlerts,
      systemHealth: this.calculateSystemHealth()
    };
  }

  /**
   * Calculate system health percentage
   */
  calculateSystemHealth() {
    if (!this.metrics.system.cpu) return 0;

    const cpuScore = Math.max(0, 100 - this.metrics.system.cpu.usage);
    const memoryScore = Math.max(0, 100 - this.metrics.system.memory.usage);

    return Math.round((cpuScore + memoryScore) / 2);
  }

  /**
   * Calculate overall performance score
   */
  calculateOverallScore() {
    const totalServices = Object.keys(this.metrics.services).length;
    const healthyServices = Object.values(this.metrics.services)
      .filter(service => this.calculateHealthScore(service.stats) > 80).length;

    const serviceHealthPercentage = totalServices > 0 ? (healthyServices / totalServices) * 100 : 0;
    const systemHealth = this.calculateSystemHealth();

    const systemWeight = 0.4;
    const serviceWeight = 0.6;

    const score = (systemHealth * systemWeight) +
      (serviceHealthPercentage * serviceWeight);

    return Math.round(score);
  }

  /**
   * Save performance data to file
   */
  async saveMetrics(filename) {
    try {
      const report = this.generateReport();
      const filepath = path.join(process.cwd(), 'logs', filename);

      // Ensure logs directory exists
      await fs.mkdir(path.dirname(filepath), { recursive: true });

      await fs.writeFile(filepath, JSON.stringify(report, null, 2));
      console.log(`📊 Performance metrics saved to: ${filepath}`);

      return filepath;
    } catch (error) {
      console.error('❌ Failed to save metrics:', error.message);
      throw error;
    }
  }

  /**
   * Start continuous monitoring
   */
  startMonitoring(interval = 30000) {
    console.log(`🔄 Starting continuous performance monitoring (${interval}ms interval)`);

    this.monitoringInterval = setInterval(async () => {
      await this.collectSystemMetrics();

      // Monitor all known services
      for (const [serviceName, serviceData] of Object.entries(this.metrics.services)) {
        if (serviceData.requests.length > 0) {
          const lastRequest = serviceData.requests[serviceData.requests.length - 1];
          await this.monitorService(serviceName, lastRequest.url);
        }
      }
    }, interval);

    return this.monitoringInterval;
  }

  /**
   * Stop monitoring
   */
  stopMonitoring() {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
      console.log('⏹️  Performance monitoring stopped');
    }
  }
}

export default ServicePerformanceMonitor;
