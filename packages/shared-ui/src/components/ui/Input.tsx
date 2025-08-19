'use client'

import React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../../lib/utils'
import { AppName } from '../../config/design-tokens'

// ===== INPUT VARIANTS - Enhanced with App-Specific Theming =====
const inputVariants = cva(
  [
    // Base styles
    'flex w-full rounded-lg border transition-all duration-200',
    'bg-background px-3 py-2 text-sm',
    'ring-offset-background placeholder:text-muted-foreground',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
    'disabled:cursor-not-allowed disabled:opacity-50',
    'file:border-0 file:bg-transparent file:text-sm file:font-medium',
    'autofill:bg-background'
  ],
  {
    variants: {
      // Size variants
      size: {
        sm: 'h-8 px-2 py-1 text-xs rounded-md',
        default: 'h-10 px-3 py-2 text-sm',
        lg: 'h-12 px-4 py-3 text-base',
        xl: 'h-14 px-5 py-4 text-lg'
      },
      // Visual variants
      variant: {
        default: 'border-input focus-visible:ring-ring',
        ghost: 'border-transparent bg-transparent focus-visible:ring-ring focus-visible:border-input',
        filled: 'border-transparent bg-muted focus-visible:ring-ring focus-visible:bg-background',
        underline: 'border-transparent border-b-2 border-b-input rounded-none focus-visible:ring-0 focus-visible:border-b-ring px-0'
      },
      // App-specific focus colors
      app: {
        default: '',
        codai: 'focus-visible:ring-codai-primary/20 focus-visible:border-codai-primary',
        memorai: 'focus-visible:ring-memorai-primary/20 focus-visible:border-memorai-primary',
        bancai: 'focus-visible:ring-bancai-primary/20 focus-visible:border-bancai-primary',
        romai: 'focus-visible:ring-romai-primary/20 focus-visible:border-romai-primary',
        ajutai: 'focus-visible:ring-ajutai-primary/20 focus-visible:border-ajutai-primary',
        controlai: 'focus-visible:ring-controlai-primary/20 focus-visible:border-controlai-primary',
        studiai: 'focus-visible:ring-studiai-primary/20 focus-visible:border-studiai-primary',
        sociai: 'focus-visible:ring-sociai-primary/20 focus-visible:border-sociai-primary',
        cumparai: 'focus-visible:ring-cumparai-primary/20 focus-visible:border-cumparai-primary',
        donai: 'focus-visible:ring-donai-primary/20 focus-visible:border-donai-primary'
      },
      // Validation states
      validation: {
        default: '',
        success: 'border-green-500 focus-visible:ring-green-500/20 focus-visible:border-green-500',
        warning: 'border-yellow-500 focus-visible:ring-yellow-500/20 focus-visible:border-yellow-500',
        error: 'border-red-500 focus-visible:ring-red-500/20 focus-visible:border-red-500'
      }
    },
    defaultVariants: {
      size: 'default',
      variant: 'default',
      app: 'default',
      validation: 'default'
    }
  }
)

const labelVariants = cva(
  'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
  {
    variants: {
      validation: {
        default: 'text-foreground',
        success: 'text-green-700',
        warning: 'text-yellow-700',
        error: 'text-red-700'
      },
      required: {
        true: "after:content-['*'] after:ml-0.5 after:text-red-500",
        false: ''
      }
    },
    defaultVariants: {
      validation: 'default',
      required: false
    }
  }
)

const helpTextVariants = cva(
  'text-xs mt-1.5',
  {
    variants: {
      validation: {
        default: 'text-muted-foreground',
        success: 'text-green-600',
        warning: 'text-yellow-600',
        error: 'text-red-600'
      }
    },
    defaultVariants: {
      validation: 'default'
    }
  }
)

// ===== INPUT INTERFACES =====
export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
  VariantProps<typeof inputVariants> {
  app?: AppName | 'default'
  validation?: 'default' | 'success' | 'warning' | 'error'
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  loading?: boolean
}

export interface InputFieldProps extends InputProps {
  label?: string
  helpText?: string
  errorText?: string
  required?: boolean
  containerClassName?: string
}

// ===== ICON WRAPPER COMPONENT =====
const InputIcon = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { side: 'left' | 'right' }
>(({ className, side, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'absolute top-1/2 -translate-y-1/2 flex items-center justify-center',
      'h-4 w-4 text-muted-foreground pointer-events-none',
      side === 'left' && 'left-3',
      side === 'right' && 'right-3',
      className
    )}
    {...props}
  >
    {children}
  </div>
))
InputIcon.displayName = 'InputIcon'

// ===== LOADING SPINNER =====
const InputLoadingSpinner = () => (
  <div className="h-4 w-4 animate-spin">
    <div className="h-full w-full border-2 border-current border-t-transparent rounded-full" />
  </div>
)

// ===== INPUT COMPONENT =====
const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({
    className,
    type,
    size,
    variant,
    app,
    validation,
    leftIcon,
    rightIcon,
    loading,
    disabled,
    ...props
  }, ref) => {
    const hasLeftIcon = leftIcon || type === 'search'
    const hasRightIcon = rightIcon || loading

    return (
      <div className="relative">
        {/* Left Icon */}
        {hasLeftIcon && (
          <InputIcon side="left">
            {type === 'search' ? (
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            ) : leftIcon}
          </InputIcon>
        )}

        {/* Input Element */}
        <input
          type={type}
          className={cn(
            inputVariants({ size, variant, app, validation }),
            hasLeftIcon && 'pl-9',
            hasRightIcon && 'pr-9',
            className
          )}
          ref={ref}
          disabled={disabled || loading}
          {...props}
        />

        {/* Right Icon */}
        {hasRightIcon && (
          <InputIcon side="right">
            {loading ? <InputLoadingSpinner /> : rightIcon}
          </InputIcon>
        )}
      </div>
    )
  }
)
Input.displayName = 'Input'

// ===== INPUT FIELD WITH LABEL =====
const InputField = React.forwardRef<HTMLInputElement, InputFieldProps>(
  ({
    label,
    helpText,
    errorText,
    required,
    validation,
    containerClassName,
    id,
    ...inputProps
  }, ref) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`
    const helpTextId = `${inputId}-help`
    const errorTextId = `${inputId}-error`

    // Determine validation state
    const finalValidation = errorText ? 'error' : validation || 'default'

    return (
      <div className={cn('space-y-2', containerClassName)}>
        {/* Label */}
        {label && (
          <label
            htmlFor={inputId}
            className={cn(labelVariants({ validation: finalValidation, required }))}
          >
            {label}
          </label>
        )}

        {/* Input */}
        <Input
          ref={ref}
          id={inputId}
          validation={finalValidation}
          aria-describedby={cn(
            helpText && helpTextId,
            errorText && errorTextId
          )}
          aria-invalid={finalValidation === 'error'}
          {...inputProps}
        />

        {/* Help Text */}
        {helpText && !errorText && (
          <p
            id={helpTextId}
            className={cn(helpTextVariants({ validation: finalValidation }))}
          >
            {helpText}
          </p>
        )}

        {/* Error Text */}
        {errorText && (
          <p
            id={errorTextId}
            className={cn(helpTextVariants({ validation: 'error' }))}
            role="alert"
          >
            {errorText}
          </p>
        )}
      </div>
    )
  }
)
InputField.displayName = 'InputField'

// ===== SPECIALIZED INPUT COMPONENTS =====
interface PasswordInputProps extends Omit<InputProps, 'type' | 'rightIcon'> {
  showPasswordToggle?: boolean
}

const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ showPasswordToggle = true, ...props }, ref) => {
    const [showPassword, setShowPassword] = React.useState(false)

    const togglePassword = () => setShowPassword(!showPassword)

    return (
      <Input
        ref={ref}
        type={showPassword ? 'text' : 'password'}
        rightIcon={
          showPasswordToggle ? (
            <button
              type="button"
              onClick={togglePassword}
              className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors pointer-events-auto"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? (
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                </svg>
              ) : (
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </button>
          ) : undefined
        }
        {...props}
      />
    )
  }
)
PasswordInput.displayName = 'PasswordInput'

// ===== EXPORTS =====
export {
  Input,
  InputField,
  PasswordInput,
  inputVariants,
  InputIcon,
  InputLoadingSpinner
}
