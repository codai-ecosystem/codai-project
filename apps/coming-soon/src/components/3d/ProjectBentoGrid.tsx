'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
    Filter,
    ArrowRight,
    Eye,
    TrendingUp,
    Zap,
    Sparkles,
    Play,
    Command
} from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { codaiProjects, getProjectsByTier, type Project } from '@/data/projects';
import { ProjectCard3D } from './ProjectCard3D';

interface FilterTabsProps {
    activeFilter: 'all' | number;
    onFilterChange: (filter: 'all' | number) => void;
    theme: 'light' | 'dark';
    time: number;
}

const FilterTabs: React.FC<FilterTabsProps> = ({ activeFilter, onFilterChange, theme, time }) => {
    const tierCounts = {
        1: getProjectsByTier(1).length,
        2: getProjectsByTier(2).length,
        3: getProjectsByTier(3).length,
        4: getProjectsByTier(4).length,
        5: getProjectsByTier(5).length,
    };

    const filterOptions = [
        { key: 'all' as const, label: 'All Projects', count: codaiProjects.length },
        ...([1, 2, 3, 4, 5] as const).map(tier => ({
            key: tier,
            label: `Tier ${tier}`,
            count: tierCounts[tier]
        }))
    ];

    return (
        <div className="flex flex-wrap justify-center gap-4 mb-16">
            {filterOptions.map(({ key, label, count }, index) => {
                const isActive = activeFilter === key;
                const hue = index * 60 + time * 5;

                return (
                    <button
                        key={key}
                        onClick={() => onFilterChange(key)}
                        className={`group relative px-6 py-4 rounded-2xl font-bold transition-all duration-500 transform hover:scale-110 overflow-hidden ${isActive
                                ? 'scale-110 shadow-2xl'
                                : 'hover:shadow-xl'
                            }`}
                        style={{
                            background: isActive
                                ? `conic-gradient(from ${hue}deg, 
                                    hsl(${hue}, 70%, ${theme === 'dark' ? '50' : '60'}%), 
                                    hsl(${(hue + 120) % 360}, 70%, ${theme === 'dark' ? '60' : '70'}%), 
                                    hsl(${(hue + 240) % 360}, 70%, ${theme === 'dark' ? '55' : '65'}%), 
                                    hsl(${hue}, 70%, ${theme === 'dark' ? '50' : '60'}%))`
                                : theme === 'dark'
                                    ? 'rgba(51, 65, 85, 0.8)'
                                    : 'rgba(255, 255, 255, 0.8)',
                            border: `2px solid ${isActive
                                    ? 'rgba(255, 255, 255, 0.3)'
                                    : theme === 'dark'
                                        ? 'rgba(71, 85, 105, 0.5)'
                                        : 'rgba(203, 213, 225, 0.5)'
                                }`,
                            backdropFilter: 'blur(20px)',
                            color: isActive
                                ? 'white'
                                : theme === 'dark'
                                    ? 'rgba(203, 213, 225, 0.9)'
                                    : 'rgba(51, 65, 85, 0.9)',
                            boxShadow: isActive
                                ? `0 20px 40px rgba(59, 130, 246, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.1)`
                                : `0 10px 25px rgba(0, 0, 0, ${theme === 'dark' ? '0.3' : '0.1'})`
                        }}
                    >
                        {/* Animated Background Overlay */}
                        <div
                            className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
                            style={{
                                background: `conic-gradient(from ${time * 20}deg, 
                                    transparent, 
                                    rgba(59, 130, 246, 0.2), 
                                    transparent)`,
                                transform: `rotate(${time * 0.5}deg)`
                            }}
                        />

                        {/* Button Content */}
                        <span className="relative z-10 flex items-center space-x-2">
                            <span className="font-extrabold tracking-wide">
                                {label}
                            </span>
                            <span
                                className={`text-sm px-2 py-1 rounded-full transition-all duration-300 ${isActive
                                        ? 'bg-white/20 text-white'
                                        : theme === 'dark'
                                            ? 'bg-slate-600/50 text-slate-300'
                                            : 'bg-gray-200/80 text-gray-600'
                                    }`}
                            >
                                {count}
                            </span>
                        </span>

                        {/* Hover Shine Effect */}
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                            <div
                                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"
                            />
                        </div>
                    </button>
                );
            })}
        </div>
    );
};

interface ProjectBentoGridProps {
    projects: Project[];
    mousePosition: { x: number; y: number };
    time: number;
}

const ProjectBentoGrid: React.FC<ProjectBentoGridProps> = ({ projects, mousePosition, time }) => {
    // Enhanced Bento grid sizing algorithm
    const getCardSize = (index: number, project: Project): 'small' | 'medium' | 'large' | 'featured' => {
        // Featured projects (first critical project)
        if (index === 0 && (project.priority === 'critical' || project.name === 'CODAI Platform')) {
            return 'featured';
        }

        // Large cards for important milestones
        if ((index === 1 || index === 7 || index === 15 || index === 23) && project.priority === 'critical') {
            return 'large';
        }

        // Medium cards for strategic positioning
        if (
            project.priority === 'high' ||
            index % 8 === 3 ||
            index % 12 === 7 ||
            (index % 6 === 2 && project.tier <= 2)
        ) {
            return 'medium';
        }

        // Default small cards
        return 'small';
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-6 auto-rows-max">
            {projects.map((project, index) => (
                <ProjectCard3D
                    key={project.id}
                    project={project}
                    size={getCardSize(index, project)}
                    index={index}
                    mousePosition={mousePosition}
                    time={time}
                    className="animate-fade-in-up"
                    style={{
                        animationDelay: `${index * 50}ms`,
                        animationFillMode: 'both'
                    }}
                />
            ))}
        </div>
    );
};

interface ProjectShowcase3DProps {
    isVisible?: boolean;
}

export const ProjectShowcase3D: React.FC<ProjectShowcase3DProps> = ({ isVisible = true }) => {
    const { theme } = useTheme();
    const sectionRef = useRef<HTMLDivElement>(null);
    const [activeFilter, setActiveFilter] = useState<'all' | number>('all');
    const [mousePosition, setMousePosition] = useState({ x: 50, y: 50 });
    const [time, setTime] = useState(0);
    const [sectionInView, setSectionInView] = useState(false);

    // Mouse tracking for the entire section
    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!sectionRef.current) return;

            const rect = sectionRef.current.getBoundingClientRect();
            setMousePosition({
                x: ((e.clientX - rect.left) / rect.width) * 100,
                y: ((e.clientY - rect.top) / rect.height) * 100
            });
        };

        if (sectionRef.current) {
            sectionRef.current.addEventListener('mousemove', handleMouseMove);
        }

        return () => {
            if (sectionRef.current) {
                sectionRef.current.removeEventListener('mousemove', handleMouseMove);
            }
        };
    }, []);

    // Time animation
    useEffect(() => {
        const interval = setInterval(() => {
            setTime(Date.now() * 0.001);
        }, 16);

        return () => clearInterval(interval);
    }, []);

    // Intersection Observer for section visibility
    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                setSectionInView(entry.isIntersecting);
            },
            { threshold: 0.1 }
        );

        if (sectionRef.current) {
            observer.observe(sectionRef.current);
        }

        return () => observer.disconnect();
    }, []);

    const filteredProjects = useMemo(() => {
        if (activeFilter === 'all') {
            return codaiProjects;
        }
        return getProjectsByTier(activeFilter as number);
    }, [activeFilter]);

    // Dynamic section background
    const sectionBackground = useMemo(() => {
        const baseHue = time * 5;

        if (theme === 'dark') {
            return `
                radial-gradient(ellipse at ${mousePosition.x}% ${mousePosition.y}%, 
                    hsl(${baseHue}, 40%, 15%) 0%, 
                    hsl(${(baseHue + 120) % 360}, 40%, 10%) 50%, 
                    hsl(${(baseHue + 240) % 360}, 40%, 5%) 100%),
                linear-gradient(135deg, 
                    rgba(15, 23, 42, 0.95) 0%, 
                    rgba(30, 41, 59, 0.9) 50%, 
                    rgba(15, 23, 42, 0.95) 100%)
            `;
        } else {
            return `
                radial-gradient(ellipse at ${mousePosition.x}% ${mousePosition.y}%, 
                    hsl(${baseHue}, 30%, 96%) 0%, 
                    hsl(${(baseHue + 120) % 360}, 30%, 98%) 50%, 
                    hsl(${(baseHue + 240) % 360}, 30%, 95%) 100%),
                linear-gradient(135deg, 
                    rgba(248, 250, 252, 0.95) 0%, 
                    rgba(241, 245, 249, 0.9) 50%, 
                    rgba(248, 250, 252, 0.95) 100%)
            `;
        }
    }, [theme, mousePosition, time]);

    return (
        <section
            id="projects"
            ref={sectionRef}
            className="relative py-24 px-4 sm:px-6 lg:px-8 overflow-hidden min-h-screen"
            style={{
                background: sectionBackground,
                transition: 'background 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
        >
            {/* Animated Background Elements */}
            <div className="absolute inset-0 overflow-hidden">
                {/* Floating Geometric Shapes */}
                {[...Array(12)].map((_, i) => (
                    <div
                        key={i}
                        className={`absolute transition-all duration-1000 ${theme === 'dark' ? 'opacity-10' : 'opacity-8'
                            }`}
                        style={{
                            left: `${10 + (i % 4) * 25}%`,
                            top: `${15 + Math.floor(i / 4) * 25}%`,
                            transform: `
                                translate3d(
                                    ${Math.sin(time * 0.001 + i) * 30}px,
                                    ${Math.cos(time * 0.0008 + i) * 20}px,
                                    ${Math.sin(time * 0.0005 + i) * 10}px
                                )
                                rotate(${time * 10 + i * 30}deg)
                                scale(${1 + Math.sin(time * 0.002 + i) * 0.3})
                            `,
                            filter: `hue-rotate(${time * 20 + i * 45}deg)`
                        }}
                    >
                        <div
                            className={`w-16 h-16 ${['triangle', 'square', 'circle', 'hexagon'][i % 4] === 'circle'
                                    ? 'rounded-full'
                                    : 'rounded-lg'
                                } ${theme === 'dark'
                                    ? 'bg-gradient-to-br from-blue-500/30 to-purple-500/30'
                                    : 'bg-gradient-to-br from-blue-400/20 to-purple-400/20'
                                }`}
                            style={{
                                clipPath: ['triangle', 'square', 'circle', 'hexagon'][i % 4] === 'triangle'
                                    ? 'polygon(50% 0%, 0% 100%, 100% 100%)'
                                    : ['triangle', 'square', 'circle', 'hexagon'][i % 4] === 'hexagon'
                                        ? 'polygon(30% 0%, 70% 0%, 100% 50%, 70% 100%, 30% 100%, 0% 50%)'
                                        : 'none'
                            }}
                        />
                    </div>
                ))}

                {/* Grid Pattern */}
                <div className={`absolute inset-0 ${theme === 'dark' ? 'opacity-5' : 'opacity-3'}`}>
                    <svg className="w-full h-full">
                        <defs>
                            <pattern
                                id="projectGrid"
                                width="80"
                                height="80"
                                patternUnits="userSpaceOnUse"
                                patternTransform={`rotate(${time * 0.1})`}
                            >
                                <path
                                    d="M 80 0 L 0 0 0 80"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="1"
                                    opacity="0.3"
                                />
                            </pattern>
                        </defs>
                        <rect
                            width="100%"
                            height="100%"
                            fill="url(#projectGrid)"
                            className={theme === 'dark' ? 'text-blue-400' : 'text-blue-500'}
                        />
                    </svg>
                </div>
            </div>

            <div className="max-w-7xl mx-auto relative z-10">
                {/* Section Header */}
                <div className={`text-center mb-20 transition-all duration-1000 ease-out transform ${sectionInView ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'
                    }`}>
                    <div
                        className={`inline-flex items-center space-x-3 backdrop-blur-xl border rounded-full px-6 py-3 mb-8 ${theme === 'dark'
                                ? 'bg-slate-800/80 border-slate-600/50 text-slate-300'
                                : 'bg-white/80 border-gray-200/50 text-gray-600'
                            }`}
                        style={{
                            boxShadow: `0 10px 30px ${theme === 'dark' ? 'rgba(0, 0, 0, 0.3)' : 'rgba(0, 0, 0, 0.1)'
                                }`
                        }}
                    >
                        <Filter className="w-5 h-5 text-blue-500" />
                        <span className="font-bold tracking-wide">Project Showcase</span>
                        <Sparkles className="w-5 h-5 text-purple-500" />
                    </div>

                    <h2 className="text-5xl sm:text-6xl md:text-7xl font-black mb-8 leading-tight">
                        <span className={`bg-gradient-to-r bg-clip-text text-transparent ${theme === 'dark'
                                ? 'from-white via-blue-100 to-white'
                                : 'from-gray-900 via-blue-900 to-gray-900'
                            }`}>
                            Explore the
                        </span>
                        <br />
                        <span
                            className="bg-gradient-to-r from-blue-500 via-purple-600 to-cyan-500 bg-clip-text text-transparent"
                            style={{
                                filter: `hue-rotate(${time * 10}deg) drop-shadow(0 0 30px rgba(59, 130, 246, 0.3))`
                            }}
                        >
                            CODAI Ecosystem
                        </span>
                    </h2>

                    <p className={`text-xl md:text-2xl max-w-4xl mx-auto leading-relaxed ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                        }`}>
                        Discover <span className="font-bold text-blue-500">42+ AI-native applications</span> spanning every aspect of digital life,
                        from development tools to financial services, social platforms to smart automation.
                    </p>
                </div>

                {/* Enhanced Filter Tabs */}
                <div className={`transition-all duration-1000 ease-out transform delay-300 ${sectionInView ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'
                    }`}>
                    <FilterTabs
                        activeFilter={activeFilter}
                        onFilterChange={setActiveFilter}
                        theme={theme === 'system' ? 'dark' : theme}
                        time={time}
                    />
                </div>

                {/* Revolutionary Bento Grid */}
                <div className={`transition-all duration-1000 ease-out transform delay-500 ${sectionInView ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'
                    }`}>
                    <ProjectBentoGrid
                        projects={filteredProjects}
                        mousePosition={mousePosition}
                        time={time}
                    />
                </div>

                {/* Enhanced Call to Action */}
                <div className={`text-center mt-24 transition-all duration-1000 ease-out transform delay-700 ${sectionInView ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'
                    }`}>
                    <div
                        className={`backdrop-blur-xl border rounded-3xl p-12 max-w-5xl mx-auto relative overflow-hidden ${theme === 'dark'
                                ? 'bg-slate-800/60 border-slate-600/40'
                                : 'bg-white/60 border-gray-200/40'
                            }`}
                        style={{
                            background: `
                                ${theme === 'dark'
                                    ? 'linear-gradient(135deg, rgba(51, 65, 85, 0.8), rgba(30, 41, 59, 0.6))'
                                    : 'linear-gradient(135deg, rgba(255, 255, 255, 0.8), rgba(248, 250, 252, 0.6))'
                                },
                                radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%, 
                                    rgba(59, 130, 246, 0.1), transparent 70%)
                            `,
                            boxShadow: `0 25px 50px ${theme === 'dark' ? 'rgba(0, 0, 0, 0.3)' : 'rgba(0, 0, 0, 0.1)'
                                }`
                        }}
                    >
                        <h3 className={`text-3xl md:text-4xl font-black mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'
                            }`}>
                            Ready to Build the Future?
                        </h3>

                        <p className={`text-lg md:text-xl mb-10 max-w-3xl mx-auto leading-relaxed ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                            }`}>
                            Join the CODAI ecosystem and be part of the AI-native revolution.
                            Every project is designed to work seamlessly together.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-6 justify-center">
                            <button
                                className="group relative bg-gradient-to-r from-blue-600 to-purple-600 text-white px-10 py-5 rounded-2xl font-black text-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-500 transform hover:scale-110 hover:shadow-2xl overflow-hidden"
                                style={{
                                    boxShadow: '0 20px 40px rgba(59, 130, 246, 0.3)'
                                }}
                            >
                                <span className="relative z-10 flex items-center justify-center space-x-3">
                                    <Zap className="w-6 h-6" />
                                    <span>Get Early Access</span>
                                    <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform duration-500" />
                                </span>

                                {/* Button shine effect */}
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                            </button>

                            <button
                                onClick={() => {
                                    const ecosystemSection = document.getElementById('ecosystem');
                                    if (ecosystemSection) {
                                        ecosystemSection.scrollIntoView({ behavior: 'smooth' });
                                    }
                                }}
                                className={`group backdrop-blur-xl border px-10 py-5 rounded-2xl font-black text-lg transition-all duration-500 transform hover:scale-110 hover:shadow-xl ${theme === 'dark'
                                        ? 'bg-slate-700/50 border-slate-500/50 text-white hover:bg-slate-600/60'
                                        : 'bg-white/50 border-gray-300/50 text-gray-900 hover:bg-white/70'
                                    }`}
                            >
                                <span className="flex items-center justify-center space-x-3">
                                    <Play className="w-6 h-6" />
                                    <span>Learn More</span>
                                    <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform duration-500" />
                                </span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};