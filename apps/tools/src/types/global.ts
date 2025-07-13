// Global type definitions for the METU template

import type {
  ComponentPropsWithoutRef,
  ComponentRef,
  ElementRef,
  ReactNode,
} from 'react';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      // Extend with any custom elements if needed
    }

    interface Element
      extends React.ReactElement<
        unknown,
        string | React.JSXElementConstructor<unknown>
      > {}
  }
}

// Common utility types
export type PropsWithChildren<P = object> = P & {
  children?: ReactNode;
};

export type ComponentProps<
  T extends keyof JSX.IntrinsicElements | React.JSXElementConstructor<unknown>,
> = T extends keyof JSX.IntrinsicElements
  ? ComponentPropsWithoutRef<T>
  : T extends React.JSXElementConstructor<infer P>
    ? P
    : never;

export type ElementRefType<
  T extends keyof JSX.IntrinsicElements | React.JSXElementConstructor<unknown>,
> = T extends keyof JSX.IntrinsicElements
  ? ElementRef<T>
  : T extends React.JSXElementConstructor<unknown>
    ? ComponentRef<T>
    : never;

// Polymorphic component types
export type PolymorphicRef<C extends React.ElementType> =
  React.ComponentPropsWithRef<C>['ref'];

export type AsProp<C extends React.ElementType> = {
  as?: C;
};

export type PropsToOmit<C extends React.ElementType, P> = keyof (AsProp<C> & P);

export type PolymorphicComponentProp<
  C extends React.ElementType,
  Props = object,
> = React.PropsWithChildren<Props & AsProp<C>> &
  Omit<React.ComponentPropsWithoutRef<C>, PropsToOmit<C, Props>>;

export type PolymorphicComponentPropWithRef<
  C extends React.ElementType,
  Props = object,
> = PolymorphicComponentProp<C, Props> & { ref?: PolymorphicRef<C> };

// Common prop types
export interface BaseProps {
  className?: string;
  id?: string;
}

export interface VariantProps {
  variant?: string;
  size?: string;
}

// Status types
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

export type Status = 'success' | 'error' | 'warning' | 'info';

// Form types
export interface FormFieldProps {
  name: string;
  label?: string;
  description?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
}

// API types - using existing ApiResponse from api.ts
export interface ApiError {
  message: string;
  code?: string;
  status?: number;
}

// Navigation types
export interface NavigationItem {
  href: string;
  label: string;
  icon?: ReactNode;
  children?: NavigationItem[];
}

// Theme types
export type ThemeMode = 'light' | 'dark' | 'system';

// Responsive types
export type Breakpoint = 'sm' | 'md' | 'lg' | 'xl' | '2xl';

// Animation types
export interface AnimationProps {
  animate?: boolean;
  duration?: number;
  delay?: number;
  easing?: string;
}

// File upload types
export interface FileUploadProps {
  accept?: string[];
  maxSize?: number;
  multiple?: boolean;
  onUpload?: (files: File[]) => void | Promise<void>;
}

// Pagination types
export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  showFirstLast?: boolean;
  showPrevNext?: boolean;
}

// Search types
export interface SearchProps {
  query: string;
  onSearch: (query: string) => void;
  placeholder?: string;
  debounceMs?: number;
}

// Sort types
export type SortDirection = 'asc' | 'desc';

export interface SortConfig<T = string> {
  key: T;
  direction: SortDirection;
}

// Filter types
export interface FilterOption {
  label: string;
  value: string;
  count?: number;
}

export interface FilterGroup {
  key: string;
  label: string;
  options: FilterOption[];
  multiple?: boolean;
}

// Export all types
export type { ComponentPropsWithoutRef, ElementRef, ReactNode };
