/**
 * Universal LogAI Integration Pattern for CODAI Ecosystem
 * 
 * This file demonstrates how every CODAI app should integrate LogAI SDK
 * with proper API key management across the entire ecosystem.
 * 
 * Usage Pattern for ALL apps:
 * 1. Import LogAI client and API key utilities
 * 2. Initialize logger with service-specific configuration
 * 3. Use throughout app for logging, analytics, and monitoring
 * 4. Leverage real-time sync with other CODAI services
 */

// Types and interfaces
interface LogAIConfig {
    service: string
    apiKey: string
    environment: string
    enableRealtime: boolean
    metadata: {
        version: string
        platform: string
        ecosystem: string
    }
}

interface LogAIClient {
    info(message: string, data?: any): Promise<void>
    error(message: string, data?: any): Promise<void>
    warn(message: string, data?: any): Promise<void>
    debug(message: string, data?: any): Promise<void>
}

interface UserBehavior {
    event: string
    category: string
    properties?: Record<string, any>
}

interface BusinessMetric {
    name: string
    value: number
    unit?: string
    category: string
    metadata?: Record<string, any>
}

// Global logger instance
let logger: LogAIClient | null = null

/**
 * Initialize LogAI client for a specific service
 * This should be called once per app during startup
 */
async function initializeLogger(serviceName: string): Promise<LogAIClient> {
    try {
        // Get API key for LogAI service from centralized key management
        const apiKey = await getServiceAPIKey('logai')

        let finalApiKey = apiKey
        if (!apiKey) {
            console.warn(`No API key found for LogAI service. Using fallback.`)
            finalApiKey = process.env.LOGAI_API_KEY || 'development-key'
        }

        const config: LogAIConfig = {
            service: serviceName,
            apiKey: finalApiKey!,
            environment: process.env.NODE_ENV || 'development',
            enableRealtime: true,
            metadata: {
                version: process.env.npm_package_version || '1.0.0',
                platform: 'web',
                ecosystem: 'codai'
            }
        }

        // Create LogAI client instance (replace with actual SDK)
        logger = createLogAIClient(config)

        // Log service initialization
        await logger.info('Service initialized with LogAI integration', {
            service: serviceName,
            timestamp: new Date().toISOString(),
            hasApiKey: !!apiKey
        })

        console.log(`✅ LogAI initialized for ${serviceName}`)
        return logger
    } catch (error) {
        console.error(`❌ Failed to initialize LogAI for ${serviceName}:`, error)
        throw error
    }
}

/**
 * React hook for LogAI integration
 * Use this in React components across the ecosystem
 */
export function useLogAI() {
    const initLogger = async () => {
        if (!logger) {
            // Auto-detect service name from current app
            const serviceName = typeof window !== 'undefined'
                ? window.location.hostname.split('.')[0] // e.g., 'codai' from 'codai.ro'
                : process.env.SERVICE_NAME || 'unknown'

            await initializeLogger(serviceName)
        }
    }

    return {
        logger,
        initLogger,
        logEvent: async (event: string, data?: any) => {
            if (logger) {
                await logger.info(event, data)
            }
        },
        logError: async (error: string | Error, context?: any) => {
            if (logger) {
                await logger.error(error instanceof Error ? error.message : error, {
                    error: error instanceof Error ? error.stack : error,
                    ...context
                })
            }
        },
        logUserAction: async (action: string, userId?: string, metadata?: any) => {
            if (logger) {
                await logger.info(`User action: ${action}`, {
                    userId,
                    action,
                    timestamp: new Date().toISOString(),
                    ...metadata
                })
            }
        }
    }
}

/**
 * Server-side logging for API routes and middleware
 */
async function logServerActionImpl(
    serviceName: string,
    action: string,
    data?: any,
    error?: Error
): Promise<void> {
    try {
        if (!logger) {
            await initializeLogger(serviceName)
        }

        if (error) {
            await logger!.error(`Server error in ${action}`, {
                action,
                error: error.message,
                stack: error.stack,
                ...data
            })
        } else {
            await logger!.info(`Server action: ${action}`, {
                action,
                timestamp: new Date().toISOString(),
                ...data
            })
        }
    } catch (logError) {
        console.error('Failed to log server action:', logError)
    }
}

/**
 * Global error handler with LogAI
 */
function setupGlobalErrorHandlingImpl(serviceName: string): void {
    if (typeof window !== 'undefined') {
        window.addEventListener('error', async (event) => {
            if (logger) {
                await logger.error('Global JavaScript error', {
                    message: event.message,
                    filename: event.filename,
                    lineno: event.lineno,
                    colno: event.colno,
                    stack: event.error?.stack,
                    service: serviceName
                })
            }
        })

        window.addEventListener('unhandledrejection', async (event) => {
            if (logger) {
                await logger.error('Unhandled promise rejection', {
                    reason: event.reason,
                    service: serviceName
                })
            }
        })
    }
}

/**
 * Performance monitoring with LogAI
 */
function logPerformanceMetricsImpl(serviceName: string): void {
    if (typeof window !== 'undefined') {
        window.addEventListener('load', async () => {
            const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming

            if (logger) {
                await logger.info('Performance metrics', {
                    service: serviceName,
                    metrics: {
                        dns: navigation.domainLookupEnd - navigation.domainLookupStart,
                        tcp: navigation.connectEnd - navigation.connectStart,
                        ttfb: navigation.responseStart - navigation.requestStart,
                        dom: navigation.domContentLoadedEventEnd - navigation.domainLookupStart,
                        load: navigation.loadEventEnd - navigation.domainLookupStart
                    }
                })
            }
        })
    }
}

/**
 * Log interactions between CODAI services
 */
async function logServiceInteractionImpl(
    fromService: string,
    toService: string,
    action: string,
    data?: any,
    success: boolean = true
): Promise<void> {
    if (logger) {
        await logger.info(`Service interaction: ${fromService} → ${toService}`, {
            fromService,
            toService,
            action,
            success,
            timestamp: new Date().toISOString(),
            ...data
        })
    }
}

/**
 * Track user behavior for analytics
 */
async function trackUserBehaviorImpl(
    serviceName: string,
    userId: string,
    behavior: UserBehavior
): Promise<void> {
    if (logger) {
        await logger.info('User behavior', {
            service: serviceName,
            userId,
            behavior,
            timestamp: new Date().toISOString(),
            sessionId: typeof window !== 'undefined' ? window.sessionStorage.getItem('sessionId') : null
        })
    }
}

/**
 * Log business metrics
 */
async function logBusinessMetricImpl(
    serviceName: string,
    metric: BusinessMetric
): Promise<void> {
    if (logger) {
        await logger.info('Business metric', {
            service: serviceName,
            metric,
            timestamp: new Date().toISOString()
        })
    }
}

// Mock implementations (replace with actual package imports)
async function getServiceAPIKey(service: string): Promise<string | null> {
    // Replace with: import { getServiceAPIKey } from '@codai/api-keys'
    return process.env[`${service.toUpperCase()}_API_KEY`] || null
}

function createLogAIClient(config: LogAIConfig): LogAIClient {
    // Replace with: import { LogAIClient } from '@codai/logai-sdk'
    return {
        async info(message: string, data?: any): Promise<void> {
            console.log(`[INFO:${config.service}] ${message}`, data)
        },
        async error(message: string, data?: any): Promise<void> {
            console.error(`[ERROR:${config.service}] ${message}`, data)
        },
        async warn(message: string, data?: any): Promise<void> {
            console.warn(`[WARN:${config.service}] ${message}`, data)
        },
        async debug(message: string, data?: any): Promise<void> {
            console.debug(`[DEBUG:${config.service}] ${message}`, data)
        }
    }
}

// Export everything for easy app integration
export {
    initializeLogger,
    logServerActionImpl as logServerAction,
    setupGlobalErrorHandlingImpl as setupGlobalErrorHandling,
    logPerformanceMetricsImpl as logPerformanceMetrics,
    logServiceInteractionImpl as logServiceInteraction,
    trackUserBehaviorImpl as trackUserBehavior,
    logBusinessMetricImpl as logBusinessMetric,
    type LogAIConfig,
    type LogAIClient,
    type UserBehavior,
    type BusinessMetric
}
