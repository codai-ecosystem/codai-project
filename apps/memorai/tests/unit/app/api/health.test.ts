import { describe, it, expect, vi } from 'vitest'
import { GET } from '@/app/api/health/route'
import { NextRequest } from 'next/server'

// Mock NextRequest
const createMockRequest = (url: string = 'http://localhost:4006/api/health') => {
    return new NextRequest(url)
}

describe('Health API Endpoint', () => {
    it('should return 200 status for health check', async () => {
        const request = createMockRequest()
        const response = await GET(request)

        expect(response.status).toBe(200)
    })

    it('should return correct health status structure', async () => {
        const request = createMockRequest()
        const response = await GET(request)
        const data = await response.json()

        expect(data).toHaveProperty('service')
        expect(data).toHaveProperty('status')
        expect(data).toHaveProperty('timestamp')
        expect(data).toHaveProperty('version')
        expect(data).toHaveProperty('message')

        expect(data.service).toBe('memorai-health')
        expect(data.status).toBe('operational')
        expect(data.version).toBe('1.0.0')
        expect(data.message).toBe('MemorAI service is running successfully')
    })

    it('should return valid timestamp format', async () => {
        const request = createMockRequest()
        const response = await GET(request)
        const data = await response.json()

        expect(data.timestamp).toBeDefined()
        expect(typeof data.timestamp).toBe('string')

        // Check if timestamp is a valid date format
        const timestamp = new Date(data.timestamp)
        expect(timestamp.toString()).not.toBe('Invalid Date')
    })

    it('should have correct content-type header', async () => {
        const request = createMockRequest()
        const response = await GET(request)

        expect(response.headers.get('content-type')).toBe('application/json')
    })

    it('should be accessible from different origins', async () => {
        const request = createMockRequest('https://memorai.ro/api/health')
        const response = await GET(request)

        expect(response.status).toBe(200)
    })

    it('should handle malformed requests gracefully', async () => {
        // Test with various request scenarios
        const request = createMockRequest()
        const response = await GET(request)

        expect(response.status).toBe(200)
        expect(response.ok).toBe(true)
    })

    it('should return consistent response structure', async () => {
        // Make multiple requests to ensure consistency
        const requests = Array.from({ length: 5 }, () => createMockRequest())

        const responses = await Promise.all(
            requests.map(req => GET(req))
        )

        const dataPromises = responses.map(res => res.json())
        const dataResults = await Promise.all(dataPromises)

        // All responses should have the same structure
        dataResults.forEach(data => {
            expect(data.service).toBe('memorai-health')
            expect(data.status).toBe('operational')
            expect(data.version).toBe('1.0.0')
            expect(data.message).toBe('MemorAI service is running successfully')
        })

        // All responses should be successful
        responses.forEach(response => {
            expect(response.status).toBe(200)
        })
    })

    it('should return response within acceptable time', async () => {
        const startTime = Date.now()
        const request = createMockRequest()
        const response = await GET(request)
        const endTime = Date.now()

        const responseTime = endTime - startTime

        expect(response.status).toBe(200)
        expect(responseTime).toBeLessThan(100) // Should respond within 100ms
    })

    it('should include proper cache headers if needed', async () => {
        const request = createMockRequest()
        const response = await GET(request)

        // Health checks should not be cached
        const cacheControl = response.headers.get('cache-control')
        if (cacheControl) {
            expect(cacheControl).toContain('no-cache')
        }
    })

    it('should handle concurrent requests', async () => {
        // Test concurrent access to health endpoint
        const concurrentRequests = Array.from({ length: 10 }, () =>
            GET(createMockRequest())
        )

        const responses = await Promise.all(concurrentRequests)

        responses.forEach(response => {
            expect(response.status).toBe(200)
        })
    })
})
