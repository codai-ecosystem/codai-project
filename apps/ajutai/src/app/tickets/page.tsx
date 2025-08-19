'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
    // Ticket Management Icons
    Plus,
    Search,
    Filter,
    SortAsc,
    SortDesc,

    // Status Icons
    AlertCircle,
    Clock,
    CheckCircle2,
    XCircle,
    Pause,

    // Priority Icons
    ArrowUp,
    ArrowDown,
    Minus,
    Zap,

    // User Icons
    MessageSquare,

    // Action Icons
    Eye,
    MoreVertical,

    // Navigation Icons
    ChevronLeft,
    ChevronRight,
    RefreshCw
} from 'lucide-react'

interface SupportTicket {
    id: string
    title: string
    description: string
    status: 'open' | 'in_progress' | 'pending' | 'resolved' | 'closed'
    priority: 'low' | 'medium' | 'high' | 'urgent'
    category: string
    customerName: string
    customerEmail: string
    assignedAgent?: string
    createdAt: Date
    updatedAt: Date
    responseTime?: number
    tags: string[]
    messages: number
}

export default function TicketsPage() {
    const [tickets] = useState<SupportTicket[]>([
        {
            id: 'TKT-001',
            title: 'Unable to access my account',
            description: 'I cannot log into my account. Keep getting password errors.',
            status: 'open',
            priority: 'high',
            category: 'Account Access',
            customerName: 'John Smith',
            customerEmail: 'john.smith@example.com',
            assignedAgent: 'Sarah Johnson',
            createdAt: new Date('2024-01-15T10:30:00Z'),
            updatedAt: new Date('2024-01-15T11:15:00Z'),
            responseTime: 45,
            tags: ['account', 'password', 'urgent'],
            messages: 3
        },
        {
            id: 'TKT-002',
            title: 'Payment processing issue',
            description: 'Transaction failed but money was deducted from my account.',
            status: 'in_progress',
            priority: 'urgent',
            category: 'Billing',
            customerName: 'Emma Wilson',
            customerEmail: 'emma.wilson@example.com',
            assignedAgent: 'Mike Chen',
            createdAt: new Date('2024-01-15T09:45:00Z'),
            updatedAt: new Date('2024-01-15T10:30:00Z'),
            responseTime: 32,
            tags: ['payment', 'billing', 'refund'],
            messages: 5
        },
        {
            id: 'TKT-003',
            title: 'Feature request: Dark mode',
            description: 'Would love to have a dark mode option for the interface.',
            status: 'pending',
            priority: 'low',
            category: 'Feature Request',
            customerName: 'Alex Rodriguez',
            customerEmail: 'alex.rodriguez@example.com',
            createdAt: new Date('2024-01-14T16:20:00Z'),
            updatedAt: new Date('2024-01-15T08:00:00Z'),
            responseTime: 18,
            tags: ['feature', 'ui', 'enhancement'],
            messages: 2
        },
        {
            id: 'TKT-004',
            title: 'Data export not working',
            description: 'The CSV export feature is returning empty files.',
            status: 'resolved',
            priority: 'medium',
            category: 'Technical Issue',
            customerName: 'Lisa Thompson',
            customerEmail: 'lisa.thompson@example.com',
            assignedAgent: 'David Park',
            createdAt: new Date('2024-01-14T14:10:00Z'),
            updatedAt: new Date('2024-01-15T09:20:00Z'),
            responseTime: 28,
            tags: ['export', 'data', 'csv'],
            messages: 4
        }
    ])

    const [searchTerm, setSearchTerm] = useState('')
    const [statusFilter, setStatusFilter] = useState('all')
    const [priorityFilter, setPriorityFilter] = useState('all')
    const [sortField, setSortField] = useState<keyof SupportTicket>('updatedAt')
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')

    // Status configuration
    const statusConfig = {
        open: { label: 'Open', color: 'blue', icon: AlertCircle },
        in_progress: { label: 'In Progress', color: 'yellow', icon: Clock },
        pending: { label: 'Pending', color: 'orange', icon: Pause },
        resolved: { label: 'Resolved', color: 'green', icon: CheckCircle2 },
        closed: { label: 'Closed', color: 'gray', icon: XCircle }
    }

    // Priority configuration
    const priorityConfig = {
        low: { label: 'Low', color: 'green', icon: ArrowDown },
        medium: { label: 'Medium', color: 'yellow', icon: Minus },
        high: { label: 'High', color: 'orange', icon: ArrowUp },
        urgent: { label: 'Urgent', color: 'red', icon: Zap }
    }

    // Filter tickets
    const filteredTickets = tickets.filter(ticket => {
        const matchesSearch = ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            ticket.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            ticket.customerName.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter
        const matchesPriority = priorityFilter === 'all' || ticket.priority === priorityFilter

        return matchesSearch && matchesStatus && matchesPriority
    })

    // Sort tickets
    const sortedTickets = [...filteredTickets].sort((a, b) => {
        const aValue = a[sortField]
        const bValue = b[sortField]

        // Handle undefined values
        if (aValue === undefined && bValue === undefined) return 0
        if (aValue === undefined) return 1
        if (bValue === undefined) return -1

        if (sortDirection === 'asc') {
            return aValue < bValue ? -1 : aValue > bValue ? 1 : 0
        } else {
            return aValue > bValue ? -1 : aValue < bValue ? 1 : 0
        }
    })

    // Handle sort
    const handleSort = (field: keyof SupportTicket) => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
        } else {
            setSortField(field)
            setSortDirection('desc')
        }
    }

    return (
        <div className="p-6 space-y-6">
            {/* Page Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between"
            >
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Support Tickets</h1>
                    <p className="text-gray-600 mt-1">Manage and track customer support requests</p>
                </div>
                <div className="flex space-x-3">
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                        <RefreshCw className="h-4 w-4" />
                        <span>Refresh</span>
                    </motion.button>
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <Plus className="h-4 w-4" />
                        <span>New Ticket</span>
                    </motion.button>
                </div>
            </motion.div>

            {/* Filters and Search */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl p-6 shadow-lg border border-gray-100"
            >
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4">
                    {/* Search */}
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <input
                            type="text"
                            placeholder="Search tickets..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2 w-full border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>

                    {/* Filters */}
                    <div className="flex flex-wrap gap-3">
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="all">All Statuses</option>
                            {Object.entries(statusConfig).map(([key, config]) => (
                                <option key={key} value={key}>{config.label}</option>
                            ))}
                        </select>

                        <select
                            value={priorityFilter}
                            onChange={(e) => setPriorityFilter(e.target.value)}
                            className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="all">All Priorities</option>
                            {Object.entries(priorityConfig).map(([key, config]) => (
                                <option key={key} value={key}>{config.label}</option>
                            ))}
                        </select>

                        <button className="flex items-center space-x-2 px-3 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                            <Filter className="h-4 w-4" />
                            <span>More Filters</span>
                        </button>
                    </div>
                </div>
            </motion.div>

            {/* Tickets Table */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden"
            >
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4 text-left">
                                    <input type="checkbox" className="rounded border-gray-300" />
                                </th>
                                <th className="px-6 py-4 text-left">
                                    <button
                                        onClick={() => handleSort('id')}
                                        className="flex items-center space-x-1 text-sm font-medium text-gray-900 hover:text-blue-600"
                                    >
                                        <span>ID</span>
                                        {sortField === 'id' && (
                                            sortDirection === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />
                                        )}
                                    </button>
                                </th>
                                <th className="px-6 py-4 text-left">
                                    <button
                                        onClick={() => handleSort('title')}
                                        className="flex items-center space-x-1 text-sm font-medium text-gray-900 hover:text-blue-600"
                                    >
                                        <span>Subject</span>
                                        {sortField === 'title' && (
                                            sortDirection === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />
                                        )}
                                    </button>
                                </th>
                                <th className="px-6 py-4 text-left">
                                    <button
                                        onClick={() => handleSort('customerName')}
                                        className="flex items-center space-x-1 text-sm font-medium text-gray-900 hover:text-blue-600"
                                    >
                                        <span>Customer</span>
                                        {sortField === 'customerName' && (
                                            sortDirection === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />
                                        )}
                                    </button>
                                </th>
                                <th className="px-6 py-4 text-left">
                                    <button
                                        onClick={() => handleSort('status')}
                                        className="flex items-center space-x-1 text-sm font-medium text-gray-900 hover:text-blue-600"
                                    >
                                        <span>Status</span>
                                        {sortField === 'status' && (
                                            sortDirection === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />
                                        )}
                                    </button>
                                </th>
                                <th className="px-6 py-4 text-left">
                                    <button
                                        onClick={() => handleSort('priority')}
                                        className="flex items-center space-x-1 text-sm font-medium text-gray-900 hover:text-blue-600"
                                    >
                                        <span>Priority</span>
                                        {sortField === 'priority' && (
                                            sortDirection === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />
                                        )}
                                    </button>
                                </th>
                                <th className="px-6 py-4 text-left">
                                    <button
                                        onClick={() => handleSort('updatedAt')}
                                        className="flex items-center space-x-1 text-sm font-medium text-gray-900 hover:text-blue-600"
                                    >
                                        <span>Last Updated</span>
                                        {sortField === 'updatedAt' && (
                                            sortDirection === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />
                                        )}
                                    </button>
                                </th>
                                <th className="px-6 py-4 text-left">
                                    <span className="text-sm font-medium text-gray-900">Actions</span>
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {sortedTickets.map((ticket) => {
                                const statusInfo = statusConfig[ticket.status]
                                const priorityInfo = priorityConfig[ticket.priority]
                                const StatusIcon = statusInfo.icon
                                const PriorityIcon = priorityInfo.icon

                                return (
                                    <tr key={ticket.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <input type="checkbox" className="rounded border-gray-300" />
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm font-medium text-blue-600">{ticket.id}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div>
                                                <div className="text-sm font-medium text-gray-900">{ticket.title}</div>
                                                <div className="text-sm text-gray-500 truncate max-w-xs">{ticket.description}</div>
                                                <div className="flex space-x-1 mt-1">
                                                    {ticket.tags.map((tag) => (
                                                        <span key={tag} className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                                                            {tag}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div>
                                                <div className="text-sm font-medium text-gray-900">{ticket.customerName}</div>
                                                <div className="text-sm text-gray-500">{ticket.customerEmail}</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium bg-${statusInfo.color}-100 text-${statusInfo.color}-800`}>
                                                <StatusIcon className="h-3 w-3" />
                                                <span>{statusInfo.label}</span>
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium bg-${priorityInfo.color}-100 text-${priorityInfo.color}-800`}>
                                                <PriorityIcon className="h-3 w-3" />
                                                <span>{priorityInfo.label}</span>
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-900">
                                                {ticket.updatedAt.toLocaleDateString()}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                {ticket.updatedAt.toLocaleTimeString()}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex space-x-2">
                                                <motion.button
                                                    whileHover={{ scale: 1.1 }}
                                                    whileTap={{ scale: 0.9 }}
                                                    className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </motion.button>
                                                <motion.button
                                                    whileHover={{ scale: 1.1 }}
                                                    whileTap={{ scale: 0.9 }}
                                                    className="p-1 text-gray-400 hover:text-green-600 transition-colors"
                                                >
                                                    <MessageSquare className="h-4 w-4" />
                                                </motion.button>
                                                <motion.button
                                                    whileHover={{ scale: 1.1 }}
                                                    whileTap={{ scale: 0.9 }}
                                                    className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                                                >
                                                    <MoreVertical className="h-4 w-4" />
                                                </motion.button>
                                            </div>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                    <div className="text-sm text-gray-700">
                        Showing <span className="font-medium">1</span> to <span className="font-medium">{sortedTickets.length}</span> of{' '}
                        <span className="font-medium">{tickets.length}</span> tickets
                    </div>
                    <div className="flex space-x-2">
                        <button className="px-3 py-2 border border-gray-200 rounded-lg text-sm hover:bg-gray-50 transition-colors flex items-center space-x-1">
                            <ChevronLeft className="h-4 w-4" />
                            <span>Previous</span>
                        </button>
                        <button className="px-3 py-2 border border-gray-200 rounded-lg text-sm hover:bg-gray-50 transition-colors flex items-center space-x-1">
                            <span>Next</span>
                            <ChevronRight className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    )
}
