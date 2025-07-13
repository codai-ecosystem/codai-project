/**
 * StocAI LogAI Integration
 * Centralized logging for StocAI application
 */

import { LogAIClient } from '@codai/logai-sdk'

// Initialize LogAI client for StocAI
const logger = new LogAIClient({
  apiKey: process.env.LOGAI_API_KEY || 'dev-key-stocai',
  environment: (process.env.NODE_ENV === 'production' ? 'production' : 'development') as 'development' | 'production',
  service: 'stocai',
  baseUrl: process.env.LOGAI_ENDPOINT || 'http://localhost:4032',
  enableConsole: true // Keep console output for development
})

export default logger

// Helper functions for structured logging
export const logOperationStart = async (operation: string, metadata: Record<string, any>) => {
  await logger.info(`${operation} started`, {
    operation,
    startTime: Date.now(),
    ...metadata
  })
}

export const logOperationSuccess = async (operation: string, metadata: Record<string, any>) => {
  await logger.info(`${operation} completed successfully`, {
    operation,
    endTime: Date.now(),
    ...metadata
  })
}

export const logOperationError = async (operation: string, error: any, metadata: Record<string, any>) => {
  await logger.error(`${operation} failed`, {
    operation,
    error: error.message,
    stack: error.stack,
    ...metadata
  })
}

export const logPerformance = async (operation: string, startTime: number, metadata: Record<string, any>) => {
  const duration = Date.now() - startTime
  await logger.info(`${operation} performance`, {
    operation,
    duration,
    ...metadata
  })
}

export const logUserAction = async (action: string, userId: string, metadata: Record<string, any>) => {
  await logger.info(`User action: ${action}`, {
    action,
    userId,
    timestamp: Date.now(),
    ...metadata
  })
}

// Re-export logger methods for convenience
export const { info, warn, error, debug } = logger
