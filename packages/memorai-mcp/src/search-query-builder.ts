/**
 * Search Query Builder for Advanced Memory Search
 * Provides a fluent API for building complex search queries
 */

import { SearchQuery, SearchFilters, SearchOptions } from './advanced-memory-search.js';

export class SearchQueryBuilder {
  private query: SearchQuery = {};
  private filters: SearchFilters = {};
  private options: SearchOptions = {};

  /**
   * Set the search text
   */
  text(searchText: string): SearchQueryBuilder {
    this.query.text = searchText;
    return this;
  }

  /**
   * Set pre-computed embeddings for the search
   */
  embeddings(embeddings: number[]): SearchQueryBuilder {
    this.query.embeddings = embeddings;
    return this;
  }

  /**
   * Filter by date range
   */
  dateRange(startDate?: Date, endDate?: Date): SearchQueryBuilder {
    if (!this.filters.dateRange) this.filters.dateRange = {};
    if (startDate) this.filters.dateRange.startDate = startDate;
    if (endDate) this.filters.dateRange.endDate = endDate;
    return this;
  }

  /**
   * Filter by time window (relative to now)
   */
  timeWindow(options: {
    hours?: number;
    days?: number;
    weeks?: number;
    months?: number;
  }): SearchQueryBuilder {
    this.filters.timeWindow = options;
    return this;
  }

  /**
   * Filter by minimum importance
   */
  minImportance(importance: number): SearchQueryBuilder {
    this.filters.minImportance = importance;
    return this;
  }

  /**
   * Filter by maximum importance
   */
  maxImportance(importance: number): SearchQueryBuilder {
    this.filters.maxImportance = importance;
    return this;
  }

  /**
   * Filter by importance range
   */
  importanceRange(min: number, max: number): SearchQueryBuilder {
    this.filters.importanceRange = [min, max];
    return this;
  }

  /**
   * Filter by specific agent IDs
   */
  agents(...agentIds: string[]): SearchQueryBuilder {
    this.filters.agentIds = agentIds;
    return this;
  }

  /**
   * Exclude specific agent IDs
   */
  excludeAgents(...agentIds: string[]): SearchQueryBuilder {
    this.filters.excludeAgentIds = agentIds;
    return this;
  }

  /**
   * Filter by projects
   */
  projects(...projects: string[]): SearchQueryBuilder {
    this.filters.projects = projects;
    return this;
  }

  /**
   * Filter by sessions
   */
  sessions(...sessions: string[]): SearchQueryBuilder {
    this.filters.sessions = sessions;
    return this;
  }

  /**
   * Filter by tags
   */
  tags(...tags: string[]): SearchQueryBuilder {
    this.filters.tags = tags;
    return this;
  }

  /**
   * Filter by entity types
   */
  entityTypes(...entityTypes: string[]): SearchQueryBuilder {
    this.filters.entityTypes = entityTypes;
    return this;
  }

  /**
   * Filter by content types
   */
  contentTypes(...contentTypes: string[]): SearchQueryBuilder {
    this.filters.contentTypes = contentTypes;
    return this;
  }

  /**
   * Filter by memories with attachments
   */
  hasAttachments(hasAttachments: boolean = true): SearchQueryBuilder {
    this.filters.hasAttachments = hasAttachments;
    return this;
  }

  /**
   * Filter by custom metadata
   */
  metadata(key: string, value: any): SearchQueryBuilder {
    if (!this.filters.metadata) this.filters.metadata = {};
    this.filters.metadata[key] = value;
    return this;
  }

  /**
   * Set pagination limit
   */
  limit(limit: number): SearchQueryBuilder {
    this.options.limit = limit;
    return this;
  }

  /**
   * Set pagination offset
   */
  offset(offset: number): SearchQueryBuilder {
    this.options.offset = offset;
    return this;
  }

  /**
   * Configure scoring weights
   */
  weights(weights: {
    semantic?: number;
    temporal?: number;
    importance?: number;
    fuzzy?: number;
  }): SearchQueryBuilder {
    if (weights.semantic !== undefined) this.options.semanticWeight = weights.semantic;
    if (weights.temporal !== undefined) this.options.temporalWeight = weights.temporal;
    if (weights.importance !== undefined) this.options.importanceWeight = weights.importance;
    if (weights.fuzzy !== undefined) this.options.fuzzyWeight = weights.fuzzy;
    return this;
  }

  /**
   * Enable or disable fuzzy search
   */
  fuzzySearch(enabled: boolean = true, threshold: number = 0.6): SearchQueryBuilder {
    this.options.enableFuzzySearch = enabled;
    this.options.fuzzyThreshold = threshold;
    return this;
  }

  /**
   * Enable or disable search suggestions
   */
  suggestions(enabled: boolean = true): SearchQueryBuilder {
    this.options.enableSuggestions = enabled;
    return this;
  }

  /**
   * Enable or disable result highlighting
   */
  highlighting(enabled: boolean = true): SearchQueryBuilder {
    this.options.enableHighlighting = enabled;
    return this;
  }

  /**
   * Configure vector search parameters
   */
  vectorSearch(threshold: number = 0.1, maxResults: number = 100): SearchQueryBuilder {
    this.options.vectorSearchThreshold = threshold;
    this.options.maxVectorResults = maxResults;
    return this;
  }

  /**
   * Enable or disable caching
   */
  caching(enabled: boolean = true, timeout: number = 300): SearchQueryBuilder {
    this.options.enableCaching = enabled;
    this.options.cacheTimeout = timeout;
    return this;
  }

  /**
   * Include detailed scoring information
   */
  includeScoring(
    includeScore: boolean = true,
    includeExplanation: boolean = false
  ): SearchQueryBuilder {
    this.options.includeScore = includeScore;
    this.options.includeExplanation = includeExplanation;
    return this;
  }

  /**
   * Configure result highlighting
   */
  includeHighlights(enabled: boolean = true): SearchQueryBuilder {
    this.options.includeHighlights = enabled;
    return this;
  }

  /**
   * Build the final search query
   */
  build(): SearchQuery {
    return {
      text: this.query.text,
      embeddings: this.query.embeddings,
      filters: Object.keys(this.filters).length > 0 ? this.filters : undefined,
      options: Object.keys(this.options).length > 0 ? this.options : undefined
    };
  }

  /**
   * Reset the builder to start fresh
   */
  reset(): SearchQueryBuilder {
    this.query = {};
    this.filters = {};
    this.options = {};
    return this;
  }

  /**
   * Clone the current builder state
   */
  clone(): SearchQueryBuilder {
    const cloned = new SearchQueryBuilder();
    cloned.query = { ...this.query };
    cloned.filters = JSON.parse(JSON.stringify(this.filters));
    cloned.options = { ...this.options };
    return cloned;
  }
}

/**
 * Convenience function to create a new search query builder
 */
export function createSearchQuery(): SearchQueryBuilder {
  return new SearchQueryBuilder();
}

/**
 * Predefined query templates for common search patterns
 */
export class SearchTemplates {
  /**
   * Search for recent memories (last week)
   */
  static recent(searchText?: string): SearchQueryBuilder {
    return new SearchQueryBuilder()
      .text(searchText || '')
      .timeWindow({ weeks: 1 })
      .weights({ temporal: 0.5, semantic: 0.3, importance: 0.2 });
  }

  /**
   * Search for important memories (importance >= 7)
   */
  static important(searchText?: string): SearchQueryBuilder {
    return new SearchQueryBuilder()
      .text(searchText || '')
      .minImportance(7)
      .weights({ importance: 0.5, semantic: 0.3, temporal: 0.2 });
  }

  /**
   * Search within a specific project
   */
  static project(projectName: string, searchText?: string): SearchQueryBuilder {
    return new SearchQueryBuilder()
      .text(searchText || '')
      .projects(projectName)
      .weights({ semantic: 0.6, importance: 0.3, temporal: 0.1 });
  }

  /**
   * Search by specific agent
   */
  static byAgent(agentId: string, searchText?: string): SearchQueryBuilder {
    return new SearchQueryBuilder()
      .text(searchText || '')
      .agents(agentId)
      .weights({ semantic: 0.5, temporal: 0.3, importance: 0.2 });
  }

  /**
   * Fuzzy search for typo tolerance
   */
  static fuzzy(searchText: string): SearchQueryBuilder {
    return new SearchQueryBuilder()
      .text(searchText)
      .fuzzySearch(true, 0.5)
      .weights({ fuzzy: 0.4, semantic: 0.3, temporal: 0.2, importance: 0.1 });
  }

  /**
   * Semantic search with high similarity threshold
   */
  static semantic(searchText: string): SearchQueryBuilder {
    return new SearchQueryBuilder()
      .text(searchText)
      .vectorSearch(0.3, 50)
      .weights({ semantic: 0.7, importance: 0.2, temporal: 0.1 });
  }

  /**
   * Search with comprehensive results
   */
  static comprehensive(searchText: string): SearchQueryBuilder {
    return new SearchQueryBuilder()
      .text(searchText)
      .limit(50)
      .fuzzySearch(true)
      .suggestions(true)
      .highlighting(true)
      .includeScoring(true, true)
      .weights({ semantic: 0.4, temporal: 0.2, importance: 0.3, fuzzy: 0.1 });
  }

  /**
   * Quick search with minimal processing
   */
  static quick(searchText: string): SearchQueryBuilder {
    return new SearchQueryBuilder()
      .text(searchText)
      .limit(10)
      .fuzzySearch(false)
      .suggestions(false)
      .highlighting(false)
      .caching(true, 60) // 1 minute cache for quick searches
      .weights({ semantic: 0.6, fuzzy: 0.4 });
  }
}

export default SearchQueryBuilder;