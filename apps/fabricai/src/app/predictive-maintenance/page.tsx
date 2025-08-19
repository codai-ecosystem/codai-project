'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
    // Maintenance Icons
    Wrench,
    Settings,
    Cog,
    Hammer,

    // AI & Prediction Icons
    Brain,
    Zap,
    TrendingUp,
    TrendingDown,
    Target,
    Eye,

    // Equipment Icons
    Cpu,
    HardDrive,
    Monitor,
    Activity,
    Thermometer,
    Gauge,

    // Status Icons
    CheckCircle2,
    XCircle,
    AlertTriangle,
    Clock,
    Calendar,
    Timer,

    // Analytics Icons
    BarChart3,
    LineChart,
    PieChart,
    Activity as ActivityIcon,
    ArrowUp,

    // Control Icons
    Play,
    Pause,
    Square,
    RotateCcw,
    RefreshCw,
    Download,

    // Navigation Icons
    Search,
    Filter,
    Plus,
    MoreVertical,
    ArrowRight,
    ChevronRight,

    // Alert Icons
    Bell,
    AlertCircle,
    Info,
    Shield
} from 'lucide-react'

// Enhanced Predictive Maintenance Interfaces
interface Equipment {
    id: string
    name: string
    type: 'motor' | 'pump' | 'conveyor' | 'press' | 'robot' | 'sensor' | 'compressor' | 'heater'
    model: string
    manufacturer: string

    // Location
    productionLine: string
    station: string
    zone: string

    // Health Metrics
    healthScore: number // 0-100
    vibration: number // mm/s
    temperature: number // °C
    pressure: number // bar
    currentDraw: number // amperes
    efficiency: number // percentage

    // Operational Data
    operatingHours: number
    cycleCount: number
    lastMaintenance: string
    nextScheduledMaintenance: string

    // Predictive Analytics
    remainingUsefulLife: number // days
    failureProbability: number // percentage
    maintenanceUrgency: 'low' | 'medium' | 'high' | 'critical'
    predictedFailureDate?: string

    // Status
    status: 'operational' | 'warning' | 'critical' | 'maintenance' | 'offline'
    alertsCount: number

    // Maintenance History
    maintenanceType: 'preventive' | 'corrective' | 'predictive' | 'emergency'
    lastMaintenanceCost: number
    totalMaintenanceCost: number
    mtbf: number // Mean Time Between Failures in hours
}

interface MaintenanceTask {
    id: string
    equipmentId: string
    equipmentName: string
    type: 'preventive' | 'corrective' | 'predictive' | 'emergency' | 'calibration'
    priority: 'low' | 'medium' | 'high' | 'critical'

    // Task Details
    title: string
    description: string
    estimatedDuration: number // hours
    requiredSkills: string[]
    requiredParts: string[]
    requiredTools: string[]

    // Scheduling
    scheduledDate: string
    actualStartDate?: string
    actualEndDate?: string
    assignedTechnician?: string

    // Status
    status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'overdue'
    completion: number // percentage

    // Cost Analysis
    estimatedCost: number
    actualCost?: number
    laborHours: number
    partsCost: number

    // AI Recommendations
    aiGenerated: boolean
    confidenceScore?: number // percentage
    riskReduction?: number // percentage
}

interface PredictiveModel {
    id: string
    name: string
    type: 'vibration_analysis' | 'thermal_imaging' | 'oil_analysis' | 'acoustic_monitoring' | 'current_signature'
    equipmentTypes: string[]

    // Model Performance
    accuracy: number // percentage
    precision: number // percentage
    recall: number // percentage
    f1Score: number

    // Training Data
    trainingDataPoints: number
    lastTrainingDate: string
    nextRetrainingDate: string

    // Predictions
    activePredictions: number
    correctPredictions: number
    falsePositives: number
    falseNegatives: number

    // Status
    status: 'active' | 'training' | 'validation' | 'inactive'
    version: string
    deploymentDate: string
}

interface MaintenanceAlert {
    id: string
    equipmentId: string
    equipmentName: string
    type: 'temperature' | 'vibration' | 'pressure' | 'current' | 'efficiency' | 'prediction'
    severity: 'low' | 'medium' | 'high' | 'critical'

    // Alert Details
    title: string
    message: string
    threshold: number
    currentValue: number
    unit: string

    // Timing
    triggeredAt: string
    acknowledgedAt?: string
    resolvedAt?: string

    // Response
    acknowledgedBy?: string
    resolvedBy?: string
    actionTaken?: string

    // AI Insights
    aiAnalysis?: string
    recommendedAction?: string
    riskLevel: number // 1-10
}

export default function PredictiveMaintenance() {
    // Predictive Maintenance State
    const [selectedView, setSelectedView] = useState<'overview' | 'equipment' | 'tasks' | 'analytics' | 'models' | 'alerts'>('overview')
    const [selectedEquipment, setSelectedEquipment] = useState<string | null>(null)
    const [realTimeMode, setRealTimeMode] = useState(true)
    const [alertsFilter, setAlertsFilter] = useState<'all' | 'critical' | 'unresolved'>('critical')

    // Equipment Data
    const [equipment, setEquipment] = useState<Equipment[]>([
        {
            id: 'eq-001',
            name: 'Main Drive Motor',
            type: 'motor',
            model: 'MD-4500',
            manufacturer: 'MotorTech Industries',
            productionLine: 'Assembly Line A',
            station: 'Drive Station 1',
            zone: 'Zone A',
            healthScore: 87,
            vibration: 2.3,
            temperature: 68.5,
            pressure: 0,
            currentDraw: 15.2,
            efficiency: 94.2,
            operatingHours: 15847,
            cycleCount: 234567,
            lastMaintenance: '2025-07-15T10:00:00Z',
            nextScheduledMaintenance: '2025-08-15T10:00:00Z',
            remainingUsefulLife: 127,
            failureProbability: 12.3,
            maintenanceUrgency: 'low',
            status: 'operational',
            alertsCount: 0,
            maintenanceType: 'preventive',
            lastMaintenanceCost: 850,
            totalMaintenanceCost: 12500,
            mtbf: 2160
        },
        {
            id: 'eq-002',
            name: 'Hydraulic Press HP-01',
            type: 'press',
            model: 'HP-250T',
            manufacturer: 'HydroPress Systems',
            productionLine: 'Fabrication Line B',
            station: 'Forming Station 2',
            zone: 'Zone B',
            healthScore: 72,
            vibration: 4.8,
            temperature: 82.3,
            pressure: 245.7,
            currentDraw: 28.4,
            efficiency: 87.1,
            operatingHours: 23456,
            cycleCount: 189234,
            lastMaintenance: '2025-06-20T14:30:00Z',
            nextScheduledMaintenance: '2025-08-12T08:00:00Z',
            remainingUsefulLife: 23,
            failureProbability: 34.7,
            maintenanceUrgency: 'high',
            predictedFailureDate: '2025-09-01T00:00:00Z',
            status: 'warning',
            alertsCount: 2,
            maintenanceType: 'predictive',
            lastMaintenanceCost: 2400,
            totalMaintenanceCost: 28900,
            mtbf: 1680
        },
        {
            id: 'eq-003',
            name: 'Conveyor System CV-03',
            type: 'conveyor',
            model: 'CV-AUTO-500',
            manufacturer: 'ConveyorTech Ltd',
            productionLine: 'Packaging Line C',
            station: 'Transport Section 3',
            zone: 'Zone C',
            healthScore: 96,
            vibration: 1.2,
            temperature: 45.6,
            pressure: 0,
            currentDraw: 8.7,
            efficiency: 98.5,
            operatingHours: 8934,
            cycleCount: 145678,
            lastMaintenance: '2025-08-01T09:00:00Z',
            nextScheduledMaintenance: '2025-09-01T09:00:00Z',
            remainingUsefulLife: 189,
            failureProbability: 5.2,
            maintenanceUrgency: 'low',
            status: 'operational',
            alertsCount: 0,
            maintenanceType: 'preventive',
            lastMaintenanceCost: 320,
            totalMaintenanceCost: 4560,
            mtbf: 2880
        },
        {
            id: 'eq-004',
            name: 'Quality Scanner QS-02',
            type: 'sensor',
            model: 'QS-VISION-HD',
            manufacturer: 'VisionScan Pro',
            productionLine: 'Quality Control D',
            station: 'Inspection Point 2',
            zone: 'Zone D',
            healthScore: 58,
            vibration: 0.8,
            temperature: 71.2,
            pressure: 0,
            currentDraw: 12.3,
            efficiency: 76.4,
            operatingHours: 18234,
            cycleCount: 298765,
            lastMaintenance: '2025-05-10T11:00:00Z',
            nextScheduledMaintenance: '2025-08-10T11:00:00Z',
            remainingUsefulLife: 8,
            failureProbability: 67.8,
            maintenanceUrgency: 'critical',
            predictedFailureDate: '2025-08-17T00:00:00Z',
            status: 'critical',
            alertsCount: 4,
            maintenanceType: 'emergency',
            lastMaintenanceCost: 1850,
            totalMaintenanceCost: 15600,
            mtbf: 1440
        }
    ])

    // Maintenance Tasks Data
    const [maintenanceTasks] = useState<MaintenanceTask[]>([
        {
            id: 'task-001',
            equipmentId: 'eq-002',
            equipmentName: 'Hydraulic Press HP-01',
            type: 'predictive',
            priority: 'high',
            title: 'Hydraulic System Overhaul',
            description: 'Replace hydraulic seals and check pressure system based on AI prediction',
            estimatedDuration: 6,
            requiredSkills: ['Hydraulics Level 3', 'Mechanical Assembly'],
            requiredParts: ['Hydraulic Seals Kit', 'Pressure Sensor'],
            requiredTools: ['Hydraulic Press', 'Torque Wrench', 'Multimeter'],
            scheduledDate: '2025-08-12T08:00:00Z',
            assignedTechnician: 'Andrei Munteanu',
            status: 'scheduled',
            completion: 0,
            estimatedCost: 2400,
            laborHours: 6,
            partsCost: 1200,
            aiGenerated: true,
            confidenceScore: 94.2,
            riskReduction: 78.5
        },
        {
            id: 'task-002',
            equipmentId: 'eq-004',
            equipmentName: 'Quality Scanner QS-02',
            type: 'emergency',
            priority: 'critical',
            title: 'Vision System Calibration & Repair',
            description: 'Critical maintenance required - scanner accuracy degraded below acceptable levels',
            estimatedDuration: 4,
            requiredSkills: ['Electronics', 'Vision Systems', 'Calibration'],
            requiredParts: ['Camera Module', 'LED Array', 'Calibration Target'],
            requiredTools: ['Precision Screwdrivers', 'Calibration Software', 'Oscilloscope'],
            scheduledDate: '2025-08-10T11:00:00Z',
            assignedTechnician: 'Ioana Radu',
            status: 'scheduled',
            completion: 0,
            estimatedCost: 1850,
            laborHours: 4,
            partsCost: 980,
            aiGenerated: true,
            confidenceScore: 98.7,
            riskReduction: 89.3
        },
        {
            id: 'task-003',
            equipmentId: 'eq-001',
            equipmentName: 'Main Drive Motor',
            type: 'preventive',
            priority: 'medium',
            title: 'Routine Motor Maintenance',
            description: 'Standard preventive maintenance including lubrication and inspection',
            estimatedDuration: 2,
            requiredSkills: ['Electrical Systems', 'Motor Maintenance'],
            requiredParts: ['Motor Oil', 'Air Filter'],
            requiredTools: ['Grease Gun', 'Inspection Tools'],
            scheduledDate: '2025-08-15T10:00:00Z',
            assignedTechnician: 'Gabriel Neagu',
            status: 'scheduled',
            completion: 0,
            estimatedCost: 850,
            laborHours: 2,
            partsCost: 150,
            aiGenerated: false,
            riskReduction: 45.2
        }
    ])

    // Predictive Models Data
    const [predictiveModels] = useState<PredictiveModel[]>([
        {
            id: 'model-001',
            name: 'Vibration Analysis Model',
            type: 'vibration_analysis',
            equipmentTypes: ['motor', 'pump', 'compressor'],
            accuracy: 94.2,
            precision: 92.8,
            recall: 95.1,
            f1Score: 93.9,
            trainingDataPoints: 15000,
            lastTrainingDate: '2025-07-20T00:00:00Z',
            nextRetrainingDate: '2025-08-20T00:00:00Z',
            activePredictions: 12,
            correctPredictions: 11,
            falsePositives: 1,
            falseNegatives: 0,
            status: 'active',
            version: 'v2.3.1',
            deploymentDate: '2025-07-25T00:00:00Z'
        },
        {
            id: 'model-002',
            name: 'Thermal Prediction Model',
            type: 'thermal_imaging',
            equipmentTypes: ['motor', 'press', 'heater'],
            accuracy: 91.7,
            precision: 89.4,
            recall: 93.2,
            f1Score: 91.3,
            trainingDataPoints: 8500,
            lastTrainingDate: '2025-07-15T00:00:00Z',
            nextRetrainingDate: '2025-08-15T00:00:00Z',
            activePredictions: 8,
            correctPredictions: 7,
            falsePositives: 1,
            falseNegatives: 0,
            status: 'active',
            version: 'v1.8.2',
            deploymentDate: '2025-07-18T00:00:00Z'
        }
    ])

    // Maintenance Alerts Data
    const [maintenanceAlerts] = useState<MaintenanceAlert[]>([
        {
            id: 'alert-001',
            equipmentId: 'eq-004',
            equipmentName: 'Quality Scanner QS-02',
            type: 'efficiency',
            severity: 'critical',
            title: 'Scanner Accuracy Degraded',
            message: 'Vision system accuracy dropped to 76.4% (threshold: 85%)',
            threshold: 85,
            currentValue: 76.4,
            unit: '%',
            triggeredAt: '2025-08-09T09:15:00Z',
            riskLevel: 9,
            aiAnalysis: 'Camera module degradation detected. High probability of complete failure within 8 days.',
            recommendedAction: 'Schedule immediate maintenance - replace camera module and recalibrate system'
        },
        {
            id: 'alert-002',
            equipmentId: 'eq-002',
            equipmentName: 'Hydraulic Press HP-01',
            type: 'pressure',
            severity: 'high',
            title: 'Pressure System Warning',
            message: 'Hydraulic pressure fluctuation detected (245.7 bar, threshold: 250 bar)',
            threshold: 250,
            currentValue: 245.7,
            unit: 'bar',
            triggeredAt: '2025-08-09T08:30:00Z',
            riskLevel: 7,
            aiAnalysis: 'Seal degradation pattern indicates potential failure in 23 days.',
            recommendedAction: 'Schedule hydraulic seal replacement within 2 weeks'
        }
    ])

    // Real-time Updates Simulation
    useEffect(() => {
        if (realTimeMode) {
            const interval = setInterval(() => {
                setEquipment(prev => prev.map(eq => {
                    if (eq.status === 'operational' || eq.status === 'warning') {
                        const tempChange = (Math.random() - 0.5) * 2
                        const vibrationChange = (Math.random() - 0.5) * 0.2
                        const efficiencyChange = (Math.random() - 0.5) * 1

                        const newTemp = Math.max(20, Math.min(100, eq.temperature + tempChange))
                        const newVibration = Math.max(0, eq.vibration + vibrationChange)
                        const newEfficiency = Math.max(60, Math.min(100, eq.efficiency + efficiencyChange))

                        // Update health score based on all parameters
                        const healthFactor = (newEfficiency / 100) * 0.4 +
                            (1 - Math.min(newVibration / 10, 1)) * 0.3 +
                            (1 - Math.min(newTemp / 100, 1)) * 0.3
                        const newHealthScore = Math.round(healthFactor * 100)

                        return {
                            ...eq,
                            temperature: newTemp,
                            vibration: newVibration,
                            efficiency: newEfficiency,
                            healthScore: newHealthScore,
                            operatingHours: eq.operatingHours + (1 / 3600) // Increment by 1 second in hours
                        }
                    }
                    return eq
                }))
            }, 3000)

            return () => clearInterval(interval)
        }
    }, [realTimeMode])

    // Navigation tabs
    const navigationTabs = [
        { id: 'overview', label: 'Overview', icon: Monitor },
        { id: 'equipment', label: 'Equipment', icon: Cog },
        { id: 'tasks', label: 'Tasks', icon: Wrench },
        { id: 'analytics', label: 'Analytics', icon: BarChart3 },
        { id: 'models', label: 'AI Models', icon: Brain },
        { id: 'alerts', label: 'Alerts', icon: Bell }
    ]

    // Get status color and icon
    const getEquipmentStatusInfo = (status: string) => {
        switch (status) {
            case 'operational': return { color: 'text-green-500 bg-green-100', icon: CheckCircle2, label: 'Operational' }
            case 'warning': return { color: 'text-yellow-500 bg-yellow-100', icon: AlertTriangle, label: 'Warning' }
            case 'critical': return { color: 'text-red-500 bg-red-100', icon: XCircle, label: 'Critical' }
            case 'maintenance': return { color: 'text-blue-500 bg-blue-100', icon: Wrench, label: 'Maintenance' }
            case 'offline': return { color: 'text-gray-500 bg-gray-100', icon: Pause, label: 'Offline' }
            default: return { color: 'text-gray-500 bg-gray-100', icon: AlertCircle, label: 'Unknown' }
        }
    }

    // Get urgency color
    const getUrgencyColor = (urgency: string) => {
        switch (urgency) {
            case 'critical': return 'text-red-600 bg-red-100 border-red-200'
            case 'high': return 'text-orange-600 bg-orange-100 border-orange-200'
            case 'medium': return 'text-yellow-600 bg-yellow-100 border-yellow-200'
            case 'low': return 'text-green-600 bg-green-100 border-green-200'
            default: return 'text-gray-600 bg-gray-100 border-gray-200'
        }
    }

    // Calculate summary metrics
    const operationalEquipment = equipment.filter(eq => eq.status === 'operational').length
    const criticalEquipment = equipment.filter(eq => eq.status === 'critical').length
    const warningEquipment = equipment.filter(eq => eq.status === 'warning').length
    const averageHealthScore = equipment.length > 0
        ? equipment.reduce((sum, eq) => sum + eq.healthScore, 0) / equipment.length
        : 0
    const urgentTasks = maintenanceTasks.filter(task => task.priority === 'critical' || task.priority === 'high').length
    const totalAlerts = maintenanceAlerts.filter(alert => !alert.resolvedAt).length

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
                                Predictive Maintenance
                            </h1>
                            <p className="text-gray-600 mt-2">AI-powered equipment monitoring and maintenance scheduling</p>
                        </div>

                        <div className="flex items-center space-x-4">
                            <div className="bg-white/80 backdrop-blur-sm rounded-lg px-4 py-2 border border-orange-200/50">
                                <div className="flex items-center space-x-2">
                                    <div className={`w-3 h-3 rounded-full ${realTimeMode ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
                                    <span className="text-sm font-medium text-gray-700">
                                        {realTimeMode ? 'AI Active' : 'Static Data'}
                                    </span>
                                </div>
                            </div>

                            <button
                                onClick={() => setRealTimeMode(!realTimeMode)}
                                className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-2 rounded-lg hover:from-orange-600 hover:to-red-600 transition-colors"
                            >
                                <Brain className={`w-4 h-4 ${realTimeMode ? 'animate-pulse' : ''}`} />
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
                                        <h3 className="text-orange-800 font-semibold text-sm">Equipment Health</h3>
                                        <p className="text-3xl font-bold text-orange-900 mt-1">{averageHealthScore.toFixed(0)}%</p>
                                        <p className="text-sm text-gray-600 mt-1">
                                            {operationalEquipment}/{equipment.length} operational
                                        </p>
                                    </div>
                                    <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                                        <Activity className="w-6 h-6 text-white" />
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-orange-200/50">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="text-orange-800 font-semibold text-sm">Critical Issues</h3>
                                        <p className="text-3xl font-bold text-orange-900 mt-1">{criticalEquipment + warningEquipment}</p>
                                        <div className="flex items-center mt-1">
                                            <AlertTriangle className="w-4 h-4 text-red-500" />
                                            <span className="text-sm text-red-600 ml-1">{criticalEquipment} critical</span>
                                        </div>
                                    </div>
                                    <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center">
                                        <AlertTriangle className="w-6 h-6 text-white" />
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-orange-200/50">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="text-orange-800 font-semibold text-sm">Urgent Tasks</h3>
                                        <p className="text-3xl font-bold text-orange-900 mt-1">{urgentTasks}</p>
                                        <div className="flex items-center mt-1">
                                            <Clock className="w-4 h-4 text-blue-500" />
                                            <span className="text-sm text-blue-600 ml-1">{maintenanceTasks.length} total</span>
                                        </div>
                                    </div>
                                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                                        <Wrench className="w-6 h-6 text-white" />
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-orange-200/50">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="text-orange-800 font-semibold text-sm">AI Accuracy</h3>
                                        <p className="text-3xl font-bold text-orange-900 mt-1">93.0%</p>
                                        <div className="flex items-center mt-1">
                                            <Brain className="w-4 h-4 text-purple-500" />
                                            <span className="text-sm text-purple-600 ml-1">{predictiveModels.length} models</span>
                                        </div>
                                    </div>
                                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                                        <Zap className="w-6 h-6 text-white" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Equipment Health Dashboard */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Equipment Status */}
                            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-orange-200/50">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Equipment Status</h3>
                                <div className="space-y-3">
                                    {equipment.map((eq, index) => {
                                        const statusInfo = getEquipmentStatusInfo(eq.status)
                                        const StatusIcon = statusInfo.icon
                                        return (
                                            <motion.div
                                                key={eq.id}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: index * 0.1 }}
                                                className="bg-gradient-to-br from-orange-50 to-red-50 rounded-lg p-4 border border-orange-200 hover:shadow-md transition-shadow cursor-pointer"
                                                onClick={() => setSelectedEquipment(eq.id)}
                                            >
                                                <div className="flex items-center justify-between mb-3">
                                                    <h4 className="font-semibold text-gray-900">{eq.name}</h4>
                                                    <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}>
                                                        <StatusIcon className="w-3 h-3" />
                                                        <span>{statusInfo.label}</span>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-3 gap-4 mb-3">
                                                    <div className="text-center">
                                                        <p className="text-xs text-gray-600">Health Score</p>
                                                        <p className="font-semibold text-gray-900">{eq.healthScore}%</p>
                                                    </div>
                                                    <div className="text-center">
                                                        <p className="text-xs text-gray-600">RUL</p>
                                                        <p className="font-semibold text-gray-900">{eq.remainingUsefulLife}d</p>
                                                    </div>
                                                    <div className="text-center">
                                                        <p className="text-xs text-gray-600">Failure Risk</p>
                                                        <p className="font-semibold text-gray-900">{eq.failureProbability.toFixed(1)}%</p>
                                                    </div>
                                                </div>

                                                <div className="space-y-2">
                                                    <div className="flex justify-between text-sm">
                                                        <span className="text-gray-600">Health Progress</span>
                                                        <span className="font-medium">{eq.healthScore}%</span>
                                                    </div>
                                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                                        <motion.div
                                                            initial={{ width: 0 }}
                                                            animate={{ width: `${eq.healthScore}%` }}
                                                            transition={{ duration: 1, delay: index * 0.2 }}
                                                            className={`h-2 rounded-full ${eq.healthScore >= 80 ? 'bg-gradient-to-r from-green-400 to-green-600' :
                                                                    eq.healthScore >= 60 ? 'bg-gradient-to-r from-yellow-400 to-yellow-600' :
                                                                        'bg-gradient-to-r from-red-400 to-red-600'
                                                                }`}
                                                        />
                                                    </div>
                                                </div>

                                                {eq.alertsCount > 0 && (
                                                    <div className="mt-3 flex items-center space-x-2 text-sm">
                                                        <Bell className="w-4 h-4 text-red-500" />
                                                        <span className="text-red-600 font-medium">{eq.alertsCount} alert(s)</span>
                                                    </div>
                                                )}
                                            </motion.div>
                                        )
                                    })}
                                </div>
                            </div>

                            {/* Upcoming Maintenance Tasks */}
                            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-orange-200/50">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Tasks</h3>
                                <div className="space-y-4">
                                    {maintenanceTasks
                                        .filter(task => task.status === 'scheduled')
                                        .sort((a, b) => a.priority === 'critical' ? -1 : b.priority === 'critical' ? 1 : 0)
                                        .slice(0, 4)
                                        .map((task, index) => (
                                            <motion.div
                                                key={task.id}
                                                initial={{ opacity: 0, scale: 0.9 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                transition={{ delay: index * 0.1 }}
                                                className="bg-gradient-to-br from-orange-50 to-red-50 rounded-lg p-4 border border-orange-200"
                                            >
                                                <div className="flex items-center justify-between mb-2">
                                                    <h4 className="font-medium text-gray-900 text-sm">{task.title}</h4>
                                                    <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium border ${getUrgencyColor(task.priority)}`}>
                                                        <span>{task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}</span>
                                                    </div>
                                                </div>

                                                <p className="text-xs text-gray-600 mb-3">{task.equipmentName}</p>

                                                <div className="grid grid-cols-2 gap-4 text-xs">
                                                    <div>
                                                        <span className="text-gray-600">Duration:</span>
                                                        <p className="font-semibold">{task.estimatedDuration}h</p>
                                                    </div>
                                                    <div>
                                                        <span className="text-gray-600">Cost:</span>
                                                        <p className="font-semibold">€{task.estimatedCost.toLocaleString()}</p>
                                                    </div>
                                                    <div>
                                                        <span className="text-gray-600">Technician:</span>
                                                        <p className="font-semibold text-xs">{task.assignedTechnician}</p>
                                                    </div>
                                                    <div>
                                                        <span className="text-gray-600">Date:</span>
                                                        <p className="font-semibold text-xs">
                                                            {new Date(task.scheduledDate).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                </div>

                                                {task.aiGenerated && (
                                                    <div className="mt-3 flex items-center space-x-2 text-xs">
                                                        <Brain className="w-3 h-3 text-purple-500" />
                                                        <span className="text-purple-600 font-medium">
                                                            AI Generated ({task.confidenceScore}% confidence)
                                                        </span>
                                                    </div>
                                                )}
                                            </motion.div>
                                        ))}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Other views placeholder */}
                {(['equipment', 'tasks', 'analytics', 'models', 'alerts'].includes(selectedView)) && (
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
