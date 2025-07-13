import { act } from '@testing-library/react';
import * as zustand from 'zustand';

// A variable to hold reset functions for all stores declared in tests
const storeResetFns = new Set<() => void>();

// When creating a store, add its reset function to the Set
const actualCreate = jest.requireActual('zustand').create;

// Mock version of create that captures the store for resetting
export const create = ((storeCreator?: unknown) => {
  // Handle the chained call pattern used with middleware
  if (storeCreator === undefined) {
    return (middlewaredStoreCreator: unknown) => {
      // Use the actual create function
      const store = actualCreate(middlewaredStoreCreator);
      const initialState = store.getState();

      // Create a reset function for this store
      storeResetFns.add(() => {
        store.setState(initialState, true);
      });

      return store;
    };
  }

  // Handle the direct call pattern
  const store = actualCreate(storeCreator);
  const initialState = store.getState();

  // Create a reset function for this store
  storeResetFns.add(() => {
    store.setState(initialState, true);
  });

  return store;
}) as typeof zustand.create;

// Reset all stores to their initial values after each test
afterEach(() => {
  act(() => {
    storeResetFns.forEach(resetFn => {
      resetFn();
    });
  });
});

// Re-export everything from the actual zustand
export * from 'zustand';

