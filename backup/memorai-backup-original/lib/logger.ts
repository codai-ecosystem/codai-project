/**
 * MemorAI Enhanced Logging System
 * Memory & Database Platform logging without external dependencies
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'critical'

interface MemorAILogOptions {
  module?: string
  operation?: string
  userId?: string
  memoryId?: string
  databaseId?: string
  collectionId?: string
  sessionId?: string
  context?: Record<string, any>
  tags?: string[]
}

class MemorAILogger {
  private static instance: MemorAILogger | undefined
  private logaiClient: any = null
  private isEnabled: boolean = true

  private constructor() {
    // LogAI client removed for now - using console logging
    console.log('MemorAI Logger initialized for development mode')
  }

  public static getInstance(): MemorAILogger {
    if (!MemorAILogger.instance) {
      MemorAILogger.instance = new MemorAILogger()
    }
    return MemorAILogger.instance
  }

  /**
   * Send log to LogAI service (non-blocking)
   */
  private async sendToLogAI(level: LogLevel, message: string, options: MemorAILogOptions): Promise<void> {
    if (!this.logaiClient || !this.isEnabled) return

    try {
      await this.logaiClient.log({
        level,
        message,
        service: 'memorai',
        timestamp: new Date().toISOString(),
        metadata: {
          module: options.module || 'memory',
          operation: options.operation,
          userId: options.userId,
          memoryId: options.memoryId,
          databaseId: options.databaseId,
          collectionId: options.collectionId,
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
   * Log memory operation
   */
  public async logMemoryOperation(operation: string, memoryType: string, options: MemorAILogOptions = {}): Promise<void> {
    const message = `[MEMORY] ${operation}: ${memoryType}`
    console.log(message, options.context || '')

    await this.sendToLogAI('info', message, {
      ...options,
      module: 'memory-operations',
      context: {
        ...options.context,
        operation,
        memoryType,
        timestamp: Date.now()
      }
    })
  }

  /**
   * Log database query
   */
  public async logDatabaseQuery(queryType: string, collection: string, duration: number, options: MemorAILogOptions = {}): Promise<void> {
    const message = `[DATABASE] ${queryType} on ${collection}: ${duration}ms`
    console.log(message, options.context || '')

    await this.sendToLogAI('info', message, {
      ...options,
      module: 'database-queries',
      context: {
        ...options.context,
        queryType,
        collection,
        duration,
        timestamp: Date.now()
      }
    })
  }

  /**
   * Log user action
   */
  public async logUserAction(action: string, options: MemorAILogOptions = {}): Promise<void> {
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
  public async logSystem(message: string, level: LogLevel = 'info', options: MemorAILogOptions = {}): Promise<void> {
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
  public async logPerformance(operation: string, duration: number, options: MemorAILogOptions = {}): Promise<void> {
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
  public async logError(error: Error | string, options: MemorAILogOptions = {}): Promise<void> {
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
   * Log search operation
   */
  public async logSearch(searchType: string, query: string, resultCount: number, duration: number, options: MemorAILogOptions = {}): Promise<void> {
    const message = `[SEARCH] ${searchType}: "${query}" (${resultCount} results in ${duration}ms)`
    console.log(message, options.context || '')

    await this.sendToLogAI('info', message, {
      ...options,
      module: 'search',
      context: {
        ...options.context,
        searchType,
        query,
        resultCount,
        duration,
        timestamp: Date.now()
      }
    })
  }

  /**
   * Log API request
   */
  public async logAPIRequest(method: string, endpoint: string, statusCode: number, duration: number, options: MemorAILogOptions = {}): Promise<void> {
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
   * Log data sync operation
   */
  public async logDataSync(syncType: string, recordCount: number, options: MemorAILogOptions = {}): Promise<void> {
    const message = `[SYNC] ${syncType}: ${recordCount} records`
    console.log(message, options.context || '')

    await this.sendToLogAI('info', message, {
      ...options,
      module: 'data-sync',
      context: {
        ...options.context,
        syncType,
        recordCount,
        timestamp: Date.now()
      }
    })
  }

  /**
   * Log warning
   */
  public async logWarning(message: string, options: MemorAILogOptions = {}): Promise<void> {
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
   * Log analytics event
   */
  public async logAnalytics(event: string, data: Record<string, any> = {}, options: MemorAILogOptions = {}): Promise<void> {
    const message = `[ANALYTICS] ${event}`
    console.log(message, data)

    await this.sendToLogAI('info', message, {
      ...options,
      module: 'analytics',
      context: {
        ...options.context,
        event,
        data,
        timestamp: Date.now()
      }
    })
  }

  /**
   * Get module-specific logger
   */
  public getModuleLogger(module: string) {
    return {
      logMemoryOperation: (operation: string, memoryType: string, options: Omit<MemorAILogOptions, 'module'> = {}) =>
        this.logMemoryOperation(operation, memoryType, { ...options, module }),
      logDatabaseQuery: (queryType: string, collection: string, duration: number, options: Omit<MemorAILogOptions, 'module'> = {}) =>
        this.logDatabaseQuery(queryType, collection, duration, { ...options, module }),
      logUserAction: (action: string, options: Omit<MemorAILogOptions, 'module'> = {}) =>
        this.logUserAction(action, { ...options, module }),
      logSystem: (message: string, level: LogLevel = 'info', options: Omit<MemorAILogOptions, 'module'> = {}) =>
        this.logSystem(message, level, { ...options, module }),
      logPerformance: (operation: string, duration: number, options: Omit<MemorAILogOptions, 'module'> = {}) =>
        this.logPerformance(operation, duration, { ...options, module }),
      logError: (error: Error | string, options: Omit<MemorAILogOptions, 'module'> = {}) =>
        this.logError(error, { ...options, module }),
      logSearch: (searchType: string, query: string, resultCount: number, duration: number, options: Omit<MemorAILogOptions, 'module'> = {}) =>
        this.logSearch(searchType, query, resultCount, duration, { ...options, module }),
      logAPIRequest: (method: string, endpoint: string, statusCode: number, duration: number, options: Omit<MemorAILogOptions, 'module'> = {}) =>
        this.logAPIRequest(method, endpoint, statusCode, duration, { ...options, module }),
      logDataSync: (syncType: string, recordCount: number, options: Omit<MemorAILogOptions, 'module'> = {}) =>
        this.logDataSync(syncType, recordCount, { ...options, module }),
      logWarning: (message: string, options: Omit<MemorAILogOptions, 'module'> = {}) =>
        this.logWarning(message, { ...options, module })
    }
  }
}

// Create singleton instance
const memoraiLogger = MemorAILogger.getInstance()

// Export convenience functions
export const logMemory = memoraiLogger.logMemoryOperation.bind(memoraiLogger)
export const logDatabase = memoraiLogger.logDatabaseQuery.bind(memoraiLogger)
export const logUser = memoraiLogger.logUserAction.bind(memoraiLogger)
export const logSystem = memoraiLogger.logSystem.bind(memoraiLogger)
export const logPerf = memoraiLogger.logPerformance.bind(memoraiLogger)
export const logError = memoraiLogger.logError.bind(memoraiLogger)
export const logSearch = memoraiLogger.logSearch.bind(memoraiLogger)
export const logAPI = memoraiLogger.logAPIRequest.bind(memoraiLogger)
export const logSync = memoraiLogger.logDataSync.bind(memoraiLogger)
export const logWarn = memoraiLogger.logWarning.bind(memoraiLogger)
export const logAnalytics = memoraiLogger.logAnalytics.bind(memoraiLogger)

export default memoraiLogger
