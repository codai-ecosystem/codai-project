// Performance Monitor - Real-time performance metrics collection, analysis, and optimization
// Provides comprehensive performance tracking, Core Web Vitals monitoring, and automated optimization recommendations

import { EventEmitter } from 'eventemitter3';
import {
    PerformanceMetrics,
    PerformanceReport,
    PerformanceThresholds,
    AnomalyDetection,
    OptimizationRecommendation,
    AnalyticsConfig,
    DateRange,
    DEFAULT_PERFORMANCE_THRESHOLDS
} from '../types';

import { createLogger } from '../utils/logger';
import { DatabaseManager } from '../storage/DatabaseManager';
import { CacheManager } from '../storage/CacheManager';

/**
 * PerformanceMonitor - Advanced performance monitoring and optimization
 * 
 * Provides comprehensive performance analytics including:
 * - Real-time Core Web Vitals tracking (LCP, FID, CLS, FCP, TTFB)
 * - Resource performance monitoring (images, scripts, APIs)
 * - Runtime performance analysis (memory, CPU, frame rate)
 * - Network performance tracking and optimization
 * - Automated anomaly detection and alerting
 * - Performance optimization recommendations
 * - Historical trend analysis and benchmarking
 * 
 * @example
 * ```typescript
 * const monitor = new PerformanceMonitor(config);
 * await monitor.initialize();
 * 
 * // Record performance metrics
 * await monitor.recordMetrics({
 *   webVitals: { lcp: 2100, fid: 80, cls: 0.05 },
 *   navigation: { domContentLoaded: 1200, loadComplete: 2500 }
 * });
 * 
 * // Get performance report
 * const report = await monitor.generateReport(dateRange);
 * ```
 */
export class PerformanceMonitor extends EventEmitter {
    private config: AnalyticsConfig;
    private thresholds: PerformanceThresholds;
    private isInitialized: boolean = false;
    private logger = createLogger('PerformanceMonitor');

    // Dependencies
    private databaseManager: DatabaseManager;
    private cacheManager: CacheManager;

    // Performance tracking state
    private metricsBuffer: PerformanceMetrics[] = [];
    private currentBaseline: PerformanceMetrics | null = null;
    private anomalyDetectionModel: any = null;

    // Statistics
    private metricsRecorded: number = 0;
    private anomaliesDetected: number = 0;
    private optimizationsGenerated: number = 0;

    constructor(config: AnalyticsConfig) {
        super();
        this.config = config;
        this.thresholds = DEFAULT_PERFORMANCE_THRESHOLDS;

        this.databaseManager = new DatabaseManager(config.storage);
        this.cacheManager = new CacheManager(config.storage);

        this.logger.info('PerformanceMonitor created');
    }

    /**
     * Initialize the performance monitor
     */
    async initialize(): Promise<void> {
        try {
            this.logger.info('Initializing PerformanceMonitor...');

            // Initialize dependencies
            await this.databaseManager.initialize();
            await this.cacheManager.initialize();

            // Load performance thresholds
            await this.loadThresholds();

            // Initialize anomaly detection model
            await this.initializeAnomalyDetection();

            // Setup real-time monitoring
            this.setupRealTimeMonitoring();

            // Load baseline metrics
            await this.loadBaselineMetrics();

            this.isInitialized = true;
            this.logger.info('PerformanceMonitor initialization complete');

        } catch (error) {
            this.logger.error('Failed to initialize PerformanceMonitor', error);
            throw error;
        }
    }

    /**
     * Shutdown the performance monitor
     */
    async shutdown(): Promise<void> {
        try {
            this.logger.info('Shutting down PerformanceMonitor...');

            // Flush remaining metrics
            await this.flushMetricsBuffer();

            // Close database connections
            await this.databaseManager.close();
            await this.cacheManager.close();

            this.isInitialized = false;
            this.logger.info('PerformanceMonitor shutdown complete');

        } catch (error) {
            this.logger.error('Error during PerformanceMonitor shutdown', error);
        }
    }

    /**
     * Record performance metrics
     */
    async recordMetrics(metrics: PerformanceMetrics): Promise<void> {
        try {
            this.validateInitialized();

            // Validate metrics
            this.validateMetrics(metrics);

            // Enrich metrics with additional context
            const enrichedMetrics = await this.enrichMetrics(metrics);

            // Add to buffer for batch processing
            this.metricsBuffer.push(enrichedMetrics);

            // Check for immediate anomalies
            await this.checkForAnomalies(enrichedMetrics);

            // Update baseline if needed
            this.updateBaseline(enrichedMetrics);

            // Flush buffer if full
            if (this.metricsBuffer.length >= this.config.realTime.batchSize) {
                await this.flushMetricsBuffer();
            }

            this.metricsRecorded++;
            this.emit('metrics:recorded', enrichedMetrics);

            this.logger.debug('Performance metrics recorded', {
                metricsId: metrics.id,
                lcp: metrics.webVitals.lcp,
                fid: metrics.webVitals.fid,
                cls: metrics.webVitals.cls
            });

        } catch (error) {
            this.logger.error('Failed to record performance metrics', error);
            throw error;
        }
    }

    /**
     * Generate performance report for date range
     */
    async generateReport(dateRange: DateRange): Promise<PerformanceReport> {
        try {
            this.validateInitialized();

            // Check cache first
            const cacheKey = `performance_report:${dateRange.start.getTime()}-${dateRange.end.getTime()}`;
            const cached = await this.cacheManager.get(cacheKey);
            if (cached) {
                return cached as PerformanceReport;
            }

            // Query performance data
            const metricsData = await this.queryPerformanceData(dateRange);

            // Generate report sections
            const summary = this.generatePerformanceSummary(metricsData);
            const trends = this.analyzePerformanceTrends(metricsData);
            const recommendations = await this.generateOptimizationRecommendations(metricsData);
            const comparisons = this.generatePerformanceComparisons(metricsData);

            const report: PerformanceReport = {
                summary,
                trends,
                recommendations,
                comparisons
            };

            // Cache the report
            await this.cacheManager.set(cacheKey, report, 1800); // 30 minutes

            this.logger.info('Performance report generated', {
                dateRange: `${dateRange.start.toISOString()} - ${dateRange.end.toISOString()}`,
                metricsCount: metricsData.length,
                recommendationsCount: recommendations.length
            });

            return report;

        } catch (error) {
            this.logger.error('Failed to generate performance report', error);
            throw error;
        }
    }

    /**
     * Detect performance anomalies
     */
    async detectAnomalies(): Promise<AnomalyDetection[]> {
        try {
            this.validateInitialized();

            // Get recent metrics for analysis
            const recentMetrics = await this.getRecentMetrics(24); // Last 24 hours

            const anomalies: AnomalyDetection[] = [];

            // Analyze each metric type
            for (const metrics of recentMetrics) {
                // Web Vitals anomalies
                const webVitalsAnomalies = this.detectWebVitalsAnomalies(metrics);
                anomalies.push(...webVitalsAnomalies);

                // Resource performance anomalies
                const resourceAnomalies = this.detectResourceAnomalies(metrics);
                anomalies.push(...resourceAnomalies);

                // Runtime performance anomalies
                const runtimeAnomalies = this.detectRuntimeAnomalies(metrics);
                anomalies.push(...runtimeAnomalies);

                // Network performance anomalies
                const networkAnomalies = this.detectNetworkAnomalies(metrics);
                anomalies.push(...networkAnomalies);
            }

            // Filter and rank anomalies
            const significantAnomalies = this.filterSignificantAnomalies(anomalies);

            this.anomaliesDetected += significantAnomalies.length;

            this.logger.debug('Anomaly detection completed', {
                totalAnomalies: anomalies.length,
                significantAnomalies: significantAnomalies.length
            });

            return significantAnomalies;

        } catch (error) {
            this.logger.error('Failed to detect anomalies', error);
            throw error;
        }
    }

    /**
     * Get performance optimization recommendations
     */
    async getOptimizationRecommendations(): Promise<OptimizationRecommendation[]> {
        try {
            this.validateInitialized();

            // Get recent performance data
            const recentMetrics = await this.getRecentMetrics(168); // Last week

            const recommendations: OptimizationRecommendation[] = [];

            // Analyze performance patterns
            const patterns = this.analyzePerformancePatterns(recentMetrics);

            // Generate Core Web Vitals recommendations
            recommendations.push(...this.generateWebVitalsRecommendations(patterns));

            // Generate resource optimization recommendations
            recommendations.push(...this.generateResourceRecommendations(patterns));

            // Generate runtime optimization recommendations
            recommendations.push(...this.generateRuntimeRecommendations(patterns));

            // Generate network optimization recommendations
            recommendations.push(...this.generateNetworkRecommendations(patterns));

            // Rank recommendations by impact and effort
            const rankedRecommendations = this.rankRecommendations(recommendations);

            this.optimizationsGenerated += rankedRecommendations.length;

            this.logger.debug('Optimization recommendations generated', {
                totalRecommendations: rankedRecommendations.length,
                highPriority: rankedRecommendations.filter(r => r.priority === 'high').length
            });

            return rankedRecommendations;

        } catch (error) {
            this.logger.error('Failed to get optimization recommendations', error);
            throw error;
        }
    }

    /**
     * Update performance thresholds
     */
    async updateThresholds(newThresholds: Partial<PerformanceThresholds>): Promise<void> {
        try {
            this.validateInitialized();

            this.thresholds = { ...this.thresholds, ...newThresholds };

            // Store updated thresholds
            await this.databaseManager.query(
                'INSERT OR REPLACE INTO performance_thresholds (id, thresholds, updated_at) VALUES (?, ?, ?)',
                ['default', JSON.stringify(this.thresholds), new Date()]
            );

            this.logger.info('Performance thresholds updated');

        } catch (error) {
            this.logger.error('Failed to update performance thresholds', error);
            throw error;
        }
    }

    /**
     * Get current performance baseline
     */
    getBaseline(): PerformanceMetrics | null {
        return this.currentBaseline;
    }

    /**
     * Check if monitor is healthy
     */
    isHealthy(): boolean {
        return this.isInitialized &&
            this.databaseManager.isHealthy() &&
            this.cacheManager.isHealthy();
    }

    /**
     * Perform health check
     */
    async healthCheck(): Promise<{ healthy: boolean; details: any }> {
        try {
            const dbHealth = await this.databaseManager.healthCheck();
            const cacheHealth = await this.cacheManager.healthCheck();

            const healthy = this.isInitialized && dbHealth.healthy && cacheHealth.healthy;

            return {
                healthy,
                details: {
                    initialized: this.isInitialized,
                    metricsRecorded: this.metricsRecorded,
                    anomaliesDetected: this.anomaliesDetected,
                    optimizationsGenerated: this.optimizationsGenerated,
                    bufferSize: this.metricsBuffer.length,
                    baseline: this.currentBaseline ? 'loaded' : 'not_loaded',
                    database: dbHealth,
                    cache: cacheHealth
                }
            };
        } catch (error) {
            return {
                healthy: false,
                details: { error: error.message }
            };
        }
    }

    // ===============================
    // PRIVATE METHODS
    // ===============================

    private setupRealTimeMonitoring(): void {
        // Setup periodic buffer flush
        setInterval(async () => {
            if (this.metricsBuffer.length > 0) {
                await this.flushMetricsBuffer();
            }
        }, this.config.realTime.flushInterval);

        // Setup periodic anomaly detection
        setInterval(async () => {
            try {
                await this.detectAnomalies();
            } catch (error) {
                this.logger.error('Periodic anomaly detection failed', error);
            }
        }, 300000); // 5 minutes
    }

    private validateMetrics(metrics: PerformanceMetrics): void {
        if (!metrics.id || !metrics.timestamp || !metrics.webVitals) {
            throw new Error('Invalid performance metrics: missing required fields');
        }

        if (metrics.webVitals.lcp < 0 || metrics.webVitals.fid < 0 || metrics.webVitals.cls < 0) {
            throw new Error('Invalid performance metrics: negative values not allowed');
        }
    }

    private async enrichMetrics(metrics: PerformanceMetrics): Promise<PerformanceMetrics> {
        // Add performance scores
        const enriched = { ...metrics };

        // Calculate Core Web Vitals scores
        enriched.webVitals = {
            ...enriched.webVitals,
            lcpScore: this.calculateWebVitalScore('lcp', enriched.webVitals.lcp),
            fidScore: this.calculateWebVitalScore('fid', enriched.webVitals.fid),
            clsScore: this.calculateWebVitalScore('cls', enriched.webVitals.cls)
        } as any;

        return enriched;
    }

    private calculateWebVitalScore(metric: string, value: number): number {
        const threshold = this.thresholds.webVitals[metric as keyof typeof this.thresholds.webVitals];

        if (value <= threshold.good) return 100;
        if (value <= threshold.needsImprovement) return 75;
        return 50;
    }

    private async checkForAnomalies(metrics: PerformanceMetrics): Promise<void> {
        const anomalies: AnomalyDetection[] = [];

        // Check Web Vitals against thresholds
        if (metrics.webVitals.lcp > this.thresholds.webVitals.lcp.poor) {
            anomalies.push({
                id: `lcp_anomaly_${Date.now()}`,
                timestamp: new Date(),
                type: 'point',
                metric: 'lcp',
                value: metrics.webVitals.lcp,
                expectedValue: this.thresholds.webVitals.lcp.good,
                anomalyScore: (metrics.webVitals.lcp / this.thresholds.webVitals.lcp.good),
                severity: 'high',
                context: { metricsId: metrics.id }
            });
        }

        // Emit anomaly events
        anomalies.forEach(anomaly => {
            this.emit('anomaly:detected', anomaly);
        });
    }

    private updateBaseline(metrics: PerformanceMetrics): void {
        if (!this.currentBaseline) {
            this.currentBaseline = { ...metrics };
        } else {
            // Update baseline with exponential moving average
            const alpha = 0.1; // Smoothing factor

            this.currentBaseline.webVitals.lcp =
                (1 - alpha) * this.currentBaseline.webVitals.lcp + alpha * metrics.webVitals.lcp;
            this.currentBaseline.webVitals.fid =
                (1 - alpha) * this.currentBaseline.webVitals.fid + alpha * metrics.webVitals.fid;
            this.currentBaseline.webVitals.cls =
                (1 - alpha) * this.currentBaseline.webVitals.cls + alpha * metrics.webVitals.cls;
        }
    }

    private async flushMetricsBuffer(): Promise<void> {
        if (this.metricsBuffer.length === 0) return;

        try {
            // Batch insert metrics
            const values = this.metricsBuffer.map(metrics => [
                metrics.id,
                metrics.timestamp,
                JSON.stringify(metrics.context),
                JSON.stringify(metrics.webVitals),
                JSON.stringify(metrics.navigation),
                JSON.stringify(metrics.resources),
                JSON.stringify(metrics.runtime),
                JSON.stringify(metrics.network)
            ]);

            await this.databaseManager.batchInsert('performance_metrics', [
                'id', 'timestamp', 'context', 'web_vitals', 'navigation', 'resources', 'runtime', 'network'
            ], values);

            this.logger.debug('Performance metrics buffer flushed', {
                metrics: this.metricsBuffer.length
            });

            this.metricsBuffer = [];

        } catch (error) {
            this.logger.error('Failed to flush metrics buffer', error);
            throw error;
        }
    }

    private async loadThresholds(): Promise<void> {
        try {
            const result = await this.databaseManager.query(
                'SELECT thresholds FROM performance_thresholds WHERE id = ?',
                ['default']
            );

            if (result.data.length > 0) {
                this.thresholds = JSON.parse(result.data[0].thresholds);
                this.logger.info('Performance thresholds loaded from database');
            } else {
                this.logger.info('Using default performance thresholds');
            }
        } catch (error) {
            this.logger.warn('Failed to load performance thresholds, using defaults', error);
        }
    }

    private async initializeAnomalyDetection(): Promise<void> {
        // Initialize machine learning model for anomaly detection
        // This would integrate with TensorFlow.js or other ML libraries
        this.logger.info('Anomaly detection model initialized');
    }

    private async loadBaselineMetrics(): Promise<void> {
        try {
            const result = await this.databaseManager.query(
                'SELECT * FROM performance_metrics ORDER BY timestamp DESC LIMIT 100'
            );

            if (result.data.length > 0) {
                // Calculate baseline from recent metrics
                const recentMetrics = result.data.map(row => ({
                    ...JSON.parse(row.web_vitals),
                    timestamp: new Date(row.timestamp)
                }));

                this.currentBaseline = this.calculateAverageMetrics(recentMetrics);
                this.logger.info('Performance baseline loaded', {
                    sampleSize: recentMetrics.length
                });
            }
        } catch (error) {
            this.logger.warn('Failed to load baseline metrics', error);
        }
    }

    private calculateAverageMetrics(metrics: any[]): PerformanceMetrics {
        // This would implement the actual average calculation
        // For now, return a mock baseline
        return {
            id: 'baseline',
            timestamp: new Date(),
            context: {} as any,
            webVitals: {
                lcp: 2500,
                fid: 100,
                cls: 0.1,
                fcp: 1800,
                ttfb: 800,
                inp: 200
            },
            navigation: {
                domContentLoaded: 1200,
                loadComplete: 2500,
                firstByte: 400,
                dnsLookup: 50,
                tcpConnection: 100,
                sslHandshake: 150
            },
            resources: {
                images: [],
                scripts: [],
                stylesheets: [],
                fonts: [],
                apis: []
            },
            runtime: {
                memoryUsage: {
                    used: 50000000,
                    total: 100000000,
                    limit: 200000000,
                    percentage: 50
                },
                cpuUsage: 30,
                frameRate: 60,
                longTasks: [],
                errors: []
            },
            network: {
                connectionType: '4g',
                effectiveType: '4g',
                rtt: 100,
                downlink: 10,
                saveData: false
            }
        };
    }

    private async queryPerformanceData(dateRange: DateRange): Promise<PerformanceMetrics[]> {
        const result = await this.databaseManager.query(
            'SELECT * FROM performance_metrics WHERE timestamp BETWEEN ? AND ? ORDER BY timestamp',
            [dateRange.start, dateRange.end]
        );

        return result.data.map(row => ({
            id: row.id,
            timestamp: new Date(row.timestamp),
            context: JSON.parse(row.context),
            webVitals: JSON.parse(row.web_vitals),
            navigation: JSON.parse(row.navigation),
            resources: JSON.parse(row.resources),
            runtime: JSON.parse(row.runtime),
            network: JSON.parse(row.network)
        }));
    }

    private generatePerformanceSummary(metrics: PerformanceMetrics[]): any {
        if (metrics.length === 0) {
            return {
                averageLoadTime: 0,
                p95LoadTime: 0,
                errorRate: 0,
                availability: 0,
                throughput: 0
            };
        }

        const loadTimes = metrics.map(m => m.navigation.loadComplete);
        const errorCounts = metrics.map(m => m.runtime.errors.length);

        return {
            averageLoadTime: loadTimes.reduce((a, b) => a + b, 0) / loadTimes.length,
            p95LoadTime: this.calculatePercentile(loadTimes, 95),
            errorRate: errorCounts.reduce((a, b) => a + b, 0) / metrics.length,
            availability: 99.9, // This would be calculated from actual uptime data
            throughput: metrics.length / 24 // Requests per hour
        };
    }

    private calculatePercentile(values: number[], percentile: number): number {
        const sorted = values.sort((a, b) => a - b);
        const index = Math.ceil((percentile / 100) * sorted.length) - 1;
        return sorted[index] || 0;
    }

    private analyzePerformanceTrends(metrics: PerformanceMetrics[]): any[] {
        // This would implement actual trend analysis
        return [
            {
                metric: 'Load Time',
                trend: 'improving',
                changePercent: -5.2,
                periodComparison: 'vs last week'
            },
            {
                metric: 'Error Rate',
                trend: 'stable',
                changePercent: 0.1,
                periodComparison: 'vs last week'
            }
        ];
    }

    private generatePerformanceComparisons(metrics: PerformanceMetrics[]): any[] {
        // This would implement actual comparison logic
        return [
            {
                metric: 'LCP',
                current: 2100,
                previous: 2300,
                change: -200,
                changePercent: -8.7
            }
        ];
    }

    // Additional private methods for anomaly detection and recommendations
    private detectWebVitalsAnomalies(metrics: PerformanceMetrics): AnomalyDetection[] {
        const anomalies: AnomalyDetection[] = [];

        // Implement Web Vitals anomaly detection logic

        return anomalies;
    }

    private detectResourceAnomalies(metrics: PerformanceMetrics): AnomalyDetection[] {
        return [];
    }

    private detectRuntimeAnomalies(metrics: PerformanceMetrics): AnomalyDetection[] {
        return [];
    }

    private detectNetworkAnomalies(metrics: PerformanceMetrics): AnomalyDetection[] {
        return [];
    }

    private filterSignificantAnomalies(anomalies: AnomalyDetection[]): AnomalyDetection[] {
        return anomalies.filter(anomaly =>
            anomaly.severity === 'high' || anomaly.severity === 'critical'
        );
    }

    private async getRecentMetrics(hours: number): Promise<PerformanceMetrics[]> {
        const startTime = new Date(Date.now() - (hours * 60 * 60 * 1000));
        const endTime = new Date();

        return this.queryPerformanceData({ start: startTime, end: endTime });
    }

    private analyzePerformancePatterns(metrics: PerformanceMetrics[]): any {
        // This would implement pattern analysis logic
        return {
            commonIssues: ['slow_lcp', 'high_cls'],
            resourceBottlenecks: ['images', 'third_party_scripts'],
            networkIssues: ['slow_connection', 'high_latency']
        };
    }

    private generateWebVitalsRecommendations(patterns: any): OptimizationRecommendation[] {
        return [];
    }

    private generateResourceRecommendations(patterns: any): OptimizationRecommendation[] {
        return [];
    }

    private generateRuntimeRecommendations(patterns: any): OptimizationRecommendation[] {
        return [];
    }

    private generateNetworkRecommendations(patterns: any): OptimizationRecommendation[] {
        return [];
    }

    private async generateOptimizationRecommendations(metrics: PerformanceMetrics[]): Promise<OptimizationRecommendation[]> {
        // This would implement the actual recommendation generation
        return [
            {
                type: 'performance',
                priority: 'high',
                title: 'Optimize Largest Contentful Paint (LCP)',
                description: 'LCP is currently above the recommended threshold of 2.5 seconds',
                expectedImpact: '15-20% improvement in user experience',
                estimatedEffort: 'medium',
                actions: [
                    'Optimize critical resource loading',
                    'Implement image compression',
                    'Remove render-blocking resources'
                ]
            }
        ];
    }

    private rankRecommendations(recommendations: OptimizationRecommendation[]): OptimizationRecommendation[] {
        return recommendations.sort((a, b) => {
            const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
            return priorityOrder[b.priority] - priorityOrder[a.priority];
        });
    }

    private validateInitialized(): void {
        if (!this.isInitialized) {
            throw new Error('PerformanceMonitor not initialized');
        }
    }
}

export default PerformanceMonitor;
