'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Sparkles, Zap, Command, Star } from 'lucide-react';

interface DynamicCursorProps {
    mousePosition: { x: number; y: number };
    theme: 'light' | 'dark';
}

interface CursorTrail {
    id: number;
    x: number;
    y: number;
    opacity: number;
    scale: number;
    rotation: number;
    timestamp: number;
}

export const DynamicCursor: React.FC<DynamicCursorProps> = ({ mousePosition, theme }) => {
    const [realMousePos, setRealMousePos] = useState({ x: 0, y: 0 });
    const [isMoving, setIsMoving] = useState(false);
    const [clickEffect, setClickEffect] = useState(false);
    const [trail, setTrail] = useState<CursorTrail[]>([]);
    const [cursorType, setCursorType] = useState<'default' | 'hover' | 'click'>('default');
    const trailIdRef = useRef(0);
    const lastMoveTime = useRef(Date.now());

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            const newPos = { x: e.clientX, y: e.clientY };
            setRealMousePos(newPos);
            setIsMoving(true);
            lastMoveTime.current = Date.now();

            // Add to trail
            const newTrailPoint: CursorTrail = {
                id: trailIdRef.current++,
                x: e.clientX,
                y: e.clientY,
                opacity: 1,
                scale: 1,
                rotation: Math.random() * 360,
                timestamp: Date.now()
            };

            setTrail(prev => [...prev.slice(-15), newTrailPoint]); // Keep last 15 points
        };

        const handleMouseClick = () => {
            setClickEffect(true);
            setCursorType('click');
            setTimeout(() => {
                setClickEffect(false);
                setCursorType('default');
            }, 300);
        };

        const handleMouseOver = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            if (target.closest('button, a, [role="button"]')) {
                setCursorType('hover');
            } else {
                setCursorType('default');
            }
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('click', handleMouseClick);
        window.addEventListener('mouseover', handleMouseOver);

        // Check if mouse stopped moving
        const moveChecker = setInterval(() => {
            if (Date.now() - lastMoveTime.current > 100) {
                setIsMoving(false);
            }
        }, 50);

        // Trail fade animation
        const trailFader = setInterval(() => {
            setTrail(prev =>
                prev.map(point => ({
                    ...point,
                    opacity: Math.max(0, point.opacity - 0.05),
                    scale: point.scale * 0.98
                })).filter(point => point.opacity > 0.01)
            );
        }, 16);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('click', handleMouseClick);
            window.removeEventListener('mouseover', handleMouseOver);
            clearInterval(moveChecker);
            clearInterval(trailFader);
        };
    }, []);

    // Cursor variants based on state
    const cursorVariants = useMemo(() => ({
        default: {
            size: isMoving ? 24 : 20,
            innerSize: isMoving ? 8 : 6,
            borderWidth: 2,
            icon: null,
            glow: isMoving ? 15 : 10
        },
        hover: {
            size: 32,
            innerSize: 12,
            borderWidth: 3,
            icon: Sparkles,
            glow: 25
        },
        click: {
            size: 40,
            innerSize: 16,
            borderWidth: 4,
            icon: Zap,
            glow: 35
        }
    }), [isMoving]);

    const currentVariant = cursorVariants[cursorType];
    const IconComponent = currentVariant.icon;

    return (
        <>
            {/* Cursor Trail */}
            {trail.map((point, index) => (
                <div
                    key={point.id}
                    className="fixed pointer-events-none z-50 rounded-full"
                    style={{
                        left: `${point.x}px`,
                        top: `${point.y}px`,
                        width: `${4 + index * 0.5}px`,
                        height: `${4 + index * 0.5}px`,
                        opacity: point.opacity * 0.6,
                        transform: `translate(-50%, -50%) scale(${point.scale}) rotate(${point.rotation}deg)`,
                        background: theme === 'dark'
                            ? `conic-gradient(from ${point.rotation}deg, 
                                hsl(220, 100%, 60%), 
                                hsl(280, 100%, 70%), 
                                hsl(200, 100%, 65%), 
                                hsl(220, 100%, 60%))`
                            : `conic-gradient(from ${point.rotation}deg, 
                                hsl(220, 80%, 50%), 
                                hsl(280, 80%, 60%), 
                                hsl(200, 80%, 55%), 
                                hsl(220, 80%, 50%))`,
                        filter: `blur(${1 + index * 0.1}px)`,
                        transition: 'transform 0.1s cubic-bezier(0.4, 0, 0.2, 1)'
                    }}
                />
            ))}

            {/* Main Cursor */}
            <div
                className="fixed pointer-events-none z-50 transition-all duration-200 ease-out"
                style={{
                    left: `${realMousePos.x}px`,
                    top: `${realMousePos.y}px`,
                    transform: `translate(-50%, -50%) scale(${clickEffect ? 1.3 : 1}) rotate(${isMoving ? '360deg' : '0deg'})`,
                    transition: clickEffect ? 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)' : 'transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
            >
                {/* Outer Ring with Glow */}
                <div
                    className={`absolute rounded-full border transition-all duration-200 ${theme === 'dark'
                            ? 'border-blue-400/80'
                            : 'border-blue-500/60'
                        }`}
                    style={{
                        width: `${currentVariant.size}px`,
                        height: `${currentVariant.size}px`,
                        borderWidth: `${currentVariant.borderWidth}px`,
                        transform: 'translate(-50%, -50%)',
                        boxShadow: `
                            0 0 ${currentVariant.glow}px ${theme === 'dark' ? 'rgba(59, 130, 246, 0.6)' : 'rgba(59, 130, 246, 0.4)'},
                            inset 0 0 ${currentVariant.glow * 0.5}px ${theme === 'dark' ? 'rgba(147, 51, 234, 0.3)' : 'rgba(147, 51, 234, 0.2)'}
                        `,
                        background: theme === 'dark'
                            ? `conic-gradient(from 0deg, 
                                rgba(59, 130, 246, 0.1), 
                                rgba(147, 51, 234, 0.15), 
                                rgba(236, 72, 153, 0.1), 
                                rgba(59, 130, 246, 0.1))`
                            : `conic-gradient(from 0deg, 
                                rgba(59, 130, 246, 0.05), 
                                rgba(147, 51, 234, 0.08), 
                                rgba(236, 72, 153, 0.05), 
                                rgba(59, 130, 246, 0.05))`
                    }}
                />

                {/* Inner Circle */}
                <div
                    className={`absolute rounded-full transition-all duration-200 ${theme === 'dark'
                            ? 'bg-blue-400/90'
                            : 'bg-blue-500/80'
                        }`}
                    style={{
                        width: `${currentVariant.innerSize}px`,
                        height: `${currentVariant.innerSize}px`,
                        transform: 'translate(-50%, -50%)',
                        boxShadow: `0 0 ${currentVariant.innerSize}px ${theme === 'dark' ? 'rgba(59, 130, 246, 0.8)' : 'rgba(59, 130, 246, 0.6)'}`
                    }}
                />

                {/* Icon (for hover/click states) */}
                {IconComponent && (
                    <div
                        className="absolute transform -translate-x-1/2 -translate-y-1/2"
                        style={{
                            top: '50%',
                            left: '50%'
                        }}
                    >
                        <IconComponent
                            className={`w-4 h-4 ${theme === 'dark' ? 'text-white' : 'text-white'
                                } animate-pulse`}
                            style={{
                                filter: 'drop-shadow(0 0 5px rgba(255, 255, 255, 0.8))'
                            }}
                        />
                    </div>
                )}

                {/* Click Ripple Effect */}
                {clickEffect && (
                    <>
                        {[...Array(3)].map((_, i) => (
                            <div
                                key={i}
                                className={`absolute rounded-full border-2 ${theme === 'dark'
                                        ? 'border-purple-400/60'
                                        : 'border-purple-500/50'
                                    } animate-ping`}
                                style={{
                                    width: `${60 + i * 20}px`,
                                    height: `${60 + i * 20}px`,
                                    transform: 'translate(-50%, -50%)',
                                    animationDuration: `${0.6 + i * 0.2}s`,
                                    animationDelay: `${i * 0.1}s`
                                }}
                            />
                        ))}
                    </>
                )}

                {/* Ambient Particles */}
                {isMoving && (
                    <div className="absolute inset-0">
                        {[...Array(6)].map((_, i) => {
                            const angle = (i * 60) + (Date.now() * 0.1);
                            const radius = 20 + Math.sin(Date.now() * 0.005 + i) * 5;
                            const x = Math.cos(angle * Math.PI / 180) * radius;
                            const y = Math.sin(angle * Math.PI / 180) * radius;

                            return (
                                <div
                                    key={i}
                                    className={`absolute w-2 h-2 rounded-full ${theme === 'dark' ? 'bg-cyan-400/70' : 'bg-cyan-500/60'
                                        } animate-pulse`}
                                    style={{
                                        left: '50%',
                                        top: '50%',
                                        transform: `translate(-50%, -50%) translate(${x}px, ${y}px) scale(${0.5 + Math.sin(Date.now() * 0.01 + i) * 0.5})`,
                                        opacity: 0.6 + Math.sin(Date.now() * 0.008 + i) * 0.4,
                                        filter: `hue-rotate(${i * 60}deg) blur(0.5px)`,
                                        boxShadow: `0 0 8px ${theme === 'dark' ? 'rgba(34, 211, 238, 0.6)' : 'rgba(34, 211, 238, 0.4)'}`
                                    }}
                                />
                            );
                        })}
                    </div>
                )}

                {/* Magnetic Field Lines (when hovering interactive elements) */}
                {cursorType === 'hover' && (
                    <svg
                        className="absolute inset-0 pointer-events-none"
                        style={{
                            width: '80px',
                            height: '80px',
                            transform: 'translate(-50%, -50%)'
                        }}
                    >
                        <defs>
                            <linearGradient id="magneticGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor={theme === 'dark' ? 'rgba(168, 85, 247, 0.8)' : 'rgba(168, 85, 247, 0.6)'} />
                                <stop offset="100%" stopColor={theme === 'dark' ? 'rgba(59, 130, 246, 0.8)' : 'rgba(59, 130, 246, 0.6)'} />
                            </linearGradient>
                        </defs>

                        {[...Array(4)].map((_, i) => {
                            const radius = 20 + i * 8;
                            const strokeWidth = 2 - i * 0.3;

                            return (
                                <circle
                                    key={i}
                                    cx="40"
                                    cy="40"
                                    r={radius}
                                    fill="none"
                                    stroke="url(#magneticGradient)"
                                    strokeWidth={strokeWidth}
                                    opacity={0.6 - i * 0.1}
                                    className="animate-spin"
                                    style={{
                                        animationDuration: `${4 + i * 2}s`,
                                        animationDirection: i % 2 === 0 ? 'normal' : 'reverse'
                                    }}
                                />
                            );
                        })}
                    </svg>
                )}
            </div>

            {/* Ambient Cursor Glow */}
            <div
                className="fixed pointer-events-none z-40 rounded-full transition-all duration-300 ease-out"
                style={{
                    left: `${realMousePos.x}px`,
                    top: `${realMousePos.y}px`,
                    width: `${isMoving ? 120 : 80}px`,
                    height: `${isMoving ? 120 : 80}px`,
                    transform: 'translate(-50%, -50%)',
                    background: theme === 'dark'
                        ? `radial-gradient(circle, 
                            rgba(59, 130, 246, 0.1) 0%, 
                            rgba(147, 51, 234, 0.08) 30%, 
                            rgba(236, 72, 153, 0.05) 60%, 
                            transparent 100%)`
                        : `radial-gradient(circle, 
                            rgba(59, 130, 246, 0.05) 0%, 
                            rgba(147, 51, 234, 0.04) 30%, 
                            rgba(236, 72, 153, 0.02) 60%, 
                            transparent 100%)`,
                    filter: 'blur(20px)',
                    opacity: isMoving ? 1 : 0.6
                }}
            />
        </>
    );
};