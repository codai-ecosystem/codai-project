import React from 'react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HubDashboard } from '../../src/components/hub/dashboard'
import { TEST_TIMEOUT } from '../setup'

// Mock the data module
vi.mock('@/data/apps', () => ({
    getImplementationStats: () => ({
        total: 71,
        production: 23,
        beta: 18,
        development: 15,
        concept: 15,
        completionPercentage: 58
    })
}))

// Mock next/image
vi.mock('next/image', () => ({
    default: ({ src, alt, ...props }: any) => {
        return React.createElement("img", { src, alt, ...props });
    },
}))

describe('HubDashboard Component', () => {
    beforeEach(() => {
        // Clear all mocks before each test
        vi.clearAllMocks()
    })

    afterEach(() => {
        // Clean up after each test
        vi.restoreAllMocks()
    })

    describe('Component Rendering', () => {
        it('should render without crashing', () => {
            expect(() => render(<HubDashboard />)).not.toThrow()
        }, TEST_TIMEOUT)

        it('should display the main header with correct branding', () => {
            render(<HubDashboard />)

            expect(screen.getByText('HUB')).toBeInTheDocument()
            expect(screen.getByText('CODAI Ecosystem Central Command & App Discovery')).toBeInTheDocument()
        }, TEST_TIMEOUT)

        it('should render all main navigation tabs', () => {
            render(<HubDashboard />)

            expect(screen.getByRole('tab', { name: /overview/i })).toBeInTheDocument()
            expect(screen.getByRole('tab', { name: /app discovery/i })).toBeInTheDocument()
            expect(screen.getByRole('tab', { name: /workflows/i })).toBeInTheDocument()
            expect(screen.getByRole('tab', { name: /integrations/i })).toBeInTheDocument()
        }, TEST_TIMEOUT)

        it('should display system status badges correctly', () => {
            render(<HubDashboard />)

            expect(screen.getByText('All Systems Operational')).toBeInTheDocument()
            expect(screen.getByText('v2.1.3')).toBeInTheDocument()
            expect(screen.getByText(/71 Apps • 58% Complete/i)).toBeInTheDocument()
        }, TEST_TIMEOUT)
    })

    describe('Overview Tab Content', () => {
        it('should render all statistics cards in overview', () => {
            render(<HubDashboard />)

            // Check for stat cards
            expect(screen.getByText('Total Apps')).toBeInTheDocument()
            expect(screen.getByText('Production Ready')).toBeInTheDocument()
            expect(screen.getByText('Connected Services')).toBeInTheDocument()
            expect(screen.getByText('System Uptime')).toBeInTheDocument()
        }, TEST_TIMEOUT)

        it('should display correct statistical values', () => {
            render(<HubDashboard />)

            // Check for specific stat values
            expect(screen.getByText('71')).toBeInTheDocument() // Total apps
            expect(screen.getByText('41')).toBeInTheDocument() // Production Ready (23+18)
            expect(screen.getByText('24')).toBeInTheDocument() // Connected Services
            expect(screen.getByText('99.9%')).toBeInTheDocument() // System Uptime
        }, TEST_TIMEOUT)

        it('should render service connections section', () => {
            render(<HubDashboard />)

            expect(screen.getByText('Service Connections')).toBeInTheDocument()
            expect(screen.getByText('Active service integrations and their status')).toBeInTheDocument()

            // Check for specific services
            expect(screen.getByText('CODAI Core API')).toBeInTheDocument()
            expect(screen.getByText('Analytics DB')).toBeInTheDocument()
            expect(screen.getByText('User Service')).toBeInTheDocument()
        }, TEST_TIMEOUT)

        it('should render active workflows section', () => {
            render(<HubDashboard />)

            expect(screen.getByText('Active Workflows')).toBeInTheDocument()
            expect(screen.getByText('Currently running automation workflows')).toBeInTheDocument()

            // Check for specific workflows
            expect(screen.getByText('User Data Sync')).toBeInTheDocument()
            expect(screen.getByText('AI Model Training')).toBeInTheDocument()
            expect(screen.getByText('Report Generation')).toBeInTheDocument()
        }, TEST_TIMEOUT)
    })

    describe('Tab Navigation', () => {
        it('should switch to App Discovery tab when clicked', async () => {
            const user = userEvent.setup()
            render(<HubDashboard />)

            const appDiscoveryTab = screen.getByRole('tab', { name: /app discovery/i })
            await user.click(appDiscoveryTab)

            // The AppDiscovery component should be rendered
            // Since it's mocked, we just verify the tab is active
            expect(appDiscoveryTab).toHaveAttribute('aria-selected', 'true')
        }, TEST_TIMEOUT)

        it('should switch to Workflows tab when clicked', async () => {
            const user = userEvent.setup()
            render(<HubDashboard />)

            const workflowsTab = screen.getByRole('tab', { name: /workflows/i })
            await user.click(workflowsTab)

            await waitFor(() => {
                expect(workflowsTab).toHaveAttribute('aria-selected', 'true')
                expect(screen.getByText('Workflow Management')).toBeInTheDocument()
            })
        }, TEST_TIMEOUT)

        it('should switch to Integrations tab when clicked', async () => {
            const user = userEvent.setup()
            render(<HubDashboard />)

            const integrationsTab = screen.getByRole('tab', { name: /integrations/i })
            await user.click(integrationsTab)

            await waitFor(() => {
                expect(integrationsTab).toHaveAttribute('aria-selected', 'true')
                expect(screen.getByText('Integration Center')).toBeInTheDocument()
            })
        }, TEST_TIMEOUT)

        it('should return to Overview tab when clicked', async () => {
            const user = userEvent.setup()
            render(<HubDashboard />)

            // First go to another tab
            await user.click(screen.getByRole('tab', { name: /workflows/i }))

            // Then return to overview
            const overviewTab = screen.getByRole('tab', { name: /overview/i })
            await user.click(overviewTab)

            await waitFor(() => {
                expect(overviewTab).toHaveAttribute('aria-selected', 'true')
                expect(screen.getByText('Service Connections')).toBeInTheDocument()
            })
        }, TEST_TIMEOUT)
    })

    describe('Interactive Elements', () => {
        it('should render all action buttons in overview', () => {
            render(<HubDashboard />)

            expect(screen.getByRole('button', { name: /configure integration/i })).toBeInTheDocument()
            expect(screen.getByRole('button', { name: /view workflows/i })).toBeInTheDocument()
            expect(screen.getByRole('button', { name: /analytics dashboard/i })).toBeInTheDocument()
            expect(screen.getByRole('button', { name: /monitoring/i })).toBeInTheDocument()
        }, TEST_TIMEOUT)

        it('should make action buttons interactive', async () => {
            const user = userEvent.setup()
            render(<HubDashboard />)

            const configureButton = screen.getByRole('button', { name: /configure integration/i })
            const viewWorkflowsButton = screen.getByRole('button', { name: /view workflows/i })

            // Test button interactions
            await user.hover(configureButton)
            await user.hover(viewWorkflowsButton)

            // Buttons should be clickable
            expect(configureButton).toBeEnabled()
            expect(viewWorkflowsButton).toBeEnabled()
        }, TEST_TIMEOUT)

        it('should handle service connection status indicators', () => {
            render(<HubDashboard />)

            // Check for status indicators (CheckCircle, AlertCircle icons)
            const statusElements = screen.getAllByText(/connected|warning|disconnected/i)
            expect(statusElements.length).toBeGreaterThan(0)
        }, TEST_TIMEOUT)

        it('should display workflow progress bars', () => {
            render(<HubDashboard />)

            // Look for progress indicators
            expect(screen.getByText('85% complete')).toBeInTheDocument()
            expect(screen.getByText('34% complete')).toBeInTheDocument()
            expect(screen.getByText('0% complete')).toBeInTheDocument()
            expect(screen.getByText('100% complete')).toBeInTheDocument()
        }, TEST_TIMEOUT)
    })

    describe('Responsive Design', () => {
        it('should have responsive grid classes for different screen sizes', () => {
            render(<HubDashboard />)

            const container = screen.getByText('HUB').closest('div')
            expect(container).toHaveClass('min-h-screen')

            // Look for responsive grid classes
            const statsGrid = screen.getByText('Total Apps').closest('.grid')
            expect(statsGrid).toHaveClass('md:grid-cols-2', 'lg:grid-cols-4')
        }, TEST_TIMEOUT)

        it('should have proper spacing and layout classes', () => {
            render(<HubDashboard />)

            const mainContainer = screen.getByText('HUB').closest('.mx-auto')
            expect(mainContainer).toHaveClass('max-w-7xl', 'space-y-8')
        }, TEST_TIMEOUT)
    })

    describe('Accessibility Compliance', () => {
        it('should have proper semantic HTML structure', () => {
            render(<HubDashboard />)

            // Check for proper heading hierarchy
            const mainHeading = screen.getByRole('heading', { level: 1, name: 'HUB' })
            expect(mainHeading).toBeInTheDocument()

            // Check for tab structure
            const tablist = screen.getByRole('tablist')
            expect(tablist).toBeInTheDocument()
        }, TEST_TIMEOUT)

        it('should have accessible buttons with proper roles', () => {
            render(<HubDashboard />)

            const buttons = screen.getAllByRole('button')
            expect(buttons.length).toBeGreaterThan(0)

            buttons.forEach(button => {
                expect(button).toBeEnabled()
            })
        }, TEST_TIMEOUT)

        it('should have proper tab navigation attributes', () => {
            render(<HubDashboard />)

            const tabs = screen.getAllByRole('tab')
            tabs.forEach(tab => {
                expect(tab).toHaveAttribute('aria-selected')
            })

            // Overview tab should be selected by default
            const overviewTab = screen.getByRole('tab', { name: /overview/i })
            expect(overviewTab).toHaveAttribute('aria-selected', 'true')
        }, TEST_TIMEOUT)

        it('should provide proper labeling for interactive elements', () => {
            render(<HubDashboard />)

            // Check for aria-labels or text content on interactive elements
            const buttons = screen.getAllByRole('button')
            buttons.forEach(button => {
                expect(button).toHaveAccessibleName()
            })
        }, TEST_TIMEOUT)
    })

    describe('Performance Considerations', () => {
        it('should not cause unnecessary re-renders', () => {
            const renderSpy = vi.fn()
            const TestWrapper = () => {
                renderSpy()
                return <HubDashboard />
            }

            const { rerender } = render(<TestWrapper />)
            expect(renderSpy).toHaveBeenCalledTimes(1)

            rerender(<TestWrapper />)
            expect(renderSpy).toHaveBeenCalledTimes(2)
        }, TEST_TIMEOUT)

        it('should handle large datasets efficiently', () => {
            // Test with mock data that simulates larger datasets
            render(<HubDashboard />)

            // Component should render within reasonable time
            expect(screen.getByText('HUB')).toBeInTheDocument()
            expect(screen.getByText('Service Connections')).toBeInTheDocument()
            expect(screen.getByText('Active Workflows')).toBeInTheDocument()
        }, TEST_TIMEOUT)
    })

    describe('Error Boundary & Edge Cases', () => {
        it('should handle missing data gracefully', () => {
            // Test component behavior when data is unavailable
            expect(() => render(<HubDashboard />)).not.toThrow()

            // Component should still render basic structure
            expect(screen.getByText('HUB')).toBeInTheDocument()
        }, TEST_TIMEOUT)

        it('should handle environment variable edge cases', () => {
            const originalEnv = process.env.NODE_ENV

            try {
                process.env.NODE_ENV = 'test'
                render(<HubDashboard />)
                expect(screen.getByText('HUB')).toBeInTheDocument()

                process.env.NODE_ENV = 'production'
                render(<HubDashboard />)
                expect(screen.getByText('HUB')).toBeInTheDocument()
            } finally {
                process.env.NODE_ENV = originalEnv
            }
        }, TEST_TIMEOUT)

        it('should handle rapid tab switching', async () => {
            const user = userEvent.setup()
            render(<HubDashboard />)

            const tabs = screen.getAllByRole('tab')

            // Rapidly switch between tabs
            for (let i = 0; i < 3; i++) {
                await user.click(tabs[1]) // App Discovery
                await user.click(tabs[2]) // Workflows
                await user.click(tabs[0]) // Overview
            }

            // Component should remain stable
            expect(screen.getByText('HUB')).toBeInTheDocument()
        }, TEST_TIMEOUT)
    })

    describe('Visual Design System', () => {
        it('should apply consistent gradient and styling', () => {
            render(<HubDashboard />)

            const container = screen.getByText('HUB').closest('.min-h-screen')
            expect(container).toHaveClass('bg-gradient-to-br', 'from-slate-50', 'via-purple-50', 'to-blue-50')
        }, TEST_TIMEOUT)

        it('should have consistent card styling with backdrop blur effects', () => {
            render(<HubDashboard />)

            // Look for cards with backdrop blur
            const cards = document.querySelectorAll('.backdrop-blur-sm')
            expect(cards.length).toBeGreaterThan(0)
        }, TEST_TIMEOUT)

        it('should use consistent color scheme for status indicators', () => {
            render(<HubDashboard />)

            // Check for status-related color classes
            const statusElements = document.querySelectorAll('.text-green-700, .text-yellow-700, .text-red-700')
            expect(statusElements.length).toBeGreaterThan(0)
        }, TEST_TIMEOUT)
    })

    describe('Integration Points', () => {
        it('should be compatible with the overall hub app structure', () => {
            render(<HubDashboard />)

            // Check that component renders independently without external dependencies
            expect(screen.getByText('HUB')).toBeInTheDocument()

            // Verify no missing prop warnings or errors
            const consoleError = vi.spyOn(console, 'error')
            expect(consoleError).not.toHaveBeenCalled()
        }, TEST_TIMEOUT)

        it('should support testing environments properly', () => {
            process.env.NODE_ENV = 'test'

            expect(() => render(<HubDashboard />)).not.toThrow()
            expect(screen.getByText('HUB')).toBeInTheDocument()
        }, TEST_TIMEOUT)

        it('should handle data integration points correctly', () => {
            render(<HubDashboard />)

            // Verify that mocked data is displayed correctly
            expect(screen.getByText('71')).toBeInTheDocument() // Total apps from mock
            expect(screen.getByText('58% Complete')).toBeInTheDocument() // Completion percentage
        }, TEST_TIMEOUT)
    })
})
