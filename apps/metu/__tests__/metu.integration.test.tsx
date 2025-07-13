import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MetuVoiceAI from '../src/App';

describe('METU Integration Tests', () => {
    let user: ReturnType<typeof userEvent.setup>;

    beforeEach(() => {
        user = userEvent.setup();
        vi.clearAllMocks();

        // Setup speech recognition support
        Object.defineProperty(window, 'webkitSpeechRecognition', {
            value: vi.fn().mockImplementation(() => ({
                start: vi.fn(),
                stop: vi.fn(),
                abort: vi.fn(),
                addEventListener: vi.fn(),
                removeEventListener: vi.fn(),
                continuous: false,
                interimResults: false,
                lang: 'en-US',
            })),
            writable: true,
        });
    });

    afterEach(() => {
        vi.resetAllMocks();
    });

    describe('Voice AI Assistant Integration', () => {
        it('renders main interface with voice controls', async () => {
            render(<MetuVoiceAI />);

            // Check main title and branding
            expect(screen.getByText('METU Voice AI')).toBeInTheDocument();
            expect(screen.getByText('Intelligent Conversational Assistant')).toBeInTheDocument();
            expect(screen.getByText('Powered by Advanced AI • Real-time Voice Recognition')).toBeInTheDocument();

            // Check character display
            expect(screen.getByText('METU')).toBeInTheDocument();
            expect(screen.getByText('Your AI Assistant')).toBeInTheDocument();

            // Check voice controls
            expect(screen.getByText('Ready to listen')).toBeInTheDocument();
            expect(screen.getByText('Press Ctrl+Space or click to activate')).toBeInTheDocument();

            // Check conversation panel
            expect(screen.getByText('Conversation')).toBeInTheDocument();
            expect(screen.getByText('Start a conversation with METU')).toBeInTheDocument();
            expect(screen.getByText('Click the microphone to begin')).toBeInTheDocument();

            // Check audio visualizer
            expect(screen.getByText('Audio Activity')).toBeInTheDocument();

            console.log('[USER] interface-load', {
                page: 'metu-voice-ai',
                timestamp: new Date().toISOString(),
                components: ['voice-controls', 'character', 'conversation', 'audio-visualizer']
            });
        });

        it('handles voice controls and state transitions', async () => {
            render(<MetuVoiceAI />);

            // Find microphone button by looking for the large voice control button
            const micButtons = screen.getAllByRole('button');
            const micButton = micButtons.find(button =>
                button.className.includes('w-24 h-24') ||
                button.className.includes('cursor-pointer')
            );
            expect(micButton).toBeInTheDocument();

            // Click to start listening
            await user.click(micButton!);

            // Should show listening state
            await waitFor(() => {
                expect(screen.getByText('Listening...')).toBeInTheDocument();
            });

            console.log('[USER] voice-interaction', {
                action: 'start-listening',
                state: 'listening',
                timestamp: new Date().toISOString()
            });

            // Test settings button
            const settingsButton = screen.getByRole('button', { name: /settings/i });
            await user.click(settingsButton);

            await waitFor(() => {
                expect(screen.getByText('Settings')).toBeInTheDocument();
                expect(screen.getByText('Voice Recognition')).toBeInTheDocument();
                expect(screen.getByText('Language')).toBeInTheDocument();
            });

            console.log('[USER] settings-access', {
                action: 'open-settings',
                timestamp: new Date().toISOString()
            });
        });

        it('manages voice settings and preferences', async () => {
            render(<MetuVoiceAI />);

            // Open settings
            const settingsButton = screen.getByRole('button', { name: /settings/i });
            await user.click(settingsButton);

            await waitFor(() => {
                expect(screen.getByText('Settings')).toBeInTheDocument();
            });

            // Check voice recognition toggle
            const voiceToggle = screen.getByRole('button', { name: /voice recognition/i });
            expect(voiceToggle).toBeInTheDocument();

            // Check volume control
            const volumeSlider = screen.getByRole('slider');
            expect(volumeSlider).toBeInTheDocument();
            expect(volumeSlider).toHaveValue('0.8');

            // Check language selector
            const languageSelect = screen.getByRole('combobox');
            expect(languageSelect).toBeInTheDocument();
            expect(languageSelect).toHaveValue('en-US');

            // Test changing language
            await user.selectOptions(languageSelect, 'es-ES');
            expect(languageSelect).toHaveValue('es-ES');

            // Test adjusting volume
            await user.clear(volumeSlider);
            await user.type(volumeSlider, '0.5');

            console.log('[USER] settings-change', {
                action: 'update-preferences',
                settings: { language: 'es-ES', volume: 0.5 },
                timestamp: new Date().toISOString()
            });

            // Close settings
            const closeButton = screen.getByRole('button', { name: /×/i });
            await user.click(closeButton);

            await waitFor(() => {
                expect(screen.queryByText('Settings')).not.toBeInTheDocument();
            });
        });

        it('handles test voice functionality', async () => {
            render(<MetuVoiceAI />);

            // Find and click test voice button
            const testVoiceButton = screen.getByRole('button', { name: /test voice/i });
            expect(testVoiceButton).toBeInTheDocument();

            // Mock speech synthesis
            const mockSpeak = vi.fn();
            Object.defineProperty(window, 'speechSynthesis', {
                value: { speak: mockSpeak },
                writable: true,
            });

            await user.click(testVoiceButton);

            // Should trigger speaking state briefly
            await waitFor(() => {
                expect(screen.getByText('Speaking...')).toBeInTheDocument();
            }, { timeout: 1000 });

            console.log('[USER] voice-test', {
                action: 'test-speech-synthesis',
                timestamp: new Date().toISOString()
            });
        });

        it('demonstrates keyboard shortcuts functionality', async () => {
            render(<MetuVoiceAI />);

            // Test Ctrl+Space shortcut
            await user.keyboard('{Control>}{Space}{/Control}');

            await waitFor(() => {
                expect(screen.getByText('Listening...')).toBeInTheDocument();
            });

            console.log('[USER] keyboard-shortcut', {
                action: 'ctrl-space-activation',
                timestamp: new Date().toISOString()
            });

            // Test Escape key (for settings)
            const settingsButton = screen.getByRole('button', { name: /settings/i });
            await user.click(settingsButton);

            await waitFor(() => {
                expect(screen.getByText('Settings')).toBeInTheDocument();
            });

            // Press Escape to close
            await user.keyboard('{Escape}');

            await waitFor(() => {
                expect(screen.queryByText('Settings')).not.toBeInTheDocument();
            });
        });

        it('simulates complete conversation flow', async () => {
            render(<MetuVoiceAI />);

            // Start listening - find microphone button by characteristics
            const micButtons = screen.getAllByRole('button');
            const micButton = micButtons.find(button =>
                button.className.includes('w-24 h-24') ||
                button.className.includes('cursor-pointer')
            );
            await user.click(micButton!);

            await waitFor(() => {
                expect(screen.getByText('Listening...')).toBeInTheDocument();
            });

            // Wait for processing state
            await waitFor(() => {
                expect(screen.getByText('Processing...')).toBeInTheDocument();
            }, { timeout: 4000 });

            // Wait for conversation to appear
            await waitFor(() => {
                expect(screen.getByText('Hello METU, how are you today?')).toBeInTheDocument();
            }, { timeout: 6000 });

            // Check for AI response
            await waitFor(() => {
                expect(screen.getByText(/Hello! I'm doing great, thank you for asking/)).toBeInTheDocument();
            }, { timeout: 8000 });

            console.log('[USER] conversation-complete', {
                flow: 'voice-recognition-to-ai-response',
                timestamp: new Date().toISOString(),
                userMessage: 'Hello METU, how are you today?',
                aiResponse: 'Hello! I\'m doing great, thank you for asking...'
            });

            // Test clear conversation
            const clearButton = screen.getByRole('button', { name: /clear/i });
            await user.click(clearButton);

            await waitFor(() => {
                expect(screen.queryByText('Hello METU, how are you today?')).not.toBeInTheDocument();
                expect(screen.getByText('Start a conversation with METU')).toBeInTheDocument();
            });
        });
    });

    describe('Real-time Audio Processing', () => {
        it('displays audio visualizer activity', async () => {
            render(<MetuVoiceAI />);

            // Check audio visualizer exists
            expect(screen.getByText('Audio Activity')).toBeInTheDocument();

            // Start listening to activate visualizer - find microphone button
            const micButtons = screen.getAllByRole('button');
            const micButton = micButtons.find(button =>
                button.className.includes('w-24 h-24') ||
                button.className.includes('cursor-pointer')
            );
            await user.click(micButton!);

            await waitFor(() => {
                expect(screen.getByText('Listening...')).toBeInTheDocument();
            });

            console.log('[USER] audio-visualizer', {
                state: 'active',
                timestamp: new Date().toISOString()
            });
        });

        it('handles voice state transitions correctly', async () => {
            render(<MetuVoiceAI />);

            // Initial state
            expect(screen.getByText('Ready to listen')).toBeInTheDocument();

            // Start listening - find microphone button
            const micButtons = screen.getAllByRole('button');
            const micButton = micButtons.find(button =>
                button.className.includes('w-24 h-24') ||
                button.className.includes('cursor-pointer')
            );
            await user.click(micButton!);

            // Listening state
            await waitFor(() => {
                expect(screen.getByText('Listening...')).toBeInTheDocument();
            });

            // Processing state
            await waitFor(() => {
                expect(screen.getByText('Processing...')).toBeInTheDocument();
            }, { timeout: 4000 });

            console.log('[USER] state-transition', {
                states: ['idle', 'listening', 'processing'],
                timestamp: new Date().toISOString()
            });
        });
    });

    describe('Accessibility and User Experience', () => {
        it('provides keyboard navigation support', async () => {
            render(<MetuVoiceAI />);

            // Check if main interactive elements are keyboard accessible
            const micButtons = screen.getAllByRole('button');
            const settingsButton = screen.getByRole('button', { name: /settings/i });
            const testVoiceButton = screen.getByRole('button', { name: /test voice/i });

            expect(micButtons.length).toBeGreaterThan(0);
            expect(settingsButton).toBeInTheDocument();
            expect(testVoiceButton).toBeInTheDocument();

            // Test tab navigation
            await user.tab();
            // First focusable element should be focused

            console.log('[USER] accessibility-check', {
                keyboardNavigation: true,
                timestamp: new Date().toISOString()
            });
        });

        it('displays appropriate error states', async () => {
            // Remove speech recognition support for this test
            delete (window as any).webkitSpeechRecognition;
            delete (window as any).SpeechRecognition;

            render(<MetuVoiceAI />);

            // Wait for component to detect lack of support
            await waitFor(() => {
                expect(screen.getByText('Voice not supported')).toBeInTheDocument();
            });

            expect(screen.getByText('Voice recognition not supported in this browser')).toBeInTheDocument();
            expect(screen.getByText('Try using Chrome, Edge, or Safari')).toBeInTheDocument();

            console.log('[USER] error-handling', {
                scenario: 'unsupported-browser',
                timestamp: new Date().toISOString()
            });
        });

        it('handles responsive design elements', async () => {
            render(<MetuVoiceAI />);

            // Check responsive grid layout exists
            const mainContent = document.querySelector('.grid.grid-cols-1.lg\\:grid-cols-3');
            expect(mainContent).toBeInTheDocument();

            // Check responsive text sizing
            const title = screen.getByText('METU Voice AI');
            expect(title).toHaveClass('text-4xl');

            console.log('[USER] responsive-design', {
                layout: 'mobile-first-responsive',
                timestamp: new Date().toISOString()
            });
        });
    });
});
