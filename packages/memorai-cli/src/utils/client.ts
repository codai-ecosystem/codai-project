import { MemorAIClient } from '@memorai/sdk';
import chalk from 'chalk';

let clientInstance: MemorAIClient | null = null;

export async function getClient(): Promise<MemorAIClient> {
    if (!clientInstance) {
        const apiKey = process.env.MEMORAI_API_KEY || 'memorai-dev-key-2025';
        const endpoint = process.env.MEMORAI_ENDPOINT || 'http://localhost:4006/api';
        const mcpUrl = process.env.MEMORAI_MCP_URL || 'http://localhost:4950';

        clientInstance = new MemorAIClient({
            apiKey,
            apiUrl: endpoint,
            mcpUrl,
            timeout: 30000,
            debug: true
        });

        // Try to auto-detect and enable MCP mode
        try {
            const mcpEnabled = await clientInstance.autoDetectMCP();
            if (mcpEnabled) {
                console.log(chalk.green('✓ MCP protocol enabled - using direct server communication'));
            } else {
                console.log(chalk.yellow('→ Using HTTP API mode - MCP server not available'));
            }
        } catch (error) {
            console.log(chalk.yellow('→ Using HTTP API mode - MCP server not available'));
        }
    }

    return clientInstance;
}

export function resetClient(): void {
    clientInstance = null;
}
