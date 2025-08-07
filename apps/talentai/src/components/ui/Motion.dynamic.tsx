'use client'

import React from 'react';

import dynamic from 'next/dynamic';
import { LoadingSpinner } from './LoadingSpinner';

const Motion = dynamic(() => import('./Motion').then(mod => ({ default: mod.PageTransition })), {
  loading: () => <LoadingSpinner className="h-8 w-8" />,
  ssr: false,
});

export default Motion;
export { Motion };

