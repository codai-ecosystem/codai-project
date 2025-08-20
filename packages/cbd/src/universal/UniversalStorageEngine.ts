/**
 * CBD Universal Storage Engine
 * Adaptive storage supporting all database paradigms with optimal performance
 * 
 * Phase 1: Foundation storage engine with adaptive layout and multi-paradigm support
 */

import { EventEmitter } from 'events';
import {
    UniversalRecord,
    QueryContext,
    QueryResult,
    UniversalRecordUtils
} from './UniversalDataModel.js';

/**
 * Storage engine configuration
 */
export interface StorageEngineConfig {
    // Core settings
    dataPath: string;

    // Performance tuning
    maxMemoryUsage: number; // MB
    cacheSize: number;      // Number of records
    flushInterval: number;  // Seconds

    // Storage optimization
    defaultLayout: 'row' | 'column' | 'hybrid';
    compressionEnabled: boolean;
    compressionAlgorithm: 'snappy' | 'lz4' | 'zstd';

    // Multi-paradigm settings
    vectorIndexType: 'hnsw' | 'ivf' | 'lsh';
    sqlPageSize: number;
    documentMaxSize: number;

    // Clustering and distribution (for future phases)
    nodeId?: string;
    clusterEnabled?: boolean;
}

/**
 * Storage statistics and monitoring
 */
export interface StorageStats {
    // Record counts by paradigm
    totalRecords: number;
    relationalRecords: number;
    documentRecords: number;
    graphNodes: number;
    graphEdges: number;
    vectorRecords: number;
    timeSeriesRecords: number;
    keyValueRecords: number;

    // Storage efficiency
    totalSizeBytes: number;
    compressedSizeBytes: number;
    compressionRatio: number;

    // Performance metrics
    averageReadLatency: number;  // ms
    averageWriteLatency: number; // ms
    cacheHitRate: number;        // 0-1
    indexEfficiency: number;     // 0-1

    // Resource utilization
    memoryUsageBytes: number;
    diskUsageBytes: number;
    cpuUsagePercent: number;

    // Health metrics
    uptime: number;              // seconds
    lastHealthCheck: Date;
    errorRate: number;           // 0-1
}

/**
 * Universal Storage Engine - core engine supporting all paradigms
 */
export class UniversalStorageEngine extends EventEmitter {
    private config: StorageEngineConfig;
    private initialized = false;
    private stats: StorageStats;

    // Storage layers
    private memoryCache: Map<string, UniversalRecord>;
    private persistentStorage: PersistentStorageLayer;
    private indexManager: IndexManager;
    private compressionEngine: CompressionEngine;

    // Performance monitoring
    private performanceTracker: PerformanceTracker;
    private lastFlushTime: number;

    constructor(config: StorageEngineConfig) {
        super();
        this.config = config;
        this.lastFlushTime = Date.now();

        // Initialize components
        this.memoryCache = new Map();
        this.persistentStorage = new PersistentStorageLayer(config);
        this.indexManager = new IndexManager(config);
        this.compressionEngine = new CompressionEngine(config.compressionAlgorithm);
        this.performanceTracker = new PerformanceTracker();

        // Initialize stats
        this.stats = this.createInitialStats();

        // Set up periodic maintenance
        this.setupMaintenanceTasks();
    }

    /**
     * Initialize the storage engine
     */
    async initialize(): Promise<void> {
        if (this.initialized) return;

        const startTime = Date.now();

        try {
            console.log('🚀 Initializing Universal Storage Engine...');

            // Initialize storage layers
            await this.persistentStorage.initialize();
            await this.indexManager.initialize();
            await this.compressionEngine.initialize();

            // Load existing data into memory cache (selective loading)
            await this.loadHotData();

            // Verify integrity
            await this.verifyStorageIntegrity();

            this.initialized = true;
            const initTime = Date.now() - startTime;

            console.log(`✅ Universal Storage Engine initialized in ${initTime}ms`);
            this.emit('initialized', { initTime });

        } catch (error) {
            console.error('❌ Failed to initialize Universal Storage Engine:', error);
            throw new Error(`Storage engine initialization failed: ${error}`);
        }
    }

    /**
     * Store a universal record
     */
    async store(record: UniversalRecord, context?: QueryContext): Promise<string> {
        await this.ensureInitialized();
        const startTime = Date.now();

        try {
            // Validate record
            const validation = UniversalRecordUtils.validate(record);
            if (!validation.valid) {
                throw new Error(`Invalid record: ${validation.errors.join(', ')}`);
            }

            // Update metadata
            record.metadata.updatedAt = new Date();
            record.version += 1;

            // Determine optimal storage strategy
            const storageStrategy = await this.determineStorageStrategy(record, context);

            // Apply compression if enabled
            const processedRecord = await this.compressionEngine.compress(record, storageStrategy);

            // Store in memory cache
            this.memoryCache.set(record.id.id, processedRecord);

            // Update indexes
            await this.indexManager.updateIndexes(processedRecord, 'insert');

            // Persist to storage (async for performance)
            this.persistentStorage.store(processedRecord, storageStrategy).catch(error => {
                console.error('Persistent storage error:', error);
                this.emit('storageError', { recordId: record.id.id, error });
            });

            // Update statistics
            this.updateStatsAfterWrite(record, Date.now() - startTime);

            // Emit event
            this.emit('recordStored', { recordId: record.id.id, paradigm: record.data.type });

            return record.id.id;

        } catch (error) {
            this.performanceTracker.recordError('store', Date.now() - startTime);
            throw new Error(`Failed to store record: ${error}`);
        }
    }

    /**
     * Retrieve a record by ID
     */
    async get(recordId: string, context?: QueryContext): Promise<UniversalRecord | null> {
        await this.ensureInitialized();
        const startTime = Date.now();

        try {
            // Check memory cache first
            let record = this.memoryCache.get(recordId);
            let cacheHit = !!record;

            if (!record) {
                // Load from persistent storage
                record = await this.persistentStorage.get(recordId) || undefined;

                if (record) {
                    // Decompress if needed
                    record = await this.compressionEngine.decompress(record);

                    // Add to cache (with eviction policy)
                    this.addToCache(record);
                }
            }

            if (record) {
                // Update access metadata
                record.metadata.accessCount++;
                record.metadata.lastAccessed = new Date();

                // Apply security filtering if needed
                record = await this.applySecurityFiltering(record, context);
            }

            // Update statistics
            this.updateStatsAfterRead(cacheHit, Date.now() - startTime);

            return record || null;

        } catch (error) {
            this.performanceTracker.recordError('get', Date.now() - startTime);
            throw new Error(`Failed to get record ${recordId}: ${error}`);
        }
    }

    /**
     * Query records using multi-paradigm query
     */
    async query(
        query: UniversalQuery,
        context?: QueryContext
    ): Promise<QueryResult> {
        await this.ensureInitialized();
        const startTime = Date.now();

        try {
            // Parse and optimize query
            const optimizedQuery = await this.optimizeQuery(query, context);

            // Determine execution strategy
            const executionPlan = await this.createExecutionPlan(optimizedQuery, context);

            // Execute query using appropriate indexes
            const rawResults = await this.executeQuery(executionPlan, context);

            // Apply post-processing (filtering, sorting, aggregation)
            const processedResults = await this.postProcessResults(rawResults, optimizedQuery, context);

            // Prepare final result
            const result: QueryResult = {
                data: processedResults,
                metadata: {
                    executionTime: Date.now() - startTime,
                    recordsScanned: executionPlan.recordsScanned,
                    recordsReturned: processedResults.length,
                    indexesUsed: executionPlan.indexesUsed,
                    queryPlan: this.config.nodeId ? executionPlan : undefined,
                    cacheHit: executionPlan.cacheUtilized
                }
            };

            // Update statistics
            this.updateStatsAfterQuery(result);

            return result;

        } catch (error) {
            this.performanceTracker.recordError('query', Date.now() - startTime);
            throw new Error(`Query execution failed: ${error}`);
        }
    }

    /**
     * Update a record
     */
    async update(
        recordId: string,
        updates: Partial<UniversalRecord>,
        context?: QueryContext
    ): Promise<boolean> {
        await this.ensureInitialized();
        const startTime = Date.now();

        try {
            // Get existing record
            const existingRecord = await this.get(recordId, context);
            if (!existingRecord) {
                return false;
            }

            // Apply updates
            const updatedRecord: UniversalRecord = {
                ...existingRecord,
                ...updates,
                id: { ...existingRecord.id, updatedAt: new Date() },
                version: existingRecord.version + 1,
                metadata: {
                    ...existingRecord.metadata,
                    ...updates.metadata,
                    updatedAt: new Date(),
                    updatedBy: context?.user || 'system'
                }
            };

            // Validate updated record
            const validation = UniversalRecordUtils.validate(updatedRecord);
            if (!validation.valid) {
                throw new Error(`Invalid update: ${validation.errors.join(', ')}`);
            }

            // Update in cache and storage
            await this.store(updatedRecord, context);

            // Update indexes
            await this.indexManager.updateIndexes(updatedRecord, 'update', existingRecord);

            this.emit('recordUpdated', { recordId, version: updatedRecord.version });

            return true;

        } catch (error) {
            this.performanceTracker.recordError('update', Date.now() - startTime);
            throw new Error(`Failed to update record ${recordId}: ${error}`);
        }
    }

    /**
     * Delete a record
     */
    async delete(recordId: string, context?: QueryContext): Promise<boolean> {
        await this.ensureInitialized();
        const startTime = Date.now();

        try {
            // Get record to validate existence and permissions
            const record = await this.get(recordId, context);
            if (!record) {
                return false;
            }

            // Check delete permissions
            if (!await this.hasDeletePermission(record, context)) {
                throw new Error('Insufficient permissions to delete record');
            }

            // Remove from cache
            this.memoryCache.delete(recordId);

            // Remove from indexes
            await this.indexManager.updateIndexes(record, 'delete');

            // Remove from persistent storage
            await this.persistentStorage.delete(recordId);

            // Update statistics
            this.updateStatsAfterDelete(record);

            this.emit('recordDeleted', { recordId, paradigm: record.data.type });

            return true;

        } catch (error) {
            this.performanceTracker.recordError('delete', Date.now() - startTime);
            throw new Error(`Failed to delete record ${recordId}: ${error}`);
        }
    }

    /**
     * Get storage statistics
     */
    async getStats(): Promise<StorageStats> {
        await this.ensureInitialized();

        // Update real-time stats
        this.stats.memoryUsageBytes = this.calculateMemoryUsage();
        this.stats.cacheHitRate = this.performanceTracker.getCacheHitRate();
        this.stats.averageReadLatency = this.performanceTracker.getAverageLatency('read');
        this.stats.averageWriteLatency = this.performanceTracker.getAverageLatency('write');
        this.stats.errorRate = this.performanceTracker.getErrorRate();
        this.stats.uptime = (Date.now() - this.performanceTracker.startTime) / 1000;
        this.stats.lastHealthCheck = new Date();

        return { ...this.stats };
    }

    /**
     * Optimize storage performance
     */
    async optimize(): Promise<void> {
        await this.ensureInitialized();

        console.log('🔧 Starting storage optimization...');

        try {
            // Optimize indexes
            await this.indexManager.optimize();

            // Compact storage
            await this.persistentStorage.compact();

            // Optimize memory cache
            await this.optimizeMemoryCache();

            // Update statistics
            await this.recalculateStats();

            console.log('✅ Storage optimization completed');
            this.emit('optimizationCompleted');

        } catch (error) {
            console.error('❌ Storage optimization failed:', error);
            this.emit('optimizationFailed', error);
        }
    }

    /**
     * Shutdown the storage engine gracefully
     */
    async shutdown(): Promise<void> {
        if (!this.initialized) return;

        console.log('🛑 Shutting down Universal Storage Engine...');

        try {
            // Flush pending writes
            await this.flush();

            // Shutdown components
            await this.persistentStorage.shutdown();
            await this.indexManager.shutdown();
            await this.compressionEngine.shutdown();

            // Clear cache
            this.memoryCache.clear();

            this.initialized = false;
            console.log('✅ Universal Storage Engine shut down gracefully');

        } catch (error) {
            console.error('❌ Error during shutdown:', error);
            throw error;
        }
    }

    // Private helper methods

    private async ensureInitialized(): Promise<void> {
        if (!this.initialized) {
            await this.initialize();
        }
    }

    private createInitialStats(): StorageStats {
        return {
            totalRecords: 0,
            relationalRecords: 0,
            documentRecords: 0,
            graphNodes: 0,
            graphEdges: 0,
            vectorRecords: 0,
            timeSeriesRecords: 0,
            keyValueRecords: 0,
            totalSizeBytes: 0,
            compressedSizeBytes: 0,
            compressionRatio: 1.0,
            averageReadLatency: 0,
            averageWriteLatency: 0,
            cacheHitRate: 0,
            indexEfficiency: 1.0,
            memoryUsageBytes: 0,
            diskUsageBytes: 0,
            cpuUsagePercent: 0,
            uptime: 0,
            lastHealthCheck: new Date(),
            errorRate: 0
        };
    }

    private setupMaintenanceTasks(): void {
        // Periodic flush
        setInterval(async () => {
            try {
                await this.flush();
            } catch (error) {
                console.error('Periodic flush failed:', error);
            }
        }, this.config.flushInterval * 1000);

        // Stats recalculation
        setInterval(async () => {
            try {
                await this.recalculateStats();
            } catch (error) {
                console.error('Stats recalculation failed:', error);
            }
        }, 60000); // Every minute

        // Cache cleanup
        setInterval(() => {
            this.cleanupCache();
        }, 300000); // Every 5 minutes
    }

    private async loadHotData(): Promise<void> {
        // Implementation for loading frequently accessed data into cache
        console.log('🔥 Loading hot data into memory cache...');
        // This would be implemented based on access patterns and metadata
    }

    private async verifyStorageIntegrity(): Promise<void> {
        // Implementation for storage integrity verification
        console.log('🔍 Verifying storage integrity...');
        // This would check for corrupted data, missing indexes, etc.
    }

    private async determineStorageStrategy(
        _record: UniversalRecord,
        _context?: QueryContext
    ): Promise<StorageStrategy> {
        // Determine optimal storage strategy based on data type and access patterns
        return {
            layout: this.config.defaultLayout,
            compression: this.config.compressionEnabled,
            indexHints: []
            // partitioning is optional, so omit it if not needed
        };
    }

    private updateStatsAfterWrite(record: UniversalRecord, latency: number): void {
        this.stats.totalRecords++;
        this.stats.averageWriteLatency =
            (this.stats.averageWriteLatency + latency) / 2;

        // Update paradigm-specific counts
        switch (record.data.type) {
            case 'relational':
                this.stats.relationalRecords++;
                break;
            case 'document':
                this.stats.documentRecords++;
                break;
            case 'vector':
                this.stats.vectorRecords++;
                break;
            case 'timeseries':
                this.stats.timeSeriesRecords++;
                break;
            case 'keyvalue':
                this.stats.keyValueRecords++;
                break;
            case 'graph':
                if (record.data.nodeType) {
                    this.stats.graphNodes++;
                } else {
                    this.stats.graphEdges++;
                }
                break;
        }
    }

    private updateStatsAfterRead(cacheHit: boolean, latency: number): void {
        this.stats.averageReadLatency =
            (this.stats.averageReadLatency + latency) / 2;

        if (cacheHit) {
            this.performanceTracker.recordCacheHit();
        } else {
            this.performanceTracker.recordCacheMiss();
        }
    }

    private updateStatsAfterQuery(result: QueryResult): void {
        // Update query-related statistics
        this.performanceTracker.recordQuery(result.metadata.executionTime);
    }

    private updateStatsAfterDelete(record: UniversalRecord): void {
        this.stats.totalRecords--;

        // Update paradigm-specific counts
        switch (record.data.type) {
            case 'relational':
                this.stats.relationalRecords--;
                break;
            case 'document':
                this.stats.documentRecords--;
                break;
            case 'vector':
                this.stats.vectorRecords--;
                break;
            case 'timeseries':
                this.stats.timeSeriesRecords--;
                break;
            case 'keyvalue':
                this.stats.keyValueRecords--;
                break;
            case 'graph':
                if (record.data.nodeType) {
                    this.stats.graphNodes--;
                } else {
                    this.stats.graphEdges--;
                }
                break;
        }
    }

    private calculateMemoryUsage(): number {
        // Calculate actual memory usage
        let totalSize = 0;
        for (const record of this.memoryCache.values()) {
            totalSize += this.estimateRecordSize(record);
        }
        return totalSize;
    }

    private estimateRecordSize(record: UniversalRecord): number {
        // Rough estimation of record size in bytes
        return JSON.stringify(record).length * 2; // UTF-16 approximation
    }

    private addToCache(record: UniversalRecord): void {
        // Add to cache with eviction policy
        if (this.memoryCache.size >= this.config.cacheSize) {
            this.evictLeastRecentlyUsed();
        }
        this.memoryCache.set(record.id.id, record);
    }

    private evictLeastRecentlyUsed(): void {
        let oldestTime = Date.now();
        let oldestKey = '';

        for (const [key, record] of this.memoryCache.entries()) {
            const accessTime = record.metadata.lastAccessed.getTime();
            if (accessTime < oldestTime) {
                oldestTime = accessTime;
                oldestKey = key;
            }
        }

        if (oldestKey) {
            this.memoryCache.delete(oldestKey);
        }
    }

    private async optimizeMemoryCache(): Promise<void> {
        // Optimize memory cache by removing cold data
        const now = Date.now();
        const evictionThreshold = 3600000; // 1 hour

        for (const [key, record] of this.memoryCache.entries()) {
            const lastAccess = record.metadata.lastAccessed.getTime();
            if (now - lastAccess > evictionThreshold) {
                this.memoryCache.delete(key);
            }
        }
    }

    private cleanupCache(): void {
        // Regular cache cleanup
        this.optimizeMemoryCache().catch(error => {
            console.error('Cache cleanup failed:', error);
        });
    }

    private async flush(): Promise<void> {
        // Flush pending writes to persistent storage
        console.log('💾 Flushing pending writes...');
        await this.persistentStorage.flush();
        this.lastFlushTime = Date.now();
    }

    private async applySecurityFiltering(record: UniversalRecord, context?: QueryContext): Promise<UniversalRecord> {
        // Apply security filtering based on context
        if (!context?.user) {
            return record;
        }
        
        // Simple security filtering - can be enhanced based on requirements
        return record;
    }

    private async optimizeQuery(query: any, _context?: QueryContext): Promise<any> {
        // Optimize query for better performance
        // This is a placeholder - implement actual query optimization logic
        return query;
    }

    private async createExecutionPlan(query: any, _context?: QueryContext): Promise<any> {
        // Create execution plan for the query
        // This is a placeholder - implement actual execution plan logic
        return { query, strategy: 'sequential' };
    }

    private async executeQuery(_executionPlan: any, _context?: QueryContext): Promise<any[]> {
        // Execute the query based on the execution plan
        // This is a placeholder - implement actual query execution logic
        return [];
    }

    private async postProcessResults(results: any[], _query: any, _context?: QueryContext): Promise<any[]> {
        // Post-process results (sorting, filtering, aggregation)
        // This is a placeholder - implement actual post-processing logic
        return results;
    }

    private async hasDeletePermission(_record: UniversalRecord, _context?: QueryContext): Promise<boolean> {
        // Check if user has permission to delete this record
        // Simple permission check - can be enhanced based on requirements
        return true;
    }

    /**
     * Get time since last flush in milliseconds
     */
    getTimeSinceLastFlush(): number {
        return Date.now() - this.lastFlushTime;
    }

    private async recalculateStats(): Promise<void> {
        // Recalculate comprehensive statistics
        const newStats = await this.persistentStorage.calculateStats();
        this.stats = { ...this.stats, ...newStats };
    }
}

// Supporting interfaces and classes

interface StorageStrategy {
    layout: 'row' | 'column' | 'hybrid';
    compression: boolean;
    indexHints: string[];
    partitioning?: {
        strategy: 'hash' | 'range' | 'list';
        key: string;
        partitions: number;
    };
}

interface UniversalQuery {
    paradigm: 'sql' | 'document' | 'graph' | 'vector' | 'timeseries' | 'keyvalue' | 'hybrid';
    query: string | object;
    parameters?: Record<string, any>;
    limit?: number;
    offset?: number;
    orderBy?: Array<{ field: string; direction: 'asc' | 'desc' }>;
    filters?: Array<{
        field: string;
        operator: string;
        value: any;
    }>;
}

export interface ExecutionPlan {
    strategy: string;
    indexesUsed: string[];
    recordsScanned: number;
    cacheUtilized: boolean;
    estimatedCost: number;
}

// Placeholder classes - these would be fully implemented in separate files
class PersistentStorageLayer {
    constructor(_config: StorageEngineConfig) { }
    async initialize(): Promise<void> { /* Implementation */ }
    async store(_record: UniversalRecord, _strategy: StorageStrategy): Promise<void> { /* Implementation */ }
    async get(_recordId: string): Promise<UniversalRecord | null> { return null; }
    async delete(_recordId: string): Promise<void> { /* Implementation */ }
    async flush(): Promise<void> { /* Implementation */ }
    async compact(): Promise<void> { /* Implementation */ }
    async shutdown(): Promise<void> { /* Implementation */ }
    async calculateStats(): Promise<Partial<StorageStats>> { return {}; }
}

class IndexManager {
    constructor(_config: StorageEngineConfig) { }
    async initialize(): Promise<void> { /* Implementation */ }
    async updateIndexes(_record: UniversalRecord, _operation: 'insert' | 'update' | 'delete', _oldRecord?: UniversalRecord): Promise<void> { /* Implementation */ }
    async optimize(): Promise<void> { /* Implementation */ }
    async shutdown(): Promise<void> { /* Implementation */ }
}

class CompressionEngine {
    constructor(_algorithm: string) { }
    async initialize(): Promise<void> { /* Implementation */ }
    async compress(record: UniversalRecord, _strategy: StorageStrategy): Promise<UniversalRecord> { return record; }
    async decompress(record: UniversalRecord): Promise<UniversalRecord> { return record; }
    async shutdown(): Promise<void> { /* Implementation */ }
}

class PerformanceTracker {
    startTime = Date.now();
    private cacheHits = 0;
    private cacheMisses = 0;
    private errors = new Map<string, number>();
    private latencies = new Map<string, number[]>();

    recordCacheHit(): void { this.cacheHits++; }
    recordCacheMiss(): void { this.cacheMisses++; }

    recordError(operation: string, _latency: number): void {
        this.errors.set(operation, (this.errors.get(operation) || 0) + 1);
    }

    recordQuery(latency: number): void {
        const queries = this.latencies.get('query') || [];
        queries.push(latency);
        this.latencies.set('query', queries);
    }

    getCacheHitRate(): number {
        const total = this.cacheHits + this.cacheMisses;
        return total > 0 ? this.cacheHits / total : 0;
    }

    getAverageLatency(operation: string): number {
        const latencies = this.latencies.get(operation) || [];
        return latencies.length > 0 ?
            latencies.reduce((sum, lat) => sum + lat, 0) / latencies.length : 0;
    }

    getErrorRate(): number {
        const totalErrors = Array.from(this.errors.values()).reduce((sum, count) => sum + count, 0);
        const totalOperations = this.cacheHits + this.cacheMisses + totalErrors;
        return totalOperations > 0 ? totalErrors / totalOperations : 0;
    }
}
