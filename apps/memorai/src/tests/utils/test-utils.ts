// Test utilities and database stub for TypeScript compatibility
import { Memory } from '../../types/memory'

export interface TestDatabase {
  data: {
    memories: Memory[]
  }
  getMemoryById(id: string): Memory | null
  getMemories(): Memory[]
  seedMemory(memory: Partial<Memory>): Promise<void>
}

// Mock test database for development/production builds
export const testDb: TestDatabase = {
  data: {
    memories: []
  },
  getMemoryById: (id: string) => null,
  getMemories: () => [],
  seedMemory: async (memory: Partial<Memory>) => {
    // No-op in non-test environments
  }
}

// Export for backward compatibility
export default testDb