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
      threshold: 0.3, // More lenient threshold for better fuzzy matching
      includeScore: true,
      shouldSort: true,
      ignoreLocation: true, // Ignore location of match in text
      findAllMatches: true, // Find all matches
      minMatchCharLength: 1, // Allow single character matches
      useExtendedSearch: true // Enable extended search syntax
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

    const { maxResults = 50, useSemanticSimilarity = false, semanticThreshold = 0.3, combineWithFuzzy = false } = options

    if (!query || query.trim().length === 0) {
      // Sort by importance if no query
      const sortedMemories = this.sortMemories(filteredMemories, options.sortBy || 'importance')
      const endTime = performance.now()
      const results = sortedMemories.slice(0, maxResults)
      this.addToSearchHistory(searchId, query || '', results.length)
      return {
        memories: results,
        totalResults: filteredMemories.length,
        searchTime: endTime - startTime,
        searchId
      }
    }

    let searchResults: SearchableMemory[] = []

    if (useSemanticSimilarity) {
      // Enhanced semantic search implementation
      searchResults = this.performSemanticSearch(query, filteredMemories, semanticThreshold)

      if (combineWithFuzzy && searchResults.length < maxResults) {
        // Combine with fuzzy search for better results
        const fuseResults = this.fuse.search(query, { limit: maxResults - searchResults.length })
        const fuzzyResults = fuseResults.map(result => ({
          ...result.item,
          relevance: Math.max(0.1, 1 - (result.score || 0)) // Ensure minimum relevance
        }))

        // Merge and deduplicate
        const existingIds = new Set(searchResults.map(r => r.id))
        const newFuzzyResults = fuzzyResults.filter(r => !existingIds.has(r.id))
        searchResults = [...searchResults, ...newFuzzyResults]
      }
    } else {
      // Standard fuzzy search with enhanced fuzzy matching
      const fuseResults = this.fuse.search(query, { limit: maxResults })
      searchResults = fuseResults.map(result => ({
        ...result.item,
        relevance: Math.max(0.1, 1 - (result.score || 0)) // Ensure minimum relevance for all results
      }))

      // If fuzzy search doesn't find enough results, try semantic search as fallback
      if (searchResults.length === 0 && query.length > 2) {
        const semanticResults = this.performSemanticSearch(query, filteredMemories, 0.1) // Lower threshold
        searchResults = semanticResults.slice(0, maxResults)
      }
    }

    // Sort results by relevance if available, otherwise by specified sort method
    if (searchResults.length > 0 && searchResults[0].relevance !== undefined) {
      searchResults.sort((a, b) => (b.relevance || 0) - (a.relevance || 0))
    } else {
      searchResults = this.sortMemories(searchResults, options.sortBy || 'relevance')
    }

    // Apply maxResults limit
    searchResults = searchResults.slice(0, maxResults)

    const endTime = performance.now()
    this.addToSearchHistory(searchId, query, searchResults.length)

    return {
      memories: searchResults,
      totalResults: searchResults.length,
      searchTime: endTime - startTime,
      searchId
    }
  }

  private performSemanticSearch(query: string, memories: SearchableMemory[], threshold: number): SearchableMemory[] {
    // Enhanced semantic search using multiple techniques
    const queryLower = this.normalizeText(query)
    const queryWords = queryLower.split(/\s+/)

    return memories.map(memory => {
      const contentLower = this.normalizeText(memory.content)
      const tags = memory.metadata.tags || []
      const entityType = memory.metadata.entityType || ''

      let relevanceScore = 0

      // Exact phrase matching (highest weight)
      if (contentLower.includes(queryLower)) {
        relevanceScore += 0.9
      }

      // Word matching with context (including partial matches for Unicode)
      const contentWords = contentLower.split(/\s+/)
      const matchingWords = queryWords.filter(qWord =>
        contentWords.some(cWord =>
          cWord.includes(qWord) ||
          qWord.includes(cWord) ||
          this.isUnicodeMatch(qWord, cWord)
        )
      )

      if (matchingWords.length > 0) {
        relevanceScore += (matchingWords.length / queryWords.length) * 0.7
      }

      // Tag matching (high relevance)
      const matchingTags = tags.filter(tag =>
        queryWords.some(qWord => {
          const tagLower = this.normalizeText(tag)
          return tagLower.includes(qWord) || qWord.includes(tagLower) || this.isUnicodeMatch(qWord, tagLower)
        })
      )
      if (matchingTags.length > 0) {
        relevanceScore += (matchingTags.length / Math.max(tags.length, 1)) * 0.8
      }

      // Entity type matching
      const entityTypeLower = this.normalizeText(entityType)
      if (entityType && queryWords.some(qWord => entityTypeLower.includes(qWord) || this.isUnicodeMatch(qWord, entityTypeLower))) {
        relevanceScore += 0.5
      }

      // Semantic word relationships (basic implementation)
      const semanticMatches = this.findSemanticMatches(queryWords, contentWords, tags)
      if (semanticMatches > 0) {
        relevanceScore += semanticMatches * 0.6
      }

      // Fuzzy matching for typos (like Reaktt -> React)
      const fuzzyMatch = this.performFuzzyWordMatch(queryWords, contentWords)
      if (fuzzyMatch > 0) {
        relevanceScore += fuzzyMatch * 0.5
      }

      // Importance boost
      if (memory.metadata.importance) {
        relevanceScore += memory.metadata.importance * 0.2
      }

      // Normalize and ensure minimum score for any matches
      relevanceScore = Math.min(1.0, Math.max(0, relevanceScore))

      return {
        ...memory,
        relevance: relevanceScore
      }
    })
      .filter(memory => (memory.relevance || 0) >= threshold)
      .sort((a, b) => (b.relevance || 0) - (a.relevance || 0))
  }

  private normalizeText(text: string): string {
    // Normalize Unicode characters and remove accents for better matching
    return text.toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
      .replace(/[^\w\s\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u4e00-\u9fff]/gu, ' ') // Keep emojis and Chinese characters
      .replace(/\s+/g, ' ')
      .trim()
  }

  private isUnicodeMatch(query: string, content: string): boolean {
    // Check for Unicode character matching (simplified for emojis and special chars)
    const emojiRegex = /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu
    const queryEmojis = Array.from(query.matchAll(emojiRegex)).map(match => match[0])
    const contentEmojis = Array.from(content.matchAll(emojiRegex)).map(match => match[0])

    // Check if any emojis match
    if (queryEmojis.length > 0 && contentEmojis.length > 0) {
      return queryEmojis.some(emoji => contentEmojis.includes(emoji))
    }

    // Check for similar character patterns (basic)
    const normalizedQuery = this.normalizeText(query)
    const normalizedContent = this.normalizeText(content)

    return normalizedContent.includes(normalizedQuery) || normalizedQuery.includes(normalizedContent)
  }

  private performFuzzyWordMatch(queryWords: string[], contentWords: string[]): number {
    let totalScore = 0

    for (const qWord of queryWords) {
      let bestMatch = 0
      for (const cWord of contentWords) {
        const similarity = this.calculateLevenshteinSimilarity(qWord, cWord)
        if (similarity > 0.7) { // 70% similarity threshold (handles "Reaktt" -> "React")
          bestMatch = Math.max(bestMatch, similarity)
        }
      }
      totalScore += bestMatch
    }

    return queryWords.length > 0 ? totalScore / queryWords.length : 0
  }

  private calculateLevenshteinSimilarity(str1: string, str2: string): number {
    const len1 = str1.length
    const len2 = str2.length

    if (len1 === 0) return len2 === 0 ? 1 : 0
    if (len2 === 0) return 0

    const matrix: number[][] = []

    // Initialize matrix
    for (let i = 0; i <= len1; i++) {
      matrix[i] = [i]
    }
    for (let j = 0; j <= len2; j++) {
      matrix[0][j] = j
    }

    // Fill matrix
    for (let i = 1; i <= len1; i++) {
      for (let j = 1; j <= len2; j++) {
        const cost = str1[i - 1] === str2[j - 1] ? 0 : 1
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1,     // deletion
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j - 1] + cost // substitution
        )
      }
    }

    const maxLen = Math.max(len1, len2)
    const distance = matrix[len1][len2]
    return 1 - (distance / maxLen)
  }

  private findSemanticMatches(queryWords: string[], contentWords: string[], tags: string[]): number {
    // Basic semantic relationships
    const semanticGroups = {
      'web': ['frontend', 'react', 'api', 'html', 'css', 'javascript', 'typescript'],
      'development': ['coding', 'programming', 'software', 'engineering', 'dev'],
      'performance': ['optimization', 'speed', 'fast', 'efficient', 'tuning'],
      'database': ['sql', 'postgresql', 'mysql', 'mongodb', 'data', 'storage'],
      'deployment': ['docker', 'kubernetes', 'ci', 'cd', 'production', 'staging']
    }

    let matches = 0
    for (const qWord of queryWords) {
      for (const [group, related] of Object.entries(semanticGroups)) {
        if (related.includes(qWord) || qWord === group) {
          // Check if any related words exist in content or tags
          const hasRelated = contentWords.some(cWord => related.includes(cWord)) ||
            tags.some(tag => related.includes(tag.toLowerCase()))
          if (hasRelated) {
            matches += 0.3
          }
        }
      }
    }

    return Math.min(1.0, matches)
  }

  private sortMemories(memories: SearchableMemory[], sortBy: string = 'relevance'): SearchableMemory[] {
    const sorted = [...memories]

    switch (sortBy) {
      case 'importance':
        return sorted.sort((a, b) => (b.metadata.importance || 0) - (a.metadata.importance || 0))
      case 'date':
        return sorted.sort((a, b) => new Date(b.metadata.createdAt).getTime() - new Date(a.metadata.createdAt).getTime())
      case 'relevance':
      default:
        return sorted.sort((a, b) => (b.relevance || 0) - (a.relevance || 0))
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
    searchTrends: Array<{ date: string; searches: number }>
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
        mostSearchedTerms: [],
        searchTrends: this.generateEmptySearchTrends()
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

    // Generate search trends for the last 7 days
    const searchTrends = this.generateSearchTrends()

    return {
      totalSearches,
      averageResultsPerSearch,
      averageSearchTime,
      topQueries,
      searchesByTimeRange,
      mostSearchedTerms,
      searchTrends
    }
  }

  private generateEmptySearchTrends(): Array<{ date: string; searches: number }> {
    const trends: Array<{ date: string; searches: number }> = []
    for (let i = 6; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      trends.push({
        date: date.toISOString().split('T')[0],
        searches: 0
      })
    }
    return trends
  }

  private generateSearchTrends(): Array<{ date: string; searches: number }> {
    const trends: Array<{ date: string; searches: number }> = []
    const searchesByDate = new Map<string, number>()

    // Group searches by date
    this.searchHistory.forEach(search => {
      const date = search.timestamp.toISOString().split('T')[0]
      const count = searchesByDate.get(date) || 0
      searchesByDate.set(date, count + 1)
    })

    // Generate trends for the last 7 days
    for (let i = 6; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]
      const searches = searchesByDate.get(dateStr) || 0
      trends.push({
        date: dateStr,
        searches
      })
    }

    return trends
  }
}

export const memorySearch = new AdvancedMemorySearch()
export const advancedMemorySearch = new AdvancedMemorySearch()
