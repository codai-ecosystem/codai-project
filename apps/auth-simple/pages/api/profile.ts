import type { NextApiRequest, NextApiResponse } from 'next'

interface ProfileRequest {
  token: string
}

interface ProfileResponse {
  success: boolean
  user?: {
    id: string
    email: string
    name?: string
    createdAt: string
  }
  error?: string
}

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<ProfileResponse>
) {
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' })
  }

  // Get token from Authorization header or request body
  let token: string | undefined

  if (req.method === 'GET') {
    const authHeader = req.headers.authorization
    token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : undefined
  } else {
    token = req.body?.token
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Token is required'
    })
  }

  // Simple token validation (in production, use proper JWT verification)
  if (!token.startsWith('codai_')) {
    return res.status(401).json({
      success: false,
      error: 'Invalid token'
    })
  }

  // Return mock user profile based on token
  let mockUser
  if (token.includes('admin')) {
    mockUser = {
      id: 'admin_12345',
      email: 'admin@codai.ro',
      name: 'CODAI Administrator',
      createdAt: '2024-01-01T00:00:00.000Z'
    }
  } else {
    mockUser = {
      id: 'demo_67890',
      email: 'demo@codai.ro',
      name: 'Demo User',
      createdAt: '2024-01-15T10:30:00.000Z'
    }
  }

  return res.status(200).json({
    success: true,
    user: mockUser
  })
}
