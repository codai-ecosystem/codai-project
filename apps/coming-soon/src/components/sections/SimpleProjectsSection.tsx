'use client';

import React, { useState, useEffect } from 'react';
import { codaiProjects, projectCategories } from '@/data/projects';
import type { Project } from '@/data/projects';
import { useTheme } from '@/contexts/ThemeContext';
import {
    ExternalLink,
    Star,
    Activity,
    Code,
    Globe,
    Building2,
    Brain,
    Database,
    ShoppingCart
} from 'lucide-react';

// Category information mapping
const categoryInfo = {
    'Foundation Services': {
        title: 'Foundation Services',
        description: 'Essential backbone services powering the entire ecosystem',
        icon: Building2,
        gradient: 'from-blue-600 via-purple-600 to-indigo-700'
    },
    'New Generation': {
        title: 'New Generation',
        description: 'Innovative market expansion and next-gen platforms',
        icon: Star,
        gradient: 'from-purple-500 via-pink-600 to-red-700'
    },
    'Infrastructure': {
        title: 'Infrastructure',
        description: 'Critical infrastructure services for ecosystem health',
        icon: Database,
        gradient: 'from-green-500 via-emerald-600 to-teal-700'
    },
    'Specialized Services': {
        title: 'Specialized Services',
        description: 'Unique value propositions and specialized solutions',
        icon: Brain,
        gradient: 'from-orange-500 via-amber-600 to-yellow-700'
    },
    'Emerging Platforms': {
        title: 'Emerging Platforms',
        description: 'Future innovation platforms and cutting-edge solutions',
        icon: Activity,
        gradient: 'from-cyan-500 via-blue-600 to-indigo-700'
    }
};

// SSR-safe Simple Project Card without complex animations
const SimpleProjectCard: React.FC<{ project: Project }> = ({ project }) => {
    const { theme } = useTheme();

    // Safe icon component rendering
    const IconComponent = project.icon;

    return (
        <div className={`p-6 rounded-xl border transition-all duration-300 hover:shadow-lg ${theme === 'dark'
            ? 'bg-slate-800/50 border-slate-700 hover:border-slate-600'
            : 'bg-white border-gray-200 hover:border-gray-300'
            }`}>
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg bg-gradient-to-br ${project.gradient}`}>
                        <IconComponent className="w-5 h-5 text-white" {...({} as any)} />
                    </div>
                    <div>
                        <h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            {project.name}
                        </h3>
                        <span className={`text-xs px-2 py-1 rounded-full ${project.status === 'production'
                            ? 'bg-green-100 text-green-600'
                            : project.status === 'development'
                                ? 'bg-blue-100 text-blue-600'
                                : 'bg-yellow-100 text-yellow-600'
                            }`}>
                            {project.status}
                        </span>
                    </div>
                </div>
            </div>

            {/* Description */}
            <p className={`text-sm mb-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                {project.description}
            </p>

            {/* Tech Stack */}
            <div className="flex flex-wrap gap-1 mb-4">
                {project.techStack?.slice(0, 4).map((tech) => (
                    <span key={tech} className={`text-xs px-2 py-1 rounded ${theme === 'dark' ? 'bg-slate-700 text-slate-300' : 'bg-gray-100 text-gray-700'
                        }`}>
                        {tech}
                    </span>
                ))}
                {project.techStack && project.techStack.length > 4 && (
                    <span className={`text-xs px-2 py-1 rounded ${theme === 'dark' ? 'bg-slate-600 text-slate-400' : 'bg-gray-200 text-gray-600'
                        }`}>
                        +{project.techStack.length - 4}
                    </span>
                )}
            </div>

            {/* Actions */}
            <div className="flex space-x-2">
                <a
                    href={`https://${project.domain}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`inline-flex items-center space-x-1 px-3 py-1.5 text-xs rounded-lg bg-gradient-to-r ${project.gradient} text-white hover:opacity-90 transition-opacity`}
                >
                    <Globe className="w-3 h-3" />
                    <span>Visit</span>
                </a>
            </div>
        </div>
    );
};

// SSR-safe Category Section
const SimpleCategorySection: React.FC<{
    category: { title: string; description: string; icon: React.ComponentType<any>; gradient: string; };
    projects: Project[];
}> = ({ category, projects }) => {
    const { theme } = useTheme();

    if (projects.length === 0) return null;

    const CategoryIcon = category.icon;

    return (
        <div className="mb-16">
            {/* Category Header */}
            <div className="text-center mb-8">
                <div className={`inline-flex items-center justify-center p-3 rounded-xl bg-gradient-to-br ${category.gradient} mb-4`}>
                    <CategoryIcon className="w-6 h-6 text-white" {...({} as any)} />
                </div>
                <h2 className={`text-3xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {category.title}
                </h2>
                <p className={`text-lg max-w-2xl mx-auto ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                    {category.description}
                </p>
                <div className={`inline-flex items-center space-x-2 mt-3 px-3 py-1 rounded-full text-sm ${theme === 'dark' ? 'bg-slate-800 text-white' : 'bg-gray-100 text-gray-900'
                    }`}>
                    <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${category.gradient}`} />
                    <span>{projects.length} Projects</span>
                </div>
            </div>

            {/* Projects Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {projects.map((project) => (
                    <SimpleProjectCard key={project.id} project={project} />
                ))}
            </div>
        </div>
    );
};

// Main Simple Projects Component - SSR Safe
export const SimpleProjectsSection: React.FC = () => {
    const { theme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Group projects by category
    const projectsByCategory = React.useMemo(() => {
        const grouped: Record<string, Project[]> = {};

        projectCategories.forEach((category) => {
            grouped[category] = codaiProjects.filter(project => project.category === category);
        });

        return grouped;
    }, []);

    const totalProjects = codaiProjects.length;
    const productionProjects = codaiProjects.filter(p => p.status === 'production').length;
    const developmentProjects = codaiProjects.filter(p => p.status === 'development').length;

    if (!mounted) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading projects...</p>
                </div>
            </div>
        );
    }

    return (
        <section className={`py-20 ${theme === 'dark'
            ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900'
            : 'bg-gradient-to-br from-gray-50 via-white to-blue-50/30'
            }`}>
            <div className="max-w-7xl mx-auto px-6">
                {/* Section Header */}
                <div className="text-center mb-16">
                    <h1 className={`text-5xl font-bold mb-6 ${theme === 'dark'
                        ? 'bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent'
                        : 'bg-gradient-to-r from-gray-900 to-blue-900 bg-clip-text text-transparent'
                        }`}>
                        Our Ecosystem
                    </h1>
                    <p className={`text-xl max-w-3xl mx-auto leading-relaxed mb-8 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                        }`}>
                        Discover our comprehensive suite of {totalProjects} AI-powered applications,
                        each designed to transform how you work, learn, and create.
                    </p>

                    {/* Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-2xl mx-auto">
                        <div className={`p-4 rounded-xl ${theme === 'dark' ? 'bg-slate-800/50' : 'bg-white/50'
                            } backdrop-blur-sm border ${theme === 'dark' ? 'border-slate-600' : 'border-gray-200'}`}>
                            <div className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                {totalProjects}
                            </div>
                            <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                Total Projects
                            </div>
                        </div>
                        <div className={`p-4 rounded-xl ${theme === 'dark' ? 'bg-slate-800/50' : 'bg-white/50'
                            } backdrop-blur-sm border ${theme === 'dark' ? 'border-slate-600' : 'border-gray-200'}`}>
                            <div className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                {productionProjects}
                            </div>
                            <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                Production Ready
                            </div>
                        </div>
                        <div className={`p-4 rounded-xl ${theme === 'dark' ? 'bg-slate-800/50' : 'bg-white/50'
                            } backdrop-blur-sm border ${theme === 'dark' ? 'border-slate-600' : 'border-gray-200'}`}>
                            <div className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                {developmentProjects}
                            </div>
                            <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                In Development
                            </div>
                        </div>
                    </div>

                    {/* Test React Button */}
                    <button
                        onClick={() => alert(`React is working! Found ${totalProjects} projects across ${projectCategories.length} categories.`)}
                        className="mt-8 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Test React & Project Count
                    </button>
                </div>

                {/* Category Sections */}
                {Object.entries(projectsByCategory).map(([categoryKey, projects]) => {
                    const catInfo = categoryInfo[categoryKey as keyof typeof categoryInfo];
                    if (!catInfo || projects.length === 0) return null;

                    return (
                        <SimpleCategorySection
                            key={categoryKey}
                            category={catInfo}
                            projects={projects}
                        />
                    );
                })}
            </div>
        </section>
    );
};