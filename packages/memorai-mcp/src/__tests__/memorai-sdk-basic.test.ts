/**
 * MemorAI SDK Tests - US-MEM-006 Implementation
 * Basic test suite for the Enhanced TypeScript SDK
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import MemorAISDK from '../sdk/memorai-sdk.js';
import type {
  MemorAIConfig,
  Memory,
  SearchOptions,
  TenantContext
} from '../sdk/memorai-sdk.js';

describe('MemorAI SDK', () => {
  let sdk: MemorAISDK;
  let mockConfig: MemorAIConfig;

  beforeEach(() => {
    mockConfig = {
      baseURL: 'http://localhost:4950',
      apiKey: 'test-api-key'
    };

    // Mock fetch globally
    global.fetch = vi.fn();
    global.WebSocket = vi.fn(() => ({
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
        new MemorAISDK({ baseURL: '', apiKey: 'test' });
      }).toThrow();
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
          statusText: 'Bad Request'
        };
        (global.fetch as any).mockResolvedValue(mockResponse);

        await expect(sdk.remember(mockMemory)).rejects.toThrow('Bad Request');
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
          }
        ];

        const mockResponse = {
          ok: true,
          json: vi.fn().mockResolvedValue({ memories: mockMemories, total: 1 })
        };
        (global.fetch as any).mockResolvedValue(mockResponse);

        const searchOptions: SearchOptions = {
          query: 'test search',
          limit: 10
        };

        const result = await sdk.recall(searchOptions);
        expect(Array.isArray(result)).toBe(true);
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

  describe('Event System', () => {
    beforeEach(() => {
      sdk = new MemorAISDK(mockConfig);
    });

    it('should handle event listeners', () => {
      const eventHandler = vi.fn();

      expect(() => {
        sdk.on('memoryCreated', eventHandler);
        sdk.off('memoryCreated', eventHandler);
      }).not.toThrow();
    });
  });

  describe('Resource Cleanup', () => {
    beforeEach(() => {
      sdk = new MemorAISDK(mockConfig);
    });

    it('should handle destroy gracefully', () => {
      expect(() => {
        sdk.destroy();
      }).not.toThrow();
    });
  });
});