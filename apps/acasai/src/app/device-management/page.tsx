'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
    // Device Control Icons
    Smartphone,
    Power,
    Settings2,
    Plus,
    Search,
    Filter,
    RotateCcw,

    // Device Type Icons
    Lightbulb,
    Thermometer,
    Camera,
    Lock,
    Activity,
    Volume2,
    Tv,
    Zap,

    // Status and Control Icons
    Wifi,
    WifiOff,
    Battery,
    Signal,
    AlertTriangle,
    CheckCircle,
    Clock,
    Edit3,
    Trash2,

    // Configuration Icons
    Sliders,
    MoreHorizontal,
    Eye,
    EyeOff,
    Play,
    Pause,
    SkipForward,
    SkipBack,

    // Room and Location Icons
    Home,
    Bed,
    ChefHat,
    Sofa,
    Car,
    TreePine,

    // Advanced Controls
    Timer,
    Calendar,
    TrendingUp,
    TrendingDown,
    BarChart3,
    RefreshCw
} from 'lucide-react'

// Device Management Interfaces
interface SmartDevice {
    id: string
    name: string
    type: 'light' | 'thermostat' | 'camera' | 'lock' | 'sensor' | 'speaker' | 'tv' | 'outlet' | 'doorbell' | 'blind' | 'fan' | 'heater'
    brand: string
    model: string
    status: 'online' | 'offline' | 'maintenance' | 'updating'
    isActive: boolean
    room: string
    battery?: number
    signalStrength: number
    lastUpdate: string
    powerConsumption?: number
    firmware: string
    ipAddress?: string
    macAddress: string
    capabilities: string[]
    settings: Record<string, any>
    schedule?: DeviceSchedule[]
    usage: DeviceUsage
}

interface DeviceSchedule {
    id: string
    name: string
    enabled: boolean
    time: string
    days: string[]
    action: string
    value?: any
}

interface DeviceUsage {
    dailyUsage: number
    weeklyUsage: number
    monthlyUsage: number
    averageDaily: number
    peakHours: string[]
    efficiency: number
}

interface DeviceCategory {
    id: string
    name: string
    icon: any
    count: number
    color: string
}

interface Room {
    id: string
    name: string
    icon: any
    deviceCount: number
    color: string
}

export default function DeviceManagementPage() {
    // State Management
    const [activeView, setActiveView] = useState('grid')
    const [selectedRoom, setSelectedRoom] = useState('all')
    const [selectedCategory, setSelectedCategory] = useState('all')
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedDevice, setSelectedDevice] = useState<SmartDevice | null>(null)
    const [showDeviceModal, setShowDeviceModal] = useState(false)
    const [autoRefresh, setAutoRefresh] = useState(true)

    // Device Categories
    const deviceCategories: DeviceCategory[] = [
        { id: 'all', name: 'All Devices', icon: Smartphone, count: 24, color: 'blue' },
        { id: 'lighting', name: 'Lighting', icon: Lightbulb, count: 8, color: 'yellow' },
        { id: 'climate', name: 'Climate', icon: Thermometer, count: 4, color: 'orange' },
        { id: 'security', name: 'Security', icon: Lock, count: 6, color: 'red' },
        { id: 'entertainment', name: 'Entertainment', icon: Tv, count: 3, color: 'purple' },
        { id: 'sensors', name: 'Sensors', icon: Activity, count: 3, color: 'green' }
    ]

    // Room Categories
    const rooms: Room[] = [
        { id: 'all', name: 'All Rooms', icon: Home, deviceCount: 24, color: 'blue' },
        { id: 'living-room', name: 'Living Room', icon: Sofa, deviceCount: 8, color: 'green' },
        { id: 'kitchen', name: 'Kitchen', icon: ChefHat, deviceCount: 6, color: 'orange' },
        { id: 'bedroom', name: 'Bedroom', icon: Bed, deviceCount: 5, color: 'purple' },
        { id: 'bathroom', name: 'Bathroom', icon: Home, deviceCount: 3, color: 'cyan' },
        { id: 'office', name: 'Office', icon: Home, deviceCount: 2, color: 'indigo' }
    ]

    // Smart Devices Data
    const [smartDevices, setSmartDevices] = useState<SmartDevice[]>([
        {
            id: 'light-1',
            name: 'Living Room Ceiling Light',
            type: 'light',
            brand: 'Philips Hue',
            model: 'Smart Bulb Pro',
            status: 'online',
            isActive: true,
            room: 'living-room',
            signalStrength: 92,
            lastUpdate: '2 min ago',
            powerConsumption: 12,
            firmware: '1.2.4',
            ipAddress: '192.168.1.101',
            macAddress: 'AA:BB:CC:DD:EE:01',
            capabilities: ['dimming', 'color-change', 'scheduling', 'voice-control'],
            settings: { brightness: 75, color: '#FFFFFF', temperature: 3000 },
            schedule: [
                { id: 'sch1', name: 'Evening Dim', enabled: true, time: '19:00', days: ['mon', 'tue', 'wed', 'thu', 'fri'], action: 'dim', value: 30 }
            ],
            usage: { dailyUsage: 8.5, weeklyUsage: 62.3, monthlyUsage: 248.7, averageDaily: 8.2, peakHours: ['18:00', '19:00', '20:00'], efficiency: 92 }
        },
        {
            id: 'thermo-1',
            name: 'Main Thermostat',
            type: 'thermostat',
            brand: 'Nest',
            model: 'Learning Thermostat',
            status: 'online',
            isActive: true,
            room: 'living-room',
            signalStrength: 89,
            lastUpdate: '1 min ago',
            powerConsumption: 8,
            firmware: '2.1.0',
            ipAddress: '192.168.1.102',
            macAddress: 'AA:BB:CC:DD:EE:02',
            capabilities: ['temperature-control', 'scheduling', 'learning', 'remote-control'],
            settings: { targetTemp: 22.5, mode: 'heat', schedule: 'auto' },
            usage: { dailyUsage: 12.3, weeklyUsage: 89.4, monthlyUsage: 356.2, averageDaily: 11.9, peakHours: ['06:00', '07:00', '18:00'], efficiency: 88 }
        },
        {
            id: 'camera-1',
            name: 'Front Door Camera',
            type: 'camera',
            brand: 'Ring',
            model: 'Video Doorbell Pro',
            status: 'online',
            isActive: true,
            room: 'entrance',
            battery: 87,
            signalStrength: 76,
            lastUpdate: '30 sec ago',
            powerConsumption: 6,
            firmware: '3.0.2',
            macAddress: 'AA:BB:CC:DD:EE:03',
            capabilities: ['motion-detection', 'night-vision', 'two-way-audio', 'cloud-recording'],
            settings: { resolution: '1080p', motionSensitivity: 'medium', nightVision: true },
            usage: { dailyUsage: 24.0, weeklyUsage: 168.0, monthlyUsage: 720.0, averageDaily: 24.0, peakHours: ['all-day'], efficiency: 95 }
        },
        {
            id: 'lock-1',
            name: 'Smart Front Door Lock',
            type: 'lock',
            brand: 'August',
            model: 'Smart Lock Pro',
            status: 'online',
            isActive: true,
            room: 'entrance',
            battery: 92,
            signalStrength: 84,
            lastUpdate: '5 min ago',
            firmware: '1.8.3',
            macAddress: 'AA:BB:CC:DD:EE:04',
            capabilities: ['auto-lock', 'remote-unlock', 'access-codes', 'activity-log'],
            settings: { autoLock: true, autoLockDelay: 30, guestAccess: false },
            usage: { dailyUsage: 0.5, weeklyUsage: 3.2, monthlyUsage: 14.8, averageDaily: 0.5, peakHours: ['08:00', '18:00'], efficiency: 98 }
        },
        {
            id: 'sensor-1',
            name: 'Kitchen Motion Sensor',
            type: 'sensor',
            brand: 'SmartThings',
            model: 'Motion Sensor v3',
            status: 'online',
            isActive: false,
            room: 'kitchen',
            battery: 78,
            signalStrength: 91,
            lastUpdate: '3 min ago',
            firmware: '1.0.9',
            macAddress: 'AA:BB:CC:DD:EE:05',
            capabilities: ['motion-detection', 'temperature-sensing', 'light-sensing'],
            settings: { sensitivity: 'high', delay: 10, temperature: true },
            usage: { dailyUsage: 0.1, weeklyUsage: 0.7, monthlyUsage: 3.0, averageDaily: 0.1, peakHours: ['06:00', '18:00'], efficiency: 99 }
        },
        {
            id: 'speaker-1',
            name: 'Kitchen Smart Speaker',
            type: 'speaker',
            brand: 'Amazon',
            model: 'Echo Dot 5th Gen',
            status: 'online',
            isActive: false,
            room: 'kitchen',
            signalStrength: 88,
            lastUpdate: '10 min ago',
            powerConsumption: 4,
            firmware: '4.2.1',
            ipAddress: '192.168.1.106',
            macAddress: 'AA:BB:CC:DD:EE:06',
            capabilities: ['voice-control', 'music-streaming', 'smart-home-hub', 'calling'],
            settings: { volume: 45, wakeWord: 'Alexa', privacy: 'standard' },
            usage: { dailyUsage: 3.2, weeklyUsage: 22.4, monthlyUsage: 96.0, averageDaily: 3.2, peakHours: ['07:00', '19:00'], efficiency: 85 }
        },
        {
            id: 'tv-1',
            name: 'Living Room Smart TV',
            type: 'tv',
            brand: 'Samsung',
            model: 'QLED 65" 4K',
            status: 'offline',
            isActive: false,
            room: 'living-room',
            signalStrength: 0,
            lastUpdate: '2 hours ago',
            powerConsumption: 0,
            firmware: '2.5.1',
            ipAddress: '192.168.1.107',
            macAddress: 'AA:BB:CC:DD:EE:07',
            capabilities: ['streaming', 'voice-control', 'screen-mirroring', 'gaming'],
            settings: { input: 'HDMI1', volume: 25, pictureMode: 'Standard' },
            usage: { dailyUsage: 0.0, weeklyUsage: 84.0, monthlyUsage: 360.0, averageDaily: 12.0, peakHours: ['19:00', '20:00', '21:00'], efficiency: 78 }
        },
        {
            id: 'outlet-1',
            name: 'Office Smart Outlet',
            type: 'outlet',
            brand: 'TP-Link',
            model: 'Kasa Smart Plug',
            status: 'online',
            isActive: true,
            room: 'office',
            signalStrength: 95,
            lastUpdate: '1 min ago',
            powerConsumption: 125,
            firmware: '1.3.2',
            ipAddress: '192.168.1.108',
            macAddress: 'AA:BB:CC:DD:EE:08',
            capabilities: ['remote-control', 'scheduling', 'energy-monitoring', 'voice-control'],
            settings: { schedule: 'work-hours', energyMonitoring: true },
            usage: { dailyUsage: 8.5, weeklyUsage: 42.5, monthlyUsage: 170.0, averageDaily: 8.5, peakHours: ['09:00-17:00'], efficiency: 92 }
        }
    ])

    // Real-time Updates
    useEffect(() => {
        if (autoRefresh) {
            const interval = setInterval(() => {
                setSmartDevices(prev => prev.map(device => ({
                    ...device,
                    signalStrength: Math.max(0, Math.min(100, device.signalStrength + (Math.random() - 0.5) * 10)),
                    powerConsumption: device.powerConsumption ? Math.max(0, device.powerConsumption + (Math.random() - 0.5) * 5) : undefined,
                    battery: device.battery ? Math.max(0, Math.min(100, device.battery + (Math.random() - 0.5) * 2)) : undefined
                })))
            }, 5000)

            return () => clearInterval(interval)
        }
    }, [autoRefresh])

    // Device Icon Mapping
    const getDeviceIcon = (type: SmartDevice['type']) => {
        switch (type) {
            case 'light': return Lightbulb
            case 'thermostat': return Thermometer
            case 'camera': return Camera
            case 'lock': return Lock
            case 'sensor': return Activity
            case 'speaker': return Volume2
            case 'tv': return Tv
            case 'outlet': return Zap
            case 'doorbell': return Home
            case 'blind': return Home
            case 'fan': return Home
            case 'heater': return Thermometer
            default: return Smartphone
        }
    }

    // Status Color Mapping
    const getStatusColor = (status: SmartDevice['status']) => {
        switch (status) {
            case 'online': return 'green'
            case 'offline': return 'red'
            case 'maintenance': return 'yellow'
            case 'updating': return 'blue'
            default: return 'gray'
        }
    }

    // Room Icon Mapping
    const getRoomIcon = (roomId: string) => {
        const room = rooms.find(r => r.id === roomId)
        return room?.icon || Home
    }

    // Filter Devices
    const filteredDevices = smartDevices.filter(device => {
        const matchesRoom = selectedRoom === 'all' || device.room === selectedRoom
        const matchesCategory = selectedCategory === 'all' ||
            (selectedCategory === 'lighting' && device.type === 'light') ||
            (selectedCategory === 'climate' && ['thermostat', 'fan', 'heater'].includes(device.type)) ||
            (selectedCategory === 'security' && ['camera', 'lock', 'sensor'].includes(device.type)) ||
            (selectedCategory === 'entertainment' && ['tv', 'speaker'].includes(device.type)) ||
            (selectedCategory === 'sensors' && device.type === 'sensor')
        const matchesSearch = device.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            device.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
            device.room.toLowerCase().includes(searchTerm.toLowerCase())

        return matchesRoom && matchesCategory && matchesSearch
    })

    // Navigation Views
    const navigationViews = [
        { id: 'grid', label: 'Grid View', icon: Home, count: filteredDevices.length },
        { id: 'list', label: 'List View', icon: BarChart3, count: filteredDevices.length },
        { id: 'rooms', label: 'By Rooms', icon: Sofa, count: rooms.length - 1 },
        { id: 'categories', label: 'By Category', icon: Filter, count: deviceCategories.length - 1 },
        { id: 'status', label: 'Status View', icon: Activity, count: smartDevices.filter(d => d.status !== 'online').length }
    ]

    return (
        <div className="p-6 space-y-6">
            {/* Enhanced Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 rounded-2xl p-8 text-white shadow-2xl"
            >
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-4">
                        <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
                            <Smartphone className="h-8 w-8" />
                        </div>
                        <div>
                            <h1 className="text-4xl font-bold">Device Management</h1>
                            <p className="text-blue-100 text-lg">IoT Device Control & Configuration</p>
                        </div>
                    </div>

                    <div className="flex items-center space-x-6">
                        <div className="text-right">
                            <p className="text-sm text-blue-100">Total Devices</p>
                            <p className="text-2xl font-bold">{smartDevices.length}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-blue-100">Online</p>
                            <p className="text-2xl font-bold">{smartDevices.filter(d => d.status === 'online').length}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-blue-100">Active</p>
                            <p className="text-2xl font-bold">{smartDevices.filter(d => d.isActive).length}</p>
                        </div>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setAutoRefresh(!autoRefresh)}
                            className="bg-white/20 p-3 rounded-xl backdrop-blur-sm hover:bg-white/30 transition-colors"
                        >
                            <RefreshCw className={`h-5 w-5 ${autoRefresh ? 'animate-spin' : ''}`} />
                        </motion.button>
                    </div>
                </div>

                {/* Navigation Tabs */}
                <div className="flex space-x-1 bg-white/10 rounded-xl p-1 backdrop-blur-sm overflow-x-auto">
                    {navigationViews.map((view) => {
                        const IconComponent = view.icon
                        const isActive = activeView === view.id

                        return (
                            <motion.button
                                key={view.id}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => setActiveView(view.id)}
                                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 relative whitespace-nowrap ${isActive
                                        ? 'bg-white text-blue-600 shadow-lg'
                                        : 'text-white/80 hover:text-white hover:bg-white/10'
                                    }`}
                            >
                                <IconComponent className="h-4 w-4" />
                                <span className="font-medium">{view.label}</span>
                                <span className={`px-2 py-1 rounded-full text-xs font-bold ${isActive ? 'bg-blue-100 text-blue-600' : 'bg-white/20 text-white'
                                    }`}>
                                    {view.count}
                                </span>
                            </motion.button>
                        )
                    })}
                </div>
            </motion.div>

            {/* Filters and Controls */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-4 flex-1">
                        {/* Search */}
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                            <input
                                type="text"
                                placeholder="Search devices..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 pr-4 py-2 w-64 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>

                        {/* Room Filter */}
                        <select
                            value={selectedRoom}
                            onChange={(e) => setSelectedRoom(e.target.value)}
                            className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            {rooms.map(room => (
                                <option key={room.id} value={room.id}>{room.name}</option>
                            ))}
                        </select>

                        {/* Category Filter */}
                        <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            {deviceCategories.map(category => (
                                <option key={category.id} value={category.id}>{category.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="flex items-center space-x-3">
                        <button className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                            <Plus className="h-4 w-4" />
                            <span>Add Device</span>
                        </button>
                        <button className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors">
                            <Settings2 className="h-4 w-4" />
                            <span>Bulk Actions</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Device Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredDevices.map((device) => {
                    const IconComponent = getDeviceIcon(device.type)
                    const statusColor = getStatusColor(device.status)
                    const RoomIcon = getRoomIcon(device.room)

                    return (
                        <motion.div
                            key={device.id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            whileHover={{ scale: 1.02, y: -5 }}
                            className={`bg-white rounded-2xl p-6 shadow-lg border-2 transition-all duration-300 cursor-pointer ${device.status === 'online'
                                    ? 'border-green-200 hover:border-green-300 hover:shadow-xl'
                                    : device.status === 'offline'
                                        ? 'border-red-200 hover:border-red-300'
                                        : 'border-yellow-200 hover:border-yellow-300'
                                }`}
                            onClick={() => {
                                setSelectedDevice(device)
                                setShowDeviceModal(true)
                            }}
                        >
                            {/* Device Header */}
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center space-x-3">
                                    <div className={`p-3 rounded-xl bg-${statusColor}-100`}>
                                        <IconComponent className={`h-6 w-6 text-${statusColor}-600`} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900">{device.name}</h3>
                                        <p className="text-sm text-gray-500">{device.brand} {device.model}</p>
                                    </div>
                                </div>

                                <div className={`px-3 py-1 rounded-full text-xs font-medium ${device.status === 'online' ? 'bg-green-100 text-green-800' :
                                        device.status === 'offline' ? 'bg-red-100 text-red-800' :
                                            device.status === 'maintenance' ? 'bg-yellow-100 text-yellow-800' :
                                                'bg-blue-100 text-blue-800'
                                    }`}>
                                    {device.status}
                                </div>
                            </div>

                            {/* Device Info */}
                            <div className="space-y-3 mb-4">
                                <div className="flex items-center justify-between text-sm">
                                    <div className="flex items-center space-x-2">
                                        <RoomIcon className="h-4 w-4 text-gray-400" />
                                        <span className="text-gray-600 capitalize">{device.room.replace('-', ' ')}</span>
                                    </div>
                                    <div className="flex items-center space-x-1">
                                        <Wifi className={`h-4 w-4 ${device.signalStrength > 70 ? 'text-green-500' : device.signalStrength > 40 ? 'text-yellow-500' : 'text-red-500'}`} />
                                        <span className="text-gray-600">{device.signalStrength}%</span>
                                    </div>
                                </div>

                                {device.battery && (
                                    <div className="flex items-center justify-between text-sm">
                                        <div className="flex items-center space-x-2">
                                            <Battery className="h-4 w-4 text-gray-400" />
                                            <span className="text-gray-600">Battery</span>
                                        </div>
                                        <span className={`font-medium ${device.battery > 50 ? 'text-green-600' : device.battery > 20 ? 'text-yellow-600' : 'text-red-600'}`}>
                                            {device.battery}%
                                        </span>
                                    </div>
                                )}

                                {device.powerConsumption && (
                                    <div className="flex items-center justify-between text-sm">
                                        <div className="flex items-center space-x-2">
                                            <Zap className="h-4 w-4 text-gray-400" />
                                            <span className="text-gray-600">Power</span>
                                        </div>
                                        <span className="font-medium text-orange-600">{device.powerConsumption}W</span>
                                    </div>
                                )}

                                <div className="flex items-center justify-between text-sm">
                                    <div className="flex items-center space-x-2">
                                        <Clock className="h-4 w-4 text-gray-400" />
                                        <span className="text-gray-600">Last Update</span>
                                    </div>
                                    <span className="text-gray-600">{device.lastUpdate}</span>
                                </div>
                            </div>

                            {/* Device Controls */}
                            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        setSmartDevices(prev => prev.map(d =>
                                            d.id === device.id ? { ...d, isActive: !d.isActive } : d
                                        ))
                                    }}
                                    className={`p-2 rounded-lg transition-colors ${device.isActive
                                            ? 'bg-blue-500 text-white hover:bg-blue-600'
                                            : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                                        }`}
                                >
                                    <Power className="h-4 w-4" />
                                </button>

                                <div className="flex items-center space-x-1">
                                    <button
                                        onClick={(e) => e.stopPropagation()}
                                        className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                                    >
                                        <Edit3 className="h-4 w-4" />
                                    </button>
                                    <button
                                        onClick={(e) => e.stopPropagation()}
                                        className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                                    >
                                        <Settings2 className="h-4 w-4" />
                                    </button>
                                    <button
                                        onClick={(e) => e.stopPropagation()}
                                        className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                                    >
                                        <MoreHorizontal className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )
                })}
            </div>

            {/* Empty State */}
            {filteredDevices.length === 0 && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-12"
                >
                    <Smartphone className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-600 mb-2">No devices found</h3>
                    <p className="text-gray-500 mb-6">Try adjusting your filters or search terms</p>
                    <button className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                        Add Your First Device
                    </button>
                </motion.div>
            )}

            {/* Device Statistics Footer */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-1 md:grid-cols-4 gap-6"
            >
                <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-6 text-white">
                    <div className="flex items-center space-x-3 mb-4">
                        <CheckCircle className="h-8 w-8" />
                        <h3 className="text-xl font-bold">Online Devices</h3>
                    </div>
                    <p className="text-3xl font-bold">{smartDevices.filter(d => d.status === 'online').length}</p>
                    <p className="text-green-100">of {smartDevices.length} total</p>
                </div>

                <div className="bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl p-6 text-white">
                    <div className="flex items-center space-x-3 mb-4">
                        <Zap className="h-8 w-8" />
                        <h3 className="text-xl font-bold">Total Power</h3>
                    </div>
                    <p className="text-3xl font-bold">
                        {smartDevices.reduce((sum, d) => sum + (d.powerConsumption || 0), 0)}W
                    </p>
                    <p className="text-blue-100">current consumption</p>
                </div>

                <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl p-6 text-white">
                    <div className="flex items-center space-x-3 mb-4">
                        <Battery className="h-8 w-8" />
                        <h3 className="text-xl font-bold">Battery Health</h3>
                    </div>
                    <p className="text-3xl font-bold">
                        {Math.round(smartDevices.filter(d => d.battery).reduce((sum, d) => sum + (d.battery || 0), 0) / smartDevices.filter(d => d.battery).length)}%
                    </p>
                    <p className="text-purple-100">average level</p>
                </div>

                <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl p-6 text-white">
                    <div className="flex items-center space-x-3 mb-4">
                        <Wifi className="h-8 w-8" />
                        <h3 className="text-xl font-bold">Network Health</h3>
                    </div>
                    <p className="text-3xl font-bold">
                        {Math.round(smartDevices.reduce((sum, d) => sum + d.signalStrength, 0) / smartDevices.length)}%
                    </p>
                    <p className="text-orange-100">average signal</p>
                </div>
            </motion.div>
        </div>
    )
}
