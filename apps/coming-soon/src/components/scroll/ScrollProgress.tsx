'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useMotion } from '@/contexts/MotionContext';
import { cn } from '@/utils';
import type { ScrollDirection } from '@/components/types';

interface ScrollProgressProps {
    /**
     * Additional CSS classes
     */
    className?: string;
    
    /**
     * Test ID for testing
     */
    testId?: string;
    
    /**
     * Show visual progress indicator
     */
    showIndicator?: boolean;
    
    /**
     * Position of the indicator
     */
    indicatorPosition?: 'top' | 'bottom' | 'left' | 'right';
    
    /**
     * Custom indicator color
     */
    indicatorColor?: string;
    
    /**
     * Callback fired when progress changes
     */
    onProgress?: (progress: number, direction: ScrollDirection) => void;
    
    /**
     * Callback fired when scroll reaches certain thresholds
     */
    onMilestone?: (milestone: number) => void;
    
    /**
     * Milestones to trigger callbacks (0-1)
     */
    milestones?: number[];
}

/**
 * ScrollProgress Component
 * Tracks scroll progress and provides visual feedback
 */
export function ScrollProgress({
    className,
    testId = 'scroll-progress',
    showIndicator = true,
    indicatorPosition = 'top',
    indicatorColor,
    onProgress,
    onMilestone,
    milestones = [0.25, 0.5, 0.75, 1],
}: ScrollProgressProps) {
    const { motionPreference } = useMotion();
    const [progress, setProgress] = useState(0);
    const [scrollDirection, setScrollDirection] = useState<ScrollDirection>('down');
    const lastScrollY = useRef(0);
    const triggeredMilestones = useRef<Set<number>>(new Set());

    useEffect(() => {
        if (motionPreference === 'disabled') {
            return;
        }

        let ticking = false;

        const updateProgress = () => {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
            const currentProgress = Math.max(0, Math.min(1, scrollTop / scrollHeight));
            
            // Determine scroll direction
            const direction = scrollTop > lastScrollY.current ? 'down' : 'up';
            lastScrollY.current = scrollTop;
            
            setProgress(currentProgress);
            setScrollDirection(direction);
            
            // Fire progress callback
            onProgress?.(currentProgress, direction);
            
            // Check milestones
            milestones.forEach(milestone => {
                if (currentProgress >= milestone && !triggeredMilestones.current.has(milestone)) {
                    triggeredMilestones.current.add(milestone);
                    onMilestone?.(milestone);
                } else if (currentProgress < milestone && triggeredMilestones.current.has(milestone)) {
                    // Remove milestone when scrolling back
                    triggeredMilestones.current.delete(milestone);
                }
            });
            
            ticking = false;
        };

        const handleScroll = () => {
            if (!ticking) {
                requestAnimationFrame(updateProgress);
                ticking = true;
            }
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        
        // Initial calculation
        updateProgress();

        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, [motionPreference, onProgress, onMilestone, milestones]);

    if (!showIndicator) {
        return null;
    }

    const progressBarClasses = cn(
        'scroll-progress-indicator',
        'fixed',
        'z-50',
        'transition-all',
        'duration-300',
        'ease-out',
        'bg-gray-200 dark:bg-gray-800',
        indicatorPosition === 'top' && 'top-0 left-0 w-full h-1',
        indicatorPosition === 'bottom' && 'bottom-0 left-0 w-full h-1',
        indicatorPosition === 'left' && 'left-0 top-0 w-1 h-full',
        indicatorPosition === 'right' && 'right-0 top-0 w-1 h-full',
        className
    );

    const progressFillClasses = cn(
        'scroll-progress-fill',
        'h-full',
        'transition-all',
        'duration-100',
        'ease-out',
        indicatorColor ? '' : 'bg-gradient-to-r from-blue-500 to-purple-600'
    );

    const progressStyle: React.CSSProperties = {
        ...(indicatorColor && { backgroundColor: indicatorColor }),
        ...(indicatorPosition === 'top' || indicatorPosition === 'bottom'
            ? { width: `${progress * 100}%` }
            : { height: `${progress * 100}%` }
        ),
    };

    return (
        <div
            className={progressBarClasses}
            data-testid={testId}
            data-progress={progress.toFixed(3)}
            data-scroll-direction={scrollDirection}
            role="progressbar"
            aria-valuenow={Math.round(progress * 100)}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Page scroll progress"
        >
            <div
                className={progressFillClasses}
                style={progressStyle}
            />
        </div>
    );
}