// Mock database connection for service
interface TransactionInterface {
  query: (sql: string, params?: unknown[]) => Promise<{ rows: unknown[] }>;
  rollback: () => void;
  commit: () => void;
}

interface DatabaseInterface {
  query: (sql: string, params?: unknown[]) => Promise<{ rows: unknown[] }>;
  close: () => Promise<void>;
  destroy: () => Promise<void>;
  transaction: (callback: (tx: TransactionInterface) => Promise<void>) => Promise<void>;
  migrate: {
    latest: () => Promise<unknown[]>;
    rollback: () => Promise<unknown[]>;
  };
  seed: {
    run: () => Promise<unknown[]>;
  };
}

export const db: DatabaseInterface = {
  async query(sql: string, params?: unknown[]) {
    console.log(`Mock DB Query: ${sql}`, params);
    return { rows: [] };
  },

  async close() {
    console.log('Mock DB: Connection closed');
  },

  async destroy() {
    console.log('Mock DB: Connection destroyed');
  },

  async transaction(callback: (tx: TransactionInterface) => Promise<void>) {
    const tx = {
      query: this.query,
      rollback: () => console.log('Mock DB: Transaction rolled back'),
      commit: () => console.log('Mock DB: Transaction committed')
    };
    return callback(tx);
  },

  migrate: {
    async latest() {
      console.log('Mock DB: Migrations run');
      return [];
    },
    async rollback() {
      console.log('Mock DB: Migrations rolled back');
      return [];
    }
  },

  seed: {
    async run() {
      console.log('Mock DB: Seeds run');
      return [];
    }
  }
};

export default db;
