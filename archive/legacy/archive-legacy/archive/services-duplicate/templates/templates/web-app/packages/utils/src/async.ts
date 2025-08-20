import { debounce as lodashDebounce, throttle as lodashThrottle } from 'lodash';

/**
 * Debounce a function call
 */
export const debounce = lodashDebounce;

/**
 * Throttle a function call
 */
export const throttle = lodashThrottle;

/**
 * Sleep for a given number of milliseconds
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Retry a function with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  baseDelay = 1000,
  maxDelay = 10000
): Promise<T> {
  let retries = 0;

  while (retries < maxRetries) {
    try {
      return await fn();
    } catch (error) {
      retries++;

      if (retries >= maxRetries) {
        throw error;
      }

      const delay = Math.min(baseDelay * Math.pow(2, retries - 1), maxDelay);
      await sleep(delay);
    }
  }

  throw new Error('Max retries exceeded');
}

/**
 * Create a promise that resolves after a timeout
 */
export function timeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_resolve, reject) =>
      setTimeout(() => reject(new Error(`Timeout after ${ms}ms`)), ms)
    ),
  ]);
}

/**
 * Execute functions in sequence with delay between them
 */
export async function sequence<T>(fns: Array<() => Promise<T>>, delay = 0): Promise<T[]> {
  const results: T[] = [];

  for (const fn of fns) {
    results.push(await fn());
    if (delay > 0) {
      await sleep(delay);
    }
  }

  return results;
}
