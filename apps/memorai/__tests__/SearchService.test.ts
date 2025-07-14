import { describe, it, expect, beforeEach } from 'vitest'
import { AdvancedMemorySearch } from '../lib/search/AdvancedMemorySearch'
import type { SearchableMemory } from '../lib/search/AdvancedMemorySearch'

describe('AdvancedMemorySearch', () => {
  let searchService: AdvancedMemorySearch
  let mockMemories: SearchableMemory[]

  beforeEach(() => {
    searchService = new AdvancedMemorySearch()
    mockMemories = [
      {
        id: '1',
        content: 'React testing best practices',
        agentId: 'test-agent',
        metadata: {
          entityType: 'code-snippets',
          tags: ['react', 'testing'],
          createdAt: '2024-01-01T00:00:00Z',
          importance: 0.8
        }
      }
    ]
  })

  describe('basic functionality', () => {
    it('should search and return results', async () => {
      const result = await searchService.search('React', mockMemories)
      expect(result).toBeDefined()
      expect(result.searchId).toBeDefined()
      expect(result.searchTime).toBeGreaterThan(0)
    })

    it('should track search history', async () => {
      await searchService.search('React', mockMemories)
      const history = searchService.getSearchHistory()
      expect(history).toHaveLength(1)
      expect(history[0].query).toBe('React')
    })

    it('should clear search history', () => {
      searchService.clearSearchHistory()
      const history = searchService.getSearchHistory()
      expect(history).toHaveLength(0)
    })
  })
})
