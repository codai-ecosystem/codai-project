/**
 * Error Boundary Components
 * Comprehensive error handling for different application levels
 */

export { RootErrorBoundary } from './RootErrorBoundary';
export { RouteErrorBoundary } from './RouteErrorBoundary';
export { ComponentErrorBoundary } from './ComponentErrorBoundary';

// Re-export error reporting utilities
export {
  reportError,
  reportCustomError,
  reportPerformanceIssue,
  reportUserIssue,
  type ErrorContext,
  type ErrorReport,
} from '@/lib/error-reporting';
