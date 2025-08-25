'use client';

import React, { useState } from 'react';

interface TouchButtonProps {
    children: React.ReactNode;
    onClick?: () => void;
    variant?: 'primary' | 'secondary' | 'outline';
    size?: 'sm' | 'md' | 'lg';
    disabled?: boolean;
    className?: string;
}

export default function TouchButton({
    children,
    onClick,
    variant = 'primary',
    size = 'md',
    disabled = false,
    className = ''
}: TouchButtonProps) {
    const [isPressed, setIsPressed] = useState(false);

    const baseClasses = 'font-medium rounded-lg transition-all duration-200 touch-target';
    
    const variantClasses = {
        primary: 'bg-blue-600 hover:bg-blue-700 text-white shadow-md active:shadow-sm',
        secondary: 'bg-gray-600 hover:bg-gray-700 text-white shadow-md active:shadow-sm',
        outline: 'border-2 border-blue-600 text-blue-600 hover:bg-blue-50 active:bg-blue-100'
    };

    const sizeClasses = {
        sm: 'px-3 py-2 text-sm min-h-[44px]',
        md: 'px-4 py-3 text-base min-h-[48px]',
        lg: 'px-6 py-4 text-lg min-h-[52px]'
    };

    const handlePress = () => {
        setIsPressed(true);
        if ('vibrate' in navigator) {
            navigator.vibrate(10);
        }
        setTimeout(() => setIsPressed(false), 150);
    };

    return (
        <button
            onClick={onClick}
            onTouchStart={handlePress}
            onMouseDown={handlePress}
            disabled={disabled}
            className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${
                isPressed ? 'scale-95' : 'scale-100'
            } ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
        >
            {children}
        </button>
    );
}