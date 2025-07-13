'use client';

import * as CheckboxPrimitive from '@radix-ui/react-checkbox';
import * as React from 'react';

import { cn } from '@/lib/utils';

type CheckboxProps = React.ComponentPropsWithoutRef<
  typeof CheckboxPrimitive.Root
> & {
  label?: React.ReactNode;
  description?: string;
  error?: boolean | string;
};

const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  CheckboxProps
>(
  (
    { className, label, description, error, id, ...props },
    ref
  ): React.ReactElement => {
    const generatedId = React.useId();
    const checkboxId = id ?? generatedId;

    return (
      <div className="flex items-start space-x-2">
        <CheckboxPrimitive.Root
          ref={ref}
          id={checkboxId}
          className={cn(
            'peer h-4 w-4 shrink-0 rounded-sm border shadow-sm',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
            'disabled:cursor-not-allowed disabled:opacity-50',
            'data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground',
            error === true || (typeof error === 'string' && error.length > 0)
              ? 'border-destructive'
              : 'border-primary',
            className
          )}
          {...(label !== undefined &&
            label !== null && { 'aria-labelledby': `${checkboxId}-label` })}
          {...props}
        >
          <CheckboxPrimitive.Indicator
            className={cn('flex items-center justify-center text-current')}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-3 w-3"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </CheckboxPrimitive.Indicator>
        </CheckboxPrimitive.Root>
        {label !== undefined ||
        description !== undefined ||
        (typeof error === 'string' && error.length > 0) ? (
          <div className="grid gap-1">
            {label !== undefined ? (
              <label
                id={`${checkboxId}-label`}
                htmlFor={checkboxId}
                className={cn(
                  'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
                  (error === true ||
                    (typeof error === 'string' && error.length > 0)) &&
                    'text-destructive'
                )}
              >
                {label}
              </label>
            ) : null}
            {description !== undefined ? (
              <p className="text-xs text-muted-foreground">{description}</p>
            ) : null}
            {typeof error === 'string' && error.length > 0 ? (
              <p className="text-xs text-destructive">{error}</p>
            ) : null}
          </div>
        ) : null}
      </div>
    );
  }
);
Checkbox.displayName = CheckboxPrimitive.Root.displayName;

export { Checkbox };
