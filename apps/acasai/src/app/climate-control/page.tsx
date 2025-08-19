'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Thermometer,
    Wind,
    Droplets,
    Sun,
    Snowflake,
    Leaf,
    Gauge,
    TrendingUp,
    TrendingDown,
    Clock,
    Calendar,
    Settings,
    Power,
    Wifi,
    Battery,
    AlertTriangle,
    CheckCircle,
    Target,
    BarChart3,
    PieChart,
    LineChart,
    Activity,
    Home,
    Zap,
    Pause,
    Play,
    SkipForward,
    RotateCcw,
    Plus,
    Minus,
    RefreshCw,
    Download,
    Share2,
    Filter,
    MoreHorizontal,
    Maximize2,
    Minimize2,
    Edit,
    Save,
    X,
    Timer,
    MapPin,
    Users,
    Moon,
    CloudRain,
    CloudSnow,
    Flame,
    Fan,
    ArrowUp,
    ArrowDown,
    Layers,
    Grid3X3,
    CircleDot,
    Square,
    Circle,
    Info,
    Eye,
    EyeOff
} from 'lucide-react'

// Climate control interfaces
interface ClimateZone {
    id: string
    name: string
    room: string
    currentTemp: number
    targetTemp: number
    humidity: number
    targetHumidity: number
    airQuality: number
    occupancy: boolean
    occupants: number
    mode: 'heat' | 'cool' | 'auto' | 'off' | 'eco' | 'fan_only'
    fanSpeed: 'auto' | 'low' | 'medium' | 'high' | 'max'
    schedule: boolean
    priority: 'critical' | 'high' | 'medium' | 'low'
    sensors: string[]
    hvacSystem: string
    lastUpdate: string
    energyUsage: number // kWh today
    efficiency: number // percentage
    status: 'online' | 'offline' | 'maintenance' | 'error'
    smartFeatures: string[]
    geofencing: boolean
    weatherAdaptive: boolean
}

interface HVACSystem {
    id: string
    name: string
    type: 'central_air' | 'heat_pump' | 'mini_split' | 'radiant' | 'baseboard' | 'window_unit'
    zones: string[]
    currentOutput: number // percentage
    energyRating: 'A++' | 'A+' | 'A' | 'B' | 'C' | 'D' | 'E'
    efficiency: number // percentage
    status: 'running' | 'idle' | 'maintenance' | 'error' | 'offline'
    mode: 'heating' | 'cooling' | 'fan_only' | 'auto' | 'off'
    powerConsumption: number // watts
    dailyUsage: number // kWh
    monthlyCost: number // USD
    co2Impact: number // kg CO2 per month
    installDate: string
    lastMaintenance: string
    nextMaintenance: string
    warranty: string
    filterStatus: 'good' | 'replace_soon' | 'replace_now'
    refrigerantLevel: number // percentage
    airflow: number // CFM
    noiseLevel: number // dB
}

interface ClimateSchedule {
    id: string
    name: string
    zoneId: string
    zoneName: string
    days: string[]
    timeSlots: Array<{
        startTime: string
        endTime: string
        targetTemp: number
        humidity: number
        mode: string
        fanSpeed: string
    }>
    enabled: boolean
    type: 'comfort' | 'energy_saving' | 'sleep' | 'away' | 'custom'
    adaptiveTemp: boolean
    weatherDependent: boolean
    occupancyBased: boolean
    estimatedSavings: number // USD per month
    co2Reduction: number // kg CO2 per month
    priority: number // 1-10
    geofenceRadius: number // meters
    conditions: string[]
}

interface ClimateAlert {
    id: string
    type: 'temperature' | 'humidity' | 'air_quality' | 'maintenance' | 'energy' | 'filter'
    severity: 'critical' | 'high' | 'medium' | 'low'
    zone?: string
    system?: string
    title: string
    message: string
    timestamp: string
    resolved: boolean
    action?: string
    estimatedImpact?: string
    autoResolution?: boolean
}

interface WeatherData {
    current: {
        temperature: number
        humidity: number
        windSpeed: number
        condition: string
        icon: string
    }
    forecast: Array<{
        day: string
        high: number
        low: number
        condition: string
        icon: string
        humidity: number
    }>
    airQuality: {
        aqi: number
        level: string
        pollutants: Record<string, number>
    }
}

const ClimateControlPage = () => {
    const [activeTab, setActiveTab] = useState('overview')
    const [selectedZone, setSelectedZone] = useState<string | null>(null)
    const [selectedSystem, setSelectedSystem] = useState<string | null>(null)
    const [showScheduleEditor, setShowScheduleEditor] = useState(false)
    const [isGlobalControl, setIsGlobalControl] = useState(false)
    const [masterMode, setMasterMode] = useState<'auto' | 'heat' | 'cool' | 'off'>('auto')

    // Mock data - simulating real-time climate data
    const [climateZones, setClimateZones] = useState<ClimateZone[]>([
        {
            id: '1',
            name: 'Living Room',
            room: 'Living Room',
            currentTemp: 22.5,
            targetTemp: 23.0,
            humidity: 45,
            targetHumidity: 50,
            airQuality: 85,
            occupancy: true,
            occupants: 3,
            mode: 'auto',
            fanSpeed: 'medium',
            schedule: true,
            priority: 'high',
            sensors: ['Temperature', 'Humidity', 'Motion', 'Air Quality'],
            hvacSystem: 'Central Air',
            lastUpdate: '2 minutes ago',
            energyUsage: 8.5,
            efficiency: 92,
            status: 'online',
            smartFeatures: ['Occupancy Sensing', 'Weather Adaptive', 'Learning Algorithm'],
            geofencing: true,
            weatherAdaptive: true
        },
        {
            id: '2',
            name: 'Master Bedroom',
            room: 'Master Bedroom',
            currentTemp: 21.8,
            targetTemp: 22.0,
            humidity: 48,
            targetHumidity: 45,
            airQuality: 88,
            occupancy: false,
            occupants: 0,
            mode: 'eco',
            fanSpeed: 'low',
            schedule: true,
            priority: 'high',
            sensors: ['Temperature', 'Humidity', 'Motion', 'Sleep Quality'],
            hvacSystem: 'Mini Split',
            lastUpdate: '1 minute ago',
            energyUsage: 3.2,
            efficiency: 88,
            status: 'online',
            smartFeatures: ['Sleep Mode', 'Noise Reduction', 'Air Purification'],
            geofencing: false,
            weatherAdaptive: true
        },
        {
            id: '3',
            name: 'Kitchen',
            room: 'Kitchen',
            currentTemp: 24.2,
            targetTemp: 23.5,
            humidity: 52,
            targetHumidity: 50,
            airQuality: 78,
            occupancy: true,
            occupants: 1,
            mode: 'cool',
            fanSpeed: 'high',
            schedule: false,
            priority: 'medium',
            sensors: ['Temperature', 'Humidity', 'Motion', 'Cooking Detection'],
            hvacSystem: 'Central Air',
            lastUpdate: '3 minutes ago',
            energyUsage: 12.8,
            efficiency: 85,
            status: 'online',
            smartFeatures: ['Cooking Mode', 'Odor Detection', 'Auto Boost'],
            geofencing: false,
            weatherAdaptive: false
        },
        {
            id: '4',
            name: 'Home Office',
            room: 'Home Office',
            currentTemp: 23.8,
            targetTemp: 24.0,
            humidity: 42,
            targetHumidity: 45,
            airQuality: 92,
            occupancy: false,
            occupants: 0,
            mode: 'auto',
            fanSpeed: 'auto',
            schedule: true,
            priority: 'medium',
            sensors: ['Temperature', 'Humidity', 'Motion', 'CO2'],
            hvacSystem: 'Mini Split',
            lastUpdate: '5 minutes ago',
            energyUsage: 4.1,
            efficiency: 90,
            status: 'online',
            smartFeatures: ['Work Hours Optimization', 'Air Quality Priority', 'Silent Mode'],
            geofencing: true,
            weatherAdaptive: true
        }
    ])

    const [hvacSystems, setHvacSystems] = useState<HVACSystem[]>([
        {
            id: '1',
            name: 'Central HVAC System',
            type: 'central_air',
            zones: ['1', '3'],
            currentOutput: 65,
            energyRating: 'A+',
            efficiency: 89,
            status: 'running',
            mode: 'cooling',
            powerConsumption: 3200,
            dailyUsage: 18.5,
            monthlyCost: 156.75,
            co2Impact: 285,
            installDate: '2019-05-15',
            lastMaintenance: '2024-11-20',
            nextMaintenance: '2025-05-20',
            warranty: '3 years remaining',
            filterStatus: 'good',
            refrigerantLevel: 95,
            airflow: 1200,
            noiseLevel: 42
        },
        {
            id: '2',
            name: 'Bedroom Mini Split',
            type: 'mini_split',
            zones: ['2'],
            currentOutput: 30,
            energyRating: 'A++',
            efficiency: 94,
            status: 'idle',
            mode: 'auto',
            powerConsumption: 850,
            dailyUsage: 6.2,
            monthlyCost: 52.25,
            co2Impact: 95,
            installDate: '2021-08-10',
            lastMaintenance: '2024-12-05',
            nextMaintenance: '2025-08-05',
            warranty: '5 years remaining',
            filterStatus: 'replace_soon',
            refrigerantLevel: 98,
            airflow: 450,
            noiseLevel: 28
        },
        {
            id: '3',
            name: 'Office Mini Split',
            type: 'mini_split',
            zones: ['4'],
            currentOutput: 25,
            energyRating: 'A++',
            efficiency: 92,
            status: 'idle',
            mode: 'auto',
            powerConsumption: 650,
            dailyUsage: 4.8,
            monthlyCost: 40.50,
            co2Impact: 73,
            installDate: '2022-03-20',
            lastMaintenance: '2025-01-15',
            nextMaintenance: '2025-09-15',
            warranty: '6 years remaining',
            filterStatus: 'good',
            refrigerantLevel: 96,
            airflow: 380,
            noiseLevel: 26
        }
    ])

    const [climateSchedules, setClimateSchedules] = useState<ClimateSchedule[]>([
        {
            id: '1',
            name: 'Weekday Comfort',
            zoneId: '1',
            zoneName: 'Living Room',
            days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
            timeSlots: [
                { startTime: '06:00', endTime: '09:00', targetTemp: 23, humidity: 50, mode: 'auto', fanSpeed: 'medium' },
                { startTime: '17:00', endTime: '23:00', targetTemp: 22, humidity: 45, mode: 'auto', fanSpeed: 'low' }
            ],
            enabled: true,
            type: 'comfort',
            adaptiveTemp: true,
            weatherDependent: true,
            occupancyBased: true,
            estimatedSavings: 28.50,
            co2Reduction: 45,
            priority: 8,
            geofenceRadius: 500,
            conditions: ['Occupancy Detected', 'Weather Adaptive']
        },
        {
            id: '2',
            name: 'Sleep Mode',
            zoneId: '2',
            zoneName: 'Master Bedroom',
            days: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
            timeSlots: [
                { startTime: '22:00', endTime: '06:30', targetTemp: 20, humidity: 45, mode: 'eco', fanSpeed: 'low' }
            ],
            enabled: true,
            type: 'sleep',
            adaptiveTemp: false,
            weatherDependent: false,
            occupancyBased: true,
            estimatedSavings: 18.25,
            co2Reduction: 28,
            priority: 9,
            geofenceRadius: 0,
            conditions: ['Sleep Time', 'Occupancy Based']
        }
    ])

    const [climateAlerts, setClimateAlerts] = useState<ClimateAlert[]>([
        {
            id: '1',
            type: 'filter',
            severity: 'medium',
            zone: undefined,
            system: 'Bedroom Mini Split',
            title: 'Filter Replacement Due',
            message: 'Air filter needs replacement for optimal performance',
            timestamp: '2 hours ago',
            resolved: false,
            action: 'Schedule filter replacement',
            estimatedImpact: '15% efficiency reduction',
            autoResolution: false
        },
        {
            id: '2',
            type: 'air_quality',
            severity: 'low',
            zone: 'Kitchen',
            system: undefined,
            title: 'Air Quality Alert',
            message: 'Cooking detected - air quality temporarily reduced',
            timestamp: '15 minutes ago',
            resolved: false,
            action: 'Increase ventilation automatically',
            estimatedImpact: 'AQI dropped to 78',
            autoResolution: true
        }
    ])

    const [weatherData] = useState<WeatherData>({
        current: {
            temperature: 28,
            humidity: 65,
            windSpeed: 12,
            condition: 'Partly Cloudy',
            icon: 'partly-cloudy'
        },
        forecast: [
            { day: 'Today', high: 29, low: 22, condition: 'Partly Cloudy', icon: 'partly-cloudy', humidity: 65 },
            { day: 'Tomorrow', high: 31, low: 24, condition: 'Sunny', icon: 'sunny', humidity: 58 },
            { day: 'Sunday', high: 26, low: 19, condition: 'Rainy', icon: 'rainy', humidity: 78 }
        ],
        airQuality: {
            aqi: 85,
            level: 'Good',
            pollutants: {
                'PM2.5': 12,
                'PM10': 18,
                'O3': 65,
                'NO2': 25,
                'SO2': 8
            }
        }
    })

    // Real-time updates simulation
    useEffect(() => {
        const interval = setInterval(() => {
            setClimateZones(prev => prev.map(zone => ({
                ...zone,
                currentTemp: parseFloat((zone.currentTemp + (Math.random() - 0.5) * 0.2).toFixed(1)),
                humidity: Math.min(100, Math.max(0, zone.humidity + (Math.random() - 0.5) * 2)),
                airQuality: Math.min(100, Math.max(0, zone.airQuality + (Math.random() - 0.5) * 3)),
                energyUsage: parseFloat((zone.energyUsage + (Math.random() - 0.5) * 0.5).toFixed(1))
            })))

            setHvacSystems(prev => prev.map(system => ({
                ...system,
                currentOutput: Math.min(100, Math.max(0, system.currentOutput + (Math.random() - 0.5) * 5)),
                powerConsumption: Math.max(0, system.powerConsumption + (Math.random() - 0.5) * 100),
                efficiency: Math.min(100, Math.max(80, system.efficiency + (Math.random() - 0.5) * 1))
            })))
        }, 3000)

        return () => clearInterval(interval)
    }, [])

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'online':
            case 'running':
                return 'text-green-600 bg-green-100 border-green-200'
            case 'idle':
                return 'text-blue-600 bg-blue-100 border-blue-200'
            case 'maintenance':
                return 'text-yellow-600 bg-yellow-100 border-yellow-200'
            case 'offline':
            case 'error':
                return 'text-red-600 bg-red-100 border-red-200'
            default:
                return 'text-gray-600 bg-gray-100 border-gray-200'
        }
    }

    const getModeColor = (mode: string) => {
        switch (mode) {
            case 'heat':
            case 'heating':
                return 'text-red-600 bg-red-50 border-red-200'
            case 'cool':
            case 'cooling':
                return 'text-blue-600 bg-blue-50 border-blue-200'
            case 'auto':
                return 'text-green-600 bg-green-50 border-green-200'
            case 'eco':
                return 'text-emerald-600 bg-emerald-50 border-emerald-200'
            case 'fan_only':
                return 'text-purple-600 bg-purple-50 border-purple-200'
            case 'off':
                return 'text-gray-600 bg-gray-50 border-gray-200'
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

    const getModeIcon = (mode: string) => {
        switch (mode) {
            case 'heat':
            case 'heating':
                return <Flame className="w-4 h-4" />
            case 'cool':
            case 'cooling':
                return <Snowflake className="w-4 h-4" />
            case 'auto':
                return <CircleDot className="w-4 h-4" />
            case 'eco':
                return <Leaf className="w-4 h-4" />
            case 'fan_only':
                return <Fan className="w-4 h-4" />
            case 'off':
                return <Power className="w-4 h-4" />
            default:
                return <Thermometer className="w-4 h-4" />
        }
    }

    const avgTemperature = climateZones.reduce((sum, zone) => sum + zone.currentTemp, 0) / climateZones.length
    const avgHumidity = climateZones.reduce((sum, zone) => sum + zone.humidity, 0) / climateZones.length
    const avgAirQuality = climateZones.reduce((sum, zone) => sum + zone.airQuality, 0) / climateZones.length
    const totalEnergyUsage = climateZones.reduce((sum, zone) => sum + zone.energyUsage, 0)
    const occupiedZones = climateZones.filter(zone => zone.occupancy).length

    const tabs = [
        { id: 'overview', label: 'Climate Overview', icon: <Home className="w-4 h-4" /> },
        { id: 'zones', label: 'Zone Control', icon: <Grid3X3 className="w-4 h-4" /> },
        { id: 'systems', label: 'HVAC Systems', icon: <Fan className="w-4 h-4" /> },
        { id: 'schedules', label: 'Smart Schedules', icon: <Calendar className="w-4 h-4" /> },
        { id: 'weather', label: 'Weather Integration', icon: <Sun className="w-4 h-4" /> },
        { id: 'analytics', label: 'Climate Analytics', icon: <BarChart3 className="w-4 h-4" /> }
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
                                    <Thermometer className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-xl font-bold text-gray-900">Climate Control</h1>
                                    <p className="text-sm text-gray-600">HVAC and environmental management</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center space-x-4">
                            <div className="hidden md:flex items-center space-x-6 text-sm">
                                <div className="text-center">
                                    <p className="text-gray-500">Avg Temperature</p>
                                    <p className="font-semibold text-gray-900">{avgTemperature.toFixed(1)}°C</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-gray-500">Humidity</p>
                                    <p className="font-semibold text-blue-600">{avgHumidity.toFixed(0)}%</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-gray-500">Air Quality</p>
                                    <p className="font-semibold text-green-600">{avgAirQuality.toFixed(0)}</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-gray-500">Energy Usage</p>
                                    <p className="font-semibold text-orange-600">{totalEnergyUsage.toFixed(1)} kWh</p>
                                </div>
                            </div>

                            <div className="flex items-center space-x-2">
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => setIsGlobalControl(!isGlobalControl)}
                                    className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${isGlobalControl
                                            ? 'bg-blue-100 text-blue-700 border-blue-200'
                                            : 'bg-gray-100 text-gray-700 border-gray-200'
                                        }`}
                                >
                                    <div className="flex items-center space-x-2">
                                        <Layers className="w-4 h-4" />
                                        <span>Global Control</span>
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
                    {/* Climate Overview Tab */}
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
                                            <p className="text-sm font-medium text-gray-600">Average Temperature</p>
                                            <p className="text-2xl font-bold text-gray-900">{avgTemperature.toFixed(1)}°C</p>
                                            <p className="text-sm text-green-600 flex items-center">
                                                <TrendingDown className="w-4 h-4 mr-1" />
                                                0.5°C from target
                                            </p>
                                        </div>
                                        <div className="p-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl">
                                            <Thermometer className="w-6 h-6 text-white" />
                                        </div>
                                    </div>
                                </motion.div>

                                <motion.div
                                    whileHover={{ scale: 1.02 }}
                                    className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-cyan-200"
                                >
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-gray-600">Humidity Level</p>
                                            <p className="text-2xl font-bold text-gray-900">{avgHumidity.toFixed(0)}%</p>
                                            <p className="text-sm text-blue-600 flex items-center">
                                                <TrendingUp className="w-4 h-4 mr-1" />
                                                Within optimal range
                                            </p>
                                        </div>
                                        <div className="p-3 bg-gradient-to-r from-cyan-500 to-teal-500 rounded-xl">
                                            <Droplets className="w-6 h-6 text-white" />
                                        </div>
                                    </div>
                                </motion.div>

                                <motion.div
                                    whileHover={{ scale: 1.02 }}
                                    className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-green-200"
                                >
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-gray-600">Air Quality</p>
                                            <p className="text-2xl font-bold text-gray-900">{avgAirQuality.toFixed(0)}</p>
                                            <p className="text-sm text-green-600 flex items-center">
                                                <CheckCircle className="w-4 h-4 mr-1" />
                                                Excellent quality
                                            </p>
                                        </div>
                                        <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl">
                                            <Wind className="w-6 h-6 text-white" />
                                        </div>
                                    </div>
                                </motion.div>

                                <motion.div
                                    whileHover={{ scale: 1.02 }}
                                    className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-orange-200"
                                >
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-gray-600">Energy Usage</p>
                                            <p className="text-2xl font-bold text-gray-900">{totalEnergyUsage.toFixed(1)} kWh</p>
                                            <p className="text-sm text-green-600 flex items-center">
                                                <TrendingDown className="w-4 h-4 mr-1" />
                                                18% below average
                                            </p>
                                        </div>
                                        <div className="p-3 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl">
                                            <Zap className="w-6 h-6 text-white" />
                                        </div>
                                    </div>
                                </motion.div>
                            </div>

                            {/* Zone Status Grid */}
                            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-blue-200">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-lg font-semibold text-gray-900">Climate Zones</h3>
                                    <div className="flex items-center space-x-2">
                                        <span className="text-sm text-gray-600">
                                            {occupiedZones} of {climateZones.length} zones occupied
                                        </span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                    {climateZones.map((zone) => (
                                        <motion.div
                                            key={zone.id}
                                            whileHover={{ scale: 1.02 }}
                                            onClick={() => setSelectedZone(zone.id)}
                                            className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg border border-blue-200 cursor-pointer"
                                        >
                                            <div className="flex items-center justify-between mb-3">
                                                <h4 className="font-medium text-gray-900">{zone.name}</h4>
                                                <div className="flex items-center space-x-1">
                                                    {zone.occupancy && (
                                                        <div className="flex items-center space-x-1">
                                                            <Users className="w-3 h-3 text-green-600" />
                                                            <span className="text-xs text-green-600">{zone.occupants}</span>
                                                        </div>
                                                    )}
                                                    <span className={`px-2 py-1 text-xs rounded-full border ${getStatusColor(zone.status)}`}>
                                                        {zone.status}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center space-x-2">
                                                        <Thermometer className="w-4 h-4 text-red-500" />
                                                        <span className="text-sm text-gray-600">Temperature</span>
                                                    </div>
                                                    <span className="text-sm font-medium">{zone.currentTemp}°C</span>
                                                </div>

                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center space-x-2">
                                                        <Droplets className="w-4 h-4 text-blue-500" />
                                                        <span className="text-sm text-gray-600">Humidity</span>
                                                    </div>
                                                    <span className="text-sm font-medium">{zone.humidity}%</span>
                                                </div>

                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center space-x-2">
                                                        <Wind className="w-4 h-4 text-green-500" />
                                                        <span className="text-sm text-gray-600">Air Quality</span>
                                                    </div>
                                                    <span className="text-sm font-medium">{zone.airQuality}</span>
                                                </div>

                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center space-x-2">
                                                        {getModeIcon(zone.mode)}
                                                        <span className="text-sm text-gray-600">Mode</span>
                                                    </div>
                                                    <span className={`px-2 py-1 text-xs rounded-full border ${getModeColor(zone.mode)}`}>
                                                        {zone.mode}
                                                    </span>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>

                            {/* HVAC Systems Status */}
                            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-blue-200">
                                <h3 className="text-lg font-semibold text-gray-900 mb-6">HVAC Systems</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {hvacSystems.map((system) => (
                                        <motion.div
                                            key={system.id}
                                            whileHover={{ scale: 1.02 }}
                                            className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200"
                                        >
                                            <div className="flex items-center justify-between mb-3">
                                                <h4 className="font-medium text-gray-900">{system.name}</h4>
                                                <span className={`px-2 py-1 text-xs rounded-full border ${getStatusColor(system.status)}`}>
                                                    {system.status}
                                                </span>
                                            </div>

                                            <div className="space-y-3">
                                                <div>
                                                    <div className="flex justify-between text-sm mb-1">
                                                        <span className="text-gray-600">Output</span>
                                                        <span className="font-medium">{system.currentOutput}%</span>
                                                    </div>
                                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                                        <div
                                                            className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300"
                                                            style={{ width: `${system.currentOutput}%` }}
                                                        />
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-2 gap-3 text-xs">
                                                    <div>
                                                        <p className="text-gray-500">Power</p>
                                                        <p className="font-medium">{(system.powerConsumption / 1000).toFixed(1)} kW</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-gray-500">Efficiency</p>
                                                        <p className="font-medium">{system.efficiency}%</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-gray-500">Filter</p>
                                                        <p className={`font-medium ${system.filterStatus === 'good' ? 'text-green-600' :
                                                                system.filterStatus === 'replace_soon' ? 'text-yellow-600' : 'text-red-600'
                                                            }`}>
                                                            {system.filterStatus.replace('_', ' ')}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <p className="text-gray-500">Noise</p>
                                                        <p className="font-medium">{system.noiseLevel} dB</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>

                            {/* Recent Alerts */}
                            {climateAlerts.length > 0 && (
                                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-orange-200">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                        <AlertTriangle className="w-5 h-5 mr-2 text-orange-500" />
                                        Climate Alerts
                                    </h3>
                                    <div className="space-y-3">
                                        {climateAlerts.map((alert) => (
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
                                    This section is being implemented with comprehensive climate control features.
                                </p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    )
}

export default ClimateControlPage
