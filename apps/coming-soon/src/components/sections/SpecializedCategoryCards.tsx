'use client';

import React, { useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import {
    ArrowRight, Code, Database, Zap, Building, Brain, Shield, Layers,
    Server, Play, ChevronRight, Sparkles, TrendingUp, Users, CheckCircle
} from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { Project } from '@/data/projects';
import { cn } from '@/lib/utils';

interface SpecializedCategoryCardProps {
    project: Project;
    index: number;
    categoryStyle: 'foundation' | 'generation' | 'infrastructure' | 'specialized' | 'emerging';
}

const SpecializedCategoryCard: React.FC<SpecializedCategoryCardProps> = ({
    project,
    index,
    categoryStyle
}) => {
    const { theme } = useTheme();
    const [isHovered, setIsHovered] = useState(false);
    const cardRef = useRef<HTMLDivElement>(null);
    const isInView = useInView(cardRef, { once: true, margin: "-50px" });

    // Category-specific styling
    const styleConfig = {
        foundation: {
            bg: 'from-blue-900/20 via-indigo-900/20 to-purple-900/20',
            border: 'border-blue-500/20',
            accent: 'from-blue-500 to-indigo-600',
            text: 'text-blue-400',
            glow: 'shadow-blue-500/25',
            particle: 'bg-blue-400'
        },
        generation: {
            bg: 'from-emerald-900/20 via-teal-900/20 to-cyan-900/20',
            border: 'border-emerald-500/20',
            accent: 'from-emerald-500 to-teal-600',
            text: 'text-emerald-400',
            glow: 'shadow-emerald-500/25',
            particle: 'bg-emerald-400'
        },
        infrastructure: {
            bg: 'from-purple-900/20 via-pink-900/20 to-rose-900/20',
            border: 'border-purple-500/20',
            accent: 'from-purple-500 to-pink-600',
            text: 'text-purple-400',
            glow: 'shadow-purple-500/25',
            particle: 'bg-purple-400'
        },
        specialized: {
            bg: 'from-amber-900/20 via-orange-900/20 to-red-900/20',
            border: 'border-amber-500/20',
            accent: 'from-amber-500 to-orange-600',
            text: 'text-amber-400',
            glow: 'shadow-amber-500/25',
            particle: 'bg-amber-400'
        },
        emerging: {
            bg: 'from-violet-900/20 via-fuchsia-900/20 to-pink-900/20',
            border: 'border-violet-500/20',
            accent: 'from-violet-500 to-fuchsia-600',
            text: 'text-violet-400',
            glow: 'shadow-violet-500/25',
            particle: 'bg-violet-400'
        }
    };

    const style = styleConfig[categoryStyle];

    return (
        <motion.div
            ref={cardRef}
            initial={{ opacity: 0, y: 60, rotateX: -15 }}
            animate={isInView ? { opacity: 1, y: 0, rotateX: 0 } : {}}
            transition={{ duration: 0.8, delay: index * 0.1 }}
            className={cn(
                "group relative overflow-hidden rounded-2xl transition-all duration-500 transform-gpu",
                "backdrop-blur-sm border",
                `bg-gradient-to-br ${style.bg}`,
                style.border,
                isHovered && style.glow,
                "hover:scale-105 hover:-translate-y-2"
            )}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            style={{ perspective: '1000px' }}
        >
            {/* Animated Background Pattern */}
            <div className="absolute inset-0 opacity-10">
                <div className={cn(
                    "absolute inset-0 transition-all duration-500",
                    `bg-gradient-to-br ${project.gradient}`,
                    isHovered ? 'scale-110' : 'scale-100'
                )} />
            </div>

            {/* Status & Priority Badges */}
            <div className="absolute top-4 right-4 z-20 flex gap-2">
                <div className={cn(
                    "px-2 py-1 rounded-full text-xs font-medium backdrop-blur-sm border",
                    project.status === 'production' && "bg-green-500/20 text-green-400 border-green-500/30",
                    project.status === 'development' && "bg-blue-500/20 text-blue-400 border-blue-500/30",
                    project.status === 'beta' && "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
                    project.status === 'planned' && "bg-gray-500/20 text-gray-400 border-gray-500/30"
                )}>
                    {project.status}
                </div>
            </div>

            <div className="relative z-10 p-8 h-full flex flex-col">
                {/* Project Icon & Header */}
                <div className="flex items-start gap-4 mb-6">
                    <motion.div
                        className={cn(
                            "p-4 rounded-2xl transition-all duration-300",
                            `bg-gradient-to-br ${style.accent}`,
                            "shadow-lg"
                        )}
                        animate={isHovered ? { scale: 1.1, rotateY: 15 } : { scale: 1, rotateY: 0 }}
                    >
                        {React.createElement(project.icon as React.ComponentType<{ className?: string }>, {
                            className: "w-8 h-8 text-white"
                        })}
                    </motion.div>

                    <div className="flex-grow">
                        <h3 className="text-2xl font-bold text-white mb-2">
                            {project.name}
                        </h3>
                        <p className={cn("text-sm font-medium", style.text)}>
                            {project.domain}
                        </p>
                    </div>
                </div>

                {/* Project Description */}
                <p className="text-gray-300 text-sm mb-6 line-clamp-3 flex-grow">
                    {project.fullDescription || project.description}
                </p>

                {/* Key Features Preview */}
                <div className="mb-6">
                    <h4 className="text-white font-semibold text-sm mb-3">Key Features</h4>
                    <div className="space-y-2">
                        {project.features.slice(0, 2).map((feature, featureIndex) => (
                            <div key={featureIndex} className="flex items-start gap-2">
                                <CheckCircle className={cn("w-4 h-4 mt-0.5 flex-shrink-0", style.text)} />
                                <span className="text-gray-300 text-sm">
                                    {feature.split(':')[0]}
                                </span>
                            </div>
                        ))}
                        {project.features.length > 2 && (
                            <div className="flex items-center gap-2 text-sm">
                                <Sparkles className={cn("w-4 h-4", style.text)} />
                                <span className={cn("font-medium", style.text)}>
                                    +{project.features.length - 2} more features
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Tech Stack */}
                <div className="mb-6">
                    <div className="flex flex-wrap gap-2">
                        {project.techStack?.slice(0, 4).map((tech, techIndex) => (
                            <span
                                key={techIndex}
                                className="px-2 py-1 text-xs bg-white/10 text-gray-300 rounded-md border border-white/20"
                            >
                                {tech}
                            </span>
                        )) || []}
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 mt-auto">
                    <motion.button
                        className={cn(
                            "flex items-center gap-2 px-4 py-3 rounded-xl font-medium transition-all duration-300",
                            `bg-gradient-to-r ${style.accent}`,
                            "text-white shadow-lg hover:shadow-xl flex-grow justify-center"
                        )}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <Play className="w-4 h-4" />
                        Preview
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </motion.button>

                    <motion.button
                        className="flex items-center justify-center w-12 h-12 bg-white/10 hover:bg-white/20 text-white rounded-xl border border-white/20 hover:border-white/40 transition-all duration-300"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <Code className="w-5 h-5" />
                    </motion.button>
                </div>
            </div>

            {/* Hover Particles */}
            {isHovered && (
                <div className="absolute inset-0 pointer-events-none">
                    {Array.from({ length: 8 }).map((_, i) => (
                        <motion.div
                            key={i}
                            className={cn("absolute w-1 h-1 rounded-full", style.particle)}
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{
                                opacity: [0, 1, 0],
                                scale: [0, 1, 0],
                                x: [
                                    Math.random() * 300,
                                    Math.random() * 300,
                                    Math.random() * 300
                                ],
                                y: [
                                    Math.random() * 200,
                                    Math.random() * 200,
                                    Math.random() * 200
                                ]
                            }}
                            transition={{
                                duration: 2,
                                delay: i * 0.1,
                                repeat: Infinity,
                                repeatDelay: 1
                            }}
                        />
                    ))}
                </div>
            )}

            {/* Interactive Glow Effect */}
            <div className={cn(
                "absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500",
                `bg-gradient-to-r ${style.accent}`,
                "blur-xl -z-10 transform scale-110"
            )} />
        </motion.div>
    );
};

interface FoundationServicesSectionProps {
    projects: Project[];
}

export const FoundationServicesSection: React.FC<FoundationServicesSectionProps> = ({ projects }) => {
    const { theme } = useTheme();
    const sectionRef = useRef<HTMLDivElement>(null);
    const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

    return (
        <section ref={sectionRef} className="relative py-20 overflow-hidden">
            {/* Section Background */}
            <div className="absolute inset-0">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-900/10 via-indigo-900/10 to-purple-900/10" />

                {/* Animated Grid Pattern */}
                <div className="absolute inset-0 opacity-10">
                    <div
                        className="w-full h-full"
                        style={{
                            backgroundImage: `radial-gradient(circle at 25% 25%, #3B82F6 2px, transparent 2px),
                                            radial-gradient(circle at 75% 75%, #8B5CF6 2px, transparent 2px)`,
                            backgroundSize: '50px 50px'
                        }}
                    />
                </div>
            </div>

            <div className="container mx-auto px-6 relative z-10">
                {/* Section Header */}
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.8 }}
                    className="text-center mb-16"
                >
                    <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-full border border-blue-500/20 mb-8">
                        <Building className="w-5 h-5 text-blue-400" />
                        <span className="text-blue-400 font-semibold">Foundation Services</span>
                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
                    </div>

                    <h2 className="text-5xl lg:text-6xl font-bold text-white mb-6">
                        The{' '}
                        <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
                            Foundation
                        </span>
                        {' '}Layer
                    </h2>

                    <p className="text-xl text-gray-300 max-w-4xl mx-auto leading-relaxed mb-8">
                        Essential backbone services that power the entire CODAI ecosystem.
                        These core platforms provide the infrastructure, security, and intelligence
                        that enable all other services to thrive.
                    </p>

                    <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-400">
                        <div className="flex items-center gap-2">
                            <Server className="w-4 h-4 text-blue-400" />
                            <span>8 Core Services</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Shield className="w-4 h-4 text-green-400" />
                            <span>Enterprise Security</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Zap className="w-4 h-4 text-yellow-400" />
                            <span>99.9% Uptime</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-purple-400" />
                            <span>Production Ready</span>
                        </div>
                    </div>
                </motion.div>

                {/* Projects Grid */}
                <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                    {projects.map((project, index) => (
                        <SpecializedCategoryCard
                            key={project.id}
                            project={project}
                            index={index}
                            categoryStyle="foundation"
                        />
                    ))}
                </div>

                {/* Section Footer */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.8, delay: 0.5 }}
                    className="text-center mt-16"
                >
                    <div className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer">
                        <Brain className="w-5 h-5" />
                        Explore Foundation Architecture
                        <ChevronRight className="w-5 h-5" />
                    </div>
                </motion.div>
            </div>
        </section>
    );
};

export default SpecializedCategoryCard;