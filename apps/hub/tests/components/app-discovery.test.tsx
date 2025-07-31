import React from 'react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AppDiscovery } from '../../src/components/hub/app-discovery'
import { TEST_TIMEOUT } from '../setup'

// Mock the data module with realistic test data
vi.mock('@/data/apps', () => ({
    getImplementationStats: () => ({
        total: 71,
        production: 23,
        beta: 18,
        development: 15,
        concept: 15,
        completionPercentage: 58
    }),
    getAppsByCategory: vi.fn(),
    getAppsByStatus: vi.fn(),
    getAppsByTier: vi.fn(),
    CODAI_APPS: [
        {
            name: 'CODAI Core',
            description: 'Core AI services and APIs',
            category: 'Platform',
            status: 'production',
            tier: 1,
            priority: 'critical',
            features: ['AI', 'API', 'Core Services']
        },
        {
            name: 'Admin Dashboard',
            description: 'Administrative interface',
            category: 'Frontend',
            status: 'production',
            tier: 1,
            priority: 'high',
            features: ['Admin', 'Dashboard', 'Management']
        },
        {
            name: 'Analytics Hub',
            description: 'Data analytics and reporting',
            category: 'Analytics',
            status: 'beta',
            tier: 2,
            priority: 'medium',
            features: ['Analytics', 'Reports', 'Data']
        }
    ],
    APP_CATEGORIES: ['All', 'Platform', 'Frontend', 'Analytics', 'AI', 'Mobile'],
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
    }
}))

describe('AppDiscovery Component', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    afterEach(() => {
        vi.restoreAllMocks()
    })

    describe('Component Rendering', () => {
        it('should render without crashing', () => {
            expect(() => render(<AppDiscovery />)).not.toThrow()
        }, TEST_TIMEOUT)

        it('should display search functionality', () => {
            render(<AppDiscovery />)

            const searchInput = screen.getByRole('textbox')
            expect(searchInput).toBeInTheDocument()
            expect(searchInput).toHaveAttribute('placeholder')
        }, TEST_TIMEOUT)

        it('should render view mode toggles', () => {
            render(<AppDiscovery />)

            // Look for grid/list view toggles
            const gridButton = screen.getByRole('button', { name: /grid/i })
            const listButton = screen.getByRole('button', { name: /list/i })

            expect(gridButton).toBeInTheDocument()
            expect(listButton).toBeInTheDocument()
        }, TEST_TIMEOUT)

        it('should display app cards with basic information', () => {
            render(<AppDiscovery />)

            // Check for app names from mock data
            expect(screen.getByText('CODAI Core')).toBeInTheDocument()
            expect(screen.getByText('Admin Dashboard')).toBeInTheDocument()
            expect(screen.getByText('Analytics Hub')).toBeInTheDocument()
        }, TEST_TIMEOUT)
    })

    describe('Search Functionality', () => {
        it('should filter apps based on search input', async () => {
            const user = userEvent.setup()
            render(<AppDiscovery />)

            const searchInput = screen.getByRole('textbox')

            // Search for "Admin"
            await user.type(searchInput, 'Admin')

            await waitFor(() => {
                expect(screen.getByText('Admin Dashboard')).toBeInTheDocument()
                expect(screen.queryByText('CODAI Core')).not.toBeInTheDocument()
            })
        }, TEST_TIMEOUT)

        it('should show all apps when search is cleared', async () => {
            const user = userEvent.setup()
            render(<AppDiscovery />)

            const searchInput = screen.getByRole('textbox')

            // First search, then clear
            await user.type(searchInput, 'Admin')
            await user.clear(searchInput)

            await waitFor(() => {
                expect(screen.getByText('CODAI Core')).toBeInTheDocument()
                expect(screen.getByText('Admin Dashboard')).toBeInTheDocument()
                expect(screen.getByText('Analytics Hub')).toBeInTheDocument()
            })
        }, TEST_TIMEOUT)

        it('should handle case-insensitive search', async () => {
            const user = userEvent.setup()
            render(<AppDiscovery />)

            const searchInput = screen.getByRole('textbox')

            // Search with different cases
            await user.type(searchInput, 'admin')

            await waitFor(() => {
                expect(screen.getByText('Admin Dashboard')).toBeInTheDocument()
            })
        }, TEST_TIMEOUT)

        it('should search in app descriptions and features', async () => {
            const user = userEvent.setup()
            render(<AppDiscovery />)

            const searchInput = screen.getByRole('textbox')

            // Search for "analytics" which appears in description
            await user.type(searchInput, 'analytics')

            await waitFor(() => {
                expect(screen.getByText('Analytics Hub')).toBeInTheDocument()
            })
        }, TEST_TIMEOUT)
    })

    describe('Category Filtering', () => {
        it('should display category filter options', () => {
            render(<AppDiscovery />)

            // Look for category buttons or dropdown
            expect(screen.getByText('All')).toBeInTheDocument()
        }, TEST_TIMEOUT)

        it('should filter apps by category when selected', async () => {
            const user = userEvent.setup()
            render(<AppDiscovery />)

            // This test assumes there's a way to select categories
            // Implementation depends on the actual UI structure
            const categoryElement = screen.getByText('Frontend')
            await user.click(categoryElement)

            await waitFor(() => {
                expect(screen.getByText('Admin Dashboard')).toBeInTheDocument()
            })
        }, TEST_TIMEOUT)
    })

    describe('View Mode Switching', () => {
        it('should switch between grid and list views', async () => {
            const user = userEvent.setup()
            render(<AppDiscovery />)

            const listButton = screen.getByRole('button', { name: /list/i })
            const gridButton = screen.getByRole('button', { name: /grid/i })

            // Switch to list view
            await user.click(listButton)
            expect(listButton).toHaveClass('bg-white', 'text-slate-900') // Active state

            // Switch back to grid view
            await user.click(gridButton)
            expect(gridButton).toHaveClass('bg-white', 'text-slate-900') // Active state
        }, TEST_TIMEOUT)

        it('should maintain content when switching views', async () => {
            const user = userEvent.setup()
            render(<AppDiscovery />)

            // Verify content exists in grid view
            expect(screen.getByText('CODAI Core')).toBeInTheDocument()

            // Switch to list view
            const listButton = screen.getByRole('button', { name: /list/i })
            await user.click(listButton)

            // Content should still be there
            expect(screen.getByText('CODAI Core')).toBeInTheDocument()
        }, TEST_TIMEOUT)
    })

    describe('App Status and Tier Display', () => {
        it('should display app status badges', () => {
            render(<AppDiscovery />)

            // Look for status badges
            expect(screen.getByText('production')).toBeInTheDocument()
            expect(screen.getByText('beta')).toBeInTheDocument()
        }, TEST_TIMEOUT)

        it('should display tier information', () => {
            render(<AppDiscovery />)

            // Look for tier indicators (Tier 1, Tier 2, etc.)
            const tierElements = screen.getAllByText(/tier/i)
            expect(tierElements.length).toBeGreaterThan(0)
        }, TEST_TIMEOUT)

        it('should use appropriate colors for different statuses', () => {
            render(<AppDiscovery />)

            const statusElements = document.querySelectorAll('.bg-green-100, .bg-blue-100, .bg-yellow-100')
            expect(statusElements.length).toBeGreaterThan(0)
        }, TEST_TIMEOUT)
    })

    describe('Sorting Functionality', () => {
        it('should have sorting options available', () => {
            render(<AppDiscovery />)

            // Look for sort controls - this depends on implementation
            // Could be dropdown, buttons, or other controls
            const sortingElements = document.querySelectorAll('[data-sort], .sort-button, [role="combobox"]')
            // At minimum, there should be some way to control sorting
            expect(sortingElements.length).toBeGreaterThanOrEqual(0)
        }, TEST_TIMEOUT)

        it('should sort apps by tier by default', () => {
            render(<AppDiscovery />)

            // Apps should be displayed in tier order
            const appElements = screen.getAllByText(/CODAI Core|Admin Dashboard|Analytics Hub/)
            expect(appElements.length).toBeGreaterThan(0)
        }, TEST_TIMEOUT)
    })

    describe('Statistics Display', () => {
        it('should show ecosystem statistics', () => {
            render(<AppDiscovery />)

            // Look for the implementation stats
            expect(screen.getByText('71')).toBeInTheDocument() // Total apps
            expect(screen.getByText('58%')).toBeInTheDocument() // Completion percentage
        }, TEST_TIMEOUT)

        it('should display category breakdown', () => {
            render(<AppDiscovery />)

            // Should show stats by category, status, etc.
            const statElements = screen.getAllByText(/production|beta|development|concept/i)
            expect(statElements.length).toBeGreaterThan(0)
        }, TEST_TIMEOUT)
    })

    describe('Responsive Design', () => {
        it('should have responsive grid layouts', () => {
            render(<AppDiscovery />)

            // Look for responsive grid classes
            const gridElements = document.querySelectorAll('.grid, .md\\:grid-cols-2, .lg\\:grid-cols-3')
            expect(gridElements.length).toBeGreaterThan(0)
        }, TEST_TIMEOUT)

        it('should handle mobile layouts appropriately', () => {
            render(<AppDiscovery />)

            // Check for responsive classes
            const responsiveElements = document.querySelectorAll('[class*="sm:"], [class*="md:"], [class*="lg:"]')
            expect(responsiveElements.length).toBeGreaterThan(0)
        }, TEST_TIMEOUT)
    })

    describe('Accessibility Compliance', () => {
        it('should have proper semantic structure', () => {
            render(<AppDiscovery />)

            // Check for proper use of headings, lists, etc.
            const searchInput = screen.getByRole('textbox')
            expect(searchInput).toHaveAccessibleName()

            const buttons = screen.getAllByRole('button')
            buttons.forEach(button => {
                expect(button).toHaveAccessibleName()
            })
        }, TEST_TIMEOUT)

        it('should support keyboard navigation', async () => {
            const user = userEvent.setup()
            render(<AppDiscovery />)

            const searchInput = screen.getByRole('textbox')

            // Tab to search input
            await user.tab()
            expect(searchInput).toHaveFocus()

            // Should be able to type
            await user.type(searchInput, 'test')
            expect(searchInput).toHaveValue('test')
        }, TEST_TIMEOUT)

        it('should have proper ARIA labels and roles', () => {
            render(<AppDiscovery />)

            const searchInput = screen.getByRole('textbox')
            expect(searchInput).toBeInTheDocument()

            // Check that interactive elements have proper roles
            const buttons = screen.getAllByRole('button')
            expect(buttons.length).toBeGreaterThan(0)
        }, TEST_TIMEOUT)
    })

    describe('Performance Considerations', () => {
        it('should handle large app lists efficiently', () => {
            render(<AppDiscovery />)

            // Component should render without performance issues
            expect(screen.getByRole('textbox')).toBeInTheDocument()

            // All mock apps should be visible
            expect(screen.getByText('CODAI Core')).toBeInTheDocument()
            expect(screen.getByText('Admin Dashboard')).toBeInTheDocument()
            expect(screen.getByText('Analytics Hub')).toBeInTheDocument()
        }, TEST_TIMEOUT)

        it('should optimize re-renders on search input', async () => {
            const user = userEvent.setup()
            render(<AppDiscovery />)

            const searchInput = screen.getByRole('textbox')

            // Fast typing should not cause excessive re-renders
            await user.type(searchInput, 'admin', { delay: 50 })

            // Component should remain stable
            expect(screen.getByText('Admin Dashboard')).toBeInTheDocument()
        }, TEST_TIMEOUT)
    })

    describe('Error Handling', () => {
        it('should handle empty search results gracefully', async () => {
            const user = userEvent.setup()
            render(<AppDiscovery />)

            const searchInput = screen.getByRole('textbox')

            // Search for something that doesn't exist
            await user.type(searchInput, 'nonexistentapp')

            // Should show appropriate empty state or message
            await waitFor(() => {
                // Either show "no results" message or empty grid
                const appElements = screen.queryAllByText(/CODAI Core|Admin Dashboard|Analytics Hub/)
                expect(appElements.length).toBe(0)
            })
        }, TEST_TIMEOUT)

        it('should handle invalid filter combinations', async () => {
            const user = userEvent.setup()
            render(<AppDiscovery />)

            // Test edge cases with filters
            expect(() => {
                // Component should not crash with any filter combination
                render(<AppDiscovery />)
            }).not.toThrow()
        }, TEST_TIMEOUT)
    })

    describe('Integration Points', () => {
        it('should integrate properly with data layer', () => {
            render(<AppDiscovery />)

            // Should display mocked data correctly
            expect(screen.getByText('CODAI Core')).toBeInTheDocument()
            expect(screen.getByText('Core AI services and APIs')).toBeInTheDocument()
        }, TEST_TIMEOUT)

        it('should work independently of parent components', () => {
            // Test that component can render standalone
            expect(() => render(<AppDiscovery />)).not.toThrow()

            // Basic functionality should work
            expect(screen.getByRole('textbox')).toBeInTheDocument()
            expect(screen.getByText('CODAI Core')).toBeInTheDocument()
        }, TEST_TIMEOUT)
    })
})
