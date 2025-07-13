import { mcpClient } from './client';
import { voiceCommandProcessor } from './voiceProcessor';
import { MCPToolResult } from './types';
import { MCP_CONFIG } from './config';

export class MCPManager {
    private isInitialized = false;
    private connectedServers: Set<string> = new Set();

    async initialize(): Promise<boolean> {
        try {
            console.log('🚀 Initializing MCP Manager...');

            // Connect to all MCP servers
            const connectionPromises = Object.keys(MCP_CONFIG).map(async (serverName) => {
                try {
                    const connected = await mcpClient.connectToServer(serverName as keyof typeof MCP_CONFIG);
                    if (connected) {
                        this.connectedServers.add(serverName);
                        console.log(`✅ ${serverName} connected successfully`);
                    } else {
                        console.warn(`⚠️ Failed to connect to ${serverName}`);
                    }
                    return connected;
                } catch (error) {
                    console.error(`❌ Error connecting to ${serverName}:`, error);
                    return false;
                }
            });

            const results = await Promise.all(connectionPromises);
            const successCount = results.filter(Boolean).length;

            console.log(`🎯 MCP Manager initialized: ${successCount}/${Object.keys(MCP_CONFIG).length} servers connected`);
            this.isInitialized = true;

            return successCount > 0;
        } catch (error) {
            console.error('❌ Failed to initialize MCP Manager:', error);
            return false;
        }
    }

    async processVoiceInput(voiceText: string): Promise<MCPToolResult | null> {
        if (!this.isInitialized) {
            console.warn('⚠️ MCP Manager not initialized');
            return null;
        }

        try {
            console.log(`🎤 Processing voice input: "${voiceText}"`);

            // Parse voice command
            const voiceCommand = voiceCommandProcessor.parseVoiceCommand(voiceText);

            if (!voiceCommand) {
                console.log('ℹ️ No MCP command detected in voice input');
                return null;
            }

            console.log(`🎯 Detected command: ${voiceCommand.command} for ${voiceCommand.server}`);

            // Check if target server is connected
            if (!this.connectedServers.has(voiceCommand.server)) {
                console.warn(`⚠️ Target server ${voiceCommand.server} not connected`);
                return {
                    success: false,
                    error: `Server ${voiceCommand.server} is not available`
                };
            }

            // Execute the command
            const result = await voiceCommandProcessor.executeVoiceCommand(voiceCommand);

            if (result.success) {
                console.log(`✅ Voice command executed successfully`);
            } else {
                console.error(`❌ Voice command failed:`, result.error);
            }

            return result;
        } catch (error) {
            console.error('❌ Error processing voice input:', error);
            return {
                success: false,
                error: `Failed to process voice input: ${error}`
            };
        }
    }

    async saveMemory(content: string, metadata?: Record<string, any>): Promise<MCPToolResult> {
        return await mcpClient.callTool('MemoraiMCPServer', 'mcp_memoraimcpser_remember', {
            agentId: 'metu_voice',
            content,
            metadata: metadata || { entityType: 'voice_memory', source: 'metu' }
        });
    }

    async searchMemory(query: string): Promise<MCPToolResult> {
        return await mcpClient.callTool('MemoraiMCPServer', 'mcp_memoraimcpser_recall', {
            agentId: 'metu_voice',
            query
        });
    }

    async takeScreenshot(name: string = 'metu_screenshot'): Promise<MCPToolResult> {
        return await mcpClient.callTool('PlaywrightMCPServer', 'mcp_playwrightmcp_playwright_screenshot', {
            name,
            savePng: true
        });
    }

    async focusWindow(title: string): Promise<MCPToolResult> {
        return await mcpClient.callTool('GlassMCPServer', 'mcp_glassmcpserve_window_focus', {
            title
        });
    }

    async getRomanianHelp(query: string): Promise<MCPToolResult> {
        return await mcpClient.callTool('RomaiUltimateMCPServer', 'mcp_romai_romai_intelligence', {
            query,
            language: 'ro'
        });
    }

    getStatus(): {
        initialized: boolean;
        connectedServers: string[];
        availableCommands: string[];
    } {
        return {
            initialized: this.isInitialized,
            connectedServers: Array.from(this.connectedServers),
            availableCommands: [
                'remember/recall/forget (Memory)',
                'navigate/click/fill/screenshot (Web)',
                'focus/close/minimize/maximize (Windows)',
                'romanian help/translate (AI)'
            ]
        };
    }

    async shutdown(): Promise<void> {
        console.log('🔄 Shutting down MCP Manager...');
        await mcpClient.disconnectAll();
        this.connectedServers.clear();
        this.isInitialized = false;
        console.log('✅ MCP Manager shut down');
    }
}

export const mcpManager = new MCPManager();
