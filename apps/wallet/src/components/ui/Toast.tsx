'use client'

import React from 'react';

import { cva, type VariantProps } from 'class-variance-authority';
import { AlertCircle, AlertTriangle, CheckCircle, Info, X } from 'lucide-react';
import {
  forwardRef,
  type ComponentPropsWithoutRef,
  type ElementRef,
} from 'react';

import { cn } from '@/lib/utils';

import { Button } from './Button';

const toastVariants = cva(
  'group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-6 pr-8 shadow-lg transition-all data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-top-full data-[state=open]:sm:slide-in-from-bottom-full',
  {
    variants: {
      variant: {
        default: 'border bg-background text-foreground',
        destructive:
          'destructive group border-destructive bg-destructive text-destructive-foreground',
        success:
          'border-green-200 bg-green-50 text-green-900 dark:border-green-800 dark:bg-green-950 dark:text-green-100',
        warning:
          'border-yellow-200 bg-yellow-50 text-yellow-900 dark:border-yellow-800 dark:bg-yellow-950 dark:text-yellow-100',
        info: 'border-blue-200 bg-blue-50 text-blue-900 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-100',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

const Toast = forwardRef<
  ElementRef<'div'>,
  ComponentPropsWithoutRef<'div'> & VariantProps<typeof toastVariants>
>(({ className, variant, ...props }, ref): React.ReactElement => {
  return (
    <div
      ref={ref}
      className={cn(toastVariants({ variant }), className)}
      {...props}
    />
  );
});
Toast.displayName = 'Toast';

const ToastAction = forwardRef<
  ElementRef<typeof Button>,
  ComponentPropsWithoutRef<typeof Button>
>(
  ({ className, ...props }, ref): React.ReactElement => (
    <Button
      ref={ref}
      variant="outline"
      size="sm"
      className={cn(
        'group-[.destructive]:border-muted/40 group-[.destructive]:hover:border-destructive/30 group-[.destructive]:hover:bg-destructive group-[.destructive]:hover:text-destructive-foreground group-[.destructive]:focus:ring-destructive',
        className
      )}
      {...props}
    />
  )
);
ToastAction.displayName = 'ToastAction';

const ToastClose = forwardRef<
  ElementRef<'button'>,
  ComponentPropsWithoutRef<'button'>
>(
  ({ className, ...props }, ref): React.ReactElement => (
    <button
      ref={ref}
      type="button"
      data-testid="toast-close"
      className={cn(
        'absolute right-2 top-2 rounded-md p-1 text-foreground/50 opacity-0 transition-opacity hover:text-foreground focus:opacity-100 focus:outline-none focus:ring-2 group-hover:opacity-100 group-[.destructive]:text-red-300 group-[.destructive]:hover:text-red-50 group-[.destructive]:focus:ring-red-400 group-[.destructive]:focus:ring-offset-red-600',
        className
      )}
      {...props}
    >
      <X className="h-4 w-4" data-testid="x-icon" />
      <span className="sr-only">Close</span>
    </button>
  )
);
ToastClose.displayName = 'ToastClose';

const ToastTitle = forwardRef<
  ElementRef<'div'>,
  ComponentPropsWithoutRef<'div'>
>(
  ({ className, ...props }, ref): React.ReactElement => (
    <div
      ref={ref}
      className={cn('text-sm font-semibold', className)}
      {...props}
    />
  )
);
ToastTitle.displayName = 'ToastTitle';

const ToastDescription = forwardRef<
  ElementRef<'div'>,
  ComponentPropsWithoutRef<'div'>
>(
  ({ className, ...props }, ref): React.ReactElement => (
    <div ref={ref} className={cn('text-sm opacity-90', className)} {...props} />
  )
);
ToastDescription.displayName = 'ToastDescription';

interface ToastIconProps {
  variant?: 'default' | 'destructive' | 'success' | 'warning' | 'info';
  className?: string;
  'data-testid'?: string;
}

const ToastIcon = ({
  variant = 'default',
  className,
  'data-testid': testId,
}: ToastIconProps): React.ReactElement => {
  const iconMap = {
    success: CheckCircle,
    destructive: AlertCircle,
    warning: AlertTriangle,
    info: Info,
    default: Info,
  };

  const colorMap = {
    success: 'text-green-500',
    destructive: 'text-red-500',
    warning: 'text-yellow-500',
    info: 'text-blue-500',
    default: 'text-muted-foreground',
  };

  const IconComponent = iconMap[variant as keyof typeof iconMap];

  return (
    <div data-testid={testId ?? `toast-icon-${variant}`}>
      <IconComponent
        className={cn(
          'h-5 w-5 flex-shrink-0',
          colorMap[variant as keyof typeof colorMap],
          className
        )}
      />
    </div>
  );
};

type ToastProps = ComponentPropsWithoutRef<typeof Toast>;

type ToastActionElement = React.ReactElement<typeof ToastAction>;

export {
  Toast,
  ToastAction,
  ToastClose,
  ToastDescription,
  ToastIcon,
  ToastTitle,
  toastVariants,
  type ToastActionElement,
  type ToastProps,
};

