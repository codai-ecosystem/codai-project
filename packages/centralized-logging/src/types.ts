// Centralized Logging Types and Interfaces
export interface LogEntry {
  id: string;
  timestamp: Date;
  level: 'error' | 'warn' | 'info' | 'debug' | 'trace';
  message: string;
  service: string;
  correlationId?: string;
  traceId?: string;
  spanId?: string;
  userId?: string;
  sessionId?: string;
  requestId?: string;
  metadata: Record<string, any>;
  context: LogContext;
}

export interface LogContext {
  environment: 'development' | 'staging' | 'production';
  version: string;
  hostname: string;
  pid: number;
  memory: {
    heapUsed: number;
    heapTotal: number;
    external: number;
    rss: number;
  };
  uptime: number;
}

export interface LogQuery {
  services?: string[];
  levels?: string[];
  startTime?: Date;
  endTime?: Date;
  correlationId?: string;
  traceId?: string;
  userId?: string;
  searchText?: string;
  limit?: number;
  offset?: number;
  sortBy?: 'timestamp' | 'level' | 'service';
  sortOrder?: 'asc' | 'desc';
}

export interface LogAggregation {
  field: string;
  interval?: 'minute' | 'hour' | 'day';
  count: number;
  value?: string | number;
  timestamp?: Date;
}

export interface LogAlert {
  id: string;
  name: string;
  description: string;
  query: LogQuery;
  threshold: {
    count: number;
    timeWindow: number; // minutes
  };
  channels: AlertChannel[];
  enabled: boolean;
  lastTriggered?: Date;
  createdBy: string;
  createdAt: Date;
}

export interface AlertChannel {
  type: 'email' | 'slack' | 'webhook' | 'dashboard';
  destination: string;
  enabled: boolean;
}

export interface LogRetentionPolicy {
  service: string;
  level: string;
  retentionDays: number;
  archiveEnabled: boolean;
  compressionEnabled: boolean;
}

export interface LogCorrelation {
  correlationId: string;
  traceId: string;
  entries: LogEntry[];
  services: string[];
  startTime: Date;
  endTime: Date;
  duration: number;
  errorCount: number;
  warningCount: number;
  totalEntries: number;
}

export interface LogMetrics {
  totalLogs: number;
  logsByLevel: Record<string, number>;
  logsByService: Record<string, number>;
  errorRate: number;
  averageProcessingTime: number;
  topErrors: Array<{
    message: string;
    count: number;
    service: string;
    lastOccurred: Date;
  }>;
  performanceMetrics: {
    indexingTime: number;
    searchTime: number;
    storageUsed: number;
  };
}

export interface LoggingConfig {
  server: {
    port: number;
    host: string;
    corsOrigins: string[];
  };
  winston: {
    level: string;
    format: 'json' | 'simple';
    transports: TransportConfig[];
  };
  elasticsearch: {
    node: string;
    index: string;
    maxRetries: number;
    requestTimeout: number;
    sniffOnStart: boolean;
  };
  redis: {
    host: string;
    port: number;
    password?: string;
    keyPrefix: string;
  };
  database: {
    postgres: {
      host: string;
      port: number;
      database: string;
      username: string;
      password: string;
    };
  };
  retention: LogRetentionPolicy[];
  correlation: {
    enabled: boolean;
    timeWindow: number; // minutes
  };
  alerting: {
    enabled: boolean;
    checkInterval: number; // minutes
  };
  security: {
    enableAuth: boolean;
    apiKey: string;
    rateLimiting: {
      windowMs: number;
      maxRequests: number;
    };
  };
}

export interface TransportConfig {
  type: 'console' | 'file' | 'daily-rotate' | 'elasticsearch';
  level?: string;
  options: Record<string, any>;
}

export interface LogStream {
  id: string;
  query: LogQuery;
  socket: any; // WebSocket
  lastActivity: Date;
  filters: LogStreamFilter[];
}

export interface LogStreamFilter {
  type: 'service' | 'level' | 'text' | 'correlation';
  value: string;
  enabled: boolean;
}

export interface LogProcessor {
  processLog(entry: LogEntry): Promise<void>;
  search(query: LogQuery): Promise<LogEntry[]>;
  correlate(correlationId: string): Promise<LogCorrelation>;
  aggregate(field: string, query: LogQuery): Promise<LogAggregation[]>;
  getMetrics(timeRange?: { start: Date; end: Date }): Promise<LogMetrics>;
}

export interface LogIngester {
  ingest(entry: LogEntry): Promise<void>;
  ingestBatch(entries: LogEntry[]): Promise<void>;
  validateEntry(entry: any): LogEntry;
}

export interface LogSearchEngine {
  index(entry: LogEntry): Promise<void>;
  search(query: LogQuery): Promise<{ entries: LogEntry[]; total: number }>;
  aggregate(field: string, query: LogQuery): Promise<LogAggregation[]>;
  deleteOldEntries(cutoffDate: Date): Promise<number>;
}

export interface LogCorrelationEngine {
  correlateById(correlationId: string): Promise<LogCorrelation>;
  correlateByTrace(traceId: string): Promise<LogCorrelation>;
  findRelatedLogs(entry: LogEntry, timeWindow: number): Promise<LogEntry[]>;
  createCorrelationMap(entries: LogEntry[]): Map<string, LogEntry[]>;
}

export interface LogAlertManager {
  checkAlerts(): Promise<void>;
  triggerAlert(alert: LogAlert, matchingLogs: LogEntry[]): Promise<void>;
  createAlert(alert: Omit<LogAlert, 'id' | 'createdAt'>): Promise<LogAlert>;
  updateAlert(id: string, updates: Partial<LogAlert>): Promise<LogAlert>;
  deleteAlert(id: string): Promise<void>;
  getAlerts(): Promise<LogAlert[]>;
}

export interface LogVisualization {
  timeSeriesChart(query: LogQuery, interval: string): Promise<Array<{
    timestamp: Date;
    count: number;
    level?: string;
  }>>;

  serviceDistribution(query: LogQuery): Promise<Array<{
    service: string;
    count: number;
    errorRate: number;
  }>>;

  errorAnalysis(query: LogQuery): Promise<Array<{
    error: string;
    count: number;
    services: string[];
    trend: 'up' | 'down' | 'stable';
  }>>;

  performanceTrends(query: LogQuery): Promise<Array<{
    timestamp: Date;
    avgResponseTime: number;
    throughput: number;
    errorRate: number;
  }>>;
}

export interface LogDashboardData {
  overview: {
    totalLogs: number;
    errorRate: number;
    services: number;
    alerts: number;
  };
  timeSeries: Array<{
    timestamp: Date;
    info: number;
    warn: number;
    error: number;
  }>;
  topServices: Array<{
    service: string;
    logs: number;
    errors: number;
    lastActivity: Date;
  }>;
  recentErrors: LogEntry[];
  activeAlerts: LogAlert[];
  correlations: LogCorrelation[];
}

export type LogLevel = 'error' | 'warn' | 'info' | 'debug' | 'trace';
export type LogFormat = 'json' | 'simple' | 'detailed';