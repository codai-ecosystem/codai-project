// Simple health endpoint for CODAI App
import type { NextApiRequest, NextApiResponse } from 'next'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'GET') {
        res.status(200).json({
            status: 'healthy',
            service: 'CODAI App',
            port: 4001,
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            version: '1.0.0'
        })
    } else {
        res.status(405).json({ message: 'Method not allowed' })
    }
}
