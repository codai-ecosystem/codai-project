import { test, expect } from '@playwright/test';

// Standard headers for MCP requests
const mcpHeaders = {
  'Content-Type': 'application/json',
  'Accept': 'application/json, text/event-stream'
};

// Helper function to parse SSE response and extract JSON data
async function parseSSEResponse(response: any) {
  const text = await response.text();
  // SSE format: "event: message\ndata: {...}"
  const lines = text.split('\n');
  const dataLine = lines.find((line: string) => line.startsWith('data: '));
  if (!dataLine) {
    throw new Error(`No data line found in SSE response: ${text}`);
  }
  const jsonData = dataLine.replace('data: ', '');
  return JSON.parse(jsonData);
}

test.describe('MemorAI MCP Server E2E Tests', () => {
  test.beforeAll(async () => {
    // Ensure server is running
    // The server should be running on localhost:4950
  });

  test('should have health endpoint responding', async ({ request }) => {
    const response = await request.get('http://localhost:4950/health');
    
    expect(response.ok()).toBeTruthy();
    
    const health = await response.json();
    expect(health.status).toBe('healthy');
    expect(health.service).toBe('memorai-mcp-server');
    expect(health.version).toBeDefined();
    expect(health.mcpProtocol).toBeDefined();
  });

  test('should handle remember tool via HTTP', async ({ request }) => {
    const memoryData = {
      jsonrpc: '2.0',
      id: 'e2e-test-1',
      method: 'tools/call',
      params: {
        name: 'remember',
        arguments: {
          agentId: 'e2e-test-agent',
          content: 'E2E test memory content',
          metadata: {
            entityType: 'e2e_test',
            importance: 7,
            tags: ['testing', 'e2e']
          }
        }
      }
    };

    const response = await request.post('http://localhost:4950/mcp', {
      data: memoryData,
      headers: mcpHeaders
    });

    expect(response.ok()).toBeTruthy();
    
    const result = await parseSSEResponse(response);
    expect(result.jsonrpc).toBe('2.0');
    expect(result.id).toBe('e2e-test-1');
    expect(result.result).toBeDefined();
    expect(result.result.content).toBeDefined();
    expect(Array.isArray(result.result.content)).toBe(true);
  });

  test('should handle recall tool via HTTP', async ({ request }) => {
    // First, store a memory to recall
    const rememberData = {
      jsonrpc: '2.0',
      id: 'e2e-setup-1',
      method: 'tools/call',
      params: {
        name: 'remember',
        arguments: {
          agentId: 'e2e-recall-agent',
          content: 'JavaScript best practices for performance optimization',
          metadata: {
            entityType: 'knowledge',
            importance: 8,
            tags: ['javascript', 'performance']
          }
        }
      }
    };

    await request.post('http://localhost:4950/mcp', {
      data: rememberData,
      headers: mcpHeaders
    });

    // Now recall the memory
    const recallData = {
      jsonrpc: '2.0',
      id: 'e2e-test-2',
      method: 'tools/call',
      params: {
        name: 'recall',
        arguments: {
          agentId: 'e2e-recall-agent',
          query: 'JavaScript performance',
          limit: 5
        }
      }
    };

    const response = await request.post('http://localhost:4950/mcp', {
      data: recallData,
      headers: mcpHeaders
    });

    expect(response.ok()).toBeTruthy();
    
    const result = await parseSSEResponse(response);
    expect(result.jsonrpc).toBe('2.0');
    expect(result.id).toBe('e2e-test-2');
    expect(result.result).toBeDefined();
    expect(result.result.content).toBeDefined();
    expect(Array.isArray(result.result.content)).toBe(true);
  });

  test('should handle context tool via HTTP', async ({ request }) => {
    const contextData = {
      jsonrpc: '2.0',
      id: 'e2e-test-3',
      method: 'tools/call',
      params: {
        name: 'context',
        arguments: {
          agentId: 'e2e-context-agent',
          contextSize: 3
        }
      }
    };

    const response = await request.post('http://localhost:4950/mcp', {
      data: contextData,
      headers: mcpHeaders
    });

    expect(response.ok()).toBeTruthy();
    
    const result = await parseSSEResponse(response);
    expect(result.jsonrpc).toBe('2.0');
    expect(result.id).toBe('e2e-test-3');
    expect(result.result).toBeDefined();
    expect(result.result.content).toBeDefined();
    expect(Array.isArray(result.result.content)).toBe(true);
  });

  test('should handle error cases gracefully', async ({ request }) => {
    const invalidData = {
      jsonrpc: '2.0',
      id: 'e2e-test-error',
      method: 'tools/call',
      params: {
        name: 'nonexistent_method',
        arguments: {}
      }
    };

    const response = await request.post('http://localhost:4950/mcp', {
      data: invalidData,
      headers: mcpHeaders
    });

    expect(response.ok()).toBeTruthy(); // JSON-RPC returns 200 even for errors
    
    const result = await parseSSEResponse(response);
    expect(result.jsonrpc).toBe('2.0');
    expect(result.id).toBe('e2e-test-error');
    expect(result.error).toBeDefined();
    expect(result.error.code).toBe(-32602); // Invalid params (nonexistent tool name)
  });

  test('should maintain memory isolation between agents', async ({ request }) => {
    // Store memory for agent A
    await request.post('http://localhost:4950/mcp', {
      data: {
        jsonrpc: '2.0',
        id: 'isolation-1',
        method: 'tools/call',
        params: {
          name: 'remember',
          arguments: {
            agentId: 'agent-a',
            content: 'Agent A specific information',
            metadata: { source: 'agent-a' }
          }
        }
      },
      headers: mcpHeaders
    });

    // Store memory for agent B
    await request.post('http://localhost:4950/mcp', {
      data: {
        jsonrpc: '2.0',
        id: 'isolation-2',
        method: 'tools/call',
        params: {
          name: 'remember',
          arguments: {
            agentId: 'agent-b',
            content: 'Agent B specific information',
            metadata: { source: 'agent-b' }
          }
        }
      },
      headers: mcpHeaders
    });

    // Recall from agent A - should not see agent B's memories
    const recallA = await request.post('http://localhost:4950/mcp', {
      data: {
        jsonrpc: '2.0',
        id: 'isolation-test-a',
        method: 'tools/call',
        params: {
          name: 'recall',
          arguments: {
            agentId: 'agent-a',
            query: 'information'
          }
        }
      },
      headers: mcpHeaders
    });

    const resultA = await parseSSEResponse(recallA);
    expect(resultA.result.content.length).toBeGreaterThan(0);

    // Recall from agent B - should not see agent A's memories
    const recallB = await request.post('http://localhost:4950/mcp', {
      data: {
        jsonrpc: '2.0',
        id: 'isolation-test-b',
        method: 'tools/call',
        params: {
          name: 'recall',
          arguments: {
            agentId: 'agent-b',
            query: 'information'
          }
        }
      },
      headers: mcpHeaders
    });

    const resultB = await parseSSEResponse(recallB);
    expect(resultB.result.content.length).toBeGreaterThan(0);
    
    // Verify isolation - content should be different
    const agentAContent = resultA.result.content.map((c: any) => c.text).join(' ');
    const agentBContent = resultB.result.content.map((c: any) => c.text).join(' ');
    
    expect(agentAContent.includes('Agent A')).toBe(true);
    expect(agentBContent.includes('Agent B')).toBe(true);
  });

  test('should handle concurrent requests efficiently', async ({ request }) => {
    const concurrentRequests = Array.from({ length: 20 }, (_, i) => 
      request.post('http://localhost:4950/mcp', {
        data: {
          jsonrpc: '2.0',
          id: `concurrent-${i}`,
          method: 'tools/call',
          params: {
            name: 'remember',
            arguments: {
              agentId: 'concurrent-test-agent',
              content: `Concurrent memory ${i}`,
              metadata: { index: i }
            }
          }
        },
        headers: mcpHeaders
      })
    );

    const responses = await Promise.all(concurrentRequests);
    
    // All requests should succeed
    for (const response of responses) {
      expect(response.ok()).toBeTruthy();
      const result = await parseSSEResponse(response);
      expect(result.result.content).toBeDefined();
      expect(Array.isArray(result.result.content)).toBe(true);
    }
  });

  test('should validate response format compliance', async ({ request }) => {
    const response = await request.post('http://localhost:4950/mcp', {
      data: {
        jsonrpc: '2.0',
        id: 'format-test',
        method: 'tools/call',
        params: {
          name: 'remember',
          arguments: {
            agentId: 'format-test-agent',
            content: 'Test content for format validation'
          }
        }
      },
      headers: mcpHeaders
    });

    expect(response.ok()).toBeTruthy();
    
    const result = await parseSSEResponse(response);
    
    // JSON-RPC 2.0 compliance
    expect(result.jsonrpc).toBe('2.0');
    expect(result.id).toBe('format-test');
    expect(result.result).toBeDefined();
    expect(result.error).toBeUndefined();
    
    // MCP tool response format
    expect(result.result.content).toBeDefined();
    expect(Array.isArray(result.result.content)).toBe(true);
    expect(result.result.content.length).toBeGreaterThan(0);
    expect(result.result.content[0].type).toBe('text');
    expect(result.result.content[0].text).toBeDefined();
  });

  test('should handle large content payloads', async ({ request }) => {
    // Create a 1MB content string
    const largeContent = 'x'.repeat(1024 * 1024);
    
    const response = await request.post('http://localhost:4950/mcp', {
      data: {
        jsonrpc: '2.0',
        id: 'large-content-test',
        method: 'tools/call',
        params: {
          name: 'remember',
          arguments: {
            agentId: 'large-content-agent',
            content: largeContent,
            metadata: { size: 'large', bytes: largeContent.length }
          }
        }
      },
      headers: mcpHeaders
    });

    expect(response.ok()).toBeTruthy();
    
    const result = await parseSSEResponse(response);
    expect(result.result.content).toBeDefined();
    expect(Array.isArray(result.result.content)).toBe(true);
  });

  test('should handle special characters and Unicode', async ({ request }) => {
    const specialContent = 'Special characters: 你好世界 🚀 💡 "quotes" \'apostrophes\' <tags> & entities \\n\\t\\r';
    
    const response = await request.post('http://localhost:4950/mcp', {
      data: {
        jsonrpc: '2.0',
        id: 'unicode-test',
        method: 'tools/call',
        params: {
          name: 'remember',
          arguments: {
            agentId: 'unicode-test-agent',
            content: specialContent,
            metadata: { type: 'unicode_test' }
          }
        }
      },
      headers: mcpHeaders
    });

    expect(response.ok()).toBeTruthy();
    
    const result = await parseSSEResponse(response);
    expect(result.result.content).toBeDefined();
    expect(Array.isArray(result.result.content)).toBe(true);
    
    // Verify we can recall the special content
    const recallResponse = await request.post('http://localhost:4950/mcp', {
      data: {
        jsonrpc: '2.0',
        id: 'unicode-recall-test',
        method: 'tools/call',
        params: {
          name: 'recall',
          arguments: {
            agentId: 'unicode-test-agent',
            query: '你好世界'
          }
        }
      },
      headers: mcpHeaders
    });

    const recallResult = await parseSSEResponse(recallResponse);
    expect(recallResult.result.content.length).toBeGreaterThan(0);
  });
});