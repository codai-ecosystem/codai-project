import { describe, it, expect, beforeEach, vi } from 'vitest';
import { testApiHandler } from '../setup';
import type { NextApiRequest, NextApiResponse } from 'next';

// Mock Pinecone
vi.mock('@pinecone-database/pinecone', () => ({
  Pinecone: vi.fn().mockImplementation(() => ({
    index: vi.fn().mockReturnValue({
      upsert: vi.fn().mockResolvedValue({ upsertedCount: 1 }),
      query: vi.fn().mockResolvedValue({
        matches: [
          {
            id: 'vector-1',
            score: 0.95,
            metadata: { text: 'Sample text', category: 'document' }
          }
        ]
      }),
      deleteOne: vi.fn().mockResolvedValue({}),
      fetch: vi.fn().mockResolvedValue({
        vectors: {
          'vector-1': {
            id: 'vector-1',
            values: [0.1, 0.2, 0.3],
            metadata: { text: 'Sample text' }
          }
        }
      })
    })
  }))
}));

// Mock OpenAI
vi.mock('openai', () => ({
  default: vi.fn().mockImplementation(() => ({
    embeddings: {
      create: vi.fn().mockResolvedValue({
        data: [{ embedding: Array.from({ length: 1536 }, () => Math.random()) }]
      })
    }
  }))
}));

describe('/api/vectors', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/vectors', () => {
    it('should search vectors by query', async () => {
      const mockHandler = async (req: NextApiRequest, res: NextApiResponse) => {
        // Import the actual handler
        const handler = await import('../../app/api/vectors/route');
        return handler.GET(req as any);
      };

      const { response } = await testApiHandler({
        handler: mockHandler,
        url: '/api/vectors?query=test search&limit=5'
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.vectors).toBeDefined();
      expect(Array.isArray(data.vectors)).toBe(true);
    });

    it('should get vector by ID', async () => {
      const mockHandler = async (req: NextApiRequest, res: NextApiResponse) => {
        const handler = await import('../../app/api/vectors/route');
        return handler.GET(req as any);
      };

      const { response } = await testApiHandler({
        handler: mockHandler,
        url: '/api/vectors?id=vector-1'
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.vector).toBeDefined();
      expect(data.vector.id).toBe('vector-1');
    });

    it('should handle search without query parameter', async () => {
      const mockHandler = async (req: NextApiRequest, res: NextApiResponse) => {
        const handler = await import('../../app/api/vectors/route');
        return handler.GET(req as any);
      };

      const { response } = await testApiHandler({
        handler: mockHandler,
        url: '/api/vectors'
      });

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error).toContain('Query or ID parameter required');
    });
  });

  describe('POST /api/vectors', () => {
    it('should create a new vector', async () => {
      const mockHandler = async (req: NextApiRequest, res: NextApiResponse) => {
        const handler = await import('../../app/api/vectors/route');
        return handler.POST(req as any);
      };

      const vectorData = {
        text: 'This is a test document for vector creation',
        metadata: {
          title: 'Test Document',
          category: 'test',
          source: 'unit-test'
        }
      };

      const { response } = await testApiHandler({
        handler: mockHandler,
        url: '/api/vectors',
        method: 'POST',
        body: vectorData
      });

      expect(response.status).toBe(201);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.vector).toBeDefined();
      expect(data.vector.id).toBeDefined();
      expect(data.vector.metadata.title).toBe(vectorData.metadata.title);
    });

    it('should require text parameter', async () => {
      const mockHandler = async (req: NextApiRequest, res: NextApiResponse) => {
        const handler = await import('../../app/api/vectors/route');
        return handler.POST(req as any);
      };

      const { response } = await testApiHandler({
        handler: mockHandler,
        url: '/api/vectors',
        method: 'POST',
        body: { metadata: { title: 'Test' } }
      });

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error).toContain('Text is required');
    });

    it('should handle embedding generation failure', async () => {
      // Mock OpenAI to throw an error
      const { default: OpenAI } = await import('openai');
      const mockOpenAI = OpenAI as any;
      mockOpenAI.mockImplementationOnce(() => ({
        embeddings: {
          create: vi.fn().mockRejectedValue(new Error('API Error'))
        }
      }));

      const mockHandler = async (req: NextApiRequest, res: NextApiResponse) => {
        const handler = await import('../../app/api/vectors/route');
        return handler.POST(req as any);
      };

      const { response } = await testApiHandler({
        handler: mockHandler,
        url: '/api/vectors',
        method: 'POST',
        body: { text: 'Test text' }
      });

      expect(response.status).toBe(500);
      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error).toContain('Failed to create vector');
    });
  });

  describe('DELETE /api/vectors', () => {
    it('should delete a vector by ID', async () => {
      const mockHandler = async (req: NextApiRequest, res: NextApiResponse) => {
        const handler = await import('../../app/api/vectors/route');
        return handler.DELETE(req as any);
      };

      const { response } = await testApiHandler({
        handler: mockHandler,
        url: '/api/vectors?id=vector-1',
        method: 'DELETE'
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.message).toContain('Vector deleted successfully');
    });

    it('should require ID parameter for deletion', async () => {
      const mockHandler = async (req: NextApiRequest, res: NextApiResponse) => {
        const handler = await import('../../app/api/vectors/route');
        return handler.DELETE(req as any);
      };

      const { response } = await testApiHandler({
        handler: mockHandler,
        url: '/api/vectors',
        method: 'DELETE'
      });

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error).toContain('Vector ID is required');
    });

    it('should handle Pinecone deletion failure', async () => {
      // Mock Pinecone to throw an error
      const { Pinecone } = await import('@pinecone-database/pinecone');
      const mockPinecone = Pinecone as any;
      mockPinecone.mockImplementationOnce(() => ({
        index: vi.fn().mockReturnValue({
          deleteOne: vi.fn().mockRejectedValue(new Error('Pinecone Error'))
        })
      }));

      const mockHandler = async (req: NextApiRequest, res: NextApiResponse) => {
        const handler = await import('../../app/api/vectors/route');
        return handler.DELETE(req as any);
      };

      const { response } = await testApiHandler({
        handler: mockHandler,
        url: '/api/vectors?id=vector-1',
        method: 'DELETE'
      });

      expect(response.status).toBe(500);
      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error).toContain('Failed to delete vector');
    });
  });

  describe('Similarity Search', () => {
    it('should perform similarity search with custom threshold', async () => {
      const mockHandler = async (req: NextApiRequest, res: NextApiResponse) => {
        const handler = await import('../../app/api/vectors/route');
        return handler.GET(req as any);
      };

      const { response } = await testApiHandler({
        handler: mockHandler,
        url: '/api/vectors?query=test&threshold=0.8&limit=10'
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.vectors).toBeDefined();
    });

    it('should filter results by metadata', async () => {
      const mockHandler = async (req: NextApiRequest, res: NextApiResponse) => {
        const handler = await import('../../app/api/vectors/route');
        return handler.GET(req as any);
      };

      const { response } = await testApiHandler({
        handler: mockHandler,
        url: '/api/vectors?query=test&category=document&source=upload'
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
    });
  });

  describe('Batch Operations', () => {
    it('should handle batch vector creation', async () => {
      const mockHandler = async (req: NextApiRequest, res: NextApiResponse) => {
        const handler = await import('../../app/api/vectors/route');
        return handler.POST(req as any);
      };

      const batchData = {
        batch: true,
        vectors: [
          { text: 'Document 1', metadata: { title: 'Doc 1' } },
          { text: 'Document 2', metadata: { title: 'Doc 2' } }
        ]
      };

      const { response } = await testApiHandler({
        handler: mockHandler,
        url: '/api/vectors',
        method: 'POST',
        body: batchData
      });

      expect(response.status).toBe(201);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.vectors).toBeDefined();
      expect(Array.isArray(data.vectors)).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('should handle unsupported HTTP methods', async () => {
      const mockHandler = async (req: NextApiRequest, res: NextApiResponse) => {
        const handler = await import('../../app/api/vectors/route');
        // @ts-ignore - Testing unsupported method
        return handler.PATCH?.(req as any) || new Response('Method not allowed', { status: 405 });
      };

      const { response } = await testApiHandler({
        handler: mockHandler,
        url: '/api/vectors',
        method: 'PATCH'
      });

      expect(response.status).toBe(405);
    });

    it('should handle malformed request body', async () => {
      const mockHandler = async (req: NextApiRequest, res: NextApiResponse) => {
        const handler = await import('../../app/api/vectors/route');
        return handler.POST(req as any);
      };

      const { response } = await testApiHandler({
        handler: mockHandler,
        url: '/api/vectors',
        method: 'POST',
        body: 'invalid json'
      });

      expect(response.status).toBe(400);
    });
  });
});
