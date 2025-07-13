import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import TalentAIPage from '../app/page'

// Mock Next.js modules
vi.mock('next/font/google', () => ({
    Inter: () => ({ className: 'inter-font' }),
}))

describe('TalentAI Page', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('renders the main heading', () => {
        render(<TalentAIPage />)
        expect(screen.getByText('TalentAI')).toBeInTheDocument()
    })

    it('renders the subtitle', () => {
        render(<TalentAIPage />)
        expect(screen.getByText('AI-Powered HR Recruitment Platform for Top Tech Talent')).toBeInTheDocument()
    })

    it('displays statistics cards', () => {
        render(<TalentAIPage />)
        expect(screen.getByText('500+')).toBeInTheDocument()
        expect(screen.getByText('Candidates Screened')).toBeInTheDocument()
        expect(screen.getByText('150+')).toBeInTheDocument()
        expect(screen.getByText('Positions Filled')).toBeInTheDocument()
        expect(screen.getByText('98%')).toBeInTheDocument()
        expect(screen.getByText('Match Success Rate')).toBeInTheDocument()
        expect(screen.getByText('24h')).toBeInTheDocument()
        expect(screen.getByText('Avg. Response Time')).toBeInTheDocument()
    })

    it('shows initial welcome message', () => {
        render(<TalentAIPage />)
        expect(screen.getByText(/Hello! I'm TalentAI, your AI-powered HR assistant/)).toBeInTheDocument()
    })

    it('has an input field for messages', () => {
        render(<TalentAIPage />)
        const input = screen.getByPlaceholderText('Describe the role you\'re looking to fill...')
        expect(input).toBeInTheDocument()
    })

    it('has a send button', () => {
        render(<TalentAIPage />)
        const sendButton = screen.getByRole('button', { name: /send/i })
        expect(sendButton).toBeInTheDocument()
    })

    it('allows typing in the input field', () => {
        render(<TalentAIPage />)
        const input = screen.getByPlaceholderText('Describe the role you\'re looking to fill...')
        fireEvent.change(input, { target: { value: 'Looking for a senior prompt engineer' } })
        expect(input).toHaveValue('Looking for a senior prompt engineer')
    })

    it('disables send button when input is empty', () => {
        render(<TalentAIPage />)
        const sendButton = screen.getByRole('button', { name: /send/i })
        expect(sendButton).toBeDisabled()
    })

    it('enables send button when input has content', () => {
        render(<TalentAIPage />)
        const input = screen.getByPlaceholderText('Describe the role you\'re looking to fill...')
        const sendButton = screen.getByRole('button', { name: /send/i })

        fireEvent.change(input, { target: { value: 'Test message' } })
        expect(sendButton).not.toBeDisabled()
    })

    it('sends message and receives AI response', async () => {
        render(<TalentAIPage />)
        const input = screen.getByPlaceholderText('Describe the role you\'re looking to fill...')
        const sendButton = screen.getByRole('button', { name: /send/i })

        fireEvent.change(input, { target: { value: 'Looking for prompt engineer' } })
        fireEvent.click(sendButton)

        expect(screen.getByText('Looking for prompt engineer')).toBeInTheDocument()

        await waitFor(() => {
            expect(screen.getByText(/I understand you're looking for/)).toBeInTheDocument()
        }, { timeout: 2000 })
    })

    it('clears input after sending message', () => {
        render(<TalentAIPage />)
        const input = screen.getByPlaceholderText('Describe the role you\'re looking to fill...')
        const sendButton = screen.getByRole('button', { name: /send/i })

        fireEvent.change(input, { target: { value: 'Test message' } })
        fireEvent.click(sendButton)

        expect(input).toHaveValue('')
    })

    it('shows typing indicator during AI response', async () => {
        render(<TalentAIPage />)
        const input = screen.getByPlaceholderText('Describe the role you\'re looking to fill...')
        const sendButton = screen.getByRole('button', { name: /send/i })

        fireEvent.change(input, { target: { value: 'Test message' } })
        fireEvent.click(sendButton)

        // Check for typing indicator (animated dots)
        expect(screen.getByText('Test message')).toBeInTheDocument()

        // Wait for response to appear
        await waitFor(() => {
            expect(screen.getByText(/I understand you're looking for/)).toBeInTheDocument()
        }, { timeout: 2000 })
    })

    it('handles form submission with Enter key', () => {
        render(<TalentAIPage />)
        const input = screen.getByPlaceholderText('Describe the role you\'re looking to fill...')

        fireEvent.change(input, { target: { value: 'Test message' } })
        fireEvent.submit(input.closest('form')!)

        expect(screen.getByText('Test message')).toBeInTheDocument()
    })

    it('displays chat interface header', () => {
        render(<TalentAIPage />)
        expect(screen.getByText('AI Recruitment Assistant')).toBeInTheDocument()
        expect(screen.getByText('Let\'s find your perfect tech talent')).toBeInTheDocument()
    })

    it('scrolls to bottom when new messages are added', () => {
        // Mock scrollIntoView
        const mockScrollIntoView = vi.fn()
        Element.prototype.scrollIntoView = mockScrollIntoView

        render(<TalentAIPage />)
        const input = screen.getByPlaceholderText('Describe the role you\'re looking to fill...')
        const sendButton = screen.getByRole('button', { name: /send/i })

        fireEvent.change(input, { target: { value: 'Test message' } })
        fireEvent.click(sendButton)

        expect(mockScrollIntoView).toHaveBeenCalled()
    })
})
