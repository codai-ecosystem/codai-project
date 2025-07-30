export interface ServerConfig {
    port: number;
    websocketPort: number;
    clusterWorkers: number;
    nodeEnv: string;
    corsOrigins: string[];
    maxConnections: number;
    requestTimeout: number;
}

export interface DatabaseConfig {
    url: string;
    type: 'sqlite' | 'postgresql' | 'mysql';
    redisUrl?: string;
}

export interface SecurityConfig {
    jwtSecret: string;
    encryptionKey: string;
    sessionTimeout: number;
}

export interface RomAIConfig {
    enabled: boolean;
    quantumMode: boolean;
    romanianIntelligence: boolean;
    apiKey?: string;
}

export interface MCPConfig {
    memoraiUrl: string;
    controlaEnabled: boolean;
    playwrightEnabled: boolean;
    glassEnabled: boolean;
    context7Enabled: boolean;
    microsoftDocsEnabled: boolean;
    romaiIntelligenceEnabled: boolean;
}

export interface TranslationConfig {
    defaultLanguage: 'en' | 'ro';
    supportedLanguages: string[];
    autoDetect: boolean;
}

export interface VoiceConfig {
    provider: 'romai' | 'azure' | 'mock';
    azureSpeechKey?: string;
    azureSpeechRegion?: string;
}

export interface AppConfig {
    server: ServerConfig;
    database: DatabaseConfig;
    security: SecurityConfig;
    romai: RomAIConfig;
    mcp: MCPConfig;
    translation: TranslationConfig;
    voice: VoiceConfig;
    logging: {
        level: string;
        file: string;
        maxSize: string;
        maxFiles: number;
    };
    mobile: {
        androidApiEnabled: boolean;
        pushNotificationsEnabled: boolean;
        crossPlatformSync: boolean;
    };
    performance: {
        cacheTtl: number;
        maxConnections: number;
        requestTimeout: number;
    };
}

export const getConfig = (): AppConfig => {
    return {
        server: {
            port: parseInt(process.env.SERVER_PORT || '4401', 10),
            websocketPort: parseInt(process.env.WEBSOCKET_PORT || '4402', 10),
            clusterWorkers: parseInt(process.env.CLUSTER_WORKERS || '4', 10),
            nodeEnv: process.env.NODE_ENV || 'development',
            corsOrigins: (process.env.CORS_ORIGINS || 'http://localhost:4400').split(','),
            maxConnections: parseInt(process.env.MAX_CONNECTIONS || '1000', 10),
            requestTimeout: parseInt(process.env.REQUEST_TIMEOUT || '30000', 10),
        },
        database: {
            url: process.env.DATABASE_URL || './data/metu.db',
            type: (process.env.DATABASE_TYPE as 'sqlite') || 'sqlite',
            redisUrl: process.env.REDIS_URL,
        },
        security: {
            jwtSecret: process.env.JWT_SECRET || 'default-jwt-secret-change-in-production',
            encryptionKey: process.env.ENCRYPTION_KEY || 'default-encryption-key-32-chars-long',
            sessionTimeout: parseInt(process.env.SESSION_TIMEOUT || '3600', 10),
        },
        romai: {
            enabled: process.env.ROMAI_AGI_ENABLED === 'true',
            quantumMode: process.env.ROMAI_QUANTUM_MODE === 'true',
            romanianIntelligence: process.env.ROMAI_ROMANIAN_INTELLIGENCE === 'true',
            apiKey: process.env.ROMAI_API_KEY,
        },
        mcp: {
            memoraiUrl: process.env.MEMORAI_MCP_URL || 'localhost:8002',
            controlaEnabled: process.env.CONTROLAI_MCP_ENABLED === 'true',
            playwrightEnabled: process.env.PLAYWRIGHT_MCP_ENABLED === 'true',
            glassEnabled: process.env.GLASS_MCP_ENABLED === 'true',
            context7Enabled: process.env.CONTEXT7_MCP_ENABLED === 'true',
            microsoftDocsEnabled: process.env.MICROSOFT_DOCS_MCP_ENABLED === 'true',
            romaiIntelligenceEnabled: process.env.ROMAI_INTELLIGENCE_MCP_ENABLED === 'true',
        },
        translation: {
            defaultLanguage: (process.env.DEFAULT_LANGUAGE as 'en' | 'ro') || 'en',
            supportedLanguages: (process.env.SUPPORTED_LANGUAGES || 'en,ro').split(','),
            autoDetect: process.env.AUTO_DETECT_LANGUAGE === 'true',
        },
        voice: {
            provider: (process.env.VOICE_PROVIDER as 'romai' | 'azure' | 'mock') || 'mock',
            azureSpeechKey: process.env.AZURE_SPEECH_KEY,
            azureSpeechRegion: process.env.AZURE_SPEECH_REGION,
        },
        logging: {
            level: process.env.LOG_LEVEL || 'info',
            file: process.env.LOG_FILE || './logs/metu.log',
            maxSize: process.env.LOG_MAX_SIZE || '10m',
            maxFiles: parseInt(process.env.LOG_MAX_FILES || '5', 10),
        },
        mobile: {
            androidApiEnabled: process.env.ANDROID_API_ENABLED === 'true',
            pushNotificationsEnabled: process.env.PUSH_NOTIFICATIONS_ENABLED === 'true',
            crossPlatformSync: process.env.CROSS_PLATFORM_SYNC === 'true',
        },
        performance: {
            cacheTtl: parseInt(process.env.CACHE_TTL || '3600', 10),
            maxConnections: parseInt(process.env.MAX_CONNECTIONS || '1000', 10),
            requestTimeout: parseInt(process.env.REQUEST_TIMEOUT || '30000', 10),
        },
    };
};
