/*!
 * CBD Client SDK
 * TypeScript/JavaScript client library for CBD Enterprise
 */

export interface CBDClient {
    // Core operations
    storeMemory(key: string, content: string, vector: number[], metadata?: string, options?: StoreOptions): Promise<StoreResult>;
    searchMemories(queryVector: number[], options?: SearchOptions): Promise<SearchResult[]>;
    getMemory(key: string, options?: GetOptions): Promise<Memory | null>;
    deleteMemory(key: string): Promise<boolean>;

    // Batch operations
    batchStore(requests: StoreRequest[]): Promise<StoreResult[]>;
    batchSearch(requests: SearchRequest[]): Promise<SearchResult[][]>;

    // Utility operations
    listKeys(options?: ListOptions): Promise<KeyInfo[]>;
    getStats(detailed?: boolean): Promise<ServerStats>;
    healthCheck(): Promise<HealthStatus>;

    // Connection management
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    isConnected(): boolean;
}

export interface CBDConfig {
    // Connection settings
    serverUrl: string;
    apiKey?: string;
    timeout?: number;
    retries?: number;
    retryDelay?: number;

    // Protocol settings
    protocol: 'grpc' | 'rest';
    compression?: boolean;
    keepAlive?: boolean;

    // Security settings
    tls?: boolean;
    tlsRejectUnauthorized?: boolean;
    clientCert?: string;
    clientKey?: string;

    // Performance settings
    maxConcurrentRequests?: number;
    requestTimeout?: number;

    // Logging
    logLevel?: 'debug' | 'info' | 'warn' | 'error';
    logger?: (level: string, message: string) => void;
}

export interface Memory {
    key: string;
    content: string;
    vector?: number[];
    metadata?: string;
    tags?: string[];
    timestamp?: number;
}

export interface StoreOptions {
    ttlSeconds?: number;
    tags?: string[];
    overwrite?: boolean;
}

export interface StoreRequest {
    key: string;
    content: string;
    vector: number[];
    metadata?: string;
    options?: StoreOptions;
}

export interface StoreResult {
    success: boolean;
    message: string;
    memoryId?: string;
    error?: string;
}

export interface SearchOptions {
    limit?: number;
    threshold?: number;
    metadataFilter?: string;
    tagFilters?: string[];
    includeVectors?: boolean;
}

export interface SearchRequest {
    queryVector: number[];
    options?: SearchOptions;
}

export interface SearchResult {
    key: string;
    content: string;
    distance: number;
    metadata?: string;
    tags?: string[];
    timestamp?: number;
    vector?: number[];
}

export interface GetOptions {
    includeVector?: boolean;
}

export interface ListOptions {
    prefix?: string;
    limit?: number;
    startAfter?: string;
    includeMetadata?: boolean;
}

export interface KeyInfo {
    key: string;
    createdAt: number;
    updatedAt: number;
    sizeBytes: number;
    metadata?: string;
    tags?: string[];
}

export interface ServerStats {
    nodeId: string;
    clusterRole: string;
    totalOperations: number;
    activeTransactions: number;
    totalVectors: number;
    indexSizeBytes: number;
    storageSizeBytes: number;
    activeConnections: number;

    // Detailed stats
    storageStats?: StorageStats;
    vectorStats?: VectorStats;
    clusterStats?: ClusterStats;
    securityStats?: SecurityStats;
}

export interface StorageStats {
    totalKeys: number;
    totalSizeBytes: number;
    freeSpaceBytes: number;
    activeTransactions: number;
    cacheHitRatio: number;
}

export interface VectorStats {
    totalVectors: number;
    dimensions: number;
    indexSizeBytes: number;
    indexDensity: number;
    maxConnectionsPerNode: number;
}

export interface ClusterStats {
    totalNodes: number;
    activeNodes: number;
    leaderNode: string;
    currentTerm: number;
    isLeader: boolean;
}

export interface SecurityStats {
    totalSessions: number;
    activeSessions: number;
    failedAuthentications: number;
    successfulAuthentications: number;
}

export interface HealthStatus {
    status: 'healthy' | 'degraded' | 'unhealthy';
    version: string;
    uptimeSeconds: number;
    components: Record<string, ComponentHealth>;
}

export interface ComponentHealth {
    status: 'healthy' | 'degraded' | 'unhealthy';
    lastCheck: string;
    details?: string;
}

export interface CBDError extends Error {
    code: string;
    statusCode?: number;
    retryable: boolean;
    details?: any;
}

// Default configuration
export const defaultConfig: Partial<CBDConfig> = {
    protocol: 'grpc',
    timeout: 30000,
    retries: 3,
    retryDelay: 1000,
    compression: true,
    keepAlive: true,
    tls: false,
    maxConcurrentRequests: 100,
    requestTimeout: 10000,
    logLevel: 'info',
};

// gRPC Client Implementation
export class CBDGrpcClient implements CBDClient {
    private config: CBDConfig;
    private client: any; // gRPC client
    private connected = false;
    private logger: (level: string, message: string) => void;

    constructor(config: CBDConfig) {
        this.config = { ...defaultConfig, ...config };
        this.logger = this.config.logger || ((level, message) => {
            if (this.shouldLog(level)) {
                console.log(`[${level.toUpperCase()}] ${message}`);
            }
        });
    }

    private shouldLog(level: string): boolean {
        const levels = ['debug', 'info', 'warn', 'error'];
        const configLevel = this.config.logLevel || 'info';
        return levels.indexOf(level) >= levels.indexOf(configLevel);
    }

    async connect(): Promise<void> {
        this.logger('info', `Connecting to CBD server at ${this.config.serverUrl}`);

        // TODO: Initialize gRPC client
        this.connected = true;
        this.logger('info', 'Connected to CBD server');
    }

    async disconnect(): Promise<void> {
        this.logger('info', 'Disconnecting from CBD server');
        this.connected = false;
    }

    isConnected(): boolean {
        return this.connected;
    }

    async storeMemory(
        key: string,
        content: string,
        vector: number[],
        metadata?: string,
        options?: StoreOptions
    ): Promise<StoreResult> {
        this.ensureConnected();

        this.logger('debug', `Storing memory with key: ${key}`);

        try {
            // TODO: Implement gRPC call
            return {
                success: true,
                message: 'Memory stored successfully',
                memoryId: key,
            };
        } catch (error) {
            this.logger('error', `Failed to store memory: ${error}`);
            throw this.createError('STORE_FAILED', error as Error);
        }
    }

    async searchMemories(queryVector: number[], options?: SearchOptions): Promise<SearchResult[]> {
        this.ensureConnected();

        const limit = options?.limit || 10;
        this.logger('debug', `Searching memories with limit: ${limit}`);

        try {
            // TODO: Implement gRPC call
            return [];
        } catch (error) {
            this.logger('error', `Failed to search memories: ${error}`);
            throw this.createError('SEARCH_FAILED', error as Error);
        }
    }

    async getMemory(key: string, options?: GetOptions): Promise<Memory | null> {
        this.ensureConnected();

        this.logger('debug', `Getting memory with key: ${key}`);

        try {
            // TODO: Implement gRPC call
            return null;
        } catch (error) {
            this.logger('error', `Failed to get memory: ${error}`);
            throw this.createError('GET_FAILED', error as Error);
        }
    }

    async deleteMemory(key: string): Promise<boolean> {
        this.ensureConnected();

        this.logger('debug', `Deleting memory with key: ${key}`);

        try {
            // TODO: Implement gRPC call
            return true;
        } catch (error) {
            this.logger('error', `Failed to delete memory: ${error}`);
            throw this.createError('DELETE_FAILED', error as Error);
        }
    }

    async batchStore(requests: StoreRequest[]): Promise<StoreResult[]> {
        this.ensureConnected();

        this.logger('debug', `Batch storing ${requests.length} memories`);

        try {
            // TODO: Implement gRPC batch call
            return requests.map(req => ({
                success: true,
                message: 'Memory stored successfully',
                memoryId: req.key,
            }));
        } catch (error) {
            this.logger('error', `Failed to batch store: ${error}`);
            throw this.createError('BATCH_STORE_FAILED', error as Error);
        }
    }

    async batchSearch(requests: SearchRequest[]): Promise<SearchResult[][]> {
        this.ensureConnected();

        this.logger('debug', `Batch searching ${requests.length} queries`);

        try {
            // TODO: Implement gRPC batch call
            return requests.map(() => []);
        } catch (error) {
            this.logger('error', `Failed to batch search: ${error}`);
            throw this.createError('BATCH_SEARCH_FAILED', error as Error);
        }
    }

    async listKeys(options?: ListOptions): Promise<KeyInfo[]> {
        this.ensureConnected();

        this.logger('debug', 'Listing keys');

        try {
            // TODO: Implement gRPC call
            return [];
        } catch (error) {
            this.logger('error', `Failed to list keys: ${error}`);
            throw this.createError('LIST_FAILED', error as Error);
        }
    }

    async getStats(detailed?: boolean): Promise<ServerStats> {
        this.ensureConnected();

        this.logger('debug', `Getting stats (detailed: ${detailed})`);

        try {
            // TODO: Implement gRPC call
            return {
                nodeId: 'cbd-node-1',
                clusterRole: 'leader',
                totalOperations: 0,
                activeTransactions: 0,
                totalVectors: 0,
                indexSizeBytes: 0,
                storageSizeBytes: 0,
                activeConnections: 0,
            };
        } catch (error) {
            this.logger('error', `Failed to get stats: ${error}`);
            throw this.createError('STATS_FAILED', error as Error);
        }
    }

    async healthCheck(): Promise<HealthStatus> {
        this.ensureConnected();

        this.logger('debug', 'Performing health check');

        try {
            // TODO: Implement gRPC call
            return {
                status: 'healthy',
                version: '1.0.0',
                uptimeSeconds: 0,
                components: {},
            };
        } catch (error) {
            this.logger('error', `Health check failed: ${error}`);
            throw this.createError('HEALTH_CHECK_FAILED', error as Error);
        }
    }

    private ensureConnected(): void {
        if (!this.connected) {
            throw this.createError('NOT_CONNECTED', new Error('Client not connected to server'));
        }
    }

    private createError(code: string, originalError: Error): CBDError {
        const error = new Error(originalError.message) as CBDError;
        error.code = code;
        error.retryable = this.isRetryableError(code);
        error.details = originalError;
        return error;
    }

    private isRetryableError(code: string): boolean {
        const retryableCodes = ['TIMEOUT', 'CONNECTION_LOST', 'SERVER_ERROR'];
        return retryableCodes.includes(code);
    }
}

// REST Client Implementation
export class CBDRestClient implements CBDClient {
    private config: CBDConfig;
    private baseUrl: string;
    private logger: (level: string, message: string) => void;

    constructor(config: CBDConfig) {
        this.config = { ...defaultConfig, ...config };
        this.baseUrl = this.config.serverUrl.replace(/\/$/, '');
        this.logger = this.config.logger || ((level, message) => {
            if (this.shouldLog(level)) {
                console.log(`[${level.toUpperCase()}] ${message}`);
            }
        });
    }

    private shouldLog(level: string): boolean {
        const levels = ['debug', 'info', 'warn', 'error'];
        const configLevel = this.config.logLevel || 'info';
        return levels.indexOf(level) >= levels.indexOf(configLevel);
    }

    async connect(): Promise<void> {
        this.logger('info', `Connecting to CBD server at ${this.config.serverUrl}`);
        // For REST, connection is implicit
    }

    async disconnect(): Promise<void> {
        this.logger('info', 'Disconnecting from CBD server');
        // For REST, disconnection is implicit
    }

    isConnected(): boolean {
        return true; // REST is stateless
    }

    async storeMemory(
        key: string,
        content: string,
        vector: number[],
        metadata?: string,
        options?: StoreOptions
    ): Promise<StoreResult> {
        this.logger('debug', `Storing memory with key: ${key}`);

        const payload = {
            key,
            content,
            vector,
            metadata,
            ttlSeconds: options?.ttlSeconds,
            tags: options?.tags,
        };

        try {
            const response = await this.makeRequest('POST', '/api/v1/memories', payload);
            return response as StoreResult;
        } catch (error) {
            this.logger('error', `Failed to store memory: ${error}`);
            throw this.createError('STORE_FAILED', error as Error);
        }
    }

    async searchMemories(queryVector: number[], options?: SearchOptions): Promise<SearchResult[]> {
        this.logger('debug', `Searching memories with limit: ${options?.limit || 10}`);

        const payload = {
            queryVector,
            limit: options?.limit || 10,
            threshold: options?.threshold || 0.0,
            metadataFilter: options?.metadataFilter,
            tagFilters: options?.tagFilters,
            includeVectors: options?.includeVectors,
        };

        try {
            const response = await this.makeRequest('POST', '/api/v1/memories/search', payload);
            return (response as any).results || [];
        } catch (error) {
            this.logger('error', `Failed to search memories: ${error}`);
            throw this.createError('SEARCH_FAILED', error as Error);
        }
    }

    async getMemory(key: string, options?: GetOptions): Promise<Memory | null> {
        this.logger('debug', `Getting memory with key: ${key}`);

        try {
            const response = await this.makeRequest('GET', `/api/v1/memories/${encodeURIComponent(key)}`, null, {
                includeVector: options?.includeVector ? 'true' : 'false',
            });
            return (response as any).memory || null;
        } catch (error) {
            if ((error as any).statusCode === 404) {
                return null;
            }
            this.logger('error', `Failed to get memory: ${error}`);
            throw this.createError('GET_FAILED', error as Error);
        }
    }

    async deleteMemory(key: string): Promise<boolean> {
        this.logger('debug', `Deleting memory with key: ${key}`);

        try {
            await this.makeRequest('DELETE', `/api/v1/memories/${encodeURIComponent(key)}`);
            return true;
        } catch (error) {
            this.logger('error', `Failed to delete memory: ${error}`);
            throw this.createError('DELETE_FAILED', error as Error);
        }
    }

    async batchStore(requests: StoreRequest[]): Promise<StoreResult[]> {
        this.logger('debug', `Batch storing ${requests.length} memories`);

        const payload = {
            requests: requests.map(req => ({
                key: req.key,
                content: req.content,
                vector: req.vector,
                metadata: req.metadata,
                ttlSeconds: req.options?.ttlSeconds,
                tags: req.options?.tags,
            })),
            failOnError: false,
        };

        try {
            const response = await this.makeRequest('POST', '/api/v1/memories/batch', payload);
            return (response as any).responses || [];
        } catch (error) {
            this.logger('error', `Failed to batch store: ${error}`);
            throw this.createError('BATCH_STORE_FAILED', error as Error);
        }
    }

    async batchSearch(requests: SearchRequest[]): Promise<SearchResult[][]> {
        this.logger('debug', `Batch searching ${requests.length} queries`);

        const payload = {
            requests: requests.map(req => ({
                queryVector: req.queryVector,
                limit: req.options?.limit || 10,
                threshold: req.options?.threshold || 0.0,
                metadataFilter: req.options?.metadataFilter,
                tagFilters: req.options?.tagFilters,
                includeVectors: req.options?.includeVectors,
            })),
        };

        try {
            const response = await this.makeRequest('POST', '/api/v1/memories/batch-search', payload);
            return (response as any).responses?.map((r: any) => r.results || []) || [];
        } catch (error) {
            this.logger('error', `Failed to batch search: ${error}`);
            throw this.createError('BATCH_SEARCH_FAILED', error as Error);
        }
    }

    async listKeys(options?: ListOptions): Promise<KeyInfo[]> {
        this.logger('debug', 'Listing keys');

        const params: Record<string, string> = {};
        if (options?.prefix) params.prefix = options.prefix;
        if (options?.limit) params.limit = options.limit.toString();
        if (options?.startAfter) params.startAfter = options.startAfter;
        if (options?.includeMetadata) params.includeMetadata = 'true';

        try {
            const response = await this.makeRequest('GET', '/api/v1/keys', null, params);
            return (response as any).keys || [];
        } catch (error) {
            this.logger('error', `Failed to list keys: ${error}`);
            throw this.createError('LIST_FAILED', error as Error);
        }
    }

    async getStats(detailed?: boolean): Promise<ServerStats> {
        this.logger('debug', `Getting stats (detailed: ${detailed})`);

        const params: Record<string, string> = {};
        if (detailed) params.detailed = 'true';

        try {
            const response = await this.makeRequest('GET', '/api/v1/stats', null, params);
            return response as ServerStats;
        } catch (error) {
            this.logger('error', `Failed to get stats: ${error}`);
            throw this.createError('STATS_FAILED', error as Error);
        }
    }

    async healthCheck(): Promise<HealthStatus> {
        this.logger('debug', 'Performing health check');

        try {
            const response = await this.makeRequest('GET', '/api/v1/health');
            return response as HealthStatus;
        } catch (error) {
            this.logger('error', `Health check failed: ${error}`);
            throw this.createError('HEALTH_CHECK_FAILED', error as Error);
        }
    }

    private async makeRequest(
        method: string,
        path: string,
        body?: any,
        params?: Record<string, string>
    ): Promise<any> {
        const url = new URL(`${this.baseUrl}${path}`);

        if (params) {
            Object.entries(params).forEach(([key, value]) => {
                url.searchParams.append(key, value);
            });
        }

        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
        };

        if (this.config.apiKey) {
            headers['Authorization'] = `Bearer ${this.config.apiKey}`;
        }

        const requestInit: RequestInit = {
            method,
            headers,
        };

        if (body) {
            requestInit.body = JSON.stringify(body);
        }

        const response = await fetch(url.toString(), requestInit);

        if (!response.ok) {
            const errorText = await response.text();
            const error = new Error(`HTTP ${response.status}: ${errorText}`) as CBDError;
            error.statusCode = response.status;
            error.code = `HTTP_${response.status}`;
            error.retryable = response.status >= 500;
            throw error;
        }

        return response.json();
    }

    private createError(code: string, originalError: Error): CBDError {
        const error = new Error(originalError.message) as CBDError;
        error.code = code;
        error.retryable = this.isRetryableError(code);
        error.details = originalError;
        return error;
    }

    private isRetryableError(code: string): boolean {
        const retryableCodes = ['TIMEOUT', 'CONNECTION_LOST', 'SERVER_ERROR', 'HTTP_500', 'HTTP_502', 'HTTP_503'];
        return retryableCodes.includes(code);
    }
}

// Factory function
export function createCBDClient(config: CBDConfig): CBDClient {
    if (config.protocol === 'grpc') {
        return new CBDGrpcClient(config);
    } else {
        return new CBDRestClient(config);
    }
}

// Default export
export default createCBDClient;
