/**
 * Legacy Mock Types - DEPRECATED
 *
 * This file is deprecated. Please use the new type definitions:
 * - firebase-mocks.ts for Firebase mock types
 * - radix-mocks.ts for Radix UI mock types
 *
 * These types are kept for backward compatibility during migration.
 */

import type { ReactNode } from 'react';
import React from 'react';

// Re-export new types for backward compatibility
export type {
  MockSelectGroupProps,
  MockSelectRootProps,
  MockSelectTriggerProps,
  MockSelectValueProps,
} from './radix-mocks';

export type {
  FirebaseMockImplementations,
  MockCollectionReference,
  MockDocumentReference,
  MockDocumentSnapshot,
  MockQuerySnapshot,
} from './firebase-mocks';

// Legacy types - will be removed in future versions
export interface MockSelectContentProps
  extends React.HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  className?: string;
  position?: 'item-aligned' | 'popper';
}

export interface MockSelectLabelProps
  extends React.HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  className?: string;
}

export interface MockSelectItemProps
  extends React.HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  value: string;
  className?: string;
  disabled?: boolean;
}

export interface MockSelectSeparatorProps
  extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}
