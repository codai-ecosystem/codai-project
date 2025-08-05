import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Input } from '@/components/ui/input'
import { Mail, Eye } from 'lucide-react'

describe('Input Component', () => {
    it('renders correctly with default props', () => {
        render(<Input placeholder="Enter text" />)
        
        const input = screen.getByRole('textbox')
        expect(input).toBeInTheDocument()
        expect(input).toHaveAttribute('placeholder', 'Enter text')
        expect(input).toHaveClass('border-input')
    })
    
    it('renders with label correctly', () => {
        render(<Input label="Email Address" placeholder="Enter email" />)
        
        const label = screen.getByText('Email Address')
        const input = screen.getByRole('textbox')
        
        expect(label).toBeInTheDocument()
        expect(label).toHaveAttribute('for', input.id)
    })
    
    it('shows required indicator when required', () => {
        render(<Input label="Password" required />)
        
        expect(screen.getByText('*')).toBeInTheDocument()
        expect(screen.getByText('*')).toHaveClass('text-red-500')
    })
    
    it('displays error state correctly', () => {
        render(<Input error="This field is required" />)
        
        const input = screen.getByRole('textbox')
        const errorMessage = screen.getByText('This field is required')
        
        expect(input).toHaveClass('border-red-500')
        expect(errorMessage).toBeInTheDocument()
        expect(errorMessage).toHaveClass('text-red-600')
        expect(errorMessage).toHaveAttribute('role', 'alert')
    })
    
    it('displays success state correctly', () => {
        render(<Input success="Email is valid" />)
        
        const input = screen.getByRole('textbox')
        const successMessage = screen.getByText('Email is valid')
        
        expect(input).toHaveClass('border-green-500')
        expect(successMessage).toBeInTheDocument()
        expect(successMessage).toHaveClass('text-green-600')
    })
    
    it('displays warning state correctly', () => {
        render(<Input warning="Password strength is weak" />)
        
        const input = screen.getByRole('textbox')
        const warningMessage = screen.getByText('Password strength is weak')
        
        expect(input).toHaveClass('border-yellow-500')
        expect(warningMessage).toBeInTheDocument()
        expect(warningMessage).toHaveClass('text-yellow-600')
    })
    
    it('renders with left icon correctly', () => {
        render(<Input leftIcon={<Mail data-testid="mail-icon" />} />)
        
        const input = screen.getByRole('textbox')
        const icon = screen.getByTestId('mail-icon')
        
        expect(icon).toBeInTheDocument()
        expect(input).toHaveClass('pl-10')
    })
    
    it('renders with right icon correctly', () => {
        render(<Input rightIcon={<Eye data-testid="eye-icon" />} />)
        
        const input = screen.getByRole('textbox')
        const icon = screen.getByTestId('eye-icon')
        
        expect(icon).toBeInTheDocument()
        expect(input).toHaveClass('pr-10')
    })
    
    it('renders with both left and right icons', () => {
        render(
            <Input 
                leftIcon={<Mail data-testid="mail-icon" />}
                rightIcon={<Eye data-testid="eye-icon" />}
            />
        )
        
        const input = screen.getByRole('textbox')
        
        expect(screen.getByTestId('mail-icon')).toBeInTheDocument()
        expect(screen.getByTestId('eye-icon')).toBeInTheDocument()
        expect(input).toHaveClass('pl-10', 'pr-10')
    })
    
    it('displays helper text correctly', () => {
        render(<Input helperText="Enter your email address" />)
        
        const helperText = screen.getByText('Enter your email address')
        expect(helperText).toBeInTheDocument()
        expect(helperText).toHaveClass('text-muted-foreground')
    })
    
    it('prioritizes error over helper text', () => {
        render(
            <Input 
                helperText="Enter your email address"
                error="Email is required"
            />
        )
        
        expect(screen.getByText('Email is required')).toBeInTheDocument()
        expect(screen.queryByText('Enter your email address')).not.toBeInTheDocument()
    })
    
    it('applies different sizes correctly', () => {
        const { rerender } = render(<Input size="sm" />)
        let input = screen.getByRole('textbox')
        expect(input).toHaveClass('h-8', 'px-2', 'text-xs')
        
        rerender(<Input size="lg" />)
        input = screen.getByRole('textbox')
        expect(input).toHaveClass('h-12', 'px-4', 'text-base')
    })
    
    it('handles input changes correctly', async () => {
        const handleChange = vi.fn()
        const user = userEvent.setup()
        
        render(<Input onChange={handleChange} />)
        
        const input = screen.getByRole('textbox')
        await user.type(input, 'test input')
        
        expect(handleChange).toHaveBeenCalled()
        expect(input).toHaveValue('test input')
    })
    
    it('forwards ref correctly', () => {
        const ref = vi.fn()
        render(<Input ref={ref} />)
        
        expect(ref).toHaveBeenCalledWith(expect.any(HTMLInputElement))
    })
    
    it('generates unique ID when not provided', () => {
        render(<Input label="Test Label" />)
        
        const input = screen.getByRole('textbox')
        const label = screen.getByText('Test Label')
        
        expect(input.id).toBeTruthy()
        expect(label).toHaveAttribute('for', input.id)
    })
    
    it('uses provided ID correctly', () => {
        render(<Input id="custom-id" label="Test Label" />)
        
        const input = screen.getByRole('textbox')
        const label = screen.getByText('Test Label')
        
        expect(input.id).toBe('custom-id')
        expect(label).toHaveAttribute('for', 'custom-id')
    })
})
