import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '../../src/components/ui/card'
import { Button } from '../../src/components/ui/button'
import { Badge } from '../../src/components/ui/badge'
import { Progress } from '../../src/components/ui/progress'
import { TEST_TIMEOUT } from '../setup'

describe('Hub UI Components', () => {
    describe('Card Components', () => {
        it('should render Card component correctly', () => {
            render(
                <Card data-testid="test-card">
                    <div>Card content</div>
                </Card>
            )

            const card = screen.getByTestId('test-card')
            expect(card).toBeInTheDocument()
            expect(card).toHaveClass('rounded-lg', 'border', 'bg-card', 'text-card-foreground', 'shadow-sm')
            expect(screen.getByText('Card content')).toBeInTheDocument()
        }, TEST_TIMEOUT)

        it('should render CardHeader with proper styling', () => {
            render(
                <Card>
                    <CardHeader data-testid="card-header">
                        <div>Header content</div>
                    </CardHeader>
                </Card>
            )

            const header = screen.getByTestId('card-header')
            expect(header).toBeInTheDocument()
            expect(header).toHaveClass('flex', 'flex-col', 'space-y-1.5', 'p-6')
            expect(screen.getByText('Header content')).toBeInTheDocument()
        }, TEST_TIMEOUT)

        it('should render CardTitle as h3 with proper styling', () => {
            render(
                <Card>
                    <CardHeader>
                        <CardTitle>Test Title</CardTitle>
                    </CardHeader>
                </Card>
            )

            const title = screen.getByRole('heading', { level: 3, name: 'Test Title' })
            expect(title).toBeInTheDocument()
            expect(title).toHaveClass('text-2xl', 'font-semibold', 'leading-none', 'tracking-tight')
        }, TEST_TIMEOUT)

        it('should render CardDescription with proper styling', () => {
            render(
                <Card>
                    <CardHeader>
                        <CardDescription>Test description</CardDescription>
                    </CardHeader>
                </Card>
            )

            const description = screen.getByText('Test description')
            expect(description).toBeInTheDocument()
            expect(description.tagName).toBe('P')
            expect(description).toHaveClass('text-sm', 'text-muted-foreground')
        }, TEST_TIMEOUT)

        it('should render CardContent with proper styling', () => {
            render(
                <Card>
                    <CardContent data-testid="card-content">
                        <div>Content area</div>
                    </CardContent>
                </Card>
            )

            const content = screen.getByTestId('card-content')
            expect(content).toBeInTheDocument()
            expect(content).toHaveClass('p-6', 'pt-0')
            expect(screen.getByText('Content area')).toBeInTheDocument()
        }, TEST_TIMEOUT)

        it('should render CardFooter with proper styling', () => {
            render(
                <Card>
                    <CardFooter data-testid="card-footer">
                        <div>Footer content</div>
                    </CardFooter>
                </Card>
            )

            const footer = screen.getByTestId('card-footer')
            expect(footer).toBeInTheDocument()
            expect(footer).toHaveClass('flex', 'items-center', 'p-6', 'pt-0')
            expect(screen.getByText('Footer content')).toBeInTheDocument()
        }, TEST_TIMEOUT)

        it('should support custom className props', () => {
            render(
                <Card className="custom-card" data-testid="custom-card">
                    <CardHeader className="custom-header" data-testid="custom-header">
                        <CardTitle className="custom-title">Custom Title</CardTitle>
                        <CardDescription className="custom-description">Custom description</CardDescription>
                    </CardHeader>
                    <CardContent className="custom-content" data-testid="custom-content">
                        Content
                    </CardContent>
                </Card>
            )

            expect(screen.getByTestId('custom-card')).toHaveClass('custom-card')
            expect(screen.getByTestId('custom-header')).toHaveClass('custom-header')
            expect(screen.getByTestId('custom-content')).toHaveClass('custom-content')
            expect(screen.getByRole('heading')).toHaveClass('custom-title')
            expect(screen.getByText('Custom description')).toHaveClass('custom-description')
        }, TEST_TIMEOUT)

        it('should forward refs correctly', () => {
            const cardRef = React.createRef<HTMLDivElement>()
            const headerRef = React.createRef<HTMLDivElement>()
            const titleRef = React.createRef<HTMLHeadingElement>()
            const descriptionRef = React.createRef<HTMLParagraphElement>()
            const contentRef = React.createRef<HTMLDivElement>()
            const footerRef = React.createRef<HTMLDivElement>()

            render(
                <Card ref={cardRef}>
                    <CardHeader ref={headerRef}>
                        <CardTitle ref={titleRef}>Title</CardTitle>
                        <CardDescription ref={descriptionRef}>Description</CardDescription>
                    </CardHeader>
                    <CardContent ref={contentRef}>Content</CardContent>
                    <CardFooter ref={footerRef}>Footer</CardFooter>
                </Card>
            )

            expect(cardRef.current).toBeInstanceOf(HTMLDivElement)
            expect(headerRef.current).toBeInstanceOf(HTMLDivElement)
            expect(titleRef.current).toBeInstanceOf(HTMLHeadingElement)
            expect(descriptionRef.current).toBeInstanceOf(HTMLParagraphElement)
            expect(contentRef.current).toBeInstanceOf(HTMLDivElement)
            expect(footerRef.current).toBeInstanceOf(HTMLDivElement)
        }, TEST_TIMEOUT)
    })

    describe('Button Component', () => {
        it('should render button with default styling', () => {
            render(<Button data-testid="test-button">Click me</Button>)

            const button = screen.getByTestId('test-button')
            expect(button).toBeInTheDocument()
            expect(button.tagName).toBe('BUTTON')
            expect(screen.getByText('Click me')).toBeInTheDocument()
        }, TEST_TIMEOUT)

        it('should support different variants', () => {
            render(
                <div>
                    <Button variant="default" data-testid="default-button">Default</Button>
                    <Button variant="outline" data-testid="outline-button">Outline</Button>
                    <Button variant="ghost" data-testid="ghost-button">Ghost</Button>
                </div>
            )

            expect(screen.getByTestId('default-button')).toBeInTheDocument()
            expect(screen.getByTestId('outline-button')).toBeInTheDocument()
            expect(screen.getByTestId('ghost-button')).toBeInTheDocument()
        }, TEST_TIMEOUT)

        it('should support different sizes', () => {
            render(
                <div>
                    <Button size="sm" data-testid="small-button">Small</Button>
                    <Button size="default" data-testid="default-button">Default</Button>
                    <Button size="lg" data-testid="large-button">Large</Button>
                </div>
            )

            expect(screen.getByTestId('small-button')).toBeInTheDocument()
            expect(screen.getByTestId('default-button')).toBeInTheDocument()
            expect(screen.getByTestId('large-button')).toBeInTheDocument()
        }, TEST_TIMEOUT)

        it('should handle disabled state', () => {
            render(<Button disabled data-testid="disabled-button">Disabled</Button>)

            const button = screen.getByTestId('disabled-button')
            expect(button).toBeDisabled()
        }, TEST_TIMEOUT)

        it('should support custom className', () => {
            render(<Button className="custom-button" data-testid="custom-button">Custom</Button>)

            expect(screen.getByTestId('custom-button')).toHaveClass('custom-button')
        }, TEST_TIMEOUT)

        it('should forward refs correctly', () => {
            const buttonRef = React.createRef<HTMLButtonElement>()

            render(<Button ref={buttonRef}>Ref Button</Button>)

            expect(buttonRef.current).toBeInstanceOf(HTMLButtonElement)
        }, TEST_TIMEOUT)
    })

    describe('Badge Component', () => {
        it('should render badge with default styling', () => {
            render(<Badge data-testid="test-badge">Badge Text</Badge>)

            const badge = screen.getByTestId('test-badge')
            expect(badge).toBeInTheDocument()
            expect(screen.getByText('Badge Text')).toBeInTheDocument()
        }, TEST_TIMEOUT)

        it('should support different variants', () => {
            render(
                <div>
                    <Badge variant="default" data-testid="default-badge">Default</Badge>
                    <Badge variant="secondary" data-testid="secondary-badge">Secondary</Badge>
                    <Badge variant="outline" data-testid="outline-badge">Outline</Badge>
                    <Badge variant="destructive" data-testid="destructive-badge">Destructive</Badge>
                </div>
            )

            expect(screen.getByTestId('default-badge')).toBeInTheDocument()
            expect(screen.getByTestId('secondary-badge')).toBeInTheDocument()
            expect(screen.getByTestId('outline-badge')).toBeInTheDocument()
            expect(screen.getByTestId('destructive-badge')).toBeInTheDocument()
        }, TEST_TIMEOUT)

        it('should support custom className', () => {
            render(<Badge className="custom-badge" data-testid="custom-badge">Custom</Badge>)

            expect(screen.getByTestId('custom-badge')).toHaveClass('custom-badge')
        }, TEST_TIMEOUT)

        it('should render with children content', () => {
            render(
                <Badge data-testid="badge-with-children">
                    <span>Icon</span>
                    Text
                </Badge>
            )

            const badge = screen.getByTestId('badge-with-children')
            expect(badge).toBeInTheDocument()
            expect(screen.getByText('Icon')).toBeInTheDocument()
            expect(screen.getByText('Text')).toBeInTheDocument()
        }, TEST_TIMEOUT)
    })

    describe('Progress Component', () => {
        it('should render progress bar with default value', () => {
            render(<Progress data-testid="test-progress" />)

            const progress = screen.getByTestId('test-progress')
            expect(progress).toBeInTheDocument()
            expect(progress).toHaveAttribute('role', 'progressbar')
        }, TEST_TIMEOUT)

        it('should render with specific value', () => {
            render(<Progress value={75} data-testid="progress-75" />)

            const progress = screen.getByTestId('progress-75')
            expect(progress).toBeInTheDocument()
            expect(progress).toHaveAttribute('aria-valuenow', '75')
        }, TEST_TIMEOUT)

        it('should handle edge values correctly', () => {
            const { rerender } = render(<Progress value={0} data-testid="progress-edge" />)

            let progress = screen.getByTestId('progress-edge')
            expect(progress).toHaveAttribute('aria-valuenow', '0')

            rerender(<Progress value={100} data-testid="progress-edge" />)
            progress = screen.getByTestId('progress-edge')
            expect(progress).toHaveAttribute('aria-valuenow', '100')
        }, TEST_TIMEOUT)

        it('should support custom className', () => {
            render(<Progress className="custom-progress" data-testid="custom-progress" />)

            expect(screen.getByTestId('custom-progress')).toHaveClass('custom-progress')
        }, TEST_TIMEOUT)

        it('should forward refs correctly', () => {
            const progressRef = React.createRef<HTMLDivElement>()

            render(<Progress ref={progressRef} />)

            expect(progressRef.current).toBeInstanceOf(HTMLDivElement)
        }, TEST_TIMEOUT)

        it('should have proper accessibility attributes', () => {
            render(<Progress value={50} data-testid="accessible-progress" />)

            const progress = screen.getByTestId('accessible-progress')
            expect(progress).toHaveAttribute('role', 'progressbar')
            expect(progress).toHaveAttribute('aria-valuemin', '0')
            expect(progress).toHaveAttribute('aria-valuemax', '100')
            expect(progress).toHaveAttribute('aria-valuenow', '50')
        }, TEST_TIMEOUT)
    })

    describe('Component Integration', () => {
        it('should work together in a composite component', () => {
            render(
                <Card data-testid="composite-card">
                    <CardHeader>
                        <CardTitle>Integration Test</CardTitle>
                        <CardDescription>Testing component integration</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Progress value={60} data-testid="card-progress" />
                        <Badge variant="secondary" data-testid="card-badge">60% Complete</Badge>
                    </CardContent>
                    <CardFooter>
                        <Button variant="outline" data-testid="card-button">View Details</Button>
                    </CardFooter>
                </Card>
            )

            expect(screen.getByTestId('composite-card')).toBeInTheDocument()
            expect(screen.getByRole('heading', { name: 'Integration Test' })).toBeInTheDocument()
            expect(screen.getByText('Testing component integration')).toBeInTheDocument()
            expect(screen.getByTestId('card-progress')).toHaveAttribute('aria-valuenow', '60')
            expect(screen.getByTestId('card-badge')).toBeInTheDocument()
            expect(screen.getByTestId('card-button')).toBeInTheDocument()
        }, TEST_TIMEOUT)

        it('should maintain styling consistency across components', () => {
            render(
                <div className="test-container">
                    <Card className="mb-4">
                        <CardContent>
                            <Button className="mr-2">Primary Action</Button>
                            <Badge variant="outline">Status</Badge>
                        </CardContent>
                    </Card>
                </div>
            )

            // Components should render without style conflicts
            expect(screen.getByRole('button')).toBeInTheDocument()
            expect(screen.getByText('Status')).toBeInTheDocument()
        }, TEST_TIMEOUT)

        it('should support nested component hierarchies', () => {
            render(
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle>Nested Components</CardTitle>
                            <Badge variant="secondary">Active</Badge>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <Progress value={80} />
                            <div className="flex gap-2">
                                <Button size="sm">Action 1</Button>
                                <Button size="sm" variant="outline">Action 2</Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )

            expect(screen.getByRole('heading', { name: 'Nested Components' })).toBeInTheDocument()
            expect(screen.getByText('Active')).toBeInTheDocument()
            expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '80')
            expect(screen.getByRole('button', { name: 'Action 1' })).toBeInTheDocument()
            expect(screen.getByRole('button', { name: 'Action 2' })).toBeInTheDocument()
        }, TEST_TIMEOUT)
    })

    describe('Error Handling', () => {
        it('should handle invalid progress values gracefully', () => {
            expect(() => {
                render(<Progress value={-10} />)
            }).not.toThrow()

            expect(() => {
                render(<Progress value={150} />)
            }).not.toThrow()
        }, TEST_TIMEOUT)

        it('should handle missing children gracefully', () => {
            expect(() => {
                render(<Card />)
            }).not.toThrow()

            expect(() => {
                render(<Button />)
            }).not.toThrow()

            expect(() => {
                render(<Badge />)
            }).not.toThrow()
        }, TEST_TIMEOUT)

        it('should handle undefined props gracefully', () => {
            expect(() => {
                render(<Progress value={undefined} />)
            }).not.toThrow()

            expect(() => {
                render(<Button variant={undefined}>Button</Button>)
            }).not.toThrow()
        }, TEST_TIMEOUT)
    })
})
