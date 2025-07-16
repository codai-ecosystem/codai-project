import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { AdvancedMemorySearch } from '../../lib/search/AdvancedMemorySearch'
import type { SearchableMemory } from '../../lib/search/AdvancedMemorySearch'

describe('MEMORAI End-to-End Integration Tests', () => {
  let searchService: AdvancedMemorySearch
  let testMemories: SearchableMemory[]

  beforeAll(() => {
    searchService = new AdvancedMemorySearch()

    // Comprehensive test dataset
    testMemories = [
      {
        id: 'mem-001',
        content: 'Advanced React patterns including hooks, context, and performance optimization techniques',
        agentId: 'frontend-agent',
        metadata: {
          entityType: 'code-snippets',
          tags: ['react', 'hooks', 'performance', 'frontend'],
          createdAt: '2024-01-01T10:00:00Z',
          importance: 0.9,
          emotionalWeight: 0.7
        }
      },
      {
        id: 'mem-002',
        content: 'TypeScript generics and advanced type manipulation for better code safety',
        agentId: 'backend-agent',
        metadata: {
          entityType: 'text-memories',
          tags: ['typescript', 'generics', 'types', 'safety'],
          createdAt: '2024-01-02T14:30:00Z',
          importance: 0.8,
          emotionalWeight: 0.5
        }
      },
      {
        id: 'mem-003',
        content: 'Database optimization strategies for PostgreSQL performance tuning',
        agentId: 'data-agent',
        metadata: {
          entityType: 'research-data',
          tags: ['database', 'postgresql', 'optimization', 'performance'],
          createdAt: '2024-01-03T09:15:00Z',
          importance: 0.85,
          emotionalWeight: 0.6
        }
      },
      {
        id: 'mem-004',
        content: 'Machine learning model deployment using Docker and Kubernetes',
        agentId: 'ml-agent',
        metadata: {
          entityType: 'code-snippets',
          tags: ['ml', 'docker', 'kubernetes', 'deployment'],
          createdAt: '2024-01-04T16:45:00Z',
          importance: 0.75,
          emotionalWeight: 0.8
        }
      },
      {
        id: 'mem-005',
        content: 'API design best practices for RESTful services and GraphQL endpoints',
        agentId: 'api-agent',
        metadata: {
          entityType: 'text-memories',
          tags: ['api', 'rest', 'graphql', 'design'],
          createdAt: '2024-01-05T11:20:00Z',
          importance: 0.9,
          emotionalWeight: 0.4
        }
      }
    ]

    // Initialize the search service with test data
    searchService.updateIndex(testMemories)
  })

  afterAll(() => {
    searchService.clearSearchHistory()
  })

  describe('Search Functionality Integration', () => {
    it('should perform comprehensive search across all content types', async () => {
      const result = await searchService.search('performance', testMemories)

      expect(result.memories.length).toBeGreaterThan(0)
      expect(result.searchTime).toBeGreaterThan(0)
      expect(result.searchId).toBeDefined()

      // Should find both React performance optimization and database performance tuning
      const foundMemories = result.memories.map(m => m.content)
      expect(foundMemories.some(content => content.includes('React'))).toBe(true)
      expect(foundMemories.some(content => content.includes('Database'))).toBe(true)
    })

    it('should handle semantic search with relevance scoring', async () => {
      const result = await searchService.search('web development', testMemories, {
        useSemanticSimilarity: true,
        semanticThreshold: 0.1 // Lower threshold for better matching
      })

      expect(result.memories).toBeDefined()
      // Should find React and API related memories as semantically related to web development
      const relevantMemories = result.memories.filter(m =>
        m.metadata.tags?.includes('react') ||
        m.metadata.tags?.includes('api') ||
        m.metadata.tags?.includes('frontend')
      )
      expect(relevantMemories.length).toBeGreaterThan(0)
    })

    it('should apply complex filters correctly', async () => {
      const result = await searchService.search('', testMemories, {
        filterBy: {
          entityType: 'code-snippets',
          tags: ['performance'],
          importanceRange: {
            min: 0.8,
            max: 1.0
          }
        },
        sortBy: 'importance',
        maxResults: 10
      })

      expect(result.memories.every(m => m.metadata.entityType === 'code-snippets')).toBe(true)
      expect(result.memories.every(m => m.metadata.tags?.includes('performance'))).toBe(true)
      expect(result.memories.every(m => (m.metadata.importance || 0) >= 0.8)).toBe(true)
    })

    it('should maintain search history and analytics', async () => {
      // Clear history first
      searchService.clearSearchHistory()

      // Perform multiple searches
      await searchService.search('React', testMemories)
      await searchService.search('TypeScript', testMemories)
      await searchService.search('database', testMemories)

      const history = searchService.getSearchHistory()
      expect(history).toHaveLength(3)
      expect(history.map(h => h.query)).toEqual(['database', 'TypeScript', 'React']) // Most recent first

      // Check analytics
      const analytics = searchService.getSearchAnalytics()
      expect(analytics.totalSearches).toBe(3)
      expect(analytics.averageResultsPerSearch).toBeGreaterThan(0)
      expect(analytics.mostSearchedTerms.length).toBeGreaterThan(0)
    })
  })

  describe('Performance and Scalability', () => {
    it('should handle large dataset efficiently', async () => {
      // Generate large dataset
      const largeDataset: SearchableMemory[] = Array.from({ length: 5000 }, (_, i) => ({
        id: `large-mem-${i}`,
        content: `Large dataset memory ${i} containing various technical content about programming, databases, and system architecture`,
        agentId: `agent-${i % 10}`,
        metadata: {
          entityType: i % 3 === 0 ? 'code-snippets' : i % 3 === 1 ? 'text-memories' : 'research-data',
          tags: [`tag-${i % 20}`, `category-${i % 5}`],
          createdAt: new Date(Date.now() - i * 1000).toISOString(),
          importance: Math.random(),
          emotionalWeight: Math.random()
        }
      }))

      const startTime = performance.now()
      const result = await searchService.search('programming databases', largeDataset, {
        maxResults: 50,
        useSemanticSimilarity: true
      })
      const endTime = performance.now()

      expect(result.memories.length).toBeLessThanOrEqual(50)
      expect(endTime - startTime).toBeLessThan(1000) // Should complete within 1 second
      expect(result.searchTime).toBeLessThan(500) // Internal timing should be under 500ms
    })

    it('should optimize memory usage with large datasets', async () => {
      const memoryBefore = process.memoryUsage().heapUsed

      // Process large dataset
      const hugeDataset: SearchableMemory[] = Array.from({ length: 10000 }, (_, i) => ({
        id: `huge-mem-${i}`,
        content: `Memory ${i} `.repeat(100), // Larger content
        agentId: `agent-${i % 100}`,
        metadata: {
          entityType: 'text-memories',
          tags: [`tag-${i % 50}`],
          createdAt: new Date(Date.now() - i * 1000).toISOString(),
          importance: Math.random()
        }
      }))

      await searchService.search('memory', hugeDataset)

      const memoryAfter = process.memoryUsage().heapUsed
      const memoryIncrease = memoryAfter - memoryBefore

      // Memory increase should be reasonable (less than 100MB)
      expect(memoryIncrease).toBeLessThan(100 * 1024 * 1024)
    })
  })

  describe('Error Handling and Edge Cases', () => {
    it('should handle malformed data gracefully', async () => {
      const malformedData: SearchableMemory[] = [
        ...testMemories,
        {
          id: '',
          content: '',
          agentId: '',
          metadata: {
            entityType: 'invalid-type' as any,
            tags: undefined as any,
            createdAt: 'invalid-date',
            importance: -1 // Invalid importance
          }
        }
      ]

      const result = await searchService.search('React', malformedData)

      // Should still work and find valid memories
      expect(result.memories.length).toBeGreaterThan(0)
      expect(result.memories.some(m => m.content.includes('React'))).toBe(true)
    })

    it('should handle special characters and unicode', async () => {
      const unicodeMemories: SearchableMemory[] = [
        {
          id: 'unicode-1',
          content: 'Émojis and spëcial chäractérs in code: ℝ𝕖𝕒𝕔𝕥 🚀 and 中文编程',
          agentId: 'unicode-agent',
          metadata: {
            entityType: 'text-memories',
            tags: ['unicode', 'special-chars', '中文'],
            createdAt: '2024-01-01T00:00:00Z',
            importance: 0.5
          }
        }
      ]

      const result = await searchService.search('Ré𝕒ct 🚀', unicodeMemories)
      expect(result.memories.length).toBeGreaterThan(0)
    })

    it('should handle concurrent searches', async () => {
      const searches = Promise.all([
        searchService.search('React', testMemories),
        searchService.search('TypeScript', testMemories),
        searchService.search('database', testMemories),
        searchService.search('API', testMemories),
        searchService.search('optimization', testMemories)
      ])

      const results = await searches

      expect(results).toHaveLength(5)
      expect(results.every(r => r.searchId !== undefined)).toBe(true)
      expect(results.every(r => r.searchTime > 0)).toBe(true)
    })
  })

  describe('Feature Integration', () => {
    it('should integrate all search modes effectively', async () => {
      // Test fuzzy search
      const fuzzyResult = await searchService.search('Reaktt', testMemories) // Typo
      expect(fuzzyResult.memories.some(m => m.content.includes('React'))).toBe(true)

      // Test exact search with semantic similarity
      const semanticResult = await searchService.search('frontend development', testMemories, {
        useSemanticSimilarity: true,
        semanticThreshold: 0.1, // Lower threshold for better matching
        combineWithFuzzy: true
      })
      expect(semanticResult.memories.length).toBeGreaterThan(0)

      // Test importance-based sorting
      const importanceResult = await searchService.search('', testMemories, {
        sortBy: 'importance',
        maxResults: 3
      })
      expect(importanceResult.memories).toHaveLength(3)
      expect(importanceResult.memories[0].metadata.importance).toBeGreaterThanOrEqual(
        importanceResult.memories[1].metadata.importance || 0
      )
    })

    it('should provide comprehensive search analytics', async () => {
      // Reset history
      searchService.clearSearchHistory()

      // Perform varied searches
      const searchQueries = ['React hooks', 'TypeScript types', 'API design', 'database optimization', 'deployment']

      for (const query of searchQueries) {
        await searchService.search(query, testMemories)
      }

      const analytics = searchService.getSearchAnalytics()

      expect(analytics.totalSearches).toBe(5)
      expect(analytics.mostSearchedTerms.length).toBeGreaterThan(0)
      expect(analytics.searchTrends.length).toBe(7) // 7 days of trends
      expect(analytics.averageResultsPerSearch).toBeGreaterThan(0)
    })
  })

  describe('Real-world Usage Scenarios', () => {
    it('should support developer workflow scenarios', async () => {
      // Scenario: Developer looking for React performance tips
      const performanceSearch = await searchService.search('React performance optimization', testMemories, {
        useSemanticSimilarity: true,
        filterBy: {
          entityType: 'code-snippets',
          tags: ['performance', 'react']
        }
      })

      expect(performanceSearch.memories.length).toBeGreaterThan(0)
      expect(performanceSearch.memories[0].metadata.tags).toContain('react')

      // Scenario: Finding database-related memories for troubleshooting
      const dbSearch = await searchService.search('database issues', testMemories, {
        sortBy: 'importance',
        filterBy: {
          tags: ['database']
        }
      })

      expect(dbSearch.memories.some(m => m.metadata.tags?.includes('database'))).toBe(true)
    })

    it('should handle knowledge discovery patterns', async () => {
      // Pattern: Broad exploration followed by specific search
      const broadSearch = await searchService.search('development', testMemories, {
        useSemanticSimilarity: true,
        maxResults: 10
      })

      expect(broadSearch.memories.length).toBeGreaterThan(0)

      // Follow up with specific search based on results
      const specificSearch = await searchService.search('TypeScript generics', testMemories, {
        filterBy: {
          entityType: 'text-memories'
        }
      })

      expect(specificSearch.memories.some(m => m.content.includes('TypeScript'))).toBe(true)

      // Verify search history captures the pattern
      const history = searchService.getSearchHistory()
      expect(history.length).toBeGreaterThan(1)
    })
  })
})
