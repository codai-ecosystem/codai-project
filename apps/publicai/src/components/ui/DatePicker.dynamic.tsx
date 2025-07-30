'use client';

import dynamic from 'next/dynamic';

import { LoadingSpinner } from './LoadingSpinner';

// Export types
export type { CalendarProps, DatePickerProps, DateRangePickerProps } from './DatePicker';

export const DatePicker = dynamic(
  () => import('./DatePicker').then(mod => ({ default: mod.DatePicker })),
  { loading: () => <LoadingSpinner className="h-8 w-8" />, ssr: false }
);

export const DateRangePicker = dynamic(
  () => import('./DatePicker').then(mod => ({ default: mod.DateRangePicker })),
  { loading: () => <LoadingSpinner className="h-8 w-8" />, ssr: false }
);

export const Calendar = dynamic(
  () => import('./DatePicker').then(mod => ({ default: mod.Calendar })),
  { loading: () => <LoadingSpinner className="h-8 w-8" />, ssr: false }
);
