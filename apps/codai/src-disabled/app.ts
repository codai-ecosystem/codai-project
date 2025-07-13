// Mock Express app for testing - codai is a Next.js frontend
class MockApp {
	get(path: string, handler?: Function) {
		return this;
	}
	post(path: string, handler?: Function) {
		return this;
	}
	put(path: string, handler?: Function) {
		return this;
	}
	delete(path: string, handler?: Function) {
		return this;
	}
	listen(port?: number, callback?: Function) {
		if (callback) callback();
		return {
			close: () => {},
			address: () => ({ port: port || 3000 }),
		};
	}
	address() {
		return { port: 3000 };
	}
}

export const app = new MockApp();
