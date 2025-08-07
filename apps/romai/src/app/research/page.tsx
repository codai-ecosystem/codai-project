'use client';

import React from 'react'
/**
 * Research Lab Page - AI Research & Development
 * Advanced AI research tools and experiments
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface ResearchProject {
    id: string;
    name: string;
    description: string;
    status: 'active' | 'completed' | 'planned';
    progress: number;
    lead_researcher: string;
    last_updated: string;
    metrics: {
        papers_published: number;
        experiments_completed: number;
        breakthrough_score: number;
    };
}

interface ExperimentResult {
    experiment_name: string;
    accuracy_improvement: number;
    performance_gain: number;
    date_completed: string;
    significance: 'low' | 'medium' | 'high' | 'breakthrough';
}

const ResearchLabPage = () => {
    const [researchProjects, setResearchProjects] = useState<ResearchProject[]>([]);
    const [experimentResults, setExperimentResults] = useState<ExperimentResult[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedProject, setSelectedProject] = useState<string | null>(null);

    useEffect(() => {
        const fetchResearchData = async () => {
            try {
                const [projectsRes, resultsRes] = await Promise.all([
                    fetch('http://localhost:6101/research/projects'),
                    fetch('http://localhost:6101/research/experiments')
                ]);

                if (!projectsRes.ok || !resultsRes.ok) {
                    // Fallback to mock data if endpoints don't exist
                    setResearchProjects([
                        {
                            id: 'advanced-reasoning',
                            name: 'Advanced Reasoning Enhancement',
                            description: 'Developing next-generation reasoning capabilities for complex problem solving',
                            status: 'active',
                            progress: 73,
                            lead_researcher: 'Dr. Maria Popescu',
                            last_updated: new Date().toISOString(),
                            metrics: {
                                papers_published: 3,
                                experiments_completed: 47,
                                breakthrough_score: 8.2
                            }
                        },
                        {
                            id: 'romanian-cultural-ai',
                            name: 'Romanian Cultural Intelligence',
                            description: 'Enhancing AI understanding of Romanian culture, traditions, and social context',
                            status: 'active',
                            progress: 68,
                            lead_researcher: 'Prof. Alexandru Ionescu',
                            last_updated: new Date().toISOString(),
                            metrics: {
                                papers_published: 2,
                                experiments_completed: 31,
                                breakthrough_score: 7.8
                            }
                        },
                        {
                            id: 'quantum-consciousness',
                            name: 'Quantum Consciousness Simulation',
                            description: 'Exploring quantum-inspired consciousness models for AGI systems',
                            status: 'planned',
                            progress: 15,
                            lead_researcher: 'Dr. Cristina Vlaicu',
                            last_updated: new Date().toISOString(),
                            metrics: {
                                papers_published: 1,
                                experiments_completed: 8,
                                breakthrough_score: 9.5
                            }
                        }
                    ]);

                    setExperimentResults([
                        {
                            experiment_name: 'Multi-hop Reasoning Enhancement',
                            accuracy_improvement: 23.7,
                            performance_gain: 18.3,
                            date_completed: '2025-08-05',
                            significance: 'high'
                        },
                        {
                            experiment_name: 'Romanian Dialectal Processing',
                            accuracy_improvement: 15.2,
                            performance_gain: 12.1,
                            date_completed: '2025-08-03',
                            significance: 'medium'
                        },
                        {
                            experiment_name: 'Causal Reasoning Framework',
                            accuracy_improvement: 31.8,
                            performance_gain: 27.4,
                            date_completed: '2025-08-01',
                            significance: 'breakthrough'
                        }
                    ]);
                } else {
                    const [projects, results] = await Promise.all([
                        projectsRes.json(),
                        resultsRes.json()
                    ]);
                    setResearchProjects(projects);
                    setExperimentResults(results);
                }

                setError(null);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to fetch research data');
            } finally {
                setLoading(false);
            }
        };

        fetchResearchData();
    }, []);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300';
            case 'completed': return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300';
            case 'planned': return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300';
            default: return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300';
        }
    };

    const getSignificanceColor = (significance: string) => {
        switch (significance) {
            case 'breakthrough': return 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300';
            case 'high': return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300';
            case 'medium': return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300';
            case 'low': return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300';
            default: return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300';
        }
    };

    if (loading) {
        return (
            <div className="p-6">
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="text-center">
                        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-lg font-medium text-gray-700 dark:text-gray-300">
                            Loading Research Lab...
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            {/* Page Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center space-x-3">
                    <span>🔬</span>
                    <span>Research Lab</span>
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                    Advanced AI research, experiments, and breakthrough discoveries
                </p>
            </div>

            {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                    <p className="text-red-800 dark:text-red-400">{error}</p>
                </div>
            )}

            {/* Research Projects */}
            <motion.div
                className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                    🚀 Active Research Projects
                </h2>

                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    {researchProjects.map((project) => (
                        <motion.div
                            key={project.id}
                            className={`
                p-4 rounded-lg border-2 transition-all cursor-pointer
                ${selectedProject === project.id
                                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                    : 'border-gray-200 dark:border-slate-600 hover:border-gray-300 dark:hover:border-slate-500'
                                }
              `}
                            onClick={() => setSelectedProject(selectedProject === project.id ? null : project.id)}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="font-semibold text-gray-900 dark:text-white">
                                    {project.name}
                                </h3>
                                <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(project.status)}`}>
                                    {project.status}
                                </span>
                            </div>

                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                                {project.description}
                            </p>

                            {/* Progress Bar */}
                            <div className="mb-4">
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="text-gray-600 dark:text-gray-400">Progress</span>
                                    <span className="font-medium text-gray-900 dark:text-white">{project.progress}%</span>
                                </div>
                                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                    <div
                                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                        style={{ width: `${project.progress}%` }}
                                    ></div>
                                </div>
                            </div>

                            {/* Metrics */}
                            <div className="grid grid-cols-3 gap-2 text-center">
                                <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Papers</p>
                                    <p className="font-bold text-gray-900 dark:text-white">{project.metrics.papers_published}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Experiments</p>
                                    <p className="font-bold text-gray-900 dark:text-white">{project.metrics.experiments_completed}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Score</p>
                                    <p className="font-bold text-gray-900 dark:text-white">{project.metrics.breakthrough_score}</p>
                                </div>
                            </div>

                            <div className="mt-3 pt-3 border-t border-gray-200 dark:border-slate-600">
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    Lead: {project.lead_researcher}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </motion.div>

            {/* Recent Experiment Results */}
            <motion.div
                className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
            >
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                    🧪 Recent Experiment Results
                </h2>

                <div className="space-y-4">
                    {experimentResults.map((result, index) => (
                        <motion.div
                            key={index}
                            className="p-4 bg-gray-50 dark:bg-slate-700 rounded-lg"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="font-semibold text-gray-900 dark:text-white">
                                    {result.experiment_name}
                                </h3>
                                <span className={`px-2 py-1 text-xs rounded-full ${getSignificanceColor(result.significance)}`}>
                                    {result.significance}
                                </span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="text-center p-3 bg-white dark:bg-slate-800 rounded">
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Accuracy Improvement</p>
                                    <p className="text-lg font-bold text-green-600 dark:text-green-400">
                                        +{result.accuracy_improvement}%
                                    </p>
                                </div>

                                <div className="text-center p-3 bg-white dark:bg-slate-800 rounded">
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Performance Gain</p>
                                    <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                                        +{result.performance_gain}%
                                    </p>
                                </div>

                                <div className="text-center p-3 bg-white dark:bg-slate-800 rounded">
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Completed</p>
                                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                                        {new Date(result.date_completed).toLocaleDateString('ro-RO')}
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </motion.div>

            {/* Research Insights */}
            <motion.div
                className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
            >
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                    💡 Research Insights & Next Steps
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                            Current Focus Areas
                        </h3>
                        <ul className="space-y-2">
                            <li className="flex items-center space-x-3">
                                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                                <span className="text-gray-700 dark:text-gray-300">Advanced multi-step reasoning</span>
                            </li>
                            <li className="flex items-center space-x-3">
                                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                                <span className="text-gray-700 dark:text-gray-300">Romanian cultural context modeling</span>
                            </li>
                            <li className="flex items-center space-x-3">
                                <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                                <span className="text-gray-700 dark:text-gray-300">Quantum-inspired consciousness</span>
                            </li>
                            <li className="flex items-center space-x-3">
                                <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                                <span className="text-gray-700 dark:text-gray-300">Self-improving algorithms</span>
                            </li>
                        </ul>
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                            Upcoming Milestones
                        </h3>
                        <div className="space-y-3">
                            <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded">
                                <p className="font-medium text-yellow-800 dark:text-yellow-300">Q3 2025</p>
                                <p className="text-sm text-yellow-700 dark:text-yellow-400">
                                    Advanced reasoning benchmark: 85% target
                                </p>
                            </div>
                            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded">
                                <p className="font-medium text-blue-800 dark:text-blue-300">Q4 2025</p>
                                <p className="text-sm text-blue-700 dark:text-blue-400">
                                    Romanian cultural excellence: 90% accuracy
                                </p>
                            </div>
                            <div className="p-3 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded">
                                <p className="font-medium text-purple-800 dark:text-purple-300">Q1 2026</p>
                                <p className="text-sm text-purple-700 dark:text-purple-400">
                                    Quantum consciousness integration
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default ResearchLabPage;

