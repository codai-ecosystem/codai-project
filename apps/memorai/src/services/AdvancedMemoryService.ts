/**
 * MemorAI Advanced Memory Operations
 * Phase 3.1: Enhanced CBD features for production deployment
 */

import { createCBDEngine } from '@codai/cbd';
import type { CBDMemoryEngine } from '@codai/cbd';
import { loadConfig } from './config/memorai.config';

export interface MemoryCluster {
  id: string;
  theme: string;
  memories: string[];
  centroid: number[];
  similarity: number;
  confidence: number;
}

export interface RelatedMemory {
  structuredKey: string;
  content: string;
  relationshipType: 'semantic' | 'temporal' | 'contextual' | 'project';
  similarity: number;
  depth: number;
}

export interface MemoryAnalytics {
  agentId: string;
  timeRange: {
    start: string;
    end: string;
  };
  totalMemories: number;
  averageImportance: number;
  topProjects: Array<{
    name: string;
    count: number;
    percentage: number;
  }>;
  topSessions: Array<{
    name: string;
    count: number;
    percentage: number;
  }>;
  memoryTrends: Array<{
    date: string;
    count: number;
    avgImportance: number;
  }>;
  semanticClusters: MemoryCluster[];
  performanceMetrics: {
    averageResponseTime: number;
    successRate: number;
    errorRate: number;
  };
}

export interface SearchQuery {
  query: string;
  filters: {
    agentId?: string;
    projectName?: string;
    sessionName?: string;
    dateRange?: {
      start: string;
      end: string;
    };
    importance?: {
      min: number;
      max: number;
    };
    tags?: string[];
  };
  options: {
    limit: number;
    minScore: number;
    includeContent: boolean;
    includeMetadata: boolean;
    groupBy?: 'project' | 'session' | 'agent' | 'date';
  };
}

export interface FilteredResults {
  query: SearchQuery;
  totalFound: number;
  filteredCount: number;
  executionTime: number;
  results: Array<{
    structuredKey: string;
    content: string;
    score: number;
    metadata: any;
    highlights: string[];
  }>;
  facets: {
    projects: Array<{ name: string; count: number }>;
    sessions: Array<{ name: string; count: number }>;
    agents: Array<{ name: string; count: number }>;
    dates: Array<{ date: string; count: number }>;
    tags: Array<{ tag: string; count: number }>;
  };
}

/**
 * Advanced Memory Features Implementation
 */
export class AdvancedMemoryOperations {
  private cbdEngine: CBDMemoryEngine;
  private config: any;
  private initialized = false;

  constructor(config?: any) {
    this.config = loadConfig(config);
    this.cbdEngine = createCBDEngine({
      storage: {
        type: 'cbd-native',
        dataPath: this.config.cbd.dataPath
      },
      embedding: {
        model: this.config.cbd.embeddingModel,
        apiKey: this.config.cbd.apiKey,
        modelName: 'text-embedding-ada-002',
        dimensions: this.config.cbd.dimensions
      },
      vector: {
        indexType: this.config.cbd.indexType,
        dimensions: this.config.cbd.dimensions,
        similarityMetric: this.config.cbd.similarityMetric
      },
      cache: {
        enabled: true,
        maxSize: this.config.cbd.cacheSize,
        ttl: 3600000
      }
    });
  }

  /**
   * Initialize the advanced memory system
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    await this.cbdEngine.initialize();
    this.initialized = true;
    console.log('🚀 Advanced Memory Operations initialized');
  }

  /**
   * Cluster memories by semantic similarity
   */
  async clusterMemories(agentId: string, threshold: number = 0.7): Promise<MemoryCluster[]> {
    await this.ensureInitialized();

    try {
      // Get all memories for the agent
      const searchResult = await this.cbdEngine.search_memory(`agent:${agentId}`, 1000);
      const memories = searchResult.memories.filter(m => m.memory.agentId === agentId);

      if (memories.length === 0) {
        return [];
      }

      // Group memories by semantic similarity
      const clusters: MemoryCluster[] = [];
      const processed = new Set<string>();

      for (const memory of memories) {
        if (processed.has(memory.memory.structuredKey)) continue;

        const cluster: MemoryCluster = {
          id: `cluster_${clusters.length + 1}`,
          theme: await this.extractTheme(memory.memory.userRequest),
          memories: [memory.memory.structuredKey],
          centroid: memory.memory.vectorEmbedding || [],
          similarity: 1.0,
          confidence: memory.confidence
        };

        processed.add(memory.memory.structuredKey);

        // Find similar memories for this cluster
        for (const otherMemory of memories) {
          if (processed.has(otherMemory.memory.structuredKey)) continue;

          const similarity = await this.calculateSimilarity(
            memory.memory.vectorEmbedding || [],
            otherMemory.memory.vectorEmbedding || []
          );

          if (similarity >= threshold) {
            cluster.memories.push(otherMemory.memory.structuredKey);
            cluster.similarity = Math.min(cluster.similarity, similarity);
            processed.add(otherMemory.memory.structuredKey);
          }
        }

        if (cluster.memories.length > 1) {
          clusters.push(cluster);
        }
      }

      return clusters.sort((a, b) => b.memories.length - a.memories.length);

    } catch (error: any) {
      throw new Error(`Clustering failed: ${error.message}`);
    }
  }

  /**
   * Find related memories with relationship analysis
   */
  async findRelatedMemories(structuredKey: string, depth: number = 2): Promise<RelatedMemory[]> {
    await this.ensureInitialized();

    try {
      // Get the source memory
      const sourceMemory = await this.cbdEngine.get_memory(structuredKey);
      if (!sourceMemory) {
        throw new Error('Source memory not found');
      }

      const related: RelatedMemory[] = [];
      const processed = new Set<string>([structuredKey]);

      // Find semantically related memories
      const semanticResults = await this.cbdEngine.search_memory(
        sourceMemory.userRequest,
        50,
        0.3
      );

      for (const result of semanticResults.memories) {
        if (processed.has(result.memory.structuredKey)) continue;

        related.push({
          structuredKey: result.memory.structuredKey,
          content: result.memory.userRequest,
          relationshipType: 'semantic',
          similarity: result.relevanceScore,
          depth: 1
        });

        processed.add(result.memory.structuredKey);
      }

      // Find contextually related memories (same project/session)
      const contextualResults = await this.cbdEngine.search_memory(
        `project:${sourceMemory.projectName} session:${sourceMemory.sessionName}`,
        20
      );

      for (const result of contextualResults.memories) {
        if (processed.has(result.memory.structuredKey)) continue;

        related.push({
          structuredKey: result.memory.structuredKey,
          content: result.memory.userRequest,
          relationshipType: 'contextual',
          similarity: result.relevanceScore,
          depth: 1
        });

        processed.add(result.memory.structuredKey);
      }

      // Find temporally related memories (similar timestamps)
      const sourceTime = new Date(sourceMemory.createdAt).getTime();
      const timeWindow = 24 * 60 * 60 * 1000; // 24 hours

      const temporalResults = await this.cbdEngine.search_memory(
        `agent:${sourceMemory.agentId}`,
        100
      );

      for (const result of temporalResults.memories) {
        if (processed.has(result.memory.structuredKey)) continue;

        const memoryTime = new Date(result.memory.createdAt).getTime();
        if (Math.abs(sourceTime - memoryTime) <= timeWindow) {
          related.push({
            structuredKey: result.memory.structuredKey,
            content: result.memory.userRequest,
            relationshipType: 'temporal',
            similarity: 1.0 - (Math.abs(sourceTime - memoryTime) / timeWindow),
            depth: 1
          });

          processed.add(result.memory.structuredKey);
        }
      }

      // Sort by similarity and limit results
      return related
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, 20);

    } catch (error: any) {
      throw new Error(`Related memory search failed: ${error.message}`);
    }
  }

  /**
   * Advanced search with comprehensive filtering
   */
  async searchWithFilters(searchQuery: SearchQuery): Promise<FilteredResults> {
    await this.ensureInitialized();

    const startTime = Date.now();

    try {
      // Construct search query with filters
      let queryString = searchQuery.query;
      
      if (searchQuery.filters.agentId) {
        queryString += ` agent:${searchQuery.filters.agentId}`;
      }
      
      if (searchQuery.filters.projectName) {
        queryString += ` project:${searchQuery.filters.projectName}`;
      }
      
      if (searchQuery.filters.sessionName) {
        queryString += ` session:${searchQuery.filters.sessionName}`;
      }

      // Execute search
      const searchResult = await this.cbdEngine.search_memory(
        queryString,
        searchQuery.options.limit * 2, // Get more for filtering
        searchQuery.options.minScore
      );

      // Apply additional filters
      let filteredMemories = searchResult.memories;

      // Date range filter
      if (searchQuery.filters.dateRange) {
        const startDate = new Date(searchQuery.filters.dateRange.start);
        const endDate = new Date(searchQuery.filters.dateRange.end);
        
        filteredMemories = filteredMemories.filter(result => {
          const memoryDate = new Date(result.memory.createdAt);
          return memoryDate >= startDate && memoryDate <= endDate;
        });
      }

      // Importance filter
      if (searchQuery.filters.importance) {
        filteredMemories = filteredMemories.filter(result => {
          const importance = result.memory.confidenceScore;
          return importance >= searchQuery.filters.importance!.min &&
                 importance <= searchQuery.filters.importance!.max;
        });
      }

      // Tags filter
      if (searchQuery.filters.tags && searchQuery.filters.tags.length > 0) {
        filteredMemories = filteredMemories.filter(result => {
          const memoryTags = result.memory.metadata?.tags || [];
          return searchQuery.filters.tags!.some(tag => memoryTags.includes(tag));
        });
      }

      // Limit results
      const limitedResults = filteredMemories.slice(0, searchQuery.options.limit);

      // Generate facets
      const facets = this.generateFacets(filteredMemories);

      // Format results
      const results = limitedResults.map(result => ({
        structuredKey: result.memory.structuredKey,
        content: result.memory.userRequest,
        score: result.relevanceScore,
        metadata: searchQuery.options.includeMetadata ? result.memory.metadata : undefined,
        highlights: this.generateHighlights(result.memory.userRequest, searchQuery.query)
      }));

      return {
        query: searchQuery,
        totalFound: searchResult.memories.length,
        filteredCount: filteredMemories.length,
        executionTime: Date.now() - startTime,
        results,
        facets
      };

    } catch (error: any) {
      throw new Error(`Filtered search failed: ${error.message}`);
    }
  }

  /**
   * Generate comprehensive memory analytics
   */
  async getMemoryAnalytics(agentId: string, timeRange: { start: string; end: string }): Promise<MemoryAnalytics> {
    await this.ensureInitialized();

    try {
      // Get all memories for the agent in the time range
      const searchResult = await this.cbdEngine.search_memory(`agent:${agentId}`, 10000);
      const startDate = new Date(timeRange.start);
      const endDate = new Date(timeRange.end);

      const memories = searchResult.memories.filter(result => {
        const memoryDate = new Date(result.memory.createdAt);
        return result.memory.agentId === agentId &&
               memoryDate >= startDate &&
               memoryDate <= endDate;
      });

      // Calculate basic metrics
      const totalMemories = memories.length;
      const averageImportance = memories.reduce((sum, m) => sum + m.memory.confidenceScore, 0) / totalMemories;

      // Project analysis
      const projectCounts = new Map<string, number>();
      memories.forEach(m => {
        const project = m.memory.projectName;
        projectCounts.set(project, (projectCounts.get(project) || 0) + 1);
      });

      const topProjects = Array.from(projectCounts.entries())
        .map(([name, count]) => ({
          name,
          count,
          percentage: (count / totalMemories) * 100
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      // Session analysis
      const sessionCounts = new Map<string, number>();
      memories.forEach(m => {
        const session = m.memory.sessionName;
        sessionCounts.set(session, (sessionCounts.get(session) || 0) + 1);
      });

      const topSessions = Array.from(sessionCounts.entries())
        .map(([name, count]) => ({
          name,
          count,
          percentage: (count / totalMemories) * 100
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      // Memory trends by day
      const dailyCounts = new Map<string, { count: number; totalImportance: number }>();
      memories.forEach(m => {
        const date = new Date(m.memory.createdAt).toISOString().split('T')[0];
        const existing = dailyCounts.get(date) || { count: 0, totalImportance: 0 };
        dailyCounts.set(date, {
          count: existing.count + 1,
          totalImportance: existing.totalImportance + m.memory.confidenceScore
        });
      });

      const memoryTrends = Array.from(dailyCounts.entries())
        .map(([date, data]) => ({
          date,
          count: data.count,
          avgImportance: data.totalImportance / data.count
        }))
        .sort((a, b) => a.date.localeCompare(b.date));

      // Semantic clustering
      const semanticClusters = await this.clusterMemories(agentId, 0.7);

      return {
        agentId,
        timeRange,
        totalMemories,
        averageImportance,
        topProjects,
        topSessions,
        memoryTrends,
        semanticClusters,
        performanceMetrics: {
          averageResponseTime: 50, // ms - placeholder
          successRate: 99.9,
          errorRate: 0.1
        }
      };

    } catch (error: any) {
      throw new Error(`Analytics generation failed: ${error.message}`);
    }
  }

  /**
   * Private helper methods
   */
  private async ensureInitialized(): Promise<void> {
    if (!this.initialized) {
      await this.initialize();
    }
  }

  private async extractTheme(content: string): Promise<string> {
    // Simple theme extraction - could be enhanced with NLP
    const words = content.toLowerCase().split(/\s+/);
    const commonWords = ['function', 'class', 'method', 'database', 'api', 'service', 'component'];
    const foundWords = words.filter(word => commonWords.includes(word));
    return foundWords.length > 0 ? foundWords[0] : 'general';
  }

  private async calculateSimilarity(vector1: number[], vector2: number[]): Promise<number> {
    if (vector1.length !== vector2.length) return 0;
    
    let dotProduct = 0;
    let norm1 = 0;
    let norm2 = 0;
    
    for (let i = 0; i < vector1.length; i++) {
      dotProduct += vector1[i] * vector2[i];
      norm1 += vector1[i] * vector1[i];
      norm2 += vector2[i] * vector2[i];
    }
    
    return dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2));
  }

  private generateFacets(memories: any[]): any {
    const projects = new Map<string, number>();
    const sessions = new Map<string, number>();
    const agents = new Map<string, number>();
    const dates = new Map<string, number>();
    const tags = new Map<string, number>();

    memories.forEach(result => {
      const memory = result.memory;
      
      // Projects
      projects.set(memory.projectName, (projects.get(memory.projectName) || 0) + 1);
      
      // Sessions
      sessions.set(memory.sessionName, (sessions.get(memory.sessionName) || 0) + 1);
      
      // Agents
      agents.set(memory.agentId, (agents.get(memory.agentId) || 0) + 1);
      
      // Dates
      const date = new Date(memory.createdAt).toISOString().split('T')[0];
      dates.set(date, (dates.get(date) || 0) + 1);
      
      // Tags
      if (memory.metadata?.tags) {
        memory.metadata.tags.forEach((tag: string) => {
          tags.set(tag, (tags.get(tag) || 0) + 1);
        });
      }
    });

    return {
      projects: Array.from(projects.entries()).map(([name, count]) => ({ name, count })),
      sessions: Array.from(sessions.entries()).map(([name, count]) => ({ name, count })),
      agents: Array.from(agents.entries()).map(([name, count]) => ({ name, count })),
      dates: Array.from(dates.entries()).map(([date, count]) => ({ date, count })),
      tags: Array.from(tags.entries()).map(([tag, count]) => ({ tag, count }))
    };
  }

  private generateHighlights(content: string, query: string): string[] {
    const queryWords = query.toLowerCase().split(/\s+/);
    const highlights: string[] = [];
    
    queryWords.forEach(word => {
      const regex = new RegExp(`\\b${word}\\b`, 'gi');
      const matches = content.match(regex);
      if (matches) {
        highlights.push(...matches);
      }
    });
    
    return [...new Set(highlights)];
  }

  /**
   * Cleanup and shutdown
   */
  async shutdown(): Promise<void> {
    if (this.cbdEngine) {
      await this.cbdEngine.shutdown();
    }
    this.initialized = false;
    console.log('🛑 Advanced Memory Operations shut down');
  }
}
