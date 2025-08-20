/**
 * Hybrid Search Engine
 * Combines TF-IDF, vector embeddings, and fuzzy matching for optimal results
 * Date: August 6, 2025
 */

import { Memory, SearchResult, SearchRequest } from '../../core/types.js';
import { Logger } from '../../utils/logger.js';
import { SemanticSearchEngine } from './semantic-search.js';
import { FuzzyMatcher, FuzzyMatchOptions } from './fuzzy-matcher.js';
import { database } from '../../core/database-manager.js';

export interface HybridSearchOptions {
    tfIdfWeight: number;      // Weight for TF-IDF results (0-1)
    vectorWeight: number;     // Weight for vector similarity (0-1)  
    fuzzyWeight: number;      // Weight for fuzzy matching (0-1)
    enableFuzzySearch: boolean;
    fuzzyOptions: Partial<FuzzyMatchOptions>;
    diversityFactor: number;  // Factor for result diversification (0-1)
    maxResults: number;       // Maximum results to return
}

export interface SearchMetrics {
    totalSearchTime: number;
    tfIdfTime: number;
    vectorTime: number;
    fuzzyTime: number;
    combinationTime: number;
    resultsCount: number;
    cacheHit: boolean;
}

export class HybridSearchEngine {
    private logger: Logger;
    private semanticSearch: SemanticSearchEngine;
    private fuzzyMatcher: FuzzyMatcher;
    private defaultOptions: HybridSearchOptions;
    private searchCache: Map<string, { results: SearchResult[]; timestamp: number }>;
    private cacheTimeout: number = 300000; // 5 minutes

    constructor() {
        this.logger = new Logger('HybridSearch');
        this.semanticSearch = new SemanticSearchEngine();
        this.fuzzyMatcher = new FuzzyMatcher();
        this.searchCache = new Map();

        this.defaultOptions = {
            tfIdfWeight: 0.4,
            vectorWeight: 0.4,
            fuzzyWeight: 0.2,
            enableFuzzySearch: true,
            fuzzyOptions: {
                threshold: 0.6,
                caseSensitive: false,
                maxDistance: 5,
                partial: true
            },
            diversityFactor: 0.3,
            maxResults: 20
        };
    }

    /**
     * Initialize the hybrid search engine
     */
    public async initialize(memories: Memory[]): Promise<void> {
        this.logger.info('Initializing hybrid search engine');

        // Initialize semantic search engine
        await this.semanticSearch.initialize(memories);

        this.logger.info('Hybrid search engine initialized successfully');
    }

    /**
     * Perform comprehensive hybrid search
     */
    public async search(
        request: SearchRequest,
        options?: Partial<HybridSearchOptions>
    ): Promise<{ results: SearchResult[]; metrics: SearchMetrics }> {
        const startTime = Date.now();
        const opts = { ...this.defaultOptions, ...options };

        // Check cache first
        const cacheKey = this.getCacheKey(request, opts);
        const cached = this.getFromCache(cacheKey);
        if (cached) {
            this.logger.debug('Returning cached search results');
            return {
                results: cached.results,
                metrics: {
                    totalSearchTime: Date.now() - startTime,
                    tfIdfTime: 0,
                    vectorTime: 0,
                    fuzzyTime: 0,
                    combinationTime: 0,
                    resultsCount: cached.results.length,
                    cacheHit: true
                }
            };
        }

        let tfIdfTime = 0;
        let vectorTime = 0;
        let fuzzyTime = 0;

        // Step 1: Semantic search (TF-IDF + Vector)
        const semanticStartTime = Date.now();
        const semanticResults = await this.semanticSearch.search(request);
        const semanticEndTime = Date.now();
        tfIdfTime = semanticEndTime - semanticStartTime;
        vectorTime = tfIdfTime; // Combined in semantic search

        // Step 2: Fuzzy search (if enabled)
        let fuzzyResults: SearchResult[] = [];
        if (opts.enableFuzzySearch) {
            const fuzzyStartTime = Date.now();
            fuzzyResults = await this.performFuzzySearch(request, opts);
            fuzzyTime = Date.now() - fuzzyStartTime;
        }

        // Step 3: Combine and rank results
        const combinationStartTime = Date.now();
        const combinedResults = await this.combineResults(
            semanticResults,
            fuzzyResults,
            opts
        );
        const combinationTime = Date.now() - combinationStartTime;

        // Step 4: Apply diversity and final ranking
        const finalResults = this.diversifyResults(combinedResults, opts);

        // Cache results
        this.cacheResults(cacheKey, finalResults);

        const totalTime = Date.now() - startTime;
        const metrics: SearchMetrics = {
            totalSearchTime: totalTime,
            tfIdfTime,
            vectorTime,
            fuzzyTime,
            combinationTime,
            resultsCount: finalResults.length,
            cacheHit: false
        };

        this.logger.info(`Hybrid search completed in ${totalTime}ms`, {
            query: request.query,
            resultsCount: finalResults.length,
            metrics
        });

        return { results: finalResults, metrics };
    }

    /**
     * Perform fuzzy search across memory contents
     */
    private async performFuzzySearch(
        request: SearchRequest,
        options: HybridSearchOptions
    ): Promise<SearchResult[]> {
        // Get all memories for the agent from database
        const dbResponse = await database.searchMemories('*', request.agentId, 1000);

        if (!dbResponse.success || !dbResponse.data) {
            this.logger.warn('Failed to get memories for fuzzy search');
            return [];
        }

        const memories = dbResponse.data;
        const fuzzyResults: SearchResult[] = [];

        // Perform fuzzy matching on memory contents
        const contents = memories.map(m => m.content);
        const matches = this.fuzzyMatcher.findMatches(
            request.query,
            contents,
            options.fuzzyOptions
        );

        // Convert fuzzy matches to search results
        for (const match of matches) {
            const memory = memories.find(m => m.content === match.text);
            if (memory && this.matchesFilters(memory, request)) {
                fuzzyResults.push({
                    memory,
                    relevanceScore: match.similarity,
                    matchType: 'fuzzy',
                    highlights: [request.query]
                });
            }
        }

        return fuzzyResults;
    }

    /**
     * Combine results from different search methods
     */
    private async combineResults(
        semanticResults: SearchResult[],
        fuzzyResults: SearchResult[],
        options: HybridSearchOptions
    ): Promise<SearchResult[]> {
        const combinedMap = new Map<string, SearchResult>();

        // Process semantic results
        for (const result of semanticResults) {
            const weighted = {
                ...result,
                relevanceScore: result.relevanceScore * (options.tfIdfWeight + options.vectorWeight)
            };
            combinedMap.set(result.memory.id, weighted);
        }

        // Process fuzzy results
        for (const result of fuzzyResults) {
            const memoryId = result.memory.id;
            const weightedScore = result.relevanceScore * options.fuzzyWeight;

            if (combinedMap.has(memoryId)) {
                // Combine with existing result
                const existing = combinedMap.get(memoryId)!;
                existing.relevanceScore += weightedScore;
                existing.matchType = 'hybrid';
                existing.highlights = [...(existing.highlights || []), ...(result.highlights || [])];
            } else {
                // Add as new result
                combinedMap.set(memoryId, {
                    ...result,
                    relevanceScore: weightedScore
                });
            }
        }

        // Convert to array and sort by relevance
        return Array.from(combinedMap.values())
            .sort((a, b) => b.relevanceScore - a.relevanceScore)
            .slice(0, options.maxResults);
    }

    /**
     * Apply diversity to prevent too many similar results
     */
    private diversifyResults(
        results: SearchResult[],
        options: HybridSearchOptions
    ): SearchResult[] {
        if (options.diversityFactor === 0 || results.length <= 1) {
            return results;
        }

        const diversified: SearchResult[] = [];
        const usedEntityTypes = new Set<string>();
        const usedProjects = new Set<string>();

        // First pass: Add highest scoring results with diversity
        for (const result of results) {
            if (diversified.length >= options.maxResults) break;

            const entityType = result.memory.metadata.entityType;
            const project = result.memory.metadata.project || 'default';

            // Apply diversity penalty
            let diversityPenalty = 0;
            if (usedEntityTypes.has(entityType)) {
                diversityPenalty += options.diversityFactor * 0.3;
            }
            if (usedProjects.has(project)) {
                diversityPenalty += options.diversityFactor * 0.2;
            }

            // Adjust relevance score
            const adjustedScore = result.relevanceScore - diversityPenalty;

            if (adjustedScore > 0.1) { // Minimum threshold
                diversified.push({
                    ...result,
                    relevanceScore: adjustedScore
                });

                usedEntityTypes.add(entityType);
                usedProjects.add(project);
            }
        }

        // Second pass: Fill remaining slots with best remaining results
        const remaining = results.filter(r =>
            !diversified.some(d => d.memory.id === r.memory.id)
        );

        for (const result of remaining) {
            if (diversified.length >= options.maxResults) break;
            diversified.push(result);
        }

        return diversified.sort((a, b) => b.relevanceScore - a.relevanceScore);
    }

    /**
     * Check if memory matches search filters
     */
    private matchesFilters(memory: Memory, request: SearchRequest): boolean {
        if (request.minImportance && memory.metadata.importance < request.minImportance) {
            return false;
        }

        if (request.project && memory.metadata.project !== request.project) {
            return false;
        }

        if (request.session && memory.metadata.session !== request.session) {
            return false;
        }

        if (request.entityType && memory.metadata.entityType !== request.entityType) {
            return false;
        }

        return true;
    }

    /**
     * Generate cache key for search request
     */
    private getCacheKey(request: SearchRequest, options: HybridSearchOptions): string {
        return `${request.agentId}:${request.query}:${JSON.stringify({
            limit: request.limit,
            minImportance: request.minImportance,
            project: request.project,
            session: request.session,
            entityType: request.entityType,
            options
        })}`;
    }

    /**
     * Get results from cache
     */
    private getFromCache(key: string): { results: SearchResult[] } | null {
        const cached = this.searchCache.get(key);
        if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
            return { results: [...cached.results] };
        }

        if (cached) {
            this.searchCache.delete(key); // Remove expired entry
        }

        return null;
    }

    /**
     * Cache search results
     */
    private cacheResults(key: string, results: SearchResult[]): void {
        this.searchCache.set(key, {
            results: [...results],
            timestamp: Date.now()
        });

        // Clean up old cache entries
        this.cleanupCache();
    }

    /**
     * Clean up expired cache entries
     */
    private cleanupCache(): void {
        const now = Date.now();
        for (const [key, cached] of this.searchCache.entries()) {
            if (now - cached.timestamp > this.cacheTimeout) {
                this.searchCache.delete(key);
            }
        }
    }

    /**
     * Add memory to search index
     */
    public async addMemory(memory: Memory): Promise<void> {
        await this.semanticSearch.addToIndex(memory);
        this.clearCache(); // Clear cache when index changes
    }

    /**
     * Remove memory from search index
     */
    public removeMemory(memoryId: string): void {
        this.semanticSearch.removeFromIndex(memoryId);
        this.clearCache();
    }

    /**
     * Clear search cache
     */
    public clearCache(): void {
        this.searchCache.clear();
        this.logger.debug('Search cache cleared');
    }

    /**
     * Get search engine statistics
     */
    public getStats() {
        const semanticStats = this.semanticSearch.getStats();
        const fuzzyStats = this.fuzzyMatcher.getStats();

        return {
            semantic: semanticStats,
            fuzzy: fuzzyStats,
            cache: {
                size: this.searchCache.size,
                timeout: this.cacheTimeout
            },
            options: this.defaultOptions
        };
    }

    /**
     * Update search options
     */
    public updateOptions(options: Partial<HybridSearchOptions>): void {
        this.defaultOptions = { ...this.defaultOptions, ...options };
        this.logger.info('Hybrid search options updated', this.defaultOptions);
    }
}
