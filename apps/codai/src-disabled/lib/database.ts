// Mock database for testing
const mockData = new Map();

export const db = {
	migrate: {
		latest: async () => {},
		rollback: async () => {},
	},
	seed: {
		run: async () => {},
	},
	raw: async (query: string) => {
		if (query.includes('SELECT 1')) {
			return { rows: [{ test: 1 }] };
		}
		return { rows: [] };
	},
};
