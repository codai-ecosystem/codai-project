'use client'

import React from 'react';

import dynamic from 'next/dynamic';

import { LoadingSpinner } from './LoadingSpinner';

const EnhancedDataTable = dynamic(
  () => import('./EnhancedDataTable').then((mod) => ({ default: mod.EnhancedDataTable })),
  {
    loading: () => <LoadingSpinner className="h-8 w-8" />,
    ssr: false,
  }
);

export default EnhancedDataTable;
export { EnhancedDataTable };

// Re-export hooks directly (not as dynamic imports)
export { useEnhancedDataTable, useVirtualScrolling } from './EnhancedDataTable';

// Re-export types
export type {
  Column,
  SortConfig,
  FilterConfig,
  PaginationConfig,
  EnhancedDataTableProps,
} from './EnhancedDataTable';

