import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface Memory {
  id: string;
  content: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  importance: number;
}

interface MemoryState {
  memories: Memory[];
  searchQuery: string;
  selectedMemory: Memory | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  addMemory: (memory: Omit<Memory, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateMemory: (id: string, updates: Partial<Memory>) => void;
  deleteMemory: (id: string) => void;
  setSearchQuery: (query: string) => void;
  setSelectedMemory: (memory: Memory | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useMemoryStore = create(
  persist(
    (set, get) => ({
      // Store implementation will be added here
      // Based on the interface above
    }),
    {
      name: 'memory-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
