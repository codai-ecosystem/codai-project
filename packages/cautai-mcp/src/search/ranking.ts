/**
 * @fileoverview BM25 + Semantic Hybrid Ranking Algorithm
 * @author Cautai Team
 * @version 1.0.0
 */

import type { SearchResult, RankingContext } from './types.js';

interface TermFrequency {
  [term: string]: number;
}

interface DocumentStats {
  totalDocs: number;
  avgDocLength: number;
  termFrequencies: Map<string, TermFrequency>;
  documentLengths: Map<string, number>;
}

export class HybridRankingEngine {
  private k1 = 1.5; // BM25 term frequency saturation parameter
  private b = 0.75; // BM25 field length normalization parameter
  private semanticWeight = 0.4; // Weight for semantic similarity
  private bm25Weight = 0.6; // Weight for BM25 score

  constructor(
    private config: {
      k1?: number;
      b?: number;
      semanticWeight?: number;
      bm25Weight?: number;
    } = {}
  ) {
    this.k1 = config.k1 ?? this.k1;
    this.b = config.b ?? this.b;
    this.semanticWeight = config.semanticWeight ?? this.semanticWeight;
    this.bm25Weight = config.bm25Weight ?? this.bm25Weight;
  }

  /**
   * Rank search results using hybrid BM25 + semantic similarity
   */
  public async rankResults(
    results: SearchResult[],
    query: string,
    context?: RankingContext
  ): Promise<SearchResult[]> {
    if (results.length === 0) return results;

    // Calculate document statistics for BM25
    const docStats = this.calculateDocumentStats(results);
    
    // Extract query terms
    const queryTerms = this.tokenize(query.toLowerCase());
    
    // Calculate BM25 and semantic scores for each result
    const scoredResults = await Promise.all(
      results.map(async (result) => {
        const bm25Score = this.calculateBM25Score(
          result,
          queryTerms,
          docStats
        );
        
        const semanticScore = await this.calculateSemanticScore(
          result,
          query
        );
        
        const qualityScore = this.calculateQualityScore(result, context);
        const recencyScore = this.calculateRecencyScore(result);
        const authorityScore = this.calculateAuthorityScore(result);
        
        // Combine scores with weighted average
        const finalScore = 
          (bm25Score * this.bm25Weight) +
          (semanticScore * this.semanticWeight) +
          (qualityScore * 0.15) +
          (recencyScore * 0.1) +
          (authorityScore * 0.1);

        return {
          ...result,
          score: finalScore,
          relevanceScore: (bm25Score + semanticScore) / 2,
          qualityScore: qualityScore,
          metadata: {
            ...result.metadata,
            bm25Score,
            semanticScore,
            recencyScore,
            authorityScore
          }
        };
      })
    );

    // Sort by final score (descending)
    return scoredResults.sort((a, b) => b.score - a.score);
  }

  /**
   * Calculate BM25 score for a document
   */
  private calculateBM25Score(
    result: SearchResult,
    queryTerms: string[],
    docStats: DocumentStats
  ): number {
    const docText = `${result.title} ${result.snippet}`.toLowerCase();
    const docTerms = this.tokenize(docText);
    const docLength = docTerms.length;
    
    let bm25Score = 0;
    
    for (const term of queryTerms) {
      const termFreq = docTerms.filter(t => t === term).length;
      if (termFreq === 0) continue;
      
      // Calculate IDF (Inverse Document Frequency)
      const docsWithTerm = this.countDocsWithTerm(term, docStats);
      const idf = Math.log((docStats.totalDocs - docsWithTerm + 0.5) / (docsWithTerm + 0.5));
      
      // Calculate TF component
      const tf = (termFreq * (this.k1 + 1)) / 
                 (termFreq + this.k1 * (1 - this.b + this.b * (docLength / docStats.avgDocLength)));
      
      bm25Score += idf * tf;
    }
    
    return Math.max(0, bm25Score);
  }

  /**
   * Calculate semantic similarity score (mock implementation)
   */
  private async calculateSemanticScore(
    result: SearchResult,
    query: string
  ): Promise<number> {
    // Mock semantic similarity calculation
    // In production, this would use embeddings from a model like text-embedding-3-large
    const resultText = `${result.title} ${result.snippet}`.toLowerCase();
    const queryLower = query.toLowerCase();
    
    // Simple word overlap as mock semantic similarity
    const queryWords = new Set(this.tokenize(queryLower));
    const resultWords = new Set(this.tokenize(resultText));
    
    const intersection = new Set([...queryWords].filter(x => resultWords.has(x)));
    const union = new Set([...queryWords, ...resultWords]);
    
    const jaccardSimilarity = intersection.size / union.size;
    
    // Add title boost
    const titleWords = new Set(this.tokenize(result.title.toLowerCase()));
    const titleOverlap = [...queryWords].filter(x => titleWords.has(x)).length;
    const titleBoost = titleOverlap / queryWords.size * 0.3;
    
    return Math.min(1.0, jaccardSimilarity + titleBoost);
  }

  /**
   * Calculate quality score based on content metrics
   */
  private calculateQualityScore(
    result: SearchResult,
    context?: RankingContext
  ): number {
    let score = 0;
    
    // Content length score (sweet spot around 500-2000 words)
    const wordCount = result.metadata.wordCount || this.estimateWordCount(result.snippet);
    if (wordCount > 100 && wordCount < 5000) {
      score += Math.min(0.3, wordCount / 2000 * 0.3);
    }
    
    // Domain authority (mock scoring)
    const domainScore = this.getDomainAuthorityScore(result.domain);
    score += domainScore * 0.3;
    
    // Content type preference
    if (context?.preferences?.contentTypePreferences) {
      const typeScore = context.preferences.contentTypePreferences[result.contentType] || 0.5;
      score += typeScore * 0.2;
    } else {
      score += 0.1; // Default content type score
    }
    
    // Language preference
    if (context?.userLanguage && result.language === context.userLanguage) {
      score += 0.2;
    }
    
    return Math.min(1.0, score);
  }

  /**
   * Calculate recency score
   */
  private calculateRecencyScore(result: SearchResult): number {
    if (!result.publishedAt) return 0.5;
    
    const now = new Date();
    const ageInDays = (now.getTime() - result.publishedAt.getTime()) / (1000 * 60 * 60 * 24);
    
    // Exponential decay: newer content gets higher scores
    return Math.exp(-ageInDays / 365) * 0.5 + 0.25; // Score between 0.25 and 0.75
  }

  /**
   * Calculate authority score
   */
  private calculateAuthorityScore(result: SearchResult): number {
    return this.getDomainAuthorityScore(result.domain);
  }

  /**
   * Calculate document statistics for BM25
   */
  private calculateDocumentStats(results: SearchResult[]): DocumentStats {
    const termFrequencies = new Map<string, TermFrequency>();
    const documentLengths = new Map<string, number>();
    let totalLength = 0;
    
    results.forEach((result, index) => {
      const docText = `${result.title} ${result.snippet}`.toLowerCase();
      const terms = this.tokenize(docText);
      documentLengths.set(index.toString(), terms.length);
      totalLength += terms.length;
      
      const termFreq: TermFrequency = {};
      terms.forEach(term => {
        termFreq[term] = (termFreq[term] || 0) + 1;
      });
      termFrequencies.set(index.toString(), termFreq);
    });
    
    return {
      totalDocs: results.length,
      avgDocLength: totalLength / results.length,
      termFrequencies,
      documentLengths
    };
  }

  /**
   * Count documents containing a specific term
   */
  private countDocsWithTerm(term: string, docStats: DocumentStats): number {
    let count = 0;
    for (const termFreq of docStats.termFrequencies.values()) {
      if (termFreq[term] && termFreq[term] > 0) {
        count++;
      }
    }
    return count;
  }

  /**
   * Simple tokenization
   */
  private tokenize(text: string): string[] {
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(token => token.length > 1);
  }

  /**
   * Estimate word count from snippet
   */
  private estimateWordCount(snippet: string): number {
    return snippet.split(/\s+/).length * 10; // Assume snippet is 10% of content
  }

  /**
   * Get domain authority score (mock implementation)
   */
  private getDomainAuthorityScore(domain: string): number {
    // Mock domain authority scoring
    const authorityDomains = new Map([
      ['wikipedia.org', 0.95],
      ['github.com', 0.9],
      ['stackoverflow.com', 0.9],
      ['mozilla.org', 0.85],
      ['w3.org', 0.85],
      ['docs.microsoft.com', 0.8],
      ['developer.mozilla.org', 0.8],
      ['arxiv.org', 0.8],
      ['medium.com', 0.6],
      ['dev.to', 0.6]
    ]);
    
    return authorityDomains.get(domain) || 0.5;
  }
}