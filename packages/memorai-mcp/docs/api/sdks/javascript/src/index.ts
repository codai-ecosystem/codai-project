/**
 * MemorAI MCP Client - TypeScript SDK
 * 
 * Official TypeScript/JavaScript client library for the MemorAI MCP Server.
 * Provides a comprehensive, type-safe interface for all memory operations.
 * 
 * @author MemorAI Team
 * @version 1.5.0
 * @license MIT
 */

import axios, { AxiosInstance, AxiosError, AxiosRequestConfig } from 'axios';
import WebSocket from 'ws';

// ============================================================================
// Type Definitions
// ============================================================================

interface MemorAIClientConfig {
  /** API key for authentication */
  apiKey: string;
  /** Base URL for the MemorAI API */
  baseUrl?: string;
  /** Request timeout in milliseconds */
  timeout?: number;
  /** Maximum number of retry attempts */
  maxRetries?: number;
  /** Enable debug logging */
  debug?: boolean;
  /** Custom headers to include in requests */
  headers?: Record<string, string>;
}

interface Memory {
  memoryId: string;
  structuredKey: string;
  content: string;
  metadata: MemoryMetadata;
  relevanceScore?: number;
  timestamp: string;
}

interface MemoryMetadata {
  importance?: number;
  tags?: string[];
  project?: string;
  session?: string;
  entityType?: string;
  priority?: 'low' | 'medium' | 'high' | 'critical';
  [key: string]: any;
}

interface RememberRequest {
  agentId: string;
  content: string;
  metadata?: MemoryMetadata;
}

interface RememberResponse {
  success: boolean;
  memoryId: string;
  structuredKey: string;
  importance: number;
  embeddings_generated: boolean;
  entities_extracted: string[];
  timestamp: string;
}

interface RecallRequest {
  agentId: string;
  query: string;
  limit?: number;
  minImportance?: number;
  project?: string;
  session?: string;
  includeOtherAgents?: boolean;
}

interface RecallResponse {
  success: boolean;
  memories: Memory[];
  totalResults: number;
  searchTime: number;
  query: string;
}

interface ContextResponse {
  agentId: string;
  contextSize: number;
  memories: Memory[];
  summary?: string;
  timestamp: string;
}

interface HealthResponse {
  status: 'healthy' | 'degraded' | 'unhealthy';
  service: string;
  version: string;
  uptime: number;
  timestamp: string;
  dependencies: {
    database: 'healthy' | 'unhealthy';
    redis: 'healthy' | 'unhealthy';
    vector_store: 'healthy' | 'unhealthy';
  };
}

interface AnalyticsDashboard {
  agentId: string;
  totalMemories: number;
  memoryGrowthRate: number;
  averageImportance: number;
  topTags: string[];
  temporalPatterns: {
    dailyActivity: number[];
    peakHours: number[];
  };
  searchPatterns: {
    mostSearchedTerms: string[];
    searchFrequency: number;
  };
  performanceMetrics: {
    avgSearchTime: number;
    cacheHitRate: number;
    successRate: number;
  };
}

interface APIError {
  code: string;
  message: string;
  details?: any;
  timestamp: string;
  request_id: string;
}

class MemorAIError extends Error {
  public readonly code: string;
  public readonly statusCode?: number;
  public readonly requestId?: string;
  public readonly details?: any;

  constructor(error: APIError, statusCode?: number) {
    super(error.message);
    this.name = 'MemorAIError';
    this.code = error.code;
    this.statusCode = statusCode;
    this.requestId = error.request_id;
    this.details = error.details;
  }
}

// ============================================================================
// Main Client Class
// ============================================================================

export class MemorAIClient {
  private readonly http: AxiosInstance;
  private readonly config: Required<MemorAIClientConfig>;

  constructor(config: MemorAIClientConfig) {
    this.config = {
      baseUrl: 'https://api.memorai.com/v1',
      timeout: 30000,
      maxRetries: 3,
      debug: false,
      headers: {},
      ...config,
    };

    this.http = axios.create({
      baseURL: this.config.baseUrl,
      timeout: this.config.timeout,
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json',
        'User-Agent': 'MemorAI-JS-Client/1.5.0',
        ...this.config.headers,
      },
    });

    // Request interceptor
    this.http.interceptors.request.use(
      (config) => {
        if (this.config.debug) {
          console.log(`🚀 ${config.method?.toUpperCase()} ${config.url}`, config.data);
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor
    this.http.interceptors.response.use(
      (response) => {
        if (this.config.debug) {
          console.log(`✅ ${response.status} ${response.statusText}`, response.data);
        }
        return response;
      },
      async (error: AxiosError) => {
        const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

        if (this.shouldRetry(error) && !originalRequest._retry) {
          originalRequest._retry = true;

          // Exponential backoff
          const delay = Math.pow(2, (originalRequest as any)._retryCount || 0) * 1000;
          await new Promise(resolve => setTimeout(resolve, delay));

          return this.http(originalRequest);
        }

        this.handleError(error);
        return Promise.reject(error);
      }
    );
  }

  private shouldRetry(error: AxiosError): boolean {
    if (!error.response) return true; // Network error

    const status = error.response.status;
    return status >= 500 || status === 429; // Server error or rate limit
  }

  private handleError(error: AxiosError): void {
    if (error.response?.data) {
      const apiError = error.response.data as { error: APIError };
      if (apiError.error) {
        throw new MemorAIError(apiError.error, error.response.status);
      }
    }

    // Fallback error handling
    const fallbackError: APIError = {
      code: 'UNKNOWN_ERROR',
      message: error.message || 'An unknown error occurred',
      timestamp: new Date().toISOString(),
      request_id: 'unknown',
    };

    throw new MemorAIError(fallbackError, error.response?.status);
  }

  // ============================================================================
  // System Operations
  // ============================================================================

  /**
   * Check the health status of the MemorAI MCP Server
   */
  public async healthCheck(): Promise<HealthResponse> {
    const response = await this.http.get<HealthResponse>('/health');
    return response.data;
  }

  // ============================================================================
  // Memory Management Operations
  // ============================================================================

  /**
   * Store a new memory with content and metadata
   */
  public async rememberMemory(request: RememberRequest): Promise<RememberResponse> {
    const response = await this.http.post<RememberResponse>('/api/memory/remember', request);
    return response.data;
  }

  /**
   * Search and retrieve memories using advanced hybrid search
   */
  public async recallMemories(request: RecallRequest): Promise<RecallResponse> {
    const response = await this.http.get<RecallResponse>('/api/memory/recall', {
      params: request,
    });
    return response.data;
  }

  /**
   * Get recent context for an agent
   */
  public async getContext(agentId: string, contextSize: number = 5): Promise<ContextResponse> {
    const response = await this.http.get<ContextResponse>('/api/memory/context', {
      params: { agentId, contextSize },
    });
    return response.data;
  }

  /**
   * Delete a memory by structured key
   */
  public async forgetMemory(agentId: string, structuredKey: string): Promise<{ success: boolean }> {
    const response = await this.http.delete<{ success: boolean }>('/api/memory/forget', {
      params: { agentId, structuredKey },
    });
    return response.data;
  }

  // ============================================================================
  // Analytics Operations
  // ============================================================================

  /**
   * Get comprehensive analytics dashboard for an agent
   */
  public async getAnalyticsDashboard(agentId: string): Promise<AnalyticsDashboard> {
    const response = await this.http.get<AnalyticsDashboard>('/api/analytics/dashboard', {
      params: { agentId },
    });
    return response.data;
  }

  /**
   * Generate intelligent insights about agent's memories
   */
  public async generateInsights(agentId: string): Promise<any> {
    const response = await this.http.get(`/api/analytics/insights`, {
      params: { agentId },
    });
    return response.data;
  }

  /**
   * Analyze temporal patterns in agent's memory usage
   */
  public async analyzeTemporalPatterns(agentId: string): Promise<any> {
    const response = await this.http.get(`/api/analytics/temporal-patterns`, {
      params: { agentId },
    });
    return response.data;
  }

  // ============================================================================
  // Utility Methods
  // ============================================================================

  /**
   * Batch store multiple memories
   */
  public async batchRememberMemories(
    agentId: string,
    memories: Array<{ content: string; metadata?: MemoryMetadata }>
  ): Promise<Array<RememberResponse | null>> {
    const results: Array<RememberResponse | null> = [];

    for (const memory of memories) {
      try {
        const result = await this.rememberMemory({
          agentId,
          content: memory.content,
          metadata: memory.metadata,
        });
        results.push(result);
      } catch (error) {
        console.error('Failed to store memory:', error);
        results.push(null);
      }
    }

    return results;
  }

  /**
   * Search memories with pagination
   */
  public async searchWithPagination(
    request: RecallRequest,
    pageSize: number = 10
  ): Promise<{ memories: Memory[]; hasMore: boolean; totalResults: number }> {
    const response = await this.recallMemories({
      ...request,
      limit: pageSize,
    });

    return {
      memories: response.memories,
      hasMore: response.memories.length === pageSize,
      totalResults: response.totalResults,
    };
  }

  /**
   * Get memory statistics for an agent
   */
  public async getMemoryStats(agentId: string): Promise<{
    totalMemories: number;
    averageImportance: number;
    mostUsedTags: string[];
    oldestMemory: string;
    newestMemory: string;
  }> {
    const dashboard = await this.getAnalyticsDashboard(agentId);

    // Get oldest and newest memories
    const allMemories = await this.recallMemories({
      agentId,
      query: '',
      limit: 1000,
    });

    const timestamps = allMemories.memories.map(m => new Date(m.timestamp));
    const oldestTimestamp = new Date(Math.min(...timestamps.map(t => t.getTime())));
    const newestTimestamp = new Date(Math.max(...timestamps.map(t => t.getTime())));

    return {
      totalMemories: dashboard.totalMemories,
      averageImportance: dashboard.averageImportance,
      mostUsedTags: dashboard.topTags,
      oldestMemory: oldestTimestamp.toISOString(),
      newestMemory: newestTimestamp.toISOString(),
    };
  }

  // ============================================================================
  // WebSocket Support (Real-time Operations)
  // ============================================================================

  /**
   * Create WebSocket connection for real-time memory synchronization
   */
  public createWebSocketConnection(agentId: string): WebSocket {
    const wsUrl = this.config.baseUrl.replace('http', 'ws') + `/ws/${agentId}`;

    const ws = new WebSocket(wsUrl, {
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
      },
    });

    ws.on('open', () => {
      if (this.config.debug) {
        console.log('🔌 WebSocket connected for agent:', agentId);
      }
    });

    ws.on('message', (data) => {
      try {
        const message = JSON.parse(data.toString());
        if (this.config.debug) {
          console.log('📨 WebSocket message:', message);
        }
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error);
      }
    });

    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
    });

    ws.on('close', (code, reason) => {
      if (this.config.debug) {
        console.log(`🔌 WebSocket closed: ${code} - ${reason}`);
      }
    });

    return ws;
  }
}

// ============================================================================
// Exports
// ============================================================================

export default MemorAIClient;

// Named exports
export {
  MemorAIClient,
  MemorAIError,
};

// Type exports
export type {
  MemorAIClientConfig,
  Memory,
  MemoryMetadata,
  RememberRequest,
  RememberResponse,
  RecallRequest,
  RecallResponse,
  ContextResponse,
  HealthResponse,
  AnalyticsDashboard,
  APIError,
};