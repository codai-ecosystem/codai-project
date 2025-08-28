/**
 * Enhanced Memory Store Integration with Advanced Search
 * Integrates the Advanced Search Engine with the existing Enhanced Memory Store
 * Part of US-MEM-008 implementation
 */

import { EnhancedMemoryStore } from './enhanced-memory-store';
import { AdvancedSearchEngine } from './advanced-search-engine';
import { EmbeddingService } from './embedding-service';
import { Memory, MemoryMetadata, SearchOptions, SearchResult } from './types/memory-types';
import { AdvancedSearchOptions, AdvancedSearchResult } from './types/advanced-search-types';
import { Logger } from './utils/logger';

export interface SearchEnhancedMemoryStore extends EnhancedMemoryStore {
  // Advanced search methods
  advancedSearch(query: string, agentId: string, options?: AdvancedSearchOptions): Promise<AdvancedSearchResult[]>;
  generateSearchSuggestions(query: string, agentId: string, options?: AdvancedSearchOptions): Promise<any[]>;
  rebuildSearchIndex(): Promise<void>;
  getSearchStatistics(): any;
}

/**
 * Enhanced Memory Store with Advanced Search capabilities
 * Extends the existing EnhancedMemoryStore with powerful search features
 */
export class SearchEnhancedMemoryStore extends EnhancedMemoryStore {
  private searchEngine: AdvancedSearchEngine;
  private embeddingService: EmbeddingService;
  private logger: Logger;

  constructor(options: {
    embeddingConfig?: {
      provider: 'azure-openai' | 'openai' | 'local' | 'offline';
      endpoint?: string;
      apiKey?: string;
      deploymentName?: string;
      apiVersion?: string;
    };
    searchConfig?: {
      enableSemanticSearch?: boolean;
      enableFuzzySearch?: boolean;
      defaultLimit?: number;
      maxCandidates?: number;
    };
  } = {}) {
    super();

    this.logger = new Logger('SearchEnhancedMemoryStore');

    // Initialize embedding service
    const embeddingConfig = {
      provider: 'azure-openai' as const,
      endpoint: process.env.AZURE_OPENAI_ENDPOINT,
      apiKey: process.env.AZURE_OPENAI_API_KEY,
      deploymentName: process.env.AZURE_OPENAI_DEPLOYMENT_NAME || 'text-embedding-3-large',
      apiVersion: process.env.AZURE_OPENAI_API_VERSION || '2024-02-01',
      ...options.embeddingConfig
    };

    this.embeddingService = new EmbeddingService(embeddingConfig);

    // Initialize advanced search engine
    this.searchEngine = new AdvancedSearchEngine(this.embeddingService);

    this.logger.info('Search Enhanced Memory Store initialized');

    // Setup event listeners for automatic index updates
    this.setupSearchIndexSync();
  }

  private setupSearchIndexSync(): void {
    // Listen for memory creation events
    this.on('memoryStored', async (memory: Memory) => {
      try {
        await this.searchEngine.addToIndex(memory);
        this.logger.debug(`Memory ${memory.structuredKey} added to search index`);
      } catch (error) {
        this.logger.error(`Failed to index memory ${memory.structuredKey}:`, error);
      }
    });

    // Listen for memory deletion events
    this.on('memoryDeleted', (memoryId: string) => {
      try {
        this.searchEngine.removeFromIndex(memoryId);
        this.logger.debug(`Memory ${memoryId} removed from search index`);
      } catch (error) {
        this.logger.error(`Failed to remove memory ${memoryId} from search index:`, error);
      }
    });

    // Listen for memory updates
    this.on('memoryUpdated', async (memory: Memory) => {
      try {
        await this.searchEngine.addToIndex(memory); // Re-index updated memory
        this.logger.debug(`Memory ${memory.structuredKey} re-indexed after update`);
      } catch (error) {
        this.logger.error(`Failed to re-index updated memory ${memory.structuredKey}:`, error);
      }
    });
  }

  /**
   * Override the storeMemory method to automatically index new memories
   */
  async storeMemory(agentId: string, content: string, metadata?: MemoryMetadata): Promise<Memory> {
    const memory = await super.storeMemory(agentId, content, metadata);

    try {
      // Add to search index immediately
      await this.searchEngine.addToIndex(memory);
      this.logger.debug(`Memory ${memory.structuredKey} indexed on creation`);
    } catch (error) {
      this.logger.error(`Failed to index new memory ${memory.structuredKey}:`, error);
      // Don't fail the store operation due to indexing issues
    }

    return memory;
  }

  /**
   * Override the forgetMemory method to remove from search index
   */
  async forgetMemory(agentId: string, structuredKey: string): Promise<boolean> {
    const result = await super.forgetMemory(agentId, structuredKey);

    if (result) {
      try {
        this.searchEngine.removeFromIndex(structuredKey);
        this.logger.debug(`Memory ${structuredKey} removed from search index`);
      } catch (error) {
        this.logger.error(`Failed to remove memory ${structuredKey} from search index:`, error);
      }
    }

    return result;
  }

  /**
   * Enhanced search method that uses the advanced search engine
   * Falls back to original search if advanced search fails
   */
  async searchMemories(
    agentId: string,
    query: string,
    options: SearchOptions = {}
  ): Promise<SearchResult[]> {
    try {
      // Use advanced search by default
      const advancedOptions: AdvancedSearchOptions = {
        limit: options.limit,
        minImportance: options.minImportance,
        project: options.project,
        session: options.session,
        includeOtherAgents: options.includeOtherAgents,
        useSemanticSearch: true,
        enableFuzzySearch: true,
        enableMetadataSearch: true,
        enableHighlighting: false // Keep compatibility with original interface
      };

      const advancedResults = await this.searchEngine.search(query, agentId, advancedOptions);

      // Convert to original SearchResult format
      return advancedResults.map(result => ({
        memory: result.memory,
        relevanceScore: result.combinedScore
      }));

    } catch (error) {
      this.logger.warn('Advanced search failed, falling back to original search:', error);
      // Fallback to original search method
      return super.searchMemories(agentId, query, options);
    }
  }

  /**
   * Advanced search with full feature set
   */
  async advancedSearch(
    query: string,
    agentId: string,
    options: AdvancedSearchOptions = {}
  ): Promise<AdvancedSearchResult[]> {
    try {
      return await this.searchEngine.search(query, agentId, options);
    } catch (error) {
      this.logger.error('Advanced search failed:', error);
      throw error;
    }
  }

  /**
   * Generate intelligent search suggestions
   */
  async generateSearchSuggestions(
    query: string,
    agentId: string,
    options: AdvancedSearchOptions = {}
  ): Promise<any[]> {
    try {
      return await this.searchEngine.generateSearchSuggestions(query, agentId, options);
    } catch (error) {
      this.logger.error('Failed to generate search suggestions:', error);
      return []; // Return empty suggestions on error
    }
  }

  /**
   * Semantic similarity search using embeddings
   */
  async semanticSearch(
    query: string,
    agentId: string,
    options: {
      limit?: number;
      threshold?: number;
      includeOtherAgents?: boolean;
    } = {}
  ): Promise<AdvancedSearchResult[]> {
    const searchOptions: AdvancedSearchOptions = {
      limit: options.limit || 10,
      semanticThreshold: options.threshold || 0.3,
      includeOtherAgents: options.includeOtherAgents || false,
      useSemanticSearch: true,
      enableFuzzySearch: false, // Only semantic search
      enableMetadataSearch: false
    };

    return this.advancedSearch(query, agentId, searchOptions);
  }

  /**
   * Fuzzy search for handling typos and approximate matches
   */
  async fuzzySearch(
    query: string,
    agentId: string,
    options: {
      limit?: number;
      tolerance?: number;
      includeOtherAgents?: boolean;
    } = {}
  ): Promise<AdvancedSearchResult[]> {
    const searchOptions: AdvancedSearchOptions = {
      limit: options.limit || 10,
      fuzzyTolerance: options.tolerance || 2,
      includeOtherAgents: options.includeOtherAgents || false,
      useSemanticSearch: false,
      enableFuzzySearch: true,
      enableMetadataSearch: true
    };

    return this.advancedSearch(query, agentId, searchOptions);
  }

  /**
   * Multi-field search across content and metadata
   */
  async multiFieldSearch(
    query: string,
    agentId: string,
    fields: ('content' | 'tags' | 'entityType' | 'project' | 'session')[],
    options: {
      limit?: number;
      fieldWeights?: Record<string, number>;
      includeOtherAgents?: boolean;
    } = {}
  ): Promise<AdvancedSearchResult[]> {
    const searchOptions: AdvancedSearchOptions = {
      limit: options.limit || 10,
      searchFields: fields,
      fieldWeights: options.fieldWeights,
      includeOtherAgents: options.includeOtherAgents || false,
      useSemanticSearch: true,
      enableFuzzySearch: true,
      enableMetadataSearch: true
    };

    return this.advancedSearch(query, agentId, searchOptions);
  }

  /**
   * Search with custom ranking weights
   */
  async customRankingSearch(
    query: string,
    agentId: string,
    ranking: {
      semanticWeight?: number;
      textMatchWeight?: number;
      importanceWeight?: number;
      temporalWeight?: number;
      fuzzyWeight?: number;
    },
    options: AdvancedSearchOptions = {}
  ): Promise<AdvancedSearchResult[]> {
    const searchOptions: AdvancedSearchOptions = {
      ...options,
      ranking: {
        semanticWeight: ranking.semanticWeight || 0.4,
        textMatchWeight: ranking.textMatchWeight || 0.3,
        importanceWeight: ranking.importanceWeight || 0.2,
        temporalWeight: ranking.temporalWeight || 0.1,
        fuzzyWeight: ranking.fuzzyWeight || 0.05,
        // Add required fields with defaults
        semanticThreshold: 0.3,
        fuzzyTolerance: 2,
        temporalDecay: 30,
        boostExactMatch: 1.5,
        penalizePartialMatch: 0.8,
        metadataWeight: 0.1
      }
    };

    return this.advancedSearch(query, agentId, searchOptions);
  }

  /**
   * Time-based search with recency filtering
   */
  async temporalSearch(
    query: string,
    agentId: string,
    dateRange: {
      start?: Date;
      end?: Date;
    },
    options: {
      limit?: number;
      recencyBoost?: boolean;
      includeOtherAgents?: boolean;
    } = {}
  ): Promise<AdvancedSearchResult[]> {
    const searchOptions: AdvancedSearchOptions = {
      limit: options.limit || 10,
      dateRange,
      recencyBoost: options.recencyBoost !== false,
      includeOtherAgents: options.includeOtherAgents || false,
      useSemanticSearch: true,
      enableFuzzySearch: true,
      enableMetadataSearch: true
    };

    return this.advancedSearch(query, agentId, searchOptions);
  }

  /**
   * Search within specific projects or sessions
   */
  async scopedSearch(
    query: string,
    agentId: string,
    scope: {
      projects?: string[];
      sessions?: string[];
      entityTypes?: string[];
      tags?: string[];
    },
    options: AdvancedSearchOptions = {}
  ): Promise<AdvancedSearchResult[]> {
    const searchOptions: AdvancedSearchOptions = {
      ...options,
      project: scope.projects?.[0], // Use first project for compatibility
      session: scope.sessions?.[0], // Use first session for compatibility
      // Additional filtering would need to be implemented in the search engine
    };

    return this.advancedSearch(query, agentId, searchOptions);
  }

  /**
   * Get comprehensive search statistics
   */
  getSearchStatistics(): any {
    const searchStats = this.searchEngine.getSearchStatistics();
    const embeddingStats = this.embeddingService.getCacheStats();

    return {
      search: searchStats,
      embedding: embeddingStats,
      integration: {
        totalMemories: this.getAllMemories().length,
        indexedMemories: searchStats.totalMemories,
        indexCoverage: searchStats.totalMemories / this.getAllMemories().length,
        lastSync: new Date()
      }
    };
  }

  /**
   * Rebuild the search index from all stored memories
   */
  async rebuildSearchIndex(): Promise<void> {
    this.logger.info('Rebuilding search index from all memories...');

    try {
      // Get all memories
      const allMemories = this.getAllMemories();

      // Clear and rebuild the search index
      await this.searchEngine.rebuildIndex();

      // Re-index all memories
      for (const memory of allMemories) {
        await this.searchEngine.addToIndex(memory);
      }

      this.logger.info(`Search index rebuilt with ${allMemories.length} memories`);

    } catch (error) {
      this.logger.error('Failed to rebuild search index:', error);
      throw error;
    }
  }

  /**
   * Test search functionality and connectivity
   */
  async testSearch(): Promise<{
    textSearch: boolean;
    semanticSearch: boolean;
    fuzzySearch: boolean;
    embeddingService: boolean;
    indexHealth: string;
  }> {
    const results = {
      textSearch: false,
      semanticSearch: false,
      fuzzySearch: false,
      embeddingService: false,
      indexHealth: 'unknown'
    };

    try {
      // Test basic text search
      const textResults = await this.advancedSearch('test', 'test-agent', {
        useSemanticSearch: false,
        enableFuzzySearch: false,
        limit: 1
      });
      results.textSearch = true;

      // Test semantic search
      if (this.embeddingService.isAvailable()) {
        const semanticResults = await this.advancedSearch('test', 'test-agent', {
          useSemanticSearch: true,
          limit: 1
        });
        results.semanticSearch = true;
      }

      // Test fuzzy search
      const fuzzyResults = await this.advancedSearch('tset', 'test-agent', {
        useSemanticSearch: false,
        enableFuzzySearch: true,
        limit: 1
      });
      results.fuzzySearch = true;

      // Test embedding service
      const connectivity = await this.embeddingService.testConnectivity();
      results.embeddingService = connectivity.available;

      // Get index health
      const stats = this.getSearchStatistics();
      results.indexHealth = stats.search.indexHealth;

    } catch (error) {
      this.logger.error('Search test failed:', error);
    }

    return results;
  }

  /**
   * Optimize search performance
   */
  async optimizeSearch(): Promise<void> {
    this.logger.info('Optimizing search performance...');

    try {
      // Clear embedding cache to free memory
      this.embeddingService.clearCache();

      // Rebuild search index for optimal performance
      await this.rebuildSearchIndex();

      // Test connectivity and update configuration if needed
      const connectivity = await this.embeddingService.testConnectivity();
      if (!connectivity.available) {
        this.logger.warn('Embedding service unavailable, using offline mode');
      }

      this.logger.info('Search optimization completed');

    } catch (error) {
      this.logger.error('Search optimization failed:', error);
      throw error;
    }
  }
}