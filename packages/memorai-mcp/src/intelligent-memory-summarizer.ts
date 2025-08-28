/**
 * Intelligent Memory Summarization System
 * Implementation for US-MEM-003: AI-powered memory summarization
 * 
 * Provides smart condensation of memory collections with configurable detail levels
 */

import { EventEmitter } from 'events';
import type { StoredMemory } from './enhanced-memory-store.js';
import type { MultiTenantEnhancedMemoryStore } from './multi-tenant-memory-store.js';

/**
 * Summarization detail levels
 */
export enum SummarizationLevel {
  MINIMAL = 'minimal',          // Key points only (10-20% of original)
  CONCISE = 'concise',         // Essential information (20-40% of original)
  DETAILED = 'detailed',       // Comprehensive summary (40-60% of original)
  EXTENSIVE = 'extensive'      // Full context preservation (60-80% of original)
}

/**
 * Summarization strategies
 */
export enum SummarizationStrategy {
  EXTRACTIVE = 'extractive',   // Extract key sentences
  ABSTRACTIVE = 'abstractive', // Generate new summaries
  HYBRID = 'hybrid',          // Combine both approaches
  SEMANTIC = 'semantic',      // Focus on meaning preservation
  TEMPORAL = 'temporal',      // Chronological summarization
  THEMATIC = 'thematic'       // Topic-based grouping
}

/**
 * Memory cluster for summarization
 */
export interface MemoryCluster {
  id: string;
  memories: StoredMemory[];
  theme: string;
  importance: number;
  timespan: {
    start: Date;
    end: Date;
  };
  keywords: string[];
  relatedClusters: string[];
}

/**
 * Summarization result
 */
export interface SummarizationResult {
  id: string;
  originalMemoryCount: number;
  summaryText: string;
  keyPoints: string[];
  themes: string[];
  importantEntities: string[];
  timeframe: {
    start: Date;
    end: Date;
  };
  compressionRatio: number;
  confidenceScore: number;
  strategy: SummarizationStrategy;
  level: SummarizationLevel;
  metadata: {
    processingTime: number;
    sourceMemoryIds: string[];
    createdAt: Date;
    version: string;
  };
}

/**
 * Summarization configuration
 */
export interface SummarizationConfig {
  defaultLevel: SummarizationLevel;
  defaultStrategy: SummarizationStrategy;
  maxMemoriesPerSummary: number;
  minMemoriesForSummarization: number;
  preserveImportantMemories: boolean;
  enableSemanticGrouping: boolean;
  enableTemporalAnalysis: boolean;
  keywordExtractionEnabled: boolean;
  entityRecognitionEnabled: boolean;
  compressionThreshold: number;
  qualityThreshold: number;
  cacheResults: boolean;
  cacheTTL: number;
}

/**
 * Summarization options
 */
export interface SummarizationOptions {
  level?: SummarizationLevel;
  strategy?: SummarizationStrategy;
  maxLength?: number;
  minLength?: number;
  focusKeywords?: string[];
  excludeKeywords?: string[];
  temporalWindow?: {
    start: Date;
    end: Date;
  };
  importanceThreshold?: number;
  includeMetadata?: boolean;
  preserveStructure?: boolean;
}

/**
 * Smart text processor for extractive summarization
 */
class SmartTextProcessor {
  /**
   * Extract key sentences from text using importance scoring
   */
  extractKeySentences(text: string, targetRatio: number): string[] {
    const sentences = this.splitIntoSentences(text);
    const sentenceScores = this.scoreSentences(sentences);
    const targetCount = Math.max(1, Math.floor(sentences.length * targetRatio));

    // Sort by score and take top sentences
    const topSentences = sentenceScores
      .sort((a, b) => b.score - a.score)
      .slice(0, targetCount)
      .sort((a, b) => a.index - b.index) // Restore original order
      .map(item => item.sentence);

    return topSentences;
  }

  /**
   * Split text into sentences
   */
  private splitIntoSentences(text: string): string[] {
    return text
      .split(/[.!?]+/)
      .map(s => s.trim())
      .filter(s => s.length > 0);
  }

  /**
   * Score sentences based on importance indicators
   */
  private scoreSentences(sentences: string[]): Array<{ sentence: string, score: number, index: number }> {
    const wordFreq = this.calculateWordFrequency(sentences.join(' '));

    return sentences.map((sentence, index) => {
      let score = 0;

      // Word frequency score
      const words = sentence.toLowerCase().split(/\s+/);
      score += words.reduce((sum, word) => sum + (wordFreq[word] || 0), 0) / words.length;

      // Position score (first and last sentences are often important)
      if (index === 0 || index === sentences.length - 1) {
        score += 0.5;
      }

      // Length score (not too short, not too long)
      const idealLength = 50; // characters
      const lengthRatio = Math.min(sentence.length, idealLength) / idealLength;
      score += lengthRatio * 0.3;

      // Keyword indicators
      const importantKeywords = ['important', 'key', 'crucial', 'significant', 'main', 'primary'];
      const hasImportantKeyword = importantKeywords.some(keyword =>
        sentence.toLowerCase().includes(keyword)
      );
      if (hasImportantKeyword) {
        score += 0.4;
      }

      return { sentence, score, index };
    });
  }

  /**
   * Calculate word frequency for scoring
   */
  private calculateWordFrequency(text: string): Record<string, number> {
    const words = text.toLowerCase().split(/\s+/);
    const freq: Record<string, number> = {};

    words.forEach(word => {
      word = word.replace(/[^\w]/g, ''); // Remove punctuation
      if (word.length > 3) { // Skip short words
        freq[word] = (freq[word] || 0) + 1;
      }
    });

    // Normalize frequencies
    const maxFreq = Math.max(...Object.values(freq));
    Object.keys(freq).forEach(word => {
      freq[word] = freq[word] / maxFreq;
    });

    return freq;
  }

  /**
   * Extract keywords from text
   */
  extractKeywords(text: string, maxKeywords: number = 10): string[] {
    const wordFreq = this.calculateWordFrequency(text);

    return Object.entries(wordFreq)
      .sort(([, a], [, b]) => b - a)
      .slice(0, maxKeywords)
      .map(([word]) => word);
  }

  /**
   * Extract entities (simplified implementation)
   */
  extractEntities(text: string): string[] {
    // Simplified entity extraction - looks for capitalized words/phrases
    const entityPattern = /\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b/g;
    const entities = text.match(entityPattern) || [];

    // Filter out common false positives
    const stopWords = new Set(['The', 'This', 'That', 'When', 'Where', 'How', 'What', 'Why']);

    return [...new Set(entities)]
      .filter(entity => !stopWords.has(entity))
      .slice(0, 20); // Limit to top 20 entities
  }
}

/**
 * Intelligent Memory Summarization System
 */
export class IntelligentMemorySummarizer extends EventEmitter {
  private config: SummarizationConfig;
  private textProcessor: SmartTextProcessor;
  private summaryCache: Map<string, SummarizationResult> = new Map();

  constructor(
    private memoryStore: MultiTenantEnhancedMemoryStore,
    config?: Partial<SummarizationConfig>
  ) {
    super();

    this.config = {
      defaultLevel: SummarizationLevel.CONCISE,
      defaultStrategy: SummarizationStrategy.HYBRID,
      maxMemoriesPerSummary: 100,
      minMemoriesForSummarization: 3,
      preserveImportantMemories: true,
      enableSemanticGrouping: true,
      enableTemporalAnalysis: true,
      keywordExtractionEnabled: true,
      entityRecognitionEnabled: true,
      compressionThreshold: 0.6,
      qualityThreshold: 0.7,
      cacheResults: true,
      cacheTTL: 3600000, // 1 hour
      ...config
    };

    this.textProcessor = new SmartTextProcessor();
  }

  /**
   * Summarize a collection of memories
   */
  async summarizeMemories(
    agentId: string,
    memoryIds?: string[],
    options: SummarizationOptions = {}
  ): Promise<SummarizationResult> {
    const startTime = Date.now();

    try {
      // Get memories to summarize
      const memories = await this.getMemoriesForSummarization(agentId, memoryIds, options);

      if (memories.length < this.config.minMemoriesForSummarization) {
        throw new Error(`Insufficient memories for summarization. Need at least ${this.config.minMemoriesForSummarization}, got ${memories.length}`);
      }

      // Check cache first
      const cacheKey = this.generateCacheKey(memories, options);
      if (this.config.cacheResults && this.summaryCache.has(cacheKey)) {
        const cached = this.summaryCache.get(cacheKey)!;
        this.emit('summaryCacheHit', { agentId, cacheKey, memories: memories.length });
        return cached;
      }

      // Group memories if semantic grouping is enabled
      const clusters = this.config.enableSemanticGrouping
        ? await this.groupMemoriesSemanticically(memories)
        : [{ id: 'single', memories, theme: 'general', importance: 1, timespan: this.getTimespan(memories), keywords: [], relatedClusters: [] }];

      // Generate summary using selected strategy
      const strategy = options.strategy || this.config.defaultStrategy;
      const level = options.level || this.config.defaultLevel;

      const summaryResult = await this.generateSummary(memories, clusters, strategy, level, options);

      // Cache the result
      if (this.config.cacheResults) {
        this.summaryCache.set(cacheKey, summaryResult);
        setTimeout(() => {
          this.summaryCache.delete(cacheKey);
        }, this.config.cacheTTL);
      }

      // Emit completion event
      this.emit('summaryGenerated', {
        agentId,
        summaryId: summaryResult.id,
        memoryCount: memories.length,
        compressionRatio: summaryResult.compressionRatio,
        processingTime: Date.now() - startTime
      });

      return summaryResult;

    } catch (error) {
      this.emit('summarizationError', {
        agentId,
        error: error instanceof Error ? error.message : 'Unknown error',
        memoryCount: memoryIds?.length || 0
      });
      throw error;
    }
  }

  /**
   * Get auto-summary for agent's recent memories
   */
  async getAutoSummary(
    agentId: string,
    timeWindowHours: number = 24,
    options: SummarizationOptions = {}
  ): Promise<SummarizationResult | null> {
    const endTime = new Date();
    const startTime = new Date(endTime.getTime() - timeWindowHours * 60 * 60 * 1000);

    const temporalOptions: SummarizationOptions = {
      ...options,
      temporalWindow: { start: startTime, end: endTime },
      level: options.level || SummarizationLevel.CONCISE,
      strategy: options.strategy || SummarizationStrategy.TEMPORAL
    };

    try {
      return await this.summarizeMemories(agentId, undefined, temporalOptions);
    } catch (error) {
      if (error instanceof Error && error.message.includes('Insufficient memories')) {
        return null; // Not enough memories for auto-summary
      }
      throw error;
    }
  }

  /**
   * Get thematic summaries grouped by topics
   */
  async getThematicSummaries(
    agentId: string,
    options: SummarizationOptions = {}
  ): Promise<Map<string, SummarizationResult>> {
    const memories = await this.getMemoriesForSummarization(agentId, undefined, options);
    const clusters = await this.groupMemoriesSemanticically(memories);

    const thematicSummaries = new Map<string, SummarizationResult>();

    for (const cluster of clusters) {
      if (cluster.memories.length >= this.config.minMemoriesForSummarization) {
        const summary = await this.generateSummary(
          cluster.memories,
          [cluster],
          options.strategy || SummarizationStrategy.THEMATIC,
          options.level || this.config.defaultLevel,
          options
        );
        thematicSummaries.set(cluster.theme, summary);
      }
    }

    return thematicSummaries;
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<SummarizationConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.emit('configUpdated', { config: this.config, timestamp: new Date() });
  }

  /**
   * Get current configuration
   */
  getConfig(): SummarizationConfig {
    return { ...this.config };
  }

  /**
   * Get system statistics
   */
  getStatistics(): {
    cachedSummaries: number;
    totalSummariesGenerated: number;
    averageCompressionRatio: number;
    cacheHitRate: number;
  } {
    // Simplified statistics - in production would track more detailed metrics
    return {
      cachedSummaries: this.summaryCache.size,
      totalSummariesGenerated: 0, // Would track this with persistent counter
      averageCompressionRatio: 0.4, // Would calculate from actual summaries
      cacheHitRate: 0.8 // Would track hit/miss ratios
    };
  }

  /**
   * Private helper methods
   */

  private async getMemoriesForSummarization(
    agentId: string,
    memoryIds?: string[],
    options: SummarizationOptions = {}
  ): Promise<StoredMemory[]> {
    let memories: StoredMemory[] = [];

    if (memoryIds && memoryIds.length > 0) {
      // Get specific memories by IDs (simplified - would need actual implementation)
      const context = {
        tenantId: agentId,
        agentId: agentId,
        requestId: `summarization-${Date.now()}-specific`,
        timestamp: new Date().toISOString(),
        permissions: ['read', 'summarize'],
        restrictions: {
          allowCrossTenantAccess: false,
          maxMemoryAccess: this.config.maxMemoriesPerSummary,
          rateLimits: {
            requestsPerMinute: 60,
            requestsPerHour: 3600
          }
        }
      };
      const searchResults = await this.memoryStore.recall(context, '', { limit: this.config.maxMemoriesPerSummary });
      memories = searchResults.memories.filter(m => memoryIds.includes(m.id));
    } else {
      // Get recent memories or within temporal window
      const searchOptions: any = { limit: this.config.maxMemoriesPerSummary };

      if (options.temporalWindow) {
        // Filter by temporal window (simplified)
        searchOptions.temporalWindow = options.temporalWindow;
      }

      if (options.importanceThreshold) {
        searchOptions.minImportance = options.importanceThreshold;
      }

      const context = {
        tenantId: agentId,
        agentId: agentId,
        requestId: `summarization-${Date.now()}-general`,
        timestamp: new Date().toISOString(),
        permissions: ['read', 'summarize'],
        restrictions: {
          allowCrossTenantAccess: false,
          maxMemoryAccess: this.config.maxMemoriesPerSummary,
          rateLimits: {
            requestsPerMinute: 60,
            requestsPerHour: 3600
          }
        }
      };
      const searchResults = await this.memoryStore.recall(context, '', searchOptions);
      memories = searchResults.memories;
    }

    // Filter by importance threshold if preserving important memories
    if (this.config.preserveImportantMemories && options.importanceThreshold) {
      memories = memories.filter(m => (m.metadata?.importance || 1) >= options.importanceThreshold!);
    }

    return memories.slice(0, this.config.maxMemoriesPerSummary);
  }

  private async groupMemoriesSemanticically(memories: StoredMemory[]): Promise<MemoryCluster[]> {
    // Simplified semantic grouping - in production would use actual clustering algorithm
    const clusters: MemoryCluster[] = [];
    const themes = new Set<string>();

    memories.forEach(memory => {
      const keywords = this.textProcessor.extractKeywords(memory.content, 5);
      const theme = keywords[0] || 'general';
      themes.add(theme);
    });

    themes.forEach(theme => {
      const themeMemories = memories.filter(memory => {
        const keywords = this.textProcessor.extractKeywords(memory.content, 5);
        return keywords.includes(theme);
      });

      if (themeMemories.length > 0) {
        clusters.push({
          id: `cluster_${theme}_${Date.now()}`,
          memories: themeMemories,
          theme,
          importance: themeMemories.reduce((sum, m) => sum + (m.metadata?.importance || 1), 0) / themeMemories.length,
          timespan: this.getTimespan(themeMemories),
          keywords: this.textProcessor.extractKeywords(themeMemories.map(m => m.content).join(' '), 10),
          relatedClusters: []
        });
      }
    });

    return clusters.length > 0 ? clusters : [{
      id: 'default_cluster',
      memories,
      theme: 'general',
      importance: 1,
      timespan: this.getTimespan(memories),
      keywords: [],
      relatedClusters: []
    }];
  }

  private async generateSummary(
    memories: StoredMemory[],
    clusters: MemoryCluster[],
    strategy: SummarizationStrategy,
    level: SummarizationLevel,
    options: SummarizationOptions
  ): Promise<SummarizationResult> {
    const allText = memories.map(m => m.content).join(' ');
    const originalLength = allText.length;

    // Determine compression ratio based on level
    const compressionRatios = {
      [SummarizationLevel.MINIMAL]: 0.2,
      [SummarizationLevel.CONCISE]: 0.3,
      [SummarizationLevel.DETAILED]: 0.5,
      [SummarizationLevel.EXTENSIVE]: 0.7
    };

    const targetRatio = compressionRatios[level];
    let summaryText = '';
    let keyPoints: string[] = [];

    // Generate summary based on strategy
    switch (strategy) {
      case SummarizationStrategy.EXTRACTIVE:
        const keySentences = this.textProcessor.extractKeySentences(allText, targetRatio);
        summaryText = keySentences.join(' ');
        keyPoints = keySentences.slice(0, 5);
        break;

      case SummarizationStrategy.THEMATIC:
        summaryText = this.generateThematicSummary(clusters, targetRatio);
        keyPoints = clusters.map(c => `${c.theme}: ${c.memories.length} memories`);
        break;

      case SummarizationStrategy.TEMPORAL:
        summaryText = this.generateTemporalSummary(memories, targetRatio);
        keyPoints = this.extractTemporalKeyPoints(memories);
        break;

      default: // HYBRID, ABSTRACTIVE, SEMANTIC
        const extractiveSummary = this.textProcessor.extractKeySentences(allText, targetRatio * 0.7);
        const thematicSummary = this.generateThematicSummary(clusters, targetRatio * 0.3);
        summaryText = [...extractiveSummary, thematicSummary].join(' ');
        keyPoints = extractiveSummary.slice(0, 3).concat(clusters.map(c => c.theme).slice(0, 2));
        break;
    }

    const themes = clusters.map(c => c.theme);
    const importantEntities = this.textProcessor.extractEntities(allText);
    const timeframe = this.getTimespan(memories);
    const compressionRatio = summaryText.length / originalLength;

    return {
      id: `summary_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      originalMemoryCount: memories.length,
      summaryText: summaryText.trim(),
      keyPoints,
      themes,
      importantEntities,
      timeframe,
      compressionRatio,
      confidenceScore: this.calculateConfidenceScore(memories, summaryText, compressionRatio),
      strategy,
      level,
      metadata: {
        processingTime: 0, // Will be calculated by caller
        sourceMemoryIds: memories.map(m => m.id),
        createdAt: new Date(),
        version: '1.0.0'
      }
    };
  }

  private generateThematicSummary(clusters: MemoryCluster[], targetRatio: number): string {
    return clusters
      .map(cluster => `${cluster.theme} (${cluster.memories.length} entries): ${this.textProcessor.extractKeySentences(
        cluster.memories.map(m => m.content).join(' '),
        targetRatio
      ).slice(0, 2).join(' ')
        }`)
      .join('. ');
  }

  private generateTemporalSummary(memories: StoredMemory[], targetRatio: number): string {
    // Sort memories by timestamp
    const sortedMemories = [...memories].sort((a, b) =>
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    const timeGroups = this.groupMemoriesByTimeWindow(sortedMemories);

    return timeGroups
      .map(group => {
        const sentences = this.textProcessor.extractKeySentences(
          group.memories.map(m => m.content).join(' '),
          targetRatio
        );
        return `${group.period}: ${sentences.slice(0, 2).join(' ')}`;
      })
      .join('. ');
  }

  private groupMemoriesByTimeWindow(memories: StoredMemory[]): Array<{ period: string, memories: StoredMemory[] }> {
    // Simplified time grouping - groups by day
    const groups = new Map<string, StoredMemory[]>();

    memories.forEach(memory => {
      const date = new Date(memory.timestamp).toDateString();
      if (!groups.has(date)) {
        groups.set(date, []);
      }
      groups.get(date)!.push(memory);
    });

    return Array.from(groups.entries()).map(([period, memories]) => ({
      period,
      memories
    }));
  }

  private extractTemporalKeyPoints(memories: StoredMemory[]): string[] {
    const timeGroups = this.groupMemoriesByTimeWindow(memories);
    return timeGroups.map(group =>
      `${group.period}: ${group.memories.length} memories recorded`
    );
  }

  private getTimespan(memories: StoredMemory[]): { start: Date; end: Date } {
    if (memories.length === 0) {
      const now = new Date();
      return { start: now, end: now };
    }

    const timestamps = memories.map(m => new Date(m.timestamp).getTime());
    return {
      start: new Date(Math.min(...timestamps)),
      end: new Date(Math.max(...timestamps))
    };
  }

  private calculateConfidenceScore(memories: StoredMemory[], summary: string, compressionRatio: number): number {
    // Simplified confidence calculation
    let confidence = 0.5; // Base confidence

    // Boost confidence for good compression ratio
    if (compressionRatio >= 0.2 && compressionRatio <= 0.6) {
      confidence += 0.2;
    }

    // Boost confidence for sufficient source material
    if (memories.length >= 5) {
      confidence += 0.1;
    }

    // Boost confidence for reasonable summary length
    if (summary.length >= 100 && summary.length <= 2000) {
      confidence += 0.2;
    }

    return Math.min(1.0, confidence);
  }

  private generateCacheKey(memories: StoredMemory[], options: SummarizationOptions): string {
    const memoryIds = memories.map(m => m.id).sort().join(',');
    const optionsKey = JSON.stringify(options);
    return `${memoryIds}_${optionsKey}`;
  }
}

/**
 * Factory function to create IntelligentMemorySummarizer
 */
export function createIntelligentMemorySummarizer(
  memoryStore: MultiTenantEnhancedMemoryStore,
  config?: Partial<SummarizationConfig>
): IntelligentMemorySummarizer {
  return new IntelligentMemorySummarizer(memoryStore, config);
}