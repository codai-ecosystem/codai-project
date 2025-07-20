// Database configuration for memorai
// Using mock implementation for build compatibility

// Mock pool for compatibility
export const pool = {
  query: async (text: string, _params?: any[]) => {
    return { rows: [], rowCount: 0 };
  },
  end: async () => {
    return Promise.resolve();
  }
};

// Simple query interface
export const db = {
  query: (text: string, params?: any[]) => pool.query(text, params),

  // Mock migrate interface for tests
  migrate: {
    latest: async () => {
      console.log('Mock migrate.latest called');
      return Promise.resolve();
    },
    rollback: async () => {
      console.log('Mock migrate.rollback called');
      return Promise.resolve();
    }
  },

  // Mock seed interface for tests
  seed: {
    run: async () => {
      console.log('Mock seed.run called');
      return Promise.resolve();
    }
  },

  // Mock destroy for cleanup
  destroy: async () => {
    console.log('Mock db.destroy called');
    await pool.end();
    return Promise.resolve();
  }
};

export default db;