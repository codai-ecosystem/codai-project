// Test environment setup for CBD-MemoraiMCP Integration Tests
import { beforeAll, afterAll } from 'vitest';
import { mkdirSync } from 'fs';

// Create results directory
try {
    mkdirSync('./results', { recursive: true });
} catch (error) {
    // Directory might already exist
}

// Global test environment setup
beforeAll(async () => {
    console.log('Setting up CBD-MemoraiMCP integration test environment...');

    // Set test environment variables
    process.env.NODE_ENV = 'test';
    process.env.CBD_HOST = process.env.CBD_HOST || 'localhost';
    process.env.CBD_PORT = process.env.CBD_PORT || '8080';
    process.env.CBD_DATABASE = 'memorai_integration_test';
    process.env.MEMORAI_MCP_PORT = process.env.MEMORAI_MCP_PORT || '3000';

    console.log(`Test Environment Configuration:
  - CBD Engine: http://${process.env.CBD_HOST}:${process.env.CBD_PORT}
  - MemoraiMCP: http://localhost:${process.env.MEMORAI_MCP_PORT}
  - Test Database: ${process.env.CBD_DATABASE}`);
});

afterAll(async () => {
    console.log('Cleaning up CBD-MemoraiMCP integration test environment...');

    // Cleanup test data if needed
    // This would typically involve clearing test databases

    console.log('Test environment cleanup completed');
});
