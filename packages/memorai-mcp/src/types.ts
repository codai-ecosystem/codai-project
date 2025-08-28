/**
 * Type definitions for MemorAI MCP Advanced AI Integration
 */

// Advanced AI Integration Types
export interface AIResult {
    success: boolean;
    error?: string;
    insights?: string[];
    recommendations?: string[];
    patterns?: string[];
    relationships?: string[];
    trends?: string[];
    clusters?: any[];
    anomalies?: string[];
    labels?: string[];
    metrics?: {
        patternStrength?: number;
        confidence?: number;
        novelty?: number;
        silhouetteScore?: number;
        cohesion?: number;
        separation?: number;
        nodeCount?: number;
        edgeCount?: number;
        clusterCount?: number;
        density?: number;
        centrality?: Record<string, number>;
        volatility?: number;
        trend_strength?: number;
        periodicity?: number;
        processingTime?: number;
        complexityScore?: number;
        noveltyScore?: number;
    };
    synthesizedContent?: string;
    crossModalInsights?: string[];
    culturalContext?: string;
    qualityMetrics?: {
        synthesisQuality?: number;
        culturalAuthenticity?: number;
        transcendenceLevel?: number;
        emergenceEnhancement?: number;
    };
    processingTime?: number;
    reasoning?: string[];
    conclusions?: string[];
    confidence?: number;
    crossModalConnections?: any[];
    culturalInsights?: string[];
    logicalSteps?: any[];
    timeline?: any[];
    evolution?: any[];
    changePoints?: any[];
    predictions?: string[];
    response?: string;
    intelligenceTypes?: string[];
    capabilities?: string[];
    graph?: any;
    nodes?: any[];
    edges?: any[];
    centroids?: any[];
    similarities?: any[];
}

export interface KnowledgeGraphOptions {
    maxNodes?: number;
    includeWeights?: boolean;
    layout?: string;
}

export interface PatternAnalysisOptions {
    analysisType?: string;
    timeRange?: string;
    minPatternStrength?: number;
}

export interface SynthesisOptions {
    synthesisMode?: string;
    culturalContext?: boolean;
}

export interface TemporalRange {
    from: string;
    to: string;
}

export interface IntelligenceContext {
    intelligenceTypes?: string[];
    enhancementLevel?: string;
    [key: string]: any;
}

/**
 * Memory interface for advanced search and processing
 */
export interface Memory {
    id: string;
    agentId: string;
    content: string;
    structuredKey: string;
    timestamp: string;
    importance: number;
    entityType?: string;
    project?: string;
    session?: string;
    tags?: string[];
    embeddings?: number[];
    metadata?: Record<string, any>;
}