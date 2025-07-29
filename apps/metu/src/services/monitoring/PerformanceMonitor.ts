/**
 * METU Performance Monitoring & Analytics System
 * Phase 4: Comprehensive monitoring and analytics
 * 
 * Features:
 * - Real-time performance monitoring
 * - System health tracking
 * - User experience analytics
 * - Performance optimization recommendations
 * - Alerting and notification system
 */

import { EventEmitter } from 'events'
import { PerformanceOptimizer, PerformanceMetrics } from '../performance/PerformanceOptimizer'
import { RomAIAGIService } from '../romai/RomAIAGIService'

export interface SystemHealthMetrics {
    timestamp: number
    cpu: {
        usage: number
        temperature?: number
    }
    memory: {
        used: number
        available: number
        percentage: number
    }
    network: {
        latency: number
        bandwidth: number
        packetsLost: number
    }
    audio: {
        inputLevel: number
        outputLevel: number
        quality: number
        latency: number
    }
    azure: {
        responseTime: number
        availability: boolean
        errorRate: number
        sessionActive: boolean
    }
    mcp: {
        toolsActive: number
        responseTime: number
        successRate: number
        errorRate: number
    }
}

export interface UserExperienceMetrics {
    sessionId: string
    userId: string
    timestamp: number
    interactionType: 'voice' | 'text' | 'ui'
    responseTime: number
    userSatisfaction?: number
    errorOccurred: boolean
    errorType?: string
    features: {
        voiceRecognitionAccuracy: number
        textStreamingDelay: number
        animationFrameRate: number
        audioVisualizationQuality: number
    }
}

export interface PerformanceAlert {
    id: string
    timestamp: number
    severity: 'info' | 'warning' | 'error' | 'critical'
    category: 'performance' | 'system' | 'user_experience' | 'security'
    title: string
    description: string
    metrics: Record<string, number>
    recommendations: string[]
    autoResolve: boolean
    resolved: boolean
}

export interface AnalyticsReport {
    generatedAt: number
    period: {
        start: number
        end: number
    }
    summary: {
        totalInteractions: number
        averageResponseTime: number
        userSatisfactionScore: number
        systemUptime: number
        errorRate: number
    }
    performance: {
        trends: Array<{
            metric: string
            trend: 'improving' | 'stable' | 'degrading'
            change: number
        }>
        bottlenecks: Array<{
            component: string
            impact: 'low' | 'medium' | 'high'
            description: string
        }>
    }
    recommendations: Array<{
        priority: 'low' | 'medium' | 'high' | 'critical'
        category: string
        action: string
        expectedImpact: string
    }>
}

export class PerformanceMonitor extends EventEmitter {
    private optimizer: PerformanceOptimizer
    private romaiService: RomAIAGIService
    private isMonitoring: boolean = false
    private monitoringInterval: NodeJS.Timeout | null = null
    private systemMetrics: SystemHealthMetrics[] = []
    private userMetrics: UserExperienceMetrics[] = []
    private alerts: PerformanceAlert[] = []
    private maxHistorySize: number = 1000
    private alertThresholds: Record<string, { warning: number; critical: number }> = {
        responseTime: { warning: 1000, critical: 2000 },
        errorRate: { warning: 0.05, critical: 0.1 },
        memoryUsage: { warning: 80, critical: 95 },
        cpuUsage: { warning: 80, critical: 95 },
        audioLatency: { warning: 150, critical: 300 }
    }

    constructor(optimizer: PerformanceOptimizer, romaiService: RomAIAGIService) {
        super()
        this.optimizer = optimizer
        this.romaiService = romaiService

        // Setup event listeners
        this.setupEventListeners()
    }

    /**
     * Setup event listeners for monitoring
     */
    private setupEventListeners(): void {
        // Performance optimizer events
        this.optimizer.on('performance-update', (data) => {
            this.handlePerformanceUpdate(data)
        })

        this.optimizer.on('performance-warning', (warning) => {
            this.createAlert('warning', 'performance', warning.type, warning)
        })

        // RomAI service events
        this.romaiService.on('request-processed', (data) => {
            this.trackUserExperience(data)
        })

        this.romaiService.on('request-failed', (data) => {
            this.createAlert('error', 'system', 'RomAI request failed', data)
        })
    }

    /**
     * Start performance monitoring
     */
    public startMonitoring(interval: number = 5000): void {
        if (this.isMonitoring) {
            console.log('⚠️ Performance monitoring already active')
            return
        }

        console.log('📊 Starting METU performance monitoring...')
        this.isMonitoring = true

        // Start periodic monitoring
        this.monitoringInterval = setInterval(() => {
            this.collectSystemMetrics()
        }, interval)

        // Start optimizer monitoring
        this.optimizer.startOptimization()

        console.log('✅ Performance monitoring started')
        this.emit('monitoring-started', { interval })
    }

    /**
     * Stop performance monitoring
     */
    public stopMonitoring(): void {
        if (!this.isMonitoring) {
            return
        }

        console.log('🛑 Stopping performance monitoring...')

        if (this.monitoringInterval) {
            clearInterval(this.monitoringInterval)
            this.monitoringInterval = null
        }

        this.optimizer.stopOptimization()
        this.isMonitoring = false

        console.log('✅ Performance monitoring stopped')
        this.emit('monitoring-stopped')
    }

    /**
     * Collect system health metrics
     */
    private async collectSystemMetrics(): Promise<void> {
        try {
            const timestamp = Date.now()

            // Get system information
            const systemInfo = await this.getSystemInfo()
            const audioInfo = await this.getAudioInfo()
            const azureInfo = await this.getAzureInfo()
            const mcpInfo = await this.getMCPInfo()

            const metrics: SystemHealthMetrics = {
                timestamp,
                cpu: systemInfo.cpu,
                memory: systemInfo.memory,
                network: systemInfo.network,
                audio: audioInfo,
                azure: azureInfo,
                mcp: mcpInfo
            }

            // Store metrics
            this.systemMetrics.push(metrics)

            // Trim history if needed
            if (this.systemMetrics.length > this.maxHistorySize) {
                this.systemMetrics = this.systemMetrics.slice(-this.maxHistorySize)
            }

            // Check for alerts
            this.checkSystemAlerts(metrics)

            // Emit update
            this.emit('system-metrics-update', metrics)

        } catch (error) {
            console.error('❌ Failed to collect system metrics:', error)
            this.createAlert('error', 'system', 'Metrics collection failed', { error })
        }
    }

    /**
     * Get system information
     */
    private async getSystemInfo(): Promise<{
        cpu: { usage: number; temperature?: number }
        memory: { used: number; available: number; percentage: number }
        network: { latency: number; bandwidth: number; packetsLost: number }
    }> {
        // Mock implementation - in production, use actual system monitoring
        const mockLatency = Math.random() * 50 + 10 // 10-60ms
        const mockCpuUsage = Math.random() * 30 + 20 // 20-50%
        const mockMemoryUsage = Math.random() * 40 + 30 // 30-70%

        return {
            cpu: {
                usage: mockCpuUsage,
                temperature: Math.random() * 20 + 45 // 45-65°C
            },
            memory: {
                used: mockMemoryUsage,
                available: 100 - mockMemoryUsage,
                percentage: mockMemoryUsage
            },
            network: {
                latency: mockLatency,
                bandwidth: Math.random() * 100 + 50, // 50-150 Mbps
                packetsLost: Math.random() * 0.01 // 0-1%
            }
        }
    }

    /**
     * Get audio system information
     */
    private async getAudioInfo(): Promise<{
        inputLevel: number
        outputLevel: number
        quality: number
        latency: number
    }> {
        // Mock implementation - in production, integrate with actual audio system
        return {
            inputLevel: Math.random() * 0.8 + 0.1, // 0.1-0.9
            outputLevel: Math.random() * 0.8 + 0.1,
            quality: Math.random() * 0.2 + 0.8, // 0.8-1.0
            latency: Math.random() * 50 + 20 // 20-70ms
        }
    }

    /**
     * Get Azure OpenAI status
     */
    private async getAzureInfo(): Promise<{
        responseTime: number
        availability: boolean
        errorRate: number
        sessionActive: boolean
    }> {
        // Mock implementation - in production, check actual Azure status
        return {
            responseTime: Math.random() * 200 + 100, // 100-300ms
            availability: Math.random() > 0.05, // 95% uptime
            errorRate: Math.random() * 0.02, // 0-2%
            sessionActive: true
        }
    }

    /**
     * Get MCP tools status
     */
    private async getMCPInfo(): Promise<{
        toolsActive: number
        responseTime: number
        successRate: number
        errorRate: number
    }> {
        // Mock implementation - in production, query actual MCP status
        return {
            toolsActive: 4,
            responseTime: Math.random() * 100 + 50, // 50-150ms
            successRate: Math.random() * 0.1 + 0.9, // 90-100%
            errorRate: Math.random() * 0.05 // 0-5%
        }
    }

    /**
     * Handle performance update from optimizer
     */
    private handlePerformanceUpdate(data: { metrics: PerformanceMetrics; timestamp: number }): void {
        // Check for performance issues
        const avgLatency = data.metrics.responseLatency.length > 0
            ? data.metrics.responseLatency.reduce((a, b) => a + b, 0) / data.metrics.responseLatency.length
            : 0

        if (avgLatency > this.alertThresholds.responseTime.critical) {
            this.createAlert('critical', 'performance', 'High response latency', {
                averageLatency: avgLatency,
                threshold: this.alertThresholds.responseTime.critical
            })
        } else if (avgLatency > this.alertThresholds.responseTime.warning) {
            this.createAlert('warning', 'performance', 'Elevated response latency', {
                averageLatency: avgLatency,
                threshold: this.alertThresholds.responseTime.warning
            })
        }
    }

    /**
     * Track user experience metrics
     */
    private trackUserExperience(data: any): void {
        const userMetric: UserExperienceMetrics = {
            sessionId: data.request.id,
            userId: 'default_user',
            timestamp: Date.now(),
            interactionType: 'voice',
            responseTime: data.response.processingTime,
            errorOccurred: !data.response.success,
            errorType: data.response.error || undefined,
            features: {
                voiceRecognitionAccuracy: 0.95,
                textStreamingDelay: Math.random() * 30 + 10,
                animationFrameRate: 60,
                audioVisualizationQuality: 0.9
            }
        }

        this.userMetrics.push(userMetric)

        // Trim history
        if (this.userMetrics.length > this.maxHistorySize) {
            this.userMetrics = this.userMetrics.slice(-this.maxHistorySize)
        }

        this.emit('user-experience-update', userMetric)
    }

    /**
     * Check system metrics for alerts
     */
    private checkSystemAlerts(metrics: SystemHealthMetrics): void {
        // Check CPU usage
        if (metrics.cpu.usage > this.alertThresholds.cpuUsage.critical) {
            this.createAlert('critical', 'system', 'High CPU usage', {
                cpuUsage: metrics.cpu.usage
            })
        }

        // Check memory usage
        if (metrics.memory.percentage > this.alertThresholds.memoryUsage.critical) {
            this.createAlert('critical', 'system', 'High memory usage', {
                memoryUsage: metrics.memory.percentage
            })
        }

        // Check audio latency
        if (metrics.audio.latency > this.alertThresholds.audioLatency.critical) {
            this.createAlert('critical', 'performance', 'High audio latency', {
                audioLatency: metrics.audio.latency
            })
        }

        // Check Azure availability
        if (!metrics.azure.availability) {
            this.createAlert('critical', 'system', 'Azure OpenAI unavailable', {
                azureStatus: 'unavailable'
            })
        }
    }

    /**
     * Create performance alert
     */
    private createAlert(
        severity: PerformanceAlert['severity'],
        category: PerformanceAlert['category'],
        title: string,
        data: any
    ): void {
        const alert: PerformanceAlert = {
            id: `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            timestamp: Date.now(),
            severity,
            category,
            title,
            description: this.generateAlertDescription(title, data),
            metrics: this.extractMetricsFromData(data),
            recommendations: this.generateRecommendations(title, data),
            autoResolve: severity === 'info' || severity === 'warning',
            resolved: false
        }

        this.alerts.push(alert)

        // Trim alerts history
        if (this.alerts.length > 100) {
            this.alerts = this.alerts.slice(-100)
        }

        console.log(`🚨 ${severity.toUpperCase()} Alert: ${title}`)
        this.emit('alert-created', alert)
    }

    /**
     * Generate alert description
     */
    private generateAlertDescription(title: string, data: any): string {
        switch (title) {
            case 'High response latency':
                return `Average response time (${data.averageLatency?.toFixed(0)}ms) exceeds threshold (${data.threshold}ms)`
            case 'High CPU usage':
                return `CPU usage (${data.cpuUsage?.toFixed(1)}%) is critically high`
            case 'High memory usage':
                return `Memory usage (${data.memoryUsage?.toFixed(1)}%) is critically high`
            case 'High audio latency':
                return `Audio latency (${data.audioLatency?.toFixed(0)}ms) exceeds acceptable limits`
            case 'Azure OpenAI unavailable':
                return 'Azure OpenAI service is currently unavailable'
            default:
                return `Performance issue detected: ${title}`
        }
    }

    /**
     * Extract metrics from alert data
     */
    private extractMetricsFromData(data: any): Record<string, number> {
        const metrics: Record<string, number> = {}

        if (typeof data.averageLatency === 'number') metrics.averageLatency = data.averageLatency
        if (typeof data.cpuUsage === 'number') metrics.cpuUsage = data.cpuUsage
        if (typeof data.memoryUsage === 'number') metrics.memoryUsage = data.memoryUsage
        if (typeof data.audioLatency === 'number') metrics.audioLatency = data.audioLatency

        return metrics
    }

    /**
     * Generate recommendations for alerts
     */
    private generateRecommendations(title: string, data: any): string[] {
        switch (title) {
            case 'High response latency':
                return [
                    'Enable response caching optimization',
                    'Check network connectivity',
                    'Reduce concurrent requests',
                    'Consider upgrading server resources'
                ]
            case 'High CPU usage':
                return [
                    'Close unnecessary applications',
                    'Enable CPU usage optimization',
                    'Check for background processes',
                    'Consider hardware upgrade'
                ]
            case 'High memory usage':
                return [
                    'Enable memory management optimization',
                    'Clear cache and temporary data',
                    'Restart the application',
                    'Check for memory leaks'
                ]
            case 'High audio latency':
                return [
                    'Reduce audio buffer size',
                    'Check audio driver settings',
                    'Close other audio applications',
                    'Use dedicated audio interface'
                ]
            default:
                return ['Monitor the situation', 'Check system resources', 'Consider restarting services']
        }
    }

    /**
     * Generate analytics report
     */
    public generateAnalyticsReport(hours: number = 24): AnalyticsReport {
        const now = Date.now()
        const startTime = now - (hours * 60 * 60 * 1000)

        // Filter metrics by time period
        const periodSystemMetrics = this.systemMetrics.filter(m => m.timestamp >= startTime)
        const periodUserMetrics = this.userMetrics.filter(m => m.timestamp >= startTime)
        const periodAlerts = this.alerts.filter(a => a.timestamp >= startTime)

        // Calculate summary statistics
        const totalInteractions = periodUserMetrics.length
        const averageResponseTime = periodUserMetrics.length > 0
            ? periodUserMetrics.reduce((sum, m) => sum + m.responseTime, 0) / periodUserMetrics.length
            : 0
        const errorCount = periodUserMetrics.filter(m => m.errorOccurred).length
        const errorRate = totalInteractions > 0 ? errorCount / totalInteractions : 0

        return {
            generatedAt: now,
            period: { start: startTime, end: now },
            summary: {
                totalInteractions,
                averageResponseTime,
                userSatisfactionScore: 0.85, // Mock value
                systemUptime: 0.99, // Mock value
                errorRate
            },
            performance: {
                trends: this.calculatePerformanceTrends(periodSystemMetrics),
                bottlenecks: this.identifyBottlenecks(periodSystemMetrics, periodAlerts)
            },
            recommendations: this.generateSystemRecommendations(periodAlerts, errorRate, averageResponseTime)
        }
    }

    /**
     * Calculate performance trends
     */
    private calculatePerformanceTrends(metrics: SystemHealthMetrics[]): Array<{
        metric: string
        trend: 'improving' | 'stable' | 'degrading'
        change: number
    }> {
        if (metrics.length < 2) {
            return []
        }

        const first = metrics[0]
        const last = metrics[metrics.length - 1]

        return [
            {
                metric: 'CPU Usage',
                trend: last.cpu.usage < first.cpu.usage ? 'improving' :
                    last.cpu.usage > first.cpu.usage * 1.1 ? 'degrading' : 'stable',
                change: ((last.cpu.usage - first.cpu.usage) / first.cpu.usage) * 100
            },
            {
                metric: 'Memory Usage',
                trend: last.memory.percentage < first.memory.percentage ? 'improving' :
                    last.memory.percentage > first.memory.percentage * 1.1 ? 'degrading' : 'stable',
                change: ((last.memory.percentage - first.memory.percentage) / first.memory.percentage) * 100
            },
            {
                metric: 'Network Latency',
                trend: last.network.latency < first.network.latency ? 'improving' :
                    last.network.latency > first.network.latency * 1.1 ? 'degrading' : 'stable',
                change: ((last.network.latency - first.network.latency) / first.network.latency) * 100
            }
        ]
    }

    /**
     * Identify system bottlenecks
     */
    private identifyBottlenecks(
        metrics: SystemHealthMetrics[],
        alerts: PerformanceAlert[]
    ): Array<{ component: string; impact: 'low' | 'medium' | 'high'; description: string }> {
        const bottlenecks: Array<{ component: string; impact: 'low' | 'medium' | 'high'; description: string }> = []

        // Analyze alerts for bottlenecks
        const criticalAlerts = alerts.filter(a => a.severity === 'critical')
        const warningAlerts = alerts.filter(a => a.severity === 'warning')

        if (criticalAlerts.length > 0) {
            bottlenecks.push({
                component: 'System Performance',
                impact: 'high',
                description: `${criticalAlerts.length} critical issues detected`
            })
        }

        if (warningAlerts.length > 5) {
            bottlenecks.push({
                component: 'System Stability',
                impact: 'medium',
                description: `${warningAlerts.length} warning alerts indicate instability`
            })
        }

        return bottlenecks
    }

    /**
     * Generate system recommendations
     */
    private generateSystemRecommendations(
        alerts: PerformanceAlert[],
        errorRate: number,
        averageResponseTime: number
    ): Array<{
        priority: 'low' | 'medium' | 'high' | 'critical'
        category: string
        action: string
        expectedImpact: string
    }> {
        const recommendations: Array<{
            priority: 'low' | 'medium' | 'high' | 'critical'
            category: string
            action: string
            expectedImpact: string
        }> = []

        // High error rate
        if (errorRate > 0.05) {
            recommendations.push({
                priority: 'critical',
                category: 'Reliability',
                action: 'Investigate and fix error causes',
                expectedImpact: 'Reduce error rate by 70%'
            })
        }

        // High response time
        if (averageResponseTime > 1000) {
            recommendations.push({
                priority: 'high',
                category: 'Performance',
                action: 'Enable performance optimizations',
                expectedImpact: 'Reduce response time by 40%'
            })
        }

        // Too many alerts
        if (alerts.length > 10) {
            recommendations.push({
                priority: 'medium',
                category: 'Monitoring',
                action: 'Review and adjust alert thresholds',
                expectedImpact: 'Reduce alert noise by 50%'
            })
        }

        return recommendations
    }

    /**
     * Get current monitoring status
     */
    public getStatus(): {
        isMonitoring: boolean
        systemMetricsCount: number
        userMetricsCount: number
        activeAlerts: number
        lastUpdate: number | null
    } {
        return {
            isMonitoring: this.isMonitoring,
            systemMetricsCount: this.systemMetrics.length,
            userMetricsCount: this.userMetrics.length,
            activeAlerts: this.alerts.filter(a => !a.resolved).length,
            lastUpdate: this.systemMetrics.length > 0 ? this.systemMetrics[this.systemMetrics.length - 1].timestamp : null
        }
    }

    /**
     * Get recent metrics
     */
    public getRecentMetrics(count: number = 10): {
        system: SystemHealthMetrics[]
        user: UserExperienceMetrics[]
        alerts: PerformanceAlert[]
    } {
        return {
            system: this.systemMetrics.slice(-count),
            user: this.userMetrics.slice(-count),
            alerts: this.alerts.filter(a => !a.resolved).slice(-count)
        }
    }
}

export default PerformanceMonitor
