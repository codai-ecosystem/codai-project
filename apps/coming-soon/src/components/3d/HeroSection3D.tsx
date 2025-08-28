'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
    ArrowRight,
    Sparkles,
    Zap,
    Globe,
    Brain,
    Rocket,
    Play,
    Code2,
    Database,
    Shield,
    TrendingUp,
    Users,
    Cpu,
    ChevronDown,
    Star,
    Heart,
    Layers,
    Command,
    Activity,
    Clock,
    Atom,
    Orbit,
    Gamepad2,
    Wand2
} from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { getTotalProjectStats } from '@/data/projects';
import { ParticleSystem } from './ParticleSystem';
import { DynamicCursor } from './DynamicCursor';
import { AnimatedBackground } from './AnimatedBackground';

const heroKeywords = [
    'Artificial Intelligence',
    'Machine Learning',
    'Neural Networks',
    'Deep Learning',
    'Computer Vision',
    'Natural Language Processing',
    'Autonomous Systems',
    'Intelligent Automation',
    'Predictive Analytics',
    'Cognitive Computing',
    'Quantum Computing',
    'Reinforcement Learning',
    'Generative AI',
    'Edge Computing',
    'Digital Transformation',
    'AGI Systems',
    'Consciousness Engine',
    'Romanian Excellence'
];

const floating3DElements = [
    { Icon: Atom, delay: 0, position: { x: 15, y: 20, z: 0 }, scale: 1.4, orbitRadius: 40, speed: 0.02 },
    { Icon: Brain, delay: 0.5, position: { x: 85, y: 25, z: 5 }, scale: 1.6, orbitRadius: 35, speed: 0.015 },
    { Icon: Code2, delay: 1.0, position: { x: 10, y: 60, z: -3 }, scale: 1.2, orbitRadius: 30, speed: 0.025 },
    { Icon: Orbit, delay: 1.5, position: { x: 90, y: 65, z: 8 }, scale: 1.8, orbitRadius: 45, speed: 0.018 },
    { Icon: Database, delay: 2.0, position: { x: 20, y: 80, z: 2 }, scale: 1.3, orbitRadius: 38, speed: 0.022 },
    { Icon: Shield, delay: 2.5, position: { x: 75, y: 15, z: -5 }, scale: 1.1, orbitRadius: 25, speed: 0.028 },
    { Icon: TrendingUp, delay: 3.0, position: { x: 5, y: 40, z: 10 }, scale: 1.7, orbitRadius: 50, speed: 0.012 },
    { Icon: Cpu, delay: 3.5, position: { x: 80, y: 45, z: -2 }, scale: 1.4, orbitRadius: 42, speed: 0.020 },
    { Icon: Gamepad2, delay: 4.0, position: { x: 30, y: 10, z: 7 }, scale: 1.5, orbitRadius: 48, speed: 0.016 },
    { Icon: Wand2, delay: 4.5, position: { x: 60, y: 75, z: -4 }, scale: 1.3, orbitRadius: 35, speed: 0.024 },
    { Icon: Rocket, delay: 5.0, position: { x: 95, y: 85, z: 6 }, scale: 1.9, orbitRadius: 55, speed: 0.010 },
    { Icon: Command, delay: 5.5, position: { x: 35, y: 90, z: -1 }, scale: 1.2, orbitRadius: 32, speed: 0.026 }
];

export const HeroSection3D: React.FC = () => {
    const { theme } = useTheme();
    const heroRef = useRef<HTMLDivElement>(null);
    const [currentKeyword, setCurrentKeyword] = useState(0);
    const [isVisible, setIsVisible] = useState(false);
    const [mousePosition, setMousePosition] = useState({ x: 50, y: 50 });
    const [scroll3D, setScroll3D] = useState({ x: 0, y: 0, z: 0 });
    const [stats, setStats] = useState(getTotalProjectStats());
    const [time, setTime] = useState(0);
    const [isHovering, setIsHovering] = useState(false);

    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (!heroRef.current) return;

        const rect = heroRef.current.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;

        setMousePosition({ x, y });

        // Enhanced 3D parallax calculation
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        const rotateX = ((mouseY - centerY) / centerY) * 5; // Max 5 degrees
        const rotateY = ((mouseX - centerX) / centerX) * 5;
        const translateZ = Math.abs(mouseX - centerX + mouseY - centerY) * 0.01;

        setScroll3D({
            x: rotateY,
            y: -rotateX,
            z: translateZ
        });
    }, []);

    const handleMouseLeave = useCallback(() => {
        setScroll3D({ x: 0, y: 0, z: 0 });
        setIsHovering(false);
    }, []);

    const handleMouseEnter = useCallback(() => {
        setIsHovering(true);
    }, []);

    useEffect(() => {
        setIsVisible(true);

        if (heroRef.current) {
            heroRef.current.addEventListener('mousemove', handleMouseMove);
            heroRef.current.addEventListener('mouseleave', handleMouseLeave);
            heroRef.current.addEventListener('mouseenter', handleMouseEnter);
        }

        // Smoother keyword transitions
        const keywordInterval = setInterval(() => {
            setCurrentKeyword((prev) => (prev + 1) % heroKeywords.length);
        }, 4500);

        // High-precision time for 3D animations
        const timeInterval = setInterval(() => {
            setTime(Date.now() * 0.001);
        }, 16); // 60fps

        return () => {
            if (heroRef.current) {
                heroRef.current.removeEventListener('mousemove', handleMouseMove);
                heroRef.current.removeEventListener('mouseleave', handleMouseLeave);
                heroRef.current.removeEventListener('mouseenter', handleMouseEnter);
            }
            clearInterval(keywordInterval);
            clearInterval(timeInterval);
        };
    }, [handleMouseMove, handleMouseLeave, handleMouseEnter]);

    // Enhanced 3D parallax transforms
    const parallax3D = useMemo(() => ({
        container: `perspective(1000px) rotateX(${scroll3D.y}deg) rotateY(${scroll3D.x}deg) translateZ(${scroll3D.z}px)`,
        layer1: `translateX(${(mousePosition.x - 50) * 0.02}px) translateY(${(mousePosition.y - 50) * 0.02}px) translateZ(10px)`,
        layer2: `translateX(${(mousePosition.x - 50) * 0.05}px) translateY(${(mousePosition.y - 50) * 0.05}px) translateZ(20px)`,
        layer3: `translateX(${(mousePosition.x - 50) * 0.08}px) translateY(${(mousePosition.y - 50) * 0.08}px) translateZ(30px)`,
        layer4: `translateX(${(mousePosition.x - 50) * 0.12}px) translateY(${(mousePosition.y - 50) * 0.12}px) translateZ(40px)`
    }), [mousePosition, scroll3D]);

    // Dynamic holographic gradient
    const holographicGradient = useMemo(() => {
        const baseHue = (time * 20) % 360;
        return {
            background: theme === 'dark'
                ? `conic-gradient(from ${baseHue}deg at ${mousePosition.x}% ${mousePosition.y}%, 
                   hsl(${baseHue}, 100%, 15%) 0deg,
                   hsl(${(baseHue + 60) % 360}, 100%, 20%) 60deg,
                   hsl(${(baseHue + 120) % 360}, 100%, 18%) 120deg,
                   hsl(${(baseHue + 180) % 360}, 100%, 22%) 180deg,
                   hsl(${(baseHue + 240) % 360}, 100%, 16%) 240deg,
                   hsl(${(baseHue + 300) % 360}, 100%, 19%) 300deg,
                   hsl(${baseHue}, 100%, 15%) 360deg),
                   radial-gradient(ellipse at ${mousePosition.x}% ${mousePosition.y}%, 
                   rgba(59, 130, 246, 0.15), transparent 70%)`
                : `conic-gradient(from ${baseHue}deg at ${mousePosition.x}% ${mousePosition.y}%, 
                   hsl(${baseHue}, 60%, 95%) 0deg,
                   hsl(${(baseHue + 60) % 360}, 60%, 97%) 60deg,
                   hsl(${(baseHue + 120) % 360}, 60%, 96%) 120deg,
                   hsl(${(baseHue + 180) % 360}, 60%, 98%) 180deg,
                   hsl(${(baseHue + 240) % 360}, 60%, 95%) 240deg,
                   hsl(${(baseHue + 300) % 360}, 60%, 97%) 300deg,
                   hsl(${baseHue}, 60%, 95%) 360deg),
                   radial-gradient(ellipse at ${mousePosition.x}% ${mousePosition.y}%, 
                   rgba(59, 130, 246, 0.08), transparent 70%)`,
            transition: 'background 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
        };
    }, [theme, mousePosition, time]);

    return (
        <>
            <DynamicCursor mousePosition={mousePosition} theme={theme === 'system' ? 'dark' : theme} />

            <div
                ref={heroRef}
                className="relative min-h-screen overflow-hidden cursor-none"
                style={{
                    ...holographicGradient,
                    transform: parallax3D.container,
                    transformStyle: 'preserve-3d',
                    transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
            >
                {/* 3D Animated Background Layers */}
                <AnimatedBackground theme={theme === 'system' ? 'dark' : theme} mousePosition={mousePosition} time={time} />

                {/* Advanced Particle System */}
                <ParticleSystem
                    theme={theme === 'system' ? 'dark' : theme}
                    mousePosition={mousePosition}
                    time={time}
                    isInteractive={isHovering}
                    style={{ transform: parallax3D.layer1 }}
                />

                {/* 3D Floating Tech Elements with Enhanced Physics */}
                <div className="absolute inset-0" style={{ transform: parallax3D.layer2 }}>
                    {floating3DElements.map(({ Icon, delay, position, scale, orbitRadius, speed }, index) => {
                        const orbitAngle = (time * speed + delay) % (Math.PI * 2);
                        const verticalOffset = Math.sin(time * speed * 0.5 + delay) * 10;
                        const depthOffset = Math.cos(time * speed * 0.3 + delay) * 5;

                        const orbitX = position.x + Math.cos(orbitAngle) * (orbitRadius * 0.1);
                        const orbitY = position.y + Math.sin(orbitAngle) * (orbitRadius * 0.05) + verticalOffset;
                        const orbitZ = position.z + depthOffset;

                        return (
                            <div
                                key={index}
                                className="absolute transition-all duration-1000 ease-out group cursor-pointer"
                                style={{
                                    left: `${orbitX}%`,
                                    top: `${orbitY}%`,
                                    transform: `
                                        translate3d(-50%, -50%, ${orbitZ}px) 
                                        scale(${scale + Math.sin(time * 0.5 + delay) * 0.15})
                                        rotateX(${Math.sin(time * 0.3 + index) * 15}deg)
                                        rotateY(${Math.cos(time * 0.2 + index) * 20}deg)
                                        rotateZ(${time * 10 + index * 30}deg)
                                    `,
                                    filter: `
                                        drop-shadow(0 0 ${30 + Math.sin(time + index) * 10}px ${theme === 'dark' ? 'rgba(59, 130, 246, 0.6)' : 'rgba(59, 130, 246, 0.4)'})
                                        hue-rotate(${time * 50 + index * 60}deg)
                                    `,
                                    opacity: 0.7 + Math.sin(time * 0.4 + delay) * 0.3,
                                    transformStyle: 'preserve-3d'
                                }}
                            >
                                <Icon
                                    className={`w-8 h-8 md:w-12 md:h-12 transition-all duration-700 group-hover:scale-150 ${theme === 'dark'
                                            ? 'text-blue-400/90'
                                            : 'text-blue-500/70'
                                        }`}
                                />

                                {/* 3D Glow Halo */}
                                <div
                                    className="absolute inset-0 rounded-full opacity-50 group-hover:opacity-100 transition-all duration-500 blur-md"
                                    style={{
                                        background: `conic-gradient(from ${time * 100 + index * 45}deg, 
                                            hsl(${200 + index * 30}, 100%, 60%), 
                                            hsl(${260 + index * 30}, 100%, 70%), 
                                            hsl(${320 + index * 30}, 100%, 65%), 
                                            hsl(${200 + index * 30}, 100%, 60%))`,
                                        transform: `scale(2) rotateZ(${time * 20 + index * 15}deg)`
                                    }}
                                />
                            </div>
                        );
                    })}
                </div>

                {/* Revolutionary Central Logo with Quantum Effects */}
                <div
                    className="absolute inset-0 flex items-center justify-center"
                    style={{ transform: parallax3D.layer3 }}
                >
                    <div className={`transition-all duration-1200 ease-out transform ${isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-12 scale-95'
                        }`}>
                        {/* 3D Quantum Logo Core */}
                        <div className="mb-12 relative" style={{ transformStyle: 'preserve-3d' }}>
                            <div
                                className="relative w-32 h-32 mx-auto"
                                style={{
                                    transform: `
                                        rotateX(${Math.sin(time * 0.2) * 15}deg)
                                        rotateY(${time * 20}deg)
                                        rotateZ(${Math.cos(time * 0.15) * 10}deg)
                                        translateZ(50px)
                                    `,
                                    transformStyle: 'preserve-3d'
                                }}
                            >
                                {/* Multi-layer Quantum Core */}
                                {[...Array(6)].map((_, layer) => (
                                    <div
                                        key={layer}
                                        className="absolute inset-0 rounded-full"
                                        style={{
                                            background: `conic-gradient(from ${time * 100 + layer * 60}deg, 
                                                hsl(${200 + layer * 20}, 100%, ${50 + layer * 5}%), 
                                                hsl(${260 + layer * 20}, 100%, ${60 + layer * 5}%), 
                                                hsl(${320 + layer * 20}, 100%, ${55 + layer * 5}%), 
                                                hsl(${200 + layer * 20}, 100%, ${50 + layer * 5}%))`,
                                            transform: `
                                                translateZ(${layer * -10}px) 
                                                scale(${1 - layer * 0.1}) 
                                                rotateZ(${time * (30 + layer * 10)}deg)
                                            `,
                                            opacity: 0.8 - layer * 0.1,
                                            filter: `blur(${layer * 2}px)`,
                                            transformStyle: 'preserve-3d'
                                        }}
                                    />
                                ))}

                                {/* Central Command Icon */}
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <Command
                                        className="w-16 h-16 text-white relative z-10"
                                        style={{
                                            filter: 'drop-shadow(0 0 20px rgba(255, 255, 255, 0.8))',
                                            transform: `rotateZ(${-time * 20}deg) translateZ(60px)`
                                        }}
                                    />
                                </div>

                                {/* Quantum Orbital Rings */}
                                {[...Array(4)].map((_, ring) => (
                                    <div
                                        key={ring}
                                        className="absolute inset-0 rounded-full border-2"
                                        style={{
                                            borderImage: `conic-gradient(from ${time * 50 + ring * 90}deg, 
                                                transparent, 
                                                hsl(${220 + ring * 40}, 100%, 60%), 
                                                transparent) 1`,
                                            transform: `
                                                rotateX(${ring * 45}deg) 
                                                rotateY(${time * (20 + ring * 5)}deg) 
                                                scale(${1.2 + ring * 0.3}) 
                                                translateZ(${ring * 15}px)
                                            `,
                                            transformStyle: 'preserve-3d'
                                        }}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Enhanced 3D Typography */}
                        <div style={{ transform: parallax3D.layer4 }}>
                            {/* Main CODAI Title with 3D Depth */}
                            <h1 className="mb-10 font-bold leading-tight">
                                <div className="text-6xl md:text-8xl lg:text-9xl xl:text-10xl relative">
                                    <span
                                        className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent blur-sm opacity-50"
                                        style={{
                                            transform: 'translateZ(-20px) scale(1.1)',
                                            transformStyle: 'preserve-3d'
                                        }}
                                    >
                                        CODAI
                                    </span>
                                    <span
                                        className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent"
                                        style={{
                                            transform: 'translateZ(40px)',
                                            filter: 'drop-shadow(0 0 30px rgba(59, 130, 246, 0.5))',
                                            transformStyle: 'preserve-3d'
                                        }}
                                    >
                                        CODAI
                                    </span>
                                </div>

                                {/* 3D Subtitle */}
                                <div
                                    className={`text-2xl md:text-4xl lg:text-5xl font-light mt-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                                        }`}
                                    style={{
                                        transform: 'translateZ(30px)',
                                        transformStyle: 'preserve-3d'
                                    }}
                                >
                                    <span className="inline-block">The</span>{' '}
                                    <span className="inline-block">Ultimate</span>{' '}
                                    <span className="inline-block bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 bg-clip-text text-transparent font-semibold">
                                        AI Ecosystem
                                    </span>
                                </div>
                            </h1>

                            {/* Revolutionary Keyword Display with Holographic Effect */}
                            <div className="mb-16 h-24 flex items-center justify-center">
                                <div className="relative">
                                    <div
                                        className={`text-xl md:text-2xl lg:text-3xl font-semibold ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
                                            }`}
                                        style={{
                                            transform: 'translateZ(25px)',
                                            transformStyle: 'preserve-3d'
                                        }}
                                    >
                                        Powering{' '}
                                        <span className="relative inline-block">
                                            {/* Holographic keyword background */}
                                            <span
                                                className="absolute inset-0 blur-lg rounded-xl opacity-80"
                                                style={{
                                                    background: `conic-gradient(from ${time * 30}deg, 
                                                        hsl(260, 100%, 70%), 
                                                        hsl(300, 100%, 75%), 
                                                        hsl(200, 100%, 70%), 
                                                        hsl(260, 100%, 70%))`,
                                                    transform: 'translateZ(-10px) scale(1.2)',
                                                    transformStyle: 'preserve-3d'
                                                }}
                                            />
                                            <span
                                                className="relative bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 bg-clip-text text-transparent font-bold"
                                                style={{
                                                    transform: 'translateZ(10px)',
                                                    filter: 'drop-shadow(0 0 15px rgba(147, 51, 234, 0.7))',
                                                    transformStyle: 'preserve-3d'
                                                }}
                                            >
                                                {heroKeywords[currentKeyword]}
                                            </span>
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* 3D Interactive Stats with Depth */}
                            <div className="mb-20 grid grid-cols-2 gap-8 max-w-5xl mx-auto md:grid-cols-4">
                                {[
                                    { number: `${stats.total}+`, label: 'AI Apps', icon: Rocket, color: 'blue', gradient: 'from-blue-500 to-cyan-500' },
                                    { number: `${stats.production}`, label: 'Production', icon: Activity, color: 'green', gradient: 'from-green-500 to-emerald-500' },
                                    { number: `${stats.categories}`, label: 'Categories', icon: Globe, color: 'purple', gradient: 'from-purple-500 to-violet-500' },
                                    { number: '∞', label: 'Possibilities', icon: Zap, color: 'pink', gradient: 'from-pink-500 to-rose-500' }
                                ].map(({ number, label, icon: Icon, color, gradient }, index) => (
                                    <div
                                        key={label}
                                        className={`group relative p-8 rounded-3xl transition-all duration-700 hover:scale-110 hover:-translate-y-4 cursor-pointer overflow-hidden ${theme === 'dark'
                                                ? 'bg-slate-800/70 border-slate-600/50'
                                                : 'bg-white/80 border-gray-200/50'
                                            } backdrop-blur-lg border shadow-xl hover:shadow-2xl`}
                                        style={{
                                            transform: `translateZ(${20 + index * 10}px) rotateY(${Math.sin(time * 0.1 + index) * 5}deg)`,
                                            transformStyle: 'preserve-3d'
                                        }}
                                    >
                                        {/* 3D Gradient Background */}
                                        <div
                                            className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-20 transition-opacity duration-700`}
                                            style={{
                                                transform: 'translateZ(-5px)',
                                                transformStyle: 'preserve-3d'
                                            }}
                                        />

                                        <Icon
                                            className={`w-12 h-12 mx-auto mb-6 text-${color}-500 group-hover:scale-125 group-hover:rotate-12 transition-all duration-500`}
                                            style={{
                                                filter: `drop-shadow(0 0 20px rgba(59, 130, 246, 0.5))`,
                                                transform: `translateZ(15px) rotateY(${time * 20 + index * 45}deg)`
                                            }}
                                        />

                                        <div
                                            className={`text-4xl md:text-5xl font-bold mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'
                                                }`}
                                            style={{
                                                transform: 'translateZ(10px)',
                                                transformStyle: 'preserve-3d'
                                            }}
                                        >
                                            {number}
                                        </div>

                                        <div
                                            className={`text-sm md:text-base font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                                                }`}
                                            style={{
                                                transform: 'translateZ(5px)',
                                                transformStyle: 'preserve-3d'
                                            }}
                                        >
                                            {label}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* 3D Call-to-Action Buttons */}
                            <div className="space-y-8">
                                <div className="flex flex-col sm:flex-row gap-6 justify-center items-center max-w-2xl mx-auto">
                                    <button
                                        className="group relative px-12 py-6 rounded-full font-bold text-lg md:text-xl transition-all duration-700 transform hover:scale-110 active:scale-95 overflow-hidden"
                                        style={{
                                            background: 'linear-gradient(135deg, #3b82f6, #8b5cf6, #ec4899)',
                                            boxShadow: '0 20px 60px rgba(59, 130, 246, 0.4)',
                                            transform: `translateZ(30px) rotateX(${Math.sin(time * 0.2) * 2}deg)`,
                                            transformStyle: 'preserve-3d'
                                        }}
                                    >
                                        <span className="relative flex items-center justify-center space-x-3 text-white">
                                            <Sparkles className="w-6 h-6 animate-spin" />
                                            <span className="font-extrabold tracking-wide">Explore Ecosystem</span>
                                            <ArrowRight className="w-6 h-6" />
                                        </span>
                                    </button>

                                    <button
                                        className={`group relative px-10 py-6 rounded-full font-semibold text-lg transition-all duration-700 transform hover:scale-105 ${theme === 'dark'
                                                ? 'bg-slate-800/80 text-white border border-slate-600/50'
                                                : 'bg-white/80 text-gray-900 border border-gray-300/50'
                                            } backdrop-blur-xl shadow-xl hover:shadow-2xl overflow-hidden`}
                                        style={{
                                            transform: `translateZ(20px) rotateX(${Math.cos(time * 0.15) * 2}deg)`,
                                            transformStyle: 'preserve-3d'
                                        }}
                                    >
                                        <span className="relative flex items-center justify-center space-x-3">
                                            <Play className="w-5 h-5" />
                                            <span className="tracking-wide">Watch Demo</span>
                                        </span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Enhanced 3D Scroll Indicator */}
                <div
                    className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce cursor-pointer"
                    style={{
                        transform: `translateX(-50%) translateZ(15px) rotateX(${Math.sin(time * 0.3) * 5}deg)`,
                        transformStyle: 'preserve-3d',
                        animationDuration: '3s'
                    }}
                >
                    <div className={`mx-auto w-8 h-14 border-2 ${theme === 'dark' ? 'border-gray-600' : 'border-gray-400'
                        } rounded-full flex justify-center relative group`}>
                        <div
                            className={`w-1.5 h-3 ${theme === 'dark' ? 'bg-gray-400' : 'bg-gray-600'
                                } rounded-full mt-2 animate-pulse group-hover:bg-blue-500 transition-colors duration-500`}
                            style={{
                                boxShadow: '0 0 10px rgba(59, 130, 246, 0.5)',
                                transform: 'translateZ(5px)'
                            }}
                        />
                    </div>
                </div>
            </div>
        </>
    );
};