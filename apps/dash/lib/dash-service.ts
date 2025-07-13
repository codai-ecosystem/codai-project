/**
 * Dash Service - Advanced Analytics Dashboard & Visualization Platform
 * Comprehensive data visualization, widget management, real-time monitoring, and business intelligence
 */

export interface DashboardWidget {
  id: string
  type: 'metric' | 'chart' | 'table' | 'map' | 'gauge' | 'heatmap' | 'timeline' | 'funnel'
  title: string
  description?: string
  position: { x: number; y: number; width: number; height: number }
  config: WidgetConfig
  dataSource: DataSource
  refreshInterval?: number // in milliseconds
  isVisible: boolean
  permissions?: string[]
}

export interface WidgetConfig {
  // Chart configuration
  chartType?: 'line' | 'bar' | 'pie' | 'area' | 'scatter' | 'candlestick' | 'treemap'
  xAxis?: AxisConfig
  yAxis?: AxisConfig
  series?: SeriesConfig[]
  colors?: string[]
  legend?: LegendConfig
  tooltip?: TooltipConfig

  // Metric configuration
  value?: string
  target?: number
  format?: 'number' | 'percentage' | 'currency' | 'bytes' | 'duration'
  decimals?: number
  suffix?: string
  prefix?: string

  // Table configuration
  columns?: ColumnConfig[]
  pagination?: boolean
  sorting?: boolean
  filtering?: boolean

  // Visual settings
  theme?: 'light' | 'dark' | 'auto'
  animation?: boolean
  interactive?: boolean

  // Custom settings
  customConfig?: Record<string, any>
}

export interface AxisConfig {
  label?: string
  min?: number
  max?: number
  type?: 'category' | 'value' | 'time' | 'log'
  format?: string
  gridLines?: boolean
  tickInterval?: number
}

export interface SeriesConfig {
  name: string
  field: string
  type?: 'line' | 'bar' | 'area'
  color?: string
  yAxisIndex?: number
  stack?: string
  smooth?: boolean
  fill?: boolean
}

export interface LegendConfig {
  show: boolean
  position: 'top' | 'bottom' | 'left' | 'right'
  align: 'start' | 'center' | 'end'
}

export interface TooltipConfig {
  show: boolean
  trigger: 'axis' | 'item'
  format?: string
  backgroundColor?: string
  borderColor?: string
}

export interface ColumnConfig {
  key: string
  title: string
  dataIndex: string
  width?: number
  sortable?: boolean
  filterable?: boolean
  render?: string // Custom render function
  fixed?: 'left' | 'right'
}

export interface DataSource {
  id: string
  name: string
  type: 'api' | 'database' | 'file' | 'realtime' | 'static'
  connection: ConnectionConfig
  query: QueryConfig
  transformation?: TransformationConfig
  caching?: CachingConfig
}

export interface ConnectionConfig {
  // API connection
  endpoint?: string
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  headers?: Record<string, string>
  authentication?: AuthConfig

  // Database connection
  host?: string
  port?: number
  database?: string
  username?: string
  password?: string
  driver?: 'postgresql' | 'mysql' | 'mongodb' | 'redis' | 'elasticsearch'

  // File connection
  path?: string
  format?: 'json' | 'csv' | 'xlsx' | 'xml'

  // Realtime connection
  websocketUrl?: string
  topic?: string
}

export interface AuthConfig {
  type: 'none' | 'basic' | 'bearer' | 'apikey' | 'oauth2'
  username?: string
  password?: string
  token?: string
  apiKey?: string
  keyLocation?: 'header' | 'query'
  keyName?: string
}

export interface QueryConfig {
  // SQL query
  sql?: string
  parameters?: Record<string, any>

  // API query
  endpoint?: string
  params?: Record<string, any>

  // NoSQL query
  collection?: string
  filter?: Record<string, any>
  projection?: Record<string, any>
  sort?: Record<string, any>

  // File query
  sheet?: string
  range?: string

  // Static data
  data?: any[]
}

export interface TransformationConfig {
  operations: TransformationOperation[]
}

export interface TransformationOperation {
  type: 'filter' | 'map' | 'aggregate' | 'join' | 'sort' | 'pivot' | 'unpivot'
  config: Record<string, any>
}

export interface CachingConfig {
  enabled: boolean
  duration: number // in seconds
  strategy: 'memory' | 'redis' | 'file'
  key?: string
}

export interface Dashboard {
  id: string
  name: string
  description?: string
  category: string
  tags: string[]
  widgets: DashboardWidget[]
  layout: LayoutConfig
  filters: DashboardFilter[]
  permissions: PermissionConfig
  settings: DashboardSettings
  createdAt: Date
  updatedAt: Date
  createdBy: string
  sharedWith: string[]
}

export interface LayoutConfig {
  type: 'grid' | 'freeform'
  columns: number
  rowHeight: number
  margin: [number, number]
  padding: [number, number]
  responsive: ResponsiveConfig[]
}

export interface ResponsiveConfig {
  breakpoint: string
  columns: number
  margin?: [number, number]
  padding?: [number, number]
}

export interface DashboardFilter {
  id: string
  name: string
  type: 'select' | 'multiselect' | 'date' | 'daterange' | 'number' | 'text'
  field: string
  options?: FilterOption[]
  defaultValue?: any
  required: boolean
  global: boolean // applies to all widgets
}

export interface FilterOption {
  label: string
  value: any
}

export interface PermissionConfig {
  owner: string
  viewers: string[]
  editors: string[]
  public: boolean
  shareableLink?: string
  embedable: boolean
}

export interface DashboardSettings {
  theme: 'light' | 'dark' | 'auto'
  autoRefresh: boolean
  refreshInterval: number
  timezone: string
  dateFormat: string
  numberFormat: string
  animations: boolean
  interactive: boolean
  exportFormats: ('png' | 'pdf' | 'excel' | 'csv')[]
}

export interface AnalyticsReport {
  id: string
  name: string
  description?: string
  type: 'scheduled' | 'adhoc'
  format: 'pdf' | 'excel' | 'csv' | 'json'
  dashboard: string
  filters?: Record<string, any>
  schedule?: ScheduleConfig
  recipients: string[]
  createdAt: Date
  lastRun?: Date
  status: 'active' | 'paused' | 'error'
}

export interface ScheduleConfig {
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly'
  time: string // HH:mm format
  dayOfWeek?: number // 0-6, Sunday = 0
  dayOfMonth?: number // 1-31
  timezone: string
}

export interface DataAlert {
  id: string
  name: string
  description?: string
  dataSource: string
  condition: AlertCondition
  notification: NotificationConfig
  isActive: boolean
  lastTriggered?: Date
  createdAt: Date
  createdBy: string
}

export interface AlertCondition {
  type: 'threshold' | 'change' | 'anomaly' | 'missing_data'
  field: string
  operator: '>' | '<' | '>=' | '<=' | '=' | '!=' | 'contains' | 'not_contains'
  value: any
  aggregation?: 'sum' | 'avg' | 'count' | 'min' | 'max'
  timeWindow: number // in minutes
}

export interface NotificationConfig {
  channels: ('email' | 'slack' | 'webhook' | 'sms')[]
  recipients: string[]
  template?: string
  webhookUrl?: string
  retryCount: number
}

export interface DataConnection {
  id: string
  name: string
  type: 'postgresql' | 'mysql' | 'mongodb' | 'redis' | 'elasticsearch' | 'api' | 'file'
  config: ConnectionConfig
  status: 'connected' | 'disconnected' | 'error'
  lastTested: Date
  createdAt: Date
}

class DashService {
  private dashboards = new Map<string, Dashboard>()
  private dataSources = new Map<string, DataSource>()
  private dataConnections = new Map<string, DataConnection>()
  private reports = new Map<string, AnalyticsReport>()
  private alerts = new Map<string, DataAlert>()
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>()

  // Dashboard Management
  async createDashboard(dashboard: Omit<Dashboard, 'id' | 'createdAt' | 'updatedAt'>): Promise<Dashboard> {
    const newDashboard: Dashboard = {
      id: `dashboard_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...dashboard
    }

    this.dashboards.set(newDashboard.id, newDashboard)
    return newDashboard
  }

  async getDashboard(id: string): Promise<Dashboard | null> {
    return this.dashboards.get(id) || null
  }

  async updateDashboard(id: string, updates: Partial<Dashboard>): Promise<boolean> {
    const dashboard = this.dashboards.get(id)
    if (!dashboard) return false

    const updatedDashboard = {
      ...dashboard,
      ...updates,
      updatedAt: new Date()
    }

    this.dashboards.set(id, updatedDashboard)
    return true
  }

  async deleteDashboard(id: string): Promise<boolean> {
    return this.dashboards.delete(id)
  }

  async getDashboards(filters?: {
    category?: string
    tags?: string[]
    createdBy?: string
    search?: string
  }): Promise<Dashboard[]> {
    let dashboards = Array.from(this.dashboards.values())

    if (filters) {
      if (filters.category) {
        dashboards = dashboards.filter(d => d.category === filters.category)
      }

      if (filters.tags && filters.tags.length > 0) {
        dashboards = dashboards.filter(d =>
          filters.tags!.some(tag => d.tags.includes(tag))
        )
      }

      if (filters.createdBy) {
        dashboards = dashboards.filter(d => d.createdBy === filters.createdBy)
      }

      if (filters.search) {
        const search = filters.search.toLowerCase()
        dashboards = dashboards.filter(d =>
          d.name.toLowerCase().includes(search) ||
          d.description?.toLowerCase().includes(search)
        )
      }
    }

    return dashboards.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
  }

  // Widget Management
  async addWidget(dashboardId: string, widget: Omit<DashboardWidget, 'id'>): Promise<boolean> {
    const dashboard = this.dashboards.get(dashboardId)
    if (!dashboard) return false

    const newWidget: DashboardWidget = {
      id: `widget_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...widget
    }

    dashboard.widgets.push(newWidget)
    dashboard.updatedAt = new Date()
    this.dashboards.set(dashboardId, dashboard)
    return true
  }

  async updateWidget(dashboardId: string, widgetId: string, updates: Partial<DashboardWidget>): Promise<boolean> {
    const dashboard = this.dashboards.get(dashboardId)
    if (!dashboard) return false

    const widgetIndex = dashboard.widgets.findIndex(w => w.id === widgetId)
    if (widgetIndex === -1) return false

    dashboard.widgets[widgetIndex] = {
      ...dashboard.widgets[widgetIndex],
      ...updates
    }
    dashboard.updatedAt = new Date()
    this.dashboards.set(dashboardId, dashboard)
    return true
  }

  async removeWidget(dashboardId: string, widgetId: string): Promise<boolean> {
    const dashboard = this.dashboards.get(dashboardId)
    if (!dashboard) return false

    const widgetIndex = dashboard.widgets.findIndex(w => w.id === widgetId)
    if (widgetIndex === -1) return false

    dashboard.widgets.splice(widgetIndex, 1)
    dashboard.updatedAt = new Date()
    this.dashboards.set(dashboardId, dashboard)
    return true
  }

  // Data Source Management
  async createDataSource(dataSource: Omit<DataSource, 'id'>): Promise<DataSource> {
    const newDataSource: DataSource = {
      id: `datasource_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...dataSource
    }

    this.dataSources.set(newDataSource.id, newDataSource)
    return newDataSource
  }

  async getDataSource(id: string): Promise<DataSource | null> {
    return this.dataSources.get(id) || null
  }

  async testDataSource(id: string): Promise<{ success: boolean; message: string; sampleData?: any }> {
    const dataSource = this.dataSources.get(id)
    if (!dataSource) {
      return { success: false, message: 'Data source not found' }
    }

    try {
      const data = await this.executeQuery(dataSource, { limit: 5 })
      return {
        success: true,
        message: 'Connection successful',
        sampleData: data
      }
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  // Data Fetching and Processing
  async getWidgetData(widget: DashboardWidget, filters?: Record<string, any>): Promise<any> {
    const dataSource = this.dataSources.get(widget.dataSource.id)
    if (!dataSource) {
      throw new Error('Data source not found')
    }

    // Check cache first
    const cacheKey = this.generateCacheKey(widget.dataSource.id, filters)
    const cached = this.getFromCache(cacheKey)
    if (cached) {
      return this.transformData(cached, widget.config)
    }

    // Execute query
    const rawData = await this.executeQuery(dataSource, filters)

    // Cache the result
    if (dataSource.caching?.enabled) {
      this.setCache(cacheKey, rawData, dataSource.caching.duration)
    }

    // Transform and return
    return this.transformData(rawData, widget.config)
  }

  private async executeQuery(dataSource: DataSource, additionalFilters?: Record<string, any>): Promise<any> {
    switch (dataSource.type) {
      case 'api':
        return await this.executeApiQuery(dataSource, additionalFilters)
      case 'database':
        return await this.executeDatabaseQuery(dataSource, additionalFilters)
      case 'file':
        return await this.executeFileQuery(dataSource, additionalFilters)
      case 'static':
        return dataSource.query.data || []
      case 'realtime':
        return await this.executeRealtimeQuery(dataSource, additionalFilters)
      default:
        throw new Error(`Unsupported data source type: ${dataSource.type}`)
    }
  }

  private async executeApiQuery(dataSource: DataSource, filters?: Record<string, any>): Promise<any> {
    const { connection, query } = dataSource
    const url = new URL(query.endpoint || connection.endpoint || '')

    // Add query parameters
    if (query.params) {
      Object.entries(query.params).forEach(([key, value]) => {
        url.searchParams.append(key, String(value))
      })
    }

    // Add filter parameters
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        url.searchParams.append(key, String(value))
      })
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...connection.headers
    }

    // Add authentication
    if (connection.authentication) {
      const auth = connection.authentication
      switch (auth.type) {
        case 'bearer':
          headers['Authorization'] = `Bearer ${auth.token}`
          break
        case 'basic':
          headers['Authorization'] = `Basic ${btoa(`${auth.username}:${auth.password}`)}`
          break
        case 'apikey':
          if (auth.keyLocation === 'header') {
            headers[auth.keyName || 'X-API-Key'] = auth.apiKey || ''
          } else {
            url.searchParams.append(auth.keyName || 'api_key', auth.apiKey || '')
          }
          break
      }
    }

    const response = await fetch(url.toString(), {
      method: connection.method || 'GET',
      headers
    })

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`)
    }

    return await response.json()
  }

  private async executeDatabaseQuery(dataSource: DataSource, filters?: Record<string, any>): Promise<any> {
    // This would integrate with actual database drivers
    // For now, return mock data
    const mockData = this.generateMockData(dataSource.query.sql || 'SELECT * FROM table')
    return mockData
  }

  private async executeFileQuery(dataSource: DataSource, filters?: Record<string, any>): Promise<any> {
    // This would read from actual files
    // For now, return mock data
    return this.generateMockData('file_data')
  }

  private async executeRealtimeQuery(dataSource: DataSource, filters?: Record<string, any>): Promise<any> {
    // This would connect to WebSocket or SSE
    // For now, return mock real-time data
    return this.generateMockRealtimeData()
  }

  private transformData(data: any, config: WidgetConfig): any {
    if (!data || !Array.isArray(data)) return data

    let transformed = [...data]

    // Apply transformations if configured
    // This would include filtering, aggregation, sorting, etc.

    return transformed
  }

  private generateCacheKey(dataSourceId: string, filters?: Record<string, any>): string {
    const filterString = filters ? JSON.stringify(filters) : ''
    return `${dataSourceId}_${filterString}`
  }

  private getFromCache(key: string): any | null {
    const cached = this.cache.get(key)
    if (!cached) return null

    if (Date.now() > cached.timestamp + cached.ttl * 1000) {
      this.cache.delete(key)
      return null
    }

    return cached.data
  }

  private setCache(key: string, data: any, ttl: number): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    })
  }

  private generateMockData(query: string): any[] {
    // Generate realistic mock data based on query or context
    const mockDataTypes = [
      // User analytics
      { name: 'User Registrations', value: Math.floor(Math.random() * 1000) + 500, date: new Date() },
      { name: 'Active Users', value: Math.floor(Math.random() * 800) + 200, date: new Date() },
      { name: 'Page Views', value: Math.floor(Math.random() * 5000) + 1000, date: new Date() },
      { name: 'Conversion Rate', value: Math.random() * 10 + 2, date: new Date() },

      // Financial data
      { name: 'Revenue', value: Math.floor(Math.random() * 100000) + 50000, date: new Date(), currency: 'USD' },
      { name: 'Profit Margin', value: Math.random() * 30 + 10, date: new Date(), type: 'percentage' },

      // System metrics
      { name: 'CPU Usage', value: Math.random() * 100, date: new Date(), unit: '%' },
      { name: 'Memory Usage', value: Math.random() * 16, date: new Date(), unit: 'GB' },
      { name: 'Network Traffic', value: Math.random() * 1000, date: new Date(), unit: 'MB/s' }
    ]

    return mockDataTypes.slice(0, Math.floor(Math.random() * 5) + 3)
  }

  private generateMockRealtimeData(): any[] {
    return [
      { timestamp: new Date(), value: Math.random() * 100, metric: 'real_time_users' },
      { timestamp: new Date(), value: Math.random() * 1000, metric: 'requests_per_second' },
      { timestamp: new Date(), value: Math.random() * 50, metric: 'error_rate' }
    ]
  }

  // Report Management
  async createReport(report: Omit<AnalyticsReport, 'id' | 'createdAt'>): Promise<AnalyticsReport> {
    const newReport: AnalyticsReport = {
      id: `report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
      ...report
    }

    this.reports.set(newReport.id, newReport)
    return newReport
  }

  async getReport(id: string): Promise<AnalyticsReport | null> {
    return this.reports.get(id) || null
  }

  async generateReport(id: string): Promise<{ success: boolean; data?: any; error?: string }> {
    const report = this.reports.get(id)
    if (!report) {
      return { success: false, error: 'Report not found' }
    }

    try {
      const dashboard = this.dashboards.get(report.dashboard)
      if (!dashboard) {
        return { success: false, error: 'Dashboard not found' }
      }

      // Generate report data
      const reportData = await this.generateReportData(dashboard, report.filters)

      // Update last run
      report.lastRun = new Date()
      this.reports.set(id, report)

      return { success: true, data: reportData }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  private async generateReportData(dashboard: Dashboard, filters?: Record<string, any>): Promise<any> {
    const widgetData = await Promise.all(
      dashboard.widgets.map(async widget => ({
        widget: widget.title,
        type: widget.type,
        data: await this.getWidgetData(widget, filters)
      }))
    )

    return {
      dashboard: dashboard.name,
      generatedAt: new Date(),
      widgets: widgetData
    }
  }

  // Alert Management
  async createAlert(alert: Omit<DataAlert, 'id' | 'createdAt'>): Promise<DataAlert> {
    const newAlert: DataAlert = {
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
      ...alert
    }

    this.alerts.set(newAlert.id, newAlert)
    return newAlert
  }

  async checkAlerts(): Promise<void> {
    const activeAlerts = Array.from(this.alerts.values()).filter(alert => alert.isActive)

    for (const alert of activeAlerts) {
      try {
        const shouldTrigger = await this.evaluateAlertCondition(alert)
        if (shouldTrigger) {
          await this.triggerAlert(alert)
        }
      } catch (error) {
        console.error(`Failed to check alert ${alert.id}:`, error)
      }
    }
  }

  private async evaluateAlertCondition(alert: DataAlert): Promise<boolean> {
    const dataSource = this.dataSources.get(alert.dataSource)
    if (!dataSource) return false

    try {
      const data = await this.executeQuery(dataSource)
      if (!data || !Array.isArray(data) || data.length === 0) {
        return alert.condition.type === 'missing_data'
      }

      const { condition } = alert
      const values = data.map(item => item[condition.field]).filter(v => v !== null && v !== undefined)

      if (values.length === 0) {
        return condition.type === 'missing_data'
      }

      let testValue: number
      switch (condition.aggregation) {
        case 'sum':
          testValue = values.reduce((a, b) => a + b, 0)
          break
        case 'avg':
          testValue = values.reduce((a, b) => a + b, 0) / values.length
          break
        case 'count':
          testValue = values.length
          break
        case 'min':
          testValue = Math.min(...values)
          break
        case 'max':
          testValue = Math.max(...values)
          break
        default:
          testValue = values[values.length - 1] // latest value
      }

      return this.evaluateCondition(testValue, condition.operator, condition.value)
    } catch (error) {
      console.error(`Failed to evaluate alert condition:`, error)
      return false
    }
  }

  private evaluateCondition(actual: any, operator: string, expected: any): boolean {
    switch (operator) {
      case '>': return actual > expected
      case '<': return actual < expected
      case '>=': return actual >= expected
      case '<=': return actual <= expected
      case '=': return actual === expected
      case '!=': return actual !== expected
      case 'contains': return String(actual).includes(String(expected))
      case 'not_contains': return !String(actual).includes(String(expected))
      default: return false
    }
  }

  private async triggerAlert(alert: DataAlert): Promise<void> {
    console.log(`Alert triggered: ${alert.name}`)

    // Update last triggered time
    alert.lastTriggered = new Date()
    this.alerts.set(alert.id, alert)

    // Send notifications (would integrate with actual notification services)
    const { notification } = alert
    for (const channel of notification.channels) {
      switch (channel) {
        case 'email':
          console.log(`Sending email alert to: ${notification.recipients.join(', ')}`)
          break
        case 'slack':
          console.log(`Sending Slack alert to: ${notification.recipients.join(', ')}`)
          break
        case 'webhook':
          console.log(`Sending webhook alert to: ${notification.webhookUrl}`)
          break
        case 'sms':
          console.log(`Sending SMS alert to: ${notification.recipients.join(', ')}`)
          break
      }
    }
  }

  // System Status and Health
  getSystemStatus(): {
    totalDashboards: number
    totalDataSources: number
    totalReports: number
    totalAlerts: number
    cacheSize: number
    systemHealth: string
  } {
    return {
      totalDashboards: this.dashboards.size,
      totalDataSources: this.dataSources.size,
      totalReports: this.reports.size,
      totalAlerts: this.alerts.size,
      cacheSize: this.cache.size,
      systemHealth: 'optimal'
    }
  }

  async clearCache(): Promise<boolean> {
    this.cache.clear()
    return true
  }

  async exportDashboard(id: string, format: 'json' | 'pdf' | 'png'): Promise<{ success: boolean; data?: any; error?: string }> {
    const dashboard = this.dashboards.get(id)
    if (!dashboard) {
      return { success: false, error: 'Dashboard not found' }
    }

    try {
      switch (format) {
        case 'json':
          return { success: true, data: dashboard }
        case 'pdf':
          // Would generate PDF using puppeteer or similar
          return { success: true, data: 'PDF export not implemented' }
        case 'png':
          // Would generate PNG screenshot
          return { success: true, data: 'PNG export not implemented' }
        default:
          return { success: false, error: 'Unsupported format' }
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Export failed'
      }
    }
  }

  async importDashboard(data: any): Promise<{ success: boolean; dashboard?: Dashboard; error?: string }> {
    try {
      const dashboard = await this.createDashboard({
        ...data,
        id: undefined, // Generate new ID
        createdAt: undefined,
        updatedAt: undefined
      })

      return { success: true, dashboard }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Import failed'
      }
    }
  }
}

export default new DashService()
