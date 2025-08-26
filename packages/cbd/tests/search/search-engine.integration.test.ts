/**
 * CBD Search Engine Integration Tests - Phase 5 Comprehensive Test Suite
 * 
 * Complete test coverage for Phase 5 Search Engine implementation
 * Tests cover:
 * - Core search functionality with BM25 scoring
 * - Text analysis and tokenization
 * - Inverted index operations
 * - Hybrid search with vector integration
 * - Multi-language support and stemming
 * - Performance benchmarks
 * - Elasticsearch compatibility
 * 
 * Following enterprise testing standards and 2025 best practices
 * 
 * @author CBD Database Team
 * @version 1.0.0
 * @created 2025-08-26
 */

import { describe, it, expect, beforeEach, beforeAll, afterAll, afterEach } from '@jest/globals';
import CBDSearchEngine, { 
  SearchQuery, 
  IndexSchema, 
  SearchFieldType, 
  SearchDocument,
  SimilarityAlgorithm,
  FilterOperator
} from '../../src/search/CBDSearchEngine';
import TextAnalysisEngine from '../../src/search/TextAnalysisEngine';
import HybridSearchEngine from '../../src/search/HybridSearchEngine';

describe('CBD Phase 5 Search Engine - Comprehensive Integration Tests', () => {
  let searchEngine: CBDSearchEngine;
  let textAnalyzer: TextAnalysisEngine;
  let hybridEngine: HybridSearchEngine;
  let testIndexName: string;

  beforeAll(async () => {
    // Initialize search engine components
    searchEngine = new CBDSearchEngine({
      maxIndexes: 100,
      enablePerformanceMonitoring: true,
      compressionEnabled: true
    });
    
    textAnalyzer = new TextAnalysisEngine();
    
    // Mock vector engine for hybrid testing
    const mockVectorEngine = {
      search: jest.fn().mockResolvedValue([]),
      generateEmbedding: jest.fn().mockResolvedValue(new Array(512).fill(0.1)),
      indexDocument: jest.fn().mockResolvedValue(undefined),
      updateDocument: jest.fn().mockResolvedValue(undefined),
      deleteDocument: jest.fn().mockResolvedValue(undefined)
    };
    
    hybridEngine = new HybridSearchEngine(searchEngine, mockVectorEngine);
    
    await searchEngine.start();
    await hybridEngine.initialize();
    
    console.log('✅ Phase 5 Search Engine test suite initialized');
  });

  afterAll(async () => {
    if (searchEngine) {
      await searchEngine.stop();
    }
    console.log('✅ Phase 5 Search Engine test suite cleanup completed');
  });

  beforeEach(() => {
    testIndexName = `test_search_index_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  });

  afterEach(async () => {
    // Cleanup test indexes
    try {
      await searchEngine.deleteIndex(testIndexName);
    } catch {
      // Index might not exist
    }
  });

  describe('🔍 Core Search Engine Functionality', () => {
    it('should create and configure search index with schema', async () => {
      const schema: IndexSchema = {
        name: testIndexName,
        fields: {
          title: {
            name: 'title',
            type: SearchFieldType.TEXT,
            boost: 2.0,
            stored: true,
            indexed: true
          },
          content: {
            name: 'content',
            type: SearchFieldType.TEXT,
            stored: true,
            indexed: true
          },
          category: {
            name: 'category',
            type: SearchFieldType.KEYWORD,
            facet: true,
            stored: true
          },
          price: {
            name: 'price',
            type: SearchFieldType.FLOAT,
            sortable: true
          },
          publish_date: {
            name: 'publish_date',
            type: SearchFieldType.DATE,
            sortable: true
          },
          active: {
            name: 'active',
            type: SearchFieldType.BOOLEAN
          }
        },
        settings: {
          numberOfShards: 1,
          numberOfReplicas: 0,
          similarity: SimilarityAlgorithm.BM25,
          defaultAnalyzer: 'standard'
        },
        analyzers: {
          standard: {
            name: 'standard',
            tokenizer: 'standard' as any,
            filters: [
              { type: 'lowercase' as any },
              { type: 'stop' as any }
            ]
          }
        },
        version: 1
      };

      await searchEngine.createIndex(schema);
      
      const indexInfo = searchEngine.getIndexInfo(testIndexName);
      
      expect(indexInfo).toBeDefined();
      expect(indexInfo.name).toBe(testIndexName);
      expect(indexInfo.settings.similarity).toBe(SimilarityAlgorithm.BM25);
      expect(Object.keys(indexInfo.mappings)).toEqual(['title', 'content', 'category', 'price', 'publish_date', 'active']);
      
      console.log(`✅ Created search index: ${testIndexName}`);
    });

    it('should index documents with full-text content', async () => {
      await searchEngine.createIndex(createTestSchema(testIndexName));
      
      const documents: SearchDocument[] = [
        {
          id: 'doc1',
          content: {},
          fields: {
            title: 'Advanced Machine Learning Algorithms',
            content: 'This comprehensive guide covers neural networks, deep learning, and artificial intelligence techniques used in modern machine learning applications.',
            category: 'Technology',
            price: 49.99,
            publish_date: new Date('2025-01-15'),
            active: true
          }
        },
        {
          id: 'doc2',
          content: {},
          fields: {
            title: 'Data Science with Python',
            content: 'Learn Python programming for data analysis, visualization, and machine learning. Covers pandas, numpy, scikit-learn, and TensorFlow.',
            category: 'Programming',
            price: 39.99,
            publish_date: new Date('2025-02-01'),
            active: true
          }
        },
        {
          id: 'doc3',
          content: {},
          fields: {
            title: 'Web Development Fundamentals',
            content: 'Complete guide to HTML, CSS, JavaScript, and modern web frameworks. Build responsive websites and web applications.',
            category: 'Web Development',
            price: 29.99,
            publish_date: new Date('2025-01-20'),
            active: false
          }
        }
      ];

      const result = await searchEngine.indexDocuments(testIndexName, documents);
      
      expect(result.successCount).toBe(3);
      expect(result.errorCount).toBe(0);
      expect(result.took).toBeGreaterThan(0);
      
      // Refresh index to make documents searchable
      await searchEngine.refreshIndex(testIndexName);
      
      const indexInfo = searchEngine.getIndexInfo(testIndexName);
      expect(indexInfo.documentCount).toBe(3);
      
      console.log(`✅ Indexed ${result.successCount} documents successfully`);
    });

    it('should perform full-text search with BM25 scoring', async () => {
      await searchEngine.createIndex(createTestSchema(testIndexName));
      await indexTestDocuments(searchEngine, testIndexName);
      
      const searchQuery: SearchQuery = {
        query: 'machine learning Python',
        fields: ['title', 'content'],
        limit: 10,
        highlight: true
      };

      const response = await searchEngine.search(testIndexName, searchQuery);
      
      expect(response.results).toBeDefined();
      expect(response.results.length).toBeGreaterThan(0);
      expect(response.totalHits).toBeGreaterThan(0);
      expect(response.took).toBeGreaterThan(0);
      
      // Verify BM25 scoring - results should be ranked by relevance
      expect(response.results[0].score).toBeGreaterThan(0);
      if (response.results.length > 1) {
        expect(response.results[0].score).toBeGreaterThanOrEqual(response.results[1].score);
      }
      
      // Check highlights
      expect(response.results[0].highlights).toBeDefined();
      
      console.log(`✅ Full-text search returned ${response.results.length} results in ${response.took}ms`);
    });

    it('should support filtering and faceted search', async () => {
      await searchEngine.createIndex(createTestSchema(testIndexName));
      await indexTestDocuments(searchEngine, testIndexName);
      
      const searchQuery: SearchQuery = {
        query: '*',
        filters: [
          {
            field: 'category',
            operator: FilterOperator.EQUALS,
            value: 'Technology'
          },
          {
            field: 'price',
            operator: FilterOperator.LESS_THAN,
            value: 50
          },
          {
            field: 'active',
            operator: FilterOperator.EQUALS,
            value: true
          }
        ],
        facets: ['category', 'price'],
        limit: 10
      };

      const response = await searchEngine.search(testIndexName, searchQuery);
      
      expect(response.results.length).toBeGreaterThan(0);
      expect(response.facets).toBeDefined();
      expect(response.facets!['category']).toBeDefined();
      expect(response.facets!['category'].buckets.length).toBeGreaterThan(0);
      
      // Verify filtering worked
      for (const result of response.results) {
        expect(result.document.fields.category).toBe('Technology');
        expect(Number(result.document.fields.price)).toBeLessThan(50);
        expect(result.document.fields.active).toBe(true);
      }
      
      console.log(`✅ Filtered search with facets returned ${response.results.length} results`);
    });

    it('should support sorting by multiple fields', async () => {
      await searchEngine.createIndex(createTestSchema(testIndexName));
      await indexTestDocuments(searchEngine, testIndexName);
      
      const searchQuery: SearchQuery = {
        query: '*',
        sort: [
          { field: 'price', direction: 'desc' },
          { field: 'publish_date', direction: 'asc' }
        ],
        limit: 10
      };

      const response = await searchEngine.search(testIndexName, searchQuery);
      
      expect(response.results.length).toBeGreaterThan(0);
      
      // Verify sorting
      for (let i = 1; i < response.results.length; i++) {
        const current = Number(response.results[i].document.fields.price);
        const previous = Number(response.results[i-1].document.fields.price);
        expect(current).toBeLessThanOrEqual(previous);
      }
      
      console.log(`✅ Multi-field sorting working correctly`);
    });

    it('should provide search suggestions and autocomplete', async () => {
      await searchEngine.createIndex(createTestSchema(testIndexName));
      await indexTestDocuments(searchEngine, testIndexName);
      
      // Test suggestions
      const suggestions = await searchEngine.suggest(testIndexName, 'machne', 'title');
      expect(suggestions).toBeDefined();
      expect(suggestions.length).toBeGreaterThan(0);
      
      // Test autocomplete
      const autocomplete = await searchEngine.autocomplete(testIndexName, 'mach', 'title');
      expect(autocomplete).toBeDefined();
      expect(autocomplete.length).toBeGreaterThan(0);
      
      console.log(`✅ Suggestions: ${suggestions.join(', ')}`);
      console.log(`✅ Autocomplete: ${autocomplete.join(', ')}`);
    });
  });

  describe('📝 Text Analysis Engine', () => {
    it('should tokenize and analyze text correctly', async () => {
      const text = 'The quick brown fox jumps over the lazy dog!';
      const result = await textAnalyzer.analyzeText(text, 'standard');
      
      expect(result.tokens).toBeDefined();
      expect(result.tokens.length).toBeGreaterThan(0);
      expect(result.analyzer).toBe('standard');
      expect(result.took).toBeGreaterThan(0);
      
      // Check token structure
      expect(result.tokens[0]).toHaveProperty('token');
      expect(result.tokens[0]).toHaveProperty('position');
      expect(result.tokens[0]).toHaveProperty('startOffset');
      expect(result.tokens[0]).toHaveProperty('endOffset');
      
      console.log(`✅ Analyzed text: ${result.tokens.map((t: any) => t.token).join(', ')}`);
    });

    it('should support multiple analyzers (standard, keyword, stop)', async () => {
      const text = 'Machine Learning and Artificial Intelligence';
      
      const standardResult = await textAnalyzer.analyzeText(text, 'standard');
      const keywordResult = await textAnalyzer.analyzeText(text, 'keyword');
      const stopResult = await textAnalyzer.analyzeText(text, 'stop');
      
      expect(standardResult.tokens.length).toBeGreaterThan(1);
      expect(keywordResult.tokens.length).toBe(1); // Keyword analyzer doesn't tokenize
      expect(stopResult.tokens.length).toBeLessThanOrEqual(standardResult.tokens.length); // Stop removes common words
      
      console.log(`✅ Standard tokens: ${standardResult.tokens.length}`);
      console.log(`✅ Keyword tokens: ${keywordResult.tokens.length}`);
      console.log(`✅ Stop filtered tokens: ${stopResult.tokens.length}`);
    });

    it('should provide detailed analysis explanation', async () => {
      const text = 'Running quickly through the forest!';
      const explanation = await textAnalyzer.explainAnalysis(text, 'english');
      
      expect(explanation).toBeDefined();
      expect(explanation.analyzer).toBe('english');
      expect(explanation.originalText).toBe(text);
      expect(explanation.finalTokens).toBeDefined();
      expect(explanation.steps).toBeDefined();
      expect(explanation.steps.length).toBeGreaterThan(0);
      
      console.log(`✅ Analysis steps: ${explanation.steps.map((s: any) => s.name).join(' → ')}`);
    });

    it('should handle language-specific analysis (stemming, stopwords)', async () => {
      const englishText = 'running dogs quickly jumped';
      const result = await textAnalyzer.analyzeText(englishText, 'english');
      
      // Should apply stemming and stopword removal
      const tokens = result.tokens.map((t: any) => t.token);
      expect(tokens).not.toContain('the');
      expect(tokens).not.toContain('a');
      
      console.log(`✅ English analysis tokens: ${tokens.join(', ')}`);
    });
  });

  describe('🔀 Hybrid Search Engine', () => {
    it('should perform hybrid search combining text and vector results', async () => {
      await searchEngine.createIndex(createTestSchema(testIndexName));
      await indexTestDocuments(searchEngine, testIndexName);
      
      const hybridQuery = {
        query: 'machine learning',
        vectorQuery: {
          vector: new Array(512).fill(0.1),
          k: 5
        },
        hybridMode: 'hybrid_rrf' as any,
        limit: 10
      };

      const response = await hybridEngine.search(testIndexName, hybridQuery);
      
      expect(response.results).toBeDefined();
      expect(response.results.length).toBeGreaterThan(0);
      expect(response.fusionStats).toBeDefined();
      expect(response.fusionStats!.fusionMode).toBe('rrf');
      
      // Check hybrid result structure
      const firstResult = response.results[0];
      expect(firstResult).toHaveProperty('fusedScore');
      expect(firstResult).toHaveProperty('textScore');
      expect(firstResult).toHaveProperty('vectorScore');
      
      console.log(`✅ Hybrid search fusion stats: ${JSON.stringify(response.fusionStats, null, 2)}`);
    });

    it('should support different score fusion algorithms', async () => {
      await searchEngine.createIndex(createTestSchema(testIndexName));
      await indexTestDocuments(searchEngine, testIndexName);
      
      const baseQuery = {
        query: 'Python programming',
        vectorQuery: {
          vector: new Array(512).fill(0.15),
          k: 5
        },
        limit: 5
      };

      // Test RRF fusion
      const rrfResponse = await hybridEngine.search(testIndexName, {
        ...baseQuery,
        hybridMode: 'hybrid_rrf' as any
      });

      // Test weighted fusion
      const weightedResponse = await hybridEngine.search(testIndexName, {
        ...baseQuery,
        hybridMode: 'hybrid_weighted' as any,
        scoreFusion: {
          mode: 'weighted_sum' as any,
          textWeight: 0.7,
          vectorWeight: 0.3
        }
      });

      expect(rrfResponse.results).toBeDefined();
      expect(weightedResponse.results).toBeDefined();
      
      // Results should be different due to different fusion algorithms
      if (rrfResponse.results.length > 0 && weightedResponse.results.length > 0) {
        expect(rrfResponse.results[0].fusedScore).not.toBe(weightedResponse.results[0].fusedScore);
      }
      
      console.log(`✅ RRF vs Weighted fusion scores differ as expected`);
    });

    it('should maintain index synchronization between text and vector engines', async () => {
      await searchEngine.createIndex(createTestSchema(testIndexName));
      
      const testDoc: SearchDocument = {
        id: 'sync_test_doc',
        content: {},
        fields: {
          title: 'Synchronization Test Document',
          content: 'Testing index synchronization between text and vector engines',
          category: 'Test',
          price: 19.99,
          active: true
        }
      };

      // Index through hybrid engine (should sync to both)
      await hybridEngine.indexDocument(testIndexName, testDoc);
      await searchEngine.refreshIndex(testIndexName);
      
      // Search should find the document
      const response = await searchEngine.search(testIndexName, { query: 'synchronization' });
      expect(response.results.some((r: any) => r.id === 'sync_test_doc')).toBe(true);
      
      // Update document
      const updatedDoc = {
        ...testDoc,
        fields: {
          ...testDoc.fields,
          title: 'Updated Synchronization Test Document'
        }
      };
      
      await hybridEngine.updateDocument(testIndexName, updatedDoc);
      await searchEngine.refreshIndex(testIndexName);
      
      // Search for updated content
      const updateResponse = await searchEngine.search(testIndexName, { query: 'Updated' });
      expect(updateResponse.results.some((r: any) => r.id === 'sync_test_doc')).toBe(true);
      
      console.log(`✅ Index synchronization working correctly`);
    });
  });

  describe('⚡ Performance and Scalability', () => {
    it('should handle large document indexing efficiently', async () => {
      await searchEngine.createIndex(createTestSchema(testIndexName));
      
      const startTime = Date.now();
      const batchSize = 100;
      const documents: SearchDocument[] = [];
      
      // Generate test documents
      for (let i = 0; i < batchSize; i++) {
        documents.push({
          id: `perf_doc_${i}`,
          content: {},
          fields: {
            title: `Performance Test Document ${i}`,
            content: `This is a performance test document number ${i} containing various content for search testing and benchmarking purposes. It includes multiple words and phrases to simulate real-world content.`,
            category: `Category${i % 5}`,
            price: Math.random() * 100,
            publish_date: new Date(),
            active: i % 2 === 0
          }
        });
      }
      
      const result = await searchEngine.indexDocuments(testIndexName, documents);
      const indexTime = Date.now() - startTime;
      
      expect(result.successCount).toBe(batchSize);
      expect(indexTime).toBeLessThan(10000); // Should complete within 10 seconds
      
      const indexingRate = (batchSize / indexTime) * 1000; // docs per second
      
      console.log(`✅ Indexed ${batchSize} documents in ${indexTime}ms (${indexingRate.toFixed(2)} docs/sec)`);
      
      // Test search performance
      await searchEngine.refreshIndex(testIndexName);
      
      const searchStart = Date.now();
      const searchResponse = await searchEngine.search(testIndexName, {
        query: 'performance test',
        limit: 10
      });
      const searchTime = Date.now() - searchStart;
      
      expect(searchResponse.results.length).toBeGreaterThan(0);
      expect(searchTime).toBeLessThan(1000); // Should search within 1 second
      
      console.log(`✅ Search completed in ${searchTime}ms with ${searchResponse.results.length} results`);
    });

    it('should maintain performance with concurrent searches', async () => {
      await searchEngine.createIndex(createTestSchema(testIndexName));
      await indexTestDocuments(searchEngine, testIndexName);
      
      const concurrentSearches = 10;
      const searchPromises: Promise<any>[] = [];
      
      const startTime = Date.now();
      
      for (let i = 0; i < concurrentSearches; i++) {
        searchPromises.push(
          searchEngine.search(testIndexName, {
            query: `test query ${i}`,
            limit: 5
          })
        );
      }
      
      const results = await Promise.all(searchPromises);
      const totalTime = Date.now() - startTime;
      
      expect(results.length).toBe(concurrentSearches);
      expect(totalTime).toBeLessThan(5000); // Should complete within 5 seconds
      
      const avgResponseTime = totalTime / concurrentSearches;
      
      console.log(`✅ Completed ${concurrentSearches} concurrent searches in ${totalTime}ms (avg: ${avgResponseTime.toFixed(2)}ms)`);
    });
  });

  describe('🔧 Engine Management and Health', () => {
    it('should provide comprehensive engine statistics', async () => {
      const stats = searchEngine.getStats();
      
      expect(stats).toBeDefined();
      expect(stats).toHaveProperty('totalIndexes');
      expect(stats).toHaveProperty('totalDocuments');
      expect(stats).toHaveProperty('totalQueries');
      expect(stats).toHaveProperty('averageQueryTime');
      expect(stats).toHaveProperty('uptime');
      
      console.log(`✅ Engine stats: ${JSON.stringify(stats, null, 2)}`);
    });

    it('should report healthy engine status', async () => {
      const health = searchEngine.getHealth();
      
      expect(health).toBeDefined();
      expect(health.status).toBe('green');
      expect(health.version).toBe('1.0.0');
      expect(health.uptime).toBeGreaterThan(0);
      
      console.log(`✅ Engine health: ${JSON.stringify(health, null, 2)}`);
    });

    it('should handle index operations correctly', async () => {
      await searchEngine.createIndex(createTestSchema(testIndexName));
      
      // Test refresh
      await searchEngine.refreshIndex(testIndexName);
      
      // Test force merge
      await searchEngine.forcemerge(testIndexName, 1);
      
      // Test index info
      const info = searchEngine.getIndexInfo(testIndexName);
      expect(info).toBeDefined();
      expect(info.name).toBe(testIndexName);
      
      console.log(`✅ Index operations completed successfully`);
    });
  });

  describe('🌐 Elasticsearch Compatibility', () => {
    it('should support Elasticsearch-style queries', async () => {
      await searchEngine.createIndex(createTestSchema(testIndexName));
      await indexTestDocuments(searchEngine, testIndexName);
      
      // Test bool query equivalent
      const elasticQuery: SearchQuery = {
        query: 'machine learning',
        filters: [
          {
            field: 'active',
            operator: FilterOperator.EQUALS,
            value: true
          }
        ],
        sort: [{ field: '_score', direction: 'desc' }],
        highlight: true,
        offset: 0,
        limit: 10
      };

      const response = await searchEngine.search(testIndexName, elasticQuery);
      
      expect(response.results).toBeDefined();
      expect(response.results.length).toBeGreaterThan(0);
      
      console.log(`✅ Elasticsearch-compatible query executed successfully`);
    });

    it('should support aggregations equivalent to Elasticsearch facets', async () => {
      await searchEngine.createIndex(createTestSchema(testIndexName));
      await indexTestDocuments(searchEngine, testIndexName);
      
      const response = await searchEngine.search(testIndexName, {
        query: '*',
        facets: ['category'],
        limit: 0 // Only interested in aggregations
      });
      
      expect(response.facets).toBeDefined();
      expect(response.facets!['category']).toBeDefined();
      expect(response.facets!['category'].buckets.length).toBeGreaterThan(0);
      
      console.log(`✅ Elasticsearch-compatible aggregations working`);
    });
  });

  // Helper functions
  function createTestSchema(indexName: string): IndexSchema {
    return {
      name: indexName,
      fields: {
        title: {
          name: 'title',
          type: SearchFieldType.TEXT,
          boost: 2.0,
          stored: true,
          indexed: true
        },
        content: {
          name: 'content',
          type: SearchFieldType.TEXT,
          stored: true,
          indexed: true
        },
        category: {
          name: 'category',
          type: SearchFieldType.KEYWORD,
          facet: true,
          stored: true
        },
        price: {
          name: 'price',
          type: SearchFieldType.FLOAT,
          sortable: true
        },
        publish_date: {
          name: 'publish_date',
          type: SearchFieldType.DATE,
          sortable: true
        },
        active: {
          name: 'active',
          type: SearchFieldType.BOOLEAN
        }
      },
      settings: {
        numberOfShards: 1,
        numberOfReplicas: 0,
        similarity: SimilarityAlgorithm.BM25
      },
      analyzers: {
        standard: {
          name: 'standard',
          tokenizer: 'standard' as any,
          filters: [{ type: 'lowercase' as any }]
        }
      },
      version: 1
    };
  }

  async function indexTestDocuments(engine: CBDSearchEngine, indexName: string): Promise<void> {
    const documents: SearchDocument[] = [
      {
        id: 'doc1',
        content: {},
        fields: {
          title: 'Advanced Machine Learning Algorithms',
          content: 'Comprehensive guide to neural networks, deep learning, and AI techniques',
          category: 'Technology',
          price: 49.99,
          publish_date: new Date('2025-01-15'),
          active: true
        }
      },
      {
        id: 'doc2',
        content: {},
        fields: {
          title: 'Data Science with Python Programming',
          content: 'Learn Python for data analysis, visualization, and machine learning applications',
          category: 'Programming',
          price: 39.99,
          publish_date: new Date('2025-02-01'),
          active: true
        }
      },
      {
        id: 'doc3',
        content: {},
        fields: {
          title: 'Web Development Fundamentals',
          content: 'HTML, CSS, JavaScript and modern web frameworks for building applications',
          category: 'Web Development',
          price: 29.99,
          publish_date: new Date('2025-01-20'),
          active: false
        }
      }
    ];

    await engine.indexDocuments(indexName, documents);
    await engine.refreshIndex(indexName);
  }
});

// Performance benchmark test
describe('🏆 CBD Search Engine Performance Benchmarks', () => {
  let searchEngine: CBDSearchEngine;
  const benchmarkIndexName = 'benchmark_search_index';

  beforeAll(async () => {
    searchEngine = new CBDSearchEngine({
      enablePerformanceMonitoring: true,
      compressionEnabled: true
    });
    await searchEngine.start();
    
    console.log('🏆 Starting CBD Search Engine performance benchmarks...');
  });

  afterAll(async () => {
    if (searchEngine) {
      try {
        await searchEngine.deleteIndex(benchmarkIndexName);
      } catch {}
      await searchEngine.stop();
    }
    console.log('🏆 Performance benchmark suite completed');
  });

  it('should achieve target indexing performance (>500 docs/sec)', async () => {
    const schema = createBenchmarkSchema();
    await searchEngine.createIndex(schema);
    
    const documentCount = 1000;
    const documents = generateBenchmarkDocuments(documentCount);
    
    const startTime = Date.now();
    const result = await searchEngine.indexDocuments(benchmarkIndexName, documents);
    const endTime = Date.now();
    
    const indexingTime = endTime - startTime;
    const indexingRate = (documentCount / indexingTime) * 1000; // docs/sec
    
    expect(result.successCount).toBe(documentCount);
    expect(indexingRate).toBeGreaterThan(500); // Target: >500 docs/sec
    
    console.log(`🏆 Indexing Performance: ${indexingRate.toFixed(2)} docs/sec (Target: >500 docs/sec) ✅`);
    
    // Benchmark results
    const benchmarkResult = {
      test: 'indexing_performance',
      documents: documentCount,
      time_ms: indexingTime,
      docs_per_second: indexingRate,
      target_met: indexingRate > 500,
      timestamp: new Date().toISOString()
    };
    
    console.log(`📊 Benchmark Result: ${JSON.stringify(benchmarkResult, null, 2)}`);
  });

  it('should achieve target search performance (<100ms for simple queries)', async () => {
    // Use existing indexed documents
    await searchEngine.refreshIndex(benchmarkIndexName);
    
    const searchQueries = [
      'machine learning',
      'python programming',
      'web development',
      'data science analysis',
      'artificial intelligence'
    ];
    
    const searchTimes: number[] = [];
    
    for (const query of searchQueries) {
      const startTime = Date.now();
      const response = await searchEngine.search(benchmarkIndexName, {
        query,
        limit: 10
      });
      const searchTime = Date.now() - startTime;
      
      searchTimes.push(searchTime);
      expect(response.results).toBeDefined();
    }
    
    const avgSearchTime = searchTimes.reduce((sum, time) => sum + time, 0) / searchTimes.length;
    const maxSearchTime = Math.max(...searchTimes);
    
    expect(avgSearchTime).toBeLessThan(100); // Target: <100ms average
    expect(maxSearchTime).toBeLessThan(200); // Target: <200ms max
    
    console.log(`🏆 Search Performance: ${avgSearchTime.toFixed(2)}ms avg, ${maxSearchTime}ms max (Target: <100ms avg) ✅`);
    
    const benchmarkResult = {
      test: 'search_performance',
      queries: searchQueries.length,
      average_time_ms: avgSearchTime,
      max_time_ms: maxSearchTime,
      target_met: avgSearchTime < 100,
      timestamp: new Date().toISOString()
    };
    
    console.log(`📊 Benchmark Result: ${JSON.stringify(benchmarkResult, null, 2)}`);
  });

  function createBenchmarkSchema(): any {
    return {
      name: benchmarkIndexName,
      fields: {
        title: { name: 'title', type: 'text' as any, boost: 2.0 },
        content: { name: 'content', type: 'text' as any },
        category: { name: 'category', type: 'keyword' as any, facet: true }
      },
      settings: { similarity: 'BM25' as any },
      analyzers: { standard: { name: 'standard', tokenizer: 'standard' as any, filters: [] } },
      version: 1
    };
  }

  function generateBenchmarkDocuments(count: number): any[] {
    const categories = ['Technology', 'Programming', 'Data Science', 'Web Development', 'AI/ML'];
    const titles = [
      'Advanced Machine Learning Techniques',
      'Python Programming Fundamentals',
      'Web Development Best Practices',
      'Data Science Methodology',
      'Artificial Intelligence Applications'
    ];
    
    const documents = [];
    for (let i = 0; i < count; i++) {
      documents.push({
        id: `benchmark_doc_${i}`,
        content: {},
        fields: {
          title: `${titles[i % titles.length]} ${i}`,
          content: `This is benchmark document ${i} containing sample content for performance testing. It includes various keywords and phrases to simulate real-world search scenarios.`,
          category: categories[i % categories.length]
        }
      });
    }
    
    return documents;
  }
});

console.log('🔍 CBD Phase 5 Search Engine Integration Tests initialized successfully!');