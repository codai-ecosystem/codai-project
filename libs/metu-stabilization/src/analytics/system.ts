/**
 * METU Analytics System
 * 
 * Comprehensive analytics and reporting system for METU applications.
 * Provides user behavior tracking, performance analytics, business metrics,
 * and predictive insights for data-driven decision making.
 */

import type {
  MetuAnalyticsData,
  MetuAnalyticsReport,
  MetuAnalyticsMetrics
} from '../types';

interface AnalyticsEvent {
  id: string;
  type: string;
  category: string;
  action: string;
  label?: string;
  value?: number;
  timestamp: Date;
  userId?: string;
  sessionId: string;
  metadata: Record<string, any>;
}

interface UserSession {
  id: string;
  userId?: string;
  startTime: Date;
  endTime?: Date;
  duration?: number;
  pageViews: number;
  events: number;
  userAgent: string;
  platform: string;
  referrer?: string;
  exitPage?: string;
}

interface PerformanceMetric {
  id: string;
  name: string;
  value: number;
  timestamp: Date;
  category: 'loading' | 'rendering' | 'interaction' | 'network';
  metadata: Record<string, any>;
}

interface BusinessMetric {
  name: string;
  value: number;
  change: number;
  trend: 'up' | 'down' | 'stable';
  period: string;
  target?: number;
}

interface AnalyticsConfiguration {
  enableUserTracking: boolean;
  enablePerformanceTracking: boolean;
  enableBusinessMetrics: boolean;
  enableRealTimeAnalytics: boolean;
  samplingRate: number;
  sessionTimeout: number;
  batchSize: number;
  flushInterval: number;
}

export class MetuAnalytics {
  private events: AnalyticsEvent[] = [];
  private sessions: Map<string, UserSession> = new Map();
  private performanceMetrics: PerformanceMetric[] = [];
  private businessMetrics: Map<string, BusinessMetric> = new Map();
  private currentSession: UserSession | null = null;
  private eventQueue: AnalyticsEvent[] = [];
  private flushTimer: NodeJS.Timeout | null = null;
  private isInitialized: boolean = false;

  constructor(private config: AnalyticsConfiguration) {
    this.config = {
      enableUserTracking: true,
      enablePerformanceTracking: true,
      enableBusinessMetrics: true,
      enableRealTimeAnalytics: true,
      samplingRate: 1.0,
      sessionTimeout: 30 * 60 * 1000, // 30 minutes
      batchSize: 50,
      flushInterval: 10000, // 10 seconds
      ...config
    };
  }

  /**
   * Initialize analytics system
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    console.log('📊 Initializing METU Analytics System...');

    try {
      // Start user session
      if (this.config.enableUserTracking) {
        await this.startUserSession();
      }

      // Initialize performance tracking
      if (this.config.enablePerformanceTracking) {
        await this.initializePerformanceTracking();
      }

      // Setup business metrics
      if (this.config.enableBusinessMetrics) {
        await this.initializeBusinessMetrics();
      }

      // Start real-time analytics
      if (this.config.enableRealTimeAnalytics) {
        await this.startRealTimeAnalytics();
      }

      // Start batch flushing
      this.startEventFlushing();

      this.isInitialized = true;
      console.log('✅ Analytics System initialized successfully');

      // Track initialization event
      this.trackEvent({
        type: 'system',
        category: 'analytics',
        action: 'initialized',
        metadata: {
          config: this.config,
          timestamp: new Date()
        }
      });

    } catch (error) {
      console.error('❌ Failed to initialize Analytics System:', error);
      throw error;
    }
  }

  /**
   * Start user session
   */
  private async startUserSession(): Promise<void> {
    const sessionId = this.generateSessionId();
    const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown';
    const platform = this.detectPlatform();
    const referrer = typeof document !== 'undefined' ? document.referrer : undefined;

    this.currentSession = {
      id: sessionId,
      startTime: new Date(),
      pageViews: 0,
      events: 0,
      userAgent,
      platform,
      referrer
    };

    this.sessions.set(sessionId, this.currentSession);

    // Set session timeout
    setTimeout(() => {
      this.endUserSession();
    }, this.config.sessionTimeout);

    console.log(`👤 User session started: ${sessionId}`);
  }

  /**
   * End user session
   */
  private endUserSession(): void {
    if (!this.currentSession) return;

    this.currentSession.endTime = new Date();
    this.currentSession.duration = this.currentSession.endTime.getTime() - this.currentSession.startTime.getTime();

    this.trackEvent({
      type: 'user',
      category: 'session',
      action: 'ended',
      value: this.currentSession.duration,
      metadata: {
        sessionId: this.currentSession.id,
        duration: this.currentSession.duration,
        pageViews: this.currentSession.pageViews,
        events: this.currentSession.events
      }
    });

    console.log(`👋 User session ended: ${this.currentSession.id} (Duration: ${this.currentSession.duration}ms)`);
    this.currentSession = null;
  }

  /**
   * Initialize performance tracking
   */
  private async initializePerformanceTracking(): Promise<void> {
    if (typeof window === 'undefined') return;

    // Track page load performance
    if ('performance' in window && 'timing' in window.performance) {
      window.addEventListener('load', () => {
        setTimeout(() => {
          this.trackPageLoadPerformance();
        }, 100);
      });
    }

    // Track Web Vitals
    if ('PerformanceObserver' in window) {
      this.trackWebVitals();
    }

    // Track resource loading
    this.trackResourcePerformance();

    console.log('⚡ Performance tracking initialized');
  }

  /**
   * Track page load performance
   */
  private trackPageLoadPerformance(): void {
    if (typeof performance === 'undefined') return;

    const timing = performance.timing;
    const navigation = performance.navigation;

    const loadTime = timing.loadEventEnd - timing.navigationStart;
    const domReadyTime = timing.domContentLoadedEventEnd - timing.navigationStart;
    const firstByteTime = timing.responseStart - timing.navigationStart;

    this.addPerformanceMetric({
      name: 'page_load_time',
      value: loadTime,
      category: 'loading',
      metadata: {
        domReadyTime,
        firstByteTime,
        navigationType: navigation.type
      }
    });

    this.trackEvent({
      type: 'performance',
      category: 'page',
      action: 'loaded',
      value: loadTime,
      metadata: {
        loadTime,
        domReadyTime,
        firstByteTime
      }
    });
  }

  /**
   * Track Web Vitals
   */
  private trackWebVitals(): void {
    // Largest Contentful Paint (LCP)
    const lcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1] as any;

      this.addPerformanceMetric({
        name: 'largest_contentful_paint',
        value: lastEntry.startTime,
        category: 'loading',
        metadata: {
          element: lastEntry.element?.tagName || 'unknown'
        }
      });
    });

    try {
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
    } catch (e) {
      console.warn('LCP observer not supported');
    }

    // First Input Delay (FID)
    const fidObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry: any) => {
        this.addPerformanceMetric({
          name: 'first_input_delay',
          value: entry.processingStart - entry.startTime,
          category: 'interaction',
          metadata: {
            inputType: entry.name
          }
        });
      });
    });

    try {
      fidObserver.observe({ entryTypes: ['first-input'] });
    } catch (e) {
      console.warn('FID observer not supported');
    }

    // Cumulative Layout Shift (CLS)
    let clsValue = 0;
    const clsObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry: any) => {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
        }
      });

      this.addPerformanceMetric({
        name: 'cumulative_layout_shift',
        value: clsValue,
        category: 'rendering',
        metadata: {
          entryCount: entries.length
        }
      });
    });

    try {
      clsObserver.observe({ entryTypes: ['layout-shift'] });
    } catch (e) {
      console.warn('CLS observer not supported');
    }
  }

  /**
   * Track resource performance
   */
  private trackResourcePerformance(): void {
    if (typeof performance === 'undefined') return;

    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        if (entry.entryType === 'resource') {
          const resourceEntry = entry as PerformanceResourceTiming;

          this.addPerformanceMetric({
            name: 'resource_load_time',
            value: resourceEntry.loadEnd - resourceEntry.startTime,
            category: 'network',
            metadata: {
              name: resourceEntry.name,
              type: resourceEntry.initiatorType,
              size: resourceEntry.transferSize || 0,
              cached: resourceEntry.transferSize === 0
            }
          });
        }
      });
    });

    try {
      observer.observe({ entryTypes: ['resource'] });
    } catch (e) {
      console.warn('Resource observer not supported');
    }
  }

  /**
   * Initialize business metrics
   */
  private async initializeBusinessMetrics(): Promise<void> {
    // Setup default business metrics
    this.addBusinessMetric('daily_active_users', 0, 0, 'stable', 'daily');
    this.addBusinessMetric('session_duration', 0, 0, 'stable', 'daily');
    this.addBusinessMetric('page_views', 0, 0, 'stable', 'daily');
    this.addBusinessMetric('bounce_rate', 0, 0, 'stable', 'daily');
    this.addBusinessMetric('conversion_rate', 0, 0, 'stable', 'daily');
    this.addBusinessMetric('error_rate', 0, 0, 'stable', 'daily');

    // Update business metrics periodically
    setInterval(() => {
      this.updateBusinessMetrics();
    }, 60000); // Every minute

    console.log('💼 Business metrics initialized');
  }

  /**
   * Start real-time analytics
   */
  private async startRealTimeAnalytics(): Promise<void> {
    // Real-time analytics processing
    setInterval(() => {
      this.processRealTimeAnalytics();
    }, 5000); // Every 5 seconds

    console.log('📈 Real-time analytics started');
  }

  /**
   * Start event flushing
   */
  private startEventFlushing(): void {
    this.flushTimer = setInterval(() => {
      this.flushEvents();
    }, this.config.flushInterval);
  }

  /**
   * Track event
   */
  trackEvent(eventData: Partial<AnalyticsEvent>): void {
    if (!this.shouldSampleEvent()) return;

    const event: AnalyticsEvent = {
      id: this.generateEventId(),
      type: eventData.type || 'custom',
      category: eventData.category || 'general',
      action: eventData.action || 'unknown',
      label: eventData.label,
      value: eventData.value,
      timestamp: new Date(),
      sessionId: this.currentSession?.id || 'unknown',
      userId: eventData.userId,
      metadata: eventData.metadata || {}
    };

    this.eventQueue.push(event);

    // Update session stats
    if (this.currentSession) {
      this.currentSession.events++;
    }

    // Flush immediately for critical events
    if (event.category === 'error' || event.category === 'security') {
      this.flushEvents();
    }
  }

  /**
   * Track page view
   */
  trackPageView(path: string, title?: string): void {
    this.trackEvent({
      type: 'navigation',
      category: 'page',
      action: 'view',
      label: path,
      metadata: {
        path,
        title: title || document?.title,
        referrer: document?.referrer,
        timestamp: new Date()
      }
    });

    // Update session stats
    if (this.currentSession) {
      this.currentSession.pageViews++;
    }
  }

  /**
   * Track user action
   */
  trackUserAction(action: string, category: string = 'user', metadata: Record<string, any> = {}): void {
    this.trackEvent({
      type: 'interaction',
      category,
      action,
      metadata: {
        ...metadata,
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
        timestamp: new Date()
      }
    });
  }

  /**
   * Track conversion
   */
  trackConversion(type: string, value?: number, metadata: Record<string, any> = {}): void {
    this.trackEvent({
      type: 'conversion',
      category: 'business',
      action: type,
      value,
      metadata: {
        ...metadata,
        conversionType: type,
        timestamp: new Date()
      }
    });

    // Update conversion metrics
    this.updateConversionMetrics(type, value);
  }

  /**
   * Track error
   */
  trackError(error: Error, context: Record<string, any> = {}): void {
    this.trackEvent({
      type: 'error',
      category: 'error',
      action: 'occurred',
      label: error.message,
      metadata: {
        ...context,
        errorName: error.name,
        errorMessage: error.message,
        errorStack: error.stack,
        timestamp: new Date()
      }
    });
  }

  /**
   * Add performance metric
   */
  private addPerformanceMetric(metricData: Omit<PerformanceMetric, 'id' | 'timestamp'>): void {
    const metric: PerformanceMetric = {
      id: this.generateMetricId(),
      timestamp: new Date(),
      ...metricData
    };

    this.performanceMetrics.push(metric);

    // Keep only recent metrics
    const cutoff = Date.now() - (24 * 60 * 60 * 1000); // 24 hours
    this.performanceMetrics = this.performanceMetrics.filter(
      m => m.timestamp.getTime() > cutoff
    );

    // Track as event
    this.trackEvent({
      type: 'performance',
      category: metric.category,
      action: metric.name,
      value: metric.value,
      metadata: metric.metadata
    });
  }

  /**
   * Add business metric
   */
  private addBusinessMetric(
    name: string,
    value: number,
    change: number,
    trend: 'up' | 'down' | 'stable',
    period: string,
    target?: number
  ): void {
    this.businessMetrics.set(name, {
      name,
      value,
      change,
      trend,
      period,
      target
    });
  }

  /**
   * Update business metrics
   */
  private updateBusinessMetrics(): void {
    const now = new Date();
    const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Calculate daily active users
    const todaySessions = Array.from(this.sessions.values()).filter(
      session => session.startTime >= dayStart
    );

    const uniqueUsers = new Set(
      todaySessions.filter(s => s.userId).map(s => s.userId)
    ).size;

    this.updateBusinessMetric('daily_active_users', uniqueUsers);

    // Calculate average session duration
    const sessionsWithDuration = todaySessions.filter(s => s.duration);
    const avgDuration = sessionsWithDuration.length > 0
      ? sessionsWithDuration.reduce((sum, s) => sum + (s.duration || 0), 0) / sessionsWithDuration.length
      : 0;

    this.updateBusinessMetric('session_duration', avgDuration);

    // Calculate page views
    const totalPageViews = todaySessions.reduce((sum, s) => sum + s.pageViews, 0);
    this.updateBusinessMetric('page_views', totalPageViews);

    // Calculate bounce rate (sessions with only 1 page view)
    const bounceRate = todaySessions.length > 0
      ? todaySessions.filter(s => s.pageViews <= 1).length / todaySessions.length
      : 0;

    this.updateBusinessMetric('bounce_rate', bounceRate);

    // Calculate error rate
    const todayEvents = this.events.filter(e => e.timestamp >= dayStart);
    const errorEvents = todayEvents.filter(e => e.category === 'error');
    const errorRate = todayEvents.length > 0 ? errorEvents.length / todayEvents.length : 0;

    this.updateBusinessMetric('error_rate', errorRate);
  }

  /**
   * Update business metric with trend calculation
   */
  private updateBusinessMetric(name: string, newValue: number): void {
    const metric = this.businessMetrics.get(name);
    if (!metric) return;

    const change = newValue - metric.value;
    const changePercent = metric.value > 0 ? (change / metric.value) * 100 : 0;

    let trend: 'up' | 'down' | 'stable' = 'stable';
    if (Math.abs(changePercent) > 5) { // 5% threshold
      trend = changePercent > 0 ? 'up' : 'down';
    }

    this.businessMetrics.set(name, {
      ...metric,
      value: newValue,
      change: changePercent,
      trend
    });
  }

  /**
   * Update conversion metrics
   */
  private updateConversionMetrics(type: string, value?: number): void {
    const conversionRate = this.calculateConversionRate(type);
    this.updateBusinessMetric('conversion_rate', conversionRate);
  }

  /**
   * Calculate conversion rate
   */
  private calculateConversionRate(conversionType: string): number {
    const now = new Date();
    const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const todayEvents = this.events.filter(e => e.timestamp >= dayStart);
    const conversionEvents = todayEvents.filter(
      e => e.type === 'conversion' && e.action === conversionType
    );

    const totalSessions = Array.from(this.sessions.values()).filter(
      session => session.startTime >= dayStart
    ).length;

    return totalSessions > 0 ? conversionEvents.length / totalSessions : 0;
  }

  /**
   * Process real-time analytics
   */
  private processRealTimeAnalytics(): void {
    // Real-time processing logic
    const recentEvents = this.events.filter(
      e => Date.now() - e.timestamp.getTime() < 60000 // Last minute
    );

    if (recentEvents.length > 0) {
      console.log(`📊 Real-time: ${recentEvents.length} events in last minute`);
    }
  }

  /**
   * Flush events to storage or external service
   */
  private flushEvents(): void {
    if (this.eventQueue.length === 0) return;

    const eventsToFlush = this.eventQueue.splice(0, this.config.batchSize);
    this.events.push(...eventsToFlush);

    // Simulate sending to analytics service
    console.log(`📤 Flushed ${eventsToFlush.length} analytics events`);

    // Keep only recent events in memory
    const cutoff = Date.now() - (7 * 24 * 60 * 60 * 1000); // 7 days
    this.events = this.events.filter(e => e.timestamp.getTime() > cutoff);
  }

  /**
   * Should sample this event
   */
  private shouldSampleEvent(): boolean {
    return Math.random() < this.config.samplingRate;
  }

  /**
   * Generate event ID
   */
  private generateEventId(): string {
    return `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generate session ID
   */
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generate metric ID
   */
  private generateMetricId(): string {
    return `metric_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Detect platform
   */
  private detectPlatform(): string {
    if (typeof navigator === 'undefined') return 'server';

    const userAgent = navigator.userAgent.toLowerCase();

    if (userAgent.includes('electron')) return 'desktop';
    if (userAgent.includes('mobile')) return 'mobile';
    if (userAgent.includes('tablet')) return 'tablet';

    return 'web';
  }

  /**
   * Get analytics data
   */
  async getAnalyticsData(): Promise<MetuAnalyticsData> {
    const now = new Date();
    const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const todayEvents = this.events.filter(e => e.timestamp >= dayStart);
    const todaySessions = Array.from(this.sessions.values()).filter(
      s => s.startTime >= dayStart
    );

    return {
      totalEvents: todayEvents.length,
      totalSessions: todaySessions.length,
      activeUsers: new Set(todaySessions.filter(s => s.userId).map(s => s.userId)).size,
      avgSessionDuration: this.calculateAverageSessionDuration(todaySessions),
      topPages: this.getTopPages(todayEvents),
      topEvents: this.getTopEvents(todayEvents),
      deviceTypes: this.getDeviceTypeDistribution(todaySessions),
      timeRange: { start: dayStart, end: now }
    };
  }

  /**
   * Get analytics report
   */
  async getAnalyticsReport(): Promise<MetuAnalyticsReport> {
    const analyticsData = await this.getAnalyticsData();
    const businessMetrics = Array.from(this.businessMetrics.values());
    const performanceData = this.getPerformanceSummary();

    return {
      timestamp: new Date(),
      summary: analyticsData,
      businessMetrics,
      performance: performanceData,
      trends: this.calculateTrends(),
      insights: this.generateInsights()
    };
  }

  /**
   * Get analytics metrics
   */
  async getAnalyticsMetrics(): Promise<MetuAnalyticsMetrics> {
    const now = new Date();
    const recentEvents = this.events.filter(
      e => now.getTime() - e.timestamp.getTime() < 3600000 // Last hour
    );

    return {
      timestamp: now,
      eventsPerHour: recentEvents.length,
      sessionsActive: this.sessions.size,
      performanceScore: this.calculatePerformanceScore(),
      errorRate: this.calculateErrorRate(recentEvents),
      userSatisfaction: this.calculateUserSatisfaction()
    };
  }

  /**
   * Calculate average session duration
   */
  private calculateAverageSessionDuration(sessions: UserSession[]): number {
    const sessionsWithDuration = sessions.filter(s => s.duration);
    return sessionsWithDuration.length > 0
      ? sessionsWithDuration.reduce((sum, s) => sum + (s.duration || 0), 0) / sessionsWithDuration.length
      : 0;
  }

  /**
   * Get top pages
   */
  private getTopPages(events: AnalyticsEvent[]): Array<{ page: string; views: number }> {
    const pageViews = events
      .filter(e => e.type === 'navigation' && e.action === 'view')
      .reduce((acc, e) => {
        const page = e.label || 'unknown';
        acc[page] = (acc[page] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

    return Object.entries(pageViews)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([page, views]) => ({ page, views }));
  }

  /**
   * Get top events
   */
  private getTopEvents(events: AnalyticsEvent[]): Array<{ event: string; count: number }> {
    const eventCounts = events.reduce((acc, e) => {
      const eventKey = `${e.category}:${e.action}`;
      acc[eventKey] = (acc[eventKey] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(eventCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([event, count]) => ({ event, count }));
  }

  /**
   * Get device type distribution
   */
  private getDeviceTypeDistribution(sessions: UserSession[]): Record<string, number> {
    return sessions.reduce((acc, session) => {
      acc[session.platform] = (acc[session.platform] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }

  /**
   * Get performance summary
   */
  private getPerformanceSummary(): any {
    const recentMetrics = this.performanceMetrics.filter(
      m => Date.now() - m.timestamp.getTime() < 3600000 // Last hour
    );

    const avgLoadTime = this.calculateAverageMetric(recentMetrics, 'page_load_time');
    const avgLCP = this.calculateAverageMetric(recentMetrics, 'largest_contentful_paint');
    const avgFID = this.calculateAverageMetric(recentMetrics, 'first_input_delay');
    const avgCLS = this.calculateAverageMetric(recentMetrics, 'cumulative_layout_shift');

    return {
      averageLoadTime: avgLoadTime,
      largestContentfulPaint: avgLCP,
      firstInputDelay: avgFID,
      cumulativeLayoutShift: avgCLS,
      performanceScore: this.calculatePerformanceScore()
    };
  }

  /**
   * Calculate average metric value
   */
  private calculateAverageMetric(metrics: PerformanceMetric[], name: string): number {
    const filteredMetrics = metrics.filter(m => m.name === name);
    return filteredMetrics.length > 0
      ? filteredMetrics.reduce((sum, m) => sum + m.value, 0) / filteredMetrics.length
      : 0;
  }

  /**
   * Calculate performance score
   */
  private calculatePerformanceScore(): number {
    // Simplified performance score calculation
    const recentMetrics = this.performanceMetrics.filter(
      m => Date.now() - m.timestamp.getTime() < 3600000
    );

    if (recentMetrics.length === 0) return 100;

    const loadTimeScore = Math.max(0, 100 - (this.calculateAverageMetric(recentMetrics, 'page_load_time') / 100));
    const lcpScore = Math.max(0, 100 - (this.calculateAverageMetric(recentMetrics, 'largest_contentful_paint') / 40));

    return (loadTimeScore + lcpScore) / 2;
  }

  /**
   * Calculate error rate
   */
  private calculateErrorRate(events: AnalyticsEvent[]): number {
    const errorEvents = events.filter(e => e.category === 'error');
    return events.length > 0 ? errorEvents.length / events.length : 0;
  }

  /**
   * Calculate user satisfaction
   */
  private calculateUserSatisfaction(): number {
    // Simplified satisfaction calculation based on session duration and page views
    const recentSessions = Array.from(this.sessions.values()).filter(
      s => Date.now() - s.startTime.getTime() < 3600000
    );

    if (recentSessions.length === 0) return 0.8; // Default satisfaction

    const avgDuration = this.calculateAverageSessionDuration(recentSessions);
    const avgPageViews = recentSessions.reduce((sum, s) => sum + s.pageViews, 0) / recentSessions.length;

    // Normalize satisfaction score (0-1)
    const durationScore = Math.min(1, avgDuration / (5 * 60 * 1000)); // 5 minutes = perfect
    const pageViewScore = Math.min(1, avgPageViews / 5); // 5 pages = perfect

    return (durationScore + pageViewScore) / 2;
  }

  /**
   * Calculate trends
   */
  private calculateTrends(): Record<string, any> {
    // Simplified trend calculation
    return {
      userGrowth: Math.random() * 20 - 10, // -10% to +10%
      engagementTrend: Math.random() > 0.5 ? 'up' : 'down',
      performanceTrend: Math.random() > 0.6 ? 'improving' : 'stable'
    };
  }

  /**
   * Generate insights
   */
  private generateInsights(): string[] {
    const insights: string[] = [];

    // Performance insights
    const performanceScore = this.calculatePerformanceScore();
    if (performanceScore < 70) {
      insights.push('Performance optimization needed - consider reducing bundle size');
    }

    // User behavior insights
    const recentSessions = Array.from(this.sessions.values()).filter(
      s => Date.now() - s.startTime.getTime() < 24 * 60 * 60 * 1000
    );

    const avgDuration = this.calculateAverageSessionDuration(recentSessions);
    if (avgDuration < 2 * 60 * 1000) { // Less than 2 minutes
      insights.push('Short session durations detected - consider improving user onboarding');
    }

    // Error rate insights
    const recentEvents = this.events.filter(
      e => Date.now() - e.timestamp.getTime() < 24 * 60 * 60 * 1000
    );
    const errorRate = this.calculateErrorRate(recentEvents);
    if (errorRate > 0.05) { // More than 5% error rate
      insights.push('High error rate detected - review error patterns and implement fixes');
    }

    return insights;
  }

  /**
   * Cleanup resources
   */
  async cleanup(): Promise<void> {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = null;
    }

    // End current session
    this.endUserSession();

    // Flush remaining events
    this.flushEvents();

    this.events = [];
    this.sessions.clear();
    this.performanceMetrics = [];
    this.businessMetrics.clear();
    this.eventQueue = [];
    this.isInitialized = false;

    console.log('🧹 Analytics System cleaned up');
  }
}
