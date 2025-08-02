import type { NextApiRequest, NextApiResponse } from 'next'

interface StatusResponse {
  status: 'operational' | 'degraded' | 'maintenance'
  message: string
  services: {
    name: string
    status: 'operational' | 'degraded' | 'down'
  }[]
  lastUpdated: string
}

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<StatusResponse>
) {
  if (req.method !== 'GET') {
    return res.status(405).end()
  }

  const response: StatusResponse = {
    status: 'operational',
    message: 'All systems operational',
    services: [
      { name: 'CODAI Platform', status: 'operational' },
      { name: 'MemorAI', status: 'operational' },
      { name: 'RomAI', status: 'operational' },
      { name: 'Authentication', status: 'operational' },
      { name: 'Hub Services', status: 'operational' }
    ],
    lastUpdated: new Date().toISOString()
  }

  res.status(200).json(response)
}
