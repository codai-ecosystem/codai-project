import { WinstonLogger } from './winston-logger.js';
import { ElasticsearchIntegration } from './elasticsearch-integration.js';
import { LogCorrelationEngine } from './correlation-engine.js';
import { LogAggregatorService } from './log-aggregator.js';
import { createLoggingConfig, getValidatedConfig } from './config.js';
import { LogEntry, LogQuery, LoggingConfig } from './types.js';

// Export main components
export {
  WinstonLogger,
  ElasticsearchIntegration,
  LogCorrelationEngine,
  LogAggregatorService,
  createLoggingConfig,
  getValidatedConfig,
};

// Export types
export type {
  LogEntry,
  LogQuery,
  LoggingConfig,
};

// Main entry point - start the log aggregator service
export const startLoggingService = async (config?: LoggingConfig): Promise<LogAggregatorService> => {
  const service = new LogAggregatorService(config);
  await service.start();
  return service;
};

// Default export
export default {
  WinstonLogger,
  ElasticsearchIntegration,
  LogCorrelationEngine,
  LogAggregatorService,
  startLoggingService,
  createLoggingConfig,
  getValidatedConfig,
};