'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
    Users, UserPlus, Share2, Settings, Crown, Shield, Eye,
    Mail, MessageSquare, Calendar, Clock, Activity, Award,
    Edit, Trash2, MoreHorizontal, Search, Filter, Grid,
    List, Download, Upload, Link, Copy, Bell, Check,
    X, Plus, ChevronDown, Globe, Lock, Team, AlertCircle
} from 'lucide-react'

// TypeScript interfaces
interface TeamMember {
    id: string
    name: string
    email: string
    avatar?: string
    role: 'owner' | 'admin' | 'editor' | 'viewer'
    department: string
    status: 'active' | 'invited' | 'inactive'
    joinedAt: string
    lastActive: string
    permissions: {
        canCreateReports: boolean
        canEditDashboards: boolean
        canShareExternally: boolean
        canManageTeam: boolean
        canViewAnalytics: boolean
    }
    usage: {
        reportsCreated: number
        dashboardsAccessed: number
        dataExported: number
        collaborations: number
    }
}

interface SharedItem {
    id: string
    title: string
    type: 'dashboard' | 'report' | 'visualization' | 'dataset'
    description?: string
    owner: {
        id: string
        name: string
        avatar?: string
    }
    permissions: 'view' | 'edit' | 'full'
    sharedWith: 'team' | 'organization' | 'public' | 'specific'
    recipients?: string[]
    createdAt: string
    lastAccessed: string
    accessCount: number
    isBookmarked: boolean
    tags: string[]
}

interface TeamMetrics {
    totalMembers: number
    activeMembers: number
    pendingInvites: number
    avgCollaboration: number
    reportsShared: number
    externalShares: number
    teamActivity: number
    dataUsage: string
}

// Mock data
const mockTeamMembers: TeamMember[] = [
    {
        id: 'tm-1',
        name: 'Maria Popescu',
        email: 'maria.popescu@analizai.com',
        avatar: '/avatars/maria.jpg',
        role: 'owner',
        department: 'Analytics',
        status: 'active',
        joinedAt: '2025-01-15T10:00:00Z',
        lastActive: '2025-08-07T14:30:00Z',
        permissions: {
            canCreateReports: true,
            canEditDashboards: true,
            canShareExternally: true,
            canManageTeam: true,
            canViewAnalytics: true
        },
        usage: {
            reportsCreated: 47,
            dashboardsAccessed: 156,
            dataExported: 23,
            collaborations: 89
        }
    },
    {
        id: 'tm-2',
        name: 'Alexandru Ionescu',
        email: 'alex.ionescu@analizai.com',
        avatar: '/avatars/alex.jpg',
        role: 'admin',
        department: 'Business Intelligence',
        status: 'active',
        joinedAt: '2025-02-20T09:15:00Z',
        lastActive: '2025-08-07T13:45:00Z',
        permissions: {
            canCreateReports: true,
            canEditDashboards: true,
            canShareExternally: true,
            canManageTeam: true,
            canViewAnalytics: true
        },
        usage: {
            reportsCreated: 34,
            dashboardsAccessed: 198,
            dataExported: 18,
            collaborations: 67
        }
    },
    {
        id: 'tm-3',
        name: 'Elena Georgescu',
        email: 'elena.georgescu@analizai.com',
        avatar: '/avatars/elena.jpg',
        role: 'editor',
        department: 'Data Science',
        status: 'active',
        joinedAt: '2025-03-10T11:30:00Z',
        lastActive: '2025-08-07T12:20:00Z',
        permissions: {
            canCreateReports: true,
            canEditDashboards: true,
            canShareExternally: false,
            canManageTeam: false,
            canViewAnalytics: true
        },
        usage: {
            reportsCreated: 28,
            dashboardsAccessed: 87,
            dataExported: 12,
            collaborations: 45
        }
    },
    {
        id: 'tm-4',
        name: 'Radu Munteanu',
        email: 'radu.munteanu@analizai.com',
        role: 'viewer',
        department: 'Operations',
        status: 'invited',
        joinedAt: '2025-08-05T16:00:00Z',
        lastActive: '2025-08-05T16:00:00Z',
        permissions: {
            canCreateReports: false,
            canEditDashboards: false,
            canShareExternally: false,
            canManageTeam: false,
            canViewAnalytics: true
        },
        usage: {
            reportsCreated: 0,
            dashboardsAccessed: 3,
            dataExported: 0,
            collaborations: 1
        }
    }
]

const mockSharedItems: SharedItem[] = [
    {
        id: 'si-1',
        title: 'Q3 Revenue Dashboard',
        type: 'dashboard',
        description: 'Comprehensive revenue analysis with regional breakdown',
        owner: {
            id: 'tm-1',
            name: 'Maria Popescu',
            avatar: '/avatars/maria.jpg'
        },
        permissions: 'edit',
        sharedWith: 'team',
        createdAt: '2025-08-01T10:30:00Z',
        lastAccessed: '2025-08-07T09:15:00Z',
        accessCount: 147,
        isBookmarked: true,
        tags: ['revenue', 'quarterly', 'dashboard']
    },
    {
        id: 'si-2',
        title: 'Customer Engagement Report',
        type: 'report',
        description: 'Monthly customer engagement analysis',
        owner: {
            id: 'tm-2',
            name: 'Alexandru Ionescu',
            avatar: '/avatars/alex.jpg'
        },
        permissions: 'view',
        sharedWith: 'organization',
        createdAt: '2025-08-03T14:20:00Z',
        lastAccessed: '2025-08-07T11:30:00Z',
        accessCount: 89,
        isBookmarked: false,
        tags: ['engagement', 'customers', 'monthly']
    },
    {
        id: 'si-3',
        title: 'Sales Performance Chart',
        type: 'visualization',
        description: 'Interactive sales performance visualization',
        owner: {
            id: 'tm-3',
            name: 'Elena Georgescu',
            avatar: '/avatars/elena.jpg'
        },
        permissions: 'view',
        sharedWith: 'public',
        createdAt: '2025-08-05T16:45:00Z',
        lastAccessed: '2025-08-07T08:20:00Z',
        accessCount: 234,
        isBookmarked: true,
        tags: ['sales', 'performance', 'chart']
    }
]

const mockMetrics: TeamMetrics = {
    totalMembers: 12,
    activeMembers: 11,
    pendingInvites: 2,
    avgCollaboration: 8.7,
    reportsShared: 47,
    externalShares: 23,
    teamActivity: 94,
    dataUsage: '2.3 GB'
}

// Utility functions
const getRoleColor = (role: TeamMember['role']) => {
    switch (role) {
        case 'owner': return 'text-purple-600 bg-purple-50 border-purple-200'
        case 'admin': return 'text-blue-600 bg-blue-50 border-blue-200'
        case 'editor': return 'text-green-600 bg-green-50 border-green-200'
        case 'viewer': return 'text-gray-600 bg-gray-50 border-gray-200'
        default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
}

const getStatusColor = (status: TeamMember['status']) => {
    switch (status) {
        case 'active': return 'text-green-600 bg-green-50'
        case 'invited': return 'text-yellow-600 bg-yellow-50'
        case 'inactive': return 'text-gray-600 bg-gray-50'
        default: return 'text-gray-600 bg-gray-50'
    }
}

const getTypeIcon = (type: SharedItem['type']) => {
    switch (type) {
        case 'dashboard': return <Grid className="h-4 w-4" />
        case 'report': return <Download className="h-4 w-4" />
        case 'visualization': return <Activity className="h-4 w-4" />
        case 'dataset': return <Users className="h-4 w-4" />
        default: return <Grid className="h-4 w-4" />
    }
}

const getPermissionIcon = (permission: SharedItem['permissions']) => {
    switch (permission) {
        case 'view': return <Eye className="h-4 w-4 text-blue-600" />
        case 'edit': return <Edit className="h-4 w-4 text-green-600" />
        case 'full': return <Crown className="h-4 w-4 text-purple-600" />
        default: return <Eye className="h-4 w-4 text-gray-600" />
    }
}

const formatTimeAgo = (dateString: string) => {
    const now = new Date()
    const date = new Date(dateString)
    const diffMs = now.getTime() - date.getTime()
    const diffHours = Math.floor(diffMs / 3600000)

    if (diffHours < 1) return 'Just now'
    if (diffHours < 24) return `${diffHours}h ago`
    return `${Math.floor(diffHours / 24)}d ago`
}

// Team Member Card Component
const TeamMemberCard: React.FC<{
    member: TeamMember
    onEdit: (id: string) => void
    onRemove: (id: string) => void
    onMessage: (id: string) => void
}> = ({ member, onEdit, onRemove, onMessage }) => {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200"
        >
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center">
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mr-4">
                        <span className="text-purple-600 font-semibold text-lg">
                            {member.name.split(' ').map(n => n[0]).join('')}
                        </span>
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-900">{member.name}</h3>
                        <p className="text-sm text-gray-600">{member.email}</p>
                        <p className="text-sm text-gray-500">{member.department}</p>
                    </div>
                </div>
                <div className="flex items-center space-x-2">
                    <div className={`px-2 py-1 rounded-full text-xs font-medium border ${getRoleColor(member.role)}`}>
                        {member.role.toUpperCase()}
                    </div>
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(member.status)}`}>
                        {member.status}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                <div>
                    <p className="text-gray-500">Reports Created</p>
                    <p className="font-semibold">{member.usage.reportsCreated}</p>
                </div>
                <div>
                    <p className="text-gray-500">Collaborations</p>
                    <p className="font-semibold">{member.usage.collaborations}</p>
                </div>
                <div>
                    <p className="text-gray-500">Joined</p>
                    <p className="font-semibold">{formatTimeAgo(member.joinedAt)}</p>
                </div>
                <div>
                    <p className="text-gray-500">Last Active</p>
                    <p className="font-semibold">{formatTimeAgo(member.lastActive)}</p>
                </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div className="flex items-center space-x-2 text-xs text-gray-500">
                    {member.permissions.canCreateReports && <span className="bg-green-100 text-green-700 px-2 py-1 rounded">Reports</span>}
                    {member.permissions.canEditDashboards && <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded">Dashboards</span>}
                    {member.permissions.canManageTeam && <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded">Team</span>}
                </div>
                <div className="flex items-center space-x-2">
                    <button
                        onClick={() => onMessage(member.id)}
                        className="p-1 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        title="Message"
                    >
                        <MessageSquare className="h-4 w-4" />
                    </button>
                    <button
                        onClick={() => onEdit(member.id)}
                        className="p-1 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded transition-colors"
                        title="Edit"
                    >
                        <Edit className="h-4 w-4" />
                    </button>
                    {member.role !== 'owner' && (
                        <button
                            onClick={() => onRemove(member.id)}
                            className="p-1 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                            title="Remove"
                        >
                            <Trash2 className="h-4 w-4" />
                        </button>
                    )}
                </div>
            </div>
        </motion.div>
    )
}

// Shared Item Card Component
const SharedItemCard: React.FC<{
    item: SharedItem
    onShare: (id: string) => void
    onUnshare: (id: string) => void
    onBookmark: (id: string) => void
}> = ({ item, onShare, onUnshare, onBookmark }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200"
        >
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center">
                    <div className="p-2 bg-purple-100 rounded-lg mr-3">
                        {getTypeIcon(item.type)}
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-900">{item.title}</h3>
                        <p className="text-sm text-gray-600">{item.type} • {item.owner.name}</p>
                    </div>
                </div>
                <div className="flex items-center space-x-2">
                    {getPermissionIcon(item.permissions)}
                    <div className="flex items-center text-gray-400">
                        {item.sharedWith === 'public' && <Globe className="h-4 w-4" />}
                        {item.sharedWith === 'team' && <Team className="h-4 w-4" />}
                        {item.sharedWith === 'organization' && <Users className="h-4 w-4" />}
                        {item.sharedWith === 'specific' && <Lock className="h-4 w-4" />}
                    </div>
                </div>
            </div>

            {item.description && (
                <p className="text-sm text-gray-600 mb-4">{item.description}</p>
            )}

            <div className="grid grid-cols-3 gap-4 mb-4 text-xs text-gray-600">
                <div className="text-center">
                    <p className="font-medium">{item.accessCount}</p>
                    <p>Views</p>
                </div>
                <div className="text-center">
                    <p className="font-medium">{item.sharedWith}</p>
                    <p>Shared With</p>
                </div>
                <div className="text-center">
                    <p className="font-medium">{formatTimeAgo(item.lastAccessed)}</p>
                    <p>Last Access</p>
                </div>
            </div>

            {item.tags && item.tags.length > 0 && (
                <div className="mb-4">
                    <div className="flex flex-wrap gap-1">
                        {item.tags.map((tag, index) => (
                            <span
                                key={index}
                                className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                            >
                                {tag}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <span className="text-xs text-gray-500">
                    Created {formatTimeAgo(item.createdAt)}
                </span>
                <div className="flex items-center space-x-2">
                    <button
                        onClick={() => onBookmark(item.id)}
                        className={`p-1 rounded transition-colors ${item.isBookmarked ? 'text-yellow-500' : 'text-gray-400 hover:text-yellow-500'
                            }`}
                        title="Bookmark"
                    >
                        <Award className="h-4 w-4" fill={item.isBookmarked ? 'currentColor' : 'none'} />
                    </button>
                    <button
                        onClick={() => onShare(item.id)}
                        className="p-1 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        title="Share"
                    >
                        <Share2 className="h-4 w-4" />
                    </button>
                    <button
                        onClick={() => onUnshare(item.id)}
                        className="p-1 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="Stop Sharing"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>
            </div>
        </motion.div>
    )
}

// Main Team & Sharing Component
export default function TeamSharingPage() {
    const [teamMembers, setTeamMembers] = useState<TeamMember[]>(mockTeamMembers)
    const [sharedItems, setSharedItems] = useState<SharedItem[]>(mockSharedItems)
    const [metrics] = useState<TeamMetrics>(mockMetrics)
    const [searchTerm, setSearchTerm] = useState('')
    const [roleFilter, setRoleFilter] = useState<string>('all')
    const [statusFilter, setStatusFilter] = useState<string>('all')
    const [activeTab, setActiveTab] = useState<'team' | 'shared' | 'permissions'>('team')
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

    const filteredMembers = teamMembers.filter(member => {
        const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            member.email.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesRole = roleFilter === 'all' || member.role === roleFilter
        const matchesStatus = statusFilter === 'all' || member.status === statusFilter

        return matchesSearch && matchesRole && matchesStatus
    })

    const filteredSharedItems = sharedItems.filter(item =>
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const handleMemberEdit = (id: string) => {
        console.log('Edit member:', id)
    }

    const handleMemberRemove = (id: string) => {
        if (window.confirm('Are you sure you want to remove this team member?')) {
            setTeamMembers(prev => prev.filter(member => member.id !== id))
        }
    }

    const handleMemberMessage = (id: string) => {
        console.log('Message member:', id)
    }

    const handleItemShare = (id: string) => {
        console.log('Share item:', id)
    }

    const handleItemUnshare = (id: string) => {
        console.log('Unshare item:', id)
    }

    const handleItemBookmark = (id: string) => {
        setSharedItems(prev => prev.map(item =>
            item.id === id ? { ...item, isBookmarked: !item.isBookmarked } : item
        ))
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50">
            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent mb-2">
                                Team & Sharing
                            </h1>
                            <p className="text-gray-600">
                                Manage team members and shared analytics resources
                            </p>
                        </div>
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                                className="p-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                                title={`Switch to ${viewMode === 'grid' ? 'list' : 'grid'} view`}
                            >
                                {viewMode === 'grid' ? <List className="h-5 w-5" /> : <Grid className="h-5 w-5" />}
                            </button>
                            <button className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                                <Upload className="h-4 w-4 mr-2" />
                                Bulk Import
                            </button>
                            <button className="flex items-center px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg text-sm font-medium hover:from-purple-700 hover:to-indigo-700 transition-all duration-200">
                                <UserPlus className="h-4 w-4 mr-2" />
                                Invite Member
                            </button>
                        </div>
                    </div>
                </motion.div>

                {/* Metrics Overview */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8"
                >
                    <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Team Members</p>
                                <p className="text-2xl font-bold text-gray-900">{metrics.totalMembers}</p>
                            </div>
                            <Users className="h-8 w-8 text-purple-600" />
                        </div>
                    </div>
                    <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Active Now</p>
                                <p className="text-2xl font-bold text-gray-900">{metrics.activeMembers}</p>
                            </div>
                            <Activity className="h-8 w-8 text-green-600" />
                        </div>
                    </div>
                    <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Shared Items</p>
                                <p className="text-2xl font-bold text-gray-900">{metrics.reportsShared}</p>
                            </div>
                            <Share2 className="h-8 w-8 text-blue-600" />
                        </div>
                    </div>
                    <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Collaboration</p>
                                <p className="text-2xl font-bold text-gray-900">{metrics.avgCollaboration}</p>
                            </div>
                            <Award className="h-8 w-8 text-orange-600" />
                        </div>
                    </div>
                </motion.div>

                {/* Navigation & Filters */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm mb-8"
                >
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex space-x-1">
                            <button
                                onClick={() => setActiveTab('team')}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'team'
                                        ? 'bg-purple-100 text-purple-700'
                                        : 'text-gray-600 hover:text-gray-900'
                                    }`}
                            >
                                Team Members ({teamMembers.length})
                            </button>
                            <button
                                onClick={() => setActiveTab('shared')}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'shared'
                                        ? 'bg-purple-100 text-purple-700'
                                        : 'text-gray-600 hover:text-gray-900'
                                    }`}
                            >
                                Shared Items ({sharedItems.length})
                            </button>
                            <button
                                onClick={() => setActiveTab('permissions')}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'permissions'
                                        ? 'bg-purple-100 text-purple-700'
                                        : 'text-gray-600 hover:text-gray-900'
                                    }`}
                            >
                                Permissions & Access
                            </button>
                        </div>

                        <div className="flex items-center space-x-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder={`Search ${activeTab}...`}
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                                />
                            </div>
                            {activeTab === 'team' && (
                                <div className="flex items-center space-x-2">
                                    <Filter className="h-4 w-4 text-gray-400" />
                                    <select
                                        value={roleFilter}
                                        onChange={(e) => setRoleFilter(e.target.value)}
                                        className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    >
                                        <option value="all">All Roles</option>
                                        <option value="owner">Owner</option>
                                        <option value="admin">Admin</option>
                                        <option value="editor">Editor</option>
                                        <option value="viewer">Viewer</option>
                                    </select>
                                    <select
                                        value={statusFilter}
                                        onChange={(e) => setStatusFilter(e.target.value)}
                                        className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    >
                                        <option value="all">All Status</option>
                                        <option value="active">Active</option>
                                        <option value="invited">Invited</option>
                                        <option value="inactive">Inactive</option>
                                    </select>
                                </div>
                            )}
                        </div>
                    </div>
                </motion.div>

                {/* Content based on active tab */}
                {activeTab === 'team' && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'}`}
                    >
                        {filteredMembers.map((member) => (
                            <TeamMemberCard
                                key={member.id}
                                member={member}
                                onEdit={handleMemberEdit}
                                onRemove={handleMemberRemove}
                                onMessage={handleMemberMessage}
                            />
                        ))}
                    </motion.div>
                )}

                {activeTab === 'shared' && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'}`}
                    >
                        {filteredSharedItems.map((item) => (
                            <SharedItemCard
                                key={item.id}
                                item={item}
                                onShare={handleItemShare}
                                onUnshare={handleItemUnshare}
                                onBookmark={handleItemBookmark}
                            />
                        ))}
                    </motion.div>
                )}

                {activeTab === 'permissions' && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-xl p-8 border border-gray-200 shadow-sm"
                    >
                        <div className="text-center">
                            <Shield className="h-16 w-16 text-purple-600 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">Permissions & Access Control</h3>
                            <p className="text-gray-600 mb-6">
                                Advanced permission management system coming soon. Control access to sensitive data and analytics.
                            </p>
                            <button className="flex items-center mx-auto px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors">
                                <Settings className="h-4 w-4 mr-2" />
                                Configure Permissions
                            </button>
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    )
}
