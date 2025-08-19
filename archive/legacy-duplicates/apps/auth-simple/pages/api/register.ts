import type { NextApiRequest, NextApiResponse } from 'next'

interface RegisterRequest {
  email: string
  password: string
  name?: string
}

interface RegisterResponse {
  success: boolean
  token?: string
  userId?: string
  error?: string
  expiresAt?: string
}

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<RegisterResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' })
  }

  const { email, password, name }: RegisterRequest = req.body

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      error: 'Email and password are required'
    })
  }

  // Simple email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid email format'
    })
  }

  // Simple password validation
  if (password.length < 6) {
    return res.status(400).json({
      success: false,
      error: 'Password must be at least 6 characters'
    })
  }

  // In production, check if user already exists and hash password
  // For demo, we'll allow any new registration
  const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  const token = `codai_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

  return res.status(201).json({
    success: true,
    token,
    userId,
    expiresAt: new Date(Date.now() + 3600000).toISOString() // 1 hour
  })
}
