// Simple HTTP client for Vector SDK
interface HTTPResponse<T = any> {
  data: T
  status: number
  statusText: string
}

class SimpleHTTPClient {
  private baseURL: string
  private headers: Record<string, string>
  private timeout: number

  constructor(config: { baseURL: string; headers: Record<string, string>; timeout: number }) {
    this.baseURL = config.baseURL
    this.headers = config.headers
    this.timeout = config.timeout
  }

  async request<T>(method: string, url: string, data?: any): Promise<HTTPResponse<T>> {
    const fullUrl = `${this.baseURL}${url}`
    const requestOptions: RequestInit = {
      method,
      headers: { ...this.headers },
      signal: AbortSignal.timeout(this.timeout)
    }

    if (data) {
      requestOptions.body = JSON.stringify(data)
    }

    try {
      const response = await fetch(fullUrl, requestOptions)
      const responseData = await response.json()

      if (!response.ok) {
        const error = new Error(`HTTP ${response.status}: ${response.statusText}`)
        throw error
      }

      return {
        data: responseData,
        status: response.status,
        statusText: response.statusText
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Request timeout')
      }
      throw error
    }
  }

  async get<T>(url: string): Promise<HTTPResponse<T>> {
    return this.request<T>('GET', url)
  }

  async post<T>(url: string, data?: any): Promise<HTTPResponse<T>> {
    return this.request<T>('POST', url, data)
  }

  async delete<T>(url: string): Promise<HTTPResponse<T>> {
    return this.request<T>('DELETE', url)
  }
}

export interface StocAIVectorConfig {
  apiKey: string
  baseURL?: string
  timeout?: number
}

export interface VectorMetadata {
  id: string
  text: string
  embedding: number[]
  metadata: Record<string, any>
  namespace?: string
  createdAt: string
  similarity?: number
}

export interface VectorIndex {
  id: string
  name: string
  dimension: number
  metric: 'cosine' | 'euclidean' | 'dotproduct'
  vectorCount: number
  namespaces: string[]
  metadata: Record<string, any>
  createdAt: string
  updatedAt: string
}

export interface UpsertVectorRequest {
  text: string
  metadata?: Record<string, any>
  namespace?: string
  id?: string
}

export interface SearchVectorRequest {
  query: string
  topK?: number
  namespace?: string
  filter?: Record<string, any>
  includeMetadata?: boolean
  includeValues?: boolean
}

export interface SearchResult {
  vectors: VectorMetadata[]
  totalCount: number
  processingTime: number
}

export interface VectorStats {
  totalVectors: number
  namespaces: Array<{
    name: string
    vectorCount: number
  }>
  dimensions: number
  indexSize: string
  lastUpdated: string
}

export class StocAIVectorClient {
  private client: SimpleHTTPClient
  private config: StocAIVectorConfig

  constructor(config: StocAIVectorConfig) {
    this.config = {
      baseURL: 'https://stocai.vercel.app/api',
      timeout: 30000,
      ...config
    }

    this.client = new SimpleHTTPClient({
      baseURL: this.config.baseURL!,
      timeout: this.config.timeout!,
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json'
      }
    })
  }

  /**
   * Create or update vectors with embeddings
   */
  async upsertVectors(
    indexId: string,
    vectors: UpsertVectorRequest[]
  ): Promise<{ upsertedCount: number, vectorIds: string[] }> {
    try {
      const response = await this.client.post(`/vectors/${indexId}/upsert`, {
        vectors
      })
      return response.data
    } catch (error) {
      throw new Error(`Failed to upsert vectors: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Search for similar vectors using semantic search
   */
  async searchVectors(
    indexId: string,
    request: SearchVectorRequest
  ): Promise<SearchResult> {
    try {
      const response = await this.client.post<SearchResult>(`/vectors/${indexId}/search`, request)
      return response.data
    } catch (error) {
      throw new Error(`Vector search failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Get vector by ID
   */
  async getVector(
    indexId: string,
    vectorId: string,
    namespace?: string
  ): Promise<VectorMetadata> {
    try {
      const url = namespace
        ? `/vectors/${indexId}/${vectorId}?namespace=${namespace}`
        : `/vectors/${indexId}/${vectorId}`

      const response = await this.client.get<VectorMetadata>(url)
      return response.data
    } catch (error) {
      throw new Error(`Failed to get vector: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Delete vectors by IDs
   */
  async deleteVectors(
    indexId: string,
    vectorIds: string[],
    namespace?: string
  ): Promise<{ deletedCount: number }> {
    try {
      const response = await this.client.post(`/vectors/${indexId}/delete`, {
        vectorIds,
        namespace
      })
      return response.data
    } catch (error) {
      throw new Error(`Failed to delete vectors: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Create a new vector index
   */
  async createIndex(
    name: string,
    dimension: number,
    metric: 'cosine' | 'euclidean' | 'dotproduct' = 'cosine',
    metadata?: Record<string, any>
  ): Promise<VectorIndex> {
    try {
      const response = await this.client.post<VectorIndex>('/vectors/indexes', {
        name,
        dimension,
        metric,
        metadata
      })
      return response.data
    } catch (error) {
      throw new Error(`Failed to create index: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * List all vector indexes
   */
  async listIndexes(): Promise<VectorIndex[]> {
    try {
      const response = await this.client.get<{ indexes: VectorIndex[] }>('/vectors/indexes')
      return response.data.indexes
    } catch (error) {
      throw new Error(`Failed to list indexes: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Get index information
   */
  async getIndex(indexId: string): Promise<VectorIndex> {
    try {
      const response = await this.client.get<VectorIndex>(`/vectors/indexes/${indexId}`)
      return response.data
    } catch (error) {
      throw new Error(`Failed to get index: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Delete a vector index
   */
  async deleteIndex(indexId: string): Promise<{ message: string }> {
    try {
      const response = await this.client.delete<{ message: string }>(`/vectors/indexes/${indexId}`)
      return response.data
    } catch (error) {
      throw new Error(`Failed to delete index: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Get index statistics
   */
  async getIndexStats(indexId: string): Promise<VectorStats> {
    try {
      const response = await this.client.get<VectorStats>(`/vectors/${indexId}/stats`)
      return response.data
    } catch (error) {
      throw new Error(`Failed to get index stats: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Bulk text to vector conversion
   */
  async embedTexts(
    texts: string[],
    model: string = 'text-embedding-3-small'
  ): Promise<{ embeddings: number[][]; model: string; usage: any }> {
    try {
      const response = await this.client.post('/vectors/embed', {
        texts,
        model
      })
      return response.data
    } catch (error) {
      throw new Error(`Failed to embed texts: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Similarity search with custom embeddings
   */
  async searchByEmbedding(
    indexId: string,
    embedding: number[],
    options: {
      topK?: number
      namespace?: string
      filter?: Record<string, any>
      includeMetadata?: boolean
    } = {}
  ): Promise<SearchResult> {
    try {
      const response = await this.client.post<SearchResult>(`/vectors/${indexId}/search-by-embedding`, {
        embedding,
        ...options
      })
      return response.data
    } catch (error) {
      throw new Error(`Embedding search failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Batch operations for multiple vectors
   */
  async batchOperation(
    indexId: string,
    operations: Array<{
      operation: 'upsert' | 'delete'
      data: any
    }>
  ): Promise<{ results: any[] }> {
    try {
      const response = await this.client.post(`/vectors/${indexId}/batch`, {
        operations
      })
      return response.data
    } catch (error) {
      throw new Error(`Batch operation failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Update vector metadata
   */
  async updateVector(
    indexId: string,
    vectorId: string,
    metadata: Record<string, any>,
    namespace?: string
  ): Promise<VectorMetadata> {
    try {
      const response = await this.client.post<VectorMetadata>(`/vectors/${indexId}/${vectorId}/update`, {
        metadata,
        namespace
      })
      return response.data
    } catch (error) {
      throw new Error(`Failed to update vector: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Query vectors with filters
   */
  async queryVectors(
    indexId: string,
    filter: Record<string, any>,
    options: {
      topK?: number
      namespace?: string
      includeMetadata?: boolean
    } = {}
  ): Promise<VectorMetadata[]> {
    try {
      const response = await this.client.post(`/vectors/${indexId}/query`, {
        filter,
        ...options
      })
      return response.data.vectors
    } catch (error) {
      throw new Error(`Vector query failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Get recommendations based on vector similarity
   */
  async getRecommendations(
    indexId: string,
    vectorId: string,
    options: {
      topK?: number
      namespace?: string
      excludeOriginal?: boolean
    } = {}
  ): Promise<VectorMetadata[]> {
    try {
      const response = await this.client.post(`/vectors/${indexId}/${vectorId}/recommendations`, options)
      return response.data.recommendations
    } catch (error) {
      throw new Error(`Failed to get recommendations: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }
}

// Export utility functions
export function calculateCosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error('Vectors must have the same dimension')
  }

  let dotProduct = 0
  let normA = 0
  let normB = 0

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i]
    normA += a[i] * a[i]
    normB += b[i] * b[i]
  }

  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB))
}

export function normalizeVector(vector: number[]): number[] {
  const norm = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0))
  return vector.map(val => val / norm)
}

export function vectorDistance(a: number[], b: number[], metric: 'cosine' | 'euclidean' = 'cosine'): number {
  if (metric === 'cosine') {
    return 1 - calculateCosineSimilarity(a, b)
  }

  // Euclidean distance
  return Math.sqrt(a.reduce((sum, val, i) => sum + Math.pow(val - b[i], 2), 0))
}
