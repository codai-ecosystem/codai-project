/**
 * Configuration Manager
 * Enterprise-grade configuration management with environment validation
 * Date: August 6, 2025
 */

import { MemorAIConfig, DEFAULT_CONFIG, EMBEDDING_MODELS } from './types.js';
import * as path from 'path';
import * as fs from 'fs';

export class ConfigManager {
    private static instance: ConfigManager;
    private config: MemorAIConfig;

    private constructor() {
        this.config = this.loadConfiguration();
        this.validateConfiguration();
    }

    public static getInstance(): ConfigManager {
        if (!ConfigManager.instance) {
            ConfigManager.instance = new ConfigManager();
        }
        return ConfigManager.instance;
    }

    private loadConfiguration(): MemorAIConfig {
        const baseConfig: MemorAIConfig = {
            server: {
                port: parseInt(process.env.MEMORAI_MCP_PORT || process.env.PORT || '4950'),
                host: process.env.MEMORAI_HOST || '0.0.0.0',
                maxRequestSize: process.env.MEMORAI_MAX_REQUEST_SIZE || '10mb',
                cors: DEFAULT_CONFIG.server!.cors!
            },
            database: {
                cbdUrl: process.env.CBD_BASE_URL || 'http://localhost:4180',
                connectionPool: parseInt(process.env.CBD_CONNECTION_POOL || '10'),
                timeout: parseInt(process.env.CBD_TIMEOUT || '30000')
            },
            ai: {
                openaiApiKey: process.env.OPENAI_API_KEY || process.env.AZURE_OPENAI_API_KEY || '',
                embeddingModel: process.env.EMBEDDING_MODEL || 'text-embedding-3-small',
                maxTokens: parseInt(process.env.MAX_TOKENS || '8191'),
                dimensions: this.getEmbeddingDimensions(process.env.EMBEDDING_MODEL || 'text-embedding-3-small'),
                batchSize: parseInt(process.env.EMBEDDING_BATCH_SIZE || '100')
            },
            cache: {
                redisUrl: process.env.REDIS_URL || undefined,
                ttl: parseInt(process.env.CACHE_TTL || '3600'),
                maxMemory: process.env.CACHE_MAX_MEMORY || '256mb',
                enabled: process.env.CACHE_ENABLED?.toLowerCase() !== 'false'
            },
            monitoring: {
                metricsPort: parseInt(process.env.METRICS_PORT || '4951'),
                logLevel: (process.env.LOG_LEVEL as any) || 'info',
                enableAnalytics: process.env.ENABLE_ANALYTICS?.toLowerCase() !== 'false'
            },
            security: {
                apiKey: process.env.MEMORAI_API_KEY || 'memorai-dev-key-2025',
                rateLimiting: process.env.RATE_LIMITING?.toLowerCase() !== 'false',
                maxRequestsPerMinute: parseInt(process.env.MAX_REQUESTS_PER_MINUTE || '1000')
            }
        };

        // Load additional configuration from file if exists
        const configPath = process.env.MEMORAI_CONFIG_PATH || path.join(process.cwd(), 'memorai.config.json');
        if (fs.existsSync(configPath)) {
            try {
                const fileConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
                return this.mergeConfigurations(baseConfig, fileConfig);
            } catch (error) {
                console.warn(`Failed to load configuration file from ${configPath}:`, error);
            }
        }

        return baseConfig;
    }

    private getEmbeddingDimensions(model: string): number {
        const modelConfig = EMBEDDING_MODELS[model as keyof typeof EMBEDDING_MODELS];
        return modelConfig?.dimensions || 1536;
    }

    private mergeConfigurations(base: MemorAIConfig, override: Partial<MemorAIConfig>): MemorAIConfig {
        return {
            server: { ...base.server, ...override.server },
            database: { ...base.database, ...override.database },
            ai: { ...base.ai, ...override.ai },
            cache: { ...base.cache, ...override.cache },
            monitoring: { ...base.monitoring, ...override.monitoring },
            security: { ...base.security, ...override.security }
        };
    }

    private validateConfiguration(): void {
        const errors: string[] = [];

        // Validate server configuration
        if (this.config.server.port < 1 || this.config.server.port > 65535) {
            errors.push('Server port must be between 1 and 65535');
        }

        // Validate database configuration
        if (!this.config.database.cbdUrl || !this.isValidUrl(this.config.database.cbdUrl)) {
            errors.push('Valid CBD database URL is required');
        }

        // Validate AI configuration
        if (!this.config.ai.openaiApiKey) {
            console.warn('Warning: OpenAI API key not provided. Vector search will be disabled.');
        }

        if (!EMBEDDING_MODELS[this.config.ai.embeddingModel as keyof typeof EMBEDDING_MODELS]) {
            errors.push(`Unsupported embedding model: ${this.config.ai.embeddingModel}`);
        }

        // Validate cache configuration
        if (this.config.cache.redisUrl && !this.isValidUrl(this.config.cache.redisUrl)) {
            errors.push('Invalid Redis URL provided');
        }

        // Validate monitoring configuration
        if (this.config.monitoring.metricsPort === this.config.server.port) {
            errors.push('Metrics port must be different from server port');
        }

        if (!['debug', 'info', 'warn', 'error'].includes(this.config.monitoring.logLevel)) {
            errors.push('Invalid log level. Must be: debug, info, warn, or error');
        }

        // Validate security configuration
        if (!this.config.security.apiKey) {
            errors.push('API key is required for security');
        }

        if (errors.length > 0) {
            throw new Error(`Configuration validation failed:\n${errors.join('\n')}`);
        }
    }

    private isValidUrl(url: string): boolean {
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    }

    public getConfig(): MemorAIConfig {
        return { ...this.config };
    }

    public updateConfig(updates: Partial<MemorAIConfig>): void {
        this.config = this.mergeConfigurations(this.config, updates);
        this.validateConfiguration();
    }

    public isDevelopment(): boolean {
        return process.env.NODE_ENV === 'development';
    }

    public isProduction(): boolean {
        return process.env.NODE_ENV === 'production';
    }

    public isVectorSearchEnabled(): boolean {
        return !!this.config.ai.openaiApiKey;
    }

    public isCacheEnabled(): boolean {
        return this.config.cache.enabled && !!this.config.cache.redisUrl;
    }

    public isAnalyticsEnabled(): boolean {
        return this.config.monitoring.enableAnalytics;
    }

    public getPort(): number {
        return this.config.server.port;
    }

    public getCBDUrl(): string {
        return this.config.database.cbdUrl;
    }

    public getOpenAIConfig() {
        return {
            apiKey: this.config.ai.openaiApiKey,
            model: this.config.ai.embeddingModel,
            dimensions: this.config.ai.dimensions,
            maxTokens: this.config.ai.maxTokens,
            batchSize: this.config.ai.batchSize
        };
    }

    public getCacheConfig() {
        return {
            url: this.config.cache.redisUrl,
            ttl: this.config.cache.ttl,
            maxMemory: this.config.cache.maxMemory,
            enabled: this.config.cache.enabled
        };
    }

    public getSecurityConfig() {
        return {
            apiKey: this.config.security.apiKey,
            rateLimiting: this.config.security.rateLimiting,
            maxRequestsPerMinute: this.config.security.maxRequestsPerMinute
        };
    }

    public saveConfiguration(filePath?: string): void {
        const configPath = filePath || path.join(process.cwd(), 'memorai.config.json');
        try {
            fs.writeFileSync(configPath, JSON.stringify(this.config, null, 2), 'utf8');
            console.log(`Configuration saved to ${configPath}`);
        } catch (error) {
            console.error(`Failed to save configuration to ${configPath}:`, error);
            throw error;
        }
    }

    public printConfiguration(): void {
        console.log('\n🔧 MemorAI MCP Configuration:');
        console.log(`   Server: ${this.config.server.host}:${this.config.server.port}`);
        console.log(`   Database: ${this.config.database.cbdUrl}`);
        console.log(`   AI Model: ${this.config.ai.embeddingModel} (${this.config.ai.dimensions}D)`);
        console.log(`   Cache: ${this.config.cache.enabled ? 'Enabled' : 'Disabled'}`);
        console.log(`   Log Level: ${this.config.monitoring.logLevel}`);
        console.log(`   Environment: ${this.isDevelopment() ? 'Development' : 'Production'}`);
        console.log('');
    }
}

// Singleton instance
export const config = ConfigManager.getInstance();
