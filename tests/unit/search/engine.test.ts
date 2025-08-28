import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CautaiSearchEngine } from '../../../packages/cautai-core/src/search/engine.js';
import { HybridRankingEngine } from '../../../packages/cautai-core/src/search/ranking.js';
import { DuckDuckGoAdapter } from '../../../packages/cautai-core/src/search/adapters/duckduckgo.js';
import { MockSearchEngine } from '../../helpers/mocks/search-engine.js';
import type { SearchOptions, SearchResult } from '../../../packages/cautai-core/src/search/types.js';

describe('CautaiSearchEngine', () => {
  let searchEngine: CautaiSearchEngine;
  let mockRanking: HybridRankingEngine;
  let mockAdapter: DuckDuckGoAdapter;

  beforeEach(() => {
    // Create mocks
    mockRanking = {
      rank: vi.fn().mockResolvedValue([]),
      calculateRelevance: vi.fn().mockReturnValue(0.8)
    } as any;

    mockAdapter = {
      search: vi.fn().mockResolvedValue([]),
      name: 'mock-adapter'
    } as any;

    searchEngine = new CautaiSearchEngine({
      ranking: mockRanking,
      adapters: [mockAdapter]
    });
  });

  describe('search', () => {
    it('should perform basic search successfully', async () => {
      const mockResults: SearchResult[] = [
        {
          id: '1',
          title: 'Test Result',
          url: 'https://example.com',
          snippet: 'Test snippet',
          relevance: 0.9,
          source: 'test',
          timestamp: new Date()
        }
      ];

      mockAdapter.search = vi.fn().mockResolvedValue(mockResults);
      mockRanking.rank = vi.fn().mockResolvedValue(mockResults);

      const options: SearchOptions = {
        query: 'test query',
        limit: 10,
        language: 'en'
      };

      const results = await searchEngine.search(options);

      expect(results.results).toHaveLength(1);
      expect(results.results[0]).toEqual(mockResults[0]);
      expect(results.query).toBe('test query');
      expect(results.processingTime).toBeGreaterThan(0);
      expect(mockAdapter.search).toHaveBeenCalledWith(options);
      expect(mockRanking.rank).toHaveBeenCalledWith(mockResults, options);
    });

    it('should handle multiple adapters', async () => {
      const adapter1Results: SearchResult[] = [
        {
          id: '1',
          title: 'Result 1',
          url: 'https://example1.com',
          snippet: 'Snippet 1',
          relevance: 0.9,
          source: 'adapter1',
          timestamp: new Date()
        }
      ];

      const adapter2Results: SearchResult[] = [
        {
          id: '2',
          title: 'Result 2',
          url: 'https://example2.com',
          snippet: 'Snippet 2',
          relevance: 0.8,
          source: 'adapter2',
          timestamp: new Date()
        }
      ];

      const secondAdapter = {
        search: vi.fn().mockResolvedValue(adapter2Results),
        name: 'second-adapter'
      };

      const multiAdapterEngine = new CautaiSearchEngine({
        ranking: mockRanking,
        adapters: [mockAdapter, secondAdapter]
      });

      mockAdapter.search = vi.fn().mockResolvedValue(adapter1Results);
      mockRanking.rank = vi.fn().mockResolvedValue([...adapter1Results, ...adapter2Results]);

      const results = await multiAdapterEngine.search({
        query: 'test query',
        limit: 20
      });

      expect(mockAdapter.search).toHaveBeenCalled();
      expect(secondAdapter.search).toHaveBeenCalled();
      expect(results.results).toHaveLength(2);
    });

    it('should handle search with filters', async () => {
      const mockResults: SearchResult[] = [
        {
          id: '1',
          title: 'Academic Paper',
          url: 'https://scholar.example.com',
          snippet: 'Academic content',
          relevance: 0.9,
          source: 'academic',
          timestamp: new Date()
        }
      ];

      mockAdapter.search = vi.fn().mockResolvedValue(mockResults);
      mockRanking.rank = vi.fn().mockResolvedValue(mockResults);

      const options: SearchOptions = {
        query: 'machine learning',
        limit: 10,
        language: 'en',
        contentType: 'academic',
        dateRange: 'year'
      };

      const results = await searchEngine.search(options);

      expect(mockAdapter.search).toHaveBeenCalledWith(options);
      expect(results.metadata?.filters).toEqual({
        contentType: 'academic',
        dateRange: 'year'
      });
    });

    it('should handle empty results', async () => {
      mockAdapter.search = vi.fn().mockResolvedValue([]);
      mockRanking.rank = vi.fn().mockResolvedValue([]);

      const results = await searchEngine.search({
        query: 'nonexistent query'
      });

      expect(results.results).toHaveLength(0);
      expect(results.total).toBe(0);
      expect(results.hasMore).toBe(false);
    });

    it('should handle adapter errors gracefully', async () => {
      mockAdapter.search = vi.fn().mockRejectedValue(new Error('Adapter failed'));
      
      const results = await searchEngine.search({
        query: 'test query'
      });

      expect(results.results).toHaveLength(0);
      expect(results.error).toBeDefined();
    });

    it('should deduplicate results', async () => {
      const duplicateResults: SearchResult[] = [
        {
          id: '1',
          title: 'Same Result',
          url: 'https://example.com',
          snippet: 'Same content',
          relevance: 0.9,
          source: 'adapter1',
          timestamp: new Date()
        },
        {
          id: '2',
          title: 'Same Result',
          url: 'https://example.com', // Same URL
          snippet: 'Same content',
          relevance: 0.8,
          source: 'adapter2',
          timestamp: new Date()
        }
      ];

      mockAdapter.search = vi.fn().mockResolvedValue(duplicateResults);
      mockRanking.rank = vi.fn().mockResolvedValue([duplicateResults[0]]); // Should deduplicate

      const results = await searchEngine.search({
        query: 'test query'
      });

      expect(results.results).toHaveLength(1);
      expect(results.results[0].url).toBe('https://example.com');
    });

    it('should respect limit parameter', async () => {
      const manyResults: SearchResult[] = Array.from({ length: 50 }, (_, i) => ({
        id: `${i + 1}`,
        title: `Result ${i + 1}`,
        url: `https://example${i + 1}.com`,
        snippet: `Snippet ${i + 1}`,
        relevance: 0.9 - (i * 0.01),
        source: 'test',
        timestamp: new Date()
      }));

      mockAdapter.search = vi.fn().mockResolvedValue(manyResults);
      mockRanking.rank = vi.fn().mockResolvedValue(manyResults);

      const results = await searchEngine.search({
        query: 'test query',
        limit: 10
      });

      expect(results.results).toHaveLength(10);
      expect(results.hasMore).toBe(true);
      expect(results.total).toBe(50);
    });

    it('should handle pagination', async () => {
      const allResults: SearchResult[] = Array.from({ length: 25 }, (_, i) => ({
        id: `${i + 1}`,
        title: `Result ${i + 1}`,
        url: `https://example${i + 1}.com`,
        snippet: `Snippet ${i + 1}`,
        relevance: 0.9 - (i * 0.01),
        source: 'test',
        timestamp: new Date()
      }));

      mockAdapter.search = vi.fn().mockResolvedValue(allResults);
      mockRanking.rank = vi.fn().mockResolvedValue(allResults);

      const firstPage = await searchEngine.search({
        query: 'test query',
        limit: 10,
        offset: 0
      });

      const secondPage = await searchEngine.search({
        query: 'test query',
        limit: 10,
        offset: 10
      });

      expect(firstPage.results).toHaveLength(10);
      expect(secondPage.results).toHaveLength(10);
      expect(firstPage.results[0].id).toBe('1');
      expect(secondPage.results[0].id).toBe('11');
    });

    it('should measure and report processing time', async () => {
      const mockResults: SearchResult[] = [
        {
          id: '1',
          title: 'Test Result',
          url: 'https://example.com',
          snippet: 'Test snippet',
          relevance: 0.9,
          source: 'test',
          timestamp: new Date()
        }
      ];

      // Simulate slow adapter
      mockAdapter.search = vi.fn().mockImplementation(async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
        return mockResults;
      });
      mockRanking.rank = vi.fn().mockResolvedValue(mockResults);

      const results = await searchEngine.search({
        query: 'test query'
      });

      expect(results.processingTime).toBeGreaterThan(100);
      expect(results.processingTime).toBeLessThan(1000); // Reasonable upper bound
    });

    it('should handle language-specific searches', async () => {
      const romanianResults: SearchResult[] = [
        {
          id: '1',
          title: 'Rezultat în română',
          url: 'https://example.ro',
          snippet: 'Conținut în limba română',
          relevance: 0.9,
          source: 'test',
          timestamp: new Date()
        }
      ];

      mockAdapter.search = vi.fn().mockResolvedValue(romanianResults);
      mockRanking.rank = vi.fn().mockResolvedValue(romanianResults);

      const results = await searchEngine.search({
        query: 'căutare în română',
        language: 'ro'
      });

      expect(mockAdapter.search).toHaveBeenCalledWith({
        query: 'căutare în română',
        language: 'ro'
      });
      expect(results.results[0].title).toBe('Rezultat în română');
    });
  });

  describe('performance', () => {
    it('should handle concurrent searches', async () => {
      const mockResults: SearchResult[] = [
        {
          id: '1',
          title: 'Concurrent Result',
          url: 'https://example.com',
          snippet: 'Concurrent snippet',
          relevance: 0.9,
          source: 'test',
          timestamp: new Date()
        }
      ];

      mockAdapter.search = vi.fn().mockResolvedValue(mockResults);
      mockRanking.rank = vi.fn().mockResolvedValue(mockResults);

      const searches = Array.from({ length: 5 }, (_, i) => 
        searchEngine.search({
          query: `concurrent query ${i}`,
          limit: 10
        })
      );

      const results = await Promise.all(searches);

      expect(results).toHaveLength(5);
      expect(mockAdapter.search).toHaveBeenCalledTimes(5);
      results.forEach(result => {
        expect(result.results).toHaveLength(1);
        expect(result.processingTime).toBeGreaterThan(0);
      });
    });

    it('should timeout long-running searches', async () => {
      mockAdapter.search = vi.fn().mockImplementation(async () => {
        await new Promise(resolve => setTimeout(resolve, 5000)); // 5 second delay
        return [];
      });

      const searchWithTimeout = searchEngine.search({
        query: 'slow query',
        timeout: 1000 // 1 second timeout
      });

      await expect(searchWithTimeout).rejects.toThrow('Search timeout');
    });
  });

  describe('error handling', () => {
    it('should handle network errors', async () => {
      mockAdapter.search = vi.fn().mockRejectedValue(new Error('Network error'));

      const results = await searchEngine.search({
        query: 'test query'
      });

      expect(results.results).toHaveLength(0);
      expect(results.error).toContain('Network error');
    });

    it('should handle ranking errors', async () => {
      const mockResults: SearchResult[] = [
        {
          id: '1',
          title: 'Test Result',
          url: 'https://example.com',
          snippet: 'Test snippet',
          relevance: 0.9,
          source: 'test',
          timestamp: new Date()
        }
      ];

      mockAdapter.search = vi.fn().mockResolvedValue(mockResults);
      mockRanking.rank = vi.fn().mockRejectedValue(new Error('Ranking failed'));

      const results = await searchEngine.search({
        query: 'test query'
      });

      // Should return unranked results
      expect(results.results).toHaveLength(1);
      expect(results.results[0]).toEqual(mockResults[0]);
    });

    it('should validate search options', async () => {
      const invalidOptions = {
        query: '', // Empty query
        limit: -1 // Invalid limit
      };

      await expect(searchEngine.search(invalidOptions as any))
        .rejects.toThrow('Invalid search options');
    });
  });
});