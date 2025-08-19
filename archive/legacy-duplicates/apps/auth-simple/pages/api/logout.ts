import type { NextApiRequest, NextApiResponse } from 'next'

interface LogoutRequest {
  token: string
}

interface LogoutResponse {
  success: boolean
  message?: string
  error?: string
}

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<LogoutResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' })
  }

  const { token }: LogoutRequest = req.body

  if (!token) {
    return res.status(400).json({ success: false, error: 'Token is required' })
  }

  // In production, you would invalidate the token in your database/cache
  // For now, we'll just acknowledge the logout
  return res.status(200).json({
    success: true,
    message: 'Successfully logged out'
  })
}
