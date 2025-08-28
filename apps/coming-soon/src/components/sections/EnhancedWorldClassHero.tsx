'use client';

import React, { useState, useEffect, useCallback, useMemo, memo } from 'react';
import {
    ArrowRight,
    Brain,
    Rocket,
    Play,
    Heart,
    Command,
    Activity,
    Globe,
    Zap,
    ChevronDown
} from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { getTotalProjectStats } from '@/data/projects';

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
    'Digital Transformation'
];

// Clean hero component without animated background objects
const EnhancedWorldClassHeroComponent: React.FC = () => {
    const { theme } = useTheme();
    const [isVisible, setIsVisible] = useState(false);
    const [currentKeywordIndex, setCurrentKeywordIndex] = useState(0);

    const stats = useMemo(() => getTotalProjectStats(), []);

    // Simple keyword rotation (only remaining animation)
    useEffect(() => {
        const keywordInterval = setInterval(() => {
            setCurrentKeywordIndex(prev => (prev + 1) % heroKeywords.length);
        }, 4000);

        return () => clearInterval(keywordInterval);
    }, []);

    // Simple visibility effect
    useEffect(() => {
        const timer = setTimeout(() => setIsVisible(true), 100);
        return () => clearTimeout(timer);
    }, []);

    const scrollToProjects = useCallback(() => {
        document.getElementById('projects')?.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }, []);

    return (
        <div className="relative min-h-screen overflow-hidden">
            {/* Static Background Layer */}
            <div className="absolute inset-0">
                <div className={`absolute inset-0 ${theme === 'dark'
                        ? 'bg-gradient-to-br from-slate-900 via-blue-900/20 to-purple-900/20'
                        : 'bg-gradient-to-br from-blue-50/50 via-white to-purple-50/50'
                    }`} />
            </div>

            {/* Hero Content */}
            <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6 text-center">
                <div className={`transition-all duration-1200 ease-out transform ${isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-12 scale-95'
                    }`}>
                    {/* Static Central Logo */}
                    <div className="mb-12 relative">
                        <div className={`relative w-24 h-24 mx-auto rounded-full ${theme === 'dark'
                                ? 'bg-gradient-to-r from-blue-500 via-purple-600 to-pink-500'
                                : 'bg-gradient-to-r from-blue-400 via-purple-500 to-pink-400'
                            } flex items-center justify-center shadow-2xl`}
                            style={{
                                boxShadow: theme === 'dark'
                                    ? '0 0 60px rgba(59, 130, 246, 0.5), 0 0 120px rgba(147, 51, 234, 0.3)'
                                    : '0 0 60px rgba(59, 130, 246, 0.4), 0 0 120px rgba(147, 51, 234, 0.2)'
                            }}>
                            <Command className="w-12 h-12 text-white" />
                        </div>
                    </div>

                    {/* Main Heading */}
                    <h1 className="mb-10 font-bold leading-tight">
                        <div className="text-6xl md:text-8xl lg:text-9xl">
                            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                                CODAI
                            </span>
                        </div>
                        <div className={`text-2xl md:text-4lg font-light mt-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                            }`}>
                            <span>The Ultimate</span>{' '}
                            <span className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 bg-clip-text text-transparent font-semibold">
                                AI Ecosystem
                            </span>
                        </div>
                    </h1>

                    {/* Keyword Display */}
                    <div className="mb-16 h-16 flex items-center justify-center">
                        <div className={`text-xl md:text-2xl font-semibold ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
                            }`}>
                            Powering{' '}
                            <span className="bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 bg-clip-text text-transparent font-bold">
                                {heroKeywords[currentKeywordIndex]}
                            </span>
                        </div>
                    </div>

                    <p className={`text-xl ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} mb-12`}>
                        Clean hero section without animated background objects - all flicker removed!
                    </p>

                    {/* Stats Grid */}
                    <div className="mb-12 grid grid-cols-2 gap-6 max-w-4xl mx-auto md:grid-cols-4">
                        {[
                            { number: `${stats.total}+`, label: 'AI Apps', icon: Rocket },
                            { number: `${stats.production}`, label: 'Production', icon: Activity },
                            { number: `${stats.categories}`, label: 'Categories', icon: Globe },
                            { number: '∞', label: 'Possibilities', icon: Zap }
                        ].map(({ number, label, icon: Icon }) => (
                            <div
                                key={label}
                                className={`p-6 rounded-2xl ${theme === 'dark'
                                        ? 'bg-slate-800/70 border-slate-600/50'
                                        : 'bg-white/80 border-gray-200/50'
                                    } backdrop-blur-lg border shadow-lg transition-all duration-500 hover:scale-105`}>

                                <div className="mb-3 flex justify-center">
                                    <Icon className={`w-8 h-8 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
                                        }`} />
                                </div>

                                <div className={`text-2xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'
                                    }`}>
                                    {number}
                                </div>

                                <div className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                                    } uppercase tracking-wide`}>
                                    {label}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Call-to-Action Buttons */}
                    <div className="mb-16 flex flex-col sm:flex-row gap-4 justify-center items-center">
                        <button
                            onClick={scrollToProjects}
                            className="px-8 py-4 text-lg font-bold text-white bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-full transition-all duration-300 hover:scale-105 hover:shadow-xl"
                        >
                            <span className="flex items-center gap-3">
                                <Brain className="w-5 h-5" />
                                Explore AI Ecosystem
                                <ArrowRight className="w-5 h-5" />
                            </span>
                        </button>

                        <button className={`px-6 py-4 text-lg font-semibold border-2 rounded-full transition-all duration-300 hover:scale-105 ${theme === 'dark'
                                ? 'border-slate-600 text-white hover:border-blue-400'
                                : 'border-gray-300 text-gray-700 hover:border-blue-500'
                            }`}>
                            <span className="flex items-center gap-3">
                                <Play className="w-5 h-5" />
                                Watch Demo
                            </span>
                        </button>
                    </div>

                    {/* Scroll Indicator */}
                    <div className="cursor-pointer animate-bounce" onClick={scrollToProjects}>
                        <div className={`flex flex-col items-center ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                            }`}>
                            <ChevronDown className="w-6 h-6 mb-2" />
                            <div className="text-xs font-medium tracking-widest uppercase opacity-80">
                                Scroll to Explore
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export const EnhancedWorldClassHero = memo(EnhancedWorldClassHeroComponent);