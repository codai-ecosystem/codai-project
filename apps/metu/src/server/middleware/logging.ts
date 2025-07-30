// 📝 Logging Middleware for METU

import { Request, Response, NextFunction } from 'express';
import fs from 'fs';
import path from 'path';

export interface LogEntry {
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  method: string;
  url: string;
  statusCode?: number;
  responseTime?: number;
  userAgent?: string;
  ip: string;
  requestId?: string;
  userId?: string;
  message?: string;
  error?: string;
  stack?: string;
}

class Logger {
  private logDir: string;
  private logStream: fs.WriteStream | null = null;
  private maxLogSize = 10 * 1024 * 1024; // 10MB
  private maxLogFiles = 5;

  constructor() {
    this.logDir = path.join(process.cwd(), 'logs');
    this.ensureLogDirectory();
    this.initializeLogStream();
  }

  private ensureLogDirectory() {
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }

  private initializeLogStream() {
    const logFile = path.join(this.logDir, 'metu.log');

    // Check if we need to rotate the log
    if (fs.existsSync(logFile)) {
      const stats = fs.statSync(logFile);
      if (stats.size > this.maxLogSize) {
        this.rotateLog();
      }
    }

    this.logStream = fs.createWriteStream(logFile, { flags: 'a' });

    // Handle stream errors
    this.logStream.on('error', (error) => {
      console.error('Log stream error:', error);
    });
  }

  private rotateLog() {
    const baseLogFile = path.join(this.logDir, 'metu.log');

    // Rotate existing logs
    for (let i = this.maxLogFiles - 1; i >= 1; i--) {
      const oldFile = `${baseLogFile}.${i}`;
      const newFile = `${baseLogFile}.${i + 1}`;

      if (fs.existsSync(oldFile)) {
        if (i === this.maxLogFiles - 1) {
          fs.unlinkSync(oldFile); // Delete oldest log
        } else {
          fs.renameSync(oldFile, newFile);
        }
      }
    }

    // Move current log to .1
    if (fs.existsSync(baseLogFile)) {
      fs.renameSync(baseLogFile, `${baseLogFile}.1`);
    }
  }

  private writeLog(entry: LogEntry) {
    const logLine = JSON.stringify(entry) + '\n';

    // Write to file
    if (this.logStream) {
      this.logStream.write(logLine);
    }

    // Also write to console in development
    if (process.env.NODE_ENV === 'development') {
      const colorMap = {
        info: '\x1b[36m',    // Cyan
        warn: '\x1b[33m',    // Yellow
        error: '\x1b[31m',   // Red
        debug: '\x1b[35m'    // Magenta
      };

      const reset = '\x1b[0m';
      const color = colorMap[entry.level] || '';

      console.log(`${color}[${entry.timestamp}] ${entry.level.toUpperCase()}: ${entry.method} ${entry.url} - ${entry.statusCode || 'N/A'} (${entry.responseTime || 0}ms)${reset}`);

      if (entry.error) {
        console.error(`${color}Error: ${entry.error}${reset}`);
      }

      if (entry.stack && entry.level === 'error') {
        console.error(`${color}Stack: ${entry.stack}${reset}`);
      }
    }
  }

  info(message: string, metadata?: Record<string, any>) {
    this.writeLog({
      timestamp: new Date().toISOString(),
      level: 'info',
      method: 'SYSTEM',
      url: 'N/A',
      ip: '127.0.0.1',
      message,
      ...metadata
    });
  }

  warn(message: string, metadata?: Record<string, any>) {
    this.writeLog({
      timestamp: new Date().toISOString(),
      level: 'warn',
      method: 'SYSTEM',
      url: 'N/A',
      ip: '127.0.0.1',
      message,
      ...metadata
    });
  }

  error(message: string, error?: Error, metadata?: Record<string, any>) {
    this.writeLog({
      timestamp: new Date().toISOString(),
      level: 'error',
      method: 'SYSTEM',
      url: 'N/A',
      ip: '127.0.0.1',
      message,
      error: error?.message,
      stack: error?.stack,
      ...metadata
    });
  }

  debug(message: string, metadata?: Record<string, any>) {
    if (process.env.NODE_ENV === 'development' || process.env.LOG_LEVEL === 'debug') {
      this.writeLog({
        timestamp: new Date().toISOString(),
        level: 'debug',
        method: 'SYSTEM',
        url: 'N/A',
        ip: '127.0.0.1',
        message,
        ...metadata
      });
    }
  }

  logRequest(req: Request, res: Response, responseTime: number, error?: Error) {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: error ? 'error' : (res.statusCode >= 400 ? 'warn' : 'info'),
      method: req.method,
      url: req.originalUrl || req.url,
      statusCode: res.statusCode,
      responseTime,
      userAgent: req.headers['user-agent'],
      ip: req.ip || req.socket.remoteAddress || 'unknown',
      requestId: req.headers['x-request-id'] as string,
      userId: (req as any).user?.id
    };

    if (error) {
      entry.error = error.message;
      entry.stack = error.stack;
    }

    this.writeLog(entry);
  }

  // Get recent logs for monitoring dashboard
  getRecentLogs(lines: number = 100): LogEntry[] {
    const logFile = path.join(this.logDir, 'metu.log');

    if (!fs.existsSync(logFile)) {
      return [];
    }

    try {
      const content = fs.readFileSync(logFile, 'utf-8');
      const logLines = content.trim().split('\n').slice(-lines);

      return logLines
        .filter(line => line.trim())
        .map(line => {
          try {
            return JSON.parse(line);
          } catch {
            // If JSON parse fails, create a basic log entry
            return {
              timestamp: new Date().toISOString(),
              level: 'info' as const,
              method: 'UNKNOWN',
              url: 'N/A',
              ip: 'unknown',
              message: line
            };
          }
        });
    } catch (error) {
      console.error('Error reading log file:', error);
      return [];
    }
  }

  // Search logs by criteria
  searchLogs(criteria: {
    level?: string;
    method?: string;
    statusCode?: number;
    userId?: string;
    timeRange?: { start: Date; end: Date };
    message?: string;
  }): LogEntry[] {
    const logs = this.getRecentLogs(1000); // Get more logs for searching

    return logs.filter(log => {
      if (criteria.level && log.level !== criteria.level) return false;
      if (criteria.method && log.method !== criteria.method) return false;
      if (criteria.statusCode && log.statusCode !== criteria.statusCode) return false;
      if (criteria.userId && log.userId !== criteria.userId) return false;
      if (criteria.message && !log.message?.includes(criteria.message)) return false;

      if (criteria.timeRange) {
        const logTime = new Date(log.timestamp);
        if (logTime < criteria.timeRange.start || logTime > criteria.timeRange.end) {
          return false;
        }
      }

      return true;
    });
  }

  // Get log statistics
  getLogStats(): {
    totalRequests: number;
    errorRate: number;
    avgResponseTime: number;
    statusCodeDistribution: Record<string, number>;
    topEndpoints: Array<{ url: string; count: number; avgResponseTime: number }>;
  } {
    const logs = this.getRecentLogs(1000);
    const requestLogs = logs.filter(log => log.statusCode);

    const totalRequests = requestLogs.length;
    const errors = requestLogs.filter(log => log.statusCode! >= 400).length;
    const errorRate = totalRequests > 0 ? (errors / totalRequests) * 100 : 0;

    const responseTimes = requestLogs
      .filter(log => log.responseTime)
      .map(log => log.responseTime!);
    const avgResponseTime = responseTimes.length > 0
      ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length
      : 0;

    // Status code distribution
    const statusCodeDistribution: Record<string, number> = {};
    requestLogs.forEach(log => {
      const statusGroup = `${Math.floor(log.statusCode! / 100)}xx`;
      statusCodeDistribution[statusGroup] = (statusCodeDistribution[statusGroup] || 0) + 1;
    });

    // Top endpoints
    const endpointStats: Record<string, { count: number; totalResponseTime: number }> = {};
    requestLogs.forEach(log => {
      const endpoint = log.url;
      if (!endpointStats[endpoint]) {
        endpointStats[endpoint] = { count: 0, totalResponseTime: 0 };
      }
      endpointStats[endpoint].count++;
      if (log.responseTime) {
        endpointStats[endpoint].totalResponseTime += log.responseTime;
      }
    });

    const topEndpoints = Object.entries(endpointStats)
      .map(([url, stats]) => ({
        url,
        count: stats.count,
        avgResponseTime: stats.count > 0 ? stats.totalResponseTime / stats.count : 0
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return {
      totalRequests,
      errorRate,
      avgResponseTime,
      statusCodeDistribution,
      topEndpoints
    };
  }

  close() {
    if (this.logStream) {
      this.logStream.end();
      this.logStream = null;
    }
  }
}

// Create singleton logger instance
const logger = new Logger();

// Express middleware for request logging
export function loggingMiddleware(req: Request, res: Response, next: NextFunction) {
  const start = Date.now();

  // Log request start
  logger.debug(`Incoming request: ${req.method} ${req.originalUrl || req.url}`, {
    userAgent: req.headers['user-agent'],
    ip: req.ip || req.socket.remoteAddress,
    requestId: req.headers['x-request-id']
  });

  // Override res.end to log response  
  const originalEnd = res.end.bind(res);
  res.end = ((...args: any[]) => {
    const responseTime = Date.now() - start;

    // Log the request completion
    logger.logRequest(req, res, responseTime);

    // Call original end
    return originalEnd(...args);
  }) as any;

  next();
}

// Error logging middleware
export function errorLoggingMiddleware(error: Error, req: Request, res: Response, next: NextFunction) {
  const responseTime = Date.now() - (req as any).startTime || 0;

  logger.logRequest(req, res, responseTime, error);

  next(error);
}

export { logger };
