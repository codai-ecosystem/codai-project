'use client';

import dynamic from 'next/dynamic';

import { LoadingSpinner } from './LoadingSpinner';

const EnhancedDataTable = dynamic(() => import('./EnhancedDataTable').then(mod => ({ default: mod.EnhancedDataTable })), {
  loading: () => <LoadingSpinner className="h-8 w-8" />,
  ssr: false,
});

export default EnhancedDataTable;
export { EnhancedDataTable };
