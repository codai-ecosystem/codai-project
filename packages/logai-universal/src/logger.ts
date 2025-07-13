import { EventEmitter } from 'eventemitter3'
import { v4 as uuidv4 } from 'uuid'
import {
  LogAIConfig,
  LogEntry,
  PerformanceMetric,
  ErrorEvent,
  UserEvent,
  BusinessEvent,
  LogAIEventMap,
  LogLevel
} from './types'

export class LogAI extends EventEmitter<LogAIEventMap> {
  private config: LogAIConfig
  private logBuffer: LogEntry[] = []
  private metricsBuffer: PerformanceMetric[] = []
  private userId?: string
  private sessionId: string
  private flushTimer?: NodeJS.Timeout

  constructor(config: LogAIConfig) {
    super()
    this.config = {
      batchSize: 50,
      flushInterval: 5000,
      realtimeEnabled: true,
      endpoint: 'ws://localhost:4036/ws',
      locale: 'ro-RO',
      features: ['real-time', 'analytics'],
      ...config
    }
    this.sessionId = uuidv4()
    this.startFlushTimer()
  }

  // Core Logging Methods
  debug(message: string, metadata?: Record<string, any>) {
    this.log('DEBUG', message, metadata)
  }

  info(message: string, metadata?: Record<string, any>) {
    this.log('INFO', message, metadata)
  }

  warn(message: string, metadata?: Record<string, any>) {
    this.log('WARN', message, metadata)
  }

  error(message: string, metadata?: Record<string, any>) {
    this.log('ERROR', message, metadata)
  }

  critical(message: string, metadata?: Record<string, any>) {
    this.log('CRITICAL', message, metadata)
  }

  private log(level: keyof LogLevel, message: string, metadata?: Record<string, any>) {
    const entry: LogEntry = {
      id: uuidv4(),
      timestamp: new Date(),
      level,
      message,
      app: this.config.app,
      version: this.config.version,
      environment: this.config.environment,
      userId: this.userId,
      sessionId: this.sessionId,
      metadata,
      tags: metadata?.tags,
      romanian: metadata?.romanian
    }

    this.logBuffer.push(entry)
    this.emit('log', entry)

    if (this.config.realtimeEnabled) {
      this.sendRealtime('log', entry)
    }

    if (this.logBuffer.length >= (this.config.batchSize || 50)) {
      this.flush()
    }
  }

  // Performance Tracking
  trackPerformance(metric: string, value: number, unit: string = 'ms', tags?: Record<string, string>) {
    const perfMetric: PerformanceMetric = {
      id: uuidv4(),
      timestamp: new Date(),
      app: this.config.app,
      metric,
      value,
      unit,
      tags,
      romanian: tags?.romanian ? { description: tags.romanian } : undefined
    }

    this.metricsBuffer.push(perfMetric)
    this.emit('performance', perfMetric)

    if (this.config.realtimeEnabled) {
      this.sendRealtime('performance', perfMetric)
    }
  }

  trackRequest(url: string, options: { duration: number; status: number; method?: string }) {
    this.trackPerformance('request_duration', options.duration, 'ms', {
      url,
      status: options.status.toString(),
      method: options.method || 'GET'
    })

    this.info(`${options.method || 'GET'} ${url} - ${options.status} (${options.duration}ms)`, {
      request: {
        url,
        method: options.method || 'GET',
        status: options.status,
        duration: options.duration
      }
    })
  }

  // Error Tracking
  trackError(error: Error | string, context?: Record<string, any>) {
    const errorEvent: ErrorEvent = {
      id: uuidv4(),
      timestamp: new Date(),
      app: this.config.app,
      error: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined,
      context,
      userId: this.userId,
      severity: this.determineSeverity(error, context),
      romanian: context?.romanian
    }

    this.emit('error', errorEvent)
    this.error(`Error: ${errorEvent.error}`, { errorEvent })

    if (this.config.realtimeEnabled) {
      this.sendRealtime('error', errorEvent)
    }
  }

  private determineSeverity(error: Error | string, context?: Record<string, any>): 'low' | 'medium' | 'high' | 'critical' {
    if (context?.severity) return context.severity

    const message = error instanceof Error ? error.message : error

    if (message.includes('payment') || message.includes('security') || message.includes('authentication')) {
      return 'critical'
    }
    if (message.includes('database') || message.includes('network') || message.includes('API')) {
      return 'high'
    }
    if (message.includes('validation') || message.includes('user input')) {
      return 'medium'
    }
    return 'low'
  }

  // User Event Tracking
  trackUser(userId: string) {
    this.userId = userId
    this.info('User identified', { userId })
  }

  trackEvent(action: string, properties?: Record<string, any>) {
    const userEvent: UserEvent = {
      id: uuidv4(),
      timestamp: new Date(),
      app: this.config.app,
      userId: this.userId || 'anonymous',
      action,
      properties,
      page: properties?.page,
      referrer: properties?.referrer,
      romanian: properties?.romanian
    }

    this.emit('user', userEvent)
    this.info(`User event: ${action}`, { userEvent })

    if (this.config.realtimeEnabled) {
      this.sendRealtime('user', userEvent)
    }
  }

  trackPageView(page: string, properties?: Record<string, any>) {
    this.trackEvent('page_view', { page, ...properties })
  }

  // Business Event Tracking
  trackBusinessEvent(event: string, value?: number, currency?: string, properties?: Record<string, any>) {
    const businessEvent: BusinessEvent = {
      id: uuidv4(),
      timestamp: new Date(),
      app: this.config.app,
      event,
      value,
      currency,
      properties,
      romanian: properties?.romanian
    }

    this.emit('business', businessEvent)
    this.info(`Business event: ${event}`, { businessEvent })

    if (this.config.realtimeEnabled) {
      this.sendRealtime('business', businessEvent)
    }
  }

  trackRevenue(amount: number, currency: string = 'RON', properties?: Record<string, any>) {
    this.trackBusinessEvent('revenue', amount, currency, properties)
  }

  trackConversion(type: string, value?: number, properties?: Record<string, any>) {
    this.trackBusinessEvent(`conversion_${type}`, value, undefined, properties)
  }

  // AI Operations Tracking (for RomAI, DexAI, etc.)
  trackAIOperation(operation: string, metrics: Record<string, any>) {
    this.trackPerformance(`ai_${operation}`, metrics.duration || 0, 'ms', {
      operation,
      ...metrics
    })

    this.info(`AI Operation: ${operation}`, {
      ai: {
        operation,
        metrics,
        romanian: metrics.romanian
      }
    })
  }

  // Donation Tracking (for DonAI)
  trackDonation(amount: number, cause: string, method: 'crypto' | 'fiat', properties?: Record<string, any>) {
    this.trackBusinessEvent('donation', amount, 'RON', {
      cause,
      method,
      ...properties
    })

    this.info(`Donation: ${amount} RON to ${cause}`, {
      donation: {
        amount,
        cause,
        method,
        properties
      }
    })
  }

  // Email Tracking (for ConversAI)
  trackEmail(action: 'sent' | 'opened' | 'clicked' | 'replied', properties?: Record<string, any>) {
    this.trackEvent(`email_${action}`, properties)
  }

  // Flush and Cleanup
  flush() {
    if (this.logBuffer.length > 0 || this.metricsBuffer.length > 0) {
      // In a real implementation, this would send to a backend service
      console.log('LogAI Flush:', {
        logs: this.logBuffer.length,
        metrics: this.metricsBuffer.length,
        app: this.config.app
      })

      this.logBuffer = []
      this.metricsBuffer = []
    }
  }

  private sendRealtime(type: string, data: any) {
    // In a real implementation, this would use WebSocket to send real-time data
    if (typeof window !== 'undefined' && window.console) {
      console.log(`LogAI Real-time [${type}]:`, data)
    }
  }

  private startFlushTimer() {
    if (this.flushTimer) {
      clearInterval(this.flushTimer)
    }

    this.flushTimer = setInterval(() => {
      this.flush()
    }, this.config.flushInterval || 5000)
  }

  // Cleanup
  destroy() {
    if (this.flushTimer) {
      clearInterval(this.flushTimer)
    }
    this.flush()
    this.removeAllListeners()
  }
}

// Convenience function for quick setup
export function createLogAI(config: LogAIConfig): LogAI {
  return new LogAI(config)
}

// Pre-configured loggers for CODAI applications
export const CodaiLogger = (version: string = '2.0.0') => createLogAI({
  app: 'codai',
  version,
  environment: process.env.NODE_ENV as any || 'development',
  features: ['real-time', 'analytics', 'user-analytics', 'performance-tracking']
})

export const RomaiLogger = (version: string = '2.0.0') => createLogAI({
  app: 'romai',
  version,
  environment: process.env.NODE_ENV as any || 'development',
  features: ['real-time', 'analytics', 'ai-insights', 'romanian-nlp'],
  locale: 'ro-RO'
})

export const DexaiLogger = (version: string = '2.0.0') => createLogAI({
  app: 'dexai',
  version,
  environment: process.env.NODE_ENV as any || 'development',
  features: ['real-time', 'analytics', 'romanian-nlp'],
  locale: 'ro-RO'
})

export const ConversaiLogger = (version: string = '2.0.0') => createLogAI({
  app: 'conversai',
  version,
  environment: process.env.NODE_ENV as any || 'development',
  features: ['real-time', 'analytics', 'user-analytics'],
  locale: 'ro-RO'
})

export const DonaiLogger = (version: string = '2.0.0') => createLogAI({
  app: 'donai',
  version,
  environment: process.env.NODE_ENV as any || 'development',
  features: ['real-time', 'analytics', 'business-metrics', 'user-analytics'],
  locale: 'ro-RO'
})
