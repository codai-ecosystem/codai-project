/**
 * Enterprise CBD Engine TypeScript Wrapper
 * 
 * This module provides a TypeScript interface to the high-performance Rust CBD engine.
 * It maintains compatibility with existing TypeScript code while leveraging Rust performance.
 */

import { CBDMemoryEngine } from './memory/MemoryEngine.js';
import { Logger } from './utils/logger.js';
import { CBDConfig } from './types/index.js';

// Native Rust bindings (when available)
let rustEngine: any = null;

try {
    // Try to load the Rust bindings
    const bindings = require('../../rust/target/release/libcbd_engine.node');
    rustEngine = bindings;
} catch (error) {
    console.warn('Rust engine not available, falling back to TypeScript implementation');
}

export interface EnterpriseConfig {
    useRustEngine?: boolean;
    storageBackend?: 'typescript' | 'rust-rocksdb';
    vectorBackend?: 'typescript' | 'rust-hnsw';
    enableTransactions?: boolean;
    enableClustering?: boolean;
    enableMetrics?: boolean;
}

export interface VectorSearchResult {
    key: string;
    score: number;
    metadata?: any;
}

export interface EngineStats {
    storage: any;
    vector_index: any;
    metrics: any;
    timestamp: string;
}

export interface HealthStatus {
    status: 'healthy' | 'unhealthy';
    storage: any;
    vector_index: any;
    timestamp: string;
}

/**
 * Enterprise CBD Engine - Hybrid TypeScript/Rust Implementation
 * 
 * This class provides enterprise-grade database capabilities by combining
 * the existing TypeScript implementation with high-performance Rust core.
 */
export class EnterpriseCBDEngine {
    private config: EnterpriseConfig;
    private tsEngine: CBDMemoryEngine;
    private logger: Logger;
    private initialized = false;

    constructor(config: EnterpriseConfig = {}) {
        this.config = {
            useRustEngine: true,
            storageBackend: 'rust-rocksdb',
            vectorBackend: 'rust-hnsw',
            enableTransactions: true,
            enableClustering: false, // Phase 2 feature
            enableMetrics: true,
            ...config
        };

        this.logger = new Logger('EnterpriseCBDEngine');

        // Create default CBD config for TypeScript engine
        const defaultCBDConfig: CBDConfig = {
            embedding: {
                model: 'local',
                modelName: 'sentence-transformers/all-MiniLM-L6-v2'
            },
            vector: {
                dimensions: 384,
                indexType: 'faiss',
                similarityMetric: 'cosine'
            },
            storage: {
                type: 'cbd-native',
                dataPath: './cbd-data'
            },
            cache: {
                enabled: true,
                maxSize: 1000,
                ttl: 3600000 // 1 hour
            }
        };

        this.tsEngine = new CBDMemoryEngine(defaultCBDConfig);
    }

    /**
     * Initialize the enterprise engine
     */
    async initialize(): Promise<void> {
        if (this.initialized) {
            return;
        }

        this.logger.info('Initializing Enterprise CBD Engine', {
            config: this.config,
            rustAvailable: !!rustEngine
        });

        // Initialize TypeScript engine as fallback
        await this.tsEngine.initialize();

        // Initialize Rust engine if available and configured
        if (rustEngine && this.config.useRustEngine) {
            try {
                await rustEngine.initialize();
                this.logger.info('Rust engine initialized successfully');
            } catch (error) {
                this.logger.warn('Failed to initialize Rust engine, using TypeScript fallback', error);
                this.config.useRustEngine = false;
            }
        }

        this.initialized = true;
        this.logger.info('Enterprise CBD Engine initialization complete');
    }

    /**
     * Store a key-value pair
     */
    async store(key: string, value: Buffer): Promise<void> {
        await this.ensureInitialized();

        if (rustEngine && this.config.useRustEngine && this.config.storageBackend === 'rust-rocksdb') {
            return rustEngine.store(key, value);
        }

        // Fallback to TypeScript implementation
        await this.tsEngine.store_memory('', value.toString('utf-8'), {
            projectName: 'cbd-enterprise',
            sessionName: 'rust-integration',
            agentId: 'cbd-enterprise',
            timestamp: Date.now(),
            metadata: { key }
        });
    }

    /**
     * Retrieve a value by key
     */
    async retrieve(key: string): Promise<Buffer | null> {
        await this.ensureInitialized();

        if (rustEngine && this.config.useRustEngine && this.config.storageBackend === 'rust-rocksdb') {
            const result = await rustEngine.retrieve(key);
            return result ? Buffer.from(result) : null;
        }

        // Fallback to TypeScript implementation
        const memory = await this.tsEngine.get_memory(key);
        return memory ? Buffer.from(memory.userRequest + '\n' + memory.assistantResponse, 'utf-8') : null;
    }

    /**
     * Store a vector with metadata
     */
    async storeVector(key: string, vector: number[], metadata?: any): Promise<void> {
        await this.ensureInitialized();

        if (rustEngine && this.config.useRustEngine && this.config.vectorBackend === 'rust-hnsw') {
            const metadataJson = metadata ? JSON.stringify(metadata) : '';
            return rustEngine.storeVector(key, vector, metadataJson);
        }

        // Fallback to TypeScript implementation
        // Note: TypeScript engine doesn't support vector operations yet
        throw new Error('Vector operations not supported in TypeScript fallback mode');
    }

    /**
     * Search for similar vectors
     */
    async searchVectors(query: number[], k: number = 10, threshold?: number): Promise<VectorSearchResult[]> {
        await this.ensureInitialized();

        if (rustEngine && this.config.useRustEngine && this.config.vectorBackend === 'rust-hnsw') {
            const results = await rustEngine.searchVectors(query, k, threshold);
            return results.map((r: any) => ({
                key: r.key,
                score: r.score,
                metadata: r.metadata ? JSON.parse(r.metadata) : undefined
            }));
        }

        // Fallback to TypeScript implementation
        // Note: Vector search not supported in TypeScript fallback mode
        throw new Error('Vector search not supported in TypeScript fallback mode');
    }

    /**
     * Get engine health status
     */
    async healthCheck(): Promise<HealthStatus> {
        await this.ensureInitialized();

        if (rustEngine && this.config.useRustEngine) {
            const healthJson = await rustEngine.healthCheck();
            return JSON.parse(healthJson);
        }

        // Fallback to TypeScript health check
        return {
            status: 'healthy',
            storage: { status: 'healthy', engine: 'TypeScript' },
            vector_index: { status: 'healthy', engine: 'TypeScript' },
            timestamp: new Date().toISOString()
        };
    }

    /**
     * Get engine statistics
     */
    async getStats(): Promise<EngineStats> {
        await this.ensureInitialized();

        if (rustEngine && this.config.useRustEngine) {
            const statsJson = await rustEngine.getStats();
            return JSON.parse(statsJson);
        }

        // Fallback to TypeScript stats
        const tsStats = {
            storage_count: 0,
            vector_count: 0,
            memory_usage_bytes: 0,
            cache_hit_rate: 0.0
        }; // TypeScript engine doesn't have stats yet
        return {
            storage: { engine: 'TypeScript', count: tsStats.storage_count, memory_usage: tsStats.memory_usage_bytes },
            vector_index: { engine: 'TypeScript', count: tsStats.vector_count },
            metrics: { cache_hit_rate: tsStats.cache_hit_rate },
            timestamp: new Date().toISOString()
        };
    }

    /**
     * Search memory (compatibility with existing TypeScript API)
     */
    async searchMemory(query: string, limit: number = 10): Promise<any[]> {
        await this.ensureInitialized();

        // For now, delegate to TypeScript implementation
        // In the future, this could use Rust text processing
        const result = await this.tsEngine.search_memory(query, limit);
        return result.memories; // Extract the memories array from the search result
    }

    /**
     * Get memory by key (compatibility with existing TypeScript API)
     */
    async getMemory(key: string): Promise<any> {
        await this.ensureInitialized();

        // For now, delegate to TypeScript implementation
        return this.tsEngine.get_memory(key);
    }

    /**
     * Store memory (compatibility with existing TypeScript API)
     */
    async storeMemory(key: string, content: string, metadata: any = {}): Promise<void> {
        await this.ensureInitialized();

        // For now, delegate to TypeScript implementation
        const enrichedMetadata = {
            projectName: metadata.projectName || 'enterprise',
            sessionName: metadata.sessionName || 'default',
            agentId: metadata.agentId || 'cbd-enterprise',
            sequenceNumber: metadata.sequenceNumber,
            ...metadata
        };

        await this.tsEngine.store_memory(key || '', content, enrichedMetadata);
    }

    /**
     * Check if engine is using Rust backend
     */
    isUsingRustEngine(): boolean {
        return !!(rustEngine && this.config.useRustEngine);
    }

    /**
     * Get engine configuration
     */
    getConfig(): EnterpriseConfig {
        return { ...this.config };
    }

    /**
     * Ensure engine is initialized
     */
    private async ensureInitialized(): Promise<void> {
        if (!this.initialized) {
            await this.initialize();
        }
    }
}

// Export singleton instance for convenience
export const enterpriseEngine = new EnterpriseCBDEngine();

// Re-export for backward compatibility
export { CBDMemoryEngine } from './memory/MemoryEngine.js';
export * from './types/index.js';
