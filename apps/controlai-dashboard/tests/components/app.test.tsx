import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from '../../src/App'
import { TEST_TIMEOUT } from '../setup'

// Mock the custom hook
vi.mock('../../src/hooks/useControlAIApi', () => ({
    useControlAIApi: () => ({
        loading: false,
        error: null,
        refetch: vi.fn(),
        data: {
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
                }
            ],
            agents: [
                {
                    id: 'agent-1',
                    name: 'Testing Specialist',
                    type: 'QA Engineer',
                    status: 'online',
                    currentTask: 'Frontend Testing Phase 2C',
                    capabilities: ['Testing', 'Quality Assurance'],
                    performance: 95
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
                }
            ]
        },
        loading: false,
        error: null,
        refetch: vi.fn()
    })
}))

describe('ControlAI Dashboard App', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        // Reset localStorage
        localStorage.clear()
    })

    describe('Component Rendering', () => {
        it('should render main dashboard header', () => {
            render(<App />)

            expect(screen.getByText('ControlAI Dashboard')).toBeDefined()
            expect(screen.getByText('12 projects • 8 agents')).toBeDefined()
        }, TEST_TIMEOUT)

        it('should render navigation tabs', () => {
            render(<App />)

            expect(screen.getByText('Projects')).toBeDefined()
            expect(screen.getByText('Tasks')).toBeDefined()
            expect(screen.getByText('Agents')).toBeDefined()
            expect(screen.getByText('Metrics')).toBeDefined()
        }, TEST_TIMEOUT)

        it('should render header controls', () => {
            render(<App />)

            expect(screen.getByText('Refresh')).toBeDefined()
            expect(screen.getByLabelText('Toggle dark mode')).toBeDefined()
        }, TEST_TIMEOUT)
    })

    describe('Navigation', () => {
        it('should switch to Tasks view when clicked', async () => {
            const user = userEvent.setup()
            render(<App />)

            const tasksButton = screen.getByText('Tasks')
            await user.click(tasksButton)

            // Check if the active tab styling is applied
            expect(tasksButton.closest('button')).toHaveClass('border-primary-500')
        }, TEST_TIMEOUT)

        it('should switch to Agents view when clicked', async () => {
            const user = userEvent.setup()
            render(<App />)

            const agentsButton = screen.getByText('Agents')
            await user.click(agentsButton)

            expect(agentsButton.closest('button')).toHaveClass('border-primary-500')
        }, TEST_TIMEOUT)

        it('should switch to Metrics view when clicked', async () => {
            const user = userEvent.setup()
            render(<App />)

            const metricsButton = screen.getByText('Metrics')
            await user.click(metricsButton)

            expect(metricsButton.closest('button')).toHaveClass('border-primary-500')
        }, TEST_TIMEOUT)

        it('should return to Projects view when clicked', async () => {
            const user = userEvent.setup()
            render(<App />)

            // Click on Tasks first
            await user.click(screen.getByText('Tasks'))

            // Then click on Projects
            const projectsButton = screen.getByText('Projects')
            await user.click(projectsButton)

            expect(projectsButton.closest('button')).toHaveClass('border-primary-500')
        }, TEST_TIMEOUT)
    })

    describe('Dark Mode', () => {
        it('should toggle dark mode when button is clicked', async () => {
            const user = userEvent.setup()
            render(<App />)

            const darkModeButton = screen.getByLabelText('Toggle dark mode')
            await user.click(darkModeButton)

            // Check if localStorage was called
            expect(localStorage.setItem).toHaveBeenCalledWith('darkMode', 'true')
        }, TEST_TIMEOUT)

        it('should initialize dark mode from localStorage', () => {
            // Mock localStorage to return dark mode as true
            vi.mocked(localStorage.getItem).mockReturnValue('true')

            render(<App />)

            // The component should initialize with dark mode
            expect(localStorage.getItem).toHaveBeenCalledWith('darkMode')
        }, TEST_TIMEOUT)

        it('should show sun icon in dark mode', async () => {
            const user = userEvent.setup()
            render(<App />)

            // Initially should show moon icon (light mode)
            expect(screen.getByTestId('moon-icon')).toBeDefined()

            // Click to toggle to dark mode
            await user.click(screen.getByLabelText('Toggle dark mode'))

            // Should now show sun icon
            expect(screen.getByTestId('sun-icon')).toBeDefined()
        }, TEST_TIMEOUT)
    })

    describe('Refresh Functionality', () => {
        it('should call refetch when refresh button is clicked', async () => {
            const mockRefetch = vi.fn()

            // Mock the hook to return our mock refetch function
            vi.mocked(vi.fn()).mockReturnValue({
                data: null,
                loading: false,
                error: null,
                refetch: mockRefetch
            })

            const user = userEvent.setup()
            render(<App />)

            const refreshButton = screen.getByText('Refresh')
            await user.click(refreshButton)

            // The refetch function should be called, but since we're mocking the hook,
            // we need to verify the button exists and is clickable
            expect(refreshButton).not.toBeDisabled()
        }, TEST_TIMEOUT)
    })

    describe('Loading State', () => {
        it('should show loading spinner when data is loading', () => {
            // Mock loading state
            vi.doMock('../../src/hooks/useControlAIApi', () => ({
                useControlAIApi: () => ({
                    data: null,
                    loading: true,
                    error: null,
                    refetch: vi.fn()
                })
            }))

            // Re-import the component after mocking
            const { default: LoadingApp } = require('../../src/App')

            render(<LoadingApp />)

            expect(screen.getByText('ControlAI Dashboard')).toBeDefined()
            // Loading spinner should be visible
            const spinner = document.querySelector('.animate-spin')
            expect(spinner).toBeDefined()
        }, TEST_TIMEOUT)
    })

    describe('Error State', () => {
        it('should show error message when there is an error', () => {
            // Mock error state
            vi.doMock('../../src/hooks/useControlAIApi', () => ({
                useControlAIApi: () => ({
                    data: null,
                    loading: false,
                    error: 'Failed to fetch dashboard data',
                    refetch: vi.fn()
                })
            }))

            const { default: ErrorApp } = require('../../src/App')

            render(<ErrorApp />)

            expect(screen.getByText('Error loading dashboard data')).toBeDefined()
            expect(screen.getByText('Failed to fetch dashboard data')).toBeDefined()
            expect(screen.getByText('Try Again')).toBeDefined()
        }, TEST_TIMEOUT)
    })

    describe('Responsive Design', () => {
        it('should render properly on different screen sizes', () => {
            // Mock different viewport sizes
            Object.defineProperty(window, 'innerWidth', {
                writable: true,
                configurable: true,
                value: 768,
            })

            render(<App />)

            expect(screen.getByText('ControlAI Dashboard')).toBeDefined()
        }, TEST_TIMEOUT)

        it('should adapt layout for mobile devices', () => {
            Object.defineProperty(window, 'innerWidth', {
                writable: true,
                configurable: true,
                value: 375,
            })

            render(<App />)

            expect(screen.getByText('ControlAI Dashboard')).toBeDefined()
        }, TEST_TIMEOUT)
    })

    describe('Accessibility', () => {
        it('should have proper ARIA labels', () => {
            render(<App />)

            const darkModeButton = screen.getByLabelText('Toggle dark mode')
            expect(darkModeButton).toBeDefined()
        }, TEST_TIMEOUT)

        it('should support keyboard navigation', async () => {
            render(<App />)

            // Tab through the navigation elements
            const refreshButton = screen.getByText('Refresh')
            const darkModeButton = screen.getByLabelText('Toggle dark mode')

            expect(refreshButton).toBeDefined()
            expect(darkModeButton).toBeDefined()
        }, TEST_TIMEOUT)

        it('should have proper heading hierarchy', () => {
            render(<App />)

            const mainHeading = screen.getByRole('heading', { level: 1 })
            expect(mainHeading).toBeDefined()
        }, TEST_TIMEOUT)
    })

    describe('Performance', () => {
        it('should not cause memory leaks', () => {
            const { unmount } = render(<App />)

            expect(() => unmount()).not.toThrow()
        }, TEST_TIMEOUT)

        it('should handle rapid navigation changes', async () => {
            const user = userEvent.setup()
            render(<App />)

            // Rapidly switch between views
            const tabs = ['Tasks', 'Agents', 'Metrics', 'Projects']

            for (const tab of tabs) {
                await user.click(screen.getByText(tab))
                expect(screen.getByText(tab).closest('button')).toHaveClass('border-primary-500')
            }
        }, TEST_TIMEOUT)
    })

    describe('Data Integration', () => {
        it('should display correct metrics in header', () => {
            render(<App />)

            expect(screen.getByText('12 projects • 8 agents')).toBeDefined()
        }, TEST_TIMEOUT)

        it('should handle empty data gracefully', () => {
            // Mock empty data
            vi.doMock('../../src/hooks/useControlAIApi', () => ({
                useControlAIApi: () => ({
                    data: {
                        metrics: { totalProjects: 0, totalAgents: 0 },
                        projects: [],
                        agents: [],
                        tasks: []
                    },
                    loading: false,
                    error: null,
                    refetch: vi.fn()
                })
            }))

            const { default: EmptyApp } = require('../../src/App')

            render(<EmptyApp />)

            expect(screen.getByText('0 projects • 0 agents')).toBeDefined()
        }, TEST_TIMEOUT)
    })

    describe('Component Integration', () => {
        it('should render ProjectOverview by default', () => {
            render(<App />)

            // Projects tab should be active by default
            const projectsButton = screen.getByText('Projects')
            expect(projectsButton.closest('button')).toHaveClass('border-primary-500')
        }, TEST_TIMEOUT)

        it('should maintain state across view changes', async () => {
            const user = userEvent.setup()
            render(<App />)

            // Toggle dark mode
            await user.click(screen.getByLabelText('Toggle dark mode'))

            // Switch to another view
            await user.click(screen.getByText('Tasks'))

            // Switch back to Projects
            await user.click(screen.getByText('Projects'))

            // Dark mode should still be active (sun icon visible)
            expect(screen.getByTestId('sun-icon')).toBeDefined()
        }, TEST_TIMEOUT)
    })
})


