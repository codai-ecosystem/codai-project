'use client'

import React from 'react';

import dynamic from 'next/dynamic';

import { LoadingSpinner } from './LoadingSpinner';

// Export types
export type { ComboBoxOption, ComboBoxProps, MultiSelectProps } from './ComboBox';

export const ComboBox = dynamic(
  () => import('./ComboBox').then(mod => ({ default: mod.ComboBox })),
  { loading: () => <LoadingSpinner className="h-8 w-8" />, ssr: false }
);

export const MultiSelect = dynamic(
  () => import('./ComboBox').then(mod => ({ default: mod.MultiSelect })),
  { loading: () => <LoadingSpinner className="h-8 w-8" />, ssr: false }
);

