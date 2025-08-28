// Analytics Dashboard Types and Interfaces
import { WebSocket } from 'ws';

export interface AnalyticsMetric {
  id: string;
  name: string;
  value: number;
  unit: string;
  timestamp: Date;
  service: string;
  category: 'performance' | 'business' | 'system' | 'user';
  tags?: Record<string, string>;
}

export interface TimeSeriesDataPoint {
  timestamp: Date;
  value: number;
  metadata?: Record<string, any>;
}

export interface TimeSeriesData {
  metric: string;
  service: string;
  data: TimeSeriesDataPoint[];
  aggregationType: 'sum' | 'avg' | 'min' | 'max' | 'count';
}

export interface DashboardWidget {
  id: string;
  type: 'line_chart' | 'bar_chart' | 'pie_chart' | 'gauge' | 'counter' | 'table';
  title: string;
  description?: string;
  metrics: string[];
  config: WidgetConfig;
  position: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  refreshInterval: number; // seconds
}

export interface WidgetConfig {
  colors?: string[];
  showLegend?: boolean;
  showGrid?: boolean;
  yAxisLabel?: string;
  xAxisLabel?: string;
  threshold?: {
    warning: number;
    critical: number;
  };
  format?: 'number' | 'percentage' | 'currency' | 'bytes' | 'duration';
  precision?: number;
}

export interface Dashboard {
  id: string;
  name: string;
  description?: string;
  widgets: DashboardWidget[];
  layout: 'grid' | 'flex' | 'custom';
  permissions: string[];
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ServiceHealth {
  service: string;
  status: 'healthy' | 'degraded' | 'unhealthy' | 'unknown';
  uptime: number; // percentage
  responseTime: number; // ms
  errorRate: number; // percentage
  throughput: number; // requests per second
  lastChecked: Date;
  details?: Record<string, any>;
}

export interface SystemPerformance {
  cpu: {
    usage: number; // percentage
    cores: number;
  };
  memory: {
    used: number; // bytes
    total: number; // bytes
    usage: number; // percentage
  };
  disk: {
    used: number; // bytes
    total: number; // bytes
    usage: number; // percentage
  };
  network: {
    bytesIn: number;
    bytesOut: number;
    packetsIn: number;
    packetsOut: number;
  };
}

export interface UserActivity {
  activeUsers: number;
  sessionsToday: number;
  averageSessionDuration: number; // minutes
  topPages: Array<{
    path: string;
    views: number;
    uniqueVisitors: number;
  }>;
  userActions: Array<{
    action: string;
    count: number;
    service: string;
  }>;
}

export interface BusinessMetrics {
  revenue: {
    total: number;
    growth: number; // percentage
    trend: 'up' | 'down' | 'stable';
  };
  conversions: {
    rate: number; // percentage
    count: number;
    value: number;
  };
  customerMetrics: {
    totalCustomers: number;
    newCustomers: number;
    churnRate: number; // percentage
    ltv: number; // customer lifetime value
  };
}

export interface AlertRule {
  id: string;
  name: string;
  metric: string;
  condition: 'greater_than' | 'less_than' | 'equals' | 'not_equals';
  threshold: number;
  severity: 'info' | 'warning' | 'critical';
  duration: number; // minutes
  enabled: boolean;
  channels: string[]; // email, slack, webhook
}

export interface Alert {
  id: string;
  rule: AlertRule;
  triggeredAt: Date;
  resolvedAt?: Date;
  status: 'active' | 'resolved' | 'acknowledged';
  currentValue: number;
  message: string;
}

export interface WebSocketMessage {
  type: 'metric_update' | 'alert' | 'health_update' | 'system_event' | 'user_action';
  timestamp: Date;
  data: any;
  service?: string;
}

export interface AnalyticsConfig {
  websocket: {
    port: number;
    path: string;
    heartbeat: number; // seconds
  };
  metrics: {
    retention: number; // days
    aggregationIntervals: number[]; // minutes
    batchSize: number;
  };
  database: {
    postgres: {
      host: string;
      port: number;
      database: string;
      username: string;
      password: string;
    };
    redis: {
      host: string;
      port: number;
      password?: string;
      keyPrefix: string;
    };
    neo4j?: {
      uri: string;
      username: string;
      password: string;
    };
  };
  services: {
    identityApi: string;
    apiGateway: string;
    hubApi: string;
    memoraiMcp: string;
    cbdDatabase: string;
    memoraiFrontend: string;
  };
  security: {
    enableAuth: boolean;
    allowedOrigins: string[];
    rateLimiting: {
      windowMs: number;
      maxRequests: number;
    };
  };
}

export interface MetricsCollector {
  collectSystemMetrics(): Promise<SystemPerformance>;
  collectServiceHealth(service: string): Promise<ServiceHealth>;
  collectUserActivity(): Promise<UserActivity>;
  collectBusinessMetrics(): Promise<BusinessMetrics>;
}

export interface WebSocketClient {
  id: string;
  socket: WebSocket;
  userId?: string;
  permissions: string[];
  subscribedMetrics: string[];
  lastActivity: Date;
}

export interface MetricsAggregator {
  aggregate(metrics: AnalyticsMetric[], interval: number): TimeSeriesData[];
  calculateTrends(data: TimeSeriesDataPoint[]): {
    trend: 'up' | 'down' | 'stable';
    changeRate: number;
    prediction?: number;
  };
}

export interface ExportFormat {
  format: 'csv' | 'json' | 'pdf' | 'excel';
  dateRange: {
    from: Date;
    to: Date;
  };
  metrics: string[];
  includeCharts?: boolean;
}