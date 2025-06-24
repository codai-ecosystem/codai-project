import type { ServiceName } from './types';

// Utility functions for the Codai ecosystem

export function generateId(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

export function formatTimestamp(date: Date = new Date()): string {
    return date.toISOString();
}

export function createApiResponse<T>(data: T, success: boolean = true): { success: boolean; data: T; timestamp: string } {
    return {
        success,
        data,
        timestamp: formatTimestamp(),
    };
}

export function createErrorResponse(error: string): { success: boolean; error: string; timestamp: string } {
    return {
        success: false,
        error,
        timestamp: formatTimestamp(),
    };
}

export function isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

export function isValidUrl(url: string): boolean {
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
}

export function getServiceUrl(serviceName: ServiceName, path: string = ''): string {
    const baseUrls = {
        aide: 'https://aide.codai.ro',
        memorai: 'https://memorai.ro',
        logai: 'https://logai.ro',
        bancai: 'https://bancai.ro',
        fabricai: 'https://fabricai.ro',
    };

    const baseUrl = baseUrls[serviceName];
    return path ? `${baseUrl}${path.startsWith('/') ? path : `/${path}`}` : baseUrl;
}

export function sanitizeInput(input: string): string {
    return input.trim().replace(/[<>]/g, '');
}

export function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export function retry<T>(
    fn: () => Promise<T>,
    maxAttempts: number = 3,
    delay: number = 1000
): Promise<T> {
    return fn().catch(err => {
        if (maxAttempts > 1) {
            return sleep(delay).then(() => retry(fn, maxAttempts - 1, delay * 2));
        }
        throw err;
    });
}
