import winston from 'winston';
// Note: Installing winston-daily-rotate-file and winston-elasticsearch
import DailyRotateFile from 'winston-daily-rotate-file';
import { v4 as uuidv4 } from 'uuid';
import { LogEntry, LogContext, LogLevel, LoggingConfig } from './types.js';
import { createLoggingConfig } from './config.js';
import * as os from 'os';

/**
 * Winston Logger Configuration and Management
 * Provides structured logging with correlation IDs and contextual information
 */

export class WinstonLogger {
  private logger: winston.Logger;
  private config: LoggingConfig;
  private context: LogContext;

  constructor(config?: LoggingConfig) {
    this.config = config || createLoggingConfig();
    this.context = this.createBaseContext();
    this.logger = this.createWinstonLogger();
  }

  /**
   * Create base context information
   */
  private createBaseContext(): LogContext {
    return {
      environment: (process.env.NODE_ENV || 'development') as LogContext['environment'],
      version: process.env.npm_package_version || '1.0.0',
      hostname: os.hostname(),
      pid: process.pid,
      memory: {
        heapUsed: 0,
        heapTotal: 0,
        external: 0,
        rss: 0,
      },
      uptime: 0,
    };
  }

  /**
   * Update memory and uptime context
   */
  private updateContext(): LogContext {
    const memUsage = process.memoryUsage();
    return {
      ...this.context,
      memory: {
        heapUsed: memUsage.heapUsed,
        heapTotal: memUsage.heapTotal,
        external: memUsage.external,
        rss: memUsage.rss,
      },
      uptime: process.uptime(),
    };
  }

  /**
   * Create Winston logger instance with configured transports
   */
  private createWinstonLogger(): winston.Logger {
    const transports: winston.transport[] = [];

    // Console transport
    const consoleTransport = this.config.winston.transports.find(t => t.type === 'console');
    if (consoleTransport) {
      transports.push(
        new winston.transports.Console({
          level: consoleTransport.level || this.config.winston.level,
          format: this.createLogFormat(consoleTransport.options.format === 'simple'),
          ...consoleTransport.options,
        })
      );
    }

    // Daily rotate file transports
    const fileTransports = this.config.winston.transports.filter(t => t.type === 'daily-rotate');
    fileTransports.forEach(transport => {
      transports.push(
        new DailyRotateFile({
          level: transport.level || this.config.winston.level,
          format: this.createLogFormat(false), // Always use JSON for files
          ...transport.options,
        })
      );
    });

    // Elasticsearch transport (will implement custom transport)
    const esTransport = this.config.winston.transports.find(t => t.type === 'elasticsearch');
    if (esTransport && process.env.ELASTICSEARCH_ENABLED === 'true') {
      // Custom Elasticsearch transport will be implemented separately
      console.log('Elasticsearch transport configured but not yet implemented');
    }

    return winston.createLogger({
      level: this.config.winston.level,
      transports,
      exitOnError: false,
      handleExceptions: true,
      handleRejections: true,
    });
  }

  /**
   * Create Winston log format based on configuration
   */
  private createLogFormat(useSimple = false): winston.Logform.Format {
    const formats = [winston.format.timestamp()];

    if (useSimple) {
      // Simple format for development console
      formats.push(
        winston.format.colorize(),
        winston.format.printf(({ timestamp, level, message, service, correlationId, ...meta }) => {
          const correlation = correlationId ? ` [${correlationId}]` : '';
          const serviceInfo = service ? ` ${service}` : '';
          return `${timestamp} ${level}${serviceInfo}${correlation}: ${message}${Object.keys(meta).length ? ' ' + JSON.stringify(meta) : ''
            }`;
        })
      );
    } else {
      // JSON format for production and files
      formats.push(
        winston.format.errors({ stack: true }),
        winston.format.json()
      );
    }

    return winston.format.combine(...formats);
  }

  /**
   * Create structured log entry
   */
  private createLogEntry(
    level: LogLevel,
    message: string,
    service: string,
    metadata: Record<string, any> = {},
    correlationId?: string,
    traceId?: string,
    userId?: string
  ): LogEntry {
    return {
      id: uuidv4(),
      timestamp: new Date(),
      level,
      message,
      service,
      correlationId,
      traceId,
      spanId: metadata.spanId,
      userId,
      sessionId: metadata.sessionId,
      requestId: metadata.requestId,
      metadata,
      context: this.updateContext(),
    };
  }

  /**
   * Log error level message
   */
  error(
    message: string,
    service: string,
    metadata: Record<string, any> = {},
    correlationId?: string,
    traceId?: string,
    userId?: string
  ): LogEntry {
    const entry = this.createLogEntry('error', message, service, metadata, correlationId, traceId, userId);
    this.logger.error(entry);
    return entry;
  }

  /**
   * Log warning level message
   */
  warn(
    message: string,
    service: string,
    metadata: Record<string, any> = {},
    correlationId?: string,
    traceId?: string,
    userId?: string
  ): LogEntry {
    const entry = this.createLogEntry('warn', message, service, metadata, correlationId, traceId, userId);
    this.logger.warn(entry);
    return entry;
  }

  /**
   * Log info level message
   */
  info(
    message: string,
    service: string,
    metadata: Record<string, any> = {},
    correlationId?: string,
    traceId?: string,
    userId?: string
  ): LogEntry {
    const entry = this.createLogEntry('info', message, service, metadata, correlationId, traceId, userId);
    this.logger.info(entry);
    return entry;
  }

  /**
   * Log debug level message
   */
  debug(
    message: string,
    service: string,
    metadata: Record<string, any> = {},
    correlationId?: string,
    traceId?: string,
    userId?: string
  ): LogEntry {
    const entry = this.createLogEntry('debug', message, service, metadata, correlationId, traceId, userId);
    this.logger.debug(entry);
    return entry;
  }

  /**
   * Log trace level message
   */
  trace(
    message: string,
    service: string,
    metadata: Record<string, any> = {},
    correlationId?: string,
    traceId?: string,
    userId?: string
  ): LogEntry {
    const entry = this.createLogEntry('trace', message, service, metadata, correlationId, traceId, userId);
    this.logger.log('trace', entry);
    return entry;
  }

  /**
   * Log HTTP request
   */
  logRequest(
    method: string,
    url: string,
    statusCode: number,
    responseTime: number,
    service: string,
    correlationId?: string,
    userId?: string
  ): LogEntry {
    const level: LogLevel = statusCode >= 500 ? 'error' : statusCode >= 400 ? 'warn' : 'info';
    const message = `${method} ${url} ${statusCode} - ${responseTime}ms`;

    const metadata = {
      http: {
        method,
        url,
        statusCode,
        responseTime,
      },
    };

    return this[level](message, service, metadata, correlationId, undefined, userId);
  }

  /**
   * Log database query
   */
  logQuery(
    query: string,
    duration: number,
    service: string,
    correlationId?: string,
    error?: Error
  ): LogEntry {
    const level: LogLevel = error ? 'error' : duration > 1000 ? 'warn' : 'debug';
    const message = error ? `Database query failed: ${error.message}` : `Database query executed in ${duration}ms`;

    const metadata = {
      database: {
        query: query.substring(0, 500), // Truncate long queries
        duration,
        error: error?.message,
        stack: error?.stack,
      },
    };

    return this[level](message, service, metadata, correlationId);
  }

  /**
   * Log authentication event
   */
  logAuth(
    action: string,
    userId: string,
    success: boolean,
    service: string,
    correlationId?: string,
    metadata: Record<string, any> = {}
  ): LogEntry {
    const level: LogLevel = success ? 'info' : 'warn';
    const message = `Authentication ${action} ${success ? 'succeeded' : 'failed'} for user ${userId}`;

    const authMetadata = {
      auth: {
        action,
        userId,
        success,
        ...metadata,
      },
    };

    return this[level](message, service, authMetadata, correlationId, undefined, userId);
  }

  /**
   * Log business event
   */
  logBusinessEvent(
    event: string,
    entity: string,
    entityId: string,
    service: string,
    correlationId?: string,
    userId?: string,
    metadata: Record<string, any> = {}
  ): LogEntry {
    const message = `Business event: ${event} on ${entity} ${entityId}`;

    const businessMetadata = {
      business: {
        event,
        entity,
        entityId,
        ...metadata,
      },
    };

    return this.info(message, service, businessMetadata, correlationId, undefined, userId);
  }

  /**
   * Log performance metric
   */
  logPerformance(
    operation: string,
    duration: number,
    service: string,
    correlationId?: string,
    metadata: Record<string, any> = {}
  ): LogEntry {
    const level: LogLevel = duration > 5000 ? 'warn' : duration > 1000 ? 'info' : 'debug';
    const message = `Performance: ${operation} completed in ${duration}ms`;

    const perfMetadata = {
      performance: {
        operation,
        duration,
        ...metadata,
      },
    };

    return this[level](message, service, perfMetadata, correlationId);
  }

  /**
   * Create child logger with pre-set context
   */
  createChildLogger(service: string, correlationId?: string, userId?: string): ChildLogger {
    return new ChildLogger(this, service, correlationId, userId);
  }

  /**
   * Get underlying Winston logger instance
   */
  getWinstonInstance(): winston.Logger {
    return this.logger;
  }

  /**
   * Close logger and cleanup resources
   */
  async close(): Promise<void> {
    return new Promise<void>((resolve) => {
      this.logger.close();
      resolve();
    });
  }
}

/**
 * Child logger with pre-set context
 */
export class ChildLogger {
  constructor(
    private parentLogger: WinstonLogger,
    private service: string,
    private correlationId?: string,
    private userId?: string
  ) { }

  error(message: string, metadata: Record<string, any> = {}, traceId?: string): LogEntry {
    return this.parentLogger.error(message, this.service, metadata, this.correlationId, traceId, this.userId);
  }

  warn(message: string, metadata: Record<string, any> = {}, traceId?: string): LogEntry {
    return this.parentLogger.warn(message, this.service, metadata, this.correlationId, traceId, this.userId);
  }

  info(message: string, metadata: Record<string, any> = {}, traceId?: string): LogEntry {
    return this.parentLogger.info(message, this.service, metadata, this.correlationId, traceId, this.userId);
  }

  debug(message: string, metadata: Record<string, any> = {}, traceId?: string): LogEntry {
    return this.parentLogger.debug(message, this.service, metadata, this.correlationId, traceId, this.userId);
  }

  trace(message: string, metadata: Record<string, any> = {}, traceId?: string): LogEntry {
    return this.parentLogger.trace(message, this.service, metadata, this.correlationId, traceId, this.userId);
  }

  logRequest(method: string, url: string, statusCode: number, responseTime: number): LogEntry {
    return this.parentLogger.logRequest(method, url, statusCode, responseTime, this.service, this.correlationId, this.userId);
  }

  logQuery(query: string, duration: number, error?: Error): LogEntry {
    return this.parentLogger.logQuery(query, duration, this.service, this.correlationId, error);
  }

  logAuth(action: string, success: boolean, metadata: Record<string, any> = {}): LogEntry {
    const userId = this.userId || 'unknown';
    return this.parentLogger.logAuth(action, userId, success, this.service, this.correlationId, metadata);
  }

  logBusinessEvent(event: string, entity: string, entityId: string, metadata: Record<string, any> = {}): LogEntry {
    return this.parentLogger.logBusinessEvent(event, entity, entityId, this.service, this.correlationId, this.userId, metadata);
  }

  logPerformance(operation: string, duration: number, metadata: Record<string, any> = {}): LogEntry {
    return this.parentLogger.logPerformance(operation, duration, this.service, this.correlationId, metadata);
  }
}

/**
 * Create global logger instance
 */
export const createLogger = (config?: LoggingConfig): WinstonLogger => {
  return new WinstonLogger(config);
};

/**
 * Default logger instance
 */
export const logger = createLogger();