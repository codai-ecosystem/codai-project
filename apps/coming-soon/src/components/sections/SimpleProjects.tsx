'use client';

import React from 'react';
import { ArrowRight } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { codaiProjects } from '@/data/projects';

export const SimpleProjects: React.FC = () => {
    const { theme } = useTheme();

    return (
        <div className="relative py-20 bg-white dark:bg-gray-900">
            <div className="container mx-auto px-6">
                {/* Section Header */}
                <div className="text-center mb-16">
                    <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6">
                        Our{' '}
                        <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                            AI Applications
                        </span>
                    </h2>
                    <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
                        Discover 49+ specialized AI applications designed to transform various industries and workflows.
                    </p>
                </div>

                {/* Projects Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {codaiProjects.slice(0, 12).map((project) => (
                        <div
                            key={project.id}
                            className="group p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl border border-gray-200 dark:border-gray-700 transition-all duration-300 hover:scale-105"
                        >
                            {/* Project Icon */}
                            <div className={`w-12 h-12 mb-4 bg-gradient-to-r ${project.gradient} rounded-xl flex items-center justify-center text-white`}>
                                <project.icon />
                            </div>

                            {/* Project Info */}
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                                {project.name}
                            </h3>
                            <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">
                                {project.description}
                            </p>

                            {/* Status Badge */}
                            <div className="flex items-center justify-between">
                                <span className={`px-3 py-1 text-xs font-medium rounded-full ${project.status === 'production'
                                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                                    : project.status === 'beta'
                                        ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300'
                                        : project.status === 'development'
                                            ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                                            : 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300'
                                    }`}>
                                    {project.status}
                                </span>
                                <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors" />
                            </div>
                        </div>
                    ))}
                </div>

                {/* View All Projects Button */}
                <div className="text-center mt-16">
                    <button className="group inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                        View All {codaiProjects.length} Projects
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>
            </div>
        </div>
    );
};