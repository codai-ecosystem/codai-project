import React from 'react';
import {
    TestTube,
    CheckCircle,
    XCircle,
    Clock,
    AlertTriangle,
    TrendingUp,
    TrendingDown,
    Activity,
    Target,
    Play,
    Zap,
    Shield,
    BarChart3,
    Users,
    Calendar
} from 'lucide-react';

export function TestingSuiteOverview() {
    const stats = [
        {
            label: 'Total Test Cases',
            value: '2,847',
            change: '+124',
            trend: 'up',
            icon: TestTube,
            color: 'blue'
        },
        {
            label: 'Pass Rate',
            value: '94.2%',
            change: '+2.1%',
            trend: 'up',
            icon: CheckCircle,
            color: 'green'
        },
        {
            label: 'Execution Time',
            value: '12m 34s',
            change: '-2m 15s',
            trend: 'up',
            icon: Clock,
            color: 'purple'
        },
        {
            label: 'Code Coverage',
            value: '87.6%',
            change: '+1.4%',
            trend: 'up',
            icon: Target,
            color: 'orange'
        }
    ];

    const recentTestRuns = [
        {
            suite: 'Frontend Unit Tests',
            status: 'passed',
            duration: '3m 45s',
            coverage: '92.4%',
            tests: { passed: 234, failed: 0, skipped: 3 },
            time: '5 minutes ago',
            environment: 'development'
        },
        {
            suite: 'API Integration Tests',
            status: 'failed',
            duration: '8m 12s',
            coverage: '78.9%',
            tests: { passed: 145, failed: 3, skipped: 1 },
            time: '15 minutes ago',
            environment: 'staging'
        },
        {
            suite: 'E2E User Flows',
            status: 'running',
            duration: '4m 23s',
            coverage: '65.2%',
            tests: { passed: 12, failed: 0, skipped: 0 },
            time: 'Running now',
            environment: 'testing'
        },
        {
            suite: 'Performance Tests',
            status: 'passed',
            duration: '15m 56s',
            coverage: '45.8%',
            tests: { passed: 67, failed: 2, skipped: 5 },
            time: '1 hour ago',
            environment: 'production'
        }
    ];

    const testCategories = [
        { name: 'Unit Tests', count: 1247, passed: 1189, failed: 58, coverage: 94.2 },
        { name: 'Integration Tests', count: 567, passed: 521, failed: 46, coverage: 86.7 },
        { name: 'E2E Tests', count: 234, passed: 198, failed: 36, coverage: 72.3 },
        { name: 'Performance Tests', count: 89, passed: 76, failed: 13, coverage: 45.6 },
        { name: 'Security Tests', count: 156, passed: 142, failed: 14, coverage: 68.9 },
        { name: 'Accessibility Tests', count: 78, passed: 71, failed: 7, coverage: 82.1 }
    ];

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'passed': return <CheckCircle className="w-4 h-4 text-green-600" />;
            case 'failed': return <XCircle className="w-4 h-4 text-red-600" />;
            case 'running': return <Play className="w-4 h-4 text-blue-600 animate-pulse" />;
            default: return <Clock className="w-4 h-4 text-gray-400" />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'passed': return 'text-green-600 bg-green-100 border-green-200';
            case 'failed': return 'text-red-600 bg-red-100 border-red-200';
            case 'running': return 'text-blue-600 bg-blue-100 border-blue-200';
            default: return 'text-gray-600 bg-gray-100 border-gray-200';
        }
    };

    const getCoverageColor = (coverage: number) => {
        if (coverage >= 90) return 'text-green-600';
        if (coverage >= 70) return 'text-yellow-600';
        return 'text-red-600';
    };

    return (
        <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {stats.map((stat, index) => (
                    <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                        <div className="flex items-center justify-between mb-4">
                            <stat.icon className={`w-8 h-8 text-${stat.color}-600`} />
                            <div className="flex items-center space-x-1">
                                {stat.trend === 'up' ? (
                                    <TrendingUp className="w-4 h-4 text-green-600" />
                                ) : (
                                    <TrendingDown className="w-4 h-4 text-red-600" />
                                )}
                                <span className={`text-sm font-medium ${stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'
                                    }`}>
                                    {stat.change}
                                </span>
                            </div>
                        </div>
                        <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                        <p className="text-gray-600 text-sm">{stat.label}</p>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Test Runs */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-semibold text-gray-900">Recent Test Runs</h3>
                        <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">View all</button>
                    </div>

                    <div className="space-y-4">
                        {recentTestRuns.map((run, index) => (
                            <div key={index} className="p-4 bg-gray-50 rounded-lg">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center space-x-3">
                                        {getStatusIcon(run.status)}
                                        <div>
                                            <div className="font-medium text-gray-900">{run.suite}</div>
                                            <div className="text-sm text-gray-500">{run.environment} • {run.time}</div>
                                        </div>
                                    </div>
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(run.status)}`}>
                                        {run.status}
                                    </span>
                                </div>

                                <div className="grid grid-cols-3 gap-4 text-sm">
                                    <div>
                                        <span className="text-gray-500">Duration:</span>
                                        <div className="font-medium">{run.duration}</div>
                                    </div>
                                    <div>
                                        <span className="text-gray-500">Coverage:</span>
                                        <div className={`font-medium ${getCoverageColor(parseFloat(run.coverage))}`}>
                                            {run.coverage}
                                        </div>
                                    </div>
                                    <div>
                                        <span className="text-gray-500">Tests:</span>
                                        <div className="font-medium">
                                            <span className="text-green-600">{run.tests.passed}</span> /
                                            <span className="text-red-600 ml-1">{run.tests.failed}</span> /
                                            <span className="text-gray-500 ml-1">{run.tests.skipped}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Test Categories */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-6">Test Categories</h3>

                    <div className="space-y-4">
                        {testCategories.map((category, index) => (
                            <div key={index} className="p-4 border border-gray-200 rounded-lg">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="font-medium text-gray-900">{category.name}</div>
                                    <div className="text-sm text-gray-500">{category.count} tests</div>
                                </div>

                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center space-x-4 text-sm">
                                        <span className="text-green-600">✓ {category.passed}</span>
                                        <span className="text-red-600">✗ {category.failed}</span>
                                    </div>
                                    <div className={`text-sm font-medium ${getCoverageColor(category.coverage)}`}>
                                        {category.coverage}% coverage
                                    </div>
                                </div>

                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                        className="bg-green-600 h-2 rounded-full"
                                        style={{ width: `${(category.passed / category.count) * 100}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Testing Metrics Dashboard */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Testing Performance Metrics</h3>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="text-center">
                        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                            <BarChart3 className="w-8 h-8 text-blue-600" />
                        </div>
                        <div className="text-2xl font-bold text-gray-900">94.2%</div>
                        <div className="text-sm text-gray-500">Overall Pass Rate</div>
                        <div className="text-xs text-green-600 mt-1">+2.1% this week</div>
                    </div>

                    <div className="text-center">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                            <Target className="w-8 h-8 text-green-600" />
                        </div>
                        <div className="text-2xl font-bold text-gray-900">87.6%</div>
                        <div className="text-sm text-gray-500">Code Coverage</div>
                        <div className="text-xs text-green-600 mt-1">+1.4% improvement</div>
                    </div>

                    <div className="text-center">
                        <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                            <Zap className="w-8 h-8 text-purple-600" />
                        </div>
                        <div className="text-2xl font-bold text-gray-900">12m 34s</div>
                        <div className="text-sm text-gray-500">Avg Execution Time</div>
                        <div className="text-xs text-green-600 mt-1">-2m 15s faster</div>
                    </div>

                    <div className="text-center">
                        <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                            <Activity className="w-8 h-8 text-orange-600" />
                        </div>
                        <div className="text-2xl font-bold text-gray-900">156</div>
                        <div className="text-sm text-gray-500">Daily Test Runs</div>
                        <div className="text-xs text-blue-600 mt-1">+23 this week</div>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Quick Actions</h3>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {[
                        {
                            icon: Play,
                            label: 'Run All Tests',
                            desc: 'Execute complete test suite',
                            color: 'blue'
                        },
                        {
                            icon: TestTube,
                            label: 'Create Test Case',
                            desc: 'Add new test scenario',
                            color: 'green'
                        },
                        {
                            icon: Shield,
                            label: 'Security Audit',
                            desc: 'Run security tests',
                            color: 'red'
                        },
                        {
                            icon: BarChart3,
                            label: 'Generate Report',
                            desc: 'Create test report',
                            color: 'purple'
                        }
                    ].map((action, index) => (
                        <button key={index} className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left">
                            <action.icon className={`w-6 h-6 text-${action.color}-600 mb-2`} />
                            <div className="font-medium text-gray-900">{action.label}</div>
                            <div className="text-sm text-gray-500">{action.desc}</div>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
