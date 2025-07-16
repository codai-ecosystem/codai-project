import { lazy, useEffect, useRef, useState } from 'react';
import type { ComponentType, LazyExoticComponent, RefObject } from 'react';

import { ErrorBoundary } from 'export const LazyInput = createLazyComponent(
() => import('../ui/input').then(mod => ({ default: mod.Input })),
  { preloadDelay: 1000 }
);rrorBoundary';

/**
 * Enhanced lazy loading utility with error boundaries and loading states
 */

interface LazyComponentOptions {
  /**
   * Custom loading component to show while the component is being loaded
   */
  loading?: ComponentType;
  /**
   * Custom error fallback component
   */
  error?: ComponentType<{ error: Error; retry: () => void }>;
  /**
   * Preload the component after a delay (in milliseconds)
   */
  preloadDelay?: number;
  /**
   * Whether to preload on hover
   */
  preloadOnHover?: boolean;
}

/**
 * Creates a lazily loaded component with enhanced error handling and loading states
 */
export function createLazyComponent<
  T extends ComponentType<Record<string, unknown>>,
>(
  componentImporter: () => Promise<{ default: T }>,
  options: LazyComponentOptions = {}
): LazyExoticComponent<T> {
  const LazyComponent = lazy(componentImporter);

  // Preload component after delay
  if (options.preloadDelay !== undefined) {
    setTimeout(() => {
      componentImporter().catch(() => {
        // Ignore preload errors
      });
    }, options.preloadDelay);
  }

  return LazyComponent;
}

/**
 * Higher-order component that wraps lazy components with error boundaries and loading states
 */
export function withLazyLoading<P extends object>(
  LazyComponent: LazyExoticComponent<ComponentType<P>>,
  options: LazyComponentOptions = {}
): ComponentType<P> {
  const { error: ErrorComponent = DefaultErrorComponent } = options;

  return function LazyWrapper(props: P) {
    return (
      <ErrorBoundary
        fallback={
          <ErrorComponent
            error={new Error('Component failed to load')}
            retry={() => window.location.reload()}
          />
        }
      >
        <LazyComponent {...props} />
      </ErrorBoundary>
    );
  };
}

/**
 * Default error component
 */
function DefaultErrorComponent({
  error,
  retry,
}: {
  error: Error;
  retry: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <div className="mb-4 text-destructive">
        <svg
          className="mx-auto mb-2 h-12 w-12"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.966-.833-2.736 0L3.066 16.5c-.77.833.192 2.5 1.732 2.5z"
          />
        </svg>
        <p className="text-sm font-medium">Failed to load component</p>
        <p className="mt-1 text-xs text-muted-foreground">{error.message}</p>
      </div>
      <button
        onClick={retry}
        className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground transition-colors hover:bg-primary/90"
      >
        Try again
      </button>
    </div>
  );
}

/**
 * Preload a lazy component
 */
export function preloadComponent<
  T extends ComponentType<Record<string, unknown>>,
>(componentImporter: () => Promise<{ default: T }>): Promise<void> {
  return componentImporter()
    .then(() => { })
    .catch(() => {
      // Ignore preload errors
    });
}

/**
 * Hook for preloading components on interaction
 */
export function usePreloadOnInteraction<
  T extends ComponentType<Record<string, unknown>>,
>(
  componentImporter: () => Promise<{ default: T }>,
  trigger: 'hover' | 'focus' | 'click' = 'hover'
): { preload: () => void; getEventHandlers: () => Record<string, () => void> } {
  const preload = (): void => {
    void preloadComponent(componentImporter);
  };

  const getEventHandlers = (): Record<string, () => void> => {
    const handlers: Record<string, () => void> = {};

    if (trigger === 'hover') {
      handlers['onMouseEnter'] = (): void => {
        void preloadComponent(componentImporter);
      };
    } else if (trigger === 'focus') {
      handlers['onFocus'] = (): void => {
        void preloadComponent(componentImporter);
      };
    } else {
      handlers['onClick'] = (): void => {
        void preloadComponent(componentImporter);
      };
    }

    return handlers;
  };

  return { preload, getEventHandlers };
}

// Pre-defined lazy components for common use cases
export const LazyButton = createLazyComponent(
  () => import('../ui/button').then(mod => ({ default: mod.Button })),
  { preloadDelay: 1000 }
);

export const LazyInput = createLazyComponent(
  () => import('../ui/Input').then(mod => ({ default: mod.Input })),
  { preloadDelay: 1500 }
);

export const LazyDatePicker = createLazyComponent(
  () => import('../ui/DatePicker').then(mod => ({ default: mod.DatePicker })),
  { preloadOnHover: true }
);

// Example route-based lazy loading (update paths as needed)
// export const routes = {
//   Dashboard: createLazyComponent(() => import('../../pages/dashboard')),
//   Profile: createLazyComponent(() => import('../../pages/profile')),
//   Settings: createLazyComponent(() => import('../../pages/settings')),
// };

/**
 * Bundle splitting utilities
 */

// Vendor chunks configuration
export const VENDOR_CHUNKS = {
  // React ecosystem
  react: ['react', 'react-dom'],
  // UI components
  ui: [
    '@radix-ui/react-dialog',
    '@radix-ui/react-select',
    '@radix-ui/react-popover',
  ],
  // Forms
  forms: ['react-hook-form', '@hookform/resolvers', 'zod'],
  // Firebase
  firebase: ['firebase/app', 'firebase/auth', 'firebase/firestore'],
  // Animation
  animation: ['framer-motion'],
  // Utilities
  utils: ['lodash', 'date-fns', 'clsx'],
} as const;

/**
 * Code splitting by feature (commented out - update paths as needed)
 */
// export const featureModules = {
//   auth: () => import('../../features/auth'),
//   dashboard: () => import('../../features/dashboard'),
//   analytics: () => import('../../features/analytics'),
//   settings: () => import('../../features/settings'),
//   charts: () => import('../../features/charts'),
// } as const;

/**
 * Dynamic imports with retry logic
 */
export async function dynamicImport<T>(
  importer: () => Promise<T>,
  retries: number = 3,
  delay: number = 1000
): Promise<T> {
  for (let i = 0; i < retries; i++) {
    try {
      return await importer();
    } catch (error: unknown) {
      if (i === retries - 1) throw error;

      // Exponential backoff
      await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
    }
  }

  throw new Error('Failed to load module after retries');
}

/**
 * Intersection Observer based lazy loading for heavy components
 */
export function useLazyIntersection<
  T extends ComponentType<Record<string, unknown>>,
>(
  componentImporter: () => Promise<{ default: T }>,
  options: IntersectionObserverInit = {}
): {
  Component: T | null;
  isLoading: boolean;
  error: Error | null;
  ref: RefObject<HTMLDivElement | null>;
} {
  const [Component, setComponent] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (
          entry?.isIntersecting === true &&
          Component === null &&
          !isLoading
        ) {
          void (async () => {
            setIsLoading(true);
            try {
              const { default: LoadedComponent } = await componentImporter();
              setComponent(() => LoadedComponent);
            } catch (err: unknown) {
              setError(
                err instanceof Error
                  ? err
                  : new Error('Failed to load component')
              );
            } finally {
              setIsLoading(false);
            }
          })();
        }
      },
      {
        threshold: 0.1,
        rootMargin: '100px',
        ...options,
      }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [componentImporter, Component, isLoading, options]);

  return { ref, Component, isLoading, error };
}
