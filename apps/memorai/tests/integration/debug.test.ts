/**
 * Simple Integration Test Debug
 */

import { describe, it, expect } from 'vitest'

describe('Debug Integration Test', () => {
    it('should test basic fetch functionality', async () => {
        try {
            console.log('Testing basic fetch...')
            const response = await fetch('http://localhost:4006/api/health')
            console.log('Response received:', response)
            console.log('Response status:', response?.status)
            console.log('Response ok:', response?.ok)

            expect(response).toBeDefined()
            expect(response.status).toBe(200)

            const data = await response.json()
            console.log('Response data:', data)
            expect(data).toHaveProperty('service')
        } catch (error) {
            console.error('Fetch error:', error)
            throw error
        }
    })

    it('should test with our helper function', async () => {
        const createTestApp = () => ({
            request: async (path: string) => {
                const baseUrl = 'http://localhost:4006'
                console.log('Making request to:', `${baseUrl}${path}`)
                const response = await fetch(`${baseUrl}${path}`)
                console.log('Helper response:', response)
                return response
            }
        })

        const app = createTestApp()
        const response = await app.request('/api/health')

        expect(response).toBeDefined()
        expect(response.status).toBe(200)
    })
})
