'use client';

import dynamic from 'next/dynamic';

import { LoadingSpinner } from './LoadingSpinner';

const DatePicker = dynamic(() => import('./DatePicker').then(mod => ({ default: mod.DatePicker })), {
  loading: () => <LoadingSpinner className="h-8 w-8" />,
  ssr: false,
});

export default DatePicker;
export { DatePicker };
