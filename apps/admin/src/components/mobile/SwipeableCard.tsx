'use client';

import React, { useRef, useState } from 'react';

interface SwipeableCardProps {
    children: React.ReactNode;
    onSwipeLeft?: () => void;
    onSwipeRight?: () => void;
    className?: string;
}

export default function SwipeableCard({
    children,
    onSwipeLeft,
    onSwipeRight,
    className = ''
}: SwipeableCardProps) {
    const [swipeOffset, setSwipeOffset] = useState(0);
    const startX = useRef(0);

    const handleTouchStart = (e: React.TouchEvent) => {
        startX.current = e.touches[0].clientX;
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        const diff = e.touches[0].clientX - startX.current;
        setSwipeOffset(diff);
    };

    const handleTouchEnd = () => {
        const threshold = 100;
        if (Math.abs(swipeOffset) > threshold) {
            if (swipeOffset > 0 && onSwipeRight) {
                onSwipeRight();
            } else if (swipeOffset < 0 && onSwipeLeft) {
                onSwipeLeft();
            }
        }
        setSwipeOffset(0);
    };

    return (
        <div className="relative overflow-hidden rounded-lg">
            <div
                className={`bg-white dark:bg-slate-800 rounded-lg transition-transform duration-200 ${className}`}
                style={{ transform: `translateX(${swipeOffset}px)` }}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
            >
                {children}
            </div>
        </div>
    );
}