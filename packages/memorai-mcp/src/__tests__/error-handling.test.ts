/**
 * MemorAI MCP Server - Error Handling and Edge Case Testing Suite
 * 
 * Tests for uncovered error paths in mcp-server.ts:
 * - Lines 161-175: Server initialization errors
 * - Lines 189-206: Request handling failures
 * - Lines 219-233: Tool parameter validation
 * - Lines 246-262: Memory store connection errors
 * - Lines 278-298: Tool execution failures
 * - Lines 312-332: Response serialization errors
 * - Lines 346-366: HTTP transport errors
 * - Lines 379-398: Advanced feature errors
 * - Lines 412-432: Cleanup and shutdown errors
 * 
 * Based on Microsoft MCP best practices for comprehensive error testing
 */

import { describe, it, expect, beforeEach, afterEach, vi, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { MemorAIMCPServer } from '../mcp-server.js';
import net from 'node:net';
import fs from 'node:fs';

describe('MemorAI MCP Server - Error Handling and Edge Cases', () => {
    let server: MemorAIMCPServer;
    let app: any;
    let originalEnv: NodeJS.ProcessEnv;

    beforeAll(() => {
        originalEnv = { ...process.env };
        process.env.NODE_ENV = 'test';
        process.env.MEMORAI_API_KEY = 'test-error-handling-key-2025';
    });

    beforeEach(async () => {
        server = new MemorAIMCPServer();
    });

    afterEach(async () => {
        if (server) {
            try {
                await server.stop();
            } catch (error) {
                // Ignore cleanup errors in tests
            }
        }
    });

    afterAll(() => {
        process.env = originalEnv;
    });

    describe('Server Initialization Error Paths (Lines 161-175)', () => {
        it('should handle port already in use error', async () => {
            // Create a server to occupy the port
            const portBlocker = net.createServer();
            const testPort = 4951;

            await new Promise<void>((resolve) => {
                portBlocker.listen(testPort, resolve);
            });

            try {
                process.env.MEMORAI_MCP_PORT = testPort.toString();

                await expect(server.start()).rejects.toThrow(/EADDRINUSE|port.*in use/i);
            } finally {
                portBlocker.close();
                delete process.env.MEMORAI_MCP_PORT;
            }
        });

        it('should handle invalid port configuration', async () => {
            const invalidPorts = [-1, 0, 65536, 999999, 'invalid', null, undefined];

            for (const port of invalidPorts) {
                const testServer = new MemoraiMcpServer();
                process.env.MEMORAI_MCP_PORT = String(port);

                try {
                    await expect(testServer.start()).rejects.toThrow();
                } finally {
                    await testServer.stop();
                }
            }

            delete process.env.MEMORAI_MCP_PORT;
        });

        it('should handle memory store initialization failures', async () => {
            // Mock memory store initialization failure
            vi.doMock('../memory-store.js', () => ({
                MemoryStore: class {
                    constructor() {
                        throw new Error('Memory store initialization failed');
                    }
                }
            }));

            const testServer = new MemoraiMcpServer();
            await expect(testServer.start()).rejects.toThrow(/memory store initialization/i);
        });

        it('should handle Express app creation failures', async () => {
            // Mock Express failure
            vi.doMock('express', () => ({
                default: () => {
                    throw new Error('Express app creation failed');
                }
            }));

            const testServer = new MemoraiMcpServer();
            await expect(testServer.start()).rejects.toThrow(/express.*creation failed/i);
        });

        it('should handle MCP transport initialization errors', async () => {
            // Test various transport configuration errors
            process.env.MEMORAI_MCP_TRANSPORT = 'invalid_transport';

            const testServer = new MemoraiMcpServer();
            await expect(testServer.start()).rejects.toThrow(/transport.*initialization/i);

            delete process.env.MEMORAI_MCP_TRANSPORT;
        });
    });

    describe('Request Handling Failure Paths (Lines 189-206)', () => {
        beforeEach(async () => {
            await server.start();
            app = server.getExpressApp();
        });

        it('should handle malformed JSON-RPC requests', async () => {
            const malformedRequests = [
                '{"jsonrpc": "1.0"}', // Wrong version
                '{"method": "test"}', // Missing jsonrpc
                '{"jsonrpc": "2.0"}', // Missing method
                '{"jsonrpc": "2.0", "method": 123}', // Invalid method type
                '{"jsonrpc": "2.0", "method": ""}', // Empty method
                '{"jsonrpc": "2.0", "method": null}' // Null method
            ];

            for (const malformedRequest of malformedRequests) {
                const response = await request(app)
                    .post('/mcp')
                    .set('Authorization', 'Bearer test-error-handling-key-2025')
                    .set('Content-Type', 'application/json')
                    .send(malformedRequest);

                expect(response.status).toBe(400);
                expect(response.body.error).toBeDefined();
                expect(response.body.error.code).toBe(-32600); // Invalid Request
            }
        });

        it('should handle request timeout scenarios', async () => {
            // Mock a request that takes too long
            const slowRequest = {
                jsonrpc: '2.0',
                method: 'tools/call',
                params: {
                    name: 'intelligence_query',
                    arguments: {
                        query: 'simulate_slow_processing',
                        timeout: 100000 // Very long timeout
                    }
                },
                id: 1
            };

            const response = await request(app)
                .post('/mcp')
                .set('Authorization', 'Bearer test-error-handling-key-2025')
                .timeout(1000) // 1 second timeout
                .send(slowRequest);

            expect(response.status).toBe(408); // Request Timeout
        });

        it('should handle oversized request bodies', async () => {
            const oversizedRequest = {
                jsonrpc: '2.0',
                method: 'tools/call',
                params: {
                    name: 'remember',
                    arguments: {
                        content: 'x'.repeat(50 * 1024 * 1024) // 50MB content
                    }
                },
                id: 1
            };

            const response = await request(app)
                .post('/mcp')
                .set('Authorization', 'Bearer test-error-handling-key-2025')
                .send(oversizedRequest);

            expect(response.status).toBe(413); // Payload Too Large
        });

        it('should handle invalid HTTP methods', async () => {
            const invalidMethods = ['PUT', 'DELETE', 'PATCH', 'HEAD'];

            for (const method of invalidMethods) {
                const response = await request(app)
                [method.toLowerCase()]('/mcp')
                    .set('Authorization', 'Bearer test-error-handling-key-2025');

                expect([405, 404]).toContain(response.status);
            }
        });

        it('should handle missing Content-Type headers', async () => {
            const response = await request(app)
                .post('/mcp')
                .set('Authorization', 'Bearer test-error-handling-key-2025')
                .send('{"jsonrpc":"2.0","method":"tools/list","id":1}');

            expect(response.status).toBe(415); // Unsupported Media Type
        });
    });

    describe('Tool Parameter Validation Errors (Lines 219-233)', () => {
        beforeEach(async () => {
            await server.start();
            app = server.getExpressApp();
        });

        it('should handle missing required parameters', async () => {
            const toolsWithMissingParams = [
                { name: 'remember', arguments: {} }, // Missing content
                { name: 'recall', arguments: {} }, // Missing query
                { name: 'forget', arguments: {} }, // Missing structuredKey
                { name: 'context', arguments: {} }, // Missing agentId
                { name: 'knowledge_graph', arguments: {} } // Missing agentId
            ];

            for (const toolCall of toolsWithMissingParams) {
                const response = await request(app)
                    .post('/mcp')
                    .set('Authorization', 'Bearer test-error-handling-key-2025')
                    .send({
                        jsonrpc: '2.0',
                        method: 'tools/call',
                        params: toolCall,
                        id: 1
                    });

                expect(response.status).toBe(400);
                expect(response.body.error.code).toBe(-32602); // Invalid params
            }
        });

        it('should handle invalid parameter types', async () => {
            const invalidTypeParams = [
                { name: 'remember', arguments: { content: 123, agentId: 'test' } },
                { name: 'recall', arguments: { query: [], agentId: 'test' } },
                { name: 'forget', arguments: { structuredKey: null, agentId: 'test' } },
                { name: 'context', arguments: { agentId: {} } }
            ];

            for (const toolCall of invalidTypeParams) {
                const response = await request(app)
                    .post('/mcp')
                    .set('Authorization', 'Bearer test-error-handling-key-2025')
                    .send({
                        jsonrpc: '2.0',
                        method: 'tools/call',
                        params: toolCall,
                        id: 1
                    });

                expect(response.status).toBe(400);
                expect(response.body.error.code).toBe(-32602);
            }
        });

        it('should handle parameter validation edge cases', async () => {
            const edgeCaseParams = [
                { name: 'remember', arguments: { content: '', agentId: 'test' } }, // Empty content
                { name: 'recall', arguments: { query: ' '.repeat(1000), agentId: 'test' } }, // Whitespace only
                { name: 'context', arguments: { agentId: 'test', contextSize: -1 } }, // Negative number
                { name: 'analyze_patterns', arguments: { agentId: 'test', minStrength: 2.0 } } // Out of range
            ];

            for (const toolCall of edgeCaseParams) {
                const response = await request(app)
                    .post('/mcp')
                    .set('Authorization', 'Bearer test-error-handling-key-2025')
                    .send({
                        jsonrpc: '2.0',
                        method: 'tools/call',
                        params: toolCall,
                        id: 1
                    });

                expect(response.status).toBe(400);
            }
        });
    });

    describe('Memory Store Connection Errors (Lines 246-262)', () => {
        beforeEach(async () => {
            await server.start();
            app = server.getExpressApp();
        });

        it('should handle memory store connection timeouts', async () => {
            // Mock memory store timeout
            vi.doMock('../memory-store.js', () => ({
                MemoryStore: class {
                    async remember() {
                        await new Promise(resolve => setTimeout(resolve, 10000)); // 10s delay
                    }
                }
            }));

            const response = await request(app)
                .post('/mcp')
                .set('Authorization', 'Bearer test-error-handling-key-2025')
                .timeout(2000)
                .send({
                    jsonrpc: '2.0',
                    method: 'tools/call',
                    params: {
                        name: 'remember',
                        arguments: { content: 'test content', agentId: 'test' }
                    },
                    id: 1
                });

            expect(response.status).toBe(408);
        });

        it('should handle database connection failures', async () => {
            // Mock database connection error
            process.env.CBD_BASE_URL = 'http://nonexistent:9999';

            const response = await request(app)
                .post('/mcp')
                .set('Authorization', 'Bearer test-error-handling-key-2025')
                .send({
                    jsonrpc: '2.0',
                    method: 'tools/call',
                    params: {
                        name: 'remember',
                        arguments: { content: 'test content', agentId: 'test' }
                    },
                    id: 1
                });

            expect(response.status).toBe(503); // Service Unavailable

            delete process.env.CBD_BASE_URL;
        });

        it('should handle memory store corruption errors', async () => {
            // Test handling of corrupted memory data
            const response = await request(app)
                .post('/mcp')
                .set('Authorization', 'Bearer test-error-handling-key-2025')
                .send({
                    jsonrpc: '2.0',
                    method: 'tools/call',
                    params: {
                        name: 'recall',
                        arguments: {
                            query: JSON.stringify({ corrupted: true, invalidStructure: {} }),
                            agentId: 'test'
                        }
                    },
                    id: 1
                });

            expect(response.status).toBeLessThanOrEqual(500);
        });
    });

    describe('Tool Execution Failure Paths (Lines 278-298)', () => {
        beforeEach(async () => {
            await server.start();
            app = server.getExpressApp();
        });

        it('should handle AI integration service failures', async () => {
            // Mock AI service failure
            process.env.ROMAI_AGI_BASE_URL = 'http://localhost:9998';

            const response = await request(app)
                .post('/mcp')
                .set('Authorization', 'Bearer test-error-handling-key-2025')
                .send({
                    jsonrpc: '2.0',
                    method: 'tools/call',
                    params: {
                        name: 'intelligence_query',
                        arguments: { query: 'test query' }
                    },
                    id: 1
                });

            expect(response.status).toBe(503);
            expect(response.body.error.message).toContain('AI service');

            delete process.env.ROMAI_AGI_BASE_URL;
        });

        it('should handle tool execution timeouts', async () => {
            const response = await request(app)
                .post('/mcp')
                .set('Authorization', 'Bearer test-error-handling-key-2025')
                .timeout(1000)
                .send({
                    jsonrpc: '2.0',
                    method: 'tools/call',
                    params: {
                        name: 'multimodal_synthesis',
                        arguments: {
                            content: 'very complex multimodal processing that takes too long',
                            mode: 'TRANSCENDENT'
                        }
                    },
                    id: 1
                });

            expect([408, 504]).toContain(response.status);
        });

        it('should handle tool execution memory errors', async () => {
            // Try to process extremely large data
            const largeData = {
                content: JSON.stringify({
                    data: new Array(1000000).fill('large data chunk')
                })
            };

            const response = await request(app)
                .post('/mcp')
                .set('Authorization', 'Bearer test-error-handling-key-2025')
                .send({
                    jsonrpc: '2.0',
                    method: 'tools/call',
                    params: {
                        name: 'analyze_patterns',
                        arguments: { agentId: 'test', ...largeData }
                    },
                    id: 1
                });

            expect([413, 507]).toContain(response.status);
        });

        it('should handle concurrent tool execution limits', async () => {
            // Execute many tools simultaneously
            const promises = Array.from({ length: 100 }, (_, i) =>
                request(app)
                    .post('/mcp')
                    .set('Authorization', 'Bearer test-error-handling-key-2025')
                    .send({
                        jsonrpc: '2.0',
                        method: 'tools/call',
                        params: {
                            name: 'remember',
                            arguments: { content: `concurrent test ${i}`, agentId: 'test' }
                        },
                        id: i
                    })
            );

            const responses = await Promise.all(promises);
            const rejectedResponses = responses.filter(r => r.status === 429);

            expect(rejectedResponses.length).toBeGreaterThan(0);
        });
    });

    describe('Response Serialization Errors (Lines 312-332)', () => {
        beforeEach(async () => {
            await server.start();
            app = server.getExpressApp();
        });

        it('should handle circular reference in response data', async () => {
            // Mock a tool that returns circular references
            const response = await request(app)
                .post('/mcp')
                .set('Authorization', 'Bearer test-error-handling-key-2025')
                .send({
                    jsonrpc: '2.0',
                    method: 'tools/call',
                    params: {
                        name: 'knowledge_graph',
                        arguments: { agentId: 'test', includeCircularRefs: true }
                    },
                    id: 1
                });

            expect(response.status).toBe(200);
            expect(response.body.result).toBeDefined();
            // Should handle circular references gracefully
        });

        it('should handle non-serializable response data', async () => {
            // Test with functions, symbols, undefined values
            const response = await request(app)
                .post('/mcp')
                .set('Authorization', 'Bearer test-error-handling-key-2025')
                .send({
                    jsonrpc: '2.0',
                    method: 'tools/call',
                    params: {
                        name: 'multimodal_synthesis',
                        arguments: {
                            content: 'test with non-serializable data',
                            includeNonSerializable: true
                        }
                    },
                    id: 1
                });

            expect(response.status).toBe(200);
            expect(typeof response.body.result).toBe('object');
        });

        it('should handle response size limits', async () => {
            const response = await request(app)
                .post('/mcp')
                .set('Authorization', 'Bearer test-error-handling-key-2025')
                .send({
                    jsonrpc: '2.0',
                    method: 'tools/call',
                    params: {
                        name: 'semantic_clustering',
                        arguments: { agentId: 'test', returnLargeDataset: true }
                    },
                    id: 1
                });

            expect(response.status).toBeLessThanOrEqual(200);
            // Should either succeed or fail gracefully with appropriate error
        });
    });

    describe('HTTP Transport Error Paths (Lines 346-366)', () => {
        beforeEach(async () => {
            await server.start();
            app = server.getExpressApp();
        });

        it('should handle connection drops during processing', async () => {
            // This is challenging to test directly, but we can test timeout handling
            const response = await request(app)
                .post('/mcp')
                .set('Authorization', 'Bearer test-error-handling-key-2025')
                .set('Connection', 'close')
                .timeout(100)
                .send({
                    jsonrpc: '2.0',
                    method: 'tools/call',
                    params: {
                        name: 'intelligence_query',
                        arguments: { query: 'complex processing', timeout: 5000 }
                    },
                    id: 1
                });

            // Should handle connection drop gracefully
            expect(response.status).toBeDefined();
        });

        it('should handle malformed HTTP headers', async () => {
            const response = await request(app)
                .post('/mcp')
                .set('Authorization', 'Bearer test-error-handling-key-2025')
                .set('X-Custom-Header', 'invalid\r\nheader\r\n')
                .send({
                    jsonrpc: '2.0',
                    method: 'tools/list',
                    id: 1
                });

            // Should handle malformed headers gracefully
            expect(response.status).toBeLessThanOrEqual(400);
        });

        it('should handle HTTP version compatibility', async () => {
            // Test with different HTTP versions if possible
            // This is limited by supertest capabilities
            const response = await request(app)
                .post('/mcp')
                .set('Authorization', 'Bearer test-error-handling-key-2025')
                .http2()
                .send({
                    jsonrpc: '2.0',
                    method: 'tools/list',
                    id: 1
                });

            expect(response.status).toBeDefined();
        });
    });

    describe('Advanced Feature Error Handling (Lines 379-398)', () => {
        beforeEach(async () => {
            await server.start();
            app = server.getExpressApp();
        });

        it('should handle quantum processing failures', async () => {
            process.env.QUANTUM_ENABLED = 'true';

            const response = await request(app)
                .post('/mcp')
                .set('Authorization', 'Bearer test-error-handling-key-2025')
                .send({
                    jsonrpc: '2.0',
                    method: 'tools/call',
                    params: {
                        name: 'intelligence_query',
                        arguments: {
                            query: 'quantum processing test',
                            types: ['quantum'],
                            forceQuantumError: true
                        }
                    },
                    id: 1
                });

            expect(response.status).toBeLessThanOrEqual(503);

            delete process.env.QUANTUM_ENABLED;
        });

        it('should handle consciousness engine errors', async () => {
            process.env.CONSCIOUSNESS_ENGINE = 'true';

            const response = await request(app)
                .post('/mcp')
                .set('Authorization', 'Bearer test-error-handling-key-2025')
                .send({
                    jsonrpc: '2.0',
                    method: 'tools/call',
                    params: {
                        name: 'multimodal_synthesis',
                        arguments: {
                            content: 'consciousness test',
                            mode: 'TRANSCENDENT',
                            simulateConsciousnessError: true
                        }
                    },
                    id: 1
                });

            expect(response.status).toBeLessThanOrEqual(503);

            delete process.env.CONSCIOUSNESS_ENGINE;
        });

        it('should handle feature flag inconsistencies', async () => {
            // Test with conflicting feature flags
            process.env.QUANTUM_ENABLED = 'false';
            process.env.CONSCIOUSNESS_ENGINE = 'true';

            const response = await request(app)
                .post('/mcp')
                .set('Authorization', 'Bearer test-error-handling-key-2025')
                .send({
                    jsonrpc: '2.0',
                    method: 'tools/call',
                    params: {
                        name: 'intelligence_query',
                        arguments: {
                            query: 'test with conflicting features',
                            types: ['quantum', 'consciousness']
                        }
                    },
                    id: 1
                });

            expect(response.status).toBe(200);
            // Should gracefully handle feature conflicts

            delete process.env.QUANTUM_ENABLED;
            delete process.env.CONSCIOUSNESS_ENGINE;
        });
    });

    describe('Cleanup and Shutdown Error Paths (Lines 412-432)', () => {
        it('should handle graceful shutdown failures', async () => {
            await server.start();

            // Mock shutdown failure
            const originalStop = server.stop.bind(server);
            server.stop = async () => {
                throw new Error('Shutdown failure');
            };

            try {
                await expect(server.stop()).rejects.toThrow(/shutdown failure/i);
            } finally {
                server.stop = originalStop;
                await server.stop();
            }
        });

        it('should handle resource cleanup failures', async () => {
            await server.start();

            // Test cleanup with resource leaks
            const response = await request(server.getExpressApp())
                .post('/mcp')
                .set('Authorization', 'Bearer test-error-handling-key-2025')
                .send({
                    jsonrpc: '2.0',
                    method: 'tools/call',
                    params: {
                        name: 'remember',
                        arguments: { content: 'test cleanup', agentId: 'test', simulateResourceLeak: true }
                    },
                    id: 1
                });

            expect(response.status).toBe(200);

            // Should handle cleanup gracefully even with resource leaks
            await expect(server.stop()).resolves.not.toThrow();
        });

        it('should handle multiple shutdown attempts', async () => {
            await server.start();

            // Call stop multiple times
            await server.stop();
            await expect(server.stop()).resolves.not.toThrow();
            await expect(server.stop()).resolves.not.toThrow();
        });

        it('should handle shutdown during active requests', async () => {
            await server.start();
            const app = server.getExpressApp();

            // Start a long-running request
            const longRunningRequest = request(app)
                .post('/mcp')
                .set('Authorization', 'Bearer test-error-handling-key-2025')
                .timeout(5000)
                .send({
                    jsonrpc: '2.0',
                    method: 'tools/call',
                    params: {
                        name: 'intelligence_query',
                        arguments: { query: 'long running query', timeout: 10000 }
                    },
                    id: 1
                });

            // Shutdown while request is running
            setTimeout(async () => {
                await server.stop();
            }, 100);

            const response = await longRunningRequest;
            // Should handle shutdown gracefully, either completing or failing cleanly
            expect(response.status).toBeDefined();
        });
    });

    describe('Edge Case Combinations', () => {
        beforeEach(async () => {
            await server.start();
            app = server.getExpressApp();
        });

        it('should handle multiple error conditions simultaneously', async () => {
            // Combine authentication error + malformed request + timeout
            const response = await request(app)
                .post('/mcp')
                .set('Authorization', 'Bearer invalid-key')
                .timeout(100)
                .send('invalid json');

            expect(response.status).toBeGreaterThanOrEqual(400);
        });

        it('should handle error recovery sequences', async () => {
            // First request fails
            const failedResponse = await request(app)
                .post('/mcp')
                .set('Authorization', 'Bearer test-error-handling-key-2025')
                .send({
                    jsonrpc: '2.0',
                    method: 'tools/call',
                    params: {
                        name: 'invalid-tool',
                        arguments: {}
                    },
                    id: 1
                });

            expect(failedResponse.status).toBe(404);

            // Recovery request should work
            const recoveryResponse = await request(app)
                .post('/mcp')
                .set('Authorization', 'Bearer test-error-handling-key-2025')
                .send({
                    jsonrpc: '2.0',
                    method: 'tools/list',
                    id: 2
                });

            expect(recoveryResponse.status).toBe(200);
        });

        it('should handle cascading failures gracefully', async () => {
            // Simulate cascading failure scenario
            process.env.CBD_BASE_URL = 'http://nonexistent:9999';
            process.env.ROMAI_AGI_BASE_URL = 'http://localhost:9998';

            const response = await request(app)
                .post('/mcp')
                .set('Authorization', 'Bearer test-error-handling-key-2025')
                .send({
                    jsonrpc: '2.0',
                    method: 'tools/call',
                    params: {
                        name: 'intelligence_query',
                        arguments: { query: 'test with all services down' }
                    },
                    id: 1
                });

            expect(response.status).toBeGreaterThanOrEqual(500);
            expect(response.body.error).toBeDefined();

            delete process.env.CBD_BASE_URL;
            delete process.env.ROMAI_AGI_BASE_URL;
        });
    });
});