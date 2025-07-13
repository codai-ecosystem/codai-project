'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
    Search,
    Filter,
    Download,
    MoreHorizontal,
    ChevronUp,
    ChevronDown,
    Smartphone,
    CheckCircle,
    AlertCircle,
    Clock,
    Users
} from 'lucide-react'
import type { ColorScheme } from '../types'

interface DataTableProps {
    colorScheme: ColorScheme
}

interface AppData {
    id: string
    name: string
    version: string
    status: 'active' | 'pending' | 'inactive'
    users: number
    lastUpdated: string
    platform: string
}

export function DataTable({ colorScheme }: DataTableProps) {
    const [sortField, setSortField] = useState<keyof AppData>('name')
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
    const [searchTerm, setSearchTerm] = useState('')
    const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'pending' | 'inactive'>('all')

    const [apps] = useState<AppData[]>([
        {
            id: '1',
            name: 'CodAI Mobile',
            version: '2.1.0',
            status: 'active',
            users: 15420,
            lastUpdated: '2024-01-15',
            platform: 'iOS/Android'
        },
        {
            id: '2',
            name: 'Enterprise Dashboard',
            version: '1.8.3',
            status: 'active',
            users: 8930,
            lastUpdated: '2024-01-14',
            platform: 'Web/Mobile'
        },
        {
            id: '3',
            name: 'Analytics Pro',
            version: '3.2.1',
            status: 'pending',
            users: 5670,
            lastUpdated: '2024-01-13',
            platform: 'iOS'
        },
        {
            id: '4',
            name: 'Security Suite',
            version: '1.5.7',
            status: 'active',
            users: 12340,
            lastUpdated: '2024-01-12',
            platform: 'Android'
        },
        {
            id: '5',
            name: 'Performance Monitor',
            version: '2.0.4',
            status: 'inactive',
            users: 3450,
            lastUpdated: '2024-01-10',
            platform: 'Web'
        }
    ])

    const handleSort = (field: keyof AppData) => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
        } else {
            setSortField(field)
            setSortDirection('asc')
        }
    }

    const filteredAndSortedApps = apps
        .filter(app => {
            const matchesSearch = app.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                app.platform.toLowerCase().includes(searchTerm.toLowerCase())
            const matchesFilter = filterStatus === 'all' || app.status === filterStatus
            return matchesSearch && matchesFilter
        })
        .sort((a, b) => {
            const aValue = a[sortField]
            const bValue = b[sortField]

            if (typeof aValue === 'string' && typeof bValue === 'string') {
                return sortDirection === 'asc'
                    ? aValue.localeCompare(bValue)
                    : bValue.localeCompare(aValue)
            }

            if (typeof aValue === 'number' && typeof bValue === 'number') {
                return sortDirection === 'asc' ? aValue - bValue : bValue - aValue
            }

            return 0
        })

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'active':
                return <CheckCircle className="w-4 h-4 text-emerald-400" />
            case 'pending':
                return <Clock className="w-4 h-4 text-yellow-400" />
            case 'inactive':
                return <AlertCircle className="w-4 h-4 text-red-400" />
            default:
                return null
        }
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active':
                return 'bg-emerald-500/20 text-emerald-400'
            case 'pending':
                return 'bg-yellow-500/20 text-yellow-400'
            case 'inactive':
                return 'bg-red-500/20 text-red-400'
            default:
                return 'bg-slate-500/20 text-slate-400'
        }
    }

    return (
        <motion.div
            className="glassmorphism rounded-xl p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
        >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-blue-400 mb-2">
                        Application Management
                    </h2>
                    <p className="text-slate-400">
                        Manage and monitor your mobile applications
                    </p>
                </div>
                <motion.button
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                    <Download className="w-4 h-4" />
                    <span>Export</span>
                </motion.button>
            </div>

            {/* Filters */}
            <div className="flex items-center space-x-4 mb-6">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search applications..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-400 transition-colors"
                    />
                </div>
                <div className="relative">
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value as typeof filterStatus)}
                        className="appearance-none px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-400 transition-colors"
                    >
                        <option value="all">All Status</option>
                        <option value="active">Active</option>
                        <option value="pending">Pending</option>
                        <option value="inactive">Inactive</option>
                    </select>
                    <Filter className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-white/10">
                            {[
                                { key: 'name', label: 'Application' },
                                { key: 'version', label: 'Version' },
                                { key: 'status', label: 'Status' },
                                { key: 'users', label: 'Users' },
                                { key: 'platform', label: 'Platform' },
                                { key: 'lastUpdated', label: 'Last Updated' }
                            ].map((column) => (
                                <th
                                    key={column.key}
                                    className="text-left py-3 px-4 text-slate-300 font-medium cursor-pointer hover:text-blue-400 transition-colors"
                                    onClick={() => handleSort(column.key as keyof AppData)}
                                >
                                    <div className="flex items-center space-x-2">
                                        <span>{column.label}</span>
                                        {sortField === column.key && (
                                            sortDirection === 'asc'
                                                ? <ChevronUp className="w-4 h-4" />
                                                : <ChevronDown className="w-4 h-4" />
                                        )}
                                    </div>
                                </th>
                            ))}
                            <th className="w-10"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredAndSortedApps.map((app, index) => (
                            <motion.tr
                                key={app.id}
                                className="border-b border-white/5 hover:bg-white/5 transition-colors"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                            >
                                <td className="py-4 px-4">
                                    <div className="flex items-center space-x-3">
                                        <div className="p-2 rounded-lg bg-blue-500/20">
                                            <Smartphone className="w-4 h-4 text-blue-400" />
                                        </div>
                                        <div>
                                            <div className="font-medium text-white">{app.name}</div>
                                            <div className="text-sm text-slate-400">ID: {app.id}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="py-4 px-4 text-slate-300">{app.version}</td>
                                <td className="py-4 px-4">
                                    <div className="flex items-center space-x-2">
                                        {getStatusIcon(app.status)}
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(app.status)}`}>
                                            {app.status}
                                        </span>
                                    </div>
                                </td>
                                <td className="py-4 px-4">
                                    <div className="flex items-center space-x-2">
                                        <Users className="w-4 h-4 text-slate-400" />
                                        <span className="text-slate-300">{app.users.toLocaleString()}</span>
                                    </div>
                                </td>
                                <td className="py-4 px-4 text-slate-300">{app.platform}</td>
                                <td className="py-4 px-4 text-slate-300">{app.lastUpdated}</td>
                                <td className="py-4 px-4">
                                    <motion.button
                                        className="p-1 rounded hover:bg-white/10 transition-colors"
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                    >
                                        <MoreHorizontal className="w-4 h-4 text-slate-400" />
                                    </motion.button>
                                </td>
                            </motion.tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between mt-6 pt-6 border-t border-white/10">
                <div className="text-sm text-slate-400">
                    Showing {filteredAndSortedApps.length} of {apps.length} applications
                </div>
                <div className="flex items-center space-x-2">
                    <motion.button
                        className="px-3 py-1 rounded bg-white/10 text-slate-300 hover:bg-white/20 transition-colors"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        Previous
                    </motion.button>
                    <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded">1</span>
                    <motion.button
                        className="px-3 py-1 rounded bg-white/10 text-slate-300 hover:bg-white/20 transition-colors"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        Next
                    </motion.button>
                </div>
            </div>
        </motion.div>
    )
}
