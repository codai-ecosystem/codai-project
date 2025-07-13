'use client';

import dynamic from 'next/dynamic';
import { LoadingSpinner } from './LoadingSpinner';

// Export PageTransition as dynamic component
export const PageTransition = dynamic(
  () => import('./Motion').then(mod => ({ default: mod.PageTransition })),
  {
    loading: () => <LoadingSpinner className="h-8 w-8" />,
    ssr: false,
  }
);

// Export FadeTransition as dynamic component
export const FadeTransition = dynamic(
  () => import('./Motion').then(mod => ({ default: mod.FadeTransition })),
  {
    loading: () => <LoadingSpinner className="h-8 w-8" />,
    ssr: false,
  }
);

// Default export for backward compatibility
const Motion = {
  PageTransition,
  FadeTransition,
};

export default Motion;
