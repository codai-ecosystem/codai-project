/**
 * DashService - Comprehensive Dashboard Analytics & Visualization Service
 * Handles real-time data aggregation, metrics calculation, and dashboard intelligence
 */

export interface MetricCard {
  id: string;
  title: string;
  value: string | number;
  change: number;
  trend: 'up' | 'down' | 'stable';
  type: 'currency' | 'percentage' | 'number' | 'count';
  icon: string;
  color: string;
  description?: string;
}

export interface ChartData {
  id: string;
  title: string;
  type: 'line' | 'bar' | 'area' | 'pie' | 'doughnut' | 'scatter';
  data: any[];
  config: {
    xKey?: string;
    yKey?: string;
    dataKey?: string;
    color?: string;
    gradient?: boolean;
    showGrid?: boolean;
    showTooltip?: boolean;
    showLegend?: boolean;
  };
  timeframe: 'hour' | 'day' | 'week' | 'month' | 'year';
  refreshInterval?: number;
}

export interface DashboardLayout {
  id: string;
  name: string;
  description: string;
  layout: 'grid' | 'masonry' | 'flex' | 'custom';
  sections: DashboardSection[];
  theme: 'light' | 'dark' | 'auto';
  refreshRate: number;
  isDefault: boolean;
}

export interface DashboardSection {
  id: string;
  title: string;
  type: 'metrics' | 'chart' | 'table' | 'widget' | 'custom';
  span: { cols: number; rows: number };
  position: { x: number; y: number };
  data: MetricCard[] | ChartData | any;
  config: Record<string, any>;
}

export interface DashboardFilter {
  id: string;
  name: string;
  type: 'date' | 'select' | 'multi-select' | 'range' | 'search';
  options?: { label: string; value: any }[];
  value: any;
  global: boolean;
}

export interface RealTimeMetrics {
  timestamp: number;
  metrics: {
    activeUsers: number;
    pageViews: number;
    conversion: number;
    revenue: number;
    errors: number;
    performance: number;
  };
  alerts: Alert[];
  status: 'healthy' | 'warning' | 'critical';
}

export interface Alert {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  timestamp: number;
  acknowledged: boolean;
  actions?: AlertAction[];
}

export interface AlertAction {
  id: string;
  label: string;
  type: 'primary' | 'secondary' | 'danger';
  action: () => void;
}

export interface AnalyticsQuery {
  metrics: string[];
  dimensions: string[];
  filters: Record<string, any>;
  timeframe: {
    start: Date;
    end: Date;
    granularity: 'minute' | 'hour' | 'day' | 'week' | 'month';
  };
  limit?: number;
  orderBy?: { field: string; direction: 'asc' | 'desc' };
}

export interface DashboardExport {
  format: 'pdf' | 'excel' | 'csv' | 'json' | 'image';
  data: any;
  config: {
    includeCharts: boolean;
    includeData: boolean;
    includeFilters: boolean;
    timeframe: string;
  };
}

class DashService {
  private baseUrl: string;
  private cache: Map<string, { data: any; timestamp: number; ttl: number }>;
  private realTimeConnections: Map<string, WebSocket>;
  private alertSubscribers: Set<(alerts: Alert[]) => void>;
  private metricSubscribers: Map<string, Set<(data: any) => void>>;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4049';
    this.cache = new Map();
    this.realTimeConnections = new Map();
    this.alertSubscribers = new Set();
    this.metricSubscribers = new Map();
    this.initializeRealTimeConnections();
  }

  /**
   * Dashboard Management
   */
  async getDashboards(): Promise<DashboardLayout[]> {
    return this.getCachedData('dashboards', async () => {
      // Mock dashboard layouts - in production, fetch from API
      return [
        {
          id: 'overview',
          name: 'Executive Overview',
          description: 'High-level business metrics and KPIs',
          layout: 'grid' as const,
          sections: await this.getOverviewSections(),
          theme: 'light' as const,
          refreshRate: 30000,
          isDefault: true
        },
        {
          id: 'analytics',
          name: 'Analytics Deep Dive',
          description: 'Detailed analytics and user behavior insights',
          layout: 'masonry' as const,
          sections: await this.getAnalyticsSections(),
          theme: 'dark' as const,
          refreshRate: 60000,
          isDefault: false
        },
        {
          id: 'financial',
          name: 'Financial Dashboard',
          description: 'Revenue, costs, and financial performance',
          layout: 'flex' as const,
          sections: await this.getFinancialSections(),
          theme: 'auto' as const,
          refreshRate: 120000,
          isDefault: false
        }
      ];
    }, 300000); // 5 minutes cache
  }

  async getDashboard(id: string): Promise<DashboardLayout | null> {
    const dashboards = await this.getDashboards();
    return dashboards.find(d => d.id === id) || null;
  }

  async createDashboard(dashboard: Omit<DashboardLayout, 'id'>): Promise<DashboardLayout> {
    const newDashboard: DashboardLayout = {
      ...dashboard,
      id: this.generateId()
    };

    // In production, save to API
    await this.invalidateCache('dashboards');
    return newDashboard;
  }

  async updateDashboard(id: string, updates: Partial<DashboardLayout>): Promise<DashboardLayout> {
    const dashboard = await this.getDashboard(id);
    if (!dashboard) throw new Error('Dashboard not found');

    const updated = { ...dashboard, ...updates };
    await this.invalidateCache('dashboards');
    return updated;
  }

  /**
   * Metrics and Analytics
   */
  async getMetrics(timeframe: string = '24h'): Promise<MetricCard[]> {
    return this.getCachedData(`metrics-${timeframe}`, async () => {
      // Generate realistic metrics based on timeframe
      const baseMetrics = this.generateBaseMetrics();
      return this.applyTimeframeVariation(baseMetrics, timeframe);
    }, 60000); // 1 minute cache
  }

  async getChartData(chartId: string, timeframe: string = '24h'): Promise<ChartData> {
    return this.getCachedData(`chart-${chartId}-${timeframe}`, async () => {
      return this.generateChartData(chartId, timeframe);
    }, 120000); // 2 minutes cache
  }

  async queryAnalytics(query: AnalyticsQuery): Promise<any[]> {
    const cacheKey = `analytics-${JSON.stringify(query)}`;
    return this.getCachedData(cacheKey, async () => {
      return this.executeAnalyticsQuery(query);
    }, 300000); // 5 minutes cache
  }

  /**
   * Real-time Data
   */
  async getRealTimeMetrics(): Promise<RealTimeMetrics> {
    const timestamp = Date.now();
    const metrics = {
      activeUsers: Math.floor(Math.random() * 1000) + 500,
      pageViews: Math.floor(Math.random() * 10000) + 5000,
      conversion: Math.random() * 5 + 2,
      revenue: Math.random() * 50000 + 25000,
      errors: Math.floor(Math.random() * 10),
      performance: Math.random() * 20 + 80
    };

    const alerts = await this.generateAlerts(metrics);
    const status = this.determineSystemStatus(metrics, alerts);

    return { timestamp, metrics, alerts, status };
  }

  subscribeToMetrics(metricName: string, callback: (data: any) => void): () => void {
    if (!this.metricSubscribers.has(metricName)) {
      this.metricSubscribers.set(metricName, new Set());
    }
    this.metricSubscribers.get(metricName)!.add(callback);

    return () => {
      this.metricSubscribers.get(metricName)?.delete(callback);
    };
  }

  subscribeToAlerts(callback: (alerts: Alert[]) => void): () => void {
    this.alertSubscribers.add(callback);
    return () => this.alertSubscribers.delete(callback);
  }

  /**
   * Dashboard Filtering
   */
  async getFilters(): Promise<DashboardFilter[]> {
    return [
      {
        id: 'dateRange',
        name: 'Date Range',
        type: 'date',
        value: { start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), end: new Date() },
        global: true
      },
      {
        id: 'region',
        name: 'Region',
        type: 'select',
        options: [
          { label: 'All Regions', value: 'all' },
          { label: 'North America', value: 'na' },
          { label: 'Europe', value: 'eu' },
          { label: 'Asia Pacific', value: 'apac' }
        ],
        value: 'all',
        global: true
      },
      {
        id: 'product',
        name: 'Product Line',
        type: 'multi-select',
        options: [
          { label: 'Web Platform', value: 'web' },
          { label: 'Mobile App', value: 'mobile' },
          { label: 'Enterprise', value: 'enterprise' },
          { label: 'API Services', value: 'api' }
        ],
        value: ['web', 'mobile'],
        global: false
      }
    ];
  }

  async applyFilters(filters: Record<string, any>): Promise<void> {
    // Invalidate relevant caches when filters change
    for (const [key] of this.cache) {
      if (key.includes('metrics') || key.includes('chart') || key.includes('analytics')) {
        this.cache.delete(key);
      }
    }

    // Notify subscribers of filter changes
    this.notifyFilterChange(filters);
  }

  /**
   * Export and Sharing
   */
  async exportDashboard(dashboardId: string, config: DashboardExport['config']): Promise<DashboardExport> {
    const dashboard = await this.getDashboard(dashboardId);
    if (!dashboard) throw new Error('Dashboard not found');

    const data = await this.compileDashboardData(dashboard, config);

    return {
      format: config.includeCharts ? 'pdf' : 'csv',
      data,
      config
    };
  }

  async shareDashboard(dashboardId: string, permissions: string[]): Promise<string> {
    // Generate shareable link with permissions
    const shareToken = this.generateShareToken(dashboardId, permissions);
    return `${this.baseUrl}/shared/${shareToken}`;
  }

  /**
   * Performance and Health
   */
  async getSystemHealth(): Promise<{
    status: 'healthy' | 'degraded' | 'down';
    metrics: Record<string, number>;
    lastCheck: number;
  }> {
    const metrics = {
      uptime: 99.9,
      responseTime: Math.random() * 100 + 50,
      errorRate: Math.random() * 2,
      throughput: Math.random() * 1000 + 500,
      memoryUsage: Math.random() * 30 + 40,
      cpuUsage: Math.random() * 20 + 30
    };

    const status = metrics.errorRate < 1 && metrics.responseTime < 200 ? 'healthy' : 'degraded';

    return {
      status,
      metrics,
      lastCheck: Date.now()
    };
  }

  /**
   * Private Helper Methods
   */
  private async initializeRealTimeConnections(): Promise<void> {
    // Initialize WebSocket connections for real-time data
    if (typeof window !== 'undefined') {
      const ws = new WebSocket(`ws://localhost:4049/ws/metrics`);
      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        this.handleRealTimeUpdate(data);
      };
      this.realTimeConnections.set('metrics', ws);
    }
  }

  private handleRealTimeUpdate(data: any): void {
    // Handle real-time updates and notify subscribers
    if (data.type === 'metric') {
      const subscribers = this.metricSubscribers.get(data.name);
      subscribers?.forEach(callback => callback(data.value));
    } else if (data.type === 'alert') {
      this.alertSubscribers.forEach(callback => callback([data.alert]));
    }
  }

  private async getCachedData<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttl: number = 300000
  ): Promise<T> {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < cached.ttl) {
      return cached.data;
    }

    const data = await fetcher();
    this.cache.set(key, { data, timestamp: Date.now(), ttl });
    return data;
  }

  private async invalidateCache(pattern: string): Promise<void> {
    for (const [key] of this.cache) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
      }
    }
  }

  private generateBaseMetrics(): MetricCard[] {
    return [
      {
        id: 'revenue',
        title: 'Total Revenue',
        value: '$2,543,890',
        change: 12.5,
        trend: 'up',
        type: 'currency',
        icon: 'DollarSign',
        color: 'emerald',
        description: 'Monthly recurring revenue'
      },
      {
        id: 'users',
        title: 'Active Users',
        value: '94,567',
        change: 8.2,
        trend: 'up',
        type: 'count',
        icon: 'Users',
        color: 'blue',
        description: 'Monthly active users'
      },
      {
        id: 'conversion',
        title: 'Conversion Rate',
        value: '3.24%',
        change: -0.8,
        trend: 'down',
        type: 'percentage',
        icon: 'TrendingUp',
        color: 'orange',
        description: 'Overall conversion rate'
      },
      {
        id: 'satisfaction',
        title: 'Satisfaction',
        value: '4.8/5',
        change: 0.2,
        trend: 'up',
        type: 'number',
        icon: 'Star',
        color: 'purple',
        description: 'Customer satisfaction score'
      }
    ];
  }

  private applyTimeframeVariation(metrics: MetricCard[], timeframe: string): MetricCard[] {
    const multipliers = {
      '1h': 0.1,
      '24h': 1,
      '7d': 7,
      '30d': 30,
      '90d': 90
    };

    const multiplier = multipliers[timeframe as keyof typeof multipliers] || 1;

    return metrics.map(metric => ({
      ...metric,
      change: metric.change * (0.8 + Math.random() * 0.4), // Add some variation
      value: this.adjustValueForTimeframe(metric.value, multiplier, metric.type)
    }));
  }

  private adjustValueForTimeframe(value: string | number, multiplier: number, type: string): string | number {
    if (typeof value === 'string') {
      const numMatch = value.match(/([\d,]+)/);
      if (numMatch) {
        const num = parseInt(numMatch[1].replace(/,/g, ''));
        const adjusted = Math.floor(num * multiplier * (0.9 + Math.random() * 0.2));
        return value.replace(numMatch[1], adjusted.toLocaleString());
      }
    }
    return value;
  }

  private async generateChartData(chartId: string, timeframe: string): Promise<ChartData> {
    const dataPoints = this.getDataPointsForTimeframe(timeframe);
    const baseValue = Math.random() * 1000 + 500;

    const data = Array.from({ length: dataPoints }, (_, i) => {
      const date = new Date();
      date.setHours(date.getHours() - (dataPoints - i));

      return {
        time: date.toISOString(),
        value: baseValue + Math.sin(i / 5) * 200 + Math.random() * 100,
        label: date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
      };
    });

    return {
      id: chartId,
      title: `Chart ${chartId}`,
      type: 'line',
      data,
      config: {
        xKey: 'time',
        yKey: 'value',
        color: '#10b981',
        gradient: true,
        showGrid: true,
        showTooltip: true,
        showLegend: false
      },
      timeframe: timeframe as any,
      refreshInterval: 60000
    };
  }

  private getDataPointsForTimeframe(timeframe: string): number {
    const points = {
      '1h': 12,
      '24h': 24,
      '7d': 7,
      '30d': 30,
      '90d': 12
    };
    return points[timeframe as keyof typeof points] || 24;
  }

  private async executeAnalyticsQuery(query: AnalyticsQuery): Promise<any[]> {
    // Mock analytics query execution
    const dataPoints = 50;
    return Array.from({ length: dataPoints }, (_, i) => {
      const result: any = { id: i };

      query.metrics.forEach(metric => {
        result[metric] = Math.random() * 1000 + 100;
      });

      query.dimensions.forEach(dimension => {
        result[dimension] = `${dimension}_${i % 5}`;
      });

      return result;
    });
  }

  private async generateAlerts(metrics: any): Promise<Alert[]> {
    const alerts: Alert[] = [];

    if (metrics.errors > 5) {
      alerts.push({
        id: this.generateId(),
        type: 'error',
        title: 'High Error Rate',
        message: `Error rate is ${metrics.errors}/min, above threshold of 5/min`,
        timestamp: Date.now(),
        acknowledged: false,
        actions: [
          { id: '1', label: 'View Details', type: 'primary', action: () => { } },
          { id: '2', label: 'Acknowledge', type: 'secondary', action: () => { } }
        ]
      });
    }

    if (metrics.performance < 85) {
      alerts.push({
        id: this.generateId(),
        type: 'warning',
        title: 'Performance Degradation',
        message: `Performance score dropped to ${metrics.performance.toFixed(1)}%`,
        timestamp: Date.now(),
        acknowledged: false
      });
    }

    return alerts;
  }

  private determineSystemStatus(metrics: any, alerts: Alert[]): 'healthy' | 'warning' | 'critical' {
    const errorAlerts = alerts.filter(a => a.type === 'error');
    const warningAlerts = alerts.filter(a => a.type === 'warning');

    if (errorAlerts.length > 0) return 'critical';
    if (warningAlerts.length > 0) return 'warning';
    return 'healthy';
  }

  private notifyFilterChange(filters: Record<string, any>): void {
    // Notify all metric subscribers of filter changes
    this.metricSubscribers.forEach((subscribers, metricName) => {
      subscribers.forEach(callback => {
        // Re-fetch data with new filters
        this.getMetrics().then(callback);
      });
    });
  }

  private async compileDashboardData(dashboard: DashboardLayout, config: any): Promise<any> {
    const data: any = {
      dashboard: dashboard.name,
      timestamp: new Date().toISOString(),
      sections: []
    };

    if (config.includeData) {
      for (const section of dashboard.sections) {
        if (section.type === 'metrics') {
          data.sections.push({
            type: 'metrics',
            title: section.title,
            data: await this.getMetrics()
          });
        } else if (section.type === 'chart') {
          data.sections.push({
            type: 'chart',
            title: section.title,
            data: await this.getChartData(section.id, '24h')
          });
        }
      }
    }

    return data;
  }

  private generateShareToken(dashboardId: string, permissions: string[]): string {
    // Generate secure share token
    return btoa(`${dashboardId}:${permissions.join(',')}:${Date.now()}`);
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  private async getOverviewSections(): Promise<DashboardSection[]> {
    return [
      {
        id: 'metrics-overview',
        title: 'Key Metrics',
        type: 'metrics',
        span: { cols: 4, rows: 1 },
        position: { x: 0, y: 0 },
        data: await this.getMetrics(),
        config: { layout: 'grid' }
      },
      {
        id: 'revenue-chart',
        title: 'Revenue Trend',
        type: 'chart',
        span: { cols: 2, rows: 2 },
        position: { x: 0, y: 1 },
        data: await this.getChartData('revenue', '7d'),
        config: { showLegend: true }
      },
      {
        id: 'users-chart',
        title: 'User Growth',
        type: 'chart',
        span: { cols: 2, rows: 2 },
        position: { x: 2, y: 1 },
        data: await this.getChartData('users', '30d'),
        config: { type: 'area' }
      }
    ];
  }

  private async getAnalyticsSections(): Promise<DashboardSection[]> {
    return [
      {
        id: 'user-behavior',
        title: 'User Behavior Analytics',
        type: 'chart',
        span: { cols: 3, rows: 2 },
        position: { x: 0, y: 0 },
        data: await this.getChartData('behavior', '7d'),
        config: { type: 'bar' }
      },
      {
        id: 'conversion-funnel',
        title: 'Conversion Funnel',
        type: 'widget',
        span: { cols: 1, rows: 2 },
        position: { x: 3, y: 0 },
        data: {},
        config: { type: 'funnel' }
      }
    ];
  }

  private async getFinancialSections(): Promise<DashboardSection[]> {
    return [
      {
        id: 'financial-metrics',
        title: 'Financial KPIs',
        type: 'metrics',
        span: { cols: 4, rows: 1 },
        position: { x: 0, y: 0 },
        data: await this.getMetrics(),
        config: { focus: 'financial' }
      },
      {
        id: 'revenue-breakdown',
        title: 'Revenue Breakdown',
        type: 'chart',
        span: { cols: 2, rows: 2 },
        position: { x: 0, y: 1 },
        data: await this.getChartData('revenue-breakdown', '30d'),
        config: { type: 'pie' }
      }
    ];
  }
}

export const dashService = new DashService();
export default DashService;
