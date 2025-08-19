'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
    Users,
    Plus,
    Search,
    Crown,
    Shield,
    User,
    Mail,
    Clock,
    CheckCircle,
    XCircle,
    Edit,
    MoreHorizontal,
    UserPlus,
    Send,
    Activity,
    Key,
    Eye,
    Globe,
    MapPin
} from 'lucide-react'

// TypeScript interfaces for Team Collaboration
interface TeamMember {
    id: string
    name: string
    email: string
    role: 'owner' | 'admin' | 'editor' | 'viewer'
    status: 'active' | 'pending' | 'inactive'
    avatar: string
    joinedAt: string
    lastActive: string
    permissions: {
        workflows: boolean
        integrations: boolean
        analytics: boolean
        settings: boolean
    }
    stats: {
        workflowsCreated: number
        collaborations: number
        lastContribution: string
    }
    department: string
    location: string
}

interface Invitation {
    id: string
    email: string
    role: 'admin' | 'editor' | 'viewer'
    sentAt: string
    sentBy: string
    status: 'pending' | 'accepted' | 'expired'
    expiresAt: string
}

interface ActivityItem {
    id: string
    type: 'workflow_created' | 'workflow_shared' | 'user_invited' | 'permission_changed' | 'integration_added'
    user: {
        name: string
        avatar: string
    }
    description: string
    timestamp: string
    target?: string
}

export default function TeamCollaboration() {
    const [activeTab, setActiveTab] = useState('members')
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedRole, setSelectedRole] = useState('all')

    // Team members
    const teamMembers: TeamMember[] = [
        {
            id: 'member-1',
            name: 'Sarah Johnson',
            email: 'sarah.johnson@company.com',
            role: 'owner',
            status: 'active',
            avatar: '/avatars/sarah.jpg',
            joinedAt: '2023-08-15T10:00:00Z',
            lastActive: '2024-01-20T09:30:00Z',
            permissions: {
                workflows: true,
                integrations: true,
                analytics: true,
                settings: true
            },
            stats: {
                workflowsCreated: 47,
                collaborations: 156,
                lastContribution: '2024-01-20T08:45:00Z'
            },
            department: 'Engineering',
            location: 'San Francisco, CA'
        },
        {
            id: 'member-2',
            name: 'Michael Chen',
            email: 'michael.chen@company.com',
            role: 'admin',
            status: 'active',
            avatar: '/avatars/michael.jpg',
            joinedAt: '2023-09-01T14:30:00Z',
            lastActive: '2024-01-20T10:15:00Z',
            permissions: {
                workflows: true,
                integrations: true,
                analytics: true,
                settings: false
            },
            stats: {
                workflowsCreated: 32,
                collaborations: 89,
                lastContribution: '2024-01-19T16:20:00Z'
            },
            department: 'Operations',
            location: 'New York, NY'
        },
        {
            id: 'member-3',
            name: 'Emily Rodriguez',
            email: 'emily.rodriguez@company.com',
            role: 'editor',
            status: 'active',
            avatar: '/avatars/emily.jpg',
            joinedAt: '2023-10-12T11:15:00Z',
            lastActive: '2024-01-19T15:45:00Z',
            permissions: {
                workflows: true,
                integrations: false,
                analytics: true,
                settings: false
            },
            stats: {
                workflowsCreated: 18,
                collaborations: 34,
                lastContribution: '2024-01-18T14:30:00Z'
            },
            department: 'Marketing',
            location: 'Austin, TX'
        },
        {
            id: 'member-4',
            name: 'David Kim',
            email: 'david.kim@company.com',
            role: 'viewer',
            status: 'pending',
            avatar: '/avatars/david.jpg',
            joinedAt: '2024-01-18T16:00:00Z',
            lastActive: '2024-01-18T16:00:00Z',
            permissions: {
                workflows: false,
                integrations: false,
                analytics: true,
                settings: false
            },
            stats: {
                workflowsCreated: 0,
                collaborations: 0,
                lastContribution: 'Never'
            },
            department: 'Sales',
            location: 'Chicago, IL'
        },
        {
            id: 'member-5',
            name: 'Lisa Wang',
            email: 'lisa.wang@company.com',
            role: 'editor',
            status: 'inactive',
            avatar: '/avatars/lisa.jpg',
            joinedAt: '2023-11-05T09:45:00Z',
            lastActive: '2024-01-10T12:30:00Z',
            permissions: {
                workflows: true,
                integrations: false,
                analytics: true,
                settings: false
            },
            stats: {
                workflowsCreated: 12,
                collaborations: 27,
                lastContribution: '2024-01-08T11:15:00Z'
            },
            department: 'HR',
            location: 'Seattle, WA'
        }
    ]

    // Pending invitations
    const invitations: Invitation[] = [
        {
            id: 'inv-1',
            email: 'alex.thompson@company.com',
            role: 'editor',
            sentAt: '2024-01-19T10:30:00Z',
            sentBy: 'Sarah Johnson',
            status: 'pending',
            expiresAt: '2024-01-26T10:30:00Z'
        },
        {
            id: 'inv-2',
            email: 'maria.garcia@company.com',
            role: 'viewer',
            sentAt: '2024-01-18T14:15:00Z',
            sentBy: 'Michael Chen',
            status: 'pending',
            expiresAt: '2024-01-25T14:15:00Z'
        }
    ]

    // Recent activity
    const activities: ActivityItem[] = [
        {
            id: 'act-1',
            type: 'workflow_created',
            user: {
                name: 'Michael Chen',
                avatar: '/avatars/michael.jpg'
            },
            description: 'created a new workflow "Customer Onboarding v2"',
            timestamp: '2024-01-20T09:15:00Z',
            target: 'Customer Onboarding v2'
        },
        {
            id: 'act-2',
            type: 'user_invited',
            user: {
                name: 'Sarah Johnson',
                avatar: '/avatars/sarah.jpg'
            },
            description: 'invited alex.thompson@company.com to join the team',
            timestamp: '2024-01-19T10:30:00Z',
            target: 'alex.thompson@company.com'
        },
        {
            id: 'act-3',
            type: 'workflow_shared',
            user: {
                name: 'Emily Rodriguez',
                avatar: '/avatars/emily.jpg'
            },
            description: 'shared "Lead Scoring Automation" with Marketing team',
            timestamp: '2024-01-18T16:45:00Z',
            target: 'Lead Scoring Automation'
        },
        {
            id: 'act-4',
            type: 'integration_added',
            user: {
                name: 'Michael Chen',
                avatar: '/avatars/michael.jpg'
            },
            description: 'connected HubSpot CRM integration',
            timestamp: '2024-01-18T14:20:00Z',
            target: 'HubSpot CRM'
        }
    ]

    const roles = [
        { value: 'all', label: 'All Roles' },
        { value: 'owner', label: 'Owner' },
        { value: 'admin', label: 'Admin' },
        { value: 'editor', label: 'Editor' },
        { value: 'viewer', label: 'Viewer' }
    ]

    const tabs = [
        { id: 'members', label: 'Team Members', count: teamMembers.length },
        { id: 'invitations', label: 'Invitations', count: invitations.length },
        { id: 'activity', label: 'Activity', count: activities.length },
        { id: 'permissions', label: 'Permissions', count: 4 }
    ]

    // Filter members
    const filteredMembers = teamMembers.filter(member => {
        const matchesSearch = member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            member.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
            member.department.toLowerCase().includes(searchQuery.toLowerCase())

        const matchesRole = selectedRole === 'all' || member.role === selectedRole

        return matchesSearch && matchesRole
    })

    const getRoleIcon = (role: string) => {
        switch (role) {
            case 'owner': return Crown
            case 'admin': return Shield
            case 'editor': return Edit
            case 'viewer': return Eye
            default: return User
        }
    }

    const getRoleColor = (role: string) => {
        switch (role) {
            case 'owner': return 'from-yellow-500 to-orange-600'
            case 'admin': return 'from-purple-500 to-indigo-600'
            case 'editor': return 'from-blue-500 to-cyan-600'
            case 'viewer': return 'from-gray-500 to-gray-600'
            default: return 'from-gray-500 to-gray-600'
        }
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'text-green-600 bg-green-100'
            case 'pending': return 'text-yellow-600 bg-yellow-100'
            case 'inactive': return 'text-gray-600 bg-gray-100'
            default: return 'text-gray-600 bg-gray-100'
        }
    }

    const formatLastActive = (timestamp: string) => {
        const date = new Date(timestamp)
        const now = new Date()
        const diffMs = now.getTime() - date.getTime()
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
        const diffDays = Math.floor(diffHours / 24)

        if (diffDays > 0) return `${diffDays}d ago`
        if (diffHours > 0) return `${diffHours}h ago`
        return 'Just now'
    }

    const formatDate = (timestamp: string) => {
        return new Date(timestamp).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        })
    }

    const getActivityIcon = (type: string) => {
        switch (type) {
            case 'workflow_created': return Plus
            case 'workflow_shared': return Send
            case 'user_invited': return UserPlus
            case 'permission_changed': return Key
            case 'integration_added': return Globe
            default: return Activity
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50">
            {/* Header */}
            <motion.header
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/80 backdrop-blur-md border-b border-purple-200 shadow-sm sticky top-0 z-40"
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-3">
                                <div className="bg-gradient-to-r from-purple-500 to-indigo-600 p-2 rounded-xl">
                                    <Users className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-indigo-700 bg-clip-text text-transparent">
                                        Team Collaboration
                                    </h1>
                                    <p className="text-sm text-gray-500">Manage users and collaboration</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center space-x-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search team members..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-10 pr-4 py-2 w-80 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/80 backdrop-blur-sm"
                                />
                            </div>

                            <select
                                value={selectedRole}
                                onChange={(e) => setSelectedRole(e.target.value)}
                                className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/80 backdrop-blur-sm"
                            >
                                {roles.map((role) => (
                                    <option key={role.value} value={role.value}>{role.label}</option>
                                ))}
                            </select>

                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:shadow-lg transition-all duration-200"
                            >
                                <Plus className="h-4 w-4 inline mr-2" />
                                Invite Member
                            </motion.button>
                        </div>
                    </div>
                </div>
            </motion.header>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Tabs */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <div className="flex space-x-1 bg-gray-100/80 backdrop-blur-sm p-1 rounded-xl">
                        {tabs.map((tab) => (
                            <motion.button
                                key={tab.id}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => setActiveTab(tab.id)}
                                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2 ${activeTab === tab.id
                                        ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-lg'
                                        : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                                    }`}
                            >
                                <span>{tab.label}</span>
                                <span className={`text-xs px-2 py-1 rounded-full ${activeTab === tab.id
                                        ? 'bg-white/20 text-white'
                                        : 'bg-gray-200 text-gray-600'
                                    }`}>
                                    {tab.count}
                                </span>
                            </motion.button>
                        ))}
                    </div>
                </motion.div>

                {/* Team Members Tab */}
                {activeTab === 'members' && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
                    >
                        {filteredMembers.map((member, index) => {
                            const RoleIcon = getRoleIcon(member.role)

                            return (
                                <motion.div
                                    key={member.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-purple-100 shadow-sm hover:shadow-lg transition-all duration-300"
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
                                                <span className="text-lg font-bold text-gray-600">
                                                    {member.name.split(' ').map(n => n[0]).join('')}
                                                </span>
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-gray-900">{member.name}</h3>
                                                <p className="text-sm text-gray-500">{member.department}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center space-x-2">
                                            <div className={`bg-gradient-to-r ${getRoleColor(member.role)} p-2 rounded-lg`}>
                                                <RoleIcon className="h-4 w-4 text-white" />
                                            </div>
                                            <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(member.status)}`}>
                                                {member.status}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                                            <Mail className="h-4 w-4" />
                                            <span>{member.email}</span>
                                        </div>

                                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                                            <MapPin className="h-4 w-4" />
                                            <span>{member.location}</span>
                                        </div>

                                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                                            <Clock className="h-4 w-4" />
                                            <span>Last active {formatLastActive(member.lastActive)}</span>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-200">
                                        <div className="text-center">
                                            <div className="text-lg font-bold text-gray-900">{member.stats.workflowsCreated}</div>
                                            <div className="text-xs text-gray-500">Workflows</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-lg font-bold text-gray-900">{member.stats.collaborations}</div>
                                            <div className="text-xs text-gray-500">Collaborations</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-lg font-bold text-gray-900">
                                                {formatDate(member.joinedAt)}
                                            </div>
                                            <div className="text-xs text-gray-500">Joined</div>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between mt-4">
                                        <div className="text-xs text-gray-500">
                                            Role: {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                                        </div>

                                        <div className="flex items-center space-x-2">
                                            <motion.button
                                                whileHover={{ scale: 1.1 }}
                                                whileTap={{ scale: 0.9 }}
                                                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                                            >
                                                <Edit className="h-4 w-4" />
                                            </motion.button>
                                            <motion.button
                                                whileHover={{ scale: 1.1 }}
                                                whileTap={{ scale: 0.9 }}
                                                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                                            >
                                                <MoreHorizontal className="h-4 w-4" />
                                            </motion.button>
                                        </div>
                                    </div>
                                </motion.div>
                            )
                        })}
                    </motion.div>
                )}

                {/* Invitations Tab */}
                {activeTab === 'invitations' && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-purple-100 shadow-sm"
                    >
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">Pending Invitations</h3>
                                <p className="text-sm text-gray-500">Manage sent invitations</p>
                            </div>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:shadow-lg transition-all duration-200"
                            >
                                Send Invitation
                            </motion.button>
                        </div>

                        <div className="space-y-4">
                            {invitations.map((invitation, index) => (
                                <motion.div
                                    key={invitation.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                                >
                                    <div className="flex items-center space-x-4">
                                        <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                                            <Mail className="h-5 w-5 text-gray-600" />
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-gray-900">{invitation.email}</h4>
                                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                                                <span>Role: {invitation.role}</span>
                                                <span>•</span>
                                                <span>Sent by {invitation.sentBy}</span>
                                                <span>•</span>
                                                <span>Expires {formatDate(invitation.expiresAt)}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center space-x-3">
                                        <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(invitation.status)}`}>
                                            {invitation.status}
                                        </span>

                                        <motion.button
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.9 }}
                                            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                                            title="Resend invitation"
                                        >
                                            <Send className="h-4 w-4" />
                                        </motion.button>

                                        <motion.button
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.9 }}
                                            className="p-2 text-red-400 hover:text-red-600 transition-colors"
                                            title="Cancel invitation"
                                        >
                                            <XCircle className="h-4 w-4" />
                                        </motion.button>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* Activity Tab */}
                {activeTab === 'activity' && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-purple-100 shadow-sm"
                    >
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">Recent Activity</h3>
                                <p className="text-sm text-gray-500">Team collaboration activity</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            {activities.map((activity, index) => {
                                const ActivityIcon = getActivityIcon(activity.type)

                                return (
                                    <motion.div
                                        key={activity.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        className="flex items-start space-x-4 p-4 bg-gray-50 rounded-xl"
                                    >
                                        <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
                                            <span className="text-sm font-bold text-gray-600">
                                                {activity.user.name.split(' ').map(n => n[0]).join('')}
                                            </span>
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center space-x-2">
                                                <ActivityIcon className="h-4 w-4 text-purple-500" />
                                                <p className="text-sm text-gray-900">
                                                    <span className="font-medium">{activity.user.name}</span>
                                                    {' '}
                                                    <span>{activity.description}</span>
                                                </p>
                                            </div>
                                            <p className="text-xs text-gray-500 mt-1">
                                                {formatLastActive(activity.timestamp)}
                                            </p>
                                        </div>
                                    </motion.div>
                                )
                            })}
                        </div>
                    </motion.div>
                )}

                {/* Permissions Tab */}
                {activeTab === 'permissions' && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-purple-100 shadow-sm"
                    >
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">Role Permissions</h3>
                                <p className="text-sm text-gray-500">Manage role-based access control</p>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-gray-200">
                                        <th className="text-left py-3 px-4 font-semibold text-gray-900">Role</th>
                                        <th className="text-center py-3 px-4 font-semibold text-gray-900">Workflows</th>
                                        <th className="text-center py-3 px-4 font-semibold text-gray-900">Integrations</th>
                                        <th className="text-center py-3 px-4 font-semibold text-gray-900">Analytics</th>
                                        <th className="text-center py-3 px-4 font-semibold text-gray-900">Settings</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {['owner', 'admin', 'editor', 'viewer'].map((role) => {
                                        const RoleIcon = getRoleIcon(role)
                                        return (
                                            <tr key={role} className="border-b border-gray-100">
                                                <td className="py-4 px-4">
                                                    <div className="flex items-center space-x-3">
                                                        <div className={`bg-gradient-to-r ${getRoleColor(role)} p-2 rounded-lg`}>
                                                            <RoleIcon className="h-4 w-4 text-white" />
                                                        </div>
                                                        <span className="font-medium text-gray-900 capitalize">{role}</span>
                                                    </div>
                                                </td>
                                                <td className="py-4 px-4 text-center">
                                                    {(role === 'owner' || role === 'admin' || role === 'editor') ? (
                                                        <CheckCircle className="h-5 w-5 text-green-500 mx-auto" />
                                                    ) : (
                                                        <XCircle className="h-5 w-5 text-red-500 mx-auto" />
                                                    )}
                                                </td>
                                                <td className="py-4 px-4 text-center">
                                                    {(role === 'owner' || role === 'admin') ? (
                                                        <CheckCircle className="h-5 w-5 text-green-500 mx-auto" />
                                                    ) : (
                                                        <XCircle className="h-5 w-5 text-red-500 mx-auto" />
                                                    )}
                                                </td>
                                                <td className="py-4 px-4 text-center">
                                                    {role !== 'viewer' ? (
                                                        <CheckCircle className="h-5 w-5 text-green-500 mx-auto" />
                                                    ) : (
                                                        <Eye className="h-5 w-5 text-blue-500 mx-auto" />
                                                    )}
                                                </td>
                                                <td className="py-4 px-4 text-center">
                                                    {role === 'owner' ? (
                                                        <CheckCircle className="h-5 w-5 text-green-500 mx-auto" />
                                                    ) : (
                                                        <XCircle className="h-5 w-5 text-red-500 mx-auto" />
                                                    )}
                                                </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    )
}
