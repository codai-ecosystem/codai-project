/**
 * CBD Rust Engine Direct Integration for MemorAI MCP
 * Phase 2: High-Performance Direct Rust Bindings
 * 
 * This module provides direct integration with the CBD Rust engine
 * for maximum performance (10M+ vectors, <100ms response times)
 */

const path = require('path');
const { performance } = require('perf_hooks');

class CBDRustEngine {
    constructor(options = {}) {
        this.options = {
            maxVectors: options.maxVectors || 10000000, // 10M target
            responseTimeTarget: options.responseTimeTarget || 100, // 100ms target
            cacheSize: options.cacheSize || 10000,
            enableMetrics: options.enableMetrics !== false,
            ...options
        };

        this.engine = null;
        this.cache = new Map();
        this.metrics = {
            operations: 0,
            totalTime: 0,
            vectorOperations: 0,
            vectorTotalTime: 0,
            cacheHits: 0,
            cacheMisses: 0
        };

        this.isInitialized = false;
        console.log('🦀 CBD Rust Engine initializing...');
    }

    /**
     * Initialize the CBD Rust engine with direct bindings
     * Note: Currently requires FFI library for proper DLL loading
     */
    async initialize() {
        try {
            // For now, skip direct Rust engine loading due to FFI requirements
            // TODO: Implement proper FFI binding with node-ffi-napi
            const cbdEnginePath = path.join(
                __dirname,
                '../cbd/rust/target/release/cbd_engine.dll'
            );

            console.log(`🦀 Rust engine path: ${cbdEnginePath}`);
            console.log(`📋 Rust engine integration pending FFI implementation`);

            // Skip direct DLL loading for now - requires FFI
            // this.engine = require(cbdEnginePath);

            // Mark as not initialized (will use HTTP fallback)
            this.isInitialized = false;
            console.log('📋 Falling back to HTTP API for now...');
            return false;
        } catch (error) {
            console.error('❌ Failed to initialize CBD Rust Engine:', error);
            console.log('📋 Falling back to HTTP API for now...');
            this.isInitialized = false;
            return false;
        }
    }

    /**
     * Store a memory with vector embeddings using direct Rust calls
     */
    async storeMemory(key, content, embedding, metadata = {}) {
        const startTime = performance.now();

        try {
            if (!this.isInitialized) {
                throw new Error('CBD Rust Engine not initialized');
            }

            // Prepare memory data
            const memoryData = {
                content,
                embedding,
                metadata: {
                    ...metadata,
                    timestamp: new Date().toISOString(),
                    version: '2.0.0-rust'
                }
            };

            // Store the memory data using Rust bindings
            await this.engine.store(key, Buffer.from(JSON.stringify(memoryData)));

            // Store vector embedding separately for high-performance search
            if (embedding && Array.isArray(embedding)) {
                await this.engine.storeVector(
                    `vector:${key}`,
                    embedding,
                    JSON.stringify(metadata)
                );
                this.metrics.vectorOperations++;
            }

            // Update cache
            this.cache.set(key, memoryData);
            if (this.cache.size > this.options.cacheSize) {
                const firstKey = this.cache.keys().next().value;
                this.cache.delete(firstKey);
            }

            this.updateMetrics(startTime, false);

            return {
                success: true,
                key,
                stored: true,
                performance: {
                    responseTime: performance.now() - startTime,
                    method: 'rust-direct'
                }
            };

        } catch (error) {
            console.error('❌ CBD Rust store error:', error);
            this.updateMetrics(startTime, true);
            throw error;
        }
    }

    /**
     * Retrieve a memory using direct Rust calls
     */
    async retrieveMemory(key) {
        const startTime = performance.now();

        try {
            if (!this.isInitialized) {
                throw new Error('CBD Rust Engine not initialized');
            }

            // Check cache first
            if (this.cache.has(key)) {
                this.metrics.cacheHits++;
                this.updateMetrics(startTime, false);
                return this.cache.get(key);
            }

            this.metrics.cacheMisses++;

            // Retrieve using Rust bindings
            const dataBuffer = await this.engine.retrieve(key);

            if (!dataBuffer) {
                this.updateMetrics(startTime, false);
                return null;
            }

            const memoryData = JSON.parse(dataBuffer.toString());

            // Update cache
            this.cache.set(key, memoryData);

            this.updateMetrics(startTime, false);

            return memoryData;

        } catch (error) {
            console.error('❌ CBD Rust retrieve error:', error);
            this.updateMetrics(startTime, true);
            throw error;
        }
    }

    /**
     * High-performance vector search using FAISS
     */
    async searchVectors(queryEmbedding, k = 10, threshold = 0.7) {
        const startTime = performance.now();

        try {
            if (!this.isInitialized) {
                throw new Error('CBD Rust Engine not initialized');
            }

            if (!Array.isArray(queryEmbedding)) {
                throw new Error('Query embedding must be an array');
            }

            // Perform high-performance vector search using Rust/FAISS
            const results = await this.engine.searchVectors(queryEmbedding, k, threshold);

            // Enhance results with memory data
            const enhancedResults = [];
            for (const result of results) {
                const key = result.key.replace('vector:', '');
                const memoryData = await this.retrieveMemory(key);

                if (memoryData) {
                    enhancedResults.push({
                        key,
                        content: memoryData.content,
                        metadata: memoryData.metadata,
                        score: result.score,
                        vectorMetadata: result.metadata ? JSON.parse(result.metadata) : null
                    });
                }
            }

            this.metrics.vectorOperations++;
            this.metrics.vectorTotalTime += performance.now() - startTime;
            this.updateMetrics(startTime, false);

            return {
                results: enhancedResults,
                count: enhancedResults.length,
                performance: {
                    responseTime: performance.now() - startTime,
                    method: 'rust-faiss'
                }
            };

        } catch (error) {
            console.error('❌ CBD Rust vector search error:', error);
            this.updateMetrics(startTime, true);
            throw error;
        }
    }

    /**
     * Get comprehensive health and performance stats
     */
    async getHealth() {
        try {
            if (!this.isInitialized) {
                return {
                    status: 'not_initialized',
                    rustEngine: false,
                    performance: this.getPerformanceMetrics()
                };
            }

            const healthData = await this.engine.healthCheck();
            const stats = await this.engine.getStats();

            return {
                status: 'healthy',
                rustEngine: true,
                health: JSON.parse(healthData),
                stats: JSON.parse(stats),
                performance: this.getPerformanceMetrics()
            };

        } catch (error) {
            console.error('❌ CBD Rust health check error:', error);
            return {
                status: 'error',
                rustEngine: false,
                error: error.message,
                performance: this.getPerformanceMetrics()
            };
        }
    }

    /**
     * Get performance metrics
     */
    getPerformanceMetrics() {
        const avgResponseTime = this.metrics.operations > 0
            ? this.metrics.totalTime / this.metrics.operations
            : 0;

        const avgVectorTime = this.metrics.vectorOperations > 0
            ? this.metrics.vectorTotalTime / this.metrics.vectorOperations
            : 0;

        const cacheHitRate = (this.metrics.cacheHits + this.metrics.cacheMisses) > 0
            ? (this.metrics.cacheHits / (this.metrics.cacheHits + this.metrics.cacheMisses)) * 100
            : 0;

        return {
            operations: this.metrics.operations,
            averageResponseTime: avgResponseTime,
            vectorOperations: this.metrics.vectorOperations,
            averageVectorTime: avgVectorTime,
            cacheHitRate: cacheHitRate,
            targetResponseTime: this.options.responseTimeTarget,
            meetingTarget: avgResponseTime <= this.options.responseTimeTarget,
            maxVectorCapacity: this.options.maxVectors,
            cacheSize: this.cache.size,
            maxCacheSize: this.options.cacheSize
        };
    }

    /**
     * Update performance metrics
     */
    updateMetrics(startTime, isError = false) {
        if (!isError) {
            this.metrics.operations++;
            this.metrics.totalTime += performance.now() - startTime;
        }
    }

    /**
     * Clear cache and reset metrics
     */
    async cleanup() {
        this.cache.clear();
        this.metrics = {
            operations: 0,
            totalTime: 0,
            vectorOperations: 0,
            vectorTotalTime: 0,
            cacheHits: 0,
            cacheMisses: 0
        };
        console.log('🧹 CBD Rust Engine cache and metrics cleared');
    }
}

/**
 * Enhanced Memory Store with Direct Rust Integration
 */
class RustEnhancedMemoryStore {
    constructor(options = {}) {
        this.rustEngine = new CBDRustEngine(options);
        this.httpFallback = null; // Keep HTTP fallback for compatibility
        this.cbdBaseUrl = options.cbdBaseUrl || 'http://localhost:4180';

        console.log('🚀 Rust Enhanced Memory Store initializing...');
    }

    async initialize() {
        const rustSuccess = await this.rustEngine.initialize();

        if (!rustSuccess) {
            console.log('⚠️  Rust engine failed, HTTP fallback will be used');
            // Initialize HTTP fallback here if needed
        }

        return true;
    }

    async store(key, content, embedding, metadata) {
        try {
            if (!this.rustEngine.isInitialized) {
                return await this.httpFallbackStore(key, content, embedding, metadata);
            }
            return await this.rustEngine.storeMemory(key, content, embedding, metadata);
        } catch (error) {
            console.error('❌ Rust store failed, using fallback:', error);
            return await this.httpFallbackStore(key, content, embedding, metadata);
        }
    }

    async retrieve(key) {
        try {
            if (!this.rustEngine.isInitialized) {
                return await this.httpFallbackRetrieve(key);
            }
            return await this.rustEngine.retrieveMemory(key);
        } catch (error) {
            console.error('❌ Rust retrieve failed, using fallback:', error);
            return await this.httpFallbackRetrieve(key);
        }
    }

    async httpFallbackStore(key, content, embedding, metadata) {
        // HTTP API fallback for store - using correct CBD document API format
        const response = await fetch(`${this.cbdBaseUrl}/document`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                collection: 'memorai_memories',
                document: {
                    _id: key,
                    content: content,
                    metadata: metadata,
                    vector: embedding
                }
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP store failed: ${response.statusText}`);
        }

        return await response.json();
    }

    async httpFallbackRetrieve(key) {
        // HTTP API fallback for retrieve - using correct CBD document API format
        const response = await fetch(`${this.cbdBaseUrl}/document/memorai_memories/${key}`);

        if (!response.ok) {
            if (response.status === 404) {
                return null;
            }
            throw new Error(`HTTP retrieve failed: ${response.statusText}`);
        }

        return await response.json();
    }

    async search(queryEmbedding, options = {}) {
        try {
            if (!this.rustEngine.isInitialized) {
                // Use HTTP fallback when Rust engine not available
                return await this.httpFallbackSearch(queryEmbedding, options);
            }
            return await this.rustEngine.searchVectors(
                queryEmbedding,
                options.k || 10,
                options.threshold || 0.7
            );
        } catch (error) {
            console.error('❌ Rust search failed, using fallback:', error);
            return await this.httpFallbackSearch(queryEmbedding, options);
        }
    }

    async getAll(agentId = 'default') {
        try {
            if (!this.rustEngine.isInitialized) {
                return await this.httpFallbackGetAll(agentId);
            }
            return await this.rustEngine.getAllMemories(agentId);
        } catch (error) {
            console.error('❌ Rust getAll failed, using fallback:', error);
            return await this.httpFallbackGetAll(agentId);
        }
    }

    async httpFallbackSearch(queryEmbedding, options = {}) {
        // HTTP API fallback for search - using correct CBD vector API format
        const response = await fetch(`${this.cbdBaseUrl}/vector/search`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                vector: queryEmbedding,
                k: options.k || 10,
                threshold: options.threshold || 0.7,
                filter: options.filter || {}
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP search failed: ${response.statusText}`);
        }

        return await response.json();
    }

    async httpFallbackGetAll(agentId = 'default') {
        // HTTP API fallback for getAll - using correct CBD document API format
        const queryParam = encodeURIComponent(JSON.stringify({ 'metadata.agentId': agentId }));
        const response = await fetch(`${this.cbdBaseUrl}/document/memorai_memories?query=${queryParam}`);

        if (!response.ok) {
            throw new Error(`HTTP getAll failed: ${response.statusText}`);
        }

        const data = await response.json();
        return data.success ? data.result : [];
    }

    async getHealth() {
        return await this.rustEngine.getHealth();
    }

    async getMetrics() {
        return this.rustEngine.getPerformanceMetrics();
    }
}

module.exports = {
    CBDRustEngine,
    RustEnhancedMemoryStore
};
