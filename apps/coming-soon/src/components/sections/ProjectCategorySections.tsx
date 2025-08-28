'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, useInView, useMotionValue, useTransform } from 'framer-motion';
import {
    ArrowRight, Filter, Search, Star, Eye, Code, Zap, ChevronDown,
    Grid, List, Layers, Sparkles, Play, ArrowUpRight, Clock, Users,
    TrendingUp, Shield, Rocket, Target, Atom, Brain, Building
} from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { useTranslation } from 'react-i18next';
import { Project, codaiProjects, projectCategories, getProjectsByCategory } from '@/data/projects';
import { cn } from '@/lib/utils';

// Category-specific themes
const categoryThemes = {
    'Foundation Services': {
        primary: 'from-blue-600 via-indigo-600 to-purple-700',
        secondary: 'from-blue-500/20 to-purple-500/20',
        accent: '#6366F1',
        icon: Building,
        description: 'Core platform services that power the entire ecosystem',
        particle: 'bg-blue-500',
        glow: 'shadow-blue-500/25'
    },
    'New Generation': {
        primary: 'from-emerald-600 via-teal-600 to-cyan-700',
        secondary: 'from-emerald-500/20 to-cyan-500/20',
        accent: '#10B981',
        icon: Rocket,
        description: 'Next-generation platforms disrupting traditional markets',
        particle: 'bg-emerald-500',
        glow: 'shadow-emerald-500/25'
    },
    'Infrastructure': {
        primary: 'from-purple-600 via-pink-600 to-rose-700',
        secondary: 'from-purple-500/20 to-rose-500/20',
        accent: '#A855F7',
        icon: Layers,
        description: 'Essential infrastructure services and development tools',
        particle: 'bg-purple-500',
        glow: 'shadow-purple-500/25'
    },
    'Specialized Services': {
        primary: 'from-amber-600 via-orange-600 to-red-700',
        secondary: 'from-amber-500/20 to-red-500/20',
        accent: '#F59E0B',
        icon: Target,
        description: 'Specialized solutions for unique business requirements',
        particle: 'bg-amber-500',
        glow: 'shadow-amber-500/25'
    },
    'Emerging Platforms': {
        primary: 'from-violet-600 via-fuchsia-600 to-pink-700',
        secondary: 'from-violet-500/20 to-pink-500/20',
        accent: '#8B5CF6',
        icon: Atom,
        description: 'Cutting-edge platforms defining the future of AI',
        particle: 'bg-violet-500',
        glow: 'shadow-violet-500/25'
    }
};

interface ProjectCardProps {
    project: Project;
    index: number;
    viewMode: 'grid' | 'list';
    categoryTheme: any;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, index, viewMode, categoryTheme }) => {
    const { theme } = useTheme();
    const [isHovered, setIsHovered] = useState(false);
    const cardRef = useRef<HTMLDivElement>(null);
    const isInView = useInView(cardRef, { once: true, margin: "-100px" });

    return (
        <motion.div
            ref={cardRef}
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
            transition={{ duration: 0.6, delay: index * 0.1 }}
            className={cn(
                "group relative overflow-hidden rounded-2xl transition-all duration-500",
                viewMode === 'grid' ? "h-full" : "h-40",
                theme === 'dark'
                    ? "bg-gray-900/80 border border-gray-700/50"
                    : "bg-white/80 border border-gray-200/50",
                "backdrop-blur-sm hover:shadow-2xl",
                categoryTheme.glow
            )}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
        >
            {/* Animated Background */}
            <div className={cn(
                "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500",
                `bg-gradient-to-br ${categoryTheme.secondary}`
            )} />

            {/* Status Indicator */}
            <div className="absolute top-4 right-4 z-10">
                <div className={cn(
                    "px-2 py-1 rounded-full text-xs font-medium backdrop-blur-sm",
                    project.status === 'production' && "bg-green-500/20 text-green-400 border border-green-500/30",
                    project.status === 'development' && "bg-blue-500/20 text-blue-400 border border-blue-500/30",
                    project.status === 'beta' && "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30",
                    project.status === 'planned' && "bg-gray-500/20 text-gray-400 border border-gray-500/30"
                )}>
                    {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                </div>
            </div>

            {/* Priority Badge */}
            <div className="absolute top-4 left-4 z-10">
                <div className={cn(
                    "flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium backdrop-blur-sm",
                    project.priority === 'critical' && "bg-red-500/20 text-red-400 border border-red-500/30",
                    project.priority === 'high' && "bg-orange-500/20 text-orange-400 border border-orange-500/30",
                    project.priority === 'medium' && "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30",
                    project.priority === 'low' && "bg-gray-500/20 text-gray-400 border border-gray-500/30"
                )}>
                    <Star className="w-3 h-3" />
                    {project.priority}
                </div>
            </div>

            <div className={cn(
                "relative z-10 h-full p-6 flex",
                viewMode === 'grid' ? "flex-col" : "items-center gap-6"
            )}>
                {/* Project Icon & Title */}
                <div className={cn(
                    "flex items-center gap-4 mb-4",
                    viewMode === 'list' && "flex-shrink-0"
                )}>
                    <div className={cn(
                        "p-3 rounded-xl transition-all duration-300",
                        `bg-gradient-to-br ${project.gradient}`,
                        isHovered && "scale-110 shadow-lg"
                    )}>
                        {React.createElement(project.icon as React.ComponentType<{ className?: string }>, {
                            className: "w-6 h-6 text-white"
                        })}
                    </div>
                    <div>
                        <h3 className={cn(
                            "font-bold transition-colors",
                            viewMode === 'grid' ? "text-xl" : "text-lg",
                            theme === 'dark' ? "text-white" : "text-gray-900"
                        )}>
                            {project.name}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            {project.domain}
                        </p>
                    </div>
                </div>

                {viewMode === 'grid' && (
                    <>
                        {/* Description */}
                        <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-2 flex-grow">
                            {project.description}
                        </p>

                        {/* Key Features (Grid only) */}
                        <div className="mb-4">
                            <div className="flex flex-wrap gap-1 mb-3">
                                {project.features.slice(0, 3).map((feature, featureIndex) => (
                                    <span
                                        key={featureIndex}
                                        className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-md"
                                    >
                                        {feature.split(':')[0]}
                                    </span>
                                ))}
                                {project.features.length > 3 && (
                                    <span className="px-2 py-1 text-xs text-blue-600 dark:text-blue-400 font-medium">
                                        +{project.features.length - 3}
                                    </span>
                                )}
                            </div>
                        </div>
                    </>
                )}

                {/* Tech Stack */}
                <div className={cn(
                    "mb-4",
                    viewMode === 'list' && "flex-grow"
                )}>
                    <div className="flex flex-wrap gap-1">
                        {project.techStack?.slice(0, viewMode === 'grid' ? 4 : 6).map((tech, techIndex) => (
                            <span
                                key={techIndex}
                                className="px-2 py-1 text-xs bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded border border-gray-200 dark:border-gray-700"
                            >
                                {tech}
                            </span>
                        )) || []}
                    </div>
                </div>

                {/* Action Buttons */}
                <div className={cn(
                    "flex gap-2 mt-auto",
                    viewMode === 'list' && "flex-shrink-0"
                )}>
                    <motion.button
                        className={cn(
                            "flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-300",
                            `bg-gradient-to-r ${project.gradient}`,
                            "text-white shadow-lg hover:shadow-xl"
                        )}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <Eye className="w-4 h-4" />
                        {viewMode === 'grid' ? 'Preview' : 'View'}
                        <ArrowUpRight className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                    </motion.button>

                    {viewMode === 'grid' && (
                        <motion.button
                            className="flex items-center gap-2 px-4 py-2 bg-white/80 dark:bg-gray-800/80 text-gray-900 dark:text-white font-medium rounded-xl shadow-lg hover:shadow-xl backdrop-blur-sm border border-gray-200 dark:border-gray-700 transition-all duration-300"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <Code className="w-4 h-4" />
                            Docs
                        </motion.button>
                    )}
                </div>
            </div>

            {/* Hover Animation Particles */}
            {isHovered && (
                <div className="absolute inset-0 pointer-events-none">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <motion.div
                            key={i}
                            className={cn("absolute w-1 h-1 rounded-full", categoryTheme.particle)}
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
                                delay: i * 0.2,
                                repeat: Infinity,
                                repeatDelay: 1
                            }}
                        />
                    ))}
                </div>
            )}
        </motion.div>
    );
};

interface CategorySectionProps {
    category: string;
    index: number;
}

const CategorySection: React.FC<CategorySectionProps> = ({ category, index }) => {
    const { theme } = useTheme();
    const { t } = useTranslation();
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedStatus, setSelectedStatus] = useState<string>('all');
    const [selectedPriority, setSelectedPriority] = useState<string>('all');
    const [isExpanded, setIsExpanded] = useState(false);

    const sectionRef = useRef<HTMLDivElement>(null);
    const isInView = useInView(sectionRef, { once: true, margin: "-200px" });

    const categoryTheme = categoryThemes[category as keyof typeof categoryThemes];
    const CategoryIcon = categoryTheme.icon;

    const projects = getProjectsByCategory(category);

    // Filter projects based on search and filters
    const filteredProjects = projects.filter(project => {
        const matchesSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            project.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            project.domain.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = selectedStatus === 'all' || project.status === selectedStatus;
        const matchesPriority = selectedPriority === 'all' || project.priority === selectedPriority;

        return matchesSearch && matchesStatus && matchesPriority;
    });

    // Show limited projects initially, expand on demand
    const displayedProjects = isExpanded ? filteredProjects : filteredProjects.slice(0, 6);

    return (
        <section
            ref={sectionRef}
            className="relative py-20 overflow-hidden"
        >
            {/* Animated Background */}
            <div className="absolute inset-0">
                <div className={cn(
                    "absolute inset-0 opacity-5",
                    `bg-gradient-to-br ${categoryTheme.primary}`
                )} />

                {/* Floating Particles */}
                {Array.from({ length: 20 }).map((_, i) => (
                    <motion.div
                        key={i}
                        className={cn("absolute w-1 h-1 rounded-full opacity-20", categoryTheme.particle)}
                        initial={{
                            x: typeof window !== 'undefined' ? Math.random() * window.innerWidth : Math.random() * 800,
                            y: typeof window !== 'undefined' ? Math.random() * window.innerHeight : Math.random() * 600,
                        }}
                        animate={{
                            x: typeof window !== 'undefined' ? Math.random() * window.innerWidth : Math.random() * 800,
                            y: typeof window !== 'undefined' ? Math.random() * window.innerHeight : Math.random() * 600,
                        }}
                        transition={{
                            duration: Math.random() * 20 + 10,
                            repeat: Infinity,
                            repeatType: 'reverse'
                        }}
                    />
                ))}
            </div>

            <div className="container mx-auto px-6 relative z-10">
                {/* Category Header */}
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.8, delay: index * 0.2 }}
                    className="text-center mb-16"
                >
                    <div className="flex items-center justify-center gap-4 mb-6">
                        <div className={cn(
                            "p-4 rounded-2xl shadow-lg",
                            `bg-gradient-to-br ${categoryTheme.primary}`
                        )}>
                            <CategoryIcon className="w-8 h-8 text-white" />
                        </div>
                    </div>

                    <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4">
                        <span className={cn(
                            "bg-gradient-to-r bg-clip-text text-transparent",
                            categoryTheme.primary
                        )}>
                            {category}
                        </span>
                    </h2>

                    <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-8">
                        {categoryTheme.description}
                    </p>

                    <div className="flex items-center justify-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                        <div className="flex items-center gap-2">
                            <Brain className="w-4 h-4" />
                            <span>{projects.length} Projects</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Users className="w-4 h-4" />
                            <span>{projects.filter(p => p.status === 'production').length} Live</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <TrendingUp className="w-4 h-4" />
                            <span>Tier {projects[0]?.tier}</span>
                        </div>
                    </div>
                </motion.div>

                {/* Controls */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6, delay: index * 0.2 + 0.2 }}
                    className="flex flex-col lg:flex-row gap-4 items-center justify-between mb-12"
                >
                    {/* Search */}
                    <div className="relative flex-grow max-w-md">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder={`Search ${category.toLowerCase()}...`}
                            className="w-full pl-10 pr-4 py-3 bg-white/80 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 backdrop-blur-sm transition-all"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    {/* Filters */}
                    <div className="flex items-center gap-3">
                        <select
                            className="px-4 py-3 bg-white/80 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 backdrop-blur-sm text-sm"
                            value={selectedStatus}
                            onChange={(e) => setSelectedStatus(e.target.value)}
                        >
                            <option value="all">All Status</option>
                            <option value="production">Production</option>
                            <option value="development">Development</option>
                            <option value="beta">Beta</option>
                            <option value="planned">Planned</option>
                        </select>

                        <select
                            className="px-4 py-3 bg-white/80 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 backdrop-blur-sm text-sm"
                            value={selectedPriority}
                            onChange={(e) => setSelectedPriority(e.target.value)}
                        >
                            <option value="all">All Priority</option>
                            <option value="critical">Critical</option>
                            <option value="high">High</option>
                            <option value="medium">Medium</option>
                            <option value="low">Low</option>
                        </select>

                        {/* View Mode Toggle */}
                        <div className="flex items-center bg-white/80 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden backdrop-blur-sm">
                            <button
                                onClick={() => setViewMode('grid')}
                                className={cn(
                                    "p-3 transition-colors",
                                    viewMode === 'grid'
                                        ? `bg-gradient-to-r ${categoryTheme.primary} text-white`
                                        : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                                )}
                            >
                                <Grid className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={cn(
                                    "p-3 transition-colors",
                                    viewMode === 'list'
                                        ? `bg-gradient-to-r ${categoryTheme.primary} text-white`
                                        : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                                )}
                            >
                                <List className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </motion.div>

                {/* Projects Grid/List */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={isInView ? { opacity: 1 } : {}}
                    transition={{ duration: 0.8, delay: index * 0.2 + 0.4 }}
                    className={cn(
                        "transition-all duration-500",
                        viewMode === 'grid'
                            ? "grid gap-8 grid-cols-1 md:grid-cols-2 xl:grid-cols-3"
                            : "space-y-4"
                    )}
                >
                    {displayedProjects.map((project, projectIndex) => (
                        <ProjectCard
                            key={project.id}
                            project={project}
                            index={projectIndex}
                            viewMode={viewMode}
                            categoryTheme={categoryTheme}
                        />
                    ))}
                </motion.div>

                {/* Show More Button */}
                {!isExpanded && filteredProjects.length > 6 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={isInView ? { opacity: 1, y: 0 } : {}}
                        transition={{ duration: 0.6, delay: index * 0.2 + 0.6 }}
                        className="text-center mt-12"
                    >
                        <button
                            onClick={() => setIsExpanded(true)}
                            className={cn(
                                "group inline-flex items-center gap-2 px-8 py-4 font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105",
                                `bg-gradient-to-r ${categoryTheme.primary} text-white`
                            )}
                        >
                            <Sparkles className="w-5 h-5" />
                            Show All {filteredProjects.length} Projects
                            <ChevronDown className="w-5 h-5 group-hover:translate-y-1 transition-transform" />
                        </button>
                    </motion.div>
                )}

                {/* Results Count */}
                {searchQuery || selectedStatus !== 'all' || selectedPriority !== 'all' ? (
                    <div className="text-center mt-8">
                        <p className="text-gray-500 dark:text-gray-400">
                            Showing {displayedProjects.length} of {filteredProjects.length} projects
                            {searchQuery && ` matching "${searchQuery}"`}
                        </p>
                    </div>
                ) : null}
            </div>
        </section>
    );
};

export const ProjectCategorySections: React.FC = () => {
    const { theme } = useTheme();
    const { t } = useTranslation();

    return (
        <div className="relative">
            {/* Section Introduction */}
            <section className="relative py-20 text-center overflow-hidden">
                <div className="absolute inset-0">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 opacity-50" />
                </div>

                <div className="container mx-auto px-6 relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-full border border-blue-500/20 dark:border-blue-400/20 mb-8">
                            <Rocket className="w-5 h-5 text-blue-500 dark:text-blue-400" />
                            <span className="text-blue-600 dark:text-blue-400 font-semibold">Explore Our AI Ecosystem</span>
                        </div>

                        <h2 className="text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-8">
                            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                                42+ AI-Powered
                            </span>
                            <br />
                            <span className="text-gray-900 dark:text-white">
                                Revolutionary Platforms
                            </span>
                        </h2>

                        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-4xl mx-auto leading-relaxed mb-12">
                            Discover the most comprehensive AI ecosystem ever created. From core infrastructure to
                            cutting-edge specialized platforms, each service is designed to work seamlessly together
                            while pushing the boundaries of what's possible with artificial intelligence.
                        </p>

                        <div className="flex flex-wrap justify-center gap-8 text-sm text-gray-600 dark:text-gray-400">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                                <span>5 Specialized Categories</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                                <span>Production Ready</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" />
                                <span>Enterprise Grade</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
                                <span>AI-Native Design</span>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Category Sections */}
            {projectCategories.map((category, index) => (
                <CategorySection key={category} category={category} index={index} />
            ))}

            {/* Ecosystem Overview */}
            <section className="relative py-20 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600">
                <div className="container mx-auto px-6 text-center text-white">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        viewport={{ once: true }}
                    >
                        <h3 className="text-4xl lg:text-5xl font-bold mb-8">
                            The Future of AI is Integrated
                        </h3>
                        <p className="text-xl text-white/90 mb-12 max-w-3xl mx-auto">
                            Unlike fragmented solutions, CODAI creates a unified ecosystem where every
                            platform enhances the others. Experience the power of true AI integration.
                        </p>

                        <div className="flex flex-wrap justify-center gap-4">
                            <motion.button
                                className="group flex items-center gap-2 px-8 py-4 bg-white text-purple-600 font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <Play className="w-5 h-5" />
                                Watch Demo
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </motion.button>

                            <motion.button
                                className="group flex items-center gap-2 px-8 py-4 border-2 border-white text-white font-semibold rounded-full hover:bg-white hover:text-purple-600 transition-all duration-300 transform hover:scale-105"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <Rocket className="w-5 h-5" />
                                Join Waitlist
                                <ArrowUpRight className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                            </motion.button>
                        </div>
                    </motion.div>
                </div>
            </section>
        </div>
    );
};

export default ProjectCategorySections;