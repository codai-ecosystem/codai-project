/**
 * MemorAI SDK - Retry Service
 * 
 * Handles retry logic for API calls with exponential backoff
 */

import { MemorAIError } from '../types/index.js';

export interface RetryOptions {
    maxRetries: number;
    initialDelay: number;
    maxDelay: number;
    exponentialBase: number;
    retryCondition: (error: any) => boolean;
}

export class RetryService {
    private maxRetries: number;
    private initialDelay: number;
    private maxDelay: number;
    private exponentialBase: number;
    private retryCondition: (error: any) => boolean;

    constructor(maxRetries: number = 3, options?: Partial<RetryOptions>) {
        this.maxRetries = maxRetries;
        this.initialDelay = options?.initialDelay || 1000;
        this.maxDelay = options?.maxDelay || 30000;
        this.exponentialBase = options?.exponentialBase || 2;
        this.retryCondition = options?.retryCondition || this.defaultRetryCondition;
    }

    /**
     * Execute a function with retry logic
     */
    async executeWithRetry<T>(fn: () => Promise<T>): Promise<T> {
        let lastError: any;

        for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
            try {
                return await fn();
            } catch (error) {
                lastError = error;

                // Don't retry on last attempt
                if (attempt === this.maxRetries) {
                    break;
                }

                // Check if we should retry this error
                if (!this.retryCondition(error)) {
                    break;
                }

                // Calculate delay with exponential backoff
                const delay = this.calculateDelay(attempt);

                const errorMessage = error instanceof Error ? error.message : String(error);
                console.warn(`Attempt ${attempt + 1} failed, retrying in ${delay}ms:`, errorMessage);

                // Wait before retrying
                await this.sleep(delay);
            }
        }

        // If we got here, all retries failed
        throw this.formatRetryError(lastError, this.maxRetries);
    }

    /**
     * Default retry condition - retry on network errors and 5xx status codes
     */
    private defaultRetryCondition(error: any): boolean {
        // Network errors
        if (error.code === 'ECONNRESET' ||
            error.code === 'ECONNREFUSED' ||
            error.code === 'ETIMEDOUT' ||
            error.code === 'ENOTFOUND') {
            return true;
        }

        // HTTP errors
        if (error.response?.status) {
            const status = error.response.status;

            // Retry on 5xx server errors
            if (status >= 500 && status <= 599) {
                return true;
            }

            // Retry on 429 (rate limited)
            if (status === 429) {
                return true;
            }

            // Retry on 408 (request timeout)
            if (status === 408) {
                return true;
            }
        }

        // Don't retry client errors (4xx) except for the above
        return false;
    }

    /**
     * Calculate delay with exponential backoff and jitter
     */
    private calculateDelay(attempt: number): number {
        const exponentialDelay = this.initialDelay * Math.pow(this.exponentialBase, attempt);

        // Add jitter (random factor between 0.5 and 1.5)
        const jitter = 0.5 + Math.random();
        const delayWithJitter = exponentialDelay * jitter;

        // Cap at max delay
        return Math.min(delayWithJitter, this.maxDelay);
    }

    /**
     * Sleep for specified milliseconds
     */
    private sleep(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Format retry error with additional context
     */
    private formatRetryError(originalError: any, maxRetries: number): MemorAIError {
        return {
            code: 'RETRY_EXHAUSTED',
            message: `Request failed after ${maxRetries} retries`,
            details: {
                originalError: {
                    message: originalError.message,
                    code: originalError.code,
                    status: originalError.response?.status,
                    data: originalError.response?.data
                },
                maxRetries,
                retryStrategy: 'exponential_backoff'
            },
            timestamp: new Date()
        };
    }

    /**
     * Create a custom retry service with specific options
     */
    static create(options: Partial<RetryOptions> & { maxRetries: number }): RetryService {
        return new RetryService(options.maxRetries, options);
    }

    /**
     * Create a retry service for critical operations (more aggressive)
     */
    static createForCriticalOperations(): RetryService {
        return new RetryService(5, {
            initialDelay: 500,
            maxDelay: 10000,
            exponentialBase: 1.5,
            retryCondition: (error) => {
                // More aggressive retry for critical operations
                if (error.response?.status) {
                    const status = error.response.status;
                    // Retry on all 5xx and some 4xx errors
                    return status >= 500 || status === 429 || status === 408 || status === 503;
                }
                return true; // Retry network errors
            }
        });
    }

    /**
     * Create a retry service for non-critical operations (less aggressive)
     */
    static createForNonCriticalOperations(): RetryService {
        return new RetryService(2, {
            initialDelay: 2000,
            maxDelay: 8000,
            exponentialBase: 2,
            retryCondition: (error) => {
                // Less aggressive retry for non-critical operations
                if (error.response?.status) {
                    const status = error.response.status;
                    // Only retry on 5xx server errors and rate limiting
                    return status >= 500 || status === 429;
                }
                return false; // Don't retry network errors for non-critical ops
            }
        });
    }

    /**
     * Get current configuration
     */
    getConfig(): RetryOptions {
        return {
            maxRetries: this.maxRetries,
            initialDelay: this.initialDelay,
            maxDelay: this.maxDelay,
            exponentialBase: this.exponentialBase,
            retryCondition: this.retryCondition
        };
    }
}
