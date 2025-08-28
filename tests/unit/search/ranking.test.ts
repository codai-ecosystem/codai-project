import { describe, it, expect, vi, beforeEach } from 'vitest';
import { HybridRankingEngine } from '../../../packages/cautai-core/src/search/ranking.js';
import { BM25Ranker } from '../../../packages/cautai-core/src/search/rankers/bm25.js';
import { SemanticRanker } from '../../../packages/cautai-core/src/search/rankers/semantic.js';
import type { SearchResult, SearchOptions } from '../../../packages/cautai-core/src/search/types.js';

describe('HybridRankingEngine', () => {
  let rankingEngine: HybridRankingEngine;
  let mockBM25: BM25Ranker;
  let mockSemantic: SemanticRanker;

  const sampleResults: SearchResult[] = [
    {
      id: '1',
      title: 'Machine Learning Fundamentals',
      url: 'https://example.com/ml-basics',
      snippet: 'An introduction to machine learning algorithms and techniques',
      relevance: 0.5,
      source: 'test',
      timestamp: new Date()
    },
    {
      id: '2',
      title: 'Deep Learning with Neural Networks',
      url: 'https://example.com/deep-learning',
      snippet: 'Advanced neural network architectures for deep learning',
      relevance: 0.5,
      source: 'test',
      timestamp: new Date()
    },
    {
      id: '3',
      title: 'Natural Language Processing',
      url: 'https://example.com/nlp',
      snippet: 'Processing and understanding human language with AI',
      relevance: 0.5,
      source: 'test',
      timestamp: new Date()
    }
  ];

  beforeEach(() => {
    mockBM25 = {
      rank: vi.fn(),
      calculateRelevance: vi.fn()
    } as any;

    mockSemantic = {
      rank: vi.fn(),
      calculateRelevance: vi.fn()
    } as any;

    rankingEngine = new HybridRankingEngine({
      bm25: mockBM25,
      semantic: mockSemantic,
      weights: { bm25: 0.6, semantic: 0.4 }
    });
  });

  describe('rank', () => {
    it('should combine BM25 and semantic rankings', async () => {
      const bm25Results = [...sampleResults].map((r, i) => ({
        ...r,
        relevance: 0.9 - (i * 0.2) // 0.9, 0.7, 0.5
      }));

      const semanticResults = [...sampleResults].map((r, i) => ({
        ...r,
        relevance: 0.8 - (i * 0.1) // 0.8, 0.7, 0.6
      }));

      mockBM25.rank = vi.fn().mockResolvedValue(bm25Results);
      mockSemantic.rank = vi.fn().mockResolvedValue(semanticResults);

      const options: SearchOptions = {
        query: 'machine learning',
        limit: 10
      };

      const rankedResults = await rankingEngine.rank(sampleResults, options);

      expect(mockBM25.rank).toHaveBeenCalledWith(sampleResults, options);
      expect(mockSemantic.rank).toHaveBeenCalledWith(sampleResults, options);
      
      // Should have hybrid scores (0.6 * bm25 + 0.4 * semantic)
      expect(rankedResults[0].relevance).toBeCloseTo(0.86); // 0.6*0.9 + 0.4*0.8
      expect(rankedResults[1].relevance).toBeCloseTo(0.70); // 0.6*0.7 + 0.4*0.7
      expect(rankedResults[2].relevance).toBeCloseTo(0.54); // 0.6*0.5 + 0.4*0.6
    });

    it('should handle custom weight configurations', async () => {
      const customRanking = new HybridRankingEngine({
        bm25: mockBM25,
        semantic: mockSemantic,
        weights: { bm25: 0.8, semantic: 0.2 }
      });

      const bm25Results = sampleResults.map(r => ({ ...r, relevance: 0.9 }));
      const semanticResults = sampleResults.map(r => ({ ...r, relevance: 0.6 }));

      mockBM25.rank = vi.fn().mockResolvedValue(bm25Results);
      mockSemantic.rank = vi.fn().mockResolvedValue(semanticResults);

      const rankedResults = await customRanking.rank(sampleResults, {
        query: 'test query'
      });

      // Should favor BM25 more heavily: 0.8*0.9 + 0.2*0.6 = 0.84
      expect(rankedResults[0].relevance).toBeCloseTo(0.84);
    });

    it('should sort results by combined relevance score', async () => {
      const bm25Results = [
        { ...sampleResults[0], relevance: 0.5 }, // Low BM25
        { ...sampleResults[1], relevance: 0.9 }, // High BM25
        { ...sampleResults[2], relevance: 0.7 }  // Mid BM25
      ];

      const semanticResults = [
        { ...sampleResults[0], relevance: 0.9 }, // High semantic
        { ...sampleResults[1], relevance: 0.5 }, // Low semantic
        { ...sampleResults[2], relevance: 0.6 }  // Mid semantic
      ];

      mockBM25.rank = vi.fn().mockResolvedValue(bm25Results);
      mockSemantic.rank = vi.fn().mockResolvedValue(semanticResults);

      const rankedResults = await rankingEngine.rank(sampleResults, {
        query: 'test query'
      });

      // Result 1: 0.6*0.9 + 0.4*0.5 = 0.74
      // Result 0: 0.6*0.5 + 0.4*0.9 = 0.66
      // Result 2: 0.6*0.7 + 0.4*0.6 = 0.66

      expect(rankedResults[0].id).toBe('2'); // Highest combined score
      expect(rankedResults[0].relevance).toBeCloseTo(0.74);
    });

    it('should handle empty results', async () => {
      mockBM25.rank = vi.fn().mockResolvedValue([]);
      mockSemantic.rank = vi.fn().mockResolvedValue([]);

      const rankedResults = await rankingEngine.rank([], {
        query: 'empty query'
      });

      expect(rankedResults).toHaveLength(0);
    });

    it('should handle BM25 ranking errors gracefully', async () => {
      mockBM25.rank = vi.fn().mockRejectedValue(new Error('BM25 failed'));
      mockSemantic.rank = vi.fn().mockResolvedValue(sampleResults);

      const rankedResults = await rankingEngine.rank(sampleResults, {
        query: 'test query'
      });

      // Should fall back to semantic ranking only
      expect(rankedResults).toHaveLength(3);
      expect(rankedResults[0].relevance).toBe(0.5);
    });

    it('should handle semantic ranking errors gracefully', async () => {
      mockBM25.rank = vi.fn().mockResolvedValue(sampleResults);
      mockSemantic.rank = vi.fn().mockRejectedValue(new Error('Semantic failed'));

      const rankedResults = await rankingEngine.rank(sampleResults, {
        query: 'test query'
      });

      // Should fall back to BM25 ranking only
      expect(rankedResults).toHaveLength(3);
      expect(rankedResults[0].relevance).toBe(0.5);
    });

    it('should handle both ranking errors', async () => {
      mockBM25.rank = vi.fn().mockRejectedValue(new Error('BM25 failed'));
      mockSemantic.rank = vi.fn().mockRejectedValue(new Error('Semantic failed'));

      const rankedResults = await rankingEngine.rank(sampleResults, {
        query: 'test query'
      });

      // Should return original results with original relevance scores
      expect(rankedResults).toHaveLength(3);
      expect(rankedResults).toEqual(sampleResults);
    });
  });

  describe('calculateRelevance', () => {
    it('should calculate individual result relevance', () => {
      mockBM25.calculateRelevance = vi.fn().mockReturnValue(0.8);
      mockSemantic.calculateRelevance = vi.fn().mockReturnValue(0.6);

      const relevance = rankingEngine.calculateRelevance(
        sampleResults[0],
        'machine learning'
      );

      expect(mockBM25.calculateRelevance).toHaveBeenCalledWith(
        sampleResults[0],
        'machine learning'
      );
      expect(mockSemantic.calculateRelevance).toHaveBeenCalledWith(
        sampleResults[0],
        'machine learning'
      );

      // 0.6 * 0.8 + 0.4 * 0.6 = 0.72
      expect(relevance).toBeCloseTo(0.72);
    });

    it('should handle calculation errors', () => {
      mockBM25.calculateRelevance = vi.fn().mockImplementation(() => {
        throw new Error('BM25 calculation failed');
      });
      mockSemantic.calculateRelevance = vi.fn().mockReturnValue(0.6);

      const relevance = rankingEngine.calculateRelevance(
        sampleResults[0],
        'test query'
      );

      // Should fall back to semantic only: 0.6
      expect(relevance).toBe(0.6);
    });
  });

  describe('query-specific ranking', () => {
    it('should handle academic content queries', async () => {
      const academicResults = sampleResults.map(r => ({
        ...r,
        source: 'academic'
      }));

      mockBM25.rank = vi.fn().mockResolvedValue(academicResults);
      mockSemantic.rank = vi.fn().mockResolvedValue(academicResults);

      const rankedResults = await rankingEngine.rank(academicResults, {
        query: 'research methodology',
        contentType: 'academic'
      });

      expect(mockBM25.rank).toHaveBeenCalledWith(academicResults, {
        query: 'research methodology',
        contentType: 'academic'
      });
    });

    it('should boost recent results for time-sensitive queries', async () => {
      const recentResults = [
        { ...sampleResults[0], timestamp: new Date('2024-01-01') },
        { ...sampleResults[1], timestamp: new Date('2023-01-01') },
        { ...sampleResults[2], timestamp: new Date('2022-01-01') }
      ];

      mockBM25.rank = vi.fn().mockResolvedValue(recentResults);
      mockSemantic.rank = vi.fn().mockResolvedValue(recentResults);

      const rankedResults = await rankingEngine.rank(recentResults, {
        query: 'latest trends',
        dateRange: 'year'
      });

      // Recent results should be boosted
      expect(rankedResults[0].timestamp.getFullYear()).toBe(2024);
    });

    it('should handle language-specific ranking', async () => {
      const multiLangResults = [
        { ...sampleResults[0], title: 'English Title', snippet: 'English content' },
        { ...sampleResults[1], title: 'Titlu Român', snippet: 'Conținut în română' },
        { ...sampleResults[2], title: 'Another English', snippet: 'More English content' }
      ];

      mockBM25.rank = vi.fn().mockResolvedValue(multiLangResults);
      mockSemantic.rank = vi.fn().mockResolvedValue(multiLangResults);

      const rankedResults = await rankingEngine.rank(multiLangResults, {
        query: 'căutare în română',
        language: 'ro'
      });

      expect(mockBM25.rank).toHaveBeenCalledWith(multiLangResults, {
        query: 'căutare în română',
        language: 'ro'
      });
    });
  });

  describe('performance', () => {
    it('should handle large result sets efficiently', async () => {
      const largeResultSet = Array.from({ length: 1000 }, (_, i) => ({
        id: `${i + 1}`,
        title: `Result ${i + 1}`,
        url: `https://example${i + 1}.com`,
        snippet: `Snippet for result ${i + 1}`,
        relevance: Math.random(),
        source: 'test',
        timestamp: new Date()
      }));

      mockBM25.rank = vi.fn().mockResolvedValue(largeResultSet);
      mockSemantic.rank = vi.fn().mockResolvedValue(largeResultSet);

      const startTime = Date.now();
      const rankedResults = await rankingEngine.rank(largeResultSet, {
        query: 'large dataset test'
      });
      const processingTime = Date.now() - startTime;

      expect(rankedResults).toHaveLength(1000);
      expect(processingTime).toBeLessThan(5000); // Should complete within 5 seconds
    });

    it('should handle concurrent ranking requests', async () => {
      mockBM25.rank = vi.fn().mockResolvedValue(sampleResults);
      mockSemantic.rank = vi.fn().mockResolvedValue(sampleResults);

      const concurrentRequests = Array.from({ length: 10 }, (_, i) =>
        rankingEngine.rank(sampleResults, {
          query: `concurrent query ${i}`
        })
      );

      const results = await Promise.all(concurrentRequests);

      expect(results).toHaveLength(10);
      expect(mockBM25.rank).toHaveBeenCalledTimes(10);
      expect(mockSemantic.rank).toHaveBeenCalledTimes(10);
    });
  });
});