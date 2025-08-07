import React, { useState } from 'react';
import {
    Shield,
    Settings,
    Plus,
    Edit3,
    Trash2,
    CheckCircle,
    XCircle,
    AlertTriangle,
    Clock,
    Users,
    FileText,
    GitBranch,
    Code,
    Target,
    Search,
    Filter,
    Toggle,
    Zap,
    Activity,
    BarChart3
} from 'lucide-react';

export function ReviewRulesTab() {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [showCreateModal, setShowCreateModal] = useState(false);

    const reviewRules = [
        {
            id: 1,
            name: 'Minimum Reviewers Required',
            description: 'Require at least 2 reviewers for all pull requests',
            category: 'approval',
            type: 'mandatory',
            status: 'active',
            scope: 'global',
            conditions: {
                minReviewers: 2,
                requiredApprovals: 2,
                allowSelfReview: false,
                dismissStaleReviews: true
            },
            appliesTo: ['all repositories'],
            exceptions: [],
            createdBy: 'Alice Smith',
            createdAt: '2024-01-10 14:30:00',
            lastModified: '2024-01-15 10:20:00',
            enforcement: 100,
            compliance: 94.2
        },
        {
            id: 2,
            name: 'Security Review for Auth Changes',
            description: 'Require security team review for authentication-related changes',
            category: 'security',
            type: 'mandatory',
            status: 'active',
            scope: 'conditional',
            conditions: {
                filePatterns: ['**/auth/**', '**/security/**', '**/login/**'],
                requiredReviewers: ['carol.wilson@company.com'],
                additionalReviewers: 1,
                securityCheck: true
            },
            appliesTo: ['codai-backend', 'codai-frontend'],
            exceptions: ['hotfix branches'],
            createdBy: 'Carol Wilson',
            createdAt: '2024-01-08 09:15:00',
            lastModified: '2024-01-12 16:45:00',
            enforcement: 100,
            compliance: 98.7
        },
        {
            id: 3,
            name: 'Documentation Updates Required',
            description: 'Require documentation updates for public API changes',
            category: 'documentation',
            type: 'warning',
            status: 'active',
            scope: 'conditional',
            conditions: {
                filePatterns: ['**/api/**', '**/public/**'],
                requireDocumentation: true,
                documentationPatterns: ['docs/**', '**/*.md'],
                warningOnly: true
            },
            appliesTo: ['codai-api', 'codai-sdk'],
            exceptions: [],
            createdBy: 'John Doe',
            createdAt: '2024-01-05 11:20:00',
            lastModified: '2024-01-14 14:15:00',
            enforcement: 75,
            compliance: 67.3
        },
        {
            id: 4,
            name: 'Large PR Size Warning',
            description: 'Warn when pull requests exceed 500 lines of changes',
            category: 'size',
            type: 'warning',
            status: 'active',
            scope: 'global',
            conditions: {
                maxLines: 500,
                maxFiles: 20,
                warningThreshold: 300,
                suggestSplit: true
            },
            appliesTo: ['all repositories'],
            exceptions: ['migration branches', 'dependency updates'],
            createdBy: 'Bob Johnson',
            createdAt: '2024-01-12 13:45:00',
            lastModified: '2024-01-12 13:45:00',
            enforcement: 85,
            compliance: 78.9
        },
        {
            id: 5,
            name: 'CI/CD Pipeline Success Required',
            description: 'Block merge until all CI/CD checks pass successfully',
            category: 'quality',
            type: 'mandatory',
            status: 'active',
            scope: 'global',
            conditions: {
                requireAllChecks: true,
                allowedFailures: 0,
                timeoutMinutes: 60,
                retryOnFailure: true
            },
            appliesTo: ['all repositories'],
            exceptions: ['emergency hotfixes'],
            createdBy: 'David Brown',
            createdAt: '2024-01-07 16:30:00',
            lastModified: '2024-01-11 09:10:00',
            enforcement: 95,
            compliance: 91.8
        },
        {
            id: 6,
            name: 'Branch Protection for Main',
            description: 'Protect main branch from direct pushes and force updates',
            category: 'protection',
            type: 'mandatory',
            status: 'active',
            scope: 'branch-specific',
            conditions: {
                protectedBranches: ['main', 'master', 'production'],
                allowDirectPush: false,
                allowForcePush: false,
                requirePR: true
            },
            appliesTo: ['all repositories'],
            exceptions: [],
            createdBy: 'Alice Smith',
            createdAt: '2024-01-03 10:00:00',
            lastModified: '2024-01-03 10:00:00',
            enforcement: 100,
            compliance: 100
        },
        {
            id: 7,
            name: 'Performance Review for Critical Code',
            description: 'Require performance review for critical system components',
            category: 'performance',
            type: 'mandatory',
            status: 'draft',
            scope: 'conditional',
            conditions: {
                filePatterns: ['**/core/**', '**/critical/**', '**/performance/**'],
                requiredReviewers: ['performance-team@company.com'],
                performanceChecks: true,
                benchmarkRequired: true
            },
            appliesTo: ['codai-core', 'codai-engine'],
            exceptions: [],
            createdBy: 'Emma Davis',
            createdAt: '2024-01-15 15:20:00',
            lastModified: '2024-01-15 15:20:00',
            enforcement: 0,
            compliance: 0
        },
        {
            id: 8,
            name: 'External Dependency Review',
            description: 'Review and approve external dependency additions',
            category: 'dependencies',
            type: 'mandatory',
            status: 'paused',
            scope: 'conditional',
            conditions: {
                filePatterns: ['package.json', 'requirements.txt', 'pom.xml', 'Cargo.toml'],
                requiredReviewers: ['security-team@company.com'],
                licenseCheck: true,
                vulnerabilityCheck: true
            },
            appliesTo: ['all repositories'],
            exceptions: ['dev dependencies'],
            createdBy: 'Carol Wilson',
            createdAt: '2024-01-09 12:30:00',
            lastModified: '2024-01-13 11:15:00',
            enforcement: 0,
            compliance: 88.5
        }
    ];

    const ruleCategories = [
        { id: 'approval', name: 'Approval Rules', icon: CheckCircle, color: 'text-green-600' },
        { id: 'security', name: 'Security Rules', icon: Shield, color: 'text-red-600' },
        { id: 'documentation', name: 'Documentation', icon: FileText, color: 'text-blue-600' },
        { id: 'size', name: 'Size Limits', icon: BarChart3, color: 'text-yellow-600' },
        { id: 'quality', name: 'Quality Gates', icon: Target, color: 'text-purple-600' },
        { id: 'protection', name: 'Branch Protection', icon: GitBranch, color: 'text-orange-600' },
        { id: 'performance', name: 'Performance', icon: Zap, color: 'text-pink-600' },
        { id: 'dependencies', name: 'Dependencies', icon: Code, color: 'text-indigo-600' }
    ];

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'active': return <CheckCircle className="w-4 h-4 text-green-600" />;
            case 'draft': return <Clock className="w-4 h-4 text-yellow-600" />;
            case 'paused': return <XCircle className="w-4 h-4 text-red-600" />;
            default: return <AlertTriangle className="w-4 h-4 text-gray-400" />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'text-green-600 bg-green-100 border-green-200';
            case 'draft': return 'text-yellow-600 bg-yellow-100 border-yellow-200';
            case 'paused': return 'text-red-600 bg-red-100 border-red-200';
            default: return 'text-gray-600 bg-gray-100 border-gray-200';
        }
    };

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'mandatory': return 'text-red-600 bg-red-100';
            case 'warning': return 'text-yellow-600 bg-yellow-100';
            case 'optional': return 'text-blue-600 bg-blue-100';
            default: return 'text-gray-600 bg-gray-100';
        }
    };

    const getScopeColor = (scope: string) => {
        switch (scope) {
            case 'global': return 'text-purple-600 bg-purple-100';
            case 'conditional': return 'text-blue-600 bg-blue-100';
            case 'branch-specific': return 'text-green-600 bg-green-100';
            default: return 'text-gray-600 bg-gray-100';
        }
    };

    const filteredRules = reviewRules.filter(rule => {
        const matchesCategory = selectedCategory === 'all' || rule.category === selectedCategory;
        const matchesSearch = rule.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            rule.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            rule.category.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesCategory && matchesSearch;
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
                            placeholder="Search rules..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>

                    <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        <option value="all">All Categories</option>
                        {ruleCategories.map(category => (
                            <option key={category.id} value={category.id}>{category.name}</option>
                        ))}
                    </select>
                </div>

                <div className="flex items-center space-x-3">
                    <button className="flex items-center px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                        <Settings className="w-4 h-4 mr-2" />
                        Global Settings
                    </button>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="flex items-center px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Create Rule
                    </button>
                </div>
            </div>

            {/* Rule Categories Overview */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
                {ruleCategories.map(category => {
                    const CategoryIcon = category.icon;
                    const categoryCount = reviewRules.filter(rule => rule.category === category.id).length;

                    return (
                        <button
                            key={category.id}
                            onClick={() => setSelectedCategory(category.id)}
                            className={`p-4 bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow ${selectedCategory === category.id ? 'ring-2 ring-blue-500' : ''
                                }`}
                        >
                            <div className="text-center">
                                <CategoryIcon className={`w-6 h-6 ${category.color} mx-auto mb-2`} />
                                <div className="text-sm font-medium text-gray-900">{categoryCount}</div>
                                <div className="text-xs text-gray-500">{category.name.split(' ')[0]}</div>
                            </div>
                        </button>
                    );
                })}
            </div>

            {/* Rules List */}
            <div className="space-y-4">
                {filteredRules.map((rule) => (
                    <div key={rule.id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                                <div className="flex items-center space-x-3 mb-2">
                                    <h3 className="text-lg font-semibold text-gray-900">{rule.name}</h3>
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(rule.type)}`}>
                                        {rule.type}
                                    </span>
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getScopeColor(rule.scope)}`}>
                                        {rule.scope}
                                    </span>
                                </div>
                                <p className="text-gray-600 mb-3">{rule.description}</p>
                                <div className="flex items-center space-x-6 text-sm text-gray-500">
                                    <span>Category: {rule.category}</span>
                                    <span>Created by: {rule.createdBy}</span>
                                    <span>Last modified: {new Date(rule.lastModified).toLocaleDateString()}</span>
                                </div>
                            </div>

                            <div className="flex items-center space-x-2">
                                <div className="flex items-center space-x-2">
                                    {getStatusIcon(rule.status)}
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(rule.status)}`}>
                                        {rule.status}
                                    </span>
                                </div>
                                <button className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg">
                                    <Edit3 className="w-4 h-4" />
                                </button>
                                <button className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        {/* Rule Metrics */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
                            <div className="text-center">
                                <div className="text-lg font-bold text-blue-600">{rule.enforcement}%</div>
                                <div className="text-xs text-gray-500">Enforcement Rate</div>
                            </div>
                            <div className="text-center">
                                <div className="text-lg font-bold text-green-600">{rule.compliance}%</div>
                                <div className="text-xs text-gray-500">Compliance Rate</div>
                            </div>
                            <div className="text-center">
                                <div className="text-lg font-bold text-purple-600">{rule.appliesTo.length}</div>
                                <div className="text-xs text-gray-500">Repositories</div>
                            </div>
                            <div className="text-center">
                                <div className="text-lg font-bold text-orange-600">{rule.exceptions.length}</div>
                                <div className="text-xs text-gray-500">Exceptions</div>
                            </div>
                        </div>

                        {/* Rule Details */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <h4 className="font-medium text-gray-900 mb-2">Applies To</h4>
                                <div className="space-y-1">
                                    {rule.appliesTo.map((target, index) => (
                                        <span
                                            key={index}
                                            className="inline-block px-2 py-1 text-xs font-medium text-blue-600 bg-blue-100 rounded-full mr-2 mb-1"
                                        >
                                            {target}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {rule.exceptions.length > 0 && (
                                <div>
                                    <h4 className="font-medium text-gray-900 mb-2">Exceptions</h4>
                                    <div className="space-y-1">
                                        {rule.exceptions.map((exception, index) => (
                                            <span
                                                key={index}
                                                className="inline-block px-2 py-1 text-xs font-medium text-red-600 bg-red-100 rounded-full mr-2 mb-1"
                                            >
                                                {exception}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Rule Conditions */}
                        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                            <h4 className="font-medium text-gray-900 mb-2">Rule Conditions</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                {Object.entries(rule.conditions).map(([key, value]) => (
                                    <div key={key} className="flex justify-between">
                                        <span className="text-gray-600 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}:</span>
                                        <span className="font-medium text-gray-900">
                                            {Array.isArray(value) ? value.join(', ') : String(value)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Rules Summary */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Rules Summary</h3>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="text-center">
                        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                            <Shield className="w-8 h-8 text-blue-600" />
                        </div>
                        <div className="text-2xl font-bold text-gray-900">{reviewRules.length}</div>
                        <div className="text-sm text-gray-500">Total Rules</div>
                    </div>

                    <div className="text-center">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                            <CheckCircle className="w-8 h-8 text-green-600" />
                        </div>
                        <div className="text-2xl font-bold text-gray-900">
                            {reviewRules.filter(rule => rule.status === 'active').length}
                        </div>
                        <div className="text-sm text-gray-500">Active Rules</div>
                    </div>

                    <div className="text-center">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                            <AlertTriangle className="w-8 h-8 text-red-600" />
                        </div>
                        <div className="text-2xl font-bold text-gray-900">
                            {reviewRules.filter(rule => rule.type === 'mandatory').length}
                        </div>
                        <div className="text-sm text-gray-500">Mandatory Rules</div>
                    </div>

                    <div className="text-center">
                        <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                            <Target className="w-8 h-8 text-purple-600" />
                        </div>
                        <div className="text-2xl font-bold text-gray-900">
                            {(reviewRules.reduce((sum, rule) => sum + rule.compliance, 0) / reviewRules.length).toFixed(1)}%
                        </div>
                        <div className="text-sm text-gray-500">Avg Compliance</div>
                    </div>
                </div>
            </div>

            {/* Create Rule Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 w-full max-w-3xl max-h-screen overflow-y-auto">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-semibold text-gray-900">Create Review Rule</h3>
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
                                        Rule Name
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="e.g., Security Review Required"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Category
                                    </label>
                                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                                        {ruleCategories.map(category => (
                                            <option key={category.id} value={category.id}>{category.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Type
                                    </label>
                                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                                        <option value="mandatory">Mandatory</option>
                                        <option value="warning">Warning</option>
                                        <option value="optional">Optional</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Scope
                                    </label>
                                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                                        <option value="global">Global</option>
                                        <option value="conditional">Conditional</option>
                                        <option value="branch-specific">Branch Specific</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Description
                                </label>
                                <textarea
                                    rows={3}
                                    placeholder="Describe what this rule does and when it applies..."
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Applies To (comma-separated)
                                </label>
                                <input
                                    type="text"
                                    placeholder="all repositories, codai-backend, codai-frontend"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    File Patterns (optional, comma-separated)
                                </label>
                                <input
                                    type="text"
                                    placeholder="**/auth/**, **/security/**, **/*.test.js"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Minimum Reviewers
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        max="10"
                                        defaultValue="1"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Required Approvals
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        max="10"
                                        defaultValue="1"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center space-x-6">
                                <label className="flex items-center">
                                    <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                                    <span className="ml-2 text-sm text-gray-700">Allow self-review</span>
                                </label>
                                <label className="flex items-center">
                                    <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                                    <span className="ml-2 text-sm text-gray-700">Dismiss stale reviews</span>
                                </label>
                                <label className="flex items-center">
                                    <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                                    <span className="ml-2 text-sm text-gray-700">Require CI/CD success</span>
                                </label>
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
                                    Create Rule
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
