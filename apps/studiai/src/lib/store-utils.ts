/**
 * Type-safe store creation utility for Zustand
 *
 * This module provides a wrapper around Zustand's create function
 * that enforces proper TypeScript typing and provides additional
 * functionality like automatic persisting with type safety.
 */

import { create } from 'zustand';
import type { StateCreator, StoreApi } from 'zustand';
import { persist } from 'zustand/middleware';
import type { PersistOptions } from 'zustand/middleware';

/**
 * Enhanced type-safe store creation
 *
 * @param initializer Store state creator function
 * @returns Store hook with proper type inference
 */
export function createStore<T extends object>(
  initializer: StateCreator<T, [], []>
): StoreApi<T> {
  return create<T>(initializer);
}

/**
 * Options for persistable store
 */
export interface PersistStoreOptions<T> {
  /** Storage name for persistence */
  name: string;

  /** Optional function to filter properties that should be persisted */
  partialize?: (state: T) => Partial<T>;

  /** Custom storage implementation (defaults to localStorage) */
  storage?: PersistOptions<T, unknown>['storage'];
}

/**
 * Create a persistable store with typed options
 *
 * @param initializer Store state and actions creator
 * @param options Store persistence options
 * @returns Persisted store hook
 */
export function createPersistStore<T extends object>(
  initializer: StateCreator<T, [], []>,
  options: PersistStoreOptions<T>
): StoreApi<T> {
  const persistOptions: PersistOptions<T, unknown> = {
    name: options.name,
    ...(options.partialize != null && { partialize: options.partialize }),
    ...(options.storage != null && { storage: options.storage }),
  };

  return create<T>()(persist(initializer, persistOptions));
}

/**
 * Create a store slice for use in a larger store
 *
 * @param stateCreator Function that creates a portion of the state
 * @returns Store slice creator
 */
export function createStoreSlice<T extends object, U extends object = T>(
  stateCreator: (
    set: StoreApi<U>['setState'],
    get: StoreApi<U>['getState']
  ) => T
): StateCreator<U, [], [], T> {
  return (set, get) => ({
    ...stateCreator(set, get),
  });
}
