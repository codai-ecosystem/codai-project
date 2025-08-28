/**
 * @fileoverview Main Search Engine Orchestrator
 * @author Cautai Team
 * @version 1.0.0
 */

import type { SearchQuery, SearchResult, SearchResponse, SearchAdapter, SearchEngineConfig } from './types.js';
import { HybridRankingEngine } from './ranking.js';
import { SearchCache } from './cache.js';
import { ResultDeduplicator } from './deduplication.js';
import { DuckDuckGoAdapter } from './adapters/duckduckgo.js';

export class CautaiSearchEngine {
  private adapters: Map<string, SearchAdapter> = new Map();
  private rankingEngine: HybridRankingEngine;
  private cache: SearchCache;
  private deduplicator: ResultDeduplicator;
  private config: SearchEngineConfig;

  constructor(config: Partial<SearchEngineConfig> = {}) {
    this.config = {
      adapters: {
        duckduckgo: {
          enabled: true,
          priority: 2,
          timeout: 10000,
          maxResults: 20
        }
      },
      ranking: {
        algorithm: 'hybrid',
        weights: {
          relevance: 0.4,
          quality: 0.3,
          recency: 0.2,
          authority: 0.1
        }
      },
      caching: {
        enabled: true,
        ttl: 3600000, // 1 hour
        maxSize: 1000,
        strategy: 'lru'
      },
      deduplication: {
        enabled: true,
        similarity_threshold: 0.85,
        fields: ['title', 'url', 'snippet']
      },
      ...config
    };

    this.rankingEngine = new HybridRankingEngine({
      semanticWeight: this.config.ranking.weights.relevance,
      bm25Weight: 1 - this.config.ranking.weights.relevance
    });

    this.cache = new SearchCache(this.config.caching);
    this.deduplicator = new ResultDeduplicator({
      enabled: this.config.deduplication.enabled,
      similarityThreshold: this.config.deduplication.similarity_threshold,
      algorithms: this.config.deduplication.fields.includes('content') 
        ? ['url', 'title', 'content', 'semantic'] as const
        : ['url', 'title', 'semantic'] as const,
      keepHighestScore: true
    });

    this.initializeAdapters();
  }

  /**
   * Perform search across all available adapters
   */
  public async search(query: SearchQuery): Promise<SearchResponse> {
    const startTime = Date.now();
    
    // Validate query
    if (!query.query || query.query.trim().length === 0) {
      throw new Error('Search query cannot be empty');
    }

    // Check cache first
    const cacheKey = this.generateCacheKey(query);
    if (this.config.caching.enabled) {
      const cachedResult = this.cache.get(cacheKey);
      if (cachedResult) {
        return {
          ...cachedResult,
          processingTimeMs: Date.now() - startTime
        };
      }
    }

    // Get available adapters sorted by priority
    const availableAdapters = Array.from(this.adapters.values())
      .filter(adapter => adapter.isAvailable())
      .sort((a, b) => b.getConfig().priority - a.getConfig().priority);

    if (availableAdapters.length === 0) {
      throw new Error('No search adapters available');
    }

    // Execute searches in parallel with fallbacks
    const searchPromises = availableAdapters.slice(0, 2).map(async (adapter) => {
      try {
        return await adapter.search({
          ...query,
          limit: Math.min(query.limit || 50, adapter.getConfig().maxResults)
        });
      } catch (error) {
        console.warn(`Search adapter ${adapter.name} failed:`, error);
        return [];
      }
    });

    const results = await Promise.all(searchPromises);
    let allResults = results.flat();

    // Apply deduplication
    if (this.config.deduplication.enabled) {
      allResults = this.deduplicator.deduplicate(allResults);
    }

    // Apply ranking
    const rankedResults = await this.rankingEngine.rankResults(
      allResults,
      query.query
    );

    // Apply limit and offset
    const limit = query.limit || 10;
    const offset = query.offset || 0;
    const paginatedResults = rankedResults.slice(offset, offset + limit);

    // Generate search response
    const response: SearchResponse = {
      results: paginatedResults,
      total: rankedResults.length,
      query: query.query,
      processingTimeMs: Date.now() - startTime,
      suggestions: this.generateSuggestions(query.query),
      relatedQueries: this.generateRelatedQueries(query.query),
      facets: this.generateFacets(rankedResults)
    };

    // Cache the response
    if (this.config.caching.enabled) {
      this.cache.set(cacheKey, response, this.config.caching.ttl);
    }

    return response;
  }

  /**
   * Add a search adapter
   */
  public addAdapter(adapter: SearchAdapter): void {
    this.adapters.set(adapter.name, adapter);
  }

  /**
   * Remove a search adapter
   */
  public removeAdapter(name: string): boolean {
    return this.adapters.delete(name);
  }

  /**
   * Get search engine statistics
   */
  public getStats() {
    return {
      adapters: Array.from(this.adapters.keys()),
      cacheStats: this.cache.getStats(),
      config: this.config
    };
  }

  private initializeAdapters(): void {
    // Initialize DuckDuckGo adapter
    if (this.config.adapters.duckduckgo?.enabled) {
      const adapter = new DuckDuckGoAdapter(this.config.adapters.duckduckgo);
      this.addAdapter(adapter);
    }

    // Add more adapters here as needed
    // - Bing Adapter
    // - Google Custom Search Adapter
    // - Internal knowledge base adapter
    // - Web scraping adapter
  }

  private generateCacheKey(query: SearchQuery): string {
    const key = {
      query: query.query,
      limit: query.limit,
      offset: query.offset,
      filters: query.filters,
      language: query.language,
      mode: query.mode
    };
    return Buffer.from(JSON.stringify(key)).toString('base64');
  }

  private generateSuggestions(query: string): string[] {
    // Mock suggestions - in production, implement proper query suggestion
    const words = query.toLowerCase().split(/\s+/);
    const suggestions = [];
    
    // Add common programming-related suggestions
    if (words.some(w => ['javascript', 'js', 'node'].includes(w))) {
      suggestions.push(`${query} tutorial`, `${query} best practices`);
    }
    
    if (words.some(w => ['python', 'py'].includes(w))) {
      suggestions.push(`${query} examples`, `${query} documentation`);
    }
    
    // Add generic suggestions
    suggestions.push(`${query} guide`, `${query} how to`);
    
    return suggestions.slice(0, 3);
  }

  private generateRelatedQueries(query: string): string[] {
    // Mock related queries - implement semantic similarity in production
    return [
      `alternatives to ${query}`,
      `${query} vs comparison`,
      `${query} implementation`
    ];
  }

  private generateFacets(results: SearchResult[]) {
    const domains: { [key: string]: number } = {};
    const contentTypes: { [key: string]: number } = {};
    const languages: { [key: string]: number } = {};

    results.forEach(result => {
      domains[result.domain] = (domains[result.domain] || 0) + 1;
      contentTypes[result.contentType] = (contentTypes[result.contentType] || 0) + 1;
      languages[result.language] = (languages[result.language] || 0) + 1;
    });

    return {
      domains: Object.entries(domains)
        .map(([domain, count]) => ({ domain, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10),
      contentTypes: Object.entries(contentTypes)
        .map(([type, count]) => ({ type, count }))
        .sort((a, b) => b.count - a.count),
      languages: Object.entries(languages)
        .map(([language, count]) => ({ language, count }))
        .sort((a, b) => b.count - a.count),
      dateRanges: [] // Implement date range facets
    };
  }
}