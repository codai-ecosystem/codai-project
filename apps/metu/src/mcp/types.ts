export interface MCPServerConfig {
    name: string;
    type: 'stdio';
    command: string;
    args: string[];
    env?: Record<string, string>;
    version?: string;
}

export interface MCPServers {
    PlaywrightMCPServer: MCPServerConfig;
    MemoraiMCPServer: MCPServerConfig;
    GlassMCPServer: MCPServerConfig;
    RomaiUltimateMCPServer: MCPServerConfig;
}

export interface MCPResponse {
    success: boolean;
    data?: any;
    error?: string;
    message?: string;
}

export interface VoiceCommand {
    command: string;
    parameters?: Record<string, any>;
    server: keyof MCPServers;
    naturalLanguage: string;
}

export interface MCPCapability {
    name: string;
    description: string;
    voiceCommands: string[];
    examples: string[];
}

export interface MCPToolResult {
    success: boolean;
    result?: any;
    error?: string;
    metadata?: Record<string, any>;
}
