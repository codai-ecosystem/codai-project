import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getLogAIService } from './logai'

// Mock fetch globally
global.fetch = vi.fn()

// Mock environment variables
vi.mock('process', () => ({
  env: {
    LOGAI_API_URL: 'http://test-api.com',
    LOGAI_API_KEY: 'test-key'
  }
}))

describe('LogAI Service', () => {
  let service: any
  
  beforeEach(() => {
    service = getLogAIService()
    vi.clearAllMocks()
  })

  describe('validateToken', () => {
    it('should validate token successfully', async () => {
      const mockResponse = {
        success: true,
        user: {
          id: '1',
          email: 'test@example.com',
          name: 'Test User',
          role: 'user',
          permissions: ['read']
        }
      }

      ;(fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      })

      const result = await service.validateToken('valid-token')
      
      expect(result.success).toBe(true)
      expect(result.user).toBeDefined()
      expect(result.user?.email).toBe('test@example.com')
    })

    it('should handle validation failure', async () => {
      ;(fetch as any).mockRejectedValueOnce(new Error('Network error'))

      const result = await service.validateToken('invalid-token')
      
      expect(result.success).toBe(false)
      expect(result.error).toBe('Authentication service unavailable')
    })
  })

  describe('refreshToken', () => {
    it('should refresh token successfully', async () => {
      const mockResponse = {
        success: true,
        token: 'new-token',
        user: {
          id: '1',
          email: 'test@example.com',
          name: 'Test User',
          role: 'user',
          permissions: ['read']
        }
      }

      ;(fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      })

      const result = await service.refreshToken('refresh-token')
      
      expect(result.success).toBe(true)
      expect(result.token).toBe('new-token')
    })
  })
})
