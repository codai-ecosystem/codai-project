'use client';

import React, { useRef, useEffect, type ReactNode, type MouseEvent, type KeyboardEvent } from 'react';
import { useMotion } from '@/contexts/MotionContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn, announceToScreenReader } from '@/utils';

interface InteractiveElementProps {
    /**
     * Element content
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
     * Element tag to render
     */
    as?: 'button' | 'div' | 'span' | 'a';
    
    /**
     * Click handler
     */
    onClick?: () => void;
    
    /**
     * Href for anchor elements
     */
    href?: string;
    
    /**
     * Accessibility label
     */
    ariaLabel?: string;
    
    /**
     * Whether element is disabled
     */
    disabled?: boolean;
    
    /**
     * Loading state
     */
    loading?: boolean;
    
    /**
     * Success feedback animation
     */
    showSuccessFeedback?: boolean;
    
    /**
     * Error feedback animation
     */
    showErrorFeedback?: boolean;
    
    /**
     * Hover animation preset
     */
    hoverAnimation?: 'scale' | 'glow' | 'lift' | 'pulse' | 'none';
    
    /**
     * Click animation preset
     */
    clickAnimation?: 'scale' | 'ripple' | 'bounce' | 'none';
    
    /**
     * Announcement text for screen readers on interaction
     */
    announceOnClick?: string;
}

/**
 * InteractiveElement Component
 * Provides accessible interactions with animation feedback
 */
export function InteractiveElement({
    children,
    className,
    testId,
    as: Component = 'button',
    onClick,
    href,
    ariaLabel,
    disabled = false,
    loading = false,
    showSuccessFeedback = false,
    showErrorFeedback = false,
    hoverAnimation = 'scale',
    clickAnimation = 'scale',
    announceOnClick,
}: InteractiveElementProps) {
    const { motionPreference } = useMotion();
    const { t } = useLanguage();
    const elementRef = useRef<HTMLElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);
    const anchorRef = useRef<HTMLAnchorElement>(null);
    const divRef = useRef<HTMLDivElement>(null);
    const rippleTimeoutRef = useRef<NodeJS.Timeout>();

    useEffect(() => {
        return () => {
            if (rippleTimeoutRef.current) {
                clearTimeout(rippleTimeoutRef.current);
            }
        };
    }, []);

    const handleClick = (event: MouseEvent<HTMLElement>) => {
        if (disabled || loading) {
            event.preventDefault();
            return;
        }

        // Create ripple effect for ripple animation
        if (clickAnimation === 'ripple' && motionPreference !== 'disabled') {
            const element = elementRef.current;
            if (element) {
                const rect = element.getBoundingClientRect();
                const size = Math.max(rect.width, rect.height);
                const x = event.clientX - rect.left - size / 2;
                const y = event.clientY - rect.top - size / 2;

                const ripple = document.createElement('div');
                ripple.style.cssText = `
                    position: absolute;
                    width: ${size}px;
                    height: ${size}px;
                    left: ${x}px;
                    top: ${y}px;
                    background: rgba(255, 255, 255, 0.5);
                    border-radius: 50%;
                    transform: scale(0);
                    animation: ripple 0.6s linear;
                    pointer-events: none;
                    z-index: 1;
                `;

                element.style.position = 'relative';
                element.style.overflow = 'hidden';
                element.appendChild(ripple);

                rippleTimeoutRef.current = setTimeout(() => {
                    ripple.remove();
                }, 600);
            }
        }

        // Screen reader announcement
        if (announceOnClick) {
            announceToScreenReader(announceOnClick, 'assertive');
        }

        onClick?.();
    };

    const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
        if (disabled || loading) {
            return;
        }

        // Handle Enter and Space for non-button elements
        if (Component !== 'button' && (event.key === 'Enter' || event.key === ' ')) {
            event.preventDefault();
            handleClick(event as any);
        }
    };

    const elementClasses = cn(
        'interactive-element',
        'relative',
        'outline-none',
        'transition-all',
        'duration-200',
        'ease-out',
        
        // Focus styles
        'focus-visible:ring-2',
        'focus-visible:ring-blue-500',
        'focus-visible:ring-offset-2',
        
        // Disabled styles
        disabled && 'opacity-50',
        disabled && 'cursor-not-allowed',
        disabled && 'pointer-events-none',
        
        // Loading styles
        loading && 'cursor-wait',
        loading && 'pointer-events-none',
        
        // Hover animations (only if motion is enabled)
        motionPreference !== 'disabled' && !disabled && !loading && hoverAnimation === 'scale' && 'hover:scale-105',
        motionPreference !== 'disabled' && !disabled && !loading && hoverAnimation === 'glow' && 'hover:shadow-lg hover:shadow-blue-500/25',
        motionPreference !== 'disabled' && !disabled && !loading && hoverAnimation === 'lift' && 'hover:shadow-xl hover:-translate-y-1',
        motionPreference !== 'disabled' && !disabled && !loading && hoverAnimation === 'pulse' && 'hover:animate-pulse',
        
        // Click animations (only if motion is enabled)
        motionPreference !== 'disabled' && !disabled && !loading && clickAnimation === 'scale' && 'active:scale-95',
        motionPreference !== 'disabled' && !disabled && !loading && clickAnimation === 'bounce' && 'active:animate-bounce',
        
        // Feedback states
        showSuccessFeedback && 'ring-2 ring-green-500 bg-green-50',
        showErrorFeedback && 'ring-2 ring-red-500 bg-red-50',
        
        className
    );

    // Render based on component type
    if (Component === 'a') {
        return (
            <a
                ref={anchorRef}
                className={elementClasses}
                onClick={handleClick}
                onKeyDown={handleKeyDown}
                data-testid={testId}
                aria-label={ariaLabel}
                aria-disabled={disabled}
                aria-busy={loading}
                href={disabled || loading ? undefined : href}
                rel={href?.startsWith('http') ? 'noopener noreferrer' : undefined}
                target={href?.startsWith('http') ? '_blank' : undefined}
            >
                {loading && (
                    <span className="sr-only">{t('common.loading')}</span>
                )}
                {children}
            </a>
        );
    }

    if (Component === 'button') {
        return (
            <button
                ref={buttonRef}
                className={elementClasses}
                onClick={handleClick}
                onKeyDown={handleKeyDown}
                data-testid={testId}
                aria-label={ariaLabel}
                aria-disabled={disabled}
                aria-busy={loading}
                type="button"
                disabled={disabled || loading}
            >
                {loading && (
                    <span className="sr-only">{t('common.loading')}</span>
                )}
                {children}
            </button>
        );
    }

    // For div and span elements
    return (
        <div
            ref={divRef}
            className={elementClasses}
            onClick={handleClick}
            onKeyDown={handleKeyDown}
            data-testid={testId}
            aria-label={ariaLabel}
            aria-disabled={disabled}
            aria-busy={loading}
            role="button"
            tabIndex={0}
        >
            {loading && (
                <span className="sr-only">{t('common.loading')}</span>
            )}
            {children}
        </div>
    );
}

// CSS for ripple animation (should be added to global styles)
export const rippleStyles = `
@keyframes ripple {
    to {
        transform: scale(4);
        opacity: 0;
    }
}
`;