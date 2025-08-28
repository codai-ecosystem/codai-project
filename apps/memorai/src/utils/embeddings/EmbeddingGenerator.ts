/**
 * EmbeddingGenerator - Text-to-vector conversion for semantic search
 * Supports both OpenAI embeddings and local alternatives
 */

import { memoraiMCPClient } from '../memorai-mcp-client';

export interface EmbeddingConfig {
    provider: 'openai' | 'local' | 'transformers';
    model?: string;
    dimensions?: number;
    apiKey?: string;
}

export interface EmbeddingResult {
    vector: number[];
    dimensions: number;
    model: string;
    tokenCount: number;
}

export interface SimilarityResult {
    score: number;
    memory: any;
    explanation?: string;
}

export class EmbeddingGenerator {
    private config: EmbeddingConfig;
    private cache: Map<string, EmbeddingResult> = new Map();

    constructor(config: EmbeddingConfig = { provider: 'local' }) {
        this.config = {
            ...config,
            provider: config.provider || 'local',
            model: config.model || 'all-MiniLM-L6-v2',
            dimensions: config.dimensions || 384
        };
    }

    /**
     * Generate embeddings for text content
     */
    async generateEmbedding(text: string): Promise<EmbeddingResult> {
        if (!text || text.trim().length === 0) {
            throw new Error('Text content is required for embedding generation');
        }

        // Check cache first
        const cacheKey = this.createCacheKey(text);
        if (this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey)!;
        }

        let result: EmbeddingResult;

        switch (this.config.provider) {
            case 'openai':
                result = await this.generateOpenAIEmbedding(text);
                break;
            case 'local':
                result = await this.generateLocalEmbedding(text);
                break;
            case 'transformers':
                result = await this.generateTransformersEmbedding(text);
                break;
            default:
                throw new Error(`Unsupported embedding provider: ${this.config.provider}`);
        }

        // Cache the result
        this.cache.set(cacheKey, result);

        return result;
    }

    /**
     * Generate embeddings using OpenAI API
     */
    private async generateOpenAIEmbedding(text: string): Promise<EmbeddingResult> {
        if (!this.config.apiKey) {
            throw new Error('OpenAI API key is required for OpenAI embeddings');
        }

        try {
            const response = await fetch('https://api.openai.com/v1/embeddings', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.config.apiKey}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    input: text,
                    model: this.config.model || 'text-embedding-ada-002',
                }),
            });

            if (!response.ok) {
                throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            const embedding = data.data[0];

            return {
                vector: embedding.embedding,
                dimensions: embedding.embedding.length,
                model: this.config.model || 'text-embedding-ada-002',
                tokenCount: data.usage.total_tokens,
            };
        } catch (error) {
            console.error('OpenAI embedding generation failed:', error);
            throw error;
        }
    }

    /**
     * Generate embeddings using local model (simplified implementation)
     * In production, this would use a local ML model like Sentence Transformers
     */
    private async generateLocalEmbedding(text: string): Promise<EmbeddingResult> {
        // Simplified local embedding using basic text features
        // In production, replace with actual ML model inference
        const words = text.toLowerCase().split(/\s+/);
        const vector = this.createSimpleTextVector(words);

        return {
            vector,
            dimensions: vector.length,
            model: this.config.model || 'local-simple',
            tokenCount: words.length,
        };
    }

    /**
     * Generate embeddings using Transformers.js (client-side ML)
     */
    private async generateTransformersEmbedding(text: string): Promise<EmbeddingResult> {
        // This would integrate with @xenova/transformers for client-side ML
        // For now, fallback to local embedding
        return this.generateLocalEmbedding(text);
    }

    /**
     * Create a simple text vector based on word frequencies and semantic features
     */
    private createSimpleTextVector(words: string[]): number[] {
        const vector = new Array(this.config.dimensions || 384).fill(0);

        // Basic text features
        const wordCount = words.length;
        const uniqueWords = new Set(words).size;
        const avgWordLength = words.reduce((sum, word) => sum + word.length, 0) / wordCount;

        // Common technical terms for relevance scoring
        const techTerms = [
            'api', 'database', 'server', 'client', 'react', 'typescript', 'javascript',
            'node', 'express', 'mongodb', 'sql', 'json', 'rest', 'graphql', 'web',
            'mobile', 'app', 'component', 'service', 'function', 'class', 'interface',
            'async', 'await', 'promise', 'callback', 'event', 'handler', 'middleware',
            'authentication', 'authorization', 'security', 'encryption', 'token',
            'deployment', 'production', 'development', 'testing', 'debugging',
            'performance', 'optimization', 'scaling', 'monitoring', 'logging'
        ];

        // Project-specific terms
        const projectTerms = [
            'memorai', 'memory', 'recall', 'remember', 'agent', 'mcp', 'cbd',
            'intelligence', 'ai', 'ml', 'nlp', 'embedding', 'vector', 'semantic',
            'search', 'query', 'filter', 'tag', 'category', 'importance', 'project'
        ];

        // Fill vector with computed features
        let index = 0;

        // Basic statistics (first 10 dimensions)
        if (index < vector.length) vector[index++] = Math.min(wordCount / 100, 1);
        if (index < vector.length) vector[index++] = uniqueWords / wordCount;
        if (index < vector.length) vector[index++] = Math.min(avgWordLength / 10, 1);
        if (index < vector.length) vector[index++] = words.filter(w => w.length > 8).length / wordCount;
        if (index < vector.length) vector[index++] = words.filter(w => /[A-Z]/.test(w)).length / wordCount;
        if (index < vector.length) vector[index++] = words.filter(w => /\d/.test(w)).length / wordCount;
        if (index < vector.length) vector[index++] = words.filter(w => w.includes('_')).length / wordCount;
        if (index < vector.length) vector[index++] = words.filter(w => w.includes('-')).length / wordCount;
        if (index < vector.length) vector[index++] = words.filter(w => w.includes('.')).length / wordCount;
        if (index < vector.length) vector[index++] = words.filter(w => /[!@#$%^&*()]/.test(w)).length / wordCount;

        // Technical terms presence (next 50 dimensions)
        for (let i = 0; i < Math.min(techTerms.length, 50) && index < vector.length; i++) {
            const term = techTerms[i];
            const count = words.filter(word => word.includes(term)).length;
            vector[index++] = Math.min(count / wordCount * 10, 1);
        }

        // Project terms presence (next 30 dimensions)
        for (let i = 0; i < Math.min(projectTerms.length, 30) && index < vector.length; i++) {
            const term = projectTerms[i];
            const count = words.filter(word => word.includes(term)).length;
            vector[index++] = Math.min(count / wordCount * 10, 1);
        }

        // Word position features (remaining dimensions)
        const positions = ['start', 'middle', 'end'];
        for (let pos = 0; pos < positions.length && index < vector.length - 50; pos++) {
            const positionWords = this.getWordsAtPosition(words, positions[pos]);
            for (let i = 0; i < Math.min(positionWords.length, 50) && index < vector.length; i++) {
                vector[index++] = positionWords[i].length / 20;
            }
        }

        // Fill remaining dimensions with normalized word hash values
        while (index < vector.length) {
            const wordIndex = index % words.length;
            const word = words[wordIndex];
            vector[index++] = this.hashString(word) / 1000000;
        }

        return vector;
    }

    /**
     * Calculate cosine similarity between two vectors
     */
    calculateCosineSimilarity(vectorA: number[], vectorB: number[]): number {
        if (vectorA.length !== vectorB.length) {
            throw new Error('Vectors must have the same dimensions');
        }

        let dotProduct = 0;
        let normA = 0;
        let normB = 0;

        for (let i = 0; i < vectorA.length; i++) {
            dotProduct += vectorA[i] * vectorB[i];
            normA += vectorA[i] * vectorA[i];
            normB += vectorB[i] * vectorB[i];
        }

        normA = Math.sqrt(normA);
        normB = Math.sqrt(normB);

        if (normA === 0 || normB === 0) {
            return 0;
        }

        return dotProduct / (normA * normB);
    }

    /**
     * Find similar memories based on semantic similarity
     */
    async findSimilarMemories(
        queryText: string,
        memories: any[],
        threshold: number = 0.5,
        limit: number = 10
    ): Promise<SimilarityResult[]> {
        if (!queryText || memories.length === 0) {
            return [];
        }

        try {
            // Generate embedding for query
            const queryEmbedding = await this.generateEmbedding(queryText);

            const similarities: SimilarityResult[] = [];

            // Calculate similarity for each memory
            for (const memory of memories) {
                try {
                    const memoryEmbedding = await this.generateEmbedding(memory.content);
                    const similarity = this.calculateCosineSimilarity(
                        queryEmbedding.vector,
                        memoryEmbedding.vector
                    );

                    if (similarity >= threshold) {
                        similarities.push({
                            score: similarity,
                            memory,
                            explanation: this.generateSimilarityExplanation(similarity, queryText, memory.content)
                        });
                    }
                } catch (error) {
                    console.warn(`Failed to process memory ${memory.structuredKey}:`, error);
                }
            }

            // Sort by similarity score (descending) and limit results
            similarities.sort((a, b) => b.score - a.score);
            return similarities.slice(0, limit);

        } catch (error) {
            console.error('Semantic similarity search failed:', error);
            throw error;
        }
    }

    /**
     * Generate explanation for similarity score
     */
    private generateSimilarityExplanation(score: number, query: string, content: string): string {
        const percentage = Math.round(score * 100);

        if (score > 0.8) {
            return `Highly relevant (${percentage}%) - Strong semantic match with your query`;
        } else if (score > 0.6) {
            return `Very relevant (${percentage}%) - Good contextual similarity`;
        } else if (score > 0.4) {
            return `Moderately relevant (${percentage}%) - Some related concepts`;
        } else {
            return `Somewhat relevant (${percentage}%) - Partial keyword or topic match`;
        }
    }

    /**
     * Get words at specific position (start, middle, end)
     */
    private getWordsAtPosition(words: string[], position: string): string[] {
        const length = words.length;
        switch (position) {
            case 'start':
                return words.slice(0, Math.min(10, length));
            case 'middle':
                const midStart = Math.max(0, Math.floor(length / 2) - 5);
                return words.slice(midStart, midStart + 10);
            case 'end':
                return words.slice(Math.max(0, length - 10));
            default:
                return [];
        }
    }

    /**
     * Simple string hash function
     */
    private hashString(str: string): number {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return Math.abs(hash);
    }

    /**
     * Create cache key for embedding
     */
    private createCacheKey(text: string): string {
        return `${this.config.provider}-${this.config.model}-${this.hashString(text)}`;
    }

    /**
     * Clear embedding cache
     */
    clearCache(): void {
        this.cache.clear();
    }

    /**
     * Get cache statistics
     */
    getCacheStats(): { size: number; hitRate: number } {
        return {
            size: this.cache.size,
            hitRate: 0 // TODO: Implement hit rate tracking
        };
    }

    /**
     * Batch generate embeddings for multiple texts
     */
    async batchGenerateEmbeddings(texts: string[]): Promise<EmbeddingResult[]> {
        const results: EmbeddingResult[] = [];

        // Process in batches to avoid overwhelming the API/system
        const batchSize = 10;
        for (let i = 0; i < texts.length; i += batchSize) {
            const batch = texts.slice(i, i + batchSize);
            const batchPromises = batch.map(text => this.generateEmbedding(text));
            const batchResults = await Promise.all(batchPromises);
            results.push(...batchResults);
        }

        return results;
    }

    /**
     * Suggest query expansions based on semantic similarity
     */
    async suggestQueryExpansions(query: string, memories: any[]): Promise<string[]> {
        const suggestions: string[] = [];

        // Find most similar memories
        const similar = await this.findSimilarMemories(query, memories, 0.3, 5);

        // Extract common terms from similar memories
        const commonTerms = new Set<string>();
        similar.forEach(result => {
            const words = result.memory.content.toLowerCase().split(/\s+/);
            words.forEach((word: string) => {
                if (word.length > 3 && !query.toLowerCase().includes(word)) {
                    commonTerms.add(word);
                }
            });
        });

        // Convert to suggestions
        Array.from(commonTerms).slice(0, 5).forEach(term => {
            suggestions.push(`${query} ${term}`);
        });

        return suggestions;
    }
}

// Export singleton instance
export const embeddingGenerator = new EmbeddingGenerator();
