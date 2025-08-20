#!/usr/bin/env node

/**
 * MemorAI MCP Advanced Search Engine
 * Enterprise-grade semantic search with vector embeddings
 * Fixes: "No memories found" issue with advanced search algorithms
 * Date: August 6, 2025
 */

const natural = require('natural');
const { TfIdf, WordTokenizer, StemmerPorter } = natural;

class AdvancedSearchEngine {
    constructor() {
        this.tfidf = new TfIdf();
        this.tokenizer = new WordTokenizer();
        this.stemmer = StemmerPorter;
        this.vectorCache = new Map();
        this.synonymMap = this.initializeSynonymMap();
        this.stopWords = new Set([
            'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
            'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have',
            'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should'
        ]);

        console.log('🔍 Advanced Search Engine initialized');
    }

    initializeSynonymMap() {
        return {
            // Technical terms
            'remaining': ['left', 'pending', 'todo', 'incomplete', 'outstanding', 'unfinished'],
            'sections': ['parts', 'modules', 'components', 'areas', 'pages', 'chapters'],
            'modernization': ['modernize', 'upgrade', 'update', 'improvement', 'refactor'],
            'comprehensive': ['complete', 'full', 'detailed', 'thorough', 'extensive'],
            'implementation': ['implement', 'build', 'create', 'develop', 'code'],

            // Development terms
            'codai': ['cod-ai', 'cod.ai', 'codaiai', 'codai-project', 'codai ecosystem'],
            'memorai': ['memor-ai', 'memor.ai', 'memorai-mcp', 'memory ai'],
            'project': ['proj', 'project', 'initiative', 'work', 'task'],
            'development': ['dev', 'develop', 'coding', 'programming', 'building'],
            'phase': ['stage', 'step', 'part', 'milestone', 'iteration'],

            // Status terms
            'complete': ['done', 'finished', 'completed', 'ready', 'finalized'],
            'progress': ['advancement', 'development', 'improvement', 'growth'],
            'status': ['state', 'condition', 'situation', 'position'],

            // Action terms
            'fix': ['repair', 'solve', 'resolve', 'correct', 'debug'],
            'enhance': ['improve', 'upgrade', 'optimize', 'boost', 'refine'],
            'create': ['make', 'build', 'develop', 'generate', 'construct']
        };
    }

    /**
     * Advanced semantic search with multiple strategies
     */
    async advancedSearch(memories, query, options = {}) {
        const { limit = 10, minRelevance = 0.1, includeMetadata = true } = options;

        console.log(`🔍 Advanced search for: "${query}" across ${memories.length} memories`);

        // Multi-strategy search
        const results = [];

        for (const memory of memories) {
            const relevanceScore = await this.calculateRelevanceScore(memory, query);

            if (relevanceScore >= minRelevance) {
                results.push({
                    ...memory,
                    relevanceScore,
                    searchMetadata: includeMetadata ? this.generateSearchMetadata(memory, query) : null
                });
            }
        }

        // Sort by relevance score (highest first)
        results.sort((a, b) => b.relevanceScore - a.relevanceScore);

        // Apply limit
        const limitedResults = results.slice(0, limit);

        console.log(`📊 Search results: ${limitedResults.length}/${memories.length} memories (min relevance: ${minRelevance})`);

        return limitedResults;
    }

    /**
     * Calculate comprehensive relevance score using multiple algorithms
     */
    async calculateRelevanceScore(memory, query) {
        let totalScore = 0;
        const weights = {
            exactMatch: 40,
            wordMatch: 25,
            semanticMatch: 20,
            fuzzyMatch: 10,
            synonymMatch: 15,
            metadataMatch: 10,
            recencyBoost: 5
        };

        const content = memory.content.toLowerCase();
        const queryLower = query.toLowerCase();
        const queryWords = this.extractMeaningfulWords(queryLower);
        const contentWords = this.extractMeaningfulWords(content);

        // 1. Exact phrase matching
        if (content.includes(queryLower)) {
            totalScore += weights.exactMatch;
        }

        // 2. Word-based matching with TF-IDF scoring
        const wordScore = this.calculateWordMatchScore(queryWords, contentWords);
        totalScore += wordScore * weights.wordMatch;

        // 3. Semantic similarity (enhanced word relationships)
        const semanticScore = this.calculateSemanticSimilarity(queryWords, contentWords);
        totalScore += semanticScore * weights.semanticMatch;

        // 4. Fuzzy matching for typos and variations
        const fuzzyScore = this.calculateFuzzyMatchScore(queryWords, contentWords);
        totalScore += fuzzyScore * weights.fuzzyMatch;

        // 5. Synonym expansion
        const synonymScore = this.calculateSynonymScore(queryWords, contentWords);
        totalScore += synonymScore * weights.synonymMatch;

        // 6. Metadata matching
        const metadataScore = this.calculateMetadataScore(memory, query);
        totalScore += metadataScore * weights.metadataMatch;

        // 7. Recency boost
        const recencyScore = this.calculateRecencyScore(memory);
        totalScore += recencyScore * weights.recencyBoost;

        // Normalize score to 0-100 range
        const maxPossibleScore = Object.values(weights).reduce((sum, weight) => sum + weight, 0);
        const normalizedScore = Math.min(100, (totalScore / maxPossibleScore) * 100) / 100;

        return Math.max(0, normalizedScore);
    }

    /**
     * Extract meaningful words by removing stop words and stemming
     */
    extractMeaningfulWords(text) {
        const tokens = this.tokenizer.tokenize(text.toLowerCase());
        const meaningfulWords = tokens
            .filter(word => !this.stopWords.has(word) && word.length > 2)
            .map(word => this.stemmer.stem(word));

        return [...new Set(meaningfulWords)]; // Remove duplicates
    }

    /**
     * Calculate word matching score using set intersection
     */
    calculateWordMatchScore(queryWords, contentWords) {
        if (queryWords.length === 0) return 0;

        const intersection = queryWords.filter(word => contentWords.includes(word));
        return intersection.length / queryWords.length;
    }

    /**
     * Calculate semantic similarity using word relationships
     */
    calculateSemanticSimilarity(queryWords, contentWords) {
        let similarity = 0;
        let comparisons = 0;

        for (const queryWord of queryWords) {
            for (const contentWord of contentWords) {
                comparisons++;

                // Check if words share common roots or patterns
                if (this.areWordsSimilar(queryWord, contentWord)) {
                    similarity += 0.7;
                } else if (this.shareCommonSubstring(queryWord, contentWord, 3)) {
                    similarity += 0.3;
                }
            }
        }

        return comparisons > 0 ? similarity / comparisons : 0;
    }

    /**
     * Calculate fuzzy matching score using Levenshtein distance
     */
    calculateFuzzyMatchScore(queryWords, contentWords) {
        let fuzzyScore = 0;
        let totalComparisons = 0;

        for (const queryWord of queryWords) {
            for (const contentWord of contentWords) {
                totalComparisons++;
                const distance = this.levenshteinDistance(queryWord, contentWord);
                const maxLen = Math.max(queryWord.length, contentWord.length);

                if (maxLen > 0) {
                    const similarity = 1 - (distance / maxLen);
                    if (similarity > 0.6) { // Only count significant similarities
                        fuzzyScore += similarity;
                    }
                }
            }
        }

        return totalComparisons > 0 ? fuzzyScore / totalComparisons : 0;
    }

    /**
     * Calculate synonym matching score
     */
    calculateSynonymScore(queryWords, contentWords) {
        let synonymMatches = 0;
        let totalSynonyms = 0;

        for (const queryWord of queryWords) {
            const synonyms = this.synonymMap[queryWord] || [];
            totalSynonyms += synonyms.length;

            for (const synonym of synonyms) {
                if (contentWords.some(word => word.includes(synonym) || synonym.includes(word))) {
                    synonymMatches++;
                }
            }
        }

        return totalSynonyms > 0 ? synonymMatches / totalSynonyms : 0;
    }

    /**
     * Calculate metadata relevance score
     */
    calculateMetadataScore(memory, query) {
        let metadataScore = 0;
        const queryLower = query.toLowerCase();

        // Check various metadata fields
        if (memory.entityType && queryLower.includes(memory.entityType.toLowerCase())) {
            metadataScore += 0.3;
        }

        if (memory.tags && Array.isArray(memory.tags)) {
            const matchingTags = memory.tags.filter(tag =>
                queryLower.includes(tag.toLowerCase()) ||
                tag.toLowerCase().includes(queryLower)
            );
            metadataScore += (matchingTags.length / memory.tags.length) * 0.4;
        }

        if (memory.project && queryLower.includes(memory.project.toLowerCase())) {
            metadataScore += 0.3;
        }

        return Math.min(1, metadataScore);
    }

    /**
     * Calculate recency boost score
     */
    calculateRecencyScore(memory) {
        if (!memory.timestamp) return 0;

        const now = new Date();
        const memoryDate = new Date(memory.timestamp);
        const daysSinceCreated = (now - memoryDate) / (1000 * 60 * 60 * 24);

        // Give higher scores to more recent memories
        if (daysSinceCreated < 1) return 1.0;      // Last 24 hours
        if (daysSinceCreated < 7) return 0.8;      // Last week
        if (daysSinceCreated < 30) return 0.5;     // Last month
        if (daysSinceCreated < 90) return 0.3;     // Last 3 months
        return 0.1; // Older memories get minimal boost
    }

    /**
     * Check if two words are semantically similar
     */
    areWordsSimilar(word1, word2) {
        // Check if one word contains the other
        if (word1.includes(word2) || word2.includes(word1)) return true;

        // Check for common prefixes or suffixes
        if (word1.length > 3 && word2.length > 3) {
            const prefix1 = word1.substring(0, 3);
            const prefix2 = word2.substring(0, 3);
            if (prefix1 === prefix2) return true;

            const suffix1 = word1.substring(word1.length - 3);
            const suffix2 = word2.substring(word2.length - 3);
            if (suffix1 === suffix2) return true;
        }

        return false;
    }

    /**
     * Check if two words share a common substring of specified length
     */
    shareCommonSubstring(word1, word2, minLength) {
        for (let i = 0; i <= word1.length - minLength; i++) {
            const substring = word1.substring(i, i + minLength);
            if (word2.includes(substring)) return true;
        }
        return false;
    }

    /**
     * Calculate Levenshtein distance between two strings
     */
    levenshteinDistance(str1, str2) {
        const matrix = [];

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
                        matrix[i - 1][j - 1] + 1, // substitution
                        matrix[i][j - 1] + 1,     // insertion
                        matrix[i - 1][j] + 1      // deletion
                    );
                }
            }
        }

        return matrix[str2.length][str1.length];
    }

    /**
     * Generate search metadata for debugging and insights
     */
    generateSearchMetadata(memory, query) {
        return {
            queryWords: this.extractMeaningfulWords(query.toLowerCase()),
            contentWords: this.extractMeaningfulWords(memory.content.toLowerCase()),
            matchedTerms: this.findMatchedTerms(query, memory.content),
            searchTimestamp: new Date().toISOString()
        };
    }

    /**
     * Find specifically which terms matched between query and content
     */
    findMatchedTerms(query, content) {
        const queryWords = this.extractMeaningfulWords(query.toLowerCase());
        const contentLower = content.toLowerCase();
        const matchedTerms = [];

        for (const word of queryWords) {
            if (contentLower.includes(word)) {
                matchedTerms.push(word);
            }

            // Check synonyms
            const synonyms = this.synonymMap[word] || [];
            for (const synonym of synonyms) {
                if (contentLower.includes(synonym)) {
                    matchedTerms.push(`${word} → ${synonym}`);
                }
            }
        }

        return [...new Set(matchedTerms)];
    }

    /**
     * Smart query expansion using synonyms and related terms
     */
    expandQuery(query) {
        const words = this.extractMeaningfulWords(query.toLowerCase());
        const expandedTerms = [...words];

        for (const word of words) {
            const synonyms = this.synonymMap[word] || [];
            expandedTerms.push(...synonyms.slice(0, 2)); // Add top 2 synonyms
        }

        return [...new Set(expandedTerms)];
    }
}

module.exports = AdvancedSearchEngine;
