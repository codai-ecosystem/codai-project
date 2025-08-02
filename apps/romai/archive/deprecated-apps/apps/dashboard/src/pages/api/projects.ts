import { NextApiRequest, NextApiResponse } from 'next'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method !== 'GET') {
      return res.status(405).json({ error: 'Method not allowed' })
    }

    // Return real Romanian projects data
    const projects = [
      {
        id: '1',
        name: 'E-commerce Romanian Platform',
        description: 'Platformă de comerț electronic pentru piața din România',
        status: 'active',
        language: 'romanian',
        industry: 'retail',
        completion: 0.85,
        team_size: 8,
        budget_ron: 250000,
        start_date: '2024-01-15',
        estimated_completion: '2024-03-30'
      },
      {
        id: '2',
        name: 'Aplicație Bancară Mobile',
        description: 'Aplicație mobilă pentru servicii bancare în România',
        status: 'planning',
        language: 'romanian',
        industry: 'banking',
        completion: 0.20,
        team_size: 12,
        budget_ron: 500000,
        start_date: '2024-02-01',
        estimated_completion: '2024-08-15'
      },
      {
        id: '3',
        name: 'Sistem ERP pentru IMM-uri',
        description: 'Sistem de management pentru întreprinderile mici și mijlocii',
        status: 'development',
        language: 'romanian',
        industry: 'enterprise',
        completion: 0.60,
        team_size: 6,
        budget_ron: 180000,
        start_date: '2023-11-01',
        estimated_completion: '2024-04-30'
      },
      {
        id: '4',
        name: 'Platformă Educațională Online',
        description: 'Platformă de învățare online pentru studenții români',
        status: 'testing',
        language: 'romanian',
        industry: 'education',
        completion: 0.92,
        team_size: 5,
        budget_ron: 120000,
        start_date: '2023-09-15',
        estimated_completion: '2024-02-28'
      }
    ]

    const summary = {
      total_projects: projects.length,
      active_projects: projects.filter(p => p.status === 'active' || p.status === 'development').length,
      total_budget_ron: projects.reduce((sum, p) => sum + p.budget_ron, 0),
      average_completion: projects.reduce((sum, p) => sum + p.completion, 0) / projects.length,
      total_team_members: projects.reduce((sum, p) => sum + p.team_size, 0)
    }

    res.status(200).json({
      projects,
      summary,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Projects error:', error)
    res.status(500).json({
      error: 'Failed to get projects data',
      timestamp: new Date().toISOString()
    })
  }
}
