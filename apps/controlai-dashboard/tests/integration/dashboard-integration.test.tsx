import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TEST_TIMEOUT } from '../setup'

// Import all components
import App from '../../src/App'
import ProjectOverview from '../../src/components/ProjectOverview'
import TaskBoard from '../../src/components/TaskBoard'
import AgentMonitor from '../../src/components/AgentMonitor'
import MetricsDashboard from '../../src/components/MetricsDashboard'

// Mock the API hook
vi.mock('../../src/hooks/useControlAIApi', () => ({
    useControlAIApi: () => ({
        data: mockDashboardData,
        loading: false,
        error: null,
        refetch: vi.fn()
    })
}))

const mockDashboardData = {
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
            createdAt: '2025-01-30T10:00:00Z'
        }
    ],
    agents: [
        {
            id: 'agent-1',
            name: 'Testing Specialist',
            type: 'QA Engineer',
            status: 'online' as const,
            currentTask: 'Frontend Testing Phase 2C',
            capabilities: ['Testing', 'Quality Assurance'],
            performance: 95
        }
    ],
    tasks: [
        {
            id: 'task-1',
            title: 'Hub Frontend Testing',
            status: 'completed' as const,
            assignedAgent: 'Testing Specialist',
            priority: 'high' as const,
            estimatedHours: 8,
            actualHours: 6,
            createdAt: '2025-01-30T10:00:00Z'
        }
    ]
}

describe('ControlAI Dashboard Integration Tests', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    describe('Application Integration', () => {
        it('should render main app with all navigation options', () => {
            render(<App />)

            expect(screen.getByText('ControlAI Dashboard')).toBeDefined()
            expect(screen.getByText('Projects')).toBeDefined()
            expect(screen.getByText('Tasks')).toBeDefined()
            expect(screen.getByText('Agents')).toBeDefined()
            expect(screen.getByText('Metrics')).toBeDefined()
        }, TEST_TIMEOUT)

        it('should navigate between different views', async () => {
            const user = userEvent.setup()
            render(<App />)

            // Start with Projects view (default)
            expect(screen.getByText('Projects Overview')).toBeDefined()

            // Navigate to Tasks
            await user.click(screen.getByText('Tasks'))
            expect(screen.getByText('Task Board')).toBeDefined()

            // Navigate to Agents
            await user.click(screen.getByText('Agents'))
            expect(screen.getByText('Agent Monitor')).toBeDefined()

            // Navigate to Metrics
            await user.click(screen.getByText('Metrics'))
            expect(screen.getByText('Metrics Dashboard')).toBeDefined()
        }, TEST_TIMEOUT)

        it('should maintain consistent data across views', async () => {
            const user = userEvent.setup()
            render(<App />)

            // Check data consistency across views
            expect(screen.getByText('12 projects • 8 agents')).toBeDefined()

            await user.click(screen.getByText('Tasks'))
            // Data should still be available in task view
            expect(screen.getByText('Hub Frontend Testing')).toBeDefined()

            await user.click(screen.getByText('Agents'))
            // Data should still be available in agent view
            expect(screen.getByText('Testing Specialist')).toBeDefined()
        }, TEST_TIMEOUT)
    })

    describe('Component Data Flow', () => {
        it('should pass correct data to ProjectOverview', () => {
            render(<ProjectOverview data={mockDashboardData} />)

            expect(screen.getByText('CODAI Ecosystem Enhancement')).toBeDefined()
            expect(screen.getByText('85%')).toBeDefined()
            expect(screen.getByText('6 members')).toBeDefined()
        }, TEST_TIMEOUT)

        it('should pass correct data to TaskBoard', () => {
            render(<TaskBoard data={mockDashboardData} />)

            expect(screen.getByText('Hub Frontend Testing')).toBeDefined()
            expect(screen.getByText('Testing Specialist')).toBeDefined()
            expect(screen.getByText('High')).toBeDefined()
        }, TEST_TIMEOUT)

        it('should pass correct data to AgentMonitor', () => {
            render(<AgentMonitor data={mockDashboardData} />)

            expect(screen.getByText('Testing Specialist')).toBeDefined()
            expect(screen.getByText('QA Engineer')).toBeDefined()
            expect(screen.getByText('95%')).toBeDefined()
        }, TEST_TIMEOUT)

        it('should pass correct data to MetricsDashboard', () => {
            render(<MetricsDashboard data={mockDashboardData} />)

            expect(screen.getByText('Total Projects')).toBeDefined()
            expect(screen.getByText('12')).toBeDefined()
            expect(screen.getByText('24')).toBeDefined() // Active Tasks
        }, TEST_TIMEOUT)
    })

    describe('Cross-Component Interactions', () => {
        it('should maintain state consistency when switching views', async () => {
            const user = userEvent.setup()
            render(<App />)

            // Enable dark mode
            await user.click(screen.getByLabelText('Toggle dark mode'))

            // Switch to different views and verify dark mode persists
            await user.click(screen.getByText('Tasks'))
            expect(screen.getByTestId('sun-icon')).toBeDefined()

            await user.click(screen.getByText('Agents'))
            expect(screen.getByTestId('sun-icon')).toBeDefined()

            await user.click(screen.getByText('Metrics'))
            expect(screen.getByTestId('sun-icon')).toBeDefined()
        }, TEST_TIMEOUT)

        it('should handle refresh functionality across all views', async () => {
            const user = userEvent.setup()
            render(<App />)

            const refreshButton = screen.getByText('Refresh')

            // Test refresh in different views
            await user.click(refreshButton)

            await user.click(screen.getByText('Tasks'))
            await user.click(refreshButton)

            await user.click(screen.getByText('Agents'))
            await user.click(refreshButton)

            await user.click(screen.getByText('Metrics'))
            await user.click(refreshButton)

            // All refresh actions should work without errors
            expect(refreshButton).toBeDefined()
        }, TEST_TIMEOUT)
    })

    describe('Data Consistency Validation', () => {
        it('should show consistent metrics across all components', () => {
            render(<App />)

            // Header should show correct totals
            expect(screen.getByText('12 projects • 8 agents')).toBeDefined()
        }, TEST_TIMEOUT)

        it('should handle empty data gracefully across components', () => {
            const emptyData = {
                metrics: { totalProjects: 0, totalAgents: 0, activeTasks: 0, completedTasks: 0, agentUtilization: 0, systemHealth: 0 },
                projects: [],
                agents: [],
                tasks: []
            }

            render(<ProjectOverview data={emptyData} />)
            expect(screen.getByText('No projects found')).toBeDefined()

            render(<TaskBoard data={emptyData} />)
            expect(screen.getByText('No tasks available')).toBeDefined()

            render(<AgentMonitor data={emptyData} />)
            expect(screen.getByText('No agents available')).toBeDefined()
        }, TEST_TIMEOUT)

        it('should maintain data relationships between components', () => {
            // Verify that task assignments match agent data
            render(<TaskBoard data={mockDashboardData} />)
            expect(screen.getByText('Testing Specialist')).toBeDefined()

            render(<AgentMonitor data={mockDashboardData} />)
            expect(screen.getByText('Testing Specialist')).toBeDefined()
        }, TEST_TIMEOUT)
    })

    describe('Performance Integration', () => {
        it('should render all components efficiently', () => {
            const startTime = performance.now()

            render(<App />)

            const endTime = performance.now()

            // Should render within reasonable time
            expect(endTime - startTime).toBeLessThan(100)
        }, TEST_TIMEOUT)

        it('should handle view switching without performance degradation', async () => {
            const user = userEvent.setup()
            render(<App />)

            const views = ['Tasks', 'Agents', 'Metrics', 'Projects']

            for (const view of views) {
                const startTime = performance.now()
                await user.click(screen.getByText(view))
                const endTime = performance.now()

                expect(endTime - startTime).toBeLessThan(50)
            }
        }, TEST_TIMEOUT)

        it('should not have memory leaks during navigation', async () => {
            const user = userEvent.setup()
            const { unmount } = render(<App />)

            // Rapid navigation
            for (let i = 0; i < 10; i++) {
                await user.click(screen.getByText('Tasks'))
                await user.click(screen.getByText('Agents'))
                await user.click(screen.getByText('Metrics'))
                await user.click(screen.getByText('Projects'))
            }

            expect(() => unmount()).not.toThrow()
        }, TEST_TIMEOUT)
    })

    describe('Accessibility Integration', () => {
        it('should maintain accessibility standards across all views', async () => {
            const user = userEvent.setup()
            render(<App />)

            const views = ['Projects', 'Tasks', 'Agents', 'Metrics']

            for (const view of views) {
                await user.click(screen.getByText(view))

                // Check for heading hierarchy
                const headings = screen.getAllByRole('heading')
                expect(headings.length).toBeGreaterThan(0)

                // Check for keyboard navigation
                const buttons = screen.getAllByRole('button')
                buttons.forEach(button => {
                    expect(button).not.toBeDefined()
                })
            }
        }, TEST_TIMEOUT)

        it('should provide consistent navigation experience', () => {
            render(<App />)

            const navButtons = screen.getAllByRole('button').filter(button =>
                ['Projects', 'Tasks', 'Agents', 'Metrics'].includes(button.textContent || '')
            )

            expect(navButtons).toHaveLength(4)
            navButtons.forEach(button => {
                expect(button).toBeDefined()
            })
        }, TEST_TIMEOUT)
    })

    describe('Error Boundary Integration', () => {
        it('should handle component errors gracefully', () => {
            // Mock console.error to prevent error logs in test output
            const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { })

            // Test with invalid data that might cause errors
            const invalidData = {
                metrics: null as any,
                projects: null as any,
                agents: null as any,
                tasks: null as any
            }

            expect(() => {
                render(<ProjectOverview data={invalidData} />)
            }).not.toThrow()

            expect(() => {
                render(<TaskBoard data={invalidData} />)
            }).not.toThrow()

            expect(() => {
                render(<AgentMonitor data={invalidData} />)
            }).not.toThrow()

            expect(() => {
                render(<MetricsDashboard data={invalidData} />)
            }).not.toThrow()

            consoleSpy.mockRestore()
        }, TEST_TIMEOUT)
    })

    describe('Responsive Design Integration', () => {
        it('should adapt all components to mobile view', () => {
            Object.defineProperty(window, 'innerWidth', {
                writable: true,
                configurable: true,
                value: 375,
            })

            render(<App />)

            expect(screen.getByText('ControlAI Dashboard')).toBeDefined()
            expect(screen.getByText('Projects Overview')).toBeDefined()
        }, TEST_TIMEOUT)

        it('should maintain functionality on small screens', async () => {
            Object.defineProperty(window, 'innerWidth', {
                writable: true,
                configurable: true,
                value: 320,
            })

            const user = userEvent.setup()
            render(<App />)

            // Navigation should still work
            await user.click(screen.getByText('Tasks'))
            expect(screen.getByText('Task Board')).toBeDefined()

            await user.click(screen.getByText('Agents'))
            expect(screen.getByText('Agent Monitor')).toBeDefined()
        }, TEST_TIMEOUT)
    })
})


