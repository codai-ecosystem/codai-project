'use client';

import dynamic from 'next/dynamic';
import type { ComponentType, ComponentProps } from 'react';

import { LoadingSpinner } from './LoadingSpinner';

// Extract prop types from the component signatures
import { DatePicker as DatePickerComponent, Calendar as CalendarComponent, DateRangePicker as DateRangePickerComponent } from './DatePicker';

type DatePickerProps = ComponentProps<typeof DatePickerComponent>;
type CalendarProps = ComponentProps<typeof CalendarComponent>;
type DateRangePickerProps = ComponentProps<typeof DateRangePickerComponent>;

const DatePicker: ComponentType<DatePickerProps> = dynamic(
  () => import('./DatePicker').then((mod) => ({ default: mod.DatePicker })),
  {
    loading: () => <LoadingSpinner className="h-8 w-8" />,
    ssr: false,
  }
);

export const Calendar: ComponentType<CalendarProps> = dynamic(
  () => import('./DatePicker').then((mod) => ({ default: mod.Calendar })),
  {
    loading: () => <LoadingSpinner className="h-8 w-8" />,
    ssr: false,
  }
);

const DateRangePicker: ComponentType<DateRangePickerProps> = dynamic(
  () => import('./DatePicker').then((mod) => ({ default: mod.DateRangePicker })),
  {
    loading: () => <LoadingSpinner className="h-8 w-8" />,
    ssr: false,
  }
);

export default DatePicker;
export { DatePicker, DateRangePicker };
