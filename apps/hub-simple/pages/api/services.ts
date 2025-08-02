import type { NextApiRequest, NextApiResponse } from 'next'

interface Service {
  id: string
  name: string
  status: 'running' | 'stopped' | 'error'
  endpoint: string
  description: string
  lastCheck: string
}

interface ServicesResponse {
  services: Service[]
  total: number
  healthy: number
  unhealthy: number
}

const mockServices: Service[] = [
  {
    id: 'memorai',
    name: 'MemorAI Service',
    status: 'running',
    endpoint: 'https://memorai.ro',
    description: 'AI Memory Management System',
    lastCheck: new Date().toISOString()
  },
  {
    id: 'romai',
    name: 'RomAI Service',
    status: 'running',
    endpoint: 'https://romcp.ro',
    description: 'Romanian AI Assistant',
    lastCheck: new Date().toISOString()
  },
  {
    id: 'codai',
    name: 'CODAI Platform',
    status: 'running',
    endpoint: 'https://api.codai.ro',
    description: 'AI Development Platform',
    lastCheck: new Date().toISOString()
  },
  {
    id: 'auth',
    name: 'Authentication Service',
    status: 'running',
    endpoint: 'https://auth.codai.ro',
    description: 'Authentication & Authorization',
    lastCheck: new Date().toISOString()
  }
]

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<ServicesResponse>
) {
  if (req.method !== 'GET') {
    return res.status(405).end()
  }

  const healthy = mockServices.filter(s => s.status === 'running').length
  const unhealthy = mockServices.length - healthy

  const response: ServicesResponse = {
    services: mockServices,
    total: mockServices.length,
    healthy,
    unhealthy
  }

  res.status(200).json(response)
}
