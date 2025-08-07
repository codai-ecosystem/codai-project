'use client'

import React from 'react';

import dynamic from 'next/dynamic';
import { LoadingSpinner } from './LoadingSpinner';

// Export types
export type { TransitionProps } from './Motion';

export const PageTransition = dynamic(
  () => import('./Motion').then(mod => ({ default: mod.PageTransition })),
  { loading: () => <LoadingSpinner className="h-8 w-8" />, ssr: false }
);

export const FadeTransition = dynamic(
  () => import('./Motion').then(mod => ({ default: mod.FadeTransition })),
  { loading: () => <LoadingSpinner className="h-8 w-8" />, ssr: false }
);

