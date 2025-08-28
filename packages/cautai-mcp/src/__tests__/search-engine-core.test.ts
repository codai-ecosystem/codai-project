import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock external dependencies first
vi.mock('../search/adapters/duckduckgo', () => ({
  DuckDuckGoAdapter: vi.fn().mockImplementation(() => ({
    name: 'duckduckgo',
    search: vi.fn(),
    isAvailable: vi.fn().mockReturnValue(true),
    getConfig: vi.fn().mockReturnValue({
      enabled: true,
      priority: 2,
      timeout: 10000,
      maxResults: 20,
    }),
  })),
}));

vi.mock('../search/cache', () => ({
  SearchCache: vi.fn().mockImplementation(() => ({
    get: vi.fn().mockReturnValue(null),
    set: vi.fn(),
    clear: vi.fn(),
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
          maxResults: 20,
        },
      },
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Search Execution', () => {
    it('should execute basic search with SearchQuery object', async () => {
      const query: SearchQuery = {
        query: 'test query',
        limit: 10,
        language: 'en',
      };

      const mockResults: SearchResult[] = [
        {
          id: '1',
          title: 'Test Result 1',
          url: 'https://example.com/1',
          snippet: 'Test description 1',
          domain: 'example.com',
          score: 0.95,
          relevanceScore: 0.95,
          qualityScore: 0.9,
          contentType: 'article',
          language: 'en',
          citations: [],
          metadata: {},
        },
      ];

      // Mock the adapter's search method
      const mockAdapter = {
        name: 'duckduckgo',
        search: vi.fn().mockResolvedValue(mockResults),
        isAvailable: vi.fn().mockReturnValue(true),
        getConfig: vi.fn().mockReturnValue({
          enabled: true,
          priority: 2,
          timeout: 10000,
          maxResults: 20,
        }),
      };

      // Replace the adapter
      (searchEngine as any).adapters.set('duckduckgo', mockAdapter);

      const response = await searchEngine.search(query);

      expect(response).toBeDefined();
      expect(response.query).toBe('test query');
      expect(response.results).toHaveLength(1);
      expect(response.results[0]).toMatchObject({
        title: 'Test Result 1',
        url: 'https://example.com/1',
        score: expect.any(Number),
      });
    });

    it('should handle empty search results', async () => {
      const query: SearchQuery = {
        query: 'empty query',
        limit: 10,
      };

      const mockAdapter = {
        name: 'duckduckgo',
        search: vi.fn().mockResolvedValue([]),
        isAvailable: vi.fn().mockReturnValue(true),
        getConfig: vi.fn().mockReturnValue({
          enabled: true,
          priority: 2,
          timeout: 10000,
          maxResults: 20,
        }),
      };

      (searchEngine as any).adapters.set('duckduckgo', mockAdapter);

      const response = await searchEngine.search(query);

      expect(response).toBeDefined();
      expect(response.results).toHaveLength(0);
      expect(response.total).toBe(0);
    });

    it('should reject empty queries', async () => {
      const emptyQuery: SearchQuery = {
        query: '',
      };

      await expect(searchEngine.search(emptyQuery)).rejects.toThrow('Search query cannot be empty');
    });

    it('should handle adapter failures gracefully', async () => {
      const query: SearchQuery = {
        query: 'error query',
      };

      const mockAdapter = {
        name: 'duckduckgo',
        search: vi.fn().mockRejectedValue(new Error('API Error')),
        isAvailable: vi.fn().mockReturnValue(true),
        getConfig: vi.fn().mockReturnValue({
          enabled: true,
          priority: 2,
          timeout: 10000,
          maxResults: 20,
        }),
      };

      (searchEngine as any).adapters.set('duckduckgo', mockAdapter);

      const response = await searchEngine.search(query);
      expect(response.results).toHaveLength(0);
    });

    it('should respect query limit parameter', async () => {
      const query: SearchQuery = {
        query: 'many results',
        limit: 5,
      };

      const mockResults: SearchResult[] = Array.from({ length: 20 }, (_, i) => ({
        id: `${i + 1}`,
        title: `Result ${i + 1}`,
        url: `https://example.com/${i + 1}`,
        snippet: `Description ${i + 1}`,
        domain: 'example.com',
        score: 0.9 - i * 0.05,
        relevanceScore: 0.9 - i * 0.05,
        qualityScore: 0.8,
        contentType: 'article',
        language: 'en',
        citations: [],
        metadata: {},
      }));

      const mockAdapter = {
        name: 'duckduckgo',
        search: vi.fn().mockResolvedValue(mockResults),
        isAvailable: vi.fn().mockReturnValue(true),
        getConfig: vi.fn().mockReturnValue({
          enabled: true,
          priority: 2,
          timeout: 10000,
          maxResults: 20,
        }),
      };

      (searchEngine as any).adapters.set('duckduckgo', mockAdapter);

      const response = await searchEngine.search(query);

      expect(response.results.length).toBeLessThanOrEqual(5);
    });

    it('should handle search with filters', async () => {
      const query: SearchQuery = {
        query: 'filtered query',
        filters: {
          domain: 'example.com',
          contentType: 'article',
        },
      };

      const mockResults: SearchResult[] = [
        {
          id: '1',
          title: 'Filtered Result',
          url: 'https://example.com/filtered',
          snippet: 'Filtered content',
          domain: 'example.com',
          score: 0.9,
          relevanceScore: 0.9,
          qualityScore: 0.9,
          contentType: 'article',
          language: 'en',
          citations: [],
          metadata: {},
        },
      ];

      const mockAdapter = {
        name: 'duckduckgo',
        search: vi.fn().mockResolvedValue(mockResults),
        isAvailable: vi.fn().mockReturnValue(true),
        getConfig: vi.fn().mockReturnValue({
          enabled: true,
          priority: 2,
          timeout: 10000,
          maxResults: 20,
        }),
      };

      (searchEngine as any).adapters.set('duckduckgo', mockAdapter);

      const response = await searchEngine.search(query);

      expect(response.results[0].domain).toBe('example.com');
      expect(response.results[0].contentType).toBe('article');
    });
  });

  describe('Configuration Handling', () => {
    it('should initialize with default configuration', () => {
      const defaultEngine = new CautaiSearchEngine();

      expect(defaultEngine).toBeDefined();
    });

    it('should use custom configuration when provided', () => {
      const customConfig = {
        caching: {
          enabled: false,
          ttl: 1800000,
          maxSize: 500,
          strategy: 'lru' as const,
        },
      };

      const customEngine = new CautaiSearchEngine(customConfig);

      expect(customEngine).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    it('should throw error when no adapters available', async () => {
      const query: SearchQuery = {
        query: 'test query',
      };

      // Clear all adapters
      (searchEngine as any).adapters.clear();

      await expect(searchEngine.search(query)).rejects.toThrow('No search adapters available');
    });

    it('should handle whitespace-only queries', async () => {
      const whitespaceQuery: SearchQuery = {
        query: '   ',
      };

      await expect(searchEngine.search(whitespaceQuery)).rejects.toThrow('Search query cannot be empty');
    });
  });

  describe('Caching Integration', () => {
    it('should use cache when available', async () => {
      const query: SearchQuery = {
        query: 'cached query',
      };

      const cachedResponse = {
        results: [
          {
            id: '1',
            title: 'Cached Result',
            url: 'https://cached.com',
            snippet: 'From cache',
            domain: 'cached.com',
            score: 0.9,
            relevanceScore: 0.9,
            qualityScore: 0.9,
            contentType: 'article',
            language: 'en',
            citations: [],
            metadata: {},
          },
        ],
        total: 1,
        query: 'cached query',
        processingTimeMs: 50,
      };

      const mockCache = {
        get: vi.fn().mockReturnValue(cachedResponse),
        set: vi.fn(),
        clear: vi.fn(),
      };

      (searchEngine as any).cache = mockCache;

      const response = await searchEngine.search(query);

      expect(mockCache.get).toHaveBeenCalled();
      expect(response.results[0].title).toBe('Cached Result');
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
      bm25Weight: 0.6,
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
          domain: 'example.com',
          score: 0.6,
          relevanceScore: 0.6,
          qualityScore: 0.7,
          contentType: 'article',
          language: 'en',
          citations: [],
          metadata: {},
        },
        {
          id: '2',
          title: 'Most Relevant',
          url: 'https://example.com/1',
          snippet: 'Perfect match description',
          domain: 'example.com',
          score: 0.9,
          relevanceScore: 0.9,
          qualityScore: 0.9,
          contentType: 'article',
          language: 'en',
          citations: [],
          metadata: {},
        },
      ];

      const rankedResults = await ranker.rankResults(results, 'test query');

      expect(rankedResults).toHaveLength(2);
      expect(rankedResults[0].score).toBeGreaterThanOrEqual(rankedResults[1].score);
    });

    it('should handle empty results gracefully', async () => {
      const rankedResults = await ranker.rankResults([], 'test query');

      expect(rankedResults).toHaveLength(0);
      expect(Array.isArray(rankedResults)).toBe(true);
    });

    it('should handle results with identical scores', async () => {
      const results: SearchResult[] = [
        {
          id: '1',
          title: 'Article A',
          url: 'https://example.com/a',
          snippet: 'Description A',
          domain: 'example.com',
          score: 0.8,
          relevanceScore: 0.8,
          qualityScore: 0.8,
          contentType: 'article',
          language: 'en',
          citations: [],
          metadata: {},
        },
        {
          id: '2',
          title: 'Article B',
          url: 'https://example.com/b',
          snippet: 'Description B',
          domain: 'example.com',
          score: 0.8,
          relevanceScore: 0.8,
          qualityScore: 0.8,
          contentType: 'article',
          language: 'en',
          citations: [],
          metadata: {},
        },
      ];

      const rankedResults = await ranker.rankResults(results, 'article');

      expect(rankedResults).toHaveLength(2);
      expect(rankedResults.every((r: SearchResult) => typeof r.score === 'number')).toBe(true);
    });

    it('should apply BM25 scoring for text matching', async () => {
      const results: SearchResult[] = [
        {
          id: '1',
          title: 'JavaScript Programming Guide',
          url: 'https://example.com/js',
          snippet: 'Complete guide to JavaScript programming and development',
          domain: 'example.com',
          score: 0.5,
          relevanceScore: 0.5,
          qualityScore: 0.8,
          contentType: 'article',
          language: 'en',
          citations: [],
          metadata: {},
        },
        {
          id: '2',
          title: 'Python Tutorial',
          url: 'https://example.com/python',
          snippet: 'Learn Python programming basics',
          domain: 'example.com',
          score: 0.5,
          relevanceScore: 0.5,
          qualityScore: 0.8,
          contentType: 'article',
          language: 'en',
          citations: [],
          metadata: {},
        },
      ];

      const jsRanked = await ranker.rankResults([...results], 'JavaScript programming');

      expect(jsRanked).toHaveLength(2);
      // JavaScript article should rank higher for JavaScript query
      expect(jsRanked[0].title).toContain('JavaScript');
    });

    it('should handle results with missing content gracefully', async () => {
      const results: SearchResult[] = [
        {
          id: '1',
          title: '',
          url: 'https://example.com/empty',
          snippet: '',
          domain: 'example.com',
          score: 0.5,
          relevanceScore: 0.5,
          qualityScore: 0.5,
          contentType: 'article',
          language: 'en',
          citations: [],
          metadata: {},
        },
      ];

      const rankedResults = await ranker.rankResults(results, 'test query');

      expect(rankedResults).toHaveLength(1);
      expect(typeof rankedResults[0].score).toBe('number');
    });
  });

  describe('Configuration Handling', () => {
    it('should use default parameters when not provided', () => {
      const defaultRanker = new HybridRankingEngine();

      expect(defaultRanker).toBeDefined();
    });

    it('should apply custom configuration parameters', () => {
      const customRanker = new HybridRankingEngine({
        k1: 2.0,
        b: 0.5,
        semanticWeight: 0.3,
        bm25Weight: 0.7,
      });

      expect(customRanker).toBeDefined();
    });

    it('should handle edge case parameter values', () => {
      const edgeCaseRanker = new HybridRankingEngine({
        k1: 0, // Minimum value
        b: 1, // Maximum value
        semanticWeight: 0,
        bm25Weight: 1,
      });

      expect(edgeCaseRanker).toBeDefined();
    });
  });

  describe('Performance and Edge Cases', () => {
    it('should handle large result sets efficiently', async () => {
      const largeResults: SearchResult[] = Array.from({ length: 1000 }, (_, i) => ({
        id: `${i}`,
        title: `Result ${i}`,
        url: `https://example.com/${i}`,
        snippet: `Description for result ${i}`,
        domain: 'example.com',
        score: Math.random(),
        relevanceScore: Math.random(),
        qualityScore: Math.random(),
        contentType: 'article',
        language: 'en',
        citations: [],
        metadata: {},
      }));

      const startTime = Date.now();
      const rankedResults = await ranker.rankResults(largeResults, 'test query');
      const endTime = Date.now();

      expect(rankedResults).toHaveLength(1000);
      expect(endTime - startTime).toBeLessThan(1000); // Should complete within 1 second
    });

    it('should handle special characters in queries', async () => {
      const results: SearchResult[] = [
        {
          id: '1',
          title: 'Special Characters: !@#$%^&*()',
          url: 'https://example.com/special',
          snippet: 'Content with special chars',
          domain: 'example.com',
          score: 0.8,
          relevanceScore: 0.8,
          qualityScore: 0.8,
          contentType: 'article',
          language: 'en',
          citations: [],
          metadata: {},
        },
      ];

      const rankedResults = await ranker.rankResults(results, 'special !@# characters');

      expect(rankedResults).toHaveLength(1);
      expect(typeof rankedResults[0].score).toBe('number');
    });
  });
});

describe('ResultDeduplicator', () => {
  let deduplicator: ResultDeduplicator;

  beforeEach(() => {
    deduplicator = new ResultDeduplicator({
      enabled: true,
      similarityThreshold: 0.6, // Lower threshold for easier matching
      algorithms: ['url', 'title'], // Only URL and title, not content or semantic
      keepHighestScore: true,
    });
  });

  describe('URL Deduplication', () => {
    it('should remove duplicate URLs', () => {
      const results: SearchResult[] = [
        {
          id: '1',
          title: 'Identical Title For Testing',
          url: 'https://example.com/page',
          snippet: 'Identical content for testing deduplication',
          domain: 'example.com',
          score: 0.9,
          relevanceScore: 0.9,
          qualityScore: 0.9,
          contentType: 'article',
          language: 'en',
          citations: [],
          metadata: {},
        },
        {
          id: '2',
          title: 'Identical Title For Testing', // Same title
          url: 'https://example.com/page', // Exact same URL
          snippet: 'Identical content for testing deduplication', // Same content
          domain: 'example.com',
          score: 0.7,
          relevanceScore: 0.7,
          qualityScore: 0.7,
          contentType: 'article',
          language: 'en',
          citations: [],
          metadata: {},
        },
        {
          id: '3',
          title: 'Unique Result',
          url: 'https://example.com/unique',
          snippet: 'Unique content',
          domain: 'example.com',
          score: 0.8,
          relevanceScore: 0.8,
          qualityScore: 0.8,
          contentType: 'article',
          language: 'en',
          citations: [],
          metadata: {},
        },
      ];

      const deduplicated = deduplicator.deduplicate(results);

      // Should remove one duplicate (exact URL match = 1.0 similarity)
      expect(deduplicated).toHaveLength(2);
      expect(deduplicated.find((r: SearchResult) => r.url === 'https://example.com/page')?.score).toBe(0.9);
      expect(deduplicated.find((r: SearchResult) => r.url === 'https://example.com/unique')).toBeDefined();
    });

    it('should handle identical titles', () => {
      const results: SearchResult[] = [
        {
          id: '1',
          title: 'Identical Title',
          url: 'https://example.com/same-path',
          snippet: 'Description 1',
          domain: 'example.com',
          score: 0.9,
          relevanceScore: 0.9,
          qualityScore: 0.9,
          contentType: 'article',
          language: 'en',
          citations: [],
          metadata: {},
        },
        {
          id: '2',
          title: 'Identical Title', // Exact same title
          url: 'https://example.com/same-path', // Similar URL
          snippet: 'Description 2',
          domain: 'example.com',
          score: 0.7,
          relevanceScore: 0.7,
          qualityScore: 0.7,
          contentType: 'article',
          language: 'en',
          citations: [],
          metadata: {},
        },
      ];

      const deduplicated = deduplicator.deduplicate(results);

      // Should remove one duplicate (exact title match = 1.0 similarity)
      expect(deduplicated).toHaveLength(1);
      expect(deduplicated[0].score).toBe(0.9);
    });

    it('should handle URL normalization', () => {
      const results: SearchResult[] = [
        {
          id: '1',
          title: 'URL with slash',
          url: 'https://example.com/page/',
          snippet: 'Description 1',
          domain: 'example.com',
          score: 0.8,
          relevanceScore: 0.8,
          qualityScore: 0.8,
          contentType: 'article',
          language: 'en',
          citations: [],
          metadata: {},
        },
        {
          id: '2',
          title: 'URL without slash',
          url: 'https://example.com/page',
          snippet: 'Description 2',
          domain: 'example.com',
          score: 0.9,
          relevanceScore: 0.9,
          qualityScore: 0.9,
          contentType: 'article',
          language: 'en',
          citations: [],
          metadata: {},
        },
      ];

      const deduplicated = deduplicator.deduplicate(results);

      // URLs are similar enough (0.95 > 0.8 threshold) to be considered duplicates
      expect(deduplicated).toHaveLength(1);
      expect(deduplicated[0].score).toBe(0.9); // Highest score preserved
    });
  });

  describe('Content Similarity', () => {
    it('should detect similar content', () => {
      const results: SearchResult[] = [
        {
          id: '1',
          title: 'JavaScript Programming Guide',
          url: 'https://example.com/js-guide',
          snippet: 'This is a comprehensive guide to learning JavaScript programming',
          domain: 'example.com',
          score: 0.9,
          relevanceScore: 0.9,
          qualityScore: 0.9,
          contentType: 'article',
          language: 'en',
          citations: [],
          metadata: {},
        },
        {
          id: '2',
          title: 'JavaScript Programming Guide', // Identical title
          url: 'https://example.com/js-guide', // Identical URL
          snippet: 'This is a comprehensive guide to learning JavaScript programming', // Identical content
          domain: 'example.com',
          score: 0.8,
          relevanceScore: 0.8,
          qualityScore: 0.8,
          contentType: 'article',
          language: 'en',
          citations: [],
          metadata: {},
        },
      ];

      const deduplicated = deduplicator.deduplicate(results);

      // Should remove duplicate due to identical content (1.0 similarity)
      expect(deduplicated).toHaveLength(1);
      expect(deduplicated[0].score).toBe(0.9);
    });

    it('should handle empty snippets gracefully', () => {
      const results: SearchResult[] = [
        {
          id: '1',
          title: 'Article 1',
          url: 'https://example.com/1',
          snippet: '',
          domain: 'example.com',
          score: 0.9,
          relevanceScore: 0.9,
          qualityScore: 0.9,
          contentType: 'article',
          language: 'en',
          citations: [],
          metadata: {},
        },
        {
          id: '2',
          title: 'Article 2',
          url: 'https://example.com/2',
          snippet: '',
          domain: 'example.com',
          score: 0.8,
          relevanceScore: 0.8,
          qualityScore: 0.8,
          contentType: 'article',
          language: 'en',
          citations: [],
          metadata: {},
        },
      ];

      expect(() => deduplicator.deduplicate(results)).not.toThrow();
      const deduplicated = deduplicator.deduplicate(results);
      expect(deduplicated.length).toBeGreaterThan(0);
    });
  });

  describe('Configuration Options', () => {
    it('should respect disable flags', () => {
      const noDeduplicationConfig = new ResultDeduplicator({
        enabled: false, // Disabled
        similarityThreshold: 0.8,
        algorithms: ['url', 'title', 'content'],
        keepHighestScore: true,
      });

      const results: SearchResult[] = [
        {
          id: '1',
          title: 'Same Title',
          url: 'https://example.com/same',
          snippet: 'Same description',
          domain: 'example.com',
          score: 0.9,
          relevanceScore: 0.9,
          qualityScore: 0.9,
          contentType: 'article',
          language: 'en',
          citations: [],
          metadata: {},
        },
        {
          id: '2',
          title: 'Same Title',
          url: 'https://example.com/same',
          snippet: 'Same description',
          domain: 'example.com',
          score: 0.8,
          relevanceScore: 0.8,
          qualityScore: 0.8,
          contentType: 'article',
          language: 'en',
          citations: [],
          metadata: {},
        },
      ];

      const deduplicated = noDeduplicationConfig.deduplicate(results);

      expect(deduplicated).toHaveLength(2); // No deduplication should occur
    });

    it('should adjust similarity threshold', () => {
      const strictDeduplicator = new ResultDeduplicator({
        enabled: true,
        similarityThreshold: 0.99, // Very strict threshold
        algorithms: ['url', 'title', 'content'],
        keepHighestScore: true,
      });

      const results: SearchResult[] = [
        {
          id: '1',
          title: 'Similar Title A',
          url: 'https://example.com/1',
          snippet: 'Similar content A',
          domain: 'example.com',
          score: 0.9,
          relevanceScore: 0.9,
          qualityScore: 0.9,
          contentType: 'article',
          language: 'en',
          citations: [],
          metadata: {},
        },
        {
          id: '2',
          title: 'Similar Title B',
          url: 'https://example.com/2',
          snippet: 'Similar content B',
          domain: 'example.com',
          score: 0.8,
          relevanceScore: 0.8,
          qualityScore: 0.8,
          contentType: 'article',
          language: 'en',
          citations: [],
          metadata: {},
        },
      ];

      const deduplicated = strictDeduplicator.deduplicate(results);

      // Both should remain due to strict threshold (similarity < 0.99)
      expect(deduplicated).toHaveLength(2);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty results array', () => {
      const deduplicated = deduplicator.deduplicate([]);

      expect(deduplicated).toHaveLength(0);
      expect(Array.isArray(deduplicated)).toBe(true);
    });

    it('should handle single result', () => {
      const results: SearchResult[] = [
        {
          id: '1',
          title: 'Single Result',
          url: 'https://example.com/single',
          snippet: 'Only result',
          domain: 'example.com',
          score: 0.8,
          relevanceScore: 0.8,
          qualityScore: 0.8,
          contentType: 'article',
          language: 'en',
          citations: [],
          metadata: {},
        },
      ];

      const deduplicated = deduplicator.deduplicate(results);

      expect(deduplicated).toHaveLength(1);
      expect(deduplicated[0]).toEqual(results[0]);
    });

    it('should handle large result sets efficiently', () => {
      const largeResults: SearchResult[] = Array.from({ length: 500 }, (_, i) => ({
        id: `${i}`,
        title: `Completely Different Result Title Number ${i} With Extra Unique Content`,
        url: `https://unique-domain-${i}.example${i}.com/path/${i}/sub/${i}`,
        snippet: `This is a very unique description for result number ${i} with specific content about topic ${i} that makes it completely different from all other results`,
        domain: `unique-domain-${i}.example${i}.com`,
        score: 0.8 + (i * 0.001), // Slightly different scores
        relevanceScore: 0.8 + (i * 0.001),
        qualityScore: 0.8 + (i * 0.001),
        contentType: 'article',
        language: 'en',
        citations: [],
        metadata: {},
      }));

      const startTime = Date.now();
      const deduplicated = deduplicator.deduplicate(largeResults);
      const endTime = Date.now();

      expect(deduplicated.length).toBeGreaterThan(300); // Most should be unique
      expect(deduplicated.length).toBeLessThanOrEqual(500); // Can't be more than input
      expect(endTime - startTime).toBeLessThan(1000); // Should complete within 1 second
    });

    it('should preserve result order for equal scores', () => {
      const results: SearchResult[] = [
        {
          id: '1',
          title: 'First Result',
          url: 'https://example.com/1',
          snippet: 'Description 1',
          domain: 'example.com',
          score: 0.8,
          relevanceScore: 0.8,
          qualityScore: 0.8,
          contentType: 'article',
          language: 'en',
          citations: [],
          metadata: {},
        },
        {
          id: '2',
          title: 'Second Result',
          url: 'https://example.com/2',
          snippet: 'Description 2',
          domain: 'example.com',
          score: 0.8,
          relevanceScore: 0.8,
          qualityScore: 0.8,
          contentType: 'article',
          language: 'en',
          citations: [],
          metadata: {},
        },
      ];

      const deduplicated = deduplicator.deduplicate(results);

      expect(deduplicated).toHaveLength(2);
      expect(deduplicated[0].id).toBe('1'); // First result preserved first
    });
  });
});