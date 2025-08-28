/**
 * @fileoverview Search Engine Interfaces and Types
 * @author Cautai Team
 * @version 1.0.0
 */

export interface SearchQuery {
  query: string;
  limit?: number;
  offset?: number;
  filters?: SearchFilters;
  language?: 'en' | 'ro';
  mode?: 'ai' | 'basic';
}

export interface SearchFilters {
  domain?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
  contentType?: 'article' | 'video' | 'pdf' | 'all';
  region?: string;
}

export interface SearchResult {
  id: string;
  url: string;
  title: string;
  snippet: string;
  domain: string;
  publishedAt?: Date;
  lastModified?: Date;
  score: number;
  relevanceScore: number;
  qualityScore: number;
  contentType: string;
  language: string;
  citations: Citation[];
  metadata: ResultMetadata;
}

export interface Citation {
  text: string;
  source: string;
  confidence: number;
  startPosition?: number;
  endPosition?: number;
}

export interface ResultMetadata {
  wordCount?: number;
  readingTime?: number;
  author?: string;
  tags?: string[];
  sentiment?: 'positive' | 'negative' | 'neutral';
  extractedEntities?: string[];
  keyPhrases?: string[];
}

export interface SearchResponse {
  results: SearchResult[];
  total: number;
  query: string;
  processingTimeMs: number;
  suggestions?: string[];
  relatedQueries?: string[];
  facets?: SearchFacets;
}

export interface SearchFacets {
  domains: { domain: string; count: number }[];
  contentTypes: { type: string; count: number }[];
  languages: { language: string; count: number }[];
  dateRanges: { range: string; count: number }[];
}

export interface SearchAdapter {
  name: string;
  search(query: SearchQuery): Promise<SearchResult[]>;
  isAvailable(): boolean;
  getConfig(): AdapterConfig;
}

export interface AdapterConfig {
  enabled: boolean;
  priority: number;
  timeout: number;
  maxResults: number;
  apiKey?: string;
  baseUrl?: string;
  rateLimit?: {
    requests: number;
    window: number;
  };
}

export interface RankingContext {
  query: string;
  userLocation?: string;
  userLanguage?: string;
  searchHistory?: string[];
  preferences?: UserPreferences;
}

export interface UserPreferences {
  preferredLanguages: string[];
  trustedDomains: string[];
  contentTypePreferences: Record<string, number>;
  personalizedRanking: boolean;
}

export interface CacheEntry<T = any> {
  key: string;
  value: T;
  expiresAt: Date;
  metadata: {
    createdAt: Date;
    accessCount: number;
    lastAccessed: Date;
    tags: string[];
  };
}

export interface SearchEngineConfig {
  adapters: Record<string, AdapterConfig>;
  ranking: {
    algorithm: 'bm25' | 'hybrid' | 'semantic';
    weights: {
      relevance: number;
      quality: number;
      recency: number;
      authority: number;
    };
  };
  caching: {
    enabled: boolean;
    ttl: number;
    maxSize: number;
    strategy: 'lru' | 'fifo' | 'ttl';
  };
  deduplication: {
    enabled: boolean;
    similarity_threshold: number;
    fields: string[];
  };
}

export enum SearchError {
  NETWORK_ERROR = 'NETWORK_ERROR',
  QUOTA_EXCEEDED = 'QUOTA_EXCEEDED',
  INVALID_QUERY = 'INVALID_QUERY',
  ADAPTER_UNAVAILABLE = 'ADAPTER_UNAVAILABLE',
  TIMEOUT = 'TIMEOUT',
  RATE_LIMITED = 'RATE_LIMITED',
  UNAUTHORIZED = 'UNAUTHORIZED',
  INTERNAL_ERROR = 'INTERNAL_ERROR'
}

export class CautaiSearchError extends Error {
  constructor(
    message: string,
    public code: SearchError,
    public adapter?: string,
    public details?: any
  ) {
    super(message);
    this.name = 'CautaiSearchError';
  }
}