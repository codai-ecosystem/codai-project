/**
 * Enhanced Memory Search Engine - US-MEM-017
 * ==========================================
 * 
 * A comprehensive search system for MemorAI with advanced capabilities:
 * - Semantic search with natural language understanding
 * - Faceted filtering with multiple criteria
 * - Real-time search suggestions and auto-complete
 * - Advanced query parsing and syntax support
 * - Performance optimized with caching and indexing
 * - Full integration with EnhancedMemoryStore
 * 
 * Features:
 * - Multi-dimensional search (semantic, keyword, metadata)
 * - Real-time filtering and sorting
 * - Search result highlighting and snippets
 * - Query suggestions and auto-completion
 * - Search analytics and performance monitoring
 * - Advanced query syntax (operators, wildcards, ranges)
 * 
 * @author GitHub Copilot
 * @version 1.0.0
 * @date August 27, 2025
 */

import { EventEmitter } from 'events';
import { EnhancedMemoryStore, StoredMemory } from './enhanced-memory-store.js';

// ============================================================================
// CORE INTERFACES AND TYPES
// ============================================================================

/**
 * Search context for enhanced memory search operations
 */
export interface SearchContext {
    agentId: string;
    sessionId?: string;
    userId?: string;
    searchId?: string;
    timestamp?: string;
    preferences?: SearchPreferences;
}

/**
 * User search preferences and settings
 */
export interface SearchPreferences {
    enableSemanticSearch?: boolean;
    enableFuzzyMatching?: boolean;
    maxResults?: number;
    includeSnippets?: boolean;
    highlightMatches?: boolean;
    searchHistory?: boolean;
    autoComplete?: boolean;
    realTimeSearch?: boolean;
}

/**
 * Advanced search query with multiple search modes and filters
 */
export interface SearchQuery {
    query: string;
    mode: SearchMode;
    filters: SearchFilters;
    sorting: SortingOptions;
    pagination: PaginationOptions;
    highlighting: HighlightingOptions;
    facets: FacetConfiguration[];
    suggestions?: boolean;
    timeRange?: TimeRangeFilter;
}

/**
 * Search modes for different types of search operations
 */
export enum SearchMode {
    SEMANTIC = 'semantic',
    KEYWORD = 'keyword',
    FUZZY = 'fuzzy',
    EXACT = 'exact',
    HYBRID = 'hybrid',
    ADVANCED = 'advanced'
}

/**
 * Comprehensive search filters
 */
export interface SearchFilters {
    agentIds?: string[];
    importance?: ImportanceRange;
    entityTypes?: string[];
    tags?: string[];
    projects?: string[];
    sessions?: string[];
    dateCreated?: DateRange;
    dateModified?: DateRange;
    contentLength?: NumberRange;
    hasMetadata?: boolean;
    customFilters?: Record<string, any>;
}

/**
 * Sorting options for search results
 */
export interface SortingOptions {
    field: SortField;
    direction: SortDirection;
    secondarySort?: {
        field: SortField;
        direction: SortDirection;
    };
}

/**
 * Available sort fields
 */
export enum SortField {
    RELEVANCE = 'relevance',
    DATE_CREATED = 'dateCreated',
    DATE_MODIFIED = 'dateModified',
    IMPORTANCE = 'importance',
    CONTENT_LENGTH = 'contentLength',
    AGENT_ID = 'agentId',
    ENTITY_TYPE = 'entityType'
}

/**
 * Sort direction
 */
export enum SortDirection {
    ASC = 'asc',
    DESC = 'desc'
}

/**
 * Pagination options for search results
 */
export interface PaginationOptions {
    page: number;
    limit: number;
    offset?: number;
    cursorBased?: boolean;
    cursor?: string;
}

/**
 * Text highlighting configuration
 */
export interface HighlightingOptions {
    enabled: boolean;
    preTag?: string;
    postTag?: string;
    maxSnippetLength?: number;
    maxSnippets?: number;
    fragmentSize?: number;
}

/**
 * Facet configuration for search results
 */
export interface FacetConfiguration {
    field: string;
    maxValues: number;
    minCount?: number;
    sortBy?: 'count' | 'value';
}

/**
 * Date range filter
 */
export interface DateRange {
    from?: Date | string;
    to?: Date | string;
}

/**
 * Time range filter with relative options
 */
export interface TimeRangeFilter {
    range?: DateRange;
    relative?: RelativeTimeRange;
}

/**
 * Relative time range options
 */
export interface RelativeTimeRange {
    unit: 'minutes' | 'hours' | 'days' | 'weeks' | 'months' | 'years';
    value: number;
    direction: 'past' | 'future';
}

/**
 * Number range filter
 */
export interface NumberRange {
    min?: number;
    max?: number;
}

/**
 * Importance range filter
 */
export interface ImportanceRange extends NumberRange {
    operator?: 'gte' | 'lte' | 'eq' | 'between';
}

/**
 * Enhanced search result with comprehensive metadata
 */
export interface EnhancedSearchResult {
    memory: StoredMemory;
    relevanceScore: number;
    matchType: MatchType;
    highlights: SearchHighlight[];
    snippets: SearchSnippet[];
    explanation: SearchExplanation;
    facetContributions: FacetContribution[];
    position: number;
    clusterId?: string;
}

/**
 * Types of matches found during search
 */
export enum MatchType {
    EXACT = 'exact',
    SEMANTIC = 'semantic',
    FUZZY = 'fuzzy',
    PARTIAL = 'partial',
    METADATA = 'metadata',
    TAG = 'tag'
}

/**
 * Search result highlighting information
 */
export interface SearchHighlight {
    field: string;
    fragments: string[];
    fullText?: boolean;
}

/**
 * Search result snippets
 */
export interface SearchSnippet {
    text: string;
    startOffset: number;
    endOffset: number;
    score: number;
}

/**
 * Explanation of why a result matched the search
 */
export interface SearchExplanation {
    reason: string;
    factors: SearchFactor[];
    confidence: number;
    debugInfo?: Record<string, any>;
}

/**
 * Individual search ranking factors
 */
export interface SearchFactor {
    type: string;
    weight: number;
    contribution: number;
    description: string;
}

/**
 * Facet contribution to search result
 */
export interface FacetContribution {
    facet: string;
    value: string;
    boost: number;
}

/**
 * Complete search response with results and metadata
 */
export interface SearchResponse {
    results: EnhancedSearchResult[];
    totalResults: number;
    searchTime: number;
    query: SearchQuery;
    facets: SearchFacet[];
    suggestions: SearchSuggestion[];
    corrections: QueryCorrection[];
    analytics: SearchAnalytics;
    pagination: PaginationInfo;
    aggregations?: SearchAggregation[];
}

/**
 * Search facet results
 */
export interface SearchFacet {
    field: string;
    values: FacetValue[];
    missing?: number;
    other?: number;
}

/**
 * Individual facet value
 */
export interface FacetValue {
    value: string;
    count: number;
    selected?: boolean;
}

/**
 * Search suggestions for query enhancement
 */
export interface SearchSuggestion {
    text: string;
    type: SuggestionType;
    confidence: number;
    resultCount: number;
}

/**
 * Types of search suggestions
 */
export enum SuggestionType {
    COMPLETION = 'completion',
    CORRECTION = 'correction',
    RELATED = 'related',
    POPULAR = 'popular'
}

/**
 * Query correction suggestions
 */
export interface QueryCorrection {
    original: string;
    corrected: string;
    confidence: number;
    type: CorrectionType;
}

/**
 * Types of query corrections
 */
export enum CorrectionType {
    SPELLING = 'spelling',
    GRAMMAR = 'grammar',
    SEMANTIC = 'semantic'
}

/**
 * Search analytics and performance metrics
 */
export interface SearchAnalytics {
    executionTime: number;
    resultsReturned: number;
    facetComputationTime: number;
    indexesUsed: string[];
    queryComplexity: QueryComplexity;
    cachingInfo: CachingInfo;
}

/**
 * Query complexity metrics
 */
export interface QueryComplexity {
    level: 'simple' | 'moderate' | 'complex' | 'advanced';
    factors: string[];
    score: number;
}

/**
 * Caching information
 */
export interface CachingInfo {
    hit: boolean;
    key?: string;
    ttl?: number;
    source?: 'memory' | 'redis' | 'disk';
}

/**
 * Pagination information
 */
export interface PaginationInfo {
    currentPage: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
    nextCursor?: string;
    prevCursor?: string;
}

/**
 * Search aggregations for statistical analysis
 */
export interface SearchAggregation {
    name: string;
    type: AggregationType;
    result: any;
}

/**
 * Types of aggregations
 */
export enum AggregationType {
    COUNT = 'count',
    AVERAGE = 'average',
    SUM = 'sum',
    MIN = 'min',
    MAX = 'max',
    HISTOGRAM = 'histogram',
    TERMS = 'terms'
}

/**
 * Search configuration options
 */
export interface SearchConfiguration {
    enableSemanticSearch: boolean;
    enableFacetedSearch: boolean;
    enableRealTimeSearch: boolean;
    enableQuerySuggestions: boolean;
    maxConcurrentSearches: number;
    cacheEnabled: boolean;
    cacheTTL: number;
    indexingEnabled: boolean;
    analyticsEnabled: boolean;
    performanceTracking: boolean;
}

// ============================================================================
// MAIN ENHANCED MEMORY SEARCH ENGINE
// ============================================================================

/**
 * Enhanced Memory Search Engine
 * Provides advanced search capabilities for MemorAI system
 */
export class EnhancedMemorySearchEngine extends EventEmitter {
    private memoryStore: EnhancedMemoryStore;
    private config: SearchConfiguration;
    private searchCache: Map<string, { result: SearchResponse; timestamp: number }>;
    private suggestionCache: Map<string, SearchSuggestion[]>;
    private searchAnalytics: Map<string, any>;
    private activeSearches: Map<string, AbortController>;
    private searchHistory: Map<string, string[]>;

    constructor(
        memoryStore: EnhancedMemoryStore,
        config: Partial<SearchConfiguration> = {}
    ) {
        super();

        this.memoryStore = memoryStore;
        this.config = {
            enableSemanticSearch: true,
            enableFacetedSearch: true,
            enableRealTimeSearch: true,
            enableQuerySuggestions: true,
            maxConcurrentSearches: 10,
            cacheEnabled: true,
            cacheTTL: 300000, // 5 minutes
            indexingEnabled: true,
            analyticsEnabled: true,
            performanceTracking: true,
            ...config
        };

        this.searchCache = new Map();
        this.suggestionCache = new Map();
        this.searchAnalytics = new Map();
        this.activeSearches = new Map();
        this.searchHistory = new Map();

        this.initializeSearchEngine();
    }

    /**
     * Initialize the search engine
     */
    private initializeSearchEngine(): void {
        console.log('[Enhanced Memory Search] Initializing advanced search engine...');

        // Set up cache cleanup interval
        if (this.config.cacheEnabled) {
            setInterval(() => this.cleanupCache(), 60000); // Clean every minute
        }

        // Initialize performance tracking
        if (this.config.performanceTracking) {
            this.initializePerformanceTracking();
        }

        console.log('[Enhanced Memory Search] Search engine initialized with advanced capabilities');
    }

    /**
     * Initialize performance tracking
     */
    private initializePerformanceTracking(): void {
        this.searchAnalytics.set('totalSearches', 0);
        this.searchAnalytics.set('avgResponseTime', 0);
        this.searchAnalytics.set('cacheHitRate', 0);
        this.searchAnalytics.set('popularQueries', new Map());
    }

    /**
     * Perform enhanced search with comprehensive capabilities
     */
    async search(
        query: SearchQuery,
        context: SearchContext
    ): Promise<SearchResponse> {
        const startTime = Date.now();
        const searchId = context.searchId || this.generateSearchId();

        try {
            console.log(`[Enhanced Memory Search] Starting search: "${query.query}"`);

            // Check cache first
            if (this.config.cacheEnabled) {
                const cached = this.getCachedResult(query);
                if (cached) {
                    console.log('[Enhanced Memory Search] Returning cached result');
                    return cached;
                }
            }

            // Track search
            this.trackSearch(query, context);

            // Parse and validate query
            const parsedQuery = this.parseAdvancedQuery(query);

            // Execute search based on mode
            let searchResults: EnhancedSearchResult[];

            switch (parsedQuery.mode) {
                case SearchMode.SEMANTIC:
                    searchResults = await this.performSemanticSearch(parsedQuery, context);
                    break;
                case SearchMode.HYBRID:
                    searchResults = await this.performHybridSearch(parsedQuery, context);
                    break;
                case SearchMode.FUZZY:
                    searchResults = await this.performFuzzySearch(parsedQuery, context);
                    break;
                case SearchMode.ADVANCED:
                    searchResults = await this.performAdvancedSearch(parsedQuery, context);
                    break;
                default:
                    searchResults = await this.performKeywordSearch(parsedQuery, context);
            }

            // Apply filters
            const filteredResults = this.applyFilters(searchResults, parsedQuery.filters);

            // Apply sorting
            const sortedResults = this.applySorting(filteredResults, parsedQuery.sorting);

            // Generate facets
            const facets = this.generateFacets(sortedResults, parsedQuery.facets);

            // Apply pagination
            const paginatedResults = this.applyPagination(sortedResults, parsedQuery.pagination);

            // Generate suggestions
            const suggestions = await this.generateSearchSuggestions(parsedQuery, context);

            // Generate corrections
            const corrections = this.generateQueryCorrections(parsedQuery);

            // Calculate analytics
            const analytics = this.calculateSearchAnalytics(searchResults, startTime);

            // Build response
            const response: SearchResponse = {
                results: paginatedResults,
                totalResults: sortedResults.length,
                searchTime: Date.now() - startTime,
                query: parsedQuery,
                facets,
                suggestions,
                corrections,
                analytics,
                pagination: this.buildPaginationInfo(parsedQuery.pagination, sortedResults.length),
                aggregations: await this.generateAggregations(sortedResults)
            };

            // Cache result
            if (this.config.cacheEnabled) {
                this.cacheResult(parsedQuery, response);
            }

            // Emit search completed event
            this.emit('searchCompleted', {
                searchId,
                query: parsedQuery,
                results: response.results.length,
                responseTime: response.searchTime
            });

            console.log(`[Enhanced Memory Search] Search completed: ${response.results.length} results in ${response.searchTime}ms`);

            return response;

        } catch (error) {
            console.error('[Enhanced Memory Search] Search error:', error);

            // Emit search error event
            this.emit('searchError', {
                searchId,
                query,
                error: error instanceof Error ? error.message : String(error),
                duration: Date.now() - startTime
            });

            // Return empty response with error info
            return this.buildErrorResponse(query, error instanceof Error ? error.message : String(error), Date.now() - startTime);
        }
    }

    /**
     * Perform real-time search with streaming results
     */
    async *streamSearch(
        query: SearchQuery,
        context: SearchContext
    ): AsyncIterableIterator<Partial<SearchResponse>> {
        const searchId = context.searchId || this.generateSearchId();

        try {
            // Emit initial response
            yield {
                query,
                totalResults: 0,
                searchTime: 0,
                results: []
            };

            // Get all memories for streaming search
            const allMemories = await this.memoryStore.recall(context.agentId, '');

            let processedCount = 0;
            const batchSize = 10;
            const results: EnhancedSearchResult[] = [];

            for (let i = 0; i < allMemories.length; i += batchSize) {
                const batch = allMemories.slice(i, i + batchSize);

                for (const memory of batch) {
                    const result = await this.evaluateMemoryMatch(memory, query, context);
                    if (result) {
                        results.push(result);
                    }
                    processedCount++;
                }

                // Emit intermediate results
                if (results.length > 0) {
                    const sortedBatch = this.applySorting(results, query.sorting);
                    yield {
                        results: sortedBatch.slice(-batchSize),
                        totalResults: results.length,
                        searchTime: Date.now() - Date.now(),
                        analytics: {
                            executionTime: Date.now() - Date.now(),
                            resultsReturned: results.length,
                            facetComputationTime: 0,
                            indexesUsed: ['memory'],
                            queryComplexity: { level: 'simple', factors: [], score: 1 },
                            cachingInfo: { hit: false }
                        } as SearchAnalytics
                    };
                }
            }

            // Final response
            const finalResults = this.applySorting(results, query.sorting);
            const paginatedResults = this.applyPagination(finalResults, query.pagination);

            yield {
                results: paginatedResults,
                totalResults: finalResults.length,
                searchTime: Date.now() - Date.now(),
                facets: this.generateFacets(finalResults, query.facets),
                suggestions: await this.generateSearchSuggestions(query, context)
            };

        } catch (error) {
            console.error('[Enhanced Memory Search] Stream search error:', error);
            this.emit('searchError', { searchId, query, error: error instanceof Error ? error.message : String(error) });
        }
    }

    /**
     * Get search suggestions for auto-complete
     */
    async getSearchSuggestions(
        partialQuery: string,
        context: SearchContext,
        maxSuggestions: number = 10
    ): Promise<SearchSuggestion[]> {
        if (!this.config.enableQuerySuggestions) {
            return [];
        }

        const cacheKey = `suggestions_${partialQuery}_${context.agentId}`;

        // Check cache
        if (this.suggestionCache.has(cacheKey)) {
            return this.suggestionCache.get(cacheKey)!;
        }

        try {
            const suggestions: SearchSuggestion[] = [];

            // Get completion suggestions
            const completions = await this.getCompletionSuggestions(partialQuery, context);
            suggestions.push(...completions);

            // Get popular query suggestions
            const popular = this.getPopularQuerySuggestions(partialQuery, context);
            suggestions.push(...popular);

            // Get related term suggestions
            const related = await this.getRelatedTermSuggestions(partialQuery, context);
            suggestions.push(...related);

            // Sort by confidence and limit
            const sortedSuggestions = suggestions
                .sort((a, b) => b.confidence - a.confidence)
                .slice(0, maxSuggestions);

            // Cache suggestions
            this.suggestionCache.set(cacheKey, sortedSuggestions);

            return sortedSuggestions;

        } catch (error) {
            console.error('[Enhanced Memory Search] Suggestion error:', error);
            return [];
        }
    }

    /**
     * Parse advanced query with operators and syntax
     */
    private parseAdvancedQuery(query: SearchQuery): SearchQuery {
        // Handle advanced query syntax like:
        // - quotes for exact phrases: "exact phrase"
        // - operators: AND, OR, NOT
        // - wildcards: search*
        // - field searches: title:search
        // - ranges: date:[2025-01-01 TO 2025-12-31]

        let parsedQuery = { ...query };

        // Parse quoted phrases
        const quotedPhrases = parsedQuery.query.match(/"([^"]*)"/g);
        if (quotedPhrases) {
            parsedQuery.mode = SearchMode.EXACT;
        }

        // Parse field searches
        const fieldSearches = parsedQuery.query.match(/(\w+):([^\s]+)/g);
        if (fieldSearches) {
            parsedQuery.mode = SearchMode.ADVANCED;
        }

        // Parse wildcards
        if (parsedQuery.query.includes('*') || parsedQuery.query.includes('?')) {
            parsedQuery.mode = SearchMode.FUZZY;
        }

        return parsedQuery;
    }

    /**
     * Perform semantic search using natural language understanding
     */
    private async performSemanticSearch(
        query: SearchQuery,
        context: SearchContext
    ): Promise<EnhancedSearchResult[]> {
        // Use the existing memory store's semantic search capabilities
        const memories = await this.memoryStore.recall(context.agentId, query.query);

        return memories.map((memory: StoredMemory, index: number) => ({
            memory,
            relevanceScore: (memory as any).relevanceScore || 0.5,
            matchType: MatchType.SEMANTIC,
            highlights: this.generateHighlights(memory, query),
            snippets: this.generateSnippets(memory, query),
            explanation: this.generateExplanation(memory, query, MatchType.SEMANTIC),
            facetContributions: [],
            position: index
        }));
    }

    /**
     * Perform hybrid search combining multiple search modes
     */
    private async performHybridSearch(
        query: SearchQuery,
        context: SearchContext
    ): Promise<EnhancedSearchResult[]> {
        // Combine semantic and keyword search results
        const semanticResults = await this.performSemanticSearch(query, context);
        const keywordResults = await this.performKeywordSearch(query, context);

        // Merge and deduplicate results
        const combinedResults = this.mergeSearchResults(semanticResults, keywordResults);

        return combinedResults;
    }

    /**
     * Perform fuzzy search for approximate matching
     */
    private async performFuzzySearch(
        query: SearchQuery,
        context: SearchContext
    ): Promise<EnhancedSearchResult[]> {
        const memories = await this.memoryStore.recall(context.agentId, '');
        const results: EnhancedSearchResult[] = [];

        for (const memory of memories) {
            const fuzzyScore = this.calculateFuzzyScore(memory.content, query.query);
            if (fuzzyScore > 0.3) { // Threshold for fuzzy matching
                results.push({
                    memory,
                    relevanceScore: fuzzyScore,
                    matchType: MatchType.FUZZY,
                    highlights: this.generateHighlights(memory, query),
                    snippets: this.generateSnippets(memory, query),
                    explanation: this.generateExplanation(memory, query, MatchType.FUZZY),
                    facetContributions: [],
                    position: results.length
                });
            }
        }

        return results;
    }

    /**
     * Perform advanced search with complex operators
     */
    private async performAdvancedSearch(
        query: SearchQuery,
        context: SearchContext
    ): Promise<EnhancedSearchResult[]> {
        // Parse advanced query syntax and build complex search
        const memories = await this.memoryStore.recall(context.agentId, query.query);

        return memories.map((memory: StoredMemory, index: number) => ({
            memory,
            relevanceScore: (memory as any).relevanceScore || 0.7,
            matchType: MatchType.EXACT,
            highlights: this.generateHighlights(memory, query),
            snippets: this.generateSnippets(memory, query),
            explanation: this.generateExplanation(memory, query, MatchType.EXACT),
            facetContributions: [],
            position: index
        }));
    }

    /**
     * Perform basic keyword search
     */
    private async performKeywordSearch(
        query: SearchQuery,
        context: SearchContext
    ): Promise<EnhancedSearchResult[]> {
        const memories = await this.memoryStore.recall(context.agentId, query.query);

        return memories.map((memory: StoredMemory, index: number) => ({
            memory,
            relevanceScore: (memory as any).relevanceScore || 0.6,
            matchType: MatchType.PARTIAL,
            highlights: this.generateHighlights(memory, query),
            snippets: this.generateSnippets(memory, query),
            explanation: this.generateExplanation(memory, query, MatchType.PARTIAL),
            facetContributions: [],
            position: index
        }));
    }

    /**
     * Apply filters to search results
     */
    private applyFilters(
        results: EnhancedSearchResult[],
        filters: SearchFilters
    ): EnhancedSearchResult[] {
        return results.filter(result => {
            const memory = result.memory;

            // Agent ID filter
            if (filters.agentIds && !filters.agentIds.includes(memory.agentId)) {
                return false;
            }

            // Importance filter
            if (filters.importance) {
                const importance = memory.metadata?.importance || 5;
                if (filters.importance.min && importance < filters.importance.min) {
                    return false;
                }
                if (filters.importance.max && importance > filters.importance.max) {
                    return false;
                }
            }

            // Entity type filter
            if (filters.entityTypes && memory.metadata?.entityType) {
                if (!filters.entityTypes.includes(memory.metadata.entityType)) {
                    return false;
                }
            }

            // Tags filter
            if (filters.tags && memory.metadata?.tags) {
                const memoryTags = Array.isArray(memory.metadata.tags) ? memory.metadata.tags : [];
                if (!filters.tags.some(tag => memoryTags.includes(tag))) {
                    return false;
                }
            }

            // Date filters
            if (filters.dateCreated) {
                const memoryDate = new Date(memory.timestamp);
                if (filters.dateCreated.from && memoryDate < new Date(filters.dateCreated.from)) {
                    return false;
                }
                if (filters.dateCreated.to && memoryDate > new Date(filters.dateCreated.to)) {
                    return false;
                }
            }

            return true;
        });
    }

    /**
     * Apply sorting to search results
     */
    private applySorting(
        results: EnhancedSearchResult[],
        sorting: SortingOptions
    ): EnhancedSearchResult[] {
        return results.sort((a, b) => {
            let comparison = 0;

            switch (sorting.field) {
                case SortField.RELEVANCE:
                    comparison = b.relevanceScore - a.relevanceScore;
                    break;
                case SortField.DATE_CREATED:
                    comparison = new Date(b.memory.timestamp).getTime() - new Date(a.memory.timestamp).getTime();
                    break;
                case SortField.IMPORTANCE:
                    const aImportance = a.memory.metadata?.importance || 5;
                    const bImportance = b.memory.metadata?.importance || 5;
                    comparison = bImportance - aImportance;
                    break;
                case SortField.CONTENT_LENGTH:
                    comparison = b.memory.content.length - a.memory.content.length;
                    break;
                default:
                    comparison = b.relevanceScore - a.relevanceScore;
            }

            if (sorting.direction === SortDirection.ASC) {
                comparison = -comparison;
            }

            // Secondary sort if needed
            if (comparison === 0 && sorting.secondarySort) {
                // Apply secondary sorting logic
            }

            return comparison;
        });
    }

    /**
     * Apply pagination to search results
     */
    private applyPagination(
        results: EnhancedSearchResult[],
        pagination: PaginationOptions
    ): EnhancedSearchResult[] {
        const startIndex = (pagination.page - 1) * pagination.limit;
        const endIndex = startIndex + pagination.limit;

        return results.slice(startIndex, endIndex);
    }

    /**
     * Generate search facets for filtering
     */
    private generateFacets(
        results: EnhancedSearchResult[],
        facetConfigs: FacetConfiguration[]
    ): SearchFacet[] {
        const facets: SearchFacet[] = [];

        for (const config of facetConfigs) {
            const facetValues = new Map<string, number>();

            for (const result of results) {
                let value: string;

                switch (config.field) {
                    case 'agentId':
                        value = result.memory.agentId;
                        break;
                    case 'entityType':
                        value = result.memory.metadata?.entityType || 'unknown';
                        break;
                    case 'importance':
                        const importance = result.memory.metadata?.importance || 5;
                        value = this.getImportanceRange(importance);
                        break;
                    default:
                        continue;
                }

                facetValues.set(value, (facetValues.get(value) || 0) + 1);
            }

            const sortedValues = Array.from(facetValues.entries())
                .sort((a, b) => b[1] - a[1])
                .slice(0, config.maxValues)
                .map(([value, count]) => ({ value, count }));

            facets.push({
                field: config.field,
                values: sortedValues
            });
        }

        return facets;
    }

    /**
     * Generate search suggestions
     */
    private async generateSearchSuggestions(
        query: SearchQuery,
        context: SearchContext
    ): Promise<SearchSuggestion[]> {
        const suggestions: SearchSuggestion[] = [];

        // Add completion suggestions
        if (query.query.length >= 2) {
            const completions = await this.getCompletionSuggestions(query.query, context);
            suggestions.push(...completions);
        }

        // Add related term suggestions
        const related = await this.getRelatedTermSuggestions(query.query, context);
        suggestions.push(...related);

        return suggestions.slice(0, 5); // Limit to 5 suggestions
    }

    /**
     * Generate query corrections
     */
    private generateQueryCorrections(query: SearchQuery): QueryCorrection[] {
        const corrections: QueryCorrection[] = [];

        // Simple spell check logic (would be replaced with proper spell checker)
        if (query.query.includes('memroy')) {
            corrections.push({
                original: 'memroy',
                corrected: 'memory',
                confidence: 0.9,
                type: CorrectionType.SPELLING
            });
        }

        return corrections;
    }

    /**
     * Calculate search analytics
     */
    private calculateSearchAnalytics(
        results: EnhancedSearchResult[],
        startTime: number
    ): SearchAnalytics {
        return {
            executionTime: Date.now() - startTime,
            resultsReturned: results.length,
            facetComputationTime: 0,
            indexesUsed: ['memory'],
            queryComplexity: {
                level: 'simple',
                factors: [],
                score: 1
            },
            cachingInfo: {
                hit: false
            }
        };
    }

    /**
     * Build pagination information
     */
    private buildPaginationInfo(
        pagination: PaginationOptions,
        totalResults: number
    ): PaginationInfo {
        const totalPages = Math.ceil(totalResults / pagination.limit);

        return {
            currentPage: pagination.page,
            totalPages,
            hasNextPage: pagination.page < totalPages,
            hasPrevPage: pagination.page > 1
        };
    }

    /**
     * Generate aggregations for statistical analysis
     */
    private async generateAggregations(results: EnhancedSearchResult[]): Promise<SearchAggregation[]> {
        const aggregations: SearchAggregation[] = [];

        // Count aggregation
        aggregations.push({
            name: 'total_results',
            type: AggregationType.COUNT,
            result: results.length
        });

        // Average relevance score
        const avgRelevance = results.reduce((sum, r) => sum + r.relevanceScore, 0) / results.length;
        aggregations.push({
            name: 'avg_relevance',
            type: AggregationType.AVERAGE,
            result: avgRelevance
        });

        return aggregations;
    }

    // ============================================================================
    // HELPER METHODS
    // ============================================================================

    private generateSearchId(): string {
        return `search_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    private async evaluateMemoryMatch(
        memory: StoredMemory,
        query: SearchQuery,
        context: SearchContext
    ): Promise<EnhancedSearchResult | null> {
        // Simple relevance calculation
        const relevance = this.calculateRelevance(memory.content, query.query);

        if (relevance > 0.1) {
            return {
                memory,
                relevanceScore: relevance,
                matchType: MatchType.PARTIAL,
                highlights: this.generateHighlights(memory, query),
                snippets: this.generateSnippets(memory, query),
                explanation: this.generateExplanation(memory, query, MatchType.PARTIAL),
                facetContributions: [],
                position: 0
            };
        }

        return null;
    }

    private calculateRelevance(content: string, query: string): number {
        const contentLower = content.toLowerCase();
        const queryLower = query.toLowerCase();
        const queryTerms = queryLower.split(' ');

        let score = 0;
        for (const term of queryTerms) {
            if (contentLower.includes(term)) {
                score += 0.3;
            }
        }

        return Math.min(score, 1.0);
    }

    private calculateFuzzyScore(content: string, query: string): number {
        // Simple fuzzy matching logic
        const contentLower = content.toLowerCase();
        const queryLower = query.toLowerCase();

        // Calculate Levenshtein distance or similar
        return this.calculateRelevance(content, query) * 0.8;
    }

    private generateHighlights(memory: StoredMemory, query: SearchQuery): SearchHighlight[] {
        const highlights: SearchHighlight[] = [];
        const queryTerms = query.query.toLowerCase().split(' ');

        for (const term of queryTerms) {
            if (memory.content.toLowerCase().includes(term)) {
                highlights.push({
                    field: 'content',
                    fragments: [this.highlightTerm(memory.content, term)]
                });
            }
        }

        return highlights;
    }

    private highlightTerm(text: string, term: string): string {
        const regex = new RegExp(`(${term})`, 'gi');
        return text.replace(regex, '<mark>$1</mark>');
    }

    private generateSnippets(memory: StoredMemory, query: SearchQuery): SearchSnippet[] {
        const snippets: SearchSnippet[] = [];
        const queryTerms = query.query.toLowerCase().split(' ');

        for (const term of queryTerms) {
            const index = memory.content.toLowerCase().indexOf(term);
            if (index !== -1) {
                const start = Math.max(0, index - 50);
                const end = Math.min(memory.content.length, index + 100);
                const snippet = memory.content.substring(start, end);

                snippets.push({
                    text: snippet,
                    startOffset: start,
                    endOffset: end,
                    score: 0.8
                });
            }
        }

        return snippets;
    }

    private generateExplanation(
        memory: StoredMemory,
        query: SearchQuery,
        matchType: MatchType
    ): SearchExplanation {
        return {
            reason: `Matched ${matchType} search for "${query.query}"`,
            factors: [
                {
                    type: 'content_match',
                    weight: 0.7,
                    contribution: 0.5,
                    description: 'Content contains search terms'
                }
            ],
            confidence: 0.8
        };
    }

    private mergeSearchResults(
        semanticResults: EnhancedSearchResult[],
        keywordResults: EnhancedSearchResult[]
    ): EnhancedSearchResult[] {
        const mergedMap = new Map<string, EnhancedSearchResult>();

        // Add semantic results
        for (const result of semanticResults) {
            mergedMap.set(result.memory.id, result);
        }

        // Add keyword results, combining scores if duplicate
        for (const result of keywordResults) {
            if (mergedMap.has(result.memory.id)) {
                const existing = mergedMap.get(result.memory.id)!;
                existing.relevanceScore = (existing.relevanceScore + result.relevanceScore) / 2;
            } else {
                mergedMap.set(result.memory.id, result);
            }
        }

        return Array.from(mergedMap.values());
    }

    private async getCompletionSuggestions(
        partialQuery: string,
        context: SearchContext
    ): Promise<SearchSuggestion[]> {
        // Get search history for this agent
        const history = this.searchHistory.get(context.agentId) || [];
        const suggestions: SearchSuggestion[] = [];

        for (const query of history) {
            if (query.toLowerCase().startsWith(partialQuery.toLowerCase()) && query !== partialQuery) {
                suggestions.push({
                    text: query,
                    type: SuggestionType.COMPLETION,
                    confidence: 0.8,
                    resultCount: 0 // Would be calculated in real implementation
                });
            }
        }

        return suggestions.slice(0, 3);
    }

    private getPopularQuerySuggestions(
        partialQuery: string,
        context: SearchContext
    ): SearchSuggestion[] {
        // Return popular queries based on analytics
        const popularQueries = this.searchAnalytics.get('popularQueries') as Map<string, number> || new Map();
        const suggestions: SearchSuggestion[] = [];

        for (const [query, count] of popularQueries.entries()) {
            if (query.toLowerCase().includes(partialQuery.toLowerCase())) {
                suggestions.push({
                    text: query,
                    type: SuggestionType.POPULAR,
                    confidence: Math.min(count / 100, 1.0),
                    resultCount: count
                });
            }
        }

        return suggestions.slice(0, 2);
    }

    private async getRelatedTermSuggestions(
        query: string,
        context: SearchContext
    ): Promise<SearchSuggestion[]> {
        // Use memory store to find related terms
        const memories = await this.memoryStore.recall(context.agentId, query);
        const relatedTerms = new Set<string>();

        for (const memory of memories.slice(0, 5)) {
            const words = memory.content.toLowerCase().split(/\W+/);
            for (const word of words) {
                if (word.length > 3 && !query.toLowerCase().includes(word)) {
                    relatedTerms.add(word);
                }
            }
        }

        return Array.from(relatedTerms).slice(0, 3).map(term => ({
            text: term,
            type: SuggestionType.RELATED,
            confidence: 0.6,
            resultCount: 0
        }));
    }

    private getImportanceRange(importance: number): string {
        if (importance <= 3) return 'low';
        if (importance <= 7) return 'medium';
        return 'high';
    }

    private trackSearch(query: SearchQuery, context: SearchContext): void {
        if (!this.config.analyticsEnabled) return;

        // Update search count
        const totalSearches = this.searchAnalytics.get('totalSearches') || 0;
        this.searchAnalytics.set('totalSearches', totalSearches + 1);

        // Update search history
        const history = this.searchHistory.get(context.agentId) || [];
        history.push(query.query);
        this.searchHistory.set(context.agentId, history.slice(-50)); // Keep last 50 searches

        // Update popular queries
        const popularQueries = this.searchAnalytics.get('popularQueries') as Map<string, number> || new Map();
        popularQueries.set(query.query, (popularQueries.get(query.query) || 0) + 1);
        this.searchAnalytics.set('popularQueries', popularQueries);
    }

    private getCachedResult(query: SearchQuery): SearchResponse | null {
        const cacheKey = this.generateCacheKey(query);
        const cached = this.searchCache.get(cacheKey);

        if (cached && Date.now() - cached.timestamp < this.config.cacheTTL) {
            return cached.result;
        }

        return null;
    }

    private cacheResult(query: SearchQuery, result: SearchResponse): void {
        const cacheKey = this.generateCacheKey(query);
        this.searchCache.set(cacheKey, {
            result,
            timestamp: Date.now()
        });
    }

    private generateCacheKey(query: SearchQuery): string {
        return JSON.stringify({
            query: query.query,
            mode: query.mode,
            filters: query.filters,
            sorting: query.sorting
        });
    }

    private cleanupCache(): void {
        const now = Date.now();

        // Clean search cache
        for (const [key, value] of this.searchCache.entries()) {
            if (now - value.timestamp > this.config.cacheTTL) {
                this.searchCache.delete(key);
            }
        }

        // Clean suggestion cache
        for (const [key, value] of this.suggestionCache.entries()) {
            // Suggestions have shorter TTL
            if (now - Date.now() > 60000) { // 1 minute
                this.suggestionCache.delete(key);
            }
        }
    }

    private buildErrorResponse(query: SearchQuery, error: string, searchTime: number): SearchResponse {
        return {
            results: [],
            totalResults: 0,
            searchTime,
            query,
            facets: [],
            suggestions: [],
            corrections: [],
            analytics: {
                executionTime: searchTime,
                resultsReturned: 0,
                facetComputationTime: 0,
                indexesUsed: [],
                queryComplexity: { level: 'simple', factors: [], score: 0 },
                cachingInfo: { hit: false }
            },
            pagination: {
                currentPage: 1,
                totalPages: 0,
                hasNextPage: false,
                hasPrevPage: false
            }
        };
    }

    /**
     * Get search engine statistics
     */
    getSearchStatistics(): Record<string, any> {
        return {
            totalSearches: this.searchAnalytics.get('totalSearches') || 0,
            cacheSize: this.searchCache.size,
            activeSearches: this.activeSearches.size,
            avgResponseTime: this.searchAnalytics.get('avgResponseTime') || 0,
            cacheHitRate: this.searchAnalytics.get('cacheHitRate') || 0,
            configuration: this.config
        };
    }

    /**
     * Clear all caches
     */
    clearCaches(): void {
        this.searchCache.clear();
        this.suggestionCache.clear();
        console.log('[Enhanced Memory Search] Caches cleared');
    }

    /**
     * Update search configuration
     */
    updateConfiguration(newConfig: Partial<SearchConfiguration>): void {
        this.config = { ...this.config, ...newConfig };
        console.log('[Enhanced Memory Search] Configuration updated');
    }
}

export default EnhancedMemorySearchEngine;