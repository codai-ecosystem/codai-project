/**
 * @fileoverview Input Component - Core Form Element
 * @version 1.0.0
 * 
 * Comprehensive input component with validation, accessibility, and advanced features.
 * Supports various input types, states, and interactive enhancements.
 */

import React, { forwardRef, useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cva, type VariantProps } from 'class-variance-authority';
import { Eye, EyeOff, Search, X, AlertCircle, CheckCircle2 } from 'lucide-react';
import { cn } from '../../utils/className';

const inputVariants = cva([
  'flex w-full rounded-md border bg-background text-sm transition-all duration-200',
  'file:border-0 file:bg-transparent file:text-sm file:font-medium',
  'placeholder:text-muted-foreground',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
  'disabled:cursor-not-allowed disabled:opacity-50',
  'read-only:cursor-default read-only:bg-muted'
], {
  variants: {
    variant: {
      default: [
        'border-input focus-visible:ring-ring',
        'hover:border-input/80'
      ],
      filled: [
        'border-transparent bg-muted/50',
        'focus-visible:bg-background focus-visible:border-input focus-visible:ring-ring',
        'hover:bg-muted/70'
      ],
      flushed: [
        'border-0 border-b-2 border-input rounded-none px-0',
        'focus-visible:border-primary focus-visible:ring-0',
        'hover:border-input/80'
      ],
      unstyled: [
        'border-0 bg-transparent shadow-none focus-visible:ring-0'
      ]
    },
    size: {
      sm: 'h-8 px-3 text-xs',
      md: 'h-9 px-3 py-1',
      lg: 'h-10 px-4 py-2',
      xl: 'h-12 px-4 py-3 text-base'
    },
    state: {
      default: '',
      error: 'border-destructive focus-visible:ring-destructive',
      success: 'border-green-500 focus-visible:ring-green-500',
      warning: 'border-yellow-500 focus-visible:ring-yellow-500'
    }
  },
  defaultVariants: {
    variant: 'default',
    size: 'md',
    state: 'default'
  }
});

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
  VariantProps<typeof inputVariants> {
  /**
   * Input label
   */
  label?: string;

  /**
   * Helper text displayed below input
   */
  helperText?: string;

  /**
   * Error message - sets state to error when provided
   */
  error?: string;

  /**
   * Success message - sets state to success when provided
   */
  success?: string;

  /**
   * Left icon or element
   */
  leftElement?: React.ReactNode;

  /**
   * Right icon or element
   */
  rightElement?: React.ReactNode;

  /**
   * Show clear button when input has value
   */
  clearable?: boolean;

  /**
   * Loading state
   */
  loading?: boolean;

  /**
   * Custom container className
   */
  containerClassName?: string;

  /**
   * Custom label className
   */
  labelClassName?: string;

  /**
   * Show character count
   */
  showCount?: boolean;

  /**
   * Maximum character count
   */
  maxCount?: number;

  /**
   * Enable auto-resize for textarea-like behavior
   */
  autoResize?: boolean;

  /**
   * Debounce delay for onChange (in ms)
   */
  debounceDelay?: number;

  /**
   * Test ID for testing
   */
  'data-testid'?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({
    className,
    containerClassName,
    labelClassName,
    variant,
    size,
    state,
    label,
    helperText,
    error,
    success,
    leftElement,
    rightElement,
    clearable = false,
    loading = false,
    showCount = false,
    maxCount,
    autoResize = false,
    debounceDelay,
    type = 'text',
    value,
    defaultValue,
    onChange,
    onFocus,
    onBlur,
    ...props
  }, ref) => {
    const [inputValue, setInputValue] = useState(value || defaultValue || '');
    const [isFocused, setIsFocused] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const internalRef = useRef<HTMLInputElement>(null);
    const debounceRef = useRef<NodeJS.Timeout>();

    // Determine actual state based on props
    const actualState = error ? 'error' : success ? 'success' : state;
    const actualMessage = error || success || helperText;

    // Auto-resize functionality
    useEffect(() => {
      if (autoResize && internalRef.current) {
        const input = internalRef.current;
        input.style.height = 'auto';
        input.style.height = `${input.scrollHeight}px`;
      }
    }, [inputValue, autoResize]);

    // Debounced onChange
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      setInputValue(newValue);

      if (debounceDelay && onChange) {
        if (debounceRef.current) {
          clearTimeout(debounceRef.current);
        }
        debounceRef.current = setTimeout(() => {
          onChange(e);
        }, debounceDelay);
      } else if (onChange) {
        onChange(e);
      }
    };

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true);
      onFocus?.(e);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false);
      onBlur?.(e);
    };

    const handleClear = () => {
      const input = internalRef.current;
      if (input) {
        const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
          window.HTMLInputElement.prototype,
          'value'
        )?.set;

        if (nativeInputValueSetter) {
          nativeInputValueSetter.call(input, '');
          const event = new Event('input', { bubbles: true });
          input.dispatchEvent(event);
        }

        setInputValue('');
        input.focus();
      }
    };

    const togglePasswordVisibility = () => {
      setShowPassword(!showPassword);
    };

    // Character count calculation
    const currentCount = String(inputValue).length;
    const isOverLimit = maxCount && currentCount > maxCount;

    // Determine input type
    const inputType = type === 'password' && showPassword ? 'text' : type;

    // Render status icon
    const renderStatusIcon = () => {
      if (loading) {
        return (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="h-4 w-4 border-2 border-current border-t-transparent rounded-full"
          />
        );
      }

      switch (actualState) {
        case 'error':
          return <AlertCircle className="h-4 w-4 text-destructive" />;
        case 'success':
          return <CheckCircle2 className="h-4 w-4 text-green-500" />;
        default:
          return null;
      }
    };

    return (
      <div className={cn('w-full', containerClassName)}>
        {/* Label */}
        {label && (
          <motion.label
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              'block text-sm font-medium text-foreground mb-2',
              actualState === 'error' && 'text-destructive',
              actualState === 'success' && 'text-green-500',
              labelClassName
            )}
            htmlFor={props.id}
          >
            {label}
            {props.required && <span className="text-destructive ml-1">*</span>}
          </motion.label>
        )}

        {/* Input Container */}
        <div className="relative">
          {/* Left Element */}
          {leftElement && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              {leftElement}
            </div>
          )}

          {/* Input */}
          <input
            ref={(node) => {
              if (typeof ref === 'function') {
                ref(node);
              } else if (ref) {
                ref.current = node;
              }
              internalRef.current = node;
            }}
            type={inputType}
            value={value !== undefined ? value : inputValue}
            onChange={value !== undefined ? onChange : handleChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            className={cn(
              inputVariants({ variant, size, state: actualState }),
              leftElement && 'pl-10',
              (rightElement || clearable || type === 'password' || loading || actualState !== 'default') && 'pr-10',
              showCount && 'pb-6',
              autoResize && 'resize-none overflow-hidden',
              className
            )}
            aria-invalid={actualState === 'error'}
            aria-describedby={
              actualMessage ? `${props.id}-message` : undefined
            }
            {...props}
          />

          {/* Right Elements */}
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
            {/* Status Icon */}
            {renderStatusIcon()}

            {/* Clear Button */}
            {clearable && inputValue && !loading && (
              <motion.button
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                type="button"
                onClick={handleClear}
                className="text-muted-foreground hover:text-foreground transition-colors p-0.5 rounded-sm hover:bg-muted"
                aria-label="Clear input"
                tabIndex={-1}
              >
                <X className="h-3 w-3" />
              </motion.button>
            )}

            {/* Password Toggle */}
            {type === 'password' && (
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="text-muted-foreground hover:text-foreground transition-colors p-0.5 rounded-sm hover:bg-muted"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            )}

            {/* Custom Right Element */}
            {rightElement && !loading && (
              <div className="text-muted-foreground">
                {rightElement}
              </div>
            )}
          </div>

          {/* Character Count */}
          {showCount && (
            <div className={cn(
              'absolute bottom-1 right-3 text-xs',
              isOverLimit ? 'text-destructive' : 'text-muted-foreground'
            )}>
              {currentCount}{maxCount && `/${maxCount}`}
            </div>
          )}

          {/* Focus Ring Enhancement */}
          <AnimatePresence>
            {isFocused && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="absolute inset-0 rounded-md ring-2 ring-ring ring-offset-2 pointer-events-none"
              />
            )}
          </AnimatePresence>
        </div>

        {/* Helper Text / Error Message */}
        <AnimatePresence mode="wait">
          {actualMessage && (
            <motion.p
              key={actualMessage}
              initial={{ opacity: 0, y: -4, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: -4, height: 0 }}
              className={cn(
                'text-xs mt-2 transition-colors',
                actualState === 'error' && 'text-destructive',
                actualState === 'success' && 'text-green-500',
                actualState === 'default' && 'text-muted-foreground'
              )}
              id={`${props.id}-message`}
            >
              {actualMessage}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    );
  }
);

Input.displayName = 'Input';

/**
 * Search Input Component - Specialized input for search functionality
 */
export interface SearchInputProps extends Omit<InputProps, 'leftElement' | 'type'> {
  onSearch?: (value: string) => void;
  onClear?: () => void;
}

export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
  ({ onSearch, onClear, placeholder = 'Search...', debounceDelay = 300, ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      if (onSearch) {
        onSearch(value);
      }
      props.onChange?.(e);
    };

    const handleClear = () => {
      onClear?.();
    };

    return (
      <Input
        ref={ref}
        type="search"
        placeholder={placeholder}
        leftElement={<Search className="h-4 w-4" />}
        clearable
        debounceDelay={debounceDelay}
        onChange={handleChange}
        {...props}
      />
    );
  }
);

SearchInput.displayName = 'SearchInput';

export type { VariantProps };
export { inputVariants };
