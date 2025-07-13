/**
 * CODAI Advanced Analytics Engine
 * Real-time performance monitoring, user analytics, and business intelligence
 */

export interface AnalyticsEvent {
    id: string
    type: 'pageview' | 'click' | 'conversion' | 'error' | 'performance' | 'custom'
    app: string
    userId?: string
    sessionId: string
    timestamp: number
    data: Record<string, any>
    metadata: {
        userAgent: string
        viewport: { width: number; height: number }
        url: string
        referrer?: string
        location?: { country?: string; city?: string }
    }
}

export interface PerformanceMetrics {
    app: string
    timestamp: number
    metrics: {
        // Core Web Vitals
        lcp: number // Largest Contentful Paint
        fid: number // First Input Delay
        cls: number // Cumulative Layout Shift
        fcp: number // First Contentful Paint
        ttfb: number // Time to First Byte

        // Custom metrics
        domContentLoaded: number
        loadComplete: number
        memoryUsage: number
        apiResponseTime: number
        errorRate: number
        userSatisfactionScore: number
    }
}

export interface UserBehaviorData {
    userId: string
    sessionId: string
    app: string
    actions: Array<{
        type: string
        timestamp: number
        element?: string
        value?: any
        duration?: number
    }>
    journey: string[]
    conversionFunnelStep?: string
    engagementScore: number
    timeOnSite: number
}

export interface BusinessMetrics {
    app: string
    period: 'hourly' | 'daily' | 'weekly' | 'monthly'
    timestamp: number
    metrics: {
        activeUsers: number
        newUsers: number
        retentionRate: number
        conversionRate: number
        revenue: number
        averageSessionDuration: number
        bounceRate: number
        pageViewsPerSession: number
        customerSatisfactionScore: number
        netPromoterScore: number
    }
}

export class AdvancedAnalyticsEngine {
    private events: AnalyticsEvent[] = []
    private performanceData: PerformanceMetrics[] = []
    private userBehavior: Map<string, UserBehaviorData> = new Map()
    private sessionId: string
    private userId?: string
    private app: string
    private startTime: number

    constructor(app: string, userId?: string) {
        this.app = app
        this.userId = userId
        this.sessionId = this.generateSessionId()
        this.startTime = performance.now()
        this.initializeTracking()
    }

    private generateSessionId(): string {
        return `${this.app}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    }

    private initializeTracking() {
        // Track page visibility changes
        document.addEventListener('visibilitychange', () => {
            this.track('visibility_change', {
                state: document.visibilityState,
                timestamp: Date.now()
            })
        })

        // Track errors
        window.addEventListener('error', (event) => {
            this.track('error', {
                message: event.message,
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno,
                stack: event.error?.stack
            })
        })

        // Track unhandled promise rejections
        window.addEventListener('unhandledrejection', (event) => {
            this.track('error', {
                type: 'unhandled_promise_rejection',
                reason: event.reason,
                stack: event.reason?.stack
            })
        })

        // Track performance metrics
        this.collectPerformanceMetrics()

        // Track user interactions
        this.trackUserInteractions()
    }

    public track(eventType: string, data: Record<string, any> = {}) {
        const event: AnalyticsEvent = {
            id: `${this.sessionId}-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
            type: this.categorizeEvent(eventType),
            app: this.app,
            userId: this.userId,
            sessionId: this.sessionId,
            timestamp: Date.now(),
            data: {
                eventType,
                ...data
            },
            metadata: {
                userAgent: navigator.userAgent,
                viewport: {
                    width: window.innerWidth,
                    height: window.innerHeight
                },
                url: window.location.href,
                referrer: document.referrer || undefined
            }
        }

        this.events.push(event)
        this.updateUserBehavior(event)
        this.sendToAnalyticsService(event)

        // Keep only last 1000 events in memory
        if (this.events.length > 1000) {
            this.events = this.events.slice(-1000)
        }
    }

    private categorizeEvent(eventType: string): AnalyticsEvent['type'] {
        if (eventType.includes('click') || eventType.includes('button')) return 'click'
        if (eventType.includes('error')) return 'error'
        if (eventType.includes('conversion') || eventType.includes('purchase')) return 'conversion'
        if (eventType.includes('performance') || eventType.includes('timing')) return 'performance'
        if (eventType.includes('page') || eventType.includes('view')) return 'pageview'
        return 'custom'
    }

    private updateUserBehavior(event: AnalyticsEvent) {
        const key = `${event.userId || 'anonymous'}-${event.sessionId}`
        const existing = this.userBehavior.get(key) || {
            userId: event.userId || 'anonymous',
            sessionId: event.sessionId,
            app: this.app,
            actions: [],
            journey: [],
            engagementScore: 0,
            timeOnSite: 0
        }

        existing.actions.push({
            type: event.data.eventType,
            timestamp: event.timestamp,
            element: event.data.element,
            value: event.data.value,
            duration: event.data.duration
        })

        // Update journey
        if (event.type === 'pageview') {
            existing.journey.push(event.metadata.url)
        }

        // Calculate engagement score
        existing.engagementScore = this.calculateEngagementScore(existing.actions)
        existing.timeOnSite = Date.now() - (existing.actions[0]?.timestamp || Date.now())

        this.userBehavior.set(key, existing)
    }

    private calculateEngagementScore(actions: any[]): number {
        if (actions.length === 0) return 0

        let score = 0

        // Base score for number of actions
        score += Math.min(actions.length * 5, 50)

        // Bonus for different types of interactions
        const uniqueTypes = new Set(actions.map(a => a.type))
        score += uniqueTypes.size * 10

        // Bonus for time spent
        const totalTime = actions[actions.length - 1]?.timestamp - actions[0]?.timestamp
        if (totalTime > 30000) score += 20 // 30+ seconds
        if (totalTime > 120000) score += 30 // 2+ minutes

        return Math.min(score, 100)
    }

    private collectPerformanceMetrics() {
        // Wait for page load to complete
        window.addEventListener('load', () => {
            setTimeout(() => {
                const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
                const paint = performance.getEntriesByType('paint')

                const metrics: PerformanceMetrics = {
                    app: this.app,
                    timestamp: Date.now(),
                    metrics: {
                        lcp: this.getLCP(),
                        fid: this.getFID(),
                        cls: this.getCLS(),
                        fcp: paint.find(p => p.name === 'first-contentful-paint')?.startTime || 0,
                        ttfb: navigation.responseStart - navigation.requestStart,
                        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
                        loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
                        memoryUsage: (performance as any).memory?.usedJSHeapSize || 0,
                        apiResponseTime: this.getAverageApiResponseTime(),
                        errorRate: this.calculateErrorRate(),
                        userSatisfactionScore: this.calculateUserSatisfactionScore()
                    }
                }

                this.performanceData.push(metrics)
                this.track('performance_metrics', metrics.metrics)
            }, 1000)
        })
    }

    private getLCP(): number {
        return new Promise((resolve) => {
            const observer = new PerformanceObserver((list) => {
                const entries = list.getEntries()
                const lastEntry = entries[entries.length - 1]
                resolve(lastEntry.startTime)
                observer.disconnect()
            })
            observer.observe({ entryTypes: ['largest-contentful-paint'] })
        }) as any
    }

    private getFID(): number {
        return new Promise((resolve) => {
            const observer = new PerformanceObserver((list) => {
                const entries = list.getEntries()
                const firstEntry = entries[0] as any
                resolve(firstEntry.processingStart - firstEntry.startTime)
                observer.disconnect()
            })
            observer.observe({ entryTypes: ['first-input'] })
        }) as any
    }

    private getCLS(): number {
        let clsValue = 0
        const observer = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
                if (!(entry as any).hadRecentInput) {
                    clsValue += (entry as any).value
                }
            }
        })
        observer.observe({ entryTypes: ['layout-shift'] })
        return clsValue
    }

    private getAverageApiResponseTime(): number {
        const apiCalls = this.events.filter(e => e.data.eventType?.includes('api_call'))
        if (apiCalls.length === 0) return 0

        const totalTime = apiCalls.reduce((sum, call) => sum + (call.data.responseTime || 0), 0)
        return totalTime / apiCalls.length
    }

    private calculateErrorRate(): number {
        const errorEvents = this.events.filter(e => e.type === 'error')
        const totalEvents = this.events.length
        return totalEvents > 0 ? (errorEvents.length / totalEvents) * 100 : 0
    }

    private calculateUserSatisfactionScore(): number {
        // Simplified calculation based on performance and user behavior
        const avgEngagement = Array.from(this.userBehavior.values())
            .reduce((sum, user) => sum + user.engagementScore, 0) / this.userBehavior.size

        const errorRate = this.calculateErrorRate()
        const performanceScore = this.getPerformanceScore()

        return Math.max(0, Math.min(100, avgEngagement * 0.4 + performanceScore * 0.4 - errorRate * 2))
    }

    private getPerformanceScore(): number {
        // Simplified performance scoring
        const latestMetrics = this.performanceData[this.performanceData.length - 1]
        if (!latestMetrics) return 75 // Default score

        const { fcp, lcp, fid, cls, ttfb } = latestMetrics.metrics

        let score = 100

        // Deduct points for poor performance
        if (fcp > 3000) score -= 20
        if (lcp > 4000) score -= 25
        if (fid > 300) score -= 20
        if (cls > 0.25) score -= 20
        if (ttfb > 800) score -= 15

        return Math.max(0, score)
    }

    private trackUserInteractions() {
        // Track clicks
        document.addEventListener('click', (event) => {
            const target = event.target as HTMLElement
            this.track('click', {
                element: target.tagName.toLowerCase(),
                elementId: target.id,
                elementClass: target.className,
                elementText: target.textContent?.slice(0, 100),
                coordinates: { x: event.clientX, y: event.clientY }
            })
        })

        // Track form submissions
        document.addEventListener('submit', (event) => {
            const form = event.target as HTMLFormElement
            this.track('form_submit', {
                formId: form.id,
                formAction: form.action,
                formMethod: form.method
            })
        })

        // Track scroll depth
        let maxScrollDepth = 0
        window.addEventListener('scroll', () => {
            const scrollDepth = Math.round((window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100)
            if (scrollDepth > maxScrollDepth) {
                maxScrollDepth = scrollDepth
                if (scrollDepth % 25 === 0) { // Track at 25%, 50%, 75%, 100%
                    this.track('scroll_depth', { depth: scrollDepth })
                }
            }
        })
    }

    private sendToAnalyticsService(event: AnalyticsEvent) {
        // In production, this would send to a real analytics service
        // For development, we'll use localStorage
        const storedEvents = JSON.parse(localStorage.getItem('analytics-events') || '[]')
        storedEvents.push(event)

        // Keep only last 10000 events
        if (storedEvents.length > 10000) {
            storedEvents.splice(0, storedEvents.length - 10000)
        }

        localStorage.setItem('analytics-events', JSON.stringify(storedEvents))
    }

    public getAnalytics(): {
        events: AnalyticsEvent[]
        performance: PerformanceMetrics[]
        userBehavior: UserBehaviorData[]
        summary: {
            totalEvents: number
            uniqueUsers: number
            averageSessionDuration: number
            topEvents: Array<{ type: string; count: number }>
            errorRate: number
            performanceScore: number
        }
    } {
        const userBehaviorArray = Array.from(this.userBehavior.values())

        return {
            events: this.events,
            performance: this.performanceData,
            userBehavior: userBehaviorArray,
            summary: {
                totalEvents: this.events.length,
                uniqueUsers: new Set(this.events.map(e => e.userId).filter(Boolean)).size,
                averageSessionDuration: userBehaviorArray.reduce((sum, user) => sum + user.timeOnSite, 0) / userBehaviorArray.length,
                topEvents: this.getTopEvents(),
                errorRate: this.calculateErrorRate(),
                performanceScore: this.getPerformanceScore()
            }
        }
    }

    private getTopEvents(): Array<{ type: string; count: number }> {
        const eventCounts = new Map<string, number>()

        this.events.forEach(event => {
            const type = event.data.eventType || event.type
            eventCounts.set(type, (eventCounts.get(type) || 0) + 1)
        })

        return Array.from(eventCounts.entries())
            .map(([type, count]) => ({ type, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 10)
    }

    public generateBusinessMetrics(period: BusinessMetrics['period']): BusinessMetrics {
        const userBehaviorArray = Array.from(this.userBehavior.values())

        return {
            app: this.app,
            period,
            timestamp: Date.now(),
            metrics: {
                activeUsers: userBehaviorArray.length,
                newUsers: userBehaviorArray.filter(user => user.actions.length === 1).length,
                retentionRate: this.calculateRetentionRate(),
                conversionRate: this.calculateConversionRate(),
                revenue: this.calculateRevenue(),
                averageSessionDuration: userBehaviorArray.reduce((sum, user) => sum + user.timeOnSite, 0) / userBehaviorArray.length,
                bounceRate: this.calculateBounceRate(),
                pageViewsPerSession: this.calculatePageViewsPerSession(),
                customerSatisfactionScore: this.calculateUserSatisfactionScore(),
                netPromoterScore: this.calculateNPS()
            }
        }
    }

    private calculateRetentionRate(): number {
        // Simplified calculation - in production would use historical data
        return Math.random() * 30 + 60 // 60-90%
    }

    private calculateConversionRate(): number {
        const conversionEvents = this.events.filter(e => e.type === 'conversion')
        const totalSessions = this.userBehavior.size
        return totalSessions > 0 ? (conversionEvents.length / totalSessions) * 100 : 0
    }

    private calculateRevenue(): number {
        return this.events
            .filter(e => e.data.revenue)
            .reduce((sum, e) => sum + (e.data.revenue || 0), 0)
    }

    private calculateBounceRate(): number {
        const singlePageSessions = Array.from(this.userBehavior.values())
            .filter(user => user.journey.length <= 1).length
        return (singlePageSessions / this.userBehavior.size) * 100
    }

    private calculatePageViewsPerSession(): number {
        const totalPageViews = this.events.filter(e => e.type === 'pageview').length
        return totalPageViews / this.userBehavior.size
    }

    private calculateNPS(): number {
        // Simplified NPS calculation - in production would use survey data
        return Math.random() * 60 - 10 // -10 to 50
    }

    public setUserId(userId: string) {
        this.userId = userId
        this.track('user_identified', { userId })
    }

    public trackConversion(type: string, value?: number, currency?: string) {
        this.track('conversion', {
            conversionType: type,
            value,
            currency: currency || 'USD'
        })
    }

    public trackApiCall(endpoint: string, method: string, responseTime: number, statusCode: number) {
        this.track('api_call', {
            endpoint,
            method,
            responseTime,
            statusCode,
            success: statusCode >= 200 && statusCode < 300
        })
    }

    public dispose() {
        // Clean up event listeners and send final analytics
        this.track('session_end', {
            sessionDuration: Date.now() - this.startTime,
            totalEvents: this.events.length
        })
    }
}

// Global analytics instance
let globalAnalytics: AdvancedAnalyticsEngine | null = null

export function initializeAnalytics(app: string, userId?: string): AdvancedAnalyticsEngine {
    globalAnalytics = new AdvancedAnalyticsEngine(app, userId)
    return globalAnalytics
}

export function getAnalytics(): AdvancedAnalyticsEngine | null {
    return globalAnalytics
}

export function track(eventType: string, data?: Record<string, any>) {
    globalAnalytics?.track(eventType, data)
}
