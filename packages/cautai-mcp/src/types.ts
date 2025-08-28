/**
 * @fileoverview Type definitions for Cautai MCP Server
 * @author Cautai Team
 * @version 1.0.0
 */

export interface SearchOptions {
  query: string;
  limit?: number;
  maxResults?: number;
  language?: 'en' | 'ro' | 'auto';
  includeSnippets?: boolean;
  includeCitations?: boolean;
}

export interface SearchResult {
  id: string;
  title: string;
  url: string;
  snippet: string;
  language: string;
  relevanceScore: number;
  publishedDate?: string;
  domain: string;
}

export interface CitationInfo {
  id: string;
  title: string;
  url: string;
  domain: string;
  publishedDate?: string;
  accessDate: string;
}

export interface ComposeOptions {
  query: string;
  maxSources?: number;
  language?: 'en' | 'ro' | 'auto';
  includeReferences?: boolean;
}

export interface ComposedAnswer {
  answer: string;
  sources: CitationInfo[];
  confidence: number;
  language: string;
}

export interface PerformanceMetrics {
  queryTime: number;
  searchTime: number;
  processingTime: number;
  totalTime: number;
  cacheHit: boolean;
  resultCount: number;
  memoryUsage?: number;
  timestamp: number;
}