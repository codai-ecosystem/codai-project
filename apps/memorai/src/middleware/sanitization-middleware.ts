/**
 * @fileoverview Sanitization Middleware
 * @description Input sanitization and XSS protection middleware
 */

import { NextRequest, NextResponse } from 'next/server';
// import DOMPurify from 'dompurify';
// import { JSDOM } from 'jsdom';

// Create DOM purify instance for server-side sanitization
// const window = new JSDOM('').window;
// const purify = DOMPurify(window as any);

export interface SanitizationOptions {
    allowedTags?: string[];
    allowedAttributes?: Record<string, string[]>;
    stripIgnoreTag?: boolean;
    stripIgnoreTagBody?: string[];
}

export class InputSanitizer {
    private static defaultOptions: SanitizationOptions = {
        allowedTags: ['b', 'i', 'em', 'strong', 'p', 'br', 'ul', 'ol', 'li', 'a'],
        allowedAttributes: {
            'a': ['href', 'title'],
            '*': ['class']
        },
        stripIgnoreTag: true,
        stripIgnoreTagBody: ['script', 'style']
    };

    /**
     * Sanitize HTML content
     */
    static sanitizeHTML(html: string, options?: SanitizationOptions): string {
        const config = { ...this.defaultOptions, ...options };
        
        // Basic HTML sanitization without DOMPurify (fallback)
        return html
            .replace(/<script[^>]*>.*?<\/script>/gi, '') // Remove script tags
            .replace(/<iframe[^>]*>.*?<\/iframe>/gi, '') // Remove iframe tags
            .replace(/<object[^>]*>.*?<\/object>/gi, '') // Remove object tags
            .replace(/<embed[^>]*>/gi, '') // Remove embed tags
            .replace(/javascript:/gi, '') // Remove javascript: protocol
            .replace(/on\w+\s*=/gi, ''); // Remove event handlers
    }

    /**
     * Sanitize plain text (escape HTML entities)
     */
    static sanitizeText(text: string): string {
        return text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#x27;')
            .replace(/\//g, '&#x2F;');
    }

    /**
     * Sanitize URL to prevent javascript: and data: schemes
     */
    static sanitizeURL(url: string): string {
        const allowedProtocols = ['http:', 'https:', 'mailto:', 'tel:'];
        
        try {
            const parsed = new URL(url);
            if (allowedProtocols.includes(parsed.protocol)) {
                return url;
            }
        } catch {
            // Invalid URL
        }
        
        return '#';
    }

    /**
     * Remove SQL injection patterns
     */
    static sanitizeSQL(input: string): string {
        const sqlPatterns = [
            /('|;|\||\*|--|\+|%)/gi,
            /(select|insert|update|delete|drop|create|alter|exec|execute|union|script)/gi
        ];
        
        let sanitized = input;
        sqlPatterns.forEach(pattern => {
            sanitized = sanitized.replace(pattern, '');
        });
        
        return sanitized.trim();
    }

    /**
     * Sanitize file name
     */
    static sanitizeFileName(fileName: string): string {
        return fileName
            .replace(/[^a-zA-Z0-9._-]/g, '_')
            .replace(/_{2,}/g, '_')
            .replace(/^_+|_+$/g, '')
            .substring(0, 255);
    }

    /**
     * Deep sanitize object recursively
     */
    static sanitizeObject(obj: any, options?: SanitizationOptions): any {
        if (typeof obj === 'string') {
            // Check if it looks like HTML
            if (/<[^>]*>/g.test(obj)) {
                return this.sanitizeHTML(obj, options);
            }
            return this.sanitizeText(obj);
        }
        
        if (Array.isArray(obj)) {
            return obj.map(item => this.sanitizeObject(item, options));
        }
        
        if (obj !== null && typeof obj === 'object') {
            const sanitized: any = {};
            for (const [key, value] of Object.entries(obj)) {
                sanitized[key] = this.sanitizeObject(value, options);
            }
            return sanitized;
        }
        
        return obj;
    }
}

/**
 * Express/Next.js middleware for automatic input sanitization
 */
export function sanitizationMiddleware(options?: SanitizationOptions) {
    return (request: NextRequest) => {
        // Sanitize query parameters
        const url = new URL(request.url);
        for (const [key, value] of url.searchParams.entries()) {
            url.searchParams.set(key, InputSanitizer.sanitizeText(value));
        }

        // For POST/PUT requests, we would sanitize the body
        // This would typically be done in the API route handlers
        
        return NextResponse.next();
    };
}

/**
 * API route wrapper for input sanitization
 */
export function withInputSanitization<T = any>(
    handler: (sanitizedData: T) => Promise<any>,
    options?: SanitizationOptions
) {
    return async (data: T) => {
        const sanitizedData = InputSanitizer.sanitizeObject(data, options);
        return handler(sanitizedData);
    };
}

/**
 * Validation and sanitization combo middleware
 */
export function validateAndSanitize<T>(
    data: unknown,
    validator: (data: unknown) => T,
    options?: SanitizationOptions
): T {
    // First sanitize
    const sanitized = InputSanitizer.sanitizeObject(data, options);
    
    // Then validate
    return validator(sanitized);
}