/**
 * 🧠 MemorAI Phase 3.1 - AI Insights Types & Interfaces
 * Advanced AI-powered memory intelligence data structures
 * Generated: August 5, 2025
 */

// Memory Pattern Recognition Types
export interface MemoryPattern {
    id: string;
    type: PatternType;
    name: string;
    description: string;
    frequency: number;
    confidence: number;
    memories: string[]; // Memory IDs
    createdAt: Date;
    lastSeen: Date;
}

export enum PatternType {
    CONTENT_SIMILARITY = 'content_similarity',
    USAGE_FREQUENCY = 'usage_frequency',
    TEMPORAL_CLUSTERING = 'temporal_clustering',
    CATEGORICAL_GROUPING = 'categorical_grouping',
    TAG_CORRELATION = 'tag_correlation',
    IMPORTANCE_TRENDING = 'importance_trending',
    USER_BEHAVIOR = 'user_behavior'
}

// AI-Powered Recommendations
export interface MemoryRecommendation {
    id: string;
    type: RecommendationType;
    title: string;
    description: string;
    confidence: number;
    impact: RecommendationImpact;
    actionUrl?: string;
    relatedMemories: string[];
    metadata: RecommendationMetadata;
    createdAt: Date;
    expiresAt?: Date;
}

export enum RecommendationType {
    CREATE_MEMORY = 'create_memory',
    UPDATE_MEMORY = 'update_memory',
    ORGANIZE_MEMORIES = 'organize_memories',
    MERGE_DUPLICATES = 'merge_duplicates',
    ADD_TAGS = 'add_tags',
    CHANGE_CATEGORY = 'change_category',
    ARCHIVE_UNUSED = 'archive_unused',
    CONNECT_RELATED = 'connect_related'
}

export enum RecommendationImpact {
    LOW = 'low',
    MEDIUM = 'medium',
    HIGH = 'high',
    CRITICAL = 'critical'
}

export interface RecommendationMetadata {
    reason: string;
    algorithm: string;
    suggestedValues?: Record<string, any>;
    alternatives?: string[];
    userFeedback?: 'accepted' | 'dismissed' | 'postponed';
}

// Content Analysis & Similarity
export interface ContentAnalysis {
    memoryId: string;
    contentType: ContentType;
    topics: Topic[];
    entities: Entity[];
    sentiment: SentimentAnalysis;
    readability: ReadabilityScore;
    keywords: Keyword[];
    language: string;
    wordCount: number;
    analyzedAt: Date;
}

export enum ContentType {
    TEXT = 'text',
    CODE = 'code',
    NOTES = 'notes',
    MEETING = 'meeting',
    IDEA = 'idea',
    TASK = 'task',
    REFERENCE = 'reference'
}

export interface Topic {
    name: string;
    confidence: number;
    category: string;
}

export interface Entity {
    text: string;
    type: EntityType;
    confidence: number;
    startOffset: number;
    endOffset: number;
}

export enum EntityType {
    PERSON = 'person',
    ORGANIZATION = 'organization',
    LOCATION = 'location',
    DATE = 'date',
    TECHNOLOGY = 'technology',
    CONCEPT = 'concept',
    PROJECT = 'project'
}

export interface SentimentAnalysis {
    score: number; // -1 to 1
    magnitude: number; // 0 to 1
    label: 'positive' | 'negative' | 'neutral';
    confidence: number;
}

export interface ReadabilityScore {
    score: number; // 0 to 100
    level: 'elementary' | 'middle' | 'high' | 'college' | 'graduate';
    avgWordsPerSentence: number;
    avgSyllablesPerWord: number;
}

export interface Keyword {
    word: string;
    frequency: number;
    relevance: number;
    category?: string;
}

// Memory Clustering & Relationships
export interface MemoryCluster {
    id: string;
    name: string;
    description: string;
    centerMemoryId: string;
    memoryIds: string[];
    similarity: number;
    clusterType: ClusterType;
    algorithm: ClusteringAlgorithm;
    createdAt: Date;
    updatedAt: Date;
}

export enum ClusterType {
    SEMANTIC = 'semantic',
    TEMPORAL = 'temporal',
    CATEGORICAL = 'categorical',
    USAGE_BASED = 'usage_based',
    HYBRID = 'hybrid'
}

export enum ClusteringAlgorithm {
    KMEANS = 'kmeans',
    HIERARCHICAL = 'hierarchical',
    DBSCAN = 'dbscan',
    SEMANTIC_EMBEDDING = 'semantic_embedding'
}

// Usage Analytics & Patterns
export interface UsageAnalytics {
    userId: string;
    timeRange: {
        start: Date;
        end: Date;
    };
    totalMemories: number;
    memoriesCreated: number;
    memoriesUpdated: number;
    memoriesDeleted: number;
    searchQueries: number;
    avgSessionDuration: number;
    topCategories: CategoryUsage[];
    topTags: TagUsage[];
    activityPattern: ActivityPattern[];
    peakUsageHours: number[];
    engagementScore: number;
}

export interface CategoryUsage {
    category: string;
    count: number;
    percentage: number;
    trend: 'increasing' | 'decreasing' | 'stable';
}

export interface TagUsage {
    tag: string;
    count: number;
    memories: number;
    coOccurrence: string[]; // Other tags used together
}

export interface ActivityPattern {
    hour: number;
    day: string;
    activity: number;
    actions: {
        create: number;
        update: number;
        search: number;
        view: number;
    };
}

// AI Insights Dashboard Data
export interface AIInsightsDashboard {
    userId: string;
    generatedAt: Date;
    patterns: MemoryPattern[];
    recommendations: MemoryRecommendation[];
    clusters: MemoryCluster[];
    analytics: UsageAnalytics;
    insights: AIInsight[];
    healthScore: MemoryHealthScore;
}

export interface AIInsight {
    id: string;
    type: InsightType;
    title: string;
    description: string;
    value: string | number;
    trend: 'up' | 'down' | 'stable';
    impact: RecommendationImpact;
    actionable: boolean;
    relatedData: Record<string, any>;
}

export enum InsightType {
    PRODUCTIVITY = 'productivity',
    ORGANIZATION = 'organization',
    CONTENT_QUALITY = 'content_quality',
    USAGE_EFFICIENCY = 'usage_efficiency',
    KNOWLEDGE_GAPS = 'knowledge_gaps',
    COLLABORATION = 'collaboration',
    PERFORMANCE = 'performance'
}

export interface MemoryHealthScore {
    overall: number; // 0 to 100
    dimensions: {
        organization: number;
        completeness: number;
        freshness: number;
        interconnectedness: number;
        accessibility: number;
        diversity: number;
    };
    recommendations: string[];
    lastCalculated: Date;
}

// API Request/Response Types
export interface AIInsightsRequest {
    userId: string;
    timeRange?: {
        start: Date;
        end: Date;
    };
    analysisType?: AnalysisType[];
    options?: AIInsightsOptions;
}

export enum AnalysisType {
    PATTERNS = 'patterns',
    RECOMMENDATIONS = 'recommendations',
    CLUSTERING = 'clustering',
    ANALYTICS = 'analytics',
    CONTENT_ANALYSIS = 'content_analysis'
}

export interface AIInsightsOptions {
    includeContentAnalysis?: boolean;
    includeRecommendations?: boolean;
    includeClustering?: boolean;
    maxResults?: number;
    confidenceThreshold?: number;
    realTimeUpdates?: boolean;
}

export interface AIInsightsResponse {
    success: boolean;
    data?: AIInsightsDashboard;
    error?: {
        code: string;
        message: string;
        details?: Record<string, any>;
    };
    processingTime: number;
    cached: boolean;
    generatedAt: Date;
}

// Memory Similarity & Matching
export interface MemorySimilarity {
    memoryId1: string;
    memoryId2: string;
    similarity: number;
    similarityType: SimilarityType;
    confidence: number;
    reasons: string[];
    computedAt: Date;
}

export enum SimilarityType {
    SEMANTIC = 'semantic',
    LEXICAL = 'lexical',
    STRUCTURAL = 'structural',
    TEMPORAL = 'temporal',
    CONTEXTUAL = 'contextual',
    BEHAVIORAL = 'behavioral'
}

// Smart Auto-Categorization
export interface AutoCategorizationResult {
    memoryId: string;
    suggestedCategory: string;
    confidence: number;
    reasons: string[];
    alternativeCategories: {
        category: string;
        confidence: number;
    }[];
    autoTags: {
        tag: string;
        confidence: number;
        source: 'content' | 'context' | 'pattern';
    }[];
}

// Performance Metrics
export interface AIPerformanceMetrics {
    analysisSpeed: number; // ms
    accuracyScore: number; // 0-1
    userSatisfaction: number; // 0-1
    recommendationAcceptanceRate: number; // 0-1
    errorRate: number; // 0-1
    cacheHitRate: number; // 0-1
    resourceUtilization: {
        cpu: number;
        memory: number;
        storage: number;
    };
    lastUpdated: Date;
}

// Export all types for easy importing
// (Types are already exported via individual declarations above)
