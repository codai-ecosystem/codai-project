/**
 * @fileoverview Touch Gesture Creator
 * @description Creates touch gesture components and hooks
 */

const fs = require('fs');
const path = require('path');

function createTouchGestures(componentsDir) {
    createSwipeableComponent(componentsDir);
    createTouchHooks(componentsDir);
    createGestureProviders(componentsDir);
}

function createSwipeableComponent(componentsDir) {
    const swipeableContent = `'use client';

import React, { useRef, useCallback } from 'react';
import { useTouchGestures } from '../utils/touchGestureHandler';

interface SwipeableProps {
    children: React.ReactNode;
    onSwipeLeft?: () => void;
    onSwipeRight?: () => void;
    onSwipeUp?: () => void;
    onSwipeDown?: () => void;
    onTap?: () => void;
    onLongPress?: () => void;
    threshold?: number;
    className?: string;
    disabled?: boolean;
}

export default function Swipeable({
    children,
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown,
    onTap,
    onLongPress,
    threshold = 50,
    className = '',
    disabled = false
}: SwipeableProps) {
    const ref = useRef<HTMLDivElement>(null);

    const handleSwipe = useCallback((event: CustomEvent) => {
        if (disabled) return;
        
        const { direction } = event.detail;
        
        switch (direction) {
            case 'left':
                onSwipeLeft?.();
                break;
            case 'right':
                onSwipeRight?.();
                break;
            case 'up':
                onSwipeUp?.();
                break;
            case 'down':
                onSwipeDown?.();
                break;
        }
    }, [onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown, disabled]);

    const handleTap = useCallback((event: CustomEvent) => {
        if (disabled) return;
        onTap?.();
    }, [onTap, disabled]);

    const handleLongPress = useCallback((event: CustomEvent) => {
        if (disabled) return;
        onLongPress?.();
    }, [onLongPress, disabled]);

    React.useEffect(() => {
        const element = ref.current;
        if (!element) return;

        element.addEventListener('swipe', handleSwipe as EventListener);
        element.addEventListener('tap', handleTap as EventListener);
        element.addEventListener('longpress', handleLongPress as EventListener);

        return () => {
            element.removeEventListener('swipe', handleSwipe as EventListener);
            element.removeEventListener('tap', handleTap as EventListener);
            element.removeEventListener('longpress', handleLongPress as EventListener);
        };
    }, [handleSwipe, handleTap, handleLongPress]);

    useTouchGestures(ref, { 
        swipeThreshold: threshold,
        tapTimeout: 300,
        longPressTimeout: 500
    });

    return (
        <div 
            ref={ref}
            className={\`\${disabled ? 'pointer-events-none' : 'touch-action-manipulation'} \${className}\`}
        >
            {children}
        </div>
    );
}

interface SwipeableCardProps {
    children: React.ReactNode;
    onSwipeLeft?: () => void;
    onSwipeRight?: () => void;
    leftAction?: React.ReactNode;
    rightAction?: React.ReactNode;
    className?: string;
}

export function SwipeableCard({
    children,
    onSwipeLeft,
    onSwipeRight,
    leftAction,
    rightAction,
    className = ''
}: SwipeableCardProps) {
    const [swipeOffset, setSwipeOffset] = React.useState(0);
    const [isAnimating, setIsAnimating] = React.useState(false);
    const cardRef = useRef<HTMLDivElement>(null);
    const startX = useRef(0);
    const currentX = useRef(0);

    const handleTouchStart = (e: React.TouchEvent) => {
        startX.current = e.touches[0].clientX;
        setIsAnimating(false);
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        currentX.current = e.touches[0].clientX;
        const diff = currentX.current - startX.current;
        setSwipeOffset(diff);
    };

    const handleTouchEnd = () => {
        const diff = currentX.current - startX.current;
        const threshold = 100;

        if (Math.abs(diff) > threshold) {
            if (diff > 0 && onSwipeRight) {
                onSwipeRight();
            } else if (diff < 0 && onSwipeLeft) {
                onSwipeLeft();
            }
        }

        setIsAnimating(true);
        setSwipeOffset(0);
    };

    return (
        <div className="relative overflow-hidden rounded-lg">
            {/* Left Action */}
            {leftAction && (
                <div className="absolute left-0 top-0 bottom-0 flex items-center justify-start pl-4 bg-green-500 text-white">
                    {leftAction}
                </div>
            )}

            {/* Right Action */}
            {rightAction && (
                <div className="absolute right-0 top-0 bottom-0 flex items-center justify-end pr-4 bg-red-500 text-white">
                    {rightAction}
                </div>
            )}

            {/* Main Card */}
            <div
                ref={cardRef}
                className={\`bg-white dark:bg-slate-800 rounded-lg \${isAnimating ? 'transition-transform duration-300' : ''} \${className}\`}
                style={{
                    transform: \`translateX(\${swipeOffset}px)\`
                }}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
            >
                {children}
            </div>
        </div>
    );
}`;

    fs.writeFileSync(path.join(componentsDir, 'Swipeable.tsx'), swipeableContent);
}

function createTouchHooks(componentsDir) {
    const utilsDir = path.join(path.dirname(componentsDir), 'hooks');
    if (!fs.existsSync(utilsDir)) {
        fs.mkdirSync(utilsDir, { recursive: true });
    }

    const touchHooksContent = `'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

interface TouchPoint {
    x: number;
    y: number;
    timestamp: number;
}

interface UseSwipeOptions {
    threshold?: number;
    onSwipeLeft?: () => void;
    onSwipeRight?: () => void;
    onSwipeUp?: () => void;
    onSwipeDown?: () => void;
}

export function useSwipe(options: UseSwipeOptions) {
    const {
        threshold = 50,
        onSwipeLeft,
        onSwipeRight,
        onSwipeUp,
        onSwipeDown
    } = options;

    const touchStart = useRef<TouchPoint | null>(null);

    const handleTouchStart = useCallback((e: TouchEvent) => {
        const touch = e.touches[0];
        touchStart.current = {
            x: touch.clientX,
            y: touch.clientY,
            timestamp: Date.now()
        };
    }, []);

    const handleTouchEnd = useCallback((e: TouchEvent) => {
        if (!touchStart.current) return;

        const touch = e.changedTouches[0];
        const deltaX = touch.clientX - touchStart.current.x;
        const deltaY = touch.clientY - touchStart.current.y;
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

        if (distance < threshold) return;

        const isHorizontal = Math.abs(deltaX) > Math.abs(deltaY);

        if (isHorizontal) {
            if (deltaX > 0) {
                onSwipeRight?.();
            } else {
                onSwipeLeft?.();
            }
        } else {
            if (deltaY > 0) {
                onSwipeDown?.();
            } else {
                onSwipeUp?.();
            }
        }

        touchStart.current = null;
    }, [threshold, onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown]);

    return {
        onTouchStart: handleTouchStart,
        onTouchEnd: handleTouchEnd
    };
}

interface UseLongPressOptions {
    onLongPress?: () => void;
    delay?: number;
    threshold?: number;
}

export function useLongPress(options: UseLongPressOptions) {
    const { onLongPress, delay = 500, threshold = 10 } = options;
    const [longPressTriggered, setLongPressTriggered] = useState(false);
    const timeout = useRef<NodeJS.Timeout>();
    const target = useRef<EventTarget | null>(null);
    const startPosition = useRef<{ x: number; y: number } | null>(null);

    const start = useCallback((event: React.MouseEvent | React.TouchEvent) => {
        const clientX = 'touches' in event ? event.touches[0].clientX : event.clientX;
        const clientY = 'touches' in event ? event.touches[0].clientY : event.clientY;
        
        startPosition.current = { x: clientX, y: clientY };
        target.current = event.target;
        
        timeout.current = setTimeout(() => {
            onLongPress?.();
            setLongPressTriggered(true);
        }, delay);
    }, [onLongPress, delay]);

    const clear = useCallback((event: React.MouseEvent | React.TouchEvent, shouldTriggerClick = true) => {
        timeout.current && clearTimeout(timeout.current);
        
        if (startPosition.current && threshold > 0) {
            const clientX = 'changedTouches' in event ? event.changedTouches[0].clientX : event.clientX;
            const clientY = 'changedTouches' in event ? event.changedTouches[0].clientY : event.clientY;
            
            const distance = Math.sqrt(
                Math.pow(clientX - startPosition.current.x, 2) + 
                Math.pow(clientY - startPosition.current.y, 2)
            );
            
            if (distance > threshold) {
                setLongPressTriggered(false);
                return;
            }
        }
        
        if (shouldTriggerClick && !longPressTriggered) {
            // Regular click
        }
        
        setLongPressTriggered(false);
    }, [threshold, longPressTriggered]);

    return {
        onMouseDown: (e: React.MouseEvent) => start(e),
        onTouchStart: (e: React.TouchEvent) => start(e),
        onMouseUp: (e: React.MouseEvent) => clear(e),
        onMouseLeave: (e: React.MouseEvent) => clear(e, false),
        onTouchEnd: (e: React.TouchEvent) => clear(e)
    };
}

interface UseDoubleClickOptions {
    onDoubleClick?: () => void;
    delay?: number;
}

export function useDoubleClick(options: UseDoubleClickOptions) {
    const { onDoubleClick, delay = 300 } = options;
    const [clickCount, setClickCount] = useState(0);
    const timeout = useRef<NodeJS.Timeout>();

    const handleClick = useCallback(() => {
        setClickCount(prev => prev + 1);
        
        if (timeout.current) {
            clearTimeout(timeout.current);
        }
        
        timeout.current = setTimeout(() => {
            if (clickCount === 1) {
                onDoubleClick?.();
            }
            setClickCount(0);
        }, delay);
    }, [clickCount, onDoubleClick, delay]);

    useEffect(() => {
        return () => {
            if (timeout.current) {
                clearTimeout(timeout.current);
            }
        };
    }, []);

    return handleClick;
}

interface UsePinchZoomOptions {
    onPinch?: (scale: number) => void;
    minScale?: number;
    maxScale?: number;
}

export function usePinchZoom(options: UsePinchZoomOptions) {
    const { onPinch, minScale = 0.5, maxScale = 3 } = options;
    const [scale, setScale] = useState(1);
    const lastDistance = useRef(0);

    const getDistance = (touches: TouchList) => {
        const touch1 = touches[0];
        const touch2 = touches[1];
        
        return Math.sqrt(
            Math.pow(touch2.clientX - touch1.clientX, 2) + 
            Math.pow(touch2.clientY - touch1.clientY, 2)
        );
    };

    const handleTouchStart = useCallback((e: TouchEvent) => {
        if (e.touches.length === 2) {
            lastDistance.current = getDistance(e.touches);
        }
    }, []);

    const handleTouchMove = useCallback((e: TouchEvent) => {
        if (e.touches.length === 2) {
            const currentDistance = getDistance(e.touches);
            const scaleChange = currentDistance / lastDistance.current;
            
            setScale(prevScale => {
                const newScale = Math.min(Math.max(prevScale * scaleChange, minScale), maxScale);
                onPinch?.(newScale);
                return newScale;
            });
            
            lastDistance.current = currentDistance;
        }
    }, [minScale, maxScale, onPinch]);

    const handleTouchEnd = useCallback(() => {
        lastDistance.current = 0;
    }, []);

    return {
        scale,
        onTouchStart: handleTouchStart,
        onTouchMove: handleTouchMove,
        onTouchEnd: handleTouchEnd,
        resetScale: () => setScale(1)
    };
}`;

    fs.writeFileSync(path.join(utilsDir, 'useTouchGestures.ts'), touchHooksContent);
}

function createGestureProviders(componentsDir) {
    const gestureProviderContent = `'use client';

import React, { createContext, useContext, useRef, useEffect } from 'react';

interface GestureConfig {
    swipeThreshold: number;
    tapTimeout: number;
    longPressTimeout: number;
    doubleTapTimeout: number;
    hapticFeedback: boolean;
}

interface GestureContextType {
    config: GestureConfig;
    updateConfig: (config: Partial<GestureConfig>) => void;
}

const GestureContext = createContext<GestureContextType | undefined>(undefined);

const DEFAULT_CONFIG: GestureConfig = {
    swipeThreshold: 50,
    tapTimeout: 300,
    longPressTimeout: 500,
    doubleTapTimeout: 300,
    hapticFeedback: true
};

export function GestureProvider({ 
    children, 
    config = {} 
}: { 
    children: React.ReactNode;
    config?: Partial<GestureConfig>;
}) {
    const [gestureConfig, setGestureConfig] = React.useState<GestureConfig>({
        ...DEFAULT_CONFIG,
        ...config
    });

    const updateConfig = (newConfig: Partial<GestureConfig>) => {
        setGestureConfig(prev => ({ ...prev, ...newConfig }));
    };

    const value: GestureContextType = {
        config: gestureConfig,
        updateConfig
    };

    return (
        <GestureContext.Provider value={value}>
            {children}
        </GestureContext.Provider>
    );
}

export function useGestureConfig() {
    const context = useContext(GestureContext);
    if (!context) {
        throw new Error('useGestureConfig must be used within a GestureProvider');
    }
    return context;
}

interface TouchZoneProps {
    children: React.ReactNode;
    onSwipe?: (direction: 'left' | 'right' | 'up' | 'down') => void;
    onTap?: () => void;
    onDoubleTap?: () => void;
    onLongPress?: () => void;
    onPinch?: (scale: number) => void;
    className?: string;
    disabled?: boolean;
}

export function TouchZone({
    children,
    onSwipe,
    onTap,
    onDoubleTap,
    onLongPress,
    onPinch,
    className = '',
    disabled = false
}: TouchZoneProps) {
    const ref = useRef<HTMLDivElement>(null);
    const { config } = useGestureConfig();
    
    const touchState = useRef({
        startPoint: null as { x: number; y: number; time: number } | null,
        tapCount: 0,
        tapTimer: null as NodeJS.Timeout | null,
        longPressTimer: null as NodeJS.Timeout | null,
        lastTapTime: 0
    });

    useEffect(() => {
        if (!ref.current || disabled) return;

        const element = ref.current;
        let touchStartTime = 0;
        let touchStartPoint: { x: number; y: number } | null = null;

        const handleTouchStart = (e: TouchEvent) => {
            const touch = e.touches[0];
            touchStartTime = Date.now();
            touchStartPoint = { x: touch.clientX, y: touch.clientY };
            
            touchState.current.startPoint = {
                x: touch.clientX,
                y: touch.clientY,
                time: touchStartTime
            };

            // Start long press timer
            if (onLongPress) {
                touchState.current.longPressTimer = setTimeout(() => {
                    onLongPress();
                    if (config.hapticFeedback && 'vibrate' in navigator) {
                        navigator.vibrate([50, 10, 50]);
                    }
                }, config.longPressTimeout);
            }
        };

        const handleTouchMove = (e: TouchEvent) => {
            if (!touchStartPoint) return;
            
            const touch = e.touches[0];
            const deltaX = touch.clientX - touchStartPoint.x;
            const deltaY = touch.clientY - touchStartPoint.y;
            const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
            
            // Cancel long press if moved too much
            if (distance > 10 && touchState.current.longPressTimer) {
                clearTimeout(touchState.current.longPressTimer);
                touchState.current.longPressTimer = null;
            }
        };

        const handleTouchEnd = (e: TouchEvent) => {
            if (!touchState.current.startPoint) return;
            
            const touch = e.changedTouches[0];
            const endTime = Date.now();
            const duration = endTime - touchState.current.startPoint.time;
            
            const deltaX = touch.clientX - touchState.current.startPoint.x;
            const deltaY = touch.clientY - touchState.current.startPoint.y;
            const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

            // Clear long press timer
            if (touchState.current.longPressTimer) {
                clearTimeout(touchState.current.longPressTimer);
                touchState.current.longPressTimer = null;
            }

            // Handle swipe
            if (distance >= config.swipeThreshold && onSwipe) {
                const isHorizontal = Math.abs(deltaX) > Math.abs(deltaY);
                const direction = isHorizontal 
                    ? (deltaX > 0 ? 'right' : 'left')
                    : (deltaY > 0 ? 'down' : 'up');
                
                onSwipe(direction);
                
                if (config.hapticFeedback && 'vibrate' in navigator) {
                    navigator.vibrate(20);
                }
                return;
            }

            // Handle tap/double tap
            if (distance < 10 && duration < config.tapTimeout) {
                const now = Date.now();
                const timeSinceLastTap = now - touchState.current.lastTapTime;
                
                if (timeSinceLastTap < config.doubleTapTimeout && touchState.current.tapCount === 1) {
                    // Double tap
                    if (onDoubleTap) {
                        onDoubleTap();
                        if (config.hapticFeedback && 'vibrate' in navigator) {
                            navigator.vibrate([10, 5, 10]);
                        }
                    }
                    touchState.current.tapCount = 0;
                    if (touchState.current.tapTimer) {
                        clearTimeout(touchState.current.tapTimer);
                        touchState.current.tapTimer = null;
                    }
                } else {
                    // First tap
                    touchState.current.tapCount = 1;
                    touchState.current.lastTapTime = now;
                    
                    if (onDoubleTap) {
                        // Wait to see if there's a second tap
                        touchState.current.tapTimer = setTimeout(() => {
                            if (onTap) {
                                onTap();
                                if (config.hapticFeedback && 'vibrate' in navigator) {
                                    navigator.vibrate(10);
                                }
                            }
                            touchState.current.tapCount = 0;
                        }, config.doubleTapTimeout);
                    } else if (onTap) {
                        // No double tap handler, trigger immediately
                        onTap();
                        if (config.hapticFeedback && 'vibrate' in navigator) {
                            navigator.vibrate(10);
                        }
                    }
                }
            }

            touchState.current.startPoint = null;
        };

        element.addEventListener('touchstart', handleTouchStart, { passive: false });
        element.addEventListener('touchmove', handleTouchMove, { passive: false });
        element.addEventListener('touchend', handleTouchEnd, { passive: false });

        return () => {
            element.removeEventListener('touchstart', handleTouchStart);
            element.removeEventListener('touchmove', handleTouchMove);
            element.removeEventListener('touchend', handleTouchEnd);
            
            if (touchState.current.tapTimer) {
                clearTimeout(touchState.current.tapTimer);
            }
            if (touchState.current.longPressTimer) {
                clearTimeout(touchState.current.longPressTimer);
            }
        };
    }, [config, disabled, onSwipe, onTap, onDoubleTap, onLongPress]);

    return (
        <div 
            ref={ref}
            className={\`\${disabled ? '' : 'touch-action-manipulation'} \${className}\`}
            style={{ touchAction: disabled ? 'auto' : 'manipulation' }}
        >
            {children}
        </div>
    );
}`;

    fs.writeFileSync(path.join(componentsDir, 'GestureProvider.tsx'), gestureProviderContent);
}

module.exports = createTouchGestures;