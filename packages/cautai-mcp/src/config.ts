/**
 * @fileoverview Configuration for Cautai MCP Server
 * @author Cautai Team
 * @version 1.0.0
 */

export interface CautaiConfig {
  // Search configuration
  maxResults: number;
  defaultLanguage: 'en' | 'ro' | 'auto';
  enableSnippets: boolean;
  enableCitations: boolean;
  
  // Rate limiting
  rateLimit: {
    windowMs: number;
    maxRequests: number;
  };
  
  // Cache configuration
  cache: {
    ttl: number; // Time to live in seconds
    maxSize: number; // Maximum number of cached items
  };
  
  // Logging
  logLevel: 'debug' | 'info' | 'warn' | 'error';
}

export const defaultConfig: CautaiConfig = {
  maxResults: 10,
  defaultLanguage: 'auto',
  enableSnippets: true,
  enableCitations: true,
  rateLimit: {
    windowMs: 60000, // 1 minute
    maxRequests: 100,
  },
  cache: {
    ttl: 3600, // 1 hour
    maxSize: 1000,
  },
  logLevel: 'info',
};