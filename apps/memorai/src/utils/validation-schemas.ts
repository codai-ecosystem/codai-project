/**
 * @fileoverview Validation Schemas
 * @description Comprehensive validation schemas using Zod for type safety
 */

import { z } from 'zod';

// Common validation patterns
export const ValidationPatterns = {
    email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+.[a-zA-Z]{2,}$/,
    phone: /^\+?[1-9]\d{1,14}$/,
    url: /^https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&=]*)$/,
    password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{12,}$/,
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
        .regex(/^[a-zA-Z\s'-]+$/, 'First name contains invalid characters'),
    lastName: z.string()
        .min(1, 'Last name is required')
        .max(50, 'Last name cannot exceed 50 characters')
        .regex(/^[a-zA-Z\s'-]+$/, 'Last name contains invalid characters'),
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
}