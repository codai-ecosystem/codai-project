// Simple health endpoint for BancAI App
import type { NextApiRequest, NextApiResponse } from 'next'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'GET') {
        res.status(200).json({
            status: 'healthy',
            service: 'BancAI App',
            port: 4005,
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            version: '1.0.0'
        })
    } else {
        res.status(405).json({ message: 'Method not allowed' })
    }
}
