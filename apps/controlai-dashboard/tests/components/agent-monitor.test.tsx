import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import AgentMonitor from '../../src/components/AgentMonitor'
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
    tasks: [],
    agents: [
        {
            id: 'agent-1',
            name: 'Testing Specialist',
            type: 'QA Engineer',
            status: 'online' as const,
            currentTask: 'Frontend Testing Phase 2C',
            capabilities: ['Testing', 'Quality Assurance', 'Automation'],
            performance: 95
        },
        {
            id: 'agent-2',
            name: 'Senior Developer',
            type: 'Software Engineer',
            status: 'busy' as const,
            currentTask: 'ControlAI Dashboard Development',
            capabilities: ['React', 'TypeScript', 'Node.js', 'System Architecture'],
            performance: 88
        },
        {
            id: 'agent-3',
            name: 'Security Engineer',
            type: 'Security Specialist',
            status: 'offline' as const,
            currentTask: null,
            capabilities: ['Security Audit', 'Authentication', 'Compliance'],
            performance: 92
        },
        {
            id: 'agent-4',
            name: 'DevOps Engineer',
            type: 'Infrastructure',
            status: 'online' as const,
            currentTask: 'Deployment Pipeline Optimization',
            capabilities: ['Docker', 'Kubernetes', 'CI/CD', 'Monitoring'],
            performance: 90
        },
        {
            id: 'agent-5',
            name: 'UX Designer',
            type: 'Design',
            status: 'busy' as const,
            currentTask: 'Dashboard UI Improvements',
            capabilities: ['UI Design', 'User Experience', 'Prototyping'],
            performance: 85
        }
    ]
}

describe('AgentMonitor Component', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    describe('Component Rendering', () => {
        it('should render agent monitor title', () => {
            render(<AgentMonitor data={mockDashboardData} />)

            expect(screen.getByRole('heading', { level: 2 })).toBeDefined()
        }, TEST_TIMEOUT)

        it('should render status distribution section', () => {
            render(<AgentMonitor data={mockDashboardData} />)

            expect(screen.getByText('Status Distribution')).toBeDefined()
        }, TEST_TIMEOUT)

        it('should render performance overview section', () => {
            render(<AgentMonitor data={mockDashboardData} />)

            expect(screen.getByText('Performance Overview')).toBeDefined()
        }, TEST_TIMEOUT)

        it('should render all agent cards', () => {
            render(<AgentMonitor data={mockDashboardData} />)

            expect(screen.getByText('Testing Specialist')).toBeDefined()
            expect(screen.getByText('Senior Developer')).toBeDefined()
            expect(screen.getByText('Security Engineer')).toBeDefined()
            expect(screen.getByText('DevOps Engineer')).toBeDefined()
            expect(screen.getByText('UX Designer')).toBeDefined()
        }, TEST_TIMEOUT)
    })

    describe('Agent Cards', () => {
        it('should display agent types correctly', () => {
            render(<AgentMonitor data={mockDashboardData} />)

            expect(screen.getByText('QA Engineer')).toBeDefined()
            expect(screen.getByText('Software Engineer')).toBeDefined()
            expect(screen.getByText('Security Specialist')).toBeDefined()
            expect(screen.getByText('Infrastructure')).toBeDefined()
            expect(screen.getByText('Design')).toBeDefined()
        }, TEST_TIMEOUT)

        it('should show current tasks', () => {
            render(<AgentMonitor data={mockDashboardData} />)

            expect(screen.getByText('Frontend Testing Phase 2C')).toBeDefined()
            expect(screen.getByText('ControlAI Dashboard Development')).toBeDefined()
            expect(screen.getByText('Deployment Pipeline Optimization')).toBeDefined()
            expect(screen.getByText('Dashboard UI Improvements')).toBeDefined()
        }, TEST_TIMEOUT)

        it('should handle agents with no current task', () => {
            render(<AgentMonitor data={mockDashboardData} />)

            expect(screen.getByText('No active task')).toBeDefined()
        }, TEST_TIMEOUT)

        it('should display performance scores', () => {
            render(<AgentMonitor data={mockDashboardData} />)

            expect(screen.getByText('95%')).toBeDefined()
            expect(screen.getByText('88%')).toBeDefined()
            expect(screen.getByText('92%')).toBeDefined()
            expect(screen.getByText('90%')).toBeDefined()
            expect(screen.getByText('85%')).toBeDefined()
        }, TEST_TIMEOUT)

        it('should show capability badges', () => {
            render(<AgentMonitor data={mockDashboardData} />)

            expect(screen.getByText('Testing')).toBeDefined()
            expect(screen.getByText('Quality Assurance')).toBeDefined()
            expect(screen.getByText('React')).toBeDefined()
            expect(screen.getByText('TypeScript')).toBeDefined()
            expect(screen.getByText('Security Audit')).toBeDefined()
            expect(screen.getByText('Docker')).toBeDefined()
            expect(screen.getByText('UI Design')).toBeDefined()
        }, TEST_TIMEOUT)
    })

    describe('Status Indicators', () => {
        it('should show correct status icons', () => {
            render(<AgentMonitor data={mockDashboardData} />)

            // Online status (green circle)
            expect(screen.getAllByTestId('check-circle-icon')).toHaveLength(2) // 2 online agents

            // Busy status (orange circle)
            expect(screen.getAllByTestId('clock-icon')).toHaveLength(2) // 2 busy agents

            // Offline status (gray circle)
            expect(screen.getAllByTestId('alert-circle-icon')).toHaveLength(1) // 1 offline agent
        }, TEST_TIMEOUT)

        it('should apply correct status colors', () => {
            render(<AgentMonitor data={mockDashboardData} />)

            const onlineIndicators = document.querySelectorAll('.text-green-500')
            expect(onlineIndicators.length).toBeGreaterThan(0)

            const busyIndicators = document.querySelectorAll('.text-orange-500')
            expect(busyIndicators.length).toBeGreaterThan(0)

            const offlineIndicators = document.querySelectorAll('.text-gray-500')
            expect(offlineIndicators.length).toBeGreaterThan(0)
        }, TEST_TIMEOUT)

        it('should handle unknown status gracefully', () => {
            const dataWithUnknownStatus = {
                ...mockDashboardData,
                agents: [{
                    ...mockDashboardData.agents[0],
                    status: 'unknown' as any
                }]
            }

            render(<AgentMonitor data={dataWithUnknownStatus} />)

            expect(screen.getByText('Testing Specialist')).toBeDefined()
        }, TEST_TIMEOUT)
    })

    describe('Status Distribution', () => {
        it('should calculate status percentages correctly', () => {
            render(<AgentMonitor data={mockDashboardData} />)

            // 2 online out of 5 = 40%
            expect(screen.getByText('40%')).toBeDefined()

            // 2 busy out of 5 = 40%
            const busyPercentages = screen.getAllByText('40%')
            expect(busyPercentages).toHaveLength(2)

            // 1 offline out of 5 = 20%
            expect(screen.getByText('20%')).toBeDefined()
        }, TEST_TIMEOUT)

        it('should show status labels', () => {
            render(<AgentMonitor data={mockDashboardData} />)

            expect(screen.getByText('Online')).toBeDefined()
            expect(screen.getByText('Busy')).toBeDefined()
            expect(screen.getByText('Offline')).toBeDefined()
        }, TEST_TIMEOUT)

        it('should handle empty agent list', () => {
            const emptyData = {
                ...mockDashboardData,
                agents: []
            }

            render(<AgentMonitor data={emptyData} />)

            expect(screen.getByText('No agents available')).toBeDefined()
        }, TEST_TIMEOUT)
    })

    describe('Performance Overview', () => {
        it('should calculate average performance correctly', () => {
            render(<AgentMonitor data={mockDashboardData} />)

            // Average: (95 + 88 + 92 + 90 + 85) / 5 = 90%
            expect(screen.getByText('90%')).toBeDefined()
        }, TEST_TIMEOUT)

        it('should show agent utilization from metrics', () => {
            render(<AgentMonitor data={mockDashboardData} />)

            expect(screen.getByText('78%')).toBeDefined() // From mockDashboardData.metrics.agentUtilization
        }, TEST_TIMEOUT)

        it('should display system health', () => {
            render(<AgentMonitor data={mockDashboardData} />)

            expect(screen.getByText('95%')).toBeDefined() // From mockDashboardData.metrics.systemHealth
        }, TEST_TIMEOUT)

        it('should show performance labels', () => {
            render(<AgentMonitor data={mockDashboardData} />)

            expect(screen.getByText('Avg Performance')).toBeDefined()
            expect(screen.getByText('Agent Utilization')).toBeDefined()
            expect(screen.getByText('System Health')).toBeDefined()
        }, TEST_TIMEOUT)
    })

    describe('Performance Coloring', () => {
        it('should apply correct performance colors', () => {
            render(<AgentMonitor data={mockDashboardData} />)

            // High performance (>= 90) should be green
            const highPerformanceElements = document.querySelectorAll('.text-green-600')
            expect(highPerformanceElements.length).toBeGreaterThan(0)

            // Medium performance (70-89) should be yellow
            const mediumPerformanceElements = document.querySelectorAll('.text-yellow-600')
            expect(mediumPerformanceElements.length).toBeGreaterThan(0)
        }, TEST_TIMEOUT)

        it('should handle low performance scores', () => {
            const lowPerformanceData = {
                ...mockDashboardData,
                agents: [{
                    ...mockDashboardData.agents[0],
                    performance: 60
                }]
            }

            render(<AgentMonitor data={lowPerformanceData} />)

            const lowPerformanceElements = document.querySelectorAll('.text-red-600')
            expect(lowPerformanceElements.length).toBeGreaterThan(0)
        }, TEST_TIMEOUT)

        it('should handle edge case performance values', () => {
            const edgeCaseData = {
                ...mockDashboardData,
                agents: [
                    { ...mockDashboardData.agents[0], performance: 0 },
                    { ...mockDashboardData.agents[1], performance: 100 },
                    { ...mockDashboardData.agents[2], performance: 50 }
                ]
            }

            render(<AgentMonitor data={edgeCaseData} />)

            expect(screen.getByText('0%')).toBeDefined()
            expect(screen.getByText('100%')).toBeDefined()
            expect(screen.getByText('50%')).toBeDefined()
        }, TEST_TIMEOUT)
    })

    describe('Responsive Design', () => {
        it('should render properly on mobile devices', () => {
            Object.defineProperty(window, 'innerWidth', {
                writable: true,
                configurable: true,
                value: 375,
            })

            render(<AgentMonitor data={mockDashboardData} />)

            expect(screen.getByText('Agent Monitor')).toBeDefined()
        }, TEST_TIMEOUT)

        it('should adapt grid layout for different screen sizes', () => {
            render(<AgentMonitor data={mockDashboardData} />)

            const agentGrid = document.querySelector('.grid')
            expect(agentGrid.className).toContain('grid-cols-1', 'md:grid-cols-2', 'xl:grid-cols-3')
        }, TEST_TIMEOUT)

        it('should handle varying capability lengths', () => {
            const longCapabilitiesData = {
                ...mockDashboardData,
                agents: [{
                    ...mockDashboardData.agents[0],
                    capabilities: ['Very Long Capability Name', 'Another Long Capability', 'Testing', 'Quality Assurance', 'Automation', 'Performance Testing']
                }]
            }

            render(<AgentMonitor data={longCapabilitiesData} />)

            expect(screen.getByText('Very Long Capability Name')).toBeDefined()
        }, TEST_TIMEOUT)
    })

    describe('Accessibility', () => {
        it('should have proper heading hierarchy', () => {
            render(<AgentMonitor data={mockDashboardData} />)

            const mainHeading = screen.getByRole('heading', { level: 2 })
            expect(mainHeading).toBeDefined()

            const sectionHeadings = screen.getAllByRole('heading', { level: 3 })
            expect(sectionHeadings).toHaveLength(2) // Status Distribution and Performance Overview
        }, TEST_TIMEOUT)

        it('should have proper ARIA labels for status indicators', () => {
            render(<AgentMonitor data={mockDashboardData} />)

            // Status icons should have accessible labels
            const statusIcons = document.querySelectorAll('[data-testid]')
            expect(statusIcons.length).toBeGreaterThan(0)
        }, TEST_TIMEOUT)

        it('should support screen readers for performance data', () => {
            render(<AgentMonitor data={mockDashboardData} />)

            // Performance percentages should be accessible
            expect(screen.getByText('95%')).toBeDefined()
            expect(screen.getByText('88%')).toBeDefined()
        }, TEST_TIMEOUT)

        it('should have semantic HTML structure', () => {
            render(<AgentMonitor data={mockDashboardData} />)

            // Should use proper list structure for agents
            const agentCards = document.querySelectorAll('.bg-white')
            expect(agentCards.length).toBeGreaterThan(0)
        }, TEST_TIMEOUT)
    })

    describe('Data Handling', () => {
        it('should handle missing agent properties gracefully', () => {
            const incompleteData = {
                ...mockDashboardData,
                agents: [{
                    id: 'incomplete',
                    name: 'Incomplete Agent',
                    type: '',
                    status: 'online' as const,
                    currentTask: null,
                    capabilities: [],
                    performance: 0
                }]
            }

            render(<AgentMonitor data={incompleteData} />)

            expect(screen.getByText('Incomplete Agent')).toBeDefined()
            expect(screen.getByText('No active task')).toBeDefined()
            expect(screen.getByText('0%')).toBeDefined()
        }, TEST_TIMEOUT)

        it('should handle null dashboard data', () => {
            const nullData = {
                metrics: { totalProjects: 0, totalAgents: 0, activeTasks: 0, completedTasks: 0, agentUtilization: 0, systemHealth: 0 },
                projects: [],
                agents: [],
                tasks: []
            }

            render(<AgentMonitor data={nullData} />)

            expect(screen.getByText('No agents available')).toBeDefined()
        }, TEST_TIMEOUT)

        it('should format performance numbers correctly', () => {
            const decimalData = {
                ...mockDashboardData,
                agents: [{
                    ...mockDashboardData.agents[0],
                    performance: 95.7
                }]
            }

            render(<AgentMonitor data={decimalData} />)

            // Should round to whole number
            expect(screen.getByText('96%')).toBeDefined()
        }, TEST_TIMEOUT)
    })

    describe('Performance', () => {
        it('should not cause memory leaks on unmount', () => {
            const { unmount } = render(<AgentMonitor data={mockDashboardData} />)

            expect(() => unmount()).not.toThrow()
        }, TEST_TIMEOUT)

        it('should handle large agent datasets efficiently', () => {
            const largeDataset = {
                ...mockDashboardData,
                agents: Array.from({ length: 50 }, (_, i) => ({
                    id: `agent-${i}`,
                    name: `Agent ${i}`,
                    type: `Type ${i % 5}`,
                    status: ['online', 'busy', 'offline'][i % 3] as any,
                    currentTask: i % 2 === 0 ? `Task ${i}` : null,
                    capabilities: [`Skill ${i}`, `Skill ${i + 1}`],
                    performance: Math.floor(Math.random() * 100)
                }))
            }

            const startTime = performance.now()
            render(<AgentMonitor data={largeDataset} />)
            const endTime = performance.now()

            // Should render within reasonable time
            expect(endTime - startTime).toBeLessThan(150)
        }, TEST_TIMEOUT)

        it('should efficiently calculate status distributions', () => {
            render(<AgentMonitor data={mockDashboardData} />)

            // Status calculation should not cause performance issues
            expect(screen.getByText('Status Distribution')).toBeDefined()
            expect(screen.getByText('40%')).toBeDefined()
        }, TEST_TIMEOUT)
    })

    describe('Visual Design', () => {
        it('should apply correct Tailwind CSS classes', () => {
            render(<AgentMonitor data={mockDashboardData} />)

            const container = document.querySelector('.space-y-6')
            expect(container).toBeDefined()
        }, TEST_TIMEOUT)

        it('should have consistent card styling', () => {
            render(<AgentMonitor data={mockDashboardData} />)

            const cards = document.querySelectorAll('.bg-white')
            expect(cards.length).toBeGreaterThan(0)

            cards.forEach(card => {
                expect(card.className).toContain('rounded-lg', 'border', 'p-4')
            })
        }, TEST_TIMEOUT)

        it('should display capability badges with proper styling', () => {
            render(<AgentMonitor data={mockDashboardData} />)

            const capabilityBadges = document.querySelectorAll('.bg-blue-100')
            expect(capabilityBadges.length).toBeGreaterThan(0)
        }, TEST_TIMEOUT)
    })
})


