import { describe, it, expect, beforeAll } from 'vitest'
import { AdvancedMemorySearch } from '../../lib/search/AdvancedMemorySearch'
import type { SearchableMemory } from '../../lib/search/AdvancedMemorySearch'

describe('MEMORAI Performance Benchmarks', () => {
  let searchService: AdvancedMemorySearch
  let smallDataset: SearchableMemory[]
  let mediumDataset: SearchableMemory[]
  let largeDataset: SearchableMemory[]

  beforeAll(() => {
    searchService = new AdvancedMemorySearch()

    // Small dataset: 100 memories
    smallDataset = generateDataset(100)

    // Medium dataset: 1,000 memories  
    mediumDataset = generateDataset(1000)

    // Large dataset: 10,000 memories
    largeDataset = generateDataset(10000)
  })

  function generateDataset(size: number): SearchableMemory[] {
    const topics = ['React', 'TypeScript', 'Node.js', 'Database', 'API', 'Testing', 'Performance', 'Security']
    const entityTypes = ['code-snippets', 'text-memories', 'research-data'] as const

    return Array.from({ length: size }, (_, i) => {
      const topic = topics[i % topics.length]
      return {
        id: `memory-${i}`,
        content: `${topic} development best practices and advanced techniques for ${topic.toLowerCase()} optimization and implementation patterns`,
        agentId: `agent-${i % 10}`,
        metadata: {
          entityType: entityTypes[i % 3],
          tags: [topic.toLowerCase(), 'development', 'best-practices'],
          createdAt: new Date(Date.now() - i * 1000).toISOString(),
          importance: Math.random(),
          emotionalWeight: Math.random()
        }
      }
    })
  }

  describe('Search Performance Benchmarks', () => {
    it('should perform fast searches on small datasets (<10ms)', async () => {
      const iterations = 10
      const times: number[] = []

      for (let i = 0; i < iterations; i++) {
        const start = performance.now()
        await searchService.search('React development', smallDataset)
        const end = performance.now()
        times.push(end - start)
      }

      const averageTime = times.reduce((sum, time) => sum + time, 0) / iterations
      const maxTime = Math.max(...times)

      expect(averageTime).toBeLessThan(10) // Average under 10ms
      expect(maxTime).toBeLessThan(20) // No single search over 20ms
    })

    it('should handle medium datasets efficiently (<50ms)', async () => {
      const iterations = 5
      const times: number[] = []

      for (let i = 0; i < iterations; i++) {
        const start = performance.now()
        await searchService.search('TypeScript optimization', mediumDataset)
        const end = performance.now()
        times.push(end - start)
      }

      const averageTime = times.reduce((sum, time) => sum + time, 0) / iterations
      const maxTime = Math.max(...times)

      expect(averageTime).toBeLessThan(50) // Average under 50ms
      expect(maxTime).toBeLessThan(100) // No single search over 100ms
    })

    it('should scale well with large datasets (<200ms)', async () => {
      const iterations = 3
      const times: number[] = []

      for (let i = 0; i < iterations; i++) {
        const start = performance.now()
        await searchService.search('database performance', largeDataset)
        const end = performance.now()
        times.push(end - start)
      }

      const averageTime = times.reduce((sum, time) => sum + time, 0) / iterations
      const maxTime = Math.max(...times)

      expect(averageTime).toBeLessThan(200) // Average under 200ms
      expect(maxTime).toBeLessThan(500) // No single search over 500ms
    })
  })

  describe('Memory Usage Benchmarks', () => {
    it('should maintain reasonable memory usage', async () => {
      const initialMemory = process.memoryUsage().heapUsed

      // Perform multiple searches
      for (let i = 0; i < 10; i++) {
        await searchService.search(`search query ${i}`, mediumDataset)
      }

      const finalMemory = process.memoryUsage().heapUsed
      const memoryIncrease = finalMemory - initialMemory

      // Memory increase should be minimal (less than 50MB)
      expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024)
    })

    it('should not have memory leaks with repeated searches', async () => {
      const memoryMeasurements: number[] = []

      // Take initial measurement
      global.gc && global.gc() // Force garbage collection if available
      memoryMeasurements.push(process.memoryUsage().heapUsed)

      // Perform 20 searches and measure memory every 5 searches
      for (let i = 0; i < 20; i++) {
        await searchService.search(`repeated search ${i}`, smallDataset)

        if ((i + 1) % 5 === 0) {
          global.gc && global.gc()
          memoryMeasurements.push(process.memoryUsage().heapUsed)
        }
      }

      // Memory should not continuously increase
      const increases = memoryMeasurements.slice(1).map((mem, i) =>
        mem - memoryMeasurements[i]
      )

      // No single increase should be more than 10MB
      expect(increases.every(increase => increase < 10 * 1024 * 1024)).toBe(true)
    })
  })

  describe('Concurrent Performance', () => {
    it('should handle concurrent searches efficiently', async () => {
      const concurrentSearches = 10
      const queries = Array.from({ length: concurrentSearches }, (_, i) =>
        `concurrent search ${i}`
      )

      const start = performance.now()

      const promises = queries.map(query =>
        searchService.search(query, mediumDataset)
      )

      const results = await Promise.all(promises)
      const end = performance.now()

      const totalTime = end - start
      const averageTimePerSearch = totalTime / concurrentSearches

      expect(results).toHaveLength(concurrentSearches)
      expect(results.every(result => result.searchId !== undefined)).toBe(true)
      expect(averageTimePerSearch).toBeLessThan(100) // Each search should average under 100ms
      expect(totalTime).toBeLessThan(1000) // Total time for all concurrent searches under 1 second
    })

    it('should maintain performance under high load', async () => {
      const highLoadQueries = Array.from({ length: 50 }, (_, i) =>
        `high load search ${i}`
      )

      const start = performance.now()

      // Process in batches to simulate realistic high load
      const batchSize = 10
      const batches: Promise<any>[][] = []

      for (let i = 0; i < highLoadQueries.length; i += batchSize) {
        const batch = highLoadQueries
          .slice(i, i + batchSize)
          .map(query => searchService.search(query, smallDataset))
        batches.push(batch)
      }

      // Execute batches sequentially
      for (const batch of batches) {
        await Promise.all(batch)
      }

      const end = performance.now()
      const totalTime = end - start
      const averageTimePerQuery = totalTime / highLoadQueries.length

      expect(averageTimePerQuery).toBeLessThan(20) // Average under 20ms per search
      expect(totalTime).toBeLessThan(5000) // Total processing under 5 seconds
    })
  })

  describe('Search Quality vs Performance Trade-offs', () => {
    it('should balance semantic search quality with performance', async () => {
      const query = 'web development best practices'

      // Fast fuzzy search
      const start1 = performance.now()
      const fuzzyResult = await searchService.search(query, mediumDataset, {
        useSemanticSimilarity: false
      })
      const fuzzyTime = performance.now() - start1

      // Slower semantic search
      const start2 = performance.now()
      const semanticResult = await searchService.search(query, mediumDataset, {
        useSemanticSimilarity: true
      })
      const semanticTime = performance.now() - start2

      // Semantic search should be slower but not excessively so
      expect(semanticTime).toBeGreaterThan(fuzzyTime)
      expect(semanticTime).toBeLessThan(fuzzyTime * 10) // Not more than 10x slower
      expect(semanticTime).toBeLessThan(200) // Still under 200ms

      // Both should return results
      expect(fuzzyResult.memories.length).toBeGreaterThan(0)
      expect(semanticResult.memories.length).toBeGreaterThan(0)
    })

    it('should optimize filter performance', async () => {
      const complexFilters = {
        filterBy: {
          entityType: 'code-snippets' as const,
          tags: ['react', 'development'],
          importanceRange: {
            min: 0.5,
            max: 1.0
          },
          dateRange: {
            start: new Date('2024-01-01'),
            end: new Date('2024-12-31')
          }
        },
        sortBy: 'importance' as const,
        maxResults: 20
      }

      const start = performance.now()
      const result = await searchService.search('optimization', largeDataset, complexFilters)
      const end = performance.now()

      expect(end - start).toBeLessThan(300) // Complex filtering under 300ms
      expect(result.memories.length).toBeLessThanOrEqual(20)
      expect(result.memories.every(m => m.metadata.entityType === 'code-snippets')).toBe(true)
    })
  })

  describe('Real-world Performance Scenarios', () => {
    it('should handle typical user search patterns', async () => {
      const userSearchPatterns = [
        'react hooks',           // Short, specific
        'typescript advanced',   // Medium specificity
        'database optimization performance tuning best practices', // Long, detailed
        'api',                  // Very short
        'machine learning deployment strategies and containerization', // Complex
      ]

      const results = []

      for (const query of userSearchPatterns) {
        const start = performance.now()
        const result = await searchService.search(query, mediumDataset, {
          useSemanticSimilarity: true,
          maxResults: 10
        })
        const end = performance.now()

        results.push({
          query,
          time: end - start,
          resultCount: result.memories.length
        })
      }

      // All searches should complete reasonably fast
      expect(results.every(r => r.time < 100)).toBe(true)
      expect(results.every(r => r.resultCount >= 0)).toBe(true)

      // Average search time should be very reasonable
      const averageTime = results.reduce((sum, r) => sum + r.time, 0) / results.length
      expect(averageTime).toBeLessThan(50)
    })

    it('should maintain performance with search history', async () => {
      // Clear history first
      searchService.clearSearchHistory()

      // Build up significant search history
      for (let i = 0; i < 100; i++) {
        await searchService.search(`history search ${i}`, smallDataset)
      }

      // Performance should not degrade with large history
      const start = performance.now()
      await searchService.search('performance test', smallDataset)
      const end = performance.now()

      expect(end - start).toBeLessThan(20) // Should still be fast

      const history = searchService.getSearchHistory()
      expect(history).toHaveLength(101) // 100 + 1 new search

      // Analytics should still be fast
      const analyticsStart = performance.now()
      const analytics = searchService.getSearchAnalytics()
      const analyticsEnd = performance.now()

      expect(analyticsEnd - analyticsStart).toBeLessThan(10) // Analytics under 10ms
      expect(analytics.totalSearches).toBe(101)
    })
  })
})
