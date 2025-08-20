/**
 * Logging utilities using Winston
 */

import winston from 'winston';
import { config } from '../config/index.js';

/**
 * Custom log format
 */
const logFormat = winston.format.combine(
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss.SSS',
  }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
    return `${timestamp} [${level.toUpperCase()}] ${message}${metaStr}`;
  })
);

/**
 * Configure Winston logger
 */
export const logger = winston.createLogger({
  level: config.logging.level,
  format: logFormat,
  defaultMeta: {
    service: config.server.name,
    version: config.server.version,
    environment: config.environment,
  },
  transports: [
    // Console transport for all environments
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        logFormat
      ),
    }),
  ],
});

/**
 * Add file transport for production
 */
if (config.environment === 'production') {
  logger.add(
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    })
  );

  logger.add(
    new winston.transports.File({
      filename: 'logs/combined.log',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    })
  );
}

/**
 * Logger utility functions
 */
export const loggerUtils = {
  /**
   * Log request information
   */
  logRequest: (method: string, url: string, statusCode: number, duration: number) => {
    logger.info('HTTP Request', {
      method,
      url,
      statusCode,
      duration: `${duration}ms`,
    });
  },

  /**
   * Log tool execution
   */
  logToolExecution: (toolName: string, args: unknown, duration: number, success: boolean) => {
    const level = success ? 'info' : 'error';
    logger[level]('Tool Execution', {
      tool: toolName,
      args,
      duration: `${duration}ms`,
      success,
    });
  },

  /**
   * Log performance metrics
   */
  logPerformance: (operation: string, duration: number, metadata?: Record<string, any>) => {
    logger.debug('Performance', {
      operation,
      duration: `${duration}ms`,
      ...metadata,
    });
  },
};
