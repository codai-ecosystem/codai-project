import type { NextApiRequest, NextApiResponse } from 'next'

interface LoginRequest {
  email: string
  password: string
}

interface LoginResponse {
  success: boolean
  token?: string
  userId?: string
  error?: string
  expiresAt?: string
}

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<LoginResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' })
  }

  const { email, password }: LoginRequest = req.body

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      error: 'Email and password are required'
    })
  }

  // Simple authentication (in production, verify against database)
  if (email === 'admin@codai.ro' && password === 'admin123') {
    const token = `codai_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    return res.status(200).json({
      success: true,
      token,
      userId: 'admin_12345',
      expiresAt: new Date(Date.now() + 3600000).toISOString() // 1 hour
    })
  }

  // Demo user for testing
  if (email === 'demo@codai.ro' && password === 'demo123') {
    const token = `codai_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    return res.status(200).json({
      success: true,
      token,
      userId: 'demo_67890',
      expiresAt: new Date(Date.now() + 3600000).toISOString() // 1 hour
    })
  }

  return res.status(401).json({
    success: false,
    error: 'Invalid email or password'
  })
}
