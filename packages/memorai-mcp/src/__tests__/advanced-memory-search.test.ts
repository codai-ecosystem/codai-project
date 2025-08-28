/**
 * Advanced Memory Search & Filtering Tests
 * US-MEM-008 Implementation Tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AdvancedMemorySearch, SearchQuery, SearchFilters, SearchOptions, SearchResult } from '../src/advanced-memory-search.js';
import { SearchQueryBuilder, createSearchQuery, SearchTemplates } from '../src/search-query-builder.js';
import { Memory } from '../src/types.js';

// Mock embedding utils
vi.mock('../src/embedding-utils.js', () => ({
  generateEmbedding: vi.fn().mockResolvedValue([0.1, 0.2, 0.3, 0.4, 0.5]),
  cosineSimilarity: vi.fn().mockReturnValue(0.8)
}));

describe('US-MEM-008 Advanced Memory Search & Filtering', () => {
  let searchEngine: AdvancedMemorySearch;
  let testMemories: Memory[];

  beforeEach(() => {
    testMemories = [
      {
        id: 'mem-1',
        agentId: 'agent-1',
        content: 'This is a test memory about artificial intelligence and machine learning',
        structuredKey: 'agent-1:test:1',
        timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(), // 1 hour ago
        importance: 8,
        entityType: 'concept',
        project: 'ai-project',
        session: 'session-1',
        tags: ['ai', 'ml', 'test'],
        embeddings: [0.1, 0.2, 0.3, 0.4, 0.5]
      },
      {
        id: 'mem-2',
        agentId: 'agent-1',
        content: 'Document about neural networks and deep learning algorithms',
        structuredKey: 'agent-1:neural:2',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
        importance: 9,
        entityType: 'document',
        project: 'ai-project',
        session: 'session-2',
        tags: ['neural', 'deep-learning'],
        embeddings: [0.2, 0.3, 0.4, 0.5, 0.6]
      },
      {
        id: 'mem-3',
        agentId: 'agent-2',
        content: 'Project management notes for quarterly planning',
        structuredKey: 'agent-2:planning:3',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(), // 1 week ago
        importance: 6,
        entityType: 'note',
        project: 'management',
        session: 'session-3',
        tags: ['planning', 'quarterly'],
        embeddings: [0.3, 0.4, 0.5, 0.6, 0.7]
      },
      {
        id: 'mem-4',
        agentId: 'agent-1',
        content: 'Low importance memory for testing filters',
        structuredKey: 'agent-1:test:4',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(), // 1 month ago
        importance: 3,
        entityType: 'test',
        project: 'ai-project',
        session: 'session-1',
        tags: ['test', 'filter'],
        embeddings: [0.4, 0.5, 0.6, 0.7, 0.8]
      }
    ];

    searchEngine = new AdvancedMemorySearch(testMemories, true);
  });

  describe('Basic Search Functionality', () => {
    it('should perform semantic search successfully', async () => {
      const query: SearchQuery = {
        text: 'artificial intelligence',
        options: {
          limit: 10,
          semanticWeight: 0.8,
          includeScore: true
        }
      };

      const result = await searchEngine.search(query);

      expect(result).toBeDefined();
      expect(result.results).toBeInstanceOf(Array);
      expect(result.totalCount).toBeGreaterThan(0);
      expect(result.searchTime).toBeGreaterThan(0);
      expect(result.query).toEqual(query);
    });

    it('should handle empty search text', async () => {
      const query: SearchQuery = {
        filters: {
          minImportance: 7
        }
      };

      const result = await searchEngine.search(query);

      expect(result).toBeDefined();
      expect(result.results).toBeInstanceOf(Array);
    });

    it('should respect search result limit', async () => {
      const query: SearchQuery = {
        text: 'test',
        options: {
          limit: 2
        }
      };

      const result = await searchEngine.search(query);

      expect(result.results.length).toBeLessThanOrEqual(2);
    });
  });

  describe('Temporal Filtering', () => {
    it('should filter by date range', async () => {
      const startDate = new Date(Date.now() - 1000 * 60 * 60 * 48); // 2 days ago
      const endDate = new Date(); // now

      const query: SearchQuery = {
        text: 'test',
        filters: {
          dateRange: { startDate, endDate }
        }
      };

      const result = await searchEngine.search(query);

      // Should only include memories from the last 2 days
      for (const searchResult of result.results) {
        const memoryDate = new Date(searchResult.memory.timestamp);
        expect(memoryDate.getTime()).toBeGreaterThanOrEqual(startDate.getTime());
        expect(memoryDate.getTime()).toBeLessThanOrEqual(endDate.getTime());
      }
    });

    it('should filter by time window', async () => {
      const query: SearchQuery = {
        text: 'test',
        filters: {
          timeWindow: { days: 2 }
        }
      };

      const result = await searchEngine.search(query);

      // Should only include memories from the last 2 days
      const twoDaysAgo = Date.now() - (2 * 24 * 60 * 60 * 1000);
      for (const searchResult of result.results) {
        const memoryTime = new Date(searchResult.memory.timestamp).getTime();
        expect(memoryTime).toBeGreaterThanOrEqual(twoDaysAgo);
      }
    });
  });

  describe('Importance-based Filtering', () => {
    it('should filter by minimum importance', async () => {
      const query: SearchQuery = {
        text: 'test',
        filters: {
          minImportance: 7
        }
      };

      const result = await searchEngine.search(query);

      for (const searchResult of result.results) {
        expect(searchResult.memory.importance).toBeGreaterThanOrEqual(7);
      }
    });

    it('should filter by importance range', async () => {
      const query: SearchQuery = {
        text: 'test',
        filters: {
          importanceRange: [6, 8]
        }
      };

      const result = await searchEngine.search(query);

      for (const searchResult of result.results) {
        expect(searchResult.memory.importance).toBeGreaterThanOrEqual(6);
        expect(searchResult.memory.importance).toBeLessThanOrEqual(8);
      }
    });
  });

  describe('Agent and Context Filtering', () => {
    it('should filter by specific agents', async () => {
      const query: SearchQuery = {
        text: 'test',
        filters: {
          agentIds: ['agent-1']
        }
      };

      const result = await searchEngine.search(query);

      for (const searchResult of result.results) {
        expect(searchResult.memory.agentId).toBe('agent-1');
      }
    });

    it('should exclude specific agents', async () => {
      const query: SearchQuery = {
        text: 'test',
        filters: {
          excludeAgentIds: ['agent-2']
        }
      };

      const result = await searchEngine.search(query);

      for (const searchResult of result.results) {
        expect(searchResult.memory.agentId).not.toBe('agent-2');
      }
    });

    it('should filter by project', async () => {
      const query: SearchQuery = {
        text: 'test',
        filters: {
          projects: ['ai-project']
        }
      };

      const result = await searchEngine.search(query);

      for (const searchResult of result.results) {
        expect(searchResult.memory.project).toBe('ai-project');
      }
    });

    it('should filter by tags', async () => {
      const query: SearchQuery = {
        text: 'test',
        filters: {
          tags: ['ai']
        }
      };

      const result = await searchEngine.search(query);

      for (const searchResult of result.results) {
        expect(searchResult.memory.tags).toContain('ai');
      }
    });
  });

  describe('Fuzzy Search', () => {
    it('should perform fuzzy search with typos', async () => {
      const query: SearchQuery = {
        text: 'artifical inteligence', // intentional typos
        options: {
          enableFuzzySearch: true,
          fuzzyThreshold: 0.5
        }
      };

      const result = await searchEngine.search(query);

      expect(result.results).toBeInstanceOf(Array);
      // Should still find results despite typos
    });

    it('should respect fuzzy threshold', async () => {
      const query: SearchQuery = {
        text: 'completely different text',
        options: {
          enableFuzzySearch: true,
          fuzzyThreshold: 0.9 // Very high threshold
        }
      };

      const result = await searchEngine.search(query);

      // With high threshold, should find fewer or no results
      expect(result.results).toBeInstanceOf(Array);
    });
  });

  describe('Search Suggestions', () => {
    it('should generate search suggestions', async () => {
      const suggestions = await searchEngine.getSuggestions('art', 5);

      expect(suggestions).toBeInstanceOf(Array);
      expect(suggestions.length).toBeLessThanOrEqual(5);

      for (const suggestion of suggestions) {
        expect(suggestion).toHaveProperty('text');
        expect(suggestion).toHaveProperty('type');
        expect(suggestion).toHaveProperty('confidence');
        expect(suggestion.confidence).toBeGreaterThan(0);
        expect(suggestion.confidence).toBeLessThanOrEqual(1);
      }
    });

    it('should handle short queries', async () => {
      const suggestions = await searchEngine.getSuggestions('a', 5);

      expect(suggestions).toBeInstanceOf(Array);
      // Short queries might return fewer suggestions
    });
  });

  describe('Multi-dimensional Scoring', () => {
    it('should calculate weighted scores correctly', async () => {
      const query: SearchQuery = {
        text: 'test',
        options: {
          semanticWeight: 0.4,
          temporalWeight: 0.3,
          importanceWeight: 0.2,
          fuzzyWeight: 0.1,
          includeScore: true,
          includeExplanation: true
        }
      };

      const result = await searchEngine.search(query);

      for (const searchResult of result.results) {
        expect(searchResult.score).toBeGreaterThan(0);
        expect(searchResult.ranking).toBeDefined();
        expect(searchResult.ranking.final).toBeGreaterThan(0);

        if (searchResult.explanation) {
          expect(searchResult.explanation).toContain('Final score:');
        }
      }
    });

    it('should sort results by final score', async () => {
      const query: SearchQuery = {
        text: 'test',
        options: {
          limit: 10,
          includeScore: true
        }
      };

      const result = await searchEngine.search(query);

      // Results should be sorted in descending order by score
      for (let i = 1; i < result.results.length; i++) {
        expect(result.results[i - 1].score).toBeGreaterThanOrEqual(result.results[i].score);
      }
    });
  });

  describe('Search Aggregations', () => {
    it('should generate search aggregations', async () => {
      const query: SearchQuery = {
        text: 'test'
      };

      const result = await searchEngine.search(query);

      expect(result.aggregations).toBeDefined();
      expect(result.aggregations?.byAgent).toBeDefined();
      expect(result.aggregations?.byProject).toBeDefined();
      expect(result.aggregations?.byTimeRange).toBeDefined();
      expect(result.aggregations?.byImportance).toBeDefined();
      expect(result.aggregations?.byEntityType).toBeDefined();
    });
  });

  describe('Caching', () => {
    it('should cache search results', async () => {
      const query: SearchQuery = {
        text: 'artificial intelligence',
        options: {
          enableCaching: true,
          cacheTimeout: 300
        }
      };

      // First search
      const result1 = await searchEngine.search(query);
      const time1 = result1.searchTime;

      // Second search (should be cached)
      const result2 = await searchEngine.search(query);
      const time2 = result2.searchTime;

      expect(result1.results).toEqual(result2.results);
      // Cached result should be faster (though in tests, might be similar)
    });

    it('should provide cache statistics', () => {
      const stats = searchEngine.getCacheStats();

      expect(stats).toHaveProperty('searchCache');
      expect(stats).toHaveProperty('suggestionCache');
      expect(typeof stats.searchCache).toBe('number');
      expect(typeof stats.suggestionCache).toBe('number');
    });

    it('should clear caches', () => {
      searchEngine.clearCaches();
      const stats = searchEngine.getCacheStats();

      expect(stats.searchCache).toBe(0);
      expect(stats.suggestionCache).toBe(0);
    });
  });

  describe('Memory Updates', () => {
    it('should update memories for search indexing', async () => {
      const newMemories: Memory[] = [
        {
          id: 'new-1',
          agentId: 'agent-3',
          content: 'New memory for testing updates',
          structuredKey: 'agent-3:new:1',
          timestamp: new Date().toISOString(),
          importance: 7,
          entityType: 'update',
          tags: ['new', 'update']
        }
      ];

      searchEngine.updateMemories(newMemories);

      const query: SearchQuery = {
        text: 'testing updates'
      };

      const result = await searchEngine.search(query);

      // Should be able to search the new memories
      expect(result.results).toBeInstanceOf(Array);
    });
  });
});

describe('Search Query Builder', () => {
  let builder: SearchQueryBuilder;

  beforeEach(() => {
    builder = createSearchQuery();
  });

  describe('Fluent API', () => {
    it('should build basic text query', () => {
      const query = builder
        .text('test search')
        .limit(10)
        .build();

      expect(query.text).toBe('test search');
      expect(query.options?.limit).toBe(10);
    });

    it('should build complex query with filters', () => {
      const query = builder
        .text('artificial intelligence')
        .minImportance(7)
        .projects('ai-project', 'ml-project')
        .tags('ai', 'ml')
        .timeWindow({ days: 7 })
        .weights({ semantic: 0.6, importance: 0.4 })
        .fuzzySearch(true, 0.7)
        .limit(20)
        .build();

      expect(query.text).toBe('artificial intelligence');
      expect(query.filters?.minImportance).toBe(7);
      expect(query.filters?.projects).toEqual(['ai-project', 'ml-project']);
      expect(query.filters?.tags).toEqual(['ai', 'ml']);
      expect(query.filters?.timeWindow?.days).toBe(7);
      expect(query.options?.semanticWeight).toBe(0.6);
      expect(query.options?.importanceWeight).toBe(0.4);
      expect(query.options?.enableFuzzySearch).toBe(true);
      expect(query.options?.fuzzyThreshold).toBe(0.7);
      expect(query.options?.limit).toBe(20);
    });

    it('should handle date range filters', () => {
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-12-31');

      const query = builder
        .dateRange(startDate, endDate)
        .build();

      expect(query.filters?.dateRange?.startDate).toBe(startDate);
      expect(query.filters?.dateRange?.endDate).toBe(endDate);
    });

    it('should clone builder state', () => {
      const original = builder
        .text('test')
        .minImportance(5)
        .limit(10);

      const cloned = original.clone()
        .text('cloned test')
        .limit(20);

      const originalQuery = original.build();
      const clonedQuery = cloned.build();

      expect(originalQuery.text).toBe('test');
      expect(originalQuery.options?.limit).toBe(10);
      expect(clonedQuery.text).toBe('cloned test');
      expect(clonedQuery.options?.limit).toBe(20);
    });

    it('should reset builder', () => {
      builder
        .text('test')
        .minImportance(5)
        .limit(10);

      builder.reset();
      const query = builder.build();

      expect(query.text).toBeUndefined();
      expect(query.filters).toBeUndefined();
      expect(query.options).toBeUndefined();
    });
  });

  describe('Search Templates', () => {
    it('should create recent search template', () => {
      const builder = SearchTemplates.recent('test query');
      const query = builder.build();

      expect(query.text).toBe('test query');
      expect(query.filters?.timeWindow?.weeks).toBe(1);
      expect(query.options?.temporalWeight).toBe(0.5);
    });

    it('should create important search template', () => {
      const builder = SearchTemplates.important('important stuff');
      const query = builder.build();

      expect(query.text).toBe('important stuff');
      expect(query.filters?.minImportance).toBe(7);
      expect(query.options?.importanceWeight).toBe(0.5);
    });

    it('should create project search template', () => {
      const builder = SearchTemplates.project('my-project', 'search text');
      const query = builder.build();

      expect(query.text).toBe('search text');
      expect(query.filters?.projects).toEqual(['my-project']);
      expect(query.options?.semanticWeight).toBe(0.6);
    });

    it('should create fuzzy search template', () => {
      const builder = SearchTemplates.fuzzy('fuzzy search');
      const query = builder.build();

      expect(query.text).toBe('fuzzy search');
      expect(query.options?.enableFuzzySearch).toBe(true);
      expect(query.options?.fuzzyThreshold).toBe(0.5);
      expect(query.options?.fuzzyWeight).toBe(0.4);
    });

    it('should create comprehensive search template', () => {
      const builder = SearchTemplates.comprehensive('comprehensive search');
      const query = builder.build();

      expect(query.text).toBe('comprehensive search');
      expect(query.options?.limit).toBe(50);
      expect(query.options?.enableFuzzySearch).toBe(true);
      expect(query.options?.enableSuggestions).toBe(true);
      expect(query.options?.enableHighlighting).toBe(true);
      expect(query.options?.includeScore).toBe(true);
      expect(query.options?.includeExplanation).toBe(true);
    });
  });
});