import React, { useState } from 'react';
import {
    Play,
    Square,
    RotateCcw,
    CheckCircle,
    XCircle,
    Clock,
    AlertTriangle,
    Search,
    Filter,
    Download,
    Upload,
    Settings,
    Activity,
    Timer,
    Target,
    Zap,
    BarChart3,
    Calendar,
    User,
    Server,
    GitBranch,
    Terminal
} from 'lucide-react';

export function TestExecutionTab() {
    const [selectedFilter, setSelectedFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedExecution, setSelectedExecution] = useState(null);

    const testExecutions = [
        {
            id: 1,
            name: 'Frontend Unit Tests - Feature Branch',
            status: 'running',
            progress: 68,
            startTime: '2 minutes ago',
            estimatedTime: '5m 30s remaining',
            environment: 'development',
            branch: 'feature/user-auth',
            trigger: 'push',
            executor: 'CI/CD Pipeline',
            tests: {
                total: 156,
                passed: 89,
                failed: 3,
                running: 12,
                remaining: 52
            },
            coverage: 84.2,
            performance: 'normal'
        },
        {
            id: 2,
            name: 'API Integration Test Suite',
            status: 'passed',
            progress: 100,
            startTime: '15 minutes ago',
            estimatedTime: 'Completed in 8m 45s',
            environment: 'staging',
            branch: 'main',
            trigger: 'manual',
            executor: 'John Doe',
            tests: {
                total: 89,
                passed: 85,
                failed: 0,
                running: 0,
                remaining: 0,
                skipped: 4
            },
            coverage: 92.7,
            performance: 'excellent'
        },
        {
            id: 3,
            name: 'E2E User Journey Tests',
            status: 'failed',
            progress: 45,
            startTime: '30 minutes ago',
            estimatedTime: 'Failed after 12m 34s',
            environment: 'staging',
            branch: 'release/v2.1.0',
            trigger: 'schedule',
            executor: 'Scheduled Job',
            tests: {
                total: 67,
                passed: 23,
                failed: 7,
                running: 0,
                remaining: 37
            },
            coverage: 67.3,
            performance: 'slow'
        },
        {
            id: 4,
            name: 'Performance Load Tests',
            status: 'warning',
            progress: 89,
            startTime: '1 hour ago',
            estimatedTime: '2m 15s remaining',
            environment: 'production',
            branch: 'main',
            trigger: 'deployment',
            executor: 'CD Pipeline',
            tests: {
                total: 45,
                passed: 35,
                failed: 0,
                running: 2,
                remaining: 8
            },
            coverage: 78.9,
            performance: 'warning'
        },
        {
            id: 5,
            name: 'Security Vulnerability Scan',
            status: 'queued',
            progress: 0,
            startTime: 'Queued 5 minutes ago',
            estimatedTime: 'Waiting to start',
            environment: 'security',
            branch: 'main',
            trigger: 'schedule',
            executor: 'Security Bot',
            tests: {
                total: 234,
                passed: 0,
                failed: 0,
                running: 0,
                remaining: 234
            },
            coverage: 0,
            performance: 'pending'
        }
    ];

    const executionSteps = [
        { name: 'Environment Setup', status: 'completed', duration: '45s' },
        { name: 'Dependencies Install', status: 'completed', duration: '2m 12s' },
        { name: 'Build Application', status: 'completed', duration: '1m 34s' },
        { name: 'Unit Tests', status: 'completed', duration: '3m 45s' },
        { name: 'Integration Tests', status: 'running', duration: '2m 15s' },
        { name: 'E2E Tests', status: 'pending', duration: '-' },
        { name: 'Performance Tests', status: 'pending', duration: '-' },
        { name: 'Generate Reports', status: 'pending', duration: '-' }
    ];

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'passed': return <CheckCircle className="w-4 h-4 text-green-600" />;
            case 'failed': return <XCircle className="w-4 h-4 text-red-600" />;
            case 'running': return <Play className="w-4 h-4 text-blue-600 animate-pulse" />;
            case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
            case 'queued': return <Clock className="w-4 h-4 text-gray-600" />;
            default: return <Clock className="w-4 h-4 text-gray-400" />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'passed': return 'text-green-600 bg-green-100 border-green-200';
            case 'failed': return 'text-red-600 bg-red-100 border-red-200';
            case 'running': return 'text-blue-600 bg-blue-100 border-blue-200';
            case 'warning': return 'text-yellow-600 bg-yellow-100 border-yellow-200';
            case 'queued': return 'text-gray-600 bg-gray-100 border-gray-200';
            default: return 'text-gray-600 bg-gray-100 border-gray-200';
        }
    };

    const getPerformanceColor = (performance: string) => {
        switch (performance) {
            case 'excellent': return 'text-green-600';
            case 'normal': return 'text-blue-600';
            case 'slow': return 'text-yellow-600';
            case 'warning': return 'text-red-600';
            default: return 'text-gray-600';
        }
    };

    const getStepStatusColor = (status: string) => {
        switch (status) {
            case 'completed': return 'bg-green-100 text-green-600 border-green-200';
            case 'running': return 'bg-blue-100 text-blue-600 border-blue-200 animate-pulse';
            case 'pending': return 'bg-gray-100 text-gray-400 border-gray-200';
            case 'failed': return 'bg-red-100 text-red-600 border-red-200';
            default: return 'bg-gray-100 text-gray-400 border-gray-200';
        }
    };

    const filteredExecutions = testExecutions.filter(execution => {
        const matchesFilter = selectedFilter === 'all' || execution.status === selectedFilter;
        const matchesSearch = execution.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            execution.environment.toLowerCase().includes(searchTerm.toLowerCase()) ||
            execution.branch.toLowerCase().includes(searchTerm.toLowerCase());
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
                            placeholder="Search test executions..."
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
                        <option value="running">Running</option>
                        <option value="passed">Passed</option>
                        <option value="failed">Failed</option>
                        <option value="warning">Warning</option>
                        <option value="queued">Queued</option>
                    </select>
                </div>

                <div className="flex items-center space-x-3">
                    <button className="flex items-center px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                        <Download className="w-4 h-4 mr-2" />
                        Export Logs
                    </button>
                    <button className="flex items-center px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700">
                        <Play className="w-4 h-4 mr-2" />
                        Run Tests
                    </button>
                </div>
            </div>

            {/* Test Executions Grid */}
            <div className="grid gap-6">
                {filteredExecutions.map((execution) => (
                    <div key={execution.id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-start space-x-4">
                                <div className="p-2 bg-blue-100 rounded-lg">
                                    <Activity className="w-5 h-5 text-blue-600" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900">{execution.name}</h3>
                                    <div className="flex items-center space-x-4 mt-1">
                                        <span className="text-sm text-gray-500">
                                            <GitBranch className="w-4 h-4 inline mr-1" />
                                            {execution.branch}
                                        </span>
                                        <span className="text-sm text-gray-500">
                                            <Server className="w-4 h-4 inline mr-1" />
                                            {execution.environment}
                                        </span>
                                        <span className="text-sm text-gray-500">
                                            <User className="w-4 h-4 inline mr-1" />
                                            {execution.executor}
                                        </span>
                                        <span className="text-sm text-gray-500">
                                            Trigger: {execution.trigger}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center space-x-2">
                                <button className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg">
                                    <Play className="w-4 h-4" />
                                </button>
                                <button className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg">
                                    <Square className="w-4 h-4" />
                                </button>
                                <button className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-lg">
                                    <RotateCcw className="w-4 h-4" />
                                </button>
                                <button className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-lg">
                                    <Terminal className="w-4 h-4" />
                                </button>
                                <button className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-lg">
                                    <Settings className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
                            <div className="flex items-center space-x-2">
                                {getStatusIcon(execution.status)}
                                <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(execution.status)}`}>
                                    {execution.status}
                                </span>
                            </div>
                            <div className="text-sm text-gray-600">
                                <span className="font-medium">Started:</span> {execution.startTime}
                            </div>
                            <div className="text-sm text-gray-600">
                                <span className="font-medium">Duration:</span> {execution.estimatedTime}
                            </div>
                            <div className="text-sm text-gray-600">
                                <span className="font-medium">Coverage:</span> {execution.coverage}%
                            </div>
                            <div className="text-sm text-gray-600">
                                <span className="font-medium">Performance:</span>
                                <span className={`ml-1 ${getPerformanceColor(execution.performance)}`}>
                                    {execution.performance}
                                </span>
                            </div>
                        </div>

                        {/* Progress Bar */}
                        {execution.status === 'running' && (
                            <div className="mb-4">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-medium text-gray-700">Progress</span>
                                    <span className="text-sm text-gray-500">{execution.progress}%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                        style={{ width: `${execution.progress}%` }}
                                    />
                                </div>
                            </div>
                        )}

                        {/* Test Results */}
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
                            <div className="text-center">
                                <div className="text-lg font-bold text-gray-900">{execution.tests.total}</div>
                                <div className="text-xs text-gray-500">Total</div>
                            </div>
                            <div className="text-center">
                                <div className="text-lg font-bold text-green-600">{execution.tests.passed}</div>
                                <div className="text-xs text-gray-500">Passed</div>
                            </div>
                            <div className="text-center">
                                <div className="text-lg font-bold text-red-600">{execution.tests.failed}</div>
                                <div className="text-xs text-gray-500">Failed</div>
                            </div>
                            <div className="text-center">
                                <div className="text-lg font-bold text-blue-600">{execution.tests.running}</div>
                                <div className="text-xs text-gray-500">Running</div>
                            </div>
                            <div className="text-center">
                                <div className="text-lg font-bold text-gray-600">{execution.tests.remaining}</div>
                                <div className="text-xs text-gray-500">Remaining</div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Execution Steps Timeline */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Current Execution Steps</h3>

                <div className="space-y-4">
                    {executionSteps.map((step, index) => (
                        <div key={index} className="flex items-center space-x-4">
                            <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${getStepStatusColor(step.status)}`}>
                                {step.status === 'completed' && <CheckCircle className="w-4 h-4" />}
                                {step.status === 'running' && <Timer className="w-4 h-4" />}
                                {step.status === 'pending' && <Clock className="w-4 h-4" />}
                                {step.status === 'failed' && <XCircle className="w-4 h-4" />}
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center justify-between">
                                    <span className="font-medium text-gray-900">{step.name}</span>
                                    <span className="text-sm text-gray-500">{step.duration}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Real-time Execution Metrics */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Real-time Execution Metrics</h3>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="text-center">
                        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                            <Activity className="w-8 h-8 text-blue-600" />
                        </div>
                        <div className="text-2xl font-bold text-gray-900">3</div>
                        <div className="text-sm text-gray-500">Active Executions</div>
                    </div>

                    <div className="text-center">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                            <Target className="w-8 h-8 text-green-600" />
                        </div>
                        <div className="text-2xl font-bold text-gray-900">84.2%</div>
                        <div className="text-sm text-gray-500">Avg Coverage</div>
                    </div>

                    <div className="text-center">
                        <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                            <Zap className="w-8 h-8 text-purple-600" />
                        </div>
                        <div className="text-2xl font-bold text-gray-900">6m 45s</div>
                        <div className="text-sm text-gray-500">Avg Duration</div>
                    </div>

                    <div className="text-center">
                        <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                            <BarChart3 className="w-8 h-8 text-orange-600" />
                        </div>
                        <div className="text-2xl font-bold text-gray-900">92.4%</div>
                        <div className="text-sm text-gray-500">Success Rate</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
