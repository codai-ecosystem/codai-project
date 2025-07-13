import { NextApiRequest, NextApiResponse } from 'next'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'GET') {
        // Get projects
        res.status(200).json({
            projects: [
                {
                    id: '1',
                    name: 'E-commerce Platform',
                    description: 'Modern React-based e-commerce solution',
                    status: 'building',
                    framework: 'Next.js 14',
                    language: 'TypeScript',
                    lastActivity: new Date().toISOString()
                },
                {
                    id: '2',
                    name: 'AI Chat Bot',
                    description: 'Intelligent customer service chatbot',
                    status: 'deployed',
                    framework: 'Next.js 14',
                    language: 'TypeScript',
                    lastActivity: new Date(Date.now() - 7200000).toISOString()
                }
            ]
        })
    } else if (req.method === 'POST') {
        // Create new project
        const { name, description, framework } = req.body
        
        if (!name || !description) {
            return res.status(400).json({ error: 'Name and description are required' })
        }

        // Simulate project creation
        const newProject = {
            id: Date.now().toString(),
            name,
            description,
            framework: framework || 'Next.js',
            status: 'active',
            language: 'TypeScript',
            createdAt: new Date().toISOString(),
            lastActivity: new Date().toISOString()
        }

        res.status(201).json({ project: newProject })
    } else {
        res.setHeader('Allow', ['GET', 'POST'])
        res.status(405).end(`Method ${req.method} Not Allowed`)
    }
}
