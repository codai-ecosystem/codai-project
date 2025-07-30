'use client';

import dynamic from 'next/dynamic';

import { LoadingSpinner } from './LoadingSpinner';

const ComboBox = dynamic(() => import('./ComboBox').then(mod => ({ default: mod.ComboBox })), {
  loading: () => <LoadingSpinner className="h-8 w-8" />,
  ssr: false,
}) as any; // Type assertion to avoid complex type inference issues

export default ComboBox;
export { ComboBox };
