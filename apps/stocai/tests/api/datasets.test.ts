import { describe, it, expect, beforeEach, vi } from 'vitest';

// Set up environment variables before importing API routes
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-role-key'

import { testApiHandler } from '../setup.api';

// Mock Supabase
vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => {
    let capturedData: any = null;
    
    return {
      from: vi.fn(() => ({
        select: vi.fn().mockReturnThis(),
        insert: vi.fn((data) => {
          capturedData = Array.isArray(data) ? data[0] : data;
          return {
            select: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({
              data: {
                id: 'dataset-1',
                ...capturedData,
                created_at: new Date().toISOString()
              },
              error: null
            })
          };
        }),
        update: vi.fn((data) => {
          capturedData = data;
          return {
            eq: vi.fn().mockReturnThis(),
            select: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({
              data: {
                id: 'dataset-1',
                name: 'Test Dataset',
                ...capturedData,
                updated_at: new Date().toISOString()
              },
              error: null
            })
          };
        }),
        delete: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        or: vi.fn().mockReturnThis(),
        ilike: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        range: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: {
            id: 'dataset-1',
            name: 'Test Dataset',
            description: 'Test dataset description',
            files: [],
            created_at: new Date().toISOString()
          },
          error: null
        }),
        // Add then method for promise chain operations
        then: vi.fn((callback) => callback({
          data: [{
            id: 'dataset-1',
            name: 'Test Dataset',
            description: 'Test dataset description',
            files: [],
            created_at: new Date().toISOString()
          }],
          error: null,
          count: 1
        }))
      }))
    };
  })
}));

// Mock OpenAI
vi.mock('openai', () => ({
  default: vi.fn().mockImplementation(() => ({
    chat: {
      completions: {
        create: vi.fn().mockResolvedValue({
          choices: [{
            message: {
              content: JSON.stringify({
                summary: 'Test dataset summary',
                keywords: ['test', 'dataset', 'sample'],
                categories: ['testing', 'data']
              })
            }
          }]
        })
      }
    }
  }))
}));

describe('/api/datasets', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/datasets', () => {
    it('should list all datasets', async () => {
      const mockHandler = async (req: any, res: any) => {
        const handler = await import('../../app/api/datasets/route');
        return handler.GET(req as any);
      };

      const { response } = await testApiHandler({
        handler: mockHandler,
        url: '/api/datasets'
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.datasets).toBeDefined();
      expect(Array.isArray(data.datasets)).toBe(true);
    });

    it('should get dataset by ID', async () => {
      const mockHandler = async (req: any, res: any) => {
        const handler = await import('../../app/api/datasets/route');
        return handler.GET(req as any);
      };

      const { response } = await testApiHandler({
        handler: mockHandler,
        url: '/api/datasets?id=dataset-1'
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.dataset).toBeDefined();
      expect(data.dataset.id).toBe('dataset-1');
    });

    it('should search datasets by name', async () => {
      const mockHandler = async (req: any, res: any) => {
        const handler = await import('../../app/api/datasets/route');
        return handler.GET(req as any);
      };

      const { response } = await testApiHandler({
        handler: mockHandler,
        url: '/api/datasets?search=test&limit=10'
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.datasets).toBeDefined();
    });

    it('should handle pagination', async () => {
      const mockHandler = async (req: any, res: any) => {
        const handler = await import('../../app/api/datasets/route');
        return handler.GET(req as any);
      };

      const { response } = await testApiHandler({
        handler: mockHandler,
        url: '/api/datasets?page=2&limit=5'
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.datasets).toBeDefined();
      expect(data.pagination).toBeDefined();
    });
  });

  describe('POST /api/datasets', () => {
    it('should create a new dataset', async () => {
      const mockHandler = async (req: any, res: any) => {
        const handler = await import('../../app/api/datasets/route');
        return handler.POST(req as any);
      };

      const datasetData = {
        name: 'New Test Dataset',
        description: 'A comprehensive test dataset for validation',
        tags: ['test', 'validation'],
        privacy: 'private'
      };

      const { response } = await testApiHandler({
        handler: mockHandler,
        url: '/api/datasets',
        method: 'POST',
        body: datasetData
      });

      expect(response.status).toBe(201);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.dataset).toBeDefined();
      expect(data.dataset.name).toBe(datasetData.name);
      expect(data.aiAnalysis).toBeDefined();
    });

    it('should require name parameter', async () => {
      const mockHandler = async (req: any, res: any) => {
        const handler = await import('../../app/api/datasets/route');
        return handler.POST(req as any);
      };

      const { response } = await testApiHandler({
        handler: mockHandler,
        url: '/api/datasets',
        method: 'POST',
        body: { description: 'Dataset without name' }
      });

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error).toContain('Name is required');
    });

    it('should handle AI analysis failure gracefully', async () => {
      // Mock OpenAI to throw an error
      const { default: OpenAI } = await import('openai');
      const mockOpenAI = OpenAI as any;
      mockOpenAI.mockImplementationOnce(() => ({
        chat: {
          completions: {
            create: vi.fn().mockRejectedValue(new Error('AI Service Error'))
          }
        }
      }));

      const mockHandler = async (req: any, res: any) => {
        const handler = await import('../../app/api/datasets/route');
        return handler.POST(req as any);
      };

      const { response } = await testApiHandler({
        handler: mockHandler,
        url: '/api/datasets',
        method: 'POST',
        body: { name: 'Test Dataset', description: 'Test description' }
      });

      expect(response.status).toBe(201);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.dataset).toBeDefined();
      // Should still create dataset even if AI analysis fails
    });
  });

  describe('PUT /api/datasets', () => {
    it('should update an existing dataset', async () => {
      const mockHandler = async (req: any, res: any) => {
        const handler = await import('../../app/api/datasets/route');
        return handler.PUT(req as any);
      };

      const updateData = {
        id: 'dataset-1',
        name: 'Updated Dataset Name',
        description: 'Updated description with new content',
        tags: ['updated', 'modified']
      };

      const { response } = await testApiHandler({
        handler: mockHandler,
        url: '/api/datasets',
        method: 'PUT',
        body: updateData
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.dataset).toBeDefined();
      expect(data.dataset.name).toBe(updateData.name);
      expect(data.aiAnalysis).toBeDefined();
    });

    it('should require ID for update', async () => {
      const mockHandler = async (req: any, res: any) => {
        const handler = await import('../../app/api/datasets/route');
        return handler.PUT(req as any);
      };

      const { response } = await testApiHandler({
        handler: mockHandler,
        url: '/api/datasets',
        method: 'PUT',
        body: { name: 'Updated Name' }
      });

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error).toContain('Dataset ID is required');
    });
  });

  describe('DELETE /api/datasets', () => {
    it('should delete a dataset', async () => {
      const mockHandler = async (req: any, res: any) => {
        const handler = await import('../../app/api/datasets/route');
        return handler.DELETE(req as any);
      };

      const { response } = await testApiHandler({
        handler: mockHandler,
        url: '/api/datasets?id=dataset-1',
        method: 'DELETE'
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.message).toContain('Dataset deleted successfully');
    });

    it('should require ID for deletion', async () => {
      const mockHandler = async (req: any, res: any) => {
        const handler = await import('../../app/api/datasets/route');
        return handler.DELETE(req as any);
      };

      const { response } = await testApiHandler({
        handler: mockHandler,
        url: '/api/datasets',
        method: 'DELETE'
      });

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error).toContain('Dataset ID is required');
    });
  });

  describe('Batch Operations', () => {
    it('should handle batch dataset creation', async () => {
      const mockHandler = async (req: any, res: any) => {
        const handler = await import('../../app/api/datasets/route');
        return handler.POST(req as any);
      };

      const batchData = {
        batch: true,
        datasets: [
          { name: 'Dataset 1', description: 'First dataset' },
          { name: 'Dataset 2', description: 'Second dataset' }
        ]
      };

      const { response } = await testApiHandler({
        handler: mockHandler,
        url: '/api/datasets',
        method: 'POST',
        body: batchData
      });

      expect(response.status).toBe(201);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.datasets).toBeDefined();
      expect(Array.isArray(data.datasets)).toBe(true);
    });

    it('should handle file association', async () => {
      const mockHandler = async (req: any, res: any) => {
        const handler = await import('../../app/api/datasets/route');
        return handler.POST(req as any);
      };

      const datasetWithFiles = {
        name: 'Dataset with Files',
        description: 'Dataset with associated files',
        fileIds: ['file-1', 'file-2', 'file-3']
      };

      const { response } = await testApiHandler({
        handler: mockHandler,
        url: '/api/datasets',
        method: 'POST',
        body: datasetWithFiles
      });

      expect(response.status).toBe(201);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.dataset).toBeDefined();
    });
  });

  describe('Analytics & Insights', () => {
    it('should provide dataset analytics', async () => {
      const mockHandler = async (req: any, res: any) => {
        const handler = await import('../../app/api/datasets/route');
        return handler.GET(req as any);
      };

      const { response } = await testApiHandler({
        handler: mockHandler,
        url: '/api/datasets?id=dataset-1&analytics=true'
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.dataset).toBeDefined();
      expect(data.analytics).toBeDefined();
    });

    it('should handle category filtering', async () => {
      const mockHandler = async (req: any, res: any) => {
        const handler = await import('../../app/api/datasets/route');
        return handler.GET(req as any);
      };

      const { response } = await testApiHandler({
        handler: mockHandler,
        url: '/api/datasets?category=machine-learning&privacy=public'
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.datasets).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    it('should handle database errors gracefully', async () => {
      // Mock Supabase to throw an error
      const { createClient } = await import('@supabase/supabase-js');
      const mockCreateClient = createClient as any;
      mockCreateClient.mockImplementationOnce(() => ({
        from: vi.fn(() => ({
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockRejectedValue(new Error('Database Error'))
        }))
      }));

      const mockHandler = async (req: any, res: any) => {
        const handler = await import('../../app/api/datasets/route');
        return handler.GET(req as any);
      };

      const { response } = await testApiHandler({
        handler: mockHandler,
        url: '/api/datasets?id=dataset-1'
      });

      expect(response.status).toBe(500);
      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error).toContain('Failed to retrieve dataset');
    });

    it('should handle malformed request data', async () => {
      const mockHandler = async (req: any, res: any) => {
        const handler = await import('../../app/api/datasets/route');
        return handler.POST(req as any);
      };

      const { response } = await testApiHandler({
        handler: mockHandler,
        url: '/api/datasets',
        method: 'POST',
        body: 'invalid json string'
      });

      expect(response.status).toBe(400);
    });
  });
});
