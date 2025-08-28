import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@/tests/setup'
import { MemoryCard } from '../MemoryCard'
import type { Memory } from '@/types'

// Mock next-intl
vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => {
    const translations: Record<string, string> = {
      'actions.edit': 'Edit',
      'actions.delete': 'Delete',
      'actions.share': 'Share',
      'metadata.importance': 'Importance',
      'metadata.tags': 'Tags',
      'metadata.project': 'Project',
      'metadata.session': 'Session',
      'metadata.createdAt': 'Created',
      'metadata.updatedAt': 'Updated',
      'updatedShort': 'Upd',
      'confirm.deleteTitle': 'Delete Memory',
      'confirm.deleteMessage': 'Are you sure you want to delete this memory?',
      'confirm.cancel': 'Cancel',
      'confirm.delete': 'Delete'
    }
    return translations[key] || key
  }
}))

// Mock API hooks
vi.mock('@/lib/api', () => ({
  useUpdateMemory: () => ({
    mutate: vi.fn(),
    isPending: false,
    error: null
  }),
  useDeleteMemory: () => ({
    mutate: vi.fn(),
    isPending: false,
    error: null
  })
}))

const mockMemory: Memory = {
  id: 'test-memory-1',
  agentId: 'test-agent-1',
  content: 'This is a test memory content that demonstrates the memory card functionality.',
  metadata: {
    importance: 8,
    tags: ['testing', 'component', 'ui'],
    project: 'memorai-tests',
    session: 'test-session-1'
  },
  createdAt: '2025-08-28T10:00:00Z',
  updatedAt: '2025-08-28T11:30:00Z',
  accessCount: 5,
  lastAccessed: '2025-08-28T11:30:00Z'
}

describe('MemoryCard', () => {
  const defaultProps = {
    memory: mockMemory,
    onEdit: vi.fn(),
    onDelete: vi.fn()
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Rendering', () => {
    it('renders memory content correctly', () => {
      render(<MemoryCard {...defaultProps} />)
      
      expect(screen.getByText(mockMemory.content)).toBeInTheDocument()
    })

    it('displays importance badge', () => {
      render(<MemoryCard {...defaultProps} />)
      
      expect(screen.getByText('8/10')).toBeInTheDocument()
    })

    it('shows all tags', () => {
      render(<MemoryCard {...defaultProps} />)
      
      mockMemory.metadata!.tags!.forEach(tag => {
        expect(screen.getByText(tag)).toBeInTheDocument()
      })
    })

    it('displays project and session info', () => {
      render(<MemoryCard {...defaultProps} />)
      
      expect(screen.getByText('memorai-tests')).toBeInTheDocument()
      expect(screen.getByText('test-session-1')).toBeInTheDocument()
    })

    it('shows formatted creation date', () => {
      render(<MemoryCard {...defaultProps} />)
      
      // Check that some date representation is shown
      expect(screen.getByText(/2025/)).toBeInTheDocument()
    })
  })

  describe('Interactions', () => {
    it('calls onEdit when edit button is clicked', async () => {
      render(<MemoryCard {...defaultProps} />)
      
      const editButton = screen.getByRole('button', { name: /edit/i })
      fireEvent.click(editButton)
      
      await waitFor(() => {
        expect(defaultProps.onEdit).toHaveBeenCalledWith(mockMemory)
      })
    })

    it('shows delete confirmation dialog', async () => {
      render(<MemoryCard {...defaultProps} />)
      
      const deleteButton = screen.getByRole('button', { name: /delete/i })
      fireEvent.click(deleteButton)
      
      await waitFor(() => {
        expect(screen.getByText('Delete Memory')).toBeInTheDocument()
        expect(screen.getByText('Are you sure you want to delete this memory?')).toBeInTheDocument()
      })
    })

    it('calls onDelete when delete is confirmed', async () => {
      render(<MemoryCard {...defaultProps} />)
      
      const deleteButton = screen.getByRole('button', { name: /delete/i })
      fireEvent.click(deleteButton)
      
      await waitFor(() => {
        expect(screen.getByText('Delete Memory')).toBeInTheDocument()
      })
      
      const confirmButton = screen.getByRole('button', { name: 'Delete' })
      fireEvent.click(confirmButton)
      
      await waitFor(() => {
        expect(defaultProps.onDelete).toHaveBeenCalledWith(mockMemory.id)
      })
    })

    it('cancels delete operation', async () => {
      render(<MemoryCard {...defaultProps} />)
      
      const deleteButton = screen.getByRole('button', { name: /delete/i })
      fireEvent.click(deleteButton)
      
      await waitFor(() => {
        expect(screen.getByText('Delete Memory')).toBeInTheDocument()
      })
      
      const cancelButton = screen.getByRole('button', { name: 'Cancel' })
      fireEvent.click(cancelButton)
      
      await waitFor(() => {
        expect(screen.queryByText('Delete Memory')).not.toBeInTheDocument()
        expect(defaultProps.onDelete).not.toHaveBeenCalled()
      })
    })
  })

  describe('Content Handling', () => {
    it('truncates long content appropriately', () => {
      const longContent = 'A'.repeat(500)
      const memoryWithLongContent = {
        ...mockMemory,
        content: longContent
      }
      
      render(<MemoryCard {...defaultProps} memory={memoryWithLongContent} />)
      
      const contentElement = screen.getByText(longContent)
      expect(contentElement).toHaveClass('line-clamp-3')
    })

    it('handles memory without metadata gracefully', () => {
      const memoryWithoutMetadata = {
        ...mockMemory,
        metadata: undefined
      }
      
      render(<MemoryCard {...defaultProps} memory={memoryWithoutMetadata} />)
      
      expect(screen.getByText(mockMemory.content)).toBeInTheDocument()
      // Should not crash and should render basic content
    })

    it('handles empty tags array', () => {
      const memoryWithNoTags = {
        ...mockMemory,
        metadata: {
          ...mockMemory.metadata!,
          tags: []
        }
      }
      
      render(<MemoryCard {...defaultProps} memory={memoryWithNoTags} />)
      
      expect(screen.getByText(mockMemory.content)).toBeInTheDocument()
      // Should not show any tag elements
      expect(screen.queryByText('testing')).not.toBeInTheDocument()
    })
  })

  describe('Responsive Design', () => {
    it('applies responsive classes correctly', () => {
      render(<MemoryCard {...defaultProps} />)
      
      const card = screen.getByTestId('memory-card')
      expect(card).toHaveClass('p-4', 'sm:p-6')
    })

    it('has proper touch target sizes for mobile', () => {
      render(<MemoryCard {...defaultProps} />)
      
      const buttons = screen.getAllByRole('button')
      buttons.forEach(button => {
        expect(button).toHaveClass('min-h-[44px]')
      })
    })
  })

  describe('Accessibility', () => {
    it('has proper ARIA labels', () => {
      render(<MemoryCard {...defaultProps} />)
      
      const editButton = screen.getByRole('button', { name: /edit/i })
      const deleteButton = screen.getByRole('button', { name: /delete/i })
      
      expect(editButton).toBeInTheDocument()
      expect(deleteButton).toBeInTheDocument()
    })

    it('supports keyboard navigation', async () => {
      render(<MemoryCard {...defaultProps} />)
      
      const editButton = screen.getByRole('button', { name: /edit/i })
      editButton.focus()
      
      expect(editButton).toHaveFocus()
      
      // Test Enter key activation
      fireEvent.keyDown(editButton, { key: 'Enter', code: 'Enter' })
      
      await waitFor(() => {
        expect(defaultProps.onEdit).toHaveBeenCalledWith(mockMemory)
      })
    })
  })
})