import { type VariantProps, cva } from 'class-variance-authority';
import { type InputHTMLAttributes, forwardRef, useId } from 'react';

import { cn } from '@/lib/utils';

const inputVariants = cva(
  [
    'flex w-full rounded-md border border-input bg-background px-3 py-2',
    'text-sm ring-offset-background',
    'file:border-0 file:bg-transparent file:text-sm file:font-medium',
    'placeholder:text-muted-foreground',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
    'disabled:cursor-not-allowed disabled:opacity-50',
    'transition-colors',
  ],
  {
    variants: {
      variant: {
        default: '',
        destructive: 'border-destructive focus-visible:ring-destructive',
        success: 'border-success focus-visible:ring-success',
        warning: 'border-warning focus-visible:ring-warning',
      },
      inputSize: {
        default: 'h-10',
        sm: 'h-9 text-xs',
        lg: 'h-11',
      },
    },
    defaultVariants: {
      variant: 'default',
      inputSize: 'default',
    },
  }
);

export interface InputProps
  extends InputHTMLAttributes<HTMLInputElement>,
    VariantProps<typeof inputVariants> {
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  error?: string | undefined;
  label?: string;
  description?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      variant,
      inputSize,
      type = 'text',
      leftIcon,
      rightIcon,
      error,
      label,
      description,
      id,
      ...props
    },
    ref
  ): React.ReactElement => {
    const generatedId = useId();
    const inputId = id ?? `input-${generatedId}`;
    const effectiveVariant = error !== undefined ? 'destructive' : variant;

    return (
      <div className="space-y-2">
        {label !== undefined ? (
          <label
            htmlFor={inputId}
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            {label}
          </label>
        ) : null}
        <div className="relative">
          {leftIcon !== undefined ? (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              {leftIcon}
            </div>
          ) : null}
          <input
            type={type}
            className={cn(
              inputVariants({ variant: effectiveVariant, inputSize }),
              leftIcon !== undefined && 'pl-10',
              rightIcon !== undefined && 'pr-10',
              className
            )}
            ref={ref}
            id={inputId}
            {...props}
          />
          {rightIcon !== undefined ? (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              {rightIcon}
            </div>
          ) : null}
        </div>
        {description !== undefined && error === undefined ? (
          <p className="text-sm text-muted-foreground">{description}</p>
        ) : null}
        {error !== undefined ? (
          <p className="text-sm text-destructive">{error}</p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input, inputVariants };
