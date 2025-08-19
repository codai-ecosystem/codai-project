import type { NextApiRequest, NextApiResponse } from 'next'

interface VerifyRequest {
  token: string
}

interface VerifyResponse {
  valid: boolean
  userId?: string
  error?: string
  expiresAt?: string
}

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<VerifyResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ valid: false, error: 'Method not allowed' })
  }

  const { token }: VerifyRequest = req.body

  if (!token) {
    return res.status(400).json({ valid: false, error: 'Token is required' })
  }

  // Simple token validation (in production, use proper JWT verification)
  if (token.startsWith('codai_')) {
    return res.status(200).json({
      valid: true,
      userId: 'user_12345',
      expiresAt: new Date(Date.now() + 3600000).toISOString() // 1 hour from now
    })
  }

  return res.status(401).json({ valid: false, error: 'Invalid token' })
}
