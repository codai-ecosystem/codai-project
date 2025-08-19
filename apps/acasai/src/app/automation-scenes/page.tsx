'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
    // Automation Icons
    Zap,
    Play,
    Pause,
    Plus,
    Edit3,
    Trash2,
    Copy,

    // Scene Icons
    Lightbulb,
    Moon,
    Sun,
    Coffee,
    Tv,
    Shield,
    Home,
    Car,

    // Control Icons
    Settings2,
    Clock,
    Calendar,
    Timer,
    Activity,
    BarChart3,
    TrendingUp,

    // Trigger Icons
    Thermometer,
    Camera,
    Lock,
    Smartphone,
    Volume2,
    Wifi,

    // Condition Icons
    CloudRain,
    MapPin,
    User,
    Users,
    Eye,
    EyeOff,

    // Action Icons
    Power,
    Sliders,
    Bell,
    Mail,
    MessageSquare,
    PhoneCall,

    // Status Icons
    CheckCircle,
    XCircle,
    AlertTriangle,
    Info,
    RotateCcw,
    RefreshCw,

    // Advanced Icons
    Cpu,
    Brain,
    Sparkles,
    Target,
    Layers,
    GitBranch
} from 'lucide-react'

// Automation & Scenes Interfaces
interface AutomationRule {
    id: string
    name: string
    description: string
    enabled: boolean
    priority: 'low' | 'medium' | 'high' | 'critical'
    category: 'security' | 'lighting' | 'climate' | 'entertainment' | 'energy' | 'custom'
    triggers: AutomationTrigger[]
    conditions: AutomationCondition[]
    actions: AutomationAction[]
    schedule?: AutomationSchedule
    createdAt: string
    lastTriggered?: string
    triggerCount: number
    successRate: number
    avgExecutionTime: number
    isLearning: boolean
}

interface AutomationTrigger {
    id: string
    type: 'device' | 'time' | 'location' | 'weather' | 'presence' | 'sensor'
    deviceId?: string
    property?: string
    operator: 'equals' | 'greater' | 'less' | 'between' | 'contains'
    value: any
    tolerance?: number
}

interface AutomationCondition {
    id: string
    type: 'device' | 'time' | 'location' | 'weather' | 'presence' | 'custom'
    property: string
    operator: string
    value: any
    logic: 'and' | 'or'
}

interface AutomationAction {
    id: string
    type: 'device' | 'scene' | 'notification' | 'delay' | 'webhook'
    deviceId?: string
    sceneId?: string
    property?: string
    value: any
    delay?: number
    priority: number
}

interface AutomationSchedule {
    enabled: boolean
    startTime?: string
    endTime?: string
    days: string[]
    timezone: string
}

interface SmartScene {
    id: string
    name: string
    description: string
    icon: any
    color: string
    category: 'lighting' | 'climate' | 'security' | 'entertainment' | 'morning' | 'evening' | 'custom'
    actions: SceneAction[]
    isActive: boolean
    isFavorite: boolean
    lastActivated?: string
    activationCount: number
    avgExecutionTime: number
    deviceCount: number
    presets: ScenePreset[]
}

interface SceneAction {
    deviceId: string
    deviceName: string
    property: string
    value: any
    delay: number
    priority: number
}

interface ScenePreset {
    id: string
    name: string
    values: Record<string, any>
}

interface AutomationTemplate {
    id: string
    name: string
    description: string
    category: string
    triggers: Partial<AutomationTrigger>[]
    actions: Partial<AutomationAction>[]
    popularity: number
    difficulty: 'beginner' | 'intermediate' | 'advanced'
}

export default function AutomationScenesPage() {
    // State Management
    const [activeTab, setActiveTab] = useState('scenes')
    const [selectedRule, setSelectedRule] = useState<AutomationRule | null>(null)
    const [selectedScene, setSelectedScene] = useState<SmartScene | null>(null)
    const [showRuleBuilder, setShowRuleBuilder] = useState(false)
    const [showSceneBuilder, setShowSceneBuilder] = useState(false)
    const [autoRefresh, setAutoRefresh] = useState(true)

    // Smart Scenes Data
    const [smartScenes, setSmartScenes] = useState<SmartScene[]>([
        {
            id: 'scene-1',
            name: 'Good Morning',
            description: 'Gentle wake-up routine with gradual lighting and climate control',
            icon: Sun,
            color: 'yellow',
            category: 'morning',
            actions: [
                { deviceId: 'light-1', deviceName: 'Bedroom Lights', property: 'brightness', value: 30, delay: 0, priority: 1 },
                { deviceId: 'thermo-1', deviceName: 'Main Thermostat', property: 'temperature', value: 22, delay: 5, priority: 2 },
                { deviceId: 'speaker-1', deviceName: 'Kitchen Speaker', property: 'volume', value: 25, delay: 10, priority: 3 }
            ],
            isActive: false,
            isFavorite: true,
            lastActivated: '2 hours ago',
            activationCount: 127,
            avgExecutionTime: 15.2,
            deviceCount: 6,
            presets: [
                { id: 'preset-1', name: 'Gentle', values: { brightness: 20, temperature: 21 } },
                { id: 'preset-2', name: 'Energetic', values: { brightness: 50, temperature: 23 } }
            ]
        },
        {
            id: 'scene-2',
            name: 'Movie Night',
            description: 'Perfect ambiance for entertainment with dimmed lights and optimal audio',
            icon: Tv,
            color: 'purple',
            category: 'entertainment',
            actions: [
                { deviceId: 'light-1', deviceName: 'Living Room Lights', property: 'brightness', value: 10, delay: 0, priority: 1 },
                { deviceId: 'tv-1', deviceName: 'Smart TV', property: 'power', value: true, delay: 2, priority: 2 },
                { deviceId: 'speaker-2', deviceName: 'Sound System', property: 'volume', value: 45, delay: 5, priority: 3 }
            ],
            isActive: true,
            isFavorite: true,
            lastActivated: '45 min ago',
            activationCount: 89,
            avgExecutionTime: 8.7,
            deviceCount: 4,
            presets: [
                { id: 'preset-3', name: 'Action', values: { volume: 60, brightness: 5 } },
                { id: 'preset-4', name: 'Romance', values: { volume: 30, brightness: 15 } }
            ]
        },
        {
            id: 'scene-3',
            name: 'Security Mode',
            description: 'Comprehensive security activation with cameras, locks, and monitoring',
            icon: Shield,
            color: 'red',
            category: 'security',
            actions: [
                { deviceId: 'lock-1', deviceName: 'Front Door Lock', property: 'locked', value: true, delay: 0, priority: 1 },
                { deviceId: 'camera-1', deviceName: 'Security Cameras', property: 'recording', value: true, delay: 1, priority: 1 },
                { deviceId: 'sensor-1', deviceName: 'Motion Sensors', property: 'sensitivity', value: 'high', delay: 2, priority: 2 }
            ],
            isActive: true,
            isFavorite: false,
            lastActivated: '1 hour ago',
            activationCount: 203,
            avgExecutionTime: 5.1,
            deviceCount: 8,
            presets: [
                { id: 'preset-5', name: 'Home', values: { sensitivity: 'medium' } },
                { id: 'preset-6', name: 'Away', values: { sensitivity: 'high' } }
            ]
        },
        {
            id: 'scene-4',
            name: 'Energy Saver',
            description: 'Optimize energy consumption across all smart devices',
            icon: Lightbulb,
            color: 'green',
            category: 'climate',
            actions: [
                { deviceId: 'light-all', deviceName: 'All Lights', property: 'brightness', value: 40, delay: 0, priority: 1 },
                { deviceId: 'thermo-1', deviceName: 'Thermostat', property: 'temperature', value: 20, delay: 0, priority: 1 },
                { deviceId: 'outlet-all', deviceName: 'Smart Outlets', property: 'schedule', value: 'eco', delay: 5, priority: 2 }
            ],
            isActive: false,
            isFavorite: true,
            lastActivated: '3 hours ago',
            activationCount: 156,
            avgExecutionTime: 12.4,
            deviceCount: 12,
            presets: [
                { id: 'preset-7', name: 'Mild', values: { temperature: 21, brightness: 50 } },
                { id: 'preset-8', name: 'Aggressive', values: { temperature: 19, brightness: 30 } }
            ]
        }
    ])

    // Automation Rules Data
    const [automationRules, setAutomationRules] = useState<AutomationRule[]>([
        {
            id: 'rule-1',
            name: 'Smart Arrival Detection',
            description: 'Automatically activates welcome scene when residents arrive home',
            enabled: true,
            priority: 'high',
            category: 'security',
            triggers: [
                { id: 'trigger-1', type: 'location', property: 'distance', operator: 'less', value: 100, tolerance: 20 }
            ],
            conditions: [
                { id: 'cond-1', type: 'time', property: 'hour', operator: 'between', value: [17, 23], logic: 'and' }
            ],
            actions: [
                { id: 'action-1', type: 'scene', sceneId: 'scene-1', value: 'activate', delay: 0, priority: 1 },
                { id: 'action-2', type: 'device', deviceId: 'lock-1', property: 'unlock', value: true, delay: 2, priority: 2 }
            ],
            createdAt: '2025-01-15',
            lastTriggered: '1 hour ago',
            triggerCount: 47,
            successRate: 96.2,
            avgExecutionTime: 3.8,
            isLearning: true
        },
        {
            id: 'rule-2',
            name: 'Bedtime Automation',
            description: 'Gradual transition to sleep mode with progressive lighting reduction',
            enabled: true,
            priority: 'medium',
            category: 'lighting',
            triggers: [
                { id: 'trigger-2', type: 'time', property: 'time', operator: 'equals', value: '22:30' }
            ],
            conditions: [
                { id: 'cond-2', type: 'presence', property: 'home', operator: 'equals', value: true, logic: 'and' }
            ],
            actions: [
                { id: 'action-3', type: 'device', deviceId: 'light-all', property: 'brightness', value: 20, delay: 0, priority: 1 },
                { id: 'action-4', type: 'device', deviceId: 'thermo-1', property: 'temperature', value: 19, delay: 300, priority: 2 },
                { id: 'action-5', type: 'scene', sceneId: 'scene-3', value: 'activate', delay: 600, priority: 3 }
            ],
            createdAt: '2025-01-10',
            lastTriggered: '12 hours ago',
            triggerCount: 89,
            successRate: 94.4,
            avgExecutionTime: 12.6,
            isLearning: false
        },
        {
            id: 'rule-3',
            name: 'Weather Response System',
            description: 'Adjusts climate and lighting based on weather conditions and forecasts',
            enabled: true,
            priority: 'medium',
            category: 'climate',
            triggers: [
                { id: 'trigger-3', type: 'weather', property: 'temperature', operator: 'less', value: 5, tolerance: 2 }
            ],
            conditions: [
                { id: 'cond-3', type: 'time', property: 'hour', operator: 'between', value: [6, 20], logic: 'and' }
            ],
            actions: [
                { id: 'action-6', type: 'device', deviceId: 'thermo-1', property: 'temperature', value: 23, delay: 0, priority: 1 },
                { id: 'action-7', type: 'device', deviceId: 'light-all', property: 'temperature', value: 3000, delay: 0, priority: 2 }
            ],
            createdAt: '2025-01-08',
            lastTriggered: '6 hours ago',
            triggerCount: 23,
            successRate: 91.3,
            avgExecutionTime: 5.7,
            isLearning: true
        },
        {
            id: 'rule-4',
            name: 'Energy Optimization AI',
            description: 'AI-powered energy management with predictive consumption patterns',
            enabled: true,
            priority: 'low',
            category: 'energy',
            triggers: [
                { id: 'trigger-4', type: 'sensor', property: 'powerConsumption', operator: 'greater', value: 3500 }
            ],
            conditions: [
                { id: 'cond-4', type: 'custom', property: 'energyPrice', operator: 'greater', value: 0.25, logic: 'and' }
            ],
            actions: [
                { id: 'action-8', type: 'scene', sceneId: 'scene-4', value: 'activate', delay: 0, priority: 1 },
                { id: 'action-9', type: 'notification', value: 'Energy optimization activated', delay: 0, priority: 2 }
            ],
            createdAt: '2025-01-05',
            lastTriggered: '2 hours ago',
            triggerCount: 156,
            successRate: 89.7,
            avgExecutionTime: 8.2,
            isLearning: true
        }
    ])

    // Automation Templates
    const automationTemplates: AutomationTemplate[] = [
        {
            id: 'template-1',
            name: 'Motion-Activated Lighting',
            description: 'Turn on lights when motion is detected',
            category: 'lighting',
            triggers: [{ type: 'sensor', property: 'motion', operator: 'equals', value: true }],
            actions: [{ type: 'device', property: 'power', value: true, delay: 0, priority: 1 }],
            popularity: 95,
            difficulty: 'beginner'
        },
        {
            id: 'template-2',
            name: 'Temperature-Based Climate Control',
            description: 'Adjust thermostat based on outdoor temperature',
            category: 'climate',
            triggers: [{ type: 'weather', property: 'temperature', operator: 'less', value: 10 }],
            actions: [{ type: 'device', property: 'temperature', value: 22, delay: 0, priority: 1 }],
            popularity: 87,
            difficulty: 'beginner'
        },
        {
            id: 'template-3',
            name: 'Presence-Based Security',
            description: 'Activate security when nobody is home',
            category: 'security',
            triggers: [{ type: 'presence', property: 'home', operator: 'equals', value: false }],
            actions: [{ type: 'scene', sceneId: 'security', value: 'activate', delay: 300, priority: 1 }],
            popularity: 82,
            difficulty: 'intermediate'
        }
    ]

    // Real-time Updates
    useEffect(() => {
        if (autoRefresh) {
            const interval = setInterval(() => {
                // Simulate real-time updates
                setAutomationRules(prev => prev.map(rule => ({
                    ...rule,
                    triggerCount: rule.triggerCount + (Math.random() < 0.1 ? 1 : 0),
                    successRate: Math.min(100, rule.successRate + (Math.random() - 0.5) * 0.5)
                })))
            }, 10000)

            return () => clearInterval(interval)
        }
    }, [autoRefresh])

    // Scene Activation
    const activateScene = (sceneId: string) => {
        setSmartScenes(prev => prev.map(scene =>
            scene.id === sceneId
                ? { ...scene, isActive: !scene.isActive, activationCount: scene.activationCount + 1, lastActivated: 'Now' }
                : scene
        ))
    }

    // Rule Toggle
    const toggleRule = (ruleId: string) => {
        setAutomationRules(prev => prev.map(rule =>
            rule.id === ruleId ? { ...rule, enabled: !rule.enabled } : rule
        ))
    }

    // Tab Content
    const tabOptions = [
        { id: 'scenes', label: 'Smart Scenes', icon: Lightbulb, count: smartScenes.length },
        { id: 'automations', label: 'Automation Rules', icon: Zap, count: automationRules.length },
        { id: 'templates', label: 'Templates', icon: Copy, count: automationTemplates.length },
        { id: 'analytics', label: 'Analytics', icon: BarChart3, count: null }
    ]

    return (
        <div className="p-6 space-y-6">
            {/* Enhanced Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-2xl p-8 text-white shadow-2xl"
            >
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-4">
                        <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
                            <Zap className="h-8 w-8" />
                        </div>
                        <div>
                            <h1 className="text-4xl font-bold">Automation & Scenes</h1>
                            <p className="text-blue-100 text-lg">Smart Home Intelligence & Control</p>
                        </div>
                    </div>

                    <div className="flex items-center space-x-6">
                        <div className="text-right">
                            <p className="text-sm text-blue-100">Active Scenes</p>
                            <p className="text-2xl font-bold">{smartScenes.filter(s => s.isActive).length}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-blue-100">Automation Rules</p>
                            <p className="text-2xl font-bold">{automationRules.filter(r => r.enabled).length}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-blue-100">Success Rate</p>
                            <p className="text-2xl font-bold">
                                {Math.round(automationRules.reduce((sum, r) => sum + r.successRate, 0) / automationRules.length)}%
                            </p>
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
                                        ? 'bg-white text-purple-600 shadow-lg'
                                        : 'text-white/80 hover:text-white hover:bg-white/10'
                                    }`}
                            >
                                <IconComponent className="h-4 w-4" />
                                <span className="font-medium">{tab.label}</span>
                                {tab.count && (
                                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${isActive ? 'bg-purple-100 text-purple-600' : 'bg-white/20 text-white'
                                        }`}>
                                        {tab.count}
                                    </span>
                                )}
                            </motion.button>
                        )
                    })}
                </div>
            </motion.div>

            {/* Smart Scenes Tab */}
            {activeTab === 'scenes' && (
                <div className="space-y-6">
                    {/* Scene Controls */}
                    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold text-gray-900">Smart Scenes</h2>
                            <div className="flex items-center space-x-3">
                                <button
                                    onClick={() => setShowSceneBuilder(true)}
                                    className="flex items-center space-x-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
                                >
                                    <Plus className="h-4 w-4" />
                                    <span>Create Scene</span>
                                </button>
                            </div>
                        </div>

                        {/* Scenes Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {smartScenes.map((scene) => {
                                const IconComponent = scene.icon

                                return (
                                    <motion.div
                                        key={scene.id}
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        whileHover={{ scale: 1.02, y: -5 }}
                                        className={`relative bg-white rounded-2xl p-6 shadow-lg border-2 transition-all duration-300 cursor-pointer ${scene.isActive
                                                ? `border-${scene.color}-300 bg-${scene.color}-50 shadow-xl`
                                                : 'border-gray-200 hover:border-gray-300'
                                            }`}
                                        onClick={() => activateScene(scene.id)}
                                    >
                                        {/* Scene Header */}
                                        <div className="flex items-center justify-between mb-4">
                                            <div className={`p-3 rounded-xl bg-${scene.color}-100`}>
                                                <IconComponent className={`h-6 w-6 text-${scene.color}-600`} />
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                {scene.isFavorite && (
                                                    <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                                                )}
                                                <div className={`px-3 py-1 rounded-full text-xs font-medium ${scene.isActive
                                                        ? `bg-${scene.color}-200 text-${scene.color}-800`
                                                        : 'bg-gray-100 text-gray-600'
                                                    }`}>
                                                    {scene.isActive ? 'Active' : 'Inactive'}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Scene Info */}
                                        <div className="mb-4">
                                            <h3 className="font-bold text-gray-900 mb-2">{scene.name}</h3>
                                            <p className="text-sm text-gray-600 mb-3">{scene.description}</p>

                                            <div className="space-y-2 text-sm text-gray-500">
                                                <div className="flex items-center justify-between">
                                                    <span>Devices</span>
                                                    <span className="font-medium">{scene.deviceCount}</span>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <span>Last Used</span>
                                                    <span className="font-medium">{scene.lastActivated}</span>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <span>Times Used</span>
                                                    <span className="font-medium">{scene.activationCount}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Scene Controls */}
                                        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    activateScene(scene.id)
                                                }}
                                                className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${scene.isActive
                                                        ? 'bg-red-500 text-white hover:bg-red-600'
                                                        : `bg-${scene.color}-500 text-white hover:bg-${scene.color}-600`
                                                    }`}
                                            >
                                                {scene.isActive ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                                                <span>{scene.isActive ? 'Stop' : 'Activate'}</span>
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
                                            </div>
                                        </div>
                                    </motion.div>
                                )
                            })}
                        </div>
                    </div>
                </div>
            )}

            {/* Automation Rules Tab */}
            {activeTab === 'automations' && (
                <div className="space-y-6">
                    {/* Automation Controls */}
                    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold text-gray-900">Automation Rules</h2>
                            <div className="flex items-center space-x-3">
                                <button
                                    onClick={() => setShowRuleBuilder(true)}
                                    className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                                >
                                    <Plus className="h-4 w-4" />
                                    <span>Create Rule</span>
                                </button>
                            </div>
                        </div>

                        {/* Rules List */}
                        <div className="space-y-4">
                            {automationRules.map((rule) => (
                                <motion.div
                                    key={rule.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className={`bg-gray-50 rounded-2xl p-6 border-2 transition-all duration-300 ${rule.enabled
                                            ? 'border-green-200 bg-green-50'
                                            : 'border-gray-200'
                                        }`}
                                >
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center space-x-4">
                                            <div className={`p-3 rounded-xl ${rule.enabled ? 'bg-green-100' : 'bg-gray-100'
                                                }`}>
                                                <Zap className={`h-6 w-6 ${rule.enabled ? 'text-green-600' : 'text-gray-400'
                                                    }`} />
                                            </div>
                                            <div>
                                                <div className="flex items-center space-x-3">
                                                    <h3 className="font-bold text-gray-900">{rule.name}</h3>
                                                    {rule.isLearning && (
                                                        <div className="flex items-center space-x-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                                                            <Brain className="h-3 w-3" />
                                                            <span>AI Learning</span>
                                                        </div>
                                                    )}
                                                    <div className={`px-3 py-1 rounded-full text-xs font-medium ${rule.priority === 'critical' ? 'bg-red-100 text-red-800' :
                                                            rule.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                                                                rule.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                                                    'bg-gray-100 text-gray-800'
                                                        }`}>
                                                        {rule.priority}
                                                    </div>
                                                </div>
                                                <p className="text-sm text-gray-600 mt-1">{rule.description}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center space-x-4">
                                            <div className="text-right text-sm">
                                                <p className="text-gray-500">Success Rate</p>
                                                <p className="font-bold text-green-600">{rule.successRate.toFixed(1)}%</p>
                                            </div>
                                            <div className="text-right text-sm">
                                                <p className="text-gray-500">Triggers</p>
                                                <p className="font-bold text-blue-600">{rule.triggerCount}</p>
                                            </div>
                                            <button
                                                onClick={() => toggleRule(rule.id)}
                                                className={`p-3 rounded-xl transition-colors ${rule.enabled
                                                        ? 'bg-green-500 text-white hover:bg-green-600'
                                                        : 'bg-gray-300 text-gray-600 hover:bg-gray-400'
                                                    }`}
                                            >
                                                <Power className="h-5 w-5" />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Rule Details */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-200">
                                        <div>
                                            <h4 className="font-medium text-gray-700 mb-2">Triggers</h4>
                                            <div className="space-y-1">
                                                {rule.triggers.map((trigger, index) => (
                                                    <div key={trigger.id} className="text-sm text-gray-600 bg-white p-2 rounded">
                                                        {trigger.type} {trigger.operator} {trigger.value}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div>
                                            <h4 className="font-medium text-gray-700 mb-2">Conditions</h4>
                                            <div className="space-y-1">
                                                {rule.conditions.map((condition, index) => (
                                                    <div key={condition.id} className="text-sm text-gray-600 bg-white p-2 rounded">
                                                        {condition.property} {condition.operator} {condition.value}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div>
                                            <h4 className="font-medium text-gray-700 mb-2">Actions</h4>
                                            <div className="space-y-1">
                                                {rule.actions.map((action, index) => (
                                                    <div key={action.id} className="text-sm text-gray-600 bg-white p-2 rounded">
                                                        {action.type} → {action.property || action.sceneId} = {action.value}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Rule Stats */}
                                    <div className="flex items-center justify-between pt-4 border-t border-gray-200 mt-4">
                                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                                            <span>Created: {rule.createdAt}</span>
                                            <span>Last Triggered: {rule.lastTriggered}</span>
                                            <span>Avg Execution: {rule.avgExecutionTime}s</span>
                                        </div>

                                        <div className="flex items-center space-x-2">
                                            <button className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
                                                <Edit3 className="h-4 w-4" />
                                            </button>
                                            <button className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
                                                <Copy className="h-4 w-4" />
                                            </button>
                                            <button className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors">
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Templates Tab */}
            {activeTab === 'templates' && (
                <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Automation Templates</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {automationTemplates.map((template) => (
                            <motion.div
                                key={template.id}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                whileHover={{ scale: 1.02 }}
                                className="bg-gray-50 rounded-xl p-6 border border-gray-200 hover:border-blue-300 transition-all cursor-pointer"
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <div className={`px-3 py-1 rounded-full text-xs font-medium ${template.difficulty === 'beginner' ? 'bg-green-100 text-green-800' :
                                            template.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
                                                'bg-red-100 text-red-800'
                                        }`}>
                                        {template.difficulty}
                                    </div>
                                    <div className="flex items-center space-x-1 text-sm text-gray-500">
                                        <TrendingUp className="h-4 w-4" />
                                        <span>{template.popularity}%</span>
                                    </div>
                                </div>

                                <h3 className="font-bold text-gray-900 mb-2">{template.name}</h3>
                                <p className="text-sm text-gray-600 mb-4">{template.description}</p>

                                <button className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                                    Use Template
                                </button>
                            </motion.div>
                        ))}
                    </div>
                </div>
            )}

            {/* Analytics Tab */}
            {activeTab === 'analytics' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl p-6 text-white">
                        <div className="flex items-center space-x-3 mb-4">
                            <Activity className="h-8 w-8" />
                            <h3 className="text-xl font-bold">Total Executions</h3>
                        </div>
                        <p className="text-3xl font-bold">{automationRules.reduce((sum, r) => sum + r.triggerCount, 0)}</p>
                        <p className="text-blue-100">this month</p>
                    </div>

                    <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-6 text-white">
                        <div className="flex items-center space-x-3 mb-4">
                            <CheckCircle className="h-8 w-8" />
                            <h3 className="text-xl font-bold">Success Rate</h3>
                        </div>
                        <p className="text-3xl font-bold">
                            {Math.round(automationRules.reduce((sum, r) => sum + r.successRate, 0) / automationRules.length)}%
                        </p>
                        <p className="text-green-100">average success</p>
                    </div>

                    <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl p-6 text-white">
                        <div className="flex items-center space-x-3 mb-4">
                            <Zap className="h-8 w-8" />
                            <h3 className="text-xl font-bold">Active Rules</h3>
                        </div>
                        <p className="text-3xl font-bold">{automationRules.filter(r => r.enabled).length}</p>
                        <p className="text-purple-100">of {automationRules.length} total</p>
                    </div>

                    <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl p-6 text-white">
                        <div className="flex items-center space-x-3 mb-4">
                            <Timer className="h-8 w-8" />
                            <h3 className="text-xl font-bold">Avg Response</h3>
                        </div>
                        <p className="text-3xl font-bold">
                            {(automationRules.reduce((sum, r) => sum + r.avgExecutionTime, 0) / automationRules.length).toFixed(1)}s
                        </p>
                        <p className="text-orange-100">execution time</p>
                    </div>
                </div>
            )}
        </div>
    )
}
