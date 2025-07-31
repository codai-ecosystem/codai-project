/**
 * MemorAI Advanced MCP Server - World-Class Implementation
 *
 * Combines the best features from both implementations:
 * - Correct tool names (mcp_memoraimcp_*) for VS Code MCP compatibility
 * - CBD backend for high-performance and reliability
 * - HPKV-inspired architecture with structured keys
 * - Advanced semantic search with OpenAI embeddings
 * - Performance tracking and analytics
 * - Hybrid storage with fallback mechanisms
 */
interface ServerConfig {
    cbdPath: string;
    azureOpenAI?: {
        endpoint: string;
        apiKey: string;
        apiVersion: string;
        embeddingDeployment: string;
        embeddingModel: string;
    };
    openaiApiKey?: string;
    embeddingModel: string;
    dimensions: number;
    cacheSize: number;
    maxMemories: number;
    logLevel: string;
    serverName: string;
    version: string;
    nodeEnv: string;
    enableSemanticSearch: boolean;
    enablePerformanceTracking: boolean;
    enableHybridStorage: boolean;
    fallbackStorage: 'json' | 'sqlite';
}
export declare class MemorAIAdvancedServer {
    private server;
    private config;
    private memories;
    private dataPath;
    private isStarted;
    private openai?;
    private operationCount;
    private operationTimes;
    private startTime;
    private memoryStats;
    constructor(config: ServerConfig);
    private log;
    private setupHandlers;
    private handleRemember;
    private handleRecall;
    private handleForget;
    private handleContext;
    private handleGetMemory;
    private handleSearchKeys;
    private getNextSequenceNumber;
    private calculateImportance;
    private performSemanticSearch;
    private performTextSearch;
    private calculateCosineSimilarity;
    private generateSearchSummary;
    private updateMemoryStats;
    private updateMetrics;
    private getAverageResponseTime;
    private getSystemCapabilities;
    private loadMemories;
    private saveMemories;
    start(): Promise<void>;
    stop(): Promise<void>;
}
export {};
//# sourceMappingURL=cbd-server.d.ts.map