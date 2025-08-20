/*!
 * CBD MCP Server Types
 * Type definitions for CBD Model Context Protocol server
 */

export interface VectorRecord {
    id: string;
    vector: number[];
    metadata?: Record<string, any>;
    timestamp?: number;
    collection?: string;
}

export interface SearchResult {
    id: string;
    score: number;
    vector?: number[];
    metadata?: Record<string, any>;
    collection?: string;
}

export interface CollectionInfo {
    name: string;
    dimension: number;
    count: number;
    indexType: string;
    metric: string;
    created: number;
    updated: number;
    metadata?: Record<string, any>;
}

export interface ServerStats {
    uptime: number;
    version: string;
    collections: number;
    totalVectors: number;
    memoryUsage: {
        used: number;
        total: number;
        percentage: number;
    };
    performance: {
        avgSearchTime: number;
        avgInsertTime: number;
        operationsPerSecond: number;
    };
    indexStats?: {
        [collection: string]: {
            size: number;
            depth: number;
            connections: number;
        };
    };
}

export interface HealthStatus {
    status: 'healthy' | 'degraded' | 'unhealthy';
    version: string;
    uptime: number;
    database: {
        connected: boolean;
        collections: number;
        vectors: number;
    };
    memory: {
        usage: number;
        limit: number;
        available: boolean;
    };
    checks: {
        [check: string]: {
            status: 'pass' | 'fail' | 'warn';
            message?: string;
            timestamp: number;
        };
    };
}

export interface BatchOperation {
    operation: 'insert' | 'update' | 'delete';
    records: VectorRecord[];
    options?: {
        collection?: string;
        upsert?: boolean;
        validate?: boolean;
    };
}

export interface BatchResult {
    success: number;
    failed: number;
    errors: string[];
    duration: number;
    operations: {
        operation: string;
        status: 'success' | 'failed';
        error?: string;
    }[];
}

export interface SimilarityAnalysis {
    clusterId: string;
    vectors: string[];
    centroid: number[];
    avgSimilarity: number;
    maxSimilarity: number;
    minSimilarity: number;
    metadata?: Record<string, any>;
}

export interface OptimizationResult {
    collection: string;
    before: {
        size: number;
        depth: number;
        searchTime: number;
    };
    after: {
        size: number;
        depth: number;
        searchTime: number;
    };
    improvement: {
        spaceReduction: number;
        speedImprovement: number;
    };
    duration: number;
}

export interface MemoryUsage {
    process: {
        heapUsed: number;
        heapTotal: number;
        external: number;
        rss: number;
    };
    database: {
        vectors: number;
        indexes: number;
        cache: number;
        total: number;
    };
    system: {
        free: number;
        total: number;
        available: number;
    };
    gc: {
        runs: number;
        totalDuration: number;
        avgDuration: number;
        lastRun: number;
    };
}

export interface CBDMCPError extends Error {
    code: string;
    details?: any;
    timestamp: number;
}

// Tool-specific types
export interface VectorStoreArgs {
    vector: number[];
    metadata?: Record<string, any>;
    id?: string;
    collection?: string;
}

export interface VectorSearchArgs {
    vector: number[];
    limit?: number;
    threshold?: number;
    collection?: string;
    includeVectors?: boolean;
    filter?: Record<string, any>;
}

export interface VectorDeleteArgs {
    id?: string;
    filter?: Record<string, any>;
    collection?: string;
}

export interface VectorUpdateArgs {
    id: string;
    vector?: number[];
    metadata?: Record<string, any>;
    collection?: string;
}

export interface CreateCollectionArgs {
    name: string;
    dimension: number;
    indexType?: string;
    metric?: string;
    metadata?: Record<string, any>;
}

export interface CollectionInfoArgs {
    name: string;
    includeStats?: boolean;
}

export interface BatchOperationArgs {
    operations: BatchOperation[];
    options?: {
        transactional?: boolean;
        continueOnError?: boolean;
        validate?: boolean;
    };
}

export interface SimilarityAnalysisArgs {
    collection?: string;
    algorithm?: 'kmeans' | 'hierarchical' | 'dbscan';
    clusters?: number;
    threshold?: number;
    includeVectors?: boolean;
}
