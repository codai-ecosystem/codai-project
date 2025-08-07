'use client'

import React from 'react'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
    Mail,
    Send,
    Inbox,
    Users,
    BarChart3,
    TrendingUp,
    Clock,
    Star,
    Filter,
    Calendar,
    Activity,
    MessageSquare,
    CheckCircle,
    AlertCircle
} from 'lucide-react'

interface DashboardStats {
    totalEmails: number
    unreadEmails: number
    sentEmails: number
    starredEmails: number
    contacts: number
    avgResponseTime: number
    emailsToday: number
    emailsThisWeek: number
    topSenders: Array<{ name: string; count: number; avatar?: string }>
    activityData: Array<{ day: string; sent: number; received: number }>
}

interface EmailAnalyticsDashboardProps {
    isOpen: boolean
    onClose: () => void
}

export default function EmailAnalyticsDashboard({ isOpen, onClose }: EmailAnalyticsDashboardProps) {
    const [stats, setStats] = useState<DashboardStats>({
        totalEmails: 1247,
        unreadEmails: 23,
        sentEmails: 456,
        starredEmails: 34,
        contacts: 127,
        avgResponseTime: 2.4,
        emailsToday: 12,
        emailsThisWeek: 78,
        topSenders: [
            { name: 'Alex Johnson', count: 15 },
            { name: 'Sarah Martinez', count: 12 },
            { name: 'Maria Rodriguez', count: 8 },
            { name: 'Microsoft Teams', count: 7 },
            { name: 'LinkedIn', count: 5 }
        ],
        activityData: [
            { day: 'Mon', sent: 12, received: 18 },
            { day: 'Tue', sent: 15, received: 22 },
            { day: 'Wed', sent: 8, received: 16 },
            { day: 'Thu', sent: 20, received: 25 },
            { day: 'Fri', sent: 16, received: 19 },
            { day: 'Sat', sent: 3, received: 5 },
            { day: 'Sun', sent: 4, received: 7 }
        ]
    })

    const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('week')

    const getStatCardVariant = (index: number) => ({
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { delay: index * 0.1, duration: 0.5 }
    })

    const maxActivity = Math.max(...stats.activityData.map(d => Math.max(d.sent, d.received)))

    if (!isOpen) return null

    return (
        <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
        >
            <motion.div
                className="bg-white rounded-xl shadow-2xl w-full max-w-7xl max-h-[90vh] flex flex-col overflow-hidden"
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
                    <div className="flex items-center gap-3">
                        <BarChart3 className="h-6 w-6 text-blue-600" />
                        <h2 className="text-xl font-semibold text-gray-900">Email Analytics Dashboard</h2>
                    </div>
                    <div className="flex items-center gap-4">
                        <select
                            value={timeRange}
                            onChange={(e) => setTimeRange(e.target.value as 'week' | 'month' | 'year')}
                            className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                        >
                            <option value="week">This Week</option>
                            <option value="month">This Month</option>
                            <option value="year">This Year</option>
                        </select>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            ×
                        </button>
                    </div>
                </div>

                <div className="flex-1 p-6 overflow-y-auto">
                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        {/* Total Emails */}
                        <motion.div
                            className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white"
                            {...getStatCardVariant(0)}
                        >
                            <div className="flex items-center justify-between mb-4">
                                <Mail className="h-8 w-8" />
                                <div className="text-right">
                                    <p className="text-blue-100 text-sm">Total Emails</p>
                                    <p className="text-2xl font-bold">{stats.totalEmails.toLocaleString()}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <TrendingUp className="h-4 w-4" />
                                <span className="text-sm">+12% from last month</span>
                            </div>
                        </motion.div>

                        {/* Unread Emails */}
                        <motion.div
                            className="bg-gradient-to-r from-orange-500 to-red-500 rounded-lg p-6 text-white"
                            {...getStatCardVariant(1)}
                        >
                            <div className="flex items-center justify-between mb-4">
                                <AlertCircle className="h-8 w-8" />
                                <div className="text-right">
                                    <p className="text-orange-100 text-sm">Unread</p>
                                    <p className="text-2xl font-bold">{stats.unreadEmails}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4" />
                                <span className="text-sm">Avg: 2.4h response time</span>
                            </div>
                        </motion.div>

                        {/* Sent Emails */}
                        <motion.div
                            className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white"
                            {...getStatCardVariant(2)}
                        >
                            <div className="flex items-center justify-between mb-4">
                                <Send className="h-8 w-8" />
                                <div className="text-right">
                                    <p className="text-green-100 text-sm">Sent</p>
                                    <p className="text-2xl font-bold">{stats.sentEmails}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <CheckCircle className="h-4 w-4" />
                                <span className="text-sm">{stats.emailsToday} sent today</span>
                            </div>
                        </motion.div>

                        {/* Contacts */}
                        <motion.div
                            className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-6 text-white"
                            {...getStatCardVariant(3)}
                        >
                            <div className="flex items-center justify-between mb-4">
                                <Users className="h-8 w-8" />
                                <div className="text-right">
                                    <p className="text-purple-100 text-sm">Contacts</p>
                                    <p className="text-2xl font-bold">{stats.contacts}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Star className="h-4 w-4" />
                                <span className="text-sm">{stats.starredEmails} starred</span>
                            </div>
                        </motion.div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Activity Chart */}
                        <motion.div
                            className="bg-white rounded-lg border border-gray-200 p-6"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.4, duration: 0.5 }}
                        >
                            <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                                <Activity className="h-5 w-5 text-blue-600" />
                                Email Activity
                            </h3>
                            <div className="space-y-4">
                                {stats.activityData.map((day, index) => (
                                    <div key={day.day} className="flex items-center gap-4">
                                        <div className="w-10 text-sm font-medium text-gray-600">{day.day}</div>
                                        <div className="flex-1">
                                            <div className="flex gap-2 h-8">
                                                {/* Sent bar */}
                                                <div className="flex-1 relative">
                                                    <div
                                                        className="bg-blue-500 rounded-l h-full transition-all duration-300"
                                                        style={{ width: `${(day.sent / maxActivity) * 100}%` }}
                                                    />
                                                    <span className="absolute inset-0 flex items-center justify-center text-xs font-medium text-white">
                                                        {day.sent}
                                                    </span>
                                                </div>
                                                {/* Received bar */}
                                                <div className="flex-1 relative">
                                                    <div
                                                        className="bg-green-500 rounded-r h-full transition-all duration-300"
                                                        style={{ width: `${(day.received / maxActivity) * 100}%` }}
                                                    />
                                                    <span className="absolute inset-0 flex items-center justify-center text-xs font-medium text-white">
                                                        {day.received}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="flex items-center justify-center gap-6 mt-6 pt-4 border-t border-gray-200">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 bg-blue-500 rounded"></div>
                                    <span className="text-sm text-gray-600">Sent</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 bg-green-500 rounded"></div>
                                    <span className="text-sm text-gray-600">Received</span>
                                </div>
                            </div>
                        </motion.div>

                        {/* Top Senders */}
                        <motion.div
                            className="bg-white rounded-lg border border-gray-200 p-6"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.5, duration: 0.5 }}
                        >
                            <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                                <MessageSquare className="h-5 w-5 text-blue-600" />
                                Top Email Senders
                            </h3>
                            <div className="space-y-4">
                                {stats.topSenders.map((sender, index) => (
                                    <motion.div
                                        key={sender.name}
                                        className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.6 + index * 0.1 }}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                                                {sender.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900">{sender.name}</p>
                                                <p className="text-sm text-gray-500">{sender.count} emails</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-24 h-2 bg-gray-200 rounded-full">
                                                <div
                                                    className="h-full bg-blue-500 rounded-full transition-all duration-300"
                                                    style={{ width: `${(sender.count / Math.max(...stats.topSenders.map(s => s.count))) * 100}%` }}
                                                />
                                            </div>
                                            <span className="text-sm font-semibold text-gray-700">{sender.count}</span>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    </div>

                    {/* Performance Metrics */}
                    <motion.div
                        className="mt-8 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-6"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.8 }}
                    >
                        <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                            <TrendingUp className="h-5 w-5 text-indigo-600" />
                            Performance Insights
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="text-center">
                                <div className="text-3xl font-bold text-indigo-600 mb-2">{stats.avgResponseTime}h</div>
                                <p className="text-sm text-gray-600">Average Response Time</p>
                                <p className="text-xs text-green-600 mt-1">↓ 15% improvement</p>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl font-bold text-purple-600 mb-2">
                                    {Math.round((stats.sentEmails / stats.totalEmails) * 100)}%
                                </div>
                                <p className="text-sm text-gray-600">Response Rate</p>
                                <p className="text-xs text-green-600 mt-1">↑ 8% increase</p>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl font-bold text-pink-600 mb-2">{stats.emailsThisWeek}</div>
                                <p className="text-sm text-gray-600">Emails This Week</p>
                                <p className="text-xs text-blue-600 mt-1">→ Steady pace</p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </motion.div>
        </motion.div>
    )
}

