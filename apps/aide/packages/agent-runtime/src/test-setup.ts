/**
 * Test setup file for agent-runtime package
 * Configures the testing environment
 */

import { beforeAll, afterAll, beforeEach, afterEach, vi } from 'vitest';

// Mock environment variables for testing
beforeAll(() => {
	process.env.NODE_ENV = 'test';
	process.env.OPENAI_API_KEY = 'test-key';
	process.env.ANTHROPIC_API_KEY = 'test-key';
	process.env.FIREBASE_PROJECT_ID = 'test-project';
	process.env.STRIPE_SECRET_KEY = 'sk_test_mock_key';
});

// Reset mocks after each test
afterEach(() => {
	vi.clearAllMocks();
});

// Global test utilities
declare global {
	var mockLLMService: any;
	var mockMemoryGraph: any;
}

global.mockLLMService = {
	generateResponse: vi.fn().mockResolvedValue({
		content: 'Mock response',
		model: 'test-model',
		usage: { tokens: 100 }
	}),
	generateStream: vi.fn()
};

global.mockMemoryGraph = {
	addNode: vi.fn(),
	getNode: vi.fn(),
	updateNode: vi.fn(),
	query: vi.fn().mockResolvedValue([])
};
