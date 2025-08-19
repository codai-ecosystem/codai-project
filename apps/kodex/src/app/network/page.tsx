'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
    ArrowLeft,
    Network,
    Server,
    Globe,
    Activity,
    Users,
    Zap,
    Shield,
    CheckCircle,
    AlertTriangle,
    Clock,
    TrendingUp,
    TrendingDown,
    Wifi,
    Database,
    Cpu,
    HardDrive,
    Signal,
    MapPin,
    Eye
} from 'lucide-react'

interface NetworkNode {
    id: string
    name: string
    location: string
    status: 'online' | 'offline' | 'warning'
    uptime: string
    latency: number
    validators: number
    stake: string
    version: string
}

interface NetworkMetric {
    name: string
    value: string
    change: string
    trend: 'up' | 'down' | 'stable'
    status: 'healthy' | 'warning' | 'critical'
}

interface ConsensusInfo {
    currentEpoch: number
    epochProgress: number
    validatorCount: number
    totalStake: string
    finalizationRate: string
    missedBlocks: number
}

export default function NetworkPage() {
    const [selectedNode, setSelectedNode] = useState<string | null>(null)
    const [timeRange, setTimeRange] = useState('24h')

    const networkMetrics: NetworkMetric[] = [
        { name: 'Network Uptime', value: '99.98%', change: '+0.02%', trend: 'up', status: 'healthy' },
        { name: 'Average Latency', value: '45ms', change: '-5ms', trend: 'up', status: 'healthy' },
        { name: 'Active Validators', value: '9,412', change: '+127', trend: 'up', status: 'healthy' },
        { name: 'Consensus Rate', value: '99.94%', change: '+0.01%', trend: 'up', status: 'healthy' },
        { name: 'Network Hash Rate', value: '2.4 EH/s', change: '+12%', trend: 'up', status: 'healthy' },
        { name: 'Block Production', value: '6.2s avg', change: '-0.3s', trend: 'up', status: 'healthy' }
    ]

    const topNodes: NetworkNode[] = [
        {
            id: 'node-001',
            name: 'Genesis Validator',
            location: 'New York, US',
            status: 'online',
            uptime: '99.99%',
            latency: 12,
            validators: 15,
            stake: '2.4M KODEX',
            version: 'v2.1.0'
        },
        {
            id: 'node-002',
            name: 'Europa Node',
            location: 'Frankfurt, DE',
            status: 'online',
            uptime: '99.95%',
            latency: 8,
            validators: 23,
            stake: '3.1M KODEX',
            version: 'v2.1.0'
        },
        {
            id: 'node-003',
            name: 'Asia Pacific Hub',
            location: 'Tokyo, JP',
            status: 'online',
            uptime: '99.97%',
            latency: 15,
            validators: 18,
            stake: '2.8M KODEX',
            version: 'v2.1.0'
        },
        {
            id: 'node-004',
            name: 'Southern Cross',
            location: 'Sydney, AU',
            status: 'warning',
            uptime: '98.23%',
            latency: 67,
            validators: 8,
            stake: '1.2M KODEX',
            version: 'v2.0.8'
        },
        {
            id: 'node-005',
            name: 'Nordic Validator',
            location: 'Stockholm, SE',
            status: 'online',
            uptime: '99.92%',
            latency: 22,
            validators: 12,
            stake: '1.9M KODEX',
            version: 'v2.1.0'
        }
    ]

    const consensusInfo: ConsensusInfo = {
        currentEpoch: 142857,
        epochProgress: 73,
        validatorCount: 9412,
        totalStake: '89.7M KODEX',
        finalizationRate: '99.94%',
        missedBlocks: 12
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'online': case 'healthy': return 'text-green-600 bg-green-100'
            case 'warning': return 'text-yellow-600 bg-yellow-100'
            case 'offline': case 'critical': return 'text-red-600 bg-red-100'
            default: return 'text-gray-600 bg-gray-100'
        }
    }

    const getMetricStatusColor = (status: string) => {
        switch (status) {
            case 'healthy': return 'border-green-200 bg-green-50'
            case 'warning': return 'border-yellow-200 bg-yellow-50'
            case 'critical': return 'border-red-200 bg-red-50'
            default: return 'border-gray-200 bg-gray-50'
        }
    }

    const getTrendIcon = (trend: string) => {
        switch (trend) {
            case 'up': return <TrendingUp className="w-4 h-4 text-green-500" />
            case 'down': return <TrendingDown className="w-4 h-4 text-red-500" />
            default: return <Activity className="w-4 h-4 text-gray-500" />
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-indigo-50">
            {/* Header */}
            <motion.header
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 text-white py-4 px-6 shadow-xl"
            >
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <button className="p-2 bg-white/20 rounded-lg backdrop-blur-sm hover:bg-white/30 transition-colors">
                                <ArrowLeft className="w-5 h-5" />
                            </button>
                            <div className="flex items-center space-x-3">
                                <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                                    <Network className="w-6 h-6" />
                                </div>
                                <div>
                                    <h1 className="text-2xl font-bold">Network Monitor</h1>
                                    <p className="text-indigo-100">Real-time network health and performance</p>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center space-x-3">
                            <div className="px-3 py-1 bg-green-500/20 rounded-lg flex items-center space-x-2">
                                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                                <span className="text-sm">Network Healthy</span>
                            </div>
                            <select
                                value={timeRange}
                                onChange={(e) => setTimeRange(e.target.value)}
                                className="bg-white/20 border border-white/30 rounded-lg px-3 py-1 text-sm backdrop-blur-sm"
                            >
                                <option value="1h">Last Hour</option>
                                <option value="24h">Last 24 Hours</option>
                                <option value="7d">Last 7 Days</option>
                                <option value="30d">Last 30 Days</option>
                            </select>
                        </div>
                    </div>
                </div>
            </motion.header>

            <div className="max-w-7xl mx-auto px-6 py-8">
                {/* Network Metrics Grid */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8"
                >
                    {networkMetrics.map((metric, index) => (
                        <motion.div
                            key={metric.name}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 + index * 0.1 }}
                            className={`bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border-2 ${getMetricStatusColor(metric.status)}`}
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center space-x-2">
                                    <h3 className="font-semibold text-gray-900">{metric.name}</h3>
                                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(metric.status)}`}>
                                        {metric.status}
                                    </div>
                                </div>
                                {getTrendIcon(metric.trend)}
                            </div>
                            <div className="flex items-end justify-between">
                                <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
                                <div className={`flex items-center space-x-1 text-sm ${metric.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                                    <span>{metric.change}</span>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>

                {/* Consensus Information */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg mb-8"
                >
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-gray-900">Consensus Status</h2>
                        <div className="flex items-center space-x-2">
                            <CheckCircle className="w-5 h-5 text-green-500" />
                            <span className="text-green-600 font-medium">Active</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm text-gray-600">Current Epoch</span>
                                <Clock className="w-4 h-4 text-blue-500" />
                            </div>
                            <p className="text-2xl font-bold text-gray-900">#{consensusInfo.currentEpoch.toLocaleString()}</p>
                            <div className="mt-3">
                                <div className="flex justify-between text-sm text-gray-600 mb-1">
                                    <span>Progress</span>
                                    <span>{consensusInfo.epochProgress}%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                        className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-1000"
                                        style={{ width: `${consensusInfo.epochProgress}%` }}
                                    ></div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm text-gray-600">Active Validators</span>
                                <Users className="w-4 h-4 text-green-500" />
                            </div>
                            <p className="text-2xl font-bold text-gray-900">{consensusInfo.validatorCount.toLocaleString()}</p>
                            <p className="text-sm text-gray-600 mt-1">{consensusInfo.totalStake} total stake</p>
                        </div>

                        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm text-gray-600">Finalization Rate</span>
                                <Shield className="w-4 h-4 text-purple-500" />
                            </div>
                            <p className="text-2xl font-bold text-gray-900">{consensusInfo.finalizationRate}</p>
                            <p className="text-sm text-gray-600 mt-1">{consensusInfo.missedBlocks} missed blocks</p>
                        </div>
                    </div>
                </motion.div>

                {/* Top Network Nodes */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg"
                >
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-gray-900">Network Nodes</h2>
                        <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-600">{topNodes.length} nodes shown</span>
                            <button className="text-indigo-600 hover:text-indigo-700 text-sm font-medium">
                                View All
                            </button>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-200">
                                    <th className="text-left py-3 px-2 text-sm font-medium text-gray-600">Node</th>
                                    <th className="text-left py-3 px-2 text-sm font-medium text-gray-600">Status</th>
                                    <th className="text-left py-3 px-2 text-sm font-medium text-gray-600">Location</th>
                                    <th className="text-left py-3 px-2 text-sm font-medium text-gray-600">Uptime</th>
                                    <th className="text-left py-3 px-2 text-sm font-medium text-gray-600">Latency</th>
                                    <th className="text-left py-3 px-2 text-sm font-medium text-gray-600">Validators</th>
                                    <th className="text-left py-3 px-2 text-sm font-medium text-gray-600">Stake</th>
                                    <th className="text-left py-3 px-2 text-sm font-medium text-gray-600">Version</th>
                                    <th className="text-left py-3 px-2 text-sm font-medium text-gray-600">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {topNodes.map((node, index) => (
                                    <motion.tr
                                        key={node.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.5 + index * 0.1 }}
                                        className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                                    >
                                        <td className="py-4 px-2">
                                            <div className="flex items-center space-x-3">
                                                <div className="p-2 bg-indigo-100 rounded-lg">
                                                    <Server className="w-4 h-4 text-indigo-600" />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-900">{node.name}</p>
                                                    <p className="text-xs text-gray-500">{node.id}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4 px-2">
                                            <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(node.status)}`}>
                                                <div className={`w-2 h-2 rounded-full ${node.status === 'online' ? 'bg-green-500' : node.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'}`}></div>
                                                <span>{node.status}</span>
                                            </div>
                                        </td>
                                        <td className="py-4 px-2">
                                            <div className="flex items-center space-x-2">
                                                <MapPin className="w-4 h-4 text-gray-400" />
                                                <span className="text-sm text-gray-900">{node.location}</span>
                                            </div>
                                        </td>
                                        <td className="py-4 px-2">
                                            <span className="text-sm font-medium text-gray-900">{node.uptime}</span>
                                        </td>
                                        <td className="py-4 px-2">
                                            <div className="flex items-center space-x-1">
                                                <Signal className="w-4 h-4 text-gray-400" />
                                                <span className={`text-sm font-medium ${node.latency < 20 ? 'text-green-600' : node.latency < 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                                                    {node.latency}ms
                                                </span>
                                            </div>
                                        </td>
                                        <td className="py-4 px-2">
                                            <span className="text-sm font-medium text-gray-900">{node.validators}</span>
                                        </td>
                                        <td className="py-4 px-2">
                                            <span className="text-sm font-medium text-gray-900">{node.stake}</span>
                                        </td>
                                        <td className="py-4 px-2">
                                            <span className={`text-xs px-2 py-1 rounded-full ${node.version === 'v2.1.0' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                                {node.version}
                                            </span>
                                        </td>
                                        <td className="py-4 px-2">
                                            <button
                                                onClick={() => setSelectedNode(node.id)}
                                                className="text-indigo-600 hover:text-indigo-700 text-sm font-medium"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </motion.div>

                {/* Network Performance Chart Placeholder */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="mt-8 bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg"
                >
                    <h2 className="text-xl font-bold text-gray-900 mb-6">Network Performance ({timeRange})</h2>
                    <div className="h-64 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg flex items-center justify-center">
                        <div className="text-center">
                            <Activity className="w-12 h-12 text-indigo-400 mx-auto mb-2" />
                            <p className="text-gray-600">Network performance chart</p>
                            <p className="text-sm text-gray-500">Real-time monitoring data would appear here</p>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    )
}
