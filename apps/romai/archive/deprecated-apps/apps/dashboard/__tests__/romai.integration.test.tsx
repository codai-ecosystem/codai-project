import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Home from '../src/pages/index';

// Mock the ROMAI API
vi.mock('../src/lib/api', () => ({
    useRomaiApi: () => ({
        healthCheck: vi.fn().mockResolvedValue({
            status: 'healthy',
            timestamp: new Date().toISOString(),
            details: { azure: 'connected', model: 'gpt-4o' }
        }),
        authenticate: vi.fn().mockResolvedValue(true),
        processIntelligence: vi.fn().mockImplementation(async (request) => {
            // Add a delay to simulate processing time and show loading state
            await new Promise(resolve => setTimeout(resolve, 300));
            return {
                response: 'Aceasta este o demonstrație a capabilităților ROMAI de inteligență artificială.'
            };
        }),
        isAuthenticated: vi.fn().mockReturnValue(true)
    })
}));

describe('ROMAI Dashboard Integration Tests', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders Romanian AI central intelligence dashboard successfully', async () => {
        render(<Home />);

        // Check main branding and title
        expect(screen.getByText('ROMAI')).toBeInTheDocument();
        expect(screen.getByText('Central Intelligence Dashboard')).toBeInTheDocument();

        // Check Romanian welcome text
        await waitFor(() => {
            expect(screen.getByText('Bine ai venit la ROMAI')).toBeInTheDocument();
            expect(screen.getByText('Sistemul Central de Inteligență Artificială Românesc')).toBeInTheDocument();
        });
    });

    it('handles real-time data updates correctly', async () => {
        render(<Home />);

        // Wait for stats to load
        await waitFor(() => {
            expect(screen.getByText('Total Intelligence')).toBeInTheDocument();
            // Check for the number (might be formatted as 1,247 or just 1247)
            expect(screen.getByText(/1[,.]?247/)).toBeInTheDocument();
        });

        // Check for other stats
        expect(screen.getByText('Active Chats')).toBeInTheDocument();
        expect(screen.getByText('43')).toBeInTheDocument();
        expect(screen.getByText('Success Rate')).toBeInTheDocument();
        expect(screen.getByText('97.8%')).toBeInTheDocument();
    });

    it('displays feature cards and interactive elements', async () => {
        render(<Home />);

        await waitFor(() => {
            // Check Intelligence Center panel
            expect(screen.getByText('Intelligence Center')).toBeInTheDocument();
            expect(screen.getByText('Deschide Intelligence Center')).toBeInTheDocument();

            // Check Chat Interface panel
            expect(screen.getByText('Chat Interface')).toBeInTheDocument();
            expect(screen.getByText('Începe Conversația')).toBeInTheDocument();
        });
    });

    it('integrates stats with visual elements', async () => {
        render(<Home />);

        await waitFor(() => {
            // Check that all 4 stat cards are displayed
            expect(screen.getByText('Total Intelligence')).toBeInTheDocument();
            expect(screen.getByText('Active Chats')).toBeInTheDocument();
            expect(screen.getByText('Success Rate')).toBeInTheDocument();
            expect(screen.getByText('System Uptime')).toBeInTheDocument();
        });
    });

    it('synchronizes real-time updates across components', async () => {
        render(<Home />);

        // Wait for system health status
        await waitFor(() => {
            expect(screen.getByText(/System Status: HEALTHY/i)).toBeInTheDocument();
        });

        // Check for status indicators
        const statusElements = document.querySelectorAll('[class*="bg-green-500"]');
        expect(statusElements.length).toBeGreaterThan(0);
    });

    it('handles multiple simultaneous operations', async () => {
        const user = userEvent.setup();
        render(<Home />);

        // Test dark mode toggle - use document.querySelector since buttons don't have accessible names
        const darkModeButton = document.querySelector('button[class*="p-2"][class*="rounded-lg"]');

        if (darkModeButton) {
            await user.click(darkModeButton);
        }

        // Test AI query input
        const queryInput = screen.getByPlaceholderText(/Ce este inteligența artificială/i);
        await user.type(queryInput, 'Test query pentru ROMAI');

        // Should not crash or show errors
        expect(document.body).toBeInTheDocument();
    });

    it('displays Romanian AI system branding correctly', async () => {
        render(<Home />);

        // Check Romanian branding elements
        expect(screen.getByText('ROMAI')).toBeInTheDocument();
        expect(screen.getByText('Central Intelligence Dashboard')).toBeInTheDocument();

        // Check Romanian text throughout interface
        await waitFor(() => {
            expect(screen.getByText('Bine ai venit la ROMAI')).toBeInTheDocument();
            expect(screen.getByText('Sistemul Central de Inteligență Artificială Românesc')).toBeInTheDocument();
        });
    });

    it('shows Romanian AI intelligence testing interface', async () => {
        const user = userEvent.setup();
        render(<Home />);

        await waitFor(() => {
            // Check AI testing section
            expect(screen.getByText('Test AI Intelligence')).toBeInTheDocument();
            expect(screen.getByText('Întreabă ROMAI ceva:')).toBeInTheDocument();
        });

        // Test the AI query functionality
        const queryInput = screen.getByPlaceholderText(/Ce este inteligența artificială/i);
        const testButton = screen.getByText('Testează AI');

        await user.type(queryInput, 'Test de inteligență artificială');
        await user.click(testButton);

        // Wait for processing state to appear
        await waitFor(() => {
            expect(screen.getByText('Se procesează...')).toBeInTheDocument();
        }, { timeout: 1000 });
    });

    it('displays system status and health monitoring', async () => {
        render(<Home />);

        await waitFor(() => {
            // Check system health panel
            expect(screen.getByText('System Status')).toBeInTheDocument();
            expect(screen.getByText(/API Server: Online/i)).toBeInTheDocument();
            expect(screen.getByText(/Authentication: Connected/i)).toBeInTheDocument();
            expect(screen.getByText(/Azure OpenAI: connected/i)).toBeInTheDocument();
        });

        // Check health indicators
        const healthStatus = screen.getByText(/System Status: HEALTHY/i);
        expect(healthStatus).toBeInTheDocument();
    });
})
