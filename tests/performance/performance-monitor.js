/**
 * 📊 CODAI Real-Time Performance Monitor
 * Continuous performance monitoring and alerting system
 */

const axios = require('axios');
const { performance } = require('perf_hooks');

class CODAIPerformanceMonitor {
  constructor() {
    this.metrics = new Map();
    this.alerts = [];
    this.monitoringActive = false;
    this.intervalId = null;
    
    this.services = [
      { name: 'CBD Database', url: 'http://localhost:4180/health', critical: true },
      { name: 'Gateway', url: 'http://localhost:4003/health', critical: true },
      { name: 'WebSocket', url: 'http://localhost:4900/health', critical: false },
      { name: 'Hub', url: 'http://localhost:4008', critical: true },
      { name: 'CODAI', url: 'http://localhost:4001', critical: true },
      { name: 'ID Service', url: 'http://localhost:4004', critical: true },
      { name: 'BancAI', url: 'http://localhost:4005', critical: false },
      { name: 'MemorAI', url: 'http://localhost:4006', critical: true },
      { name: 'Admin', url: 'http://localhost:4007', critical: false },
      { name: 'ControlAI', url: 'http://localhost:4200', critical: false },
      { name: 'RomAI', url: 'http://localhost:6100', critical: false }
    ];
    
    this.thresholds = {
      responseTime: 2000, // ms
      availability: 95, // %
      errorRate: 5, // %
      memoryUsage: 80, // %
      cpuUsage: 70 // %
    };
  }

  async startMonitoring(intervalMs = 30000) {
    console.log('📊 Starting Real-Time Performance Monitoring...');
    console.log(`🔄 Monitoring interval: ${intervalMs/1000}s`);
    console.log('===============================================');
    
    this.monitoringActive = true;
    
    // Initial check
    await this.performHealthCheck();
    
    // Set up continuous monitoring
    this.intervalId = setInterval(async () => {
      if (this.monitoringActive) {
        await this.performHealthCheck();
      }
    }, intervalMs);
    
    console.log('✅ Performance monitoring started');
    console.log('Press Ctrl+C to stop monitoring\n');
  }

  async stopMonitoring() {
    console.log('\n🛑 Stopping performance monitoring...');
    this.monitoringActive = false;
    
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    
    await this.generatePerformanceReport();
    console.log('✅ Performance monitoring stopped');
  }

  async performHealthCheck() {
    const timestamp = new Date().toISOString();
    console.log(`\n🔍 Health Check: ${timestamp}`);
    console.log('================================');
    
    const results = [];
    
    for (const service of this.services) {
      try {
        const result = await this.checkService(service);
        results.push(result);
        
        // Store metrics
        if (!this.metrics.has(service.name)) {
          this.metrics.set(service.name, []);
        }
        this.metrics.get(service.name).push(result);
        
        // Check thresholds and generate alerts
        await this.checkThresholds(service, result);
        
        // Display result
        const status = result.healthy ? '✅' : '❌';
        const response = result.responseTime ? `${result.responseTime}ms` : 'N/A';
        console.log(`${status} ${service.name}: ${response} (${result.status})`);
        
      } catch (error) {
        console.log(`❌ ${service.name}: Error - ${error.message}`);
        results.push({
          service: service.name,
          healthy: false,
          status: 'error',
          error: error.message,
          timestamp
        });
      }
    }
    
    // Overall system health
    const healthyServices = results.filter(r => r.healthy).length;
    const totalServices = results.length;
    const systemHealth = (healthyServices / totalServices) * 100;
    
    console.log(`\n📊 System Health: ${healthyServices}/${totalServices} services (${systemHealth.toFixed(1)}%)`);
    
    if (systemHealth < this.thresholds.availability) {
      this.generateAlert('system', 'Low system availability', {
        current: systemHealth,
        threshold: this.thresholds.availability
      });
    }
    
    return results;
  }

  async checkService(service) {
    const startTime = performance.now();
    
    try {
      const response = await axios.get(service.url, {
        timeout: 5000,
        validateStatus: (status) => status < 500
      });
      
      const endTime = performance.now();
      const responseTime = Math.round(endTime - startTime);
      
      return {
        service: service.name,
        healthy: response.status >= 200 && response.status < 400,
        status: `HTTP ${response.status}`,
        responseTime,
        timestamp: new Date().toISOString(),
        data: response.data
      };
      
    } catch (error) {
      const endTime = performance.now();
      const responseTime = Math.round(endTime - startTime);
      
      if (error.code === 'ECONNREFUSED') {
        return {
          service: service.name,
          healthy: false,
          status: 'Service Offline',
          responseTime,
          timestamp: new Date().toISOString(),
          error: 'Connection refused'
        };
      }
      
      throw error;
    }
  }

  async checkThresholds(service, result) {
    // Response time threshold
    if (result.responseTime && result.responseTime > this.thresholds.responseTime) {
      this.generateAlert('performance', `High response time for ${service.name}`, {
        service: service.name,
        current: result.responseTime,
        threshold: this.thresholds.responseTime,
        unit: 'ms'
      });
    }
    
    // Service availability
    if (!result.healthy && service.critical) {
      this.generateAlert('availability', `Critical service ${service.name} is down`, {
        service: service.name,
        status: result.status
      });
    }
  }

  generateAlert(type, message, details) {
    const alert = {
      type,
      message,
      details,
      timestamp: new Date().toISOString(),
      id: Date.now()
    };
    
    this.alerts.push(alert);
    
    // Display alert
    const icon = type === 'system' ? '🚨' : type === 'performance' ? '⚡' : '🔴';
    console.log(`\n${icon} ALERT: ${message}`);
    if (details) {
      console.log(`   Details: ${JSON.stringify(details, null, 2)}`);
    }
  }

  async generatePerformanceReport() {
    console.log('\n📊 Generating Performance Report...');
    
    const report = {
      timestamp: new Date().toISOString(),
      summary: this.calculatePerformanceSummary(),
      services: Array.from(this.metrics.entries()).map(([name, metrics]) => ({
        name,
        metrics: this.analyzeServiceMetrics(metrics)
      })),
      alerts: this.alerts,
      thresholds: this.thresholds
    };
    
    const reportPath = 'tests/reports/performance-monitoring-report.json';
    require('fs').writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    console.log(`📄 Performance report saved: ${reportPath}`);
    
    // Display summary
    this.displayPerformanceSummary(report.summary);
    
    return report;
  }

  calculatePerformanceSummary() {
    const totalChecks = Array.from(this.metrics.values()).reduce((sum, metrics) => sum + metrics.length, 0);
    const healthyChecks = Array.from(this.metrics.values()).reduce((sum, metrics) => 
      sum + metrics.filter(m => m.healthy).length, 0
    );
    
    const avgResponseTimes = Array.from(this.metrics.entries()).map(([name, metrics]) => {
      const responseTimes = metrics.filter(m => m.responseTime).map(m => m.responseTime);
      return {
        service: name,
        avgResponseTime: responseTimes.length > 0 ? 
          responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length : 0
      };
    });
    
    return {
      totalChecks,
      healthyChecks,
      availability: totalChecks > 0 ? (healthyChecks / totalChecks) * 100 : 0,
      totalAlerts: this.alerts.length,
      criticalAlerts: this.alerts.filter(a => a.type === 'system' || a.type === 'availability').length,
      avgResponseTimes
    };
  }

  analyzeServiceMetrics(metrics) {
    const responseTimes = metrics.filter(m => m.responseTime).map(m => m.responseTime);
    const healthyCount = metrics.filter(m => m.healthy).length;
    
    return {
      totalChecks: metrics.length,
      healthyChecks: healthyCount,
      availability: metrics.length > 0 ? (healthyCount / metrics.length) * 100 : 0,
      avgResponseTime: responseTimes.length > 0 ? 
        responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length : 0,
      minResponseTime: responseTimes.length > 0 ? Math.min(...responseTimes) : 0,
      maxResponseTime: responseTimes.length > 0 ? Math.max(...responseTimes) : 0
    };
  }

  displayPerformanceSummary(summary) {
    console.log('\n📋 Performance Summary');
    console.log('=====================');
    console.log(`Total Health Checks: ${summary.totalChecks}`);
    console.log(`System Availability: ${summary.availability.toFixed(1)}%`);
    console.log(`Total Alerts: ${summary.totalAlerts}`);
    console.log(`Critical Alerts: ${summary.criticalAlerts}`);
    
    console.log('\n⏱️ Average Response Times:');
    summary.avgResponseTimes.forEach(service => {
      console.log(`   ${service.service}: ${service.avgResponseTime.toFixed(0)}ms`);
    });
    
    if (summary.criticalAlerts > 0) {
      console.log('\n⚠️ Recent Critical Alerts:');
      this.alerts
        .filter(a => a.type === 'system' || a.type === 'availability')
        .slice(-5)
        .forEach(alert => {
          console.log(`   • ${alert.message} (${new Date(alert.timestamp).toLocaleTimeString()})`);
        });
    }
  }

  async runQuickHealthCheck() {
    console.log('🔍 Quick Health Check');
    console.log('====================');
    
    const results = await this.performHealthCheck();
    
    const healthyServices = results.filter(r => r.healthy).length;
    const totalServices = results.length;
    const systemHealth = (healthyServices / totalServices) * 100;
    
    if (systemHealth >= 90) {
      console.log('✅ System Status: Excellent');
    } else if (systemHealth >= 70) {
      console.log('⚠️ System Status: Good');
    } else {
      console.log('❌ System Status: Poor');
    }
    
    return systemHealth;
  }
}

// CLI interface
if (require.main === module) {
  const monitor = new CODAIPerformanceMonitor();
  
  const args = process.argv.slice(2);
  const command = args[0] || 'monitor';
  
  switch (command) {
    case 'monitor':
      monitor.startMonitoring().catch(console.error);
      
      // Graceful shutdown
      process.on('SIGINT', async () => {
        await monitor.stopMonitoring();
        process.exit(0);
      });
      break;
      
    case 'check':
      monitor.runQuickHealthCheck()
        .then(health => {
          process.exit(health >= 70 ? 0 : 1);
        })
        .catch(error => {
          console.error('Health check failed:', error.message);
          process.exit(1);
        });
      break;
      
    default:
      console.log('Usage: node performance-monitor.js [monitor|check]');
      process.exit(1);
  }
}

module.exports = CODAIPerformanceMonitor;
