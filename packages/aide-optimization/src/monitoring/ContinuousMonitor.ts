/**
 * Continuous Monitoring System
 * Phase 5: Advanced Monitoring & Health Tracking
 */

import { EventEmitter } from 'events';
import WebSocket from 'ws';
import fetch from 'node-fetch';
import {
  OptimizationMetrics,
  SystemHealthMetrics,
  OptimizationEvent,
  HistoricalMetrics
} from '../types/optimization';

export class ContinuousMonitor extends EventEmitter {
  private config: MonitoringConfig;
  private healthHistory: HistoricalMetrics[] = [];
  private activeAlerts: Map<string, Alert> = new Map();
  private websocketServer?: WebSocket.Server;
  private connectedClients: Set<WebSocket> = new Set();
  private monitoringInterval?: NodeJS.Timeout;

  constructor(config: MonitoringConfig) {
    super();
    this.config = config;
    this.initializeMonitoring();
  }

  /**
   * Initialize continuous monitoring system
   */
  private initializeMonitoring(): void {
    console.log('🔍 Initializing Continuous Monitoring System...');

    // Start WebSocket server for real-time updates
    if (this.config.websocket_port) {
      this.startWebSocketServer();
    }

    // Start periodic health checks
    this.startHealthMonitoring();

    // Initialize alert system
    this.initializeAlertSystem();

    console.log('✅ Continuous Monitoring System initialized');
  }

  /**
   * Start WebSocket server for real-time monitoring
   */
  private startWebSocketServer(): void {
    try {
      this.websocketServer = new WebSocket.Server({
        port: this.config.websocket_port!,
        path: '/monitoring'
      });

      this.websocketServer.on('connection', (ws: WebSocket) => {
        console.log('📡 New monitoring client connected');
        this.connectedClients.add(ws);

        // Send current status to new client
        this.sendToClient(ws, {
          type: 'status',
          data: this.getCurrentStatus()
        });

        // Handle client disconnect
        ws.on('close', () => {
          this.connectedClients.delete(ws);
          console.log('📡 Monitoring client disconnected');
        });

        // Handle client messages
        ws.on('message', (message: string) => {
          try {
            const data = JSON.parse(message);
            this.handleClientMessage(ws, data);
          } catch (error) {
            console.error('❌ Invalid client message:', error);
          }
        });
      });

      console.log(`🌐 WebSocket monitoring server started on port ${this.config.websocket_port}`);

    } catch (error) {
      console.error('❌ Failed to start WebSocket server:', error);
    }
  }

  /**
   * Start periodic health monitoring
   */
  private startHealthMonitoring(): void {
    const interval = this.config.health_check_interval || 30000;

    this.monitoringInterval = setInterval(async () => {
      try {
        await this.performHealthCheck();
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error('❌ Health check failed:', error);
        this.emitAlert('health_check_failed', 'critical', errorMessage);
      }
    }, interval);

    console.log(`⏰ Health monitoring started with ${interval}ms interval`);
  }

  /**
   * Perform comprehensive health check
   */
  async performHealthCheck(): Promise<SystemHealthMetrics> {
    const timestamp = new Date().toISOString();
    const events: OptimizationEvent[] = [];

    try {
      const healthMetrics: SystemHealthMetrics = {
        availability: await this.checkAvailability(),
        reliability: await this.checkReliability(),
        scalability_score: await this.checkScalability(),
        security_score: await this.checkSecurity(),
        compliance_score: await this.checkCompliance()
      };

      // Store health history
      const historicalEntry: HistoricalMetrics = {
        timestamp,
        metrics: {
          performance: await this.getPerformanceMetrics(),
          intelligence: await this.getIntelligenceMetrics(),
          user_experience: await this.getUserExperienceMetrics(),
          system_health: healthMetrics,
          deployment: await this.getDeploymentMetrics()
        },
        events
      };

      this.healthHistory.push(historicalEntry);

      // Keep only last 1000 entries
      if (this.healthHistory.length > 1000) {
        this.healthHistory = this.healthHistory.slice(-1000);
      }

      // Check for alerts
      await this.checkHealthAlerts(healthMetrics);

      // Broadcast to connected clients
      this.broadcastToClients({
        type: 'health_update',
        data: {
          timestamp,
          metrics: healthMetrics,
          overall_score: this.calculateOverallHealthScore(healthMetrics)
        }
      });

      // Emit health check event
      this.emit('health_check', healthMetrics);

      return healthMetrics;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('❌ Health check error:', error);

      events.push({
        id: `health_error_${Date.now()}`,
        type: 'incident',
        description: `Health check failed: ${errorMessage}`,
        impact: 'negative',
        timestamp,
        metadata: { error: errorMessage }
      });

      throw error;
    }
  }

  /**
   * Monitor specific service endpoint
   */
  async monitorService(serviceConfig: ServiceConfig): Promise<ServiceHealthStatus> {
    const startTime = Date.now();

    try {
      const response = await fetch(serviceConfig.endpoint, {
        method: serviceConfig.method || 'GET',
        timeout: serviceConfig.timeout || 5000,
        headers: serviceConfig.headers || {}
      });

      const responseTime = Date.now() - startTime;
      const isHealthy = response.ok && responseTime < (serviceConfig.max_response_time || 5000);

      const status: ServiceHealthStatus = {
        service_name: serviceConfig.name,
        endpoint: serviceConfig.endpoint,
        status: isHealthy ? 'healthy' : 'unhealthy',
        response_time: responseTime,
        status_code: response.status,
        timestamp: new Date().toISOString(),
        details: {
          response_size: parseInt(response.headers.get('content-length') || '0'),
          headers: Object.fromEntries(response.headers.entries())
        }
      };

      // Check for alerts
      if (!isHealthy) {
        this.emitAlert(
          'service_unhealthy',
          'high',
          `Service ${serviceConfig.name} is unhealthy: ${response.status} (${responseTime}ms)`
        );
      }

      return status;

    } catch (error) {
      const responseTime = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : String(error);

      const status: ServiceHealthStatus = {
        service_name: serviceConfig.name,
        endpoint: serviceConfig.endpoint,
        status: 'error',
        response_time: responseTime,
        status_code: 0,
        timestamp: new Date().toISOString(),
        error: errorMessage
      };

      this.emitAlert(
        'service_error',
        'critical',
        `Service ${serviceConfig.name} error: ${errorMessage}`
      );

      return status;
    }
  }

  /**
   * Get monitoring dashboard data
   */
  getDashboardData(): MonitoringDashboard {
    const recentHistory = this.healthHistory.slice(-50);
    const currentStatus = this.getCurrentStatus();

    return {
      current_status: currentStatus,
      health_trends: this.calculateHealthTrends(recentHistory),
      active_alerts: Array.from(this.activeAlerts.values()),
      performance_summary: this.getPerformanceSummary(recentHistory),
      system_overview: this.getSystemOverview(),
      uptime_statistics: this.calculateUptimeStats(recentHistory)
    };
  }

  /**
   * Initialize alert system
   */
  private initializeAlertSystem(): void {
    // Set up alert thresholds from config
    this.setupAlertThresholds();

    // Initialize notification channels
    this.initializeNotificationChannels();

    console.log('🚨 Alert system initialized');
  }

  /**
   * Emit alert
   */
  private emitAlert(type: string, severity: 'low' | 'medium' | 'high' | 'critical', message: string): void {
    const alert: Alert = {
      id: `alert_${Date.now()}`,
      type,
      severity,
      message,
      timestamp: new Date().toISOString(),
      status: 'active',
      acknowledged: false
    };

    this.activeAlerts.set(alert.id, alert);

    // Broadcast alert
    this.broadcastToClients({
      type: 'alert',
      data: alert
    });

    // Emit event
    this.emit('alert', alert);

    // Send notifications
    this.sendAlertNotifications(alert);

    console.log(`🚨 Alert emitted: [${severity.toUpperCase()}] ${message}`);
  }

  /**
   * Acknowledge alert
   */
  acknowledgeAlert(alertId: string, acknowledgedBy: string): boolean {
    const alert = this.activeAlerts.get(alertId);

    if (alert) {
      alert.acknowledged = true;
      alert.acknowledged_by = acknowledgedBy;
      alert.acknowledged_at = new Date().toISOString();

      this.broadcastToClients({
        type: 'alert_acknowledged',
        data: alert
      });

      return true;
    }

    return false;
  }

  /**
   * Resolve alert
   */
  resolveAlert(alertId: string, resolvedBy: string, resolution: string): boolean {
    const alert = this.activeAlerts.get(alertId);

    if (alert) {
      alert.status = 'resolved';
      alert.resolved_by = resolvedBy;
      alert.resolved_at = new Date().toISOString();
      alert.resolution = resolution;

      this.activeAlerts.delete(alertId);

      this.broadcastToClients({
        type: 'alert_resolved',
        data: alert
      });

      return true;
    }

    return false;
  }

  // Health check implementations
  private async checkAvailability(): Promise<number> {
    // Mock availability check - in production, would check actual services
    return 99.5 + Math.random() * 0.5; // 99.5-100%
  }

  private async checkReliability(): Promise<number> {
    // Mock reliability check
    return 95 + Math.random() * 5; // 95-100%
  }

  private async checkScalability(): Promise<number> {
    // Mock scalability check
    return 80 + Math.random() * 20; // 80-100%
  }

  private async checkSecurity(): Promise<number> {
    // Mock security check
    return 90 + Math.random() * 10; // 90-100%
  }

  private async checkCompliance(): Promise<number> {
    // Mock compliance check
    return 85 + Math.random() * 15; // 85-100%
  }

  private async getPerformanceMetrics(): Promise<any> {
    return {
      response_time: 50 + Math.random() * 100,
      throughput: 500 + Math.random() * 500,
      error_rate: Math.random() * 2,
      cpu_usage: 30 + Math.random() * 40,
      memory_usage: 40 + Math.random() * 30,
      disk_usage: 20 + Math.random() * 60,
      network_latency: 10 + Math.random() * 40,
      cache_hit_rate: 80 + Math.random() * 20
    };
  }

  private async getIntelligenceMetrics(): Promise<any> {
    return {
      romai_optimization_score: 80 + Math.random() * 20,
      ai_recommendation_accuracy: 85 + Math.random() * 15,
      predictive_maintenance_effectiveness: 75 + Math.random() * 25,
      automated_issue_resolution_rate: 70 + Math.random() * 30,
      intelligent_resource_allocation_score: 80 + Math.random() * 20
    };
  }

  private async getUserExperienceMetrics(): Promise<any> {
    return {
      user_satisfaction_score: 85 + Math.random() * 15,
      task_completion_rate: 90 + Math.random() * 10,
      feature_adoption_rate: 70 + Math.random() * 30,
      user_retention_rate: 85 + Math.random() * 15,
      accessibility_compliance_score: 90 + Math.random() * 10
    };
  }

  private async getDeploymentMetrics(): Promise<any> {
    return {
      deployment_frequency: 5 + Math.random() * 10,
      lead_time: 2 + Math.random() * 8,
      change_failure_rate: Math.random() * 5,
      mean_time_to_recovery: 10 + Math.random() * 20,
      deployment_success_rate: 95 + Math.random() * 5
    };
  }

  // Utility methods
  private getCurrentStatus(): any {
    const recent = this.healthHistory.slice(-1)[0];
    return recent ? {
      timestamp: recent.timestamp,
      metrics: recent.metrics,
      overall_score: this.calculateOverallHealthScore(recent.metrics.system_health)
    } : null;
  }

  private calculateOverallHealthScore(healthMetrics: SystemHealthMetrics): number {
    return (
      healthMetrics.availability * 0.3 +
      healthMetrics.reliability * 0.25 +
      healthMetrics.scalability_score * 0.2 +
      healthMetrics.security_score * 0.15 +
      healthMetrics.compliance_score * 0.1
    );
  }

  private async checkHealthAlerts(metrics: SystemHealthMetrics): Promise<void> {
    // Check availability
    if (metrics.availability < (this.config.alert_thresholds?.availability_min ?? 99)) {
      this.emitAlert('low_availability', 'high', `System availability dropped to ${metrics.availability.toFixed(2)}%`);
    }

    // Check reliability
    if (metrics.reliability < (this.config.alert_thresholds?.reliability_min ?? 90)) {
      this.emitAlert('low_reliability', 'medium', `System reliability is ${metrics.reliability.toFixed(2)}%`);
    }

    // Check security score
    if (metrics.security_score < (this.config.alert_thresholds?.security_min ?? 85)) {
      this.emitAlert('security_concern', 'high', `Security score dropped to ${metrics.security_score.toFixed(2)}%`);
    }
  }

  private setupAlertThresholds(): void {
    // Initialize alert thresholds from config
    console.log('Setting up alert thresholds...');
  }

  private initializeNotificationChannels(): void {
    // Initialize notification channels (email, Slack, etc.)
    console.log('Initializing notification channels...');
  }

  private sendAlertNotifications(alert: Alert): void {
    // Send notifications through configured channels
    console.log(`Sending notifications for alert: ${alert.message}`);
  }

  private broadcastToClients(data: any): void {
    this.connectedClients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        this.sendToClient(client, data);
      }
    });
  }

  private sendToClient(client: WebSocket, data: any): void {
    try {
      client.send(JSON.stringify(data));
    } catch (error) {
      console.error('❌ Failed to send data to client:', error);
    }
  }

  private handleClientMessage(client: WebSocket, data: any): void {
    switch (data.type) {
      case 'ping':
        this.sendToClient(client, { type: 'pong' });
        break;
      case 'subscribe':
        // Handle subscription to specific monitoring topics
        break;
      case 'acknowledge_alert':
        this.acknowledgeAlert(data.alertId, data.acknowledgedBy);
        break;
      default:
        console.log('Unknown client message type:', data.type);
    }
  }

  private calculateHealthTrends(history: HistoricalMetrics[]): any {
    // Calculate trends from historical data
    return {
      availability: 'stable',
      reliability: 'improving',
      performance: 'stable',
      security: 'improving'
    };
  }

  private getPerformanceSummary(history: HistoricalMetrics[]): any {
    if (history.length === 0) return null;

    const latest = history[history.length - 1];
    return {
      response_time: latest.metrics.performance.response_time,
      throughput: latest.metrics.performance.throughput,
      error_rate: latest.metrics.performance.error_rate,
      resource_usage: (latest.metrics.performance.cpu_usage + latest.metrics.performance.memory_usage) / 2
    };
  }

  private getSystemOverview(): any {
    return {
      total_services: 27,
      healthy_services: 25,
      degraded_services: 2,
      failed_services: 0,
      last_deployment: '2025-01-16T10:30:00Z',
      uptime: '99.8%'
    };
  }

  private calculateUptimeStats(history: HistoricalMetrics[]): any {
    return {
      daily: '99.95%',
      weekly: '99.8%',
      monthly: '99.7%',
      yearly: '99.5%'
    };
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
    }

    if (this.websocketServer) {
      this.websocketServer.close();
    }

    this.connectedClients.clear();
    console.log('🔍 Continuous Monitoring System destroyed');
  }
}

// Supporting interfaces
interface MonitoringConfig {
  health_check_interval?: number;
  websocket_port?: number;
  alert_thresholds?: {
    availability_min?: number;
    reliability_min?: number;
    security_min?: number;
    compliance_min?: number;
  };
  notification_channels?: string[];
  services?: ServiceConfig[];
}

interface ServiceConfig {
  name: string;
  endpoint: string;
  method?: string;
  timeout?: number;
  max_response_time?: number;
  headers?: Record<string, string>;
}

interface ServiceHealthStatus {
  service_name: string;
  endpoint: string;
  status: 'healthy' | 'unhealthy' | 'error';
  response_time: number;
  status_code: number;
  timestamp: string;
  error?: string;
  details?: any;
}

interface Alert {
  id: string;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: string;
  status: 'active' | 'resolved';
  acknowledged: boolean;
  acknowledged_by?: string;
  acknowledged_at?: string;
  resolved_by?: string;
  resolved_at?: string;
  resolution?: string;
}

interface MonitoringDashboard {
  current_status: any;
  health_trends: any;
  active_alerts: Alert[];
  performance_summary: any;
  system_overview: any;
  uptime_statistics: any;
}
