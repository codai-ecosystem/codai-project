'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
    // Core Manufacturing Icons
    Factory,
    Activity,
    BarChart3,
    TrendingUp,
    TrendingDown,

    // Operations Icons
    Settings,
    Shield,
    AlertTriangle,
    CheckCircle2,

    // Metrics Icons
    Gauge,
    Truck,
    Wrench,

    // Navigation Icons
    Home,
    ArrowRight,
    RefreshCw,

    // Status Icons
    Circle,

    // Analytics Icons
    PieChart,

    // Safety Icons
    HardHat
} from 'lucide-react'

// Enhanced Manufacturing Dashboard State Management
interface ProductionMetrics {
    overallEfficiency: number
    productionRate: number
    qualityScore: number
    downtimePercentage: number
    energyUsage: number
    wasteReduction: number
    safetyScore: number
    maintenanceAlerts: number
}

interface ProductionLine {
    id: string
    name: string
    status: 'running' | 'stopped' | 'maintenance' | 'error'
    efficiency: number
    output: number
    target: number
    temperature: number
    pressure: number
    speed: number
    qualityRate: number
    lastMaintenance: string
    nextMaintenance: string
    alerts: number
}

interface QualityAlert {
    id: string
    line: string
    type: 'defect' | 'contamination' | 'dimension' | 'weight'
    severity: 'low' | 'medium' | 'high' | 'critical'
    description: string
    timestamp: string
    resolved: boolean
}

interface MaintenanceTask {
    id: string
    equipment: string
    type: 'scheduled' | 'predictive' | 'emergency'
    priority: 'low' | 'medium' | 'high' | 'critical'
    description: string
    estimatedTime: number
    assignedTo: string
    dueDate: string
    status: 'pending' | 'in-progress' | 'completed'
}

export default function FabricAIDashboard() {
    // Enhanced Dashboard State
    const [dashboardState, setDashboardState] = useState({
        activeView: 'overview',
        selectedTimeRange: '24h',
        autoRefresh: true,
        refreshInterval: 5000,
        alertsOpen: false,
        selectedLine: null as string | null,
        emergencyMode: false
    })

    // Production Metrics
    const [metrics, setMetrics] = useState<ProductionMetrics>({
        overallEfficiency: 94.7,
        productionRate: 1847.2,
        qualityScore: 96.8,
        downtimePercentage: 2.3,
        energyUsage: 847.5,
        wasteReduction: 18.4,
        safetyScore: 99.1,
        maintenanceAlerts: 3
    })

    // Production Lines Data
    const [productionLines] = useState<ProductionLine[]>([
        {
            id: 'line1',
            name: 'Assembly Line A',
            status: 'running',
            efficiency: 97.2,
            output: 2847,
            target: 3000,
            temperature: 24.5,
            pressure: 1.2,
            speed: 875,
            qualityRate: 98.1,
            lastMaintenance: '2025-08-05',
            nextMaintenance: '2025-08-12',
            alerts: 0
        },
        {
            id: 'line2',
            name: 'Fabrication Line B',
            status: 'running',
            efficiency: 89.4,
            output: 1923,
            target: 2200,
            temperature: 26.8,
            pressure: 1.4,
            speed: 762,
            qualityRate: 94.7,
            lastMaintenance: '2025-08-03',
            nextMaintenance: '2025-08-10',
            alerts: 1
        },
        {
            id: 'line3',
            name: 'Packaging Line C',
            status: 'maintenance',
            efficiency: 0,
            output: 0,
            target: 1800,
            temperature: 22.1,
            pressure: 0.9,
            speed: 0,
            qualityRate: 0,
            lastMaintenance: '2025-08-08',
            nextMaintenance: '2025-08-15',
            alerts: 2
        },
        {
            id: 'line4',
            name: 'Quality Control D',
            status: 'running',
            efficiency: 96.1,
            output: 3241,
            target: 3400,
            temperature: 23.7,
            pressure: 1.1,
            speed: 934,
            qualityRate: 99.3,
            lastMaintenance: '2025-08-06',
            nextMaintenance: '2025-08-13',
            alerts: 0
        }
    ])

    // Quality Alerts
    const [qualityAlerts] = useState<QualityAlert[]>([
        {
            id: 'alert1',
            line: 'Assembly Line A',
            type: 'dimension',
            severity: 'medium',
            description: 'Component diameter variance detected: +0.2mm tolerance',
            timestamp: '2025-08-08T10:45:00Z',
            resolved: false
        },
        {
            id: 'alert2',
            line: 'Fabrication Line B',
            type: 'defect',
            severity: 'high',
            description: 'Surface finish quality below threshold: 85% vs 90% target',
            timestamp: '2025-08-08T09:23:00Z',
            resolved: false
        }
    ])

    // Maintenance Tasks
    const [maintenanceTasks] = useState<MaintenanceTask[]>([
        {
            id: 'task1',
            equipment: 'Packaging Line C',
            type: 'scheduled',
            priority: 'high',
            description: 'Hydraulic system maintenance and filter replacement',
            estimatedTime: 4,
            assignedTo: 'Alexandru Ionescu',
            dueDate: '2025-08-08T14:00:00Z',
            status: 'in-progress'
        },
        {
            id: 'task2',
            equipment: 'Assembly Line A',
            type: 'predictive',
            priority: 'medium',
            description: 'Bearing replacement based on vibration analysis',
            estimatedTime: 2,
            assignedTo: 'Maria Popescu',
            dueDate: '2025-08-10T08:00:00Z',
            status: 'pending'
        },
        {
            id: 'task3',
            equipment: 'Fabrication Line B',
            type: 'emergency',
            priority: 'critical',
            description: 'Cooling system repair - temperature sensors malfunction',
            estimatedTime: 1,
            assignedTo: 'Andrei Munteanu',
            dueDate: '2025-08-08T12:00:00Z',
            status: 'pending'
        }
    ])

    // Real-time Updates Simulation
    useEffect(() => {
        if (dashboardState.autoRefresh) {
            const interval = setInterval(() => {
                setMetrics(prev => ({
                    ...prev,
                    overallEfficiency: Math.max(85, Math.min(99, prev.overallEfficiency + (Math.random() - 0.5) * 2)),
                    productionRate: Math.max(1500, Math.min(2000, prev.productionRate + (Math.random() - 0.5) * 50)),
                    qualityScore: Math.max(90, Math.min(100, prev.qualityScore + (Math.random() - 0.5) * 1)),
                    energyUsage: Math.max(700, Math.min(1000, prev.energyUsage + (Math.random() - 0.5) * 20))
                }))
            }, dashboardState.refreshInterval)

            return () => clearInterval(interval)
        }
    }, [dashboardState.autoRefresh, dashboardState.refreshInterval])

    // Navigation Views Configuration
    const navigationViews = [
        { id: 'overview', label: 'Overview', icon: Home, color: 'orange' },
        { id: 'production', label: 'Production', icon: Factory, color: 'red', badge: productionLines.filter(line => line.status === 'running').length },
        { id: 'quality', label: 'Quality Control', icon: Shield, color: 'yellow', badge: qualityAlerts.filter(alert => !alert.resolved).length },
        { id: 'maintenance', label: 'Maintenance', icon: Wrench, color: 'blue', badge: maintenanceTasks.filter(task => task.status === 'pending').length },
        { id: 'analytics', label: 'Analytics', icon: BarChart3, color: 'purple' },
        { id: 'safety', label: 'Safety', icon: HardHat, color: 'green' },
        { id: 'settings', label: 'Settings', icon: Settings, color: 'gray' }
    ]

    // Enhanced Summary Cards Data
    const summaryCards = [
        {
            title: 'Overall Efficiency',
            value: `${metrics.overallEfficiency.toFixed(1)}%`,
            change: '+2.3%',
            changeType: 'increase' as const,
            icon: Gauge,
            color: 'orange',
            target: '95%'
        },
        {
            title: 'Production Rate',
            value: `${metrics.productionRate.toFixed(0)} units/h`,
            change: '+5.7%',
            changeType: 'increase' as const,
            icon: Factory,
            color: 'red',
            target: '2000'
        },
        {
            title: 'Quality Score',
            value: `${metrics.qualityScore.toFixed(1)}%`,
            change: '+1.2%',
            changeType: 'increase' as const,
            icon: CheckCircle2,
            color: 'green',
            target: '98%'
        },
        {
            title: 'Downtime',
            value: `${metrics.downtimePercentage.toFixed(1)}%`,
            change: '-0.8%',
            changeType: 'decrease' as const,
            icon: AlertTriangle,
            color: 'yellow',
            target: '<2%'
        }
    ]

    // Quick Actions Configuration
    const quickActions = [
        {
            title: 'Production Control',
            description: 'Manage production lines',
            icon: Factory,
            color: 'orange',
            href: '/production-management'
        },
        {
            title: 'Quality Assurance',
            description: 'Monitor quality metrics',
            icon: Shield,
            color: 'green',
            href: '/quality-control'
        },
        {
            title: 'Supply Chain',
            description: 'Optimize supply chain',
            icon: Truck,
            color: 'blue',
            href: '/supply-chain'
        },
        {
            title: 'Predictive Maintenance',
            description: 'AI maintenance scheduling',
            icon: Wrench,
            color: 'purple',
            href: '/predictive-maintenance'
        },
        {
            title: 'Safety Monitoring',
            description: 'Track safety compliance',
            icon: HardHat,
            color: 'red',
            href: '/safety-compliance'
        },
        {
            title: 'Analytics & Reporting',
            description: 'Performance insights',
            icon: PieChart,
            color: 'yellow',
            href: '/analytics-reporting'
        }
    ]

    // Get status icon and color
    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'running': return { icon: Circle, color: 'text-green-500' }
            case 'stopped': return { icon: Circle, color: 'text-red-500' }
            case 'maintenance': return { icon: Circle, color: 'text-yellow-500' }
            case 'error': return { icon: Circle, color: 'text-red-600' }
            default: return { icon: Circle, color: 'text-gray-500' }
        }
    }

    // Format numbers
    const formatNumber = (num: number) => {
        return new Intl.NumberFormat('ro-RO').format(num)
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-yellow-50" data-testid="dashboard-container">
            {/* Enhanced Header */}
            <motion.div
                className="bg-white/80 backdrop-blur-sm border-b border-orange-200/50 sticky top-0 z-40"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                                <Factory className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                                    FabricAI Dashboard
                                </h1>
                                <p className="text-sm text-gray-600">Industrial AI Manufacturing Platform</p>
                            </div>
                        </div>

                        <div className="flex items-center space-x-4">
                            <div className="hidden sm:flex items-center space-x-6 text-sm">
                                <div className="flex items-center space-x-2">
                                    <Factory className="w-4 h-4 text-gray-500" />
                                    <span className="text-gray-600">{productionLines.filter(line => line.status === 'running').length}/{productionLines.length} Lines Active</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Activity className="w-4 h-4 text-gray-500" />
                                    <span className="text-gray-600">{metrics.overallEfficiency.toFixed(1)}% Efficiency</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Shield className="w-4 h-4 text-gray-500" />
                                    <span className="text-gray-600">{metrics.qualityScore.toFixed(1)}% Quality</span>
                                </div>
                            </div>

                            <div className="flex items-center space-x-2">
                                <div className={`w-3 h-3 rounded-full animate-pulse ${metrics.overallEfficiency > 90 ? 'bg-green-500' : metrics.overallEfficiency > 80 ? 'bg-yellow-500' : 'bg-red-500'}`}></div>
                                <span className="text-sm font-medium text-gray-700">
                                    {metrics.overallEfficiency > 90 ? 'Optimal' : metrics.overallEfficiency > 80 ? 'Good' : 'Attention'}
                                </span>
                            </div>

                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setDashboardState(prev => ({ ...prev, autoRefresh: !prev.autoRefresh }))}
                                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <RefreshCw className={`w-4 h-4 ${dashboardState.autoRefresh ? 'animate-spin' : ''}`} />
                            </motion.button>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Tabbed Navigation */}
            <div className="bg-white/50 backdrop-blur-sm border-b border-orange-200/30">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex space-x-8 overflow-x-auto">
                        {navigationViews.map((view) => {
                            const Icon = view.icon
                            return (
                                <button
                                    key={view.id}
                                    onClick={() => setDashboardState(prev => ({ ...prev, activeView: view.id }))}
                                    className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${dashboardState.activeView === view.id
                                        ? 'border-orange-500 text-orange-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        }`}
                                >
                                    <Icon className="w-4 h-4" />
                                    <span>{view.label}</span>
                                    {view.badge && (
                                        <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                                            {view.badge}
                                        </span>
                                    )}
                                </button>
                            )
                        })}
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {dashboardState.activeView === 'overview' && (
                    <motion.div
                        className="space-y-8"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                    >
                        {/* Key Metrics Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {summaryCards.map((card, index) => {
                                const IconComponent = card.icon
                                return (
                                    <motion.div
                                        key={index}
                                        className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-orange-200/50 shadow-sm"
                                        whileHover={{ scale: 1.02 }}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h3 className="text-orange-800 font-semibold text-sm">{card.title}</h3>
                                                <p className="text-3xl font-bold text-orange-900 mt-1">{card.value}</p>
                                                <div className="flex items-center mt-2">
                                                    {card.changeType === 'increase' ? (
                                                        <TrendingUp className="w-4 h-4 text-green-500" />
                                                    ) : (
                                                        <TrendingDown className="w-4 h-4 text-red-500" />
                                                    )}
                                                    <span className={`text-sm font-medium ml-1 ${card.changeType === 'increase' ? 'text-green-600' : 'text-red-600'}`}>
                                                        {card.change}
                                                    </span>
                                                    <span className="text-sm text-gray-500 ml-2">Target: {card.target}</span>
                                                </div>
                                            </div>
                                            <div className={`w-12 h-12 bg-gradient-to-br from-${card.color}-500 to-${card.color}-600 rounded-lg flex items-center justify-center`}>
                                                <IconComponent className="w-6 h-6 text-white" />
                                            </div>
                                        </div>
                                    </motion.div>
                                )
                            })}
                        </div>

                        {/* Production Lines Status */}
                        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-orange-200/50 shadow-sm">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Production Lines Status</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                {productionLines.map((line, index) => {
                                    const statusInfo = getStatusIcon(line.status)
                                    const StatusIcon = statusInfo.icon
                                    return (
                                        <motion.div
                                            key={line.id}
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: index * 0.1 }}
                                            className="bg-gradient-to-br from-orange-50 to-red-50 rounded-lg p-4 border border-orange-200"
                                        >
                                            <div className="flex items-center justify-between mb-3">
                                                <h4 className="font-medium text-gray-900">{line.name}</h4>
                                                <div className="flex items-center space-x-1">
                                                    <StatusIcon className={`w-3 h-3 ${statusInfo.color} animate-pulse`} />
                                                    <span className="text-xs text-gray-600 capitalize">{line.status}</span>
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-gray-600">Efficiency</span>
                                                    <span className="font-medium">{line.efficiency}%</span>
                                                </div>

                                                <div className="w-full bg-gray-200 rounded-full h-2">
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${line.efficiency}%` }}
                                                        transition={{ duration: 1, delay: index * 0.2 }}
                                                        className={`h-2 rounded-full ${line.efficiency > 90 ? 'bg-gradient-to-r from-green-400 to-green-600' :
                                                            line.efficiency > 70 ? 'bg-gradient-to-r from-yellow-400 to-yellow-600' :
                                                                'bg-gradient-to-r from-red-400 to-red-600'}`}
                                                    />
                                                </div>

                                                <div className="flex justify-between text-sm">
                                                    <span className="text-gray-600">Output</span>
                                                    <span className="font-medium">{formatNumber(line.output)}/{formatNumber(line.target)}</span>
                                                </div>

                                                {line.alerts > 0 && (
                                                    <div className="flex items-center justify-between text-sm">
                                                        <span className="text-red-600">Alerts</span>
                                                        <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium">
                                                            {line.alerts}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </motion.div>
                                    )
                                })}
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-orange-200/50 shadow-sm">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {quickActions.map((action, index) => {
                                    const Icon = action.icon
                                    return (
                                        <motion.button
                                            key={action.title}
                                            className="flex items-center space-x-3 p-4 rounded-lg border border-gray-200 hover:border-orange-300 transition-all duration-200 hover:shadow-md group text-left"
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.1 }}
                                        >
                                            <div className={`w-10 h-10 bg-gradient-to-r from-${action.color}-500 to-${action.color}-600 rounded-lg flex items-center justify-center`}>
                                                <Icon className="w-5 h-5 text-white" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-medium text-gray-900 group-hover:text-orange-700">{action.title}</p>
                                                <p className="text-sm text-gray-600">{action.description}</p>
                                            </div>
                                            <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-orange-500" />
                                        </motion.button>
                                    )
                                })}
                            </div>
                        </div>

                        {/* Active Alerts & Maintenance */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Quality Alerts */}
                            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-orange-200/50 shadow-sm">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-semibold text-gray-900">Quality Alerts</h3>
                                    <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-sm font-medium">
                                        {qualityAlerts.filter(alert => !alert.resolved).length} Active
                                    </span>
                                </div>
                                <div className="space-y-3">
                                    {qualityAlerts.filter(alert => !alert.resolved).slice(0, 3).map((alert, index) => (
                                        <motion.div
                                            key={alert.id}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.1 }}
                                            className={`p-3 rounded-lg border-l-4 ${alert.severity === 'critical' ? 'border-red-500 bg-red-50' :
                                                alert.severity === 'high' ? 'border-orange-500 bg-orange-50' :
                                                    alert.severity === 'medium' ? 'border-yellow-500 bg-yellow-50' :
                                                        'border-blue-500 bg-blue-50'
                                                }`}
                                        >
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <p className="font-medium text-gray-900">{alert.line}</p>
                                                    <p className="text-sm text-gray-600">{alert.description}</p>
                                                    <p className="text-xs text-gray-500 mt-1">
                                                        {new Date(alert.timestamp).toLocaleString('ro-RO')}
                                                    </p>
                                                </div>
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${alert.severity === 'critical' ? 'bg-red-200 text-red-800' :
                                                    alert.severity === 'high' ? 'bg-orange-200 text-orange-800' :
                                                        alert.severity === 'medium' ? 'bg-yellow-200 text-yellow-800' :
                                                            'bg-blue-200 text-blue-800'
                                                    }`}>
                                                    {alert.severity}
                                                </span>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>

                            {/* Maintenance Tasks */}
                            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-orange-200/50 shadow-sm">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-semibold text-gray-900">Maintenance Tasks</h3>
                                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm font-medium">
                                        {maintenanceTasks.filter(task => task.status === 'pending').length} Pending
                                    </span>
                                </div>
                                <div className="space-y-3">
                                    {maintenanceTasks.filter(task => task.status !== 'completed').slice(0, 3).map((task, index) => (
                                        <motion.div
                                            key={task.id}
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.1 }}
                                            className={`p-3 rounded-lg border-l-4 ${task.priority === 'critical' ? 'border-red-500 bg-red-50' :
                                                task.priority === 'high' ? 'border-orange-500 bg-orange-50' :
                                                    task.priority === 'medium' ? 'border-yellow-500 bg-yellow-50' :
                                                        'border-green-500 bg-green-50'
                                                }`}
                                        >
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <p className="font-medium text-gray-900">{task.equipment}</p>
                                                    <p className="text-sm text-gray-600">{task.description}</p>
                                                    <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
                                                        <span>Assigned: {task.assignedTo}</span>
                                                        <span>ETA: {task.estimatedTime}h</span>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${task.status === 'in-progress' ? 'bg-blue-200 text-blue-800' :
                                                        'bg-gray-200 text-gray-800'
                                                        }`}>
                                                        {task.status}
                                                    </span>
                                                    <p className="text-xs text-gray-500 mt-1">
                                                        {new Date(task.dueDate).toLocaleDateString('ro-RO')}
                                                    </p>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Other tab content will be added in subsequent pages */}
                {dashboardState.activeView !== 'overview' && (
                    <div className="bg-white/80 backdrop-blur-sm rounded-xl p-8 border border-orange-200/50 shadow-sm text-center">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            {navigationViews.find(view => view.id === dashboardState.activeView)?.label} Module
                        </h3>
                        <p className="text-gray-600 mb-4">
                            This section will be implemented in the dedicated {navigationViews.find(view => view.id === dashboardState.activeView)?.label.toLowerCase()} page.
                        </p>
                        <button className="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:from-orange-600 hover:to-red-600 transition-colors">
                            Navigate to {navigationViews.find(view => view.id === dashboardState.activeView)?.label}
                        </button>
                    </div>
                )}
            </div>

            {/* Footer */}
            <motion.footer
                className="bg-white/80 backdrop-blur-sm border-t border-orange-200/50 mt-16"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-gradient-to-r from-orange-50 to-orange-100 p-6 rounded-lg border border-orange-200">
                            <Factory className="w-8 h-8 text-orange-600 mb-3" />
                            <h3 className="font-semibold text-orange-900 mb-2">Smart Manufacturing</h3>
                            <p className="text-orange-700 text-sm">AI-powered production optimization with real-time monitoring and predictive analytics.</p>
                        </div>
                        <div className="bg-gradient-to-r from-red-50 to-red-100 p-6 rounded-lg border border-red-200">
                            <Shield className="w-8 h-8 text-red-600 mb-3" />
                            <h3 className="font-semibold text-red-900 mb-2">Quality Assurance</h3>
                            <p className="text-red-700 text-sm">Advanced quality control systems with defect detection and automated testing protocols.</p>
                        </div>
                        <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 p-6 rounded-lg border border-yellow-200">
                            <TrendingUp className="w-8 h-8 text-yellow-600 mb-3" />
                            <h3 className="font-semibold text-yellow-900 mb-2">Performance Analytics</h3>
                            <p className="text-yellow-700 text-sm">Comprehensive analytics and reporting for continuous improvement and optimization.</p>
                        </div>
                    </div>
                </div>
            </motion.footer>
        </div>
    )
}
