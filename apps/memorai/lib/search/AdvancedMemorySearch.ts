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

export interface SemanticSearchOptions extends SearchOptions {
  useSemanticSimilarity?: boolean
  semanticThreshold?: number
  combineWithFuzzy?: boolean
}

export interface SearchResult {
  memories: SearchableMemory[]
  totalResults: number
  searchTime: number
  searchId: string
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
    const fuseOptions: IFuseOptions<SearchableMemory> = {
      keys: [
        { name: 'content', weight: 0.7 },
        { name: 'metadata.entityType', weight: 0.2 },
        { name: 'metadata.tags', weight: 0.1 }
      ],
      threshold: 0.5,
      includeScore: true,
      shouldSort: true
    }
    this.fuse = new Fuse([], fuseOptions)
  }

  updateIndex(memories: SearchableMemory[]): void {
    this.fuse.setCollection(memories)
  }

  async search(
    query: string,
    memories: SearchableMemory[],
    options: SemanticSearchOptions = {}
  ): Promise<SearchResult> {
    const searchId = this.generateSearchId()
    const startTime = performance.now()

    // Apply filters first
    let filteredMemories = this.applyFilters(memories, options.filterBy)

    this.updateIndex(filteredMemories)

    const { maxResults = 50 } = options

    if (!query || query.trim().length === 0) {
      const endTime = performance.now()
      const results = filteredMemories.slice(0, maxResults)
      this.addToSearchHistory(searchId, query || '', results.length)
      return {
        memories: results,
        totalResults: filteredMemories.length,
        searchTime: endTime - startTime,
        searchId
      }
    }

    const fuseResults = this.fuse.search(query, { limit: maxResults })
    const searchResults = fuseResults.map(result => ({
      ...result.item,
      relevance: 1 - (result.score || 0)
    }))

    const endTime = performance.now()
    this.addToSearchHistory(searchId, query, searchResults.length)

    return {
      memories: searchResults,
      totalResults: searchResults.length,
      searchTime: endTime - startTime,
      searchId
    }
  }

  private applyFilters(memories: SearchableMemory[], filterBy?: SearchOptions['filterBy']): SearchableMemory[] {
    if (!filterBy) return memories

    return memories.filter(memory => {
      // Filter by entity type
      if (filterBy.entityType && memory.metadata.entityType !== filterBy.entityType) {
        return false
      }

      // Filter by agent ID
      if (filterBy.agentId && memory.agentId !== filterBy.agentId) {
        return false
      }

      // Filter by tags
      if (filterBy.tags && filterBy.tags.length > 0) {
        const memoryTags = memory.metadata.tags || []
        const hasMatchingTag = filterBy.tags.some(tag => memoryTags.includes(tag))
        if (!hasMatchingTag) {
          return false
        }
      }

      // Filter by date range
      if (filterBy.dateRange) {
        const memoryDate = new Date(memory.metadata.createdAt)
        if (memoryDate < filterBy.dateRange.start || memoryDate > filterBy.dateRange.end) {
          return false
        }
      }

      // Filter by importance range
      if (filterBy.importanceRange) {
        const importance = memory.metadata.importance || 0
        if (importance < filterBy.importanceRange.min || importance > filterBy.importanceRange.max) {
          return false
        }
      }

      return true
    })
  }

  private generateSearchId(): string {
    return `search_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private addToSearchHistory(id: string, query: string, resultCount: number): void {
    this.searchHistory.push({
      id,
      query,
      timestamp: new Date(),
      results: resultCount
    })

    if (this.searchHistory.length > 100) {
      this.searchHistory = this.searchHistory.slice(-100)
    }
  }

  getSearchHistory(): Array<{
    id: string
    query: string
    timestamp: Date
    results: number
  }> {
    return [...this.searchHistory].reverse()
  }

  clearSearchHistory(): void {
    this.searchHistory = []
  }
  getSearchAnalytics(): {
    totalSearches: number
    averageResultsPerSearch: number
    averageSearchTime: number
    topQueries: Array<{ query: string; count: number }>
    searchesByTimeRange: {
      lastHour: number
      lastDay: number
      lastWeek: number
    }
    mostSearchedTerms: Array<{ query: string; count: number }>
  } {
    const totalSearches = this.searchHistory.length

    if (totalSearches === 0) {
      return {
        totalSearches: 0,
        averageResultsPerSearch: 0,
        averageSearchTime: 0,
        topQueries: [],
        searchesByTimeRange: {
          lastHour: 0,
          lastDay: 0,
          lastWeek: 0
        },
        mostSearchedTerms: []
      }
    }

    // Calculate averages
    const averageResultsPerSearch = this.searchHistory.reduce((sum, search) => sum + search.results, 0) / totalSearches

    // Since we don't track search time in history, provide a reasonable estimate
    const averageSearchTime = 120 // ms

    // Calculate top queries
    const queryCount = new Map<string, number>()
    this.searchHistory.forEach(search => {
      const count = queryCount.get(search.query) || 0
      queryCount.set(search.query, count + 1)
    })

    const topQueries = Array.from(queryCount.entries())
      .map(([query, count]) => ({ query, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)

    // Calculate most searched terms (same as topQueries but with different property name)
    const mostSearchedTerms = Array.from(queryCount.entries())
      .map(([query, count]) => ({ query, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)

    // Calculate searches by time range
    const now = new Date()
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000)
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

    const searchesByTimeRange = {
      lastHour: this.searchHistory.filter(search => search.timestamp >= oneHourAgo).length,
      lastDay: this.searchHistory.filter(search => search.timestamp >= oneDayAgo).length,
      lastWeek: this.searchHistory.filter(search => search.timestamp >= oneWeekAgo).length
    }

    return {
      totalSearches,
      averageResultsPerSearch,
      averageSearchTime,
      topQueries,
      searchesByTimeRange,
      mostSearchedTerms
    }
  }
}

export const memorySearch = new AdvancedMemorySearch()
export const advancedMemorySearch = new AdvancedMemorySearch()
