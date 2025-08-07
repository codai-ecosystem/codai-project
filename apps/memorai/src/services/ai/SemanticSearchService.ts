/**
 * SemanticSearchService - Advanced AI-powered memory search with vector embeddings
 * Provides intelligent search beyond simple keyword matching
 */

import { embeddingGenerator, SimilarityResult } from '../../utils/embeddings/EmbeddingGenerator';
import { memoraiMCPClient } from '../../utils/memorai-mcp-client';

export interface SemanticSearchOptions {
    query: string;
    agentId?: string;
    limit?: number;
    threshold?: number;
    includeKeywordSearch?: boolean;
    boost?: {
        recent?: number;
        importance?: number;
        project?: string;
        tags?: string[];
    };
    filters?: {
        project?: string;
        tags?: string[];
        importanceMin?: number;
        importanceMax?: number;
        dateFrom?: string;
        dateTo?: string;
    };
}

export interface SemanticSearchResult {
    memory: any;
    semanticScore: number;
    keywordScore?: number;
    combinedScore: number;
    explanation: string;
    highlights: string[];
    relevanceFactors: string[];
}

export interface SearchInsights {
    totalResults: number;
    semanticResults: number;
    keywordResults: number;
    averageScore: number;
    searchTime: number;
    queryAnalysis: {
        complexity: 'simple' | 'medium' | 'complex';
        intent: string;
        extractedTerms: string[];
        suggestedExpansions: string[];
    };
    recommendations: string[];
}

export class SemanticSearchService {
    private searchHistory: Array<{ query: string; results: number; timestamp: Date }> = [];
    private queryCache: Map<string, { results: SemanticSearchResult[]; timestamp: Date }> = new Map();
    private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

    /**
     * Perform semantic search with AI-powered relevance scoring
     */
    async search(options: SemanticSearchOptions): Promise<{
        results: SemanticSearchResult[];
        insights: SearchInsights;
    }> {
        const startTime = Date.now();

        try {
            // Validate options
            this.validateSearchOptions(options);

            // Check cache first
            const cacheKey = this.createCacheKey(options);
            const cached = this.getCachedResults(cacheKey);
            if (cached) {
                return {
                    results: cached,
                    insights: this.generateSearchInsights(cached, options, Date.now() - startTime, true)
                };
            }

            // Get all available memories
            const allMemories = await memoraiMCPClient.getAllMemories(options.agentId || 'github-copilot');

            // Apply pre-filters
            const filteredMemories = this.applyFilters(allMemories, options.filters);

            // Perform semantic search
            const semanticResults = await this.performSemanticSearch(options.query, filteredMemories, options);

            // Perform keyword search if enabled
            let keywordResults: any[] = [];
            if (options.includeKeywordSearch !== false) {
                keywordResults = this.performKeywordSearch(options.query, filteredMemories);
            }

            // Combine and rank results
            const combinedResults = this.combineAndRankResults(
                semanticResults,
                keywordResults,
                options
            );

            // Limit results
            const finalResults = combinedResults.slice(0, options.limit || 10);

            // Cache results
            this.cacheResults(cacheKey, finalResults);

            // Update search history
            this.updateSearchHistory(options.query, finalResults.length);

            // Generate insights
            const insights = this.generateSearchInsights(finalResults, options, Date.now() - startTime);

            return {
                results: finalResults,
                insights
            };

        } catch (error) {
            console.error('Semantic search failed:', error);
            throw new Error(`Semantic search failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Perform semantic search using vector embeddings
     */
    private async performSemanticSearch(
        query: string,
        memories: any[],
        options: SemanticSearchOptions
    ): Promise<SimilarityResult[]> {
        if (memories.length === 0) {
            return [];
        }

        try {
            const threshold = options.threshold || 0.3;
            const limit = (options.limit || 10) * 2; // Get more results for better ranking

            return await embeddingGenerator.findSimilarMemories(
                query,
                memories,
                threshold,
                limit
            );
        } catch (error) {
            console.error('Semantic search processing failed:', error);
            return [];
        }
    }

    /**
     * Perform traditional keyword search
     */
    private performKeywordSearch(query: string, memories: any[]): any[] {
        const queryTerms = query.toLowerCase().split(/\s+/).filter(term => term.length > 2);
        if (queryTerms.length === 0) {
            return [];
        }

        const results = memories.map(memory => {
            const content = memory.content.toLowerCase();
            const tags = (memory.tags || []).join(' ').toLowerCase();
            const project = (memory.project || '').toLowerCase();

            let score = 0;
            let matches = 0;
            const highlights: string[] = [];

            queryTerms.forEach(term => {
                // Content matches (highest weight)
                const contentMatches = (content.match(new RegExp(term, 'g')) || []).length;
                if (contentMatches > 0) {
                    score += contentMatches * 3;
                    matches++;
                    highlights.push(`Content contains "${term}" (${contentMatches} times)`);
                }

                // Tag matches (medium weight)
                const tagMatches = (tags.match(new RegExp(term, 'g')) || []).length;
                if (tagMatches > 0) {
                    score += tagMatches * 2;
                    matches++;
                    highlights.push(`Tags match "${term}"`);
                }

                // Project matches (medium weight)
                if (project.includes(term)) {
                    score += 2;
                    matches++;
                    highlights.push(`Project contains "${term}"`);
                }
            });

            // Bonus for exact phrase match
            if (content.includes(query.toLowerCase())) {
                score += 5;
                highlights.push(`Exact phrase match: "${query}"`);
            }

            // Normalize score by query terms
            const normalizedScore = queryTerms.length > 0 ? matches / queryTerms.length : 0;

            return {
                memory,
                score: normalizedScore,
                rawScore: score,
                highlights,
                matches
            };
        }).filter(result => result.score > 0);

        return results.sort((a, b) => b.score - a.score);
    }

    /**
     * Combine semantic and keyword results with intelligent ranking
     */
    private combineAndRankResults(
        semanticResults: SimilarityResult[],
        keywordResults: any[],
        options: SemanticSearchOptions
    ): SemanticSearchResult[] {
        const memoryMap = new Map<string, SemanticSearchResult>();

        // Process semantic results
        semanticResults.forEach(result => {
            const key = result.memory.structuredKey;
            memoryMap.set(key, {
                memory: result.memory,
                semanticScore: result.score,
                combinedScore: result.score,
                explanation: result.explanation || 'Semantic similarity match',
                highlights: [`Semantic similarity: ${Math.round(result.score * 100)}%`],
                relevanceFactors: ['semantic_similarity']
            });
        });

        // Process keyword results and merge
        keywordResults.forEach(result => {
            const key = result.memory.structuredKey;
            const existing = memoryMap.get(key);

            if (existing) {
                // Combine scores
                existing.keywordScore = result.score;
                existing.combinedScore = this.calculateCombinedScore(
                    existing.semanticScore,
                    result.score,
                    options
                );
                existing.highlights.push(...result.highlights);
                existing.relevanceFactors.push('keyword_match');
                existing.explanation = `Combined semantic (${Math.round(existing.semanticScore * 100)}%) and keyword (${Math.round(result.score * 100)}%) match`;
            } else {
                // Add as keyword-only result
                memoryMap.set(key, {
                    memory: result.memory,
                    semanticScore: 0,
                    keywordScore: result.score,
                    combinedScore: result.score * 0.7, // Lower weight for keyword-only
                    explanation: `Keyword match (${Math.round(result.score * 100)}%)`,
                    highlights: result.highlights,
                    relevanceFactors: ['keyword_match']
                });
            }
        });

        // Apply boosting factors
        const boostedResults = Array.from(memoryMap.values()).map(result => {
            return this.applyBoostFactors(result, options.boost);
        });

        // Sort by combined score
        return boostedResults.sort((a, b) => b.combinedScore - a.combinedScore);
    }

    /**
     * Calculate combined score from semantic and keyword scores
     */
    private calculateCombinedScore(semanticScore: number, keywordScore: number, options: SemanticSearchOptions): number {
        // Weights can be adjusted based on search intent
        const semanticWeight = options.includeKeywordSearch === false ? 1.0 : 0.7;
        const keywordWeight = options.includeKeywordSearch === false ? 0.0 : 0.3;

        return (semanticScore * semanticWeight) + (keywordScore * keywordWeight);
    }

    /**
     * Apply boost factors to search results
     */
    private applyBoostFactors(result: SemanticSearchResult, boost?: SemanticSearchOptions['boost']): SemanticSearchResult {
        if (!boost) {
            return result;
        }

        let boostMultiplier = 1.0;
        const boostFactors: string[] = [];

        // Recent memories boost
        if (boost.recent && result.memory.createdAt) {
            const daysOld = (Date.now() - new Date(result.memory.createdAt).getTime()) / (1000 * 60 * 60 * 24);
            if (daysOld <= 7) {
                const recentBoost = Math.max(0, (7 - daysOld) / 7) * (boost.recent - 1);
                boostMultiplier += recentBoost;
                boostFactors.push(`Recent memory boost (+${Math.round(recentBoost * 100)}%)`);
            }
        }

        // Importance boost
        if (boost.importance && result.memory.importance) {
            const importanceBoost = (result.memory.importance / 10) * (boost.importance - 1);
            boostMultiplier += importanceBoost;
            boostFactors.push(`Importance boost (+${Math.round(importanceBoost * 100)}%)`);
        }

        // Project boost
        if (boost.project && result.memory.project === boost.project) {
            boostMultiplier += 0.3;
            boostFactors.push(`Project match boost (+30%)`);
        }

        // Tags boost
        if (boost.tags && result.memory.tags) {
            const matchingTags = result.memory.tags.filter((tag: string) =>
                boost.tags!.includes(tag)
            ).length;
            if (matchingTags > 0) {
                const tagBoost = matchingTags * 0.2;
                boostMultiplier += tagBoost;
                boostFactors.push(`Tag match boost (+${Math.round(tagBoost * 100)}%)`);
            }
        }

        // Apply boost
        if (boostMultiplier > 1.0) {
            result.combinedScore *= boostMultiplier;
            result.relevanceFactors.push(...boostFactors);
            result.explanation += ` (Boosted: ${Math.round((boostMultiplier - 1) * 100)}%)`;
        }

        return result;
    }

    /**
     * Apply filters to memory list
     */
    private applyFilters(memories: any[], filters?: SemanticSearchOptions['filters']): any[] {
        if (!filters) {
            return memories;
        }

        return memories.filter(memory => {
            // Project filter
            if (filters.project && memory.project !== filters.project) {
                return false;
            }

            // Tags filter (at least one tag must match)
            if (filters.tags && filters.tags.length > 0) {
                const memoryTags = memory.tags || [];
                if (!filters.tags.some(tag => memoryTags.includes(tag))) {
                    return false;
                }
            }

            // Importance range filter
            if (filters.importanceMin !== undefined && memory.importance < filters.importanceMin) {
                return false;
            }
            if (filters.importanceMax !== undefined && memory.importance > filters.importanceMax) {
                return false;
            }

            // Date range filter
            if (filters.dateFrom && new Date(memory.createdAt) < new Date(filters.dateFrom)) {
                return false;
            }
            if (filters.dateTo && new Date(memory.createdAt) > new Date(filters.dateTo)) {
                return false;
            }

            return true;
        });
    }

    /**
     * Generate search insights and analytics
     */
    private generateSearchInsights(
        results: SemanticSearchResult[],
        options: SemanticSearchOptions,
        searchTime: number,
        fromCache: boolean = false
    ): SearchInsights {
        const semanticResults = results.filter(r => r.semanticScore > 0).length;
        const keywordResults = results.filter(r => r.keywordScore && r.keywordScore > 0).length;
        const averageScore = results.length > 0
            ? results.reduce((sum, r) => sum + r.combinedScore, 0) / results.length
            : 0;

        // Analyze query complexity
        const queryTerms = options.query.split(/\s+/);
        const complexity = queryTerms.length === 1 ? 'simple' :
            queryTerms.length <= 3 ? 'medium' : 'complex';

        // Extract search intent
        const intent = this.analyzeSearchIntent(options.query);

        // Generate recommendations
        const recommendations = this.generateSearchRecommendations(results, options);

        return {
            totalResults: results.length,
            semanticResults,
            keywordResults,
            averageScore,
            searchTime: fromCache ? 0 : searchTime,
            queryAnalysis: {
                complexity,
                intent,
                extractedTerms: queryTerms.filter(term => term.length > 2),
                suggestedExpansions: [] // TODO: Implement query expansion suggestions
            },
            recommendations
        };
    }

    /**
     * Analyze search intent from query
     */
    private analyzeSearchIntent(query: string): string {
        const lowerQuery = query.toLowerCase();

        if (lowerQuery.includes('how to') || lowerQuery.includes('tutorial')) {
            return 'learning';
        } else if (lowerQuery.includes('error') || lowerQuery.includes('bug') || lowerQuery.includes('fix')) {
            return 'troubleshooting';
        } else if (lowerQuery.includes('example') || lowerQuery.includes('sample')) {
            return 'reference';
        } else if (lowerQuery.includes('plan') || lowerQuery.includes('task') || lowerQuery.includes('todo')) {
            return 'planning';
        } else if (lowerQuery.includes('recent') || lowerQuery.includes('latest')) {
            return 'recent_activity';
        } else {
            return 'general_search';
        }
    }

    /**
     * Generate search recommendations
     */
    private generateSearchRecommendations(results: SemanticSearchResult[], options: SemanticSearchOptions): string[] {
        const recommendations: string[] = [];

        if (results.length === 0) {
            recommendations.push('Try using broader search terms');
            recommendations.push('Check your spelling and try synonyms');
            recommendations.push('Remove filters to expand your search');
        } else if (results.length < 3) {
            recommendations.push('Try related search terms for more results');
            recommendations.push('Consider removing some filters');
        } else if (results.length > 20) {
            recommendations.push('Add more specific terms to narrow results');
            recommendations.push('Use filters to focus on specific projects or tags');
        }

        // Intent-based recommendations
        const intent = this.analyzeSearchIntent(options.query);
        switch (intent) {
            case 'learning':
                recommendations.push('Look for tutorial or how-to memories');
                break;
            case 'troubleshooting':
                recommendations.push('Check error logs and debugging memories');
                break;
            case 'recent_activity':
                recommendations.push('Sort by recent to see latest memories');
                break;
        }

        return recommendations.slice(0, 3); // Limit to top 3 recommendations
    }

    /**
     * Validate search options
     */
    private validateSearchOptions(options: SemanticSearchOptions): void {
        if (!options.query || options.query.trim().length === 0) {
            throw new Error('Search query is required');
        }

        if (options.limit && (options.limit < 1 || options.limit > 100)) {
            throw new Error('Limit must be between 1 and 100');
        }

        if (options.threshold && (options.threshold < 0 || options.threshold > 1)) {
            throw new Error('Threshold must be between 0 and 1');
        }
    }

    /**
     * Create cache key for search options
     */
    private createCacheKey(options: SemanticSearchOptions): string {
        return JSON.stringify({
            query: options.query,
            agentId: options.agentId || 'default',
            limit: options.limit || 10,
            threshold: options.threshold || 0.3,
            filters: options.filters || {}
        });
    }

    /**
     * Get cached search results
     */
    private getCachedResults(cacheKey: string): SemanticSearchResult[] | null {
        const cached = this.queryCache.get(cacheKey);
        if (cached && Date.now() - cached.timestamp.getTime() < this.CACHE_TTL) {
            return cached.results;
        }
        return null;
    }

    /**
     * Cache search results
     */
    private cacheResults(cacheKey: string, results: SemanticSearchResult[]): void {
        this.queryCache.set(cacheKey, {
            results,
            timestamp: new Date()
        });

        // Clean old cache entries
        if (this.queryCache.size > 100) {
            const oldestKey = Array.from(this.queryCache.keys())[0];
            this.queryCache.delete(oldestKey);
        }
    }

    /**
     * Update search history
     */
    private updateSearchHistory(query: string, resultCount: number): void {
        this.searchHistory.push({
            query,
            results: resultCount,
            timestamp: new Date()
        });

        // Keep only last 100 searches
        if (this.searchHistory.length > 100) {
            this.searchHistory.shift();
        }
    }

    /**
     * Get popular search queries from history
     */
    getPopularQueries(limit: number = 10): Array<{ query: string; count: number }> {
        const queryCount = new Map<string, number>();

        this.searchHistory.forEach(entry => {
            const count = queryCount.get(entry.query) || 0;
            queryCount.set(entry.query, count + 1);
        });

        return Array.from(queryCount.entries())
            .map(([query, count]) => ({ query, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, limit);
    }

    /**
     * Get search analytics
     */
    getSearchAnalytics(): {
        totalSearches: number;
        averageResults: number;
        popularQueries: Array<{ query: string; count: number }>;
        searchTrends: Array<{ date: string; searches: number }>;
    } {
        const totalSearches = this.searchHistory.length;
        const averageResults = totalSearches > 0
            ? this.searchHistory.reduce((sum, entry) => sum + entry.results, 0) / totalSearches
            : 0;

        const popularQueries = this.getPopularQueries(5);

        // Group searches by date for trends
        const dateGroups = new Map<string, number>();
        this.searchHistory.forEach(entry => {
            const date = entry.timestamp.toISOString().split('T')[0];
            dateGroups.set(date, (dateGroups.get(date) || 0) + 1);
        });

        const searchTrends = Array.from(dateGroups.entries())
            .map(([date, searches]) => ({ date, searches }))
            .sort((a, b) => a.date.localeCompare(b.date));

        return {
            totalSearches,
            averageResults,
            popularQueries,
            searchTrends
        };
    }

    /**
     * Clear search cache and history
     */
    clearCache(): void {
        this.queryCache.clear();
        this.searchHistory.length = 0;
    }
}

// Export singleton instance
export const semanticSearchService = new SemanticSearchService();
