'use client';

import dynamic from 'next/dynamic';

import { LoadingSpinner } from './LoadingSpinner';

// Export DatePicker as dynamic component
export const DatePicker = dynamic(
  () => import('./DatePicker').then(mod => ({ default: mod.DatePicker })),
  {
    loading: () => <LoadingSpinner className="h-8 w-8" />,
    ssr: false,
  }
);

// Export DateRangePicker as dynamic component
export const DateRangePicker = dynamic(
  () => import('./DatePicker').then(mod => ({ default: mod.DateRangePicker })),
  {
    loading: () => <LoadingSpinner className="h-8 w-8" />,
    ssr: false,
  }
);

// Export Calendar as dynamic component
export const Calendar = dynamic(
  () => import('./DatePicker').then(mod => ({ default: mod.Calendar })),
  {
    loading: () => <LoadingSpinner className="h-8 w-8" />,
    ssr: false,
  }
);

// Default export for backward compatibility
export default DatePicker;
