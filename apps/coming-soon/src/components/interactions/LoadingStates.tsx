'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '@/contexts/ThemeContext';

// Skeleton loader for cards
export const CardSkeleton: React.FC<{
    className?: string;
    rows?: number;
}> = ({
    className = '',
    rows = 3
}) => {
    const { theme } = useTheme();
    
    return (
        <div className={`animate-pulse rounded-xl border ${
            theme === 'dark' 
                ? 'bg-gray-800 border-gray-700' 
                : 'bg-gray-100 border-gray-200'
        } p-6 ${className}`}>
            {/* Header skeleton */}
            <div className="flex items-center space-x-4 mb-4">
                <div className={`h-12 w-12 rounded-lg ${
                    theme === 'dark' ? 'bg-gray-700' : 'bg-gray-300'
                }`} />
                <div className="space-y-2">
                    <div className={`h-4 w-32 rounded ${
                        theme === 'dark' ? 'bg-gray-700' : 'bg-gray-300'
                    }`} />
                    <div className={`h-3 w-24 rounded ${
                        theme === 'dark' ? 'bg-gray-700' : 'bg-gray-300'
                    }`} />
                </div>
            </div>
            
            {/* Content skeleton */}
            <div className="space-y-3">
                {Array.from({ length: rows }).map((_, i) => (
                    <div
                        key={i}
                        className={`h-4 rounded ${
                            theme === 'dark' ? 'bg-gray-700' : 'bg-gray-300'
                        }`}
                        style={{ width: `${Math.random() * 40 + 60}%` }}
                    />
                ))}
            </div>
            
            {/* Footer skeleton */}
            <div className="flex justify-between items-center mt-6">
                <div className={`h-6 w-20 rounded-full ${
                    theme === 'dark' ? 'bg-gray-700' : 'bg-gray-300'
                }`} />
                <div className={`h-8 w-24 rounded-lg ${
                    theme === 'dark' ? 'bg-gray-700' : 'bg-gray-300'
                }`} />
            </div>
        </div>
    );
};

// Pulse loader with customizable colors
export const PulseLoader: React.FC<{
    size?: 'sm' | 'md' | 'lg' | 'xl';
    color?: string;
    className?: string;
}> = ({
    size = 'md',
    color = 'bg-blue-500',
    className = ''
}) => {
    const sizeClasses = {
        sm: 'h-2 w-2',
        md: 'h-3 w-3',
        lg: 'h-4 w-4',
        xl: 'h-6 w-6'
    };
    
    return (
        <div className={`flex space-x-2 ${className}`}>
            {[0, 1, 2].map((i) => (
                <motion.div
                    key={i}
                    className={`${sizeClasses[size]} ${color} rounded-full`}
                    animate={{
                        opacity: [0.3, 1, 0.3],
                        scale: [0.8, 1.2, 0.8]
                    }}
                    transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        delay: i * 0.2,
                        ease: "easeInOut"
                    }}
                />
            ))}
        </div>
    );
};

// Spinning loader
export const SpinLoader: React.FC<{
    size?: number;
    color?: string;
    strokeWidth?: number;
    className?: string;
}> = ({
    size = 24,
    color = 'currentColor',
    strokeWidth = 2,
    className = ''
}) => {
    return (
        <motion.svg
            className={className}
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            animate={{ rotate: 360 }}
            transition={{
                duration: 1,
                repeat: Infinity,
                ease: "linear"
            }}
        >
            <circle
                cx="12"
                cy="12"
                r="10"
                stroke={color}
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                strokeDasharray="31.416"
                strokeDashoffset="31.416"
                opacity="0.3"
            />
            <motion.circle
                cx="12"
                cy="12"
                r="10"
                stroke={color}
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                strokeDasharray="31.416"
                initial={{ strokeDashoffset: 31.416 }}
                animate={{ strokeDashoffset: [31.416, 0, 31.416] }}
                transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
            />
        </motion.svg>
    );
};

// Progress bar loader
export const ProgressLoader: React.FC<{
    progress: number;
    showPercentage?: boolean;
    color?: string;
    className?: string;
    animated?: boolean;
}> = ({
    progress,
    showPercentage = false,
    color = 'bg-blue-500',
    className = '',
    animated = true
}) => {
    const { theme } = useTheme();
    
    return (
        <div className={`w-full ${className}`}>
            {showPercentage && (
                <div className="flex justify-between items-center mb-2">
                    <span className={`text-sm font-medium ${
                        theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
                    }`}>
                        Loading...
                    </span>
                    <span className={`text-sm font-medium ${
                        theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
                    }`}>
                        {Math.round(progress)}%
                    </span>
                </div>
            )}
            <div className={`h-2 rounded-full overflow-hidden ${
                theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
            }`}>
                <motion.div
                    className={`h-full ${color} rounded-full origin-left`}
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: progress / 100 }}
                    transition={animated ? {
                        duration: 0.5,
                        ease: "easeOut"
                    } : { duration: 0 }}
                />
            </div>
        </div>
    );
};

// Shimmer effect loader
export const ShimmerLoader: React.FC<{
    width?: string;
    height?: string;
    className?: string;
}> = ({
    width = '100%',
    height = '20px',
    className = ''
}) => {
    const { theme } = useTheme();
    
    return (
        <div 
            className={`relative overflow-hidden rounded ${
                theme === 'dark' ? 'bg-gray-800' : 'bg-gray-200'
            } ${className}`}
            style={{ width, height }}
        >
            <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                initial={{ x: '-100%' }}
                animate={{ x: '100%' }}
                transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
            />
        </div>
    );
};

// Loading overlay
export const LoadingOverlay: React.FC<{
    isLoading: boolean;
    children: React.ReactNode;
    loadingComponent?: React.ReactNode;
    blur?: boolean;
    className?: string;
}> = ({
    isLoading,
    children,
    loadingComponent,
    blur = true,
    className = ''
}) => {
    const { theme } = useTheme();
    
    return (
        <div className={`relative ${className}`}>
            <motion.div
                animate={{
                    filter: isLoading && blur ? 'blur(2px)' : 'blur(0px)',
                    opacity: isLoading ? 0.5 : 1
                }}
                transition={{ duration: 0.3 }}
            >
                {children}
            </motion.div>
            
            <AnimatePresence>
                {isLoading && (
                    <motion.div
                        className={`absolute inset-0 flex items-center justify-center ${
                            theme === 'dark' 
                                ? 'bg-gray-900/50' 
                                : 'bg-white/50'
                        } backdrop-blur-sm z-50`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        {loadingComponent || (
                            <div className="flex flex-col items-center space-y-4">
                                <SpinLoader size={32} />
                                <p className={`text-sm font-medium ${
                                    theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
                                }`}>
                                    Loading...
                                </p>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

// Project card loading state
export const ProjectCardLoader: React.FC<{
    count?: number;
    className?: string;
}> = ({
    count = 6,
    className = ''
}) => {
    return (
        <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ${className}`}>
            {Array.from({ length: count }).map((_, i) => (
                <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1, duration: 0.5 }}
                >
                    <CardSkeleton />
                </motion.div>
            ))}
        </div>
    );
};

// Typed loading text animation
export const TypedLoader: React.FC<{
    texts: string[];
    speed?: number;
    className?: string;
}> = ({
    texts,
    speed = 100,
    className = ''
}) => {
    const [currentTextIndex, setCurrentTextIndex] = useState(0);
    const [currentText, setCurrentText] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);
    
    useEffect(() => {
        const text = texts[currentTextIndex];
        
        const timeout = setTimeout(() => {
            if (!isDeleting) {
                setCurrentText(text.substring(0, currentText.length + 1));
                
                if (currentText === text) {
                    setTimeout(() => setIsDeleting(true), 1000);
                }
            } else {
                setCurrentText(text.substring(0, currentText.length - 1));
                
                if (currentText === '') {
                    setIsDeleting(false);
                    setCurrentTextIndex((prev) => (prev + 1) % texts.length);
                }
            }
        }, isDeleting ? speed / 2 : speed);
        
        return () => clearTimeout(timeout);
    }, [currentText, isDeleting, currentTextIndex, texts, speed]);
    
    return (
        <div className={className}>
            <span>{currentText}</span>
            <motion.span
                animate={{ opacity: [1, 0] }}
                transition={{ duration: 0.5, repeat: Infinity }}
                className="ml-1"
            >
                |
            </motion.span>
        </div>
    );
};

// Advanced loading states with micro-interactions
export const InteractiveLoader: React.FC<{
    state: 'idle' | 'loading' | 'success' | 'error';
    size?: number;
    className?: string;
    onStateChange?: (state: string) => void;
}> = ({
    state,
    size = 24,
    className = '',
    onStateChange
}) => {
    const { theme } = useTheme();
    
    const variants = {
        idle: { scale: 1, rotate: 0 },
        loading: { scale: 1.1, rotate: 360 },
        success: { scale: 1.2, rotate: 0 },
        error: { scale: 0.9, rotate: 0 }
    };
    
    const getIcon = () => {
        switch (state) {
            case 'loading':
                return (
                    <motion.div
                        className="w-full h-full border-2 border-blue-500 border-t-transparent rounded-full"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    />
                );
            case 'success':
                return (
                    <svg className="w-full h-full text-green-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                );
            case 'error':
                return (
                    <svg className="w-full h-full text-red-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                );
            default:
                return (
                    <div className={`w-full h-full rounded-full ${
                        theme === 'dark' ? 'bg-gray-600' : 'bg-gray-300'
                    }`} />
                );
        }
    };
    
    return (
        <motion.div
            className={`cursor-pointer ${className}`}
            style={{ width: size, height: size }}
            variants={variants}
            animate={state}
            transition={{ duration: 0.3, ease: "easeOut" }}
            onClick={() => onStateChange?.(state)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
        >
            <AnimatePresence mode="wait">
                <motion.div
                    key={state}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.2 }}
                    className="w-full h-full"
                >
                    {getIcon()}
                </motion.div>
            </AnimatePresence>
        </motion.div>
    );
};

export default {
    CardSkeleton,
    PulseLoader,
    SpinLoader,
    ProgressLoader,
    ShimmerLoader,
    LoadingOverlay,
    ProjectCardLoader,
    TypedLoader,
    InteractiveLoader
};