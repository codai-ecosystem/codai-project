/**
 * MemorAI SDK - TypeScript Type Definitions
 * 
 * Official TypeScript SDK for MemorAI AI Memory Infrastructure Platform
 * Provides comprehensive type safety for all MemorAI operations
 */

export interface MemorAIConfig {
    /** MemorAI API endpoint URL */
    apiUrl: string;
    /** API key for authentication */
    apiKey: string;
    /** CBD vector database endpoint */
    cbdUrl?: string;
    /** MCP server endpoint for agent integration */
    mcpUrl?: string;
    /** Request timeout in milliseconds */
    timeout?: number;
    /** Maximum number of retries for failed requests */
    maxRetries?: number;
    /** Enable debug logging */
    debug?: boolean;
    /** Custom headers to include in requests */
    headers?: Record<string, string>;
}

export interface Memory {
    /** Unique memory identifier */
    id: string;
    /** Memory content */
    content: string;
    /** Memory metadata */
    metadata: MemoryMetadata;
    /** Vector embeddings for semantic search */
    embeddings?: number[];
    /** Memory creation timestamp */
    createdAt: Date;
    /** Memory last updated timestamp */
    updatedAt: Date;
    /** Memory tags for categorization */
    tags: string[];
    /** Memory priority level */
    priority: MemoryPriority;
    /** Entity type classification */
    entityType: string;
    /** Agent ID that owns this memory */
    agentId?: string;
}

export interface MemoryMetadata {
    /** Type of entity being stored */
    entityType?: string;
    /** Project or context name */
    projectName?: string;
    /** Session identifier */
    sessionId?: string;
    /** User identifier */
    userId?: string;
    /** Organization identifier */
    organizationId?: string;
    /** Custom metadata fields */
    [key: string]: unknown;
}

export type MemoryPriority = 'low' | 'medium' | 'high' | 'critical';

export interface CreateMemoryRequest {
    /** Memory content to store */
    content: string;
    /** Optional metadata */
    metadata?: MemoryMetadata;
    /** Tags for categorization */
    tags?: string[];
    /** Priority level */
    priority?: MemoryPriority;
    /** Entity type */
    entityType?: string;
    /** Agent ID */
    agentId?: string;
    /** Generate embeddings automatically */
    generateEmbeddings?: boolean;
}

export interface CreateMemoryResponse {
    /** Success status */
    success: boolean;
    /** Created memory */
    memory: Memory;
    /** Embedding generation status */
    embeddingGenerated: boolean;
    /** Response timestamp */
    timestamp: Date;
}

export interface SearchMemoriesRequest {
    /** Search query */
    query: string;
    /** Maximum number of results */
    limit?: number;
    /** Minimum similarity threshold (0.0-1.0) */
    threshold?: number;
    /** Filter by entity types */
    entityTypes?: string[];
    /** Filter by tags */
    tags?: string[];
    /** Filter by agent ID */
    agentId?: string;
    /** Time range filter */
    timeRange?: {
        start: Date;
        end: Date;
    };
    /** Include embeddings in response */
    includeEmbeddings?: boolean;
}

export interface SearchMemoriesResponse {
    /** Success status */
    success: boolean;
    /** Found memories */
    memories: MemorySearchResult[];
    /** Total number of matches */
    totalFound: number;
    /** Query processing time in milliseconds */
    queryTime: number;
    /** Search performance metrics */
    metrics: SearchMetrics;
    /** Response timestamp */
    timestamp: Date;
}

export interface MemorySearchResult extends Memory {
    /** Similarity score (0.0-1.0) */
    similarityScore: number;
    /** Search relevance rank */
    rank: number;
}

export interface SearchMetrics {
    /** Time to generate query embeddings */
    embeddingTime: number;
    /** Time to search vector database */
    searchTime: number;
    /** Number of memories scanned */
    memoriesScanned: number;
    /** Search strategy used */
    strategy: 'vector' | 'keyword' | 'hybrid';
}

export interface UpdateMemoryRequest {
    /** Memory ID to update */
    id: string;
    /** New content (optional) */
    content?: string;
    /** New metadata (optional) */
    metadata?: Partial<MemoryMetadata>;
    /** New tags (optional) */
    tags?: string[];
    /** New priority (optional) */
    priority?: MemoryPriority;
    /** Regenerate embeddings */
    regenerateEmbeddings?: boolean;
}

export interface UpdateMemoryResponse {
    /** Success status */
    success: boolean;
    /** Updated memory */
    memory: Memory;
    /** Response timestamp */
    timestamp: Date;
}

export interface DeleteMemoryRequest {
    /** Memory ID to delete */
    id: string;
    /** Reason for deletion (audit trail) */
    reason?: string;
}

export interface DeleteMemoryResponse {
    /** Success status */
    success: boolean;
    /** Deleted memory ID */
    id: string;
    /** Response timestamp */
    timestamp: Date;
}

export interface BulkDeleteRequest {
    /** Memory IDs to delete */
    ids?: string[];
    /** Deletion criteria */
    criteria?: {
        entityType?: string;
        tags?: string[];
        agentId?: string;
        olderThan?: Date;
        priority?: MemoryPriority;
    };
    /** Reason for deletion */
    reason: string;
}

export interface BulkDeleteResponse {
    /** Success status */
    success: boolean;
    /** Number of memories deleted */
    deletedCount: number;
    /** Deleted memory IDs */
    deletedIds: string[];
    /** Response timestamp */
    timestamp: Date;
}

export interface GetMemoryRequest {
    /** Memory ID */
    id: string;
    /** Include embeddings in response */
    includeEmbeddings?: boolean;
}

export interface GetMemoryResponse {
    /** Success status */
    success: boolean;
    /** Memory data */
    memory: Memory;
    /** Response timestamp */
    timestamp: Date;
}

export interface ListMemoriesRequest {
    /** Page number (starting from 1) */
    page?: number;
    /** Number of items per page */
    limit?: number;
    /** Sort field */
    sortBy?: 'createdAt' | 'updatedAt' | 'priority' | 'content';
    /** Sort order */
    sortOrder?: 'asc' | 'desc';
    /** Filter by entity type */
    entityType?: string;
    /** Filter by tags */
    tags?: string[];
    /** Filter by agent ID */
    agentId?: string;
    /** Filter by priority */
    priority?: MemoryPriority;
}

export interface ListMemoriesResponse {
    /** Success status */
    success: boolean;
    /** List of memories */
    memories: Memory[];
    /** Pagination information */
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
        hasNext: boolean;
        hasPrevious: boolean;
    };
    /** Response timestamp */
    timestamp: Date;
}

export interface MemorAIStats {
    /** Total number of memories */
    totalMemories: number;
    /** Total storage size in bytes */
    storageSize: number;
    /** Number of unique agents */
    uniqueAgents: number;
    /** Average memory size */
    averageMemorySize: number;
    /** Most common entity types */
    commonEntityTypes: Array<{
        entityType: string;
        count: number;
    }>;
    /** Memory creation trends */
    creationTrends: Array<{
        date: string;
        count: number;
    }>;
}

export interface HealthCheckResponse {
    /** Service status */
    status: 'healthy' | 'unhealthy' | 'degraded';
    /** Service version */
    version: string;
    /** Uptime in seconds */
    uptime: number;
    /** Database connection status */
    database: {
        status: 'connected' | 'disconnected';
        responseTime: number;
    };
    /** Vector database status */
    vectorDb: {
        status: 'connected' | 'disconnected';
        responseTime: number;
    };
    /** API performance metrics */
    performance: {
        averageResponseTime: number;
        requestsPerSecond: number;
        errorRate: number;
    };
    /** Response timestamp */
    timestamp: Date;
}

export interface MemorAIError {
    /** Error code */
    code: string;
    /** Error message */
    message: string;
    /** Detailed error information */
    details?: Record<string, unknown>;
    /** Request ID for tracking */
    requestId?: string;
    /** Timestamp when error occurred */
    timestamp: Date;
}

export interface ApiResponse<T = unknown> {
    /** Success status */
    success: boolean;
    /** Response data */
    data?: T;
    /** Error information (if success is false) */
    error?: MemorAIError;
    /** Response metadata */
    meta?: {
        requestId: string;
        duration: number;
        rateLimit: {
            remaining: number;
            reset: Date;
        };
    };
}

// Real-time subscription types
export interface SubscriptionOptions {
    /** Agent ID to subscribe to */
    agentId?: string;
    /** Entity types to monitor */
    entityTypes?: string[];
    /** Tags to monitor */
    tags?: string[];
    /** Event types to subscribe to */
    events?: MemoryEvent[];
}

export type MemoryEvent = 'created' | 'updated' | 'deleted' | 'searched';

export interface MemoryNotification {
    /** Event type */
    event: MemoryEvent;
    /** Memory data */
    memory: Memory;
    /** Agent ID */
    agentId?: string;
    /** Event timestamp */
    timestamp: Date;
    /** Additional event metadata */
    metadata?: Record<string, unknown>;
}

export interface WebSocketMessage {
    /** Message type */
    type: 'notification' | 'error' | 'ping' | 'pong' | 'subscribe' | 'unsubscribe' | 'subscribed' | 'unsubscribed';
    /** Message payload */
    payload?: MemoryNotification | MemorAIError | SubscriptionOptions | null;
    /** Message data for simple messages */
    data?: any;
    /** Message ID */
    id?: string;
    /** Message timestamp */
    timestamp?: Date | number;
}

// Export all types as a namespace for convenience
export namespace MemorAI {
    export type Config = MemorAIConfig;
    export type MemoryType = Memory;
    export type CreateRequest = CreateMemoryRequest;
    export type CreateResponse = CreateMemoryResponse;
    export type SearchRequest = SearchMemoriesRequest;
    export type SearchResponse = SearchMemoriesResponse;
    export type UpdateRequest = UpdateMemoryRequest;
    export type UpdateResponse = UpdateMemoryResponse;
    export type DeleteRequest = DeleteMemoryRequest;
    export type DeleteResponse = DeleteMemoryResponse;
    export type Stats = MemorAIStats;
    export type Health = HealthCheckResponse;
    export type Error = MemorAIError;
}
