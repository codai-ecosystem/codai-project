import { AzureOpenAIService } from '@codai/azure-openai'
import { prisma } from './db'
import { z } from 'zod'

// Type definitions
export interface AnalyticsMetric {
  id: string
  name: string
  value: number
  change?: number
  changeType?: 'increase' | 'decrease' | 'stable'
  timestamp: Date
}

export interface InsightGeneration {
  title: string
  description: string
  type: 'TREND_DETECTION' | 'ANOMALY_ALERT' | 'FORECAST' | 'CORRELATION' | 'PERFORMANCE_ISSUE' | 'OPTIMIZATION_OPPORTUNITY' | 'BUSINESS_RECOMMENDATION'
  confidence: number
  significance: number
  metrics: Record<string, any>
  trends: Record<string, any>
  predictions?: Record<string, any>
  recommendations?: string[]
}

export interface DataQuery {
  query: string
  dataSource: string
  parameters?: Record<string, any>
  filters?: Record<string, any>
}

export interface DashboardConfig {
  name: string
  description?: string
  widgets: WidgetConfig[]
  layout: GridLayout
}

export interface WidgetConfig {
  id: string
  name: string
  type: 'LINE_CHART' | 'BAR_CHART' | 'PIE_CHART' | 'AREA_CHART' | 'METRIC_CARD' | 'TABLE' | 'AI_INSIGHT'
  dataSource: string
  query: string
  config: Record<string, any>
  position: { x: number; y: number; width: number; height: number }
}

export interface GridLayout {
  columns: number
  rows: number
  gap: number
}

const DataQuerySchema = z.object({
  query: z.string(),
  dataSource: z.string(),
  parameters: z.record(z.any()).optional(),
  filters: z.record(z.any()).optional()
})

const InsightGenerationSchema = z.object({
  title: z.string(),
  description: z.string(),
  type: z.enum(['TREND_DETECTION', 'ANOMALY_ALERT', 'FORECAST', 'CORRELATION', 'PERFORMANCE_ISSUE', 'OPTIMIZATION_OPPORTUNITY', 'BUSINESS_RECOMMENDATION']),
  confidence: z.number().min(0).max(1),
  significance: z.number().min(0).max(1),
  metrics: z.record(z.any()),
  trends: z.record(z.any()),
  predictions: z.record(z.any()).optional(),
  recommendations: z.array(z.string()).optional()
})

export class AnalyticsService {
  private azureOpenAI: AzureOpenAIService

  constructor() {
    this.azureOpenAI = new AzureOpenAIService()
  }

  /**
   * Execute data queries across multiple data sources
   */
  async executeQuery(query: DataQuery, userId: string): Promise<{ success: boolean; data?: any[]; error?: string; executionTime?: number }> {
    try {
      DataQuerySchema.parse(query)
      
      const startTime = Date.now()
      
      // Create query record
      const queryRecord = await prisma.query.create({
        data: {
          name: query.query.substring(0, 100),
          sqlQuery: query.query,
          status: 'RUNNING',
          userId,
          dataSourceId: query.dataSource,
          tags: this.extractQueryTags(query.query)
        }
      })

      let results: any[] = []
      let executionTime = 0

      try {
        // Execute query based on data source type
        results = await this.executeDataSourceQuery(query)
        executionTime = Date.now() - startTime

        // Update query with results
        await prisma.query.update({
          where: { id: queryRecord.id },
          data: {
            status: 'COMPLETED',
            results: results,
            executionTime,
            rowCount: results.length
          }
        })

        return {
          success: true,
          data: results,
          executionTime
        }

      } catch (queryError) {
        // Update query with error
        await prisma.query.update({
          where: { id: queryRecord.id },
          data: {
            status: 'FAILED',
            errorMessage: queryError instanceof Error ? queryError.message : 'Unknown error',
            executionTime: Date.now() - startTime
          }
        })

        throw queryError
      }

    } catch (error) {
      console.error('Query execution failed:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Query execution failed'
      }
    }
  }

  /**
   * Generate AI-powered insights from data
   */
  async generateInsights(data: any[], context: string, userId: string): Promise<{ success: boolean; insights?: InsightGeneration[]; error?: string }> {
    try {
      if (!data || data.length === 0) {
        throw new Error('No data provided for insight generation')
      }

      const prompt = this.buildInsightPrompt(data, context)
      
      const response = await this.azureOpenAI.generateCompletion([
        {
          role: 'system',
          content: 'You are an expert data analyst specializing in business intelligence and analytics. Generate actionable insights from data with statistical analysis and business recommendations.'
        },
        {
          role: 'user',
          content: prompt
        }
      ])

      const insights = this.parseInsightResponse(response)

      // Store insights in database
      const storedInsights = await Promise.all(
        insights.map(insight => 
          prisma.insight.create({
            data: {
              title: insight.title,
              description: insight.description,
              type: insight.type,
              confidence: insight.confidence,
              significance: insight.significance,
              aiModel: 'azure-gpt-4',
              metrics: insight.metrics,
              trends: insight.trends,
              anomalies: {},
              predictions: insight.predictions || {},
              category: this.categorizeInsight(insight.type),
              priority: this.calculatePriority(insight.confidence, insight.significance),
              userId
            }
          })
        )
      )

      return {
        success: true,
        insights
      }

    } catch (error) {
      console.error('Insight generation failed:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Insight generation failed'
      }
    }
  }

  /**
   * Create analytics dashboard
   */
  async createDashboard(config: DashboardConfig, userId: string): Promise<{ success: boolean; dashboard?: any; error?: string }> {
    try {
      const dashboard = await prisma.dashboard.create({
        data: {
          name: config.name,
          description: config.description,
          layout: config.layout,
          userId,
          widgets: {
            create: config.widgets.map(widget => ({
              name: widget.name,
              type: widget.type,
              config: widget.config,
              position: widget.position,
              query: widget.query,
              dataSourceId: widget.dataSource
            }))
          }
        },
        include: {
          widgets: {
            include: {
              dataSource: true
            }
          }
        }
      })

      return {
        success: true,
        dashboard
      }

    } catch (error) {
      console.error('Dashboard creation failed:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Dashboard creation failed'
      }
    }
  }

  /**
   * Detect anomalies in time series data
   */
  async detectAnomalies(data: AnalyticsMetric[], threshold: number = 2.5): Promise<{ success: boolean; anomalies?: any[]; error?: string }> {
    try {
      if (data.length < 10) {
        throw new Error('Insufficient data points for anomaly detection (minimum 10 required)')
      }

      const values = data.map(d => d.value)
      const mean = values.reduce((a, b) => a + b, 0) / values.length
      const variance = values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length
      const standardDeviation = Math.sqrt(variance)

      const anomalies = data.filter((point, index) => {
        const zScore = Math.abs((point.value - mean) / standardDeviation)
        return zScore > threshold
      }).map((point, index) => ({
        ...point,
        anomalyScore: Math.abs((point.value - mean) / standardDeviation),
        severity: this.classifyAnomalySeverity(Math.abs((point.value - mean) / standardDeviation), threshold)
      }))

      // Use AI to analyze anomalies
      if (anomalies.length > 0) {
        const analysisPrompt = this.buildAnomalyAnalysisPrompt(anomalies, data)
        
        const aiAnalysis = await this.azureOpenAI.generateCompletion([
          {
            role: 'system',
            content: 'You are an expert in statistical anomaly detection and business analytics. Analyze detected anomalies and provide insights about their potential causes and business impact.'
          },
          {
            role: 'user',
            content: analysisPrompt
          }
        ])

        // Enhanced anomalies with AI insights
        const enhancedAnomalies = anomalies.map(anomaly => ({
          ...anomaly,
          aiAnalysis: aiAnalysis.substring(0, 500), // Truncate for storage
          recommendations: this.extractRecommendations(aiAnalysis)
        }))

        return {
          success: true,
          anomalies: enhancedAnomalies
        }
      }

      return {
        success: true,
        anomalies: []
      }

    } catch (error) {
      console.error('Anomaly detection failed:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Anomaly detection failed'
      }
    }
  }

  /**
   * Generate predictive forecasts
   */
  async generateForecast(data: AnalyticsMetric[], periods: number = 7): Promise<{ success: boolean; forecast?: any[]; error?: string }> {
    try {
      if (data.length < 5) {
        throw new Error('Insufficient historical data for forecasting (minimum 5 points required)')
      }

      // Simple linear regression for trend
      const n = data.length
      const values = data.map(d => d.value)
      const timestamps = data.map((d, i) => i)

      const sumX = timestamps.reduce((a, b) => a + b, 0)
      const sumY = values.reduce((a, b) => a + b, 0)
      const sumXY = timestamps.reduce((sum, x, i) => sum + x * values[i], 0)
      const sumXX = timestamps.reduce((sum, x) => sum + x * x, 0)

      const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX)
      const intercept = (sumY - slope * sumX) / n

      // Generate forecast points
      const lastTimestamp = timestamps[timestamps.length - 1]
      const forecast = Array.from({ length: periods }, (_, i) => {
        const futureTimestamp = lastTimestamp + i + 1
        const predictedValue = slope * futureTimestamp + intercept
        
        return {
          timestamp: new Date(Date.now() + (i + 1) * 24 * 60 * 60 * 1000), // Next days
          value: Math.max(0, predictedValue), // Ensure non-negative
          confidence: Math.max(0.1, 1 - (i * 0.1)), // Decreasing confidence
          type: 'forecast' as const
        }
      })

      // Use AI to enhance forecast with business context
      const forecastPrompt = this.buildForecastAnalysisPrompt(data, forecast)
      
      const aiInsights = await this.azureOpenAI.generateCompletion([
        {
          role: 'system',
          content: 'You are a business analytics expert specializing in forecasting and trend analysis. Provide context and business insights for the generated forecast.'
        },
        {
          role: 'user',
          content: forecastPrompt
        }
      ])

      return {
        success: true,
        forecast: forecast.map(point => ({
          ...point,
          aiInsights: aiInsights.substring(0, 200) // Summary insights
        }))
      }

    } catch (error) {
      console.error('Forecast generation failed:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Forecast generation failed'
      }
    }
  }

  /**
   * Analyze user behavior patterns
   */
  async analyzeUserBehavior(sessionId: string): Promise<{ success: boolean; analysis?: any; error?: string }> {
    try {
      const session = await prisma.analyticsSession.findUnique({
        where: { sessionId },
        include: {
          events: {
            orderBy: { timestamp: 'asc' }
          }
        }
      })

      if (!session) {
        throw new Error('Session not found')
      }

      const analysis = {
        sessionDuration: session.duration,
        pageViews: session.pageViews,
        eventCount: session.events.length,
        bounceRate: this.calculateBounceRate(session.events),
        conversionEvents: this.identifyConversionEvents(session.events),
        userJourney: this.mapUserJourney(session.events),
        deviceInfo: {
          device: session.device,
          browser: session.browser,
          os: session.os
        },
        location: {
          country: session.country,
          city: session.city
        }
      }

      // AI-powered behavior insights
      const behaviorPrompt = this.buildBehaviorAnalysisPrompt(analysis, session.events)
      
      const aiInsights = await this.azureOpenAI.generateCompletion([
        {
          role: 'system',
          content: 'You are a user experience and behavior analytics expert. Analyze user sessions and provide actionable insights for improving user engagement and conversion.'
        },
        {
          role: 'user',
          content: behaviorPrompt
        }
      ])

      return {
        success: true,
        analysis: {
          ...analysis,
          aiInsights: this.parseAIInsights(aiInsights),
          recommendations: this.extractRecommendations(aiInsights)
        }
      }

    } catch (error) {
      console.error('User behavior analysis failed:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'User behavior analysis failed'
      }
    }
  }

  // Private helper methods

  private async executeDataSourceQuery(query: DataQuery): Promise<any[]> {
    // Placeholder for data source-specific query execution
    // In a real implementation, this would connect to various data sources
    // and execute the appropriate query type
    
    const mockData = [
      { date: '2024-01-01', value: 100, category: 'A' },
      { date: '2024-01-02', value: 120, category: 'B' },
      { date: '2024-01-03', value: 90, category: 'A' },
      { date: '2024-01-04', value: 140, category: 'C' },
      { date: '2024-01-05', value: 110, category: 'B' }
    ]

    return mockData
  }

  private extractQueryTags(query: string): string[] {
    const keywords = ['SELECT', 'FROM', 'WHERE', 'GROUP BY', 'ORDER BY', 'JOIN']
    return keywords.filter(keyword => 
      query.toUpperCase().includes(keyword)
    ).map(keyword => keyword.toLowerCase())
  }

  private buildInsightPrompt(data: any[], context: string): string {
    return `
Analyze the following data and generate actionable business insights:

Context: ${context}

Data Sample: ${JSON.stringify(data.slice(0, 10), null, 2)}
Total Records: ${data.length}

Please provide insights in the following format:
1. Key trends and patterns
2. Anomalies or unusual patterns
3. Statistical significance
4. Business recommendations
5. Confidence level (0-1)

Focus on actionable insights that can drive business decisions.
`
  }

  private parseInsightResponse(response: string): InsightGeneration[] {
    // Simplified parsing - in production, this would be more sophisticated
    const insights: InsightGeneration[] = []
    
    const lines = response.split('\n').filter(line => line.trim())
    let currentInsight: Partial<InsightGeneration> = {}
    
    for (const line of lines) {
      if (line.includes('Trend:') || line.includes('Pattern:')) {
        if (currentInsight.title) {
          insights.push(currentInsight as InsightGeneration)
          currentInsight = {}
        }
        currentInsight.title = line.replace(/^.*?:/, '').trim()
        currentInsight.type = 'TREND_DETECTION'
        currentInsight.confidence = 0.8
        currentInsight.significance = 0.7
        currentInsight.metrics = {}
        currentInsight.trends = {}
      } else if (line.includes('Description:')) {
        currentInsight.description = line.replace(/^.*?:/, '').trim()
      }
    }
    
    if (currentInsight.title) {
      insights.push(currentInsight as InsightGeneration)
    }
    
    return insights.length > 0 ? insights : [{
      title: 'Data Analysis Complete',
      description: response.substring(0, 200),
      type: 'BUSINESS_RECOMMENDATION',
      confidence: 0.8,
      significance: 0.7,
      metrics: {},
      trends: {}
    }]
  }

  private categorizeInsight(type: string): string {
    const categories: Record<string, string> = {
      'TREND_DETECTION': 'Performance',
      'ANOMALY_ALERT': 'Risk Management',
      'FORECAST': 'Planning',
      'CORRELATION': 'Analysis',
      'PERFORMANCE_ISSUE': 'Operations',
      'OPTIMIZATION_OPPORTUNITY': 'Growth',
      'BUSINESS_RECOMMENDATION': 'Strategy'
    }
    return categories[type] || 'General'
  }

  private calculatePriority(confidence: number, significance: number): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
    const score = (confidence + significance) / 2
    if (score > 0.9) return 'CRITICAL'
    if (score > 0.7) return 'HIGH'
    if (score > 0.5) return 'MEDIUM'
    return 'LOW'
  }

  private classifyAnomalySeverity(zScore: number, threshold: number): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
    if (zScore > threshold * 2) return 'CRITICAL'
    if (zScore > threshold * 1.5) return 'HIGH'
    if (zScore > threshold * 1.2) return 'MEDIUM'
    return 'LOW'
  }

  private buildAnomalyAnalysisPrompt(anomalies: any[], allData: AnalyticsMetric[]): string {
    return `
Analyze the following detected anomalies in the dataset:

Anomalies found: ${anomalies.length}
Total data points: ${allData.length}

Anomaly details:
${anomalies.map(a => `- Value: ${a.value}, Score: ${a.anomalyScore.toFixed(2)}, Time: ${a.timestamp}`).join('\n')}

Please provide:
1. Potential causes for these anomalies
2. Business impact assessment
3. Recommended actions
4. Whether these are likely true anomalies or data quality issues
`
  }

  private buildForecastAnalysisPrompt(historical: AnalyticsMetric[], forecast: any[]): string {
    return `
Analyze this forecast based on historical data:

Historical data points: ${historical.length}
Forecast periods: ${forecast.length}

Last 5 historical values: ${historical.slice(-5).map(d => d.value).join(', ')}
Forecast values: ${forecast.map(f => f.value.toFixed(2)).join(', ')}

Please provide:
1. Forecast reliability assessment
2. Key assumptions and limitations
3. Business implications
4. Risk factors to monitor
`
  }

  private buildBehaviorAnalysisPrompt(analysis: any, events: any[]): string {
    return `
Analyze this user behavior session:

Session Duration: ${analysis.sessionDuration} seconds
Page Views: ${analysis.pageViews}
Total Events: ${analysis.eventCount}
Device: ${analysis.deviceInfo.device} (${analysis.deviceInfo.browser})

Key events: ${events.slice(0, 10).map(e => `${e.name} (${e.category})`).join(', ')}

Please provide:
1. User engagement assessment
2. Conversion potential
3. UX improvement opportunities
4. Behavioral patterns identified
`
  }

  private calculateBounceRate(events: any[]): number {
    if (events.length <= 1) return 1
    const engagementEvents = events.filter(e => 
      ['click', 'scroll', 'form_submit', 'download'].includes(e.action || '')
    )
    return engagementEvents.length === 0 ? 1 : 0
  }

  private identifyConversionEvents(events: any[]): any[] {
    return events.filter(e => 
      ['purchase', 'signup', 'subscribe', 'download'].includes(e.name?.toLowerCase() || '')
    )
  }

  private mapUserJourney(events: any[]): any[] {
    return events.map((event, index) => ({
      step: index + 1,
      action: event.name,
      page: event.page,
      timestamp: event.timestamp,
      category: event.category
    }))
  }

  private parseAIInsights(response: string): any {
    return {
      summary: response.substring(0, 200),
      keyFindings: response.split('\n').filter(line => 
        line.includes('Key:') || line.includes('Finding:')
      ),
      recommendations: this.extractRecommendations(response)
    }
  }

  private extractRecommendations(text: string): string[] {
    const lines = text.split('\n')
    const recommendations: string[] = []
    
    for (const line of lines) {
      if (line.includes('Recommend') || line.includes('Suggest') || line.includes('Should')) {
        recommendations.push(line.trim())
      }
    }
    
    return recommendations.slice(0, 5) // Limit to top 5
  }
}
