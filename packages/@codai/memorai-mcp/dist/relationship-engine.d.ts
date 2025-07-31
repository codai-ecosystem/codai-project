/**
 * Memory Relationship Engine - Advanced relationship detection and knowledge graph building
 *
 * Capabilities:
 * - Automatic relationship detection between memories
 * - Semantic similarity calculation
 * - Content reference analysis
 * - Knowledge graph construction
 * - Relationship strength scoring
 */
import OpenAI from 'openai';
export interface MemoryRelationship {
    id: string;
    sourceMemoryId: string;
    targetMemoryId: string;
    relationshipType: 'related' | 'references' | 'follows' | 'contradicts' | 'updates' | 'similar' | 'contains' | 'explains';
    strength: number;
    context?: string;
    createdBy: 'auto' | 'user' | 'ai';
    timestamp: string;
    confidence: number;
    bidirectional: boolean;
}
export interface KnowledgeGraph {
    nodes: GraphNode[];
    edges: GraphEdge[];
    clusters: GraphCluster[];
    metrics: GraphMetrics;
}
export interface GraphNode {
    id: string;
    memoryId: string;
    structuredKey: string;
    title: string;
    importance: number;
    centrality: number;
    cluster?: string;
    position?: {
        x: number;
        y: number;
    };
}
export interface GraphEdge {
    id: string;
    source: string;
    target: string;
    relationship: MemoryRelationship;
    weight: number;
}
export interface GraphCluster {
    id: string;
    name: string;
    nodeIds: string[];
    theme: string;
    centrality: number;
    color?: string;
}
export interface GraphMetrics {
    totalNodes: number;
    totalEdges: number;
    totalClusters: number;
    density: number;
    averageClustering: number;
    averagePathLength: number;
    mostCentralNodes: string[];
    isolatedNodes: string[];
}
export interface AdvancedMemory {
    id: string;
    content: string;
    structuredKey: string;
    projectName: string;
    sessionName: string;
    metadata: {
        agentId: string;
        timestamp: string;
        importance: number;
        [key: string]: any;
    };
    embedding?: number[];
    relationships: MemoryRelationship[];
    relatedMemoryIds: Set<string>;
    knowledgeGraphPosition?: {
        x: number;
        y: number;
        cluster: string;
    };
}
export declare class MemoryRelationshipEngine {
    private openai?;
    private relationshipCache;
    private similarityCache;
    constructor(openai?: OpenAI);
    /**
     * Detect relationships between a new memory and existing memories
     */
    detectRelationships(memory: AdvancedMemory, existingMemories: AdvancedMemory[], options?: {
        maxRelationships?: number;
        minSimilarityThreshold?: number;
        enableAIAnalysis?: boolean;
    }): Promise<MemoryRelationship[]>;
    /**
     * Calculate semantic similarity between two memories using embeddings
     */
    calculateSemanticSimilarity(memory1: AdvancedMemory, memory2: AdvancedMemory): Promise<number>;
    /**
     * Find content references between memories
     */
    findContentReferences(memory: AdvancedMemory, existingMemories: AdvancedMemory[]): Promise<MemoryRelationship[]>;
    /**
     * Build a knowledge graph from memories and their relationships
     */
    buildKnowledgeGraph(memories: AdvancedMemory[]): Promise<KnowledgeGraph>;
    /**
     * Find semantic relationships using embeddings
     */
    private findSemanticRelationships;
    /**
     * Find temporal relationships (follows, updates)
     */
    private findTemporalRelationships;
    /**
     * Find contextual relationships (same project, similar metadata)
     */
    private findContextualRelationships;
    /**
     * Analyze relationships using AI
     */
    private analyzeRelationshipsWithAI;
    /**
     * AI-powered relationship analysis
     */
    private aiAnalyzeRelationship;
    /**
     * Detect content references (mentions of keys, concepts)
     */
    private detectContentReferences;
    /**
     * Extract key phrases from content (simple implementation)
     */
    private extractKeyPhrases;
    /**
     * Calculate cosine similarity between two vectors
     */
    private calculateCosineSimilarity;
    /**
     * Generate a unique relationship ID
     */
    private generateRelationshipId;
    /**
     * Remove duplicate relationships
     */
    private deduplicateRelationships;
    /**
     * Cache relationships for performance
     */
    private cacheRelationships;
    /**
     * Calculate node centrality in the graph
     */
    private calculateCentrality;
    /**
     * Detect clusters in the knowledge graph
     */
    private detectClusters;
    /**
     * Find connected component starting from a node
     */
    private findConnectedComponent;
    /**
     * Extract theme from cluster memories
     */
    private extractClusterTheme;
    /**
     * Find most common element in array
     */
    private findMostCommon;
    /**
     * Generate color for cluster
     */
    private generateClusterColor;
    /**
     * Calculate graph metrics
     */
    private calculateGraphMetrics;
    /**
     * Calculate average path length (simplified)
     */
    private calculateAveragePathLength;
}
//# sourceMappingURL=relationship-engine.d.ts.map