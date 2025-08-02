#!/usr/bin/env node
/**
 * MemorAI MCP Unified Server - Production-Ready Implementation
 *
 * Consolidated server combining the best features from all implementations:
 * - Correct tool names (*) for VS Code MCP compatibility
 * - CBD backend for high-performance and reliability
 * - HPKV-inspired architecture with structured keys
 * - Advanced semantic search with OpenAI embeddings
 * - Performance tracking and analytics
 * - Hybrid storage with fallback mechanisms
 * - Simplified configuration and startup
 */
import { MemoryRelationship } from './relationship-engine.js';
interface AzureOpenAIConfig {
    endpoint: string;
    apiKey: string;
    apiVersion: string;
    embeddingDeployment: string;
    embeddingModel: string;
}
export interface AdvancedMemory {
    id: string;
    content: string;
    contentHash: string;
    structuredKey: string;
    projectName: string;
    sessionName: string;
    sequenceNumber: number;
    metadata: {
        agentId: string;
        timestamp: string;
        importance: number;
        project?: string;
        session?: string;
        tags?: string[];
        entityType?: string;
        priority?: string;
        embeddingSummary?: string;
    };
    accessCount: number;
    lastAccessed: string;
    relevanceScore?: number;
    embedding?: number[];
    embeddingModel?: string;
    relationships: MemoryRelationship[];
    relatedMemoryIds: Set<string>;
    knowledgeGraphPosition?: {
        x: number;
        y: number;
        cluster: string;
    };
}
interface ServerConfig {
    cbdPath: string;
    azureOpenAI?: AzureOpenAIConfig;
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
export declare class MemorAIUnifiedServer {
    private server;
    private config;
    private memories;
    private dataPath;
    private isStarted;
    private openai?;
    private relationshipEngine;
    private searchEngine;
    private analyticsEngine;
    private recommendationEngine;
    private evolutionEngine;
    private learningEngine;
    private enhancedPredictiveEngine;
    private federationEngine;
    private operationCount;
    private operationTimes;
    private startTime;
    private memoryStats;
    constructor(config: ServerConfig);
    private log;
    /**
     * Initialize CBD Service - Check for service availability and optionally start it
     */
    private initializeCBDService;
    private checkCBDService;
    private startCBDService;
    private startCBDViaNPX;
    private findCBDPackage;
    private sleep;
    private setupHandlers;
    private handleRemember;
    private handleRecall;
    private handleForget;
    private handleContext;
    private handleGetMemory;
    private handleSearchKeys;
    private handleLinkMemories;
    private handleGetRelationships;
    private handleExploreGraph;
    private exploreFromMemory;
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
    private handleGetAnalytics;
    private handleGetRecommendations;
    private handleGetInsights;
    private generateInsightsSummary;
    private handleEvolveMemory;
    private handleResolveConflicts;
    private handleConsolidateMemories;
    private handleManageLifecycle;
    private handlePredictEnhanced;
    private handlePredictStructure;
    private handlePredictEvolution;
    private handleLearnFromUsage;
    private handleAdaptOrganization;
    private handleOptimizeRetrieval;
    private handleShareMemory;
    private handleFederatedQuery;
    private handleCollectiveInsights;
    private handleCollaborativeLearning;
    private handleSynchronizeFederation;
}
export {};
//# sourceMappingURL=server.d.ts.map