import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import React from 'react'
import { useControlAIApi } from '../src/hooks/useControlAIApi'

// Simple component to test the hook
function TestComponent() {
    const { dashboardData, loading, error } = useControlAIApi()

    if (loading) return <div>Loading...</div>
    if (error) return <div>Error: {error}</div>
    if (!dashboardData) return <div>No data</div>

    return (
        <div>
            <div data-testid="total-projects">{dashboardData.metrics.totalProjects}</div>
            <div data-testid="total-agents">{dashboardData.metrics.totalAgents}</div>
            <div data-testid="projects-count">{dashboardData.projects.length}</div>
        </div>
    )
}

describe('Mock Verification', () => {
    it('should provide mocked data immediately', () => {
        render(<TestComponent />)

        // Should not show loading
        const loadingEl = screen.queryByText('Loading...')
        expect(loadingEl).toBe(null)

        // Should not show error
        const errorEl = screen.queryByText(/Error:/)
        expect(errorEl).toBe(null)

        // Should show actual data
        const projectsEl = screen.getByTestId('total-projects')
        expect(projectsEl.textContent).toBe('12')

        const agentsEl = screen.getByTestId('total-agents')
        expect(agentsEl.textContent).toBe('8')

        const projectsCountEl = screen.getByTestId('projects-count')
        expect(projectsCountEl.textContent).toBe('3')

        console.log('✅ All mocks working correctly!')
    })
})
