'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import {
    Factory,
    Settings,
    Shield,
    Truck,
    Wrench,
    PieChart,
    HardHat,
    Home,
    Menu,
    X,
    Bell,
    Search,
    User,
    Activity,
    AlertTriangle,
    CheckCircle2
} from 'lucide-react'

interface FabricaiLayoutProps {
    children: React.ReactNode
}

export default function FabricaiLayout({ children }: FabricaiLayoutProps) {
    const pathname = usePathname()
    const [sidebarOpen, setSidebarOpen] = React.useState(false)
    const [notificationsOpen, setNotificationsOpen] = React.useState(false)

    // Navigation configuration
    const navigation = [
        {
            name: 'Dashboard',
            href: '/dashboard',
            icon: Home,
            description: 'Manufacturing overview',
            current: pathname === '/dashboard'
        },
        {
            name: 'Production Management',
            href: '/production-management',
            icon: Factory,
            description: 'Production lines control',
            current: pathname === '/production-management',
            badge: '4 Active'
        },
        {
            name: 'Quality Control',
            href: '/quality-control',
            icon: Shield,
            description: 'Quality assurance',
            current: pathname === '/quality-control',
            badge: '2 Alerts'
        },
        {
            name: 'Supply Chain',
            href: '/supply-chain',
            icon: Truck,
            description: 'Inventory & logistics',
            current: pathname === '/supply-chain'
        },
        {
            name: 'Predictive Maintenance',
            href: '/predictive-maintenance',
            icon: Wrench,
            description: 'AI maintenance scheduling',
            current: pathname === '/predictive-maintenance',
            badge: '3 Tasks'
        },
        {
            name: 'Analytics & Reporting',
            href: '/analytics-reporting',
            icon: PieChart,
            description: 'Performance insights',
            current: pathname === '/analytics-reporting'
        },
        {
            name: 'Safety & Compliance',
            href: '/safety-compliance',
            icon: HardHat,
            description: 'Safety monitoring',
            current: pathname === '/safety-compliance'
        },
        {
            name: 'Settings',
            href: '/settings',
            icon: Settings,
            description: 'System configuration',
            current: pathname === '/settings'
        }
    ]

    // Recent notifications
    const notifications = [
        {
            id: 1,
            type: 'alert',
            title: 'Quality Alert',
            message: 'Surface finish quality below threshold on Line B',
            time: '2 min ago',
            severity: 'high',
            icon: AlertTriangle
        },
        {
            id: 2,
            type: 'maintenance',
            title: 'Maintenance Due',
            message: 'Hydraulic system maintenance scheduled for Line C',
            time: '5 min ago',
            severity: 'medium',
            icon: Wrench
        },
        {
            id: 3,
            type: 'success',
            title: 'Production Target',
            message: 'Line A exceeded daily production target by 15%',
            time: '1 hour ago',
            severity: 'low',
            icon: CheckCircle2
        }
    ]

    // Manufacturing status indicators
    const statusIndicators = [
        { label: 'Lines Active', value: '3/4', color: 'green' },
        { label: 'Efficiency', value: '94.7%', color: 'orange' },
        { label: 'Quality', value: '96.8%', color: 'green' },
        { label: 'Alerts', value: '2', color: 'red' }
    ]

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-yellow-50">
            {/* Mobile sidebar overlay */}
            {sidebarOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                >
                    <div className="absolute inset-0 bg-gray-600 bg-opacity-75" />
                </motion.div>
            )}

            {/* Mobile sidebar */}
            <motion.div
                initial={{ x: -280 }}
                animate={{ x: sidebarOpen ? 0 : -280 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className="fixed inset-y-0 left-0 z-50 w-72 bg-white/95 backdrop-blur-sm shadow-xl lg:hidden"
            >
                <div className="flex h-16 items-center justify-between px-6 border-b border-orange-200/50">
                    <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                            <Factory className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-lg font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                            FabricAI
                        </span>
                    </div>
                    <button
                        onClick={() => setSidebarOpen(false)}
                        className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <nav className="mt-6 px-3">
                    <div className="space-y-2">
                        {navigation.map((item) => {
                            const Icon = item.icon
                            return (
                                <Link key={item.name} href={item.href}>
                                    <motion.div
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        className={`flex items-center justify-between px-3 py-3 text-sm font-medium rounded-lg transition-colors ${item.current
                                                ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg'
                                                : 'text-gray-700 hover:text-orange-700 hover:bg-orange-50'
                                            }`}
                                    >
                                        <div className="flex items-center space-x-3">
                                            <Icon className={`w-5 h-5 ${item.current ? 'text-white' : 'text-gray-500'}`} />
                                            <div>
                                                <div>{item.name}</div>
                                                <div className={`text-xs ${item.current ? 'text-orange-100' : 'text-gray-500'}`}>
                                                    {item.description}
                                                </div>
                                            </div>
                                        </div>
                                        {item.badge && (
                                            <span className={`px-2 py-1 text-xs rounded-full font-medium ${item.current
                                                    ? 'bg-white/20 text-white'
                                                    : 'bg-orange-100 text-orange-700'
                                                }`}>
                                                {item.badge}
                                            </span>
                                        )}
                                    </motion.div>
                                </Link>
                            )
                        })}
                    </div>
                </nav>
            </motion.div>

            {/* Desktop sidebar */}
            <div className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-40 lg:w-72 lg:flex lg:flex-col">
                <div className="flex flex-col flex-1 bg-white/95 backdrop-blur-sm border-r border-orange-200/50">
                    {/* Sidebar header */}
                    <div className="flex items-center justify-between h-16 px-6 border-b border-orange-200/50">
                        <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                                <Factory className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <span className="text-lg font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                                    FabricAI
                                </span>
                                <div className="text-xs text-gray-600">Manufacturing Platform</div>
                            </div>
                        </div>
                    </div>

                    {/* Status indicators */}
                    <div className="px-6 py-4 bg-gradient-to-r from-orange-50 to-red-50 border-b border-orange-200/50">
                        <div className="grid grid-cols-2 gap-3">
                            {statusIndicators.map((indicator, index) => (
                                <div key={index} className="text-center">
                                    <div className={`text-lg font-bold ${indicator.color === 'green' ? 'text-green-600' :
                                            indicator.color === 'orange' ? 'text-orange-600' :
                                                indicator.color === 'red' ? 'text-red-600' : 'text-gray-600'
                                        }`}>
                                        {indicator.value}
                                    </div>
                                    <div className="text-xs text-gray-600">{indicator.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 px-3 py-6 space-y-2 overflow-y-auto">
                        {navigation.map((item) => {
                            const Icon = item.icon
                            return (
                                <Link key={item.name} href={item.href}>
                                    <motion.div
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        className={`flex items-center justify-between px-3 py-3 text-sm font-medium rounded-lg transition-colors ${item.current
                                                ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg'
                                                : 'text-gray-700 hover:text-orange-700 hover:bg-orange-50'
                                            }`}
                                    >
                                        <div className="flex items-center space-x-3">
                                            <Icon className={`w-5 h-5 ${item.current ? 'text-white' : 'text-gray-500'}`} />
                                            <div>
                                                <div>{item.name}</div>
                                                <div className={`text-xs ${item.current ? 'text-orange-100' : 'text-gray-500'}`}>
                                                    {item.description}
                                                </div>
                                            </div>
                                        </div>
                                        {item.badge && (
                                            <span className={`px-2 py-1 text-xs rounded-full font-medium ${item.current
                                                    ? 'bg-white/20 text-white'
                                                    : 'bg-orange-100 text-orange-700'
                                                }`}>
                                                {item.badge}
                                            </span>
                                        )}
                                    </motion.div>
                                </Link>
                            )
                        })}
                    </nav>

                    {/* Manufacturing status footer */}
                    <div className="px-6 py-4 border-t border-orange-200/50 bg-gradient-to-r from-orange-50 to-red-50">
                        <div className="flex items-center space-x-2">
                            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                            <div className="text-sm font-medium text-gray-700">System Operational</div>
                        </div>
                        <div className="text-xs text-gray-600 mt-1">All systems running normally</div>
                    </div>
                </div>
            </div>

            {/* Main content */}
            <div className="lg:pl-72">
                {/* Top navigation */}
                <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b border-orange-200/50">
                    <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
                        {/* Mobile menu button */}
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg lg:hidden"
                        >
                            <Menu className="w-5 h-5" />
                        </button>

                        {/* Search */}
                        <div className="flex-1 max-w-2xl mx-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search manufacturing data, equipment, alerts..."
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white/80 backdrop-blur-sm"
                                />
                            </div>
                        </div>

                        {/* Right side actions */}
                        <div className="flex items-center space-x-4">
                            {/* System status */}
                            <div className="hidden sm:flex items-center space-x-2 text-sm">
                                <Activity className="w-4 h-4 text-green-500" />
                                <span className="text-gray-600">All Systems Operational</span>
                            </div>

                            {/* Notifications */}
                            <div className="relative">
                                <button
                                    onClick={() => setNotificationsOpen(!notificationsOpen)}
                                    className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg relative"
                                >
                                    <Bell className="w-5 h-5" />
                                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                                        {notifications.length}
                                    </span>
                                </button>

                                {/* Notifications dropdown */}
                                {notificationsOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50"
                                    >
                                        <div className="p-4 border-b border-gray-200">
                                            <h3 className="font-semibold text-gray-900">Manufacturing Alerts</h3>
                                        </div>
                                        <div className="max-h-64 overflow-y-auto">
                                            {notifications.map((notification) => {
                                                const Icon = notification.icon
                                                return (
                                                    <div key={notification.id} className="p-4 border-b border-gray-100 hover:bg-gray-50">
                                                        <div className="flex items-start space-x-3">
                                                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${notification.severity === 'high' ? 'bg-red-100' :
                                                                    notification.severity === 'medium' ? 'bg-yellow-100' : 'bg-green-100'
                                                                }`}>
                                                                <Icon className={`w-4 h-4 ${notification.severity === 'high' ? 'text-red-600' :
                                                                        notification.severity === 'medium' ? 'text-yellow-600' : 'text-green-600'
                                                                    }`} />
                                                            </div>
                                                            <div className="flex-1">
                                                                <p className="font-medium text-gray-900">{notification.title}</p>
                                                                <p className="text-sm text-gray-600">{notification.message}</p>
                                                                <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                        <div className="p-4 text-center">
                                            <button className="text-sm text-orange-600 hover:text-orange-700 font-medium">
                                                View All Alerts
                                            </button>
                                        </div>
                                    </motion.div>
                                )}
                            </div>

                            {/* User menu */}
                            <div className="flex items-center space-x-2">
                                <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                                    <User className="w-4 h-4 text-white" />
                                </div>
                                <div className="hidden sm:block">
                                    <div className="text-sm font-medium text-gray-900">Production Manager</div>
                                    <div className="text-xs text-gray-600">Shift Lead</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main content area */}
                <main className="flex-1">
                    {children}
                </main>
            </div>
        </div>
    )
}
