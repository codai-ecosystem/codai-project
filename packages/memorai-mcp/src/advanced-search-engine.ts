/**
 * Advanced Memory Search Engine
 * Provides semantic search with vector similarity, advanced filtering, and intelligent suggestions
 * Part of US-MEM-008 implementation
 */

import { EventEmitter } from 'events';
import { Memory, MemoryMetadata, SearchOptions, SearchResult, SearchSuggestion } from './types/memory-types';
import { EmbeddingService } from './embedding-service';
import { Logger } from './utils/logger';

interface AdvancedSearchOptions extends SearchOptions {
  // Vector similarity search
  semanticThreshold?: number; // 0.0-1.0, similarity threshold
  useSemanticSearch?: boolean;

  // Temporal filtering
  dateRange?: {
    start?: Date;
    end?: Date;
  };
  recencyBoost?: boolean; // Boost recent memories

  // Importance filtering
  minImportance?: number; // 1-10
  importanceWeight?: number; // Weight for importance in ranking

  // Fuzzy matching
  fuzzyTolerance?: number; // Edit distance tolerance
  enableFuzzyMatch?: boolean;

  // Multi-field search
  searchFields?: ('content' | 'tags' | 'entityType' | 'project' | 'session')[];
  fieldWeights?: Record<string, number>;

  // Advanced options
  enableSuggestions?: boolean;
  maxSuggestions?: number;
  enableHighlighting?: boolean;
  searchDebug?: boolean;
}

interface AdvancedSearchResult extends SearchResult {
  semanticScore?: number;
  temporalScore?: number;
  importanceScore?: number;
  fuzzyScore?: number;
  combinedScore: number;
  highlights?: Record<string, string[]>; // Field -> highlighted snippets
  debugInfo?: {
    searchPhases: string[];
    scores: Record<string, number>;
    matchReasons: string[];
  };
}

interface SearchIndex {
  contentIndex: Map<string, Set<string>>; // word -> memory IDs
  metadataIndex: Map<string, Map<string, Set<string>>>; // field -> value -> memory IDs
  vectorIndex: Map<string, number[]>; // memory ID -> embedding vector
  fuzzyIndex: Map<string, string[]>; // normalized word -> original words
}

export class AdvancedSearchEngine extends EventEmitter {
  private searchIndex: SearchIndex;
  private embeddingService: EmbeddingService;
  private memories: Map<string, Memory>;
  private logger: Logger;
  private indexDirty: boolean = false;
  private lastIndexUpdate: Date = new Date();

  constructor(embeddingService: EmbeddingService) {
    super();
    this.embeddingService = embeddingService;
    this.logger = new Logger('AdvancedSearchEngine');
    this.memories = new Map();
    this.searchIndex = this.initializeIndex();

    this.logger.info('Advanced Search Engine initialized');
  }

  private initializeIndex(): SearchIndex {
    return {
      contentIndex: new Map(),
      metadataIndex: new Map(),
      vectorIndex: new Map(),
      fuzzyIndex: new Map()
    };
  }

  /**
   * Add or update memory in search index
   */
  async addToIndex(memory: Memory): Promise<void> {
    try {
      this.memories.set(memory.structuredKey, memory);

      // Index content words
      await this.indexContent(memory);

      // Index metadata fields
      this.indexMetadata(memory);

      // Generate and index embedding vector
      if (this.embeddingService.isAvailable()) {
        await this.indexVector(memory);
      }

      // Index fuzzy matches
      this.indexFuzzyMatches(memory);

      this.indexDirty = false;
      this.lastIndexUpdate = new Date();

      this.emit('memoryIndexed', memory.structuredKey);

    } catch (error) {
      this.logger.error(`Failed to index memory ${memory.structuredKey}:`, error);
      throw error;
    }
  }

  private async indexContent(memory: Memory): Promise<void> {
    const words = this.extractWords(memory.content);

    for (const word of words) {
      const normalizedWord = word.toLowerCase();

      if (!this.searchIndex.contentIndex.has(normalizedWord)) {
        this.searchIndex.contentIndex.set(normalizedWord, new Set());
      }

      this.searchIndex.contentIndex.get(normalizedWord)!.add(memory.structuredKey);
    }
  }

  private indexMetadata(memory: Memory): Promise<void> {
    const metadata = memory.metadata || {};

    // Index searchable metadata fields
    const searchableFields = ['tags', 'entityType', 'project', 'session', 'priority'];

    for (const field of searchableFields) {
      if (metadata[field]) {
        if (!this.searchIndex.metadataIndex.has(field)) {
          this.searchIndex.metadataIndex.set(field, new Map());
        }

        const fieldIndex = this.searchIndex.metadataIndex.get(field)!;
        const values = Array.isArray(metadata[field]) ? metadata[field] : [metadata[field]];

        for (const value of values) {
          const normalizedValue = String(value).toLowerCase();

          if (!fieldIndex.has(normalizedValue)) {
            fieldIndex.set(normalizedValue, new Set());
          }

          fieldIndex.get(normalizedValue)!.add(memory.structuredKey);
        }
      }
    }

    return Promise.resolve();
  }

  private async indexVector(memory: Memory): Promise<void> {
    try {
      const embedding = await this.embeddingService.generateEmbedding(memory.content);
      this.searchIndex.vectorIndex.set(memory.structuredKey, embedding);
    } catch (error) {
      this.logger.warn(`Failed to generate embedding for memory ${memory.structuredKey}:`, error);
      // Continue without vector indexing for this memory
    }
  }

  private indexFuzzyMatches(memory: Memory): void {
    const words = this.extractWords(memory.content);

    for (const word of words) {
      const normalizedWord = word.toLowerCase();
      const fuzzyKey = this.generateFuzzyKey(normalizedWord);

      if (!this.searchIndex.fuzzyIndex.has(fuzzyKey)) {
        this.searchIndex.fuzzyIndex.set(fuzzyKey, []);
      }

      const fuzzyWords = this.searchIndex.fuzzyIndex.get(fuzzyKey)!;
      if (!fuzzyWords.includes(normalizedWord)) {
        fuzzyWords.push(normalizedWord);
      }
    }
  }

  /**
   * Perform advanced search with multiple ranking algorithms
   */
  async search(
    query: string,
    agentId: string,
    options: AdvancedSearchOptions = {}
  ): Promise<AdvancedSearchResult[]> {
    const startTime = Date.now();

    try {
      // Set defaults
      const searchOptions: Required<AdvancedSearchOptions> = {
        limit: options.limit || 10,
        minImportance: options.minImportance || 0,
        project: options.project,
        session: options.session,
        includeOtherAgents: options.includeOtherAgents || false,

        // Advanced options with defaults
        semanticThreshold: options.semanticThreshold || 0.3,
        useSemanticSearch: options.useSemanticSearch !== false,
        dateRange: options.dateRange || {},
        recencyBoost: options.recencyBoost || true,
        importanceWeight: options.importanceWeight || 1.0,
        fuzzyTolerance: options.fuzzyTolerance || 2,
        enableFuzzyMatch: options.enableFuzzyMatch !== false,
        searchFields: options.searchFields || ['content', 'tags', 'entityType'],
        fieldWeights: options.fieldWeights || { content: 1.0, tags: 0.8, entityType: 0.6 },
        enableSuggestions: options.enableSuggestions || false,
        maxSuggestions: options.maxSuggestions || 5,
        enableHighlighting: options.enableHighlighting || false,
        searchDebug: options.searchDebug || false
      };

      const searchPhases: string[] = [];
      let candidateMemories: Set<string> = new Set();

      // Phase 1: Text-based search
      if (searchOptions.searchFields.includes('content')) {
        const textMatches = this.performTextSearch(query, searchOptions);
        textMatches.forEach(id => candidateMemories.add(id));
        searchPhases.push(`Text search: ${textMatches.size} matches`);
      }

      // Phase 2: Metadata search
      const metadataMatches = this.performMetadataSearch(query, searchOptions);
      metadataMatches.forEach(id => candidateMemories.add(id));
      searchPhases.push(`Metadata search: ${metadataMatches.size} matches`);

      // Phase 3: Fuzzy search
      if (searchOptions.enableFuzzyMatch) {
        const fuzzyMatches = this.performFuzzySearch(query, searchOptions);
        fuzzyMatches.forEach(id => candidateMemories.add(id));
        searchPhases.push(`Fuzzy search: ${fuzzyMatches.size} matches`);
      }

      // Phase 4: Semantic search
      let semanticScores: Map<string, number> = new Map();
      if (searchOptions.useSemanticSearch && this.embeddingService.isAvailable()) {
        const semanticResults = await this.performSemanticSearch(query, searchOptions);
        semanticResults.forEach((score, id) => {
          candidateMemories.add(id);
          semanticScores.set(id, score);
        });
        searchPhases.push(`Semantic search: ${semanticResults.size} matches`);
      }

      // Filter and score results
      const results: AdvancedSearchResult[] = [];

      for (const memoryId of candidateMemories) {
        const memory = this.memories.get(memoryId);
        if (!memory) continue;

        // Apply agent and tenant filtering
        if (!this.shouldIncludeMemory(memory, agentId, searchOptions)) {
          continue;
        }

        // Apply date range filtering
        if (!this.passesDateFilter(memory, searchOptions.dateRange)) {
          continue;
        }

        // Apply importance filtering
        if ((memory.metadata?.importance || 0) < searchOptions.minImportance) {
          continue;
        }

        // Calculate comprehensive score
        const scores = this.calculateScores(memory, query, semanticScores, searchOptions);
        const combinedScore = this.calculateCombinedScore(scores, searchOptions);

        // Generate highlights if enabled
        const highlights = searchOptions.enableHighlighting
          ? this.generateHighlights(memory, query, searchOptions)
          : undefined;

        const result: AdvancedSearchResult = {
          memory,
          relevanceScore: combinedScore,
          semanticScore: scores.semantic,
          temporalScore: scores.temporal,
          importanceScore: scores.importance,
          fuzzyScore: scores.fuzzy,
          combinedScore,
          highlights,
          debugInfo: searchOptions.searchDebug ? {
            searchPhases,
            scores,
            matchReasons: this.generateMatchReasons(memory, query, scores, searchOptions)
          } : undefined
        };

        results.push(result);
      }

      // Sort by combined score
      results.sort((a, b) => b.combinedScore - a.combinedScore);

      // Limit results
      const limitedResults = results.slice(0, searchOptions.limit);

      const searchTime = Date.now() - startTime;
      this.logger.info(`Advanced search completed: ${limitedResults.length} results in ${searchTime}ms`);

      this.emit('searchCompleted', {
        query,
        resultsCount: limitedResults.length,
        searchTime,
        searchPhases
      });

      return limitedResults;

    } catch (error) {
      this.logger.error(`Advanced search failed for query "${query}":`, error);
      throw error;
    }
  }

  private performTextSearch(query: string, options: AdvancedSearchOptions): Set<string> {
    const matches = new Set<string>();
    const queryWords = this.extractWords(query);

    for (const word of queryWords) {
      const normalizedWord = word.toLowerCase();
      const matchingMemories = this.searchIndex.contentIndex.get(normalizedWord);

      if (matchingMemories) {
        matchingMemories.forEach(id => matches.add(id));
      }
    }

    return matches;
  }

  private performMetadataSearch(query: string, options: AdvancedSearchOptions): Set<string> {
    const matches = new Set<string>();
    const searchFields = options.searchFields || [];

    for (const field of searchFields) {
      if (field === 'content') continue; // Already handled

      const fieldIndex = this.searchIndex.metadataIndex.get(field);
      if (!fieldIndex) continue;

      const queryNormalized = query.toLowerCase();

      // Exact match
      const exactMatches = fieldIndex.get(queryNormalized);
      if (exactMatches) {
        exactMatches.forEach(id => matches.add(id));
      }

      // Partial match
      for (const [value, memoryIds] of fieldIndex.entries()) {
        if (value.includes(queryNormalized) || queryNormalized.includes(value)) {
          memoryIds.forEach(id => matches.add(id));
        }
      }
    }

    return matches;
  }

  private performFuzzySearch(query: string, options: AdvancedSearchOptions): Set<string> {
    const matches = new Set<string>();
    const queryWords = this.extractWords(query);
    const tolerance = options.fuzzyTolerance || 2;

    for (const word of queryWords) {
      const fuzzyKey = this.generateFuzzyKey(word.toLowerCase());
      const candidateWords = this.searchIndex.fuzzyIndex.get(fuzzyKey) || [];

      for (const candidate of candidateWords) {
        if (this.calculateEditDistance(word.toLowerCase(), candidate) <= tolerance) {
          const matchingMemories = this.searchIndex.contentIndex.get(candidate);
          if (matchingMemories) {
            matchingMemories.forEach(id => matches.add(id));
          }
        }
      }
    }

    return matches;
  }

  private async performSemanticSearch(query: string, options: AdvancedSearchOptions): Promise<Map<string, number>> {
    const matches = new Map<string, number>();

    try {
      const queryEmbedding = await this.embeddingService.generateEmbedding(query);
      const threshold = options.semanticThreshold || 0.3;

      for (const [memoryId, embedding] of this.searchIndex.vectorIndex.entries()) {
        const similarity = this.calculateCosineSimilarity(queryEmbedding, embedding);

        if (similarity >= threshold) {
          matches.set(memoryId, similarity);
        }
      }

    } catch (error) {
      this.logger.warn('Semantic search failed, falling back to text search:', error);
    }

    return matches;
  }

  /**
   * Generate intelligent search suggestions
   */
  async generateSearchSuggestions(
    query: string,
    agentId: string,
    options: AdvancedSearchOptions = {}
  ): Promise<SearchSuggestion[]> {
    const suggestions: SearchSuggestion[] = [];
    const maxSuggestions = options.maxSuggestions || 5;

    try {
      // 1. Typo correction suggestions
      const correctionSuggestions = this.generateCorrectionSuggestions(query);
      suggestions.push(...correctionSuggestions);

      // 2. Auto-completion suggestions
      const completionSuggestions = this.generateCompletionSuggestions(query);
      suggestions.push(...completionSuggestions);

      // 3. Related term suggestions
      const relatedSuggestions = await this.generateRelatedSuggestions(query);
      suggestions.push(...relatedSuggestions);

      // 4. Historical search suggestions
      const historicalSuggestions = this.generateHistoricalSuggestions(query, agentId);
      suggestions.push(...historicalSuggestions);

      // Sort by relevance and limit
      suggestions.sort((a, b) => b.relevance - a.relevance);
      return suggestions.slice(0, maxSuggestions);

    } catch (error) {
      this.logger.error('Failed to generate search suggestions:', error);
      return [];
    }
  }

  // Helper methods
  private extractWords(text: string): string[] {
    return text.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 2);
  }

  private generateFuzzyKey(word: string): string {
    // Simple soundex-like algorithm for fuzzy matching
    return word.replace(/[aeiou]/g, '').substring(0, 4);
  }

  private calculateEditDistance(str1: string, str2: string): number {
    const matrix: number[][] = [];

    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }

    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }

    return matrix[str2.length][str1.length];
  }

  private calculateCosineSimilarity(vec1: number[], vec2: number[]): number {
    let dotProduct = 0;
    let norm1 = 0;
    let norm2 = 0;

    for (let i = 0; i < Math.min(vec1.length, vec2.length); i++) {
      dotProduct += vec1[i] * vec2[i];
      norm1 += vec1[i] * vec1[i];
      norm2 += vec2[i] * vec2[i];
    }

    const magnitude = Math.sqrt(norm1) * Math.sqrt(norm2);
    return magnitude === 0 ? 0 : dotProduct / magnitude;
  }

  private shouldIncludeMemory(
    memory: Memory,
    agentId: string,
    options: AdvancedSearchOptions
  ): boolean {
    // Agent filtering
    if (memory.agentId !== agentId && !options.includeOtherAgents) {
      return false;
    }

    // Project/session filtering
    if (options.project && memory.metadata?.project !== options.project) {
      return false;
    }

    if (options.session && memory.metadata?.session !== options.session) {
      return false;
    }

    return true;
  }

  private passesDateFilter(memory: Memory, dateRange: { start?: Date; end?: Date }): boolean {
    if (!dateRange.start && !dateRange.end) return true;

    const memoryDate = new Date(memory.timestamp);

    if (dateRange.start && memoryDate < dateRange.start) return false;
    if (dateRange.end && memoryDate > dateRange.end) return false;

    return true;
  }

  private calculateScores(
    memory: Memory,
    query: string,
    semanticScores: Map<string, number>,
    options: AdvancedSearchOptions
  ): Record<string, number> {
    const now = Date.now();
    const memoryTime = new Date(memory.timestamp).getTime();
    const ageInDays = (now - memoryTime) / (1000 * 60 * 60 * 24);

    return {
      semantic: semanticScores.get(memory.structuredKey) || 0,
      temporal: options.recencyBoost ? Math.exp(-ageInDays / 30) : 0.5, // Decay over 30 days
      importance: (memory.metadata?.importance || 5) / 10,
      fuzzy: this.calculateFuzzyScore(memory.content, query, options),
      textMatch: this.calculateTextMatchScore(memory.content, query)
    };
  }

  private calculateCombinedScore(
    scores: Record<string, number>,
    options: AdvancedSearchOptions
  ): number {
    const weights = {
      semantic: 0.4,
      textMatch: 0.3,
      importance: (options.importanceWeight || 1.0) * 0.2,
      temporal: options.recencyBoost ? 0.1 : 0,
      fuzzy: 0.1
    };

    return Object.entries(scores).reduce((total, [type, score]) => {
      return total + (score * (weights[type] || 0));
    }, 0);
  }

  private calculateFuzzyScore(content: string, query: string, options: AdvancedSearchOptions): number {
    if (!options.enableFuzzyMatch) return 0;

    const contentWords = this.extractWords(content);
    const queryWords = this.extractWords(query);
    let totalScore = 0;
    let matches = 0;

    for (const queryWord of queryWords) {
      let bestScore = 0;

      for (const contentWord of contentWords) {
        const distance = this.calculateEditDistance(queryWord, contentWord);
        const maxLen = Math.max(queryWord.length, contentWord.length);
        const score = Math.max(0, (maxLen - distance) / maxLen);

        if (score > bestScore) {
          bestScore = score;
        }
      }

      if (bestScore > 0.5) {
        totalScore += bestScore;
        matches++;
      }
    }

    return matches > 0 ? totalScore / queryWords.length : 0;
  }

  private calculateTextMatchScore(content: string, query: string): number {
    const contentLower = content.toLowerCase();
    const queryLower = query.toLowerCase();

    // Exact phrase match gets highest score
    if (contentLower.includes(queryLower)) {
      return 1.0;
    }

    // Word matches
    const contentWords = this.extractWords(content);
    const queryWords = this.extractWords(query);
    const matchCount = queryWords.filter(word =>
      contentWords.some(contentWord => contentWord === word)
    ).length;

    return queryWords.length > 0 ? matchCount / queryWords.length : 0;
  }

  private generateHighlights(
    memory: Memory,
    query: string,
    options: AdvancedSearchOptions
  ): Record<string, string[]> {
    const highlights: Record<string, string[]> = {};
    const queryWords = this.extractWords(query);

    // Highlight content
    const contentHighlights = this.highlightText(memory.content, queryWords);
    if (contentHighlights.length > 0) {
      highlights.content = contentHighlights;
    }

    // Highlight tags
    if (memory.metadata?.tags) {
      const tagsText = Array.isArray(memory.metadata.tags)
        ? memory.metadata.tags.join(' ')
        : String(memory.metadata.tags);
      const tagHighlights = this.highlightText(tagsText, queryWords);
      if (tagHighlights.length > 0) {
        highlights.tags = tagHighlights;
      }
    }

    return highlights;
  }

  private highlightText(text: string, queryWords: string[]): string[] {
    const highlights: string[] = [];
    const sentences = text.split(/[.!?]+/);

    for (const sentence of sentences) {
      const sentenceLower = sentence.toLowerCase();
      let hasMatch = false;

      for (const word of queryWords) {
        if (sentenceLower.includes(word.toLowerCase())) {
          hasMatch = true;
          break;
        }
      }

      if (hasMatch) {
        let highlighted = sentence.trim();

        for (const word of queryWords) {
          const regex = new RegExp(`\\b${word}\\b`, 'gi');
          highlighted = highlighted.replace(regex, `<mark>$&</mark>`);
        }

        highlights.push(highlighted);
      }
    }

    return highlights.slice(0, 3); // Limit to 3 highlights
  }

  private generateMatchReasons(
    memory: Memory,
    query: string,
    scores: Record<string, number>,
    options: AdvancedSearchOptions
  ): string[] {
    const reasons: string[] = [];

    if (scores.textMatch > 0.5) {
      reasons.push('Strong text match in content');
    }

    if (scores.semantic > 0.7) {
      reasons.push('High semantic similarity');
    }

    if (scores.importance > 0.8) {
      reasons.push('High importance score');
    }

    if (scores.temporal > 0.8) {
      reasons.push('Recent memory');
    }

    if (scores.fuzzy > 0.5) {
      reasons.push('Fuzzy match found');
    }

    return reasons;
  }

  private generateCorrectionSuggestions(query: string): SearchSuggestion[] {
    // This would integrate with a spell checker in a real implementation
    return [];
  }

  private generateCompletionSuggestions(query: string): SearchSuggestion[] {
    const suggestions: SearchSuggestion[] = [];
    const queryLower = query.toLowerCase();

    // Find words that start with the query
    for (const [word, memoryIds] of this.searchIndex.contentIndex.entries()) {
      if (word.startsWith(queryLower) && word !== queryLower) {
        suggestions.push({
          text: word,
          type: 'completion',
          relevance: 0.7,
          resultCount: memoryIds.size
        });
      }
    }

    return suggestions.slice(0, 3);
  }

  private async generateRelatedSuggestions(query: string): Promise<SearchSuggestion[]> {
    // This would use semantic similarity to find related terms
    return [];
  }

  private generateHistoricalSuggestions(query: string, agentId: string): SearchSuggestion[] {
    // This would track search history and suggest popular searches
    return [];
  }

  /**
   * Remove memory from search index
   */
  removeFromIndex(memoryId: string): void {
    try {
      // Remove from content index
      for (const [word, memoryIds] of this.searchIndex.contentIndex.entries()) {
        memoryIds.delete(memoryId);
        if (memoryIds.size === 0) {
          this.searchIndex.contentIndex.delete(word);
        }
      }

      // Remove from metadata index
      for (const [field, fieldIndex] of this.searchIndex.metadataIndex.entries()) {
        for (const [value, memoryIds] of fieldIndex.entries()) {
          memoryIds.delete(memoryId);
          if (memoryIds.size === 0) {
            fieldIndex.delete(value);
          }
        }
      }

      // Remove from vector index
      this.searchIndex.vectorIndex.delete(memoryId);

      // Remove from memories
      this.memories.delete(memoryId);

      this.emit('memoryRemoved', memoryId);

    } catch (error) {
      this.logger.error(`Failed to remove memory ${memoryId} from index:`, error);
      throw error;
    }
  }

  /**
   * Get search engine statistics
   */
  getSearchStatistics(): {
    totalMemories: number;
    indexedWords: number;
    vectorIndexSize: number;
    lastIndexUpdate: Date;
    indexHealth: 'healthy' | 'degraded' | 'unhealthy';
  } {
    const totalMemories = this.memories.size;
    const indexedWords = this.searchIndex.contentIndex.size;
    const vectorIndexSize = this.searchIndex.vectorIndex.size;

    let indexHealth: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';

    if (this.indexDirty) {
      indexHealth = 'degraded';
    }

    if (totalMemories > 0 && (indexedWords === 0 || vectorIndexSize < totalMemories * 0.5)) {
      indexHealth = 'unhealthy';
    }

    return {
      totalMemories,
      indexedWords,
      vectorIndexSize,
      lastIndexUpdate: this.lastIndexUpdate,
      indexHealth
    };
  }

  /**
   * Rebuild search index
   */
  async rebuildIndex(): Promise<void> {
    this.logger.info('Rebuilding search index...');

    const memories = Array.from(this.memories.values());
    this.searchIndex = this.initializeIndex();

    for (const memory of memories) {
      await this.addToIndex(memory);
    }

    this.logger.info('Search index rebuilt successfully');
  }
}