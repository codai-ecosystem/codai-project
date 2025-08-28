/**
 * @fileoverview Core logger implementation using Winston
 * @author Cautai Team
 * @version 1.0.0
 */

import * as winston from 'winston';
import * as DailyRotateFile from 'winston-daily-rotate-file';
import {
  LogLevel,
  ComponentType,
  LoggerConfig,
  LoggerConfigSchema,
  ICautaiLogger,
  LogEntry,
  CautaiError,
  ErrorCategory
} from './types';

export class CautaiLogger implements ICautaiLogger {
  private logger: winston.Logger;
  private config: LoggerConfig;
  private context: Partial<LogEntry['context']> = {};
  private requestId?: string;
  private userId?: string;
  private sessionId?: string;
  private childMetadata: Record<string, unknown> = {};

  constructor(config: Partial<LoggerConfig> & { component: ComponentType }) {
    this.config = LoggerConfigSchema.parse(config);
    this.logger = this.createWinstonLogger();
  }

  private createWinstonLogger(): winston.Logger {
    const formats: winston.Logform.Format[] = [
      winston.format.timestamp({
        format: this.config.enableTimestamp ? 'YYYY-MM-DD HH:mm:ss.SSS' : undefined
      })
    ];

    if (this.config.format === 'json') {
      formats.push(
        winston.format.printf(info => {
          return JSON.stringify({
            timestamp: info.timestamp,
            level: info.level,
            component: this.config.component,
            message: info.message,
            requestId: this.requestId,
            userId: this.userId,
            sessionId: this.sessionId,
            context: this.context,
            metadata: { 
              ...this.childMetadata, 
              ...(info.metadata && typeof info.metadata === 'object' ? info.metadata as Record<string, unknown> : {})
            },
            error: info.error,
            performance: info.performance,
            ...info
          } as LogEntry);
        })
      );
    } else {
      formats.push(
        winston.format.printf(info => {
          const { timestamp, level, message, metadata, error } = info;
          let log = `${timestamp} [${level.toUpperCase()}] [${this.config.component}] ${message}`;
          
          if (this.requestId) log += ` [req:${this.requestId}]`;
          if (this.userId) log += ` [user:${this.userId}]`;
          if (metadata && Object.keys(metadata).length > 0) {
            log += ` ${JSON.stringify(metadata)}`;
          }
          if (error && typeof error === 'object' && 'message' in error) {
            log += `\\nError: ${(error as Error).message}`;
            if (this.config.enableStackTrace && 'stack' in error && (error as Error).stack) {
              log += `\\n${(error as Error).stack}`;
            }
          }
          
          return log;
        })
      );
    }

    const transports: winston.transport[] = [];

    // Console transport
    if (this.config.enableConsole) {
      transports.push(new winston.transports.Console({
        level: this.config.level,
        format: winston.format.combine(
          ...(this.config.enableColors ? [winston.format.colorize()] : []),
          ...formats
        )
      }));
    }

    // File transport
    if (this.config.enableFile) {
      const fileFormat = winston.format.combine(...formats);

      if (this.config.enableRotation) {
        // Daily rotating files
        transports.push(new DailyRotateFile({
          filename: `${this.config.logDirectory}/${this.config.component}-%DATE%.log`,
          datePattern: 'YYYY-MM-DD',
          maxSize: this.config.maxFileSize,
          maxFiles: this.config.maxFiles,
          level: this.config.level,
          format: fileFormat,
          auditFile: `${this.config.logDirectory}/.audit/${this.config.component}-audit.json`
        }));

        // Separate error log
        transports.push(new DailyRotateFile({
          filename: `${this.config.logDirectory}/${this.config.component}-error-%DATE%.log`,
          datePattern: 'YYYY-MM-DD',
          maxSize: this.config.maxFileSize,
          maxFiles: this.config.maxFiles,
          level: 'error',
          format: fileFormat,
          auditFile: `${this.config.logDirectory}/.audit/${this.config.component}-error-audit.json`
        }));
      } else {
        // Simple file logging
        transports.push(new winston.transports.File({
          filename: `${this.config.logDirectory}/${this.config.component}.log`,
          level: this.config.level,
          format: fileFormat
        }));

        transports.push(new winston.transports.File({
          filename: `${this.config.logDirectory}/${this.config.component}-error.log`,
          level: 'error',
          format: fileFormat
        }));
      }
    }

    return winston.createLogger({
      level: this.config.level,
      transports,
      exitOnError: false,
      // Handle uncaught exceptions and unhandled rejections
      exceptionHandlers: this.config.enableFile ? [
        new DailyRotateFile({
          filename: `${this.config.logDirectory}/exceptions-%DATE%.log`,
          datePattern: 'YYYY-MM-DD',
          maxSize: this.config.maxFileSize,
          maxFiles: this.config.maxFiles
        })
      ] : [],
      rejectionHandlers: this.config.enableFile ? [
        new DailyRotateFile({
          filename: `${this.config.logDirectory}/rejections-%DATE%.log`,
          datePattern: 'YYYY-MM-DD',
          maxSize: this.config.maxFileSize,
          maxFiles: this.config.maxFiles
        })
      ] : []
    });
  }

  // Sanitize sensitive data
  private sanitizeMetadata(metadata?: Record<string, unknown>): Record<string, unknown> {
    if (!metadata) return {};

    const sanitized = { ...metadata };
    
    for (const field of this.config.sensitiveFields) {
      if (field in sanitized) {
        sanitized[field] = '[REDACTED]';
      }
    }

    return sanitized;
  }

  // Log methods
  error(message: string, error?: Error | CautaiError, metadata?: Record<string, unknown>): void {
    const sanitizedMetadata = this.sanitizeMetadata(metadata);
    
    let errorInfo: LogEntry['error'] | undefined;
    if (error) {
      errorInfo = {
        name: error.name,
        message: error.message,
        stack: this.config.enableStackTrace ? error.stack : undefined,
        category: (error as CautaiError).category || ErrorCategory.UNKNOWN,
        code: (error as CautaiError).code,
        statusCode: (error as CautaiError).statusCode,
        details: (error as CautaiError).details
      };
    }

    this.logger.error(message, { 
      metadata: sanitizedMetadata,
      error: errorInfo
    });
  }

  warn(message: string, metadata?: Record<string, unknown>): void {
    this.logger.warn(message, { metadata: this.sanitizeMetadata(metadata) });
  }

  info(message: string, metadata?: Record<string, unknown>): void {
    this.logger.info(message, { metadata: this.sanitizeMetadata(metadata) });
  }

  http(message: string, metadata?: Record<string, unknown>): void {
    this.logger.http(message, { metadata: this.sanitizeMetadata(metadata) });
  }

  verbose(message: string, metadata?: Record<string, unknown>): void {
    this.logger.verbose(message, { metadata: this.sanitizeMetadata(metadata) });
  }

  debug(message: string, metadata?: Record<string, unknown>): void {
    this.logger.debug(message, { metadata: this.sanitizeMetadata(metadata) });
  }

  silly(message: string, metadata?: Record<string, unknown>): void {
    this.logger.silly(message, { metadata: this.sanitizeMetadata(metadata) });
  }

  // Convenience methods
  logRequest(req: any, metadata?: Record<string, unknown>): void {
    const requestMetadata = {
      method: req.method,
      url: req.url,
      userAgent: req.headers?.['user-agent'],
      ip: req.ip || req.connection?.remoteAddress,
      ...this.sanitizeMetadata(metadata)
    };

    this.http(`Incoming request: ${req.method} ${req.url}`, requestMetadata);
  }

  logResponse(res: any, duration: number, metadata?: Record<string, unknown>): void {
    const responseMetadata = {
      statusCode: res.statusCode,
      contentLength: res.get?.('content-length'),
      performance: { duration },
      ...this.sanitizeMetadata(metadata)
    };

    const level = res.statusCode >= 400 ? 'error' : res.statusCode >= 300 ? 'warn' : 'http';
    this.logger.log(level, `Response: ${res.statusCode} (${duration}ms)`, {
      metadata: responseMetadata
    });
  }

  logPerformance(operation: string, duration: number, metadata?: Record<string, unknown>): void {
    const performanceMetadata = {
      performance: { 
        duration,
        memoryUsage: process.memoryUsage().heapUsed,
        cpuUsage: process.cpuUsage().user
      },
      ...this.sanitizeMetadata(metadata)
    };

    const level = duration > 5000 ? 'warn' : duration > 1000 ? 'info' : 'debug';
    this.logger.log(level, `Performance: ${operation} completed in ${duration}ms`, {
      metadata: performanceMetadata
    });
  }

  // Context methods
  setContext(context: Partial<LogEntry['context']>): void {
    this.context = { ...this.context, ...context };
  }

  setRequestId(requestId: string): void {
    this.requestId = requestId;
  }

  setUserId(userId: string): void {
    this.userId = userId;
  }

  setSessionId(sessionId: string): void {
    this.sessionId = sessionId;
  }

  // Child logger
  child(metadata: Record<string, unknown>): ICautaiLogger {
    const child = new CautaiLogger({ 
      ...this.config, 
      component: this.config.component 
    });
    child.context = { ...this.context };
    child.requestId = this.requestId;
    child.userId = this.userId;
    child.sessionId = this.sessionId;
    child.childMetadata = { ...this.childMetadata, ...metadata };
    return child;
  }

  // Utility methods
  getLevel(): LogLevel {
    return this.config.level;
  }

  setLevel(level: LogLevel): void {
    this.config.level = level;
    this.logger.level = level;
  }

  flush(): Promise<void> {
    return new Promise((resolve) => {
      this.logger.on('finish', resolve);
      this.logger.end();
    });
  }

  // Static factory methods
  static create(component: ComponentType, config?: Partial<LoggerConfig>): CautaiLogger {
    return new CautaiLogger({ component, ...config });
  }

  static createChild(parent: CautaiLogger, metadata: Record<string, unknown>): ICautaiLogger {
    return parent.child(metadata);
  }
}