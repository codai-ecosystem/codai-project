/**
 * SDK Configuration
 */

export interface CodeaiConfig {
    baseUrl: string;
    timeout: number;
    retries: number;
    retryDelay: number;
    apiKey?: string;
    authToken?: string;
    userAgent: string;
    validateStatus: (status: number) => boolean;
    headers: Record<string, string>;
}

export const DEFAULT_CONFIG: CodeaiConfig = {
    baseUrl: 'http://localhost:4003',
    timeout: 30000,
    retries: 3,
    retryDelay: 1000,
    userAgent: 'CODAI-SDK-JS/1.0.0',
    validateStatus: (status: number) => status >= 200 && status < 300,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
};

export function createConfig(overrides: Partial<CodeaiConfig> = {}): CodeaiConfig {
    return {
        ...DEFAULT_CONFIG,
        ...overrides,
        headers: {
            ...DEFAULT_CONFIG.headers,
            ...overrides.headers
        }
    };
}
