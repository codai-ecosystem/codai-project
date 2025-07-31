import { zodResolver } from '@hookform/resolvers/zod';
import { useCallback, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import type { FieldValues, UseFormProps, UseFormReturn } from 'react-hook-form';
import type { z } from 'zod';

/**
 * Custom hook for managing forms with validation using Zod
 * @param schema - Zod schema for validation
 * @param defaultValues - Default values for the form
 * @param options - Additional options for useForm
 */
export function useFormFields<
  TSchema extends z.ZodType<
    Record<string, unknown>,
    z.ZodTypeDef,
    Record<string, unknown>
  >,
  TFieldValues extends FieldValues = z.infer<TSchema>,
>(
  schema: TSchema,
  defaultValues?: UseFormProps<TFieldValues>['defaultValues'],
  options: Omit<UseFormProps<TFieldValues>, 'resolver' | 'defaultValues'> = {}
): {
  form: UseFormReturn<TFieldValues>;
  FormProvider: typeof FormProvider;
  serverErrors: Record<string, string>;
  setServerValidationErrors: (errors: Record<string, string>) => void;
  clearServerErrors: () => void;
  submitWithErrorHandling: (
    onSubmit: (
      values: TFieldValues
    ) => Promise<void | boolean | Record<string, string>>
  ) => (e?: React.BaseSyntheticEvent) => Promise<void>;
  register: UseFormReturn<TFieldValues>['register'];
  handleSubmit: UseFormReturn<TFieldValues>['handleSubmit'];
  formState: UseFormReturn<TFieldValues>['formState'];
  reset: UseFormReturn<TFieldValues>['reset'];
  setValue: UseFormReturn<TFieldValues>['setValue'];
  getValues: UseFormReturn<TFieldValues>['getValues'];
  watch: UseFormReturn<TFieldValues>['watch'];
  control: UseFormReturn<TFieldValues>['control'];
} {
  const [serverErrors, setServerErrors] = useState<Record<string, string>>({}); // Initialize react-hook-form with zod resolver
  const form = useForm<TFieldValues>({
    resolver: zodResolver(schema),
    ...(defaultValues !== undefined && { defaultValues }),
    ...options,
  });

  /**
   * Add server validation errors to the form state
   */
  const setServerValidationErrors = useCallback(
    (errors: Record<string, string>) => {
      setServerErrors(errors); // Set errors in react-hook-form state
      for (const [field, message] of Object.entries(errors)) {
        form.setError(field as `root.${string}`, {
          type: 'server',
          message,
        });
      }
    },
    [form]
  );

  /**
   * Clear server errors
   */
  const clearServerErrors = useCallback(() => {
    setServerErrors({});
  }, []);

  /**
   * Submit handler with error handling
   */
  const submitWithErrorHandling = useCallback(
    (
      onSubmit: (
        values: TFieldValues
      ) => Promise<void | boolean | Record<string, string>>
    ) => {
      return form.handleSubmit(async values => {
        try {
          // Clear any previous server errors
          clearServerErrors();

          // Call the submit function
          const result = await onSubmit(values as TFieldValues);

          // If result is an object with errors, set them
          if (
            result != null &&
            typeof result === 'object' &&
            !Array.isArray(result)
          ) {
            setServerValidationErrors(result);
          }

          return result;
        } catch (error: unknown) {
          // Handle unexpected errors
          console.error('Form submission error:', error);

          // Set a generic error
          setServerValidationErrors({
            root: 'An unexpected error occurred. Please try again.',
          });

          return false;
        }
      });
    },
    [form, clearServerErrors, setServerValidationErrors]
  );

  return {
    form,
    FormProvider,
    serverErrors,
    setServerValidationErrors,
    clearServerErrors,
    submitWithErrorHandling,
    // Re-export useful methods from useForm
    register: form.register,
    handleSubmit: form.handleSubmit,
    formState: form.formState,
    reset: form.reset,
    setValue: form.setValue,
    getValues: form.getValues,
    watch: form.watch,
    control: form.control,
  };
}

export default useFormFields;
