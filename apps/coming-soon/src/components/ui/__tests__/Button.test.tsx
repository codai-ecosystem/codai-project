import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '../Button';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { MotionProvider } from '@/contexts/MotionContext';

// Test wrapper with providers
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
    <ThemeProvider>
        <MotionProvider>
            {children}
        </MotionProvider>
    </ThemeProvider>
);

describe('Button', () => {
    it('renders with default props', () => {
        render(
            <TestWrapper>
                <Button>Click me</Button>
            </TestWrapper>
        );
        
        const button = screen.getByRole('button', { name: /click me/i });
        expect(button).toBeInTheDocument();
        expect(button).toHaveAttribute('data-variant', 'primary');
        expect(button).toHaveAttribute('data-size', 'md');
    });

    it('renders with custom variant and size', () => {
        render(
            <TestWrapper>
                <Button variant="secondary" size="lg">Large Secondary</Button>
            </TestWrapper>
        );
        
        const button = screen.getByRole('button', { name: /large secondary/i });
        expect(button).toHaveAttribute('data-variant', 'secondary');
        expect(button).toHaveAttribute('data-size', 'lg');
    });

    it('handles click events', () => {
        const handleClick = vi.fn();
        render(
            <TestWrapper>
                <Button onClick={handleClick}>Click me</Button>
            </TestWrapper>
        );
        
        const button = screen.getByRole('button', { name: /click me/i });
        fireEvent.click(button);
        
        expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('shows loading state', () => {
        render(
            <TestWrapper>
                <Button loading>Loading</Button>
            </TestWrapper>
        );
        
        const button = screen.getByRole('button', { name: /loading/i });
        expect(button).toBeDisabled();
        expect(button).toHaveAttribute('aria-busy', 'true');
        expect(button).toHaveAttribute('data-loading', 'true');
    });

    it('shows success state', () => {
        render(
            <TestWrapper>
                <Button success>Success</Button>
            </TestWrapper>
        );
        
        const button = screen.getByRole('button', { name: /success/i });
        expect(button).toHaveAttribute('data-success', 'true');
    });

    it('shows error state', () => {
        render(
            <TestWrapper>
                <Button error>Error</Button>
            </TestWrapper>
        );
        
        const button = screen.getByRole('button', { name: /error/i });
        expect(button).toHaveAttribute('data-error', 'true');
    });

    it('is disabled when disabled prop is true', () => {
        render(
            <TestWrapper>
                <Button disabled>Disabled</Button>
            </TestWrapper>
        );
        
        const button = screen.getByRole('button', { name: /disabled/i });
        expect(button).toBeDisabled();
    });

    it('prevents click when loading', () => {
        const handleClick = vi.fn();
        render(
            <TestWrapper>
                <Button loading onClick={handleClick}>Loading</Button>
            </TestWrapper>
        );
        
        const button = screen.getByRole('button', { name: /loading/i });
        fireEvent.click(button);
        
        expect(handleClick).not.toHaveBeenCalled();
    });

    it('renders with fullWidth', () => {
        render(
            <TestWrapper>
                <Button fullWidth>Full Width</Button>
            </TestWrapper>
        );
        
        const button = screen.getByRole('button', { name: /full width/i });
        expect(button).toHaveClass('w-full');
    });

    it('supports custom testId', () => {
        render(
            <TestWrapper>
                <Button testId="custom-button">Custom</Button>
            </TestWrapper>
        );
        
        const button = screen.getByTestId('custom-button');
        expect(button).toBeInTheDocument();
    });
});