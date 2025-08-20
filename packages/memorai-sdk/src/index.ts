/**
 * MemorAI SDK - Main Entry Point
 * 
 * Official TypeScript SDK for MemorAI - AI Memory Infrastructure Platform
 * 
 * @author CODAI Ecosystem
 * @version 1.0.0
 */

// Main client
export { MemorAIClient, createMemorAIClient } from './client/MemorAIClient.js';
import { MemorAIClient, createMemorAIClient } from './client/MemorAIClient.js';

// Core types
export type {
    // Configuration
    MemorAIConfig,

    // Memory types
    Memory,
    MemoryMetadata,
    MemoryPriority,

    // Request/Response types
    CreateMemoryRequest,
    CreateMemoryResponse,
    SearchMemoriesRequest,
    SearchMemoriesResponse,
    UpdateMemoryRequest,
    UpdateMemoryResponse,
    DeleteMemoryRequest,
    DeleteMemoryResponse,
    BulkDeleteRequest,
    BulkDeleteResponse,
    GetMemoryRequest,
    GetMemoryResponse,
    ListMemoriesRequest,
    ListMemoriesResponse,

    // Service types
    MemorAIStats,
    HealthCheckResponse,
    ApiResponse,
    MemorAIError,

    // WebSocket types
    WebSocketMessage,
    SubscriptionOptions,
    MemoryNotification
} from './types/index.js';

// Export MemorAI namespace for convenience
export type { MemorAI } from './types/index.js';

// Services (for advanced usage)
export { WebSocketService } from './services/websocket.js';
export { RetryService } from './services/retry.js';
export { ValidationService } from './services/validation.js';

// Version and metadata
export const VERSION = '1.0.0';
export const SDK_NAME = '@memorai/sdk';

/**
 * Default configuration values
 */
export const DEFAULT_CONFIG = {
    timeout: 30000,
    maxRetries: 3,
    debug: false
} as const;

/**
 * Supported API versions
 */
export const SUPPORTED_API_VERSIONS = ['v1'] as const;

/**
 * Default API endpoints
 */
export const DEFAULT_ENDPOINTS = {
    production: 'https://api.memorai.ro/api',
    staging: 'https://api-staging.memorai.ro/api',
    development: 'http://localhost:4006/api'
} as const;

/**
 * SDK Feature flags
 */
export const FEATURES = {
    realTimeEvents: true,
    bulkOperations: true,
    vectorSearch: true,
    metadataFiltering: true,
    embeddingGeneration: true,
    agentSupport: true
} as const;

/**
 * Create a pre-configured MemorAI client for common environments
 */
export function createProductionClient(apiKey: string): MemorAIClient {
    return createMemorAIClient({
        apiUrl: DEFAULT_ENDPOINTS.production,
        apiKey,
        timeout: 30000,
        maxRetries: 3,
        debug: false
    });
}

export function createStagingClient(apiKey: string): MemorAIClient {
    return createMemorAIClient({
        apiUrl: DEFAULT_ENDPOINTS.staging,
        apiKey,
        timeout: 30000,
        maxRetries: 3,
        debug: true
    });
}

export function createDevelopmentClient(apiKey: string): MemorAIClient {
    return createMemorAIClient({
        apiUrl: DEFAULT_ENDPOINTS.development,
        apiKey,
        timeout: 10000,
        maxRetries: 1,
        debug: true
    });
}

// Default export for convenience
export { MemorAIClient as default };
