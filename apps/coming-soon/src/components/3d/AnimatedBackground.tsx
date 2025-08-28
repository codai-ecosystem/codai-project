'use client';

import React, { useMemo } from 'react';

interface AnimatedBackgroundProps {
    theme: 'light' | 'dark';
    mousePosition: { x: number; y: number };
    time: number;
}

export const AnimatedBackground: React.FC<AnimatedBackgroundProps> = ({
    theme,
    mousePosition,
    time
}) => {
    // Generate mesh gradient layers
    const meshLayers = useMemo(() => {
        return Array.from({ length: 5 }, (_, i) => ({
            id: i,
            scale: 1 + i * 0.3,
            rotation: time * (5 + i * 2),
            opacity: 0.15 - i * 0.02,
            hueRotation: time * (10 + i * 5) + i * 72,
            offsetX: Math.sin(time * 0.01 + i) * 10,
            offsetY: Math.cos(time * 0.015 + i) * 8
        }));
    }, [time]);

    // Generate floating geometric shapes
    const geometricShapes = useMemo(() => {
        return Array.from({ length: 8 }, (_, i) => ({
            id: i,
            x: 10 + (i % 4) * 25 + Math.sin(time * 0.001 + i) * 15,
            y: 15 + Math.floor(i / 4) * 35 + Math.cos(time * 0.0008 + i) * 12,
            z: Math.sin(time * 0.002 + i) * 30,
            scale: 0.8 + Math.sin(time * 0.003 + i) * 0.4,
            rotation: time * (8 + i * 3) + i * 45,
            rotationY: time * (12 + i * 2),
            rotationX: Math.sin(time * 0.001 + i) * 20,
            opacity: 0.4 + Math.sin(time * 0.002 + i) * 0.2,
            shape: ['triangle', 'square', 'hexagon', 'circle'][i % 4]
        }));
    }, [time]);

    // Generate neural network nodes
    const neuralNodes = useMemo(() => {
        const nodes = Array.from({ length: 12 }, (_, i) => ({
            id: i,
            x: 20 + (i % 3) * 30 + Math.sin(time * 0.0005 + i * 0.5) * 20,
            y: 25 + Math.floor(i / 3) * 20 + Math.cos(time * 0.0007 + i * 0.3) * 15,
            z: Math.sin(time * 0.001 + i) * 25,
            pulsePhase: time * 0.002 + i * 0.3,
            connectionStrength: 0.3 + Math.sin(time * 0.001 + i) * 0.2
        }));

        // Generate connections between nearby nodes
        const connections = nodes.flatMap((node, i) =>
            nodes.slice(i + 1).map((otherNode, j) => {
                const distance = Math.sqrt(
                    Math.pow(node.x - otherNode.x, 2) +
                    Math.pow(node.y - otherNode.y, 2)
                );
                return distance < 40 ? {
                    from: node,
                    to: otherNode,
                    strength: Math.max(0, 1 - distance / 40) * (node.connectionStrength + otherNode.connectionStrength) / 2,
                    id: `${i}-${i + j + 1}`
                } : null;
            }).filter(Boolean)
        );

        return { nodes, connections };
    }, [time]);

    // Interactive field distortion based on mouse
    const fieldDistortion = useMemo(() => {
        return {
            centerX: mousePosition.x,
            centerY: mousePosition.y,
            intensity: 1.5,
            radius: 35,
            waveFrequency: time * 0.005,
            ripples: Array.from({ length: 4 }, (_, i) => ({
                radius: (time * 20 + i * 80) % 300,
                opacity: 1 - ((time * 20 + i * 80) % 300) / 300
            }))
        };
    }, [mousePosition, time]);

    return (
        <div className="absolute inset-0 overflow-hidden">
            {/* Primary Gradient Foundation */}
            <div
                className={`absolute inset-0 transition-all duration-1000 ${theme === 'dark'
                        ? 'bg-gradient-to-br from-slate-900 via-blue-900/20 to-purple-900/20'
                        : 'bg-gradient-to-br from-blue-50/60 via-white to-purple-50/60'
                    }`}
            />

            {/* Dynamic Mesh Gradient Layers */}
            {meshLayers.map((layer) => (
                <div
                    key={layer.id}
                    className={`absolute inset-0 transition-all duration-2000 ${theme === 'dark'
                            ? 'bg-[radial-gradient(ellipse_1200px_800px_at_50%_300px,rgba(59,130,246,0.12),transparent),radial-gradient(ellipse_800px_600px_at_80%_400px,rgba(147,51,234,0.10),transparent),radial-gradient(ellipse_1000px_700px_at_20%_200px,rgba(236,72,153,0.08),transparent)]'
                            : 'bg-[radial-gradient(ellipse_1200px_800px_at_50%_300px,rgba(59,130,246,0.06),transparent),radial-gradient(ellipse_800px_600px_at_80%_400px,rgba(147,51,234,0.05),transparent),radial-gradient(ellipse_1000px_700px_at_20%_200px,rgba(236,72,153,0.04),transparent)]'
                        }`}
                    style={{
                        transform: `
                            translate(${layer.offsetX}px, ${layer.offsetY}px)
                            scale(${layer.scale})
                            rotate(${layer.rotation}deg)
                        `,
                        opacity: layer.opacity,
                        filter: `hue-rotate(${layer.hueRotation}deg) blur(${layer.id * 0.5}px)`,
                        mixBlendMode: 'soft-light'
                    }}
                />
            ))}

            {/* Interactive Field Distortion */}
            <div
                className="absolute inset-0"
                style={{
                    background: `radial-gradient(circle at ${fieldDistortion.centerX}% ${fieldDistortion.centerY}%, 
                        ${theme === 'dark'
                            ? 'rgba(59, 130, 246, 0.15)'
                            : 'rgba(59, 130, 246, 0.08)'
                        } 0%, 
                        transparent ${fieldDistortion.radius}%)`,
                    transform: `scale(${1 + Math.sin(fieldDistortion.waveFrequency) * 0.1})`,
                    transition: 'background 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
            >
                {/* Mouse interaction ripples */}
                {fieldDistortion.ripples.map((ripple, i) => (
                    <div
                        key={i}
                        className={`absolute rounded-full border-2 ${theme === 'dark'
                                ? 'border-blue-400/30'
                                : 'border-blue-500/20'
                            }`}
                        style={{
                            left: `${fieldDistortion.centerX}%`,
                            top: `${fieldDistortion.centerY}%`,
                            width: `${ripple.radius}px`,
                            height: `${ripple.radius}px`,
                            transform: 'translate(-50%, -50%)',
                            opacity: ripple.opacity * 0.6,
                            pointerEvents: 'none'
                        }}
                    />
                ))}
            </div>

            {/* Floating Geometric Shapes with 3D Transform */}
            <div className="absolute inset-0">
                {geometricShapes.map((shape) => (
                    <div
                        key={shape.id}
                        className={`absolute transition-all duration-1000 ease-out ${theme === 'dark' ? 'opacity-20' : 'opacity-15'
                            }`}
                        style={{
                            left: `${shape.x}%`,
                            top: `${shape.y}%`,
                            transform: `
                                translate3d(-50%, -50%, ${shape.z}px)
                                scale(${shape.scale})
                                rotateX(${shape.rotationX}deg)
                                rotateY(${shape.rotationY}deg)
                                rotateZ(${shape.rotation}deg)
                            `,
                            transformStyle: 'preserve-3d',
                            opacity: shape.opacity * 0.6
                        }}
                    >
                        {shape.shape === 'triangle' && (
                            <div
                                className={`w-0 h-0 ${theme === 'dark'
                                        ? 'border-l-[20px] border-l-transparent border-r-[20px] border-r-transparent border-b-[35px] border-b-blue-400/80'
                                        : 'border-l-[20px] border-l-transparent border-r-[20px] border-r-transparent border-b-[35px] border-b-blue-500/60'
                                    }`}
                                style={{
                                    filter: `drop-shadow(0 0 15px ${theme === 'dark' ? 'rgba(59, 130, 246, 0.5)' : 'rgba(59, 130, 246, 0.3)'
                                        }) hue-rotate(${shape.rotation}deg)`
                                }}
                            />
                        )}

                        {shape.shape === 'square' && (
                            <div
                                className={`w-8 h-8 ${theme === 'dark' ? 'bg-purple-400/80' : 'bg-purple-500/60'
                                    } rounded-lg`}
                                style={{
                                    filter: `drop-shadow(0 0 15px ${theme === 'dark' ? 'rgba(147, 51, 234, 0.5)' : 'rgba(147, 51, 234, 0.3)'
                                        }) hue-rotate(${shape.rotation}deg)`
                                }}
                            />
                        )}

                        {shape.shape === 'hexagon' && (
                            <div
                                className={`w-8 h-8 ${theme === 'dark' ? 'bg-pink-400/80' : 'bg-pink-500/60'
                                    }`}
                                style={{
                                    clipPath: 'polygon(30% 0%, 70% 0%, 100% 50%, 70% 100%, 30% 100%, 0% 50%)',
                                    filter: `drop-shadow(0 0 15px ${theme === 'dark' ? 'rgba(236, 72, 153, 0.5)' : 'rgba(236, 72, 153, 0.3)'
                                        }) hue-rotate(${shape.rotation}deg)`
                                }}
                            />
                        )}

                        {shape.shape === 'circle' && (
                            <div
                                className={`w-8 h-8 rounded-full ${theme === 'dark' ? 'bg-cyan-400/80' : 'bg-cyan-500/60'
                                    }`}
                                style={{
                                    filter: `drop-shadow(0 0 15px ${theme === 'dark' ? 'rgba(34, 211, 238, 0.5)' : 'rgba(34, 211, 238, 0.3)'
                                        }) hue-rotate(${shape.rotation}deg)`
                                }}
                            />
                        )}
                    </div>
                ))}
            </div>

            {/* Neural Network Visualization */}
            <div className="absolute inset-0">
                <svg className="w-full h-full opacity-30">
                    <defs>
                        <linearGradient id="connectionGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop
                                offset="0%"
                                stopColor={theme === 'dark' ? 'rgba(59, 130, 246, 0.6)' : 'rgba(59, 130, 246, 0.4)'}
                            />
                            <stop
                                offset="50%"
                                stopColor={theme === 'dark' ? 'rgba(147, 51, 234, 0.8)' : 'rgba(147, 51, 234, 0.6)'}
                            />
                            <stop
                                offset="100%"
                                stopColor={theme === 'dark' ? 'rgba(236, 72, 153, 0.6)' : 'rgba(236, 72, 153, 0.4)'}
                            />
                        </linearGradient>

                        <filter id="glow">
                            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                            <feMerge>
                                <feMergeNode in="coloredBlur" />
                                <feMergeNode in="SourceGraphic" />
                            </feMerge>
                        </filter>
                    </defs>

                    {/* Neural connections */}
                    {neuralNodes.connections.map((connection) => (
                        connection && (
                            <line
                                key={connection.id}
                                x1={`${connection.from.x}%`}
                                y1={`${connection.from.y}%`}
                                x2={`${connection.to.x}%`}
                                y2={`${connection.to.y}%`}
                                stroke="url(#connectionGradient)"
                                strokeWidth={1 + connection.strength * 2}
                                opacity={connection.strength}
                                filter="url(#glow)"
                                style={{
                                    strokeDasharray: `${5 + connection.strength * 10} ${3 + connection.strength * 5}`,
                                    strokeDashoffset: time * 0.5,
                                    animation: `dashAnimation ${2 + connection.strength}s linear infinite`
                                }}
                            />
                        )
                    ))}

                    {/* Neural nodes */}
                    {neuralNodes.nodes.map((node) => (
                        <g key={node.id}>
                            <circle
                                cx={`${node.x}%`}
                                cy={`${node.y}%`}
                                r={3 + Math.sin(node.pulsePhase) * 2}
                                fill={theme === 'dark' ? 'rgba(59, 130, 246, 0.8)' : 'rgba(59, 130, 246, 0.6)'}
                                filter="url(#glow)"
                                opacity={0.8 + Math.sin(node.pulsePhase) * 0.2}
                            />
                            <circle
                                cx={`${node.x}%`}
                                cy={`${node.y}%`}
                                r={8 + Math.sin(node.pulsePhase + Math.PI) * 4}
                                fill="none"
                                stroke={theme === 'dark' ? 'rgba(147, 51, 234, 0.4)' : 'rgba(147, 51, 234, 0.3)'}
                                strokeWidth="1"
                                opacity={0.6 + Math.sin(node.pulsePhase + Math.PI) * 0.3}
                            />
                        </g>
                    ))}
                </svg>
            </div>

            {/* Grid Pattern Overlay with Perspective */}
            <div className={`absolute inset-0 ${theme === 'dark' ? 'opacity-8' : 'opacity-4'}`}>
                <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <pattern
                            id="perspectiveGrid"
                            width="60"
                            height="60"
                            patternUnits="userSpaceOnUse"
                            patternTransform={`rotate(${time * 0.1}) scale(${1 + Math.sin(time * 0.002) * 0.1})`}
                        >
                            <path
                                d="M 60 0 L 0 0 0 60"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="0.5"
                                opacity="0.4"
                            />
                            <circle
                                cx="30"
                                cy="30"
                                r="1"
                                fill="currentColor"
                                opacity={0.6 + Math.sin(time * 0.003) * 0.3}
                            />
                        </pattern>
                    </defs>
                    <rect
                        width="100%"
                        height="100%"
                        fill="url(#perspectiveGrid)"
                        className={theme === 'dark' ? 'text-blue-400' : 'text-blue-500'}
                    />
                </svg>
            </div>

            {/* Volumetric Light Rays */}
            <div className="absolute inset-0 overflow-hidden">
                {[...Array(6)].map((_, i) => (
                    <div
                        key={i}
                        className={`absolute opacity-20 ${theme === 'dark' ? 'bg-gradient-to-r from-transparent via-blue-400/20 to-transparent' : 'bg-gradient-to-r from-transparent via-blue-500/15 to-transparent'
                            }`}
                        style={{
                            left: `${-20 + i * 25}%`,
                            top: `${-10}%`,
                            width: '2px',
                            height: '120%',
                            transform: `
                                rotate(${15 + i * 8 + Math.sin(time * 0.001 + i) * 10}deg)
                                scaleY(${1 + Math.sin(time * 0.002 + i) * 0.3})
                            `,
                            filter: `blur(${1 + Math.sin(time * 0.003 + i)}px)`,
                            animation: `lightRayMove ${8 + i * 2}s ease-in-out infinite alternate`
                        }}
                    />
                ))}
            </div>
        </div>
    );
};