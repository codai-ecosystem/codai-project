import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { username, password } = req.body;

    // Simple authentication for the dashboard
    // In production, this would validate against a real auth system
    if (username === 'romai' && password === 'romai2025') {
      const token = `romai_token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      return res.status(200).json({
        success: true,
        token,
        user: {
          id: 'romai-user',
          username: 'romai',
          role: 'admin',
          permissions: ['intelligence', 'chat', 'analytics', 'system']
        },
        expiresIn: '24h',
        issuedAt: new Date().toISOString()
      });
    }

    return res.status(401).json({
      error: 'Invalid credentials',
      message: 'Username or password is incorrect'
    });

  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: 'Authentication service temporarily unavailable'
    });
  }
}
