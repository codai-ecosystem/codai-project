'use client';

import dynamic from 'next/dynamic';

import { LoadingSpinner } from './LoadingSpinner';

// Export ComboBox as dynamic component
export const ComboBox = dynamic(
  () => import('./ComboBox').then(mod => ({ default: mod.ComboBox })),
  {
    loading: () => <LoadingSpinner className="h-8 w-8" />,
    ssr: false,
  }
);

// Export MultiSelect as dynamic component
export const MultiSelect = dynamic(
  () => import('./ComboBox').then(mod => ({ default: mod.MultiSelect })),
  {
    loading: () => <LoadingSpinner className="h-8 w-8" />,
    ssr: false,
  }
);

// Default export for backward compatibility
export default ComboBox;
