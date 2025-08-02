import type { NextApiRequest, NextApiResponse } from 'next'

interface RolesResponse {
  success: boolean
  roles?: Array<{
    id: string
    name: string
    description: string
    permissions: string[]
  }>
  error?: string
}

// Mock roles database
const mockRoles = [
  {
    id: 'admin',
    name: 'Administrator',
    description: 'Full system access and management capabilities',
    permissions: [
      'user.create',
      'user.read',
      'user.update',
      'user.delete',
      'system.admin',
      'api.all'
    ]
  },
  {
    id: 'user',
    name: 'Standard User',
    description: 'Basic user access with limited permissions',
    permissions: [
      'profile.read',
      'profile.update',
      'api.basic'
    ]
  },
  {
    id: 'moderator',
    name: 'Moderator',
    description: 'Content moderation and user management',
    permissions: [
      'user.read',
      'user.update',
      'content.moderate',
      'api.moderate'
    ]
  }
]

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<RolesResponse>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' })
  }

  // In production, you would verify admin token here
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: 'Authorization token required'
    })
  }

  const token = authHeader.slice(7)
  if (!token.startsWith('codai_')) {
    return res.status(401).json({
      success: false,
      error: 'Invalid authorization token'
    })
  }

  return res.status(200).json({
    success: true,
    roles: mockRoles
  })
}
