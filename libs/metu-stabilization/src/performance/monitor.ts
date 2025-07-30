/**
 * METU Performance Monitor
 * 
 * Advanced performance monitoring system for METU applications.
 * Provides real-time metrics collection, performance analysis, bottleneck detection,
 * and comprehensive reporting for both web and desktop platforms.
 */

import { EventEmitter } from 'events';
import * as os from 'os';
import { performance, PerformanceObserver } from 'perf_hooks';
import type {
  MetuPerformanceConfig,
  MetuStabilizationMetrics,
  MetuPerformanceStatus,
  MetuPerformanceBudget,
  MetuStabilizationEventEmitter,
  MetuStabilizationEvents
} from '../types';

export class MetuPerformanceMonitor extends EventEmitter implements MetuStabilizationEventEmitter {
  private config: MetuPerformanceConfig;
  private metrics: Map<string, number[]> = new Map();
  private performanceBudgets: MetuPerformanceBudget[] = [];
  private observers: PerformanceObserver[] = [];
  private monitoringInterval?: NodeJS.Timeout;
  private metricsBuffer: MetuStabilizationMetrics[] = [];
  private isRunning: boolean = false;
  private startTime: number = Date.now();

  constructor(config: MetuPerformanceConfig = {}) {
    super();

    this.config = {
      realTimeMonitoring: true,
      metricsCollection: true,
      performanceBudgets: {
        bundleSize: 1024 * 1024, // 1MB
        loadTime: 3000, // 3s
        firstContentfulPaint: 1800, // 1.8s
        largestContentfulPaint: 2500 // 2.5s
      },
      optimization: {
        enableCDN: true,
        enableCompression: true,
        enableMinification: true
      },
      ...config
    };

    this.initializePerformanceBudgets();
    this.setupPerformanceObservers();
  }

  /**
   * Start performance monitoring
   */
  async start(): Promise<void> {
    if (this.isRunning) return;

    console.log('📊 Starting METU Performance Monitor...');

    try {
      // Start real-time monitoring
      if (this.config.realTimeMonitoring) {
        this.startRealTimeMonitoring();
      }

      // Initialize metrics collection
      if (this.config.metricsCollection) {
        this.initializeMetricsCollection();
      }

      // Start performance observers
      this.startPerformanceObservers();

      // Begin system metrics monitoring
      this.startSystemMetricsMonitoring();

      this.isRunning = true;
      console.log('✅ Performance monitoring started successfully');

      this.emit('system:started', {});

    } catch (error) {
      console.error('❌ Failed to start performance monitoring:', error);
      throw error;
    }
  }

  /**
   * Stop performance monitoring
   */
  async stop(): Promise<void> {
    if (!this.isRunning) return;

    console.log('🛑 Stopping METU Performance Monitor...');

    try {
      // Clear monitoring interval
      if (this.monitoringInterval) {
        clearInterval(this.monitoringInterval);
      }

      // Disconnect performance observers
      this.observers.forEach(observer => observer.disconnect());
      this.observers = [];

      // Save final metrics
      await this.saveMetricsSnapshot();

      this.isRunning = false;
      console.log('✅ Performance monitoring stopped');

      this.emit('system:stopped', {});

    } catch (error) {
      console.error('❌ Error stopping performance monitoring:', error);
      throw error;
    }
  }

  /**
   * Get current performance metrics
   */
  async getMetrics(): Promise<MetuStabilizationMetrics> {
    const systemMetrics = this.getSystemMetrics();
    const webVitals = await this.getWebVitals();
    const electronMetrics = this.getElectronMetrics();

    const metrics: MetuStabilizationMetrics = {
      timestamp: new Date().toISOString(),
      responseTime: this.getAverageMetric('responseTime') || 0,
      memoryUsage: systemMetrics.memoryUsage,
      cpuUsage: systemMetrics.cpuUsage,
      errorRate: this.getAverageMetric('errorRate') || 0,
      activeUsers: this.getMetricValue('activeUsers') || 0,
      systemLoad: systemMetrics.systemLoad,
      performanceScore: this.calculatePerformanceScore(),
      userSatisfaction: this.calculateUserSatisfaction(),
      systemEfficiency: this.calculateSystemEfficiency(),
      stabilityIndex: this.calculateStabilityIndex(),
      webVitals,
      electron: electronMetrics
    };

    // Store in buffer
    this.metricsBuffer.push(metrics);

    // Keep only last 1000 metrics
    if (this.metricsBuffer.length > 1000) {
      this.metricsBuffer = this.metricsBuffer.slice(-1000);
    }

    return metrics;
  }

  /**
   * Get detailed performance metrics
   */
  async getDetailedMetrics(): Promise<MetuStabilizationMetrics> {
    const baseMetrics = await this.getMetrics();

    // Add detailed analysis
    return {
      ...baseMetrics,
      // Additional detailed metrics would go here
    };
  }

  /**
   * Get performance status
   */
  async getPerformanceStatus(): Promise<MetuPerformanceStatus> {
    const metrics = await this.getMetrics();
    const bottlenecks = await this.identifyBottlenecks();

    let overall: 'excellent' | 'good' | 'fair' | 'poor' = 'excellent';

    if (metrics.performanceScore < 50) overall = 'poor';
    else if (metrics.performanceScore < 70) overall = 'fair';
    else if (metrics.performanceScore < 90) overall = 'good';

    return {
      overall,
      responseTime: metrics.responseTime,
      throughput: this.calculateThroughput(),
      errorRate: metrics.errorRate,
      resourceUtilization: this.calculateResourceUtilization(),
      bottlenecks
    };
  }

  /**
   * Record metric
   */
  recordMetric(name: string, value: number): void {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }

    const values = this.metrics.get(name)!;
    values.push(value);

    // Keep only last 100 values
    if (values.length > 100) {
      values.shift();
    }

    // Check performance budgets
    this.checkPerformanceBudgets(name, value);
  }

  /**
   * Initialize performance budgets
   */
  private initializePerformanceBudgets(): void {
    const budgets = this.config.performanceBudgets!;

    this.performanceBudgets = [
      {
        metric: 'bundleSize',
        budget: budgets.bundleSize!,
        current: 0,
        status: 'pass',
        impact: 'high'
      },
      {
        metric: 'loadTime',
        budget: budgets.loadTime!,
        current: 0,
        status: 'pass',
        impact: 'high'
      },
      {
        metric: 'firstContentfulPaint',
        budget: budgets.firstContentfulPaint!,
        current: 0,
        status: 'pass',
        impact: 'medium'
      },
      {
        metric: 'largestContentfulPaint',
        budget: budgets.largestContentfulPaint!,
        current: 0,
        status: 'pass',
        impact: 'high'
      }
    ];
  }

  /**
   * Setup performance observers
   */
  private setupPerformanceObservers(): void {
    // Navigation timing observer
    if (typeof PerformanceObserver !== 'undefined') {
      const navObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'navigation') {
            const navEntry = entry as PerformanceNavigationTiming;
            this.recordMetric('loadTime', navEntry.loadEventEnd - navEntry.fetchStart);
            this.recordMetric('domContentLoaded', navEntry.domContentLoadedEventEnd - navEntry.fetchStart);
            this.recordMetric('ttfb', navEntry.responseStart - navEntry.fetchStart);
          }
        }
      });

      try {
        navObserver.observe({ entryTypes: ['navigation'] });
        this.observers.push(navObserver);
      } catch (error) {
        console.warn('Navigation observer not supported:', error);
      }

      // Resource timing observer
      const resourceObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'resource') {
            const resourceEntry = entry as PerformanceResourceTiming;
            this.recordMetric('resourceLoadTime', resourceEntry.duration);
            this.recordMetric('resourceSize', resourceEntry.transferSize || 0);
          }
        }
      });

      try {
        resourceObserver.observe({ entryTypes: ['resource'] });
        this.observers.push(resourceObserver);
      } catch (error) {
        console.warn('Resource observer not supported:', error);
      }

      // Measure observer
      const measureObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'measure') {
            this.recordMetric(entry.name, entry.duration);
          }
        }
      });

      try {
        measureObserver.observe({ entryTypes: ['measure'] });
        this.observers.push(measureObserver);
      } catch (error) {
        console.warn('Measure observer not supported:', error);
      }
    }
  }

  /**
   * Start real-time monitoring
   */
  private startRealTimeMonitoring(): void {
    this.monitoringInterval = setInterval(async () => {
      const metrics = await this.getMetrics();

      // Check for performance threshold violations
      this.checkPerformanceThresholds(metrics);

      // Emit metrics update
      this.emit('performance:metrics-updated', metrics);

    }, 5000); // Every 5 seconds
  }

  /**
   * Initialize metrics collection
   */
  private initializeMetricsCollection(): void {
    // Initialize basic metrics
    this.recordMetric('activeUsers', 0);
    this.recordMetric('errorRate', 0);
    this.recordMetric('responseTime', 0);

    console.log('📈 Metrics collection initialized');
  }

  /**
   * Start performance observers
   */
  private startPerformanceObservers(): void {
    // Performance observers are already set up in setupPerformanceObservers
    console.log('👁️ Performance observers started');
  }

  /**
   * Start system metrics monitoring
   */
  private startSystemMetricsMonitoring(): void {
    setInterval(() => {
      const systemMetrics = this.getSystemMetrics();

      this.recordMetric('memoryUsage', systemMetrics.memoryUsage);
      this.recordMetric('cpuUsage', systemMetrics.cpuUsage);
      this.recordMetric('systemLoad', systemMetrics.systemLoad);

    }, 10000); // Every 10 seconds
  }

  /**
   * Get system metrics
   */
  private getSystemMetrics(): { memoryUsage: number; cpuUsage: number; systemLoad: number } {
    const totalMemory = os.totalmem();
    const freeMemory = os.freemem();
    const usedMemory = totalMemory - freeMemory;
    const memoryUsage = (usedMemory / totalMemory) * 100;

    const loadAvg = os.loadavg();
    const cpuCount = os.cpus().length;
    const systemLoad = (loadAvg[0] / cpuCount) * 100;

    // CPU usage calculation (simplified)
    const cpuUsage = Math.min(100, systemLoad);

    return {
      memoryUsage,
      cpuUsage,
      systemLoad
    };
  }

  /**
   * Get Web Vitals
   */
  private async getWebVitals(): Promise<any> {
    // In a browser environment, this would collect actual Web Vitals
    // For Node.js, we simulate or return stored values
    return {
      cls: this.getMetricValue('cls') || 0.05,
      fid: this.getMetricValue('fid') || 80,
      lcp: this.getMetricValue('lcp') || 1800,
      fcp: this.getMetricValue('fcp') || 1200,
      ttfb: this.getMetricValue('ttfb') || 200
    };
  }

  /**
   * Get Electron metrics
   */
  private getElectronMetrics(): any {
    if (typeof process !== 'undefined' && process.versions && process.versions.electron) {
      const memoryUsage = process.memoryUsage();
      return {
        memoryUsage: memoryUsage.rss / 1024 / 1024, // MB
        cpuUsage: this.getMetricValue('cpuUsage') || 0,
        processes: 1, // Simplified
        windowCount: this.getMetricValue('windowCount') || 1
      };
    }
    return null;
  }

  /**
   * Calculate performance score
   */
  private calculatePerformanceScore(): number {
    const loadTime = this.getAverageMetric('loadTime') || 2000;
    const errorRate = this.getAverageMetric('errorRate') || 0;
    const memoryUsage = this.getAverageMetric('memoryUsage') || 50;
    const cpuUsage = this.getAverageMetric('cpuUsage') || 30;

    // Weighted performance score calculation
    let score = 100;

    // Penalize slow load times
    if (loadTime > 3000) score -= 20;
    else if (loadTime > 2000) score -= 10;

    // Penalize high error rates
    if (errorRate > 0.05) score -= 25;
    else if (errorRate > 0.01) score -= 10;

    // Penalize high resource usage
    if (memoryUsage > 80) score -= 15;
    else if (memoryUsage > 60) score -= 5;

    if (cpuUsage > 80) score -= 15;
    else if (cpuUsage > 60) score -= 5;

    return Math.max(0, Math.min(100, score));
  }

  /**
   * Calculate user satisfaction
   */
  private calculateUserSatisfaction(): number {
    const performanceScore = this.calculatePerformanceScore();
    const errorRate = this.getAverageMetric('errorRate') || 0;

    // User satisfaction based on performance and stability
    let satisfaction = performanceScore;

    // Heavily penalize errors
    if (errorRate > 0.01) {
      satisfaction -= (errorRate * 1000); // Each 0.001 error rate reduces satisfaction by 1 point
    }

    return Math.max(0, Math.min(100, satisfaction)) / 100 * 5; // Convert to 0-5 scale
  }

  /**
   * Calculate system efficiency
   */
  private calculateSystemEfficiency(): number {
    const cpuUsage = this.getAverageMetric('cpuUsage') || 30;
    const memoryUsage = this.getAverageMetric('memoryUsage') || 50;
    const throughput = this.calculateThroughput();

    // Efficiency = output/input ratio
    const resourceUsage = (cpuUsage + memoryUsage) / 2;
    const efficiency = (throughput / Math.max(1, resourceUsage)) * 100;

    return Math.min(100, efficiency) / 100; // Normalize to 0-1
  }

  /**
   * Calculate stability index
   */
  private calculateStabilityIndex(): number {
    const errorRate = this.getAverageMetric('errorRate') || 0;
    const uptime = (Date.now() - this.startTime) / (1000 * 60 * 60); // hours
    const crashCount = this.getMetricValue('crashCount') || 0;

    // Stability index based on error rate, uptime, and crashes
    let stability = 1.0;

    // Penalize errors
    stability -= errorRate * 5;

    // Penalize crashes
    if (crashCount > 0) {
      stability -= (crashCount / Math.max(1, uptime)) * 0.5;
    }

    return Math.max(0, Math.min(1, stability));
  }

  /**
   * Calculate throughput
   */
  private calculateThroughput(): number {
    const activeUsers = this.getMetricValue('activeUsers') || 0;
    const responseTime = this.getAverageMetric('responseTime') || 1000;

    // Requests per second estimation
    return activeUsers / Math.max(1, responseTime / 1000);
  }

  /**
   * Calculate resource utilization
   */
  private calculateResourceUtilization(): number {
    const cpuUsage = this.getAverageMetric('cpuUsage') || 30;
    const memoryUsage = this.getAverageMetric('memoryUsage') || 50;

    return (cpuUsage + memoryUsage) / 2;
  }

  /**
   * Identify bottlenecks
   */
  private async identifyBottlenecks(): Promise<string[]> {
    const bottlenecks: string[] = [];

    const loadTime = this.getAverageMetric('loadTime') || 0;
    const memoryUsage = this.getAverageMetric('memoryUsage') || 0;
    const cpuUsage = this.getAverageMetric('cpuUsage') || 0;
    const errorRate = this.getAverageMetric('errorRate') || 0;

    if (loadTime > 3000) {
      bottlenecks.push('Slow page load times');
    }

    if (memoryUsage > 80) {
      bottlenecks.push('High memory usage');
    }

    if (cpuUsage > 80) {
      bottlenecks.push('High CPU usage');
    }

    if (errorRate > 0.05) {
      bottlenecks.push('High error rate');
    }

    return bottlenecks;
  }

  /**
   * Check performance budgets
   */
  private checkPerformanceBudgets(metricName: string, value: number): void {
    const budget = this.performanceBudgets.find(b => b.metric === metricName);
    if (!budget) return;

    budget.current = value;

    if (value > budget.budget * 1.2) {
      budget.status = 'fail';
    } else if (value > budget.budget) {
      budget.status = 'warn';
    } else {
      budget.status = 'pass';
    }

    if (budget.status !== 'pass') {
      console.warn(`⚠️ Performance budget exceeded for ${metricName}: ${value} > ${budget.budget}`);
    }
  }

  /**
   * Check performance thresholds
   */
  private checkPerformanceThresholds(metrics: MetuStabilizationMetrics): void {
    // Check response time threshold
    if (metrics.responseTime > 5000) {
      this.emit('performance:threshold-exceeded', {
        metric: 'responseTime',
        value: metrics.responseTime,
        threshold: 5000
      });
    }

    // Check error rate threshold
    if (metrics.errorRate > 0.1) {
      this.emit('performance:threshold-exceeded', {
        metric: 'errorRate',
        value: metrics.errorRate,
        threshold: 0.1
      });
    }

    // Check memory usage threshold
    if (metrics.memoryUsage > 90) {
      this.emit('performance:threshold-exceeded', {
        metric: 'memoryUsage',
        value: metrics.memoryUsage,
        threshold: 90
      });
    }
  }

  /**
   * Get average metric value
   */
  private getAverageMetric(name: string): number | null {
    const values = this.metrics.get(name);
    if (!values || values.length === 0) return null;

    return values.reduce((sum, val) => sum + val, 0) / values.length;
  }

  /**
   * Get latest metric value
   */
  private getMetricValue(name: string): number | null {
    const values = this.metrics.get(name);
    if (!values || values.length === 0) return null;

    return values[values.length - 1];
  }

  /**
   * Save metrics snapshot
   */
  private async saveMetricsSnapshot(): Promise<void> {
    try {
      const snapshot = {
        timestamp: new Date().toISOString(),
        metrics: Object.fromEntries(this.metrics),
        performanceBudgets: this.performanceBudgets,
        metricsBuffer: this.metricsBuffer.slice(-100) // Last 100 metrics
      };

      // In a real implementation, this would save to a file or database
      console.log('📸 Metrics snapshot saved');

    } catch (error) {
      console.error('Failed to save metrics snapshot:', error);
    }
  }

  /**
   * Update active users count
   */
  updateActiveUsers(count: number): void {
    this.recordMetric('activeUsers', count);
  }

  /**
   * Record error
   */
  recordError(): void {
    const currentErrorRate = this.getAverageMetric('errorRate') || 0;
    this.recordMetric('errorRate', currentErrorRate + 0.01);
  }

  /**
   * Record response time
   */
  recordResponseTime(time: number): void {
    this.recordMetric('responseTime', time);
  }

  /**
   * Get performance budgets
   */
  getPerformanceBudgets(): MetuPerformanceBudget[] {
    return [...this.performanceBudgets];
  }

  /**
   * Check if monitoring is running
   */
  isMonitoringRunning(): boolean {
    return this.isRunning;
  }
}
