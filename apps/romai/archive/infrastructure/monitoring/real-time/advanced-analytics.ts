/**
 * ROMAI Advanced Analytics Engine - Day 19
 * TypeScript implementation with comprehensive data analysis
 */

import { EventEmitter } from 'events';

export interface AnalyticsData {
  timestamp: Date;
  service: string;
  metrics: {
    responseTime: number;
    cpuUsage: number;
    memoryUsage: number;
    errorRate: number;
    throughput: number;
    activeConnections: number;
  };
  logs: {
    level: 'INFO' | 'WARN' | 'ERROR' | 'DEBUG';
    message: string;
    count: number;
  }[];
  health: {
    status: 'healthy' | 'unhealthy' | 'degraded';
    uptime: number;
    lastCheck: Date;
  };
}

export interface TrendData {
  timeframe: '1h' | '6h' | '24h' | '7d';
  dataPoints: {
    timestamp: Date;
    value: number;
    metric: string;
  }[];
  trend: 'increasing' | 'decreasing' | 'stable';
  changePercent: number;
  prediction?: number;
}

export interface AlertRule {
  id: string;
  name: string;
  metric: string;
  condition: 'gt' | 'lt' | 'eq';
  threshold: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  enabled: boolean;
  lastTriggered?: Date;
}

export interface DashboardWidget {
  id: string;
  type: 'chart' | 'metric' | 'log' | 'health' | 'alert';
  title: string;
  size: 'small' | 'medium' | 'large';
  config: {
    dataSource: string;
    refreshInterval: number;
    chartType?: 'line' | 'bar' | 'pie' | 'gauge';
    timeRange?: string;
    filters?: Record<string, any>;
  };
}

export class AdvancedAnalyticsEngine extends EventEmitter {
  private dataStore: Map<string, AnalyticsData[]> = new Map();
  private trendAnalyzer: TrendAnalyzer;
  private alertManager: AlertManager;
  private predictionEngine: PredictionEngine;
  private dashboardManager: DashboardManager;

  constructor() {
    super();
    this.trendAnalyzer = new TrendAnalyzer();
    this.alertManager = new AlertManager();
    this.predictionEngine = new PredictionEngine();
    this.dashboardManager = new DashboardManager();

    this.initializeAnalytics();
  }

  private initializeAnalytics(): void {
    console.log('🚀 Advanced Analytics Engine Starting...');

    // Start periodic analysis
    setInterval(() => {
      this.performAnalysis();
    }, 30000); // Every 30 seconds

    // Start trend analysis
    setInterval(() => {
      this.analyzeTrends();
    }, 60000); // Every minute

    console.log('✅ Advanced Analytics Engine Ready');
  }

  public ingestData(data: AnalyticsData): void {
    const service = data.service;

    if (!this.dataStore.has(service)) {
      this.dataStore.set(service, []);
    }

    const serviceData = this.dataStore.get(service)!;
    serviceData.push(data);

    // Keep only last 1000 data points per service
    if (serviceData.length > 1000) {
      serviceData.splice(0, serviceData.length - 1000);
    }

    // Emit real-time event
    this.emit('dataIngested', { service, data });

    // Check alerts
    this.alertManager.checkAlerts(data);
  }

  public getServiceMetrics(service: string, timeframe?: string): AnalyticsData[] {
    const data = this.dataStore.get(service) || [];

    if (!timeframe) return data;

    const cutoff = this.getTimeframeCutoff(timeframe);
    return data.filter(d => d.timestamp >= cutoff);
  }

  public getAggregatedMetrics(services: string[], timeframe: string): any {
    const allData: AnalyticsData[] = [];

    services.forEach(service => {
      const serviceData = this.getServiceMetrics(service, timeframe);
      allData.push(...serviceData);
    });

    if (allData.length === 0) return null;

    return {
      avgResponseTime: this.average(allData.map(d => d.metrics.responseTime)),
      avgCpuUsage: this.average(allData.map(d => d.metrics.cpuUsage)),
      avgMemoryUsage: this.average(allData.map(d => d.metrics.memoryUsage)),
      totalErrors: allData.reduce((sum, d) => sum + d.metrics.errorRate, 0),
      totalThroughput: this.average(allData.map(d => d.metrics.throughput)),
      healthyServices: allData.filter(d => d.health.status === 'healthy').length,
      totalServices: new Set(allData.map(d => d.service)).size,
      dataPoints: allData.length,
      timeframe: timeframe
    };
  }

  public getTrendAnalysis(metric: string, timeframe: string): TrendData | null {
    return this.trendAnalyzer.analyzeTrend(this.dataStore, metric, timeframe);
  }

  public getPredictions(service: string, metric: string): any {
    const data = this.dataStore.get(service) || [];
    return this.predictionEngine.predict(data, metric);
  }

  public createAlert(rule: AlertRule): void {
    this.alertManager.addRule(rule);
  }

  public getActiveAlerts(): any[] {
    return this.alertManager.getActiveAlerts();
  }

  public createDashboard(widgets: DashboardWidget[]): string {
    return this.dashboardManager.createDashboard(widgets);
  }

  private performAnalysis(): void {
    const allServices = Array.from(this.dataStore.keys());

    allServices.forEach(service => {
      const recentData = this.getServiceMetrics(service, '1h');

      if (recentData.length > 0) {
        const analysis = this.analyzeServiceHealth(recentData);
        this.emit('serviceAnalysis', { service, analysis });
      }
    });
  }

  private analyzeTrends(): void {
    const metrics = ['responseTime', 'cpuUsage', 'memoryUsage', 'errorRate'];
    const timeframes = ['1h', '6h', '24h'];

    metrics.forEach(metric => {
      timeframes.forEach(timeframe => {
        const trend = this.getTrendAnalysis(metric, timeframe);
        if (trend) {
          this.emit('trendUpdate', { metric, timeframe, trend });
        }
      });
    });
  }

  private analyzeServiceHealth(data: AnalyticsData[]): any {
    if (data.length === 0) return null;

    const latest = data[data.length - 1];
    if (!latest) return null;

    const avg = {
      responseTime: this.average(data.map(d => d.metrics.responseTime)),
      cpuUsage: this.average(data.map(d => d.metrics.cpuUsage)),
      memoryUsage: this.average(data.map(d => d.metrics.memoryUsage)),
      errorRate: this.average(data.map(d => d.metrics.errorRate))
    };

    return {
      current: latest.metrics,
      average: avg,
      healthScore: this.calculateHealthScore(latest),
      recommendations: this.generateRecommendations(latest, avg),
      timestamp: new Date()
    };
  }

  private calculateHealthScore(data: AnalyticsData): number {
    let score = 100;

    // Response time impact
    if (data.metrics.responseTime > 1000) score -= 20;
    else if (data.metrics.responseTime > 500) score -= 10;

    // CPU usage impact  
    if (data.metrics.cpuUsage > 80) score -= 15;
    else if (data.metrics.cpuUsage > 60) score -= 5;

    // Memory usage impact
    if (data.metrics.memoryUsage > 90) score -= 15;
    else if (data.metrics.memoryUsage > 70) score -= 5;

    // Error rate impact
    if (data.metrics.errorRate > 5) score -= 25;
    else if (data.metrics.errorRate > 1) score -= 10;

    return Math.max(0, score);
  }

  private generateRecommendations(current: AnalyticsData, avg: any): string[] {
    const recommendations: string[] = [];

    if (current.metrics.responseTime > avg.responseTime * 1.5) {
      recommendations.push('High response time detected - consider scaling or optimization');
    }

    if (current.metrics.cpuUsage > 80) {
      recommendations.push('CPU usage critical - immediate scaling recommended');
    }

    if (current.metrics.memoryUsage > 85) {
      recommendations.push('Memory usage high - check for memory leaks');
    }

    if (current.metrics.errorRate > avg.errorRate * 2) {
      recommendations.push('Error rate spike detected - investigate recent changes');
    }

    return recommendations;
  }

  private getTimeframeCutoff(timeframe: string): Date {
    const now = new Date();
    switch (timeframe) {
      case '1h': return new Date(now.getTime() - 60 * 60 * 1000);
      case '6h': return new Date(now.getTime() - 6 * 60 * 60 * 1000);
      case '24h': return new Date(now.getTime() - 24 * 60 * 60 * 1000);
      case '7d': return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      default: return new Date(0);
    }
  }

  private average(numbers: number[]): number {
    return numbers.length > 0 ? numbers.reduce((a, b) => a + b, 0) / numbers.length : 0;
  }
}

export class TrendAnalyzer {
  public analyzeTrend(dataStore: Map<string, AnalyticsData[]>, metric: string, timeframe: string): TrendData | null {
    const allData: AnalyticsData[] = [];

    dataStore.forEach(serviceData => {
      allData.push(...serviceData);
    });

    if (allData.length < 2) return null;

    const cutoff = this.getTimeframeCutoff(timeframe);
    const filteredData = allData.filter(d => d.timestamp >= cutoff);

    if (filteredData.length < 2) return null;

    const dataPoints = filteredData.map(d => ({
      timestamp: d.timestamp,
      value: this.extractMetricValue(d, metric),
      metric: metric
    }));

    const trend = this.calculateTrend(dataPoints);
    const changePercent = this.calculateChangePercent(dataPoints);

    return {
      timeframe: timeframe as any,
      dataPoints: dataPoints,
      trend: trend,
      changePercent: changePercent,
      prediction: this.predictNextValue(dataPoints)
    };
  }

  private extractMetricValue(data: AnalyticsData, metric: string): number {
    switch (metric) {
      case 'responseTime': return data.metrics.responseTime;
      case 'cpuUsage': return data.metrics.cpuUsage;
      case 'memoryUsage': return data.metrics.memoryUsage;
      case 'errorRate': return data.metrics.errorRate;
      case 'throughput': return data.metrics.throughput;
      default: return 0;
    }
  }

  private calculateTrend(dataPoints: any[]): 'increasing' | 'decreasing' | 'stable' {
    if (dataPoints.length < 2) return 'stable';

    const first = dataPoints[0].value;
    const last = dataPoints[dataPoints.length - 1].value;
    const diff = ((last - first) / first) * 100;

    if (Math.abs(diff) < 5) return 'stable';
    return diff > 0 ? 'increasing' : 'decreasing';
  }

  private calculateChangePercent(dataPoints: any[]): number {
    if (dataPoints.length < 2) return 0;

    const first = dataPoints[0].value;
    const last = dataPoints[dataPoints.length - 1].value;

    return ((last - first) / first) * 100;
  }

  private predictNextValue(dataPoints: any[]): number {
    if (dataPoints.length < 3) return dataPoints[dataPoints.length - 1]?.value || 0;

    // Simple linear regression for prediction
    const recentPoints = dataPoints.slice(-5);
    const values = recentPoints.map(p => p.value);
    const trend = (values[values.length - 1] - values[0]) / values.length;

    return values[values.length - 1] + trend;
  }

  private getTimeframeCutoff(timeframe: string): Date {
    const now = new Date();
    switch (timeframe) {
      case '1h': return new Date(now.getTime() - 60 * 60 * 1000);
      case '6h': return new Date(now.getTime() - 6 * 60 * 60 * 1000);
      case '24h': return new Date(now.getTime() - 24 * 60 * 60 * 1000);
      case '7d': return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      default: return new Date(0);
    }
  }
}

export class AlertManager {
  private rules: Map<string, AlertRule> = new Map();
  private activeAlerts: Map<string, any> = new Map();

  public addRule(rule: AlertRule): void {
    this.rules.set(rule.id, rule);
    console.log(`📋 Alert rule added: ${rule.name}`);
  }

  public removeRule(ruleId: string): void {
    this.rules.delete(ruleId);
    this.activeAlerts.delete(ruleId);
  }

  public checkAlerts(data: AnalyticsData): void {
    this.rules.forEach(rule => {
      if (!rule.enabled) return;

      const value = this.extractMetricValue(data, rule.metric);
      const triggered = this.evaluateCondition(value, rule.condition, rule.threshold);

      if (triggered) {
        this.triggerAlert(rule, data, value);
      }
    });
  }

  public getActiveAlerts(): any[] {
    return Array.from(this.activeAlerts.values());
  }

  private extractMetricValue(data: AnalyticsData, metric: string): number {
    switch (metric) {
      case 'responseTime': return data.metrics.responseTime;
      case 'cpuUsage': return data.metrics.cpuUsage;
      case 'memoryUsage': return data.metrics.memoryUsage;
      case 'errorRate': return data.metrics.errorRate;
      case 'throughput': return data.metrics.throughput;
      default: return 0;
    }
  }

  private evaluateCondition(value: number, condition: string, threshold: number): boolean {
    switch (condition) {
      case 'gt': return value > threshold;
      case 'lt': return value < threshold;
      case 'eq': return Math.abs(value - threshold) < 0.01;
      default: return false;
    }
  }

  private triggerAlert(rule: AlertRule, data: AnalyticsData, value: number): void {
    const alert = {
      id: rule.id,
      name: rule.name,
      severity: rule.severity,
      service: data.service,
      metric: rule.metric,
      value: value,
      threshold: rule.threshold,
      triggered: new Date(),
      message: `${rule.name}: ${rule.metric} is ${value} (threshold: ${rule.threshold})`
    };

    this.activeAlerts.set(rule.id, alert);
    rule.lastTriggered = new Date();

    console.log(`🚨 ALERT: ${alert.message}`);
  }
}

export class PredictionEngine {
  public predict(data: AnalyticsData[], metric: string): any {
    if (data.length < 10) return null;

    const values = data.map(d => this.extractMetricValue(d, metric));
    const predictions = this.generatePredictions(values);

    return {
      metric: metric,
      currentValue: values[values.length - 1],
      predictions: predictions,
      confidence: this.calculateConfidence(values),
      timestamp: new Date()
    };
  }

  private extractMetricValue(data: AnalyticsData, metric: string): number {
    switch (metric) {
      case 'responseTime': return data.metrics.responseTime;
      case 'cpuUsage': return data.metrics.cpuUsage;
      case 'memoryUsage': return data.metrics.memoryUsage;
      case 'errorRate': return data.metrics.errorRate;
      case 'throughput': return data.metrics.throughput;
      default: return 0;
    }
  }

  private generatePredictions(values: number[]): any {
    if (values.length === 0) return null;

    const recent = values.slice(-20);
    if (recent.length === 0) return null;

    const trend = this.calculateTrend(recent);
    const lastValue = recent[recent.length - 1] || 0;

    return {
      next5min: lastValue + trend * 5,
      next15min: lastValue + trend * 15,
      next1hour: lastValue + trend * 60,
      trend: trend
    };
  }

  private calculateTrend(values: number[]): number {
    if (values.length < 2) return 0;

    let sum = 0;
    for (let i = 1; i < values.length; i++) {
      const current = values[i];
      const previous = values[i - 1];
      if (current !== undefined && previous !== undefined) {
        sum += current - previous;
      }
    }

    return sum / (values.length - 1);
  }

  private calculateConfidence(values: number[]): number {
    const variance = this.calculateVariance(values);
    return Math.max(0, Math.min(100, 100 - variance));
  }

  private calculateVariance(values: number[]): number {
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const squaredDiffs = values.map(value => Math.pow(value - mean, 2));
    return squaredDiffs.reduce((a, b) => a + b, 0) / values.length;
  }
}

export class DashboardManager {
  private dashboards: Map<string, DashboardWidget[]> = new Map();

  public createDashboard(widgets: DashboardWidget[]): string {
    const dashboardId = `dashboard_${Date.now()}`;
    this.dashboards.set(dashboardId, widgets);
    return dashboardId;
  }

  public getDashboard(id: string): DashboardWidget[] | null {
    return this.dashboards.get(id) || null;
  }

  public updateWidget(dashboardId: string, widgetId: string, config: any): boolean {
    const dashboard = this.dashboards.get(dashboardId);
    if (!dashboard) return false;

    const widget = dashboard.find(w => w.id === widgetId);
    if (!widget) return false;

    widget.config = { ...widget.config, ...config };
    return true;
  }
}
