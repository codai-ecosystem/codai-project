import { describe, it, expect, vi } from 'vitest'
import { GET } from '../../app/api/health/route'

// Mock the services
vi.mock('../../lib/services', () => ({
  checkServiceHealth: vi.fn().mockResolvedValue({
    logai: { status: 'healthy', responseTime: 100 },
    memorai: { status: 'healthy', responseTime: 120 },
    codai: { status: 'healthy', responseTime: 90 }
  }),
  getCodaiService: vi.fn()
}))

describe('/api/health', () => {
  it('should return health status', async () => {
    const response = await GET()
    
    expect(response.status).toBe(200)
    
    const data = await response.json()
    expect(data.status).toBe('healthy')
    expect(data.service).toBe('fabricai')
    expect(data.timestamp).toBeDefined()
    expect(data.services).toBeDefined()
  })
})
