'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useMotion } from '@/contexts/MotionContext';
import { throttle } from '@/utils';
import type { ScrollDirection } from '@/components/types';

interface ScrollObserverProps {
    /**
     * Callback when scroll events occur
     */
    onScroll?: (scrollData: ScrollData) => void;
    
    /**
     * Callback when scroll direction changes
     */
    onDirectionChange?: (direction: ScrollDirection) => void;
    
    /**
     * Callback when scroll velocity changes significantly
     */
    onVelocityChange?: (velocity: number) => void;
    
    /**
     * Throttle delay for scroll events (ms)
     */
    throttleDelay?: number;
    
    /**
     * Velocity calculation window size
     */
    velocityWindow?: number;
    
    /**
     * Enable performance monitoring
     */
    enablePerformanceMonitoring?: boolean;
}

interface ScrollData {
    scrollY: number;
    scrollX: number;
    scrollTop: number;
    scrollLeft: number;
    scrollHeight: number;
    scrollWidth: number;
    clientHeight: number;
    clientWidth: number;
    progress: number;
    direction: ScrollDirection;
    velocity: number;
    timestamp: number;
}

interface VelocityData {
    timestamp: number;
    scrollY: number;
}

/**
 * ScrollObserver Component
 * Provides comprehensive scroll tracking and analysis
 */
export function ScrollObserver({
    onScroll,
    onDirectionChange,
    onVelocityChange,
    throttleDelay = 16, // ~60fps
    velocityWindow = 5,
    enablePerformanceMonitoring = false,
}: ScrollObserverProps) {
    const { motionPreference } = useMotion();
    const [scrollData, setScrollData] = useState<ScrollData | null>(null);
    const lastScrollY = useRef(0);
    const lastDirection = useRef<ScrollDirection>('down');
    const velocityHistory = useRef<VelocityData[]>([]);
    const lastVelocity = useRef(0);
    const performanceMetrics = useRef({
        frameDrops: 0,
        lastFrameTime: performance.now(),
        averageFrameTime: 16.67, // Target 60fps
    });

    useEffect(() => {
        if (motionPreference === 'disabled') {
            return;
        }

        const calculateScrollData = (): ScrollData => {
            const now = performance.now();
            const scrollY = window.pageYOffset || document.documentElement.scrollTop;
            const scrollX = window.pageXOffset || document.documentElement.scrollLeft;
            const scrollTop = document.documentElement.scrollTop;
            const scrollLeft = document.documentElement.scrollLeft;
            const scrollHeight = document.documentElement.scrollHeight;
            const scrollWidth = document.documentElement.scrollWidth;
            const clientHeight = document.documentElement.clientHeight;
            const clientWidth = document.documentElement.clientWidth;
            
            // Calculate progress (0-1)
            const maxScroll = scrollHeight - clientHeight;
            const progress = maxScroll > 0 ? Math.max(0, Math.min(1, scrollY / maxScroll)) : 0;
            
            // Determine direction
            const direction: ScrollDirection = scrollY > lastScrollY.current ? 'down' : 'up';
            lastScrollY.current = scrollY;
            
            // Calculate velocity
            velocityHistory.current.push({ timestamp: now, scrollY });
            if (velocityHistory.current.length > velocityWindow) {
                velocityHistory.current.shift();
            }
            
            let velocity = 0;
            if (velocityHistory.current.length >= 2) {
                const oldest = velocityHistory.current[0];
                const newest = velocityHistory.current[velocityHistory.current.length - 1];
                const timeDiff = newest.timestamp - oldest.timestamp;
                const scrollDiff = Math.abs(newest.scrollY - oldest.scrollY);
                velocity = timeDiff > 0 ? scrollDiff / timeDiff : 0;
            }
            
            // Performance monitoring
            if (enablePerformanceMonitoring) {
                const frameTime = now - performanceMetrics.current.lastFrameTime;
                performanceMetrics.current.averageFrameTime = 
                    (performanceMetrics.current.averageFrameTime * 0.9) + (frameTime * 0.1);
                
                if (frameTime > 32) { // >32ms indicates dropped frames at 60fps
                    performanceMetrics.current.frameDrops++;
                }
                
                performanceMetrics.current.lastFrameTime = now;
            }
            
            return {
                scrollY,
                scrollX,
                scrollTop,
                scrollLeft,
                scrollHeight,
                scrollWidth,
                clientHeight,
                clientWidth,
                progress,
                direction,
                velocity,
                timestamp: now,
            };
        };

        const handleScrollThrottled = throttle(() => {
            const data = calculateScrollData();
            
            setScrollData(data);
            onScroll?.(data);
            
            // Direction change callback
            if (data.direction !== lastDirection.current) {
                lastDirection.current = data.direction;
                onDirectionChange?.(data.direction);
            }
            
            // Velocity change callback
            const velocityDiff = Math.abs(data.velocity - lastVelocity.current);
            if (velocityDiff > 0.1) { // Threshold for significant velocity change
                lastVelocity.current = data.velocity;
                onVelocityChange?.(data.velocity);
            }
        }, throttleDelay);

        // Initial calculation
        const initialData = calculateScrollData();
        setScrollData(initialData);
        onScroll?.(initialData);

        // Add scroll listener
        window.addEventListener('scroll', handleScrollThrottled, { passive: true });
        window.addEventListener('resize', handleScrollThrottled, { passive: true });

        return () => {
            window.removeEventListener('scroll', handleScrollThrottled);
            window.removeEventListener('resize', handleScrollThrottled);
        };
    }, [
        motionPreference,
        throttleDelay,
        velocityWindow,
        enablePerformanceMonitoring,
        onScroll,
        onDirectionChange,
        onVelocityChange,
    ]);

    // This component doesn't render anything visible
    return null;
}

// Export hook for using scroll data in components
export function useScrollData() {
    const [scrollData, setScrollData] = useState<ScrollData | null>(null);

    useEffect(() => {
        // Implement the same logic as ScrollObserver for the hook
        const calculateScrollData = (): ScrollData => {
            const now = performance.now();
            const scrollY = window.pageYOffset || document.documentElement.scrollTop;
            const scrollX = window.pageXOffset || document.documentElement.scrollLeft;
            const scrollTop = document.documentElement.scrollTop;
            const scrollLeft = document.documentElement.scrollLeft;
            const scrollHeight = document.documentElement.scrollHeight;
            const scrollWidth = document.documentElement.scrollWidth;
            const clientHeight = document.documentElement.clientHeight;
            const clientWidth = document.documentElement.clientWidth;
            
            const maxScroll = scrollHeight - clientHeight;
            const progress = maxScroll > 0 ? Math.max(0, Math.min(1, scrollY / maxScroll)) : 0;
            const direction: ScrollDirection = scrollY > (scrollData?.scrollY || 0) ? 'down' : 'up';
            
            return {
                scrollY,
                scrollX,
                scrollTop,
                scrollLeft,
                scrollHeight,
                scrollWidth,
                clientHeight,
                clientWidth,
                progress,
                direction,
                velocity: 0, // Simplified for hook
                timestamp: now,
            };
        };

        const handleScroll = throttle(() => {
            const data = calculateScrollData();
            setScrollData(data);
        }, 16);

        window.addEventListener('scroll', handleScroll, { passive: true });
        window.addEventListener('resize', handleScroll, { passive: true });

        // Initial calculation
        const initialData = calculateScrollData();
        setScrollData(initialData);

        return () => {
            window.removeEventListener('scroll', handleScroll);
            window.removeEventListener('resize', handleScroll);
        };
    }, [scrollData?.scrollY]);

    return scrollData;
}

export type { ScrollData };