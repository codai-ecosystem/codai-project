'use client';

import React, { useMemo } from 'react';
import { useTheme } from '@/contexts/ThemeContext';

interface CSSParticleSystemProps {
    particleCount?: number;
    animationSpeed?: number;
    className?: string;
    performanceMode?: 'high' | 'medium' | 'low';
}

interface CSSParticle {
    id: number;
    left: string;
    top: string;
    size: number;
    color: string;
    type: 'dot' | 'line' | 'triangle' | 'cross';
    animationDelay: string;
    animationDuration: string;
}

const CSSParticleSystem: React.FC<CSSParticleSystemProps> = ({
    particleCount = 40,
    animationSpeed = 1,
    className = '',
    performanceMode = 'high'
}) => {
    const { theme } = useTheme();

    // Generate particles with CSS animations
    const particles = useMemo<CSSParticle[]>(() => {
        // Performance adjustments
        let adjustedCount = particleCount;
        if (performanceMode === 'low') {
            adjustedCount = Math.floor(particleCount * 0.3);
        } else if (performanceMode === 'medium') {
            adjustedCount = Math.floor(particleCount * 0.6);
        }

        // Reduce motion support
        const prefersReducedMotion = typeof window !== 'undefined'
            ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
            : false;

        if (prefersReducedMotion) {
            adjustedCount = Math.floor(adjustedCount * 0.5);
        }

        const colors = theme === 'dark'
            ? ['#3B82F6', '#8B5CF6', '#06B6D4', '#10B981', '#F59E0B']
            : ['#1E40AF', '#7C3AED', '#0891B2', '#059669', '#D97706'];

        const types: ('dot' | 'line' | 'triangle' | 'cross')[] = ['dot', 'line', 'triangle', 'cross'];

        return Array.from({ length: adjustedCount }, (_, i) => ({
            id: i,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            size: Math.random() * 8 + 2,
            color: colors[Math.floor(Math.random() * colors.length)],
            type: types[Math.floor(Math.random() * types.length)],
            animationDelay: `${Math.random() * 10}s`,
            animationDuration: `${(Math.random() * 15 + 10) / animationSpeed}s`
        }));
    }, [particleCount, animationSpeed, theme, performanceMode]);

    // CSS particle component
    const CSSParticle: React.FC<{ particle: CSSParticle }> = ({ particle }) => {
        const baseStyle: React.CSSProperties = {
            position: 'absolute',
            left: particle.left,
            top: particle.top,
            color: particle.color,
            backgroundColor: particle.color,
            animationDelay: particle.animationDelay,
            animationDuration: particle.animationDuration,
            animationIterationCount: 'infinite',
            animationTimingFunction: 'linear',
            opacity: 0.6,
            transformOrigin: 'center',
            willChange: 'transform, opacity',
        };

        const getParticleElement = () => {
            switch (particle.type) {
                case 'dot':
                    return (
                        <div
                            className="particle-float"
                            style={{
                                ...baseStyle,
                                width: `${particle.size}px`,
                                height: `${particle.size}px`,
                                borderRadius: '50%',
                                animationName: 'particleFloat, particleFade',
                            }}
                        />
                    );

                case 'line':
                    return (
                        <div
                            className="particle-rotate"
                            style={{
                                ...baseStyle,
                                width: `${particle.size * 2}px`,
                                height: `${particle.size / 4}px`,
                                animationName: 'particleFloat, particleRotate',
                            }}
                        />
                    );

                case 'triangle':
                    return (
                        <div
                            className="particle-pulse"
                            style={{
                                ...baseStyle,
                                width: 0,
                                height: 0,
                                backgroundColor: 'transparent',
                                borderLeft: `${particle.size}px solid transparent`,
                                borderRight: `${particle.size}px solid transparent`,
                                borderBottom: `${particle.size * 1.5}px solid ${particle.color}`,
                                animationName: 'particleFloat, particlePulse',
                            }}
                        />
                    );

                case 'cross':
                    return (
                        <div
                            className="particle-spin"
                            style={{
                                ...baseStyle,
                                width: `${particle.size}px`,
                                height: `${particle.size}px`,
                                position: 'relative',
                                animationName: 'particleFloat, particleSpin',
                            }}
                        >
                            <div
                                style={{
                                    position: 'absolute',
                                    top: '50%',
                                    left: 0,
                                    width: '100%',
                                    height: `${particle.size / 4}px`,
                                    backgroundColor: particle.color,
                                    transform: 'translateY(-50%)',
                                }}
                            />
                            <div
                                style={{
                                    position: 'absolute',
                                    left: '50%',
                                    top: 0,
                                    width: `${particle.size / 4}px`,
                                    height: '100%',
                                    backgroundColor: particle.color,
                                    transform: 'translateX(-50%)',
                                }}
                            />
                        </div>
                    );

                default:
                    return null;
            }
        };

        return getParticleElement();
    };

    return (
        <>
            {/* CSS Animations */}
            <style jsx>{`
                @keyframes particleFloat {
                    0%, 100% {
                        transform: translate(0, 0) scale(1);
                    }
                    25% {
                        transform: translate(-20px, -20px) scale(1.1);
                    }
                    50% {
                        transform: translate(20px, -40px) scale(0.9);
                    }
                    75% {
                        transform: translate(-10px, 20px) scale(1.05);
                    }
                }

                @keyframes particleFade {
                    0%, 100% {
                        opacity: 0.3;
                    }
                    50% {
                        opacity: 0.8;
                    }
                }

                @keyframes particleRotate {
                    0% {
                        transform: rotate(0deg);
                    }
                    100% {
                        transform: rotate(360deg);
                    }
                }

                @keyframes particlePulse {
                    0%, 100% {
                        transform: scale(1);
                        opacity: 0.5;
                    }
                    50% {
                        transform: scale(1.2);
                        opacity: 0.8;
                    }
                }

                @keyframes particleSpin {
                    0% {
                        transform: rotate(0deg) scale(1);
                    }
                    50% {
                        transform: rotate(180deg) scale(1.1);
                    }
                    100% {
                        transform: rotate(360deg) scale(1);
                    }
                }

                /* Connection lines using CSS gradients */
                .particle-connections {
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background-image: 
                        radial-gradient(circle at 20% 30%, ${theme === 'dark' ? '#3B82F620' : '#1E40AF20'} 1px, transparent 1px),
                        radial-gradient(circle at 60% 70%, ${theme === 'dark' ? '#8B5CF620' : '#7C3AED20'} 1px, transparent 1px),
                        radial-gradient(circle at 80% 20%, ${theme === 'dark' ? '#06B6D420' : '#0891B220'} 1px, transparent 1px),
                        radial-gradient(circle at 30% 80%, ${theme === 'dark' ? '#10B98120' : '#05966920'} 1px, transparent 1px);
                    background-size: 200px 200px, 300px 300px, 250px 250px, 180px 180px;
                    animation: connectionShift 20s ease-in-out infinite;
                    opacity: 0.3;
                }

                @keyframes connectionShift {
                    0%, 100% {
                        background-position: 0% 0%, 100% 100%, 0% 100%, 100% 0%;
                    }
                    50% {
                        background-position: 100% 100%, 0% 0%, 100% 0%, 0% 100%;
                    }
                }

                /* Reduced motion support */
                @media (prefers-reduced-motion: reduce) {
                    .particle-connections,
                    .particle-float,
                    .particle-rotate,
                    .particle-pulse,
                    .particle-spin {
                        animation-duration: 0.01ms !important;
                        animation-iteration-count: 1 !important;
                    }
                }

                /* Performance optimizations */
                .css-particle-system {
                    transform: translateZ(0);
                    backface-visibility: hidden;
                    perspective: 1000;
                }
            `}</style>

            {/* Particle Container */}
            <div
                className={`css-particle-system relative w-full h-full overflow-hidden ${className}`}
                style={{
                    background: 'transparent',
                    contain: 'layout style paint',
                }}
            >
                {/* Connection effect background */}
                <div className="particle-connections" />

                {/* Individual particles */}
                {particles.map(particle => (
                    <CSSParticle key={particle.id} particle={particle} />
                ))}

                {/* Interactive hover effect */}
                <div
                    className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-300"
                    style={{
                        background: `radial-gradient(circle at var(--mouse-x, 50%) var(--mouse-y, 50%), ${theme === 'dark' ? '#3B82F615' : '#1E40AF15'
                            } 0%, transparent 50%)`,
                    }}
                    onMouseMove={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        const x = ((e.clientX - rect.left) / rect.width) * 100;
                        const y = ((e.clientY - rect.top) / rect.height) * 100;
                        e.currentTarget.style.setProperty('--mouse-x', `${x}%`);
                        e.currentTarget.style.setProperty('--mouse-y', `${y}%`);
                    }}
                />
            </div>
        </>
    );
};

export default CSSParticleSystem;