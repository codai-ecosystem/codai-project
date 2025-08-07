import React from 'react';
import {
    GitPullRequest,
    Users,
    Clock,
    CheckCircle,
    XCircle,
    AlertTriangle,
    TrendingUp,
    TrendingDown,
    BarChart3,
    Activity,
    FileText,
    MessageSquare,
    Star,
    GitBranch,
    Calendar,
    User,
    Timer,
    Target
} from 'lucide-react';

export function CodeReviewOverview() {
    const reviewStats = {
        totalReviews: 156,
        pendingReviews: 24,
        completedReviews: 132,
        avgReviewTime: '2h 45m',
        avgCommentsPerReview: 8.3,
        approvalRate: 87.4,
        weeklyTrend: 12.5
    };

    const recentReviews = [
        {
            id: 1,
            title: 'Implement user authentication with JWT',
            author: 'John Doe',
            reviewers: ['Alice Smith', 'Bob Johnson'],
            status: 'approved',
            createdAt: '2024-01-15 14:30:00',
            updatedAt: '2024-01-15 16:45:00',
            comments: 12,
            changes: { additions: 245, deletions: 67 },
            branch: 'feature/auth-jwt',
            repository: 'codai-backend'
        },
        {
            id: 2,
            title: 'Add real-time notifications system',
            author: 'Alice Smith',
            reviewers: ['John Doe', 'Carol Wilson'],
            status: 'changes-requested',
            createdAt: '2024-01-15 12:15:00',
            updatedAt: '2024-01-15 15:20:00',
            comments: 18,
            changes: { additions: 389, deletions: 23 },
            branch: 'feature/notifications',
            repository: 'codai-frontend'
        },
        {
            id: 3,
            title: 'Fix memory leak in data processing',
            author: 'Bob Johnson',
            reviewers: ['David Brown'],
            status: 'pending',
            createdAt: '2024-01-15 10:00:00',
            updatedAt: '2024-01-15 10:00:00',
            comments: 3,
            changes: { additions: 78, deletions: 156 },
            branch: 'fix/memory-leak',
            repository: 'codai-processor'
        },
        {
            id: 4,
            title: 'Upgrade React to version 19',
            author: 'Carol Wilson',
            reviewers: ['Alice Smith', 'John Doe', 'Emma Davis'],
            status: 'reviewing',
            createdAt: '2024-01-15 09:30:00',
            updatedAt: '2024-01-15 14:15:00',
            comments: 7,
            changes: { additions: 12, deletions: 234 },
            branch: 'upgrade/react-19',
            repository: 'codai-frontend'
        }
    ];

    const topReviewers = [
        { name: 'Alice Smith', reviews: 23, avgTime: '1h 32m', rating: 4.8 },
        { name: 'John Doe', reviews: 19, avgTime: '2h 15m', rating: 4.6 },
        { name: 'Bob Johnson', reviews: 16, avgTime: '3h 45m', rating: 4.7 },
        { name: 'Carol Wilson', reviews: 14, avgTime: '1h 58m', rating: 4.9 },
        { name: 'David Brown', reviews: 12, avgTime: '2h 30m', rating: 4.5 }
    ];

    const reviewMetrics = [
        { period: 'This Week', reviews: 34, avgTime: '2h 15m', approvalRate: 89.2 },
        { period: 'Last Week', reviews: 28, avgTime: '3h 10m', approvalRate: 85.7 },
        { period: 'This Month', reviews: 142, avgTime: '2h 45m', approvalRate: 87.4 },
        { period: 'Last Month', reviews: 156, avgTime: '3h 22m', approvalRate: 84.1 }
    ];

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'approved': return <CheckCircle className="w-4 h-4 text-green-600" />;
            case 'changes-requested': return <XCircle className="w-4 h-4 text-red-600" />;
            case 'reviewing': return <Clock className="w-4 h-4 text-blue-600" />;
            case 'pending': return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
            default: return <Clock className="w-4 h-4 text-gray-400" />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'approved': return 'text-green-600 bg-green-100 border-green-200';
            case 'changes-requested': return 'text-red-600 bg-red-100 border-red-200';
            case 'reviewing': return 'text-blue-600 bg-blue-100 border-blue-200';
            case 'pending': return 'text-yellow-600 bg-yellow-100 border-yellow-200';
            default: return 'text-gray-600 bg-gray-100 border-gray-200';
        }
    };

    return (
        <div className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-blue-100">Total Reviews</p>
                            <p className="text-3xl font-bold">{reviewStats.totalReviews}</p>
                            <p className="text-sm text-blue-100 mt-1">
                                <TrendingUp className="w-4 h-4 inline mr-1" />
                                +{reviewStats.weeklyTrend}% this week
                            </p>
                        </div>
                        <div className="p-3 bg-white bg-opacity-20 rounded-lg">
                            <GitPullRequest className="w-8 h-8" />
                        </div>
                    </div>
                </div>

                <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-green-100">Approval Rate</p>
                            <p className="text-3xl font-bold">{reviewStats.approvalRate}%</p>
                            <p className="text-sm text-green-100 mt-1">
                                <Target className="w-4 h-4 inline mr-1" />
                                Above target
                            </p>
                        </div>
                        <div className="p-3 bg-white bg-opacity-20 rounded-lg">
                            <CheckCircle className="w-8 h-8" />
                        </div>
                    </div>
                </div>

                <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-6 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-purple-100">Avg Review Time</p>
                            <p className="text-3xl font-bold">{reviewStats.avgReviewTime}</p>
                            <p className="text-sm text-purple-100 mt-1">
                                <Timer className="w-4 h-4 inline mr-1" />
                                15% faster
                            </p>
                        </div>
                        <div className="p-3 bg-white bg-opacity-20 rounded-lg">
                            <Clock className="w-8 h-8" />
                        </div>
                    </div>
                </div>

                <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-6 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-orange-100">Pending Reviews</p>
                            <p className="text-3xl font-bold">{reviewStats.pendingReviews}</p>
                            <p className="text-sm text-orange-100 mt-1">
                                <Activity className="w-4 h-4 inline mr-1" />
                                Need attention
                            </p>
                        </div>
                        <div className="p-3 bg-white bg-opacity-20 rounded-lg">
                            <AlertTriangle className="w-8 h-8" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Reviews and Top Reviewers */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Reviews */}
                <div className="lg:col-span-2 bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-semibold text-gray-900">Recent Reviews</h3>
                        <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                            View All
                        </button>
                    </div>

                    <div className="space-y-4">
                        {recentReviews.map((review) => (
                            <div key={review.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex-1">
                                        <h4 className="font-medium text-gray-900 mb-1">{review.title}</h4>
                                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                                            <span className="flex items-center">
                                                <User className="w-4 h-4 mr-1" />
                                                {review.author}
                                            </span>
                                            <span className="flex items-center">
                                                <GitBranch className="w-4 h-4 mr-1" />
                                                {review.branch}
                                            </span>
                                            <span className="flex items-center">
                                                <FileText className="w-4 h-4 mr-1" />
                                                {review.repository}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        {getStatusIcon(review.status)}
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(review.status)}`}>
                                            {review.status.replace('-', ' ')}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between text-sm text-gray-600">
                                    <div className="flex items-center space-x-4">
                                        <span className="flex items-center">
                                            <MessageSquare className="w-4 h-4 mr-1" />
                                            {review.comments} comments
                                        </span>
                                        <span className="text-green-600">+{review.changes.additions}</span>
                                        <span className="text-red-600">-{review.changes.deletions}</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <span>Reviewers:</span>
                                        <div className="flex -space-x-1">
                                            {review.reviewers.slice(0, 3).map((reviewer, index) => (
                                                <div
                                                    key={index}
                                                    className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-xs font-medium text-blue-600 border-2 border-white"
                                                    title={reviewer}
                                                >
                                                    {reviewer.split(' ').map(n => n[0]).join('')}
                                                </div>
                                            ))}
                                            {review.reviewers.length > 3 && (
                                                <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center text-xs font-medium text-gray-600 border-2 border-white">
                                                    +{review.reviewers.length - 3}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Top Reviewers */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-6">Top Reviewers</h3>

                    <div className="space-y-4">
                        {topReviewers.map((reviewer, index) => (
                            <div key={index} className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-medium text-blue-600">
                                        {reviewer.name.split(' ').map(n => n[0]).join('')}
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900">{reviewer.name}</p>
                                        <p className="text-sm text-gray-500">{reviewer.reviews} reviews</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="flex items-center space-x-1">
                                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                                        <span className="text-sm font-medium">{reviewer.rating}</span>
                                    </div>
                                    <p className="text-xs text-gray-500">{reviewer.avgTime}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Review Metrics */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Review Metrics</h3>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {reviewMetrics.map((metric, index) => (
                        <div key={index} className="text-center">
                            <p className="text-sm font-medium text-gray-600 mb-2">{metric.period}</p>
                            <div className="space-y-2">
                                <div>
                                    <p className="text-2xl font-bold text-gray-900">{metric.reviews}</p>
                                    <p className="text-xs text-gray-500">Reviews</p>
                                </div>
                                <div>
                                    <p className="text-lg font-semibold text-blue-600">{metric.avgTime}</p>
                                    <p className="text-xs text-gray-500">Avg Time</p>
                                </div>
                                <div>
                                    <p className="text-lg font-semibold text-green-600">{metric.approvalRate}%</p>
                                    <p className="text-xs text-gray-500">Approval Rate</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Quick Actions</h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors">
                        <div className="text-center">
                            <GitPullRequest className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                            <p className="font-medium text-gray-700">Create Review Request</p>
                            <p className="text-sm text-gray-500">Start a new code review</p>
                        </div>
                    </button>

                    <button className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors">
                        <div className="text-center">
                            <Users className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                            <p className="font-medium text-gray-700">Assign Reviewers</p>
                            <p className="text-sm text-gray-500">Auto-assign team members</p>
                        </div>
                    </button>

                    <button className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors">
                        <div className="text-center">
                            <BarChart3 className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                            <p className="font-medium text-gray-700">Generate Report</p>
                            <p className="text-sm text-gray-500">Team performance analysis</p>
                        </div>
                    </button>
                </div>
            </div>
        </div>
    );
}
