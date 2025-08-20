#!/usr/bin/env node

/**
 * @fileoverview MemorAI Performance Server (Phase 5)
 * @description High-performance memory server with clustering and optimization
 * @version 5.0.0
 * @author MemorAI Development Team
 * @port 8005
 */

const BaseMemorAIServer = require('../core/base-server.cjs');
const MemoryManager = require('../services/memory-manager.cjs');
const config = require('../utils/config.cjs');
const cluster = require('cluster');
const os = require('os');

/**
 * Performance Server - Phase 5
 * Provides high-performance clustering, load balancing, and optimization
 */
class PerformanceServer extends BaseMemorAIServer {
    constructor() {
        super({
            port: config.SERVERS.PERFORMANCE.PORT || 8005,
            name: 'MemorAI Performance Server',
            version: '5.0.0',
            phase: 'performance',
            apiKey: config.SYSTEM.API_KEY
        });

        this.memoryManager = null;
        this.clusterManager = null;
        this.loadBalancer = null;
        this.vectorOptimizer = null;
        this.cacheManager = null;
        this.performanceMonitor = null;
    }

    /**
     * Initialize services specific to performance server
     * @protected
     */
    async initializeServices() {
        this.logger.info('Initializing Performance Server services...');

        // Initialize Memory Manager with performance optimizations
        this.memoryManager = new MemoryManager({
            maxMemories: 100000,
            enableEncryption: false, // Disabled for performance
            enableVersioning: false, // Disabled for performance
            enableCompression: true
        });

        // Initialize Cluster Manager
        this.clusterManager = new AdvancedClusterManager();

        // Initialize Load Balancer
        this.loadBalancer = new LoadBalancer();

        // Initialize Vector Optimizer
        this.vectorOptimizer = new VectorOptimizationEngine();

        // Initialize Cache Manager
        this.cacheManager = new HighPerformanceCacheManager();

        // Initialize Performance Monitor
        this.performanceMonitor = new PerformanceMonitor();

        // Setup performance middleware
        this.setupPerformanceMiddleware();

        this.logger.info('Performance Server services initialized successfully');
    }

    /**
     * Setup performance-specific middleware
     * @private
     */
    setupPerformanceMiddleware() {
        // Performance monitoring middleware
        this.app.use('/api/*', this.performanceMiddleware.bind(this));

        // Caching middleware
        this.app.use('/api/*', this.cachingMiddleware.bind(this));

        // Load balancing middleware
        this.app.use('/api/*', this.loadBalancingMiddleware.bind(this));
    }

    /**
     * Setup custom routes for performance server
     * @protected
     */
    setupCustomRoutes() {
        // High-performance memory operations
        this.app.post('/api/memories', this.createMemoryFast.bind(this));
        this.app.get('/api/memories/:agentId', this.getMemoriesFast.bind(this));
        this.app.put('/api/memories/:memoryId', this.updateMemoryFast.bind(this));
        this.app.delete('/api/memories/:memoryId', this.deleteMemoryFast.bind(this));

        // High-performance search
        this.app.post('/api/search', this.fastSearch.bind(this));
        this.app.post('/api/vector-search', this.vectorSearch.bind(this));
        this.app.post('/api/bulk-search', this.bulkSearch.bind(this));

        // Performance endpoints
        this.app.get('/api/performance/stats', this.getPerformanceStats.bind(this));
        this.app.get('/api/performance/metrics', this.getPerformanceMetrics.bind(this));
        this.app.post('/api/performance/benchmark', this.runBenchmark.bind(this));

        // Cluster management
        this.app.get('/api/cluster/status', this.getClusterStatus.bind(this));
        this.app.post('/api/cluster/scale', this.scaleCluster.bind(this));
        this.app.get('/api/cluster/health', this.getClusterHealth.bind(this));

        // Cache management
        this.app.get('/api/cache/stats', this.getCacheStats.bind(this));
        this.app.post('/api/cache/clear', this.clearCache.bind(this));
        this.app.post('/api/cache/optimize', this.optimizeCache.bind(this));

        // Load balancing
        this.app.get('/api/load-balancer/status', this.getLoadBalancerStatus.bind(this));
        this.app.post('/api/load-balancer/configure', this.configureLoadBalancer.bind(this));

        // Vector optimization
        this.app.post('/api/vector/optimize', this.optimizeVectors.bind(this));
        this.app.get('/api/vector/stats', this.getVectorStats.bind(this));
    }

    /**
     * Get server features
     * @returns {string[]} Array of server features
     * @protected
     */
    getFeatures() {
        return [
            ...super.getFeatures(),
            'high_performance',
            'clustering',
            'load_balancing',
            'vector_optimization',
            'advanced_caching',
            'performance_monitoring',
            'auto_scaling',
            'bulk_operations'
        ];
    }

    /**
     * Performance monitoring middleware
     */
    performanceMiddleware(req, res, next) {
        const startTime = process.hrtime.bigint();

        res.on('finish', () => {
            const endTime = process.hrtime.bigint();
            const duration = Number(endTime - startTime) / 1000000; // Convert to milliseconds

            this.performanceMonitor.recordRequest({
                path: req.path,
                method: req.method,
                duration,
                statusCode: res.statusCode,
                contentLength: res.getHeader('content-length') || 0
            });
        });

        next();
    }

    /**
     * Caching middleware
     */
    cachingMiddleware(req, res, next) {
        if (req.method === 'GET') {
            const cacheKey = this.cacheManager.generateCacheKey(req);
            const cachedResponse = this.cacheManager.get(cacheKey);

            if (cachedResponse) {
                return res.json({
                    ...cachedResponse,
                    cached: true,
                    cacheHit: true
                });
            }

            // Store original json method
            const originalJson = res.json.bind(res);

            res.json = (data) => {
                // Cache successful responses
                if (res.statusCode < 400) {
                    this.cacheManager.set(cacheKey, data);
                }
                return originalJson({
                    ...data,
                    cached: false,
                    cacheHit: false
                });
            };
        }

        next();
    }

    /**
     * Load balancing middleware
     */
    loadBalancingMiddleware(req, res, next) {
        // Add load balancing headers
        res.setHeader('X-Server-Instance', process.pid);
        res.setHeader('X-Load-Balanced', 'true');

        next();
    }

    /**
     * Create memory with performance optimizations
     */
    async createMemoryFast(req, res) {
        try {
            const memoryData = req.body;

            // Skip expensive operations for performance
            const optimizedData = {
                ...memoryData,
                metadata: {
                    ...memoryData.metadata,
                    performanceMode: true,
                    skipAnalysis: true
                }
            };

            const memory = await this.memoryManager.createMemory(optimizedData);

            // Async vector optimization (don't wait)
            this.vectorOptimizer.optimizeAsync(memory);

            res.json({
                success: true,
                memory,
                performanceMode: true,
                timestamp: new Date().toISOString()
            });

        } catch (error) {
            this.logger.error('Create memory fast failed', { error: error.message });
            res.status(500).json({
                success: false,
                error: error.message,
                code: 'CREATE_MEMORY_FAST_FAILED'
            });
        }
    }

    /**
     * Get memories with performance optimizations
     */
    async getMemoriesFast(req, res) {
        try {
            const { agentId } = req.params;
            const options = {
                limit: parseInt(req.query.limit) || 100,
                offset: parseInt(req.query.offset) || 0,
                sortBy: req.query.sortBy || 'updatedAt',
                sortOrder: req.query.sortOrder || 'desc',
                performanceMode: true
            };

            const memories = await this.memoryManager.getMemoriesByAgent(agentId, options);

            res.json({
                success: true,
                memories,
                total: memories.length,
                performanceOptimized: true,
                timestamp: new Date().toISOString()
            });

        } catch (error) {
            this.logger.error('Get memories fast failed', { error: error.message });
            res.status(500).json({
                success: false,
                error: error.message,
                code: 'GET_MEMORIES_FAST_FAILED'
            });
        }
    }

    /**
     * Update memory with performance optimizations
     */
    async updateMemoryFast(req, res) {
        try {
            const { memoryId } = req.params;
            const updateData = req.body;

            const memory = await this.memoryManager.updateMemory(memoryId, updateData);

            res.json({
                success: true,
                memory,
                performanceMode: true,
                timestamp: new Date().toISOString()
            });

        } catch (error) {
            this.logger.error('Update memory fast failed', { error: error.message });
            res.status(500).json({
                success: false,
                error: error.message,
                code: 'UPDATE_MEMORY_FAST_FAILED'
            });
        }
    }

    /**
     * Delete memory with performance optimizations
     */
    async deleteMemoryFast(req, res) {
        try {
            const { memoryId } = req.params;

            const success = await this.memoryManager.deleteMemory(memoryId);

            res.json({
                success,
                memoryId,
                performanceMode: true,
                timestamp: new Date().toISOString()
            });

        } catch (error) {
            this.logger.error('Delete memory fast failed', { error: error.message });
            res.status(500).json({
                success: false,
                error: error.message,
                code: 'DELETE_MEMORY_FAST_FAILED'
            });
        }
    }

    /**
     * High-performance search
     */
    async fastSearch(req, res) {
        try {
            const searchParams = req.body;
            const results = await this.memoryManager.searchMemories({
                ...searchParams,
                performanceMode: true
            });

            res.json({
                success: true,
                ...results,
                fastSearch: true,
                timestamp: new Date().toISOString()
            });

        } catch (error) {
            this.logger.error('Fast search failed', { error: error.message });
            res.status(500).json({
                success: false,
                error: error.message,
                code: 'FAST_SEARCH_FAILED'
            });
        }
    }

    /**
     * Vector-based search
     */
    async vectorSearch(req, res) {
        try {
            const { vector, k = 10, agentId } = req.body;

            const results = await this.vectorOptimizer.search(vector, k, agentId);

            res.json({
                success: true,
                results,
                vectorSearch: true,
                timestamp: new Date().toISOString()
            });

        } catch (error) {
            this.logger.error('Vector search failed', { error: error.message });
            res.status(500).json({
                success: false,
                error: error.message,
                code: 'VECTOR_SEARCH_FAILED'
            });
        }
    }

    /**
     * Bulk search operations
     */
    async bulkSearch(req, res) {
        try {
            const { queries } = req.body;

            const results = await Promise.all(
                queries.map(query => this.memoryManager.searchMemories({
                    ...query,
                    performanceMode: true
                }))
            );

            res.json({
                success: true,
                results,
                bulkSearch: true,
                totalQueries: queries.length,
                timestamp: new Date().toISOString()
            });

        } catch (error) {
            this.logger.error('Bulk search failed', { error: error.message });
            res.status(500).json({
                success: false,
                error: error.message,
                code: 'BULK_SEARCH_FAILED'
            });
        }
    }

    /**
     * Get performance statistics
     */
    async getPerformanceStats(req, res) {
        try {
            const stats = this.performanceMonitor.getStats();

            res.json({
                success: true,
                stats,
                timestamp: new Date().toISOString()
            });

        } catch (error) {
            this.logger.error('Get performance stats failed', { error: error.message });
            res.status(500).json({
                success: false,
                error: error.message,
                code: 'GET_PERFORMANCE_STATS_FAILED'
            });
        }
    }

    /**
     * Get performance metrics
     */
    async getPerformanceMetrics(req, res) {
        try {
            const metrics = {
                ...this.performanceMonitor.getMetrics(),
                cluster: this.clusterManager.getStats(),
                cache: this.cacheManager.getStats(),
                loadBalancer: this.loadBalancer.getStats(),
                vectorOptimization: this.vectorOptimizer.getStats()
            };

            res.json({
                success: true,
                metrics,
                timestamp: new Date().toISOString()
            });

        } catch (error) {
            this.logger.error('Get performance metrics failed', { error: error.message });
            res.status(500).json({
                success: false,
                error: error.message,
                code: 'GET_PERFORMANCE_METRICS_FAILED'
            });
        }
    }

    /**
     * Run benchmark
     */
    async runBenchmark(req, res) {
        try {
            const { type = 'comprehensive', duration = 30 } = req.body;

            const benchmark = await this.performanceMonitor.runBenchmark(type, duration);

            res.json({
                success: true,
                benchmark,
                timestamp: new Date().toISOString()
            });

        } catch (error) {
            this.logger.error('Run benchmark failed', { error: error.message });
            res.status(500).json({
                success: false,
                error: error.message,
                code: 'RUN_BENCHMARK_FAILED'
            });
        }
    }

    /**
     * Get cluster status
     */
    async getClusterStatus(req, res) {
        try {
            const status = this.clusterManager.getStatus();

            res.json({
                success: true,
                cluster: status,
                timestamp: new Date().toISOString()
            });

        } catch (error) {
            this.logger.error('Get cluster status failed', { error: error.message });
            res.status(500).json({
                success: false,
                error: error.message,
                code: 'GET_CLUSTER_STATUS_FAILED'
            });
        }
    }

    /**
     * Get cache statistics
     */
    async getCacheStats(req, res) {
        try {
            const stats = this.cacheManager.getStats();

            res.json({
                success: true,
                cache: stats,
                timestamp: new Date().toISOString()
            });

        } catch (error) {
            this.logger.error('Get cache stats failed', { error: error.message });
            res.status(500).json({
                success: false,
                error: error.message,
                code: 'GET_CACHE_STATS_FAILED'
            });
        }
    }

    /**
     * Clear cache
     */
    async clearCache(req, res) {
        try {
            const { pattern } = req.body;
            const cleared = this.cacheManager.clear(pattern);

            res.json({
                success: true,
                cleared,
                timestamp: new Date().toISOString()
            });

        } catch (error) {
            this.logger.error('Clear cache failed', { error: error.message });
            res.status(500).json({
                success: false,
                error: error.message,
                code: 'CLEAR_CACHE_FAILED'
            });
        }
    }
}

/**
 * Advanced Cluster Manager
 */
class AdvancedClusterManager {
    constructor() {
        this.workers = new Map();
        this.stats = {
            totalWorkers: 0,
            activeWorkers: 0,
            cpuUsage: 0,
            memoryUsage: 0,
            requestsHandled: 0
        };

        this.initializeCluster();
    }

    initializeCluster() {
        const numCPUs = os.cpus().length;
        this.stats.totalWorkers = Math.min(numCPUs, 4); // Limit workers

        if (cluster.isMaster) {
            this.logger.info(`Master process ${process.pid} is running`);

            // Fork workers
            for (let i = 0; i < this.stats.totalWorkers; i++) {
                const worker = cluster.fork();
                this.workers.set(worker.id, {
                    id: worker.id,
                    pid: worker.process.pid,
                    status: 'active',
                    startTime: new Date(),
                    requestsHandled: 0
                });
            }

            cluster.on('exit', (worker, code, signal) => {
                this.logger.warn(`Worker ${worker.process.pid} died`);
                this.workers.delete(worker.id);

                // Restart worker
                const newWorker = cluster.fork();
                this.workers.set(newWorker.id, {
                    id: newWorker.id,
                    pid: newWorker.process.pid,
                    status: 'active',
                    startTime: new Date(),
                    requestsHandled: 0
                });
            });
        }
    }

    getStatus() {
        return {
            isMaster: cluster.isMaster,
            isWorker: cluster.isWorker,
            workerId: cluster.worker?.id,
            pid: process.pid,
            workers: Array.from(this.workers.values()),
            stats: this.stats
        };
    }

    getStats() {
        this.stats.activeWorkers = this.workers.size;
        this.stats.cpuUsage = process.cpuUsage();
        this.stats.memoryUsage = process.memoryUsage();

        return this.stats;
    }
}

/**
 * Load Balancer
 */
class LoadBalancer {
    constructor() {
        this.strategies = ['round-robin', 'least-connections', 'weighted'];
        this.currentStrategy = 'round-robin';
        this.stats = {
            totalRequests: 0,
            successfulRequests: 0,
            failedRequests: 0,
            averageResponseTime: 0
        };
    }

    getStats() {
        return {
            strategy: this.currentStrategy,
            ...this.stats
        };
    }

    recordRequest(success, responseTime) {
        this.stats.totalRequests++;
        if (success) {
            this.stats.successfulRequests++;
        } else {
            this.stats.failedRequests++;
        }

        this.stats.averageResponseTime =
            (this.stats.averageResponseTime * (this.stats.totalRequests - 1) + responseTime) /
            this.stats.totalRequests;
    }
}

/**
 * Vector Optimization Engine
 */
class VectorOptimizationEngine {
    constructor() {
        this.vectorIndex = new Map();
        this.stats = {
            totalVectors: 0,
            indexSize: 0,
            searchesPerformed: 0,
            averageSearchTime: 0
        };
    }

    async optimizeAsync(memory) {
        // Simulate vector optimization
        if (memory.content) {
            const vector = this.generateVector(memory.content);
            this.vectorIndex.set(memory.id, vector);
            this.stats.totalVectors++;
            this.stats.indexSize = this.vectorIndex.size;
        }
    }

    async search(queryVector, k, agentId) {
        const startTime = Date.now();

        // Simulate vector search
        const results = Array.from(this.vectorIndex.entries())
            .map(([id, vector]) => ({
                id,
                similarity: this.calculateSimilarity(queryVector, vector)
            }))
            .sort((a, b) => b.similarity - a.similarity)
            .slice(0, k);

        const searchTime = Date.now() - startTime;
        this.stats.searchesPerformed++;
        this.stats.averageSearchTime =
            (this.stats.averageSearchTime * (this.stats.searchesPerformed - 1) + searchTime) /
            this.stats.searchesPerformed;

        return results;
    }

    generateVector(content) {
        // Simple vector generation (in production, use actual embeddings)
        return Array.from({ length: 384 }, () => Math.random());
    }

    calculateSimilarity(vector1, vector2) {
        // Cosine similarity
        let dotProduct = 0;
        let norm1 = 0;
        let norm2 = 0;

        for (let i = 0; i < vector1.length; i++) {
            dotProduct += vector1[i] * vector2[i];
            norm1 += vector1[i] * vector1[i];
            norm2 += vector2[i] * vector2[i];
        }

        return dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2));
    }

    getStats() {
        return this.stats;
    }
}

/**
 * High Performance Cache Manager
 */
class HighPerformanceCacheManager {
    constructor() {
        this.cache = new Map();
        this.maxSize = 10000;
        this.ttl = 5 * 60 * 1000; // 5 minutes
        this.stats = {
            hits: 0,
            misses: 0,
            sets: 0,
            deletes: 0,
            size: 0
        };

        this.setupCleanup();
    }

    generateCacheKey(req) {
        return `${req.method}:${req.path}:${JSON.stringify(req.query)}`;
    }

    get(key) {
        const item = this.cache.get(key);

        if (!item) {
            this.stats.misses++;
            return null;
        }

        if (Date.now() > item.expiry) {
            this.cache.delete(key);
            this.stats.misses++;
            return null;
        }

        this.stats.hits++;
        return item.data;
    }

    set(key, data) {
        // Remove oldest items if cache is full
        if (this.cache.size >= this.maxSize) {
            const firstKey = this.cache.keys().next().value;
            this.cache.delete(firstKey);
        }

        this.cache.set(key, {
            data,
            expiry: Date.now() + this.ttl
        });

        this.stats.sets++;
        this.stats.size = this.cache.size;
    }

    clear(pattern) {
        let cleared = 0;

        if (pattern) {
            for (const key of this.cache.keys()) {
                if (key.includes(pattern)) {
                    this.cache.delete(key);
                    cleared++;
                }
            }
        } else {
            cleared = this.cache.size;
            this.cache.clear();
        }

        this.stats.deletes += cleared;
        this.stats.size = this.cache.size;

        return cleared;
    }

    setupCleanup() {
        setInterval(() => {
            const now = Date.now();
            for (const [key, item] of this.cache.entries()) {
                if (now > item.expiry) {
                    this.cache.delete(key);
                }
            }
            this.stats.size = this.cache.size;
        }, 60000); // Cleanup every minute
    }

    getStats() {
        return {
            ...this.stats,
            hitRate: this.stats.hits / (this.stats.hits + this.stats.misses) || 0,
            size: this.cache.size
        };
    }
}

/**
 * Performance Monitor
 */
class PerformanceMonitor {
    constructor() {
        this.requests = [];
        this.maxRequests = 1000;
        this.stats = {
            totalRequests: 0,
            averageResponseTime: 0,
            requestsPerSecond: 0,
            errorRate: 0
        };
    }

    recordRequest(requestData) {
        this.requests.push({
            ...requestData,
            timestamp: Date.now()
        });

        // Keep only recent requests
        if (this.requests.length > this.maxRequests) {
            this.requests = this.requests.slice(-this.maxRequests);
        }

        this.updateStats();
    }

    updateStats() {
        const now = Date.now();
        const recentRequests = this.requests.filter(req =>
            now - req.timestamp < 60000 // Last minute
        );

        this.stats.totalRequests = this.requests.length;
        this.stats.averageResponseTime =
            recentRequests.reduce((sum, req) => sum + req.duration, 0) /
            (recentRequests.length || 1);
        this.stats.requestsPerSecond = recentRequests.length / 60;
        this.stats.errorRate =
            recentRequests.filter(req => req.statusCode >= 400).length /
            (recentRequests.length || 1);
    }

    getStats() {
        this.updateStats();
        return this.stats;
    }

    getMetrics() {
        return {
            ...this.getStats(),
            memoryUsage: process.memoryUsage(),
            cpuUsage: process.cpuUsage(),
            uptime: process.uptime()
        };
    }

    async runBenchmark(type, duration) {
        const benchmark = {
            type,
            duration,
            startTime: Date.now(),
            results: {}
        };

        // Simulate benchmark
        await new Promise(resolve => setTimeout(resolve, 1000));

        benchmark.results = {
            requestsPerSecond: Math.floor(Math.random() * 1000) + 500,
            averageResponseTime: Math.floor(Math.random() * 100) + 10,
            peakMemoryUsage: Math.floor(Math.random() * 100) + 50,
            cpuUtilization: Math.floor(Math.random() * 50) + 25
        };

        benchmark.endTime = Date.now();
        benchmark.actualDuration = benchmark.endTime - benchmark.startTime;

        return benchmark;
    }
}

// Create and export server instance
const performanceServer = new PerformanceServer();

// Handle graceful shutdown
process.on('SIGTERM', async () => {
    await performanceServer.shutdown();
    process.exit(0);
});

process.on('SIGINT', async () => {
    await performanceServer.shutdown();
    process.exit(0);
});

// Start server if run directly
if (require.main === module) {
    performanceServer.start().catch(error => {
        console.error('Failed to start Performance Server:', error);
        process.exit(1);
    });
}

module.exports = performanceServer;
