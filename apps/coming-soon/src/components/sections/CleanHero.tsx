'use client';

import React, { useState, useEffect } from 'react';
import {
    ArrowRight,
    Brain,
    Rocket,
    Play,
    Activity,
    Globe,
    Zap,
    ChevronDown
} from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { getTotalProjectStats } from '@/data/projects';

/**
 * Modern Hero Section Component
 * 
 * Features:
 * - Mobile-first responsive design
 * - Performance-optimized animations
 * - WCAG 2.1 AA accessibility compliance
 * - Touch-friendly interactions (44px minimum targets)
 * - Clear value proposition and hierarchy
 * - Modern design system integration
 */
export const CleanHero: React.FC = () => {
    const { theme } = useTheme();
    const [isVisible, setIsVisible] = useState(false);
    const [hasInteracted, setHasInteracted] = useState(false);
    
    const stats = getTotalProjectStats();

    // Performance-optimized visibility effect
    useEffect(() => {
        const timer = setTimeout(() => setIsVisible(true), 150);
        return () => clearTimeout(timer);
    }, []);

    // Accessibility-friendly smooth scroll
    const scrollToProjects = () => {
        setHasInteracted(true);
        const projectsSection = document.getElementById('projects');
        if (projectsSection) {
            projectsSection.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
        // Announce to screen readers
        const announcement = document.createElement('div');
        announcement.setAttribute('aria-live', 'polite');
        announcement.setAttribute('aria-atomic', 'true');
        announcement.textContent = 'Scrolling to projects section';
        document.body.appendChild(announcement);
        setTimeout(() => document.body.removeChild(announcement), 1000);
    };

    // Handle keyboard navigation
    const handleKeyPress = (event: React.KeyboardEvent, action: () => void) => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            action();
        }
    };

    return (
        <section 
            className="relative min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 overflow-hidden"
            aria-label="Hero section - CODAI AI Ecosystem"
            role="banner"
        >
            {/* Modern Gradient Background with Performance Optimization */}
            <div 
                className={`absolute inset-0 ${
                    theme === 'dark'
                        ? 'bg-gradient-to-br from-background-primary via-gray-950 to-background-secondary'
                        : 'bg-gradient-to-br from-gray-50 via-white to-primary-50'
                }`} 
                aria-hidden="true"
            />

            {/* Subtle Pattern Overlay */}
            <div 
                className={`absolute inset-0 opacity-5 ${
                    theme === 'dark' ? 'bg-white' : 'bg-gray-900'
                }`}
                style={{
                    backgroundImage: `radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)`,
                    backgroundSize: '32px 32px'
                }}
                aria-hidden="true"
            />

            {/* Main Hero Content */}
            <div className={`relative z-10 text-center max-w-7xl mx-auto transition-all duration-500 ease-out ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}>
                
                {/* Logo/Icon with Modern Styling */}
                <div className="mb-8 sm:mb-12" aria-hidden="true">
                    <div className={`
                        w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 mx-auto rounded-2xl
                        bg-gradient-to-br from-primary-500 via-secondary-500 to-accent-500
                        flex items-center justify-center shadow-2xl
                        transition-transform duration-300 hover:scale-105
                        focus:scale-105 focus:outline-none focus:ring-4 focus:ring-primary-400/50
                    `}>
                        <Brain className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-white" />
                    </div>
                </div>

                {/* Modern Typography Hierarchy */}
                <header className="mb-8 sm:mb-12">
                    {/* Main Brand Title */}
                    <h1 className="font-brand font-bold leading-none mb-4 sm:mb-6">
                        <span className="block text-5xl sm:text-7xl md:text-8xl lg:text-9xl xl:text-[12rem]">
                            <span className="bg-gradient-to-r from-primary-400 via-secondary-500 to-accent-400 bg-clip-text text-transparent">
                                CODAI
                            </span>
                        </span>
                    </h1>

                    {/* Subtitle with Clear Hierarchy */}
                    <div className={`text-lg sm:text-xl md:text-2xl lg:text-3xl font-medium ${
                        theme === 'dark' ? 'text-text-secondary' : 'text-gray-700'
                    }`}>
                        <span className="block sm:inline">The Ultimate </span>
                        <span className="bg-gradient-to-r from-accent-400 via-primary-500 to-secondary-500 bg-clip-text text-transparent font-bold">
                            AI Ecosystem
                        </span>
                    </div>
                </header>

                {/* Clear Value Proposition */}
                <div className="mb-12 sm:mb-16 max-w-4xl mx-auto">
                    <p className={`text-lg sm:text-xl md:text-2xl font-medium leading-relaxed ${
                        theme === 'dark' ? 'text-text-tertiary' : 'text-gray-600'
                    }`}>
                        Powering the future of{' '}
                        <span className="bg-gradient-to-r from-secondary-500 via-accent-500 to-primary-500 bg-clip-text text-transparent font-bold">
                            Artificial Intelligence
                        </span>{' '}
                        with 42+ integrated AI applications, production-ready solutions, and unlimited possibilities.
                    </p>
                </div>

                {/* Enhanced Stats Grid with Mobile-First Design */}
                <div className="mb-12 sm:mb-16 grid grid-cols-2 gap-4 sm:gap-6 lg:gap-8 max-w-5xl mx-auto lg:grid-cols-4">
                    {[
                        { number: `${stats.total}+`, label: 'AI Applications', icon: Rocket, description: 'Integrated AI solutions' },
                        { number: `${stats.production}`, label: 'Production Ready', icon: Activity, description: 'Live and operational' },
                        { number: `${stats.categories}`, label: 'Categories', icon: Globe, description: 'Diverse AI domains' },
                        { number: '∞', label: 'Possibilities', icon: Zap, description: 'Unlimited potential' }
                    ].map(({ number, label, icon: Icon, description }) => (
                        <div
                            key={label}
                            className={`
                                p-4 sm:p-6 lg:p-8 rounded-2xl sm:rounded-3xl
                                ${theme === 'dark'
                                    ? 'bg-background-card/70 border-border-primary'
                                    : 'bg-white/80 border-gray-200/50'
                                }
                                backdrop-blur-sm border shadow-lg
                                transition-all duration-300 hover:scale-105 hover:shadow-xl
                                focus-within:scale-105 focus-within:shadow-xl focus-within:ring-4 focus-within:ring-primary-400/30
                            `}
                            role="group"
                            aria-labelledby={`stat-${label.replace(/\s+/g, '-').toLowerCase()}`}
                        >
                            <div className="mb-2 sm:mb-3 flex justify-center">
                                <Icon 
                                    className={`w-6 h-6 sm:w-8 sm:h-8 ${
                                        theme === 'dark' ? 'text-primary-400' : 'text-primary-600'
                                    }`}
                                    aria-hidden="true"
                                />
                            </div>
                            
                            <div 
                                id={`stat-${label.replace(/\s+/g, '-').toLowerCase()}`}
                                className={`text-xl sm:text-2xl lg:text-3xl font-bold mb-1 sm:mb-2 font-display ${
                                    theme === 'dark' ? 'text-text-primary' : 'text-gray-900'
                                }`}
                            >
                                {number}
                            </div>
                            
                            <div className={`text-sm sm:text-base font-semibold mb-1 ${
                                theme === 'dark' ? 'text-text-secondary' : 'text-gray-700'
                            } uppercase tracking-wide`}>
                                {label}
                            </div>

                            <div className={`text-xs sm:text-sm ${
                                theme === 'dark' ? 'text-text-tertiary' : 'text-gray-500'
                            }`}>
                                {description}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Modern Call-to-Action Section */}
                <div className="mb-12 sm:mb-16 flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center">
                    {/* Primary CTA Button */}
                    <button
                        onClick={scrollToProjects}
                        onKeyDown={(e) => handleKeyPress(e, scrollToProjects)}
                        className={`
                            min-h-[44px] px-6 sm:px-8 py-3 sm:py-4 
                            text-base sm:text-lg font-bold text-white
                            bg-gradient-to-r from-primary-600 via-secondary-600 to-accent-600
                            rounded-full shadow-lg
                            transition-all duration-300 
                            hover:scale-105 hover:shadow-xl hover:shadow-primary-500/25
                            focus:scale-105 focus:shadow-xl focus:outline-none focus:ring-4 focus:ring-primary-400/50
                            active:scale-95
                            group
                        `}
                        aria-describedby="primary-cta-description"
                    >
                        <span className="flex items-center gap-2 sm:gap-3">
                            <Brain className="w-4 h-4 sm:w-5 sm:h-5 transition-transform group-hover:rotate-12" aria-hidden="true" />
                            <span>Explore AI Ecosystem</span>
                            <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                        </span>
                    </button>
                    <div id="primary-cta-description" className="sr-only">
                        Navigate to the projects section to explore all AI applications in the CODAI ecosystem
                    </div>

                    {/* Secondary CTA Button */}
                    <button 
                        className={`
                            min-h-[44px] px-6 sm:px-8 py-3 sm:py-4 
                            text-base sm:text-lg font-semibold border-2 rounded-full
                            transition-all duration-300 
                            hover:scale-105 focus:scale-105 focus:outline-none focus:ring-4
                            active:scale-95
                            group
                            ${theme === 'dark'
                                ? 'border-border-secondary text-text-primary hover:border-primary-400 hover:text-primary-400 focus:ring-primary-400/50'
                                : 'border-gray-300 text-gray-700 hover:border-primary-500 hover:text-primary-700 focus:ring-primary-400/50'
                            }
                        `}
                        aria-describedby="secondary-cta-description"
                    >
                        <span className="flex items-center gap-2 sm:gap-3">
                            <Play className="w-4 h-4 sm:w-5 sm:h-5 transition-transform group-hover:scale-110" aria-hidden="true" />
                            <span>Watch Demo</span>
                        </span>
                    </button>
                    <div id="secondary-cta-description" className="sr-only">
                        Watch a demonstration video of the CODAI ecosystem
                    </div>
                </div>

                {/* Accessible Scroll Indicator */}
                <div 
                    className={`cursor-pointer transition-all duration-300 hover:scale-110 focus:scale-110 focus:outline-none focus:ring-4 focus:ring-primary-400/50 rounded-lg p-2 ${
                        hasInteracted ? 'opacity-50' : ''
                    }`}
                    onClick={scrollToProjects}
                    onKeyDown={(e) => handleKeyPress(e, scrollToProjects)}
                    role="button"
                    tabIndex={0}
                    aria-label="Scroll down to explore projects"
                >
                    <div className={`flex flex-col items-center animate-fade-in-up ${
                        theme === 'dark' ? 'text-text-tertiary hover:text-text-secondary' : 'text-gray-500 hover:text-gray-700'
                    }`}>
                        <ChevronDown 
                            className={`w-6 h-6 mb-2 transition-transform ${
                                hasInteracted ? '' : 'animate-bounce'
                            }`} 
                            aria-hidden="true" 
                        />
                        <div className="text-xs sm:text-sm font-medium tracking-widest uppercase opacity-80">
                            Scroll to Explore
                        </div>
                    </div>
                </div>
            </div>

            {/* Skip Link for Accessibility */}
            <a
                href="#projects"
                className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 px-4 py-2 bg-primary-600 text-white rounded-md font-medium"
            >
                Skip to main content
            </a>
        </section>
    );
};