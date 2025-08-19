import type { NextApiRequest, NextApiResponse } from 'next'

interface UserResponse {
  success: boolean
  user?: {
    id: string
    email: string
    name?: string
    role: string
    createdAt: string
    lastLogin?: string
    profile?: {
      avatar?: string
      bio?: string
      location?: string
    }
  }
  error?: string
}

// Mock user database (same as in users.ts)
const mockUsers = [
  {
    id: 'admin_12345',
    email: 'admin@codai.ro',
    name: 'CODAI Administrator',
    role: 'admin',
    createdAt: '2024-01-01T00:00:00.000Z',
    lastLogin: '2024-12-19T10:30:00.000Z',
    profile: {
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
      bio: 'System administrator for CODAI platform',
      location: 'Bucharest, Romania'
    }
  },
  {
    id: 'demo_67890',
    email: 'demo@codai.ro',
    name: 'Demo User',
    role: 'user',
    createdAt: '2024-01-15T10:30:00.000Z',
    lastLogin: '2024-12-19T09:15:00.000Z',
    profile: {
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=demo',
      bio: 'Demo account for testing CODAI features',
      location: 'Cluj-Napoca, Romania'
    }
  },
  {
    id: 'user_11111',
    email: 'john.doe@example.com',
    name: 'John Doe',
    role: 'user',
    createdAt: '2024-02-01T14:20:00.000Z',
    lastLogin: '2024-12-18T16:45:00.000Z',
    profile: {
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=john',
      bio: 'Software developer interested in AI',
      location: 'Timisoara, Romania'
    }
  }
]

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<UserResponse>
) {
  const { userId } = req.query

  if (!userId || typeof userId !== 'string') {
    return res.status(400).json({
      success: false,
      error: 'User ID is required'
    })
  }

  if (req.method === 'GET') {
    // Get user by ID
    const user = mockUsers.find(u => u.id === userId)

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      })
    }

    return res.status(200).json({
      success: true,
      user
    })
  }

  if (req.method === 'PUT') {
    // Update user
    const userIndex = mockUsers.findIndex(u => u.id === userId)

    if (userIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      })
    }

    const updates = req.body
    const updatedUser = { ...mockUsers[userIndex], ...updates }

    // In production, you would save to database here

    return res.status(200).json({
      success: true,
      user: updatedUser
    })
  }

  if (req.method === 'DELETE') {
    // Delete user
    const userIndex = mockUsers.findIndex(u => u.id === userId)

    if (userIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      })
    }

    // In production, you would delete from database here

    return res.status(200).json({
      success: true,
      user: mockUsers[userIndex]
    })
  }

  return res.status(405).json({
    success: false,
    error: 'Method not allowed'
  })
}
