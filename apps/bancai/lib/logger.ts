/**
 * BancAI LogAI Integration
 * Enhanced logging system for the Banking & Finance Platform
 */

import { LogAIClient } from '@codai/logai-sdk'

export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'critical'

interface BancAILogOptions {
  module?: string
  operation?: string
  userId?: string
  accountId?: string
  transactionId?: string
  sessionId?: string
  context?: Record<string, any>
  tags?: string[]
}

class BancAILogger {
  private static instance: BancAILogger | undefined
  private logaiClient: LogAIClient | null = null
  private isEnabled: boolean = true

  private constructor() {
    try {
      this.logaiClient = new LogAIClient({
        apiKey: process.env.LOGAI_API_KEY || 'dev-key-bancai',
        environment: (process.env.NODE_ENV === 'production' ? 'production' : 'development') as 'development' | 'production',
        service: 'bancai',
        baseUrl: process.env.LOGAI_ENDPOINT || 'http://localhost:4032',
        enableConsole: true // Keep console output for development
      })
    } catch (error) {
      console.warn('Failed to initialize LogAI client for BancAI:', error)
      this.logaiClient = null
    }
  }

  public static getInstance(): BancAILogger {
    if (!BancAILogger.instance) {
      BancAILogger.instance = new BancAILogger()
    }
    return BancAILogger.instance
  }

  /**
   * Send log to LogAI service (non-blocking)
   */
  private async sendToLogAI(level: LogLevel, message: string, options: BancAILogOptions): Promise<void> {
    if (!this.logaiClient || !this.isEnabled) return

    try {
      await this.logaiClient.log({
        level,
        message,
        service: 'bancai',
        timestamp: new Date().toISOString(),
        metadata: {
          module: options.module || 'banking',
          operation: options.operation,
          userId: options.userId,
          accountId: options.accountId,
          transactionId: options.transactionId,
          sessionId: options.sessionId,
          tags: options.tags || [],
          context: options.context || {}
        }
      })
    } catch (error) {
      // Don't log LogAI errors to avoid infinite loops
      console.warn('Failed to send log to LogAI:', error)
    }
  }

  /**
   * Log banking transaction
   */
  public async logTransaction(transactionType: string, amount: number, options: BancAILogOptions = {}): Promise<void> {
    const message = `[TRANSACTION] ${transactionType}: $${amount.toFixed(2)}`
    console.log(message, options.context || '')

    await this.sendToLogAI('info', message, {
      ...options,
      module: 'banking-transactions',
      context: {
        ...options.context,
        transactionType,
        amount,
        timestamp: Date.now()
      }
    })
  }

  /**
   * Log account activity
   */
  public async logAccountActivity(action: string, options: BancAILogOptions = {}): Promise<void> {
    const message = `[ACCOUNT] ${action}`
    console.log(message, options.context || '')

    await this.sendToLogAI('info', message, {
      ...options,
      module: 'account-management',
      context: {
        ...options.context,
        action,
        timestamp: Date.now()
      }
    })
  }

  /**
   * Log user action
   */
  public async logUserAction(action: string, options: BancAILogOptions = {}): Promise<void> {
    const message = `[USER] ${action}`
    console.log(message, options.context || '')

    await this.sendToLogAI('info', message, {
      ...options,
      module: 'user-activity',
      context: {
        ...options.context,
        action,
        timestamp: Date.now()
      }
    })
  }

  /**
   * Log system event
   */
  public async logSystem(message: string, level: LogLevel = 'info', options: BancAILogOptions = {}): Promise<void> {
    const logMessage = `[SYSTEM] ${message}`
    console.log(logMessage, options.context || '')

    await this.sendToLogAI(level, logMessage, {
      ...options,
      module: 'system',
      context: {
        ...options.context,
        timestamp: Date.now()
      }
    })
  }

  /**
   * Log performance metrics
   */
  public async logPerformance(operation: string, duration: number, options: BancAILogOptions = {}): Promise<void> {
    const message = `[PERFORMANCE] ${operation}: ${duration}ms`
    console.log(message, options.context || '')

    await this.sendToLogAI('info', message, {
      ...options,
      module: 'performance',
      context: {
        ...options.context,
        operation,
        duration,
        timestamp: Date.now()
      }
    })
  }

  /**
   * Log error with full context
   */
  public async logError(error: Error | string, options: BancAILogOptions = {}): Promise<void> {
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
   * Log financial calculation
   */
  public async logFinancialCalculation(calculationType: string, inputs: Record<string, any>, result: any, options: BancAILogOptions = {}): Promise<void> {
    const message = `[CALCULATION] ${calculationType}: ${JSON.stringify(result)}`
    console.log(message, options.context || '')

    await this.sendToLogAI('info', message, {
      ...options,
      module: 'financial-calculations',
      context: {
        ...options.context,
        calculationType,
        inputs,
        result,
        timestamp: Date.now()
      }
    })
  }

  /**
   * Log API request
   */
  public async logAPIRequest(method: string, endpoint: string, statusCode: number, duration: number, options: BancAILogOptions = {}): Promise<void> {
    const message = `[API] ${method} ${endpoint} ${statusCode} (${duration}ms)`
    console.log(message, options.context || '')

    await this.sendToLogAI('info', message, {
      ...options,
      module: 'api',
      context: {
        ...options.context,
        method,
        endpoint,
        statusCode,
        duration,
        timestamp: Date.now()
      }
    })
  }

  /**
   * Log security event
   */
  public async logSecurity(event: string, severity: 'low' | 'medium' | 'high' | 'critical', options: BancAILogOptions = {}): Promise<void> {
    const message = `[SECURITY] ${severity.toUpperCase()}: ${event}`
    console.warn(message, options.context || '')

    await this.sendToLogAI(severity === 'critical' ? 'critical' : 'warn', message, {
      ...options,
      module: 'security',
      context: {
        ...options.context,
        event,
        severity,
        timestamp: Date.now()
      }
    })
  }

  /**
   * Log warning
   */
  public async logWarning(message: string, options: BancAILogOptions = {}): Promise<void> {
    const logMessage = `[WARNING] ${message}`
    console.warn(logMessage, options.context || '')

    await this.sendToLogAI('warn', logMessage, {
      ...options,
      module: 'warning',
      context: {
        ...options.context,
        timestamp: Date.now()
      }
    })
  }

  /**
   * Get module-specific logger
   */
  public getModuleLogger(module: string) {
    return {
      logTransaction: (transactionType: string, amount: number, options: Omit<BancAILogOptions, 'module'> = {}) =>
        this.logTransaction(transactionType, amount, { ...options, module }),
      logAccountActivity: (action: string, options: Omit<BancAILogOptions, 'module'> = {}) =>
        this.logAccountActivity(action, { ...options, module }),
      logUserAction: (action: string, options: Omit<BancAILogOptions, 'module'> = {}) =>
        this.logUserAction(action, { ...options, module }),
      logSystem: (message: string, level: LogLevel = 'info', options: Omit<BancAILogOptions, 'module'> = {}) =>
        this.logSystem(message, level, { ...options, module }),
      logPerformance: (operation: string, duration: number, options: Omit<BancAILogOptions, 'module'> = {}) =>
        this.logPerformance(operation, duration, { ...options, module }),
      logError: (error: Error | string, options: Omit<BancAILogOptions, 'module'> = {}) =>
        this.logError(error, { ...options, module }),
      logFinancialCalculation: (calculationType: string, inputs: Record<string, any>, result: any, options: Omit<BancAILogOptions, 'module'> = {}) =>
        this.logFinancialCalculation(calculationType, inputs, result, { ...options, module }),
      logAPIRequest: (method: string, endpoint: string, statusCode: number, duration: number, options: Omit<BancAILogOptions, 'module'> = {}) =>
        this.logAPIRequest(method, endpoint, statusCode, duration, { ...options, module }),
      logSecurity: (event: string, severity: 'low' | 'medium' | 'high' | 'critical', options: Omit<BancAILogOptions, 'module'> = {}) =>
        this.logSecurity(event, severity, { ...options, module }),
      logWarning: (message: string, options: Omit<BancAILogOptions, 'module'> = {}) =>
        this.logWarning(message, { ...options, module })
    }
  }
}

// Create singleton instance
const bancaiLogger = BancAILogger.getInstance()

// Export convenience functions
export const logTransaction = bancaiLogger.logTransaction.bind(bancaiLogger)
export const logAccount = bancaiLogger.logAccountActivity.bind(bancaiLogger)
export const logUser = bancaiLogger.logUserAction.bind(bancaiLogger)
export const logSystem = bancaiLogger.logSystem.bind(bancaiLogger)
export const logPerf = bancaiLogger.logPerformance.bind(bancaiLogger)
export const logError = bancaiLogger.logError.bind(bancaiLogger)
export const logFinancial = bancaiLogger.logFinancialCalculation.bind(bancaiLogger)
export const logAPI = bancaiLogger.logAPIRequest.bind(bancaiLogger)
export const logSecurity = bancaiLogger.logSecurity.bind(bancaiLogger)
export const logWarn = bancaiLogger.logWarning.bind(bancaiLogger)

export default bancaiLogger
