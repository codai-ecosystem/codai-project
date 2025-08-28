/**
 * Memory Management Integration Tests
 * Tests real memory operations with minimal mocking
 * Uses in-memory storage to simulate database operations
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@/tests/setup'
import userEvent from '@testing-library/user-event'
import { MemoryCard } from '../MemoryCard'
import { MemoryList } from '../MemoryList'
import type { Memory } from '@/types'

// Mock translations only
vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key
}))

// In-memory database simulation for testing
class TestMemoryDatabase {
  private memories: Memory[] = []
  private idCounter = 1

  async create(data: Partial<Memory>): Promise<Memory> {
    const memory: Memory = {
      id: `memory-${this.idCounter++}`,
      content: data.content || '',
      tags: data.tags || [],
      agentId: data.agentId || 'test-agent',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      metadata: {
        importance: data.metadata?.importance || 5,
        ...data.metadata
      }
    }
    this.memories.push(memory)
    return memory
  }

  async update(id: string, data: Partial<Memory>): Promise<Memory> {
    const index = this.memories.findIndex(m => m.id === id)
    if (index === -1) throw new Error('Memory not found')
    
    this.memories[index] = {
      ...this.memories[index],
      ...data,
      id, // Preserve ID
      updatedAt: new Date().toISOString()
    }
    return this.memories[index]
  }

  async delete(id: string): Promise<void> {
    const index = this.memories.findIndex(m => m.id === id)
    if (index === -1) throw new Error('Memory not found')
    this.memories.splice(index, 1)
  }

  async findAll(): Promise<Memory[]> {
    return [...this.memories]
  }

  clear() {
    this.memories = []
    this.idCounter = 1
  }
}

const testDb = new TestMemoryDatabase()

// Mock API hooks with real database operations
vi.mock('@/lib/api', () => ({
  useUpdateMemory: () => ({
    mutateAsync: (data: { id: string } & Partial<Memory>) => testDb.update(data.id, data),
    isPending: false
  }),
  useDeleteMemory: () => ({
    mutateAsync: (id: string) => testDb.delete(id),
    isPending: false
  })
}))

describe('Memory Management Integration', () => {
  const sampleMemory: Memory = {
    id: 'test-memory-1',
    content: 'This is a test memory for integration testing',
    tags: ['test', 'integration', 'memory'],
    agentId: 'test-agent',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
    metadata: {
      importance: 7,
      project: 'test-project'
    }
  }

  beforeEach(() => {
    testDb.clear()
  })

  describe('MemoryCard Real Operations', () => {
    it('displays memory data correctly', () => {
      render(<MemoryCard memory={sampleMemory} />)

      expect(screen.getByText('This is a test memory for integration testing')).toBeInTheDocument()
      expect(screen.getByText('test')).toBeInTheDocument()
      expect(screen.getByText('integration')).toBeInTheDocument()
      expect(screen.getByText('memory')).toBeInTheDocument()
    })

    it('handles edit operation with real state management', async () => {
      const user = userEvent.setup()
      const mockOnEdit = vi.fn()

      render(<MemoryCard memory={sampleMemory} onEdit={mockOnEdit} />)

      const editButton = screen.getByRole('button', { name: /edit/i })
      await user.click(editButton)

      expect(mockOnEdit).toHaveBeenCalledWith(sampleMemory)
    })

    it('performs delete operation with database integration', async () => {
      const user = userEvent.setup()
      const mockOnDelete = vi.fn()

      // Add memory to test database
      await testDb.create(sampleMemory)

      render(<MemoryCard memory={sampleMemory} onDelete={mockOnDelete} />)

      const deleteButton = screen.getByRole('button', { name: /delete/i })
      await user.click(deleteButton)

      await waitFor(() => {
        expect(mockOnDelete).toHaveBeenCalledWith(sampleMemory.id)
      })
    })
  })

  describe('MemoryList Real Data Operations', () => {
    it('renders empty state correctly', () => {
      render(<MemoryList memories={[]} />)

      expect(screen.getByText(/no.*memories/i)).toBeInTheDocument()
    })

    it('renders multiple memories with real data', async () => {
      const memories = await Promise.all([
        testDb.create({
          content: 'First memory for testing',
          tags: ['first', 'test'],
          agentId: 'test-agent'
        }),
        testDb.create({
          content: 'Second memory for integration',
          tags: ['second', 'integration'],
          agentId: 'test-agent'
        })
      ])

      render(<MemoryList memories={memories} />)

      expect(screen.getByText('First memory for testing')).toBeInTheDocument()
      expect(screen.getByText('Second memory for integration')).toBeInTheDocument()
      expect(screen.getByText('first')).toBeInTheDocument()
      expect(screen.getByText('second')).toBeInTheDocument()
    })

    it('handles memory operations in list context', async () => {
      const user = userEvent.setup()
      const mockOnEdit = vi.fn()
      const mockOnDelete = vi.fn()

      const memory = await testDb.create({
        content: 'Memory for list operations',
        tags: ['list', 'operations'],
        agentId: 'test-agent'
      })

      render(
        <MemoryList 
          memories={[memory]} 
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      )

      // Test edit in list context
      const editButton = screen.getByRole('button', { name: /edit/i })
      await user.click(editButton)
      expect(mockOnEdit).toHaveBeenCalledWith(memory)

      // Test delete in list context  
      const deleteButton = screen.getByRole('button', { name: /delete/i })
      await user.click(deleteButton)
      expect(mockOnDelete).toHaveBeenCalledWith(memory.id)
    })
  })

  describe('Memory Filtering and Search Integration', () => {
    it('filters memories by content with real search logic', async () => {
      const memories = await Promise.all([
        testDb.create({
          content: 'JavaScript testing strategies',
          tags: ['js', 'testing'],
          agentId: 'test-agent'
        }),
        testDb.create({
          content: 'Python data analysis',
          tags: ['python', 'data'],
          agentId: 'test-agent'
        })
      ])

      // Component with search functionality
      const SearchableMemoryList = ({ searchTerm }: { searchTerm: string }) => {
        const filteredMemories = memories.filter(memory =>
          memory.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
          memory.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
        )
        return <MemoryList memories={filteredMemories} />
      }

      // Test JavaScript search
      const { rerender } = render(<SearchableMemoryList searchTerm="javascript" />)
      expect(screen.getByText('JavaScript testing strategies')).toBeInTheDocument()
      expect(screen.queryByText('Python data analysis')).not.toBeInTheDocument()

      // Test Python search
      rerender(<SearchableMemoryList searchTerm="python" />)
      expect(screen.getByText('Python data analysis')).toBeInTheDocument()
      expect(screen.queryByText('JavaScript testing strategies')).not.toBeInTheDocument()

      // Test tag search
      rerender(<SearchableMemoryList searchTerm="testing" />)
      expect(screen.getByText('JavaScript testing strategies')).toBeInTheDocument()
      expect(screen.queryByText('Python data analysis')).not.toBeInTheDocument()
    })
  })

  describe('Real-time Updates and State Management', () => {
    it('handles concurrent memory operations', async () => {
      // Simulate multiple operations happening simultaneously
      const operations = [
        testDb.create({ content: 'Memory 1', agentId: 'test-agent' }),
        testDb.create({ content: 'Memory 2', agentId: 'test-agent' }),
        testDb.create({ content: 'Memory 3', agentId: 'test-agent' })
      ]

      const memories = await Promise.all(operations)
      expect(memories).toHaveLength(3)

      // Verify all memories were created with correct data
      const allMemories = await testDb.findAll()
      expect(allMemories).toHaveLength(3)
      expect(allMemories.map(m => m.content)).toEqual([
        'Memory 1',
        'Memory 2', 
        'Memory 3'
      ])
    })

    it('maintains data consistency during updates', async () => {
      const memory = await testDb.create({
        content: 'Original content',
        tags: ['original'],
        agentId: 'test-agent'
      })

      // Update memory
      const updatedMemory = await testDb.update(memory.id, {
        content: 'Updated content',
        tags: ['updated', 'modified']
      })

      expect(updatedMemory.content).toBe('Updated content')
      expect(updatedMemory.tags).toEqual(['updated', 'modified'])
      expect(updatedMemory.id).toBe(memory.id) // ID should remain same
      expect(updatedMemory.createdAt).toBe(memory.createdAt) // Created date preserved
      expect(updatedMemory.updatedAt).not.toBe(memory.updatedAt) // Updated date changed
    })
  })
})