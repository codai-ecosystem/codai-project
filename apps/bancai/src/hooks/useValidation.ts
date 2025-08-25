/**
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
}