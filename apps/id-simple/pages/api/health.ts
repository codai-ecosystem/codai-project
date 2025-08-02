import type { NextApiRequest, NextApiResponse } from 'next'

interface HealthResponse {
  status: 'healthy' | 'unhealthy'
  service: string
  version: string
  timestamp: string
  uptime: number
}

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<HealthResponse>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({
      status: 'unhealthy',
      service: 'id-simple',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    })
  }

  res.status(200).json({
    status: 'healthy',
    service: 'id-simple',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  })
}
