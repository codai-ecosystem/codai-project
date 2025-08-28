/**
 * @fileoverview Error Handling Middleware
 * @author Cautai Team
 * @version 1.0.0
 */

import { FastifyInstance, FastifyError, FastifyRequest, FastifyReply } from 'fastify';

interface ErrorResponse {
  error: string;
  message: string;
  statusCode: number;
  timestamp: string;
  path?: string;
}

export const errorHandler = (
  error: FastifyError,
  request: FastifyRequest,
  reply: FastifyReply
): void => {
  const statusCode = error.statusCode || 500;
  
  // Log error details
  request.log.error({
    error: error.message,
    stack: error.stack,
    url: request.url,
    method: request.method,
    statusCode,
  });
  
  const errorResponse: ErrorResponse = {
    error: getErrorName(statusCode),
    message: error.message || 'Internal Server Error',
    statusCode,
    timestamp: new Date().toISOString(),
    path: request.url,
  };
  
  // Don't expose sensitive information in production
  if (process.env.NODE_ENV === 'production' && statusCode === 500) {
    errorResponse.message = 'Internal Server Error';
  }
  
  reply.status(statusCode).send(errorResponse);
};

function getErrorName(statusCode: number): string {
  switch (statusCode) {
    case 400:
      return 'Bad Request';
    case 401:
      return 'Unauthorized';
    case 403:
      return 'Forbidden';
    case 404:
      return 'Not Found';
    case 409:
      return 'Conflict';
    case 422:
      return 'Unprocessable Entity';
    case 429:
      return 'Too Many Requests';
    case 500:
      return 'Internal Server Error';
    case 502:
      return 'Bad Gateway';
    case 503:
      return 'Service Unavailable';
    default:
      return 'Error';
  }
}