/**
 * Type-safe utility functions for React components
 */

import type { ComponentProps, ElementType, ReactNode } from 'react';

// Strictly typed component prop helpers
export type StrictComponentProps<T extends ElementType> = ComponentProps<T> & {
  children?: ReactNode;
};

// Type guard utilities
export function isString(value: unknown): value is string {
  return typeof value === 'string';
}

export function isNumber(value: unknown): value is number {
  return typeof value === 'number' && !Number.isNaN(value);
}

export function isBoolean(value: unknown): value is boolean {
  return typeof value === 'boolean';
}

export function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function isArray<T>(value: unknown): value is T[] {
  return Array.isArray(value);
}

export function isFunction(
  value: unknown
): value is (...args: unknown[]) => unknown {
  return typeof value === 'function';
}

export function isDefined<T>(value: T | undefined | null): value is T {
  return value !== undefined && value !== null;
}

export function isNullish(value: unknown): value is null | undefined {
  return value === null || value === undefined;
}

// Assertion functions
export function assertIsString(
  value: unknown,
  message?: string
): asserts value is string {
  if (!isString(value)) {
    throw new Error(message ?? `Expected string, got ${typeof value}`);
  }
}

export function assertIsNumber(
  value: unknown,
  message?: string
): asserts value is number {
  if (!isNumber(value)) {
    throw new Error(message ?? `Expected number, got ${typeof value}`);
  }
}

export function assertIsDefined<T>(
  value: T | undefined | null,
  message?: string
): asserts value is T {
  if (!isDefined(value)) {
    throw new Error(message ?? 'Expected value to be defined');
  }
}

// Utility types for strict prop handling
export type RequiredKeys<T> = {
  [K in keyof T]-?: object extends Pick<T, K> ? never : K;
}[keyof T];

export type OptionalKeys<T> = {
  [K in keyof T]-?: object extends Pick<T, K> ? K : never;
}[keyof T];

export type RequiredProps<T> = Pick<T, RequiredKeys<T>>;
export type OptionalProps<T> = Pick<T, OptionalKeys<T>>;

// Strict event handler types
export type StrictEventHandler<E extends Event = Event> = (event: E) => void;
export type StrictAsyncEventHandler<E extends Event = Event> = (
  event: E
) => Promise<void>;

// Component display name helper
export function setDisplayName<T extends { displayName?: string }>(
  component: T,
  name: string
): T {
  component.displayName = name;
  return component;
}

// Prop validation helpers
export function validateRequiredProps<T extends Record<string, unknown>>(
  props: T,
  requiredKeys: (keyof T)[]
): void {
  for (const key of requiredKeys) {
    if (isNullish(props[key])) {
      throw new Error(`Required prop '${String(key)}' is missing`);
    }
  }
}

// Safe children utilities
export function hasChildren(children: ReactNode): boolean {
  return (
    isDefined(children) &&
    (isString(children) ||
      isNumber(children) ||
      (isArray(children) && children.length > 0) ||
      (isObject(children) && 'type' in children))
  );
}

export function getChildrenCount(children: ReactNode): number {
  if (isArray(children)) {
    return children.length;
  }
  if (hasChildren(children)) {
    return 1;
  }
  return 0;
}

// Error boundary helpers
export function createErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (isString(error)) {
    return error;
  }
  return 'An unknown error occurred';
}

export function logError(error: unknown, context?: string): void {
  const message = createErrorMessage(error);
  const fullMessage =
    context !== undefined && context.length > 0
      ? `${context}: ${message}`
      : message;

  console.error(fullMessage, error);

  // In production, you might want to send to error reporting service
  if (process.env['NODE_ENV'] === 'production') {
    // reportError(error, context);
  }
}
