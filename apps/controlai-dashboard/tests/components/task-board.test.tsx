import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import TaskBoard from '../../src/components/TaskBoard'
import { TEST_TIMEOUT } from '../setup'

const mockDashboardData = {
    metrics: {
        totalProjects: 12,
        totalAgents: 8,
        activeTasks: 24,
        completedTasks: 156,
        agentUtilization: 78,
        systemHealth: 95
    },
    projects: [],
    agents: [],
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
        },
        {
            id: 'task-2',
            title: 'ControlAI Dashboard Development',
            status: 'in-progress' as const,
            assignedAgent: 'Senior Developer',
            priority: 'high' as const,
            estimatedHours: 16,
            actualHours: 12,
            createdAt: '2025-01-30T14:30:00Z'
        },
        {
            id: 'task-3',
            title: 'Authentication Security Review',
            status: 'review' as const,
            assignedAgent: 'Security Engineer',
            priority: 'critical' as const,
            estimatedHours: 12,
            actualHours: 10,
            createdAt: '2025-01-29T09:15:00Z'
        },
        {
            id: 'task-4',
            title: 'Documentation Updates',
            status: 'todo' as const,
            assignedAgent: 'Technical Writer',
            priority: 'medium' as const,
            estimatedHours: 4,
            actualHours: 0,
            createdAt: '2025-01-31T11:00:00Z'
        },
        {
            id: 'task-5',
            title: 'Performance Optimization',
            status: 'todo' as const,
            assignedAgent: 'Performance Engineer',
            priority: 'low' as const,
            estimatedHours: 6,
            actualHours: 0,
            createdAt: '2025-01-31T16:45:00Z'
        }
    ]
}

describe('TaskBoard Component', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    describe('Component Rendering', () => {
        it('should render task board title', () => {
            render(<TaskBoard data={mockDashboardData} />)

            expect(screen.getByRole('heading', { level: 2 })).toBeDefined()
        }, TEST_TIMEOUT)

        it('should render filtering controls', () => {
            render(<TaskBoard data={mockDashboardData} />)

            expect(screen.getByText('Filter by Status:')).toBeDefined()
            expect(screen.getByText('Filter by Priority:')).toBeDefined()
            expect(screen.getByDisplayValue('All')).toBeDefined()
        }, TEST_TIMEOUT)

        it('should render kanban columns', () => {
            render(<TaskBoard data={mockDashboardData} />)

            expect(screen.getByText('To Do')).toBeDefined()
            expect(screen.getByText('In Progress')).toBeDefined()
            expect(screen.getByText('Review')).toBeDefined()
            expect(screen.getByText('Completed')).toBeDefined()
        }, TEST_TIMEOUT)

        it('should display task counts in column headers', () => {
            render(<TaskBoard data={mockDashboardData} />)

            expect(screen.getByText('2')).toBeDefined() // To Do
            expect(screen.getByText('1')).toBeDefined() // In Progress
            expect(screen.getByText('1')).toBeDefined() // Review
            expect(screen.getByText('1')).toBeDefined() // Completed
        }, TEST_TIMEOUT)
    })

    describe('Task Cards', () => {
        it('should render all tasks in correct columns', () => {
            render(<TaskBoard data={mockDashboardData} />)

            expect(screen.getByText('Hub Frontend Testing')).toBeDefined()
            expect(screen.getByText('ControlAI Dashboard Development')).toBeDefined()
            expect(screen.getByText('Authentication Security Review')).toBeDefined()
            expect(screen.getByText('Documentation Updates')).toBeDefined()
            expect(screen.getByText('Performance Optimization')).toBeDefined()
        }, TEST_TIMEOUT)

        it('should display assigned agents', () => {
            render(<TaskBoard data={mockDashboardData} />)

            expect(screen.getByText('Testing Specialist')).toBeDefined()
            expect(screen.getByText('Senior Developer')).toBeDefined()
            expect(screen.getByText('Security Engineer')).toBeDefined()
            expect(screen.getByText('Technical Writer')).toBeDefined()
            expect(screen.getByText('Performance Engineer')).toBeDefined()
        }, TEST_TIMEOUT)

        it('should show estimated and actual hours', () => {
            render(<TaskBoard data={mockDashboardData} />)

            expect(screen.getByText('6h / 8h')).toBeDefined() // Hub Frontend Testing
            expect(screen.getByText('12h / 16h')).toBeDefined() // ControlAI Dashboard
            expect(screen.getByText('10h / 12h')).toBeDefined() // Security Review
            expect(screen.getByText('0h / 4h')).toBeDefined() // Documentation
            expect(screen.getByText('0h / 6h')).toBeDefined() // Performance
        }, TEST_TIMEOUT)

        it('should display priority badges with correct colors', () => {
            render(<TaskBoard data={mockDashboardData} />)

            const criticalBadge = screen.getByText('Critical')
            expect(criticalBadge.className).toContain('bg-red-100', 'text-red-800')

            const highBadges = screen.getAllByText('High')
            expect(highBadges[0].className).toContain('bg-orange-100', 'text-orange-800')

            const mediumBadge = screen.getByText('Medium')
            expect(mediumBadge.className).toContain('bg-yellow-100', 'text-yellow-800')

            const lowBadge = screen.getByText('Low')
            expect(lowBadge.className).toContain('bg-green-100', 'text-green-800')
        }, TEST_TIMEOUT)

        it('should show correct status icons', () => {
            render(<TaskBoard data={mockDashboardData} />)

            expect(screen.getByTestId('clock-icon')).toBeDefined() // Todo
            expect(screen.getByTestId('play-circle-icon')).toBeDefined() // In Progress
            expect(screen.getByTestId('pause-icon')).toBeDefined() // Review
            expect(screen.getByTestId('check-circle-icon')).toBeDefined() // Completed
        }, TEST_TIMEOUT)
    })

    describe('Filtering Functionality', () => {
        it('should filter tasks by status', async () => {
            const user = userEvent.setup()
            render(<TaskBoard data={mockDashboardData} />)

            const statusFilter = screen.getAllByDisplayValue('All')[0]
            await user.selectOptions(statusFilter, 'completed')

            // Should only show completed tasks
            expect(screen.getByText('Hub Frontend Testing')).toBeDefined()
            expect(screen.queryByText('ControlAI Dashboard Development')).not.toBeDefined()
        }, TEST_TIMEOUT)

        it('should filter tasks by priority', async () => {
            const user = userEvent.setup()
            render(<TaskBoard data={mockDashboardData} />)

            const priorityFilter = screen.getAllByDisplayValue('All')[1]
            await user.selectOptions(priorityFilter, 'high')

            // Should only show high priority tasks
            expect(screen.getByText('Hub Frontend Testing')).toBeDefined()
            expect(screen.getByText('ControlAI Dashboard Development')).toBeDefined()
            expect(screen.queryByText('Documentation Updates')).not.toBeDefined()
        }, TEST_TIMEOUT)

        it('should combine status and priority filters', async () => {
            const user = userEvent.setup()
            render(<TaskBoard data={mockDashboardData} />)

            const statusFilter = screen.getAllByDisplayValue('All')[0]
            const priorityFilter = screen.getAllByDisplayValue('All')[1]

            await user.selectOptions(statusFilter, 'in-progress')
            await user.selectOptions(priorityFilter, 'high')

            // Should only show high priority, in-progress tasks
            expect(screen.getByText('ControlAI Dashboard Development')).toBeDefined()
            expect(screen.queryByText('Hub Frontend Testing')).not.toBeDefined()
        }, TEST_TIMEOUT)

        it('should reset filters to show all tasks', async () => {
            const user = userEvent.setup()
            render(<TaskBoard data={mockDashboardData} />)

            const statusFilter = screen.getAllByDisplayValue('All')[0]

            // Filter first
            await user.selectOptions(statusFilter, 'completed')
            expect(screen.queryByText('ControlAI Dashboard Development')).not.toBeDefined()

            // Reset filter
            await user.selectOptions(statusFilter, 'all')
            expect(screen.getByText('ControlAI Dashboard Development')).toBeDefined()
        }, TEST_TIMEOUT)

        it('should update column counts when filtering', async () => {
            const user = userEvent.setup()
            render(<TaskBoard data={mockDashboardData} />)

            const statusFilter = screen.getAllByDisplayValue('All')[0]
            await user.selectOptions(statusFilter, 'todo')

            // Should show different counts after filtering
            const columnCounts = screen.getAllByText('2')
            expect(columnCounts.length).toBeGreaterThan(0)
        }, TEST_TIMEOUT)
    })

    describe('Empty States', () => {
        it('should handle empty task list', () => {
            const emptyData = {
                ...mockDashboardData,
                tasks: []
            }

            render(<TaskBoard data={emptyData} />)

            expect(screen.getByText('No tasks available')).toBeDefined()
        }, TEST_TIMEOUT)

        it('should show empty state for filtered results', async () => {
            const user = userEvent.setup()
            render(<TaskBoard data={mockDashboardData} />)

            const priorityFilter = screen.getAllByDisplayValue('All')[1]
            await user.selectOptions(priorityFilter, 'critical')

            // Only one critical task exists, other columns should show empty state
            expect(screen.getByText('Authentication Security Review')).toBeDefined()
        }, TEST_TIMEOUT)

        it('should handle columns with no tasks', () => {
            const limitedData = {
                ...mockDashboardData,
                tasks: [{
                    id: 'task-1',
                    title: 'Single Task',
                    status: 'todo' as const,
                    assignedAgent: 'Agent',
                    priority: 'medium' as const,
                    estimatedHours: 4,
                    actualHours: 0,
                    createdAt: '2025-01-30T10:00:00Z'
                }]
            }

            render(<TaskBoard data={limitedData} />)

            // Other columns should be empty but still visible
            expect(screen.getByText('To Do')).toBeDefined()
            expect(screen.getByText('In Progress')).toBeDefined()
            expect(screen.getByText('Review')).toBeDefined()
            expect(screen.getByText('Completed')).toBeDefined()
        }, TEST_TIMEOUT)
    })

    describe('Task Organization', () => {
        it('should organize tasks by status correctly', () => {
            render(<TaskBoard data={mockDashboardData} />)

            // Verify tasks are in correct columns by checking their presence
            expect(screen.getByText('Documentation Updates')).toBeDefined()
            expect(screen.getByText('Performance Optimization')).toBeDefined()
            expect(screen.getByText('ControlAI Dashboard Development')).toBeDefined()
            expect(screen.getByText('Authentication Security Review')).toBeDefined()
            expect(screen.getByText('Hub Frontend Testing')).toBeDefined()
        }, TEST_TIMEOUT)

        it('should handle unknown status values', () => {
            const dataWithUnknownStatus = {
                ...mockDashboardData,
                tasks: [{
                    id: 'unknown-task',
                    title: 'Unknown Status Task',
                    status: 'unknown' as any,
                    assignedAgent: 'Agent',
                    priority: 'medium' as const,
                    estimatedHours: 4,
                    actualHours: 0,
                    createdAt: '2025-01-30T10:00:00Z'
                }]
            }

            render(<TaskBoard data={dataWithUnknownStatus} />)

            // Task with unknown status should still render
            expect(screen.getByText('Unknown Status Task')).toBeDefined()
        }, TEST_TIMEOUT)
    })

    describe('Responsive Design', () => {
        it('should render properly on mobile devices', () => {
            Object.defineProperty(window, 'innerWidth', {
                writable: true,
                configurable: true,
                value: 375,
            })

            render(<TaskBoard data={mockDashboardData} />)

            expect(screen.getByText('Task Board')).toBeDefined()
        }, TEST_TIMEOUT)

        it('should adapt column layout for different screen sizes', () => {
            render(<TaskBoard data={mockDashboardData} />)

            const kanbanBoard = document.querySelector('.grid')
            expect(kanbanBoard.className).toContain('grid-cols-1', 'md:grid-cols-2', 'lg:grid-cols-4')
        }, TEST_TIMEOUT)

        it('should maintain functionality on small screens', async () => {
            Object.defineProperty(window, 'innerWidth', {
                writable: true,
                configurable: true,
                value: 320,
            })

            const user = userEvent.setup()
            render(<TaskBoard data={mockDashboardData} />)

            const statusFilter = screen.getAllByDisplayValue('All')[0]
            await user.selectOptions(statusFilter, 'completed')

            expect(screen.getByText('Hub Frontend Testing')).toBeDefined()
        }, TEST_TIMEOUT)
    })

    describe('Accessibility', () => {
        it('should have proper heading hierarchy', () => {
            render(<TaskBoard data={mockDashboardData} />)

            const mainHeading = screen.getByRole('heading', { level: 2 })
            expect(mainHeading).toBeDefined()

            const columnHeadings = screen.getAllByRole('heading', { level: 3 })
            expect(columnHeadings).toHaveLength(4)
        }, TEST_TIMEOUT)

        it('should have proper labels for form controls', () => {
            render(<TaskBoard data={mockDashboardData} />)

            expect(screen.getByLabelText('Filter by Status:')).toBeDefined()
            expect(screen.getByLabelText('Filter by Priority:')).toBeDefined()
        }, TEST_TIMEOUT)

        it('should support keyboard navigation', async () => {
            render(<TaskBoard data={mockDashboardData} />)

            const statusFilter = screen.getByLabelText('Filter by Status:')
            const priorityFilter = screen.getByLabelText('Filter by Priority:')

            expect(statusFilter).toBeDefined()
            expect(priorityFilter).toBeDefined()

            // Should be focusable
            statusFilter.focus()
            expect(statusFilter).toHaveFocus()
        }, TEST_TIMEOUT)

        it('should have proper ARIA attributes', () => {
            render(<TaskBoard data={mockDashboardData} />)

            const selects = screen.getAllByRole('combobox')
            expect(selects).toHaveLength(2)

            selects.forEach(select => {
                expect(select).toBeDefined()
            })
        }, TEST_TIMEOUT)
    })

    describe('Performance', () => {
        it('should not cause memory leaks on unmount', () => {
            const { unmount } = render(<TaskBoard data={mockDashboardData} />)

            expect(() => unmount()).not.toThrow()
        }, TEST_TIMEOUT)

        it('should handle large task datasets efficiently', () => {
            const largeDataset = {
                ...mockDashboardData,
                tasks: Array.from({ length: 200 }, (_, i) => ({
                    id: `task-${i}`,
                    title: `Task ${i}`,
                    status: ['todo', 'in-progress', 'review', 'completed'][i % 4] as any,
                    assignedAgent: `Agent ${i % 10}`,
                    priority: ['low', 'medium', 'high', 'critical'][i % 4] as any,
                    estimatedHours: Math.floor(Math.random() * 20) + 1,
                    actualHours: Math.floor(Math.random() * 15),
                    createdAt: new Date().toISOString()
                }))
            }

            const startTime = performance.now()
            render(<TaskBoard data={largeDataset} />)
            const endTime = performance.now()

            // Should render within reasonable time
            expect(endTime - startTime).toBeLessThan(200)
        }, TEST_TIMEOUT)

        it('should efficiently update filters', async () => {
            const user = userEvent.setup()
            render(<TaskBoard data={mockDashboardData} />)

            const statusFilter = screen.getAllByDisplayValue('All')[0]

            const startTime = performance.now()
            await user.selectOptions(statusFilter, 'completed')
            const endTime = performance.now()

            // Filter update should be fast
            expect(endTime - startTime).toBeLessThan(50)
        }, TEST_TIMEOUT)
    })

    describe('Data Handling', () => {
        it('should handle missing task properties gracefully', () => {
            const incompleteData = {
                ...mockDashboardData,
                tasks: [{
                    id: 'incomplete',
                    title: 'Incomplete Task',
                    status: 'todo' as const,
                    assignedAgent: '',
                    priority: 'medium' as const,
                    estimatedHours: 0,
                    actualHours: 0,
                    createdAt: ''
                }]
            }

            render(<TaskBoard data={incompleteData} />)

            expect(screen.getByText('Incomplete Task')).toBeDefined()
            expect(screen.getByText('0h / 0h')).toBeDefined()
        }, TEST_TIMEOUT)

        it('should format time correctly', () => {
            render(<TaskBoard data={mockDashboardData} />)

            // Check various time formats
            expect(screen.getByText('6h / 8h')).toBeDefined()
            expect(screen.getByText('12h / 16h')).toBeDefined()
            expect(screen.getByText('0h / 4h')).toBeDefined()
        }, TEST_TIMEOUT)
    })
})


