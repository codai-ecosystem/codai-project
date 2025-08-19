import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import '@testing-library/jest-dom';
import LoadingState from './LoadingState';

describe('LoadingState Component', () => {
    it('renders with default message', () => {
        render(<LoadingState />);

        expect(screen.getByText('Loading...')).toBeInTheDocument();
        expect(screen.getByText('Establishing real AGI connection...')).toBeInTheDocument();
    });

    it('renders with custom message', () => {
        const customMessage = 'Connecting to Romanian AGI server...';
        render(<LoadingState message={customMessage} />);

        expect(screen.getByText(customMessage)).toBeInTheDocument();
        expect(screen.getByText('Establishing real AGI connection...')).toBeInTheDocument();
    });

    it('displays loading spinner', () => {
        render(<LoadingState />);

        const spinner = document.querySelector('.animate-spin');
        expect(spinner).toBeInTheDocument();
        expect(spinner).toHaveClass('rounded-full', 'border-b-2', 'border-blue-600');
    });

    it('has proper styling structure', () => {
        render(<LoadingState />);

        const container = document.querySelector('.flex.items-center.justify-center');
        expect(container).toBeInTheDocument();
        expect(container).toHaveClass('min-h-[400px]');
    });

    it('supports dark mode styling', () => {
        render(<LoadingState />);

        const messageElement = screen.getByText('Loading...');
        expect(messageElement).toHaveClass('dark:text-gray-300');

        const subMessage = screen.getByText('Establishing real AGI connection...');
        expect(subMessage).toHaveClass('dark:text-gray-400');
    });

    it('is accessible', () => {
        render(<LoadingState />);

        // Should have text that screen readers can access
        expect(screen.getByText('Loading...')).toBeInTheDocument();
        expect(screen.getByText('Establishing real AGI connection...')).toBeInTheDocument();
    });
});
