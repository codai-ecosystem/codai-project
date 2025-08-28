/**
 * @fileoverview Type definitions for Cautai CLI
 * @author Cautai Team
 * @version 1.0.0
 */

export interface CLISearchResult {
  id: string;
  title: string;
  url: string;
  snippet: string;
}

export interface CLISearchOptions {
  query: string;
  maxResults?: number;
  language?: 'en' | 'ro' | 'auto';
}

export interface CLIConfig {
  defaultLanguage: 'en' | 'ro' | 'auto';
  maxResults: number;
  mcpServerPath?: string;
  apiUrl?: string;
}