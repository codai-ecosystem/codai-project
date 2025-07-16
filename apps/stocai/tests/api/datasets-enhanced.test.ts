import { describe, it, expect, vi } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';

// Set up environment variables before importing
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-role-key';
process.env.AZURE_OPENAI_API_KEY = 'test-azure-key';
process.env.AZURE_OPENAI_ENDPOINT = 'https://test.openai.azure.com';
process.env.AZURE_OPENAI_API_VERSION = '2024-05-01-preview';

// Mock Azure OpenAI with correct path based on the actual import
vi.mock('../../../lib/azure-openai', () => ({
    azureOpenAI: {
        chat: {
            completions: {
                create: vi.fn().mockResolvedValue({
                    choices: [{
                        message: {
                            content: 'Mock AI analysis: Dataset este bine structurat și are potențial pentru analiză. Datele par să fie de calitate și utile pentru procesare.'
                        }
                    }]
                })
            }
        }
    }
}));

// Mock Supabase with comprehensive responses
vi.mock('@supabase/supabase-js', () => ({
    createClient: vi.fn(() => ({
        from: vi.fn(() => ({
            select: vi.fn().mockReturnThis(),
            insert: vi.fn((data) => ({
                select: vi.fn().mockReturnThis(),
                single: vi.fn().mockResolvedValue({
                    data: {
                        id: data.id || 'test-dataset-1',
                        name: data.name || 'Test Dataset',
                        description: data.description || 'Test description',
                        category: data.category || 'financial',
                        file_count: data.file_count || 2,
                        total_size: data.total_size || 1024,
                        created_at: data.created_at || new Date().toISOString(),
                        updated_at: data.updated_at || new Date().toISOString()
                    },
                    error: null
                })
            })),
            update: vi.fn((data) => ({
                eq: vi.fn().mockReturnThis(),
                select: vi.fn().mockReturnThis(),
                single: vi.fn().mockResolvedValue({
                    data: {
                        id: 'test-dataset-1',
                        name: data.name || 'Test Dataset',
                        description: data.description || 'Test description',
                        category: data.category || 'financial',
                        file_count: 2,
                        total_size: 1024,
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString()
                    },
                    error: null
                })
            })),
            delete: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            or: vi.fn().mockReturnThis(),
            order: vi.fn().mockReturnThis(),
            range: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({
                data: {
                    id: 'test-dataset-1',
                    name: 'Test Dataset',
                    description: 'Test description',
                    category: 'financial',
                    file_count: 2,
                    total_size: 1024,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                },
                error: null
            }),
            // Mock successful query response
            then: vi.fn((resolve) => {
                resolve({
                    data: [{
                        id: 'test-dataset-1',
                        name: 'Test Dataset',
                        description: 'Test description',
                        category: 'financial',
                        file_count: 2,
                        total_size: 1024,
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString()
                    }],
                    error: null,
                    count: 1
                });
                return Promise.resolve();
            })
        }))
    }))
}));

describe('Datasets API - Enhanced Tests', () => {
    it('should handle GET request for listing datasets', async () => {
        const { GET } = await import('../../app/api/datasets/route');

        const request = new NextRequest('http://localhost:3000/api/datasets', {
            method: 'GET'
        });

        const response = await GET(request);
        expect(response.status).toBe(200);

        const data = await response.json();
        expect(data.success).toBe(true);
        expect(data.datasets).toBeDefined();
        expect(data.pagination).toBeDefined();
    });

    it('should handle POST request for creating dataset', async () => {
        const { POST } = await import('../../app/api/datasets/route');

        const request = new NextRequest('http://localhost:3000/api/datasets', {
            method: 'POST',
            body: JSON.stringify({
                name: 'New Test Dataset',
                description: 'A new dataset for testing',
                category: 'financial',
                files: [
                    { id: 'file1', name: 'test.csv', size: 1024 },
                    { id: 'file2', name: 'data.json', size: 512 }
                ]
            }),
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const response = await POST(request);
        expect(response.status).toBe(201);

        const data = await response.json();
        expect(data.success).toBe(true);
        expect(data.dataset).toBeDefined();
        expect(data.dataset.name).toBe('New Test Dataset');
    });

    it('should handle PUT request for updating dataset', async () => {
        const { PUT } = await import('../../app/api/datasets/route');

        const request = new NextRequest('http://localhost:3000/api/datasets', {
            method: 'PUT',
            body: JSON.stringify({
                id: 'test-dataset-1',
                name: 'Updated Test Dataset',
                description: 'Updated description',
                category: 'updated'
            }),
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const response = await PUT(request);
        expect(response.status).toBe(200);

        const data = await response.json();
        expect(data.success).toBe(true);
        expect(data.dataset).toBeDefined();
    });

    it('should handle DELETE request for removing dataset', async () => {
        const { DELETE } = await import('../../app/api/datasets/route');

        const request = new NextRequest('http://localhost:3000/api/datasets?id=test-dataset-1', {
            method: 'DELETE'
        });

        const response = await DELETE(request);
        expect(response.status).toBe(200);

        const data = await response.json();
        expect(data.success).toBe(true);
        expect(data.message).toBe('Dataset deleted successfully');
    });

    it('should handle validation errors', async () => {
        const { POST } = await import('../../app/api/datasets/route');

        const request = new NextRequest('http://localhost:3000/api/datasets', {
            method: 'POST',
            body: JSON.stringify({}), // Missing required name field
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const response = await POST(request);
        expect(response.status).toBe(400);

        const data = await response.json();
        expect(data.success).toBe(false);
        expect(data.error).toBe('Name is required');
    });
});
