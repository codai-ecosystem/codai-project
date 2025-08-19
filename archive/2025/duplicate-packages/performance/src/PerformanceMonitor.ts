import { performance } from 'perf_hooks';

/**
 * Performance Monitoring and Optimization System for MemorAI Platform
 * 
 * Phase 5.1: Performance Optimization
 * Target: API response times < 100ms average, production-grade performance
 */

interface PerformanceMetrics {
    responseTime: number;
    memoryUsage: NodeJS.MemoryUsage;
    cpuUsage: number;
    timestamp: number;
    endpoint: string;
    method: string;
    statusCode: number;
    requestSize: number;
    responseSize: number;
}

interface PerformanceThresholds {
    responseTime: {
        target: number;      // Target response time (100ms)
        warning: number;     // Warning threshold (75ms)
        critical: number;    // Critical threshold (150ms)
    };
    memory: {
        heapUsed: number;    // Max heap usage
        rss: number;         // Max RSS memory
    };
    cpu: {
        warning: number;     // CPU warning threshold
        critical: number;    // CPU critical threshold
    };
}

class PerformanceMonitor {
    private metrics: PerformanceMetrics[] = [];
    private activeRequests = new Map<string, number>();
    private thresholds: PerformanceThresholds = {
        responseTime: {
            target: 100,     // 100ms target
            warning: 75,     // 75ms warning
            critical: 150    // 150ms critical
        },
        memory: {
            heapUsed: 100 * 1024 * 1024,  // 100MB
            rss: 200 * 1024 * 1024        // 200MB
        },
        cpu: {
            warning: 70,     // 70% CPU
            critical: 90     // 90% CPU
        }
    };

    constructor() {
        this.startSystemMonitoring();
    }

    /**
     * Start monitoring a request
     */
    startRequest(requestId: string, _endpoint: string, _method: string): void {
        this.activeRequests.set(requestId, performance.now());
    }

    /**
     * End monitoring a request and record metrics
     */
    endRequest(
        requestId: string,
        endpoint: string,
        method: string,
        statusCode: number,
        requestSize = 0,
        responseSize = 0
    ): PerformanceMetrics {
        const startTime = this.activeRequests.get(requestId);
        if (!startTime) {
            throw new Error(`Request ${requestId} not found in active requests`);
        }

        const responseTime = performance.now() - startTime;
        const memoryUsage = process.memoryUsage();
        const cpuUsage = process.cpuUsage().user / 1000; // Convert to ms

        const metric: PerformanceMetrics = {
            responseTime,
            memoryUsage,
            cpuUsage,
            timestamp: Date.now(),
            endpoint,
            method,
            statusCode,
            requestSize,
            responseSize
        };

        this.metrics.push(metric);
        this.activeRequests.delete(requestId);

        // Check thresholds and log warnings
        this.checkThresholds(metric);

        // Clean old metrics (keep last 1000)
        if (this.metrics.length > 1000) {
            this.metrics = this.metrics.slice(-1000);
        }

        return metric;
    }

    /**
     * Get performance statistics
     */
    getStatistics(timeWindowMs = 300000): {
        averageResponseTime: number;
        p95ResponseTime: number;
        p99ResponseTime: number;
        requestCount: number;
        errorRate: number;
        throughput: number;
        memoryStats: {
            averageHeapUsed: number;
            averageRSS: number;
            peakHeapUsed: number;
            peakRSS: number;
        };
        thresholdViolations: {
            responseTime: number;
            memory: number;
            cpu: number;
        };
        meetingTargets: {
            responseTime: boolean;
            uptime: boolean;
            throughput: boolean;
        };
    } {
        const now = Date.now();
        const windowStart = now - timeWindowMs;
        const recentMetrics = this.metrics.filter(m => m.timestamp >= windowStart);

        if (recentMetrics.length === 0) {
            return this.getEmptyStats();
        }

        // Response time calculations
        const responseTimes = recentMetrics.map(m => m.responseTime).sort((a, b) => a - b);
        const averageResponseTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
        const p95ResponseTime = responseTimes[Math.floor(responseTimes.length * 0.95)] || 0;
        const p99ResponseTime = responseTimes[Math.floor(responseTimes.length * 0.99)] || 0;

        // Error rate calculation
        const errorCount = recentMetrics.filter(m => m.statusCode >= 400).length;
        const errorRate = (errorCount / recentMetrics.length) * 100;

        // Throughput calculation (requests per second)
        const throughput = (recentMetrics.length / (timeWindowMs / 1000));

        // Memory statistics
        const heapUsages = recentMetrics.map(m => m.memoryUsage.heapUsed);
        const rssUsages = recentMetrics.map(m => m.memoryUsage.rss);

        const memoryStats = {
            averageHeapUsed: heapUsages.reduce((a, b) => a + b, 0) / heapUsages.length,
            averageRSS: rssUsages.reduce((a, b) => a + b, 0) / rssUsages.length,
            peakHeapUsed: Math.max(...heapUsages),
            peakRSS: Math.max(...rssUsages)
        };

        // Threshold violations
        const thresholdViolations = {
            responseTime: recentMetrics.filter(m => m.responseTime > this.thresholds.responseTime.critical).length,
            memory: recentMetrics.filter(m => m.memoryUsage.heapUsed > this.thresholds.memory.heapUsed).length,
            cpu: recentMetrics.filter(m => m.cpuUsage > this.thresholds.cpu.critical).length
        };

        // Target achievement
        const meetingTargets = {
            responseTime: averageResponseTime < this.thresholds.responseTime.target,
            uptime: errorRate < 0.1, // 99.9% uptime target
            throughput: throughput > 10 // 10 requests per second minimum
        };

        return {
            averageResponseTime,
            p95ResponseTime,
            p99ResponseTime,
            requestCount: recentMetrics.length,
            errorRate,
            throughput,
            memoryStats,
            thresholdViolations,
            meetingTargets
        };
    }

    /**
     * Get endpoint-specific statistics
     */
    getEndpointStatistics(endpoint: string, timeWindowMs = 300000) {
        const now = Date.now();
        const windowStart = now - timeWindowMs;
        const endpointMetrics = this.metrics.filter(
            m => m.timestamp >= windowStart && m.endpoint === endpoint
        );

        if (endpointMetrics.length === 0) {
            return null;
        }

        const responseTimes = endpointMetrics.map(m => m.responseTime);
        const averageResponseTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
        const errorCount = endpointMetrics.filter(m => m.statusCode >= 400).length;
        const errorRate = (errorCount / endpointMetrics.length) * 100;

        return {
            endpoint,
            requestCount: endpointMetrics.length,
            averageResponseTime,
            minResponseTime: Math.min(...responseTimes),
            maxResponseTime: Math.max(...responseTimes),
            errorRate,
            lastRequest: Math.max(...endpointMetrics.map(m => m.timestamp))
        };
    }

    /**
     * Check performance thresholds and log warnings
     */
    private checkThresholds(metric: PerformanceMetrics): void {
        const warnings: string[] = [];

        // Check response time
        if (metric.responseTime > this.thresholds.responseTime.critical) {
            warnings.push(`Critical response time: ${metric.responseTime.toFixed(2)}ms (threshold: ${this.thresholds.responseTime.critical}ms)`);
        } else if (metric.responseTime > this.thresholds.responseTime.warning) {
            warnings.push(`Warning response time: ${metric.responseTime.toFixed(2)}ms (threshold: ${this.thresholds.responseTime.warning}ms)`);
        }

        // Check memory usage
        if (metric.memoryUsage.heapUsed > this.thresholds.memory.heapUsed) {
            warnings.push(`High memory usage: ${(metric.memoryUsage.heapUsed / 1024 / 1024).toFixed(2)}MB`);
        }

        // Check CPU usage
        if (metric.cpuUsage > this.thresholds.cpu.critical) {
            warnings.push(`Critical CPU usage: ${metric.cpuUsage.toFixed(2)}%`);
        }

        // Log warnings if any
        if (warnings.length > 0) {
            console.warn(`[PerformanceMonitor] ${metric.endpoint} ${metric.method}:`, warnings.join(', '));
        }
    }

    /**
     * Start system-level monitoring
     */
    private startSystemMonitoring(): void {
        // Monitor every 30 seconds
        setInterval(() => {
            const memoryUsage = process.memoryUsage();
            // const _cpuUsage = process.cpuUsage();  // Removed - not used

            // Log system status
            console.log(`[SystemMonitor] Memory: ${(memoryUsage.heapUsed / 1024 / 1024).toFixed(2)}MB, ` +
                `RSS: ${(memoryUsage.rss / 1024 / 1024).toFixed(2)}MB, ` +
                `Active Requests: ${this.activeRequests.size}`);

            // Check for memory leaks
            if (memoryUsage.heapUsed > this.thresholds.memory.heapUsed * 1.5) {
                console.error(`[SystemMonitor] Potential memory leak detected: ${(memoryUsage.heapUsed / 1024 / 1024).toFixed(2)}MB`);
            }
        }, 30000);
    }

    /**
     * Get empty statistics for when no data is available
     */
    private getEmptyStats() {
        return {
            averageResponseTime: 0,
            p95ResponseTime: 0,
            p99ResponseTime: 0,
            requestCount: 0,
            errorRate: 0,
            throughput: 0,
            memoryStats: {
                averageHeapUsed: 0,
                averageRSS: 0,
                peakHeapUsed: 0,
                peakRSS: 0
            },
            thresholdViolations: {
                responseTime: 0,
                memory: 0,
                cpu: 0
            },
            meetingTargets: {
                responseTime: true,
                uptime: true,
                throughput: false
            }
        };
    }

    /**
     * Export metrics for external monitoring
     */
    exportMetrics(format: 'json' | 'prometheus' = 'json'): string {
        const stats = this.getStatistics();

        if (format === 'prometheus') {
            return this.formatPrometheusMetrics(stats);
        }

        return JSON.stringify({
            timestamp: Date.now(),
            service: 'memorai-platform',
            version: '1.0.0',
            statistics: stats,
            thresholds: this.thresholds
        }, null, 2);
    }

    /**
     * Format metrics for Prometheus monitoring
     */
    private formatPrometheusMetrics(stats: any): string {
        return `
# HELP memorai_response_time_ms Average response time in milliseconds
# TYPE memorai_response_time_ms gauge
memorai_response_time_ms ${stats.averageResponseTime}

# HELP memorai_p95_response_time_ms 95th percentile response time
# TYPE memorai_p95_response_time_ms gauge
memorai_p95_response_time_ms ${stats.p95ResponseTime}

# HELP memorai_request_count Total number of requests
# TYPE memorai_request_count counter
memorai_request_count ${stats.requestCount}

# HELP memorai_error_rate Error rate percentage
# TYPE memorai_error_rate gauge
memorai_error_rate ${stats.errorRate}

# HELP memorai_throughput_rps Requests per second
# TYPE memorai_throughput_rps gauge
memorai_throughput_rps ${stats.throughput}

# HELP memorai_memory_heap_bytes Memory heap usage in bytes
# TYPE memorai_memory_heap_bytes gauge
memorai_memory_heap_bytes ${stats.memoryStats.averageHeapUsed}

# HELP memorai_targets_met Whether performance targets are being met
# TYPE memorai_targets_met gauge
memorai_targets_met{target="response_time"} ${stats.meetingTargets.responseTime ? 1 : 0}
memorai_targets_met{target="uptime"} ${stats.meetingTargets.uptime ? 1 : 0}
memorai_targets_met{target="throughput"} ${stats.meetingTargets.throughput ? 1 : 0}
`.trim();
    }

    /**
     * Generate performance report
     */
    generateReport(): string {
        const stats = this.getStatistics();
        const report = `
# MemorAI Performance Report
Generated: ${new Date().toISOString()}

## Performance Summary
- Average Response Time: ${stats.averageResponseTime.toFixed(2)}ms
- 95th Percentile: ${stats.p95ResponseTime.toFixed(2)}ms
- 99th Percentile: ${stats.p99ResponseTime.toFixed(2)}ms
- Error Rate: ${stats.errorRate.toFixed(2)}%
- Throughput: ${stats.throughput.toFixed(2)} req/s

## Target Achievement
- Response Time Target (100ms): ${stats.meetingTargets.responseTime ? '✅ MET' : '❌ NOT MET'}
- Uptime Target (99.9%): ${stats.meetingTargets.uptime ? '✅ MET' : '❌ NOT MET'}
- Throughput Target (10 req/s): ${stats.meetingTargets.throughput ? '✅ MET' : '❌ NOT MET'}

## Memory Usage
- Average Heap: ${(stats.memoryStats.averageHeapUsed / 1024 / 1024).toFixed(2)}MB
- Peak Heap: ${(stats.memoryStats.peakHeapUsed / 1024 / 1024).toFixed(2)}MB
- Average RSS: ${(stats.memoryStats.averageRSS / 1024 / 1024).toFixed(2)}MB

## Threshold Violations
- Response Time: ${stats.thresholdViolations.responseTime} violations
- Memory: ${stats.thresholdViolations.memory} violations
- CPU: ${stats.thresholdViolations.cpu} violations
        `.trim();

        return report;
    }
}

// Express.js middleware for automatic performance monitoring
export function performanceMiddleware(monitor: PerformanceMonitor) {
    return (req: any, res: any, next: any) => {
        const requestId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        // const _startTime = performance.now();  // Removed - not used

        monitor.startRequest(requestId, req.path, req.method);

        // Capture response
        const originalSend = res.send;
        res.send = function (data: any) {
            const responseSize = Buffer.byteLength(data || '', 'utf8');
            const requestSize = parseInt(req.get('content-length') || '0', 10);

            monitor.endRequest(
                requestId,
                req.path,
                req.method,
                res.statusCode,
                requestSize,
                responseSize
            );

            originalSend.call(this, data);
        };

        next();
    };
}

// Singleton instance
export const performanceMonitor = new PerformanceMonitor();
export default PerformanceMonitor;
