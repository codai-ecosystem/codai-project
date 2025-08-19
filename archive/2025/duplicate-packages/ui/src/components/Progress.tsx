import React from 'react';
import { cn } from '../utils/cn';

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number;
  max?: number;
  showValue?: boolean;
  variant?: 'default' | 'success' | 'warning' | 'error';
  size?: 'sm' | 'default' | 'lg';
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, value = 0, max = 100, showValue = false, variant = 'default', size = 'default', ...props }, ref) => {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

    const sizeClasses = {
      sm: 'h-2',
      default: 'h-3',
      lg: 'h-4',
    };

    const variantClasses = {
      default: 'bg-primary',
      success: 'bg-green-500',
      warning: 'bg-yellow-500',
      error: 'bg-red-500',
    };

    return (
      <div className={cn('relative', className)} ref={ref} {...props}>
        <div
          className={cn(
            'w-full overflow-hidden rounded-full bg-secondary',
            sizeClasses[size]
          )}
        >
          <div
            className={cn(
              'h-full w-full flex-1 transition-all duration-300 ease-in-out',
              variantClasses[variant]
            )}
            style={{
              transform: `translateX(-${100 - percentage}%)`,
            }}
          />
        </div>
        {showValue && (
          <span className="absolute inset-0 flex items-center justify-center text-xs font-medium">
            {Math.round(percentage)}%
          </span>
        )}
      </div>
    );
  }
);

Progress.displayName = 'Progress';

export { Progress };
