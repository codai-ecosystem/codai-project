/**
 * @fileoverview Main logger package exports
 * @author Cautai Team
 * @version 1.0.0
 */

// Main classes
export { CautaiLogger } from './logger';
export { CautaiErrorHandler } from './error-handler';

// Type definitions and enums
export {
  LogLevel,
  ComponentType,
  ErrorCategory
} from './types';

export type {
  LogEntry,
  LoggerConfig,
  ErrorHandlingConfig,
  CautaiError,
  ICautaiLogger,
  IErrorHandler,
  IMetricsCollector,
  IHealthChecker,
  ICircuitBreaker
} from './types';

// Factory functions
import { CautaiLogger } from './logger';
import { CautaiErrorHandler } from './error-handler';
import { ComponentType, LoggerConfig, ErrorHandlingConfig, ICautaiLogger } from './types';

export function createLogger(
  component: ComponentType, 
  config?: Partial<LoggerConfig>
): CautaiLogger {
  return new CautaiLogger({ component, ...config });
}

export function createErrorHandler(
  logger: ICautaiLogger,
  config?: Partial<ErrorHandlingConfig>
): CautaiErrorHandler {
  return new CautaiErrorHandler(logger, config);
}

// Default logger instance for quick usage
export const defaultLogger = new CautaiLogger({ 
  component: ComponentType.LOGGER 
});