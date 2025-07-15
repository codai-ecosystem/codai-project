import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class AIMemoryService {

  /**
   * Create a new memory with AI processing and embeddings
   */
  async createMemory(data: {
    agentId: string;
    content: string;
    memoryType?: string;
    importance?: number;
    confidence?: number;
    category?: string;
    tags?: string;
    metadata?: string;
    sessionId?: string;
  }) {
    // For now, create a simple memory without AI processing
    const memory = await prisma.memory.create({
      data: {
        ...data,
        summary: data.content.substring(0, 200) + (data.content.length > 200 ? '...' : ''),
        importance: data.importance || 0.5,
        confidence: data.confidence || 0.8,
        memoryType: data.memoryType || 'EPISODIC'
      },
      include: {
        agent: true,
        session: true
      }
    });

    return memory;
  }

  /**
   * Retrieve memory by ID and update access statistics
   */
  async getMemoryById(memoryId: string) {
    const memory = await prisma.memory.update({
      where: { id: memoryId },
      data: {
        lastAccessed: new Date(),
        accessCount: { increment: 1 }
      },
      include: {
        agent: true,
        session: true,
        embeddings: true,
        associations: {
          include: {
            targetMemory: true
          }
        }
      }
    });

    return memory;
  }

  /**
   * Get memories for an agent with intelligent filtering
   */
  async getMemoriesForAgent(agentId: string, options: {
    limit?: number;
    memoryType?: string;
    orderBy?: string;
    category?: string;
    minImportance?: number;
  } = {}) {
    const {
      limit = 10,
      memoryType,
      orderBy = 'lastAccessed',
      category,
      minImportance = 0.0
    } = options;

    const where: any = {
      agentId,
      importance: { gte: minImportance }
    };

    if (memoryType) {
      where.memoryType = memoryType;
    }

    if (category) {
      where.category = category;
    }

    const memories = await prisma.memory.findMany({
      where,
      orderBy: this.getOrderBy(orderBy),
      take: limit,
      include: {
        session: true,
        embeddings: true,
        associations: {
          take: 3,
          include: {
            targetMemory: {
              select: { id: true, content: true, summary: true }
            }
          }
        }
      }
    });

    return memories;
  }

  /**
   * Semantic search using embeddings and relevance scoring
   */
  async searchMemories(agentId: string, query: string, options: {
    limit?: number;
    method?: string;
    minRelevance?: number;
  } = {}) {
    const { limit = 10, method = 'SEMANTIC', minRelevance = 0.3 } = options;

    // Generate query embedding
    const queryEmbedding = await this.generateQueryEmbedding(query);

    // Record the search for analytics
    const retrieval = await prisma.memoryRetrieval.create({
      data: {
        agentId,
        query,
        method: method as any,
        resultCount: 0, // Will update after search
        executionTime: 0 // Will update after search
      }
    });

    const startTime = Date.now();

    // Perform semantic search (simplified - would use vector similarity in production)
    const searchResults = await this.performSemanticSearch(
      agentId,
      query,
      queryEmbedding,
      limit,
      minRelevance
    );

    const executionTime = Date.now() - startTime;

    // Update retrieval record
    await prisma.memoryRetrieval.update({
      where: { id: retrieval.id },
      data: {
        results: JSON.stringify(searchResults.map(r => ({ id: r.id, score: r.relevanceScore }))),
        resultCount: searchResults.length,
        executionTime
      }
    });

    return {
      query,
      results: searchResults,
      executionTime,
      method
    };
  }

  /**
   * Update memory with intelligent processing
   */
  async updateMemory(memoryId: string, updateData: any) {
    // If content changed, regenerate summary and embeddings
    if (updateData.content) {
      updateData.summary = await this.generateSummary(updateData.content);

      // Regenerate embeddings
      const memory = await prisma.memory.findUnique({ where: { id: memoryId } });
      if (memory) {
        this.generateEmbeddings(memoryId, updateData.content, memory.agentId);
      }
    }

    const updatedMemory = await prisma.memory.update({
      where: { id: memoryId },
      data: updateData,
      include: {
        agent: true,
        session: true,
        embeddings: true
      }
    });

    return updatedMemory;
  }

  /**
   * Delete memory with cascade cleanup
   */
  async deleteMemory(memoryId: string) {
    // Delete associations and embeddings first
    await prisma.memoryAssociation.deleteMany({
      where: {
        OR: [
          { sourceMemoryId: memoryId },
          { targetMemoryId: memoryId }
        ]
      }
    });

    await prisma.memoryEmbedding.deleteMany({
      where: { memoryId }
    });

    // Delete the memory
    await prisma.memory.delete({
      where: { id: memoryId }
    });

    return true;
  }

  /**
   * Create a new agent with default settings
   */
  async createAgent(data: {
    name: string;
    type?: string;
    description?: string;
    capabilities?: string[];
    maxContextSize?: number;
  }) {
    const agent = await prisma.agent.create({
      data: {
        ...data,
        capabilities: data.capabilities ? JSON.stringify(data.capabilities) : null,
        type: data.type as any || 'PERSONAL',
        maxContextSize: data.maxContextSize || 10000
      }
    });

    return agent;
  }

  /**
   * Get contextual memories for an agent's current session
   */
  async getContextualMemories(agentId: string, sessionId?: string, contextSize: number = 5) {
    const contextWindow = await prisma.contextWindow.create({
      data: {
        agentId,
        sessionId,
        windowSize: contextSize,
        currentMemories: JSON.stringify([]), // Will be populated
        relevanceScores: JSON.stringify([])
      }
    });

    // Get most relevant recent memories
    const recentMemories = await prisma.memory.findMany({
      where: {
        agentId,
        ...(sessionId && { sessionId })
      },
      orderBy: [
        { importance: 'desc' },
        { lastAccessed: 'desc' }
      ],
      take: contextSize,
      include: {
        associations: {
          include: { targetMemory: true }
        }
      }
    });

    // Update context window with current memories
    await prisma.contextWindow.update({
      where: { id: contextWindow.id },
      data: {
        currentMemories: JSON.stringify(recentMemories.map(m => m.id)),
        relevanceScores: JSON.stringify(recentMemories.map(m => m.importance))
      }
    });

    return {
      contextWindow,
      memories: recentMemories
    };
  }

  // Private helper methods

  private async generateSummary(content: string): Promise<string> {
    // Simplified summary generation - would use AI service in production
    if (content.length <= 100) return content;

    const sentences = content.split('. ');
    return sentences.slice(0, 2).join('. ') + (sentences.length > 2 ? '...' : '');
  }

  private async calculateImportance(content: string, memoryType?: string): Promise<number> {
    // Simplified importance calculation - would use AI analysis in production
    let importance = 0.5;

    // Boost importance for certain keywords
    const importantKeywords = ['critical', 'important', 'remember', 'key', 'essential'];
    const keywordMatches = importantKeywords.filter(keyword =>
      content.toLowerCase().includes(keyword)
    ).length;

    importance += keywordMatches * 0.1;

    // Adjust based on memory type
    switch (memoryType) {
      case 'SEMANTIC':
        importance += 0.1; // Facts are generally important
        break;
      case 'PROCEDURAL':
        importance += 0.15; // Skills are very important
        break;
      case 'WORKING':
        importance -= 0.2; // Working memory is temporary
        break;
    }

    return Math.min(Math.max(importance, 0.0), 1.0);
  }

  private async generateEmbeddings(memoryId: string, content: string, agentId: string) {
    // Simplified embedding generation - would use OpenAI/Azure in production
    const mockEmbedding = new Array(1536).fill(0).map(() => Math.random());

    await prisma.memoryEmbedding.create({
      data: {
        memoryId,
        agentId,
        vector: JSON.stringify(mockEmbedding),
        model: 'text-embedding-3-small',
        dimensions: 1536
      }
    });
  }

  private async generateQueryEmbedding(query: string): Promise<number[]> {
    // Simplified query embedding - would use AI service in production
    return new Array(1536).fill(0).map(() => Math.random());
  }

  private async findAndCreateAssociations(memoryId: string, agentId: string, content: string) {
    // Simplified association finding - would use semantic analysis in production
    const recentMemories = await prisma.memory.findMany({
      where: {
        agentId,
        id: { not: memoryId }
      },
      orderBy: { createdAt: 'desc' },
      take: 5
    });

    for (const memory of recentMemories) {
      // Simple keyword-based association
      const commonWords = this.findCommonWords(content, memory.content);
      if (commonWords.length > 2) {
        await prisma.memoryAssociation.create({
          data: {
            sourceMemoryId: memoryId,
            targetMemoryId: memory.id,
            strength: Math.min(commonWords.length * 0.2, 1.0),
            associationType: 'RELATED',
            context: `Common concepts: ${commonWords.join(', ')}`
          }
        });
      }
    }
  }

  private async performSemanticSearch(
    agentId: string,
    query: string,
    queryEmbedding: number[],
    limit: number,
    minRelevance: number
  ) {
    // Simplified semantic search - would use vector similarity in production
    const memories = await prisma.memory.findMany({
      where: { agentId },
      include: { embeddings: true }
    });

    const results = memories
      .map(memory => ({
        ...memory,
        relevanceScore: this.calculateRelevanceScore(query, memory.content)
      }))
      .filter(result => result.relevanceScore >= minRelevance)
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, limit);

    return results;
  }

  private calculateRelevanceScore(query: string, content: string): number {
    // Simplified relevance scoring - would use embeddings in production
    const queryWords = query.toLowerCase().split(' ');
    const contentWords = content.toLowerCase().split(' ');

    const matches = queryWords.filter(word => contentWords.includes(word)).length;
    return Math.min(matches / queryWords.length, 1.0);
  }

  private findCommonWords(text1: string, text2: string): string[] {
    const words1 = text1.toLowerCase().split(' ').filter(w => w.length > 3);
    const words2 = text2.toLowerCase().split(' ').filter(w => w.length > 3);

    return words1.filter(word => words2.includes(word));
  }

  private getOrderBy(orderBy: string) {
    switch (orderBy) {
      case 'importance':
        return { importance: 'desc' as const };
      case 'recent':
        return { createdAt: 'desc' as const };
      case 'accessed':
        return { lastAccessed: 'desc' as const };
      default:
        return { lastAccessed: 'desc' as const };
    }
  }
}
