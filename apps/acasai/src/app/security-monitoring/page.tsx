'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
    // Security Icons
    Shield,
    ShieldCheck,
    ShieldAlert,
    ShieldX,
    Lock,
    Unlock,
    Key,
    KeyRound,

    // Camera and Monitoring Icons
    Camera,
    Video,
    Eye,
    EyeOff,
    Monitor,
    Tv,
    Play,
    Pause,
    Circle,

    // Alert and Notification Icons
    Bell,
    BellRing,
    AlertTriangle,
    AlertCircle,
    Info,
    CheckCircle,
    XCircle,

    // Access Control Icons
    Home as DoorIcon,
    DoorOpen,
    DoorClosed,
    Fingerprint,
    Scan,
    QrCode,
    CreditCard,

    // Sensor Icons
    Activity,
    Zap,
    Thermometer,
    Droplets,
    Wind,
    Flame,

    // Control Icons
    Settings2,
    Power,
    Volume2,
    VolumeX,
    Plus,
    Minus,
    RotateCcw,
    RefreshCw,

    // Location Icons
    MapPin,
    Navigation,
    Compass,
    Home,
    Building,
    Car,

    // Time and Status Icons
    Clock,
    Calendar,
    Timer,
    History,
    TrendingUp,
    TrendingDown,

    // Communication Icons
    Phone,
    PhoneCall,
    Mail,
    MessageSquare,
    Send,

    // Advanced Icons
    Cpu,
    Brain,
    Radar,
    Satellite,
    Radio,
    Wifi,

    // User Icons
    User,
    Users,
    UserCheck,
    UserX,
    Crown
} from 'lucide-react'

// Security & Monitoring Interfaces
interface SecurityCamera {
    id: string
    name: string
    location: string
    type: 'indoor' | 'outdoor' | 'doorbell' | 'ptz'
    status: 'online' | 'offline' | 'recording' | 'motion' | 'maintenance'
    isRecording: boolean
    hasMotion: boolean
    resolution: string
    nightVision: boolean
    audioEnabled: boolean
    batteryLevel?: number
    signalStrength: number
    lastMotion?: string
    recordingTime: number
    storageUsed: number
    viewAngle: number
    zoomLevel: number
    privacyMode: boolean
}

interface SecuritySensor {
    id: string
    name: string
    type: 'motion' | 'door' | 'window' | 'glass' | 'smoke' | 'water' | 'temperature' | 'vibration'
    location: string
    status: 'normal' | 'triggered' | 'tampered' | 'offline' | 'low-battery'
    batteryLevel: number
    signalStrength: number
    lastTriggered?: string
    triggerCount: number
    sensitivity: 'low' | 'medium' | 'high'
    enabled: boolean
    zoneId: string
}

interface SecurityAlert {
    id: string
    type: 'intrusion' | 'fire' | 'water' | 'medical' | 'system' | 'access'
    severity: 'low' | 'medium' | 'high' | 'critical'
    title: string
    description: string
    location: string
    timestamp: string
    status: 'active' | 'acknowledged' | 'resolved' | 'false-alarm'
    deviceId?: string
    cameraId?: string
    responseTime?: number
    acknowledgedBy?: string
}

interface AccessEntry {
    id: string
    userId: string
    userName: string
    userRole: 'owner' | 'family' | 'guest' | 'service' | 'emergency'
    entryMethod: 'key' | 'code' | 'card' | 'fingerprint' | 'face' | 'app'
    location: string
    timestamp: string
    status: 'granted' | 'denied' | 'forced'
    deviceId: string
    duration?: number
    ipAddress?: string
}

interface SecurityZone {
    id: string
    name: string
    description: string
    type: 'perimeter' | 'interior' | 'critical' | 'safe'
    enabled: boolean
    armed: boolean
    sensorCount: number
    cameraCount: number
    lastActivity?: string
    status: 'secure' | 'breach' | 'monitoring' | 'maintenance'
    alertLevel: 'normal' | 'elevated' | 'high' | 'critical'
}

interface SecurityProfile {
    id: string
    name: string
    description: string
    isActive: boolean
    zones: string[]
    cameras: string[]
    sensors: string[]
    alertSettings: {
        notifications: boolean
        email: boolean
        sms: boolean
        push: boolean
        siren: boolean
        lights: boolean
    }
    schedule?: {
        enabled: boolean
        startTime: string
        endTime: string
        days: string[]
    }
}

export default function SecurityMonitoringPage() {
    // State Management
    const [activeTab, setActiveTab] = useState('overview')
    const [selectedCamera, setSelectedCamera] = useState<SecurityCamera | null>(null)
    const [securityArmed, setSecurityArmed] = useState(true)
    const [privacyMode, setPrivacyMode] = useState(false)
    const [autoRefresh, setAutoRefresh] = useState(true)
    const [selectedZone, setSelectedZone] = useState<string>('all')

    // Security Cameras Data
    const [securityCameras, setSecurityCameras] = useState<SecurityCamera[]>([
        {
            id: 'cam-1',
            name: 'Front Door Camera',
            location: 'Main Entrance',
            type: 'doorbell',
            status: 'recording',
            isRecording: true,
            hasMotion: false,
            resolution: '1080p',
            nightVision: true,
            audioEnabled: true,
            batteryLevel: 87,
            signalStrength: 92,
            lastMotion: '5 min ago',
            recordingTime: 14.5,
            storageUsed: 2.3,
            viewAngle: 160,
            zoomLevel: 1.0,
            privacyMode: false
        },
        {
            id: 'cam-2',
            name: 'Backyard Security',
            location: 'Garden Area',
            type: 'outdoor',
            status: 'motion',
            isRecording: true,
            hasMotion: true,
            resolution: '4K',
            nightVision: true,
            audioEnabled: false,
            signalStrength: 78,
            lastMotion: 'Now',
            recordingTime: 8.2,
            storageUsed: 4.1,
            viewAngle: 120,
            zoomLevel: 1.2,
            privacyMode: false
        },
        {
            id: 'cam-3',
            name: 'Living Room Monitor',
            location: 'Living Room',
            type: 'indoor',
            status: 'online',
            isRecording: false,
            hasMotion: false,
            resolution: '1080p',
            nightVision: false,
            audioEnabled: true,
            signalStrength: 95,
            lastMotion: '2 hours ago',
            recordingTime: 0,
            storageUsed: 0.8,
            viewAngle: 110,
            zoomLevel: 1.0,
            privacyMode: true
        },
        {
            id: 'cam-4',
            name: 'Garage Security',
            location: 'Garage',
            type: 'indoor',
            status: 'online',
            isRecording: false,
            hasMotion: false,
            resolution: '720p',
            nightVision: true,
            audioEnabled: false,
            signalStrength: 84,
            lastMotion: '30 min ago',
            recordingTime: 0,
            storageUsed: 1.2,
            viewAngle: 90,
            zoomLevel: 1.0,
            privacyMode: false
        }
    ])

    // Security Sensors Data
    const [securitySensors, setSecuritySensors] = useState<SecuritySensor[]>([
        {
            id: 'sensor-1',
            name: 'Front Door Sensor',
            type: 'door',
            location: 'Main Entrance',
            status: 'normal',
            batteryLevel: 92,
            signalStrength: 89,
            lastTriggered: '3 hours ago',
            triggerCount: 47,
            sensitivity: 'high',
            enabled: true,
            zoneId: 'zone-1'
        },
        {
            id: 'sensor-2',
            name: 'Living Room Motion',
            type: 'motion',
            location: 'Living Room',
            status: 'triggered',
            batteryLevel: 76,
            signalStrength: 94,
            lastTriggered: 'Now',
            triggerCount: 23,
            sensitivity: 'medium',
            enabled: true,
            zoneId: 'zone-2'
        },
        {
            id: 'sensor-3',
            name: 'Kitchen Window',
            type: 'window',
            location: 'Kitchen',
            status: 'normal',
            batteryLevel: 84,
            signalStrength: 87,
            lastTriggered: '1 day ago',
            triggerCount: 12,
            sensitivity: 'high',
            enabled: true,
            zoneId: 'zone-1'
        },
        {
            id: 'sensor-4',
            name: 'Smoke Detector',
            type: 'smoke',
            location: 'Hallway',
            status: 'normal',
            batteryLevel: 98,
            signalStrength: 91,
            lastTriggered: 'Never',
            triggerCount: 0,
            sensitivity: 'high',
            enabled: true,
            zoneId: 'zone-2'
        }
    ])

    // Security Alerts Data
    const [securityAlerts, setSecurityAlerts] = useState<SecurityAlert[]>([
        {
            id: 'alert-1',
            type: 'intrusion',
            severity: 'high',
            title: 'Motion Detected - Backyard',
            description: 'Unusual movement detected in backyard area during armed hours',
            location: 'Garden Area',
            timestamp: '2 min ago',
            status: 'active',
            deviceId: 'sensor-2',
            cameraId: 'cam-2'
        },
        {
            id: 'alert-2',
            type: 'access',
            severity: 'medium',
            title: 'Front Door Access',
            description: 'Successful entry using mobile app authentication',
            location: 'Main Entrance',
            timestamp: '15 min ago',
            status: 'resolved',
            deviceId: 'sensor-1',
            responseTime: 2.3
        },
        {
            id: 'alert-3',
            type: 'system',
            severity: 'low',
            title: 'Camera Battery Low',
            description: 'Front door camera battery level below 20%',
            location: 'Main Entrance',
            timestamp: '1 hour ago',
            status: 'acknowledged',
            deviceId: 'cam-1',
            acknowledgedBy: 'System Admin'
        }
    ])

    // Security Zones Data
    const [securityZones, setSecurityZones] = useState<SecurityZone[]>([
        {
            id: 'zone-1',
            name: 'Perimeter Security',
            description: 'External doors, windows, and entry points',
            type: 'perimeter',
            enabled: true,
            armed: true,
            sensorCount: 8,
            cameraCount: 2,
            lastActivity: '15 min ago',
            status: 'monitoring',
            alertLevel: 'normal'
        },
        {
            id: 'zone-2',
            name: 'Interior Monitoring',
            description: 'Internal motion sensors and cameras',
            type: 'interior',
            enabled: true,
            armed: false,
            sensorCount: 4,
            cameraCount: 2,
            lastActivity: '2 min ago',
            status: 'breach',
            alertLevel: 'elevated'
        },
        {
            id: 'zone-3',
            name: 'Critical Systems',
            description: 'Fire, water, and emergency detection',
            type: 'critical',
            enabled: true,
            armed: true,
            sensorCount: 6,
            cameraCount: 0,
            lastActivity: 'None',
            status: 'secure',
            alertLevel: 'normal'
        }
    ])

    // Real-time Updates
    useEffect(() => {
        if (autoRefresh) {
            const interval = setInterval(() => {
                // Simulate real-time updates
                setSecurityCameras(prev => prev.map(camera => ({
                    ...camera,
                    signalStrength: Math.max(0, Math.min(100, camera.signalStrength + (Math.random() - 0.5) * 10)),
                    batteryLevel: camera.batteryLevel ? Math.max(0, Math.min(100, camera.batteryLevel + (Math.random() - 0.5) * 2)) : undefined,
                    hasMotion: Math.random() < 0.1 ? !camera.hasMotion : camera.hasMotion
                })))

                setSecuritySensors(prev => prev.map(sensor => ({
                    ...sensor,
                    signalStrength: Math.max(0, Math.min(100, sensor.signalStrength + (Math.random() - 0.5) * 5)),
                    batteryLevel: Math.max(0, Math.min(100, sensor.batteryLevel + (Math.random() - 0.5) * 1))
                })))
            }, 5000)

            return () => clearInterval(interval)
        }
    }, [autoRefresh])

    // Camera Status Color
    const getCameraStatusColor = (status: SecurityCamera['status']) => {
        switch (status) {
            case 'recording': return 'red'
            case 'motion': return 'orange'
            case 'online': return 'green'
            case 'offline': return 'gray'
            default: return 'blue'
        }
    }

    // Sensor Status Color
    const getSensorStatusColor = (status: SecuritySensor['status']) => {
        switch (status) {
            case 'triggered': return 'red'
            case 'tampered': return 'orange'
            case 'low-battery': return 'yellow'
            case 'normal': return 'green'
            case 'offline': return 'gray'
            default: return 'blue'
        }
    }

    // Alert Severity Color
    const getAlertSeverityColor = (severity: SecurityAlert['severity']) => {
        switch (severity) {
            case 'critical': return 'red'
            case 'high': return 'orange'
            case 'medium': return 'yellow'
            case 'low': return 'blue'
            default: return 'gray'
        }
    }

    // Tab Options
    const tabOptions = [
        { id: 'overview', label: 'Security Overview', icon: Shield, count: null },
        { id: 'cameras', label: 'Live Cameras', icon: Camera, count: securityCameras.filter(c => c.status !== 'offline').length },
        { id: 'sensors', label: 'Sensors', icon: Activity, count: securitySensors.filter(s => s.enabled).length },
        { id: 'alerts', label: 'Alerts', icon: Bell, count: securityAlerts.filter(a => a.status === 'active').length },
        { id: 'access', label: 'Access Control', icon: Lock, count: null },
        { id: 'zones', label: 'Security Zones', icon: MapPin, count: securityZones.filter(z => z.armed).length }
    ]

    return (
        <div className="p-6 space-y-6">
            {/* Enhanced Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-r from-red-600 via-orange-600 to-amber-600 rounded-2xl p-8 text-white shadow-2xl"
            >
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-4">
                        <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
                            <Shield className="h-8 w-8" />
                        </div>
                        <div>
                            <h1 className="text-4xl font-bold">Security & Monitoring</h1>
                            <p className="text-red-100 text-lg">Smart Home Protection System</p>
                        </div>
                    </div>

                    <div className="flex items-center space-x-6">
                        <div className="text-right">
                            <p className="text-sm text-red-100">System Status</p>
                            <p className={`text-2xl font-bold ${securityArmed ? 'text-white' : 'text-red-200'}`}>
                                {securityArmed ? 'ARMED' : 'DISARMED'}
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-red-100">Active Alerts</p>
                            <p className="text-2xl font-bold">{securityAlerts.filter(a => a.status === 'active').length}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-red-100">Cameras Online</p>
                            <p className="text-2xl font-bold">{securityCameras.filter(c => c.status !== 'offline').length}</p>
                        </div>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setSecurityArmed(!securityArmed)}
                            className={`px-6 py-3 rounded-xl font-bold transition-colors ${securityArmed
                                    ? 'bg-red-500 hover:bg-red-600 text-white'
                                    : 'bg-green-500 hover:bg-green-600 text-white'
                                }`}
                        >
                            {securityArmed ? 'DISARM SYSTEM' : 'ARM SYSTEM'}
                        </motion.button>
                    </div>
                </div>

                {/* Navigation Tabs */}
                <div className="flex space-x-1 bg-white/10 rounded-xl p-1 backdrop-blur-sm overflow-x-auto">
                    {tabOptions.map((tab) => {
                        const IconComponent = tab.icon
                        const isActive = activeTab === tab.id

                        return (
                            <motion.button
                                key={tab.id}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 relative whitespace-nowrap ${isActive
                                        ? 'bg-white text-red-600 shadow-lg'
                                        : 'text-white/80 hover:text-white hover:bg-white/10'
                                    }`}
                            >
                                <IconComponent className="h-4 w-4" />
                                <span className="font-medium">{tab.label}</span>
                                {tab.count !== null && (
                                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${isActive ? 'bg-red-100 text-red-600' : 'bg-white/20 text-white'
                                        }`}>
                                        {tab.count}
                                    </span>
                                )}
                            </motion.button>
                        )
                    })}
                </div>
            </motion.div>

            {/* Security Overview Tab */}
            {activeTab === 'overview' && (
                <div className="space-y-6">
                    {/* System Status Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className={`rounded-2xl p-6 text-white shadow-lg ${securityArmed ? 'bg-gradient-to-br from-green-500 to-emerald-600' : 'bg-gradient-to-br from-red-500 to-rose-600'
                                }`}
                        >
                            <div className="flex items-center space-x-3 mb-4">
                                {securityArmed ? <ShieldCheck className="h-8 w-8" /> : <ShieldX className="h-8 w-8" />}
                                <h3 className="text-xl font-bold">System Status</h3>
                            </div>
                            <p className="text-3xl font-bold">{securityArmed ? 'ARMED' : 'DISARMED'}</p>
                            <p className={securityArmed ? 'text-green-100' : 'text-red-100'}>
                                {securityArmed ? 'Full protection active' : 'Security system offline'}
                            </p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl p-6 text-white shadow-lg"
                        >
                            <div className="flex items-center space-x-3 mb-4">
                                <Camera className="h-8 w-8" />
                                <h3 className="text-xl font-bold">Live Cameras</h3>
                            </div>
                            <p className="text-3xl font-bold">{securityCameras.filter(c => c.status !== 'offline').length}</p>
                            <p className="text-blue-100">of {securityCameras.length} cameras online</p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl p-6 text-white shadow-lg"
                        >
                            <div className="flex items-center space-x-3 mb-4">
                                <Activity className="h-8 w-8" />
                                <h3 className="text-xl font-bold">Active Sensors</h3>
                            </div>
                            <p className="text-3xl font-bold">{securitySensors.filter(s => s.enabled).length}</p>
                            <p className="text-purple-100">monitoring all zones</p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className={`rounded-2xl p-6 text-white shadow-lg ${securityAlerts.filter(a => a.status === 'active').length > 0
                                    ? 'bg-gradient-to-br from-orange-500 to-red-600'
                                    : 'bg-gradient-to-br from-gray-500 to-gray-600'
                                }`}
                        >
                            <div className="flex items-center space-x-3 mb-4">
                                <Bell className="h-8 w-8" />
                                <h3 className="text-xl font-bold">Active Alerts</h3>
                            </div>
                            <p className="text-3xl font-bold">{securityAlerts.filter(a => a.status === 'active').length}</p>
                            <p className={securityAlerts.filter(a => a.status === 'active').length > 0 ? 'text-orange-100' : 'text-gray-100'}>
                                {securityAlerts.filter(a => a.status === 'active').length > 0 ? 'require attention' : 'all clear'}
                            </p>
                        </motion.div>
                    </div>

                    {/* Recent Activity */}
                    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">Recent Security Activity</h2>

                        <div className="space-y-4">
                            {securityAlerts.slice(0, 5).map((alert) => (
                                <motion.div
                                    key={alert.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className={`flex items-center justify-between p-4 rounded-xl border-l-4 ${alert.severity === 'critical' ? 'border-red-500 bg-red-50' :
                                            alert.severity === 'high' ? 'border-orange-500 bg-orange-50' :
                                                alert.severity === 'medium' ? 'border-yellow-500 bg-yellow-50' :
                                                    'border-blue-500 bg-blue-50'
                                        }`}
                                >
                                    <div className="flex items-center space-x-4">
                                        <div className={`p-2 rounded-lg ${alert.severity === 'critical' ? 'bg-red-100' :
                                                alert.severity === 'high' ? 'bg-orange-100' :
                                                    alert.severity === 'medium' ? 'bg-yellow-100' :
                                                        'bg-blue-100'
                                            }`}>
                                            {alert.type === 'intrusion' && <Shield className="h-5 w-5 text-red-600" />}
                                            {alert.type === 'access' && <Lock className="h-5 w-5 text-blue-600" />}
                                            {alert.type === 'system' && <Settings2 className="h-5 w-5 text-gray-600" />}
                                            {alert.type === 'fire' && <Flame className="h-5 w-5 text-red-600" />}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-900">{alert.title}</h3>
                                            <p className="text-sm text-gray-600">{alert.description}</p>
                                            <p className="text-xs text-gray-500">{alert.location} • {alert.timestamp}</p>
                                        </div>
                                    </div>

                                    <div className={`px-3 py-1 rounded-full text-xs font-medium ${alert.status === 'active' ? 'bg-red-100 text-red-800' :
                                            alert.status === 'acknowledged' ? 'bg-yellow-100 text-yellow-800' :
                                                'bg-green-100 text-green-800'
                                        }`}>
                                        {alert.status}
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Live Cameras Tab */}
            {activeTab === 'cameras' && (
                <div className="space-y-6">
                    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold text-gray-900">Live Camera Feeds</h2>
                            <div className="flex items-center space-x-3">
                                <button
                                    onClick={() => setPrivacyMode(!privacyMode)}
                                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${privacyMode ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-700'
                                        }`}
                                >
                                    {privacyMode ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    <span>Privacy Mode</span>
                                </button>
                                <button className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                                    <Circle className="h-4 w-4" />
                                    <span>Start Recording All</span>
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {securityCameras.map((camera) => {
                                const statusColor = getCameraStatusColor(camera.status)

                                return (
                                    <motion.div
                                        key={camera.id}
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        whileHover={{ scale: 1.02 }}
                                        className={`bg-white rounded-2xl p-4 shadow-lg border-2 transition-all cursor-pointer ${camera.status === 'motion' ? 'border-orange-300 shadow-orange-200' :
                                                camera.status === 'recording' ? 'border-red-300 shadow-red-200' :
                                                    'border-gray-200'
                                            }`}
                                        onClick={() => setSelectedCamera(camera)}
                                    >
                                        {/* Camera Feed Placeholder */}
                                        <div className={`relative bg-gray-900 rounded-xl mb-4 aspect-video overflow-hidden ${privacyMode || camera.privacyMode ? 'bg-gray-400' : ''
                                            }`}>
                                            {privacyMode || camera.privacyMode ? (
                                                <div className="flex items-center justify-center h-full">
                                                    <EyeOff className="h-12 w-12 text-gray-600" />
                                                </div>
                                            ) : (
                                                <div className="flex items-center justify-center h-full">
                                                    <Camera className="h-12 w-12 text-gray-400" />
                                                </div>
                                            )}

                                            {/* Status Indicators */}
                                            <div className="absolute top-2 left-2 flex space-x-2">
                                                {camera.isRecording && (
                                                    <div className="flex items-center space-x-1 bg-red-500 text-white px-2 py-1 rounded-full text-xs">
                                                        <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                                                        <span>REC</span>
                                                    </div>
                                                )}
                                                {camera.hasMotion && (
                                                    <div className="bg-orange-500 text-white px-2 py-1 rounded-full text-xs">
                                                        MOTION
                                                    </div>
                                                )}
                                            </div>

                                            {/* Signal Strength */}
                                            <div className="absolute top-2 right-2">
                                                <div className="flex items-center space-x-1 bg-black/50 text-white px-2 py-1 rounded-full text-xs">
                                                    <Wifi className="h-3 w-3" />
                                                    <span>{camera.signalStrength}%</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Camera Info */}
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between">
                                                <h3 className="font-bold text-gray-900">{camera.name}</h3>
                                                <div className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor === 'red' ? 'bg-red-100 text-red-800' :
                                                        statusColor === 'orange' ? 'bg-orange-100 text-orange-800' :
                                                            statusColor === 'green' ? 'bg-green-100 text-green-800' :
                                                                'bg-gray-100 text-gray-800'
                                                    }`}>
                                                    {camera.status}
                                                </div>
                                            </div>

                                            <p className="text-sm text-gray-600">{camera.location}</p>

                                            <div className="grid grid-cols-2 gap-2 text-xs text-gray-500">
                                                <div>Resolution: {camera.resolution}</div>
                                                <div>Angle: {camera.viewAngle}°</div>
                                                {camera.batteryLevel && (
                                                    <>
                                                        <div>Battery: {camera.batteryLevel}%</div>
                                                        <div>Storage: {camera.storageUsed}GB</div>
                                                    </>
                                                )}
                                            </div>

                                            {camera.lastMotion && (
                                                <p className="text-xs text-gray-500">Last motion: {camera.lastMotion}</p>
                                            )}
                                        </div>

                                        {/* Camera Controls */}
                                        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    setSecurityCameras(prev => prev.map(c =>
                                                        c.id === camera.id ? { ...c, isRecording: !c.isRecording } : c
                                                    ))
                                                }}
                                                className={`p-2 rounded-lg transition-colors ${camera.isRecording
                                                        ? 'bg-red-500 text-white hover:bg-red-600'
                                                        : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                                                    }`}
                                            >
                                                {camera.isRecording ? <Pause className="h-4 w-4" /> : <Circle className="h-4 w-4" />}
                                            </button>

                                            <div className="flex items-center space-x-1">
                                                <button className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
                                                    <Volume2 className="h-4 w-4" />
                                                </button>
                                                <button className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
                                                    <Settings2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                )
                            })}
                        </div>
                    </div>
                </div>
            )}

            {/* Sensors Tab */}
            {activeTab === 'sensors' && (
                <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Security Sensors</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {securitySensors.map((sensor) => {
                            const statusColor = getSensorStatusColor(sensor.status)

                            return (
                                <motion.div
                                    key={sensor.id}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className={`bg-white rounded-2xl p-6 shadow-lg border-2 transition-all ${sensor.status === 'triggered' ? 'border-red-300 bg-red-50' :
                                            sensor.status === 'tampered' ? 'border-orange-300 bg-orange-50' :
                                                'border-gray-200'
                                        }`}
                                >
                                    {/* Sensor Header */}
                                    <div className="flex items-center justify-between mb-4">
                                        <div className={`p-3 rounded-xl ${statusColor === 'red' ? 'bg-red-100' :
                                                statusColor === 'orange' ? 'bg-orange-100' :
                                                    statusColor === 'yellow' ? 'bg-yellow-100' :
                                                        statusColor === 'green' ? 'bg-green-100' :
                                                            'bg-gray-100'
                                            }`}>
                                            {sensor.type === 'motion' && <Activity className={`h-6 w-6 text-${statusColor}-600`} />}
                                            {sensor.type === 'door' && <DoorIcon className={`h-6 w-6 text-${statusColor}-600`} />}
                                            {sensor.type === 'window' && <Home className={`h-6 w-6 text-${statusColor}-600`} />}
                                            {sensor.type === 'smoke' && <Flame className={`h-6 w-6 text-${statusColor}-600`} />}
                                            {sensor.type === 'water' && <Droplets className={`h-6 w-6 text-${statusColor}-600`} />}
                                        </div>

                                        <div className={`px-3 py-1 rounded-full text-xs font-medium ${statusColor === 'red' ? 'bg-red-100 text-red-800' :
                                                statusColor === 'orange' ? 'bg-orange-100 text-orange-800' :
                                                    statusColor === 'yellow' ? 'bg-yellow-100 text-yellow-800' :
                                                        statusColor === 'green' ? 'bg-green-100 text-green-800' :
                                                            'bg-gray-100 text-gray-800'
                                            }`}>
                                            {sensor.status}
                                        </div>
                                    </div>

                                    {/* Sensor Info */}
                                    <div className="space-y-3 mb-4">
                                        <h3 className="font-bold text-gray-900">{sensor.name}</h3>
                                        <p className="text-sm text-gray-600 capitalize">{sensor.type} sensor • {sensor.location}</p>

                                        <div className="space-y-2 text-sm">
                                            <div className="flex items-center justify-between">
                                                <span className="text-gray-500">Battery</span>
                                                <span className={`font-medium ${sensor.batteryLevel > 50 ? 'text-green-600' :
                                                        sensor.batteryLevel > 20 ? 'text-yellow-600' :
                                                            'text-red-600'
                                                    }`}>
                                                    {sensor.batteryLevel}%
                                                </span>
                                            </div>

                                            <div className="flex items-center justify-between">
                                                <span className="text-gray-500">Signal</span>
                                                <span className="font-medium text-blue-600">{sensor.signalStrength}%</span>
                                            </div>

                                            <div className="flex items-center justify-between">
                                                <span className="text-gray-500">Sensitivity</span>
                                                <span className="font-medium text-purple-600 capitalize">{sensor.sensitivity}</span>
                                            </div>

                                            <div className="flex items-center justify-between">
                                                <span className="text-gray-500">Triggers</span>
                                                <span className="font-medium text-gray-700">{sensor.triggerCount}</span>
                                            </div>
                                        </div>

                                        {sensor.lastTriggered && sensor.lastTriggered !== 'Never' && (
                                            <p className="text-xs text-gray-500">Last triggered: {sensor.lastTriggered}</p>
                                        )}
                                    </div>

                                    {/* Sensor Controls */}
                                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                                        <button
                                            onClick={() => {
                                                setSecuritySensors(prev => prev.map(s =>
                                                    s.id === sensor.id ? { ...s, enabled: !s.enabled } : s
                                                ))
                                            }}
                                            className={`p-2 rounded-lg transition-colors ${sensor.enabled
                                                    ? 'bg-green-500 text-white hover:bg-green-600'
                                                    : 'bg-gray-300 text-gray-600 hover:bg-gray-400'
                                                }`}
                                        >
                                            <Power className="h-4 w-4" />
                                        </button>

                                        <div className="flex items-center space-x-1">
                                            <button className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
                                                <Settings2 className="h-4 w-4" />
                                            </button>
                                            <button className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
                                                <History className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            )
                        })}
                    </div>
                </div>
            )}

            {/* Security Analytics Footer */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-1 md:grid-cols-4 gap-6"
            >
                <div className="bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl p-6 text-white">
                    <div className="flex items-center space-x-3 mb-4">
                        <Shield className="h-8 w-8" />
                        <h3 className="text-xl font-bold">Protection Level</h3>
                    </div>
                    <p className="text-3xl font-bold">
                        {Math.round((securitySensors.filter(s => s.enabled).length / securitySensors.length) * 100)}%
                    </p>
                    <p className="text-blue-100">sensors active</p>
                </div>

                <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-6 text-white">
                    <div className="flex items-center space-x-3 mb-4">
                        <CheckCircle className="h-8 w-8" />
                        <h3 className="text-xl font-bold">System Health</h3>
                    </div>
                    <p className="text-3xl font-bold">
                        {Math.round((securityCameras.filter(c => c.status !== 'offline').length + securitySensors.filter(s => s.status === 'normal').length) / (securityCameras.length + securitySensors.length) * 100)}%
                    </p>
                    <p className="text-green-100">devices healthy</p>
                </div>

                <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl p-6 text-white">
                    <div className="flex items-center space-x-3 mb-4">
                        <Camera className="h-8 w-8" />
                        <h3 className="text-xl font-bold">Recording Time</h3>
                    </div>
                    <p className="text-3xl font-bold">
                        {securityCameras.reduce((sum, c) => sum + c.recordingTime, 0).toFixed(1)}h
                    </p>
                    <p className="text-purple-100">today</p>
                </div>

                <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl p-6 text-white">
                    <div className="flex items-center space-x-3 mb-4">
                        <Bell className="h-8 w-8" />
                        <h3 className="text-xl font-bold">Response Time</h3>
                    </div>
                    <p className="text-3xl font-bold">
                        {securityAlerts.filter(a => a.responseTime).length > 0
                            ? (securityAlerts.reduce((sum, a) => sum + (a.responseTime || 0), 0) / securityAlerts.filter(a => a.responseTime).length).toFixed(1)
                            : '0.0'
                        }s
                    </p>
                    <p className="text-orange-100">average alert</p>
                </div>
            </motion.div>
        </div>
    )
}
