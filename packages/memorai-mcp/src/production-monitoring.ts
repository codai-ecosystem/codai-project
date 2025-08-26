/**
 * Production Monitoring and Observability System for MemorAI MCP
 * 
 * Implements enterprise-grade monitoring, metrics collection, and observability
 * following Microsoft Azure best practices for Node.js/TypeScript applications.
 * 
 * Features:
 * - Performance metrics collection and analysis
 * - Health checks and readiness probes
 * - Structured logging with correlation IDs
 * - Circuit breaker pattern for fault tolerance
 * - Resource monitoring and alerts
 * - Distributed tracing support
 * 
 * @version 2.0.0
 * @author MemorAI Development Team
 */

import { EventEmitter } from 'events';
import { performance } from 'perf_hooks';
import { randomUUID } from 'crypto';

// Core monitoring interfaces
export interface MetricData {
    name: string;
    value: number;
    timestamp: number;
    tags?: Record<string, string>;
    correlationId?: string;
}

export interface PerformanceMetrics {
    responseTime: number;
    throughput: number;
    errorRate: number;
    memoryUsage: number;
    cpuUsage: number;
    activeConnections: number;
    queueDepth: number;
    cacheHitRate: number;
}

export interface HealthCheckResult {
    status: 'healthy' | 'degraded' | 'unhealthy';
    component: string;
    timestamp: number;
    latency: number;
    details?: Record<string, any>;
    errors?: string[];
}

export interface CircuitBreakerState {
    state: 'closed' | 'open' | 'half-open';
    failures: number;
    lastFailure?: number;
    nextRetry?: number;
    successCount: number;
    totalRequests: number;
}

// Advanced monitoring configuration
export interface MonitoringConfig {
    // Performance monitoring
    performanceCollection: {
        enabled: boolean;
        interval: number; // ms
        retainDuration: number; // ms
    };

    // Health checks
    healthChecks: {
        enabled: boolean;
        interval: number; // ms
        timeout: number; // ms
        endpoints: Array<{
            name: string;
            url?: string;
            check: () => Promise<HealthCheckResult>;
        }>;
    };

    // Circuit breaker
    circuitBreaker: {
        enabled: boolean;
        failureThreshold: number;
        timeout: number; // ms
        resetTimeout: number; // ms
    };

    // Logging
    logging: {
        level: 'error' | 'warn' | 'info' | 'debug';
        structured: boolean;
        includeCorrelationId: boolean;
        sensitiveDataMasking: boolean;
    };

    // Alerting
    alerting: {
        enabled: boolean;
        thresholds: {
            responseTime: number; // ms
            errorRate: number; // percentage
            memoryUsage: number; // percentage
            cpuUsage: number; // percentage
        };
    };
}

/**
 * Enterprise Production Monitoring System
 */
export class ProductionMonitoringSystem extends EventEmitter {
    private metrics: Map<string, MetricData[]> = new Map();
    private healthChecks: Map<string, HealthCheckResult> = new Map();
    private circuitBreakers: Map<string, CircuitBreakerState> = new Map();
    private performanceData: PerformanceMetrics[] = [];

    private monitoringInterval?: NodeJS.Timeout;
    private healthCheckInterval?: NodeJS.Timeout;
    private startTime: number;
    private requestCounter = 0;
    private errorCounter = 0;

    constructor(private config: MonitoringConfig) {
        super();
        this.startTime = Date.now();
        this.initializeMonitoring();
    }

    /**
     * Initialize monitoring systems
     */
    private initializeMonitoring(): void {
        if (this.config.performanceCollection.enabled) {
            this.startPerformanceCollection();
        }

        if (this.config.healthChecks.enabled) {
            this.startHealthChecks();
        }

        // Setup default circuit breakers
        this.setupCircuitBreakers();

        this.log('info', 'Production monitoring system initialized', {
            performanceCollection: this.config.performanceCollection.enabled,
            healthChecks: this.config.healthChecks.enabled,
            circuitBreakers: this.config.circuitBreaker.enabled,
            alerting: this.config.alerting.enabled
        });
    }

    /**
     * Start performance metrics collection
     */
    private startPerformanceCollection(): void {
        this.monitoringInterval = setInterval(async () => {
            try {
                const metrics = await this.collectPerformanceMetrics();
                this.performanceData.push(metrics);

                // Retain only recent data
                const cutoffTime = Date.now() - this.config.performanceCollection.retainDuration;
                this.performanceData = this.performanceData.filter(m =>
                    (m as any).timestamp > cutoffTime
                );

                // Check alerting thresholds
                this.checkAlerts(metrics);

                this.emit('metrics', metrics);
            } catch (error) {
                this.log('error', 'Performance collection failed', { error });
            }
        }, this.config.performanceCollection.interval);
    }

    /**
     * Start health check monitoring
     */
    private startHealthChecks(): void {
        this.healthCheckInterval = setInterval(async () => {
            for (const endpoint of this.config.healthChecks.endpoints) {
                try {
                    const start = performance.now();
                    const result = await Promise.race([
                        endpoint.check(),
                        new Promise<HealthCheckResult>((_, reject) =>
                            setTimeout(() => reject(new Error('Health check timeout')),
                                this.config.healthChecks.timeout)
                        )
                    ]);

                    result.latency = performance.now() - start;
                    result.timestamp = Date.now();

                    this.healthChecks.set(endpoint.name, result);
                    this.emit('healthCheck', result);

                } catch (error) {
                    const failedResult: HealthCheckResult = {
                        status: 'unhealthy',
                        component: endpoint.name,
                        timestamp: Date.now(),
                        latency: performance.now(),
                        errors: [error instanceof Error ? error.message : String(error)]
                    };

                    this.healthChecks.set(endpoint.name, failedResult);
                    this.emit('healthCheck', failedResult);
                }
            }
        }, this.config.healthChecks.interval);
    }

    /**
     * Setup circuit breakers for critical components
     */
    private setupCircuitBreakers(): void {
        const components = ['database', 'azure-openai', 'cbd-service', 'memory-store'];

        for (const component of components) {
            this.circuitBreakers.set(component, {
                state: 'closed',
                failures: 0,
                successCount: 0,
                totalRequests: 0
            });
        }
    }

    /**
     * Collect comprehensive performance metrics
     */
    private async collectPerformanceMetrics(): Promise<PerformanceMetrics> {
        const memUsage = process.memoryUsage();
        const cpuUsage = process.cpuUsage();

        const metrics: PerformanceMetrics = {
            responseTime: this.calculateAverageResponseTime(),
            throughput: this.calculateThroughput(),
            errorRate: this.calculateErrorRate(),
            memoryUsage: memUsage.heapUsed / memUsage.heapTotal * 100,
            cpuUsage: (cpuUsage.user + cpuUsage.system) / 1000000, // Convert to seconds
            activeConnections: this.getActiveConnections(),
            queueDepth: this.getQueueDepth(),
            cacheHitRate: this.getCacheHitRate()
        };

        // Store timestamped metrics
        (metrics as any).timestamp = Date.now();

        return metrics;
    }

    /**
     * Calculate average response time from recent requests
     */
    private calculateAverageResponseTime(): number {
        const recentMetrics = this.getRecentMetrics('responseTime');
        if (recentMetrics.length === 0) return 0;

        const sum = recentMetrics.reduce((acc, metric) => acc + metric.value, 0);
        return sum / recentMetrics.length;
    }

    /**
     * Calculate requests per second
     */
    private calculateThroughput(): number {
        const uptime = (Date.now() - this.startTime) / 1000;
        return this.requestCounter / Math.max(uptime, 1);
    }

    /**
     * Calculate error rate percentage
     */
    private calculateErrorRate(): number {
        if (this.requestCounter === 0) return 0;
        return (this.errorCounter / this.requestCounter) * 100;
    }

    /**
     * Get active connection count (mock implementation)
     */
    private getActiveConnections(): number {
        // In a real implementation, this would track actual connections
        return Math.floor(Math.random() * 50) + 10;
    }

    /**
     * Get queue depth (mock implementation)
     */
    private getQueueDepth(): number {
        // In a real implementation, this would track actual queue depth
        return Math.floor(Math.random() * 10);
    }

    /**
     * Get cache hit rate (mock implementation)
     */
    private getCacheHitRate(): number {
        // In a real implementation, this would track actual cache hits
        return Math.random() * 100;
    }

    /**
     * Check alerting thresholds and emit alerts
     */
    private checkAlerts(metrics: PerformanceMetrics): void {
        if (!this.config.alerting.enabled) return;

        const { thresholds } = this.config.alerting;

        if (metrics.responseTime > thresholds.responseTime) {
            this.emit('alert', {
                type: 'performance',
                severity: 'warning',
                message: `High response time: ${metrics.responseTime}ms`,
                threshold: thresholds.responseTime,
                actual: metrics.responseTime
            });
        }

        if (metrics.errorRate > thresholds.errorRate) {
            this.emit('alert', {
                type: 'reliability',
                severity: 'critical',
                message: `High error rate: ${metrics.errorRate}%`,
                threshold: thresholds.errorRate,
                actual: metrics.errorRate
            });
        }

        if (metrics.memoryUsage > thresholds.memoryUsage) {
            this.emit('alert', {
                type: 'resource',
                severity: 'warning',
                message: `High memory usage: ${metrics.memoryUsage}%`,
                threshold: thresholds.memoryUsage,
                actual: metrics.memoryUsage
            });
        }

        if (metrics.cpuUsage > thresholds.cpuUsage) {
            this.emit('alert', {
                type: 'resource',
                severity: 'warning',
                message: `High CPU usage: ${metrics.cpuUsage}%`,
                threshold: thresholds.cpuUsage,
                actual: metrics.cpuUsage
            });
        }
    }

    /**
     * Record a metric value
     */
    public recordMetric(name: string, value: number, tags?: Record<string, string>): void {
        const correlationId = this.generateCorrelationId();
        const metric: MetricData = {
            name,
            value,
            timestamp: Date.now(),
            tags,
            correlationId: this.config.logging.includeCorrelationId ? correlationId : undefined
        };

        if (!this.metrics.has(name)) {
            this.metrics.set(name, []);
        }

        this.metrics.get(name)!.push(metric);
        this.emit('metric', metric);
    }

    /**
     * Record request completion
     */
    public recordRequest(responseTime: number, success: boolean, correlationId?: string): void {
        this.requestCounter++;
        if (!success) this.errorCounter++;

        this.recordMetric('responseTime', responseTime, {
            success: success.toString(),
            correlationId: correlationId || ''
        });
    }

    /**
     * Execute operation with circuit breaker protection
     */
    public async executeWithCircuitBreaker<T>(
        component: string,
        operation: () => Promise<T>,
        correlationId?: string
    ): Promise<T> {
        if (!this.config.circuitBreaker.enabled) {
            return operation();
        }

        const breaker = this.circuitBreakers.get(component);
        if (!breaker) {
            throw new Error(`Circuit breaker not found for component: ${component}`);
        }

        // Check circuit breaker state
        if (breaker.state === 'open') {
            const now = Date.now();
            if (!breaker.nextRetry || now < breaker.nextRetry) {
                this.log('warn', `Circuit breaker open for ${component}`, { correlationId });
                throw new Error(`Circuit breaker open for ${component}`);
            }

            // Transition to half-open
            breaker.state = 'half-open';
            this.log('info', `Circuit breaker transitioning to half-open for ${component}`, { correlationId });
        }

        const start = performance.now();
        breaker.totalRequests++;

        try {
            const result = await operation();
            const responseTime = performance.now() - start;

            // Success
            breaker.successCount++;
            if (breaker.state === 'half-open') {
                breaker.state = 'closed';
                breaker.failures = 0;
                this.log('info', `Circuit breaker closed for ${component}`, { correlationId });
            }

            this.recordRequest(responseTime, true, correlationId);
            return result;

        } catch (error) {
            const responseTime = performance.now() - start;
            breaker.failures++;
            breaker.lastFailure = Date.now();

            // Check if we should open the circuit
            if (breaker.failures >= this.config.circuitBreaker.failureThreshold) {
                breaker.state = 'open';
                breaker.nextRetry = Date.now() + this.config.circuitBreaker.resetTimeout;
                this.log('error', `Circuit breaker opened for ${component}`, {
                    failures: breaker.failures,
                    threshold: this.config.circuitBreaker.failureThreshold,
                    correlationId
                });
            }

            this.recordRequest(responseTime, false, correlationId);
            throw error;
        }
    }

    /**
     * Get recent metrics for a specific metric name
     */
    private getRecentMetrics(name: string, duration = 60000): MetricData[] {
        const metrics = this.metrics.get(name) || [];
        const cutoff = Date.now() - duration;
        return metrics.filter(m => m.timestamp > cutoff);
    }

    /**
     * Generate correlation ID for request tracking
     */
    private generateCorrelationId(): string {
        return randomUUID();
    }

    /**
     * Structured logging with correlation support
     */
    public log(
        level: 'error' | 'warn' | 'info' | 'debug',
        message: string,
        context?: Record<string, any>
    ): void {
        if (this.shouldLog(level)) {
            const logEntry = {
                timestamp: new Date().toISOString(),
                level,
                message,
                service: 'memorai-mcp',
                version: '2.0.0',
                ...context
            };

            if (this.config.logging.sensitiveDataMasking) {
                this.maskSensitiveData(logEntry);
            }

            console.log(JSON.stringify(logEntry));
        }
    }

    /**
     * Check if we should log at the given level
     */
    private shouldLog(level: string): boolean {
        const levels = ['error', 'warn', 'info', 'debug'];
        const currentLevel = levels.indexOf(this.config.logging.level);
        const messageLevel = levels.indexOf(level);
        return messageLevel <= currentLevel;
    }

    /**
     * Mask sensitive data in log entries
     */
    private maskSensitiveData(logEntry: any): void {
        const sensitiveFields = ['password', 'token', 'key', 'secret', 'connectionString'];

        const mask = (obj: any) => {
            if (typeof obj !== 'object' || obj === null) return;

            for (const [key, value] of Object.entries(obj)) {
                if (sensitiveFields.some(field => key.toLowerCase().includes(field))) {
                    obj[key] = '***MASKED***';
                } else if (typeof value === 'object') {
                    mask(value);
                }
            }
        };

        mask(logEntry);
    }

    /**
     * Get comprehensive system status
     */
    public getSystemStatus(): {
        status: 'healthy' | 'degraded' | 'unhealthy';
        uptime: number;
        metrics: PerformanceMetrics | null;
        healthChecks: Record<string, HealthCheckResult>;
        circuitBreakers: Record<string, CircuitBreakerState>;
        alerts: any[];
    } {
        const latestMetrics = this.performanceData[this.performanceData.length - 1] || null;

        // Determine overall status
        let overallStatus: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';

        // Check health checks
        for (const [name, result] of this.healthChecks) {
            if (result.status === 'unhealthy') {
                overallStatus = 'unhealthy';
                break;
            } else if (result.status === 'degraded' && overallStatus === 'healthy') {
                overallStatus = 'degraded';
            }
        }

        // Check circuit breakers
        for (const [name, breaker] of this.circuitBreakers) {
            if (breaker.state === 'open') {
                overallStatus = overallStatus === 'healthy' ? 'degraded' : 'unhealthy';
            }
        }

        return {
            status: overallStatus,
            uptime: Date.now() - this.startTime,
            metrics: latestMetrics,
            healthChecks: Object.fromEntries(this.healthChecks),
            circuitBreakers: Object.fromEntries(this.circuitBreakers),
            alerts: [] // In a real implementation, this would contain active alerts
        };
    }

    /**
     * Graceful shutdown
     */
    public async shutdown(): Promise<void> {
        this.log('info', 'Shutting down monitoring system');

        if (this.monitoringInterval) {
            clearInterval(this.monitoringInterval);
        }

        if (this.healthCheckInterval) {
            clearInterval(this.healthCheckInterval);
        }

        this.removeAllListeners();
    }

    /**
     * Export metrics for external monitoring systems (Prometheus format)
     */
    public exportMetrics(): string {
        const lines: string[] = [];

        // Add performance metrics
        if (this.performanceData.length > 0) {
            const latest = this.performanceData[this.performanceData.length - 1];
            lines.push(`# HELP memorai_response_time_ms Average response time in milliseconds`);
            lines.push(`# TYPE memorai_response_time_ms gauge`);
            lines.push(`memorai_response_time_ms ${latest.responseTime}`);

            lines.push(`# HELP memorai_throughput_rps Requests per second`);
            lines.push(`# TYPE memorai_throughput_rps gauge`);
            lines.push(`memorai_throughput_rps ${latest.throughput}`);

            lines.push(`# HELP memorai_error_rate_percent Error rate percentage`);
            lines.push(`# TYPE memorai_error_rate_percent gauge`);
            lines.push(`memorai_error_rate_percent ${latest.errorRate}`);

            lines.push(`# HELP memorai_memory_usage_percent Memory usage percentage`);
            lines.push(`# TYPE memorai_memory_usage_percent gauge`);
            lines.push(`memorai_memory_usage_percent ${latest.memoryUsage}`);
        }

        // Add circuit breaker metrics
        for (const [component, breaker] of this.circuitBreakers) {
            lines.push(`# HELP memorai_circuit_breaker_state Circuit breaker state (0=closed, 1=half-open, 2=open)`);
            lines.push(`# TYPE memorai_circuit_breaker_state gauge`);
            const stateValue = breaker.state === 'closed' ? 0 : breaker.state === 'half-open' ? 1 : 2;
            lines.push(`memorai_circuit_breaker_state{component="${component}"} ${stateValue}`);

            lines.push(`memorai_circuit_breaker_failures{component="${component}"} ${breaker.failures}`);
            lines.push(`memorai_circuit_breaker_requests{component="${component}"} ${breaker.totalRequests}`);
        }

        return lines.join('\n');
    }
}

// Default production monitoring configuration
export const DEFAULT_MONITORING_CONFIG: MonitoringConfig = {
    performanceCollection: {
        enabled: true,
        interval: 5000, // 5 seconds
        retainDuration: 300000 // 5 minutes
    },
    healthChecks: {
        enabled: true,
        interval: 10000, // 10 seconds
        timeout: 5000, // 5 seconds
        endpoints: []
    },
    circuitBreaker: {
        enabled: true,
        failureThreshold: 5,
        timeout: 30000, // 30 seconds
        resetTimeout: 60000 // 1 minute
    },
    logging: {
        level: 'info',
        structured: true,
        includeCorrelationId: true,
        sensitiveDataMasking: true
    },
    alerting: {
        enabled: true,
        thresholds: {
            responseTime: 1000, // 1 second
            errorRate: 5, // 5%
            memoryUsage: 85, // 85%
            cpuUsage: 80 // 80%
        }
    }
};