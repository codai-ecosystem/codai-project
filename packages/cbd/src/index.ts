/**
 * CBD (Codai Better Database) Main Export
 * Revolutionary vector-native database system for AI memory storage
 * Enhanced with Enterprise Features: Clustering, Security, and High-Performance Server
 */

export { CBDMemoryEngine } from './memory/MemoryEngine.js';
export { FaissVectorStore, InMemoryVectorIndex } from './vector/VectorStore.js';
export { OpenAIEmbeddingModel, LocalEmbeddingModel } from './embedding/EmbeddingService.js';
export { CBDNativeStorageAdapter } from './storage/CBDNativeStorageAdapter.js';

// HTAP Database Engines (Phase 1)
export { CBDRowStoreEngine } from './htap/RowStoreEngine.js';
export { CBDColumnarStoreEngine } from './htap/ColumnarStoreEngine.js';
export { CBDDocumentStoreEngine } from './htap/DocumentStoreEngine.js';
export { CBDQueryRouter } from './htap/QueryRouter.js';

// Graph Database Engine (Phase 2)
export { CBDGraphDatabaseEngine } from './graph/GraphDatabaseEngine.js';
export { CBDGremlinAPI } from './graph/GremlinAPI.js';
export { CBDCypherEngine } from './graph/CypherEngine.js';

// Time-Series Database Engine (Phase 3)
export { CBDTimeSeriesEngine } from './time-series/TimeSeriesEngine.js';

// Multi-Modal Vector Database Engine (Phase 4)
export { 
  CBDMultiModalVectorEngine,
  AzureMultiModalProvider,
  VectorSimilarityEngine,
  MultiModalFusionEngine 
} from './multi-modal/MultiModalVectorEngine.js';

// CND Compatibility Layer
export { CBDClient, CND, createCBDClient } from './client/CBDClient.js';
export type { CBDClientConfig, CBDQueryResult } from './client/CBDClient.js';

// Enterprise features
export * from './enterprise/index.js';

export type {
    ConversationExchange,
    MemorySearchResult,
    SearchQuery,
    VectorSearchOptions,
    VectorSearchResult,
    EmbeddingModel,
    VectorStore,
    StorageAdapter,
    DatabaseStats,
    CBDConfig,
    MemorySummary
} from './types/index.js';

// Time-Series Database Types
export type {
    TimeSeriesPoint,
    TimeSeriesMetrics,
    TimeSeriesBucket,
    TimeSeriesPartition,
    TimeSeriesAggregation,
    OHLCData,
    MovingAverageResult,
    TimeSeriesQuery,
    TimeSeriesQueryResult,
    RetentionPolicy,
    TimeSeriesEngineOptions,
    TimeSeriesStatistics,
    AnomalyDetectionResult
} from './time-series/TimeSeriesEngine.js';

// Multi-Modal Vector Database Types
export type {
    MultiModalDocument,
    MultiModalQuery,
    MultiModalSearchResult,
    MultiModalEmbeddingProvider,
    ModalityType,
    EmbeddingModel as MultiModalEmbeddingModel
} from './multi-modal/MultiModalVectorEngine.js';

/**
 * Factory function to create a CBD Memory Engine with sensible defaults
 */
export function createCBDEngine(config: Partial<import('./types/index.js').CBDConfig> = {}): import('./memory/MemoryEngine.js').CBDMemoryEngine {
    const defaultConfig: import('./types/index.js').CBDConfig = {
        storage: {
            type: 'cbd-native',
            dataPath: './cbd-data'
        },
        embedding: {
            model: 'openai',
            apiKey: process.env.OPENAI_API_KEY || undefined,
            modelName: 'text-embedding-ada-002',
            dimensions: 1536
        },
        vector: {
            indexType: 'faiss',
            dimensions: 1536,
            similarityMetric: 'cosine'
        },
        cache: {
            enabled: true,
            maxSize: 1000,
            ttl: 3600000 // 1 hour
        }
    };

    const mergedConfig: import('./types/index.js').CBDConfig = {
        ...defaultConfig,
        ...config,
        storage: { ...defaultConfig.storage, ...config.storage },
        embedding: { ...defaultConfig.embedding, ...config.embedding },
        vector: { ...defaultConfig.vector, ...config.vector },
        cache: { ...defaultConfig.cache, ...config.cache }
    };

    return new (require('./memory/MemoryEngine.js').CBDMemoryEngine)(mergedConfig);
}

/**
 * CBD version and metadata
 */
export const CBD_VERSION = '1.1.0';
export const CBD_DESCRIPTION = 'Codai Better Database - Revolutionary vector-native AI memory system with enterprise features';

/**
 * Utility function to validate CBD configuration
 */
export function validateCBDConfig(config: import('./types/index.js').CBDConfig): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!config.storage?.type) {
        errors.push('Storage type is required');
    }

    if (config.embedding?.model === 'openai' && !config.embedding.apiKey) {
        errors.push('OpenAI API key is required when using OpenAI embedding model');
    }

    if (!config.vector?.dimensions || config.vector.dimensions < 1) {
        errors.push('Vector dimensions must be a positive integer');
    }

    if (config.embedding?.dimensions && config.vector?.dimensions &&
        config.embedding.dimensions !== config.vector.dimensions) {
        errors.push('Embedding dimensions must match vector dimensions');
    }

    return {
        valid: errors.length === 0,
        errors
    };
}
