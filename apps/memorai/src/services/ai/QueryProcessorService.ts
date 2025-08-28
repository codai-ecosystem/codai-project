/**
 * QueryProcessorService - Natural Language Query Processing for MemorAI
 * Converts natural language queries into structured search parameters and semantic queries
 */

import { semanticSearchService } from './SemanticSearchService';
import { CBDClient } from '../../lib/cbd-client';

export interface NaturalLanguageQuery {
    originalQuery: string;
    intent: QueryIntent;
    entities: QueryEntity[];
    filters: QueryFilters;
    searchType: 'semantic' | 'keyword' | 'hybrid';
    confidence: number;
    suggestedRefinements?: string[];
}

export interface QueryIntent {
    type: 'search' | 'create' | 'update' | 'delete' | 'analyze' | 'summarize' | 'list' | 'filter';
    action: string;
    confidence: number;
    parameters?: Record<string, any>;
}

export interface QueryEntity {
    text: string;
    type: 'tag' | 'project' | 'date' | 'person' | 'technology' | 'concept' | 'file' | 'url';
    value: any;
    confidence: number;
    position: { start: number; end: number };
}

export interface QueryFilters {
    tags?: string[];
    project?: string;
    importance?: { min?: number; max?: number };
    dateRange?: { start?: Date; end?: Date };
    contentType?: string[];
    sentiment?: 'positive' | 'neutral' | 'negative';
    complexity?: 'simple' | 'medium' | 'complex';
    language?: string;
    hasAttachments?: boolean;
    excludeTags?: string[];
    excludeProjects?: string[];
}

export interface ProcessedQuery {
    naturalLanguageQuery: NaturalLanguageQuery;
    searchParameters: {
        query?: string;
        semanticQuery?: string;
        filters: QueryFilters;
        sortBy?: string;
        sortOrder?: 'asc' | 'desc';
        limit?: number;
        offset?: number;
    };
    suggestions: {
        alternativeQueries: string[];
        queryExpansions: string[];
        filterSuggestions: Array<{ type: string; value: string; reason: string }>;
    };
    metadata: {
        processingTime: number;
        confidence: number;
        queryComplexity: 'simple' | 'medium' | 'complex';
        expectedResults: number;
    };
}

export interface QueryResponse {
    results: any[];
    summary: {
        totalFound: number;
        searchTime: number;
        query: NaturalLanguageQuery;
        appliedFilters: QueryFilters;
    };
    insights: {
        queryAnalysis: string;
        resultPatterns: string[];
        suggestions: string[];
    };
    relatedQueries: string[];
}

export interface ConversationContext {
    sessionId: string;
    previousQueries: Array<{
        query: string;
        timestamp: Date;
        results: number;
    }>;
    currentTopic?: string;
    userPreferences: {
        defaultSortBy?: string;
        preferredFormats?: string[];
        languagePreference?: string;
    };
    activeFilters: QueryFilters;
}

export class QueryProcessorService {
    private intentPatterns = new Map<string, { type: QueryIntent['type']; pattern: RegExp; confidence: number }>();
    private entityPatterns = new Map<string, { type: QueryEntity['type']; pattern: RegExp; extractor?: (match: string) => any }>();
    private stopWords = new Set<string>();
    private technicalTerms = new Set<string>();
    private conversationHistory = new Map<string, ConversationContext>();
    private cbdClient: CBDClient;

    constructor() {
        this.cbdClient = new CBDClient();
        this.initializeIntentPatterns();
        this.initializeEntityPatterns();
        this.initializeStopWords();
        this.initializeTechnicalTerms();
    }

    /**
     * Process natural language query and convert to structured search
     */
    async processQuery(
        query: string,
        sessionId?: string,
        context?: Partial<ConversationContext>
    ): Promise<ProcessedQuery> {
        const startTime = Date.now();

        try {
            // Clean and normalize query
            const normalizedQuery = this.normalizeQuery(query);

            // Get or create conversation context
            const conversationContext = this.getConversationContext(sessionId, context);

            // Analyze query intent
            const intent = this.analyzeIntent(normalizedQuery, conversationContext);

            // Extract entities
            const entities = this.extractEntities(normalizedQuery);

            // Determine search type
            const searchType = this.determineSearchType(normalizedQuery, intent, entities);

            // Extract filters
            const filters = this.extractFilters(normalizedQuery, entities, conversationContext);

            // Calculate confidence
            const confidence = this.calculateQueryConfidence(intent, entities, filters);

            // Generate suggestions
            const suggestedRefinements = this.generateQueryRefinements(normalizedQuery, intent, entities);

            // Create natural language query object
            const naturalLanguageQuery: NaturalLanguageQuery = {
                originalQuery: query,
                intent,
                entities,
                filters,
                searchType,
                confidence,
                suggestedRefinements
            };

            // Convert to search parameters
            const searchParameters = this.convertToSearchParameters(naturalLanguageQuery, conversationContext);

            // Generate suggestions
            const suggestions = await this.generateSuggestions(naturalLanguageQuery, conversationContext);

            // Calculate metadata
            const processingTime = Date.now() - startTime;
            const queryComplexity = this.calculateQueryComplexity(naturalLanguageQuery);
            const expectedResults = await this.estimateResultCount(searchParameters);

            // Update conversation context
            if (sessionId) {
                this.updateConversationContext(sessionId, query, conversationContext);
            }

            return {
                naturalLanguageQuery,
                searchParameters,
                suggestions,
                metadata: {
                    processingTime,
                    confidence,
                    queryComplexity,
                    expectedResults
                }
            };

        } catch (error) {
            console.error('Query processing error:', error);
            throw new Error(`Failed to process query: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Execute processed query and return results with insights
     */
    async executeQuery(processedQuery: ProcessedQuery): Promise<QueryResponse> {
        const startTime = Date.now();

        try {
            let results = [];

            // Execute search based on type
            if (processedQuery.naturalLanguageQuery.searchType === 'semantic') {
                const semanticResults = await semanticSearchService.search({
                    query: processedQuery.searchParameters.semanticQuery || processedQuery.searchParameters.query || '',
                    filters: processedQuery.searchParameters.filters,
                    limit: processedQuery.searchParameters.limit || 20
                });
                results = semanticResults.results;
            } else if (processedQuery.naturalLanguageQuery.searchType === 'keyword') {
                // Mock keyword search since CBDClient doesn't have query methods yet
                const keywordResults: any[] = [];
                results = keywordResults;
            } else {
                // Hybrid search - combine semantic and keyword
                const [semanticResults] = await Promise.all([
                    semanticSearchService.search({
                        query: processedQuery.searchParameters.semanticQuery || processedQuery.searchParameters.query || '',
                        filters: processedQuery.searchParameters.filters,
                        limit: Math.ceil((processedQuery.searchParameters.limit || 20) / 2)
                    })
                ]);

                // Mock CBD results since getDocuments doesn't exist
                const cbdResults: any[] = [];

                // Merge and deduplicate results
                const allResults = [...semanticResults.results, ...cbdResults];
                const uniqueResults = new Map();
                allResults.forEach(result => {
                    if (!uniqueResults.has(result.id)) {
                        uniqueResults.set(result.id, result);
                    }
                });
                results = Array.from(uniqueResults.values());
            }

            const searchTime = Date.now() - startTime;

            // Generate insights
            const insights = this.generateResultInsights(
                processedQuery.naturalLanguageQuery,
                results
            );

            // Generate related queries
            const relatedQueries = this.generateRelatedQueries(
                processedQuery.naturalLanguageQuery,
                results
            );

            return {
                results,
                summary: {
                    totalFound: results.length,
                    searchTime,
                    query: processedQuery.naturalLanguageQuery,
                    appliedFilters: processedQuery.searchParameters.filters
                },
                insights,
                relatedQueries
            };

        } catch (error) {
            console.error('Query execution error:', error);
            throw new Error(`Failed to execute query: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Get conversation context for session
     */
    private getConversationContext(sessionId?: string, context?: Partial<ConversationContext>): ConversationContext {
        if (!sessionId) {
            return {
                sessionId: 'anonymous',
                previousQueries: [],
                userPreferences: {},
                activeFilters: {}
            };
        }

        const existing = this.conversationHistory.get(sessionId);
        if (existing) {
            return { ...existing, ...context };
        }

        const newContext: ConversationContext = {
            sessionId,
            previousQueries: [],
            userPreferences: {},
            activeFilters: {},
            ...context
        };

        this.conversationHistory.set(sessionId, newContext);
        return newContext;
    }

    /**
     * Normalize query text
     */
    private normalizeQuery(query: string): string {
        return query
            .trim()
            .toLowerCase()
            .replace(/[^\w\s\-_.]/g, ' ') // Keep basic punctuation
            .replace(/\s+/g, ' ');
    }

    /**
     * Analyze query intent
     */
    private analyzeIntent(query: string, context: ConversationContext): QueryIntent {
        let bestMatch: QueryIntent = {
            type: 'search',
            action: 'search_memories',
            confidence: 0.5
        };

        // Check intent patterns
        for (const [action, { type, pattern, confidence }] of this.intentPatterns) {
            if (pattern.test(query)) {
                if (confidence > bestMatch.confidence) {
                    bestMatch = {
                        type,
                        action,
                        confidence,
                        parameters: this.extractIntentParameters(query, type)
                    };
                }
            }
        }

        // Context-based intent adjustment
        if (context.previousQueries.length > 0) {
            const lastQuery = context.previousQueries[context.previousQueries.length - 1];
            if (lastQuery.results === 0 && bestMatch.type === 'search') {
                bestMatch.confidence *= 0.8; // Lower confidence for repeated failed searches
            }
        }

        return bestMatch;
    }

    /**
     * Extract entities from query
     */
    private extractEntities(query: string): QueryEntity[] {
        const entities: QueryEntity[] = [];

        for (const [entityType, { type, pattern, extractor }] of this.entityPatterns) {
            const matches = query.matchAll(pattern);

            for (const match of matches) {
                if (match.index !== undefined) {
                    const text = match[0];
                    const value = extractor ? extractor(text) : text;

                    entities.push({
                        text,
                        type,
                        value,
                        confidence: 0.8,
                        position: {
                            start: match.index,
                            end: match.index + text.length
                        }
                    });
                }
            }
        }

        return entities.sort((a, b) => b.confidence - a.confidence);
    }

    /**
     * Determine optimal search type
     */
    private determineSearchType(
        query: string,
        intent: QueryIntent,
        entities: QueryEntity[]
    ): 'semantic' | 'keyword' | 'hybrid' {
        // Simple keyword queries
        if (query.split(' ').length <= 2 && entities.some(e => e.type === 'tag' || e.type === 'project')) {
            return 'keyword';
        }

        // Complex conceptual queries
        if (query.split(' ').length > 5 || query.includes('similar to') || query.includes('like')) {
            return 'semantic';
        }

        // Hybrid for most cases
        return 'hybrid';
    }

    /**
     * Extract filters from query and entities
     */
    private extractFilters(
        query: string,
        entities: QueryEntity[],
        context: ConversationContext
    ): QueryFilters {
        const filters: QueryFilters = { ...context.activeFilters };

        // Extract filters from entities
        entities.forEach(entity => {
            switch (entity.type) {
                case 'tag':
                    filters.tags = [...(filters.tags || []), entity.value];
                    break;
                case 'project':
                    filters.project = entity.value;
                    break;
                case 'date':
                    if (!filters.dateRange) filters.dateRange = {};
                    // Simple date parsing (could be enhanced)
                    if (query.includes('after') || query.includes('since')) {
                        filters.dateRange.start = entity.value;
                    } else if (query.includes('before') || query.includes('until')) {
                        filters.dateRange.end = entity.value;
                    }
                    break;
            }
        });

        // Extract importance filters
        if (query.includes('important') || query.includes('high priority')) {
            filters.importance = { min: 7 };
        } else if (query.includes('low priority') || query.includes('minor')) {
            filters.importance = { max: 4 };
        }

        // Extract content type filters
        if (query.includes('code') || query.includes('function') || query.includes('class')) {
            filters.contentType = ['code'];
        } else if (query.includes('todo') || query.includes('task')) {
            filters.contentType = ['task'];
        } else if (query.includes('idea') || query.includes('concept')) {
            filters.contentType = ['idea'];
        } else if (query.includes('documentation') || query.includes('guide')) {
            filters.contentType = ['documentation'];
        }

        // Extract exclusion filters
        if (query.includes('not') || query.includes('exclude') || query.includes('except')) {
            // Simple exclusion logic (could be enhanced with NLP)
            const excludeMatches = query.match(/(?:not|exclude|except)\s+(\w+)/g);
            if (excludeMatches) {
                filters.excludeTags = excludeMatches.map(m => m.split(' ')[1]);
            }
        }

        return filters;
    }

    /**
     * Calculate query confidence
     */
    private calculateQueryConfidence(
        intent: QueryIntent,
        entities: QueryEntity[],
        filters: QueryFilters
    ): number {
        let confidence = intent.confidence;

        // Boost confidence for specific entities
        if (entities.length > 0) {
            const avgEntityConfidence = entities.reduce((sum, e) => sum + e.confidence, 0) / entities.length;
            confidence = (confidence + avgEntityConfidence) / 2;
        }

        // Boost confidence for specific filters
        if (filters.tags || filters.project || filters.dateRange) {
            confidence += 0.1;
        }

        return Math.min(confidence, 1);
    }

    /**
     * Generate query refinement suggestions
     */
    private generateQueryRefinements(
        query: string,
        intent: QueryIntent,
        entities: QueryEntity[]
    ): string[] {
        const refinements: string[] = [];

        // Suggest more specific queries
        if (query.split(' ').length <= 3) {
            refinements.push(`${query} with examples`);
            refinements.push(`${query} in last month`);
        }

        // Suggest filters based on entities
        if (entities.some(e => e.type === 'technology')) {
            refinements.push(`${query} tagged as development`);
        }

        // Suggest alternative search approaches
        if (intent.type === 'search') {
            refinements.push(`Similar to: ${query}`);
            refinements.push(`${query} ordered by importance`);
        }

        return refinements.slice(0, 3);
    }

    /**
     * Convert natural language query to search parameters
     */
    private convertToSearchParameters(
        nlQuery: NaturalLanguageQuery,
        context: ConversationContext
    ): ProcessedQuery['searchParameters'] {
        const params: ProcessedQuery['searchParameters'] = {
            filters: nlQuery.filters,
            limit: 20
        };

        // Set query based on search type
        if (nlQuery.searchType === 'semantic' || nlQuery.searchType === 'hybrid') {
            params.semanticQuery = nlQuery.originalQuery;
        }

        if (nlQuery.searchType === 'keyword' || nlQuery.searchType === 'hybrid') {
            // Extract keywords (remove stop words)
            const keywords = nlQuery.originalQuery
                .toLowerCase()
                .split(' ')
                .filter(word => !this.stopWords.has(word) && word.length > 2)
                .join(' ');
            params.query = keywords;
        }

        // Set sorting based on intent
        if (nlQuery.intent.action.includes('recent')) {
            params.sortBy = 'updated_at';
            params.sortOrder = 'desc';
        } else if (nlQuery.intent.action.includes('important')) {
            params.sortBy = 'importance';
            params.sortOrder = 'desc';
        } else if (context.userPreferences.defaultSortBy) {
            params.sortBy = context.userPreferences.defaultSortBy;
        }

        return params;
    }

    /**
     * Generate suggestions for query improvement
     */
    private async generateSuggestions(
        nlQuery: NaturalLanguageQuery,
        context: ConversationContext
    ): Promise<ProcessedQuery['suggestions']> {
        const suggestions: ProcessedQuery['suggestions'] = {
            alternativeQueries: [],
            queryExpansions: [],
            filterSuggestions: []
        };

        // Generate alternative queries
        suggestions.alternativeQueries = [
            `Find ${nlQuery.originalQuery}`,
            `Show me ${nlQuery.originalQuery}`,
            `Search for ${nlQuery.originalQuery}`
        ];

        // Generate query expansions
        if (nlQuery.entities.some(e => e.type === 'technology')) {
            suggestions.queryExpansions.push(`${nlQuery.originalQuery} with code examples`);
            suggestions.queryExpansions.push(`${nlQuery.originalQuery} documentation`);
        }

        // Generate filter suggestions
        if (!nlQuery.filters.project) {
            suggestions.filterSuggestions.push({
                type: 'project',
                value: 'current',
                reason: 'Limit to current project'
            });
        }

        if (!nlQuery.filters.dateRange) {
            suggestions.filterSuggestions.push({
                type: 'date',
                value: 'last_week',
                reason: 'Show recent results'
            });
        }

        return suggestions;
    }

    /**
     * Calculate query complexity
     */
    private calculateQueryComplexity(nlQuery: NaturalLanguageQuery): 'simple' | 'medium' | 'complex' {
        let complexityScore = 0;

        // Word count
        if (nlQuery.originalQuery.split(' ').length > 10) complexityScore += 2;
        else if (nlQuery.originalQuery.split(' ').length > 5) complexityScore += 1;

        // Entity count
        if (nlQuery.entities.length > 3) complexityScore += 2;
        else if (nlQuery.entities.length > 1) complexityScore += 1;

        // Filter count
        const filterCount = Object.keys(nlQuery.filters).length;
        if (filterCount > 3) complexityScore += 2;
        else if (filterCount > 1) complexityScore += 1;

        // Intent complexity
        if (nlQuery.intent.type !== 'search') complexityScore += 1;

        if (complexityScore >= 5) return 'complex';
        if (complexityScore >= 3) return 'medium';
        return 'simple';
    }

    /**
     * Estimate result count
     */
    private async estimateResultCount(searchParams: ProcessedQuery['searchParameters']): Promise<number> {
        // Simple estimation logic (could be enhanced with actual search)
        let estimate = 50; // Base estimate

        if (searchParams.filters.project) estimate *= 0.3;
        if (searchParams.filters.tags?.length) estimate *= 0.5;
        if (searchParams.filters.dateRange) estimate *= 0.4;
        if (searchParams.filters.contentType?.length) estimate *= 0.6;

        return Math.max(1, Math.round(estimate));
    }

    /**
     * Update conversation context
     */
    private updateConversationContext(
        sessionId: string,
        query: string,
        context: ConversationContext
    ): void {
        context.previousQueries.push({
            query,
            timestamp: new Date(),
            results: 0 // Will be updated after execution
        });

        // Keep only last 10 queries
        if (context.previousQueries.length > 10) {
            context.previousQueries = context.previousQueries.slice(-10);
        }

        this.conversationHistory.set(sessionId, context);
    }

    /**
     * Generate insights about results
     */
    private generateResultInsights(nlQuery: NaturalLanguageQuery, results: any[]): QueryResponse['insights'] {
        const insights: QueryResponse['insights'] = {
            queryAnalysis: '',
            resultPatterns: [],
            suggestions: []
        };

        // Query analysis
        insights.queryAnalysis = `Found ${results.length} results for "${nlQuery.originalQuery}" using ${nlQuery.searchType} search with ${nlQuery.confidence.toFixed(2)} confidence.`;

        // Result patterns
        if (results.length > 0) {
            const tags = new Set<string>();
            const projects = new Set<string>();

            results.forEach(result => {
                if (result.tags) result.tags.forEach((tag: string) => tags.add(tag));
                if (result.project) projects.add(result.project);
            });

            if (tags.size > 0) {
                insights.resultPatterns.push(`Common tags: ${Array.from(tags).slice(0, 3).join(', ')}`);
            }
            if (projects.size > 0) {
                insights.resultPatterns.push(`Projects: ${Array.from(projects).slice(0, 3).join(', ')}`);
            }
        }

        // Suggestions
        if (results.length === 0) {
            insights.suggestions.push('Try using different keywords');
            insights.suggestions.push('Remove some filters to broaden the search');
        } else if (results.length > 50) {
            insights.suggestions.push('Add filters to narrow down results');
            insights.suggestions.push('Sort by importance or date');
        }

        return insights;
    }

    /**
     * Generate related queries
     */
    private generateRelatedQueries(nlQuery: NaturalLanguageQuery, results: any[]): string[] {
        const related: string[] = [];

        // Based on entities
        nlQuery.entities.forEach(entity => {
            if (entity.type === 'technology') {
                related.push(`${entity.value} examples`);
                related.push(`${entity.value} best practices`);
            } else if (entity.type === 'project') {
                related.push(`${entity.value} progress`);
                related.push(`${entity.value} issues`);
            }
        });

        // Based on results
        if (results.length > 0) {
            const commonTags = new Map<string, number>();
            results.forEach(result => {
                if (result.tags) {
                    result.tags.forEach((tag: string) => {
                        commonTags.set(tag, (commonTags.get(tag) || 0) + 1);
                    });
                }
            });

            // Get top tags
            const topTags = Array.from(commonTags.entries())
                .sort(([, a], [, b]) => b - a)
                .slice(0, 3)
                .map(([tag]) => tag);

            topTags.forEach(tag => {
                related.push(`${tag} related`);
            });
        }

        return related.slice(0, 5);
    }

    /**
     * Extract intent parameters
     */
    private extractIntentParameters(query: string, intentType: QueryIntent['type']): Record<string, any> {
        const params: Record<string, any> = {};

        switch (intentType) {
            case 'create':
                if (query.includes('note')) params.type = 'note';
                else if (query.includes('task')) params.type = 'task';
                else if (query.includes('idea')) params.type = 'idea';
                break;
            case 'list':
                if (query.includes('recent')) params.sortBy = 'updated_at';
                else if (query.includes('important')) params.sortBy = 'importance';
                break;
            case 'analyze':
                if (query.includes('summary')) params.analysisType = 'summary';
                else if (query.includes('pattern')) params.analysisType = 'patterns';
                break;
        }

        return params;
    }

    /**
     * Initialize intent patterns
     */
    private initializeIntentPatterns(): void {
        this.intentPatterns = new Map([
            // Search intents
            ['search_memories', { type: 'search', pattern: /\b(find|search|show|get|look)\b/i, confidence: 0.8 }],
            ['search_similar', { type: 'search', pattern: /\b(similar|like|related)\b/i, confidence: 0.9 }],
            ['search_recent', { type: 'search', pattern: /\b(recent|latest|new)\b/i, confidence: 0.85 }],

            // Create intents
            ['create_memory', { type: 'create', pattern: /\b(create|add|new|make)\b/i, confidence: 0.9 }],
            ['create_note', { type: 'create', pattern: /\b(note|remember|save)\b/i, confidence: 0.85 }],

            // List intents
            ['list_all', { type: 'list', pattern: /\b(list|show all|display)\b/i, confidence: 0.8 }],
            ['list_by_tag', { type: 'list', pattern: /\b(tagged|with tag)\b/i, confidence: 0.9 }],
            ['list_by_project', { type: 'list', pattern: /\b(in project|from project)\b/i, confidence: 0.9 }],

            // Filter intents
            ['filter_by_date', { type: 'filter', pattern: /\b(from|since|after|before|until)\b/i, confidence: 0.8 }],
            ['filter_by_importance', { type: 'filter', pattern: /\b(important|priority|critical)\b/i, confidence: 0.8 }],

            // Analyze intents
            ['analyze_content', { type: 'analyze', pattern: /\b(analyze|summarize|overview)\b/i, confidence: 0.9 }],
            ['analyze_patterns', { type: 'analyze', pattern: /\b(pattern|trend|common)\b/i, confidence: 0.85 }]
        ]);
    }

    /**
     * Initialize entity patterns
     */
    private initializeEntityPatterns(): void {
        this.entityPatterns = new Map([
            // Tag entities
            ['tag_hash', {
                type: 'tag',
                pattern: /#(\w+)/g,
                extractor: (match) => match.substring(1)
            }],
            ['tag_tagged', {
                type: 'tag',
                pattern: /tagged?\s+(?:as\s+)?(\w+)/gi,
                extractor: (match) => match.split(/\s+/).pop()
            }],

            // Project entities
            ['project_in', {
                type: 'project',
                pattern: /in\s+project\s+(\w+)/gi,
                extractor: (match) => match.split(/\s+/).pop()
            }],
            ['project_from', {
                type: 'project',
                pattern: /from\s+project\s+(\w+)/gi,
                extractor: (match) => match.split(/\s+/).pop()
            }],

            // Date entities
            ['date_relative', {
                type: 'date',
                pattern: /\b(today|yesterday|last\s+week|last\s+month|this\s+week|this\s+month)\b/gi,
                extractor: (match) => this.parseRelativeDate(match.toLowerCase())
            }],
            ['date_absolute', {
                type: 'date',
                pattern: /\b(\d{4}-\d{2}-\d{2}|\d{1,2}\/\d{1,2}\/\d{4})\b/g,
                extractor: (match) => new Date(match)
            }],

            // Technology entities
            ['tech_terms', {
                type: 'technology',
                pattern: /\b(react|vue|angular|node|typescript|javascript|python|docker|kubernetes|aws)\b/gi,
                extractor: (match) => match.toLowerCase()
            }],

            // URL entities
            ['url', {
                type: 'url',
                pattern: /https?:\/\/[^\s]+/g,
                extractor: (match) => match
            }],

            // File entities
            ['file_path', {
                type: 'file',
                pattern: /[a-zA-Z]:\\[^\s]+|\/[^\s]+\.[a-zA-Z0-9]+/g,
                extractor: (match) => match
            }]
        ]);
    }

    /**
     * Parse relative dates
     */
    private parseRelativeDate(dateString: string): Date {
        const now = new Date();
        const date = new Date(now);

        switch (dateString) {
            case 'today':
                return date;
            case 'yesterday':
                date.setDate(date.getDate() - 1);
                return date;
            case 'last week':
                date.setDate(date.getDate() - 7);
                return date;
            case 'last month':
                date.setMonth(date.getMonth() - 1);
                return date;
            case 'this week':
                const dayOfWeek = date.getDay();
                date.setDate(date.getDate() - dayOfWeek);
                return date;
            case 'this month':
                date.setDate(1);
                return date;
            default:
                return now;
        }
    }

    /**
     * Initialize stop words
     */
    private initializeStopWords(): void {
        this.stopWords = new Set([
            'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with',
            'by', 'from', 'up', 'about', 'into', 'through', 'during', 'before',
            'after', 'above', 'below', 'between', 'among', 'this', 'that', 'these',
            'those', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have',
            'has', 'had', 'do', 'does', 'did', 'will', 'would', 'should', 'could',
            'a', 'an', 'as', 'if', 'each', 'how', 'which', 'who', 'when', 'where',
            'why', 'what', 'can', 'may', 'might', 'must', 'shall', 'should', 'will',
            'would', 'could'
        ]);
    }

    /**
     * Initialize technical terms
     */
    private initializeTechnicalTerms(): void {
        this.technicalTerms = new Set([
            'react', 'vue', 'angular', 'node', 'typescript', 'javascript', 'python',
            'docker', 'kubernetes', 'aws', 'azure', 'gcp', 'api', 'rest', 'graphql',
            'database', 'mongodb', 'postgresql', 'mysql', 'redis', 'html', 'css',
            'sass', 'tailwind', 'bootstrap', 'webpack', 'vite', 'jest', 'cypress',
            'playwright', 'git', 'github', 'gitlab', 'ci', 'cd', 'devops', 'cloud',
            'server', 'client', 'frontend', 'backend', 'fullstack', 'mobile', 'ios',
            'android', 'flutter', 'react-native', 'ai', 'ml', 'tensorflow', 'pytorch'
        ]);
    }

    /**
     * Clear conversation history
     */
    clearConversationHistory(sessionId?: string): void {
        if (sessionId) {
            this.conversationHistory.delete(sessionId);
        } else {
            this.conversationHistory.clear();
        }
    }

    /**
     * Get conversation statistics
     */
    getConversationStats(): {
        activeSessions: number;
        totalQueries: number;
        averageQueriesPerSession: number;
    } {
        const sessions = Array.from(this.conversationHistory.values());
        const totalQueries = sessions.reduce((sum, session) => sum + session.previousQueries.length, 0);

        return {
            activeSessions: sessions.length,
            totalQueries,
            averageQueriesPerSession: sessions.length > 0 ? totalQueries / sessions.length : 0
        };
    }
}

// Export singleton instance
export const queryProcessorService = new QueryProcessorService();
