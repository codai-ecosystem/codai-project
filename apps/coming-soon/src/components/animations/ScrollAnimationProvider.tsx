'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';

interface ScrollAnimationContextType {
    scrollY: number;
    scrollProgress: number;
    scrollDirection: 'up' | 'down';
    scrollVelocity: number;
    isScrolling: boolean;
    registerElement: (id: string, element: HTMLElement, options?: IntersectionObserverInit) => void;
    unregisterElement: (id: string) => void;
    isElementVisible: (id: string) => boolean;
    getElementProgress: (id: string) => number;
}

const ScrollAnimationContext = createContext<ScrollAnimationContextType | null>(null);

interface ScrollAnimationProviderProps {
    children: React.ReactNode;
    throttleMs?: number;
    scrollThreshold?: number;
}

export const ScrollAnimationProvider: React.FC<ScrollAnimationProviderProps> = ({
    children,
    throttleMs = 16, // 60fps
    scrollThreshold = 5
}) => {
    const [scrollY, setScrollY] = useState(0);
    const [scrollProgress, setScrollProgress] = useState(0);
    const [scrollDirection, setScrollDirection] = useState<'up' | 'down'>('down');
    const [scrollVelocity, setScrollVelocity] = useState(0);
    const [isScrolling, setIsScrolling] = useState(false);

    const lastScrollY = useRef(0);
    const lastScrollTime = useRef(Date.now());
    const scrollTimeout = useRef<NodeJS.Timeout | null>(null);
    const frameId = useRef<number | null>(null);

    // Track visible elements
    const [visibleElements, setVisibleElements] = useState<Map<string, {
        isVisible: boolean;
        progress: number;
        element: HTMLElement;
        observer: IntersectionObserver;
    }>>(new Map());

    // Throttled scroll handler
    const handleScroll = useCallback(() => {
        if (frameId.current) {
            cancelAnimationFrame(frameId.current);
        }

        frameId.current = requestAnimationFrame(() => {
            const currentScrollY = window.scrollY;
            const currentTime = Date.now();
            const timeDelta = currentTime - lastScrollTime.current;

            // Calculate scroll direction and velocity
            const deltaY = currentScrollY - lastScrollY.current;
            const velocity = timeDelta > 0 ? Math.abs(deltaY) / timeDelta : 0;

            if (Math.abs(deltaY) > scrollThreshold) {
                setScrollDirection(deltaY > 0 ? 'down' : 'up');
                setScrollVelocity(velocity);
                setIsScrolling(true);

                // Clear existing timeout
                if (scrollTimeout.current) {
                    clearTimeout(scrollTimeout.current);
                }

                // Set scrolling to false after inactivity
                scrollTimeout.current = setTimeout(() => {
                    setIsScrolling(false);
                    setScrollVelocity(0);
                }, 150);
            }

            setScrollY(currentScrollY);

            // Calculate scroll progress (0-100)
            const documentHeight = document.documentElement.scrollHeight - window.innerHeight;
            const progress = documentHeight > 0 ? (currentScrollY / documentHeight) * 100 : 0;
            setScrollProgress(Math.min(100, Math.max(0, progress)));

            lastScrollY.current = currentScrollY;
            lastScrollTime.current = currentTime;
        });
    }, [scrollThreshold]);

    // Register scroll listener
    useEffect(() => {
        let ticking = false;

        const throttledScroll = () => {
            if (!ticking) {
                requestAnimationFrame(() => {
                    handleScroll();
                    ticking = false;
                });
                ticking = true;
            }
        };

        window.addEventListener('scroll', throttledScroll, { passive: true });
        handleScroll(); // Initial call

        return () => {
            window.removeEventListener('scroll', throttledScroll);
            if (frameId.current) {
                cancelAnimationFrame(frameId.current);
            }
            if (scrollTimeout.current) {
                clearTimeout(scrollTimeout.current);
            }
        };
    }, [handleScroll]);

    // Register element for scroll animations
    const registerElement = useCallback((
        id: string,
        element: HTMLElement,
        options: IntersectionObserverInit = {}
    ) => {
        // Default intersection observer options
        const defaultOptions: IntersectionObserverInit = {
            root: null,
            rootMargin: '-10% 0px -10% 0px',
            threshold: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0],
            ...options
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                const progress = entry.intersectionRatio;
                const isVisible = entry.isIntersecting && progress > 0.1;

                setVisibleElements(prev => {
                    const newMap = new Map(prev);
                    const existing = newMap.get(id);

                    if (existing) {
                        newMap.set(id, {
                            ...existing,
                            isVisible,
                            progress
                        });
                    }

                    return newMap;
                });
            });
        }, defaultOptions);

        observer.observe(element);

        setVisibleElements(prev => {
            const newMap = new Map(prev);
            newMap.set(id, {
                isVisible: false,
                progress: 0,
                element,
                observer
            });
            return newMap;
        });
    }, []);

    // Unregister element
    const unregisterElement = useCallback((id: string) => {
        setVisibleElements(prev => {
            const newMap = new Map(prev);
            const elementData = newMap.get(id);

            if (elementData) {
                elementData.observer.disconnect();
                newMap.delete(id);
            }

            return newMap;
        });
    }, []);

    // Get element visibility
    const isElementVisible = useCallback((id: string): boolean => {
        return visibleElements.get(id)?.isVisible ?? false;
    }, [visibleElements]);

    // Get element progress
    const getElementProgress = useCallback((id: string): number => {
        return visibleElements.get(id)?.progress ?? 0;
    }, [visibleElements]);

    const contextValue: ScrollAnimationContextType = {
        scrollY,
        scrollProgress,
        scrollDirection,
        scrollVelocity,
        isScrolling,
        registerElement,
        unregisterElement,
        isElementVisible,
        getElementProgress
    };

    return (
        <ScrollAnimationContext.Provider value={contextValue}>
            {children}
        </ScrollAnimationContext.Provider>
    );
};

export const useScrollAnimation = (): ScrollAnimationContextType => {
    const context = useContext(ScrollAnimationContext);
    if (!context) {
        throw new Error('useScrollAnimation must be used within a ScrollAnimationProvider');
    }
    return context;
};

// Scroll indicator component
interface ScrollIndicatorProps {
    className?: string;
    showPercent?: boolean;
    position?: 'top' | 'bottom' | 'left' | 'right';
}

export const ScrollIndicator: React.FC<ScrollIndicatorProps> = ({
    className = '',
    showPercent = false,
    position = 'top'
}) => {
    const { scrollProgress } = useScrollAnimation();

    const positionClasses = {
        top: 'top-0 left-0 right-0 h-1',
        bottom: 'bottom-0 left-0 right-0 h-1',
        left: 'top-0 left-0 bottom-0 w-1',
        right: 'top-0 right-0 bottom-0 w-1'
    };

    const progressStyle = {
        top: { width: `${scrollProgress}%` },
        bottom: { width: `${scrollProgress}%` },
        left: { height: `${scrollProgress}%` },
        right: { height: `${scrollProgress}%` }
    };

    return (
        <div className={`fixed z-50 bg-gradient-to-r from-blue-500 to-purple-600 ${positionClasses[position]} ${className}`}>
            <div
                className="h-full bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-500 transition-all duration-300 ease-out"
                style={progressStyle[position]}
            />
            {showPercent && (
                <div className="absolute top-2 right-4 text-sm font-bold text-white bg-black/20 backdrop-blur-sm px-2 py-1 rounded">
                    {Math.round(scrollProgress)}%
                </div>
            )}
        </div>
    );
};