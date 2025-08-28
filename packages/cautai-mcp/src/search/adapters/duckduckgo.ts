/**
 * @fileoverview DuckDuckGo Search Adapter with Web Scraping
 * @author Cautai Team
 * @version 2.0.0
 */

import fetch from 'node-fetch';
import * as cheerio from 'cheerio';
import { BaseSearchAdapter } from './base.js';
import type { SearchQuery, SearchResult, AdapterConfig } from '../types.js';
import { SearchError } from '../types.js';

export class DuckDuckGoAdapter extends BaseSearchAdapter {
  private readonly baseUrl = 'https://html.duckduckgo.com/html/';
  private readonly userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

  constructor(config: Partial<AdapterConfig> = {}) {
    super('duckduckgo', {
      priority: 2,
      maxResults: 20,
      rateLimit: {
        requests: 50, // Conservative rate limiting
        window: 3600000, // 1 hour
      },
      timeout: 15000, // 15 second timeout for web scraping
      ...config
    });
  }

  public async search(query: SearchQuery): Promise<SearchResult[]> {
    if (!this.isAvailable()) {
      throw this.createError('Adapter not available', SearchError.ADAPTER_UNAVAILABLE);
    }

    if (!query.query.trim()) {
      throw this.createError('Empty query', SearchError.INVALID_QUERY);
    }

    this.incrementRateLimit();

    try {
      return await this.executeWithTimeout(async () => {
        const html = await this.performWebSearch(query);
        return this.parseSearchResults(html, query);
      });
    } catch (error: any) {
      if (error.name === 'CautaiSearchError') {
        throw error;
      }
      
      throw this.createError(
        `DuckDuckGo search failed: ${error.message}`,
        SearchError.NETWORK_ERROR,
        error
      );
    }
  }

  /**
   * Perform web search by scraping DuckDuckGo HTML
   */
  private async performWebSearch(query: SearchQuery): Promise<string> {
    const searchUrl = this.buildSearchUrl(query);
    
    const response = await fetch(searchUrl, {
      headers: {
        'User-Agent': this.userAgent,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': query.language === 'ro' ? 'ro,en;q=0.9' : 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'DNT': '1', // Do Not Track
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Cache-Control': 'max-age=0'
      },
      timeout: this.config.timeout
    });

    if (!response.ok) {
      if (response.status === 429) {
        throw this.createError('Rate limit exceeded', SearchError.RATE_LIMITED);
      }
      throw this.createError(
        `HTTP ${response.status}: ${response.statusText}`,
        SearchError.NETWORK_ERROR
      );
    }

    return await response.text();
  }

  /**
   * Build search URL with proper parameters
   */
  private buildSearchUrl(query: SearchQuery): string {
    const params = new URLSearchParams({
      q: query.query,
      kl: query.language === 'ro' ? 'ro-ro' : 'us-en',
      safe: 'moderate',
      t: 'hb', // HTML backend
      ia: 'web',
      bing_market: query.language === 'ro' ? 'ro-RO' : 'en-US'
    });

    // Add date filter if specified
    if (query.filters?.dateRange) {
      const start = query.filters.dateRange.start.toISOString().split('T')[0];
      const end = query.filters.dateRange.end.toISOString().split('T')[0];
      params.set('df', `${start}..${end}`);
    }

    // Add site filter if specified
    if (query.filters?.domain) {
      params.set('q', `${query.query} site:${query.filters.domain}`);
    }

    // Add content type filter
    if (query.filters?.contentType && query.filters.contentType !== 'all') {
      switch (query.filters.contentType) {
        case 'pdf':
          params.set('q', `${query.query} filetype:pdf`);
          break;
        case 'video':
          params.set('iar', 'videos');
          break;
      }
    }

    return `${this.baseUrl}?${params.toString()}`;
  }

  /**
   * Parse search results from HTML using Cheerio
   */
  private parseSearchResults(html: string, query: SearchQuery): SearchResult[] {
    const $ = cheerio.load(html);
    const results: SearchResult[] = [];
    let resultIndex = 0;

    // DuckDuckGo uses different selectors, try multiple patterns
    const resultSelectors = [
      '.result',           // Primary result selector
      '.results_links',    // Alternative selector
      '.web-result',       // Another possible selector
      '.result__body'      // Fallback selector
    ];

    let resultsFound = false;

    for (const selector of resultSelectors) {
      const elements = $(selector);
      
      if (elements.length > 0) {
        resultsFound = true;
        
        elements.each((_, element) => {
          try {
            const result = this.extractResultData($, $(element), resultIndex, query);
            if (result) {
              results.push(result);
              resultIndex++;
            }
          } catch (error) {
            console.warn('Failed to parse search result:', error);
          }
        });
        
        break; // Use first successful selector
      }
    }

    if (!resultsFound) {
      console.warn('No search results found with known selectors');
    }

    // Apply limit and return results
    const limit = Math.min(query.limit || 10, this.config.maxResults);
    return results.slice(0, limit);
  }

  /**
   * Extract individual result data from HTML element
   */
  private extractResultData(
    $: cheerio.CheerioAPI, 
    $result: cheerio.Cheerio<any>, 
    index: number, 
    query: SearchQuery
  ): SearchResult | null {
    // Extract title and URL
    const titleSelectors = [
      '.result__title a',
      '.result__a',
      'h2 a',
      '.result-title a',
      'a[href^="http"]'
    ];

    let titleElement: cheerio.Cheerio<any> | null = null;
    let title = '';
    let href = '';

    for (const selector of titleSelectors) {
      titleElement = $result.find(selector).first();
      if (titleElement.length > 0) {
        title = titleElement.text().trim();
        href = titleElement.attr('href') || '';
        if (title && href) break;
      }
    }

    if (!title || !href) {
      return null;
    }

    // Clean and decode URL
    let url = this.cleanUrl(href);
    if (!url.startsWith('http')) {
      return null;
    }

    // Extract snippet
    const snippetSelectors = [
      '.result__snippet',
      '.snippet',
      '.result-snippet',
      '.result__body'
    ];

    let snippet = '';
    for (const selector of snippetSelectors) {
      const snippetElement = $result.find(selector);
      if (snippetElement.length > 0) {
        snippet = snippetElement.text().trim();
        if (snippet) break;
      }
    }

    // Extract domain
    let domain = '';
    try {
      domain = new URL(url).hostname.replace('www.', '');
    } catch {
      domain = url.split('/')[2] || url;
    }

    // Determine content type
    const contentType = this.inferContentType(url, title);

    // Calculate scores
    const position = index + 1;
    const score = Math.max(0.1, 1.0 - (index * 0.08));
    const relevanceScore = this.calculateRelevanceScore(title, snippet, query.query);
    const qualityScore = this.calculateQualityScore(domain, title, snippet);

    return {
      id: this.generateResultId(url, title),
      url,
      title,
      snippet,
      domain,
      score,
      relevanceScore,
      qualityScore,
      contentType,
      language: query.language || this.detectLanguage(`${title} ${snippet}`),
      citations: [
        {
          text: snippet.substring(0, 150) + (snippet.length > 150 ? '...' : ''),
          source: domain,
          confidence: 0.8
        }
      ],
      metadata: {
        wordCount: this.estimateWordCount(snippet),
        readingTime: this.estimateReadingTime(snippet),
        extractedEntities: this.extractEntities(`${title} ${snippet}`),
        keyPhrases: this.extractQueryRelatedPhrases(`${title} ${snippet}`, query.query),
        sentiment: 'neutral'
      }
    };
  }

  /**
   * Clean DuckDuckGo redirect URLs
   */
  private cleanUrl(href: string): string {
    if (href.startsWith('/l/?uddg=')) {
      const urlMatch = href.match(/uddg=([^&]+)/);
      if (urlMatch) {
        try {
          return decodeURIComponent(urlMatch[1]);
        } catch {
          return href;
        }
      }
    }
    
    if (href.startsWith('/l/?kh=-1&uddg=')) {
      const urlMatch = href.match(/uddg=([^&]+)/);
      if (urlMatch) {
        try {
          return decodeURIComponent(urlMatch[1]);
        } catch {
          return href;
        }
      }
    }

    return href;
  }

  /**
   * Calculate relevance score based on query match
   */
  private calculateRelevanceScore(title: string, snippet: string, query: string): number {
    const titleLower = title.toLowerCase();
    const snippetLower = snippet.toLowerCase();
    const queryLower = query.toLowerCase();
    const queryWords = queryLower.split(/\s+/);
    
    let score = 0.5; // Base score
    
    // Title exact match bonus
    if (titleLower.includes(queryLower)) {
      score += 0.3;
    }
    
    // Title word matches
    const titleWordMatches = queryWords.filter(word => 
      word.length > 2 && titleLower.includes(word)
    ).length;
    score += (titleWordMatches / queryWords.length) * 0.3;
    
    // Snippet word matches
    const snippetWordMatches = queryWords.filter(word => 
      word.length > 2 && snippetLower.includes(word)
    ).length;
    score += (snippetWordMatches / queryWords.length) * 0.2;
    
    return Math.min(1.0, score);
  }

  /**
   * Calculate quality score based on content indicators
   */
  private calculateQualityScore(domain: string, title: string, snippet: string): number {
    let score = 0.6; // Base score
    
    // Domain authority (simplified)
    const highQualityDomains = [
      'wikipedia.org', 'github.com', 'stackoverflow.com', 
      'medium.com', 'arxiv.org', 'nature.com', 'sciencedirect.com'
    ];
    
    if (highQualityDomains.some(d => domain.includes(d))) {
      score += 0.2;
    }
    
    // Title length (not too short, not too long)
    if (title.length > 20 && title.length < 120) {
      score += 0.1;
    }
    
    // Snippet quality
    if (snippet.length > 50 && snippet.split(' ').length > 10) {
      score += 0.1;
    }
    
    return Math.min(1.0, score);
  }

  /**
   * Extract named entities from text
   */
  private extractEntities(text: string): string[] {
    const entities: string[] = [];
    
    // Capitalized words (potential proper nouns)
    const properNouns = text.match(/\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b/g) || [];
    entities.push(...properNouns.filter(word => word.length > 2));
    
    // URLs
    const urls = text.match(/https?:\/\/[^\s]+/g) || [];
    entities.push(...urls);
    
    // Dates
    const dates = text.match(/\b(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},?\s+\d{4}\b/g) || [];
    entities.push(...dates);
    
    // Numbers with context
    const numbers = text.match(/\b\d+(?:\.\d+)?(?:\s*(?:%|percent|million|billion|thousand))\b/g) || [];
    entities.push(...numbers);
    
    return [...new Set(entities)].slice(0, 10);
  }

  /**
   * Extract key phrases related to the query
   */
  private extractQueryRelatedPhrases(text: string, query: string): string[] {
    const phrases: string[] = [];
    const queryWords = query.toLowerCase().split(/\s+/);
    
    // Split into sentences
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 10);
    
    for (const sentence of sentences) {
      const sentenceLower = sentence.toLowerCase();
      
      // Check if sentence contains query terms
      const hasQueryTerms = queryWords.some(word => 
        word.length > 2 && sentenceLower.includes(word)
      );
      
      if (hasQueryTerms) {
        // Extract 2-4 word phrases
        const words = sentence.trim().split(/\s+/);
        for (let i = 0; i < words.length - 1; i++) {
          const phrase2 = words.slice(i, i + 2).join(' ');
          const phrase3 = words.slice(i, i + 3).join(' ');
          
          if (phrase2.length > 5 && phrase2.length < 30) {
            phrases.push(phrase2);
          }
          if (phrase3.length > 10 && phrase3.length < 50) {
            phrases.push(phrase3);
          }
        }
      }
    }
    
    return [...new Set(phrases)].slice(0, 5);
  }

  /**
   * Estimate word count from snippet
   */
  private estimateWordCount(snippet: string): number {
    const snippetWords = snippet.split(/\s+/).length;
    return snippetWords * 12; // Assume snippet is ~8% of full content
  }

  /**
   * Infer content type from URL and title
   */
  private inferContentType(url: string, title: string): string {
    const urlLower = url.toLowerCase();
    const titleLower = title.toLowerCase();

    if (urlLower.includes('youtube.com') || urlLower.includes('vimeo.com') || 
        titleLower.includes('video') || urlLower.includes('.mp4')) {
      return 'video';
    }
    
    if (urlLower.includes('.pdf') || titleLower.includes('[pdf]')) {
      return 'pdf';
    }
    
    if (urlLower.includes('github.com') || urlLower.includes('gitlab.com') ||
        titleLower.includes('repository') || titleLower.includes('source code')) {
      return 'code';
    }
    
    if (urlLower.includes('wikipedia.org') || urlLower.includes('britannica.com')) {
      return 'reference';
    }
    
    if (urlLower.includes('news') || urlLower.includes('blog') || 
        titleLower.includes('breaking') || titleLower.includes('updated')) {
      return 'news';
    }
    
    if (urlLower.includes('docs') || urlLower.includes('documentation')) {
      return 'documentation';
    }
    
    return 'article';
  }
}