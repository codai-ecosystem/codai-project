import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { CautaiMCPServer } from '@cautai/cautai-mcp';
import { MockSearchEngine } from '../../../helpers/mocks/search-engine';

describe('CautaiMCPServer', () => {
  let server: CautaiMCPServer;
  let mockSearchEngine: MockSearchEngine;

  beforeEach(() => {
    mockSearchEngine = new MockSearchEngine();
    server = new CautaiMCPServer({
      searchEngine: mockSearchEngine,
      name: 'test-server',
      version: '1.0.0',
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Server Initialization', () => {
    it('should initialize with correct server info', () => {
      const info = server.getServerInfo();
      
      expect(info.name).toBe('test-server');
      expect(info.version).toBe('1.0.0');
      expect(info.protocolVersion).toBe('2024-11-05');
    });

    it('should register all required tools', async () => {
      const tools = await server.listTools();
      const toolNames = tools.tools.map(tool => tool.name);
      
      expect(toolNames).toContain('search');
      expect(toolNames).toContain('compose');
      expect(toolNames).toContain('cite');
      expect(tools.tools).toHaveLength(3);
    });
  });

  describe('Search Tool', () => {
    it('should handle valid search requests', async () => {
      const searchResults = {
        results: [
          {
            id: '1',
            title: 'Test Result',
            url: 'https://example.com',
            snippet: 'Test snippet',
            score: 0.95,
            metadata: {}
          }
        ],
        totalResults: 1,
        query: 'test query',
        processingTime: 150
      };

      mockSearchEngine.mockSearch.mockResolvedValue(searchResults);

      const result = await server.callTool('search', {
        query: 'test query',
        maxResults: 10,
        language: 'en'
      });

      expect(result.isError).toBe(false);
      if (!result.isError) {
        expect(result.content).toHaveLength(1);
        expect(result.content[0].type).toBe('text');
        expect(JSON.parse(result.content[0].text)).toEqual(searchResults);
      }
    });

    it('should validate search parameters', async () => {
      const result = await server.callTool('search', {
        query: '', // Invalid empty query
        maxResults: 10
      });

      expect(result.isError).toBe(true);
      expect(result.content).toBe('Search query cannot be empty');
    });

    it('should handle search engine errors', async () => {
      mockSearchEngine.mockSearch.mockRejectedValue(new Error('Search failed'));

      const result = await server.callTool('search', {
        query: 'test query',
        maxResults: 10
      });

      expect(result.isError).toBe(true);
      expect(result.content).toContain('Search failed');
    });

    it('should respect maxResults parameter', async () => {
      const searchResults = {
        results: Array.from({ length: 20 }, (_, i) => ({
          id: String(i + 1),
          title: `Result ${i + 1}`,
          url: `https://example${i + 1}.com`,
          snippet: `Snippet ${i + 1}`,
          score: 0.9 - (i * 0.01),
          metadata: {}
        })),
        totalResults: 20,
        query: 'test query',
        processingTime: 200
      };

      mockSearchEngine.mockSearch.mockResolvedValue(searchResults);

      const result = await server.callTool('search', {
        query: 'test query',
        maxResults: 5
      });

      expect(result.isError).toBe(false);
      if (!result.isError) {
        const response = JSON.parse(result.content[0].text);
        expect(response.results).toHaveLength(5);
      }
    });
  });

  describe('Compose Tool', () => {
    it('should compose search results into coherent text', async () => {
      const composeRequest = {
        results: [
          {
            title: 'AI Development',
            snippet: 'AI is transforming software development',
            url: 'https://example1.com'
          },
          {
            title: 'Machine Learning',
            snippet: 'ML algorithms power modern applications',
            url: 'https://example2.com'
          }
        ],
        query: 'AI in software development',
        style: 'informative' as const
      };

      const result = await server.callTool('compose', composeRequest);

      expect(result.isError).toBe(false);
      if (!result.isError) {
        const response = JSON.parse(result.content[0].text);
        expect(response.composition).toContain('AI');
        expect(response.composition).toContain('software development');
        expect(response.sources).toHaveLength(2);
        expect(response.query).toBe('AI in software development');
        expect(response.style).toBe('informative');
      }
    });

    it('should handle different composition styles', async () => {
      const composeRequest = {
        results: [
          {
            title: 'Test Title',
            snippet: 'Test content',
            url: 'https://example.com'
          }
        ],
        query: 'test query',
        style: 'summary' as const
      };

      const result = await server.callTool('compose', composeRequest);

      expect(result.isError).toBe(false);
      if (!result.isError) {
        const response = JSON.parse(result.content[0].text);
        expect(response.style).toBe('summary');
        expect(response.composition).toBeDefined();
      }
    });

    it('should validate compose parameters', async () => {
      const result = await server.callTool('compose', {
        results: [], // Empty results
        query: 'test query',
        style: 'informative'
      });

      expect(result.isError).toBe(true);
      expect(result.content).toContain('No results provided');
    });
  });

  describe('Citation Tool', () => {
    it('should generate proper citations', async () => {
      const citeRequest = {
        sources: [
          {
            title: 'AI Research Paper',
            authors: ['John Doe', 'Jane Smith'],
            url: 'https://research.example.com/ai-paper',
            publishedDate: '2024-01-15',
            type: 'academic' as const
          },
          {
            title: 'Tech Blog Post',
            url: 'https://blog.example.com/tech-post',
            publishedDate: '2024-02-20',
            type: 'web' as const
          }
        ],
        style: 'apa' as const
      };

      const result = await server.callTool('cite', citeRequest);

      expect(result.isError).toBe(false);
      if (!result.isError) {
        const response = JSON.parse(result.content[0].text);
        expect(response.citations).toHaveLength(2);
        expect(response.style).toBe('apa');
        expect(response.citations[0]).toContain('Doe, J.');
        expect(response.citations[0]).toContain('Smith, J.');
      }
    });

    it('should handle different citation styles', async () => {
      const citeRequest = {
        sources: [
          {
            title: 'Sample Article',
            url: 'https://example.com/article',
            type: 'web' as const
          }
        ],
        style: 'mla' as const
      };

      const result = await server.callTool('cite', citeRequest);

      expect(result.isError).toBe(false);
      if (!result.isError) {
        const response = JSON.parse(result.content[0].text);
        expect(response.style).toBe('mla');
        expect(response.citations).toHaveLength(1);
      }
    });

    it('should validate citation parameters', async () => {
      const result = await server.callTool('cite', {
        sources: [], // Empty sources
        style: 'apa'
      });

      expect(result.isError).toBe(true);
      expect(result.content).toContain('No sources provided');
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid tool names', async () => {
      const result = await server.callTool('invalid_tool', {});

      expect(result.isError).toBe(true);
      expect(result.content).toContain('Unknown tool');
    });

    it('should handle malformed requests', async () => {
      const result = await server.callTool('search', null);

      expect(result.isError).toBe(true);
      expect(result.content).toContain('Invalid arguments');
    });
  });

  describe('Performance', () => {
    it('should complete search requests within time limits', async () => {
      const searchResults = {
        results: [
          {
            id: '1',
            title: 'Fast Result',
            url: 'https://example.com',
            snippet: 'Quick response',
            score: 0.95,
            metadata: {}
          }
        ],
        totalResults: 1,
        query: 'fast query',
        processingTime: 50
      };

      mockSearchEngine.mockSearch.mockResolvedValue(searchResults);

      const startTime = Date.now();
      const result = await server.callTool('search', {
        query: 'fast query',
        maxResults: 10
      });
      const endTime = Date.now();

      expect(result.isError).toBe(false);
      expect(endTime - startTime).toBeLessThan(1000); // Should complete in under 1 second
    });
  });
});