/**
 * Comprehensive tests for Advanced Search Engine
 * Tests semantic search, filtering, fuzzy matching, and search suggestions
 * Part of US-MEM-008 implementation
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { AdvancedSearchEngine } from '../advanced-search-engine';
import { EmbeddingService } from '../embedding-service';
import { Memory, MemoryMetadata } from '../types/memory-types';

// Mock embedding service
const createMockEmbeddingService = () => {
  return {
    isAvailable: vi.fn(() => true),
    generateEmbedding: vi.fn(async (text: string) => {
      // Generate deterministic embedding based on text
      const embedding = new Array(384).fill(0);
      for (let i = 0; i < Math.min(text.length, 384); i++) {
        embedding[i] = text.charCodeAt(i) / 1000;
      }
      return embedding;
    }),
    generateBatchEmbeddings: vi.fn(),
    calculateSimilarity: vi.fn(),
    clearCache: vi.fn(),
    getCacheStats: vi.fn(),
    updateConfig: vi.fn(),
    testConnectivity: vi.fn()
  } as any;
};

// Test data
const createTestMemory = (
  id: string,
  content: string,
  metadata: Partial<MemoryMetadata> = {}
): Memory => ({
  structuredKey: `agent1:${id}`,
  agentId: 'agent1',
  content,
  timestamp: new Date().toISOString(),
  metadata: {
    importance: 5,
    tags: [],
    entityType: 'general',
    ...metadata
  }
});

const testMemories = [
  createTestMemory('1', 'JavaScript is a programming language used for web development', {
    tags: ['javascript', 'programming', 'web'],
    entityType: 'technical',
    importance: 8,
    project: 'web-app'
  }),
  createTestMemory('2', 'Python is excellent for data science and machine learning', {
    tags: ['python', 'data-science', 'ml'],
    entityType: 'technical',
    importance: 9,
    project: 'ml-project'
  }),
  createTestMemory('3', 'React is a library for building user interfaces', {
    tags: ['react', 'javascript', 'frontend'],
    entityType: 'technical',
    importance: 7,
    project: 'web-app'
  }),
  createTestMemory('4', 'Meeting notes from team standup yesterday', {
    tags: ['meeting', 'standup', 'team'],
    entityType: 'meeting',
    importance: 4,
    project: 'general'
  }),
  createTestMemory('5', 'Docker containerization best practices', {
    tags: ['docker', 'containers', 'devops'],
    entityType: 'technical',
    importance: 8,
    project: 'infrastructure'
  })
];

describe('AdvancedSearchEngine', () => {
  let searchEngine: AdvancedSearchEngine;
  let mockEmbeddingService: any;

  beforeEach(async () => {
    mockEmbeddingService = createMockEmbeddingService();
    searchEngine = new AdvancedSearchEngine(mockEmbeddingService);

    // Index test memories
    for (const memory of testMemories) {
      await searchEngine.addToIndex(memory);
    }
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Basic Text Search', () => {
    it('should find memories by exact word match', async () => {
      const results = await searchEngine.search('JavaScript', 'agent1');

      expect(results).toHaveLength(2); // Memory 1 and 3
      expect(results[0].memory.structuredKey).toContain('1');
      expect(results[0].combinedScore).toBeGreaterThan(0);
    });

    it('should find memories by partial content match', async () => {
      const results = await searchEngine.search('programming language', 'agent1');

      expect(results.length).toBeGreaterThan(0);
      expect(results.some(r => r.memory.content.includes('JavaScript'))).toBe(true);
    });

    it('should handle case-insensitive searches', async () => {
      const results1 = await searchEngine.search('javascript', 'agent1');
      const results2 = await searchEngine.search('JAVASCRIPT', 'agent1');

      expect(results1).toHaveLength(results2.length);
      expect(results1[0].memory.structuredKey).toBe(results2[0].memory.structuredKey);
    });
  });

  describe('Semantic Search', () => {
    it('should use embeddings for semantic similarity', async () => {
      const results = await searchEngine.search('web development frameworks', 'agent1', {
        useSemanticSearch: true,
        semanticThreshold: 0.1
      });

      expect(mockEmbeddingService.generateEmbedding).toHaveBeenCalled();
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].semanticScore).toBeDefined();
    });

    it('should fall back gracefully when embeddings fail', async () => {
      mockEmbeddingService.generateEmbedding.mockRejectedValue(new Error('API Error'));

      const results = await searchEngine.search('programming', 'agent1', {
        useSemanticSearch: true
      });

      expect(results.length).toBeGreaterThan(0); // Should still return text matches
    });

    it('should respect semantic threshold', async () => {
      const highThresholdResults = await searchEngine.search('coding', 'agent1', {
        useSemanticSearch: true,
        semanticThreshold: 0.9
      });

      const lowThresholdResults = await searchEngine.search('coding', 'agent1', {
        useSemanticSearch: true,
        semanticThreshold: 0.1
      });

      expect(lowThresholdResults.length).toBeGreaterThanOrEqual(highThresholdResults.length);
    });
  });

  describe('Metadata Search', () => {
    it('should search by tags', async () => {
      const results = await searchEngine.search('javascript', 'agent1', {
        searchFields: ['tags']
      });

      expect(results).toHaveLength(2); // Memory 1 and 3 have javascript tag
      expect(results.every(r => r.memory.metadata?.tags?.includes('javascript'))).toBe(true);
    });

    it('should search by entity type', async () => {
      const results = await searchEngine.search('technical', 'agent1', {
        searchFields: ['entityType']
      });

      expect(results.length).toBe(4); // 4 technical memories
      expect(results.every(r => r.memory.metadata?.entityType === 'technical')).toBe(true);
    });

    it('should search by project', async () => {
      const results = await searchEngine.search('web-app', 'agent1', {
        searchFields: ['project']
      });

      expect(results).toHaveLength(2); // Memory 1 and 3
      expect(results.every(r => r.memory.metadata?.project === 'web-app')).toBe(true);
    });
  });

  describe('Advanced Filtering', () => {
    it('should filter by importance range', async () => {
      const results = await searchEngine.search('', 'agent1', {
        minImportance: 8
      });

      expect(results.length).toBe(3); // Memories with importance >= 8
      expect(results.every(r => (r.memory.metadata?.importance || 0) >= 8)).toBe(true);
    });

    it('should filter by project', async () => {
      const results = await searchEngine.search('', 'agent1', {
        project: 'web-app'
      });

      expect(results).toHaveLength(2);
      expect(results.every(r => r.memory.metadata?.project === 'web-app')).toBe(true);
    });

    it('should combine text search with filtering', async () => {
      const results = await searchEngine.search('programming', 'agent1', {
        minImportance: 8,
        project: 'web-app'
      });

      expect(results).toHaveLength(1); // Only memory 1 matches all criteria
      expect(results[0].memory.content).toContain('JavaScript');
    });
  });

  describe('Fuzzy Search', () => {
    it('should find matches with typos', async () => {
      const results = await searchEngine.search('javascrptt', 'agent1', {
        enableFuzzyMatch: true,
        fuzzyTolerance: 2
      });

      expect(results.length).toBeGreaterThan(0);
      expect(results[0].fuzzyScore).toBeGreaterThan(0);
    });

    it('should respect fuzzy tolerance', async () => {
      const strictResults = await searchEngine.search('javascrptt', 'agent1', {
        enableFuzzyMatch: true,
        fuzzyTolerance: 1
      });

      const lenientResults = await searchEngine.search('javascrptt', 'agent1', {
        enableFuzzyMatch: true,
        fuzzyTolerance: 3
      });

      expect(lenientResults.length).toBeGreaterThanOrEqual(strictResults.length);
    });
  });

  describe('Scoring and Ranking', () => {
    it('should calculate combined scores', async () => {
      const results = await searchEngine.search('programming', 'agent1');

      expect(results.every(r => r.combinedScore > 0)).toBe(true);
      expect(results[0].combinedScore).toBeGreaterThanOrEqual(results[1]?.combinedScore || 0);
    });

    it('should boost important memories', async () => {
      const results = await searchEngine.search('python', 'agent1', {
        importanceWeight: 2.0
      });

      expect(results[0].memory.metadata?.importance).toBe(9); // Highest importance
    });

    it('should apply recency boost', async () => {
      // Create a recent memory
      const recentMemory = createTestMemory('recent', 'Recent programming update', {
        importance: 5 // Lower importance but recent
      });
      await searchEngine.addToIndex(recentMemory);

      const results = await searchEngine.search('programming', 'agent1', {
        recencyBoost: true
      });

      expect(results[0].temporalScore).toBeDefined();
    });
  });

  describe('Search Suggestions', () => {
    it('should generate completion suggestions', async () => {
      const suggestions = await searchEngine.generateSearchSuggestions('prog', 'agent1', {
        enableSuggestions: true
      });

      expect(suggestions.length).toBeGreaterThan(0);
      expect(suggestions.some(s => s.type === 'completion')).toBe(true);
    });

    it('should limit suggestions count', async () => {
      const suggestions = await searchEngine.generateSearchSuggestions('p', 'agent1', {
        enableSuggestions: true,
        maxSuggestions: 3
      });

      expect(suggestions.length).toBeLessThanOrEqual(3);
    });
  });

  describe('Result Highlighting', () => {
    it('should generate highlights when enabled', async () => {
      const results = await searchEngine.search('JavaScript programming', 'agent1', {
        enableHighlighting: true
      });

      expect(results[0].highlights).toBeDefined();
      expect(Object.keys(results[0].highlights!).length).toBeGreaterThan(0);
    });

    it('should not generate highlights when disabled', async () => {
      const results = await searchEngine.search('JavaScript programming', 'agent1', {
        enableHighlighting: false
      });

      expect(results[0].highlights).toBeUndefined();
    });
  });

  describe('Agent Isolation', () => {
    beforeEach(async () => {
      // Add memory from different agent
      const agent2Memory = {
        ...testMemories[0],
        structuredKey: 'agent2:cross-agent',
        agentId: 'agent2',
        content: 'Cross-agent JavaScript knowledge'
      };
      await searchEngine.addToIndex(agent2Memory);
    });

    it('should only return own agent memories by default', async () => {
      const results = await searchEngine.search('JavaScript', 'agent1');

      expect(results.every(r => r.memory.agentId === 'agent1')).toBe(true);
    });

    it('should include other agent memories when enabled', async () => {
      const results = await searchEngine.search('JavaScript', 'agent1', {
        includeOtherAgents: true
      });

      expect(results.some(r => r.memory.agentId === 'agent2')).toBe(true);
    });
  });

  describe('Performance and Statistics', () => {
    it('should provide search statistics', () => {
      const stats = searchEngine.getSearchStatistics();

      expect(stats.totalMemories).toBe(testMemories.length);
      expect(stats.indexedWords).toBeGreaterThan(0);
      expect(stats.indexHealth).toBe('healthy');
    });

    it('should track search events', async () => {
      const eventSpy = vi.fn();
      searchEngine.on('searchCompleted', eventSpy);

      await searchEngine.search('test', 'agent1');

      expect(eventSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          query: 'test',
          resultsCount: expect.any(Number),
          searchTime: expect.any(Number)
        })
      );
    });
  });

  describe('Index Management', () => {
    it('should remove memories from index', () => {
      const memoryId = testMemories[0].structuredKey;
      searchEngine.removeFromIndex(memoryId);

      const stats = searchEngine.getSearchStatistics();
      expect(stats.totalMemories).toBe(testMemories.length - 1);
    });

    it('should rebuild index', async () => {
      await searchEngine.rebuildIndex();

      const stats = searchEngine.getSearchStatistics();
      expect(stats.totalMemories).toBe(testMemories.length);
      expect(stats.indexHealth).toBe('healthy');
    });
  });

  describe('Error Handling', () => {
    it('should handle empty queries gracefully', async () => {
      const results = await searchEngine.search('', 'agent1');

      expect(results).toHaveLength(0);
    });

    it('should handle queries with special characters', async () => {
      const results = await searchEngine.search('test!@#$%^&*()', 'agent1');

      expect(results).toHaveLength(0); // No matches expected
    });

    it('should handle embedding service failures', async () => {
      mockEmbeddingService.isAvailable.mockReturnValue(false);

      const results = await searchEngine.search('programming', 'agent1', {
        useSemanticSearch: true
      });

      expect(results.length).toBeGreaterThan(0); // Should fall back to text search
    });
  });

  describe('Multi-field Search', () => {
    it('should search across multiple fields', async () => {
      const results = await searchEngine.search('web', 'agent1', {
        searchFields: ['content', 'tags', 'project']
      });

      expect(results.length).toBeGreaterThan(0);
      expect(results.some(r =>
        r.memory.content.includes('web') ||
        r.memory.metadata?.tags?.includes('web') ||
        r.memory.metadata?.project?.includes('web')
      )).toBe(true);
    });

    it('should apply field weights', async () => {
      const results = await searchEngine.search('javascript', 'agent1', {
        searchFields: ['content', 'tags'],
        fieldWeights: { content: 1.0, tags: 0.5 }
      });

      expect(results.length).toBeGreaterThan(0);
      // Content matches should score higher than tag matches
    });
  });

  describe('Date Range Filtering', () => {
    beforeEach(async () => {
      // Add memories with different timestamps
      const oldMemory = createTestMemory('old', 'Old programming concept');
      oldMemory.timestamp = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(); // 30 days ago

      const newMemory = createTestMemory('new', 'New programming concept');
      newMemory.timestamp = new Date().toISOString(); // Now

      await searchEngine.addToIndex(oldMemory);
      await searchEngine.addToIndex(newMemory);
    });

    it('should filter by date range', async () => {
      const now = new Date();
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

      const results = await searchEngine.search('programming', 'agent1', {
        dateRange: {
          start: weekAgo,
          end: now
        }
      });

      expect(results.some(r => r.memory.structuredKey.includes('new'))).toBe(true);
      expect(results.some(r => r.memory.structuredKey.includes('old'))).toBe(false);
    });
  });
});

describe('AdvancedSearchEngine Integration', () => {
  it('should handle complex search scenarios', async () => {
    const mockEmbeddingService = createMockEmbeddingService();
    const searchEngine = new AdvancedSearchEngine(mockEmbeddingService);

    // Add diverse test data
    const complexMemories = [
      createTestMemory('complex1', 'Advanced React patterns for scalable web applications', {
        tags: ['react', 'patterns', 'scalability'],
        entityType: 'technical',
        importance: 9,
        project: 'enterprise-app'
      }),
      createTestMemory('complex2', 'TypeScript best practices and advanced types', {
        tags: ['typescript', 'best-practices', 'types'],
        entityType: 'technical',
        importance: 8,
        project: 'enterprise-app'
      }),
      createTestMemory('complex3', 'Team meeting about React TypeScript migration', {
        tags: ['meeting', 'react', 'typescript', 'migration'],
        entityType: 'meeting',
        importance: 6,
        project: 'enterprise-app'
      })
    ];

    for (const memory of complexMemories) {
      await searchEngine.addToIndex(memory);
    }

    // Complex search with multiple criteria
    const results = await searchEngine.search('React TypeScript', 'agent1', {
      useSemanticSearch: true,
      enableFuzzyMatch: true,
      enableHighlighting: true,
      minImportance: 7,
      project: 'enterprise-app',
      searchFields: ['content', 'tags'],
      fieldWeights: { content: 1.0, tags: 0.8 }
    });

    expect(results.length).toBeGreaterThan(0);
    expect(results[0].combinedScore).toBeGreaterThan(0);
    expect(results[0].highlights).toBeDefined();
    expect(results.every(r => r.memory.metadata?.project === 'enterprise-app')).toBe(true);
    expect(results.every(r => (r.memory.metadata?.importance || 0) >= 7)).toBe(true);
  });
});