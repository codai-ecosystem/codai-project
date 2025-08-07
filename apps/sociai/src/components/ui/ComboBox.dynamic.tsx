'use client'

import React from 'react';

import dynamic from 'next/dynamic';
import type { ComponentType } from 'react';

import { LoadingSpinner } from './LoadingSpinner';
import type { ComboBox as ComboBoxType } from './ComboBox';

// Export ComboBox as dynamic component  
export const ComboBox: ComponentType<any> = dynamic(
  () => import('./ComboBox').then(mod => ({ default: mod.ComboBox })),
  {
    loading: () => <LoadingSpinner className="h-8 w-8" />,
    ssr: false,
  }
);

// Export MultiSelect as dynamic component
export const MultiSelect: ComponentType<any> = dynamic(
  () => import('./ComboBox').then(mod => ({ default: mod.MultiSelect })),
  {
    loading: () => <LoadingSpinner className="h-8 w-8" />,
    ssr: false,
  }
);

// Default export for backward compatibility
export default ComboBox;

