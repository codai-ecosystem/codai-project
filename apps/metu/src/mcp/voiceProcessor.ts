import { VoiceCommand, MCPToolResult } from './types';
import { VOICE_COMMAND_PATTERNS } from './config';
import { mcpClient } from './client';

export class VoiceCommandProcessor {
    private commandHistory: VoiceCommand[] = [];

    parseVoiceCommand(text: string): VoiceCommand | null {
        const lowerText = text.toLowerCase().trim();

        // Memory commands
        if (this.matchesPattern(lowerText, VOICE_COMMAND_PATTERNS.remember)) {
            return {
                command: 'remember',
                server: 'MemoraiMCPServer',
                naturalLanguage: text,
                parameters: { content: text, agentId: 'metu_voice' }
            };
        }

        if (this.matchesPattern(lowerText, VOICE_COMMAND_PATTERNS.recall)) {
            const query = this.extractQueryFromCommand(lowerText, VOICE_COMMAND_PATTERNS.recall);
            return {
                command: 'recall',
                server: 'MemoraiMCPServer',
                naturalLanguage: text,
                parameters: { query, agentId: 'metu_voice' }
            };
        }

        if (this.matchesPattern(lowerText, VOICE_COMMAND_PATTERNS.forget)) {
            return {
                command: 'forget',
                server: 'MemoraiMCPServer',
                naturalLanguage: text,
                parameters: { agentId: 'metu_voice' }
            };
        }

        // Web automation commands
        if (this.matchesPattern(lowerText, VOICE_COMMAND_PATTERNS.navigate)) {
            const url = this.extractUrlFromCommand(lowerText);
            return {
                command: 'navigate',
                server: 'PlaywrightMCPServer',
                naturalLanguage: text,
                parameters: { url }
            };
        }

        if (this.matchesPattern(lowerText, VOICE_COMMAND_PATTERNS.click)) {
            const selector = this.extractSelectorFromCommand(lowerText, VOICE_COMMAND_PATTERNS.click);
            return {
                command: 'click',
                server: 'PlaywrightMCPServer',
                naturalLanguage: text,
                parameters: { selector }
            };
        }

        if (this.matchesPattern(lowerText, VOICE_COMMAND_PATTERNS.fill)) {
            const { selector, value } = this.extractFillParameters(lowerText);
            return {
                command: 'fill',
                server: 'PlaywrightMCPServer',
                naturalLanguage: text,
                parameters: { selector, value }
            };
        }

        if (this.matchesPattern(lowerText, VOICE_COMMAND_PATTERNS.screenshot)) {
            return {
                command: 'screenshot',
                server: 'PlaywrightMCPServer',
                naturalLanguage: text,
                parameters: { name: 'metu_screenshot' }
            };
        }

        // Window management commands
        if (this.matchesPattern(lowerText, VOICE_COMMAND_PATTERNS.focus)) {
            const title = this.extractWindowTitle(lowerText, VOICE_COMMAND_PATTERNS.focus);
            return {
                command: 'focus',
                server: 'GlassMCPServer',
                naturalLanguage: text,
                parameters: { title }
            };
        }

        if (this.matchesPattern(lowerText, VOICE_COMMAND_PATTERNS.close)) {
            const title = this.extractWindowTitle(lowerText, VOICE_COMMAND_PATTERNS.close);
            return {
                command: 'close',
                server: 'GlassMCPServer',
                naturalLanguage: text,
                parameters: { title }
            };
        }

        // Romanian AI commands
        if (this.matchesPattern(lowerText, VOICE_COMMAND_PATTERNS.romanianHelp)) {
            return {
                command: 'romanian_intelligence',
                server: 'RomaiUltimateMCPServer',
                naturalLanguage: text,
                parameters: { query: text, language: 'ro' }
            };
        }

        return null;
    }

    async executeVoiceCommand(voiceCommand: VoiceCommand): Promise<MCPToolResult> {
        try {
            console.log(`🎤 Executing voice command: ${voiceCommand.naturalLanguage}`);

            // Add to history
            this.commandHistory.push(voiceCommand);

            // Map voice commands to MCP tool names
            const toolMap: Record<string, string> = {
                remember: 'mcp_memoraimcpser_remember',
                recall: 'mcp_memoraimcpser_recall',
                forget: 'mcp_memoraimcpser_forget',
                navigate: 'mcp_playwrightmcp_playwright_navigate',
                click: 'mcp_playwrightmcp_playwright_click',
                fill: 'mcp_playwrightmcp_playwright_fill',
                screenshot: 'mcp_playwrightmcp_playwright_screenshot',
                focus: 'mcp_glassmcpserve_window_focus',
                close: 'mcp_glassmcpserve_window_close',
                romanian_intelligence: 'mcp_romai_romai_intelligence'
            };

            const toolName = toolMap[voiceCommand.command];
            if (!toolName) {
                return {
                    success: false,
                    error: `Unknown command: ${voiceCommand.command}`
                };
            }

            const result = await mcpClient.callTool(
                voiceCommand.server,
                toolName,
                voiceCommand.parameters
            );

            console.log(`✅ Command executed successfully:`, result);
            return result;

        } catch (error) {
            console.error(`❌ Failed to execute voice command:`, error);
            return {
                success: false,
                error: `Failed to execute command: ${error}`
            };
        }
    }

    private matchesPattern(text: string, patterns: string[]): boolean {
        return patterns.some(pattern => text.includes(pattern));
    }

    private extractQueryFromCommand(text: string, patterns: string[]): string {
        for (const pattern of patterns) {
            const index = text.indexOf(pattern);
            if (index !== -1) {
                return text.substring(index + pattern.length).trim();
            }
        }
        return text;
    }

    private extractUrlFromCommand(text: string): string {
        // Extract URL from text - look for common patterns
        const urlPattern = /(https?:\/\/[^\s]+|www\.[^\s]+|[^\s]+\.(com|org|net|ro|co\.uk))/i;
        const match = text.match(urlPattern);
        if (match) {
            let url = match[0];
            if (!url.startsWith('http')) {
                url = 'https://' + url;
            }
            return url;
        }

        // If no URL pattern found, use the text after navigation words
        const navWords = ['go to', 'open', 'visit', 'navigate to'];
        for (const word of navWords) {
            const index = text.toLowerCase().indexOf(word);
            if (index !== -1) {
                const extracted = text.substring(index + word.length).trim();
                return extracted.startsWith('http') ? extracted : `https://${extracted}`;
            }
        }

        return text;
    }

    private extractSelectorFromCommand(text: string, patterns: string[]): string {
        // Extract CSS selector or element description
        for (const pattern of patterns) {
            const index = text.toLowerCase().indexOf(pattern);
            if (index !== -1) {
                const selector = text.substring(index + pattern.length).trim();
                // Convert common descriptions to selectors
                if (selector.includes('button')) return 'button';
                if (selector.includes('link')) return 'a';
                if (selector.includes('input')) return 'input';
                return `[aria-label*="${selector}"], [title*="${selector}"], *:contains("${selector}")`;
            }
        }
        return text;
    }

    private extractFillParameters(text: string): { selector: string; value: string } {
        // Extract field selector and value to fill
        const fillWords = ['type', 'enter', 'fill in', 'write'];
        for (const word of fillWords) {
            const index = text.toLowerCase().indexOf(word);
            if (index !== -1) {
                const remaining = text.substring(index + word.length).trim();
                const parts = remaining.split(' in ');
                if (parts.length >= 2 && parts[0] && parts[1]) {
                    return {
                        value: parts[0].trim(),
                        selector: `[name*="${parts[1]}"], [placeholder*="${parts[1]}"], label:contains("${parts[1]}") + input`
                    };
                }
            }
        }
        return { selector: 'input', value: text };
    }

    private extractWindowTitle(text: string, patterns: string[]): string {
        for (const pattern of patterns) {
            const index = text.toLowerCase().indexOf(pattern);
            if (index !== -1) {
                return text.substring(index + pattern.length).trim();
            }
        }
        return text;
    }

    getCommandHistory(): VoiceCommand[] {
        return [...this.commandHistory];
    }

    clearHistory(): void {
        this.commandHistory = [];
    }
}

export const voiceCommandProcessor = new VoiceCommandProcessor();
