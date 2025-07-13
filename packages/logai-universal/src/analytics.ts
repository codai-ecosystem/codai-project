import { EventEmitter } from 'eventemitter3'
import {
  AnalyticsQuery,
  AnalyticsResult,
  DashboardMetrics,
  AIInsight,
  LogEntry,
  PerformanceMetric,
  ErrorEvent
} from './types'

export class LogAIAnalytics extends EventEmitter {
  private logs: LogEntry[] = []
  private metrics: PerformanceMetric[] = []
  private errors: ErrorEvent[] = []

  constructor() {
    super()
  }

  // Add data for analysis
  addLog(log: LogEntry) {
    this.logs.push(log)
    if (this.logs.length > 10000) {
      this.logs = this.logs.slice(-5000) // Keep last 5000 logs
    }
  }

  addMetric(metric: PerformanceMetric) {
    this.metrics.push(metric)
    if (this.metrics.length > 10000) {
      this.metrics = this.metrics.slice(-5000)
    }
  }

  addError(error: ErrorEvent) {
    this.errors.push(error)
    if (this.errors.length > 1000) {
      this.errors = this.errors.slice(-500)
    }
  }

  // Dashboard Metrics
  getDashboardMetrics(timeRange: { start: Date; end: Date }): DashboardMetrics {
    const filteredLogs = this.logs.filter(log =>
      log.timestamp >= timeRange.start && log.timestamp <= timeRange.end
    )

    const filteredErrors = this.errors.filter(error =>
      error.timestamp >= timeRange.start && error.timestamp <= timeRange.end
    )

    const filteredMetrics = this.metrics.filter(metric =>
      metric.timestamp >= timeRange.start && metric.timestamp <= timeRange.end
    )

    const errorRate = filteredLogs.length > 0
      ? (filteredErrors.length / filteredLogs.length) * 100
      : 0

    const responseTimeMetrics = filteredMetrics.filter(m => m.metric === 'request_duration')
    const averageResponseTime = responseTimeMetrics.length > 0
      ? responseTimeMetrics.reduce((sum, m) => sum + m.value, 0) / responseTimeMetrics.length
      : 0

    const uniqueUsers = new Set(filteredLogs.map(log => log.userId).filter(Boolean))

    // Top errors
    const errorCounts = new Map<string, { count: number; lastSeen: Date }>()
    filteredErrors.forEach(error => {
      const existing = errorCounts.get(error.error)
      if (existing) {
        existing.count++
        if (error.timestamp > existing.lastSeen) {
          existing.lastSeen = error.timestamp
        }
      } else {
        errorCounts.set(error.error, { count: 1, lastSeen: error.timestamp })
      }
    })

    const topErrors = Array.from(errorCounts.entries())
      .map(([error, data]) => ({ error, ...data }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)

    // Performance by app
    const appPerformance = new Map<string, { totalTime: number; count: number; errors: number }>()

    responseTimeMetrics.forEach(metric => {
      const existing = appPerformance.get(metric.app)
      if (existing) {
        existing.totalTime += metric.value
        existing.count++
      } else {
        appPerformance.set(metric.app, { totalTime: metric.value, count: 1, errors: 0 })
      }
    })

    filteredErrors.forEach(error => {
      const existing = appPerformance.get(error.app)
      if (existing) {
        existing.errors++
      } else {
        appPerformance.set(error.app, { totalTime: 0, count: 0, errors: 1 })
      }
    })

    const performance = Array.from(appPerformance.entries()).map(([app, data]) => ({
      app,
      avgResponseTime: data.count > 0 ? data.totalTime / data.count : 0,
      errorCount: data.errors
    }))

    return {
      totalLogs: filteredLogs.length,
      errorRate: Math.round(errorRate * 100) / 100,
      averageResponseTime: Math.round(averageResponseTime * 100) / 100,
      activeUsers: uniqueUsers.size,
      topErrors,
      performance,
      romanian: {
        summary: `${filteredLogs.length} loguri procesate cu ${Math.round(errorRate * 100) / 100}% erori în ${uniqueUsers.size} utilizatori activi`
      }
    }
  }

  // Analytics Queries
  async query(query: AnalyticsQuery): Promise<AnalyticsResult> {
    const filteredMetrics = this.metrics.filter(metric => {
      if (query.app && metric.app !== query.app) return false
      if (metric.metric !== query.metric) return false
      if (metric.timestamp < query.startTime || metric.timestamp > query.endTime) return false
      return true
    })

    // Group by time intervals
    const intervalMs = this.getIntervalMs(query.interval)
    const groups = new Map<number, number[]>()

    filteredMetrics.forEach(metric => {
      const intervalStart = Math.floor(metric.timestamp.getTime() / intervalMs) * intervalMs
      if (!groups.has(intervalStart)) {
        groups.set(intervalStart, [])
      }
      groups.get(intervalStart)!.push(metric.value)
    })

    // Apply aggregation
    const data = Array.from(groups.entries()).map(([timestamp, values]) => {
      let value: number
      switch (query.aggregation) {
        case 'sum':
          value = values.reduce((sum, v) => sum + v, 0)
          break
        case 'avg':
          value = values.reduce((sum, v) => sum + v, 0) / values.length
          break
        case 'count':
          value = values.length
          break
        case 'min':
          value = Math.min(...values)
          break
        case 'max':
          value = Math.max(...values)
          break
        default:
          value = values.reduce((sum, v) => sum + v, 0) / values.length
      }

      return {
        timestamp: new Date(timestamp),
        value: Math.round(value * 100) / 100
      }
    }).sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())

    return {
      data,
      romanian: {
        insights: this.generateInsights(data, query)
      }
    }
  }

  private getIntervalMs(interval: string): number {
    switch (interval) {
      case '1m': return 60 * 1000
      case '5m': return 5 * 60 * 1000
      case '1h': return 60 * 60 * 1000
      case '1d': return 24 * 60 * 60 * 1000
      case '1w': return 7 * 24 * 60 * 60 * 1000
      default: return 60 * 1000
    }
  }

  private generateInsights(data: Array<{ timestamp: Date; value: number }>, query: AnalyticsQuery): string[] {
    const insights: string[] = []

    if (data.length === 0) {
      insights.push('Nu există date pentru intervalul selectat')
      return insights
    }

    const values = data.map(d => d.value)
    const avg = values.reduce((sum, v) => sum + v, 0) / values.length
    const max = Math.max(...values)
    const min = Math.min(...values)

    insights.push(`Valoarea medie: ${Math.round(avg * 100) / 100}`)
    insights.push(`Valoarea maximă: ${max}`)
    insights.push(`Valoarea minimă: ${min}`)

    // Trend analysis
    if (data.length >= 2) {
      const firstHalf = values.slice(0, Math.floor(values.length / 2))
      const secondHalf = values.slice(Math.floor(values.length / 2))

      const firstAvg = firstHalf.reduce((sum, v) => sum + v, 0) / firstHalf.length
      const secondAvg = secondHalf.reduce((sum, v) => sum + v, 0) / secondHalf.length

      const change = ((secondAvg - firstAvg) / firstAvg) * 100

      if (Math.abs(change) > 5) {
        if (change > 0) {
          insights.push(`Tendință crescătoare: +${Math.round(change)}%`)
        } else {
          insights.push(`Tendință descrescătoare: ${Math.round(change)}%`)
        }
      } else {
        insights.push('Valori stabile în perioada analizată')
      }
    }

    return insights
  }

  // AI Insights Generation
  generateAIInsights(): AIInsight[] {
    const insights: AIInsight[] = []
    const now = new Date()

    // Error spike detection
    const recentErrors = this.errors.filter(error =>
      now.getTime() - error.timestamp.getTime() < 60 * 60 * 1000 // Last hour
    )

    if (recentErrors.length > 10) {
      insights.push({
        id: `spike_${Date.now()}`,
        timestamp: now,
        type: 'anomaly',
        confidence: 0.85,
        description: `Unusual spike in errors detected: ${recentErrors.length} errors in the last hour`,
        data: { errorCount: recentErrors.length, timeframe: '1h' },
        actionable: true,
        romanian: {
          title: 'Creștere neobișnuită a erorilor',
          description: `S-au detectat ${recentErrors.length} erori în ultima oră`,
          recommendation: 'Verificați jurnalele pentru a identifica cauza'
        }
      })
    }

    // Performance degradation
    const recentMetrics = this.metrics.filter(metric =>
      metric.metric === 'request_duration' &&
      now.getTime() - metric.timestamp.getTime() < 30 * 60 * 1000 // Last 30 minutes
    )

    if (recentMetrics.length > 0) {
      const avgResponseTime = recentMetrics.reduce((sum, m) => sum + m.value, 0) / recentMetrics.length

      if (avgResponseTime > 1000) { // Over 1 second
        insights.push({
          id: `perf_${Date.now()}`,
          timestamp: now,
          type: 'prediction',
          confidence: 0.75,
          description: `Performance degradation detected: average response time ${Math.round(avgResponseTime)}ms`,
          data: { avgResponseTime, threshold: 1000 },
          actionable: true,
          romanian: {
            title: 'Degradare performanță detectată',
            description: `Timpul mediu de răspuns: ${Math.round(avgResponseTime)}ms`,
            recommendation: 'Optimizați cererile sau verificați resursele serverului'
          }
        })
      }
    }

    // User engagement pattern
    const uniqueUsersToday = new Set(
      this.logs
        .filter(log =>
          log.userId &&
          now.getTime() - log.timestamp.getTime() < 24 * 60 * 60 * 1000
        )
        .map(log => log.userId)
    ).size

    if (uniqueUsersToday > 100) {
      insights.push({
        id: `engagement_${Date.now()}`,
        timestamp: now,
        type: 'pattern',
        confidence: 0.9,
        description: `High user engagement: ${uniqueUsersToday} unique users today`,
        data: { uniqueUsers: uniqueUsersToday },
        actionable: false,
        romanian: {
          title: 'Angajament ridicat al utilizatorilor',
          description: `${uniqueUsersToday} utilizatori unici astăzi`,
          recommendation: 'Continuați strategiile actuale de marketing'
        }
      })
    }

    return insights
  }

  // Real-time analytics
  getRealtimeMetrics() {
    const now = new Date()
    const lastMinute = new Date(now.getTime() - 60 * 1000)

    const recentLogs = this.logs.filter(log => log.timestamp >= lastMinute)
    const recentErrors = this.errors.filter(error => error.timestamp >= lastMinute)
    const recentMetrics = this.metrics.filter(metric => metric.timestamp >= lastMinute)

    return {
      logsPerMinute: recentLogs.length,
      errorsPerMinute: recentErrors.length,
      avgResponseTime: recentMetrics.length > 0
        ? recentMetrics.reduce((sum, m) => sum + m.value, 0) / recentMetrics.length
        : 0,
      activeApps: new Set(recentLogs.map(log => log.app)).size,
      timestamp: now
    }
  }
}
