'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
    // Quality Control Icons
    CheckCircle2,
    XCircle,
    AlertTriangle,
    Shield,
    Eye,
    Search,

    // Testing Icons
    TestTube,
    Microscope,
    FlaskConical,
    Beaker,
    Scale,
    Ruler,

    // Inspection Icons
    Camera,
    ScanLine,
    Target,
    Crosshair,
    Focus,
    Zap,

    // Analysis Icons
    BarChart3,
    TrendingUp,
    TrendingDown,
    PieChart,
    Activity,
    Gauge,

    // Compliance Icons
    FileCheck,
    Award,
    FileText,
    BookOpen,
    Clipboard,
    CheckSquare,

    // Control Icons
    Settings,
    Play,
    Pause,
    RotateCcw,
    Download,
    Upload,

    // Status Icons
    Circle,
    Clock,
    Calendar,
    Users,
    MapPin,
    Layers
} from 'lucide-react'

// Enhanced Quality Control Interfaces
interface QualityTest {
    id: string
    name: string
    type: 'dimensional' | 'visual' | 'functional' | 'material' | 'electrical' | 'thermal'
    status: 'pending' | 'running' | 'passed' | 'failed' | 'cancelled'

    // Test Configuration
    standard: string // ISO, ASTM, etc.
    tolerance: number
    units: string
    criticalLevel: 'low' | 'medium' | 'high' | 'critical'

    // Test Results
    measured: number
    target: number
    deviation: number
    passRate: number

    // Timing
    duration: number // minutes
    startTime: string
    endTime?: string

    // Metadata
    inspector: string
    equipment: string
    sampleSize: number
    batchId: string
    productionLine: string
}

interface QualityMetric {
    id: string
    name: string
    category: 'defect_rate' | 'first_pass_yield' | 'customer_returns' | 'inspection_efficiency' | 'compliance_score'
    value: number
    target: number
    unit: string
    trend: 'up' | 'down' | 'stable'
    trendPercentage: number
    period: 'hourly' | 'daily' | 'weekly' | 'monthly'
    lastUpdated: string
}

interface DefectRecord {
    id: string
    type: 'dimensional' | 'surface' | 'functional' | 'assembly' | 'material' | 'cosmetic'
    severity: 'minor' | 'major' | 'critical'
    description: string

    // Location
    productionLine: string
    station: string
    batch: string
    partNumber: string

    // Detection
    detectedBy: 'operator' | 'automated' | 'customer' | 'final_inspection'
    detectionMethod: string
    detectionTime: string

    // Resolution
    status: 'open' | 'investigating' | 'resolved' | 'closed'
    rootCause?: string
    correctiveAction?: string
    preventiveAction?: string
    resolvedBy?: string
    resolvedTime?: string

    // Impact
    quantity: number
    cost: number
    customerImpact: boolean
}

interface InspectionPoint {
    id: string
    name: string
    location: string
    type: 'incoming' | 'in_process' | 'final' | 'customer_audit'

    // Configuration
    frequency: 'continuous' | 'batch' | 'sample' | 'periodic'
    sampleRate: number // percentage or interval
    automationLevel: 'manual' | 'semi_automated' | 'fully_automated'

    // Current Status
    status: 'active' | 'inactive' | 'maintenance' | 'calibration'
    lastInspection: string
    nextInspection: string
    inspector: string

    // Performance
    throughput: number // items per hour
    accuracy: number // percentage
    falsePositiveRate: number
    falseNegativeRate: number

    // Equipment
    equipment: string[]
    calibrationDue: string
    maintenanceDue: string
}

interface ComplianceStandard {
    id: string
    name: string
    type: 'iso' | 'astm' | 'din' | 'ansi' | 'iec' | 'internal'
    version: string

    // Scope
    applicableProducts: string[]
    mandatoryTests: string[]
    optionalTests: string[]

    // Status
    implementationStatus: 'compliant' | 'partial' | 'non_compliant' | 'pending'
    lastAudit: string
    nextAudit: string
    certificateExpiry?: string

    // Requirements
    requiredDocumentation: string[]
    trainingRequired: boolean
    equipmentRequirements: string[]
}

export default function QualityControl() {
    // Quality Control State
    const [selectedView, setSelectedView] = useState<'overview' | 'testing' | 'inspection' | 'defects' | 'compliance' | 'analytics'>('overview')
    const [selectedTest, setSelectedTest] = useState<string | null>(null)
    const [realTimeMode, setRealTimeMode] = useState(true)
    const [alertsFilter, setAlertsFilter] = useState<'all' | 'critical' | 'failed'>('critical')

    // Quality Tests Data
    const [qualityTests, setQualityTests] = useState<QualityTest[]>([
        {
            id: 'test-001',
            name: 'Dimensional Accuracy Check',
            type: 'dimensional',
            status: 'running',
            standard: 'ISO 2768-1',
            tolerance: 0.1,
            units: 'mm',
            criticalLevel: 'high',
            measured: 25.08,
            target: 25.0,
            deviation: 0.08,
            passRate: 96.7,
            duration: 15,
            startTime: '2025-08-09T09:30:00Z',
            inspector: 'Ioana Radu',
            equipment: 'CMM-001',
            sampleSize: 50,
            batchId: 'B20250809-003',
            productionLine: 'Assembly Line A'
        },
        {
            id: 'test-002',
            name: 'Surface Finish Inspection',
            type: 'visual',
            status: 'passed',
            standard: 'ISO 1302',
            tolerance: 1.6,
            units: 'Ra μm',
            criticalLevel: 'medium',
            measured: 1.2,
            target: 1.6,
            deviation: -0.4,
            passRate: 98.9,
            duration: 8,
            startTime: '2025-08-09T10:00:00Z',
            endTime: '2025-08-09T10:08:00Z',
            inspector: 'Marcel Dinu',
            equipment: 'Vision System V2',
            sampleSize: 100,
            batchId: 'B20250809-004',
            productionLine: 'Fabrication Line B'
        },
        {
            id: 'test-003',
            name: 'Electrical Continuity Test',
            type: 'electrical',
            status: 'failed',
            standard: 'IEC 61010-1',
            tolerance: 5.0,
            units: 'Ω',
            criticalLevel: 'critical',
            measured: 7.8,
            target: 5.0,
            deviation: 2.8,
            passRate: 78.4,
            duration: 12,
            startTime: '2025-08-09T08:45:00Z',
            endTime: '2025-08-09T08:57:00Z',
            inspector: 'Andrei Munteanu',
            equipment: 'Multimeter DMM-450',
            sampleSize: 25,
            batchId: 'B20250809-002',
            productionLine: 'Quality Control D'
        },
        {
            id: 'test-004',
            name: 'Thermal Stress Test',
            type: 'thermal',
            status: 'pending',
            standard: 'ASTM D648',
            tolerance: 10.0,
            units: '°C',
            criticalLevel: 'high',
            measured: 0,
            target: 85.0,
            deviation: 0,
            passRate: 0,
            duration: 45,
            startTime: '2025-08-09T11:00:00Z',
            inspector: 'Elena Vasile',
            equipment: 'Thermal Chamber TC-100',
            sampleSize: 20,
            batchId: 'B20250809-005',
            productionLine: 'Packaging Line C'
        }
    ])

    // Quality Metrics Data
    const [qualityMetrics] = useState<QualityMetric[]>([
        {
            id: 'metric-001',
            name: 'Overall Defect Rate',
            category: 'defect_rate',
            value: 2.3,
            target: 1.5,
            unit: '%',
            trend: 'down',
            trendPercentage: -15.2,
            period: 'daily',
            lastUpdated: '2025-08-09T10:30:00Z'
        },
        {
            id: 'metric-002',
            name: 'First Pass Yield',
            category: 'first_pass_yield',
            value: 94.7,
            target: 96.0,
            unit: '%',
            trend: 'up',
            trendPercentage: 3.1,
            period: 'daily',
            lastUpdated: '2025-08-09T10:30:00Z'
        },
        {
            id: 'metric-003',
            name: 'Customer Returns',
            category: 'customer_returns',
            value: 0.8,
            target: 0.5,
            unit: '%',
            trend: 'stable',
            trendPercentage: 0.1,
            period: 'monthly',
            lastUpdated: '2025-08-09T10:30:00Z'
        },
        {
            id: 'metric-004',
            name: 'Inspection Efficiency',
            category: 'inspection_efficiency',
            value: 87.4,
            target: 90.0,
            unit: '%',
            trend: 'up',
            trendPercentage: 5.8,
            period: 'weekly',
            lastUpdated: '2025-08-09T10:30:00Z'
        }
    ])

    // Defect Records Data
    const [defectRecords] = useState<DefectRecord[]>([
        {
            id: 'defect-001',
            type: 'dimensional',
            severity: 'major',
            description: 'Bore diameter out of tolerance (+0.15mm)',
            productionLine: 'Assembly Line A',
            station: 'Drilling Station 3',
            batch: 'B20250809-003',
            partNumber: 'PT-4567-A',
            detectedBy: 'automated',
            detectionMethod: 'CMM Measurement',
            detectionTime: '2025-08-09T09:45:00Z',
            status: 'investigating',
            quantity: 12,
            cost: 1450.00,
            customerImpact: false
        },
        {
            id: 'defect-002',
            type: 'surface',
            severity: 'minor',
            description: 'Surface scratch 2.3mm length',
            productionLine: 'Fabrication Line B',
            station: 'Polishing Station 1',
            batch: 'B20250809-004',
            partNumber: 'PT-8901-B',
            detectedBy: 'operator',
            detectionMethod: 'Visual Inspection',
            detectionTime: '2025-08-09T08:20:00Z',
            status: 'resolved',
            rootCause: 'Worn polishing pad',
            correctiveAction: 'Replaced polishing pad',
            preventiveAction: 'Implement 4-hour pad replacement schedule',
            resolvedBy: 'Marcel Dinu',
            resolvedTime: '2025-08-09T09:15:00Z',
            quantity: 3,
            cost: 85.00,
            customerImpact: false
        }
    ])

    // Inspection Points Data
    const [inspectionPoints] = useState<InspectionPoint[]>([
        {
            id: 'point-001',
            name: 'Incoming Material Inspection',
            location: 'Warehouse Dock A',
            type: 'incoming',
            frequency: 'batch',
            sampleRate: 10,
            automationLevel: 'semi_automated',
            status: 'active',
            lastInspection: '2025-08-09T08:00:00Z',
            nextInspection: '2025-08-09T12:00:00Z',
            inspector: 'Gabriel Neagu',
            throughput: 85,
            accuracy: 98.2,
            falsePositiveRate: 1.5,
            falseNegativeRate: 0.3,
            equipment: ['Scanner-001', 'Scale-Digital-02'],
            calibrationDue: '2025-08-15T00:00:00Z',
            maintenanceDue: '2025-08-20T00:00:00Z'
        },
        {
            id: 'point-002',
            name: 'Final Product Inspection',
            location: 'Quality Control D',
            type: 'final',
            frequency: 'continuous',
            sampleRate: 100,
            automationLevel: 'fully_automated',
            status: 'active',
            lastInspection: '2025-08-09T10:25:00Z',
            nextInspection: '2025-08-09T10:30:00Z',
            inspector: 'Automated System',
            throughput: 450,
            accuracy: 99.1,
            falsePositiveRate: 0.8,
            falseNegativeRate: 0.1,
            equipment: ['Vision-System-V2', 'CMM-001', 'Force-Tester-FT5'],
            calibrationDue: '2025-08-12T00:00:00Z',
            maintenanceDue: '2025-08-25T00:00:00Z'
        }
    ])

    // Real-time Updates Simulation
    useEffect(() => {
        if (realTimeMode) {
            const interval = setInterval(() => {
                setQualityTests(prev => prev.map(test => {
                    if (test.status === 'running') {
                        const newMeasured = test.measured + (Math.random() - 0.5) * 0.02
                        const newDeviation = Math.abs(newMeasured - test.target)
                        return {
                            ...test,
                            measured: Math.max(0, newMeasured),
                            deviation: newDeviation,
                            passRate: Math.max(70, Math.min(100, test.passRate + (Math.random() - 0.5) * 1))
                        }
                    }
                    return test
                }))
            }, 4000)

            return () => clearInterval(interval)
        }
    }, [realTimeMode])

    // Navigation tabs
    const navigationTabs = [
        { id: 'overview', label: 'Overview', icon: Eye },
        { id: 'testing', label: 'Testing', icon: TestTube },
        { id: 'inspection', label: 'Inspection', icon: Search },
        { id: 'defects', label: 'Defects', icon: AlertTriangle },
        { id: 'compliance', label: 'Compliance', icon: Shield },
        { id: 'analytics', label: 'Analytics', icon: BarChart3 }
    ]

    // Get status color and icon
    const getTestStatusInfo = (status: string) => {
        switch (status) {
            case 'running': return { color: 'text-blue-500 bg-blue-100', icon: Play, label: 'Running' }
            case 'passed': return { color: 'text-green-500 bg-green-100', icon: CheckCircle2, label: 'Passed' }
            case 'failed': return { color: 'text-red-500 bg-red-100', icon: XCircle, label: 'Failed' }
            case 'pending': return { color: 'text-yellow-500 bg-yellow-100', icon: Clock, label: 'Pending' }
            case 'cancelled': return { color: 'text-gray-500 bg-gray-100', icon: Circle, label: 'Cancelled' }
            default: return { color: 'text-gray-500 bg-gray-100', icon: Circle, label: 'Unknown' }
        }
    }

    // Get severity color
    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case 'critical': return 'text-red-600 bg-red-100 border-red-200'
            case 'major': return 'text-orange-600 bg-orange-100 border-orange-200'
            case 'minor': return 'text-yellow-600 bg-yellow-100 border-yellow-200'
            default: return 'text-gray-600 bg-gray-100 border-gray-200'
        }
    }

    // Calculate overall metrics
    const passedTests = qualityTests.filter(test => test.status === 'passed').length
    const failedTests = qualityTests.filter(test => test.status === 'failed').length
    const runningTests = qualityTests.filter(test => test.status === 'running').length
    const totalTests = qualityTests.length
    const passRate = totalTests > 0 ? (passedTests / totalTests) * 100 : 0

    const openDefects = defectRecords.filter(defect => defect.status === 'open' || defect.status === 'investigating').length
    const criticalDefects = defectRecords.filter(defect => defect.severity === 'critical').length

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
                                Quality Control
                            </h1>
                            <p className="text-gray-600 mt-2">Comprehensive quality assurance and testing management</p>
                        </div>

                        <div className="flex items-center space-x-4">
                            <div className="bg-white/80 backdrop-blur-sm rounded-lg px-4 py-2 border border-orange-200/50">
                                <div className="flex items-center space-x-2">
                                    <div className={`w-3 h-3 rounded-full ${realTimeMode ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
                                    <span className="text-sm font-medium text-gray-700">
                                        {realTimeMode ? 'Live Testing' : 'Static Data'}
                                    </span>
                                </div>
                            </div>

                            <button
                                onClick={() => setRealTimeMode(!realTimeMode)}
                                className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-2 rounded-lg hover:from-orange-600 hover:to-red-600 transition-colors"
                            >
                                <RotateCcw className={`w-4 h-4 ${realTimeMode ? 'animate-spin' : ''}`} />
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
                                        <h3 className="text-orange-800 font-semibold text-sm">Test Pass Rate</h3>
                                        <p className="text-3xl font-bold text-orange-900 mt-1">{passRate.toFixed(1)}%</p>
                                        <p className="text-sm text-gray-600 mt-1">
                                            {passedTests}/{totalTests} tests passed
                                        </p>
                                    </div>
                                    <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                                        <CheckCircle2 className="w-6 h-6 text-white" />
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-orange-200/50">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="text-orange-800 font-semibold text-sm">Active Tests</h3>
                                        <p className="text-3xl font-bold text-orange-900 mt-1">{runningTests}</p>
                                        <div className="flex items-center mt-1">
                                            <Activity className="w-4 h-4 text-blue-500" />
                                            <span className="text-sm text-blue-600 ml-1">Running now</span>
                                        </div>
                                    </div>
                                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                                        <TestTube className="w-6 h-6 text-white" />
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-orange-200/50">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="text-orange-800 font-semibold text-sm">Open Defects</h3>
                                        <p className="text-3xl font-bold text-orange-900 mt-1">{openDefects}</p>
                                        <p className="text-sm text-gray-600 mt-1">
                                            {criticalDefects} critical issues
                                        </p>
                                    </div>
                                    <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg flex items-center justify-center">
                                        <AlertTriangle className="w-6 h-6 text-white" />
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-orange-200/50">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="text-orange-800 font-semibold text-sm">Compliance Score</h3>
                                        <p className="text-3xl font-bold text-orange-900 mt-1">96.8%</p>
                                        <div className="flex items-center mt-1">
                                            <Shield className="w-4 h-4 text-green-500" />
                                            <span className="text-sm text-green-600 ml-1">Excellent</span>
                                        </div>
                                    </div>
                                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                                        <Award className="w-6 h-6 text-white" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Quality Metrics Dashboard */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Quality Metrics */}
                            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-orange-200/50">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quality Metrics</h3>
                                <div className="space-y-4">
                                    {qualityMetrics.map((metric, index) => (
                                        <motion.div
                                            key={metric.id}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.1 }}
                                            className="bg-gradient-to-br from-orange-50 to-red-50 rounded-lg p-4 border border-orange-200"
                                        >
                                            <div className="flex items-center justify-between mb-2">
                                                <h4 className="font-semibold text-gray-900">{metric.name}</h4>
                                                <div className={`flex items-center space-x-1 ${metric.trend === 'up' ? 'text-green-600' :
                                                        metric.trend === 'down' ? 'text-red-600' : 'text-gray-600'
                                                    }`}>
                                                    {metric.trend === 'up' && <TrendingUp className="w-4 h-4" />}
                                                    {metric.trend === 'down' && <TrendingDown className="w-4 h-4" />}
                                                    <span className="text-sm font-medium">
                                                        {metric.trend === 'stable' ? '±' : metric.trendPercentage > 0 ? '+' : ''}
                                                        {metric.trendPercentage.toFixed(1)}%
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-2xl font-bold text-gray-900">
                                                    {metric.value}{metric.unit}
                                                </span>
                                                <span className="text-sm text-gray-600">
                                                    Target: {metric.target}{metric.unit}
                                                </span>
                                            </div>

                                            <div className="w-full bg-gray-200 rounded-full h-2">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${Math.min(100, (metric.value / metric.target) * 100)}%` }}
                                                    transition={{ duration: 1, delay: index * 0.2 }}
                                                    className={`h-2 rounded-full ${metric.value >= metric.target ? 'bg-gradient-to-r from-green-400 to-green-600' :
                                                            metric.value >= metric.target * 0.8 ? 'bg-gradient-to-r from-yellow-400 to-yellow-600' :
                                                                'bg-gradient-to-r from-red-400 to-red-600'
                                                        }`}
                                                />
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>

                            {/* Recent Tests */}
                            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-orange-200/50">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Tests</h3>
                                <div className="space-y-3">
                                    {qualityTests.slice(0, 4).map((test, index) => {
                                        const statusInfo = getTestStatusInfo(test.status)
                                        const StatusIcon = statusInfo.icon
                                        return (
                                            <motion.div
                                                key={test.id}
                                                initial={{ opacity: 0, scale: 0.9 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                transition={{ delay: index * 0.1 }}
                                                className="bg-gradient-to-br from-orange-50 to-red-50 rounded-lg p-3 border border-orange-200 hover:shadow-md transition-shadow cursor-pointer"
                                                onClick={() => setSelectedTest(test.id)}
                                            >
                                                <div className="flex items-center justify-between mb-2">
                                                    <h4 className="font-medium text-gray-900 text-sm">{test.name}</h4>
                                                    <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}>
                                                        <StatusIcon className="w-3 h-3" />
                                                        <span>{statusInfo.label}</span>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-3 gap-2 text-xs">
                                                    <div>
                                                        <span className="text-gray-600">Pass Rate:</span>
                                                        <p className="font-semibold">{test.passRate.toFixed(1)}%</p>
                                                    </div>
                                                    <div>
                                                        <span className="text-gray-600">Deviation:</span>
                                                        <p className="font-semibold">{test.deviation.toFixed(2)}{test.units}</p>
                                                    </div>
                                                    <div>
                                                        <span className="text-gray-600">Inspector:</span>
                                                        <p className="font-semibold text-xs">{test.inspector.split(' ')[0]}</p>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )
                                    })}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Other views placeholder */}
                {(['testing', 'inspection', 'defects', 'compliance', 'analytics'].includes(selectedView)) && (
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
