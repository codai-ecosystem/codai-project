import { forwardRef, type TextareaHTMLAttributes } from 'react';

import { cn } from '@/lib/utils';

export interface TextareaProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  description?: string;
  error?: string;
  resize?: 'none' | 'both' | 'horizontal' | 'vertical';
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    { className, label, description, error, resize = 'vertical', id, ...props },
    ref
  ): React.ReactElement => {
    const textareaId =
      id ?? `textarea-${Math.random().toString(36).substring(2, 9)}`;

    return (
      <div className="space-y-2">
        {label !== undefined ? (
          <label
            htmlFor={textareaId}
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            {label}
          </label>
        ) : null}
        <textarea
          className={cn(
            [
              'flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2',
              'text-sm ring-offset-background',
              'placeholder:text-muted-foreground',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
              'disabled:cursor-not-allowed disabled:opacity-50',
              'transition-colors',
            ],
            {
              'resize-none': resize === 'none',
              resize: resize === 'both',
              'resize-x': resize === 'horizontal',
              'resize-y': resize === 'vertical',
              'border-destructive focus-visible:ring-destructive':
                error !== undefined && error !== '',
            },
            className
          )}
          ref={ref}
          id={textareaId}
          {...props}
        />
        {description !== undefined && (error === undefined || error === '') ? (
          <p className="text-sm text-muted-foreground">{description}</p>
        ) : null}
        {error !== undefined && error !== '' ? (
          <p className="text-sm text-destructive">{error}</p>
        ) : null}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

export { Textarea };
