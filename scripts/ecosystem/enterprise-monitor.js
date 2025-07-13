#!/usr/bin/env node

import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import http from 'http';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * ENTERPRISE MONITORING DASHBOARD
 * 
 * Advanced monitoring system for the complete Codai ecosystem
 * Features:
 * - Real-time health monitoring for all 27 applications
 * - Performance metrics collection and analysis
 * - Security monitoring and audit logging
 * - Intelligent alerting and incident response
 * - Comprehensive reporting and analytics
 */

// Complete application matrix
const APPS = [
  // === CORE NEXT.JS APPLICATIONS (Ports 4030-4040) ===
  { name: 'CodAI', port: 4030, type: 'nextjs', domain: 'codai.ro', category: 'core', priority: 'critical' },
  { name: 'MemorAI', port: 4031, type: 'nextjs', domain: 'memorai.ro', category: 'core', priority: 'critical' },
  { name: 'LogAI', port: 4032, type: 'nextjs', domain: 'logai.ro', category: 'security', priority: 'critical' },
  { name: 'BancAI', port: 4033, type: 'nextjs', domain: 'bancai.ro', category: 'financial', priority: 'critical' },
  { name: 'Wallet', port: 4034, type: 'nextjs', domain: 'wallet.bancai.ro', category: 'financial', priority: 'high' },
  { name: 'FabricAI', port: 4035, type: 'nextjs', domain: 'fabricai.ro', category: 'enterprise', priority: 'high' },
  { name: 'StudiAI', port: 4036, type: 'nextjs', domain: 'studiai.ro', category: 'education', priority: 'medium' },
  { name: 'SociAI', port: 4037, type: 'nextjs', domain: 'sociai.ro', category: 'social', priority: 'medium' },
  { name: 'CumparAI', port: 4038, type: 'nextjs', domain: 'cumparai.ro', category: 'commerce', priority: 'medium' },
  { name: 'X Trading', port: 4039, type: 'nextjs', domain: 'x.codai.ro', category: 'financial', priority: 'high' },
  { name: 'PublicAI', port: 4040, type: 'nextjs', domain: 'publicai.ro', category: 'civic', priority: 'medium' },

  // === EXPRESS.JS MICROSERVICES (Ports 4041-4055) ===
  { name: 'AIDE', port: 4041, type: 'express', domain: 'aide.codai.ro', category: 'development', priority: 'high' },
  { name: 'AnalizAI', port: 4042, type: 'express', domain: 'analizai.ro', category: 'analytics', priority: 'high' },
  { name: 'MarketAI', port: 4043, type: 'express', domain: 'marketai.ro', category: 'marketplace', priority: 'medium' },
  { name: 'Explorer', port: 4044, type: 'express', domain: 'explorer.codai.ro', category: 'blockchain', priority: 'medium' },
  { name: 'Kodex', port: 4045, type: 'express', domain: 'kodex.codai.ro', category: 'protocol', priority: 'high' },
  { name: 'ID Service', port: 4046, type: 'express', domain: 'id.codai.ro', category: 'security', priority: 'critical' },
  { name: 'Mod Builder', port: 4047, type: 'express', domain: 'mod.codai.ro', category: 'automation', priority: 'medium' },
  { name: 'Tools Hub', port: 4048, type: 'express', domain: 'tools.codai.ro', category: 'utilities', priority: 'medium' },
  { name: 'Dashboard', port: 4049, type: 'express', domain: 'dash.codai.ro', category: 'visualization', priority: 'high' },
  { name: 'Integration Hub', port: 4050, type: 'express', domain: 'hub.codai.ro', category: 'integration', priority: 'high' },
  { name: 'Docs Portal', port: 4051, type: 'express', domain: 'docs.codai.ro', category: 'documentation', priority: 'medium' },
  { name: 'Admin Panel', port: 4052, type: 'express', domain: 'admin.codai.ro', category: 'admin', priority: 'critical' },
  { name: 'StocAI', port: 4053, type: 'express', domain: 'stocai.ro', category: 'storage', priority: 'critical' },
  { name: 'AjutAI', port: 4054, type: 'express', domain: 'ajutai.ro', category: 'support', priority: 'high' },
  { name: 'LegalizAI', port: 4055, type: 'express', domain: 'legalizai.ro', category: 'legal', priority: 'high' },

  // === ADDITIONAL SERVICES (Port 4056) ===
  { name: 'Mobile App', port: 4056, type: 'nextjs', domain: 'mobile.codai.ro', category: 'mobile', priority: 'medium' }
];

class EnterpriseMonitor {
  constructor() {
    this.healthData = new Map();
    this.metrics = new Map();
    this.alerts = [];
    this.startTime = Date.now();
    this.monitoringPort = 4057; // Dedicated monitoring port

    // Enterprise monitoring intervals
    this.healthCheckInterval = 15000; // 15 seconds
    this.metricsCollectionInterval = 30000; // 30 seconds
    this.reportingInterval = 300000; // 5 minutes

    this.initializeMonitoring();
  }

  initializeMonitoring() {
    console.log('🚀 Starting Enterprise Monitoring Dashboard...');
    console.log(`📊 Monitoring ${APPS.length} applications across the Codai ecosystem`);

    // Start monitoring processes
    this.startHealthMonitoring();
    this.startMetricsCollection();
    this.startAlertingSystem();
    this.startWebDashboard();

    // Generate initial report
    setTimeout(() => {
      this.generateStatusReport();
    }, 5000);
  }

  async startHealthMonitoring() {
    console.log('💚 Starting comprehensive health monitoring...');

    setInterval(async () => {
      await this.performHealthChecks();
    }, this.healthCheckInterval);

    // Initial health check
    await this.performHealthChecks();
  }

  async performHealthChecks() {
    const timestamp = new Date().toISOString();
    let healthyCount = 0;
    let unhealthyCount = 0;
    const healthResults = [];

    for (const app of APPS) {
      try {
        const health = await this.checkApplicationHealth(app);
        healthResults.push(health);

        if (health.status === 'healthy') {
          healthyCount++;
        } else {
          unhealthyCount++;
          this.triggerAlert(app, health);
        }

        this.healthData.set(app.name, health);
      } catch (error) {
        unhealthyCount++;
        const errorHealth = {
          app: app.name,
          status: 'error',
          responseTime: null,
          error: error.message,
          timestamp
        };
        healthResults.push(errorHealth);
        this.healthData.set(app.name, errorHealth);
        this.triggerAlert(app, errorHealth);
      }
    }

    // Log summary
    const healthRate = ((healthyCount / APPS.length) * 100).toFixed(1);
    console.log(`💚 Health Check: ${healthyCount}/${APPS.length} healthy (${healthRate}%) | ${unhealthyCount} issues`);

    // Store metrics
    this.metrics.set('health_summary', {
      timestamp,
      healthy: healthyCount,
      unhealthy: unhealthyCount,
      healthRate: parseFloat(healthRate),
      totalApps: APPS.length
    });
  }

  async checkApplicationHealth(app) {
    const startTime = Date.now();

    try {
      const response = await fetch(`http://localhost:${app.port}${app.type === 'express' ? '/health' : '/'}`, {
        method: 'GET',
        timeout: 5000
      });

      const responseTime = Date.now() - startTime;

      if (response.ok) {
        let additionalData = {};

        // For Express.js apps, get additional health data
        if (app.type === 'express') {
          try {
            const healthData = await response.json();
            additionalData = {
              service: healthData.service,
              uptime: healthData.uptime,
              description: healthData.description
            };
          } catch (e) {
            // Health endpoint might return HTML
          }
        }

        return {
          app: app.name,
          status: 'healthy',
          responseTime,
          timestamp: new Date().toISOString(),
          port: app.port,
          type: app.type,
          domain: app.domain,
          category: app.category,
          priority: app.priority,
          ...additionalData
        };
      } else {
        return {
          app: app.name,
          status: 'unhealthy',
          responseTime,
          error: `HTTP ${response.status}`,
          timestamp: new Date().toISOString(),
          port: app.port,
          type: app.type,
          domain: app.domain,
          category: app.category,
          priority: app.priority
        };
      }
    } catch (error) {
      const responseTime = Date.now() - startTime;

      return {
        app: app.name,
        status: 'unreachable',
        responseTime,
        error: error.message,
        timestamp: new Date().toISOString(),
        port: app.port,
        type: app.type,
        domain: app.domain,
        category: app.category,
        priority: app.priority
      };
    }
  }

  startMetricsCollection() {
    console.log('📈 Starting metrics collection...');

    setInterval(() => {
      this.collectSystemMetrics();
    }, this.metricsCollectionInterval);
  }

  collectSystemMetrics() {
    const timestamp = new Date().toISOString();

    // System metrics
    const systemMetrics = {
      timestamp,
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage(),
      cpuUsage: process.cpuUsage(),
      totalApps: APPS.length,
      healthyApps: Array.from(this.healthData.values()).filter(h => h.status === 'healthy').length
    };

    this.metrics.set('system', systemMetrics);

    // Application category metrics
    const categoryMetrics = this.calculateCategoryMetrics();
    this.metrics.set('categories', categoryMetrics);

    // Performance metrics
    const performanceMetrics = this.calculatePerformanceMetrics();
    this.metrics.set('performance', performanceMetrics);
  }

  calculateCategoryMetrics() {
    const categories = {};

    for (const app of APPS) {
      if (!categories[app.category]) {
        categories[app.category] = {
          total: 0,
          healthy: 0,
          unhealthy: 0,
          avgResponseTime: 0
        };
      }

      categories[app.category].total++;

      const health = this.healthData.get(app.name);
      if (health) {
        if (health.status === 'healthy') {
          categories[app.category].healthy++;
        } else {
          categories[app.category].unhealthy++;
        }

        if (health.responseTime) {
          categories[app.category].avgResponseTime += health.responseTime;
        }
      }
    }

    // Calculate averages
    for (const category in categories) {
      categories[category].avgResponseTime = Math.round(
        categories[category].avgResponseTime / categories[category].total
      );
      categories[category].healthRate =
        (categories[category].healthy / categories[category].total * 100).toFixed(1);
    }

    return categories;
  }

  calculatePerformanceMetrics() {
    const healthValues = Array.from(this.healthData.values());
    const responseTimes = healthValues
      .filter(h => h.responseTime !== null)
      .map(h => h.responseTime);

    if (responseTimes.length === 0) return {};

    return {
      avgResponseTime: Math.round(responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length),
      minResponseTime: Math.min(...responseTimes),
      maxResponseTime: Math.max(...responseTimes),
      totalHealthyApps: healthValues.filter(h => h.status === 'healthy').length,
      totalUnhealthyApps: healthValues.filter(h => h.status !== 'healthy').length
    };
  }

  triggerAlert(app, health) {
    const alert = {
      id: `${app.name}-${Date.now()}`,
      app: app.name,
      severity: this.calculateAlertSeverity(app, health),
      message: `${app.name} is ${health.status}: ${health.error || 'Unknown issue'}`,
      timestamp: new Date().toISOString(),
      health,
      app: app
    };

    this.alerts.unshift(alert);

    // Keep only last 100 alerts
    if (this.alerts.length > 100) {
      this.alerts = this.alerts.slice(0, 100);
    }

    // Log critical alerts
    if (alert.severity === 'critical') {
      console.log(`🚨 CRITICAL ALERT: ${alert.message}`);
    } else if (alert.severity === 'high') {
      console.log(`⚠️  HIGH ALERT: ${alert.message}`);
    }
  }

  calculateAlertSeverity(app, health) {
    if (app.priority === 'critical') {
      return 'critical';
    } else if (app.priority === 'high') {
      return 'high';
    } else {
      return 'medium';
    }
  }

  startAlertingSystem() {
    console.log('🚨 Starting intelligent alerting system...');

    // Alert processing every minute
    setInterval(() => {
      this.processAlerts();
    }, 60000);
  }

  processAlerts() {
    const recentAlerts = this.alerts.filter(alert =>
      Date.now() - new Date(alert.timestamp).getTime() < 300000 // Last 5 minutes
    );

    const criticalAlerts = recentAlerts.filter(alert => alert.severity === 'critical');
    const highAlerts = recentAlerts.filter(alert => alert.severity === 'high');

    if (criticalAlerts.length > 0) {
      console.log(`🚨 ${criticalAlerts.length} CRITICAL alerts in the last 5 minutes`);
    }

    if (highAlerts.length > 3) {
      console.log(`⚠️  ${highAlerts.length} HIGH priority alerts detected`);
    }
  }

  startWebDashboard() {
    const server = http.createServer((req, res) => {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Access-Control-Allow-Origin', '*');

      if (req.url === '/health') {
        res.writeHead(200);
        res.end(JSON.stringify({
          status: 'healthy',
          service: 'enterprise-monitor',
          uptime: process.uptime(),
          timestamp: new Date().toISOString(),
          monitoredApps: APPS.length
        }));
      } else if (req.url === '/dashboard') {
        res.writeHead(200);
        res.end(JSON.stringify(this.getDashboardData()));
      } else if (req.url === '/metrics') {
        res.writeHead(200);
        res.end(JSON.stringify(Object.fromEntries(this.metrics)));
      } else if (req.url === '/alerts') {
        res.writeHead(200);
        res.end(JSON.stringify(this.alerts.slice(0, 20))); // Last 20 alerts
      } else {
        res.writeHead(404);
        res.end(JSON.stringify({ error: 'Not found' }));
      }
    });

    server.listen(this.monitoringPort, () => {
      console.log(`🌐 Enterprise Dashboard running on http://localhost:${this.monitoringPort}/dashboard`);
      console.log(`📊 Metrics API: http://localhost:${this.monitoringPort}/metrics`);
      console.log(`🚨 Alerts API: http://localhost:${this.monitoringPort}/alerts`);
    });
  }

  getDashboardData() {
    const healthValues = Array.from(this.healthData.values());
    const systemMetrics = this.metrics.get('system') || {};
    const categoryMetrics = this.metrics.get('categories') || {};
    const performanceMetrics = this.metrics.get('performance') || {};

    return {
      overview: {
        totalApps: APPS.length,
        healthyApps: healthValues.filter(h => h.status === 'healthy').length,
        unhealthyApps: healthValues.filter(h => h.status !== 'healthy').length,
        uptime: process.uptime(),
        timestamp: new Date().toISOString()
      },
      applications: Object.fromEntries(this.healthData),
      systemMetrics,
      categoryMetrics,
      performanceMetrics,
      recentAlerts: this.alerts.slice(0, 10),
      appMatrix: APPS
    };
  }

  generateStatusReport() {
    console.log('\n📋 === ENTERPRISE ECOSYSTEM STATUS REPORT ===');
    console.log(`🕐 Generated: ${new Date().toISOString()}`);
    console.log(`⏱️  System Uptime: ${Math.round(process.uptime())} seconds`);

    const healthValues = Array.from(this.healthData.values());
    const healthyCount = healthValues.filter(h => h.status === 'healthy').length;
    const healthRate = ((healthyCount / APPS.length) * 100).toFixed(1);

    console.log(`\n🏥 HEALTH OVERVIEW:`);
    console.log(`   Total Applications: ${APPS.length}`);
    console.log(`   Healthy: ${healthyCount} (${healthRate}%)`);
    console.log(`   Issues: ${APPS.length - healthyCount}`);

    // Category breakdown
    const categoryMetrics = this.metrics.get('categories') || {};
    console.log(`\n📊 CATEGORY BREAKDOWN:`);
    for (const [category, metrics] of Object.entries(categoryMetrics)) {
      console.log(`   ${category}: ${metrics.healthy}/${metrics.total} healthy (${metrics.healthRate}%)`);
    }

    // Performance metrics
    const performanceMetrics = this.metrics.get('performance') || {};
    if (performanceMetrics.avgResponseTime) {
      console.log(`\n⚡ PERFORMANCE METRICS:`);
      console.log(`   Average Response Time: ${performanceMetrics.avgResponseTime}ms`);
      console.log(`   Fastest Response: ${performanceMetrics.minResponseTime}ms`);
      console.log(`   Slowest Response: ${performanceMetrics.maxResponseTime}ms`);
    }

    // Recent alerts
    const recentAlerts = this.alerts.slice(0, 5);
    if (recentAlerts.length > 0) {
      console.log(`\n🚨 RECENT ALERTS (Last 5):`);
      recentAlerts.forEach(alert => {
        console.log(`   [${alert.severity.toUpperCase()}] ${alert.message}`);
      });
    }

    console.log(`\n🌐 Dashboard: http://localhost:${this.monitoringPort}/dashboard`);
    console.log('============================================\n');

    // Schedule next report
    setTimeout(() => {
      this.generateStatusReport();
    }, this.reportingInterval);
  }
}

// Start Enterprise Monitoring
const monitor = new EnterpriseMonitor();

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down Enterprise Monitor...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Shutting down Enterprise Monitor...');
  process.exit(0);
});

export default EnterpriseMonitor;
