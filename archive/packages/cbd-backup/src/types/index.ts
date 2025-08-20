/**
 * CBD (Codai Better Database) Core Types
 * HPKV-inspired vector memory system with semantic search
 */

export interface ConversationExchange {
    id?: string;
    structuredKey: string;
    projectName: string;
    sessionName: string;
    sequenceNumber: number;
    agentId: string;
    userRequest: string;
    assistantResponse: string;
    conversationContext?: string | undefined;
    metadata: Record<string, any>;
    vectorEmbedding?: Float32Array | undefined;
    confidenceScore: number;
    createdAt: Date;
    updatedAt: Date;
}

export interface MemorySearchResult {
    memory: ConversationExchange;
    relevanceScore: number;
    confidence: number;
    summary?: string;
}

export interface SearchQuery {
    query: string;
    limit?: number;
    confidenceThreshold?: number;
    projectFilter?: string;
    sessionFilter?: string;
    agentFilter?: string;
    timeRange?: {
        start: Date;
        end: Date;
    };
}

export interface VectorSearchOptions {
    topK?: number;
    minScore?: number;
    includeMetadata?: boolean;
}

export interface EmbeddingModel {
    name: string;
    dimensions: number;
    generateEmbedding(text: string): Promise<Float32Array>;
    generateBatchEmbeddings(texts: string[]): Promise<Float32Array[]>;
}

export interface VectorStore {
    addVector(id: string, vector: Float32Array, metadata?: Record<string, any>): Promise<void>;
    searchSimilar(queryVector: Float32Array, options?: VectorSearchOptions): Promise<VectorSearchResult[]>;
    removeVector(id: string): Promise<boolean>;
    getVector(id: string): Promise<Float32Array | null>;
}

export interface VectorSearchResult {
    id: string;
    score: number;
    metadata?: Record<string, any> | undefined;
}

export interface StorageAdapter {
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    storeConversation(exchange: ConversationExchange): Promise<string>;
    getConversation(structuredKey: string): Promise<ConversationExchange | null>;
    searchConversations(query: SearchQuery): Promise<ConversationExchange[]>;
    updateConversation(structuredKey: string, updates: Partial<ConversationExchange>): Promise<boolean>;
    deleteConversation(structuredKey: string): Promise<boolean>;
    getStats(): Promise<DatabaseStats>;
}

export interface DatabaseStats {
    totalMemories: number;
    uniqueAgents: number;
    uniqueProjects: number;
    uniqueSessions: number;
    averageConfidence: number;
    databaseSize: number;
    lastUpdated: Date;
}

export interface CBDConfig {
    storage: {
        type: 'cbd-native' | 'hybrid';
        dataPath?: string;
    };
    embedding: {
        model: 'openai' | 'local' | 'custom';
        apiKey?: string | undefined;
        modelName?: string;
        dimensions?: number;
    };
    vector: {
        indexType: 'faiss' | 'approximate';
        dimensions: number;
        similarityMetric: 'cosine' | 'euclidean' | 'dot';
    };
    cache: {
        enabled: boolean;
        maxSize: number;
        ttl: number;
    };
}

export interface MemorySummary {
    summary: string;
    sourceMemories: string[];
    confidenceScore: number;
    relevantTopics: string[];
}
