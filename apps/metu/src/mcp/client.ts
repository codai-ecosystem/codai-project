import { spawn, ChildProcess } from 'child_process';
import { MCPToolResult } from './types';
import { MCP_CONFIG } from './config';

export class MCPClient {
    private processes: Map<string, ChildProcess> = new Map();
    private connected: Map<string, boolean> = new Map();
    private messageId = 0;

    async connectToServer(serverName: keyof typeof MCP_CONFIG): Promise<boolean> {
        try {
            const config = MCP_CONFIG[serverName];
            const childProcess = spawn(config.command, config.args, {
                env: { ...process.env, ...config.env },
                stdio: ['pipe', 'pipe', 'pipe']
            });

            this.processes.set(serverName, childProcess);
            this.connected.set(serverName, true);

            console.log(`🔗 Connected to ${serverName}`);
            return true;
        } catch (error) {
            console.error(`❌ Failed to connect to ${serverName}:`, error);
            return false;
        }
    }

    async callTool(
        serverName: keyof typeof MCP_CONFIG,
        toolName: string,
        parameters: Record<string, any> = {}
    ): Promise<MCPToolResult> {
        try {
            if (!this.connected.get(serverName)) {
                await this.connectToServer(serverName);
            }

            const childProcess = this.processes.get(serverName);
            if (!childProcess) {
                throw new Error(`No process found for ${serverName}`);
            }

            const request = {
                jsonrpc: '2.0',
                id: ++this.messageId,
                method: 'tools/call',
                params: {
                    name: toolName,
                    arguments: parameters
                }
            };

            return new Promise((resolve) => {
                const timeout = setTimeout(() => {
                    resolve({
                        success: false,
                        error: 'Timeout waiting for response'
                    });
                }, 30000);

                childProcess.stdout?.once('data', (data) => {
                    clearTimeout(timeout);
                    try {
                        const response = JSON.parse(data.toString());
                        resolve({
                            success: true,
                            result: response.result,
                            metadata: { serverName, toolName }
                        });
                    } catch (error) {
                        resolve({
                            success: false,
                            error: `Failed to parse response: ${error}`
                        });
                    }
                });

                childProcess.stdin?.write(JSON.stringify(request) + '\n');
            });
        } catch (error) {
            return {
                success: false,
                error: `Failed to call ${toolName} on ${serverName}: ${error}`
            };
        }
    }

    async disconnectFromServer(serverName: keyof typeof MCP_CONFIG): Promise<void> {
        const childProcess = this.processes.get(serverName);
        if (childProcess) {
            childProcess.kill();
            this.processes.delete(serverName);
            this.connected.set(serverName, false);
            console.log(`🔌 Disconnected from ${serverName}`);
        }
    }

    async disconnectAll(): Promise<void> {
        for (const serverName of this.processes.keys()) {
            await this.disconnectFromServer(serverName as keyof typeof MCP_CONFIG);
        }
    }

    isConnected(serverName: keyof typeof MCP_CONFIG): boolean {
        return this.connected.get(serverName) || false;
    }

    getConnectedServers(): string[] {
        return Array.from(this.connected.entries())
            .filter(([_, connected]) => connected)
            .map(([name, _]) => name);
    }
}

export const mcpClient = new MCPClient();
