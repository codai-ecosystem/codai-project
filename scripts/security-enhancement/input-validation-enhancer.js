/**
 * @fileoverview Input Validation Enhancer
 * @description Creates comprehensive input validation and sanitization system
 */

import fs from 'fs';
import path from 'path';

export default function createInputValidation(dirs, appName) {
    createValidationSchemas(dirs.utilsDir, appName);
    createSanitizationMiddleware(dirs.middlewareDir, appName);
    createValidationHooks(dirs.srcDir, appName);
    createFormValidation(dirs.utilsDir, appName);
    console.log(`🛡️ Input validation and sanitization system created for ${appName}`);
}

function createValidationSchemas(utilsDir, appName) {
    const validationSchemasContent = `/**
 * @fileoverview Validation Schemas
 * @description Comprehensive validation schemas using Zod for type safety
 */

import { z } from 'zod';

// Common validation patterns
export const ValidationPatterns = {
    email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    phone: /^\\+?[1-9]\\d{1,14}$/,
    url: /^https?:\\/\\/(?:www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b(?:[-a-zA-Z0-9()@:%_\\+.~#?&=]*)$/,
    password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{12,}$/,
    alphanumeric: /^[a-zA-Z0-9]+$/,
    slug: /^[a-z0-9]+(?:-[a-z0-9]+)*$/
};

// Password validation schema
export const passwordSchema = z.string()
    .min(12, 'Password must be at least 12 characters long')
    .regex(ValidationPatterns.password, 'Password must contain uppercase, lowercase, number, and special character');

// Email validation schema
export const emailSchema = z.string()
    .email('Invalid email format')
    .transform(email => email.toLowerCase().trim());

// User registration schema
export const userRegistrationSchema = z.object({
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string(),
    firstName: z.string()
        .min(1, 'First name is required')
        .max(50, 'First name cannot exceed 50 characters')
        .regex(/^[a-zA-Z\\s'-]+$/, 'First name contains invalid characters'),
    lastName: z.string()
        .min(1, 'Last name is required')
        .max(50, 'Last name cannot exceed 50 characters')
        .regex(/^[a-zA-Z\\s'-]+$/, 'Last name contains invalid characters'),
    acceptTerms: z.boolean().refine(val => val === true, 'You must accept the terms and conditions')
}).refine(data => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"]
});

// User login schema
export const userLoginSchema = z.object({
    email: emailSchema,
    password: z.string().min(1, 'Password is required'),
    rememberMe: z.boolean().optional()
});

// Profile update schema
export const profileUpdateSchema = z.object({
    firstName: z.string().min(1).max(50).optional(),
    lastName: z.string().min(1).max(50).optional(),
    email: emailSchema.optional(),
    phone: z.string().regex(ValidationPatterns.phone).optional().or(z.literal('')),
    bio: z.string().max(500).optional(),
    website: z.string().regex(ValidationPatterns.url).optional().or(z.literal('')),
    location: z.string().max(100).optional()
});

// API request validation schemas
export const apiRequestSchema = z.object({
    method: z.enum(['GET', 'POST', 'PUT', 'DELETE', 'PATCH']),
    headers: z.record(z.string()).optional(),
    body: z.any().optional(),
    query: z.record(z.string()).optional()
});

// File upload schema
export const fileUploadSchema = z.object({
    name: z.string().min(1, 'File name is required'),
    size: z.number().max(10 * 1024 * 1024, 'File size cannot exceed 10MB'),
    type: z.string().refine(type => {
        const allowedTypes = [
            'image/jpeg',
            'image/png', 
            'image/gif',
            'image/webp',
            'application/pdf',
            'text/plain',
            'text/csv'
        ];
        return allowedTypes.includes(type);
    }, 'File type not allowed')
});

// Search query schema
export const searchQuerySchema = z.object({
    query: z.string()
        .min(1, 'Search query cannot be empty')
        .max(200, 'Search query too long')
        .transform(q => q.trim()),
    filters: z.array(z.string()).optional(),
    sortBy: z.enum(['relevance', 'date', 'popularity']).optional(),
    page: z.number().int().min(1).optional(),
    limit: z.number().int().min(1).max(100).optional()
});

// Comment schema
export const commentSchema = z.object({
    content: z.string()
        .min(1, 'Comment cannot be empty')
        .max(1000, 'Comment cannot exceed 1000 characters')
        .transform(content => content.trim()),
    parentId: z.string().uuid().optional(),
    mentions: z.array(z.string().uuid()).optional()
});

// Contact form schema
export const contactFormSchema = z.object({
    name: z.string().min(1, 'Name is required').max(100),
    email: emailSchema,
    subject: z.string().min(1, 'Subject is required').max(200),
    message: z.string()
        .min(10, 'Message must be at least 10 characters')
        .max(2000, 'Message cannot exceed 2000 characters'),
    category: z.enum(['general', 'support', 'business', 'feedback']).optional()
});

// Settings schema
export const settingsSchema = z.object({
    notifications: z.object({
        email: z.boolean(),
        push: z.boolean(),
        sms: z.boolean()
    }).optional(),
    privacy: z.object({
        profileVisibility: z.enum(['public', 'private', 'friends']),
        showEmail: z.boolean(),
        showPhone: z.boolean()
    }).optional(),
    preferences: z.object({
        theme: z.enum(['light', 'dark', 'auto']),
        language: z.string().min(2).max(5),
        timezone: z.string()
    }).optional()
});

export class ValidationError extends Error {
    constructor(public errors: z.ZodError['errors']) {
        super('Validation failed');
        this.name = 'ValidationError';
    }
}

export function validateInput<T>(schema: z.ZodSchema<T>, data: unknown): T {
    try {
        return schema.parse(data);
    } catch (error) {
        if (error instanceof z.ZodError) {
            throw new ValidationError(error.errors);
        }
        throw error;
    }
}

export function safeValidateInput<T>(
    schema: z.ZodSchema<T>, 
    data: unknown
): { success: true; data: T } | { success: false; errors: z.ZodError['errors'] } {
    const result = schema.safeParse(data);
    if (result.success) {
        return { success: true, data: result.data };
    }
    return { success: false, errors: result.error.errors };
}`;

    fs.writeFileSync(path.join(utilsDir, 'validation-schemas.ts'), validationSchemasContent);
}

function createSanitizationMiddleware(middlewareDir, appName) {
    const sanitizationContent = `/**
 * @fileoverview Sanitization Middleware
 * @description Input sanitization and XSS protection middleware
 */

import { NextRequest, NextResponse } from 'next/server';
import DOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';

// Create DOM purify instance for server-side sanitization
const window = new JSDOM('').window;
const purify = DOMPurify(window as any);

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
        
        return purify.sanitize(html, {
            ALLOWED_TAGS: config.allowedTags,
            ALLOWED_ATTR: Object.values(config.allowedAttributes || {}).flat(),
            KEEP_CONTENT: !config.stripIgnoreTag
        });
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
            .replace(/\\//g, '&#x2F;');
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
            /('|(\\')|(;)|(\\|)|(\\*)|(\\-\\-)|(\\+)|(\\|)|(\\%)/gi,
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
}`;

    fs.writeFileSync(path.join(middlewareDir, 'sanitization-middleware.ts'), sanitizationContent);
}

function createValidationHooks(srcDir, appName) {
    const hooksDir = path.join(srcDir, 'hooks');
    if (!fs.existsSync(hooksDir)) {
        fs.mkdirSync(hooksDir, { recursive: true });
    }

    const validationHooksContent = `/**
 * @fileoverview Validation Hooks
 * @description React hooks for form validation and input sanitization
 */

import { useState, useCallback, useMemo } from 'react';
import { z } from 'zod';
import { InputSanitizer } from '../middleware/sanitization-middleware';
import { ValidationError, safeValidateInput } from '../utils/validation-schemas';

export interface UseValidationOptions {
    sanitize?: boolean;
    validateOnChange?: boolean;
    validateOnBlur?: boolean;
}

export function useFormValidation<T extends Record<string, any>>(
    schema: z.ZodSchema<T>,
    initialValues: T,
    options: UseValidationOptions = {}
) {
    const [values, setValues] = useState<T>(initialValues);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [touched, setTouched] = useState<Record<string, boolean>>({});
    const [isValidating, setIsValidating] = useState(false);

    const {
        sanitize = true,
        validateOnChange = false,
        validateOnBlur = true
    } = options;

    const validateField = useCallback((name: string, value: any) => {
        try {
            const fieldSchema = schema.shape[name as keyof typeof schema.shape];
            if (fieldSchema) {
                fieldSchema.parse(value);
                setErrors(prev => ({ ...prev, [name]: '' }));
                return true;
            }
        } catch (error) {
            if (error instanceof z.ZodError) {
                setErrors(prev => ({ 
                    ...prev, 
                    [name]: error.errors[0]?.message || 'Validation error' 
                }));
            }
            return false;
        }
        return true;
    }, [schema]);

    const validateAll = useCallback(async (): Promise<boolean> => {
        setIsValidating(true);
        
        const result = safeValidateInput(schema, values);
        
        if (result.success) {
            setErrors({});
            setIsValidating(false);
            return true;
        } else {
            const newErrors: Record<string, string> = {};
            result.errors.forEach(error => {
                const field = error.path[0] as string;
                if (field && !newErrors[field]) {
                    newErrors[field] = error.message;
                }
            });
            setErrors(newErrors);
            setIsValidating(false);
            return false;
        }
    }, [schema, values]);

    const handleChange = useCallback((name: string, value: any) => {
        let processedValue = value;
        
        // Sanitize if enabled
        if (sanitize && typeof value === 'string') {
            processedValue = InputSanitizer.sanitizeText(value);
        }
        
        setValues(prev => ({ ...prev, [name]: processedValue }));
        
        // Validate on change if enabled
        if (validateOnChange && touched[name]) {
            validateField(name, processedValue);
        }
    }, [sanitize, validateOnChange, touched, validateField]);

    const handleBlur = useCallback((name: string) => {
        setTouched(prev => ({ ...prev, [name]: true }));
        
        // Validate on blur if enabled
        if (validateOnBlur) {
            validateField(name, values[name as keyof T]);
        }
    }, [validateOnBlur, values, validateField]);

    const reset = useCallback((newValues?: T) => {
        setValues(newValues || initialValues);
        setErrors({});
        setTouched({});
        setIsValidating(false);
    }, [initialValues]);

    const isValid = useMemo(() => {
        return Object.keys(errors).length === 0 && Object.keys(touched).length > 0;
    }, [errors, touched]);

    return {
        values,
        errors,
        touched,
        isValidating,
        isValid,
        handleChange,
        handleBlur,
        validateAll,
        reset
    };
}

export function useInputSanitization() {
    return {
        sanitizeText: InputSanitizer.sanitizeText,
        sanitizeHTML: InputSanitizer.sanitizeHTML,
        sanitizeURL: InputSanitizer.sanitizeURL,
        sanitizeFileName: InputSanitizer.sanitizeFileName
    };
}

export function useSecureForm<T extends Record<string, any>>(
    schema: z.ZodSchema<T>,
    initialValues: T,
    onSubmit: (values: T) => Promise<void> | void
) {
    const validation = useFormValidation(schema, initialValues, {
        sanitize: true,
        validateOnBlur: true
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);

    const handleSubmit = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitError(null);
        
        const isValid = await validation.validateAll();
        if (!isValid) {
            return;
        }
        
        setIsSubmitting(true);
        
        try {
            await onSubmit(validation.values);
        } catch (error) {
            setSubmitError(error instanceof Error ? error.message : 'Submission failed');
        } finally {
            setIsSubmitting(false);
        }
    }, [validation, onSubmit]);

    return {
        ...validation,
        isSubmitting,
        submitError,
        handleSubmit
    };
}`;

    fs.writeFileSync(path.join(hooksDir, 'useValidation.ts'), validationHooksContent);
}

function createFormValidation(utilsDir, appName) {
    const formValidationContent = `/**
 * @fileoverview Form Validation Components and Utilities
 * @description Reusable form validation components with security focus
 */

import React from 'react';
import { useFormValidation } from '../hooks/useValidation';
import { z } from 'zod';

interface ValidatedInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    name: string;
    label?: string;
    error?: string;
    touched?: boolean;
    onFieldChange?: (name: string, value: string) => void;
    onFieldBlur?: (name: string) => void;
    sanitize?: boolean;
}

export function ValidatedInput({
    name,
    label,
    error,
    touched,
    onFieldChange,
    onFieldBlur,
    sanitize = true,
    className = '',
    ...props
}: ValidatedInputProps) {
    const hasError = touched && error;
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onFieldChange?.(name, e.target.value);
    };
    
    const handleBlur = () => {
        onFieldBlur?.(name);
    };
    
    return (
        <div className="form-field">
            {label && (
                <label htmlFor={name} className="form-label">
                    {label}
                </label>
            )}
            <input
                {...props}
                id={name}
                name={name}
                onChange={handleChange}
                onBlur={handleBlur}
                className={\`form-input \${hasError ? 'form-input-error' : ''} \${className}\`}
                aria-invalid={hasError}
                aria-describedby={hasError ? \`\${name}-error\` : undefined}
            />
            {hasError && (
                <div id={\`\${name}-error\`} className="form-error" role="alert">
                    {error}
                </div>
            )}
        </div>
    );
}

interface ValidatedTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    name: string;
    label?: string;
    error?: string;
    touched?: boolean;
    onFieldChange?: (name: string, value: string) => void;
    onFieldBlur?: (name: string) => void;
    maxLength?: number;
}

export function ValidatedTextarea({
    name,
    label,
    error,
    touched,
    onFieldChange,
    onFieldBlur,
    maxLength,
    className = '',
    ...props
}: ValidatedTextareaProps) {
    const hasError = touched && error;
    const [charCount, setCharCount] = React.useState(0);
    
    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const value = e.target.value;
        setCharCount(value.length);
        onFieldChange?.(name, value);
    };
    
    const handleBlur = () => {
        onFieldBlur?.(name);
    };
    
    return (
        <div className="form-field">
            {label && (
                <label htmlFor={name} className="form-label">
                    {label}
                </label>
            )}
            <textarea
                {...props}
                id={name}
                name={name}
                onChange={handleChange}
                onBlur={handleBlur}
                maxLength={maxLength}
                className={\`form-textarea \${hasError ? 'form-textarea-error' : ''} \${className}\`}
                aria-invalid={hasError}
                aria-describedby={hasError ? \`\${name}-error\` : undefined}
            />
            {maxLength && (
                <div className="form-char-count">
                    {charCount}/{maxLength}
                </div>
            )}
            {hasError && (
                <div id={\`\${name}-error\`} className="form-error" role="alert">
                    {error}
                </div>
            )}
        </div>
    );
}

export function PasswordStrengthIndicator({ password }: { password: string }) {
    const getStrength = (pwd: string) => {
        let score = 0;
        if (pwd.length >= 12) score++;
        if (/[a-z]/.test(pwd)) score++;
        if (/[A-Z]/.test(pwd)) score++;
        if (/[0-9]/.test(pwd)) score++;
        if (/[^a-zA-Z0-9]/.test(pwd)) score++;
        return score;
    };
    
    const strength = getStrength(password);
    const strengthLabels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];
    const strengthColors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-blue-500', 'bg-green-500'];
    
    return (
        <div className="password-strength">
            <div className="flex space-x-1 mb-2">
                {[1, 2, 3, 4, 5].map(level => (
                    <div
                        key={level}
                        className={\`h-2 flex-1 rounded \${
                            level <= strength ? strengthColors[strength - 1] : 'bg-gray-200'
                        }\`}
                    />
                ))}
            </div>
            {password && (
                <span className={\`text-sm \${strengthColors[strength - 1]?.replace('bg-', 'text-')}\`}>
                    {strengthLabels[strength - 1] || 'Very Weak'}
                </span>
            )}
        </div>
    );
}`;

    fs.writeFileSync(path.join(utilsDir, 'form-validation.tsx'), formValidationContent);
}