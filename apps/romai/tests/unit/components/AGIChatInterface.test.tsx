/**
 * Unit Tests for AGI Chat Component
 * Tests conversation flow, reasoning display, and Romanian cultural integration
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AGIChatInterface } from '@/components/conversation/AGIChatInterface'

// Mock the AGI client
vi.mock('@/lib/agi-client', () => ({
  agiClient: {
    sendMessage: vi.fn(),
    getConversationHistory: vi.fn(),
    analyzeReasoning: vi.fn(),
  }
}))

// Mock the WebSocket for real-time features
const mockWebSocket = {
  send: vi.fn(),
  close: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  readyState: 1, // OPEN
}

Object.defineProperty(global, 'WebSocket', {
  value: vi.fn(() => mockWebSocket),
  writable: true,
})

import { agiClient } from '@/lib/agi-client'

describe('AGIChatInterface', () => {
  const user = userEvent.setup()

  beforeEach(() => {
    vi.clearAllMocks()

    // Setup default AGI client mocks
    vi.mocked(agiClient.sendMessage).mockResolvedValue({
      success: true,
      message: 'Bună ziua! Sunt RomAI, asistentul dumneavoastră inteligent.',
      cultural_analysis: {
        language: 'romanian',
        region: 'standard',
        formality: 'formal',
        traditions_recognized: true
      },
      agi_metadata: {
        confidence: 0.95,
        reasoning_steps: ['greeting_recognition', 'cultural_adaptation'],
        processing_time_ms: 250
      }
    })

    vi.mocked(agiClient.getConversationHistory).mockResolvedValue([])
  })

  describe('Message Sending', () => {
    it('sends Romanian messages correctly', async () => {
      render(<AGIChatInterface />)

      const input = screen.getByPlaceholder(/scrie mesajul tău/i)
      const sendButton = screen.getByRole('button', { name: /trimite/i })

      await user.type(input, 'Bună ziua! Cum vă simțiți astăzi?')
      await user.click(sendButton)

      expect(agiClient.sendMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Bună ziua! Cum vă simțiți astăzi?',
          language: 'romanian',
          context: expect.any(Object)
        })
      )
    })

    it('handles send button click correctly', async () => {
      render(<AGIChatInterface />)

      const input = screen.getByPlaceholder(/scrie mesajul tău/i)
      const sendButton = screen.getByRole('button', { name: /trimite/i })

      await user.type(input, 'Test message')
      await user.click(sendButton)

      // Input should be cleared after sending
      expect(input).toHaveValue('')

      // Send button should be disabled during processing
      expect(sendButton).toBeDisabled()
    })

    it('handles Enter key to send messages', async () => {
      render(<AGIChatInterface />)

      const input = screen.getByPlaceholder(/scrie mesajul tău/i)

      await user.type(input, 'Test message with Enter{enter}')

      expect(agiClient.sendMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Test message with Enter'
        })
      )
    })

    it('prevents sending empty messages', async () => {
      render(<AGIChatInterface />)

      const sendButton = screen.getByRole('button', { name: /trimite/i })

      // Button should be disabled when no text
      expect(sendButton).toBeDisabled()

      await user.click(sendButton)
      expect(agiClient.sendMessage).not.toHaveBeenCalled()
    })
  })

  describe('Message Display', () => {
    it('displays user messages correctly', async () => {
      render(<AGIChatInterface />)

      const input = screen.getByPlaceholder(/scrie mesajul tău/i)
      await user.type(input, 'Salut RomAI!')
      await user.click(screen.getByRole('button', { name: /trimite/i }))

      await waitFor(() => {
        expect(screen.getByText('Salut RomAI!')).toBeInTheDocument()
        expect(screen.getByTestId('user-message')).toBeInTheDocument()
      })
    })

    it('displays AGI responses with cultural analysis', async () => {
      render(<AGIChatInterface />)

      const input = screen.getByPlaceholder(/scrie mesajul tău/i)
      await user.type(input, 'Bună ziua!')
      await user.click(screen.getByRole('button', { name: /trimite/i }))

      await waitFor(() => {
        expect(screen.getByText(/bună ziua! sunt romai/i)).toBeInTheDocument()
        expect(screen.getByTestId('agi-message')).toBeInTheDocument()
        expect(screen.getByText(/confidence: 95%/i)).toBeInTheDocument()
        expect(screen.getByText(/formal greeting recognized/i)).toBeInTheDocument()
      })
    })

    it('shows reasoning steps when available', async () => {
      vi.mocked(agiClient.sendMessage).mockResolvedValue({
        success: true,
        message: 'Aceasta este o floare.',
        reasoning_chain: [
          'Toate rozele sunt flori (premisă majoră)',
          'Aceasta este o roză (premisă minoră)',
          'Prin urmare, aceasta este o floare (concluzie)'
        ],
        agi_metadata: {
          confidence: 0.98,
          reasoning_type: 'deductive'
        }
      })

      render(<AGIChatInterface />)

      const input = screen.getByPlaceholder(/scrie mesajul tău/i)
      await user.type(input, 'Dacă toate rozele sunt flori...')
      await user.click(screen.getByRole('button', { name: /trimite/i }))

      await waitFor(() => {
        expect(screen.getByTestId('reasoning-steps')).toBeInTheDocument()
        expect(screen.getByText(/premisă majoră/i)).toBeInTheDocument()
        expect(screen.getByText(/premisă minoră/i)).toBeInTheDocument()
        expect(screen.getByText(/concluzie/i)).toBeInTheDocument()
      })
    })

    it('displays processing time and confidence metrics', async () => {
      render(<AGIChatInterface />)

      const input = screen.getByPlaceholder(/scrie mesajul tău/i)
      await user.type(input, 'Test question')
      await user.click(screen.getByRole('button', { name: /trimite/i }))

      await waitFor(() => {
        expect(screen.getByTestId('confidence-score')).toHaveTextContent('95%')
        expect(screen.getByTestId('processing-time')).toHaveTextContent('250ms')
      })
    })
  })

  describe('Error Handling', () => {
    it('handles network errors gracefully', async () => {
      vi.mocked(agiClient.sendMessage).mockRejectedValue(new Error('Network error'))

      render(<AGIChatInterface />)

      const input = screen.getByPlaceholder(/scrie mesajul tău/i)
      await user.type(input, 'Test message')
      await user.click(screen.getByRole('button', { name: /trimite/i }))

      await waitFor(() => {
        expect(screen.getByText(/eroare de conexiune/i)).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /încearcă din nou/i })).toBeInTheDocument()
      })
    })

    it('handles AGI service errors', async () => {
      vi.mocked(agiClient.sendMessage).mockResolvedValue({
        success: false,
        error: 'AGI service temporarily unavailable',
        error_code: 'SERVICE_UNAVAILABLE'
      })

      render(<AGIChatInterface />)

      const input = screen.getByPlaceholder(/scrie mesajul tău/i)
      await user.type(input, 'Test message')
      await user.click(screen.getByRole('button', { name: /trimite/i }))

      await waitFor(() => {
        expect(screen.getByText(/serviciul agi este temporar indisponibil/i)).toBeInTheDocument()
      })
    })

    it('shows retry button for failed messages', async () => {
      vi.mocked(agiClient.sendMessage).mockRejectedValue(new Error('Request failed'))

      render(<AGIChatInterface />)

      const input = screen.getByPlaceholder(/scrie mesajul tău/i)
      await user.type(input, 'Test message')
      await user.click(screen.getByRole('button', { name: /trimite/i }))

      await waitFor(() => {
        const retryButton = screen.getByRole('button', { name: /încearcă din nou/i })
        expect(retryButton).toBeInTheDocument()
      })

      // Test retry functionality
      vi.mocked(agiClient.sendMessage).mockResolvedValue({
        success: true,
        message: 'Retry successful'
      })

      await user.click(screen.getByRole('button', { name: /încearcă din nou/i }))

      await waitFor(() => {
        expect(screen.getByText('Retry successful')).toBeInTheDocument()
      })
    })
  })

  describe('Loading States', () => {
    it('shows typing indicator while processing', async () => {
      // Delay the response to test loading state
      vi.mocked(agiClient.sendMessage).mockImplementation(() =>
        new Promise(resolve => setTimeout(() => resolve({
          success: true,
          message: 'Response after delay'
        }), 100))
      )

      render(<AGIChatInterface />)

      const input = screen.getByPlaceholder(/scrie mesajul tău/i)
      await user.type(input, 'Test message')
      await user.click(screen.getByRole('button', { name: /trimite/i }))

      // Should show typing indicator
      expect(screen.getByTestId('typing-indicator')).toBeInTheDocument()
      expect(screen.getByText(/romai gândește.../i)).toBeInTheDocument()

      // Wait for response
      await waitFor(() => {
        expect(screen.getByText('Response after delay')).toBeInTheDocument()
      })

      // Typing indicator should be gone
      expect(screen.queryByTestId('typing-indicator')).not.toBeInTheDocument()
    })

    it('disables input during processing', async () => {
      vi.mocked(agiClient.sendMessage).mockImplementation(() =>
        new Promise(resolve => setTimeout(() => resolve({
          success: true,
          message: 'Response'
        }), 100))
      )

      render(<AGIChatInterface />)

      const input = screen.getByPlaceholder(/scrie mesajul tău/i)
      const sendButton = screen.getByRole('button', { name: /trimite/i })

      await user.type(input, 'Test message')
      await user.click(sendButton)

      // Input and button should be disabled during processing
      expect(input).toBeDisabled()
      expect(sendButton).toBeDisabled()

      await waitFor(() => {
        expect(screen.getByText('Response')).toBeInTheDocument()
      })

      // Should be enabled again after response
      expect(input).not.toBeDisabled()
      expect(sendButton).not.toBeDisabled()
    })
  })

  describe('Conversation History', () => {
    it('loads conversation history on mount', async () => {
      const mockHistory = [
        {
          id: '1',
          type: 'user',
          message: 'Salut!',
          timestamp: new Date().toISOString()
        },
        {
          id: '2',
          type: 'agi',
          message: 'Bună ziua!',
          timestamp: new Date().toISOString()
        }
      ]

      vi.mocked(agiClient.getConversationHistory).mockResolvedValue(mockHistory)

      render(<AGIChatInterface />)

      await waitFor(() => {
        expect(screen.getByText('Salut!')).toBeInTheDocument()
        expect(screen.getByText('Bună ziua!')).toBeInTheDocument()
      })
    })

    it('scrolls to bottom when new messages arrive', async () => {
      const scrollIntoView = vi.fn()

      // Mock scrollIntoView
      Element.prototype.scrollIntoView = scrollIntoView

      render(<AGIChatInterface />)

      const input = screen.getByPlaceholder(/scrie mesajul tău/i)
      await user.type(input, 'New message')
      await user.click(screen.getByRole('button', { name: /trimite/i }))

      await waitFor(() => {
        expect(scrollIntoView).toHaveBeenCalled()
      })
    })
  })

  describe('Accessibility', () => {
    it('provides proper ARIA labels for chat elements', () => {
      render(<AGIChatInterface />)

      expect(screen.getByRole('main')).toHaveAttribute('aria-label', 'Chat conversation')
      expect(screen.getByRole('textbox')).toHaveAttribute('aria-label', 'Type your message')
      expect(screen.getByRole('button', { name: /trimite/i })).toHaveAttribute('aria-label', 'Send message')
    })

    it('announces new messages to screen readers', async () => {
      render(<AGIChatInterface />)

      const input = screen.getByPlaceholder(/scrie mesajul tău/i)
      await user.type(input, 'Test message')
      await user.click(screen.getByRole('button', { name: /trimite/i }))

      await waitFor(() => {
        const liveRegion = screen.getByRole('status')
        expect(liveRegion).toHaveAttribute('aria-live', 'polite')
        expect(liveRegion).toHaveTextContent(/new message from romai/i)
      })
    })

    it('supports keyboard navigation', async () => {
      render(<AGIChatInterface />)

      const input = screen.getByRole('textbox')
      const sendButton = screen.getByRole('button', { name: /trimite/i })

      // Tab navigation should work
      await user.tab()
      expect(input).toHaveFocus()

      await user.tab()
      expect(sendButton).toHaveFocus()
    })
  })
})