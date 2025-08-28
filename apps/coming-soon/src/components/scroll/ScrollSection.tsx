'use client';

import React, { useEffect, useRef, useState, type ReactNode } from 'react';
import { useMotion } from '@/contexts/MotionContext';
import { cn } from '@/utils';
import type { AnimationState } from '@/components/types';

interface ScrollSectionProps {
    /**
     * Section content
     */
    children: ReactNode;
    
    /**
     * Additional CSS classes
     */
    className?: string;
    
    /**
     * Test ID for testing
     */
    testId?: string;
    
    /**
     * Unique section ID
     */
    sectionId: string;
    
    /**
     * Intersection thresholds (0-1)
     */
    threshold?: number | number[];
    
    /**
     * Root margin for intersection observer
     */
    rootMargin?: string;
    
    /**
     * Animation delay in milliseconds
     */
    animationDelay?: number;
    
    /**
     * Animation duration in milliseconds
     */
    animationDuration?: number;
    
    /**
     * Callback when section enters viewport
     */
    onEnter?: (entry: IntersectionObserverEntry) => void;
    
    /**
     * Callback when section exits viewport
     */
    onExit?: (entry: IntersectionObserverEntry) => void;
    
    /**
     * Callback when intersection changes
     */
    onIntersect?: (entry: IntersectionObserverEntry, isIntersecting: boolean) => void;
    
    /**
     * Enable/disable automatic animation triggers
     */
    autoAnimate?: boolean;
    
    /**
     * Animation preset to apply
     */
    animationPreset?: 'fadeIn' | 'slideUp' | 'slideDown' | 'scaleUp';
}

/**
 * ScrollSection Component
 * Provides intersection-based scroll triggers for sections
 */
export function ScrollSection({
    children,
    className,
    testId,
    sectionId,
    threshold = [0, 0.1, 0.5, 0.9, 1],
    rootMargin = '0px',
    animationDelay = 0,
    animationDuration = 800,
    onEnter,
    onExit,
    onIntersect,
    autoAnimate = true,
    animationPreset = 'fadeIn',
}: ScrollSectionProps) {
    const { motionPreference } = useMotion();
    const sectionRef = useRef<HTMLElement>(null);
    const [animationState, setAnimationState] = useState<AnimationState>('idle');
    const [intersectionRatio, setIntersectionRatio] = useState(0);
    const hasAnimated = useRef(false);

    useEffect(() => {
        const element = sectionRef.current;
        if (!element) return;

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    const isIntersecting = entry.isIntersecting;
                    const ratio = entry.intersectionRatio;
                    
                    setIntersectionRatio(ratio);
                    
                    // Fire callbacks
                    onIntersect?.(entry, isIntersecting);
                    
                    if (isIntersecting && !hasAnimated.current) {
                        onEnter?.(entry);
                        
                        if (autoAnimate && motionPreference !== 'disabled') {
                            setTimeout(() => {
                                setAnimationState('enter');
                                hasAnimated.current = true;
                            }, animationDelay);
                        }
                    } else if (!isIntersecting && hasAnimated.current) {
                        onExit?.(entry);
                        
                        if (autoAnimate) {
                            setAnimationState('exit');
                        }
                    }
                });
            },
            {
                threshold,
                rootMargin,
            }
        );

        observer.observe(element);

        return () => {
            observer.disconnect();
        };
    }, [
        threshold,
        rootMargin,
        animationDelay,
        autoAnimate,
        motionPreference,
        onEnter,
        onExit,
        onIntersect,
    ]);

    // Animation CSS variables
    const animationStyles: React.CSSProperties = {
        ['--animation-duration' as any]: motionPreference === 'disabled' ? '0ms' : `${animationDuration}ms`,
        ['--intersection-ratio' as any]: intersectionRatio.toString(),
    };

    const sectionClasses = cn(
        'scroll-section',
        'transition-all',
        motionPreference !== 'disabled' && 'duration-300',
        
        // Animation presets - fadeIn
        autoAnimate && animationPreset === 'fadeIn' && animationState === 'idle' && 'opacity-0',
        autoAnimate && animationPreset === 'fadeIn' && animationState === 'enter' && 'opacity-100 animate-in fade-in',
        autoAnimate && animationPreset === 'fadeIn' && animationState === 'exit' && 'opacity-0 animate-out fade-out',
        
        // Animation presets - slideUp
        autoAnimate && animationPreset === 'slideUp' && animationState === 'idle' && 'opacity-0 translate-y-8',
        autoAnimate && animationPreset === 'slideUp' && animationState === 'enter' && 'opacity-100 translate-y-0 animate-in slide-in-from-bottom',
        autoAnimate && animationPreset === 'slideUp' && animationState === 'exit' && 'opacity-0 translate-y-8 animate-out slide-out-to-bottom',
        
        // Animation presets - slideDown
        autoAnimate && animationPreset === 'slideDown' && animationState === 'idle' && 'opacity-0 -translate-y-8',
        autoAnimate && animationPreset === 'slideDown' && animationState === 'enter' && 'opacity-100 translate-y-0 animate-in slide-in-from-top',
        autoAnimate && animationPreset === 'slideDown' && animationState === 'exit' && 'opacity-0 -translate-y-8 animate-out slide-out-to-top',
        
        // Animation presets - scaleUp
        autoAnimate && animationPreset === 'scaleUp' && animationState === 'idle' && 'opacity-0 scale-95',
        autoAnimate && animationPreset === 'scaleUp' && animationState === 'enter' && 'opacity-100 scale-100 animate-in zoom-in',
        autoAnimate && animationPreset === 'scaleUp' && animationState === 'exit' && 'opacity-0 scale-95 animate-out zoom-out',
        
        className
    );

    return (
        <section
            ref={sectionRef}
            className={sectionClasses}
            style={animationStyles}
            data-testid={testId}
            data-section-id={sectionId}
            data-animation-state={animationState}
            data-intersection-ratio={intersectionRatio.toFixed(3)}
            data-motion-preference={motionPreference}
            aria-label={`Section ${sectionId}`}
        >
            {children}
        </section>
    );
}