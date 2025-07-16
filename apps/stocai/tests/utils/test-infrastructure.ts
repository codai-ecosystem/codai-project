// STOCAI Test Infrastructure Enhancement
// Enhanced test utilities for production-ready testing

import { vi } from 'vitest'

// Environment setup for consistent testing
export const setupTestEnvironment = () => {
    // Core environment variables
    Object.assign(process.env, {
        NODE_ENV: 'test',
        NEXT_PUBLIC_SUPABASE_URL: 'https://test.supabase.co',
        SUPABASE_SERVICE_ROLE_KEY: 'test-service-role-key',
        AZURE_OPENAI_API_KEY: 'test-azure-key',
        AZURE_OPENAI_ENDPOINT: 'https://test.openai.azure.com',
        AZURE_OPENAI_API_VERSION: '2024-05-01-preview',
        PINECONE_API_KEY: 'test-pinecone-key',
        PINECONE_ENVIRONMENT: 'test-environment',
        PINECONE_INDEX_NAME: 'test-index',
        OPENAI_API_KEY: 'test-openai-key'
    })
}

// Mock factory for Azure OpenAI
export const createAzureOpenAIMock = () => ({
    azureOpenAI: {
        chat: {
            completions: {
                create: vi.fn().mockResolvedValue({
                    choices: [{
                        message: {
                            content: 'Mock AI analysis: This is a comprehensive test response with detailed insights and recommendations.'
                        }
                    }]
                })
            }
        }
    }
})

// Mock factory for Supabase
export const createSupabaseMock = () => ({
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
                    id: 'test-id',
                    name: 'Test Item',
                    description: 'Test description',
                    created_at: new Date().toISOString()
                },
                error: null
            })
        }))
    }))
})

// Mock factory for Pinecone
export const createPineconeMock = () => ({
    Pinecone: vi.fn().mockImplementation(() => ({
        index: vi.fn().mockReturnValue({
            query: vi.fn().mockResolvedValue({
                matches: [
                    {
                        id: 'test-vector-1',
                        score: 0.95,
                        metadata: { text: 'test content' }
                    }
                ]
            }),
            upsert: vi.fn().mockResolvedValue({}),
            delete: vi.fn().mockResolvedValue({})
        })
    }))
})

// Test data generators
export const generateTestDataset = (overrides = {}) => ({
    id: 'test-dataset-1',
    name: 'Test Dataset',
    description: 'A comprehensive test dataset for validation',
    category: 'financial',
    file_count: 5,
    total_size: 1024000,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides
})

export const generateTestVector = (overrides = {}) => ({
    id: 'test-vector-1',
    text: 'Test vector content for validation',
    metadata: {
        source: 'test',
        category: 'financial',
        timestamp: new Date().toISOString()
    },
    ...overrides
})

// Performance measurement utilities
export const measureTestPerformance = (testName: string, fn: () => Promise<any>) => {
    return async () => {
        const start = performance.now()
        const result = await fn()
        const end = performance.now()
        const duration = end - start

        // Log performance metrics
        console.log(`[PERFORMANCE] ${testName}: ${duration.toFixed(2)}ms`)

        // Ensure tests complete within performance thresholds
        if (duration > 5000) {
            console.warn(`[PERFORMANCE WARNING] ${testName} took ${duration.toFixed(2)}ms (>5s)`)
        }

        return result
    }
}

// Test coverage reporting
export const generateCoverageReport = (testSuite: string, passed: number, total: number) => {
    const coverage = (passed / total) * 100
    const status = coverage >= 95 ? '✅ EXCELLENT' : coverage >= 85 ? '🟡 GOOD' : '❌ NEEDS IMPROVEMENT'

    console.log(`[COVERAGE] ${testSuite}: ${passed}/${total} (${coverage.toFixed(1)}%) ${status}`)

    return {
        testSuite,
        passed,
        total,
        coverage,
        status
    }
}

// Enhanced assertion helpers
export const expectValidResponse = (response: any, expectedStatus = 200) => {
    expect(response.status).toBe(expectedStatus)
    expect(response.headers.get('content-type')).toContain('application/json')
}

export const expectValidApiResponse = async (response: Response, expectedStatus = 200) => {
    expectValidResponse(response, expectedStatus)
    const data = await response.json()
    expect(data).toHaveProperty('success')
    return data
}

// Export all utilities
export default {
    setupTestEnvironment,
    createAzureOpenAIMock,
    createSupabaseMock,
    createPineconeMock,
    generateTestDataset,
    generateTestVector,
    measureTestPerformance,
    generateCoverageReport,
    expectValidResponse,
    expectValidApiResponse
}
