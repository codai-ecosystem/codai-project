/**
 * MemorAI MCP Core Types & Interfaces
 * Enterprise-Grade Memory Management System
 * Date: August 6, 2025
 */

import { CorsOptions } from 'cors';

// Core Memory Types
export interface Memory {
    id: string;
    agentId: string;
    content: string;
    metadata: AdvancedMetadata;
    structuredKey: string;
    timestamp: Date;
    embeddings?: number[];
    relevanceScore?: number;
}

// Advanced Metadata System
export interface AdvancedMetadata {
    entityType: 'prompt' | 'task' | 'plan' | 'knowledge' | 'context' | 'user_instructions';
    importance: number;        // 0-10 auto-scored
    tags: string[];
    project?: string;
    session?: string;
    createdBy: string;
    lastAccessed: Date;
    accessCount: number;
    priority?: 'low' | 'medium' | 'high' | 'critical';
    category?: string;
}

// Enhanced Search Capabilities
export interface SearchCapabilities {
    tfIdfScoring: boolean;        // Term frequency analysis
    vectorSimilarity: boolean;    // Azure OpenAI embeddings
    fuzzyMatching: boolean;       // Levenshtein distance
    phraseUnderstanding: boolean; // Context-aware search
    hybridRanking: boolean;       // Combined relevance scoring
}

// Search Request & Response
export interface SearchRequest {
    agentId: string;
    query: string;
    limit?: number;
    minImportance?: number;
    project?: string;
    session?: string;
    entityType?: string;
    useSemanticSearch?: boolean;
    useFuzzyMatching?: boolean;
}

export interface SearchResult {
    memory: Memory;
    relevanceScore: number;
    matchType: 'exact' | 'semantic' | 'fuzzy' | 'hybrid';
    highlights?: string[];
}

// Multi-Tenant Agent Isolation
export interface AgentIsolation {
    agentId: string;
    permissions: string[];
    memoryQuota: number;          // in MB
    accessLevel: 'read' | 'write' | 'admin';
    auditTrail: AuditEvent[];
    isActive: boolean;
    lastActivity: Date;
}

export interface AuditEvent {
    id: string;
    agentId: string;
    action: 'create' | 'read' | 'update' | 'delete';
    resourceId: string;
    timestamp: Date;
    ipAddress?: string;
    userAgent?: string;
    details?: any;
}

// Configuration Interfaces
export interface MemorAIConfig {
    server: {
        port: number;
        host: string;
        cors: CorsOptions;
        maxRequestSize: string;
    };
    database: {
        cbdUrl: string;
        connectionPool: number;
        timeout: number;
    };
    ai: {
        openaiApiKey: string;
        embeddingModel: string;
        maxTokens: number;
        dimensions: number;
        batchSize: number;
    };
    cache: {
        redisUrl?: string;
        ttl: number;
        maxMemory: string;
        enabled: boolean;
    };
    monitoring: {
        metricsPort: number;
        logLevel: 'debug' | 'info' | 'warn' | 'error';
        enableAnalytics: boolean;
    };
    security: {
        apiKey: string;
        rateLimiting: boolean;
        maxRequestsPerMinute: number;
    };
}

// Performance & Caching
export interface CacheStrategy {
    ttl: number;
    maxSize: number;
    evictionPolicy: 'lru' | 'lfu' | 'ttl';
}

export interface PerformanceMetrics {
    responseTime: number;
    memoryUsage: number;
    cpuUsage: number;
    queryCount: number;
    cacheHitRate: number;
    errorRate: number;
    activeConnections: number;
}

// Vector Embeddings
export interface EmbeddingConfig {
    model: string;
    dimensions: number;
    similarity: 'cosine' | 'euclidean' | 'dotProduct';
    caching: boolean;
    ttl: number;
}

export interface VectorSearchResult {
    id: string;
    content: string;
    similarity: number;
    metadata: AdvancedMetadata;
}

// Error Handling
export interface MemorAIError {
    code: string;
    message: string;
    details?: any;
    timestamp: Date;
    agentId?: string;
    requestId?: string;
}

// API Response Types
export interface APIResponse<T = any> {
    success: boolean;
    data?: T;
    error?: MemorAIError;
    metadata?: {
        timestamp: Date;
        requestId: string;
        processingTime: number;
        cacheHit?: boolean;
    };
}

// Health Check
export interface HealthStatus {
    status: 'healthy' | 'unhealthy' | 'degraded';
    service: string;
    version: string;
    timestamp: Date;
    checks: {
        database: boolean;
        cache: boolean;
        ai: boolean;
        memory: boolean;
    };
    metrics: PerformanceMetrics;
}

// Real-time Collaboration (Phase 4)
export interface CollaborationFeatures {
    liveMemoryEditing: boolean;
    multiAgentSync: boolean;
    presenceTracking: boolean;
    conflictResolution: boolean;
    eventBroadcasting: boolean;
}

export interface WebSocketEvent {
    type: 'memory_created' | 'memory_updated' | 'memory_deleted' | 'agent_joined' | 'agent_left';
    agentId: string;
    data: any;
    timestamp: Date;
    sessionId: string;
}

// Analytics (Phase 5)
export interface AnalyticsCapabilities {
    realtimeMetrics: boolean;
    usagePatterns: boolean;
    performanceMonitoring: boolean;
    businessIntelligence: boolean;
    alerting: boolean;
}

export interface AnalyticsEvent {
    id: string;
    type: string;
    agentId: string;
    timestamp: Date;
    data: any;
    tags?: string[];
}

// Export utility types
export type EntityType = AdvancedMetadata['entityType'];
export type AccessLevel = AgentIsolation['accessLevel'];
export type LogLevel = MemorAIConfig['monitoring']['logLevel'];
export type MatchType = SearchResult['matchType'];

// Constants
export const DEFAULT_CONFIG: Partial<MemorAIConfig> = {
    server: {
        port: 4950,
        host: '0.0.0.0',
        maxRequestSize: '10mb',
        cors: {
            origin: '*',
            credentials: true,
            methods: ['GET', 'POST', 'OPTIONS', 'DELETE'],
            allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key', 'mcp-session-id'],
            exposedHeaders: ['mcp-session-id', 'Content-Type']
        }
    },
    cache: {
        ttl: 3600,
        maxMemory: '256mb',
        enabled: true
    },
    monitoring: {
        metricsPort: 4951,
        logLevel: 'info',
        enableAnalytics: true
    }
};

export const EMBEDDING_MODELS = {
    'text-embedding-3-small': { dimensions: 1536, maxTokens: 8191 },
    'text-embedding-3-large': { dimensions: 3072, maxTokens: 8191 },
    'text-embedding-ada-002': { dimensions: 1536, maxTokens: 8191 }
} as const;

export const ENTITY_TYPES = [
    'prompt',
    'task',
    'plan',
    'knowledge',
    'context',
    'user_instructions'
] as const;

export const ACCESS_LEVELS = ['read', 'write', 'admin'] as const;
export const LOG_LEVELS = ['debug', 'info', 'warn', 'error'] as const;
export const MATCH_TYPES = ['exact', 'semantic', 'fuzzy', 'hybrid'] as const;
