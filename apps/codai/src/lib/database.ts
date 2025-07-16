// Mock database implementation for testing
export class Database {
    private mockData: any = {};

    // Mock migrate functionality
    migrate = {
        latest: async () => {
            console.log('Running database migrations...');
            return Promise.resolve();
        },
        rollback: async () => {
            console.log('Rolling back database migrations...');
            return Promise.resolve();
        }
    };

    // Mock seed functionality
    seed = {
        run: async () => {
            console.log('Running database seeds...');
            return Promise.resolve();
        }
    };

    // Mock query functionality
    async query(sql: string, params?: any[]) {
        console.log(`Executing query: ${sql}`, params);
        return [];
    }

    // Mock table operations
    table(name: string) {
        return {
            select: () => this.mockData[name] || [],
            insert: (data: any) => Promise.resolve([{ id: 'mock-id', ...data }]),
            update: (data: any) => Promise.resolve([{ id: 'mock-id', ...data }]),
            delete: () => Promise.resolve([]),
            where: (condition: any) => ({
                select: () => this.mockData[name] || [],
                update: (data: any) => Promise.resolve([{ id: 'mock-id', ...data }]),
                delete: () => Promise.resolve([])
            })
        };
    }
}

// Export a singleton instance
export const db = new Database();
