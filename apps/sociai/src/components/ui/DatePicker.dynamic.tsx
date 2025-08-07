'use client'

import React from 'react';

import dynamic from 'next/dynamic';
import type { ComponentType } from 'react';

import { LoadingSpinner } from './LoadingSpinner';

// Export DatePicker as dynamic component
export const DatePicker: ComponentType<any> = dynamic(
  () => import('./DatePicker').then(mod => ({ default: mod.DatePicker })),
  {
    loading: () => <LoadingSpinner className="h-8 w-8" />,
    ssr: false,
  }
);

// Export DateRangePicker as dynamic component
export const DateRangePicker: ComponentType<any> = dynamic(
  () => import('./DatePicker').then(mod => ({ default: mod.DateRangePicker })),
  {
    loading: () => <LoadingSpinner className="h-8 w-8" />,
    ssr: false,
  }
);

// Export Calendar as dynamic component
export const Calendar: ComponentType<any> = dynamic(
  () => import('./DatePicker').then(mod => ({ default: mod.Calendar })),
  {
    loading: () => <LoadingSpinner className="h-8 w-8" />,
    ssr: false,
  }
);

// Default export for backward compatibility
export default DatePicker;

