/**
 * Form validation utilities using Zod
 */
import { z } from 'zod';

// Email validation with custom error message
export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .refine(
    email => {
      // More strict email validation that properly handles edge cases
      // - No leading/trailing dots
      // - No consecutive dots
      // - TLD must be at least 2 characters (except for IP addresses)
      // - No spaces allowed
      // - Support for + in local part
      // - Support for IP address domains like email@123.123.123.123
      const emailRegex =
        /^[a-zA-Z0-9]([a-zA-Z0-9._+-]*[a-zA-Z0-9])?@([a-zA-Z0-9]([a-zA-Z0-9.-]*[a-zA-Z0-9])?\.[a-zA-Z]{2,}|[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3})$/;
      return emailRegex.test(email) && !email.includes('..');
    },
    {
      message: 'Please enter a valid email address',
    }
  );

// Password validation with strength requirements
export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .refine(
    password => /[A-Z]/.test(password),
    'Password must contain at least one uppercase letter'
  )
  .refine(
    password => /[a-z]/.test(password),
    'Password must contain at least one lowercase letter'
  )
  .refine(
    password => /\d/.test(password),
    'Password must contain at least one number'
  )
  .refine(
    password => /[^\dA-Za-z]/.test(password),
    'Password must contain at least one special character'
  );

// Name validation
export const nameSchema = z
  .string()
  .min(2, 'Name must be at least 2 characters')
  .max(50, 'Name must be less than 50 characters')
  .regex(
    /^[\s'A-Za-z\-]+$/,
    'Name must contain only letters, spaces, hyphens, and apostrophes'
  );

// URL validation with protocol safety
export const urlSchema = z
  .string()
  .url('Please enter a valid URL')
  .refine(
    url => {
      try {
        // Allow http, https, and ftp protocols
        const urlObj = new URL(url);
        return ['http:', 'https:', 'ftp:'].includes(urlObj.protocol);
      } catch (error) {
        return false;
      }
    },
    {
      message: 'Please enter a valid URL',
    }
  );

// Date validation
export const dateSchema = z
  .string()
  .refine(
    dateStr => {
      // First check if the string can be parsed at all
      if (isNaN(Date.parse(dateStr))) {
        return false;
      }

      // For ISO format dates (YYYY-MM-DD), do additional validation
      if (/^\d{4}-\d{2}-\d{2}/.test(dateStr)) {
        const parts = dateStr.split('-');
        if (parts.length < 3) return true; // Not enough parts, let the Date parser handle it

        // Get the year, month, and day, safely handling undefined parts
        const year = parseInt(parts[0] ?? '0', 10);
        const month = parseInt(parts[1] ?? '0', 10) - 1; // JS months are 0-indexed
        const dayPart = parts[2] ?? '0';
        const day = parseInt(dayPart.split('T')[0] ?? '0', 10); // Handle if there's a time component

        // Create a date with those components and see if they match
        const reconstructedDate = new Date(year, month, day);

        // Check if the date reconstructed from components matches the expected values
        // This catches invalid dates like 2023-02-30
        return (
          reconstructedDate.getFullYear() === year &&
          reconstructedDate.getMonth() === month &&
          reconstructedDate.getDate() === day
        );
      }

      // For other formats, just make sure it's a valid date
      return !isNaN(new Date(dateStr).getTime());
    },
    {
      message: 'Please enter a valid date',
    }
  )
  .transform(dateStr => new Date(dateStr));

// Phone number validation
export const phoneSchema = z.string().refine(
  phone => {
    // Remove all non-digit characters for length checking
    const digitsOnly = phone.replace(/\D/g, '');
    // Valid phone numbers should have between 7 and 12 digits (more restrictive)
    if (digitsOnly.length < 7 || digitsOnly.length > 12) {
      return false;
    }
    // Should start with optional + followed by digits, spaces, parentheses, hyphens, or dots
    return /^\+?[\d\s\(\).-]+$/.test(phone);
  },
  {
    message: 'Please enter a valid phone number',
  }
);

// Common schemas for auth forms
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional(),
});

export const registerSchema = z
  .object({
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string().min(1, 'Please confirm your password'),
    displayName: nameSchema,
    acceptTerms: z.literal(true).refine((val) => val === true, {
      message: 'You must accept the terms and conditions',
    }),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

export const resetPasswordSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

export const profileSchema = z.object({
  displayName: nameSchema,
  email: emailSchema,
  phoneNumber: phoneSchema.optional().nullable(),
  bio: z.string().max(500, 'Bio must be less than 500 characters').optional(),
  website: urlSchema.optional().nullable(),
});

// Form error handler
export class FormError extends Error {
  fieldErrors: Record<string, string>;

  constructor(message: string, fieldErrors: Record<string, string> = {}) {
    super(message);
    this.name = 'FormError';
    this.fieldErrors = fieldErrors;
  }
}

/**
 * Create a form error with field-specific messages
 * @param message General error message
 * @param fieldErrors Field-specific error messages
 */
export const createFormError = (
  message: string = 'Form submission failed',
  fieldErrors: Record<string, string> = {}
): FormError => {
  return new FormError(message, fieldErrors);
};

/**
 * Parse Firebase auth errors into user-friendly messages
 * @param error Firebase auth error or null/undefined
 */
export const parseFirebaseAuthError = (
  error:
    | {
      code?: string;
      message?: string;
    }
    | null
    | undefined
): FormError => {
  if (!error) {
    return new FormError('Authentication failed');
  }

  const errorCode = error.code ?? '';
  const errorMessage = error.message ?? 'Authentication failed';

  // Map Firebase error codes to user-friendly messages and field errors
  switch (errorCode) {
    case 'auth/user-not-found':
    case 'auth/invalid-email':
      return createFormError('Authentication failed', {
        email: 'No account found with this email address',
      });

    case 'auth/wrong-password':
      return createFormError('Authentication failed', {
        password: 'Incorrect password',
      });

    case 'auth/email-already-in-use':
      return createFormError('Registration failed', {
        email: 'This email address is already in use',
      });

    case 'auth/weak-password':
      return createFormError('Registration failed', {
        password: 'Password is too weak',
      });

    case 'auth/invalid-credential':
      return createFormError('Authentication failed', {
        email: 'Invalid credentials',
        password: 'Invalid credentials',
      });

    case 'auth/too-many-requests':
      return createFormError(
        'Too many failed login attempts. Please try again later or reset your password'
      );

    default:
      return createFormError(errorMessage);
  }
};
