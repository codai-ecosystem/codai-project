'use client';

import dynamic from 'next/dynamic';

import { LoadingSpinner } from './LoadingSpinner';

// Export EnhancedDataTable as dynamic component
export const EnhancedDataTable = dynamic(
  () => import('./EnhancedDataTable').then(mod => ({ default: mod.EnhancedDataTable })),
  {
    loading: () => <LoadingSpinner className="h-8 w-8" />,
    ssr: false,
  }
);

// Re-export hooks directly (hooks can't be dynamic components)
export { useEnhancedDataTable, useVirtualScrolling } from './EnhancedDataTable';

// Default export for backward compatibility
export default EnhancedDataTable;
