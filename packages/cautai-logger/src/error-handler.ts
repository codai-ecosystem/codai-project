/**
 * @fileoverview Comprehensive error handling and recovery
 * @author Cautai Team
 * @version 1.0.0
 */

import {
  ComponentType,
  ErrorCategory,
  ErrorHandlingConfig,
  ErrorHandlingConfigSchema,
  CautaiError,
  IErrorHandler,
  ICautaiLogger
} from './types';

export class CautaiErrorHandler implements IErrorHandler {
  private config: ErrorHandlingConfig;
  private logger: ICautaiLogger;
  private errorCounts = new Map<string, number>();
  private circuitBreakers = new Map<string, {
    isOpen: boolean;
    failures: number;
    lastFailureTime: number;
    nextAttemptTime: number;
  }>();

  constructor(
    logger: ICautaiLogger,
    config?: Partial<ErrorHandlingConfig>
  ) {
    this.logger = logger;
    this.config = ErrorHandlingConfigSchema.parse(config || {});
  }

  async handleError(error: Error | CautaiError, context?: Record<string, unknown>): Promise<void> {
    const cautaiError = this.normalizeToCautaiError(error, context);
    
    // Log the error
    this.logger.error('Error occurred', cautaiError, context);

    // Update error counts for circuit breaker
    if (this.config.enableCircuitBreaker) {
      this.updateCircuitBreaker(cautaiError);
    }

    // Check if we should send alerts
    if (this.config.enableErrorReporting && this.shouldAlert(cautaiError)) {
      await this.sendAlert(cautaiError, context);
    }

    // Store error metrics
    this.recordErrorMetrics(cautaiError);
  }

  createError(
    category: ErrorCategory,
    message: string,
    details?: Record<string, unknown>,
    originalError?: Error
  ): CautaiError {
    const error = new Error(message) as CautaiError;
    error.category = category;
    error.details = details;
    error.component = ComponentType.LOGGER; // Will be overridden by actual component
    error.retryable = this.isRetryable(error);

    // Set status codes based on category
    switch (category) {
      case ErrorCategory.AUTHENTICATION:
        error.statusCode = 401;
        break;
      case ErrorCategory.AUTHORIZATION:
        error.statusCode = 403;
        break;
      case ErrorCategory.VALIDATION:
        error.statusCode = 400;
        break;
      case ErrorCategory.RATE_LIMIT:
        error.statusCode = 429;
        break;
      case ErrorCategory.TIMEOUT:
        error.statusCode = 408;
        break;
      case ErrorCategory.EXTERNAL_API:
        error.statusCode = 502;
        break;
      case ErrorCategory.INTERNAL:
      case ErrorCategory.UNKNOWN:
      default:
        error.statusCode = 500;
        break;
    }

    if (originalError) {
      error.stack = originalError.stack;
      // Store original error in details instead of cause
      if (!error.details) error.details = {};
      error.details.originalError = {
        name: originalError.name,
        message: originalError.message,
        stack: originalError.stack
      };
    }

    return error;
  }

  isRetryable(error: Error | CautaiError): boolean {
    const cautaiError = error as CautaiError;
    
    // Check explicit retryable flag
    if (cautaiError.retryable !== undefined) {
      return cautaiError.retryable;
    }

    // Check category-based retry logic
    return this.config.retryableErrors.includes(
      cautaiError.category || ErrorCategory.UNKNOWN
    );
  }

  shouldAlert(error: Error | CautaiError): boolean {
    const cautaiError = error as CautaiError;
    
    // Always alert for critical errors
    if (cautaiError.category === ErrorCategory.INTERNAL && 
        cautaiError.statusCode === 500) {
      return true;
    }

    // Check error rate threshold
    const errorKey = `${cautaiError.category}_${cautaiError.component}`;
    const currentCount = this.errorCounts.get(errorKey) || 0;
    const errorRate = currentCount / this.config.alertThresholds.timeWindowMs;
    
    return errorRate > this.config.alertThresholds.errorRate;
  }

  // Circuit breaker methods
  isCircuitOpen(operation: string): boolean {
    if (!this.config.enableCircuitBreaker) return false;
    
    const breaker = this.circuitBreakers.get(operation);
    if (!breaker) return false;

    // Check if circuit should be closed again (half-open state)
    if (breaker.isOpen && Date.now() > breaker.nextAttemptTime) {
      breaker.isOpen = false;
      this.logger.info(`Circuit breaker half-open for operation: ${operation}`);
    }

    return breaker.isOpen;
  }

  recordCircuitBreakerSuccess(operation: string): void {
    const breaker = this.circuitBreakers.get(operation);
    if (breaker) {
      breaker.failures = 0;
      breaker.isOpen = false;
      this.logger.debug(`Circuit breaker success recorded for: ${operation}`);
    }
  }

  // Retry logic
  async withRetry<T>(
    operation: () => Promise<T>,
    operationName: string,
    context?: Record<string, unknown>
  ): Promise<T> {
    let lastError: Error | CautaiError;
    
    for (let attempt = 0; attempt <= this.config.maxRetries; attempt++) {
      try {
        // Check circuit breaker
        if (this.isCircuitOpen(operationName)) {
          throw this.createError(
            ErrorCategory.EXTERNAL_API,
            `Circuit breaker is open for operation: ${operationName}`,
            { operation: operationName, attempt }
          );
        }

        const result = await operation();
        
        // Record success if we had previous failures
        if (attempt > 0) {
          this.logger.info(`Operation succeeded after ${attempt} retries`, {
            operation: operationName,
            attempt,
            ...context
          });
          this.recordCircuitBreakerSuccess(operationName);
        }
        
        return result;
      } catch (error) {
        lastError = error as Error | CautaiError;
        
        // Log the attempt
        this.logger.warn(`Operation failed, attempt ${attempt + 1}/${this.config.maxRetries + 1}`, {
          operation: operationName, 
          attempt, 
          error: lastError.message,
          ...context 
        });

        // Check if we should retry
        if (attempt === this.config.maxRetries || !this.isRetryable(lastError)) {
          await this.handleError(lastError, { 
            operation: operationName, 
            finalAttempt: true,
            totalAttempts: attempt + 1,
            ...context 
          });
          break;
        }

        // Calculate delay with exponential backoff
        const delay = this.config.retryDelayMs * 
          Math.pow(this.config.retryBackoffMultiplier, attempt);
        
        this.logger.debug(`Retrying in ${delay}ms`, { operation: operationName, delay });
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    throw lastError!;
  }

  private normalizeToCautaiError(error: Error | CautaiError, context?: Record<string, unknown>): CautaiError {
    if ((error as CautaiError).category) {
      return error as CautaiError;
    }

    // Convert standard errors to CautaiError
    const cautaiError = error as CautaiError;
    cautaiError.category = this.categorizeError(error);
    cautaiError.component = ComponentType.LOGGER; // Will be set by actual component
    cautaiError.retryable = this.isRetryable(cautaiError);
    
    if (context?.component) {
      cautaiError.component = context.component as ComponentType;
    }
    
    return cautaiError;
  }

  private categorizeError(error: Error): ErrorCategory {
    const message = error.message.toLowerCase();
    const name = error.name.toLowerCase();

    // Network errors
    if (message.includes('network') || message.includes('connection') || 
        message.includes('timeout') || name.includes('timeout')) {
      return ErrorCategory.NETWORK;
    }

    // Validation errors
    if (name.includes('validation') || message.includes('invalid') ||
        message.includes('required') || message.includes('format')) {
      return ErrorCategory.VALIDATION;
    }

    // Authentication/Authorization
    if (message.includes('unauthorized') || message.includes('forbidden') ||
        name.includes('auth')) {
      return ErrorCategory.AUTHENTICATION;
    }

    // Rate limiting
    if (message.includes('rate limit') || message.includes('too many')) {
      return ErrorCategory.RATE_LIMIT;
    }

    // Parsing errors
    if (name.includes('parse') || name.includes('syntax') || 
        message.includes('parse') || message.includes('syntax')) {
      return ErrorCategory.PARSING;
    }

    return ErrorCategory.UNKNOWN;
  }

  private updateCircuitBreaker(error: CautaiError): void {
    const key = `${error.component}_${error.category}`;
    let breaker = this.circuitBreakers.get(key);
    
    if (!breaker) {
      breaker = {
        isOpen: false,
        failures: 0,
        lastFailureTime: 0,
        nextAttemptTime: 0
      };
      this.circuitBreakers.set(key, breaker);
    }

    breaker.failures++;
    breaker.lastFailureTime = Date.now();

    // Open circuit if threshold exceeded
    if (breaker.failures >= this.config.circuitBreakerThreshold) {
      breaker.isOpen = true;
      breaker.nextAttemptTime = Date.now() + this.config.circuitBreakerTimeoutMs;
      
      this.logger.warn(`Circuit breaker opened for ${key}`, {
        failures: breaker.failures,
        threshold: this.config.circuitBreakerThreshold
      });
    }
  }

  private recordErrorMetrics(error: CautaiError): void {
    const errorKey = `${error.category}_${error.component}`;
    const currentCount = this.errorCounts.get(errorKey) || 0;
    this.errorCounts.set(errorKey, currentCount + 1);

    // Clean up old counts periodically
    setTimeout(() => {
      const count = this.errorCounts.get(errorKey);
      if (count && count > 0) {
        this.errorCounts.set(errorKey, count - 1);
      }
    }, this.config.alertThresholds.timeWindowMs);
  }

  private async sendAlert(error: CautaiError, context?: Record<string, unknown>): Promise<void> {
    // In a real implementation, this would send to Slack, email, PagerDuty, etc.
    this.logger.error('ALERT: Critical error occurred', error, {
      alertLevel: 'critical',
      component: error.component,
      category: error.category,
      ...context
    });

    // For development, just log the alert
    console.error('🚨 CRITICAL ALERT 🚨', {
      error: error.message,
      component: error.component,
      category: error.category,
      statusCode: error.statusCode,
      details: error.details,
      context
    });
  }

  // Utility methods
  getErrorStats(): Record<string, { count: number; category: ErrorCategory }> {
    const stats: Record<string, { count: number; category: ErrorCategory }> = {};
    
    this.errorCounts.forEach((count, key) => {
      const [category] = key.split('_');
      stats[key] = { 
        count, 
        category: category as ErrorCategory 
      };
    });
    
    return stats;
  }

  getCircuitBreakerStats(): Record<string, {
    isOpen: boolean;
    failures: number;
    lastFailureTime: number;
  }> {
    const stats: Record<string, {
      isOpen: boolean;
      failures: number;
      lastFailureTime: number;
    }> = {};
    
    this.circuitBreakers.forEach((breaker, key) => {
      stats[key] = {
        isOpen: breaker.isOpen,
        failures: breaker.failures,
        lastFailureTime: breaker.lastFailureTime
      };
    });
    
    return stats;
  }

  reset(): void {
    this.errorCounts.clear();
    this.circuitBreakers.clear();
    this.logger.info('Error handler state reset');
  }
}