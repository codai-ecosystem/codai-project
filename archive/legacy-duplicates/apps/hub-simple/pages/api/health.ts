import type { NextApiRequest, NextApiResponse } from 'next'

interface HealthResponse {
  service: string
  status: 'healthy' | 'unhealthy' | 'degraded'
  version: string
  timestamp: string
  uptime: number
  dependencies: {
    database: 'connected' | 'disconnected'
    cache: 'connected' | 'disconnected'
    api: 'available' | 'unavailable'
  }
}

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<HealthResponse>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({
      service: 'hub-api',
      status: 'unhealthy',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      dependencies: {
        database: 'disconnected',
        cache: 'disconnected',
        api: 'unavailable'
      }
    })
  }

  // Simple health check
  const healthStatus: HealthResponse = {
    service: 'hub-api',
    status: 'healthy',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    dependencies: {
      database: 'connected',
      cache: 'connected',
      api: 'available'
    }
  }

  res.status(200).json(healthStatus)
}
