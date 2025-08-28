'use client';

import React, { useEffect, useRef, useState, useMemo } from 'react';
import { useScrollAnimation } from './ScrollAnimationProvider';
import { useTheme } from '@/contexts/ThemeContext';

interface AnimatedSectionProps {
    children: React.ReactNode;
    className?: string;
    style?: React.CSSProperties;
    id?: string;
    animationType?: 'fade-in' | 'slide-up' | 'slide-down' | 'slide-left' | 'slide-right' | 'zoom-in' | 'zoom-out' | 'rotate-in' | 'custom';
    duration?: number;
    delay?: number;
    threshold?: number;
    triggerOnce?: boolean;
    parallaxSpeed?: number;
    transformOrigin?: string;
    customAnimation?: {
        initial: React.CSSProperties;
        animate: React.CSSProperties;
    };
    staggerChildren?: number;
    debugMode?: boolean;
}

type AnimationVariant = {
    initial: React.CSSProperties;
    animate: React.CSSProperties;
};

const animationVariants: Record<string, AnimationVariant> = {
    'fade-in': {
        initial: { opacity: 0 },
        animate: { opacity: 1 }
    },
    'slide-up': {
        initial: { opacity: 0, transform: 'translateY(60px)' },
        animate: { opacity: 1, transform: 'translateY(0px)' }
    },
    'slide-down': {
        initial: { opacity: 0, transform: 'translateY(-60px)' },
        animate: { opacity: 1, transform: 'translateY(0px)' }
    },
    'slide-left': {
        initial: { opacity: 0, transform: 'translateX(60px)' },
        animate: { opacity: 1, transform: 'translateX(0px)' }
    },
    'slide-right': {
        initial: { opacity: 0, transform: 'translateX(-60px)' },
        animate: { opacity: 1, transform: 'translateX(0px)' }
    },
    'zoom-in': {
        initial: { opacity: 0, transform: 'scale(0.8)' },
        animate: { opacity: 1, transform: 'scale(1)' }
    },
    'zoom-out': {
        initial: { opacity: 0, transform: 'scale(1.2)' },
        animate: { opacity: 1, transform: 'scale(1)' }
    },
    'rotate-in': {
        initial: { opacity: 0, transform: 'rotate(-10deg) scale(0.9)' },
        animate: { opacity: 1, transform: 'rotate(0deg) scale(1)' }
    }
};

export const AnimatedSection: React.FC<AnimatedSectionProps> = ({
    children,
    className = '',
    style = {},
    id,
    animationType = 'fade-in',
    duration = 0.8,
    delay = 0,
    threshold = 0.1,
    triggerOnce = true,
    parallaxSpeed = 0,
    transformOrigin = 'center',
    customAnimation,
    staggerChildren = 0,
    debugMode = false
}) => {
    const { theme } = useTheme();
    const { scrollY, registerElement, unregisterElement, isElementVisible, getElementProgress } = useScrollAnimation();
    const sectionRef = useRef<HTMLDivElement>(null);
    const [hasTriggered, setHasTriggered] = useState(false);
    const [childElements, setChildElements] = useState<HTMLElement[]>([]);
    const elementId = id || `animated-section-${Math.random().toString(36).substr(2, 9)}`;

    // Register element with scroll animation system
    useEffect(() => {
        if (sectionRef.current) {
            registerElement(elementId, sectionRef.current, {
                threshold: Array.from({ length: 21 }, (_, i) => i * 0.05), // 0, 0.05, 0.1, ..., 1.0
                rootMargin: '-10% 0px -10% 0px'
            });

            // Collect child elements for staggered animations
            if (staggerChildren > 0) {
                const children = Array.from(sectionRef.current.children) as HTMLElement[];
                setChildElements(children);
            }
        }

        return () => {
            unregisterElement(elementId);
        };
    }, [elementId, registerElement, unregisterElement, staggerChildren]);

    const isVisible = isElementVisible(elementId);
    const progress = getElementProgress(elementId);

    // Handle trigger once logic
    useEffect(() => {
        if (isVisible && !hasTriggered) {
            setHasTriggered(true);
        }
    }, [isVisible, hasTriggered]);

    const shouldAnimate = triggerOnce ? hasTriggered : isVisible;

    // Calculate animation styles
    const animationStyles = useMemo(() => {
        const variant = customAnimation || animationVariants[animationType];
        if (!variant) return {};

        const baseStyles: React.CSSProperties = {
            transition: `all ${duration}s cubic-bezier(0.4, 0, 0.2, 1) ${delay}s`,
            transformOrigin,
            willChange: 'transform, opacity'
        };

        // Parallax effect
        if (parallaxSpeed !== 0 && sectionRef.current) {
            const rect = sectionRef.current.getBoundingClientRect();
            const scrollProgress = (window.innerHeight - rect.top) / (window.innerHeight + rect.height);
            const parallaxOffset = scrollProgress * parallaxSpeed;

            baseStyles.transform = `${baseStyles.transform || ''} translateY(${parallaxOffset}px)`;
        }

        if (shouldAnimate) {
            return {
                ...baseStyles,
                ...variant.animate
            };
        } else {
            return {
                ...baseStyles,
                ...variant.initial
            };
        }
    }, [animationType, customAnimation, duration, delay, transformOrigin, shouldAnimate, parallaxSpeed, scrollY]);

    // Apply staggered animations to children
    useEffect(() => {
        if (staggerChildren > 0 && shouldAnimate && childElements.length > 0) {
            childElements.forEach((child, index) => {
                const staggerDelay = (delay + index * staggerChildren) * 1000;

                setTimeout(() => {
                    child.style.transition = `all ${duration}s cubic-bezier(0.4, 0, 0.2, 1)`;
                    child.style.opacity = '1';
                    child.style.transform = 'translateY(0px) scale(1)';
                }, staggerDelay);
            });
        } else if (staggerChildren > 0 && !shouldAnimate && childElements.length > 0) {
            childElements.forEach((child) => {
                child.style.opacity = '0';
                child.style.transform = 'translateY(30px) scale(0.95)';
            });
        }
    }, [shouldAnimate, childElements, staggerChildren, delay, duration]);

    // Debug information
    const debugInfo = debugMode ? {
        isVisible,
        progress: Math.round(progress * 100),
        hasTriggered,
        shouldAnimate,
        elementId
    } : null;

    return (
        <div
            ref={sectionRef}
            className={`relative ${className}`}
            style={{
                ...style,
                ...animationStyles
            }}
            data-animation-id={elementId}
        >
            {debugMode && (
                <div
                    className={`fixed top-4 left-4 z-50 p-3 rounded-lg text-xs font-mono ${theme === 'dark'
                            ? 'bg-black/80 text-green-400 border border-green-500/30'
                            : 'bg-white/90 text-green-700 border border-green-500/30'
                        }`}
                    style={{ backdropFilter: 'blur(10px)' }}
                >
                    <div className="font-bold mb-2">Debug: {elementId}</div>
                    <div>Visible: {debugInfo?.isVisible ? '✓' : '✗'}</div>
                    <div>Progress: {debugInfo?.progress}%</div>
                    <div>Triggered: {debugInfo?.hasTriggered ? '✓' : '✗'}</div>
                    <div>Animating: {debugInfo?.shouldAnimate ? '✓' : '✗'}</div>
                </div>
            )}

            {children}
        </div>
    );
};

// Enhanced animated text component with character-by-character animation
interface AnimatedTextProps {
    text: string;
    className?: string;
    style?: React.CSSProperties;
    animationType?: 'typewriter' | 'fade-in-chars' | 'slide-up-chars' | 'bounce-in-chars';
    duration?: number;
    delay?: number;
    characterDelay?: number;
    trigger?: boolean;
}

export const AnimatedText: React.FC<AnimatedTextProps> = ({
    text,
    className = '',
    style = {},
    animationType = 'fade-in-chars',
    duration = 0.05,
    delay = 0,
    characterDelay = 0.03,
    trigger = true
}) => {
    const [animatedText, setAnimatedText] = useState('');
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        if (!trigger) {
            setAnimatedText('');
            setCurrentIndex(0);
            return;
        }

        const timeout = setTimeout(() => {
            if (currentIndex < text.length) {
                if (animationType === 'typewriter') {
                    setAnimatedText(text.substring(0, currentIndex + 1));
                }
                setCurrentIndex(prev => prev + 1);
            }
        }, delay * 1000 + currentIndex * characterDelay * 1000);

        return () => clearTimeout(timeout);
    }, [trigger, currentIndex, text, animationType, delay, characterDelay]);

    if (animationType === 'typewriter') {
        return (
            <span className={className} style={style}>
                {animatedText}
                {currentIndex < text.length && (
                    <span className="animate-pulse">|</span>
                )}
            </span>
        );
    }

    // Character-by-character animations
    return (
        <span className={className} style={style}>
            {text.split('').map((char, index) => (
                <span
                    key={index}
                    className="inline-block"
                    style={{
                        opacity: trigger && index <= currentIndex ? 1 : 0,
                        transform: trigger && index <= currentIndex
                            ? 'translateY(0px) scale(1)'
                            : 'translateY(20px) scale(0.8)',
                        transition: `all ${duration}s cubic-bezier(0.4, 0, 0.2, 1) ${delay + index * characterDelay
                            }s`
                    }}
                >
                    {char === ' ' ? '\u00A0' : char}
                </span>
            ))}
        </span>
    );
};