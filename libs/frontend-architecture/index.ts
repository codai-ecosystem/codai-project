// Frontend Architecture Main Export
// Advanced patterns, hooks, and utilities for modern React applications

// Core Architecture Patterns
export * from './src/patterns'

// State Management Solutions
export * from './src/state'

// Advanced Hooks Collection
export * from './src/hooks'

// Utility Functions
export * from './src/utils'

// Type Definitions (to be implemented)
// export * from './src/types'

// Constants and Configuration (to be implemented)
// export * from './src/constants'

// Re-export commonly used external types for convenience
export type {
  ComponentPropsWithoutRef,
  ComponentPropsWithRef,
  ElementRef,
  ForwardRefExoticComponent,
  RefAttributes,
  PropsWithChildren,
  ReactNode,
  ReactElement,
  CSSProperties,
  MouseEvent,
  KeyboardEvent,
  FocusEvent,
  ChangeEvent,
  FormEvent,
  ClipboardEvent,
  DragEvent,
  TouchEvent,
  WheelEvent,
  AnimationEvent,
  TransitionEvent,
  PointerEvent,
} from 'react'

export type {
  NextPage,
  NextPageContext,
  NextApiRequest,
  NextApiResponse,
  GetServerSideProps,
  GetStaticProps,
  GetStaticPaths,
} from 'next'

export type {
  UseQueryResult,
  UseMutationResult,
  QueryClient,
  QueryKey,
  MutationFunction,
  QueryFunction,
} from '@tanstack/react-query'

export type {
  Control,
  FieldValues,
  UseFormReturn,
  FieldPath,
  PathValue,
  RegisterOptions,
  FieldError,
  DeepRequired,
  DeepPartial,
} from 'react-hook-form'

export type {
  z,
  ZodSchema,
  ZodType,
  ZodTypeAny,
  ZodObject,
  ZodArray,
  ZodString,
  ZodNumber,
  ZodBoolean,
  ZodDate,
  ZodEnum,
  ZodUnion,
  ZodIntersection,
  ZodOptional,
  ZodNullable,
  ZodDefault,
  ZodEffects,
  ZodTransformer,
  ZodPipeline,
  infer as ZodInfer,
} from 'zod'

export type {
  Variants,
  Target,
  TargetAndTransition,
  Transition,
  AnimationControls,
  MotionValue,
  PanInfo,
  DragHandlers,
  LayoutGroup,
  AnimatePresence,
} from 'framer-motion'

// Version and Metadata
export const VERSION = '1.0.0'
export const PACKAGE_NAME = '@codai/frontend-architecture'
export const CODAI_FRONTEND_ARCHITECTURE = {
  name: PACKAGE_NAME,
  version: VERSION,
  description: 'Advanced Frontend Architecture System for CODAI Ecosystem',
  features: [
    'Modern React Patterns',
    'Advanced State Management',
    'Performance Optimized Hooks',
    'Accessibility First Design',
    'TypeScript Integration',
    'Animation & Interactions',
    'Responsive Design System',
    'Developer Experience Tools',
  ],
  ecosystem: 'CODAI',
  maintainers: ['CODAI Development Team'],
  documentation: 'https://codai.dev/docs/frontend-architecture',
  repository: 'https://github.com/codai-ecosystem/codai-project',
} as const
