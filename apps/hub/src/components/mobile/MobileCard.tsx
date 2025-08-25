'use client';

import React, { useState } from 'react';

interface MobileCardProps {
    children: React.ReactNode;
    className?: string;
    interactive?: boolean;
    onClick?: () => void;
}

export default function MobileCard({
    children,
    className = '',
    interactive = false,
    onClick
}: MobileCardProps) {
    const [isPressed, setIsPressed] = useState(false);

    const handleTouch = () => {
        if (interactive) {
            setIsPressed(true);
            setTimeout(() => setIsPressed(false), 150);
        }
    };

    return (
        <div
            className={`bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 shadow-sm ${
                interactive ? 'cursor-pointer transition-all duration-200 hover:shadow-md touch-target' : ''
            } ${isPressed ? 'scale-[0.98]' : 'scale-100'} ${className}`}
            onClick={onClick}
            onTouchStart={handleTouch}
            onMouseDown={handleTouch}
        >
            {children}
        </div>
    );
}