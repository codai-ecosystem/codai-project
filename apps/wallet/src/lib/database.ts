// Database configuration for wallet
// Using mock implementation for build compatibility

const config = {
  connectionString: process.env.DATABASE_URL || 'postgresql://localhost:5432/wallet',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
};

// Mock pool for compatibility
export const pool = {
  query: async (text: string, params?: any[]) => {
    console.log('Mock pool.query called:', text);
    return { rows: [], rowCount: 0 };
  },
  end: async () => {
    console.log('Mock pool.end called');
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