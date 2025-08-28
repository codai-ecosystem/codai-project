/**
 * MemorAI Enhanced TypeScript SDK - US-MEM-006 Implementation
 * Comprehensive SDK with excellent developer experience
 * 
 * Sprint: MemorAI Enhancement Sprint (Aug 27 - Sep 9, 2025)
 * User Story: US-MEM-006 (3 SP)
 * 
 * Features:
 * - Full TypeScript support with strict typing
 * - Real-time WebSocket subscriptions for memory updates
 * - Retry logic and error handling
 * - Framework-specific integrations (React, Vue, Angular)
 * - Comprehensive documentation with examples
 */

import EventEmitter from 'events';
import WebSocket from 'ws';

// ============================================================================
// CORE TYPES & INTERFACES
// ============================================================================

export interface MemorAIConfig {
  apiKey: string;
  baseURL?: string;
  wsURL?: string;
  timeout?: number;
  retryAttempts?: number;
  retryDelay?: number;
  enableWebSocket?: boolean;
  debugMode?: boolean;
}

export interface Memory {
  id?: string;
  agentId: string;
  content: string;
  metadata?: MemoryMetadata;
  structuredKey?: string;
  timestamp?: Date;
  embeddings?: number[];
  relevanceScore?: number;
}

export interface MemoryMetadata {
  entityType?: 'prompt' | 'task' | 'plan' | 'knowledge' | 'context' | 'user_instructions';
  importance?: number;
  tags?: string[];
  project?: string;
  session?: string;
  priority?: 'low' | 'medium' | 'high' | 'critical';
  [key: string]: any;
}

export interface SearchOptions {
  query: string;
  agentId?: string;
  limit?: number;
  minImportance?: number;
  project?: string;
  session?: string;
  includeOtherAgents?: boolean;
  timeRange?: {
    from?: Date;
    to?: Date;
  };
}

export interface SearchResult {
  memories: Memory[];
  totalCount: number;
  processingTime: number;
  relevanceScores: number[];
}

export interface ClusteringOptions {
  agentId: string;
  algorithm?: 'kmeans' | 'hierarchical' | 'dbscan';
  clusterCount?: number;
  minClusterSize?: number;
  useSemanticSimilarity?: boolean;
}

export interface MemoryCluster {
  id: string;
  memories: Memory[];
  centroid: number[];
  silhouetteScore: number;
  coherenceScore: number;
  tags: string[];
  summary: string;
}

export interface ClusteringResult {
  clusters: MemoryCluster[];
  qualityMetrics: {
    silhouetteScore: number;
    daviesBouldinIndex: number;
    calinskiHarabaszIndex: number;
  };
  processingTime: number;
}

export interface AnalyticsOptions {
  agentId?: string;
  timeRange?: 'last_24h' | 'last_7d' | 'last_30d' | 'custom';
  customRange?: {
    start: Date;
    end: Date;
  };
}

export interface AnalyticsDashboard {
  summary: {
    totalMemories: number;
    averageImportance: number;
    topAgents: string[];
    mostActiveTime: string;
  };
  usagePatterns: {
    timeDistribution: Record<string, number>;
    agentActivity: Record<string, number>;
    contentCategories: Record<string, number>;
  };
  performanceMetrics: {
    responseTime: number;
    successRate: number;
    cacheHitRate: number;
  };
}

export interface WebSocketMessage {
  type: 'memory_created' | 'memory_updated' | 'memory_deleted' | 'agent_activity' | 'system_event';
  agentId?: string;
  data: any;
  timestamp: Date;
}

export interface TenantContext {
  tenantId?: string;
  agentId: string;
  requestId?: string;
  permissions?: string[];
}

export interface SDKError extends Error {
  code: string;
  statusCode?: number;
  retryable: boolean;
  context?: any;
}

// ============================================================================
// MAIN SDK CLASS
// ============================================================================

export class MemorAISDK extends EventEmitter {
  private config: Required<MemorAIConfig>;
  private ws?: WebSocket;
  private wsReconnectAttempts = 0;
  private wsMaxReconnectAttempts = 5;
  private wsReconnectDelay = 1000;
  private isConnecting = false;

  constructor(config: MemorAIConfig) {
    super();

    // Validate required config
    if (!config.apiKey) {
      throw new Error('MemorAI API key is required');
    }

    // Set default configuration
    this.config = {
      apiKey: config.apiKey,
      baseURL: config.baseURL || 'http://localhost:4950',
      wsURL: config.wsURL || 'ws://localhost:4951',
      timeout: config.timeout || 30000,
      retryAttempts: config.retryAttempts || 3,
      retryDelay: config.retryDelay || 1000,
      enableWebSocket: config.enableWebSocket ?? true,
      debugMode: config.debugMode ?? false
    };

    // Initialize WebSocket connection if enabled
    if (this.config.enableWebSocket) {
      this.initializeWebSocket();
    }

    this.log('MemorAI SDK initialized', { config: this.sanitizeConfig() });
  }

  // ============================================================================
  // MEMORY OPERATIONS
  // ============================================================================

  /**
   * Store a memory with content and metadata
   */
  async remember(memory: Memory, context?: TenantContext): Promise<Memory> {
    const endpoint = '/api/v1/memories';
    const payload = {
      ...memory,
      ...context
    };

    try {
      const response = await this.makeRequest<Memory>('POST', endpoint, payload);
      this.emit('memoryCreated', response);
      this.log('Memory stored successfully', { id: response.id });
      return response;
    } catch (error) {
      this.handleError('Failed to store memory', error, { memory, context });
      throw error;
    }
  }

  /**
   * Retrieve memories with advanced search capabilities
   */
  async recall(options: SearchOptions, context?: TenantContext): Promise<SearchResult> {
    const endpoint = '/api/v1/memories/search';
    const payload = {
      ...options,
      ...context
    };

    try {
      const response = await this.makeRequest<SearchResult>('POST', endpoint, payload);
      this.log('Memory search completed', {
        query: options.query,
        resultCount: response.memories.length,
        processingTime: response.processingTime
      });
      return response;
    } catch (error) {
      this.handleError('Failed to search memories', error, { options, context });
      throw error;
    }
  }

  /**
   * Update an existing memory
   */
  async updateMemory(id: string, updates: Partial<Memory>, context?: TenantContext): Promise<Memory> {
    const endpoint = `/api/v1/memories/${id}`;
    const payload = {
      ...updates,
      ...context
    };

    try {
      const response = await this.makeRequest<Memory>('PUT', endpoint, payload);
      this.emit('memoryUpdated', response);
      this.log('Memory updated successfully', { id });
      return response;
    } catch (error) {
      this.handleError('Failed to update memory', error, { id, updates, context });
      throw error;
    }
  }

  /**
   * Delete a memory by ID
   */
  async forget(id: string, context?: TenantContext): Promise<void> {
    const endpoint = `/api/v1/memories/${id}`;
    const payload = context || {};

    try {
      await this.makeRequest<void>('DELETE', endpoint, payload);
      this.emit('memoryDeleted', { id });
      this.log('Memory deleted successfully', { id });
    } catch (error) {
      this.handleError('Failed to delete memory', error, { id, context });
      throw error;
    }
  }

  // ============================================================================
  // ADVANCED FEATURES
  // ============================================================================

  /**
   * Cluster memories using advanced algorithms
   */
  async clusterMemories(options: ClusteringOptions): Promise<ClusteringResult> {
    const endpoint = '/api/v1/memories/cluster';

    try {
      const response = await this.makeRequest<ClusteringResult>('POST', endpoint, options);
      this.log('Memory clustering completed', {
        clusterCount: response.clusters.length,
        silhouetteScore: response.qualityMetrics.silhouetteScore,
        processingTime: response.processingTime
      });
      return response;
    } catch (error) {
      this.handleError('Failed to cluster memories', error, { options });
      throw error;
    }
  }

  /**
   * Get analytics dashboard for memory usage
   */
  async getAnalytics(options: AnalyticsOptions = {}): Promise<AnalyticsDashboard> {
    const endpoint = '/api/v1/analytics/dashboard';

    try {
      const response = await this.makeRequest<AnalyticsDashboard>('POST', endpoint, options);
      this.log('Analytics dashboard generated', {
        totalMemories: response.summary.totalMemories,
        averageImportance: response.summary.averageImportance
      });
      return response;
    } catch (error) {
      this.handleError('Failed to get analytics', error, { options });
      throw error;
    }
  }

  /**
   * Summarize memories intelligently
   */
  async summarizeMemories(
    memories: Memory[],
    options: {
      level?: 'minimal' | 'brief' | 'detailed' | 'extensive';
      strategy?: 'extractive' | 'abstractive' | 'hybrid' | 'statistical' | 'semantic' | 'thematic';
    } = {}
  ): Promise<{
    summary: string;
    keyInsights: string[];
    confidenceScore: number;
  }> {
    const endpoint = '/api/v1/memories/summarize';
    const payload = {
      memories,
      ...options
    };

    try {
      const response = await this.makeRequest<{
        summary: string;
        keyInsights: string[];
        confidenceScore: number;
      }>('POST', endpoint, payload);
      this.log('Memory summarization completed', {
        memoryCount: memories.length,
        confidenceScore: response.confidenceScore
      });
      return response;
    } catch (error) {
      this.handleError('Failed to summarize memories', error, { memories: memories.length, options });
      throw error;
    }
  }

  // ============================================================================
  // WEBSOCKET REAL-TIME SUBSCRIPTIONS
  // ============================================================================

  /**
   * Subscribe to real-time memory updates
   */
  subscribeToUpdates(agentId?: string): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      this.log('WebSocket not available for subscription');
      return;
    }

    const subscription = {
      type: 'subscribe',
      agentId: agentId || 'all'
    };

    this.ws.send(JSON.stringify(subscription));
    this.log('Subscribed to memory updates', { agentId });
  }

  /**
   * Unsubscribe from real-time updates
   */
  unsubscribeFromUpdates(agentId?: string): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      return;
    }

    const unsubscription = {
      type: 'unsubscribe',
      agentId: agentId || 'all'
    };

    this.ws.send(JSON.stringify(unsubscription));
    this.log('Unsubscribed from memory updates', { agentId });
  }

  // ============================================================================
  // HEALTH & DIAGNOSTICS
  // ============================================================================

  /**
   * Check SDK and service health
   */
  async healthCheck(): Promise<{
    sdk: { status: 'ok' | 'error'; version: string };
    service: { status: 'ok' | 'error'; latency: number };
    websocket: { connected: boolean; reconnectAttempts: number };
  }> {
    const startTime = Date.now();

    try {
      await this.makeRequest('GET', '/health');
      const latency = Date.now() - startTime;

      return {
        sdk: { status: 'ok', version: '1.0.0' },
        service: { status: 'ok', latency },
        websocket: {
          connected: this.ws?.readyState === WebSocket.OPEN,
          reconnectAttempts: this.wsReconnectAttempts
        }
      };
    } catch (error) {
      return {
        sdk: { status: 'error', version: '1.0.0' },
        service: { status: 'error', latency: Date.now() - startTime },
        websocket: {
          connected: false,
          reconnectAttempts: this.wsReconnectAttempts
        }
      };
    }
  }

  /**
   * Get detailed SDK configuration (sanitized)
   */
  getConfig(): Partial<MemorAIConfig> {
    return this.sanitizeConfig();
  }

  // ============================================================================
  // WEBSOCKET MANAGEMENT
  // ============================================================================

  private initializeWebSocket(): void {
    if (this.isConnecting) {
      return;
    }

    this.isConnecting = true;

    try {
      this.ws = new WebSocket(this.config.wsURL);

      this.ws.on('open', () => {
        this.log('WebSocket connected');
        this.wsReconnectAttempts = 0;
        this.isConnecting = false;
        this.emit('connected');
      });

      this.ws.on('message', (data) => {
        try {
          const message: WebSocketMessage = JSON.parse(data.toString());
          this.handleWebSocketMessage(message);
        } catch (error) {
          this.log('Failed to parse WebSocket message', { error, data: data.toString() });
        }
      });

      this.ws.on('close', () => {
        this.log('WebSocket disconnected');
        this.isConnecting = false;
        this.emit('disconnected');
        this.scheduleReconnect();
      });

      this.ws.on('error', (error) => {
        this.log('WebSocket error', { error });
        this.isConnecting = false;
        this.emit('error', error);
      });

    } catch (error) {
      this.log('Failed to initialize WebSocket', { error });
      this.isConnecting = false;
      this.scheduleReconnect();
    }
  }

  private handleWebSocketMessage(message: WebSocketMessage): void {
    this.log('WebSocket message received', { type: message.type });

    switch (message.type) {
      case 'memory_created':
        this.emit('memoryCreated', message.data);
        break;
      case 'memory_updated':
        this.emit('memoryUpdated', message.data);
        break;
      case 'memory_deleted':
        this.emit('memoryDeleted', message.data);
        break;
      case 'agent_activity':
        this.emit('agentActivity', message.data);
        break;
      case 'system_event':
        this.emit('systemEvent', message.data);
        break;
      default:
        this.log('Unknown WebSocket message type', { type: message.type });
    }
  }

  private scheduleReconnect(): void {
    if (this.wsReconnectAttempts >= this.wsMaxReconnectAttempts) {
      this.log('Max WebSocket reconnection attempts reached');
      return;
    }

    const delay = this.wsReconnectDelay * Math.pow(2, this.wsReconnectAttempts);
    this.wsReconnectAttempts++;

    this.log(`Scheduling WebSocket reconnection in ${delay}ms (attempt ${this.wsReconnectAttempts})`);

    setTimeout(() => {
      if (this.config.enableWebSocket) {
        this.initializeWebSocket();
      }
    }, delay);
  }

  // ============================================================================
  // HTTP CLIENT WITH RETRY LOGIC
  // ============================================================================

  private async makeRequest<T>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    endpoint: string,
    body?: any,
    attempt = 1
  ): Promise<T> {
    const url = `${this.config.baseURL}${endpoint}`;
    const requestId = Math.random().toString(36).substr(2, 9);

    this.log(`Making ${method} request`, { url, requestId, attempt });

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), this.config.timeout);

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`,
          'X-Request-ID': requestId,
          'User-Agent': 'MemorAI-SDK/1.0.0'
        },
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal
      });

      clearTimeout(timeout);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const error = new Error(`HTTP ${response.status}: ${response.statusText}`) as SDKError;
        error.code = `HTTP_${response.status}`;
        error.statusCode = response.status;
        error.retryable = this.isRetryableError(response.status);
        error.context = { url, method, requestId, errorData };
        throw error;
      }

      if (response.status === 204) {
        return undefined as T;
      }

      const data = await response.json();
      this.log(`Request completed successfully`, { url, requestId, status: response.status });
      return data;

    } catch (error) {
      this.log(`Request failed`, { url, requestId, attempt, error });

      if (this.shouldRetry(error, attempt)) {
        const delay = this.config.retryDelay * Math.pow(2, attempt - 1);
        this.log(`Retrying request in ${delay}ms`, { url, requestId, attempt });

        await new Promise(resolve => setTimeout(resolve, delay));
        return this.makeRequest<T>(method, endpoint, body, attempt + 1);
      }

      throw error;
    }
  }

  private isRetryableError(statusCode: number): boolean {
    return statusCode >= 500 || statusCode === 429 || statusCode === 408;
  }

  private shouldRetry(error: any, attempt: number): boolean {
    if (attempt >= this.config.retryAttempts) {
      return false;
    }

    if (error.name === 'AbortError') {
      return true; // Timeout errors are retryable
    }

    if (error.code && error.retryable !== undefined) {
      return error.retryable;
    }

    // Network errors are generally retryable
    return error.code === 'ECONNRESET' ||
      error.code === 'ENOTFOUND' ||
      error.code === 'ECONNREFUSED';
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  private handleError(message: string, error: any, context: any): void {
    this.log(`Error: ${message}`, { error, context });

    const enhancedError = error as SDKError;
    enhancedError.context = { ...enhancedError.context, ...context };

    this.emit('error', enhancedError);
  }

  private log(message: string, data?: any): void {
    if (this.config.debugMode) {
      console.log(`[MemorAI SDK] ${message}`, data || '');
    }
  }

  private sanitizeConfig(): Partial<MemorAIConfig> {
    const { apiKey, ...sanitized } = this.config;
    return {
      ...sanitized,
      apiKey: '***hidden***'
    };
  }

  /**
   * Clean up resources and close connections
   */
  destroy(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = undefined;
    }

    this.removeAllListeners();
    this.log('SDK destroyed');
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export default MemorAISDK;