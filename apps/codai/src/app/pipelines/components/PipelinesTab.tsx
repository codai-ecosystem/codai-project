import React, { useState } from 'react';
import {
    GitBranch,
    Play,
    Square,
    RotateCcw,
    Edit,
    Trash2,
    Plus,
    CheckCircle,
    XCircle,
    Clock,
    AlertTriangle,
    Filter,
    Search,
    Download,
    Upload,
    GitCommit,
    Timer,
    Users,
    Settings
} from 'lucide-react';

export function PipelinesTab() {
    const [selectedFilter, setSelectedFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [showCreateModal, setShowCreateModal] = useState(false);

    const pipelines = [
        {
            id: 1,
            name: 'CODAI Frontend Pipeline',
            status: 'success',
            lastRun: '5 minutes ago',
            duration: '2m 34s',
            branch: 'main',
            commits: 142,
            environment: 'production',
            trigger: 'push',
            owner: 'dev-team',
            tags: ['frontend', 'react', 'production']
        },
        {
            id: 2,
            name: 'API Service Pipeline',
            status: 'running',
            lastRun: '8 minutes ago',
            duration: '1m 12s',
            branch: 'develop',
            commits: 89,
            environment: 'staging',
            trigger: 'pull-request',
            owner: 'backend-team',
            tags: ['api', 'nodejs', 'staging']
        },
        {
            id: 3,
            name: 'Database Migration Pipeline',
            status: 'failed',
            lastRun: '15 minutes ago',
            duration: '45s',
            branch: 'main',
            commits: 23,
            environment: 'production',
            trigger: 'manual',
            owner: 'data-team',
            tags: ['database', 'migration', 'critical']
        },
        {
            id: 4,
            name: 'MemorAI Service Pipeline',
            status: 'success',
            lastRun: '1 hour ago',
            duration: '3m 45s',
            branch: 'feature/optimization',
            commits: 67,
            environment: 'development',
            trigger: 'schedule',
            owner: 'ai-team',
            tags: ['ai', 'memory', 'optimization']
        },
        {
            id: 5,
            name: 'Security Scan Pipeline',
            status: 'warning',
            lastRun: '2 hours ago',
            duration: '5m 12s',
            branch: 'main',
            commits: 234,
            environment: 'security',
            trigger: 'schedule',
            owner: 'security-team',
            tags: ['security', 'scan', 'compliance']
        }
    ];

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'success': return <CheckCircle className="w-4 h-4 text-green-600" />;
            case 'failed': return <XCircle className="w-4 h-4 text-red-600" />;
            case 'running': return <Timer className="w-4 h-4 text-blue-600 animate-pulse" />;
            case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
            default: return <Clock className="w-4 h-4 text-gray-400" />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'success': return 'text-green-600 bg-green-100 border-green-200';
            case 'failed': return 'text-red-600 bg-red-100 border-red-200';
            case 'running': return 'text-blue-600 bg-blue-100 border-blue-200';
            case 'warning': return 'text-yellow-600 bg-yellow-100 border-yellow-200';
            default: return 'text-gray-600 bg-gray-100 border-gray-200';
        }
    };

    const filteredPipelines = pipelines.filter(pipeline => {
        const matchesFilter = selectedFilter === 'all' || pipeline.status === selectedFilter;
        const matchesSearch = pipeline.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            pipeline.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
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
                            placeholder="Search pipelines..."
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
                        <option value="all">All Status</option>
                        <option value="success">Success</option>
                        <option value="running">Running</option>
                        <option value="failed">Failed</option>
                        <option value="warning">Warning</option>
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
                        New Pipeline
                    </button>
                </div>
            </div>

            {/* Pipelines Grid */}
            <div className="grid gap-6">
                {filteredPipelines.map((pipeline) => (
                    <div key={pipeline.id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-start space-x-4">
                                <div className="p-2 bg-gray-100 rounded-lg">
                                    <GitBranch className="w-5 h-5 text-gray-600" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900">{pipeline.name}</h3>
                                    <div className="flex items-center space-x-4 mt-1">
                                        <span className="text-sm text-gray-500">
                                            <GitCommit className="w-4 h-4 inline mr-1" />
                                            {pipeline.branch}
                                        </span>
                                        <span className="text-sm text-gray-500">
                                            <Users className="w-4 h-4 inline mr-1" />
                                            {pipeline.owner}
                                        </span>
                                        <span className="text-sm text-gray-500">
                                            {pipeline.commits} commits
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center space-x-2">
                                <button className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg">
                                    <Play className="w-4 h-4" />
                                </button>
                                <button className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-lg">
                                    <RotateCcw className="w-4 h-4" />
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

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                            <div className="flex items-center space-x-2">
                                {getStatusIcon(pipeline.status)}
                                <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(pipeline.status)}`}>
                                    {pipeline.status}
                                </span>
                            </div>
                            <div className="text-sm text-gray-600">
                                <span className="font-medium">Last run:</span> {pipeline.lastRun}
                            </div>
                            <div className="text-sm text-gray-600">
                                <span className="font-medium">Duration:</span> {pipeline.duration}
                            </div>
                            <div className="text-sm text-gray-600">
                                <span className="font-medium">Environment:</span> {pipeline.environment}
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex flex-wrap gap-2">
                                {pipeline.tags.map((tag, index) => (
                                    <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                            <div className="text-sm text-gray-500">
                                Trigger: {pipeline.trigger}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Create Pipeline Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-semibold text-gray-900">Create New Pipeline</h2>
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
                                        Pipeline Name
                                    </label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Enter pipeline name"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Repository
                                    </label>
                                    <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                                        <option>Select repository</option>
                                        <option>codai-project</option>
                                        <option>memorai-service</option>
                                        <option>api-gateway</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Branch
                                    </label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="main"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Environment
                                    </label>
                                    <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                                        <option>development</option>
                                        <option>staging</option>
                                        <option>production</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Trigger
                                </label>
                                <div className="space-y-2">
                                    {['push', 'pull-request', 'manual', 'schedule'].map((trigger) => (
                                        <label key={trigger} className="flex items-center">
                                            <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                                            <span className="ml-2 text-sm text-gray-700 capitalize">{trigger.replace('-', ' ')}</span>
                                        </label>
                                    ))}
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
                                    Create Pipeline
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
