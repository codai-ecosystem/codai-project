import React from 'react'
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
// Using basic assertions instead of jest-dom
import ProjectOverview from '../../src/components/ProjectOverview'

const simpleMockData = {
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
            status: 'active' as const,
            progress: 85,
            teamSize: 6,
            tasks: [],
            createdAt: '2025-07-01T00:00:00Z'
        }
    ],
    agents: [],
    tasks: []
}

describe('Simple Component Test', () => {
    it('should render ProjectOverview with correct prop name', () => {
        render(<ProjectOverview data={simpleMockData} />)

        // Check if the title renders
        expect(screen.getByText('Project Overview')).toBeDefined()
        expect(screen.getByText('Total Projects')).toBeDefined()
        expect(screen.getByText('12')).toBeDefined()
    })
})


