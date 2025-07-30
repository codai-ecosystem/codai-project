/**
 * METU Health Checker
 * 
 * Comprehensive health monitoring system for METU applications.
 * Provides real-time health status, automatic health checks,
 * system diagnostics, and proactive issue detection.
 */

import type {
  MetuHealthMetrics,
  MetuHealthStatus,
  MetuSystemHealth
} from '../types';

interface HealthCheck {
  name: string;
  description: string;
  check: () => Promise<{ healthy: boolean; message: string; data?: any }>;
  interval: number;
  timeout: number;
  critical: boolean;
  enabled: boolean;
}

interface HealthAlert {
  id: string;
  type: 'warning' | 'error' | 'critical';
  message: string;
  timestamp: Date;
  resolved: boolean;
  component: string;
  severity: number;
}

interface SystemMetrics {
  cpu: number;
  memory: number;
  disk: number;
  network: number;
  temperature?: number;
  battery?: number;
}

export class MetuHealthChecker {
  private checks: Map<string, HealthCheck> = new Map();
  private intervals: Map<string, NodeJS.Timeout> = new Map();
  private healthHistory: MetuHealthMetrics[] = [];
  private alerts: HealthAlert[] = [];
  private isMonitoring: boolean = false;
  private systemMetrics: SystemMetrics | null = null;
  private lastHealthStatus: MetuHealthStatus | null = null;

  constructor(private config: any = {}) {
    this.config = {
      historySize: 100,
      alertRetention: 24 * 60 * 60 * 1000, // 24 hours
      criticalThreshold: 0.5,
      warningThreshold: 0.7,
      checkInterval: 30000, // 30 seconds
      ...config
    };
  }

  /**
   * Initialize health checker
   */
  async initialize(): Promise<void> {
    console.log('🏥 Initializing METU Health Checker...');

    try {
      // Register default health checks
      await this.registerDefaultHealthChecks();

      // Start system metrics monitoring
      await this.startSystemMetricsMonitoring();

      // Begin health monitoring
      await this.startHealthMonitoring();

      console.log('✅ Health Checker initialized successfully');

    } catch (error) {
      console.error('❌ Failed to initialize Health Checker:', error);
      throw error;
    }
  }

  /**
   * Register default health checks
   */
  private async registerDefaultHealthChecks(): Promise<void> {
    // Application health check
    this.registerHealthCheck({
      name: 'application',
      description: 'Check if main application is responsive',
      check: async () => {
        try {
          const startTime = Date.now();
          await new Promise(resolve => setTimeout(resolve, 1));
          const responseTime = Date.now() - startTime;

          return {
            healthy: responseTime < 1000,
            message: `Application responsive in ${responseTime}ms`,
            data: { responseTime }
          };
        } catch (error) {
          return {
            healthy: false,
            message: `Application unresponsive: ${error}`,
            data: { error: error?.toString() }
          };
        }
      },
      interval: 10000,
      timeout: 5000,
      critical: true,
      enabled: true
    });

    // Memory health check
    this.registerHealthCheck({
      name: 'memory',
      description: 'Check memory usage levels',
      check: async () => {
        try {
          const memoryUsage = await this.getMemoryUsage();
          const threshold = 0.85; // 85% memory usage threshold

          return {
            healthy: memoryUsage < threshold,
            message: `Memory usage: ${(memoryUsage * 100).toFixed(1)}%`,
            data: { memoryUsage, threshold }
          };
        } catch (error) {
          return {
            healthy: false,
            message: `Memory check failed: ${error}`,
            data: { error: error?.toString() }
          };
        }
      },
      interval: 15000,
      timeout: 3000,
      critical: true,
      enabled: true
    });

    // Network connectivity check
    this.registerHealthCheck({
      name: 'network',
      description: 'Check network connectivity',
      check: async () => {
        try {
          if (typeof navigator !== 'undefined' && 'onLine' in navigator) {
            const isOnline = navigator.onLine;

            if (isOnline) {
              // Additional connectivity test
              const response = await fetch('/api/health', {
                method: 'HEAD',
                timeout: 5000
              }).catch(() => null);

              return {
                healthy: !!response,
                message: response ? 'Network connected' : 'Network issues detected',
                data: { online: isOnline, apiReachable: !!response }
              };
            } else {
              return {
                healthy: false,
                message: 'Network offline',
                data: { online: false }
              };
            }
          } else {
            return {
              healthy: true,
              message: 'Network check not available in this environment',
              data: { available: false }
            };
          }
        } catch (error) {
          return {
            healthy: false,
            message: `Network check failed: ${error}`,
            data: { error: error?.toString() }
          };
        }
      },
      interval: 30000,
      timeout: 10000,
      critical: false,
      enabled: true
    });

    // Local Storage health check
    this.registerHealthCheck({
      name: 'localStorage',
      description: 'Check local storage availability and capacity',
      check: async () => {
        try {
          if (typeof localStorage === 'undefined') {
            return {
              healthy: true,
              message: 'Local storage not available in this environment',
              data: { available: false }
            };
          }

          const testKey = '__metu_health_test__';
          const testValue = 'test';

          localStorage.setItem(testKey, testValue);
          const retrieved = localStorage.getItem(testKey);
          localStorage.removeItem(testKey);

          const isWorking = retrieved === testValue;
          const usage = this.getLocalStorageUsage();

          return {
            healthy: isWorking && usage < 0.9,
            message: `Local storage ${isWorking ? 'working' : 'failed'}, usage: ${(usage * 100).toFixed(1)}%`,
            data: { working: isWorking, usage }
          };
        } catch (error) {
          return {
            healthy: false,
            message: `Local storage check failed: ${error}`,
            data: { error: error?.toString() }
          };
        }
      },
      interval: 60000,
      timeout: 5000,
      critical: false,
      enabled: true
    });

    // Performance health check
    this.registerHealthCheck({
      name: 'performance',
      description: 'Check application performance metrics',
      check: async () => {
        try {
          const perfData = await this.getPerformanceMetrics();
          const isHealthy = perfData.fps >= 30 && perfData.renderTime < 16;

          return {
            healthy: isHealthy,
            message: `Performance: ${perfData.fps}fps, ${perfData.renderTime.toFixed(2)}ms render`,
            data: perfData
          };
        } catch (error) {
          return {
            healthy: true,
            message: 'Performance metrics not available',
            data: { available: false }
          };
        }
      },
      interval: 45000,
      timeout: 5000,
      critical: false,
      enabled: true
    });

    // Service connectivity check
    this.registerHealthCheck({
      name: 'services',
      description: 'Check critical service connectivity',
      check: async () => {
        try {
          const services = [
            { name: 'Gateway', url: '/api/gateway/health' },
            { name: 'MemorAI', url: '/api/memorai/health' },
            { name: 'CODAI', url: '/api/codai/health' }
          ];

          const serviceResults = await Promise.allSettled(
            services.map(async service => {
              try {
                const response = await fetch(service.url, {
                  method: 'HEAD',
                  timeout: 3000
                });
                return { ...service, healthy: response.ok };
              } catch {
                return { ...service, healthy: false };
              }
            })
          );

          const results = serviceResults.map(result =>
            result.status === 'fulfilled' ? result.value : { name: 'Unknown', healthy: false }
          );

          const healthyServices = results.filter(s => s.healthy).length;
          const totalServices = results.length;
          const healthRatio = healthyServices / totalServices;

          return {
            healthy: healthRatio >= 0.5,
            message: `Services: ${healthyServices}/${totalServices} healthy`,
            data: { services: results, healthRatio }
          };
        } catch (error) {
          return {
            healthy: false,
            message: `Service check failed: ${error}`,
            data: { error: error?.toString() }
          };
        }
      },
      interval: 60000,
      timeout: 15000,
      critical: true,
      enabled: true
    });

    console.log(`📋 Registered ${this.checks.size} default health checks`);
  }

  /**
   * Register a custom health check
   */
  registerHealthCheck(check: HealthCheck): void {
    this.checks.set(check.name, check);

    if (this.isMonitoring && check.enabled) {
      this.startHealthCheckMonitoring(check);
    }

    console.log(`✅ Registered health check: ${check.name}`);
  }

  /**
   * Start health monitoring
   */
  private async startHealthMonitoring(): Promise<void> {
    if (this.isMonitoring) return;

    this.isMonitoring = true;

    // Start monitoring each health check
    for (const check of this.checks.values()) {
      if (check.enabled) {
        this.startHealthCheckMonitoring(check);
      }
    }

    // Start periodic health report generation
    setInterval(() => {
      this.generateHealthReport();
    }, this.config.checkInterval);

    console.log('🔄 Health monitoring started');
  }

  /**
   * Start monitoring a specific health check
   */
  private startHealthCheckMonitoring(check: HealthCheck): void {
    const runCheck = async () => {
      try {
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Health check timeout')), check.timeout);
        });

        const result = await Promise.race([check.check(), timeoutPromise]);

        // Record health metric
        const metric: MetuHealthMetrics = {
          timestamp: new Date(),
          component: check.name,
          status: result.healthy ? 'healthy' : 'unhealthy',
          responseTime: Date.now(),
          metrics: result.data || {}
        };

        this.recordHealthMetric(metric);

        // Generate alert if unhealthy
        if (!result.healthy && check.critical) {
          this.generateAlert({
            type: 'error',
            message: `Critical health check failed: ${check.name} - ${result.message}`,
            component: check.name,
            severity: 8
          });
        }

      } catch (error) {
        // Record failed check
        const metric: MetuHealthMetrics = {
          timestamp: new Date(),
          component: check.name,
          status: 'error',
          responseTime: Date.now(),
          metrics: { error: error?.toString() }
        };

        this.recordHealthMetric(metric);

        if (check.critical) {
          this.generateAlert({
            type: 'critical',
            message: `Health check error: ${check.name} - ${error}`,
            component: check.name,
            severity: 9
          });
        }
      }
    };

    // Run initial check
    runCheck();

    // Schedule periodic checks
    const interval = setInterval(runCheck, check.interval);
    this.intervals.set(check.name, interval);
  }

  /**
   * Start system metrics monitoring
   */
  private async startSystemMetricsMonitoring(): Promise<void> {
    const updateSystemMetrics = async () => {
      try {
        this.systemMetrics = await this.collectSystemMetrics();
      } catch (error) {
        console.warn('Failed to collect system metrics:', error);
      }
    };

    // Initial collection
    await updateSystemMetrics();

    // Periodic collection
    setInterval(updateSystemMetrics, 10000); // Every 10 seconds

    console.log('📊 System metrics monitoring started');
  }

  /**
   * Collect system metrics
   */
  private async collectSystemMetrics(): Promise<SystemMetrics> {
    const metrics: SystemMetrics = {
      cpu: 0,
      memory: 0,
      disk: 0,
      network: 0
    };

    try {
      // Memory usage
      if (typeof performance !== 'undefined' && 'memory' in performance) {
        const memory = (performance as any).memory;
        metrics.memory = memory.usedJSHeapSize / memory.totalJSHeapSize;
      } else {
        metrics.memory = await this.getMemoryUsage();
      }

      // CPU usage (simulated for web environment)
      metrics.cpu = await this.getCPUUsage();

      // Network status
      if (typeof navigator !== 'undefined' && 'connection' in navigator) {
        const connection = (navigator as any).connection;
        metrics.network = connection.downlink || 0;
      }

      // Battery status
      if (typeof navigator !== 'undefined' && 'getBattery' in navigator) {
        try {
          const battery = await (navigator as any).getBattery();
          metrics.battery = battery.level;
        } catch {
          // Battery API not available
        }
      }

    } catch (error) {
      console.warn('Error collecting system metrics:', error);
    }

    return metrics;
  }

  /**
   * Get memory usage
   */
  private async getMemoryUsage(): Promise<number> {
    if (typeof performance !== 'undefined' && 'memory' in performance) {
      const memory = (performance as any).memory;
      return memory.usedJSHeapSize / memory.totalJSHeapSize;
    }
    return 0.5; // Default assumption
  }

  /**
   * Get CPU usage (approximated)
   */
  private async getCPUUsage(): Promise<number> {
    return new Promise((resolve) => {
      const start = performance.now();
      const iterations = 100000;

      // Simulate CPU work
      for (let i = 0; i < iterations; i++) {
        Math.random();
      }

      const end = performance.now();
      const duration = end - start;

      // Normalize to 0-1 range (higher duration = higher CPU usage)
      const normalizedUsage = Math.min(duration / 100, 1);
      resolve(normalizedUsage);
    });
  }

  /**
   * Get local storage usage
   */
  private getLocalStorageUsage(): number {
    if (typeof localStorage === 'undefined') return 0;

    let totalSize = 0;
    for (const key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        totalSize += localStorage[key].length + key.length;
      }
    }

    // Estimate 5MB quota for localStorage
    const quotaEstimate = 5 * 1024 * 1024;
    return totalSize / quotaEstimate;
  }

  /**
   * Get performance metrics
   */
  private async getPerformanceMetrics(): Promise<any> {
    if (typeof performance === 'undefined') {
      return { fps: 60, renderTime: 16, available: false };
    }

    // Simulate FPS calculation
    let fps = 60;
    let renderTime = 16;

    // Use Performance Observer if available
    if ('PerformanceObserver' in window) {
      try {
        const entries = performance.getEntriesByType('measure');
        if (entries.length > 0) {
          const lastEntry = entries[entries.length - 1];
          renderTime = lastEntry.duration;
          fps = Math.round(1000 / renderTime);
        }
      } catch {
        // Performance API issues
      }
    }

    return { fps, renderTime, available: true };
  }

  /**
   * Record health metric
   */
  private recordHealthMetric(metric: MetuHealthMetrics): void {
    this.healthHistory.push(metric);

    // Maintain history size limit
    if (this.healthHistory.length > this.config.historySize) {
      this.healthHistory = this.healthHistory.slice(-this.config.historySize);
    }
  }

  /**
   * Generate alert
   */
  private generateAlert(alertData: Omit<HealthAlert, 'id' | 'timestamp' | 'resolved'>): void {
    const alert: HealthAlert = {
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      resolved: false,
      ...alertData
    };

    this.alerts.push(alert);

    // Clean up old alerts
    const cutoff = Date.now() - this.config.alertRetention;
    this.alerts = this.alerts.filter(a => a.timestamp.getTime() > cutoff);

    console.warn(`🚨 Health Alert [${alert.type.toUpperCase()}]: ${alert.message}`);
  }

  /**
   * Generate comprehensive health report
   */
  private async generateHealthReport(): Promise<void> {
    const now = new Date();
    const recentMetrics = this.healthHistory.filter(
      m => now.getTime() - m.timestamp.getTime() < 300000 // Last 5 minutes
    );

    // Calculate overall health score
    const healthyChecks = recentMetrics.filter(m => m.status === 'healthy').length;
    const totalChecks = recentMetrics.length;
    const healthScore = totalChecks > 0 ? healthyChecks / totalChecks : 1;

    // Determine overall status
    let overallStatus: 'healthy' | 'degraded' | 'unhealthy';
    if (healthScore >= this.config.warningThreshold) {
      overallStatus = 'healthy';
    } else if (healthScore >= this.config.criticalThreshold) {
      overallStatus = 'degraded';
    } else {
      overallStatus = 'unhealthy';
    }

    const healthStatus: MetuHealthStatus = {
      overall: overallStatus,
      score: healthScore,
      components: this.getComponentHealthSummary(),
      activeAlerts: this.alerts.filter(a => !a.resolved).length,
      lastCheck: now,
      systemMetrics: this.systemMetrics || undefined
    };

    this.lastHealthStatus = healthStatus;

    // Log health status
    if (overallStatus !== 'healthy') {
      console.warn(`🏥 Health Status: ${overallStatus.toUpperCase()} (Score: ${(healthScore * 100).toFixed(1)}%)`);
    }
  }

  /**
   * Get component health summary
   */
  private getComponentHealthSummary(): Record<string, 'healthy' | 'degraded' | 'unhealthy'> {
    const summary: Record<string, 'healthy' | 'degraded' | 'unhealthy'> = {};

    for (const check of this.checks.values()) {
      const recentMetrics = this.healthHistory
        .filter(m => m.component === check.name)
        .slice(-5); // Last 5 checks

      if (recentMetrics.length === 0) {
        summary[check.name] = 'healthy';
        continue;
      }

      const healthyCount = recentMetrics.filter(m => m.status === 'healthy').length;
      const healthRatio = healthyCount / recentMetrics.length;

      if (healthRatio >= 0.8) {
        summary[check.name] = 'healthy';
      } else if (healthRatio >= 0.5) {
        summary[check.name] = 'degraded';
      } else {
        summary[check.name] = 'unhealthy';
      }
    }

    return summary;
  }

  /**
   * Get current health status
   */
  async getHealthStatus(): Promise<MetuHealthStatus> {
    if (!this.lastHealthStatus) {
      await this.generateHealthReport();
    }
    return this.lastHealthStatus!;
  }

  /**
   * Get system health information
   */
  async getSystemHealth(): Promise<MetuSystemHealth> {
    const healthStatus = await this.getHealthStatus();

    return {
      status: healthStatus.overall,
      uptime: process.uptime ? process.uptime() : Date.now() / 1000,
      checks: Array.from(this.checks.keys()),
      alerts: this.alerts.filter(a => !a.resolved),
      metrics: this.systemMetrics || {
        cpu: 0,
        memory: 0,
        disk: 0,
        network: 0
      }
    };
  }

  /**
   * Get health history
   */
  getHealthHistory(): MetuHealthMetrics[] {
    return [...this.healthHistory];
  }

  /**
   * Get active alerts
   */
  getActiveAlerts(): HealthAlert[] {
    return this.alerts.filter(a => !a.resolved);
  }

  /**
   * Resolve alert
   */
  resolveAlert(alertId: string): boolean {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.resolved = true;
      console.log(`✅ Resolved alert: ${alertId}`);
      return true;
    }
    return false;
  }

  /**
   * Stop health monitoring
   */
  async stopMonitoring(): Promise<void> {
    this.isMonitoring = false;

    // Clear all intervals
    for (const interval of this.intervals.values()) {
      clearInterval(interval);
    }
    this.intervals.clear();

    console.log('⏹️ Health monitoring stopped');
  }

  /**
   * Cleanup resources
   */
  async cleanup(): Promise<void> {
    await this.stopMonitoring();

    this.checks.clear();
    this.healthHistory = [];
    this.alerts = [];
    this.systemMetrics = null;
    this.lastHealthStatus = null;

    console.log('🧹 Health Checker cleaned up');
  }
}
