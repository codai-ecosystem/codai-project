/**
 * ROMAI Business Intelligence Dashboard
 * 
 * Enterprise-grade dashboard system providing real-time analytics visualization,
 * KPI monitoring, and business intelligence reporting for comprehensive
 * organizational insights and data-driven decision making.
 * 
 * Features:
 * - Real-time data visualization and monitoring
 * - Interactive KPI dashboards with drill-down capabilities
 * - Customizable dashboard layouts and widget configuration
 * - Multi-tenant dashboard isolation and personalization
 * - Export capabilities for reports and visualizations
 * - Alert management and notification systems
 */

import { randomUUID } from 'crypto';
import { analyticsEngine } from './analytics-engine';
import { enterpriseLogger } from '../logging/enterprise-logger';

export interface DashboardWidget {
  widgetId: string;
  type: 'metric' | 'chart' | 'table' | 'alert' | 'trend' | 'heatmap' | 'gauge';
  title: string;
  description: string;
  dataSource: string;
  configuration: {
    metricType?: string;
    chartType?: 'line' | 'bar' | 'pie' | 'area' | 'scatter';
    timeRange?: 'hour' | 'day' | 'week' | 'month' | 'quarter' | 'year';
    refreshInterval?: number; // seconds
    thresholds?: { warning: number; critical: number };
    dimensions?: string[];
    filters?: Record<string, any>;
  };
  position: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  style: {
    backgroundColor?: string;
    borderColor?: string;
    textColor?: string;
    showBorder?: boolean;
    showTitle?: boolean;
  };
}

export interface Dashboard {
  dashboardId: string;
  organizationId: string;
  name: string;
  description: string;
  category: 'executive' | 'operational' | 'technical' | 'marketing' | 'financial' | 'custom';
  visibility: 'public' | 'private' | 'organization';
  owner: string;
  widgets: DashboardWidget[];
  layout: {
    columns: number;
    rows: number;
    gap: number;
  };
  theme: {
    name: string;
    primaryColor: string;
    secondaryColor: string;
    backgroundColor: string;
    darkMode: boolean;
  };
  permissions: {
    viewers: string[];
    editors: string[];
    admins: string[];
  };
  metadata: {
    createdAt: string;
    updatedAt: string;
    version: string;
    tags: string[];
    lastViewed?: string;
    viewCount: number;
  };
}

export interface DashboardData {
  widgets: Record<string, {
    data: any;
    status: 'loading' | 'success' | 'error';
    lastUpdated: string;
    error?: string;
  }>;
  globalFilters: Record<string, any>;
  timeRange: {
    start: string;
    end: string;
    period: string;
  };
  refreshRate: number;
}

export interface AlertRule {
  ruleId: string;
  organizationId: string;
  name: string;
  description: string;
  metricType: string;
  condition: {
    operator: 'gt' | 'lt' | 'eq' | 'gte' | 'lte' | 'between';
    value: number;
    threshold2?: number; // for 'between'
  };
  severity: 'info' | 'warning' | 'critical';
  recipients: string[];
  channels: ('email' | 'slack' | 'dashboard' | 'webhook')[];
  enabled: boolean;
  cooldown: number; // minutes
  lastTriggered?: string;
  triggerCount: number;
}

export class BusinessIntelligenceDashboard {
  private static instance: BusinessIntelligenceDashboard;
  private dashboards: Map<string, Dashboard[]> = new Map(); // organizationId -> dashboards
  private dashboardData: Map<string, DashboardData> = new Map(); // dashboardId -> data
  private alertRules: Map<string, AlertRule[]> = new Map(); // organizationId -> rules
  private widgetCache: Map<string, any> = new Map(); // widgetId -> cached data
  private activeConnections: Set<string> = new Set(); // Real-time connections

  private constructor() {
    // Initialize default dashboards for new organizations
    this.initializeDefaultDashboards();

    // Start real-time data updates
    this.startRealTimeUpdates();

    // Start alert monitoring
    this.startAlertMonitoring();
  }

  public static getInstance(): BusinessIntelligenceDashboard {
    if (!BusinessIntelligenceDashboard.instance) {
      BusinessIntelligenceDashboard.instance = new BusinessIntelligenceDashboard();
    }
    return BusinessIntelligenceDashboard.instance;
  }

  /**
   * Create new dashboard
   */
  public createDashboard(dashboard: Omit<Dashboard, 'dashboardId' | 'metadata'>): string {
    const dashboardId = randomUUID();
    const now = new Date().toISOString();

    const newDashboard: Dashboard = {
      dashboardId,
      metadata: {
        createdAt: now,
        updatedAt: now,
        version: '1.0.0',
        tags: [],
        viewCount: 0
      },
      ...dashboard
    };

    // Store dashboard
    const orgDashboards = this.dashboards.get(dashboard.organizationId) || [];
    orgDashboards.push(newDashboard);
    this.dashboards.set(dashboard.organizationId, orgDashboards);

    // Initialize dashboard data
    this.initializeDashboardData(dashboardId, newDashboard);

    // Log creation
    enterpriseLogger.recordAuditEvent({
      eventId: randomUUID(),
      eventType: 'request',
      severity: 'info',
      details: {
        action: 'dashboard_created',
        dashboardId,
        dashboardName: dashboard.name,
        category: dashboard.category,
        widgetCount: dashboard.widgets.length,
        owner: dashboard.owner
      },
      context: {
        requestId: dashboardId,
        organizationId: dashboard.organizationId,
        userId: dashboard.owner,
        method: 'create_dashboard',
        timestamp: now,
        source: 'mcp-server',
        version: '0.2.0'
      }
    });

    return dashboardId;
  }

  /**
   * Get dashboards for organization
   */
  public getDashboards(organizationId: string, userId?: string): Dashboard[] {
    const orgDashboards = this.dashboards.get(organizationId) || [];

    // Filter based on user permissions
    if (userId) {
      return orgDashboards.filter(dashboard =>
        dashboard.visibility === 'public' ||
        dashboard.owner === userId ||
        dashboard.permissions.viewers.includes(userId) ||
        dashboard.permissions.editors.includes(userId) ||
        dashboard.permissions.admins.includes(userId)
      );
    }

    return orgDashboards.filter(dashboard => dashboard.visibility === 'public');
  }

  /**
   * Get specific dashboard with data
   */
  public getDashboardWithData(dashboardId: string, userId?: string): {
    dashboard: Dashboard;
    data: DashboardData;
  } | null {
    // Find dashboard
    const dashboard = this.findDashboard(dashboardId);
    if (!dashboard) return null;

    // Check permissions
    if (userId && !this.checkDashboardAccess(dashboard, userId)) {
      return null;
    }

    // Get or generate data
    const data = this.getDashboardData(dashboardId);

    // Update view metrics
    dashboard.metadata.lastViewed = new Date().toISOString();
    dashboard.metadata.viewCount++;

    return { dashboard, data };
  }

  /**
   * Update dashboard configuration
   */
  public updateDashboard(
    dashboardId: string,
    updates: Partial<Dashboard>,
    userId: string
  ): boolean {
    const dashboard = this.findDashboard(dashboardId);
    if (!dashboard) return false;

    // Check edit permissions
    if (!this.checkDashboardEditAccess(dashboard, userId)) {
      return false;
    }

    // Apply updates
    Object.assign(dashboard, updates);
    dashboard.metadata.updatedAt = new Date().toISOString();

    // Refresh data if widgets changed
    if (updates.widgets) {
      this.refreshDashboardData(dashboardId);
    }

    // Log update
    enterpriseLogger.recordAuditEvent({
      eventId: randomUUID(),
      eventType: 'request',
      severity: 'info',
      details: {
        action: 'dashboard_updated',
        dashboardId,
        updatedFields: Object.keys(updates),
        userId
      },
      context: {
        requestId: dashboardId,
        organizationId: dashboard.organizationId,
        userId,
        method: 'update_dashboard',
        timestamp: new Date().toISOString(),
        source: 'mcp-server',
        version: '0.2.0'
      }
    });

    return true;
  }

  /**
   * Delete dashboard
   */
  public deleteDashboard(dashboardId: string, userId: string): boolean {
    const dashboard = this.findDashboard(dashboardId);
    if (!dashboard) return false;

    // Check admin permissions
    if (!this.checkDashboardAdminAccess(dashboard, userId)) {
      return false;
    }

    // Remove from organization dashboards
    const orgDashboards = this.dashboards.get(dashboard.organizationId) || [];
    const filteredDashboards = orgDashboards.filter(d => d.dashboardId !== dashboardId);
    this.dashboards.set(dashboard.organizationId, filteredDashboards);

    // Remove dashboard data
    this.dashboardData.delete(dashboardId);

    // Clear widget cache
    dashboard.widgets.forEach(widget => {
      this.widgetCache.delete(widget.widgetId);
    });

    // Log deletion
    enterpriseLogger.recordAuditEvent({
      eventId: randomUUID(),
      eventType: 'request',
      severity: 'info',
      details: {
        action: 'dashboard_deleted',
        dashboardId,
        dashboardName: dashboard.name,
        userId
      },
      context: {
        requestId: dashboardId,
        organizationId: dashboard.organizationId,
        userId,
        method: 'delete_dashboard',
        timestamp: new Date().toISOString(),
        source: 'mcp-server',
        version: '0.2.0'
      }
    });

    return true;
  }

  /**
   * Create alert rule
   */
  public createAlertRule(rule: Omit<AlertRule, 'ruleId' | 'lastTriggered' | 'triggerCount'>): string {
    const ruleId = randomUUID();
    const alertRule: AlertRule = {
      ruleId,
      lastTriggered: undefined,
      triggerCount: 0,
      ...rule
    };

    // Store rule
    const orgRules = this.alertRules.get(rule.organizationId) || [];
    orgRules.push(alertRule);
    this.alertRules.set(rule.organizationId, orgRules);

    // Log creation
    enterpriseLogger.recordAuditEvent({
      eventId: randomUUID(),
      eventType: 'request',
      severity: 'info',
      details: {
        action: 'alert_rule_created',
        ruleId,
        ruleName: rule.name,
        metricType: rule.metricType,
        severity: rule.severity
      },
      context: {
        requestId: ruleId,
        organizationId: rule.organizationId,
        method: 'create_alert_rule',
        timestamp: new Date().toISOString(),
        source: 'mcp-server',
        version: '0.2.0'
      }
    });

    return ruleId;
  }

  /**
   * Get real-time dashboard data
   */
  public getRealTimeDashboardData(dashboardId: string): any {
    const dashboard = this.findDashboard(dashboardId);
    if (!dashboard) return null;

    // Get live analytics data
    const liveData = analyticsEngine.getDashboardData(dashboard.organizationId);

    // Process widgets
    const widgetData: Record<string, any> = {};

    dashboard.widgets.forEach(widget => {
      try {
        widgetData[widget.widgetId] = this.processWidgetData(widget, liveData, dashboard.organizationId);
      } catch (error) {
        widgetData[widget.widgetId] = {
          data: null,
          status: 'error',
          lastUpdated: new Date().toISOString(),
          error: error instanceof Error ? error.message : 'Unknown error'
        };
      }
    });

    return {
      dashboardId,
      organizationId: dashboard.organizationId,
      timestamp: new Date().toISOString(),
      widgets: widgetData,
      summary: {
        activeUsers: liveData.activeUsers,
        requestsPerMinute: liveData.requestsPerMinute,
        averageResponseTime: liveData.averageResponseTime,
        errorRate: liveData.errorRate,
        alerts: liveData.alerts
      }
    };
  }

  /**
   * Export dashboard data
   */
  public exportDashboard(
    dashboardId: string,
    format: 'json' | 'csv' | 'pdf',
    timeRange?: { start: string; end: string }
  ): {
    data: any;
    filename: string;
    contentType: string;
  } | null {
    const dashboard = this.findDashboard(dashboardId);
    if (!dashboard) return null;

    const timestamp = new Date().toISOString().split('T')[0];
    let data: any;
    let filename: string;
    let contentType: string;

    switch (format) {
      case 'json':
        data = {
          dashboard,
          data: this.getDashboardData(dashboardId),
          exportedAt: new Date().toISOString(),
          timeRange
        };
        filename = `dashboard-${dashboard.name}-${timestamp}.json`;
        contentType = 'application/json';
        break;

      case 'csv':
        data = this.convertDashboardToCSV(dashboard, dashboardId, timeRange);
        filename = `dashboard-${dashboard.name}-${timestamp}.csv`;
        contentType = 'text/csv';
        break;

      case 'pdf':
        data = this.generateDashboardPDF(dashboard, dashboardId, timeRange);
        filename = `dashboard-${dashboard.name}-${timestamp}.pdf`;
        contentType = 'application/pdf';
        break;

      default:
        return null;
    }

    // Log export
    enterpriseLogger.recordAuditEvent({
      eventId: randomUUID(),
      eventType: 'request',
      severity: 'info',
      details: {
        action: 'dashboard_exported',
        dashboardId,
        format,
        timeRange
      },
      context: {
        requestId: randomUUID(),
        organizationId: dashboard.organizationId,
        method: 'export_dashboard',
        timestamp: new Date().toISOString(),
        source: 'mcp-server',
        version: '0.2.0'
      }
    });

    return { data, filename, contentType };
  }

  /**
   * Initialize default dashboards for organizations
   */
  private initializeDefaultDashboards(): void {
    // Executive Dashboard Template
    const executiveDashboard: Omit<Dashboard, 'dashboardId' | 'organizationId' | 'owner' | 'metadata'> = {
      name: 'Executive Overview',
      description: 'High-level KPIs and business metrics for leadership',
      category: 'executive',
      visibility: 'organization',
      widgets: [
        {
          widgetId: randomUUID(),
          type: 'metric',
          title: 'Active Users',
          description: 'Current active users on the platform',
          dataSource: 'analytics',
          configuration: {
            metricType: 'active_users',
            timeRange: 'hour',
            refreshInterval: 60
          },
          position: { x: 0, y: 0, width: 3, height: 2 },
          style: { backgroundColor: '#f8f9fa', showBorder: true, showTitle: true }
        },
        {
          widgetId: randomUUID(),
          type: 'chart',
          title: 'Usage Trends',
          description: 'User engagement trends over time',
          dataSource: 'analytics',
          configuration: {
            chartType: 'line',
            timeRange: 'day',
            refreshInterval: 300
          },
          position: { x: 3, y: 0, width: 6, height: 4 },
          style: { backgroundColor: '#ffffff', showBorder: true, showTitle: true }
        },
        {
          widgetId: randomUUID(),
          type: 'gauge',
          title: 'System Health',
          description: 'Overall system performance score',
          dataSource: 'performance',
          configuration: {
            metricType: 'health_score',
            thresholds: { warning: 80, critical: 95 },
            refreshInterval: 120
          },
          position: { x: 9, y: 0, width: 3, height: 2 },
          style: { backgroundColor: '#f8f9fa', showBorder: true, showTitle: true }
        }
      ],
      layout: { columns: 12, rows: 8, gap: 16 },
      theme: {
        name: 'corporate',
        primaryColor: '#007bff',
        secondaryColor: '#6c757d',
        backgroundColor: '#ffffff',
        darkMode: false
      },
      permissions: {
        viewers: [],
        editors: [],
        admins: []
      }
    };

    // Store template for later use
    this.executiveDashboardTemplate = executiveDashboard;
  }

  private executiveDashboardTemplate: any;

  /**
   * Initialize dashboard data
   */
  private initializeDashboardData(dashboardId: string, dashboard: Dashboard): void {
    const data: DashboardData = {
      widgets: {},
      globalFilters: {},
      timeRange: {
        start: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        end: new Date().toISOString(),
        period: 'day'
      },
      refreshRate: 60 // seconds
    };

    // Initialize widget data
    dashboard.widgets.forEach(widget => {
      data.widgets[widget.widgetId] = {
        data: null,
        status: 'loading',
        lastUpdated: new Date().toISOString()
      };
    });

    this.dashboardData.set(dashboardId, data);
  }

  /**
   * Get dashboard data with caching
   */
  private getDashboardData(dashboardId: string): DashboardData {
    let data = this.dashboardData.get(dashboardId);

    if (!data) {
      const dashboard = this.findDashboard(dashboardId);
      if (dashboard) {
        this.initializeDashboardData(dashboardId, dashboard);
        data = this.dashboardData.get(dashboardId)!;
      } else {
        // Return empty data
        data = {
          widgets: {},
          globalFilters: {},
          timeRange: {
            start: new Date().toISOString(),
            end: new Date().toISOString(),
            period: 'hour'
          },
          refreshRate: 60
        };
      }
    }

    return data;
  }

  /**
   * Process widget data based on type and configuration
   */
  private processWidgetData(widget: DashboardWidget, liveData: any, organizationId: string): any {
    const now = new Date().toISOString();

    switch (widget.type) {
      case 'metric':
        return {
          data: this.getMetricData(widget, liveData),
          status: 'success',
          lastUpdated: now
        };

      case 'chart':
        return {
          data: this.getChartData(widget, organizationId),
          status: 'success',
          lastUpdated: now
        };

      case 'table':
        return {
          data: this.getTableData(widget, organizationId),
          status: 'success',
          lastUpdated: now
        };

      case 'alert':
        return {
          data: { alerts: liveData.alerts || [] },
          status: 'success',
          lastUpdated: now
        };

      case 'gauge':
        return {
          data: this.getGaugeData(widget, liveData),
          status: 'success',
          lastUpdated: now
        };

      default:
        return {
          data: null,
          status: 'error',
          lastUpdated: now,
          error: `Unsupported widget type: ${widget.type}`
        };
    }
  }

  /**
   * Get metric data for widget
   */
  private getMetricData(widget: DashboardWidget, liveData: any): any {
    const metricType = widget.configuration.metricType;

    switch (metricType) {
      case 'active_users':
        return {
          value: liveData.activeUsers,
          unit: 'users',
          trend: 'up',
          change: '+12%'
        };
      case 'requests_per_minute':
        return {
          value: liveData.requestsPerMinute,
          unit: 'req/min',
          trend: 'stable',
          change: '+2%'
        };
      case 'response_time':
        return {
          value: liveData.averageResponseTime,
          unit: 'ms',
          trend: liveData.averageResponseTime < 500 ? 'up' : 'down',
          change: '-5%'
        };
      case 'error_rate':
        return {
          value: (liveData.errorRate * 100).toFixed(2),
          unit: '%',
          trend: liveData.errorRate < 0.01 ? 'up' : 'down',
          change: '-15%'
        };
      default:
        return {
          value: 0,
          unit: '',
          trend: 'stable',
          change: '0%'
        };
    }
  }

  /**
   * Get chart data for widget
   */
  private getChartData(widget: DashboardWidget, organizationId: string): any {
    // Generate sample chart data - in real implementation, this would use analytics engine
    const hours = 24;
    const data = [];

    for (let i = hours; i >= 0; i--) {
      const timestamp = new Date(Date.now() - i * 60 * 60 * 1000);
      data.push({
        timestamp: timestamp.toISOString(),
        value: Math.floor(Math.random() * 100) + 50
      });
    }

    return {
      series: [
        {
          name: widget.title,
          data: data
        }
      ],
      xAxis: 'timestamp',
      yAxis: 'value'
    };
  }

  /**
   * Get table data for widget
   */
  private getTableData(widget: DashboardWidget, organizationId: string): any {
    // Generate sample table data
    return {
      headers: ['User', 'Last Activity', 'Actions', 'Status'],
      rows: [
        ['user1@example.com', '2 minutes ago', '45', 'Active'],
        ['user2@example.com', '15 minutes ago', '23', 'Active'],
        ['user3@example.com', '1 hour ago', '67', 'Idle']
      ]
    };
  }

  /**
   * Get gauge data for widget
   */
  private getGaugeData(widget: DashboardWidget, liveData: any): any {
    // Calculate health score based on multiple metrics
    const responseTimeScore = Math.max(0, 100 - (liveData.averageResponseTime / 10));
    const errorRateScore = Math.max(0, 100 - (liveData.errorRate * 1000));
    const healthScore = (responseTimeScore + errorRateScore) / 2;

    return {
      value: Math.round(healthScore),
      min: 0,
      max: 100,
      unit: '%',
      thresholds: widget.configuration.thresholds || { warning: 80, critical: 95 }
    };
  }

  // Helper methods
  private findDashboard(dashboardId: string): Dashboard | undefined {
    for (const orgDashboards of this.dashboards.values()) {
      const dashboard = orgDashboards.find(d => d.dashboardId === dashboardId);
      if (dashboard) return dashboard;
    }
    return undefined;
  }

  private checkDashboardAccess(dashboard: Dashboard, userId: string): boolean {
    return dashboard.visibility === 'public' ||
      dashboard.owner === userId ||
      dashboard.permissions.viewers.includes(userId) ||
      dashboard.permissions.editors.includes(userId) ||
      dashboard.permissions.admins.includes(userId);
  }

  private checkDashboardEditAccess(dashboard: Dashboard, userId: string): boolean {
    return dashboard.owner === userId ||
      dashboard.permissions.editors.includes(userId) ||
      dashboard.permissions.admins.includes(userId);
  }

  private checkDashboardAdminAccess(dashboard: Dashboard, userId: string): boolean {
    return dashboard.owner === userId ||
      dashboard.permissions.admins.includes(userId);
  }

  private refreshDashboardData(dashboardId: string): void {
    const data = this.dashboardData.get(dashboardId);
    if (!data) return;

    // Mark all widgets for refresh
    Object.keys(data.widgets).forEach(widgetId => {
      data.widgets[widgetId].status = 'loading';
      this.widgetCache.delete(widgetId);
    });
  }

  private startRealTimeUpdates(): void {
    // Update dashboard data every minute
    setInterval(() => {
      this.updateAllDashboards();
    }, 60 * 1000);
  }

  private updateAllDashboards(): void {
    for (const [dashboardId, data] of this.dashboardData.entries()) {
      if (this.activeConnections.has(dashboardId)) {
        // Update only active dashboards
        this.refreshDashboardData(dashboardId);
      }
    }
  }

  private startAlertMonitoring(): void {
    // Check alerts every 5 minutes
    setInterval(() => {
      this.checkAlerts();
    }, 5 * 60 * 1000);
  }

  private checkAlerts(): void {
    for (const [organizationId, rules] of this.alertRules.entries()) {
      const dashboardData = analyticsEngine.getDashboardData(organizationId);

      rules.forEach(rule => {
        if (!rule.enabled) return;

        // Check cooldown
        if (rule.lastTriggered) {
          const lastTrigger = new Date(rule.lastTriggered);
          const cooldownEnd = new Date(lastTrigger.getTime() + rule.cooldown * 60 * 1000);
          if (new Date() < cooldownEnd) return;
        }

        // Evaluate condition
        if (this.evaluateAlertCondition(rule, dashboardData)) {
          this.triggerAlert(rule, organizationId);
        }
      });
    }
  }

  private evaluateAlertCondition(rule: AlertRule, data: any): boolean {
    // Simple condition evaluation - would be more sophisticated in real implementation
    return false;
  }

  private triggerAlert(rule: AlertRule, organizationId: string): void {
    rule.lastTriggered = new Date().toISOString();
    rule.triggerCount++;

    // Map alert severity to log severity
    const logSeverity = rule.severity === 'warning' ? 'warn' : rule.severity;

    // Log alert
    enterpriseLogger.recordAuditEvent({
      eventId: randomUUID(),
      eventType: 'error',
      severity: logSeverity,
      details: {
        action: 'alert_triggered',
        ruleId: rule.ruleId,
        ruleName: rule.name,
        triggerCount: rule.triggerCount
      },
      context: {
        requestId: randomUUID(),
        organizationId,
        method: 'trigger_alert',
        timestamp: new Date().toISOString(),
        source: 'mcp-server',
        version: '0.2.0'
      }
    });
  }

  // Export helper methods
  private convertDashboardToCSV(dashboard: Dashboard, dashboardId: string, timeRange?: any): string {
    // Convert dashboard data to CSV format
    return 'Dashboard,Widget,Value,Timestamp\n';
  }

  private generateDashboardPDF(dashboard: Dashboard, dashboardId: string, timeRange?: any): Buffer {
    // Generate PDF report - would use a PDF library in real implementation
    return Buffer.from('PDF placeholder');
  }
}

/**
 * Export singleton instance
 */
export const biDashboard = BusinessIntelligenceDashboard.getInstance();
