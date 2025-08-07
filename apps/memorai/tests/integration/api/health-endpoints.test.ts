/**
 * Health API Integration Tests
 * Tests the health check API endpoint with real HTTP requests
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { createTestApp, sleep } from '../../helpers/app'

describe('Health API Integration Tests', () => {
    const app = createTestApp()
    const healthEndpoint = '/api/health'

    beforeAll(async () => {
        // Ensure the server is ready
        await sleep(1000)
    })

    afterAll(async () => {
        // Cleanup if needed
    })

    describe('GET /api/health', () => {
        it('should return 200 status code', async () => {
            const response = await app.request(healthEndpoint)
            expect(response.status).toBe(200)
        })

        it('should return correct health check structure', async () => {
            const response = await app.request(healthEndpoint)
            const data = await response.json()

            expect(data).toMatchObject({
                service: 'MemorAI Service',
                status: 'operational',
                version: '1.0.0'
            })

            expect(data).toHaveProperty('timestamp')
            expect(typeof data.timestamp).toBe('string')
        })

        it('should have proper content-type header', async () => {
            const response = await app.request(healthEndpoint)
            const contentType = response.headers.get('content-type')

            expect(contentType).toContain('application/json')
        })

        it('should respond within acceptable time', async () => {
            const startTime = Date.now()
            const response = await app.request(healthEndpoint)
            const endTime = Date.now()

            expect(response.status).toBe(200)
            expect(endTime - startTime).toBeLessThan(1000) // Should respond within 1 second
        })

        it('should handle concurrent requests correctly', async () => {
            const requests = Array.from({ length: 5 }, () =>
                app.request(healthEndpoint)
            )

            const responses = await Promise.all(requests)

            responses.forEach((response: Response) => {
                expect(response.status).toBe(200)
            })
        })

        it('should include system information', async () => {
            const response = await app.request(healthEndpoint)
            const data = await response.json()

            expect(data.service).toBe('MemorAI Service')
            expect(data.status).toBe('operational')
            expect(data.version).toBe('1.0.0')
            expect(typeof data.timestamp).toBe('string')

            // Verify timestamp format (ISO string)
            expect(() => new Date(data.timestamp).toISOString()).not.toThrow()
        })

        it('should be consistent across multiple calls', async () => {
            const response1 = await app.request(healthEndpoint)
            const response2 = await app.request(healthEndpoint)

            const data1 = await response1.json()
            const data2 = await response2.json()

            expect(data1.service).toBe(data2.service)
            expect(data1.status).toBe(data2.status)
            expect(data1.version).toBe(data2.version)

            // Timestamps should be different (but close)
            expect(data1.timestamp).not.toBe(data2.timestamp)
        })

        it('should handle CORS preflight requests', async () => {
            const response = await app.request(healthEndpoint, {
                method: 'OPTIONS',
                headers: {
                    'Origin': 'https://memorai.ro',
                    'Access-Control-Request-Method': 'GET'
                }
            })

            // Should allow the request or return 200/204
            expect([200, 204, 404].includes(response.status)).toBe(true)
        })
    })

    describe('Error Handling', () => {
        it('should return 404 for non-existent health endpoints', async () => {
            const response = await app.request('/api/health/invalid')
            expect(response.status).toBe(404)
        })

        it('should handle invalid HTTP methods gracefully', async () => {
            const response = await app.request(healthEndpoint, {
                method: 'POST'
            })

            // Should return method not allowed or handle gracefully
            expect([405, 200].includes(response.status)).toBe(true)
        })
    })

    describe('Performance Testing', () => {
        it('should handle load testing scenario', async () => {
            const concurrentRequests = 10
            const requests = Array.from({ length: concurrentRequests }, () =>
                app.request(healthEndpoint)
            )

            const startTime = Date.now()
            const responses = await Promise.all(requests)
            const endTime = Date.now()

            // All requests should succeed
            responses.forEach((response: Response) => {
                expect(response.status).toBe(200)
            })

            // Should complete within reasonable time
            expect(endTime - startTime).toBeLessThan(5000) // 5 seconds for 10 requests
        })

        it('should maintain performance under repeated requests', async () => {
            const iterations = 5
            const times: number[] = []

            for (let i = 0; i < iterations; i++) {
                const startTime = Date.now()
                const response = await app.request(healthEndpoint)
                const endTime = Date.now()

                expect(response.status).toBe(200)
                times.push(endTime - startTime)
            }

            // Performance should be consistent
            const avgTime = times.reduce((a, b) => a + b, 0) / times.length
            expect(avgTime).toBeLessThan(500) // Average should be under 500ms
        })
    })
})
