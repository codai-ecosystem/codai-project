/**
 * @fileoverview Simple Mock Adapter for Integration Testing
 * @author Cautai Team
 * @version 1.0.0
 */

import { BaseSearchAdapter } from '../src/search/adapters/base.js';
import type { SearchQuery, SearchResult, AdapterConfig } from '../src/search/types.js';

export class SimpleMockAdapter extends BaseSearchAdapter {
  constructor(config: Partial<AdapterConfig> = {}) {
    super('simple-mock', {
      priority: 1,
      maxResults: 10,
      rateLimit: {
        requests: 1000,
        window: 3600000, // 1 hour
      },
      ...config
    });
  }

  public async search(query: SearchQuery): Promise<SearchResult[]> {
    console.log(`🔍 SimpleMockAdapter searching for: "${query.query}"`);
    
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const results: SearchResult[] = [
      {
        id: `mock-1-${Date.now()}`,
        url: `https://example.com/${encodeURIComponent(query.query)}`,
        title: `Mock Result: ${query.query}`,
        snippet: `This is a mock search result for "${query.query}". The integration test is working correctly. The real DuckDuckGo adapter would replace this with actual web scraping results.`,
        domain: 'example.com',
        score: 0.95,
        relevanceScore: 0.90,
        qualityScore: 0.85,
        contentType: 'article',
        language: query.language || 'en',
        citations: [
          {
            text: `Mock citation for ${query.query}`,
            source: 'example.com',
            confidence: 0.9
          }
        ],
        metadata: {
          wordCount: 150,
          readingTime: 1,
          extractedEntities: [query.query, 'mock', 'test'],
          keyPhrases: [`${query.query} results`, 'mock search', 'integration test'],
          sentiment: 'neutral'
        }
      },
      {
        id: `mock-2-${Date.now() + 1}`,
        url: `https://test.org/search?q=${encodeURIComponent(query.query)}`,
        title: `Related: ${query.query} Information`,
        snippet: `Additional mock result showing multiple results functionality. This demonstrates that the search engine can handle multiple adapters and rank results properly.`,
        domain: 'test.org',
        score: 0.80,
        relevanceScore: 0.75,
        qualityScore: 0.80,
        contentType: 'article',
        language: query.language || 'en',
        citations: [
          {
            text: `Related information about ${query.query}`,
            source: 'test.org',
            confidence: 0.8
          }
        ],
        metadata: {
          wordCount: 120,
          readingTime: 1,
          extractedEntities: ['information', 'search', 'results'],
          keyPhrases: ['multiple results', 'search engine', 'ranking'],
          sentiment: 'neutral'
        }
      }
    ];

    // Apply limit
    const limit = Math.min(query.limit || 10, this.config.maxResults);
    return results.slice(0, limit);
  }

  public isAvailable(): boolean {
    return true;
  }
}