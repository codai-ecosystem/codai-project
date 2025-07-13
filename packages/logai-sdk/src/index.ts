/**
 * LogAI SDK - Universal logging client for CODAI ecosystem
 * Provides seamless integration with LogAI service for all ecosystem apps
 */

export interface LogEntry {
  level: 'debug' | 'info' | 'warn' | 'error' | 'critical'
  message: string
  metadata?: Record<string, any>
  userId?: string
  sessionId?: string
  traceId?: string
}

export interface LogAIConfig {
  apiKey?: string
  baseUrl?: string
  service: string
  environment?: 'development' | 'staging' | 'production'
  enableConsole?: boolean
  batchSize?: number
  flushInterval?: number
}

export interface LogResponse {
  success: boolean
  processed: number
  errors?: string[]
}

export interface LogAnalytics {
  timeRange: { start: string; end: string }
  totalLogs: number
  logsByLevel: Record<string, number>
  logsByService: Record<string, number>
  errorRate: number
  topErrors: Array<{ message: string; count: number; service: string }>
  logVelocity: Array<{ timestamp: string; count: number }>
}

export class LogAIClient {
  private config: Required<LogAIConfig>
  private logQueue: LogEntry[] = []
  private flushTimer?: NodeJS.Timeout

  constructor(config: LogAIConfig) {
    this.config = {
      apiKey: config.apiKey || process.env.LOGAI_API_KEY || '',
      baseUrl: config.baseUrl || process.env.LOGAI_BASE_URL || 'http://localhost:4032',
      service: config.service,
      environment: config.environment || (process.env.NODE_ENV as any) || 'development',
      enableConsole: config.enableConsole ?? true,
      batchSize: config.batchSize || 10,
      flushInterval: config.flushInterval || 5000 // 5 seconds
    }

    // Auto-flush logs periodically
    this.startFlushTimer()
  }

  /**
   * Log a debug message
   */
  debug(message: string, metadata?: Record<string, any>, options?: Partial<LogEntry>) {
    return this.log('debug', message, metadata, options)
  }

  /**
   * Log an info message
   */
  info(message: string, metadata?: Record<string, any>, options?: Partial<LogEntry>) {
    return this.log('info', message, metadata, options)
  }

  /**
   * Log a warning message
   */
  warn(message: string, metadata?: Record<string, any>, options?: Partial<LogEntry>) {
    return this.log('warn', message, metadata, options)
  }

  /**
   * Log an error message
   */
  error(message: string, metadata?: Record<string, any>, options?: Partial<LogEntry>) {
    return this.log('error', message, metadata, options)
  }

  /**
   * Log a critical message (will flush immediately)
   */
  critical(message: string, metadata?: Record<string, any>, options?: Partial<LogEntry>) {
    this.log('critical', message, metadata, options)
    return this.flush() // Critical logs are sent immediately
  }

  /**
   * Log with custom level
   */
  log(level: LogEntry['level'], message: string, metadata?: Record<string, any>, options?: Partial<LogEntry>) {
    const entry: LogEntry = {
      level,
      message,
      metadata: { ...metadata, ...options?.metadata },
      userId: options?.userId,
      sessionId: options?.sessionId,
      traceId: options?.traceId || this.generateTraceId()
    }

    // Console output if enabled
    if (this.config.enableConsole) {
      this.logToConsole(entry)
    }

    // Add to queue
    this.logQueue.push(entry)

    // Flush if queue is full or if critical
    if (this.logQueue.length >= this.config.batchSize || level === 'critical') {
      return this.flush()
    }

    return Promise.resolve({ success: true, processed: 1 })
  }

  /**
   * Flush all queued logs to LogAI service
   */
  async flush(): Promise<LogResponse> {
    if (this.logQueue.length === 0) {
      return { success: true, processed: 0 }
    }

    const logsToSend = [...this.logQueue]
    this.logQueue = []

    try {
      const response = await fetch(`${this.config.baseUrl}/api/logs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.config.apiKey && { 'Authorization': `Bearer ${this.config.apiKey}` })
        },
        body: JSON.stringify({
          entries: logsToSend.map(entry => ({
            ...entry,
            service: this.config.service,
            environment: this.config.environment,
            timestamp: new Date().toISOString()
          }))
        })
      })

      if (!response.ok) {
        throw new Error(`LogAI API error: ${response.status} ${response.statusText}`)
      }

      const result = await response.json() as LogResponse
      return result

    } catch (error) {
      // On error, add logs back to queue (with deduplication)
      this.logQueue.unshift(...logsToSend)

      console.error('LogAI flush error:', error)
      return {
        success: false,
        processed: 0,
        errors: [error instanceof Error ? error.message : 'Unknown error']
      }
    }
  }

  /**
   * Get analytics from LogAI service
   */
  async getAnalytics(options?: {
    service?: string
    timeRange?: '1h' | '6h' | '24h' | '7d' | '30d'
  }): Promise<LogAnalytics | null> {
    try {
      const params = new URLSearchParams()
      if (options?.service) params.set('service', options.service)
      if (options?.timeRange) params.set('timeRange', options.timeRange)

      const response = await fetch(`${this.config.baseUrl}/api/analytics?${params}`, {
        headers: {
          ...(this.config.apiKey && { 'Authorization': `Bearer ${this.config.apiKey}` })
        }
      })

      if (!response.ok) {
        throw new Error(`LogAI Analytics API error: ${response.status}`)
      }

      const result = await response.json() as { analytics: LogAnalytics }
      return result.analytics

    } catch (error) {
      console.error('LogAI analytics error:', error)
      return null
    }
  }

  /**
   * Get AI insights about logs
   */
  async getAIInsights(query: string, filters?: Record<string, any>) {
    try {
      const response = await fetch(`${this.config.baseUrl}/api/analytics`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.config.apiKey && { 'Authorization': `Bearer ${this.config.apiKey}` })
        },
        body: JSON.stringify({ query, filters })
      })

      if (!response.ok) {
        throw new Error(`LogAI AI Insights API error: ${response.status}`)
      }

      return await response.json()

    } catch (error) {
      console.error('LogAI AI insights error:', error)
      return null
    }
  }

  /**
   * Clean up resources
   */
  destroy() {
    if (this.flushTimer) {
      clearInterval(this.flushTimer)
    }
    return this.flush() // Final flush
  }

  private startFlushTimer() {
    this.flushTimer = setInterval(() => {
      if (this.logQueue.length > 0) {
        this.flush().catch(console.error)
      }
    }, this.config.flushInterval)
  }

  private logToConsole(entry: LogEntry) {
    const timestamp = new Date().toISOString()
    const prefix = `[${timestamp}] [${this.config.service.toUpperCase()}] [${entry.level.toUpperCase()}]`

    const logMethod = entry.level === 'error' || entry.level === 'critical' ? 'error' :
      entry.level === 'warn' ? 'warn' : 'log'

    console[logMethod](`${prefix} ${entry.message}`, entry.metadata || '')
  }

  private generateTraceId(): string {
    return `trace_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }
}

/**
 * Default LogAI instance for quick usage
 */
export const createLogAIClient = (config: LogAIConfig): LogAIClient => {
  return new LogAIClient(config)
}

/**
 * Environment-aware configuration helper
 */
export const getLogAIConfig = (service: string): LogAIConfig => {
  const isDevelopment = process.env.NODE_ENV === 'development'
  const isProduction = process.env.NODE_ENV === 'production'

  return {
    service,
    environment: isDevelopment ? 'development' : isProduction ? 'production' : 'staging',
    baseUrl: isDevelopment
      ? 'http://localhost:4032'
      : process.env.LOGAI_PRODUCTION_URL || 'https://logai.ro',
    apiKey: isDevelopment
      ? process.env.LOGAI_DEV_API_KEY
      : process.env.LOGAI_PRODUCTION_API_KEY,
    enableConsole: isDevelopment,
    batchSize: isDevelopment ? 5 : 20,
    flushInterval: isDevelopment ? 3000 : 10000
  }
}
