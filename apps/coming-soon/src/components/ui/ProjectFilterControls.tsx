'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search, Filter, SortAsc, SortDesc, Grid, List, Zap,
    Calendar, Star, Users, TrendingUp, ChevronDown, X,
    Layers, Target, Rocket, Building, Atom
} from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { Project } from '@/data/projects';
import { cn } from '@/lib/utils';

interface ProjectFilterControlsProps {
    projects: Project[];
    onFilteredProjectsChange: (projects: Project[]) => void;
    onViewModeChange: (mode: 'grid' | 'list') => void;
    viewMode: 'grid' | 'list';
}

interface FilterState {
    search: string;
    status: string[];
    category: string[];
    priority: string[];
    tier: string[];
    techStack: string[];
    sortBy: 'name' | 'status' | 'priority' | 'tier' | 'launchDate';
    sortDirection: 'asc' | 'desc';
}

const categoryIcons: Record<string, React.ComponentType<{ className?: string }>> = {
    'Foundation Services': Building,
    'New Generation': Rocket,
    'Infrastructure': Layers,
    'Specialized Services': Target,
    'Emerging Platforms': Atom
};

export const ProjectFilterControls: React.FC<ProjectFilterControlsProps> = ({
    projects,
    onFilteredProjectsChange,
    onViewModeChange,
    viewMode
}) => {
    const { theme } = useTheme();
    const [isExpanded, setIsExpanded] = useState(false);
    const [filters, setFilters] = useState<FilterState>({
        search: '',
        status: [],
        category: [],
        priority: [],
        tier: [],
        techStack: [],
        sortBy: 'name',
        sortDirection: 'asc'
    });

    // Extract unique values for filter options
    const filterOptions = useMemo(() => {
        const statuses = [...new Set(projects.map(p => p.status))];
        const categories = [...new Set(projects.map(p => p.category))];
        const priorities = [...new Set(projects.map(p => p.priority))];
        const tiers = [...new Set(projects.map(p => p.tier.toString()))];
        const techStacks = [...new Set(projects.flatMap(p => p.techStack || []))];

        return { statuses, categories, priorities, tiers, techStacks };
    }, [projects]);

    // Filter and sort projects
    const filteredProjects = useMemo(() => {
        const result = projects.filter(project => {
            // Search filter
            if (filters.search) {
                const searchLower = filters.search.toLowerCase();
                const searchMatch =
                    project.name.toLowerCase().includes(searchLower) ||
                    project.description.toLowerCase().includes(searchLower) ||
                    project.domain.toLowerCase().includes(searchLower) ||
                    project.features.some(f => f.toLowerCase().includes(searchLower)) ||
                    (project.techStack?.some(t => t.toLowerCase().includes(searchLower)) || false);

                if (!searchMatch) return false;
            }

            // Status filter
            if (filters.status.length > 0 && !filters.status.includes(project.status)) {
                return false;
            }

            // Category filter
            if (filters.category.length > 0 && !filters.category.includes(project.category)) {
                return false;
            }

            // Priority filter
            if (filters.priority.length > 0 && !filters.priority.includes(project.priority)) {
                return false;
            }

            // Tier filter
            if (filters.tier.length > 0 && !filters.tier.includes(project.tier.toString())) {
                return false;
            }

            // Tech stack filter
            if (filters.techStack.length > 0) {
                const hasMatchingTech = filters.techStack.some(tech =>
                    project.techStack?.includes(tech) || false
                );
                if (!hasMatchingTech) return false;
            }

            return true;
        });

        // Sort results
        result.sort((a, b) => {
            let comparison = 0;

            switch (filters.sortBy) {
                case 'name':
                    comparison = a.name.localeCompare(b.name);
                    break;
                case 'status':
                    comparison = a.status.localeCompare(b.status);
                    break;
                case 'priority':
                    const priorityOrder = { 'critical': 4, 'high': 3, 'medium': 2, 'low': 1 };
                    comparison = priorityOrder[a.priority as keyof typeof priorityOrder] -
                        priorityOrder[b.priority as keyof typeof priorityOrder];
                    break;
                case 'tier':
                    comparison = a.tier - b.tier;
                    break;
                case 'launchDate':
                    comparison = new Date(a.launchDate).getTime() - new Date(b.launchDate).getTime();
                    break;
            }

            return filters.sortDirection === 'desc' ? -comparison : comparison;
        });

        return result;
    }, [projects, filters]);

    // Update filtered projects when filters change
    React.useEffect(() => {
        onFilteredProjectsChange(filteredProjects);
    }, [filteredProjects, onFilteredProjectsChange]);

    const updateFilter = (key: keyof FilterState, value: any) => {
        setFilters(prev => ({
            ...prev,
            [key]: value
        }));
    };

    const toggleArrayFilter = (key: 'status' | 'category' | 'priority' | 'tier' | 'techStack', value: string) => {
        setFilters(prev => ({
            ...prev,
            [key]: prev[key].includes(value)
                ? prev[key].filter(item => item !== value)
                : [...prev[key], value]
        }));
    };

    const clearFilters = () => {
        setFilters({
            search: '',
            status: [],
            category: [],
            priority: [],
            tier: [],
            techStack: [],
            sortBy: 'name',
            sortDirection: 'asc'
        });
    };

    const hasActiveFilters =
        filters.search ||
        filters.status.length > 0 ||
        filters.category.length > 0 ||
        filters.priority.length > 0 ||
        filters.tier.length > 0 ||
        filters.techStack.length > 0;

    return (
        <div className="relative z-20">
            {/* Main Filter Bar */}
            <div className={cn(
                "flex flex-col lg:flex-row gap-4 items-start lg:items-center p-6 rounded-2xl border backdrop-blur-sm transition-all duration-300",
                theme === 'dark'
                    ? "bg-gray-900/80 border-gray-700/50"
                    : "bg-white/80 border-gray-200/50",
                isExpanded && "shadow-2xl"
            )}>
                {/* Search Input */}
                <div className="relative flex-grow min-w-0">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search projects, features, or technologies..."
                        className={cn(
                            "w-full pl-12 pr-4 py-3 rounded-xl border transition-all duration-200 focus:ring-2 focus:ring-blue-500/20",
                            theme === 'dark'
                                ? "bg-gray-800/80 border-gray-600 text-white placeholder-gray-400"
                                : "bg-white/80 border-gray-300 text-gray-900 placeholder-gray-500"
                        )}
                        value={filters.search}
                        onChange={(e) => updateFilter('search', e.target.value)}
                    />
                </div>

                {/* Quick Filters & Controls */}
                <div className="flex items-center gap-3 flex-wrap">
                    {/* Category Quick Filters */}
                    {filterOptions.categories.slice(0, 3).map(category => {
                        const Icon = categoryIcons[category] || Building;
                        const isActive = filters.category.includes(category);

                        return (
                            <motion.button
                                key={category}
                                onClick={() => toggleArrayFilter('category', category)}
                                className={cn(
                                    "flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-200",
                                    isActive
                                        ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                                        : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                                )}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <Icon className="w-4 h-4" />
                                <span className="text-sm">{category.split(' ')[0]}</span>
                            </motion.button>
                        );
                    })}

                    {/* Sort Controls */}
                    <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden">
                        <select
                            value={filters.sortBy}
                            onChange={(e) => updateFilter('sortBy', e.target.value as FilterState['sortBy'])}
                            className="px-4 py-2 bg-transparent text-sm font-medium text-gray-700 dark:text-gray-300 focus:outline-none"
                        >
                            <option value="name">Name</option>
                            <option value="status">Status</option>
                            <option value="priority">Priority</option>
                            <option value="tier">Tier</option>
                            <option value="launchDate">Launch</option>
                        </select>

                        <button
                            onClick={() => updateFilter('sortDirection', filters.sortDirection === 'asc' ? 'desc' : 'asc')}
                            className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                        >
                            {filters.sortDirection === 'asc' ? (
                                <SortAsc className="w-4 h-4" />
                            ) : (
                                <SortDesc className="w-4 h-4" />
                            )}
                        </button>
                    </div>

                    {/* View Mode Toggle */}
                    <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden">
                        <button
                            onClick={() => onViewModeChange('grid')}
                            className={cn(
                                "p-3 transition-colors",
                                viewMode === 'grid'
                                    ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                            )}
                        >
                            <Grid className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => onViewModeChange('list')}
                            className={cn(
                                "p-3 transition-colors",
                                viewMode === 'list'
                                    ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                            )}
                        >
                            <List className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Advanced Filters Toggle */}
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className={cn(
                            "flex items-center gap-2 px-4 py-3 rounded-xl font-medium transition-all duration-200",
                            isExpanded
                                ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg"
                                : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                        )}
                    >
                        <Filter className="w-4 h-4" />
                        <span className="text-sm">Filters</span>
                        <ChevronDown className={cn(
                            "w-4 h-4 transition-transform duration-200",
                            isExpanded && "rotate-180"
                        )} />
                    </button>

                    {/* Clear Filters */}
                    {hasActiveFilters && (
                        <motion.button
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            onClick={clearFilters}
                            className="flex items-center gap-2 px-3 py-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-xl text-sm font-medium hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                        >
                            <X className="w-4 h-4" />
                            Clear
                        </motion.button>
                    )}
                </div>
            </div>

            {/* Advanced Filters Panel */}
            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className={cn(
                            "mt-4 p-6 rounded-2xl border backdrop-blur-sm",
                            theme === 'dark'
                                ? "bg-gray-900/90 border-gray-700/50"
                                : "bg-white/90 border-gray-200/50"
                        )}
                    >
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                            {/* Status Filters */}
                            <div>
                                <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                                    <Zap className="w-4 h-4 text-green-500" />
                                    Status
                                </h4>
                                <div className="space-y-2">
                                    {filterOptions.statuses.map(status => (
                                        <label key={status} className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={filters.status.includes(status)}
                                                onChange={() => toggleArrayFilter('status', status)}
                                                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                                            />
                                            <span className="text-sm text-gray-700 dark:text-gray-300 capitalize">
                                                {status}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Priority Filters */}
                            <div>
                                <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                                    <Star className="w-4 h-4 text-yellow-500" />
                                    Priority
                                </h4>
                                <div className="space-y-2">
                                    {filterOptions.priorities.map(priority => (
                                        <label key={priority} className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={filters.priority.includes(priority)}
                                                onChange={() => toggleArrayFilter('priority', priority)}
                                                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                                            />
                                            <span className={cn(
                                                "text-sm capitalize",
                                                priority === 'critical' && "text-red-500",
                                                priority === 'high' && "text-orange-500",
                                                priority === 'medium' && "text-yellow-500",
                                                priority === 'low' && "text-gray-500"
                                            )}>
                                                {priority}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Tier Filters */}
                            <div>
                                <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                                    <TrendingUp className="w-4 h-4 text-blue-500" />
                                    Tier
                                </h4>
                                <div className="space-y-2">
                                    {filterOptions.tiers.map(tier => (
                                        <label key={tier} className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={filters.tier.includes(tier)}
                                                onChange={() => toggleArrayFilter('tier', tier)}
                                                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                                            />
                                            <span className="text-sm text-gray-700 dark:text-gray-300">
                                                Tier {tier}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Tech Stack Filters */}
                            <div className="md:col-span-2">
                                <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                                    <Users className="w-4 h-4 text-purple-500" />
                                    Technologies
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                    {filterOptions.techStacks.slice(0, 20).map(tech => (
                                        <motion.button
                                            key={tech}
                                            onClick={() => toggleArrayFilter('techStack', tech)}
                                            className={cn(
                                                "px-3 py-1 text-xs rounded-md font-medium transition-all duration-200",
                                                filters.techStack.includes(tech)
                                                    ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md"
                                                    : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                                            )}
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                        >
                                            {tech}
                                        </motion.button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Results Summary */}
            <div className="flex items-center justify-between mt-4 text-sm text-gray-600 dark:text-gray-400">
                <span>
                    Showing {filteredProjects.length} of {projects.length} projects
                    {hasActiveFilters && " (filtered)"}
                </span>

                {filteredProjects.length > 0 && (
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                            <div className="w-2 h-2 bg-green-500 rounded-full" />
                            <span>{filteredProjects.filter(p => p.status === 'production').length} Production</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <div className="w-2 h-2 bg-blue-500 rounded-full" />
                            <span>{filteredProjects.filter(p => p.status === 'development').length} Development</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                            <span>{filteredProjects.filter(p => p.status === 'planned').length} Planned</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProjectFilterControls;