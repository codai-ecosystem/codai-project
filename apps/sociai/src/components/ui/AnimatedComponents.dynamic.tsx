'use client';

import dynamic from 'next/dynamic';
import { LoadingSpinner } from './LoadingSpinner';

// Import individual animated components dynamically
export const AnimatedDiv = dynamic(
  () => import('./AnimatedComponents').then(mod => ({ default: mod.AnimatedDiv })),
  {
    loading: () => <LoadingSpinner className="h-8 w-8" />,
    ssr: false,
  }
);

export const PageWrapper = dynamic(
  () => import('./AnimatedComponents').then(mod => ({ default: mod.PageWrapper })),
  {
    loading: () => <LoadingSpinner className="h-8 w-8" />,
    ssr: false,
  }
);

export const FadeIn = dynamic(
  () => import('./AnimatedComponents').then(mod => ({ default: mod.FadeIn })),
  {
    loading: () => <LoadingSpinner className="h-8 w-8" />,
    ssr: false,
  }
);

export const SlideIn = dynamic(
  () => import('./AnimatedComponents').then(mod => ({ default: mod.SlideIn })),
  {
    loading: () => <LoadingSpinner className="h-8 w-8" />,
    ssr: false,
  }
);

export const ScaleIn = dynamic(
  () => import('./AnimatedComponents').then(mod => ({ default: mod.ScaleIn })),
  {
    loading: () => <LoadingSpinner className="h-8 w-8" />,
    ssr: false,
  }
);

// Re-export static utilities that don't need dynamic loading
export const commonVariants = {
  fadeIn: {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  },
  slideUp: {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  },
};

// Default export for backward compatibility
const AnimatedComponents = {
  AnimatedDiv,
  PageWrapper,
  FadeIn,
  SlideIn,
  ScaleIn,
  commonVariants,
};

export default AnimatedComponents;
