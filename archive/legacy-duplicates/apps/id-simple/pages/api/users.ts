import type { NextApiRequest, NextApiResponse } from 'next'

interface UsersResponse {
  success: boolean
  users?: Array<{
    id: string
    email: string
    name?: string
    role: string
    createdAt: string
    lastLogin?: string
  }>
  total?: number
  error?: string
}

// Mock user database
const mockUsers = [
  {
    id: 'admin_12345',
    email: 'admin@codai.ro',
    name: 'CODAI Administrator',
    role: 'admin',
    createdAt: '2024-01-01T00:00:00.000Z',
    lastLogin: '2024-12-19T10:30:00.000Z'
  },
  {
    id: 'demo_67890',
    email: 'demo@codai.ro',
    name: 'Demo User',
    role: 'user',
    createdAt: '2024-01-15T10:30:00.000Z',
    lastLogin: '2024-12-19T09:15:00.000Z'
  },
  {
    id: 'user_11111',
    email: 'john.doe@example.com',
    name: 'John Doe',
    role: 'user',
    createdAt: '2024-02-01T14:20:00.000Z',
    lastLogin: '2024-12-18T16:45:00.000Z'
  }
]

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<UsersResponse>
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

  // Return paginated user list
  const page = parseInt(req.query.page as string) || 1
  const limit = parseInt(req.query.limit as string) || 10
  const startIndex = (page - 1) * limit
  const endIndex = startIndex + limit

  const paginatedUsers = mockUsers.slice(startIndex, endIndex)

  return res.status(200).json({
    success: true,
    users: paginatedUsers,
    total: mockUsers.length
  })
}
