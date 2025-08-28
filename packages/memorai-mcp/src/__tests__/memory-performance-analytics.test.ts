/**
 * Memory Performance Analytics Engine Tests
 * 
 * Comprehensive test suite for performance monitoring and analytics
 * with real EnhancedMemoryStore integration and data validation.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { EventEmitter } from 'events';
import { EnhancedMemoryStore } from '../enhanced-memory-store.js';
import { MemoryPerformanceAnalytics } from '../memory-performance-analytics.js';
import type {
    PerformanceMetrics,
    MemoryOperationMetrics,
    AnalyticsDashboard,
    AnalyticsConfiguration,
    UsagePattern,
    OptimizationRecommendation,
    PerformanceTrend
} from '../memory-performance-analytics.js';

// Test utilities
function createTestMemoryStore(): EnhancedMemoryStore {
    return new EnhancedMemoryStore({
        azureOpenAI: {
            endpoint: process.env.AZURE_OPENAI_ENDPOINT || 'test-endpoint',
            apiKey: process.env.AZURE_OPENAI_API_KEY || 'test-key',
            deploymentName: process.env.AZURE_OPENAI_DEPLOYMENT_NAME || 'test-deployment',
            apiVersion: process.env.AZURE_OPENAI_API_VERSION || '2024-02-01'
        },
        persistentStorage: false,
        advancedAnalytics: true,
        intelligentSummarization: true,
        crossAgentPermissions: true
    });
}

async function setupTestAnalytics(): Promise<{
    store: EnhancedMemoryStore;
    analytics: MemoryPerformanceAnalytics;
    agentId: string;
}> {
    const store = createTestMemoryStore();
    const analytics = new MemoryPerformanceAnalytics(store);
    const agentId = `analytics-test-agent-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Store test memories for analytics
    await store.store(agentId, 'High-performance database queries optimization techniques', {
        entityType: 'technical_knowledge',
        importance: 9,
        tags: ['database', 'performance', 'optimization']
    });

    await store.store(agentId, 'Machine learning model training strategies for large datasets', {
        entityType: 'technical_knowledge',
        importance: 8,
        tags: ['machine-learning', 'training', 'datasets']
    });

    await store.store(agentId, 'API security best practices and vulnerability mitigation', {
        entityType: 'security_knowledge',
        importance: 9,
        tags: ['api', 'security', 'best-practices']
    });

    return { store, analytics, agentId };
}

describe('MemoryPerformanceAnalytics', () => {
    let store: EnhancedMemoryStore;
    let analytics: MemoryPerformanceAnalytics;
    let agentId: string;

    beforeEach(async () => {
        const setup = await setupTestAnalytics();
        store = setup.store;
        analytics = setup.analytics;
        agentId = setup.agentId;
    });

    afterEach(async () => {
        if (analytics) {
            await analytics.stop();
        }
    });

    describe('Engine Initialization', () => {
        it('should initialize with default configuration', async () => {
            const { analytics: testAnalytics } = await setupTestAnalytics();
            expect(testAnalytics).toBeDefined();

            const config = testAnalytics.getConfiguration();
            expect(config).toBeDefined();
            expect(config.collection.metricsInterval).toBe(60000);
            expect(config.analysis.patternDetectionSensitivity).toBe(0.7);
            expect(config.alerting.enableAlerts).toBe(true);

            await testAnalytics.stop();
        });

        it('should initialize with custom configuration', async () => {
            const customConfig: Partial<AnalyticsConfiguration> = {
                collection: {
                    metricsInterval: 30000,
                    retentionPeriod: 7,
                    aggregationInterval: 1,
                    enableRealtime: false
                },
                analysis: {
                    patternDetectionSensitivity: 0.9,
                    anomalyDetectionThreshold: 0.6,
                    trendAnalysisPeriod: 14,
                    forecastHorizon: 7
                }
            };

            const testAnalytics = new MemoryPerformanceAnalytics(store, customConfig);
            const config = testAnalytics.getConfiguration();

            expect(config.collection.metricsInterval).toBe(30000);
            expect(config.collection.retentionPeriod).toBe(7);
            expect(config.analysis.patternDetectionSensitivity).toBe(0.9);
            expect(config.analysis.anomalyDetectionThreshold).toBe(0.6);

            await testAnalytics.stop();
        });

        it('should support start and stop operations', async () => {
            const { analytics: testAnalytics } = await setupTestAnalytics();

            // Start analytics
            await testAnalytics.start();

            // Stop analytics
            await testAnalytics.stop();

            // Should be able to start again
            await testAnalytics.start();
            await testAnalytics.stop();
        });
    });

    describe('Metrics Collection', () => {
        it('should record operation metrics', async () => {
            const operationMetric: MemoryOperationMetrics = {
                operation: 'store',
                agentId: agentId,
                duration: 150,
                success: true,
                payloadSize: 1024,
                timestamp: new Date(),
                resourceUsage: {
                    cpu: 25.5,
                    memory: 45.2,
                    disk: 10.1
                }
            };

            analytics.recordOperation(operationMetric);

            // Verify operation was recorded by generating dashboard
            const dashboard = await analytics.getDashboard();
            expect(dashboard).toBeDefined();
            expect(dashboard.overview.usage.totalOperations).toBeGreaterThan(0);
        });

        it('should record multiple operation types', async () => {
            const operations: MemoryOperationMetrics[] = [
                {
                    operation: 'store',
                    agentId: agentId,
                    duration: 100,
                    success: true,
                    payloadSize: 512,
                    timestamp: new Date(),
                    resourceUsage: { cpu: 20, memory: 30, disk: 5 }
                },
                {
                    operation: 'recall',
                    agentId: agentId,
                    duration: 75,
                    success: true,
                    payloadSize: 0,
                    resultCount: 5,
                    timestamp: new Date(),
                    resourceUsage: { cpu: 15, memory: 25, disk: 2 }
                },
                {
                    operation: 'search',
                    agentId: agentId,
                    duration: 200,
                    success: true,
                    payloadSize: 256,
                    resultCount: 12,
                    timestamp: new Date(),
                    resourceUsage: { cpu: 35, memory: 40, disk: 8 }
                }
            ];

            operations.forEach(op => analytics.recordOperation(op));

            const dashboard = await analytics.getDashboard();
            expect(dashboard.overview.usage.totalOperations).toBeGreaterThanOrEqual(3);
        });

        it('should handle failed operations', async () => {
            const failedOperation: MemoryOperationMetrics = {
                operation: 'recall',
                agentId: agentId,
                duration: 500,
                success: false,
                errorType: 'timeout',
                payloadSize: 0,
                timestamp: new Date(),
                resourceUsage: { cpu: 50, memory: 60, disk: 15 }
            };

            analytics.recordOperation(failedOperation);

            const dashboard = await analytics.getDashboard();
            expect(dashboard).toBeDefined();

            // Should track error metrics
            const errorIndicator = dashboard.overview.health.indicators.find(
                (indicator: any) => indicator.name === 'Error Rate'
            );
            expect(errorIndicator).toBeDefined();
        });

        it('should emit events for operation recording', async () => {
            const eventPromise = new Promise((resolve) => {
                analytics.once('operationRecorded', resolve);
            });

            const operation: MemoryOperationMetrics = {
                operation: 'delete',
                agentId: agentId,
                duration: 50,
                success: true,
                payloadSize: 0,
                timestamp: new Date(),
                resourceUsage: { cpu: 10, memory: 15, disk: 3 }
            };

            analytics.recordOperation(operation);

            const event = await eventPromise;
            expect(event).toBeDefined();
        });
    });

    describe('Dashboard Generation', () => {
        it('should generate comprehensive analytics dashboard', async () => {
            // Record some test operations
            const operations = [
                { operation: 'store', duration: 120, success: true },
                { operation: 'recall', duration: 80, success: true },
                { operation: 'search', duration: 200, success: false, errorType: 'timeout' },
                { operation: 'update', duration: 150, success: true }
            ];

            operations.forEach((op, index) => {
                analytics.recordOperation({
                    operation: op.operation as any,
                    agentId: `agent-${index}`,
                    duration: op.duration,
                    success: op.success,
                    errorType: op.errorType,
                    payloadSize: Math.floor(Math.random() * 1000),
                    timestamp: new Date(Date.now() - index * 60000),
                    resourceUsage: {
                        cpu: Math.random() * 100,
                        memory: Math.random() * 100,
                        disk: Math.random() * 100
                    }
                });
            });

            const dashboard = await analytics.getDashboard();

            // Validate dashboard structure
            expect(dashboard).toBeDefined();
            expect(dashboard.overview).toBeDefined();
            expect(dashboard.overview.health).toBeDefined();
            expect(dashboard.overview.performance).toBeDefined();
            expect(dashboard.overview.resources).toBeDefined();
            expect(dashboard.overview.usage).toBeDefined();
            expect(dashboard.patterns).toBeDefined();
            expect(dashboard.recommendations).toBeDefined();
            expect(dashboard.alerts).toBeDefined();

            // Validate health metrics
            expect(dashboard.overview.health.score).toBeGreaterThanOrEqual(0);
            expect(dashboard.overview.health.score).toBeLessThanOrEqual(100);
            expect(['excellent', 'good', 'fair', 'poor', 'critical']).toContain(dashboard.overview.health.status);
            expect(Array.isArray(dashboard.overview.health.indicators)).toBe(true);

            // Validate usage statistics
            expect(dashboard.overview.usage.totalOperations).toBeGreaterThanOrEqual(4);
            expect(dashboard.overview.usage.activeAgents).toBeGreaterThanOrEqual(1);
            expect(typeof dashboard.overview.usage.memoryCount).toBe('number');
            expect(typeof dashboard.overview.usage.storageSize).toBe('number');

            // Validate patterns
            expect(dashboard.patterns.detected).toBeDefined();
            expect(dashboard.patterns.emerging).toBeDefined();
            expect(dashboard.patterns.historical).toBeDefined();

            // Validate recommendations
            expect(dashboard.recommendations.critical).toBeDefined();
            expect(dashboard.recommendations.high).toBeDefined();
            expect(dashboard.recommendations.medium).toBeDefined();
            expect(dashboard.recommendations.low).toBeDefined();
        });

        it('should provide health indicators with correct statuses', async () => {
            // Record operations with varying performance
            analytics.recordOperation({
                operation: 'recall',
                agentId: agentId,
                duration: 2500, // Slow operation
                success: true,
                payloadSize: 1024,
                timestamp: new Date(),
                resourceUsage: { cpu: 85, memory: 90, disk: 75 }
            });

            const dashboard = await analytics.getDashboard();
            const indicators = dashboard.overview.health.indicators;

            expect(indicators).toBeDefined();
            expect(Array.isArray(indicators)).toBe(true);
            expect(indicators.length).toBeGreaterThan(0);

            indicators.forEach((indicator: any) => {
                expect(indicator.name).toBeDefined();
                expect(typeof indicator.value).toBe('number');
                expect(['good', 'warning', 'critical']).toContain(indicator.status);
                expect(['improving', 'stable', 'degrading']).toContain(indicator.trend);
            });
        });

        it('should track usage patterns correctly', async () => {
            const dashboard = await analytics.getDashboard();

            // Should have initial seeded patterns
            const allPatterns = [
                ...dashboard.patterns.detected,
                ...dashboard.patterns.emerging,
                ...dashboard.patterns.historical
            ];

            expect(allPatterns.length).toBeGreaterThan(0);

            allPatterns.forEach(pattern => {
                expect(pattern.id).toBeDefined();
                expect(pattern.name).toBeDefined();
                expect(pattern.description).toBeDefined();
                expect(['high', 'medium', 'low']).toContain(pattern.frequency);
                expect(pattern.confidence).toBeGreaterThanOrEqual(0);
                expect(pattern.confidence).toBeLessThanOrEqual(1);
                expect(pattern.pattern.timeOfDay).toBeDefined();
                expect(Array.isArray(pattern.pattern.timeOfDay)).toBe(true);
                expect(pattern.impact.performance).toBeGreaterThanOrEqual(-1);
                expect(pattern.impact.performance).toBeLessThanOrEqual(1);
            });
        });
    });

    describe('Performance Trends', () => {
        it('should generate trends for metrics', async () => {
            const trend = analytics.getTrend('responseTime', '24h');

            expect(trend).toBeDefined();
            expect(trend.metric).toBe('responseTime');
            expect(trend.timeframe).toBe('24h');
            expect(Array.isArray(trend.values)).toBe(true);
            expect(trend.values.length).toBeGreaterThan(0);
            expect(trend.statistics).toBeDefined();
            expect(Array.isArray(trend.forecast)).toBe(true);
            expect(Array.isArray(trend.alerts)).toBe(true);

            // Validate trend values
            trend.values.forEach((value: any) => {
                expect(value.timestamp).toBeInstanceOf(Date);
                expect(typeof value.value).toBe('number');
                expect(typeof value.baseline).toBe('number');
                expect(typeof value.anomaly).toBe('boolean');
            });

            // Validate statistics
            expect(typeof trend.statistics.min).toBe('number');
            expect(typeof trend.statistics.max).toBe('number');
            expect(typeof trend.statistics.mean).toBe('number');
            expect(typeof trend.statistics.median).toBe('number');
            expect(typeof trend.statistics.stdDev).toBe('number');
            expect(typeof trend.statistics.percentile95).toBe('number');
            expect(typeof trend.statistics.percentile99).toBe('number');

            // Validate forecasts
            trend.forecast.forEach((forecast: any) => {
                expect(forecast.timestamp).toBeInstanceOf(Date);
                expect(typeof forecast.predicted).toBe('number');
                expect(forecast.confidence).toBeGreaterThanOrEqual(0);
                expect(forecast.confidence).toBeLessThanOrEqual(1);
                expect(typeof forecast.upper).toBe('number');
                expect(typeof forecast.lower).toBe('number');
            });
        });

        it('should support different timeframes', async () => {
            const timeframes = ['1h', '24h', '7d', '30d', '90d'] as const;

            for (const timeframe of timeframes) {
                const trend = analytics.getTrend('throughput', timeframe);
                expect(trend.timeframe).toBe(timeframe);
                expect(trend.values.length).toBeGreaterThan(0);
            }
        });

        it('should cache trend data', async () => {
            const trend1 = analytics.getTrend('errorRate', '24h');
            const trend2 = analytics.getTrend('errorRate', '24h');

            // Should return same cached instance
            expect(trend1).toBe(trend2);
        });
    });

    describe('Recommendations Engine', () => {
        it('should provide optimization recommendations', async () => {
            const recommendations = analytics.getRecommendations();

            expect(Array.isArray(recommendations)).toBe(true);
            expect(recommendations.length).toBeGreaterThan(0);

            recommendations.forEach((rec: any) => {
                expect(rec.id).toBeDefined();
                expect(['performance', 'resource', 'reliability', 'cost']).toContain(rec.type);
                expect(['critical', 'high', 'medium', 'low']).toContain(rec.priority);
                expect(rec.title).toBeDefined();
                expect(rec.description).toBeDefined();

                // Validate impact scores
                expect(rec.impact.performance).toBeGreaterThanOrEqual(0);
                expect(rec.impact.performance).toBeLessThanOrEqual(1);
                expect(rec.impact.resources).toBeGreaterThanOrEqual(-1);
                expect(rec.impact.resources).toBeLessThanOrEqual(1);

                // Validate implementation details
                expect(rec.implementation).toBeDefined();
                expect(['low', 'medium', 'high']).toContain(rec.implementation.effort);
                expect(Array.isArray(rec.implementation.steps)).toBe(true);
                expect(Array.isArray(rec.implementation.risks)).toBe(true);

                // Validate evidence
                expect(rec.evidence.confidence).toBeGreaterThanOrEqual(0);
                expect(rec.evidence.confidence).toBeLessThanOrEqual(1);
                expect(Array.isArray(rec.evidence.patterns)).toBe(true);
                expect(Array.isArray(rec.evidence.metrics)).toBe(true);
            });
        });

        it('should filter recommendations by type', async () => {
            const performanceRecs = analytics.getRecommendations('performance');
            const resourceRecs = analytics.getRecommendations('resource');

            expect(Array.isArray(performanceRecs)).toBe(true);
            expect(Array.isArray(resourceRecs)).toBe(true);

            performanceRecs.forEach((rec: any) => {
                expect(rec.type).toBe('performance');
            });

            resourceRecs.forEach((rec: any) => {
                expect(rec.type).toBe('resource');
            });
        });

        it('should filter recommendations by priority', async () => {
            const highPriorityRecs = analytics.getRecommendations(undefined, 'high');
            const mediumPriorityRecs = analytics.getRecommendations(undefined, 'medium');

            highPriorityRecs.forEach((rec: any) => {
                expect(rec.priority).toBe('high');
            });

            mediumPriorityRecs.forEach((rec: any) => {
                expect(rec.priority).toBe('medium');
            });
        });

        it('should sort recommendations by priority', async () => {
            const recommendations = analytics.getRecommendations();
            const priorities = recommendations.map((rec: any) => rec.priority);

            // Should be sorted with critical first, then high, medium, low
            const priorityOrder: Record<string, number> = { critical: 4, high: 3, medium: 2, low: 1 };
            for (let i = 1; i < priorities.length; i++) {
                expect(priorityOrder[priorities[i - 1] as string]).toBeGreaterThanOrEqual(priorityOrder[priorities[i] as string]);
            }
        });
    });

    describe('Usage Pattern Analysis', () => {
        it('should detect usage patterns', async () => {
            const patterns = analytics.getUsagePatterns();

            expect(Array.isArray(patterns)).toBe(true);
            expect(patterns.length).toBeGreaterThan(0);

            patterns.forEach((pattern: any) => {
                expect(pattern.id).toBeDefined();
                expect(pattern.name).toBeDefined();
                expect(pattern.description).toBeDefined();
                expect(['high', 'medium', 'low']).toContain(pattern.frequency);

                // Validate pattern structure
                expect(Array.isArray(pattern.pattern.timeOfDay)).toBe(true);
                expect(Array.isArray(pattern.pattern.daysOfWeek)).toBe(true);
                expect(Array.isArray(pattern.pattern.operations)).toBe(true);
                expect(Array.isArray(pattern.pattern.agents)).toBe(true);

                // Validate impact scores
                expect(pattern.impact.performance).toBeGreaterThanOrEqual(-1);
                expect(pattern.impact.performance).toBeLessThanOrEqual(1);
                expect(pattern.impact.resources).toBeGreaterThanOrEqual(-1);
                expect(pattern.impact.resources).toBeLessThanOrEqual(1);
                expect(pattern.impact.reliability).toBeGreaterThanOrEqual(-1);
                expect(pattern.impact.reliability).toBeLessThanOrEqual(1);

                // Validate confidence
                expect(pattern.confidence).toBeGreaterThanOrEqual(0);
                expect(pattern.confidence).toBeLessThanOrEqual(1);

                // Validate dates
                expect(pattern.firstDetected).toBeInstanceOf(Date);
                expect(pattern.lastSeen).toBeInstanceOf(Date);
                expect(pattern.occurrences).toBeGreaterThan(0);
            });
        });

        it('should filter patterns by frequency', async () => {
            const highFreqPatterns = analytics.getUsagePatterns('high');
            const mediumFreqPatterns = analytics.getUsagePatterns('medium');
            const lowFreqPatterns = analytics.getUsagePatterns('low');

            highFreqPatterns.forEach((pattern: any) => {
                expect(pattern.frequency).toBe('high');
            });

            mediumFreqPatterns.forEach((pattern: any) => {
                expect(pattern.frequency).toBe('medium');
            });

            lowFreqPatterns.forEach((pattern: any) => {
                expect(pattern.frequency).toBe('low');
            });
        });

        it('should sort patterns by confidence', async () => {
            const patterns = analytics.getUsagePatterns();

            // Should be sorted by confidence descending
            for (let i = 1; i < patterns.length; i++) {
                expect(patterns[i - 1].confidence).toBeGreaterThanOrEqual(patterns[i].confidence);
            }
        });
    });

    describe('Report Generation', () => {
        it('should generate comprehensive performance report', async () => {
            const report = await analytics.generateReport({
                timeframe: '24h',
                includeRecommendations: true,
                includePatterns: true,
                includeTrends: true,
                format: 'json'
            });

            expect(report).toBeDefined();
            expect(report.metadata).toBeDefined();
            expect(report.metadata.generated).toBeInstanceOf(Date);
            expect(report.metadata.timeframe).toBe('24h');
            expect(report.metadata.version).toBeDefined();

            expect(report.summary).toBeDefined();
            expect(report.summary.health).toBeDefined();
            expect(report.summary.usage).toBeDefined();
            expect(typeof report.summary.alertCount).toBe('number');
            expect(typeof report.summary.patternCount).toBe('number');
            expect(typeof report.summary.recommendationCount).toBe('number');

            expect(report.recommendations).toBeDefined();
            expect(report.patterns).toBeDefined();
            expect(report.trends).toBeDefined();
        });

        it('should generate minimal report when options exclude sections', async () => {
            const report = await analytics.generateReport({
                timeframe: '1h',
                includeRecommendations: false,
                includePatterns: false,
                includeTrends: false
            });

            expect(report.metadata).toBeDefined();
            expect(report.summary).toBeDefined();
            expect(report.recommendations).toBeUndefined();
            expect(report.patterns).toBeUndefined();
            expect(report.trends).toBeUndefined();
        });

        it('should support different timeframes in reports', async () => {
            const timeframes = ['1h', '24h', '7d', '30d', '90d'] as const;

            for (const timeframe of timeframes) {
                const report = await analytics.generateReport({ timeframe });
                expect(report.metadata.timeframe).toBe(timeframe);
            }
        });
    });

    describe('Configuration Management', () => {
        it('should update configuration correctly', async () => {
            const newConfig: Partial<AnalyticsConfiguration> = {
                collection: {
                    metricsInterval: 15000,
                    retentionPeriod: 14,
                    aggregationInterval: 2,
                    enableRealtime: false
                }
            };

            analytics.updateConfiguration(newConfig);
            const updatedConfig = analytics.getConfiguration();

            expect(updatedConfig.collection.metricsInterval).toBe(15000);
            expect(updatedConfig.collection.retentionPeriod).toBe(14);
            expect(updatedConfig.collection.aggregationInterval).toBe(2);
            expect(updatedConfig.collection.enableRealtime).toBe(false);
        });

        it('should preserve unmodified configuration values', async () => {
            const originalConfig = analytics.getConfiguration();
            const originalAlertThreshold = originalConfig.alerting.thresholds.responseTime;

            analytics.updateConfiguration({
                collection: {
                    metricsInterval: 45000,
                    retentionPeriod: 60,
                    aggregationInterval: 10,
                    enableRealtime: true
                }
            });

            const updatedConfig = analytics.getConfiguration();
            expect(updatedConfig.alerting.thresholds.responseTime).toBe(originalAlertThreshold);
        });

        it('should emit configuration update events', async () => {
            const eventPromise = new Promise((resolve) => {
                analytics.once('configurationUpdated', resolve);
            });

            analytics.updateConfiguration({
                analysis: {
                    patternDetectionSensitivity: 0.5,
                    anomalyDetectionThreshold: 0.8,
                    trendAnalysisPeriod: 30,
                    forecastHorizon: 14
                }
            });

            const event = await eventPromise;
            expect(event).toBeDefined();
        });
    });

    describe('Real-time Analytics', () => {
        it('should handle real-time operation analysis', async () => {
            // Record a slow operation that should trigger real-time analysis
            analytics.recordOperation({
                operation: 'search',
                agentId: agentId,
                duration: 1500, // Slow operation
                success: true,
                payloadSize: 2048,
                timestamp: new Date(),
                resourceUsage: { cpu: 75, memory: 85, disk: 60 }
            });

            // Should process the operation in real-time
            const dashboard = await analytics.getDashboard();
            expect(dashboard.alerts.length).toBeGreaterThanOrEqual(0);
        });

        it('should emit operation recorded events', async () => {
            const eventPromise = new Promise((resolve) => {
                analytics.once('operationRecorded', resolve);
            });

            analytics.recordOperation({
                operation: 'store',
                agentId: agentId,
                duration: 100,
                success: true,
                payloadSize: 512,
                timestamp: new Date(),
                resourceUsage: { cpu: 30, memory: 40, disk: 20 }
            });

            const event = await eventPromise;
            expect(event).toBeDefined();
        });
    });

    describe('Event System', () => {
        it('should emit started and stopped events', async () => {
            const startedPromise = new Promise((resolve) => {
                analytics.once('started', resolve);
            });

            const stoppedPromise = new Promise((resolve) => {
                analytics.once('stopped', resolve);
            });

            await analytics.start();
            const startedEvent = await startedPromise;
            expect(startedEvent).toBeDefined();

            await analytics.stop();
            const stoppedEvent = await stoppedPromise;
            expect(stoppedEvent).toBeDefined();
        });

        it('should emit dashboard generation events', async () => {
            const eventPromise = new Promise((resolve) => {
                analytics.once('dashboardGenerated', resolve);
            });

            await analytics.getDashboard();
            const event = await eventPromise;
            expect(event).toBeDefined();
        });

        it('should emit report generation events', async () => {
            const eventPromise = new Promise((resolve) => {
                analytics.once('reportGenerated', resolve);
            });

            await analytics.generateReport({ timeframe: '1h' });
            const event = await eventPromise;
            expect(event).toBeDefined();
        });
    });

    describe('Error Handling', () => {
        it('should handle start when already running', async () => {
            await analytics.start();

            await expect(analytics.start()).rejects.toThrow('Analytics engine is already running');

            await analytics.stop();
        });

        it('should handle stop when not running', async () => {
            // Should not throw when stopping a non-running analytics engine
            await expect(analytics.stop()).resolves.not.toThrow();
        });

        it('should handle invalid operation metrics gracefully', async () => {
            // Test with edge case values
            const edgeCaseOperation: MemoryOperationMetrics = {
                operation: 'recall',
                agentId: '',
                duration: -1,
                success: true,
                payloadSize: 0,
                timestamp: new Date(),
                resourceUsage: { cpu: 0, memory: 0, disk: 0 }
            };

            expect(() => analytics.recordOperation(edgeCaseOperation)).not.toThrow();
        });

        it('should handle missing or invalid trend metrics', async () => {
            const trend = analytics.getTrend('nonexistentMetric', '24h');

            expect(trend).toBeDefined();
            expect(trend.metric).toBe('nonexistentMetric');
            expect(trend.timeframe).toBe('24h');
        });
    });

    describe('Performance Validation', () => {
        it('should process large number of operations efficiently', async () => {
            const startTime = Date.now();

            // Record 1000 operations
            for (let i = 0; i < 1000; i++) {
                analytics.recordOperation({
                    operation: 'recall',
                    agentId: `bulk-agent-${i % 10}`,
                    duration: Math.random() * 200,
                    success: Math.random() > 0.05,
                    payloadSize: Math.floor(Math.random() * 2048),
                    timestamp: new Date(Date.now() - i * 1000),
                    resourceUsage: {
                        cpu: Math.random() * 100,
                        memory: Math.random() * 100,
                        disk: Math.random() * 100
                    }
                });
            }

            const endTime = Date.now();
            const duration = endTime - startTime;

            // Should process 1000 operations in under 1 second
            expect(duration).toBeLessThan(1000);

            // Dashboard generation should still work
            const dashboard = await analytics.getDashboard();
            expect(dashboard.overview.usage.totalOperations).toBeGreaterThanOrEqual(1000);
        });

        it('should maintain memory usage within bounds', async () => {
            const initialMemory = process.memoryUsage().heapUsed;

            // Record many operations to test memory cleanup
            for (let i = 0; i < 15000; i++) {
                analytics.recordOperation({
                    operation: 'store',
                    agentId: `memory-test-${i}`,
                    duration: 50,
                    success: true,
                    payloadSize: 1024,
                    timestamp: new Date(),
                    resourceUsage: { cpu: 25, memory: 35, disk: 15 }
                });
            }

            const finalMemory = process.memoryUsage().heapUsed;
            const memoryIncrease = finalMemory - initialMemory;

            // Memory increase should be reasonable (less than 100MB)
            expect(memoryIncrease).toBeLessThan(100 * 1024 * 1024);
        });
    });
});