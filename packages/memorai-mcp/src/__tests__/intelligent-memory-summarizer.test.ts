/**
 * Intelligent Memory Summarizer Test Suite - US-MEM-003
 * Tests for AI-powered memory summarization system
 * 
 * Sprint: MemorAI Enhancement Sprint (Aug 27 - Sep 9, 2025)
 * User Story: US-MEM-003 (3 SP)
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { IntelligentMemorySummarizer, SummarizationLevel, SummarizationStrategy } from '../intelligent-memory-summarizer.js';
import { StoredMemory } from '../enhanced-memory-store.js';

// SearchResult interface for mocking
interface SearchResult {
  memories: StoredMemory[];
  totalCount: number;
  hasMore: boolean;
  searchQuery: string;
  searchTime: number;
  confidence: number;
}

// Mock implementations
class MockMultiTenantMemoryStore {
  private memories: Map<string, StoredMemory[]> = new Map();

  constructor() {
    // Setup test data
    this.setupTestMemories();
  }

  private setupTestMemories() {
    const testMemories: StoredMemory[] = [
      {
        id: '1',
        agentId: 'test-agent',
        content: 'This is an important discovery about quantum computing algorithms. The new approach shows significant performance improvements.',
        metadata: { importance: 9, entityType: 'discovery', tags: ['quantum', 'computing', 'algorithms'] },
        structuredKey: 'discovery/quantum-computing-1',
        timestamp: '2025-01-27T10:00:00Z',
        embeddings: [0.1, 0.2, 0.3, 0.4, 0.5]
      },
      {
        id: '2',
        agentId: 'test-agent',
        content: 'The project meeting discussed timeline adjustments and resource allocation for the next sprint.',
        metadata: { importance: 5, entityType: 'meeting', tags: ['project', 'planning', 'sprint'] },
        structuredKey: 'meeting/project-planning-1',
        timestamp: '2025-01-27T11:00:00Z',
        embeddings: [0.2, 0.3, 0.4, 0.5, 0.6]
      },
      {
        id: '3',
        agentId: 'test-agent',
        content: 'Research findings indicate that the new neural network architecture outperforms existing models by 15%.',
        metadata: { importance: 8, entityType: 'research', tags: ['neural', 'networks', 'performance'] },
        structuredKey: 'research/neural-networks-1',
        timestamp: '2025-01-27T12:00:00Z',
        embeddings: [0.3, 0.4, 0.5, 0.6, 0.7]
      }
    ];

    this.memories.set('test-agent', testMemories);
  }

  async recall(context: any, query: string, options: any = {}): Promise<SearchResult> {
    const agentMemories = this.memories.get(context.agentId) || [];
    let filteredMemories = [...agentMemories];

    // Apply filters
    if (options.minImportance) {
      filteredMemories = filteredMemories.filter(m => (m.metadata?.importance || 0) >= options.minImportance);
    }

    if (options.limit) {
      filteredMemories = filteredMemories.slice(0, options.limit);
    }

    return {
      memories: filteredMemories,
      totalCount: filteredMemories.length,
      hasMore: false,
      searchQuery: query,
      searchTime: 50,
      confidence: 0.95
    };
  }
}

describe('IntelligentMemorySummarizer', () => {
  let summarizer: IntelligentMemorySummarizer;
  let mockStore: MockMultiTenantMemoryStore;

  beforeEach(() => {
    mockStore = new MockMultiTenantMemoryStore();
    summarizer = new IntelligentMemorySummarizer(
      mockStore as any,
      {
        defaultLevel: SummarizationLevel.CONCISE,
        defaultStrategy: SummarizationStrategy.HYBRID,
        maxMemoriesPerSummary: 10,
        minMemoriesForSummarization: 1,
        qualityThreshold: 0.7
      }
    );
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Basic Functionality', () => {
    it('should create summarizer instance with correct configuration', () => {
      expect(summarizer).toBeDefined();
      expect(summarizer).toBeInstanceOf(IntelligentMemorySummarizer);
    });

    it('should summarize memories successfully', async () => {
      const result = await summarizer.summarizeMemories(
        'test-agent',
        undefined,
        {
          level: SummarizationLevel.MINIMAL,
          strategy: SummarizationStrategy.EXTRACTIVE
        }
      );

      expect(result).toBeDefined();
      expect(result.summaryText).toBeTruthy();
      expect(result.level).toBe(SummarizationLevel.MINIMAL);
      expect(result.strategy).toBe(SummarizationStrategy.EXTRACTIVE);
      expect(result.originalMemoryCount).toBeGreaterThan(0);
      expect(result.confidenceScore).toBeGreaterThan(0);
      expect(result.confidenceScore).toBeLessThanOrEqual(1);
      expect(result.compressionRatio).toBeGreaterThan(0);
      expect(result.id).toBeTruthy();
      expect(result.metadata.processingTime).toBeGreaterThan(0);
    });

    it('should handle different summarization levels', async () => {
      const levels = [
        SummarizationLevel.MINIMAL,
        SummarizationLevel.CONCISE,
        SummarizationLevel.DETAILED,
        SummarizationLevel.EXTENSIVE
      ];

      for (const level of levels) {
        const result = await summarizer.summarizeMemories('test-agent', undefined, { level });

        expect(result.level).toBe(level);
        expect(result.summaryText).toBeTruthy();
        expect(result.originalMemoryCount).toBeGreaterThan(0);
      }
    });

    it('should handle different summarization strategies', async () => {
      const strategies = [
        SummarizationStrategy.EXTRACTIVE,
        SummarizationStrategy.ABSTRACTIVE,
        SummarizationStrategy.HYBRID,
        SummarizationStrategy.SEMANTIC,
        SummarizationStrategy.TEMPORAL,
        SummarizationStrategy.THEMATIC
      ];

      for (const strategy of strategies) {
        const result = await summarizer.summarizeMemories('test-agent', undefined, { strategy });

        expect(result.strategy).toBe(strategy);
        expect(result.summaryText).toBeTruthy();
        expect(result.originalMemoryCount).toBeGreaterThan(0);
      }
    });
  });

  describe('Memory Filtering', () => {
    it('should filter by importance threshold', async () => {
      const result = await summarizer.summarizeMemories(
        'test-agent',
        undefined,
        {
          level: SummarizationLevel.CONCISE,
          importanceThreshold: 8
        }
      );

      expect(result.originalMemoryCount).toBeLessThanOrEqual(2); // Only 2 memories have importance >= 8
      expect(result.summaryText).toMatch(/quantum computing|neural network/i);
    });

    it('should handle temporal window filtering', async () => {
      const result = await summarizer.summarizeMemories(
        'test-agent',
        undefined,
        {
          level: SummarizationLevel.CONCISE,
          temporalWindow: {
            start: new Date('2025-01-27T10:00:00Z'),
            end: new Date('2025-01-27T12:00:00Z')
          }
        }
      );

      expect(result.originalMemoryCount).toBeGreaterThan(0);
      expect(result.summaryText).toBeTruthy();
      expect(result.timeframe.start).toBeDefined();
      expect(result.timeframe.end).toBeDefined();
    });

    it('should focus on specific keywords', async () => {
      const result = await summarizer.summarizeMemories(
        'test-agent',
        undefined,
        {
          level: SummarizationLevel.CONCISE,
          focusKeywords: ['quantum', 'neural']
        }
      );

      expect(result.summaryText.toLowerCase()).toMatch(/quantum|neural/);
      expect(result.themes.some(theme =>
        theme.toLowerCase().includes('quantum') ||
        theme.toLowerCase().includes('neural')
      )).toBe(true);
    });
  });

  describe('Specific Memory Summarization', () => {
    it('should summarize specific memories by IDs', async () => {
      const result = await summarizer.summarizeMemories(
        'test-agent',
        ['1', '3'], // Quantum computing and neural network memories
        {
          level: SummarizationLevel.CONCISE
        }
      );

      expect(result.originalMemoryCount).toBeLessThanOrEqual(2);
      expect(result.summaryText).toMatch(/quantum computing|neural network/i);
      expect(result.metadata.sourceMemoryIds).toContain('1');
    });
  });

  describe('Quality and Performance', () => {
    it('should provide quality metrics', async () => {
      const result = await summarizer.summarizeMemories(
        'test-agent',
        undefined,
        {
          level: SummarizationLevel.DETAILED
        }
      );

      expect(result.confidenceScore).toBeGreaterThan(0);
      expect(result.confidenceScore).toBeLessThanOrEqual(1);
      expect(result.compressionRatio).toBeGreaterThan(0);
      expect(result.metadata.processingTime).toBeGreaterThan(0);
      expect(result.metadata.createdAt).toBeInstanceOf(Date);
    });

    it('should complete within reasonable time', async () => {
      const startTime = Date.now();

      const result = await summarizer.summarizeMemories(
        'test-agent',
        undefined,
        {
          level: SummarizationLevel.CONCISE
        }
      );

      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(duration).toBeLessThan(5000); // Should complete within 5 seconds
      expect(result.metadata.processingTime).toBeGreaterThan(0);
      expect(result.metadata.processingTime).toBeLessThan(duration);
    });
  });

  describe('Error Handling', () => {
    it('should handle empty memory collections gracefully', async () => {
      // Create a mock store with no memories
      const emptyStore = {
        recall: vi.fn().mockResolvedValue({
          memories: [],
          totalCount: 0,
          hasMore: false,
          searchQuery: '',
          searchTime: 0,
          confidence: 0
        })
      };

      const emptySummarizer = new IntelligentMemorySummarizer(
        emptyStore as any,
        {
          minMemoriesForSummarization: 0 // Allow empty summarization for testing
        }
      );

      const result = await emptySummarizer.summarizeMemories('empty-agent', undefined, {
        level: SummarizationLevel.MINIMAL
      });

      expect(result.originalMemoryCount).toBe(0);
      expect(result.summaryText).toBe('No memories available to summarize.');
      expect(result.themes).toEqual([]);
    });

    it('should throw error for insufficient memories', async () => {
      const sparseStore = {
        recall: vi.fn().mockResolvedValue({
          memories: [mockStore['memories'].get('test-agent')![0]], // Only one memory
          totalCount: 1,
          hasMore: false,
          searchQuery: '',
          searchTime: 0,
          confidence: 1
        })
      };

      const sparseSummarizer = new IntelligentMemorySummarizer(
        sparseStore as any,
        {
          minMemoriesForSummarization: 3 // Require at least 3 memories
        }
      );

      await expect(
        sparseSummarizer.summarizeMemories('test-agent', undefined, {
          level: SummarizationLevel.MINIMAL
        })
      ).rejects.toThrow('Insufficient memories for summarization');
    });
  });

  describe('Event Emission', () => {
    it('should be an EventEmitter instance', () => {
      expect(summarizer.on).toBeDefined();
      expect(summarizer.emit).toBeDefined();
      expect(typeof summarizer.on).toBe('function');
      expect(typeof summarizer.emit).toBe('function');
    });

    it('should emit events during processing', async () => {
      const eventHandler = vi.fn();
      summarizer.on('summaryCacheHit', eventHandler);
      summarizer.on('summaryCacheMiss', eventHandler);

      await summarizer.summarizeMemories('test-agent', undefined, {
        level: SummarizationLevel.MINIMAL
      });

      // At least one event should have been emitted
      expect(eventHandler).toHaveBeenCalled();
    });
  });
});