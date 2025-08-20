import { EventEmitter } from 'events';
import { performance } from 'perf_hooks';
import fs from 'fs/promises';
import path from 'path';

/**
 * Comprehensive Monitoring and Observability System for MemorAI Platform
 * 
 * Phase 5.2: Monitoring and Observability
 * Target: Production monitoring setup with comprehensive logging, health checks, 
 * performance metrics, and alerting systems
 */

interface LogEntry {
    timestamp: number;
    level: 'debug' | 'info' | 'warn' | 'error' | 'critical';
    service: string;
    message: string;
    metadata?: Record<string, any>;
    traceId?: string;
    userId?: string;
    requestId?: string;
    error?: {
        name: string;
        message: string;
        stack?: string;
    };
}

interface HealthCheck {
    name: string;
    status: 'healthy' | 'warning' | 'unhealthy';
    lastCheck: number;
    responseTime: number;
    details?: Record<string, any>;
    error?: string;
}

interface SystemMetrics {
    timestamp: number;
    cpu: {
        usage: number;
        loadAverage: number[];
    };
    memory: {
        used: number;
        free: number;
        total: number;
        heapUsed: number;
        heapTotal: number;
    };
    disk: {
        used: number;
        free: number;
        total: number;
    };
    network: {
        connections: number;
        bytesIn: number;
        bytesOut: number;
    };
    processes: {
        active: number;
        total: number;
    };
}

interface Alert {
    id: string;
    level: 'info' | 'warning' | 'critical';
    title: string;
    description: string;
    service: string;
    timestamp: number;
    resolved: boolean;
    resolvedAt?: number;
    metadata?: Record<string, any>;
}

class MonitoringSystem extends EventEmitter {
    private logs: LogEntry[] = [];
    private healthChecks = new Map<string, HealthCheck>();
    private alerts: Alert[] = [];
    private metrics: SystemMetrics[] = [];
    private healthCheckInterval?: NodeJS.Timeout;
    private metricsInterval?: NodeJS.Timeout;
    private logCleanupInterval?: NodeJS.Timeout;

    private config = {
        logRetentionDays: 7,
        metricsRetentionHours: 24,
        healthCheckIntervalMs: 30000,  // 30 seconds
        metricsCollectionIntervalMs: 60000,  // 1 minute
        logCleanupIntervalMs: 3600000,  // 1 hour
        alertThresholds: {
            cpuUsage: 80,           // 80% CPU
            memoryUsage: 85,        // 85% Memory
            diskUsage: 90,          // 90% Disk
            responseTime: 1000,     // 1 second
            errorRate: 5            // 5% error rate
        }
    };

    constructor(config?: Partial<typeof this.config>) {
        super();

        if (config) {
            this.config = { ...this.config, ...config };
        }

        this.startMonitoring();
    }

    /**
     * Log a message with structured metadata
     */
    log(
        level: LogEntry['level'],
        service: string,
        message: string,
        metadata?: Record<string, any>,
        error?: Error
    ): void {
        const logEntry: LogEntry = {
            timestamp: Date.now(),
            level,
            service,
            message,
            metadata,
            traceId: this.generateTraceId(),
            error: error ? {
                name: error.name,
                message: error.message,
                stack: error.stack
            } : undefined
        };

        this.logs.push(logEntry);

        // Emit log event for real-time monitoring
        this.emit('log', logEntry);

        // Console output for development
        this.outputToConsole(logEntry);

        // Check for alert conditions
        this.checkAlertConditions(logEntry);
    }

    /**
     * Register a health check
     */
    registerHealthCheck(
        name: string,
        checkFn: () => Promise<{ status: 'healthy' | 'warning' | 'unhealthy'; details?: any }>
    ): void {
        const healthCheck: HealthCheck = {
            name,
            status: 'healthy',
            lastCheck: 0,
            responseTime: 0
        };

        this.healthChecks.set(name, healthCheck);

        // Store the check function for execution
        (healthCheck as any).checkFn = checkFn;

        console.log(`[MonitoringSystem] Registered health check: ${name}`);
    }

    /**
     * Get current health status
     */
    async getHealthStatus(): Promise<{
        overall: 'healthy' | 'warning' | 'unhealthy';
        services: HealthCheck[];
        timestamp: number;
        uptime: number;
    }> {
        const services: HealthCheck[] = [];
        let overallStatus: 'healthy' | 'warning' | 'unhealthy' = 'healthy';

        for (const [name, check] of this.healthChecks) {
            services.push({ ...check });

            if (check.status === 'unhealthy') {
                overallStatus = 'unhealthy';
            } else if (check.status === 'warning' && overallStatus === 'healthy') {
                overallStatus = 'warning';
            }
        }

        return {
            overall: overallStatus,
            services,
            timestamp: Date.now(),
            uptime: process.uptime()
        };
    }

    /**
     * Get system metrics
     */
    getCurrentMetrics(): SystemMetrics {
        const memoryUsage = process.memoryUsage();
        const cpuUsage = process.cpuUsage();

        return {
            timestamp: Date.now(),
            cpu: {
                usage: cpuUsage.user / 1000, // Convert to milliseconds
                loadAverage: require('os').loadavg()
            },
            memory: {
                used: memoryUsage.rss,
                free: require('os').freemem(),
                total: require('os').totalmem(),
                heapUsed: memoryUsage.heapUsed,
                heapTotal: memoryUsage.heapTotal
            },
            disk: {
                used: 0,    // Would implement with actual disk monitoring
                free: 0,
                total: 0
            },
            network: {
                connections: 0,  // Would implement with actual network monitoring
                bytesIn: 0,
                bytesOut: 0
            },
            processes: {
                active: 1,  // Current process
                total: 1
            }
        };
    }

    /**
     * Create an alert
     */
    createAlert(
        level: Alert['level'],
        title: string,
        description: string,
        service: string,
        metadata?: Record<string, any>
    ): string {
        const alert: Alert = {
            id: this.generateAlertId(),
            level,
            title,
            description,
            service,
            timestamp: Date.now(),
            resolved: false,
            metadata
        };

        this.alerts.push(alert);

        // Emit alert event
        this.emit('alert', alert);

        // Log the alert
        this.log('warn', 'AlertingSystem', `Alert created: ${title}`, {
            alertId: alert.id,
            level,
            service
        });

        console.warn(`[ALERT] ${level.toUpperCase()}: ${title} - ${description}`);

        return alert.id;
    }

    /**
     * Resolve an alert
     */
    resolveAlert(alertId: string): boolean {
        const alert = this.alerts.find(a => a.id === alertId && !a.resolved);
        if (!alert) {
            return false;
        }

        alert.resolved = true;
        alert.resolvedAt = Date.now();

        this.emit('alertResolved', alert);

        this.log('info', 'AlertingSystem', `Alert resolved: ${alert.title}`, {
            alertId,
            duration: alert.resolvedAt - alert.timestamp
        });

        return true;
    }

    /**
     * Get active alerts
     */
    getActiveAlerts(): Alert[] {
        return this.alerts.filter(a => !a.resolved);
    }

    /**
     * Get logs with filtering
     */
    getLogs(
        filters?: {
            level?: LogEntry['level'];
            service?: string;
            timeRange?: { start: number; end: number };
            limit?: number;
        }
    ): LogEntry[] {
        let filteredLogs = [...this.logs];

        if (filters?.level) {
            filteredLogs = filteredLogs.filter(log => log.level === filters.level);
        }

        if (filters?.service) {
            filteredLogs = filteredLogs.filter(log => log.service === filters.service);
        }

        if (filters?.timeRange) {
            filteredLogs = filteredLogs.filter(log =>
                log.timestamp >= filters.timeRange!.start &&
                log.timestamp <= filters.timeRange!.end
            );
        }

        // Sort by timestamp descending (newest first)
        filteredLogs.sort((a, b) => b.timestamp - a.timestamp);

        if (filters?.limit) {
            filteredLogs = filteredLogs.slice(0, filters.limit);
        }

        return filteredLogs;
    }

    /**
     * Export monitoring data for external systems
     */
    async exportData(format: 'json' | 'csv' | 'prometheus' = 'json'): Promise<string> {
        const data = {
            timestamp: Date.now(),
            logs: this.logs.slice(-1000), // Last 1000 logs
            healthChecks: Array.from(this.healthChecks.values()),
            alerts: this.alerts,
            metrics: this.metrics.slice(-100), // Last 100 metric points
            config: this.config
        };

        switch (format) {
            case 'prometheus':
                return this.formatPrometheusMetrics(data);
            case 'csv':
                return this.formatCSVMetrics(data);
            default:
                return JSON.stringify(data, null, 2);
        }
    }

    /**
     * Generate monitoring dashboard data
     */
    getDashboardData(): {
        health: { overall: string; services: HealthCheck[] };
        metrics: SystemMetrics;
        alerts: { active: number; critical: number; warnings: number };
        logs: { recent: LogEntry[]; errorCount: number; warnCount: number };
        uptime: number;
        performance: {
            averageResponseTime: number;
            errorRate: number;
            requestCount: number;
        };
    } {
        const recentLogs = this.getLogs({ limit: 50 });
        const activeAlerts = this.getActiveAlerts();
        const currentMetrics = this.getCurrentMetrics();

        // Calculate performance metrics from logs
        const performanceLogs = recentLogs.filter(log =>
            log.metadata?.responseTime !== undefined
        );

        const averageResponseTime = performanceLogs.length > 0
            ? performanceLogs.reduce((sum, log) => sum + (log.metadata?.responseTime || 0), 0) / performanceLogs.length
            : 0;

        const errorLogs = recentLogs.filter(log => log.level === 'error');
        const errorRate = recentLogs.length > 0 ? (errorLogs.length / recentLogs.length) * 100 : 0;

        return {
            health: {
                overall: this.getOverallHealthStatus(),
                services: Array.from(this.healthChecks.values())
            },
            metrics: currentMetrics,
            alerts: {
                active: activeAlerts.length,
                critical: activeAlerts.filter(a => a.level === 'critical').length,
                warnings: activeAlerts.filter(a => a.level === 'warning').length
            },
            logs: {
                recent: recentLogs,
                errorCount: errorLogs.length,
                warnCount: recentLogs.filter(log => log.level === 'warn').length
            },
            uptime: process.uptime(),
            performance: {
                averageResponseTime,
                errorRate,
                requestCount: performanceLogs.length
            }
        };
    }

    /**
     * Start monitoring processes
     */
    private startMonitoring(): void {
        // Health checks
        this.healthCheckInterval = setInterval(() => {
            this.runHealthChecks();
        }, this.config.healthCheckIntervalMs);

        // Metrics collection
        this.metricsInterval = setInterval(() => {
            this.collectMetrics();
        }, this.config.metricsCollectionIntervalMs);

        // Log cleanup
        this.logCleanupInterval = setInterval(() => {
            this.cleanupLogs();
        }, this.config.logCleanupIntervalMs);

        console.log('[MonitoringSystem] Monitoring started');
    }

    /**
     * Run all registered health checks
     */
    private async runHealthChecks(): Promise<void> {
        for (const [name, check] of this.healthChecks) {
            try {
                const startTime = performance.now();
                const checkFn = (check as any).checkFn;

                if (checkFn) {
                    const result = await checkFn();
                    const responseTime = performance.now() - startTime;

                    this.healthChecks.set(name, {
                        ...check,
                        status: result.status,
                        lastCheck: Date.now(),
                        responseTime,
                        details: result.details,
                        error: undefined
                    });

                    // Log status changes
                    if (check.status !== result.status) {
                        this.log('info', 'HealthCheck', `Health status changed: ${name}`, {
                            from: check.status,
                            to: result.status,
                            responseTime
                        });
                    }
                }
            } catch (error) {
                this.healthChecks.set(name, {
                    ...check,
                    status: 'unhealthy',
                    lastCheck: Date.now(),
                    responseTime: 0,
                    error: error instanceof Error ? error.message : 'Unknown error'
                });

                this.log('error', 'HealthCheck', `Health check failed: ${name}`, {}, error as Error);
            }
        }
    }

    /**
     * Collect system metrics
     */
    private collectMetrics(): void {
        const metrics = this.getCurrentMetrics();
        this.metrics.push(metrics);

        // Keep only recent metrics
        const retentionTime = Date.now() - (this.config.metricsRetentionHours * 60 * 60 * 1000);
        this.metrics = this.metrics.filter(m => m.timestamp > retentionTime);

        // Check for alert conditions
        this.checkMetricAlerts(metrics);
    }

    /**
     * Clean up old logs
     */
    private cleanupLogs(): void {
        const retentionTime = Date.now() - (this.config.logRetentionDays * 24 * 60 * 60 * 1000);
        const originalCount = this.logs.length;

        this.logs = this.logs.filter(log => log.timestamp > retentionTime);

        const removedCount = originalCount - this.logs.length;
        if (removedCount > 0) {
            console.log(`[MonitoringSystem] Cleaned up ${removedCount} old log entries`);
        }
    }

    /**
     * Check for alert conditions in metrics
     */
    private checkMetricAlerts(metrics: SystemMetrics): void {
        const { alertThresholds } = this.config;

        // CPU usage alert
        const cpuUsagePercent = (metrics.cpu.usage / 1000) * 100;
        if (cpuUsagePercent > alertThresholds.cpuUsage) {
            this.createAlert(
                'warning',
                'High CPU Usage',
                `CPU usage is ${cpuUsagePercent.toFixed(1)}%`,
                'SystemMonitor',
                { cpuUsage: cpuUsagePercent }
            );
        }

        // Memory usage alert
        const memoryUsagePercent = (metrics.memory.used / metrics.memory.total) * 100;
        if (memoryUsagePercent > alertThresholds.memoryUsage) {
            this.createAlert(
                'warning',
                'High Memory Usage',
                `Memory usage is ${memoryUsagePercent.toFixed(1)}%`,
                'SystemMonitor',
                { memoryUsage: memoryUsagePercent }
            );
        }
    }

    /**
     * Check for alert conditions in logs
     */
    private checkAlertConditions(logEntry: LogEntry): void {
        // Create alerts for critical errors
        if (logEntry.level === 'critical') {
            this.createAlert(
                'critical',
                'Critical Error',
                logEntry.message,
                logEntry.service,
                logEntry.metadata
            );
        }

        // Check error rate
        const recentErrors = this.getLogs({
            level: 'error',
            timeRange: { start: Date.now() - 300000, end: Date.now() } // Last 5 minutes
        });

        if (recentErrors.length > 10) {
            this.createAlert(
                'warning',
                'High Error Rate',
                `${recentErrors.length} errors in the last 5 minutes`,
                'ErrorMonitor',
                { errorCount: recentErrors.length }
            );
        }
    }

    /**
     * Output log to console with formatting
     */
    private outputToConsole(logEntry: LogEntry): void {
        const timestamp = new Date(logEntry.timestamp).toISOString();
        const level = logEntry.level.toUpperCase().padEnd(8);
        const service = logEntry.service.padEnd(15);

        let output = `[${timestamp}] ${level} ${service} ${logEntry.message}`;

        if (logEntry.metadata) {
            output += ` | ${JSON.stringify(logEntry.metadata)}`;
        }

        switch (logEntry.level) {
            case 'critical':
            case 'error':
                console.error(output);
                break;
            case 'warn':
                console.warn(output);
                break;
            case 'debug':
                console.debug(output);
                break;
            default:
                console.log(output);
        }
    }

    /**
     * Get overall health status from all checks
     */
    private getOverallHealthStatus(): string {
        const statuses = Array.from(this.healthChecks.values()).map(check => check.status);

        if (statuses.includes('unhealthy')) return 'unhealthy';
        if (statuses.includes('warning')) return 'warning';
        return 'healthy';
    }

    /**
     * Generate trace ID for distributed tracing
     */
    private generateTraceId(): string {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    /**
     * Generate alert ID
     */
    private generateAlertId(): string {
        return 'alert_' + Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    /**
     * Format metrics for Prometheus
     */
    private formatPrometheusMetrics(data: any): string {
        const latest = data.metrics[data.metrics.length - 1];
        if (!latest) return '';

        return `
# HELP memorai_cpu_usage CPU usage percentage
# TYPE memorai_cpu_usage gauge
memorai_cpu_usage ${(latest.cpu.usage / 1000) * 100}

# HELP memorai_memory_usage Memory usage in bytes
# TYPE memorai_memory_usage gauge
memorai_memory_usage ${latest.memory.used}

# HELP memorai_active_alerts Number of active alerts
# TYPE memorai_active_alerts gauge
memorai_active_alerts ${this.getActiveAlerts().length}

# HELP memorai_uptime Process uptime in seconds
# TYPE memorai_uptime counter
memorai_uptime ${process.uptime()}
        `.trim();
    }

    /**
     * Format metrics for CSV export
     */
    private formatCSVMetrics(data: any): string {
        const headers = ['timestamp', 'cpu_usage', 'memory_used', 'memory_total', 'active_alerts'];
        const rows = data.metrics.map((metric: SystemMetrics) => [
            metric.timestamp,
            metric.cpu.usage,
            metric.memory.used,
            metric.memory.total,
            this.getActiveAlerts().length
        ]);

        return [headers, ...rows].map(row => row.join(',')).join('\n');
    }

    /**
     * Cleanup and stop monitoring
     */
    stop(): void {
        if (this.healthCheckInterval) clearInterval(this.healthCheckInterval);
        if (this.metricsInterval) clearInterval(this.metricsInterval);
        if (this.logCleanupInterval) clearInterval(this.logCleanupInterval);

        console.log('[MonitoringSystem] Monitoring stopped');
    }
}

// Singleton instance
export const monitoringSystem = new MonitoringSystem();

// Export types and classes
export default MonitoringSystem;
export type {
    LogEntry,
    HealthCheck,
    SystemMetrics,
    Alert
};
