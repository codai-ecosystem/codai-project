'use client';

import dynamic from 'next/dynamic';
import { LoadingSpinner } from './LoadingSpinner';

// Export types
export type { DataTableColumn, DataTableProps } from './DataTable';

export const DataTable = dynamic(
  () => import('./DataTable').then(mod => ({ default: mod.DataTable })),
  { loading: () => <LoadingSpinner className="h-8 w-8" />, ssr: false }
);
