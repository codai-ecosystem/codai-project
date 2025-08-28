import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Loader } from '../Loader';
import { ThemeProvider } from '@/contexts/ThemeContext';

// Test wrapper with providers
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
    <ThemeProvider>
        {children}
    </ThemeProvider>
);

describe('Loader', () => {
    it('renders spinner variant by default', () => {
        render(
            <TestWrapper>
                <Loader />
            </TestWrapper>
        );
        
        const loader = screen.getByRole('generic');
        const spinner = loader.querySelector('.animate-spin');
        expect(spinner).toBeInTheDocument();
    });

    it('renders with loading text', () => {
        render(
            <TestWrapper>
                <Loader text="Loading..." />
            </TestWrapper>
        );
        
        const text = screen.getByText('Loading...');
        expect(text).toBeInTheDocument();
    });

    it('renders dots variant', () => {
        render(
            <TestWrapper>
                <Loader variant="dots" />
            </TestWrapper>
        );
        
        const loader = screen.getByRole('generic');
        const dots = loader.querySelectorAll('.animate-pulse');
        expect(dots).toHaveLength(3);
    });

    it('renders pulse variant', () => {
        render(
            <TestWrapper>
                <Loader variant="pulse" />
            </TestWrapper>
        );
        
        const loader = screen.getByRole('generic');
        const pulse = loader.querySelector('.animate-pulse');
        expect(pulse).toBeInTheDocument();
    });

    it('renders bars variant', () => {
        render(
            <TestWrapper>
                <Loader variant="bars" />
            </TestWrapper>
        );
        
        const loader = screen.getByRole('generic');
        const bars = loader.querySelectorAll('.animate-pulse');
        expect(bars).toHaveLength(4);
    });

    it('renders skeleton variant', () => {
        render(
            <TestWrapper>
                <Loader variant="skeleton" />
            </TestWrapper>
        );
        
        const loader = screen.getByRole('generic');
        expect(loader).toHaveClass('animate-pulse');
    });

    it('supports different sizes', () => {
        const { rerender } = render(
            <TestWrapper>
                <Loader size="sm" testId="loader" />
            </TestWrapper>
        );
        
        let loader = screen.getByTestId('loader');
        let spinner = loader.querySelector('.w-5.h-5');
        expect(spinner).toBeInTheDocument();

        rerender(
            <TestWrapper>
                <Loader size="lg" testId="loader" />
            </TestWrapper>
        );
        
        loader = screen.getByTestId('loader');
        spinner = loader.querySelector('.w-8.h-8');
        expect(spinner).toBeInTheDocument();
    });

    it('supports custom testId', () => {
        render(
            <TestWrapper>
                <Loader testId="custom-loader" />
            </TestWrapper>
        );
        
        const loader = screen.getByTestId('custom-loader');
        expect(loader).toBeInTheDocument();
    });
});