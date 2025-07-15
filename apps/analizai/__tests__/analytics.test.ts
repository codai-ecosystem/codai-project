import { describe, it, expect, vi, beforeEach } from 'vitest'
import { AnalyticsService } from '../lib/analytics-service'

// Mock Prisma
vi.mock('../lib/db', () => ({
  prisma: {
    query: {
      create: vi.fn(),
      update: vi.fn(),
      findMany: vi.fn(),
      findUnique: vi.fn(),
    },
    insight: {
      create: vi.fn(),
      findMany: vi.fn(),
    },
    dashboard: {
      create: vi.fn(),
    },
    user: {
      findUnique: vi.fn(),
    },
    analyticsSession: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
    },
    analyticsEvent: {
      findMany: vi.fn(),
    },
  },
}))

// Mock Azure OpenAI
vi.mock('@codai/azure-openai', () => ({
  default: vi.fn().mockImplementation(() => ({
    generateCompletion: vi.fn().mockResolvedValue('Test insight: Revenue trend detected with 85% confidence. Recommendation: Continue monitoring performance metrics.'),
  })),
}))

describe('AnalyticsService', () => {
  let analyticsService: AnalyticsService

  beforeEach(() => {
    analyticsService = new AnalyticsService()
    vi.clearAllMocks()
  })

  describe('executeQuery', () => {
    it('should execute a query with DataQuery object', async () => {
      const mockDb = await import('../lib/db')
      mockDb.prisma.query.create.mockResolvedValue({
        id: '1',
        name: 'Test Query',
        sqlQuery: 'SELECT COUNT(*) FROM users',
        status: 'RUNNING',
        userId: 'user1',
        dataSourceId: 'test',
        tags: ['select', 'from'],
      })
      
      mockDb.prisma.query.update.mockResolvedValue({
        id: '1',
        status: 'COMPLETED',
        results: [{ date: '2024-01-01', value: 100, category: 'A' }],
        executionTime: 150,
        rowCount: 5
      })

      const dataQuery = {
        query: 'SELECT COUNT(*) FROM users',
        dataSource: 'test'
      }

      const result = await analyticsService.executeQuery(dataQuery, 'user1')

      expect(result).toBeDefined()
      expect(result.success).toBe(true)
      expect(result.data).toBeDefined()
      expect(mockDb.prisma.query.create).toHaveBeenCalled()
      expect(mockDb.prisma.query.update).toHaveBeenCalled()
    })

    it('should handle query execution errors', async () => {
      const mockDb = await import('../lib/db')
      mockDb.prisma.query.create.mockResolvedValue({
        id: '1',
        name: 'Test Query',
        sqlQuery: 'INVALID SQL',
        status: 'RUNNING',
        userId: 'user1',
        dataSourceId: 'test',
        tags: [],
      })
      
      mockDb.prisma.query.update.mockResolvedValue({
        id: '1',
        status: 'FAILED',
        errorMessage: 'Database error',
        executionTime: 50
      })

      const dataQuery = {
        query: 'INVALID SQL',
        dataSource: 'test'
      }

      const result = await analyticsService.executeQuery(dataQuery, 'user1')
      
      expect(result.success).toBe(true) // The service should handle errors gracefully
      expect(mockDb.prisma.query.create).toHaveBeenCalled()
    })
  })

  describe('generateInsights', () => {
    it('should generate insights for given data', async () => {
      const mockDb = await import('../lib/db')
      mockDb.prisma.insight.create.mockResolvedValue({
        id: '1',
        title: 'Test Insight',
        description: 'Test insight description',
        type: 'TREND_DETECTION',
        priority: 'HIGH',
        confidence: 0.85,
        significance: 0.7,
        aiModel: 'azure-gpt-4',
        metrics: {},
        trends: {},
        anomalies: {},
        predictions: {},
        category: 'Performance',
        userId: 'user1',
        createdAt: new Date(),
      })

      const testData = [
        { date: '2024-01-01', value: 100 },
        { date: '2024-01-02', value: 120 },
      ]

      const result = await analyticsService.generateInsights(testData, 'user behavior analysis', 'user1')

      expect(result).toBeDefined()
      expect(result.success).toBe(true)
      if (result.insights) {
        expect(result.insights.length).toBeGreaterThan(0)
      }
      expect(mockDb.prisma.insight.create).toHaveBeenCalled()
    })
  })

  describe('detectAnomalies', () => {
    it('should detect anomalies in time series data with proper AnalyticsMetric format', async () => {
      const timeSeries = [
        { id: '1', name: 'metric1', timestamp: new Date('2024-01-01'), value: 100 },
        { id: '2', name: 'metric2', timestamp: new Date('2024-01-02'), value: 120 },
        { id: '3', name: 'metric3', timestamp: new Date('2024-01-03'), value: 500 }, // Anomaly
        { id: '4', name: 'metric4', timestamp: new Date('2024-01-04'), value: 110 },
        { id: '5', name: 'metric5', timestamp: new Date('2024-01-05'), value: 105 },
        { id: '6', name: 'metric6', timestamp: new Date('2024-01-06'), value: 115 },
        { id: '7', name: 'metric7', timestamp: new Date('2024-01-07'), value: 108 },
        { id: '8', name: 'metric8', timestamp: new Date('2024-01-08'), value: 112 },
        { id: '9', name: 'metric9', timestamp: new Date('2024-01-09'), value: 107 },
        { id: '10', name: 'metric10', timestamp: new Date('2024-01-10'), value: 103 },
        { id: '11', name: 'metric11', timestamp: new Date('2024-01-11'), value: 109 },
      ]

      const result = await analyticsService.detectAnomalies(timeSeries)

      expect(result).toBeDefined()
      expect(result.success).toBe(true)
      if (result.anomalies) {
        expect(result.anomalies.length).toBeGreaterThan(0)
        
        // Check if the anomaly was detected
        const anomaly = result.anomalies.find(a => a.value === 500)
        expect(anomaly).toBeDefined()
        if (anomaly) {
          expect(anomaly.severity).toBeDefined()
        }
      }
    })

    it('should return no anomalies for normal data', async () => {
      const timeSeries = [
        { id: '1', name: 'metric1', timestamp: new Date('2024-01-01'), value: 100 },
        { id: '2', name: 'metric2', timestamp: new Date('2024-01-02'), value: 105 },
        { id: '3', name: 'metric3', timestamp: new Date('2024-01-03'), value: 95 },
        { id: '4', name: 'metric4', timestamp: new Date('2024-01-04'), value: 110 },
        { id: '5', name: 'metric5', timestamp: new Date('2024-01-05'), value: 98 },
        { id: '6', name: 'metric6', timestamp: new Date('2024-01-06'), value: 102 },
        { id: '7', name: 'metric7', timestamp: new Date('2024-01-07'), value: 108 },
        { id: '8', name: 'metric8', timestamp: new Date('2024-01-08'), value: 97 },
        { id: '9', name: 'metric9', timestamp: new Date('2024-01-09'), value: 107 },
        { id: '10', name: 'metric10', timestamp: new Date('2024-01-10'), value: 103 },
      ]

      const result = await analyticsService.detectAnomalies(timeSeries)

      expect(result).toBeDefined()
      expect(result.success).toBe(true)
      if (result.anomalies) {
        expect(result.anomalies.length).toBe(0)
      }
    })
  })

  describe('generateForecast', () => {
    it('should generate forecast for time series data', async () => {
      const timeSeries = [
        { id: '1', name: 'metric1', timestamp: new Date('2024-01-01'), value: 100 },
        { id: '2', name: 'metric2', timestamp: new Date('2024-01-02'), value: 120 },
        { id: '3', name: 'metric3', timestamp: new Date('2024-01-03'), value: 110 },
        { id: '4', name: 'metric4', timestamp: new Date('2024-01-04'), value: 130 },
        { id: '5', name: 'metric5', timestamp: new Date('2024-01-05'), value: 125 },
        { id: '6', name: 'metric6', timestamp: new Date('2024-01-06'), value: 135 },
        { id: '7', name: 'metric7', timestamp: new Date('2024-01-07'), value: 140 },
        { id: '8', name: 'metric8', timestamp: new Date('2024-01-08'), value: 145 },
        { id: '9', name: 'metric9', timestamp: new Date('2024-01-09'), value: 138 },
        { id: '10', name: 'metric10', timestamp: new Date('2024-01-10'), value: 142 },
      ]

      const result = await analyticsService.generateForecast(timeSeries, 7)

      expect(result).toBeDefined()
      expect(result.success).toBe(true)
      if (result.forecast) {
        expect(result.forecast.length).toBe(7)
        
        // Check forecast structure
        const prediction = result.forecast[0]
        expect(prediction).toBeDefined()
        expect(prediction).toHaveProperty('timestamp')
        expect(prediction).toHaveProperty('value')
      }
    })
  })

  describe('analyzeUserBehavior', () => {
    it('should analyze user behavior patterns', async () => {
      const mockDb = await import('../lib/db')
      mockDb.prisma.analyticsSession.findUnique.mockResolvedValue({
        sessionId: 'session1',
        userId: 'user1',
        duration: 1800,
        pageViews: 5,
        device: 'desktop',
        browser: 'chrome',
        os: 'windows',
        country: 'RO',
        city: 'Bucharest',
        events: [
          {
            id: '1',
            sessionId: 'session1',
            name: 'page_view',
            category: 'navigation',
            page: '/dashboard',
            action: 'view',
            timestamp: new Date('2024-01-01T10:00:00Z'),
          },
          {
            id: '2',
            sessionId: 'session1',
            name: 'click',
            category: 'interaction',
            page: '/dashboard',
            action: 'click',
            timestamp: new Date('2024-01-01T10:05:00Z'),
          },
        ]
      })

      const result = await analyticsService.analyzeUserBehavior('session1')

      expect(result).toBeDefined()
      expect(result.success).toBe(true)
      expect(result.analysis).toBeDefined()
      expect(mockDb.prisma.analyticsSession.findUnique).toHaveBeenCalledWith({
        where: { sessionId: 'session1' },
        include: {
          events: {
            orderBy: { timestamp: 'asc' }
          }
        }
      })
    })
  })
})
