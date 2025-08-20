// 🎬 Gesture Recognition System - Advanced Touch and Mouse Interactions
// Version: 2.0.0 - Week 2 Phase 2 Advanced Animations

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useAnimation } from './core-animation-system';
import type { AnimationConfig } from './core-animation-system';

// =================================
// Gesture Recognition Types
// =================================

interface GestureState {
    startX: number;
    startY: number;
    currentX: number;
    currentY: number;
    deltaX: number;
    deltaY: number;
    distance: number;
    direction: 'left' | 'right' | 'up' | 'down' | null;
    velocity: number;
    isActive: boolean;
    startTime: number;
    duration: number;
}

interface SwipeGestureOptions {
    threshold?: number;
    velocity?: number;
    direction?: 'horizontal' | 'vertical' | 'any';
    onSwipe?: (direction: string, velocity: number) => void;
    onSwipeStart?: (event: TouchEvent | MouseEvent) => void;
    onSwipeMove?: (state: GestureState) => void;
    onSwipeEnd?: (state: GestureState) => void;
}

interface DragGestureOptions {
    axis?: 'x' | 'y' | 'both';
    bounds?: { left?: number; right?: number; top?: number; bottom?: number };
    snap?: boolean;
    snapThreshold?: number;
    onDragStart?: (event: TouchEvent | MouseEvent) => void;
    onDrag?: (state: GestureState) => void;
    onDragEnd?: (state: GestureState) => void;
}

interface PinchGestureOptions {
    threshold?: number;
    onPinchStart?: (scale: number) => void;
    onPinch?: (scale: number, velocity: number) => void;
    onPinchEnd?: (scale: number) => void;
}

interface LongPressOptions {
    duration?: number;
    threshold?: number;
    onLongPress?: (event: TouchEvent | MouseEvent) => void;
    onLongPressStart?: () => void;
    onLongPressEnd?: () => void;
}

// =================================
// Gesture Recognition Hooks
// =================================

export const useSwipeGesture = (
    elementRef: React.RefObject<HTMLElement>,
    options: SwipeGestureOptions = {}
) => {
    const {
        threshold = 50,
        velocity = 0.3,
        direction = 'any',
        onSwipe,
        onSwipeStart,
        onSwipeMove,
        onSwipeEnd
    } = options;

    const gestureState = useRef<GestureState>({
        startX: 0,
        startY: 0,
        currentX: 0,
        currentY: 0,
        deltaX: 0,
        deltaY: 0,
        distance: 0,
        direction: null,
        velocity: 0,
        isActive: false,
        startTime: 0,
        duration: 0
    });

    const updateGestureState = useCallback((clientX: number, clientY: number) => {
        const state = gestureState.current;
        state.currentX = clientX;
        state.currentY = clientY;
        state.deltaX = clientX - state.startX;
        state.deltaY = clientY - state.startY;
        state.distance = Math.sqrt(state.deltaX ** 2 + state.deltaY ** 2);
        state.duration = Date.now() - state.startTime;
        state.velocity = state.distance / Math.max(state.duration, 1);

        if (Math.abs(state.deltaX) > Math.abs(state.deltaY)) {
            state.direction = state.deltaX > 0 ? 'right' : 'left';
        } else {
            state.direction = state.deltaY > 0 ? 'down' : 'up';
        }

        return state;
    }, []);

    const handleStart = useCallback((event: TouchEvent | MouseEvent) => {
        const clientX = 'touches' in event ? event.touches[0].clientX : event.clientX;
        const clientY = 'touches' in event ? event.touches[0].clientY : event.clientY;

        gestureState.current = {
            startX: clientX,
            startY: clientY,
            currentX: clientX,
            currentY: clientY,
            deltaX: 0,
            deltaY: 0,
            distance: 0,
            direction: null,
            velocity: 0,
            isActive: true,
            startTime: Date.now(),
            duration: 0
        };

        onSwipeStart?.(event);
    }, [onSwipeStart]);

    const handleMove = useCallback((event: TouchEvent | MouseEvent) => {
        if (!gestureState.current.isActive) return;

        const clientX = 'touches' in event ? event.touches[0].clientX : event.clientX;
        const clientY = 'touches' in event ? event.touches[0].clientY : event.clientY;

        const state = updateGestureState(clientX, clientY);
        onSwipeMove?.(state);
    }, [updateGestureState, onSwipeMove]);

    const handleEnd = useCallback(() => {
        if (!gestureState.current.isActive) return;

        const state = gestureState.current;
        state.isActive = false;

        // Check if swipe meets criteria
        const meetsThreshold = state.distance > threshold;
        const meetsVelocity = state.velocity > velocity;
        const meetsDirection =
            direction === 'any' ||
            (direction === 'horizontal' && (state.direction === 'left' || state.direction === 'right')) ||
            (direction === 'vertical' && (state.direction === 'up' || state.direction === 'down'));

        if (meetsThreshold && meetsVelocity && meetsDirection && state.direction) {
            onSwipe?.(state.direction, state.velocity);
        }

        onSwipeEnd?.(state);
    }, [threshold, velocity, direction, onSwipe, onSwipeEnd]);

    useEffect(() => {
        const element = elementRef.current;
        if (!element) return;

        // Touch events
        element.addEventListener('touchstart', handleStart, { passive: true });
        element.addEventListener('touchmove', handleMove, { passive: true });
        element.addEventListener('touchend', handleEnd);

        // Mouse events for desktop
        element.addEventListener('mousedown', handleStart);
        element.addEventListener('mousemove', handleMove);
        element.addEventListener('mouseup', handleEnd);
        element.addEventListener('mouseleave', handleEnd);

        return () => {
            element.removeEventListener('touchstart', handleStart);
            element.removeEventListener('touchmove', handleMove);
            element.removeEventListener('touchend', handleEnd);
            element.removeEventListener('mousedown', handleStart);
            element.removeEventListener('mousemove', handleMove);
            element.removeEventListener('mouseup', handleEnd);
            element.removeEventListener('mouseleave', handleEnd);
        };
    }, [handleStart, handleMove, handleEnd]);

    return gestureState.current;
};

export const useDragGesture = (
    elementRef: React.RefObject<HTMLElement>,
    options: DragGestureOptions = {}
) => {
    const { animate } = useAnimation();
    const {
        axis = 'both',
        bounds,
        snap = false,
        snapThreshold = 20,
        onDragStart,
        onDrag,
        onDragEnd
    } = options;

    const [isDragging, setIsDragging] = useState(false);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const gestureState = useRef<GestureState>({
        startX: 0,
        startY: 0,
        currentX: 0,
        currentY: 0,
        deltaX: 0,
        deltaY: 0,
        distance: 0,
        direction: null,
        velocity: 0,
        isActive: false,
        startTime: 0,
        duration: 0
    });

    const snapToPosition = useCallback((x: number, y: number) => {
        const element = elementRef.current;
        if (!element || !snap) return { x, y };

        // Simple grid snapping
        const snappedX = Math.round(x / snapThreshold) * snapThreshold;
        const snappedY = Math.round(y / snapThreshold) * snapThreshold;

        return { x: snappedX, y: snappedY };
    }, [snap, snapThreshold]);

    const applyBounds = useCallback((x: number, y: number) => {
        if (!bounds) return { x, y };

        let boundedX = x;
        let boundedY = y;

        if (bounds.left !== undefined) boundedX = Math.max(bounds.left, boundedX);
        if (bounds.right !== undefined) boundedX = Math.min(bounds.right, boundedX);
        if (bounds.top !== undefined) boundedY = Math.max(bounds.top, boundedY);
        if (bounds.bottom !== undefined) boundedY = Math.min(bounds.bottom, boundedY);

        return { x: boundedX, y: boundedY };
    }, [bounds]);

    const updatePosition = useCallback((deltaX: number, deltaY: number) => {
        let newX = position.x;
        let newY = position.y;

        if (axis === 'both' || axis === 'x') newX += deltaX;
        if (axis === 'both' || axis === 'y') newY += deltaY;

        const bounded = applyBounds(newX, newY);
        setPosition(bounded);

        const element = elementRef.current;
        if (element) {
            element.style.transform = `translate(${bounded.x}px, ${bounded.y}px)`;
        }

        return bounded;
    }, [position, axis, applyBounds]);

    const handleStart = useCallback((event: TouchEvent | MouseEvent) => {
        const clientX = 'touches' in event ? event.touches[0].clientX : event.clientX;
        const clientY = 'touches' in event ? event.touches[0].clientY : event.clientY;

        gestureState.current = {
            startX: clientX,
            startY: clientY,
            currentX: clientX,
            currentY: clientY,
            deltaX: 0,
            deltaY: 0,
            distance: 0,
            direction: null,
            velocity: 0,
            isActive: true,
            startTime: Date.now(),
            duration: 0
        };

        setIsDragging(true);
        onDragStart?.(event);

        // Prevent default to avoid text selection
        event.preventDefault();
    }, [onDragStart]);

    const handleMove = useCallback((event: TouchEvent | MouseEvent) => {
        if (!gestureState.current.isActive) return;

        const clientX = 'touches' in event ? event.touches[0].clientX : event.clientX;
        const clientY = 'touches' in event ? event.touches[0].clientY : event.clientY;

        const state = gestureState.current;
        const prevX = state.currentX;
        const prevY = state.currentY;

        state.currentX = clientX;
        state.currentY = clientY;
        state.deltaX = clientX - state.startX;
        state.deltaY = clientY - state.startY;
        state.distance = Math.sqrt(state.deltaX ** 2 + state.deltaY ** 2);
        state.duration = Date.now() - state.startTime;
        state.velocity = state.distance / Math.max(state.duration, 1);

        const moveDeltaX = clientX - prevX;
        const moveDeltaY = clientY - prevY;

        updatePosition(moveDeltaX, moveDeltaY);
        onDrag?.(state);
    }, [updatePosition, onDrag]);

    const handleEnd = useCallback(() => {
        if (!gestureState.current.isActive) return;

        const state = gestureState.current;
        state.isActive = false;
        setIsDragging(false);

        // Apply snapping
        if (snap) {
            const snapped = snapToPosition(position.x, position.y);
            if (snapped.x !== position.x || snapped.y !== position.y) {
                setPosition(snapped);
                const element = elementRef.current;
                if (element) {
                    animate(element, {
                        custom: {
                            transform: [`translate(${position.x}px, ${position.y}px)`, `translate(${snapped.x}px, ${snapped.y}px)`]
                        },
                        duration: 200,
                        easing: 'ease-out'
                    });
                }
            }
        }

        onDragEnd?.(state);
    }, [snap, snapToPosition, position, animate, onDragEnd]);

    useEffect(() => {
        const element = elementRef.current;
        if (!element) return;

        // Touch events
        element.addEventListener('touchstart', handleStart, { passive: false });
        document.addEventListener('touchmove', handleMove, { passive: true });
        document.addEventListener('touchend', handleEnd);

        // Mouse events
        element.addEventListener('mousedown', handleStart);
        document.addEventListener('mousemove', handleMove);
        document.addEventListener('mouseup', handleEnd);

        return () => {
            element.removeEventListener('touchstart', handleStart);
            document.removeEventListener('touchmove', handleMove);
            document.removeEventListener('touchend', handleEnd);
            element.removeEventListener('mousedown', handleStart);
            document.removeEventListener('mousemove', handleMove);
            document.removeEventListener('mouseup', handleEnd);
        };
    }, [handleStart, handleMove, handleEnd]);

    return {
        isDragging,
        position,
        gestureState: gestureState.current,
        resetPosition: () => {
            setPosition({ x: 0, y: 0 });
            const element = elementRef.current;
            if (element) {
                element.style.transform = 'translate(0px, 0px)';
            }
        }
    };
};

export const useLongPress = (
    elementRef: React.RefObject<HTMLElement>,
    options: LongPressOptions = {}
) => {
    const {
        duration = 500,
        threshold = 10,
        onLongPress,
        onLongPressStart,
        onLongPressEnd
    } = options;

    const [isLongPressing, setIsLongPressing] = useState(false);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const startPosition = useRef({ x: 0, y: 0 });

    const handleStart = useCallback((event: TouchEvent | MouseEvent) => {
        const clientX = 'touches' in event ? event.touches[0].clientX : event.clientX;
        const clientY = 'touches' in event ? event.touches[0].clientY : event.clientY;

        startPosition.current = { x: clientX, y: clientY };

        timerRef.current = setTimeout(() => {
            setIsLongPressing(true);
            onLongPressStart?.();
            onLongPress?.(event);
        }, duration);
    }, [duration, onLongPress, onLongPressStart]);

    const handleMove = useCallback((event: TouchEvent | MouseEvent) => {
        if (!timerRef.current) return;

        const clientX = 'touches' in event ? event.touches[0].clientX : event.clientX;
        const clientY = 'touches' in event ? event.touches[0].clientY : event.clientY;

        const deltaX = clientX - startPosition.current.x;
        const deltaY = clientY - startPosition.current.y;
        const distance = Math.sqrt(deltaX ** 2 + deltaY ** 2);

        if (distance > threshold) {
            if (timerRef.current) {
                clearTimeout(timerRef.current);
                timerRef.current = null;
            }
        }
    }, [threshold]);

    const handleEnd = useCallback(() => {
        if (timerRef.current) {
            clearTimeout(timerRef.current);
            timerRef.current = null;
        }

        if (isLongPressing) {
            setIsLongPressing(false);
            onLongPressEnd?.();
        }
    }, [isLongPressing, onLongPressEnd]);

    useEffect(() => {
        const element = elementRef.current;
        if (!element) return;

        // Touch events
        element.addEventListener('touchstart', handleStart, { passive: true });
        element.addEventListener('touchmove', handleMove, { passive: true });
        element.addEventListener('touchend', handleEnd);

        // Mouse events
        element.addEventListener('mousedown', handleStart);
        element.addEventListener('mousemove', handleMove);
        element.addEventListener('mouseup', handleEnd);
        element.addEventListener('mouseleave', handleEnd);

        return () => {
            element.removeEventListener('touchstart', handleStart);
            element.removeEventListener('touchmove', handleMove);
            element.removeEventListener('touchend', handleEnd);
            element.removeEventListener('mousedown', handleStart);
            element.removeEventListener('mousemove', handleMove);
            element.removeEventListener('mouseup', handleEnd);
            element.removeEventListener('mouseleave', handleEnd);

            if (timerRef.current) {
                clearTimeout(timerRef.current);
            }
        };
    }, [handleStart, handleMove, handleEnd]);

    return { isLongPressing };
};

// =================================
// Gesture-Enabled Components
// =================================

interface SwipeableCardProps {
    children: React.ReactNode;
    onSwipeLeft?: () => void;
    onSwipeRight?: () => void;
    className?: string;
}

export const SwipeableCard: React.FC<SwipeableCardProps> = ({
    children,
    onSwipeLeft,
    onSwipeRight,
    className = ''
}) => {
    const cardRef = useRef<HTMLDivElement>(null);
    const { animate } = useAnimation();

    useSwipeGesture(cardRef, {
        direction: 'horizontal',
        threshold: 100,
        onSwipe: (direction) => {
            if (direction === 'left') {
                onSwipeLeft?.();
            } else if (direction === 'right') {
                onSwipeRight?.();
            }
        },
        onSwipeMove: (state) => {
            const element = cardRef.current;
            if (element && Math.abs(state.deltaX) > 10) {
                const opacity = Math.max(0.3, 1 - Math.abs(state.deltaX) / 200);
                element.style.transform = `translateX(${state.deltaX}px) rotate(${state.deltaX * 0.1}deg)`;
                element.style.opacity = opacity.toString();
            }
        },
        onSwipeEnd: (state) => {
            const element = cardRef.current;
            if (element) {
                if (Math.abs(state.deltaX) < 100) {
                    // Snap back
                    animate(element, {
                        custom: {
                            transform: ['', 'translateX(0px) rotate(0deg)'],
                            opacity: ['', '1']
                        },
                        duration: 300,
                        easing: 'ease-out'
                    });
                } else {
                    // Animate out
                    const direction = state.deltaX > 0 ? 1 : -1;
                    animate(element, {
                        custom: {
                            transform: ['', `translateX(${direction * 400}px) rotate(${direction * 30}deg)`],
                            opacity: ['', '0']
                        },
                        duration: 300,
                        easing: 'ease-in'
                    });
                }
            }
        }
    });

    return (
        <div
            ref={cardRef}
            className={`cursor-grab active:cursor-grabbing select-none ${className}`}
        >
            {children}
        </div>
    );
};

interface DraggableElementProps {
    children: React.ReactNode;
    axis?: 'x' | 'y' | 'both';
    bounds?: { left?: number; right?: number; top?: number; bottom?: number };
    className?: string;
    onDragEnd?: (position: { x: number; y: number }) => void;
}

export const DraggableElement: React.FC<DraggableElementProps> = ({
    children,
    axis = 'both',
    bounds,
    className = '',
    onDragEnd
}) => {
    const elementRef = useRef<HTMLDivElement>(null);

    const { isDragging, position } = useDragGesture(elementRef, {
        axis,
        bounds,
        snap: true,
        snapThreshold: 25,
        onDragEnd: (state) => {
            onDragEnd?.(position);
        }
    });

    return (
        <div
            ref={elementRef}
            className={`cursor-grab ${isDragging ? 'cursor-grabbing' : ''} select-none ${className}`}
            style={{
                touchAction: 'none',
                userSelect: 'none'
            }}
        >
            {children}
        </div>
    );
};

interface LongPressButtonProps {
    children: React.ReactNode;
    onLongPress: () => void;
    duration?: number;
    className?: string;
}

export const LongPressButton: React.FC<LongPressButtonProps> = ({
    children,
    onLongPress,
    duration = 800,
    className = ''
}) => {
    const buttonRef = useRef<HTMLButtonElement>(null);
    const [progress, setProgress] = useState(0);

    const { isLongPressing } = useLongPress(buttonRef, {
        duration,
        onLongPress,
        onLongPressStart: () => {
            const startTime = Date.now();
            const updateProgress = () => {
                const elapsed = Date.now() - startTime;
                const currentProgress = Math.min((elapsed / duration) * 100, 100);
                setProgress(currentProgress);

                if (currentProgress < 100) {
                    requestAnimationFrame(updateProgress);
                }
            };
            updateProgress();
        },
        onLongPressEnd: () => {
            setProgress(0);
        }
    });

    return (
        <button
            ref={buttonRef}
            className={`relative overflow-hidden ${className} ${isLongPressing ? 'scale-95' : ''} transition-transform`}
            style={{ touchAction: 'manipulation' }}
        >
            {children}
            {progress > 0 && (
                <div
                    className="absolute bottom-0 left-0 h-1 bg-blue-500 transition-all duration-100"
                    style={{ width: `${progress}%` }}
                />
            )}
        </button>
    );
};

export default {
    useSwipeGesture,
    useDragGesture,
    useLongPress,
    SwipeableCard,
    DraggableElement,
    LongPressButton
};
