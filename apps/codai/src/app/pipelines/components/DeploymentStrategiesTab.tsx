import React, { useState } from 'react';
import {
    Target,
    GitBranch,
    Cloud,
    Shield,
    Zap,
    Plus,
    Edit,
    Trash2,
    Copy,
    CheckCircle,
    XCircle,
    Clock,
    Settings,
    Search,
    Filter,
    Download,
    Upload,
    Rocket,
    Globe,
    Server,
    Database,
    AlertTriangle,
    Activity,
    BarChart
} from 'lucide-react';

export function DeploymentStrategiesTab() {
    const [selectedFilter, setSelectedFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [showCreateModal, setShowCreateModal] = useState(false);

    const deploymentStrategies = [
        {
            id: 1,
            name: 'Blue-Green Deployment',
            type: 'blue-green',
            description: 'Zero-downtime deployment with instant rollback capability',
            status: 'active',
            environments: ['staging', 'production'],
            success_rate: 99.8,
            avg_duration: '5m 12s',
            rollback_time: '30s',
            risk_level: 'low',
            applications: ['CODAI Frontend', 'API Gateway', 'MemorAI Service'],
            created: '2024-01-15',
            last_used: '2 hours ago',
            tags: ['zero-downtime', 'safe', 'instant-rollback']
        },
        {
            id: 2,
            name: 'Canary Release',
            type: 'canary',
            description: 'Gradual rollout to subset of users with traffic splitting',
            status: 'active',
            environments: ['production'],
            success_rate: 96.5,
            avg_duration: '15m 45s',
            rollback_time: '2m 15s',
            risk_level: 'medium',
            applications: ['User Service', 'Payment Gateway', 'Analytics Engine'],
            created: '2024-01-10',
            last_used: '1 day ago',
            tags: ['gradual', 'traffic-splitting', 'monitoring']
        },
        {
            id: 3,
            name: 'Rolling Deployment',
            type: 'rolling',
            description: 'Sequential update of instances with health checks',
            status: 'active',
            environments: ['development', 'staging'],
            success_rate: 94.2,
            avg_duration: '8m 30s',
            rollback_time: '5m 30s',
            risk_level: 'medium',
            applications: ['Background Jobs', 'Data Pipeline', 'Report Generator'],
            created: '2024-01-08',
            last_used: '4 hours ago',
            tags: ['sequential', 'health-checks', 'cost-effective']
        },
        {
            id: 4,
            name: 'A/B Testing Deployment',
            type: 'ab-testing',
            description: 'Feature testing with controlled user groups',
            status: 'running',
            environments: ['production'],
            success_rate: 98.1,
            avg_duration: '3m 45s',
            rollback_time: '1m 00s',
            risk_level: 'low',
            applications: ['Frontend Features', 'UI Components', 'User Experience'],
            created: '2024-01-20',
            last_used: 'Running now',
            tags: ['testing', 'feature-flags', 'user-groups']
        },
        {
            id: 5,
            name: 'Immutable Infrastructure',
            type: 'immutable',
            description: 'Complete infrastructure replacement with new images',
            status: 'paused',
            environments: ['production'],
            success_rate: 99.9,
            avg_duration: '12m 20s',
            rollback_time: '8m 45s',
            risk_level: 'high',
            applications: ['Core Database', 'Security Layer', 'Network Infrastructure'],
            created: '2024-01-05',
            last_used: '1 week ago',
            tags: ['infrastructure', 'secure', 'complete-rebuild']
        }
    ];

    const strategyTemplates = [
        {
            type: 'blue-green',
            name: 'Blue-Green Deployment',
            icon: Target,
            color: 'blue',
            description: 'Zero-downtime with instant rollback'
        },
        {
            type: 'canary',
            name: 'Canary Release',
            icon: BarChart,
            color: 'green',
            description: 'Gradual rollout with traffic control'
        },
        {
            type: 'rolling',
            name: 'Rolling Update',
            icon: Activity,
            color: 'purple',
            description: 'Sequential instance updates'
        },
        {
            type: 'ab-testing',
            name: 'A/B Testing',
            icon: GitBranch,
            color: 'orange',
            description: 'Feature testing with user groups'
        },
        {
            type: 'immutable',
            name: 'Immutable Infrastructure',
            icon: Shield,
            color: 'red',
            description: 'Complete infrastructure replacement'
        }
    ];

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'active': return <CheckCircle className="w-4 h-4 text-green-600" />;
            case 'running': return <Activity className="w-4 h-4 text-blue-600 animate-pulse" />;
            case 'paused': return <Clock className="w-4 h-4 text-yellow-600" />;
            case 'failed': return <XCircle className="w-4 h-4 text-red-600" />;
            default: return <Clock className="w-4 h-4 text-gray-400" />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'text-green-600 bg-green-100 border-green-200';
            case 'running': return 'text-blue-600 bg-blue-100 border-blue-200';
            case 'paused': return 'text-yellow-600 bg-yellow-100 border-yellow-200';
            case 'failed': return 'text-red-600 bg-red-100 border-red-200';
            default: return 'text-gray-600 bg-gray-100 border-gray-200';
        }
    };

    const getRiskColor = (risk: string) => {
        switch (risk) {
            case 'low': return 'text-green-600 bg-green-100';
            case 'medium': return 'text-yellow-600 bg-yellow-100';
            case 'high': return 'text-red-600 bg-red-100';
            default: return 'text-gray-600 bg-gray-100';
        }
    };

    const filteredStrategies = deploymentStrategies.filter(strategy => {
        const matchesFilter = selectedFilter === 'all' || strategy.type === selectedFilter;
        const matchesSearch = strategy.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            strategy.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            strategy.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
        return matchesFilter && matchesSearch;
    });

    return (
        <div className="space-y-6">
            {/* Header Actions */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex items-center space-x-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Search deployment strategies..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>

                    <select
                        value={selectedFilter}
                        onChange={(e) => setSelectedFilter(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        <option value="all">All Types</option>
                        <option value="blue-green">Blue-Green</option>
                        <option value="canary">Canary</option>
                        <option value="rolling">Rolling</option>
                        <option value="ab-testing">A/B Testing</option>
                        <option value="immutable">Immutable</option>
                    </select>
                </div>

                <div className="flex items-center space-x-3">
                    <button className="flex items-center px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                        <Upload className="w-4 h-4 mr-2" />
                        Import
                    </button>
                    <button className="flex items-center px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                        <Download className="w-4 h-4 mr-2" />
                        Export
                    </button>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="flex items-center px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        New Strategy
                    </button>
                </div>
            </div>

            {/* Strategy Templates */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Deployment Strategy Templates</h3>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    {strategyTemplates.map((template) => (
                        <button
                            key={template.type}
                            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left"
                        >
                            <template.icon className={`w-6 h-6 text-${template.color}-600 mb-2`} />
                            <div className="font-medium text-gray-900 text-sm">{template.name}</div>
                            <div className="text-xs text-gray-500 mt-1">{template.description}</div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Deployment Strategies Grid */}
            <div className="grid gap-6">
                {filteredStrategies.map((strategy) => (
                    <div key={strategy.id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-start space-x-4">
                                <div className="p-2 bg-blue-100 rounded-lg">
                                    <Rocket className="w-5 h-5 text-blue-600" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900">{strategy.name}</h3>
                                    <p className="text-gray-600 mt-1">{strategy.description}</p>
                                    <div className="flex items-center space-x-4 mt-2">
                                        <span className="text-sm text-gray-500">
                                            Type: {strategy.type}
                                        </span>
                                        <span className="text-sm text-gray-500">
                                            Created: {strategy.created}
                                        </span>
                                        <span className="text-sm text-gray-500">
                                            {strategy.applications.length} applications
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center space-x-2">
                                <button className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg">
                                    <Rocket className="w-4 h-4" />
                                </button>
                                <button className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-lg">
                                    <Copy className="w-4 h-4" />
                                </button>
                                <button className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-lg">
                                    <Settings className="w-4 h-4" />
                                </button>
                                <button className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-lg">
                                    <Edit className="w-4 h-4" />
                                </button>
                                <button className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-4">
                            <div className="flex items-center space-x-2">
                                {getStatusIcon(strategy.status)}
                                <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(strategy.status)}`}>
                                    {strategy.status}
                                </span>
                            </div>
                            <div className="text-sm text-gray-600">
                                <span className="font-medium">Success:</span> {strategy.success_rate}%
                            </div>
                            <div className="text-sm text-gray-600">
                                <span className="font-medium">Duration:</span> {strategy.avg_duration}
                            </div>
                            <div className="text-sm text-gray-600">
                                <span className="font-medium">Rollback:</span> {strategy.rollback_time}
                            </div>
                            <div className="text-sm text-gray-600">
                                <span className="font-medium">Risk:</span>
                                <span className={`ml-1 px-2 py-1 rounded-full text-xs ${getRiskColor(strategy.risk_level)}`}>
                                    {strategy.risk_level}
                                </span>
                            </div>
                            <div className="text-sm text-gray-600">
                                <span className="font-medium">Last used:</span> {strategy.last_used}
                            </div>
                        </div>

                        <div className="mb-4">
                            <div className="text-sm font-medium text-gray-700 mb-2">Applications:</div>
                            <div className="flex flex-wrap gap-2">
                                {strategy.applications.map((app, index) => (
                                    <span key={index} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                                        {app}
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div className="mb-4">
                            <div className="text-sm font-medium text-gray-700 mb-2">Environments:</div>
                            <div className="flex flex-wrap gap-2">
                                {strategy.environments.map((env, index) => (
                                    <span key={index} className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                                        {env}
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex flex-wrap gap-2">
                                {strategy.tags.map((tag, index) => (
                                    <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Create Strategy Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 w-full max-w-3xl mx-4 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-semibold text-gray-900">Create Deployment Strategy</h2>
                            <button
                                onClick={() => setShowCreateModal(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <XCircle className="w-6 h-6" />
                            </button>
                        </div>

                        <form className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Strategy Name
                                    </label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Enter strategy name"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Strategy Type
                                    </label>
                                    <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                                        <option>Blue-Green Deployment</option>
                                        <option>Canary Release</option>
                                        <option>Rolling Update</option>
                                        <option>A/B Testing</option>
                                        <option>Immutable Infrastructure</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Description
                                </label>
                                <textarea
                                    rows={3}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Describe the deployment strategy"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Risk Level
                                    </label>
                                    <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                                        <option>Low</option>
                                        <option>Medium</option>
                                        <option>High</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Rollback Time (minutes)
                                    </label>
                                    <input
                                        type="number"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="5"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Health Check Timeout
                                    </label>
                                    <input
                                        type="number"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="300"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Target Environments
                                    </label>
                                    <div className="space-y-2">
                                        {['development', 'staging', 'production'].map((env) => (
                                            <label key={env} className="flex items-center">
                                                <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                                                <span className="ml-2 text-sm text-gray-700 capitalize">{env}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Applications
                                    </label>
                                    <div className="space-y-2">
                                        {['CODAI Frontend', 'API Gateway', 'MemorAI Service', 'Database Service'].map((app) => (
                                            <label key={app} className="flex items-center">
                                                <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                                                <span className="ml-2 text-sm text-gray-700">{app}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end space-x-3">
                                <button
                                    type="button"
                                    onClick={() => setShowCreateModal(false)}
                                    className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                                >
                                    Create Strategy
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
