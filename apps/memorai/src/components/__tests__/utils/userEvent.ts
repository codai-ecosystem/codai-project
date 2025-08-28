/**
 * Shared userEvent setup utility to prevent clipboard conflicts
 * Follows Microsoft testing best practices for consistent user interaction simulation
 */

import { vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import type { UserEvent } from '@testing-library/user-event';

let globalUser: UserEvent | null = null;

/**
 * Get or create a shared userEvent instance
 * Works with the configurable clipboard mock from setup.ts
 */
export function getSharedUserEvent(): UserEvent {
  if (!globalUser) {
    globalUser = userEvent.setup({
      // Microsoft best practice: Enable all interaction types
      skipHover: false,
      skipClick: false,
      skipAutoClose: false,
      
      // Work with configurable clipboard mock from setup.ts
      writeToClipboard: true, // Enable since setup.ts makes clipboard configurable
      
      // Microsoft accessibility: Respect user's reduced motion preferences
      advanceTimers: (time: number) => vi.advanceTimersByTime(time),
      
      // Microsoft performance: Reasonable delays for testing
      delay: null, // No delay for faster tests
      
      // Microsoft reliability: Handle edge cases
      applyAccept: true,
      autoModify: true,
    });
  }
  return globalUser;
}

/**
 * Reset the shared userEvent instance (use in afterEach cleanup)
 */
export function resetSharedUserEvent(): void {
  globalUser = null;
}

/**
 * Create a fresh userEvent instance for isolated tests
 * Use this only when test isolation is critical
 */
export function createIsolatedUserEvent(options: Parameters<typeof userEvent.setup>[0] = {}): UserEvent {
  return userEvent.setup({
    skipHover: false,
    skipClick: false,
    skipAutoClose: false,
    writeToClipboard: true, // Works with configurable clipboard
    delay: null,
    ...options,
  });
}