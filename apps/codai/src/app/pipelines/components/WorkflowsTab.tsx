import React, { useState } from 'react';
import {
    GitBranch,
    Play,
    Square,
    Edit,
    Trash2,
    Plus,
    CheckCircle,
    XCircle,
    Clock,
    AlertTriangle,
    Search,
    Download,
    Upload,
    Workflow,
    Timer,
    Users,
    Settings,
    ArrowRight,
    Zap,
    GitCommit,
    Calendar,
    Activity
} from 'lucide-react';

export function WorkflowsTab() {
    const [selectedFilter, setSelectedFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [showCreateModal, setShowCreateModal] = useState(false);

    const workflows = [
        {
            id: 1,
            name: 'Full Stack Deployment',
            description: 'Complete CI/CD workflow for frontend and backend',
            status: 'active',
            lastRun: '2 hours ago',
            duration: '12m 45s',
            steps: 8,
            success_rate: 94.2,
            runs: 156,
            triggers: ['push', 'pull-request'],
            environments: ['staging', 'production'],
            owner: 'dev-team',
            tags: ['fullstack', 'deployment', 'critical']
        },
        {
            id: 2,
            name: 'Security Assessment',
            description: 'Automated security scanning and vulnerability assessment',
            status: 'running',
            lastRun: '30 minutes ago',
            duration: '8m 12s',
            steps: 5,
            success_rate: 98.7,
            runs: 89,
            triggers: ['schedule', 'manual'],
            environments: ['all'],
            owner: 'security-team',
            tags: ['security', 'scanning', 'compliance']
        },
        {
            id: 3,
            name: 'Database Backup & Migration',
            description: 'Automated database backup and migration workflow',
            status: 'paused',
            lastRun: '1 day ago',
            duration: '15m 34s',
            steps: 6,
            success_rate: 99.1,
            runs: 245,
            triggers: ['schedule'],
            environments: ['production'],
            owner: 'data-team',
            tags: ['database', 'backup', 'migration']
        },
        {
            id: 4,
            name: 'AI Model Training',
            description: 'ML model training and deployment pipeline',
            status: 'active',
            lastRun: '4 hours ago',
            duration: '45m 23s',
            steps: 12,
            success_rate: 87.5,
            runs: 67,
            triggers: ['manual', 'data-update'],
            environments: ['development', 'staging'],
            owner: 'ai-team',
            tags: ['ai', 'training', 'models']
        },
        {
            id: 5,
            name: 'Performance Testing',
            description: 'Load testing and performance benchmarking',
            status: 'failed',
            lastRun: '6 hours ago',
            duration: '25m 56s',
            steps: 7,
            success_rate: 92.3,
            runs: 134,
            triggers: ['schedule', 'pre-deployment'],
            environments: ['staging'],
            owner: 'qa-team',
            tags: ['performance', 'testing', 'load']
        }
    ];

    const workflowSteps = [
        { name: 'Code Checkout', icon: GitCommit, status: 'completed' },
        { name: 'Build Application', icon: Settings, status: 'completed' },
        { name: 'Run Tests', icon: CheckCircle, status: 'completed' },
        { name: 'Security Scan', icon: AlertTriangle, status: 'running' },
        { name: 'Deploy to Staging', icon: Upload, status: 'pending' },
        { name: 'Integration Tests', icon: Activity, status: 'pending' },
        { name: 'Deploy to Production', icon: Zap, status: 'pending' },
        { name: 'Monitor & Validate', icon: Timer, status: 'pending' }
    ];

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'active': return <CheckCircle className="w-4 h-4 text-green-600" />;
            case 'failed': return <XCircle className="w-4 h-4 text-red-600" />;
            case 'running': return <Timer className="w-4 h-4 text-blue-600 animate-pulse" />;
            case 'paused': return <Square className="w-4 h-4 text-yellow-600" />;
            default: return <Clock className="w-4 h-4 text-gray-400" />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'text-green-600 bg-green-100 border-green-200';
            case 'failed': return 'text-red-600 bg-red-100 border-red-200';
            case 'running': return 'text-blue-600 bg-blue-100 border-blue-200';
            case 'paused': return 'text-yellow-600 bg-yellow-100 border-yellow-200';
            default: return 'text-gray-600 bg-gray-100 border-gray-200';
        }
    };

    const getStepIcon = (status: string) => {
        switch (status) {
            case 'completed': return 'bg-green-100 text-green-600 border-green-200';
            case 'running': return 'bg-blue-100 text-blue-600 border-blue-200 animate-pulse';
            case 'pending': return 'bg-gray-100 text-gray-400 border-gray-200';
            case 'failed': return 'bg-red-100 text-red-600 border-red-200';
            default: return 'bg-gray-100 text-gray-400 border-gray-200';
        }
    };

    const filteredWorkflows = workflows.filter(workflow => {
        const matchesFilter = selectedFilter === 'all' || workflow.status === selectedFilter;
        const matchesSearch = workflow.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            workflow.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            workflow.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
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
                            placeholder="Search workflows..."
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
                        <option value="active">Active</option>
                        <option value="running">Running</option>
                        <option value="paused">Paused</option>
                        <option value="failed">Failed</option>
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
                        New Workflow
                    </button>
                </div>
            </div>

            {/* Workflows Grid */}
            <div className="grid gap-6">
                {filteredWorkflows.map((workflow) => (
                    <div key={workflow.id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-start space-x-4">
                                <div className="p-2 bg-purple-100 rounded-lg">
                                    <Workflow className="w-5 h-5 text-purple-600" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900">{workflow.name}</h3>
                                    <p className="text-gray-600 mt-1">{workflow.description}</p>
                                    <div className="flex items-center space-x-4 mt-2">
                                        <span className="text-sm text-gray-500">
                                            <Users className="w-4 h-4 inline mr-1" />
                                            {workflow.owner}
                                        </span>
                                        <span className="text-sm text-gray-500">
                                            {workflow.steps} steps
                                        </span>
                                        <span className="text-sm text-gray-500">
                                            {workflow.runs} runs
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center space-x-2">
                                <button className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg">
                                    <Play className="w-4 h-4" />
                                </button>
                                <button className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-lg">
                                    <Square className="w-4 h-4" />
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

                        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
                            <div className="flex items-center space-x-2">
                                {getStatusIcon(workflow.status)}
                                <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(workflow.status)}`}>
                                    {workflow.status}
                                </span>
                            </div>
                            <div className="text-sm text-gray-600">
                                <span className="font-medium">Last run:</span> {workflow.lastRun}
                            </div>
                            <div className="text-sm text-gray-600">
                                <span className="font-medium">Duration:</span> {workflow.duration}
                            </div>
                            <div className="text-sm text-gray-600">
                                <span className="font-medium">Success rate:</span> {workflow.success_rate}%
                            </div>
                            <div className="text-sm text-gray-600">
                                <span className="font-medium">Environments:</span> {workflow.environments.join(', ')}
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex flex-wrap gap-2">
                                {workflow.tags.map((tag, index) => (
                                    <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                            <div className="text-sm text-gray-500">
                                Triggers: {workflow.triggers.join(', ')}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Workflow Steps Visualization */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Active Workflow Progress</h3>

                <div className="flex items-center justify-between">
                    {workflowSteps.map((step, index) => (
                        <div key={index} className="flex flex-col items-center">
                            <div className={`w-12 h-12 rounded-full border-2 flex items-center justify-center ${getStepIcon(step.status)}`}>
                                <step.icon className="w-5 h-5" />
                            </div>
                            <div className="text-xs text-gray-600 mt-2 text-center max-w-20">
                                {step.name}
                            </div>
                            {index < workflowSteps.length - 1 && (
                                <ArrowRight className="w-4 h-4 text-gray-400 absolute" style={{ left: `${(index + 1) * 12.5}%` }} />
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Create Workflow Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 w-full max-w-3xl mx-4 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-semibold text-gray-900">Create New Workflow</h2>
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
                                        Workflow Name
                                    </label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Enter workflow name"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Template
                                    </label>
                                    <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                                        <option>Custom Workflow</option>
                                        <option>CI/CD Pipeline</option>
                                        <option>Security Scan</option>
                                        <option>Performance Test</option>
                                        <option>Database Migration</option>
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
                                    placeholder="Describe the workflow purpose and functionality"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Triggers
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
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Environments
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
                                        Owner Team
                                    </label>
                                    <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                                        <option>dev-team</option>
                                        <option>security-team</option>
                                        <option>data-team</option>
                                        <option>ai-team</option>
                                        <option>qa-team</option>
                                    </select>
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
                                    Create Workflow
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
