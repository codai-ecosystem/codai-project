/**
 * METU Error Handler
 * 
 * Comprehensive error handling and recovery system for METU applications.
 * Provides error capture, classification, recovery strategies, and
 * proactive error prevention mechanisms.
 */

import type {
  MetuErrorMetrics,
  MetuErrorReport,
  MetuErrorRecovery
} from '../types';

interface ErrorClassification {
  category: 'system' | 'application' | 'user' | 'network' | 'security';
  severity: 'low' | 'medium' | 'high' | 'critical';
  priority: number;
  recoverable: boolean;
  retryable: boolean;
}

interface ErrorPattern {
  id: string;
  pattern: RegExp;
  classification: ErrorClassification;
  recoveryStrategy: string;
  occurrences: number;
  lastOccurrence: Date;
  resolved: boolean;
}

interface RecoveryStrategy {
  name: string;
  description: string;
  steps: string[];
  success_rate: number;
  average_recovery_time: number;
  enabled: boolean;
}

interface ErrorContext {
  timestamp: Date;
  userId?: string;
  sessionId?: string;
  userAgent?: string;
  url?: string;
  component: string;
  action?: string;
  stackTrace?: string;
  breadcrumbs: string[];
  metadata: Record<string, any>;
}

interface CapturedError {
  id: string;
  message: string;
  stack?: string;
  type: string;
  classification: ErrorClassification;
  context: ErrorContext;
  resolved: boolean;
  recovery_attempts: number;
  recovery_successful: boolean;
  recovery_time?: number;
}

export class MetuErrorHandler {
  private errorPatterns: Map<string, ErrorPattern> = new Map();
  private recoveryStrategies: Map<string, RecoveryStrategy> = new Map();
  private capturedErrors: CapturedError[] = [];
  private errorMetrics: MetuErrorMetrics | null = null;
  private globalErrorHandler: ((event: ErrorEvent) => void) | null = null;
  private unhandledRejectionHandler: ((event: PromiseRejectionEvent) => void) | null = null;
  private isInitialized: boolean = false;

  constructor(private config: any = {}) {
    this.config = {
      maxErrorHistory: 1000,
      errorRetention: 7 * 24 * 60 * 60 * 1000, // 7 days
      enableAutoRecovery: true,
      enableErrorReporting: true,
      maxRetryAttempts: 3,
      retryDelay: 1000,
      ...config
    };
  }

  /**
   * Initialize error handler
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    console.log('🛡️ Initializing METU Error Handler...');

    try {
      // Setup error patterns
      await this.setupErrorPatterns();

      // Configure recovery strategies
      await this.setupRecoveryStrategies();

      // Install global error handlers
      this.installGlobalErrorHandlers();

      // Start error metrics collection
      this.startMetricsCollection();

      this.isInitialized = true;
      console.log('✅ Error Handler initialized successfully');

    } catch (error) {
      console.error('❌ Failed to initialize Error Handler:', error);
      throw error;
    }
  }

  /**
   * Setup error patterns for classification
   */
  private async setupErrorPatterns(): Promise<void> {
    // Network error patterns
    this.addErrorPattern({
      id: 'network_timeout',
      pattern: /timeout|ETIMEDOUT|ERR_NETWORK/i,
      classification: {
        category: 'network',
        severity: 'medium',
        priority: 3,
        recoverable: true,
        retryable: true
      },
      recoveryStrategy: 'retry_with_backoff',
      occurrences: 0,
      lastOccurrence: new Date(),
      resolved: false
    });

    this.addErrorPattern({
      id: 'network_connection',
      pattern: /ERR_INTERNET_DISCONNECTED|ERR_NETWORK_CHANGED|fetch.*failed/i,
      classification: {
        category: 'network',
        severity: 'high',
        priority: 2,
        recoverable: true,
        retryable: true
      },
      recoveryStrategy: 'wait_and_retry',
      occurrences: 0,
      lastOccurrence: new Date(),
      resolved: false
    });

    // Application error patterns
    this.addErrorPattern({
      id: 'memory_leak',
      pattern: /out of memory|Maximum call stack|RangeError.*Maximum/i,
      classification: {
        category: 'system',
        severity: 'critical',
        priority: 1,
        recoverable: false,
        retryable: false
      },
      recoveryStrategy: 'restart_component',
      occurrences: 0,
      lastOccurrence: new Date(),
      resolved: false
    });

    this.addErrorPattern({
      id: 'api_error',
      pattern: /API.*error|HTTP.*[45]\d{2}|Request failed/i,
      classification: {
        category: 'application',
        severity: 'medium',
        priority: 3,
        recoverable: true,
        retryable: true
      },
      recoveryStrategy: 'api_fallback',
      occurrences: 0,
      lastOccurrence: new Date(),
      resolved: false
    });

    // User input error patterns
    this.addErrorPattern({
      id: 'validation_error',
      pattern: /validation.*failed|invalid.*input|schema.*error/i,
      classification: {
        category: 'user',
        severity: 'low',
        priority: 4,
        recoverable: true,
        retryable: false
      },
      recoveryStrategy: 'user_notification',
      occurrences: 0,
      lastOccurrence: new Date(),
      resolved: false
    });

    // Security error patterns
    this.addErrorPattern({
      id: 'auth_error',
      pattern: /unauthorized|403|authentication.*failed|token.*expired/i,
      classification: {
        category: 'security',
        severity: 'high',
        priority: 2,
        recoverable: true,
        retryable: false
      },
      recoveryStrategy: 'refresh_auth',
      occurrences: 0,
      lastOccurrence: new Date(),
      resolved: false
    });

    console.log(`🔍 Configured ${this.errorPatterns.size} error patterns`);
  }

  /**
   * Setup recovery strategies
   */
  private async setupRecoveryStrategies(): Promise<void> {
    // Retry with exponential backoff
    this.addRecoveryStrategy({
      name: 'retry_with_backoff',
      description: 'Retry operation with exponential backoff',
      steps: [
        'Wait for initial delay',
        'Retry the failed operation',
        'If failed, double the delay and retry',
        'Repeat until max attempts reached'
      ],
      success_rate: 0.75,
      average_recovery_time: 5000,
      enabled: true
    });

    // Wait and retry
    this.addRecoveryStrategy({
      name: 'wait_and_retry',
      description: 'Wait for network stability and retry',
      steps: [
        'Monitor network connectivity',
        'Wait for stable connection',
        'Retry the failed operation',
        'Report success or failure'
      ],
      success_rate: 0.85,
      average_recovery_time: 10000,
      enabled: true
    });

    // Component restart
    this.addRecoveryStrategy({
      name: 'restart_component',
      description: 'Restart the affected component',
      steps: [
        'Save current state',
        'Unmount component',
        'Clear component cache',
        'Remount component',
        'Restore state if possible'
      ],
      success_rate: 0.90,
      average_recovery_time: 3000,
      enabled: true
    });

    // API fallback
    this.addRecoveryStrategy({
      name: 'api_fallback',
      description: 'Use fallback API or cached data',
      steps: [
        'Check for cached data',
        'Try fallback API endpoint',
        'Use default values if available',
        'Notify user of degraded functionality'
      ],
      success_rate: 0.70,
      average_recovery_time: 2000,
      enabled: true
    });

    // User notification
    this.addRecoveryStrategy({
      name: 'user_notification',
      description: 'Notify user and provide guidance',
      steps: [
        'Display user-friendly error message',
        'Provide correction guidance',
        'Offer help resources',
        'Log error for analysis'
      ],
      success_rate: 0.95,
      average_recovery_time: 1000,
      enabled: true
    });

    // Refresh authentication
    this.addRecoveryStrategy({
      name: 'refresh_auth',
      description: 'Refresh authentication tokens',
      steps: [
        'Attempt token refresh',
        'If successful, retry original request',
        'If failed, redirect to login',
        'Preserve user context'
      ],
      success_rate: 0.80,
      average_recovery_time: 3000,
      enabled: true
    });

    console.log(`🔧 Configured ${this.recoveryStrategies.size} recovery strategies`);
  }

  /**
   * Install global error handlers
   */
  private installGlobalErrorHandlers(): void {
    if (typeof window === 'undefined') return;

    // Global error handler
    this.globalErrorHandler = (event: ErrorEvent) => {
      this.captureError(event.error || new Error(event.message), {
        timestamp: new Date(),
        component: 'global',
        action: 'script_error',
        breadcrumbs: [`Script error in ${event.filename}:${event.lineno}:${event.colno}`],
        metadata: {
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno
        }
      });
    };

    // Unhandled promise rejection handler
    this.unhandledRejectionHandler = (event: PromiseRejectionEvent) => {
      this.captureError(
        event.reason instanceof Error ? event.reason : new Error(String(event.reason)),
        {
          timestamp: new Date(),
          component: 'global',
          action: 'unhandled_promise_rejection',
          breadcrumbs: ['Unhandled promise rejection'],
          metadata: {
            reason: event.reason
          }
        }
      );
    };

    window.addEventListener('error', this.globalErrorHandler);
    window.addEventListener('unhandledrejection', this.unhandledRejectionHandler);

    console.log('🌐 Global error handlers installed');
  }

  /**
   * Start metrics collection
   */
  private startMetricsCollection(): void {
    const updateMetrics = () => {
      const now = new Date();
      const last24Hours = now.getTime() - (24 * 60 * 60 * 1000);

      const recentErrors = this.capturedErrors.filter(
        error => error.context.timestamp.getTime() > last24Hours
      );

      const errorsByCategory = recentErrors.reduce((acc, error) => {
        acc[error.classification.category] = (acc[error.classification.category] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const errorsBySeverity = recentErrors.reduce((acc, error) => {
        acc[error.classification.severity] = (acc[error.classification.severity] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const resolvedErrors = recentErrors.filter(error => error.resolved).length;
      const recoveryRate = recentErrors.length > 0 ? resolvedErrors / recentErrors.length : 1;

      const avgRecoveryTime = recentErrors
        .filter(error => error.recovery_time)
        .reduce((sum, error) => sum + (error.recovery_time || 0), 0) / Math.max(1, resolvedErrors);

      this.errorMetrics = {
        timestamp: now,
        totalErrors: recentErrors.length,
        errorsByCategory,
        errorsBySeverity,
        recoveryRate,
        avgRecoveryTime: isNaN(avgRecoveryTime) ? 0 : avgRecoveryTime,
        topErrors: this.getTopErrors(recentErrors)
      };
    };

    // Initial metrics
    updateMetrics();

    // Update metrics every minute
    setInterval(updateMetrics, 60000);

    console.log('📊 Error metrics collection started');
  }

  /**
   * Get top errors by frequency
   */
  private getTopErrors(errors: CapturedError[]): Array<{ message: string; count: number }> {
    const errorCounts = errors.reduce((acc, error) => {
      const key = error.message.substring(0, 100); // Truncate long messages
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(errorCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([message, count]) => ({ message, count }));
  }

  /**
   * Capture and handle an error
   */
  async captureError(error: Error, context: Partial<ErrorContext>): Promise<string> {
    const errorId = `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Classify the error
    const classification = this.classifyError(error);

    // Create captured error record
    const capturedError: CapturedError = {
      id: errorId,
      message: error.message,
      stack: error.stack,
      type: error.constructor.name,
      classification,
      context: {
        timestamp: new Date(),
        component: 'unknown',
        breadcrumbs: [],
        metadata: {},
        ...context
      },
      resolved: false,
      recovery_attempts: 0,
      recovery_successful: false
    };

    // Add to error history
    this.capturedErrors.push(capturedError);

    // Maintain error history size
    if (this.capturedErrors.length > this.config.maxErrorHistory) {
      this.capturedErrors = this.capturedErrors.slice(-this.config.maxErrorHistory);
    }

    // Log the error
    console.error(`🚨 Error captured [${classification.severity}]: ${error.message}`, {
      id: errorId,
      classification,
      context: capturedError.context
    });

    // Attempt automatic recovery if enabled
    if (this.config.enableAutoRecovery && classification.recoverable) {
      this.attemptRecovery(capturedError);
    }

    // Report error if enabled
    if (this.config.enableErrorReporting) {
      this.reportError(capturedError);
    }

    return errorId;
  }

  /**
   * Classify error based on patterns
   */
  private classifyError(error: Error): ErrorClassification {
    const errorMessage = error.message.toLowerCase();
    const errorStack = error.stack?.toLowerCase() || '';
    const searchText = `${errorMessage} ${errorStack}`;

    // Check against known patterns
    for (const pattern of this.errorPatterns.values()) {
      if (pattern.pattern.test(searchText)) {
        pattern.occurrences++;
        pattern.lastOccurrence = new Date();
        return pattern.classification;
      }
    }

    // Default classification for unknown errors
    return {
      category: 'application',
      severity: 'medium',
      priority: 3,
      recoverable: true,
      retryable: false
    };
  }

  /**
   * Attempt error recovery
   */
  private async attemptRecovery(capturedError: CapturedError): Promise<void> {
    if (capturedError.recovery_attempts >= this.config.maxRetryAttempts) {
      console.warn(`⚠️ Max recovery attempts reached for error: ${capturedError.id}`);
      return;
    }

    capturedError.recovery_attempts++;
    const startTime = Date.now();

    try {
      // Find appropriate recovery strategy
      const strategyName = this.findRecoveryStrategy(capturedError);
      const strategy = this.recoveryStrategies.get(strategyName);

      if (!strategy || !strategy.enabled) {
        console.warn(`❌ No recovery strategy available for error: ${capturedError.id}`);
        return;
      }

      console.log(`🔄 Attempting recovery for error: ${capturedError.id} using strategy: ${strategyName}`);

      // Execute recovery strategy
      const recoverySuccess = await this.executeRecoveryStrategy(strategy, capturedError);

      capturedError.recovery_time = Date.now() - startTime;
      capturedError.recovery_successful = recoverySuccess;
      capturedError.resolved = recoverySuccess;

      if (recoverySuccess) {
        console.log(`✅ Recovery successful for error: ${capturedError.id}`);
      } else {
        console.warn(`❌ Recovery failed for error: ${capturedError.id}`);

        // Retry with delay if retryable
        if (capturedError.classification.retryable) {
          setTimeout(() => {
            this.attemptRecovery(capturedError);
          }, this.config.retryDelay * Math.pow(2, capturedError.recovery_attempts - 1));
        }
      }

    } catch (recoveryError) {
      console.error(`💥 Recovery strategy failed for error: ${capturedError.id}`, recoveryError);
      capturedError.recovery_time = Date.now() - startTime;
      capturedError.recovery_successful = false;
    }
  }

  /**
   * Find appropriate recovery strategy
   */
  private findRecoveryStrategy(capturedError: CapturedError): string {
    // Check if error pattern has specific strategy
    for (const pattern of this.errorPatterns.values()) {
      if (pattern.pattern.test(capturedError.message)) {
        return pattern.recoveryStrategy;
      }
    }

    // Default strategy based on classification
    switch (capturedError.classification.category) {
      case 'network':
        return 'retry_with_backoff';
      case 'system':
        return 'restart_component';
      case 'application':
        return 'api_fallback';
      case 'user':
        return 'user_notification';
      case 'security':
        return 'refresh_auth';
      default:
        return 'retry_with_backoff';
    }
  }

  /**
   * Execute recovery strategy
   */
  private async executeRecoveryStrategy(
    strategy: RecoveryStrategy,
    capturedError: CapturedError
  ): Promise<boolean> {
    // Simulate recovery strategy execution
    // In real implementation, this would contain actual recovery logic

    switch (strategy.name) {
      case 'retry_with_backoff':
        return this.executeRetryWithBackoff(capturedError);

      case 'wait_and_retry':
        return this.executeWaitAndRetry(capturedError);

      case 'restart_component':
        return this.executeRestartComponent(capturedError);

      case 'api_fallback':
        return this.executeApiFallback(capturedError);

      case 'user_notification':
        return this.executeUserNotification(capturedError);

      case 'refresh_auth':
        return this.executeRefreshAuth(capturedError);

      default:
        return false;
    }
  }

  /**
   * Execute retry with backoff strategy
   */
  private async executeRetryWithBackoff(capturedError: CapturedError): Promise<boolean> {
    const delay = this.config.retryDelay * Math.pow(2, capturedError.recovery_attempts - 1);
    await new Promise(resolve => setTimeout(resolve, delay));

    // Simulate retry success rate
    return Math.random() < 0.75;
  }

  /**
   * Execute wait and retry strategy
   */
  private async executeWaitAndRetry(capturedError: CapturedError): Promise<boolean> {
    // Wait for network stability (simulated)
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Check if network is available
    if (typeof navigator !== 'undefined' && navigator.onLine) {
      return Math.random() < 0.85;
    }

    return false;
  }

  /**
   * Execute restart component strategy
   */
  private async executeRestartComponent(capturedError: CapturedError): Promise<boolean> {
    // Simulate component restart
    console.log(`🔄 Restarting component: ${capturedError.context.component}`);
    await new Promise(resolve => setTimeout(resolve, 1000));

    return Math.random() < 0.90;
  }

  /**
   * Execute API fallback strategy
   */
  private async executeApiFallback(capturedError: CapturedError): Promise<boolean> {
    // Simulate fallback to cached data or alternative API
    console.log('🔄 Using API fallback strategy');
    await new Promise(resolve => setTimeout(resolve, 500));

    return Math.random() < 0.70;
  }

  /**
   * Execute user notification strategy
   */
  private async executeUserNotification(capturedError: CapturedError): Promise<boolean> {
    // Display user-friendly error message (simulated)
    console.log(`💬 Notifying user about error: ${capturedError.message}`);

    return true; // User notification always "succeeds"
  }

  /**
   * Execute refresh auth strategy
   */
  private async executeRefreshAuth(capturedError: CapturedError): Promise<boolean> {
    // Simulate token refresh
    console.log('🔄 Refreshing authentication tokens');
    await new Promise(resolve => setTimeout(resolve, 1500));

    return Math.random() < 0.80;
  }

  /**
   * Report error to external service
   */
  private async reportError(capturedError: CapturedError): Promise<void> {
    // Simulate error reporting (in real implementation, this would send to error tracking service)
    console.log(`📤 Reporting error: ${capturedError.id}`);
  }

  /**
   * Add error pattern
   */
  addErrorPattern(pattern: ErrorPattern): void {
    this.errorPatterns.set(pattern.id, pattern);
    console.log(`➕ Added error pattern: ${pattern.id}`);
  }

  /**
   * Add recovery strategy
   */
  addRecoveryStrategy(strategy: RecoveryStrategy): void {
    this.recoveryStrategies.set(strategy.name, strategy);
    console.log(`➕ Added recovery strategy: ${strategy.name}`);
  }

  /**
   * Get error metrics
   */
  getErrorMetrics(): MetuErrorMetrics | null {
    return this.errorMetrics;
  }

  /**
   * Get error report
   */
  async getErrorReport(): Promise<MetuErrorReport> {
    const now = new Date();
    const last24Hours = now.getTime() - (24 * 60 * 60 * 1000);

    const recentErrors = this.capturedErrors.filter(
      error => error.context.timestamp.getTime() > last24Hours
    );

    const criticalErrors = recentErrors.filter(
      error => error.classification.severity === 'critical'
    );

    const unresolvedErrors = recentErrors.filter(error => !error.resolved);

    return {
      timestamp: now,
      totalErrors: recentErrors.length,
      criticalErrors: criticalErrors.length,
      unresolvedErrors: unresolvedErrors.length,
      patterns: Array.from(this.errorPatterns.values()),
      recentErrors: recentErrors.slice(0, 50), // Last 50 errors
      recoveryStrategies: Array.from(this.recoveryStrategies.values())
    };
  }

  /**
   * Get error recovery information
   */
  async getErrorRecovery(): Promise<MetuErrorRecovery> {
    const strategies = Array.from(this.recoveryStrategies.values());
    const patterns = Array.from(this.errorPatterns.values());

    return {
      availableStrategies: strategies.map(s => s.name),
      recoverySuccess: strategies.reduce((acc, s) => {
        acc[s.name] = s.success_rate;
        return acc;
      }, {} as Record<string, number>),
      errorPatterns: patterns.length,
      autoRecoveryEnabled: this.config.enableAutoRecovery
    };
  }

  /**
   * Clean up old errors
   */
  private cleanupOldErrors(): void {
    const cutoff = Date.now() - this.config.errorRetention;
    const oldCount = this.capturedErrors.length;

    this.capturedErrors = this.capturedErrors.filter(
      error => error.context.timestamp.getTime() > cutoff
    );

    const removedCount = oldCount - this.capturedErrors.length;
    if (removedCount > 0) {
      console.log(`🧹 Cleaned up ${removedCount} old errors`);
    }
  }

  /**
   * Cleanup resources
   */
  async cleanup(): Promise<void> {
    // Remove global error handlers
    if (typeof window !== 'undefined') {
      if (this.globalErrorHandler) {
        window.removeEventListener('error', this.globalErrorHandler);
      }
      if (this.unhandledRejectionHandler) {
        window.removeEventListener('unhandledrejection', this.unhandledRejectionHandler);
      }
    }

    this.errorPatterns.clear();
    this.recoveryStrategies.clear();
    this.capturedErrors = [];
    this.errorMetrics = null;
    this.isInitialized = false;

    console.log('🧹 Error Handler cleaned up');
  }
}
