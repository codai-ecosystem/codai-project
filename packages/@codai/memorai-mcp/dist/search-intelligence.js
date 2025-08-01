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
import { createHash } from 'crypto';
export class AdvancedSearchEngine {
    openai;
    queryCache = new Map();
    searchPatterns = new Map();
    synonymMap = new Map();
    searchHistory = [];
    constructor(openai) {
        this.openai = openai;
        this.initializeSynonymMap();
    }
    /**
     * Perform advanced intelligent search
     */
    async performAdvancedSearch(query, memories, context, options = {}) {
        const startTime = Date.now();
        // Analyze the query
        const queryAnalysis = await this.analyzeQuery(query, context);
        // Expand query if enabled
        let searchTerms = [query];
        if (options.enableQueryExpansion) {
            searchTerms = await this.expandQuery(query, context);
        }
        // Perform multi-stage search
        let candidateMemories = await this.filterCandidates(memories, searchTerms, options);
        // Calculate advanced relevance scores
        const scoredMemories = await this.calculateAdvancedRelevance(candidateMemories, query, searchTerms, context, options);
        // Apply fuzzy matching if enabled
        if (options.enableFuzzyMatching) {
            await this.applyFuzzyMatching(scoredMemories, searchTerms);
        }
        // Include related memories if enabled
        if (options.includeRelatedMemories) {
            const relatedMemories = await this.includeRelatedMemories(scoredMemories, memories);
            scoredMemories.push(...relatedMemories);
        }
        // Sort by final score
        scoredMemories.sort((a, b) => b.searchScore.finalScore - a.searchScore.finalScore);
        // Generate clusters if enabled
        let clusters = [];
        if (options.clustering) {
            clusters = await this.clusterResults(scoredMemories);
        }
        // Generate suggestions
        const suggestions = await this.generateSearchSuggestions(query, context);
        // Record search pattern
        this.recordSearchPattern(query, scoredMemories.length);
        const searchTime = Date.now() - startTime;
        const searchInsights = this.generateSearchInsights(queryAnalysis, searchTime, memories.length);
        return {
            memories: scoredMemories,
            totalFound: scoredMemories.length,
            searchType: 'intelligent',
            averageRelevance: this.calculateAverageRelevance(scoredMemories),
            queryExpansions: searchTerms.slice(1), // Exclude original query
            suggestions,
            clusters,
            searchInsights
        };
    }
    /**
     * Analyze query to understand intent and complexity
     */
    async analyzeQuery(query, context) {
        const cacheKey = createHash('md5').update(query + context.agentId).digest('hex');
        if (this.queryCache.has(cacheKey)) {
            return this.queryCache.get(cacheKey);
        }
        const analysis = {
            originalQuery: query,
            expandedTerms: [],
            intent: this.detectIntent(query),
            entities: this.extractEntities(query),
            timeReferences: this.extractTimeReferences(query),
            complexity: this.calculateQueryComplexity(query)
        };
        this.queryCache.set(cacheKey, analysis);
        return analysis;
    }
    /**
     * Expand query with synonyms and related terms
     */
    async expandQuery(originalQuery, context) {
        const expandedTerms = [originalQuery];
        const words = originalQuery.toLowerCase().split(/\s+/);
        // Add synonyms
        for (const word of words) {
            const synonyms = this.synonymMap.get(word) || [];
            expandedTerms.push(...synonyms);
        }
        // Add contextual terms based on recent searches
        if (context.searchHistory) {
            const relatedTerms = this.findRelatedTermsFromHistory(originalQuery, context.searchHistory);
            expandedTerms.push(...relatedTerms);
        }
        // AI-powered query expansion (if available)
        if (this.openai) {
            const aiExpansions = await this.aiExpandQuery(originalQuery, context);
            expandedTerms.push(...aiExpansions);
        }
        // Remove duplicates and return
        return [...new Set(expandedTerms)];
    }
    /**
     * Apply fuzzy matching for typos and variations
     */
    async applyFuzzyMatching(memories, searchTerms) {
        for (const memory of memories) {
            let fuzzyBoost = 0;
            for (const term of searchTerms) {
                const fuzzyScore = await this.fuzzyMatch(term, memory.content);
                if (fuzzyScore > 0.7) {
                    fuzzyBoost += fuzzyScore * 0.1; // Small boost for fuzzy matches
                }
            }
            memory.searchScore.contentRelevance += fuzzyBoost;
            memory.searchScore.finalScore = this.calculateFinalScore(memory.searchScore);
        }
    }
    /**
     * Calculate fuzzy matching score
     */
    async fuzzyMatch(query, content) {
        const queryWords = query.toLowerCase().split(/\s+/);
        const contentWords = content.toLowerCase().split(/\s+/);
        let matches = 0;
        for (const queryWord of queryWords) {
            for (const contentWord of contentWords) {
                const similarity = this.calculateLevenshteinSimilarity(queryWord, contentWord);
                if (similarity > 0.7) {
                    matches++;
                    break;
                }
            }
        }
        return queryWords.length > 0 ? matches / queryWords.length : 0;
    }
    /**
     * Calculate advanced relevance scoring
     */
    async calculateAdvancedRelevance(memories, originalQuery, searchTerms, context, options) {
        const enhancedMemories = [];
        for (const memory of memories) {
            const searchScore = await this.calculateSearchScore(memory, originalQuery, searchTerms, context, options);
            const highlightedContent = this.highlightSearchTerms(memory.content, searchTerms);
            const matchedTerms = this.findMatchedTerms(memory.content, searchTerms);
            enhancedMemories.push({
                id: memory.id,
                content: memory.content,
                structuredKey: memory.structuredKey,
                metadata: memory.metadata,
                searchScore,
                highlightedContent,
                matchedTerms
            });
        }
        return enhancedMemories;
    }
    /**
     * Calculate comprehensive search score
     */
    async calculateSearchScore(memory, originalQuery, searchTerms, context, options) {
        // Content relevance (base score)
        const contentRelevance = this.calculateContentRelevance(memory.content, searchTerms);
        // Semantic similarity (if embeddings available)
        let semanticSimilarity = 0;
        if (memory.embedding && this.openai) {
            semanticSimilarity = await this.calculateSemanticRelevance(originalQuery, memory);
        }
        // Temporal relevance (recency boost)
        const temporalRelevance = this.calculateTemporalRelevance(memory, options.temporalWeight || 0.1);
        // Importance weight
        const importanceWeight = memory.metadata?.importance || 0.5;
        // Contextual relevance (session/project match)
        const contextualRelevance = this.calculateContextualRelevance(memory, context);
        // Relationship boost (placeholder - would use actual relationships)
        const relationshipBoost = this.calculateRelationshipBoost(memory, context);
        // Calculate weighted final score
        const finalScore = this.calculateFinalScore({
            contentRelevance,
            semanticSimilarity,
            temporalRelevance,
            relationshipBoost,
            importanceWeight,
            contextualRelevance,
            finalScore: 0 // Will be calculated
        });
        return {
            contentRelevance,
            semanticSimilarity,
            temporalRelevance,
            relationshipBoost,
            importanceWeight,
            contextualRelevance,
            finalScore
        };
    }
    /**
     * Generate search suggestions and auto-complete
     */
    async generateSearchSuggestions(partialQuery, context) {
        const suggestions = [];
        // Historical suggestions based on past searches
        const historicalSuggestions = this.findHistoricalSuggestions(partialQuery);
        suggestions.push(...historicalSuggestions);
        // Context-based suggestions
        if (context.currentProject) {
            suggestions.push(`${partialQuery} in project:${context.currentProject}`);
        }
        if (context.currentSession) {
            suggestions.push(`${partialQuery} in session:${context.currentSession}`);
        }
        // Popular search patterns
        const popularSuggestions = this.getPopularSearchPatterns(partialQuery);
        suggestions.push(...popularSuggestions);
        // AI-generated suggestions (if available)
        if (this.openai) {
            const aiSuggestions = await this.generateAISuggestions(partialQuery, context);
            suggestions.push(...aiSuggestions);
        }
        return [...new Set(suggestions)].slice(0, 10);
    }
    /**
     * Include related memories through relationships
     */
    async includeRelatedMemories(primaryResults, allMemories) {
        const relatedMemories = [];
        // For each primary result, find related memories
        for (const primaryMemory of primaryResults.slice(0, 5)) { // Limit to top 5
            const related = this.findRelatedMemories(primaryMemory, allMemories);
            for (const relatedMemory of related) {
                const enhancedRelated = {
                    id: relatedMemory.id,
                    content: relatedMemory.content,
                    structuredKey: relatedMemory.structuredKey,
                    metadata: relatedMemory.metadata,
                    searchScore: {
                        contentRelevance: 0.3,
                        semanticSimilarity: 0.4,
                        temporalRelevance: 0.2,
                        relationshipBoost: 0.8, // High relationship boost
                        importanceWeight: relatedMemory.metadata?.importance || 0.5,
                        contextualRelevance: 0.3,
                        finalScore: 0.45 // Moderate score for related memories
                    },
                    relationshipContext: `Related to: ${primaryMemory.structuredKey}`
                };
                relatedMemories.push(enhancedRelated);
            }
        }
        return relatedMemories;
    }
    /**
     * Cluster search results by similarity
     */
    async clusterResults(memories) {
        if (memories.length < 3)
            return [];
        const clusters = [];
        const clustered = new Set();
        for (let i = 0; i < memories.length; i++) {
            const memory = memories[i];
            if (!memory || clustered.has(memory.id))
                continue;
            const clusterMemories = [memory];
            clustered.add(memory.id);
            // Find similar memories
            for (let j = i + 1; j < memories.length; j++) {
                const otherMemory = memories[j];
                if (!otherMemory || clustered.has(otherMemory.id))
                    continue;
                const similarity = await this.calculateContentSimilarity(memory, otherMemory);
                if (similarity > 0.6) {
                    clusterMemories.push(otherMemory);
                    clustered.add(otherMemory.id);
                }
            }
            if (clusterMemories.length >= 2) {
                const theme = this.extractClusterTheme(clusterMemories);
                const avgRelevance = clusterMemories.reduce((sum, m) => sum + m.searchScore.finalScore, 0) / clusterMemories.length;
                clusters.push({
                    id: `cluster_${i}`,
                    name: `${theme} (${clusterMemories.length} memories)`,
                    memories: clusterMemories,
                    commonTheme: theme,
                    averageRelevance: avgRelevance
                });
            }
        }
        return clusters;
    }
    // Helper methods
    filterCandidates(memories, searchTerms, options) {
        const scope = options.searchScope || 'all';
        return memories.filter(memory => {
            if (scope === 'content' || scope === 'all') {
                if (this.matchesAnyTerm(memory.content, searchTerms))
                    return true;
            }
            if (scope === 'metadata' || scope === 'all') {
                if (this.matchesMetadata(memory.metadata, searchTerms))
                    return true;
            }
            if (scope === 'relationships' || scope === 'all') {
                if (this.matchesRelationships(memory, searchTerms))
                    return true;
            }
            return false;
        });
    }
    matchesAnyTerm(content, terms) {
        const lowerContent = content.toLowerCase();
        return terms.some(term => lowerContent.includes(term.toLowerCase()));
    }
    matchesMetadata(metadata, terms) {
        const metadataText = JSON.stringify(metadata).toLowerCase();
        return terms.some(term => metadataText.includes(term.toLowerCase()));
    }
    matchesRelationships(memory, terms) {
        // Placeholder - would check actual relationships
        return false;
    }
    calculateContentRelevance(content, searchTerms) {
        const lowerContent = content.toLowerCase();
        let score = 0;
        for (const term of searchTerms) {
            const lowerTerm = term.toLowerCase();
            if (lowerContent.includes(lowerTerm)) {
                // Boost for exact matches
                const exactMatches = (lowerContent.match(new RegExp(lowerTerm, 'g')) || []).length;
                score += exactMatches * 0.1;
                // Boost for term at beginning
                if (lowerContent.startsWith(lowerTerm)) {
                    score += 0.2;
                }
            }
        }
        return Math.min(score, 1.0);
    }
    async calculateSemanticRelevance(query, memory) {
        if (!this.openai || !memory.embedding)
            return 0;
        try {
            const queryEmbedding = await this.openai.embeddings.create({
                model: 'text-embedding-ada-002',
                input: query
            });
            const queryVector = queryEmbedding.data[0]?.embedding;
            if (!queryVector)
                return 0;
            return this.calculateCosineSimilarity(queryVector, memory.embedding);
        }
        catch (error) {
            console.error('Semantic relevance calculation failed:', error);
            return 0;
        }
    }
    calculateTemporalRelevance(memory, temporalWeight) {
        if (temporalWeight === 0)
            return 0;
        const now = new Date();
        const memoryDate = new Date(memory.metadata?.timestamp || now);
        const ageInDays = (now.getTime() - memoryDate.getTime()) / (1000 * 60 * 60 * 24);
        // Exponential decay - recent memories get higher scores
        return Math.exp(-ageInDays / 30) * temporalWeight;
    }
    calculateContextualRelevance(memory, context) {
        let score = 0;
        if (context.currentProject && memory.projectName === context.currentProject) {
            score += 0.3;
        }
        if (context.currentSession && memory.sessionName === context.currentSession) {
            score += 0.2;
        }
        if (context.recentMemories?.includes(memory.id)) {
            score += 0.1;
        }
        return Math.min(score, 1.0);
    }
    calculateRelationshipBoost(memory, context) {
        // Placeholder - would calculate based on actual relationships
        return 0;
    }
    calculateFinalScore(scores) {
        // Weighted combination of all score components
        const weights = {
            contentRelevance: 0.4,
            semanticSimilarity: 0.3,
            temporalRelevance: 0.1,
            relationshipBoost: 0.1,
            importanceWeight: 0.05,
            contextualRelevance: 0.05
        };
        return (scores.contentRelevance * weights.contentRelevance +
            scores.semanticSimilarity * weights.semanticSimilarity +
            scores.temporalRelevance * weights.temporalRelevance +
            scores.relationshipBoost * weights.relationshipBoost +
            scores.importanceWeight * weights.importanceWeight +
            scores.contextualRelevance * weights.contextualRelevance);
    }
    highlightSearchTerms(content, searchTerms) {
        let highlighted = content;
        for (const term of searchTerms) {
            const regex = new RegExp(`(${this.escapeRegex(term)})`, 'gi');
            highlighted = highlighted.replace(regex, '**$1**');
        }
        return highlighted;
    }
    findMatchedTerms(content, searchTerms) {
        const lowerContent = content.toLowerCase();
        return searchTerms.filter(term => lowerContent.includes(term.toLowerCase()));
    }
    escapeRegex(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }
    calculateLevenshteinSimilarity(a, b) {
        const distance = this.levenshteinDistance(a, b);
        const maxLength = Math.max(a.length, b.length);
        return maxLength > 0 ? 1 - (distance / maxLength) : 1;
    }
    levenshteinDistance(a, b) {
        const matrix = Array(b.length + 1).fill(null).map(() => Array(a.length + 1).fill(null));
        for (let i = 0; i <= a.length; i++) {
            matrix[0][i] = i;
        }
        for (let j = 0; j <= b.length; j++) {
            matrix[j][0] = j;
        }
        for (let j = 1; j <= b.length; j++) {
            for (let i = 1; i <= a.length; i++) {
                const indicator = a[i - 1] === b[j - 1] ? 0 : 1;
                matrix[j][i] = Math.min(matrix[j][i - 1] + 1, // deletion
                matrix[j - 1][i] + 1, // insertion
                matrix[j - 1][i - 1] + indicator // substitution
                );
            }
        }
        return matrix[b.length][a.length];
    }
    calculateCosineSimilarity(a, b) {
        if (a.length !== b.length)
            return 0;
        let dotProduct = 0;
        let normA = 0;
        let normB = 0;
        for (let i = 0; i < a.length; i++) {
            const aVal = a[i] ?? 0;
            const bVal = b[i] ?? 0;
            dotProduct += aVal * bVal;
            normA += aVal * aVal;
            normB += bVal * bVal;
        }
        const magnitude = Math.sqrt(normA) * Math.sqrt(normB);
        return magnitude > 0 ? dotProduct / magnitude : 0;
    }
    async calculateContentSimilarity(memory1, memory2) {
        // Simple content similarity - could be enhanced with more sophisticated NLP
        const words1 = new Set(memory1.content.toLowerCase().split(/\s+/));
        const words2 = new Set(memory2.content.toLowerCase().split(/\s+/));
        const intersection = new Set([...words1].filter(x => words2.has(x)));
        const union = new Set([...words1, ...words2]);
        return union.size > 0 ? intersection.size / union.size : 0;
    }
    extractClusterTheme(memories) {
        // Extract common theme from cluster memories
        const allWords = memories.flatMap(m => m.content.toLowerCase().split(/\s+/).filter(w => w.length > 4));
        const wordCounts = new Map();
        for (const word of allWords) {
            wordCounts.set(word, (wordCounts.get(word) || 0) + 1);
        }
        const sortedWords = Array.from(wordCounts.entries())
            .sort(([, a], [, b]) => b - a)
            .slice(0, 3)
            .map(([word]) => word);
        return sortedWords.join(', ') || 'Mixed Content';
    }
    findRelatedMemories(memory, allMemories) {
        // Placeholder - would use actual relationship data
        return allMemories
            .filter(m => m.id !== memory.id && m.projectName === memory.metadata?.project)
            .slice(0, 2);
    }
    calculateAverageRelevance(memories) {
        if (memories.length === 0)
            return 0;
        return memories.reduce((sum, m) => sum + m.searchScore.finalScore, 0) / memories.length;
    }
    detectIntent(query) {
        const lowerQuery = query.toLowerCase();
        if (lowerQuery.includes('compare') || lowerQuery.includes('difference'))
            return 'compare';
        if (lowerQuery.includes('understand') || lowerQuery.includes('explain'))
            return 'understand';
        if (lowerQuery.includes('explore') || lowerQuery.includes('browse'))
            return 'explore';
        if (lowerQuery.includes('remember') || lowerQuery.includes('recall'))
            return 'recall';
        return 'find';
    }
    extractEntities(query) {
        // Simple entity extraction - could be enhanced with NLP
        const entities = [];
        const words = query.split(/\s+/);
        for (const word of words) {
            if (word.length > 3 && /^[A-Z]/.test(word)) {
                entities.push(word);
            }
        }
        return entities;
    }
    extractTimeReferences(query) {
        const timeRefs = [];
        // Simple time reference detection
        const timePatterns = [
            { pattern: /today|now/i, type: 'relative' },
            { pattern: /yesterday/i, type: 'relative' },
            { pattern: /last week|past week/i, type: 'relative' },
            { pattern: /\d{4}-\d{2}-\d{2}/i, type: 'absolute' }
        ];
        for (const { pattern, type } of timePatterns) {
            const match = query.match(pattern);
            if (match) {
                timeRefs.push({
                    type,
                    value: match[0]
                });
            }
        }
        return timeRefs;
    }
    calculateQueryComplexity(query) {
        const words = query.split(/\s+/).length;
        const hasTimeRef = this.extractTimeReferences(query).length > 0;
        const hasEntities = this.extractEntities(query).length > 0;
        let complexity = Math.min(words / 10, 0.5); // Word count factor
        if (hasTimeRef)
            complexity += 0.2;
        if (hasEntities)
            complexity += 0.2;
        return Math.min(complexity, 1.0);
    }
    generateSearchInsights(analysis, searchTime, totalMemories) {
        const complexity = analysis.complexity < 0.3 ? 'simple' :
            analysis.complexity < 0.7 ? 'moderate' : 'complex';
        const strategy = this.determineSearchStrategy(analysis);
        return {
            queryComplexity: complexity,
            searchStrategy: strategy,
            performanceMetrics: {
                searchTime,
                memoryScanned: totalMemories,
                filteringSteps: this.getFilteringSteps(analysis)
            }
        };
    }
    determineSearchStrategy(analysis) {
        if (analysis.expandedTerms.length > 1)
            return 'Query expansion with semantic search';
        if (analysis.entities.length > 0)
            return 'Entity-focused search';
        if (analysis.timeReferences.length > 0)
            return 'Temporal-aware search';
        return 'Standard content search';
    }
    getFilteringSteps(analysis) {
        const steps = ['Initial candidate filtering'];
        if (analysis.entities.length > 0)
            steps.push('Entity extraction');
        if (analysis.timeReferences.length > 0)
            steps.push('Temporal filtering');
        if (analysis.expandedTerms.length > 1)
            steps.push('Query expansion');
        steps.push('Relevance scoring', 'Final ranking');
        return steps;
    }
    recordSearchPattern(query, resultCount) {
        const pattern = this.extractSearchPattern(query);
        this.searchPatterns.set(pattern, (this.searchPatterns.get(pattern) || 0) + 1);
        this.searchHistory.push({
            query,
            timestamp: new Date(),
            results: resultCount
        });
        // Keep history manageable
        if (this.searchHistory.length > 1000) {
            this.searchHistory.shift();
        }
    }
    extractSearchPattern(query) {
        // Extract general pattern from query
        return query.replace(/\b\w+\b/g, 'TERM').replace(/\d+/g, 'NUM');
    }
    findHistoricalSuggestions(partialQuery) {
        return this.searchHistory
            .filter(entry => entry.query.toLowerCase().startsWith(partialQuery.toLowerCase()))
            .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
            .slice(0, 3)
            .map(entry => entry.query);
    }
    getPopularSearchPatterns(partialQuery) {
        const patterns = Array.from(this.searchPatterns.entries())
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5)
            .map(([pattern]) => pattern.replace(/TERM/g, partialQuery));
        return patterns.filter(p => p.includes(partialQuery));
    }
    findRelatedTermsFromHistory(query, searchHistory) {
        // Find terms that often appear with the query terms
        const queryWords = query.toLowerCase().split(/\s+/);
        const relatedTerms = [];
        for (const pastQuery of searchHistory) {
            const pastWords = pastQuery.toLowerCase().split(/\s+/);
            const hasCommonWord = queryWords.some(word => pastWords.includes(word));
            if (hasCommonWord) {
                relatedTerms.push(...pastWords.filter(word => !queryWords.includes(word)));
            }
        }
        return [...new Set(relatedTerms)].slice(0, 3);
    }
    async aiExpandQuery(query, context) {
        // Skip AI expansion if no chat model available (embeddings-only setup)
        if (!this.openai)
            return [];
        try {
            const response = await this.openai.chat.completions.create({
                model: 'gpt-3.5-turbo',
                messages: [{
                        role: 'user',
                        content: `Generate 3 related search terms for: "${query}". Return only the terms, one per line.`
                    }],
                temperature: 0.3,
                max_tokens: 50
            });
            const content = response.choices[0]?.message?.content;
            return content ? content.split('\n').map(term => term.trim()).filter(Boolean) : [];
        }
        catch (error) {
            // Gracefully handle embeddings-only setup - disable AI expansion
            console.error('AI query expansion failed:', error);
            return [];
        }
    }
    async generateAISuggestions(partialQuery, context) {
        // Skip AI suggestions if no chat model available (embeddings-only setup)
        if (!this.openai)
            return [];
        try {
            const response = await this.openai.chat.completions.create({
                model: 'gpt-3.5-turbo',
                messages: [{
                        role: 'user',
                        content: `Complete this search query with 3 variations: "${partialQuery}". Return only the complete queries, one per line.`
                    }],
                temperature: 0.5,
                max_tokens: 100
            });
            const content = response.choices[0]?.message?.content;
            return content ? content.split('\n').map(suggestion => suggestion.trim()).filter(Boolean) : [];
        }
        catch (error) {
            // Gracefully handle embeddings-only setup - disable AI suggestions
            console.error('AI suggestion generation failed:', error);
            return [];
        }
    }
    initializeSynonymMap() {
        // Initialize with common synonyms - could be loaded from external source
        this.synonymMap.set('task', ['todo', 'action', 'assignment']);
        this.synonymMap.set('project', ['work', 'initiative', 'effort']);
        this.synonymMap.set('meeting', ['call', 'discussion', 'session']);
        this.synonymMap.set('decision', ['choice', 'resolution', 'conclusion']);
        this.synonymMap.set('problem', ['issue', 'challenge', 'bug']);
        this.synonymMap.set('solution', ['fix', 'answer', 'resolution']);
    }
}
//# sourceMappingURL=search-intelligence.js.map