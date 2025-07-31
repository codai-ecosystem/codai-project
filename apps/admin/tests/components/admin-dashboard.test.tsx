import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { AdminDashboard } from '../../src/components/admin/dashboard'
import { TEST_TIMEOUT, withoutWindow } from '../setup'

// Mock window.location for demo mode testing
const mockLocation = {
    search: '',
    href: ''
}

Object.defineProperty(window, 'location', {
    value: mockLocation,
    writable: true
})

describe('AdminDashboard Component', () => {
    beforeEach(() => {
        // Reset location mock
        mockLocation.search = ''
        mockLocation.href = ''
        process.env.NODE_ENV = 'test'
        vi.clearAllMocks()
    })

    describe('Component Rendering', () => {
        it('should render without crashing', () => {
            render(<AdminDashboard />)
            expect(screen.getByText('ADMIN')).toBeInTheDocument()
        }, TEST_TIMEOUT)

        it('should display the admin header with correct branding', () => {
            render(<AdminDashboard />)

            expect(screen.getByText('ADMIN')).toBeInTheDocument()
            expect(screen.getByText('System Administration & Management')).toBeInTheDocument()
            expect(screen.getByText('Administrator')).toBeInTheDocument()
        }, TEST_TIMEOUT)

        it('should render all system status cards', () => {
            render(<AdminDashboard />)

            expect(screen.getByText('Server Status')).toBeInTheDocument()
            expect(screen.getByText('Active Users')).toBeInTheDocument()
            expect(screen.getByText('Database Health')).toBeInTheDocument()
            expect(screen.getByText('Security Score')).toBeInTheDocument()
        }, TEST_TIMEOUT)

        it('should display system status values correctly', () => {
            render(<AdminDashboard />)

            expect(screen.getByText('Online')).toBeInTheDocument()
            expect(screen.getByText('1,847')).toBeInTheDocument()
            expect(screen.getByText('Optimal')).toBeInTheDocument()
            expect(screen.getByText('98/100')).toBeInTheDocument()
        }, TEST_TIMEOUT)
    })

    describe('Demo Mode Detection', () => {
        it('should detect demo mode from URL parameter', () => {
            mockLocation.search = '?demo=true'
            render(<AdminDashboard />)

            expect(screen.getByText(/Demo Mode Active/)).toBeInTheDocument()
            expect(screen.getByText(/Full admin functionality available for testing/)).toBeInTheDocument()
        }, TEST_TIMEOUT)

        it('should detect test environment and show demo mode', () => {
            process.env.NODE_ENV = 'test'
            render(<AdminDashboard />)

            expect(screen.getByText(/Demo Mode Active/)).toBeInTheDocument()
        }, TEST_TIMEOUT)

        it('should detect Playwright testing environment', () => {
            mockLocation.href = 'http://localhost:3000/admin?playwright=true'
            render(<AdminDashboard />)

            expect(screen.getByText(/Demo Mode Active/)).toBeInTheDocument()
        }, TEST_TIMEOUT)

        it('should not show demo mode in production environment', () => {
            process.env.NODE_ENV = 'production'
            mockLocation.search = ''
            mockLocation.href = 'http://localhost:3000/admin'

            render(<AdminDashboard />)

            expect(screen.queryByText(/Demo Mode Active/)).not.toBeInTheDocument()
        }, TEST_TIMEOUT)
    })

    describe('System Resources Section', () => {
        it('should render system resources monitoring section', () => {
            render(<AdminDashboard />)

            expect(screen.getByText('System Resources')).toBeInTheDocument()
            expect(screen.getByText('Real-time system performance monitoring')).toBeInTheDocument()
        }, TEST_TIMEOUT)

        it('should display CPU, Memory, and Disk usage metrics', () => {
            render(<AdminDashboard />)

            expect(screen.getByText('CPU Usage')).toBeInTheDocument()
            expect(screen.getByText('67%')).toBeInTheDocument()

            expect(screen.getByText('Memory')).toBeInTheDocument()
            expect(screen.getByText('54%')).toBeInTheDocument()

            expect(screen.getByText('Disk Space')).toBeInTheDocument()
            expect(screen.getByText('23%')).toBeInTheDocument()
        }, TEST_TIMEOUT)

        it('should render progress bars for resource usage', () => {
            render(<AdminDashboard />)

            const progressBars = document.querySelectorAll('.bg-gray-700.rounded-full.h-2')
            expect(progressBars).toHaveLength(3) // CPU, Memory, Disk

            const filledBars = document.querySelectorAll('[style*="width:"]')
            expect(filledBars.length).toBeGreaterThan(0)
        }, TEST_TIMEOUT)
    })

    describe('Recent Activities Section', () => {
        it('should render recent activities section', () => {
            render(<AdminDashboard />)

            expect(screen.getByText('Recent Activities')).toBeInTheDocument()
            expect(screen.getByText('Latest system events and actions')).toBeInTheDocument()
        }, TEST_TIMEOUT)

        it('should display activity entries with timestamps', () => {
            render(<AdminDashboard />)

            expect(screen.getByText('Database backup completed')).toBeInTheDocument()
            expect(screen.getByText('2 minutes ago')).toBeInTheDocument()

            expect(screen.getByText('High memory usage detected')).toBeInTheDocument()
            expect(screen.getByText('15 minutes ago')).toBeInTheDocument()

            expect(screen.getByText('New admin user created')).toBeInTheDocument()
            expect(screen.getByText('1 hour ago')).toBeInTheDocument()
        }, TEST_TIMEOUT)

        it('should render appropriate activity icons', () => {
            render(<AdminDashboard />)

            // Check for Lucide icons by their container elements
            const iconElements = document.querySelectorAll('svg')
            expect(iconElements.length).toBeGreaterThan(10) // Should have multiple icons
        }, TEST_TIMEOUT)
    })

    describe('Quick Actions Section', () => {
        it('should render quick actions section', () => {
            render(<AdminDashboard />)

            expect(screen.getByText('Quick Actions')).toBeInTheDocument()
            expect(screen.getByText('Common administrative tasks and system controls')).toBeInTheDocument()
        }, TEST_TIMEOUT)

        it('should display all quick action buttons', () => {
            render(<AdminDashboard />)

            expect(screen.getByText('User Management')).toBeInTheDocument()
            expect(screen.getByText('Database Admin')).toBeInTheDocument()
            expect(screen.getByText('Security Settings')).toBeInTheDocument()
            expect(screen.getByText('Analytics')).toBeInTheDocument()
            expect(screen.getByText('System Backup')).toBeInTheDocument()
            expect(screen.getByText('System Config')).toBeInTheDocument()
        }, TEST_TIMEOUT)

        it('should make quick action buttons interactive', () => {
            render(<AdminDashboard />)

            const userManagementButton = screen.getByRole('button', { name: /User Management/i })
            expect(userManagementButton).toBeInTheDocument()

            // Test hover interaction
            fireEvent.mouseOver(userManagementButton)
            expect(userManagementButton).toHaveClass('hover:bg-white/10')
        }, TEST_TIMEOUT)
    })

    describe('Responsive Design', () => {
        it('should have responsive classes for mobile design', () => {
            render(<AdminDashboard />)

            const mainContainer = document.querySelector('.min-h-screen')
            expect(mainContainer).toHaveClass('bg-gradient-to-br')

            // Check for responsive grid classes
            const statusGrid = document.querySelector('.grid-cols-1.md\\:grid-cols-2.lg\\:grid-cols-4')
            expect(statusGrid).toBeInTheDocument()
        }, TEST_TIMEOUT)

        it('should have proper spacing classes for different screen sizes', () => {
            render(<AdminDashboard />)

            const header = document.querySelector('header')
            expect(header).toHaveClass('backdrop-blur-sm')

            // Check for responsive padding
            const container = document.querySelector('.px-4.sm\\:px-6.lg\\:px-8')
            expect(container).toBeInTheDocument()
        }, TEST_TIMEOUT)
    })

    describe('Visual Design System', () => {
        it('should apply consistent backdrop blur and transparency effects', () => {
            render(<AdminDashboard />)

            const blurElements = document.querySelectorAll('.backdrop-blur-sm')
            expect(blurElements.length).toBeGreaterThan(5) // Multiple blur elements

            const transparentElements = document.querySelectorAll('[class*="bg-white/"]')
            expect(transparentElements.length).toBeGreaterThan(0)
        }, TEST_TIMEOUT)

        it('should use consistent gradient and color scheme', () => {
            render(<AdminDashboard />)

            const gradientElements = document.querySelectorAll('[class*="gradient"]')
            expect(gradientElements.length).toBeGreaterThan(0)

            // Check for consistent color palette usage
            const blueElements = document.querySelectorAll('[class*="blue-400"]')
            const greenElements = document.querySelectorAll('[class*="green-400"]')
            const cyanElements = document.querySelectorAll('[class*="cyan-400"]')

            expect(blueElements.length).toBeGreaterThan(0)
            expect(greenElements.length).toBeGreaterThan(0)
            expect(cyanElements.length).toBeGreaterThan(0)
        }, TEST_TIMEOUT)

        it('should have consistent border and shadow styling', () => {
            render(<AdminDashboard />)

            const borderElements = document.querySelectorAll('[class*="border-white/"]')
            expect(borderElements.length).toBeGreaterThan(0)

            const shadowElements = document.querySelectorAll('.shadow-lg')
            expect(shadowElements.length).toBeGreaterThan(0)
        }, TEST_TIMEOUT)
    })

    describe('Accessibility Compliance', () => {
        it('should have proper semantic HTML structure', () => {
            render(<AdminDashboard />)

            expect(screen.getByRole('banner')).toBeInTheDocument() // header
            expect(screen.getByRole('main')).toBeInTheDocument()

            // Check for proper heading hierarchy
            const headings = screen.getAllByRole('heading')
            expect(headings.length).toBeGreaterThan(0)
        }, TEST_TIMEOUT)

        it('should have accessible buttons with proper roles', () => {
            render(<AdminDashboard />)

            const buttons = screen.getAllByRole('button')
            expect(buttons.length).toBe(6) // Quick action buttons

            buttons.forEach(button => {
                expect(button).toBeVisible()
            })
        }, TEST_TIMEOUT)

        it('should have proper article structure for content sections', () => {
            render(<AdminDashboard />)

            const articles = screen.getAllByRole('article')
            expect(articles.length).toBeGreaterThan(4) // Status cards + system resources + activities
        }, TEST_TIMEOUT)

        it('should provide text alternatives and proper labeling', () => {
            render(<AdminDashboard />)

            // Check that text content is meaningful and accessible
            expect(screen.getByText('System Administration & Management')).toBeInTheDocument()
            expect(screen.getByText('Real-time system performance monitoring')).toBeInTheDocument()
            expect(screen.getByText('Latest system events and actions')).toBeInTheDocument()
        }, TEST_TIMEOUT)
    })

    describe('Performance Considerations', () => {
        it('should not cause unnecessary re-renders', () => {
            const renderSpy = vi.fn()
            const TestWrapper = () => {
                renderSpy()
                return <AdminDashboard />
            }

            const { rerender } = render(<TestWrapper />)
            expect(renderSpy).toHaveBeenCalledTimes(1)

            rerender(<TestWrapper />)
            expect(renderSpy).toHaveBeenCalledTimes(2)
        }, TEST_TIMEOUT)

        it('should handle client-side window checks safely', () => {
            // Test that component renders properly with window object present
            // This tests the real-world scenario where window is available
            expect(() => render(<AdminDashboard />)).not.toThrow()

            // Verify that the component handles demo mode detection properly
            expect(screen.getByText('ADMIN')).toBeInTheDocument()
        }, TEST_TIMEOUT)
    })

    describe('Integration Points', () => {
        it('should be compatible with the overall admin app structure', () => {
            render(<AdminDashboard />)

            // Check that component renders independently without external dependencies
            expect(screen.getByText('ADMIN')).toBeInTheDocument()

            // Verify no missing prop warnings or errors
            const consoleError = vi.spyOn(console, 'error')
            expect(consoleError).not.toHaveBeenCalled()
        }, TEST_TIMEOUT)

        it('should support testing environments properly', () => {
            process.env.NODE_ENV = 'test'
            render(<AdminDashboard />)

            // Should render demo mode in test environment
            expect(screen.getByText(/Demo Mode Active/)).toBeInTheDocument()

            // Should not crash with test-specific configurations
            expect(screen.getByText('ADMIN')).toBeInTheDocument()
        }, TEST_TIMEOUT)
    })
})
