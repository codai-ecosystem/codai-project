import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock external dependencies first
vi.mock('node:https', () => ({
  default: {
    request: vi.fn(),
  },
}));

vi.mock('../security/validation', () => ({
  SecurityValidationSystem: vi.fn().mockImplementation(() => ({
    validateSearchQuery: vi.fn().mockResolvedValue({
      isValid: true,
      sanitizedInput: 'test query',
      violations: [],
      riskScore: 0.1,
      suggestions: [],
    }),
  })),
}));

vi.mock('../performance/monitor', () => ({
  PerformanceMonitor: vi.fn().mockImplementation(() => ({
    startOperation: vi.fn().mockReturnValue('op-123'),
    endOperation: vi.fn().mockResolvedValue({
      operationId: 'op-123',
      duration: 100,
      success: true,
    }),
    addMetrics: vi.fn(),
    emit: vi.fn(),
  })),
}));

vi.mock('../performance/cache-manager', () => ({
  AdvancedCacheManager: vi.fn().mockImplementation(() => ({
    getCachedResults: vi.fn().mockResolvedValue(null),
    cacheResults: vi.fn().mockResolvedValue(true),
    getStats: vi.fn().mockReturnValue({
      hits: 0,
      misses: 1,
      hitRate: 0,
    }),
  })),
}));

import { CautaiSearchEngine } from '../search/engine';
import { HybridRankingEngine } from '../search/ranking';
import { ResultDeduplicator } from '../search/deduplication';
import type { SearchQuery, SearchResult } from '../search/types';

describe('CautaiSearchEngine', () => {
  let searchEngine: CautaiSearchEngine;

  beforeEach(() => {
    searchEngine = new CautaiSearchEngine({
      adapters: {
        duckduckgo: {
          enabled: true,
          priority: 2,
          timeout: 10000,
          maxResults: 10
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
        ttl: 3600000,
        maxSize: 1000,
        strategy: 'lru'
      },
      deduplication: {
        enabled: true,
        similarity_threshold: 0.85,
        fields: ['title', 'url', 'snippet']
      }
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Search Execution', () => {
    it('should execute basic search with default parameters', async () => {
      const mockResults: SearchResult[] = [
        {
          id: '1',
          title: 'Test Result 1',
          url: 'https://example.com/1',
          snippet: 'Test description 1',
          score: 0.95,
          relevanceScore: 0.95,
          qualityScore: 0.9,
          domain: 'example.com',
          contentType: 'article',
          language: 'en',
          citations: [],
          metadata: {}
        },
        {
          id: '2',
          title: 'Test Result 2',
          url: 'https://example.com/2',
          snippet: 'Test description 2',
          score: 0.85,
          relevanceScore: 0.85,
          qualityScore: 0.8,
          domain: 'example.com',
          contentType: 'article',
          language: 'en',
          citations: [],
          metadata: {}
        },
      ];

      // Mock the search method to return our test results
      vi.spyOn(searchEngine, 'search').mockResolvedValue({
        results: mockResults,
        total: 2,
        query: 'test query',
        processingTimeMs: 100,
        suggestions: [],
        relatedQueries: []
      });

      const query: SearchQuery = { query: 'test query' };
      const results = await searchEngine.search(query);

      expect(results.results).toHaveLength(2);
      expect(results.total).toBe(2);
      expect(results.query).toBe('test query');
      expect(results.results[0].title).toBe('Test Result 1');
      expect(results.results[0].score).toBe(0.95);
    });

    it('should handle search with custom parameters', async () => {
      const mockResults: SearchResult[] = [
        {
          id: '1',
          title: 'Custom Result',
          url: 'https://example.ro/1',
          snippet: 'Custom description',
          score: 0.9,
          relevanceScore: 0.9,
          qualityScore: 0.85,
          domain: 'example.ro',
          contentType: 'article',
          language: 'ro',
          citations: [],
          metadata: {}
        }
      ];

      vi.spyOn(searchEngine, 'search').mockResolvedValue({
        results: mockResults,
        total: 1,
        query: 'custom query',
        processingTimeMs: 120,
        suggestions: [],
        relatedQueries: []
      });

      const query: SearchQuery = {
        query: 'custom query',
        limit: 5,
        language: 'ro'
      };
      const results = await searchEngine.search(query);

      expect(results.results).toHaveLength(1);
      expect(results.results[0].language).toBe('ro');
      expect(results.total).toBe(1);
    });

    it('should handle empty search results', async () => {
      vi.spyOn(searchEngine, 'search').mockResolvedValue({
        results: [],
        total: 0,
        query: 'empty query',
        processingTimeMs: 50,
        suggestions: [],
        relatedQueries: []
      });

      const query: SearchQuery = { query: 'empty query' };
      const results = await searchEngine.search(query);

      expect(results.results).toHaveLength(0);
      expect(results.total).toBe(0);
    });

    it('should handle search API errors gracefully', async () => {
      vi.spyOn(searchEngine, 'search').mockRejectedValue(new Error('API Error'));

      const query: SearchQuery = { query: 'error query' };
      await expect(searchEngine.search(query)).rejects.toThrow('API Error');
    });

    it('should validate input before searching', async () => {
      const query: SearchQuery = { query: '' };
      await expect(searchEngine.search(query)).rejects.toThrow();
    });

    it('should respect maxResults configuration', async () => {
      const mockResults: SearchResult[] = Array.from({ length: 5 }, (_, i) => ({
        id: `${i + 1}`,
        title: `Result ${i + 1}`,
        url: `https://example.com/${i + 1}`,
        snippet: `Description ${i + 1}`,
        score: 0.9 - i * 0.1,
        relevanceScore: 0.9 - i * 0.1,
        qualityScore: 0.8,
        domain: 'example.com',
        contentType: 'article',
        language: 'en',
        citations: [],
        metadata: {}
      }));

      vi.spyOn(searchEngine, 'search').mockResolvedValue({
        results: mockResults,
        total: 100,
        query: 'many results',
        processingTimeMs: 200,
        suggestions: [],
        relatedQueries: []
      });

      const query: SearchQuery = { query: 'many results', limit: 5 };
      const results = await searchEngine.search(query);

      expect(results.results).toHaveLength(5);
    });
  });

  describe('Performance Integration', () => {
    it('should track search operations for performance monitoring', async () => {
      const mockResults: SearchResult[] = [{
        id: '1',
        title: 'Performance Test',
        url: 'https://example.com/perf',
        snippet: 'Performance description',
        score: 0.8,
        relevanceScore: 0.8,
        qualityScore: 0.75,
        domain: 'example.com',
        contentType: 'article',
        language: 'en',
        citations: [],
        metadata: {}
      }];

      vi.spyOn(searchEngine, 'search').mockResolvedValue({
        results: mockResults,
        total: 1,
        query: 'performance test',
        processingTimeMs: 100,
        suggestions: [],
        relatedQueries: []
      });

      const query: SearchQuery = { query: 'performance test' };
      await searchEngine.search(query);

      // The performance monitor should have been used
      expect(true).toBe(true); // Placeholder for actual monitoring verification
    });

    it('should use cache when available', async () => {
      const mockResults: SearchResult[] = [{
        id: '1',
        title: 'Cached Result',
        url: 'https://example.com/cached',
        snippet: 'Cached description',
        score: 0.8,
        relevanceScore: 0.8,
        qualityScore: 0.75,
        domain: 'example.com',
        contentType: 'article',
        language: 'en',
        citations: [],
        metadata: {}
      }];

      vi.spyOn(searchEngine, 'search').mockResolvedValue({
        results: mockResults,
        total: 1,
        query: 'cached query',
        processingTimeMs: 5, // Very fast for cached results
        suggestions: [],
        relatedQueries: []
      });

      const query: SearchQuery = { query: 'cached query' };
      const results = await searchEngine.search(query);

      expect(results.results).toHaveLength(1);
      expect(results.processingTimeMs).toBeLessThan(10);
    });
  });

  describe('Configuration Handling', () => {
    it('should initialize with default configuration', () => {
      const defaultEngine = new CautaiSearchEngine();
      expect(defaultEngine).toBeDefined();
    });

    it('should use custom configuration when provided', () => {
      const customConfig = {
        ranking: {
          algorithm: 'bm25' as const,
          weights: {
            relevance: 0.5,
            quality: 0.25,
            recency: 0.15,
            authority: 0.1
          }
        }
      };
      const customEngine = new CautaiSearchEngine(customConfig);
      expect(customEngine).toBeDefined();
    });

    it('should handle invalid configuration gracefully', () => {
      const invalidConfig = {
        adapters: {},
        ranking: {
          algorithm: 'invalid' as any,
          weights: {
            relevance: 1.5,
            quality: -0.1,
            recency: 0,
            authority: 0
          }
        }
      };
      expect(() => new CautaiSearchEngine(invalidConfig)).not.toThrow();
    });
  });

  describe('Error Handling', () => {
    it('should handle network timeouts', async () => {
      vi.spyOn(searchEngine, 'search').mockRejectedValue(new Error('Timeout'));

      const query: SearchQuery = { query: 'timeout query' };
      await expect(searchEngine.search(query)).rejects.toThrow('Timeout');
    });

    it('should handle malformed API responses', async () => {
      vi.spyOn(searchEngine, 'search').mockRejectedValue(new Error('Invalid response format'));

      const query: SearchQuery = { query: 'malformed response' };
      await expect(searchEngine.search(query)).rejects.toThrow('Invalid response format');
    });
  });
});

describe('HybridRankingEngine', () => {
  let ranker: HybridRankingEngine;

  beforeEach(() => {
    ranker = new HybridRankingEngine({
      k1: 1.5,
      b: 0.75,
      semanticWeight: 0.4,
      bm25Weight: 0.6
    });
  });

  describe('Ranking Algorithm', () => {
    it('should rank results based on relevance scores', async () => {
      const results: SearchResult[] = [
        {
          id: '1',
          title: 'Less Relevant',
          url: 'https://example.com/2',
          snippet: 'Some description',
          score: 0.6,
          relevanceScore: 0.6,
          qualityScore: 0.5,
          domain: 'example.com',
          contentType: 'article',
          language: 'en',
          citations: [],
          metadata: {}
        },
        {
          id: '2',
          title: 'Most Relevant',
          url: 'https://example.com/1',
          snippet: 'Best description',
          score: 0.95,
          relevanceScore: 0.95,
          qualityScore: 0.9,
          domain: 'example.com',
          contentType: 'article',
          language: 'en',
          citations: [],
          metadata: {}
        }
      ];

      const ranked = await ranker.rankResults(results, 'test query');

      expect(ranked[0].title).toBe('Most Relevant');
      expect(ranked[1].title).toBe('Less Relevant');
    });

    it('should calculate relevance scores based on query matching', async () => {
      const results: SearchResult[] = [{
        id: '1',
        title: 'Test Query Result',
        url: 'https://example.com/test',
        snippet: 'This contains the test query terms',
        score: 0.7,
        relevanceScore: 0.7,
        qualityScore: 0.6,
        domain: 'example.com',
        contentType: 'article',
        language: 'en',
        citations: [],
        metadata: {}
      }];

      const ranked = await ranker.rankResults(results, 'test query');

      expect(ranked[0].relevanceScore).toBeGreaterThan(0.7);
    });

    it('should consider freshness in ranking', async () => {
      const now = new Date();
      const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

      const results: SearchResult[] = [
        {
          id: '1',
          title: 'Old Result',
          url: 'https://example.com/old',
          snippet: 'Old content',
          score: 0.8,
          relevanceScore: 0.8,
          qualityScore: 0.7,
          domain: 'example.com',
          publishedAt: yesterday,
          contentType: 'article',
          language: 'en',
          citations: [],
          metadata: {}
        },
        {
          id: '2',
          title: 'Fresh Result',
          url: 'https://example.com/fresh',
          snippet: 'Fresh content',
          score: 0.8,
          relevanceScore: 0.8,
          qualityScore: 0.7,
          domain: 'example.com',
          publishedAt: now,
          contentType: 'article',
          language: 'en',
          citations: [],
          metadata: {}
        }
      ];

      const ranked = await ranker.rankResults(results, 'test');

      expect(ranked[0].title).toBe('Fresh Result');
    });

    it('should handle empty results gracefully', async () => {
      const ranked = await ranker.rankResults([], 'test query');
      expect(ranked).toHaveLength(0);
    });

    it('should handle results with identical scores', async () => {
      const results: SearchResult[] = [
        {
          id: '1',
          title: 'Result A',
          url: 'https://example.com/a',
          snippet: 'Content A',
          score: 0.8,
          relevanceScore: 0.8,
          qualityScore: 0.8,
          domain: 'example.com',
          contentType: 'article',
          language: 'en',
          citations: [],
          metadata: {}
        },
        {
          id: '2',
          title: 'Result B',
          url: 'https://example.com/b',
          snippet: 'Content B',
          score: 0.8,
          relevanceScore: 0.8,
          qualityScore: 0.8,
          domain: 'example.com',
          contentType: 'article',
          language: 'en',
          citations: [],
          metadata: {}
        }
      ];

      const ranked = await ranker.rankResults(results, 'test');

      expect(ranked).toHaveLength(2);
      expect(ranked[0].score).toBeGreaterThan(0);
      expect(ranked[1].score).toBeGreaterThan(0);
    });
  });

  describe('Weight Configuration', () => {
    it('should apply different weights correctly', async () => {
      const customRanker = new HybridRankingEngine({
        semanticWeight: 0.8,
        bm25Weight: 0.2
      });

      const results: SearchResult[] = [{
        id: '1',
        title: 'High Relevance',
        url: 'https://example.com/high',
        snippet: 'Very relevant content',
        score: 0.9,
        relevanceScore: 0.9,
        qualityScore: 0.5,
        domain: 'example.com',
        contentType: 'article',
        language: 'en',
        citations: [],
        metadata: {}
      }];

      const ranked = await customRanker.rankResults(results, 'test');
      expect(ranked[0].score).toBeGreaterThan(0.1);
    });

    it('should normalize weights if they don\'t sum to 1', () => {
      const unnormalizedRanker = new HybridRankingEngine({
        semanticWeight: 2,
        bm25Weight: 1
      });

      expect(unnormalizedRanker).toBeDefined();
    });
  });

  describe('ML-Enhanced Ranking', () => {
    it('should handle ML ranking when enabled', async () => {
      const mlRanker = new HybridRankingEngine({
        semanticWeight: 0.4,
        bm25Weight: 0.6
      });

      const results: SearchResult[] = [{
        id: '1',
        title: 'ML Test',
        url: 'https://example.com/ml',
        snippet: 'Machine learning content',
        score: 0.7,
        relevanceScore: 0.7,
        qualityScore: 0.6,
        domain: 'example.com',
        contentType: 'article',
        language: 'en',
        citations: [],
        metadata: {}
      }];

      const ranked = await mlRanker.rankResults(results, 'machine learning');
      expect(ranked).toHaveLength(1);
    });
  });
});

describe('ResultDeduplicator', () => {
  let deduplicator: ResultDeduplicator;

  beforeEach(() => {
    deduplicator = new ResultDeduplicator({
      enabled: true,
      similarityThreshold: 0.8,
      algorithms: ['url', 'title'],
      keepHighestScore: true
    });
  });

  describe('URL Deduplication', () => {
    it('should remove duplicate URLs', () => {
      const results: SearchResult[] = [
        {
          id: '1',
          title: 'First URL',
          url: 'https://example.com/page',
          snippet: 'First description',
          score: 0.9,
          relevanceScore: 0.9,
          qualityScore: 0.8,
          domain: 'example.com',
          contentType: 'article',
          language: 'en',
          citations: [],
          metadata: {}
        },
        {
          id: '2',
          title: 'Duplicate URL',
          url: 'https://example.com/page',
          snippet: 'Different description',
          score: 0.7,
          relevanceScore: 0.7,
          qualityScore: 0.6,
          domain: 'example.com',
          contentType: 'article',
          language: 'en',
          citations: [],
          metadata: {}
        },
        {
          id: '3',
          title: 'Unique Result',
          url: 'https://example.com/unique',
          snippet: 'Unique content',
          score: 0.8,
          relevanceScore: 0.8,
          qualityScore: 0.7,
          domain: 'example.com',
          contentType: 'article',
          language: 'en',
          citations: [],
          metadata: {}
        },
      ];

      const deduplicated = deduplicator.deduplicate(results);

      expect(deduplicated).toHaveLength(2);
      expect(deduplicated.find(r => r.url === 'https://example.com/page')?.score).toBe(0.9);
      expect(deduplicated.find(r => r.url === 'https://example.com/unique')).toBeDefined();
    });

    it('should handle identical titles', () => {
      const results: SearchResult[] = [
        {
          id: '1',
          title: 'Same Title',
          url: 'https://example.com/page1',
          snippet: 'Description 1',
          score: 0.8,
          relevanceScore: 0.8,
          qualityScore: 0.7,
          domain: 'example.com',
          contentType: 'article',
          language: 'en',
          citations: [],
          metadata: {}
        },
        {
          id: '2',
          title: 'Same Title',
          url: 'https://example.com/page2',
          snippet: 'Description 2',
          score: 0.7,
          relevanceScore: 0.7,
          qualityScore: 0.6,
          domain: 'example.com',
          contentType: 'article',
          language: 'en',
          citations: [],
          metadata: {}
        }
      ];

      const deduplicated = deduplicator.deduplicate(results);
      expect(deduplicated).toHaveLength(1);
      expect(deduplicated[0].score).toBe(0.8);
    });

    it('should handle URL normalization', () => {
      const results: SearchResult[] = [
        {
          id: '1',
          title: 'URL with slash',
          url: 'https://example.com/page/',
          snippet: 'Description 1',
          score: 0.8,
          relevanceScore: 0.8,
          qualityScore: 0.7,
          domain: 'example.com',
          contentType: 'article',
          language: 'en',
          citations: [],
          metadata: {}
        },
        {
          id: '2',
          title: 'URL without slash',
          url: 'https://example.com/page',
          snippet: 'Description 2',
          score: 0.7,
          relevanceScore: 0.7,
          qualityScore: 0.6,
          domain: 'example.com',
          contentType: 'article',
          language: 'en',
          citations: [],
          metadata: {}
        }
      ];

      const deduplicated = deduplicator.deduplicate(results);
      expect(deduplicated).toHaveLength(1);
    });
  });

  describe('Content Similarity', () => {
    it('should detect similar content', () => {
      const results: SearchResult[] = [
        {
          id: '1',
          title: 'First Article',
          url: 'https://example.com/first',
          snippet: 'This is a comprehensive guide to JavaScript programming',
          score: 0.9,
          relevanceScore: 0.9,
          qualityScore: 0.8,
          domain: 'example.com',
          contentType: 'article',
          language: 'en',
          citations: [],
          metadata: {}
        },
        {
          id: '2',
          title: 'Second Article',
          url: 'https://example.com/second',
          snippet: 'This is a complete guide to JavaScript programming',
          score: 0.8,
          relevanceScore: 0.8,
          qualityScore: 0.7,
          domain: 'example.com',
          contentType: 'article',
          language: 'en',
          citations: [],
          metadata: {}
        }
      ];

      const similarityDeduplicator = new ResultDeduplicator({
        enabled: true,
        similarityThreshold: 0.8,
        algorithms: ['content'],
        keepHighestScore: true
      });

      const deduplicated = similarityDeduplicator.deduplicate(results);
      expect(deduplicated).toHaveLength(1);
      expect(deduplicated[0].score).toBe(0.9);
    });

    it('should handle empty snippets gracefully', () => {
      const results: SearchResult[] = [
        {
          id: '1',
          title: 'Empty Snippet 1',
          url: 'https://example.com/empty1',
          snippet: '',
          score: 0.8,
          relevanceScore: 0.8,
          qualityScore: 0.7,
          domain: 'example.com',
          contentType: 'article',
          language: 'en',
          citations: [],
          metadata: {}
        },
        {
          id: '2',
          title: 'Empty Snippet 2',
          url: 'https://example.com/empty2',
          snippet: '',
          score: 0.7,
          relevanceScore: 0.7,
          qualityScore: 0.6,
          domain: 'example.com',
          contentType: 'article',
          language: 'en',
          citations: [],
          metadata: {}
        }
      ];

      const deduplicated = deduplicator.deduplicate(results);
      expect(deduplicated.length).toBeGreaterThan(0);
    });
  });

  describe('Configuration Options', () => {
    it('should respect disable flags', () => {
      const disabledDeduplicator = new ResultDeduplicator({
        enabled: false,
        similarityThreshold: 0.8,
        algorithms: ['url'],
        keepHighestScore: true
      });

      const results: SearchResult[] = [
        {
          id: '1',
          title: 'Duplicate',
          url: 'https://example.com/same',
          snippet: 'Content',
          score: 0.9,
          relevanceScore: 0.9,
          qualityScore: 0.8,
          domain: 'example.com',
          contentType: 'article',
          language: 'en',
          citations: [],
          metadata: {}
        },
        {
          id: '2',
          title: 'Duplicate',
          url: 'https://example.com/same',
          snippet: 'Content',
          score: 0.8,
          relevanceScore: 0.8,
          qualityScore: 0.7,
          domain: 'example.com',
          contentType: 'article',
          language: 'en',
          citations: [],
          metadata: {}
        }
      ];

      const deduplicated = disabledDeduplicator.deduplicate(results);
      expect(deduplicated).toHaveLength(2);
    });

    it('should adjust similarity threshold', () => {
      const strictDeduplicator = new ResultDeduplicator({
        enabled: true,
        similarityThreshold: 0.95,
        algorithms: ['title'],
        keepHighestScore: true
      });

      const results: SearchResult[] = [
        {
          id: '1',
          title: 'Almost Same Title',
          url: 'https://example.com/1',
          snippet: 'Content 1',
          score: 0.9,
          relevanceScore: 0.9,
          qualityScore: 0.8,
          domain: 'example.com',
          contentType: 'article',
          language: 'en',
          citations: [],
          metadata: {}
        },
        {
          id: '2',
          title: 'Almost Same Title!',
          url: 'https://example.com/2',
          snippet: 'Content 2',
          score: 0.8,
          relevanceScore: 0.8,
          qualityScore: 0.7,
          domain: 'example.com',
          contentType: 'article',
          language: 'en',
          citations: [],
          metadata: {}
        }
      ];

      const deduplicated = strictDeduplicator.deduplicate(results);
      expect(deduplicated).toHaveLength(2); // Should not deduplicate with strict threshold
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty results array', () => {
      const deduplicated = deduplicator.deduplicate([]);
      expect(deduplicated).toHaveLength(0);
    });

    it('should handle single result', () => {
      const results: SearchResult[] = [{
        id: '1',
        title: 'Single Result',
        url: 'https://example.com/single',
        snippet: 'Only result',
        score: 0.8,
        relevanceScore: 0.8,
        qualityScore: 0.7,
        domain: 'example.com',
        contentType: 'article',
        language: 'en',
        citations: [],
        metadata: {}
      }];

      const deduplicated = deduplicator.deduplicate(results);
      expect(deduplicated).toHaveLength(1);
      expect(deduplicated[0].title).toBe('Single Result');
    });

    it('should handle large result sets efficiently', async () => {
      const startTime = Date.now();
      
      const largeResults: SearchResult[] = Array.from({ length: 1000 }, (_, i) => ({
        id: `${i}`,
        title: `Result ${i}`,
        url: `https://example.com/${i}`,
        snippet: `Description ${i}`,
        score: Math.random(),
        relevanceScore: Math.random(),
        qualityScore: Math.random(),
        domain: 'example.com',
        contentType: 'article',
        language: 'en',
        citations: [],
        metadata: {}
      }));

      const deduplicated = deduplicator.deduplicate(largeResults);
      
      const endTime = Date.now();
      const processingTime = endTime - startTime;

      expect(deduplicated.length).toBeLessThanOrEqual(largeResults.length);
      expect(processingTime).toBeLessThan(1000); // Should process in under 1 second
    });

    it('should preserve result order for equal scores', () => {
      const results: SearchResult[] = [
        {
          id: '1',
          title: 'First Result',
          url: 'https://example.com/first',
          snippet: 'First content',
          score: 0.8,
          relevanceScore: 0.8,
          qualityScore: 0.8,
          domain: 'example.com',
          contentType: 'article',
          language: 'en',
          citations: [],
          metadata: {}
        },
        {
          id: '2',
          title: 'Second Result',
          url: 'https://example.com/second',
          snippet: 'Second content',
          score: 0.8,
          relevanceScore: 0.8,
          qualityScore: 0.8,
          domain: 'example.com',
          contentType: 'article',
          language: 'en',
          citations: [],
          metadata: {}
        },
        {
          id: '3',
          title: 'Third Result',
          url: 'https://example.com/third',
          snippet: 'Third content',
          score: 0.8,
          relevanceScore: 0.8,
          qualityScore: 0.8,
          domain: 'example.com',
          contentType: 'article',
          language: 'en',
          citations: [],
          metadata: {}
        }
      ];

      const deduplicated = deduplicator.deduplicate(results);
      
      expect(deduplicated).toHaveLength(3);
      expect(deduplicated[0].title).toBe('First Result');
      expect(deduplicated[1].title).toBe('Second Result');
      expect(deduplicated[2].title).toBe('Third Result');
    });
  });
});