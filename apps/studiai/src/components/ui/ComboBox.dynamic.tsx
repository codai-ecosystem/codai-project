'use client';

import dynamic from 'next/dynamic';
import type { ComponentType, ComponentProps } from 'react';

import { LoadingSpinner } from './LoadingSpinner';

// Extract prop types from the component signatures
import { ComboBox as ComboBoxComponent, MultiSelect as MultiSelectComponent } from './ComboBox';

type ComboBoxProps = ComponentProps<typeof ComboBoxComponent>;
type MultiSelectProps = ComponentProps<typeof MultiSelectComponent>;

const ComboBox: ComponentType<ComboBoxProps> = dynamic(
  () => import('./ComboBox').then((mod) => ({ default: mod.ComboBox })),
  {
    loading: () => <LoadingSpinner className="h-8 w-8" />,
    ssr: false,
  }
);

const MultiSelect: ComponentType<MultiSelectProps> = dynamic(
  () => import('./ComboBox').then((mod) => ({ default: mod.MultiSelect })),
  {
    loading: () => <LoadingSpinner className="h-8 w-8" />,
    ssr: false,
  }
);

export default ComboBox;
export { ComboBox, MultiSelect };

// Re-export types
export type { ComboBoxOption } from './ComboBox';
