/**
 * CBD Search Engine Module - Phase 5 Complete Implementation
 * 
 * Main export file for the CBD Search Engine module
 * Provides enterprise-grade full-text search with modern capabilities
 * 
 * @author CBD Database Team
 * @version 1.0.0
 * @created 2025-08-26
 */

// Core search engine exports
export { default as CBDSearchEngine } from './CBDSearchEngine';
export { default as SearchIndex } from './SearchIndex';
export { default as TextAnalysisEngine } from './TextAnalysisEngine';
export { default as HybridSearchEngine } from './HybridSearchEngine';

// Type exports from CBDSearchEngine
export type {
  SearchDocument,
  SearchQuery,
  SearchResponse,
  SearchResult,
  SearchField,
  IndexSchema,
  IndexSettings,
  TextAnalyzer,
  SearchFilter,
  SearchSort,
  FacetResult,
  BatchIndexResult,
  MultiSearchResponse,
  SearchEngineStats,
  SearchEngineHealth,
  Token,
  AnalyzeResult
} from './CBDSearchEngine';

// Type exports from HybridSearchEngine
export type {
  HybridSearchQuery,
  VectorSearchQuery,
  MultiModalQuery,
  HybridSearchResult,
  HybridSearchResponse,
  VectorSearchResult,
  FusionStatistics
} from './HybridSearchEngine';

// Type exports from TextAnalysisEngine
export type {
  AnalysisToken,
  AnalysisResult,
  AnalysisExplanation,
  AnalysisStep
} from './TextAnalysisEngine';

// Enum exports
export {
  SearchFieldType,
  FilterOperator,
  SimilarityAlgorithm,
  CompressionType,
  TokenizerType,
  TokenFilterType,
  CharFilterType
} from './CBDSearchEngine';

export {
  HybridSearchMode,
  ScoreFusionMode
} from './HybridSearchEngine';

export {
  PhoneticAlgorithm
} from './TextAnalysisEngine';

/**
 * Factory function to create a complete CBD Search Engine instance
 */
export function createCBDSearchEngine(settings?: any) {
  const CBDSearchEngineClass = require('./CBDSearchEngine').default;
  return new CBDSearchEngineClass(settings);
}

/**
 * Factory function to create a hybrid search engine
 */
export function createHybridSearchEngine(textEngine: any, vectorEngine: any) {
  const HybridSearchEngineClass = require('./HybridSearchEngine').default;
  return new HybridSearchEngineClass(textEngine, vectorEngine);
}

/**
 * Factory function to create a text analysis engine
 */
export function createTextAnalysisEngine() {
  const TextAnalysisEngineClass = require('./TextAnalysisEngine').default;
  return new TextAnalysisEngineClass();
}

// Re-export everything from CBDSearchEngine for convenience
export * from './CBDSearchEngine';

console.log('🔍 CBD Phase 5 Search Engine module loaded successfully!');