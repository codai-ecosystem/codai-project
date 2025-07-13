/**
 * CodAI LogAI Integration
 * Enhanced logging system for the CODAI development platform
 */

import { LogAIClient } from '@codai/logai-sdk'

export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'critical'

interface CodAILogOptions {
  module?: string
  operation?: string
  userId?: string
  projectId?: string
  sessionId?: string
  context?: Record<string, any>
  tags?: string[]
}

class CodAILogger {
  private static instance: CodAILogger | undefined
  private logaiClient: LogAIClient | null = null
  private isEnabled: boolean = true

  private constructor() {
    try {
      this.logaiClient = new LogAIClient({
        apiKey: process.env.LOGAI_API_KEY || 'dev-key-codai',
        environment: (process.env.NODE_ENV === 'production' ? 'production' : 'development') as 'development' | 'production',
        service: 'codai',
        baseUrl: process.env.LOGAI_ENDPOINT || 'http://localhost:4032',
        enableConsole: true // Keep console output for development
      })
    } catch (error) {
      console.warn('Failed to initialize LogAI client for CodAI:', error)
      this.logaiClient = null
    }
  }

  public static getInstance(): CodAILogger {
    if (CodAILogger.instance === undefined) {
      CodAILogger.instance = new CodAILogger()
    }
    return CodAILogger.instance
  }

  /**
   * Send log to LogAI service asynchronously
   */
  private async sendToLogAI(level: LogLevel, message: string, options: CodAILogOptions = {}): Promise<void> {
    if (!this.logaiClient) return

    try {
      const metadata = {
        module: options.module || 'codai',
        operation: options.operation,
        userId: options.userId,
        projectId: options.projectId,
        sessionId: options.sessionId,
        tags: options.tags || [],
        timestamp: Date.now(),
        platform: 'codai-development-platform',
        ...(options.context || {})
      }

      switch (level) {
        case 'debug':
          await this.logaiClient.debug(message, metadata)
          break
        case 'info':
          await this.logaiClient.info(message, metadata)
          break
        case 'warn':
          await this.logaiClient.warn(message, metadata)
          break
        case 'error':
        case 'critical':
          await this.logaiClient.error(message, metadata)
          break
      }
    } catch (logaiError) {
      // Silently fail to avoid breaking the application
      if (process.env.NODE_ENV === 'development') {
        console.warn('LogAI send failed:', logaiError)
      }
    }
  }

  /**
   * Log development activity
   */
  public async logDevelopment(message: string, options: CodAILogOptions = {}): Promise<void> {
    const formattedMessage = `[DEVELOPMENT] ${message}`
    console.info(formattedMessage, options.context || '')
    await this.sendToLogAI('info', formattedMessage, { ...options, module: 'development' })
  }

  /**
   * Log project activity
   */
  public async logProject(message: string, options: CodAILogOptions = {}): Promise<void> {
    const formattedMessage = `[PROJECT] ${message}`
    console.info(formattedMessage, options.context || '')
    await this.sendToLogAI('info', formattedMessage, { ...options, module: 'project' })
  }

  /**
   * Log user action
   */
  public async logUserAction(action: string, options: CodAILogOptions = {}): Promise<void> {
    const message = `[USER_ACTION] ${action}`
    console.info(message, options.context || '')
    await this.sendToLogAI('info', message, { ...options, module: 'user', operation: action })
  }

  /**
   * Log system event
   */
  public async logSystem(message: string, options: CodAILogOptions = {}): Promise<void> {
    const formattedMessage = `[SYSTEM] ${message}`
    console.info(formattedMessage, options.context || '')
    await this.sendToLogAI('info', formattedMessage, { ...options, module: 'system' })
  }

  /**
   * Log performance metrics
   */
  public async logPerformance(operation: string, duration: number, options: CodAILogOptions = {}): Promise<void> {
    const message = `[PERFORMANCE] ${operation} completed in ${duration}ms`
    console.info(message, options.context || '')
    await this.sendToLogAI('info', message, {
      ...options,
      module: 'performance',
      operation,
      context: { ...options.context, duration, performanceMetric: true }
    })
  }

  /**
   * Log error with full context
   */
  public async logError(error: Error | string, options: CodAILogOptions = {}): Promise<void> {
    const message = `[ERROR] ${error instanceof Error ? error.message : error}`
    console.error(message, error instanceof Error ? error.stack : '', options.context || '')

    await this.sendToLogAI('error', message, {
      ...options,
      module: 'error',
      context: {
        ...options.context,
        error: error instanceof Error ? error.message : error,
        stack: error instanceof Error ? error.stack : undefined,
        timestamp: Date.now()
      }
    })
  }

  /**
   * Log API request
   */
  public async logAPIRequest(endpoint: string, method: string, options: CodAILogOptions = {}): Promise<void> {
    const message = `[API] ${method} ${endpoint}`
    console.info(message, options.context || '')
    await this.sendToLogAI('info', message, {
      ...options,
      module: 'api',
      operation: 'request',
      context: { ...options.context, endpoint, method, type: 'api_request' }
    })
  }

  /**
   * Log warning
   */
  public async logWarning(message: string, options: CodAILogOptions = {}): Promise<void> {
    const formattedMessage = `[WARNING] ${message}`
    console.warn(formattedMessage, options.context || '')
    await this.sendToLogAI('warn', formattedMessage, { ...options, module: 'warning' })
  }

  /**
   * Create a scoped logger for a specific module
   */
  public createScope(module: string): Omit<CodAILogger, 'getInstance' | 'createScope'> {
    return {
      logDevelopment: (message: string, options: Omit<CodAILogOptions, 'module'> = {}) =>
        this.logDevelopment(message, { ...options, module }),
      logProject: (message: string, options: Omit<CodAILogOptions, 'module'> = {}) =>
        this.logProject(message, { ...options, module }),
      logUserAction: (action: string, options: Omit<CodAILogOptions, 'module'> = {}) =>
        this.logUserAction(action, { ...options, module }),
      logSystem: (message: string, options: Omit<CodAILogOptions, 'module'> = {}) =>
        this.logSystem(message, { ...options, module }),
      logPerformance: (operation: string, duration: number, options: Omit<CodAILogOptions, 'module'> = {}) =>
        this.logPerformance(operation, duration, { ...options, module }),
      logError: (error: Error | string, options: Omit<CodAILogOptions, 'module'> = {}) =>
        this.logError(error, { ...options, module }),
      logAPIRequest: (endpoint: string, method: string, options: Omit<CodAILogOptions, 'module'> = {}) =>
        this.logAPIRequest(endpoint, method, { ...options, module }),
      logWarning: (message: string, options: Omit<CodAILogOptions, 'module'> = {}) =>
        this.logWarning(message, { ...options, module }),
    }
  }
}

// Export singleton instance and helper functions
export const codaiLogger = CodAILogger.getInstance()

// Convenience exports for common operations
export const logDev = codaiLogger.logDevelopment.bind(codaiLogger)
export const logProject = codaiLogger.logProject.bind(codaiLogger)
export const logUser = codaiLogger.logUserAction.bind(codaiLogger)
export const logSystem = codaiLogger.logSystem.bind(codaiLogger)
export const logPerf = codaiLogger.logPerformance.bind(codaiLogger)
export const logError = codaiLogger.logError.bind(codaiLogger)
export const logAPI = codaiLogger.logAPIRequest.bind(codaiLogger)
export const logWarn = codaiLogger.logWarning.bind(codaiLogger)

export default codaiLogger
