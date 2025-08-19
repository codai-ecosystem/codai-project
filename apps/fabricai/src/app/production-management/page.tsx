'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
    // Core Production Icons
    Factory,
    Settings,
    Play,
    Pause,
    Square,
    RotateCcw,

    // Control Icons
    Gauge,
    Thermometer,
    Activity,
    TrendingUp,
    TrendingDown,
    Zap,

    // Management Icons
    Users,
    Clock,
    Calendar,
    CheckCircle2,
    AlertTriangle,
    Target,

    // Navigation Icons
    ArrowLeft,
    ArrowRight,
    RefreshCw,
    Filter,
    Search,
    MoreVertical,

    // Status Icons
    Circle,
    WifiOff,
    Wifi,

    // Tools Icons
    Wrench,
    Cog,
    Monitor
} from 'lucide-react'

// Enhanced Production Management Interfaces
interface ProductionLine {
    id: string
    name: string
    type: 'assembly' | 'fabrication' | 'packaging' | 'quality_control' | 'finishing'
    status: 'running' | 'stopped' | 'maintenance' | 'idle' | 'error' | 'setup'

    // Performance Metrics
    efficiency: number
    currentOutput: number
    targetOutput: number
    quality: number
    oee: number // Overall Equipment Effectiveness

    // Technical Parameters
    speed: number // RPM or units/min
    temperature: number // °C
    pressure: number // bar
    vibration: number // mm/s
    power: number // kW

    // Production Data
    cycleTime: number // seconds
    setupTime: number // minutes
    downtime: number // minutes today
    unitsProduced: number // today
    defectRate: number // percentage

    // Scheduling
    shift: 'morning' | 'afternoon' | 'night'
    operator: string
    supervisor: string
    plannedMaintenance: string
    nextMaintenance: string

    // Alerts and Issues
    alerts: Alert[]
    lastAlert: string | null
    healthScore: number
}

interface Alert {
    id: string
    type: 'temperature' | 'pressure' | 'vibration' | 'quality' | 'speed' | 'maintenance' | 'safety'
    severity: 'low' | 'medium' | 'high' | 'critical'
    message: string
    timestamp: string
    acknowledged: boolean
    resolvedBy?: string
    resolvedAt?: string
}

interface ProductionSchedule {
    id: string
    lineId: string
    product: string
    quantity: number
    startTime: string
    endTime: string
    priority: 'low' | 'medium' | 'high' | 'urgent'
    status: 'scheduled' | 'running' | 'completed' | 'delayed' | 'cancelled'
    progress: number
}

interface Operator {
    id: string
    name: string
    role: 'operator' | 'supervisor' | 'technician' | 'quality_inspector'
    shift: 'morning' | 'afternoon' | 'night'
    certifications: string[]
    productivity: number
    onDuty: boolean
}

export default function ProductionManagement() {
    // Production Management State
    const [selectedView, setSelectedView] = useState<'overview' | 'lines' | 'schedule' | 'operators' | 'control'>('overview')
    const [selectedLine, setSelectedLine] = useState<string | null>(null)
    const [controlPanelOpen, setControlPanelOpen] = useState(false)
    const [realTimeMode, setRealTimeMode] = useState(true)
    const [alertsFilter, setAlertsFilter] = useState<'all' | 'critical' | 'unresolved'>('unresolved')

    // Production Lines Data
    const [productionLines, setProductionLines] = useState<ProductionLine[]>([
        {
            id: 'line-001',
            name: 'Assembly Line A',
            type: 'assembly',
            status: 'running',
            efficiency: 94.7,
            currentOutput: 847,
            targetOutput: 900,
            quality: 97.2,
            oee: 89.4,
            speed: 875,
            temperature: 24.5,
            pressure: 1.2,
            vibration: 0.8,
            power: 156.7,
            cycleTime: 42,
            setupTime: 15,
            downtime: 23,
            unitsProduced: 6847,
            defectRate: 2.8,
            shift: 'morning',
            operator: 'Alexandru Ionescu',
            supervisor: 'Maria Popescu',
            plannedMaintenance: '2025-08-12T06:00:00Z',
            nextMaintenance: '2025-08-12T06:00:00Z',
            alerts: [],
            lastAlert: null,
            healthScore: 94
        },
        {
            id: 'line-002',
            name: 'Fabrication Line B',
            type: 'fabrication',
            status: 'running',
            efficiency: 87.3,
            currentOutput: 623,
            targetOutput: 750,
            quality: 94.8,
            oee: 82.6,
            speed: 732,
            temperature: 28.3,
            pressure: 1.5,
            vibration: 1.2,
            power: 189.4,
            cycleTime: 58,
            setupTime: 22,
            downtime: 45,
            unitsProduced: 5234,
            defectRate: 5.2,
            shift: 'morning',
            operator: 'Andrei Munteanu',
            supervisor: 'Elena Vasile',
            plannedMaintenance: '2025-08-15T14:00:00Z',
            nextMaintenance: '2025-08-15T14:00:00Z',
            alerts: [
                {
                    id: 'alert-001',
                    type: 'temperature',
                    severity: 'medium',
                    message: 'Temperature above normal range: 28.3°C (target: 25°C)',
                    timestamp: '2025-08-09T10:15:00Z',
                    acknowledged: false
                }
            ],
            lastAlert: '2025-08-09T10:15:00Z',
            healthScore: 87
        },
        {
            id: 'line-003',
            name: 'Packaging Line C',
            type: 'packaging',
            status: 'maintenance',
            efficiency: 0,
            currentOutput: 0,
            targetOutput: 600,
            quality: 0,
            oee: 0,
            speed: 0,
            temperature: 22.1,
            pressure: 0.9,
            vibration: 0,
            power: 0,
            cycleTime: 0,
            setupTime: 0,
            downtime: 180,
            unitsProduced: 4156,
            defectRate: 0,
            shift: 'morning',
            operator: 'Cristian Stoica',
            supervisor: 'Ana Popa',
            plannedMaintenance: '2025-08-09T08:00:00Z',
            nextMaintenance: '2025-08-16T08:00:00Z',
            alerts: [
                {
                    id: 'alert-002',
                    type: 'maintenance',
                    severity: 'high',
                    message: 'Scheduled maintenance in progress - hydraulic system overhaul',
                    timestamp: '2025-08-09T08:00:00Z',
                    acknowledged: true
                }
            ],
            lastAlert: '2025-08-09T08:00:00Z',
            healthScore: 75
        },
        {
            id: 'line-004',
            name: 'Quality Control D',
            type: 'quality_control',
            status: 'running',
            efficiency: 96.1,
            currentOutput: 1247,
            targetOutput: 1300,
            quality: 99.1,
            oee: 95.2,
            speed: 1185,
            temperature: 23.7,
            pressure: 1.1,
            vibration: 0.6,
            power: 142.3,
            cycleTime: 28,
            setupTime: 8,
            downtime: 12,
            unitsProduced: 9876,
            defectRate: 0.9,
            shift: 'morning',
            operator: 'Ioana Radu',
            supervisor: 'Gabriel Neagu',
            plannedMaintenance: '2025-08-20T10:00:00Z',
            nextMaintenance: '2025-08-20T10:00:00Z',
            alerts: [],
            lastAlert: null,
            healthScore: 98
        }
    ])

    // Production Schedule Data
    const [productionSchedule] = useState<ProductionSchedule[]>([
        {
            id: 'sched-001',
            lineId: 'line-001',
            product: 'Widget Series A',
            quantity: 1000,
            startTime: '2025-08-09T06:00:00Z',
            endTime: '2025-08-09T14:00:00Z',
            priority: 'high',
            status: 'running',
            progress: 68.4
        },
        {
            id: 'sched-002',
            lineId: 'line-002',
            product: 'Component B-12',
            quantity: 750,
            startTime: '2025-08-09T08:00:00Z',
            endTime: '2025-08-09T16:00:00Z',
            priority: 'medium',
            status: 'running',
            progress: 69.8
        },
        {
            id: 'sched-003',
            lineId: 'line-004',
            product: 'Quality Test Batch',
            quantity: 500,
            startTime: '2025-08-09T09:00:00Z',
            endTime: '2025-08-09T13:00:00Z',
            priority: 'urgent',
            status: 'running',
            progress: 78.5
        }
    ])

    // Operators Data
    const [operators] = useState<Operator[]>([
        {
            id: 'op-001',
            name: 'Alexandru Ionescu',
            role: 'operator',
            shift: 'morning',
            certifications: ['Safety Level 2', 'Machine Operation', 'Quality Control'],
            productivity: 97.2,
            onDuty: true
        },
        {
            id: 'op-002',
            name: 'Maria Popescu',
            role: 'supervisor',
            shift: 'morning',
            certifications: ['Safety Level 3', 'Team Leadership', 'Process Optimization'],
            productivity: 94.8,
            onDuty: true
        },
        {
            id: 'op-003',
            name: 'Andrei Munteanu',
            role: 'technician',
            shift: 'morning',
            certifications: ['Advanced Maintenance', 'Pneumatics', 'Electronics'],
            productivity: 92.5,
            onDuty: true
        }
    ])

    // Real-time Updates Simulation
    useEffect(() => {
        if (realTimeMode) {
            const interval = setInterval(() => {
                setProductionLines(prev => prev.map(line => {
                    if (line.status === 'running') {
                        return {
                            ...line,
                            currentOutput: Math.max(0, Math.min(line.targetOutput * 1.2,
                                line.currentOutput + (Math.random() - 0.4) * 20)),
                            efficiency: Math.max(70, Math.min(100,
                                line.efficiency + (Math.random() - 0.5) * 2)),
                            temperature: Math.max(20, Math.min(35,
                                line.temperature + (Math.random() - 0.5) * 0.5)),
                            pressure: Math.max(0.8, Math.min(2.0,
                                line.pressure + (Math.random() - 0.5) * 0.1)),
                            power: Math.max(100, Math.min(250,
                                line.power + (Math.random() - 0.5) * 5))
                        }
                    }
                    return line
                }))
            }, 3000)

            return () => clearInterval(interval)
        }
    }, [realTimeMode])

    // Navigation tabs
    const navigationTabs = [
        { id: 'overview', label: 'Overview', icon: Monitor },
        { id: 'lines', label: 'Production Lines', icon: Factory },
        { id: 'schedule', label: 'Schedule', icon: Calendar },
        { id: 'operators', label: 'Operators', icon: Users },
        { id: 'control', label: 'Control Panel', icon: Settings }
    ]

    // Get status color and icon
    const getStatusInfo = (status: string) => {
        switch (status) {
            case 'running': return { color: 'text-green-500 bg-green-100', icon: Play, label: 'Running' }
            case 'stopped': return { color: 'text-red-500 bg-red-100', icon: Square, label: 'Stopped' }
            case 'maintenance': return { color: 'text-yellow-500 bg-yellow-100', icon: Wrench, label: 'Maintenance' }
            case 'idle': return { color: 'text-gray-500 bg-gray-100', icon: Pause, label: 'Idle' }
            case 'error': return { color: 'text-red-600 bg-red-200', icon: AlertTriangle, label: 'Error' }
            case 'setup': return { color: 'text-blue-500 bg-blue-100', icon: Cog, label: 'Setup' }
            default: return { color: 'text-gray-500 bg-gray-100', icon: Circle, label: 'Unknown' }
        }
    }

    // Get priority color
    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'urgent': return 'text-red-600 bg-red-100'
            case 'high': return 'text-orange-600 bg-orange-100'
            case 'medium': return 'text-yellow-600 bg-yellow-100'
            case 'low': return 'text-green-600 bg-green-100'
            default: return 'text-gray-600 bg-gray-100'
        }
    }

    // Calculate overall metrics
    const runningLines = productionLines.filter(line => line.status === 'running')
    const overallEfficiency = runningLines.length > 0
        ? runningLines.reduce((sum, line) => sum + line.efficiency, 0) / runningLines.length
        : 0
    const totalOutput = productionLines.reduce((sum, line) => sum + line.currentOutput, 0)
    const totalTarget = productionLines.reduce((sum, line) => sum + line.targetOutput, 0)
    const averageQuality = runningLines.length > 0
        ? runningLines.reduce((sum, line) => sum + line.quality, 0) / runningLines.length
        : 0

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-yellow-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <motion.div
                    className="mb-8"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                                Production Management
                            </h1>
                            <p className="text-gray-600 mt-2">Real-time production line control and monitoring</p>
                        </div>

                        <div className="flex items-center space-x-4">
                            <div className="bg-white/80 backdrop-blur-sm rounded-lg px-4 py-2 border border-orange-200/50">
                                <div className="flex items-center space-x-2">
                                    <div className={`w-3 h-3 rounded-full ${realTimeMode ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
                                    <span className="text-sm font-medium text-gray-700">
                                        {realTimeMode ? 'Live Data' : 'Static Data'}
                                    </span>
                                </div>
                            </div>

                            <button
                                onClick={() => setRealTimeMode(!realTimeMode)}
                                className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-2 rounded-lg hover:from-orange-600 hover:to-red-600 transition-colors"
                            >
                                <RefreshCw className={`w-4 h-4 ${realTimeMode ? 'animate-spin' : ''}`} />
                            </button>
                        </div>
                    </div>
                </motion.div>

                {/* Navigation Tabs */}
                <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-orange-200/50 mb-6">
                    <div className="flex space-x-1 p-1">
                        {navigationTabs.map((tab) => {
                            const Icon = tab.icon
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setSelectedView(tab.id as any)}
                                    className={`flex items-center space-x-2 px-4 py-3 rounded-lg transition-colors ${selectedView === tab.id
                                            ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg'
                                            : 'text-gray-600 hover:text-orange-600 hover:bg-orange-50'
                                        }`}
                                >
                                    <Icon className="w-4 h-4" />
                                    <span className="font-medium">{tab.label}</span>
                                </button>
                            )
                        })}
                    </div>
                </div>

                {/* Overview View */}
                {selectedView === 'overview' && (
                    <motion.div
                        className="space-y-6"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                    >
                        {/* KPI Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-orange-200/50">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="text-orange-800 font-semibold text-sm">Lines Active</h3>
                                        <p className="text-3xl font-bold text-orange-900 mt-1">
                                            {runningLines.length}/{productionLines.length}
                                        </p>
                                        <p className="text-sm text-gray-600 mt-1">
                                            {Math.round((runningLines.length / productionLines.length) * 100)}% operational
                                        </p>
                                    </div>
                                    <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                                        <Factory className="w-6 h-6 text-white" />
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-orange-200/50">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="text-orange-800 font-semibold text-sm">Overall Efficiency</h3>
                                        <p className="text-3xl font-bold text-orange-900 mt-1">{overallEfficiency.toFixed(1)}%</p>
                                        <div className="flex items-center mt-1">
                                            <TrendingUp className="w-4 h-4 text-green-500" />
                                            <span className="text-sm text-green-600 ml-1">+2.3%</span>
                                        </div>
                                    </div>
                                    <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
                                        <Gauge className="w-6 h-6 text-white" />
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-orange-200/50">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="text-orange-800 font-semibold text-sm">Production Rate</h3>
                                        <p className="text-3xl font-bold text-orange-900 mt-1">{totalOutput.toFixed(0)}</p>
                                        <p className="text-sm text-gray-600 mt-1">
                                            Target: {totalTarget.toFixed(0)} ({Math.round((totalOutput / totalTarget) * 100)}%)
                                        </p>
                                    </div>
                                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                                        <Target className="w-6 h-6 text-white" />
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-orange-200/50">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="text-orange-800 font-semibold text-sm">Average Quality</h3>
                                        <p className="text-3xl font-bold text-orange-900 mt-1">{averageQuality.toFixed(1)}%</p>
                                        <div className="flex items-center mt-1">
                                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                                            <span className="text-sm text-green-600 ml-1">Excellent</span>
                                        </div>
                                    </div>
                                    <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                                        <CheckCircle2 className="w-6 h-6 text-white" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Production Lines Status Grid */}
                        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-orange-200/50">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Production Lines Status</h3>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {productionLines.map((line, index) => {
                                    const statusInfo = getStatusInfo(line.status)
                                    const StatusIcon = statusInfo.icon
                                    return (
                                        <motion.div
                                            key={line.id}
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: index * 0.1 }}
                                            className="bg-gradient-to-br from-orange-50 to-red-50 rounded-lg p-4 border border-orange-200 hover:shadow-md transition-shadow cursor-pointer"
                                            onClick={() => setSelectedLine(line.id)}
                                        >
                                            <div className="flex items-center justify-between mb-3">
                                                <h4 className="font-semibold text-gray-900">{line.name}</h4>
                                                <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}>
                                                    <StatusIcon className="w-3 h-3" />
                                                    <span>{statusInfo.label}</span>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-3 gap-4 mb-3">
                                                <div className="text-center">
                                                    <p className="text-xs text-gray-600">Efficiency</p>
                                                    <p className="font-semibold text-gray-900">{line.efficiency}%</p>
                                                </div>
                                                <div className="text-center">
                                                    <p className="text-xs text-gray-600">Output</p>
                                                    <p className="font-semibold text-gray-900">{line.currentOutput.toFixed(0)}</p>
                                                </div>
                                                <div className="text-center">
                                                    <p className="text-xs text-gray-600">Quality</p>
                                                    <p className="font-semibold text-gray-900">{line.quality}%</p>
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-gray-600">Progress</span>
                                                    <span className="font-medium">{Math.round((line.currentOutput / line.targetOutput) * 100)}%</span>
                                                </div>
                                                <div className="w-full bg-gray-200 rounded-full h-2">
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${Math.min(100, (line.currentOutput / line.targetOutput) * 100)}%` }}
                                                        transition={{ duration: 1, delay: index * 0.2 }}
                                                        className={`h-2 rounded-full ${line.status === 'running' ? 'bg-gradient-to-r from-green-400 to-green-600' :
                                                                line.status === 'maintenance' ? 'bg-gradient-to-r from-yellow-400 to-yellow-600' :
                                                                    'bg-gradient-to-r from-gray-400 to-gray-600'
                                                            }`}
                                                    />
                                                </div>
                                            </div>

                                            {line.alerts.length > 0 && (
                                                <div className="mt-3 flex items-center space-x-2 text-sm">
                                                    <AlertTriangle className="w-4 h-4 text-red-500" />
                                                    <span className="text-red-600 font-medium">{line.alerts.length} alert(s)</span>
                                                </div>
                                            )}
                                        </motion.div>
                                    )
                                })}
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Production Lines View */}
                {selectedView === 'lines' && (
                    <motion.div
                        className="space-y-6"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                    >
                        {productionLines.map((line, index) => {
                            const statusInfo = getStatusInfo(line.status)
                            const StatusIcon = statusInfo.icon
                            return (
                                <motion.div
                                    key={line.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-orange-200/50"
                                >
                                    <div className="flex items-center justify-between mb-6">
                                        <div>
                                            <h3 className="text-xl font-semibold text-gray-900">{line.name}</h3>
                                            <p className="text-gray-600">Type: {line.type.replace('_', ' ')} | Operator: {line.operator}</p>
                                        </div>
                                        <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg ${statusInfo.color}`}>
                                            <StatusIcon className="w-4 h-4" />
                                            <span className="font-medium">{statusInfo.label}</span>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                                        {/* Performance Metrics */}
                                        <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-lg p-4">
                                            <h4 className="font-semibold text-gray-900 mb-3">Performance</h4>
                                            <div className="space-y-2">
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">Efficiency:</span>
                                                    <span className="font-medium">{line.efficiency}%</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">OEE:</span>
                                                    <span className="font-medium">{line.oee}%</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">Quality:</span>
                                                    <span className="font-medium">{line.quality}%</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">Health Score:</span>
                                                    <span className="font-medium">{line.healthScore}%</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Technical Parameters */}
                                        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg p-4">
                                            <h4 className="font-semibold text-gray-900 mb-3">Technical</h4>
                                            <div className="space-y-2">
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">Speed:</span>
                                                    <span className="font-medium">{line.speed} RPM</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">Temperature:</span>
                                                    <span className="font-medium">{line.temperature}°C</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">Pressure:</span>
                                                    <span className="font-medium">{line.pressure} bar</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">Power:</span>
                                                    <span className="font-medium">{line.power} kW</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Production Data */}
                                        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4">
                                            <h4 className="font-semibold text-gray-900 mb-3">Production</h4>
                                            <div className="space-y-2">
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">Output:</span>
                                                    <span className="font-medium">{line.currentOutput}/{line.targetOutput}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">Units Today:</span>
                                                    <span className="font-medium">{line.unitsProduced.toLocaleString()}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">Cycle Time:</span>
                                                    <span className="font-medium">{line.cycleTime}s</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">Defect Rate:</span>
                                                    <span className="font-medium">{line.defectRate}%</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Maintenance & Schedule */}
                                        <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-lg p-4">
                                            <h4 className="font-semibold text-gray-900 mb-3">Maintenance</h4>
                                            <div className="space-y-2">
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">Downtime:</span>
                                                    <span className="font-medium">{line.downtime}m</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">Setup Time:</span>
                                                    <span className="font-medium">{line.setupTime}m</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">Next Maint:</span>
                                                    <span className="font-medium text-xs">
                                                        {new Date(line.nextMaintenance).toLocaleDateString()}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">Supervisor:</span>
                                                    <span className="font-medium text-xs">{line.supervisor}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Control Buttons */}
                                    {line.status === 'running' && (
                                        <div className="flex items-center space-x-3">
                                            <button className="flex items-center space-x-2 px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors">
                                                <Pause className="w-4 h-4" />
                                                <span>Pause</span>
                                            </button>
                                            <button className="flex items-center space-x-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors">
                                                <Square className="w-4 h-4" />
                                                <span>Stop</span>
                                            </button>
                                            <button className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                                                <Settings className="w-4 h-4" />
                                                <span>Configure</span>
                                            </button>
                                        </div>
                                    )}

                                    {line.status === 'stopped' && (
                                        <div className="flex items-center space-x-3">
                                            <button className="flex items-center space-x-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors">
                                                <Play className="w-4 h-4" />
                                                <span>Start</span>
                                            </button>
                                            <button className="flex items-center space-x-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors">
                                                <RotateCcw className="w-4 h-4" />
                                                <span>Reset</span>
                                            </button>
                                        </div>
                                    )}
                                </motion.div>
                            )
                        })}
                    </motion.div>
                )}

                {/* Other views placeholder */}
                {(['schedule', 'operators', 'control'].includes(selectedView)) && (
                    <div className="bg-white/80 backdrop-blur-sm rounded-xl p-8 border border-orange-200/50 text-center">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            {selectedView.charAt(0).toUpperCase() + selectedView.slice(1)} Module
                        </h3>
                        <p className="text-gray-600 mb-4">
                            Advanced {selectedView} management features will be implemented here.
                        </p>
                        <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-2 rounded-lg inline-block">
                            Coming Soon: {selectedView.charAt(0).toUpperCase() + selectedView.slice(1)} Management
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
