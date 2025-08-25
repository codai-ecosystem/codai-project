// Class-based module\nexport interface ModuleConfig {\n  [key: string]: any;\n}\n\n/**
 * MemorAI MCP Server - Enhanced with Azure OpenAI Embeddings
 * VS Code Compatible with Vector Search & Hybrid Retrieval
 * Date: August 6, 2025
 * Port: 4950
 */

// Remove the problematic import since we don't actually need OpenAI SDK
// We'll use direct HTTP requests instead
require('dotenv').config();

// Azure OpenAI Configuration
const AZURE_OPENAI_CONFIG = {
    endpoint: process.env.AZURE_OPENAI_ENDPOINT || 'https://codai-dev-openai.openai.azure.com/',
    apiKey: process.env.AZURE_OPENAI_API_KEY || '8f9d3fd033c04f5ab6b5886c15f16a2c',
    deploymentName: process.env.AZURE_OPENAI_DEPLOYMENT_NAME || 'text-embedding-3-large',
    apiVersion: process.env.AZURE_OPENAI_API_VERSION || '2024-02-01'
};

/**
 * Azure OpenAI Embeddings Service
 */
class AzureEmbeddingsService {
    constructor() {
        this.enabled = process.env.ENABLE_VECTOR_SEARCH === 'true';
        this.cache = new Map();
        this.cacheTimeout = parseInt(process.env.VECTOR_CACHE_TTL || '3600') * 1000; // 1 hour

        if (this.enabled) {
            console.log('🧠 Azure OpenAI Embeddings Service initialized');
            console.log(`📍 Endpoint: ${AZURE_OPENAI_CONFIG.endpoint}`);
            console.log(`🎯 Model: ${AZURE_OPENAI_CONFIG.deploymentName}`);
        }
    }

    /**
     * Generate embeddings for text content
     */
    async generateEmbeddings(text) {
        if (!this.enabled) {
            return null;
        }

        const cacheKey = this.hashText(text);
        const cached = this.cache.get(cacheKey);

        if (cached && (Date.now() - cached.timestamp) < this.cacheTimeout) {
            return cached.embeddings;
        }

        try {
            const response = await fetch(`${AZURE_OPENAI_CONFIG.endpoint}openai/deployments/${AZURE_OPENAI_CONFIG.deploymentName}/embeddings?api-version=${AZURE_OPENAI_CONFIG.apiVersion}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'api-key': AZURE_OPENAI_CONFIG.apiKey
                },
                body: JSON.stringify({
                    input: text.substring(0, 8192), // Limit input size
                    encoding_format: 'float'
                })
            });

            if (!response.ok) {
                console.warn('⚠️ Azure OpenAI embeddings request failed:', response.status);
                return null;
            }

            const data = await response.json();
            const embeddings = data.data[0].embedding;

            // Cache the result
            this.cache.set(cacheKey, {
                embeddings,
                timestamp: Date.now()
            });

            return embeddings;
        } catch (error) {
            console.error('❌ Azure OpenAI embeddings error:', error.message);
            return null;
        }
    }

    /**
     * Calculate cosine similarity between two embedding vectors
     */
    calculateSimilarity(embeddingA, embeddingB) {
        if (!embeddingA || !embeddingB || embeddingA.length !== embeddingB.length) {
            return 0;
        }

        let dotProduct = 0;
        let magnitudeA = 0;
        let magnitudeB = 0;

        for (let i = 0; i < embeddingA.length; i++) {
            dotProduct += embeddingA[i] * embeddingB[i];
            magnitudeA += embeddingA[i] * embeddingA[i];
            magnitudeB += embeddingB[i] * embeddingB[i];
        }

        magnitudeA = Math.sqrt(magnitudeA);
        magnitudeB = Math.sqrt(magnitudeB);

        if (magnitudeA === 0 || magnitudeB === 0) {
            return 0;
        }

        return dotProduct / (magnitudeA * magnitudeB);
    }

    /**
     * Simple hash function for caching
     */
    hashText(text) {
        let hash = 0;
        for (let i = 0; i < text.length; i++) {
            const char = text.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return hash.toString(36);
    }

    /**
     * Clean up old cache entries
     */
    cleanupCache() {
        const now = Date.now();
        for (const [key, value] of this.cache.entries()) {
            if ((now - value.timestamp) > this.cacheTimeout) {
                this.cache.delete(key);
            }
        }
    }
}

/**
 * Enhanced Search Engine with Vector Similarity
 */
class HybridSearchEngine {
    constructor(embeddingsService) {
        this.embeddingsService = embeddingsService;
        this.enableFuzzySearch = process.env.ENABLE_FUZZY_MATCHING === 'true';
        this.enableHybridSearch = process.env.ENABLE_HYBRID_SEARCH === 'true';

        console.log('🔍 Hybrid Search Engine initialized');
        console.log(`🎯 Vector Search: ${embeddingsService.enabled ? 'Enabled' : 'Disabled'}`);
        console.log(`🎯 Fuzzy Search: ${this.enableFuzzySearch ? 'Enabled' : 'Disabled'}`);
        console.log(`🎯 Hybrid Search: ${this.enableHybridSearch ? 'Enabled' : 'Disabled'}`);
    }

    /**
     * Enhanced search with multiple strategies
     */
    async search(query, memories, options = {}) {
        const startTime = Date.now();
        const results = [];

        // Generate query embeddings if vector search is enabled
        let queryEmbeddings = null;
        if (this.embeddingsService.enabled) {
            queryEmbeddings = await this.embeddingsService.generateEmbeddings(query);
        }

        for (const memory of memories) {
            const scores = {
                keyword: this.calculateKeywordScore(query, memory),
                vector: 0,
                fuzzy: 0,
                metadata: this.calculateMetadataScore(query, memory, options)
            };

            // Vector similarity score
            if (queryEmbeddings && memory.embeddings) {
                scores.vector = this.embeddingsService.calculateSimilarity(queryEmbeddings, memory.embeddings);
            }

            // Fuzzy matching score
            if (this.enableFuzzySearch) {
                scores.fuzzy = this.calculateFuzzyScore(query, memory);
            }

            // Calculate combined score
            const combinedScore = this.calculateCombinedScore(scores, options);

            if (combinedScore > 0.1) { // Minimum threshold
                results.push({
                    ...memory,
                    relevanceScore: combinedScore,
                    scoreBreakdown: scores,
                    searchType: this.getSearchType(scores)
                });
            }
        }

        // Sort by relevance score
        results.sort((a, b) => b.relevanceScore - a.relevanceScore);

        const searchTime = Date.now() - startTime;

        return {
            memories: results.slice(0, options.limit || 10),
            totalCount: results.length,
            searchType: this.getOverallSearchType(queryEmbeddings),
            queryAnalysis: this.analyzeQuery(query),
            performanceMetrics: {
                searchTime,
                vectorSearchUsed: !!queryEmbeddings,
                memoriesProcessed: memories.length
            }
        };
    }

    /**
     * Calculate keyword-based relevance score (TF-IDF-like)
     */
    calculateKeywordScore(query, memory) {
        const queryTerms = query.toLowerCase().split(/\s+/);
        const contentTerms = memory.content.toLowerCase().split(/\s+/);
        const titleTerms = (memory.title || '').toLowerCase().split(/\s+/);

        let score = 0;

        for (const term of queryTerms) {
            // Count occurrences in content
            const contentMatches = contentTerms.filter(t => t.includes(term)).length;
            const titleMatches = titleTerms.filter(t => t.includes(term)).length;

            // Weight title matches higher
            score += (contentMatches * 1) + (titleMatches * 2);
        }

        // Normalize by content length
        return score / Math.max(contentTerms.length, 1);
    }

    /**
     * Calculate fuzzy matching score using Levenshtein distance
     */
    calculateFuzzyScore(query, memory) {
        const queryWords = query.toLowerCase().split(/\s+/);
        const contentWords = memory.content.toLowerCase().split(/\s+/);

        let totalScore = 0;
        let matches = 0;

        for (const queryWord of queryWords) {
            let bestScore = 0;
            for (const contentWord of contentWords) {
                const similarity = this.calculateStringSimilarity(queryWord, contentWord);
                bestScore = Math.max(bestScore, similarity);
            }
            if (bestScore > 0.7) { // Threshold for fuzzy matches
                totalScore += bestScore;
                matches++;
            }
        }

        return matches > 0 ? totalScore / queryWords.length : 0;
    }

    /**
     * Calculate string similarity using normalized Levenshtein distance
     */
    calculateStringSimilarity(str1, str2) {
        const maxLength = Math.max(str1.length, str2.length);
        if (maxLength === 0) return 1;

        const distance = this.levenshteinDistance(str1, str2);
        return (maxLength - distance) / maxLength;
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
     * Calculate metadata-based score
     */
    calculateMetadataScore(query, memory, options) {
        let score = 0;

        // Project filter
        if (options.project && memory.metadata?.project === options.project) {
            score += 0.2;
        }

        // Session filter
        if (options.session && memory.metadata?.session === options.session) {
            score += 0.2;
        }

        // Importance score
        if (memory.metadata?.importance) {
            score += memory.metadata.importance / 10 * 0.1; // Scale 0-1 to 0-0.1
        }

        // Recency boost
        if (memory.timestamp) {
            const ageInDays = (Date.now() - new Date(memory.timestamp).getTime()) / (1000 * 60 * 60 * 24);
            const recencyScore = Math.max(0, (30 - ageInDays) / 30 * 0.1); // Boost for recent memories
            score += recencyScore;
        }

        return score;
    }

    /**
     * Combine different scoring methods
     */
    calculateCombinedScore(scores, options) {
        if (this.enableHybridSearch) {
            // Weighted combination of all scores
            return (
                scores.keyword * 0.4 +
                scores.vector * 0.4 +
                scores.fuzzy * 0.1 +
                scores.metadata * 0.1
            );
        } else if (scores.vector > 0) {
            // Prefer vector search if available
            return scores.vector * 0.7 + scores.keyword * 0.2 + scores.metadata * 0.1;
        } else {
            // Fallback to keyword + fuzzy search
            return scores.keyword * 0.7 + scores.fuzzy * 0.2 + scores.metadata * 0.1;
        }
    }

    /**
     * Determine search type used for a result
     */
    getSearchType(scores) {
        if (scores.vector > 0.5) return 'vector';
        if (scores.keyword > 0.3) return 'keyword';
        if (scores.fuzzy > 0.3) return 'fuzzy';
        return 'metadata';
    }

    /**
     * Determine overall search type
     */
    getOverallSearchType(queryEmbeddings) {
        if (this.enableHybridSearch) return 'hybrid';
        if (queryEmbeddings) return 'vector';
        if (this.enableFuzzySearch) return 'fuzzy';
        return 'keyword';
    }

    /**
     * Analyze query characteristics
     */
    analyzeQuery(query) {
        const analysis = {
            length: query.length,
            wordCount: query.split(/\s+/).length,
            hasQuotes: query.includes('"'),
            hasSpecialChars: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(query)
        };

        if (analysis.wordCount === 1) {
            return 'Single term search';
        } else if (analysis.hasQuotes) {
            return 'Phrase search detected';
        } else if (analysis.wordCount > 5) {
            return 'Long query - using semantic search';
        } else {
            return 'Multi-term search';
        }
    }
}

export default {
    AzureEmbeddingsService,
    HybridSearchEngine
};

