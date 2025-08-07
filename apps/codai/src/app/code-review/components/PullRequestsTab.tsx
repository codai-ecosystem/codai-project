import React, { useState } from 'react';
import {
    GitPullRequest,
    User,
    Calendar,
    MessageSquare,
    GitBranch,
    FileText,
    Clock,
    CheckCircle,
    XCircle,
    AlertTriangle,
    Plus,
    Search,
    Filter,
    RefreshCw,
    ExternalLink,
    Edit3,
    Trash2,
    Eye,
    GitCommit,
    Code,
    Activity
} from 'lucide-react';

export function PullRequestsTab() {
    const [selectedFilter, setSelectedFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedPR, setSelectedPR] = useState(null);

    const pullRequests = [
        {
            id: 1,
            title: 'Implement OAuth 2.0 authentication system',
            description: 'Add comprehensive OAuth 2.0 authentication with support for Google, GitHub, and Microsoft providers',
            author: {
                name: 'John Doe',
                avatar: 'JD',
                email: 'john.doe@company.com'
            },
            reviewers: [
                { name: 'Alice Smith', avatar: 'AS', status: 'approved' },
                { name: 'Bob Johnson', avatar: 'BJ', status: 'pending' },
                { name: 'Carol Wilson', avatar: 'CW', status: 'changes-requested' }
            ],
            status: 'changes-requested',
            priority: 'high',
            createdAt: '2024-01-15 10:30:00',
            updatedAt: '2024-01-15 16:45:00',
            branch: 'feature/oauth-auth',
            targetBranch: 'main',
            repository: 'codai-backend',
            commits: 12,
            changes: { files: 23, additions: 1245, deletions: 167 },
            comments: 18,
            labels: ['authentication', 'security', 'backend'],
            checks: {
                passed: 6,
                failed: 1,
                pending: 2
            },
            conflicts: false,
            draft: false
        },
        {
            id: 2,
            title: 'Add real-time collaborative editing',
            description: 'Implement WebSocket-based real-time collaborative editing with operational transformation',
            author: {
                name: 'Alice Smith',
                avatar: 'AS',
                email: 'alice.smith@company.com'
            },
            reviewers: [
                { name: 'John Doe', avatar: 'JD', status: 'approved' },
                { name: 'David Brown', avatar: 'DB', status: 'approved' }
            ],
            status: 'approved',
            priority: 'medium',
            createdAt: '2024-01-14 14:20:00',
            updatedAt: '2024-01-15 11:30:00',
            branch: 'feature/collaborative-editing',
            targetBranch: 'main',
            repository: 'codai-frontend',
            commits: 8,
            changes: { files: 15, additions: 892, deletions: 34 },
            comments: 12,
            labels: ['websocket', 'collaboration', 'frontend'],
            checks: {
                passed: 8,
                failed: 0,
                pending: 0
            },
            conflicts: false,
            draft: false
        },
        {
            id: 3,
            title: 'Fix memory leak in data processing pipeline',
            description: 'Resolve memory leak issue in the data processing pipeline that was causing performance degradation',
            author: {
                name: 'Bob Johnson',
                avatar: 'BJ',
                email: 'bob.johnson@company.com'
            },
            reviewers: [
                { name: 'Carol Wilson', avatar: 'CW', status: 'pending' },
                { name: 'Emma Davis', avatar: 'ED', status: 'pending' }
            ],
            status: 'pending',
            priority: 'critical',
            createdAt: '2024-01-15 09:15:00',
            updatedAt: '2024-01-15 09:15:00',
            branch: 'fix/memory-leak-pipeline',
            targetBranch: 'main',
            repository: 'codai-processor',
            commits: 3,
            changes: { files: 7, additions: 89, deletions: 156 },
            comments: 5,
            labels: ['bugfix', 'performance', 'critical'],
            checks: {
                passed: 5,
                failed: 0,
                pending: 3
            },
            conflicts: false,
            draft: false
        },
        {
            id: 4,
            title: 'Upgrade to React 19 and implement new features',
            description: 'Major upgrade to React 19 with implementation of new concurrent features and performance improvements',
            author: {
                name: 'Carol Wilson',
                avatar: 'CW',
                email: 'carol.wilson@company.com'
            },
            reviewers: [
                { name: 'Alice Smith', avatar: 'AS', status: 'pending' },
                { name: 'John Doe', avatar: 'JD', status: 'pending' },
                { name: 'Emma Davis', avatar: 'ED', status: 'pending' }
            ],
            status: 'reviewing',
            priority: 'medium',
            createdAt: '2024-01-13 16:45:00',
            updatedAt: '2024-01-15 14:20:00',
            branch: 'upgrade/react-19',
            targetBranch: 'develop',
            repository: 'codai-frontend',
            commits: 25,
            changes: { files: 67, additions: 2456, deletions: 1234 },
            comments: 28,
            labels: ['upgrade', 'react', 'frontend', 'breaking-change'],
            checks: {
                passed: 10,
                failed: 2,
                pending: 4
            },
            conflicts: true,
            draft: false
        },
        {
            id: 5,
            title: '[DRAFT] Experimental AI-powered code suggestions',
            description: 'Experimental implementation of AI-powered code suggestions using machine learning models',
            author: {
                name: 'Emma Davis',
                avatar: 'ED',
                email: 'emma.davis@company.com'
            },
            reviewers: [],
            status: 'draft',
            priority: 'low',
            createdAt: '2024-01-12 11:30:00',
            updatedAt: '2024-01-15 13:45:00',
            branch: 'experimental/ai-suggestions',
            targetBranch: 'main',
            repository: 'codai-ai',
            commits: 15,
            changes: { files: 34, additions: 1567, deletions: 78 },
            comments: 3,
            labels: ['experimental', 'ai', 'machine-learning'],
            checks: {
                passed: 3,
                failed: 1,
                pending: 2
            },
            conflicts: false,
            draft: true
        }
    ];

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'approved': return <CheckCircle className="w-4 h-4 text-green-600" />;
            case 'changes-requested': return <XCircle className="w-4 h-4 text-red-600" />;
            case 'reviewing': return <Clock className="w-4 h-4 text-blue-600" />;
            case 'pending': return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
            case 'draft': return <FileText className="w-4 h-4 text-gray-600" />;
            default: return <Clock className="w-4 h-4 text-gray-400" />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'approved': return 'text-green-600 bg-green-100 border-green-200';
            case 'changes-requested': return 'text-red-600 bg-red-100 border-red-200';
            case 'reviewing': return 'text-blue-600 bg-blue-100 border-blue-200';
            case 'pending': return 'text-yellow-600 bg-yellow-100 border-yellow-200';
            case 'draft': return 'text-gray-600 bg-gray-100 border-gray-200';
            default: return 'text-gray-600 bg-gray-100 border-gray-200';
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'critical': return 'text-red-600 bg-red-100';
            case 'high': return 'text-orange-600 bg-orange-100';
            case 'medium': return 'text-blue-600 bg-blue-100';
            case 'low': return 'text-gray-600 bg-gray-100';
            default: return 'text-gray-600 bg-gray-100';
        }
    };

    const getReviewerStatusColor = (status: string) => {
        switch (status) {
            case 'approved': return 'border-green-500 bg-green-100';
            case 'changes-requested': return 'border-red-500 bg-red-100';
            case 'pending': return 'border-yellow-500 bg-yellow-100';
            default: return 'border-gray-500 bg-gray-100';
        }
    };

    const filteredPRs = pullRequests.filter(pr => {
        const matchesFilter = selectedFilter === 'all' || pr.status === selectedFilter;
        const matchesSearch = pr.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            pr.author.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            pr.repository.toLowerCase().includes(searchTerm.toLowerCase()) ||
            pr.branch.toLowerCase().includes(searchTerm.toLowerCase());
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
                            placeholder="Search pull requests..."
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
                        <option value="pending">Pending</option>
                        <option value="reviewing">Reviewing</option>
                        <option value="approved">Approved</option>
                        <option value="changes-requested">Changes Requested</option>
                        <option value="draft">Draft</option>
                    </select>
                </div>

                <div className="flex items-center space-x-3">
                    <button className="flex items-center px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Refresh
                    </button>
                    <button className="flex items-center px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700">
                        <Plus className="w-4 h-4 mr-2" />
                        New Pull Request
                    </button>
                </div>
            </div>

            {/* Pull Requests List */}
            <div className="space-y-4">
                {filteredPRs.map((pr) => (
                    <div key={pr.id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                                <div className="flex items-center space-x-3 mb-2">
                                    <h3 className="text-lg font-semibold text-gray-900 hover:text-blue-600 cursor-pointer">
                                        {pr.title}
                                    </h3>
                                    {pr.draft && (
                                        <span className="px-2 py-1 text-xs font-medium text-gray-600 bg-gray-100 rounded-full">
                                            DRAFT
                                        </span>
                                    )}
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(pr.priority)}`}>
                                        {pr.priority}
                                    </span>
                                    {pr.conflicts && (
                                        <span className="px-2 py-1 text-xs font-medium text-red-600 bg-red-100 rounded-full">
                                            CONFLICTS
                                        </span>
                                    )}
                                </div>
                                <p className="text-gray-600 mb-3">{pr.description}</p>
                                <div className="flex items-center space-x-6 text-sm text-gray-500">
                                    <span className="flex items-center">
                                        <User className="w-4 h-4 mr-1" />
                                        {pr.author.name}
                                    </span>
                                    <span className="flex items-center">
                                        <GitBranch className="w-4 h-4 mr-1" />
                                        {pr.branch} → {pr.targetBranch}
                                    </span>
                                    <span className="flex items-center">
                                        <FileText className="w-4 h-4 mr-1" />
                                        {pr.repository}
                                    </span>
                                    <span className="flex items-center">
                                        <Calendar className="w-4 h-4 mr-1" />
                                        {new Date(pr.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-center space-x-2">
                                <div className="flex items-center space-x-2">
                                    {getStatusIcon(pr.status)}
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(pr.status)}`}>
                                        {pr.status.replace('-', ' ')}
                                    </span>
                                </div>
                                <button className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg">
                                    <ExternalLink className="w-4 h-4" />
                                </button>
                                <button className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-lg">
                                    <Edit3 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        {/* PR Statistics */}
                        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
                            <div className="text-center">
                                <div className="text-lg font-bold text-gray-900">{pr.commits}</div>
                                <div className="text-xs text-gray-500">Commits</div>
                            </div>
                            <div className="text-center">
                                <div className="text-lg font-bold text-gray-900">{pr.changes.files}</div>
                                <div className="text-xs text-gray-500">Files</div>
                            </div>
                            <div className="text-center">
                                <div className="text-lg font-bold text-green-600">+{pr.changes.additions}</div>
                                <div className="text-xs text-gray-500">Additions</div>
                            </div>
                            <div className="text-center">
                                <div className="text-lg font-bold text-red-600">-{pr.changes.deletions}</div>
                                <div className="text-xs text-gray-500">Deletions</div>
                            </div>
                            <div className="text-center">
                                <div className="text-lg font-bold text-blue-600">{pr.comments}</div>
                                <div className="text-xs text-gray-500">Comments</div>
                            </div>
                            <div className="text-center">
                                <div className="text-lg font-bold text-purple-600">{pr.checks.passed + pr.checks.failed + pr.checks.pending}</div>
                                <div className="text-xs text-gray-500">Checks</div>
                            </div>
                        </div>

                        {/* Checks Status */}
                        <div className="flex items-center space-x-4 mb-4">
                            <div className="flex items-center space-x-2">
                                <CheckCircle className="w-4 h-4 text-green-600" />
                                <span className="text-sm text-green-600">{pr.checks.passed} passed</span>
                            </div>
                            {pr.checks.failed > 0 && (
                                <div className="flex items-center space-x-2">
                                    <XCircle className="w-4 h-4 text-red-600" />
                                    <span className="text-sm text-red-600">{pr.checks.failed} failed</span>
                                </div>
                            )}
                            {pr.checks.pending > 0 && (
                                <div className="flex items-center space-x-2">
                                    <Clock className="w-4 h-4 text-yellow-600" />
                                    <span className="text-sm text-yellow-600">{pr.checks.pending} pending</span>
                                </div>
                            )}
                        </div>

                        {/* Reviewers and Labels */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                {pr.reviewers.length > 0 ? (
                                    <div className="flex items-center space-x-2">
                                        <span className="text-sm text-gray-600">Reviewers:</span>
                                        <div className="flex -space-x-1">
                                            {pr.reviewers.map((reviewer, index) => (
                                                <div
                                                    key={index}
                                                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium text-gray-700 border-2 border-white ${getReviewerStatusColor(reviewer.status)}`}
                                                    title={`${reviewer.name} - ${reviewer.status}`}
                                                >
                                                    {reviewer.avatar}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <span className="text-sm text-gray-400">No reviewers assigned</span>
                                )}
                            </div>

                            <div className="flex items-center space-x-2">
                                {pr.labels.slice(0, 3).map((label, index) => (
                                    <span
                                        key={index}
                                        className="px-2 py-1 text-xs font-medium text-blue-600 bg-blue-100 rounded-full"
                                    >
                                        {label}
                                    </span>
                                ))}
                                {pr.labels.length > 3 && (
                                    <span className="px-2 py-1 text-xs font-medium text-gray-600 bg-gray-100 rounded-full">
                                        +{pr.labels.length - 3}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* PR Summary Stats */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Pull Request Summary</h3>

                <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                    <div className="text-center">
                        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                            <GitPullRequest className="w-8 h-8 text-blue-600" />
                        </div>
                        <div className="text-2xl font-bold text-gray-900">{pullRequests.length}</div>
                        <div className="text-sm text-gray-500">Total PRs</div>
                    </div>

                    <div className="text-center">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                            <CheckCircle className="w-8 h-8 text-green-600" />
                        </div>
                        <div className="text-2xl font-bold text-gray-900">
                            {pullRequests.filter(pr => pr.status === 'approved').length}
                        </div>
                        <div className="text-sm text-gray-500">Approved</div>
                    </div>

                    <div className="text-center">
                        <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
                            <Clock className="w-8 h-8 text-yellow-600" />
                        </div>
                        <div className="text-2xl font-bold text-gray-900">
                            {pullRequests.filter(pr => pr.status === 'pending' || pr.status === 'reviewing').length}
                        </div>
                        <div className="text-sm text-gray-500">In Review</div>
                    </div>

                    <div className="text-center">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                            <XCircle className="w-8 h-8 text-red-600" />
                        </div>
                        <div className="text-2xl font-bold text-gray-900">
                            {pullRequests.filter(pr => pr.status === 'changes-requested').length}
                        </div>
                        <div className="text-sm text-gray-500">Changes Requested</div>
                    </div>

                    <div className="text-center">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                            <FileText className="w-8 h-8 text-gray-600" />
                        </div>
                        <div className="text-2xl font-bold text-gray-900">
                            {pullRequests.filter(pr => pr.draft).length}
                        </div>
                        <div className="text-sm text-gray-500">Drafts</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
