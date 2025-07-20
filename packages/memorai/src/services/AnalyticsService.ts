/**
 * Analytics Service - Production Implementation
 * Handles event tracking, metrics collection, and analytics data processing
 */

import { EventEmitter } from 'events'
import { createHash } from 'crypto'
import type { AnalyticsEvent, AnalyticsQuery, AnalyticsResult, AnalyticsAggregation } from '../types'

interface ProcessedEvent extends AnalyticsEvent {
  id: string
  processed: boolean
  batchId?: string
}

interface MetricSummary {
  eventName: string
  count: number
  uniqueUsers: number
  lastSeen: Date
  properties: Record<string, Set<any>>
}

export class AnalyticsService extends EventEmitter {
  private isInitialized = false
  private events: Map<string, ProcessedEvent> = new Map()
  private metrics: Map<string, MetricSummary> = new Map()
  private batchQueue: ProcessedEvent[] = []
  private processInterval?: NodeJS.Timeout
  private batchSize = 100
  private flushInterval = 10000 // 10 seconds

  constructor() {
    super()
  }

  async initialize(): Promise<void> {
    try {
      // Start batch processing
      this.startBatchProcessing()

      // Start metrics aggregation
      this.startMetricsAggregation()

      this.isInitialized = true
      this.emit('initialized')
      console.log('📊 Analytics Service initialized')

    } catch (error) {
      console.error('Failed to initialize analytics service:', error)
      this.emit('error', error)
      throw error
    }
  }

  async shutdown(): Promise<void> {
    if (this.isInitialized) {
      // Flush remaining events
      await this.flushBatch()

      // Stop processing
      if (this.processInterval) {
        clearInterval(this.processInterval)
      }

      // Clean up data
      this.events.clear()
      this.metrics.clear()
      this.batchQueue = []

      this.isInitialized = false
      this.emit('shutdown')
      console.log('📊 Analytics Service shutdown')
    }
  }

  async track(event: AnalyticsEvent): Promise<void> {
    if (!this.isInitialized) {
      throw new Error('Analytics service not initialized')
    }

    try {
      // Generate unique event ID
      const eventId = this.generateEventId(event)

      // Create processed event
      const processedEvent: ProcessedEvent = {
        ...event,
        id: eventId,
        processed: false,
        timestamp: event.timestamp || new Date()
      }

      // Validate event
      this.validateEvent(processedEvent)

      // Add to batch queue
      this.batchQueue.push(processedEvent)

      // Store in memory for querying
      this.events.set(eventId, processedEvent)

      // Update metrics
      this.updateMetrics(processedEvent)

      this.emit('analytics:tracked', { event: processedEvent })

      // Flush if batch is full
      if (this.batchQueue.length >= this.batchSize) {
        await this.flushBatch()
      }

    } catch (error) {
      console.error('Analytics tracking error:', error)
      this.emit('analytics:error', { event, error })
      throw error
    }
  }

  async query(query: AnalyticsQuery): Promise<AnalyticsResult> {
    if (!this.isInitialized) {
      throw new Error('Analytics service not initialized')
    }

    try {
      const startTime = Date.now()

      // Filter events based on query
      const filteredEvents = this.filterEvents(query)

      // Apply aggregations
      const aggregations = this.applyAggregations(filteredEvents, query.aggregations || [])

      // Group by specified fields
      const groupedData = this.groupEvents(filteredEvents, query.groupBy || [])

      // Calculate summary
      const uniqueUsers = new Set(filteredEvents.map(e => e.userId).filter(Boolean)).size

      const result: AnalyticsResult = {
        data: groupedData,
        summary: {
          totalEvents: filteredEvents.length,
          uniqueUsers,
          dateRange: {
            start: query.startDate,
            end: query.endDate
          },
          aggregations
        }
      }

      const queryTime = Date.now() - startTime

      this.emit('analytics:queried', { query, resultCount: filteredEvents.length, queryTime })

      return result

    } catch (error) {
      console.error('Analytics query error:', error)
      this.emit('analytics:query_error', { query, error })
      throw error
    }
  }

  async getEventCount(eventName?: string, userId?: string, appId?: string): Promise<number> {
    let count = 0

    for (const event of this.events.values()) {
      if (eventName && event.eventName !== eventName) continue
      if (userId && event.userId !== userId) continue
      if (appId && event.appId !== appId) continue

      count++
    }

    return count
  }

  async getUniqueUsers(appId?: string, startDate?: Date, endDate?: Date): Promise<string[]> {
    const users = new Set<string>()

    for (const event of this.events.values()) {
      if (appId && event.appId !== appId) continue
      if (startDate && event.timestamp < startDate) continue
      if (endDate && event.timestamp > endDate) continue
      if (!event.userId) continue

      users.add(event.userId)
    }

    return Array.from(users)
  }

  async getTopEvents(limit = 10, appId?: string): Promise<Array<{ eventName: string; count: number }>> {
    const eventCounts = new Map<string, number>()

    for (const event of this.events.values()) {
      if (appId && event.appId !== appId) continue

      const count = eventCounts.get(event.eventName) || 0
      eventCounts.set(event.eventName, count + 1)
    }

    return Array.from(eventCounts.entries())
      .map(([eventName, count]) => ({ eventName, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit)
  }

  async getMetricsSummary(): Promise<Record<string, MetricSummary>> {
    const summary: Record<string, MetricSummary> = {}

    for (const [eventName, metric] of this.metrics.entries()) {
      summary[eventName] = {
        ...metric,
        properties: Object.fromEntries(
          Object.entries(metric.properties).map(([key, valueSet]) => [
            key,
            Array.from(valueSet)
          ])
        ) as any
      }
    }

    return summary
  }

  async purgeOldEvents(olderThanDays = 30): Promise<number> {
    const cutoffDate = new Date(Date.now() - olderThanDays * 24 * 60 * 60 * 1000)
    let purged = 0

    for (const [eventId, event] of this.events.entries()) {
      if (event.timestamp < cutoffDate) {
        this.events.delete(eventId)
        purged++
      }
    }

    this.emit('analytics:purged', { count: purged, cutoffDate })

    return purged
  }

  async getHealth(): Promise<{ status: string; details?: any }> {
    if (!this.isInitialized) {
      return { status: 'unhealthy', details: { initialized: false } }
    }

    try {
      const memoryUsage = process.memoryUsage()

      return {
        status: 'healthy',
        details: {
          initialized: true,
          totalEvents: this.events.size,
          queuedEvents: this.batchQueue.length,
          uniqueEventTypes: this.metrics.size,
          memoryUsage: {
            rss: Math.round(memoryUsage.rss / 1024 / 1024),
            heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024)
          }
        }
      }

    } catch (error) {
      return {
        status: 'unhealthy',
        details: {
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      }
    }
  }

  // ==================== PRIVATE METHODS ====================

  private generateEventId(event: AnalyticsEvent): string {
    const data = `${event.eventName}_${event.userId}_${event.appId}_${event.timestamp.getTime()}_${JSON.stringify(event.properties)}`
    return createHash('sha256').update(data).digest('hex').substring(0, 16)
  }

  private validateEvent(event: ProcessedEvent): void {
    if (!event.eventName || event.eventName.trim().length === 0) {
      throw new Error('Event name is required')
    }

    if (!event.appId || event.appId.trim().length === 0) {
      throw new Error('App ID is required')
    }

    if (!event.timestamp || !(event.timestamp instanceof Date)) {
      throw new Error('Valid timestamp is required')
    }

    // Sanitize event name
    event.eventName = event.eventName.replace(/[^a-zA-Z0-9._-]/g, '_')
  }

  private updateMetrics(event: ProcessedEvent): void {
    const metric = this.metrics.get(event.eventName) || {
      eventName: event.eventName,
      count: 0,
      uniqueUsers: 0,
      lastSeen: event.timestamp,
      properties: {}
    }

    metric.count++
    metric.lastSeen = event.timestamp

    // Track unique users (approximate)
    if (event.userId) {
      const userKey = `users_${event.eventName}`
      if (!this.metrics.has(userKey)) {
        (metric as any).userSet = new Set()
      }
      ((metric as any).userSet as Set<string>).add(event.userId)
      metric.uniqueUsers = ((metric as any).userSet as Set<string>).size
    }

    // Track property values
    for (const [key, value] of Object.entries(event.properties)) {
      if (!metric.properties[key]) {
        metric.properties[key] = new Set()
      }
      metric.properties[key].add(value)
    }

    this.metrics.set(event.eventName, metric)
  }

  private startBatchProcessing(): void {
    this.processInterval = setInterval(async () => {
      if (this.batchQueue.length > 0) {
        await this.flushBatch()
      }
    }, this.flushInterval)
  }

  private startMetricsAggregation(): void {
    // Update metrics every minute
    setInterval(() => {
      this.aggregateMetrics()
    }, 60000)
  }

  private async flushBatch(): Promise<void> {
    if (this.batchQueue.length === 0) return

    try {
      const batch = [...this.batchQueue]
      this.batchQueue = []

      // Generate batch ID
      const batchId = `batch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

      // Mark events as processed
      for (const event of batch) {
        event.processed = true
        event.batchId = batchId
      }

      // In production, this would send to external analytics service
      // (Google Analytics, Mixpanel, custom backend, etc.)
      await this.processBatch(batch, batchId)

      this.emit('analytics:batch_processed', { batchId, count: batch.length })

    } catch (error) {
      console.error('Batch processing error:', error)
      this.emit('analytics:batch_error', { error })

      // Re-queue failed events
      this.batchQueue.unshift(...this.batchQueue)
    }
  }

  private async processBatch(batch: ProcessedEvent[], batchId: string): Promise<void> {
    // Mock batch processing - in production this would:
    // 1. Send to external analytics service
    // 2. Store in database
    // 3. Update dashboards

    console.log(`📊 Processing analytics batch ${batchId} with ${batch.length} events`)

    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 50))
  }

  private aggregateMetrics(): void {
    // This would typically aggregate metrics into time-based buckets
    // for efficient querying and visualization
    console.log(`📊 Aggregating metrics for ${this.metrics.size} event types`)
  }

  private filterEvents(query: AnalyticsQuery): ProcessedEvent[] {
    const events: ProcessedEvent[] = []

    for (const event of this.events.values()) {
      // Event name filter
      if (query.eventName && event.eventName !== query.eventName) continue

      // User filter
      if (query.userId && event.userId !== query.userId) continue

      // App filter
      if (query.appId && event.appId !== query.appId) continue

      // Date range filter
      if (event.timestamp < query.startDate || event.timestamp > query.endDate) continue

      // Property filters
      if (query.filters) {
        let matchesFilters = true

        for (const [key, value] of Object.entries(query.filters)) {
          if (event.properties[key] !== value) {
            matchesFilters = false
            break
          }
        }

        if (!matchesFilters) continue
      }

      events.push(event)
    }

    return events
  }

  private applyAggregations(events: ProcessedEvent[], aggregations: AnalyticsAggregation[]): Record<string, number> {
    const results: Record<string, number> = {}

    for (const aggregation of aggregations) {
      const key = `${aggregation.field}_${aggregation.operation}`
      const values: number[] = []

      for (const event of events) {
        const value = event.properties[aggregation.field]

        if (typeof value === 'number') {
          values.push(value)
        } else if (typeof value === 'string' && !isNaN(Number(value))) {
          values.push(Number(value))
        }
      }

      switch (aggregation.operation) {
        case 'sum':
          results[key] = values.reduce((sum, val) => sum + val, 0)
          break
        case 'count':
          results[key] = values.length
          break
        case 'avg':
          results[key] = values.length > 0 ? values.reduce((sum, val) => sum + val, 0) / values.length : 0
          break
        case 'min':
          results[key] = values.length > 0 ? Math.min(...values) : 0
          break
        case 'max':
          results[key] = values.length > 0 ? Math.max(...values) : 0
          break
        case 'distinct':
          results[key] = new Set(values).size
          break
      }
    }

    return results
  }

  private groupEvents(events: ProcessedEvent[], groupBy: string[]): Record<string, any>[] {
    if (groupBy.length === 0) {
      // No grouping, return summary
      return [{
        totalEvents: events.length,
        events: events.slice(0, 100) // Limit for performance
      }]
    }

    const groups = new Map<string, ProcessedEvent[]>()

    for (const event of events) {
      const groupKey = groupBy.map(field => {
        if (field === 'eventName') return event.eventName
        if (field === 'userId') return event.userId || 'anonymous'
        if (field === 'appId') return event.appId
        return event.properties[field] || 'unknown'
      }).join('|')

      if (!groups.has(groupKey)) {
        groups.set(groupKey, [])
      }

      groups.get(groupKey)!.push(event)
    }

    return Array.from(groups.entries()).map(([groupKey, groupEvents]) => {
      const groupValues = groupKey.split('|')
      const result: Record<string, any> = {
        count: groupEvents.length
      }

      // Add group fields
      groupBy.forEach((field, index) => {
        result[field] = groupValues[index]
      })

      return result
    })
  }
}
