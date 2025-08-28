import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { spawn, ChildProcess } from 'child_process';
import { join } from 'path';
import { promises as fs } from 'fs';

// Test configuration
const SERVER_PATH = join(__dirname, '../dist/mcp-server.js');
const TEST_TIMEOUT = 10000; // 10 seconds

interface MCPRequest {
    jsonrpc: string;
    method: string;
    id: number;
    params?: any;
}

interface MCPResponse {
    jsonrpc: string;
    id: number;
    result?: any;
    error?: {
        code: number;
        message: string;
        data?: any;
    };
}

class MCPTestClient {
    private server: ChildProcess | null = null;
    private messageId = 0;

    async start(): Promise<void> {
        return new Promise((resolve, reject) => {
            this.server = spawn('node', [SERVER_PATH], {
                stdio: ['pipe', 'pipe', 'pipe']
            });

            let initialized = false;

            this.server.stderr?.on('data', (data) => {
                const message = data.toString();
                if (message.includes('Enhanced GlassMCP Server started successfully')) {
                    if (!initialized) {
                        initialized = true;
                        resolve();
                    }
                }
                // Log server messages for debugging
                console.log('[SERVER]:', message.trim());
            });

            this.server.on('error', (error) => {
                reject(error);
            });

            // Timeout if server doesn't start
            setTimeout(() => {
                if (!initialized) {
                    reject(new Error('Server failed to start within timeout'));
                }
            }, 5000);
        });
    }

    async stop(): Promise<void> {
        if (this.server) {
            this.server.kill();
            this.server = null;
        }
    }

    async sendRequest(method: string, params?: any): Promise<MCPResponse> {
        if (!this.server || !this.server.stdin) {
            throw new Error('Server not started');
        }

        const request: MCPRequest = {
            jsonrpc: '2.0',
            method,
            id: ++this.messageId,
            params
        };

        return new Promise((resolve, reject) => {
            let responseData = '';

            const onData = (data: Buffer) => {
                responseData += data.toString();
                try {
                    const response = JSON.parse(responseData);
                    this.server!.stdout!.off('data', onData);
                    resolve(response);
                } catch {
                    // Not complete JSON yet, continue collecting
                }
            };

            this.server!.stdout!.on('data', onData);

            // Send the request
            const requestData = JSON.stringify(request) + '\n';
            this.server!.stdin!.write(requestData);

            // Timeout
            setTimeout(() => {
                this.server!.stdout!.off('data', onData);
                reject(new Error('Request timeout'));
            }, TEST_TIMEOUT);
        });
    }
}

describe('Glass MCP Consolidated Tools', () => {
    let client: MCPTestClient;

    beforeEach(async () => {
        client = new MCPTestClient();
        await client.start();
    }, 15000);

    afterEach(async () => {
        await client.stop();
    });

    describe('Tool Discovery', () => {
        it('should list all available tools including consolidated ones', async () => {
            const response = await client.sendRequest('tools/list');

            expect(response.result).toBeDefined();
            expect(response.result.tools).toBeInstanceOf(Array);

            const tools = response.result.tools;
            const toolNames = tools.map((tool: any) => tool.name);

            // Check for consolidated tools
            expect(toolNames).toContain('glass_windows');
            expect(toolNames).toContain('glass_clipboard');

            // Check for legacy tools with deprecation warnings
            expect(toolNames).toContain('window_list');
            expect(toolNames).toContain('clipboard_get_text');

            // Check for remaining individual tools
            expect(toolNames).toContain('system_info');
            expect(toolNames).toContain('file_read');
        });

        it('should have proper schemas for consolidated tools', async () => {
            const response = await client.sendRequest('tools/list');
            const tools = response.result.tools;

            const glassWindows = tools.find((tool: any) => tool.name === 'glass_windows');
            expect(glassWindows).toBeDefined();
            expect(glassWindows.inputSchema.properties.operation).toBeDefined();
            expect(glassWindows.inputSchema.properties.operation.enum).toContain('list');
            expect(glassWindows.inputSchema.properties.operation.enum).toContain('focus');
            expect(glassWindows.inputSchema.properties.operation.enum).toContain('extract_text');
            expect(glassWindows.inputSchema.properties.operation.enum).toContain('send_text');

            const glassClipboard = tools.find((tool: any) => tool.name === 'glass_clipboard');
            expect(glassClipboard).toBeDefined();
            expect(glassClipboard.inputSchema.properties.operation.enum).toContain('get_text');
            expect(glassClipboard.inputSchema.properties.operation.enum).toContain('set_text');
        });
    });

    describe('glass_windows Consolidated Tool', () => {
        it('should execute list operation successfully', async () => {
            const response = await client.sendRequest('tools/call', {
                name: 'glass_windows',
                arguments: {
                    operation: 'list'
                }
            });

            expect(response.result).toBeDefined();
            expect(response.result.content).toBeDefined();
            expect(response.result.content[0].type).toBe('text');

            // Parse the JSON response
            const resultData = JSON.parse(response.result.content[0].text);
            expect(Array.isArray(resultData)).toBe(true);
        });

        it('should handle focus operation with missing title parameter', async () => {
            const response = await client.sendRequest('tools/call', {
                name: 'glass_windows',
                arguments: {
                    operation: 'focus'
                    // Missing title parameter
                }
            });

            expect(response.result.isError).toBe(true);
            const errorData = JSON.parse(response.result.content[0].text);
            expect(errorData.error).toContain('Missing required parameter: title');
        });

        it('should handle extract_text operation with windowHandle', async () => {
            const response = await client.sendRequest('tools/call', {
                name: 'glass_windows',
                arguments: {
                    operation: 'extract_text',
                    windowHandle: 123456 // Fake handle for testing
                }
            });

            // Should return error or result (depending on whether window exists)
            expect(response.result).toBeDefined();
            expect(response.result.content).toBeDefined();
        });

        it('should reject unknown operations', async () => {
            const response = await client.sendRequest('tools/call', {
                name: 'glass_windows',
                arguments: {
                    operation: 'invalid_operation'
                }
            });

            expect(response.result.isError).toBe(true);
            const errorData = JSON.parse(response.result.content[0].text);
            expect(errorData.error).toContain('Unknown operation: invalid_operation');
        });
    });

    describe('glass_clipboard Consolidated Tool', () => {
        it('should execute get_text operation', async () => {
            const response = await client.sendRequest('tools/call', {
                name: 'glass_clipboard',
                arguments: {
                    operation: 'get_text'
                }
            });

            expect(response.result).toBeDefined();
            expect(response.result.content).toBeDefined();
            expect(response.result.content[0].type).toBe('text');
        });

        it('should execute set_text operation', async () => {
            const testText = 'Test clipboard content from MCP';

            const response = await client.sendRequest('tools/call', {
                name: 'glass_clipboard',
                arguments: {
                    operation: 'set_text',
                    text: testText
                }
            });

            expect(response.result).toBeDefined();
            expect(response.result.content).toBeDefined();

            // Verify the text was set by getting it back
            const getResponse = await client.sendRequest('tools/call', {
                name: 'glass_clipboard',
                arguments: {
                    operation: 'get_text'
                }
            });

            const clipboardData = JSON.parse(getResponse.result.content[0].text);
            expect(clipboardData.text).toBe(testText);
        });

        it('should handle missing text parameter for set_text', async () => {
            const response = await client.sendRequest('tools/call', {
                name: 'glass_clipboard',
                arguments: {
                    operation: 'set_text'
                    // Missing text parameter
                }
            });

            expect(response.result.isError).toBe(true);
            const errorData = JSON.parse(response.result.content[0].text);
            expect(errorData.error).toContain('Missing required parameter: text');
        });
    });

    describe('Legacy Tool Backwards Compatibility', () => {
        it('should execute legacy window_list with deprecation warning', async () => {
            const response = await client.sendRequest('tools/call', {
                name: 'window_list',
                arguments: {}
            });

            expect(response.result).toBeDefined();
            expect(response.result.content).toBeDefined();
            expect(response.result.content[0].text).toContain('[DEPRECATION WARNING]');
            expect(response.result.content[0].text).toContain('Use \'glass_windows\' with operation \'list\' instead');
        });

        it('should execute legacy clipboard_get_text with deprecation warning', async () => {
            const response = await client.sendRequest('tools/call', {
                name: 'clipboard_get_text',
                arguments: {}
            });

            expect(response.result).toBeDefined();
            expect(response.result.content).toBeDefined();
            expect(response.result.content[0].text).toContain('[DEPRECATION WARNING]');
            expect(response.result.content[0].text).toContain('Use \'glass_clipboard\' with operation \'get_text\' instead');
        });

        it('should execute legacy window_focus with parameter mapping', async () => {
            const response = await client.sendRequest('tools/call', {
                name: 'window_focus',
                arguments: {
                    title: 'Notepad'
                }
            });

            expect(response.result).toBeDefined();
            expect(response.result.content).toBeDefined();
            expect(response.result.content[0].text).toContain('[DEPRECATION WARNING]');
            expect(response.result.content[0].text).toContain('Use \'glass_windows\' with operation \'focus\' instead');
        });
    });

    describe('Remaining Individual Tools', () => {
        it('should execute system_info tool', async () => {
            const response = await client.sendRequest('tools/call', {
                name: 'system_info',
                arguments: {}
            });

            expect(response.result).toBeDefined();
            expect(response.result.content).toBeDefined();

            const systemData = JSON.parse(response.result.content[0].text);
            expect(systemData.computerName).toBeDefined();
            expect(systemData.userName).toBeDefined();
            expect(systemData.osVersion).toBeDefined();
        });

        it('should execute file_exists tool', async () => {
            // Test with a file that likely exists
            const response = await client.sendRequest('tools/call', {
                name: 'file_exists',
                arguments: {
                    path: SERVER_PATH
                }
            });

            expect(response.result).toBeDefined();
            expect(response.result.content).toBeDefined();

            const existsData = JSON.parse(response.result.content[0].text);
            expect(existsData.exists).toBe(true);
        });

        it('should handle file_exists with non-existent file', async () => {
            const response = await client.sendRequest('tools/call', {
                name: 'file_exists',
                arguments: {
                    path: 'C:\\NonExistentFile12345.txt'
                }
            });

            expect(response.result).toBeDefined();
            const existsData = JSON.parse(response.result.content[0].text);
            expect(existsData.exists).toBe(false);
        });
    });

    describe('Error Handling', () => {
        it('should handle unknown tool name', async () => {
            const response = await client.sendRequest('tools/call', {
                name: 'unknown_tool',
                arguments: {}
            });

            expect(response.result.isError).toBe(true);
            const errorData = JSON.parse(response.result.content[0].text);
            expect(errorData.error).toContain('Unknown tool: unknown_tool');
        });

        it('should handle malformed requests gracefully', async () => {
            const response = await client.sendRequest('tools/call', {
                name: 'glass_windows'
                // Missing arguments
            });

            // Should handle gracefully without crashing
            expect(response.result).toBeDefined();
        });
    });

    describe('Performance and Reliability', () => {
        it('should handle multiple rapid requests', async () => {
            const promises = Array.from({ length: 5 }, (_, i) =>
                client.sendRequest('tools/call', {
                    name: 'glass_clipboard',
                    arguments: {
                        operation: 'get_text'
                    }
                })
            );

            const responses = await Promise.all(promises);

            responses.forEach(response => {
                expect(response.result).toBeDefined();
                expect(response.result.content).toBeDefined();
            });
        });

        it('should maintain state consistency', async () => {
            // Set clipboard text
            const setText = 'Consistency test ' + Date.now();
            await client.sendRequest('tools/call', {
                name: 'glass_clipboard',
                arguments: {
                    operation: 'set_text',
                    text: setText
                }
            });

            // Get clipboard text multiple times
            const responses = await Promise.all([
                client.sendRequest('tools/call', {
                    name: 'glass_clipboard',
                    arguments: { operation: 'get_text' }
                }),
                client.sendRequest('tools/call', {
                    name: 'clipboard_get_text', // Legacy version
                    arguments: {}
                })
            ]);

            // Both should return the same text (ignoring deprecation warning)
            const newResult = JSON.parse(responses[0].result.content[0].text);
            const legacyResult = JSON.parse(responses[1].result.content[0].text.split('\n\n')[1]); // Skip warning

            expect(newResult.text).toBe(setText);
            expect(legacyResult.text).toBe(setText);
        });
    });
});

describe('Integration Tests', () => {
    let client: MCPTestClient;

    beforeEach(async () => {
        client = new MCPTestClient();
        await client.start();
    }, 15000);

    afterEach(async () => {
        await client.stop();
    });

    it('should demonstrate consolidated vs legacy equivalence', async () => {
        // Test that consolidated and legacy tools produce equivalent results
        const consolidatedResponse = await client.sendRequest('tools/call', {
            name: 'glass_windows',
            arguments: {
                operation: 'list'
            }
        });

        const legacyResponse = await client.sendRequest('tools/call', {
            name: 'window_list',
            arguments: {}
        });

        // Extract actual results (ignoring deprecation warning for legacy)
        const consolidatedResult = JSON.parse(consolidatedResponse.result.content[0].text);
        const legacyResultRaw = legacyResponse.result.content[0].text;
        const legacyResult = JSON.parse(legacyResultRaw.split('\n\n')[1]); // Skip warning

        // Should have same structure and data
        expect(Array.isArray(consolidatedResult)).toBe(Array.isArray(legacyResult));
        expect(consolidatedResult.length).toBe(legacyResult.length);
    });

    it('should handle workflow scenarios', async () => {
        // Workflow: List windows → Focus a window → Extract text
        const windowsResponse = await client.sendRequest('tools/call', {
            name: 'glass_windows',
            arguments: { operation: 'list' }
        });

        const windows = JSON.parse(windowsResponse.result.content[0].text);

        if (windows.length > 0) {
            const firstWindow = windows[0];

            // Try to focus the window
            const focusResponse = await client.sendRequest('tools/call', {
                name: 'glass_windows',
                arguments: {
                    operation: 'focus',
                    title: firstWindow.title,
                    exact: true
                }
            });

            expect(focusResponse.result).toBeDefined();

            // Try to extract text from the window
            const extractResponse = await client.sendRequest('tools/call', {
                name: 'glass_windows',
                arguments: {
                    operation: 'extract_text',
                    windowHandle: parseInt(firstWindow.handle)
                }
            });

            expect(extractResponse.result).toBeDefined();
        }
    });
});