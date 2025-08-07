import React from 'react'
import { cva, type VariantProps } from 'class-variance-authority';
import { Loader2 } from 'lucide-react';
import type { JSX } from 'react';

import { cn } from '@/lib/utils';

const spinnerVariants = cva('animate-spin', {
  variants: {
    size: {
      sm: 'h-4 w-4',
      default: 'h-6 w-6',
      lg: 'h-8 w-8',
      xl: 'h-12 w-12',
    },
    variant: {
      default: 'text-primary',
      muted: 'text-muted-foreground',
      destructive: 'text-destructive',
      success: 'text-success',
      warning: 'text-warning',
    },
  },
  defaultVariants: {
    size: 'default',
    variant: 'default',
  },
});

export interface SpinnerProps extends VariantProps<typeof spinnerVariants> {
  className?: string;
}

export function Spinner({
  size,
  variant,
  className,
}: SpinnerProps): JSX.Element {
  return (
    <Loader2 className={cn(spinnerVariants({ size, variant }), className)} />
  );
}

export interface LoadingProps {
  size?: 'sm' | 'default' | 'lg' | 'xl';
  text?: string;
  fullScreen?: boolean;
  overlay?: boolean;
}

export function Loading({
  size = 'default',
  text,
  fullScreen = false,
  overlay = false,
}: LoadingProps): JSX.Element {
  const content = (
    <div className="flex flex-col items-center justify-center space-y-4">
      <Spinner size={size} />
      {text !== undefined ? (
        <p className="text-sm text-muted-foreground">{text}</p>
      ) : null}
    </div>
  );

  if (fullScreen === true) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
        {content}
      </div>
    );
  }

  if (overlay === true) {
    return (
      <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/50 backdrop-blur-sm">
        {content}
      </div>
    );
  }

  return <div className="flex items-center justify-center p-4">{content}</div>;
}

