import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import MetuVoiceAI from '../app/page'

describe('METU-WEB Integration Tests - Voice AI Web Application', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    describe('Complete User Flows', () => {
        it('renders voice AI web interface correctly', async () => {
            render(<MetuVoiceAI />)

            // Verify main heading and branding
            await waitFor(() => {
                expect(screen.getByText('METU Voice AI')).toBeInTheDocument()
                expect(screen.getByText('Intelligent Conversational Assistant')).toBeInTheDocument()
                expect(screen.getByText('Powered by Advanced AI • Real-time Voice Recognition')).toBeInTheDocument()
            })

            // Verify METU character section
            expect(screen.getByText('METU')).toBeInTheDocument()
            expect(screen.getByText('Your AI Assistant')).toBeInTheDocument()
        })

        it('displays web voice controls and states correctly', async () => {
            render(<MetuVoiceAI />)

            // Verify initial voice state
            await waitFor(() => {
                expect(screen.getByText('Click to start')).toBeInTheDocument()
                expect(screen.getByText('Press Ctrl+Space or click to activate')).toBeInTheDocument()
            })

            // Verify control buttons
            expect(screen.getByText('Settings')).toBeInTheDocument()
            expect(screen.getByText('Test Voice')).toBeInTheDocument()
        })

        it('handles web voice activation and settings interaction', async () => {
            const user = userEvent.setup()
            render(<MetuVoiceAI />)

            // Open settings
            const settingsButton = screen.getByText('Settings')
            await user.click(settingsButton)

            // Verify settings panel opens
            await waitFor(() => {
                expect(screen.getByText('Voice Recognition')).toBeInTheDocument()
                expect(screen.getByText(/Volume:/)).toBeInTheDocument()
                expect(screen.getByText('Language')).toBeInTheDocument()
            })

            // Close settings by clicking the X button
            const closeButton = screen.getByText('✕')
            await user.click(closeButton)

            // Settings should close (no longer visible)
            await waitFor(() => {
                expect(screen.queryByText('Voice Recognition')).not.toBeInTheDocument()
            })
        })
    })

    describe('Data Flow Integration', () => {
        it('manages web conversation interface correctly', async () => {
            render(<MetuVoiceAI />)

            // Verify conversation panel exists
            await waitFor(() => {
                expect(screen.getByText('Conversation')).toBeInTheDocument()
                expect(screen.getByText('Start a conversation with METU')).toBeInTheDocument()
            })

            // Verify empty state message
            expect(screen.getByText('Click the microphone to begin')).toBeInTheDocument()
        })

        it('integrates web settings panel with voice controls', async () => {
            const user = userEvent.setup()
            render(<MetuVoiceAI />)

            // Open settings
            const settingsButton = screen.getByText('Settings')
            await user.click(settingsButton)

            // Test voice recognition toggle
            const voiceToggle = document.querySelector('button[class*="w-12 h-6 rounded-full"]')
            expect(voiceToggle).toBeInTheDocument()

            // Test volume slider
            const volumeSlider = document.querySelector('input[type="range"]')
            expect(volumeSlider).toBeInTheDocument()

            // Test language dropdown
            const languageSelect = document.querySelector('select')
            expect(languageSelect).toBeInTheDocument()
            expect(languageSelect).toHaveValue('en-US')
        })

        it('validates web audio visualizer integration', async () => {
            render(<MetuVoiceAI />)

            // Verify audio visualizer section
            await waitFor(() => {
                expect(screen.getByText('Audio Activity')).toBeInTheDocument()
            })

            // Check for audio bars (visualizer elements) - look for gradient bars
            const audioBars = document.querySelectorAll('[class*="bg-gradient-to-t"]')
            expect(audioBars.length).toBeGreaterThan(0)
        })
    })

    describe('Performance Integration', () => {
        it('renders METU web interface efficiently', async () => {
            const startTime = performance.now()

            render(<MetuVoiceAI />)

            await waitFor(() => {
                expect(screen.getByText('METU Voice AI')).toBeInTheDocument()
            })

            const endTime = performance.now()
            const renderTime = endTime - startTime

            // Web voice AI interface should render within reasonable time
            expect(renderTime).toBeLessThan(1000)
        })

        it('handles multiple web UI interactions smoothly', async () => {
            const user = userEvent.setup()
            render(<MetuVoiceAI />)

            // Rapid interactions: settings, test voice, settings operations
            const settingsButton = screen.getByText('Settings')
            const testVoiceButton = screen.getByText('Test Voice')

            // Multiple rapid clicks
            await user.click(settingsButton)
            await user.click(testVoiceButton)

            // Should not crash or show errors
            expect(document.body).toBeInTheDocument()

            // Settings should still be functional
            await waitFor(() => {
                expect(screen.getByText('Voice Recognition')).toBeInTheDocument()
            })
        })

        it('maintains responsive web layout structure', async () => {
            render(<MetuVoiceAI />)

            // Check main grid layout
            const gridContainer = document.querySelector('.grid.grid-cols-1.lg\\:grid-cols-3')
            expect(gridContainer).toBeInTheDocument()

            // Verify responsive voice cards
            const voiceCards = document.querySelectorAll('[class*="voice-card"]')
            expect(voiceCards.length).toBeGreaterThan(0)

            // Check footer exists
            expect(screen.getByText('METU Voice AI • Next.js + Tailwind CSS • Built with ❤️')).toBeInTheDocument()
        })
    })

    describe('Web-Specific Features', () => {
        it('handles keyboard shortcuts correctly', async () => {
            render(<MetuVoiceAI />)

            // Test Escape key for closing settings
            const user = userEvent.setup()
            const settingsButton = screen.getByText('Settings')
            await user.click(settingsButton)

            // Settings should be open
            await waitFor(() => {
                expect(screen.getByText('Voice Recognition')).toBeInTheDocument()
            })

            // Press Escape key
            await user.keyboard('{Escape}')

            // Settings should close
            await waitFor(() => {
                expect(screen.queryByText('Voice Recognition')).not.toBeInTheDocument()
            })
        })

        it('validates browser support detection', async () => {
            render(<MetuVoiceAI />)

            // Should show voice support is available (mocked as true)
            await waitFor(() => {
                expect(screen.getByText('Click the microphone to begin')).toBeInTheDocument()
            })

            // Should not show "Voice not supported" message
            expect(screen.queryByText('Voice not supported')).not.toBeInTheDocument()
        })
    })
})
