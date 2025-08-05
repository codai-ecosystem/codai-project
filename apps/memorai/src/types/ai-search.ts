/**
 * AI-Powered Search Types for MemorAI Phase 3.2
 * Enhanced search capabilities using AI insights and machine learning
 */

import { Memory } from './memory';

// Enhanced search query types
export interface AISearchQuery {
    query: string;
    intent?: SearchIntent;
    context?: SearchContext;
    personalization?: PersonalizationSettings;
    aiEnhancements?: AISearchEnhancements;
}

export interface SearchIntent {
    type: IntentType;
    confidence: number;
    entities: SearchEntity[];
    temporalContext?: TemporalContext;
}

export enum IntentType {
    EXACT_MATCH = 'exact_match',
    SEMANTIC_SEARCH = 'semantic_search',
    EXPLORATORY = 'exploratory',
    CONTEXTUAL = 'contextual',
    TEMPORAL = 'temporal',
    CONCEPTUAL = 'conceptual',
    TASK_ORIENTED = 'task_oriented'
}

export interface SearchEntity {
    text: string;
    type: EntityType;
    confidence: number;
    synonyms?: string[];
    relatedConcepts?: string[];
}

export enum EntityType {
    PERSON = 'person',
    CONCEPT = 'concept',
    TECHNOLOGY = 'technology',
    PROJECT = 'project',
    CATEGORY = 'category',
    TAG = 'tag',
    TASK = 'task',
    LOCATION = 'location',
    DATE = 'date',
    FILE_TYPE = 'file_type'
}

export interface TemporalContext {
    timeframe: TimeframeType;
    specificDate?: Date;
    relativePeriod?: RelativePeriod;
}

export enum TimeframeType {
    RECENT = 'recent',
    TODAY = 'today',
    YESTERDAY = 'yesterday',
    THIS_WEEK = 'this_week',
    THIS_MONTH = 'this_month',
    LAST_MONTH = 'last_month',
    THIS_YEAR = 'this_year',
    SPECIFIC_DATE = 'specific_date',
    DATE_RANGE = 'date_range'
}

export interface RelativePeriod {
    amount: number;
    unit: 'minutes' | 'hours' | 'days' | 'weeks' | 'months' | 'years';
    direction: 'ago' | 'from_now';
}

export interface SearchContext {
    userId: string;
    sessionId?: string;
    currentMemoryId?: string;
    recentSearches?: string[];
    currentCategory?: string;
    activeProject?: string;
    userBehaviorPattern?: UserBehaviorPattern;
}

export interface UserBehaviorPattern {
    preferredCategories: CategoryPreference[];
    searchPatterns: SearchPattern[];
    timePreferences: TimePreference[];
    contentPreferences: ContentPreference[];
    interactionStyle: InteractionStyle;
}

export interface CategoryPreference {
    category: string;
    frequency: number;
    lastAccessed: Date;
    priority: number;
}

export interface SearchPattern {
    queryType: string;
    frequency: number;
    successRate: number;
    averageResultsUsed: number;
    preferredFilters: string[];
}

export interface TimePreference {
    preferredSearchTime: string; // HH:mm format
    preferredTimeframes: TimeframeType[];
    workingHours: WorkingHours;
}

export interface WorkingHours {
    start: string; // HH:mm
    end: string; // HH:mm
    timezone: string;
    workDays: number[]; // 0=Sunday, 1=Monday, etc.
}

export interface ContentPreference {
    preferredLength: 'short' | 'medium' | 'long' | 'any';
    preferredFormats: ContentFormat[];
    topicAreas: TopicArea[];
}

export enum ContentFormat {
    TEXT = 'text',
    CODE = 'code',
    NOTES = 'notes',
    LINKS = 'links',
    LISTS = 'lists',
    STRUCTURED = 'structured'
}

export interface TopicArea {
    name: string;
    relevance: number;
    keywords: string[];
    relatedAreas: string[];
}

export enum InteractionStyle {
    EXPLORER = 'explorer', // Likes to browse and discover
    FOCUSED = 'focused', // Direct, specific searches
    ITERATIVE = 'iterative', // Refines searches progressively
    CONTEXTUAL = 'contextual', // Searches within context
    COMPREHENSIVE = 'comprehensive' // Wants detailed results
}

export interface PersonalizationSettings {
    usePersonalization: boolean;
    considerSearchHistory: boolean;
    considerAccessPatterns: boolean;
    considerTimeContext: boolean;
    boostRecentlyAccessed: boolean;
    boostFrequentlyUsed: boolean;
    personalizedRanking: boolean;
    adaptiveFiltering: boolean;
}

export interface AISearchEnhancements {
    useNaturalLanguage: boolean;
    enableQueryExpansion: boolean;
    enableSemanticSimilarity: boolean;
    enableConceptualSearch: boolean;
    enableAutoCorrection: boolean;
    enableSmartSuggestions: boolean;
    useContextualRanking: boolean;
    enableClusteringResults: boolean;
}

// Enhanced search results
export interface AISearchResult {
    memory: Memory;
    relevanceScore: number;
    aiInsights: SearchResultInsights;
    reasoning: SearchReasoning;
    relatedMemories: RelatedMemory[];
    suggestedActions: SuggestedAction[];
}

export interface SearchResultInsights {
    matchType: MatchType;
    matchedEntities: SearchEntity[];
    semanticSimilarity: number;
    contextualRelevance: number;
    personalizedScore: number;
    temporalRelevance: number;
    popularityScore: number;
    qualityScore: number;
}

export enum MatchType {
    EXACT = 'exact',
    SEMANTIC = 'semantic',
    CONCEPTUAL = 'conceptual',
    CONTEXTUAL = 'contextual',
    TEMPORAL = 'temporal',
    PATTERN_BASED = 'pattern_based'
}

export interface SearchReasoning {
    primaryFactors: ReasoningFactor[];
    boostFactors: ReasoningFactor[];
    penaltyFactors: ReasoningFactor[];
    explanation: string;
    confidence: number;
}

export interface ReasoningFactor {
    factor: string;
    impact: number;
    description: string;
}

export interface RelatedMemory {
    id: string;
    title: string;
    relationshipType: RelationshipType;
    similarity: number;
}

export enum RelationshipType {
    SIMILAR_CONTENT = 'similar_content',
    SAME_PROJECT = 'same_project',
    SAME_CATEGORY = 'same_category',
    TEMPORAL_PROXIMITY = 'temporal_proximity',
    CONCEPTUAL_LINK = 'conceptual_link',
    USAGE_PATTERN = 'usage_pattern'
}

export interface SuggestedAction {
    type: ActionType;
    label: string;
    description: string;
    confidence: number;
    parameters?: Record<string, any>;
}

export enum ActionType {
    REFINE_SEARCH = 'refine_search',
    EXPLORE_RELATED = 'explore_related',
    SAVE_SEARCH = 'save_search',
    CREATE_COLLECTION = 'create_collection',
    UPDATE_TAGS = 'update_tags',
    MERGE_MEMORIES = 'merge_memories',
    ARCHIVE_MEMORY = 'archive_memory'
}

// Search suggestions and autocomplete
export interface SmartSuggestion {
    suggestion: string;
    type: SuggestionType;
    score: number;
    reasoning: string;
    metadata: SuggestionMetadata;
}

export enum SuggestionType {
    QUERY_COMPLETION = 'query_completion',
    QUERY_EXPANSION = 'query_expansion',
    RELATED_SEARCH = 'related_search',
    TRENDING = 'trending',
    PERSONALIZED = 'personalized',
    CONTEXTUAL = 'contextual'
}

export interface SuggestionMetadata {
    source: string;
    popularity: number;
    recentUsage: number;
    personalRelevance: number;
    estimatedResults: number;
}

// Search analytics and learning
export interface SearchSession {
    sessionId: string;
    userId: string;
    startTime: Date;
    endTime?: Date;
    searches: SearchEvent[];
    outcomes: SearchOutcome[];
    learnings: SearchLearning[];
}

export interface SearchEvent {
    timestamp: Date;
    query: AISearchQuery;
    results: AISearchResult[];
    userInteractions: UserInteraction[];
}

export interface UserInteraction {
    type: InteractionType;
    timestamp: Date;
    targetId: string;
    metadata?: Record<string, any>;
}

export enum InteractionType {
    CLICK = 'click',
    HOVER = 'hover',
    COPY = 'copy',
    SHARE = 'share',
    EDIT = 'edit',
    DELETE = 'delete',
    TAG = 'tag',
    BOOKMARK = 'bookmark',
    REFINE_SEARCH = 'refine_search'
}

export interface SearchOutcome {
    successful: boolean;
    satisfaction: number;
    timeToSuccess: number;
    resultUsed: boolean;
    refinementCount: number;
    finalAction?: ActionType;
}

export interface SearchLearning {
    pattern: string;
    confidence: number;
    impact: number;
    applicableContexts: string[];
    recommendation: string;
}

// Configuration and settings
export interface AISearchConfiguration {
    features: FeatureFlags;
    algorithms: AlgorithmSettings;
    personalization: PersonalizationConfig;
    performance: PerformanceSettings;
}

export interface FeatureFlags {
    naturalLanguageProcessing: boolean;
    semanticSearch: boolean;
    personalizedRanking: boolean;
    smartSuggestions: boolean;
    contextualSearch: boolean;
    queryExpansion: boolean;
    autoCorrection: boolean;
    searchAnalytics: boolean;
}

export interface AlgorithmSettings {
    semanticSimilarityThreshold: number;
    personalizationWeight: number;
    recencyBoost: number;
    popularityBoost: number;
    qualityThreshold: number;
    maxResults: number;
    clustering: ClusteringSettings;
}

export interface ClusteringSettings {
    enabled: boolean;
    maxClusters: number;
    minClusterSize: number;
    similarityThreshold: number;
}

export interface PersonalizationConfig {
    enabled: boolean;
    learningRate: number;
    historyWindow: number; // days
    adaptationSpeed: 'slow' | 'medium' | 'fast';
    privacyMode: 'strict' | 'balanced' | 'permissive';
}

export interface PerformanceSettings {
    maxQueryTime: number; // milliseconds
    caching: CachingSettings;
    indexing: IndexingSettings;
}

export interface CachingSettings {
    enabled: boolean;
    ttl: number; // seconds
    maxSize: number; // MB
    strategies: CacheStrategy[];
}

export enum CacheStrategy {
    LRU = 'lru',
    LFU = 'lfu',
    TTL = 'ttl',
    ADAPTIVE = 'adaptive'
}

export interface IndexingSettings {
    vectorDimensions: number;
    indexingStrategy: 'realtime' | 'batch' | 'hybrid';
    updateFrequency: number; // minutes
}

// Utility types
export interface SearchMetrics {
    totalSearches: number;
    successfulSearches: number;
    averageQueryTime: number;
    popularQueries: PopularQuery[];
    searchTrends: SearchTrend[];
    userSatisfaction: number;
}

export interface PopularQuery {
    query: string;
    frequency: number;
    successRate: number;
    averageResults: number;
}

export interface SearchTrend {
    timeframe: string;
    queryCount: number;
    successRate: number;
    topQueries: string[];
}

export type AISearchQueryBuilder = {
    query(text: string): AISearchQueryBuilder;
    intent(type: IntentType): AISearchQueryBuilder;
    context(context: Partial<SearchContext>): AISearchQueryBuilder;
    personalize(settings: Partial<PersonalizationSettings>): AISearchQueryBuilder;
    enhance(enhancements: Partial<AISearchEnhancements>): AISearchQueryBuilder;
    build(): AISearchQuery;
};

export type SearchResultProcessor = {
    rank(results: AISearchResult[]): AISearchResult[];
    cluster(results: AISearchResult[]): Map<string, AISearchResult[]>;
    personalize(results: AISearchResult[], user: SearchContext): AISearchResult[];
    explain(result: AISearchResult): SearchReasoning;
};
