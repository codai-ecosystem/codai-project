/**
 * Integration Tests for CreateMemoryForm
 * Tests with minimal mocking - uses real validation, form logic, and user interactions
 * Only mocks external APIs and services, not internal component logic
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@/tests/setup'
import userEvent from '@testing-library/user-event'
import { CreateMemoryForm } from '../CreateMemoryForm'

// Mock only external dependencies that can't run in test environment
vi.mock('next-intl', () => ({
  useTranslations: (namespace?: string) => (key: string) => {
    const translations: Record<string, string> = {
      'title': 'Create New Memory',
      'fields.content.label': 'Memory Content',
      'fields.content.placeholder': 'Enter your memory content...',
      'fields.tags.label': 'Tags',
      'actions.cancel': 'Cancel',
      'actions.create': 'Create Memory',
      'actions.creating': 'Creating...',
      'contentRequired': 'Content is required',
      'contentMinLength': 'Content must be at least 10 characters',
      'tagExists': 'Tag already exists'
    }
    return translations[key] || key
  }
}))

// Mock only the API layer - let validation and form logic work naturally
const mockMutateAsync = vi.fn()
const mockShowToast = vi.fn()

vi.mock('@/lib/api', () => ({
  useCreateMemory: () => ({
    mutateAsync: mockMutateAsync,
    isPending: false,
    error: null,
    isSuccess: false
  })
}))

vi.mock('@/lib/hooks/useSession', () => ({
  useAgentId: () => 'test-agent-id'
}))

vi.mock('@/lib/providers/toast.provider', () => ({
  useToast: () => ({ showToast: mockShowToast })
}))

describe('CreateMemoryForm Integration', () => {
  const mockOnSuccess = vi.fn()
  const mockOnCancel = vi.fn()

  const defaultProps = {
    onSuccess: mockOnSuccess,
    onCancel: mockOnCancel
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Real User Interactions', () => {
    it('creates memory with complete user flow', async () => {
      const user = userEvent.setup()
      mockMutateAsync.mockResolvedValue({ 
        id: 'new-memory-id', 
        content: 'My important memory',
        tags: ['important', 'test'],
        agentId: 'test-agent-id'
      })

      render(<CreateMemoryForm {...defaultProps} />)

      // User types content
      const contentInput = screen.getByLabelText('Memory Content')
      await user.type(contentInput, 'My important memory about testing')

      // User adds tags
      const tagInput = screen.getByRole('textbox', { name: /add.*tag/i })
      await user.type(tagInput, 'important')
      await user.keyboard('{Enter}')
      
      await user.clear(tagInput)
      await user.type(tagInput, 'test')
      await user.keyboard('{Enter}')

      // Verify tags were added to UI
      expect(screen.getByText('important')).toBeInTheDocument()
      expect(screen.getByText('test')).toBeInTheDocument()

      // User submits form
      const submitBtn = screen.getByRole('button', { name: 'Create Memory' })
      await user.click(submitBtn)

      // Verify API was called with correct data
      await waitFor(() => {
        expect(mockMutateAsync).toHaveBeenCalledWith({
          content: 'My important memory about testing',
          tags: ['important', 'test'],
          agentId: 'test-agent-id',
          metadata: expect.objectContaining({
            importance: expect.any(Number)
          })
        })
      })

      expect(mockOnSuccess).toHaveBeenCalled()
    })

    it('validates form fields naturally without mocking validation', async () => {
      const user = userEvent.setup()
      render(<CreateMemoryForm {...defaultProps} />)

      // Try to submit empty form
      const submitBtn = screen.getByRole('button', { name: 'Create Memory' })
      await user.click(submitBtn)

      // Real validation should show error
      await waitFor(() => {
        expect(screen.getByText('Content is required')).toBeInTheDocument()
      })

      // API should not be called
      expect(mockMutateAsync).not.toHaveBeenCalled()
    })

    it('handles tag management with real state updates', async () => {
      const user = userEvent.setup()
      render(<CreateMemoryForm {...defaultProps} />)

      const tagInput = screen.getByRole('textbox', { name: /add.*tag/i })

      // Add a tag
      await user.type(tagInput, 'first-tag')
      await user.keyboard('{Enter}')

      expect(screen.getByText('first-tag')).toBeInTheDocument()

      // Try to add duplicate tag - should show real validation
      await user.type(tagInput, 'first-tag')
      await user.keyboard('{Enter}')

      await waitFor(() => {
        expect(screen.getByText('Tag already exists')).toBeInTheDocument()
      })

      // Remove tag using real click handler
      const deleteTagBtn = screen.getByRole('button', { name: /delete.*first-tag/i })
      await user.click(deleteTagBtn)

      expect(screen.queryByText('first-tag')).not.toBeInTheDocument()
    })

    it('handles API errors gracefully with real error flow', async () => {
      const user = userEvent.setup()
      mockMutateAsync.mockRejectedValue(new Error('Network error'))

      render(<CreateMemoryForm {...defaultProps} />)

      // Fill out valid form
      await user.type(screen.getByLabelText('Memory Content'), 'Test memory content')

      // Submit form
      await user.click(screen.getByRole('button', { name: 'Create Memory' }))

      // Verify error handling
      await waitFor(() => {
        expect(mockShowToast).toHaveBeenCalledWith({
          type: 'error',
          message: expect.stringContaining('error')
        })
      })

      // onSuccess should not be called
      expect(mockOnSuccess).not.toHaveBeenCalled()
    })

    it('cancels form with real event handling', async () => {
      const user = userEvent.setup()
      render(<CreateMemoryForm {...defaultProps} />)

      // Type some content
      await user.type(screen.getByLabelText('Memory Content'), 'Some content')

      // Click cancel
      const cancelBtn = screen.getByRole('button', { name: 'Cancel' })
      await user.click(cancelBtn)

      expect(mockOnCancel).toHaveBeenCalled()
      expect(mockMutateAsync).not.toHaveBeenCalled()
    })
  })

  describe('Accessibility and UX', () => {
    it('maintains proper accessibility attributes', () => {
      render(<CreateMemoryForm {...defaultProps} />)

      // Check form has proper labeling
      expect(screen.getByRole('form')).toBeInTheDocument()
      expect(screen.getByLabelText('Memory Content')).toBeInTheDocument()
      
      // Check buttons have proper accessible names
      expect(screen.getByRole('button', { name: 'Create Memory' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument()
    })

    it('shows loading state during submission', async () => {
      const user = userEvent.setup()
      
      // Mock slow API response
      mockMutateAsync.mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve({ id: 'test' }), 100))
      )

      render(<CreateMemoryForm {...defaultProps} />)

      await user.type(screen.getByLabelText('Memory Content'), 'Test content')
      await user.click(screen.getByRole('button', { name: 'Create Memory' }))

      // Should show loading state immediately
      expect(screen.getByText('Creating...')).toBeInTheDocument()
      
      // Button should be disabled
      expect(screen.getByRole('button', { name: 'Creating...' })).toBeDisabled()
    })
  })
})