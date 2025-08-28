import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@/tests/setup'
import { CreateMemoryForm } from '../CreateMemoryForm'

// Mock next-intl
vi.mock('next-intl', () => ({
  useTranslations: (namespace?: string) => (key: string) => {
    const translations: Record<string, string> = {
      // memories.create namespace
      'title': 'Create New Memory',
      'subtitle': 'Add a new memory to your knowledge base',
      'fields.content.label': 'Memory Content',
      'fields.content.placeholder': 'Enter your memory content...',
      'fields.tags.label': 'Tags',
      'fields.tags.placeholder': 'Add a tag',
      'fields.project.label': 'Project',
      'fields.project.placeholder': 'Project name',
      'fields.session.label': 'Session',
      'fields.session.placeholder': 'Session identifier',
      'fields.importance.label': 'Importance',
      'actions.cancel': 'Cancel',
      'actions.create': 'Create Memory',
      'actions.creating': 'Creating...',
      
      // memories.create.validation namespace (for vt)
      'contentRequired': 'Content is required',
      'contentMinLength': 'Content must be at least 10 characters',
      'importanceRange': 'Importance must be between 1 and 10',
      'tagExists': 'Tag already exists',
      
      // Full paths for backward compatibility
      'validation.contentRequired': 'Content is required',
      'validation.contentMinLength': 'Content must be at least 10 characters',
      'validation.importanceRange': 'Importance must be between 1 and 10',
      'validation.tagExists': 'Tag already exists'
    }
    
    // Handle different namespaces
    if (namespace === 'memories.create.validation') {
      // For validation translations, return the key directly
      return translations[key] || key
    } else {
      // For other translations, use the key as provided
      return translations[key] || key
    }
  }
}))

// Mock API hooks
const mockCreateMemory = vi.fn()
const mockMutateAsync = vi.fn()

vi.mock('@/lib/api', () => ({
  useCreateMemory: () => ({
    mutate: mockCreateMemory,
    mutateAsync: mockMutateAsync,
    isPending: false,
    error: null,
    isSuccess: false
  })
}))

// Mock session hooks
vi.mock('@/lib/hooks/useSession', () => ({
  useAgentId: () => 'test-agent-id',
  useSessionContext: () => ({
    data: {
      user: {
        id: 'test-user-id',
        email: 'test@example.com',
        name: 'Test User'
      }
    },
    status: 'authenticated'
  })
}))

// Mock toast provider
const mockShowToast = vi.fn()
vi.mock('@/lib/providers/toast.provider', () => ({
  useToast: () => ({
    showToast: mockShowToast
  })
}))

describe('CreateMemoryForm', () => {
  const defaultProps = {
    onSuccess: vi.fn(),
    onCancel: vi.fn()
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockMutateAsync.mockResolvedValue({ id: 'test-id', content: 'test memory' })
    mockShowToast.mockClear()
  })

  describe('Rendering', () => {
    it('renders form title and subtitle', () => {
      render(<CreateMemoryForm {...defaultProps} />)
      
      expect(screen.getByText('Create New Memory')).toBeInTheDocument()
      expect(screen.getByText('Add a new memory to your knowledge base')).toBeInTheDocument()
    })

    it('renders all form fields', () => {
      render(<CreateMemoryForm {...defaultProps} />)
      
      expect(screen.getByLabelText('Memory Content')).toBeInTheDocument()
      expect(screen.getByLabelText('Tags')).toBeInTheDocument()
      expect(screen.getByLabelText('Project')).toBeInTheDocument()
      expect(screen.getByLabelText('Session')).toBeInTheDocument()
      expect(screen.getByLabelText(/Importance/)).toBeInTheDocument()
    })

    it('renders form buttons', () => {
      render(<CreateMemoryForm {...defaultProps} />)
      
      expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Create Memory' })).toBeInTheDocument()
    })

    it('shows cancel button only when onCancel is provided', () => {
      render(<CreateMemoryForm onSuccess={defaultProps.onSuccess} />)
      
      expect(screen.queryByRole('button', { name: 'Cancel' })).not.toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Create Memory' })).toBeInTheDocument()
    })
  })

  describe('Form Validation', () => {
    it('validates required content field', async () => {
      render(<CreateMemoryForm {...defaultProps} />)
      
      const submitButton = screen.getByRole('button', { name: 'Create Memory' })
      fireEvent.click(submitButton)
      
      await waitFor(() => {
        expect(screen.getByText('Content is required')).toBeInTheDocument()
      })
      
      expect(mockCreateMemory).not.toHaveBeenCalled()
      expect(mockMutateAsync).not.toHaveBeenCalled()
    })

    it('validates minimum content length', async () => {
      render(<CreateMemoryForm {...defaultProps} />)
      
      const contentField = screen.getByLabelText('Memory Content')
      fireEvent.change(contentField, { target: { value: 'short' } })
      
      const submitButton = screen.getByRole('button', { name: 'Create Memory' })
      fireEvent.click(submitButton)
      
      await waitFor(() => {
        expect(screen.getByText('Content must be at least 10 characters')).toBeInTheDocument()
      })
    })

    it('validates importance range', async () => {
      render(<CreateMemoryForm {...defaultProps} />)
      
      const importanceSlider = screen.getByLabelText(/Importance/) as HTMLInputElement
      
      // Verify HTML range input constraints work
      expect(importanceSlider.min).toBe('1')
      expect(importanceSlider.max).toBe('10')
      expect(importanceSlider.type).toBe('range')
      
      // Test that setting invalid values gets clamped by the HTML input
      fireEvent.change(importanceSlider, { target: { value: '15' } })
      expect(importanceSlider.value).toBe('10') // Clamped to max
      
      fireEvent.change(importanceSlider, { target: { value: '-5' } })  
      expect(importanceSlider.value).toBe('1') // Clamped to min
      
      fireEvent.change(importanceSlider, { target: { value: '5' } })
      expect(importanceSlider.value).toBe('5') // Valid value accepted
    })
  })

  describe('Tag Management', () => {
    it('adds tags when Enter is pressed', async () => {
      render(<CreateMemoryForm {...defaultProps} />)
      
      const tagInput = screen.getByPlaceholderText('Add a tag')
      fireEvent.change(tagInput, { target: { value: 'new-tag' } })
      fireEvent.keyDown(tagInput, { key: 'Enter', code: 'Enter' })
      
      await waitFor(() => {
        expect(screen.getByText('new-tag')).toBeInTheDocument()
      })
      
      expect(tagInput).toHaveValue('')
    })

    it('adds tags when plus button is clicked', async () => {
      render(<CreateMemoryForm {...defaultProps} />)
      
      const tagInput = screen.getByPlaceholderText('Add a tag')
      fireEvent.change(tagInput, { target: { value: 'button-tag' } })
      
      const addButton = screen.getByRole('button', { name: /add/i })
      fireEvent.click(addButton)
      
      await waitFor(() => {
        expect(screen.getByText('button-tag')).toBeInTheDocument()
      })
    })

    it('removes tags when X button is clicked', async () => {
      render(<CreateMemoryForm {...defaultProps} />)
      
      // Add a tag first
      const tagInput = screen.getByPlaceholderText('Add a tag')
      fireEvent.change(tagInput, { target: { value: 'removable-tag' } })
      fireEvent.keyDown(tagInput, { key: 'Enter', code: 'Enter' })
      
      await waitFor(() => {
        expect(screen.getByText('removable-tag')).toBeInTheDocument()
      })
      
      // Remove the tag
      const removeButton = screen.getByRole('button', { name: /remove.*removable-tag/i })
      fireEvent.click(removeButton)
      
      await waitFor(() => {
        expect(screen.queryByText('removable-tag')).not.toBeInTheDocument()
      })
    })

    it('prevents duplicate tags', async () => {
      render(<CreateMemoryForm {...defaultProps} />)
      
      const tagInput = screen.getByPlaceholderText('Add a tag')
      
      // Add first tag
      fireEvent.change(tagInput, { target: { value: 'duplicate-tag' } })
      fireEvent.keyDown(tagInput, { key: 'Enter', code: 'Enter' })
      
      await waitFor(() => {
        expect(screen.getByText('duplicate-tag')).toBeInTheDocument()
      })
      
      // Try to add the same tag again
      fireEvent.change(tagInput, { target: { value: 'duplicate-tag' } })
      fireEvent.keyDown(tagInput, { key: 'Enter', code: 'Enter' })
      
      await waitFor(() => {
        expect(screen.getByText('Tag already exists')).toBeInTheDocument()
      })
      
      // Should still only have one instance
      const tagElements = screen.getAllByText('duplicate-tag')
      expect(tagElements).toHaveLength(1)
    })

    it('removes last tag with backspace when input is empty', async () => {
      render(<CreateMemoryForm {...defaultProps} />)
      
      // Add two tags
      const tagInput = screen.getByPlaceholderText('Add a tag')
      
      fireEvent.change(tagInput, { target: { value: 'tag1' } })
      fireEvent.keyDown(tagInput, { key: 'Enter', code: 'Enter' })
      
      fireEvent.change(tagInput, { target: { value: 'tag2' } })
      fireEvent.keyDown(tagInput, { key: 'Enter', code: 'Enter' })
      
      await waitFor(() => {
        expect(screen.getByText('tag1')).toBeInTheDocument()
        expect(screen.getByText('tag2')).toBeInTheDocument()
      })
      
      // Press backspace with empty input
      fireEvent.keyDown(tagInput, { key: 'Backspace', code: 'Backspace' })
      
      await waitFor(() => {
        expect(screen.getByText('tag1')).toBeInTheDocument()
        expect(screen.queryByText('tag2')).not.toBeInTheDocument()
      })
    })
  })

  describe('Form Submission', () => {
    it('submits form with valid data', async () => {
      render(<CreateMemoryForm {...defaultProps} />)
      
      // Fill out the form
      const contentField = screen.getByLabelText('Memory Content')
      fireEvent.change(contentField, { target: { value: 'This is a test memory content' } })
      
      const projectField = screen.getByLabelText('Project')
      fireEvent.change(projectField, { target: { value: 'test-project' } })
      
      const sessionField = screen.getByLabelText('Session')
      fireEvent.change(sessionField, { target: { value: 'test-session' } })
      
      const importanceSlider = screen.getByLabelText(/Importance/)
      fireEvent.change(importanceSlider, { target: { value: '7' } })
      
      // Add a tag
      const tagInput = screen.getByPlaceholderText('Add a tag')
      fireEvent.change(tagInput, { target: { value: 'test-tag' } })
      fireEvent.keyDown(tagInput, { key: 'Enter', code: 'Enter' })
      
      await waitFor(() => {
        expect(screen.getByText('test-tag')).toBeInTheDocument()
      })
      
      // Submit the form
      const submitButton = screen.getByRole('button', { name: 'Create Memory' })
      fireEvent.click(submitButton)
      
      await waitFor(() => {
        expect(mockMutateAsync).toHaveBeenCalledWith({
          agentId: 'test-agent-id',
          content: 'This is a test memory content',
          metadata: {
            importance: 7,
            project: 'test-project',
            session: 'test-session',
            tags: ['test-tag']
          }
        })
      })
    })

    it('calls onCancel when cancel button is clicked', () => {
      render(<CreateMemoryForm {...defaultProps} />)
      
      const cancelButton = screen.getByRole('button', { name: 'Cancel' })
      fireEvent.click(cancelButton)
      
      expect(defaultProps.onCancel).toHaveBeenCalled()
    })
  })

  describe('Responsive Design', () => {
    it('applies responsive classes to form layout', () => {
      render(<CreateMemoryForm {...defaultProps} />)
      
      // Check for responsive grid classes
      const gridElements = screen.getByText('Project').closest('.grid')
      expect(gridElements).toHaveClass('grid-cols-1', 'sm:grid-cols-2')
    })

    it('applies touch target classes to interactive elements', () => {
      render(<CreateMemoryForm {...defaultProps} />)
      
      const buttons = screen.getAllByRole('button')
      buttons.forEach(button => {
        expect(button).toHaveClass('min-h-[44px]')
      })
    })
  })

  describe('Accessibility', () => {
    it('has proper labels for all form fields', () => {
      render(<CreateMemoryForm {...defaultProps} />)
      
      expect(screen.getByLabelText('Memory Content')).toBeInTheDocument()
      expect(screen.getByLabelText('Tags')).toBeInTheDocument()
      expect(screen.getByLabelText('Project')).toBeInTheDocument()
      expect(screen.getByLabelText('Session')).toBeInTheDocument()
      expect(screen.getByLabelText(/Importance/)).toBeInTheDocument()
    })

    it('shows validation errors with proper ARIA attributes', async () => {
      render(<CreateMemoryForm {...defaultProps} />)
      
      const submitButton = screen.getByRole('button', { name: 'Create Memory' })
      fireEvent.click(submitButton)
      
      await waitFor(() => {
        const errorMessage = screen.getByText('Content is required')
        expect(errorMessage).toHaveClass('text-destructive')
      })
    })

    it('supports keyboard navigation', () => {
      render(<CreateMemoryForm {...defaultProps} />)
      
      const contentField = screen.getByLabelText('Memory Content')
      const tagInput = screen.getByPlaceholderText('Add a tag')
      const projectField = screen.getByLabelText('Project')
      
      // All fields should be focusable
      expect(contentField).toHaveAttribute('tabIndex', '0')
      expect(tagInput).not.toHaveAttribute('tabIndex', '-1')
      expect(projectField).not.toHaveAttribute('tabIndex', '-1')
    })
  })
})