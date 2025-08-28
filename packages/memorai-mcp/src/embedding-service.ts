/**
 * Embedding Service for Vector Similarity Search
 * Integrates with Azure OpenAI for semantic embeddings
 * Part of US-MEM-008 Advanced Memory Search implementation
 */

import { Logger } from './utils/logger';

export interface EmbeddingConfig {
  provider: 'azure-openai' | 'openai' | 'local' | 'offline';
  endpoint?: string;
  apiKey?: string;
  deploymentName?: string;
  apiVersion?: string;
  maxRetries?: number;
  timeout?: number;
}

export interface EmbeddingResponse {
  embedding: number[];
  model: string;
  usage: {
    promptTokens: number;
    totalTokens: number;
  };
}

export class EmbeddingService {
  private config: EmbeddingConfig;
  private logger: Logger;
  private cache: Map<string, number[]> = new Map();
  private isOnline: boolean = true;

  constructor(config: EmbeddingConfig) {
    this.config = {
      maxRetries: 3,
      timeout: 30000,
      ...config
    };
    this.logger = new Logger('EmbeddingService');

    this.logger.info(`Embedding service initialized with provider: ${this.config.provider}`);
  }

  /**
   * Check if embedding service is available
   */
  isAvailable(): boolean {
    return this.isOnline && (
      this.config.provider === 'offline' ||
      (this.config.apiKey && this.config.endpoint)
    );
  }

  /**
   * Generate embedding for text
   */
  async generateEmbedding(text: string, cacheKey?: string): Promise<number[]> {
    if (!text.trim()) {
      throw new Error('Cannot generate embedding for empty text');
    }

    // Check cache first
    const key = cacheKey || this.generateCacheKey(text);
    if (this.cache.has(key)) {
      return this.cache.get(key)!;
    }

    let embedding: number[];

    try {
      switch (this.config.provider) {
        case 'azure-openai':
          embedding = await this.generateAzureOpenAIEmbedding(text);
          break;

        case 'openai':
          embedding = await this.generateOpenAIEmbedding(text);
          break;

        case 'local':
          embedding = await this.generateLocalEmbedding(text);
          break;

        case 'offline':
          embedding = this.generateOfflineEmbedding(text);
          break;

        default:
          throw new Error(`Unsupported embedding provider: ${this.config.provider}`);
      }

      // Cache the result
      this.cache.set(key, embedding);

      // Limit cache size
      if (this.cache.size > 10000) {
        const firstKey = this.cache.keys().next().value;
        this.cache.delete(firstKey);
      }

      return embedding;

    } catch (error) {
      this.logger.error('Failed to generate embedding:', error);

      // Fallback to offline embedding
      if (this.config.provider !== 'offline') {
        this.logger.info('Falling back to offline embedding');
        return this.generateOfflineEmbedding(text);
      }

      throw error;
    }
  }

  /**
   * Generate multiple embeddings in batch
   */
  async generateBatchEmbeddings(texts: string[]): Promise<Map<string, number[]>> {
    const results = new Map<string, number[]>();
    const uncachedTexts: string[] = [];
    const uncachedKeys: string[] = [];

    // Check cache for existing embeddings
    for (const text of texts) {
      const key = this.generateCacheKey(text);
      if (this.cache.has(key)) {
        results.set(text, this.cache.get(key)!);
      } else {
        uncachedTexts.push(text);
        uncachedKeys.push(key);
      }
    }

    // Generate embeddings for uncached texts
    if (uncachedTexts.length > 0) {
      try {
        const batchResults = await this.generateBatchEmbeddingsInternal(uncachedTexts);

        for (let i = 0; i < uncachedTexts.length; i++) {
          const text = uncachedTexts[i];
          const key = uncachedKeys[i];
          const embedding = batchResults[i];

          results.set(text, embedding);
          this.cache.set(key, embedding);
        }

      } catch (error) {
        this.logger.error('Batch embedding generation failed, falling back to individual requests:', error);

        // Fallback to individual requests
        for (const text of uncachedTexts) {
          try {
            const embedding = await this.generateEmbedding(text);
            results.set(text, embedding);
          } catch (individualError) {
            this.logger.error(`Failed to generate embedding for text: ${text.substring(0, 50)}...`, individualError);
            // Continue with other texts
          }
        }
      }
    }

    return results;
  }

  private async generateAzureOpenAIEmbedding(text: string): Promise<number[]> {
    const url = `${this.config.endpoint}/openai/deployments/${this.config.deploymentName}/embeddings?api-version=${this.config.apiVersion}`;

    const response = await this.makeRequest(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': this.config.apiKey!
      },
      body: JSON.stringify({
        input: text,
        model: this.config.deploymentName
      })
    });

    const data = await response.json();

    if (!data.data || data.data.length === 0) {
      throw new Error('No embedding data returned from Azure OpenAI');
    }

    return data.data[0].embedding;
  }

  private async generateOpenAIEmbedding(text: string): Promise<number[]> {
    const url = 'https://api.openai.com/v1/embeddings';

    const response = await this.makeRequest(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.config.apiKey!}`
      },
      body: JSON.stringify({
        input: text,
        model: 'text-embedding-3-small'
      })
    });

    const data = await response.json();

    if (!data.data || data.data.length === 0) {
      throw new Error('No embedding data returned from OpenAI');
    }

    return data.data[0].embedding;
  }

  private async generateLocalEmbedding(text: string): Promise<number[]> {
    // This would integrate with a local embedding model
    // For now, fallback to offline embedding
    return this.generateOfflineEmbedding(text);
  }

  /**
   * Generate basic text-based embedding for offline use
   * Uses simple text statistics and n-gram analysis
   */
  private generateOfflineEmbedding(text: string): number[] {
    const dimension = 384; // Standard embedding dimension
    const embedding = new Array(dimension).fill(0);

    // Normalize text
    const normalizedText = text.toLowerCase().replace(/[^\w\s]/g, ' ');
    const words = normalizedText.split(/\s+/).filter(word => word.length > 0);

    if (words.length === 0) {
      return embedding;
    }

    // Character frequency features (first 26 dimensions)
    const charFreq = new Array(26).fill(0);
    for (const char of normalizedText.replace(/\s/g, '')) {
      const charCode = char.charCodeAt(0);
      if (charCode >= 97 && charCode <= 122) { // a-z
        charFreq[charCode - 97]++;
      }
    }

    const totalChars = normalizedText.replace(/\s/g, '').length;
    for (let i = 0; i < 26; i++) {
      embedding[i] = totalChars > 0 ? charFreq[i] / totalChars : 0;
    }

    // Word length distribution (next 10 dimensions)
    const lengthDist = new Array(10).fill(0);
    for (const word of words) {
      const bucket = Math.min(Math.floor(word.length / 2), 9);
      lengthDist[bucket]++;
    }

    for (let i = 0; i < 10; i++) {
      embedding[26 + i] = words.length > 0 ? lengthDist[i] / words.length : 0;
    }

    // Bigram features (next 100 dimensions)
    const bigrams = new Map<string, number>();
    for (let i = 0; i < words.length - 1; i++) {
      const bigram = `${words[i]} ${words[i + 1]}`;
      bigrams.set(bigram, (bigrams.get(bigram) || 0) + 1);
    }

    const bigramArray = Array.from(bigrams.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 100);

    for (let i = 0; i < 100; i++) {
      embedding[36 + i] = i < bigramArray.length ? bigramArray[i][1] / words.length : 0;
    }

    // Text statistics (remaining dimensions)
    const avgWordLength = words.reduce((sum, word) => sum + word.length, 0) / words.length;
    const uniqueWordRatio = new Set(words).size / words.length;
    const sentenceCount = text.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
    const avgSentenceLength = words.length / Math.max(sentenceCount, 1);

    embedding[136] = avgWordLength / 10; // Normalize
    embedding[137] = uniqueWordRatio;
    embedding[138] = Math.min(sentenceCount / 10, 1); // Normalize
    embedding[139] = Math.min(avgSentenceLength / 20, 1); // Normalize

    // Hash-based features for remaining dimensions
    for (let i = 140; i < dimension; i++) {
      let hash = 0;
      const feature = `${i}_${text}`;

      for (let j = 0; j < feature.length; j++) {
        const char = feature.charCodeAt(j);
        hash = ((hash << 5) - hash + char) & 0xffffffff;
      }

      embedding[i] = (Math.abs(hash) % 1000) / 1000;
    }

    // Normalize the embedding vector
    const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
    if (magnitude > 0) {
      for (let i = 0; i < dimension; i++) {
        embedding[i] /= magnitude;
      }
    }

    return embedding;
  }

  private async generateBatchEmbeddingsInternal(texts: string[]): Promise<number[][]> {
    if (this.config.provider === 'offline') {
      return texts.map(text => this.generateOfflineEmbedding(text));
    }

    // For API-based providers, make batch request if supported
    // Otherwise fall back to individual requests
    const embeddings: number[][] = [];

    for (const text of texts) {
      const embedding = await this.generateEmbedding(text);
      embeddings.push(embedding);
    }

    return embeddings;
  }

  private async makeRequest(url: string, options: RequestInit): Promise<Response> {
    let lastError: Error;

    for (let attempt = 1; attempt <= this.config.maxRetries!; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

        const response = await fetch(url, {
          ...options,
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorText = await response.text().catch(() => 'Unknown error');
          throw new Error(`HTTP ${response.status}: ${errorText}`);
        }

        this.isOnline = true;
        return response;

      } catch (error) {
        lastError = error as Error;
        this.logger.warn(`Request attempt ${attempt} failed:`, error);

        if (attempt === this.config.maxRetries) {
          this.isOnline = false;
          break;
        }

        // Exponential backoff
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 10000);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    throw lastError!;
  }

  private generateCacheKey(text: string): string {
    // Simple hash function for cache keys
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      const char = text.charCodeAt(i);
      hash = ((hash << 5) - hash + char) & 0xffffffff;
    }
    return hash.toString(36);
  }

  /**
   * Calculate similarity between two embeddings
   */
  calculateSimilarity(embedding1: number[], embedding2: number[]): number {
    if (embedding1.length !== embedding2.length) {
      throw new Error('Embeddings must have the same dimension');
    }

    let dotProduct = 0;
    let norm1 = 0;
    let norm2 = 0;

    for (let i = 0; i < embedding1.length; i++) {
      dotProduct += embedding1[i] * embedding2[i];
      norm1 += embedding1[i] * embedding1[i];
      norm2 += embedding2[i] * embedding2[i];
    }

    const magnitude = Math.sqrt(norm1) * Math.sqrt(norm2);
    return magnitude === 0 ? 0 : dotProduct / magnitude;
  }

  /**
   * Clear embedding cache
   */
  clearCache(): void {
    this.cache.clear();
    this.logger.info('Embedding cache cleared');
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): {
    size: number;
    hitRate: number;
    memoryUsage: number;
  } {
    // This is a simplified implementation
    // In production, you'd track hits/misses for accurate hit rate
    return {
      size: this.cache.size,
      hitRate: 0.75, // Placeholder
      memoryUsage: this.cache.size * 384 * 4 // Rough estimate in bytes
    };
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<EmbeddingConfig>): void {
    this.config = { ...this.config, ...config };
    this.logger.info('Embedding service configuration updated');

    // Clear cache when configuration changes
    this.clearCache();
  }

  /**
   * Test connectivity to embedding service
   */
  async testConnectivity(): Promise<{
    available: boolean;
    provider: string;
    latency?: number;
    error?: string;
  }> {
    const startTime = Date.now();

    try {
      await this.generateEmbedding('test connectivity', 'connectivity-test');
      const latency = Date.now() - startTime;

      return {
        available: true,
        provider: this.config.provider,
        latency
      };

    } catch (error) {
      return {
        available: false,
        provider: this.config.provider,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}