/**
 * CBD Multi-Modal Vector Engine - Comprehensive Integration Tests
 * Phase 4: Testing advanced multi-modal search capabilities
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  CBDMultiModalVectorEngine,
  AzureMultiModalProvider,
  MultiModalDocument,
  MultiModalQuery,
  ModalityType,
  VectorSimilarityEngine,
  MultiModalFusionEngine
} from '../src/multi-modal/MultiModalVectorEngine';

describe('CBD Multi-Modal Vector Engine - Integration Tests', () => {
  let engine: CBDMultiModalVectorEngine;
  let provider: AzureMultiModalProvider;

  beforeEach(async () => {
    // Initialize with mock Azure provider
    provider = new AzureMultiModalProvider({
      apiKey: 'test-key',
      endpoint: 'https://test.openai.azure.com/',
      deploymentName: 'test-deployment'
    });
    
    engine = new CBDMultiModalVectorEngine(provider);
  });

  afterEach(() => {
    engine.removeAllListeners();
  });

  describe('Engine Initialization and Statistics', () => {
    it('should initialize with correct model specifications', () => {
      const stats = engine.getStats();
      
      expect(stats.model.name).toBe('azure-multimodal-clip');
      expect(stats.model.dimensions).toBe(1536);
      expect(stats.model.supportedModalities).toContain('text');
      expect(stats.model.supportedModalities).toContain('image');
      expect(stats.model.supportedModalities).toContain('audio');
      expect(stats.model.supportedModalities).toContain('multimodal');
      expect(stats.totalDocuments).toBe(0);
      expect(stats.totalQueries).toBe(0);
    });

    it('should update statistics correctly', () => {
      const initialStats = engine.getStats();
      expect(initialStats.modalityDistribution.text).toBe(0);
      expect(initialStats.modalityDistribution.image).toBe(0);
    });
  });

  describe('Document Indexing', () => {
    it('should index text documents correctly', async () => {
      const document = {
        content: 'This is a test document about artificial intelligence and machine learning.',
        modality: 'text' as ModalityType,
        metadata: {
          category: 'technology',
          language: 'en'
        },
        originalData: {
          text: 'This is a test document about artificial intelligence and machine learning.'
        }
      };

      const docId = await engine.indexDocument(document);
      
      expect(docId).toBeDefined();
      expect(docId).toMatch(/^cbd-doc-\d+-[a-z0-9]+$/);
      
      const retrievedDoc = engine.getDocument(docId);
      expect(retrievedDoc).toBeDefined();
      expect(retrievedDoc!.content).toBe(document.content);
      expect(retrievedDoc!.modality).toBe('text');
      expect(retrievedDoc!.embeddings.text).toBeDefined();
      expect(retrievedDoc!.embeddings.text!.length).toBe(1536);

      const stats = engine.getStats();
      expect(stats.totalDocuments).toBe(1);
      expect(stats.modalityDistribution.text).toBe(1);
    });

    it('should index image documents correctly', async () => {
      const document = {
        content: 'Beautiful landscape photo with mountains and lakes',
        modality: 'image' as ModalityType,
        metadata: {
          category: 'photography',
          resolution: '1920x1080'
        },
        originalData: {
          imageUrl: 'test-image-url',
          binaryData: Buffer.from('fake-image-data', 'utf-8')
        }
      };

      const docId = await engine.indexDocument(document);
      
      expect(docId).toBeDefined();
      
      const retrievedDoc = engine.getDocument(docId);
      expect(retrievedDoc).toBeDefined();
      expect(retrievedDoc!.embeddings.image).toBeDefined();
      expect(retrievedDoc!.embeddings.image!.length).toBe(1536);
      expect(retrievedDoc!.originalData?.binaryData).toEqual(document.originalData.binaryData);

      const stats = engine.getStats();
      expect(stats.modalityDistribution.image).toBe(1);
    });

    it('should index multi-modal documents correctly', async () => {
      const document = {
        content: 'Document with both text and image content',
        modality: 'multimodal' as ModalityType,
        metadata: {
          category: 'mixed-media',
          hasText: true,
          hasImage: true
        },
        originalData: {
          text: 'Document with both text and image content',
          binaryData: Buffer.from('fake-image-data', 'utf-8')
        }
      };

      const docId = await engine.indexDocument(document);
      
      const retrievedDoc = engine.getDocument(docId);
      expect(retrievedDoc).toBeDefined();
      expect(retrievedDoc!.embeddings.text).toBeDefined();
      expect(retrievedDoc!.embeddings.image).toBeDefined();
      expect(retrievedDoc!.embeddings.multimodal).toBeDefined();
      expect(retrievedDoc!.embeddings.multimodal!.length).toBe(1536);
    });

    it('should handle audio documents correctly', async () => {
      const document = {
        content: 'Audio recording of a classical music piece',
        modality: 'audio' as ModalityType,
        metadata: {
          category: 'music',
          duration: '3:45',
          genre: 'classical'
        },
        originalData: {
          audioBuffer: Buffer.from('fake-audio-data', 'utf-8')
        }
      };

      const docId = await engine.indexDocument(document);
      
      const retrievedDoc = engine.getDocument(docId);
      expect(retrievedDoc).toBeDefined();
      expect(retrievedDoc!.embeddings.audio).toBeDefined();
      expect(retrievedDoc!.embeddings.audio!.length).toBe(1536);
    });

    it('should emit indexing events correctly', async () => {
      let indexingEvent: any = null;
      engine.on('document:indexed', (event) => {
        indexingEvent = event;
      });

      const document = {
        content: 'Test document for events',
        modality: 'text' as ModalityType,
        metadata: {},
        originalData: { text: 'Test document for events' }
      };

      await engine.indexDocument(document);
      
      expect(indexingEvent).toBeDefined();
      expect(indexingEvent.documentId).toBeDefined();
      expect(indexingEvent.modality).toBe('text');
      expect(indexingEvent.indexTime).toBeGreaterThan(0);
      expect(indexingEvent.embeddings).toContain('text');
    });
  });

  describe('Similarity Search', () => {
    beforeEach(async () => {
      // Index sample documents
      await engine.indexDocument({
        content: 'Artificial intelligence and machine learning technologies',
        modality: 'text' as ModalityType,
        metadata: { category: 'ai' },
        originalData: { text: 'Artificial intelligence and machine learning technologies' }
      });

      await engine.indexDocument({
        content: 'Beautiful mountain landscape photography',
        modality: 'image' as ModalityType,
        metadata: { category: 'photography' },
        originalData: { binaryData: Buffer.from('mountain-image', 'utf-8') }
      });

      await engine.indexDocument({
        content: 'Classical music symphony recording',
        modality: 'audio' as ModalityType,
        metadata: { category: 'music' },
        originalData: { audioBuffer: Buffer.from('symphony-audio', 'utf-8') }
      });
    });

    it('should perform text similarity search correctly', async () => {
      const query: MultiModalQuery = {
        type: 'similarity',
        modalities: ['text'],
        query: {
          text: 'machine learning artificial intelligence'
        },
        limit: 5,
        threshold: 0.1
      };

      const results = await engine.search(query);
      
      expect(results).toBeDefined();
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].document.modality).toBe('text');
      expect(results[0].score).toBeGreaterThan(0.1);
      expect(results[0].relevanceScores.text).toBeDefined();
      expect(results[0].metadata.queryType).toBe('similarity');
      expect(results[0].metadata.modalities).toContain('text');
    });

    it('should perform image similarity search correctly', async () => {
      const query: MultiModalQuery = {
        type: 'similarity',
        modalities: ['image'],
        query: {
          imageBuffer: Buffer.from('landscape-query-image', 'utf-8')
        },
        limit: 5,
        threshold: 0.1
      };

      const results = await engine.search(query);
      
      expect(results).toBeDefined();
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].relevanceScores.image).toBeDefined();
      expect(results[0].relevanceScores.image).toBeGreaterThan(0.1);
    });

    it('should handle empty search results with high threshold', async () => {
      const query: MultiModalQuery = {
        type: 'similarity',
        modalities: ['text'],
        query: {
          text: 'completely unrelated content xyz789'
        },
        threshold: 0.9 // Very high threshold
      };

      const results = await engine.search(query);
      expect(results.length).toBe(0);
    });

    it('should emit search events correctly', async () => {
      let searchEvent: any = null;
      engine.on('search:completed', (event) => {
        searchEvent = event;
      });

      const query: MultiModalQuery = {
        type: 'similarity',
        modalities: ['text'],
        query: { text: 'test query' }
      };

      await engine.search(query);
      
      expect(searchEvent).toBeDefined();
      expect(searchEvent.queryType).toBe('similarity');
      expect(searchEvent.modalities).toContain('text');
      expect(searchEvent.searchTime).toBeGreaterThan(0);
      expect(searchEvent.resultCount).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Hybrid Search', () => {
    beforeEach(async () => {
      await engine.indexDocument({
        content: 'Technology article about AI developments',
        modality: 'multimodal' as ModalityType,
        metadata: { category: 'tech', importance: 'high' },
        originalData: {
          text: 'Technology article about AI developments',
          binaryData: Buffer.from('tech-diagram', 'utf-8')
        }
      });

      await engine.indexDocument({
        content: 'Nature photography with wildlife',
        modality: 'multimodal' as ModalityType,
        metadata: { category: 'nature', importance: 'medium' },
        originalData: {
          text: 'Nature photography with wildlife',
          binaryData: Buffer.from('wildlife-photo', 'utf-8')
        }
      });
    });

    it('should perform hybrid search across modalities', async () => {
      const query: MultiModalQuery = {
        type: 'hybrid',
        modalities: ['text', 'image'],
        query: {
          text: 'technology artificial intelligence',
          imageBuffer: Buffer.from('tech-query-image', 'utf-8')
        },
        fusionWeights: { text: 0.7, image: 0.3 },
        threshold: 0.1
      };

      const results = await engine.search(query);
      
      expect(results).toBeDefined();
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].score).toBeGreaterThan(0.1);
      expect(results[0].relevanceScores.text).toBeDefined();
      expect(results[0].relevanceScores.image).toBeDefined();
      expect(results[0].metadata.queryType).toBe('hybrid');
    });

    it('should respect fusion weights in hybrid search', async () => {
      const query: MultiModalQuery = {
        type: 'hybrid',
        modalities: ['text', 'image'],
        query: {
          text: 'technology',
          imageBuffer: Buffer.from('tech-image', 'utf-8')
        },
        fusionWeights: { text: 0.9, image: 0.1 }, // Heavily weight text
        threshold: 0.0
      };

      const results = await engine.search(query);
      
      expect(results).toBeDefined();
      // Results should be primarily influenced by text similarity
      expect(results[0].relevanceScores.text).toBeDefined();
      expect(results[0].relevanceScores.image).toBeDefined();
    });
  });

  describe('Cross-Modal Search', () => {
    beforeEach(async () => {
      await engine.indexDocument({
        content: 'Image of a sunset over the ocean',
        modality: 'image' as ModalityType,
        metadata: { scene: 'sunset', location: 'ocean' },
        originalData: { binaryData: Buffer.from('sunset-ocean', 'utf-8') }
      });

      await engine.indexDocument({
        content: 'Beautiful sunset with golden colors',
        modality: 'text' as ModalityType,
        metadata: { scene: 'sunset', medium: 'text' },
        originalData: { text: 'Beautiful sunset with golden colors' }
      });
    });

    it('should perform cross-modal search (text to image)', async () => {
      const query: MultiModalQuery = {
        type: 'cross-modal',
        modalities: ['image'], // Looking for images
        query: {
          text: 'sunset ocean beautiful colors' // Using text query
        },
        threshold: 0.1
      };

      const results = await engine.search(query);
      
      expect(results).toBeDefined();
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].crossModalRelevance).toBeDefined();
      expect(results[0].crossModalRelevance).toBeGreaterThan(0.1);
      expect(results[0].metadata.queryType).toBe('cross-modal');
    });

    it('should perform cross-modal search (image to text)', async () => {
      const query: MultiModalQuery = {
        type: 'cross-modal',
        modalities: ['text'], // Looking for text
        query: {
          imageBuffer: Buffer.from('sunset-query', 'utf-8') // Using image query
        },
        threshold: 0.1
      };

      const results = await engine.search(query);
      
      expect(results).toBeDefined();
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].crossModalRelevance).toBeDefined();
    });
  });

  describe('Multi-Modal Fusion Search', () => {
    beforeEach(async () => {
      await engine.indexDocument({
        content: 'Research paper about neural networks with diagrams',
        modality: 'multimodal' as ModalityType,
        metadata: { type: 'research', topic: 'neural-networks' },
        originalData: {
          text: 'Research paper about neural networks with diagrams',
          binaryData: Buffer.from('neural-network-diagram', 'utf-8')
        }
      });

      await engine.indexDocument({
        content: 'Music album cover with band photo',
        modality: 'multimodal' as ModalityType,
        metadata: { type: 'music', genre: 'rock' },
        originalData: {
          text: 'Music album cover with band photo',
          binaryData: Buffer.from('album-cover', 'utf-8'),
          audioBuffer: Buffer.from('sample-track', 'utf-8')
        }
      });
    });

    it('should perform multi-modal fusion search correctly', async () => {
      const query: MultiModalQuery = {
        type: 'multimodal-fusion',
        modalities: ['multimodal', 'text', 'image'],
        query: {
          text: 'neural networks research',
          imageBuffer: Buffer.from('research-diagram', 'utf-8')
        },
        fusionWeights: { text: 0.4, image: 0.6 },
        threshold: 0.1
      };

      const results = await engine.search(query);
      
      expect(results).toBeDefined();
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].score).toBeGreaterThan(0.1);
      expect(results[0].metadata.queryType).toBe('multimodal-fusion');
    });

    it('should handle complex multi-modal queries with three modalities', async () => {
      const query: MultiModalQuery = {
        type: 'multimodal-fusion',
        modalities: ['text', 'image', 'audio'],
        query: {
          text: 'music band performance',
          imageBuffer: Buffer.from('concert-photo', 'utf-8'),
          audioBuffer: Buffer.from('music-sample', 'utf-8')
        },
        threshold: 0.05
      };

      const results = await engine.search(query);
      
      expect(results).toBeDefined();
      expect(results[0].relevanceScores.text).toBeDefined();
      expect(results[0].relevanceScores.image).toBeDefined();
      expect(results[0].relevanceScores.audio).toBeDefined();
    });
  });

  describe('Vector Similarity Algorithms', () => {
    it('should calculate cosine similarity correctly', () => {
      const vec1 = [1, 2, 3];
      const vec2 = [4, 5, 6];
      
      const similarity = VectorSimilarityEngine.cosineSimilarity(vec1, vec2);
      
      expect(similarity).toBeGreaterThan(0);
      expect(similarity).toBeLessThanOrEqual(1);
      
      // Test with identical vectors
      const identicalSimilarity = VectorSimilarityEngine.cosineSimilarity(vec1, vec1);
      expect(identicalSimilarity).toBeCloseTo(1, 10);
    });

    it('should calculate euclidean distance correctly', () => {
      const vec1 = [0, 0, 0];
      const vec2 = [3, 4, 0];
      
      const distance = VectorSimilarityEngine.euclideanDistance(vec1, vec2);
      expect(distance).toBeCloseTo(5, 5); // 3-4-5 triangle
      
      // Test with identical vectors
      const identicalDistance = VectorSimilarityEngine.euclideanDistance(vec1, vec1);
      expect(identicalDistance).toBe(0);
    });

    it('should calculate dot product correctly', () => {
      const vec1 = [1, 2, 3];
      const vec2 = [4, 5, 6];
      
      const product = VectorSimilarityEngine.dotProduct(vec1, vec2);
      expect(product).toBe(32); // 1*4 + 2*5 + 3*6 = 4 + 10 + 18 = 32
    });

    it('should throw error for mismatched vector dimensions', () => {
      const vec1 = [1, 2, 3];
      const vec2 = [4, 5];
      
      expect(() => VectorSimilarityEngine.cosineSimilarity(vec1, vec2)).toThrow('same dimension');
      expect(() => VectorSimilarityEngine.euclideanDistance(vec1, vec2)).toThrow('same dimension');
      expect(() => VectorSimilarityEngine.dotProduct(vec1, vec2)).toThrow('same dimension');
    });
  });

  describe('Multi-Modal Fusion Algorithms', () => {
    it('should perform weighted fusion correctly', () => {
      const embeddings = {
        text: [1, 0, 0],
        image: [0, 1, 0]
      };
      const weights = {
        text: 0.7,
        image: 0.3
      };
      
      const fused = MultiModalFusionEngine.weightedFusion(embeddings, weights);
      
      expect(fused).toBeDefined();
      expect(fused.length).toBe(3);
      expect(fused[0]).toBeCloseTo(0.7, 5);
      expect(fused[1]).toBeCloseTo(0.3, 5);
      expect(fused[2]).toBeCloseTo(0, 5);
    });

    it('should perform attention fusion correctly', () => {
      const embeddings = {
        text: [1, 0, 0],
        image: [0, 1, 0],
        audio: [0, 0, 1]
      };
      
      const fused = MultiModalFusionEngine.attentionFusion(embeddings);
      
      expect(fused).toBeDefined();
      expect(fused.length).toBe(3);
      // All embeddings should contribute equally without context
      expect(fused[0]).toBeCloseTo(1/3, 5);
      expect(fused[1]).toBeCloseTo(1/3, 5);
      expect(fused[2]).toBeCloseTo(1/3, 5);
    });

    it('should perform context-aware attention fusion', () => {
      const embeddings = {
        text: [1, 0, 0],
        image: [0, 1, 0]
      };
      const context = [1, 0, 0]; // Similar to text embedding
      
      const fused = MultiModalFusionEngine.attentionFusion(embeddings, context);
      
      expect(fused).toBeDefined();
      expect(fused.length).toBe(3);
      // Text embedding should have higher weight due to context similarity
      expect(fused[0]).toBeGreaterThan(fused[1]);
    });

    it('should handle empty embeddings gracefully', () => {
      expect(() => MultiModalFusionEngine.weightedFusion({}, {})).toThrow('No embeddings provided');
      expect(() => MultiModalFusionEngine.attentionFusion({})).toThrow('No embeddings provided');
    });
  });

  describe('Document Management', () => {
    let docId: string;

    beforeEach(async () => {
      docId = await engine.indexDocument({
        content: 'Test document for management',
        modality: 'text' as ModalityType,
        metadata: { version: 1 },
        originalData: { text: 'Test document for management' }
      });
    });

    it('should update documents correctly', async () => {
      await engine.updateDocument(docId, {
        content: 'Updated test document',
        metadata: { version: 2 }
      });
      
      const updated = engine.getDocument(docId);
      expect(updated).toBeDefined();
      expect(updated!.content).toBe('Updated test document');
      expect(updated!.metadata.version).toBe(2);
      expect(updated!.updatedAt).toBeDefined();
    });

    it('should delete documents correctly', async () => {
      const initialStats = engine.getStats();
      
      await engine.deleteDocument(docId);
      
      const deleted = engine.getDocument(docId);
      expect(deleted).toBeUndefined();
      
      const newStats = engine.getStats();
      expect(newStats.totalDocuments).toBe(initialStats.totalDocuments - 1);
    });

    it('should throw error for non-existent document operations', async () => {
      await expect(engine.updateDocument('non-existent', {})).rejects.toThrow('not found');
      await expect(engine.deleteDocument('non-existent')).rejects.toThrow('not found');
    });
  });

  describe('Batch Operations', () => {
    it('should perform batch indexing efficiently', async () => {
      const documents = [
        {
          content: 'Batch document 1',
          modality: 'text' as ModalityType,
          metadata: { batch: 1 },
          originalData: { text: 'Batch document 1' }
        },
        {
          content: 'Batch document 2',
          modality: 'text' as ModalityType,
          metadata: { batch: 1 },
          originalData: { text: 'Batch document 2' }
        },
        {
          content: 'Batch image document',
          modality: 'image' as ModalityType,
          metadata: { batch: 1 },
          originalData: { binaryData: Buffer.from('batch-image', 'utf-8') }
        }
      ];

      let batchEvent: any = null;
      engine.on('batch:indexed', (event) => {
        batchEvent = event;
      });

      const documentIds = await engine.batchIndexDocuments(documents);
      
      expect(documentIds).toBeDefined();
      expect(documentIds.length).toBe(3);
      expect(batchEvent).toBeDefined();
      expect(batchEvent.totalDocuments).toBe(3);
      expect(batchEvent.documentIds).toEqual(documentIds);
      
      const stats = engine.getStats();
      expect(stats.totalDocuments).toBeGreaterThanOrEqual(3);
    });
  });

  describe('Filtering and Metadata Search', () => {
    beforeEach(async () => {
      await engine.indexDocument({
        content: 'High priority document',
        modality: 'text' as ModalityType,
        metadata: { priority: 'high', category: 'urgent' },
        originalData: { text: 'High priority document' }
      });

      await engine.indexDocument({
        content: 'Low priority document',
        modality: 'text' as ModalityType,
        metadata: { priority: 'low', category: 'normal' },
        originalData: { text: 'Low priority document' }
      });
    });

    it('should filter results by metadata', async () => {
      const query: MultiModalQuery = {
        type: 'similarity',
        modalities: ['text'],
        query: { text: 'document' },
        filters: { 'metadata.priority': 'high' },
        threshold: 0.1
      };

      const results = await engine.search(query);
      
      expect(results).toBeDefined();
      expect(results.length).toBeGreaterThan(0);
      expect(results.every(r => r.document.metadata.priority === 'high')).toBe(true);
    });

    it('should filter by modality', async () => {
      const query: MultiModalQuery = {
        type: 'similarity',
        modalities: ['text'],
        query: { text: 'document' },
        filters: { modality: 'text' },
        threshold: 0.1
      };

      const results = await engine.search(query);
      
      expect(results).toBeDefined();
      expect(results.every(r => r.document.modality === 'text')).toBe(true);
    });

    it('should filter by date range', async () => {
      const now = new Date();
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
      
      const query: MultiModalQuery = {
        type: 'similarity',
        modalities: ['text'],
        query: { text: 'document' },
        filters: { createdAfter: oneHourAgo.toISOString() },
        threshold: 0.1
      };

      const results = await engine.search(query);
      
      expect(results).toBeDefined();
      expect(results.every(r => r.document.createdAt > oneHourAgo)).toBe(true);
    });
  });

  describe('Performance and Scalability', () => {
    it('should handle large document collections efficiently', async () => {
      const startTime = Date.now();
      
      // Index a moderate number of documents
      const documents = Array.from({ length: 50 }, (_, i) => ({
        content: `Performance test document ${i} with content about technology and innovation`,
        modality: 'text' as ModalityType,
        metadata: { index: i, category: 'performance' },
        originalData: { text: `Performance test document ${i} with content about technology and innovation` }
      }));

      await engine.batchIndexDocuments(documents);
      
      const indexTime = Date.now() - startTime;
      expect(indexTime).toBeLessThan(30000); // Should complete within 30 seconds
      
      // Test search performance
      const searchStart = Date.now();
      const results = await engine.search({
        type: 'similarity',
        modalities: ['text'],
        query: { text: 'technology innovation' },
        limit: 10
      });
      
      const searchTime = Date.now() - searchStart;
      expect(searchTime).toBeLessThan(5000); // Search should be fast
      expect(results.length).toBeGreaterThan(0);
      
      const stats = engine.getStats();
      expect(stats.averageSearchTime).toBeGreaterThan(0);
    });

    it('should maintain search quality with diverse content', async () => {
      // Index documents with different modalities and content
      const diverseDocuments = [
        {
          content: 'Machine learning algorithms and neural networks',
          modality: 'text' as ModalityType,
          metadata: { topic: 'ai' },
          originalData: { text: 'Machine learning algorithms and neural networks' }
        },
        {
          content: 'Beautiful nature photography landscape',
          modality: 'image' as ModalityType,
          metadata: { topic: 'nature' },
          originalData: { binaryData: Buffer.from('nature-photo', 'utf-8') }
        },
        {
          content: 'Classical music symphony composition',
          modality: 'audio' as ModalityType,
          metadata: { topic: 'music' },
          originalData: { audioBuffer: Buffer.from('classical-symphony', 'utf-8') }
        },
        {
          content: 'Research paper with visual diagrams about quantum computing',
          modality: 'multimodal' as ModalityType,
          metadata: { topic: 'quantum' },
          originalData: {
            text: 'Research paper with visual diagrams about quantum computing',
            binaryData: Buffer.from('quantum-diagram', 'utf-8')
          }
        }
      ];

      await engine.batchIndexDocuments(diverseDocuments);
      
      // Test different types of searches
      const textSearch = await engine.search({
        type: 'similarity',
        modalities: ['text'],
        query: { text: 'artificial intelligence machine learning' },
        threshold: 0.1
      });
      
      const multiModalSearch = await engine.search({
        type: 'multimodal-fusion',
        modalities: ['text', 'image'],
        query: {
          text: 'research visual analysis',
          imageBuffer: Buffer.from('research-query', 'utf-8')
        },
        threshold: 0.1
      });
      
      expect(textSearch.length).toBeGreaterThan(0);
      expect(multiModalSearch.length).toBeGreaterThan(0);
      expect(textSearch[0].score).toBeGreaterThan(0.1);
      expect(multiModalSearch[0].score).toBeGreaterThan(0.1);
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid query parameters gracefully', async () => {
      const invalidQuery: any = {
        type: 'invalid-type',
        modalities: ['text'],
        query: { text: 'test' }
      };

      await expect(engine.search(invalidQuery)).rejects.toThrow('Unsupported query type');
    });

    it('should emit error events for failed operations', async () => {
      let errorEvent: any = null;
      engine.on('search:error', (event) => {
        errorEvent = event;
      });

      const invalidQuery: any = {
        type: 'invalid-search-type',
        modalities: ['text'],
        query: { text: 'test' }
      };

      try {
        await engine.search(invalidQuery);
      } catch (error) {
        // Expected to throw
      }

      expect(errorEvent).toBeDefined();
      expect(errorEvent.error).toBeDefined();
      expect(errorEvent.searchTime).toBeGreaterThan(0);
    });

    it('should handle empty query results gracefully', async () => {
      const emptyQuery: MultiModalQuery = {
        type: 'similarity',
        modalities: ['text'],
        query: { text: 'nonexistent-content-xyz-123' },
        threshold: 0.99 // Very high threshold
      };

      const results = await engine.search(emptyQuery);
      expect(results).toBeDefined();
      expect(results.length).toBe(0);
    });
  });
});