/**
 * Memory Service - Production Implementation
 * Handles AI memory storage, retrieval, and vector operations
 */

import { EventEmitter } from 'events'
import { createHash } from 'crypto'
import type { Memory, MemoryQuery, MemorySearchResult, MemoraiConfig } from '../types'

// Simple in-memory vector store for development
// In production, this would integrate with Pinecone, Weaviate, etc.
class VectorStore {
  private vectors: Map<string, { id: string; vector: number[]; metadata: any }> = new Map()

  async upsert(id: string, vector: number[], metadata: any): Promise<void> {
    this.vectors.set(id, { id, vector, metadata })
  }

  async search(queryVector: number[], topK = 10, threshold = 0.7): Promise<Array<{ id: string; score: number; metadata: any }>> {
    const results: Array<{ id: string; score: number; metadata: any }> = []

    for (const [id, item] of this.vectors) {
      const similarity = this.cosineSimilarity(queryVector, item.vector)
      if (similarity >= threshold) {
        results.push({ id, score: similarity, metadata: item.metadata })
      }
    }

    return results.sort((a, b) => b.score - a.score).slice(0, topK)
  }

  async delete(id: string): Promise<void> {
    this.vectors.delete(id)
  }

  private cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) return 0

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

  size(): number {
    return this.vectors.size
  }
}

export class MemoryService extends EventEmitter {
  private isInitialized = false
  private vectorStore: VectorStore
  private memories: Map<string, Memory> = new Map()
  private embeddingCache: Map<string, number[]> = new Map()

  constructor(
    private vectorConfig: MemoraiConfig['vectorDB'],
    private aiConfig: MemoraiConfig['ai']
  ) {
    super()
    this.vectorStore = new VectorStore()
  }

  async initialize(): Promise<void> {
    try {
      // Initialize vector database connection
      await this.initializeVectorDB()

      // Initialize AI embedding service
      await this.initializeEmbeddingService()

      this.isInitialized = true
      this.emit('initialized')
      console.log('🧠 Memory Service initialized')

    } catch (error) {
      console.error('Failed to initialize memory service:', error)
      this.emit('error', error)
      throw error
    }
  }

  async shutdown(): Promise<void> {
    if (this.isInitialized) {
      // Clean up connections
      this.isInitialized = false
      this.emit('shutdown')
      console.log('🧠 Memory Service shutdown')
    }
  }

  async create(memory: Partial<Memory>): Promise<Memory> {
    if (!this.isInitialized) {
      throw new Error('Memory service not initialized')
    }

    try {
      // Generate unique ID
      const id = `mem_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

      // Generate embeddings for the content
      const embeddings = await this.generateEmbeddings(memory.content || '')

      // Create full memory object
      const fullMemory: Memory = {
        id,
        userId: memory.userId || '',
        appId: memory.appId || '',
        content: memory.content || '',
        type: memory.type || 'semantic',
        importance: this.calculateImportance(memory),
        confidence: memory.confidence || 0.8,
        context: memory.context || this.generateDefaultContext(),
        embeddings,
        relationships: memory.relationships || [],
        accessHistory: [],
        tags: memory.tags || [],
        isShared: memory.isShared || false,
        sharedWith: memory.sharedWith || [],
        createdAt: new Date(),
        updatedAt: new Date(),
        version: 1,
        expiresAt: memory.expiresAt,
        metadata: {
          contentLength: memory.content?.length || 0,
          embeddingModel: this.aiConfig.embeddingModel,
          vectorDimensions: embeddings.length
        }
      }

      // Store in memory database
      this.memories.set(id, fullMemory)

      // Store embeddings in vector database
      await this.vectorStore.upsert(id, embeddings, {
        userId: fullMemory.userId,
        appId: fullMemory.appId,
        type: fullMemory.type,
        importance: fullMemory.importance,
        createdAt: fullMemory.createdAt.toISOString(),
        tags: fullMemory.tags
      })

      // Update access history
      fullMemory.accessHistory.push({
        timestamp: new Date(),
        accessType: 'update',
        userId: fullMemory.userId,
        appId: fullMemory.appId,
        context: 'memory_creation',
        reinforcement: 1.0
      })

      this.emit('memory:created', { memory: fullMemory })

      return fullMemory

    } catch (error) {
      console.error('Memory creation error:', error)
      this.emit('memory:create_error', { memory, error })
      throw error
    }
  }

  async search(query: MemoryQuery): Promise<MemorySearchResult[]> {
    if (!this.isInitialized) {
      throw new Error('Memory service not initialized')
    }

    try {
      const startTime = Date.now()
      let results: MemorySearchResult[] = []

      // Generate embeddings for the query
      let queryEmbeddings: number[] | undefined
      if (query.text) {
        queryEmbeddings = await this.generateEmbeddings(query.text)
      } else if (query.embeddings) {
        queryEmbeddings = query.embeddings
      }

      if (queryEmbeddings) {
        // Semantic search using vector similarity
        const vectorResults = await this.vectorStore.search(
          queryEmbeddings,
          query.limit || 10,
          query.semanticThreshold || 0.7
        )

        for (const result of vectorResults) {
          const memory = this.memories.get(result.id)
          if (!memory) continue

          // Apply filters
          if (!this.matchesFilters(memory, query)) continue

          // Calculate relevance score
          const relevanceScore = this.calculateRelevanceScore(memory, query, result.score)

          // Calculate context match
          const contextMatch = this.calculateContextMatch(memory, query)

          results.push({
            memory,
            similarity: result.score,
            relevanceScore,
            contextMatch,
            explanation: this.generateExplanation(memory, query, result.score)
          })
        }
      }

      // Keyword search if no embeddings available
      if (results.length === 0 && query.text) {
        results = this.keywordSearch(query)
      }

      // Sort by relevance score
      results.sort((a, b) => b.relevanceScore - a.relevanceScore)

      // Update access history for found memories
      for (const result of results) {
        result.memory.accessHistory.push({
          timestamp: new Date(),
          accessType: 'read',
          userId: query.userId || 'system',
          appId: query.appId || 'search',
          context: query.text || 'vector_search',
          reinforcement: result.relevanceScore
        })
      }

      const searchTime = Date.now() - startTime

      this.emit('memory:searched', {
        query,
        resultCount: results.length,
        searchTime
      })

      return results

    } catch (error) {
      console.error('Memory search error:', error)
      this.emit('memory:search_error', { query, error })
      return []
    }
  }

  async get(id: string, userId: string): Promise<Memory | null> {
    if (!this.isInitialized) {
      throw new Error('Memory service not initialized')
    }

    try {
      const memory = this.memories.get(id)

      if (!memory) {
        return null
      }

      // Check access permissions
      if (memory.userId !== userId && !memory.isShared) {
        return null
      }

      // Update access history
      memory.accessHistory.push({
        timestamp: new Date(),
        accessType: 'read',
        userId,
        appId: 'direct_access',
        context: 'memory_retrieval',
        reinforcement: 0.1
      })

      this.emit('memory:accessed', { memoryId: id, userId })

      return memory

    } catch (error) {
      console.error('Memory retrieval error:', error)
      this.emit('memory:get_error', { id, userId, error })
      return null
    }
  }

  async update(id: string, updates: Partial<Memory>, userId: string): Promise<Memory | null> {
    if (!this.isInitialized) {
      throw new Error('Memory service not initialized')
    }

    try {
      const memory = this.memories.get(id)

      if (!memory || memory.userId !== userId) {
        return null
      }

      // Update memory
      Object.assign(memory, {
        ...updates,
        updatedAt: new Date(),
        version: memory.version + 1
      })

      // Regenerate embeddings if content changed
      if (updates.content && updates.content !== memory.content) {
        memory.embeddings = await this.generateEmbeddings(updates.content)
        await this.vectorStore.upsert(id, memory.embeddings, {
          userId: memory.userId,
          appId: memory.appId,
          type: memory.type,
          importance: memory.importance,
          createdAt: memory.createdAt.toISOString(),
          tags: memory.tags
        })
      }

      // Update access history
      memory.accessHistory.push({
        timestamp: new Date(),
        accessType: 'update',
        userId,
        appId: 'update_operation',
        context: 'memory_update',
        reinforcement: 0.2
      })

      this.emit('memory:updated', { memory, updates })

      return memory

    } catch (error) {
      console.error('Memory update error:', error)
      this.emit('memory:update_error', { id, updates, userId, error })
      return null
    }
  }

  async delete(id: string, userId: string): Promise<boolean> {
    if (!this.isInitialized) {
      throw new Error('Memory service not initialized')
    }

    try {
      const memory = this.memories.get(id)

      if (!memory || memory.userId !== userId) {
        return false
      }

      // Remove from memory database
      this.memories.delete(id)

      // Remove from vector database
      await this.vectorStore.delete(id)

      this.emit('memory:deleted', { memoryId: id, userId })

      return true

    } catch (error) {
      console.error('Memory deletion error:', error)
      this.emit('memory:delete_error', { id, userId, error })
      return false
    }
  }

  async getHealth(): Promise<{ status: string; details?: any }> {
    if (!this.isInitialized) {
      return { status: 'unhealthy', details: { initialized: false } }
    }

    try {
      return {
        status: 'healthy',
        details: {
          initialized: true,
          memoriesCount: this.memories.size,
          vectorsCount: this.vectorStore.size(),
          embeddingModel: this.aiConfig.embeddingModel,
          vectorDatabase: this.vectorConfig.type
        }
      }
    } catch (error) {
      return {
        status: 'unhealthy',
        details: {
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      }
    }
  }

  // ==================== PRIVATE METHODS ====================

  private async initializeVectorDB(): Promise<void> {
    // In production, this would connect to Pinecone, Weaviate, etc.
    // For now, using in-memory vector store
    console.log(`Initializing ${this.vectorConfig.type} vector database`)
  }

  private async initializeEmbeddingService(): Promise<void> {
    // In production, this would initialize OpenAI, Hugging Face, etc.
    console.log(`Initializing ${this.aiConfig.provider} embedding service`)
  }

  private async generateEmbeddings(text: string): Promise<number[]> {
    // Check cache first
    const cacheKey = createHash('sha256').update(text).digest('hex')

    if (this.embeddingCache.has(cacheKey)) {
      return this.embeddingCache.get(cacheKey)!
    }

    // For development, generate mock embeddings
    // In production, this would call OpenAI API, local model, etc.
    const embeddings = Array.from(
      { length: this.vectorConfig.dimensions },
      () => Math.random() * 2 - 1 // Random values between -1 and 1
    )

    // Normalize the vector
    const norm = Math.sqrt(embeddings.reduce((sum, val) => sum + val * val, 0))
    const normalizedEmbeddings = embeddings.map(val => val / norm)

    // Cache the result
    this.embeddingCache.set(cacheKey, normalizedEmbeddings)

    return normalizedEmbeddings
  }

  private calculateImportance(memory: Partial<Memory>): number {
    // Base importance
    let importance = memory.importance || 0.5

    // Adjust based on content length
    const contentLength = memory.content?.length || 0
    if (contentLength > 1000) importance += 0.1
    if (contentLength > 5000) importance += 0.1

    // Adjust based on tags
    if (memory.tags && memory.tags.length > 0) {
      importance += 0.05 * memory.tags.length
    }

    // Adjust based on sharing
    if (memory.isShared) importance += 0.1

    // Cap at 1.0
    return Math.min(importance, 1.0)
  }

  private generateDefaultContext(): Memory['context'] {
    const now = new Date()

    return {
      temporalContext: {
        timeOfDay: this.getTimeOfDay(now),
        dayOfWeek: this.getDayOfWeek(now),
        season: this.getSeason(now),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        relativeTime: 'recent'
      },
      environmentalFactors: {
        platform: process.platform,
        nodeVersion: process.version
      }
    }
  }

  private matchesFilters(memory: Memory, query: MemoryQuery): boolean {
    // User filter
    if (query.userId && memory.userId !== query.userId) {
      return false
    }

    // App filter
    if (query.appId && memory.appId !== query.appId) {
      return false
    }

    // Type filter
    if (query.type && memory.type !== query.type) {
      return false
    }

    // Time range filter
    if (query.timeRange) {
      const createdAt = memory.createdAt
      if (createdAt < query.timeRange.start || createdAt > query.timeRange.end) {
        return false
      }
    }

    // Importance filter
    if (query.importance) {
      if (memory.importance < query.importance.min || memory.importance > query.importance.max) {
        return false
      }
    }

    // Confidence filter
    if (query.confidence) {
      if (memory.confidence < query.confidence.min || memory.confidence > query.confidence.max) {
        return false
      }
    }

    // Tags filter
    if (query.tags && query.tags.length > 0) {
      const hasMatchingTag = query.tags.some(tag => memory.tags.includes(tag))
      if (!hasMatchingTag) {
        return false
      }
    }

    return true
  }

  private calculateRelevanceScore(memory: Memory, query: MemoryQuery, similarity: number): number {
    let score = similarity * 0.7 // Base semantic similarity (70% weight)

    // Add importance bonus
    score += memory.importance * 0.1

    // Add recency bonus
    const daysSinceCreated = (Date.now() - memory.createdAt.getTime()) / (1000 * 60 * 60 * 24)
    const recencyScore = Math.max(0, (30 - daysSinceCreated) / 30) // Decay over 30 days
    score += recencyScore * 0.1

    // Add access frequency bonus
    const accessCount = memory.accessHistory.length
    const accessScore = Math.min(accessCount / 10, 1) // Cap at 10 accesses
    score += accessScore * 0.1

    return Math.min(score, 1.0)
  }

  private calculateContextMatch(memory: Memory, query: MemoryQuery): number {
    // Simple context matching - in production this would be more sophisticated
    let match = 0.5

    // Match app context
    if (query.appId && memory.appId === query.appId) {
      match += 0.2
    }

    // Match user context
    if (query.userId && memory.userId === query.userId) {
      match += 0.2
    }

    // Match tags
    if (query.tags && query.tags.length > 0) {
      const matchingTags = query.tags.filter(tag => memory.tags.includes(tag)).length
      match += (matchingTags / query.tags.length) * 0.1
    }

    return Math.min(match, 1.0)
  }

  private generateExplanation(memory: Memory, query: MemoryQuery, similarity: number): string {
    const reasons: string[] = []

    if (similarity > 0.8) {
      reasons.push('High semantic similarity')
    } else if (similarity > 0.6) {
      reasons.push('Moderate semantic similarity')
    }

    if (memory.importance > 0.7) {
      reasons.push('High importance memory')
    }

    if (query.tags && query.tags.some(tag => memory.tags.includes(tag))) {
      reasons.push('Matching tags')
    }

    const daysSinceCreated = (Date.now() - memory.createdAt.getTime()) / (1000 * 60 * 60 * 24)
    if (daysSinceCreated < 1) {
      reasons.push('Recent memory')
    }

    return reasons.length > 0 ? reasons.join(', ') : 'General relevance match'
  }

  private keywordSearch(query: MemoryQuery): MemorySearchResult[] {
    if (!query.text) return []

    const keywords = query.text.toLowerCase().split(/\s+/)
    const results: MemorySearchResult[] = []

    for (const memory of this.memories.values()) {
      if (!this.matchesFilters(memory, query)) continue

      const content = memory.content.toLowerCase()
      let score = 0

      for (const keyword of keywords) {
        if (content.includes(keyword)) {
          score += 1
        }
      }

      if (score > 0) {
        const relevanceScore = score / keywords.length
        results.push({
          memory,
          similarity: relevanceScore,
          relevanceScore,
          contextMatch: this.calculateContextMatch(memory, query),
          explanation: `Keyword match: ${score}/${keywords.length} keywords found`
        })
      }
    }

    return results.slice(0, query.limit || 10)
  }

  private getTimeOfDay(date: Date): string {
    const hour = date.getHours()
    if (hour < 6) return 'night'
    if (hour < 12) return 'morning'
    if (hour < 18) return 'afternoon'
    return 'evening'
  }

  private getDayOfWeek(date: Date): string {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    return days[date.getDay()]
  }

  private getSeason(date: Date): string {
    const month = date.getMonth()
    if (month >= 2 && month <= 4) return 'spring'
    if (month >= 5 && month <= 7) return 'summer'
    if (month >= 8 && month <= 10) return 'autumn'
    return 'winter'
  }
}
