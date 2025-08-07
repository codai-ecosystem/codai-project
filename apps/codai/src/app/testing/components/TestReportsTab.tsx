import React, { useState } from 'react';
import {
    FileText,
    Download,
    TrendingUp,
    TrendingDown,
    BarChart3,
    PieChart,
    Calendar,
    Clock,
    CheckCircle,
    XCircle,
    AlertTriangle,
    Target,
    Users,
    GitBranch,
    Filter,
    Search,
    RefreshCw,
    Mail,
    Share2,
    Archive
} from 'lucide-react';

export function TestReportsTab() {
    const [selectedPeriod, setSelectedPeriod] = useState('7d');
    const [selectedReport, setSelectedReport] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');

    const testReports = [
        {
            id: 1,
            name: 'Daily Test Execution Report',
            type: 'execution',
            status: 'generated',
            lastGenerated: '2024-01-15 14:30:00',
            coverage: '87.3%',
            successRate: '94.2%',
            totalTests: 1247,
            passedTests: 1175,
            failedTests: 72,
            duration: '45m 23s',
            size: '2.4 MB',
            recipients: ['dev-team@company.com', 'qa-team@company.com'],
            trend: 'up'
        },
        {
            id: 2,
            name: 'Weekly Quality Assessment',
            type: 'quality',
            status: 'generating',
            lastGenerated: '2024-01-15 12:00:00',
            coverage: '89.1%',
            successRate: '91.8%',
            totalTests: 8934,
            passedTests: 8201,
            failedTests: 733,
            duration: '5h 12m',
            size: '15.7 MB',
            recipients: ['management@company.com', 'tech-leads@company.com'],
            trend: 'stable'
        },
        {
            id: 3,
            name: 'Security Test Analysis',
            type: 'security',
            status: 'failed',
            lastGenerated: '2024-01-15 10:15:00',
            coverage: '76.4%',
            successRate: '88.3%',
            totalTests: 567,
            passedTests: 501,
            failedTests: 66,
            duration: '2h 34m',
            size: '8.9 MB',
            recipients: ['security@company.com'],
            trend: 'down'
        },
        {
            id: 4,
            name: 'Performance Benchmark Report',
            type: 'performance',
            status: 'scheduled',
            lastGenerated: '2024-01-14 18:00:00',
            coverage: '82.7%',
            successRate: '96.1%',
            totalTests: 234,
            passedTests: 225,
            failedTests: 9,
            duration: '1h 45m',
            size: '5.2 MB',
            recipients: ['performance-team@company.com'],
            trend: 'up'
        },
        {
            id: 5,
            name: 'Regression Test Summary',
            type: 'regression',
            status: 'generated',
            lastGenerated: '2024-01-15 13:45:00',
            coverage: '91.5%',
            successRate: '97.8%',
            totalTests: 1834,
            passedTests: 1794,
            failedTests: 40,
            duration: '3h 28m',
            size: '12.1 MB',
            recipients: ['release-team@company.com'],
            trend: 'up'
        }
    ];

    const reportMetrics = {
        totalReports: 127,
        reportsThisWeek: 23,
        avgSuccessRate: 93.2,
        avgCoverage: 86.8,
        totalTestsRun: 45670,
        avgExecutionTime: '2h 45m'
    };

    const chartData = {
        successRateHistory: [
            { date: '2024-01-08', rate: 89.2 },
            { date: '2024-01-09', rate: 91.5 },
            { date: '2024-01-10', rate: 88.7 },
            { date: '2024-01-11', rate: 93.1 },
            { date: '2024-01-12', rate: 94.8 },
            { date: '2024-01-13', rate: 92.3 },
            { date: '2024-01-14', rate: 95.1 },
            { date: '2024-01-15', rate: 93.7 }
        ],
        coverageHistory: [
            { date: '2024-01-08', coverage: 84.1 },
            { date: '2024-01-09', coverage: 85.3 },
            { date: '2024-01-10', coverage: 83.9 },
            { date: '2024-01-11', coverage: 87.2 },
            { date: '2024-01-12', coverage: 88.5 },
            { date: '2024-01-13', coverage: 86.7 },
            { date: '2024-01-14', coverage: 89.1 },
            { date: '2024-01-15', coverage: 87.8 }
        ]
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'generated': return <CheckCircle className="w-4 h-4 text-green-600" />;
            case 'failed': return <XCircle className="w-4 h-4 text-red-600" />;
            case 'generating': return <RefreshCw className="w-4 h-4 text-blue-600 animate-spin" />;
            case 'scheduled': return <Clock className="w-4 h-4 text-yellow-600" />;
            default: return <Clock className="w-4 h-4 text-gray-400" />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'generated': return 'text-green-600 bg-green-100 border-green-200';
            case 'failed': return 'text-red-600 bg-red-100 border-red-200';
            case 'generating': return 'text-blue-600 bg-blue-100 border-blue-200';
            case 'scheduled': return 'text-yellow-600 bg-yellow-100 border-yellow-200';
            default: return 'text-gray-600 bg-gray-100 border-gray-200';
        }
    };

    const getTrendIcon = (trend: string) => {
        switch (trend) {
            case 'up': return <TrendingUp className="w-4 h-4 text-green-600" />;
            case 'down': return <TrendingDown className="w-4 h-4 text-red-600" />;
            case 'stable': return <BarChart3 className="w-4 h-4 text-blue-600" />;
            default: return <BarChart3 className="w-4 h-4 text-gray-400" />;
        }
    };

    const getReportTypeColor = (type: string) => {
        switch (type) {
            case 'execution': return 'bg-blue-100 text-blue-600';
            case 'quality': return 'bg-green-100 text-green-600';
            case 'security': return 'bg-red-100 text-red-600';
            case 'performance': return 'bg-purple-100 text-purple-600';
            case 'regression': return 'bg-orange-100 text-orange-600';
            default: return 'bg-gray-100 text-gray-600';
        }
    };

    const filteredReports = testReports.filter(report => {
        const matchesType = selectedReport === 'all' || report.type === selectedReport;
        const matchesSearch = report.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            report.type.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesType && matchesSearch;
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
                            placeholder="Search reports..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>

                    <select
                        value={selectedReport}
                        onChange={(e) => setSelectedReport(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        <option value="all">All Types</option>
                        <option value="execution">Execution</option>
                        <option value="quality">Quality</option>
                        <option value="security">Security</option>
                        <option value="performance">Performance</option>
                        <option value="regression">Regression</option>
                    </select>

                    <select
                        value={selectedPeriod}
                        onChange={(e) => setSelectedPeriod(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        <option value="1d">Last 24 Hours</option>
                        <option value="7d">Last 7 Days</option>
                        <option value="30d">Last 30 Days</option>
                        <option value="90d">Last 90 Days</option>
                    </select>
                </div>

                <div className="flex items-center space-x-3">
                    <button className="flex items-center px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                        <Archive className="w-4 h-4 mr-2" />
                        Archive
                    </button>
                    <button className="flex items-center px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                        <Share2 className="w-4 h-4 mr-2" />
                        Share
                    </button>
                    <button className="flex items-center px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700">
                        <FileText className="w-4 h-4 mr-2" />
                        Generate Report
                    </button>
                </div>
            </div>

            {/* Report Metrics Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6">
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Total Reports</p>
                            <p className="text-2xl font-bold text-gray-900">{reportMetrics.totalReports}</p>
                        </div>
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <FileText className="w-5 h-5 text-blue-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">This Week</p>
                            <p className="text-2xl font-bold text-gray-900">{reportMetrics.reportsThisWeek}</p>
                        </div>
                        <div className="p-2 bg-green-100 rounded-lg">
                            <Calendar className="w-5 h-5 text-green-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Success Rate</p>
                            <p className="text-2xl font-bold text-gray-900">{reportMetrics.avgSuccessRate}%</p>
                        </div>
                        <div className="p-2 bg-green-100 rounded-lg">
                            <Target className="w-5 h-5 text-green-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Coverage</p>
                            <p className="text-2xl font-bold text-gray-900">{reportMetrics.avgCoverage}%</p>
                        </div>
                        <div className="p-2 bg-purple-100 rounded-lg">
                            <PieChart className="w-5 h-5 text-purple-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Tests Run</p>
                            <p className="text-2xl font-bold text-gray-900">{reportMetrics.totalTestsRun.toLocaleString()}</p>
                        </div>
                        <div className="p-2 bg-orange-100 rounded-lg">
                            <BarChart3 className="w-5 h-5 text-orange-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Avg Duration</p>
                            <p className="text-2xl font-bold text-gray-900">{reportMetrics.avgExecutionTime}</p>
                        </div>
                        <div className="p-2 bg-red-100 rounded-lg">
                            <Clock className="w-5 h-5 text-red-600" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Success Rate Trend</h3>
                    <div className="h-64 flex items-end justify-between space-x-2">
                        {chartData.successRateHistory.map((data, index) => (
                            <div key={index} className="flex flex-col items-center">
                                <div
                                    className="w-8 bg-blue-600 rounded-t"
                                    style={{ height: `${(data.rate / 100) * 200}px` }}
                                />
                                <span className="text-xs text-gray-500 mt-2 transform rotate-45 origin-left">
                                    {data.date.split('-')[2]}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Coverage Trend</h3>
                    <div className="h-64 flex items-end justify-between space-x-2">
                        {chartData.coverageHistory.map((data, index) => (
                            <div key={index} className="flex flex-col items-center">
                                <div
                                    className="w-8 bg-green-600 rounded-t"
                                    style={{ height: `${(data.coverage / 100) * 200}px` }}
                                />
                                <span className="text-xs text-gray-500 mt-2 transform rotate-45 origin-left">
                                    {data.date.split('-')[2]}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Reports List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">Test Reports</h3>
                </div>

                <div className="divide-y divide-gray-200">
                    {filteredReports.map((report) => (
                        <div key={report.id} className="p-6 hover:bg-gray-50">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center space-x-4">
                                    <div className="p-2 bg-gray-100 rounded-lg">
                                        <FileText className="w-5 h-5 text-gray-600" />
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-semibold text-gray-900">{report.name}</h4>
                                        <div className="flex items-center space-x-4 mt-1">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getReportTypeColor(report.type)}`}>
                                                {report.type}
                                            </span>
                                            <span className="text-sm text-gray-500">
                                                Last generated: {new Date(report.lastGenerated).toLocaleString()}
                                            </span>
                                            <span className="text-sm text-gray-500">Size: {report.size}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center space-x-2">
                                    {getStatusIcon(report.status)}
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(report.status)}`}>
                                        {report.status}
                                    </span>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
                                <div className="text-center">
                                    <div className="text-lg font-bold text-gray-900">{report.totalTests}</div>
                                    <div className="text-xs text-gray-500">Total Tests</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-lg font-bold text-green-600">{report.passedTests}</div>
                                    <div className="text-xs text-gray-500">Passed</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-lg font-bold text-red-600">{report.failedTests}</div>
                                    <div className="text-xs text-gray-500">Failed</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-lg font-bold text-blue-600">{report.coverage}</div>
                                    <div className="text-xs text-gray-500">Coverage</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-lg font-bold text-purple-600">{report.successRate}</div>
                                    <div className="text-xs text-gray-500">Success Rate</div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-4">
                                    <div className="flex items-center space-x-2">
                                        {getTrendIcon(report.trend)}
                                        <span className="text-sm text-gray-600">
                                            Duration: {report.duration}
                                        </span>
                                    </div>
                                    <div className="flex items-center space-x-1">
                                        <Users className="w-4 h-4 text-gray-400" />
                                        <span className="text-sm text-gray-600">
                                            {report.recipients.length} recipients
                                        </span>
                                    </div>
                                </div>

                                <div className="flex items-center space-x-2">
                                    <button className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg">
                                        <Download className="w-4 h-4" />
                                    </button>
                                    <button className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg">
                                        <Mail className="w-4 h-4" />
                                    </button>
                                    <button className="p-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg">
                                        <Share2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
