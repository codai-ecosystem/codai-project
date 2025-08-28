import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Card, CardHeader, CardContent, CardFooter } from '../Card';
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

describe('Card', () => {
    it('renders with default props', () => {
        render(
            <TestWrapper>
                <Card>Card content</Card>
            </TestWrapper>
        );
        
        const card = screen.getByText('Card content');
        expect(card).toBeInTheDocument();
        expect(card).toHaveAttribute('data-variant', 'default');
        expect(card).toHaveAttribute('data-size', 'md');
    });

    it('renders with custom variant and size', () => {
        render(
            <TestWrapper>
                <Card variant="outlined" size="lg">Outlined Card</Card>
            </TestWrapper>
        );
        
        const card = screen.getByText('Outlined Card');
        expect(card).toHaveAttribute('data-variant', 'outlined');
        expect(card).toHaveAttribute('data-size', 'lg');
    });

    it('renders as interactive when interactive prop is true', () => {
        render(
            <TestWrapper>
                <Card interactive>Interactive Card</Card>
            </TestWrapper>
        );
        
        const card = screen.getByText('Interactive Card');
        expect(card).toHaveAttribute('role', 'button');
        expect(card).toHaveAttribute('tabIndex', '0');
    });

    it('shows loading state', () => {
        render(
            <TestWrapper>
                <Card loading>Loading Card</Card>
            </TestWrapper>
        );
        
        const card = screen.getByText('Loading Card');
        expect(card).toHaveAttribute('data-loading', 'true');
        
        // Should show loading spinner
        const spinner = card.querySelector('.animate-spin');
        expect(spinner).toBeInTheDocument();
    });

    it('supports custom testId', () => {
        render(
            <TestWrapper>
                <Card testId="custom-card">Custom Card</Card>
            </TestWrapper>
        );
        
        const card = screen.getByTestId('custom-card');
        expect(card).toBeInTheDocument();
    });
});

describe('CardHeader', () => {
    it('renders with border', () => {
        render(
            <TestWrapper>
                <Card>
                    <CardHeader>Header</CardHeader>
                </Card>
            </TestWrapper>
        );
        
        const header = screen.getByText('Header');
        expect(header).toBeInTheDocument();
        expect(header).toHaveClass('border-b');
    });
});

describe('CardContent', () => {
    it('renders content', () => {
        render(
            <TestWrapper>
                <Card>
                    <CardContent>Content</CardContent>
                </Card>
            </TestWrapper>
        );
        
        const content = screen.getByText('Content');
        expect(content).toBeInTheDocument();
    });
});

describe('CardFooter', () => {
    it('renders with border', () => {
        render(
            <TestWrapper>
                <Card>
                    <CardFooter>Footer</CardFooter>
                </Card>
            </TestWrapper>
        );
        
        const footer = screen.getByText('Footer');
        expect(footer).toBeInTheDocument();
        expect(footer).toHaveClass('border-t');
    });
});