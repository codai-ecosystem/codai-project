import { performance } from 'perf_hooks'

// Performance monitoring system for STOCAI
export class STOCAIPerformanceMonitor {
    private metrics: Map<string, number[]> = new Map()
    private apiCallCounts: Map<string, number> = new Map()
    private errorCounts: Map<string, number> = new Map()
    private startTimes: Map<string, number> = new Map()

    // Track API response times
    startOperation(operationId: string, operationType: string): void {
        const startTime = performance.now()
        this.startTimes.set(operationId, startTime)

        // Track API call counts
        const currentCount = this.apiCallCounts.get(operationType) || 0
        this.apiCallCounts.set(operationType, currentCount + 1)
    }

    // End operation and record performance
    endOperation(operationId: string, operationType: string, success: boolean = true): number {
        const startTime = this.startTimes.get(operationId)
        if (!startTime) return 0

        const endTime = performance.now()
        const duration = endTime - startTime

        // Store performance metrics
        if (!this.metrics.has(operationType)) {
            this.metrics.set(operationType, [])
        }
        this.metrics.get(operationType)!.push(duration)

        // Track errors
        if (!success) {
            const errorCount = this.errorCounts.get(operationType) || 0
            this.errorCounts.set(operationType, errorCount + 1)
        }

        // Cleanup
        this.startTimes.delete(operationId)

        return duration
    }

    // Get performance statistics
    getOperationStats(operationType: string): {
        count: number
        averageTime: number
        minTime: number
        maxTime: number
        errorRate: number
        p95Time: number
        p99Time: number
    } {
        const times = this.metrics.get(operationType) || []
        const errors = this.errorCounts.get(operationType) || 0
        const count = this.apiCallCounts.get(operationType) || 0

        if (times.length === 0) {
            return {
                count: 0,
                averageTime: 0,
                minTime: 0,
                maxTime: 0,
                errorRate: 0,
                p95Time: 0,
                p99Time: 0
            }
        }

        const sortedTimes = [...times].sort((a, b) => a - b)
        const sum = times.reduce((acc, time) => acc + time, 0)

        const p95Index = Math.floor(sortedTimes.length * 0.95)
        const p99Index = Math.floor(sortedTimes.length * 0.99)

        return {
            count,
            averageTime: sum / times.length,
            minTime: Math.min(...times),
            maxTime: Math.max(...times),
            errorRate: count > 0 ? (errors / count) * 100 : 0,
            p95Time: sortedTimes[p95Index] || 0,
            p99Time: sortedTimes[p99Index] || 0
        }
    }

    // Get system health metrics
    getSystemHealth(): {
        status: 'healthy' | 'degraded' | 'unhealthy'
        metrics: {
            totalRequests: number
            totalErrors: number
            averageResponseTime: number
            errorRate: number
        }
        recommendations: string[]
    } {
        let totalRequests = 0
        let totalErrors = 0
        let totalResponseTime = 0
        let totalOperations = 0

        // Aggregate metrics across all operations
        for (const [operationType, times] of this.metrics) {
            const requests = this.apiCallCounts.get(operationType) || 0
            const errors = this.errorCounts.get(operationType) || 0
            const avgTime = times.reduce((sum, time) => sum + time, 0) / times.length

            totalRequests += requests
            totalErrors += errors
            totalResponseTime += avgTime * times.length
            totalOperations += times.length
        }

        const errorRate = totalRequests > 0 ? (totalErrors / totalRequests) * 100 : 0
        const averageResponseTime = totalOperations > 0 ? totalResponseTime / totalOperations : 0

        // Determine system health
        let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy'
        const recommendations: string[] = []

        if (errorRate > 10) {
            status = 'unhealthy'
            recommendations.push('High error rate detected - investigate API reliability')
        } else if (errorRate > 5) {
            status = 'degraded'
            recommendations.push('Elevated error rate - monitor closely')
        }

        if (averageResponseTime > 2000) {
            status = status === 'healthy' ? 'degraded' : 'unhealthy'
            recommendations.push('High response times - optimize API performance')
        } else if (averageResponseTime > 1000) {
            recommendations.push('Response times elevated - consider optimization')
        }

        if (totalRequests > 1000) {
            recommendations.push('High request volume - ensure adequate scaling')
        }

        return {
            status,
            metrics: {
                totalRequests,
                totalErrors,
                averageResponseTime,
                errorRate
            },
            recommendations
        }
    }

    // Generate performance report
    generateReport(): string {
        const health = this.getSystemHealth()
        const operations = ['dataset_create', 'dataset_read', 'dataset_update', 'dataset_delete', 'file_upload', 'file_download', 'ai_analysis']

        let report = `
# STOCAI Performance Report
Generated: ${new Date().toISOString()}

## System Health: ${health.status.toUpperCase()}
- Total Requests: ${health.metrics.totalRequests}
- Total Errors: ${health.metrics.totalErrors}
- Average Response Time: ${health.metrics.averageResponseTime.toFixed(2)}ms
- Error Rate: ${health.metrics.errorRate.toFixed(2)}%

## Recommendations:
${health.recommendations.map(rec => `- ${rec}`).join('\n')}

## Operation Details:
`

        for (const operation of operations) {
            const stats = this.getOperationStats(operation)
            if (stats.count > 0) {
                report += `
### ${operation}
- Count: ${stats.count}
- Average Time: ${stats.averageTime.toFixed(2)}ms
- Min Time: ${stats.minTime.toFixed(2)}ms
- Max Time: ${stats.maxTime.toFixed(2)}ms
- P95 Time: ${stats.p95Time.toFixed(2)}ms
- P99 Time: ${stats.p99Time.toFixed(2)}ms
- Error Rate: ${stats.errorRate.toFixed(2)}%
`
            }
        }

        return report
    }

    // Reset all metrics
    reset(): void {
        this.metrics.clear()
        this.apiCallCounts.clear()
        this.errorCounts.clear()
        this.startTimes.clear()
    }

    // Export metrics for external monitoring
    exportMetrics(): {
        timestamp: string
        metrics: Record<string, any>
        health: ReturnType<typeof this.getSystemHealth>
    } {
        const exportData: Record<string, any> = {}

        for (const [operationType, times] of this.metrics) {
            exportData[operationType] = this.getOperationStats(operationType)
        }

        return {
            timestamp: new Date().toISOString(),
            metrics: exportData,
            health: this.getSystemHealth()
        }
    }
}

// Singleton instance for global use
export const performanceMonitor = new STOCAIPerformanceMonitor()

// Decorator for automatic performance monitoring
export function monitored(operationType: string) {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        const originalMethod = descriptor.value

        descriptor.value = async function (...args: any[]) {
            const operationId = `${operationType}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

            performanceMonitor.startOperation(operationId, operationType)

            try {
                const result = await originalMethod.apply(this, args)
                performanceMonitor.endOperation(operationId, operationType, true)
                return result
            } catch (error) {
                performanceMonitor.endOperation(operationId, operationType, false)
                throw error
            }
        }

        return descriptor
    }
}

// Real-time performance tracking
export class RealTimePerformanceTracker {
    private wsConnections: Set<WebSocket> = new Set()
    private intervalId: NodeJS.Timeout | null = null

    startTracking(intervalMs: number = 5000): void {
        if (this.intervalId) {
            clearInterval(this.intervalId)
        }

        this.intervalId = setInterval(() => {
            const metrics = performanceMonitor.exportMetrics()
            this.broadcastMetrics(metrics)
        }, intervalMs)
    }

    stopTracking(): void {
        if (this.intervalId) {
            clearInterval(this.intervalId)
            this.intervalId = null
        }
    }

    addConnection(ws: WebSocket): void {
        this.wsConnections.add(ws)
        ws.on('close', () => {
            this.wsConnections.delete(ws)
        })
    }

    private broadcastMetrics(metrics: any): void {
        const message = JSON.stringify({
            type: 'performance_metrics',
            data: metrics
        })

        this.wsConnections.forEach(ws => {
            if (ws.readyState === WebSocket.OPEN) {
                ws.send(message)
            }
        })
    }
}

export const realTimeTracker = new RealTimePerformanceTracker()
