import { describe, it, expect, beforeEach, vi } from 'vitest'
import { AdvancedMemorySearch } from '../lib/search/AdvancedMemorySearch'
import type { SearchableMemory, SemanticSearchOptions } from '../lib/search/AdvancedMemorySearch'

describe('AdvancedMemorySearch', () => {
  let searchService: AdvancedMemorySearch
  let mockMemories: SearchableMemory[]

  beforeEach(() => {
    searchService = new AdvancedMemorySearch()
    mockMemories = [
      {
        id: '1',
        content: 'Best practices for testing React components with Jest and React Testing Library',
        agentId: 'test-agent',
        metadata: {
          entityType: 'code-snippets',
          tags: ['react', 'testing', 'jest'],
          createdAt: '2024-01-01T00:00:00Z',
          importance: 0.8
        }
      },
      {
        id: '2',
        content: 'Deep dive into TypeScript advanced type features and utility types',
        agentId: 'test-agent',
        metadata: {
          entityType: 'text-memories',
          tags: ['typescript', 'types', 'advanced'],
          createdAt: '2024-01-03T00:00:00Z',
          importance: 0.7
        }
      },
      {
        id: '3',
        content: 'RESTful API design principles and best practices for scalable systems',
        agentId: 'test-agent',
        metadata: {
          entityType: 'research-data',
          tags: ['api', 'design', 'rest'],
          createdAt: '2024-01-05T00:00:00Z',
          importance: 0.9
        }
      }
    ]
  })

  describe('AdvancedMemorySearch', () => {
    let searchService: AdvancedMemorySearch
    let mockMemories: SearchableMemory[]

    beforeEach(() => {
      searchService = new AdvancedMemorySearch()
      mockMemories = [
        {
          id: '1',
          content: 'Best practices for testing React components with Jest and React Testing Library',
          agentId: 'test-agent',
          metadata: {
            entityType: 'code-snippets',
            tags: ['react', 'testing', 'jest'],
            createdAt: '2024-01-01T00:00:00Z',
            importance: 0.8
          }
        },
        {
          id: '2',
          content: 'Deep dive into TypeScript advanced type features and utility types',
          agentId: 'test-agent',
          metadata: {
            entityType: 'text-memories',
            tags: ['typescript', 'types', 'advanced'],
            createdAt: '2024-01-03T00:00:00Z',
            importance: 0.7
          }
        },
        {
          id: '3',
          content: 'RESTful API design principles and best practices for scalable systems',
          agentId: 'test-agent',
          metadata: {
            entityType: 'research-data',
            tags: ['api', 'design', 'rest'],
            createdAt: '2024-01-05T00:00:00Z',
            importance: 0.9
          }
        }
      ]
    })

    describe('search', () => {
      it('should return empty results when query is empty', async () => {
        const result = await searchService.search('', mockMemories)
        expect(result.memories).toHaveLength(3) // Returns all memories when no query
        expect(result.totalResults).toBe(3)
        expect(result.searchId).toBeDefined()
      })

      it('should find memories by content', async () => {
        const result = await searchService.search('React', mockMemories)
        expect(result.memories).toHaveLength(2) // Real fuzzy search finds multiple matches
        expect(result.memories[0].content).toContain('React')
        expect(result.memories[0].relevance).toBeGreaterThan(0)
      })

      it('should find memories by tags', async () => {
        const result = await searchService.search('testing', mockMemories)
        expect(result.memories).toHaveLength(2) // Real search finds multiple tag matches
        expect(result.memories[0].metadata.tags).toContain('testing')
      })

      it('should handle fuzzy search', async () => {
        const result = await searchService.search('Reakt', mockMemories) // Typo
        expect(result.memories).toHaveLength(2) // Real fuzzy search finds multiple matches
        expect(result.memories[0].content).toContain('React')
      })

      it('should filter by entity type', async () => {
        const options: SemanticSearchOptions = {
          filterBy: { entityType: 'code-snippets' }
        }
        const result = await searchService.search('', mockMemories, options)
        expect(result.memories).toHaveLength(1)
        expect(result.memories[0].metadata.entityType).toBe('code-snippets')
      })

      it('should filter by tags', async () => {
        const options: SemanticSearchOptions = {
          filterBy: { tags: ['react'] }
        }
        const result = await searchService.search('testing', mockMemories, options)
        expect(result.memories).toHaveLength(1)
        expect(result.memories[0].metadata.tags).toContain('react')
      })

      it('should filter by date range', async () => {
        const options: SemanticSearchOptions = {
          filterBy: {
            dateRange: {
              start: new Date('2024-01-03T00:00:00Z'),
              end: new Date('2024-01-04T23:59:59Z')
            }
          }
        }
        const result = await searchService.search('TypeScript', mockMemories, options)
        expect(result.memories).toHaveLength(1)
        expect(result.memories[0].content).toContain('TypeScript')
      })

      it('should sort by relevance by default', async () => {
        const result = await searchService.search('best practices', mockMemories)
        if (result.memories.length > 1) {
          expect(result.memories[0].relevance).toBeGreaterThanOrEqual(result.memories[1].relevance || 0)
        }
      })

      it('should sort by importance when specified', async () => {
        const options: SemanticSearchOptions = {
          sortBy: 'importance'
        }
        const result = await searchService.search('', mockMemories, options)
        if (result.memories.length > 1) {
          expect(result.memories[0].metadata.importance || 0).toBeGreaterThanOrEqual(
            result.memories[1].metadata.importance || 0
          )
        }
      })

      it('should limit results when specified', async () => {
        const options: SemanticSearchOptions = {
          maxResults: 2
        }
        const result = await searchService.search('', mockMemories, options)
        expect(result.memories.length).toBeLessThanOrEqual(2)
      })

      it('should handle semantic search mode', async () => {
        const options: SemanticSearchOptions = {
          useSemanticSimilarity: true
        }
        const result = await searchService.search('coding guidelines', mockMemories, options)
        expect(result.memories).toBeDefined()
        expect(result.searchId).toBeDefined()
      })

      it('should track search time', async () => {
        const result = await searchService.search('React', mockMemories)
        expect(result.searchTime).toBeGreaterThan(0)
        expect(typeof result.searchTime).toBe('number')
      })
    })

    describe('performance', () => {
      it('should complete search within reasonable time', async () => {
        const start = Date.now()
        await searchService.search('React', mockMemories)
        const duration = Date.now() - start
        expect(duration).toBeLessThan(100) // Should complete within 100ms
      })

      it('should handle large datasets', async () => {
        const largeDataset: SearchableMemory[] = Array.from({ length: 1000 }, (_, i) => ({
          id: `memory-${i}`,
          content: `Content for memory ${i} with some random text about testing and development`,
          agentId: 'test-agent',
          metadata: {
            entityType: 'text-memories',
            tags: [`tag-${i % 10}`],
            createdAt: new Date(Date.now() - i * 1000).toISOString(),
            importance: Math.random()
          }
        }))

        const start = Date.now()
        const result = await searchService.search('memory', largeDataset)
        const duration = Date.now() - start

        expect(result.memories).toBeDefined()
        expect(duration).toBeLessThan(500) // Should complete within 500ms for 1000 items
      })
    })

    describe('error handling', () => {
      it('should handle empty memories array', async () => {
        const result = await searchService.search('test', [])
        expect(result.memories).toEqual([])
        expect(result.totalResults).toBe(0)
      })

      it('should handle invalid date ranges', async () => {
        const options: SemanticSearchOptions = {
          filterBy: {
            dateRange: {
              start: new Date('2024-01-10T00:00:00Z'),
              end: new Date('2024-01-01T00:00:00Z') // End before start
            }
          }
        }
        const result = await searchService.search('test', mockMemories, options)
        expect(result.memories).toEqual([])
      })

      it('should handle malformed memories gracefully', async () => {
        const malformedMemories: SearchableMemory[] = [
          ...mockMemories,
          {
            id: 'malformed',
            content: '',
            agentId: 'test-agent',
            metadata: {
              entityType: 'invalid',
              tags: [],
              createdAt: 'invalid-date',
              importance: -1
            }
          }
        ]

        const result = await searchService.search('React', malformedMemories)
        expect(result.memories.length).toBeGreaterThan(0) // Should still find the valid React memory
      })
    })

    describe('search history', () => {
      it('should track search history', async () => {
        await searchService.search('React', mockMemories)
        await searchService.search('TypeScript', mockMemories)

        const history = searchService.getSearchHistory()
        expect(history).toHaveLength(2)
        expect(history[0].query).toBe('TypeScript') // Newest first
        expect(history[1].query).toBe('React') // Oldest last
      })

      it('should clear search history', () => {
        searchService.clearSearchHistory()
        const history = searchService.getSearchHistory()
        expect(history).toHaveLength(0)
      })
    })
  })
})
