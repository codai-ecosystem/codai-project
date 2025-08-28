'use client';

import React, { lazy, Suspense, useRef, useEffect, useState, useMemo } from 'react';
import { PERFORMANCE_CONFIG } from '@/config/performance';
import { useTheme } from '@/contexts/ThemeContext';

interface LazyWrapperProps {
    children: React.ReactNode;
    fallback?: React.ReactNode;
    rootMargin?: string;
    threshold?: number | number[];
    triggerOnce?: boolean;
    delay?: number;
    className?: string;
    errorBoundary?: boolean;
    priority?: 'high' | 'medium' | 'low';
    prefetch?: boolean;
}

interface IntersectionState {
    isIntersecting: boolean;
    hasIntersected: boolean;
    intersectionRatio: number;
}

// Error boundary component
class LazyLoadErrorBoundary extends React.Component<
    { children: React.ReactNode; fallback?: React.ReactNode },
    { hasError: boolean }
> {
    constructor(props: any) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error) {
        return { hasError: true };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error('LazyWrapper Error:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return this.props.fallback || (
                <div className="flex items-center justify-center p-8 text-gray-500">
                    <span>Unable to load content</span>
                </div>
            );
        }

        return this.props.children;
    }
}

// Optimized intersection observer hook
const useIntersectionObserver = (
    ref: React.RefObject<Element | null>,
    options: IntersectionObserverInit = {},
    triggerOnce: boolean = true
): IntersectionState => {
    const [state, setState] = useState<IntersectionState>({
        isIntersecting: false,
        hasIntersected: false,
        intersectionRatio: 0
    });

    useEffect(() => {
        const element = ref.current;
        if (!element || !('IntersectionObserver' in window)) {
            setState(prev => ({ ...prev, isIntersecting: true, hasIntersected: true }));
            return;
        }

        const observer = new IntersectionObserver(
            (entries) => {
                const entry = entries[0];
                setState(prev => ({
                    isIntersecting: entry.isIntersecting,
                    hasIntersected: prev.hasIntersected || entry.isIntersecting,
                    intersectionRatio: entry.intersectionRatio
                }));

                // Unobserve after first intersection if triggerOnce is true
                if (entry.isIntersecting && triggerOnce) {
                    observer.disconnect();
                }
            },
            {
                rootMargin: options.rootMargin || PERFORMANCE_CONFIG.INTERSECTION.ROOT_MARGIN,
                threshold: options.threshold || [...PERFORMANCE_CONFIG.INTERSECTION.THRESHOLD],
                ...options
            }
        );

        observer.observe(element);

        return () => observer.disconnect();
    }, [ref, options.rootMargin, options.threshold, triggerOnce]);

    return state;
};

// Optimized loading skeleton
const LoadingSkeleton: React.FC<{ className?: string; priority?: 'high' | 'medium' | 'low' }> = ({
    className = '',
    priority = 'medium'
}) => {
    const { theme } = useTheme();

    const skeletonAnimation = useMemo(() => {
        switch (priority) {
            case 'high':
                return 'animate-pulse duration-1000';
            case 'medium':
                return 'animate-pulse duration-1500';
            case 'low':
                return 'animate-pulse duration-2000';
            default:
                return 'animate-pulse duration-1500';
        }
    }, [priority]);

    return (
        <div className={`relative overflow-hidden ${className}`}>
            <div className={`w-full h-full rounded-2xl ${theme === 'dark'
                    ? 'bg-gradient-to-br from-slate-800 to-slate-700'
                    : 'bg-gradient-to-br from-gray-200 to-gray-100'
                } ${skeletonAnimation}`}>
                {/* Shimmer effect */}
                <div className={`absolute inset-0 ${theme === 'dark'
                        ? 'bg-gradient-to-r from-transparent via-slate-600/20 to-transparent'
                        : 'bg-gradient-to-r from-transparent via-white/30 to-transparent'
                    } transform -skew-x-12 animate-shimmer`}
                    style={{
                        animation: `shimmer 2s infinite linear`,
                        left: '-100%',
                        width: '200%'
                    }} />
            </div>
        </div>
    );
};

// Priority-based delay calculator
const getPriorityDelay = (priority: 'high' | 'medium' | 'low'): number => {
    switch (priority) {
        case 'high':
            return 0;
        case 'medium':
            return PERFORMANCE_CONFIG.BUNDLE.LAZY_LOAD_THRESHOLD / 2;
        case 'low':
            return PERFORMANCE_CONFIG.BUNDLE.LAZY_LOAD_THRESHOLD;
        default:
            return PERFORMANCE_CONFIG.BUNDLE.LAZY_LOAD_THRESHOLD / 2;
    }
};

// Main LazyWrapper component
const LazyWrapper: React.FC<LazyWrapperProps> = ({
    children,
    fallback,
    rootMargin,
    threshold,
    triggerOnce = true,
    delay = 0,
    className = '',
    errorBoundary = true,
    priority = 'medium',
    prefetch = false
}) => {
    const ref = useRef<HTMLDivElement>(null);
    const [shouldLoad, setShouldLoad] = useState(false);
    const [isDelayComplete, setIsDelayComplete] = useState(delay === 0);

    const { isIntersecting, hasIntersected } = useIntersectionObserver(
        ref,
        { rootMargin, threshold },
        triggerOnce
    );

    // Priority-based delay
    const effectiveDelay = delay > 0 ? delay : getPriorityDelay(priority);

    // Handle intersection and delay
    useEffect(() => {
        if (isIntersecting || hasIntersected) {
            if (effectiveDelay > 0) {
                const timer = setTimeout(() => {
                    setIsDelayComplete(true);
                }, effectiveDelay);
                return () => clearTimeout(timer);
            } else {
                setIsDelayComplete(true);
            }
        }
    }, [isIntersecting, hasIntersected, effectiveDelay]);

    // Determine if component should load
    useEffect(() => {
        setShouldLoad((isIntersecting || hasIntersected) && isDelayComplete);
    }, [isIntersecting, hasIntersected, isDelayComplete]);

    // Prefetch logic
    useEffect(() => {
        if (prefetch && hasIntersected && !shouldLoad) {
            // Preload resources in the background
            const prefetchTimer = setTimeout(() => {
                setShouldLoad(true);
            }, 100);
            return () => clearTimeout(prefetchTimer);
        }
    }, [prefetch, hasIntersected, shouldLoad]);

    // Default fallback
    const defaultFallback = (
        <LoadingSkeleton
            className="w-full h-full min-h-[200px]"
            priority={priority}
        />
    );

    const content = shouldLoad ? children : (fallback || defaultFallback);

    if (errorBoundary) {
        return (
            <div ref={ref} className={className}>
                <LazyLoadErrorBoundary fallback={fallback}>
                    <Suspense fallback={fallback || defaultFallback}>
                        {content}
                    </Suspense>
                </LazyLoadErrorBoundary>
            </div>
        );
    }

    return (
        <div ref={ref} className={className}>
            <Suspense fallback={fallback || defaultFallback}>
                {content}
            </Suspense>
        </div>
    );
};

// Higher-order component for lazy loading
export const withLazyLoading = <P extends object>(
    Component: React.ComponentType<P>,
    options: Partial<LazyWrapperProps> = {}
) => {
    const LazyComponent = React.forwardRef<HTMLDivElement, P & LazyWrapperProps>((props, ref) => {
        const { className, ...lazyProps } = props;
        const componentProps = Object.fromEntries(
            Object.entries(props).filter(([key]) =>
                !['fallback', 'rootMargin', 'threshold', 'triggerOnce', 'delay', 'errorBoundary', 'priority', 'prefetch'].includes(key)
            )
        ) as P;

        return (
            <LazyWrapper
                ref={ref}
                className={className}
                {...options}
                {...lazyProps}
            >
                <Component {...componentProps} />
            </LazyWrapper>
        );
    });

    LazyComponent.displayName = `LazyLoaded(${Component.displayName || Component.name})`;
    return LazyComponent;
};

// Lazy component factory with dynamic imports
export const createLazyComponent = <P extends Record<string, any>>(
    importFn: () => Promise<{ default: React.ComponentType<P> }>,
    options: Partial<LazyWrapperProps> = {}
) => {
    const LazyComponent = lazy(importFn);

    return React.forwardRef<HTMLDivElement, P & LazyWrapperProps>((props, ref) => {
        // Extract wrapper-specific props and pass the rest to the lazy component
        const { 
            fallback, 
            errorBoundary, 
            retryCount, 
            onError, 
            onLoad, 
            priority, 
            preload, 
            children,
            ...componentProps 
        } = props;
        
        return (
            <LazyWrapper {...options} {...{ fallback, errorBoundary, retryCount, onError, onLoad, priority, preload }}>
                {/* @ts-expect-error - Complex generic type issue with dynamic props */}
                <LazyComponent {...(componentProps as unknown as P)} />
            </LazyWrapper>
        );
    });
};

// Performance-optimized image lazy loading
interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
    src: string;
    alt: string;
    placeholder?: string;
    blurDataURL?: string;
    priority?: 'high' | 'medium' | 'low';
    sizes?: string;
    quality?: number;
}

export const LazyImage: React.FC<LazyImageProps> = ({
    src,
    alt,
    placeholder,
    blurDataURL,
    priority = 'medium',
    sizes,
    quality = 75,
    className = '',
    ...props
}) => {
    const [isLoaded, setIsLoaded] = useState(false);
    const [hasError, setHasError] = useState(false);
    const imgRef = useRef<HTMLImageElement>(null);

    const { isIntersecting, hasIntersected } = useIntersectionObserver(
        imgRef,
        { rootMargin: '50px 0px 50px 0px' },
        true
    );

    const shouldLoad = priority === 'high' || isIntersecting || hasIntersected;

    const handleLoad = () => setIsLoaded(true);
    const handleError = () => setHasError(true);

    return (
        <div className={`relative overflow-hidden ${className}`}>
            {/* Placeholder */}
            {!isLoaded && !hasError && (
                <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-100 animate-pulse" />
            )}

            {/* Blur placeholder */}
            {blurDataURL && !isLoaded && !hasError && (
                <img
                    src={blurDataURL}
                    alt=""
                    className="absolute inset-0 w-full h-full object-cover filter blur-sm scale-105"
                />
            )}

            {/* Main image */}
            {shouldLoad && !hasError && (
                <img
                    ref={imgRef}
                    src={src}
                    alt={alt}
                    onLoad={handleLoad}
                    onError={handleError}
                    className={`w-full h-full object-cover transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'
                        }`}
                    loading={priority === 'high' ? 'eager' : 'lazy'}
                    sizes={sizes}
                    {...props}
                />
            )}

            {/* Error fallback */}
            {hasError && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100 text-gray-400">
                    <span className="text-sm">Failed to load image</span>
                </div>
            )}
        </div>
    );
};

export default LazyWrapper;