'use client';

import dynamic from 'next/dynamic';

import { LoadingSpinner } from './LoadingSpinner';

// Export types and hooks directly (not dynamically)
export type {
  Column,
  SortConfig,
  FilterConfig,
  PaginationConfig,
  EnhancedDataTableProps,
  UseEnhancedDataTableReturn
} from './EnhancedDataTable';

export { useEnhancedDataTable } from './EnhancedDataTable';

export const EnhancedDataTable = dynamic(
  () => import('./EnhancedDataTable').then(mod => ({ default: mod.EnhancedDataTable })),
  { loading: () => <LoadingSpinner className="h-8 w-8" />, ssr: false }
);
