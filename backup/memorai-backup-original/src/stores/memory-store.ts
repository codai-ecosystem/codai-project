import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import type { StateCreator } from 'zustand'

export interface Memory {
  id: string
  content: string
  type: 'note' | 'task' | 'conversation' | 'document' | 'thread' | 'personality' | 'emotion'
  tags: string[]
  importance: number
  source: string
  timestamp: Date
  embedding?: number[]
  metadata?: Record<string, any>
}

export interface MemoryState {
  memories: Memory[]
  isLoading: boolean
  error: string | null
  searchQuery: string
  selectedMemories: string[]
  filters: {
    type?: Memory['type']
    tags?: string[]
    importance?: [number, number]
    dateRange?: [Date, Date]
  }
}

export interface MemoryActions {
  // Memory CRUD operations
  addMemory: (content: string, options?: Partial<Memory>) => Promise<void>
  updateMemory: (id: string, updates: Partial<Memory>) => Promise<void>
  deleteMemory: (id: string) => Promise<void>
  getMemory: (id: string) => Memory | undefined

  // Search and filtering
  searchMemories: (query: string) => Promise<void>
  setFilters: (filters: Partial<MemoryState['filters']>) => void
  clearFilters: () => void

  // Utility methods
  getMemoriesByType: (type: Memory['type']) => Memory[]
  getRecentMemories: (days: number) => Memory[]
  getMemoriesByImportance: (minImportance: number) => Memory[]
  getMemoriesWithTags: () => Memory[]

  // Selection management
  selectMemory: (id: string) => void
  deselectMemory: (id: string) => void
  clearSelection: () => void
  selectAll: () => void

  // Bulk operations
  deleteSelected: () => Promise<void>
  exportSelected: () => Promise<Blob>

  // State management
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  clearError: () => void

  // Data fetching
  fetchMemories: () => Promise<void>
  refreshMemories: () => Promise<void>
}

export type MemoryStore = MemoryState & MemoryActions

const initialState: MemoryState = {
  memories: [],
  isLoading: false,
  error: null,
  searchQuery: '',
  selectedMemories: [],
  filters: {}
}

// Mock API functions for now - replace with real API calls
const mockAPI = {
  async createMemory(content: string, options: Partial<Memory> = {}): Promise<Memory> {
    const memory: Memory = {
      id: Date.now().toString(),
      content,
      type: options.type || 'note',
      tags: options.tags || [],
      importance: options.importance || 0.5,
      source: options.source || 'dashboard',
      timestamp: new Date(),
      metadata: options.metadata || {}
    }

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 100))
    return memory
  },

  async fetchMemories(): Promise<Memory[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 200))
    return [
      {
        id: '1',
        content: 'Sample memory for testing',
        type: 'note',
        tags: ['test', 'sample'],
        importance: 0.7,
        source: 'dashboard',
        timestamp: new Date(),
      },
      {
        id: '2',
        content: 'Another test memory',
        type: 'task',
        tags: ['task', 'todo'],
        importance: 0.9,
        source: 'api',
        timestamp: new Date(),
      }
    ]
  },

  async updateMemory(id: string, updates: Partial<Memory>): Promise<Memory> {
    await new Promise(resolve => setTimeout(resolve, 100))
    // Return updated memory (mocked)
    return { id, ...updates } as Memory
  },

  async deleteMemory(id: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 100))
  },

  async searchMemories(query: string): Promise<Memory[]> {
    await new Promise(resolve => setTimeout(resolve, 150))
    // Mock search results
    return []
  }
}

const createMemoryStore: StateCreator<MemoryStore> = (set, get) => ({
  ...initialState,

  // Memory CRUD operations
  addMemory: async (content: string, options = {}) => {
    if (!content.trim()) {
      throw new Error('Content is required')
    }

    set({ isLoading: true, error: null })

    try {
      const memory = await mockAPI.createMemory(content, options)
      set((state: MemoryStore) => ({
        memories: [...state.memories, memory],
        isLoading: false
      }))
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to add memory',
        isLoading: false
      })
      throw error
    }
  },

  updateMemory: async (id: string, updates: Partial<Memory>) => {
    set({ isLoading: true, error: null })

    try {
      const updatedMemory = await mockAPI.updateMemory(id, updates)
      set((state: MemoryStore) => ({
        memories: state.memories.map((m: Memory) =>
          m.id === id ? { ...m, ...updatedMemory } : m
        ),
        isLoading: false
      }))
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to update memory',
        isLoading: false
      })
      throw error
    }
  },

  deleteMemory: async (id: string) => {
    set({ isLoading: true, error: null })

    try {
      await mockAPI.deleteMemory(id)
      set((state: MemoryStore) => ({
        memories: state.memories.filter((m: Memory) => m.id !== id),
        selectedMemories: state.selectedMemories.filter((sid: string) => sid !== id),
        isLoading: false
      }))
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to delete memory',
        isLoading: false
      })
      throw error
    }
  },

  getMemory: (id: string) => {
    return get().memories.find((m: Memory) => m.id === id)
  },

  // Search and filtering
  searchMemories: async (query: string) => {
    set({ searchQuery: query, isLoading: true, error: null })

    try {
      const results = await mockAPI.searchMemories(query)
      set({
        memories: results,
        isLoading: false
      })
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Search failed',
        isLoading: false
      })
    }
  },

  setFilters: (filters: Partial<MemoryState['filters']>) => {
    set((state: MemoryStore) => ({
      filters: { ...state.filters, ...filters }
    }))
  },

  clearFilters: () => {
    set({ filters: {} })
  },

  // Selection management
  selectMemory: (id: string) => {
    set((state: MemoryStore) => ({
      selectedMemories: state.selectedMemories.includes(id)
        ? state.selectedMemories
        : [...state.selectedMemories, id]
    }))
  },

  deselectMemory: (id: string) => {
    set((state: MemoryStore) => ({
      selectedMemories: state.selectedMemories.filter((sid: string) => sid !== id)
    }))
  },

  clearSelection: () => {
    set({ selectedMemories: [] })
  },

  selectAll: () => {
    set((state: MemoryStore) => ({
      selectedMemories: state.memories.map((m: Memory) => m.id)
    }))
  },

  // Bulk operations
  deleteSelected: async () => {
    const { selectedMemories } = get()

    if (selectedMemories.length === 0) return

    set({ isLoading: true, error: null })

    try {
      await Promise.all(selectedMemories.map((id: string) => mockAPI.deleteMemory(id)))
      set((state: MemoryStore) => ({
        memories: state.memories.filter((m: Memory) => !selectedMemories.includes(m.id)),
        selectedMemories: [],
        isLoading: false
      }))
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to delete memories',
        isLoading: false
      })
      throw error
    }
  },

  exportSelected: async () => {
    const { selectedMemories, memories } = get()
    const selectedData = memories.filter((m: Memory) => selectedMemories.includes(m.id))

    const exportData = JSON.stringify(selectedData, null, 2)
    return new Blob([exportData], { type: 'application/json' })
  },

  // Utility methods
  getMemoriesByType: (type: Memory['type']) => {
    const { memories } = get()
    return memories.filter(memory => memory.type === type)
  },

  getRecentMemories: (days: number) => {
    const { memories } = get()
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - days)

    return memories.filter(memory => {
      const memoryDate = new Date(memory.timestamp)
      return memoryDate >= cutoffDate
    })
  },

  getMemoriesByImportance: (minImportance: number) => {
    const { memories } = get()
    return memories.filter(memory => memory.importance >= minImportance)
  },

  getMemoriesWithTags: () => {
    const { memories } = get()
    return memories.filter(memory => memory.tags.length > 0)
  },

  // State management
  setLoading: (loading: boolean) => {
    set({ isLoading: loading })
  },

  setError: (error: string | null) => {
    set({ error })
  },

  clearError: () => {
    set({ error: null })
  },

  // Data fetching
  fetchMemories: async () => {
    set({ isLoading: true, error: null })

    try {
      const memories = await mockAPI.fetchMemories()
      set({
        memories,
        isLoading: false
      })
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch memories',
        isLoading: false
      })
    }
  },

  refreshMemories: async () => {
    await get().fetchMemories()
  }
})

export const useMemoryStore = create<MemoryStore>()(
  devtools(createMemoryStore, {
    name: 'memory-store',
  })
)
