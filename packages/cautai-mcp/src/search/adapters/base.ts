/**
 * @fileoverview Base Search Adapter Class
 * @author Cautai Team
 * @version 1.0.0
 */

import type { SearchAdapter, SearchQuery, SearchResult, AdapterConfig, CautaiSearchError } from '../types.js';
import { SearchError } from '../types.js';

export abstract class BaseSearchAdapter implements SearchAdapter {
  protected config: AdapterConfig;
  protected lastRequest: Date = new Date(0);
  protected requestCount: number = 0;
  protected resetWindow: Date = new Date();

  constructor(
    public readonly name: string,
    config: Partial<AdapterConfig>
  ) {
    this.config = {
      enabled: true,
      priority: 1,
      timeout: 10000,
      maxResults: 50,
      rateLimit: {
        requests: 100,
        window: 3600000, // 1 hour
      },
      ...config
    };
  }

  abstract search(query: SearchQuery): Promise<SearchResult[]>;

  public isAvailable(): boolean {
    return this.config.enabled && this.isRateLimitOk();
  }

  public getConfig(): AdapterConfig {
    return { ...this.config };
  }

  protected isRateLimitOk(): boolean {
    if (!this.config.rateLimit) return true;

    const now = new Date();
    
    // Reset counter if window has passed
    if (now.getTime() - this.resetWindow.getTime() >= this.config.rateLimit.window) {
      this.requestCount = 0;
      this.resetWindow = now;
    }

    return this.requestCount < this.config.rateLimit.requests;
  }

  protected incrementRateLimit(): void {
    this.requestCount++;
    this.lastRequest = new Date();
  }

  protected async executeWithTimeout<T>(
    operation: () => Promise<T>,
    timeoutMs?: number
  ): Promise<T> {
    const timeout = timeoutMs || this.config.timeout;
    
    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(this.createError('Request timeout', SearchError.TIMEOUT));
      }, timeout);

      operation()
        .then(result => {
          clearTimeout(timeoutId);
          resolve(result);
        })
        .catch(error => {
          clearTimeout(timeoutId);
          reject(error);
        });
    });
  }

  protected createError(
    message: string,
    code: SearchError,
    details?: any
  ): CautaiSearchError {
    const error = new Error(message) as CautaiSearchError;
    error.code = code;
    error.adapter = this.name;
    error.details = details;
    error.name = 'CautaiSearchError';
    return error;
  }

  protected normalizeUrl(url: string): string {
    try {
      const parsed = new URL(url);
      return parsed.href;
    } catch {
      return url;
    }
  }

  protected extractDomain(url: string): string {
    try {
      const parsed = new URL(url);
      return parsed.hostname.replace(/^www\./, '');
    } catch {
      return 'unknown';
    }
  }

  protected cleanSnippet(snippet: string): string {
    return snippet
      .replace(/\s+/g, ' ')
      .replace(/[<>]/g, '')
      .trim();
  }

  protected generateResultId(url: string, title: string): string {
    return Buffer.from(`${url}-${title}`, 'utf8')
      .toString('base64')
      .substring(0, 16);
  }

  protected parseDate(dateString?: string): Date | undefined {
    if (!dateString) return undefined;
    
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? undefined : date;
  }

  protected estimateReadingTime(text: string): number {
    const wordsPerMinute = 250;
    const wordCount = text.split(/\s+/).length;
    return Math.ceil(wordCount / wordsPerMinute);
  }

  protected extractKeyPhrases(text: string, count: number = 5): string[] {
    const words = text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 3);
    
    const frequency: { [key: string]: number } = {};
    words.forEach(word => {
      frequency[word] = (frequency[word] || 0) + 1;
    });
    
    return Object.entries(frequency)
      .sort(([,a], [,b]) => b - a)
      .slice(0, count)
      .map(([word]) => word);
  }

  protected detectLanguage(text: string): string {
    // Simple language detection - in production use a proper language detector
    const romanianWords = ['și', 'cu', 'de', 'la', 'în', 'pe', 'pentru', 'sau', 'că', 'este'];
    const englishWords = ['the', 'and', 'of', 'to', 'in', 'for', 'is', 'on', 'that', 'with'];
    
    const textLower = text.toLowerCase();
    const roMatches = romanianWords.filter(word => textLower.includes(word)).length;
    const enMatches = englishWords.filter(word => textLower.includes(word)).length;
    
    return roMatches > enMatches ? 'ro' : 'en';
  }
}