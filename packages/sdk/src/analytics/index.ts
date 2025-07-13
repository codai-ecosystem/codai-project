import type { CodaiConfig } from '../types';
import { HttpUtils, ErrorUtils, ValidationUtils } from '../utils';

// Analytics interfaces for analizai.ro integration
export interface AnalyticsEvent {
  id: string;
  eventType: string;
  userId?: string;
  sessionId?: string;
  timestamp: Date;
  properties: Record<string, any>;
  metadata: {
    source: string;
    version: string;
    environment: string;
    userAgent?: string;
    ip?: string;
    location?: {
      country?: string;
      region?: string;
      city?: string;
    };
  };
}

export interface AnalyticsQuery {
  metrics: string[];
  filters?: AnalyticsFilter[];
  groupBy?: string[];
  orderBy?: { field: string; direction: 'asc' | 'desc' }[];
  timeRange: {
    start: Date;
    end: Date;
  };
  limit?: number;
  offset?: number;
}

export interface AnalyticsFilter {
  field: string;
  operator: 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'nin' | 'contains';
  value: any;
}

export interface AnalyticsMetric {
  name: string;
  value: number;
  change?: number;
  changePercentage?: number;
  trend?: 'up' | 'down' | 'stable';
  unit?: string;
}

export interface AnalyticsDashboard {
  id: string;
  name: string;
  description?: string;
  widgets: AnalyticsWidget[];
  filters: AnalyticsFilter[];
  refreshInterval?: number;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface AnalyticsWidget {
  id: string;
  type: 'chart' | 'metric' | 'table' | 'funnel' | 'cohort';
  title: string;
  query: AnalyticsQuery;
  visualization: {
    chartType?: 'line' | 'bar' | 'pie' | 'area' | 'scatter';
    options?: Record<string, any>;
  };
  position: { x: number; y: number; width: number; height: number };
}

export interface UserBehavior {
  userId: string;
  sessionId: string;
  events: AnalyticsEvent[];
  journey: string[];
  timeSpent: number;
  pageViews: number;
  interactions: number;
  conversions: string[];
  segments: string[];
}

export interface AnomalyDetection {
  id: string;
  metric: string;
  threshold: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  detectedAt: Date;
  resolved?: boolean;
  resolvedAt?: Date;
}

// Analytics service for CODAI ecosystem (analizai.ro integration)
export class AnalyticsService {
  private config: CodaiConfig;
  private httpClient: any;
  private eventQueue: AnalyticsEvent[] = [];
  private batchSize = 50;
  private flushInterval = 5000; // 5 seconds

  constructor(config: CodaiConfig) {
    this.config = config;
    this.httpClient = HttpUtils.createHttpClient(
      config.endpoints?.analytics || 'https://analizai.ro/api'
    );

    // Start batch processing
    this.startBatchProcessing();
  }

  /**
   * Track analytics event
   */
  async track(
    eventType: string,
    properties: Record<string, any> = {},
    userId?: string,
    sessionId?: string
  ): Promise<void> {
    const event: AnalyticsEvent = {
      id: this.generateEventId(),
      eventType,
      userId,
      sessionId: sessionId || this.getSessionId(),
      timestamp: new Date(),
      properties,
      metadata: {
        source: this.config.appId,
        version: '1.0.0',
        environment: this.config.environment || 'development',
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined
      }
    };

    if (this.config.debug) {
      console.log('[Analytics] Tracking event:', event);
    }

    // Add to queue for batch processing
    this.eventQueue.push(event);

    // Flush immediately if queue is full
    if (this.eventQueue.length >= this.batchSize) {
      await this.flushEvents();
    }
  }

  /**
   * Track page view
   */
  async trackPageView(
    page: string,
    title?: string,
    userId?: string,
    sessionId?: string
  ): Promise<void> {
    await this.track('page_view', {
      page,
      title,
      url: typeof window !== 'undefined' ? window.location.href : undefined,
      referrer: typeof document !== 'undefined' ? document.referrer : undefined
    }, userId, sessionId);
  }

  /**
   * Track user action
   */
  async trackAction(
    action: string,
    target: string,
    properties: Record<string, any> = {},
    userId?: string,
    sessionId?: string
  ): Promise<void> {
    await this.track('user_action', {
      action,
      target,
      ...properties
    }, userId, sessionId);
  }

  /**
   * Track conversion
   */
  async trackConversion(
    conversionType: string,
    value?: number,
    currency?: string,
    userId?: string,
    sessionId?: string
  ): Promise<void> {
    await this.track('conversion', {
      conversionType,
      value,
      currency: currency || 'USD'
    }, userId, sessionId);
  }

  /**
   * Track error
   */
  async trackError(
    error: Error,
    context?: Record<string, any>,
    userId?: string,
    sessionId?: string
  ): Promise<void> {
    await this.track('error', {
      message: error.message,
      stack: error.stack,
      name: error.name,
      context
    }, userId, sessionId);
  }

  /**
   * Query analytics data
   */
  async query(query: AnalyticsQuery): Promise<{
    data: any[];
    metrics: AnalyticsMetric[];
    totalCount: number;
  }> {
    try {
      const response = await this.httpClient.post('/analytics/query', query);
      return response.data;
    } catch (error) {
      throw ErrorUtils.createError(
        'Failed to query analytics data',
        'ANALYTICS_QUERY_FAILED',
        error
      );
    }
  }

  /**
   * Get real-time metrics
   */
  async getRealTimeMetrics(metrics: string[]): Promise<AnalyticsMetric[]> {
    try {
      const response = await this.httpClient.post('/analytics/realtime', {
        metrics
      });
      return response.data.metrics;
    } catch (error) {
      throw ErrorUtils.createError(
        'Failed to get real-time metrics',
        'REALTIME_METRICS_FAILED',
        error
      );
    }
  }

  /**
   * Create analytics dashboard
   */
  async createDashboard(
    dashboard: Omit<AnalyticsDashboard, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<AnalyticsDashboard> {
    try {
      const response = await this.httpClient.post('/analytics/dashboards', dashboard);
      return response.data;
    } catch (error) {
      throw ErrorUtils.createError(
        'Failed to create dashboard',
        'DASHBOARD_CREATE_FAILED',
        error
      );
    }
  }

  /**
   * Get dashboard
   */
  async getDashboard(dashboardId: string): Promise<AnalyticsDashboard> {
    try {
      const response = await this.httpClient.get(`/analytics/dashboards/${dashboardId}`);
      return response.data;
    } catch (error) {
      throw ErrorUtils.createError(
        'Failed to get dashboard',
        'DASHBOARD_GET_FAILED',
        error
      );
    }
  }

  /**
   * List dashboards
   */
  async listDashboards(): Promise<AnalyticsDashboard[]> {
    try {
      const response = await this.httpClient.get('/analytics/dashboards');
      return response.data.dashboards;
    } catch (error) {
      throw ErrorUtils.createError(
        'Failed to list dashboards',
        'DASHBOARD_LIST_FAILED',
        error
      );
    }
  }

  /**
   * Analyze user behavior
   */
  async analyzeUserBehavior(
    userId: string,
    timeRange: { start: Date; end: Date }
  ): Promise<UserBehavior> {
    try {
      const response = await this.httpClient.post('/analytics/behavior', {
        userId,
        timeRange
      });
      return response.data;
    } catch (error) {
      throw ErrorUtils.createError(
        'Failed to analyze user behavior',
        'BEHAVIOR_ANALYSIS_FAILED',
        error
      );
    }
  }

  /**
   * Get funnel analysis
   */
  async getFunnelAnalysis(
    steps: string[],
    timeRange: { start: Date; end: Date },
    filters?: AnalyticsFilter[]
  ): Promise<{
    steps: Array<{
      step: string;
      users: number;
      conversionRate: number;
      dropoffRate: number;
    }>;
    totalUsers: number;
    overallConversionRate: number;
  }> {
    try {
      const response = await this.httpClient.post('/analytics/funnel', {
        steps,
        timeRange,
        filters
      });
      return response.data;
    } catch (error) {
      throw ErrorUtils.createError(
        'Failed to get funnel analysis',
        'FUNNEL_ANALYSIS_FAILED',
        error
      );
    }
  }

  /**
   * Get cohort analysis
   */
  async getCohortAnalysis(
    cohortType: 'weekly' | 'monthly',
    timeRange: { start: Date; end: Date }
  ): Promise<{
    cohorts: Array<{
      cohort: string;
      size: number;
      periods: number[];
    }>;
  }> {
    try {
      const response = await this.httpClient.post('/analytics/cohort', {
        cohortType,
        timeRange
      });
      return response.data;
    } catch (error) {
      throw ErrorUtils.createError(
        'Failed to get cohort analysis',
        'COHORT_ANALYSIS_FAILED',
        error
      );
    }
  }

  /**
   * Detect anomalies
   */
  async detectAnomalies(
    metrics: string[],
    timeRange: { start: Date; end: Date }
  ): Promise<AnomalyDetection[]> {
    try {
      const response = await this.httpClient.post('/analytics/anomalies', {
        metrics,
        timeRange
      });
      return response.data.anomalies;
    } catch (error) {
      throw ErrorUtils.createError(
        'Failed to detect anomalies',
        'ANOMALY_DETECTION_FAILED',
        error
      );
    }
  }

  /**
   * Generate analytics report
   */
  async generateReport(
    reportType: 'summary' | 'detailed' | 'custom',
    timeRange: { start: Date; end: Date },
    options?: Record<string, any>
  ): Promise<Blob> {
    try {
      const response = await this.httpClient.post('/analytics/reports', {
        reportType,
        timeRange,
        options
      }, {
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      throw ErrorUtils.createError(
        'Failed to generate report',
        'REPORT_GENERATION_FAILED',
        error
      );
    }
  }

  // Private methods
  private generateEventId(): string {
    return `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getSessionId(): string {
    if (typeof window !== 'undefined') {
      let sessionId = sessionStorage.getItem('codai_session_id');
      if (!sessionId) {
        sessionId = this.generateEventId();
        sessionStorage.setItem('codai_session_id', sessionId);
      }
      return sessionId;
    }
    return 'server_session';
  }

  private async flushEvents(): Promise<void> {
    if (this.eventQueue.length === 0) return;

    const events = [...this.eventQueue];
    this.eventQueue = [];

    try {
      await this.httpClient.post('/analytics/events', { events });

      if (this.config.debug) {
        console.log(`[Analytics] Flushed ${events.length} events`);
      }
    } catch (error) {
      // Re-queue events on failure
      this.eventQueue.unshift(...events);

      if (this.config.debug) {
        console.error('[Analytics] Failed to flush events:', error);
      }
    }
  }

  private startBatchProcessing(): void {
    setInterval(() => {
      this.flushEvents().catch(console.error);
    }, this.flushInterval);
  }
}
