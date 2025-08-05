import axios, { AxiosInstance, AxiosError, AxiosResponse } from 'axios';
import { EventEmitter } from 'eventemitter3';
import WebSocket from 'ws';
import {
  Memory,
  MemoryInput,
  MemoryUpdate,
  SearchOptions,
  SearchResult,
  AnalyticsData,
  ApiResponse,
  SDKOptions,
  PerformanceMetrics,
  RateLimitInfo,
  Category,
  Tag,
  UserSession,
  HealthStatus,
  BatchOperation,
  BatchResult,
  EventMap,
  WebSocketMessage
} from './types';

/**
 * Official MemorAI SDK for JavaScript/TypeScript
 * 
 * Provides a comprehensive interface to interact with the MemorAI platform,
 * including memory management, search capabilities, analytics, and real-time features.
 * 
 * @example
 * ```typescript
 * import { MemorAI } from '@memorai/sdk';
 * 
 * const client = new MemorAI({
 *   baseUrl: 'http://localhost:4006',
 *   apiKey: 'your-api-key',
 *   enableWebSocket: true
 * });
 * 
 * // Create a memory
 * const memory = await client.memories.create({
 *   content: 'Important information to remember',
 *   tags: ['important', 'work']
 * });
 * 
 * // Search memories
 * const results = await client.search.query('important information', {
 *   algorithm: 'semantic',
 *   limit: 10
 * });
 * ```
 */
export class MemorAI extends EventEmitter<EventMap> {
  private axios: AxiosInstance;
  private ws: WebSocket | null = null;
  private options: Required<SDKOptions>;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private rateLimitInfo: RateLimitInfo | null = null;
  private performanceMetrics: PerformanceMetrics[] = [];

  constructor(options: SDKOptions = {}) {
    super();

    this.options = {
      baseUrl: options.baseUrl || 'http://localhost:4006',
      apiKey: options.apiKey || '',
      timeout: options.timeout || 30000,
      retries: options.retries || 3,
      enableWebSocket: options.enableWebSocket || false,
      wsUrl: options.wsUrl || options.baseUrl?.replace('http', 'ws') || 'ws://localhost:4006',
      debug: options.debug || false
    };

    // Configure axios instance
    this.axios = axios.create({
      baseURL: `${this.options.baseUrl}/api`,
      timeout: this.options.timeout,
      headers: {
        'Content-Type': 'application/json',
        ...(this.options.apiKey && { 'Authorization': `Bearer ${this.options.apiKey}` })
      }
    });

    // Add request interceptor for performance tracking
    this.axios.interceptors.request.use((config: any) => {
      config.metadata = { startTime: Date.now() };
      return config;
    });

    // Add response interceptor for performance tracking and rate limiting
    this.axios.interceptors.response.use(
      (response: AxiosResponse & { config: any }) => {
        this.trackPerformance(response);
        this.updateRateLimitInfo(response);
        return response;
      },
      (error: AxiosError) => {
        if (error.response) {
          this.trackPerformance(error.response);
          this.updateRateLimitInfo(error.response);

          if (error.response.status === 429) {
            this.emit('rate_limit:exceeded', this.rateLimitInfo!);
          }
        }
        return Promise.reject(error);
      }
    );

    // Initialize WebSocket if enabled
    if (this.options.enableWebSocket) {
      this.connectWebSocket();
    }

    if (this.options.debug) {
      console.log('MemorAI SDK initialized with options:', this.options);
    }
  }

  /**
   * Memory management operations
   */
  public memories = {
    /**
     * Create a new memory
     */
    create: async (input: MemoryInput): Promise<Memory> => {
      const response = await this.axios.post<ApiResponse<Memory>>('/memories', input);
      const memory = response.data.data!;
      this.emit('memory:created', memory);
      return memory;
    },

    /**
     * Get a memory by ID
     */
    get: async (id: string): Promise<Memory> => {
      const response = await this.axios.get<ApiResponse<Memory>>(`/memories/${id}`);
      return response.data.data!;
    },

    /**
     * Update a memory
     */
    update: async (id: string, update: MemoryUpdate): Promise<Memory> => {
      const response = await this.axios.put<ApiResponse<Memory>>(`/memories/${id}`, update);
      const memory = response.data.data!;
      this.emit('memory:updated', memory);
      return memory;
    },

    /**
     * Delete a memory
     */
    delete: async (id: string): Promise<void> => {
      await this.axios.delete(`/memories/${id}`);
      this.emit('memory:deleted', { id });
    },

    /**
     * List memories with pagination
     */
    list: async (options: {
      page?: number;
      limit?: number;
      category?: string;
      tags?: string[];
      sortBy?: string;
      sortOrder?: 'asc' | 'desc';
    } = {}): Promise<{ memories: Memory[]; total: number; page: number; limit: number }> => {
      const params = new URLSearchParams();
      Object.entries(options).forEach(([key, value]) => {
        if (value !== undefined) {
          if (Array.isArray(value)) {
            value.forEach(v => params.append(key, v));
          } else {
            params.append(key, value.toString());
          }
        }
      });

      const response = await this.axios.get<ApiResponse<{ memories: Memory[]; total: number; page: number; limit: number }>>(
        `/memories?${params.toString()}`
      );
      return response.data.data!;
    },

    /**
     * Batch operations on memories
     */
    batch: async (operations: BatchOperation<MemoryInput | MemoryUpdate>[]): Promise<BatchResult<Memory>> => {
      const response = await this.axios.post<ApiResponse<BatchResult<Memory>>>('/memories/batch', { operations });
      return response.data.data!;
    }
  };

  /**
   * Search operations
   */
  public search = {
    /**
     * Search memories using specified algorithm
     */
    query: async (query: string, options: SearchOptions = {}): Promise<SearchResult> => {
      const response = await this.axios.post<ApiResponse<SearchResult>>('/search', {
        query,
        ...options
      });
      const result = response.data.data!;
      this.emit('search:completed', result);
      return result;
    },

    /**
     * Exact string matching search
     */
    exact: async (query: string, options: Omit<SearchOptions, 'algorithm'> = {}): Promise<SearchResult> => {
      return this.search.query(query, { ...options, algorithm: 'exact' });
    },

    /**
     * Full-text search with TF-IDF scoring
     */
    fulltext: async (query: string, options: Omit<SearchOptions, 'algorithm'> = {}): Promise<SearchResult> => {
      return this.search.query(query, { ...options, algorithm: 'fulltext' });
    },

    /**
     * Semantic search using vector similarity
     */
    semantic: async (query: string, options: Omit<SearchOptions, 'algorithm'> = {}): Promise<SearchResult> => {
      return this.search.query(query, { ...options, algorithm: 'semantic' });
    },

    /**
     * Fuzzy search with typo tolerance
     */
    fuzzy: async (query: string, options: Omit<SearchOptions, 'algorithm'> = {}): Promise<SearchResult> => {
      return this.search.query(query, { ...options, algorithm: 'fuzzy' });
    },

    /**
     * Get search suggestions based on partial input
     */
    suggestions: async (partial: string, limit: number = 5): Promise<string[]> => {
      const response = await this.axios.get<ApiResponse<string[]>>(`/search/suggestions?q=${encodeURIComponent(partial)}&limit=${limit}`);
      return response.data.data!;
    }
  };

  /**
   * Analytics operations
   */
  public analytics = {
    /**
     * Get comprehensive analytics data
     */
    get: async (): Promise<AnalyticsData> => {
      const response = await this.axios.get<ApiResponse<AnalyticsData>>('/analytics');
      const data = response.data.data!;
      this.emit('analytics:updated', data);
      return data;
    },

    /**
     * Get memory statistics
     */
    memories: async (): Promise<{
      total: number;
      byCategory: Record<string, number>;
      byTag: Record<string, number>;
      recentGrowth: Array<{ date: string; count: number }>;
    }> => {
      const response = await this.axios.get<ApiResponse<any>>('/analytics/memories');
      return response.data.data!;
    },

    /**
     * Get search analytics
     */
    search: async (): Promise<{
      totalQueries: number;
      topQueries: Array<{ query: string; count: number }>;
      algorithmUsage: Record<string, number>;
      avgResponseTime: number;
    }> => {
      const response = await this.axios.get<ApiResponse<any>>('/analytics/search');
      return response.data.data!;
    },

    /**
     * Get performance metrics
     */
    performance: async (): Promise<{
      responseTime: { p50: number; p95: number; p99: number };
      throughput: number;
      errorRate: number;
      cacheHitRate: number;
    }> => {
      const response = await this.axios.get<ApiResponse<any>>('/analytics/performance');
      return response.data.data!;
    }
  };

  /**
   * Category management
   */
  public categories = {
    /**
     * Get all categories
     */
    list: async (): Promise<Category[]> => {
      const response = await this.axios.get<ApiResponse<Category[]>>('/categories');
      return response.data.data!;
    },

    /**
     * Create a new category
     */
    create: async (name: string, description?: string): Promise<Category> => {
      const response = await this.axios.post<ApiResponse<Category>>('/categories', { name, description });
      return response.data.data!;
    },

    /**
     * Update a category
     */
    update: async (id: string, name: string, description?: string): Promise<Category> => {
      const response = await this.axios.put<ApiResponse<Category>>(`/categories/${id}`, { name, description });
      return response.data.data!;
    },

    /**
     * Delete a category
     */
    delete: async (id: string): Promise<void> => {
      await this.axios.delete(`/categories/${id}`);
    }
  };

  /**
   * Tag management
   */
  public tags = {
    /**
     * Get all tags
     */
    list: async (): Promise<Tag[]> => {
      const response = await this.axios.get<ApiResponse<Tag[]>>('/tags');
      return response.data.data!;
    },

    /**
     * Get popular tags
     */
    popular: async (limit: number = 20): Promise<Tag[]> => {
      const response = await this.axios.get<ApiResponse<Tag[]>>(`/tags/popular?limit=${limit}`);
      return response.data.data!;
    },

    /**
     * Search tags
     */
    search: async (query: string): Promise<Tag[]> => {
      const response = await this.axios.get<ApiResponse<Tag[]>>(`/tags/search?q=${encodeURIComponent(query)}`);
      return response.data.data!;
    }
  };

  /**
   * User session management
   */
  public session = {
    /**
     * Get current session info
     */
    get: async (): Promise<UserSession> => {
      const response = await this.axios.get<ApiResponse<UserSession>>('/session');
      return response.data.data!;
    },

    /**
     * Refresh session token
     */
    refresh: async (): Promise<{ token: string; expiresAt: Date }> => {
      const response = await this.axios.post<ApiResponse<{ token: string; expiresAt: string }>>('/session/refresh');
      const data = response.data.data!;
      return {
        token: data.token,
        expiresAt: new Date(data.expiresAt)
      };
    }
  };

  /**
   * System utilities
   */
  public system = {
    /**
     * Get system health status
     */
    health: async (): Promise<HealthStatus> => {
      const response = await this.axios.get<ApiResponse<HealthStatus>>('/health');
      return response.data.data!;
    },

    /**
     * Get API version info
     */
    version: async (): Promise<{ version: string; buildDate: string; commit: string }> => {
      const response = await this.axios.get<ApiResponse<any>>('/version');
      return response.data.data!;
    },

    /**
     * Test API connectivity
     */
    ping: async (): Promise<{ latency: number; timestamp: Date }> => {
      const start = Date.now();
      await this.axios.get('/ping');
      return {
        latency: Date.now() - start,
        timestamp: new Date()
      };
    }
  };

  /**
   * WebSocket connection management
   */
  private connectWebSocket = (): void => {
    try {
      this.ws = new WebSocket(this.options.wsUrl);

      this.ws.on('open', () => {
        if (this.options.debug) {
          console.log('WebSocket connected');
        }
        this.emit('connection:opened');

        // Clear reconnect timer
        if (this.reconnectTimer) {
          clearTimeout(this.reconnectTimer);
          this.reconnectTimer = null;
        }
      });

      this.ws.on('message', (data: Buffer) => {
        try {
          const message: WebSocketMessage = JSON.parse(data.toString());
          this.handleWebSocketMessage(message);
        } catch (error) {
          if (this.options.debug) {
            console.error('Failed to parse WebSocket message:', error);
          }
        }
      });

      this.ws.on('close', () => {
        if (this.options.debug) {
          console.log('WebSocket disconnected');
        }
        this.emit('connection:closed');
        this.scheduleReconnect();
      });

      this.ws.on('error', (error: Error) => {
        if (this.options.debug) {
          console.error('WebSocket error:', error);
        }
        this.emit('connection:error', error);
      });

    } catch (error) {
      if (this.options.debug) {
        console.error('Failed to create WebSocket connection:', error);
      }
      this.emit('connection:error', error as Error);
    }
  };

  private handleWebSocketMessage = (message: WebSocketMessage): void => {
    switch (message.type) {
      case 'memory_created':
        this.emit('memory:created', message.data);
        break;
      case 'memory_updated':
        this.emit('memory:updated', message.data);
        break;
      case 'memory_deleted':
        this.emit('memory:deleted', { id: message.data.id });
        break;
      default:
        if (this.options.debug) {
          console.log('Unhandled WebSocket message:', message);
        }
    }
  };

  private scheduleReconnect = (): void => {
    if (this.reconnectTimer) return;

    this.reconnectTimer = setTimeout(() => {
      if (this.options.debug) {
        console.log('Attempting WebSocket reconnection...');
      }
      this.connectWebSocket();
    }, 5000);
  };

  private trackPerformance = (response: AxiosResponse & { config: any }): void => {
    if (response.config.metadata?.startTime) {
      const metric: PerformanceMetrics = {
        responseTime: Date.now() - response.config.metadata.startTime,
        timestamp: new Date(),
        endpoint: response.config.url,
        method: response.config.method?.toUpperCase(),
        statusCode: response.status,
        cacheHit: response.headers['x-cache-status'] === 'HIT'
      };

      this.performanceMetrics.push(metric);

      // Keep only last 100 metrics
      if (this.performanceMetrics.length > 100) {
        this.performanceMetrics = this.performanceMetrics.slice(-100);
      }

      this.emit('performance:metric', metric);
    }
  };

  private updateRateLimitInfo = (response: AxiosResponse): void => {
    const limit = response.headers['x-ratelimit-limit'];
    const remaining = response.headers['x-ratelimit-remaining'];
    const resetTime = response.headers['x-ratelimit-reset'];
    const retryAfter = response.headers['retry-after'];

    if (limit && remaining && resetTime) {
      this.rateLimitInfo = {
        limit: parseInt(limit),
        remaining: parseInt(remaining),
        resetTime: new Date(parseInt(resetTime) * 1000),
        retryAfter: retryAfter ? parseInt(retryAfter) : undefined
      };
    }
  };

  /**
   * Get current rate limit information
   */
  public getRateLimitInfo = (): RateLimitInfo | null => {
    return this.rateLimitInfo;
  };

  /**
   * Get performance metrics
   */
  public getPerformanceMetrics = (): PerformanceMetrics[] => {
    return [...this.performanceMetrics];
  };

  /**
   * Close connections and cleanup
   */
  public destroy = (): void => {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    this.removeAllListeners();
  };
}

export default MemorAI;
