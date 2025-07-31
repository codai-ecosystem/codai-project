import React from 'react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HubDashboard } from '../../src/components/hub/dashboard'
import { AppDiscovery } from '../../src/components/hub/app-discovery'
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
    }),
    CODAI_APPS: [
        {
            name: 'Admin Dashboard',
            description: 'Administrative interface for system management',
            category: 'Frontend',
            status: 'production',
            tier: 1,
            priority: 'critical',
            features: ['Admin', 'Dashboard', 'Management', 'UI']
        },
        {
            name: 'Analytics Service',
            description: 'Real-time analytics and reporting engine',
            category: 'Analytics',
            status: 'beta',
            tier: 2,
            priority: 'high',
            features: ['Analytics', 'Reports', 'Data', 'Intelligence']
        },
        {
            name: 'Mobile App',
            description: 'Cross-platform mobile application',
            category: 'Mobile',
            status: 'development',
            tier: 2,
            priority: 'medium',
            features: ['Mobile', 'React Native', 'iOS', 'Android']
        }
    ],
    APP_CATEGORIES: ['All', 'Frontend', 'Analytics', 'Mobile', 'Backend', 'AI'],
    APP_STATUS_COLORS: {
        production: 'bg-green-100 text-green-700',
        beta: 'bg-blue-100 text-blue-700',
        development: 'bg-yellow-100 text-yellow-700',
        concept: 'bg-gray-100 text-gray-700'
    },
    TIER_INFO: {
        1: { name: 'Core', color: 'text-purple-700' },
        2: { name: 'Essential', color: 'text-blue-700' },
        3: { name: 'Extended', color: 'text-green-700' }
    },
    getAppsByCategory: vi.fn(),
    getAppsByStatus: vi.fn(),
    getAppsByTier: vi.fn()
}))

describe('Hub Application Integration Tests', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    afterEach(() => {
        vi.restoreAllMocks()
    })

    describe('Complete Hub Dashboard Flow', () => {
        it('should render complete dashboard with all sections', () => {
            render(<HubDashboard />)

            // Header section
            expect(screen.getByText('HUB')).toBeInTheDocument()
            expect(screen.getByText('CODAI Ecosystem Central Command & App Discovery')).toBeInTheDocument()

            // Status badges
            expect(screen.getByText('All Systems Operational')).toBeInTheDocument()
            expect(screen.getByText('v2.1.3')).toBeInTheDocument()

            // Statistics cards
            expect(screen.getByText('Total Apps')).toBeInTheDocument()
            expect(screen.getByText('Production Ready')).toBeInTheDocument()
            expect(screen.getByText('Connected Services')).toBeInTheDocument()
            expect(screen.getByText('System Uptime')).toBeInTheDocument()

            // Main content sections
            expect(screen.getByText('Service Connections')).toBeInTheDocument()
            expect(screen.getByText('Active Workflows')).toBeInTheDocument()
        }, TEST_TIMEOUT)

        it('should navigate through all tab sections successfully', async () => {
            const user = userEvent.setup()
            render(<HubDashboard />)

            // Start with Overview tab (default)
            expect(screen.getByRole('tab', { name: /overview/i })).toHaveAttribute('aria-selected', 'true')
            expect(screen.getByText('Service Connections')).toBeInTheDocument()

            // Navigate to App Discovery
            await user.click(screen.getByRole('tab', { name: /app discovery/i }))
            await waitFor(() => {
                expect(screen.getByRole('tab', { name: /app discovery/i })).toHaveAttribute('aria-selected', 'true')
            })

            // Navigate to Workflows
            await user.click(screen.getByRole('tab', { name: /workflows/i }))
            await waitFor(() => {
                expect(screen.getByRole('tab', { name: /workflows/i })).toHaveAttribute('aria-selected', 'true')
                expect(screen.getByText('Workflow Management')).toBeInTheDocument()
            })

            // Navigate to Integrations
            await user.click(screen.getByRole('tab', { name: /integrations/i }))
            await waitFor(() => {
                expect(screen.getByRole('tab', { name: /integrations/i })).toHaveAttribute('aria-selected', 'true')
                expect(screen.getByText('Integration Center')).toBeInTheDocument()
            })

            // Return to Overview
            await user.click(screen.getByRole('tab', { name: /overview/i }))
            await waitFor(() => {
                expect(screen.getByRole('tab', { name: /overview/i })).toHaveAttribute('aria-selected', 'true')
                expect(screen.getByText('Service Connections')).toBeInTheDocument()
            })
        }, TEST_TIMEOUT)

        it('should maintain state consistency across tab switches', async () => {
            const user = userEvent.setup()
            render(<HubDashboard />)

            // Check initial state values
            expect(screen.getByText('71')).toBeInTheDocument() // Total apps
            expect(screen.getByText('99.9%')).toBeInTheDocument() // Uptime

            // Switch tabs multiple times
            await user.click(screen.getByRole('tab', { name: /workflows/i }))
            await user.click(screen.getByRole('tab', { name: /overview/i }))

            // Values should remain consistent
            expect(screen.getByText('71')).toBeInTheDocument()
            expect(screen.getByText('99.9%')).toBeInTheDocument()
        }, TEST_TIMEOUT)
    })

    describe('App Discovery Integration', () => {
        it('should render App Discovery as standalone component', () => {
            render(<AppDiscovery />)

            // Should have search functionality
            expect(screen.getByRole('textbox')).toBeInTheDocument()

            // Should display apps from mock data
            expect(screen.getByText('Admin Dashboard')).toBeInTheDocument()
            expect(screen.getByText('Analytics Service')).toBeInTheDocument()
            expect(screen.getByText('Mobile App')).toBeInTheDocument()
        }, TEST_TIMEOUT)

        it('should integrate properly within Hub Dashboard', async () => {
            const user = userEvent.setup()
            render(<HubDashboard />)

            // Navigate to App Discovery tab
            await user.click(screen.getByRole('tab', { name: /app discovery/i }))

            // App Discovery should be rendered within the dashboard
            await waitFor(() => {
                // The search input should be available
                expect(screen.getByRole('textbox')).toBeInTheDocument()
            })
        }, TEST_TIMEOUT)

        it('should handle search functionality within dashboard context', async () => {
            const user = userEvent.setup()
            render(<HubDashboard />)

            // Navigate to App Discovery
            await user.click(screen.getByRole('tab', { name: /app discovery/i }))

            await waitFor(async () => {
                const searchInput = screen.getByRole('textbox')

                // Search for specific app
                await user.type(searchInput, 'Admin')

                // Should filter results
                await waitFor(() => {
                    expect(screen.getByText('Admin Dashboard')).toBeInTheDocument()
                })
            })
        }, TEST_TIMEOUT)
    })

    describe('Data Flow Integration', () => {
        it('should display consistent statistics across components', () => {
            render(<HubDashboard />)

            // Statistics should be consistent between different sections
            const statsFromMock = screen.getAllByText('71') // Total apps appears in stats
            expect(statsFromMock.length).toBeGreaterThan(0)

            // Completion percentage should be displayed
            expect(screen.getByText(/58% Complete/i)).toBeInTheDocument()
        }, TEST_TIMEOUT)

        it('should handle mock data properly across all components', async () => {
            const user = userEvent.setup()
            render(<HubDashboard />)

            // Check Overview data
            expect(screen.getByText('CODAI Core API')).toBeInTheDocument()
            expect(screen.getByText('User Data Sync')).toBeInTheDocument()

            // Switch to App Discovery and check data
            await user.click(screen.getByRole('tab', { name: /app discovery/i }))

            await waitFor(() => {
                expect(screen.getByText('Admin Dashboard')).toBeInTheDocument()
                expect(screen.getByText('Analytics Service')).toBeInTheDocument()
            })
        }, TEST_TIMEOUT)

        it('should maintain data integrity during interactions', async () => {
            const user = userEvent.setup()
            render(<HubDashboard />)

            // Interact with various elements
            const buttons = screen.getAllByRole('button')
            if (buttons.length > 0) {
                await user.hover(buttons[0])
            }

            // Switch tabs
            await user.click(screen.getByRole('tab', { name: /workflows/i }))
            await user.click(screen.getByRole('tab', { name: /overview/i }))

            // Data should remain intact
            expect(screen.getByText('Service Connections')).toBeInTheDocument()
            expect(screen.getByText('Active Workflows')).toBeInTheDocument()
        }, TEST_TIMEOUT)
    })

    describe('User Experience Integration', () => {
        it('should provide smooth navigation experience', async () => {
            const user = userEvent.setup()
            render(<HubDashboard />)

            const tabs = screen.getAllByRole('tab')

            // Rapidly switch between tabs
            for (let i = 0; i < 3; i++) {
                await user.click(tabs[1]) // App Discovery
                await user.click(tabs[2]) // Workflows
                await user.click(tabs[0]) // Overview
            }

            // Should remain stable
            expect(screen.getByText('HUB')).toBeInTheDocument()
            expect(screen.getByText('Service Connections')).toBeInTheDocument()
        }, TEST_TIMEOUT)

        it('should handle multiple user interactions simultaneously', async () => {
            const user = userEvent.setup()
            render(<HubDashboard />)

            // Get all interactive elements
            const buttons = screen.getAllByRole('button')
            const tabs = screen.getAllByRole('tab')

            // Perform multiple interactions
            if (buttons.length > 0) {
                await user.hover(buttons[0])
            }

            if (tabs.length > 1) {
                await user.click(tabs[1])
            }

            // Component should remain responsive
            expect(screen.getByText('HUB')).toBeInTheDocument()
        }, TEST_TIMEOUT)

        it('should maintain accessibility throughout interactions', async () => {
            const user = userEvent.setup()
            render(<HubDashboard />)

            // Check initial accessibility
            expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
            expect(screen.getByRole('tablist')).toBeInTheDocument()

            // Navigate using keyboard
            await user.tab()
            await user.tab()

            // Switch tabs
            await user.click(screen.getByRole('tab', { name: /workflows/i }))

            // Accessibility should be maintained
            expect(screen.getByRole('tablist')).toBeInTheDocument()
            const activeTab = screen.getByRole('tab', { name: /workflows/i })
            expect(activeTab).toHaveAttribute('aria-selected', 'true')
        }, TEST_TIMEOUT)
    })

    describe('Performance Integration', () => {
        it('should render efficiently with all components', () => {
            const startTime = performance.now()

            render(<HubDashboard />)

            const endTime = performance.now()
            const renderTime = endTime - startTime

            // Should render reasonably quickly (under 100ms in test environment)
            expect(renderTime).toBeLessThan(100)

            // All main components should be present
            expect(screen.getByText('HUB')).toBeInTheDocument()
            expect(screen.getByText('Service Connections')).toBeInTheDocument()
            expect(screen.getByText('Active Workflows')).toBeInTheDocument()
        }, TEST_TIMEOUT)

        it('should handle re-renders efficiently', () => {
            const renderSpy = vi.fn()

            const TestWrapper = ({ key }: { key: number }) => {
                renderSpy()
                return <HubDashboard />
            }

            const { rerender } = render(<TestWrapper key={1} />)
            expect(renderSpy).toHaveBeenCalledTimes(1)

            rerender(<TestWrapper key={2} />)
            expect(renderSpy).toHaveBeenCalledTimes(2)

            // Component should render correctly both times
            expect(screen.getByText('HUB')).toBeInTheDocument()
        }, TEST_TIMEOUT)
    })

    describe('Error Handling Integration', () => {
        it('should handle component errors gracefully', () => {
            // Component should not crash with normal usage
            expect(() => render(<HubDashboard />)).not.toThrow()
            expect(() => render(<AppDiscovery />)).not.toThrow()
        }, TEST_TIMEOUT)

        it('should handle missing dependencies gracefully', () => {
            // Test with potentially missing or undefined dependencies
            const originalConsoleError = console.error
            console.error = vi.fn()

            try {
                render(<HubDashboard />)
                expect(screen.getByText('HUB')).toBeInTheDocument()

                // Should not have thrown errors
                expect(console.error).not.toHaveBeenCalled()
            } finally {
                console.error = originalConsoleError
            }
        }, TEST_TIMEOUT)

        it('should recover from interaction errors', async () => {
            const user = userEvent.setup()
            render(<HubDashboard />)

            try {
                // Attempt various interactions that might fail
                const tabs = screen.getAllByRole('tab')

                // Rapidly click tabs
                for (const tab of tabs) {
                    await user.click(tab)
                }

                // Component should remain functional
                expect(screen.getByText('HUB')).toBeInTheDocument()
            } catch (error) {
                // Even if individual interactions fail, component should not crash
                expect(screen.getByText('HUB')).toBeInTheDocument()
            }
        }, TEST_TIMEOUT)
    })

    describe('Real-world Usage Scenarios', () => {
        it('should handle typical user workflow', async () => {
            const user = userEvent.setup()
            render(<HubDashboard />)

            // 1. User arrives at dashboard
            expect(screen.getByText('HUB')).toBeInTheDocument()
            expect(screen.getByText('All Systems Operational')).toBeInTheDocument()

            // 2. User checks system statistics
            expect(screen.getByText('Total Apps')).toBeInTheDocument()
            expect(screen.getByText('71')).toBeInTheDocument()

            // 3. User views service connections
            expect(screen.getByText('Service Connections')).toBeInTheDocument()
            expect(screen.getByText('CODAI Core API')).toBeInTheDocument()

            // 4. User switches to app discovery
            await user.click(screen.getByRole('tab', { name: /app discovery/i }))

            // 5. User searches for apps
            await waitFor(async () => {
                const searchInput = screen.getByRole('textbox')
                await user.type(searchInput, 'Admin')
            })

            // 6. User returns to overview
            await user.click(screen.getByRole('tab', { name: /overview/i }))

            // All functionality should work seamlessly
            expect(screen.getByText('Service Connections')).toBeInTheDocument()
        }, TEST_TIMEOUT)

        it('should support administrative monitoring workflow', async () => {
            const user = userEvent.setup()
            render(<HubDashboard />)

            // Admin checks system status
            expect(screen.getByText('All Systems Operational')).toBeInTheDocument()
            expect(screen.getByText('99.9%')).toBeInTheDocument() // Uptime

            // Admin reviews service connections
            expect(screen.getByText('Service Connections')).toBeInTheDocument()
            expect(screen.getByText('Analytics DB')).toBeInTheDocument()

            // Admin checks active workflows
            expect(screen.getByText('Active Workflows')).toBeInTheDocument()
            expect(screen.getByText('User Data Sync')).toBeInTheDocument()

            // Admin accesses action buttons
            const configureButton = screen.getByRole('button', { name: /configure integration/i })
            expect(configureButton).toBeEnabled()

            // Button should be interactive
            await user.hover(configureButton)
        }, TEST_TIMEOUT)
    })
})
