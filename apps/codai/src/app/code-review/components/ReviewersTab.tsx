import React, { useState } from 'react';
import {
    User,
    Star,
    Clock,
    Activity,
    MessageSquare,
    GitPullRequest,
    CheckCircle,
    XCircle,
    Calendar,
    Mail,
    Phone,
    MapPin,
    Award,
    Zap,
    Target,
    Plus,
    Edit3,
    Settings,
    Search,
    Filter,
    TrendingUp,
    TrendingDown,
    BarChart3
} from 'lucide-react';

export function ReviewersTab() {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedFilter, setSelectedFilter] = useState('all');
    const [showAddModal, setShowAddModal] = useState(false);

    const reviewers = [
        {
            id: 1,
            name: 'Alice Smith',
            email: 'alice.smith@company.com',
            avatar: 'AS',
            role: 'Senior Frontend Developer',
            department: 'Engineering',
            location: 'San Francisco, CA',
            status: 'active',
            expertise: ['React', 'TypeScript', 'CSS', 'Testing'],
            stats: {
                totalReviews: 127,
                averageTime: '2h 15m',
                rating: 4.8,
                approvalRate: 92.3,
                responseTime: '45m',
                thoroughnessScore: 9.2
            },
            activity: {
                lastReview: '2024-01-15 14:30:00',
                currentReviews: 3,
                weeklyReviews: 8,
                monthlyReviews: 34
            },
            workload: 'medium',
            timezone: 'PST',
            availability: 'available',
            preferences: {
                maxReviews: 5,
                autoAssign: true,
                notifications: true,
                skipWeekends: false
            }
        },
        {
            id: 2,
            name: 'John Doe',
            email: 'john.doe@company.com',
            avatar: 'JD',
            role: 'Full Stack Developer',
            department: 'Engineering',
            location: 'New York, NY',
            status: 'active',
            expertise: ['Node.js', 'Python', 'PostgreSQL', 'DevOps'],
            stats: {
                totalReviews: 89,
                averageTime: '3h 20m',
                rating: 4.6,
                approvalRate: 88.7,
                responseTime: '1h 20m',
                thoroughnessScore: 8.8
            },
            activity: {
                lastReview: '2024-01-15 11:45:00',
                currentReviews: 2,
                weeklyReviews: 6,
                monthlyReviews: 23
            },
            workload: 'high',
            timezone: 'EST',
            availability: 'busy',
            preferences: {
                maxReviews: 3,
                autoAssign: true,
                notifications: true,
                skipWeekends: true
            }
        },
        {
            id: 3,
            name: 'Bob Johnson',
            email: 'bob.johnson@company.com',
            avatar: 'BJ',
            role: 'Backend Engineer',
            department: 'Engineering',
            location: 'Austin, TX',
            status: 'active',
            expertise: ['Java', 'Spring Boot', 'Microservices', 'Kubernetes'],
            stats: {
                totalReviews: 156,
                averageTime: '1h 45m',
                rating: 4.9,
                approvalRate: 94.1,
                responseTime: '30m',
                thoroughnessScore: 9.5
            },
            activity: {
                lastReview: '2024-01-15 16:20:00',
                currentReviews: 4,
                weeklyReviews: 10,
                monthlyReviews: 42
            },
            workload: 'medium',
            timezone: 'CST',
            availability: 'available',
            preferences: {
                maxReviews: 6,
                autoAssign: true,
                notifications: true,
                skipWeekends: false
            }
        },
        {
            id: 4,
            name: 'Carol Wilson',
            email: 'carol.wilson@company.com',
            avatar: 'CW',
            role: 'Security Engineer',
            department: 'Security',
            location: 'Seattle, WA',
            status: 'active',
            expertise: ['Security', 'Penetration Testing', 'OWASP', 'Compliance'],
            stats: {
                totalReviews: 78,
                averageTime: '4h 10m',
                rating: 4.7,
                approvalRate: 76.9,
                responseTime: '2h 15m',
                thoroughnessScore: 9.8
            },
            activity: {
                lastReview: '2024-01-14 13:30:00',
                currentReviews: 1,
                weeklyReviews: 3,
                monthlyReviews: 15
            },
            workload: 'low',
            timezone: 'PST',
            availability: 'available',
            preferences: {
                maxReviews: 4,
                autoAssign: false,
                notifications: true,
                skipWeekends: true
            }
        },
        {
            id: 5,
            name: 'David Brown',
            email: 'david.brown@company.com',
            avatar: 'DB',
            role: 'DevOps Engineer',
            department: 'Infrastructure',
            location: 'Denver, CO',
            status: 'vacation',
            expertise: ['Docker', 'AWS', 'Terraform', 'CI/CD'],
            stats: {
                totalReviews: 45,
                averageTime: '2h 30m',
                rating: 4.4,
                approvalRate: 91.1,
                responseTime: '1h 45m',
                thoroughnessScore: 8.3
            },
            activity: {
                lastReview: '2024-01-10 09:15:00',
                currentReviews: 0,
                weeklyReviews: 0,
                monthlyReviews: 8
            },
            workload: 'none',
            timezone: 'MST',
            availability: 'unavailable',
            preferences: {
                maxReviews: 3,
                autoAssign: false,
                notifications: false,
                skipWeekends: true
            }
        }
    ];

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'text-green-600 bg-green-100 border-green-200';
            case 'vacation': return 'text-orange-600 bg-orange-100 border-orange-200';
            case 'inactive': return 'text-gray-600 bg-gray-100 border-gray-200';
            default: return 'text-gray-600 bg-gray-100 border-gray-200';
        }
    };

    const getAvailabilityColor = (availability: string) => {
        switch (availability) {
            case 'available': return 'text-green-600';
            case 'busy': return 'text-yellow-600';
            case 'unavailable': return 'text-red-600';
            default: return 'text-gray-600';
        }
    };

    const getWorkloadColor = (workload: string) => {
        switch (workload) {
            case 'low': return 'bg-green-200';
            case 'medium': return 'bg-yellow-200';
            case 'high': return 'bg-red-200';
            case 'none': return 'bg-gray-200';
            default: return 'bg-gray-200';
        }
    };

    const filteredReviewers = reviewers.filter(reviewer => {
        const matchesFilter = selectedFilter === 'all' || reviewer.status === selectedFilter;
        const matchesSearch = reviewer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            reviewer.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
            reviewer.expertise.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()));
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
                            placeholder="Search reviewers..."
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
                        <option value="vacation">On Vacation</option>
                        <option value="inactive">Inactive</option>
                    </select>
                </div>

                <div className="flex items-center space-x-3">
                    <button className="flex items-center px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                        <Settings className="w-4 h-4 mr-2" />
                        Auto-Assign Rules
                    </button>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="flex items-center px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Reviewer
                    </button>
                </div>
            </div>

            {/* Reviewer Cards */}
            <div className="grid gap-6">
                {filteredReviewers.map((reviewer) => (
                    <div key={reviewer.id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                        <div className="flex items-start justify-between mb-6">
                            <div className="flex items-start space-x-4">
                                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-xl font-semibold text-blue-600">
                                    {reviewer.avatar}
                                </div>
                                <div>
                                    <div className="flex items-center space-x-3 mb-2">
                                        <h3 className="text-xl font-semibold text-gray-900">{reviewer.name}</h3>
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(reviewer.status)}`}>
                                            {reviewer.status}
                                        </span>
                                        <div className={`w-3 h-3 rounded-full ${getAvailabilityColor(reviewer.availability) === 'text-green-600' ? 'bg-green-400' : getAvailabilityColor(reviewer.availability) === 'text-yellow-600' ? 'bg-yellow-400' : 'bg-red-400'}`} />
                                    </div>
                                    <div className="text-gray-600 mb-2">
                                        <p className="font-medium">{reviewer.role}</p>
                                        <p className="text-sm">{reviewer.department}</p>
                                    </div>
                                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                                        <span className="flex items-center">
                                            <Mail className="w-4 h-4 mr-1" />
                                            {reviewer.email}
                                        </span>
                                        <span className="flex items-center">
                                            <MapPin className="w-4 h-4 mr-1" />
                                            {reviewer.location}
                                        </span>
                                        <span className="flex items-center">
                                            <Clock className="w-4 h-4 mr-1" />
                                            {reviewer.timezone}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center space-x-2">
                                <button className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg">
                                    <Mail className="w-4 h-4" />
                                </button>
                                <button className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-lg">
                                    <Edit3 className="w-4 h-4" />
                                </button>
                                <button className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-lg">
                                    <Settings className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        {/* Reviewer Statistics */}
                        <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-6">
                            <div className="text-center">
                                <div className="text-lg font-bold text-gray-900">{reviewer.stats.totalReviews}</div>
                                <div className="text-xs text-gray-500">Total Reviews</div>
                            </div>
                            <div className="text-center">
                                <div className="flex items-center justify-center space-x-1">
                                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                                    <span className="text-lg font-bold text-gray-900">{reviewer.stats.rating}</span>
                                </div>
                                <div className="text-xs text-gray-500">Rating</div>
                            </div>
                            <div className="text-center">
                                <div className="text-lg font-bold text-blue-600">{reviewer.stats.averageTime}</div>
                                <div className="text-xs text-gray-500">Avg Time</div>
                            </div>
                            <div className="text-center">
                                <div className="text-lg font-bold text-green-600">{reviewer.stats.approvalRate}%</div>
                                <div className="text-xs text-gray-500">Approval Rate</div>
                            </div>
                            <div className="text-center">
                                <div className="text-lg font-bold text-purple-600">{reviewer.stats.responseTime}</div>
                                <div className="text-xs text-gray-500">Response Time</div>
                            </div>
                            <div className="text-center">
                                <div className="text-lg font-bold text-orange-600">{reviewer.stats.thoroughnessScore}</div>
                                <div className="text-xs text-gray-500">Thoroughness</div>
                            </div>
                        </div>

                        {/* Current Activity */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
                            <div className="flex items-center space-x-3">
                                <Activity className="w-5 h-5 text-blue-600" />
                                <div>
                                    <div className="font-medium text-gray-900">{reviewer.activity.currentReviews}</div>
                                    <div className="text-sm text-gray-500">Current Reviews</div>
                                </div>
                            </div>
                            <div className="flex items-center space-x-3">
                                <Calendar className="w-5 h-5 text-green-600" />
                                <div>
                                    <div className="font-medium text-gray-900">{reviewer.activity.weeklyReviews}</div>
                                    <div className="text-sm text-gray-500">This Week</div>
                                </div>
                            </div>
                            <div className="flex items-center space-x-3">
                                <BarChart3 className="w-5 h-5 text-purple-600" />
                                <div>
                                    <div className="font-medium text-gray-900">{reviewer.activity.monthlyReviews}</div>
                                    <div className="text-sm text-gray-500">This Month</div>
                                </div>
                            </div>
                            <div className="flex items-center space-x-3">
                                <Clock className="w-5 h-5 text-orange-600" />
                                <div>
                                    <div className="font-medium text-gray-900">
                                        {new Date(reviewer.activity.lastReview).toLocaleDateString()}
                                    </div>
                                    <div className="text-sm text-gray-500">Last Review</div>
                                </div>
                            </div>
                        </div>

                        {/* Workload and Preferences */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-6">
                                <div className="flex items-center space-x-2">
                                    <span className="text-sm text-gray-600">Workload:</span>
                                    <div className="flex items-center space-x-2">
                                        <div className={`w-16 h-2 rounded-full ${getWorkloadColor(reviewer.workload)}`} />
                                        <span className="text-sm font-medium capitalize">{reviewer.workload}</span>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <span className="text-sm text-gray-600">Max Reviews:</span>
                                    <span className="text-sm font-medium">{reviewer.preferences.maxReviews}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <span className="text-sm text-gray-600">Auto-assign:</span>
                                    <span className={`text-sm font-medium ${reviewer.preferences.autoAssign ? 'text-green-600' : 'text-red-600'}`}>
                                        {reviewer.preferences.autoAssign ? 'Yes' : 'No'}
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-center space-x-2">
                                <span className="text-sm text-gray-600">Expertise:</span>
                                <div className="flex items-center space-x-1">
                                    {reviewer.expertise.slice(0, 3).map((skill, index) => (
                                        <span
                                            key={index}
                                            className="px-2 py-1 text-xs font-medium text-blue-600 bg-blue-100 rounded-full"
                                        >
                                            {skill}
                                        </span>
                                    ))}
                                    {reviewer.expertise.length > 3 && (
                                        <span className="px-2 py-1 text-xs font-medium text-gray-600 bg-gray-100 rounded-full">
                                            +{reviewer.expertise.length - 3}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Team Summary */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Team Review Summary</h3>

                <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                    <div className="text-center">
                        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                            <User className="w-8 h-8 text-blue-600" />
                        </div>
                        <div className="text-2xl font-bold text-gray-900">{reviewers.length}</div>
                        <div className="text-sm text-gray-500">Total Reviewers</div>
                    </div>

                    <div className="text-center">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                            <CheckCircle className="w-8 h-8 text-green-600" />
                        </div>
                        <div className="text-2xl font-bold text-gray-900">
                            {reviewers.filter(r => r.status === 'active').length}
                        </div>
                        <div className="text-sm text-gray-500">Active</div>
                    </div>

                    <div className="text-center">
                        <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
                            <Star className="w-8 h-8 text-yellow-600" />
                        </div>
                        <div className="text-2xl font-bold text-gray-900">
                            {(reviewers.reduce((sum, r) => sum + r.stats.rating, 0) / reviewers.length).toFixed(1)}
                        </div>
                        <div className="text-sm text-gray-500">Avg Rating</div>
                    </div>

                    <div className="text-center">
                        <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                            <Activity className="w-8 h-8 text-purple-600" />
                        </div>
                        <div className="text-2xl font-bold text-gray-900">
                            {reviewers.reduce((sum, r) => sum + r.activity.currentReviews, 0)}
                        </div>
                        <div className="text-sm text-gray-500">Active Reviews</div>
                    </div>

                    <div className="text-center">
                        <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                            <Target className="w-8 h-8 text-orange-600" />
                        </div>
                        <div className="text-2xl font-bold text-gray-900">
                            {(reviewers.reduce((sum, r) => sum + r.stats.approvalRate, 0) / reviewers.length).toFixed(1)}%
                        </div>
                        <div className="text-sm text-gray-500">Avg Approval Rate</div>
                    </div>
                </div>
            </div>

            {/* Add Reviewer Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-screen overflow-y-auto">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-semibold text-gray-900">Add New Reviewer</h3>
                            <button
                                onClick={() => setShowAddModal(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <XCircle className="w-6 h-6" />
                            </button>
                        </div>

                        <form className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Full Name
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="John Smith"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Email Address
                                    </label>
                                    <input
                                        type="email"
                                        placeholder="john.smith@company.com"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Role
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Senior Developer"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Department
                                    </label>
                                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                                        <option value="engineering">Engineering</option>
                                        <option value="security">Security</option>
                                        <option value="infrastructure">Infrastructure</option>
                                        <option value="qa">Quality Assurance</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Timezone
                                    </label>
                                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                                        <option value="PST">PST</option>
                                        <option value="MST">MST</option>
                                        <option value="CST">CST</option>
                                        <option value="EST">EST</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Max Reviews
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        max="10"
                                        defaultValue="5"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Expertise (comma-separated)
                                </label>
                                <input
                                    type="text"
                                    placeholder="React, TypeScript, Node.js, PostgreSQL"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            <div className="flex items-center space-x-6">
                                <label className="flex items-center">
                                    <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                                    <span className="ml-2 text-sm text-gray-700">Enable auto-assignment</span>
                                </label>
                                <label className="flex items-center">
                                    <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                                    <span className="ml-2 text-sm text-gray-700">Email notifications</span>
                                </label>
                                <label className="flex items-center">
                                    <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                                    <span className="ml-2 text-sm text-gray-700">Skip weekends</span>
                                </label>
                            </div>

                            <div className="flex items-center justify-end space-x-3 pt-6">
                                <button
                                    type="button"
                                    onClick={() => setShowAddModal(false)}
                                    className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                                >
                                    Add Reviewer
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
