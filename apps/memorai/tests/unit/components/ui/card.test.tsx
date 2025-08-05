import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'

describe('Card Components', () => {
    describe('Card', () => {
        it('renders correctly with default props', () => {
            render(
                <Card data-testid="card">
                    <div>Card content</div>
                </Card>
            )
            
            const card = screen.getByTestId('card')
            expect(card).toBeInTheDocument()
            expect(card).toHaveClass('rounded-lg', 'border', 'bg-card')
            expect(screen.getByText('Card content')).toBeInTheDocument()
        })
        
        it('applies different variants correctly', () => {
            const { rerender } = render(<Card variant="elevated" data-testid="card" />)
            let card = screen.getByTestId('card')
            expect(card).toHaveClass('shadow-md')
            
            rerender(<Card variant="outline" data-testid="card" />)
            card = screen.getByTestId('card')
            expect(card).toHaveClass('border-2')
            
            rerender(<Card variant="ghost" data-testid="card" />)
            card = screen.getByTestId('card')
            expect(card).toHaveClass('border-transparent', 'shadow-none')
        })
        
        it('applies interactive styling when clickable', () => {
            render(<Card interactive data-testid="card" />)
            
            const card = screen.getByTestId('card')
            expect(card).toHaveClass('cursor-pointer')
            expect(card).toHaveClass('hover:scale-[1.02]', 'active:scale-[0.98]')
        })
        
        it('handles click events when interactive', async () => {
            const handleClick = vi.fn()
            const user = userEvent.setup()
            
            render(<Card interactive onClick={handleClick} data-testid="card" />)
            
            const card = screen.getByTestId('card')
            await user.click(card)
            
            expect(handleClick).toHaveBeenCalledTimes(1)
        })
        
        it('applies custom className correctly', () => {
            render(<Card className="custom-card-class" data-testid="card" />)
            
            const card = screen.getByTestId('card')
            expect(card).toHaveClass('custom-card-class')
        })
        
        it('forwards ref correctly', () => {
            const ref = vi.fn()
            render(<Card ref={ref} />)
            
            expect(ref).toHaveBeenCalledWith(expect.any(HTMLDivElement))
        })
    })
    
    describe('CardHeader', () => {
        it('renders correctly', () => {
            render(
                <CardHeader data-testid="card-header">
                    <div>Header content</div>
                </CardHeader>
            )
            
            const header = screen.getByTestId('card-header')
            expect(header).toBeInTheDocument()
            expect(header).toHaveClass('flex', 'flex-col', 'space-y-1.5', 'p-6')
            expect(screen.getByText('Header content')).toBeInTheDocument()
        })
        
        it('applies custom className correctly', () => {
            render(<CardHeader className="custom-header-class" data-testid="card-header" />)
            
            const header = screen.getByTestId('card-header')
            expect(header).toHaveClass('custom-header-class')
        })
    })
    
    describe('CardTitle', () => {
        it('renders correctly with default tag', () => {
            render(<CardTitle>Card Title</CardTitle>)
            
            const title = screen.getByText('Card Title')
            expect(title).toBeInTheDocument()
            expect(title.tagName).toBe('H3')
            expect(title).toHaveClass('text-2xl', 'font-semibold', 'leading-none', 'tracking-tight')
        })
        
        it('applies custom className correctly', () => {
            render(<CardTitle className="custom-title-class">Title</CardTitle>)
            
            const title = screen.getByText('Title')
            expect(title).toHaveClass('custom-title-class')
        })
    })
    
    describe('CardDescription', () => {
        it('renders correctly', () => {
            render(<CardDescription>Card description text</CardDescription>)
            
            const description = screen.getByText('Card description text')
            expect(description).toBeInTheDocument()
            expect(description.tagName).toBe('P')
            expect(description).toHaveClass('text-sm', 'text-muted-foreground')
        })
        
        it('applies custom className correctly', () => {
            render(<CardDescription className="custom-desc-class">Description</CardDescription>)
            
            const description = screen.getByText('Description')
            expect(description).toHaveClass('custom-desc-class')
        })
    })
    
    describe('CardContent', () => {
        it('renders correctly', () => {
            render(
                <CardContent data-testid="card-content">
                    <div>Content goes here</div>
                </CardContent>
            )
            
            const content = screen.getByTestId('card-content')
            expect(content).toBeInTheDocument()
            expect(content).toHaveClass('p-6', 'pt-0')
            expect(screen.getByText('Content goes here')).toBeInTheDocument()
        })
        
        it('applies custom className correctly', () => {
            render(<CardContent className="custom-content-class" data-testid="card-content" />)
            
            const content = screen.getByTestId('card-content')
            expect(content).toHaveClass('custom-content-class')
        })
    })
    
    describe('CardFooter', () => {
        it('renders correctly', () => {
            render(
                <CardFooter data-testid="card-footer">
                    <div>Footer content</div>
                </CardFooter>
            )
            
            const footer = screen.getByTestId('card-footer')
            expect(footer).toBeInTheDocument()
            expect(footer).toHaveClass('flex', 'items-center', 'p-6', 'pt-0')
            expect(screen.getByText('Footer content')).toBeInTheDocument()
        })
        
        it('applies custom className correctly', () => {
            render(<CardFooter className="custom-footer-class" data-testid="card-footer" />)
            
            const footer = screen.getByTestId('card-footer')
            expect(footer).toHaveClass('custom-footer-class')
        })
    })
    
    describe('Card Component Integration', () => {
        it('renders complete card structure correctly', () => {
            render(
                <Card data-testid="complete-card">
                    <CardHeader>
                        <CardTitle>Test Card Title</CardTitle>
                        <CardDescription>Test card description</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p>This is the card content area.</p>
                    </CardContent>
                    <CardFooter>
                        <button>Action Button</button>
                    </CardFooter>
                </Card>
            )
            
            const card = screen.getByTestId('complete-card')
            expect(card).toBeInTheDocument()
            
            expect(screen.getByText('Test Card Title')).toBeInTheDocument()
            expect(screen.getByText('Test card description')).toBeInTheDocument()
            expect(screen.getByText('This is the card content area.')).toBeInTheDocument()
            expect(screen.getByRole('button', { name: 'Action Button' })).toBeInTheDocument()
        })
        
        it('renders minimal card structure correctly', () => {
            render(
                <Card data-testid="minimal-card">
                    <CardContent>
                        <p>Just content, no header or footer</p>
                    </CardContent>
                </Card>
            )
            
            const card = screen.getByTestId('minimal-card')
            expect(card).toBeInTheDocument()
            expect(screen.getByText('Just content, no header or footer')).toBeInTheDocument()
        })
        
        it('handles interactive card with complex content', async () => {
            const handleClick = vi.fn()
            const user = userEvent.setup()
            
            render(
                <Card interactive onClick={handleClick} data-testid="interactive-card">
                    <CardHeader>
                        <CardTitle>Clickable Card</CardTitle>
                        <CardDescription>Click anywhere on this card</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p>Card content with various elements</p>
                    </CardContent>
                    <CardFooter>
                        <span>Footer info</span>
                    </CardFooter>
                </Card>
            )
            
            const card = screen.getByTestId('interactive-card')
            await user.click(card)
            
            expect(handleClick).toHaveBeenCalledTimes(1)
        })
        
        it('applies consistent styling across all components', () => {
            render(
                <Card className="border-red-500" data-testid="styled-card">
                    <CardHeader className="bg-gray-100">
                        <CardTitle className="text-red-600">Styled Title</CardTitle>
                        <CardDescription className="text-gray-600">Styled Description</CardDescription>
                    </CardHeader>
                    <CardContent className="bg-white">
                        <p>Styled content</p>
                    </CardContent>
                    <CardFooter className="bg-gray-50">
                        <span>Styled footer</span>
                    </CardFooter>
                </Card>
            )
            
            const card = screen.getByTestId('styled-card')
            expect(card).toHaveClass('border-red-500')
            
            const header = screen.getByText('Styled Title').closest('div')
            expect(header).toHaveClass('bg-gray-100')
            
            const title = screen.getByText('Styled Title')
            expect(title).toHaveClass('text-red-600')
            
            const description = screen.getByText('Styled Description')
            expect(description).toHaveClass('text-gray-600')
        })
        
        it('maintains proper DOM hierarchy', () => {
            render(
                <Card data-testid="hierarchy-card">
                    <CardHeader data-testid="header">
                        <CardTitle data-testid="title">Title</CardTitle>
                        <CardDescription data-testid="description">Description</CardDescription>
                    </CardHeader>
                    <CardContent data-testid="content">Content</CardContent>
                    <CardFooter data-testid="footer">Footer</CardFooter>
                </Card>
            )
            
            const card = screen.getByTestId('hierarchy-card')
            const header = screen.getByTestId('header')
            const content = screen.getByTestId('content')
            const footer = screen.getByTestId('footer')
            
            expect(card).toContainElement(header)
            expect(card).toContainElement(content)
            expect(card).toContainElement(footer)
            
            expect(header).toContainElement(screen.getByTestId('title'))
            expect(header).toContainElement(screen.getByTestId('description'))
        })
    })
})
