import { NextApiRequest, NextApiResponse } from 'next'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'GET') {
        // Get project status
        res.status(200).json({
            totalProjects: 15,
            activeProjects: 8,
            deployedProjects: 12,
            totalFiles: 1234,
            totalLines: 156789,
            totalCommits: 567,
            uptime: '99.9%',
            lastBackup: new Date(Date.now() - 3600000).toISOString(),
            serverHealth: 'excellent'
        })
    } else {
        res.setHeader('Allow', ['GET'])
        res.status(405).end(`Method ${req.method} Not Allowed`)
    }
}
