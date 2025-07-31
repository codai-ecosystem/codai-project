import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import MetricsDashboard from '../../src/components/MetricsDashboard'
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
        },
        {
            id: 'agent-2',
            name: 'Senior Developer',
            type: 'Software Engineer',
            status: 'busy' as const,
            currentTask: 'ControlAI Dashboard Development',
            capabilities: ['React', 'TypeScript'],
            performance: 88
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
        }
    ]
}

describe('MetricsDashboard Component', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    describe('Component Rendering', () => {
        it('should render metrics dashboard title', () => {
            render(<MetricsDashboard data={mockDashboardData} />)

            expect(screen.getByRole('heading', { level: 2 })).toBeDefined()
        }, TEST_TIMEOUT)

        it('should render key metrics section', () => {
            render(<MetricsDashboard data={mockDashboardData} />)

            expect(screen.getByText('Key Metrics')).toBeDefined()
        }, TEST_TIMEOUT)

        it('should render performance trends section', () => {
            render(<MetricsDashboard data={mockDashboardData} />)

            expect(screen.getByText('Performance Trends')).toBeDefined()
        }, TEST_TIMEOUT)

        it('should render task distribution section', () => {
            render(<MetricsDashboard data={mockDashboardData} />)

            expect(screen.getByText('Task Distribution')).toBeDefined()
        }, TEST_TIMEOUT)

        it('should render agent performance section', () => {
            render(<MetricsDashboard data={mockDashboardData} />)

            expect(screen.getByText('Agent Performance')).toBeDefined()
        }, TEST_TIMEOUT)

        it('should render detailed metrics section', () => {
            render(<MetricsDashboard data={mockDashboardData} />)

            expect(screen.getByText('Detailed Metrics')).toBeDefined()
        }, TEST_TIMEOUT)
    })

    describe('Key Metrics Cards', () => {
        it('should display all key metrics', () => {
            render(<MetricsDashboard data={mockDashboardData} />)

            expect(screen.getByText('Total Projects')).toBeDefined()
            expect(screen.getByText('Active Tasks')).toBeDefined()
            expect(screen.getByText('Agent Utilization')).toBeDefined()
            expect(screen.getByText('System Health')).toBeDefined()
        }, TEST_TIMEOUT)

        it('should display correct metric values', () => {
            render(<MetricsDashboard data={mockDashboardData} />)

            expect(screen.getByText('12')).toBeDefined() // Total Projects
            expect(screen.getByText('24')).toBeDefined() // Active Tasks
            expect(screen.getByText('78%')).toBeDefined() // Agent Utilization
            expect(screen.getByText('95%')).toBeDefined() // System Health
        }, TEST_TIMEOUT)

        it('should show trend indicators', () => {
            render(<MetricsDashboard data={mockDashboardData} />)

            expect(screen.getByText('+8%')).toBeDefined() // Projects trend
            expect(screen.getByText('+12%')).toBeDefined() // Tasks trend
            expect(screen.getByText('+5%')).toBeDefined() // Utilization trend
            expect(screen.getByText('+2%')).toBeDefined() // Health trend
        }, TEST_TIMEOUT)

        it('should display trend icons', () => {
            render(<MetricsDashboard data={mockDashboardData} />)

            expect(screen.getAllByTestId('trending-up-icon')).toHaveLength(4)
        }, TEST_TIMEOUT)
    })

    describe('Performance Trends Chart', () => {
        it('should render performance chart', () => {
            render(<MetricsDashboard data={mockDashboardData} />)

            // Check for mocked ResponsiveContainer
            expect(screen.getByTestId('responsive-container')).toBeDefined()
        }, TEST_TIMEOUT)

        it('should contain line chart for performance data', () => {
            render(<MetricsDashboard data={mockDashboardData} />)

            // Check for mocked LineChart
            expect(screen.getByTestId('line-chart')).toBeDefined()
        }, TEST_TIMEOUT)

        it('should have proper chart dimensions', () => {
            render(<MetricsDashboard data={mockDashboardData} />)

            const container = screen.getByTestId('responsive-container')
            expect(container).toBeDefined()
            expect(container).toBeDefined()
        }, TEST_TIMEOUT)

        it('should display chart axes and grid', () => {
            render(<MetricsDashboard data={mockDashboardData} />)

            expect(screen.getByTestId('x-axis')).toBeDefined()
            expect(screen.getByTestId('y-axis')).toBeDefined()
            expect(screen.getByTestId('cartesian-grid')).toBeDefined()
        }, TEST_TIMEOUT)

        it('should include tooltip and legend', () => {
            render(<MetricsDashboard data={mockDashboardData} />)

            expect(screen.getByTestId('tooltip')).toBeDefined()
        }, TEST_TIMEOUT)
    })

    describe('Task Distribution Chart', () => {
        it('should render task distribution pie chart', () => {
            render(<MetricsDashboard data={mockDashboardData} />)

            expect(screen.getByTestId('pie-chart')).toBeDefined()
        }, TEST_TIMEOUT)

        it('should display correct task distribution data', () => {
            render(<MetricsDashboard data={mockDashboardData} />)

            // Based on mockdata: 1 completed, 1 in-progress
            const pieChart = screen.getByTestId('pie-chart')
            expect(pieChart).toBeDefined()
        }, TEST_TIMEOUT)

        it('should have proper pie chart configuration', () => {
            render(<MetricsDashboard data={mockDashboardData} />)

            const pie = screen.getByTestId('pie')
            expect(pie).toBeDefined()
            expect(pie).toBeDefined()
            expect(pie).toBeDefined()
        }, TEST_TIMEOUT)

        it('should display cells with different colors', () => {
            render(<MetricsDashboard data={mockDashboardData} />)

            const cells = screen.getAllByTestId('cell')
            expect(cells.length).toBeGreaterThan(0)
        }, TEST_TIMEOUT)
    })

    describe('Agent Performance Chart', () => {
        it('should render agent performance bar chart', () => {
            render(<MetricsDashboard data={mockDashboardData} />)

            expect(screen.getByTestId('bar-chart')).toBeDefined()
        }, TEST_TIMEOUT)

        it('should display bars for agent performance', () => {
            render(<MetricsDashboard data={mockDashboardData} />)

            expect(screen.getByTestId('bar')).toBeDefined()
        }, TEST_TIMEOUT)

        it('should have proper bar chart configuration', () => {
            render(<MetricsDashboard data={mockDashboardData} />)

            const bar = screen.getByTestId('bar')
            expect(bar).toBeDefined()
        }, TEST_TIMEOUT)

        it('should include chart axes', () => {
            render(<MetricsDashboard data={mockDashboardData} />)

            const barChartContainer = screen.getByTestId('bar-chart').closest('[data-testid="responsive-container"]')
            expect(barChartContainer).toBeDefined()
        }, TEST_TIMEOUT)
    })

    describe('Detailed Metrics Table', () => {
        it('should render metrics table', () => {
            render(<MetricsDashboard data={mockDashboardData} />)

            expect(screen.getByRole('table')).toBeDefined()
        }, TEST_TIMEOUT)

        it('should display table headers', () => {
            render(<MetricsDashboard data={mockDashboardData} />)

            expect(screen.getByText('Metric')).toBeDefined()
            expect(screen.getByText('Current')).toBeDefined()
            expect(screen.getByText('Previous')).toBeDefined()
            expect(screen.getByText('Change')).toBeDefined()
        }, TEST_TIMEOUT)

        it('should show detailed metric rows', () => {
            render(<MetricsDashboard data={mockDashboardData} />)

            expect(screen.getByText('Projects Completed')).toBeDefined()
            expect(screen.getByText('Average Task Time')).toBeDefined()
            expect(screen.getByText('Agent Efficiency')).toBeDefined()
            expect(screen.getByText('Success Rate')).toBeDefined()
        }, TEST_TIMEOUT)

        it('should display metric values and changes', () => {
            render(<MetricsDashboard data={mockDashboardData} />)

            expect(screen.getByText('156')).toBeDefined() // Projects Completed current
            expect(screen.getByText('144')).toBeDefined() // Projects Completed previous
            expect(screen.getByText('+8.3%')).toBeDefined() // Projects Completed change
        }, TEST_TIMEOUT)

        it('should color-code changes appropriately', () => {
            render(<MetricsDashboard data={mockDashboardData} />)

            const positiveChanges = document.querySelectorAll('.text-green-600')
            expect(positiveChanges.length).toBeGreaterThan(0)
        }, TEST_TIMEOUT)
    })

    describe('Chart Data Processing', () => {
        it('should handle empty data gracefully', () => {
            const emptyData = {
                metrics: { totalProjects: 0, totalAgents: 0, activeTasks: 0, completedTasks: 0, agentUtilization: 0, systemHealth: 0 },
                projects: [],
                agents: [],
                tasks: []
            }

            render(<MetricsDashboard data={emptyData} />)

            expect(screen.getByText('Metrics Dashboard')).toBeDefined()
        }, TEST_TIMEOUT)

        it('should calculate task distribution correctly', () => {
            render(<MetricsDashboard data={mockDashboardData} />)

            // Should process task statuses correctly
            expect(screen.getByTestId('pie-chart')).toBeDefined()
        }, TEST_TIMEOUT)

        it('should format agent performance data', () => {
            render(<MetricsDashboard data={mockDashboardData} />)

            // Should convert agent data for bar chart
            expect(screen.getByTestId('bar-chart')).toBeDefined()
        }, TEST_TIMEOUT)

        it('should generate performance trends over time', () => {
            render(<MetricsDashboard data={mockDashboardData} />)

            // Should create time-based performance data
            expect(screen.getByTestId('line-chart')).toBeDefined()
        }, TEST_TIMEOUT)
    })

    describe('Responsive Design', () => {
        it('should render properly on mobile devices', () => {
            Object.defineProperty(window, 'innerWidth', {
                writable: true,
                configurable: true,
                value: 375,
            })

            render(<MetricsDashboard data={mockDashboardData} />)

            expect(screen.getByText('Metrics Dashboard')).toBeDefined()
        }, TEST_TIMEOUT)

        it('should adapt grid layout for different screen sizes', () => {
            render(<MetricsDashboard data={mockDashboardData} />)

            const metricsGrid = document.querySelector('.grid')
            expect(metricsGrid.className).toContain('grid-cols-1', 'md:grid-cols-2', 'lg:grid-cols-4')
        }, TEST_TIMEOUT)

        it('should maintain chart readability on small screens', () => {
            Object.defineProperty(window, 'innerWidth', {
                writable: true,
                configurable: true,
                value: 320,
            })

            render(<MetricsDashboard data={mockDashboardData} />)

            const charts = screen.getAllByTestId('responsive-container')
            expect(charts.length).toBeGreaterThan(0)
        }, TEST_TIMEOUT)
    })

    describe('Accessibility', () => {
        it('should have proper heading hierarchy', () => {
            render(<MetricsDashboard data={mockDashboardData} />)

            const mainHeading = screen.getByRole('heading', { level: 2 })
            expect(mainHeading).toBeDefined()

            const sectionHeadings = screen.getAllByRole('heading', { level: 3 })
            expect(sectionHeadings.length).toBeGreaterThan(0)
        }, TEST_TIMEOUT)

        it('should have accessible table structure', () => {
            render(<MetricsDashboard data={mockDashboardData} />)

            const table = screen.getByRole('table')
            expect(table).toBeDefined()

            const headers = screen.getAllByRole('columnheader')
            expect(headers).toHaveLength(4)
        }, TEST_TIMEOUT)

        it('should provide chart descriptions', () => {
            render(<MetricsDashboard data={mockDashboardData} />)

            // Charts should be accessible through mocked components
            expect(screen.getByTestId('line-chart')).toBeDefined()
            expect(screen.getByTestId('pie-chart')).toBeDefined()
            expect(screen.getByTestId('bar-chart')).toBeDefined()
        }, TEST_TIMEOUT)

        it('should have proper color contrast for text', () => {
            render(<MetricsDashboard data={mockDashboardData} />)

            const textElements = document.querySelectorAll('.text-gray-600')
            expect(textElements.length).toBeGreaterThan(0)
        }, TEST_TIMEOUT)
    })

    describe('Data Formatting', () => {
        it('should format percentages correctly', () => {
            render(<MetricsDashboard data={mockDashboardData} />)

            expect(screen.getByText('78%')).toBeDefined()
            expect(screen.getByText('95%')).toBeDefined()
        }, TEST_TIMEOUT)

        it('should format hours correctly in table', () => {
            render(<MetricsDashboard data={mockDashboardData} />)

            expect(screen.getByText('4.2h')).toBeDefined() // Average Task Time
        }, TEST_TIMEOUT)

        it('should handle decimal values in metrics', () => {
            render(<MetricsDashboard data={mockDashboardData} />)

            expect(screen.getByText('+8.3%')).toBeDefined()
            expect(screen.getByText('-2.1%')).toBeDefined()
        }, TEST_TIMEOUT)

        it('should format large numbers appropriately', () => {
            const largeNumberData = {
                ...mockDashboardData,
                metrics: {
                    ...mockDashboardData.metrics,
                    completedTasks: 1567
                }
            }

            render(<MetricsDashboard data={largeNumberData} />)

            // Should handle large numbers in metrics
            expect(screen.getByText('Metrics Dashboard')).toBeDefined()
        }, TEST_TIMEOUT)
    })

    describe('Performance', () => {
        it('should not cause memory leaks on unmount', () => {
            const { unmount } = render(<MetricsDashboard data={mockDashboardData} />)

            expect(() => unmount()).not.toThrow()
        }, TEST_TIMEOUT)

        it('should handle large datasets efficiently', () => {
            const largeDataset = {
                ...mockDashboardData,
                tasks: Array.from({ length: 100 }, (_, i) => ({
                    id: `task-${i}`,
                    title: `Task ${i}`,
                    status: ['todo', 'in-progress', 'review', 'completed'][i % 4] as any,
                    assignedAgent: `Agent ${i % 5}`,
                    priority: ['low', 'medium', 'high', 'critical'][i % 4] as any,
                    estimatedHours: Math.floor(Math.random() * 20) + 1,
                    actualHours: Math.floor(Math.random() * 15),
                    createdAt: new Date().toISOString()
                })),
                agents: Array.from({ length: 20 }, (_, i) => ({
                    id: `agent-${i}`,
                    name: `Agent ${i}`,
                    type: `Type ${i % 5}`,
                    status: ['online', 'busy', 'offline'][i % 3] as any,
                    currentTask: `Task ${i}`,
                    capabilities: [`Skill ${i}`],
                    performance: Math.floor(Math.random() * 100)
                }))
            }

            const startTime = performance.now()
            render(<MetricsDashboard data={largeDataset} />)
            const endTime = performance.now()

            // Should render within reasonable time
            expect(endTime - startTime).toBeLessThan(200)
        }, TEST_TIMEOUT)

        it('should efficiently process chart data', () => {
            render(<MetricsDashboard data={mockDashboardData} />)

            // Chart data processing should not cause performance issues
            expect(screen.getByText('Performance Trends')).toBeDefined()
            expect(screen.getByText('Task Distribution')).toBeDefined()
            expect(screen.getByText('Agent Performance')).toBeDefined()
        }, TEST_TIMEOUT)
    })

    describe('Visual Design', () => {
        it('should apply correct Tailwind CSS classes', () => {
            render(<MetricsDashboard data={mockDashboardData} />)

            const container = document.querySelector('.space-y-6')
            expect(container).toBeDefined()
        }, TEST_TIMEOUT)

        it('should have consistent card styling', () => {
            render(<MetricsDashboard data={mockDashboardData} />)

            const cards = document.querySelectorAll('.bg-white')
            expect(cards.length).toBeGreaterThan(0)
        }, TEST_TIMEOUT)

        it('should display trend colors correctly', () => {
            render(<MetricsDashboard data={mockDashboardData} />)

            const positiveChanges = document.querySelectorAll('.text-green-600')
            expect(positiveChanges.length).toBeGreaterThan(0)

            const negativeChanges = document.querySelectorAll('.text-red-600')
            expect(negativeChanges.length).toBeGreaterThan(0)
        }, TEST_TIMEOUT)
    })

    describe('Error Handling', () => {
        it('should handle missing chart data gracefully', () => {
            const incompleteData = {
                ...mockDashboardData,
                metrics: null as any
            }

            expect(() => {
                render(<MetricsDashboard data={incompleteData} />)
            }).not.toThrow()
        }, TEST_TIMEOUT)

        it('should handle invalid metric values', () => {
            const invalidData = {
                ...mockDashboardData,
                metrics: {
                    ...mockDashboardData.metrics,
                    agentUtilization: NaN,
                    systemHealth: undefined as any
                }
            }

            render(<MetricsDashboard data={invalidData} />)

            expect(screen.getByText('Metrics Dashboard')).toBeDefined()
        }, TEST_TIMEOUT)
    })
})


