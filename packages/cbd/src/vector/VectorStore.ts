/**
 * CBD Vector Store Implementation
 * High-performance vector storage and similarity search
 */

import { VectorStore, VectorSearchOptions, VectorSearchResult } from '../types/index.js';

export class FaissVectorStore implements VectorStore {
    private index: any; // Will be initialized with faiss-node
    private metadata: Map<string, Record<string, any>> = new Map();
    private dimensions: number;
    private initialized = false;

    constructor(dimensions: number = 1536) {
        this.dimensions = dimensions;
    }

    async initialize(): Promise<void> {
        try {
            // For now, use the in-memory vector store until FAISS integration is properly set up
            this.index = new InMemoryVectorIndex(this.dimensions);
            console.log(`🔍 Initialized in-memory vector store with ${this.dimensions} dimensions`);

            this.initialized = true;
        } catch (error) {
            console.error('Failed to initialize vector store:', error);
            this.index = new InMemoryVectorIndex(this.dimensions);
            this.initialized = true;
        }
    }

    async addVector(id: string, vector: Float32Array, metadata?: Record<string, any>): Promise<void> {
        if (!this.initialized) await this.initialize();

        if (vector.length !== this.dimensions) {
            throw new Error(`Vector dimension mismatch: expected ${this.dimensions}, got ${vector.length}`);
        }

        try {
            if (this.index.add) {
                // FAISS implementation
                this.index.add(vector);
            } else {
                // Fallback implementation
                this.index.addVector(id, vector);
            }

            if (metadata) {
                this.metadata.set(id, metadata);
            }
        } catch (error) {
            throw new Error(`Failed to add vector ${id}: ${error}`);
        }
    }

    async searchSimilar(
        queryVector: Float32Array,
        options: VectorSearchOptions = {}
    ): Promise<VectorSearchResult[]> {
        if (!this.initialized) await this.initialize();

        const { topK = 10, minScore = 0.0, includeMetadata = true } = options;

        if (queryVector.length !== this.dimensions) {
            throw new Error(`Query vector dimension mismatch: expected ${this.dimensions}, got ${queryVector.length}`);
        }

        try {
            let results: VectorSearchResult[] = [];

            if (this.index.search) {
                // FAISS implementation
                const searchResults = this.index.search(queryVector, topK);
                results = searchResults.labels.map((label: number, index: number) => ({
                    id: label.toString(),
                    score: searchResults.distances[index],
                    metadata: includeMetadata ? this.metadata.get(label.toString()) : undefined
                }));
            } else {
                // Fallback implementation
                results = this.index.search(queryVector, topK, minScore);
                if (includeMetadata) {
                    results = results.map(result => ({
                        ...result,
                        metadata: this.metadata.get(result.id) || undefined
                    }));
                }
            }

            return results.filter(r => r.score >= minScore);
        } catch (error) {
            throw new Error(`Vector search failed: ${error}`);
        }
    }

    async removeVector(id: string): Promise<boolean> {
        if (!this.initialized) await this.initialize();

        try {
            this.metadata.delete(id);
            // Note: FAISS doesn't support easy removal, would need index rebuilding
            // For now, just remove metadata
            return true;
        } catch (error) {
            console.error(`Failed to remove vector ${id}:`, error);
            return false;
        }
    }

    async getVector(_id: string): Promise<Float32Array | null> {
        if (!this.initialized) await this.initialize();

        // This would require storing vectors separately for retrieval
        // FAISS doesn't provide easy vector retrieval by ID
        return null;
    }
}

/**
 * Fallback in-memory vector store for when FAISS is not available
 */
class InMemoryVectorIndex {
    private vectors: Map<string, Float32Array> = new Map();
    private dimensions: number;

    constructor(dimensions: number) {
        this.dimensions = dimensions;
        console.log(`📋 Initialized in-memory vector index with ${dimensions} dimensions`);
    }

    addVector(id: string, vector: Float32Array): void {
        this.vectors.set(id, vector);
    }

    search(queryVector: Float32Array, topK: number, minScore: number = 0.0): VectorSearchResult[] {
        const results: VectorSearchResult[] = [];

        for (const [id, vector] of this.vectors.entries()) {
            const score = this.cosineSimilarity(queryVector, vector);
            if (score >= minScore) {
                results.push({ id, score, metadata: undefined });
            }
        }

        return results
            .sort((a, b) => b.score - a.score)
            .slice(0, topK);
    }

    private cosineSimilarity(a: Float32Array, b: Float32Array): number {
        if (a.length !== b.length || a.length !== this.dimensions) return 0;

        let dotProduct = 0;
        let normA = 0;
        let normB = 0;

        for (let i = 0; i < a.length; i++) {
            const aVal = a[i];
            const bVal = b[i];
            if (aVal !== undefined && bVal !== undefined) {
                dotProduct += aVal * bVal;
                normA += aVal * aVal;
                normB += bVal * bVal;
            }
        }

        if (normA === 0 || normB === 0) return 0;

        return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
    }
}

export { InMemoryVectorIndex };
