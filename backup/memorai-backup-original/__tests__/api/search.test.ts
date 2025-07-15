import { describe, it, expect } from 'vitest'
import { GET, POST } from '../../app/api/memory/search/route'
import { NextRequest } from 'next/server'

describe('Memory Search API', () => {
  describe('GET /api/memory/search', () => {
    it('should return search results', async () => {
      const request = new NextRequest('http://localhost:3000/api/memory/search?q=React&limit=10')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toHaveProperty('memories')
      expect(data).toHaveProperty('total')
      expect(data).toHaveProperty('searchId')
      expect(Array.isArray(data.memories)).toBe(true)
    })

    it('should handle empty query', async () => {
      const request = new NextRequest('http://localhost:3000/api/memory/search')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.memories).toHaveLength(0)
    })

    it('should apply filters', async () => {
      const request = new NextRequest('http://localhost:3000/api/memory/search?q=test&type=code-snippets')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toHaveProperty('memories')
    })
  })

  describe('POST /api/memory/search', () => {
    it('should handle advanced search', async () => {
      const body = {
        query: 'React testing',
        options: {
          useSemanticSimilarity: true,
          maxResults: 5
        }
      }

      const request = new NextRequest('http://localhost:3000/api/memory/search', {
        method: 'POST',
        body: JSON.stringify(body),
        headers: { 'Content-Type': 'application/json' }
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toHaveProperty('memories')
      expect(data).toHaveProperty('searchId')
    })

    it('should validate request body', async () => {
      const request = new NextRequest('http://localhost:3000/api/memory/search', {
        method: 'POST',
        body: JSON.stringify({}),
        headers: { 'Content-Type': 'application/json' }
      })

      const response = await POST(request)
      expect(response.status).toBe(400)
    })
  })
})
