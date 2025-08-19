'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
    // Core Smart Home Icons
    Home,
    Smartphone,
    Wifi,
    Zap,
    Thermometer,
    Shield,
    Camera,
    Lightbulb,

    // Device Status Icons
    Power,
    Battery,
    Signal,
    WifiOff,
    AlertTriangle,
    CheckCircle,

    // Control Icons
    Plus,
    Minus,
    Play,
    Pause,
    RotateCcw,
    Settings2,

    // Navigation Icons
    BarChart3,
    Lock,
    Tv,
    Wind,
    Leaf,
    Sun,

    // Action Icons
    Bell,
    Eye,
    Volume2,
    VolumeX,
    ArrowRight,
    RefreshCw,

    // Status Indicators
    TrendingUp,
    TrendingDown,
    Clock,
    Activity
} from 'lucide-react'

// Smart Home Dashboard Interfaces
interface SmartDevice {
    id: string
    name: string
    type: 'light' | 'thermostat' | 'camera' | 'lock' | 'sensor' | 'speaker' | 'tv' | 'outlet'
    status: 'online' | 'offline' | 'maintenance'
    isActive: boolean
    room: string
    battery?: number
    value?: number
    unit?: string
    lastUpdate: string
}

interface AutomationScene {
    id: string
    name: string
    description: string
    isActive: boolean
    devices: number
    triggers: string[]
    schedule?: string
}

interface HomeMetrics {
    energyUsage: number
    energyTrend: number
    temperature: number
    humidity: number
    securityStatus: 'armed' | 'disarmed' | 'alert'
    connectedDevices: number
    activeScenes: number
    alerts: number
}

interface Alert {
    id: string
    type: 'security' | 'energy' | 'device' | 'system'
    title: string
    message: string
    severity: 'low' | 'medium' | 'high' | 'critical'
    timestamp: string
    isRead: boolean
}

export default function AcasaiDashboard() {
    // Dashboard State Management
    const [currentTime, setCurrentTime] = useState(new Date())
    const [activeView, setActiveView] = useState('overview')
    const [autoRefresh, setAutoRefresh] = useState(true)

    // Smart Home Metrics
    const [homeMetrics, setHomeMetrics] = useState<HomeMetrics>({
        energyUsage: 3.4,
        energyTrend: -12.5,
        temperature: 22.5,
        humidity: 45,
        securityStatus: 'armed',
        connectedDevices: 24,
        activeScenes: 3,
        alerts: 2
    })

    // Smart Devices Data
    const [smartDevices] = useState<SmartDevice[]>([
        {
            id: 'light-1',
            name: 'Living Room Lights',
            type: 'light',
            status: 'online',
            isActive: true,
            room: 'Living Room',
            value: 75,
            unit: '%',
            lastUpdate: '2 min ago'
        },
        {
            id: 'thermo-1',
            name: 'Main Thermostat',
            type: 'thermostat',
            status: 'online',
            isActive: true,
            room: 'Hallway',
            value: 22.5,
            unit: '°C',
            lastUpdate: '1 min ago'
        },
        {
            id: 'camera-1',
            name: 'Front Door Camera',
            type: 'camera',
            status: 'online',
            isActive: true,
            room: 'Entrance',
            battery: 87,
            lastUpdate: '30 sec ago'
        },
        {
            id: 'lock-1',
            name: 'Front Door Lock',
            type: 'lock',
            status: 'online',
            isActive: true,
            room: 'Entrance',
            battery: 92,
            lastUpdate: '5 min ago'
        },
        {
            id: 'sensor-1',
            name: 'Motion Sensor',
            type: 'sensor',
            status: 'online',
            isActive: false,
            room: 'Kitchen',
            battery: 78,
            lastUpdate: '3 min ago'
        },
        {
            id: 'speaker-1',
            name: 'Kitchen Speaker',
            type: 'speaker',
            status: 'online',
            isActive: false,
            room: 'Kitchen',
            value: 45,
            unit: 'vol',
            lastUpdate: '10 min ago'
        },
        {
            id: 'tv-1',
            name: 'Living Room TV',
            type: 'tv',
            status: 'offline',
            isActive: false,
            room: 'Living Room',
            lastUpdate: '2 hours ago'
        },
        {
            id: 'outlet-1',
            name: 'Smart Outlet',
            type: 'outlet',
            status: 'online',
            isActive: true,
            room: 'Office',
            value: 2.1,
            unit: 'kW',
            lastUpdate: '1 min ago'
        }
    ])

    // Automation Scenes
    const [automationScenes] = useState<AutomationScene[]>([
        {
            id: 'scene-1',
            name: 'Good Morning',
            description: 'Turn on lights, adjust temperature, start coffee',
            isActive: true,
            devices: 8,
            triggers: ['7:00 AM', 'Motion in Kitchen'],
            schedule: 'Daily 7:00 AM'
        },
        {
            id: 'scene-2',
            name: 'Movie Night',
            description: 'Dim lights, close blinds, turn on TV',
            isActive: false,
            devices: 5,
            triggers: ['Voice Command', 'TV Remote'],
            schedule: 'Manual'
        },
        {
            id: 'scene-3',
            name: 'Away Mode',
            description: 'Lock doors, arm security, adjust temperature',
            isActive: true,
            devices: 12,
            triggers: ['Phone Location', 'Manual'],
            schedule: 'Geofence'
        },
        {
            id: 'scene-4',
            name: 'Sleep Mode',
            description: 'Turn off lights, lock doors, night temperature',
            isActive: false,
            devices: 10,
            triggers: ['11:00 PM', 'Bedtime Button'],
            schedule: 'Daily 11:00 PM'
        }
    ])

    // Recent Alerts
    const [recentAlerts] = useState<Alert[]>([
        {
            id: 'alert-1',
            type: 'security',
            title: 'Front Door Activity',
            message: 'Motion detected at front entrance',
            severity: 'medium',
            timestamp: '5 minutes ago',
            isRead: false
        },
        {
            id: 'alert-2',
            type: 'energy',
            title: 'High Energy Usage',
            message: 'Office outlet consuming above normal levels',
            severity: 'low',
            timestamp: '15 minutes ago',
            isRead: false
        },
        {
            id: 'alert-3',
            type: 'device',
            title: 'Device Offline',
            message: 'Living Room TV has been offline for 2 hours',
            severity: 'low',
            timestamp: '2 hours ago',
            isRead: true
        }
    ])

    // Real-time Updates Simulation
    useEffect(() => {
        const timeInterval = setInterval(() => {
            setCurrentTime(new Date())
        }, 1000)

        return () => clearInterval(timeInterval)
    }, [])

    useEffect(() => {
        if (autoRefresh) {
            const interval = setInterval(() => {
                setHomeMetrics(prev => ({
                    ...prev,
                    energyUsage: Math.max(0.5, prev.energyUsage + (Math.random() - 0.5) * 0.2),
                    temperature: Math.max(18, Math.min(28, prev.temperature + (Math.random() - 0.5) * 0.5)),
                    humidity: Math.max(30, Math.min(70, prev.humidity + (Math.random() - 0.5) * 2))
                }))
            }, 5000)

            return () => clearInterval(interval)
        }
    }, [autoRefresh])

    // Navigation Views
    const navigationViews = [
        { id: 'overview', label: 'Overview', icon: Home, color: 'blue' },
        { id: 'devices', label: 'Devices', icon: Smartphone, color: 'purple', badge: homeMetrics.connectedDevices },
        { id: 'automation', label: 'Automation', icon: Zap, color: 'yellow', badge: homeMetrics.activeScenes },
        { id: 'security', label: 'Security', icon: Shield, color: 'red' },
        { id: 'energy', label: 'Energy', icon: Leaf, color: 'green' },
        { id: 'climate', label: 'Climate', icon: Thermometer, color: 'orange' },
        { id: 'entertainment', label: 'Entertainment', icon: Tv, color: 'indigo' },
        { id: 'settings', label: 'Settings', icon: Settings2, color: 'gray' }
    ]

    // Summary Cards Data
    const summaryCards = [
        {
            title: 'Connected Devices',
            value: homeMetrics.connectedDevices.toString(),
            change: `${smartDevices.filter(d => d.status === 'online').length} online`,
            changeType: 'neutral' as const,
            icon: Smartphone,
            color: 'blue'
        },
        {
            title: 'Energy Usage',
            value: `${homeMetrics.energyUsage.toFixed(1)} kW`,
            change: `${homeMetrics.energyTrend > 0 ? '+' : ''}${homeMetrics.energyTrend.toFixed(1)}%`,
            changeType: homeMetrics.energyTrend < 0 ? 'decrease' : 'increase' as const,
            icon: Zap,
            color: 'yellow'
        },
        {
            title: 'Temperature',
            value: `${homeMetrics.temperature.toFixed(1)}°C`,
            change: `${homeMetrics.humidity}% humidity`,
            changeType: 'neutral' as const,
            icon: Thermometer,
            color: 'orange'
        },
        {
            title: 'Security Status',
            value: homeMetrics.securityStatus.charAt(0).toUpperCase() + homeMetrics.securityStatus.slice(1),
            change: homeMetrics.alerts > 0 ? `${homeMetrics.alerts} alerts` : 'All secure',
            changeType: homeMetrics.alerts > 0 ? 'increase' : 'neutral' as const,
            icon: Shield,
            color: homeMetrics.securityStatus === 'alert' ? 'red' : 'green'
        }
    ]

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
            default: return Smartphone
        }
    }

    // Status Color Mapping
    const getStatusColor = (status: SmartDevice['status']) => {
        switch (status) {
            case 'online': return 'green'
            case 'offline': return 'red'
            case 'maintenance': return 'yellow'
            default: return 'gray'
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50">
            {/* Enhanced Header with Smart Home Status */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 rounded-2xl mx-6 mt-6 p-8 text-white shadow-2xl"
            >
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-4">
                        <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
                            <Home className="h-8 w-8" />
                        </div>
                        <div>
                            <h1 className="text-4xl font-bold">ACASAI</h1>
                            <p className="text-blue-100 text-lg">Smart Home Automation Platform</p>
                        </div>
                    </div>

                    <div className="flex items-center space-x-6">
                        <div className="text-right">
                            <p className="text-sm text-blue-100">Current Time</p>
                            <p className="text-2xl font-bold">{currentTime.toLocaleTimeString('ro-RO', {
                                hour: '2-digit',
                                minute: '2-digit'
                            })}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-blue-100">Connected</p>
                            <p className="text-2xl font-bold">{homeMetrics.connectedDevices}/24</p>
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-blue-100">Active Scenes</p>
                            <p className="text-2xl font-bold">{homeMetrics.activeScenes}</p>
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

                {/* Enhanced Navigation Tabs */}
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
                                {view.badge && (
                                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${isActive ? 'bg-blue-100 text-blue-600' : 'bg-white/20 text-white'
                                        }`}>
                                        {view.badge}
                                    </span>
                                )}
                            </motion.button>
                        )
                    })}
                </div>
            </motion.div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 p-6">
                {summaryCards.map((card, index) => {
                    const IconComponent = card.icon
                    return (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div className={`p-3 rounded-xl bg-${card.color}-100`}>
                                    <IconComponent className={`h-6 w-6 text-${card.color}-600`} />
                                </div>
                                <div className={`flex items-center space-x-1 text-sm ${card.changeType === 'increase' ? 'text-red-600' :
                                        card.changeType === 'decrease' ? 'text-green-600' : 'text-gray-600'
                                    }`}>
                                    {card.changeType === 'increase' ? (
                                        <TrendingUp className="h-4 w-4" />
                                    ) : card.changeType === 'decrease' ? (
                                        <TrendingDown className="h-4 w-4" />
                                    ) : (
                                        <Activity className="h-4 w-4" />
                                    )}
                                    <span className="font-medium">{card.change}</span>
                                </div>
                            </div>
                            <h3 className="text-gray-500 text-sm font-medium mb-1">{card.title}</h3>
                            <p className="text-3xl font-bold text-gray-900">{card.value}</p>
                        </motion.div>
                    )
                })}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
                {/* Device Status Grid */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold text-gray-900">Smart Devices</h2>
                            <div className="flex items-center space-x-2">
                                <span className="text-sm text-gray-500">Real-time status</span>
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {smartDevices.map((device) => {
                                const IconComponent = getDeviceIcon(device.type)
                                const statusColor = getStatusColor(device.status)

                                return (
                                    <motion.div
                                        key={device.id}
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        whileHover={{ scale: 1.02 }}
                                        className={`p-4 rounded-xl border-2 transition-all duration-200 ${device.isActive
                                                ? 'border-blue-200 bg-blue-50'
                                                : 'border-gray-200 bg-gray-50'
                                            }`}
                                    >
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center space-x-3">
                                                <div className={`p-2 rounded-lg bg-${statusColor}-100`}>
                                                    <IconComponent className={`h-5 w-5 text-${statusColor}-600`} />
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold text-gray-900">{device.name}</h3>
                                                    <p className="text-sm text-gray-500">{device.room}</p>
                                                </div>
                                            </div>
                                            <div className={`px-2 py-1 rounded-full text-xs font-medium ${device.status === 'online' ? 'bg-green-100 text-green-800' :
                                                    device.status === 'offline' ? 'bg-red-100 text-red-800' :
                                                        'bg-yellow-100 text-yellow-800'
                                                }`}>
                                                {device.status}
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-4">
                                                {device.value && (
                                                    <span className="text-lg font-bold text-gray-900">
                                                        {device.value}{device.unit}
                                                    </span>
                                                )}
                                                {device.battery && (
                                                    <div className="flex items-center space-x-1">
                                                        <Battery className="h-4 w-4 text-gray-400" />
                                                        <span className="text-sm text-gray-600">{device.battery}%</span>
                                                    </div>
                                                )}
                                            </div>
                                            <button
                                                className={`p-2 rounded-lg transition-colors ${device.isActive
                                                        ? 'bg-blue-500 text-white hover:bg-blue-600'
                                                        : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                                                    }`}
                                            >
                                                <Power className="h-4 w-4" />
                                            </button>
                                        </div>

                                        <div className="mt-2 text-xs text-gray-400 flex items-center">
                                            <Clock className="h-3 w-3 mr-1" />
                                            Last update: {device.lastUpdate}
                                        </div>
                                    </motion.div>
                                )
                            })}
                        </div>
                    </div>
                </div>

                {/* Right Sidebar */}
                <div className="space-y-6">
                    {/* Automation Scenes */}
                    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold text-gray-900">Automation Scenes</h3>
                            <Plus className="h-5 w-5 text-gray-400" />
                        </div>

                        <div className="space-y-3">
                            {automationScenes.map((scene) => (
                                <motion.div
                                    key={scene.id}
                                    whileHover={{ scale: 1.02 }}
                                    className={`p-3 rounded-lg border transition-all duration-200 ${scene.isActive
                                            ? 'border-green-200 bg-green-50'
                                            : 'border-gray-200 bg-gray-50'
                                        }`}
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <h4 className="font-semibold text-gray-900">{scene.name}</h4>
                                        <div className={`w-3 h-3 rounded-full ${scene.isActive ? 'bg-green-500' : 'bg-gray-300'
                                            }`}></div>
                                    </div>
                                    <p className="text-sm text-gray-600 mb-2">{scene.description}</p>
                                    <div className="flex items-center justify-between text-xs text-gray-500">
                                        <span>{scene.devices} devices</span>
                                        <span>{scene.schedule}</span>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    {/* Recent Alerts */}
                    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold text-gray-900">Recent Alerts</h3>
                            <Bell className="h-5 w-5 text-gray-400" />
                        </div>

                        <div className="space-y-3">
                            {recentAlerts.map((alert) => (
                                <motion.div
                                    key={alert.id}
                                    whileHover={{ scale: 1.02 }}
                                    className={`p-3 rounded-lg border transition-all duration-200 ${!alert.isRead ? 'border-blue-200 bg-blue-50' : 'border-gray-200 bg-gray-50'
                                        }`}
                                >
                                    <div className="flex items-start justify-between mb-2">
                                        <div className="flex items-center space-x-2">
                                            <div className={`w-2 h-2 rounded-full ${alert.severity === 'critical' ? 'bg-red-500' :
                                                    alert.severity === 'high' ? 'bg-orange-500' :
                                                        alert.severity === 'medium' ? 'bg-yellow-500' : 'bg-blue-500'
                                                }`}></div>
                                            <h4 className="font-semibold text-gray-900 text-sm">{alert.title}</h4>
                                        </div>
                                        <span className="text-xs text-gray-500">{alert.timestamp}</span>
                                    </div>
                                    <p className="text-sm text-gray-600">{alert.message}</p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Action Footer */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6"
            >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl p-6 text-white">
                        <div className="flex items-center space-x-3 mb-4">
                            <Zap className="h-8 w-8" />
                            <h3 className="text-xl font-bold">Energy Efficiency</h3>
                        </div>
                        <p className="text-blue-100 mb-4">Optimize your home's energy consumption</p>
                        <button className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg backdrop-blur-sm transition-colors flex items-center space-x-2">
                            <span>View Energy Report</span>
                            <ArrowRight className="h-4 w-4" />
                        </button>
                    </div>

                    <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl p-6 text-white">
                        <div className="flex items-center space-x-3 mb-4">
                            <Shield className="h-8 w-8" />
                            <h3 className="text-xl font-bold">Security Center</h3>
                        </div>
                        <p className="text-purple-100 mb-4">Monitor your home security status</p>
                        <button className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg backdrop-blur-sm transition-colors flex items-center space-x-2">
                            <span>Security Dashboard</span>
                            <ArrowRight className="h-4 w-4" />
                        </button>
                    </div>

                    <div className="bg-gradient-to-br from-green-500 to-teal-600 rounded-2xl p-6 text-white">
                        <div className="flex items-center space-x-3 mb-4">
                            <Settings2 className="h-8 w-8" />
                            <h3 className="text-xl font-bold">Smart Automation</h3>
                        </div>
                        <p className="text-green-100 mb-4">Create and manage automation scenes</p>
                        <button className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg backdrop-blur-sm transition-colors flex items-center space-x-2">
                            <span>Automation Hub</span>
                            <ArrowRight className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    )
}
