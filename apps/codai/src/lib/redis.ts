// Mock Redis implementation for testing
export class Redis {
    private mockData: Map<string, any> = new Map();

    async ping() {
        return 'PONG';
    }

    async set(key: string, value: any, options?: any) {
        this.mockData.set(key, value);
        return 'OK';
    }

    async get(key: string) {
        return this.mockData.get(key) || null;
    }

    async del(key: string) {
        return this.mockData.delete(key) ? 1 : 0;
    }

    async flushall() {
        this.mockData.clear();
        return 'OK';
    }

    async quit() {
        this.mockData.clear();
        return 'OK';
    }

    async exists(key: string) {
        return this.mockData.has(key) ? 1 : 0;
    }

    async expire(key: string, seconds: number) {
        // Mock expiration - in a real implementation this would set a timeout
        return 1;
    }

    async incr(key: string) {
        const current = this.mockData.get(key) || 0;
        const newValue = parseInt(current) + 1;
        this.mockData.set(key, newValue);
        return newValue;
    }

    async decr(key: string) {
        const current = this.mockData.get(key) || 0;
        const newValue = parseInt(current) - 1;
        this.mockData.set(key, newValue);
        return newValue;
    }
}

// Export a singleton instance
export const redis = new Redis();
