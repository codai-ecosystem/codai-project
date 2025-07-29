/**
 * Error handling utilities for type-safe error management
 */

/**
 * Safely extracts an error message from an unknown error value
 * @param error - The error value (can be any type)
 * @returns A string error message
 */
export function getErrorMessage(error: unknown): string {
    if (error instanceof Error) {
        return error.message;
    }

    if (typeof error === 'string') {
        return error;
    }

    if (error && typeof error === 'object' && 'message' in error) {
        const message = (error as { message: unknown }).message;
        if (typeof message === 'string') {
            return message;
        }
    }

    // Fallback for any other type
    return 'An unknown error occurred';
}

/**
 * Creates a standardized error object with proper typing
 * @param message - The error message
 * @param originalError - The original error (optional)
 * @returns A proper Error object
 */
export function createError(message: string, originalError?: unknown): Error {
    const error = new Error(message);

    if (originalError instanceof Error && originalError.stack) {
        error.stack = originalError.stack;
    }

    return error;
}

/**
 * Safely handles promise rejections with proper error typing
 * @param promise - The promise to handle
 * @param defaultMessage - Default message if error extraction fails
 * @returns Promise that resolves to result or throws typed error
 */
export async function safePromise<T>(
    promise: Promise<T>,
    defaultMessage: string = 'Operation failed'
): Promise<T> {
    try {
        return await promise;
    } catch (error) {
        throw createError(`${defaultMessage}: ${getErrorMessage(error)}`, error);
    }
}

/**
 * Type guard to check if an object has a message property
 */
export function hasMessage(obj: unknown): obj is { message: string } {
    return (
        typeof obj === 'object' &&
        obj !== null &&
        'message' in obj &&
        typeof (obj as { message: unknown }).message === 'string'
    );
}
