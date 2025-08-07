import React from 'react'
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import {
    LoadingSpinner,
    LoadingDots,
    LoadingSkeleton,
    LoadingOverlay
} from '@/components/ui/loading'

describe('Loading Components', () => {
    describe('LoadingSpinner', () => {
        it('renders correctly with default props', () => {
            render(<LoadingSpinner />)

            const spinner = screen.getByRole('status')
            expect(spinner).toBeInTheDocument()
            expect(spinner).toHaveClass('animate-spin')
            expect(spinner).toHaveAttribute('aria-label', 'Loading')
        })

        it('applies custom size', () => {
            render(<LoadingSpinner size="lg" />)

            const spinner = screen.getByRole('status')
            expect(spinner).toHaveClass('h-8', 'w-8')
        })

        it('applies custom color', () => {
            render(<LoadingSpinner color="blue" />)

            const spinner = screen.getByRole('status')
            expect(spinner).toHaveClass('text-blue-600')
        })

        it('applies custom className', () => {
            render(<LoadingSpinner className="custom-class" />)

            const spinner = screen.getByRole('status')
            expect(spinner).toHaveClass('custom-class')
        })

        it('applies custom aria-label', () => {
            render(<LoadingSpinner ariaLabel="Custom loading" />)

            const spinner = screen.getByRole('status')
            expect(spinner).toHaveAttribute('aria-label', 'Custom loading')
        })
    })

    describe('LoadingDots', () => {
        it('renders correctly with default props', () => {
            render(<LoadingDots />)

            const dots = screen.getByRole('status')
            expect(dots).toBeInTheDocument()
            expect(dots).toHaveAttribute('aria-label', 'Loading')

            // Check for dots
            const dotElements = dots.querySelectorAll('div')
            expect(dotElements).toHaveLength(3)
        })

        it('applies custom size', () => {
            render(<LoadingDots size="lg" />)

            const dots = screen.getByRole('status')
            const dotElements = dots.querySelectorAll('div')

            dotElements.forEach(dot => {
                expect(dot).toHaveClass('h-3', 'w-3')
            })
        })

        it('applies custom color', () => {
            render(<LoadingDots color="blue" />)

            const dots = screen.getByRole('status')
            const dotElements = dots.querySelectorAll('div')

            dotElements.forEach(dot => {
                expect(dot).toHaveClass('bg-blue-600')
            })
        })

        it('applies custom className', () => {
            render(<LoadingDots className="custom-class" />)

            const dots = screen.getByRole('status')
            expect(dots).toHaveClass('custom-class')
        })

        it('applies custom aria-label', () => {
            render(<LoadingDots ariaLabel="Custom loading" />)

            const dots = screen.getByRole('status')
            expect(dots).toHaveAttribute('aria-label', 'Custom loading')
        })
    })

    describe('LoadingSkeleton', () => {
        it('renders correctly with default props', () => {
            render(<LoadingSkeleton />)

            const skeleton = screen.getByRole('status')
            expect(skeleton).toBeInTheDocument()
            expect(skeleton).toHaveAttribute('aria-label', 'Loading content')

            // Check for skeleton line - classes are on inner divs
            const skeletonLine = skeleton.querySelector('div')
            expect(skeletonLine).toHaveClass('h-4', 'bg-gray-200', 'rounded', 'animate-pulse')
        })

        it('applies custom width and height', () => {
            render(<LoadingSkeleton className="w-32 h-8" />)

            const skeleton = screen.getByRole('status')
            expect(skeleton).toHaveClass('w-32', 'h-8')
        })

        it('renders multiple lines when specified', () => {
            render(<LoadingSkeleton lines={3} />)

            const skeleton = screen.getByRole('status')
            const lines = skeleton.querySelectorAll('div')
            expect(lines).toHaveLength(3)
        })

        it('applies custom aria-label', () => {
            render(<LoadingSkeleton ariaLabel="Loading content" />)

            const skeleton = screen.getByRole('status')
            expect(skeleton).toHaveAttribute('aria-label', 'Loading content')
        })
    })

    describe('LoadingOverlay', () => {
        it('renders correctly with default props', () => {
            render(<LoadingOverlay />)

            const overlay = screen.getByRole('status')
            expect(overlay).toBeInTheDocument()
            expect(overlay).toHaveClass('fixed', 'inset-0', 'bg-opacity-50')

            // Check for spinner inside overlay
            const spinner = overlay.querySelector('.animate-spin')
            expect(spinner).toBeInTheDocument()
        })

        it('renders with custom message', () => {
            render(<LoadingOverlay message="Processing..." />)

            const overlay = screen.getByRole('status')
            expect(screen.getByText('Processing...')).toBeInTheDocument()
        })

        it('applies custom className', () => {
            render(<LoadingOverlay className="custom-overlay" />)

            const overlay = screen.getByRole('status')
            expect(overlay).toHaveClass('custom-overlay')
        })

        it('applies custom spinner size', () => {
            render(<LoadingOverlay spinnerSize="lg" />)

            const overlay = screen.getByRole('status')
            const spinner = overlay.querySelector('.animate-spin')
            expect(spinner).toHaveClass('h-8', 'w-8')
        })

        it('applies custom spinner color', () => {
            render(<LoadingOverlay spinnerColor="blue" />)

            const overlay = screen.getByRole('status')
            const spinner = overlay.querySelector('.animate-spin')
            expect(spinner).toHaveClass('text-blue-600')
        })
    })

    describe('Loading Component Integration', () => {
        it('all components have proper accessibility attributes', () => {
            const { rerender } = render(<LoadingSpinner />)
            expect(screen.getByRole('status')).toHaveAttribute('aria-label')

            rerender(<LoadingDots />)
            expect(screen.getByRole('status')).toHaveAttribute('aria-label')

            rerender(<LoadingSkeleton />)
            expect(screen.getByRole('status')).toHaveAttribute('aria-label')

            rerender(<LoadingOverlay />)
            expect(screen.getByRole('status')).toHaveAttribute('role', 'status')
        })

        it('components can be combined in complex layouts', () => {
            render(
                <div>
                    <LoadingSpinner />
                    <LoadingDots />
                    <LoadingSkeleton lines={2} />
                </div>
            )

            const statusElements = screen.getAllByRole('status')
            expect(statusElements).toHaveLength(3)
        })
    })

    describe('Loading Component Variants', () => {
        it('LoadingSpinner supports all size variants', () => {
            const sizes = ['sm', 'md', 'lg'] as const

            sizes.forEach(size => {
                const { unmount } = render(<LoadingSpinner size={size} />)
                const spinner = screen.getByRole('status')
                expect(spinner).toBeInTheDocument()
                unmount()
            })
        })

        it('LoadingDots supports all color variants', () => {
            const colors = ['gray', 'blue', 'green', 'red'] as const

            colors.forEach(color => {
                const { unmount } = render(<LoadingDots color={color} />)
                const dots = screen.getByRole('status')
                expect(dots).toBeInTheDocument()
                unmount()
            })
        })

        it('LoadingSkeleton supports multiple line configurations', () => {
            const lineConfigs = [1, 3, 5, 10]

            lineConfigs.forEach(lines => {
                const { unmount } = render(<LoadingSkeleton lines={lines} />)
                const skeleton = screen.getByRole('status')
                const lineElements = skeleton.querySelectorAll('div')
                expect(lineElements).toHaveLength(lines)
                unmount()
            })
        })
    })

    describe('Loading Component Error Boundaries', () => {
        it('components handle missing props gracefully', () => {
            expect(() => render(<LoadingSpinner />)).not.toThrow()
            expect(() => render(<LoadingDots />)).not.toThrow()
            expect(() => render(<LoadingSkeleton />)).not.toThrow()
            expect(() => render(<LoadingOverlay />)).not.toThrow()
        })

        it('components handle invalid props gracefully', () => {
            expect(() => render(<LoadingSpinner size={'invalid' as any} />)).not.toThrow()
            expect(() => render(<LoadingDots color={'invalid' as any} />)).not.toThrow()
            expect(() => render(<LoadingSkeleton lines={0} />)).not.toThrow()
        })
    })
})

