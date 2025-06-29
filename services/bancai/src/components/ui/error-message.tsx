import * as React from 'react';
import { cn } from '@/lib/utils';

interface ErrorMessageProps extends React.HTMLAttributes<HTMLDivElement> {
    message?: string;
    variant?: 'error' | 'warning' | 'info';
}

const ErrorMessage = React.forwardRef<HTMLDivElement, ErrorMessageProps>(
    ({ className, message, variant = 'error', children, ...props }, ref) => {
        const variantClasses = {
            error: 'bg-red-50 text-red-900 border-red-200',
            warning: 'bg-yellow-50 text-yellow-900 border-yellow-200',
            info: 'bg-blue-50 text-blue-900 border-blue-200',
        };

        return (
            <div
                ref={ref}
                className={cn('rounded-md border p-4', variantClasses[variant], className)}
                {...props}
            >
                {message || children}
            </div>
        );
    }
);

ErrorMessage.displayName = 'ErrorMessage';

export { ErrorMessage };
