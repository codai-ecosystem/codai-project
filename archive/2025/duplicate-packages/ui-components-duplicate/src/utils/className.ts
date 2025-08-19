/**
 * @fileoverview ClassName Utility - Tailwind CSS Class Management
 * @version 1.0.0
 * 
 * Advanced className utility combining clsx and tailwind-merge for optimal class handling.
 * Provides intelligent class deduplication, conditional classes, and variant management.
 */

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Combines clsx and tailwind-merge for intelligent class name handling
 * 
 * Features:
 * - Conditional class application
 * - Class deduplication and conflict resolution
 * - Tailwind CSS specificity handling
 * - TypeScript support with proper type inference
 * 
 * @param inputs - Class values (strings, objects, arrays, conditionals)
 * @returns Merged and optimized class string
 * 
 * @example
 * ```tsx
 * // Basic usage
 * cn('px-4 py-2', 'bg-blue-500', 'text-white')
 * 
 * // Conditional classes
 * cn('base-class', {
 *   'active-class': isActive,
 *   'disabled-class': isDisabled
 * })
 * 
 * // Class override (tailwind-merge handles conflicts)
 * cn('bg-red-500', 'bg-blue-500') // Result: 'bg-blue-500'
 * 
 * // Complex combinations
 * cn(
 *   'px-4 py-2 rounded',
 *   variant === 'primary' && 'bg-blue-500 text-white',
 *   variant === 'secondary' && 'bg-gray-200 text-gray-900',
 *   size === 'large' && 'px-6 py-3 text-lg',
 *   disabled && 'opacity-50 cursor-not-allowed'
 * )
 * ```
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Variant-based class name generator
 * Creates a function that generates classes based on variant configurations
 * 
 * @param base - Base classes always applied
 * @param variants - Variant configuration object
 * @param defaultVariants - Default variant values
 * @returns Function that generates classes based on variant props
 * 
 * @example
 * ```tsx
 * const buttonClasses = createVariants({
 *   base: 'px-4 py-2 rounded focus:outline-none',
 *   variants: {
 *     variant: {
 *       primary: 'bg-blue-500 text-white hover:bg-blue-600',
 *       secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300'
 *     },
 *     size: {
 *       sm: 'px-2 py-1 text-sm',
 *       lg: 'px-6 py-3 text-lg'
 *     }
 *   },
 *   defaultVariants: {
 *     variant: 'primary',
 *     size: 'sm'
 *   }
 * });
 * 
 * // Usage
 * buttonClasses({ variant: 'secondary', size: 'lg' })
 * ```
 */
export interface VariantConfig<T extends Record<string, Record<string, string>>> {
  base?: string;
  variants: T;
  defaultVariants?: Partial<{
    [K in keyof T]: keyof T[K];
  }>;
}

export function createVariants<T extends Record<string, Record<string, string>>>(
  config: VariantConfig<T>
) {
  return (props?: Partial<{
    [K in keyof T]: keyof T[K];
  }> & { className?: string }) => {
    const { className, ...variantProps } = props || {};

    const variantClasses = Object.entries(config.variants).map(([key, variants]) => {
      const variantKey = (variantProps as any)?.[key] || config.defaultVariants?.[key];
      return variantKey ? variants[variantKey as string] : undefined;
    }).filter(Boolean);

    return cn(config.base, ...variantClasses, className);
  };
}

/**
 * Responsive class name generator
 * Generates responsive classes based on breakpoint configuration
 * 
 * @param classes - Object mapping breakpoints to class names
 * @returns Merged responsive class string
 * 
 * @example
 * ```tsx
 * responsive({
 *   default: 'text-sm',
 *   sm: 'text-base',
 *   md: 'text-lg',
 *   lg: 'text-xl'
 * })
 * // Result: 'text-sm sm:text-base md:text-lg lg:text-xl'
 * ```
 */
export function responsive(classes: Partial<{
  default: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
}>): string {
  const { default: defaultClass, ...breakpointClasses } = classes;

  const responsiveClasses = Object.entries(breakpointClasses).map(
    ([breakpoint, className]) => `${breakpoint}:${className}`
  );

  return cn(defaultClass, ...responsiveClasses);
}

/**
 * Animation class builder
 * Constructs animation classes with duration, easing, and delay
 * 
 * @param config - Animation configuration
 * @returns Animation class string
 * 
 * @example
 * ```tsx
 * animation({
 *   name: 'fade-in',
 *   duration: '300ms',
 *   easing: 'ease-in-out',
 *   delay: '100ms'
 * })
 * ```
 */
export interface AnimationConfig {
  name: string;
  duration?: string;
  easing?: string;
  delay?: string;
  fillMode?: 'forwards' | 'backwards' | 'both' | 'none';
  iterationCount?: number | 'infinite';
}

export function animation(config: AnimationConfig): string {
  const {
    name,
    duration = '200ms',
    easing = 'ease-in-out',
    delay = '0ms',
    fillMode = 'forwards',
    iterationCount = 1
  } = config;

  return cn(
    `animate-${name}`,
    `duration-${duration}`,
    `ease-${easing}`,
    delay !== '0ms' && `delay-${delay}`,
    fillMode !== 'forwards' && `fill-${fillMode}`,
    iterationCount !== 1 && `repeat-${iterationCount}`
  );
}

/**
 * Focus-visible class generator
 * Generates accessible focus styles
 * 
 * @param variant - Focus style variant
 * @returns Focus class string
 */
export function focusVisible(variant: 'default' | 'accent' | 'destructive' = 'default'): string {
  const variants = {
    default: 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
    accent: 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2',
    destructive: 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive focus-visible:ring-offset-2'
  };

  return variants[variant];
}

/**
 * Interactive state classes
 * Generates hover, active, and disabled state classes
 * 
 * @param config - Interactive state configuration
 * @returns Interactive class string
 */
export interface InteractiveConfig {
  hover?: string;
  active?: string;
  focus?: string;
  disabled?: string;
}

export function interactive(config: InteractiveConfig): string {
  const { hover, active, focus, disabled } = config;

  return cn(
    hover && `hover:${hover}`,
    active && `active:${active}`,
    focus && `focus:${focus}`,
    disabled && `disabled:${disabled}`,
    'transition-all duration-200 ease-in-out'
  );
}

/**
 * Layout class builder
 * Constructs common layout patterns
 * 
 * @param type - Layout type
 * @param options - Layout options
 * @returns Layout class string
 */
export type LayoutType =
  | 'flex-center'
  | 'flex-between'
  | 'flex-start'
  | 'flex-end'
  | 'grid-center'
  | 'absolute-center'
  | 'sticky-top';

export function layout(
  type: LayoutType,
  options?: {
    direction?: 'row' | 'col';
    gap?: string;
    wrap?: boolean;
  }
): string {
  const { direction = 'row', gap, wrap } = options || {};

  const layouts = {
    'flex-center': cn(
      'flex items-center justify-center',
      direction === 'col' && 'flex-col',
      gap && `gap-${gap}`,
      wrap && 'flex-wrap'
    ),
    'flex-between': cn(
      'flex items-center justify-between',
      direction === 'col' && 'flex-col',
      gap && `gap-${gap}`,
      wrap && 'flex-wrap'
    ),
    'flex-start': cn(
      'flex items-center justify-start',
      direction === 'col' && 'flex-col',
      gap && `gap-${gap}`,
      wrap && 'flex-wrap'
    ),
    'flex-end': cn(
      'flex items-center justify-end',
      direction === 'col' && 'flex-col',
      gap && `gap-${gap}`,
      wrap && 'flex-wrap'
    ),
    'grid-center': cn(
      'grid place-items-center',
      gap && `gap-${gap}`
    ),
    'absolute-center': 'absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
    'sticky-top': 'sticky top-0 z-10'
  };

  return layouts[type];
}

/**
 * Typography class builder
 * Constructs typography classes with responsive scaling
 * 
 * @param config - Typography configuration
 * @returns Typography class string
 */
export interface TypographyConfig {
  size?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl';
  weight?: 'thin' | 'light' | 'normal' | 'medium' | 'semibold' | 'bold' | 'extrabold' | 'black';
  leading?: 'tight' | 'snug' | 'normal' | 'relaxed' | 'loose';
  tracking?: 'tighter' | 'tight' | 'normal' | 'wide' | 'wider' | 'widest';
  color?: string;
  align?: 'left' | 'center' | 'right' | 'justify';
}

export function typography(config: TypographyConfig): string {
  const { size, weight, leading, tracking, color, align } = config;

  return cn(
    size && `text-${size}`,
    weight && `font-${weight}`,
    leading && `leading-${leading}`,
    tracking && `tracking-${tracking}`,
    color && `text-${color}`,
    align && `text-${align}`
  );
}

/**
 * Spacing class builder
 * Constructs margin and padding classes
 * 
 * @param config - Spacing configuration
 * @returns Spacing class string
 */
export interface SpacingConfig {
  m?: string | number;
  mx?: string | number;
  my?: string | number;
  mt?: string | number;
  mr?: string | number;
  mb?: string | number;
  ml?: string | number;
  p?: string | number;
  px?: string | number;
  py?: string | number;
  pt?: string | number;
  pr?: string | number;
  pb?: string | number;
  pl?: string | number;
}

export function spacing(config: SpacingConfig): string {
  const classes: string[] = [];

  Object.entries(config).forEach(([key, value]) => {
    if (value !== undefined) {
      classes.push(`${key}-${value}`);
    }
  });

  return cn(...classes);
}

// Re-export types for external use
export type { ClassValue };

// Utility constants
export const CLASS_CONSTANTS = {
  TRANSITIONS: {
    fast: 'transition-all duration-150 ease-in-out',
    normal: 'transition-all duration-200 ease-in-out',
    slow: 'transition-all duration-300 ease-in-out'
  },
  SHADOWS: {
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg',
    xl: 'shadow-xl'
  },
  BORDERS: {
    default: 'border border-border',
    accent: 'border border-accent',
    destructive: 'border border-destructive'
  },
  FOCUS: {
    default: focusVisible('default'),
    accent: focusVisible('accent'),
    destructive: focusVisible('destructive')
  }
} as const;
