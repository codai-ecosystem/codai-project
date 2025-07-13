import { ZodError } from 'zod';

import { env } from './env';

import type { FastifyError, FastifyReply, FastifyRequest } from 'fastify';

interface ErrorResponse {
  error: string;
  message: string;
  statusCode: number;
  details?: unknown;
}

/**
 * Create error response based on error type
 */
function createErrorResponse(error: FastifyError | ZodError | Error): {
  statusCode: number;
  errorResponse: ErrorResponse;
} {
  if ('validation' in error) {
    return {
      statusCode: 400,
      errorResponse: {
        error: 'Validation Error',
        message: 'The request data failed validation',
        statusCode: 400,
        details: error.validation,
      },
    };
  }

  if (error instanceof ZodError) {
    return {
      statusCode: 400,
      errorResponse: {
        error: 'Validation Error',
        message: 'The request data failed validation',
        statusCode: 400,
        details: error.errors,
      },
    };
  }

  if ('statusCode' in error && typeof error.statusCode === 'number') {
    return {
      statusCode: error.statusCode,
      errorResponse: {
        error: error.name || 'Error',
        message: error.message,
        statusCode: error.statusCode,
      },
    };
  }

  return {
    statusCode: 500,
    errorResponse: {
      error: error.name || 'Internal Server Error',
      message:
        env.NODE_ENV === 'production'
          ? 'An unexpected error occurred'
          : error.message || 'Unknown error',
      statusCode: 500,
    },
  };
}

/**
 * Global error handler for Fastify
 * Ensures consistent error responses across the API
 */
export function errorHandler(
  error: FastifyError | ZodError | Error,
  _request: FastifyRequest,
  reply: FastifyReply
): void {
  const { statusCode, errorResponse } = createErrorResponse(error);
  // Add stack trace in development
  if (env.NODE_ENV !== 'production' && error.stack !== undefined && error.stack.trim().length > 0) {
    errorResponse.details = {
      stack: error.stack.split('\n').map(line => line.trim()),
    };
  }
  // Send the error response
  void reply.code(statusCode).send(errorResponse);
}
