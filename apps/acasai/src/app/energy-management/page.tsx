'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Zap,
    Battery,
    Sun,
    Wind,
    Droplets,
    Leaf,
    TrendingDown,
    TrendingUp,
    AlertTriangle,
    Settings,
    Calendar,
    DollarSign,
    Target,
    Lightbulb,
    Thermometer,
    Car,
    Tv,
    WashingMachine,
    Computer,
    RefreshCw,
    BarChart3,
    PieChart,
    LineChart,
    Activity,
    Power,
    Home,
    Clock,
    CheckCircle,
    XCircle,
    CircleDot,
    ArrowUpRight,
    ArrowDownRight,
    Plus,
    Filter,
    Download,
    Share2,
    MoreHorizontal,
    Maximize2,
    Minimize2,
    PlayCircle,
    PauseCircle,
    StopCircle,
    SkipForward,
    Save,
    Edit,
    Trash2,
    Info,
    Timer,
    Gauge,
    Plug,
    Grid3X3,
    Layers
} from 'lucide-react'

// Energy consumption interfaces
interface EnergyDevice {
    id: string
    name: string
    category: 'hvac' | 'lighting' | 'appliances' | 'electronics' | 'water_heating' | 'ev_charging' | 'security' | 'entertainment'
    currentPower: number // watts
    dailyUsage: number // kWh
    monthlyUsage: number // kWh
    cost: number // monthly cost in USD
    efficiency: number // percentage
    status: 'active' | 'standby' | 'scheduled' | 'offline'
    schedulable: boolean
    priority: 'critical' | 'high' | 'medium' | 'low'
    room: string
    lastUpdate: string
    peakHours: string[]
    energyRating: 'A++' | 'A+' | 'A' | 'B' | 'C' | 'D' | 'E'
    co2Impact: number // kg CO2 per month
    smartFeatures: string[]
    warranty: string
    nextMaintenance: string
}

interface EnergySource {
    id: string
    name: string
    type: 'solar' | 'wind' | 'grid' | 'battery' | 'generator'
    currentOutput: number // kW
    maxCapacity: number // kW
    efficiency: number // percentage
    status: 'online' | 'offline' | 'maintenance' | 'standby'
    dailyGeneration: number // kWh
    monthlyGeneration: number // kWh
    co2Savings: number // kg CO2 saved per month
    costSavings: number // USD saved per month
    batteryLevel?: number // percentage for battery
    weatherDependent: boolean
    gridConnection: boolean
    lastMaintenance: string
    warranty: string
    installation: string
}

interface EnergySchedule {
    id: string
    deviceId: string
    deviceName: string
    startTime: string
    endTime: string
    days: string[]
    power: number // watts
    priority: 'critical' | 'high' | 'medium' | 'low'
    enabled: boolean
    type: 'daily' | 'weekly' | 'custom'
    conditions: string[]
    savings: number // estimated USD savings per month
    co2Reduction: number // kg CO2 reduction per month
    autoAdjust: boolean
    weatherDependent: boolean
}

interface EnergyTariff {
    id: string
    name: string
    timeSlot: string
    rate: number // USD per kWh
    type: 'peak' | 'off_peak' | 'shoulder' | 'super_off_peak'
    hours: string[]
    demandCharge: number // USD per kW
    seasonalAdjustment: number // percentage
    renewable: boolean
}

interface EnergyGoal {
    id: string
    name: string
    target: number
    current: number
    unit: 'kWh' | 'USD' | 'kg_co2'
    timeframe: 'daily' | 'weekly' | 'monthly' | 'yearly'
    progress: number // percentage
    deadline: string
    category: 'consumption' | 'savings' | 'generation' | 'efficiency'
    priority: 'high' | 'medium' | 'low'
    description: string
    rewards: string[]
}

interface EnergyAlert {
    id: string
    type: 'high_usage' | 'cost_spike' | 'outage' | 'maintenance' | 'efficiency' | 'goal'
    severity: 'critical' | 'high' | 'medium' | 'low'
    title: string
    message: string
    device?: string
    timestamp: string
    resolved: boolean
    action?: string
    estimatedImpact: string
    resolution?: string
}

const EnergyManagementPage = () => {
    const [activeTab, setActiveTab] = useState('overview')
    const [selectedTimeRange, setSelectedTimeRange] = useState('today')
    const [isAdvancedView, setIsAdvancedView] = useState(false)
    const [isAutoOptimization, setIsAutoOptimization] = useState(true)
    const [selectedDevice, setSelectedDevice] = useState<string | null>(null)
    const [showScheduler, setShowScheduler] = useState(false)
    const [showGoalEditor, setShowGoalEditor] = useState(false)

    // Mock data - simulating real-time energy data
    const [energyMetrics, setEnergyMetrics] = useState({
        currentConsumption: 3.8, // kW
        dailyUsage: 28.5, // kWh
        monthlyUsage: 645, // kWh
        currentCost: 0.45, // USD per hour
        monthlyCost: 158.75, // USD
        efficiency: 87, // percentage
        peakDemand: 5.2, // kW
        co2Footprint: 324, // kg CO2 per month
        gridDependency: 62, // percentage
        renewableShare: 38, // percentage
        savings: 85.20, // USD saved this month
        co2Avoided: 156, // kg CO2 avoided this month
    })

    const [energyDevices, setEnergyDevices] = useState<EnergyDevice[]>([
        {
            id: '1',
            name: 'Central HVAC System',
            category: 'hvac',
            currentPower: 2800,
            dailyUsage: 18.5,
            monthlyUsage: 425,
            cost: 104.50,
            efficiency: 85,
            status: 'active',
            schedulable: true,
            priority: 'critical',
            room: 'Whole House',
            lastUpdate: '2 minutes ago',
            peakHours: ['14:00-16:00', '19:00-21:00'],
            energyRating: 'A+',
            co2Impact: 212,
            smartFeatures: ['Smart Thermostat', 'Zone Control', 'Auto-Schedule'],
            warranty: '5 years remaining',
            nextMaintenance: '2025-09-15'
        },
        {
            id: '2',
            name: 'LED Lighting System',
            category: 'lighting',
            currentPower: 240,
            dailyUsage: 3.2,
            monthlyUsage: 72,
            cost: 17.65,
            efficiency: 95,
            status: 'active',
            schedulable: true,
            priority: 'high',
            room: 'All Rooms',
            lastUpdate: '1 minute ago',
            peakHours: ['18:00-23:00'],
            energyRating: 'A++',
            co2Impact: 36,
            smartFeatures: ['Motion Sensors', 'Dimming', 'Color Control'],
            warranty: '3 years remaining',
            nextMaintenance: '2025-10-01'
        },
        {
            id: '3',
            name: 'Kitchen Appliances',
            category: 'appliances',
            currentPower: 1200,
            dailyUsage: 4.8,
            monthlyUsage: 108,
            cost: 26.55,
            efficiency: 78,
            status: 'standby',
            schedulable: true,
            priority: 'medium',
            room: 'Kitchen',
            lastUpdate: '5 minutes ago',
            peakHours: ['07:00-09:00', '17:00-19:00'],
            energyRating: 'A',
            co2Impact: 54,
            smartFeatures: ['Load Sensing', 'Eco Mode', 'Remote Control'],
            warranty: '2 years remaining',
            nextMaintenance: '2025-08-20'
        },
        {
            id: '4',
            name: 'Home Entertainment',
            category: 'electronics',
            currentPower: 350,
            dailyUsage: 5.2,
            monthlyUsage: 118,
            cost: 29.05,
            efficiency: 82,
            status: 'active',
            schedulable: true,
            priority: 'low',
            room: 'Living Room',
            lastUpdate: '3 minutes ago',
            peakHours: ['19:00-23:00'],
            energyRating: 'A+',
            co2Impact: 59,
            smartFeatures: ['Auto Standby', 'Energy Mode', 'Smart Scheduling'],
            warranty: '1 year remaining',
            nextMaintenance: '2025-09-30'
        },
        {
            id: '5',
            name: 'Water Heating System',
            category: 'water_heating',
            currentPower: 0,
            dailyUsage: 6.8,
            monthlyUsage: 152,
            cost: 37.35,
            efficiency: 88,
            status: 'scheduled',
            schedulable: true,
            priority: 'high',
            room: 'Utility Room',
            lastUpdate: '10 minutes ago',
            peakHours: ['06:00-08:00', '20:00-22:00'],
            energyRating: 'A',
            co2Impact: 76,
            smartFeatures: ['Smart Timer', 'Temperature Control', 'Leak Detection'],
            warranty: '4 years remaining',
            nextMaintenance: '2025-11-15'
        },
        {
            id: '6',
            name: 'EV Charging Station',
            category: 'ev_charging',
            currentPower: 7200,
            dailyUsage: 12.5,
            monthlyUsage: 280,
            cost: 68.85,
            efficiency: 92,
            status: 'active',
            schedulable: true,
            priority: 'medium',
            room: 'Garage',
            lastUpdate: '30 seconds ago',
            peakHours: ['22:00-06:00'],
            energyRating: 'A++',
            co2Impact: 0, // Electric vehicle
            smartFeatures: ['Smart Charging', 'Solar Integration', 'Load Balancing'],
            warranty: '8 years remaining',
            nextMaintenance: '2025-12-01'
        }
    ])

    const [energySources, setEnergySources] = useState<EnergySource[]>([
        {
            id: '1',
            name: 'Solar Panel Array',
            type: 'solar',
            currentOutput: 4.2,
            maxCapacity: 8.5,
            efficiency: 92,
            status: 'online',
            dailyGeneration: 32.8,
            monthlyGeneration: 745,
            co2Savings: 372,
            costSavings: 183.25,
            weatherDependent: true,
            gridConnection: true,
            lastMaintenance: '2024-12-15',
            warranty: '20 years remaining',
            installation: '2020-03-15'
        },
        {
            id: '2',
            name: 'Home Battery System',
            type: 'battery',
            currentOutput: 2.1,
            maxCapacity: 13.5,
            efficiency: 95,
            status: 'online',
            dailyGeneration: 8.2,
            monthlyGeneration: 186,
            co2Savings: 93,
            costSavings: 45.75,
            batteryLevel: 78,
            weatherDependent: false,
            gridConnection: true,
            lastMaintenance: '2025-01-10',
            warranty: '10 years remaining',
            installation: '2021-06-20'
        },
        {
            id: '3',
            name: 'Grid Connection',
            type: 'grid',
            currentOutput: 1.8,
            maxCapacity: 15.0,
            efficiency: 98,
            status: 'online',
            dailyGeneration: 18.5,
            monthlyGeneration: 420,
            co2Savings: 0,
            costSavings: 0,
            weatherDependent: false,
            gridConnection: true,
            lastMaintenance: 'N/A',
            warranty: 'Utility Provider',
            installation: 'N/A'
        }
    ])

    const [energySchedules, setEnergySchedules] = useState<EnergySchedule[]>([
        {
            id: '1',
            deviceId: '1',
            deviceName: 'Central HVAC System',
            startTime: '22:00',
            endTime: '06:00',
            days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
            power: 1800,
            priority: 'critical',
            enabled: true,
            type: 'weekly',
            conditions: ['Temperature < 20°C', 'Occupancy Detected'],
            savings: 35.20,
            co2Reduction: 70,
            autoAdjust: true,
            weatherDependent: true
        },
        {
            id: '2',
            deviceId: '6',
            deviceName: 'EV Charging Station',
            startTime: '23:00',
            endTime: '05:00',
            days: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
            power: 7200,
            priority: 'medium',
            enabled: true,
            type: 'daily',
            conditions: ['Off-Peak Rates', 'Battery < 80%'],
            savings: 28.50,
            co2Reduction: 45,
            autoAdjust: true,
            weatherDependent: false
        },
        {
            id: '3',
            deviceId: '5',
            deviceName: 'Water Heating System',
            startTime: '05:30',
            endTime: '07:30',
            days: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
            power: 3000,
            priority: 'high',
            enabled: true,
            type: 'daily',
            conditions: ['Hot Water Demand', 'Off-Peak Rates'],
            savings: 15.75,
            co2Reduction: 25,
            autoAdjust: false,
            weatherDependent: false
        }
    ])

    const [energyGoals, setEnergyGoals] = useState<EnergyGoal[]>([
        {
            id: '1',
            name: 'Reduce Monthly Consumption',
            target: 550,
            current: 645,
            unit: 'kWh',
            timeframe: 'monthly',
            progress: 15,
            deadline: '2025-08-31',
            category: 'consumption',
            priority: 'high',
            description: 'Reduce total monthly energy consumption by 15%',
            rewards: ['$25 credit', 'Green badge', 'Tree planting']
        },
        {
            id: '2',
            name: 'Increase Solar Generation',
            target: 800,
            current: 745,
            unit: 'kWh',
            timeframe: 'monthly',
            progress: 93,
            deadline: '2025-08-31',
            category: 'generation',
            priority: 'medium',
            description: 'Achieve 800 kWh monthly solar generation',
            rewards: ['Solar champion badge', 'Priority support']
        },
        {
            id: '3',
            name: 'Carbon Footprint Reduction',
            target: 250,
            current: 324,
            unit: 'kg_co2',
            timeframe: 'monthly',
            progress: 23,
            deadline: '2025-09-30',
            category: 'efficiency',
            priority: 'high',
            description: 'Reduce monthly carbon footprint by 30%',
            rewards: ['Carbon neutral status', 'Environmental award']
        }
    ])

    const [energyAlerts, setEnergyAlerts] = useState<EnergyAlert[]>([
        {
            id: '1',
            type: 'high_usage',
            severity: 'high',
            title: 'High Energy Consumption',
            message: 'Current consumption is 25% above average for this time',
            device: 'EV Charging Station',
            timestamp: '5 minutes ago',
            resolved: false,
            action: 'Schedule charging for off-peak hours',
            estimatedImpact: '$15 additional cost today',
            resolution: undefined
        },
        {
            id: '2',
            type: 'efficiency',
            severity: 'medium',
            title: 'HVAC Efficiency Alert',
            message: 'System efficiency has dropped to 85% - maintenance recommended',
            device: 'Central HVAC System',
            timestamp: '2 hours ago',
            resolved: false,
            action: 'Schedule maintenance check',
            estimatedImpact: '$8 extra cost per day'
        }
    ])

    // Real-time updates simulation
    useEffect(() => {
        const interval = setInterval(() => {
            setEnergyMetrics(prev => ({
                ...prev,
                currentConsumption: parseFloat((prev.currentConsumption + (Math.random() - 0.5) * 0.2).toFixed(1)),
                efficiency: Math.min(100, Math.max(70, prev.efficiency + (Math.random() - 0.5) * 2)),
                renewableShare: Math.min(100, Math.max(0, prev.renewableShare + (Math.random() - 0.5) * 1))
            }))

            setEnergySources(prev => prev.map(source => ({
                ...source,
                currentOutput: source.type === 'solar'
                    ? Math.max(0, parseFloat((source.currentOutput + (Math.random() - 0.5) * 0.3).toFixed(1)))
                    : parseFloat((source.currentOutput + (Math.random() - 0.5) * 0.1).toFixed(1)),
                efficiency: Math.min(100, Math.max(80, source.efficiency + (Math.random() - 0.5) * 1))
            })))
        }, 3000)

        return () => clearInterval(interval)
    }, [])

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active':
            case 'online':
                return 'text-green-600 bg-green-100 border-green-200'
            case 'standby':
                return 'text-yellow-600 bg-yellow-100 border-yellow-200'
            case 'scheduled':
                return 'text-blue-600 bg-blue-100 border-blue-200'
            case 'offline':
            case 'maintenance':
                return 'text-red-600 bg-red-100 border-red-200'
            default:
                return 'text-gray-600 bg-gray-100 border-gray-200'
        }
    }

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'critical':
                return 'text-red-600 bg-red-50 border-red-200'
            case 'high':
                return 'text-orange-600 bg-orange-50 border-orange-200'
            case 'medium':
                return 'text-yellow-600 bg-yellow-50 border-yellow-200'
            case 'low':
                return 'text-green-600 bg-green-50 border-green-200'
            default:
                return 'text-gray-600 bg-gray-50 border-gray-200'
        }
    }

    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case 'critical':
                return 'text-red-600 bg-red-100 border-red-200'
            case 'high':
                return 'text-orange-600 bg-orange-100 border-orange-200'
            case 'medium':
                return 'text-yellow-600 bg-yellow-100 border-yellow-200'
            case 'low':
                return 'text-blue-600 bg-blue-100 border-blue-200'
            default:
                return 'text-gray-600 bg-gray-100 border-gray-200'
        }
    }

    const getCategoryIcon = (category: string) => {
        switch (category) {
            case 'hvac': return <Thermometer className="w-5 h-5" />
            case 'lighting': return <Lightbulb className="w-5 h-5" />
            case 'appliances': return <WashingMachine className="w-5 h-5" />
            case 'electronics': return <Computer className="w-5 h-5" />
            case 'water_heating': return <Droplets className="w-5 h-5" />
            case 'ev_charging': return <Car className="w-5 h-5" />
            case 'security': return <Home className="w-5 h-5" />
            case 'entertainment': return <Tv className="w-5 h-5" />
            default: return <Plug className="w-5 h-5" />
        }
    }

    const getSourceIcon = (type: string) => {
        switch (type) {
            case 'solar': return <Sun className="w-5 h-5" />
            case 'wind': return <Wind className="w-5 h-5" />
            case 'battery': return <Battery className="w-5 h-5" />
            case 'grid': return <Grid3X3 className="w-5 h-5" />
            case 'generator': return <Zap className="w-5 h-5" />
            default: return <Power className="w-5 h-5" />
        }
    }

    const totalGeneration = energySources.reduce((sum, source) => sum + source.currentOutput, 0)
    const netConsumption = energyMetrics.currentConsumption - totalGeneration

    const tabs = [
        { id: 'overview', label: 'Energy Overview', icon: <BarChart3 className="w-4 h-4" /> },
        { id: 'devices', label: 'Device Management', icon: <Plug className="w-4 h-4" /> },
        { id: 'sources', label: 'Energy Sources', icon: <Sun className="w-4 h-4" /> },
        { id: 'schedule', label: 'Smart Scheduling', icon: <Calendar className="w-4 h-4" /> },
        { id: 'analytics', label: 'Analytics & Reports', icon: <LineChart className="w-4 h-4" /> },
        { id: 'goals', label: 'Energy Goals', icon: <Target className="w-4 h-4" /> }
    ]

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50">
            {/* Enhanced Header */}
            <div className="bg-white/80 backdrop-blur-sm border-b border-blue-200 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-3">
                                <div className="p-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl">
                                    <Zap className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-xl font-bold text-gray-900">Energy Management</h1>
                                    <p className="text-sm text-gray-600">Smart energy optimization and monitoring</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center space-x-4">
                            <div className="hidden md:flex items-center space-x-6 text-sm">
                                <div className="text-center">
                                    <p className="text-gray-500">Current Load</p>
                                    <p className="font-semibold text-gray-900">{energyMetrics.currentConsumption} kW</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-gray-500">Generation</p>
                                    <p className="font-semibold text-green-600">{totalGeneration.toFixed(1)} kW</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-gray-500">Net Balance</p>
                                    <p className={`font-semibold ${netConsumption > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                        {netConsumption > 0 ? '+' : ''}{netConsumption.toFixed(1)} kW
                                    </p>
                                </div>
                                <div className="text-center">
                                    <p className="text-gray-500">Efficiency</p>
                                    <p className="font-semibold text-blue-600">{energyMetrics.efficiency}%</p>
                                </div>
                            </div>

                            <div className="flex items-center space-x-2">
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => setIsAutoOptimization(!isAutoOptimization)}
                                    className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${isAutoOptimization
                                            ? 'bg-green-100 text-green-700 border-green-200'
                                            : 'bg-gray-100 text-gray-700 border-gray-200'
                                        }`}
                                >
                                    <div className="flex items-center space-x-2">
                                        <Activity className="w-4 h-4" />
                                        <span>Auto Optimize</span>
                                    </div>
                                </motion.button>

                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="p-2 text-gray-600 hover:text-gray-900 border border-gray-200 rounded-lg hover:bg-gray-50"
                                >
                                    <Share2 className="w-4 h-4" />
                                </motion.button>

                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="p-2 text-gray-600 hover:text-gray-900 border border-gray-200 rounded-lg hover:bg-gray-50"
                                >
                                    <Download className="w-4 h-4" />
                                </motion.button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="bg-white/60 backdrop-blur-sm border-b border-blue-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex space-x-8 overflow-x-auto">
                        {tabs.map((tab) => (
                            <motion.button
                                key={tab.id}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center space-x-2 px-4 py-3 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${activeTab === tab.id
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                            >
                                {tab.icon}
                                <span>{tab.label}</span>
                            </motion.button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <AnimatePresence mode="wait">
                    {/* Energy Overview Tab */}
                    {activeTab === 'overview' && (
                        <motion.div
                            key="overview"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3 }}
                            className="space-y-6"
                        >
                            {/* Quick Stats Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                <motion.div
                                    whileHover={{ scale: 1.02 }}
                                    className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-blue-200"
                                >
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-gray-600">Current Consumption</p>
                                            <p className="text-2xl font-bold text-gray-900">{energyMetrics.currentConsumption} kW</p>
                                            <p className="text-sm text-green-600 flex items-center">
                                                <TrendingDown className="w-4 h-4 mr-1" />
                                                12% below peak
                                            </p>
                                        </div>
                                        <div className="p-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl">
                                            <Zap className="w-6 h-6 text-white" />
                                        </div>
                                    </div>
                                </motion.div>

                                <motion.div
                                    whileHover={{ scale: 1.02 }}
                                    className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-green-200"
                                >
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-gray-600">Daily Generation</p>
                                            <p className="text-2xl font-bold text-gray-900">{energySources.reduce((sum, s) => sum + s.dailyGeneration, 0).toFixed(1)} kWh</p>
                                            <p className="text-sm text-green-600 flex items-center">
                                                <TrendingUp className="w-4 h-4 mr-1" />
                                                8% above average
                                            </p>
                                        </div>
                                        <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl">
                                            <Sun className="w-6 h-6 text-white" />
                                        </div>
                                    </div>
                                </motion.div>

                                <motion.div
                                    whileHover={{ scale: 1.02 }}
                                    className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-yellow-200"
                                >
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-gray-600">Monthly Cost</p>
                                            <p className="text-2xl font-bold text-gray-900">${energyMetrics.monthlyCost}</p>
                                            <p className="text-sm text-green-600 flex items-center">
                                                <TrendingDown className="w-4 h-4 mr-1" />
                                                ${energyMetrics.savings} saved
                                            </p>
                                        </div>
                                        <div className="p-3 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl">
                                            <DollarSign className="w-6 h-6 text-white" />
                                        </div>
                                    </div>
                                </motion.div>

                                <motion.div
                                    whileHover={{ scale: 1.02 }}
                                    className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-emerald-200"
                                >
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-gray-600">CO₂ Footprint</p>
                                            <p className="text-2xl font-bold text-gray-900">{energyMetrics.co2Footprint} kg</p>
                                            <p className="text-sm text-green-600 flex items-center">
                                                <TrendingDown className="w-4 h-4 mr-1" />
                                                {energyMetrics.co2Avoided} kg avoided
                                            </p>
                                        </div>
                                        <div className="p-3 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl">
                                            <Leaf className="w-6 h-6 text-white" />
                                        </div>
                                    </div>
                                </motion.div>
                            </div>

                            {/* Energy Flow Visualization */}
                            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-blue-200">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-lg font-semibold text-gray-900">Energy Flow</h3>
                                    <div className="flex items-center space-x-2">
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => setIsAdvancedView(!isAdvancedView)}
                                            className="px-3 py-1 text-sm text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50"
                                        >
                                            {isAdvancedView ? 'Simple View' : 'Advanced View'}
                                        </motion.button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                    {/* Generation Sources */}
                                    <div className="space-y-4">
                                        <h4 className="font-medium text-gray-900 flex items-center">
                                            <Sun className="w-5 h-5 mr-2 text-yellow-500" />
                                            Generation Sources
                                        </h4>
                                        {energySources.map((source) => (
                                            <motion.div
                                                key={source.id}
                                                whileHover={{ scale: 1.02 }}
                                                className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200"
                                            >
                                                <div className="flex items-center justify-between mb-2">
                                                    <div className="flex items-center space-x-2">
                                                        {getSourceIcon(source.type)}
                                                        <span className="font-medium text-gray-900">{source.name}</span>
                                                    </div>
                                                    <span className={`px-2 py-1 text-xs rounded-full border ${getStatusColor(source.status)}`}>
                                                        {source.status}
                                                    </span>
                                                </div>
                                                <div className="space-y-2">
                                                    <div className="flex justify-between text-sm">
                                                        <span className="text-gray-600">Output</span>
                                                        <span className="font-medium text-gray-900">{source.currentOutput} kW</span>
                                                    </div>
                                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                                        <div
                                                            className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all duration-300"
                                                            style={{ width: `${(source.currentOutput / source.maxCapacity) * 100}%` }}
                                                        />
                                                    </div>
                                                    {isAdvancedView && (
                                                        <div className="space-y-1 text-xs text-gray-500">
                                                            <div className="flex justify-between">
                                                                <span>Efficiency</span>
                                                                <span>{source.efficiency}%</span>
                                                            </div>
                                                            <div className="flex justify-between">
                                                                <span>Daily Gen</span>
                                                                <span>{source.dailyGeneration} kWh</span>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>

                                    {/* Energy Balance */}
                                    <div className="space-y-4">
                                        <h4 className="font-medium text-gray-900 flex items-center">
                                            <Activity className="w-5 h-5 mr-2 text-blue-500" />
                                            Energy Balance
                                        </h4>
                                        <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg border border-blue-200">
                                            <div className="text-center space-y-4">
                                                <div>
                                                    <p className="text-sm text-gray-600">Net Energy Flow</p>
                                                    <p className={`text-3xl font-bold ${netConsumption > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                                        {netConsumption > 0 ? '+' : ''}{netConsumption.toFixed(1)} kW
                                                    </p>
                                                    <p className="text-sm text-gray-500">
                                                        {netConsumption > 0 ? 'Consuming from grid' : 'Feeding to grid'}
                                                    </p>
                                                </div>
                                                <div className="space-y-2">
                                                    <div className="flex justify-between text-sm">
                                                        <span className="text-gray-600">Total Generation</span>
                                                        <span className="font-medium text-green-600">{totalGeneration.toFixed(1)} kW</span>
                                                    </div>
                                                    <div className="flex justify-between text-sm">
                                                        <span className="text-gray-600">Total Consumption</span>
                                                        <span className="font-medium text-blue-600">{energyMetrics.currentConsumption} kW</span>
                                                    </div>
                                                    <div className="h-px bg-gray-300 my-2" />
                                                    <div className="flex justify-between text-sm font-medium">
                                                        <span className="text-gray-900">Net Balance</span>
                                                        <span className={netConsumption > 0 ? 'text-red-600' : 'text-green-600'}>
                                                            {netConsumption > 0 ? '+' : ''}{netConsumption.toFixed(1)} kW
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Renewable Energy Share */}
                                        <div className="p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg border border-emerald-200">
                                            <h5 className="font-medium text-gray-900 mb-3">Renewable Energy Share</h5>
                                            <div className="space-y-2">
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-gray-600">Renewable</span>
                                                    <span className="font-medium text-emerald-600">{energyMetrics.renewableShare}%</span>
                                                </div>
                                                <div className="w-full bg-gray-200 rounded-full h-3">
                                                    <div
                                                        className="bg-gradient-to-r from-emerald-500 to-teal-500 h-3 rounded-full transition-all duration-300"
                                                        style={{ width: `${energyMetrics.renewableShare}%` }}
                                                    />
                                                </div>
                                                <p className="text-xs text-gray-500">Target: 50% renewable by 2025</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Consumption Breakdown */}
                                    <div className="space-y-4">
                                        <h4 className="font-medium text-gray-900 flex items-center">
                                            <PieChart className="w-5 h-5 mr-2 text-purple-500" />
                                            Consumption Breakdown
                                        </h4>
                                        {energyDevices.slice(0, 4).map((device) => (
                                            <motion.div
                                                key={device.id}
                                                whileHover={{ scale: 1.02 }}
                                                className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200"
                                            >
                                                <div className="flex items-center justify-between mb-2">
                                                    <div className="flex items-center space-x-2">
                                                        {getCategoryIcon(device.category)}
                                                        <span className="font-medium text-gray-900">{device.name}</span>
                                                    </div>
                                                    <span className={`px-2 py-1 text-xs rounded-full border ${getStatusColor(device.status)}`}>
                                                        {device.status}
                                                    </span>
                                                </div>
                                                <div className="space-y-2">
                                                    <div className="flex justify-between text-sm">
                                                        <span className="text-gray-600">Power</span>
                                                        <span className="font-medium text-gray-900">{device.currentPower} W</span>
                                                    </div>
                                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                                        <div
                                                            className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300"
                                                            style={{ width: `${(device.currentPower / 3000) * 100}%` }}
                                                        />
                                                    </div>
                                                    {isAdvancedView && (
                                                        <div className="space-y-1 text-xs text-gray-500">
                                                            <div className="flex justify-between">
                                                                <span>Daily Usage</span>
                                                                <span>{device.dailyUsage} kWh</span>
                                                            </div>
                                                            <div className="flex justify-between">
                                                                <span>Efficiency</span>
                                                                <span>{device.efficiency}%</span>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Recent Alerts */}
                            {energyAlerts.length > 0 && (
                                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-orange-200">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                        <AlertTriangle className="w-5 h-5 mr-2 text-orange-500" />
                                        Energy Alerts
                                    </h3>
                                    <div className="space-y-3">
                                        {energyAlerts.slice(0, 3).map((alert) => (
                                            <motion.div
                                                key={alert.id}
                                                whileHover={{ scale: 1.01 }}
                                                className={`p-4 rounded-lg border ${getSeverityColor(alert.severity)}`}
                                            >
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <h4 className="font-medium text-gray-900">{alert.title}</h4>
                                                        <p className="text-sm text-gray-600 mt-1">{alert.message}</p>
                                                        {alert.action && (
                                                            <p className="text-sm text-blue-600 mt-2 font-medium">{alert.action}</p>
                                                        )}
                                                    </div>
                                                    <div className="ml-4 text-right">
                                                        <p className="text-xs text-gray-500">{alert.timestamp}</p>
                                                        {alert.estimatedImpact && (
                                                            <p className="text-xs text-red-600 mt-1">{alert.estimatedImpact}</p>
                                                        )}
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    )}

                    {/* Other tabs content would go here */}
                    {activeTab !== 'overview' && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3 }}
                            className="flex items-center justify-center h-64"
                        >
                            <div className="text-center">
                                <div className="p-4 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full inline-block mb-4">
                                    <Settings className="w-8 h-8 text-white" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                    {tabs.find(tab => tab.id === activeTab)?.label}
                                </h3>
                                <p className="text-gray-600">
                                    This section is being implemented with comprehensive energy management features.
                                </p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    )
}

export default EnergyManagementPage
