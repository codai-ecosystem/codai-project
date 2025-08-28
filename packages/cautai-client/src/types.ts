/**
 * @fileoverview Type definitions for Cautai Client
 * @author Cautai Team
 * @version 1.0.0
 */

export interface SearchOptions {
  query: string;
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

export interface ComposedAnswer {
  answer: string;
  sources: CitationInfo[];
  confidence: number;
  language: string;
}