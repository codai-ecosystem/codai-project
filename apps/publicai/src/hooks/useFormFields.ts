import { zodResolver } from '@hookform/resolvers/zod';
import { useCallback, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import type { FieldValues, UseFormProps, UseFormReturn } from 'react-hook-form';
import { z, ZodError } from 'zod';

/**
 * Custom hook for managing forms with validation using Zod
 * @param schema - Zod schema for validation
 * @param defaultValues - Default values for the form
 * @param options - Additional options for useForm
 */
export function useFormFields(
  schema: z.ZodType<any>,
  defaultValues?: any,
  options: any = {}
) {
  const [serverErrors, setServerErrors] = useState<Record<string, string>>({}); // Initialize react-hook-form with zod resolver

  // Create a custom resolver to work around type compatibility issues
  const resolver = async (values: any, context: any, options: any) => {
    try {
      const result = await schema.parseAsync(values);
      return {
        values: result,
        errors: {},
      };
    } catch (error) {
      if (error instanceof ZodError) {
        const errors: Record<string, any> = {};
        error.issues.forEach((issue) => {
          if (issue.path && issue.path.length > 0) {
            const fieldName = issue.path.join('.');
            errors[fieldName] = {
              type: 'validation',
              message: issue.message,
            };
          }
        });
        return {
          values: {},
          errors,
        };
      }
      throw error;
    }
  };

  const form = useForm({
    resolver,
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
        values: any
      ) => Promise<void | boolean | Record<string, string>>
    ) => {
      return form.handleSubmit(async values => {
        try {
          // Clear any previous server errors
          clearServerErrors();

          // Call the submit function
          const result = await onSubmit(values);

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
