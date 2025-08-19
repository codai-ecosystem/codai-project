'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
    ArrowLeft,
    Users,
    Share2,
    Settings,
    Plus,
    Search,
    Filter,
    MessageSquare,
    Video,
    Mail,
    Calendar,
    Eye,
    Edit,
    Trash2,
    Download,
    Upload,
    Link,
    Copy,
    UserPlus,
    UserMinus,
    Crown,
    Shield,
    Star,
    Clock,
    CheckCircle,
    XCircle,
    AlertTriangle,
    Activity,
    BarChart3,
    PieChart,
    TrendingUp,
    TrendingDown,
    Globe,
    Lock,
    Unlock,
    Bell,
    BellOff,
    Volume2,
    VolumeX,
    Monitor,
    Smartphone,
    Tablet,
    Laptop,
    RefreshCw,
    MoreHorizontal,
    ExternalLink,
    Folder,
    FolderOpen,
    FileText,
    Image,
    Play,
    Pause,
    Square,
    Circle,
    Zap,
    Target,
    Award,
    Flag,
    BookOpen,
    Code,
    Database,
    Cloud,
    Server,
    Cpu,
    Memory,
    HardDrive,
    Network,
    Wifi,
    WifiOff,
    Power,
    PowerOff,
    Maximize2,
    Minimize2,
    RotateCcw,
    Home,
    Building
} from 'lucide-react'

// TypeScript interfaces for team collaboration
interface TeamMember {
    id: string
    name: string
    email: string
    avatar: string
    role: 'owner' | 'admin' | 'editor' | 'viewer'
    department: string
    status: 'online' | 'offline' | 'busy' | 'away'
    lastActive: string
    joinedDate: string
    dashboardsAccess: number
    reportsCreated: number
    collaborations: number
    permissions: {
        createDashboards: boolean
        editReports: boolean
        shareContent: boolean
        manageUsers: boolean
        exportData: boolean
    }
    activity: {
        viewsToday: number
        editsThisWeek: number
        sharesThisMonth: number
        lastAction: string
    }
}

interface SharedDashboard {
    id: string
    name: string
    description: string
    owner: string
    sharedWith: string[]
    visibility: 'private' | 'team' | 'organization' | 'public'
    lastModified: string
    viewCount: number
    editCount: number
    type: 'analytics' | 'reporting' | 'visualization' | 'monitoring'
    status: 'active' | 'archived' | 'draft'
    collaborators: {
        memberId: string
        permission: 'view' | 'edit' | 'admin'
        lastAccessed: string
    }[]
    metrics: {
        avgSessionTime: string
        uniqueViewers: number
        totalInteractions: number
        exportCount: number
    }
}

interface CollaborationActivity {
    id: string
    type: 'dashboard_shared' | 'report_created' | 'user_invited' | 'comment_added' | 'data_exported' | 'permission_changed'
    user: string
    target: string
    description: string
    timestamp: string
    details: {
        dashboardName?: string
        reportType?: string
        recipientCount?: number
        commentText?: string
        permissionLevel?: string
    }
}

interface TeamAnalytics {
    totalMembers: number
    activeMembers: number
    totalDashboards: number
    sharedDashboards: number
    collaborationScore: number
    avgEngagement: number
    monthlyActivity: {
        dashboardsCreated: number
        reportsGenerated: number
        dataExports: number
        collaborativeEdits: number
    }
    topContributors: {
        memberId: string
        name: string
        contributions: number
        type: 'dashboards' | 'reports' | 'collaborations'
    }[]
}

export default function TeamCollaborationPage() {
    const [activeTab, setActiveTab] = useState('overview')
    const [selectedMembers, setSelectedMembers] = useState<string[]>([])
    const [searchQuery, setSearchQuery] = useState('')
    const [filterRole, setFilterRole] = useState('all')
    const [filterStatus, setFilterStatus] = useState('all')
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

    // Team members state
    const [teamMembers, setTeamMembers] = useState<TeamMember[]>([
        {
            id: '1',
            name: 'Sarah Johnson',
            email: 'sarah.johnson@company.com',
            avatar: 'SJ',
            role: 'owner',
            department: 'Analytics',
            status: 'online',
            lastActive: 'Active now',
            joinedDate: '2024-01-15',
            dashboardsAccess: 15,
            reportsCreated: 23,
            collaborations: 45,
            permissions: {
                createDashboards: true,
                editReports: true,
                shareContent: true,
                manageUsers: true,
                exportData: true
            },
            activity: {
                viewsToday: 8,
                editsThisWeek: 12,
                sharesThisMonth: 5,
                lastAction: 'Created revenue dashboard'
            }
        },
        {
            id: '2',
            name: 'Michael Chen',
            email: 'michael.chen@company.com',
            avatar: 'MC',
            role: 'admin',
            department: 'Data Science',
            status: 'online',
            lastActive: '5 minutes ago',
            joinedDate: '2024-02-01',
            dashboardsAccess: 12,
            reportsCreated: 18,
            collaborations: 34,
            permissions: {
                createDashboards: true,
                editReports: true,
                shareContent: true,
                manageUsers: true,
                exportData: true
            },
            activity: {
                viewsToday: 6,
                editsThisWeek: 9,
                sharesThisMonth: 3,
                lastAction: 'Updated ML model dashboard'
            }
        },
        {
            id: '3',
            name: 'Emily Rodriguez',
            email: 'emily.rodriguez@company.com',
            avatar: 'ER',
            role: 'editor',
            department: 'Marketing',
            status: 'busy',
            lastActive: '1 hour ago',
            joinedDate: '2024-03-10',
            dashboardsAccess: 8,
            reportsCreated: 15,
            collaborations: 28,
            permissions: {
                createDashboards: true,
                editReports: true,
                shareContent: true,
                manageUsers: false,
                exportData: true
            },
            activity: {
                viewsToday: 4,
                editsThisWeek: 7,
                sharesThisMonth: 8,
                lastAction: 'Shared campaign performance report'
            }
        },
        {
            id: '4',
            name: 'David Kim',
            email: 'david.kim@company.com',
            avatar: 'DK',
            role: 'editor',
            department: 'Finance',
            status: 'away',
            lastActive: '2 hours ago',
            joinedDate: '2024-02-20',
            dashboardsAccess: 10,
            reportsCreated: 12,
            collaborations: 22,
            permissions: {
                createDashboards: true,
                editReports: true,
                shareContent: false,
                manageUsers: false,
                exportData: true
            },
            activity: {
                viewsToday: 2,
                editsThisWeek: 5,
                sharesThisMonth: 2,
                lastAction: 'Exported financial analysis'
            }
        },
        {
            id: '5',
            name: 'Lisa Thompson',
            email: 'lisa.thompson@company.com',
            avatar: 'LT',
            role: 'viewer',
            department: 'Operations',
            status: 'offline',
            lastActive: '1 day ago',
            joinedDate: '2024-04-05',
            dashboardsAccess: 5,
            reportsCreated: 3,
            collaborations: 12,
            permissions: {
                createDashboards: false,
                editReports: false,
                shareContent: false,
                manageUsers: false,
                exportData: false
            },
            activity: {
                viewsToday: 0,
                editsThisWeek: 1,
                sharesThisMonth: 0,
                lastAction: 'Viewed operations dashboard'
            }
        },
        {
            id: '6',
            name: 'Alex Martinez',
            email: 'alex.martinez@company.com',
            avatar: 'AM',
            role: 'editor',
            department: 'Product',
            status: 'online',
            lastActive: '15 minutes ago',
            joinedDate: '2024-03-25',
            dashboardsAccess: 9,
            reportsCreated: 11,
            collaborations: 19,
            permissions: {
                createDashboards: true,
                editReports: true,
                shareContent: true,
                manageUsers: false,
                exportData: true
            },
            activity: {
                viewsToday: 5,
                editsThisWeek: 8,
                sharesThisMonth: 4,
                lastAction: 'Created product metrics dashboard'
            }
        }
    ])

    // Shared dashboards state
    const [sharedDashboards] = useState<SharedDashboard[]>([
        {
            id: '1',
            name: 'Q3 Revenue Dashboard',
            description: 'Comprehensive revenue analysis and forecasting for Q3 2025',
            owner: 'Sarah Johnson',
            sharedWith: ['2', '3', '4', '6'],
            visibility: 'team',
            lastModified: '2 hours ago',
            viewCount: 156,
            editCount: 23,
            type: 'analytics',
            status: 'active',
            collaborators: [
                { memberId: '2', permission: 'edit', lastAccessed: '1 hour ago' },
                { memberId: '3', permission: 'view', lastAccessed: '3 hours ago' },
                { memberId: '4', permission: 'edit', lastAccessed: '5 hours ago' },
                { memberId: '6', permission: 'view', lastAccessed: '1 day ago' }
            ],
            metrics: {
                avgSessionTime: '12m 34s',
                uniqueViewers: 8,
                totalInteractions: 89,
                exportCount: 15
            }
        },
        {
            id: '2',
            name: 'Marketing Campaign Performance',
            description: 'Real-time tracking of all active marketing campaigns',
            owner: 'Emily Rodriguez',
            sharedWith: ['1', '2', '6'],
            visibility: 'team',
            lastModified: '1 day ago',
            viewCount: 234,
            editCount: 45,
            type: 'monitoring',
            status: 'active',
            collaborators: [
                { memberId: '1', permission: 'admin', lastAccessed: '2 hours ago' },
                { memberId: '2', permission: 'edit', lastAccessed: '4 hours ago' },
                { memberId: '6', permission: 'edit', lastAccessed: '6 hours ago' }
            ],
            metrics: {
                avgSessionTime: '8m 47s',
                uniqueViewers: 12,
                totalInteractions: 156,
                exportCount: 28
            }
        },
        {
            id: '3',
            name: 'Product Analytics Hub',
            description: 'User behavior and product performance metrics',
            owner: 'Alex Martinez',
            sharedWith: ['1', '2', '3'],
            visibility: 'team',
            lastModified: '3 hours ago',
            viewCount: 89,
            editCount: 12,
            type: 'analytics',
            status: 'active',
            collaborators: [
                { memberId: '1', permission: 'admin', lastAccessed: '1 hour ago' },
                { memberId: '2', permission: 'edit', lastAccessed: '2 hours ago' },
                { memberId: '3', permission: 'view', lastAccessed: '1 day ago' }
            ],
            metrics: {
                avgSessionTime: '15m 22s',
                uniqueViewers: 6,
                totalInteractions: 67,
                exportCount: 9
            }
        },
        {
            id: '4',
            name: 'Financial Overview',
            description: 'Executive dashboard for financial KPIs and budgets',
            owner: 'David Kim',
            sharedWith: ['1', '2'],
            visibility: 'private',
            lastModified: '1 week ago',
            viewCount: 45,
            editCount: 8,
            type: 'reporting',
            status: 'active',
            collaborators: [
                { memberId: '1', permission: 'admin', lastAccessed: '3 days ago' },
                { memberId: '2', permission: 'view', lastAccessed: '1 week ago' }
            ],
            metrics: {
                avgSessionTime: '18m 56s',
                uniqueViewers: 3,
                totalInteractions: 34,
                exportCount: 12
            }
        }
    ])

    // Collaboration activities state
    const [recentActivities] = useState<CollaborationActivity[]>([
        {
            id: '1',
            type: 'dashboard_shared',
            user: 'Sarah Johnson',
            target: 'Q3 Revenue Dashboard',
            description: 'Shared dashboard with 4 team members',
            timestamp: '2 hours ago',
            details: {
                dashboardName: 'Q3 Revenue Dashboard',
                recipientCount: 4
            }
        },
        {
            id: '2',
            type: 'report_created',
            user: 'Emily Rodriguez',
            target: 'Campaign ROI Report',
            description: 'Created new marketing performance report',
            timestamp: '4 hours ago',
            details: {
                reportType: 'Marketing Performance'
            }
        },
        {
            id: '3',
            type: 'user_invited',
            user: 'Michael Chen',
            target: 'Lisa Thompson',
            description: 'Invited new team member to workspace',
            timestamp: '1 day ago',
            details: {
                permissionLevel: 'viewer'
            }
        },
        {
            id: '4',
            type: 'comment_added',
            user: 'Alex Martinez',
            target: 'Product Analytics Hub',
            description: 'Added comment on user engagement metrics',
            timestamp: '1 day ago',
            details: {
                dashboardName: 'Product Analytics Hub',
                commentText: 'User engagement is trending upward this quarter'
            }
        },
        {
            id: '5',
            type: 'data_exported',
            user: 'David Kim',
            target: 'Financial Overview',
            description: 'Exported Q3 financial summary',
            timestamp: '2 days ago',
            details: {
                dashboardName: 'Financial Overview'
            }
        }
    ])

    // Team analytics state
    const [teamAnalytics] = useState<TeamAnalytics>({
        totalMembers: 6,
        activeMembers: 4,
        totalDashboards: 15,
        sharedDashboards: 4,
        collaborationScore: 87,
        avgEngagement: 74,
        monthlyActivity: {
            dashboardsCreated: 8,
            reportsGenerated: 23,
            dataExports: 45,
            collaborativeEdits: 67
        },
        topContributors: [
            { memberId: '1', name: 'Sarah Johnson', contributions: 23, type: 'dashboards' },
            { memberId: '3', name: 'Emily Rodriguez', contributions: 15, type: 'reports' },
            { memberId: '2', name: 'Michael Chen', contributions: 34, type: 'collaborations' }
        ]
    })

    const getRoleIcon = (role: string) => {
        switch (role) {
            case 'owner': return <Crown className="w-4 h-4 text-yellow-500" />
            case 'admin': return <Shield className="w-4 h-4 text-blue-500" />
            case 'editor': return <Edit className="w-4 h-4 text-green-500" />
            case 'viewer': return <Eye className="w-4 h-4 text-gray-500" />
            default: return <Users className="w-4 h-4 text-gray-500" />
        }
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'online': return 'bg-green-500'
            case 'busy': return 'bg-yellow-500'
            case 'away': return 'bg-orange-500'
            case 'offline': return 'bg-gray-400'
            default: return 'bg-gray-400'
        }
    }

    const getActivityIcon = (type: string) => {
        switch (type) {
            case 'dashboard_shared': return <Share2 className="w-4 h-4 text-blue-500" />
            case 'report_created': return <FileText className="w-4 h-4 text-green-500" />
            case 'user_invited': return <UserPlus className="w-4 h-4 text-purple-500" />
            case 'comment_added': return <MessageSquare className="w-4 h-4 text-orange-500" />
            case 'data_exported': return <Download className="w-4 h-4 text-indigo-500" />
            case 'permission_changed': return <Settings className="w-4 h-4 text-red-500" />
            default: return <Activity className="w-4 h-4 text-gray-500" />
        }
    }

    const getVisibilityIcon = (visibility: string) => {
        switch (visibility) {
            case 'private': return <Lock className="w-4 h-4 text-red-500" />
            case 'team': return <Users className="w-4 h-4 text-blue-500" />
            case 'organization': return <Building className="w-4 h-4 text-purple-500" />
            case 'public': return <Globe className="w-4 h-4 text-green-500" />
            default: return <Lock className="w-4 h-4 text-gray-500" />
        }
    }

    const filteredMembers = teamMembers.filter(member => {
        const matchesSearch = member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            member.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
            member.department.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesRole = filterRole === 'all' || member.role === filterRole
        const matchesStatus = filterStatus === 'all' || member.status === filterStatus

        return matchesSearch && matchesRole && matchesStatus
    })

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
            {/* Header */}
            <motion.header
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white py-4 px-6 shadow-xl"
            >
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <button className="p-2 bg-white/20 rounded-lg backdrop-blur-sm hover:bg-white/30 transition-colors">
                                <ArrowLeft className="w-5 h-5" />
                            </button>
                            <div className="flex items-center space-x-3">
                                <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                                    <Users className="w-6 h-6" />
                                </div>
                                <div>
                                    <h1 className="text-2xl font-bold">Team Collaboration</h1>
                                    <p className="text-blue-100">Manage team members, shared dashboards, and collaborative analytics</p>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center space-x-3">
                            <button className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg backdrop-blur-sm flex items-center space-x-2 transition-colors">
                                <UserPlus className="w-4 h-4" />
                                <span>Invite Member</span>
                            </button>
                            <button className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg backdrop-blur-sm flex items-center space-x-2 transition-colors">
                                <Share2 className="w-4 h-4" />
                                <span>Share Dashboard</span>
                            </button>
                            <button className="p-2 bg-white/20 rounded-lg backdrop-blur-sm hover:bg-white/30 transition-colors">
                                <Settings className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </motion.header>

            <div className="max-w-7xl mx-auto px-6 py-8">
                {/* Summary Cards */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
                >
                    <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-sm text-gray-600">Team Members</div>
                                <div className="text-2xl font-bold text-gray-900">{teamAnalytics.totalMembers}</div>
                                <div className="text-xs text-green-600">{teamAnalytics.activeMembers} active</div>
                            </div>
                            <Users className="w-8 h-8 text-blue-500" />
                        </div>
                    </div>
                    <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-sm text-gray-600">Shared Dashboards</div>
                                <div className="text-2xl font-bold text-gray-900">{teamAnalytics.sharedDashboards}</div>
                                <div className="text-xs text-blue-600">of {teamAnalytics.totalDashboards} total</div>
                            </div>
                            <Share2 className="w-8 h-8 text-green-500" />
                        </div>
                    </div>
                    <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-sm text-gray-600">Collaboration Score</div>
                                <div className="text-2xl font-bold text-gray-900">{teamAnalytics.collaborationScore}%</div>
                                <div className="text-xs text-green-600">+12% this month</div>
                            </div>
                            <TrendingUp className="w-8 h-8 text-purple-500" />
                        </div>
                    </div>
                    <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-sm text-gray-600">Avg Engagement</div>
                                <div className="text-2xl font-bold text-gray-900">{teamAnalytics.avgEngagement}%</div>
                                <div className="text-xs text-orange-600">+5% this week</div>
                            </div>
                            <Activity className="w-8 h-8 text-orange-500" />
                        </div>
                    </div>
                </motion.div>

                {/* Main Content */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg overflow-hidden"
                >
                    {/* Tabs */}
                    <div className="border-b border-gray-200">
                        <div className="flex space-x-1 p-1">
                            {[
                                { id: 'overview', label: 'Overview', icon: BarChart3 },
                                { id: 'members', label: 'Team Members', icon: Users },
                                { id: 'dashboards', label: 'Shared Dashboards', icon: Share2 },
                                { id: 'activity', label: 'Activity Feed', icon: Activity }
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${activeTab === tab.id
                                            ? 'bg-blue-600 text-white'
                                            : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                                        }`}
                                >
                                    <tab.icon className="w-4 h-4" />
                                    <span>{tab.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Overview Tab */}
                    {activeTab === 'overview' && (
                        <div className="p-6">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                {/* Monthly Activity */}
                                <div className="bg-white rounded-xl shadow-lg p-6">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Activity</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="text-center">
                                            <div className="text-2xl font-bold text-blue-600">{teamAnalytics.monthlyActivity.dashboardsCreated}</div>
                                            <div className="text-sm text-gray-600">Dashboards Created</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-2xl font-bold text-green-600">{teamAnalytics.monthlyActivity.reportsGenerated}</div>
                                            <div className="text-sm text-gray-600">Reports Generated</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-2xl font-bold text-purple-600">{teamAnalytics.monthlyActivity.dataExports}</div>
                                            <div className="text-sm text-gray-600">Data Exports</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-2xl font-bold text-orange-600">{teamAnalytics.monthlyActivity.collaborativeEdits}</div>
                                            <div className="text-sm text-gray-600">Collaborative Edits</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Top Contributors */}
                                <div className="bg-white rounded-xl shadow-lg p-6">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Contributors</h3>
                                    <div className="space-y-4">
                                        {teamAnalytics.topContributors.map((contributor, index) => (
                                            <div key={contributor.memberId} className="flex items-center justify-between">
                                                <div className="flex items-center space-x-3">
                                                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                                        <span className="text-sm font-medium text-blue-700">{index + 1}</span>
                                                    </div>
                                                    <div>
                                                        <div className="font-medium text-gray-900">{contributor.name}</div>
                                                        <div className="text-sm text-gray-600 capitalize">{contributor.type}</div>
                                                    </div>
                                                </div>
                                                <div className="text-lg font-bold text-gray-900">{contributor.contributions}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Recent Activities Preview */}
                                <div className="lg:col-span-2 bg-white rounded-xl shadow-lg p-6">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Collaboration Activities</h3>
                                    <div className="space-y-4">
                                        {recentActivities.slice(0, 5).map((activity) => (
                                            <div key={activity.id} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                                                <div className="p-2 bg-white rounded-lg shadow-sm">
                                                    {getActivityIcon(activity.type)}
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-center justify-between">
                                                        <div className="font-medium text-gray-900">{activity.user}</div>
                                                        <div className="text-sm text-gray-500">{activity.timestamp}</div>
                                                    </div>
                                                    <div className="text-sm text-gray-700 mt-1">{activity.description}</div>
                                                    <div className="text-sm text-gray-600 mt-1">Target: {activity.target}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Team Members Tab */}
                    {activeTab === 'members' && (
                        <div className="p-6">
                            {/* Filters */}
                            <div className="flex flex-col sm:flex-row gap-4 mb-6">
                                <div className="flex-1 relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                    <input
                                        type="text"
                                        placeholder="Search team members..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                                <select
                                    value={filterRole}
                                    onChange={(e) => setFilterRole(e.target.value)}
                                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="all">All Roles</option>
                                    <option value="owner">Owner</option>
                                    <option value="admin">Admin</option>
                                    <option value="editor">Editor</option>
                                    <option value="viewer">Viewer</option>
                                </select>
                                <select
                                    value={filterStatus}
                                    onChange={(e) => setFilterStatus(e.target.value)}
                                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="all">All Status</option>
                                    <option value="online">Online</option>
                                    <option value="busy">Busy</option>
                                    <option value="away">Away</option>
                                    <option value="offline">Offline</option>
                                </select>
                                <div className="flex bg-gray-100 rounded-lg p-1">
                                    <button
                                        onClick={() => setViewMode('grid')}
                                        className={`px-3 py-1 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-white shadow-sm' : 'text-gray-600'
                                            }`}
                                    >
                                        Grid
                                    </button>
                                    <button
                                        onClick={() => setViewMode('list')}
                                        className={`px-3 py-1 rounded-md transition-colors ${viewMode === 'list' ? 'bg-white shadow-sm' : 'text-gray-600'
                                            }`}
                                    >
                                        List
                                    </button>
                                </div>
                            </div>

                            {/* Members Grid */}
                            <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
                                {filteredMembers.map((member) => (
                                    <motion.div
                                        key={member.id}
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className={`bg-white rounded-xl shadow-lg p-6 ${viewMode === 'list' ? 'flex items-center space-x-6' : ''}`}
                                    >
                                        <div className={`flex items-center ${viewMode === 'list' ? 'space-x-4' : 'space-x-3 mb-4'}`}>
                                            <div className="relative">
                                                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-medium">
                                                    {member.avatar}
                                                </div>
                                                <div className={`absolute -bottom-1 -right-1 w-4 h-4 ${getStatusColor(member.status)} rounded-full border-2 border-white`}></div>
                                            </div>
                                            <div className={viewMode === 'list' ? 'flex-1' : ''}>
                                                <div className="flex items-center space-x-2">
                                                    <h3 className="font-semibold text-gray-900">{member.name}</h3>
                                                    {getRoleIcon(member.role)}
                                                </div>
                                                <div className="text-sm text-gray-600">{member.department}</div>
                                                <div className="text-xs text-gray-500 capitalize">{member.role} • {member.status}</div>
                                            </div>
                                        </div>

                                        {viewMode === 'grid' && (
                                            <>
                                                <div className="grid grid-cols-3 gap-4 mb-4">
                                                    <div className="text-center">
                                                        <div className="text-lg font-bold text-gray-900">{member.dashboardsAccess}</div>
                                                        <div className="text-xs text-gray-600">Dashboards</div>
                                                    </div>
                                                    <div className="text-center">
                                                        <div className="text-lg font-bold text-gray-900">{member.reportsCreated}</div>
                                                        <div className="text-xs text-gray-600">Reports</div>
                                                    </div>
                                                    <div className="text-center">
                                                        <div className="text-lg font-bold text-gray-900">{member.collaborations}</div>
                                                        <div className="text-xs text-gray-600">Collaborations</div>
                                                    </div>
                                                </div>

                                                <div className="text-sm text-gray-600 mb-4">
                                                    <div>Last action: {member.activity.lastAction}</div>
                                                    <div>Last active: {member.lastActive}</div>
                                                </div>
                                            </>
                                        )}

                                        <div className={`flex items-center ${viewMode === 'list' ? 'space-x-2' : 'justify-between pt-4 border-t border-gray-200'}`}>
                                            {viewMode === 'list' && (
                                                <div className="flex items-center space-x-4 text-sm text-gray-600">
                                                    <span>{member.dashboardsAccess} dashboards</span>
                                                    <span>•</span>
                                                    <span>{member.reportsCreated} reports</span>
                                                    <span>•</span>
                                                    <span>{member.lastActive}</span>
                                                </div>
                                            )}
                                            <div className="flex items-center space-x-2">
                                                <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
                                                    <MessageSquare className="w-4 h-4" />
                                                </button>
                                                <button className="p-2 text-gray-400 hover:text-green-600 transition-colors">
                                                    <Video className="w-4 h-4" />
                                                </button>
                                                <button className="p-2 text-gray-400 hover:text-orange-600 transition-colors">
                                                    <Mail className="w-4 h-4" />
                                                </button>
                                                <button className="p-2 text-gray-400 hover:text-purple-600 transition-colors">
                                                    <MoreHorizontal className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Shared Dashboards Tab */}
                    {activeTab === 'dashboards' && (
                        <div className="p-6">
                            <div className="space-y-6">
                                {sharedDashboards.map((dashboard) => (
                                    <div key={dashboard.id} className="bg-white rounded-xl shadow-lg p-6">
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex-1">
                                                <div className="flex items-center space-x-3 mb-2">
                                                    <h3 className="text-lg font-semibold text-gray-900">{dashboard.name}</h3>
                                                    {getVisibilityIcon(dashboard.visibility)}
                                                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                                                        {dashboard.type}
                                                    </span>
                                                </div>
                                                <p className="text-gray-700 mb-3">{dashboard.description}</p>
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                                    <div>
                                                        <span className="font-medium text-gray-600">Owner:</span>
                                                        <span className="ml-2 text-gray-900">{dashboard.owner}</span>
                                                    </div>
                                                    <div>
                                                        <span className="font-medium text-gray-600">Shared with:</span>
                                                        <span className="ml-2 text-gray-900">{dashboard.sharedWith.length} members</span>
                                                    </div>
                                                    <div>
                                                        <span className="font-medium text-gray-600">Last modified:</span>
                                                        <span className="ml-2 text-gray-900">{dashboard.lastModified}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 py-4 border-t border-gray-200">
                                            <div className="text-center">
                                                <div className="text-lg font-bold text-gray-900">{dashboard.viewCount}</div>
                                                <div className="text-xs text-gray-600">Total Views</div>
                                            </div>
                                            <div className="text-center">
                                                <div className="text-lg font-bold text-gray-900">{dashboard.editCount}</div>
                                                <div className="text-xs text-gray-600">Total Edits</div>
                                            </div>
                                            <div className="text-center">
                                                <div className="text-lg font-bold text-gray-900">{dashboard.metrics.uniqueViewers}</div>
                                                <div className="text-xs text-gray-600">Unique Viewers</div>
                                            </div>
                                            <div className="text-center">
                                                <div className="text-lg font-bold text-gray-900">{dashboard.metrics.avgSessionTime}</div>
                                                <div className="text-xs text-gray-600">Avg Session</div>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                                            <div className="flex items-center space-x-4 text-sm text-gray-600">
                                                <span>Collaborators: {dashboard.collaborators.length}</span>
                                                <span>•</span>
                                                <span>Exports: {dashboard.metrics.exportCount}</span>
                                                <span>•</span>
                                                <span>Interactions: {dashboard.metrics.totalInteractions}</span>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <button className="px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors">
                                                    View
                                                </button>
                                                <button className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                                                    Manage
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Activity Feed Tab */}
                    {activeTab === 'activity' && (
                        <div className="p-6">
                            <div className="space-y-4">
                                {recentActivities.map((activity) => (
                                    <div key={activity.id} className="bg-white rounded-xl shadow-lg p-6">
                                        <div className="flex items-start space-x-4">
                                            <div className="p-3 bg-gray-100 rounded-lg">
                                                {getActivityIcon(activity.type)}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center justify-between mb-2">
                                                    <h4 className="font-medium text-gray-900">{activity.user}</h4>
                                                    <span className="text-sm text-gray-500">{activity.timestamp}</span>
                                                </div>
                                                <p className="text-gray-700 mb-2">{activity.description}</p>
                                                <div className="text-sm text-gray-600">
                                                    <span className="font-medium">Target:</span> {activity.target}
                                                </div>
                                                {activity.details && (
                                                    <div className="mt-3 p-3 bg-gray-50 rounded-lg text-sm text-gray-600">
                                                        {activity.details.dashboardName && (
                                                            <div>Dashboard: {activity.details.dashboardName}</div>
                                                        )}
                                                        {activity.details.recipientCount && (
                                                            <div>Recipients: {activity.details.recipientCount}</div>
                                                        )}
                                                        {activity.details.commentText && (
                                                            <div>Comment: "{activity.details.commentText}"</div>
                                                        )}
                                                        {activity.details.permissionLevel && (
                                                            <div>Permission: {activity.details.permissionLevel}</div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </motion.div>
            </div>
        </div>
    )
}
