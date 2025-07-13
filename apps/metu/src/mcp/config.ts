import { MCPServers } from './types';

export const MCP_CONFIG: MCPServers = {
    PlaywrightMCPServer: {
        name: 'PlaywrightMCPServer',
        type: 'stdio',
        command: 'npx',
        args: ['-y', '@executeautomation/playwright-mcp-server']
    },
    MemoraiMCPServer: {
        name: 'MemoraiMCPServer',
        type: 'stdio',
        command: 'npx',
        args: ['-y', '@codai/memorai-mcp@5.4.2'],
        env: {
            NODE_ENV: 'production',
            DOTENV_CONFIG_PATH: 'E:\\GitHub\\workspace-ai\\.env',
            MEMORAI_DATA_PATH: 'e:\\GitHub\\memorai\\data\\memory',
            DEBUG: 'memorai:performance',
            MEMORAI_TIMEOUT_REMEMBER: '15000',
            MEMORAI_TIMEOUT_RECALL: '30000',
            MEMORAI_TIMEOUT_CONTEXT: '20000',
            MEMORAI_TIMEOUT_FORGET: '10000',
            MEMORAI_CACHE_TTL: '300000',
            MEMORAI_MAX_CACHE_SIZE: '10000',
            MEMORAI_FORCE_ADVANCED: 'true',
            MEMORAI_ULTRA_FAST_MODE: 'true',
            MEMORAI_MAX_PERFORMANCE: 'true'
        },
        version: '5.4.0-maximum-performance'
    },
    GlassMCPServer: {
        name: 'GlassMCPServer',
        type: 'stdio',
        command: 'npx',
        args: ['-y', '@codai/glass-mcp@latest'],
        version: '0.0.1'
    },
    RomaiUltimateMCPServer: {
        name: 'RomaiUltimateMCPServer',
        type: 'stdio',
        command: 'npx',
        args: ['-y', '--package=@codai/romai-mcp@0.3.0', 'romai-mcp-ultimate'],
        env: {
            NODE_ENV: 'production',
            DOTENV_CONFIG_PATH: 'E:\\GitHub\\workspace-ai\\.env',
            ROMAI_SERVER_MODE: 'ultimate'
        },
        version: '0.3.0-ultimate'
    }
};

export const VOICE_COMMAND_PATTERNS = {
    // Memory commands
    remember: ['remember this', 'save this', 'store this', 'memorize this'],
    recall: ['what do you remember about', 'recall', 'find in memory', 'search memory'],
    forget: ['forget this', 'delete from memory', 'remove this memory'],

    // Web automation commands  
    navigate: ['go to', 'open website', 'visit', 'navigate to'],
    click: ['click on', 'press', 'tap'],
    fill: ['type', 'enter', 'fill in', 'write'],
    screenshot: ['take screenshot', 'capture screen', 'screenshot'],

    // Window management commands
    focus: ['focus window', 'switch to', 'bring to front'],
    close: ['close window', 'close app', 'shut down'],
    minimize: ['minimize', 'hide window'],
    maximize: ['maximize', 'make fullscreen', 'expand window'],

    // Romanian AI commands
    romanianHelp: ['ajută-mă', 'spune-mi în română', 'explică în română', 'romanian help'],
    translate: ['translate to romanian', 'în română', 'traduce'],
    cultureInfo: ['romanian culture', 'despre românia', 'romanian info']
};
