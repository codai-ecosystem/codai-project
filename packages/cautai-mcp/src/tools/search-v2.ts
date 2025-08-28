/**
 * @fileoverview Web Search Tool for Cautai MCP Server
 * @author Cautai Team
 * @version 1.0.0
 */

import { z } from 'zod';
import type { SearchQuery } from '../search/types.js';
import { CautaiSearchEngine } from '../search/engine.js';

export const SearchToolSchema = z.object({
  query: z.string().min(1).describe('Search query text'),
  limit: z.number().optional().default(10).describe('Maximum number of results (default: 10)'),
  language: z.enum(['en', 'ro']).optional().default('en').describe('Search language (default: en)'),
  mode: z.enum(['ai', 'basic']).optional().default('ai').describe('Search mode (default: ai)'),
  filters: z.object({
    domain: z.string().optional().describe('Filter by specific domain'),
    dateRange: z.object({
      start: z.string().describe('Start date (ISO string)'),
      end: z.string().describe('End date (ISO string)')
    }).optional().describe('Filter by date range'),
    contentType: z.enum(['article', 'video', 'pdf', 'all']).optional().describe('Content type filter'),
    region: z.string().optional().describe('Geographic region filter')
  }).optional().describe('Advanced search filters')
});

export class SearchTool {
  private searchEngine: CautaiSearchEngine;

  constructor() {
    // Initialize with default configuration
    this.searchEngine = new CautaiSearchEngine({
      adapters: {
        duckduckgo: {
          enabled: true,
          priority: 1,
          timeout: 5000,
          maxResults: 20,
          baseUrl: 'https://api.duckduckgo.com',
          rateLimit: {
            requests: 10,
            window: 60000
          }
        }
      },
      ranking: {
        algorithm: 'hybrid',
        weights: {
          relevance: 0.4,
          quality: 0.3,
          recency: 0.2,
          authority: 0.1
        }
      },
      caching: {
        enabled: true,
        ttl: 300000, // 5 minutes
        maxSize: 1000,
        strategy: 'lru'
      },
      deduplication: {
        enabled: true,
        similarity_threshold: 0.8,
        fields: ['url', 'title', 'content']
      }
    });
  }

  public async execute(args: Record<string, unknown>) {
    const validated = SearchToolSchema.parse(args);
    
    const searchQuery: SearchQuery = {
      query: validated.query,
      limit: validated.limit,
      language: validated.language,
      mode: validated.mode,
      filters: validated.filters ? {
        domain: validated.filters.domain,
        dateRange: validated.filters.dateRange ? {
          start: new Date(validated.filters.dateRange.start),
          end: new Date(validated.filters.dateRange.end)
        } : undefined,
        contentType: validated.filters.contentType,
        region: validated.filters.region
      } : undefined
    };

    try {
      const response = await this.searchEngine.search(searchQuery);
      
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              query: response.query,
              total: response.total,
              results: response.results.map(result => ({
                title: result.title,
                url: result.url,
                snippet: result.snippet,
                domain: result.domain,
                score: Math.round(result.score * 100) / 100,
                publishedAt: result.publishedAt?.toISOString(),
                contentType: result.contentType,
                language: result.language
              })),
              processingTime: `${response.processingTimeMs}ms`,
              suggestions: response.suggestions || [],
              facets: response.facets
            }, null, 2)
          }
        ]
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              error: 'Search failed',
              message: error instanceof Error ? error.message : 'Unknown error',
              query: validated.query
            }, null, 2)
          }
        ],
        isError: true
      };
    }
  }
}