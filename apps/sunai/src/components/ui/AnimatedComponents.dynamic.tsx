'use client'

import React from 'react';

import dynamic from 'next/dynamic';
import { LoadingSpinner } from './LoadingSpinner';

const AnimatedComponents = dynamic(
  () => import('./AnimatedComponents.default'),
  {
    loading: () => <LoadingSpinner className="h-8 w-8" />,
    ssr: false,
  }
);

export default AnimatedComponents;
export { AnimatedComponents };

