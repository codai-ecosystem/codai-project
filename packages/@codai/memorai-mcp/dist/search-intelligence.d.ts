/**
 * Advanced Search Intelligence Engine - Enhanced memory search capabilities
 *
 * Features:
 * - Query expansion with synonyms and related terms
 * - Fuzzy matching for typos and variations
 * - Multi-dimensional search scoring
 * - Search suggestions and auto-complete
 * - Learning from search patterns
 * - Contextual search optimization
 */
import OpenAI from 'openai';
export interface SearchScore {
    contentRelevance: number;
    semanticSimilarity: number;
    temporalRelevance: number;
    relationshipBoost: number;
    importanceWeight: number;
    contextualRelevance: number;
    finalScore: number;
}
export interface SearchContext {
    agentId: string;
    currentSession?: string;
    currentProject?: string;
    recentMemories?: string[];
    searchHistory?: string[];
    timeOfDay?: string;
    userPreferences?: {
        preferRecent?: boolean;
        preferImportant?: boolean;
        preferRelated?: boolean;
    };
}
export interface AdvancedSearchOptions {
    enableQueryExpansion?: boolean;
    enableFuzzyMatching?: boolean;
    includeRelatedMemories?: boolean;
    temporalWeight?: number;
    searchScope?: 'content' | 'metadata' | 'relationships' | 'all';
    clustering?: boolean;
    maxSuggestions?: number;
    similarityThreshold?: number;
}
export interface AdvancedSearchResult {
    memories: EnhancedMemory[];
    totalFound: number;
    searchType: 'text' | 'semantic' | 'hybrid' | 'intelligent';
    averageRelevance: number;
    queryExpansions?: string[];
    suggestions?: string[];
    clusters?: MemoryCluster[];
    searchInsights?: SearchInsights;
}
export interface EnhancedMemory {
    id: string;
    content: string;
    structuredKey: string;
    metadata: any;
    searchScore: SearchScore;
    highlightedContent?: string;
    relationshipContext?: string;
    matchedTerms?: string[];
}
export interface MemoryCluster {
    id: string;
    name: string;
    memories: EnhancedMemory[];
    commonTheme: string;
    averageRelevance: number;
}
export interface SearchInsights {
    queryComplexity: 'simple' | 'moderate' | 'complex';
    searchStrategy: string;
    performanceMetrics: {
        searchTime: number;
        memoryScanned: number;
        filteringSteps: string[];
    };
    recommendations?: string[];
}
export interface QueryAnalysis {
    originalQuery: string;
    expandedTerms: string[];
    intent: 'find' | 'explore' | 'recall' | 'compare' | 'understand';
    entities: string[];
    timeReferences: TimeReference[];
    complexity: number;
}
export interface TimeReference {
    type: 'absolute' | 'relative';
    value: string;
    parsedDate?: Date;
}
export declare class AdvancedSearchEngine {
    private openai?;
    private queryCache;
    private searchPatterns;
    private synonymMap;
    private searchHistory;
    constructor(openai?: OpenAI);
    /**
     * Perform advanced intelligent search
     */
    performAdvancedSearch(query: string, memories: any[], context: SearchContext, options?: AdvancedSearchOptions): Promise<AdvancedSearchResult>;
    /**
     * Analyze query to understand intent and complexity
     */
    analyzeQuery(query: string, context: SearchContext): Promise<QueryAnalysis>;
    /**
     * Expand query with synonyms and related terms
     */
    expandQuery(originalQuery: string, context: SearchContext): Promise<string[]>;
    /**
     * Apply fuzzy matching for typos and variations
     */
    applyFuzzyMatching(memories: EnhancedMemory[], searchTerms: string[]): Promise<void>;
    /**
     * Calculate fuzzy matching score
     */
    fuzzyMatch(query: string, content: string): Promise<number>;
    /**
     * Calculate advanced relevance scoring
     */
    calculateAdvancedRelevance(memories: any[], originalQuery: string, searchTerms: string[], context: SearchContext, options: AdvancedSearchOptions): Promise<EnhancedMemory[]>;
    /**
     * Calculate comprehensive search score
     */
    private calculateSearchScore;
    /**
     * Generate search suggestions and auto-complete
     */
    generateSearchSuggestions(partialQuery: string, context: SearchContext): Promise<string[]>;
    /**
     * Include related memories through relationships
     */
    private includeRelatedMemories;
    /**
     * Cluster search results by similarity
     */
    private clusterResults;
    private filterCandidates;
    private matchesAnyTerm;
    private matchesMetadata;
    private matchesRelationships;
    private calculateContentRelevance;
    private calculateSemanticRelevance;
    private calculateTemporalRelevance;
    private calculateContextualRelevance;
    private calculateRelationshipBoost;
    private calculateFinalScore;
    private highlightSearchTerms;
    private findMatchedTerms;
    private escapeRegex;
    private calculateLevenshteinSimilarity;
    private levenshteinDistance;
    private calculateCosineSimilarity;
    private calculateContentSimilarity;
    private extractClusterTheme;
    private findRelatedMemories;
    private calculateAverageRelevance;
    private detectIntent;
    private extractEntities;
    private extractTimeReferences;
    private calculateQueryComplexity;
    private generateSearchInsights;
    private determineSearchStrategy;
    private getFilteringSteps;
    private recordSearchPattern;
    private extractSearchPattern;
    private findHistoricalSuggestions;
    private getPopularSearchPatterns;
    private findRelatedTermsFromHistory;
    private aiExpandQuery;
    private generateAISuggestions;
    private initializeSynonymMap;
}
//# sourceMappingURL=search-intelligence.d.ts.map