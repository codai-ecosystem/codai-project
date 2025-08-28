import { vi } from 'vitest';
import type { CautaiMCPClient } from '@cautai/cautai-client';

/**
 * Mock implementation of CautaiMCPClient for testing
 */
export class MockMCPClient {
  public mockSearch = vi.fn();
  public mockCompose = vi.fn();
  public mockCite = vi.fn();
  public mockConnect = vi.fn();
  public mockDisconnect = vi.fn();

  async connect(): Promise<void> {
    return this.mockConnect();
  }

  async disconnect(): Promise<void> {
    return this.mockDisconnect();
  }

  async search(query: string, options?: any): Promise<any> {
    return this.mockSearch(query, options);
  }

  async compose(results: any[], query: string, style?: string): Promise<any> {
    return this.mockCompose(results, query, style);
  }

  async cite(sources: any[], style?: string): Promise<any> {
    return this.mockCite(sources, style);
  }

  /**
   * Helper method to set up default mock responses
   */
  setupDefaultMocks(): void {
    this.mockConnect.mockResolvedValue(undefined);
    this.mockDisconnect.mockResolvedValue(undefined);
    
    this.mockSearch.mockImplementation(async (query: string, options?: any) => {
      const results = Array.from({ length: options?.maxResults ?? 10 }, (_, i) => ({
        id: String(i + 1),
        title: `Mock Result ${i + 1} for: ${query}`,
        url: `https://mock-result-${i + 1}.example.com`,
        snippet: `This is a mock snippet for result ${i + 1} related to ${query}`,
        score: 0.9 - (i * 0.05),
        metadata: {
          source: 'mock',
          indexed: new Date().toISOString()
        }
      }));

      return {
        results,
        totalResults: results.length,
        query,
        processingTime: Math.floor(Math.random() * 200) + 50
      };
    });

    this.mockCompose.mockImplementation(async (results: any[], query: string, style = 'informative') => {
      return {
        composition: `This is a composed response for "${query}" based on ${results.length} sources. The information covers various aspects related to the query.`,
        sources: results.map(r => ({
          title: r.title,
          url: r.url
        })),
        query,
        style
      };
    });

    this.mockCite.mockImplementation(async (sources: any[], style = 'apa') => {
      return {
        citations: sources.map((source, index) => {
          const date = source.publishedDate ? new Date(source.publishedDate).getFullYear() : new Date().getFullYear();
          if (style === 'apa') {
            const authors = source.authors ? source.authors.map((author: string) => {
              const parts = author.split(' ');
              return `${parts[parts.length - 1]}, ${parts[0][0]}.`;
            }).join(' & ') : 'Unknown Author';
            return `${authors} (${date}). ${source.title}. Retrieved from ${source.url}`;
          } else {
            return `"${source.title}." Web. ${date}. <${source.url}>.`;
          }
        }),
        style
      };
    });
  }

  /**
   * Helper method to simulate errors
   */
  simulateError(errorMessage: string): void {
    this.mockSearch.mockRejectedValue(new Error(errorMessage));
    this.mockCompose.mockRejectedValue(new Error(errorMessage));
    this.mockCite.mockRejectedValue(new Error(errorMessage));
  }

  /**
   * Helper method to simulate slow responses
   */
  simulateSlowResponse(delayMs: number): void {
    this.mockSearch.mockImplementation(async (query: string) => {
      await new Promise(resolve => setTimeout(resolve, delayMs));
      return {
        results: [{
          id: '1',
          title: `Slow Result for: ${query}`,
          url: 'https://slow-result.example.com',
          snippet: `This is a slow response for ${query}`,
          score: 0.8,
          metadata: { source: 'slow-mock' }
        }],
        totalResults: 1,
        query,
        processingTime: delayMs
      };
    });
  }

  /**
   * Helper method to reset all mocks
   */
  reset(): void {
    this.mockSearch.mockReset();
    this.mockCompose.mockReset();
    this.mockCite.mockReset();
    this.mockConnect.mockReset();
    this.mockDisconnect.mockReset();
  }
}