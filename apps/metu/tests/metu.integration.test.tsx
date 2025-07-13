import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import MetuVoiceAI from '../src/App'

describe('METU Integration Tests - Continuous Voice AI Assistant for Windows', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    describe('Complete User Flows', () => {
        it('renders voice AI assistant interface correctly', async () => {
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

        it('displays voice controls and states correctly', async () => {
            render(<MetuVoiceAI />)

            // Verify initial voice state
            await waitFor(() => {
                expect(screen.getByText('Ready to listen')).toBeInTheDocument()
                expect(screen.getByText('Press Ctrl+Space or click to activate')).toBeInTheDocument()
            })

            // Verify control buttons
            expect(screen.getByText('Settings')).toBeInTheDocument()
            expect(screen.getByText('Test Voice')).toBeInTheDocument()
        })

        it('handles voice activation and state transitions', async () => {
            const user = userEvent.setup()
            render(<MetuVoiceAI />)

            // Find and click the main voice button
            const voiceButton = document.querySelector('button[class*="w-24 h-24 rounded-full"]')
            expect(voiceButton).toBeInTheDocument()

            // Click to activate voice
            if (voiceButton) {
                await user.click(voiceButton)

                // Should transition to listening state
                await waitFor(() => {
                    expect(screen.getByText('Listening...')).toBeInTheDocument()
                })
            }
        })
    })

    describe('Data Flow Integration', () => {
        it('manages conversation messages correctly', async () => {
            render(<MetuVoiceAI />)

            // Verify conversation panel exists
            await waitFor(() => {
                expect(screen.getByText('Conversation')).toBeInTheDocument()
                expect(screen.getByText('Start a conversation with METU')).toBeInTheDocument()
            })

            // Verify empty state message
            expect(screen.getByText('Click the microphone to begin')).toBeInTheDocument()
        })

        it('integrates settings panel with app state', async () => {
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

            // Test volume slider
            const volumeSlider = document.querySelector('input[type="range"]')
            expect(volumeSlider).toBeInTheDocument()

            // Test language dropdown
            const languageSelect = document.querySelector('select')
            expect(languageSelect).toBeInTheDocument()
        })

        it('validates audio visualizer integration', async () => {
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
        it('renders METU voice interface efficiently', async () => {
            const startTime = performance.now()

            render(<MetuVoiceAI />)

            await waitFor(() => {
                expect(screen.getByText('METU Voice AI')).toBeInTheDocument()
            })

            const endTime = performance.now()
            const renderTime = endTime - startTime

            // Voice AI interface should render within reasonable time
            expect(renderTime).toBeLessThan(1000)
        })

        it('handles multiple UI interactions smoothly', async () => {
            const user = userEvent.setup()
            render(<MetuVoiceAI />)

            // Rapid interactions: settings, test voice, settings close
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

        it('maintains responsive layout structure', async () => {
            render(<MetuVoiceAI />)

            // Check main grid layout
            const gridContainer = document.querySelector('.grid.grid-cols-1.lg\\:grid-cols-3')
            expect(gridContainer).toBeInTheDocument()

            // Verify responsive voice cards
            const voiceCards = document.querySelectorAll('[class*="voice-card"]')
            expect(voiceCards.length).toBeGreaterThan(0)
        })
    })
})
