'use client';

import React, { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { cn } from '@/utils';
import { ComponentSize, ComponentVariant } from '@/components/types';

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
    /**
     * Input variant
     */
    variant?: ComponentVariant;
    
    /**
     * Input size
     */
    size?: ComponentSize;
    
    /**
     * Whether input is in error state
     */
    error?: boolean;
    
    /**
     * Whether input is in success state
     */
    success?: boolean;
    
    /**
     * Help text or error message
     */
    helperText?: string;
    
    /**
     * Input label
     */
    label?: string;
    
    /**
     * Left icon or element
     */
    leftIcon?: ReactNode;
    
    /**
     * Right icon or element
     */
    rightIcon?: ReactNode;
    
    /**
     * Whether to show character count
     */
    showCharCount?: boolean;
    
    /**
     * Maximum character count
     */
    maxLength?: number;
    
    /**
     * Test ID for testing
     */
    testId?: string;
}

/**
 * Input Component
 * Form input with consistent styling and states
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(({
    className,
    variant = 'primary',
    size = 'md',
    error = false,
    success = false,
    helperText,
    label,
    leftIcon,
    rightIcon,
    showCharCount = false,
    maxLength,
    disabled = false,
    required = false,
    testId,
    value,
    id,
    ...props
}, ref) => {
    const { resolvedTheme } = useTheme();
    const [currentValue, setCurrentValue] = React.useState(value || '');
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

    // Handle controlled/uncontrolled value
    React.useEffect(() => {
        if (value !== undefined) {
            setCurrentValue(value);
        }
    }, [value]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        if (value === undefined) {
            setCurrentValue(newValue);
        }
        props.onChange?.(e);
    };

    // Determine current character count
    const charCount = typeof currentValue === 'string' ? currentValue.length : 0;
    const isOverLimit = maxLength && charCount > maxLength;

    const inputClasses = cn(
        // Base styles
        'w-full border transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1',
        'placeholder:text-gray-400 dark:placeholder:text-gray-500',
        
        // Size variants
        size === 'xs' && 'px-2 py-1 text-xs rounded',
        size === 'sm' && 'px-3 py-1.5 text-sm rounded-md',
        size === 'md' && 'px-3 py-2 text-base rounded-md',
        size === 'lg' && 'px-4 py-2.5 text-lg rounded-lg',
        size === 'xl' && 'px-5 py-3 text-xl rounded-lg',
        
        // Icon padding adjustments
        leftIcon && size === 'xs' ? 'pl-7' : '',
        leftIcon && size === 'sm' ? 'pl-8' : '',
        leftIcon && size === 'md' ? 'pl-10' : '',
        leftIcon && size === 'lg' ? 'pl-12' : '',
        leftIcon && size === 'xl' ? 'pl-14' : '',
        
        rightIcon && size === 'xs' ? 'pr-7' : '',
        rightIcon && size === 'sm' ? 'pr-8' : '',
        rightIcon && size === 'md' ? 'pr-10' : '',
        rightIcon && size === 'lg' ? 'pr-12' : '',
        rightIcon && size === 'xl' ? 'pr-14' : '',
        
        // Variant styles (normal state)
        !error && !success && variant === 'primary' && 'border-gray-300 bg-white',
        !error && !success && variant === 'primary' && resolvedTheme === 'dark' && 'border-gray-600 bg-gray-800',
        !error && !success && variant === 'primary' && 'focus:border-blue-500 focus:ring-blue-500',
        
        !error && !success && variant === 'secondary' && 'border-gray-200 bg-gray-50',
        !error && !success && variant === 'secondary' && resolvedTheme === 'dark' && 'border-gray-700 bg-gray-900',
        !error && !success && variant === 'secondary' && 'focus:border-blue-400 focus:ring-blue-400',
        
        !error && !success && variant === 'tertiary' && 'border-transparent bg-gray-100',
        !error && !success && variant === 'tertiary' && resolvedTheme === 'dark' && 'bg-gray-800',
        !error && !success && variant === 'tertiary' && 'focus:border-blue-500 focus:ring-blue-500',
        
        !error && !success && variant === 'ghost' && 'border-transparent bg-transparent',
        !error && !success && variant === 'ghost' && 'focus:border-blue-500 focus:ring-blue-500',
        
        // Error state
        error && 'border-red-500 bg-red-50',
        error && resolvedTheme === 'dark' && 'border-red-400 bg-red-900/20',
        error && 'focus:border-red-500 focus:ring-red-500',
        
        // Success state
        success && 'border-green-500 bg-green-50',
        success && resolvedTheme === 'dark' && 'border-green-400 bg-green-900/20',
        success && 'focus:border-green-500 focus:ring-green-500',
        
        // Disabled state
        disabled && 'opacity-50 cursor-not-allowed bg-gray-100',
        disabled && resolvedTheme === 'dark' && 'bg-gray-700',
        
        // Text colors
        'text-gray-900',
        resolvedTheme === 'dark' && 'text-gray-100',
        
        className
    );

    const iconClasses = cn(
        'absolute inset-y-0 flex items-center pointer-events-none',
        size === 'xs' && 'text-xs',
        size === 'sm' && 'text-sm',
        size === 'md' && 'text-base',
        size === 'lg' && 'text-lg',
        size === 'xl' && 'text-xl',
        'text-gray-400 dark:text-gray-500'
    );

    const leftIconClasses = cn(
        iconClasses,
        'left-0',
        size === 'xs' && 'pl-2',
        size === 'sm' && 'pl-2.5',
        size === 'md' && 'pl-3',
        size === 'lg' && 'pl-4',
        size === 'xl' && 'pl-5'
    );

    const rightIconClasses = cn(
        iconClasses,
        'right-0',
        size === 'xs' && 'pr-2',
        size === 'sm' && 'pr-2.5',
        size === 'md' && 'pr-3',
        size === 'lg' && 'pr-4',
        size === 'xl' && 'pr-5'
    );

    return (
        <div className="w-full">
            {/* Label */}
            {label && (
                <label
                    htmlFor={inputId}
                    className={cn(
                        'block text-sm font-medium mb-2',
                        error && 'text-red-600 dark:text-red-400',
                        success && 'text-green-600 dark:text-green-400',
                        !error && !success && 'text-gray-700 dark:text-gray-300',
                        disabled && 'opacity-50'
                    )}
                >
                    {label}
                    {required && (
                        <span className="text-red-500 ml-1" aria-label="required">
                            *
                        </span>
                    )}
                </label>
            )}

            {/* Input container */}
            <div className="relative">
                {/* Left icon */}
                {leftIcon && (
                    <div className={leftIconClasses}>
                        {leftIcon}
                    </div>
                )}

                {/* Input */}
                <input
                    ref={ref}
                    id={inputId}
                    className={inputClasses}
                    disabled={disabled}
                    required={required}
                    maxLength={maxLength}
                    aria-invalid={error}
                    aria-describedby={
                        helperText ? `${inputId}-helper` : 
                        showCharCount ? `${inputId}-count` : 
                        undefined
                    }
                    data-testid={testId}
                    data-variant={variant}
                    data-size={size}
                    data-error={error}
                    data-success={success}
                    value={value}
                    onChange={handleChange}
                    {...props}
                />

                {/* Right icon */}
                {rightIcon && (
                    <div className={rightIconClasses}>
                        {rightIcon}
                    </div>
                )}
            </div>

            {/* Helper text and character count */}
            <div className="flex justify-between items-start mt-1">
                {/* Helper text */}
                {helperText && (
                    <p
                        id={`${inputId}-helper`}
                        className={cn(
                            'text-sm',
                            error && 'text-red-600 dark:text-red-400',
                            success && 'text-green-600 dark:text-green-400',
                            !error && !success && 'text-gray-500 dark:text-gray-400'
                        )}
                    >
                        {helperText}
                    </p>
                )}

                {/* Character count */}
                {showCharCount && maxLength && (
                    <p
                        id={`${inputId}-count`}
                        className={cn(
                            'text-sm ml-auto',
                            isOverLimit ? 'text-red-600 dark:text-red-400' : '',
                            !isOverLimit ? 'text-gray-500 dark:text-gray-400' : ''
                        )}
                        aria-live="polite"
                    >
                        {charCount}/{maxLength}
                    </p>
                )}
            </div>
        </div>
    );
});

Input.displayName = 'Input';