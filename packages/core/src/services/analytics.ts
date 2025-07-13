// Real-time analytics service
export interface AnalyticsEvent {
  event: string;
  properties: Record<string, any>;
  timestamp: Date;
  userId?: string;
  sessionId?: string;
}

// For tracking API - more flexible interface
export interface TrackingEvent {
  name: string;
  properties?: Record<string, any>;
  timestamp?: number;
}

export interface AnalyticsMetrics {
  totalEvents: number;
  uniqueUsers: number;
  averageSessionDuration: number;
  topEvents: Array<{ event: string; count: number }>;
  userRetention: {
    daily: number;
    weekly: number;
    monthly: number;
  };
  performanceMetrics: {
    pageLoadTime: number;
    apiResponseTime: number;
    errorRate: number;
  };
}

export class AnalyticsService {
  private events: AnalyticsEvent[] = [];
  private websocket: WebSocket | null = null;
  private apiKey: string;
  private apiUrl: string;

  constructor(apiKey: string, apiUrl: string = 'http://localhost:3003') {
    this.apiKey = apiKey;
    this.apiUrl = apiUrl;
    this.initializeWebSocket();
  }

  private initializeWebSocket() {
    try {
      if (typeof WebSocket === 'undefined') return; // Server-side guard

      this.websocket = new WebSocket('ws://localhost:3002');

      this.websocket.onopen = () => {
        console.log('Analytics WebSocket connected');
      };

      this.websocket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === 'analytics_event') {
          this.handleRealTimeEvent(data.payload);
        }
      };

      this.websocket.onclose = () => {
        console.log('Analytics WebSocket disconnected');
        // Attempt to reconnect after 5 seconds
        setTimeout(() => this.initializeWebSocket(), 5000);
      };

      this.websocket.onerror = (error) => {
        console.error('Analytics WebSocket error:', error);
      };
    } catch (error) {
      console.error('Failed to initialize WebSocket:', error);
    }
  }

  // Track an analytics event
  track(event: AnalyticsEvent | TrackingEvent) {
    let normalizedEvent: AnalyticsEvent;

    if ('name' in event) {
      // TrackingEvent format
      normalizedEvent = {
        event: event.name,
        properties: event.properties || {},
        timestamp: event.timestamp ? new Date(event.timestamp) : new Date(),
        userId: undefined,
        sessionId: undefined
      };
    } else {
      // AnalyticsEvent format
      normalizedEvent = {
        ...event,
        timestamp: event.timestamp || new Date()
      };
    }

    // Store locally
    this.events.push(normalizedEvent);

    // Send to real-time stream
    if (this.websocket && this.websocket.readyState === WebSocket.OPEN) {
      this.websocket.send(JSON.stringify({
        type: 'track_event',
        payload: normalizedEvent
      }));
    }

    // Send to analytics API
    this.sendToAPI(normalizedEvent);
  }

  private async sendToAPI(event: AnalyticsEvent) {
    try {
      if (typeof fetch === 'undefined') return; // Server-side guard

      await fetch(`${this.apiUrl}/track`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify(event),
      });
    } catch (error) {
      console.error('Failed to send analytics event:', error);
    }
  }

  private handleRealTimeEvent(event: AnalyticsEvent) {
    this.events.push(event);

    // Trigger any real-time analytics updates
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('analytics:event', {
        detail: event
      }));
    }
  }

  // Get analytics metrics for a time range
  async getMetrics(timeRange: '1h' | '24h' | '7d' | '30d' = '24h'): Promise<AnalyticsMetrics> {
    try {
      if (typeof fetch !== 'undefined') {
        const response = await fetch(`${this.apiUrl}/metrics?range=${timeRange}`, {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
          },
        });

        if (response.ok) {
          return await response.json();
        }
      }
    } catch (error) {
      console.error('Failed to fetch metrics:', error);
    }

    // Fallback to mock data
    return this.getMockMetrics();
  }

  private getMockMetrics(): AnalyticsMetrics {
    return {
      totalEvents: 15420,
      uniqueUsers: 3240,
      averageSessionDuration: 8.5,
      topEvents: [
        { event: 'page_view', count: 8240 },
        { event: 'button_click', count: 3120 },
        { event: 'form_submit', count: 1580 },
        { event: 'search', count: 980 },
        { event: 'download', count: 420 },
      ],
      userRetention: {
        daily: 0.72,
        weekly: 0.45,
        monthly: 0.28,
      },
      performanceMetrics: {
        pageLoadTime: 2.3,
        apiResponseTime: 180,
        errorRate: 0.02,
      },
    };
  }

  // Get insights for analytics dashboard
  async getInsights(timeRange: string = '24h') {
    try {
      if (typeof fetch !== 'undefined') {
        const response = await fetch(`${this.apiUrl}/insights?range=${timeRange}`, {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
          },
        });

        if (response.ok) {
          return await response.json();
        }
      }
    } catch (error) {
      console.error('Failed to fetch insights:', error);
    }

    // Fallback to mock insights
    return {
      pageViews: 12450,
      uniqueUsers: 3240,
      sessions: 4580,
      avgSessionDuration: 8.5,
      topPages: [
        { path: '/dashboard', views: 4580 },
        { path: '/enhanced', views: 3240 },
        { path: '/settings', views: 1890 },
        { path: '/profile', views: 1230 },
        { path: '/help', views: 890 },
      ],
      userFlow: [
        { from: '/dashboard', to: '/enhanced', count: 1580 },
        { from: '/enhanced', to: '/settings', count: 890 },
        { from: '/dashboard', to: '/settings', count: 640 },
      ],
      aiInteractions: {
        total: 2580,
        successful: 2450,
        failed: 130,
        avgResponseTime: 1.8,
      },
      performanceMetrics: {
        loadTime: 2.3,
        renderTime: 0.8,
        apiResponseTime: 180,
      }
    };
  }

  // Real-time event stream for dashboard updates
  onEvent(callback: (event: AnalyticsEvent) => void) {
    if (typeof window !== 'undefined') {
      window.addEventListener('analytics:event', (e: any) => {
        callback(e.detail);
      });
    }
  }

  // Clean up resources
  destroy() {
    if (this.websocket) {
      this.websocket.close();
      this.websocket = null;
    }
  }
}

// Singleton instance
export const analyticsService = new AnalyticsService('dev_analytics_key');

// AI-Powered Insights Service
export class AIInsightsService {
  private analyticsService: AnalyticsService;

  constructor(analyticsService: AnalyticsService) {
    this.analyticsService = analyticsService;
  }

  async getAIInsights(timeRange: string = '24h') {
    const data = await this.analyticsService.getInsights(timeRange);

    // AI-powered analysis (mock implementation)
    return {
      summary: 'User engagement is up 15% compared to last week',
      recommendations: [
        'Consider A/B testing the new dashboard layout',
        'Optimize load times for the most visited pages',
        'Implement user onboarding improvements'
      ],
      predictions: {
        nextWeekGrowth: '+8%',
        churnRisk: 'Low',
        conversionPotential: 'High'
      },
      anomalies: [
        'Unusual spike in mobile traffic on Tuesday',
        'API response times 20% slower than average'
      ]
    };
  }

  async predictUserBehavior(userId: string) {
    // Mock user behavior prediction
    return {
      returnProbability: 0.78,
      nextActions: [
        { action: 'view_dashboard', probability: 0.65 },
        { action: 'edit_profile', probability: 0.23 },
        { action: 'use_ai_assistant', probability: 0.89 }
      ],
      engagementStrategies: [
        'Send personalized AI insights notification',
        'Highlight new features in the enhanced dashboard',
        'Offer productivity tips based on usage patterns'
      ],
      churnRisk: 'Low',
      confidence: 0.82
    };
  }
}

// Singleton AI insights service
export const aiInsightsService = new AIInsightsService(analyticsService);
