import { vi } from 'vitest';
import type { 
  CautaiSearchEngine, 
  SearchResponse, 
  SearchOptions 
} from '@cautai/cautai-search';

/**
 * Mock implementation of CautaiSearchEngine for testing
 */
export class MockSearchEngine implements CautaiSearchEngine {
  public mockSearch = vi.fn<[string, SearchOptions?], Promise<SearchResponse>>();

  async search(query: string, options?: SearchOptions): Promise<SearchResponse> {
    return this.mockSearch(query, options);
  }

  /**
   * Helper method to set up default mock responses
   */
  setupDefaultMocks(): void {
    this.mockSearch.mockImplementation(async (query: string, options?: SearchOptions) => {
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
        processingTime: Math.floor(Math.random() * 200) + 50 // 50-250ms
      };
    });
  }

  /**
   * Helper method to simulate search errors
   */
  simulateError(errorMessage: string): void {
    this.mockSearch.mockRejectedValue(new Error(errorMessage));
  }

  /**
   * Helper method to simulate slow responses
   */
  simulateSlowResponse(delayMs: number): void {
    this.mockSearch.mockImplementation(async (query: string, options?: SearchOptions) => {
      await new Promise(resolve => setTimeout(resolve, delayMs));
      
      return {
        results: [
          {
            id: '1',
            title: `Slow Result for: ${query}`,
            url: 'https://slow-result.example.com',
            snippet: `This is a slow response for ${query}`,
            score: 0.8,
            metadata: { source: 'slow-mock' }
          }
        ],
        totalResults: 1,
        query,
        processingTime: delayMs
      };
    });
  }

  /**
   * Helper method to simulate empty results
   */
  simulateEmptyResults(): void {
    this.mockSearch.mockResolvedValue({
      results: [],
      totalResults: 0,
      query: '',
      processingTime: 10
    });
  }

  /**
   * Helper method to reset all mocks
   */
  reset(): void {
    this.mockSearch.mockReset();
  }
}