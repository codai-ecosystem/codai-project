/**
 * CBD Universal Data Model
 * Foundation for multi-paradigm database support
 * 
 * Phase 1: Core unified data model supporting all database paradigms
 */

import { z } from 'zod';

/**
 * Universal Record ID that supports all paradigm identification needs
 */
export interface UniversalRecordId {
    // Core identification
    id: string;

    // Paradigm-specific identifiers
    sqlTable?: string;      // For relational data
    docCollection?: string; // For document data
    graphType?: 'node' | 'edge'; // For graph data
    vectorDimensions?: number;   // For vector data
    timeSeriesMetric?: string;   // For time-series data
    keyValueNamespace?: string;  // For key-value data

    // Versioning and metadata
    version: number;
    createdAt: Date;
    updatedAt: Date;
}

/**
 * Data containers for different paradigms
 */
export type DataContainer =
    | RelationalData
    | DocumentData
    | GraphData
    | VectorData
    | TimeSeriesData
    | KeyValueData;

/**
 * Relational (SQL) data container
 */
export interface RelationalData {
    type: 'relational';
    schema: string;
    table: string;
    columns: Record<string, any>;
    constraints?: {
        primaryKey?: string[];
        foreignKeys?: Array<{
            column: string;
            references: { table: string; column: string; };
        }>;
        unique?: string[][];
        checks?: Array<{ name: string; expression: string; }>;
    };
}

/**
 * Document (NoSQL document) data container
 */
export interface DocumentData {
    type: 'document';
    collection: string;
    document: Record<string, any>;
    schema?: any; // JSON Schema for validation
    indexes?: Array<{
        fields: Record<string, 1 | -1>;
        options?: {
            unique?: boolean;
            sparse?: boolean;
            ttl?: number;
        };
    }>;
}

/**
 * Graph data container (nodes and edges)
 */
export interface GraphData {
    type: 'graph';
    nodeType?: string;
    edgeType?: string;
    properties: Record<string, any>;

    // For nodes
    labels?: string[];

    // For edges
    sourceNodeId?: string;
    targetNodeId?: string;
    directed?: boolean;
    weight?: number;
}

/**
 * Vector data container
 */
export interface VectorData {
    type: 'vector';
    dimensions: number;
    vector: Float32Array | number[];
    metadata?: Record<string, any>;
    embedding?: {
        model: string;
        sourceText?: string;
        sourceImage?: string;
        sourceAudio?: string;
    };
    indexType?: 'hnsw' | 'ivf' | 'lsh' | 'brute_force';
}

/**
 * Time-series data container
 */
export interface TimeSeriesData {
    type: 'timeseries';
    metric: string;
    timestamp: Date;
    value: number | string | boolean | Record<string, any>;
    tags?: Record<string, string>;
    fields?: Record<string, number | string | boolean>;
    retention?: {
        duration: string; // e.g., '30d', '1y'
        aggregation?: 'mean' | 'sum' | 'min' | 'max' | 'count';
    };
}

/**
 * Key-Value data container  
 */
export interface KeyValueData {
    type: 'keyvalue';
    namespace?: string;
    key: string;
    value: any;
    ttl?: number; // Time to live in seconds
    dataType?: 'string' | 'number' | 'boolean' | 'json' | 'binary';
    compression?: 'gzip' | 'lz4' | 'zstd';
}

/**
 * Universal Record - the core data structure
 */
export interface UniversalRecord {
    id: UniversalRecordId;
    data: DataContainer;
    indexes: IndexMap;
    metadata: RecordMetadata;
    version: number;

    // Storage layout optimization hints
    storageHints?: {
        preferredLayout?: 'row' | 'column' | 'hybrid';
        compressionType?: 'none' | 'snappy' | 'lz4' | 'zstd';
        accessPattern?: 'sequential' | 'random' | 'append_only';
        hotness?: 'hot' | 'warm' | 'cold' | 'archive';
    };
}

/**
 * Index definitions for multi-paradigm support
 */
export interface IndexMap {
    // Traditional indexes
    btree?: Array<{
        name: string;
        columns: string[];
        unique?: boolean;
    }>;

    // Hash indexes for exact lookups
    hash?: Array<{
        name: string;
        columns: string[];
    }>;

    // Full-text search indexes
    fulltext?: Array<{
        name: string;
        columns: string[];
        language?: string;
    }>;

    // Geospatial indexes
    geospatial?: Array<{
        name: string;
        column: string;
        type: '2d' | '2dsphere' | 'geoHaystack';
    }>;

    // Vector indexes
    vector?: Array<{
        name: string;
        column: string;
        indexType: 'hnsw' | 'ivf' | 'lsh';
        parameters?: Record<string, any>;
    }>;

    // Graph indexes
    graph?: Array<{
        name: string;
        type: 'adjacency' | 'path' | 'centrality';
        direction?: 'in' | 'out' | 'both';
    }>;

    // Time-series indexes
    timeseries?: Array<{
        name: string;
        timeColumn: string;
        valueColumns: string[];
        granularity?: 'second' | 'minute' | 'hour' | 'day';
    }>;
}

/**
 * Record metadata
 */
export interface RecordMetadata {
    // Core metadata
    createdBy: string;
    createdAt: Date;
    updatedBy: string;
    updatedAt: Date;

    // Access patterns and performance hints
    accessCount: number;
    lastAccessed: Date;

    // Data lineage
    source?: string;
    transformations?: Array<{
        type: string;
        timestamp: Date;
        parameters?: Record<string, any>;
    }>;

    // Security and compliance
    classification?: 'public' | 'internal' | 'confidential' | 'restricted';
    encryptionKey?: string;
    auditTrail?: Array<{
        action: string;
        user: string;
        timestamp: Date;
        details?: Record<string, any>;
    }>;

    // Multi-tenant support
    tenantId?: string;
    permissions?: Array<{
        principal: string;
        actions: string[];
    }>;

    // Data quality metrics
    quality?: {
        completeness: number; // 0-1
        accuracy: number;     // 0-1
        consistency: number;  // 0-1
        freshness: Date;
    };
}

/**
 * Schema validation using Zod for runtime type safety
 */
export const UniversalRecordSchema = z.object({
    id: z.object({
        id: z.string(),
        version: z.number(),
        createdAt: z.date(),
        updatedAt: z.date(),
        sqlTable: z.string().optional(),
        docCollection: z.string().optional(),
        graphType: z.enum(['node', 'edge']).optional(),
        vectorDimensions: z.number().optional(),
        timeSeriesMetric: z.string().optional(),
        keyValueNamespace: z.string().optional(),
    }),
    data: z.union([
        z.object({ type: z.literal('relational'), schema: z.string(), table: z.string(), columns: z.record(z.any()) }),
        z.object({ type: z.literal('document'), collection: z.string(), document: z.record(z.any()) }),
        z.object({ type: z.literal('graph'), properties: z.record(z.any()) }),
        z.object({ type: z.literal('vector'), dimensions: z.number(), vector: z.array(z.number()) }),
        z.object({ type: z.literal('timeseries'), metric: z.string(), timestamp: z.date(), value: z.any() }),
        z.object({ type: z.literal('keyvalue'), key: z.string(), value: z.any() }),
    ]),
    indexes: z.record(z.any()),
    metadata: z.object({
        createdBy: z.string(),
        createdAt: z.date(),
        updatedBy: z.string(),
        updatedAt: z.date(),
        accessCount: z.number(),
        lastAccessed: z.date(),
    }),
    version: z.number(),
});

/**
 * Query context for multi-paradigm queries
 */
export interface QueryContext {
    paradigm: 'sql' | 'document' | 'graph' | 'vector' | 'timeseries' | 'keyvalue' | 'hybrid';

    // Performance hints
    optimizationLevel?: 'fast' | 'balanced' | 'thorough';
    cacheStrategy?: 'none' | 'memory' | 'disk' | 'distributed';
    consistencyLevel?: 'eventual' | 'session' | 'strong';

    // Security context
    user?: string;
    roles?: string[];
    tenantId?: string;

    // Execution preferences
    timeout?: number;
    maxResultSize?: number;
    explain?: boolean;
}

/**
 * Universal query result
 */
export interface QueryResult<T = any> {
    data: T[];
    metadata: {
        executionTime: number;
        recordsScanned: number;
        recordsReturned: number;
        indexesUsed: string[];
        queryPlan?: any;
        cacheHit?: boolean;
    };
    pagination?: {
        hasMore: boolean;
        nextCursor?: string;
        totalCount?: number;
    };
}

/**
 * Factory functions for creating data containers
 */
export class DataContainerFactory {
    static createRelational(schema: string, table: string, columns: Record<string, any>): RelationalData {
        return {
            type: 'relational',
            schema,
            table,
            columns
        };
    }

    static createDocument(collection: string, document: Record<string, any>): DocumentData {
        return {
            type: 'document',
            collection,
            document
        };
    }

    static createVector(dimensions: number, vector: number[], metadata?: Record<string, any>): VectorData {
        const result: VectorData = {
            type: 'vector',
            dimensions,
            vector: new Float32Array(vector)
        };
        if (metadata !== undefined) {
            result.metadata = metadata;
        }
        return result;
    }

    static createTimeSeries(metric: string, value: any, tags?: Record<string, string>): TimeSeriesData {
        const result: TimeSeriesData = {
            type: 'timeseries',
            metric,
            timestamp: new Date(),
            value
        };
        if (tags !== undefined) {
            result.tags = tags;
        }
        return result;
    }

    static createKeyValue(key: string, value: any, namespace?: string): KeyValueData {
        const result: KeyValueData = {
            type: 'keyvalue',
            key,
            value
        };
        if (namespace !== undefined) {
            result.namespace = namespace;
        }
        return result;
    }

    static createGraphNode(labels: string[], properties: Record<string, any>): GraphData {
        return {
            type: 'graph',
            labels,
            properties
        };
    }

    static createGraphEdge(
        sourceNodeId: string,
        targetNodeId: string,
        edgeType: string,
        properties: Record<string, any> = {}
    ): GraphData {
        return {
            type: 'graph',
            edgeType,
            sourceNodeId,
            targetNodeId,
            properties,
            directed: true
        };
    }
}

/**
 * Universal record utilities
 */
export class UniversalRecordUtils {
    /**
     * Generate a new universal record ID
     */
    static generateId(paradigm: string, identifier: string): UniversalRecordId {
        const now = new Date();
        const baseId: UniversalRecordId = {
            id: `${paradigm}_${identifier}_${now.getTime()}`,
            version: 1,
            createdAt: now,
            updatedAt: now
        };

        // Set paradigm-specific fields
        switch (paradigm) {
            case 'sql':
                baseId.sqlTable = identifier;
                break;
            case 'document':
                baseId.docCollection = identifier;
                break;
            case 'vector':
                baseId.vectorDimensions = parseInt(identifier) || 1536;
                break;
            case 'timeseries':
                baseId.timeSeriesMetric = identifier;
                break;
            case 'keyvalue':
                baseId.keyValueNamespace = identifier;
                break;
        }

        return baseId;
    }

    /**
     * Validate a universal record
     */
    static validate(record: UniversalRecord): { valid: boolean; errors: string[] } {
        try {
            UniversalRecordSchema.parse(record);
            return { valid: true, errors: [] };
        } catch (error: any) {
            return {
                valid: false,
                errors: error.errors?.map((e: any) => `${e.path.join('.')}: ${e.message}`) || [error.message]
            };
        }
    }

    /**
     * Create metadata with defaults
     */
    static createMetadata(createdBy: string, tenantId?: string): RecordMetadata {
        const now = new Date();
        const result: RecordMetadata = {
            createdBy,
            createdAt: now,
            updatedBy: createdBy,
            updatedAt: now,
            accessCount: 0,
            lastAccessed: now,
            classification: 'internal'
        };
        if (tenantId !== undefined) {
            result.tenantId = tenantId;
        }
        return result;
    }
}
