import React from 'react'
/**
 * TeamMemberList Component - Comprehensive team member list with advanced features
 */
'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
    Mail, MessageSquare, Video, Phone, MapPin, Clock, Calendar,
    Crown, Shield, Star, MoreHorizontal, Activity, Target, Filter,
    ChevronDown, ChevronUp, Users, Briefcase, Award, Zap,
    ExternalLink, Edit, Trash2, UserPlus, Download, Eye
} from 'lucide-react'
import { TeamMember } from '../page'

interface TeamMemberListProps {
    members: TeamMember[]
    selectedMembers: string[]
    onMemberSelect: (memberId: string, selected: boolean) => void
    onMemberAction: (memberId: string, action: string) => void
}

interface SortConfig {
    key: keyof TeamMember | 'efficiency'
    direction: 'asc' | 'desc'
}

export function TeamMemberList({ members, selectedMembers, onMemberSelect, onMemberAction }: TeamMemberListProps) {
    const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'name', direction: 'asc' })
    const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())
    const [bulkActions, setBulkActions] = useState(false)

    const statusColors = {
        online: 'bg-green-500 text-green-100',
        offline: 'bg-gray-400 text-gray-100',
        busy: 'bg-red-500 text-red-100',
        away: 'bg-yellow-500 text-yellow-100'
    }

    const statusLabels = {
        online: 'Online',
        offline: 'Offline',
        busy: 'Busy',
        away: 'Away'
    }

    // Enhanced sorting with calculated fields
    const sortedMembers = [...members].sort((a, b) => {
        let aValue: any
        let bValue: any

        if (sortConfig.key === 'efficiency') {
            aValue = a.tasksCount > 0 ? (a.completedTasks / a.tasksCount) * 100 : 0
            bValue = b.tasksCount > 0 ? (b.completedTasks / b.tasksCount) * 100 : 0
        } else {
            aValue = a[sortConfig.key]
            bValue = b[sortConfig.key]
        }

        if (typeof aValue === 'string') {
            aValue = aValue.toLowerCase()
            bValue = bValue.toLowerCase()
        }

        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1
        return 0
    })

    const handleSort = (key: keyof TeamMember | 'efficiency') => {
        setSortConfig(prev => ({
            key,
            direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
        }))
    }

    const toggleRowExpanded = (memberId: string) => {
        setExpandedRows(prev => {
            const newSet = new Set(prev)
            if (newSet.has(memberId)) {
                newSet.delete(memberId)
            } else {
                newSet.add(memberId)
            }
            return newSet
        })
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        })
    }

    const formatLastActive = (timestamp: string) => {
        const now = new Date()
        const lastActive = new Date(timestamp)
        const diffMs = now.getTime() - lastActive.getTime()
        const diffMins = Math.floor(diffMs / (1000 * 60))
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

        if (diffMins < 1) return 'Just now'
        if (diffMins < 60) return `${diffMins}m ago`
        if (diffHours < 24) return `${diffHours}h ago`
        return `${diffDays}d ago`
    }

    const getSortIcon = (key: keyof TeamMember | 'efficiency') => {
        if (sortConfig.key !== key) return <ChevronDown className="w-4 h-4 opacity-0 group-hover:opacity-100" />
        return sortConfig.direction === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
    }

    const allSelected = selectedMembers.length === members.length
    const someSelected = selectedMembers.length > 0

    return (
        <div className="space-y-6">
            {/* List Controls */}
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl border border-gray-200/50 dark:border-gray-700/50 p-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0">
                    <div className="flex items-center space-x-4">
                        <label className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                checked={allSelected}
                                onChange={(e) => {
                                    if (e.target.checked) {
                                        members.forEach(member => onMemberSelect(member.id, true))
                                    } else {
                                        selectedMembers.forEach(id => onMemberSelect(id, false))
                                    }
                                }}
                                className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Select All ({members.length})
                            </span>
                        </label>

                        {someSelected && (
                            <motion.div
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="flex items-center space-x-2"
                            >
                                <span className="text-sm text-blue-600 dark:text-blue-400">
                                    {selectedMembers.length} selected
                                </span>
                                <button
                                    onClick={() => setBulkActions(!bulkActions)}
                                    className="px-3 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-lg text-sm font-medium hover:bg-blue-200 dark:hover:bg-blue-900/40 transition-colors"
                                >
                                    Bulk Actions
                                </button>
                            </motion.div>
                        )}
                    </div>

                    <div className="flex items-center space-x-2">
                        <button className="flex items-center px-3 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                            <Filter className="w-4 h-4 mr-2" />
                            Filter
                        </button>
                        <button className="flex items-center px-3 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                            <Download className="w-4 h-4 mr-2" />
                            Export
                        </button>
                        <button className="flex items-center px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                            <UserPlus className="w-4 h-4 mr-2" />
                            Add Member
                        </button>
                    </div>
                </div>

                {/* Bulk Actions Panel */}
                {bulkActions && someSelected && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700"
                    >
                        <div className="flex items-center space-x-2">
                            <button className="px-3 py-2 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-lg text-sm font-medium hover:bg-green-200 dark:hover:bg-green-900/40 transition-colors">
                                Send Message
                            </button>
                            <button className="px-3 py-2 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-lg text-sm font-medium hover:bg-blue-200 dark:hover:bg-blue-900/40 transition-colors">
                                Schedule Meeting
                            </button>
                            <button className="px-3 py-2 bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 rounded-lg text-sm font-medium hover:bg-purple-200 dark:hover:bg-purple-900/40 transition-colors">
                                Assign Tasks
                            </button>
                            <button className="px-3 py-2 bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400 rounded-lg text-sm font-medium hover:bg-orange-200 dark:hover:bg-orange-900/40 transition-colors">
                                Update Roles
                            </button>
                        </div>
                    </motion.div>
                )}
            </div>

            {/* Team Members Table */}
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50/50 dark:bg-gray-700/50 border-b border-gray-200/50 dark:border-gray-600/50">
                            <tr>
                                <th className="px-6 py-4 text-left">
                                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Member
                                    </span>
                                </th>
                                <th className="px-6 py-4 text-left">
                                    <button
                                        onClick={() => handleSort('role')}
                                        className="group flex items-center space-x-1 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hover:text-gray-700 dark:hover:text-gray-200"
                                    >
                                        <span>Role</span>
                                        {getSortIcon('role')}
                                    </button>
                                </th>
                                <th className="px-6 py-4 text-left">
                                    <button
                                        onClick={() => handleSort('department')}
                                        className="group flex items-center space-x-1 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hover:text-gray-700 dark:hover:text-gray-200"
                                    >
                                        <span>Department</span>
                                        {getSortIcon('department')}
                                    </button>
                                </th>
                                <th className="px-6 py-4 text-left">
                                    <button
                                        onClick={() => handleSort('status')}
                                        className="group flex items-center space-x-1 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hover:text-gray-700 dark:hover:text-gray-200"
                                    >
                                        <span>Status</span>
                                        {getSortIcon('status')}
                                    </button>
                                </th>
                                <th className="px-6 py-4 text-left">
                                    <button
                                        onClick={() => handleSort('productivity')}
                                        className="group flex items-center space-x-1 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hover:text-gray-700 dark:hover:text-gray-200"
                                    >
                                        <span>Productivity</span>
                                        {getSortIcon('productivity')}
                                    </button>
                                </th>
                                <th className="px-6 py-4 text-left">
                                    <button
                                        onClick={() => handleSort('efficiency')}
                                        className="group flex items-center space-x-1 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hover:text-gray-700 dark:hover:text-gray-200"
                                    >
                                        <span>Tasks</span>
                                        {getSortIcon('efficiency')}
                                    </button>
                                </th>
                                <th className="px-6 py-4 text-left">
                                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Actions
                                    </span>
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200/50 dark:divide-gray-700/50">
                            {sortedMembers.map((member, index) => (
                                <React.Fragment key={member.id}>
                                    <motion.tr
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        className={`hover:bg-gray-50/50 dark:hover:bg-gray-700/30 transition-colors ${selectedMembers.includes(member.id) ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''
                                            }`}
                                    >
                                        <td className="px-6 py-4">
                                            <div className="flex items-center space-x-3">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedMembers.includes(member.id)}
                                                    onChange={(e) => onMemberSelect(member.id, e.target.checked)}
                                                    className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
                                                />
                                                <div className="relative">
                                                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                                                        <span className="text-white font-medium text-sm">
                                                            {member.name.split(' ').map(n => n[0]).join('')}
                                                        </span>
                                                    </div>
                                                    <div className={`absolute -bottom-1 -right-1 w-3 h-3 ${statusColors[member.status].split(' ')[0]} rounded-full border-2 border-white dark:border-gray-800`} />
                                                </div>
                                                <div>
                                                    <div className="flex items-center space-x-2">
                                                        <span className="font-medium text-gray-900 dark:text-white">
                                                            {member.name}
                                                        </span>
                                                        {member.isManager && <Crown className="w-4 h-4 text-yellow-500" />}
                                                        {member.isTeamLead && <Shield className="w-4 h-4 text-blue-500" />}
                                                    </div>
                                                    <div className="text-sm text-gray-500 dark:text-gray-400">
                                                        {member.email}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                {member.role}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-900 dark:text-white">
                                                {member.department}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[member.status]}`}>
                                                {statusLabels[member.status]}
                                            </span>
                                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                {formatLastActive(member.lastActive)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center space-x-2">
                                                <div className="flex-1">
                                                    <div className="flex items-center justify-between mb-1">
                                                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                                                            {member.productivity}%
                                                        </span>
                                                    </div>
                                                    <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                                        <motion.div
                                                            className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full"
                                                            initial={{ width: 0 }}
                                                            animate={{ width: `${member.productivity}%` }}
                                                            transition={{ duration: 1, delay: index * 0.1 }}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm">
                                                <div className="font-medium text-gray-900 dark:text-white">
                                                    {member.completedTasks}/{member.tasksCount}
                                                </div>
                                                <div className="text-gray-500 dark:text-gray-400">
                                                    {member.tasksCount > 0 ? Math.round((member.completedTasks / member.tasksCount) * 100) : 0}% complete
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center space-x-1">
                                                <button
                                                    onClick={() => toggleRowExpanded(member.id)}
                                                    className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded"
                                                    title="View details"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => onMemberAction(member.id, 'message')}
                                                    className="p-1 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 rounded"
                                                    title="Send message"
                                                >
                                                    <MessageSquare className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => onMemberAction(member.id, 'email')}
                                                    className="p-1 text-gray-400 hover:text-green-600 dark:hover:text-green-400 rounded"
                                                    title="Send email"
                                                >
                                                    <Mail className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => onMemberAction(member.id, 'video')}
                                                    className="p-1 text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 rounded"
                                                    title="Video call"
                                                >
                                                    <Video className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => onMemberAction(member.id, 'more')}
                                                    className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded"
                                                    title="More actions"
                                                >
                                                    <MoreHorizontal className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </motion.tr>

                                    {/* Expanded Row Details */}
                                    {expandedRows.has(member.id) && (
                                        <motion.tr
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="bg-gray-50/50 dark:bg-gray-700/20"
                                        >
                                            <td colSpan={7} className="px-6 py-4">
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                                    {/* Contact Information */}
                                                    <div>
                                                        <h4 className="font-medium text-gray-900 dark:text-white mb-3">Contact & Location</h4>
                                                        <div className="space-y-2 text-sm">
                                                            <div className="flex items-center space-x-2">
                                                                <Mail className="w-4 h-4 text-gray-400" />
                                                                <span className="text-gray-600 dark:text-gray-400">{member.email}</span>
                                                            </div>
                                                            <div className="flex items-center space-x-2">
                                                                <MapPin className="w-4 h-4 text-gray-400" />
                                                                <span className="text-gray-600 dark:text-gray-400">{member.location}</span>
                                                            </div>
                                                            <div className="flex items-center space-x-2">
                                                                <Clock className="w-4 h-4 text-gray-400" />
                                                                <span className="text-gray-600 dark:text-gray-400">{member.timezone}</span>
                                                            </div>
                                                            <div className="flex items-center space-x-2">
                                                                <Calendar className="w-4 h-4 text-gray-400" />
                                                                <span className="text-gray-600 dark:text-gray-400">
                                                                    Joined {formatDate(member.joinDate)}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Skills */}
                                                    <div>
                                                        <h4 className="font-medium text-gray-900 dark:text-white mb-3">Skills & Expertise</h4>
                                                        <div className="flex flex-wrap gap-1">
                                                            {member.skills.map((skill, skillIndex) => (
                                                                <span
                                                                    key={skillIndex}
                                                                    className="px-2 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded text-xs"
                                                                >
                                                                    {skill}
                                                                </span>
                                                            ))}
                                                        </div>
                                                        <div className="mt-3 text-sm text-gray-600 dark:text-gray-400">
                                                            <div className="flex items-center space-x-2">
                                                                <MessageSquare className="w-4 h-4" />
                                                                <span>Prefers {member.communicationPreference} communication</span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Performance Metrics */}
                                                    <div>
                                                        <h4 className="font-medium text-gray-900 dark:text-white mb-3">Performance Metrics</h4>
                                                        <div className="space-y-3">
                                                            <div>
                                                                <div className="flex items-center justify-between mb-1">
                                                                    <span className="text-sm text-gray-600 dark:text-gray-400">Productivity</span>
                                                                    <span className="text-sm font-medium">{member.productivity}%</span>
                                                                </div>
                                                                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                                                    <div
                                                                        className="bg-blue-500 h-2 rounded-full"
                                                                        style={{ width: `${member.productivity}%` }}
                                                                    />
                                                                </div>
                                                            </div>
                                                            <div>
                                                                <div className="flex items-center justify-between mb-1">
                                                                    <span className="text-sm text-gray-600 dark:text-gray-400">Task Completion</span>
                                                                    <span className="text-sm font-medium">
                                                                        {member.tasksCount > 0 ? Math.round((member.completedTasks / member.tasksCount) * 100) : 0}%
                                                                    </span>
                                                                </div>
                                                                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                                                    <div
                                                                        className="bg-green-500 h-2 rounded-full"
                                                                        style={{
                                                                            width: `${member.tasksCount > 0 ? (member.completedTasks / member.tasksCount) * 100 : 0}%`
                                                                        }}
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    )}
                                </React.Fragment>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}

