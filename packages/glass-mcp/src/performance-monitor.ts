/**
 * Glass MCP v9.0.0 Performance Monitor
 * 
 * Real-time system performance monitoring and optimization
 * with metrics collection, alerting, and auto-scaling capabilities.
 * 
 * @version 9.0.0
 * @author Glass MCP Vision Team
 */

import { EventEmitter } from 'events';
import { performance, PerformanceObserver } from 'perf_hooks';
import * as os from 'os';

/**
 * System resource metrics
 */
export interface SystemMetrics {
    timestamp: number;
    cpu: {
        usage: number; // 0-100
        loadAverage: number[];
        cores: number;
    };
    memory: {
        usedMB: number;
        totalMB: number;
        usage: number; // 0-100
        heapUsedMB: number;
        heapTotalMB: number;
    };
    disk: {
        readMB: number;
        writeMB: number;
    };
    network: {
        bytesReceived: number;
        bytesSent: number;
    };
}

/**
 * Performance metrics for specific operations
 */
export interface OperationMetrics {
    operationId: string;
    operationType: 'vision' | 'automation' | 'intelligence' | 'drawing';
    startTime: number;
    endTime?: number;
    duration?: number;
    memoryUsedMB: number;
    cpuTime: number;
    success: boolean;
    errorMessage?: string;
    metadata?: Record<string, any>;
}

/**
 * Component-specific performance data
 */
export interface ComponentPerformance {
    componentName: string;
    operationCount: number;
    averageDuration: number;
    successRate: number;
    errorRate: number;
    peakMemoryMB: number;
    totalCpuTime: number;
    lastActivity: number;
    status: 'healthy' | 'warning' | 'critical' | 'offline';
}

/**
 * Performance alert definition
 */
export interface PerformanceAlert {
    id: string;
    severity: 'info' | 'warning' | 'critical';
    metric: string;
    threshold: number;
    currentValue: number;
    message: string;
    timestamp: number;
    acknowledged: boolean;
}

/**
 * Performance optimization recommendation
 */
export interface OptimizationRecommendation {
    id: string;
    type: 'memory' | 'cpu' | 'io' | 'concurrency' | 'configuration';
    description: string;
    expectedImpact: 'low' | 'medium' | 'high';
    effort: 'low' | 'medium' | 'high';
    autoApplicable: boolean;
    recommendation: string;
    priority: number;
}

/**
 * Performance monitoring configuration
 */
export interface PerformanceConfig {
    monitoringInterval: number;
    metricsRetention: number;
    alertThresholds: {
        cpuUsage: number;
        memoryUsage: number;
        errorRate: number;
        responseTime: number;
    };
    enableOptimizationRecommendations: boolean;
    enableAutoOptimization: boolean;
    componentsToMonitor: string[];
}

/**
 * Performance dashboard data
 */
export interface PerformanceDashboard {
    systemMetrics: SystemMetrics;
    componentPerformance: ComponentPerformance[];
    activeAlerts: PerformanceAlert[];
    recommendations: OptimizationRecommendation[];
    operationMetrics: OperationMetrics[];
    healthScore: number; // 0-100
    trend: 'improving' | 'stable' | 'degrading';
}

/**
 * Glass MCP Performance Monitor
 * 
 * Monitors system performance, tracks component metrics,
 * generates alerts, and provides optimization recommendations.
 */
export class PerformanceMonitor extends EventEmitter {
    private config: PerformanceConfig;
    private isMonitoring: boolean = false;
    private monitoringInterval?: NodeJS.Timeout;
    private performanceObserver?: PerformanceObserver;

    // Metrics storage
    private systemMetrics: SystemMetrics[] = [];
    private operationMetrics: Map<string, OperationMetrics> = new Map();
    private componentMetrics: Map<string, ComponentPerformance> = new Map();
    private activeAlerts: Map<string, PerformanceAlert> = new Map();
    private recommendations: OptimizationRecommendation[] = [];

    // Performance tracking
    private startTime: number = Date.now();
    private operationCounter: number = 0;
    private lastOptimizationCheck: number = 0;

    constructor(config: Partial<PerformanceConfig> = {}) {
        super();

        this.config = {
            monitoringInterval: 5000,
            metricsRetention: 3600000, // 1 hour
            alertThresholds: {
                cpuUsage: 80,
                memoryUsage: 85,
                errorRate: 10,
                responseTime: 5000
            },
            enableOptimizationRecommendations: true,
            enableAutoOptimization: false,
            componentsToMonitor: ['vision', 'automation', 'intelligence', 'drawing'],
            ...config
        };
    }

    /**
     * Initialize performance monitoring
     */
    public async initialize(): Promise<void> {
        try {
            // Setup performance observer for Node.js metrics
            this.setupPerformanceObserver();

            // Start monitoring loop
            await this.startMonitoring();

            // Initialize component metrics
            this.initializeComponentMetrics();

            this.emit('initialized', {
                config: this.config,
                startTime: this.startTime
            });

            console.log('📊 Performance Monitor initialized successfully');

        } catch (error) {
            this.emit('error', error);
            throw new Error(`Performance monitor initialization failed: ${error}`);
        }
    }

    /**
     * Start operation tracking
     */
    public startOperation(
        operationType: 'vision' | 'automation' | 'intelligence' | 'drawing',
        metadata?: Record<string, any>
    ): string {
        const operationId = `${operationType}_${++this.operationCounter}_${Date.now()}`;

        const operation: OperationMetrics = {
            operationId,
            operationType,
            startTime: performance.now(),
            memoryUsedMB: process.memoryUsage().heapUsed / 1024 / 1024,
            cpuTime: process.cpuUsage().user,
            success: false,
            metadata
        };

        this.operationMetrics.set(operationId, operation);
        return operationId;
    }

    /**
     * End operation tracking
     */
    public endOperation(
        operationId: string,
        success: boolean,
        errorMessage?: string
    ): OperationMetrics | null {
        const operation = this.operationMetrics.get(operationId);
        if (!operation) {
            return null;
        }

        const endTime = performance.now();
        const memoryAfter = process.memoryUsage().heapUsed / 1024 / 1024;
        const cpuAfter = process.cpuUsage().user;

        operation.endTime = endTime;
        operation.duration = endTime - operation.startTime;
        operation.success = success;
        operation.errorMessage = errorMessage;
        operation.memoryUsedMB = memoryAfter - operation.memoryUsedMB;
        operation.cpuTime = cpuAfter - operation.cpuTime;

        // Update component metrics
        this.updateComponentMetrics(operation);

        // Check for performance alerts
        this.checkPerformanceAlerts(operation);

        this.emit('operationCompleted', operation);
        return operation;
    }

    /**
     * Get current performance dashboard
     */
    public getPerformanceDashboard(): PerformanceDashboard {
        const latestSystemMetrics = this.systemMetrics[this.systemMetrics.length - 1] ||
            this.getCurrentSystemMetrics();

        return {
            systemMetrics: latestSystemMetrics,
            componentPerformance: Array.from(this.componentMetrics.values()),
            activeAlerts: Array.from(this.activeAlerts.values()),
            recommendations: this.recommendations,
            operationMetrics: this.getRecentOperationMetrics(20),
            healthScore: this.calculateHealthScore(),
            trend: this.calculateTrend()
        };
    }

    /**
     * Get component performance data
     */
    public getComponentPerformance(componentName: string): ComponentPerformance | null {
        return this.componentMetrics.get(componentName) || null;
    }

    /**
     * Get system metrics history
     */
    public getSystemMetricsHistory(limit?: number): SystemMetrics[] {
        const metrics = this.systemMetrics;
        return limit ? metrics.slice(-limit) : metrics;
    }

    /**
     * Acknowledge performance alert
     */
    public acknowledgeAlert(alertId: string): boolean {
        const alert = this.activeAlerts.get(alertId);
        if (alert) {
            alert.acknowledged = true;
            this.emit('alertAcknowledged', alert);
            return true;
        }
        return false;
    }

    /**
     * Apply optimization recommendation
     */
    public async applyRecommendation(recommendationId: string): Promise<boolean> {
        const recommendation = this.recommendations.find(r => r.id === recommendationId);
        if (!recommendation || !recommendation.autoApplicable) {
            return false;
        }

        try {
            // Apply optimization based on type
            await this.executeOptimization(recommendation);

            // Remove applied recommendation
            this.recommendations = this.recommendations.filter(r => r.id !== recommendationId);

            this.emit('recommendationApplied', recommendation);
            return true;

        } catch (error) {
            this.emit('optimizationError', { recommendation, error });
            return false;
        }
    }

    /**
     * Get performance statistics
     */
    public async getPerformanceStatistics(): Promise<Record<string, any>> {
        const now = Date.now();
        const uptime = now - this.startTime;
        const totalOperations = this.operationCounter;
        const completedOperations = Array.from(this.operationMetrics.values())
            .filter(op => op.endTime !== undefined);
        
        const avgResponseTime = completedOperations.length > 0 ?
            completedOperations.reduce((sum, op) => sum + (op.duration || 0), 0) / completedOperations.length :
            0;

        const successRate = completedOperations.length > 0 ?
            completedOperations.filter(op => op.success).length / completedOperations.length * 100 :
            100;

        return {
            uptime,
            totalOperations,
            completedOperations: completedOperations.length,
            pendingOperations: totalOperations - completedOperations.length,
            averageResponseTime: avgResponseTime,
            successRate,
            activeAlerts: this.activeAlerts.size,
            healthScore: this.calculateHealthScore(),
            memoryUsageMB: process.memoryUsage().heapUsed / 1024 / 1024,
            cpuUsage: await this.getCurrentCpuUsage()
        };
    }    /**
     * Start performance monitoring
     */
    private async startMonitoring(): Promise<void> {
        if (this.isMonitoring) {
            return;
        }

        this.monitoringInterval = setInterval(async () => {
            try {
                // Collect system metrics
                const systemMetrics = this.getCurrentSystemMetrics();
                this.systemMetrics.push(systemMetrics);

                // Cleanup old metrics
                this.cleanupOldMetrics();

                // Check for alerts
                this.checkSystemAlerts(systemMetrics);

                // Generate optimization recommendations
                if (this.config.enableOptimizationRecommendations) {
                    await this.generateOptimizationRecommendations();
                }

                // Auto-apply optimizations if enabled
                if (this.config.enableAutoOptimization) {
                    await this.autoApplyOptimizations();
                }

                this.emit('metricsUpdated', systemMetrics);

            } catch (error) {
                this.emit('monitoringError', error);
            }
        }, this.config.monitoringInterval);

        this.isMonitoring = true;
    }

    /**
     * Setup performance observer for Node.js metrics
     */
    private setupPerformanceObserver(): void {
        if (typeof PerformanceObserver !== 'undefined') {
            this.performanceObserver = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                for (const entry of entries) {
                    if (entry.entryType === 'function' || entry.entryType === 'measure') {
                        this.emit('performanceEntry', entry);
                    }
                }
            });

            this.performanceObserver.observe({
                entryTypes: ['function', 'measure'],
                buffered: true
            });
        }
    }

    /**
     * Get current system metrics
     */
    private getCurrentSystemMetrics(): SystemMetrics {
        const memoryUsage = process.memoryUsage();
        const totalMB = os.totalmem() / 1024 / 1024;
        const freeMB = os.freemem() / 1024 / 1024;
        const usedMB = totalMB - freeMB;

        return {
            timestamp: Date.now(),
            cpu: {
                usage: 0, // Will be calculated asynchronously
                loadAverage: os.loadavg(),
                cores: os.cpus().length
            },
            memory: {
                usedMB,
                totalMB,
                usage: (usedMB / totalMB) * 100,
                heapUsedMB: memoryUsage.heapUsed / 1024 / 1024,
                heapTotalMB: memoryUsage.heapTotal / 1024 / 1024
            },
            disk: {
                readMB: 0, // Would require platform-specific implementation
                writeMB: 0
            },
            network: {
                bytesReceived: 0, // Would require platform-specific implementation
                bytesSent: 0
            }
        };
    }

    /**
     * Get current CPU usage
     */
    private async getCurrentCpuUsage(): Promise<number> {
        const cpus = os.cpus();
        let totalIdle = 0;
        let totalTick = 0;

        for (const cpu of cpus) {
            for (const type in cpu.times) {
                totalTick += cpu.times[type as keyof typeof cpu.times];
            }
            totalIdle += cpu.times.idle;
        }

        return 100 - (totalIdle / totalTick) * 100;
    }

    /**
     * Initialize component metrics
     */
    private initializeComponentMetrics(): void {
        for (const component of this.config.componentsToMonitor) {
            this.componentMetrics.set(component, {
                componentName: component,
                operationCount: 0,
                averageDuration: 0,
                successRate: 100,
                errorRate: 0,
                peakMemoryMB: 0,
                totalCpuTime: 0,
                lastActivity: Date.now(),
                status: 'healthy'
            });
        }
    }

    /**
     * Update component metrics based on operation
     */
    private updateComponentMetrics(operation: OperationMetrics): void {
        const component = this.componentMetrics.get(operation.operationType);
        if (!component) return;

        component.operationCount++;
        component.lastActivity = Date.now();

        if (operation.duration) {
            component.averageDuration = (
                (component.averageDuration * (component.operationCount - 1)) + operation.duration
            ) / component.operationCount;
        }

        if (operation.memoryUsedMB > component.peakMemoryMB) {
            component.peakMemoryMB = operation.memoryUsedMB;
        }

        component.totalCpuTime += operation.cpuTime;

        // Update success/error rates
        const recentOps = this.getRecentOperationsForComponent(operation.operationType, 100);
        const successfulOps = recentOps.filter(op => op.success).length;
        component.successRate = (successfulOps / recentOps.length) * 100;
        component.errorRate = 100 - component.successRate;

        // Update status
        component.status = this.calculateComponentStatus(component);
    }

    /**
     * Calculate component status
     */
    private calculateComponentStatus(component: ComponentPerformance): 'healthy' | 'warning' | 'critical' | 'offline' {
        const now = Date.now();
        const timeSinceLastActivity = now - component.lastActivity;

        if (timeSinceLastActivity > 300000) { // 5 minutes
            return 'offline';
        }

        if (component.errorRate > this.config.alertThresholds.errorRate * 2) {
            return 'critical';
        }

        if (component.errorRate > this.config.alertThresholds.errorRate ||
            component.averageDuration > this.config.alertThresholds.responseTime) {
            return 'warning';
        }

        return 'healthy';
    }

    /**
     * Check for performance alerts based on operation
     */
    private checkPerformanceAlerts(operation: OperationMetrics): void {
        // Response time alert
        if (operation.duration && operation.duration > this.config.alertThresholds.responseTime) {
            this.createAlert(
                'response_time',
                'warning',
                'responseTime',
                this.config.alertThresholds.responseTime,
                operation.duration,
                `Operation ${operation.operationId} exceeded response time threshold`
            );
        }

        // Memory usage alert
        if (operation.memoryUsedMB > this.config.alertThresholds.memoryUsage) {
            this.createAlert(
                'memory_usage',
                'warning',
                'memoryUsage',
                this.config.alertThresholds.memoryUsage,
                operation.memoryUsedMB,
                `Operation ${operation.operationId} used excessive memory`
            );
        }
    }

    /**
     * Check for system-level alerts
     */
    private checkSystemAlerts(metrics: SystemMetrics): void {
        // CPU usage alert
        if (metrics.cpu.usage > this.config.alertThresholds.cpuUsage) {
            this.createAlert(
                'cpu_usage',
                'warning',
                'cpuUsage',
                this.config.alertThresholds.cpuUsage,
                metrics.cpu.usage,
                `System CPU usage is high: ${metrics.cpu.usage.toFixed(1)}%`
            );
        }

        // Memory usage alert
        if (metrics.memory.usage > this.config.alertThresholds.memoryUsage) {
            this.createAlert(
                'memory_usage',
                'warning',
                'memoryUsage',
                this.config.alertThresholds.memoryUsage,
                metrics.memory.usage,
                `System memory usage is high: ${metrics.memory.usage.toFixed(1)}%`
            );
        }
    }

    /**
     * Create performance alert
     */
    private createAlert(
        id: string,
        severity: 'info' | 'warning' | 'critical',
        metric: string,
        threshold: number,
        currentValue: number,
        message: string
    ): void {
        // Avoid duplicate alerts
        if (this.activeAlerts.has(id)) {
            return;
        }

        const alert: PerformanceAlert = {
            id,
            severity,
            metric,
            threshold,
            currentValue,
            message,
            timestamp: Date.now(),
            acknowledged: false
        };

        this.activeAlerts.set(id, alert);
        this.emit('alert', alert);
    }

    /**
     * Generate optimization recommendations
     */
    private async generateOptimizationRecommendations(): Promise<void> {
        const now = Date.now();

        // Only check periodically
        if (now - this.lastOptimizationCheck < 60000) { // 1 minute
            return;
        }

        this.lastOptimizationCheck = now;
        const newRecommendations: OptimizationRecommendation[] = [];

        // Memory optimization recommendations
        const memoryUsage = process.memoryUsage().heapUsed / 1024 / 1024;
        if (memoryUsage > 256) {
            newRecommendations.push({
                id: `memory_opt_${now}`,
                type: 'memory',
                description: 'High memory usage detected',
                expectedImpact: 'medium',
                effort: 'low',
                autoApplicable: true,
                recommendation: 'Trigger garbage collection and clear caches',
                priority: 2
            });
        }

        // Add new recommendations
        for (const rec of newRecommendations) {
            if (!this.recommendations.find(r => r.type === rec.type && r.description === rec.description)) {
                this.recommendations.push(rec);
                this.emit('recommendationGenerated', rec);
            }
        }
    }

    /**
     * Auto-apply optimizations
     */
    private async autoApplyOptimizations(): Promise<void> {
        const autoApplicable = this.recommendations.filter(r => r.autoApplicable);

        for (const rec of autoApplicable) {
            if (rec.priority >= 2) { // Only apply medium+ priority recommendations
                await this.applyRecommendation(rec.id);
            }
        }
    }

    /**
     * Execute specific optimization
     */
    private async executeOptimization(recommendation: OptimizationRecommendation): Promise<void> {
        switch (recommendation.type) {
            case 'memory':
                if (global.gc) {
                    global.gc();
                }
                // Clear internal caches
                this.cleanupOldMetrics();
                break;

            case 'cpu':
                // Reduce monitoring frequency temporarily
                if (this.monitoringInterval) {
                    clearInterval(this.monitoringInterval);
                    await this.startMonitoring();
                }
                break;

            default:
                console.log(`No optimization implementation for type: ${recommendation.type}`);
        }
    }

    /**
     * Calculate overall health score
     */
    private calculateHealthScore(): number {
        const components = Array.from(this.componentMetrics.values());
        if (components.length === 0) return 100;

        let totalScore = 0;
        for (const component of components) {
            let componentScore = 100;

            // Deduct for errors
            componentScore -= component.errorRate;

            // Deduct for slow responses
            if (component.averageDuration > this.config.alertThresholds.responseTime) {
                componentScore -= 20;
            }

            // Deduct based on status
            switch (component.status) {
                case 'warning': componentScore -= 15; break;
                case 'critical': componentScore -= 40; break;
                case 'offline': componentScore -= 60; break;
            }

            totalScore += Math.max(0, componentScore);
        }

        return Math.round(totalScore / components.length);
    }

    /**
     * Calculate performance trend
     */
    private calculateTrend(): 'improving' | 'stable' | 'degrading' {
        const recentMetrics = this.systemMetrics.slice(-10);
        if (recentMetrics.length < 3) return 'stable';

        const recent = recentMetrics.slice(-3);
        const previous = recentMetrics.slice(-6, -3);

        const recentAvgCpu = recent.reduce((sum, m) => sum + m.cpu.usage, 0) / recent.length;
        const previousAvgCpu = previous.reduce((sum, m) => sum + m.cpu.usage, 0) / previous.length;

        const recentAvgMem = recent.reduce((sum, m) => sum + m.memory.usage, 0) / recent.length;
        const previousAvgMem = previous.reduce((sum, m) => sum + m.memory.usage, 0) / previous.length;

        const cpuTrend = recentAvgCpu - previousAvgCpu;
        const memTrend = recentAvgMem - previousAvgMem;

        if (cpuTrend > 5 || memTrend > 5) return 'degrading';
        if (cpuTrend < -5 || memTrend < -5) return 'improving';
        return 'stable';
    }

    /**
     * Get recent operation metrics
     */
    private getRecentOperationMetrics(limit: number): OperationMetrics[] {
        return Array.from(this.operationMetrics.values())
            .filter(op => op.endTime !== undefined)
            .sort((a, b) => (b.endTime || 0) - (a.endTime || 0))
            .slice(0, limit);
    }

    /**
     * Get recent operations for specific component
     */
    private getRecentOperationsForComponent(componentType: string, limit: number): OperationMetrics[] {
        return Array.from(this.operationMetrics.values())
            .filter(op => op.operationType === componentType && op.endTime !== undefined)
            .sort((a, b) => (b.endTime || 0) - (a.endTime || 0))
            .slice(0, limit);
    }

    /**
     * Cleanup old metrics to prevent memory leaks
     */
    private cleanupOldMetrics(): void {
        const now = Date.now();
        const retentionTime = this.config.metricsRetention;

        // Cleanup system metrics
        this.systemMetrics = this.systemMetrics.filter(
            metric => now - metric.timestamp < retentionTime
        );

        // Cleanup operation metrics
        for (const [id, operation] of this.operationMetrics) {
            if (operation.endTime && now - operation.endTime > retentionTime) {
                this.operationMetrics.delete(id);
            }
        }

        // Cleanup acknowledged alerts
        for (const [id, alert] of this.activeAlerts) {
            if (alert.acknowledged && now - alert.timestamp > 300000) { // 5 minutes
                this.activeAlerts.delete(id);
            }
        }
    }

    /**
     * Stop performance monitoring
     */
    public async shutdown(): Promise<void> {
        this.isMonitoring = false;

        if (this.monitoringInterval) {
            clearInterval(this.monitoringInterval);
        }

        if (this.performanceObserver) {
            this.performanceObserver.disconnect();
        }

        this.emit('shutdown', {
            uptime: Date.now() - this.startTime,
            totalOperations: this.operationCounter
        });
    }
}

/**
 * Create and initialize performance monitor
 */
export async function createPerformanceMonitor(
    config?: Partial<PerformanceConfig>
): Promise<PerformanceMonitor> {
    const monitor = new PerformanceMonitor(config);
    await monitor.initialize();
    return monitor;
}