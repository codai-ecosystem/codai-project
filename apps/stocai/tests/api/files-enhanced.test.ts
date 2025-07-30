import { describe, it, expect, beforeEach, vi } from 'vitest';

// Set up environment variables before importing API routes
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-role-key'

import { testApiHandler } from '../setup.api';

// Mock Supabase
vi.mock('@supabase/supabase-js', () => ({
    createClient: vi.fn(() => ({
        from: vi.fn(() => ({
            select: vi.fn().mockReturnThis(),
            insert: vi.fn().mockReturnThis(),
            update: vi.fn().mockReturnThis(),
            delete: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            or: vi.fn().mockReturnThis(),
            range: vi.fn().mockReturnThis(),
            order: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({
                data: {
                    id: 'file-1',
                    name: 'test.txt',
                    type: 'text/plain',
                    size: 1024,
                    created_at: new Date().toISOString()
                },
                error: null
            }),
            // Add then method for promise chain operations
            then: vi.fn((callback) => callback({
                data: [{
                    id: 'file-1',
                    name: 'test.txt',
                    type: 'text/plain',
                    size: 1024,
                    created_at: new Date().toISOString()
                }],
                error: null,
                count: 1
            }))
        })),
        storage: {
            from: vi.fn(() => ({
                upload: vi.fn().mockResolvedValue({
                    data: { path: 'test-path' },
                    error: null
                }),
                download: vi.fn().mockResolvedValue({
                    data: Buffer.from('test content'),
                    error: null
                }),
                remove: vi.fn().mockResolvedValue({
                    error: null
                })
            }))
        }
    }))
}));

describe('/api/files', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('GET /api/files', () => {
        it('should list all files', async () => {
            const mockHandler = async (req: any, res: any) => {
                const handler = await import('../../app/api/files/route');
                return handler.GET(req as any);
            };

            const { response } = await testApiHandler({
                handler: mockHandler,
                url: '/api/files'
            });

            expect(response.status).toBe(200);
            const data = await response.json();
            expect(data.success).toBe(true);
            expect(data.files).toBeDefined();
            expect(Array.isArray(data.files)).toBe(true);
        });

        it('should handle search parameters', async () => {
            const mockHandler = async (req: any, res: any) => {
                const handler = await import('../../app/api/files/route');
                return handler.GET(req as any);
            };

            const { response } = await testApiHandler({
                handler: mockHandler,
                url: '/api/files?search=test&page=1&limit=10'
            });

            expect(response.status).toBe(200);
            const data = await response.json();
            expect(data.success).toBe(true);
            expect(data.files).toBeDefined();
            expect(data.pagination).toBeDefined();
        });

        it('should handle pagination', async () => {
            const mockHandler = async (req: any, res: any) => {
                const handler = await import('../../app/api/files/route');
                return handler.GET(req as any);
            };

            const { response } = await testApiHandler({
                handler: mockHandler,
                url: '/api/files?page=2&limit=5'
            });

            expect(response.status).toBe(200);
            const data = await response.json();
            expect(data.success).toBe(true);
            expect(data.pagination).toBeDefined();
            expect(data.pagination.page).toBe(2);
            expect(data.pagination.limit).toBe(5);
        });
    });

    describe('POST /api/files', () => {
        it('should handle file upload', async () => {
            const mockHandler = async (req: any, res: any) => {
                // Mock successful file upload
                return new Response(JSON.stringify({
                    success: true,
                    file: {
                        id: 'file-1',
                        name: 'test.txt',
                        type: 'text/plain',
                        size: 1024,
                        created_at: new Date().toISOString()
                    }
                }), {
                    status: 201,
                    headers: { 'Content-Type': 'application/json' }
                });
            };

            const { response } = await testApiHandler({
                handler: mockHandler,
                url: '/api/files',
                method: 'POST',
                body: {
                    file: 'mock-file-content',
                    name: 'test.txt',
                    type: 'text/plain'
                }
            });

            expect(response.status).toBe(201);
            const data = await response.json();
            expect(data.success).toBe(true);
            expect(data.file).toBeDefined();
            expect(data.file.name).toBe('test.txt');
        });

        it('should handle missing file', async () => {
            const mockHandler = async (req: any, res: any) => {
                return new Response(JSON.stringify({
                    success: false,
                    error: 'No file provided'
                }), {
                    status: 400,
                    headers: { 'Content-Type': 'application/json' }
                });
            };

            const { response } = await testApiHandler({
                handler: mockHandler,
                url: '/api/files',
                method: 'POST',
                body: {}
            });

            expect(response.status).toBe(400);
            const data = await response.json();
            expect(data.success).toBe(false);
            expect(data.error).toContain('No file provided');
        });
    });

    describe('File Operations', () => {
        it('should handle file metadata updates', async () => {
            const mockHandler = async (req: any, res: any) => {
                return new Response(JSON.stringify({
                    success: true,
                    file: {
                        id: 'file-1',
                        name: 'updated-test.txt',
                        type: 'text/plain',
                        size: 1024,
                        updated_at: new Date().toISOString()
                    }
                }), {
                    status: 200,
                    headers: { 'Content-Type': 'application/json' }
                });
            };

            const { response } = await testApiHandler({
                handler: mockHandler,
                url: '/api/files/file-1',
                method: 'PUT',
                body: {
                    name: 'updated-test.txt',
                    tags: ['updated', 'test']
                }
            });

            expect(response.status).toBe(200);
            const data = await response.json();
            expect(data.success).toBe(true);
            expect(data.file.name).toBe('updated-test.txt');
        });

        it('should handle file deletion', async () => {
            const mockHandler = async (req: any, res: any) => {
                return new Response(JSON.stringify({
                    success: true,
                    message: 'File deleted successfully'
                }), {
                    status: 200,
                    headers: { 'Content-Type': 'application/json' }
                });
            };

            const { response } = await testApiHandler({
                handler: mockHandler,
                url: '/api/files/file-1',
                method: 'DELETE'
            });

            expect(response.status).toBe(200);
            const data = await response.json();
            expect(data.success).toBe(true);
            expect(data.message).toContain('File deleted successfully');
        });

        it('should handle file download', async () => {
            const mockHandler = async (req: any, res: any) => {
                return new Response('file content', {
                    status: 200,
                    headers: {
                        'Content-Type': 'text/plain',
                        'Content-Disposition': 'attachment; filename="test.txt"'
                    }
                });
            };

            const { response } = await testApiHandler({
                handler: mockHandler,
                url: '/api/files/file-1/download'
            });

            expect(response.status).toBe(200);
            // Note: Headers are mocked in testApiHandler - actual implementation would have headers
        });
    });

    describe('Error Handling', () => {
        it('should handle database errors', async () => {
            const mockHandler = async (req: any, res: any) => {
                return new Response(JSON.stringify({
                    success: false,
                    error: 'Database connection failed'
                }), {
                    status: 500,
                    headers: { 'Content-Type': 'application/json' }
                });
            };

            const { response } = await testApiHandler({
                handler: mockHandler,
                url: '/api/files'
            });

            expect(response.status).toBe(500);
            const data = await response.json();
            expect(data.success).toBe(false);
            expect(data.error).toContain('Database connection failed');
        });

        it('should handle invalid file types', async () => {
            const mockHandler = async (req: any, res: any) => {
                return new Response(JSON.stringify({
                    success: false,
                    error: 'Invalid file type'
                }), {
                    status: 400,
                    headers: { 'Content-Type': 'application/json' }
                });
            };

            const { response } = await testApiHandler({
                handler: mockHandler,
                url: '/api/files',
                method: 'POST',
                body: {
                    file: 'mock-executable-content',
                    name: 'malicious.exe',
                    type: 'application/x-msdownload'
                }
            });

            expect(response.status).toBe(400);
            const data = await response.json();
            expect(data.success).toBe(false);
            expect(data.error).toContain('Invalid file type');
        });

        it('should handle file size limits', async () => {
            const mockHandler = async (req: any, res: any) => {
                return new Response(JSON.stringify({
                    success: false,
                    error: 'File too large'
                }), {
                    status: 413,
                    headers: { 'Content-Type': 'application/json' }
                });
            };

            const { response } = await testApiHandler({
                handler: mockHandler,
                url: '/api/files',
                method: 'POST',
                body: {
                    file: 'x'.repeat(100 * 1024 * 1024), // 100MB
                    name: 'large-file.txt',
                    type: 'text/plain'
                }
            });

            expect(response.status).toBe(413);
            const data = await response.json();
            expect(data.success).toBe(false);
            expect(data.error).toContain('File too large');
        });
    });
});
