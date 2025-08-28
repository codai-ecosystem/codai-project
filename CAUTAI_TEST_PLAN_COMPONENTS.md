# Cautai: Component-Specific Testing Strategies

## Unit Testing Strategies by Package

### packages/cautai-mcp - MCP Server Core

**Test Coverage Focus:**
- MCP tool implementations with edge cases
- Transport layer (stdio/HTTP) behavior
- Resource handling and caching
- Error handling and validation
- Protocol compliance

```typescript
// tests/unit/mcp/tools/search-web.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { searchWebTool } from '@/tools/search-web';
import { SearchWebParams } from '@/types';

describe('searchWebTool', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('parameter validation', () => {
    it('should reject empty query', async () => {
      const params: SearchWebParams = { query: '' };
      
      await expect(searchWebTool.execute(params))
        .rejects.toThrow('Query must not be empty');
    });

    it('should reject query exceeding max length', async () => {
      const params: SearchWebParams = { 
        query: 'x'.repeat(501) // Exceeds 500 char limit
      };
      
      await expect(searchWebTool.execute(params))
        .rejects.toThrow('Query exceeds maximum length');
    });

    it('should reject invalid depth parameter', async () => {
      const params: SearchWebParams = { 
        query: 'test', 
        depth: 15 // Exceeds max of 10
      };
      
      await expect(searchWebTool.execute(params))
        .rejects.toThrow('Depth must be between 1 and 10');
    });
  });

  describe('search execution', () => {
    it('should return structured results for valid query', async () => {
      const params: SearchWebParams = { 
        query: 'TypeScript',
        sources: ['web'],
        depth: 3
      };
      
      const result = await searchWebTool.execute(params);
      
      expect(result).toMatchObject({
        content: [{
          type: 'text',
          text: expect.stringContaining('"results"')
        }],
        isError: false
      });

      const parsedContent = JSON.parse(result.content[0].text);
      
      expect(parsedContent).toMatchObject({
        results: expect.arrayContaining([
          expect.objectContaining({
            title: expect.any(String),
            url: expect.stringMatching(/^https?:\/\//),
            snippet: expect.any(String),
            score: expect.any(Number),
            citation: expect.objectContaining({
              url: expect.any(String),
              timestamp: expect.any(String),
              contentHash: expect.any(String)
            })
          })
        ]),
        metadata: expect.objectContaining({
          total: expect.any(Number),
          sources: expect.arrayContaining(['web']),
          language: expect.any(String),
          processingTime: expect.any(Number)
        })
      });
    });

    it('should handle network errors gracefully', async () => {
      // Mock network failure
      vi.mocked(globalThis.fetch).mockRejectedValueOnce(
        new Error('Network error')
      );

      const params: SearchWebParams = { query: 'test' };
      
      await expect(searchWebTool.execute(params))
        .rejects.toThrow('Failed to execute search: Network error');
    });

    it('should respect rate limiting', async () => {
      const params: SearchWebParams = { query: 'test' };
      
      // Execute multiple rapid requests
      const promises = Array(10).fill(null).map(() => 
        searchWebTool.execute(params)
      );
      
      await expect(Promise.all(promises))
        .rejects.toThrow('Rate limit exceeded');
    });
  });

  describe('performance benchmarks', () => {
    it('should complete search within latency budget', async () => {
      const params: SearchWebParams = { query: 'fast query' };
      
      const startTime = performance.now();
      await searchWebTool.execute(params);
      const duration = performance.now() - startTime;
      
      expect(duration).toBeLessThan(500); // 500ms budget
    });
  });
});
```

### packages/cautai-cli - CLI Implementation

**Test Coverage Focus:**
- Command parsing and validation
- Configuration management
- File I/O operations
- Interactive TUI behavior
- Error handling and user feedback

```typescript
// tests/unit/cli/commands/search.test.ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { execSync } from 'child_process';
import { searchCommand } from '@/commands/search';
import { MockTTY } from '@test/helpers/mock-tty';

describe('CLI Search Command', () => {
  let mockTTY: MockTTY;
  
  beforeEach(() => {
    mockTTY = new MockTTY();
    vi.spyOn(process, 'stdout', 'get').mockReturnValue(mockTTY as any);
    vi.spyOn(process, 'stdin', 'get').mockReturnValue(mockTTY as any);
  });
  
  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('command line parsing', () => {
    it('should parse basic search query', async () => {
      const result = await searchCommand.parse([
        'search', 'TypeScript programming'
      ]);
      
      expect(result).toMatchObject({
        command: 'search',
        query: 'TypeScript programming',
        sources: ['web'],
        format: 'json',
        interactive: false
      });
    });

    it('should parse advanced options', async () => {
      const result = await searchCommand.parse([
        'search', 'AI search engines',
        '--sources', 'web,news',
        '--depth', '5',
        '--format', 'markdown',
        '--lang', 'ro',
        '--interactive'
      ]);
      
      expect(result).toMatchObject({
        query: 'AI search engines',
        sources: ['web', 'news'],
        depth: 5,
        format: 'markdown',
        language: 'ro',
        interactive: true
      });
    });
  });

  describe('no-AI basic mode', () => {
    it('should work without API keys', async () => {
      // Ensure no API keys in environment
      delete process.env.OPENAI_API_KEY;
      delete process.env.ANTHROPIC_API_KEY;
      
      const result = await searchCommand.execute({
        query: 'test query',
        sources: ['web'],
        mode: 'no-ai-basic'
      });
      
      expect(result).toMatchObject({
        results: expect.any(Array),
        mode: 'no-ai-basic',
        aiEnhanced: false
      });
    });

    it('should provide deterministic results', async () => {
      const query = 'deterministic test query';
      
      const result1 = await searchCommand.execute({ query, mode: 'no-ai-basic' });
      const result2 = await searchCommand.execute({ query, mode: 'no-ai-basic' });
      
      expect(result1.results).toEqual(result2.results);
    });
  });

  describe('interactive TUI mode', () => {
    it('should handle arrow key navigation', async () => {
      mockTTY.sendKeys(['↓', '↓', '↑', 'Enter']);
      
      const result = await searchCommand.executeInteractive();
      
      expect(mockTTY.output).toContain('Search Results');
      expect(mockTTY.selectedIndex).toBe(1);
    });

    it('should support vim-style navigation', async () => {
      mockTTY.sendKeys(['j', 'j', 'k', 'Enter']);
      
      await searchCommand.executeInteractive();
      
      expect(mockTTY.selectedIndex).toBe(1);
    });
  });

  describe('performance and memory', () => {
    it('should not leak memory during long sessions', async () => {
      const initialMemory = process.memoryUsage().heapUsed;
      
      // Simulate 100 searches
      for (let i = 0; i < 100; i++) {
        await searchCommand.execute({
          query: `test query ${i}`,
          mode: 'no-ai-basic'
        });
      }
      
      // Force garbage collection
      if (global.gc) global.gc();
      
      const finalMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = finalMemory - initialMemory;
      
      // Memory increase should be reasonable (< 50MB)
      expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024);
    });
  });
});
```

### apps/cautai-server - HTTP API Server

**Test Coverage Focus:**
- REST API endpoint behavior
- Authentication and authorization
- Rate limiting implementation
- Database and cache interactions
- Error handling and logging

```typescript
// tests/integration/server/api/search.test.ts
import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { FastifyInstance } from 'fastify';
import { createTestServer } from '@test/helpers/server';
import { TestDatabase } from '@test/helpers/database';

describe('Search API Endpoints', () => {
  let server: FastifyInstance;
  let testDb: TestDatabase;
  
  beforeAll(async () => {
    testDb = new TestDatabase();
    await testDb.setup();
    
    server = await createTestServer({
      database: testDb.url,
      cache: 'memory',
      rateLimit: false // Disable for testing
    });
    
    await server.ready();
  });
  
  afterAll(async () => {
    await server.close();
    await testDb.teardown();
  });
  
  beforeEach(async () => {
    await testDb.reset();
  });

  describe('POST /api/v1/search', () => {
    it('should require valid API key', async () => {
      const response = await server.inject({
        method: 'POST',
        url: '/api/v1/search',
        payload: { query: 'test' }
      });
      
      expect(response.statusCode).toBe(401);
      expect(response.json()).toMatchObject({
        error: 'API key required',
        code: 'UNAUTHORIZED'
      });
    });

    it('should validate request payload', async () => {
      const response = await server.inject({
        method: 'POST',
        url: '/api/v1/search',
        headers: {
          'x-api-key': 'valid-test-key-123'
        },
        payload: {
          query: '', // Invalid empty query
          depth: 15 // Invalid depth > 10
        }
      });
      
      expect(response.statusCode).toBe(400);
      expect(response.json()).toMatchObject({
        error: 'Validation failed',
        details: expect.arrayContaining([
          expect.objectContaining({
            field: 'query',
            message: 'Query must not be empty'
          }),
          expect.objectContaining({
            field: 'depth',
            message: 'Depth must be between 1 and 10'
          })
        ])
      });
    });

    it('should return structured search results', async () => {
      const response = await server.inject({
        method: 'POST',
        url: '/api/v1/search',
        headers: {
          'x-api-key': 'valid-test-key-123'
        },
        payload: {
          query: 'TypeScript programming',
          sources: ['web'],
          depth: 5
        }
      });
      
      expect(response.statusCode).toBe(200);
      
      const result = response.json();
      expect(result).toMatchObject({
        results: expect.arrayContaining([
          expect.objectContaining({
            title: expect.any(String),
            url: expect.stringMatching(/^https?:\/\//),
            snippet: expect.any(String),
            score: expect.any(Number)
          })
        ]),
        metadata: expect.objectContaining({
          total: expect.any(Number),
          sources: ['web'],
          processingTime: expect.any(Number),
          signed: expect.stringMatching(/^[A-Za-z0-9+/]+=*\.[A-Za-z0-9+/]+=*$/)
        }),
        citations: expect.any(Array)
      });
    });

    it('should respect rate limits', async () => {
      const testServer = await createTestServer({
        rateLimit: {
          max: 2,
          timeWindow: 1000
        }
      });
      
      const makeRequest = () => testServer.inject({
        method: 'POST',
        url: '/api/v1/search',
        headers: { 'x-api-key': 'rate-limit-test-key' },
        payload: { query: 'test' }
      });
      
      // First two requests should succeed
      await expect(makeRequest()).resolves.toMatchObject({ statusCode: 200 });
      await expect(makeRequest()).resolves.toMatchObject({ statusCode: 200 });
      
      // Third request should be rate limited
      await expect(makeRequest()).resolves.toMatchObject({ 
        statusCode: 429,
        json: expect.objectContaining({
          error: 'Rate limit exceeded'
        })
      });
      
      await testServer.close();
    });

    it('should handle concurrent requests safely', async () => {
      const concurrentRequests = Array(50).fill(null).map((_, i) =>
        server.inject({
          method: 'POST',
          url: '/api/v1/search',
          headers: { 'x-api-key': `concurrent-test-key-${i}` },
          payload: { query: `concurrent query ${i}` }
        })
      );
      
      const responses = await Promise.allSettled(concurrentRequests);
      
      // All requests should complete successfully
      const successful = responses.filter(r => 
        r.status === 'fulfilled' && r.value.statusCode === 200
      );
      
      expect(successful).toHaveLength(50);
    });
  });

  describe('audit logging', () => {
    it('should log all API requests', async () => {
      const logSpy = vi.spyOn(server.log, 'info');
      
      await server.inject({
        method: 'POST',
        url: '/api/v1/search',
        headers: { 'x-api-key': 'audit-test-key' },
        payload: { query: 'audit test' }
      });
      
      expect(logSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          event: 'api_request',
          endpoint: '/api/v1/search',
          method: 'POST',
          keyId: expect.any(String),
          statusCode: 200,
          processingTime: expect.any(Number)
        })
      );
    });
  });
});
```

This covers the first three major components. The test plan would continue with similar detailed strategies for the remaining components (romcp-web, cautai-vscode, etc.). Each section maintains the same level of detail with practical, runnable test examples.

---

*Part 2 of CAUTAI_TEST_PLAN.md - Generated: August 28, 2025*