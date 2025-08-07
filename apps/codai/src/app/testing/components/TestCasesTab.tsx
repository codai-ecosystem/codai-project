import React, { useState } from 'react';
import {
    TestTube,
    Plus,
    Edit,
    Trash2,
    Copy,
    Play,
    Square,
    CheckCircle,
    XCircle,
    Clock,
    AlertTriangle,
    Search,
    Filter,
    Download,
    Upload,
    Settings,
    Tag,
    User,
    Calendar,
    FileText,
    Code,
    Bug,
    Shield
} from 'lucide-react';

export function TestCasesTab() {
    const [selectedFilter, setSelectedFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState('all');

    const testCases = [
        {
            id: 1,
            name: 'User Authentication Flow',
            category: 'unit',
            priority: 'high',
            status: 'passed',
            description: 'Test user login, logout, and session management',
            author: 'John Doe',
            created: '2024-01-15',
            lastRun: '2 hours ago',
            duration: '2.3s',
            assertions: 12,
            tags: ['auth', 'security', 'user-management'],
            environment: 'all',
            steps: 8,
            coverage: 95.2
        },
        {
            id: 2,
            name: 'API Response Validation',
            category: 'integration',
            priority: 'high',
            status: 'failed',
            description: 'Validate API response structure and data types',
            author: 'Jane Smith',
            created: '2024-01-12',
            lastRun: '1 hour ago',
            duration: '5.7s',
            assertions: 24,
            tags: ['api', 'validation', 'backend'],
            environment: 'staging',
            steps: 15,
            coverage: 78.9
        },
        {
            id: 3,
            name: 'Payment Processing E2E',
            category: 'e2e',
            priority: 'critical',
            status: 'running',
            description: 'End-to-end payment flow from cart to confirmation',
            author: 'Mike Johnson',
            created: '2024-01-10',
            lastRun: 'Running now',
            duration: '45.2s',
            assertions: 35,
            tags: ['payment', 'e2e', 'critical'],
            environment: 'production',
            steps: 22,
            coverage: 67.8
        },
        {
            id: 4,
            name: 'Database Connection Pool',
            category: 'performance',
            priority: 'medium',
            status: 'passed',
            description: 'Test database connection pooling under load',
            author: 'Sarah Wilson',
            created: '2024-01-08',
            lastRun: '3 hours ago',
            duration: '12.8s',
            assertions: 8,
            tags: ['database', 'performance', 'load'],
            environment: 'development',
            steps: 6,
            coverage: 89.4
        },
        {
            id: 5,
            name: 'Security Headers Check',
            category: 'security',
            priority: 'high',
            status: 'warning',
            description: 'Verify security headers in HTTP responses',
            author: 'David Brown',
            created: '2024-01-05',
            lastRun: '4 hours ago',
            duration: '1.2s',
            assertions: 15,
            tags: ['security', 'headers', 'compliance'],
            environment: 'production',
            steps: 5,
            coverage: 92.1
        }
    ];

    const testCategories = [
        { id: 'unit', name: 'Unit Tests', count: 1247, color: 'blue' },
        { id: 'integration', name: 'Integration Tests', count: 567, color: 'green' },
        { id: 'e2e', name: 'E2E Tests', count: 234, color: 'purple' },
        { id: 'performance', name: 'Performance Tests', count: 89, color: 'orange' },
        { id: 'security', name: 'Security Tests', count: 156, color: 'red' },
        { id: 'accessibility', name: 'Accessibility Tests', count: 78, color: 'indigo' }
    ];

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'passed': return <CheckCircle className="w-4 h-4 text-green-600" />;
            case 'failed': return <XCircle className="w-4 h-4 text-red-600" />;
            case 'running': return <Play className="w-4 h-4 text-blue-600 animate-pulse" />;
            case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
            default: return <Clock className="w-4 h-4 text-gray-400" />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'passed': return 'text-green-600 bg-green-100 border-green-200';
            case 'failed': return 'text-red-600 bg-red-100 border-red-200';
            case 'running': return 'text-blue-600 bg-blue-100 border-blue-200';
            case 'warning': return 'text-yellow-600 bg-yellow-100 border-yellow-200';
            default: return 'text-gray-600 bg-gray-100 border-gray-200';
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'critical': return 'text-red-600 bg-red-100';
            case 'high': return 'text-orange-600 bg-orange-100';
            case 'medium': return 'text-yellow-600 bg-yellow-100';
            case 'low': return 'text-green-600 bg-green-100';
            default: return 'text-gray-600 bg-gray-100';
        }
    };

    const filteredTestCases = testCases.filter(testCase => {
        const matchesStatus = selectedFilter === 'all' || testCase.status === selectedFilter;
        const matchesCategory = selectedCategory === 'all' || testCase.category === selectedCategory;
        const matchesSearch = testCase.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            testCase.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            testCase.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
        return matchesStatus && matchesCategory && matchesSearch;
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
                            placeholder="Search test cases..."
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
                        <option value="passed">Passed</option>
                        <option value="failed">Failed</option>
                        <option value="running">Running</option>
                        <option value="warning">Warning</option>
                    </select>

                    <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        <option value="all">All Categories</option>
                        {testCategories.map(category => (
                            <option key={category.id} value={category.id}>{category.name}</option>
                        ))}
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
                        New Test Case
                    </button>
                </div>
            </div>

            {/* Test Categories */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Test Categories</h3>
                <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                    {testCategories.map((category) => (
                        <button
                            key={category.id}
                            onClick={() => setSelectedCategory(category.id)}
                            className={`p-4 border rounded-lg hover:bg-gray-50 text-left ${selectedCategory === category.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                                }`}
                        >
                            <TestTube className={`w-6 h-6 text-${category.color}-600 mb-2`} />
                            <div className="font-medium text-gray-900 text-sm">{category.name}</div>
                            <div className="text-xs text-gray-500 mt-1">{category.count} tests</div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Test Cases Grid */}
            <div className="grid gap-6">
                {filteredTestCases.map((testCase) => (
                    <div key={testCase.id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-start space-x-4">
                                <div className="p-2 bg-blue-100 rounded-lg">
                                    <TestTube className="w-5 h-5 text-blue-600" />
                                </div>
                                <div>
                                    <div className="flex items-center space-x-3">
                                        <h3 className="text-lg font-semibold text-gray-900">{testCase.name}</h3>
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(testCase.priority)}`}>
                                            {testCase.priority}
                                        </span>
                                    </div>
                                    <p className="text-gray-600 mt-1">{testCase.description}</p>
                                    <div className="flex items-center space-x-4 mt-2">
                                        <span className="text-sm text-gray-500">
                                            <User className="w-4 h-4 inline mr-1" />
                                            {testCase.author}
                                        </span>
                                        <span className="text-sm text-gray-500">
                                            <Calendar className="w-4 h-4 inline mr-1" />
                                            {testCase.created}
                                        </span>
                                        <span className="text-sm text-gray-500">
                                            {testCase.steps} steps
                                        </span>
                                        <span className="text-sm text-gray-500">
                                            {testCase.assertions} assertions
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center space-x-2">
                                <button className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg">
                                    <Play className="w-4 h-4" />
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
                                {getStatusIcon(testCase.status)}
                                <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(testCase.status)}`}>
                                    {testCase.status}
                                </span>
                            </div>
                            <div className="text-sm text-gray-600">
                                <span className="font-medium">Last run:</span> {testCase.lastRun}
                            </div>
                            <div className="text-sm text-gray-600">
                                <span className="font-medium">Duration:</span> {testCase.duration}
                            </div>
                            <div className="text-sm text-gray-600">
                                <span className="font-medium">Coverage:</span> {testCase.coverage}%
                            </div>
                            <div className="text-sm text-gray-600">
                                <span className="font-medium">Category:</span> {testCase.category}
                            </div>
                            <div className="text-sm text-gray-600">
                                <span className="font-medium">Environment:</span> {testCase.environment}
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex flex-wrap gap-2">
                                {testCase.tags.map((tag, index) => (
                                    <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Create Test Case Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 w-full max-w-3xl mx-4 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-semibold text-gray-900">Create New Test Case</h2>
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
                                        Test Case Name
                                    </label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Enter test case name"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Category
                                    </label>
                                    <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                                        {testCategories.map(category => (
                                            <option key={category.id} value={category.id}>{category.name}</option>
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
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Describe the test case purpose and scope"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Priority
                                    </label>
                                    <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                                        <option value="low">Low</option>
                                        <option value="medium">Medium</option>
                                        <option value="high">High</option>
                                        <option value="critical">Critical</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Environment
                                    </label>
                                    <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                                        <option value="all">All Environments</option>
                                        <option value="development">Development</option>
                                        <option value="staging">Staging</option>
                                        <option value="production">Production</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Timeout (seconds)
                                    </label>
                                    <input
                                        type="number"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="30"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Tags
                                </label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Enter tags separated by commas"
                                />
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
                                    Create Test Case
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
