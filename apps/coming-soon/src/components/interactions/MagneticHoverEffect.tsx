'use client';

import React, { useRef, useEffect, useState, ReactNode } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

interface MagneticHoverEffectProps {
    children: ReactNode;
    intensity?: number;
    range?: number;
    stiffness?: number;
    damping?: number;
    className?: string;
    disabled?: boolean;
    magneticField?: boolean;
    pulseEffect?: boolean;
    rotationEffect?: boolean;
    scaleEffect?: boolean;
}

export const MagneticHoverEffect: React.FC<MagneticHoverEffectProps> = ({
    children,
    intensity = 0.3,
    range = 100,
    stiffness = 300,
    damping = 20,
    className = '',
    disabled = false,
    magneticField = true,
    pulseEffect = true,
    rotationEffect = false,
    scaleEffect = true
}) => {
    const ref = useRef<HTMLDivElement>(null);
    const [isHovered, setIsHovered] = useState(false);
    const [bounds, setBounds] = useState({ x: 0, y: 0, width: 0, height: 0 });

    // Motion values for smooth animations
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);
    const distance = useMotionValue(0);

    // Spring animations for smooth magnetic effects
    const springConfig = { stiffness, damping };
    const x = useSpring(mouseX, springConfig);
    const y = useSpring(mouseY, springConfig);
    const scale = useSpring(1, springConfig);
    const rotate = useSpring(0, springConfig);

    // Transform values based on mouse position and distance
    const magneticX = useTransform(x, [-range, range], [-intensity * 50, intensity * 50]);
    const magneticY = useTransform(y, [-range, range], [-intensity * 50, intensity * 50]);
    const magneticScale = useTransform(distance, [0, range], [scaleEffect ? 1.1 : 1, 1]);
    const magneticRotate = useTransform(x, [-range, range], rotationEffect ? [-5, 5] : [0, 0]);

    // Magnetic field intensity based on distance
    const fieldIntensity = useTransform(distance, [0, range], [1, 0]);

    useEffect(() => {
        if (disabled) return;

        const element = ref.current;
        if (!element) return;

        const updateBounds = () => {
            const rect = element.getBoundingClientRect();
            setBounds({
                x: rect.left + rect.width / 2,
                y: rect.top + rect.height / 2,
                width: rect.width,
                height: rect.height
            });
        };

        const handleMouseMove = (e: MouseEvent) => {
            if (!bounds.width) updateBounds();

            const deltaX = e.clientX - bounds.x;
            const deltaY = e.clientY - bounds.y;
            const dist = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

            // Only apply effects within range
            if (dist <= range) {
                const normalizedX = (deltaX / range) * 100;
                const normalizedY = (deltaY / range) * 100;
                
                mouseX.set(deltaX);
                mouseY.set(deltaY);
                distance.set(dist);

                if (scaleEffect) {
                    const scaleValue = 1 + (1 - dist / range) * 0.1;
                    scale.set(scaleValue);
                }

                if (rotationEffect) {
                    const rotateValue = (deltaX / range) * 5;
                    rotate.set(rotateValue);
                }

                setIsHovered(true);
            } else {
                // Reset to neutral position when out of range
                mouseX.set(0);
                mouseY.set(0);
                distance.set(range);
                scale.set(1);
                rotate.set(0);
                setIsHovered(false);
            }
        };

        const handleResize = () => {
            updateBounds();
        };

        const handleScroll = () => {
            updateBounds();
        };

        // Initial bounds calculation
        updateBounds();

        // Event listeners
        document.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('resize', handleResize);
        window.addEventListener('scroll', handleScroll);

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('scroll', handleScroll);
        };
    }, [bounds, disabled, intensity, range, mouseX, mouseY, distance, scale, rotate, scaleEffect, rotationEffect]);

    if (disabled) {
        return <div className={className}>{children}</div>;
    }

    return (
        <div ref={ref} className={`relative ${className}`}>
            {/* Magnetic Field Visualization */}
            {magneticField && isHovered && (
                <motion.div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                        opacity: fieldIntensity
                    }}
                >
                    {/* Concentric magnetic field rings */}
                    {[...Array(3)].map((_, i) => (
                        <motion.div
                            key={i}
                            className="absolute rounded-full border border-blue-400/20"
                            style={{
                                width: `${100 + i * 40}%`,
                                height: `${100 + i * 40}%`,
                                left: '50%',
                                top: '50%',
                                x: '-50%',
                                y: '-50%',
                                scale: useTransform(distance, [0, range], [1.2 - i * 0.1, 1]),
                                opacity: useTransform(distance, [0, range], [0.6 - i * 0.2, 0])
                            }}
                            animate={{
                                rotate: 360
                            }}
                            transition={{
                                duration: 4 + i * 2,
                                repeat: Infinity,
                                ease: "linear"
                            }}
                        />
                    ))}

                    {/* Magnetic field lines */}
                    <svg 
                        className="absolute inset-0 w-full h-full"
                        viewBox="0 0 200 200"
                        style={{
                            left: '50%',
                            top: '50%',
                            transform: 'translate(-50%, -50%)',
                            width: '200%',
                            height: '200%'
                        }}
                    >
                        <defs>
                            <radialGradient id="magneticFieldGradient" cx="50%" cy="50%" r="50%">
                                <stop offset="0%" stopColor="rgba(59, 130, 246, 0.3)" />
                                <stop offset="50%" stopColor="rgba(139, 92, 246, 0.2)" />
                                <stop offset="100%" stopColor="transparent" />
                            </radialGradient>
                        </defs>
                        
                        {/* Dynamic field lines */}
                        {[...Array(8)].map((_, i) => {
                            const angle = (i * 45) * Math.PI / 180;
                            const startR = 40;
                            const endR = 120;
                            const x1 = 100 + Math.cos(angle) * startR;
                            const y1 = 100 + Math.sin(angle) * startR;
                            const x2 = 100 + Math.cos(angle) * endR;
                            const y2 = 100 + Math.sin(angle) * endR;

                            return (
                                <motion.line
                                    key={i}
                                    x1={x1}
                                    y1={y1}
                                    x2={x2}
                                    y2={y2}
                                    stroke="url(#magneticFieldGradient)"
                                    strokeWidth="2"
                                    style={{
                                        opacity: useTransform(distance, [0, range], [0.5, 0])
                                    }}
                                />
                            );
                        })}
                    </svg>
                </motion.div>
            )}

            {/* Pulse effect */}
            {pulseEffect && isHovered && (
                <motion.div
                    className="absolute inset-0 rounded-full bg-blue-400/10 pointer-events-none"
                    style={{
                        scale: useTransform(distance, [0, range], [1.3, 1]),
                        opacity: useTransform(distance, [0, range], [0.8, 0])
                    }}
                    animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.3, 0.6, 0.3]
                    }}
                    transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                />
            )}

            {/* Main element with magnetic effects */}
            <motion.div
                style={{
                    x: magneticX,
                    y: magneticY,
                    scale: magneticScale,
                    rotate: magneticRotate
                }}
                transition={{
                    type: "spring",
                    stiffness,
                    damping
                }}
            >
                {children}
            </motion.div>

            {/* Magnetic particles */}
            {isHovered && (
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    {[...Array(12)].map((_, i) => {
                        const angle = (i * 30) * Math.PI / 180;
                        const baseRadius = 60 + i * 10;
                        
                        return (
                            <motion.div
                                key={i}
                                className="absolute w-1 h-1 bg-blue-400 rounded-full"
                                style={{
                                    left: '50%',
                                    top: '50%'
                                }}
                                animate={{
                                    x: Math.cos(angle + Date.now() * 0.001) * (baseRadius + Math.sin(Date.now() * 0.002 + i) * 20),
                                    y: Math.sin(angle + Date.now() * 0.001) * (baseRadius + Math.cos(Date.now() * 0.002 + i) * 20),
                                    opacity: [0.2, 0.8, 0.2],
                                    scale: [0.5, 1.5, 0.5]
                                }}
                                transition={{
                                    duration: 3 + i * 0.2,
                                    repeat: Infinity,
                                    ease: "easeInOut",
                                    delay: i * 0.1
                                }}
                            />
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default MagneticHoverEffect;