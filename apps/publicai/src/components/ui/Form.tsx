'use client';

import * as React from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import type {
  ControllerProps,
  FieldPath,
  FieldValues,
  UseFormReturn,
} from 'react-hook-form';

import { cn } from '@/lib/utils';

import { Label } from './label';

interface FormProps<T extends FieldValues = FieldValues> {
  form: UseFormReturn<T>;
  onSubmit: (data: T) => void | Promise<void>;
  children: React.ReactNode;
  className?: string;
}

type FormFieldContextValue<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = {
  name: TName;
};

const FormFieldContext = React.createContext<FormFieldContextValue>(
  {} as FormFieldContextValue
);

function FormField<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({ ...props }: ControllerProps<TFieldValues, TName>): React.ReactElement {
  return (
    <FormFieldContext.Provider value={{ name: props.name }}>
      <Controller {...props} />
    </FormFieldContext.Provider>
  );
}

interface FormItemProps extends React.HTMLAttributes<HTMLDivElement> { }

function FormItem({ className, ...props }: FormItemProps): React.ReactElement {
  return <div className={cn('space-y-2', className)} {...props} />;
}

interface FormLabelProps extends React.ComponentPropsWithoutRef<typeof Label> {
  className?: string;
}

function FormLabel({
  className,
  ...props
}: FormLabelProps): React.ReactElement {
  const { name } = React.useContext(FormFieldContext);
  const formContext = useFormContext();
  const { formState } = formContext;

  const error = formState.errors[name];

  return (
    <Label
      className={cn(error !== undefined && 'text-destructive', className)}
      htmlFor={name}
      {...props}
    />
  );
}

interface FormDescriptionProps
  extends React.HTMLAttributes<HTMLParagraphElement> { }

function FormDescription({
  className,
  ...props
}: FormDescriptionProps): React.ReactElement {
  return (
    <p className={cn('text-sm text-muted-foreground', className)} {...props} />
  );
}

interface FormControlProps extends React.HTMLAttributes<HTMLDivElement> { }

function FormControl({ ...props }: FormControlProps): React.ReactElement {
  const { name } = React.useContext(FormFieldContext);
  const formContext = useFormContext();
  const { formState } = formContext;

  const error = formState.errors[name];

  return (
    <div
      className={cn('mt-1', error !== undefined && 'has-error')}
      aria-invalid={error !== undefined}
      aria-describedby={error !== undefined ? `${name}-error` : undefined}
      {...props}
    />
  );
}

interface FormMessageProps extends React.HTMLAttributes<HTMLParagraphElement> {
  message?: string;
  className?: string;
}

function FormMessage({
  className,
  children,
  message,
  ...props
}: FormMessageProps): React.ReactElement | null {
  const { name } = React.useContext(FormFieldContext);
  const formContext = useFormContext();
  const { formState } = formContext;

  const error = formState.errors[name];
  const body =
    error !== undefined ? String(error.message) : (message ?? children);

  if (body === undefined || body === null) {
    return null;
  }

  return (
    <p
      id={`${name}-error`}
      aria-live="assertive"
      className={cn('text-sm font-medium text-destructive', className)}
      {...props}
    >
      {body}
    </p>
  );
}

function Form<TFieldValues extends FieldValues>({
  form,
  onSubmit,
  children,
  className,
  ...props
}: FormProps<TFieldValues>): React.ReactElement {
  // Create a non-async wrapper function to avoid ESLint's no-misused-promises warning
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    const submitHandler = form.handleSubmit((data: TFieldValues): void => {
      (async (): Promise<void> => {
        try {
          await onSubmit(data);
        } catch (error: unknown) {
          // If error has a specific field mapping
          if (
            error !== null &&
            typeof error === 'object' &&
            'fieldErrors' in error
          ) {
            const fieldErrors = error.fieldErrors as Record<string, string>;

            // Set field-specific errors
            for (const [field, message] of Object.entries(fieldErrors)) {
              form.setError(field as FieldPath<TFieldValues>, {
                type: 'server',
                message,
              });
            }
          }

          // Log error for debugging, but don't rethrow to avoid unhandled promise rejection
          console.error('Form submission error:', error);
        }
      })().catch(console.error);
    });
    submitHandler(e);
  };

  return (
    <form className={className} onSubmit={handleSubmit} noValidate {...props}>
      {children}
    </form>
  );
}

export {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
};
