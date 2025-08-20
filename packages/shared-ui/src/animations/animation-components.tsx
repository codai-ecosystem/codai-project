// 🎬 Animation Component Library - React Components with Manual TypeScript Animation System
// Version: 2.0.0 - Week 2 Phase 2 Advanced Animations

import React, { useRef, useEffect, useState, forwardRef } from 'react';
import { useAnimation, useReducedMotion, useIntersectionObserver } from './core-animation-system';
import type { AnimationConfig, TransitionConfig } from './core-animation-system';

// =================================
// Animated Container Components
// =================================

interface AnimatedContainerProps {
    children: React.ReactNode;
    animation?: string;
    delay?: number;
    duration?: number;
    className?: string;
    onAnimationComplete?: () => void;
}

export const AnimatedContainer = forwardRef<HTMLDivElement, AnimatedContainerProps>(
    ({ children, animation = 'fadeIn', delay = 0, duration = 300, className = '', onAnimationComplete }, ref) => {
        const { animate, isAnimating } = useAnimation();
        const prefersReducedMotion = useReducedMotion();
        const containerRef = useRef<HTMLDivElement>(null);

        useEffect(() => {
            if (prefersReducedMotion) {
                onAnimationComplete?.();
                return;
            }

            const element = containerRef.current;
            if (!element) return;

            const config: AnimationConfig = {
                preset: animation as any,
                duration,
                delay,
                onComplete: onAnimationComplete
            };

            animate(element, config);
        }, [animation, delay, duration, onAnimationComplete, animate, prefersReducedMotion]);

        return (
            <div
                ref={ref || containerRef}
                className={`${className} ${isAnimating ? 'gpu-layer' : 'gpu-layer-auto'}`}
                style={{
                    opacity: prefersReducedMotion ? 1 : 0
                }}
            >
                {children}
            </div>
        );
    }
);

AnimatedContainer.displayName = 'AnimatedContainer';

// =================================
// Page Transition Components
// =================================

interface PageTransitionProps {
    children: React.ReactNode;
    transitionKey: string;
    direction?: 'up' | 'down' | 'left' | 'right';
    duration?: number;
    className?: string;
}

export const PageTransition: React.FC<PageTransitionProps> = ({
    children,
    transitionKey,
    direction = 'up',
    duration = 500,
    className = ''
}) => {
    const { animate } = useAnimation();
    const prefersReducedMotion = useReducedMotion();
    const [isVisible, setIsVisible] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (prefersReducedMotion) {
            setIsVisible(true);
            return;
        }

        const element = containerRef.current;
        if (!element) return;

        // Exit animation for previous content
        if (isVisible) {
            const exitConfig: AnimationConfig = {
                custom: {
                    opacity: [1, 0],
                    transform: direction === 'up' ? ['translateY(0)', 'translateY(-30px)'] :
                        direction === 'down' ? ['translateY(0)', 'translateY(30px)'] :
                            direction === 'left' ? ['translateX(0)', 'translateX(-30px)'] :
                                ['translateX(0)', 'translateX(30px)']
                },
                duration: duration / 2,
                easing: 'ease-in',
                onComplete: () => {
                    setIsVisible(false);
                    // Enter animation for new content
                    setTimeout(() => {
                        const enterConfig: AnimationConfig = {
                            custom: {
                                opacity: [0, 1],
                                transform: direction === 'up' ? ['translateY(30px)', 'translateY(0)'] :
                                    direction === 'down' ? ['translateY(-30px)', 'translateY(0)'] :
                                        direction === 'left' ? ['translateX(30px)', 'translateX(0)'] :
                                            ['translateX(-30px)', 'translateX(0)']
                            },
                            duration: duration / 2,
                            easing: 'ease-out'
                        };
                        animate(element, enterConfig);
                        setIsVisible(true);
                    }, 50);
                }
            };
            animate(element, exitConfig);
        } else {
            // Initial enter animation
            const enterConfig: AnimationConfig = {
                custom: {
                    opacity: [0, 1],
                    transform: direction === 'up' ? ['translateY(30px)', 'translateY(0)'] :
                        direction === 'down' ? ['translateY(-30px)', 'translateY(0)'] :
                            direction === 'left' ? ['translateX(30px)', 'translateX(0)'] :
                                ['translateX(-30px)', 'translateX(0)']
                },
                duration: duration / 2,
                easing: 'ease-out'
            };
            animate(element, enterConfig);
            setIsVisible(true);
        }
    }, [transitionKey, direction, duration, animate, prefersReducedMotion, isVisible]);

    return (
        <div
            ref={containerRef}
            className={`page-transition ${className} gpu-layer`}
            style={{
                opacity: prefersReducedMotion ? 1 : 0
            }}
        >
            {children}
        </div>
    );
};

// =================================
// Loading State Components
// =================================

interface SkeletonProps {
    width?: string | number;
    height?: string | number;
    className?: string;
    variant?: 'text' | 'circular' | 'rectangular';
}

export const Skeleton: React.FC<SkeletonProps> = ({
    width = '100%',
    height = '1rem',
    className = '',
    variant = 'rectangular'
}) => {
    const baseClasses = 'skeleton animate-pulse';
    const variantClasses = {
        text: 'rounded',
        circular: 'rounded-full',
        rectangular: 'rounded-md'
    };

    return (
        <div
            className={`${baseClasses} ${variantClasses[variant]} ${className}`}
            style={{
                width: typeof width === 'number' ? `${width}px` : width,
                height: typeof height === 'number' ? `${height}px` : height
            }}
        />
    );
};

interface LoadingSpinnerProps {
    size?: 'sm' | 'md' | 'lg';
    color?: string;
    className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
    size = 'md',
    color = 'currentColor',
    className = ''
}) => {
    const sizeClasses = {
        sm: 'w-4 h-4',
        md: 'w-6 h-6',
        lg: 'w-8 h-8'
    };

    return (
        <div
            className={`loading-spinner ${sizeClasses[size]} ${className}`}
            style={{ color }}
        >
            <svg className="w-full h-full" viewBox="0 0 24 24" fill="none">
                <circle
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeDasharray="32"
                    strokeDashoffset="32"
                />
            </svg>
        </div>
    );
};

export const LoadingDots: React.FC<{ className?: string }> = ({ className = '' }) => (
    <div className={`loading-dots ${className}`}>
        <span />
        <span />
        <span />
    </div>
);

// =================================
// Modal and Overlay Components
// =================================

interface AnimatedModalProps {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
    className?: string;
    backdropClassName?: string;
}

export const AnimatedModal: React.FC<AnimatedModalProps> = ({
    isOpen,
    onClose,
    children,
    className = '',
    backdropClassName = ''
}) => {
    const { animate } = useAnimation();
    const prefersReducedMotion = useReducedMotion();
    const [isVisible, setIsVisible] = useState(false);
    const backdropRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isOpen) {
            setIsVisible(true);
            if (!prefersReducedMotion) {
                // Animate backdrop
                const backdrop = backdropRef.current;
                if (backdrop) {
                    animate(backdrop, {
                        custom: { opacity: [0, 1] },
                        duration: 300,
                        easing: 'ease-out'
                    });
                }

                // Animate content
                const content = contentRef.current;
                if (content) {
                    animate(content, {
                        custom: {
                            opacity: [0, 1],
                            transform: ['scale(0.9) translate(-50%, -50%)', 'scale(1) translate(-50%, -50%)']
                        },
                        duration: 300,
                        delay: 100,
                        easing: 'ease-out'
                    });
                }
            }
        } else if (isVisible) {
            if (!prefersReducedMotion) {
                // Animate out
                const backdrop = backdropRef.current;
                const content = contentRef.current;

                if (content) {
                    animate(content, {
                        custom: {
                            opacity: [1, 0],
                            transform: ['scale(1) translate(-50%, -50%)', 'scale(0.9) translate(-50%, -50%)']
                        },
                        duration: 200,
                        easing: 'ease-in'
                    });
                }

                if (backdrop) {
                    animate(backdrop, {
                        custom: { opacity: [1, 0] },
                        duration: 200,
                        delay: 100,
                        easing: 'ease-in',
                        onComplete: () => setIsVisible(false)
                    });
                }
            } else {
                setIsVisible(false);
            }
        }
    }, [isOpen, isVisible, animate, prefersReducedMotion]);

    if (!isVisible) return null;

    return (
        <div
            ref={backdropRef}
            className={`fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 ${backdropClassName}`}
            onClick={onClose}
            style={{ opacity: prefersReducedMotion ? 1 : 0 }}
        >
            <div
                ref={contentRef}
                className={`fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-xl max-w-md w-full mx-4 ${className} gpu-layer`}
                onClick={(e) => e.stopPropagation()}
                style={{ opacity: prefersReducedMotion ? 1 : 0 }}
            >
                {children}
            </div>
        </div>
    );
};

// =================================
// Interactive Button Components
// =================================

interface AnimatedButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    isLoading?: boolean;
    icon?: React.ReactNode;
    children: React.ReactNode;
}

export const AnimatedButton = forwardRef<HTMLButtonElement, AnimatedButtonProps>(
    ({ variant = 'primary', size = 'md', isLoading = false, icon, children, className = '', ...props }, ref) => {
        const { animate } = useAnimation();
        const prefersReducedMotion = useReducedMotion();
        const buttonRef = useRef<HTMLButtonElement>(null);

        const baseClasses = 'btn-animated btn-press hover-lift transition-all duration-200';
        const variantClasses = {
            primary: 'bg-blue-600 hover:bg-blue-700 text-white',
            secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-800',
            ghost: 'bg-transparent hover:bg-gray-100 text-gray-600'
        };
        const sizeClasses = {
            sm: 'px-3 py-1.5 text-sm',
            md: 'px-4 py-2 text-base',
            lg: 'px-6 py-3 text-lg'
        };

        const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
            if (!prefersReducedMotion) {
                const button = buttonRef.current || (ref as React.RefObject<HTMLButtonElement>)?.current;
                if (button) {
                    // Ripple effect
                    const rect = button.getBoundingClientRect();
                    const x = e.clientX - rect.left;
                    const y = e.clientY - rect.top;

                    const ripple = document.createElement('span');
                    ripple.style.cssText = `
            position: absolute;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.6);
            transform: scale(0);
            animation: ripple 0.6s linear;
            left: ${x}px;
            top: ${y}px;
            width: 20px;
            height: 20px;
            margin-left: -10px;
            margin-top: -10px;
            pointer-events: none;
          `;

                    button.appendChild(ripple);
                    setTimeout(() => ripple.remove(), 600);

                    // Add ripple animation
                    const style = document.createElement('style');
                    style.textContent = `
            @keyframes ripple {
              to {
                transform: scale(4);
                opacity: 0;
              }
            }
          `;
                    document.head.appendChild(style);
                    setTimeout(() => style.remove(), 600);
                }
            }

            props.onClick?.(e);
        };

        return (
            <button
                ref={ref || buttonRef}
                className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className} relative overflow-hidden rounded-md font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed`}
                onClick={handleClick}
                disabled={isLoading || props.disabled}
                {...props}
            >
                <span className="flex items-center justify-center gap-2">
                    {isLoading ? (
                        <LoadingSpinner size="sm" />
                    ) : (
                        icon && <span className="flex-shrink-0">{icon}</span>
                    )}
                    {children}
                </span>
            </button>
        );
    }
);

AnimatedButton.displayName = 'AnimatedButton';

// =================================
// Card Components
// =================================

interface AnimatedCardProps {
    children: React.ReactNode;
    hover?: boolean;
    flip?: boolean;
    backContent?: React.ReactNode;
    className?: string;
    onHover?: () => void;
    onClick?: () => void;
}

export const AnimatedCard: React.FC<AnimatedCardProps> = ({
    children,
    hover = true,
    flip = false,
    backContent,
    className = '',
    onHover,
    onClick
}) => {
    const baseClasses = 'rounded-lg border bg-white shadow-sm';
    const hoverClasses = hover ? 'card-hover cursor-pointer' : '';
    const flipClasses = flip ? 'card-flip' : '';

    if (flip && backContent) {
        return (
            <div
                className={`${baseClasses} ${flipClasses} ${className}`}
                onMouseEnter={onHover}
                onClick={onClick}
            >
                <div className="card-flip-inner">
                    <div className="card-flip-front p-6">
                        {children}
                    </div>
                    <div className="card-flip-back p-6 bg-gray-50">
                        {backContent}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div
            className={`${baseClasses} ${hoverClasses} ${className} p-6`}
            onMouseEnter={onHover}
            onClick={onClick}
        >
            {children}
        </div>
    );
};

// =================================
// Scroll-Triggered Animation Component
// =================================

interface ScrollAnimationProps {
    children: React.ReactNode;
    animation?: string;
    threshold?: number;
    className?: string;
    once?: boolean;
}

export const ScrollAnimation: React.FC<ScrollAnimationProps> = ({
    children,
    animation = 'fadeIn',
    threshold = 0.1,
    className = '',
    once = true
}) => {
    const { animate } = useAnimation();
    const prefersReducedMotion = useReducedMotion();
    const [hasAnimated, setHasAnimated] = useState(false);
    const elementRef = useRef<HTMLDivElement>(null);

    const { isIntersecting } = useIntersectionObserver(elementRef, {
        threshold,
        rootMargin: '50px'
    });

    useEffect(() => {
        if (prefersReducedMotion) return;
        if (once && hasAnimated) return;

        const element = elementRef.current;
        if (!element) return;

        if (isIntersecting) {
            const config: AnimationConfig = {
                preset: animation as any,
                duration: 600,
                easing: 'ease-out'
            };

            animate(element, config);
            setHasAnimated(true);
        }
    }, [isIntersecting, animation, animate, prefersReducedMotion, once, hasAnimated]);

    return (
        <div
            ref={elementRef}
            className={`animate-on-scroll ${className}`}
            style={{
                opacity: prefersReducedMotion ? 1 : 0
            }}
        >
            {children}
        </div>
    );
};

// =================================
// Stagger Animation Container
// =================================

interface StaggerContainerProps {
    children: React.ReactNode;
    staggerDelay?: number;
    animation?: string;
    className?: string;
}

export const StaggerContainer: React.FC<StaggerContainerProps> = ({
    children,
    staggerDelay = 100,
    animation = 'fadeIn',
    className = ''
}) => {
    const { animate } = useAnimation();
    const prefersReducedMotion = useReducedMotion();
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (prefersReducedMotion) return;

        const container = containerRef.current;
        if (!container) return;

        const childElements = Array.from(container.children) as HTMLElement[];

        childElements.forEach((child, index) => {
            const config: AnimationConfig = {
                preset: animation as any,
                duration: 400,
                delay: index * staggerDelay,
                easing: 'ease-out'
            };

            animate(child, config);
        });
    }, [animation, staggerDelay, animate, prefersReducedMotion]);

    return (
        <div ref={containerRef} className={`stagger-container ${className}`}>
            {React.Children.map(children, (child, index) => (
                <div
                    key={index}
                    style={{
                        '--stagger-index': index,
                        opacity: prefersReducedMotion ? 1 : 0
                    } as React.CSSProperties}
                >
                    {child}
                </div>
            ))}
        </div>
    );
};

// =================================
// Progress Animation Component
// =================================

interface AnimatedProgressProps {
    value: number;
    max?: number;
    className?: string;
    showPercentage?: boolean;
    color?: string;
    height?: string;
}

export const AnimatedProgress: React.FC<AnimatedProgressProps> = ({
    value,
    max = 100,
    className = '',
    showPercentage = true,
    color = '#3b82f6',
    height = '8px'
}) => {
    const { animate } = useAnimation();
    const prefersReducedMotion = useReducedMotion();
    const [animatedValue, setAnimatedValue] = useState(0);
    const progressRef = useRef<HTMLDivElement>(null);

    const percentage = Math.min((value / max) * 100, 100);

    useEffect(() => {
        if (prefersReducedMotion) {
            setAnimatedValue(percentage);
            return;
        }

        const progress = progressRef.current;
        if (!progress) return;

        animate(progress, {
            custom: {
                width: [`${animatedValue}%`, `${percentage}%`]
            },
            duration: 1000,
            easing: 'ease-out',
            onUpdate: (values) => {
                const currentWidth = parseFloat(values.width as string);
                setAnimatedValue(currentWidth);
            }
        });
    }, [percentage, animatedValue, animate, prefersReducedMotion]);

    return (
        <div className={`progress-animated ${className}`} style={{ height }}>
            <div
                ref={progressRef}
                className="progress-bar"
                style={{
                    width: prefersReducedMotion ? `${percentage}%` : '0%',
                    backgroundColor: color
                }}
            />
            {showPercentage && (
                <div className="absolute inset-0 flex items-center justify-center text-xs font-medium text-gray-700">
                    {Math.round(prefersReducedMotion ? percentage : animatedValue)}%
                </div>
            )}
        </div>
    );
};

// =================================
// Notification/Toast Component
// =================================

interface NotificationProps {
    message: string;
    type?: 'success' | 'error' | 'warning' | 'info';
    isVisible: boolean;
    onClose: () => void;
    autoClose?: boolean;
    duration?: number;
}

export const AnimatedNotification: React.FC<NotificationProps> = ({
    message,
    type = 'info',
    isVisible,
    onClose,
    autoClose = true,
    duration = 5000
}) => {
    const { animate } = useAnimation();
    const prefersReducedMotion = useReducedMotion();
    const [shouldRender, setShouldRender] = useState(false);
    const notificationRef = useRef<HTMLDivElement>(null);

    const typeStyles = {
        success: 'bg-green-50 border-green-200 text-green-800',
        error: 'bg-red-50 border-red-200 text-red-800',
        warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
        info: 'bg-blue-50 border-blue-200 text-blue-800'
    };

    useEffect(() => {
        if (isVisible) {
            setShouldRender(true);
            if (!prefersReducedMotion) {
                const element = notificationRef.current;
                if (element) {
                    animate(element, {
                        custom: {
                            opacity: [0, 1],
                            transform: ['translateX(100%)', 'translateX(0)']
                        },
                        duration: 300,
                        easing: 'ease-out'
                    });
                }
            }

            if (autoClose) {
                const timer = setTimeout(() => {
                    handleClose();
                }, duration);

                return () => clearTimeout(timer);
            }
        } else if (shouldRender) {
            handleClose();
        }
    }, [isVisible, autoClose, duration]);

    const handleClose = () => {
        if (!prefersReducedMotion) {
            const element = notificationRef.current;
            if (element) {
                animate(element, {
                    custom: {
                        opacity: [1, 0],
                        transform: ['translateX(0)', 'translateX(100%)']
                    },
                    duration: 200,
                    easing: 'ease-in',
                    onComplete: () => {
                        setShouldRender(false);
                        onClose();
                    }
                });
            }
        } else {
            setShouldRender(false);
            onClose();
        }
    };

    if (!shouldRender) return null;

    return (
        <div
            ref={notificationRef}
            className={`fixed top-4 right-4 z-50 max-w-sm w-full border rounded-lg shadow-lg p-4 ${typeStyles[type]} gpu-layer`}
            style={{ opacity: prefersReducedMotion ? 1 : 0 }}
        >
            <div className="flex items-start justify-between">
                <p className="flex-1 text-sm font-medium">{message}</p>
                <button
                    onClick={handleClose}
                    className="ml-2 flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
        </div>
    );
};

export default {
    AnimatedContainer,
    PageTransition,
    Skeleton,
    LoadingSpinner,
    LoadingDots,
    AnimatedModal,
    AnimatedButton,
    AnimatedCard,
    ScrollAnimation,
    StaggerContainer,
    AnimatedProgress,
    AnimatedNotification
};
