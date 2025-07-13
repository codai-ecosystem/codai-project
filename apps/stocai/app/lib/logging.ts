/**
 * StocAI Logging Service
 * Integrates with LogAI for comprehensive logging and monitoring
 */

import { createLogAIClient, getLogAIConfig, LogAIClient } from '@codai/logai-sdk'

class StocAILoggingService {
  private static instance: StocAILoggingService
  private logger: LogAIClient

  private constructor() {
    const config = getLogAIConfig('stocai')
    this.logger = createLogAIClient(config)
  }

  static getInstance(): StocAILoggingService {
    if (!StocAILoggingService.instance) {
      StocAILoggingService.instance = new StocAILoggingService()
    }
    return StocAILoggingService.instance
  }

  // File upload operations
  logFileUploadStart(fileName: string, fileSize: number, userId?: string) {
    return this.logger.info('File upload started', {
      operation: 'file_upload_start',
      fileName,
      fileSize,
      userId,
      module: 'storage'
    })
  }

  logFileUploadSuccess(fileName: string, fileId: string, uploadTime: number, userId?: string) {
    return this.logger.info('File upload completed successfully', {
      operation: 'file_upload_success',
      fileName,
      fileId,
      uploadTime,
      userId,
      module: 'storage'
    })
  }

  logFileUploadError(fileName: string, error: string, userId?: string) {
    return this.logger.error('File upload failed', {
      operation: 'file_upload_error',
      fileName,
      error,
      userId,
      module: 'storage'
    })
  }

  // Vector operations
  logVectorEmbeddingStart(fileId: string, chunkCount: number) {
    return this.logger.info('Vector embedding generation started', {
      operation: 'vector_embedding_start',
      fileId,
      chunkCount,
      module: 'vectors'
    })
  }

  logVectorEmbeddingSuccess(fileId: string, vectorCount: number, processingTime: number) {
    return this.logger.info('Vector embedding generation completed', {
      operation: 'vector_embedding_success',
      fileId,
      vectorCount,
      processingTime,
      module: 'vectors'
    })
  }

  logVectorSearchStart(query: string, filters?: any) {
    return this.logger.info('Vector search initiated', {
      operation: 'vector_search_start',
      query: query.substring(0, 100), // Truncate for privacy
      filters,
      module: 'search'
    })
  }

  logVectorSearchResults(query: string, resultCount: number, searchTime: number) {
    return this.logger.info('Vector search completed', {
      operation: 'vector_search_results',
      query: query.substring(0, 100),
      resultCount,
      searchTime,
      module: 'search'
    })
  }

  // API operations
  logAPIRequest(endpoint: string, method: string, userId?: string, requestId?: string) {
    return this.logger.debug('API request received', {
      operation: 'api_request',
      endpoint,
      method,
      userId,
      requestId,
      module: 'api'
    })
  }

  logAPIResponse(endpoint: string, method: string, statusCode: number, responseTime: number, requestId?: string) {
    const level = statusCode >= 400 ? 'error' : statusCode >= 300 ? 'warn' : 'info'
    return this.logger.log(level, 'API request completed', {
      operation: 'api_response',
      endpoint,
      method,
      statusCode,
      responseTime,
      requestId,
      module: 'api'
    })
  }

  // Database operations
  logDatabaseQuery(query: string, duration: number, table?: string) {
    return this.logger.debug('Database query executed', {
      operation: 'db_query',
      query: query.substring(0, 200), // Truncate long queries
      duration,
      table,
      module: 'database'
    })
  }

  logDatabaseError(query: string, error: string, table?: string) {
    return this.logger.error('Database query failed', {
      operation: 'db_error',
      query: query.substring(0, 200),
      error,
      table,
      module: 'database'
    })
  }

  // Storage operations
  logStorageOperation(operation: string, path: string, success: boolean, error?: string) {
    const level = success ? 'info' : 'error'
    return this.logger.log(level, `Storage operation: ${operation}`, {
      operation: 'storage_operation',
      storageOperation: operation,
      path,
      success,
      error,
      module: 'storage'
    })
  }

  // AI processing
  logAIProcessingStart(operation: string, inputSize: number, model?: string) {
    return this.logger.info('AI processing started', {
      operation: 'ai_processing_start',
      aiOperation: operation,
      inputSize,
      model,
      module: 'ai'
    })
  }

  logAIProcessingComplete(operation: string, outputSize: number, processingTime: number, model?: string) {
    return this.logger.info('AI processing completed', {
      operation: 'ai_processing_complete',
      aiOperation: operation,
      outputSize,
      processingTime,
      model,
      module: 'ai'
    })
  }

  logAIProcessingError(operation: string, error: string, model?: string) {
    return this.logger.error('AI processing failed', {
      operation: 'ai_processing_error',
      aiOperation: operation,
      error,
      model,
      module: 'ai'
    })
  }

  // System health
  logSystemHealth(metrics: any) {
    return this.logger.info('System health check', {
      operation: 'system_health',
      metrics,
      module: 'system'
    })
  }

  logPerformanceMetric(metric: string, value: number, unit: string) {
    return this.logger.debug('Performance metric recorded', {
      operation: 'performance_metric',
      metric,
      value,
      unit,
      module: 'performance'
    })
  }

  // Security events
  logSecurityEvent(event: string, severity: 'low' | 'medium' | 'high' | 'critical', details: any) {
    const level = severity === 'critical' ? 'critical' : severity === 'high' ? 'error' : 'warn'
    return this.logger.log(level, `Security event: ${event}`, {
      operation: 'security_event',
      event,
      severity,
      details,
      module: 'security'
    })
  }

  // User activity
  logUserActivity(userId: string, activity: string, metadata?: any) {
    return this.logger.info('User activity', {
      operation: 'user_activity',
      userId,
      activity,
      metadata,
      module: 'user'
    })
  }

  // Get analytics from LogAI
  async getAnalytics(timeRange?: '1h' | '6h' | '24h' | '7d' | '30d') {
    return await this.logger.getAnalytics({
      service: 'stocai',
      timeRange
    })
  }

  // Get AI insights
  async getAIInsights(query: string) {
    return await this.logger.getAIInsights(query, {
      service: 'stocai'
    })
  }

  // Manual flush
  async flush() {
    return await this.logger.flush()
  }

  // Cleanup
  destroy() {
    return this.logger.destroy()
  }
}

// Export singleton instance
export const stocaiLogger = StocAILoggingService.getInstance()

// Export class for testing
export { StocAILoggingService }
