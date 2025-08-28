import '@testing-library/jest-dom';
import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Dashboard from '../Dashboard';

const mockProjects = [
    {
        id: '1',
        name: 'AI Chat Application',
        description: 'Modern chat interface with AI capabilities',
        status: 'active' as const,
        progress: 75,
        members: 4,
        updatedAt: new Date('2025-01-15')
    }
];

describe('CODAI Dashboard Tests', () => {
    it('renders without errors', () => {
        const { container } = render(<Dashboard projects={mockProjects} />);
        expect(container).toBeInTheDocument();
    });
});
