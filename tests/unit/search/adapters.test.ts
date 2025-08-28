import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DuckDuckGoAdapter } from '../../../packages/cautai-core/src/search/adapters/duckduckgo.js';
import type { SearchOptions } from '../../../packages/cautai-core/src/search/types.js';

describe('DuckDuckGoAdapter', () => {
  let adapter: DuckDuckGoAdapter;

  beforeEach(() => {
    adapter = new DuckDuckGoAdapter();
  });

  describe('search', () => {
    it('should perform basic search and return results', async () => {
      // Mock fetch to return sample DuckDuckGo HTML
      const mockHtml = `
        <div class="result">
          <div class="result__title">
            <a href="https://example.com" class="result__a">Test Result Title</a>
          </div>
          <div class="result__snippet">This is a test snippet for the search result.</div>
        </div>
      `;

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        text: () => Promise.resolve(mockHtml),
        headers: new Map([['content-type', 'text/html']])
      });

      const results = await adapter.search({
        query: 'test query',
        limit: 10
      });

      expect(results).toHaveLength(1);
      expect(results[0]).toMatchObject({
        title: 'Test Result Title',
        url: 'https://example.com',
        snippet: 'This is a test snippet for the search result.',
        source: 'duckduckgo'
      });
      expect(results[0].relevance).toBeGreaterThan(0);
      expect(results[0].timestamp).toBeInstanceOf(Date);
    });

    it('should handle multiple search results', async () => {
      const mockHtml = `
        <div class="result">
          <div class="result__title">
            <a href="https://example1.com" class="result__a">First Result</a>
          </div>
          <div class="result__snippet">First snippet</div>
        </div>
        <div class="result">
          <div class="result__title">
            <a href="https://example2.com" class="result__a">Second Result</a>
          </div>
          <div class="result__snippet">Second snippet</div>
        </div>
        <div class="result">
          <div class="result__title">
            <a href="https://example3.com" class="result__a">Third Result</a>
          </div>
          <div class="result__snippet">Third snippet</div>
        </div>
      `;

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        text: () => Promise.resolve(mockHtml),
        headers: new Map([['content-type', 'text/html']])
      });

      const results = await adapter.search({
        query: 'multiple results',
        limit: 10
      });

      expect(results).toHaveLength(3);
      expect(results[0].title).toBe('First Result');
      expect(results[1].title).toBe('Second Result');
      expect(results[2].title).toBe('Third Result');
    });

    it('should respect limit parameter', async () => {
      const mockHtml = Array.from({ length: 20 }, (_, i) => `
        <div class="result">
          <div class="result__title">
            <a href="https://example${i + 1}.com" class="result__a">Result ${i + 1}</a>
          </div>
          <div class="result__snippet">Snippet ${i + 1}</div>
        </div>
      `).join('');

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        text: () => Promise.resolve(mockHtml),
        headers: new Map([['content-type', 'text/html']])
      });

      const results = await adapter.search({
        query: 'limit test',
        limit: 5
      });

      expect(results).toHaveLength(5);
    });

    it('should handle safe search parameter', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        text: () => Promise.resolve('<div></div>'),
        headers: new Map([['content-type', 'text/html']])
      });

      await adapter.search({
        query: 'safe search test',
        safeSearch: true
      });

      const fetchCall = vi.mocked(fetch).mock.calls[0];
      const url = fetchCall[0] as string;
      expect(url).toContain('safe_search=1');
    });

    it('should handle region parameter', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        text: () => Promise.resolve('<div></div>'),
        headers: new Map([['content-type', 'text/html']])
      });

      await adapter.search({
        query: 'region test',
        region: 'us-en'
      });

      const fetchCall = vi.mocked(fetch).mock.calls[0];
      const url = fetchCall[0] as string;
      expect(url).toContain('kl=us-en');
    });

    it('should handle language parameter', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        text: () => Promise.resolve('<div></div>'),
        headers: new Map([['content-type', 'text/html']])
      });

      await adapter.search({
        query: 'limbă română',
        language: 'ro'
      });

      const fetchCall = vi.mocked(fetch).mock.calls[0];
      const url = fetchCall[0] as string;
      expect(url).toContain('lr=lang_ro');
    });

    it('should handle time range parameter', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        text: () => Promise.resolve('<div></div>'),
        headers: new Map([['content-type', 'text/html']])
      });

      await adapter.search({
        query: 'recent news',
        dateRange: 'week'
      });

      const fetchCall = vi.mocked(fetch).mock.calls[0];
      const url = fetchCall[0] as string;
      expect(url).toContain('df=w');
    });

    it('should handle network errors gracefully', async () => {
      global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

      await expect(adapter.search({
        query: 'network error test'
      })).rejects.toThrow('Network error');
    });

    it('should handle HTTP errors', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 429,
        statusText: 'Too Many Requests'
      });

      await expect(adapter.search({
        query: 'rate limit test'
      })).rejects.toThrow('HTTP 429: Too Many Requests');
    });

    it('should handle empty search results', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        text: () => Promise.resolve('<html><body><div>No results found</div></body></html>'),
        headers: new Map([['content-type', 'text/html']])
      });

      const results = await adapter.search({
        query: 'nonexistent query xyz123'
      });

      expect(results).toHaveLength(0);
    });

    it('should handle malformed HTML gracefully', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        text: () => Promise.resolve('<invalid>broken html</invalid>'),
        headers: new Map([['content-type', 'text/html']])
      });

      const results = await adapter.search({
        query: 'malformed html test'
      });

      expect(results).toHaveLength(0);
    });

    it('should sanitize and clean result content', async () => {
      const mockHtml = `
        <div class="result">
          <div class="result__title">
            <a href="https://example.com" class="result__a">Title with <b>Bold</b> text</a>
          </div>
          <div class="result__snippet">Snippet with <em>emphasis</em> and extra   spaces</div>
        </div>
      `;

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        text: () => Promise.resolve(mockHtml),
        headers: new Map([['content-type', 'text/html']])
      });

      const results = await adapter.search({
        query: 'content sanitization test'
      });

      expect(results[0].title).toBe('Title with Bold text');
      expect(results[0].snippet).toBe('Snippet with emphasis and extra spaces');
    });

    it('should generate unique IDs for results', async () => {
      const mockHtml = `
        <div class="result">
          <div class="result__title">
            <a href="https://example1.com" class="result__a">Result 1</a>
          </div>
          <div class="result__snippet">Snippet 1</div>
        </div>
        <div class="result">
          <div class="result__title">
            <a href="https://example2.com" class="result__a">Result 2</a>
          </div>
          <div class="result__snippet">Snippet 2</div>
        </div>
      `;

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        text: () => Promise.resolve(mockHtml),
        headers: new Map([['content-type', 'text/html']])
      });

      const results = await adapter.search({
        query: 'unique id test'
      });

      expect(results[0].id).toBeDefined();
      expect(results[1].id).toBeDefined();
      expect(results[0].id).not.toBe(results[1].id);
    });

    it('should calculate relevance scores', async () => {
      const mockHtml = `
        <div class="result">
          <div class="result__title">
            <a href="https://example.com" class="result__a">Machine Learning Basics</a>
          </div>
          <div class="result__snippet">Introduction to machine learning algorithms</div>
        </div>
      `;

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        text: () => Promise.resolve(mockHtml),
        headers: new Map([['content-type', 'text/html']])
      });

      const results = await adapter.search({
        query: 'machine learning'
      });

      expect(results[0].relevance).toBeGreaterThan(0);
      expect(results[0].relevance).toBeLessThanOrEqual(1);
    });

    it('should handle query encoding properly', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        text: () => Promise.resolve('<div></div>'),
        headers: new Map([['content-type', 'text/html']])
      });

      await adapter.search({
        query: 'special characters: @#$%^&*()'
      });

      const fetchCall = vi.mocked(fetch).mock.calls[0];
      const url = fetchCall[0] as string;
      expect(url).toContain(encodeURIComponent('special characters: @#$%^&*()'));
    });

    it('should set appropriate user agent', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        text: () => Promise.resolve('<div></div>'),
        headers: new Map([['content-type', 'text/html']])
      });

      await adapter.search({
        query: 'user agent test'
      });

      const fetchCall = vi.mocked(fetch).mock.calls[0];
      const options = fetchCall[1] as RequestInit;
      const headers = options.headers as Record<string, string>;
      expect(headers['User-Agent']).toContain('cautai');
    });

    it('should handle timeout', async () => {
      global.fetch = vi.fn().mockImplementation(() => 
        new Promise((resolve) => {
          setTimeout(() => resolve({
            ok: true,
            text: () => Promise.resolve('<div></div>'),
            headers: new Map([['content-type', 'text/html']])
          }), 10000); // 10 second delay
        })
      );

      const searchPromise = adapter.search({
        query: 'timeout test',
        timeout: 1000 // 1 second timeout
      });

      await expect(searchPromise).rejects.toThrow('timeout');
    }, 15000);
  });

  describe('adapter properties', () => {
    it('should have correct name', () => {
      expect(adapter.name).toBe('duckduckgo');
    });

    it('should support required features', () => {
      expect(adapter.supports).toMatchObject({
        safeSearch: true,
        regions: true,
        languages: true,
        timeRange: true,
        contentTypes: false // DuckDuckGo doesn't support content type filtering
      });
    });
  });

  describe('URL construction', () => {
    it('should build correct search URL', () => {
      const options: SearchOptions = {
        query: 'test query',
        limit: 20,
        safeSearch: true,
        region: 'us-en',
        language: 'en',
        dateRange: 'month'
      };

      // Access private method through type assertion for testing
      const url = (adapter as any).buildSearchUrl(options);

      expect(url).toContain('duckduckgo.com');
      expect(url).toContain('q=test%20query');
      expect(url).toContain('safe_search=1');
      expect(url).toContain('kl=us-en');
      expect(url).toContain('lr=lang_en');
      expect(url).toContain('df=m');
    });

    it('should handle URL parameters correctly', () => {
      const baseOptions = { query: 'test' };
      
      const urlDefault = (adapter as any).buildSearchUrl(baseOptions);
      expect(urlDefault).toContain('safe_search=moderate');
      expect(urlDefault).not.toContain('kl=');
      expect(urlDefault).not.toContain('lr=');
      expect(urlDefault).not.toContain('df=');
    });
  });
});