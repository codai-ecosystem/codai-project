#!/usr/bin/env node
/**
 * MemorAI Advanced MCP Server - Enhanced Error Handling & Monitoring System
 * Phase 1.3: Comprehensive Error Handling, Logging, and Monitoring Infrastructure
 */

import { EventEmitter } from 'events';
import { performance } from 'perf_hooks';
import * as fs from 'fs/promises';
import * as path from 'path';

/**
 * Error Severity Levels
 */
export enum ErrorSeverity {
    LOW = 'low',
    MEDIUM = 'medium',
    HIGH = 'high',
    CRITICAL = 'critical'
}

/**
 * Log Levels
 */
export enum LogLevel {
    DEBUG = 0,
    INFO = 1,
    WARN = 2,
    ERROR = 3,
    CRITICAL = 4
}

/**
 * Performance Metrics Interface
 */
export interface PerformanceMetrics {
    timestamp: string;
    memoryUsage: NodeJS.MemoryUsage;
    cpuUsage: NodeJS.CpuUsage;
    uptime: number;
    requestCount: number;
    averageResponseTime: number;
    errorRate: number;
}

/**
 * Error Context Interface
 */
export interface ErrorContext {
    operation: string;
    transport?: string;
    tool?: string;
    timestamp: string;
    severity: ErrorSeverity;
    recovery?: string;
    metadata?: any;
    context?: any;  // Added for Phase 2 context support
}

/**
 * Health Check Result Interface
 */
export interface HealthCheckResult {
    status: 'healthy' | 'degraded' | 'unhealthy';
    checks: {
        name: string;
        status: 'pass' | 'fail';
        message?: string;
        duration?: number;
    }[];
    timestamp: string;
    uptime: number;
}

/**
 * Advanced Error Handling and Monitoring System
 */
export class AdvancedErrorHandler extends EventEmitter {
    private metrics: PerformanceMetrics[] = [];
    private errorLog: Array<ErrorContext & { error: Error }> = [];
    private requestTimes: Map<string, number> = new Map();
    private requestCount: number = 0;
    private errorCount: number = 0;
    private logLevel: LogLevel = LogLevel.INFO;
    private logDirectory: string;
    private maxLogSize: number = 10 * 1024 * 1024; // 10MB
    private maxMetricsHistory: number = 1000;
    private healthChecks: Map<string, () => Promise<boolean>> = new Map();

    constructor(config?: { logLevel?: LogLevel; logDirectory?: string }) {
        super();
        this.logLevel = config?.logLevel || LogLevel.INFO;
        this.logDirectory = config?.logDirectory || path.join(process.cwd(), 'logs');
        this.initializeHealthChecks();
        this.startPerformanceMonitoring();
    }

    /**
     * Initialize default health checks
     */
    private initializeHealthChecks(): void {
        // Memory usage check
        this.addHealthCheck('memory', async () => {
            const usage = process.memoryUsage();
            const totalMB = usage.heapTotal / 1024 / 1024;
            return totalMB < 512; // Fail if using more than 512MB
        });

        // CPU usage check
        this.addHealthCheck('cpu', async () => {
            const usage = process.cpuUsage();
            const totalUsage = (usage.user + usage.system) / 1000000; // Convert to seconds
            return totalUsage < 80; // Fail if using more than 80% CPU
        });

        // File system check
        this.addHealthCheck('filesystem', async () => {
            try {
                await fs.access(this.logDirectory);
                return true;
            } catch {
                return false;
            }
        });

        // Error rate check
        this.addHealthCheck('error_rate', async () => {
            const errorRate = this.getErrorRate();
            return errorRate < 0.1; // Fail if error rate > 10%
        });
    }

    /**
     * Add custom health check
     */
    addHealthCheck(name: string, check: () => Promise<boolean>): void {
        this.healthChecks.set(name, check);
    }

    /**
     * Start performance monitoring
     */
    private startPerformanceMonitoring(): void {
        setInterval(() => {
            this.collectMetrics();
        }, 30000); // Collect metrics every 30 seconds

        // Clean up old metrics
        setInterval(() => {
            if (this.metrics.length > this.maxMetricsHistory) {
                this.metrics = this.metrics.slice(-this.maxMetricsHistory);
            }
        }, 300000); // Clean up every 5 minutes
    }

    /**
     * Collect performance metrics
     */
    private collectMetrics(): void {
        const metrics: PerformanceMetrics = {
            timestamp: new Date().toISOString(),
            memoryUsage: process.memoryUsage(),
            cpuUsage: process.cpuUsage(),
            uptime: process.uptime(),
            requestCount: this.requestCount,
            averageResponseTime: this.getAverageResponseTime(),
            errorRate: this.getErrorRate()
        };

        this.metrics.push(metrics);
        this.emit('metrics', metrics);
    }

    /**
     * Enhanced logging with structured format
     */
    async log(level: LogLevel, message: string, context?: any): Promise<void> {
        if (level < this.logLevel) return;

        const logEntry = {
            timestamp: new Date().toISOString(),
            level: LogLevel[level],
            message,
            context,
            pid: process.pid,
            memory: process.memoryUsage().heapUsed / 1024 / 1024, // MB
            uptime: process.uptime()
        };

        // Console output with colors
        const levelColors = {
            [LogLevel.DEBUG]: '\x1b[36m', // Cyan
            [LogLevel.INFO]: '\x1b[32m',  // Green
            [LogLevel.WARN]: '\x1b[33m',  // Yellow
            [LogLevel.ERROR]: '\x1b[31m', // Red
            [LogLevel.CRITICAL]: '\x1b[35m' // Magenta
        };

        const color = levelColors[level] || '\x1b[0m';
        const reset = '\x1b[0m';

        console.log(`${color}[${logEntry.timestamp}] ${logEntry.level}: ${message}${reset}`);
        if (context) {
            console.log(`${color}   Context:${reset}`, JSON.stringify(context, null, 2));
        }

        // File logging
        try {
            await this.writeToLogFile(logEntry);
        } catch (error) {
            console.error('Failed to write to log file:', error);
        }
    }

    /**
     * Write log entry to file
     */
    private async writeToLogFile(logEntry: any): Promise<void> {
        try {
            await fs.mkdir(this.logDirectory, { recursive: true });

            const logFile = path.join(this.logDirectory, `memorai-mcp-${new Date().toISOString().split('T')[0]}.log`);
            const logLine = JSON.stringify(logEntry) + '\n';

            // Check file size and rotate if needed
            try {
                const stats = await fs.stat(logFile);
                if (stats.size > this.maxLogSize) {
                    const rotatedFile = `${logFile}.${Date.now()}`;
                    await fs.rename(logFile, rotatedFile);
                }
            } catch {
                // File doesn't exist, which is fine
            }

            await fs.appendFile(logFile, logLine);
        } catch (error) {
            // Fallback to console if file logging fails
            console.error('Log file write failed:', error);
        }
    }

    /**
     * Handle errors with context and recovery
     */
    async handleError(error: Error, context: ErrorContext): Promise<void> {
        const errorEntry = {
            ...context,
            error,
            errorMessage: error.message,
            stack: error.stack
        };

        this.errorLog.push(errorEntry);
        this.errorCount++;

        // Log based on severity
        const logLevel = this.severityToLogLevel(context.severity);
        await this.log(logLevel, `Error in ${context.operation}: ${error.message}`, context);

        // Emit error event
        this.emit('error', errorEntry);

        // Attempt recovery if specified
        if (context.recovery) {
            await this.log(LogLevel.INFO, `Attempting recovery: ${context.recovery}`, { operation: context.operation });
            this.emit('recovery', context);
        }

        // Critical errors trigger emergency procedures
        if (context.severity === ErrorSeverity.CRITICAL) {
            await this.handleCriticalError(error, context);
        }
    }

    /**
     * Handle critical errors
     */
    private async handleCriticalError(error: Error, context: ErrorContext): Promise<void> {
        await this.log(LogLevel.CRITICAL, `CRITICAL ERROR - System may be unstable`, { error: error.message, context });

        // Emergency actions
        this.emit('critical', { error, context });

        // Consider graceful degradation or shutdown
        // This would be customizable based on the specific needs
    }

    /**
     * Track request performance
     */
    startRequest(requestId: string): void {
        this.requestTimes.set(requestId, performance.now());
        this.requestCount++;
    }

    /**
     * End request tracking
     */
    endRequest(requestId: string): number {
        const startTime = this.requestTimes.get(requestId);
        if (!startTime) return 0;

        const duration = performance.now() - startTime;
        this.requestTimes.delete(requestId);
        return duration;
    }

    /**
     * Get average response time
     */
    private getAverageResponseTime(): number {
        if (this.metrics.length === 0) return 0;

        const recentMetrics = this.metrics.slice(-10); // Last 10 metrics
        const totalTime = recentMetrics.reduce((sum, m) => sum + m.averageResponseTime, 0);
        return totalTime / recentMetrics.length;
    }

    /**
     * Get error rate
     */
    getErrorRate(): number {
        if (this.requestCount === 0) return 0;
        return this.errorCount / this.requestCount;
    }

    /**
     * Convert severity to log level
     */
    private severityToLogLevel(severity: ErrorSeverity): LogLevel {
        switch (severity) {
            case ErrorSeverity.LOW: return LogLevel.INFO;
            case ErrorSeverity.MEDIUM: return LogLevel.WARN;
            case ErrorSeverity.HIGH: return LogLevel.ERROR;
            case ErrorSeverity.CRITICAL: return LogLevel.CRITICAL;
        }
    }

    /**
     * Perform comprehensive health check
     */
    async performHealthCheck(): Promise<HealthCheckResult> {
        const checks = [];
        let overallStatus: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';

        for (const [name, check] of this.healthChecks) {
            const startTime = performance.now();
            let status: 'pass' | 'fail' = 'fail';
            let message: string | undefined;

            try {
                const result = await Promise.race([
                    check(),
                    new Promise<boolean>((_, reject) =>
                        setTimeout(() => reject(new Error('Health check timeout')), 5000)
                    )
                ]);

                status = result ? 'pass' : 'fail';
                if (!result && overallStatus === 'healthy') {
                    overallStatus = 'degraded';
                }
            } catch (error: any) {
                status = 'fail';
                message = error.message;
                overallStatus = 'unhealthy';
            }

            const duration = performance.now() - startTime;
            checks.push({ name, status, message, duration });
        }

        const result: HealthCheckResult = {
            status: overallStatus,
            checks,
            timestamp: new Date().toISOString(),
            uptime: process.uptime()
        };

        await this.log(LogLevel.INFO, `Health check completed: ${overallStatus}`, result);
        return result;
    }

    /**
     * Get performance metrics
     */
    getMetrics(): PerformanceMetrics[] {
        return [...this.metrics];
    }

    /**
     * Get recent errors
     */
    getRecentErrors(limit: number = 50): Array<ErrorContext & { error: Error }> {
        return this.errorLog.slice(-limit);
    }

    /**
     * Get system statistics
     */
    getSystemStats(): any {
        return {
            uptime: process.uptime(),
            memoryUsage: process.memoryUsage(),
            cpuUsage: process.cpuUsage(),
            requestCount: this.requestCount,
            errorCount: this.errorCount,
            errorRate: this.getErrorRate(),
            averageResponseTime: this.getAverageResponseTime(),
            platform: process.platform,
            nodeVersion: process.version,
            pid: process.pid
        };
    }

    /**
     * Create error recovery wrapper
     */
    createRecoveryWrapper<T>(
        operation: string,
        recoveryAction?: () => Promise<T>,
        severity: ErrorSeverity = ErrorSeverity.MEDIUM
    ) {
        return async (fn: () => Promise<T>): Promise<T> => {
            try {
                return await fn();
            } catch (error: any) {
                const context: ErrorContext = {
                    operation,
                    timestamp: new Date().toISOString(),
                    severity,
                    recovery: recoveryAction ? 'Attempting automatic recovery' : undefined
                };

                await this.handleError(error, context);

                if (recoveryAction) {
                    try {
                        return await recoveryAction();
                    } catch (recoveryError: any) {
                        await this.handleError(recoveryError, {
                            ...context,
                            operation: `${operation} (recovery)`,
                            severity: ErrorSeverity.HIGH
                        });
                        throw recoveryError;
                    }
                }

                throw error;
            }
        };
    }

    /**
     * Graceful shutdown
     */
    async shutdown(): Promise<void> {
        await this.log(LogLevel.INFO, 'Error handler shutting down...');

        // Final metrics collection
        this.collectMetrics();

        // Flush any remaining logs
        await new Promise(resolve => setTimeout(resolve, 1000));

        await this.log(LogLevel.INFO, 'Error handler shutdown complete');
    }
}

/**
 * Singleton instance for global use
 */
export const globalErrorHandler = new AdvancedErrorHandler({
    logLevel: process.env.MEMORAI_LOG_LEVEL === 'debug' ? LogLevel.DEBUG : LogLevel.INFO,
    logDirectory: process.env.MEMORAI_LOG_DIR || path.join(process.cwd(), 'logs')
});

/**
 * Utility functions for common error patterns
 */
export class ErrorUtils {
    static async withRetry<T>(
        fn: () => Promise<T>,
        maxRetries: number = 3,
        delay: number = 1000,
        operation: string = 'unknown'
    ): Promise<T> {
        let lastError: Error;

        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                return await fn();
            } catch (error: any) {
                lastError = error;

                if (attempt === maxRetries) {
                    await globalErrorHandler.handleError(error, {
                        operation: `${operation} (final attempt)`,
                        timestamp: new Date().toISOString(),
                        severity: ErrorSeverity.HIGH,
                        metadata: { attempts: maxRetries }
                    });
                    break;
                }

                await globalErrorHandler.log(LogLevel.WARN,
                    `Retry ${attempt}/${maxRetries} for ${operation}: ${error.message}`
                );

                // Exponential backoff
                await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, attempt - 1)));
            }
        }

        throw lastError!;
    }

    static async withTimeout<T>(
        fn: () => Promise<T>,
        timeoutMs: number,
        operation: string = 'unknown'
    ): Promise<T> {
        return Promise.race([
            fn(),
            new Promise<never>((_, reject) => {
                setTimeout(() => {
                    const error = new Error(`Operation timeout after ${timeoutMs}ms`);
                    globalErrorHandler.handleError(error, {
                        operation,
                        timestamp: new Date().toISOString(),
                        severity: ErrorSeverity.MEDIUM,
                        metadata: { timeoutMs }
                    });
                    reject(error);
                }, timeoutMs);
            })
        ]);
    }
}

export default AdvancedErrorHandler;
