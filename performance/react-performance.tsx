/**
 * React Performance Optimization Components
 * Reusable performance patterns for CODAI applications
 */

import React, { memo, lazy, Suspense, useMemo, useCallback, forwardRef } from 'react';
import dynamic from 'next/dynamic';

// Performance monitoring hook
export const usePerformanceMonitor = () => {
  const measurePerformance = useCallback((name: string, fn: () => void) => {
    const start = performance.now();
    fn();
    const end = performance.now();
    console.log(`Performance [${name}]: ${end - start}ms`);
  }, []);

  const markStart = useCallback((name: string) => {
    performance.mark(`${name}-start`);
  }, []);

  const markEnd = useCallback((name: string) => {
    performance.mark(`${name}-end`);
    performance.measure(name, `${name}-start`, `${name}-end`);
  }, []);

  return { measurePerformance, markStart, markEnd };
};

// Optimized loading components
export const LoadingSpinner = memo(() => (
  <div className="flex items-center justify-center p-8">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
  </div>
));

export const LoadingSkeleton = memo(({ lines = 3 }: { lines?: number }) => (
  <div className="animate-pulse space-y-3">
    {Array.from({ length: lines }, (_, i) => (
      <div key={i} className="h-4 bg-gray-200 rounded w-full"></div>
    ))}
  </div>
));

// Dynamic import helper with optimized loading
export const createOptimizedDynamic = (
  importFn: () => Promise<any>,
  options: {
    loading?: React.ComponentType;
    ssr?: boolean;
  } = {}
) => {
  return dynamic(importFn, {
    loading: options.loading || LoadingSpinner,
    ssr: options.ssr ?? true,
  });
};

// Virtualized list component for large datasets
export const VirtualizedList = memo(({
  items,
  renderItem,
  itemHeight = 50,
  containerHeight = 400
}: {
  items: any[];
  renderItem: (item: any, index: number) => React.ReactNode;
  itemHeight?: number;
  containerHeight?: number;
}) => {
  const [scrollTop, setScrollTop] = React.useState(0);

  const visibleCount = Math.ceil(containerHeight / itemHeight);
  const startIndex = Math.floor(scrollTop / itemHeight);
  const endIndex = Math.min(startIndex + visibleCount + 1, items.length);

  const visibleItems = useMemo(() =>
    items.slice(startIndex, endIndex)
    , [items, startIndex, endIndex]);

  const totalHeight = items.length * itemHeight;
  const offsetY = startIndex * itemHeight;

  return (
    <div
      style={{ height: containerHeight, overflow: 'auto' }}
      onScroll={(e) => setScrollTop(e.currentTarget.scrollTop)}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div style={{ transform: `translateY(${offsetY}px)` }}>
          {visibleItems.map((item, index) =>
            renderItem(item, startIndex + index)
          )}
        </div>
      </div>
    </div>
  );
});

// Optimized image component
export const OptimizedImage = memo(forwardRef<HTMLImageElement, {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  loading?: 'lazy' | 'eager';
}>((props, ref) => {
  const { src, alt, width, height, className, priority = false, loading = 'lazy' } = props;

  return (
    <img
      ref={ref}
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
      loading={priority ? 'eager' : loading}
      decoding="async"
      style={{
        aspectRatio: width && height ? `${width}/${height}` : undefined,
      }}
    />
  );
}));

// Debounced input component
export const DebouncedInput = memo(({
  value,
  onChange,
  delay = 300,
  ...props
}: {
  value: string;
  onChange: (value: string) => void;
  delay?: number;
  [key: string]: any;
}) => {
  const [localValue, setLocalValue] = React.useState(value);

  const debouncedOnChange = useCallback(
    debounce((val: string) => onChange(val), delay),
    [onChange, delay]
  );

  React.useEffect(() => {
    setLocalValue(value);
  }, [value]);

  React.useEffect(() => {
    debouncedOnChange(localValue);
  }, [localValue, debouncedOnChange]);

  return (
    <input
      {...props}
      value={localValue}
      onChange={(e) => setLocalValue(e.target.value)}
    />
  );
});

// Utility function for debouncing
function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}

// Memoized expensive computation hook
export const useMemoizedComputation = <T>(
  computeFn: () => T,
  deps: React.DependencyList
): T => {
  return useMemo(computeFn, deps);
};

  // Performance-optimized table component
  export const OptimizedTable = memo(({
    data,
    columns,
    pageSize = 50
  }: {
    data: any[];
  columns: Array<{ key: string; header: string; render?: (value: any) => React.ReactNode }>;
  pageSize?: number;
}) => {
  const [currentPage, setCurrentPage] = React.useState(0);
  
  const paginatedData = useMemo(() => {
    const start = currentPage * pageSize;
  return data.slice(start, start + pageSize);
  }, [data, currentPage, pageSize]);

  const totalPages = Math.ceil(data.length / pageSize);

  return (
  <div>
    <table className="w-full border-collapse">
      <thead>
        <tr>
          {columns.map((col) => (
            <th key={col.key} className="border p-2 text-left">
              {col.header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {paginatedData.map((row, index) => (
          <tr key={index}>
            {columns.map((col) => (
              <td key={col.key} className="border p-2">
                {col.render ? col.render(row[col.key]) : row[col.key]}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>

    {totalPages > 1 && (
      <div className="flex justify-between items-center mt-4">
        <button
          onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
          disabled={currentPage === 0}
          className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
        >
          Previous
        </button>
        <span>
          Page {currentPage + 1} of {totalPages}
        </span>
        <button
          onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
          disabled={currentPage === totalPages - 1}
          className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>
    )}
  </div>
  );
});

  // Error boundary for performance isolation
  export class PerformanceErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ComponentType<{ error: Error }> },
  {hasError: boolean; error?: Error }
> {
    constructor(props: any) {
    super(props);
  this.state = {hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return {hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Performance Error Boundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback;
  return <FallbackComponent error={this.state.error!} />;
    }

  return this.props.children;
  }
}

  const DefaultErrorFallback = ({error}: {error: Error }) => (
  <div className="p-4 border border-red-300 rounded bg-red-50">
    <h2 className="text-red-800 font-semibold">Something went wrong</h2>
    <p className="text-red-600 text-sm mt-1">{error.message}</p>
  </div>
  );

// Web vitals monitoring
export const WebVitalsMonitor = memo(() => {
    React.useEffect(() => {
      if (typeof window !== 'undefined' && 'web-vitals' in window) {
        import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
          getCLS(console.log);
          getFID(console.log);
          getFCP(console.log);
          getLCP(console.log);
          getTTFB(console.log);
        });
      }
    }, []);

  return null;
});

  export default {
    usePerformanceMonitor,
    LoadingSpinner,
    LoadingSkeleton,
    createOptimizedDynamic,
    VirtualizedList,
    OptimizedImage,
    DebouncedInput,
    useMemoizedComputation,
    OptimizedTable,
    PerformanceErrorBoundary,
    WebVitalsMonitor,
};
