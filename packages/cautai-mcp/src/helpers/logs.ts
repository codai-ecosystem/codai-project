/**
 * Structured Logging System for CAUTAI MCP HTTP Server
 * Following Microsoft MCP best practices with timestamps and color-coded output
 */

import debug from 'debug';
import chalk from 'chalk';

/**
 * Log levels with corresponding colors
 */
const LOG_LEVELS = {
  info: chalk.cyan,
  success: chalk.green,
  warn: chalk.yellow,
  error: chalk.red,
  debug: chalk.magenta
} as const;

/**
 * Logger interface for consistent logging across the application
 */
export interface Logger {
  info(...args: any[]): void;
  success(...args: any[]): void;
  warn(...args: any[]): void;
  error(...args: any[]): void;
  debug(...args: any[]): void;
}

/**
 * Creates a namespaced logger with structured output
 * @param namespace - Logger namespace (e.g., 'mcp:server', 'mcp:transport')
 * @returns Logger instance with color-coded methods
 */
export const logger = (namespace: string): Logger => {
  const dbg = debug('cautai:' + namespace);
  
  /**
   * Internal log formatter with timestamp and color coding
   * @param colorize - Chalk color function
   * @param args - Arguments to log
   */
  const log = (colorize: typeof chalk.cyan, ...args: any[]): void => {
    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${namespace}]`;
    
    const formattedArgs = args.map((arg) => {
      if (typeof arg === 'object' && arg !== null) {
        return JSON.stringify(arg, null, 2);
      }
      return arg;
    });

    dbg(colorize(`${prefix} ${formattedArgs.join(' ')}`));
  };

  return {
    info(...args: any[]): void {
      log(LOG_LEVELS.info, ...args);
    },
    
    success(...args: any[]): void {
      log(LOG_LEVELS.success, ...args);
    },
    
    warn(...args: any[]): void {
      log(LOG_LEVELS.warn, ...args);
    },
    
    error(...args: any[]): void {
      log(LOG_LEVELS.error, ...args);
    },
    
    debug(...args: any[]): void {
      log(LOG_LEVELS.debug, ...args);
    }
  };
};

/**
 * Pre-configured loggers for common components
 */
export const serverLog = logger('server');
export const transportLog = logger('transport');
export const toolLog = logger('tools');
export const dbLog = logger('database');

/**
 * Utility function to create request-specific logger
 * @param baseLogger - Base logger instance
 * @param requestId - Unique request identifier
 * @returns Logger with request ID context
 */
export function createRequestLogger(baseLogger: Logger, requestId: string): Logger {
  const prefix = `[${requestId}]`;
  
  return {
    info: (...args) => baseLogger.info(prefix, ...args),
    success: (...args) => baseLogger.success(prefix, ...args),
    warn: (...args) => baseLogger.warn(prefix, ...args),
    error: (...args) => baseLogger.error(prefix, ...args),
    debug: (...args) => baseLogger.debug(prefix, ...args)
  };
}

/**
 * Log performance metrics for monitoring
 * @param operation - Operation name
 * @param startTime - Operation start time
 * @param logger - Logger instance to use
 */
export function logPerformance(operation: string, startTime: number, logger: Logger): void {
  const duration = Date.now() - startTime;
  logger.info(`${operation} completed in ${duration}ms`);
}

/**
 * Log HTTP request details
 * @param method - HTTP method
 * @param url - Request URL
 * @param ip - Client IP address
 * @param logger - Logger instance to use
 */
export function logHttpRequest(method: string, url: string, ip: string, logger: Logger): void {
  logger.info(`${method} ${url} (${ip})`);
}