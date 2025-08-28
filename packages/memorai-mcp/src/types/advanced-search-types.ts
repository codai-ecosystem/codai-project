/**
 * Enhanced Types for Advanced Memory Search & Filtering
 * Extends existing memory types with search-specific interfaces
 * Part of US-MEM-008 implementation
 */

// Re-export existing types
export * from './types/memory-types';

// New search-specific types
export interface SearchSuggestion {
  text: string;
  type: 'completion' | 'correction' | 'related' | 'historical' | 'semantic';
  relevance: number; // 0-1
  resultCount?: number;
  metadata?: Record<string, any>;
}

export interface SearchHighlight {
  field: string;
  snippet: string;
  startOffset: number;
  endOffset: number;
}

export interface SearchFilter {
  // Temporal filters
  dateRange?: {
    start?: Date;
    end?: Date;
  };
  recencyWeight?: number; // Boost recent memories

  // Importance filters
  minImportance?: number; // 1-10
  maxImportance?: number; // 1-10
  importanceWeight?: number; // Weight in final score

  // Content filters
  contentLength?: {
    min?: number;
    max?: number;
  };
  hasEmbedding?: boolean; // Only memories with embeddings

  // Metadata filters
  tags?: string[]; // Must have any of these tags
  allTags?: string[]; // Must have all of these tags
  excludeTags?: string[]; // Must not have any of these tags
  entityTypes?: string[];
  projects?: string[];
  sessions?: string[];
  priorities?: string[];

  // Agent filters
  agents?: string[]; // Specific agent IDs
  excludeAgents?: string[]; // Exclude these agents
  crossAgentAccess?: boolean; // Allow cross-agent results

  // Advanced filters
  hasAttachments?: boolean;
  hasReactions?: boolean;
  isArchived?: boolean;
  isDeleted?: boolean;
}

export interface SearchRankingConfig {
  // Score weights (must sum to 1.0)
  semanticWeight: number; // Vector similarity
  textMatchWeight: number; // Exact text matches
  importanceWeight: number; // Memory importance
  temporalWeight: number; // Recency bonus
  fuzzyWeight: number; // Fuzzy matching
  metadataWeight: number; // Metadata matches

  // Ranking parameters
  semanticThreshold: number; // Minimum semantic similarity
  fuzzyTolerance: number; // Maximum edit distance
  temporalDecay: number; // Days for 50% temporal score
  boostExactMatch: number; // Multiplier for exact phrase matches
  penalizePartialMatch: number; // Penalty for partial matches
}

export interface SearchAnalytics {
  queryTime: number; // Total search time in ms
  candidatesFound: number; // Initial candidates
  candidatesFiltered: number; // After filtering
  finalResults: number; // Results returned

  phaseTimings: {
    textSearch: number;
    semanticSearch: number;
    metadataSearch: number;
    fuzzySearch: number;
    scoring: number;
    ranking: number;
  };

  searchPhases: string[]; // Which phases were executed
  cacheHits: number; // Embedding cache hits
  embeddingsGenerated: number; // New embeddings created

  qualityMetrics: {
    averageRelevance: number; // Average relevance score
    topResultScore: number; // Highest scoring result
    scoreDistribution: number[]; // Score histogram
    diversityScore: number; // Result diversity measure
  };
}

export interface SearchExplanation {
  finalScore: number;
  scoreBreakdown: {
    semantic: { score: number; weight: number; contribution: number };
    textMatch: { score: number; weight: number; contribution: number };
    importance: { score: number; weight: number; contribution: number };
    temporal: { score: number; weight: number; contribution: number };
    fuzzy: { score: number; weight: number; contribution: number };
    metadata: { score: number; weight: number; contribution: number };
  };
  matchDetails: {
    textMatches: string[]; // Matched text snippets
    semanticSimilarity: number; // Vector similarity
    importanceScore: number; // Normalized importance
    recencyScore: number; // Normalized recency
    metadataMatches: Record<string, string[]>; // Field -> matched values
  };
  rankingFactors: string[]; // Human-readable ranking factors
}

export interface AdvancedSearchOptions {
  // Basic search options
  query?: string;
  limit?: number;
  offset?: number;

  // Filter options
  filters?: SearchFilter;

  // Ranking configuration
  ranking?: Partial<SearchRankingConfig>;

  // Search behavior
  enableSemanticSearch?: boolean;
  enableFuzzySearch?: boolean;
  enableMetadataSearch?: boolean;
  enableCrossAgent?: boolean;

  // Result enhancement
  includeHighlights?: boolean;
  includeExplanations?: boolean;
  includeAnalytics?: boolean;
  includeSuggestions?: boolean;

  // Performance options
  maxCandidates?: number; // Limit candidates before ranking
  useCache?: boolean; // Use embedding cache
  timeoutMs?: number; // Search timeout

  // Debug options
  debugMode?: boolean; // Include debug information
  logPerformance?: boolean; // Log performance metrics
}

export interface AdvancedSearchResult {
  memory: Memory;
  relevanceScore: number; // Final combined score

  // Component scores
  semanticScore?: number;
  textMatchScore?: number;
  importanceScore?: number;
  temporalScore?: number;
  fuzzyScore?: number;
  metadataScore?: number;

  // Result enhancements
  highlights?: SearchHighlight[];
  explanation?: SearchExplanation;
  suggestions?: SearchSuggestion[];

  // Metadata
  searchRank: number; // Position in results (1-based)
  matchedFields: string[]; // Which fields matched
  matchConfidence: number; // 0-1 confidence score

  // Debug information (if enabled)
  debugInfo?: {
    candidatePhases: string[];
    filterResults: Record<string, boolean>;
    timings: Record<string, number>;
    cacheHits: string[];
  };
}

export interface SearchIndex {
  // Text indices
  wordIndex: Map<string, Set<string>>; // word -> memory IDs
  phraseIndex: Map<string, Set<string>>; // phrase -> memory IDs
  ngramIndex: Map<string, Set<string>>; // n-gram -> memory IDs

  // Metadata indices
  tagIndex: Map<string, Set<string>>;
  entityTypeIndex: Map<string, Set<string>>;
  projectIndex: Map<string, Set<string>>;
  agentIndex: Map<string, Set<string>>;

  // Vector indices
  embeddingIndex: Map<string, number[]>; // memory ID -> embedding
  clusterIndex: Map<number, Set<string>>; // cluster ID -> memory IDs

  // Temporal indices
  dateIndex: Map<string, Set<string>>; // date -> memory IDs
  timeRangeIndex: Map<string, Set<string>>; // time range -> memory IDs

  // Quality indices
  importanceIndex: Map<number, Set<string>>; // importance -> memory IDs
  lengthIndex: Map<string, Set<string>>; // length range -> memory IDs

  // Maintenance metadata
  indexVersion: number;
  lastUpdate: Date;
  memoryCount: number;
  indexHealth: 'healthy' | 'degraded' | 'rebuilding' | 'failed';
}

export interface SearchConfiguration {
  // Provider settings
  embeddingProvider: 'azure-openai' | 'openai' | 'local' | 'offline';
  embeddingModel?: string;
  embeddingDimension?: number;

  // Index settings
  enableVectorSearch: boolean;
  enableFuzzySearch: boolean;
  enableNgramIndex: boolean;
  maxNgramSize: number;

  // Performance settings
  maxCandidates: number;
  searchTimeoutMs: number;
  embeddingCacheSize: number;
  indexRebuildThreshold: number; // Memories before rebuild

  // Quality settings
  minRelevanceThreshold: number;
  diversityThreshold: number; // Avoid too similar results
  maxDuplicateResults: number;

  // Default ranking weights
  defaultRanking: SearchRankingConfig;

  // Feature flags
  enableSearchAnalytics: boolean;
  enableSearchLogging: boolean;
  enablePerformanceTracking: boolean;
}

export interface SearchSession {
  sessionId: string;
  agentId: string;
  startTime: Date;
  lastActivity: Date;

  // Search history
  queries: {
    query: string;
    timestamp: Date;
    resultCount: number;
    selectedResults: string[]; // Memory IDs
    searchTime: number;
  }[];

  // Personalization data
  preferences: {
    preferredFields: string[];
    rankingWeights: Partial<SearchRankingConfig>;
    excludedAgents: string[];
    favoriteProjects: string[];
  };

  // Learning data
  clickThroughRates: Map<string, number>; // Query -> CTR
  resultInteractions: Map<string, number>; // Memory ID -> interaction count
  queryRefinements: Map<string, string[]>; // Original -> refined queries
}

// Event types for search analytics
export interface SearchEvent {
  type: 'search' | 'click' | 'selection' | 'refinement' | 'suggestion';
  sessionId: string;
  agentId: string;
  timestamp: Date;
  data: Record<string, any>;
}

export interface SearchPerformanceMetrics {
  // Latency metrics
  averageSearchTime: number;
  p95SearchTime: number;
  p99SearchTime: number;

  // Throughput metrics
  searchesPerSecond: number;
  concurrentSearches: number;
  queuedSearches: number;

  // Quality metrics
  averageResultCount: number;
  averageRelevanceScore: number;
  clickThroughRate: number;
  querySuccessRate: number; // Queries that return results

  // System metrics
  indexSize: number; // Bytes
  indexMemoryUsage: number; // Bytes
  embeddingCacheHitRate: number;
  indexHealthScore: number; // 0-1

  // Error metrics
  searchErrors: number;
  timeouts: number;
  embeddingErrors: number;
  indexErrors: number;
}

// Utility types
export type SearchResultType = 'exact' | 'semantic' | 'fuzzy' | 'metadata' | 'hybrid';
export type SearchSortOrder = 'relevance' | 'date' | 'importance' | 'alphabetical';
export type SearchScope = 'personal' | 'project' | 'organization' | 'public';

export interface SearchResultGroup {
  groupKey: string; // What to group by (project, date, etc.)
  groupValue: string; // The actual group value
  results: AdvancedSearchResult[];
  totalCount: number;
  averageRelevance: number;
}

export interface SearchFacet {
  field: string; // Field name (tags, projects, etc.)
  values: {
    value: string;
    count: number;
    selected: boolean;
  }[];
  type: 'terms' | 'range' | 'date' | 'boolean';
}

export interface SearchAutoComplete {
  suggestions: {
    text: string;
    type: 'query' | 'field' | 'value';
    score: number;
    preview?: string; // Preview of what this would search
  }[];
  corrections: {
    original: string;
    corrected: string;
    confidence: number;
  }[];
  queryExpansions: {
    expansion: string;
    reason: string; // Why this expansion is suggested
    expectedResults: number;
  }[];
}