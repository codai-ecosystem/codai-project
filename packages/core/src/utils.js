// Utility functions for the Codai ecosystem
export function generateId() {
    return (Math.random().toString(36).substring(2, 15) +
        Math.random().toString(36).substring(2, 15));
}
export function formatTimestamp(date = new Date()) {
    return date.toISOString();
}
export function createApiResponse(data, success = true) {
    return {
        success,
        data,
        timestamp: formatTimestamp(),
    };
}
export function createErrorResponse(error) {
    return {
        success: false,
        error,
        timestamp: formatTimestamp(),
    };
}
export function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}
export function isValidUrl(url) {
    try {
        new URL(url);
        return true;
    }
    catch (_a) {
        return false;
    }
}
export function getServiceUrl(serviceName, path = '') {
    const baseUrls = {
        aide: 'https://aide.codai.ro',
        memorai: 'https://memorai.ro',
        logai: 'https://logai.ro',
        bancai: 'https://bancai.ro',
        fabricai: 'https://fabricai.ro',
    };
    const baseUrl = baseUrls[serviceName];
    return path
        ? `${baseUrl}${path.startsWith('/') ? path : `/${path}`}`
        : baseUrl;
}
export function sanitizeInput(input) {
    return input.trim().replace(/[<>]/g, '');
}
export function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
export function retry(fn, maxAttempts = 3, delay = 1000) {
    return fn().catch(err => {
        if (maxAttempts > 1) {
            return sleep(delay).then(() => retry(fn, maxAttempts - 1, delay * 2));
        }
        throw err;
    });
}
