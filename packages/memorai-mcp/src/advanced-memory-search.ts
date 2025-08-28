/**
 * Advanced Memory Search & Filtering Engine
 * Provides semantic search with vector similarity, temporal filtering, and intelligent ranking
 * 
 * Features:
 * - Vector similarity search using Azure OpenAI embeddings
 * - Temporal filtering with date ranges and time-based scoring
 * - Importance-based ranking with configurable weights
 * - Fuzzy text matching for typo tolerance
 * - Search suggestions and auto-completion
 * - Real-time search results with debouncing
 * - Multi-dimensional search scoring
 */

import { Memory } from './types.js';
import { generateEmbedding, cosineSimilarity } from './embedding-utils.js';

export interface SearchQuery {
  text?: string;
  embeddings?: number[];
  filters?: SearchFilters;
  options?: SearchOptions;
}

export interface SearchFilters {
  // Temporal filters
  dateRange?: {
    startDate?: Date;
    endDate?: Date;
  };
  timeWindow?: {
    hours?: number;
    days?: number;
    weeks?: number;
    months?: number;
  };

  // Importance filters
  minImportance?: number;
  maxImportance?: number;
  importanceRange?: [number, number];

  // Agent and context filters
  agentIds?: string[];
  excludeAgentIds?: string[];
  projects?: string[];
  sessions?: string[];
  tags?: string[];

  // Content filters
  entityTypes?: string[];
  contentTypes?: string[];
  hasAttachments?: boolean;

  // Metadata filters
  metadata?: Record<string, any>;
  customFields?: Record<string, any>;
}

export interface SearchOptions {
  // Result configuration
  limit?: number;
  offset?: number;

  // Scoring configuration
  semanticWeight?: number;      // Weight for vector similarity (0-1)
  temporalWeight?: number;      // Weight for recency scoring (0-1)
  importanceWeight?: number;    // Weight for importance scoring (0-1)
  fuzzyWeight?: number;         // Weight for fuzzy text matching (0-1)

  // Search behavior
  enableFuzzySearch?: boolean;
  fuzzyThreshold?: number;      // Minimum similarity for fuzzy matches (0-1)
  enableSuggestions?: boolean;
  enableHighlighting?: boolean;

  // Performance options
  vectorSearchThreshold?: number;  // Minimum cosine similarity for vector results
  maxVectorResults?: number;       // Limit vector search before ranking
  enableCaching?: boolean;
  cacheTimeout?: number;           // Cache timeout in seconds

  // Result formatting
  includeScore?: boolean;
  includeExplanation?: boolean;
  includeHighlights?: boolean;
}

export interface SearchResult {
  memory: Memory;
  score: number;
  ranking: {
    semantic: number;
    temporal: number;
    importance: number;
    fuzzy: number;
    final: number;
  };
  highlights?: string[];
  explanation?: string;
  matchType: 'semantic' | 'fuzzy' | 'exact' | 'filter';
}

export interface SearchResponse {
  results: SearchResult[];
  totalCount: number;
  searchTime: number;
  query: SearchQuery;
  suggestions?: string[];
  aggregations?: SearchAggregations;
}

export interface SearchAggregations {
  byAgent: Record<string, number>;
  byProject: Record<string, number>;
  byTimeRange: Record<string, number>;
  byImportance: Record<string, number>;
  byEntityType: Record<string, number>;
}

export interface SearchSuggestion {
  text: string;
  type: 'completion' | 'correction' | 'related';
  confidence: number;
  category?: string;
}

/**
 * Advanced Memory Search Engine with semantic, temporal, and fuzzy search capabilities
 */
export class AdvancedMemorySearch {
  private searchCache = new Map<string, { result: SearchResponse; timestamp: number }>();
  private suggestionCache = new Map<string, SearchSuggestion[]>();
  private readonly defaultOptions: Required<SearchOptions> = {
    limit: 20,
    offset: 0,
    semanticWeight: 0.4,
    temporalWeight: 0.2,
    importanceWeight: 0.3,
    fuzzyWeight: 0.1,
    enableFuzzySearch: true,
    fuzzyThreshold: 0.6,
    enableSuggestions: true,
    enableHighlighting: true,
    vectorSearchThreshold: 0.1,
    maxVectorResults: 100,
    enableCaching: true,
    cacheTimeout: 300, // 5 minutes
    includeScore: true,
    includeExplanation: false,
    includeHighlights: true,
  };

  constructor(
    private memories: Memory[] = [],
    private enableVectorSearch = true
  ) { }

  /**
   * Perform advanced search with semantic, temporal, and fuzzy matching
   */
  async search(query: SearchQuery): Promise<SearchResponse> {
    const startTime = Date.now();
    const options = { ...this.defaultOptions, ...query.options };

    // Check cache first
    const cacheKey = this.getCacheKey(query);
    if (options.enableCaching && this.searchCache.has(cacheKey)) {
      const cached = this.searchCache.get(cacheKey)!;
      if (Date.now() - cached.timestamp < options.cacheTimeout * 1000) {
        return cached.result;
      }
    }

    // Filter memories first to reduce search space
    let candidateMemories = this.applyFilters(this.memories, query.filters || {});

    // Perform different types of searches
    const [semanticResults, fuzzyResults, exactResults] = await Promise.all([
      this.performSemanticSearch(candidateMemories, query, options),
      this.performFuzzySearch(candidateMemories, query, options),
      this.performExactSearch(candidateMemories, query, options)
    ]);

    // Combine and rank results
    const combinedResults = this.combineAndRankResults(
      semanticResults,
      fuzzyResults,
      exactResults,
      options
    );

    // Apply pagination
    const paginatedResults = combinedResults.slice(
      options.offset,
      options.offset + options.limit
    );

    // Generate suggestions
    const suggestions = options.enableSuggestions
      ? await this.generateSearchSuggestions(query, candidateMemories)
      : [];

    // Generate aggregations
    const aggregations = this.generateAggregations(candidateMemories);

    const response: SearchResponse = {
      results: paginatedResults,
      totalCount: combinedResults.length,
      searchTime: Date.now() - startTime,
      query,
      suggestions,
      aggregations
    };

    // Cache the result
    if (options.enableCaching) {
      this.searchCache.set(cacheKey, {
        result: response,
        timestamp: Date.now()
      });
    }

    return response;
  }

  /**
   * Get search suggestions and auto-completion
   */
  async getSuggestions(
    query: string,
    maxSuggestions: number = 10
  ): Promise<SearchSuggestion[]> {
    if (this.suggestionCache.has(query)) {
      return this.suggestionCache.get(query)!;
    }

    const suggestions: SearchSuggestion[] = [];

    // Completion suggestions (partial word matching)
    const completions = this.getCompletionSuggestions(query, maxSuggestions);
    suggestions.push(...completions);

    // Correction suggestions (typo corrections)
    const corrections = this.getCorrectionSuggestions(query, maxSuggestions);
    suggestions.push(...corrections);

    // Related term suggestions
    const related = await this.getRelatedSuggestions(query, maxSuggestions);
    suggestions.push(...related);

    // Sort by confidence and limit results
    const sortedSuggestions = suggestions
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, maxSuggestions);

    this.suggestionCache.set(query, sortedSuggestions);
    return sortedSuggestions;
  }

  /**
   * Perform semantic search using vector embeddings
   */
  private async performSemanticSearch(
    memories: Memory[],
    query: SearchQuery,
    options: Required<SearchOptions>
  ): Promise<SearchResult[]> {
    if (!this.enableVectorSearch || !query.text) {
      return [];
    }

    try {
      // Generate query embedding
      const queryEmbedding = query.embeddings || await generateEmbedding(query.text);

      const semanticResults: SearchResult[] = [];

      for (const memory of memories) {
        if (!memory.embeddings) continue;

        // Calculate semantic similarity
        const similarity = cosineSimilarity(queryEmbedding, memory.embeddings);

        if (similarity >= options.vectorSearchThreshold) {
          const result: SearchResult = {
            memory,
            score: similarity,
            ranking: {
              semantic: similarity,
              temporal: 0,
              importance: 0,
              fuzzy: 0,
              final: similarity
            },
            matchType: 'semantic'
          };

          if (options.includeHighlights) {
            result.highlights = this.generateSemanticHighlights(memory, query.text);
          }

          semanticResults.push(result);
        }
      }

      return semanticResults
        .sort((a, b) => b.score - a.score)
        .slice(0, options.maxVectorResults);

    } catch (error) {
      console.error('Semantic search error:', error);
      return [];
    }
  }

  /**
   * Perform fuzzy text search for typo tolerance
   */
  private performFuzzySearch(
    memories: Memory[],
    query: SearchQuery,
    options: Required<SearchOptions>
  ): Promise<SearchResult[]> {
    if (!options.enableFuzzySearch || !query.text) {
      return Promise.resolve([]);
    }

    const queryText = query.text.toLowerCase();
    const fuzzyResults: SearchResult[] = [];

    for (const memory of memories) {
      const content = memory.content.toLowerCase();
      const fuzzyScore = this.calculateFuzzyScore(queryText, content);

      if (fuzzyScore >= options.fuzzyThreshold) {
        const result: SearchResult = {
          memory,
          score: fuzzyScore,
          ranking: {
            semantic: 0,
            temporal: 0,
            importance: 0,
            fuzzy: fuzzyScore,
            final: fuzzyScore
          },
          matchType: 'fuzzy'
        };

        if (options.includeHighlights) {
          result.highlights = this.generateFuzzyHighlights(memory, queryText);
        }

        fuzzyResults.push(result);
      }
    }

    return Promise.resolve(fuzzyResults.sort((a, b) => b.score - a.score));
  }

  /**
   * Perform exact text search
   */
  private performExactSearch(
    memories: Memory[],
    query: SearchQuery,
    options: Required<SearchOptions>
  ): Promise<SearchResult[]> {
    if (!query.text) {
      return Promise.resolve([]);
    }

    const queryText = query.text.toLowerCase();
    const exactResults: SearchResult[] = [];

    for (const memory of memories) {
      const content = memory.content.toLowerCase();

      if (content.includes(queryText)) {
        const result: SearchResult = {
          memory,
          score: 1.0,
          ranking: {
            semantic: 0,
            temporal: 0,
            importance: 0,
            fuzzy: 1.0,
            final: 1.0
          },
          matchType: 'exact'
        };

        if (options.includeHighlights) {
          result.highlights = this.generateExactHighlights(memory, queryText);
        }

        exactResults.push(result);
      }
    }

    return Promise.resolve(exactResults);
  }

  /**
   * Combine and rank results using multi-dimensional scoring
   */
  private combineAndRankResults(
    semanticResults: SearchResult[],
    fuzzyResults: SearchResult[],
    exactResults: SearchResult[],
    options: Required<SearchOptions>
  ): SearchResult[] {
    const allResults = new Map<string, SearchResult>();

    // Add all results, preferring higher quality matches
    const addResults = (results: SearchResult[], priority: number) => {
      for (const result of results) {
        const key = result.memory.structuredKey;
        if (!allResults.has(key) || allResults.get(key)!.score < result.score) {
          allResults.set(key, { ...result });
        }
      }
    };

    addResults(exactResults, 3);
    addResults(semanticResults, 2);
    addResults(fuzzyResults, 1);

    // Calculate final scores with multi-dimensional ranking
    const finalResults: SearchResult[] = [];

    for (const result of allResults.values()) {
      const temporal = this.calculateTemporalScore(result.memory);
      const importance = this.calculateImportanceScore(result.memory);

      // Update ranking scores
      result.ranking.temporal = temporal;
      result.ranking.importance = importance;

      // Calculate weighted final score
      result.ranking.final = (
        result.ranking.semantic * options.semanticWeight +
        result.ranking.temporal * options.temporalWeight +
        result.ranking.importance * options.importanceWeight +
        result.ranking.fuzzy * options.fuzzyWeight
      );

      result.score = result.ranking.final;

      if (options.includeExplanation) {
        result.explanation = this.generateScoreExplanation(result.ranking, options);
      }

      finalResults.push(result);
    }

    return finalResults.sort((a, b) => b.score - a.score);
  }

  /**
   * Apply filters to reduce search space
   */
  private applyFilters(memories: Memory[], filters: SearchFilters): Memory[] {
    return memories.filter(memory => {
      // Temporal filters
      if (filters.dateRange) {
        const memoryDate = new Date(memory.timestamp);
        if (filters.dateRange.startDate && memoryDate < filters.dateRange.startDate) {
          return false;
        }
        if (filters.dateRange.endDate && memoryDate > filters.dateRange.endDate) {
          return false;
        }
      }

      if (filters.timeWindow) {
        const now = new Date();
        const memoryDate = new Date(memory.timestamp);
        const timeDiff = now.getTime() - memoryDate.getTime();

        let maxAge = 0;
        if (filters.timeWindow.hours) maxAge += filters.timeWindow.hours * 60 * 60 * 1000;
        if (filters.timeWindow.days) maxAge += filters.timeWindow.days * 24 * 60 * 60 * 1000;
        if (filters.timeWindow.weeks) maxAge += filters.timeWindow.weeks * 7 * 24 * 60 * 60 * 1000;
        if (filters.timeWindow.months) maxAge += filters.timeWindow.months * 30 * 24 * 60 * 60 * 1000;

        if (timeDiff > maxAge) return false;
      }

      // Importance filters
      if (filters.minImportance && memory.importance < filters.minImportance) {
        return false;
      }
      if (filters.maxImportance && memory.importance > filters.maxImportance) {
        return false;
      }
      if (filters.importanceRange) {
        const [min, max] = filters.importanceRange;
        if (memory.importance < min || memory.importance > max) {
          return false;
        }
      }

      // Agent filters
      if (filters.agentIds && !filters.agentIds.includes(memory.agentId)) {
        return false;
      }
      if (filters.excludeAgentIds && filters.excludeAgentIds.includes(memory.agentId)) {
        return false;
      }

      // Context filters
      if (filters.projects && !filters.projects.includes(memory.project || '')) {
        return false;
      }
      if (filters.sessions && !filters.sessions.includes(memory.session || '')) {
        return false;
      }

      // Tag filters
      if (filters.tags && filters.tags.length > 0) {
        const memoryTags = memory.tags || [];
        if (!filters.tags.some(tag => memoryTags.includes(tag))) {
          return false;
        }
      }

      // Entity type filters
      if (filters.entityTypes && !filters.entityTypes.includes(memory.entityType || '')) {
        return false;
      }

      return true;
    });
  }

  /**
   * Calculate temporal score based on recency
   */
  private calculateTemporalScore(memory: Memory): number {
    const now = Date.now();
    const memoryTime = new Date(memory.timestamp).getTime();
    const age = now - memoryTime;

    // More recent memories get higher scores
    // Uses exponential decay with half-life of 30 days
    const halfLife = 30 * 24 * 60 * 60 * 1000; // 30 days in milliseconds
    return Math.exp(-age / halfLife);
  }

  /**
   * Calculate importance-based score
   */
  private calculateImportanceScore(memory: Memory): number {
    // Normalize importance to 0-1 scale (assuming importance is 1-10)
    return (memory.importance - 1) / 9;
  }

  /**
   * Calculate fuzzy matching score using Levenshtein distance
   */
  private calculateFuzzyScore(query: string, content: string): number {
    if (content.includes(query)) return 1.0;

    const words = query.split(/\s+/);
    const contentWords = content.split(/\s+/);

    let totalScore = 0;
    let maxPossibleScore = 0;

    for (const queryWord of words) {
      let bestWordScore = 0;

      for (const contentWord of contentWords) {
        const distance = this.levenshteinDistance(queryWord, contentWord);
        const maxLength = Math.max(queryWord.length, contentWord.length);
        const similarity = 1 - (distance / maxLength);
        bestWordScore = Math.max(bestWordScore, similarity);
      }

      totalScore += bestWordScore;
      maxPossibleScore += 1;
    }

    return maxPossibleScore > 0 ? totalScore / maxPossibleScore : 0;
  }

  /**
   * Calculate Levenshtein distance between two strings
   */
  private levenshteinDistance(str1: string, str2: string): number {
    const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));

    for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;

    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1, // deletion
          matrix[j - 1][i] + 1, // insertion
          matrix[j - 1][i - 1] + indicator // substitution
        );
      }
    }

    return matrix[str2.length][str1.length];
  }

  /**
   * Generate search suggestions based on query and available memories
   */
  private async generateSearchSuggestions(
    query: SearchQuery,
    memories: Memory[]
  ): Promise<string[]> {
    if (!query.text || query.text.length < 2) return [];

    const suggestions = new Set<string>();
    const queryText = query.text.toLowerCase();

    // Extract common terms from memories
    const terms = new Map<string, number>();

    for (const memory of memories) {
      const words = memory.content.toLowerCase().split(/\W+/)
        .filter(word => word.length > 2);

      for (const word of words) {
        if (word.startsWith(queryText)) {
          terms.set(word, (terms.get(word) || 0) + 1);
        }
      }
    }

    // Get top suggestions by frequency
    return Array.from(terms.entries())
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([term]) => term);
  }

  /**
   * Get completion suggestions for partial queries
   */
  private getCompletionSuggestions(query: string, maxResults: number): SearchSuggestion[] {
    const suggestions: SearchSuggestion[] = [];
    const queryLower = query.toLowerCase();

    // Extract unique terms from all memories
    const terms = new Set<string>();

    for (const memory of this.memories) {
      const words = memory.content.split(/\W+/)
        .filter(word => word.length > 2)
        .map(word => word.toLowerCase());

      for (const word of words) {
        if (word.startsWith(queryLower) && word !== queryLower) {
          terms.add(word);
        }
      }
    }

    // Convert to suggestions
    for (const term of Array.from(terms).slice(0, maxResults)) {
      suggestions.push({
        text: term,
        type: 'completion',
        confidence: 0.8,
        category: 'autocomplete'
      });
    }

    return suggestions;
  }

  /**
   * Get correction suggestions for typos
   */
  private getCorrectionSuggestions(query: string, maxResults: number): SearchSuggestion[] {
    const suggestions: SearchSuggestion[] = [];
    const queryWords = query.toLowerCase().split(/\s+/);

    // Common terms from memories
    const commonTerms = this.extractCommonTerms();

    for (const queryWord of queryWords) {
      for (const term of commonTerms) {
        const distance = this.levenshteinDistance(queryWord, term);
        const maxLength = Math.max(queryWord.length, term.length);
        const similarity = 1 - (distance / maxLength);

        if (similarity > 0.6 && similarity < 0.95 && distance > 0) {
          suggestions.push({
            text: query.replace(queryWord, term),
            type: 'correction',
            confidence: similarity,
            category: 'spelling'
          });
        }
      }
    }

    return suggestions
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, maxResults);
  }

  /**
   * Get related term suggestions using semantic similarity
   */
  private async getRelatedSuggestions(query: string, maxResults: number): Promise<SearchSuggestion[]> {
    // This would use semantic similarity in a full implementation
    // For now, return simple related terms
    const related = [
      'summary', 'analysis', 'report', 'data', 'information',
      'project', 'task', 'goal', 'objective', 'result'
    ];

    return related
      .filter(term => !query.toLowerCase().includes(term))
      .slice(0, maxResults)
      .map(term => ({
        text: `${query} ${term}`,
        type: 'related' as const,
        confidence: 0.6,
        category: 'semantic'
      }));
  }

  /**
   * Extract common terms from all memories
   */
  private extractCommonTerms(): string[] {
    const termCounts = new Map<string, number>();

    for (const memory of this.memories) {
      const words = memory.content.toLowerCase()
        .split(/\W+/)
        .filter(word => word.length > 2);

      for (const word of words) {
        termCounts.set(word, (termCounts.get(word) || 0) + 1);
      }
    }

    return Array.from(termCounts.entries())
      .sort(([, a], [, b]) => b - a)
      .slice(0, 100)
      .map(([term]) => term);
  }

  /**
   * Generate semantic highlights for search results
   */
  private generateSemanticHighlights(memory: Memory, query: string): string[] {
    const highlights: string[] = [];
    const queryWords = query.toLowerCase().split(/\s+/);
    const sentences = memory.content.split(/[.!?]+/);

    for (const sentence of sentences) {
      const sentenceLower = sentence.toLowerCase();
      let relevanceScore = 0;

      for (const word of queryWords) {
        if (sentenceLower.includes(word)) {
          relevanceScore++;
        }
      }

      if (relevanceScore > 0) {
        highlights.push(sentence.trim());
      }
    }

    return highlights.slice(0, 3);
  }

  /**
   * Generate fuzzy highlights for search results
   */
  private generateFuzzyHighlights(memory: Memory, query: string): string[] {
    return this.generateExactHighlights(memory, query);
  }

  /**
   * Generate exact highlights for search results
   */
  private generateExactHighlights(memory: Memory, query: string): string[] {
    const highlights: string[] = [];
    const content = memory.content;
    const queryIndex = content.toLowerCase().indexOf(query.toLowerCase());

    if (queryIndex !== -1) {
      const start = Math.max(0, queryIndex - 50);
      const end = Math.min(content.length, queryIndex + query.length + 50);
      const highlight = content.substring(start, end);
      highlights.push(`...${highlight}...`);
    }

    return highlights;
  }

  /**
   * Generate score explanation for search results
   */
  private generateScoreExplanation(
    ranking: SearchResult['ranking'],
    options: Required<SearchOptions>
  ): string {
    const parts: string[] = [];

    if (ranking.semantic > 0) {
      parts.push(`Semantic similarity: ${(ranking.semantic * 100).toFixed(1)}% (weight: ${options.semanticWeight})`);
    }
    if (ranking.temporal > 0) {
      parts.push(`Recency: ${(ranking.temporal * 100).toFixed(1)}% (weight: ${options.temporalWeight})`);
    }
    if (ranking.importance > 0) {
      parts.push(`Importance: ${(ranking.importance * 100).toFixed(1)}% (weight: ${options.importanceWeight})`);
    }
    if (ranking.fuzzy > 0) {
      parts.push(`Text match: ${(ranking.fuzzy * 100).toFixed(1)}% (weight: ${options.fuzzyWeight})`);
    }

    return `Final score: ${(ranking.final * 100).toFixed(1)}%. ${parts.join(', ')}`;
  }

  /**
   * Generate search aggregations
   */
  private generateAggregations(memories: Memory[]): SearchAggregations {
    const byAgent: Record<string, number> = {};
    const byProject: Record<string, number> = {};
    const byTimeRange: Record<string, number> = {};
    const byImportance: Record<string, number> = {};
    const byEntityType: Record<string, number> = {};

    for (const memory of memories) {
      // Agent aggregation
      byAgent[memory.agentId] = (byAgent[memory.agentId] || 0) + 1;

      // Project aggregation
      if (memory.project) {
        byProject[memory.project] = (byProject[memory.project] || 0) + 1;
      }

      // Time range aggregation
      const age = Date.now() - new Date(memory.timestamp).getTime();
      const days = Math.floor(age / (1000 * 60 * 60 * 24));
      let timeRange: string;

      if (days === 0) timeRange = 'Today';
      else if (days <= 7) timeRange = 'This week';
      else if (days <= 30) timeRange = 'This month';
      else if (days <= 90) timeRange = 'Last 3 months';
      else timeRange = 'Older';

      byTimeRange[timeRange] = (byTimeRange[timeRange] || 0) + 1;

      // Importance aggregation
      const importanceRange = `${Math.floor(memory.importance / 2) * 2}-${Math.floor(memory.importance / 2) * 2 + 1}`;
      byImportance[importanceRange] = (byImportance[importanceRange] || 0) + 1;

      // Entity type aggregation
      if (memory.entityType) {
        byEntityType[memory.entityType] = (byEntityType[memory.entityType] || 0) + 1;
      }
    }

    return {
      byAgent,
      byProject,
      byTimeRange,
      byImportance,
      byEntityType
    };
  }

  /**
   * Generate cache key for search query
   */
  private getCacheKey(query: SearchQuery): string {
    return JSON.stringify({
      text: query.text,
      filters: query.filters,
      options: query.options
    });
  }

  /**
   * Update memories for search indexing
   */
  updateMemories(memories: Memory[]): void {
    this.memories = memories;
    // Clear caches when memories are updated
    this.searchCache.clear();
    this.suggestionCache.clear();
  }

  /**
   * Clear search caches
   */
  clearCaches(): void {
    this.searchCache.clear();
    this.suggestionCache.clear();
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { searchCache: number; suggestionCache: number } {
    return {
      searchCache: this.searchCache.size,
      suggestionCache: this.suggestionCache.size
    };
  }
}

export default AdvancedMemorySearch;