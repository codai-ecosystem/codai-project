// Universal LogAI Types
export interface LogLevel {
  DEBUG: 'debug'
  INFO: 'info'
  WARN: 'warn'
  ERROR: 'error'
  CRITICAL: 'critical'
}

export interface LogEntry {
  id: string
  timestamp: Date
  level: keyof LogLevel
  message: string
  app: string
  version: string
  environment: string
  userId?: string
  sessionId?: string
  metadata?: Record<string, any>
  tags?: string[]
  romanian?: {
    message?: string
    context?: string
  }
}

export interface PerformanceMetric {
  id: string
  timestamp: Date
  app: string
  metric: string
  value: number
  unit: string
  tags?: Record<string, string>
  romanian?: {
    description?: string
  }
}

export interface ErrorEvent {
  id: string
  timestamp: Date
  app: string
  error: string
  stack?: string
  context?: Record<string, any>
  userId?: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  romanian?: {
    userMessage?: string
    internalNote?: string
  }
}

export interface UserEvent {
  id: string
  timestamp: Date
  app: string
  userId: string
  action: string
  properties?: Record<string, any>
  page?: string
  referrer?: string
  romanian?: {
    actionDescription?: string
  }
}

export interface BusinessEvent {
  id: string
  timestamp: Date
  app: string
  event: string
  value?: number
  currency?: string
  properties?: Record<string, any>
  romanian?: {
    eventDescription?: string
  }
}

export interface AIInsight {
  id: string
  timestamp: Date
  type: 'anomaly' | 'prediction' | 'recommendation' | 'pattern'
  confidence: number
  description: string
  data: Record<string, any>
  actionable: boolean
  romanian?: {
    title?: string
    description?: string
    recommendation?: string
  }
}

export interface LogAIConfig {
  app: string
  version: string
  environment: 'development' | 'staging' | 'production'
  apiKey?: string
  endpoint?: string
  realtimeEnabled?: boolean
  batchSize?: number
  flushInterval?: number
  locale?: string
  features?: LogAIFeature[]
}

export type LogAIFeature =
  | 'real-time'
  | 'analytics'
  | 'ai-insights'
  | 'romanian-nlp'
  | 'performance-tracking'
  | 'error-tracking'
  | 'user-analytics'
  | 'business-metrics'

export interface DashboardMetrics {
  totalLogs: number
  errorRate: number
  averageResponseTime: number
  activeUsers: number
  topErrors: Array<{
    error: string
    count: number
    lastSeen: Date
  }>
  performance: Array<{
    app: string
    avgResponseTime: number
    errorCount: number
  }>
  romanian?: {
    summary?: string
  }
}

export interface AlertRule {
  id: string
  name: string
  condition: string
  threshold: number
  enabled: boolean
  channels: ('email' | 'slack' | 'webhook')[]
  romanian?: {
    name?: string
    description?: string
  }
}

export interface LogAIEventMap {
  'log': LogEntry
  'performance': PerformanceMetric
  'error': ErrorEvent
  'user': UserEvent
  'business': BusinessEvent
  'insight': AIInsight
  'connected': void
  'disconnected': void
}

export interface SearchQuery {
  query?: string
  app?: string
  level?: keyof LogLevel
  startTime?: Date
  endTime?: Date
  userId?: string
  tags?: string[]
  limit?: number
  offset?: number
}

export interface SearchResult {
  logs: LogEntry[]
  total: number
  aggregations?: Record<string, any>
  romanian?: {
    summary?: string
  }
}

export interface AnalyticsQuery {
  app?: string
  metric: string
  aggregation: 'sum' | 'avg' | 'count' | 'min' | 'max'
  interval: '1m' | '5m' | '1h' | '1d' | '1w'
  startTime: Date
  endTime: Date
  groupBy?: string[]
}

export interface AnalyticsResult {
  data: Array<{
    timestamp: Date
    value: number
    labels?: Record<string, string>
  }>
  romanian?: {
    insights?: string[]
  }
}
