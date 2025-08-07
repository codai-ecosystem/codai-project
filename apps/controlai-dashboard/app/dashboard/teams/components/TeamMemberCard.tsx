import React from 'react'
/**
 * TeamMemberCard Component - Individual team member card
 */
'use client'

import { motion } from 'framer-motion'
import {
    Mail, MessageSquare, Video, Phone, MapPin, Clock,
    Crown, Shield, Star, MoreHorizontal, Activity, Target
} from 'lucide-react'
import { TeamMember } from '../page'

interface TeamMemberCardProps {
    member: TeamMember
    selected: boolean
    onSelect: (selected: boolean) => void
    onAction: (action: string) => void
}

export function TeamMemberCard({ member, selected, onSelect, onAction }: TeamMemberCardProps) {
    const statusColors = {
        online: 'bg-green-500',
        offline: 'bg-gray-400',
        busy: 'bg-red-500',
        away: 'bg-yellow-500'
    }

    const statusBorders = {
        online: 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20',
        offline: 'border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800',
        busy: 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20',
        away: 'border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/20'
    }

    return (
        <motion.div
            className={`
        rounded-xl border-2 shadow-sm p-6 transition-all duration-200
        ${selected ? 'ring-2 ring-blue-500 border-blue-300' : statusBorders[member.status]}
        hover:shadow-lg hover:scale-[1.02]
      `}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
        >
            <div className="space-y-4">
                {/* Header with avatar and status */}
                <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                        <div className="relative">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                                <span className="text-white font-semibold text-lg">
                                    {member.name.split(' ').map(n => n[0]).join('')}
                                </span>
                            </div>
                            <div className={`absolute -bottom-1 -right-1 w-4 h-4 ${statusColors[member.status]} rounded-full border-2 border-white dark:border-gray-800`} />
                        </div>

                        <div className="flex-1">
                            <div className="flex items-center space-x-2">
                                <h3 className="font-semibold text-gray-900 dark:text-white">
                                    {member.name}
                                </h3>
                                {member.isManager && <Crown className="w-4 h-4 text-yellow-500" />}
                                {member.isTeamLead && <Shield className="w-4 h-4 text-blue-500" />}
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                {member.role}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center space-x-1">
                        <input
                            type="checkbox"
                            checked={selected}
                            onChange={(e) => onSelect(e.target.checked)}
                            className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
                        />
                        <button
                            onClick={() => onAction('more')}
                            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                        >
                            <MoreHorizontal className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Department and location */}
                <div className="space-y-2">
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                        <span className="font-medium">{member.department}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                        <MapPin className="w-4 h-4 mr-1" />
                        <span>{member.location}</span>
                    </div>
                </div>

                {/* Skills */}
                <div className="flex flex-wrap gap-1">
                    {member.skills.slice(0, 3).map((skill, index) => (
                        <span
                            key={index}
                            className="px-2 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded text-xs"
                        >
                            {skill}
                        </span>
                    ))}
                    {member.skills.length > 3 && (
                        <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded text-xs">
                            +{member.skills.length - 3}
                        </span>
                    )}
                </div>

                {/* Productivity and tasks */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Productivity</span>
                            <span className="text-xs text-gray-600 dark:text-gray-400">{member.productivity}%</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <motion.div
                                className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full"
                                initial={{ width: 0 }}
                                animate={{ width: `${member.productivity}%` }}
                                transition={{ duration: 1, ease: "easeOut" }}
                            />
                        </div>
                    </div>

                    <div className="text-center">
                        <div className="text-lg font-semibold text-gray-900 dark:text-white">
                            {member.completedTasks}/{member.tasksCount}
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">Tasks</div>
                    </div>
                </div>

                {/* Communication actions */}
                <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={() => onAction('message')}
                            className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                            title="Send message"
                        >
                            <MessageSquare className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => onAction('email')}
                            className="p-2 text-gray-400 hover:text-green-600 dark:hover:text-green-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                            title="Send email"
                        >
                            <Mail className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => onAction('video')}
                            className="p-2 text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                            title="Video call"
                        >
                            <Video className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="text-xs text-gray-500 dark:text-gray-400">
                        {member.status === 'online' ? 'Active now' : `Last seen ${new Date(member.lastActive).toLocaleDateString()}`}
                    </div>
                </div>
            </div>
        </motion.div>
    )
}

