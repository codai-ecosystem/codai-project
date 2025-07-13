/**
 * FabricAI Dashboard - Comprehensive AI Development Platform Dashboard
 * Advanced dashboard with AI development tools, code generation, workflows, and analytics
 */

'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Code,
    Cpu,
    Workflow,
    Bot,
    Sparkles,
    TrendingUp,
    TrendingDown,
    Users,
    FileCode,
    Zap,
    Clock,
    Database,
    Cloud,
    Terminal,
    Rocket,
    ArrowUpRight,
    ArrowDownRight,
    Play,
    Pause,
    Settings,
    Plus,
    ExternalLink,
    Copy,
    Eye,
    Star,
    AlertTriangle,
    CheckCircle,
    Info,
    Filter,
    Calendar,
    Search,
    BarChart3,
    PieChart,
    LineChart,
    Activity,
    Layers,
    Palette,
    Box,
    Globe,
    Shield,
    RefreshCw,
    Download,
    Upload,
    Share,
    Bookmark,
    Minus
} from 'lucide-react';
import {
    fabricAIService,
    CodeProject,
    AIWorkflow,
    AIModel,
    CodeTemplate,
    GenerationStats
} from '../lib/FabricAIService';

interface MetricCard {
    id: string;
    title: string;
    value: string | number;
    change: number;
    trend: 'up' | 'down' | 'stable';
    icon: any;
    color: string;
    description?: string;
}

const FabricAIDashboard: React.FC = () => {
    // State Management
    const [projects, setProjects] = useState<CodeProject[]>([]);
    const [workflows, setWorkflows] = useState<AIWorkflow[]>([]);
    const [models, setModels] = useState<AIModel[]>([]);
    const [templates, setTemplates] = useState<CodeTemplate[]>([]);
    const [stats, setStats] = useState<GenerationStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedTimeframe, setSelectedTimeframe] = useState('7d');
    const [activeView, setActiveView] = useState('overview');
    const [searchQuery, setSearchQuery] = useState('');
    const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

    // Initialize Dashboard
    useEffect(() => {
        initializeDashboard();

        // Setup real-time updates
        const interval = setInterval(() => {
            updateRealTimeData();
        }, 30000);

        return () => clearInterval(interval);
    }, [selectedTimeframe]);

    const initializeDashboard = async () => {
        setIsLoading(true);
        try {
            const [
                projectsData,
                workflowsData,
                modelsData,
                templatesData,
                statsData
            ] = await Promise.all([
                fabricAIService.getProjects(),
                fabricAIService.getWorkflows(),
                fabricAIService.getAIModels(),
                fabricAIService.getCodeTemplates(),
                fabricAIService.getGenerationStats()
            ]);

            setProjects(projectsData);
            setWorkflows(workflowsData);
            setModels(modelsData);
            setTemplates(templatesData);
            setStats(statsData);
            setLastUpdated(new Date());
        } catch (error) {
            console.error('Failed to initialize dashboard:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const updateRealTimeData = async () => {
        try {
            const updatedStats = await fabricAIService.getGenerationStats();
            setStats(updatedStats);
            setLastUpdated(new Date());
        } catch (error) {
            console.error('Failed to update real-time data:', error);
        }
    };

    // Helper Functions
    const formatNumber = (num: number): string => {
        if (num >= 1e6) return (num / 1e6).toFixed(1) + 'M';
        if (num >= 1e3) return (num / 1e3).toFixed(1) + 'K';
        return num.toString();
    };

    const formatTimeAgo = (date: Date): string => {
        const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
        if (seconds < 60) return `${seconds}s ago`;
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
        return `${Math.floor(seconds / 86400)}d ago`;
    };

    const getStatusColor = (status: string): string => {
        switch (status) {
            case 'ready':
            case 'completed':
            case 'success':
            case 'active':
                return 'text-green-400';
            case 'generating':
            case 'running':
            case 'pending':
                return 'text-yellow-400';
            case 'error':
            case 'failed':
                return 'text-red-400';
            case 'draft':
            case 'idle':
                return 'text-gray-400';
            default:
                return 'text-blue-400';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'ready':
            case 'completed':
            case 'success':
                return CheckCircle;
            case 'generating':
            case 'running':
                return Play;
            case 'error':
            case 'failed':
                return AlertTriangle;
            case 'pending':
            case 'idle':
                return Clock;
            default:
                return Info;
        }
    };

    // Generate Metrics
    const getMetrics = (): MetricCard[] => {
        if (!stats) return [];

        return [
            {
                id: 'total-projects',
                title: 'Total Projects',
                value: stats.totalProjects,
                change: 12.5,
                trend: 'up',
                icon: FileCode,
                color: 'purple',
                description: 'Active and completed projects'
            },
            {
                id: 'lines-generated',
                title: 'Lines Generated',
                value: formatNumber(stats.totalLines),
                change: 8.3,
                trend: 'up',
                icon: Code,
                color: 'blue',
                description: 'Total lines of code generated'
            },
            {
                id: 'ai-models',
                title: 'AI Models',
                value: models.filter(m => m.availability).length,
                change: 0,
                trend: 'stable',
                icon: Cpu,
                color: 'green',
                description: 'Available AI models'
            },
            {
                id: 'success-rate',
                title: 'Success Rate',
                value: `${stats.successRate.toFixed(1)}%`,
                change: 2.1,
                trend: 'up',
                icon: TrendingUp,
                color: 'emerald',
                description: 'Project completion rate'
            },
            {
                id: 'active-workflows',
                title: 'Active Workflows',
                value: workflows.filter(w => w.status === 'running').length,
                change: -5.2,
                trend: 'down',
                icon: Workflow,
                color: 'orange',
                description: 'Currently running workflows'
            },
            {
                id: 'avg-time',
                title: 'Avg. Generation Time',
                value: `${Math.round(stats.averageTime)}m`,
                change: -8.7,
                trend: 'down',
                icon: Clock,
                color: 'cyan',
                description: 'Average project generation time'
            }
        ];
    };

    if (isLoading) {
        return (
            <div className="min-h-[600px] flex items-center justify-center">
                <motion.div
                    className="text-center space-y-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                >
                    <motion.div
                        className="w-12 h-12 border-3 border-purple-500 border-t-transparent rounded-full mx-auto"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    />
                    <p className="text-gray-400">Loading AI development platform...</p>
                </motion.div>
            </div>
        );
    }

    const metrics = getMetrics();

    return (
        <div className="space-y-6">
            {/* Header */}
            <motion.div
                className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                        AI Development Platform
                    </h1>
                    <p className="text-gray-400 mt-1">
                        Generate, deploy, and manage AI-powered applications with advanced tools and workflows
                    </p>
                    <div className="flex items-center space-x-2 mt-2 text-sm text-gray-500">
                        <Activity className="w-4 h-4" />
                        <span>Last updated: {lastUpdated.toLocaleTimeString()}</span>
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                    </div>
                </div>

                <div className="flex items-center space-x-4">
                    {/* Quick Actions */}
                    <motion.button
                        className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <Plus className="w-4 h-4" />
                        <span>New Project</span>
                    </motion.button>

                    <motion.button
                        className="flex items-center space-x-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-all"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <Bot className="w-4 h-4" />
                        <span>AI Assistant</span>
                    </motion.button>
                </div>
            </motion.div>

            {/* Metrics Grid */}
            <motion.div
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
            >
                {metrics.map((metric, index) => {
                    const IconComponent = metric.icon;
                    const trendIcon = metric.trend === 'up' ? TrendingUp : metric.trend === 'down' ? TrendingDown : Minus;
                    const trendColor = metric.trend === 'up' ? 'text-green-400' : metric.trend === 'down' ? 'text-red-400' : 'text-gray-400';
                    const changeColor = metric.change > 0 ? 'text-green-400' : metric.change < 0 ? 'text-red-400' : 'text-gray-400';

                    return (
                        <motion.div
                            key={metric.id}
                            className="relative bg-gray-800/80 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6 hover:border-purple-500/30 transition-all duration-300 overflow-hidden"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            whileHover={{ y: -4 }}
                        >
                            {/* Background Gradient */}
                            <div className={`absolute inset-0 bg-gradient-to-br from-${metric.color}-500/10 to-transparent opacity-50`} />

                            {/* Content */}
                            <div className="relative">
                                {/* Header */}
                                <div className="flex items-center justify-between mb-4">
                                    <div className={`p-3 rounded-xl bg-${metric.color}-500/20`}>
                                        <IconComponent className={`w-6 h-6 text-${metric.color}-400`} />
                                    </div>
                                    <motion.div
                                        className={`flex items-center space-x-1 ${trendColor}`}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.3 }}
                                    >
                                        {React.createElement(trendIcon, { className: 'w-4 h-4' })}
                                        <span className={`text-sm font-medium ${changeColor}`}>
                                            {metric.change > 0 ? '+' : ''}{metric.change.toFixed(1)}%
                                        </span>
                                    </motion.div>
                                </div>

                                {/* Value */}
                                <motion.div
                                    className="space-y-2"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 }}
                                >
                                    <h3 className="text-2xl font-bold text-white">{metric.value}</h3>
                                    <p className="text-gray-300 font-medium">{metric.title}</p>
                                    {metric.description && (
                                        <p className="text-gray-400 text-sm">{metric.description}</p>
                                    )}
                                </motion.div>
                            </div>
                        </motion.div>
                    );
                })}
            </motion.div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Projects */}
                <motion.div
                    className="bg-gray-800/80 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                >
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
                            <FileCode className="w-5 h-5 text-purple-400" />
                            <span>Recent Projects</span>
                        </h3>
                        <motion.button
                            className="text-purple-400 hover:text-purple-300 transition-colors"
                            whileHover={{ scale: 1.05 }}
                        >
                            <ExternalLink className="w-4 h-4" />
                        </motion.button>
                    </div>

                    <div className="space-y-3">
                        {projects.slice(0, 5).map((project, index) => {
                            const StatusIcon = getStatusIcon(project.status);
                            return (
                                <motion.div
                                    key={project.id}
                                    className="flex items-center justify-between p-3 rounded-xl bg-gray-700/30 hover:bg-gray-700/50 transition-colors cursor-pointer"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.5 + index * 0.1 }}
                                    whileHover={{ x: 4 }}
                                >
                                    <div className="flex items-center space-x-3">
                                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center bg-${project.type === 'web' ? 'blue' : project.type === 'mobile' ? 'green' : 'purple'}-500/20`}>
                                            <StatusIcon className={`w-5 h-5 ${getStatusColor(project.status)}`} />
                                        </div>
                                        <div>
                                            <p className="text-white font-medium">{project.name}</p>
                                            <p className="text-gray-400 text-sm">{project.framework} • {project.complexity}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className={`font-medium ${getStatusColor(project.status)}`}>
                                            {project.status}
                                        </p>
                                        <p className="text-gray-400 text-sm">{formatTimeAgo(project.updatedAt)}</p>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </motion.div>

                {/* AI Models Status */}
                <motion.div
                    className="bg-gray-800/80 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                >
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
                            <Cpu className="w-5 h-5 text-blue-400" />
                            <span>AI Models</span>
                        </h3>
                        <motion.button
                            className="text-blue-400 hover:text-blue-300 transition-colors"
                            whileHover={{ scale: 1.05 }}
                        >
                            <Settings className="w-4 h-4" />
                        </motion.button>
                    </div>

                    <div className="space-y-3">
                        {models.slice(0, 5).map((model, index) => (
                            <motion.div
                                key={model.id}
                                className="flex items-center justify-between p-3 rounded-xl bg-gray-700/30 hover:bg-gray-700/50 transition-colors cursor-pointer"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5 + index * 0.1 }}
                                whileHover={{ x: 4 }}
                            >
                                <div className="flex items-center space-x-3">
                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${model.availability ? 'bg-green-500/20' : 'bg-red-500/20'
                                        }`}>
                                        <Cpu className={`w-5 h-5 ${model.availability ? 'text-green-400' : 'text-red-400'}`} />
                                    </div>
                                    <div>
                                        <p className="text-white font-medium">{model.name}</p>
                                        <p className="text-gray-400 text-sm">{model.type} • {model.provider}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className={`font-medium ${model.availability ? 'text-green-400' : 'text-red-400'}`}>
                                        {model.availability ? 'Online' : 'Offline'}
                                    </p>
                                    <p className="text-gray-400 text-sm">{model.performance.qualityScore}/100</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            </div>

            {/* Workflows and Templates */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Active Workflows */}
                <motion.div
                    className="bg-gray-800/80 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                >
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
                            <Workflow className="w-5 h-5 text-orange-400" />
                            <span>Active Workflows</span>
                        </h3>
                        <motion.button
                            className="text-orange-400 hover:text-orange-300 transition-colors"
                            whileHover={{ scale: 1.05 }}
                        >
                            <Play className="w-4 h-4" />
                        </motion.button>
                    </div>

                    <div className="space-y-3">
                        {workflows.slice(0, 4).map((workflow, index) => {
                            const StatusIcon = getStatusIcon(workflow.status);
                            return (
                                <motion.div
                                    key={workflow.id}
                                    className="flex items-center justify-between p-3 rounded-xl bg-gray-700/30 hover:bg-gray-700/50 transition-colors cursor-pointer"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.7 + index * 0.1 }}
                                    whileHover={{ x: 4 }}
                                >
                                    <div className="flex items-center space-x-3">
                                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center bg-orange-500/20`}>
                                            <StatusIcon className={`w-5 h-5 ${getStatusColor(workflow.status)}`} />
                                        </div>
                                        <div>
                                            <p className="text-white font-medium">{workflow.name}</p>
                                            <p className="text-gray-400 text-sm">{workflow.type} • {workflow.steps.length} steps</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className={`font-medium ${getStatusColor(workflow.status)}`}>
                                            {workflow.status}
                                        </p>
                                        <p className="text-gray-400 text-sm">{workflow.progress}%</p>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </motion.div>

                {/* Popular Templates */}
                <motion.div
                    className="bg-gray-800/80 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                >
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
                            <Layers className="w-5 h-5 text-cyan-400" />
                            <span>Popular Templates</span>
                        </h3>
                        <motion.button
                            className="text-cyan-400 hover:text-cyan-300 transition-colors"
                            whileHover={{ scale: 1.05 }}
                        >
                            <Star className="w-4 h-4" />
                        </motion.button>
                    </div>

                    <div className="space-y-3">
                        {templates.slice(0, 4).map((template, index) => (
                            <motion.div
                                key={template.id}
                                className="flex items-center justify-between p-3 rounded-xl bg-gray-700/30 hover:bg-gray-700/50 transition-colors cursor-pointer"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.7 + index * 0.1 }}
                                whileHover={{ x: 4 }}
                            >
                                <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 bg-cyan-500/20 rounded-lg flex items-center justify-center">
                                        <Code className="w-5 h-5 text-cyan-400" />
                                    </div>
                                    <div>
                                        <p className="text-white font-medium">{template.name}</p>
                                        <p className="text-gray-400 text-sm">{template.language} • {template.category}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-cyan-400 font-medium">{template.popularity}/100</p>
                                    <p className="text-gray-400 text-sm">{formatNumber(template.usage)} uses</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default FabricAIDashboard;
