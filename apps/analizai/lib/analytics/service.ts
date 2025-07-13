/**
 * Analytics Service for AnalizAI
 * Provides data collection, processing, and insights generation
 */

interface MetricData {
  id: string;
  title: string;
  value: string | number;
  change: number;
  changeType: 'positive' | 'negative' | 'neutral';
  unit?: string;
  format?: 'number' | 'currency' | 'percentage';
  trend?: number[];
}

interface EventData {
  event: string;
  source: string;
  properties: Record<string, any>;
  userId?: string;
  sessionId?: string;
  timestamp: string;
}

interface AnalyticsQuery {
  timeframe: string;
  source?: string | null;
  filters?: Record<string, any>;
}

interface ChartData {
  labels: string[];
  datasets: Array<{
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string;
    borderWidth?: number;
    fill?: boolean;
  }>;
}

class AnalyticsService {
  private events: EventData[] = [];

  constructor() {
    // Initialize with some mock data for development
    this.initializeMockData();
  }

  private initializeMockData() {
    // Generate mock events for the last 30 days
    const sources = ['web', 'mobile', 'api', 'dashboard'];
    const eventTypes = [
      'page_view',
      'click',
      'conversion',
      'signup',
      'purchase',
    ];

    for (let i = 0; i < 1000; i++) {
      const daysAgo = Math.floor(Math.random() * 30);
      const timestamp = new Date();
      timestamp.setDate(timestamp.getDate() - daysAgo);

      this.events.push({
        event: eventTypes[Math.floor(Math.random() * eventTypes.length)],
        source: sources[Math.floor(Math.random() * sources.length)],
        properties: {
          value: Math.random() * 1000,
          category: `category_${Math.floor(Math.random() * 5)}`,
          region: ['US', 'EU', 'ASIA'][Math.floor(Math.random() * 3)],
        },
        userId: `user_${Math.floor(Math.random() * 100)}`,
        sessionId: `session_${Math.floor(Math.random() * 500)}`,
        timestamp: timestamp.toISOString(),
      });
    }
  }

  async getMetrics(query: AnalyticsQuery): Promise<MetricData[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 200));

    const filteredEvents = this.filterEventsByTimeframe(query.timeframe);

    return [
      {
        id: '1',
        title: 'Total Events',
        value: filteredEvents.length,
        change: this.calculateChange(filteredEvents, 'count'),
        changeType: 'positive',
        format: 'number',
        trend: this.getTrendData(filteredEvents, 'count'),
      },
      {
        id: '2',
        title: 'Unique Users',
        value: new Set(filteredEvents.map(e => e.userId)).size,
        change: this.calculateChange(filteredEvents, 'users'),
        changeType: 'positive',
        format: 'number',
        trend: this.getTrendData(filteredEvents, 'users'),
      },
      {
        id: '3',
        title: 'Conversion Rate',
        value: this.calculateConversionRate(filteredEvents),
        change: this.calculateChange(filteredEvents, 'conversion'),
        changeType: 'positive',
        format: 'percentage',
        trend: this.getTrendData(filteredEvents, 'conversion'),
      },
      {
        id: '4',
        title: 'Average Session Duration',
        value: this.calculateAverageSessionDuration(filteredEvents),
        change: this.calculateChange(filteredEvents, 'duration'),
        changeType: 'positive',
        unit: 'minutes',
        trend: this.getTrendData(filteredEvents, 'duration'),
      },
      {
        id: '5',
        title: 'Revenue',
        value: this.calculateRevenue(filteredEvents),
        change: this.calculateChange(filteredEvents, 'revenue'),
        changeType: 'positive',
        format: 'currency',
        trend: this.getTrendData(filteredEvents, 'revenue'),
      },
      {
        id: '6',
        title: 'Bounce Rate',
        value: this.calculateBounceRate(filteredEvents),
        change: this.calculateChange(filteredEvents, 'bounce'),
        changeType: 'negative',
        format: 'percentage',
        trend: this.getTrendData(filteredEvents, 'bounce'),
      },
    ];
  }

  async trackEvent(eventData: EventData): Promise<{ id: string }> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 100));

    const eventWithId = {
      ...eventData,
      id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };

    this.events.push(eventWithId);

    return { id: eventWithId.id };
  }

  async getChartData(type: string, timeframe: string): Promise<ChartData> {
    await new Promise(resolve => setTimeout(resolve, 150));

    const filteredEvents = this.filterEventsByTimeframe(timeframe);

    switch (type) {
      case 'revenue_trend':
        return this.generateRevenueTrendData(filteredEvents);
      case 'traffic_sources':
        return this.generateTrafficSourcesData(filteredEvents);
      case 'user_behavior':
        return this.generateUserBehaviorData(filteredEvents);
      case 'conversion_funnel':
        return this.generateConversionFunnelData(filteredEvents);
      default:
        return this.generateDefaultChartData(filteredEvents);
    }
  }

  async getInsights(timeframe: string): Promise<string[]> {
    await new Promise(resolve => setTimeout(resolve, 100));

    const filteredEvents = this.filterEventsByTimeframe(timeframe);
    const insights: string[] = [];

    // Generate AI-powered insights
    const conversionRate = this.calculateConversionRate(filteredEvents);
    const uniqueUsers = new Set(filteredEvents.map(e => e.userId)).size;
    const revenue = this.calculateRevenue(filteredEvents);

    if (conversionRate > 5) {
      insights.push(
        `🎯 Excellent conversion rate of ${conversionRate.toFixed(1)}% - well above industry average`
      );
    }

    if (uniqueUsers > 50) {
      insights.push(
        `👥 Strong user engagement with ${uniqueUsers} unique active users`
      );
    }

    if (revenue > 10000) {
      insights.push(
        `💰 Revenue performance is strong at $${revenue.toLocaleString()}`
      );
    }

    insights.push(
      `📊 Peak activity detected during weekdays between 10 AM - 2 PM`
    );
    insights.push(`🔍 Mobile traffic shows 23% higher engagement than desktop`);
    insights.push(
      `⚡ Page load times optimized - 15% improvement in user experience`
    );

    return insights;
  }

  private filterEventsByTimeframe(timeframe: string): EventData[] {
    const now = new Date();
    const days = parseInt(timeframe.replace('d', '')) || 30;
    const cutoff = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

    return this.events.filter(event => new Date(event.timestamp) >= cutoff);
  }

  private calculateChange(events: EventData[], metric: string): number {
    // Simulate realistic percentage changes
    const changes = {
      count: 12.5,
      users: 8.3,
      conversion: 3.2,
      duration: 5.7,
      revenue: 15.2,
      bounce: -4.1,
    };

    return changes[metric as keyof typeof changes] || 0;
  }

  private getTrendData(events: EventData[], metric: string): number[] {
    // Generate trend data for the last 10 periods
    const trendData: number[] = [];
    const baseValue = Math.random() * 100;

    for (let i = 0; i < 10; i++) {
      const variation = (Math.random() - 0.5) * 20;
      trendData.push(Math.max(0, baseValue + variation + i * 2));
    }

    return trendData;
  }

  private calculateConversionRate(events: EventData[]): number {
    const conversions = events.filter(e => e.event === 'conversion').length;
    const totalEvents = events.length;
    return totalEvents > 0 ? (conversions / totalEvents) * 100 : 0;
  }

  private calculateAverageSessionDuration(events: EventData[]): number {
    // Mock calculation - return minutes
    return Math.round(Math.random() * 30 + 10);
  }

  private calculateRevenue(events: EventData[]): number {
    return events
      .filter(e => e.event === 'purchase')
      .reduce((sum, e) => sum + (e.properties.value || 0), 0);
  }

  private calculateBounceRate(events: EventData[]): number {
    // Mock bounce rate calculation
    return Math.round(Math.random() * 20 + 25);
  }

  private generateRevenueTrendData(events: EventData[]): ChartData {
    const months = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];
    const data = months.map(() => Math.random() * 100000 + 50000);

    return {
      labels: months,
      datasets: [
        {
          label: 'Revenue',
          data,
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          fill: true,
        },
      ],
    };
  }

  private generateTrafficSourcesData(events: EventData[]): ChartData {
    const sources = ['Direct', 'Search', 'Social', 'Email', 'Ads'];
    const data = sources.map(() => Math.random() * 100);

    return {
      labels: sources,
      datasets: [
        {
          label: 'Traffic Sources',
          data,
          backgroundColor: [
            '#3B82F6',
            '#10B981',
            '#F59E0B',
            '#EF4444',
            '#8B5CF6',
          ],
        },
      ],
    };
  }

  private generateUserBehaviorData(events: EventData[]): ChartData {
    const behaviors = [
      'Page Views',
      'Clicks',
      'Downloads',
      'Signups',
      'Purchases',
    ];
    const data = behaviors.map(() => Math.random() * 1000);

    return {
      labels: behaviors,
      datasets: [
        {
          label: 'User Actions',
          data,
          backgroundColor: 'rgba(59, 130, 246, 0.8)',
        },
      ],
    };
  }

  private generateConversionFunnelData(events: EventData[]): ChartData {
    const steps = [
      'Visitors',
      'Product Views',
      'Add to Cart',
      'Checkout',
      'Purchase',
    ];
    const data = [1000, 750, 500, 350, 200]; // Funnel shape

    return {
      labels: steps,
      datasets: [
        {
          label: 'Conversion Funnel',
          data,
          backgroundColor: [
            '#3B82F6',
            '#10B981',
            '#F59E0B',
            '#EF4444',
            '#8B5CF6',
          ],
        },
      ],
    };
  }

  private generateDefaultChartData(events: EventData[]): ChartData {
    const labels = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
    const data = labels.map(() => Math.random() * 100);

    return {
      labels,
      datasets: [
        {
          label: 'Default Metric',
          data,
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
        },
      ],
    };
  }
}

export const analyticsService = new AnalyticsService();
export type { MetricData, EventData, AnalyticsQuery, ChartData };
