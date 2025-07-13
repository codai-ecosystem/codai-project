// Mock database connection for admin service
export const db = {
    async query(sql: string, params?: any[]) {
        console.log(`Mock DB Query: ${sql}`, params);
        return { rows: [] };
    },

    async close() {
        console.log('Mock DB: Connection closed');
    },

    async destroy() {
        console.log('Mock DB: Connection destroyed');
    },

    async transaction(callback: (tx: any) => Promise<any>) {
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
