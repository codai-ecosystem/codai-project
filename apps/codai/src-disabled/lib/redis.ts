// Mock redis for testing
const mockCache = new Map<string, string>();

export const redis = {
	flushall: async () => {
		mockCache.clear();
	},
	get: async (key: string) => {
		return mockCache.get(key) || null;
	},
	set: async (key: string, value: string) => {
		mockCache.set(key, value);
	},
	del: async (key: string) => {
		mockCache.delete(key);
	},
	ping: async () => {
		return 'PONG';
	},
	quit: async () => {},
};
