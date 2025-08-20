/**
 * Vector Storage Engine - AI embeddings and similarity search
 * Part of CBD Universal Database Phase 2
 */

import { EventEmitter } from 'events';

export interface VectorRecord {
  id: string;
  vector: number[];
  metadata: Record<string, any>;
  norm?: number;
  timestamp: Date;
}

export interface SimilarityResult {
  id: string;
  score: number;
  vector: number[];
  metadata: Record<string, any>;
  distance: number;
}

export interface VectorIndex {
  name: string;
  dimensions: number;
  algorithm: 'cosine' | 'euclidean' | 'dot_product' | 'hamming';
  vectors: Map<string, VectorRecord>;
  indexStructure?: any; // For advanced indexing like FAISS
}

export interface VectorSearchOptions {
  limit?: number;
  threshold?: number;
  includeMetadata?: boolean;
  filters?: Record<string, any>;
}

export interface HybridResult extends SimilarityResult {
  textScore?: number;
  combinedScore: number;
}

export interface VectorStats {
  totalVectors: number;
  dimensions: number;
  indexSize: number;
  averageNorm: number;
  searchLatency: {
    p50: number;
    p95: number;
    p99: number;
  };
}

export class VectorStorageEngine extends EventEmitter {
  private indexes: Map<string, VectorIndex> = new Map();
  private defaultIndex: string = 'default';
  private stats: Map<string, number[]> = new Map(); // For latency tracking

  constructor() {
    super();
  }

  /**
   * Initialize method for CBD service compatibility
   */
  async initialize(): Promise<void> {
    // Don't create default index with fixed dimensions
    // Will be created dynamically when first vector is stored
    this.emit('engine:initialized', { type: 'vector' });
  }

  // Search method for compatibility with CBD service
  async search(collection: string, vector: number[], options: VectorSearchOptions = {}): Promise<SimilarityResult[]> {
    return this.findSimilar(vector, options, collection);
  }

  /**
   * Insert method for CBD service compatibility
   */
  async insert(id: string, vector: number[], metadata?: Record<string, any>): Promise<any> {
    const vectorId = id || `vector_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    await this.storeVector(vectorId, vector, metadata || {});

    return {
      id: vectorId,
      vector: vector,
      metadata: metadata || {},
      timestamp: new Date(),
      similarity: 1.0
    };
  }

  /**
   * Store a vector with metadata
   */
  async storeVector(
    id: string,
    vector: number[],
    metadata: Record<string, any> = {},
    indexName: string = this.defaultIndex
  ): Promise<void> {
    try {
      const index = this.getOrCreateIndex(indexName, vector.length);

      // Validate vector dimensions
      if (vector.length !== index.dimensions) {
        throw new Error(`Vector dimensions ${vector.length} don't match index dimensions ${index.dimensions}`);
      }

      // Calculate vector norm for optimization
      const norm = this.calculateNorm(vector);

      const record: VectorRecord = {
        id,
        vector,
        metadata,
        norm,
        timestamp: new Date()
      };

      // Store in index
      index.vectors.set(id, record);

      this.emit('vector:stored', { indexName, id, dimensions: vector.length });

    } catch (error) {
      this.emit('vector:error', { operation: 'store', id, indexName, error });
      throw error;
    }
  }

  /**
   * Store multiple vectors in batch
   */
  async storeVectorsBatch(
    vectors: Array<{ id: string; vector: number[]; metadata?: Record<string, any> }>,
    indexName: string = this.defaultIndex
  ): Promise<void> {
    const startTime = Date.now();

    for (const { id, vector, metadata = {} } of vectors) {
      await this.storeVector(id, vector, metadata, indexName);
    }

    const duration = Date.now() - startTime;
    this.emit('vector:batchStored', {
      indexName,
      count: vectors.length,
      duration,
      throughput: vectors.length / (duration / 1000)
    });
  }

  /**
   * Find similar vectors using various similarity metrics
   */
  async findSimilar(
    queryVector: number[],
    options: VectorSearchOptions = {},
    indexName: string = this.defaultIndex
  ): Promise<SimilarityResult[]> {
    const startTime = Date.now();

    try {
      const index = this.indexes.get(indexName);
      if (!index) {
        throw new Error(`Index ${indexName} not found`);
      }

      if (queryVector.length !== index.dimensions) {
        throw new Error(`Query vector dimensions ${queryVector.length} don't match index dimensions ${index.dimensions}`);
      }

      const {
        limit = 10,
        threshold = 0.0,
        includeMetadata = true,
        filters = {}
      } = options;

      const results: SimilarityResult[] = [];
      const queryNorm = this.calculateNorm(queryVector);

      // Calculate similarity for each vector
      for (const [id, record] of index.vectors) {
        // Apply metadata filters
        if (!this.matchesFilters(record.metadata, filters)) {
          continue;
        }

        const similarity = this.calculateSimilarity(
          queryVector,
          record.vector,
          index.algorithm,
          queryNorm,
          record.norm
        );

        if (similarity >= threshold) {
          results.push({
            id,
            score: similarity,
            vector: record.vector,
            metadata: includeMetadata ? record.metadata : {},
            distance: 1 - similarity
          });
        }
      }

      // Sort by similarity (descending) and limit results
      results.sort((a, b) => b.score - a.score);
      const limitedResults = results.slice(0, limit);

      const duration = Date.now() - startTime;
      this.trackLatency(indexName, duration);

      this.emit('vector:searched', {
        indexName,
        resultCount: limitedResults.length,
        duration,
        threshold
      });

      return limitedResults;

    } catch (error) {
      this.emit('vector:error', { operation: 'search', indexName, error });
      throw error;
    }
  }

  /**
   * Hybrid search combining vector similarity and metadata filtering
   */
  async hybridSearch(
    queryVector: number[],
    textQuery?: string,
    options: VectorSearchOptions & { textWeight?: number; vectorWeight?: number } = {},
    indexName: string = this.defaultIndex
  ): Promise<HybridResult[]> {
    const {
      textWeight = 0.3,
      vectorWeight = 0.7,
      limit = 10
    } = options;

    // Get vector similarity results
    const vectorResults = await this.findSimilar(queryVector, options, indexName);

    const hybridResults: HybridResult[] = vectorResults.map(result => {
      let textScore = 0;

      // Simple text similarity if text query provided
      if (textQuery && result.metadata.text) {
        textScore = this.calculateTextSimilarity(textQuery, result.metadata.text);
      }

      const combinedScore = (result.score * vectorWeight) + (textScore * textWeight);

      return {
        ...result,
        textScore,
        combinedScore
      };
    });

    // Re-sort by combined score
    hybridResults.sort((a, b) => b.combinedScore - a.combinedScore);

    return hybridResults.slice(0, limit);
  }

  /**
   * Update a vector and its metadata
   */
  async updateVector(
    id: string,
    vector: number[],
    metadata: Record<string, any> = {},
    indexName: string = this.defaultIndex
  ): Promise<void> {
    try {
      const index = this.indexes.get(indexName);
      if (!index) {
        throw new Error(`Index ${indexName} not found`);
      }

      if (!index.vectors.has(id)) {
        throw new Error(`Vector ${id} not found in index ${indexName}`);
      }

      await this.storeVector(id, vector, metadata, indexName);

      this.emit('vector:updated', { indexName, id });

    } catch (error) {
      this.emit('vector:error', { operation: 'update', id, indexName, error });
      throw error;
    }
  }

  /**
   * Delete a vector from the index
   */
  async deleteVector(id: string, indexName: string = this.defaultIndex): Promise<boolean> {
    try {
      const index = this.indexes.get(indexName);
      if (!index) {
        return false;
      }

      const deleted = index.vectors.delete(id);

      if (deleted) {
        this.emit('vector:deleted', { indexName, id });
      }

      return deleted;

    } catch (error) {
      this.emit('vector:error', { operation: 'delete', id, indexName, error });
      throw error;
    }
  }

  /**
   * Create a new vector index
   */
  async createVectorIndex(
    name: string,
    dimensions: number,
    algorithm: 'cosine' | 'euclidean' | 'dot_product' | 'hamming' = 'cosine'
  ): Promise<void> {
    try {
      if (this.indexes.has(name)) {
        throw new Error(`Index ${name} already exists`);
      }

      const index: VectorIndex = {
        name,
        dimensions,
        algorithm,
        vectors: new Map()
      };

      this.indexes.set(name, index);

      this.emit('index:created', { name, dimensions, algorithm });

    } catch (error) {
      this.emit('index:error', { operation: 'create', name, error });
      throw error;
    }
  }

  /**
   * Drop a vector index
   */
  async dropVectorIndex(name: string): Promise<void> {
    if (name === this.defaultIndex) {
      throw new Error('Cannot drop default index');
    }

    const deleted = this.indexes.delete(name);

    if (deleted) {
      this.emit('index:dropped', { name });
    }
  }

  /**
   * Get vector by ID
   */
  async getVector(id: string, indexName: string = this.defaultIndex): Promise<VectorRecord | null> {
    const index = this.indexes.get(indexName);
    if (!index) {
      return null;
    }

    return index.vectors.get(id) || null;
  }

  /**
   * Get index statistics
   */
  async getIndexStats(indexName: string = this.defaultIndex): Promise<VectorStats | null> {
    const index = this.indexes.get(indexName);
    if (!index) {
      return null;
    }

    const vectors = Array.from(index.vectors.values());
    const totalVectors = vectors.length;
    const averageNorm = totalVectors > 0
      ? vectors.reduce((sum, v) => sum + (v.norm || 0), 0) / totalVectors
      : 0;

    const latencies = this.stats.get(indexName) || [];
    const sortedLatencies = latencies.slice().sort((a, b) => a - b);

    return {
      totalVectors,
      dimensions: index.dimensions,
      indexSize: totalVectors * index.dimensions * 8, // Estimated bytes
      averageNorm,
      searchLatency: {
        p50: this.percentile(sortedLatencies, 0.5),
        p95: this.percentile(sortedLatencies, 0.95),
        p99: this.percentile(sortedLatencies, 0.99)
      }
    };
  }

  /**
   * List all vector indexes
   */
  async listIndexes(): Promise<string[]> {
    return Array.from(this.indexes.keys());
  }

  /**
   * Bulk delete vectors by metadata filter
   */
  async deleteByFilter(
    filters: Record<string, any>,
    indexName: string = this.defaultIndex
  ): Promise<number> {
    const index = this.indexes.get(indexName);
    if (!index) {
      return 0;
    }

    let deletedCount = 0;
    const toDelete: string[] = [];

    for (const [id, record] of index.vectors) {
      if (this.matchesFilters(record.metadata, filters)) {
        toDelete.push(id);
      }
    }

    for (const id of toDelete) {
      if (index.vectors.delete(id)) {
        deletedCount++;
      }
    }

    this.emit('vector:bulkDeleted', { indexName, deletedCount, filters });
    return deletedCount;
  }

  // Private helper methods
  private getOrCreateIndex(name: string, dimensions: number): VectorIndex {
    if (!this.indexes.has(name)) {
      this.indexes.set(name, {
        name,
        dimensions,
        algorithm: 'cosine',
        vectors: new Map()
      });
      this.emit('index:created', { name, dimensions });
    }
    return this.indexes.get(name)!;
  }

  private calculateNorm(vector: number[]): number {
    return Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
  }

  private calculateSimilarity(
    vector1: number[],
    vector2: number[],
    algorithm: string,
    norm1?: number,
    norm2?: number
  ): number {
    switch (algorithm) {
      case 'cosine':
        return this.cosineSimilarity(vector1, vector2, norm1, norm2);
      case 'euclidean':
        return this.euclideanSimilarity(vector1, vector2);
      case 'dot_product':
        return this.dotProduct(vector1, vector2);
      default:
        return this.cosineSimilarity(vector1, vector2, norm1, norm2);
    }
  }

  private cosineSimilarity(
    vector1: number[],
    vector2: number[],
    norm1?: number,
    norm2?: number
  ): number {
    const dot = this.dotProduct(vector1, vector2);
    const normA = norm1 || this.calculateNorm(vector1);
    const normB = norm2 || this.calculateNorm(vector2);

    if (normA === 0 || normB === 0) return 0;
    return dot / (normA * normB);
  }

  private euclideanSimilarity(vector1: number[], vector2: number[]): number {
    let sum = 0;
    for (let i = 0; i < vector1.length; i++) {
      const diff = (vector1[i] || 0) - (vector2[i] || 0);
      sum += diff * diff;
    }
    // Convert distance to similarity (closer = higher similarity)
    return 1 / (1 + Math.sqrt(sum));
  }

  private dotProduct(vector1: number[], vector2: number[]): number {
    let sum = 0;
    for (let i = 0; i < vector1.length; i++) {
      sum += (vector1[i] || 0) * (vector2[i] || 0);
    }
    return sum;
  }

  private matchesFilters(metadata: Record<string, any>, filters: Record<string, any>): boolean {
    for (const [key, value] of Object.entries(filters)) {
      if (metadata[key] !== value) {
        return false;
      }
    }
    return true;
  }

  private calculateTextSimilarity(query: string, text: string): number {
    // Simple text similarity using word overlap
    const queryWords = new Set(query.toLowerCase().split(/\s+/));
    const textWords = new Set(text.toLowerCase().split(/\s+/));

    const intersection = new Set([...queryWords].filter(x => textWords.has(x)));
    const union = new Set([...queryWords, ...textWords]);

    return intersection.size / union.size; // Jaccard similarity
  }

  private trackLatency(indexName: string, duration: number): void {
    if (!this.stats.has(indexName)) {
      this.stats.set(indexName, []);
    }

    const latencies = this.stats.get(indexName)!;
    latencies.push(duration);

    // Keep only last 1000 measurements
    if (latencies.length > 1000) {
      latencies.splice(0, latencies.length - 1000);
    }
  }

  private percentile(sortedArray: number[], p: number): number {
    if (sortedArray.length === 0) return 0;
    const index = Math.ceil(sortedArray.length * p) - 1;
    return sortedArray[Math.max(0, index)] || 0;
  }
}
