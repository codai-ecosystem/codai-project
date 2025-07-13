/**
 * MarketAI LogAI Integration
 * Enhanced logging system for the Marketing Platform
 */

import { LogAIClient } from '@codai/logai-sdk'

export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'critical'

interface MarketAILogOptions {
  module?: string
  operation?: string
  userId?: string
  campaignId?: string
  audienceId?: string
  contentId?: string
  sessionId?: string
  context?: Record<string, any>
  tags?: string[]
}

class MarketAILogger {
  private static instance: MarketAILogger | undefined
  private logaiClient: LogAIClient | null = null
  private isEnabled: boolean = true

  private constructor() {
    try {
      this.logaiClient = new LogAIClient({
        apiKey: process.env.LOGAI_API_KEY || 'dev-key-marketai',
        environment: (process.env.NODE_ENV === 'production' ? 'production' : 'development') as 'development' | 'production',
        service: 'marketai',
        baseUrl: process.env.LOGAI_ENDPOINT || 'http://localhost:4032',
        enableConsole: true // Keep console output for development
      })
    } catch (error) {
      console.warn('Failed to initialize LogAI client for MarketAI:', error)
      this.logaiClient = null
    }
  }

  public static getInstance(): MarketAILogger {
    if (!MarketAILogger.instance) {
      MarketAILogger.instance = new MarketAILogger()
    }
    return MarketAILogger.instance
  }

  /**
   * Send log to LogAI service (non-blocking)
   */
  private async sendToLogAI(level: LogLevel, message: string, options: MarketAILogOptions): Promise<void> {
    if (!this.logaiClient || !this.isEnabled) return

    try {
      await this.logaiClient.log(
        level,
        message,
        {
          module: options.module || 'marketing',
          operation: options.operation,
          userId: options.userId,
          campaignId: options.campaignId,
          audienceId: options.audienceId,
          contentId: options.contentId,
          sessionId: options.sessionId,
          tags: options.tags || [],
          context: options.context || {}
        },
        {
          userId: options.userId,
          sessionId: options.sessionId
        }
      )
    } catch (error) {
      // Don't log LogAI errors to avoid infinite loops
      console.warn('Failed to send log to LogAI:', error)
    }
  }

  /**
   * Log campaign activity
   */
  public async logCampaignActivity(action: string, campaignType: string, options: MarketAILogOptions = {}): Promise<void> {
    const message = `[CAMPAIGN] ${action}: ${campaignType}`
    console.log(message, options.context || '')

    await this.sendToLogAI('info', message, {
      ...options,
      module: 'campaign-management',
      context: {
        ...options.context,
        action,
        campaignType,
        timestamp: Date.now()
      }
    })
  }

  /**
   * Log audience targeting
   */
  public async logAudienceTargeting(targetingType: string, audienceSize: number, options: MarketAILogOptions = {}): Promise<void> {
    const message = `[AUDIENCE] ${targetingType}: ${audienceSize} users`
    console.log(message, options.context || '')

    await this.sendToLogAI('info', message, {
      ...options,
      module: 'audience-targeting',
      context: {
        ...options.context,
        targetingType,
        audienceSize,
        timestamp: Date.now()
      }
    })
  }

  /**
   * Log content generation
   */
  public async logContentGeneration(contentType: string, aiModel: string, options: MarketAILogOptions = {}): Promise<void> {
    const message = `[CONTENT] Generated ${contentType} using ${aiModel}`
    console.log(message, options.context || '')

    await this.sendToLogAI('info', message, {
      ...options,
      module: 'content-generation',
      context: {
        ...options.context,
        contentType,
        aiModel,
        timestamp: Date.now()
      }
    })
  }

  /**
   * Log marketing analytics
   */
  public async logAnalytics(metricType: string, value: number, period: string, options: MarketAILogOptions = {}): Promise<void> {
    const message = `[ANALYTICS] ${metricType}: ${value} (${period})`
    console.log(message, options.context || '')

    await this.sendToLogAI('info', message, {
      ...options,
      module: 'analytics',
      context: {
        ...options.context,
        metricType,
        value,
        period,
        timestamp: Date.now()
      }
    })
  }

  /**
   * Log user action
   */
  public async logUserAction(action: string, options: MarketAILogOptions = {}): Promise<void> {
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
  public async logSystem(message: string, level: LogLevel = 'info', options: MarketAILogOptions = {}): Promise<void> {
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
  public async logPerformance(operation: string, duration: number, options: MarketAILogOptions = {}): Promise<void> {
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
  public async logError(error: Error | string, options: MarketAILogOptions = {}): Promise<void> {
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
   * Log A/B test results
   */
  public async logABTest(testName: string, variant: string, conversionRate: number, options: MarketAILogOptions = {}): Promise<void> {
    const message = `[A/B TEST] ${testName} (${variant}): ${conversionRate}% conversion`
    console.log(message, options.context || '')

    await this.sendToLogAI('info', message, {
      ...options,
      module: 'ab-testing',
      context: {
        ...options.context,
        testName,
        variant,
        conversionRate,
        timestamp: Date.now()
      }
    })
  }

  /**
   * Log API request
   */
  public async logAPIRequest(method: string, endpoint: string, statusCode: number, duration: number, options: MarketAILogOptions = {}): Promise<void> {
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
   * Log social media activity
   */
  public async logSocialMedia(platform: string, action: string, engagement: number, options: MarketAILogOptions = {}): Promise<void> {
    const message = `[SOCIAL] ${platform}: ${action} (${engagement} engagement)`
    console.log(message, options.context || '')

    await this.sendToLogAI('info', message, {
      ...options,
      module: 'social-media',
      context: {
        ...options.context,
        platform,
        action,
        engagement,
        timestamp: Date.now()
      }
    })
  }

  /**
   * Log warning
   */
  public async logWarning(message: string, options: MarketAILogOptions = {}): Promise<void> {
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
      logCampaignActivity: (action: string, campaignType: string, options: Omit<MarketAILogOptions, 'module'> = {}) =>
        this.logCampaignActivity(action, campaignType, { ...options, module }),
      logAudienceTargeting: (targetingType: string, audienceSize: number, options: Omit<MarketAILogOptions, 'module'> = {}) =>
        this.logAudienceTargeting(targetingType, audienceSize, { ...options, module }),
      logContentGeneration: (contentType: string, aiModel: string, options: Omit<MarketAILogOptions, 'module'> = {}) =>
        this.logContentGeneration(contentType, aiModel, { ...options, module }),
      logAnalytics: (metricType: string, value: number, period: string, options: Omit<MarketAILogOptions, 'module'> = {}) =>
        this.logAnalytics(metricType, value, period, { ...options, module }),
      logUserAction: (action: string, options: Omit<MarketAILogOptions, 'module'> = {}) =>
        this.logUserAction(action, { ...options, module }),
      logSystem: (message: string, level: LogLevel = 'info', options: Omit<MarketAILogOptions, 'module'> = {}) =>
        this.logSystem(message, level, { ...options, module }),
      logPerformance: (operation: string, duration: number, options: Omit<MarketAILogOptions, 'module'> = {}) =>
        this.logPerformance(operation, duration, { ...options, module }),
      logError: (error: Error | string, options: Omit<MarketAILogOptions, 'module'> = {}) =>
        this.logError(error, { ...options, module }),
      logABTest: (testName: string, variant: string, conversionRate: number, options: Omit<MarketAILogOptions, 'module'> = {}) =>
        this.logABTest(testName, variant, conversionRate, { ...options, module }),
      logAPIRequest: (method: string, endpoint: string, statusCode: number, duration: number, options: Omit<MarketAILogOptions, 'module'> = {}) =>
        this.logAPIRequest(method, endpoint, statusCode, duration, { ...options, module }),
      logSocialMedia: (platform: string, action: string, engagement: number, options: Omit<MarketAILogOptions, 'module'> = {}) =>
        this.logSocialMedia(platform, action, engagement, { ...options, module }),
      logWarning: (message: string, options: Omit<MarketAILogOptions, 'module'> = {}) =>
        this.logWarning(message, { ...options, module })
    }
  }
}

// Create singleton instance
const marketaiLogger = MarketAILogger.getInstance()

// Export convenience functions
export const logCampaign = marketaiLogger.logCampaignActivity.bind(marketaiLogger)
export const logAudience = marketaiLogger.logAudienceTargeting.bind(marketaiLogger)
export const logContent = marketaiLogger.logContentGeneration.bind(marketaiLogger)
export const logAnalytics = marketaiLogger.logAnalytics.bind(marketaiLogger)
export const logUser = marketaiLogger.logUserAction.bind(marketaiLogger)
export const logSystem = marketaiLogger.logSystem.bind(marketaiLogger)
export const logPerf = marketaiLogger.logPerformance.bind(marketaiLogger)
export const logError = marketaiLogger.logError.bind(marketaiLogger)
export const logABTest = marketaiLogger.logABTest.bind(marketaiLogger)
export const logAPI = marketaiLogger.logAPIRequest.bind(marketaiLogger)
export const logSocial = marketaiLogger.logSocialMedia.bind(marketaiLogger)
export const logWarn = marketaiLogger.logWarning.bind(marketaiLogger)

export default marketaiLogger
