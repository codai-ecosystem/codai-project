export interface AnalyticsDataPoint {
  timestamp: string
  value: number
  label?: string
  category?: string
}

export interface AnalyticsMetric {
  id: string
  name: string
  value: number
  change: number
  changeType: 'increase' | 'decrease' | 'neutral'
  format: 'number' | 'percentage' | 'currency' | 'duration'
  icon: string
  color: string
}

export interface AnalyticsChart {
  id: string
  title: string
  type: 'line' | 'bar' | 'pie' | 'area' | 'scatter' | 'heatmap'
  data: AnalyticsDataPoint[]
  xAxis: string
  yAxis: string
  description?: string
  insights?: string[]
}

export interface AnalyticsReport {
  id: string
  title: string
  description: string
  category: 'business' | 'technical' | 'user' | 'performance' | 'financial'
  status: 'generated' | 'generating' | 'scheduled'
  createdAt: string
  updatedAt: string
  metrics: AnalyticsMetric[]
  charts: AnalyticsChart[]
  summary: string
  recommendations: string[]
}

export interface AIInsight {
  id: string
  type: 'trend' | 'anomaly' | 'prediction' | 'recommendation' | 'alert'
  title: string
  description: string
  confidence: number
  impact: 'high' | 'medium' | 'low'
  actionable: boolean
  actionSuggestions?: string[]
  relatedMetrics: string[]
  timestamp: string
}

export interface DataSource {
  id: string
  name: string
  type: 'database' | 'api' | 'file' | 'stream' | 'webhook'
  status: 'connected' | 'disconnected' | 'error' | 'syncing'
  lastSync: string
  recordCount: number
  dataQuality: number
  schema: Record<string, any>
  config: Record<string, any>
}

export interface AnalyticsDashboard {
  id: string
  name: string
  description: string
  isDefault: boolean
  widgets: DashboardWidget[]
  filters: DashboardFilter[]
  createdAt: string
  updatedAt: string
}

export interface DashboardWidget {
  id: string
  type: 'metric' | 'chart' | 'table' | 'text' | 'ai-insight'
  title: string
  position: { x: number; y: number; w: number; h: number }
  config: Record<string, any>
  dataSource?: string
}

export interface DashboardFilter {
  id: string
  name: string
  type: 'date' | 'category' | 'numeric' | 'text'
  values: any[]
  defaultValue?: any
}

export interface AnalyticsUser {
  id: string
  name: string
  email: string
  role: 'admin' | 'analyst' | 'viewer'
  permissions: string[]
  lastLogin: string
  preferences: {
    defaultDashboard?: string
    timezone: string
    dataRefreshRate: number
    notifications: boolean
  }
}

export default class AnalizaiService {
  private static instance: AnalizaiService
  private metrics: Map<string, AnalyticsMetric> = new Map()
  private reports: Map<string, AnalyticsReport> = new Map()
  private insights: Map<string, AIInsight> = new Map()
  private dataSources: Map<string, DataSource> = new Map()
  private dashboards: Map<string, AnalyticsDashboard> = new Map()

  private constructor() {
    this.initializeMockData()
  }

  public static getInstance(): AnalizaiService {
    if (!AnalizaiService.instance) {
      AnalizaiService.instance = new AnalizaiService()
    }
    return AnalizaiService.instance
  }

  private initializeMockData(): void {
    // Mock metrics
    const mockMetrics: AnalyticsMetric[] = [
      {
        id: 'revenue',
        name: 'Total Revenue',
        value: 2847302,
        change: 15.3,
        changeType: 'increase',
        format: 'currency',
        icon: 'TrendingUp',
        color: 'green'
      },
      {
        id: 'users',
        name: 'Active Users',
        value: 124850,
        change: 8.7,
        changeType: 'increase',
        format: 'number',
        icon: 'Users',
        color: 'blue'
      },
      {
        id: 'conversion',
        name: 'Conversion Rate',
        value: 3.4,
        change: -2.1,
        changeType: 'decrease',
        format: 'percentage',
        icon: 'Target',
        color: 'orange'
      },
      {
        id: 'performance',
        name: 'Avg Response Time',
        value: 247,
        change: -12.8,
        changeType: 'decrease',
        format: 'duration',
        icon: 'Zap',
        color: 'purple'
      }
    ]

    // Mock data sources
    const mockDataSources: DataSource[] = [
      {
        id: 'postgres-main',
        name: 'Main Database (PostgreSQL)',
        type: 'database',
        status: 'connected',
        lastSync: '2025-01-21T02:25:00Z',
        recordCount: 2847302,
        dataQuality: 0.96,
        schema: {
          tables: ['users', 'transactions', 'products', 'analytics'],
          lastUpdated: '2025-01-21T02:25:00Z'
        },
        config: {
          host: 'prod-db.codai.ro',
          port: 5432,
          database: 'analytics'
        }
      },
      {
        id: 'api-analytics',
        name: 'Google Analytics API',
        type: 'api',
        status: 'connected',
        lastSync: '2025-01-21T02:20:00Z',
        recordCount: 1250847,
        dataQuality: 0.94,
        schema: {
          endpoints: ['/analytics/reports', '/analytics/realtime'],
          lastUpdated: '2025-01-21T02:20:00Z'
        },
        config: {
          apiKey: 'GA4-***-HIDDEN',
          propertyId: '12345678'
        }
      },
      {
        id: 'stream-events',
        name: 'Real-time Events Stream',
        type: 'stream',
        status: 'connected',
        lastSync: '2025-01-21T02:30:00Z',
        recordCount: 45678,
        dataQuality: 0.98,
        schema: {
          eventTypes: ['user_action', 'system_event', 'error', 'performance'],
          lastUpdated: '2025-01-21T02:30:00Z'
        },
        config: {
          streamUrl: 'wss://events.codai.ro/stream',
          format: 'json'
        }
      }
    ]

    // Mock AI insights
    const mockInsights: AIInsight[] = [
      {
        id: 'trend-1',
        type: 'trend',
        title: 'Significant Revenue Growth Detected',
        description: 'Revenue has increased by 23% over the past 7 days, primarily driven by premium subscriptions.',
        confidence: 0.92,
        impact: 'high',
        actionable: true,
        actionSuggestions: [
          'Increase marketing spend on premium features',
          'Analyze successful conversion patterns',
          'Prepare infrastructure for continued growth'
        ],
        relatedMetrics: ['revenue', 'conversion'],
        timestamp: '2025-01-21T02:00:00Z'
      },
      {
        id: 'anomaly-1',
        type: 'anomaly',
        title: 'Unusual Traffic Spike in Eastern Europe',
        description: 'Traffic from Romania, Bulgaria, and Hungary increased by 150% in the last 4 hours.',
        confidence: 0.87,
        impact: 'medium',
        actionable: true,
        actionSuggestions: [
          'Monitor server performance in EU region',
          'Check for marketing campaign results',
          'Prepare customer support for Romanian users'
        ],
        relatedMetrics: ['users', 'performance'],
        timestamp: '2025-01-21T01:45:00Z'
      },
      {
        id: 'prediction-1',
        type: 'prediction',
        title: 'Monthly Revenue Target Achievement',
        description: 'Based on current trends, there\'s a 94% probability of exceeding monthly revenue target by 12%.',
        confidence: 0.94,
        impact: 'high',
        actionable: true,
        actionSuggestions: [
          'Prepare quarterly forecast adjustment',
          'Consider expanding team capacity',
          'Plan celebration for team milestone'
        ],
        relatedMetrics: ['revenue', 'conversion'],
        timestamp: '2025-01-21T01:30:00Z'
      },
      {
        id: 'alert-1',
        type: 'alert',
        title: 'Response Time Degradation',
        description: 'Average API response time increased by 40% in the past 2 hours.',
        confidence: 0.98,
        impact: 'high',
        actionable: true,
        actionSuggestions: [
          'Check database connection pool',
          'Review recent deployments',
          'Scale up server instances',
          'Notify DevOps team immediately'
        ],
        relatedMetrics: ['performance'],
        timestamp: '2025-01-21T02:15:00Z'
      }
    ]

    // Generate sample time series data
    const generateTimeSeriesData = (days: number, baseValue: number, variance: number): AnalyticsDataPoint[] => {
      const data: AnalyticsDataPoint[] = []
      const now = new Date()

      for (let i = days; i >= 0; i--) {
        const date = new Date(now.getTime() - (i * 24 * 60 * 60 * 1000))
        const randomVariance = (Math.random() - 0.5) * variance * 2
        const trendValue = baseValue + (days - i) * 10 // Slight upward trend
        const value = Math.max(0, Math.round(trendValue + randomVariance))

        data.push({
          timestamp: date.toISOString(),
          value,
          label: date.toLocaleDateString('ro-RO', { month: 'short', day: 'numeric' })
        })
      }
      return data
    }

    // Mock reports with charts
    const mockReports: AnalyticsReport[] = [
      {
        id: 'monthly-business-report',
        title: 'Monthly Business Performance',
        description: 'Comprehensive analysis of business metrics for January 2025',
        category: 'business',
        status: 'generated',
        createdAt: '2025-01-21T00:00:00Z',
        updatedAt: '2025-01-21T02:00:00Z',
        metrics: mockMetrics,
        charts: [
          {
            id: 'revenue-trend',
            title: 'Revenue Trend (30 Days)',
            type: 'line',
            data: generateTimeSeriesData(30, 85000, 15000),
            xAxis: 'Date',
            yAxis: 'Revenue (RON)',
            description: 'Daily revenue trends showing consistent growth',
            insights: ['Strong upward trend', '15% month-over-month growth', 'Peak performance on weekends']
          },
          {
            id: 'user-growth',
            title: 'User Growth (30 Days)',
            type: 'area',
            data: generateTimeSeriesData(30, 4000, 800),
            xAxis: 'Date',
            yAxis: 'New Users',
            description: 'New user registrations over time',
            insights: ['Steady growth pattern', 'Marketing campaigns driving results', 'Higher conversion on mobile']
          },
          {
            id: 'conversion-funnel',
            title: 'Conversion Funnel Analysis',
            type: 'bar',
            data: [
              { timestamp: '2025-01-21', value: 100000, label: 'Visitors', category: 'funnel' },
              { timestamp: '2025-01-21', value: 25000, label: 'Sign-ups', category: 'funnel' },
              { timestamp: '2025-01-21', value: 8500, label: 'Trial Users', category: 'funnel' },
              { timestamp: '2025-01-21', value: 2890, label: 'Paid Users', category: 'funnel' }
            ],
            xAxis: 'Funnel Stage',
            yAxis: 'Count',
            description: 'User conversion through the sales funnel',
            insights: ['25% visitor to sign-up rate', '34% trial to paid conversion', 'Room for improvement in trial conversion']
          }
        ],
        summary: 'Strong business performance with 15.3% revenue growth and healthy user acquisition patterns. Response time issues require immediate attention.',
        recommendations: [
          'Continue investing in successful marketing channels',
          'Optimize trial-to-paid conversion flow',
          'Address performance issues to maintain user satisfaction',
          'Expand premium feature offerings'
        ]
      }
    ]

    // Store data
    mockMetrics.forEach(metric => {
      this.metrics.set(metric.id, metric)
    })

    mockDataSources.forEach(source => {
      this.dataSources.set(source.id, source)
    })

    mockInsights.forEach(insight => {
      this.insights.set(insight.id, insight)
    })

    mockReports.forEach(report => {
      this.reports.set(report.id, report)
    })
  }

  // Metrics Management
  public async getMetrics(): Promise<AnalyticsMetric[]> {
    return Array.from(this.metrics.values())
  }

  public async getMetric(id: string): Promise<AnalyticsMetric | null> {
    return this.metrics.get(id) || null
  }

  public async updateMetric(id: string, updates: Partial<AnalyticsMetric>): Promise<AnalyticsMetric | null> {
    const metric = this.metrics.get(id)
    if (metric) {
      const updatedMetric = { ...metric, ...updates }
      this.metrics.set(id, updatedMetric)
      return updatedMetric
    }
    return null
  }

  // Reports Management
  public async getReports(): Promise<AnalyticsReport[]> {
    return Array.from(this.reports.values())
  }

  public async getReport(id: string): Promise<AnalyticsReport | null> {
    return this.reports.get(id) || null
  }

  public async generateReport(type: string, parameters: Record<string, any>): Promise<AnalyticsReport> {
    const report: AnalyticsReport = {
      id: `report-${Date.now()}`,
      title: `${type} Report`,
      description: `Generated report for ${type}`,
      category: 'business',
      status: 'generating',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      metrics: Array.from(this.metrics.values()),
      charts: [],
      summary: 'Report being generated...',
      recommendations: []
    }

    this.reports.set(report.id, report)

    // Simulate report generation
    setTimeout(() => {
      report.status = 'generated'
      report.summary = 'Report generated successfully with comprehensive analytics.'
      report.recommendations = ['Action item 1', 'Action item 2', 'Action item 3']
      this.reports.set(report.id, report)
    }, 2000)

    return report
  }

  // AI Insights Management
  public async getInsights(): Promise<AIInsight[]> {
    return Array.from(this.insights.values()).sort((a, b) =>
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )
  }

  public async getInsightsByType(type: AIInsight['type']): Promise<AIInsight[]> {
    return Array.from(this.insights.values()).filter(insight => insight.type === type)
  }

  // Data Sources Management
  public async getDataSources(): Promise<DataSource[]> {
    return Array.from(this.dataSources.values())
  }

  public async getDataSource(id: string): Promise<DataSource | null> {
    return this.dataSources.get(id) || null
  }

  public async testDataSourceConnection(id: string): Promise<boolean> {
    const source = this.dataSources.get(id)
    if (source) {
      // Simulate connection test
      await new Promise(resolve => setTimeout(resolve, 1000))
      source.status = Math.random() > 0.1 ? 'connected' : 'error'
      source.lastSync = new Date().toISOString()
      this.dataSources.set(id, source)
      return source.status === 'connected'
    }
    return false
  }

  // Real-time Data
  public async getRealTimeMetrics(): Promise<Record<string, number>> {
    return {
      activeUsers: Math.floor(Math.random() * 5000) + 2000,
      requestsPerSecond: Math.floor(Math.random() * 500) + 100,
      errorRate: Math.random() * 2,
      responseTime: Math.floor(Math.random() * 100) + 150
    }
  }

  // Data Export
  public async exportData(format: 'csv' | 'json' | 'xlsx', dataType: string, filters?: Record<string, any>): Promise<Blob> {
    const data = await this.getMetrics()
    const jsonData = JSON.stringify(data, null, 2)

    if (format === 'json') {
      return new Blob([jsonData], { type: 'application/json' })
    } else if (format === 'csv') {
      // Simple CSV conversion (in real app, use proper CSV library)
      const csv = data.map(item => Object.values(item).join(',')).join('\n')
      return new Blob([csv], { type: 'text/csv' })
    } else {
      // XLSX would require additional library
      return new Blob([jsonData], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
    }
  }
}