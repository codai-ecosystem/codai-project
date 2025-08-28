'use client';

import React, { useRef, useEffect, useState, useMemo } from 'react';
import { useScrollAnimation } from './ScrollAnimationProvider';
import { useTheme } from '@/contexts/ThemeContext';

interface ParallaxLayerProps {
    children: React.ReactNode;
    speed: number;
    className?: string;
    style?: React.CSSProperties;
    offset?: number;
    scale?: number;
    opacity?: number;
    rotate?: number;
    id?: string;
}

export const ParallaxLayer: React.FC<ParallaxLayerProps> = ({
    children,
    speed,
    className = '',
    style = {},
    offset = 0,
    scale = 1,
    opacity = 1,
    rotate = 0,
    id
}) => {
    const { scrollY } = useScrollAnimation();
    const layerRef = useRef<HTMLDivElement>(null);
    const [elementTop, setElementTop] = useState(0);

    useEffect(() => {
        if (layerRef.current) {
            const updateElementTop = () => {
                const rect = layerRef.current!.getBoundingClientRect();
                setElementTop(rect.top + window.scrollY);
            };

            updateElementTop();
            window.addEventListener('resize', updateElementTop);
            return () => window.removeEventListener('resize', updateElementTop);
        }
    }, []);

    const transformStyle = useMemo(() => {
        const parallaxOffset = (scrollY - elementTop) * speed + offset;
        const scaleValue = scale + (scrollY - elementTop) * 0.0001 * scale;
        const opacityValue = Math.max(0, Math.min(1, opacity - (scrollY - elementTop) * 0.0005));
        const rotateValue = rotate + (scrollY - elementTop) * 0.01;

        return {
            transform: `
                translate3d(0, ${parallaxOffset}px, 0) 
                scale(${scaleValue}) 
                rotate(${rotateValue}deg)
            `,
            opacity: opacityValue,
            willChange: 'transform, opacity'
        };
    }, [scrollY, elementTop, speed, offset, scale, opacity, rotate]);

    return (
        <div
            ref={layerRef}
            className={`absolute inset-0 ${className}`}
            style={{
                ...style,
                ...transformStyle
            }}
            data-parallax-id={id}
        >
            {children}
        </div>
    );
};

interface ParallaxContainerProps {
    children: React.ReactNode;
    className?: string;
    style?: React.CSSProperties;
    height?: string | number;
    overflow?: 'visible' | 'hidden';
    enableMouseParallax?: boolean;
    mouseParallaxStrength?: number;
    backgroundLayers?: Array<{
        id: string;
        content: React.ReactNode;
        speed: number;
        className?: string;
        style?: React.CSSProperties;
    }>;
}

export const ParallaxContainer: React.FC<ParallaxContainerProps> = ({
    children,
    className = '',
    style = {},
    height = 'auto',
    overflow = 'hidden',
    enableMouseParallax = false,
    mouseParallaxStrength = 0.02,
    backgroundLayers = []
}) => {
    const { theme } = useTheme();
    const containerRef = useRef<HTMLDivElement>(null);
    const [mousePosition, setMousePosition] = useState({ x: 50, y: 50 });

    // Mouse parallax effect
    useEffect(() => {
        if (!enableMouseParallax || !containerRef.current) return;

        const handleMouseMove = (e: MouseEvent) => {
            const rect = containerRef.current!.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width) * 100;
            const y = ((e.clientY - rect.top) / rect.height) * 100;
            setMousePosition({ x, y });
        };

        containerRef.current.addEventListener('mousemove', handleMouseMove);
        return () => {
            if (containerRef.current) {
                containerRef.current.removeEventListener('mousemove', handleMouseMove);
            }
        };
    }, [enableMouseParallax]);

    const mouseParallaxStyle = useMemo(() => {
        if (!enableMouseParallax) return {};

        const offsetX = (mousePosition.x - 50) * mouseParallaxStrength;
        const offsetY = (mousePosition.y - 50) * mouseParallaxStrength;

        return {
            transform: `translate3d(${offsetX}px, ${offsetY}px, 0)`,
            transition: 'transform 0.1s ease-out'
        };
    }, [mousePosition, enableMouseParallax, mouseParallaxStrength]);

    return (
        <div
            ref={containerRef}
            className={`relative ${className}`}
            style={{
                height,
                overflow,
                ...style
            }}
        >
            {/* Background Layers */}
            {backgroundLayers.map((layer) => (
                <ParallaxLayer
                    key={layer.id}
                    id={layer.id}
                    speed={layer.speed}
                    className={layer.className}
                    style={layer.style}
                >
                    {layer.content}
                </ParallaxLayer>
            ))}

            {/* Main Content */}
            <div
                className="relative z-10"
                style={mouseParallaxStyle}
            >
                {children}
            </div>
        </div>
    );
};

// Parallax background patterns component
interface ParallaxBackgroundProps {
    patterns?: Array<{
        type: 'dots' | 'grid' | 'waves' | 'geometric' | 'neural';
        speed: number;
        opacity?: number;
        color?: string;
        size?: number;
        spacing?: number;
    }>;
    className?: string;
}

export const ParallaxBackground: React.FC<ParallaxBackgroundProps> = ({
    patterns = [
        { type: 'dots', speed: 0.2, opacity: 0.1 },
        { type: 'grid', speed: 0.3, opacity: 0.05 }
    ],
    className = ''
}) => {
    const { theme } = useTheme();

    const generateDotPattern = (pattern: any) => (
        <svg className="w-full h-full" style={{ opacity: pattern.opacity || 0.1 }}>
            <defs>
                <pattern
                    id={`dots-${pattern.speed}`}
                    x="0"
                    y="0"
                    width={pattern.spacing || 50}
                    height={pattern.spacing || 50}
                    patternUnits="userSpaceOnUse"
                >
                    <circle
                        cx={(pattern.spacing || 50) / 2}
                        cy={(pattern.spacing || 50) / 2}
                        r={pattern.size || 2}
                        fill={pattern.color || (theme === 'dark' ? '#3B82F6' : '#1E40AF')}
                    />
                </pattern>
            </defs>
            <rect width="100%" height="100%" fill={`url(#dots-${pattern.speed})`} />
        </svg>
    );

    const generateGridPattern = (pattern: any) => (
        <svg className="w-full h-full" style={{ opacity: pattern.opacity || 0.1 }}>
            <defs>
                <pattern
                    id={`grid-${pattern.speed}`}
                    x="0"
                    y="0"
                    width={pattern.spacing || 100}
                    height={pattern.spacing || 100}
                    patternUnits="userSpaceOnUse"
                >
                    <path
                        d={`M ${pattern.spacing || 100} 0 L 0 0 0 ${pattern.spacing || 100}`}
                        fill="none"
                        stroke={pattern.color || (theme === 'dark' ? '#3B82F6' : '#1E40AF')}
                        strokeWidth={pattern.size || 1}
                    />
                </pattern>
            </defs>
            <rect width="100%" height="100%" fill={`url(#grid-${pattern.speed})`} />
        </svg>
    );

    const generateWavePattern = (pattern: any) => (
        <svg className="w-full h-full" style={{ opacity: pattern.opacity || 0.1 }}>
            <defs>
                <pattern
                    id={`waves-${pattern.speed}`}
                    x="0"
                    y="0"
                    width="200"
                    height="100"
                    patternUnits="userSpaceOnUse"
                >
                    <path
                        d="M0,50 Q50,10 100,50 T200,50"
                        fill="none"
                        stroke={pattern.color || (theme === 'dark' ? '#3B82F6' : '#1E40AF')}
                        strokeWidth={pattern.size || 2}
                    />
                </pattern>
            </defs>
            <rect width="100%" height="100%" fill={`url(#waves-${pattern.speed})`} />
        </svg>
    );

    const generateGeometricPattern = (pattern: any) => (
        <svg className="w-full h-full" style={{ opacity: pattern.opacity || 0.1 }}>
            <defs>
                <pattern
                    id={`geometric-${pattern.speed}`}
                    x="0"
                    y="0"
                    width="120"
                    height="120"
                    patternUnits="userSpaceOnUse"
                >
                    <polygon
                        points="60,10 110,50 60,90 10,50"
                        fill="none"
                        stroke={pattern.color || (theme === 'dark' ? '#3B82F6' : '#1E40AF')}
                        strokeWidth={pattern.size || 1}
                    />
                    <circle
                        cx="60"
                        cy="50"
                        r="15"
                        fill="none"
                        stroke={pattern.color || (theme === 'dark' ? '#3B82F6' : '#1E40AF')}
                        strokeWidth={pattern.size || 1}
                    />
                </pattern>
            </defs>
            <rect width="100%" height="100%" fill={`url(#geometric-${pattern.speed})`} />
        </svg>
    );

    const generateNeuralPattern = (pattern: any) => (
        <svg className="w-full h-full" style={{ opacity: pattern.opacity || 0.1 }}>
            <defs>
                <pattern
                    id={`neural-${pattern.speed}`}
                    x="0"
                    y="0"
                    width="150"
                    height="150"
                    patternUnits="userSpaceOnUse"
                >
                    {/* Neural nodes */}
                    {[...Array(6)].map((_, i) => (
                        <circle
                            key={i}
                            cx={25 + (i % 3) * 50}
                            cy={25 + Math.floor(i / 3) * 100}
                            r={pattern.size || 3}
                            fill={pattern.color || (theme === 'dark' ? '#3B82F6' : '#1E40AF')}
                        />
                    ))}
                    {/* Neural connections */}
                    <path
                        d="M25,25 L75,25 M75,25 L125,25 M25,125 L75,125 M75,125 L125,125 M25,25 L25,125 M75,25 L75,125 M125,25 L125,125"
                        stroke={pattern.color || (theme === 'dark' ? '#3B82F6' : '#1E40AF')}
                        strokeWidth="1"
                        opacity="0.3"
                    />
                </pattern>
            </defs>
            <rect width="100%" height="100%" fill={`url(#neural-${pattern.speed})`} />
        </svg>
    );

    const patternGenerators = {
        dots: generateDotPattern,
        grid: generateGridPattern,
        waves: generateWavePattern,
        geometric: generateGeometricPattern,
        neural: generateNeuralPattern
    };

    return (
        <div className={`absolute inset-0 ${className}`}>
            {patterns.map((pattern, index) => (
                <ParallaxLayer
                    key={`${pattern.type}-${index}`}
                    speed={pattern.speed}
                    className="w-full h-full"
                >
                    {patternGenerators[pattern.type](pattern)}
                </ParallaxLayer>
            ))}
        </div>
    );
};