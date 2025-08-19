/**
 * Environment Configuration for MemorAI API Service
 * Centralized configuration management with validation
 */

import { config as dotenvConfig } from 'dotenv';
import { resolve } from 'path';

// Load environment variables
dotenvConfig({ path: resolve(process.cwd(), '.env') });

export interface Config {
    // Server configuration
    port: number;
    nodeEnv: string;
    logLevel: string;

    // Authentication
    jwtSecret: string;
    jwtExpiresIn: string;
    codaiAuthUrl: string;
    codaiIdUrl: string;
    codaiClientId: string;
    codaiClientSecret?: string;

    // CBD Database
    cbdDatabaseUrl: string;
    cbdApiKey?: string;

    // Rate limiting
    rateLimitMax: number;
    rateLimitWindowMs: number;

    // CORS origins
    corsOrigins: string[];

    // API versioning
    apiVersion: string;
}

function getEnvVar(name: string, defaultValue?: string): string {
    const value = process.env[name] || defaultValue;
    if (!value) {
        throw new Error(`Environment variable ${name} is required`);
    }
    return value;
}

function getEnvNumber(name: string, defaultValue: number): number {
    const value = process.env[name];
    if (!value) return defaultValue;
    const parsed = parseInt(value, 10);
    if (isNaN(parsed)) {
        throw new Error(`Environment variable ${name} must be a valid number`);
    }
    return parsed;
}

function getEnvArray(name: string, defaultValue: string[] = []): string[] {
    const value = process.env[name];
    if (!value) return defaultValue;
    return value.split(',').map(item => item.trim());
}

export const config: Config = {
    // Server configuration
    port: getEnvNumber('PORT', 3001),
    nodeEnv: getEnvVar('NODE_ENV', 'development'),
    logLevel: getEnvVar('LOG_LEVEL', 'info'),

    // Authentication
    jwtSecret: getEnvVar('JWT_SECRET', 'memorai-dev-secret-key'),
    jwtExpiresIn: getEnvVar('JWT_EXPIRES_IN', '24h'),
    codaiAuthUrl: getEnvVar('CODAI_AUTH_URL', 'https://auth.codai.ro'),
    codaiIdUrl: getEnvVar('CODAI_ID_URL', 'https://id.codai.ro'),
    codaiClientId: getEnvVar('CODAI_CLIENT_ID', 'memorai-api-client'),
    codaiClientSecret: process.env.CODAI_CLIENT_SECRET,

    // CBD Database
    cbdDatabaseUrl: getEnvVar('CBD_DATABASE_URL', 'https://cbd.memorai.ro'),
    cbdApiKey: process.env.CBD_API_KEY,

    // Rate limiting
    rateLimitMax: getEnvNumber('RATE_LIMIT_MAX_REQUESTS', 1000),
    rateLimitWindowMs: getEnvNumber('RATE_LIMIT_WINDOW_MS', 15 * 60 * 1000), // 15 minutes

    // CORS origins
    corsOrigins: getEnvArray('CORS_ORIGINS', [
        'http://localhost:4006',
        'https://memorai.ro',
        'https://app.memorai.ro',
        'https://admin.memorai.ro'
    ]),

    // API versioning
    apiVersion: getEnvVar('API_VERSION', 'v1'),
};

// Validate critical configuration
export function validateConfig(): void {
    const errors: string[] = [];

    if (!config.jwtSecret || config.jwtSecret === 'memorai-dev-secret-key') {
        if (config.nodeEnv === 'production') {
            errors.push('JWT_SECRET must be set to a secure value in production');
        }
    }

    if (!config.cbdDatabaseUrl) {
        errors.push('CBD_DATABASE_URL is required');
    }

    if (config.port < 1 || config.port > 65535) {
        errors.push('PORT must be between 1 and 65535');
    }

    if (errors.length > 0) {
        throw new Error(`Configuration validation failed:\n${errors.join('\n')}`);
    }
}

// Validate configuration on import
validateConfig();
