'use client';

import React, { useState } from 'react';
import {
    Shield,
    CheckCircle,
    XCircle,
    AlertTriangle,
    Clock,
    Play,
    Settings,
    Plus,
    Filter,
    Search,
    RefreshCw,
    Download,
    Eye,
    Edit,
    Trash2,
    ChevronRight,
    GitBranch,
    FileText,
    Users,
    Target,
    Zap,
    BarChart3
} from 'lucide-react';

export default function QualityGatesPage() {
    const [selectedStatus, setSelectedStatus] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [showCreateModal, setShowCreateModal] = useState(false);

    const qualityGates = [
        {
            id: 1,
            name: 'Production Release Gate',
            description: 'Comprehensive quality checks for production deployments',
            status: 'active',
            conditions: [
                { name: 'Code Coverage', threshold: '≥ 80%', current: '84.2%', status: 'passed' },
                { name: 'Unit Tests', threshold: '100% pass', current: '98.5%', status: 'failed' },
                { name: 'Security Scan', threshold: '0 critical', current: '1 critical', status: 'failed' },
                { name: 'Performance', threshold: '< 2s load', current: '1.8s', status: 'passed' },
                { name: 'Code Quality', threshold: 'A rating', current: 'B rating', status: 'warning' }
            ],
            projects: ['codai-backend', 'codai-frontend', 'codai-api'],
            lastRun: '2024-01-15 14:30:00',
            success: 67.8,
            trend: 'down',
            createdBy: 'Alice Smith',
            gateType: 'deployment'
        },
        {
            id: 2,
            name: 'Feature Branch Gate',
            description: 'Quality checks before merging feature branches to main',
            status: 'active',
            conditions: [
                { name: 'Unit Tests', threshold: '100% pass', current: '100%', status: 'passed' },
                { name: 'Code Coverage', threshold: '≥ 75%', current: '78.5%', status: 'passed' },
                { name: 'Lint Checks', threshold: '0 errors', current: '0 errors', status: 'passed' },
                { name: 'Code Review', threshold: '≥ 2 approvals', current: '2 approvals', status: 'passed' }
            ],
            projects: ['all repositories'],
            lastRun: '2024-01-15 16:45:00',
            success: 94.2,
            trend: 'up',
            createdBy: 'Bob Johnson',
            gateType: 'merge'
        },
        {
            id: 3,
            name: 'Security Gate',
            description: 'Security-focused quality gate for sensitive components',
            status: 'active',
            conditions: [
                { name: 'SAST Scan', threshold: '0 high', current: '0 high', status: 'passed' },
                { name: 'Dependency Scan', threshold: '0 critical', current: '2 medium', status: 'passed' },
                { name: 'Secrets Check', threshold: '0 secrets', current: '0 secrets', status: 'passed' },
                { name: 'Compliance Check', threshold: 'SOC2 compliant', current: 'Compliant', status: 'passed' }
            ],
            projects: ['codai-auth', 'codai-payments', 'codai-api'],
            lastRun: '2024-01-15 12:15:00',
            success: 89.5,
            trend: 'stable',
            createdBy: 'Carol Wilson',
            gateType: 'security'
        },
        {
            id: 4,
            name: 'Performance Gate',
            description: 'Performance benchmarks for critical user journeys',
            status: 'draft',
            conditions: [
                { name: 'Load Time', threshold: '< 3s', current: '2.4s', status: 'passed' },
                { name: 'Memory Usage', threshold: '< 512MB', current: '445MB', status: 'passed' },
                { name: 'CPU Usage', threshold: '< 70%', current: '85%', status: 'failed' },
                { name: 'Error Rate', threshold: '< 1%', current: '0.3%', status: 'passed' }
            ],
            projects: ['codai-frontend', 'codai-mobile'],
            lastRun: '2024-01-14 18:20:00',
            success: 72.1,
            trend: 'down',
            createdBy: 'David Brown',
            gateType: 'performance'
        },
        {
            id: 5,
            name: 'Accessibility Gate',
            description: 'WCAG 2.1 AA compliance checks for UI components',
            status: 'paused',
            conditions: [
                { name: 'WCAG AA', threshold: '100% compliant', current: '92%', status: 'warning' },
                { name: 'Contrast Ratio', threshold: '≥ 4.5:1', current: '4.8:1', status: 'passed' },
                { name: 'Keyboard Nav', threshold: '100% accessible', current: '95%', status: 'warning' },
                { name: 'Screen Reader', threshold: 'Compatible', current: 'Compatible', status: 'passed' }
            ],
            projects: ['codai-frontend', 'codai-mobile', 'codai-dashboard'],
            lastRun: '2024-01-13 10:30:00',
            success: 81.3,
            trend: 'up',
            createdBy: 'Emma Davis',
            gateType: 'accessibility'
        },
        {
            id: 6,
            name: 'Documentation Gate',
            description: 'Ensure adequate documentation for public APIs',
            status: 'active',
            conditions: [
                { name: 'API Docs', threshold: '100% coverage', current: '87%', status: 'warning' },
                { name: 'Code Comments', threshold: '≥ 20%', current: '24%', status: 'passed' },
                { name: 'README Updates', threshold: 'Current', current: 'Updated', status: 'passed' },
                { name: 'Changelog', threshold: 'Updated', current: 'Missing', status: 'failed' }
            ],
            projects: ['codai-api', 'codai-sdk'],
            lastRun: '2024-01-15 09:45:00',
            success: 76.4,
            trend: 'stable',
            createdBy: 'Frank Miller',
            gateType: 'documentation'
        }
    ];

    const gateTypes = [
        { id: 'deployment', name: 'Deployment', icon: Zap, color: 'text-purple-600 bg-purple-100' },
        { id: 'merge', name: 'Merge', icon: GitBranch, color: 'text-blue-600 bg-blue-100' },
        { id: 'security', name: 'Security', icon: Shield, color: 'text-red-600 bg-red-100' },
        { id: 'performance', name: 'Performance', icon: BarChart3, color: 'text-green-600 bg-green-100' },
        { id: 'accessibility', name: 'Accessibility', icon: Users, color: 'text-orange-600 bg-orange-100' },
        { id: 'documentation', name: 'Documentation', icon: FileText, color: 'text-indigo-600 bg-indigo-100' }
    ];

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'passed': return <CheckCircle className="w-4 h-4 text-green-600" />;
            case 'failed': return <XCircle className="w-4 h-4 text-red-600" />;
            case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
            default: return <Clock className="w-4 h-4 text-gray-400" />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'passed': return 'text-green-600 bg-green-100 border-green-200';
            case 'failed': return 'text-red-600 bg-red-100 border-red-200';
            case 'warning': return 'text-yellow-600 bg-yellow-100 border-yellow-200';
            default: return 'text-gray-600 bg-gray-100 border-gray-200';
        }
    };

    const getGateStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'text-green-600 bg-green-100';
            case 'draft': return 'text-yellow-600 bg-yellow-100';
            case 'paused': return 'text-red-600 bg-red-100';
            default: return 'text-gray-600 bg-gray-100';
        }
    };

    const getTrendIcon = (trend: string) => {
        switch (trend) {
            case 'up': return '↗️';
            case 'down': return '↘️';
            default: return '➡️';
        }
    };

    const filteredGates = qualityGates.filter(gate => {
        const matchesStatus = selectedStatus === 'all' || gate.status === selectedStatus;
        const matchesSearch = gate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            gate.description.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesStatus && matchesSearch;
    });

    const overallStats = {
        totalGates: qualityGates.length,
        activeGates: qualityGates.filter(g => g.status === 'active').length,
        avgSuccess: (qualityGates.reduce((sum, g) => sum + g.success, 0) / qualityGates.length).toFixed(1),
        totalProjects: [...new Set(qualityGates.flatMap(g => g.projects))].length
    };

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Quality Gates</h1>
                    <p className="text-gray-600 mt-1">
                        Automated quality checkpoints ensuring code meets standards before progression
                    </p>
                </div>

                <div className="flex items-center space-x-3">
                    <button className="flex items-center px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Refresh
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
                        Create Gate
                    </button>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-2xl font-bold text-gray-900">{overallStats.totalGates}</div>
                            <div className="text-sm text-gray-500">Total Gates</div>
                        </div>
                        <Target className="w-8 h-8 text-blue-600" />
                    </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-2xl font-bold text-green-600">{overallStats.activeGates}</div>
                            <div className="text-sm text-gray-500">Active Gates</div>
                        </div>
                        <CheckCircle className="w-8 h-8 text-green-600" />
                    </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-2xl font-bold text-purple-600">{overallStats.avgSuccess}%</div>
                            <div className="text-sm text-gray-500">Avg Success Rate</div>
                        </div>
                        <BarChart3 className="w-8 h-8 text-purple-600" />
                    </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-2xl font-bold text-orange-600">{overallStats.totalProjects}</div>
                            <div className="text-sm text-gray-500">Protected Projects</div>
                        </div>
                        <Shield className="w-8 h-8 text-orange-600" />
                    </div>
                </div>
            </div>

            {/* Gate Types Overview */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Gate Types</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    {gateTypes.map(type => {
                        const TypeIcon = type.icon;
                        const typeCount = qualityGates.filter(gate => gate.gateType === type.id).length;

                        return (
                            <div key={type.id} className="text-center p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 ${type.color}`}>
                                    <TypeIcon className="w-6 h-6" />
                                </div>
                                <div className="text-lg font-bold text-gray-900">{typeCount}</div>
                                <div className="text-sm text-gray-500">{type.name}</div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Search and Filters */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex items-center space-x-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Search quality gates..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>

                    <select
                        value={selectedStatus}
                        onChange={(e) => setSelectedStatus(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        <option value="all">All Status</option>
                        <option value="active">Active</option>
                        <option value="draft">Draft</option>
                        <option value="paused">Paused</option>
                    </select>
                </div>

                <div className="flex items-center space-x-2">
                    <Filter className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-500">
                        Showing {filteredGates.length} of {qualityGates.length} gates
                    </span>
                </div>
            </div>

            {/* Quality Gates List */}
            <div className="space-y-6">
                {filteredGates.map((gate) => (
                    <div key={gate.id} className="bg-white rounded-xl shadow-sm border border-gray-200">
                        {/* Gate Header */}
                        <div className="p-6 border-b border-gray-200">
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center space-x-3 mb-2">
                                        <h3 className="text-lg font-semibold text-gray-900">{gate.name}</h3>
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getGateStatusColor(gate.status)}`}>
                                            {gate.status}
                                        </span>
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${gateTypes.find(t => t.id === gate.gateType)?.color || 'text-gray-600 bg-gray-100'
                                            }`}>
                                            {gate.gateType}
                                        </span>
                                    </div>
                                    <p className="text-gray-600 mb-3">{gate.description}</p>
                                    <div className="flex items-center space-x-6 text-sm text-gray-500">
                                        <span>Created by: {gate.createdBy}</span>
                                        <span>Last run: {new Date(gate.lastRun).toLocaleString()}</span>
                                        <span>Success rate: {gate.success}% {getTrendIcon(gate.trend)}</span>
                                    </div>
                                </div>

                                <div className="flex items-center space-x-2">
                                    <button className="flex items-center px-3 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700">
                                        <Play className="w-4 h-4 mr-2" />
                                        Run
                                    </button>
                                    <button className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg">
                                        <Eye className="w-4 h-4" />
                                    </button>
                                    <button className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg">
                                        <Edit className="w-4 h-4" />
                                    </button>
                                    <button className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Gate Conditions */}
                        <div className="p-6">
                            <h4 className="font-medium text-gray-900 mb-4">Quality Conditions</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {gate.conditions.map((condition, index) => (
                                    <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                                        <div className="flex items-center space-x-3">
                                            {getStatusIcon(condition.status)}
                                            <div>
                                                <div className="font-medium text-gray-900">{condition.name}</div>
                                                <div className="text-sm text-gray-500">Threshold: {condition.threshold}</div>
                                            </div>
                                        </div>

                                        <div className="text-right">
                                            <div className={`font-medium ${condition.status === 'passed' ? 'text-green-600' :
                                                    condition.status === 'failed' ? 'text-red-600' :
                                                        condition.status === 'warning' ? 'text-yellow-600' : 'text-gray-600'
                                                }`}>
                                                {condition.current}
                                            </div>
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(condition.status)}`}>
                                                {condition.status}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Applied Projects */}
                        <div className="p-6 bg-gray-50 border-t border-gray-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h4 className="font-medium text-gray-900 mb-2">Applied to Projects</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {gate.projects.map((project, index) => (
                                            <span
                                                key={index}
                                                className="px-3 py-1 text-sm font-medium text-blue-600 bg-blue-100 rounded-full"
                                            >
                                                {project}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <div className="text-right">
                                    <div className="text-2xl font-bold text-gray-900">{gate.success}%</div>
                                    <div className="text-sm text-gray-500">Success Rate</div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Create Gate Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 w-full max-w-4xl max-h-screen overflow-y-auto">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-semibold text-gray-900">Create Quality Gate</h3>
                            <button
                                onClick={() => setShowCreateModal(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <XCircle className="w-6 h-6" />
                            </button>
                        </div>

                        <form className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Gate Name
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="e.g., Production Quality Gate"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Gate Type
                                    </label>
                                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                                        {gateTypes.map(type => (
                                            <option key={type.id} value={type.id}>{type.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Description
                                </label>
                                <textarea
                                    rows={3}
                                    placeholder="Describe the purpose and scope of this quality gate..."
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Applied Projects (comma-separated)
                                </label>
                                <input
                                    type="text"
                                    placeholder="codai-backend, codai-frontend, codai-api"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-4">
                                    Quality Conditions
                                </label>
                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border border-gray-200 rounded-lg">
                                        <input
                                            type="text"
                                            placeholder="Condition name"
                                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                        <input
                                            type="text"
                                            placeholder="Threshold (e.g., ≥ 80%)"
                                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                        <select className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                                            <option value="mandatory">Mandatory</option>
                                            <option value="warning">Warning</option>
                                            <option value="optional">Optional</option>
                                        </select>
                                    </div>

                                    <button
                                        type="button"
                                        className="flex items-center px-4 py-2 text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100"
                                    >
                                        <Plus className="w-4 h-4 mr-2" />
                                        Add Condition
                                    </button>
                                </div>
                            </div>

                            <div className="flex items-center justify-end space-x-3 pt-6">
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
                                    Create Gate
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
