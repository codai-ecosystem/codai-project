'use client';

import dynamic from 'next/dynamic';
import { LoadingSpinner } from './LoadingSpinner';

// Export DataTable as dynamic component
export const DataTable = dynamic(
  () => import('./DataTable').then(mod => ({ default: mod.DataTable })),
  {
    loading: () => <LoadingSpinner className="h-8 w-8" />,
    ssr: false,
  }
);

// Default export for backward compatibility
export default DataTable;
