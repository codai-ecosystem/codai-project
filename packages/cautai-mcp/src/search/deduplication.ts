/**
 * @fileoverview Search Results Deduplication Engine
 * @author Cautai Team
 * @version 1.0.0
 */

import type { SearchResult } from './types.js';

interface DeduplicationConfig {
  enabled: boolean;
  similarityThreshold: number;
  algorithms: ('url' | 'title' | 'content' | 'semantic')[];
  keepHighestScore: boolean;
}

export class ResultDeduplicator {
  constructor(private config: DeduplicationConfig) {}

  /**
   * Deduplicate search results
   */
  public deduplicate(results: SearchResult[]): SearchResult[] {
    if (!this.config.enabled || results.length === 0) {
      return results;
    }

    const unique: SearchResult[] = [];
    const seen = new Set<string>();

    for (const result of results.sort((a, b) => b.score - a.score)) {
      if (!this.isDuplicate(result, unique)) {
        unique.push(result);
        seen.add(this.generateKey(result));
      }
    }

    return unique;
  }

  /**
   * Check if result is duplicate of any in the unique list
   */
  private isDuplicate(result: SearchResult, unique: SearchResult[]): boolean {
    for (const existing of unique) {
      if (this.calculateSimilarity(result, existing) >= this.config.similarityThreshold) {
        return true;
      }
    }
    return false;
  }

  /**
   * Calculate similarity between two results
   */
  private calculateSimilarity(a: SearchResult, b: SearchResult): number {
    let totalScore = 0;
    let algorithmCount = 0;

    for (const algorithm of this.config.algorithms) {
      let score = 0;

      switch (algorithm) {
        case 'url':
          score = this.urlSimilarity(a.url, b.url);
          break;
        case 'title':
          score = this.textSimilarity(a.title, b.title);
          break;
        case 'content':
          score = this.textSimilarity(a.snippet || '', b.snippet || '');
          break;
        case 'semantic':
          score = this.semanticSimilarity(a, b);
          break;
      }

      totalScore += score;
      algorithmCount++;
    }

    return algorithmCount > 0 ? totalScore / algorithmCount : 0;
  }

  /**
   * Compare URL similarity
   */
  private urlSimilarity(urlA: string, urlB: string): number {
    if (urlA === urlB) return 1.0;

    try {
      const a = new URL(urlA);
      const b = new URL(urlB);

      // Same domain
      if (a.hostname === b.hostname) {
        // Same path
        if (a.pathname === b.pathname) {
          return 0.95; // Different query params only
        }
        
        // Similar paths
        const pathSimilarity = this.textSimilarity(a.pathname, b.pathname);
        return pathSimilarity * 0.8;
      }

      // Different domains but similar structure
      const hostSimilarity = this.textSimilarity(a.hostname, b.hostname);
      const pathSimilarity = this.textSimilarity(a.pathname, b.pathname);
      
      return (hostSimilarity + pathSimilarity) / 2 * 0.6;
    } catch {
      // Fallback to string similarity
      return this.textSimilarity(urlA, urlB);
    }
  }

  /**
   * Calculate text similarity using Jaccard index
   */
  private textSimilarity(textA: string, textB: string): number {
    if (textA === textB) return 1.0;
    if (!textA || !textB) return 0.0;

    const wordsA = this.normalizeText(textA);
    const wordsB = this.normalizeText(textB);

    if (wordsA.length === 0 || wordsB.length === 0) return 0.0;

    const setA = new Set(wordsA);
    const setB = new Set(wordsB);

    const intersection = new Set([...setA].filter(word => setB.has(word)));
    const union = new Set([...setA, ...setB]);

    return intersection.size / union.size;
  }

  /**
   * Semantic similarity based on metadata
   */
  private semanticSimilarity(a: SearchResult, b: SearchResult): number {
    let score = 0;
    let factors = 0;

    // Domain similarity
    if (a.domain && b.domain) {
      score += a.domain === b.domain ? 0.3 : 0;
      factors++;
    }

    // Language similarity
    if (a.language && b.language) {
      score += a.language === b.language ? 0.2 : 0;
      factors++;
    }

    // Content type similarity
    if (a.contentType && b.contentType) {
      score += a.contentType === b.contentType ? 0.2 : 0;
      factors++;
    }

    // Published date proximity (within 7 days = similar)
    if (a.publishedAt && b.publishedAt) {
      const daysDiff = Math.abs(
        (new Date(a.publishedAt).getTime() - new Date(b.publishedAt).getTime()) / 
        (1000 * 60 * 60 * 24)
      );
      score += daysDiff <= 7 ? 0.1 : 0;
      factors++;
    }

    // Author similarity
    if (a.metadata?.author && b.metadata?.author) {
      score += a.metadata.author === b.metadata.author ? 0.2 : 0;
      factors++;
    }

    return factors > 0 ? score : 0;
  }

  /**
   * Normalize text for comparison
   */
  private normalizeText(text: string): string[] {
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .split(' ')
      .filter(word => word.length > 2)
      .slice(0, 50); // Limit for performance
  }

  /**
   * Generate unique key for result
   */
  private generateKey(result: SearchResult): string {
    const normalized = this.normalizeText(result.title + ' ' + result.url);
    return normalized.slice(0, 10).join('_');
  }

  /**
   * Group similar results together
   */
  public groupSimilar(results: SearchResult[]): SearchResult[][] {
    if (!this.config.enabled) {
      return results.map(result => [result]);
    }

    const groups: SearchResult[][] = [];
    const processed = new Set<number>();

    for (let i = 0; i < results.length; i++) {
      if (processed.has(i)) continue;

      const group: SearchResult[] = [results[i]];
      processed.add(i);

      for (let j = i + 1; j < results.length; j++) {
        if (processed.has(j)) continue;

        if (this.calculateSimilarity(results[i], results[j]) >= this.config.similarityThreshold) {
          group.push(results[j]);
          processed.add(j);
        }
      }

      groups.push(group);
    }

    return groups;
  }

  /**
   * Merge similar results
   */
  public mergeSimilar(results: SearchResult[]): SearchResult[] {
    const groups = this.groupSimilar(results);
    
    return groups.map(group => {
      if (group.length === 1) {
        return group[0];
      }

      // Keep highest scoring result as base
      const primary = group.reduce((best, current) => 
        current.score > best.score ? current : best
      );

      // Merge metadata from all results
      const merged: SearchResult = {
        ...primary,
        score: Math.max(...group.map(r => r.score)),
        snippet: this.mergeBestContent(group),
        metadata: {
          ...primary.metadata,
          ...{ duplicateCount: group.length } as any,
          ...{ mergedFrom: group.map(r => r.url) } as any,
          ...{ combinedScore: group.reduce((sum, r) => sum + r.score, 0) / group.length } as any
        }
      };

      return merged;
    });
  }

  /**
   * Select best snippet from similar results
   */
  private mergeBestContent(group: SearchResult[]): string {
    const snippets = group
      .map(r => r.snippet || '')
      .filter(s => s.length > 0)
      .sort((a, b) => b.length - a.length);

    return snippets[0] || '';
  }

  /**
   * Get deduplication statistics
   */
  public getStats(original: SearchResult[], deduplicated: SearchResult[]) {
    const duplicatesRemoved = original.length - deduplicated.length;
    const deduplicationRate = original.length > 0 ? duplicatesRemoved / original.length : 0;

    return {
      originalCount: original.length,
      deduplicatedCount: deduplicated.length,
      duplicatesRemoved,
      deduplicationRate: Math.round(deduplicationRate * 100) / 100,
      config: this.config
    };
  }
}