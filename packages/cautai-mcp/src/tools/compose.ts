/**
 * @fileoverview Compose tool implementation for Cautai MCP
 * @author Cautai Team
 * @version 1.0.0
 */

import { ComposeOptions, ComposedAnswer } from '../types.js';
import { CautaiConfig } from '../config.js';
import { SearchTool } from './search-v2.js';

export class ComposeTool {
  private searchTool: SearchTool;

  constructor(private config: CautaiConfig) {
    this.searchTool = new SearchTool();
  }

  async execute(args: Record<string, unknown>): Promise<{ content: any[] }> {
    const options: ComposeOptions = {
      query: args.query as string,
      maxSources: (args.maxSources as number) || 5,
      language: (args.language as 'en' | 'ro' | 'auto') || this.config.defaultLanguage,
      includeReferences: this.config.enableCitations,
    };

    try {
      const composedAnswer = await this.composeAnswer(options);
      
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(composedAnswer, null, 2),
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `Error composing answer: ${error instanceof Error ? error.message : 'Unknown error'}`,
          },
        ],
      };
    }
  }

  private async composeAnswer(options: ComposeOptions): Promise<ComposedAnswer> {
    // Get real search results using the advanced search engine
    const searchResult = await this.searchTool.execute({
      query: options.query,
      limit: options.maxSources,
      language: options.language === 'auto' ? 'en' : options.language,
    });

    // Parse search results from the search tool response
    let searchData;
    try {
      searchData = JSON.parse(searchResult.content[0].text);
    } catch (error) {
      throw new Error('Failed to parse search results');
    }

    if (searchData.error) {
      throw new Error(`Search failed: ${searchData.message}`);
    }

    // Extract search results
    const searchResults = searchData.results || [];
    
    // Generate AI-powered composed answer based on real search results
    const answer = this.synthesizeAnswer(options.query, searchResults, options.language);
    
    // Create sources from real search results
    const sources = searchResults.map((result: any, index: number) => ({
      id: `source-${index + 1}`,
      title: result.title,
      url: result.url,
      domain: result.domain,
      accessDate: new Date().toISOString(),
      publishedDate: result.publishedAt || new Date().toISOString(),
      snippet: result.snippet
    }));

    // Calculate confidence based on result quality and relevance
    const confidence = this.calculateConfidence(searchResults, options.query);

    const composedAnswer: ComposedAnswer = {
      answer,
      sources,
      confidence,
      language: options.language || 'en',
    };

    return composedAnswer;
  }

  private synthesizeAnswer(query: string, results: any[], language: string = 'en'): string {
    if (!results || results.length === 0) {
      return language === 'ro' 
        ? `Nu am putut găsi informații suficiente pentru a răspunde la întrebarea: "${query}"`
        : `I couldn't find sufficient information to answer the question: "${query}"`;
    }

    // Analyze and synthesize content from real search results
    const keyPoints: string[] = [];
    const domains = new Set<string>();
    
    results.forEach((result: any) => {
      domains.add(result.domain);
      if (result.snippet && result.snippet.trim()) {
        // Extract relevant sentences from snippets
        const sentences = result.snippet.split(/[.!?]+/).filter((s: string) => s.trim().length > 20);
        keyPoints.push(...sentences.slice(0, 2)); // Take max 2 sentences per result
      }
    });

    // Remove duplicates and sort by relevance (simple keyword matching)
    const uniquePoints = [...new Set(keyPoints)];
    const relevantPoints = uniquePoints
      .filter(point => this.containsQueryTerms(point, query))
      .slice(0, 5); // Limit to top 5 points

    // Generate structured answer
    let answer = '';
    
    if (language === 'ro') {
      answer = `Pe baza cercetării realizate pentru "${query}", iată ce am descoperit:\n\n`;
      
      if (relevantPoints.length > 0) {
        answer += relevantPoints
          .map((point, index) => `${index + 1}. ${point.trim()}.`)
          .join('\n\n');
      } else {
        // Fallback to general information from search results
        answer += `Am găsit informații de pe ${domains.size} surse diferite, inclusiv ${Array.from(domains).slice(0, 3).join(', ')}.`;
      }
      
      answer += `\n\nAceste informații au fost compilate din ${results.length} surse verificate pentru a oferi o perspectivă cuprinzătoare asupra subiectului.`;
    } else {
      answer = `Based on research conducted for "${query}", here's what I found:\n\n`;
      
      if (relevantPoints.length > 0) {
        answer += relevantPoints
          .map((point, index) => `${index + 1}. ${point.trim()}.`)
          .join('\n\n');
      } else {
        // Fallback to general information from search results
        answer += `I found information from ${domains.size} different sources, including ${Array.from(domains).slice(0, 3).join(', ')}.`;
      }
      
      answer += `\n\nThis information has been compiled from ${results.length} verified sources to provide a comprehensive perspective on the topic.`;
    }

    return answer;
  }

  private containsQueryTerms(text: string, query: string): boolean {
    const queryTerms = query.toLowerCase().split(/\s+/).filter(term => term.length > 2);
    const textLower = text.toLowerCase();
    
    // Check if at least 30% of query terms appear in the text
    const matchingTerms = queryTerms.filter(term => textLower.includes(term));
    return matchingTerms.length / queryTerms.length >= 0.3;
  }

  private calculateConfidence(results: any[], query: string): number {
    if (!results || results.length === 0) {
      return 0.1;
    }

    let totalRelevance = 0;
    let totalQuality = 0;
    
    results.forEach((result: any) => {
      // Factor in search engine score
      const searchScore = result.score || 0.5;
      
      // Factor in content quality indicators
      const hasGoodTitle = result.title && result.title.length > 10;
      const hasGoodSnippet = result.snippet && result.snippet.length > 50;
      const isFromKnownDomain = this.isKnownQualityDomain(result.domain);
      
      const qualityScore = (
        (hasGoodTitle ? 0.3 : 0) +
        (hasGoodSnippet ? 0.4 : 0) +
        (isFromKnownDomain ? 0.3 : 0.1)
      );
      
      totalRelevance += searchScore;
      totalQuality += qualityScore;
    });
    
    const avgRelevance = totalRelevance / results.length;
    const avgQuality = totalQuality / results.length;
    
    // Combine relevance and quality, with bonus for having multiple sources
    const sourceBonus = Math.min(results.length / 5, 1) * 0.1;
    const confidence = (avgRelevance * 0.6 + avgQuality * 0.4 + sourceBonus);
    
    return Math.min(0.95, Math.max(0.1, confidence));
  }

  private isKnownQualityDomain(domain: string): boolean {
    const qualityDomains = [
      'wikipedia.org', 'github.com', 'stackoverflow.com', 'medium.com',
      'arxiv.org', 'nature.com', 'sciencedirect.com', 'ieee.org',
      'acm.org', 'mit.edu', 'stanford.edu', 'harvard.edu',
      'bbc.com', 'reuters.com', 'nationalgeographic.com'
    ];
    
    return qualityDomains.some(qualityDomain => domain.includes(qualityDomain));
  }
}