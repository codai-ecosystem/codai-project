/**
 * Radix UI Mock Type Definitions
 * Provides strict TypeScript types for Radix UI component mocks in tests
 */

import React from 'react';

// Common props that all Radix components might have
export interface BaseRadixProps {
  children?: React.ReactNode;
  className?: string;
  asChild?: boolean;
}

// Select component mock types
export interface MockSelectRootProps extends BaseRadixProps {
  value?: string;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
  name?: string;
  defaultValue?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export interface MockSelectTriggerProps extends BaseRadixProps {
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  onKeyDown?: (event: React.KeyboardEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
  'aria-expanded'?: boolean;
  'aria-haspopup'?:
    | boolean
    | 'true'
    | 'false'
    | 'menu'
    | 'listbox'
    | 'tree'
    | 'grid'
    | 'dialog';
}

export interface MockSelectValueProps extends BaseRadixProps {
  placeholder?: string;
}

export interface MockSelectContentProps extends BaseRadixProps {
  position?: 'popper' | 'item-aligned';
  side?: 'top' | 'right' | 'bottom' | 'left';
  align?: 'start' | 'center' | 'end';
}

export interface MockSelectGroupProps extends BaseRadixProps {}

export interface MockSelectItemProps extends BaseRadixProps {
  value: string;
  disabled?: boolean;
  onSelect?: () => void;
}

export interface MockSelectLabelProps extends BaseRadixProps {}

export interface MockSelectSeparatorProps extends BaseRadixProps {}

// Dialog component mock types
export interface MockDialogRootProps extends BaseRadixProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  modal?: boolean;
}

export interface MockDialogTriggerProps extends BaseRadixProps {
  onClick?: (event: React.MouseEvent) => void;
}

export interface MockDialogPortalProps extends BaseRadixProps {
  container?: HTMLElement;
}

export interface MockDialogOverlayProps extends BaseRadixProps {
  onClick?: (event: React.MouseEvent) => void;
}

export interface MockDialogContentProps extends BaseRadixProps {
  onEscapeKeyDown?: (event: KeyboardEvent) => void;
  onInteractOutside?: (event: Event) => void;
}

export interface MockDialogHeaderProps extends BaseRadixProps {}
export interface MockDialogFooterProps extends BaseRadixProps {}
export interface MockDialogTitleProps extends BaseRadixProps {}
export interface MockDialogDescriptionProps extends BaseRadixProps {}
export interface MockDialogCloseProps extends BaseRadixProps {
  onClick?: (event: React.MouseEvent) => void;
}

// Checkbox component mock types
export interface MockCheckboxRootProps extends BaseRadixProps {
  checked?: boolean | 'indeterminate';
  onCheckedChange?: (checked: boolean | 'indeterminate') => void;
  disabled?: boolean;
  name?: string;
  value?: string;
  required?: boolean;
}

export interface MockCheckboxIndicatorProps extends BaseRadixProps {}

// Input component mock types (for custom components)
export interface MockInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'children'> {
  error?: string;
  helperText?: string;
}

// Generic mock component props
export interface MockComponentProps extends BaseRadixProps {
  [key: string]: unknown;
}

// Mock ref types
export type MockRefCallback<T = HTMLElement> = React.RefCallback<T>;
export type MockRef<T = HTMLElement> = React.MutableRefObject<T | null>;

// Helper type for creating mock components
export type MockComponent<P = MockComponentProps> = React.ComponentType<P>;

// Animation/Motion mock types (for framer-motion)
export interface MockMotionProps extends BaseRadixProps {
  initial?: Record<string, unknown>;
  animate?: Record<string, unknown>;
  exit?: Record<string, unknown>;
  transition?: Record<string, unknown>;
  variants?: Record<string, Record<string, unknown>>;
}

export interface MockAnimatePresenceProps {
  children: React.ReactNode;
  mode?: 'wait' | 'sync' | 'popLayout';
  onExitComplete?: () => void;
}
