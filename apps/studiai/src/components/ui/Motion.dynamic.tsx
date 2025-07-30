'use client';

import dynamic from 'next/dynamic';
import type { ComponentType, ComponentProps } from 'react';
import { LoadingSpinner } from './LoadingSpinner';

// Extract prop types from the component signatures
import { PageTransition as PageTransitionComponent, FadeTransition as FadeTransitionComponent } from './Motion';

type TransitionProps = ComponentProps<typeof PageTransitionComponent>;

const PageTransition: ComponentType<TransitionProps> = dynamic(
  () => import('./Motion').then((mod) => ({ default: mod.PageTransition })),
  {
    loading: () => <LoadingSpinner className="h-8 w-8" />,
    ssr: false,
  }
);

const FadeTransition: ComponentType<TransitionProps> = dynamic(
  () => import('./Motion').then((mod) => ({ default: mod.FadeTransition })),
  {
    loading: () => <LoadingSpinner className="h-8 w-8" />,
    ssr: false,
  }
);

export { PageTransition, FadeTransition };
export default PageTransition;
