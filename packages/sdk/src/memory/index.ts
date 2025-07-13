import type { CodaiConfig } from '../types';
import { HttpUtils, ValidationUtils, ErrorUtils, CryptoUtils } from '../utils';

// Memory interfaces for memorai.ro integration
export interface Memory {
  id: string;
  content: string;
  metadata: MemoryMetadata;
  agentId: string;
  contextId?: string;
  createdAt: Date;
  relevance?: number;
}

export interface MemoryMetadata {
  type: 'fact' | 'procedure' | 'preference' | 'context' | 'task' | 'conversation';
  importance: number; // 0-1 scale
  tags: string[];
  entityType?: string;
  priority?: 'low' | 'medium' | 'high' | 'critical';
  expiresAt?: Date;
  context?: Record<string, any>;
  emotional_weight?: number;
}

export interface MemorySearchOptions {
  query: string;
  limit?: number;
  threshold?: number;
  contextId?: string;
  agentId?: string;
  type?: MemoryMetadata['type'];
  tags?: string[];
  dateRange?: { start?: Date; end?: Date };
}

export interface MemoryContext {
  id: string;
  agentId: string;
  name: string;
  description?: string;
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
  active: boolean;
}

export interface AgentProfile {
  id: string;
  name: string;
  description: string;
  capabilities: string[];
  memoryConfig: {
    maxMemories: number;
    retentionPeriod: number;
    autoCleanup: boolean;
  };
  createdAt: Date;
}

// Memory service for CODAI ecosystem (memorai.ro integration)
export class MemoryService {
  private config: CodaiConfig;
  private httpClient: any;

  constructor(config: CodaiConfig) {
    this.config = config;
    this.httpClient = HttpUtils.createHttpClient(
      config.endpoints?.memory || 'https://memorai.ro/api'
    );
  }

  /**
   * Store memory for an agent
   */
  async remember(
    agentId: string,
    content: string,
    metadata: Partial<MemoryMetadata> = {},
    contextId?: string
  ): Promise<string> {
    try {
      const memoryData = {
        id: CryptoUtils.generateUUID(),
        agentId,
        content,
        contextId,
        metadata: {
          type: 'fact',
          importance: 0.5,
          tags: [],
          ...metadata,
          entityType: metadata.entityType || 'general'
        }
      };

      const response = await this.httpClient.post('/memory/store', memoryData);
      return response.data.id;
    } catch (error) {
      throw ErrorUtils.createError(
        'Failed to store memory',
        'MEMORY_STORE_FAILED',
        error
      );
    }
  }

  /**
   * Recall memories for an agent
   */
  async recall(
    agentId: string,
    query: string,
    options: Omit<MemorySearchOptions, 'query' | 'agentId'> = {}
  ): Promise<Memory[]> {
    try {
      const searchOptions: MemorySearchOptions = {
        query,
        agentId,
        limit: 10,
        threshold: 0.7,
        ...options
      };

      const response = await this.httpClient.post('/memory/search', searchOptions);
      return response.data.memories || [];
    } catch (error) {
      throw ErrorUtils.createError(
        'Failed to recall memories',
        'MEMORY_RECALL_FAILED',
        error
      );
    }
  }

  /**
   * Forget a specific memory
   */
  async forget(agentId: string, memoryId: string): Promise<void> {
    try {
      await this.httpClient.delete('/memory/forget', {
        data: { agentId, memoryId }
      });
    } catch (error) {
      throw ErrorUtils.createError(
        'Failed to forget memory',
        'MEMORY_FORGET_FAILED',
        error
      );
    }
  }

  /**
   * Get agent's context
   */
  async getContext(agentId: string, contextSize?: number): Promise<Memory[]> {
    try {
      const response = await this.httpClient.get('/memory/context', {
        params: { agentId, contextSize: contextSize || 50 }
      });
      return response.data.context || [];
    } catch (error) {
      throw ErrorUtils.createError(
        'Failed to get context',
        'CONTEXT_GET_FAILED',
        error
      );
    }
  }

  /**
   * Create a new context for an agent
   */
  async createContext(
    agentId: string,
    name: string,
    description?: string,
    metadata: Record<string, any> = {}
  ): Promise<string> {
    try {
      const contextData = {
        id: CryptoUtils.generateUUID(),
        agentId,
        name,
        description,
        metadata,
        active: true
      };

      const response = await this.httpClient.post('/contexts', contextData);
      return response.data.id;
    } catch (error) {
      throw ErrorUtils.createError(
        'Failed to create context',
        'CONTEXT_CREATE_FAILED',
        error
      );
    }
  }

  /**
   * Update context data
   */
  async updateContext(
    contextId: string,
    data: Partial<MemoryContext>
  ): Promise<MemoryContext> {
    try {
      const response = await this.httpClient.patch(`/contexts/${contextId}`, data);
      return response.data;
    } catch (error) {
      throw ErrorUtils.createError(
        'Failed to update context',
        'CONTEXT_UPDATE_FAILED',
        error
      );
    }
  }

  /**
   * Delete a context
   */
  async deleteContext(contextId: string): Promise<void> {
    try {
      await this.httpClient.delete(`/contexts/${contextId}`);
    } catch (error) {
      throw ErrorUtils.createError(
        'Failed to delete context',
        'CONTEXT_DELETE_FAILED',
        error
      );
    }
  }

  /**
   * List agent's contexts
   */
  async listContexts(agentId: string): Promise<MemoryContext[]> {
    try {
      const response = await this.httpClient.get('/contexts', {
        params: { agentId }
      });
      return response.data.contexts || [];
    } catch (error) {
      throw ErrorUtils.createError(
        'Failed to list contexts',
        'CONTEXT_LIST_FAILED',
        error
      );
    }
  }

  /**
   * Create or get agent profile
   */
  async createAgentProfile(
    agentId: string,
    profile: Omit<AgentProfile, 'id' | 'createdAt'>
  ): Promise<AgentProfile> {
    try {
      const profileData = {
        id: agentId,
        ...profile,
        createdAt: new Date()
      };

      const response = await this.httpClient.post('/agents', profileData);
      return response.data;
    } catch (error) {
      throw ErrorUtils.createError(
        'Failed to create agent profile',
        'AGENT_CREATE_FAILED',
        error
      );
    }
  }

  /**
   * Get agent profile
   */
  async getAgentProfile(agentId: string): Promise<AgentProfile> {
    try {
      const response = await this.httpClient.get(`/agents/${agentId}`);
      return response.data;
    } catch (error) {
      throw ErrorUtils.createError(
        'Failed to get agent profile',
        'AGENT_GET_FAILED',
        error
      );
    }
  }

  /**
   * Update agent profile
   */
  async updateAgentProfile(
    agentId: string,
    updates: Partial<AgentProfile>
  ): Promise<AgentProfile> {
    try {
      const response = await this.httpClient.patch(`/agents/${agentId}`, updates);
      return response.data;
    } catch (error) {
      throw ErrorUtils.createError(
        'Failed to update agent profile',
        'AGENT_UPDATE_FAILED',
        error
      );
    }
  }

  /**
   * Get memory statistics for an agent
   */
  async getMemoryStats(agentId: string): Promise<{
    totalMemories: number;
    memoryTypes: Record<string, number>;
    contextCount: number;
    averageImportance: number;
    oldestMemory: Date;
    newestMemory: Date;
  }> {
    try {
      const response = await this.httpClient.get(`/agents/${agentId}/stats`);
      return response.data;
    } catch (error) {
      throw ErrorUtils.createError(
        'Failed to get memory stats',
        'STATS_FAILED',
        error
      );
    }
  }

  /**
   * Clean up old memories based on retention policy
   */
  async cleanupMemories(
    agentId: string,
    retentionPeriod?: number
  ): Promise<{ deletedCount: number }> {
    try {
      const response = await this.httpClient.post(`/agents/${agentId}/cleanup`, {
        retentionPeriod: retentionPeriod || 30 * 24 * 60 * 60 * 1000 // 30 days default
      });
      return response.data;
    } catch (error) {
      throw ErrorUtils.createError(
        'Failed to cleanup memories',
        'CLEANUP_FAILED',
        error
      );
    }
  }

  /**
   * Export agent memories
   */
  async exportMemories(
    agentId: string,
    format: 'json' | 'csv' = 'json'
  ): Promise<Blob> {
    try {
      const response = await this.httpClient.get(`/agents/${agentId}/export`, {
        params: { format },
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      throw ErrorUtils.createError(
        'Failed to export memories',
        'EXPORT_FAILED',
        error
      );
    }
  }

  /**
   * Import agent memories
   */
  async importMemories(
    agentId: string,
    file: File,
    options: { merge?: boolean; overwrite?: boolean } = {}
  ): Promise<{ importedCount: number; skippedCount: number }> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('options', JSON.stringify(options));

      const response = await this.httpClient.post(
        `/agents/${agentId}/import`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      return response.data;
    } catch (error) {
      throw ErrorUtils.createError(
        'Failed to import memories',
        'IMPORT_FAILED',
        error
      );
    }
  }

  /**
   * Search across all agent memories (admin function)
   */
  async globalSearch(
    query: string,
    options: Omit<MemorySearchOptions, 'query'> = {}
  ): Promise<Memory[]> {
    try {
      const searchOptions = {
        query,
        limit: 50,
        threshold: 0.7,
        ...options
      };

      const response = await this.httpClient.post('/memory/global-search', searchOptions);
      return response.data.memories || [];
    } catch (error) {
      throw ErrorUtils.createError(
        'Failed to perform global search',
        'GLOBAL_SEARCH_FAILED',
        error
      );
    }
  }
}
