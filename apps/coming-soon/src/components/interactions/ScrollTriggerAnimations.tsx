'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion, useInView, useScroll, useTransform } from 'framer-motion';

// Intersection Observer hook for better performance
const useScrollTrigger = (threshold: number = 0.1) => {
    const ref = useRef<HTMLDivElement>(null);
    const isInView = useInView(ref, {
        amount: threshold,
        once: false // Allow re-triggering
    });

    return [ref, isInView] as const;
};

// Scroll progress hook
const useScrollProgress = () => {
    const { scrollYProgress } = useScroll();
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const unsubscribe = scrollYProgress.onChange((latest) => {
            setProgress(latest);
        });
        return () => unsubscribe();
    }, [scrollYProgress]);

    return progress;
};

// Initial states for animations
const getInitialState = (variant: string) => {
    switch (variant) {
        case 'fadeInUp':
            return { opacity: 0, y: 60, scale: 0.95, filter: "blur(4px)" };
        case 'fadeInDown':
            return { opacity: 0, y: -60, scale: 0.95, filter: "blur(4px)" };
        case 'slideInLeft':
            return { opacity: 0, x: -100, rotateY: 45, scale: 0.8 };
        case 'slideInRight':
            return { opacity: 0, x: 100, rotateY: -45, scale: 0.8 };
        case 'scaleIn':
            return { opacity: 0, scale: 0.5, rotate: -180, filter: "blur(8px)" };
        default:
            return { opacity: 0, y: 60, scale: 0.95 };
    }
};

// Animate states for animations
const getAnimateState = (variant: string, delay?: number, duration?: number) => {
    const baseTransition = {
        duration: duration || 0.8,
        ease: "easeOut",
        delay: delay || 0
    };

    switch (variant) {
        case 'fadeInUp':
        case 'fadeInDown':
            return {
                opacity: 1,
                y: 0,
                scale: 1,
                filter: "blur(0px)",
                transition: baseTransition
            };
        case 'slideInLeft':
        case 'slideInRight':
            return {
                opacity: 1,
                x: 0,
                rotateY: 0,
                scale: 1,
                transition: { ...baseTransition, duration: duration || 1 }
            };
        case 'scaleIn':
            return {
                opacity: 1,
                scale: 1,
                rotate: 0,
                filter: "blur(0px)",
                transition: { ...baseTransition, duration: duration || 1.2 }
            };
        default:
            return {
                opacity: 1,
                y: 0,
                scale: 1,
                transition: baseTransition
            };
    }
};

interface ScrollTriggerAnimationProps {
    children: React.ReactNode;
    variant?: string;
    threshold?: number;
    delay?: number;
    duration?: number;
    className?: string;
    once?: boolean;
    enableParallax?: boolean;
    parallaxSpeed?: number;
}

export const ScrollTriggerAnimation: React.FC<ScrollTriggerAnimationProps> = ({
    children,
    variant = 'fadeInUp',
    threshold = 0.1,
    delay = 0,
    duration,
    className = '',
    once = false,
    enableParallax = false,
    parallaxSpeed = 0.5
}) => {
    const [ref, isInView] = useScrollTrigger(threshold);
    const parallaxRef = useRef<HTMLDivElement>(null);

    // Parallax effect
    const { scrollYProgress } = useScroll({
        target: parallaxRef,
        offset: ["start end", "end start"]
    });

    const parallaxY = enableParallax ? useTransform(
        scrollYProgress,
        [0, 1],
        [0, parallaxSpeed * 200]
    ) : 0;

    return (
        <motion.div
            ref={enableParallax ? parallaxRef : ref}
            className={className}
            initial={getInitialState(variant)}
            animate={isInView ? getAnimateState(variant, delay, duration) : (once ? getAnimateState(variant, delay, duration) : getInitialState(variant))}
            style={enableParallax ? { y: parallaxY } : undefined}
        >
            {children}
        </motion.div>
    );
};

// Scroll progress indicator
export const ScrollProgressIndicator: React.FC<{
    className?: string;
    color?: string;
    thickness?: number;
}> = ({
    className = '',
    color = 'bg-gradient-to-r from-blue-500 to-purple-600',
    thickness = 4
}) => {
        const progress = useScrollProgress();

        return (
            <motion.div
                className={`fixed top-0 left-0 z-50 origin-left ${color} ${className}`}
                style={{
                    width: '100%',
                    height: thickness,
                    scaleX: progress
                }}
            />
        );
    };

// Scroll-based text reveal
export const ScrollTextReveal: React.FC<{
    text: string;
    className?: string;
    staggerDelay?: number;
}> = ({
    text,
    className = '',
    staggerDelay = 0.05
}) => {
        const [ref, isInView] = useScrollTrigger(0.2);
        const words = text.split(' ');

        return (
            <div ref={ref} className={className}>
                {words.map((word, i) => (
                    <motion.span
                        key={i}
                        className="inline-block mr-2"
                        initial={{
                            opacity: 0,
                            y: 50,
                            rotateX: -90,
                            filter: "blur(4px)"
                        }}
                        animate={isInView ? {
                            opacity: 1,
                            y: 0,
                            rotateX: 0,
                            filter: "blur(0px)"
                        } : {}}
                        transition={{
                            duration: 0.8,
                            delay: i * staggerDelay,
                            ease: "easeOut"
                        }}
                    >
                        {word}
                    </motion.span>
                ))}
            </div>
        );
    };

// Scroll-based number counter
export const ScrollCounter: React.FC<{
    from?: number;
    to: number;
    duration?: number;
    className?: string;
    format?: (value: number) => string;
}> = ({
    from = 0,
    to,
    duration = 2,
    className = '',
    format = (value) => Math.round(value).toString()
}) => {
        const [ref, isInView] = useScrollTrigger(0.3);
        const [displayValue, setDisplayValue] = useState(from);

        useEffect(() => {
            if (isInView) {
                let startTime: number;

                const animateCounter = (currentTime: number) => {
                    if (!startTime) startTime = currentTime;
                    const elapsed = (currentTime - startTime) / 1000;
                    const progress = Math.min(elapsed / duration, 1);

                    const easeProgress = 1 - Math.pow(1 - progress, 3);
                    const currentValue = from + (to - from) * easeProgress;

                    setDisplayValue(currentValue);

                    if (progress < 1) {
                        requestAnimationFrame(animateCounter);
                    }
                };

                requestAnimationFrame(animateCounter);
            }
        }, [isInView, from, to, duration]);

        return (
            <motion.span ref={ref} className={className}>
                {format(displayValue)}
            </motion.span>
        );
    };

// Sticky scroll section with progress
export const StickyScrollSection: React.FC<{
    children: React.ReactNode;
    className?: string;
    progressIndicator?: boolean;
}> = ({
    children,
    className = '',
    progressIndicator = true
}) => {
        const containerRef = useRef<HTMLDivElement>(null);
        const { scrollYProgress } = useScroll({
            target: containerRef,
            offset: ["start start", "end end"]
        });

        const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0.5, 1, 1, 0.5]);
        const scale = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0.95, 1, 1, 0.95]);

        return (
            <div ref={containerRef} className={`relative ${className}`}>
                {progressIndicator && (
                    <motion.div
                        className="absolute left-0 top-0 w-1 bg-gradient-to-b from-blue-500 to-purple-600 origin-top"
                        style={{
                            height: '100%',
                            scaleY: scrollYProgress
                        }}
                    />
                )}

                <motion.div
                    style={{ opacity, scale }}
                    className="sticky top-0"
                >
                    {children}
                </motion.div>
            </div>
        );
    };

export default ScrollTriggerAnimation;