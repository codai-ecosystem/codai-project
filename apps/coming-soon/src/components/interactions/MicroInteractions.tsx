'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from 'framer-motion';

// Button with ripple effect
export const RippleButton: React.FC<{
    children: React.ReactNode;
    onClick?: () => void;
    className?: string;
    rippleColor?: string;
    disabled?: boolean;
}> = ({
    children,
    onClick,
    className = '',
    rippleColor = 'rgba(255, 255, 255, 0.5)',
    disabled = false
}) => {
    const [ripples, setRipples] = useState<Array<{ id: number; x: number; y: number; size: number }>>([]);
    const buttonRef = useRef<HTMLButtonElement>(null);
    
    const createRipple = (event: React.MouseEvent) => {
        if (disabled) return;
        
        const button = buttonRef.current;
        if (!button) return;
        
        const rect = button.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        const size = Math.max(rect.width, rect.height) * 2;
        
        const newRipple = {
            id: Date.now(),
            x,
            y,
            size
        };
        
        setRipples(prev => [...prev, newRipple]);
        
        // Remove ripple after animation
        setTimeout(() => {
            setRipples(prev => prev.filter(ripple => ripple.id !== newRipple.id));
        }, 600);
        
        onClick?.();
    };
    
    return (
        <motion.button
            ref={buttonRef}
            className={`relative overflow-hidden ${className}`}
            onMouseDown={createRipple}
            whileHover={{ scale: disabled ? 1 : 1.02 }}
            whileTap={{ scale: disabled ? 1 : 0.98 }}
            disabled={disabled}
        >
            {ripples.map((ripple) => (
                <motion.span
                    key={ripple.id}
                    className="absolute rounded-full pointer-events-none"
                    style={{
                        left: ripple.x - ripple.size / 2,
                        top: ripple.y - ripple.size / 2,
                        width: ripple.size,
                        height: ripple.size,
                        backgroundColor: rippleColor
                    }}
                    initial={{ scale: 0, opacity: 0.7 }}
                    animate={{ scale: 1, opacity: 0 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                />
            ))}
            {children}
        </motion.button>
    );
};

// Hover tilt effect
export const TiltHover: React.FC<{
    children: React.ReactNode;
    maxTilt?: number;
    className?: string;
    scale?: number;
    speed?: number;
}> = ({
    children,
    maxTilt = 15,
    className = '',
    scale = 1.05,
    speed = 400
}) => {
    const ref = useRef<HTMLDivElement>(null);
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    
    const mouseXSpring = useSpring(x, { stiffness: speed, damping: 30 });
    const mouseYSpring = useSpring(y, { stiffness: speed, damping: 30 });
    
    const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], [maxTilt, -maxTilt]);
    const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], [-maxTilt, maxTilt]);
    
    const handleMouseMove = (e: React.MouseEvent) => {
        if (!ref.current) return;
        
        const rect = ref.current.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        
        const xPct = mouseX / width - 0.5;
        const yPct = mouseY / height - 0.5;
        
        x.set(xPct);
        y.set(yPct);
    };
    
    const handleMouseLeave = () => {
        x.set(0);
        y.set(0);
    };
    
    return (
        <motion.div
            ref={ref}
            className={className}
            style={{
                rotateX,
                rotateY,
                transformStyle: "preserve-3d"
            }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            whileHover={{ scale }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
            {children}
        </motion.div>
    );
};

// Floating action button with tooltip
export const FloatingActionButton: React.FC<{
    children: React.ReactNode;
    tooltip?: string;
    position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
    onClick?: () => void;
    className?: string;
    size?: 'sm' | 'md' | 'lg';
}> = ({
    children,
    tooltip,
    position = 'bottom-right',
    onClick,
    className = '',
    size = 'md'
}) => {
    const [showTooltip, setShowTooltip] = useState(false);
    
    const sizeClasses = {
        sm: 'w-12 h-12',
        md: 'w-14 h-14',
        lg: 'w-16 h-16'
    };
    
    const positionClasses = {
        'bottom-right': 'bottom-6 right-6',
        'bottom-left': 'bottom-6 left-6',
        'top-right': 'top-6 right-6',
        'top-left': 'top-6 left-6'
    };
    
    return (
        <motion.div
            className={`fixed ${positionClasses[position]} z-50 ${className}`}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.2 }}
        >
            <motion.button
                className={`${sizeClasses[size]} bg-blue-500 hover:bg-blue-600 text-white rounded-full shadow-lg flex items-center justify-center`}
                whileHover={{ scale: 1.1, y: -2 }}
                whileTap={{ scale: 0.9 }}
                onHoverStart={() => setShowTooltip(true)}
                onHoverEnd={() => setShowTooltip(false)}
                onClick={onClick}
            >
                {children}
                
                <AnimatePresence>
                    {showTooltip && tooltip && (
                        <motion.div
                            className="absolute bg-gray-900 text-white text-sm px-2 py-1 rounded whitespace-nowrap pointer-events-none"
                            style={{
                                bottom: position.includes('bottom') ? '100%' : 'auto',
                                top: position.includes('top') ? '100%' : 'auto',
                                right: position.includes('right') ? '0' : 'auto',
                                left: position.includes('left') ? '0' : 'auto',
                                marginBottom: position.includes('bottom') ? '8px' : '0',
                                marginTop: position.includes('top') ? '8px' : '0'
                            }}
                            initial={{ opacity: 0, y: position.includes('bottom') ? 10 : -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: position.includes('bottom') ? 10 : -10 }}
                            transition={{ duration: 0.2 }}
                        >
                            {tooltip}
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.button>
        </motion.div>
    );
};

// Elastic scaling on hover
export const ElasticHover: React.FC<{
    children: React.ReactNode;
    scale?: number;
    elasticity?: number;
    className?: string;
}> = ({
    children,
    scale = 1.1,
    elasticity = 0.3,
    className = ''
}) => {
    return (
        <motion.div
            className={className}
            whileHover={{
                scale,
                transition: {
                    type: "spring",
                    stiffness: 400,
                    damping: 10
                }
            }}
            whileTap={{
                scale: scale * 0.9,
                transition: {
                    type: "spring",
                    stiffness: 600,
                    damping: 15
                }
            }}
        >
            {children}
        </motion.div>
    );
};

// Morphing shape animation
export const MorphingShape: React.FC<{
    size?: number;
    colors?: string[];
    duration?: number;
    className?: string;
}> = ({
    size = 60,
    colors = ['#3B82F6', '#8B5CF6', '#EF4444', '#10B981'],
    duration = 3,
    className = ''
}) => {
    const [currentColor, setCurrentColor] = useState(0);
    
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentColor((prev) => (prev + 1) % colors.length);
        }, duration * 1000);
        
        return () => clearInterval(interval);
    }, [colors.length, duration]);
    
    return (
        <motion.div
            className={`relative ${className}`}
            style={{ width: size, height: size }}
        >
            <motion.div
                className="absolute inset-0 rounded-full"
                style={{ backgroundColor: colors[currentColor] }}
                animate={{
                    borderRadius: [
                        "50%",
                        "25% 75% 70% 30%",
                        "75% 25% 30% 70%",
                        "25% 75% 25% 75%",
                        "50%"
                    ],
                    rotate: [0, 90, 180, 270, 360],
                    scale: [1, 1.1, 0.9, 1.05, 1]
                }}
                transition={{
                    duration: duration,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
            />
        </motion.div>
    );
};

// Progress circle with animation
export const ProgressCircle: React.FC<{
    progress: number;
    size?: number;
    strokeWidth?: number;
    color?: string;
    backgroundColor?: string;
    showText?: boolean;
    className?: string;
}> = ({
    progress,
    size = 100,
    strokeWidth = 8,
    color = '#3B82F6',
    backgroundColor = '#E5E7EB',
    showText = true,
    className = ''
}) => {
    const center = size / 2;
    const radius = center - strokeWidth / 2;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (progress / 100) * circumference;
    
    return (
        <div className={`relative ${className}`} style={{ width: size, height: size }}>
            <svg width={size} height={size} className="transform -rotate-90">
                {/* Background circle */}
                <circle
                    cx={center}
                    cy={center}
                    r={radius}
                    stroke={backgroundColor}
                    strokeWidth={strokeWidth}
                    fill="none"
                />
                
                {/* Progress circle */}
                <motion.circle
                    cx={center}
                    cy={center}
                    r={radius}
                    stroke={color}
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                    fill="none"
                    style={{
                        strokeDasharray: circumference,
                        strokeDashoffset: circumference
                    }}
                    animate={{
                        strokeDashoffset
                    }}
                    transition={{
                        duration: 1,
                        ease: "easeInOut"
                    }}
                />
            </svg>
            
            {showText && (
                <div className="absolute inset-0 flex items-center justify-center">
                    <motion.span
                        className="text-lg font-semibold"
                        key={progress}
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.3 }}
                    >
                        {Math.round(progress)}%
                    </motion.span>
                </div>
            )}
        </div>
    );
};

// Interactive card with multiple effects
export const InteractiveCard: React.FC<{
    children: React.ReactNode;
    className?: string;
    glowColor?: string;
    borderColor?: string;
    hoverScale?: number;
}> = ({
    children,
    className = '',
    glowColor = 'rgba(59, 130, 246, 0.3)',
    borderColor = '#3B82F6',
    hoverScale = 1.02
}) => {
    const [isHovered, setIsHovered] = useState(false);
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);
    
    const handleMouseMove = (e: React.MouseEvent) => {
        const rect = e.currentTarget.getBoundingClientRect();
        mouseX.set(e.clientX - rect.left);
        mouseY.set(e.clientY - rect.top);
    };
    
    return (
        <motion.div
            className={`relative overflow-hidden rounded-xl ${className}`}
            onMouseMove={handleMouseMove}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            whileHover={{ scale: hoverScale }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
            {/* Glow effect */}
            <AnimatePresence>
                {isHovered && (
                    <motion.div
                        className="absolute inset-0 pointer-events-none"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <motion.div
                            className="absolute w-64 h-64 rounded-full"
                            style={{
                                background: `radial-gradient(circle, ${glowColor} 0%, transparent 70%)`,
                                left: mouseX,
                                top: mouseY,
                                x: "-50%",
                                y: "-50%"
                            }}
                        />
                    </motion.div>
                )}
            </AnimatePresence>
            
            {/* Border glow */}
            <AnimatePresence>
                {isHovered && (
                    <motion.div
                        className="absolute inset-0 rounded-xl pointer-events-none"
                        style={{
                            background: `linear-gradient(90deg, transparent, ${borderColor}, transparent)`,
                            padding: '1px'
                        }}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.3 }}
                    />
                )}
            </AnimatePresence>
            
            {children}
        </motion.div>
    );
};

// Breathing animation
export const BreathingAnimation: React.FC<{
    children: React.ReactNode;
    scale?: [number, number];
    duration?: number;
    className?: string;
}> = ({
    children,
    scale = [1, 1.05],
    duration = 3,
    className = ''
}) => {
    return (
        <motion.div
            className={className}
            animate={{
                scale
            }}
            transition={{
                duration,
                repeat: Infinity,
                repeatType: "reverse",
                ease: "easeInOut"
            }}
        >
            {children}
        </motion.div>
    );
};

export default {
    RippleButton,
    TiltHover,
    FloatingActionButton,
    ElasticHover,
    MorphingShape,
    ProgressCircle,
    InteractiveCard,
    BreathingAnimation
};