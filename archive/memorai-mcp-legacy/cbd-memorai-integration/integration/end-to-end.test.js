import { describe, test, expect, beforeAll, afterAll } from 'vitest';
import axios from 'axios';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe('CBD-MemoraiMCP Integration Tests', () => {
    let memoraiProcess;
    let cbdEngineProcess;

    const CBD_HOST = process.env.CBD_HOST || 'localhost';
    const CBD_PORT = parseInt(process.env.CBD_PORT) || 8080;
    const MEMORAI_PORT = parseInt(process.env.MEMORAI_MCP_PORT) || 3000;

    const memoraiBaseUrl = `http://localhost:${MEMORAI_PORT}`;
    const cbdBaseUrl = `http://${CBD_HOST}:${CBD_PORT}`;

    beforeAll(async () => {
        // Start CBD Engine if not running
        try {
            await axios.get(`${cbdBaseUrl}/health`);
            console.log('CBD Engine already running');
        } catch (error) {
            console.log('Starting CBD Engine...');
            cbdEngineProcess = spawn('npm', ['start'], {
                cwd: join(__dirname, '../../../packages/cbd-engine'),
                stdio: 'pipe',
                env: { ...process.env, NODE_ENV: 'test' }
            });

            // Wait for CBD Engine to start
            await waitForService(cbdBaseUrl, '/health', 30000);
        }

        // Start MemoraiMCP with CBD backend
        console.log('Starting MemoraiMCP with CBD backend...');
        memoraiProcess = spawn('node', ['server.js'], {
            cwd: join(__dirname, '../../../packages/memorai-mcp'),
            stdio: 'pipe',
            env: {
                ...process.env,
                CBD_HOST,
                CBD_PORT: CBD_PORT.toString(),
                CBD_DATABASE: 'memorai_integration_test',
                MEMORAI_BACKEND: 'cbd-engine',
                PORT: MEMORAI_PORT.toString()
            }
        });

        // Wait for MemoraiMCP to start
        await waitForService(memoraiBaseUrl, '/health', 30000);

        console.log('Integration test environment ready');
    }, 45000);

    afterAll(async () => {
        // Cleanup test processes
        if (memoraiProcess) {
            memoraiProcess.kill();
        }
        if (cbdEngineProcess) {
            cbdEngineProcess.kill();
        }

        // Wait for graceful shutdown
        await new Promise(resolve => setTimeout(resolve, 2000));
    });

    describe('End-to-End Memory Operations', () => {
        test('should store memory via MemoraiMCP API and persist to CBD Engine', async () => {
            const testMemory = {
                agentId: 'integration-test-agent',
                content: 'This is an integration test memory stored through MemoraiMCP API',
                metadata: {
                    entityType: 'integration-test',
                    testCase: 'e2e-storage',
                    timestamp: new Date().toISOString()
                }
            };

            // Store memory via MemoraiMCP API
            const storeResponse = await axios.post(`${memoraiBaseUrl}/api/v1/memories`, testMemory, {
                headers: { 'Content-Type': 'application/json' }
            });

            expect(storeResponse.status).toBe(200);
            expect(storeResponse.data.success).toBe(true);
            expect(storeResponse.data.memory).toBeDefined();
            expect(storeResponse.data.memory.structuredKey).toBeTruthy();

            const structuredKey = storeResponse.data.memory.structuredKey;

            // Retrieve memory via MemoraiMCP API
            const retrieveResponse = await axios.get(`${memoraiBaseUrl}/api/v1/memories/${structuredKey}`);

            expect(retrieveResponse.status).toBe(200);
            expect(retrieveResponse.data.success).toBe(true);
            expect(retrieveResponse.data.memory.content).toBe(testMemory.content);
            expect(retrieveResponse.data.memory.agentId).toBe(testMemory.agentId);

            // Verify persistence in CBD Engine directly
            const cbdResponse = await axios.get(`${cbdBaseUrl}/api/data/memories/${structuredKey}`, {
                headers: { 'X-Database': 'memorai_integration_test' }
            });

            expect(cbdResponse.status).toBe(200);
            expect(cbdResponse.data.content).toBe(testMemory.content);
        });

        test('should perform semantic search across integrated system', async () => {
            // Store multiple test memories
            const testMemories = [
                {
                    agentId: 'search-test-agent',
                    content: 'Node.js is a JavaScript runtime built on Chrome V8 engine',
                    metadata: { entityType: 'knowledge', topic: 'backend' }
                },
                {
                    agentId: 'search-test-agent',
                    content: 'React is a JavaScript library for building user interfaces',
                    metadata: { entityType: 'knowledge', topic: 'frontend' }
                },
                {
                    agentId: 'search-test-agent',
                    content: 'Docker containers provide application isolation and deployment',
                    metadata: { entityType: 'knowledge', topic: 'devops' }
                }
            ];

            // Store memories
            for (const memory of testMemories) {
                await axios.post(`${memoraiBaseUrl}/api/v1/memories`, memory);
            }

            // Wait for vector indexing
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Perform semantic search
            const searchResponse = await axios.post(`${memoraiBaseUrl}/api/v1/search`, {
                agentId: 'search-test-agent',
                query: 'JavaScript web development technologies',
                limit: 10,
                minSimilarity: 0.3
            });

            expect(searchResponse.status).toBe(200);
            expect(searchResponse.data.success).toBe(true);
            expect(Array.isArray(searchResponse.data.results)).toBe(true);
            expect(searchResponse.data.results.length).toBeGreaterThan(0);

            // Should find JavaScript-related memories
            const hasJavaScriptContent = searchResponse.data.results.some(
                result => result.content.includes('JavaScript')
            );
            expect(hasJavaScriptContent).toBe(true);
        });

        test('should handle memory updates through integrated system', async () => {
            const originalMemory = {
                agentId: 'update-test-agent',
                content: 'Original content for update testing',
                metadata: { entityType: 'test', version: 1 }
            };

            // Store original memory
            const storeResponse = await axios.post(`${memoraiBaseUrl}/api/v1/memories`, originalMemory);
            const structuredKey = storeResponse.data.memory.structuredKey;

            // Update memory
            const updatedData = {
                content: 'Updated content after modification',
                metadata: { entityType: 'test', version: 2, updated: true }
            };

            const updateResponse = await axios.put(
                `${memoraiBaseUrl}/api/v1/memories/${structuredKey}`,
                updatedData
            );

            expect(updateResponse.status).toBe(200);
            expect(updateResponse.data.success).toBe(true);

            // Verify update via MemoraiMCP
            const retrieveResponse = await axios.get(`${memoraiBaseUrl}/api/v1/memories/${structuredKey}`);

            expect(retrieveResponse.data.memory.content).toBe(updatedData.content);
            expect(retrieveResponse.data.memory.metadata.version).toBe(2);
            expect(retrieveResponse.data.memory.metadata.updated).toBe(true);

            // Verify update persisted in CBD Engine
            const cbdResponse = await axios.get(`${cbdBaseUrl}/api/data/memories/${structuredKey}`, {
                headers: { 'X-Database': 'memorai_integration_test' }
            });

            expect(cbdResponse.data.content).toBe(updatedData.content);
        });

        test('should handle memory deletion across integrated system', async () => {
            const testMemory = {
                agentId: 'delete-test-agent',
                content: 'Memory to be deleted in integration test',
                metadata: { entityType: 'test', operation: 'delete' }
            };

            // Store memory
            const storeResponse = await axios.post(`${memoraiBaseUrl}/api/v1/memories`, testMemory);
            const structuredKey = storeResponse.data.memory.structuredKey;

            // Delete memory via MemoraiMCP
            const deleteResponse = await axios.delete(`${memoraiBaseUrl}/api/v1/memories/${structuredKey}`);

            expect(deleteResponse.status).toBe(200);
            expect(deleteResponse.data.success).toBe(true);

            // Verify deletion via MemoraiMCP
            const retrieveResponse = await axios.get(`${memoraiBaseUrl}/api/v1/memories/${structuredKey}`);
            expect(retrieveResponse.status).toBe(404);

            // Verify deletion in CBD Engine
            try {
                await axios.get(`${cbdBaseUrl}/api/data/memories/${structuredKey}`, {
                    headers: { 'X-Database': 'memorai_integration_test' }
                });
                // Should not reach here
                expect(true).toBe(false);
            } catch (error) {
                expect(error.response.status).toBe(404);
            }
        });
    });

    describe('Context and Agent Operations', () => {
        test('should retrieve agent context through integrated system', async () => {
            const agentId = 'context-test-agent';

            // Store context memories
            const contextMemories = [
                {
                    agentId,
                    content: 'User prefers modern JavaScript frameworks',
                    metadata: { entityType: 'preference', importance: 'high' }
                },
                {
                    agentId,
                    content: 'Current project uses TypeScript and React',
                    metadata: { entityType: 'project-info', importance: 'medium' }
                },
                {
                    agentId,
                    content: 'Team follows agile development methodology',
                    metadata: { entityType: 'process', importance: 'medium' }
                }
            ];

            // Store memories
            for (const memory of contextMemories) {
                await axios.post(`${memoraiBaseUrl}/api/v1/memories`, memory);
            }

            // Get agent context
            const contextResponse = await axios.get(`${memoraiBaseUrl}/api/v1/agents/${agentId}/context`, {
                params: { contextSize: 5 }
            });

            expect(contextResponse.status).toBe(200);
            expect(contextResponse.data.success).toBe(true);
            expect(Array.isArray(contextResponse.data.context)).toBe(true);
            expect(contextResponse.data.context.length).toBeGreaterThan(0);
            expect(contextResponse.data.context.length).toBeLessThanOrEqual(5);

            // Verify context contains stored memories
            const contextContents = contextResponse.data.context.map(c => c.content);
            const hasPreferences = contextContents.some(c => c.includes('JavaScript frameworks'));
            expect(hasPreferences).toBe(true);
        });

        test('should handle concurrent operations correctly', async () => {
            const agentId = 'concurrent-test-agent';
            const concurrentCount = 20;

            // Create concurrent memory operations
            const promises = Array.from({ length: concurrentCount }, (_, i) =>
                axios.post(`${memoraiBaseUrl}/api/v1/memories`, {
                    agentId,
                    content: `Concurrent memory operation ${i}`,
                    metadata: {
                        entityType: 'concurrent-test',
                        index: i,
                        timestamp: Date.now()
                    }
                })
            );

            // Execute concurrent operations
            const responses = await Promise.all(promises);

            // Verify all operations succeeded
            responses.forEach((response, index) => {
                expect(response.status).toBe(200);
                expect(response.data.success).toBe(true);
                expect(response.data.memory.content).toBe(`Concurrent memory operation ${index}`);
            });

            // Verify all memories were stored
            const agentMemoriesResponse = await axios.get(`${memoraiBaseUrl}/api/v1/agents/${agentId}/memories`);

            expect(agentMemoriesResponse.status).toBe(200);
            expect(agentMemoriesResponse.data.memories.length).toBe(concurrentCount);
        });
    });

    describe('Error Handling and Resilience', () => {
        test('should handle invalid API requests gracefully', async () => {
            // Test invalid memory data
            const invalidMemory = {
                agentId: '', // Empty agent ID
                content: '',  // Empty content
                metadata: null // Invalid metadata
            };

            try {
                await axios.post(`${memoraiBaseUrl}/api/v1/memories`, invalidMemory);
                expect(true).toBe(false); // Should not reach here
            } catch (error) {
                expect(error.response.status).toBe(400);
                expect(error.response.data.success).toBe(false);
                expect(error.response.data.error).toBeTruthy();
            }
        });

        test('should maintain data consistency during system stress', async () => {
            const agentId = 'stress-test-agent';
            const operationCount = 50;

            // Mix of different operations
            const operations = [];

            for (let i = 0; i < operationCount; i++) {
                if (i % 3 === 0) {
                    // Store operation
                    operations.push(
                        axios.post(`${memoraiBaseUrl}/api/v1/memories`, {
                            agentId,
                            content: `Stress test memory ${i}`,
                            metadata: { entityType: 'stress-test', index: i }
                        })
                    );
                } else if (i % 3 === 1) {
                    // Search operation
                    operations.push(
                        axios.post(`${memoraiBaseUrl}/api/v1/search`, {
                            agentId,
                            query: `stress test memory`,
                            limit: 5
                        })
                    );
                } else {
                    // Context operation
                    operations.push(
                        axios.get(`${memoraiBaseUrl}/api/v1/agents/${agentId}/context`, {
                            params: { contextSize: 3 }
                        })
                    );
                }
            }

            // Execute mixed operations concurrently
            const results = await Promise.allSettled(operations);

            // Most operations should succeed
            const successCount = results.filter(r => r.status === 'fulfilled').length;
            const successRate = successCount / operationCount;

            expect(successRate).toBeGreaterThan(0.8); // At least 80% success rate

            // Verify system is still responsive
            const healthResponse = await axios.get(`${memoraiBaseUrl}/health`);
            expect(healthResponse.status).toBe(200);
        });
    });
});

// Helper function to wait for service to be ready
async function waitForService(baseUrl, endpoint, timeoutMs) {
    const startTime = Date.now();

    while (Date.now() - startTime < timeoutMs) {
        try {
            await axios.get(`${baseUrl}${endpoint}`, { timeout: 1000 });
            return; // Service is ready
        } catch (error) {
            // Wait and retry
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    }

    throw new Error(`Service at ${baseUrl} did not become ready within ${timeoutMs}ms`);
}
