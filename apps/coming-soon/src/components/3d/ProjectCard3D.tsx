'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
    ExternalLink,
    Star,
    ArrowRight,
    Filter,
    Brain,
    Zap,
    Globe,
    Sparkles,
    Eye,
    TrendingUp,
    Shield,
    Code2,
    Database,
    Cpu,
    Heart,
    Command,
    Play
} from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { codaiProjects, getProjectsByTier, type Project } from '@/data/projects';

interface ProjectCard3DProps {
    project: Project;
    size: 'small' | 'medium' | 'large' | 'featured';
    className?: string;
    style?: React.CSSProperties;
    index: number;
    mousePosition: { x: number; y: number };
    time: number;
}

const iconMap: Record<string, React.ElementType> = {
    Brain, Zap, Globe, Shield, Code2, Database, Cpu, TrendingUp, Heart, Command
};

const ProjectCard3D: React.FC<ProjectCard3DProps> = ({
    project,
    size,
    className = '',
    style = {},
    index,
    mousePosition,
    time
}) => {
    const { theme } = useTheme();
    const cardRef = useRef<HTMLDivElement>(null);
    const [isHovered, setIsHovered] = useState(false);
    const [localMousePos, setLocalMousePos] = useState({ x: 50, y: 50 });
    const [cardTransform, setCardTransform] = useState({ rotateX: 0, rotateY: 0, translateZ: 0 });

    const sizeClasses = {
        small: 'col-span-1 row-span-1 h-64',
        medium: 'col-span-1 md:col-span-2 row-span-1 h-64 md:h-72',
        large: 'col-span-1 md:col-span-2 lg:col-span-3 row-span-2 h-96 md:h-80',
        featured: 'col-span-1 md:col-span-2 lg:col-span-4 row-span-2 h-96 md:h-96'
    };

    const textSizes = {
        small: { title: 'text-lg', desc: 'text-sm', features: 'text-xs' },
        medium: { title: 'text-xl', desc: 'text-sm', features: 'text-xs' },
        large: { title: 'text-2xl', desc: 'text-base', features: 'text-sm' },
        featured: { title: 'text-3xl md:text-4xl', desc: 'text-lg', features: 'text-base' }
    };

    const statusColors = {
        production: 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40',
        development: 'bg-blue-500/20 text-blue-300 border-blue-400/40',
        beta: 'bg-yellow-500/20 text-yellow-300 border-yellow-400/40',
        planned: 'bg-purple-500/20 text-purple-300 border-purple-400/40',
        'coming-soon': 'bg-cyan-500/20 text-cyan-300 border-cyan-400/40'
    };

    // Get appropriate icon for the project
    const IconComponent = iconMap[project.category] || Brain;

    // Calculate 3D transforms based on mouse position
    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!cardRef.current) return;

        const rect = cardRef.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        const mouseX = e.clientX;
        const mouseY = e.clientY;

        const rotateY = ((mouseX - centerX) / (rect.width / 2)) * 15;
        const rotateX = ((mouseY - centerY) / (rect.height / 2)) * -10;
        const translateZ = isHovered ? 20 : 0;

        setCardTransform({ rotateX, rotateY, translateZ });
        setLocalMousePos({
            x: ((mouseX - rect.left) / rect.width) * 100,
            y: ((mouseY - rect.top) / rect.height) * 100
        });
    };

    const handleMouseLeave = () => {
        setCardTransform({ rotateX: 0, rotateY: 0, translateZ: 0 });
        setIsHovered(false);
        setLocalMousePos({ x: 50, y: 50 });
    };

    // Dynamic gradient based on project tier and hover state
    const dynamicGradient = useMemo(() => {
        const baseHue = project.tier * 60 + time * 10;
        const intensity = isHovered ? 0.8 : 0.6;

        if (theme === 'dark') {
            return `conic-gradient(from ${baseHue}deg at ${localMousePos.x}% ${localMousePos.y}%, 
                hsl(${baseHue}, 70%, ${20 * intensity}%) 0deg,
                hsl(${(baseHue + 60) % 360}, 70%, ${25 * intensity}%) 60deg,
                hsl(${(baseHue + 120) % 360}, 70%, ${22 * intensity}%) 120deg,
                hsl(${(baseHue + 180) % 360}, 70%, ${28 * intensity}%) 180deg,
                hsl(${(baseHue + 240) % 360}, 70%, ${18 * intensity}%) 240deg,
                hsl(${(baseHue + 300) % 360}, 70%, ${24 * intensity}%) 300deg,
                hsl(${baseHue}, 70%, ${20 * intensity}%) 360deg)`;
        } else {
            return `conic-gradient(from ${baseHue}deg at ${localMousePos.x}% ${localMousePos.y}%, 
                hsl(${baseHue}, 50%, ${85 + 10 * intensity}%) 0deg,
                hsl(${(baseHue + 60) % 360}, 50%, ${88 + 8 * intensity}%) 60deg,
                hsl(${(baseHue + 120) % 360}, 50%, ${87 + 9 * intensity}%) 120deg,
                hsl(${(baseHue + 180) % 360}, 50%, ${90 + 7 * intensity}%) 180deg,
                hsl(${(baseHue + 240) % 360}, 50%, ${86 + 10 * intensity}%) 240deg,
                hsl(${(baseHue + 300) % 360}, 50%, ${89 + 8 * intensity}%) 300deg,
                hsl(${baseHue}, 50%, ${85 + 10 * intensity}%) 360deg)`;
        }
    }, [project.tier, time, isHovered, localMousePos, theme]);

    return (
        <div
            ref={cardRef}
            className={`
                ${sizeClasses[size]} 
                ${className}
                group relative overflow-hidden rounded-3xl border cursor-pointer
                ${theme === 'dark'
                    ? 'border-slate-700/50 bg-slate-900/80'
                    : 'border-gray-200/50 bg-white/80'
                }
                backdrop-blur-xl transition-all duration-700 ease-out
                hover:shadow-2xl
            `}
            style={{
                ...style,
                transform: `
                    perspective(1000px) 
                    rotateX(${cardTransform.rotateX}deg) 
                    rotateY(${cardTransform.rotateY}deg) 
                    translateZ(${cardTransform.translateZ}px)
                    scale(${isHovered ? 1.05 : 1})
                `,
                transformStyle: 'preserve-3d',
                background: dynamicGradient,
                boxShadow: isHovered
                    ? `0 25px 50px rgba(59, 130, 246, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.1)`
                    : `0 10px 30px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(255, 255, 255, 0.05)`
            }}
            onMouseMove={handleMouseMove}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={handleMouseLeave}
            onClick={() => {
                if (project.domain.startsWith('http')) {
                    window.open(project.domain, '_blank');
                } else {
                    window.open(`https://${project.domain}`, '_blank');
                }
            }}
        >
            {/* 3D Background Layers */}
            <div
                className="absolute inset-0 opacity-30"
                style={{
                    background: `radial-gradient(circle at ${localMousePos.x}% ${localMousePos.y}%, 
                        rgba(255, 255, 255, 0.15) 0%, 
                        transparent 70%)`,
                    transform: 'translateZ(-10px)',
                    transformStyle: 'preserve-3d'
                }}
            />

            {/* Floating Elements */}
            <div className="absolute inset-0 overflow-hidden">
                {[...Array(6)].map((_, i) => (
                    <div
                        key={i}
                        className={`absolute w-2 h-2 rounded-full ${theme === 'dark' ? 'bg-blue-400/40' : 'bg-blue-500/30'
                            }`}
                        style={{
                            left: `${20 + i * 15}%`,
                            top: `${15 + (i % 3) * 25}%`,
                            transform: `
                                translateZ(${5 + i * 3}px) 
                                translate(${Math.sin(time * 0.001 + i) * 10}px, ${Math.cos(time * 0.0008 + i) * 8}px)
                                scale(${1 + Math.sin(time * 0.002 + i) * 0.3})
                            `,
                            opacity: 0.6 + Math.sin(time * 0.003 + i) * 0.4,
                            filter: `hue-rotate(${time * 20 + i * 60}deg)`
                        }}
                    />
                ))}
            </div>

            {/* Main Content Container */}
            <div
                className="relative p-6 h-full flex flex-col justify-between z-10"
                style={{
                    transform: 'translateZ(20px)',
                    transformStyle: 'preserve-3d'
                }}
            >
                {/* Header with Enhanced 3D Effects */}
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                        <div
                            className={`p-3 rounded-xl border transition-all duration-500 ${theme === 'dark'
                                    ? 'bg-slate-800/80 border-slate-600/50'
                                    : 'bg-white/80 border-gray-200/50'
                                } backdrop-blur-sm group-hover:scale-110`}
                            style={{
                                transform: `translateZ(10px) rotateY(${time * 50 + index * 30}deg)`,
                                boxShadow: `0 0 20px ${theme === 'dark'
                                        ? 'rgba(59, 130, 246, 0.3)'
                                        : 'rgba(59, 130, 246, 0.2)'
                                    }`
                            }}
                        >
                            <IconComponent
                                className={`w-6 h-6 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
                                    } transition-all duration-500 group-hover:scale-125`}
                            />
                        </div>

                        <div>
                            <span
                                className={`inline-block px-3 py-1 text-xs font-bold rounded-full border backdrop-blur-sm transition-all duration-500 ${statusColors[project.status]}`}
                                style={{
                                    transform: 'translateZ(5px)',
                                    boxShadow: isHovered ? '0 5px 15px rgba(0, 0, 0, 0.2)' : 'none'
                                }}
                            >
                                {project.status.toUpperCase()}
                            </span>
                        </div>
                    </div>

                    {/* Tier Badge with 3D Effect */}
                    <div
                        className="flex items-center space-x-1"
                        style={{
                            transform: 'translateZ(8px) rotateX(10deg)',
                            transformStyle: 'preserve-3d'
                        }}
                    >
                        <Star
                            className="w-4 h-4 text-yellow-400 fill-yellow-400 animate-pulse"
                            style={{
                                filter: 'drop-shadow(0 0 8px rgba(251, 191, 36, 0.6))'
                            }}
                        />
                        <span className={`text-xs font-bold ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                            }`}>
                            Tier {project.tier}
                        </span>
                    </div>
                </div>

                {/* Title & Domain with Depth */}
                <div
                    className="mb-4"
                    style={{
                        transform: 'translateZ(15px)',
                        transformStyle: 'preserve-3d'
                    }}
                >
                    <h3 className={`${textSizes[size].title} font-bold mb-2 transition-all duration-500 ${theme === 'dark' ? 'text-white' : 'text-gray-900'
                        } group-hover:scale-105`}>
                        {project.name}
                    </h3>

                    <div className="flex items-center space-x-2 mb-3">
                        <span className={`text-sm font-mono px-2 py-1 rounded backdrop-blur-sm transition-all duration-300 ${theme === 'dark'
                                ? 'bg-black/40 text-gray-300'
                                : 'bg-gray-100/80 text-gray-700'
                            }`}>
                            {project.domain}
                        </span>
                        <ExternalLink
                            className={`w-4 h-4 transition-all duration-500 group-hover:scale-125 group-hover:rotate-12 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                                }`}
                        />
                    </div>
                </div>

                {/* Description with 3D Typography */}
                <div
                    className="mb-4 flex-grow"
                    style={{
                        transform: 'translateZ(10px)',
                        transformStyle: 'preserve-3d'
                    }}
                >
                    <p className={`${textSizes[size].desc} leading-relaxed transition-all duration-300 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                        }`}>
                        {size === 'featured' ? project.fullDescription : project.description}
                    </p>
                </div>

                {/* Features for Larger Cards */}
                {(size === 'large' || size === 'featured') && (
                    <div
                        className="mb-4"
                        style={{
                            transform: 'translateZ(8px)',
                            transformStyle: 'preserve-3d'
                        }}
                    >
                        <ul className="space-y-2">
                            {project.features.slice(0, size === 'featured' ? 4 : 2).map((feature, idx) => (
                                <li
                                    key={idx}
                                    className={`${textSizes[size].features} flex items-start space-x-2 transition-all duration-300 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                                        }`}
                                    style={{
                                        transform: `translateX(${isHovered ? '5px' : '0'})`,
                                        transitionDelay: `${idx * 50}ms`
                                    }}
                                >
                                    <Sparkles
                                        className="w-3 h-3 text-blue-400 mt-0.5 flex-shrink-0"
                                        style={{
                                            filter: 'drop-shadow(0 0 5px rgba(59, 130, 246, 0.5))'
                                        }}
                                    />
                                    <span>{feature}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Footer with 3D Interactive Elements */}
                <div
                    className="flex items-center justify-between"
                    style={{
                        transform: 'translateZ(12px)',
                        transformStyle: 'preserve-3d'
                    }}
                >
                    <div className={`text-xs font-medium px-2 py-1 rounded-lg ${theme === 'dark'
                            ? 'bg-slate-700/50 text-gray-300'
                            : 'bg-gray-100/80 text-gray-600'
                        }`}>
                        {project.category}
                    </div>

                    <div
                        className={`flex items-center space-x-2 transition-all duration-500 group-hover:scale-110 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                            }`}
                        style={{
                            transform: `translateX(${isHovered ? '10px' : '0'})`
                        }}
                    >
                        <span className="text-sm font-bold">Explore</span>
                        <ArrowRight
                            className="w-4 h-4 transition-transform duration-500 group-hover:translate-x-2 group-hover:scale-125"
                            style={{
                                filter: `drop-shadow(0 0 8px ${theme === 'dark'
                                        ? 'rgba(59, 130, 246, 0.4)'
                                        : 'rgba(59, 130, 246, 0.3)'
                                    })`
                            }}
                        />
                    </div>
                </div>
            </div>

            {/* Interactive Glow Effect */}
            <div
                className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                style={{
                    background: `radial-gradient(circle at ${localMousePos.x}% ${localMousePos.y}%, 
                        rgba(59, 130, 246, 0.15) 0%, 
                        transparent 60%)`,
                    transform: 'translateZ(-5px)'
                }}
            />

            {/* Border Glow */}
            <div
                className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-all duration-700"
                style={{
                    background: 'linear-gradient(45deg, transparent 30%, rgba(59, 130, 246, 0.2) 50%, transparent 70%)',
                    transform: 'translateZ(-2px)',
                    filter: 'blur(1px)'
                }}
            />
        </div>
    );
};

export { ProjectCard3D };