import { useState, useEffect } from 'react'

export interface DashboardMetrics {
    totalProjects: number
    totalAgents: number
    activeTasks: number
    completedTasks: number
    agentUtilization: number
    systemHealth: number
}

export interface Agent {
    id: string
    name: string
    type: string
    status: 'online' | 'offline' | 'busy'
    currentTask?: string
    capabilities: string[]
    performance: number
}

export interface Task {
    id: string
    title: string
    status: 'todo' | 'in_progress' | 'review' | 'completed'
    assignedAgent?: string
    priority: 'low' | 'medium' | 'high' | 'critical'
    estimatedHours: number
    actualHours?: number
    createdAt: string
    dueDate?: string
}

export interface Project {
    id: string
    name: string
    description: string
    status: 'planning' | 'active' | 'paused' | 'completed'
    progress: number
    teamSize: number
    tasks: Task[]
    createdAt: string
}

export interface DashboardData {
    metrics: DashboardMetrics
    projects: Project[]
    agents: Agent[]
    tasks: Task[]
}

// Mock data for development
const mockDashboardData: DashboardData = {
    metrics: {
        totalProjects: 12,
        totalAgents: 8,
        activeTasks: 24,
        completedTasks: 156,
        agentUtilization: 78,
        systemHealth: 95
    },
    projects: [
        {
            id: 'proj-1',
            name: 'CODAI Ecosystem Enhancement',
            description: 'Comprehensive testing and quality improvements',
            status: 'active',
            progress: 85,
            teamSize: 6,
            tasks: [],
            createdAt: '2025-07-01T00:00:00Z'
        },
        {
            id: 'proj-2',
            name: 'MCP Integration Testing',
            description: 'Testing Model Context Protocol integrations',
            status: 'active',
            progress: 65,
            teamSize: 4,
            tasks: [],
            createdAt: '2025-07-15T00:00:00Z'
        }
    ],
    agents: [
        {
            id: 'agent-1',
            name: 'Testing Specialist',
            type: 'QA Engineer',
            status: 'online',
            currentTask: 'Frontend Testing Phase 2C',
            capabilities: ['Testing', 'Quality Assurance', 'Automation'],
            performance: 95
        },
        {
            id: 'agent-2',
            name: 'Development Lead',
            type: 'Senior Developer',
            status: 'busy',
            currentTask: 'Architecture Review',
            capabilities: ['Full-Stack Development', 'Architecture', 'Code Review'],
            performance: 92
        }
    ],
    tasks: [
        {
            id: 'task-1',
            title: 'Hub Frontend Testing',
            status: 'completed',
            assignedAgent: 'agent-1',
            priority: 'high',
            estimatedHours: 8,
            actualHours: 6,
            createdAt: '2025-07-30T00:00:00Z'
        },
        {
            id: 'task-2',
            title: 'ControlAI Dashboard Testing',
            status: 'in_progress',
            assignedAgent: 'agent-1',
            priority: 'high',
            estimatedHours: 10,
            createdAt: '2025-07-31T00:00:00Z'
        }
    ]
}

export function useControlAIApi() {
    const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const fetchData = async () => {
        try {
            setLoading(true)
            setError(null)

            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 500))

            // In a real implementation, this would be an actual API call
            // const response = await fetch('/api/dashboard/data')
            // const data = await response.json()

            setDashboardData(mockDashboardData)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error occurred')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchData()
    }, [])

    const refetch = () => {
        fetchData()
    }

    return {
        dashboardData,
        loading,
        error,
        refetch
    }
}
