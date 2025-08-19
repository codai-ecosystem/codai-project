'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Tv,
    Volume2,
    VolumeX,
    Play,
    Pause,
    SkipForward,
    SkipBack,
    Shuffle,
    Repeat,
    Music,
    Mic,
    Speaker,
    Headphones,
    Radio,
    Disc3,
    Camera,
    Video,
    Cast,
    Wifi,
    Bluetooth,
    Settings,
    Power,
    Home,
    Users,
    Clock,
    Calendar,
    Target,
    Activity,
    Zap,
    TrendingUp,
    TrendingDown,
    AlertTriangle,
    CheckCircle,
    BarChart3,
    PieChart,
    LineChart,
    Monitor,
    Smartphone,
    Tablet,
    Laptop,
    Download,
    Share2,
    Filter,
    Search,
    MoreHorizontal,
    Maximize2,
    Minimize2,
    Edit,
    Save,
    X,
    Plus,
    Minus,
    RefreshCw,
    Eye,
    EyeOff,
    Star,
    Heart,
    ThumbsUp,
    MessageCircle,
    Bookmark,
    Grid3X3,
    List,
    Layers,
    Gamepad2,
    Joystick,
    Airplay,
    Sun,
    Moon,
    Lightbulb,
    Image,
    Film,
    PlayCircle,
    PauseCircle,
    StopCircle,
    FastForward,
    Rewind,
    RotateCcw,
    Volume1,
    VolumeOff,
    MicOff,
    Info,
    Timer,
    MapPin,
    Layers3,
    Square,
    Circle,
    Triangle
} from 'lucide-react'

// Entertainment system interfaces
interface MediaDevice {
    id: string
    name: string
    type: 'tv' | 'soundbar' | 'speaker' | 'receiver' | 'streaming_device' | 'gaming_console' | 'projector' | 'camera'
    brand: string
    model: string
    room: string
    status: 'online' | 'offline' | 'playing' | 'paused' | 'standby' | 'error'
    powerState: boolean
    volume: number
    muted: boolean
    currentSource: string
    availableSources: string[]
    currentContent?: {
        title: string
        type: 'movie' | 'tv_show' | 'music' | 'game' | 'stream'
        duration?: number
        position?: number
        channel?: string
        artist?: string
        album?: string
    }
    connectedDevices: string[]
    smartFeatures: string[]
    energyUsage: number // watts
    lastUpdate: string
    firmware: string
    warranty: string
    resolution?: string
    audioFormats?: string[]
    videoFormats?: string[]
    connectivity: string[]
}

interface MediaScene {
    id: string
    name: string
    description: string
    icon: string
    devices: Array<{
        deviceId: string
        deviceName: string
        actions: {
            power?: boolean
            volume?: number
            source?: string
            content?: string
            settings?: Record<string, any>
        }
    }>
    ambiance: {
        lighting?: {
            brightness: number
            color: string
            temperature: number
        }
        climate?: {
            temperature: number
            mode: string
        }
    }
    schedule?: {
        enabled: boolean
        time: string
        days: string[]
    }
    triggers: string[]
    lastActivated?: string
    activationCount: number
    estimatedDuration: number
    popularity: number
    category: 'movie' | 'music' | 'gaming' | 'sports' | 'relaxation' | 'party'
}

interface StreamingService {
    id: string
    name: string
    logo: string
    subscription: 'active' | 'inactive' | 'trial' | 'expired'
    quality: '720p' | '1080p' | '4K' | '8K'
    devices: string[]
    genres: string[]
    recommendations: Array<{
        title: string
        type: 'movie' | 'tv_show' | 'documentary' | 'series' | 'playlist'
        rating: number
        duration: number
        thumbnail: string
    }>
    usage: {
        hoursWatched: number
        favoriteGenre: string
        lastWatched: string
    }
    cost: number
    renewalDate: string
}

interface MediaSchedule {
    id: string
    name: string
    sceneId: string
    sceneName: string
    time: string
    days: string[]
    enabled: boolean
    type: 'entertainment' | 'background' | 'focus' | 'sleep' | 'wake_up'
    autoOff?: {
        enabled: boolean
        duration: number // minutes
    }
    conditions: string[]
    priority: number
    recurring: boolean
}

interface MediaAlert {
    id: string
    type: 'device_offline' | 'low_storage' | 'update_available' | 'subscription_expiring' | 'content_reminder'
    severity: 'critical' | 'high' | 'medium' | 'low'
    device?: string
    service?: string
    title: string
    message: string
    timestamp: string
    resolved: boolean
    action?: string
    dueDate?: string
}

const EntertainmentMediaPage = () => {
    const [activeTab, setActiveTab] = useState('overview')
    const [selectedDevice, setSelectedDevice] = useState<string | null>(null)
    const [selectedScene, setSelectedScene] = useState<string | null>(null)
    const [showRemoteControl, setShowRemoteControl] = useState(false)
    const [globalVolume, setGlobalVolume] = useState(65)
    const [isGlobalMuted, setIsGlobalMuted] = useState(false)

    // Mock data - simulating real-time entertainment data
    const [mediaDevices, setMediaDevices] = useState<MediaDevice[]>([
        {
            id: '1',
            name: 'Living Room TV',
            type: 'tv',
            brand: 'Samsung',
            model: 'QN85A 85" QLED',
            room: 'Living Room',
            status: 'playing',
            powerState: true,
            volume: 45,
            muted: false,
            currentSource: 'Netflix',
            availableSources: ['Netflix', 'Disney+', 'YouTube', 'HDMI 1', 'HDMI 2', 'Cable'],
            currentContent: {
                title: 'The Crown',
                type: 'tv_show',
                duration: 3600,
                position: 1850,
                channel: 'Netflix'
            },
            connectedDevices: ['Soundbar', 'Apple TV', 'PlayStation 5'],
            smartFeatures: ['Voice Control', 'Smart Hub', 'Screen Mirroring', 'Auto Game Mode'],
            energyUsage: 180,
            lastUpdate: '2 minutes ago',
            firmware: '1.4.2',
            warranty: '2 years remaining',
            resolution: '4K UHD',
            audioFormats: ['Dolby Atmos', 'DTS', 'PCM'],
            videoFormats: ['HDR10+', 'Dolby Vision'],
            connectivity: ['WiFi 6', 'Bluetooth 5.0', 'HDMI 2.1', 'USB 3.0']
        },
        {
            id: '2',
            name: 'Sonos Soundbar',
            type: 'soundbar',
            brand: 'Sonos',
            model: 'Arc',
            room: 'Living Room',
            status: 'playing',
            powerState: true,
            volume: 60,
            muted: false,
            currentSource: 'TV Audio',
            availableSources: ['TV Audio', 'Bluetooth', 'Spotify', 'Apple Music'],
            currentContent: {
                title: 'The Crown - Audio',
                type: 'tv_show'
            },
            connectedDevices: ['Living Room TV', 'iPhone', 'iPad'],
            smartFeatures: ['Dolby Atmos', 'Voice Control', 'Multi-room Audio', 'Adaptive EQ'],
            energyUsage: 35,
            lastUpdate: '1 minute ago',
            firmware: '14.2.1',
            warranty: '1 year remaining',
            audioFormats: ['Dolby Atmos', 'DTS', 'PCM', 'Dolby Digital Plus'],
            connectivity: ['WiFi', 'Bluetooth', 'HDMI eARC', 'Ethernet']
        },
        {
            id: '3',
            name: 'Bedroom Smart Display',
            type: 'tv',
            brand: 'Google',
            model: 'Nest Hub Max',
            room: 'Master Bedroom',
            status: 'standby',
            powerState: true,
            volume: 25,
            muted: false,
            currentSource: 'YouTube Music',
            availableSources: ['YouTube Music', 'Spotify', 'Netflix', 'YouTube', 'Google Photos'],
            connectedDevices: ['Bedroom Speaker', 'Smart Lights'],
            smartFeatures: ['Voice Control', 'Video Calling', 'Smart Home Hub', 'Sleep Sounds'],
            energyUsage: 15,
            lastUpdate: '5 minutes ago',
            firmware: '12.1.0',
            warranty: '6 months remaining',
            resolution: '1280x800',
            connectivity: ['WiFi', 'Bluetooth']
        },
        {
            id: '4',
            name: 'Home Theater Receiver',
            type: 'receiver',
            brand: 'Denon',
            model: 'AVR-X3700H',
            room: 'Living Room',
            status: 'playing',
            powerState: true,
            volume: 70,
            muted: false,
            currentSource: 'TV',
            availableSources: ['TV', 'Blu-ray', 'Gaming', 'Streaming', 'Vinyl'],
            connectedDevices: ['Speakers', 'Subwoofer', 'TV', 'Gaming Console'],
            smartFeatures: ['8K Passthrough', 'Dolby Atmos', 'Multi-zone Audio', 'Room Correction'],
            energyUsage: 120,
            lastUpdate: '3 minutes ago',
            firmware: '2.8.5',
            warranty: '3 years remaining',
            audioFormats: ['Dolby Atmos', 'DTS:X', 'Auro-3D'],
            videoFormats: ['8K', '4K HDR', 'Dolby Vision'],
            connectivity: ['WiFi', 'Bluetooth', 'HDMI 2.1', 'Ethernet', 'AirPlay 2']
        },
        {
            id: '5',
            name: 'Kitchen Speaker',
            type: 'speaker',
            brand: 'Sonos',
            model: 'One SL',
            room: 'Kitchen',
            status: 'playing',
            powerState: true,
            volume: 40,
            muted: false,
            currentSource: 'Spotify',
            availableSources: ['Spotify', 'Apple Music', 'Radio', 'Podcast'],
            currentContent: {
                title: 'Chill Indie Folk',
                type: 'music',
                artist: 'Various Artists',
                album: 'Playlist'
            },
            connectedDevices: ['iPhone', 'iPad', 'Living Room System'],
            smartFeatures: ['Multi-room Audio', 'Voice Control', 'Touch Controls', 'Auto Trueplay'],
            energyUsage: 8,
            lastUpdate: '1 minute ago',
            firmware: '14.2.1',
            warranty: '1 year remaining',
            audioFormats: ['PCM', 'Dolby Digital'],
            connectivity: ['WiFi', 'Ethernet']
        },
        {
            id: '6',
            name: 'Gaming Console',
            type: 'gaming_console',
            brand: 'Sony',
            model: 'PlayStation 5',
            room: 'Living Room',
            status: 'standby',
            powerState: false,
            volume: 80,
            muted: false,
            currentSource: 'Game Library',
            availableSources: ['Game Library', 'Blu-ray', 'Streaming Apps', 'Media Player'],
            connectedDevices: ['TV', 'Wireless Controller', 'Headset'],
            smartFeatures: ['4K Gaming', 'Ray Tracing', 'Haptic Feedback', 'Activity Cards'],
            energyUsage: 0,
            lastUpdate: '30 minutes ago',
            firmware: '8.0.2',
            warranty: '1 year remaining',
            resolution: '4K UHD',
            connectivity: ['WiFi 6', 'Bluetooth 5.0', 'HDMI 2.1', 'USB-A', 'USB-C']
        }
    ])

    const [mediaScenes, setMediaScenes] = useState<MediaScene[]>([
        {
            id: '1',
            name: 'Movie Night',
            description: 'Perfect setting for watching movies',
            icon: 'film',
            devices: [
                {
                    deviceId: '1',
                    deviceName: 'Living Room TV',
                    actions: { power: true, volume: 50, source: 'Netflix' }
                },
                {
                    deviceId: '2',
                    deviceName: 'Sonos Soundbar',
                    actions: { power: true, volume: 75 }
                },
                {
                    deviceId: '4',
                    deviceName: 'Home Theater Receiver',
                    actions: { power: true, volume: 70, source: 'TV' }
                }
            ],
            ambiance: {
                lighting: { brightness: 15, color: 'warm', temperature: 2700 },
                climate: { temperature: 21, mode: 'cool' }
            },
            triggers: ['Voice Command', 'Schedule', 'Manual'],
            lastActivated: '2 days ago',
            activationCount: 24,
            estimatedDuration: 120,
            popularity: 95,
            category: 'movie'
        },
        {
            id: '2',
            name: 'Music Party',
            description: 'Multi-room audio for entertaining',
            icon: 'music',
            devices: [
                {
                    deviceId: '2',
                    deviceName: 'Sonos Soundbar',
                    actions: { power: true, volume: 85, source: 'Spotify' }
                },
                {
                    deviceId: '5',
                    deviceName: 'Kitchen Speaker',
                    actions: { power: true, volume: 80, source: 'Spotify' }
                }
            ],
            ambiance: {
                lighting: { brightness: 80, color: 'colorful', temperature: 4000 }
            },
            triggers: ['Voice Command', 'Manual'],
            lastActivated: '1 week ago',
            activationCount: 8,
            estimatedDuration: 180,
            popularity: 78,
            category: 'party'
        },
        {
            id: '3',
            name: 'Gaming Session',
            description: 'Optimized for gaming experience',
            icon: 'gamepad',
            devices: [
                {
                    deviceId: '1',
                    deviceName: 'Living Room TV',
                    actions: { power: true, volume: 60, source: 'HDMI 1', settings: { gameMode: true } }
                },
                {
                    deviceId: '6',
                    deviceName: 'Gaming Console',
                    actions: { power: true }
                }
            ],
            ambiance: {
                lighting: { brightness: 60, color: 'blue', temperature: 6500 }
            },
            triggers: ['Console Power On', 'Voice Command'],
            lastActivated: '3 days ago',
            activationCount: 18,
            estimatedDuration: 90,
            popularity: 82,
            category: 'gaming'
        },
        {
            id: '4',
            name: 'Bedtime Wind Down',
            description: 'Relaxing content for sleep preparation',
            icon: 'moon',
            devices: [
                {
                    deviceId: '3',
                    deviceName: 'Bedroom Smart Display',
                    actions: { power: true, volume: 20, source: 'Sleep Sounds' }
                }
            ],
            ambiance: {
                lighting: { brightness: 5, color: 'warm', temperature: 2200 },
                climate: { temperature: 19, mode: 'cool' }
            },
            schedule: {
                enabled: true,
                time: '21:30',
                days: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
            },
            triggers: ['Schedule', 'Voice Command'],
            lastActivated: 'yesterday',
            activationCount: 45,
            estimatedDuration: 60,
            popularity: 88,
            category: 'relaxation'
        }
    ])

    const [streamingServices, setStreamingServices] = useState<StreamingService[]>([
        {
            id: '1',
            name: 'Netflix',
            logo: 'netflix-logo',
            subscription: 'active',
            quality: '4K',
            devices: ['Living Room TV', 'Bedroom Smart Display'],
            genres: ['Drama', 'Comedy', 'Documentary', 'Action'],
            recommendations: [
                { title: 'The Crown', type: 'series', rating: 9.1, duration: 3600, thumbnail: 'crown.jpg' },
                { title: 'Stranger Things', type: 'series', rating: 8.8, duration: 3000, thumbnail: 'st.jpg' }
            ],
            usage: {
                hoursWatched: 156,
                favoriteGenre: 'Drama',
                lastWatched: '2 hours ago'
            },
            cost: 19.99,
            renewalDate: '2025-09-15'
        },
        {
            id: '2',
            name: 'Spotify',
            logo: 'spotify-logo',
            subscription: 'active',
            quality: '1080p',
            devices: ['Sonos Soundbar', 'Kitchen Speaker', 'Bedroom Smart Display'],
            genres: ['Pop', 'Rock', 'Jazz', 'Classical'],
            recommendations: [
                { title: 'Chill Indie Folk', type: 'playlist', rating: 4.8, duration: 7200, thumbnail: 'folk.jpg' },
                { title: 'Top Hits 2025', type: 'playlist', rating: 4.6, duration: 3600, thumbnail: 'hits.jpg' }
            ],
            usage: {
                hoursWatched: 89,
                favoriteGenre: 'Indie Folk',
                lastWatched: '30 minutes ago'
            },
            cost: 12.99,
            renewalDate: '2025-08-28'
        },
        {
            id: '3',
            name: 'Disney+',
            logo: 'disney-logo',
            subscription: 'active',
            quality: '4K',
            devices: ['Living Room TV'],
            genres: ['Family', 'Animation', 'Marvel', 'Star Wars'],
            recommendations: [
                { title: 'The Mandalorian', type: 'series', rating: 8.9, duration: 2400, thumbnail: 'mando.jpg' },
                { title: 'Encanto', type: 'movie', rating: 8.2, duration: 6600, thumbnail: 'encanto.jpg' }
            ],
            usage: {
                hoursWatched: 42,
                favoriteGenre: 'Marvel',
                lastWatched: '1 week ago'
            },
            cost: 8.99,
            renewalDate: '2025-10-05'
        }
    ])

    const [mediaAlerts, setMediaAlerts] = useState<MediaAlert[]>([
        {
            id: '1',
            type: 'update_available',
            severity: 'medium',
            device: 'Living Room TV',
            title: 'Firmware Update Available',
            message: 'Samsung TV firmware update 1.4.3 available with new features',
            timestamp: '4 hours ago',
            resolved: false,
            action: 'Update firmware'
        },
        {
            id: '2',
            type: 'subscription_expiring',
            severity: 'low',
            service: 'Spotify',
            title: 'Subscription Renewal',
            message: 'Your Spotify Premium subscription renews in 19 days',
            timestamp: '1 day ago',
            resolved: false,
            dueDate: '2025-08-28'
        }
    ])

    // Real-time updates simulation
    useEffect(() => {
        const interval = setInterval(() => {
            setMediaDevices(prev => prev.map(device => ({
                ...device,
                volume: device.status === 'playing'
                    ? Math.min(100, Math.max(0, device.volume + (Math.random() - 0.5) * 2))
                    : device.volume,
                energyUsage: device.powerState
                    ? Math.max(0, device.energyUsage + (Math.random() - 0.5) * 5)
                    : 0,
                currentContent: device.currentContent && device.status === 'playing'
                    ? {
                        ...device.currentContent,
                        position: device.currentContent.position
                            ? Math.min(device.currentContent.duration || 0, device.currentContent.position + 3)
                            : device.currentContent.position
                    }
                    : device.currentContent
            })))
        }, 3000)

        return () => clearInterval(interval)
    }, [])

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'online':
            case 'playing':
                return 'text-green-600 bg-green-100 border-green-200'
            case 'paused':
            case 'standby':
                return 'text-yellow-600 bg-yellow-100 border-yellow-200'
            case 'offline':
            case 'error':
                return 'text-red-600 bg-red-100 border-red-200'
            default:
                return 'text-gray-600 bg-gray-100 border-gray-200'
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

    const getDeviceIcon = (type: string) => {
        switch (type) {
            case 'tv':
                return <Tv className="w-5 h-5" />
            case 'soundbar':
            case 'speaker':
                return <Speaker className="w-5 h-5" />
            case 'receiver':
                return <Radio className="w-5 h-5" />
            case 'streaming_device':
                return <Cast className="w-5 h-5" />
            case 'gaming_console':
                return <Gamepad2 className="w-5 h-5" />
            case 'projector':
                return <Video className="w-5 h-5" />
            case 'camera':
                return <Camera className="w-5 h-5" />
            default:
                return <Monitor className="w-5 h-5" />
        }
    }

    const getSceneIcon = (category: string) => {
        switch (category) {
            case 'movie':
                return <Film className="w-5 h-5" />
            case 'music':
            case 'party':
                return <Music className="w-5 h-5" />
            case 'gaming':
                return <Gamepad2 className="w-5 h-5" />
            case 'relaxation':
                return <Moon className="w-5 h-5" />
            default:
                return <PlayCircle className="w-5 h-5" />
        }
    }

    const formatTime = (seconds: number) => {
        const hours = Math.floor(seconds / 3600)
        const minutes = Math.floor((seconds % 3600) / 60)
        const secs = seconds % 60
        return hours > 0
            ? `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
            : `${minutes}:${secs.toString().padStart(2, '0')}`
    }

    const activeDevices = mediaDevices.filter(device => device.powerState).length
    const playingDevices = mediaDevices.filter(device => device.status === 'playing').length
    const totalEnergyUsage = mediaDevices.reduce((sum, device) => sum + device.energyUsage, 0)
    const avgVolume = mediaDevices.filter(d => d.powerState).reduce((sum, d) => sum + d.volume, 0) /
        Math.max(1, mediaDevices.filter(d => d.powerState).length)

    const tabs = [
        { id: 'overview', label: 'Entertainment Overview', icon: <Home className="w-4 h-4" /> },
        { id: 'devices', label: 'Media Devices', icon: <Tv className="w-4 h-4" /> },
        { id: 'scenes', label: 'Entertainment Scenes', icon: <PlayCircle className="w-4 h-4" /> },
        { id: 'streaming', label: 'Streaming Services', icon: <Cast className="w-4 h-4" /> },
        { id: 'schedules', label: 'Media Schedules', icon: <Calendar className="w-4 h-4" /> },
        { id: 'analytics', label: 'Usage Analytics', icon: <BarChart3 className="w-4 h-4" /> }
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
                                    <Tv className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-xl font-bold text-gray-900">Entertainment & Media</h1>
                                    <p className="text-sm text-gray-600">Smart entertainment systems control</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center space-x-4">
                            <div className="hidden md:flex items-center space-x-6 text-sm">
                                <div className="text-center">
                                    <p className="text-gray-500">Active Devices</p>
                                    <p className="font-semibold text-gray-900">{activeDevices}/{mediaDevices.length}</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-gray-500">Playing</p>
                                    <p className="font-semibold text-green-600">{playingDevices}</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-gray-500">Avg Volume</p>
                                    <p className="font-semibold text-blue-600">{avgVolume.toFixed(0)}%</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-gray-500">Power Usage</p>
                                    <p className="font-semibold text-orange-600">{totalEnergyUsage}W</p>
                                </div>
                            </div>

                            <div className="flex items-center space-x-2">
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => setShowRemoteControl(!showRemoteControl)}
                                    className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${showRemoteControl
                                            ? 'bg-blue-100 text-blue-700 border-blue-200'
                                            : 'bg-gray-100 text-gray-700 border-gray-200'
                                        }`}
                                >
                                    <div className="flex items-center space-x-2">
                                        <Smartphone className="w-4 h-4" />
                                        <span>Remote</span>
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
                    {/* Entertainment Overview Tab */}
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
                                            <p className="text-sm font-medium text-gray-600">Active Devices</p>
                                            <p className="text-2xl font-bold text-gray-900">{activeDevices}</p>
                                            <p className="text-sm text-green-600 flex items-center">
                                                <CheckCircle className="w-4 h-4 mr-1" />
                                                {playingDevices} playing content
                                            </p>
                                        </div>
                                        <div className="p-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl">
                                            <Tv className="w-6 h-6 text-white" />
                                        </div>
                                    </div>
                                </motion.div>

                                <motion.div
                                    whileHover={{ scale: 1.02 }}
                                    className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-purple-200"
                                >
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-gray-600">Entertainment Scenes</p>
                                            <p className="text-2xl font-bold text-gray-900">{mediaScenes.length}</p>
                                            <p className="text-sm text-purple-600 flex items-center">
                                                <PlayCircle className="w-4 h-4 mr-1" />
                                                {mediaScenes.filter(s => s.lastActivated?.includes('ago')).length} recently used
                                            </p>
                                        </div>
                                        <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl">
                                            <PlayCircle className="w-6 h-6 text-white" />
                                        </div>
                                    </div>
                                </motion.div>

                                <motion.div
                                    whileHover={{ scale: 1.02 }}
                                    className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-green-200"
                                >
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-gray-600">Streaming Services</p>
                                            <p className="text-2xl font-bold text-gray-900">{streamingServices.filter(s => s.subscription === 'active').length}</p>
                                            <p className="text-sm text-green-600 flex items-center">
                                                <TrendingUp className="w-4 h-4 mr-1" />
                                                All subscriptions active
                                            </p>
                                        </div>
                                        <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl">
                                            <Cast className="w-6 h-6 text-white" />
                                        </div>
                                    </div>
                                </motion.div>

                                <motion.div
                                    whileHover={{ scale: 1.02 }}
                                    className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-orange-200"
                                >
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-gray-600">Power Consumption</p>
                                            <p className="text-2xl font-bold text-gray-900">{totalEnergyUsage}W</p>
                                            <p className="text-sm text-green-600 flex items-center">
                                                <TrendingDown className="w-4 h-4 mr-1" />
                                                25% below average
                                            </p>
                                        </div>
                                        <div className="p-3 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl">
                                            <Zap className="w-6 h-6 text-white" />
                                        </div>
                                    </div>
                                </motion.div>
                            </div>

                            {/* Currently Playing */}
                            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-blue-200">
                                <h3 className="text-lg font-semibold text-gray-900 mb-6">Currently Playing</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {mediaDevices.filter(device => device.status === 'playing' && device.currentContent).map((device) => (
                                        <motion.div
                                            key={device.id}
                                            whileHover={{ scale: 1.02 }}
                                            className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200"
                                        >
                                            <div className="flex items-center justify-between mb-3">
                                                <div className="flex items-center space-x-2">
                                                    {getDeviceIcon(device.type)}
                                                    <span className="font-medium text-gray-900">{device.name}</span>
                                                </div>
                                                <span className={`px-2 py-1 text-xs rounded-full border ${getStatusColor(device.status)}`}>
                                                    {device.status}
                                                </span>
                                            </div>

                                            {device.currentContent && (
                                                <div className="space-y-3">
                                                    <div>
                                                        <h4 className="font-medium text-gray-900">{device.currentContent.title}</h4>
                                                        <p className="text-sm text-gray-600">
                                                            {device.currentContent.type === 'tv_show' ? 'TV Show' :
                                                                device.currentContent.type === 'movie' ? 'Movie' :
                                                                    device.currentContent.type === 'music' ? 'Music' :
                                                                        device.currentContent.type}
                                                            {device.currentContent.channel && ` • ${device.currentContent.channel}`}
                                                            {device.currentContent.artist && ` • ${device.currentContent.artist}`}
                                                        </p>
                                                    </div>

                                                    {device.currentContent.duration && device.currentContent.position && (
                                                        <div className="space-y-1">
                                                            <div className="flex justify-between text-xs text-gray-500">
                                                                <span>{formatTime(device.currentContent.position)}</span>
                                                                <span>{formatTime(device.currentContent.duration)}</span>
                                                            </div>
                                                            <div className="w-full bg-gray-200 rounded-full h-1">
                                                                <div
                                                                    className="bg-gradient-to-r from-purple-500 to-pink-500 h-1 rounded-full transition-all duration-300"
                                                                    style={{ width: `${(device.currentContent.position / device.currentContent.duration) * 100}%` }}
                                                                />
                                                            </div>
                                                        </div>
                                                    )}

                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center space-x-2">
                                                            <Volume2 className="w-4 h-4 text-gray-500" />
                                                            <span className="text-sm text-gray-600">{device.volume}%</span>
                                                        </div>
                                                        <div className="flex items-center space-x-1">
                                                            <motion.button
                                                                whileHover={{ scale: 1.1 }}
                                                                whileTap={{ scale: 0.9 }}
                                                                className="p-1 text-gray-500 hover:text-gray-700"
                                                            >
                                                                <SkipBack className="w-4 h-4" />
                                                            </motion.button>
                                                            <motion.button
                                                                whileHover={{ scale: 1.1 }}
                                                                whileTap={{ scale: 0.9 }}
                                                                className="p-1 text-gray-500 hover:text-gray-700"
                                                            >
                                                                <Pause className="w-4 h-4" />
                                                            </motion.button>
                                                            <motion.button
                                                                whileHover={{ scale: 1.1 }}
                                                                whileTap={{ scale: 0.9 }}
                                                                className="p-1 text-gray-500 hover:text-gray-700"
                                                            >
                                                                <SkipForward className="w-4 h-4" />
                                                            </motion.button>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </motion.div>
                                    ))}
                                </div>
                            </div>

                            {/* Entertainment Scenes */}
                            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-blue-200">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-lg font-semibold text-gray-900">Entertainment Scenes</h3>
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                    >
                                        <Plus className="w-4 h-4" />
                                    </motion.button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                    {mediaScenes.map((scene) => (
                                        <motion.div
                                            key={scene.id}
                                            whileHover={{ scale: 1.02 }}
                                            onClick={() => setSelectedScene(scene.id)}
                                            className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg border border-blue-200 cursor-pointer"
                                        >
                                            <div className="flex items-center justify-between mb-3">
                                                <div className="flex items-center space-x-2">
                                                    {getSceneIcon(scene.category)}
                                                    <span className="font-medium text-gray-900">{scene.name}</span>
                                                </div>
                                                <span className="text-xs text-gray-500">
                                                    {scene.popularity}% popularity
                                                </span>
                                            </div>

                                            <p className="text-sm text-gray-600 mb-3">{scene.description}</p>

                                            <div className="space-y-2">
                                                <div className="flex justify-between text-xs">
                                                    <span className="text-gray-500">Devices</span>
                                                    <span className="font-medium">{scene.devices.length}</span>
                                                </div>
                                                <div className="flex justify-between text-xs">
                                                    <span className="text-gray-500">Used</span>
                                                    <span className="font-medium">{scene.activationCount} times</span>
                                                </div>
                                                <div className="flex justify-between text-xs">
                                                    <span className="text-gray-500">Last</span>
                                                    <span className="font-medium">{scene.lastActivated}</span>
                                                </div>
                                            </div>

                                            <motion.button
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                className="w-full mt-3 px-3 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
                                            >
                                                Activate Scene
                                            </motion.button>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>

                            {/* Recent Alerts */}
                            {mediaAlerts.length > 0 && (
                                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-orange-200">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                        <AlertTriangle className="w-5 h-5 mr-2 text-orange-500" />
                                        Media System Alerts
                                    </h3>
                                    <div className="space-y-3">
                                        {mediaAlerts.map((alert) => (
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
                                                        {alert.dueDate && (
                                                            <p className="text-xs text-red-600 mt-1">{alert.dueDate}</p>
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
                                    This section is being implemented with comprehensive entertainment features.
                                </p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    )
}

export default EntertainmentMediaPage
