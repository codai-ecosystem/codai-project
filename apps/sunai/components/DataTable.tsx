'use client'

import React from 'react'

import { motion } from 'framer-motion'
import { ChevronRight, Calendar, MapPin, Activity } from 'lucide-react'
import { useState } from 'react'

interface DataTableProps {
    colorScheme: {
        primary: string
        secondary: string
        accent: string
    }
}

interface TableRow {
    id: string
    name: string
    location: string
    efficiency: number
    status: 'online' | 'offline' | 'maintenance'
    lastUpdate: string
    output: number
}

export function DataTable({ colorScheme }: DataTableProps) {
    const [sortBy, setSortBy] = useState<keyof TableRow>('efficiency')
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

    const data: TableRow[] = [
        {
            id: '1',
            name: 'Solar Farm Alpha',
            location: 'California, USA',
            efficiency: 92.5,
            status: 'online',
            lastUpdate: '2 minutes ago',
            output: 2340
        },
        {
            id: '2',
            name: 'Solar Farm Beta',
            location: 'Nevada, USA',
            efficiency: 88.3,
            status: 'online',
            lastUpdate: '5 minutes ago',
            output: 1890
        },
        {
            id: '3',
            name: 'Solar Farm Gamma',
            location: 'Arizona, USA',
            efficiency: 95.1,
            status: 'maintenance',
            lastUpdate: '1 hour ago',
            output: 0
        },
        {
            id: '4',
            name: 'Solar Farm Delta',
            location: 'Texas, USA',
            efficiency: 89.7,
            status: 'online',
            lastUpdate: '3 minutes ago',
            output: 2100
        },
        {
            id: '5',
            name: 'Solar Farm Epsilon',
            location: 'Florida, USA',
            efficiency: 91.2,
            status: 'offline',
            lastUpdate: '30 minutes ago',
            output: 0
        }
    ]

    const sortedData = [...data].sort((a, b) => {
        const aValue = a[sortBy]
        const bValue = b[sortBy]

        if (typeof aValue === 'number' && typeof bValue === 'number') {
            return sortOrder === 'asc' ? aValue - bValue : bValue - aValue
        }

        return sortOrder === 'asc'
            ? String(aValue).localeCompare(String(bValue))
            : String(bValue).localeCompare(String(aValue))
    })

    const handleSort = (column: keyof TableRow) => {
        if (sortBy === column) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
        } else {
            setSortBy(column)
            setSortOrder('desc')
        }
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'online': return 'text-emerald-400 bg-emerald-500/20'
            case 'offline': return 'text-red-400 bg-red-500/20'
            case 'maintenance': return 'text-yellow-400 bg-yellow-500/20'
            default: return 'text-slate-400 bg-slate-500/20'
        }
    }

    return (
        <motion.div
            className="glassmorphism rounded-xl p-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
        >
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-yellow-400">
                    Solar Farm Management
                </h2>
                <div className="flex items-center space-x-2">
                    <Calendar className="w-5 h-5 text-slate-400" />
                    <span className="text-slate-400">{new Date().toLocaleDateString()}</span>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-white/10">
                            {[
                                { key: 'name', label: 'Farm Name' },
                                { key: 'location', label: 'Location' },
                                { key: 'efficiency', label: 'Efficiency' },
                                { key: 'status', label: 'Status' },
                                { key: 'output', label: 'Output (kW)' },
                                { key: 'lastUpdate', label: 'Last Update' }
                            ].map((column) => (
                                <th
                                    key={column.key}
                                    className="text-left py-4 px-6 cursor-pointer hover:bg-white/5 transition-colors"
                                    onClick={() => handleSort(column.key as keyof TableRow)}
                                >
                                    <div className="flex items-center space-x-2">
                                        <span className="text-slate-300 font-medium">{column.label}</span>
                                        {sortBy === column.key && (
                                            <ChevronRight
                                                className={`w-4 h-4 text-yellow-400 transition-transform ${sortOrder === 'desc' ? 'rotate-90' : '-rotate-90'
                                                    }`}
                                            />
                                        )}
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {sortedData.map((row, index) => (
                            <motion.tr
                                key={row.id}
                                className="border-b border-white/5 hover:bg-white/5 transition-colors"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <td className="py-4 px-6">
                                    <div className="font-medium text-white">{row.name}</div>
                                </td>
                                <td className="py-4 px-6">
                                    <div className="flex items-center space-x-2">
                                        <MapPin className="w-4 h-4 text-slate-400" />
                                        <span className="text-slate-300">{row.location}</span>
                                    </div>
                                </td>
                                <td className="py-4 px-6">
                                    <div className="flex items-center space-x-2">
                                        <div className="text-white font-medium">{row.efficiency}%</div>
                                        <div className="w-16 bg-white/10 rounded-full h-2">
                                            <div
                                                className="bg-gradient-to-r from-yellow-500 to-orange-500 h-2 rounded-full"
                                                style={{ width: `${row.efficiency}%` }}
                                            />
                                        </div>
                                    </div>
                                </td>
                                <td className="py-4 px-6">
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(row.status)}`}>
                                        {row.status}
                                    </span>
                                </td>
                                <td className="py-4 px-6">
                                    <div className="flex items-center space-x-2">
                                        <Activity className="w-4 h-4 text-yellow-400" />
                                        <span className="text-white font-medium">{row.output.toLocaleString()}</span>
                                    </div>
                                </td>
                                <td className="py-4 px-6">
                                    <span className="text-slate-400">{row.lastUpdate}</span>
                                </td>
                            </motion.tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </motion.div>
    )
}

