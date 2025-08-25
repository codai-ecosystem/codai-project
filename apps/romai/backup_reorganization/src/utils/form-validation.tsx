/**
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
                className={`form-input ${hasError ? 'form-input-error' : ''} ${className}`}
                aria-invalid={hasError}
                aria-describedby={hasError ? `${name}-error` : undefined}
            />
            {hasError && (
                <div id={`${name}-error`} className="form-error" role="alert">
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
                className={`form-textarea ${hasError ? 'form-textarea-error' : ''} ${className}`}
                aria-invalid={hasError}
                aria-describedby={hasError ? `${name}-error` : undefined}
            />
            {maxLength && (
                <div className="form-char-count">
                    {charCount}/{maxLength}
                </div>
            )}
            {hasError && (
                <div id={`${name}-error`} className="form-error" role="alert">
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
                        className={`h-2 flex-1 rounded ${
                            level <= strength ? strengthColors[strength - 1] : 'bg-gray-200'
                        }`}
                    />
                ))}
            </div>
            {password && (
                <span className={`text-sm ${strengthColors[strength - 1]?.replace('bg-', 'text-')}`}>
                    {strengthLabels[strength - 1] || 'Very Weak'}
                </span>
            )}
        </div>
    );
}