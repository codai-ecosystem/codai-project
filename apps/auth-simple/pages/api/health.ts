import type { NextApiRequest, NextApiResponse } from 'next'

interface HealthResponse {
  service: string
  status: 'healthy' | 'unhealthy' | 'degraded'
  version: string
  timestamp: string
  uptime: number
  capabilities: string[]
}

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<HealthResponse>
) {
  if (req.method !== 'GET') {
    return res.status(405).end()
  }

  const healthStatus: HealthResponse = {
    service: 'auth-api',
    status: 'healthy',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    capabilities: [
      'token-verification',
      'user-authentication',
      'session-management',
      'api-key-validation'
    ]
  }

  res.status(200).json(healthStatus)
}
