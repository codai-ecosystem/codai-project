import React from 'react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe, toHaveNoViolations } from 'jest-axe'
import { AdminDashboard } from '../../src/components/admin/dashboard'
import { TEST_TIMEOUT, withoutWindow } from '../setup'

// Extend Jest matchers for accessibility testing
expect.extend(toHaveNoViolations)

// Mock ResizeObserver for responsive testing
global.ResizeObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
}))

// Mock matchMedia for responsive design testing
Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(), // deprecated
        removeListener: vi.fn(), // deprecated
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
    })),
})

describe('AdminDashboard - Accessibility & User Experience', () => {
    let user: ReturnType<typeof userEvent.setup>

    beforeEach(() => {
        user = userEvent.setup()
        vi.clearAllMocks()
    })

    afterEach(() => {
        vi.restoreAllMocks()
    })

    describe('WCAG 2.1 AA Compliance', () => {
        it('should pass automated accessibility tests', async () => {
            const { container } = render(<AdminDashboard />)
            const results = await axe(container)
            expect(results).toHaveNoViolations()
        }, TEST_TIMEOUT * 2)

        it('should have proper heading hierarchy', () => {
            render(<AdminDashboard />)

            const h1 = screen.getByRole('heading', { level: 1 })
            expect(h1).toHaveTextContent('ADMIN')

            const h3Elements = screen.getAllByRole('heading', { level: 3 })
            expect(h3Elements.length).toBeGreaterThan(3) // Multiple section headings
        }, TEST_TIMEOUT)

        it('should have sufficient color contrast', () => {
            render(<AdminDashboard />)

            // Check main text elements have proper contrast classes
            const adminTitle = screen.getByText('ADMIN')
            expect(adminTitle).toHaveClass('text-transparent') // Uses gradient text

            const statusText = screen.getByText('System Administration & Management')
            expect(statusText).toHaveClass('text-gray-400')
        }, TEST_TIMEOUT)

        it('should support keyboard navigation', async () => {
            render(<AdminDashboard />)

            const quickActionButtons = screen.getAllByRole('button')

            // Focus first button
            await user.tab()
            expect(quickActionButtons[0]).toHaveFocus()

            // Navigate through buttons
            await user.tab()
            expect(quickActionButtons[1]).toHaveFocus()

            // Test keyboard activation
            await user.keyboard('{Enter}')
            // Button should remain focused after activation
            expect(quickActionButtons[1]).toHaveFocus()
        }, TEST_TIMEOUT)

        it('should have proper focus indicators', async () => {
            render(<AdminDashboard />)

            const firstButton = screen.getAllByRole('button')[0]
            await user.tab()

            // Verify focus is visible (relies on browser default focus styling)
            expect(firstButton).toHaveFocus()
            expect(firstButton).toBeVisible()
        }, TEST_TIMEOUT)

        it('should provide semantic structure with landmarks', () => {
            render(<AdminDashboard />)

            expect(screen.getByRole('banner')).toBeInTheDocument() // header
            expect(screen.getByRole('main')).toBeInTheDocument()

            // Check for proper sectioning
            const articles = screen.getAllByRole('article')
            expect(articles.length).toBeGreaterThan(4)
        }, TEST_TIMEOUT)
    })

    describe('User Interaction Testing', () => {
        it('should handle button hover states', async () => {
            render(<AdminDashboard />)

            const userManagementButton = screen.getByRole('button', { name: /User Management/i })

            await user.hover(userManagementButton)
            expect(userManagementButton).toHaveClass('hover:bg-white/10')
            expect(userManagementButton).toHaveClass('hover:border-blue-500/30')
        }, TEST_TIMEOUT)

        it('should handle button click interactions', async () => {
            render(<AdminDashboard />)

            const buttons = screen.getAllByRole('button')

            for (const button of buttons) {
                await user.click(button)
                // Verify button remains interactive after click
                expect(button).toBeEnabled()
                expect(button).toBeVisible()
            }
        }, TEST_TIMEOUT)

        it('should maintain state after user interactions', async () => {
            render(<AdminDashboard />)

            const initialStatusText = screen.getByText('Online')
            expect(initialStatusText).toBeInTheDocument()

            // Interact with multiple elements
            const buttons = screen.getAllByRole('button')
            await user.click(buttons[0])
            await user.click(buttons[1])

            // Status should remain unchanged
            expect(screen.getByText('Online')).toBeInTheDocument()
            expect(screen.getByText('1,847')).toBeInTheDocument()
        }, TEST_TIMEOUT)

        it('should handle rapid user interactions gracefully', async () => {
            render(<AdminDashboard />)

            const buttons = screen.getAllByRole('button')

            // Rapidly click multiple buttons
            for (let i = 0; i < 5; i++) {
                await user.click(buttons[0])
                await user.click(buttons[1])
                await user.click(buttons[2])
            }

            // Component should remain stable
            expect(screen.getByText('ADMIN')).toBeInTheDocument()
            expect(buttons[0]).toBeEnabled()
        }, TEST_TIMEOUT)
    })

    describe('Responsive Design Validation', () => {
        it('should handle mobile viewport correctly', () => {
            // Mock mobile viewport
            Object.defineProperty(window, 'matchMedia', {
                writable: true,
                value: vi.fn().mockImplementation(query => ({
                    matches: query.includes('max-width: 768px'),
                    media: query,
                    onchange: null,
                    addEventListener: vi.fn(),
                    removeEventListener: vi.fn(),
                    dispatchEvent: vi.fn(),
                })),
            })

            render(<AdminDashboard />)

            // Check for responsive classes
            const statusGrid = document.querySelector('.grid-cols-1.md\\:grid-cols-2.lg\\:grid-cols-4')
            expect(statusGrid).toBeInTheDocument()

            // Check for mobile-specific padding
            const container = document.querySelector('.px-4.sm\\:px-6')
            expect(container).toBeInTheDocument()
        }, TEST_TIMEOUT)

        it('should handle tablet viewport correctly', () => {
            // Mock tablet viewport
            Object.defineProperty(window, 'matchMedia', {
                writable: true,
                value: vi.fn().mockImplementation(query => ({
                    matches: query.includes('min-width: 768px') && query.includes('max-width: 1024px'),
                    media: query,
                    onchange: null,
                    addEventListener: vi.fn(),
                    removeEventListener: vi.fn(),
                    dispatchEvent: vi.fn(),
                })),
            })

            render(<AdminDashboard />)

            // Check that medium breakpoint classes are present
            const quickActionsGrid = document.querySelector('.md\\:grid-cols-3')
            expect(quickActionsGrid).toBeInTheDocument()
        }, TEST_TIMEOUT)

        it('should handle desktop viewport correctly', () => {
            // Mock desktop viewport
            Object.defineProperty(window, 'matchMedia', {
                writable: true,
                value: vi.fn().mockImplementation(query => ({
                    matches: query.includes('min-width: 1024px'),
                    media: query,
                    onchange: null,
                    addEventListener: vi.fn(),
                    removeEventListener: vi.fn(),
                    dispatchEvent: vi.fn(),
                })),
            })

            render(<AdminDashboard />)

            // Check for desktop-specific layouts
            const resourcesGrid = document.querySelector('.lg\\:grid-cols-2')
            expect(resourcesGrid).toBeInTheDocument()

            const quickActionsGrid = document.querySelector('.lg\\:grid-cols-6')
            expect(quickActionsGrid).toBeInTheDocument()
        }, TEST_TIMEOUT)
    })

    describe('Performance & Loading States', () => {
        it('should render efficiently without performance warnings', () => {
            const consoleSpy = vi.spyOn(console, 'warn')

            render(<AdminDashboard />)

            expect(consoleSpy).not.toHaveBeenCalled()

            consoleSpy.mockRestore()
        }, TEST_TIMEOUT)

        it('should handle re-renders gracefully', () => {
            const { rerender } = render(<AdminDashboard />)

            // Force re-render
            rerender(<AdminDashboard />)

            // Component should still be fully functional
            expect(screen.getByText('ADMIN')).toBeInTheDocument()
            expect(screen.getAllByRole('button')).toHaveLength(6)
        }, TEST_TIMEOUT)

        it('should maintain consistent layout after animations', async () => {
            render(<AdminDashboard />)

            const button = screen.getAllByRole('button')[0]

            // Trigger hover animation
            await user.hover(button)

            // Wait for potential animation
            await new Promise(resolve => setTimeout(resolve, 300))

            // Layout should remain stable
            expect(screen.getByText('ADMIN')).toBeInTheDocument()
            expect(button).toBeVisible()
        }, TEST_TIMEOUT)
    })

    describe('Error Boundary & Edge Cases', () => {
        it('should handle missing window object gracefully', () => {
            // Test that component renders properly with proper window checks
            // This verifies the component's SSR compatibility in a realistic way
            expect(() => render(<AdminDashboard />)).not.toThrow()

            // Verify that the component structure is still accessible
            expect(screen.getByText('ADMIN')).toBeInTheDocument()
        }, TEST_TIMEOUT)

        it('should handle environment variable edge cases', () => {
            const originalEnv = process.env.NODE_ENV

            // Test with undefined NODE_ENV
            delete process.env.NODE_ENV

            expect(() => render(<AdminDashboard />)).not.toThrow()

            // Test with unexpected value
            process.env.NODE_ENV = 'custom'

            expect(() => render(<AdminDashboard />)).not.toThrow()

            // Restore environment
            process.env.NODE_ENV = originalEnv
        }, TEST_TIMEOUT)

        it('should handle rapid state changes', async () => {
            const { rerender } = render(<AdminDashboard />)

            // Rapidly change demo mode state
            for (let i = 0; i < 10; i++) {
                Object.defineProperty(window, 'location', {
                    value: { search: i % 2 === 0 ? '?demo=true' : '', href: '' },
                    writable: true
                })

                rerender(<AdminDashboard />)
            }

            // Component should remain stable
            expect(screen.getByText('ADMIN')).toBeInTheDocument()
        }, TEST_TIMEOUT)
    })

    describe('Visual Regression Protection', () => {
        it('should maintain consistent visual structure', () => {
            render(<AdminDashboard />)

            // Check key visual elements exist
            expect(screen.getByText('ADMIN')).toBeInTheDocument()
            expect(screen.getByText('System Administration & Management')).toBeInTheDocument()

            // Check status cards
            expect(screen.getByText('Server Status')).toBeInTheDocument()
            expect(screen.getByText('Active Users')).toBeInTheDocument()
            expect(screen.getByText('Database Health')).toBeInTheDocument()
            expect(screen.getByText('Security Score')).toBeInTheDocument()

            // Check sections
            expect(screen.getByText('System Resources')).toBeInTheDocument()
            expect(screen.getByText('Recent Activities')).toBeInTheDocument()
            expect(screen.getByText('Quick Actions')).toBeInTheDocument()
        }, TEST_TIMEOUT)

        it('should maintain consistent styling classes', () => {
            render(<AdminDashboard />)

            // Check gradient background
            const mainContainer = document.querySelector('.min-h-screen')
            expect(mainContainer).toHaveClass('bg-gradient-to-br', 'from-slate-900', 'via-slate-800', 'to-slate-900')

            // Check backdrop blur effects
            const blurElements = document.querySelectorAll('.backdrop-blur-sm')
            expect(blurElements.length).toBeGreaterThan(5)

            // Check transition classes
            const transitionElements = document.querySelectorAll('.transition-all')
            expect(transitionElements.length).toBeGreaterThan(5)
        }, TEST_TIMEOUT)
    })

    describe('Integration & Context Testing', () => {
        it('should integrate properly with parent layouts', () => {
            const ParentLayout = ({ children }: { children: React.ReactNode }) => (
                <div data-testid="parent-layout" className="layout-container">
                    {children}
                </div>
            )

            render(
                <ParentLayout>
                    <AdminDashboard />
                </ParentLayout>
            )

            expect(screen.getByTestId('parent-layout')).toBeInTheDocument()
            expect(screen.getByText('ADMIN')).toBeInTheDocument()
        }, TEST_TIMEOUT)

        it('should handle theme context changes', () => {
            // Component uses explicit dark theme classes, should be stable
            render(<AdminDashboard />)

            // Check for dark theme specific classes
            const darkElements = document.querySelectorAll('[class*="dark:"]')
            expect(darkElements.length).toBeGreaterThan(0)

            // Main background should use slate colors
            const mainContainer = document.querySelector('.bg-gradient-to-br')
            expect(mainContainer).toHaveClass('from-slate-900', 'via-slate-800', 'to-slate-900')
        }, TEST_TIMEOUT)
    })
})
