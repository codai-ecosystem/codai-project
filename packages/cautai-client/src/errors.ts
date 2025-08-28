/**
 * @fileoverview Error classes for Cautai Client
 * @author Cautai Team
 * @version 1.0.0
 */

export class CautaiError extends Error {
  constructor(message: string, public code?: string) {
    super(message);
    this.name = 'CautaiError';
  }
}

export class SearchError extends CautaiError {
  constructor(message: string, public query?: string) {
    super(message, 'SEARCH_ERROR');
    this.name = 'SearchError';
  }
}

export class APIError extends CautaiError {
  constructor(message: string, public statusCode?: number) {
    super(message, 'API_ERROR');
    this.name = 'APIError';
  }
}

export class ValidationError extends CautaiError {
  constructor(message: string, public field?: string) {
    super(message, 'VALIDATION_ERROR');
    this.name = 'ValidationError';
  }
}

export class NetworkError extends CautaiError {
  constructor(message: string) {
    super(message, 'NETWORK_ERROR');
    this.name = 'NetworkError';
  }
}