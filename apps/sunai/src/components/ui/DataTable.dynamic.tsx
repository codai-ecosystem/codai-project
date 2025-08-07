'use client'

import React from 'react';

import dynamic from 'next/dynamic';
import { LoadingSpinner } from './LoadingSpinner';

const DataTable = dynamic(() => import('./DataTable'), {
  loading: () => <LoadingSpinner className="h-8 w-8" />,
  ssr: false,
});

export default DataTable;
export { DataTable };

