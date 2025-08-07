'use client';

import React, { useState } from 'react';
import {
    BarChart3,
    Database,
    Search,
    Brain,
    Zap,
    Clock,
    TrendingUp,
    TrendingDown,
    Activity,
    FileText,
    Eye,
    Download,
    Upload,
    RefreshCw,
    Filter,
    MoreVertical,
    Plus,
    Edit3,
    Trash2,
    Star,
    Bookmark,
    Tag,
    User,
    Calendar,
    Globe,
    Smartphone,
    Monitor,
    MapPin,
    AlertTriangle,
    CheckCircle,
    XCircle,
    Info,
    Layers,
    Network,
    Target,
    Cpu,
    HardDrive,
    Wifi,
    PieChart,
    LineChart,
    Archive,
    FolderOpen,
    Link,
    Share2,
    Copy,
    ExternalLink,
    Settings,
    Bell,
    Shield,
    Lock
} from 'lucide-react';

interface MemoryMetric {
    name: string;
    value: string;
    change: number;
    trend: 'up' | 'down' | 'stable';
    status: 'good' | 'warning' | 'critical';
    description: string;
}

interface MemoryCollection {
    id: string;
    name: string;
    description: string;
    memoryCount: number;
    size: string;
    lastAccessed: string;
    accessCount: number;
    averageRelevance: number;
    tags: string[];
    isPublic: boolean;
    owner: string;
}

interface RecentActivity {
    id: string;
    type: 'memory_created' | 'memory_updated' | 'search_performed' | 'collection_shared' | 'api_call' | 'export_generated';
    description: string;
    timestamp: string;
    user: string;
    metadata?: Record<string, any>;
}

interface SearchTrend {
    query: string;
    count: number;
    successRate: number;
    averageRelevance: number;
    lastUsed: string;
}

interface ApiMetric {
    endpoint: string;
    calls: number;
    successRate: number;
    avgResponseTime: number;
    lastCalled: string;
}

export default function MemorAIDashboard() {
    const [timeRange, setTimeRange] = useState('7d');
    const [selectedMetric, setSelectedMetric] = useState<string | null>(null);

    const memoryMetrics: MemoryMetric[] = [
        {
            name: 'Total Memories',
            value: '89,247',
            change: 12.5,
            trend: 'up',
            status: 'good',
            description: 'Total number of stored memories across all collections'
        },
        {
            name: 'Vector Embeddings',
            value: '156,982',
            change: 8.3,
            trend: 'up',
            status: 'good',
            description: 'AI-generated embeddings for semantic search'
        },
        {
            name: 'Storage Used',
            value: '2.4 TB',
            change: 5.7,
            trend: 'up',
            status: 'warning',
            description: 'Total storage consumed by memory data'
        },
        {
            name: 'Search Accuracy',
            value: '94.7%',
            change: 2.1,
            trend: 'up',
            status: 'good',
            description: 'Average semantic search relevance score'
        },
        {
            name: 'API Calls Today',
            value: '45,123',
            change: -3.2,
            trend: 'down',
            status: 'good',
            description: 'API requests processed in the last 24 hours'
        },
        {
            name: 'Active Collections',
            value: '1,247',
            change: 15.8,
            trend: 'up',
            status: 'good',
            description: 'Collections with recent activity'
        }
    ];

    const topCollections: MemoryCollection[] = [
        {
            id: '1',
            name: 'Product Knowledge Base',
            description: 'Comprehensive product information and documentation',
            memoryCount: 12450,
            size: '890 MB',
            lastAccessed: '5 minutes ago',
            accessCount: 2847,
            averageRelevance: 0.92,
            tags: ['product', 'documentation', 'knowledge'],
            isPublic: true,
            owner: 'Product Team'
        },
        {
            id: '2',
            name: 'Customer Support Archive',
            description: 'Historical customer support conversations and solutions',
            memoryCount: 8932,
            size: '567 MB',
            lastAccessed: '12 minutes ago',
            accessCount: 1923,
            averageRelevance: 0.88,
            tags: ['support', 'customer', 'archive'],
            isPublic: false,
            owner: 'Support Team'
        },
        {
            id: '3',
            name: 'Research Papers Collection',
            description: 'Academic research and technical publications',
            memoryCount: 5678,
            size: '1.2 GB',
            lastAccessed: '1 hour ago',
            accessCount: 1456,
            averageRelevance: 0.95,
            tags: ['research', 'academic', 'technical'],
            isPublic: true,
            owner: 'Research Team'
        },
        {
            id: '4',
            name: 'Code Repository Insights',
            description: 'Code documentation and development insights',
            memoryCount: 7234,
            size: '423 MB',
            lastAccessed: '2 hours ago',
            accessCount: 1789,
            averageRelevance: 0.87,
            tags: ['code', 'development', 'documentation'],
            isPublic: false,
            owner: 'Engineering Team'
        }
    ];

    const recentActivity: RecentActivity[] = [
        {
            id: '1',
            type: 'memory_created',
            description: 'Added 45 new memories to "Product Knowledge Base"',
            timestamp: '2 minutes ago',
            user: 'Alice Johnson',
            metadata: { collectionId: '1', memoryCount: 45 }
        },
        {
            id: '2',
            type: 'search_performed',
            description: 'Semantic search: "authentication best practices"',
            timestamp: '8 minutes ago',
            user: 'John Smith',
            metadata: { query: 'authentication best practices', results: 23, relevance: 0.91 }
        },
        {
            id: '3',
            type: 'api_call',
            description: 'API query processed with 89% relevance',
            timestamp: '12 minutes ago',
            user: 'System API',
            metadata: { endpoint: '/api/v1/search', responseTime: '145ms' }
        },
        {
            id: '4',
            type: 'collection_shared',
            description: 'Shared "Research Papers Collection" with 5 team members',
            timestamp: '25 minutes ago',
            user: 'Sarah Wilson',
            metadata: { collectionId: '3', sharedWith: 5 }
        },
        {
            id: '5',
            type: 'memory_updated',
            description: 'Updated memory embeddings for improved search accuracy',
            timestamp: '1 hour ago',
            user: 'System Process',
            metadata: { updatedMemories: 127, improvements: '3.2% accuracy gain' }
        }
    ];

    const searchTrends: SearchTrend[] = [
        {
            query: 'authentication methods',
            count: 234,
            successRate: 94.2,
            averageRelevance: 0.89,
            lastUsed: '5 minutes ago'
        },
        {
            query: 'API documentation',
            count: 189,
            successRate: 91.5,
            averageRelevance: 0.87,
            lastUsed: '12 minutes ago'
        },
        {
            query: 'security best practices',
            count: 156,
            successRate: 96.8,
            averageRelevance: 0.93,
            lastUsed: '18 minutes ago'
        },
        {
            query: 'database optimization',
            count: 134,
            successRate: 88.1,
            averageRelevance: 0.85,
            lastUsed: '34 minutes ago'
        },
        {
            query: 'user management',
            count: 123,
            successRate: 92.7,
            averageRelevance: 0.90,
            lastUsed: '45 minutes ago'
        }
    ];

    const apiMetrics: ApiMetric[] = [
        {
            endpoint: '/api/v1/search',
            calls: 15678,
            successRate: 98.5,
            avgResponseTime: 142,
            lastCalled: '1 minute ago'
        },
        {
            endpoint: '/api/v1/memories',
            calls: 8934,
            successRate: 99.2,
            avgResponseTime: 89,
            lastCalled: '3 minutes ago'
        },
        {
            endpoint: '/api/v1/collections',
            calls: 5623,
            successRate: 97.8,
            avgResponseTime: 156,
            lastCalled: '8 minutes ago'
        },
        {
            endpoint: '/api/v1/embeddings',
            calls: 3456,
            successRate: 96.1,
            avgResponseTime: 234,
            lastCalled: '15 minutes ago'
        }
    ];

    const getActivityIcon = (type: string) => {
        switch (type) {
            case 'memory_created': return <Plus className="w-4 h-4 text-green-600" />;
            case 'memory_updated': return <Edit3 className="w-4 h-4 text-blue-600" />;
            case 'search_performed': return <Search className="w-4 h-4 text-purple-600" />;
            case 'collection_shared': return <Share2 className="w-4 h-4 text-orange-600" />;
            case 'api_call': return <Zap className="w-4 h-4 text-indigo-600" />;
            case 'export_generated': return <Download className="w-4 h-4 text-gray-600" />;
            default: return <Activity className="w-4 h-4 text-gray-600" />;
        }
    };

    const getMetricIcon = (name: string) => {
        switch (name) {
            case 'Total Memories': return <Database className="w-6 h-6 text-blue-600" />;
            case 'Vector Embeddings': return <Brain className="w-6 h-6 text-purple-600" />;
            case 'Storage Used': return <HardDrive className="w-6 h-6 text-orange-600" />;
            case 'Search Accuracy': return <Target className="w-6 h-6 text-green-600" />;
            case 'API Calls Today': return <Zap className="w-6 h-6 text-indigo-600" />;
            case 'Active Collections': return <FolderOpen className="w-6 h-6 text-red-600" />;
            default: return <BarChart3 className="w-6 h-6 text-gray-600" />;
        }
    };

    const getTrendIcon = (trend: string) => {
        switch (trend) {
            case 'up': return <TrendingUp className="w-4 h-4 text-green-600" />;
            case 'down': return <TrendingDown className="w-4 h-4 text-red-600" />;
            default: return <Activity className="w-4 h-4 text-gray-600" />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'good': return 'text-green-600';
            case 'warning': return 'text-yellow-600';
            case 'critical': return 'text-red-600';
            default: return 'text-gray-600';
        }
    };

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">MemorAI Dashboard</h1>
                    <p className="text-gray-600 mt-1">
                        AI-powered memory management with vector search and intelligent insights
                    </p>
                </div>

                <div className="flex items-center space-x-3">
                    <select
                        value={timeRange}
                        onChange={(e) => setTimeRange(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        <option value="1d">Last 24 hours</option>
                        <option value="7d">Last 7 days</option>
                        <option value="30d">Last 30 days</option>
                        <option value="90d">Last 90 days</option>
                    </select>
                    <button className="flex items-center px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Refresh
                    </button>
                    <button className="flex items-center px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700">
                        <Plus className="w-4 h-4 mr-2" />
                        New Memory
                    </button>
                </div>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
                {memoryMetrics.map((metric, index) => (
                    <div
                        key={index}
                        className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
                        onClick={() => setSelectedMetric(selectedMetric === metric.name ? null : metric.name)}
                    >
                        <div className="flex items-center justify-between mb-4">
                            {getMetricIcon(metric.name)}
                            <div className="flex items-center space-x-1">
                                {getTrendIcon(metric.trend)}
                                <span className={`text-sm font-medium ${metric.change > 0 ? 'text-green-600' :
                                        metric.change < 0 ? 'text-red-600' : 'text-gray-600'
                                    }`}>
                                    {metric.change > 0 ? '+' : ''}{metric.change}%
                                </span>
                            </div>
                        </div>

                        <div className="text-2xl font-bold text-gray-900 mb-1">{metric.value}</div>
                        <div className="text-sm font-medium text-gray-700 mb-2">{metric.name}</div>

                        {selectedMetric === metric.name && (
                            <div className="text-xs text-gray-500 mt-3 p-2 bg-gray-50 rounded">
                                {metric.description}
                            </div>
                        )}

                        <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${metric.status === 'good' ? 'bg-green-100 text-green-800' :
                                metric.status === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-red-100 text-red-800'
                            }`}>
                            {metric.status}
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top Collections */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                    <div className="p-6 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-semibold text-gray-900">Top Collections</h2>
                            <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                                View All
                            </button>
                        </div>
                    </div>

                    <div className="divide-y divide-gray-200">
                        {topCollections.map((collection) => (
                            <div key={collection.id} className="p-4 hover:bg-gray-50">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center space-x-2 mb-1">
                                            <h3 className="text-sm font-medium text-gray-900">{collection.name}</h3>
                                            {collection.isPublic ? (
                                                <Globe className="w-3 h-3 text-green-600" title="Public" />
                                            ) : (
                                                <Lock className="w-3 h-3 text-gray-600" title="Private" />
                                            )}
                                        </div>
                                        <p className="text-xs text-gray-600 mb-2">{collection.description}</p>

                                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                                            <span>{collection.memoryCount.toLocaleString()} memories</span>
                                            <span>{collection.size}</span>
                                            <span>{collection.accessCount} accesses</span>
                                            <span>{(collection.averageRelevance * 100).toFixed(1)}% relevance</span>
                                        </div>

                                        <div className="flex items-center space-x-1 mt-2">
                                            {collection.tags.slice(0, 3).map((tag, index) => (
                                                <span key={index} className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                                    {tag}
                                                </span>
                                            ))}
                                            {collection.tags.length > 3 && (
                                                <span className="text-xs text-gray-500">+{collection.tags.length - 3} more</span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-center space-x-1 ml-4">
                                        <button className="p-1 text-gray-400 hover:text-gray-600">
                                            <Eye className="w-4 h-4" />
                                        </button>
                                        <button className="p-1 text-gray-400 hover:text-gray-600">
                                            <Edit3 className="w-4 h-4" />
                                        </button>
                                        <button className="p-1 text-gray-400 hover:text-gray-600">
                                            <MoreVertical className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                                    <span>Last accessed {collection.lastAccessed}</span>
                                    <span>by {collection.owner}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                    <div className="p-6 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
                            <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                                View All
                            </button>
                        </div>
                    </div>

                    <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
                        {recentActivity.map((activity) => (
                            <div key={activity.id} className="p-4 hover:bg-gray-50">
                                <div className="flex items-start space-x-3">
                                    <div className="flex-shrink-0 mt-1">
                                        {getActivityIcon(activity.type)}
                                    </div>

                                    <div className="flex-1">
                                        <p className="text-sm text-gray-900">{activity.description}</p>
                                        <div className="flex items-center space-x-2 mt-1 text-xs text-gray-500">
                                            <span>{activity.timestamp}</span>
                                            <span>•</span>
                                            <span>{activity.user}</span>
                                        </div>

                                        {activity.metadata && (
                                            <div className="mt-2 text-xs text-gray-600">
                                                {activity.type === 'search_performed' && (
                                                    <span>Found {activity.metadata.results} results with {(activity.metadata.relevance * 100).toFixed(1)}% relevance</span>
                                                )}
                                                {activity.type === 'api_call' && (
                                                    <span>Response time: {activity.metadata.responseTime}</span>
                                                )}
                                                {activity.type === 'collection_shared' && (
                                                    <span>Shared with {activity.metadata.sharedWith} team members</span>
                                                )}
                                                {activity.type === 'memory_updated' && (
                                                    <span>{activity.metadata.improvements}</span>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Search Trends */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                    <div className="p-6 border-b border-gray-200">
                        <h2 className="text-lg font-semibold text-gray-900">Popular Searches</h2>
                    </div>

                    <div className="p-6">
                        <div className="space-y-4">
                            {searchTrends.map((trend, index) => (
                                <div key={index} className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-6 h-6 bg-purple-100 text-purple-800 rounded-full flex items-center justify-center text-xs font-medium">
                                            {index + 1}
                                        </div>
                                        <div>
                                            <div className="text-sm font-medium text-gray-900">"{trend.query}"</div>
                                            <div className="text-xs text-gray-500">
                                                {trend.count} searches • {trend.successRate}% success rate
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-sm font-medium text-gray-900">
                                            {(trend.averageRelevance * 100).toFixed(1)}%
                                        </div>
                                        <div className="text-xs text-gray-500">relevance</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* API Performance */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                    <div className="p-6 border-b border-gray-200">
                        <h2 className="text-lg font-semibold text-gray-900">API Performance</h2>
                    </div>

                    <div className="p-6">
                        <div className="space-y-4">
                            {apiMetrics.map((api, index) => (
                                <div key={index} className="flex items-center justify-between">
                                    <div>
                                        <div className="text-sm font-medium text-gray-900">{api.endpoint}</div>
                                        <div className="text-xs text-gray-500">
                                            {api.calls.toLocaleString()} calls • Last called {api.lastCalled}
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="flex items-center space-x-2">
                                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${api.successRate >= 95 ? 'bg-green-100 text-green-800' :
                                                    api.successRate >= 90 ? 'bg-yellow-100 text-yellow-800' :
                                                        'bg-red-100 text-red-800'
                                                }`}>
                                                {api.successRate}%
                                            </span>
                                            <span className="text-xs text-gray-500">{api.avgResponseTime}ms</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
                </div>

                <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <button className="flex items-center space-x-3 p-4 border border-gray-300 rounded-lg hover:bg-gray-50">
                            <Plus className="w-5 h-5 text-blue-600" />
                            <span className="font-medium text-gray-900">Create Memory</span>
                        </button>

                        <button className="flex items-center space-x-3 p-4 border border-gray-300 rounded-lg hover:bg-gray-50">
                            <FolderOpen className="w-5 h-5 text-green-600" />
                            <span className="font-medium text-gray-900">New Collection</span>
                        </button>

                        <button className="flex items-center space-x-3 p-4 border border-gray-300 rounded-lg hover:bg-gray-50">
                            <Search className="w-5 h-5 text-purple-600" />
                            <span className="font-medium text-gray-900">Advanced Search</span>
                        </button>

                        <button className="flex items-center space-x-3 p-4 border border-gray-300 rounded-lg hover:bg-gray-50">
                            <Download className="w-5 h-5 text-orange-600" />
                            <span className="font-medium text-gray-900">Export Data</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
