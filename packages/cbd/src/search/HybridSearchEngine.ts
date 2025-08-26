/**
 * CBD Hybrid Search Engine - Integration of Full-Text and Vector Search
 * 
 * Advanced hybrid search combining Phase 4 Multi-Modal Vector Engine with Phase 5 Search Engine
 * Features:
 * - Unified search interface for text and vector queries
 * - Score fusion algorithms (RRF, weighted combination)
 * - Multi-modal query processing (text, image, audio)
 * - Semantic similarity combined with keyword relevance
 * - Real-time index synchronization
 * 
 * Based on Azure AI Search hybrid capabilities and modern IR best practices
 * 
 * @author CBD Database Team
 * @version 1.0.0
 * @created 2025-08-26
 */

import { EventEmitter } from 'events';
import { 
  SearchQuery, 
  SearchResponse, 
  SearchResult, 
  SearchDocument,
  SearchFilter,
  SearchSort
} from './CBDSearchEngine';
import CBDSearchEngine from './CBDSearchEngine';

/**
 * Hybrid search interfaces
 */
export interface HybridSearchQuery extends SearchQuery {
  vectorQuery?: VectorSearchQuery;
  hybridMode?: HybridSearchMode;
  scoreFusion?: ScoreFusionConfig;
  semanticRanking?: boolean;
  multiModal?: MultiModalQuery;
}

export interface VectorSearchQuery {
  vector: number[];
  k?: number; // Number of nearest neighbors
  efSearch?: number; // HNSW search parameter
  filter?: SearchFilter[];
  boost?: number;
  threshold?: number; // Minimum similarity threshold
}

export interface MultiModalQuery {
  textQuery?: string;
  imageVector?: number[];
  audioVector?: number[];
  videoVector?: number[];
  weights?: ModalityWeights;
}

export interface ModalityWeights {
  text?: number;
  image?: number;
  audio?: number;
  video?: number;
}

export enum HybridSearchMode {
  TEXT_ONLY = 'text_only',
  VECTOR_ONLY = 'vector_only',
  HYBRID_RRF = 'hybrid_rrf', // Reciprocal Rank Fusion
  HYBRID_WEIGHTED = 'hybrid_weighted',
  HYBRID_SEMANTIC = 'hybrid_semantic'
}

export interface ScoreFusionConfig {
  mode: ScoreFusionMode;
  textWeight?: number;
  vectorWeight?: number;
  k?: number; // RRF parameter
  normalize?: boolean;
}

export enum ScoreFusionMode {
  WEIGHTED_SUM = 'weighted_sum',
  RRF = 'rrf', // Reciprocal Rank Fusion
  MAX = 'max',
  MIN = 'min',
  MULTIPLY = 'multiply',
  HARMONIC_MEAN = 'harmonic_mean'
}

export interface HybridSearchResult extends SearchResult {
  textScore?: number;
  vectorScore?: number;
  fusedScore: number;
  rerankScore?: number;
  modalityScores?: Record<string, number>;
}

export interface HybridSearchResponse extends SearchResponse {
  results: HybridSearchResult[];
  textResults?: SearchResult[];
  vectorResults?: VectorSearchResult[];
  fusionStats?: FusionStatistics;
}

export interface VectorSearchResult {
  id: string;
  document: SearchDocument;
  score: number;
  distance: number;
  vector?: number[];
}

export interface FusionStatistics {
  textResultCount: number;
  vectorResultCount: number;
  overlapCount: number;
  fusionMode: ScoreFusionMode;
  averageTextScore: number;
  averageVectorScore: number;
  averageFusedScore: number;
}

/**
 * Main hybrid search engine
 */
export class HybridSearchEngine extends EventEmitter {
  private textSearchEngine: CBDSearchEngine;
  private vectorSearchEngine: any; // Would be MultiModalVectorEngine from Phase 4
  private indexSyncManager: IndexSynchronizationManager;
  private scoreFuser: ScoreFusionEngine;
  private semanticRanker: SemanticRankingEngine;
  private isInitialized: boolean = false;

  constructor(
    textSearchEngine: CBDSearchEngine,
    vectorSearchEngine: any
  ) {
    super();
    
    this.textSearchEngine = textSearchEngine;
    this.vectorSearchEngine = vectorSearchEngine;
    this.indexSyncManager = new IndexSynchronizationManager(textSearchEngine, vectorSearchEngine);
    this.scoreFuser = new ScoreFusionEngine();
    this.semanticRanker = new SemanticRankingEngine();
  }

  /**
   * Initialize the hybrid search engine
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    this.emit('hybrid:initializing');

    // Initialize components
    await this.indexSyncManager.initialize();
    await this.scoreFuser.initialize();
    await this.semanticRanker.initialize();

    // Set up event listeners for index synchronization
    this.textSearchEngine.on('document:indexed', (event) => {
      this.indexSyncManager.handleTextIndexUpdate(event);
    });

    this.isInitialized = true;

    this.emit('hybrid:initialized');
  }

  /**
   * Perform hybrid search combining text and vector search
   */
  async search(indexName: string, query: HybridSearchQuery): Promise<HybridSearchResponse> {
    if (!this.isInitialized) {
      throw new Error('Hybrid search engine not initialized');
    }

    const startTime = Date.now();
    const hybridMode = query.hybridMode || HybridSearchMode.HYBRID_RRF;

    this.emit('hybrid:search:started', {
      indexName,
      hybridMode,
      query: query.query,
      hasVectorQuery: !!query.vectorQuery
    });

    let textResults: SearchResult[] = [];
    let vectorResults: VectorSearchResult[] = [];

    try {
      // Execute searches based on mode
      switch (hybridMode) {
        case HybridSearchMode.TEXT_ONLY:
          textResults = (await this.textSearchEngine.search(indexName, query)).results;
          break;

        case HybridSearchMode.VECTOR_ONLY:
          if (query.vectorQuery) {
            vectorResults = await this.vectorSearchEngine.search(indexName, query.vectorQuery);
          } else {
            throw new Error('Vector query required for vector-only search');
          }
          break;

        case HybridSearchMode.HYBRID_RRF:
        case HybridSearchMode.HYBRID_WEIGHTED:
        case HybridSearchMode.HYBRID_SEMANTIC:
          // Execute both searches in parallel
          const [textResponse, vectorResponse] = await Promise.all([
            this.textSearchEngine.search(indexName, query),
            query.vectorQuery 
              ? this.vectorSearchEngine.search(indexName, query.vectorQuery)
              : Promise.resolve([])
          ]);
          
          textResults = textResponse.results;
          vectorResults = vectorResponse;
          break;
      }

      // Handle multi-modal queries
      if (query.multiModal) {
        const multiModalResults = await this.executeMultiModalSearch(indexName, query.multiModal);
        vectorResults = this.combineModalityResults(vectorResults, multiModalResults);
      }

      // Fuse results
      const fusedResults = await this.fusionSearch(
        textResults,
        vectorResults,
        query.scoreFusion || { mode: ScoreFusionMode.RRF }
      );

      // Apply semantic ranking if requested
      let finalResults = fusedResults;
      if (query.semanticRanking && query.query) {
        finalResults = await this.semanticRanker.rerank(fusedResults, query.query);
      }

      // Apply sorting and pagination
      finalResults = this.applySorting(finalResults, query.sort || []);
      const offset = query.offset || 0;
      const limit = query.limit || 10;
      const paginatedResults = finalResults.slice(offset, offset + limit);

      // Generate fusion statistics
      const fusionStats = this.generateFusionStatistics(textResults, vectorResults, fusedResults);

      const response: HybridSearchResponse = {
        results: paginatedResults,
        totalHits: fusedResults.length,
        took: Date.now() - startTime,
        textResults,
        vectorResults,
        fusionStats
      };

      this.emit('hybrid:search:completed', {
        indexName,
        hybridMode,
        textResultCount: textResults.length,
        vectorResultCount: vectorResults.length,
        fusedResultCount: fusedResults.length,
        took: response.took
      });

      return response;

    } catch (error) {
      this.emit('hybrid:search:error', {
        indexName,
        error: error instanceof Error ? error.message : String(error)
      });
      throw error;
    }
  }

  /**
   * Index a document to both text and vector indexes
   */
  async indexDocument(indexName: string, document: SearchDocument): Promise<void> {
    await this.indexSyncManager.indexDocument(indexName, document);
  }

  /**
   * Update a document in both indexes
   */
  async updateDocument(indexName: string, document: SearchDocument): Promise<void> {
    await this.indexSyncManager.updateDocument(indexName, document);
  }

  /**
   * Delete a document from both indexes
   */
  async deleteDocument(indexName: string, documentId: string): Promise<void> {
    await this.indexSyncManager.deleteDocument(indexName, documentId);
  }

  /**
   * Get search suggestions using both text and semantic similarity
   */
  async suggest(indexName: string, query: string, field?: string): Promise<string[]> {
    // Combine text-based suggestions with semantic suggestions
    const textSuggestions = await this.textSearchEngine.suggest(indexName, query, field);
    
    // Generate vector for semantic suggestions
    if (this.vectorSearchEngine.generateEmbedding) {
      const queryVector = await this.vectorSearchEngine.generateEmbedding(query);
      const semanticSuggestions = await this.vectorSearchEngine.suggest(indexName, queryVector);
      
      // Merge and deduplicate suggestions
      const allSuggestions = [...textSuggestions, ...semanticSuggestions];
      return Array.from(new Set(allSuggestions)).slice(0, 10);
    }
    
    return textSuggestions;
  }

  // Private implementation methods

  private async executeMultiModalSearch(
    indexName: string, 
    multiModalQuery: MultiModalQuery
  ): Promise<Record<string, VectorSearchResult[]>> {
    const results: Record<string, VectorSearchResult[]> = {};

    // Text modality
    if (multiModalQuery.textQuery && this.vectorSearchEngine.generateTextEmbedding) {
      const textVector = await this.vectorSearchEngine.generateTextEmbedding(multiModalQuery.textQuery);
      results.text = await this.vectorSearchEngine.search(indexName, { vector: textVector });
    }

    // Image modality
    if (multiModalQuery.imageVector) {
      results.image = await this.vectorSearchEngine.searchByModality(indexName, {
        vector: multiModalQuery.imageVector,
        modality: 'image'
      });
    }

    // Audio modality
    if (multiModalQuery.audioVector) {
      results.audio = await this.vectorSearchEngine.searchByModality(indexName, {
        vector: multiModalQuery.audioVector,
        modality: 'audio'
      });
    }

    // Video modality
    if (multiModalQuery.videoVector) {
      results.video = await this.vectorSearchEngine.searchByModality(indexName, {
        vector: multiModalQuery.videoVector,
        modality: 'video'
      });
    }

    return results;
  }

  private combineModalityResults(
    existingResults: VectorSearchResult[],
    multiModalResults: Record<string, VectorSearchResult[]>
  ): VectorSearchResult[] {
    const combinedResults = [...existingResults];
    
    for (const [modality, results] of Object.entries(multiModalResults)) {
      for (const result of results) {
        const existingIndex = combinedResults.findIndex(r => r.id === result.id);
        if (existingIndex >= 0) {
          // Combine scores for existing document
          combinedResults[existingIndex].score = Math.max(
            combinedResults[existingIndex].score,
            result.score
          );
        } else {
          combinedResults.push(result);
        }
      }
    }

    return combinedResults.sort((a, b) => b.score - a.score);
  }

  private async fusionSearch(
    textResults: SearchResult[],
    vectorResults: VectorSearchResult[],
    fusionConfig: ScoreFusionConfig
  ): Promise<HybridSearchResult[]> {
    return await this.scoreFuser.fuseResults(textResults, vectorResults, fusionConfig);
  }

  private applySorting(results: HybridSearchResult[], sorts: SearchSort[]): HybridSearchResult[] {
    if (sorts.length === 0) {
      // Default sort by fused score descending
      return results.sort((a, b) => b.fusedScore - a.fusedScore);
    }

    return results.sort((a, b) => {
      for (const sort of sorts) {
        let aVal: any, bVal: any;
        
        if (sort.field === '_score') {
          aVal = a.fusedScore;
          bVal = b.fusedScore;
        } else if (sort.field === '_text_score') {
          aVal = a.textScore || 0;
          bVal = b.textScore || 0;
        } else if (sort.field === '_vector_score') {
          aVal = a.vectorScore || 0;
          bVal = b.vectorScore || 0;
        } else {
          aVal = a.document.fields[sort.field];
          bVal = b.document.fields[sort.field];
        }
        
        let comparison = 0;
        if (aVal < bVal) comparison = -1;
        else if (aVal > bVal) comparison = 1;
        
        if (sort.direction === 'desc') comparison *= -1;
        
        if (comparison !== 0) return comparison;
      }
      return 0;
    });
  }

  private generateFusionStatistics(
    textResults: SearchResult[],
    vectorResults: VectorSearchResult[],
    fusedResults: HybridSearchResult[]
  ): FusionStatistics {
    const textIds = new Set(textResults.map(r => r.id));
    const vectorIds = new Set(vectorResults.map(r => r.id));
    const overlap = textResults.filter(r => vectorIds.has(r.id));

    return {
      textResultCount: textResults.length,
      vectorResultCount: vectorResults.length,
      overlapCount: overlap.length,
      fusionMode: ScoreFusionMode.RRF,
      averageTextScore: textResults.reduce((sum, r) => sum + r.score, 0) / (textResults.length || 1),
      averageVectorScore: vectorResults.reduce((sum, r) => sum + r.score, 0) / (vectorResults.length || 1),
      averageFusedScore: fusedResults.reduce((sum, r) => sum + r.fusedScore, 0) / (fusedResults.length || 1)
    };
  }
}

/**
 * Score fusion engine for combining text and vector scores
 */
class ScoreFusionEngine {
  async initialize(): Promise<void> {
    // Initialize fusion algorithms
  }

  async fuseResults(
    textResults: SearchResult[],
    vectorResults: VectorSearchResult[],
    config: ScoreFusionConfig
  ): Promise<HybridSearchResult[]> {
    switch (config.mode) {
      case ScoreFusionMode.RRF:
        return this.reciprocalRankFusion(textResults, vectorResults, config.k || 60);
      
      case ScoreFusionMode.WEIGHTED_SUM:
        return this.weightedSumFusion(textResults, vectorResults, config);
      
      case ScoreFusionMode.MAX:
        return this.maxScoreFusion(textResults, vectorResults);
      
      case ScoreFusionMode.HARMONIC_MEAN:
        return this.harmonicMeanFusion(textResults, vectorResults);
      
      default:
        return this.reciprocalRankFusion(textResults, vectorResults, 60);
    }
  }

  private reciprocalRankFusion(
    textResults: SearchResult[],
    vectorResults: VectorSearchResult[],
    k: number = 60
  ): HybridSearchResult[] {
    const fusedScores = new Map<string, HybridSearchResult>();
    
    // Process text results
    textResults.forEach((result, rank) => {
      const rrfScore = 1 / (k + rank + 1);
      fusedScores.set(result.id, {
        ...result,
        textScore: result.score,
        vectorScore: 0,
        fusedScore: rrfScore
      });
    });

    // Process vector results
    vectorResults.forEach((result, rank) => {
      const rrfScore = 1 / (k + rank + 1);
      const existing = fusedScores.get(result.id);
      
      if (existing) {
        existing.vectorScore = result.score;
        existing.fusedScore += rrfScore;
      } else {
        fusedScores.set(result.id, {
          id: result.id,
          document: result.document,
          score: result.score,
          textScore: 0,
          vectorScore: result.score,
          fusedScore: rrfScore
        });
      }
    });

    return Array.from(fusedScores.values()).sort((a, b) => b.fusedScore - a.fusedScore);
  }

  private weightedSumFusion(
    textResults: SearchResult[],
    vectorResults: VectorSearchResult[],
    config: ScoreFusionConfig
  ): HybridSearchResult[] {
    const textWeight = config.textWeight || 0.5;
    const vectorWeight = config.vectorWeight || 0.5;
    const fusedScores = new Map<string, HybridSearchResult>();
    
    // Normalize scores if requested
    let maxTextScore = 1, maxVectorScore = 1;
    if (config.normalize) {
      maxTextScore = Math.max(...textResults.map(r => r.score), 1);
      maxVectorScore = Math.max(...vectorResults.map(r => r.score), 1);
    }

    // Process all unique documents
    const allIds = new Set([
      ...textResults.map(r => r.id),
      ...vectorResults.map(r => r.id)
    ]);

    for (const id of allIds) {
      const textResult = textResults.find(r => r.id === id);
      const vectorResult = vectorResults.find(r => r.id === id);
      
      const normalizedTextScore = textResult ? textResult.score / maxTextScore : 0;
      const normalizedVectorScore = vectorResult ? vectorResult.score / maxVectorScore : 0;
      
      const fusedScore = (normalizedTextScore * textWeight) + (normalizedVectorScore * vectorWeight);
      
      const document = textResult?.document || vectorResult?.document;
      if (!document) continue;

      fusedScores.set(id, {
        id,
        document,
        score: fusedScore,
        textScore: textResult?.score || 0,
        vectorScore: vectorResult?.score || 0,
        fusedScore
      });
    }

    return Array.from(fusedScores.values()).sort((a, b) => b.fusedScore - a.fusedScore);
  }

  private maxScoreFusion(
    textResults: SearchResult[],
    vectorResults: VectorSearchResult[]
  ): HybridSearchResult[] {
    const fusedScores = new Map<string, HybridSearchResult>();
    
    // Process all unique documents
    const allIds = new Set([
      ...textResults.map(r => r.id),
      ...vectorResults.map(r => r.id)
    ]);

    for (const id of allIds) {
      const textResult = textResults.find(r => r.id === id);
      const vectorResult = vectorResults.find(r => r.id === id);
      
      const textScore = textResult?.score || 0;
      const vectorScore = vectorResult?.score || 0;
      const fusedScore = Math.max(textScore, vectorScore);
      
      const document = textResult?.document || vectorResult?.document;
      if (!document) continue;

      fusedScores.set(id, {
        id,
        document,
        score: fusedScore,
        textScore,
        vectorScore,
        fusedScore
      });
    }

    return Array.from(fusedScores.values()).sort((a, b) => b.fusedScore - a.fusedScore);
  }

  private harmonicMeanFusion(
    textResults: SearchResult[],
    vectorResults: VectorSearchResult[]
  ): HybridSearchResult[] {
    const fusedScores = new Map<string, HybridSearchResult>();
    
    // Only consider documents that appear in both result sets
    for (const textResult of textResults) {
      const vectorResult = vectorResults.find(r => r.id === textResult.id);
      if (vectorResult) {
        const harmonicMean = (2 * textResult.score * vectorResult.score) / 
                           (textResult.score + vectorResult.score);
        
        fusedScores.set(textResult.id, {
          ...textResult,
          textScore: textResult.score,
          vectorScore: vectorResult.score,
          fusedScore: harmonicMean
        });
      }
    }

    return Array.from(fusedScores.values()).sort((a, b) => b.fusedScore - a.fusedScore);
  }
}

/**
 * Semantic ranking engine for result reranking
 */
class SemanticRankingEngine {
  async initialize(): Promise<void> {
    // Initialize semantic ranking models
  }

  async rerank(results: HybridSearchResult[], query: string): Promise<HybridSearchResult[]> {
    // In a real implementation, would use semantic similarity models
    // For now, boost results that contain query terms in semantic context
    return results.map(result => {
      const rerankScore = this.calculateSemanticSimilarity(query, result);
      return {
        ...result,
        rerankScore,
        fusedScore: result.fusedScore * (1 + rerankScore * 0.1) // Boost by up to 10%
      };
    }).sort((a, b) => b.fusedScore - a.fusedScore);
  }

  private calculateSemanticSimilarity(query: string, result: HybridSearchResult): number {
    // Simplified semantic similarity calculation
    // In production, would use pre-trained language models
    const queryTerms = query.toLowerCase().split(' ');
    const documentText = Object.values(result.document.fields)
      .join(' ')
      .toLowerCase();
    
    let matches = 0;
    for (const term of queryTerms) {
      if (documentText.includes(term)) {
        matches++;
      }
    }
    
    return matches / queryTerms.length;
  }
}

/**
 * Index synchronization manager
 */
class IndexSynchronizationManager {
  constructor(
    private textEngine: CBDSearchEngine,
    private vectorEngine: any
  ) {}

  async initialize(): Promise<void> {
    // Initialize synchronization
  }

  async indexDocument(indexName: string, document: SearchDocument): Promise<void> {
    // Index to both engines
    await Promise.all([
      this.textEngine.indexDocument(indexName, document),
      this.vectorEngine.indexDocument(indexName, document)
    ]);
  }

  async updateDocument(indexName: string, document: SearchDocument): Promise<void> {
    await Promise.all([
      this.textEngine.updateDocument(indexName, document),
      this.vectorEngine.updateDocument(indexName, document)
    ]);
  }

  async deleteDocument(indexName: string, documentId: string): Promise<void> {
    await Promise.all([
      this.textEngine.deleteDocument(indexName, documentId),
      this.vectorEngine.deleteDocument(indexName, documentId)
    ]);
  }

  handleTextIndexUpdate(event: any): void {
    // Handle text index updates and sync to vector index if needed
  }
}

export default HybridSearchEngine;