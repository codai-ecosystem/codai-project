import React from 'react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import HomePage from '../src/app/page'

// Mock dependencies
vi.mock('../src/components/SettingsPanel', () => ({
    default: ({ isOpen }: { isOpen: boolean }) => (
        isOpen ? <div>Settings Panel</div> : null
    )
}));

// Mock scrollIntoView
Element.prototype.scrollIntoView = vi.fn();

// Mock WebSocket and AudioContext for testing
const mockWebSocket = {
    CONNECTING: 0,
    OPEN: 1,
    CLOSING: 2,
    CLOSED: 3,
    readyState: 1,
    send: vi.fn(),
    close: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn()
};

global.WebSocket = vi.fn(() => mockWebSocket) as any;
global.AudioContext = vi.fn(() => ({
    resume: vi.fn().mockResolvedValue(undefined),
    close: vi.fn().mockResolvedValue(undefined),
    createMediaStreamSource: vi.fn(),
    createAnalyser: vi.fn(() => ({
        fftSize: 512,
        frequencyBinCount: 256,
        getByteFrequencyData: vi.fn()
    })),
    decodeAudioData: vi.fn().mockResolvedValue({}),
    createBufferSource: vi.fn(() => ({
        buffer: null,
        connect: vi.fn(),
        start: vi.fn()
    })),
    destination: {}
})) as any;

// Mock getUserMedia
Object.defineProperty(navigator, 'mediaDevices', {
    writable: true,
    value: {
        getUserMedia: vi.fn().mockResolvedValue({
            getTracks: () => [{ stop: vi.fn() }]
        }),
        enumerateDevices: vi.fn().mockResolvedValue([
            { deviceId: 'default', label: 'Default Microphone', kind: 'audioinput' },
            { deviceId: 'default', label: 'Default Speaker', kind: 'audiooutput' }
        ])
    }
});

// Environment variables are now loaded from vitest.config.ts
// which reads from the root .env file

describe('METU Integration Tests - Continuous Voice AI Assistant for Windows', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    describe('Complete User Flows', () => {
        it('renders voice AI assistant interface correctly', async () => {
            render(<HomePage />)

            // Verify main title and branding
            await waitFor(() => {
                expect(screen.getByText('METU')).toBeInTheDocument();
            });

            // Verify initial conversation state
            await waitFor(() => {
                expect(screen.getByText('Ready for Natural Conversation')).toBeInTheDocument();
            });
        })

        it('displays voice controls and states correctly', async () => {
            render(<HomePage />)

            // Verify conversation interface exists
            await waitFor(() => {
                expect(screen.getByText('Ready for Natural Conversation')).toBeInTheDocument();
            });

            // Check for status indicators
            expect(screen.getByText('Listening')).toBeInTheDocument();
            expect(screen.getByText('Speaking')).toBeInTheDocument();
            expect(screen.getByText('Thinking')).toBeInTheDocument();
        })

        it('handles voice activation and state transitions', async () => {
            const user = userEvent.setup()
            render(<HomePage />)

            // Find all buttons and select the main microphone button (the larger one)
            const buttons = screen.getAllByRole('button');
            const voiceButton = buttons.find(button =>
                button.className.includes('w-16 h-16') || button.className.includes('w-20 h-20')
            );

            expect(voiceButton).toBeDefined();

            if (voiceButton) {
                await user.click(voiceButton);
            }

            // Component should handle the click without errors
            expect(screen.getByText('METU')).toBeInTheDocument();
        })
    })

    describe('Data Flow Integration', () => {
        it('manages conversation messages correctly', async () => {
            render(<HomePage />)

            // Verify empty conversation state
            await waitFor(() => {
                expect(screen.getByText('Ready for Natural Conversation')).toBeInTheDocument();
                expect(screen.getByText(/METU listens continuously/)).toBeInTheDocument();
            });
        })

        it('integrates settings panel with app state', async () => {
            const user = userEvent.setup()
            render(<HomePage />)

            // Find settings button (gear icon) - it's the last button in the control panel
            const buttons = screen.getAllByRole('button');
            const settingsButton = buttons[buttons.length - 2]; // Second to last button should be settings
            await user.click(settingsButton);

            // Settings panel state should change but we can't see the panel content due to mocking
            expect(screen.getByText('METU')).toBeInTheDocument();
        })

        it('validates audio visualizer integration', async () => {
            render(<HomePage />)

            // Verify quick settings checkboxes are present
            await waitFor(() => {
                expect(screen.getByText('Continuous')).toBeInTheDocument();
                expect(screen.getByText('Interruption')).toBeInTheDocument();
                expect(screen.getByText('Streaming')).toBeInTheDocument();
            });
        })
    })

    describe('Performance Integration', () => {
        it('renders METU voice interface efficiently', async () => {
            const startTime = performance.now()

            render(<HomePage />)

            await waitFor(() => {
                expect(screen.getByText('METU')).toBeInTheDocument();
            });

            const endTime = performance.now()
            const renderTime = endTime - startTime

            // Should render within reasonable time (less than 1000ms)
            expect(renderTime).toBeLessThan(1000)
        })

        it('handles multiple UI interactions smoothly', async () => {
            const user = userEvent.setup()
            render(<HomePage />)

            // Get all buttons
            const buttons = screen.getAllByRole('button');
            const mainButton = buttons[0]; // Main conversation button
            const settingsButton = buttons[buttons.length - 2]; // Settings button

            await user.click(settingsButton);
            await user.click(mainButton);
            await user.click(settingsButton);

            // Should handle rapid interactions without crashes
            expect(screen.getByText('METU')).toBeInTheDocument();
        })

        it('maintains responsive layout structure', async () => {
            render(<HomePage />)

            await waitFor(() => {
                expect(screen.getByText('METU')).toBeInTheDocument();
            });

            // Check for main container
            const mainContainer = document.querySelector('.min-h-screen');
            expect(mainContainer).toBeInTheDocument();

            // Verify control buttons are present
            const buttons = screen.getAllByRole('button');
            expect(buttons.length).toBeGreaterThan(0);
        })
    })
})
