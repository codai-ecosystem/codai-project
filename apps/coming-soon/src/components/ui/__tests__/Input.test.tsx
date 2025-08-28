import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Input } from '../Input';
import { ThemeProvider } from '@/contexts/ThemeContext';

// Test wrapper with providers
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
    <ThemeProvider>
        {children}
    </ThemeProvider>
);

describe('Input', () => {
    it('renders with default props', () => {
        render(
            <TestWrapper>
                <Input placeholder="Enter text" />
            </TestWrapper>
        );
        
        const input = screen.getByPlaceholderText('Enter text');
        expect(input).toBeInTheDocument();
        expect(input).toHaveAttribute('data-variant', 'primary');
        expect(input).toHaveAttribute('data-size', 'md');
    });

    it('renders with label', () => {
        render(
            <TestWrapper>
                <Input label="Username" placeholder="Enter username" />
            </TestWrapper>
        );
        
        const label = screen.getByText('Username');
        const input = screen.getByLabelText('Username');
        
        expect(label).toBeInTheDocument();
        expect(input).toBeInTheDocument();
    });

    it('shows required indicator', () => {
        render(
            <TestWrapper>
                <Input label="Email" required />
            </TestWrapper>
        );
        
        const requiredIndicator = screen.getByText('*');
        expect(requiredIndicator).toBeInTheDocument();
        expect(requiredIndicator).toHaveAttribute('aria-label', 'required');
    });

    it('shows error state', () => {
        render(
            <TestWrapper>
                <Input error helperText="This field is required" />
            </TestWrapper>
        );
        
        const input = screen.getByRole('textbox');
        const helperText = screen.getByText('This field is required');
        
        expect(input).toHaveAttribute('data-error', 'true');
        expect(input).toHaveAttribute('aria-invalid', 'true');
        expect(helperText).toBeInTheDocument();
    });

    it('shows success state', () => {
        render(
            <TestWrapper>
                <Input success helperText="Valid input" />
            </TestWrapper>
        );
        
        const input = screen.getByRole('textbox');
        const helperText = screen.getByText('Valid input');
        
        expect(input).toHaveAttribute('data-success', 'true');
        expect(helperText).toBeInTheDocument();
    });

    it('shows character count', () => {
        render(
            <TestWrapper>
                <Input showCharCount maxLength={10} defaultValue="test" />
            </TestWrapper>
        );
        
        const charCount = screen.getByText('4/10');
        expect(charCount).toBeInTheDocument();
    });

    it('handles input changes', () => {
        const handleChange = vi.fn();
        render(
            <TestWrapper>
                <Input onChange={handleChange} />
            </TestWrapper>
        );
        
        const input = screen.getByRole('textbox');
        fireEvent.change(input, { target: { value: 'test input' } });
        
        expect(handleChange).toHaveBeenCalled();
    });

    it('is disabled when disabled prop is true', () => {
        render(
            <TestWrapper>
                <Input disabled />
            </TestWrapper>
        );
        
        const input = screen.getByRole('textbox');
        expect(input).toBeDisabled();
    });

    it('supports custom testId', () => {
        render(
            <TestWrapper>
                <Input testId="custom-input" />
            </TestWrapper>
        );
        
        const input = screen.getByTestId('custom-input');
        expect(input).toBeInTheDocument();
    });
});