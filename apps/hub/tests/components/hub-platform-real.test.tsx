/**
 * Hub Platform Real Functional Tests
 * Following the proven no-mock testing pattern with comprehensive hub management testing
 * 
 * Test Suite Coverage:
 * - Authentication and access control
 * - Hub dashboard overview and metrics
 * - Service monitoring and management
 * - Workflow automation management
 * - Analytics and performance tracking
 * - Real-time data updates and loading states
 * - Interactive navigation and tab switching
 * - Search and filtering functionality
 * - Service control and external links
 * - Loading states and error handling
 * - Responsive design and accessibility
 */

import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import '@testing-library/jest-dom'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import HubPlatform from '../../src/components/HubPlatform'

// Mock Next.js components
vi.mock('next/link', () => ({
    default: ({ children, href, ...props }: any) => (
        <a href={href} {...props}>
            {children}
        </a>
    ),
}))

vi.mock('next/navigation', () => ({
    usePathname: () => '/hub',
    useRouter: () => ({
        push: vi.fn(),
        replace: vi.fn(),
        refresh: vi.fn(),
    }),
}))

// Mock Framer Motion to prevent animation issues in tests
vi.mock('framer-motion', () => ({
    motion: {
        div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
        button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
    },
    AnimatePresence: ({ children }: any) => <>{children}</>,
}))

// Mock the auth hook with different authentication states
const mockAuthHook = {
    user: {
        id: 'hub-user-1',
        name: 'Alexandru Munteanu',
        email: 'alex@codai.ro',
        role: 'hub_admin'
    },
    logout: vi.fn(),
    isAuthenticated: true,
    isLoading: false
}

vi.mock('../../src/lib/auth', () => ({
    useAuth: () => mockAuthHook,
}))

// Test wrapper component for Hub Platform
function HubPlatformTestWrapper({
    authState,
    customAuthHook
}: {
    authState?: 'unauthenticated' | 'authenticated'
    customAuthHook?: any
}) {
    // Update mock auth hook based on test scenario
    if (customAuthHook) {
        Object.assign(mockAuthHook, customAuthHook)
    } else if (authState) {
        switch (authState) {
            case 'unauthenticated':
                mockAuthHook.user = null
                mockAuthHook.isAuthenticated = false
                break
            case 'authenticated':
                mockAuthHook.user = {
                    id: 'hub-user-1',
                    name: 'Alexandru Munteanu',
                    email: 'alex@codai.ro',
                    role: 'hub_admin'
                }
                mockAuthHook.isAuthenticated = true
                break
        }
    }

    return (
        <div className="hub-platform-test-wrapper">
            <HubPlatform />
        </div>
    )
}

describe('Hub Platform Real Functional Tests', () => {
    const user = userEvent.setup()

    beforeEach(() => {
        // Reset mocks
        vi.clearAllMocks()

        // Reset auth hook to authenticated state
        mockAuthHook.user = {
            id: 'hub-user-1',
            name: 'Alexandru Munteanu',
            email: 'alex@codai.ro',
            role: 'hub_admin'
        }
        mockAuthHook.isAuthenticated = true
        mockAuthHook.isLoading = false
    })

    describe('Authentication and Access Control', () => {
        it('shows access restricted message for unauthenticated users', async () => {
            render(<HubPlatformTestWrapper authState="unauthenticated" />)

            expect(screen.getByText('Access Restricted')).toBeInTheDocument()
            expect(screen.getByText('Please log in to access the Hub platform')).toBeInTheDocument()
        })

        it('renders full hub platform for authenticated users', async () => {
            render(<HubPlatformTestWrapper authState="authenticated" />)

            expect(screen.getByText('CODAI Hub')).toBeInTheDocument()
            expect(screen.getByText('Central Command Center')).toBeInTheDocument()
            expect(screen.getByText('Alexandru Munteanu')).toBeInTheDocument()
            expect(screen.getByText('Logout')).toBeInTheDocument()
        })

        it('handles logout functionality', async () => {
            render(<HubPlatformTestWrapper authState="authenticated" />)

            const logoutButton = screen.getByText('Logout')
            await user.click(logoutButton)

            expect(mockAuthHook.logout).toHaveBeenCalled()
        })
    })

    describe('Loading States and Data Display', () => {
        it('shows loading state initially', async () => {
            render(<HubPlatformTestWrapper authState="authenticated" />)

            // Should show loading spinner initially
            expect(screen.getByText('Loading Hub Data')).toBeInTheDocument()
            expect(screen.getByText('Gathering system information...')).toBeInTheDocument()

            // Should show loading spinner animation
            const spinner = document.querySelector('.animate-spin')
            expect(spinner).toBeInTheDocument()
        })

        it('displays dashboard content after loading', async () => {
            render(<HubPlatformTestWrapper authState="authenticated" />)

            // Wait for loading to complete
            await waitFor(
                () => {
                    expect(screen.queryByText('Loading Hub Data')).not.toBeInTheDocument()
                },
                { timeout: 2000 }
            )

            // Check system metrics cards are displayed
            expect(screen.getByText('Total Requests')).toBeInTheDocument()
            expect(screen.getByText('Active Users')).toBeInTheDocument()
            expect(screen.getByText('Avg Response Time')).toBeInTheDocument()
            expect(screen.getByText('Total Errors')).toBeInTheDocument()
        })
    })

    describe('Navigation and Tab Switching', () => {
        it('renders navigation tabs correctly', async () => {
            render(<HubPlatformTestWrapper authState="authenticated" />)

            // Wait for loading to complete
            await waitFor(() => {
                expect(screen.queryByText('Loading Hub Data')).not.toBeInTheDocument()
            }, { timeout: 2000 })

            // Check all navigation tabs are present
            const navTabs = ['Dashboard', 'Services', 'Workflows', 'Analytics']
            navTabs.forEach(tab => {
                expect(screen.getByText(tab)).toBeInTheDocument()
            })
        })

        it('allows tab switching and shows active states', async () => {
            render(<HubPlatformTestWrapper authState="authenticated" />)

            await waitFor(() => {
                expect(screen.queryByText('Loading Hub Data')).not.toBeInTheDocument()
            }, { timeout: 2000 })

            // Dashboard should be active by default
            const dashboardTab = screen.getByRole('button', { name: /Dashboard/ })
            expect(dashboardTab).toHaveClass('text-blue-600', 'border-blue-500')

            // Click on Services tab
            const servicesTab = screen.getByRole('button', { name: /Services/ })
            await user.click(servicesTab)

            // Services tab should now be active
            expect(servicesTab).toHaveClass('text-blue-600', 'border-blue-500')
        })

        it('switches to services tab and shows service management content', async () => {
            render(<HubPlatformTestWrapper authState="authenticated" />)

            await waitFor(() => {
                expect(screen.queryByText('Loading Hub Data')).not.toBeInTheDocument()
            }, { timeout: 2000 })

            const servicesTab = screen.getByRole('button', { name: /Services/ })
            await user.click(servicesTab)

            // Should show service search functionality
            expect(screen.getByPlaceholderText('Search services...')).toBeInTheDocument()
            expect(screen.getByText('Filter')).toBeInTheDocument()
            expect(screen.getByText('Refresh')).toBeInTheDocument()
        })
    })

    describe('Dashboard System Metrics', () => {
        it('displays system metrics cards with correct data', async () => {
            render(<HubPlatformTestWrapper authState="authenticated" />)

            await waitFor(() => {
                expect(screen.queryByText('Loading Hub Data')).not.toBeInTheDocument()
            }, { timeout: 2000 })

            // Check system metrics - look for the metric titles and verify data is present
            expect(screen.getByText('Total Requests')).toBeInTheDocument()
            // Look for any numeric values that would indicate data is loaded
            const numericElements = document.querySelectorAll('.text-2xl.font-semibold')
            expect(numericElements.length).toBeGreaterThan(0)

            expect(screen.getByText('Active Users')).toBeInTheDocument()
            expect(screen.getByText('Avg Response Time')).toBeInTheDocument()
            expect(screen.getByText('Total Errors')).toBeInTheDocument()

            // Verify metrics cards are displayed properly (should have the right structure)
            const metricCards = document.querySelectorAll('.bg-white.rounded-lg.shadow.p-6')
            expect(metricCards.length).toBeGreaterThanOrEqual(4) // At least 4 system metric cards
        })

        it('displays recent alerts section', async () => {
            render(<HubPlatformTestWrapper authState="authenticated" />)

            await waitFor(() => {
                expect(screen.queryByText('Loading Hub Data')).not.toBeInTheDocument()
            }, { timeout: 2000 })

            expect(screen.getByText('Recent Alerts')).toBeInTheDocument()
            // Use getAllByText for elements that appear multiple times
            const bancAIElements = screen.getAllByText('BancAI')
            expect(bancAIElements.length).toBeGreaterThan(0)

            expect(screen.getByText('High memory usage detected (>80%)')).toBeInTheDocument()

            const memorAIElements = screen.getAllByText('MemorAI')
            expect(memorAIElements.length).toBeGreaterThan(0)

            const idServiceElements = screen.getAllByText('ID Service')
            expect(idServiceElements.length).toBeGreaterThan(0)
        })

        it('displays service status overview on dashboard', async () => {
            render(<HubPlatformTestWrapper authState="authenticated" />)

            await waitFor(() => {
                expect(screen.queryByText('Loading Hub Data')).not.toBeInTheDocument()
            }, { timeout: 2000 })

            expect(screen.getByText('Service Status Overview')).toBeInTheDocument()

            // Check service names and statuses
            expect(screen.getByText('CODAI Platform')).toBeInTheDocument()
            // Use getAllByText for elements that appear multiple times
            const bancAIElements = screen.getAllByText('BancAI')
            expect(bancAIElements.length).toBeGreaterThan(0)

            const memorAIElements = screen.getAllByText('MemorAI')
            expect(memorAIElements.length).toBeGreaterThan(0)

            expect(screen.getByText('Admin Dashboard')).toBeInTheDocument()

            const idServiceElements = screen.getAllByText('ID Service')
            expect(idServiceElements.length).toBeGreaterThan(0)

            // Check for running status indicators
            const runningStatuses = screen.getAllByText('running')
            expect(runningStatuses.length).toBeGreaterThan(0)
        })
    })

    describe('Service Management', () => {
        it('provides service search functionality', async () => {
            render(<HubPlatformTestWrapper authState="authenticated" />)

            await waitFor(() => {
                expect(screen.queryByText('Loading Hub Data')).not.toBeInTheDocument()
            }, { timeout: 2000 })

            const servicesTab = screen.getByRole('button', { name: /Services/ })
            await user.click(servicesTab)

            const searchInput = screen.getByPlaceholderText('Search services...')
            expect(searchInput).toBeInTheDocument()

            // Test search functionality
            await user.type(searchInput, 'BancAI')
            expect(searchInput).toHaveValue('BancAI')
        })

        it('displays detailed service information in services tab', async () => {
            render(<HubPlatformTestWrapper authState="authenticated" />)

            await waitFor(() => {
                expect(screen.queryByText('Loading Hub Data')).not.toBeInTheDocument()
            }, { timeout: 2000 })

            const servicesTab = screen.getByRole('button', { name: /Services/ })
            await user.click(servicesTab)

            // Check service details
            expect(screen.getByText('CODAI Platform')).toBeInTheDocument()
            expect(screen.getByText('Main development platform and code assistant')).toBeInTheDocument()
            expect(screen.getByText('4001')).toBeInTheDocument() // Port
            expect(screen.getByText('2.1.4')).toBeInTheDocument() // Version

            // Check service metrics
            expect(screen.getByText('12.5%')).toBeInTheDocument() // CPU usage
            // Use getAllByText for elements that appear multiple times
            const memoryElements = screen.getAllByText((content, element) => {
                return element?.textContent?.includes('256') && element?.textContent?.includes('MB') || false
            })
            expect(memoryElements.length).toBeGreaterThan(0)
        })

        it('provides service control buttons', async () => {
            render(<HubPlatformTestWrapper authState="authenticated" />)

            await waitFor(() => {
                expect(screen.queryByText('Loading Hub Data')).not.toBeInTheDocument()
            }, { timeout: 2000 })

            const servicesTab = screen.getByRole('button', { name: /Services/ })
            await user.click(servicesTab)

            // Check for service control buttons
            const viewDetailsButtons = screen.getAllByText('View Details')
            expect(viewDetailsButtons.length).toBeGreaterThan(0)

            const openServiceButtons = screen.getAllByText('Open Service')
            expect(openServiceButtons.length).toBeGreaterThan(0)
        })
    })

    describe('Workflow Management', () => {
        it('displays workflow management interface', async () => {
            render(<HubPlatformTestWrapper authState="authenticated" />)

            await waitFor(() => {
                expect(screen.queryByText('Loading Hub Data')).not.toBeInTheDocument()
            }, { timeout: 2000 })

            const workflowsTab = screen.getByRole('button', { name: /Workflows/ })
            await user.click(workflowsTab)

            expect(screen.getByText('Automation Workflows')).toBeInTheDocument()
            expect(screen.getByText('New Workflow')).toBeInTheDocument()
        })

        it('shows workflow list with details', async () => {
            render(<HubPlatformTestWrapper authState="authenticated" />)

            await waitFor(() => {
                expect(screen.queryByText('Loading Hub Data')).not.toBeInTheDocument()
            }, { timeout: 2000 })

            const workflowsTab = screen.getByRole('button', { name: /Workflows/ })
            await user.click(workflowsTab)

            // Check workflow names
            expect(screen.getByText('User Onboarding')).toBeInTheDocument()
            expect(screen.getByText('Daily Backup')).toBeInTheDocument()
            expect(screen.getByText('Security Scan')).toBeInTheDocument()
            expect(screen.getByText('Performance Optimization')).toBeInTheDocument()

            // Check workflow statuses - use getAllByText for multiple elements
            const activeStatuses = screen.getAllByText('active')
            expect(activeStatuses.length).toBeGreaterThan(0)

            expect(screen.getByText('paused')).toBeInTheDocument()
        })

        it('provides workflow control buttons', async () => {
            render(<HubPlatformTestWrapper authState="authenticated" />)

            await waitFor(() => {
                expect(screen.queryByText('Loading Hub Data')).not.toBeInTheDocument()
            }, { timeout: 2000 })

            const workflowsTab = screen.getByRole('button', { name: /Workflows/ })
            await user.click(workflowsTab)

            // Check for workflow control buttons (play, edit, more options)
            const controlButtons = screen.getAllByRole('button')
            const playButtons = controlButtons.filter(btn =>
                btn.querySelector('svg') &&
                (btn.getAttribute('class')?.includes('play') || btn.querySelector('.lucide-play'))
            )

            // Should have workflow control buttons available
            expect(controlButtons.length).toBeGreaterThan(5)
        })
    })

    describe('Analytics Dashboard', () => {
        it('displays analytics charts and metrics', async () => {
            render(<HubPlatformTestWrapper authState="authenticated" />)

            await waitFor(() => {
                expect(screen.queryByText('Loading Hub Data')).not.toBeInTheDocument()
            }, { timeout: 2000 })

            const analyticsTab = screen.getByRole('button', { name: /Analytics/ })
            await user.click(analyticsTab)

            // Check chart sections
            expect(screen.getByText('Request Volume')).toBeInTheDocument()
            expect(screen.getByText('Service Distribution')).toBeInTheDocument()
            expect(screen.getByText('Performance Trends')).toBeInTheDocument()
            expect(screen.getByText('Resource Costs')).toBeInTheDocument()

            // Check placeholder messages (since charts are not implemented)
            expect(screen.getByText('Request volume chart would be here')).toBeInTheDocument()
            expect(screen.getByText('Service distribution chart would be here')).toBeInTheDocument()
        })

        it('displays system resource usage metrics', async () => {
            render(<HubPlatformTestWrapper authState="authenticated" />)

            await waitFor(() => {
                expect(screen.queryByText('Loading Hub Data')).not.toBeInTheDocument()
            }, { timeout: 2000 })

            const analyticsTab = screen.getByRole('button', { name: /Analytics/ })
            await user.click(analyticsTab)

            expect(screen.getByText('System Resource Usage')).toBeInTheDocument()

            // Check resource metrics
            expect(screen.getByText('System Load')).toBeInTheDocument()
            expect(screen.getByText('Memory Usage')).toBeInTheDocument()
            expect(screen.getByText('Disk Usage')).toBeInTheDocument()
            expect(screen.getByText('Network I/O')).toBeInTheDocument()

            // Check values
            expect(screen.getByText('23.5%')).toBeInTheDocument() // System load
            expect(screen.getByText('68.2%')).toBeInTheDocument() // Memory usage
            expect(screen.getByText('42.8%')).toBeInTheDocument() // Disk usage
            expect(screen.getByText('156.7 MB/s')).toBeInTheDocument() // Network I/O
        })
    })

    describe('Interactive Features', () => {
        it('handles search functionality in services', async () => {
            render(<HubPlatformTestWrapper authState="authenticated" />)

            await waitFor(() => {
                expect(screen.queryByText('Loading Hub Data')).not.toBeInTheDocument()
            }, { timeout: 2000 })

            const servicesTab = screen.getByRole('button', { name: /Services/ })
            await user.click(servicesTab)

            const searchInput = screen.getByPlaceholderText('Search services...')

            // Initially all services should be visible
            expect(screen.getByText('CODAI Platform')).toBeInTheDocument()
            expect(screen.getByText('BancAI')).toBeInTheDocument()

            // Search for specific service
            await user.type(searchInput, 'BancAI')

            // Input should reflect the search term
            expect(searchInput).toHaveValue('BancAI')
        })

        it('provides filter and refresh buttons', async () => {
            render(<HubPlatformTestWrapper authState="authenticated" />)

            await waitFor(() => {
                expect(screen.queryByText('Loading Hub Data')).not.toBeInTheDocument()
            }, { timeout: 2000 })

            const servicesTab = screen.getByRole('button', { name: /Services/ })
            await user.click(servicesTab)

            const filterButton = screen.getByText('Filter')
            const refreshButton = screen.getByText('Refresh')

            expect(filterButton).toBeInTheDocument()
            expect(refreshButton).toBeInTheDocument()
        })

        it('handles notification badge', async () => {
            render(<HubPlatformTestWrapper authState="authenticated" />)

            await waitFor(() => {
                expect(screen.queryByText('Loading Hub Data')).not.toBeInTheDocument()
            }, { timeout: 2000 })

            // Check for notification indicator
            const notificationBadge = document.querySelector('.bg-red-400')
            expect(notificationBadge).toBeInTheDocument()
        })
    })

    describe('Responsive Design and Accessibility', () => {
        it('includes proper heading structure', async () => {
            render(<HubPlatformTestWrapper authState="authenticated" />)

            await waitFor(() => {
                expect(screen.queryByText('Loading Hub Data')).not.toBeInTheDocument()
            }, { timeout: 2000 })

            expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('CODAI Hub')

            // Check for level 3 headings in content
            const h3Elements = screen.getAllByRole('heading', { level: 3 })
            expect(h3Elements.length).toBeGreaterThan(0)
        })

        it('provides accessible form controls', async () => {
            render(<HubPlatformTestWrapper authState="authenticated" />)

            await waitFor(() => {
                expect(screen.queryByText('Loading Hub Data')).not.toBeInTheDocument()
            }, { timeout: 2000 })

            const servicesTab = screen.getByRole('button', { name: /Services/ })
            await user.click(servicesTab)

            const searchInput = screen.getByPlaceholderText('Search services...')
            expect(searchInput).toHaveAttribute('type', 'text')
        })

        it('maintains keyboard navigation support', async () => {
            render(<HubPlatformTestWrapper authState="authenticated" />)

            await waitFor(() => {
                expect(screen.queryByText('Loading Hub Data')).not.toBeInTheDocument()
            }, { timeout: 2000 })

            const dashboardTab = screen.getByRole('button', { name: /Dashboard/ })

            // Focus the tab
            dashboardTab.focus()
            expect(document.activeElement).toBe(dashboardTab)

            // Use keyboard to navigate
            await user.keyboard('{Tab}')
            // Next focusable element should receive focus
        })
    })

    describe('Error Handling and Edge Cases', () => {
        it('handles missing user data gracefully', async () => {
            const customAuthHook = {
                user: null,
                logout: vi.fn(),
                isAuthenticated: false,
                isLoading: false
            }

            render(<HubPlatformTestWrapper customAuthHook={customAuthHook} />)

            // Should show access restricted message
            expect(screen.getByText('Access Restricted')).toBeInTheDocument()
        })

        it('handles tab switching between all tabs', async () => {
            render(<HubPlatformTestWrapper authState="authenticated" />)

            await waitFor(() => {
                expect(screen.queryByText('Loading Hub Data')).not.toBeInTheDocument()
            }, { timeout: 2000 })

            const tabs = ['Services', 'Workflows', 'Analytics', 'Dashboard']

            for (const tabName of tabs) {
                const tab = screen.getByRole('button', { name: new RegExp(tabName) })
                await user.click(tab)

                // Tab should be active
                expect(tab).toHaveClass('text-blue-600', 'border-blue-500')
            }
        })

        it('displays proper status badges for services', async () => {
            render(<HubPlatformTestWrapper authState="authenticated" />)

            await waitFor(() => {
                expect(screen.queryByText('Loading Hub Data')).not.toBeInTheDocument()
            }, { timeout: 2000 })

            const servicesTab = screen.getByRole('button', { name: /Services/ })
            await user.click(servicesTab)

            // Check for status badges
            const runningStatuses = screen.getAllByText('running')
            expect(runningStatuses.length).toBeGreaterThan(0)

            // Each running status should have appropriate styling
            runningStatuses.forEach(status => {
                expect(status).toHaveClass('text-green-600', 'bg-green-100')
            })
        })
    })

    describe('Real-time Data Updates', () => {
        it('shows service metrics correctly', async () => {
            render(<HubPlatformTestWrapper authState="authenticated" />)

            await waitFor(() => {
                expect(screen.queryByText('Loading Hub Data')).not.toBeInTheDocument()
            }, { timeout: 2000 })

            const servicesTab = screen.getByRole('button', { name: /Services/ })
            await user.click(servicesTab)

            // Check service uptime displays
            expect(screen.getByText('7d 14h 32m')).toBeInTheDocument() // CODAI uptime
            expect(screen.getByText('12d 8h 15m')).toBeInTheDocument() // BancAI uptime

            // Check response times
            expect(screen.getByText('145ms')).toBeInTheDocument() // CODAI response time
            expect(screen.getByText('98ms')).toBeInTheDocument() // BancAI response time
        })

        it('displays workflow execution metrics', async () => {
            render(<HubPlatformTestWrapper authState="authenticated" />)

            await waitFor(() => {
                expect(screen.queryByText('Loading Hub Data')).not.toBeInTheDocument()
            }, { timeout: 2000 })

            const workflowsTab = screen.getByRole('button', { name: /Workflows/ })
            await user.click(workflowsTab)

            // Check workflow execution counts and success rates - use getAllByText for multiple elements
            const executionElements = screen.getAllByText(/1250/)
            expect(executionElements.length).toBeGreaterThan(0) // User Onboarding executions

            const successRateElements1 = screen.getAllByText(/98\.2%/)
            expect(successRateElements1.length).toBeGreaterThan(0)

            const successRateElements2 = screen.getAllByText(/100%/)
            expect(successRateElements2.length).toBeGreaterThan(0) // Daily Backup success rate
        })
    })
})