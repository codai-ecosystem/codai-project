/**
 * CBD Performance Metrics Collection System
 * Comprehensive performance monitoring for HTAP operations
 */

import { Logger } from '../utils/logger.js';

export interface QueryMetrics {
    queryId: string;
    type: string;
    engine: 'oltp' | 'olap';
    executionTimeMs: number;
    memoryUsedMB: number;
    cpuUsagePercent: number;
    rowsProcessed: number;
    timestamp: Date;
}

export interface SystemMetrics {
    cpuUsagePercent: number;
    memoryUsageMB: number;
    diskIOReadMBps: number;
    diskIOWriteMBps: number;
    networkInMBps: number;
    networkOutMBps: number;
    activeConnections: number;
    timestamp: Date;
}

export interface HTAPMetrics {
    oltpThroughput: number; // transactions per second
    olapThroughput: number; // queries per second
    routingAccuracy: number; // percentage
    avgRoutingTimeMs: number;
    cacheHitRatio: number;
    timestamp: Date;
}

/**
 * Performance Metrics Manager
 */
export class PerformanceMetrics {
    private logger: Logger;
    private queryMetrics: QueryMetrics[] = [];
    private systemMetrics: SystemMetrics[] = [];
    private htapMetrics: HTAPMetrics[] = [];
    private maxHistorySize = 10000; // Keep last 10k metrics

    constructor() {
        this.logger = new Logger('PerformanceMetrics');
        this.startSystemMetricsCollection();
    }

    /**
     * Record query execution metrics
     */
    recordQueryExecution(
        queryType: string,
        engine: 'oltp' | 'olap',
        executionTimeMs: number,
        memoryUsedMB = 0,
        cpuUsagePercent = 0,
        rowsProcessed = 0
    ): void {
        const metric: QueryMetrics = {
            queryId: this.generateQueryId(),
            type: queryType,
            engine,
            executionTimeMs,
            memoryUsedMB,
            cpuUsagePercent,
            rowsProcessed,
            timestamp: new Date()
        };

        this.queryMetrics.push(metric);
        this.trimHistory(this.queryMetrics);

        this.logger.debug(`Query metric recorded: ${queryType} on ${engine} - ${executionTimeMs}ms`);
    }

    /**
     * Record query classification metrics
     */
    recordQueryClassification(queryType: string, classificationTimeMs: number): void {
        this.logger.debug(`Query classification: ${queryType} in ${classificationTimeMs}ms`);
        // Additional classification metrics could be stored here
    }

    /**
     * Record HTAP-specific metrics
     */
    recordHTAPMetrics(metrics: Partial<HTAPMetrics>): void {
        const htapMetric: HTAPMetrics = {
            oltpThroughput: metrics.oltpThroughput || 0,
            olapThroughput: metrics.olapThroughput || 0,
            routingAccuracy: metrics.routingAccuracy || 0,
            avgRoutingTimeMs: metrics.avgRoutingTimeMs || 0,
            cacheHitRatio: metrics.cacheHitRatio || 0,
            timestamp: new Date()
        };

        this.htapMetrics.push(htapMetric);
        this.trimHistory(this.htapMetrics);
    }

    /**
     * Get query performance statistics
     */
    getQueryStats(timeRangeMinutes = 60): {
        totalQueries: number;
        avgExecutionTimeMs: number;
        oltpQueries: number;
        olapQueries: number;
        slowQueries: number;
    } {
        const cutoff = new Date(Date.now() - timeRangeMinutes * 60 * 1000);
        const recentMetrics = this.queryMetrics.filter(m => m.timestamp >= cutoff);

        if (recentMetrics.length === 0) {
            return {
                totalQueries: 0,
                avgExecutionTimeMs: 0,
                oltpQueries: 0,
                olapQueries: 0,
                slowQueries: 0
            };
        }

        const totalTime = recentMetrics.reduce((sum, m) => sum + m.executionTimeMs, 0);
        const oltpCount = recentMetrics.filter(m => m.engine === 'oltp').length;
        const olapCount = recentMetrics.filter(m => m.engine === 'olap').length;
        const slowCount = recentMetrics.filter(m => m.executionTimeMs > 1000).length; // >1s

        return {
            totalQueries: recentMetrics.length,
            avgExecutionTimeMs: totalTime / recentMetrics.length,
            oltpQueries: oltpCount,
            olapQueries: olapCount,
            slowQueries: slowCount
        };
    }

    /**
     * Get system resource statistics
     */
    getSystemStats(timeRangeMinutes = 60): {
        avgCpuUsage: number;
        avgMemoryUsageMB: number;
        avgDiskIOReadMBps: number;
        avgDiskIOWriteMBps: number;
        peakConnections: number;
    } {
        const cutoff = new Date(Date.now() - timeRangeMinutes * 60 * 1000);
        const recentMetrics = this.systemMetrics.filter(m => m.timestamp >= cutoff);

        if (recentMetrics.length === 0) {
            return {
                avgCpuUsage: 0,
                avgMemoryUsageMB: 0,
                avgDiskIOReadMBps: 0,
                avgDiskIOWriteMBps: 0,
                peakConnections: 0
            };
        }

        const total = recentMetrics.length;
        return {
            avgCpuUsage: recentMetrics.reduce((sum, m) => sum + m.cpuUsagePercent, 0) / total,
            avgMemoryUsageMB: recentMetrics.reduce((sum, m) => sum + m.memoryUsageMB, 0) / total,
            avgDiskIOReadMBps: recentMetrics.reduce((sum, m) => sum + m.diskIOReadMBps, 0) / total,
            avgDiskIOWriteMBps: recentMetrics.reduce((sum, m) => sum + m.diskIOWriteMBps, 0) / total,
            peakConnections: Math.max(...recentMetrics.map(m => m.activeConnections))
        };
    }

    /**
     * Get HTAP performance statistics
     */
    getHTAPStats(timeRangeMinutes = 60): {
        avgOltpThroughput: number;
        avgOlapThroughput: number;
        avgRoutingAccuracy: number;
        avgRoutingTimeMs: number;
        avgCacheHitRatio: number;
    } {
        const cutoff = new Date(Date.now() - timeRangeMinutes * 60 * 1000);
        const recentMetrics = this.htapMetrics.filter(m => m.timestamp >= cutoff);

        if (recentMetrics.length === 0) {
            return {
                avgOltpThroughput: 0,
                avgOlapThroughput: 0,
                avgRoutingAccuracy: 0,
                avgRoutingTimeMs: 0,
                avgCacheHitRatio: 0
            };
        }

        const total = recentMetrics.length;
        return {
            avgOltpThroughput: recentMetrics.reduce((sum, m) => sum + m.oltpThroughput, 0) / total,
            avgOlapThroughput: recentMetrics.reduce((sum, m) => sum + m.olapThroughput, 0) / total,
            avgRoutingAccuracy: recentMetrics.reduce((sum, m) => sum + m.routingAccuracy, 0) / total,
            avgRoutingTimeMs: recentMetrics.reduce((sum, m) => sum + m.avgRoutingTimeMs, 0) / total,
            avgCacheHitRatio: recentMetrics.reduce((sum, m) => sum + m.cacheHitRatio, 0) / total
        };
    }

    /**
     * Export metrics for external analysis
     */
    exportMetrics(format: 'json' | 'csv' = 'json'): string {
        const data = {
            queryMetrics: this.queryMetrics.slice(-1000), // Last 1000 queries
            systemMetrics: this.systemMetrics.slice(-1000), // Last 1000 system snapshots
            htapMetrics: this.htapMetrics.slice(-1000) // Last 1000 HTAP snapshots
        };

        if (format === 'json') {
            return JSON.stringify(data, null, 2);
        } else {
            // CSV format implementation would go here
            return 'CSV format not implemented';
        }
    }

    /**
     * Clear all metrics data
     */
    clearMetrics(): void {
        this.queryMetrics = [];
        this.systemMetrics = [];
        this.htapMetrics = [];
        this.logger.info('All metrics data cleared');
    }

    /**
     * Start collecting system metrics periodically
     */
    private startSystemMetricsCollection(): void {
        // Collect system metrics every 10 seconds
        setInterval(() => {
            const metric: SystemMetrics = {
                cpuUsagePercent: this.getCurrentCpuUsage(),
                memoryUsageMB: this.getCurrentMemoryUsage(),
                diskIOReadMBps: this.getCurrentDiskIORead(),
                diskIOWriteMBps: this.getCurrentDiskIOWrite(),
                networkInMBps: this.getCurrentNetworkIn(),
                networkOutMBps: this.getCurrentNetworkOut(),
                activeConnections: this.getCurrentActiveConnections(),
                timestamp: new Date()
            };

            this.systemMetrics.push(metric);
            this.trimHistory(this.systemMetrics);
        }, 10000);

        this.logger.info('System metrics collection started');
    }

    /**
     * Generate unique query ID
     */
    private generateQueryId(): string {
        return `q_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Trim metrics history to prevent memory growth
     */
    private trimHistory<T>(array: T[]): void {
        if (array.length > this.maxHistorySize) {
            array.splice(0, array.length - this.maxHistorySize);
        }
    }

    // System metric collection methods (mock implementations)
    private getCurrentCpuUsage(): number {
        // In production, this would use actual system APIs
        return Math.random() * 100;
    }

    private getCurrentMemoryUsage(): number {
        // In production, this would use actual system APIs
        return Math.random() * 4096; // 4GB max
    }

    private getCurrentDiskIORead(): number {
        return Math.random() * 100; // MB/s
    }

    private getCurrentDiskIOWrite(): number {
        return Math.random() * 50; // MB/s
    }

    private getCurrentNetworkIn(): number {
        return Math.random() * 1000; // MB/s
    }

    private getCurrentNetworkOut(): number {
        return Math.random() * 1000; // MB/s
    }

    private getCurrentActiveConnections(): number {
        return Math.floor(Math.random() * 1000);
    }
}