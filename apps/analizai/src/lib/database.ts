// Mock database connection for service
export const db = {
  async query(sql: string, params?: any[]): Promise<{ rows: any[] }> {
    console.log(`Mock DB Query: ${sql}`, params);
    return { rows: [] };
  },

  async close(): Promise<void> {
    console.log('Mock DB: Connection closed');
  },

  async destroy(): Promise<void> {
    console.log('Mock DB: Connection destroyed');
  },

  async transaction<T>(callback: (tx: any) => Promise<T>): Promise<T> {
    const tx = {
      query: this.query,
      rollback: () => console.log('Mock DB: Transaction rolled back'),
      commit: () => console.log('Mock DB: Transaction committed')
    };
    return callback(tx);
  },

  migrate: {
    async latest(): Promise<any[]> {
      console.log('Mock DB: Migrations run');
      return [];
    },
    async rollback(): Promise<any[]> {
      console.log('Mock DB: Migrations rolled back');
      return [];
    }
  },

  seed: {
    async run(): Promise<any[]> {
      console.log('Mock DB: Seeds run');
      return [];
    }
  }
};

export default db;
