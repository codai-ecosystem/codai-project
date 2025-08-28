'use client';

import React, { useMemo, CSSProperties } from 'react';

interface Particle {
    id: number;
    x: number;
    y: number;
    z: number;
    size: number;
    speed: number;
    direction: number;
    opacity: number;
    color: string;
    rotationSpeed: number;
    oscillation: number;
}

interface ParticleSystemProps {
    theme: 'light' | 'dark';
    mousePosition: { x: number; y: number };
    time: number;
    isInteractive: boolean;
    style?: CSSProperties;
}

const particleCount = 80;
const particleColors = ['blue', 'purple', 'pink', 'cyan', 'emerald', 'violet', 'indigo'];

const generateParticles = (): Particle[] => {
    return Array.from({ length: particleCount }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        z: Math.random() * 100 - 50, // -50 to 50 for depth
        size: Math.random() * 3 + 0.5,
        speed: Math.random() * 0.2 + 0.05,
        direction: Math.random() * Math.PI * 2,
        opacity: Math.random() * 0.7 + 0.2,
        color: particleColors[Math.floor(Math.random() * particleColors.length)],
        rotationSpeed: Math.random() * 0.02 + 0.005,
        oscillation: Math.random() * 0.5 + 0.2
    }));
};

export const ParticleSystem: React.FC<ParticleSystemProps> = ({
    theme,
    mousePosition,
    time,
    isInteractive,
    style
}) => {
    // Generate particles only once for performance
    const particles = useMemo(() => generateParticles(), []);

    // Calculate interactive particles based on mouse
    const interactiveParticles = useMemo(() => {
        return particles.map(particle => {
            // Base movement
            const baseMovement = {
                x: particle.x + Math.cos(particle.direction + time * particle.speed) * particle.oscillation,
                y: particle.y + Math.sin(particle.direction + time * particle.speed * 0.7) * particle.oscillation * 0.5,
                z: particle.z + Math.sin(time * particle.speed * 0.3) * 10
            };

            // Interactive effects when hovering
            if (isInteractive) {
                const distanceFromMouse = Math.sqrt(
                    Math.pow(baseMovement.x - mousePosition.x, 2) +
                    Math.pow(baseMovement.y - mousePosition.y, 2)
                );

                const interactionRadius = 25;
                const interactionStrength = Math.max(0, 1 - (distanceFromMouse / interactionRadius));

                if (interactionStrength > 0) {
                    const angleToMouse = Math.atan2(
                        baseMovement.y - mousePosition.y,
                        baseMovement.x - mousePosition.x
                    );

                    // Repulsion effect
                    const repulsionForce = interactionStrength * 5;
                    baseMovement.x += Math.cos(angleToMouse) * repulsionForce;
                    baseMovement.y += Math.sin(angleToMouse) * repulsionForce;
                    baseMovement.z += interactionStrength * 20;
                }
            }

            // Wrap around screen
            if (baseMovement.x > 100) baseMovement.x = 0;
            if (baseMovement.x < 0) baseMovement.x = 100;
            if (baseMovement.y > 100) baseMovement.y = 0;
            if (baseMovement.y < 0) baseMovement.y = 100;

            return {
                ...particle,
                ...baseMovement,
                currentOpacity: particle.opacity * (0.5 + 0.5 * Math.sin(time * 0.5 + particle.id)),
                currentSize: particle.size * (0.8 + 0.4 * Math.sin(time * 0.3 + particle.id)),
                rotation: time * particle.rotationSpeed * 360
            };
        });
    }, [particles, mousePosition, time, isInteractive]);

    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none" style={style}>
            {interactiveParticles.map((particle) => {
                const particleStyle: CSSProperties = {
                    position: 'absolute',
                    left: `${particle.x}%`,
                    top: `${particle.y}%`,
                    width: `${particle.currentSize}px`,
                    height: `${particle.currentSize}px`,
                    opacity: particle.currentOpacity,
                    transform: `
                        translate3d(-50%, -50%, ${particle.z}px)
                        rotate(${particle.rotation}deg)
                        scale(${1 + Math.sin(time + particle.id) * 0.3})
                    `,
                    transformStyle: 'preserve-3d',
                    transition: 'transform 0.1s cubic-bezier(0.4, 0, 0.2, 1)',
                    borderRadius: '50%',
                    filter: `blur(${particle.currentSize * 0.3}px) hue-rotate(${time * 20 + particle.id * 30}deg)`,
                    boxShadow: theme === 'dark'
                        ? `0 0 ${particle.currentSize * 4}px rgba(59, 130, 246, 0.4)`
                        : `0 0 ${particle.currentSize * 4}px rgba(59, 130, 246, 0.25)`
                };

                // Dynamic color based on theme and particle type
                const colorClass = theme === 'dark'
                    ? `bg-${particle.color}-400/60`
                    : `bg-${particle.color}-500/40`;

                return (
                    <div
                        key={particle.id}
                        className={`${colorClass} rounded-full`}
                        style={particleStyle}
                    >
                        {/* Inner glow effect */}
                        <div
                            className={`absolute inset-0 rounded-full ${theme === 'dark'
                                    ? `bg-${particle.color}-300/80`
                                    : `bg-${particle.color}-400/60`
                                }`}
                            style={{
                                transform: 'scale(0.6)',
                                filter: 'blur(0.5px)'
                            }}
                        />

                        {/* Outer glow ring */}
                        <div
                            className={`absolute inset-0 rounded-full border ${theme === 'dark'
                                    ? `border-${particle.color}-200/40`
                                    : `border-${particle.color}-600/30`
                                }`}
                            style={{
                                transform: `scale(${1.5 + Math.sin(time * 0.5 + particle.id) * 0.3})`,
                                opacity: 0.3
                            }}
                        />
                    </div>
                );
            })}

            {/* Additional floating orbs for depth */}
            <div className="absolute inset-0">
                {[...Array(12)].map((_, i) => {
                    const orbAngle = (time * 0.03 + i * 0.5) % (Math.PI * 2);
                    const orbRadius = 30 + i * 5;
                    const orbX = 50 + Math.cos(orbAngle) * (orbRadius * 0.8);
                    const orbY = 50 + Math.sin(orbAngle * 0.7) * (orbRadius * 0.6);
                    const orbZ = Math.sin(time * 0.1 + i) * 30;

                    return (
                        <div
                            key={`orb-${i}`}
                            className={`absolute rounded-full transition-all duration-1000 ease-out ${theme === 'dark'
                                    ? 'bg-gradient-radial from-blue-500/20 via-purple-500/15 to-transparent'
                                    : 'bg-gradient-radial from-blue-300/30 via-purple-300/20 to-transparent'
                                }`}
                            style={{
                                left: `${orbX}%`,
                                top: `${orbY}%`,
                                width: `${60 + i * 15 + Math.sin(time * 0.2 + i) * 20}px`,
                                height: `${60 + i * 15 + Math.sin(time * 0.2 + i) * 20}px`,
                                transform: `
                                    translate3d(-50%, -50%, ${orbZ}px)
                                    rotateY(${time * 10 + i * 30}deg)
                                    rotateX(${Math.sin(time * 0.1 + i) * 20}deg)
                                `,
                                transformStyle: 'preserve-3d',
                                filter: `blur(${20 + i * 5}px) hue-rotate(${time * 15 + i * 45}deg)`,
                                opacity: 0.4 + Math.sin(time * 0.15 + i) * 0.2,
                                background: `conic-gradient(from ${time * 50 + i * 60}deg, 
                                    hsl(${200 + i * 25}, 70%, ${theme === 'dark' ? '50' : '70'}%), 
                                    hsl(${260 + i * 25}, 70%, ${theme === 'dark' ? '60' : '80'}%), 
                                    hsl(${320 + i * 25}, 70%, ${theme === 'dark' ? '55' : '75'}%), 
                                    hsl(${200 + i * 25}, 70%, ${theme === 'dark' ? '50' : '70'}%))`
                            }}
                        />
                    );
                })}
            </div>

            {/* Quantum field lines */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
                <defs>
                    <linearGradient id="fieldLine" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor={theme === 'dark' ? 'rgba(59, 130, 246, 0.3)' : 'rgba(59, 130, 246, 0.2)'} />
                        <stop offset="50%" stopColor={theme === 'dark' ? 'rgba(147, 51, 234, 0.4)' : 'rgba(147, 51, 234, 0.25)'} />
                        <stop offset="100%" stopColor={theme === 'dark' ? 'rgba(236, 72, 153, 0.3)' : 'rgba(236, 72, 153, 0.2)'} />
                    </linearGradient>
                </defs>

                {interactiveParticles.slice(0, 8).map((particle, index) => {
                    const nextParticle = interactiveParticles[(index + 1) % 8];
                    const distance = Math.sqrt(
                        Math.pow(particle.x - nextParticle.x, 2) +
                        Math.pow(particle.y - nextParticle.y, 2)
                    );

                    // Only draw lines between nearby particles
                    if (distance < 30) {
                        return (
                            <line
                                key={`line-${index}`}
                                x1={`${particle.x}%`}
                                y1={`${particle.y}%`}
                                x2={`${nextParticle.x}%`}
                                y2={`${nextParticle.y}%`}
                                stroke="url(#fieldLine)"
                                strokeWidth={1 + Math.sin(time * 0.5 + index) * 0.5}
                                opacity={0.3 * (1 - distance / 30)}
                                style={{
                                    filter: `hue-rotate(${time * 30 + index * 60}deg)`
                                }}
                            />
                        );
                    }
                    return null;
                })}
            </svg>
        </div>
    );
};