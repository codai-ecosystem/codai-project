/**
 * Jest type definitions
 *
 * This module provides proper type definitions for Jest functions
 * used in testing environment.
 */

// Jest mock function type
export type MockFunction<
  T extends (...args: unknown[]) => unknown = (...args: unknown[]) => unknown,
> = T & {
  mockClear: () => void;
  mockReset: () => void;
  mockRestore: () => void;
  mockImplementation: (fn: T) => MockFunction<T>;
  mockImplementationOnce: (fn: T) => MockFunction<T>;
  mockReturnValue: <R extends ReturnType<T>>(value: R) => MockFunction<T>;
  mockReturnValueOnce: <R extends ReturnType<T>>(value: R) => MockFunction<T>;
  mockResolvedValue: <R extends Awaited<ReturnType<T>>>(
    value: R
  ) => MockFunction<T>;
  mockResolvedValueOnce: <R extends Awaited<ReturnType<T>>>(
    value: R
  ) => MockFunction<T>;
  mockRejectedValue: (value: Error | unknown) => MockFunction<T>;
  mockRejectedValueOnce: (value: Error | unknown) => MockFunction<T>;
  mock: {
    calls: Parameters<T>[];
    instances: ThisParameterType<T>[];
    invocationCallOrder: number[];
    results: Array<{ type: 'return' | 'throw'; value: ReturnType<T> | Error }>;
  };
};

// Jest global object interface
export interface JestGlobal {
  fn: <T extends (...args: unknown[]) => unknown>(
    implementation?: T
  ) => MockFunction<T>;
  mock: (
    moduleName: string,
    factory?: () => unknown,
    options?: { virtual?: boolean }
  ) => void;
  unmock: (moduleName: string) => void;
  clearAllMocks: () => void;
  resetAllMocks: () => void;
  restoreAllMocks: () => void;
  resetModules: () => void;
  spyOn: <T extends Record<string, unknown>, M extends keyof T>(
    object: T,
    method: M
  ) => MockFunction<
    T[M] extends (...args: unknown[]) => unknown ? T[M] : () => void
  >;
}

// Export jest type for global usage
export type Jest = JestGlobal;

// Common test helper types
export interface MockedFunction<T extends (...args: unknown[]) => unknown> {
  mockClear: () => MockedFunction<T>;
  mockReset: () => MockedFunction<T>;
  mockRestore: () => void;
  mockImplementation: (
    fn: (...args: Parameters<T>) => ReturnType<T>
  ) => MockedFunction<T>;
  mockImplementationOnce: (
    fn: (...args: Parameters<T>) => ReturnType<T>
  ) => MockedFunction<T>;
  mockReturnValue: (value: ReturnType<T>) => MockedFunction<T>;
  mockReturnValueOnce: (value: ReturnType<T>) => MockedFunction<T>;
  mockResolvedValue: (value: Awaited<ReturnType<T>>) => MockedFunction<T>;
  mockResolvedValueOnce: (value: Awaited<ReturnType<T>>) => MockedFunction<T>;
  mockRejectedValue: (reason: unknown) => MockedFunction<T>;
  mockRejectedValueOnce: (reason: unknown) => MockedFunction<T>;
  mockName: (name: string) => MockedFunction<T>;
  getMockName: () => string;
  mock: {
    calls: Parameters<T>[][];
    instances: unknown[];
    invocationCallOrder: number[];
    results: Array<{
      type: 'return' | 'throw';
      value: ReturnType<T> | Error;
    }>;
  };
  (...args: Parameters<T>): ReturnType<T>;
}

export interface SpyInstance<T extends (...args: unknown[]) => unknown> {
  mockClear: () => SpyInstance<T>;
  mockReset: () => SpyInstance<T>;
  mockRestore: () => void;
  mockImplementation: (
    fn: (...args: Parameters<T>) => ReturnType<T>
  ) => SpyInstance<T>;
  mockImplementationOnce: (
    fn: (...args: Parameters<T>) => ReturnType<T>
  ) => SpyInstance<T>;
  mockReturnValue: (value: ReturnType<T>) => SpyInstance<T>;
  mockReturnValueOnce: (value: ReturnType<T>) => SpyInstance<T>;
  mockResolvedValue: (value: Awaited<ReturnType<T>>) => SpyInstance<T>;
  mockResolvedValueOnce: (value: Awaited<ReturnType<T>>) => SpyInstance<T>;
  mockRejectedValue: (reason: unknown) => SpyInstance<T>;
  mockRejectedValueOnce: (reason: unknown) => SpyInstance<T>;
  mockName: (name: string) => SpyInstance<T>;
  getMockName: () => string;
  mock: {
    calls: Parameters<T>[][];
    instances: unknown[];
    invocationCallOrder: number[];
    results: Array<{
      type: 'return' | 'throw';
      value: ReturnType<T> | Error;
    }>;
  };
}
