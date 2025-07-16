import { describe, it, expect, vi } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';

// Set up environment variables before importing
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-role-key';
process.env.AZURE_OPENAI_API_KEY = 'test-azure-key';
process.env.AZURE_OPENAI_ENDPOINT = 'https://test.openai.azure.com';
process.env.AZURE_OPENAI_API_VERSION = '2024-05-01-preview';

// Mock the entire path resolution for aliases
vi.mock('@/lib/azure-openai', () => ({
    azureOpenAI: {
        chat: {
            completions: {
                create: vi.fn().mockResolvedValue({
                    choices: [{
                        message: {
                            content: 'Mock AI analysis for testing'
                        }
                    }]
                })
            }
        }
    }
}));

// Mock Supabase with simplified responses
vi.mock('@supabase/supabase-js', () => ({
    createClient: vi.fn(() => ({
        from: vi.fn(() => ({
            select: vi.fn().mockReturnThis(),
            insert: vi.fn().mockReturnThis(),
            update: vi.fn().mockReturnThis(),
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
                    created_at: new Date().toISOString()
                },
                error: null
            }),
            // Mock the promise resolution for listing datasets
            then: vi.fn((resolve) => {
                resolve({
                    data: [{
                        id: 'test-dataset-1',
                        name: 'Test Dataset',
                        description: 'Test description',
                        created_at: new Date().toISOString()
                    }],
                    error: null,
                    count: 1
                });
                return Promise.resolve();
            })
        }))
    }))
}));

describe('Datasets API - Debug Test', () => {
    it('should import the API route without errors', async () => {
        try {
            const { GET } = await import('../../app/api/datasets/route');
            expect(GET).toBeDefined();
            expect(typeof GET).toBe('function');
        } catch (error) {
            console.error('Import error:', error);
            throw error;
        }
    });

    it('should handle simple GET request', async () => {
        try {
            const { GET } = await import('../../app/api/datasets/route');

            const request = new NextRequest('http://localhost:3000/api/datasets', {
                method: 'GET'
            });

            const response = await GET(request);
            expect(response).toBeInstanceOf(Response);
            console.log('Response status:', response.status);

            if (response.status !== 200) {
                const text = await response.text();
                console.log('Response text:', text);
            }
        } catch (error) {
            console.error('Test error:', error);
            throw error;
        }
    });
});
