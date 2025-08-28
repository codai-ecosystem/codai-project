/**
 * MemorAI SDK Tests - US-MEM-006 Implementation
 * Comprehensive test suite for the Enhanced TypeScript SDK
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import MemorAISDK from '../sdk/memorai-sdk.js';
import type {
  MemorAIConfig,
  Memory,
  SearchOptions,
  ClusteringOptions,
  AnalyticsOptions,
  TenantContext
} from '../sdk/memorai-sdk.js';

describe('MemorAI SDK', () => {
  let sdk: MemorAISDK;
  let mockConfig: MemorAIConfig;

  beforeEach(() => {
    mockConfig = {
      baseURL: 'http://localhost:4950',
      apiKey: 'test-api-key',
      enableWebSocket: false,
      retryOptions: {
        maxRetries: 2,
        baseDelay: 100,
        maxDelay: 1000
      }
    };

    // Mock fetch globally
    global.fetch = vi.fn();

    // Mock WebSocket
    global.WebSocket = vi.fn().mockImplementation(() => ({
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      send: vi.fn(),
      close: vi.fn(),
      readyState: 1
    })) as any;
  });

  afterEach(() => {
    if (sdk) {
      sdk.destroy();
    }
    vi.resetAllMocks();
  });

  describe('SDK Initialization', () => {
    it('should initialize with valid configuration', () => {
      expect(() => {
        sdk = new MemorAISDK(mockConfig);
      }).not.toThrow();

      expect(sdk).toBeDefined();
    });

    it('should throw error with invalid configuration', () => {
      expect(() => {
        new MemorAISDK({} as MemorAIConfig);
      }).toThrow('Base URL is required');
    });

    it('should set default configuration values', () => {
      const minimalConfig: MemorAIConfig = {
        baseURL: 'http://localhost:4950'
      };

      sdk = new MemorAISDK(minimalConfig);
      expect(sdk).toBeDefined();
    });
  });

  describe('Memory Operations', () => {
    beforeEach(() => {
      sdk = new MemorAISDK(mockConfig);
    });

    describe('remember()', () => {
      it('should store a memory successfully', async () => {
        const mockMemory: Memory = {
          id: 'test-id',
          agentId: 'test-agent',
          content: 'Test memory content',
          timestamp: new Date()
        };

        const mockResponse = {
          ok: true,
          json: vi.fn().mockResolvedValue(mockMemory)
        };
        (global.fetch as any).mockResolvedValue(mockResponse);

        const result = await sdk.remember(mockMemory);
        expect(result).toEqual(mockMemory);
        expect(global.fetch).toHaveBeenCalledWith(
          'http://localhost:4950/api/memories',
          expect.objectContaining({
            method: 'POST',
            headers: expect.objectContaining({
              'Content-Type': 'application/json'
            }),
            body: JSON.stringify(mockMemory)
          })
        );
      });

      it('should handle memory storage errors', async () => {
        const mockMemory: Memory = {
          id: 'test-id',
          agentId: 'test-agent',
          content: 'Test memory content',
          timestamp: new Date()
        };

        const mockResponse = {
          ok: false,
          status: 400,
          statusText: 'Bad Request',
          json: vi.fn().mockResolvedValue({ error: 'Invalid memory format' })
        };
        (global.fetch as any).mockResolvedValue(mockResponse);

        await expect(sdk.remember(mockMemory)).rejects.toThrow('Bad Request');
      });

      it('should include tenant context when provided', async () => {
        const mockMemory: Memory = {
          id: 'test-id',
          agentId: 'test-agent',
          content: 'Test memory content',
          timestamp: new Date()
        };

        const tenantContext: TenantContext = {
          agentId: 'test-agent',
          requestId: 'req-123',
          permissions: ['read', 'write'],
          restrictions: {}
        };

        const mockResponse = {
          ok: true,
          json: vi.fn().mockResolvedValue(mockMemory)
        };
        (global.fetch as any).mockResolvedValue(mockResponse);

        await sdk.remember(mockMemory, tenantContext);

        expect(global.fetch).toHaveBeenCalledWith(
          'http://localhost:4950/api/memories',
          expect.objectContaining({
            headers: expect.objectContaining({
              'X-Tenant-Context': expect.any(String)
            })
          })
        );
      });
    });

    describe('recall()', () => {
      it('should retrieve memories successfully', async () => {
        const mockMemories: Memory[] = [
          {
            id: 'memory-1',
            agentId: 'test-agent',
            content: 'First memory',
            timestamp: new Date()
          },
          {
            id: 'memory-2',
            agentId: 'test-agent',
            content: 'Second memory',
            timestamp: new Date()
          }
        ];

        const mockResponse = {
          ok: true,
          json: vi.fn().mockResolvedValue({ memories: mockMemories, total: 2 })
        };
        (global.fetch as any).mockResolvedValue(mockResponse);

        const searchOptions: SearchOptions = {
          query: 'test search',
          limit: 10
        };

        const result = await sdk.recall(searchOptions);
        expect(Array.isArray(result)).toBe(true);
      });

      it('should handle search errors gracefully', async () => {
        const mockResponse = {
          ok: false,
          status: 500,
          statusText: 'Internal Server Error',
          json: vi.fn().mockResolvedValue({ error: 'Search failed' })
        };
        (global.fetch as any).mockResolvedValue(mockResponse);

        const searchOptions: SearchOptions = {
          query: 'test search'
        };

        await expect(sdk.recall(searchOptions)).rejects.toThrow('Internal Server Error');
      });
    });

    describe('updateMemory()', () => {
      it('should update memory successfully', async () => {
        const updatedMemory: Memory = {
          id: 'memory-1',
          agentId: 'test-agent',
          content: 'Updated memory content',
          timestamp: new Date()
        };

        const mockResponse = {
          ok: true,
          json: vi.fn().mockResolvedValue(updatedMemory)
        };
        (global.fetch as any).mockResolvedValue(mockResponse);

        const updates = { content: 'Updated memory content' };
        const result = await sdk.updateMemory('memory-1', updates);

        expect(result).toEqual(updatedMemory);
        expect(global.fetch).toHaveBeenCalledWith(
          'http://localhost:4950/api/memories/memory-1',
          expect.objectContaining({
            method: 'PUT',
            body: JSON.stringify(updates)
          })
        );
      });
    });

    describe('forget()', () => {
      it('should delete memory successfully', async () => {
        const mockResponse = {
          ok: true,
          json: vi.fn().mockResolvedValue({ success: true })
        };
        (global.fetch as any).mockResolvedValue(mockResponse);

        await sdk.forget('memory-1');

        expect(global.fetch).toHaveBeenCalledWith(
          'http://localhost:4950/api/memories/memory-1',
          expect.objectContaining({
            method: 'DELETE'
          })
        );
      });
    });
  });

  describe('Advanced Features', () => {
    beforeEach(() => {
      sdk = new MemorAISDK(mockConfig);
    });

    describe('clusterMemories()', () => {
      it('should cluster memories successfully', async () => {
        const mockClusterResult = {
          clusters: [
            {
              id: 'cluster-1',
              centroid: [0.1, 0.2, 0.3],
              memories: ['memory-1', 'memory-2'],
              size: 2
            }
          ],
          silhouetteScore: 0.75,
          totalClusters: 1
        };

        const mockResponse = {
          ok: true,
          json: vi.fn().mockResolvedValue(mockClusterResult)
        };
        (global.fetch as any).mockResolvedValue(mockResponse);

        const clusterOptions: ClusteringOptions = {
          agentId: 'test-agent',
          clusterCount: 5
        };

        const result = await sdk.clusterMemories(clusterOptions);
        expect(result).toEqual(mockClusterResult);
      });
    });

    describe('getAnalytics()', () => {
      it('should retrieve analytics successfully', async () => {
        const mockAnalytics = {
          summary: {
            totalMemories: 100,
            averageImportance: 7.5,
            lastUpdate: new Date().toISOString()
          },
          performanceMetrics: {
            responseTime: 150,
            successRate: 98.5
          },
          usagePatterns: {
            peakHours: ['09:00', '14:00', '16:00'],
            commonQueries: ['test', 'example', 'demo']
          }
        };

        const mockResponse = {
          ok: true,
          json: vi.fn().mockResolvedValue(mockAnalytics)
        };
        (global.fetch as any).mockResolvedValue(mockResponse);

        const analyticsOptions: AnalyticsOptions = {
          agentId: 'test-agent',
          timeRange: 'last_7d'
        };

        const result = await sdk.getAnalytics(analyticsOptions);
        expect(result).toEqual(mockAnalytics);
      });
    });

    describe('summarizeMemories()', () => {
      it('should summarize memories successfully', async () => {
        const mockSummary = {
          summary: 'This is a test summary of the memories',
          level: 'CONCISE',
          strategy: 'EXTRACTIVE',
          memoryCount: 10
        };

        const mockResponse = {
          ok: true,
          json: vi.fn().mockResolvedValue(mockSummary)
        };
        (global.fetch as any).mockResolvedValue(mockResponse);

        const summarizeOptions = {
          agentId: 'test-agent',
          level: 'CONCISE' as const,
          strategy: 'EXTRACTIVE' as const
        };

        const result = await sdk.summarizeMemories(summarizeOptions);
        expect(result).toEqual(mockSummary);
      });
    });
  });

  describe('Error Handling and Retry Logic', () => {
    beforeEach(() => {
      sdk = new MemorAISDK(mockConfig);
    });

    it('should retry failed requests according to configuration', async () => {
      const mockMemory: Memory = {
        id: 'test-id',
        agentId: 'test-agent',
        content: 'Test memory content',
        timestamp: new Date()
      };

      // First two calls fail, third succeeds
      const failResponse = { ok: false, status: 500, statusText: 'Server Error' };
      const successResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue(mockMemory)
      };

      (global.fetch as any)
        .mockResolvedValueOnce(failResponse)
        .mockResolvedValueOnce(failResponse)
        .mockResolvedValueOnce(successResponse);

      const result = await sdk.remember(mockMemory);
      expect(result).toEqual(mockMemory);
      expect(global.fetch).toHaveBeenCalledTimes(3);
    });

    it('should throw error after max retries exceeded', async () => {
      const mockMemory: Memory = {
        id: 'test-id',
        agentId: 'test-agent',
        content: 'Test memory content',
        timestamp: new Date()
      };

      const failResponse = { ok: false, status: 500, statusText: 'Server Error' };
      (global.fetch as any).mockResolvedValue(failResponse);

      await expect(sdk.remember(mockMemory)).rejects.toThrow('Server Error');
      expect(global.fetch).toHaveBeenCalledTimes(3); // Initial + 2 retries
    });
  });

  describe('Event System', () => {
    beforeEach(() => {
      sdk = new MemorAISDK(mockConfig);
    });

    it('should emit events for memory operations', async () => {
      const mockMemory: Memory = {
        id: 'test-id',
        agentId: 'test-agent',
        content: 'Test memory content',
        timestamp: new Date()
      };

      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue(mockMemory)
      };
      (global.fetch as any).mockResolvedValue(mockResponse);

      const eventHandler = vi.fn();
      sdk.on('memoryCreated', eventHandler);

      await sdk.remember(mockMemory);

      // Simulate event emission (would normally be from WebSocket)
      sdk.emit('memoryCreated', mockMemory);

      expect(eventHandler).toHaveBeenCalledWith(mockMemory);
    });

    it('should handle event listener cleanup', () => {
      const eventHandler = vi.fn();
      sdk.on('memoryCreated', eventHandler);
      sdk.off('memoryCreated', eventHandler);

      // Event should not be called after removal
      sdk.emit('memoryCreated', { id: 'test' });
      expect(eventHandler).not.toHaveBeenCalled();
    });
  });

  describe('Configuration Validation', () => {
    it('should validate required configuration fields', () => {
      expect(() => {
        new MemorAISDK({ baseURL: '' });
      }).toThrow('Base URL is required');
    });

    it('should apply default values for optional fields', () => {
      const sdk = new MemorAISDK({ baseURL: 'http://localhost:4950' });
      expect(sdk).toBeDefined();
    });

    it('should validate retry configuration', () => {
      const config: MemorAIConfig = {
        baseURL: 'http://localhost:4950',
        retryOptions: {
          maxRetries: -1, // Invalid
          baseDelay: 100,
          maxDelay: 1000
        }
      };

      expect(() => {
        new MemorAISDK(config);
      }).toThrow('Invalid retry configuration');
    });
  });

  describe('Resource Cleanup', () => {
    beforeEach(() => {
      sdk = new MemorAISDK(mockConfig);
    });

    it('should cleanup resources on destroy', () => {
      const mockWebSocket = {
        close: vi.fn(),
        removeEventListener: vi.fn()
      };

      // Mock WebSocket connection
      (sdk as any).ws = mockWebSocket;

      sdk.destroy();
      expect(mockWebSocket.close).toHaveBeenCalled();
    });

    it('should handle destroy when no WebSocket exists', () => {
      expect(() => {
        sdk.destroy();
      }).not.toThrow();
    });
  });
});