// Test Database Utilities - In-Memory Implementation for Testing
export interface TestData {
  users: any[]
  memories: any[]
}

export class TestDatabase {
  public data: TestData = {
    users: [],
    memories: []
  }

  async connect(): Promise<void> {
    // In-memory database, no connection needed
    return Promise.resolve()
  }

  async disconnect(): Promise<void> {
    // In-memory database, no disconnection needed
    return Promise.resolve()
  }

  async query(sql: string, params: any[] = []): Promise<any[]> {
    // Mock SQL operations based on the query
    if (sql.includes('DELETE FROM memories')) {
      const userId = params[0];
      const originalCount = this.data.memories.length;
      this.data.memories = this.data.memories.filter(m => m.userId !== userId);
      return []; // Return empty array for DELETE operations
    }
    
    if (sql.includes('SELECT * FROM memories WHERE id = ?')) {
      const memoryId = params[0];
      const memory = this.data.memories.find(m => m.id === memoryId);
      return memory ? [memory] : [];
    }
    
    if (sql.includes('SELECT * FROM memories')) {
      // Return all memories for the user
      const userId = params[0];
      if (userId) {
        return this.data.memories.filter(m => m.userId === userId);
      }
      return this.data.memories;
    }
    
    // For other queries, return empty array
    return [];
  }

  async setup(): Promise<void> {
    // Initialize with empty tables
    this.data = {
      users: [],
      memories: []
    }
    return Promise.resolve()
  }

  async cleanup(): Promise<void> {
    this.data = {
      users: [],
      memories: []
    }
    return Promise.resolve()
  }

  async teardown(): Promise<void> {
    // Alias for cleanup - same functionality for test consistency
    await this.cleanup()
    return Promise.resolve()
  }

  async run(sql: string, params?: any[]): Promise<void> {
    // Mock SQL execution
    if (sql.includes('INSERT INTO users')) {
      const user = {
        id: params?.[0] || 'test-id',
        email: params?.[1] || 'test@example.com',
        name: params?.[2] || 'Test User',
        avatar: params?.[3] || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      this.data.users.push(user)
    } else if (sql.includes('INSERT INTO memories')) {
      const memory = {
        id: params?.[0] || 'test-memory-id',
        title: params?.[1] || 'Test Memory',
        content: params?.[2] || 'Test content',
        tags: params?.[3] || '[]',
        category: params?.[4] || 'general',
        userId: params?.[5] || 'test-user-id', // Use consistent field name
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      this.data.memories.push(memory)
    } else if (sql.includes('DELETE FROM')) {
      if (sql.includes('users')) {
        this.data.users = []
      } else if (sql.includes('memories')) {
        this.data.memories = []
      }
    }
    
    return Promise.resolve()
  }

  async get(sql: string, params?: any[]): Promise<any> {
    // Mock single row retrieval
    if (sql.includes('SELECT * FROM users')) {
      return this.data.users[0] || null
    } else if (sql.includes('SELECT * FROM memories')) {
      return this.data.memories[0] || null
    }
    
    return null
  }

  async all(sql: string, params?: any[]): Promise<any[]> {
    // Mock multiple row retrieval
    if (sql.includes('SELECT * FROM users')) {
      return this.data.users
    } else if (sql.includes('SELECT * FROM memories')) {
      return this.data.memories
    }
    
    return []
  }

  // Helper methods for testing
  async seedUser(user: any): Promise<void> {
    this.data.users.push({
      ...user,
      created_at: user.created_at || new Date().toISOString(),
      updated_at: user.updated_at || new Date().toISOString()
    })
  }

  async seedMemory(memory: any): Promise<void> {
    this.data.memories.push({
      ...memory,
      // Normalize userId field - ensure we use consistent field names
      userId: memory.userId || memory.user_id,
      // Remove duplicate user_id if it exists
      user_id: undefined,
      created_at: memory.created_at || new Date().toISOString(),
      updated_at: memory.updated_at || new Date().toISOString()
    })
  }

  getUsers(): any[] {
    return this.data.users
  }

  getMemories(): any[] {
    return this.data.memories
  }

  getUserById(id: string): any {
    return this.data.users.find(u => u.id === id)
  }

  getMemoryById(id: string): any {
    return this.data.memories.find(m => m.id === id)
  }
}

export const testDb = new TestDatabase()
export default testDb