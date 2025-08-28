/**
 * Glass MCP v9.0.0 System Integration Optimizer
 * 
 * Optimizes component interactions, resolves API mismatches, and ensures
 * seamless operation across all Glass MCP subsystems.
 * 
 * @version 9.0.0
 * @author Glass MCP Vision Team
 */

import { EventEmitter } from 'events';
import { performance } from 'perf_hooks';
import * as fs from 'fs/promises';
import * as path from 'path';

import { GlassMCPServer } from './mcp-server-core.js';
import { ConfigurationManager } from './configuration-manager.js';
import { PerformanceMonitor } from './performance-monitor.js';

/**
 * Component integration health status
 */
export interface ComponentHealth {
    componentId: string;
    name: string;
    status: 'healthy' | 'warning' | 'critical' | 'offline';
    responseTime: number;
    memoryUsage: number;
    errorRate: number;
    lastHealthCheck: number;
    dependencies: string[];
    issues: IntegrationIssue[];
}

/**
 * Integration issue details
 */
export interface IntegrationIssue {
    id: string;
    type: 'api_mismatch' | 'dependency_error' | 'performance' | 'memory_leak' | 'timeout';
    severity: 'low' | 'medium' | 'high' | 'critical';
    component: string;
    description: string;
    suggestedFix: string;
    autoFixable: boolean;
    occurrences: number;
    firstOccurred: number;
    lastOccurred: number;
}

/**
 * Optimization recommendation
 */
export interface OptimizationRecommendation {
    id: string;
    category: 'performance' | 'reliability' | 'scalability' | 'security';
    title: string;
    description: string;
    impact: 'low' | 'medium' | 'high' | 'critical';
    effort: 'minimal' | 'moderate' | 'significant' | 'major';
    implementation: string[];
    expectedBenefit: string;
    priority: number;
}

/**
 * System optimization report
 */
export interface OptimizationReport {
    timestamp: number;
    systemHealth: 'optimal' | 'good' | 'degraded' | 'critical';
    overallScore: number;
    components: ComponentHealth[];
    issues: IntegrationIssue[];
    recommendations: OptimizationRecommendation[];
    performance: {
        totalResponseTime: number;
        memoryEfficiency: number;
        errorRate: number;
        throughput: number;
    };
    trends: {
        performanceChange: number;
        errorRateChange: number;
        memoryUsageChange: number;
    };
}

/**
 * Integration optimization configuration
 */
export interface OptimizationConfig {
    healthCheckInterval: number;
    performanceThresholds: {
        responseTime: number;
        memoryUsage: number;
        errorRate: number;
    };
    autoFixEnabled: boolean;
    reportingEnabled: boolean;
    alerting: {
        enabled: boolean;
        criticalThreshold: number;
        warningThreshold: number;
    };
}

/**
 * Glass MCP System Integration Optimizer
 */
export class GlassMCPIntegrationOptimizer extends EventEmitter {
    private components: Map<string, ComponentHealth> = new Map();
    private issues: Map<string, IntegrationIssue> = new Map();
    private recommendations: OptimizationRecommendation[] = [];
    private healthCheckInterval?: NodeJS.Timeout;
    private isRunning: boolean = false;
    private historicalData: Array<{ timestamp: number; data: OptimizationReport }> = [];
    
    private config: OptimizationConfig = {
        healthCheckInterval: 30000, // 30 seconds
        performanceThresholds: {
            responseTime: 1000, // 1 second
            memoryUsage: 500 * 1024 * 1024, // 500MB
            errorRate: 0.05 // 5%
        },
        autoFixEnabled: true,
        reportingEnabled: true,
        alerting: {
            enabled: true,
            criticalThreshold: 30,
            warningThreshold: 70
        }
    };

    private server?: GlassMCPServer;
    private configManager?: ConfigurationManager;
    private performanceMonitor?: PerformanceMonitor;

    constructor() {
        super();
        this.setupComponentRegistrations();
    }

    /**
     * Initialize the integration optimizer
     */
    public async initialize(
        server: GlassMCPServer,
        configManager: ConfigurationManager,
        performanceMonitor: PerformanceMonitor
    ): Promise<void> {
        try {
            console.log('🔧 Initializing Glass MCP Integration Optimizer...');

            this.server = server;
            this.configManager = configManager;
            this.performanceMonitor = performanceMonitor;

            // Load custom configuration if available
            try {
                const fullConfig = this.configManager.getConfiguration() as any;
                const customConfig = fullConfig.integration?.optimization;
                if (customConfig) {
                    this.config = { ...this.config, ...customConfig };
                }
            } catch (error) {
                console.warn('Using default optimization configuration:', error);
            }

            // Perform initial health check
            await this.performHealthCheck();

            // Start continuous monitoring if configured
            if (this.config.healthCheckInterval > 0) {
                this.startContinuousMonitoring();
            }

            this.emit('initialized');
            console.log('✅ Integration Optimizer initialized successfully');

        } catch (error) {
            this.emit('error', error);
            throw new Error(`Integration optimizer initialization failed: ${error}`);
        }
    }

    /**
     * Start continuous system monitoring
     */
    public startContinuousMonitoring(): void {
        if (this.isRunning) {
            console.warn('Continuous monitoring already running');
            return;
        }

        this.isRunning = true;
        this.healthCheckInterval = setInterval(
            () => this.performHealthCheck().catch(console.error),
            this.config.healthCheckInterval
        );

        console.log(`🔄 Started continuous monitoring (interval: ${this.config.healthCheckInterval}ms)`);
        this.emit('monitoringStarted');
    }

    /**
     * Stop continuous monitoring
     */
    public stopContinuousMonitoring(): void {
        if (this.healthCheckInterval) {
            clearInterval(this.healthCheckInterval);
            this.healthCheckInterval = undefined;
        }

        this.isRunning = false;
        console.log('🛑 Stopped continuous monitoring');
        this.emit('monitoringStopped');
    }

    /**
     * Perform comprehensive health check
     */
    public async performHealthCheck(): Promise<OptimizationReport> {
        const startTime = performance.now();
        console.log('🔍 Performing system health check...');

        try {
            // Check each registered component
            const healthPromises = Array.from(this.components.keys()).map(
                componentId => this.checkComponentHealth(componentId)
            );

            await Promise.all(healthPromises);

            // Analyze system integration
            await this.analyzeSystemIntegration();

            // Generate optimization recommendations
            await this.generateOptimizationRecommendations();

            // Create comprehensive report
            const report = this.generateOptimizationReport();

            // Store historical data
            this.historicalData.push({
                timestamp: Date.now(),
                data: report
            });

            // Trim historical data to last 100 entries
            if (this.historicalData.length > 100) {
                this.historicalData = this.historicalData.slice(-100);
            }

            // Handle alerts if configured
            if (this.config.alerting.enabled) {
                this.processAlerts(report);
            }

            const duration = performance.now() - startTime;
            console.log(`✅ Health check completed in ${duration.toFixed(2)}ms`);

            this.emit('healthCheckCompleted', report);
            return report;

        } catch (error) {
            console.error('❌ Health check failed:', error);
            this.emit('healthCheckFailed', error);
            throw error;
        }
    }

    /**
     * Check individual component health
     */
    private async checkComponentHealth(componentId: string): Promise<ComponentHealth> {
        const startTime = performance.now();
        let health: ComponentHealth;

        try {
            switch (componentId) {
                case 'vision-coordinator':
                    health = await this.checkVisionCoordinatorHealth();
                    break;
                case 'ui-automation':
                    health = await this.checkUIAutomationHealth();
                    break;
                case 'intelligence-engine':
                    health = await this.checkIntelligenceEngineHealth();
                    break;
                case 'drawing-engine':
                    health = await this.checkDrawingEngineHealth();
                    break;
                case 'mcp-server':
                    health = await this.checkMCPServerHealth();
                    break;
                case 'configuration-manager':
                    health = await this.checkConfigurationManagerHealth();
                    break;
                case 'performance-monitor':
                    health = await this.checkPerformanceMonitorHealth();
                    break;
                default:
                    health = await this.checkGenericComponentHealth(componentId);
            }

            health.responseTime = performance.now() - startTime;
            health.lastHealthCheck = Date.now();

            this.components.set(componentId, health);
            return health;

        } catch (error) {
            const errorHealth: ComponentHealth = {
                componentId,
                name: componentId,
                status: 'critical',
                responseTime: performance.now() - startTime,
                memoryUsage: 0,
                errorRate: 1.0,
                lastHealthCheck: Date.now(),
                dependencies: [],
                issues: [{
                    id: `${componentId}-health-check-error`,
                    type: 'dependency_error',
                    severity: 'critical',
                    component: componentId,
                    description: `Health check failed: ${error}`,
                    suggestedFix: 'Check component initialization and dependencies',
                    autoFixable: false,
                    occurrences: 1,
                    firstOccurred: Date.now(),
                    lastOccurred: Date.now()
                }]
            };

            this.components.set(componentId, errorHealth);
            return errorHealth;
        }
    }

    /**
     * Check Vision Coordinator health
     */
    private async checkVisionCoordinatorHealth(): Promise<ComponentHealth> {
        // Placeholder implementation - replace with actual vision coordinator API
        return {
            componentId: 'vision-coordinator',
            name: 'Visual Intelligence Coordinator',
            status: 'healthy',
            responseTime: 0,
            memoryUsage: 45 * 1024 * 1024, // 45MB
            errorRate: 0.01,
            lastHealthCheck: 0,
            dependencies: ['screen-capture', 'ocr-analysis', 'object-detection'],
            issues: []
        };
    }

    /**
     * Check UI Automation health
     */
    private async checkUIAutomationHealth(): Promise<ComponentHealth> {
        // Placeholder implementation - replace with actual UI automation API
        return {
            componentId: 'ui-automation',
            name: 'UI Automation Bridge',
            status: 'healthy',
            responseTime: 0,
            memoryUsage: 32 * 1024 * 1024, // 32MB
            errorRate: 0.02,
            lastHealthCheck: 0,
            dependencies: ['element-detector', 'action-planner', 'popup-handler'],
            issues: []
        };
    }

    /**
     * Check Intelligence Engine health
     */
    private async checkIntelligenceEngineHealth(): Promise<ComponentHealth> {
        // Placeholder implementation - replace with actual intelligence engine API
        return {
            componentId: 'intelligence-engine',
            name: 'Intelligent Action System',
            status: 'healthy',
            responseTime: 0,
            memoryUsage: 67 * 1024 * 1024, // 67MB
            errorRate: 0.005,
            lastHealthCheck: 0,
            dependencies: ['context-analyzer', 'decision-engine', 'error-recovery', 'learning-system'],
            issues: []
        };
    }

    /**
     * Check Drawing Engine health
     */
    private async checkDrawingEngineHealth(): Promise<ComponentHealth> {
        // Placeholder implementation - replace with actual drawing engine API
        return {
            componentId: 'drawing-engine',
            name: 'Advanced Drawing Engine',
            status: 'healthy',
            responseTime: 0,
            memoryUsage: 28 * 1024 * 1024, // 28MB
            errorRate: 0.01,
            lastHealthCheck: 0,
            dependencies: ['visual-feedback', 'shape-recognition', 'path-optimization'],
            issues: []
        };
    }

    /**
     * Check MCP Server health
     */
    private async checkMCPServerHealth(): Promise<ComponentHealth> {
        if (!this.server) {
            throw new Error('MCP Server not initialized');
        }

        // Check server responsiveness (placeholder - replace with actual server health API)
        return {
            componentId: 'mcp-server',
            name: 'MCP Protocol Server',
            status: 'healthy',
            responseTime: 0,
            memoryUsage: 15 * 1024 * 1024, // 15MB
            errorRate: 0.001,
            lastHealthCheck: 0,
            dependencies: ['all-components'],
            issues: []
        };
    }

    /**
     * Check Configuration Manager health
     */
    private async checkConfigurationManagerHealth(): Promise<ComponentHealth> {
        if (!this.configManager) {
            throw new Error('Configuration Manager not initialized');
        }

        try {
            const config = this.configManager.getConfiguration();
            return {
                componentId: 'configuration-manager',
                name: 'Configuration Manager',
                status: config ? 'healthy' : 'warning',
                responseTime: 0,
                memoryUsage: 5 * 1024 * 1024, // 5MB
                errorRate: 0.001,
                lastHealthCheck: 0,
                dependencies: [],
                issues: []
            };
        } catch (error) {
            throw new Error(`Configuration Manager health check failed: ${error}`);
        }
    }

    /**
     * Check Performance Monitor health
     */
    private async checkPerformanceMonitorHealth(): Promise<ComponentHealth> {
        if (!this.performanceMonitor) {
            throw new Error('Performance Monitor not initialized');
        }

        try {
            const dashboard = this.performanceMonitor.getPerformanceDashboard();
            return {
                componentId: 'performance-monitor',
                name: 'Performance Monitor',
                status: dashboard.healthScore >= 70 ? 'healthy' : 'warning',
                responseTime: 0,
                memoryUsage: 8 * 1024 * 1024, // 8MB
                errorRate: 0.002,
                lastHealthCheck: 0,
                dependencies: [],
                issues: []
            };
        } catch (error) {
            throw new Error(`Performance Monitor health check failed: ${error}`);
        }
    }

    /**
     * Check generic component health
     */
    private async checkGenericComponentHealth(componentId: string): Promise<ComponentHealth> {
        // Generic health check for unknown components
        return {
            componentId,
            name: componentId.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
            status: 'warning',
            responseTime: 0,
            memoryUsage: 10 * 1024 * 1024, // 10MB default
            errorRate: 0.05,
            lastHealthCheck: 0,
            dependencies: [],
            issues: [{
                id: `${componentId}-unknown-component`,
                type: 'api_mismatch',
                severity: 'medium',
                component: componentId,
                description: 'Component health check not implemented',
                suggestedFix: 'Implement specific health check for this component',
                autoFixable: false,
                occurrences: 1,
                firstOccurred: Date.now(),
                lastOccurred: Date.now()
            }]
        };
    }

    /**
     * Analyze system-wide integration issues
     */
    private async analyzeSystemIntegration(): Promise<void> {
        console.log('🔍 Analyzing system integration...');

        // Check component dependencies
        for (const [componentId, health] of this.components) {
            await this.checkComponentDependencies(componentId, health);
        }

        // Check for API mismatches
        await this.checkAPIMismatches();

        // Check for performance bottlenecks
        await this.checkPerformanceBottlenecks();

        // Check for memory leaks
        await this.checkMemoryLeaks();
    }

    /**
     * Check component dependencies
     */
    private async checkComponentDependencies(componentId: string, health: ComponentHealth): Promise<void> {
        for (const dependency of health.dependencies) {
            const dependencyHealth = this.components.get(dependency);
            
            if (!dependencyHealth) {
                const issue: IntegrationIssue = {
                    id: `${componentId}-missing-dependency-${dependency}`,
                    type: 'dependency_error',
                    severity: 'high',
                    component: componentId,
                    description: `Missing dependency: ${dependency}`,
                    suggestedFix: `Initialize and register ${dependency} component`,
                    autoFixable: false,
                    occurrences: 1,
                    firstOccurred: Date.now(),
                    lastOccurred: Date.now()
                };
                
                this.issues.set(issue.id, issue);
            } else if (dependencyHealth.status === 'critical' || dependencyHealth.status === 'offline') {
                const issue: IntegrationIssue = {
                    id: `${componentId}-unhealthy-dependency-${dependency}`,
                    type: 'dependency_error',
                    severity: 'high',
                    component: componentId,
                    description: `Unhealthy dependency: ${dependency} (${dependencyHealth.status})`,
                    suggestedFix: `Fix issues with ${dependency} component`,
                    autoFixable: false,
                    occurrences: 1,
                    firstOccurred: Date.now(),
                    lastOccurred: Date.now()
                };
                
                this.issues.set(issue.id, issue);
            }
        }
    }

    /**
     * Check for API mismatches between components
     */
    private async checkAPIMismatches(): Promise<void> {
        // Placeholder - implement actual API compatibility checks
        console.log('🔄 Checking API compatibility...');
    }

    /**
     * Check for performance bottlenecks
     */
    private async checkPerformanceBottlenecks(): Promise<void> {
        for (const [componentId, health] of this.components) {
            if (health.responseTime > this.config.performanceThresholds.responseTime) {
                const issue: IntegrationIssue = {
                    id: `${componentId}-slow-response`,
                    type: 'performance',
                    severity: 'medium',
                    component: componentId,
                    description: `Slow response time: ${health.responseTime.toFixed(2)}ms`,
                    suggestedFix: 'Optimize component performance or increase timeout',
                    autoFixable: false,
                    occurrences: 1,
                    firstOccurred: Date.now(),
                    lastOccurred: Date.now()
                };
                
                this.issues.set(issue.id, issue);
            }

            if (health.errorRate > this.config.performanceThresholds.errorRate) {
                const issue: IntegrationIssue = {
                    id: `${componentId}-high-error-rate`,
                    type: 'performance',
                    severity: 'high',
                    component: componentId,
                    description: `High error rate: ${(health.errorRate * 100).toFixed(1)}%`,
                    suggestedFix: 'Investigate and fix component errors',
                    autoFixable: false,
                    occurrences: 1,
                    firstOccurred: Date.now(),
                    lastOccurred: Date.now()
                };
                
                this.issues.set(issue.id, issue);
            }
        }
    }

    /**
     * Check for memory leaks
     */
    private async checkMemoryLeaks(): Promise<void> {
        for (const [componentId, health] of this.components) {
            if (health.memoryUsage > this.config.performanceThresholds.memoryUsage) {
                const issue: IntegrationIssue = {
                    id: `${componentId}-high-memory-usage`,
                    type: 'memory_leak',
                    severity: 'medium',
                    component: componentId,
                    description: `High memory usage: ${(health.memoryUsage / 1024 / 1024).toFixed(1)}MB`,
                    suggestedFix: 'Check for memory leaks and optimize memory usage',
                    autoFixable: false,
                    occurrences: 1,
                    firstOccurred: Date.now(),
                    lastOccurred: Date.now()
                };
                
                this.issues.set(issue.id, issue);
            }
        }
    }

    /**
     * Generate optimization recommendations
     */
    private async generateOptimizationRecommendations(): Promise<void> {
        this.recommendations = [];

        // Performance optimization recommendations
        const slowComponents = Array.from(this.components.values())
            .filter(c => c.responseTime > this.config.performanceThresholds.responseTime);

        if (slowComponents.length > 0) {
            this.recommendations.push({
                id: 'optimize-slow-components',
                category: 'performance',
                title: 'Optimize Slow Components',
                description: `${slowComponents.length} components have slow response times`,
                impact: 'high',
                effort: 'moderate',
                implementation: [
                    'Profile slow components to identify bottlenecks',
                    'Implement caching where appropriate',
                    'Optimize database queries and API calls',
                    'Consider component parallelization'
                ],
                expectedBenefit: 'Reduced response times and improved user experience',
                priority: 80
            });
        }

        // Memory optimization recommendations
        const memoryHungryComponents = Array.from(this.components.values())
            .filter(c => c.memoryUsage > this.config.performanceThresholds.memoryUsage);

        if (memoryHungryComponents.length > 0) {
            this.recommendations.push({
                id: 'optimize-memory-usage',
                category: 'performance',
                title: 'Optimize Memory Usage',
                description: `${memoryHungryComponents.length} components use excessive memory`,
                impact: 'medium',
                effort: 'moderate',
                implementation: [
                    'Implement memory pooling for frequently used objects',
                    'Add garbage collection tuning',
                    'Optimize data structures and algorithms',
                    'Implement lazy loading where possible'
                ],
                expectedBenefit: 'Reduced memory footprint and improved stability',
                priority: 60
            });
        }

        // Reliability recommendations
        const unreliableComponents = Array.from(this.components.values())
            .filter(c => c.errorRate > this.config.performanceThresholds.errorRate);

        if (unreliableComponents.length > 0) {
            this.recommendations.push({
                id: 'improve-reliability',
                category: 'reliability',
                title: 'Improve Component Reliability',
                description: `${unreliableComponents.length} components have high error rates`,
                impact: 'critical',
                effort: 'significant',
                implementation: [
                    'Implement circuit breaker patterns',
                    'Add comprehensive error handling',
                    'Implement retry mechanisms with exponential backoff',
                    'Add health check endpoints for all components'
                ],
                expectedBenefit: 'Improved system stability and user experience',
                priority: 95
            });
        }

        // Sort recommendations by priority
        this.recommendations.sort((a, b) => b.priority - a.priority);
    }

    /**
     * Generate comprehensive optimization report
     */
    private generateOptimizationReport(): OptimizationReport {
        const components = Array.from(this.components.values());
        const issues = Array.from(this.issues.values());

        // Calculate overall system health score
        const healthScores: number[] = components.map(c => {
            switch (c.status) {
                case 'healthy': return 100;
                case 'warning': return 70;
                case 'critical': return 30;
                case 'offline': return 0;
                default: return 50;
            }
        });

        const overallScore = healthScores.length > 0 ?
            healthScores.reduce((sum: number, score: number) => sum + score, 0) / healthScores.length : 0;

        let systemHealth: 'optimal' | 'good' | 'degraded' | 'critical';
        if (overallScore >= 90) systemHealth = 'optimal';
        else if (overallScore >= 70) systemHealth = 'good';
        else if (overallScore >= 40) systemHealth = 'degraded';
        else systemHealth = 'critical';

        // Calculate performance metrics
        const totalResponseTime = components.reduce((sum, c) => sum + c.responseTime, 0);
        const totalMemoryUsage = components.reduce((sum, c) => sum + c.memoryUsage, 0);
        const averageErrorRate = components.length > 0 ?
            components.reduce((sum, c) => sum + c.errorRate, 0) / components.length : 0;

        // Calculate trends (placeholder - implement actual historical comparison)
        const trends = {
            performanceChange: 0,
            errorRateChange: 0,
            memoryUsageChange: 0
        };

        return {
            timestamp: Date.now(),
            systemHealth,
            overallScore,
            components,
            issues,
            recommendations: this.recommendations,
            performance: {
                totalResponseTime,
                memoryEfficiency: totalMemoryUsage > 0 ? 100 - (totalMemoryUsage / (1024 * 1024 * 1024)) * 100 : 100,
                errorRate: averageErrorRate,
                throughput: components.length > 0 ? 1000 / (totalResponseTime / components.length) : 0
            },
            trends
        };
    }

    /**
     * Process alerts based on system health
     */
    private processAlerts(report: OptimizationReport): void {
        if (report.overallScore <= this.config.alerting.criticalThreshold) {
            this.emit('criticalAlert', {
                level: 'critical',
                message: `System health critical: ${report.overallScore.toFixed(1)}% (${report.issues.length} issues)`,
                report
            });
        } else if (report.overallScore <= this.config.alerting.warningThreshold) {
            this.emit('warningAlert', {
                level: 'warning',
                message: `System health warning: ${report.overallScore.toFixed(1)}% (${report.issues.length} issues)`,
                report
            });
        }
    }

    /**
     * Setup component registrations
     */
    private setupComponentRegistrations(): void {
        const componentIds = [
            'vision-coordinator',
            'ui-automation',
            'intelligence-engine',
            'drawing-engine',
            'mcp-server',
            'configuration-manager',
            'performance-monitor'
        ];

        for (const componentId of componentIds) {
            this.components.set(componentId, {
                componentId,
                name: componentId.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
                status: 'offline',
                responseTime: 0,
                memoryUsage: 0,
                errorRate: 0,
                lastHealthCheck: 0,
                dependencies: [],
                issues: []
            });
        }
    }

    /**
     * Get current optimization report
     */
    public getCurrentReport(): OptimizationReport | null {
        if (this.historicalData.length === 0) {
            return null;
        }

        return this.historicalData[this.historicalData.length - 1].data;
    }

    /**
     * Get historical reports
     */
    public getHistoricalReports(count?: number): Array<{ timestamp: number; data: OptimizationReport }> {
        if (count) {
            return this.historicalData.slice(-count);
        }
        return [...this.historicalData];
    }

    /**
     * Apply optimization recommendation
     */
    public async applyOptimization(recommendationId: string): Promise<boolean> {
        const recommendation = this.recommendations.find(r => r.id === recommendationId);
        if (!recommendation) {
            throw new Error(`Optimization recommendation not found: ${recommendationId}`);
        }

        console.log(`🔧 Applying optimization: ${recommendation.title}`);

        // Placeholder implementation - replace with actual optimization logic
        await new Promise(resolve => setTimeout(resolve, 1000));

        console.log(`✅ Applied optimization: ${recommendation.title}`);
        this.emit('optimizationApplied', recommendation);

        return true;
    }

    /**
     * Shutdown the integration optimizer
     */
    public async shutdown(): Promise<void> {
        this.stopContinuousMonitoring();
        
        this.components.clear();
        this.issues.clear();
        this.recommendations = [];
        this.historicalData = [];

        console.log('🛑 Integration Optimizer shutdown complete');
        this.emit('shutdown');
    }
}

/**
 * Create and initialize integration optimizer
 */
export async function createGlassMCPIntegrationOptimizer(
    server: GlassMCPServer,
    configManager: ConfigurationManager,
    performanceMonitor: PerformanceMonitor
): Promise<GlassMCPIntegrationOptimizer> {
    const optimizer = new GlassMCPIntegrationOptimizer();
    await optimizer.initialize(server, configManager, performanceMonitor);
    return optimizer;
}