'use client'

import React, { useState } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
    // Navigation Icons
    Home,
    Smartphone,
    Zap,
    Shield,
    Leaf,
    Thermometer,
    Tv,
    Settings2,

    // System Icons
    Menu,
    X,
    Bell,
    Search,
    User,

    // Status Icons
    Wifi,
    AlertTriangle,
    CheckCircle
} from 'lucide-react'

interface AcasaiLayoutProps {
    children: React.ReactNode
}

export default function AcasaiLayout({ children }: AcasaiLayoutProps) {
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const pathname = usePathname()

    // Navigation Configuration
    const navigation = [
        {
            name: 'Dashboard',
            href: '/dashboard',
            icon: Home,
            description: 'Home automation overview'
        },
        {
            name: 'Device Management',
            href: '/device-management',
            icon: Smartphone,
            description: 'IoT device control',
            badge: '24'
        },
        {
            name: 'Automation & Scenes',
            href: '/automation-scenes',
            icon: Zap,
            description: 'Smart automation rules',
            badge: '3'
        },
        {
            name: 'Security & Monitoring',
            href: '/security-monitoring',
            icon: Shield,
            description: 'Home security system'
        },
        {
            name: 'Energy Management',
            href: '/energy-management',
            icon: Leaf,
            description: 'Smart energy optimization'
        },
        {
            name: 'Climate Control',
            href: '/climate-control',
            icon: Thermometer,
            description: 'HVAC & environmental control'
        },
        {
            name: 'Entertainment & Media',
            href: '/entertainment-media',
            icon: Tv,
            description: 'Smart entertainment systems'
        },
        {
            name: 'Settings',
            href: '/settings',
            icon: Settings2,
            description: 'Platform configuration'
        }
    ]

    // Real-time Status Data
    const systemStatus = {
        wifiStrength: 85,
        batteryLevel: 92,
        connectedDevices: 24,
        activeScenes: 3,
        alerts: 2,
        securityStatus: 'armed'
    }

    // Notifications
    const notifications = [
        {
            id: 1,
            title: 'Front Door Motion',
            message: 'Motion detected at entrance',
            time: '2 min ago',
            type: 'security',
            severity: 'medium'
        },
        {
            id: 2,
            title: 'Energy Alert',
            message: 'High consumption detected',
            time: '15 min ago',
            type: 'energy',
            severity: 'low'
        }
    ]

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50">
            {/* Mobile Sidebar Overlay */}
            <AnimatePresence>
                {sidebarOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 lg:hidden"
                    >
                        <div
                            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                            onClick={() => setSidebarOpen(false)}
                        />
                        <motion.div
                            initial={{ x: -300 }}
                            animate={{ x: 0 }}
                            exit={{ x: -300 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="absolute left-0 top-0 h-full w-80 bg-white shadow-2xl"
                        >
                            <SidebarContent
                                navigation={navigation}
                                pathname={pathname}
                                systemStatus={systemStatus}
                                onClose={() => setSidebarOpen(false)}
                                mobile={true}
                            />
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Desktop Sidebar */}
            <div className="hidden lg:fixed lg:inset-y-0 lg:z-40 lg:flex lg:w-80">
                <SidebarContent
                    navigation={navigation}
                    pathname={pathname}
                    systemStatus={systemStatus}
                    mobile={false}
                />
            </div>

            {/* Main Content */}
            <div className="lg:pl-80">
                {/* Top Navigation Bar */}
                <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-200 px-4 py-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={() => setSidebarOpen(true)}
                                className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
                            >
                                <Menu className="h-5 w-5 text-gray-600" />
                            </button>

                            <div className="hidden sm:flex items-center space-x-4">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                    <input
                                        type="text"
                                        placeholder="Search devices, scenes..."
                                        className="pl-10 pr-4 py-2 w-64 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/70 backdrop-blur-sm"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center space-x-4">
                            {/* System Status Indicators */}
                            <div className="hidden md:flex items-center space-x-3">
                                <div className="flex items-center space-x-1 text-sm text-gray-600">
                                    <Wifi className="h-4 w-4 text-green-500" />
                                    <span>{systemStatus.wifiStrength}%</span>
                                </div>
                                <div className="flex items-center space-x-1 text-sm text-gray-600">
                                    <Smartphone className="h-4 w-4 text-blue-500" />
                                    <span>{systemStatus.connectedDevices}</span>
                                </div>
                                <div className="flex items-center space-x-1 text-sm text-gray-600">
                                    <Shield className={`h-4 w-4 ${systemStatus.securityStatus === 'armed' ? 'text-green-500' : 'text-orange-500'}`} />
                                    <span className="capitalize">{systemStatus.securityStatus}</span>
                                </div>
                            </div>

                            {/* Notifications */}
                            <div className="relative">
                                <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors relative">
                                    <Bell className="h-5 w-5 text-gray-600" />
                                    {notifications.length > 0 && (
                                        <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                                            {notifications.length}
                                        </span>
                                    )}
                                </button>
                            </div>

                            {/* User Profile */}
                            <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                                <User className="h-5 w-5 text-gray-600" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Page Content */}
                <main className="flex-1">
                    {children}
                </main>
            </div>
        </div>
    )
}

interface SidebarContentProps {
    navigation: any[]
    pathname: string
    systemStatus: any
    onClose?: () => void
    mobile: boolean
}

function SidebarContent({ navigation, pathname, systemStatus, onClose, mobile }: SidebarContentProps) {
    return (
        <div className="flex flex-col h-full bg-white shadow-xl border-r border-gray-200">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <div className="flex items-center space-x-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-r from-blue-500 to-cyan-600 text-white">
                        <Home className="h-6 w-6" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-gray-900">AcasAI</h1>
                        <p className="text-sm text-gray-500">Smart Home</p>
                    </div>
                </div>

                {mobile && onClose && (
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                        <X className="h-5 w-5 text-gray-500" />
                    </button>
                )}
            </div>

            {/* System Status Panel */}
            <div className="p-4 border-b border-gray-200">
                <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-4">
                    <h3 className="text-sm font-semibold text-gray-900 mb-3">System Status</h3>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="text-center">
                            <div className="flex items-center justify-center space-x-1 mb-1">
                                <Smartphone className="h-4 w-4 text-blue-500" />
                                <span className="text-sm font-bold text-gray-900">{systemStatus.connectedDevices}</span>
                            </div>
                            <p className="text-xs text-gray-600">Devices</p>
                        </div>
                        <div className="text-center">
                            <div className="flex items-center justify-center space-x-1 mb-1">
                                <Zap className="h-4 w-4 text-yellow-500" />
                                <span className="text-sm font-bold text-gray-900">{systemStatus.activeScenes}</span>
                            </div>
                            <p className="text-xs text-gray-600">Active</p>
                        </div>
                        <div className="text-center">
                            <div className="flex items-center justify-center space-x-1 mb-1">
                                <Wifi className="h-4 w-4 text-green-500" />
                                <span className="text-sm font-bold text-gray-900">{systemStatus.wifiStrength}%</span>
                            </div>
                            <p className="text-xs text-gray-600">WiFi</p>
                        </div>
                        <div className="text-center">
                            <div className="flex items-center justify-center space-x-1 mb-1">
                                {systemStatus.alerts > 0 ? (
                                    <AlertTriangle className="h-4 w-4 text-orange-500" />
                                ) : (
                                    <CheckCircle className="h-4 w-4 text-green-500" />
                                )}
                                <span className="text-sm font-bold text-gray-900">{systemStatus.alerts}</span>
                            </div>
                            <p className="text-xs text-gray-600">Alerts</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Navigation Links */}
            <nav className="flex-1 overflow-y-auto p-4">
                <div className="space-y-2">
                    {navigation.map((item) => {
                        const IconComponent = item.icon
                        const isActive = pathname === item.href

                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                onClick={mobile ? onClose : undefined}
                                className={`group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${isActive
                                        ? 'bg-gradient-to-r from-blue-500 to-cyan-600 text-white shadow-lg'
                                        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                                    }`}
                            >
                                <IconComponent className={`mr-3 h-5 w-5 ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-gray-600'
                                    }`} />
                                <div className="flex-1">
                                    <p className="font-medium">{item.name}</p>
                                    <p className={`text-xs ${isActive ? 'text-blue-100' : 'text-gray-500'
                                        }`}>{item.description}</p>
                                </div>
                                {item.badge && (
                                    <span className={`px-2 py-1 text-xs font-bold rounded-full ${isActive
                                            ? 'bg-white/20 text-white'
                                            : 'bg-blue-100 text-blue-600'
                                        }`}>
                                        {item.badge}
                                    </span>
                                )}
                            </Link>
                        )
                    })}
                </div>
            </nav>

            {/* Quick Actions */}
            <div className="p-4 border-t border-gray-200">
                <div className="grid grid-cols-2 gap-2">
                    <button className="flex items-center justify-center space-x-2 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm">
                        <Zap className="h-4 w-4" />
                        <span>Quick Scene</span>
                    </button>
                    <button className="flex items-center justify-center space-x-2 px-3 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors text-sm">
                        <Shield className="h-4 w-4" />
                        <span>Arm Security</span>
                    </button>
                </div>
            </div>
        </div>
    )
}
