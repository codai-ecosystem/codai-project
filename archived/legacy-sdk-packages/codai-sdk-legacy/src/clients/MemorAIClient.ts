/**
 * MemorAI Client for CODAI SDK
 * Manages AI memory systems, knowledge graphs, and intelligent recall
 */

import type { 
  CODAIConfig, 
  ApiResponse, 
  ServiceHealth,
  PaginationParams,
  PaginatedResponse
} from '../types/common';
import type { 
  Memory, 
  MemoryQuery, 
  MemoryCollection 
} from '../types/services';
import { BaseClient } from './BaseClient';

export class MemorAIClient extends BaseClient {
  constructor(config: CODAIConfig) {
    super(config.endpoints.memorai, config);
  }

  /**
   * Get MemorAI service health status
   */
  async health(): Promise<ApiResponse<ServiceHealth>> {
    return this.request<ServiceHealth>({
      method: 'GET',
      url: '/health'
    });
  }

  /**
   * Get MemorAI overview
   */
  async getOverview(): Promise<ApiResponse<{
    memories: {
      total: number;
      byType: Record<string, number>;
      recent: number;
    };
    collections: {
      total: number;
      active: number;
      shared: number;
    };
    agents: {
      total: number;
      active: number;
      memoryUsage: Array<{
        agentId: string;
        memoryCount: number;
        storageUsed: number;
      }>;
    };
    performance: {
      averageRecallTime: number;
      searchAccuracy: number;
      storageEfficiency: number;
    };
    insights: Array<{
      type: 'trend' | 'pattern' | 'anomaly';
      description: string;
      confidence: number;
    }>;
  }>> {
    return this.request({
      method: 'GET',
      url: '/overview'
    });
  }

  // Memory Management

  /**
   * Get all memories
   */
  async getMemories(
    filters?: {
      type?: 'text' | 'image' | 'audio' | 'video' | 'document';
      tags?: string[];
      collection?: string;
      agentId?: string;
      dateRange?: {
        start: string;
        end: string;
      };
      relevanceThreshold?: number;
    },
    pagination?: PaginationParams
  ): Promise<ApiResponse<PaginatedResponse<Memory>>> {
    return this.request<PaginatedResponse<Memory>>({
      method: 'GET',
      url: '/memories',
      params: { ...filters, ...pagination }
    });
  }

  /**
   * Get memory by ID
   */
  async getMemory(memoryId: string): Promise<ApiResponse<Memory>> {
    return this.request<Memory>({
      method: 'GET',
      url: `/memories/${memoryId}`
    });
  }

  /**
   * Create new memory
   */
  async createMemory(memory: {
    content: string;
    type: 'text' | 'image' | 'audio' | 'video' | 'document';
    tags?: string[];
    metadata?: Record<string, any>;
    collection?: string;
    agentId?: string;
    importance?: number;
  }): Promise<ApiResponse<Memory>> {
    return this.request<Memory>({
      method: 'POST',
      url: '/memories',
      data: memory
    });
  }

  /**
   * Update memory
   */
  async updateMemory(
    memoryId: string,
    updates: Partial<Memory>
  ): Promise<ApiResponse<Memory>> {
    return this.request<Memory>({
      method: 'PUT',
      url: `/memories/${memoryId}`,
      data: updates
    });
  }

  /**
   * Delete memory
   */
  async deleteMemory(memoryId: string): Promise<ApiResponse<void>> {
    return this.request<void>({
      method: 'DELETE',
      url: `/memories/${memoryId}`
    });
  }

  /**
   * Batch create memories
   */
  async batchCreateMemories(
    memories: Array<{
      content: string;
      type: 'text' | 'image' | 'audio' | 'video' | 'document';
      tags?: string[];
      metadata?: Record<string, any>;
      collection?: string;
      importance?: number;
    }>
  ): Promise<ApiResponse<{
    created: Memory[];
    failed: Array<{
      index: number;
      error: string;
    }>;
    summary: {
      total: number;
      successful: number;
      failed: number;
    };
  }>> {
    return this.request({
      method: 'POST',
      url: '/memories/batch',
      data: { memories }
    });
  }

  // Memory Search & Recall

  /**
   * Search memories
   */
  async searchMemories(query: MemoryQuery): Promise<ApiResponse<{
    memories: Array<Memory & { relevance: number }>;
    totalFound: number;
    searchTime: number;
    suggestions?: string[];
  }>> {
    return this.request({
      method: 'POST',
      url: '/memories/search',
      data: query
    });
  }

  /**
   * Semantic search with vector similarity
   */
  async semanticSearch(
    query: string,
    options?: {
      limit?: number;
      threshold?: number;
      collections?: string[];
      agentId?: string;
      includeEmbeddings?: boolean;
    }
  ): Promise<ApiResponse<{
    memories: Array<Memory & { 
      similarity: number;
      embedding?: number[];
    }>;
    query_embedding?: number[];
    searchTime: number;
  }>> {
    return this.request({
      method: 'POST',
      url: '/memories/semantic-search',
      data: { query, options }
    });
  }

  /**
   * Get related memories
   */
  async getRelatedMemories(
    memoryId: string,
    options?: {
      limit?: number;
      similarity_threshold?: number;
      include_semantic?: boolean;
      include_temporal?: boolean;
      include_contextual?: boolean;
    }
  ): Promise<ApiResponse<{
    related: Array<Memory & { 
      relation_type: 'semantic' | 'temporal' | 'contextual';
      strength: number;
    }>;
    clusters?: Array<{
      theme: string;
      memories: string[];
      coherence: number;
    }>;
  }>> {
    return this.request({
      method: 'GET',
      url: `/memories/${memoryId}/related`,
      params: options
    });
  }

  /**
   * Auto-tag memories using AI
   */
  async autoTagMemories(
    memoryIds: string[],
    options?: {
      confidence_threshold?: number;
      max_tags?: number;
      include_entities?: boolean;
      include_topics?: boolean;
    }
  ): Promise<ApiResponse<{
    results: Array<{
      memoryId: string;
      suggested_tags: Array<{
        tag: string;
        confidence: number;
        type: 'entity' | 'topic' | 'category';
      }>;
    }>;
    tag_dictionary: Record<string, {
      frequency: number;
      related: string[];
    }>;
  }>> {
    return this.request({
      method: 'POST',
      url: '/memories/auto-tag',
      data: { memoryIds, options }
    });
  }

  // Collections Management

  /**
   * Get all collections
   */
  async getCollections(agentId?: string): Promise<ApiResponse<MemoryCollection[]>> {
    return this.request<MemoryCollection[]>({
      method: 'GET',
      url: '/collections',
      params: agentId ? { agentId } : undefined
    });
  }

  /**
   * Get collection by ID
   */
  async getCollection(collectionId: string): Promise<ApiResponse<MemoryCollection>> {
    return this.request<MemoryCollection>({
      method: 'GET',
      url: `/collections/${collectionId}`
    });
  }

  /**
   * Create new collection
   */
  async createCollection(collection: {
    name: string;
    description: string;
    agentId?: string;
    isPublic?: boolean;
    tags?: string[];
  }): Promise<ApiResponse<MemoryCollection>> {
    return this.request<MemoryCollection>({
      method: 'POST',
      url: '/collections',
      data: collection
    });
  }

  /**
   * Update collection
   */
  async updateCollection(
    collectionId: string,
    updates: Partial<MemoryCollection>
  ): Promise<ApiResponse<MemoryCollection>> {
    return this.request<MemoryCollection>({
      method: 'PUT',
      url: `/collections/${collectionId}`,
      data: updates
    });
  }

  /**
   * Delete collection
   */
  async deleteCollection(collectionId: string): Promise<ApiResponse<void>> {
    return this.request<void>({
      method: 'DELETE',
      url: `/collections/${collectionId}`
    });
  }

  /**
   * Add memory to collection
   */
  async addMemoryToCollection(
    collectionId: string,
    memoryId: string
  ): Promise<ApiResponse<void>> {
    return this.request<void>({
      method: 'POST',
      url: `/collections/${collectionId}/memories/${memoryId}`
    });
  }

  /**
   * Remove memory from collection
   */
  async removeMemoryFromCollection(
    collectionId: string,
    memoryId: string
  ): Promise<ApiResponse<void>> {
    return this.request<void>({
      method: 'DELETE',
      url: `/collections/${collectionId}/memories/${memoryId}`
    });
  }

  // Agent Memory Management

  /**
   * Get agent profile
   */
  async getAgentProfile(agentId: string): Promise<ApiResponse<{
    id: string;
    name: string;
    description: string;
    capabilities: string[];
    memory_stats: {
      total_memories: number;
      memory_types: Record<string, number>;
      storage_used: number;
      last_activity: string;
    };
    preferences: {
      auto_tagging: boolean;
      semantic_search: boolean;
      memory_retention_days: number;
      privacy_level: 'private' | 'shared' | 'public';
    };
    performance: {
      recall_accuracy: number;
      search_speed: number;
      memory_efficiency: number;
    };
  }>> {
    return this.request({
      method: 'GET',
      url: `/agents/${agentId}/profile`
    });
  }

  /**
   * Update agent preferences
   */
  async updateAgentPreferences(
    agentId: string,
    preferences: {
      auto_tagging?: boolean;
      semantic_search?: boolean;
      memory_retention_days?: number;
      privacy_level?: 'private' | 'shared' | 'public';
    }
  ): Promise<ApiResponse<void>> {
    return this.request<void>({
      method: 'PUT',
      url: `/agents/${agentId}/preferences`,
      data: preferences
    });
  }

  /**
   * Clear agent memories
   */
  async clearAgentMemories(
    agentId: string,
    options?: {
      older_than_days?: number;
      types?: string[];
      keep_important?: boolean;
    }
  ): Promise<ApiResponse<{
    cleared: number;
    remaining: number;
    storage_freed: number;
  }>> {
    return this.request({
      method: 'DELETE',
      url: `/agents/${agentId}/memories`,
      data: options
    });
  }

  // Analytics & Insights

  /**
   * Get memory analytics
   */
  async getAnalytics(options?: {
    agentId?: string;
    period?: '24h' | '7d' | '30d' | '90d';
    include_trends?: boolean;
  }): Promise<ApiResponse<{
    memory_stats: {
      total: number;
      created_in_period: number;
      accessed_in_period: number;
      by_type: Record<string, number>;
      by_tag: Record<string, number>;
    };
    search_stats: {
      total_searches: number;
      average_results: number;
      average_relevance: number;
      popular_queries: Array<{
        query: string;
        count: number;
      }>;
    };
    performance: {
      storage_usage: number;
      search_speed: number;
      recall_accuracy: number;
    };
    trends?: Array<{
      metric: string;
      trend: 'up' | 'down' | 'stable';
      change_percentage: number;
      period: string;
    }>;
  }>> {
    return this.request({
      method: 'GET',
      url: '/analytics',
      params: options
    });
  }

  /**
   * Get memory insights
   */
  async getInsights(agentId?: string): Promise<ApiResponse<{
    patterns: Array<{
      type: 'temporal' | 'topical' | 'behavioral';
      description: string;
      confidence: number;
      evidence: string[];
    }>;
    recommendations: Array<{
      category: 'optimization' | 'organization' | 'search' | 'retention';
      title: string;
      description: string;
      impact: 'low' | 'medium' | 'high';
      effort: 'low' | 'medium' | 'high';
    }>;
    knowledge_gaps: Array<{
      topic: string;
      confidence: number;
      suggestions: string[];
    }>;
    memory_health: {
      score: number;
      factors: Array<{
        name: string;
        score: number;
        description: string;
      }>;
    };
  }>> {
    return this.request({
      method: 'GET',
      url: '/insights',
      params: agentId ? { agentId } : undefined
    });
  }

  // Memory Graph & Visualization

  /**
   * Get memory graph
   */
  async getMemoryGraph(options?: {
    agentId?: string;
    collection?: string;
    depth?: number;
    min_similarity?: number;
    include_metadata?: boolean;
  }): Promise<ApiResponse<{
    nodes: Array<{
      id: string;
      label: string;
      type: string;
      size: number;
      color: string;
      metadata?: Record<string, any>;
    }>;
    edges: Array<{
      id: string;
      source: string;
      target: string;
      weight: number;
      type: 'semantic' | 'temporal' | 'contextual';
      metadata?: Record<string, any>;
    }>;
    clusters: Array<{
      id: string;
      label: string;
      nodes: string[];
      coherence: number;
    }>;
    statistics: {
      total_nodes: number;
      total_edges: number;
      density: number;
      clustering_coefficient: number;
    };
  }>> {
    return this.request({
      method: 'GET',
      url: '/graph',
      params: options
    });
  }

  /**
   * Export memories
   */
  async exportMemories(options: {
    format: 'json' | 'csv' | 'xlsx';
    agentId?: string;
    collections?: string[];
    include_embeddings?: boolean;
    date_range?: {
      start: string;
      end: string;
    };
  }): Promise<ApiResponse<{
    downloadUrl: string;
    filename: string;
    size: number;
    memory_count: number;
    expiresAt: string;
  }>> {
    return this.request({
      method: 'POST',
      url: '/export',
      data: options
    });
  }

  /**
   * Import memories
   */
  async importMemories(
    file: File | Buffer,
    options?: {
      format: 'json' | 'csv' | 'xlsx';
      agentId?: string;
      collection?: string;
      merge_duplicates?: boolean;
      auto_tag?: boolean;
    }
  ): Promise<ApiResponse<{
    imported: number;
    skipped: number;
    errors: Array<{
      line: number;
      error: string;
    }>;
    created_memories: string[];
  }>> {
    const formData = new FormData();
    formData.append('file', file);
    
    if (options) {
      formData.append('options', JSON.stringify(options));
    }

    return this.request({
      method: 'POST',
      url: '/import',
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  }
}
