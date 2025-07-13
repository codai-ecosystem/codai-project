import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import RootLayout from '../app/layout'

// Mock Next.js modules
vi.mock('next/font/google', () => ({
    Inter: () => ({ className: 'inter-font' }),
}))

describe('TalentAI Layout', () => {
    it('renders children within the layout', () => {
        render(
            <RootLayout>
                <div>Test Content</div>
            </RootLayout>
        )

        expect(screen.getByText('Test Content')).toBeInTheDocument()
    })

    it('has proper HTML structure', () => {
        const { container } = render(
            <RootLayout>
                <div>Test Content</div>
            </RootLayout>
        )

        const html = container.querySelector('html')
        const body = container.querySelector('body')

        expect(html).toHaveAttribute('lang', 'en')
        expect(body).toBeInTheDocument()
    })

    it('applies gradient background styling', () => {
        const { container } = render(
            <RootLayout>
                <div>Test Content</div>
            </RootLayout>
        )

        const backgroundDiv = container.querySelector('.min-h-screen')
        expect(backgroundDiv).toHaveClass('bg-gradient-to-br', 'from-blue-50', 'to-indigo-100')
    })

    it('includes dark mode classes', () => {
        const { container } = render(
            <RootLayout>
                <div>Test Content</div>
            </RootLayout>
        )

        const backgroundDiv = container.querySelector('.min-h-screen')
        expect(backgroundDiv).toHaveClass('dark:from-gray-900', 'dark:to-blue-900')
    })
})
