import React, { useState } from 'react';
import {
    BarChart3,
    TrendingUp,
    TrendingDown,
    Clock,
    Users,
    GitPullRequest,
    CheckCircle,
    AlertCircle,
    Calendar,
    Filter,
    Download,
    Share,
    RefreshCw,
    Target,
    Zap,
    Award,
    Activity,
    MessageSquare,
    FileText,
    ThumbsUp,
    Eye
} from 'lucide-react';

export function ReviewMetricsTab() {
    const [selectedPeriod, setSelectedPeriod] = useState('7days');
    const [selectedMetric, setSelectedMetric] = useState('review-time');

    const metricsOverview = {
        averageReviewTime: {
            value: '2.4',
            unit: 'hours',
            change: -12.5,
            trend: 'down',
            target: '2.0 hours'
        },
        reviewThroughput: {
            value: '42',
            unit: 'reviews/day',
            change: 8.3,
            trend: 'up',
            target: '45 reviews/day'
        },
        firstResponseTime: {
            value: '35',
            unit: 'minutes',
            change: -18.2,
            trend: 'down',
            target: '30 minutes'
        },
        approvalRate: {
            value: '76.8',
            unit: '%',
            change: 2.1,
            trend: 'up',
            target: '80%'
        },
        reopenRate: {
            value: '8.2',
            unit: '%',
            change: -1.3,
            trend: 'down',
            target: '< 5%'
        },
        participationRate: {
            value: '94.5',
            unit: '%',
            change: 3.2,
            trend: 'up',
            target: '95%'
        }
    };

    const reviewerPerformance = [
        {
            id: 1,
            name: 'Alice Smith',
            avatar: '/avatars/alice.jpg',
            reviewsCompleted: 28,
            averageTime: '1.8h',
            qualityScore: 4.8,
            responseTime: '22min',
            thoroughness: 92,
            consistency: 88,
            helpfulness: 95,
            trend: 'up'
        },
        {
            id: 2,
            name: 'Bob Johnson',
            avatar: '/avatars/bob.jpg',
            reviewsCompleted: 35,
            averageTime: '2.1h',
            qualityScore: 4.6,
            responseTime: '28min',
            thoroughness: 89,
            consistency: 91,
            helpfulness: 87,
            trend: 'stable'
        },
        {
            id: 3,
            name: 'Carol Wilson',
            avatar: '/avatars/carol.jpg',
            reviewsCompleted: 22,
            averageTime: '3.2h',
            qualityScore: 4.9,
            responseTime: '18min',
            thoroughness: 96,
            consistency: 94,
            helpfulness: 98,
            trend: 'up'
        },
        {
            id: 4,
            name: 'David Brown',
            avatar: '/avatars/david.jpg',
            reviewsCompleted: 31,
            averageTime: '2.5h',
            qualityScore: 4.4,
            responseTime: '42min',
            thoroughness: 85,
            consistency: 82,
            helpfulness: 89,
            trend: 'down'
        },
        {
            id: 5,
            name: 'Emma Davis',
            avatar: '/avatars/emma.jpg',
            reviewsCompleted: 19,
            averageTime: '1.9h',
            qualityScore: 4.7,
            responseTime: '31min',
            thoroughness: 90,
            consistency: 87,
            helpfulness: 93,
            trend: 'up'
        }
    ];

    const teamMetrics = [
        {
            team: 'Frontend Team',
            members: 8,
            reviewsCompleted: 156,
            averageTime: '2.1h',
            qualityScore: 4.6,
            bottlenecks: 2,
            efficiency: 87
        },
        {
            team: 'Backend Team',
            members: 6,
            reviewsCompleted: 124,
            averageTime: '2.8h',
            qualityScore: 4.8,
            bottlenecks: 1,
            efficiency: 92
        },
        {
            team: 'DevOps Team',
            members: 4,
            reviewsCompleted: 78,
            averageTime: '1.9h',
            qualityScore: 4.5,
            bottlenecks: 0,
            efficiency: 94
        },
        {
            team: 'Mobile Team',
            members: 5,
            reviewsCompleted: 89,
            averageTime: '2.4h',
            qualityScore: 4.7,
            bottlenecks: 1,
            efficiency: 89
        }
    ];

    const codeQualityMetrics = {
        defectEscapeRate: 3.2,
        codeComplexity: 7.4,
        testCoverage: 84.6,
        technicalDebt: 12.8,
        maintainabilityIndex: 78.3,
        duplicateCode: 5.1
    };

    const getTrendIcon = (trend: string) => {
        switch (trend) {
            case 'up': return <TrendingUp className="w-4 h-4 text-green-600" />;
            case 'down': return <TrendingDown className="w-4 h-4 text-red-600" />;
            default: return <Activity className="w-4 h-4 text-gray-400" />;
        }
    };

    const getTrendColor = (trend: string) => {
        switch (trend) {
            case 'up': return 'text-green-600';
            case 'down': return 'text-red-600';
            default: return 'text-gray-500';
        }
    };

    const getChangeColor = (change: number) => {
        return change > 0 ? 'text-green-600' : change < 0 ? 'text-red-600' : 'text-gray-500';
    };

    const getPerformanceColor = (score: number) => {
        if (score >= 90) return 'text-green-600 bg-green-100';
        if (score >= 80) return 'text-yellow-600 bg-yellow-100';
        return 'text-red-600 bg-red-100';
    };

    return (
        <div className="space-y-6">
            {/* Header Controls */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex items-center space-x-4">
                    <select
                        value={selectedPeriod}
                        onChange={(e) => setSelectedPeriod(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        <option value="24hours">Last 24 Hours</option>
                        <option value="7days">Last 7 Days</option>
                        <option value="30days">Last 30 Days</option>
                        <option value="90days">Last 90 Days</option>
                        <option value="custom">Custom Range</option>
                    </select>

                    <select
                        value={selectedMetric}
                        onChange={(e) => setSelectedMetric(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        <option value="review-time">Review Time</option>
                        <option value="throughput">Throughput</option>
                        <option value="quality">Quality Score</option>
                        <option value="participation">Participation</option>
                    </select>
                </div>

                <div className="flex items-center space-x-3">
                    <button className="flex items-center px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Refresh
                    </button>
                    <button className="flex items-center px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                        <Share className="w-4 h-4 mr-2" />
                        Share
                    </button>
                    <button className="flex items-center px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700">
                        <Download className="w-4 h-4 mr-2" />
                        Export
                    </button>
                </div>
            </div>

            {/* Key Metrics Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Object.entries(metricsOverview).map(([key, metric]) => (
                    <div key={key} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-medium text-gray-500 capitalize">
                                {key.replace(/([A-Z])/g, ' $1').trim()}
                            </h3>
                            {getTrendIcon(metric.trend)}
                        </div>

                        <div className="flex items-baseline space-x-2 mb-2">
                            <span className="text-2xl font-bold text-gray-900">{metric.value}</span>
                            <span className="text-sm text-gray-500">{metric.unit}</span>
                        </div>

                        <div className="flex items-center justify-between">
                            <span className={`text-sm font-medium ${getChangeColor(metric.change)}`}>
                                {metric.change > 0 ? '+' : ''}{metric.change}%
                            </span>
                            <span className="text-xs text-gray-400">Target: {metric.target}</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Reviewer Performance */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-900">Reviewer Performance</h3>
                        <div className="flex items-center space-x-2">
                            <Filter className="w-4 h-4 text-gray-400" />
                            <select className="text-sm border border-gray-300 rounded-lg px-3 py-1">
                                <option>All Reviewers</option>
                                <option>Top Performers</option>
                                <option>Needs Improvement</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Reviewer
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Reviews Completed
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Average Time
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Quality Score
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Response Time
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Performance
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Trend
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {reviewerPerformance.map((reviewer) => (
                                <tr key={reviewer.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                                                <span className="text-sm font-medium text-blue-600">
                                                    {reviewer.name.split(' ').map(n => n[0]).join('')}
                                                </span>
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-gray-900">{reviewer.name}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">{reviewer.reviewsCompleted}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">{reviewer.averageTime}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="text-sm text-gray-900">{reviewer.qualityScore}</div>
                                            <div className="ml-2 flex">
                                                {[...Array(5)].map((_, i) => (
                                                    <div
                                                        key={i}
                                                        className={`w-2 h-2 rounded-full ${i < Math.floor(reviewer.qualityScore) ? 'bg-yellow-400' : 'bg-gray-200'
                                                            }`}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">{reviewer.responseTime}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="space-y-1">
                                            <div className="flex items-center justify-between text-xs">
                                                <span>Thoroughness</span>
                                                <span className={`font-medium ${getPerformanceColor(reviewer.thoroughness)}`}>
                                                    {reviewer.thoroughness}%
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between text-xs">
                                                <span>Consistency</span>
                                                <span className={`font-medium ${getPerformanceColor(reviewer.consistency)}`}>
                                                    {reviewer.consistency}%
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between text-xs">
                                                <span>Helpfulness</span>
                                                <span className={`font-medium ${getPerformanceColor(reviewer.helpfulness)}`}>
                                                    {reviewer.helpfulness}%
                                                </span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className={`flex items-center ${getTrendColor(reviewer.trend)}`}>
                                            {getTrendIcon(reviewer.trend)}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Team Performance */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">Team Performance</h3>
                </div>

                <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {teamMetrics.map((team, index) => (
                            <div key={index} className="p-4 border border-gray-200 rounded-lg">
                                <div className="flex items-center justify-between mb-4">
                                    <h4 className="font-medium text-gray-900">{team.team}</h4>
                                    <span className="text-sm text-gray-500">{team.members} members</span>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-600">Reviews</span>
                                        <span className="text-sm font-medium text-gray-900">{team.reviewsCompleted}</span>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-600">Avg Time</span>
                                        <span className="text-sm font-medium text-gray-900">{team.averageTime}</span>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-600">Quality</span>
                                        <span className="text-sm font-medium text-gray-900">{team.qualityScore}</span>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-600">Bottlenecks</span>
                                        <span className={`text-sm font-medium ${team.bottlenecks === 0 ? 'text-green-600' :
                                                team.bottlenecks <= 2 ? 'text-yellow-600' : 'text-red-600'
                                            }`}>
                                            {team.bottlenecks}
                                        </span>
                                    </div>

                                    <div className="pt-2">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-sm text-gray-600">Efficiency</span>
                                            <span className="text-sm font-medium text-gray-900">{team.efficiency}%</span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div
                                                className={`h-2 rounded-full ${team.efficiency >= 90 ? 'bg-green-500' :
                                                        team.efficiency >= 80 ? 'bg-yellow-500' : 'bg-red-500'
                                                    }`}
                                                style={{ width: `${team.efficiency}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Code Quality Metrics */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">Code Quality Impact</h3>
                </div>

                <div className="p-6">
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                <AlertCircle className="w-8 h-8 text-red-600" />
                            </div>
                            <div className="text-2xl font-bold text-gray-900">{codeQualityMetrics.defectEscapeRate}%</div>
                            <div className="text-sm text-gray-500">Defect Escape Rate</div>
                        </div>

                        <div className="text-center">
                            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                <BarChart3 className="w-8 h-8 text-yellow-600" />
                            </div>
                            <div className="text-2xl font-bold text-gray-900">{codeQualityMetrics.codeComplexity}</div>
                            <div className="text-sm text-gray-500">Code Complexity</div>
                        </div>

                        <div className="text-center">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                <CheckCircle className="w-8 h-8 text-green-600" />
                            </div>
                            <div className="text-2xl font-bold text-gray-900">{codeQualityMetrics.testCoverage}%</div>
                            <div className="text-sm text-gray-500">Test Coverage</div>
                        </div>

                        <div className="text-center">
                            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                <Clock className="w-8 h-8 text-orange-600" />
                            </div>
                            <div className="text-2xl font-bold text-gray-900">{codeQualityMetrics.technicalDebt}%</div>
                            <div className="text-sm text-gray-500">Technical Debt</div>
                        </div>

                        <div className="text-center">
                            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                <Target className="w-8 h-8 text-blue-600" />
                            </div>
                            <div className="text-2xl font-bold text-gray-900">{codeQualityMetrics.maintainabilityIndex}</div>
                            <div className="text-sm text-gray-500">Maintainability</div>
                        </div>

                        <div className="text-center">
                            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                <FileText className="w-8 h-8 text-purple-600" />
                            </div>
                            <div className="text-2xl font-bold text-gray-900">{codeQualityMetrics.duplicateCode}%</div>
                            <div className="text-sm text-gray-500">Duplicate Code</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Insights and Recommendations */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">Insights & Recommendations</h3>
                </div>

                <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <h4 className="font-medium text-gray-900 flex items-center">
                                <Award className="w-5 h-5 text-yellow-500 mr-2" />
                                Top Performers
                            </h4>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                                    <div>
                                        <div className="font-medium text-green-900">Carol Wilson</div>
                                        <div className="text-sm text-green-600">Highest quality scores with excellent thoroughness</div>
                                    </div>
                                    <ThumbsUp className="w-5 h-5 text-green-600" />
                                </div>
                                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                                    <div>
                                        <div className="font-medium text-blue-900">Alice Smith</div>
                                        <div className="text-sm text-blue-600">Fastest response times with consistent quality</div>
                                    </div>
                                    <Zap className="w-5 h-5 text-blue-600" />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h4 className="font-medium text-gray-900 flex items-center">
                                <Eye className="w-5 h-5 text-orange-500 mr-2" />
                                Areas for Improvement
                            </h4>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                                    <div>
                                        <div className="font-medium text-yellow-900">David Brown</div>
                                        <div className="text-sm text-yellow-600">Consider improving response time and consistency</div>
                                    </div>
                                    <Clock className="w-5 h-5 text-yellow-600" />
                                </div>
                                <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                                    <div>
                                        <div className="font-medium text-red-900">Frontend Team</div>
                                        <div className="text-sm text-red-600">Address bottlenecks affecting review throughput</div>
                                    </div>
                                    <AlertCircle className="w-5 h-5 text-red-600" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
