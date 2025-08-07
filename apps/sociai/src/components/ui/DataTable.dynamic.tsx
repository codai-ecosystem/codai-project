'use client'

import React from 'react';

import dynamic from 'next/dynamic';
import type { ComponentType } from 'react';
import { LoadingSpinner } from './LoadingSpinner';

// Export DataTable as dynamic component
export const DataTable: ComponentType<any> = dynamic(
  () => import('./DataTable').then(mod => ({ default: mod.DataTable })),
  {
    loading: () => <LoadingSpinner className="h-8 w-8" />,
    ssr: false,
  }
);

// Default export for backward compatibility
export default DataTable;

