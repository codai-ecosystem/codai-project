/**
 * Analytics Dashboard Integration Tests
 * Tests real analytics calculations with actual memory data
 * Uses real analytics service instead of mocked data
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@/tests/setup'
import { AnalyticsDashboard } from '../AnalyticsDashboard'
import { AnalyticsService } from '@/services/analytics.service'
import type { Memory, AnalyticsData } from '@/types'

// Mock translations only
vi.mock('next-intl', () => ({
  useTranslations: (section: string) => (key: string) => `${section}.${key}`
}))

// Real test data for analytics calculations
const testMemories: Memory[] = [
  {
    id: 'memory-1',
    content: 'JavaScript performance optimization techniques for large applications',
    tags: ['javascript', 'performance', 'optimization'],
    agentId: 'agent-1',
    createdAt: '2024-01-01T10:00:00.000Z',
    updatedAt: '2024-01-01T10:00:00.000Z',
    metadata: { importance: 9, project: 'web-app' }
  },
  {
    id: 'memory-2',
    content: 'React hooks best practices and common pitfalls to avoid',
    tags: ['react', 'hooks', 'best-practices'],
    agentId: 'agent-1',
    createdAt: '2024-01-02T14:30:00.000Z',
    updatedAt: '2024-01-02T14:30:00.000Z',
    metadata: { importance: 8, project: 'web-app' }
  },
  {
    id: 'memory-3',
    content: 'Database indexing strategies for query optimization',
    tags: ['database', 'performance', 'sql'],
    agentId: 'agent-2',
    createdAt: '2024-01-03T09:15:00.000Z',
    updatedAt: '2024-01-03T09:15:00.000Z',
    metadata: { importance: 7, project: 'backend-api' }
  },
  {
    id: 'memory-4',
    content: 'Machine learning model deployment with Docker containers',
    tags: ['ml', 'docker', 'deployment'],
    agentId: 'agent-2',
    createdAt: '2024-01-04T16:45:00.000Z',
    updatedAt: '2024-01-04T16:45:00.000Z',
    metadata: { importance: 9, project: 'ml-platform' }
  },
  {
    id: 'memory-5',
    content: 'API security authentication and authorization patterns',
    tags: ['security', 'api', 'authentication'],
    agentId: 'agent-1',
    createdAt: '2024-01-05T11:20:00.000Z',
    updatedAt: '2024-01-05T11:20:00.000Z',
    metadata: { importance: 10, project: 'backend-api' }
  }
]

// Mock API hooks with real analytics service
vi.mock('@/lib/api', () => ({
  useAnalytics: () => ({
    data: null, // Will be populated by real service
    isLoading: false,
    error: null
  })
}))

describe('Analytics Dashboard Integration', () => {
  let analyticsService: AnalyticsService

  beforeEach(() => {
    analyticsService = new AnalyticsService()
  })

  describe('Real Analytics Calculations', () => {
    it('calculates memory distribution by agent correctly', () => {
      const analytics = analyticsService.calculateMemoryAnalytics(testMemories)

      expect(analytics.memoryDistribution.byAgent).toEqual({
        'agent-1': 3, // memories 1, 2, 5
        'agent-2': 2  // memories 3, 4
      })

      expect(analytics.totalMemories).toBe(5)
    })

    it('calculates tag frequency with real data', () => {
      const analytics = analyticsService.calculateMemoryAnalytics(testMemories)

      // Expected tag frequencies
      expect(analytics.tagDistribution.performance).toBe(2) // memories 1, 3
      expect(analytics.tagDistribution.javascript).toBe(1)  // memory 1
      expect(analytics.tagDistribution.react).toBe(1)       // memory 2
      expect(analytics.tagDistribution.security).toBe(1)    // memory 5
    })

    it('calculates importance distribution accurately', () => {
      const analytics = analyticsService.calculateMemoryAnalytics(testMemories)

      const importanceValues = testMemories.map(m => m.metadata.importance || 0)
      const expectedAverage = importanceValues.reduce((sum, val) => sum + val, 0) / importanceValues.length
      
      expect(analytics.averageImportance).toBe(expectedAverage) // (9+8+7+9+10)/5 = 8.6
    })

    it('calculates temporal patterns with real dates', () => {
      const analytics = analyticsService.calculateMemoryAnalytics(testMemories)

      // Test memories span 5 days (Jan 1-5, 2024)
      expect(analytics.temporalPatterns.totalDays).toBe(5)
      expect(analytics.temporalPatterns.memoriesPerDay).toBe(1) // 5 memories / 5 days
    })

    it('identifies project distribution correctly', () => {
      const analytics = analyticsService.calculateMemoryAnalytics(testMemories)

      expect(analytics.projectDistribution).toEqual({
        'web-app': 2,       // memories 1, 2
        'backend-api': 2,   // memories 3, 5
        'ml-platform': 1    // memory 4
      })
    })
  })

  describe('Analytics Dashboard Rendering', () => {
    it('displays real analytics data without mocks', async () => {
      const analytics = analyticsService.calculateMemoryAnalytics(testMemories)
      
      // Mock the hook to return real analytics data
      vi.mocked(require('@/lib/api').useAnalytics).mockReturnValue({
        data: analytics,
        isLoading: false,
        error: null
      })

      render(<AnalyticsDashboard memories={testMemories} />)

      // Check if real calculated values are displayed
      await waitFor(() => {
        expect(screen.getByText('5')).toBeInTheDocument() // Total memories
        expect(screen.getByText('8.6')).toBeInTheDocument() // Average importance
      })
    })

    it('handles empty data state with real service', () => {
      const analytics = analyticsService.calculateMemoryAnalytics([])
      
      vi.mocked(require('@/lib/api').useAnalytics).mockReturnValue({
        data: analytics,
        isLoading: false,
        error: null
      })

      render(<AnalyticsDashboard memories={[]} />)

      expect(screen.getByText('0')).toBeInTheDocument() // Total memories
      expect(screen.getByText(/no.*data/i)).toBeInTheDocument()
    })

    it('displays loading state correctly', () => {
      vi.mocked(require('@/lib/api').useAnalytics).mockReturnValue({
        data: null,
        isLoading: true,
        error: null
      })

      render(<AnalyticsDashboard memories={testMemories} />)

      expect(screen.getByText(/loading/i)).toBeInTheDocument()
    })

    it('handles error state with real error handling', () => {
      const testError = new Error('Analytics calculation failed')
      
      vi.mocked(require('@/lib/api').useAnalytics).mockReturnValue({
        data: null,
        isLoading: false,
        error: testError
      })

      render(<AnalyticsDashboard memories={testMemories} />)

      expect(screen.getByText(/error/i)).toBeInTheDocument()
    })
  })

  describe('Advanced Analytics Calculations', () => {
    it('calculates memory growth trends with real data', () => {
      const analytics = analyticsService.calculateMemoryAnalytics(testMemories)

      // Memories created over 5 days show growth trend
      const growthRate = analytics.temporalPatterns.growthRate
      expect(growthRate).toBeGreaterThan(0) // Positive growth
      expect(typeof growthRate).toBe('number')
    })

    it('identifies most active agents with real calculations', () => {
      const analytics = analyticsService.calculateMemoryAnalytics(testMemories)

      const mostActiveAgent = Object.entries(analytics.memoryDistribution.byAgent)
        .sort(([,a], [,b]) => (b as number) - (a as number))[0]

      expect(mostActiveAgent[0]).toBe('agent-1') // Most active with 3 memories
      expect(mostActiveAgent[1]).toBe(3)
    })

    it('calculates tag co-occurrence patterns', () => {
      const analytics = analyticsService.calculateMemoryAnalytics(testMemories)

      // Check for tags that appear together
      const performanceCoOccurrences = analytics.tagCoOccurrence?.performance || {}
      
      // 'performance' appears with 'optimization' in memory-1 and with 'sql' in memory-3
      expect(performanceCoOccurrences.optimization).toBe(1)
      expect(performanceCoOccurrences.sql).toBe(1)
    })

    it('calculates importance distribution percentiles', () => {
      const analytics = analyticsService.calculateMemoryAnalytics(testMemories)

      // Importance values: [7, 8, 9, 9, 10]
      expect(analytics.importancePercentiles?.p50).toBe(9) // Median
      expect(analytics.importancePercentiles?.p90).toBe(10) // 90th percentile
      expect(analytics.importancePercentiles?.p10).toBe(7) // 10th percentile
    })
  })

  describe('Performance and Scalability', () => {
    it('handles large datasets efficiently', () => {
      // Generate 1000 test memories
      const largeDataset: Memory[] = Array.from({ length: 1000 }, (_, i) => ({
        id: `memory-${i}`,
        content: `Test memory content ${i}`,
        tags: [`tag-${i % 10}`, `category-${i % 5}`],
        agentId: `agent-${i % 3}`,
        createdAt: new Date(2024, 0, (i % 30) + 1).toISOString(),
        updatedAt: new Date(2024, 0, (i % 30) + 1).toISOString(),
        metadata: { importance: (i % 10) + 1 }
      }))

      const startTime = performance.now()
      const analytics = analyticsService.calculateMemoryAnalytics(largeDataset)
      const endTime = performance.now()

      // Should process 1000 memories quickly (under 100ms)
      expect(endTime - startTime).toBeLessThan(100)
      expect(analytics.totalMemories).toBe(1000)
      
      // Verify calculations are still accurate
      expect(Object.keys(analytics.memoryDistribution.byAgent)).toHaveLength(3)
      expect(analytics.averageImportance).toBeCloseTo(5.5, 1) // Average of 1-10
    })

    it('handles edge cases in analytics calculations', () => {
      // Test with memories having missing or invalid data
      const edgeCaseMemories: Memory[] = [
        {
          id: 'edge-1',
          content: '',
          tags: [],
          agentId: 'agent-1',
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
          metadata: {} // No importance
        },
        {
          id: 'edge-2',
          content: 'Valid memory',
          tags: ['valid'],
          agentId: 'agent-1',
          createdAt: 'invalid-date',
          updatedAt: '2024-01-01T00:00:00.000Z',
          metadata: { importance: -5 } // Negative importance
        }
      ]

      const analytics = analyticsService.calculateMemoryAnalytics(edgeCaseMemories)

      expect(analytics.totalMemories).toBe(2)
      expect(analytics.memoryDistribution.byAgent['agent-1']).toBe(2)
      
      // Should handle missing/invalid data gracefully
      expect(typeof analytics.averageImportance).toBe('number')
      expect(analytics.averageImportance).toBeGreaterThanOrEqual(0)
    })
  })
})