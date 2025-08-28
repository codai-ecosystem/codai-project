'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { AnimatedSection } from '@/components/animations/AnimatedSection';
import {
    Search,
    Filter,
    ZoomIn,
    ZoomOut,
    RotateCcw,
    Settings,
    Play,
    Pause,
    SkipForward,
    Info,
    Layers,
    Network,
    Activity
} from 'lucide-react';

interface NodeData {
    id: string;
    name: string;
    description: string;
    tier: number;
    category: string;
    status: 'active' | 'development' | 'planning' | 'completed';
    priority: 'critical' | 'high' | 'medium' | 'low';
    connections: string[];
    metrics: {
        performance: number;
        stability: number;
        usage: number;
        growth: number;
    };
    lastUpdated: string;
}

interface InteractiveNodesProps {
    nodes: NodeData[];
    onNodeSelect?: (nodeId: string) => void;
    onNodeUpdate?: (nodeId: string, data: Partial<NodeData>) => void;
    className?: string;
}

const InteractiveNodes: React.FC<InteractiveNodesProps> = ({
    nodes,
    onNodeSelect,
    onNodeUpdate,
    className = ''
}) => {
    const { theme } = useTheme();
    const [selectedNode, setSelectedNode] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState<string>('all');
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [filterTier, setFilterTier] = useState<string>('all');
    const [isAnimationPlaying, setIsAnimationPlaying] = useState(true);
    const [animationSpeed, setAnimationSpeed] = useState(1);
    const [viewMode, setViewMode] = useState<'grid' | 'list' | 'network'>('grid');
    const [showMetrics, setShowMetrics] = useState(false);
    const [sortBy, setSortBy] = useState<'name' | 'tier' | 'status' | 'priority'>('tier');

    const scrollContainerRef = useRef<HTMLDivElement>(null);

    // Filter and sort nodes
    const filteredNodes = React.useMemo(() => {
        const filtered = nodes.filter(node => {
            const matchesSearch = node.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                node.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                node.category.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesCategory = filterCategory === 'all' || node.category === filterCategory;
            const matchesStatus = filterStatus === 'all' || node.status === filterStatus;
            const matchesTier = filterTier === 'all' || node.tier.toString() === filterTier;

            return matchesSearch && matchesCategory && matchesStatus && matchesTier;
        });

        // Sort nodes
        filtered.sort((a, b) => {
            switch (sortBy) {
                case 'name':
                    return a.name.localeCompare(b.name);
                case 'tier':
                    return a.tier - b.tier;
                case 'status':
                    const statusOrder = { completed: 0, active: 1, development: 2, planning: 3 };
                    return statusOrder[a.status] - statusOrder[b.status];
                case 'priority':
                    const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
                    return priorityOrder[a.priority] - priorityOrder[b.priority];
                default:
                    return 0;
            }
        });

        return filtered;
    }, [nodes, searchTerm, filterCategory, filterStatus, filterTier, sortBy]);

    // Get unique categories for filter
    const categories = React.useMemo(() => {
        const cats = [...new Set(nodes.map(node => node.category))];
        return cats.sort();
    }, [nodes]);

    // Handle node selection
    const handleNodeSelect = useCallback((nodeId: string) => {
        setSelectedNode(nodeId === selectedNode ? null : nodeId);
        onNodeSelect?.(nodeId);
    }, [selectedNode, onNodeSelect]);

    // Get status color
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'text-green-500';
            case 'development': return 'text-blue-500';
            case 'planning': return 'text-yellow-500';
            case 'completed': return 'text-purple-500';
            default: return 'text-gray-500';
        }
    };

    // Get priority color
    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'critical': return 'bg-red-500';
            case 'high': return 'bg-orange-500';
            case 'medium': return 'bg-yellow-500';
            case 'low': return 'bg-green-500';
            default: return 'bg-gray-500';
        }
    };

    // Metrics visualization component
    const MetricsBar: React.FC<{ value: number; label: string; color: string }> = ({ value, label, color }) => (
        <div className="flex items-center space-x-2 text-xs">
            <span className={`w-16 text-right ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                {label}:
            </span>
            <div className={`flex-1 h-2 rounded-full ${theme === 'dark' ? 'bg-slate-700' : 'bg-gray-200'
                }`}>
                <div
                    className={`h-full rounded-full transition-all duration-500 ${color}`}
                    style={{ width: `${value}%` }}
                />
            </div>
            <span className={`text-xs ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                {value}%
            </span>
        </div>
    );

    // Node card component
    const NodeCard: React.FC<{ node: NodeData; isSelected: boolean }> = ({ node, isSelected }) => (
        <AnimatedSection
            animationType="zoom-in"
            duration={0.3}
            delay={0}
            className={`group relative cursor-pointer transition-all duration-300 ${isSelected ? 'scale-105' : 'hover:scale-105'
                }`}
        >
            <div
                onClick={() => handleNodeSelect(node.id)}
                className={`relative overflow-hidden rounded-2xl border-2 p-4 backdrop-blur-sm transition-all duration-300 ${isSelected
                    ? 'border-blue-500 shadow-2xl'
                    : theme === 'dark'
                        ? 'border-slate-700 hover:border-slate-600 bg-slate-900/50'
                        : 'border-gray-200 hover:border-gray-300 bg-white/50'
                    } ${isAnimationPlaying ? 'animate-pulse' : ''}`}
                style={{
                    animationDuration: `${2 / animationSpeed}s`,
                    animationDelay: `${Math.random() * 2}s`
                }}
            >
                {/* Priority indicator */}
                <div className={`absolute top-2 right-2 w-3 h-3 rounded-full ${getPriorityColor(node.priority)}`} />

                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                    <div>
                        <h4 className={`font-bold text-sm mb-1 ${theme === 'dark' ? 'text-white' : 'text-gray-900'
                            }`}>
                            {node.name}
                        </h4>
                        <div className="flex items-center space-x-2">
                            <span className={`text-xs px-2 py-1 rounded-full ${theme === 'dark' ? 'bg-slate-700 text-slate-300' : 'bg-gray-100 text-gray-600'
                                }`}>
                                Tier {node.tier}
                            </span>
                            <span className={`text-xs font-semibold ${getStatusColor(node.status)}`}>
                                {node.status.charAt(0).toUpperCase() + node.status.slice(1)}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Description */}
                <p className={`text-xs mb-3 line-clamp-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                    {node.description}
                </p>

                {/* Category */}
                <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs mb-3 ${theme === 'dark'
                    ? 'bg-blue-900/50 text-blue-300'
                    : 'bg-blue-100 text-blue-700'
                    }`}>
                    <Layers className="w-3 h-3 mr-1" />
                    {node.category}
                </div>

                {/* Metrics */}
                {showMetrics && (
                    <div className="space-y-1 mb-3">
                        <MetricsBar value={node.metrics.performance} label="Perf" color="bg-blue-500" />
                        <MetricsBar value={node.metrics.stability} label="Stab" color="bg-green-500" />
                        <MetricsBar value={node.metrics.usage} label="Usage" color="bg-yellow-500" />
                        <MetricsBar value={node.metrics.growth} label="Growth" color="bg-purple-500" />
                    </div>
                )}

                {/* Connections */}
                <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-1">
                        <Network className="w-3 h-3" />
                        <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                            {node.connections.length} connections
                        </span>
                    </div>
                    <span className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                        {node.lastUpdated}
                    </span>
                </div>

                {/* Hover overlay */}
                <div className={`absolute inset-0 rounded-2xl transition-opacity duration-300 opacity-0 group-hover:opacity-100 ${theme === 'dark'
                    ? 'bg-gradient-to-br from-blue-900/20 to-purple-900/20'
                    : 'bg-gradient-to-br from-blue-100/30 to-purple-100/30'
                    }`} />
            </div>
        </AnimatedSection>
    );

    return (
        <div className={`w-full h-full flex flex-col ${className}`}>
            {/* Controls Panel */}
            <div className={`flex flex-wrap items-center gap-4 p-4 border-b ${theme === 'dark'
                ? 'border-slate-700 bg-slate-900/50'
                : 'border-gray-200 bg-white/50'
                } backdrop-blur-sm`}>
                {/* Search */}
                <div className="relative flex-1 min-w-64">
                    <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                        }`} />
                    <input
                        type="text"
                        placeholder="Search nodes..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className={`w-full pl-10 pr-4 py-2 text-sm rounded-lg border transition-colors ${theme === 'dark'
                            ? 'bg-slate-800 border-slate-600 text-white placeholder-gray-400'
                            : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                            } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    />
                </div>

                {/* Filters */}
                <div className="flex items-center space-x-2">
                    <Filter className={`w-4 h-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />

                    <select
                        value={filterCategory}
                        onChange={(e) => setFilterCategory(e.target.value)}
                        className={`px-3 py-2 text-sm rounded-lg border ${theme === 'dark'
                            ? 'bg-slate-800 border-slate-600 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                            } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    >
                        <option value="all">All Categories</option>
                        {categories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>

                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className={`px-3 py-2 text-sm rounded-lg border ${theme === 'dark'
                            ? 'bg-slate-800 border-slate-600 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                            } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    >
                        <option value="all">All Status</option>
                        <option value="active">Active</option>
                        <option value="development">Development</option>
                        <option value="planning">Planning</option>
                        <option value="completed">Completed</option>
                    </select>

                    <select
                        value={filterTier}
                        onChange={(e) => setFilterTier(e.target.value)}
                        className={`px-3 py-2 text-sm rounded-lg border ${theme === 'dark'
                            ? 'bg-slate-800 border-slate-600 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                            } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    >
                        <option value="all">All Tiers</option>
                        <option value="1">Tier 1</option>
                        <option value="2">Tier 2</option>
                        <option value="3">Tier 3</option>
                        <option value="4">Tier 4</option>
                        <option value="5">Tier 5</option>
                    </select>
                </div>

                {/* View Controls */}
                <div className="flex items-center space-x-2">
                    <button
                        onClick={() => setShowMetrics(!showMetrics)}
                        className={`p-2 rounded-lg transition-colors ${showMetrics
                            ? 'bg-blue-500 text-white'
                            : theme === 'dark'
                                ? 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                        title="Toggle Metrics"
                    >
                        <Activity className="w-4 h-4" />
                    </button>

                    <button
                        onClick={() => setIsAnimationPlaying(!isAnimationPlaying)}
                        className={`p-2 rounded-lg transition-colors ${theme === 'dark'
                            ? 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                        title={isAnimationPlaying ? 'Pause Animation' : 'Play Animation'}
                    >
                        {isAnimationPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    </button>

                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as any)}
                        className={`px-3 py-2 text-sm rounded-lg border ${theme === 'dark'
                            ? 'bg-slate-800 border-slate-600 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                            } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    >
                        <option value="tier">Sort by Tier</option>
                        <option value="name">Sort by Name</option>
                        <option value="status">Sort by Status</option>
                        <option value="priority">Sort by Priority</option>
                    </select>
                </div>
            </div>

            {/* Results Summary */}
            <div className={`px-4 py-2 border-b text-sm ${theme === 'dark'
                ? 'border-slate-700 text-gray-400 bg-slate-900/30'
                : 'border-gray-200 text-gray-600 bg-gray-50/30'
                }`}>
                Showing {filteredNodes.length} of {nodes.length} nodes
                {selectedNode && (
                    <span className="ml-4 text-blue-500">
                        • Selected: {nodes.find(n => n.id === selectedNode)?.name}
                    </span>
                )}
            </div>

            {/* Nodes Grid */}
            <div
                ref={scrollContainerRef}
                className="flex-1 overflow-auto p-4"
            >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {filteredNodes.map((node, index) => (
                        <NodeCard
                            key={node.id}
                            node={node}
                            isSelected={selectedNode === node.id}
                        />
                    ))}
                </div>

                {filteredNodes.length === 0 && (
                    <div className={`text-center py-12 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                        <Info className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>No nodes match your current filters.</p>
                        <p className="text-sm mt-2">Try adjusting your search or filter criteria.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default InteractiveNodes;