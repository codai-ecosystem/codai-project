import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Button, buttonVariants } from '@/components/ui/button'
import { CheckCircle, Plus } from 'lucide-react'

describe('Button Component', () => {
    it('renders correctly with default props', () => {
        render(<Button>Click Me</Button>)
        
        const button = screen.getByRole('button', { name: /click me/i })
        expect(button).toBeInTheDocument()
        
        // Check for CVA computed classes instead of individual classes
        expect(button).toHaveClass('inline-flex', 'items-center', 'justify-center')
        expect(button).toHaveClass('bg-primary', 'text-primary-foreground')
    })
    
    it('applies different variants correctly', () => {
        const { rerender } = render(<Button variant="secondary">Button</Button>)
        let button = screen.getByRole('button')
        expect(button).toHaveClass('bg-secondary', 'text-secondary-foreground')
        
        rerender(<Button variant="destructive">Button</Button>)
        button = screen.getByRole('button')
        expect(button).toHaveClass('bg-destructive', 'text-destructive-foreground')
        
        rerender(<Button variant="outline">Button</Button>)
        button = screen.getByRole('button')
        expect(button).toHaveClass('border', 'border-input', 'bg-background')
    })
    
    it('applies different sizes correctly', () => {
        const { rerender } = render(<Button size="sm">Button</Button>)
        let button = screen.getByRole('button')
        expect(button).toHaveClass('h-8', 'px-3')
        
        rerender(<Button size="lg">Button</Button>)
        button = screen.getByRole('button')
        expect(button).toHaveClass('h-12', 'px-8')
    })
    
    it('shows loading state correctly', () => {
        render(<Button loading loadingText="Saving...">Save</Button>)
        
        const button = screen.getByRole('button')
        expect(button).toBeDisabled()
        expect(button).toHaveAttribute('aria-disabled', 'true')
        expect(screen.getByText('Saving...')).toBeInTheDocument()
        expect(screen.getByRole('img', { name: /loading/i })).toBeInTheDocument()
    })
    
    it('renders with left and right icons', () => {
        render(
            <Button 
                leftIcon={<Plus />}
                rightIcon={<CheckCircle />}
            >
                Save Changes
            </Button>
        )

        expect(screen.getByTestId('plus-icon')).toBeInTheDocument()
        expect(screen.getByTestId('check-circle-icon')).toBeInTheDocument()
        expect(screen.getByText('Save Changes')).toBeInTheDocument()
    })
    
    it('handles click events correctly', async () => {
        const handleClick = vi.fn()
        const user = userEvent.setup()
        
        render(<Button onClick={handleClick}>Click Me</Button>)
        
        await user.click(screen.getByRole('button'))
        expect(handleClick).toHaveBeenCalledTimes(1)
    })
    
    it('respects disabled state', async () => {
        const handleClick = vi.fn()
        const user = userEvent.setup()
        
        render(<Button disabled onClick={handleClick}>Disabled</Button>)
        
        const button = screen.getByRole('button')
        expect(button).toBeDisabled()
        
        await user.click(button)
        expect(handleClick).not.toHaveBeenCalled()
    })
    
    it('applies custom className correctly', () => {
        render(<Button className="custom-class">Button</Button>)
        
        const button = screen.getByRole('button')
        expect(button).toHaveClass('custom-class')
    })
    
    it('forwards ref correctly', () => {
        const ref = vi.fn()
        render(<Button ref={ref}>Button</Button>)
        
        expect(ref).toHaveBeenCalledWith(expect.any(HTMLButtonElement))
    })
    
    it('renders gradient variant correctly', () => {
        render(<Button variant="gradient">Gradient Button</Button>)
        
        const button = screen.getByRole('button')
        expect(button).toHaveClass('bg-gradient-to-r', 'from-blue-500', 'to-purple-600')
    })
    
    it('renders success variant correctly', () => {
        render(<Button variant="success">Success Button</Button>)
        
        const button = screen.getByRole('button')
        expect(button).toHaveClass('bg-green-500', 'text-white')
    })
    
    it('applies active scale effect', () => {
        render(<Button>Button</Button>)
        
        const button = screen.getByRole('button')
        expect(button).toHaveClass('active:scale-95')
    })
})
