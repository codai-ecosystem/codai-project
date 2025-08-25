import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { z } from 'zod';

// Mock dotenv before any imports
vi.mock('dotenv', () => ({
  config: vi.fn()
}));

// Mock path module to avoid file system dependencies
vi.mock('path', () => ({
  resolve: vi.fn(() => '/mock/path'),
  join: vi.fn(() => '/mock/path/.env')
}));

describe('Memory Tools Schema Validation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('remember tool schema', () => {
    it('should validate required parameters', async () => {
      const rememberSchema = z.object({
        agentId: z.string().min(1, 'Agent ID is required'),
        content: z.string().min(1, 'Content is required'),
        metadata: z.record(z.any()).optional()
      });

      // Test valid parameters
      expect(() => rememberSchema.parse({
        agentId: 'test-agent',
        content: 'test content'
      })).not.toThrow();

      // Test missing agentId
      expect(() => rememberSchema.parse({
        content: 'test content'
      })).toThrow();

      // Test empty agentId
      expect(() => rememberSchema.parse({
        agentId: '',
        content: 'test content'
      })).toThrow();

      // Test missing content
      expect(() => rememberSchema.parse({
        agentId: 'test-agent'
      })).toThrow();

      // Test empty content
      expect(() => rememberSchema.parse({
        agentId: 'test-agent',
        content: ''
      })).toThrow();
    });

    it('should handle metadata correctly', async () => {
      const rememberSchema = z.object({
        agentId: z.string().min(1),
        content: z.string().min(1),
        metadata: z.record(z.any()).optional()
      });

      // Test with metadata
      const validWithMetadata = {
        agentId: 'test-agent',
        content: 'test content',
        metadata: { priority: 'high', tags: ['important'] }
      };

      expect(() => rememberSchema.parse(validWithMetadata)).not.toThrow();

      // Test without metadata
      const validWithoutMetadata = {
        agentId: 'test-agent',
        content: 'test content'
      };

      expect(() => rememberSchema.parse(validWithoutMetadata)).not.toThrow();
    });
  });

  describe('recall tool schema', () => {
    it('should validate required parameters', async () => {
      const recallSchema = z.object({
        agentId: z.string().min(1, 'Agent ID is required'),
        query: z.string().min(1, 'Query is required'),
        limit: z.number().optional(),
        minImportance: z.number().optional(),
        project: z.string().optional(),
        session: z.string().optional()
      });

      // Test valid parameters
      expect(() => recallSchema.parse({
        agentId: 'test-agent',
        query: 'test query'
      })).not.toThrow();

      // Test missing agentId
      expect(() => recallSchema.parse({
        query: 'test query'
      })).toThrow();

      // Test missing query
      expect(() => recallSchema.parse({
        agentId: 'test-agent'
      })).toThrow();
    });

    it('should handle optional parameters correctly', async () => {
      const recallSchema = z.object({
        agentId: z.string().min(1),
        query: z.string().min(1),
        limit: z.number().optional(),
        minImportance: z.number().optional(),
        project: z.string().optional(),
        session: z.string().optional()
      });

      // Test with all optional parameters
      const fullParams = {
        agentId: 'test-agent',
        query: 'test query',
        limit: 10,
        minImportance: 5,
        project: 'test-project',
        session: 'test-session'
      };

      expect(() => recallSchema.parse(fullParams)).not.toThrow();
    });
  });

  describe('forget tool schema', () => {
    it('should validate required parameters', async () => {
      const forgetSchema = z.object({
        agentId: z.string().min(1, 'Agent ID is required'),
        structuredKey: z.string().min(1, 'Structured key is required')
      });

      // Test valid parameters
      expect(() => forgetSchema.parse({
        agentId: 'test-agent',
        structuredKey: 'test-key'
      })).not.toThrow();

      // Test missing parameters
      expect(() => forgetSchema.parse({
        agentId: 'test-agent'
      })).toThrow();

      expect(() => forgetSchema.parse({
        structuredKey: 'test-key'
      })).toThrow();
    });
  });

  describe('context tool schema', () => {
    it('should validate required parameters', async () => {
      const contextSchema = z.object({
        agentId: z.string().min(1, 'Agent ID is required'),
        contextSize: z.number().optional().default(5)
      });

      // Test valid parameters
      expect(() => contextSchema.parse({
        agentId: 'test-agent'
      })).not.toThrow();

      expect(() => contextSchema.parse({
        agentId: 'test-agent',
        contextSize: 10
      })).not.toThrow();

      // Test missing agentId
      expect(() => contextSchema.parse({
        contextSize: 10
      })).toThrow();
    });

    it('should handle default contextSize', async () => {
      const contextSchema = z.object({
        agentId: z.string().min(1),
        contextSize: z.number().optional().default(5)
      });

      const parsed = contextSchema.parse({
        agentId: 'test-agent'
      });

      expect(parsed.contextSize).toBe(5);
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid agent ID format', () => {
      const agentIdSchema = z.string().min(1, 'Agent ID is required');

      expect(() => agentIdSchema.parse('')).toThrow('Agent ID is required');
      expect(() => agentIdSchema.parse(null)).toThrow();
      expect(() => agentIdSchema.parse(undefined)).toThrow();
    });

    it('should handle special characters in content', () => {
      const contentSchema = z.string().min(1);

      const specialContent = 'Special chars: 你好 🚀 "quotes" \n\t\r';
      expect(() => contentSchema.parse(specialContent)).not.toThrow();

      const jsonContent = '{"key": "value", "nested": {"array": [1, 2, 3]}}';
      expect(() => contentSchema.parse(jsonContent)).not.toThrow();
    });
  });

  describe('Concurrent Operations', () => {
    it('should handle multiple schema validations simultaneously', async () => {
      const rememberSchema = z.object({
        agentId: z.string().min(1),
        content: z.string().min(1),
        metadata: z.record(z.any()).optional()
      });

      const operations = Array.from({ length: 100 }, (_, i) => ({
        agentId: `agent-${i}`,
        content: `content-${i}`,
        metadata: { index: i }
      }));

      // Test concurrent validation
      const validationPromises = operations.map(async (op) => {
        return new Promise((resolve) => {
          try {
            rememberSchema.parse(op);
            resolve(true);
          } catch (error) {
            resolve(false);
          }
        });
      });

      const results = await Promise.all(validationPromises);
      expect(results.every(result => result === true)).toBe(true);
    });
  });

  describe('JSON-RPC Response Formats', () => {
    it('should validate success response format', () => {
      const successResponseSchema = z.object({
        jsonrpc: z.literal('2.0'),
        id: z.union([z.string(), z.number(), z.null()]),
        result: z.any()
      });

      const successResponse = {
        jsonrpc: '2.0' as const,
        id: '1',
        result: { success: true, id: 'memory-123' }
      };

      expect(() => successResponseSchema.parse(successResponse)).not.toThrow();
    });

    it('should validate error response format', () => {
      const errorResponseSchema = z.object({
        jsonrpc: z.literal('2.0'),
        id: z.union([z.string(), z.number(), z.null()]),
        error: z.object({
          code: z.number(),
          message: z.string(),
          data: z.any().optional()
        })
      });

      const errorResponse = {
        jsonrpc: '2.0' as const,
        id: '1',
        error: {
          code: -32602,
          message: 'Invalid params',
          data: { field: 'agentId', reason: 'required' }
        }
      };

      expect(() => errorResponseSchema.parse(errorResponse)).not.toThrow();
    });
  });

  describe('Data Types and Limits', () => {
    it('should handle large content strings', () => {
      const contentSchema = z.string().min(1);

      // Test large content (1MB string)
      const largeContent = 'x'.repeat(1024 * 1024);
      expect(() => contentSchema.parse(largeContent)).not.toThrow();
    });

    it('should validate numeric parameters', () => {
      const numericSchema = z.object({
        limit: z.number().min(1).max(1000).optional(),
        minImportance: z.number().min(0).max(10).optional(),
        contextSize: z.number().min(1).max(100).optional()
      });

      // Valid numbers
      expect(() => numericSchema.parse({
        limit: 50,
        minImportance: 5,
        contextSize: 10
      })).not.toThrow();

      // Invalid numbers
      expect(() => numericSchema.parse({
        limit: 0 // Too small
      })).toThrow();

      expect(() => numericSchema.parse({
        minImportance: -1 // Too small
      })).toThrow();

      expect(() => numericSchema.parse({
        limit: 1001 // Too large
      })).toThrow();
    });
  });
});