import Fuse, { IFuseOptions } from 'fuse.js'

export interface SearchableMemory {
  id: string
  content: string
  agentId: string
  metadata: {
    entityType?: string
    tags?: string[]
    createdAt: string
    lastAccessedAt?: string
    importance?: number
    emotionalWeight?: number
  }
  relevance?: number
}

export interface SearchOptions {
  fuzzyThreshold?: number
  maxResults?: number
  includeScore?: boolean
  sortBy?: 'relevance' | 'date' | 'importance'
  filterBy?: {
    entityType?: string
    agentId?: string
    tags?: string[]
    dateRange?: {
      start: Date
      end: Date
    }
    importanceRange?: {
      min: number
      max: number
    }
  }
}

export interface SearchResult {
  memories: SearchableMemory[]
  totalResults: number
  searchTime: number
  searchId: string
}

export interface SemanticSearchOptions extends SearchOptions {
  useSemanticSimilarity?: boolean
  semanticThreshold?: number
  combineWithFuzzy?: boolean
}

export class AdvancedMemorySearch {
  private fuse: Fuse<SearchableMemory>
  private searchHistory: Array<{
    id: string
    query: string
    timestamp: Date
    results: number
  }> = []

  constructor() {
    // Configure Fuse.js for optimized memory search
    const fuseOptions: IFuseOptions<SearchableMemory> = {
      keys: [
        {
          name: 'content',
          weight: 0.7
        },
        {
          name: 'metadata.entityType',
          weight: 0.2
        },
        {
          name: 'metadata.tags',
          weight: 0.1
        }
      ],
      threshold: 0.3,
      distance: 100,
      minMatchCharLength: 2,
      includeScore: true,
      includeMatches: true,
      shouldSort: true,
      findAllMatches: false,
      location: 0
    }

    this.fuse = new Fuse([], fuseOptions)
  }

  /**
   * Update the search index with new memories
   */
  updateIndex(memories: SearchableMemory[]): void {
    this.fuse.setCollection(memories)
  }

  /**
   * Perform advanced search with multiple strategies
   */
  async search(
    query: string,
    memories: SearchableMemory[],
    options: SemanticSearchOptions = {}
  ): Promise<SearchResult> {
    const searchId = this.generateSearchId()
    const startTime = performance.now()

    // Update index if needed
    this.updateIndex(memories)

    // Validate query
    if (!query || query.trim().length === 0) {
      return {
        memories: [],
        totalResults: 0,
        searchTime: 0,
        searchId
      }
    }

    const {
      fuzzyThreshold = 0.3,
      maxResults = 50,
      sortBy = 'relevance',
      filterBy,
      useSemanticSimilarity = false,
      semanticThreshold = 0.7,
      combineWithFuzzy = true
    } = options

    let searchResults: SearchableMemory[] = []

    // 1. Fuzzy text search using Fuse.js
    const fuseResults = this.fuse.search(query, { limit: maxResults * 2 })

    // Convert Fuse results to SearchableMemory with relevance scores
    const fuzzyResults: SearchableMemory[] = fuseResults.map(result => ({
      ...result.item,
      relevance: 1 - (result.score || 0) // Convert Fuse score to relevance (higher is better)
    }))

    if (useSemanticSimilarity) {
      // 2. Semantic similarity search (simulated - in production would use embeddings)
      const semanticResults = await this.performSemanticSearch(query, memories, semanticThreshold)

      if (combineWithFuzzy) {
        // Combine fuzzy and semantic results with weighted scoring
        searchResults = this.combineSearchResults(fuzzyResults, semanticResults)
      } else {
        searchResults = semanticResults
      }
    } else {
      searchResults = fuzzyResults
    }

    // 3. Apply filters
    if (filterBy) {
      searchResults = this.applyFilters(searchResults, filterBy)
    }

    // 4. Apply sorting
    searchResults = this.sortResults(searchResults, sortBy)

    // 5. Limit results
    searchResults = searchResults.slice(0, maxResults)

    const endTime = performance.now()
    const searchTime = endTime - startTime

    // 6. Save to search history
    this.addToSearchHistory(searchId, query, searchResults.length)

    return {
      memories: searchResults,
      totalResults: searchResults.length,
      searchTime,
      searchId
    }
  }

  /**
   * Perform semantic similarity search (simulated implementation)
   * In production, this would use actual vector embeddings
   */
  private async performSemanticSearch(
    query: string,
    memories: SearchableMemory[],
    threshold: number
  ): Promise<SearchableMemory[]> {
    // Simulate semantic search using keyword overlap and content similarity
    const queryWords = query.toLowerCase().split(/\s+/)

    return memories
      .map(memory => {
        const contentWords = memory.content.toLowerCase().split(/\s+/)
        const overlap = queryWords.filter(word =>
          contentWords.some(contentWord =>
            contentWord.includes(word) || word.includes(contentWord)
          )
        ).length

        const similarity = overlap / Math.max(queryWords.length, contentWords.length)

        return {
          ...memory,
          relevance: similarity
        }
      })
      .filter(memory => (memory.relevance || 0) >= threshold)
      .sort((a, b) => (b.relevance || 0) - (a.relevance || 0))
  }

  /**
   * Combine fuzzy and semantic search results with weighted scoring
   */
  private combineSearchResults(
    fuzzyResults: SearchableMemory[],
    semanticResults: SearchableMemory[]
  ): SearchableMemory[] {
    const combinedMap = new Map<string, SearchableMemory>()

    // Add fuzzy results with weight 0.6
    fuzzyResults.forEach(memory => {
      combinedMap.set(memory.id, {
        ...memory,
        relevance: (memory.relevance || 0) * 0.6
      })
    })

    // Add semantic results with weight 0.4, combine if already exists
    semanticResults.forEach(memory => {
      const existing = combinedMap.get(memory.id)
      if (existing) {
        combinedMap.set(memory.id, {
          ...existing,
          relevance: (existing.relevance || 0) + (memory.relevance || 0) * 0.4
        })
      } else {
        combinedMap.set(memory.id, {
          ...memory,
          relevance: (memory.relevance || 0) * 0.4
        })
      }
    })

    return Array.from(combinedMap.values())
  }

  /**
   * Apply filters to search results
   */
  private applyFilters(
    results: SearchableMemory[],
    filters: NonNullable<SearchOptions['filterBy']>
  ): SearchableMemory[] {
    return results.filter(memory => {
      // Entity type filter
      if (filters.entityType && memory.metadata.entityType !== filters.entityType) {
        return false
      }

      // Agent ID filter
      if (filters.agentId && memory.agentId !== filters.agentId) {
        return false
      }

      // Tags filter
      if (filters.tags && filters.tags.length > 0) {
        const memoryTags = memory.metadata.tags || []
        const hasMatchingTag = filters.tags.some(tag => memoryTags.includes(tag))
        if (!hasMatchingTag) return false
      }

      // Date range filter
      if (filters.dateRange) {
        const createdAt = new Date(memory.metadata.createdAt)
        if (createdAt < filters.dateRange.start || createdAt > filters.dateRange.end) {
          return false
        }
      }

      // Importance range filter
      if (filters.importanceRange) {
        const importance = memory.metadata.importance || 0
        if (importance < filters.importanceRange.min || importance > filters.importanceRange.max) {
          return false
        }
      }

      return true
    })
  }

  /**
   * Sort search results by specified criteria
   */
  private sortResults(results: SearchableMemory[], sortBy: NonNullable<SearchOptions['sortBy']>): SearchableMemory[] {
    switch (sortBy) {
      case 'relevance':
        return results.sort((a, b) => (b.relevance || 0) - (a.relevance || 0))

      case 'date':
        return results.sort((a, b) =>
          new Date(b.metadata.createdAt).getTime() - new Date(a.metadata.createdAt).getTime()
        )

      case 'importance':
        return results.sort((a, b) =>
          (b.metadata.importance || 0) - (a.metadata.importance || 0)
        )

      default:
        return results
    }
  }

  /**
   * Generate unique search ID
   */
  private generateSearchId(): string {
    return `search_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * Add search to history
   */
  private addToSearchHistory(id: string, query: string, resultCount: number): void {
    this.searchHistory.push({
      id,
      query,
      timestamp: new Date(),
      results: resultCount
    })

    // Keep only last 100 searches
    if (this.searchHistory.length > 100) {
      this.searchHistory = this.searchHistory.slice(-100)
    }
  }

  /**
   * Get search history
   */
  getSearchHistory(): Array<{
    id: string
    query: string
    timestamp: Date
    results: number
  }> {
    return [...this.searchHistory].reverse() // Most recent first
  }

  /**
   * Get search suggestions based on history
   */
  getSearchSuggestions(partial: string, limit: number = 5): string[] {
    const partialLower = partial.toLowerCase()

    return this.searchHistory
      .filter(search => search.query.toLowerCase().includes(partialLower))
      .map(search => search.query)
      .filter((query, index, array) => array.indexOf(query) === index) // Remove duplicates
      .slice(0, limit)
  }

  /**
   * Clear search history
   */
  clearSearchHistory(): void {
    this.searchHistory = []
  }

  /**
   * Get search analytics
   */
  getSearchAnalytics(): {
    totalSearches: number
    averageResultsPerSearch: number
    mostSearchedTerms: Array<{ term: string; count: number }>
    searchTrends: Array<{ date: string; searches: number }>
  } {
    const totalSearches = this.searchHistory.length
    const averageResults = this.searchHistory.reduce((sum, search) => sum + search.results, 0) / totalSearches || 0

    // Count search terms
    const termCounts = new Map<string, number>()
    this.searchHistory.forEach(search => {
      const words = search.query.toLowerCase().split(/\s+/)
      words.forEach(word => {
        if (word.length > 2) { // Only count words longer than 2 characters
          termCounts.set(word, (termCounts.get(word) || 0) + 1)
        }
      })
    })

    const mostSearchedTerms = Array.from(termCounts.entries())
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([term, count]) => ({ term, count }))

    // Calculate daily search trends (last 7 days)
    const searchTrends: Array<{ date: string; searches: number }> = []
    const now = new Date()

    for (let i = 6; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
      const dateStr = date.toISOString().split('T')[0]
      const searchesOnDate = this.searchHistory.filter(search =>
        search.timestamp.toISOString().split('T')[0] === dateStr
      ).length

      searchTrends.push({
        date: dateStr,
        searches: searchesOnDate
      })
    }

    return {
      totalSearches,
      averageResultsPerSearch: Math.round(averageResults * 100) / 100,
      mostSearchedTerms,
      searchTrends
    }
  }
}

// Export singleton instance
export const memorySearch = new AdvancedMemorySearch()
